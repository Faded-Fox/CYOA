import { useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { StoryScreen } from "./components/StoryScreen";
import { sunkenLighthouse, START_SCENE_ID } from "./story/sunkenLighthouse";
import { hasSave, useStoryEngine } from "./story/useStoryEngine";
import "./App.css";

const TITLE = "The Sunken Lighthouse";

function App() {
  const [screen, setScreen] = useState<"menu" | "playing">("menu");
  const { scene, flags, choose, resume, restart } = useStoryEngine(
    sunkenLighthouse,
    START_SCENE_ID,
  );

  if (screen === "menu") {
    return (
      <div id="root-container">
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
      </div>
    );
  }

  return (
    <div id="root-container">
      <StoryScreen
        scene={scene}
        flags={flags}
        onChoose={choose}
        onRestart={() => {
          restart();
          setScreen("menu");
        }}
      />
    </div>
  );
}

export default App;
