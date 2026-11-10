// Chatto Dash: one round as it runs on one device. Steps the local racer through the physics by the race
// clock, places everyone else from what their devices last said, and has the scene drawn. It is handed a
// clock (seconds since the start signal, the same on every device) and callbacks for what leaves the device:
// where this racer is, a few times a second, and that they have crossed the line.

import { getLevel } from "./levels";
import { DashScene } from "./scene";
import { sfx } from "./sfx";
import { newPlayer, progressOf, spawnPoint, step, STEP } from "./sim";
import {
  EV_BOUNCE,
  EV_CHECKPOINT,
  EV_DIVE,
  EV_FALL,
  EV_FINISH,
  EV_HIT,
  EV_JUMP,
  EV_LAND,
  MODE_DONE,
  MODE_RESPAWN,
  MODE_RUN,
  type Input,
  type Level,
  type PlayerState,
} from "./types";

export interface RacerInfo {
  id: string;
  avatar: string;
  name: string;
}

/** What a device says of its racer, and what it is told of the others */
export interface NetState {
  x: number;
  y: number;
  z: number;
  m: number;
  g: boolean;
  p: number;
  rt: number;
}

export interface Hud {
  /** Seconds since the start signal; negative during the countdown */
  t: number;
  place: number;
  racing: number;
  /** Each racer's share of the course, by id */
  progress: Record<string, number>;
  finished: boolean;
  checkpoint: number;
  falls: number;
  /** Whose view this is when it is not the local racer's */
  watching: string | null;
}

export interface DashGameOptions {
  canvas: HTMLCanvasElement;
  levelIndex: number;
  racers: RacerInfo[];
  /** The local racer, or null to watch */
  meId: string | null;
  raceTime: () => number;
  onSend?: (state: NetState) => void;
  onFinish?: (seconds: number) => void;
  onHud?: (hud: Hud) => void;
  /** Milliseconds between two sends */
  sendEvery?: number;
  /** Start the local racer at this checkpoint, not at the start line (the practice page) */
  startCheckpoint?: number;
}

/** Others are drawn this far in the past, so that there is always a later word from them to move toward */
const VIEW_DELAY = 0.42;
const round2 = (n: number) => Math.round(n * 100) / 100;

export class DashGame {
  readonly level: Level;
  readonly input: Input = { mx: 0, mz: 0, jump: false, dive: false };
  private scene: DashScene;
  private me: PlayerState | null = null;
  private prev = { x: 0, y: 0, z: 0 };
  private simT = 0;
  private raf = 0;
  private last = 0;
  private lastSend = 0;
  private lastHud = 0;
  private lastCount = 99;
  private finishedAt = -1;
  private remote = new Map<string, NetState[]>();
  private slots = new Map<string, number>();
  private keys = new Set<string>();
  private stick = { x: 0, y: 0 };
  private disposed = false;
  private focus = { x: 0, y: 0, z: 0 };
  private scratch = { x: 0, y: 0, z: 0 };

