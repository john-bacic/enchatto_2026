// Chatto Dash: what a level is written with. A level file places things by how far down the course they are
// (`d`, metres from the back of the start pad) and by the height of their top; this turns that into the
// solids, balls and winds of `types.ts`, where the course runs toward -z.

import { poseOf } from "./sim";
import {
  BUCKET,
  type Ball,
  type Checkpoint,
  type Decor,
  type Level,
  type LevelTheme,
  type Motion,
  type Pose,
  type Solid,
  type SolidLook,
  type Surface,
  type WindZone,
} from "./types";

export const INK = "#1d1b4f";
export const PAPER = "#fff8ec";
export const BLUE = "#3b6bff";
export const BLUE_SOFT = "#d9e4ff";
export const PINK = "#ff7ab6";
export const PINK_SOFT = "#ffd0e4";
export const YELLOW = "#ffd23f";
export const YELLOW_SOFT = "#fff4c4";
export const MINT = "#3fdcb0";
export const MINT_SOFT = "#dcfaef";
export const VIOLET = "#a77bff";
export const VIOLET_SOFT = "#efe6ff";
export const RED = "#ff4f6d";
export const WHITE = "#ffffff";

const TAU = Math.PI * 2;

export interface SolidOpts {
  yaw?: number;
  color?: string;
  look?: SolidLook;
  surface?: Surface;
  bumper?: number;
  tumble?: boolean;
  motion?: Motion;
  active?: (t: number) => 0 | 1 | 2;
}

/** Turning on the spot: `speed` radians a second, anticlockwise seen from above when positive */
export function spin(s: Solid, speed: number, phase = 0): Solid {
  const { x, y, z, yaw } = s;
  s.motion = (t, out) => {
    out.x = x;
    out.y = y;
    out.z = z;
    out.yaw = yaw + phase + speed * t;
  };
  return s;
}

/** Gliding there and back: `dx` sideways, `dy` up and `dd` down the course, once every `period` seconds */
export function slide(s: Solid, dx: number, dy: number, dd: number, period: number, phase = 0): Solid {
  const { x, y, z, yaw } = s;
  s.motion = (t, out) => {
    const u = 0.5 - 0.5 * Math.cos(TAU * (t / period + phase));
    out.x = x + dx * u;
    out.y = y + dy * u;
    out.z = z - dd * u;
    out.yaw = yaw;
  };
  return s;
}

/** Going round a point `radius` away, keeping its own heading unless `turn` */
export function orbit(s: Solid, radius: number, speed: number, phase = 0, turn = false): Solid {
  const { x, y, z, yaw } = s;
  s.motion = (t, out) => {
    const a = phase + speed * t;
    out.x = x + Math.cos(a) * radius;
    out.y = y;
    out.z = z - Math.sin(a) * radius;
    out.yaw = turn ? yaw + a : yaw;
  };
  return s;
}

/** On for `on` seconds of every `period`, flashing for the last 0.7 of them */
export function blink(period: number, on: number, phase = 0): (t: number) => 0 | 1 | 2 {
  return (t) => {
    const u = (((t + phase * period) % period) + period) % period;
    if (u >= on) return 0;
    return u >= on - 0.7 ? 1 : 2;
  };
}

export class LevelBuilder {
  solids: Solid[] = [];
  balls: Ball[] = [];
  winds: WindZone[] = [];
  checkpoints: Checkpoint[] = [];
  decor: Decor[] = [];
  path: { x: number; y: number; z: number }[] = [];
  private finishBox: Level["finish"] | null = null;

  constructor(
    private id: string,
    private name: Level["name"],
    private tagline: Level["tagline"],
    private theme: LevelTheme,
    private timeLimit: number,
    private killY = -9
  ) {}

  private add(shape: Solid["shape"], x: number, y: number, z: number, hx: number, hy: number, hz: number, rise: number, o: SolidOpts): Solid {
    const s: Solid = {
      shape, x, y, z, hx, hy, hz, rise,
      yaw: o.yaw ?? 0,
      color: o.color ?? this.theme.floor,
      look: o.look ?? "floor",
      surface: o.surface,
      bumper: o.bumper,
      tumble: o.tumble,
      motion: o.motion,
      active: o.active,
      zMin: 0, zMax: 0, index: this.solids.length,
    };
    this.solids.push(s);
    return s;
  }

  /** A block `w` wide, `h` thick and `len` long, centred at `x` and `d`, its top at `top` */
  box(x: number, top: number, d: number, w: number, h: number, len: number, o: SolidOpts = {}): Solid {
    return this.add("box", x, top - h / 2, -d, w / 2, h / 2, len / 2, 0, o);
  }

  /** A drum standing on its end */
  cyl(x: number, top: number, d: number, r: number, h: number, o: SolidOpts = {}): Solid {
    return this.add("cyl", x, top - h / 2, -d, r, h / 2, r, 0, o);
  }

  /** A slope from `d0` to `d1`, its top at `top0` at the near end and `top1` at the far end */
  ramp(x: number, d0: number, d1: number, top0: number, top1: number, w: number, o: SolidOpts = {}): Solid {
    const h = 0.6;
    return this.add("ramp", x, top0 - h / 2, -(d0 + d1) / 2, w / 2, h / 2, (d1 - d0) / 2, top1 - top0, o);
  }

