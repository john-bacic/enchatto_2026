// Level 2, Taiko Bounce: festival drums throw you up, drumsticks sweep you off.

import { LevelBuilder, PAPER, PINK, RED, WHITE, YELLOW, YELLOW_SOFT, slide, spin } from "../build";
import type { Level } from "../types";

export function taikoBounce(): Level {
  const WOOD = "#ffe2c2";
  const b = new LevelBuilder(
    "taiko-bounce",
    { en: "Taiko Bounce", ja: "太鼓ジャンプ" },
    { en: "Hop the sticks, bounce the drums!", ja: "バチをとびこえ、太鼓ではねろ！" },
    { sky: ["#ffe1cf", PAPER], fog: "#fff0e0", floor: WOOD, floorAlt: YELLOW_SOFT, accent: RED, accent2: YELLOW },
    120
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: drumsticks turning over the floor. The middle one has a second stick at head height
  b.box(0, 0, 25, 11, 1, 30);
  for (const [d, speed] of [[17, 1.7], [25.5, -1.9], [34, 2.2]] as const) {
    spin(b.box(0, 0.8, d, 10, 0.72, 0.5, { look: "bar", color: RED, bumper: 9, tumble: true }), speed, d * 0.7);
    b.cyl(0, 2.3, d, 0.5, 2.3, { look: "bumper", color: YELLOW });
  }
  spin(b.box(0, 2.05, 25.5, 0.5, 0.6, 10, { look: "bar", color: YELLOW, bumper: 9, tumble: true }), -1.9, 25.5 * 0.7);

  b.box(0, 0, 43, 12, 1, 6, { color: YELLOW_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: a drum up to a ledge, then two drums in a row up onto the stage
  b.cyl(-1.5, 0, 50.5, 1.7, 1.4, { look: "drum", color: RED, surface: { bounce: 14.5 } });
  b.box(1.5, 1.2, 56.5, 3.8, 0.6, 3.8, { look: "tile", color: WHITE });
  b.cyl(-1.5, 1.2, 62.5, 1.7, 1.4, { look: "drum", color: RED, surface: { bounce: 14.5 } });
  b.cyl(1.5, 1.2, 68.3, 1.7, 1.4, { look: "drum", color: YELLOW, surface: { bounce: 14.5 } });
  b.way(-1.5, 0, 50.5);
  b.way(1.5, 1.2, 56.5);
  b.way(-1.5, 1.2, 62.5);
  b.way(1.5, 1.2, 68.3);
  b.box(0, 2.5, 76, 10, 1, 8, { color: YELLOW_SOFT });
  b.checkpoint(0, 2.5, 75, 7);

  // C: three lifts, each a little higher than the last
  slide(b.box(-1.5, 2.5, 83, 3.4, 0.6, 3.4, { look: "tile", color: WHITE }), 0, 1.7, 0, 3.6, 0);
  slide(b.box(1.5, 3.4, 88, 3.4, 0.6, 3.4, { look: "tile", color: WHITE }), 0, 1.8, 0, 3.6, 0.33);
  slide(b.box(-1, 4.4, 93, 3.4, 0.6, 3.4, { look: "tile", color: WHITE }), 0, 1.8, 0, 3.6, 0.66);
  b.way(-1.5, 3.3, 83);
  b.way(1.5, 4.3, 88);
  b.way(-1, 5.3, 93);
  b.box(0, 6, 100, 9, 1, 7.4, { color: YELLOW_SOFT });
  b.checkpoint(0, 6, 99, 7);

  // D: an icy slide down through the pegs, one last pair of sticks, and home
  b.ramp(0, 103.7, 131.7, 6, 0, 9, { look: "ice", color: "#cfe8ff", surface: { ice: true } });
  for (const [x, d] of [[-2.5, 110], [1.5, 112.5], [-0.5, 117], [3, 119.5], [-3, 123], [0.8, 126.5]] as const) {
    const ground = 6 - (6 * (d - 103.7)) / 28;
    b.cyl(x, ground + 1.2, d, 0.55, 2.4, { look: "bumper", color: PINK, bumper: 7.5 });
  }
  b.box(0, 0, 141, 10, 1, 18.6);
  spin(b.box(0, 0.8, 141, 9.4, 0.72, 0.5, { look: "bar", color: RED, bumper: 9, tumble: true }), 2.1, 0);
  spin(b.box(0, 2.05, 141, 0.5, 0.6, 9.4, { look: "bar", color: YELLOW, bumper: 9, tumble: true }), 2.1, 0);
  b.cyl(0, 2.3, 141, 0.5, 2.3, { look: "bumper", color: YELLOW });
  b.way(0, 0, 133);

  b.box(0, 0, 155, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 0, 156, 12, 8);

  for (let d = 6; d < 160; d += 17) {
    b.deco("lantern", d % 2 ? -9.5 : 9.5, 5 + (d % 3), d, 1.3, d % 3 ? RED : YELLOW);
    b.deco("cloud", d % 2 ? 14 : -14, 8 + (d % 4), d + 6, 2.4, WHITE);
  }
  b.deco("torii", 0, 0, 9.5, 2.3, RED);
  return b.build();
}
