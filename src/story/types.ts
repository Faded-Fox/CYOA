export type Flags = Record<string, boolean>;

export interface Choice {
  text: string;
  nextId: string;
  /** Only show this choice if the current flags satisfy this check. */
  requires?: (flags: Flags) => boolean;
  /** Flags to set when this choice is taken. */
  setFlags?: Flags;
}

export type Ending = "win" | "lose" | "neutral";

export interface Scene {
  id: string;
  title?: string;
  text: string;
  choices?: Choice[];
  /** Present only on terminal scenes. */
  ending?: Ending;
}

export type Story = Record<string, Scene>;
