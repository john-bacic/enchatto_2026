// @vitest-environment node
// The "Pick a game!" screen shows a small screenshot of the chosen game, in English or Japanese, on the web and on
// the iPhone. The pictures are cut from the guide's screenshots by scripts/picker-shots.sh and committed: a game
// added to the picker needs its two there.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { TILES, pickerShotSrc } from "@/components/game-picker-modal";

const web = path.resolve(__dirname, "../..");
const assets = path.resolve(web, "../ios/Assets.xcassets/Picker");

describe("the picture of each game on the picker", () => {
  test("is there for every game, in English and in Japanese, on the web and on the iPhone", () => {
    expect(TILES.length).toBe(6);
    for (const { id } of TILES) {
      for (const lang of ["en", "ja"]) {
        const src = pickerShotSrc(id, lang);
        expect(fs.existsSync(path.join(web, "public", src)), src).toBe(true);
        const name = `pick-${path.basename(src, ".jpg")}`;
        expect(fs.existsSync(path.join(assets, `${name}.imageset`, `${name}.jpg`)), name).toBe(true);
      }
    }
    expect(pickerShotSrc("word-rush", "ja")).toBe("/picker/word-rush-ja.jpg");
    expect(pickerShotSrc("word-rush", "en")).toBe("/picker/word-rush.jpg");
    expect(pickerShotSrc("word-rush")).toBe("/picker/word-rush.jpg");
  });

  test("and nothing is left behind from a game that is gone", () => {
    expect(fs.readdirSync(path.join(web, "public/picker")).sort()).toEqual(
      TILES.flatMap(({ id }) => [`${id}-ja.jpg`, `${id}.jpg`]).sort()
    );
  });
});
