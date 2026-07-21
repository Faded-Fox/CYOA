import { useCallback, useEffect, useState } from "react";
import type { Flags, Story } from "./types";

const SAVE_KEY_PREFIX = "cyoa-save-v1:";

interface SaveData {
  sceneId: string;
  flags: Flags;
  history: string[];
}

function loadSave(storyId: string): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY_PREFIX + storyId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function hasSave(storyId: string): boolean {
  return loadSave(storyId) !== null;
}

/**
 * @param startResumed Seed state from this story's save on mount instead of
 * starting fresh. Callers should remount (e.g. via a `key`) when switching
 * which story is active, since this only applies once, at mount time.
 */
export function useStoryEngine(
  story: Story,
  startSceneId: string,
  storyId: string,
  startResumed: boolean,
) {
  const initial = startResumed ? loadSave(storyId) : null;
  const [sceneId, setSceneId] = useState(initial?.sceneId ?? startSceneId);
  const [flags, setFlags] = useState<Flags>(initial?.flags ?? {});
  const [history, setHistory] = useState<string[]>(
    initial?.history ?? [startSceneId],
  );

  useEffect(() => {
    localStorage.setItem(
      SAVE_KEY_PREFIX + storyId,
      JSON.stringify({ sceneId, flags, history } satisfies SaveData),
    );
  }, [storyId, sceneId, flags, history]);

  const restart = useCallback(() => {
    localStorage.removeItem(SAVE_KEY_PREFIX + storyId);
  }, [storyId]);

  const choose = useCallback((nextId: string, setFlagsOnChoice?: Flags) => {
    setFlags((prev) =>
      setFlagsOnChoice ? { ...prev, ...setFlagsOnChoice } : prev,
    );
    setSceneId(nextId);
    setHistory((prev) => [...prev, nextId]);
  }, []);

  const scene = story[sceneId];

  return { scene, flags, history, choose, restart };
}
