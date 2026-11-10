// Level 6, Shinkansen Dash: across the tracks between the trains, along their roofs, over the footbridge with
// its crossing gates, and a sprint down the express with hurdles on it.

import { BLUE, BLUE_SOFT, LevelBuilder, PAPER, PINK, RED, WHITE, YELLOW, YELLOW_SOFT, hinge, loop, slide } from "../build";
import type { Level } from "../types";

export function shinkansenDash(): Level {
  const PLATFORM = "#eef2f8";
  const TRACK = "#cfd6e6";
  const b = new LevelBuilder(
    "shinkansen-dash",
    { en: "Shinkansen Dash", ja: "しんかんせんダッシュ" },
    { en: "Cross the tracks. Ride the roofs!", ja: "線路をわたって、屋根に乗れ！" },
    { sky: ["#bfe0ff", PAPER], fog: "#eef6ff", floor: PLATFORM, floorAlt: YELLOW_SOFT, accent: BLUE, accent2: YELLOW },
    130
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: four tracks to cross. Two trains run on each, a gap between them just long enough
  b.box(0, 0, 25, 12, 1, 30);
  [15.5, 21.5, 27.5, 33.5].forEach((d, i) => {
    b.box(0, 0.03, d, 12, 0.06, 2.6, { look: "tile", color: TRACK });
    const right = i % 2 === 0;
    for (const phase of [0, 0.5]) {
      loop(
        b.box(right ? -17 : 17, 2.3, d, 7, 2.3, 2, { look: "pusher", color: i % 2 ? BLUE_SOFT : WHITE, bumper: 8, tumble: true }),
        right ? 34 : -34, 0, 0, 3.4 + i * 0.25, phase + i * 0.21
      );
    }
  });

  b.box(0, 0, 43, 12, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: two trains shuttling between the stations. One is at the far end of its run when the other is at the
  // near end of its own, and that is where to change
  slide(b.box(-2.5, 0, 51, 3, 1.2, 8, { look: "tile", color: WHITE }), 0, 0, 10, 6, 0);
  slide(b.box(2.5, 0, 63, 3, 1.2, 8, { look: "tile", color: BLUE_SOFT }), 0, 0, 10, 6, 0.5);
  b.way(-2.5, 0, 51);
  b.way(-2.5, 0, 62);
  b.way(2.5, 0, 63);
  b.way(2.5, 0, 74);

  b.box(0, 0, 80, 12, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 79.5, 8);

  // C: up the steps, over the footbridge through three crossing gates, and down again
  const STEP = 0.35;
  for (let k = 1; k <= 6; k++) b.box(0, k * STEP, 83.6 + k * 1.2, 7, k * STEP + 1, 1.2, { color: k % 2 ? PLATFORM : YELLOW_SOFT });
  const deck = 6 * STEP;
  b.box(0, deck, 99.9, 6, 0.8, 16.6);
  [95.5, 100, 104.5].forEach((d, i) => {
    // Each gate is two arms that swing shut across the bridge and open again, down the course
    hinge(b.box(-3, deck + 0.8, d, 2.8, 0.6, 0.4, { look: "bar", color: i % 2 ? YELLOW : RED, bumper: 8, tumble: true }), -3, d, 2.8, 0, Math.PI / 2, 3.2, i * 0.3);
    hinge(b.box(3, deck + 0.8, d, 2.8, 0.6, 0.4, { look: "bar", color: i % 2 ? YELLOW : RED, bumper: 8, tumble: true }), 3, d, 2.8, Math.PI, Math.PI / 2, 3.2, i * 0.3);
    b.cyl(-3, deck + 1.3, d, 0.3, 1.3, { look: "bumper", color: WHITE });
    b.cyl(3, deck + 1.3, d, 0.3, 1.3, { look: "bumper", color: WHITE });
  });
  for (let k = 5; k >= 1; k--) b.box(0, k * STEP, 108.8 + (5 - k) * 1.2, 7, k * STEP + 1, 1.2, { color: k % 2 ? PLATFORM : YELLOW_SOFT });
  b.way(0, deck, 92);
  b.way(0, deck, 108);

  b.box(0, 0, 117.4, 12, 1, 6.4, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 117, 8);

  // D: the express. Its roof carries you to the finish, hurdles and all
  b.box(0, 0, 135.3, 5, 1, 29.4, { look: "belt", color: WHITE, surface: { conveyor: [0, -5] } });
  [127, 133, 139, 145].forEach((d, i) => {
    b.box(0, 0.75, d, 5, 0.75, 0.5, { look: "bar", color: i % 2 ? PINK : BLUE });
  });

  b.box(0, 0, 155, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 0, 156, 12, 8);

  for (let d = 6; d < 160; d += 18) {
    b.deco("flag", d % 2 ? -9 : 9, 2 + (d % 3), d, 1.4, d % 3 ? BLUE : YELLOW);
    b.deco("cloud", d % 2 ? 14 : -14, 7 + (d % 4), d + 7, 2.5, WHITE);
  }
  return b.build();
}
