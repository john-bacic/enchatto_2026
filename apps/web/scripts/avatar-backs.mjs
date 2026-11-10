// Draws every avatar from behind, for Chatto Dash: a racer running away from the camera shows its back.
//
//   node scripts/avatar-backs.mjs            every avatar
//   node scripts/avatar-backs.mjs cat bee    only these
//
// Reads public/icons/av-<icon>.png and writes public/icons/av-<icon>-back.png. A back is the front with its face
// taken off (the picture healed over where the eyes, mouth and cheeks were), mirrored as something seen from the
// other side is, and given whatever that character shows from behind: a tail, mostly. What comes off and what goes
// on is each character's recipe below. Measurements are in the front picture's own pixels (180 across), before
// it is mirrored.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPng, writePng } from "./png.mjs";

const ICONS = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/icons");
const INK = [88, 64, 48];
/** Half the width of the pictures' own outline */
const LINE = 2.4;

const lum = (r, g, b) => r * 0.299 + g * 0.587 + b * 0.114;

class Art {
  /** `from` is the picture it is drawn from, when that is another avatar's */
  constructor(icon, from = icon) {
    const { width, height, data } = readPng(path.join(ICONS, `av-${from}.png`));
    this.icon = icon;
    this.w = width;
    this.h = height;
    this.px = Float32Array.from(data);
    this.study();
  }

  at(x, y) {
    return (y * this.w + x) * 4;
  }

