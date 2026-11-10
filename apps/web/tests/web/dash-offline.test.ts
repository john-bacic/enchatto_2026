// @vitest-environment node
// The iPhone app carries a copy of Chatto Dash's practice screen (apps/ios/Resources/DashOffline), built from
// the web code by apps/web/offline/build.mjs, and plays it with no connection. Nothing rebuilds that copy by
// itself: this holds it to the code. Change the game, its styles or an avatar picture and the copy is stale
// until `npm run build:dash-offline` is run and its output committed.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { HTML, hashOf, pictures } from "../../offline/built.mjs";
import { PRESET_AVATARS, avatarBackSrc, avatarIconSrc } from "@/lib/types";

const web = path.resolve(__dirname, "../..");
const copy = path.resolve(web, "../ios/Resources/DashOffline");
const built: { hash: string; inputs: string[] } = JSON.parse(fs.readFileSync(path.join(copy, "built.json"), "utf8"));

describe("the practice screen the iPhone app carries", () => {
  test("is built from the web code as it is now (if not: npm run build:dash-offline)", () => {
    expect(built.hash, "apps/ios/Resources/DashOffline is stale. Run: npm run build:dash-offline").toBe(hashOf(web, built.inputs));
  });

  test("is made of the game itself: the race, its physics, the courses and the practice screen", () => {
    for (const file of ["offline/dash-practice.tsx", "components/dash/practice.tsx", "components/dash/race.tsx", "lib/dash/sim.ts", "lib/dash/scene.ts", "lib/dash/levels/index.ts"]) {
      expect(built.inputs).toContain(file);
    }
    // Nothing that talks to a server is in it: it has to play with no connection
    expect(built.inputs.filter((f) => f.startsWith("convex/") || f === "lib/convex.tsx")).toEqual([]);
  });

  test("has its page, its code, its styles and every avatar's picture", () => {
    expect(fs.readFileSync(path.join(copy, "index.html"), "utf8")).toBe(HTML);
    expect(fs.statSync(path.join(copy, "dash.js")).size).toBeGreaterThan(200_000);
    expect(fs.statSync(path.join(copy, "dash.css")).size).toBeGreaterThan(5_000);
    expect(pictures(web).length).toBeGreaterThan(30);
    expect(fs.readdirSync(path.join(copy, "icons")).sort()).toEqual(pictures(web));
  });

  test("every avatar has its back as well as its face: a racer shows it running away from the camera", () => {
    const has = pictures(web);
    for (const avatar of PRESET_AVATARS) {
      expect(has).toContain(path.basename(avatarIconSrc(avatar.id)));
      expect(has).toContain(path.basename(avatarBackSrc(avatar.id)));
    }
  });

  test("asks for nothing from outside the app", () => {
    const code = fs.readFileSync(path.join(copy, "dash.js"), "utf8");
    const styles = fs.readFileSync(path.join(copy, "dash.css"), "utf8");
    // Addresses the app serves from its own files: /icons and /fonts. No web address is fetched from
    expect(styles.match(/url\(["']?(?!\/fonts\/|data:)[^)]*\)/g) ?? []).toEqual([]);
    expect(code).not.toMatch(/convex\.cloud|vercel\.app|fonts\.googleapis/);
  });
});
