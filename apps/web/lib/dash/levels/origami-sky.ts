// Level 5, Origami Sky: paper tiles that fold away under you, paper balls fired across the bridge,
// turning crosses to climb, and a little of everything before the finish.

import { LevelBuilder, PAPER, PINK, VIOLET, VIOLET_SOFT, WHITE, YELLOW, YELLOW_SOFT, RED, MINT_SOFT, blink, slide, spin } from "../build";
import type { Level } from "../types";

export function origamiSky(): Level {
  const LILAC = "#f4ecff";
  const b = new LevelBuilder(
    "origami-sky",
    { en: "Origami Sky", ja: "おりがみスカイ" },
    { en: "The floor folds away. Keep moving!", ja: "ゆかが消える！止まるな！" },
    { sky: ["#e2d4ff", PAPER], fog: "#f6efff", floor: LILAC, floorAlt: YELLOW_SOFT, accent: VIOLET, accent2: YELLOW },
    140
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: a checkerboard of tiles. Half of them are there at any moment
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const even = (row + col) % 2 === 0;
      b.box(-4.05 + col * 2.7, 0, 12 + row * 3.7, 2.4, 0.5, 3.4, {
        look: "tile",
        color: even ? VIOLET_SOFT : YELLOW_SOFT,
        active: blink(4.4, 2.7, even ? 0 : 0.5),
      });
    }
  }

  b.box(0, 0, 43, 12, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: paper balls fired across the bridge from both sides
  b.box(0, 0, 62, 5, 1, 32);
  [51, 57, 63, 69, 75].forEach((d, i) => {
    const from = i % 2 ? 10 : -10;
    b.roller(0.7, [from, 0.25, d], [-from, 0.25, d], 2.1, i * 0.37, { look: "shot", color: i % 2 ? YELLOW : WHITE, power: 12 });
    b.deco("plane", from * 1.12, 0.6, d, 1.4, i % 2 ? PINK : VIOLET);
  });
  slide(b.box(5.2, 1.1, 54, 2.4, 1.1, 1.8, { look: "pusher", color: PINK }), -3.6, 0, 0, 2.8, 0.2);
  slide(b.box(-5.2, 1.1, 66, 2.4, 1.1, 1.8, { look: "pusher", color: PINK }), 3.6, 0, 0, 2.8, 0.6);

  b.box(0, 0, 81, 12, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 80.5, 8);

  // C: three turning crosses, each higher than the last
  const crosses = [[90, 0, 0.7], [100, 1.2, -0.8], [110, 2.4, 0.9]] as const;
  crosses.forEach(([d, top, speed], i) => {
    const color = i % 2 ? YELLOW_SOFT : VIOLET_SOFT;
    spin(b.box(0, top, d, 8, 0.6, 1.9, { look: "tile", color }), speed, i);
    spin(b.box(0, top, d, 1.9, 0.6, 8, { look: "tile", color }), speed, i);
    b.way(0, top, d);
  });

  b.box(0, 3, 119, 9, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 3, 118.5, 7);

  // D: a sweeper, a folding bridge, a drum, and up to the finish
  b.box(0, 3, 126, 8, 1, 8);
  spin(b.box(0, 3.8, 126, 7.4, 0.72, 0.5, { look: "bar", color: RED, bumper: 9, tumble: true }), 2.2, 1);
  b.cyl(0, 4.2, 126, 0.5, 1.2, { look: "bumper", color: YELLOW });
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      const even = (row + col) % 2 === 0;
      b.box(col ? 1.45 : -1.45, 3, 131.6 + row * 3, 2.7, 0.5, 2.8, {
        look: "tile",
        color: even ? VIOLET_SOFT : MINT_SOFT,
        active: blink(3.6, 2.3, even ? 0 : 0.5),
      });
    }
  }
  b.box(0, 3, 146, 7, 1, 7);
  b.cyl(0, 3.3, 147.3, 1.6, 1.2, { look: "drum", color: RED, surface: { bounce: 14.5 } });
  b.way(0, 3, 131);
  b.way(0, 3, 142.5);
  b.way(0, 3.3, 147.3);

  b.box(0, 5.5, 157, 11, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 5.5, 158, 11, 8);

  for (let d = 6; d < 165; d += 14) {
    b.deco("plane", d % 2 ? -11 : 11, 4 + (d % 5), d, 1.2, d % 3 ? VIOLET : PINK);
    b.deco("cloud", d % 2 ? 14 : -14, 8 + (d % 4), d + 5, 2.4, WHITE);
  }
  return b.build();
}