  /** Which pixels are ink, which ink is the outline (it touches the outside) and which is drawn inside the body */
  study() {
    const { w, h, px } = this;
    const n = w * h;
    this.solid = new Uint8Array(n);
    this.ink = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      this.solid[i] = px[i * 4 + 3] >= 128 ? 1 : 0;
      this.ink[i] = this.solid[i] && lum(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) < 118 ? 1 : 0;
    }
    // The body's own colour: the commonest that is not ink
    const seen = new Map();
    for (let i = 0; i < n; i++) {
      if (!this.solid[i] || this.ink[i]) continue;
      const key = ((px[i * 4] >> 2) << 12) | ((px[i * 4 + 1] >> 2) << 6) | (px[i * 4 + 2] >> 2);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const [most] = [...seen].sort((a, b) => b[1] - a[1])[0] ?? [0];
    this.body = [((most >> 12) << 2) + 2, (((most >> 6) & 63) << 2) + 2, ((most & 63) << 2) + 2];
    // Ink pixels in touching groups
    this.group = new Int32Array(n).fill(-1);
    this.groups = [];
    const stack = [];
    for (let start = 0; start < n; start++) {
      if (!this.ink[start] || this.group[start] >= 0) continue;
      const g = { id: this.groups.length, size: 0, x0: w, y0: h, x1: 0, y1: 0, outline: false };
      this.groups.push(g);
      this.group[start] = g.id;
      stack.push(start);
      while (stack.length) {
        const i = stack.pop();
        const x = i % w;
        const y = (i / w) | 0;
        g.size++;
        g.x0 = Math.min(g.x0, x);
        g.x1 = Math.max(g.x1, x);
        g.y0 = Math.min(g.y0, y);
        g.y1 = Math.max(g.y1, y);
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
              g.outline = true;
              continue;
            }
            const j = ny * w + nx;
            if (!this.solid[j]) g.outline = true;
            else if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && this.ink[j] && this.group[j] < 0) {
              this.group[j] = g.id;
              stack.push(j);
            }
          }
        }
      }
    }
  }

  /** The marks drawn inside the body (eyes, a mouth, a nose), optionally only those inside a box */
  marks(box) {
    return this.groups.filter(
      (g) => !g.outline && (!box || (g.x0 >= box[0] && g.y0 >= box[1] && g.x1 <= box[2] && g.y1 <= box[3]))
    );
  }

  /** A mask of the pixels near any ink of the outline */
  nearOutline(reach) {
    const { w, h } = this;
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const g = this.group[y * w + x];
        if (g < 0 || !this.groups[g].outline) continue;
        for (let dy = -reach; dy <= reach; dy++) {
          for (let dx = -reach; dx <= reach; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) out[ny * w + nx] = 1;
          }
        }
      }
    }
    return out;
  }

  /**
   * Takes the face off: finds the marks drawn inside the body and heals over a box round them, and over anything
   * pink that is not the body's own colour (cheeks, the inside of an ear, a tummy). `within` keeps the search for
   * marks to a box, `grow` is how far past the marks the healing goes ([sideways, up, down]), `box` heals an exact
   * box and looks for no marks, `pink: false` leaves the pink alone, `warm` takes anything redder than the body
   * (a blush on yellow is more orange than pink).
   */
  face({ within, grow = [10, 6, 8], box, pink = true, warm = false } = {}) {
    let area = box;
    if (!area) {
      const marks = this.marks(within);
      if (marks.length === 0) console.warn(`${this.icon}: no face found`);
      else {
        area = [
          Math.min(...marks.map((g) => g.x0)) - grow[0],
          Math.min(...marks.map((g) => g.y0)) - grow[1],
          Math.max(...marks.map((g) => g.x1)) + grow[0],
          Math.max(...marks.map((g) => g.y1)) + grow[2],
        ];
      }
    }
    const { w, h, px } = this;
    const rosy = new Uint8Array(w * h);
    if (pink) {
      const zone = Array.isArray(pink) ? pink : [0, 0, w, h];
      for (let y = zone[1]; y < zone[3]; y++) {
        for (let x = zone[0]; x < zone[2]; x++) {
          const i = y * w + x;
          if (!this.solid[i] || this.ink[i]) continue;
          const [r, g, b] = [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]];
          const off = Math.hypot(r - this.body[0], g - this.body[1], b - this.body[2]);
          const rosier = warm ? r - g >= this.body[0] - this.body[1] + 10 : r - g >= 14 && b - g >= -10;
          if (!rosier || off < 12) continue;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (x + dx >= 0 && y + dy >= 0 && x + dx < w && y + dy < h) rosy[(y + dy) * w + x + dx] = 1;
            }
          }
        }
      }
    }
    return this.heal((x, y) => rosy[y * w + x] || (area && x >= area[0] && x <= area[2] && y >= area[1] && y <= area[3]));
  }

  /** Heals over an ellipse */
  erase(cx, cy, rx, ry = rx, opts) {
    return this.heal((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, opts);
  }

  /**
   * Paints over the chosen pixels with what surrounds them, as if nothing had been drawn there. The outline is
   * never touched and never bleeds in, unless `force` says the outline goes too.
   */
  heal(chosen, { force = false } = {}) {
    const { w, h, px } = this;
    const edge = this.nearOutline(1);
    const dark = this.nearOutline(2);
    const todo = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (this.solid[i] && (force || !edge[i]) && chosen(x, y)) todo[i] = 1;
      }
    }
    // Good paint to spread from: the body itself, clear of any ink
    const known = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) known[i] = this.solid[i] && !todo[i] && !dark[i] && !this.ink[i] ? 1 : 0;
    // The marks' own soft edges are not good paint either
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!this.ink[i]) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) known[Math.min(w * h - 1, Math.max(0, i + dy * w + dx))] = 0;
      }
    }
    // Inwards from the rim, each ring taking the average of the paint already beside it
    let left = todo.reduce((a, b) => a + b, 0);
    while (left > 0) {
      const ring = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (!todo[i]) continue;
          let r = 0;
          let g = 0;
          let b = 0;
          let k = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
              const j = ny * w + nx;
              if (!known[j]) continue;
              r += px[j * 4];
              g += px[j * 4 + 1];
              b += px[j * 4 + 2];
              k++;
            }
          }
          if (k) ring.push([i, r / k, g / k, b / k]);
        }
      }
      if (ring.length === 0) break; // walled in by ink: left as drawn
      for (const [i, r, g, b] of ring) {
        px[i * 4] = r;
        px[i * 4 + 1] = g;
        px[i * 4 + 2] = b;
        px[i * 4 + 3] = 255;
        todo[i] = 0;
        known[i] = 2;
        this.ink[i] = 0;
        this.group[i] = -1;
      }
      left -= ring.length;
    }
    // Then smoothed, so no seam shows where two sides met
    for (let pass = 0; pass < 40; pass++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (known[i] !== 2) continue;
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            let k = 0;
            for (const j of [i - 1, i + 1, i - w, i + w]) {
              if (!known[j]) continue;
              sum += px[j * 4 + c];
              k++;
            }
            if (k) px[i * 4 + c] = sum / k;
          }
        }
      }
    }
    return this;
  }

  /** Where the body is: its box and the middle of it */
  get bounds() {
    const { w, h } = this;
    let [x0, y0, x1, y1] = [w, h, 0, 0];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!this.solid[y * w + x]) continue;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  /** The body's colour at a point */
  colour(x, y) {
    const i = this.at(Math.round(x), Math.round(y));
    return [this.px[i], this.px[i + 1], this.px[i + 2]];
  }

  /**
   * Paints a shape given as a distance: negative inside, positive outside, in pixels. Filled with `fill` and
   * outlined in ink. `under` paints it behind what is already drawn; `line: 0` leaves the outline off.
   */
  paint(distance, box, { fill = null, line = LINE * 2, under = false, ink = INK } = {}) {
    const { w, h, px } = this;
    const [x0, y0, x1, y1] = box.map((v, n) => Math.max(0, Math.min(n % 2 ? h - 1 : w - 1, Math.round(v))));
    const put = (i, colour, cover) => {
      if (cover <= 0) return;
      const a = px[i + 3] / 255;
      if (under) {
        const out = a + cover * (1 - a);
        for (let c = 0; c < 3; c++) px[i + c] = (px[i + c] * a + colour[c] * cover * (1 - a)) / (out || 1);
        px[i + 3] = out * 255;
      } else {
        const out = cover + a * (1 - cover);
        for (let c = 0; c < 3; c++) px[i + c] = (colour[c] * cover + px[i + c] * a * (1 - cover)) / (out || 1);
        px[i + 3] = out * 255;
      }
    };
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = distance(x + 0.5, y + 0.5);
        const i = this.at(x, y);
        const inside = Math.max(0, Math.min(1, 0.5 - d));
        const lined = Math.max(0, Math.min(1, 0.5 - (d - line)));
        if (under) {
          // Behind: the fill first where it shows, then the line round it
          if (fill) put(i, fill, inside);
          if (line) put(i, ink, lined);
        } else {
          if (line) put(i, ink, lined);
          if (fill) put(i, fill, inside);
        }
      }
    }
    return this;
  }

  /** A blob along a run of points [x, y, radius]: a tail, an ear, a tuft */
  blob(points, opts) {
    const reach = Math.max(...points.map((p) => p[2])) + 8;
    const box = [
      Math.min(...points.map((p) => p[0])) - reach,
      Math.min(...points.map((p) => p[1])) - reach,
      Math.max(...points.map((p) => p[0])) + reach,
      Math.max(...points.map((p) => p[1])) + reach,
    ];
    const distance = (x, y) => {
      let best = Infinity;
      if (points.length === 1) return Math.hypot(x - points[0][0], y - points[0][1]) - points[0][2];
      for (let n = 0; n < points.length - 1; n++) {
        const [ax, ay, ar] = points[n];
        const [bx, by, br] = points[n + 1];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t) - (ar + (br - ar) * t));
      }
      return best;
    };
    return this.paint(distance, box, opts);
  }

  /** A blob along a smooth curve through control points [x, y, radius] (a quadratic or cubic Bézier) */
  curve(control, opts) {
    const points = [];
    const mix = (a, b, t) => a.map((v, n) => v + (b[n] - v) * t);
    for (let step = 0; step <= 24; step++) {
      let level = control;
      while (level.length > 1) level = level.slice(0, -1).map((p, n) => mix(p, level[n + 1], step / 24));
      points.push(level[0]);
    }
    return this.blob(points, opts);
  }

  /** An ink line through points [x, y] */
  stroke(points, width = LINE * 2) {
    return this.blob(points.map(([x, y]) => [x, y, width / 2]), { fill: INK, line: 0 });
  }

  /** Rubs out a shape (a distance, as for `paint`) entirely, outline and all */
  rub(distance) {
    const { w, h, px } = this;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) px[this.at(x, y) + 3] *= Math.max(0, Math.min(1, distance(x + 0.5, y + 0.5) + 0.5));
    }
    this.study();
    return this;
  }

  save() {
    const { w, h, px } = this;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const from = this.at(w - 1 - x, y);
        const to = this.at(x, y);
        for (let c = 0; c < 4; c++) data[to + c] = Math.round(px[from + c]);
        if (data[to + 3] === 0) data[to] = data[to + 1] = data[to + 2] = 0;
      }
    }
    const file = path.join(ICONS, `av-${this.icon}-back.png`);
    writePng(file, { width: w, height: h, data });
    return file;
  }
}

