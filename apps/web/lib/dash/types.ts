// Chatto Dash: the shapes a level is made of. Everything here is plain data and pure functions of the race
// clock, so every player's device draws the same obstacle in the same place without the server sending any of it.
//
// Axes are three.js's: x to the right, y up, and the course runs away from the camera toward -z. A level
// builder writes distances down the course as positive numbers and `lib/dash/build.ts` turns them into -z.

export interface Pose {
  x: number;
  y: number;
  z: number;
  /** Radians about the y axis, three.js's sense: a quarter turn takes +x to -z */
  yaw: number;
}

/** Writes where a moving solid is at race time `t` (seconds since the start signal; negative before it) */
export type Motion = (t: number, out: Pose) => void;

export interface Surface {
  /** Carries whoever stands on it, metres a second in the solid's own x and z */
  conveyor?: [number, number];
  /** Running speed on it, as a share of the normal speed (mochi is slow) */
  speed?: number;
  /** Hardly any grip: speed changes slowly */
  ice?: boolean;
  /** Landing on it throws the player up at this speed */
  bounce?: number;
}

export type SolidLook =
  | "floor"
  | "wall"
  | "bar"
  | "belt"
  | "drum"
  | "ice"
  | "mochi"
  | "tile"
  | "plate"
  | "disc"
  | "pusher"
  | "bumper"
  | "rail"
  | "geyser"
  | "finish";

export interface Solid {
  shape: "box" | "cyl" | "ramp";
  /** Centre, where it rests or at t = 0 */
  x: number;
  y: number;
  z: number;
  /** Half extents. A cylinder stands on its end: hx is its radius, hz is unused */
  hx: number;
  hy: number;
  hz: number;
  yaw: number;
  /** A ramp's top climbs this much from its near end (local +z) to its far end (local -z) */
  rise: number;
  motion?: Motion;
  /** 2 = there, 1 = there and about to go (drawn flashing), 0 = gone */
  active?: (t: number) => 0 | 1 | 2;
  surface?: Surface;
  /** Sideways contact throws the player off at about this speed */
  bumper?: number;
  /** With a bumper: the player also tumbles, without control for a moment */
  tumble?: boolean;
  color: string;
  look: SolidLook;
  /** Filled in by `finishLevel`: how far up and down the course it is ever found, for the broad phase */
  zMin: number;
  zMax: number;
  /** Its place in `level.solids` */
  index: number;
}

/** A ball that knocks players over: a rolling mochi, a cannon's shot, a lantern on a rope */
export interface Ball {
  r: number;
  pos: (t: number, out: Pose) => void;
  /** Gone between runs (drawn nowhere, hits nobody) */
  active?: (t: number) => boolean;
  power: number;
  color: string;
  look: "mochi" | "shot" | "lantern" | "plum";
  /** For a lantern: where its rope hangs from */
  anchor?: { x: number; y: number; z: number };
  zMin: number;
  zMax: number;
}

/** A box of air that pushes whoever is in it */
export interface WindZone {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  /** Metres a second, sideways and down the course */
  ax: number;
  az: number;
  /** 0 to 1 by the race clock: a fan that breathes. Always 1 without it */
  pulse?: (t: number) => number;
}

export interface Checkpoint {
  x: number;
  y: number;
  z: number;
  /** Players are stood side by side across this much of it */
  width: number;
}

export interface Decor {
  kind: "cloud" | "lantern" | "flag" | "sushi" | "pinwheel" | "torii" | "arch" | "plane" | "star";
  x: number;
  y: number;
  z: number;
  s: number;
  color: string;
}

export interface LevelTheme {
  sky: [string, string];
  fog: string;
  floor: string;
  floorAlt: string;
  accent: string;
  accent2: string;
}

export interface Level {
  id: string;
  name: { en: string; ja: string };
  tagline: { en: string; ja: string };
  /** A tip on the level card: what the level is about */
  theme: LevelTheme;
  solids: Solid[];
  balls: Ball[];
  winds: WindZone[];
  /** The first is the start line. The last is before the final stretch, never on the finish itself */
  checkpoints: Checkpoint[];
  finish: { x: number; y: number; z: number; hx: number; hz: number };
  /** A walk through the course, start to finish: how far along someone is, and where the test bot heads */
  path: { x: number; y: number; z: number }[];
  /** Under this a player has fallen off */
  killY: number;
  decor: Decor[];
  /** Seconds a round of it may last */
  timeLimit: number;
  /** Solids by 8-metre stretch of course, for the broad phase */
  buckets: number[][];
  bucketZ0: number;
  pathLen: number[];
  pathTotal: number;
}

export const BUCKET = 8;

export const MODE_RUN = 0;
export const MODE_DIVE = 1;
export const MODE_TUMBLE = 2;
export const MODE_RESPAWN = 3;
export const MODE_DONE = 4;

export const EV_JUMP = 1;
export const EV_LAND = 2;
export const EV_HIT = 4;
export const EV_FALL = 8;
export const EV_BOUNCE = 16;
export const EV_CHECKPOINT = 32;
export const EV_FINISH = 64;
export const EV_DIVE = 128;

export interface PlayerState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** Which way it looks, as a direction on the ground */
  fx: number;
  fz: number;
  grounded: boolean;
  /** Index of the solid stood on, or -1 */
  ground: number;
  coyote: number;
  jumpBuffer: number;
  jumpHeld: boolean;
  diveHeld: boolean;
  mode: number;
  modeT: number;
  diveCooldown: number;
  shield: number;
  checkpoint: number;
  /** Which of the start line's places is this player's */
  slot: number;
  slots: number;
  /** What happened in the last step, for sounds and effects: EV_ flags */
  events: number;
  falls: number;
}

export interface Input {
  /** Wanted direction on the ground, length up to 1: x to the right, z toward the camera */
  mx: number;
  mz: number;
  jump: boolean;
  dive: boolean;
}
