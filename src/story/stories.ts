import type { Story } from "./types";
import { twoCastles, START_SCENE_ID as TWO_CASTLES_START } from "./twoCastles";
import {
  sunkenLighthouse,
  START_SCENE_ID as LIGHTHOUSE_START,
} from "./sunkenLighthouse";
import foxHero from "../assets/fox-crossroads.png";

export interface StoryDef {
  id: string;
  title: string;
  blurb: string;
  heroImage?: string;
  story: Story;
  startSceneId: string;
}

export const STORIES: StoryDef[] = [
  {
    id: "two-castles",
    title: "The Fox and the Two Castles",
    blurb:
      "A wandering fox must choose between two rival castles at a moonlit crossroads.",
    heroImage: foxHero,
    story: twoCastles,
    startSceneId: TWO_CASTLES_START,
  },
  {
    id: "sunken-lighthouse",
    title: "The Sunken Lighthouse",
    blurb:
      "Shipwrecked and alone, you climb toward a light that shouldn't still be burning.",
    story: sunkenLighthouse,
    startSceneId: LIGHTHOUSE_START,
  },
];
