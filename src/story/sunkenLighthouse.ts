import type { Story } from "./types";

/**
 * The same wandering fox from The Fox and the Two Castles, blown off
 * course and washed ashore below a lighthouse that shouldn't still be lit.
 * Demonstrates the engine: branching choices, flags that persist across
 * scenes, requirement-gated choices, and multiple endings.
 */
export const START_SCENE_ID = "start";

export const sunkenLighthouse: Story = {
  start: {
    id: "start",
    title: "The Sunken Lighthouse",
    text: "The storm took your boat on the rocks last night, and it's a wonder it didn't take you with it. You wake on a cold, grey beach, cloak soaked through and heavy, fur matted with salt, a lighthouse looming on the headland above you — its lamp somehow still burning, pale gold against the fog.",
    choices: [
      { text: "Search the beach before moving on", nextId: "beach" },
      { text: "Head straight for the lighthouse", nextId: "lighthouse_door" },
    ],
  },

  beach: {
    id: "beach",
    text: "Driftwood and wreckage litter the sand. Half-buried near a tide pool, something metal catches the light — an old, rusted key, your medallion's chain snagged right beside it as if the sea meant for you to find both.",
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
    text: "The lighthouse door is bolted shut with a heavy, corroded padlock, salt-crusted and stiff with age.",
    choices: [
      {
        text: "Unlock it with the key you found",
        nextId: "keeper_room",
        requires: (flags) => !!flags.hasKey,
      },
      { text: "Force the door open with your shoulder", nextId: "injured_ending" },
      { text: "Circle around to a back window", nextId: "back_window" },
    ],
  },

  back_window: {
    id: "back_window",
    text: "A window at the rear hangs loose on one hinge. It's a tight squeeze for a fox your size, but you fold your ears back and climb through into the dark.",
    choices: [{ text: "Head further inside", nextId: "keeper_room" }],
  },

  keeper_room: {
    id: "keeper_room",
    text: "The keeper's quarters are untouched for years. Dust covers a small desk, on which sits an open journal, its pages rippled with old damp. A spiral staircase leads up into darkness.",
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
    text: "You climb, claws clicking on iron steps that groan under your weight, wind howling louder with every turn, until you reach the lamp room at the top, breath fogging in the cold.",
    choices: [{ text: "Step inside", nextId: "lamp_room" }],
  },

  lamp_room: {
    id: "lamp_room",
    text: "The great lamp stands dark and cold — whatever light you saw from the beach isn't coming from here. As lightning flashes through the glass, you see you're not alone: a translucent figure in an old oilskin coat stands watching you, silent, tail-tip flicking like it recognizes something of itself in you.",
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
    text: "The door doesn't budge, and your shoulder gives out with a sickening crack. You collapse on the rocks as the tide begins to rise, cloak dragging you down, with no one left to hear you call.",
    ending: "lose",
  },

  flee_ending: {
    id: "flee_ending",
    title: "The End",
    text: "You bolt down the stairs on shaking legs and out into the storm, running until the ground gives way beneath your paws. The sea takes you before dawn.",
    ending: "lose",
  },

  struggle_ending: {
    id: "struggle_ending",
    title: "The End",
    text: "You wrestle with the old mechanism for what feels like hours, claws slipping on corroded brass, and against all odds the lamp sputters to life. Exhausted, you collapse as its beam sweeps the water — a passing boat spots you by morning. The figure is gone, but you never quite feel alone in that lamp room again.",
    ending: "neutral",
  },

  good_ending: {
    id: "good_ending",
    title: "The End",
    text: "You speak the name written in the journal. The figure's shoulders ease, and for the first time in a long while, he smiles down at you. Together you relight the lamp, and as its beam cuts through the storm, he fades into it. You're found at dawn, curled dry and warm at last on the lamp room floor — the lighthouse, lit and steady, guiding the boat in.",
    ending: "win",
  },
};
