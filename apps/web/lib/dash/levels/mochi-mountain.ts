// Level 4, Mochi Mountain: uphill against rolling rice cakes, through sticky mochi and over ice.

import { LevelBuilder, PAPER, PINK, PINK_SOFT, WHITE, YELLOW } from "../build";
import type { Level } from "../types";

export function mochiMountain(): Level {
  const SNOW = "#f1f5ff";
  const ICE = "#cfe8ff";
  const b = new LevelBuilder(
    "mochi-mountain",
    { en: "Mochi Mountain", ja: "もちもち山" },
    { en: "Climb! Dodge the rolling mochi!", ja: "のぼれ！ころがるおもちをよけろ！" },
    { sky: ["#dfe9ff", "#ffffff"], fog: "#f3f6ff", floor: SNOW, floorAlt: PINK_SOFT, accent: PINK, accent2: "#9ad0ff" },
    130
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: PINK_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: the first slope, three lanes of mochi rolling down it
  b.ramp(0, 10, 45, 0, 6.5, 10.5);
  [-3.2, 0, 3.2].forEach((x, i) => {
    b.roller(1.25, [x, 6.5, 45], [x, 0, 10], 5.4, i * 0.17, { color: i === 1 ? PINK_SOFT : WHITE });
    b.roller(1.25, [x, 6.5, 45], [x, 0, 10], 5.4, i * 0.17 + 0.5, { color: i === 1 ? WHITE : "#e3f9d5" });
  });

  b.box(0, 6.5, 48.5, 10.5, 1, 7, { color: PINK_SOFT });
  b.checkpoint(0, 6.5, 48, 8);

  // B: the mochi field. Sticky patches slow you to a wade, and two big ones roll across
  b.box(0, 6.5, 68, 12, 1, 32);
  const rows = [55.5, 59.5, 63.5, 67.5, 71.5, 75.5, 79.5];
  rows.forEach((d, i) => {
    const xs = i % 2 ? [-5.5, -1.5, 2.5] : [-3.5, 0.5, 4.5];
    for (const x of xs) b.cyl(x, 6.62, d, 1.65, 0.3, { look: "mochi", color: i % 3 ? PINK_SOFT : "#e3f9d5", surface: { speed: 0.42 } });
  });
  b.shuttle(1.1, [-5.6, 6.5, 61.5], [5.6, 6.5, 61.5], 3.8, 0, { color: WHITE });
  b.shuttle(1.1, [5.6, 6.5, 73.5], [-5.6, 6.5, 73.5], 3.4, 0.3, { color: PINK_SOFT });

  b.box(0, 6.5, 87, 10.5, 1, 6, { color: PINK_SOFT });
  b.checkpoint(0, 6.5, 86.5, 8);

  // C: four shelves of ice, each a jump up and across from the last
  const shelves = [[-2, 7.6, 94], [2, 8.7, 101], [-2, 9.8, 108], [2, 10.9, 115]] as const;
  for (const [x, top, d] of shelves) {
    b.box(x, top, d, 5.6, 1, 5.5, { look: "ice", color: ICE, surface: { ice: true } });
    b.way(x, top, d);
  }
  b.cyl(2, 10, 101, 0.5, 1.3, { look: "bumper", color: PINK, bumper: 6 });
  b.cyl(-2, 11.1, 108, 0.5, 1.3, { look: "bumper", color: YELLOW, bumper: 6 });

  b.box(0, 12, 122.6, 10, 1, 6.8, { color: PINK_SOFT });
  b.checkpoint(0, 12, 122, 8);

  // D: the summit slope and the biggest mochi of all
  b.ramp(0, 126, 152, 12, 16, 9.5);
  [-3, 0, 3].forEach((x, i) => {
    b.roller(1.4, [x, 16, 152], [x, 12, 126], 4.4, i * 0.33, { color: i === 1 ? PINK_SOFT : WHITE });
  });

  b.box(0, 16, 157, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 16, 158, 12, 8);

  for (let d = 6; d < 165; d += 15) {
    const up = d < 45 ? (d / 45) * 6 : d < 90 ? 6.5 : d < 126 ? 6.5 + ((d - 90) / 36) * 5.5 : 12 + ((d - 126) / 30) * 4;
    b.deco("star", d % 2 ? -10 : 10, up + 2 + (d % 3), d, 1.1, d % 3 ? PINK : YELLOW);
    b.deco("cloud", d % 2 ? 13 : -13, up + 6 + (d % 4), d + 6, 2.6, WHITE);
  }
  return b.build();
}
