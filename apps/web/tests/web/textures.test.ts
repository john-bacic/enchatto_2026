import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RoomBackground } from "../../components/ui/effects";
import { TEXTURES, ambientTexture, ambientTextureIndex, keepAmbientTexture, textureForRoom } from "../../lib/textures";

// lib/textures.ts. First the "ambient" texture, the one a screen outside a room shows. The rule runs here over a
// stand-in for the tab's sessionStorage and a source of random numbers that gives what the test asks for. One call of
// ambientTextureIndex is one page load; the same storage handed to a second call is a reload of the tab.
// A retired texture is never the ambient one, so the indexes these tests pick and keep are of textures that are not
// retired, but where a test says otherwise.
// RoomBackground puts the ambient texture on in an effect, and no effect runs here (see CLAUDE.md): what is tested of
// it is the server's half, the markup the browser's first render has to match.
// Then the list itself, the texture a room is drawn with, the iPhone app's copy of the list and its own pick, read
// from its files, and what the server holds of the list, read from the two copies of convex/rooms.ts.

afterEach(() => {
  vi.restoreAllMocks();
});

const KEY = "enchatto_background";

/** A tab's storage, holding what an earlier page load kept, if anything */
function tabStorage(kept?: string) {
  const items = new Map<string, string>(kept === undefined ? [] : [[KEY, kept]]);
  return {
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void items.set(key, value)),
  };
}

/** The retired textures, by index, and the others: the ones a random pick is made among */
const RETIRED = TEXTURES.flatMap((texture, index) => (texture.retired ? [index] : []));
const PICKED = TEXTURES.flatMap((texture, index) => (texture.retired ? [] : [index]));

/**
 * Random numbers that land on these indexes in turn, each in the middle of its texture's share of the range. The
 * range is shared among the textures that are not retired, so no number lands on a retired one
 */
function landingOn(...indexes: number[]) {
  for (const index of indexes) if (!PICKED.includes(index)) throw new Error(`No random number lands on texture ${index}`);
  let calls = 0;
  return vi.fn(() => (PICKED.indexOf(indexes[calls++ % indexes.length]) + 0.5) / PICKED.length);
}

/** A texture that is not retired and is not this one */
const anotherOf = (index: number) => PICKED[(PICKED.indexOf(index) + 1) % PICKED.length];

const blocked = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

describe("a tab that has shown a room", () => {
  test("shows that room's texture, and picks nothing at random", () => {
    const random = landingOn(2);
    const ambient = ambientTextureIndex(tabStorage("7"), random);
    expect(ambient.get()).toBe(7);
    expect(ambient.get()).toBe(7);
    expect(random).not.toHaveBeenCalled();
  });

  test.each(PICKED)("texture %i is read back", (index) => {
    expect(ambientTextureIndex(tabStorage(String(index)), landingOn(anotherOf(index))).get()).toBe(index);
  });
});

describe("a tab that has shown no room", () => {
  test("shows a random texture, the same one for the whole page load", () => {
    const random = landingOn(3, 8);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.get()).toBe(3);
    expect(ambient.get()).toBe(3);
    expect(random).toHaveBeenCalledTimes(1);
  });

  test("picks again on a reload: a random pick is no room's texture, so it is not kept", () => {
    const storage = tabStorage();
    expect(ambientTextureIndex(storage, landingOn(3)).get()).toBe(3);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(ambientTextureIndex(storage, landingOn(8)).get()).toBe(8);
  });

  test("the pick covers the 47 textures that are not retired and nothing else", () => {
    expect(TEXTURES).toHaveLength(52);
    expect(PICKED).toHaveLength(47);
    const pick = (value: number) => ambientTextureIndex(tabStorage(), () => value).get();
    // Each of the 47 has an equal share of the range, in the order of the list
    expect(PICKED.map((_, share) => pick((share + 0.5) / 47))).toEqual(PICKED);
    // Math.random gives from 0 up to, never, 1
    expect(pick(0)).toBe(0);
    expect(pick(1 - Number.EPSILON)).toBe(51);
    const seen = new Set<number>();
    for (let n = 0; n < 1000; n++) seen.add(pick(n / 1000));
    expect([...seen].sort((a, b) => a - b)).toEqual(PICKED);
  });
});

