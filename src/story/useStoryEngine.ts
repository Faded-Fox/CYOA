import { useCallback, useEffect, useState } from "react";
import type { Flags, Story } from "./types";

const SAVE_KEY = "cyoa-save-v1";

interface SaveData {
  sceneId: string;
  flags: Flags;
  history: string[];
}

function loadSave(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return loadSave() !== null;
}

export function useStoryEngine(story: Story, startSceneId: string) {
  const [sceneId, setSceneId] = useState(startSceneId);
  const [flags, setFlags] = useState<Flags>({});
  const [history, setHistory] = useState<string[]>([startSceneId]);

  useEffect(() => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ sceneId, flags, history } satisfies SaveData),
    );
  }, [sceneId, flags, history]);

  const resume = useCallback(() => {
    const save = loadSave();
    if (!save) return;
    setSceneId(save.sceneId);
    setFlags(save.flags);
    setHistory(save.history);
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setSceneId(startSceneId);
    setFlags({});
    setHistory([startSceneId]);
  }, [startSceneId]);

  const choose = useCallback((nextId: string, setFlagsOnChoice?: Flags) => {
    setFlags((prev) =>
      setFlagsOnChoice ? { ...prev, ...setFlagsOnChoice } : prev,
    );
    setSceneId(nextId);
    setHistory((prev) => [...prev, nextId]);
  }, []);

  const scene = story[sceneId];

  return { scene, flags, history, choose, resume, restart };
}