  /** A ball going from one point to another every `period` seconds, then starting again */
  roller(r: number, from: [number, number, number], to: [number, number, number], period: number, phase: number, o: Partial<Ball> = {}): Ball {
    const [x0, y0, d0] = from;
    const [x1, y1, d1] = to;
    const b: Ball = {
      r, power: 11, color: WHITE, look: "mochi", zMin: 0, zMax: 0,
      pos: (t, out) => {
        const u = (((t / period + phase) % 1) + 1) % 1;
        out.x = x0 + (x1 - x0) * u;
        out.y = y0 + (y1 - y0) * u + r;
        out.z = -(d0 + (d1 - d0) * u);
        out.yaw = (u * Math.hypot(x1 - x0, d1 - d0)) / r;
      },
      ...o,
    };
    this.balls.push(b);
    return b;
  }

  /** A ball going there and back, easing at each end */
  shuttle(r: number, from: [number, number, number], to: [number, number, number], period: number, phase: number, o: Partial<Ball> = {}): Ball {
    const [x0, y0, d0] = from;
    const [x1, y1, d1] = to;
    const b: Ball = {
      r, power: 11, color: WHITE, look: "mochi", zMin: 0, zMax: 0,
      pos: (t, out) => {
        const u = 0.5 - 0.5 * Math.cos(TAU * (t / period + phase));
        out.x = x0 + (x1 - x0) * u;
        out.y = y0 + (y1 - y0) * u + r;
        out.z = -(d0 + (d1 - d0) * u);
        out.yaw = (u * Math.hypot(x1 - x0, d1 - d0)) / r;
      },
      ...o,
    };
    this.balls.push(b);
    return b;
  }

  /** A lantern on a rope `len` long, swinging across the course from a point `y` up */
  lantern(x: number, y: number, d: number, len: number, swing: number, period: number, phase: number, color: string): Ball {
    const b: Ball = {
      r: 0.85, power: 12, color, look: "lantern", zMin: 0, zMax: 0,
      anchor: { x, y, z: -d },
      pos: (t, out) => {
        const a = swing * Math.sin(TAU * (t / period + phase));
        out.x = x + Math.sin(a) * len;
        out.y = y - Math.cos(a) * len;
        out.z = -d;
        out.yaw = a;
      },
    };
    this.balls.push(b);
    return b;
  }

  /** Air from `d0` to `d1` and `x0` to `x1` that pushes `ax` sideways and `ad` down the course */
  wind(x0: number, x1: number, d0: number, d1: number, y0: number, y1: number, ax: number, ad: number, pulse?: (t: number) => number): WindZone {
    const w: WindZone = { x0, x1, y0, y1, z0: -d1, z1: -d0, ax, az: -ad, pulse };
    this.winds.push(w);
    return w;
  }

  checkpoint(x: number, y: number, d: number, width: number) {
    this.checkpoints.push({ x, y, z: -d, width });
    this.way(x, y, d);
  }

  finish(x: number, y: number, d: number, w: number, len: number) {
    this.finishBox = { x, y, z: -d, hx: w / 2, hz: len / 2 };
    this.way(x, y, d);
  }

  /** The next point of the walk through the course */
  way(x: number, y: number, d: number) {
    this.path.push({ x, y, z: -d });
  }

  deco(kind: Decor["kind"], x: number, y: number, d: number, s = 1, color = WHITE) {
    this.decor.push({ kind, x, y, z: -d, s, color });
  }

  build(): Level {
    if (!this.finishBox) throw new Error(`${this.id}: no finish`);
    if (this.checkpoints.length === 0) throw new Error(`${this.id}: no start`);
    const pose: Pose = { x: 0, y: 0, z: 0, yaw: 0 };
    let zLo = Infinity;
    let zHi = -Infinity;
    for (const s of this.solids) {
      const reach = s.shape === "cyl" ? s.hx : Math.hypot(s.hx, s.hz);
      s.zMin = Infinity;
      s.zMax = -Infinity;
      for (let t = 0; t <= (s.motion ? 60 : 0); t += 0.05) {
        poseOf(s, t, pose);
        s.zMin = Math.min(s.zMin, pose.z - reach);
        s.zMax = Math.max(s.zMax, pose.z + reach);
      }
      zLo = Math.min(zLo, s.zMin);
      zHi = Math.max(zHi, s.zMax);
    }
    for (const b of this.balls) {
      b.zMin = Infinity;
      b.zMax = -Infinity;
      for (let t = 0; t <= 60; t += 0.05) {
        b.pos(t, pose);
        b.zMin = Math.min(b.zMin, pose.z - b.r);
        b.zMax = Math.max(b.zMax, pose.z + b.r);
      }
    }
    const bucketZ0 = Math.floor(zLo / BUCKET) * BUCKET - BUCKET;
    const count = Math.ceil((zHi - bucketZ0) / BUCKET) + 2;
    const buckets: number[][] = Array.from({ length: count }, () => []);
    for (const s of this.solids) {
      const a = Math.max(0, Math.floor((s.zMin - 1.5 - bucketZ0) / BUCKET));
      const b = Math.min(count - 1, Math.floor((s.zMax + 1.5 - bucketZ0) / BUCKET));
      for (let i = a; i <= b; i++) buckets[i].push(s.index);
    }
    const pathLen: number[] = [0];
    for (let i = 1; i < this.path.length; i++) {
      const a = this.path[i - 1];
      const b = this.path[i];
      pathLen.push(pathLen[i - 1] + Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
    }
    return {
      id: this.id,
      name: this.name,
      tagline: this.tagline,
      theme: this.theme,
      solids: this.solids,
      balls: this.balls,
      winds: this.winds,
      checkpoints: this.checkpoints,
      finish: this.finishBox,
      path: this.path,
      killY: this.killY,
      decor: this.decor,
      timeLimit: this.timeLimit,
      buckets,
      bucketZ0,
      pathLen,
      pathTotal: pathLen[pathLen.length - 1] || 1,
    };
  }
}
