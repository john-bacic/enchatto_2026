// Chatto Dash: how a player moves. Pure arithmetic on plain objects: no three.js, no clock of its own and no
// randomness, so the same inputs from the same start always end in the same place. The game runs it sixty
// times a second for the local player; the level test runs it for a bot to show every course can be finished.

import {
  BUCKET,
  EV_BOUNCE,
  EV_CHECKPOINT,
  EV_DIVE,
  EV_FALL,
  EV_FINISH,
  EV_HIT,
  EV_JUMP,
  EV_LAND,
  MODE_DIVE,
  MODE_DONE,
  MODE_RESPAWN,
  MODE_RUN,
  MODE_TUMBLE,
  type Input,
  type Level,
  type PlayerState,
  type Pose,
  type Solid,
} from "./types";

export const STEP = 1 / 60;
export const GRAVITY = 30;
export const JUMP_SPEED = 11;
export const RUN_SPEED = 6.4;
export const DIVE_SPEED = 8.6;
export const BODY_R = 0.42;
export const FOOT_R = 0.26;
export const HEIGHT = 1.15;
const ACCEL = 50;
const AIR_ACCEL = 22;
const ICE_ACCEL = 6;
const STEP_UP = 0.4;
const SNAP_DOWN = 0.35;
const START_ROW = 8;

const p0: Pose = { x: 0, y: 0, z: 0, yaw: 0 };
const p1: Pose = { x: 0, y: 0, z: 0, yaw: 0 };
const pb0: Pose = { x: 0, y: 0, z: 0, yaw: 0 };
const pb1: Pose = { x: 0, y: 0, z: 0, yaw: 0 };

export function poseOf(s: Solid, t: number, out: Pose): Pose {
  if (s.motion) {
    s.motion(t, out);
  } else {
    out.x = s.x;
    out.y = s.y;
    out.z = s.z;
    out.yaw = s.yaw;
  }
  return out;
}

/** Height of a solid's top over a point given in its own frame (a ramp's top is not level) */
export function topAt(s: Solid, pose: Pose, lz: number): number {
  if (s.shape !== "ramp") return pose.y + s.hy;
  const cz = Math.max(-s.hz, Math.min(s.hz, lz));
  return pose.y + s.hy + (s.rise * (s.hz - cz)) / (2 * s.hz);
}

export function candidates(level: Level, z: number): number[] {
  const i = Math.floor((z - level.bucketZ0) / BUCKET);
  return level.buckets[i] ?? EMPTY;
}
const EMPTY: number[] = [];

/** Where a player stands at a checkpoint: side by side, eight to a row, later rows behind */
export function spawnPoint(level: Level, checkpoint: number, slot: number, slots: number, out: { x: number; y: number; z: number }) {
  const cp = level.checkpoints[Math.max(0, Math.min(level.checkpoints.length - 1, checkpoint))];
  const perRow = Math.min(START_ROW, Math.max(1, slots));
  const row = Math.floor(slot / perRow);
  const col = slot % perRow;
  out.x = cp.x + ((col + 0.5) / perRow - 0.5) * cp.width;
  out.y = cp.y + 0.02;
  out.z = cp.z + 0.6 + row * 1.1;
}

export function newPlayer(level: Level, slot = 0, slots = 1): PlayerState {
  const p: PlayerState = {
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, fx: 0, fz: -1,
    grounded: false, ground: -1, coyote: 0, jumpBuffer: 0, jumpHeld: false, diveHeld: false,
    mode: MODE_RUN, modeT: 0, diveCooldown: 0, shield: 0, checkpoint: 0, slot, slots, events: 0, falls: 0,
  };
  spawnPoint(level, 0, slot, slots, p);
  return p;
}

function knock(p: PlayerState, nx: number, nz: number, speed: number, pvx: number, pvz: number, up: number, tumble: boolean) {
  p.vx = nx * speed + pvx * 0.7;
  p.vz = nz * speed + pvz * 0.7;
  p.vy = up;
  p.grounded = false;
  p.ground = -1;
  p.coyote = 0;
  p.events |= EV_HIT;
  if (tumble && p.mode !== MODE_DONE) {
    p.mode = MODE_TUMBLE;
    p.modeT = 0.75;
    p.shield = 0.35;
  } else {
    p.shield = 0.2;
  }
}

