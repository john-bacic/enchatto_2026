// Level 10, Onsen Hop: a hot spring. Stepping stones that sink and rise, geysers that throw you up a terrace
// when they blow, bathers bouncing down the boardwalk, and one last geyser to catch.

import { LevelBuilder, MINT, MINT_SOFT, PAPER, PINK, PINK_SOFT, WHITE, YELLOW, YELLOW_SOFT, blink, slide } from "../build";
import type { Level } from "../types";

export function onsenHop(): Level {
  const STONE = "#eeeae0";
  const ROCK = "#dcd6ea";
  const WATER = "#bfeaff";
  const b = new LevelBuilder(
    "onsen-hop",
    { en: "Onsen Hop", ja: "おんせんホップ" },
    { en: "Wait for the geyser. Then jump on!", ja: "かんけつせんを待って、とび乗れ！" },
    { sky: ["#bfeee2", PAPER], fog: "#ecfaf5", floor: STONE, floorAlt: MINT_SOFT, accent: MINT, accent2: PINK },
    140
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: MINT_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  /** A geyser: flat to the ground and harmless until it blows, when it throws up whoever is on it */
  const geyser = (x: number, top: number, d: number, period: number, phase: number) =>
    b.cyl(x, top + 0.12, d, 1.3, 0.12, { look: "geyser", color: WATER, surface: { bounce: 15.5 }, active: blink(period, 1.5, phase) });

  // A: stepping stones across the spring. Every other one sinks and comes up again, and yuzu float across
  const stones = [[0, 12.5], [-2.2, 16], [1.6, 19.5], [-1, 23.2], [2.4, 26.6], [0, 30.2], [-2.4, 33.6], [0.6, 37]] as const;
  stones.forEach(([x, d], i) => {
    const stone = b.cyl(x, 0, d, 1.35, 1.2, { look: "plate", color: i % 2 ? ROCK : STONE });
    if (i % 2) slide(stone, 0, -1.1, 0, 3.4, i * 0.17);
    b.way(x, 0, d);
  });
  b.shuttle(0.6, [-6, 0, 21.3], [6, 0, 21.3], 4, 0, { look: "plum", color: YELLOW, power: 9 });
  b.shuttle(0.6, [6, 0, 31.9], [-6, 0, 31.9], 4, 0.4, { look: "plum", color: YELLOW, power: 9 });

  b.box(0, 0, 42.5, 12, 1, 7, { color: MINT_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: two terraces, each too high to jump. A geyser at the foot of each is the way up
  b.box(0, 0, 50.5, 9, 1, 9);
  geyser(0, 0, 53, 3.2, 0);
  b.box(0, 3.2, 60, 9, 1, 8, { color: ROCK });
  geyser(0, 3.2, 62.3, 3.2, 0.5);
  b.way(0, 0, 53);
  b.way(0, 3.2, 58);
  b.way(0, 3.2, 62.3);
  b.way(0, 6.4, 67);

  b.box(0, 6.4, 73.5, 12, 1, 16, { color: MINT_SOFT });
  b.checkpoint(0, 6.4, 78, 8);

  // C: the boardwalk. Bathers come bouncing down its three lanes: run under one in the air, or step aside
  b.box(0, 6.4, 98.25, 7, 1, 33.5, { color: YELLOW_SOFT });
  [-2.2, 0, 2.2].forEach((x, i) => {
    b.hopper(0.85, [x, 114], [x, 83], 6.4, 2.7, 7, 5.2, i * 0.37, { color: i === 1 ? PINK_SOFT : WHITE });
    b.hopper(0.85, [x, 114], [x, 83], 6.4, 2.7, 7, 5.2, i * 0.37 + 0.5, { color: i === 1 ? WHITE : YELLOW_SOFT });
  });

  b.box(0, 6.4, 118.2, 12, 1, 6.4, { color: MINT_SOFT });
  b.checkpoint(0, 6.4, 117.5, 8);

  // D: two bath lifts down to the pool deck, and three geysers that blow one after another up to the finish
  slide(b.box(-1.5, 6.4, 124.4, 3.6, 0.6, 3.6, { look: "tile", color: WHITE }), 0, -2.6, 0, 4, 0);
  slide(b.box(1.5, 3.8, 129.4, 3.6, 0.6, 3.6, { look: "tile", color: PINK_SOFT }), 0, -2.6, 0, 4, 0.5);
  b.box(0, 1.2, 137.5, 10, 1, 11, { color: ROCK });
  [-3, 0, 3].forEach((x, i) => geyser(x, 1.2, 141, 3.6, i / 3));
  b.way(-1.5, 3.8, 124.4);
  b.way(1.5, 1.2, 129.4);
  b.way(0, 1.2, 141);

  b.box(0, 4.4, 152, 12, 1, 16, { look: "finish", color: WHITE });
  b.finish(0, 4.4, 156, 12, 8);

  for (let d = 6; d < 160; d += 16) {
    const up = d < 55 ? 0 : d < 64 ? 3.2 : d < 121 ? 6.4 : 2;
    b.deco("lantern", d % 2 ? -9.5 : 9.5, up + 4 + (d % 3), d, 1.2, d % 3 ? PINK : YELLOW);
    b.deco("cloud", d % 2 ? 14 : -14, up + 8 + (d % 4), d + 7, 2.6, WHITE);
  }
  b.deco("torii", 0, 0, 9.5, 2.3, PINK);
  return b.build();
}