// A retired texture is drawn for the room that has it and for no other screen. The tab that showed such a room is,
// outside it, a tab that has shown no room
describe("a tab whose last room has a retired texture", () => {
  test.each(RETIRED)("texture %i, held by storage, is not shown: the screen gets a random pick, held for the page load", (index) => {
    const random = landingOn(6, 8);
    const ambient = ambientTextureIndex(tabStorage(String(index)), random);
    expect(ambient.get()).toBe(6);
    expect(ambient.get()).toBe(6);
    expect(random).toHaveBeenCalledTimes(1);
  });

  test.each(RETIRED)("texture %i, held by storage, leaves a screen that is waiting for its room on bare paper", (index) => {
    const random = landingOn(6);
    const ambient = ambientTextureIndex(tabStorage(String(index)), random);
    expect(ambient.peek()).toBeUndefined();
    expect(random).not.toHaveBeenCalled();
    // Once a screen outside a room has picked, the waiting screen shows that pick
    expect(ambient.get()).toBe(6);
    expect(ambient.peek()).toBe(6);
  });

  test.each(RETIRED)("texture %i, kept by this page load, gives way to the pick the page load made before the room", (index) => {
    const random = landingOn(6, 8);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.get()).toBe(6);
    ambient.keep(index);
    expect(ambient.peek()).toBe(6);
    expect(ambient.get()).toBe(6);
    expect(random).toHaveBeenCalledTimes(1);
  });

  test.each(RETIRED)("texture %i, kept by this page load, does not bring back the texture of the room before", (index) => {
    const storage = tabStorage("2");
    const ambient = ambientTextureIndex(storage, landingOn(6));
    expect(ambient.get()).toBe(2);
    ambient.keep(index);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.get()).toBe(6);
    // Nor does a reload: storage holds the retired texture's index, which counts as none
    expect(storage.getItem(KEY)).toBe(String(index));
    expect(ambientTextureIndex(storage, landingOn(8)).get()).toBe(8);
  });

  test.each(RETIRED)("texture %i gives way again to the texture of the next room", (index) => {
    const storage = tabStorage(String(index));
    const ambient = ambientTextureIndex(storage, landingOn(6));
    expect(ambient.get()).toBe(6);
    ambient.keep(3);
    expect(ambient.get()).toBe(3);
    expect(ambientTextureIndex(storage, landingOn(6)).get()).toBe(3);
  });

  test("with storage that cannot be used, a retired texture kept in memory is not shown either", () => {
    const ambient = ambientTextureIndex({ getItem: blocked, setItem: blocked }, landingOn(5));
    ambient.keep(9);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.get()).toBe(5);
  });

  // Every index a tab can hold, from storage or kept by the page load, against random numbers across the whole range
  test("whatever is kept and whatever the random source gives, the screen never shows a retired texture", () => {
    const draws = [0, 1 - Number.EPSILON, ...Array.from({ length: 471 }, (_, n) => (n + 0.5) / 471)];
    for (const index of TEXTURES.keys()) {
      for (const draw of draws) {
        const fromStorage = ambientTextureIndex({ getItem: () => String(index), setItem: () => {} }, () => draw);
        const fromMemory = ambientTextureIndex(null, () => draw);
        fromMemory.keep(index);
        for (const ambient of [fromStorage, fromMemory]) {
          const waiting = ambient.peek();
          const shown = ambient.get();
          expect(PICKED, `kept ${index}, draw ${draw}`).toContain(shown);
          // A texture that is not retired is the room's own, whatever the draw
          if (PICKED.includes(index)) expect({ waiting, shown }).toEqual({ waiting: index, shown: index });
          else expect(waiting).toBeUndefined();
        }
      }
    }
  });
});

