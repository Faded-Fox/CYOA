import type { Story } from "./types";

/**
 * A hero fox chooses between the Light Castle and the Night Castle to find
 * their destiny. Bigger than the sample story: two full paths, each with
 * two trials that set flags independently, so every combination of choices
 * leads to a different one of twelve endings — including a secret "Twilight
 * Heir" ending on each path, unlocked only by asking the crow first and
 * then proving both virtues on your chosen path.
 */
export const START_SCENE_ID = "start";

export const twoCastles: Story = {
  start: {
    id: "start",
    title: "The Fox and the Two Castles",
    text: "Two roads climb from the crossroads where you stand, tail flicking against the cold. To the east, the Light Castle glows atop its hill like a captured sunrise. To the west, the Night Castle waits beneath a canopy of stars, dark and patient. An old crow watches you from a bent signpost, waiting to see which way you'll go.",
    choices: [
      { text: "Ask the crow what it knows", nextId: "crow_advice" },
      { text: "Take the road to the Light Castle", nextId: "light_gate" },
      { text: "Take the road to the Night Castle", nextId: "night_gate" },
    ],
  },

  crow_advice: {
    id: "crow_advice",
    text: '"Destiny doesn\'t care which road you take, little fox," the crow says, "only what you\'re willing to give up along the way." It ruffles its feathers and says nothing more.',
    choices: [
      {
        text: "Head to the Light Castle",
        nextId: "light_gate",
        setFlags: { heardCrow: true },
      },
      {
        text: "Head to the Night Castle",
        nextId: "night_gate",
        setFlags: { heardCrow: true },
      },
    ],
  },

  // --- Light path ---

  light_gate: {
    id: "light_gate",
    text: "The Light Castle's gate is barred by a great golden hound of living sunlight, its eyes like twin embers. \"None pass without proving themselves,\" it rumbles.",
    choices: [
      { text: "Answer its riddle", nextId: "light_hall" },
      { text: "Try to slip past while it isn't looking", nextId: "light_sneak" },
    ],
  },

  light_sneak: {
    id: "light_sneak",
    text: "You creep along the wall's shadowed edge — but sunlight casts no shadows for long. The hound rounds the corner and catches you mid-step, ember eyes narrowing.",
    choices: [
      { text: "Apologize and ask to be judged honestly", nextId: "light_hall" },
      { text: "Bolt for the trees", nextId: "ending_light_caught" },
    ],
  },

  light_hall: {
    id: "light_hall",
    text: 'Warm light spills through the hall as you\'re brought before the Sun Warden, a tall figure wreathed in dawn-colored robes. "Two trials stand between you and your destiny," she says. "Let\'s see what you\'re made of."',
    choices: [{ text: "Continue", nextId: "light_trial_kindness" }],
  },

  light_trial_kindness: {
    id: "light_trial_kindness",
    text: "On the stairway up, you find a moth-sprite tangled in old spider silk, one wing bent, struggling weakly.",
    choices: [
      {
        text: "Stop and free it, however long it takes",
        nextId: "light_trial_courage",
        setFlags: { kindHeart: true },
      },
      {
        text: "There's no time to lose — keep climbing",
        nextId: "light_trial_courage",
      },
    ],
  },

  light_trial_courage: {
    id: "light_trial_courage",
    text: "The stairway ends at a bridge of solid light, and halfway across, a section flickers and gives way beneath your paws.",
    choices: [
      {
        text: "Leap the gap without hesitating",
        nextId: "light_summit",
        setFlags: { brave: true },
      },
      {
        text: "Ease back and find a narrower, steadier ledge around",
        nextId: "light_summit",
      },
    ],
  },

  light_summit: {
    id: "light_summit",
    text: 'At the top of the tower, the Sun Warden turns to face you, the whole horizon burning gold behind her. "Show me who you\'ve become," she says.',
    choices: [
      {
        text: "Continue",
        nextId: "ending_twilight_light",
        requires: (flags) => !!flags.heardCrow && !!flags.kindHeart && !!flags.brave,
      },
      {
        text: "Continue",
        nextId: "ending_light_true",
        requires: (flags) => !flags.heardCrow && !!flags.kindHeart && !!flags.brave,
      },
      {
        text: "Continue",
        nextId: "ending_light_healer",
        requires: (flags) => !!flags.kindHeart && !flags.brave,
      },
      {
        text: "Continue",
        nextId: "ending_light_champion",
        requires: (flags) => !flags.kindHeart && !!flags.brave,
      },
      {
        text: "Continue",
        nextId: "ending_light_pretender",
        requires: (flags) => !flags.kindHeart && !flags.brave,
      },
    ],
  },

  // --- Night path ---

  night_gate: {
    id: "night_gate",
    text: 'The Night Castle\'s gate is watched by a pair of shadow-wolves, smoke pouring off their fur like cold breath. "Prove your courage, or turn back," one growls.',
    choices: [
      { text: "Accept the wolves' challenge fairly", nextId: "night_courtyard" },
      {
        text: "Try to slip past while they're distracted",
        nextId: "night_duel",
      },
    ],
  },

  night_duel: {
    id: "night_duel",
    text: "You edge along the tree line, but shadow-wolves smell hesitation before they see it. One rounds on you, hackles raised, teeth bared.",
    choices: [
      {
        text: "Stand your ground and admit you tried to cheat",
        nextId: "night_courtyard",
      },
      { text: "Fight your way through", nextId: "ending_night_dishonored" },
    ],
  },

  night_courtyard: {
    id: "night_courtyard",
    text: 'Inside, starlight pools across black stone as the Moon Warden steps from behind a pillar, cloak like poured ink. "Two trials, little fox. Let\'s see what the dark reveals in you."',
    choices: [{ text: "Continue", nextId: "night_trial_sacrifice" }],
  },

  night_trial_sacrifice: {
    id: "night_trial_sacrifice",
    text: "Deeper in, you find a star-wolf pup, small and shivering, its silver fur dulled with cold, too weak to stand.",
    choices: [
      {
        text: "Give it your cloak, even though the cold will bite at you now",
        nextId: "night_trial_cunning",
        setFlags: { selfless: true },
      },
      {
        text: "The castle is close — better to keep moving",
        nextId: "night_trial_cunning",
      },
    ],
  },

  night_trial_cunning: {
    id: "night_trial_cunning",
    text: "The path splits into a maze of black mirrors, each showing a different version of the way forward, only one of them true.",
    choices: [
      { text: "Trust your instincts and choose quickly", nextId: "night_spire" },
      {
        text: "Mark your trail and reason it out, however long it takes",
        nextId: "night_spire",
        setFlags: { wise: true },
      },
    ],
  },

  night_spire: {
    id: "night_spire",
    text: 'At the spire\'s peak, the Moon Warden waits beneath a sky thick with stars. "Tell me, fox — what did the dark cost you, and what did it teach you?"',
    choices: [
      {
        text: "Continue",
        nextId: "ending_twilight_night",
        requires: (flags) => !!flags.heardCrow && !!flags.selfless && !!flags.wise,
      },
      {
        text: "Continue",
        nextId: "ending_night_true",
        requires: (flags) => !flags.heardCrow && !!flags.selfless && !!flags.wise,
      },
      {
        text: "Continue",
        nextId: "ending_night_guardian",
        requires: (flags) => !!flags.selfless && !flags.wise,
      },
      {
        text: "Continue",
        nextId: "ending_night_shadow",
        requires: (flags) => !flags.selfless && !!flags.wise,
      },
      {
        text: "Continue",
        nextId: "ending_night_lost",
        requires: (flags) => !flags.selfless && !flags.wise,
      },
    ],
  },

  // --- Endings ---

  ending_light_caught: {
    id: "ending_light_caught",
    title: "The End",
    text: "You run, but sunlight is faster than any fox. The hound catches your tail in its jaws — not to hurt you, but to hold you fast until the Warden arrives to send you back down the mountain, trial unproven, destiny unmet. You watch the Light Castle's gates close from the bottom of the hill.",
    ending: "lose",
  },

  ending_night_dishonored: {
    id: "ending_night_dishonored",
    title: "The End",
    text: 'You strike first, and win — but a shadow-wolf\'s pack remembers a cheater long after it forgets a fair loss. Word runs ahead of you through the dark halls, and by the time you reach the courtyard, the Moon Warden has already turned away. "Not like this," she says, and the doors seal behind her.',
    ending: "lose",
  },

  ending_light_pretender: {
    id: "ending_light_pretender",
    title: "The End",
    text: 'You climbed the tower quickly and cleverly, without ever once slowing down for anyone or anything in your way. At the summit, the Sun Warden studies you for a long moment. "You\'ll go far, little fox," she says, not unkindly. "But not with us." The gates of dawn do not open for you today.',
    ending: "lose",
  },

  ending_light_healer: {
    id: "ending_light_healer",
    title: "The End",
    text: 'You stopped for the small, hurting things, even when it cost you time. When the bridge gave way, you found the safer path rather than risk everything. The Sun Warden smiles. "A healer\'s heart, not a champion\'s daring. There is a place for you here still — tending what the world breaks." You become the castle\'s quiet keeper of small mercies, and it suits you.',
    ending: "neutral",
  },

  ending_light_champion: {
    id: "ending_light_champion",
    title: "The End",
    text: 'You leapt without hesitating when the bridge gave way beneath you, brave to your bones — but you never looked back for the small, hurting thing on the stairs. The Sun Warden nods slowly. "Bravery without kindness burns bright and burns out." You\'re named the castle\'s champion, celebrated, and a little bit alone.',
    ending: "neutral",
  },

  ending_light_true: {
    id: "ending_light_true",
    title: "The End",
    text: 'You stopped for the moth-sprite. You leapt when the bridge gave way. The Sun Warden studies you and finally, truly smiles. "Kindness and courage, together — that is a dawn worth following." You are named Dawnbringer, and the Light Castle\'s gates stand open to you, always, from this day on.',
    ending: "win",
  },

  ending_twilight_light: {
    id: "ending_twilight_light",
    title: "The End",
    text: "The crow's words return to you at the top of the tower: destiny doesn't care which road you take, only what you give up along the way. You gave up nothing of yourself to be kind and brave both. The Sun Warden's eyes widen — she has not seen this in a hundred years. \"You were never meant to choose a castle at all,\" she says, and the horizon splits gold and starlight together as the Night Castle's spire answers, far across the valley, in silent recognition. You become the Twilight Heir, walking free between both worlds.",
    ending: "win",
  },

  ending_night_lost: {
    id: "ending_night_lost",
    title: "The End",
    text: 'You kept moving when the star-wolf pup needed you, and guessed your way through the mirror-maze rather than reason it out. At the spire, the Moon Warden looks through you like fog. "The dark keeps nothing that gives nothing back," she says, and you find yourself, somehow, standing back at the crossroads, the castle no longer visible at all.',
    ending: "lose",
  },

  ending_night_shadow: {
    id: "ending_night_shadow",
    title: "The End",
    text: 'You reasoned your way through the maze with patience and care, but you left the star-wolf pup shivering behind you. The Moon Warden regards you with something like respect, and something like pity. "Clever enough to survive the dark. Not yet warm enough to belong to it." You\'re given a place among the castle\'s watchers — useful, respected, and cold.',
    ending: "neutral",
  },

  ending_night_guardian: {
    id: "ending_night_guardian",
    title: "The End",
    text: 'You gave up your cloak for the star-wolf pup without a second thought, but guessed your way through the mirror-maze on instinct alone, more than once nearly lost. "A generous heart, wandering an unreasoned path," the Moon Warden says. You become a guardian of the castle\'s smallest and weakest — needed, and a little unmoored.',
    ending: "neutral",
  },

  ending_night_true: {
    id: "ending_night_true",
    title: "The End",
    text: 'You gave up your cloak for the pup. You reasoned the mirror-maze through with patience, not luck. The Moon Warden lowers her hood for the first time. "Sacrifice and wisdom, together — that is a dark worth trusting." You are named Nightweaver, and the stars themselves seem to lean closer, listening, from this day on.',
    ending: "win",
  },

  ending_twilight_night: {
    id: "ending_twilight_night",
    title: "The End",
    text: "The crow's words return to you at the spire's peak: destiny doesn't care which road you take, only what you give up along the way. You gave up your cloak and lost nothing of yourself in the dark. The Moon Warden goes utterly still. \"You were never meant to choose a castle at all,\" she says, and far across the valley, the Light Castle's tower answers in silent gold. You become the Twilight Heir, walking free between both worlds.",
    ending: "win",
  },
};
