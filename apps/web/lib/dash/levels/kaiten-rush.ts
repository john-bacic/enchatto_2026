// Level 1, Kaiten Rush: a conveyor-belt sushi bar. Belts carry you forward, back and sideways.

import { BLUE_SOFT, LevelBuilder, MINT, MINT_SOFT, PAPER, PINK, PINK_SOFT, RED, WHITE, YELLOW, YELLOW_SOFT, slide, spin } from "../build";
import type { Level } from "../types";

export function kaitenRush(): Level {
  const b = new LevelBuilder(
    "kaiten-rush",
    { en: "Kaiten Rush", ja: "回転ずしラッシュ" },
    { en: "Ride the belts. Mind the plates!", ja: "ベルトに乗って進め。お皿に注意！" },
    { sky: ["#ffd9e8", PAPER], fog: "#fff1e6", floor: YELLOW_SOFT, floorAlt: PINK_SOFT, accent: PINK, accent2: MINT },
    110
  );

  // Start
  b.box(0, 0, 3.5, 12, 1, 13, { color: PINK_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: three belts side by side. Left is the express with plates to dodge, the middle runs against you,
  // the right is slow and has pushers
  b.box(-3.6, 0, 25, 3.2, 1, 30, { look: "belt", color: MINT_SOFT, surface: { conveyor: [0, -3] } });
  b.box(0, 0, 25, 3.2, 1, 30, { look: "belt", color: PINK_SOFT, surface: { conveyor: [0, 3] } });
  b.box(3.6, 0, 25, 3.2, 1, 30, { look: "belt", color: BLUE_SOFT, surface: { conveyor: [0, -1.2] } });
  for (const [x, d] of [[-4.3, 17], [-2.9, 26], [-4.3, 35]] as const) {
    b.cyl(x, 0.9, d, 0.7, 0.9, { look: "plate", color: WHITE, bumper: 7 });
  }
  // The counter's edge: a plate can bump you about, but not off the express belt
  b.box(-5.4, 0.9, 25, 0.4, 0.9, 30, { look: "rail", color: PINK });
  for (const [d, phase] of [[18, 0], [28, 0.5]] as const) {
    slide(b.box(6.4, 1.1, d, 2.4, 1.1, 2.2, { look: "pusher", color: PINK }), -3.4, 0, 0, 2.6, phase);
  }
  b.way(-3.6, 0, 11);
  b.way(-2.7, 0, 17);
  b.way(-4.5, 0, 26);
  b.way(-2.7, 0, 35);

  b.box(0, 0, 43, 12, 1, 6, { color: PINK_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: belts that run across the course, with nothing at their ends
  const across = [4, -4, -4, 4, 4, -4, 4, -4, -4, 4];
  across.forEach((v, i) => {
    b.box(0, 0, 47.5 + i * 3, 11, 1, 3, { look: "belt", color: i % 2 ? MINT_SOFT : YELLOW_SOFT, surface: { conveyor: [v, 0] } });
  });
  for (const [x, d] of [[-2, 52], [2.5, 58], [-3, 64], [1, 70], [-0.5, 61]] as const) {
    b.cyl(x, 1.1, d, 0.5, 1.1, { look: "bumper", color: RED, bumper: 6.5 });
  }

  b.box(0, 0, 79, 12, 1, 6, { color: PINK_SOFT });
  b.checkpoint(0, 0, 78.5, 8);

  // C: plates gliding over the drop, with an island to rest on between them
  slide(b.cyl(-3.5, 0, 86, 2.2, 0.6, { look: "plate", color: WHITE }), 7, 0, 0, 5.2, 0);
  b.box(0, 0, 92, 5, 1, 3.5, { color: MINT_SOFT });
  slide(b.cyl(-3.5, 0, 98, 2.2, 0.6, { look: "plate", color: WHITE }), 7, 0, 0, 4.6, 0.4);
  b.box(0, 0, 104, 5, 1, 3.5, { color: MINT_SOFT });
  slide(b.cyl(-3.5, 0, 110, 2.2, 0.6, { look: "plate", color: WHITE }), 7, 0, 0, 5.6, 0.75);
  b.way(0, 0, 86);
  b.way(0, 0, 92);
  b.way(0, 0, 98);
  b.way(0, 0, 104);
  b.way(0, 0, 110);

  b.box(0, 0, 116, 12, 1, 6, { color: PINK_SOFT });
  b.checkpoint(0, 0, 115.5, 8);

  // D: the express belt, with chopsticks sweeping across it
  b.box(0, 0, 134.5, 9, 1, 31, { look: "belt", color: MINT_SOFT, surface: { conveyor: [0, -4.5] } });
  for (const [d, speed] of [[126, 1.8], [135, -2.1], [144, 2]] as const) {
    spin(b.box(0, 0.8, d, 8.6, 0.72, 0.5, { look: "bar", color: YELLOW, bumper: 9, tumble: true }), speed, d);
    b.cyl(0, 1.2, d, 0.5, 1.2, { look: "bumper", color: PINK });
  }

  b.box(0, 0, 155, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 0, 156, 12, 8);

  for (let d = 8; d < 160; d += 19) {
    b.deco("sushi", d % 2 ? -11 : 11, 1 + (d % 5), d, 1.6, d % 3 ? PINK : MINT);
    b.deco("cloud", d % 2 ? 13 : -13, 6 + (d % 4), d + 8, 2.2, WHITE);
  }
  return b.build();
}