describe("a screen that is waiting for its room", () => {
  test("picks no texture in a tab that has none: the room's own is on its way", () => {
    const random = landingOn(6);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.peek()).toBeUndefined();
    expect(random).not.toHaveBeenCalled();
  });

  test("shows the texture of the room the tab last showed", () => {
    const random = landingOn(6);
    expect(ambientTextureIndex(tabStorage("7"), random).peek()).toBe(7);
    expect(random).not.toHaveBeenCalled();
  });

  test("shows the pick an earlier screen of this page load made, and a room's texture once one is kept", () => {
    const ambient = ambientTextureIndex(tabStorage(), landingOn(6, 8));
    expect(ambient.get()).toBe(6);
    expect(ambient.peek()).toBe(6);
    ambient.keep(2);
    expect(ambient.peek()).toBe(2);
  });

  test("a kept value that is no texture's index counts as none, and unusable storage as none", () => {
    expect(ambientTextureIndex(tabStorage("52"), landingOn(6)).peek()).toBeUndefined();
    expect(ambientTextureIndex({ getItem: blocked, setItem: blocked }, landingOn(6)).peek()).toBeUndefined();
    expect(ambientTextureIndex(undefined, landingOn(6)).peek()).toBeUndefined();
  });

  test("a room that is not found then gets a pick like any screen outside a room", () => {
    const random = landingOn(6);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.get()).toBe(6);
    expect(ambient.peek()).toBe(6);
    expect(random).toHaveBeenCalledTimes(1);
  });
});

describe("a kept value that is not a texture's index", () => {
  test.each(["", " ", "abc", "2.5", "3.0", "-1", "-0", "52", "99", "1e0", "0x3", " 3", "3 ", "NaN", "Infinity", "null", "[3]"])(
    "%j is ignored, and the random pick shows",
    (kept) => {
      const ambient = ambientTextureIndex(tabStorage(kept), landingOn(5, 6));
      expect(ambient.get()).toBe(5);
      expect(ambient.get()).toBe(5);
    }
  );
});

describe("storage that cannot be used", () => {
  test("a read that throws leaves the random pick, held for the page load", () => {
    const ambient = ambientTextureIndex({ getItem: blocked, setItem: blocked }, landingOn(5, 1));
    expect(ambient.get()).toBe(5);
    expect(ambient.get()).toBe(5);
  });

  test("a write that throws leaves the room's texture in memory", () => {
    const ambient = ambientTextureIndex({ getItem: () => null, setItem: blocked }, landingOn(5));
    expect(() => ambient.keep(6)).not.toThrow();
    expect(ambient.get()).toBe(6);
  });

  test("a write that throws does not bring back an older room's texture", () => {
    const ambient = ambientTextureIndex({ getItem: () => "2", setItem: blocked }, landingOn(5));
    expect(ambient.get()).toBe(2);
    ambient.keep(6);
    expect(ambient.get()).toBe(6);
  });

  test("with reads and writes both throwing, the room's texture still replaces the pick", () => {
    const ambient = ambientTextureIndex({ getItem: blocked, setItem: blocked }, landingOn(5));
    expect(ambient.get()).toBe(5);
    ambient.keep(0);
    expect(ambient.get()).toBe(0);
  });

  test.each([undefined, null])("with no storage at all (%s) memory serves", (storage) => {
    const ambient = ambientTextureIndex(storage, landingOn(8, 1));
    expect(ambient.get()).toBe(8);
    expect(ambient.get()).toBe(8);
    ambient.keep(7);
    expect(ambient.get()).toBe(7);
  });

  test("the page's own ambient texture works where there is no sessionStorage, as in this test", () => {
    expect(typeof sessionStorage).toBe("undefined");
    const first = ambientTexture();
    expect(PICKED).toContain(TEXTURES.indexOf(first));
    expect(ambientTexture()).toBe(first);
    const room = TEXTURES[anotherOf(TEXTURES.indexOf(first))];
    expect(() => keepAmbientTexture(room)).not.toThrow();
    expect(ambientTexture()).toBe(room);
    // A texture that is not one of the list has no index to keep
    keepAmbientTexture({ ...TEXTURES[0] });
    expect(ambientTexture()).toBe(room);
  });
});

