# Foxbound

A choose-your-own-adventure game built with React, Vite, and TypeScript.
A hero fox chooses between the Light Castle and the Night Castle to find
their destiny — two branching paths, two trials each, and twelve possible
endings (including a secret one on each path). Progress autosaves to the
browser's `localStorage`, so closing the tab and coming back later resumes
right where you left off (there's a "Continue" option on the main menu
whenever a save exists).

## Development

```bash
npm install
npm run dev     # start the dev server
npm run build   # type-check and build for production
npm run lint    # oxlint
npm run preview # preview the production build locally
```

Pushes to `main` auto-deploy to GitHub Pages via
`.github/workflows/deploy.yml`.

## How the story engine works

- `src/story/types.ts` — the shape of a story: a `Scene` has text and a list
  of `Choice`s, each pointing at the next scene's id. A choice can optionally
  set boolean `flags` (e.g. `kindHeart: true`) and/or `require` a flag to be
  set before it's offered to the player. A scene with no choices and an
  `ending` is a terminal scene.
- `src/story/twoCastles.ts` — the story itself: a `Record<string, Scene>`
  keyed by scene id, with a `START_SCENE_ID` export marking where play
  begins. This is the file to edit (or replace) to change the story — no
  other file needs to know what's in it.
- `src/story/sunkenLighthouse.ts` — a smaller sample story kept as a
  reference for the engine's shape; not currently used by the app.
- `src/story/useStoryEngine.ts` — the state machine: tracks the current
  scene, the flags set so far, and the visited-scene history, and persists
  all three to `localStorage` on every change.
- `src/components/MainMenu.tsx` and `src/components/StoryScreen.tsx` — the
  two screens. `StoryScreen` filters out any choice whose `requires` check
  fails against the current flags, so gated choices simply don't appear
  until their condition is met.

To write a new story: add a file next to `twoCastles.ts` following the same
shape, then swap the import in `src/App.tsx`.
