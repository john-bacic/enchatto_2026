// A bot for Chatto Dash's level test. It plays a course by looking ahead: ten times a second it tries each of
// a handful of moves in a copy of the game, a second or so into the future, and makes the one that gets furthest
// without falling or being hit. It can do so because the game is pure arithmetic on the race clock
// (lib/dash/sim.ts). What it does is written down as the inputs it held, which the test plays back.

import { progressOf, step, newPlayer, STEP } from "@/lib/dash/sim";
import { EV_FALL, EV_HIT, MODE_DONE, MODE_RESPAWN, type Input, type Level, type PlayerState } from "@/lib/dash/types";

/** [steps held, mx in hundredths, mz in hundredths, 1 = jump | 2 = dive] */
export type Run = [number, number, number, number][];

const DECIDE = 6;
const HORIZON = 72;
const DIRS: [number, number][] = [];
for (const deg of [0, 25, -25, 50, -50, 80, -80, 120, -120, 180]) {
  DIRS.push([Math.round(Math.sin((deg * Math.PI) / 180) * 100) / 100, Math.round(Math.cos((deg * Math.PI) / 180) * 100) / 100]);
}

function pointAt(level: Level, along: number, out: { x: number; z: number }) {
  const { path, pathLen } = level;
  let i = 0;
  while (i < path.length - 2 && pathLen[i + 1] < along) i++;
  const a = path[i];
  const b = path[i + 1];
  const u = Math.max(0, Math.min(1, (along - pathLen[i]) / (pathLen[i + 1] - pathLen[i] || 1)));
  out.x = a.x + (b.x - a.x) * u;
  out.z = a.z + (b.z - a.z) * u;
}

const aim = { x: 0, z: 0 };
/** The direction to hold to run at the course a few metres ahead, rounded as a run stores it */
export function heading(level: Level, p: PlayerState, ahead: number): [number, number] {
  const along = progressOf(level, p.x, p.y, p.z) * level.pathTotal;
  pointAt(level, Math.min(level.pathTotal, along + ahead), aim);
  const dx = aim.x - p.x;
  const dz = aim.z - p.z;
  const l = Math.hypot(dx, dz) || 1;
  return [Math.round((dx / l) * 100) / 100, Math.round((dz / l) * 100) / 100];
}

/**
 * How good a move is: how far along the course the player is once it has been made, followed up and braked
 * to a stop. `then` is the follow-up, held until `total` steps have gone by: 0 = none, 1 = run at the course
 * ahead, 2 = keep holding the move's direction. Nothing is judged in mid-air or at a run: a move that only
 * works if the next one saves it scores as the fall it would be.
 */
export function rollout(level: Level, from: PlayerState, t: number, first: Input, firstSteps: number, then: 0 | 1 | 2, total: number): number {
  const p = { ...from };
  const input: Input = { ...first };
  let score = 0;
  let steps = 0;
  let settled = 0;
  let braking = false;
  while (steps < total + 300 && settled < 14) {
    if (steps === firstSteps) {
      input.jump = false;
      input.dive = false;
      if (then === 0) input.mx = input.mz = 0;
    }
    // The brakes go on once the follow-up is over and the player is on something: a bounce is steered to its end
    if (!braking && steps >= total && p.grounded) braking = true;
    if (braking) {
      input.mx = input.mz = 0;
      settled = p.grounded ? settled + 1 : 0;
    } else if (then === 1 && steps >= firstSteps && steps % DECIDE === 0) {
      const h = heading(level, p, 3.5);
      input.mx = h[0];
      input.mz = h[1];
    }
    step(level, p, input, t + steps * STEP, STEP);
    steps++;
    if (p.events & EV_FALL) return -1000 + progressOf(level, p.x, p.y, p.z) * level.pathTotal;
    if (p.events & EV_HIT) score -= 4;
    if (p.mode === MODE_DONE) return 10000 - steps;
  }
  if (!p.grounded) return -1000;
  return score + progressOf(level, p.x, p.y, p.z) * level.pathTotal;
}

export interface BotResult {
  finished: boolean;
  seconds: number;
  falls: number;
  hits: number;
  run: Run;
  /** Seconds at which each checkpoint was reached */
  splits: number[];
}

