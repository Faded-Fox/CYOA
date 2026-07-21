import type { Flags, Scene } from "../story/types";

interface Props {
  scene: Scene;
  flags: Flags;
  onChoose: (nextId: string, setFlags?: Flags) => void;
  onRestart: () => void;
}

const ENDING_LABEL: Record<NonNullable<Scene["ending"]>, string> = {
  win: "A good ending",
  lose: "A grim ending",
  neutral: "An uncertain ending",
};

export function StoryScreen({ scene, flags, onChoose, onRestart }: Props) {
  const choices = scene.choices?.filter(
    (choice) => !choice.requires || choice.requires(flags),
  );

  return (
    <div className="story-screen">
      {scene.title && <h1>{scene.title}</h1>}
      <p className="story-text">{scene.text}</p>

      {scene.ending ? (
        <div className="ending">
          <p className="ending-label">{ENDING_LABEL[scene.ending]}</p>
          <button type="button" onClick={onRestart}>
            Play again
          </button>
        </div>
      ) : (
        <div className="choices">
          {choices?.map((choice) => (
            <button
              key={choice.text}
              type="button"
              onClick={() => onChoose(choice.nextId, choice.setFlags)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
