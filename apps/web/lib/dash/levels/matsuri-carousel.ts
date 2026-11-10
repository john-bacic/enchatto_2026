// Level 8, Matsuri Carousel: a festival. Two carousels to ride from hub to hub, fireworks going up through the
// path, a big wheel up to the top and a slide back down, and the dance floor that never stops turning.

import { LevelBuilder, MINT, MINT_SOFT, PAPER, PINK, PINK_SOFT, RED, VIOLET, WHITE, YELLOW, YELLOW_SOFT, orbit, spin, wheel } from "../build";
import type { Level } from "../types";

export function matsuriCarousel(): Level {
  const WOOD = "#fff0d4";
  const ORANGE = "#ff9a5c";
  const b = new LevelBuilder(
    "matsuri-carousel",
    { en: "Matsuri Carousel", ja: "おまつりカルーセル" },
    { en: "Ride the rides. Mind the fireworks!", ja: "乗りものに乗って進め。花火に注意！" },
    { sky: ["#ffc7d6", PAPER], fog: "#fff0ea", floor: WOOD, floorAlt: PINK_SOFT, accent: ORANGE, accent2: VIOLET },
    140
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: PINK_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: two carousels, turning opposite ways. Step on a seat as it passes, and change where they meet
  const TAU = Math.PI * 2;
  [[17.5, 0.8], [31.5, -0.8]].forEach(([d, speed], c) => {
    b.cyl(0, 0, d, 1.4, 1, { look: "drum", color: c ? YELLOW : RED });
    for (let k = 0; k < 3; k++) {
      orbit(b.cyl(0, 0, d, 1.7, 0.6, { look: "plate", color: k % 2 ? YELLOW_SOFT : WHITE }), 5, speed, (k / 3) * TAU + c * 0.6, false);
    }
    b.way(0, 0, d);
  });
  b.way(0, 0, 37);

  b.box(0, 0, 42.2, 12, 1, 7.6, { color: PINK_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: fireworks. Each mortar sends its shell straight up through the path and catches it again
  b.box(0, 0, 62, 7, 1, 32);
  const rows = [[-2.2, 2.2], [0], [-2.2, 0], [2.2], [0, 2.2], [-2.2]];
  rows.forEach((xs, i) => {
    const d = 51 + i * 5;
    xs.forEach((x, k) => {
      b.cyl(x, 0.2, d, 0.55, 0.2, { look: "bumper", color: i % 2 ? VIOLET : ORANGE });
      b.shuttle(0.75, [x, -4.6, d], [x, 3.6, d], 2.2 + (i % 3) * 0.3, i * 0.23 + k * 0.5, {
        look: "shot",
        color: [YELLOW, PINK, MINT][(i + k) % 3],
        power: 9,
      });
    });
  });

  b.box(0, 0, 81.75, 12, 1, 7.5, { color: PINK_SOFT });
  b.checkpoint(0, 0, 80.5, 8);

  // C: the big wheel. A gondola leaves the ground here and is level with the high deck a quarter turn on
  const HUB = 88.5;
  const R = 6;
  for (let k = 0; k < 6; k++) {
    wheel(b.box(0, R, HUB, 2.8, 0.4, 2.8, { look: "tile", color: [PINK_SOFT, YELLOW_SOFT, MINT_SOFT][k % 3] }), R, 0.45, (k / 6) * TAU);
  }
  for (const x of [-3.3, 3.3]) b.box(x, R + 0.4, HUB, 0.5, R + 7.4, 0.5, { look: "wall", color: ORANGE });
  b.box(0, R + 0.4, HUB, 7.1, 0.8, 0.8, { look: "bar", color: YELLOW });
  b.box(0, 6, 99.2, 8, 1, 5.6);
  b.way(0, 0, HUB);
  b.way(0, 6, HUB + R);
  b.way(0, 6, 99.2);
  // and the slide back down, under the paper lanterns
  b.ramp(0, 102, 114, 6, 0, 8, { look: "ice", color: "#ffe3ef", surface: { ice: true } });
  b.lantern(0, 10.4, 106, 6.4, 0.8, 2.8, 0, PINK);
  b.lantern(0, 7.9, 111, 6.4, 0.8, 2.8, 0.5, YELLOW);

  b.box(0, 0, 117, 12, 1, 6, { color: PINK_SOFT });
  b.checkpoint(0, 0, 116.5, 8);

  // D: the dance floor turns, and its spokes turn with it. Round the drum tower, then up the steps
  const FLOOR = 128;
  spin(b.cyl(0, 0, FLOOR, 7.2, 0.8, { look: "disc", color: YELLOW_SOFT }), 0.7, 0);
  for (let k = 0; k < 4; k++) {
    orbit(b.box(0, 0.9, FLOOR, 4.4, 0.9, 0.5, { look: "wall", color: k % 2 ? PINK : MINT, bumper: 5.5 }), 3.6, 0.7, (k / 4) * TAU, true);
  }
  b.cyl(0, 3, FLOOR, 1.2, 3, { look: "drum", color: RED });
  b.way(4.2, 0, FLOOR);
  b.box(0, 0, 139, 8, 1, 6);
  b.lantern(0, 7.6, 139, 6.6, 0.8, 3, 0.2, VIOLET);
  const STEP = 0.35;
  for (let k = 1; k <= 4; k++) b.box(0, k * STEP, 141.4 + k * 1.2, 8, k * STEP + 1, 1.2, { color: k % 2 ? WOOD : YELLOW_SOFT });
  b.way(0, 0, 139);

  b.box(0, 4 * STEP, 153.4, 12, 1, 13.2, { look: "finish", color: WHITE });
  b.finish(0, 4 * STEP, 156, 12, 8);

  for (let d = 6; d < 160; d += 15) {
    b.deco("lantern", d % 2 ? -9.5 : 9.5, 5 + (d % 3), d, 1.3, d % 3 ? RED : YELLOW);
    b.deco("flag", d % 2 ? 10 : -10, 3 + (d % 4), d + 6, 1.3, d % 3 ? PINK : MINT);
    b.deco("cloud", d % 2 ? 15 : -15, 9 + (d % 4), d + 8, 2.4, WHITE);
  }
  return b.build();
}
