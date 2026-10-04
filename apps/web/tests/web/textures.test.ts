import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RoomBackground } from "../../components/ui/effects";
import { TEXTURES, ambientTexture, ambientTextureIndex, keepAmbientTexture } from "../../lib/textures";

// lib/textures.ts: the "ambient" texture, the one a screen outside a room shows. The rule runs here over a stand-in
// for the tab's sessionStorage and a source of random numbers that gives what the test asks for. One call of
// ambientTextureIndex is one page load; the same storage handed to a second call is a reload of the tab.
// RoomBackground puts the ambient texture on in an effect, and no effect runs here (see CLAUDE.md): what is tested of
// it is the server's half, the markup the browser's first render has to match.

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

/** Random numbers that land on these indexes in turn, each in the middle of its tenth */
function landingOn(...indexes: number[]) {
  let calls = 0;
  return vi.fn(() => (indexes[calls++ % indexes.length] + 0.5) / TEXTURES.length);
}

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

  test.each(TEXTURES.map((_, index) => index))("texture %i is read back", (index) => {
    expect(ambientTextureIndex(tabStorage(String(index)), landingOn((index + 1) % TEXTURES.length)).get()).toBe(index);
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

  test("the pick covers all ten textures and nothing else", () => {
    expect(TEXTURES).toHaveLength(10);
    const pick = (value: number) => ambientTextureIndex(tabStorage(), () => value).get();
    expect(TEXTURES.map((_, index) => pick((index + 0.5) / TEXTURES.length))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    // Math.random gives from 0 up to, never, 1
    expect(pick(0)).toBe(0);
    expect(pick(1 - Number.EPSILON)).toBe(9);
    const seen = new Set<number>();
    for (let n = 0; n < 1000; n++) seen.add(pick(n / 1000));
    expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("a screen that is waiting for its room", () => {
  test("picks no texture in a tab that has none: the room's own is on its way", () => {
    const random = landingOn(4);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.peek()).toBeUndefined();
    expect(random).not.toHaveBeenCalled();
  });

  test("shows the texture of the room the tab last showed", () => {
    const random = landingOn(4);
    expect(ambientTextureIndex(tabStorage("7"), random).peek()).toBe(7);
    expect(random).not.toHaveBeenCalled();
  });

  test("shows the pick an earlier screen of this page load made, and a room's texture once one is kept", () => {
    const ambient = ambientTextureIndex(tabStorage(), landingOn(4, 8));
    expect(ambient.get()).toBe(4);
    expect(ambient.peek()).toBe(4);
    ambient.keep(2);
    expect(ambient.peek()).toBe(2);
  });

  test("a kept value that is no texture's index counts as none, and unusable storage as none", () => {
    expect(ambientTextureIndex(tabStorage("12"), landingOn(4)).peek()).toBeUndefined();
    expect(ambientTextureIndex({ getItem: blocked, setItem: blocked }, landingOn(4)).peek()).toBeUndefined();
    expect(ambientTextureIndex(undefined, landingOn(4)).peek()).toBeUndefined();
  });

  test("a room that is not found then gets a pick like any screen outside a room", () => {
    const random = landingOn(4);
    const ambient = ambientTextureIndex(tabStorage(), random);
    expect(ambient.peek()).toBeUndefined();
    expect(ambient.get()).toBe(4);
    expect(ambient.peek()).toBe(4);
    expect(random).toHaveBeenCalledTimes(1);
  });
});

describe("a kept value that is not a texture's index", () => {
  test.each(["", " ", "abc", "2.5", "3.0", "-1", "-0", "10", "99", "1e0", "0x3", " 3", "3 ", "NaN", "Infinity", "null", "[3]"])(
    "%j is ignored, and the random pick shows",
    (kept) => {
      const ambient = ambientTextureIndex(tabStorage(kept), landingOn(4, 6));
      expect(ambient.get()).toBe(4);
      expect(ambient.get()).toBe(4);
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
    const ambient = ambientTextureIndex(storage, landingOn(9, 1));
    expect(ambient.get()).toBe(9);
    expect(ambient.get()).toBe(9);
    ambient.keep(4);
    expect(ambient.get()).toBe(4);
  });

  test("the page's own ambient texture works where there is no sessionStorage, as in this test", () => {
    expect(typeof sessionStorage).toBe("undefined");
    const first = ambientTexture();
    expect(TEXTURES).toContain(first);
    expect(ambientTexture()).toBe(first);
    const room = TEXTURES[(TEXTURES.indexOf(first) + 1) % TEXTURES.length];
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
    const ambient = ambientTextureIndex(storage, landingOn(9));
    expect(ambient.get()).toBe(2);
    ambient.keep(5);
    expect(ambient.get()).toBe(5);
    expect(storage.getItem(KEY)).toBe("5");
    expect(ambientTextureIndex(storage, landingOn(9)).get()).toBe(5);
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

  test.each([-1, 10, 2.5, NaN, Infinity])("%s is no texture's index, and changes nothing", (index) => {
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
    keepAmbientTexture(TEXTURES[4]);
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
