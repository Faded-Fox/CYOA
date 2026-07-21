interface Props {
  muted: boolean;
  onToggle: () => void;
}

export function MusicToggle({ muted, onToggle }: Props) {
  return (
    <button
      type="button"
      className="music-toggle"
      onClick={onToggle}
      aria-label={muted ? "Unmute music" : "Mute music"}
      title={muted ? "Unmute music" : "Mute music"}
    >
      {muted ? "\u{1F507}" : "\u{1F50A}"}
    </button>
  );
}