/** One step of `dt` seconds from race time `t`. Changes `p` in place */
export function step(level: Level, p: PlayerState, input: Input, t: number, dt: number): void {
  p.events = 0;
  const t1 = t + dt;

  if (p.mode === MODE_RESPAWN) {
    p.modeT -= dt;
    if (p.modeT <= 0) {
      spawnPoint(level, p.checkpoint, p.slot, p.slots, p);
      p.vx = p.vy = p.vz = 0;
      p.fx = 0;
      p.fz = -1;
      p.mode = MODE_RUN;
      p.shield = 1.2;
      p.grounded = false;
      p.ground = -1;
    }
    return;
  }

  p.coyote = Math.max(0, p.coyote - dt);
  p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  p.diveCooldown = Math.max(0, p.diveCooldown - dt);
  p.shield = Math.max(0, p.shield - dt);

  const solids = level.solids;
  let carryX = 0;
  let carryY = 0;
  let carryZ = 0;
  let speedMul = 1;
  let ice = false;

  // 1. Whatever the player stands on takes them along
  if (p.grounded && p.ground >= 0) {
    const s = solids[p.ground];
    if (s.motion) {
      poseOf(s, t, p0);
      poseOf(s, t1, p1);
      const dx = p.x - p0.x;
      const dz = p.z - p0.z;
      const c0 = Math.cos(p0.yaw);
      const s0 = Math.sin(p0.yaw);
      const lx = dx * c0 - dz * s0;
      const lz = dx * s0 + dz * c0;
      const c1 = Math.cos(p1.yaw);
      const s1 = Math.sin(p1.yaw);
      const nx = p1.x + lx * c1 + lz * s1;
      const nz = p1.z - lx * s1 + lz * c1;
      // A solid that jumps back to the start of its run leaves its rider where they are
      if (Math.abs(nx - p.x) + Math.abs(nz - p.z) + Math.abs(p1.y - p0.y) < 1.5) {
        carryX = (nx - p.x) / dt;
        carryZ = (nz - p.z) / dt;
        carryY = (p1.y - p0.y) / dt;
        p.x = nx;
        p.z = nz;
        p.y += p1.y - p0.y;
      }
      const dyaw = p1.yaw - p0.yaw;
      if (dyaw !== 0) {
        const cf = Math.cos(dyaw);
        const sf = Math.sin(dyaw);
        const fx = p.fx * cf + p.fz * sf;
        p.fz = -p.fx * sf + p.fz * cf;
        p.fx = fx;
      }
    } else {
      p1.yaw = s.yaw;
    }
    const surf = s.surface;
    if (surf) {
      if (surf.conveyor) {
        const c = Math.cos(p1.yaw);
        const sn = Math.sin(p1.yaw);
        const wx = surf.conveyor[0] * c + surf.conveyor[1] * sn;
        const wz = -surf.conveyor[0] * sn + surf.conveyor[1] * c;
        p.x += wx * dt;
        p.z += wz * dt;
        carryX += wx;
        carryZ += wz;
      }
      if (surf.speed !== undefined) speedMul = surf.speed;
      if (surf.ice) ice = true;
    }
  }

  // 2. Buttons
  if (input.jump && !p.jumpHeld) p.jumpBuffer = 0.14;
  const diveEdge = input.dive && !p.diveHeld;
  p.jumpHeld = input.jump;
  p.diveHeld = input.dive;

  let mx = input.mx;
  let mz = input.mz;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) {
    mx /= ml;
    mz /= ml;
  }
  const control = p.mode === MODE_RUN;
  let jumped = false;

  if (control) {
    const accel = (p.grounded ? (ice ? ICE_ACCEL : ACCEL) : AIR_ACCEL) * dt;
    const speed = RUN_SPEED * (p.grounded ? speedMul : 1);
    const tx = mx * speed;
    const tz = mz * speed;
    const ddx = tx - p.vx;
    const ddz = tz - p.vz;
    const dl = Math.hypot(ddx, ddz);
    if (dl <= accel || dl === 0) {
      p.vx = tx;
      p.vz = tz;
    } else {
      p.vx += (ddx / dl) * accel;
      p.vz += (ddz / dl) * accel;
    }
    if (ml > 0.15) {
      p.fx = mx / Math.min(1, ml);
      p.fz = mz / Math.min(1, ml);
    }
    if (p.jumpBuffer > 0 && (p.grounded || p.coyote > 0)) {
      p.vy = JUMP_SPEED + Math.max(0, carryY);
      p.vx += carryX;
      p.vz += carryZ;
      p.grounded = false;
      p.ground = -1;
      p.coyote = 0;
      p.jumpBuffer = 0;
      p.events |= EV_JUMP;
      jumped = true;
    }
    if (diveEdge && p.diveCooldown <= 0) {
      const dx = ml > 0.2 ? mx / ml : p.fx;
      const dz = ml > 0.2 ? mz / ml : p.fz;
      p.vx = dx * DIVE_SPEED + (p.grounded ? carryX : 0);
      p.vz = dz * DIVE_SPEED + (p.grounded ? carryZ : 0);
      p.vy = p.grounded ? 5 : Math.max(p.vy, 3);
      p.fx = dx;
      p.fz = dz;
      p.mode = MODE_DIVE;
      p.modeT = 0;
      p.grounded = false;
      p.ground = -1;
      p.coyote = 0;
      p.events |= EV_DIVE;
      jumped = true;
    }
  } else {
    // No control while diving, tumbling or done: the ground slows the slide
    if (p.grounded) {
      const drag = (ice ? 3 : p.mode === MODE_DONE ? 30 : p.mode === MODE_DIVE ? 16 : 11) * dt;
      const sp = Math.hypot(p.vx, p.vz);
      const keep = sp > drag ? (sp - drag) / sp : 0;
      p.vx *= keep;
      p.vz *= keep;
      p.modeT -= dt;
      if (p.mode === MODE_DIVE) {
        if (p.modeT < -0.5) {
          p.mode = MODE_RUN;
          p.diveCooldown = 0.3;
        }
      } else if (p.mode === MODE_TUMBLE && p.modeT <= 0) {
        p.mode = MODE_RUN;
      }
    } else if (p.mode === MODE_TUMBLE) {
      p.modeT -= dt;
    }
  }

  // 3. Gravity and wind
  p.vy = Math.max(-45, p.vy - GRAVITY * dt);
  for (const w of level.winds) {
    if (p.x < w.x0 || p.x > w.x1 || p.z < w.z0 || p.z > w.z1 || p.y < w.y0 || p.y > w.y1) continue;
    const k = (w.pulse ? w.pulse(t) : 1) * (p.grounded ? 0.8 : 1) * dt;
    p.x += w.ax * k;
    p.z += w.az * k;
  }

  // 4. Move
  const wasGrounded = p.grounded && !jumped;
  const prevY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.z += p.vz * dt;

  // 5. Solids: land on the highest top under the feet, get pushed out of anything beside
  let bestTop = -Infinity;
  let newGround = -1;
  let groundRise = 0;
  const near = candidates(level, p.z);
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 0; k < near.length; k++) {
      const s = solids[near[k]];
      if (p.z < s.zMin - 1 || p.z > s.zMax + 1) continue;
      if (s.active && s.active(t1) === 0) continue;
      poseOf(s, t1, p1);
      const dx = p.x - p1.x;
      const dz = p.z - p1.z;
      const c = Math.cos(p1.yaw);
      const sn = Math.sin(p1.yaw);
      const lx = dx * c - dz * sn;
      const lz = dx * sn + dz * c;
      let ex = 0;
      let ez = 0;
      let d = 0;
      let centre = 0;
      if (s.shape === "cyl") {
        centre = Math.hypot(lx, lz);
        d = Math.max(0, centre - s.hx);
        if (centre > 0) {
          ex = lx / centre;
          ez = lz / centre;
        } else {
          ex = 1;
        }
      } else {
        const cx = Math.max(-s.hx, Math.min(s.hx, lx));
        const cz = Math.max(-s.hz, Math.min(s.hz, lz));
        ex = lx - cx;
        ez = lz - cz;
        d = Math.hypot(ex, ez);
        if (d > 0) {
          ex /= d;
          ez /= d;
        }
      }
      if (d >= BODY_R) continue;
      const top = topAt(s, p1, lz);
      const bottom = p1.y - s.hy;
      let rise = 0;
      if (s.motion) {
        poseOf(s, t, p0);
        rise = p1.y - p0.y;
      }
      const stepUp = wasGrounded ? STEP_UP : 0.08;
      if (pass === 0) {
        if (
          d < FOOT_R &&
          p.vy <= Math.max(0, rise / dt) + 0.01 &&
          prevY >= top - stepUp - Math.max(0, rise) &&
          p.y <= top + (wasGrounded ? SNAP_DOWN : 0)
        ) {
          if (top > bestTop) {
            bestTop = top;
            newGround = s.index;
            groundRise = rise;
          }
        }
        continue;
      }
      if (s.index === newGround) continue;
      if (p.y >= top - 0.02 || p.y + HEIGHT <= bottom) continue;
      // A low kerb is no wall to someone walking: they are lifted onto it once they are over it
      if (!s.bumper && top - p.y <= stepUp) continue;
      // Under it and rising: bump the head
      if (prevY + HEIGHT <= bottom + 0.06 && p.vy > 0 && d < FOOT_R) {
        p.y = bottom - HEIGHT;
        p.vy = 0;
        continue;
      }
      let depth = BODY_R - d;
      if (d === 0) {
        if (s.shape === "cyl") {
          depth = s.hx - centre + BODY_R;
        } else {
          const px = s.hx - Math.abs(lx);
          const pz = s.hz - Math.abs(lz);
          if (px < pz) {
            ex = lx < 0 ? -1 : 1;
            ez = 0;
            depth = px + BODY_R;
          } else {
            ex = 0;
            ez = lz < 0 ? -1 : 1;
            depth = pz + BODY_R;
          }
        }
      }
      const nx = ex * c + ez * sn;
      const nz = -ex * sn + ez * c;
      p.x += nx * depth;
      p.z += nz * depth;
      const vn = p.vx * nx + p.vz * nz;
      if (vn < 0) {
        p.vx -= nx * vn;
        p.vz -= nz * vn;
      }
      if (s.bumper && p.shield <= 0) {
        let pvx = 0;
        let pvz = 0;
        if (s.motion) {
          // How fast the solid's own surface is moving where it touched
          const c0 = Math.cos(p0.yaw);
          const s0 = Math.sin(p0.yaw);
          const ox = p0.x + lx * c0 + lz * s0;
          const oz = p0.z - lx * s0 + lz * c0;
          pvx = (p.x - nx * depth - ox) / dt;
          pvz = (p.z - nz * depth - oz) / dt;
        }
        knock(p, nx, nz, s.bumper, pvx, pvz, s.tumble ? 7 : 5.5, !!s.tumble);
      }
    }
    if (pass === 0 && newGround >= 0) {
      const s = solids[newGround];
      p.y = bestTop;
      if (s.surface?.bounce) {
        p.vy = s.surface.bounce;
        p.grounded = false;
        p.ground = -1;
        p.events |= EV_BOUNCE;
        if (p.mode === MODE_DIVE) {
          p.mode = MODE_RUN;
          p.diveCooldown = 0.2;
        }
        newGround = -1;
      } else {
        if (!wasGrounded) {
          p.events |= EV_LAND;
          if (p.mode === MODE_DIVE) p.modeT = 0;
        }
        p.vy = Math.max(0, groundRise / dt);
        p.grounded = true;
        p.ground = newGround;
        p.coyote = 0.1;
      }
    } else if (pass === 0) {
      p.grounded = false;
      p.ground = -1;
    }
  }
  if (!p.grounded) p.ground = -1;

  // 6. Balls
  if (p.shield <= 0 && p.mode !== MODE_DONE) {
    for (const b of level.balls) {
      if (p.z < b.zMin - 2 || p.z > b.zMax + 2) continue;
      if (b.active && !b.active(t1)) continue;
      b.pos(t1, pb1);
      const dx = p.x - pb1.x;
      const dy = p.y + 0.6 - pb1.y;
      const dz = p.z - pb1.z;
      const reach = b.r + 0.5;
      if (dx * dx + dy * dy + dz * dz >= reach * reach) continue;
      b.pos(t, pb0);
      const bvx = (pb1.x - pb0.x) / dt;
      const bvz = (pb1.z - pb0.z) / dt;
      let nx = dx;
      let nz = dz;
      let nl = Math.hypot(nx, nz);
      if (nl < 0.05) {
        nx = bvx;
        nz = bvz;
        nl = Math.hypot(nx, nz) || 1;
      }
      knock(p, nx / nl, nz / nl, b.power * 0.6, bvx, bvz, 7.5, true);
      p.modeT = 0.8;
      p.shield = 0.45;
      break;
    }
  }

  // 7. Off the course
  if (p.y < level.killY) {
    p.events |= EV_FALL;
    p.falls++;
    if (p.mode !== MODE_DONE) {
      p.mode = MODE_RESPAWN;
      p.modeT = 0.55;
    } else {
      p.x = level.finish.x;
      p.y = level.finish.y + 0.05;
      p.z = level.finish.z;
      p.vx = p.vy = p.vz = 0;
    }
    return;
  }

  // 8. Checkpoints and the finish
  if (p.grounded && p.mode !== MODE_DONE) {
    const cps = level.checkpoints;
    for (let i = cps.length - 1; i > p.checkpoint; i--) {
      const cp = cps[i];
      if (Math.abs(p.z - cp.z) < 2.6 && Math.abs(p.x - cp.x) < cp.width / 2 + 1.2 && Math.abs(p.y - cp.y) < 1.2) {
        p.checkpoint = i;
        p.events |= EV_CHECKPOINT;
        break;
      }
    }
    const f = level.finish;
    if (Math.abs(p.x - f.x) <= f.hx && Math.abs(p.z - f.z) <= f.hz && Math.abs(p.y - f.y) < 1.5) {
      p.mode = MODE_DONE;
      p.events |= EV_FINISH;
    }
  }
}

