import { useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { MusicToggle } from "./components/MusicToggle";
import { StoryScreen } from "./components/StoryScreen";
import { trackForScene, useBackgroundMusic } from "./lib/useBackgroundMusic";
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
  const music = useBackgroundMusic(trackForScene(screen, scene.id));

  return (
    <div id="root-container">
      <MusicToggle
        muted={music.muted}
        onToggle={() => {
          music.start();
          music.toggleMuted();
        }}
      />
      {screen === "menu" ? (
        <MainMenu
          title={TITLE}
          canContinue={hasSave()}
          onNewGame={() => {
            music.start();
            restart();
            setScreen("playing");
          }}
          onContinue={() => {
            music.start();
            resume();
            setScreen("playing");
          }}
        />
      ) : (
        <StoryScreen
          scene={scene}
          flags={flags}
          onChoose={choose}
          onRestart={() => {
            restart();
            setScreen("menu");
          }}
        />
      )}
    </div>
  );
}

export default App;
