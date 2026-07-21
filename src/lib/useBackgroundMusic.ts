import { useCallback, useEffect, useRef, useState } from "react";
import { GenerativeMusicEngine } from "./generativeMusic";

const VOLUME = 0.45;
const FADE_SEC = 1.2;
const MUTE_KEY = "foxbound-music-muted";

/**
 * Drives the title-screen ambient music. `active` should be true only while
 * the menu is on screen — the engine fades out and stops everywhere else.
 */
export function useBackgroundMusic(active: boolean) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem(MUTE_KEY) === "true",
  );
  const ctxRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<GenerativeMusicEngine | null>(null);
  const unlockedRef = useRef(false);

  const ensureEngine = useCallback(() => {
    if (engineRef.current && ctxRef.current) return engineRef.current;
    const ctx = new AudioContext();
    const engine = new GenerativeMusicEngine(ctx, ctx.destination);
    ctxRef.current = ctx;
    engineRef.current = engine;
    return engine;
  }, []);

  const syncEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !unlockedRef.current) return;
    if (active) {
      ctxRef.current?.resume().catch(() => {});
      engine.start();
      engine.setVolume(muted ? 0 : VOLUME, FADE_SEC);
    } else {
      engine.setVolume(0, FADE_SEC);
      window.setTimeout(() => {
        if (!active) engine.stop();
      }, FADE_SEC * 1000 + 100);
    }
  }, [active, muted]);

  /** Call from a user-gesture handler (e.g. a click) to unlock audio. */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    ensureEngine();
    ctxRef.current?.resume().catch(() => {});
    syncEngine();
  }, [ensureEngine, syncEngine]);

  useEffect(() => {
    syncEngine();
  }, [syncEngine]);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const ctx = ctxRef.current;
      if (!ctx || !unlockedRef.current) return;
      if (document.hidden) {
        ctx.suspend().catch(() => {});
      } else if (!muted && active) {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [muted, active]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  return { muted, toggleMuted, unlock };
}