describe("keeping a room's texture", () => {
  test("replaces the one kept before, for this page load and the next", () => {
    const storage = tabStorage("2");
    const ambient = ambientTextureIndex(storage, landingOn(8));
    expect(ambient.get()).toBe(2);
    ambient.keep(5);
    expect(ambient.get()).toBe(5);
    expect(storage.getItem(KEY)).toBe("5");
    expect(ambientTextureIndex(storage, landingOn(8)).get()).toBe(5);
  });

  test("replaces the random pick of a tab that had shown no room", () => {
    const storage = tabStorage();
    const ambient = ambientTextureIndex(storage, landingOn(3));
    expect(ambient.get()).toBe(3);
    ambient.keep(8);
    expect(ambient.get()).toBe(8);
    expect(storage.setItem).toHaveBeenCalledWith(KEY, "8");
    expect(ambientTextureIndex(storage, landingOn(3)).get()).toBe(8);
  });

  test("the grid, index 0, is kept like any other", () => {
    const storage = tabStorage("7");
    const ambient = ambientTextureIndex(storage, landingOn(3));
    ambient.keep(0);
    expect(ambient.get()).toBe(0);
    expect(storage.getItem(KEY)).toBe("0");
    expect(ambientTextureIndex(storage, landingOn(3)).get()).toBe(0);
  });

  test.each([-1, 52, 2.5, NaN, Infinity])("%s is no texture's index, and changes nothing", (index) => {
    const storage = tabStorage("7");
    const ambient = ambientTextureIndex(storage, landingOn(3));
    ambient.keep(index);
    expect(ambient.get()).toBe(7);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

describe("the background as the server renders it", () => {
  beforeEach(() => {
    // A static render runs no layout effects, and React says so of the background's each time. Anything else it reports is shown
    const report = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) report(...args);
    });
  });

  test("a screen outside a room gets the paper with no texture, the same markup every time: the choice is the browser's", () => {
    const bare = '<div class="ec-paper" aria-hidden="true"></div>';
    for (let n = 0; n < 20; n++) expect(renderToStaticMarkup(createElement(RoomBackground))).toBe(bare);
    // Not even with a room's texture kept: the server serves every tab
    keepAmbientTexture(TEXTURES[5]);
    expect(renderToStaticMarkup(createElement(RoomBackground))).toBe(bare);
  });

  test.each(TEXTURES.map((texture, index) => [index, texture] as const))("a room's screen gets the room's texture (%i)", (_, texture) => {
    // The style attribute as the browser reads it, its quotes unescaped
    const html = renderToStaticMarkup(createElement(RoomBackground, { texture })).replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
    expect(html).toContain(`--tex-img:url("data:image/svg+xml,${encodeURIComponent(texture.svg)}");`);
    expect(html).toContain(`--tex-size:${texture.size};`);
    expect(html).toContain(`--blob-a:${texture.blobs[0]};`);
    expect(html).toContain(`--blob-b:${texture.blobs[1]}`);
  });
});

// The textures in the order rooms store them. An index a room holds goes on meaning the same texture, on the web and
// in the iPhone app, only while none of these moves: a new texture goes at the end
const KEYS = (
  "grid dots gingham sprinkles doodles stripes zigzag bubbles plaid alphabet " +
  "sakura seigaiha onigiri honeycomb argyle clouds asanoha cherries shippo terrazzo crossstitch paws waves " +
  "hearts brush pencil candylines jimmies minihearts dabs softcheck rainbowgrid swatches " +
  "squiggles memphis shapes " +
  "kikko usagi kakinohana fuji sankuzushi kiku hishi raimon kanoko nami fundo ume komezashi uroko kasumi yagasuri"
).split(" ");

/** The five blob tints, each under the name RoomTexture.swift gives it */
const TINTS: Record<string, string> = {
  "rgba(255, 122, 182, .18)": "pink",
  "rgba(59, 107, 255, .13)": "blue",
  "rgba(63, 220, 176, .2)": "mint",
  "rgba(167, 123, 255, .17)": "violet",
  "rgba(255, 210, 63, .26)": "yellow",
};

/** The width and height the texture's svg tag declares, in px */
function tileSize(svg: string) {
  const tag = /^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg' width='(\d+)' height='(\d+)'>/.exec(svg);
  if (!tag) throw new Error(`Not a tile: ${svg.slice(0, 80)}`);
  return { width: Number(tag[1]), height: Number(tag[2]) };
}

describe("the list of textures", () => {
  test("holds the 52 textures in the order rooms store them, each under its own key", () => {
    expect(KEYS).toHaveLength(52);
    expect(new Set(KEYS).size).toBe(52);
    expect(TEXTURES.map((texture) => texture.key)).toEqual(KEYS);
  });

  // A retired texture keeps its place in the list: its index goes on meaning it, for the rooms that have it and for
  // the builds of the iPhone app that offer it
  test("five of them are retired, each in its place: doodles, alphabet, brush, pencil and candylines", () => {
    expect(RETIRED).toEqual([4, 9, 24, 25, 26]);
    expect(RETIRED.map((index) => KEYS[index])).toEqual(["doodles", "alphabet", "brush", "pencil", "candylines"]);
    expect(PICKED).toHaveLength(47);
  });

  test("every texture has a name, and no two share one", () => {
    const names = TEXTURES.map((texture) => texture.name);
    for (const name of names) expect(name).toMatch(/^\S.*\S$/);
    expect(new Set(names).size).toBe(names.length);
  });

  test.each(TEXTURES.map((texture) => [texture.key, texture] as const))(
    "%s tiles at the size its svg is drawn at, between two blobs of different tints",
    (_, texture) => {
      const { width, height } = tileSize(texture.svg);
      expect(texture.size).toBe(width === height ? `${width}px` : `${width}px ${height}px`);
      expect(texture.svg.endsWith("</svg>")).toBe(true);
      // Single quotes throughout, as in the svg tag itself
      expect(texture.svg).not.toContain('"');

      expect(texture.blobs).toHaveLength(2);
      expect(Object.keys(TINTS)).toEqual(expect.arrayContaining(texture.blobs));
      expect(texture.blobs[0]).not.toBe(texture.blobs[1]);
    }
  );
});

describe("the texture a room is drawn with", () => {
  test.each(KEYS.map((key, index) => [index, key] as const))("a room that stores %i is drawn with %s, whatever its join code", (index, key) => {
    expect(TEXTURES[index].key).toBe(key);
    expect(textureForRoom({ background: index })).toBe(TEXTURES[index]);
    for (const joinCode of ["ABC234", "HJKL67", ""]) {
      expect(textureForRoom({ background: index, joinCode })).toBe(TEXTURES[index]);
    }
  });

  test.each(RETIRED)("a room that has the retired texture %i is drawn with it", (index) => {
    for (const joinCode of [undefined, "ABC234", "HJKL67"]) {
      const texture = textureForRoom({ background: index, joinCode });
      expect(texture).toBe(TEXTURES[index]);
      expect(texture.retired).toBe(true);
    }
  });

  // A room with no stored index is drawn by the FNV-1a hash of its join code, modulo ten: the first ten textures are
  // the ones every build of the web page and the iPhone app has, so they all draw such a room alike. Taken modulo 52,
  // the length of the list, the hash of every code here but GHJKLM, 2A3B4C and QRSTUV lands on another texture than
  // the one beside it. Two of the ten are retired, doodles and alphabet, and a code that lands on one is drawn with
  // it: an installed build draws it so
  const BY_JOIN_CODE: Array<[joinCode: string, index: number, key: string]> = [
    ["ABC234", 0, "grid"],
    ["ZZZZZZ", 1, "dots"],
    ["PQRS56", 2, "gingham"],
    ["W5X6Y7", 3, "sprinkles"],
    ["4W4B2H", 4, "doodles"],
    ["K7MNPQ", 5, "stripes"],
    ["GHJKLM", 6, "zigzag"],
    ["R3T5V8", 7, "bubbles"],
    ["2A3B4C", 8, "plaid"],
    ["HJKL67", 9, "alphabet"],
    ["QRSTUV", 6, "zigzag"],
    ["222222", 1, "dots"],
    ["EC5XF4", 4, "doodles"],
  ];

  test.each(BY_JOIN_CODE)("a room with no stored background and the join code %s is drawn with texture %i, %s", (joinCode, index, key) => {
    expect(textureForRoom({ joinCode })).toBe(TEXTURES[index]);
    expect(textureForRoom({ joinCode }).key).toBe(key);
  });

  // What a build is handed when the host's app has a texture it does not: every build that does not know the index
  // then draws the room by its join code
  test.each([52, 53, 99, -1, 1.5, NaN, Infinity])("a stored %s is no texture here, and the room is drawn by its join code", (background) => {
    for (const [joinCode, index] of BY_JOIN_CODE) {
      expect(textureForRoom({ background, joinCode }), joinCode).toBe(TEXTURES[index]);
    }
  });

  // The hash worked out here, apart from lib/textures.ts, for 1,024 codes that differ in their first two characters:
  // each of the ten is reached, the two retired ones among them, and none of the other 42
  test("the join code picks among all of the first ten, whichever of them are retired", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const reached = new Set<number>();
    for (const a of chars) {
      for (const b of chars) {
        const joinCode = `${a}${b}C234`;
        let hash = 0x811c9dc5;
        for (let i = 0; i < joinCode.length; i++) hash = Math.imul(hash ^ joinCode.charCodeAt(i), 0x01000193) >>> 0;
        expect(textureForRoom({ joinCode }), joinCode).toBe(TEXTURES[hash % 10]);
        reached.add(hash % 10);
      }
    }
    expect([...reached].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("with no join code either, and with no room at all, it is the grid", () => {
    for (const room of [{}, { joinCode: "" }, { background: 52 }, { background: 52, joinCode: "" }, null, undefined]) {
      expect(textureForRoom(room)).toBe(TEXTURES[0]);
    }
  });
});

// The iPhone app keeps its own list (RoomTexture.all in apps/ios/Theme/RoomTexture.swift) and draws each texture from
// a PNG of the tile at three pixels to the px (Assets.xcassets/Textures). Both are read here as files
describe("the iPhone app's textures", () => {
  const ios = fileURLToPath(new URL("../../../ios/", import.meta.url));

  /** The entries of RoomTexture.all as the file writes them, one to a line: a key, two blobs, and `retired: true` on a retired one */
  function inSwift() {
    const swift = readFileSync(`${ios}Theme/RoomTexture.swift`, "utf8");
    // From the list's opening bracket to the line that closes it
    const list = /static let all: \[RoomTexture\] = \[\n([\s\S]*?)\n {4}\]/.exec(swift)?.[1] ?? "";
    const entries = [...list.matchAll(/RoomTexture\(\s*key:\s*"([^"]*)",\s*blobA:\s*(\w+),\s*blobB:\s*(\w+)\s*(?:,\s*retired:\s*(true|false)\s*)?\)/g)];
    return { lines: list.split("\n").length, entries: entries.map(([, key, blobA, blobB, retired]) => ({ key, blobs: [blobA, blobB], retired: retired === "true" })) };
  }

  test("are the web's: the same keys in the same order, each with the same two blobs", () => {
    const { lines, entries } = inSwift();
    expect(entries.map(({ key, blobs }) => ({ key, blobs }))).toEqual(
      TEXTURES.map((texture) => ({ key: texture.key, blobs: texture.blobs.map((tint) => TINTS[tint]) }))
    );
    // Every line of the list is an entry that was read
    expect(lines).toBe(entries.length);
  });

  // The app's own picks leave out the textures it marks retired, so the marks are held to the web's, and through
  // them to the server's
  test("are retired where the web's are: the same five, and no other", () => {
    const { entries } = inSwift();
    expect(entries.flatMap((entry, index) => (entry.retired ? [index] : []))).toEqual(RETIRED);
    expect(entries.filter((entry) => entry.retired).map((entry) => entry.key)).toEqual(["doodles", "alphabet", "brush", "pencil", "candylines"]);
  });

  // The pick behind the start screen, the Random button and the mock API. No Swift test runs it: the Swift package
  // does not compile RoomTexture.swift. So its body is held here as the file writes it: any of the textures that
  // are not retired, but the one it is told to leave out
  test("the app's own pick, RoomTexture.randomIndex, is made among the textures that are not retired", () => {
    const swift = readFileSync(`${ios}Theme/RoomTexture.swift`, "utf8");
    // From the function's opening line to the line that closes it
    const body = /\n {4}static func randomIndex\(not current: Int\? = nil\) -> Int \{\n([\s\S]*?)\n {4}\}\n/.exec(swift)?.[1] ?? "";
    expect(body.split("\n").map((line) => line.trim())).toEqual([
      "let offered = all.indices.filter { !all[$0].retired && $0 != current }",
      "return offered.randomElement() ?? 0",
    ]);
  });

  test.each(TEXTURES.map((texture) => [texture.key, texture] as const))(
    "%s has its tile in the asset catalog, at three times the size of the svg",
    (key, texture) => {
      const imageset = `${ios}Assets.xcassets/Textures/tex-${key}.imageset/`;
      expect(existsSync(`${imageset}tex-${key}.png`)).toBe(true);
      expect(JSON.parse(readFileSync(`${imageset}Contents.json`, "utf8")).images).toContainEqual(
        expect.objectContaining({ filename: `tex-${key}.png`, scale: "3x" })
      );
      // A PNG's header holds its width and height as two 32-bit numbers, from byte 16
      const png = readFileSync(`${imageset}tex-${key}.png`);
      const { width, height } = tileSize(texture.svg);
      expect({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) }).toEqual({ width: width * 3, height: height * 3 });
    }
  );
});

// The server has no list of its own. It holds how many textures there are and which of them are retired, by index
// (BACKGROUND_COUNT and RETIRED_BACKGROUNDS in convex/rooms.ts). The file is read here as text, and so is its
// backup copy
describe("the server's textures", () => {
  const COPIES = ["../../convex/rooms.ts", "../../../convex/convex/rooms.ts"];

  function onServer(copy: string) {
    const source = readFileSync(fileURLToPath(new URL(copy, import.meta.url)), "utf8");
    const count = /^const BACKGROUND_COUNT = (\d+);$/m.exec(source);
    const retired = /^const RETIRED_BACKGROUNDS = \[([\d, ]*)\];$/m.exec(source);
    if (!count || !retired) throw new Error(`No count or no retired textures in ${copy}`);
    return { count: Number(count[1]), retired: retired[1].split(",").map((index) => Number(index.trim())) };
  }

  test.each(COPIES)("%s counts the textures there are", (copy) => {
    expect(onServer(copy).count).toBe(TEXTURES.length);
  });

  test.each(COPIES)("%s names each retired texture once, by its index in the list", (copy) => {
    const { count, retired } = onServer(copy);
    expect(retired.length).toBeGreaterThan(0);
    expect(new Set(retired).size).toBe(retired.length);
    for (const index of retired) expect(Number.isInteger(index) && index >= 0 && index < count, String(index)).toBe(true);
  });

  // The server's own pick is made among the first ten that are not retired, and never lands on the texture of the
  // room it is for, so two of the ten at least are left to it
  test.each(COPIES)("%s leaves the server's pick two of the first ten at least", (copy) => {
    const { retired } = onServer(copy);
    expect(retired.filter((index) => index < 10).length).toBeLessThanOrEqual(8);
  });

  test.each(COPIES)("%s retires the textures the list marks retired", (copy) => {
    expect(onServer(copy).retired).toEqual(RETIRED);
  });
});
