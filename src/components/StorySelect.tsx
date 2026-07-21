import type { StoryDef } from "../story/stories";
import { hasSave } from "../story/useStoryEngine";

interface Props {
  title: string;
  stories: StoryDef[];
  onNewGame: (storyId: string) => void;
  onContinue: (storyId: string) => void;
}

export function StorySelect({ title, stories, onNewGame, onContinue }: Props) {
  return (
    <div className="story-select">
      <h1>{title}</h1>
      <div className="story-list">
        {stories.map((storyDef) => (
          <div className="story-card" key={storyDef.id}>
            {storyDef.heroImage && (
              <img src={storyDef.heroImage} alt="" className="hero-image" />
            )}
            <h2>{storyDef.title}</h2>
            <p className="story-blurb">{storyDef.blurb}</p>
            <div className="choices">
              {hasSave(storyDef.id) && (
                <button type="button" onClick={() => onContinue(storyDef.id)}>
                  Continue
                </button>
              )}
              <button type="button" onClick={() => onNewGame(storyDef.id)}>
                New game
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