// Shapes, as distances, for Art.paint
/** A polygon with its corners rounded off by `round` */
const polygon = (points, round = 0) => (x, y) => {
  let best = Infinity;
  let inside = false;
  for (let n = 0, m = points.length - 1; n < points.length; m = n++) {
    const [ax, ay] = points[n];
    const [bx, by] = points[m];
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
    best = Math.min(best, Math.hypot(x - ax - (bx - ax) * t, y - ay - (by - ay) * t));
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return (inside ? -best : best) - round;
};
/** Points winding in (or out) round a middle, for Art.blob: a curly tail */
const spiral = (cx, cy, r0, r1, from, to, width) =>
  Array.from({ length: 41 }, (_, n) => {
    const angle = from + ((to - from) * n) / 40;
    const radius = r0 + ((r1 - r0) * n) / 40;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, width];
  });
const star = (cx, cy, size, points = 5, inner = 0.5, turn = -Math.PI / 2) =>
  polygon(
    Array.from({ length: points * 2 }, (_, n) => {
      const angle = turn + (n * Math.PI) / points;
      const reach = (n % 2 ? inner : 1) * size * 0.8;
      return [cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach];
    }),
    size * 0.2
  );
const around = (cx, cy, reach) => [cx - reach, cy - reach, cx + reach, cy + reach];

