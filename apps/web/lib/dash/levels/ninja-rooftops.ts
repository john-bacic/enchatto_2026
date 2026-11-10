// Level 7, Ninja Rooftops: roof to roof over the alleys, through sliding paper doors, up a stair of bamboo
// posts, and down the last roofs with caltrops underfoot.

import { LevelBuilder, PINK, PINK_SOFT, RED, VIOLET, VIOLET_SOFT, WHITE, YELLOW, YELLOW_SOFT, slide } from "../build";
import type { Level } from "../types";

export function ninjaRooftops(): Level {
  const ROOF = "#e4def5";
  const TILE = "#cfc6ec";
  const BAMBOO = "#cdeccf";
  const b = new LevelBuilder(
    "ninja-rooftops",
    { en: "Ninja Rooftops", ja: "しのびルーフ" },
    { en: "Leap the gaps. Slip through the doors!", ja: "屋根をとびこえ、ふすまをすりぬけろ！" },
    { sky: ["#c9c2f2", "#ffe9d6"], fog: "#f1e9f7", floor: ROOF, floorAlt: PINK_SOFT, accent: VIOLET, accent2: YELLOW },
    130
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: PINK_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: three roofs. The first and third are gabled: up one side, down the other
  b.ramp(0, 11, 15, 0, 1.4, 7, { color: TILE });
  b.ramp(0, 15, 19, 1.4, 0, 7, { color: TILE });
  b.box(-1.5, 1, 24.3, 5, 1, 5.4, { color: ROOF });
  b.ramp(1.5, 29.8, 33, 0.6, 1.8, 5, { color: TILE });
  b.ramp(1.5, 33, 36.2, 1.8, 0.6, 5, { color: TILE });
  b.way(0, 1.4, 15);
  b.way(-1.5, 1, 24.3);
  b.way(1.5, 1.8, 33);

  b.box(0, 0, 42.3, 12, 1, 7.4, { color: PINK_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: a corridor shut by four paper doors. Each is a wall with one doorway in it, and the wall slides
  b.box(0, 0, 62, 9, 1, 32);
  for (const x of [-4.7, 4.7]) b.box(x, 1, 62, 0.4, 1, 32, { look: "rail", color: VIOLET });
  [52, 58.5, 65, 71.5].forEach((d, i) => {
    const color = i % 2 ? YELLOW_SOFT : WHITE;
    // The doorway is 2.6 wide and goes from one side of the corridor to the other
    slide(b.box(-7.45, 2.4, d, 7.1, 2.4, 0.5, { look: "wall", color }), 5.2, 0, 0, 4.2, i * 0.27);
    slide(b.box(1.85, 2.4, d, 6.3, 2.4, 0.5, { look: "wall", color }), 5.2, 0, 0, 4.2, i * 0.27);
  });

  b.box(0, 0, 80.5, 12, 1, 5, { color: PINK_SOFT });
  b.checkpoint(0, 0, 80, 8);

  // C: bamboo posts, each a stride on and half a step higher. Two bob, and throwing stars cross between them
  const posts = [
    [-1.2, 0.4, 85.4], [0.9, 0.8, 88.6], [-0.7, 1.2, 91.8], [1.2, 1.6, 95], [-0.9, 2, 98.2],
    [0.8, 2.4, 101.4], [-1.1, 2.8, 104.6], [0.7, 3.2, 107.8], [-0.4, 3.6, 111],
  ] as const;
  posts.forEach(([x, top, d], i) => {
    const post = b.cyl(x, top, d, 1.3, top + 7, { look: "disc", color: i % 2 ? BAMBOO : "#e3f6d8" });
    if (i === 3 || i === 6) slide(post, 0, -0.7, 0, 3.4, i * 0.2);
    b.way(x, top, d);
  });
  b.roller(0.55, [-9, 2, 96.6], [9, 2, 96.6], 2.6, 0, { look: "shot", color: YELLOW, power: 11 });
  b.roller(0.55, [9, 3.2, 106.2], [-9, 3.2, 106.2], 2.6, 0.5, { look: "shot", color: PINK, power: 11 });

  b.box(0, 3.6, 116, 10, 1, 7, { color: PINK_SOFT });
  b.checkpoint(0, 3.6, 116, 7);

  // D: three roofs down to the street, with caltrops scattered on each
  const roofs = [[-1, 3, 124.5], [1.5, 2, 134], [-1, 1, 143.5]] as const;
  roofs.forEach(([x, top, d], i) => {
    b.box(x, top, d, 6, 1, 7, { color: i % 2 ? ROOF : TILE });
    b.way(x, top, d);
    const spots = i % 2 ? [[-1.6, -1.4], [0.4, 0.6], [1.8, -0.4], [-0.4, 2.2]] : [[1.5, -1.6], [-0.6, 0.2], [-1.9, 1.8], [1.2, 2]];
    for (const [dx, dd] of spots) b.cyl(x + dx, top + 0.3, d + dd, 0.35, 0.3, { look: "bumper", color: RED, bumper: 5.5 });
  });

  b.box(0, 0, 155, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 0, 156, 12, 8);

  for (let d = 6; d < 160; d += 16) {
    b.deco("lantern", d % 2 ? -9.5 : 9.5, 4 + (d % 4), d, 1.2, d % 3 ? VIOLET_SOFT : YELLOW);
    b.deco("star", d % 2 ? 12 : -12, 8 + (d % 5), d + 5, 0.9, d % 3 ? YELLOW : WHITE);
    b.deco("cloud", d % 2 ? 15 : -15, 9 + (d % 3), d + 9, 2.2, WHITE);
  }
  return b.build();
}
