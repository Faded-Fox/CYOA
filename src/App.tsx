import { useState } from "react";
import { MusicToggle } from "./components/MusicToggle";
import { StorySelect } from "./components/StorySelect";
import { StoryScreen } from "./components/StoryScreen";
import { useBackgroundMusic } from "./lib/useBackgroundMusic";
import { STORIES, type StoryDef } from "./story/stories";
import { useStoryEngine } from "./story/useStoryEngine";
import "./App.css";

const TITLE = "Foxbound";

interface PlayingState {
  storyId: string;
  resume: boolean;
}

interface StoryPlayerProps {
  storyDef: StoryDef;
  resume: boolean;
  onExit: () => void;
}

function StoryPlayer({ storyDef, resume, onExit }: StoryPlayerProps) {
  const { scene, flags, choose, restart } = useStoryEngine(
    storyDef.story,
    storyDef.startSceneId,
    storyDef.id,
    resume,
  );

  return (
    <StoryScreen
      scene={scene}
      flags={flags}
      onChoose={choose}
      onRestart={() => {
        restart();
        onExit();
      }}
    />
  );
}

function App() {
  const [playing, setPlaying] = useState<PlayingState | null>(null);
  const music = useBackgroundMusic(playing === null);
  const activeStory = playing
    ? STORIES.find((s) => s.id === playing.storyId)
    : undefined;

  return (
    <div id="root-container">
      {playing && activeStory ? (
        <StoryPlayer
          storyDef={activeStory}
          resume={playing.resume}
          onExit={() => {
            music.unlock();
            setPlaying(null);
          }}
        />
      ) : (
        <>
          <MusicToggle muted={music.muted} onToggle={music.toggleMuted} />
          <StorySelect
            title={TITLE}
            stories={STORIES}
            onNewGame={(storyId) => setPlaying({ storyId, resume: false })}
            onContinue={(storyId) => setPlaying({ storyId, resume: true })}
          />
        </>
      )}
    </div>
  );
}

export default App;