export function playLevel(level: Level, maxSeconds: number): BotResult {
  const p = newPlayer(level, 0, 1);
  const run: Run = [];
  const input: Input = { mx: 0, mz: 0, jump: false, dive: false };
  const splits: number[] = [];
  let hits = 0;
  let n = 0;
  const maxSteps = Math.round(maxSeconds / STEP);
  while (n < maxSteps && p.mode !== MODE_DONE) {
    const t = n * STEP;
    if (p.mode !== MODE_RESPAWN) {
      const ahead = heading(level, p, 3.5);
      const dirs: [number, number][] = [ahead, [0, 0], ...DIRS];
      let best = -Infinity;
      let pick: Input = { mx: 0, mz: 0, jump: false, dive: false };
      for (const [mx, mz] of dirs) {
        for (const buttons of [0, 1, 2, 3]) {
          if (buttons >= 2 && (mx !== ahead[0] || mz !== ahead[1])) continue;
          const cand: Input = { mx, mz, jump: (buttons & 1) !== 0, dive: (buttons & 2) !== 0 };
          const held = cand.jump || cand.dive ? 12 : DECIDE;
          // A move that is as good as another loses to the one tried first: running at the course ahead
          let s = Math.max(
            rollout(level, p, t, cand, held, 0, held),
            rollout(level, p, t, cand, held, 2, 30),
            rollout(level, p, t, cand, held, 2, HORIZON)
          );
          // Running on at the course is tried for every length a decision apart. With only a few lengths, an edge
          // just inside the longest made "stand, then run" (which runs one decision less) score above running
          // now, and the bot stood at the start line for good
          for (let total = 24; total <= HORIZON; total += DECIDE) s = Math.max(s, rollout(level, p, t, cand, held, 1, total));
          s -= buttons ? 0.05 : 0;
          if (s > best + 1e-9) {
            best = s;
            pick = cand;
          }
        }
      }
      input.mx = pick.mx;
      input.mz = pick.mz;
      input.jump = pick.jump;
      input.dive = pick.dive;
    }
    if (process.env.DASH_TRACE && n % 30 === 0 && n < 1800) console.log(`t=${(n * STEP).toFixed(1)} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} d=${(-p.z).toFixed(1)} in=${input.mx},${input.mz},${input.jump ? 'J' : ''}${input.dive ? 'D' : ''} mode=${p.mode} g=${p.ground}`);
    const flags = (input.jump ? 1 : 0) | (input.dive ? 2 : 0);
    run.push([DECIDE, Math.round(input.mx * 100), Math.round(input.mz * 100), flags]);
    for (let k = 0; k < DECIDE && p.mode !== MODE_DONE; k++) {
      const cp = p.checkpoint;
      step(level, p, input, n * STEP, STEP);
      n++;
      if (p.events & EV_HIT) hits++;
      if (p.checkpoint !== cp) splits.push(Math.round(n * STEP * 10) / 10);
    }
  }
  if (p.mode !== MODE_DONE) console.log(`stuck at x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} d=${(-p.z).toFixed(1)} cp=${p.checkpoint} mode=${p.mode} grounded=${p.grounded}`);
  return { finished: p.mode === MODE_DONE, seconds: n * STEP, falls: p.falls, hits, run: squeeze(run), splits };
}

function squeeze(run: Run): Run {
  const out: Run = [];
  for (const r of run) {
    const last = out[out.length - 1];
    if (last && last[1] === r[1] && last[2] === r[2] && last[3] === r[3] && r[3] === 0) last[0] += r[0];
    else out.push([...r]);
  }
  return out;
}

/** Plays a stored run back. The same course gives the same result every time */
export function replay(level: Level, run: Run): { finished: boolean; seconds: number; falls: number } {
  const p = newPlayer(level, 0, 1);
  const input: Input = { mx: 0, mz: 0, jump: false, dive: false };
  let n = 0;
  for (const [steps, mx, mz, flags] of run) {
    input.mx = mx / 100;
    input.mz = mz / 100;
    input.jump = (flags & 1) !== 0;
    input.dive = (flags & 2) !== 0;
    for (let k = 0; k < steps && p.mode !== MODE_DONE; k++) {
      step(level, p, input, n * STEP, STEP);
      n++;
    }
  }
  if (p.mode !== MODE_DONE) console.log(`stuck at x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} d=${(-p.z).toFixed(1)} cp=${p.checkpoint} mode=${p.mode} grounded=${p.grounded}`);
  return { finished: p.mode === MODE_DONE, seconds: n * STEP, falls: p.falls };
}
