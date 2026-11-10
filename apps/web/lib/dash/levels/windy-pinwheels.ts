// Level 3, Windy Pinwheels: gusts across narrow bridges, turning pinwheels, swinging lanterns.

import { BLUE, BLUE_SOFT, LevelBuilder, MINT, MINT_SOFT, PAPER, PINK, WHITE, YELLOW, orbit, spin } from "../build";
import type { Level } from "../types";

/** A gust that blows for half of every `period` seconds, building and dying away */
const gust = (period: number, phase: number) => (t: number) =>
  Math.max(0, Math.min(1, Math.sin(Math.PI * 2 * (t / period + phase)) * 2.2));

export function windyPinwheels(): Level {
  const b = new LevelBuilder(
    "windy-pinwheels",
    { en: "Windy Pinwheels", ja: "かざぐるま通り" },
    { en: "Lean into the wind!", ja: "風にまけるな！" },
    { sky: ["#cfe4ff", PAPER], fog: "#eef5ff", floor: WHITE, floorAlt: MINT_SOFT, accent: BLUE, accent2: MINT },
    120
  );

  b.box(0, 0, 3.5, 12, 1, 13, { color: MINT_SOFT });
  b.checkpoint(0, 0, 3.5, 9);

  // A: three narrow bridges and a crosswind that keeps changing its mind
  for (const x of [-4, 0, 4]) b.box(x, 0, 25, 1.9, 1, 30, { color: x === 0 ? WHITE : BLUE_SOFT });
  b.wind(-9, 9, 11, 19.5, -2, 6, 5.5, 0, gust(3.2, 0));
  b.wind(-9, 9, 20.5, 29, -2, 6, -5.5, 0, gust(3.2, 0.5));
  b.wind(-9, 9, 30, 39, -2, 6, 6, 0, gust(2.8, 0.25));

  b.box(0, 0, 43, 12, 1, 6, { color: MINT_SOFT });
  b.checkpoint(0, 0, 42.5, 8);

  // B: four pinwheels in a row, each turning the other way, each with a blade that sweeps its top
  const wheels = [[0, 50, 1.2], [1.5, 57.2, -1.4], [-1.5, 64.4, 1.2], [0, 71.6, -1.4]] as const;
  wheels.forEach(([x, d, speed], i) => {
    spin(b.cyl(x, 0, d, 3.3, 0.7, { look: "disc", color: i % 2 ? MINT_SOFT : BLUE_SOFT }), speed, 0);
    orbit(b.box(x, 0.95, d, 2.6, 0.95, 0.4, { look: "wall", color: i % 2 ? MINT : BLUE }), 1.95, speed, i * 1.3, true);
    b.cyl(x, 1.5, d, 0.65, 1.5, { look: "bumper", color: YELLOW, bumper: 6 });
    b.way(x + (i % 2 ? 1.6 : -1.6), 0, d);
  });

  b.box(0, 0, 78.7, 12, 1, 6.6, { color: MINT_SOFT });
  b.checkpoint(0, 0, 78.5, 8);

  // C: lantern alley, with the wind at your back
  b.box(0, 0, 98, 4.6, 1, 32);
  [87, 92.5, 98, 103.5, 109].forEach((d, i) => {
    b.lantern(0, 7.2, d, 6.2, 0.78, 2.7 + (i % 3) * 0.35, i * 0.37, i % 2 ? PINK : YELLOW);
  });
  b.wind(-3, 3, 83, 113, -1, 5, 0, 2.5);

  b.box(0, 0, 117, 12, 1, 6, { color: MINT_SOFT });
  b.checkpoint(0, 0, 116.5, 8);

  // D: a zigzag one stride wide, gusts pushing for the outside edge
  b.box(-2.5, 0, 124, 2.3, 1, 8, { color: BLUE_SOFT });
  b.box(0, 0, 129, 7.3, 1, 2.3);
  b.box(2.5, 0, 134, 2.3, 1, 8, { color: BLUE_SOFT });
  b.box(0, 0, 139, 7.3, 1, 2.3);
  b.box(-2.5, 0, 144, 2.3, 1, 8, { color: BLUE_SOFT });
  b.box(0, 0, 149, 7.3, 1, 2.3);
  b.wind(-9, 9, 120.5, 127.5, -2, 6, -5, 0, gust(2.6, 0));
  b.wind(-9, 9, 130.5, 137.5, -2, 6, 5, 0, gust(2.6, 0.4));
  b.wind(-9, 9, 140.5, 147.5, -2, 6, -5, 0, gust(2.6, 0.8));
  b.way(-2.5, 0, 121);
  b.way(-2.5, 0, 129);
  b.way(2.5, 0, 129);
  b.way(2.5, 0, 139);
  b.way(-2.5, 0, 139);
  b.way(-2.5, 0, 149);
  b.way(0, 0, 150);

  b.box(0, 0, 155, 12, 1, 10, { look: "finish", color: WHITE });
  b.finish(0, 0, 156, 12, 8);

  for (let d = 5; d < 160; d += 16) {
    b.deco("pinwheel", d % 2 ? -10 : 10, 2 + (d % 4), d, 1.6, d % 3 ? PINK : YELLOW);
    b.deco("cloud", d % 2 ? 13 : -13, 7 + (d % 5), d + 7, 2.6, WHITE);
  }
  return b.build();
}
