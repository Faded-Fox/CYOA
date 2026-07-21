import { useCallback, useEffect, useRef, useState } from "react";
import menuTrack from "../assets/audio/menu.mp3";
import lightTrack from "../assets/audio/light.mp3";
import nightTrack from "../assets/audio/night.mp3";

export type MusicTrack = "menu" | "light" | "night";

const TRACK_SRC: Record<MusicTrack, string> = {
  menu: menuTrack,
  light: lightTrack,
  night: nightTrack,
};

/** Which ambient track should be playing for the current screen/scene. */
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
const FADE_MS = 700;
const MUTE_KEY = "foxbound-music-muted";

export function useBackgroundMusic(track: MusicTrack) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem(MUTE_KEY) === "true",
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const startedRef = useRef(false);
  const fadeIntervalRef = useRef<number | undefined>(undefined);

  if (!audioRef.current) {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
  }

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearInterval(fadeIntervalRef.current);
    const steps = 16;
    const from = audio.volume;
    let i = 0;
    fadeIntervalRef.current = window.setInterval(() => {
      i += 1;
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps)));
      if (i >= steps) {
        window.clearInterval(fadeIntervalRef.current);
        onDone?.();
      }
    }, FADE_MS / steps);
  }, []);

  const playTrack = useCallback(
    (next: MusicTrack, targetVolume: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      currentTrackRef.current = next;
      const swap = () => {
        audio.src = TRACK_SRC[next];
        audio.currentTime = 0;
        audio.play().catch(() => {});
        fadeTo(targetVolume);
      };
      if (audio.volume > 0) {
        fadeTo(0, swap);
      } else {
        swap();
      }
    },
    [fadeTo],
  );

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    playTrack(track, muted ? 0 : VOLUME);
  }, [playTrack, track, muted]);

  useEffect(() => {
    if (!startedRef.current) return;
    if (currentTrackRef.current === track) return;
    playTrack(track, muted ? 0 : VOLUME);
  }, [track, muted, playTrack]);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
    if (!startedRef.current) return;
    fadeTo(muted ? 0 : VOLUME);
  }, [muted, fadeTo]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      window.clearInterval(fadeIntervalRef.current);
      audio?.pause();
    };
  }, []);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  return { muted, toggleMuted, start };
}
