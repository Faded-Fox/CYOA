import type { Story } from "./types";

/**
 * A short sample story demonstrating the engine: branching choices,
 * flags that persist across scenes, requirement-gated choices, and
 * multiple endings. Replace this with your own story, or add more
 * files like it and swap which one App.tsx loads.
 */
export const START_SCENE_ID = "start";

export const sunkenLighthouse: Story = {
  start: {
    id: "start",
    title: "The Sunken Lighthouse",
    text: "Your ship broke apart on the rocks in last night's storm. You wake on a cold, grey beach, alone, with a lighthouse looming on the headland above you.",
    choices: [
      { text: "Search the beach before moving on", nextId: "beach" },
      { text: "Head straight for the lighthouse", nextId: "lighthouse_door" },
    ],
  },

  beach: {
    id: "beach",
    text: "Driftwood and wreckage litter the sand. Half-buried near a tide pool, something metal catches the light — an old, rusted key.",
    choices: [
      {
        text: "Take the key",
        nextId: "lighthouse_door",
        setFlags: { hasKey: true },
      },
      { text: "Leave it and move on", nextId: "lighthouse_door" },
    ],
  },

  lighthouse_door: {
    id: "lighthouse_door",
    text: "The lighthouse door is bolted shut with a heavy, corroded padlock.",
    choices: [
      {
        text: "Unlock it with the key you found",
        nextId: "keeper_room",
        requires: (flags) => !!flags.hasKey,
      },
      { text: "Force the door open", nextId: "injured_ending" },
      { text: "Circle around to a back window", nextId: "back_window" },
    ],
  },

  back_window: {
    id: "back_window",
    text: "A window at the rear hangs loose on one hinge. It's a tight squeeze, but you climb through into the dark.",
    choices: [{ text: "Head further inside", nextId: "keeper_room" }],
  },

  keeper_room: {
    id: "keeper_room",
    text: "The keeper's quarters are untouched for years. Dust covers a small desk, on which sits an open journal. A spiral staircase leads up into darkness.",
    choices: [
      {
        text: "Read the journal",
        nextId: "spiral_stairs",
        setFlags: { readJournal: true },
      },
      { text: "Ignore it and climb the stairs", nextId: "spiral_stairs" },
    ],
  },

  spiral_stairs: {
    id: "spiral_stairs",
    text: "You climb, the iron steps groaning under your feet, wind howling louder with every turn, until you reach the lamp room at the top.",
    choices: [{ text: "Step inside", nextId: "lamp_room" }],
  },

  lamp_room: {
    id: "lamp_room",
    text: "The great lamp stands dark and cold. As lightning flashes through the glass, you see you're not alone — a translucent figure in an old oilskin coat stands watching you, silent.",
    choices: [
      {
        text: "Speak the keeper's name, read from the journal",
        nextId: "good_ending",
        requires: (flags) => !!flags.readJournal,
      },
      { text: "Try to relight the lamp yourself", nextId: "struggle_ending" },
      { text: "Turn and run back down the stairs", nextId: "flee_ending" },
    ],
  },

  injured_ending: {
    id: "injured_ending",
    title: "The End",
    text: "The door doesn't budge, and your shoulder gives out with a sickening crack. You collapse on the rocks as the tide begins to rise, with no one left to hear you call.",
    ending: "lose",
  },

  flee_ending: {
    id: "flee_ending",
    title: "The End",
    text: "You bolt down the stairs and out into the storm, running until the ground gives way beneath you. The sea takes you before dawn.",
    ending: "lose",
  },

  struggle_ending: {
    id: "struggle_ending",
    title: "The End",
    text: "You wrestle with the old mechanism for what feels like hours, and against all odds the lamp sputters to life. Exhausted, you collapse as its beam sweeps the water — a passing boat spots you by morning. The figure is gone, but you never quite feel alone in that lamp room again.",
    ending: "neutral",
  },

  good_ending: {
    id: "good_ending",
    title: "The End",
    text: "You speak the name written in the journal. The figure's shoulders ease, and for the first time in a long while, he smiles. Together you relight the lamp, and as its beam cuts through the storm, he fades into it. You're found at dawn — the lighthouse, lit and steady, guiding the boat in.",
    ending: "win",
  },
};
