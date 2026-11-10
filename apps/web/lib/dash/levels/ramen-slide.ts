// Level 9, Ramen Slide: downhill all the way. Two slides of broth that carry you, with eggs rolling down behind;
// toppings to hop across between them; and noodles that will not hold still at the bottom.

import { LevelBuilder, PAPER, PINK, PINK_SOFT, RED, WHITE, YELLOW, YELLOW_SOFT, hinge, slide, spin } from "../build";
import type { Level } from "../types";

export function ramenSlide(): Level {
  const NOODLE = "#fff0c4";
  const BROTH = "#ffe2a6";
  const NORI = "#c4e4c8";
  const MENMA = "#f1cf9c";
  const ORANGE = "#ff9a3d";
  const b = new LevelBuilder(
    "ramen-slide",
    { en: "Ramen Slide", ja: "ラーメンスライダー" },
    { en: "Ride the broth. Don't stop for the eggs!", ja: "スープに乗って下れ。たまごに追いつかれるな！" },
    { sky: ["#ffdcae", PAPER], fog: "#fff3df", floor: NOODLE, floorAlt: "#ffe0c2", accent: ORANGE, accent2: RED },
    130,
    -26
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: "#ffe0c2" });
  b.checkpoint(0, 0, 3.5, 9);

  /** A slide of broth from `d0` to `d1`, with rails, and eggs rolling down two of its lanes after whoever dawdles */
  const broth = (d0: number, d1: number, top0: number, top1: number, period: number) => {
    b.ramp(0, d0, d1, top0, top1, 9, { look: "belt", color: BROTH, surface: { conveyor: [0, -3.5] } });
    for (const x of [-4.7, 4.7]) b.ramp(x, d0, d1, top0 + 0.9, top1 + 0.9, 0.4, { look: "rail", color: ORANGE });
    [-2.6, 2.6].forEach((x, i) => {
      b.roller(1.05, [x, top0 - (2 * (top0 - top1)) / (d1 - d0), d0 + 2], [x, top1, d1], period, i * 0.5, { color: i ? YELLOW_SOFT : WHITE });
    });
    return (d: number) => top0 + ((top1 - top0) * (d - d0)) / (d1 - d0);
  };

  // A: the first slide. Bamboo shoots lie across half of it, and fish cakes stand in the way
  const first = broth(10, 40, 0, -7, 3.2);
  for (const [x, d] of [[-2.3, 17], [2.3, 24], [-2.3, 31]] as const) {
    b.box(x, first(d) + 0.85, d, 4.2, 1.7, 0.7, { look: "bar", color: MENMA });
  }
  for (const [x, d] of [[2.6, 19.5], [-2.4, 27.5], [1.4, 35]] as const) {
    b.cyl(x, first(d) + 1.1, d, 0.7, 1.6, { look: "plate", color: PINK_SOFT, bumper: 6 });
  }

  b.box(0, -7, 43, 12, 1, 6, { color: "#ffe0c2" });
  b.checkpoint(0, -7, 42.5, 8);

  // B: toppings floating on the bowl. Seaweed to stand on, a slice of pork that turns, and eggs that bounce
  b.box(-1.5, -7, 50, 4, 0.6, 5, { look: "tile", color: NORI });
  b.cyl(1, -7.2, 56, 1.7, 1, { look: "drum", color: YELLOW, surface: { bounce: 13 } });
  spin(b.cyl(0, -5.5, 62.5, 3, 0.7, { look: "disc", color: PINK_SOFT }), 1, 0);
  b.box(-1.2, -6.3, 69.75, 4, 0.6, 4.5, { look: "tile", color: NORI });
  b.cyl(0.8, -6.5, 75, 1.7, 1, { look: "drum", color: YELLOW, surface: { bounce: 13 } });
  b.way(-1.5, -7, 50);
  b.way(1, -7.2, 56);
  b.way(0, -5.5, 62.5);
  b.way(-1.2, -6.3, 69.75);
  b.way(0.8, -6.5, 75);

  b.box(0, -5, 81, 12, 1, 6, { color: "#ffe0c2" });
  b.checkpoint(0, -5, 80.5, 8);

  // C: the second slide, with chopsticks that swing shut across it from either side
  const second = broth(84, 114, -5, -12, 3.4);
  [92, 100, 108].forEach((d, i) => {
    const left = i % 2 === 0;
    hinge(
      b.box(0, second(d) + 0.95, d, 6, 0.7, 0.45, { look: "bar", color: i % 2 ? PINK : YELLOW, bumper: 7, tumble: true }),
      left ? -4.5 : 4.5, d, 6, left ? 0 : Math.PI, Math.PI / 2, 2.8, i * 0.3
    );
  });

  b.box(0, -12, 117, 12, 1, 6, { color: "#ffe0c2" });
  b.checkpoint(0, -12, 116.5, 8);

  // D: five noodles end to end, each waving from side to side out of step with the next
  for (let i = 0; i < 5; i++) {
    const d = 123.2 + i * 5.4;
    slide(b.box(-1.5, -12, d, 1.7, 0.7, 5, { look: "tile", color: i % 2 ? YELLOW_SOFT : NOODLE }), 3, 0, 0, 3.6, i * 0.31);
    b.way(0, -12, d);
  }

  b.box(0, -12, 154, 12, 1, 12, { look: "finish", color: WHITE });
  b.finish(0, -12, 156, 12, 8);

  for (let d = 6; d < 160; d += 17) {
    const down = d < 40 ? -(7 * d) / 40 : d < 84 ? -6 : d < 114 ? -5 - (7 * (d - 84)) / 30 : -12;
    b.deco("sushi", d % 2 ? -11 : 11, down + 2 + (d % 4), d, 1.5, d % 3 ? PINK : YELLOW);
    b.deco("cloud", d % 2 ? 14 : -14, down + 7 + (d % 4), d + 8, 2.4, WHITE);
  }
  return b.build();
}
