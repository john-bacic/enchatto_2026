// Chatto Dash: every course can be finished. A stored run of each level (the inputs a planning bot held,
// tests/web/dash-bot.ts) is played back through the game's own physics and has to reach the finish inside the
// round's time limit. A change to a level or to the physics that breaks its run fails here; when the change is
// meant, `DASH_BOT=1 npx vitest run tests/web/dash-levels.test.ts` from apps/web has the bot play every level
// again (about a minute) and writes the new runs.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { LEVEL_BUILDERS, LEVEL_NAMES } from "@/lib/dash/levels";
import { playLevel, replay, type Run } from "./dash-bot";

const DIR = join(__dirname, "dash-runs");
const RECORD = process.env.DASH_BOT === "1";
const ONLY = process.env.DASH_LEVEL;

describe("Chatto Dash levels", () => {
  LEVEL_BUILDERS.forEach((build, i) => {
    const level = build();
    const file = join(DIR, `${level.id}.json`);

    test.skipIf(!RECORD || (ONLY !== undefined && ONLY !== String(i)))(`${level.id}: the bot plays it`, () => {
      const result = playLevel(level, level.timeLimit);
      console.log(`${level.id}: finished=${result.finished} ${result.seconds.toFixed(1)}s falls=${result.falls} hits=${result.hits} splits=${result.splits.join(",")}`);
      expect(result.finished).toBe(true);
      writeFileSync(file, JSON.stringify(result.run) + "\n");
    }, 600_000);

    test.skipIf(RECORD)(`${level.id}: its stored run reaches the finish in time`, () => {
      expect(existsSync(file)).toBe(true);
      const run = JSON.parse(readFileSync(file, "utf8")) as Run;
      const result = replay(level, run);
      expect(result.finished).toBe(true);
      expect(result.seconds).toBeLessThan(level.timeLimit);
    });

    test(`${level.id}: it is put together soundly`, () => {
      expect(level.name).toEqual(LEVEL_NAMES[i]);
      expect(level.checkpoints.length).toBeGreaterThanOrEqual(3);
      // Thirty players fit behind the start line, and every checkpoint has floor under each place
      expect(level.pathTotal).toBeGreaterThan(120);
      for (const s of level.solids) {
        expect(s.hx > 0 && s.hy > 0 && s.hz > 0).toBe(true);
        // A sweeper low enough to be walked onto would never knock anyone over
        if (s.bumper && s.tumble) expect(s.hy * 2).toBeGreaterThan(0.45);
      }
    });
  });
});
