import type { Level } from "../types";
import { kaitenRush } from "./kaiten-rush";
import { mochiMountain } from "./mochi-mountain";
import { origamiSky } from "./origami-sky";
import { taikoBounce } from "./taiko-bounce";
import { windyPinwheels } from "./windy-pinwheels";

/** The five courses, in the order a tournament runs them. The server names a round's level by its place here */
export const LEVEL_BUILDERS: (() => Level)[] = [kaitenRush, taikoBounce, windyPinwheels, mochiMountain, origamiSky];
export const LEVEL_COUNT = LEVEL_BUILDERS.length;

const built: (Level | undefined)[] = [];
export function getLevel(index: number): Level {
  const i = ((index % LEVEL_COUNT) + LEVEL_COUNT) % LEVEL_COUNT;
  return (built[i] ??= LEVEL_BUILDERS[i]());
}

export { LEVEL_NAMES } from "../level-names";
