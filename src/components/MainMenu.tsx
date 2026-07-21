import heroImage from "../assets/fox-crossroads.png";

interface Props {
  title: string;
  canContinue: boolean;
  onNewGame: () => void;
  onContinue: () => void;
}

export function MainMenu({ title, canContinue, onNewGame, onContinue }: Props) {
  return (
    <div className="main-menu">
      <img src={heroImage} alt="" className="hero-image" />
      <h1>{title}</h1>
      <div className="choices">
        {canContinue && (
          <button type="button" onClick={onContinue}>
            Continue
          </button>
        )}
        <button type="button" onClick={onNewGame}>
          New game
        </button>
      </div>
    </div>
  );
}