/** A round tail on the middle of the back */
const puff = (a, y, r, fill = a.body) => a.blob([[a.bounds.cx, y, r]], { fill });

const TEAR = [176, 206, 250];
/** A tear flying off to one side (-1 or 1) of a round face */
const tear = (a, side, y) =>
  a.blob([[89 + side * 77, y - 11, 0.8], [89 + side * 82, y, 4.6]], { fill: TEAR, line: 3.6 });

/** The avatars drawn from another's picture: the round faces are one ball from behind */
const FROM = { sob: "blush", teary: "blush", dizzy: "blush", lovey: "blush", cheeky: "blush", grumpy: "blush" };

/** What each avatar shows from behind, by the name of its picture. One with nothing here only loses its face */
const RECIPES = {
  bunny: (a) => puff(a.face(), 137, 13),
  panda: (a) => puff(a.face(), 134, 9),
  bear: (a) => puff(a.face(), 135, 9),
  puppy: (a) => a.face().erase(54, 106, 15, 12).erase(123, 106, 15, 12).blob([[90, 136, 6.5], [90, 123, 4]], { fill: a.body }),
  hamster: (a) => puff(a.face().erase(46, 101, 11, 9), 139, 6),
  cat: (a) => a.face().curve([[84, 147, 6.5], [124, 152, 6], [130, 128, 5.5], [112, 117, 4.5]], { fill: a.body }),
  bluecat: (a) => a.face().curve([[86, 152, 6.5], [122, 156, 6], [128, 132, 5.5], [112, 122, 4.5]], { fill: a.body }),
  pig: (a) => a.face().blob(spiral(90, 125, 11, 2.5, 1.2, 9.6, 2.7), { fill: INK, line: 0 }),
  sheep: (a) => puff(a.face(), 126, 8),
  // Drawn from the side: its beak comes off, and the body's edge is drawn again where the beak joined it
  chick: (a) =>
    a
      .face()
      .rub(polygon([[0, 62], [32.5, 62], [31, 68], [29, 72], [27, 77], [26.5, 84], [26.5, 91], [0, 91]]))
      .stroke([[36.5, 60], [35, 64], [33.5, 68], [31.5, 72], [30, 78], [29.3, 84], [29, 90], [29.5, 98]], 6),
  // Drawn from the side: its head comes off, the shell's edge is drawn again where the neck joined it, and a
  // tail peeps out below
  turtle: (a) => {
    const skin = a.colour(70, 136);
    a.face().rub(
      polygon([[0, 60], [55, 60], [52, 68], [50, 74], [48, 80], [46.3, 87], [45.8, 95], [46, 104], [47.5, 110], [50, 114.5], [53.5, 119.5], [0, 119.5]])
    );
    a.stroke([[57.5, 62], [54.5, 68], [52, 74], [50.5, 80], [49, 86], [48.3, 92], [48.3, 98], [48.6, 104], [49.8, 108.5], [52, 113], [55.5, 117.5]], 5.4);
    a.blob([[106, 127, 5], [106, 139, 2]], { fill: skin, under: true });
  },
  // What it is eating is in front of it: healed over, and the body's edge drawn again where the food met it
  muncher: (a) => {
    const food = polygon([[28, 114], [38, 97], [60, 93], [77, 99], [79, 137.5], [60, 140], [44, 138], [33, 132], [27, 125]]);
    a.face().heal((x, y) => food(x + 0.5, y + 0.5) < 0, { force: true });
    a.stroke([[13.5, 107], [15, 113], [18, 119], [21.5, 125], [25, 128.5], [31, 132.5], [38, 136.5], [46, 139.5], [56, 141.2], [82, 141.5]], 5.8);
  },
  // Its seeds stay
  melon: (a) => a.face({ box: [84, 88, 134, 120], pink: false }),
  // The back of a flower head: no seeds, a green cup where the stem joins
  sunflower: (a) => a.face().paint(star(90, 96, 21, 8, 0.72), around(90, 96, 34), { fill: [178, 216, 150] }),
  moon: (a) => a.face({ warm: true }),
  smiley: (a) => a.face({ warm: true }),
  bulb: (a) => a.face({ warm: true }),
  sob: (a) => {
    a.face();
    for (const side of [-1, 1]) tear(tear(a, side, 84), side, 108);
  },
  teary: (a) => tear(a.face(), -1, 100),
};

const DEFAULT = (a) => a.face();

// The avatars the app has, read from its own list so none is missed
const types = fs.readFileSync(path.join(ICONS, "../../lib/types.ts"), "utf8");
const all = [...types.matchAll(/icon: "([a-z]+)"/g)].map((m) => m[1]);
const asked = process.argv.slice(2);
for (const icon of asked.length ? asked : all) {
  const art = new Art(icon, FROM[icon]);
  (RECIPES[icon] ?? DEFAULT)(art);
  art.save();
}
console.log(`${(asked.length ? asked : all).length} backs drawn`);