/** The top of whatever is under a point, for a shadow to lie on. -Infinity over a drop */
export function groundBelow(level: Level, x: number, y: number, z: number, t: number): number {
  let best = -Infinity;
  const near = candidates(level, z);
  for (let k = 0; k < near.length; k++) {
    const s = level.solids[near[k]];
    if (s.active && s.active(t) === 0) continue;
    poseOf(s, t, p1);
    const dx = x - p1.x;
    const dz = z - p1.z;
    const c = Math.cos(p1.yaw);
    const sn = Math.sin(p1.yaw);
    const lx = dx * c - dz * sn;
    const lz = dx * sn + dz * c;
    if (s.shape === "cyl") {
      if (lx * lx + lz * lz > s.hx * s.hx) continue;
    } else if (Math.abs(lx) > s.hx || Math.abs(lz) > s.hz) continue;
    const top = topAt(s, p1, lz);
    if (top <= y + 0.45 && top > best) best = top;
  }
  return best;
}

/** How far along the course a point is, 0 at the start line and 1 at the finish */
export function progressOf(level: Level, x: number, y: number, z: number): number {
  const path = level.path;
  let best = Infinity;
  let along = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const abz = b.z - a.z;
    const len2 = abx * abx + aby * aby + abz * abz || 1;
    let u = ((x - a.x) * abx + (y - a.y) * aby + (z - a.z) * abz) / len2;
    u = Math.max(0, Math.min(1, u));
    const dx = x - (a.x + abx * u);
    const dy = (y - (a.y + aby * u)) * 0.5;
    const dz = z - (a.z + abz * u);
    const d = dx * dx + dy * dy + dz * dz;
    if (d < best) {
      best = d;
      along = level.pathLen[i] + Math.sqrt(len2) * u;
    }
  }
  return Math.max(0, Math.min(1, along / level.pathTotal));
}
