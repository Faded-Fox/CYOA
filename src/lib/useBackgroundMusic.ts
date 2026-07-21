import { useCallback, useEffect, useRef, useState } from "react";
import { GenerativeMusicEngine, type Mood } from "./generativeMusic";

export type MusicTrack = Mood;

/** Which ambient mood should be playing for the current screen/scene. */
export function trackForScene(
  screen: "menu" | "playing",
  sceneId: string,
): MusicTrack {
  if (screen === "menu") return "menu";
  if (sceneId.includes("night")) return "night";
  if (sceneId.includes("light")) return "light";
  return "menu";
}

const VOLUME = 0.45;
const FADE_SEC = 1.2;
const MUTE_KEY = "foxbound-music-muted";

export function useBackgroundMusic(track: MusicTrack) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem(MUTE_KEY) === "true",
  );
  const ctxRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<GenerativeMusicEngine | null>(null);
  const startedRef = useRef(false);

  const ensureEngine = useCallback(() => {
    if (engineRef.current && ctxRef.current) return engineRef.current;
    const ctx = new AudioContext();
    const engine = new GenerativeMusicEngine(ctx, ctx.destination);
    ctxRef.current = ctx;
    engineRef.current = engine;
    return engine;
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const engine = ensureEngine();
    ctxRef.current?.resume().catch(() => {});
    engine.setMood(track);
    engine.start();
    engine.setVolume(muted ? 0 : VOLUME, FADE_SEC);
  }, [ensureEngine, track, muted]);

  useEffect(() => {
    if (!startedRef.current) return;
    engineRef.current?.setMood(track);
  }, [track]);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
    if (!startedRef.current) return;
    engineRef.current?.setVolume(muted ? 0 : VOLUME, FADE_SEC);
  }, [muted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const ctx = ctxRef.current;
      if (!ctx || !startedRef.current) return;
      if (document.hidden) {
        ctx.suspend().catch(() => {});
      } else if (!muted) {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [muted]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  return { muted, toggleMuted, start };
}
