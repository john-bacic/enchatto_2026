import type { Level } from "../types";
import { kaitenRush } from "./kaiten-rush";
import { matsuriCarousel } from "./matsuri-carousel";
import { mochiMountain } from "./mochi-mountain";
import { ninjaRooftops } from "./ninja-rooftops";
import { onsenHop } from "./onsen-hop";
import { origamiSky } from "./origami-sky";
import { ramenSlide } from "./ramen-slide";
import { shinkansenDash } from "./shinkansen-dash";
import { taikoBounce } from "./taiko-bounce";
import { windyPinwheels } from "./windy-pinwheels";

/**
 * The ten courses. The server names a round's level by its place here, so the order is kept and new courses go
 * on the end. A tournament runs five of them (convex/dash.ts picks which)
 */
export const LEVEL_BUILDERS: (() => Level)[] = [
  kaitenRush, taikoBounce, windyPinwheels, mochiMountain, origamiSky,
  shinkansenDash, ninjaRooftops, matsuriCarousel, ramenSlide, onsenHop,
];
export const LEVEL_COUNT = LEVEL_BUILDERS.length;

const built: (Level | undefined)[] = [];
export function getLevel(index: number): Level {
  const i = ((index % LEVEL_COUNT) + LEVEL_COUNT) % LEVEL_COUNT;
  return (built[i] ??= LEVEL_BUILDERS[i]());
}

export { LEVEL_NAMES } from "../level-names";
