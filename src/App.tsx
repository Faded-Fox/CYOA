import { useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { MusicToggle } from "./components/MusicToggle";
import { StoryScreen } from "./components/StoryScreen";
import { useBackgroundMusic } from "./lib/useBackgroundMusic";
import { twoCastles, START_SCENE_ID } from "./story/twoCastles";
import { hasSave, useStoryEngine } from "./story/useStoryEngine";
import "./App.css";

const TITLE = "Foxbound";

function App() {
  const [screen, setScreen] = useState<"menu" | "playing">("menu");
  const { scene, flags, choose, resume, restart } = useStoryEngine(
    twoCastles,
    START_SCENE_ID,
  );
  const music = useBackgroundMusic(screen === "menu");

  return (
    <div id="root-container">
      {screen === "menu" ? (
        <>
          <MusicToggle muted={music.muted} onToggle={music.toggleMuted} />
          <MainMenu
            title={TITLE}
            canContinue={hasSave()}
            onNewGame={() => {
              restart();
              setScreen("playing");
            }}
            onContinue={() => {
              resume();
              setScreen("playing");
            }}
          />
        </>
      ) : (
        <StoryScreen
          scene={scene}
          flags={flags}
          onChoose={choose}
          onRestart={() => {
            music.unlock();
            restart();
            setScreen("menu");
          }}
        />
      )}
    </div>
  );
}

export default App;