  constructor(private opts: DashGameOptions) {
    this.level = getLevel(opts.levelIndex);
    this.scene = new DashScene(opts.canvas, this.level);
    opts.racers.forEach((r, i) => {
      this.slots.set(r.id, i);
      this.scene.addRacer(r.id, r.avatar, r.name, r.id === opts.meId);
    });
    if (opts.meId && this.slots.has(opts.meId)) {
      this.me = newPlayer(this.level, this.slots.get(opts.meId)!, opts.racers.length);
      if (opts.startCheckpoint) {
        this.me.checkpoint = Math.max(0, Math.min(this.level.checkpoints.length - 1, opts.startCheckpoint));
        spawnPoint(this.level, this.me.checkpoint, this.me.slot, this.me.slots, this.me);
      }
      this.prev.x = this.me.x;
      this.prev.y = this.me.y;
      this.prev.z = this.me.z;
    }
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  resize() {
    const c = this.opts.canvas;
    const w = c.clientWidth || window.innerWidth;
    const h = c.clientHeight || window.innerHeight;
    this.scene.resize(w, h, window.devicePixelRatio || 1);
  }

  /** The thumb stick: x to the right, y down the screen, length up to 1 */
  setStick(x: number, y: number) {
    this.stick.x = x;
    this.stick.y = y;
  }

  press(button: "jump" | "dive", down: boolean) {
    this.keys[down ? "add" : "delete"](button === "jump" ? "Touch:jump" : "Touch:dive");
  }

  /** What another racer's device last said */
  setRemote(id: string, state: NetState) {
    if (id === this.opts.meId) return;
    let buf = this.remote.get(id);
    if (!buf) this.remote.set(id, (buf = []));
    const last = buf[buf.length - 1];
    if (last && state.rt <= last.rt) return;
    buf.push(state);
    if (buf.length > 8) buf.shift();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    this.keys.add(e.code);
    if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onBlur = () => {
    this.keys.clear();
    this.stick.x = this.stick.y = 0;
  };

  private readInput() {
    const k = this.keys;
    let mx = this.stick.x;
    let mz = this.stick.y;
    if (k.has("ArrowLeft") || k.has("KeyA")) mx -= 1;
    if (k.has("ArrowRight") || k.has("KeyD")) mx += 1;
    if (k.has("ArrowUp") || k.has("KeyW")) mz -= 1;
    if (k.has("ArrowDown") || k.has("KeyS")) mz += 1;
    const l = Math.hypot(mx, mz);
    if (l > 1) {
      mx /= l;
      mz /= l;
    }
    this.input.mx = mx;
    this.input.mz = mz;
    this.input.jump = k.has("Space") || k.has("Touch:jump");
    this.input.dive = k.has("ShiftLeft") || k.has("ShiftRight") || k.has("KeyE") || k.has("Touch:dive");
  }

  private frame = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const t = this.opts.raceTime();
    const level = this.level;
    const me = this.me;

    // The countdown's beeps
    const count = t < 0 ? Math.ceil(-t) : 0;
    if (count !== this.lastCount) {
      if (count >= 1 && count <= 3) sfx.count();
      else if (count === 0 && this.lastCount === 1) sfx.go();
      this.lastCount = count;
    }

    if (me) {
      this.readInput();
      if (t <= 0) {
        this.simT = 0;
      } else {
        // Time away (a hidden tab, a call) is not played back: the racer stood where they were
        if (t - this.simT > 0.5) this.simT = t - STEP;
        let n = 0;
        while (this.simT + STEP <= t && n < 8) {
          this.prev.x = me.x;
          this.prev.y = me.y;
          this.prev.z = me.z;
          step(level, me, this.input, this.simT, STEP);
          this.simT += STEP;
          n++;
          const ev = me.events;
          if (ev) {
            if (ev & EV_JUMP) sfx.jump();
            if (ev & EV_DIVE) sfx.dive();
            if (ev & EV_LAND) sfx.land();
            if (ev & EV_BOUNCE) sfx.bounce();
            if (ev & EV_CHECKPOINT) sfx.checkpoint();
            if (ev & EV_HIT) {
              sfx.hit();
              this.scene.bump(0.3);
              // A browser refuses a buzz before the first tap, and says so in the console
              if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(40);
            }
            if (ev & EV_FALL) sfx.fall();
            if (ev & EV_FINISH && this.finishedAt < 0) {
              this.finishedAt = this.simT;
              sfx.finish();
              this.opts.onFinish?.(this.simT);
            }
          }
          // A respawn is a jump, not a glide
          if (me.mode === MODE_RUN && Math.abs(me.z - this.prev.z) + Math.abs(me.x - this.prev.x) > 3) {
            this.prev.x = me.x;
            this.prev.y = me.y;
            this.prev.z = me.z;
          }
        }
      }
      // Drawn between the last two steps, so a display that is not in step with the physics still moves evenly
      const a = t <= 0 ? 1 : Math.max(0, Math.min(1, (t - this.simT) / STEP));
      const x = this.prev.x + (me.x - this.prev.x) * a;
      const y = this.prev.y + (me.y - this.prev.y) * a;
      const z = this.prev.z + (me.z - this.prev.z) * a;
      this.scene.placeRacer(this.opts.meId!, x, y, z, me.mode, me.grounded, me.shield, t, dt);
      if (me.mode !== MODE_RESPAWN) {
        this.focus.x = x;
        this.focus.y = y;
        this.focus.z = z;
      }

      if (t > 0 && now - this.lastSend >= (this.opts.sendEvery ?? 200) && (this.finishedAt < 0 || this.simT - this.finishedAt < 2)) {
        this.lastSend = now;
        this.opts.onSend?.({
          x: round2(me.x),
          y: round2(me.y),
          z: round2(me.z),
          m: me.mode,
          g: me.grounded,
          p: me.mode === MODE_DONE ? 1 : Math.round(progressOf(level, me.x, me.y, me.z) * 1000) / 1000,
          rt: round2(this.simT),
        });
      }
    }

    // Everyone else, a moment in the past
    const viewT = t - VIEW_DELAY;
    const progress: Record<string, number> = {};
    let leader: string | null = null;
    let leaderP = -1;
    for (const r of this.opts.racers) {
      if (r.id === this.opts.meId && me) {
        progress[r.id] = me.mode === MODE_DONE ? 1 : progressOf(level, me.x, me.y, me.z);
        continue;
      }
      const buf = this.remote.get(r.id);
      if (!buf || buf.length === 0 || t <= 0) {
        spawnPoint(level, 0, this.slots.get(r.id) ?? 0, this.opts.racers.length, this.scratch);
        this.scene.placeRacer(r.id, this.scratch.x, this.scratch.y, this.scratch.z, MODE_RUN, true, 0, t, dt);
        progress[r.id] = 0;
        continue;
      }
      let i = buf.length - 1;
      while (i > 0 && buf[i - 1].rt > viewT) i--;
      const b = buf[i];
      const a = i > 0 ? buf[i - 1] : b;
      let u = b.rt > a.rt ? (viewT - a.rt) / (b.rt - a.rt) : 1;
      u = Math.max(0, Math.min(1, u));
      // Across a respawn there is nothing in between to draw
      const jump = Math.abs(b.z - a.z) + Math.abs(b.x - a.x) > 9 || a.m === MODE_RESPAWN;
      if (jump) u = u < 0.5 ? 0 : 1;
      const x = a.x + (b.x - a.x) * u;
      const y = a.y + (b.y - a.y) * u;
      const z = a.z + (b.z - a.z) * u;
      const latest = buf[buf.length - 1];
      this.scene.placeRacer(r.id, x, y, z, u < 0.5 ? a.m : b.m, u < 0.5 ? a.g : b.g, 0, t, dt);
      progress[r.id] = latest.p;
      if (latest.m !== MODE_DONE && latest.p > leaderP) {
        leaderP = latest.p;
        leader = r.id;
        this.scratch.x = x;
        this.scratch.y = y;
        this.scratch.z = z;
      }
    }

    // With no racer of one's own to follow, or once across the line: watch whoever leads those still out
    let watching: string | null = null;
    const done = !!me && me.mode === MODE_DONE && this.simT - this.finishedAt > 2.5;
    if ((!me || done) && leader) {
      watching = leader;
      this.focus.x = this.scratch.x;
      this.focus.y = this.scratch.y;
      this.focus.z = this.scratch.z;
    } else if (!me && !leader) {
      spawnPoint(level, 0, 0, 1, this.focus);
    }

    const swing = t < 0 ? Math.max(0, Math.min(1, -t / 2.6)) : 0;
    this.scene.render(t, dt, this.focus, swing);

    if (this.opts.onHud && now - this.lastHud > 120) {
      this.lastHud = now;
      const mine = this.opts.meId ? progress[this.opts.meId] ?? 0 : 0;
      let place = 1;
      for (const r of this.opts.racers) if (r.id !== this.opts.meId && (progress[r.id] ?? 0) > mine) place++;
      this.opts.onHud({
        t,
        place,
        racing: this.opts.racers.length,
        progress,
        finished: !!me && me.mode === MODE_DONE,
        checkpoint: me?.checkpoint ?? 0,
        falls: me?.falls ?? 0,
        watching,
      });
    }
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.scene.dispose();
  }
}
