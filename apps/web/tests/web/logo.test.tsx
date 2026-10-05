import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Logo, Wordmark, hopDelay, tappedLetter } from "@/components/ui/logo";

// The "Enchatto" letters of the room's header (Wordmark in components/ui/logo.tsx). A sent message hops them one after
// the other from the first, and a tap hops them from the tapped letter to both sides. Tested here: the rule for how
// long each letter waits, the rule for which letter a tap is on, and the markup, rendered with react-dom/server.
// There is no DOM, so nothing is tapped and no animation runs: what a tap does to the page is not covered.

const TEXT = "Enchatto";
const letters = [...TEXT].map((_, i) => i);

/** The seconds between two letters of a wave: the stylesheet has them, the letters only carry a number of steps */
const stagger = Number(
  /\.ec-wordmark\.hop i \{[^}]*animation-delay: calc\(var\(--i\) \* ([\d.]+)s\);/.exec(
    readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8"),
  )?.[1],
);

/** The seconds each letter waits, to the hundredth: 0.12 * 3 is 0.36 only up to the last bit */
const waits = (tapped: number | null) => letters.map((i) => Math.round(hopDelay(i, tapped, stagger) * 100) / 100);

describe("how long each letter waits before it hops", () => {
  test("the stylesheet starts a letter 0.12 s after the one a step before it", () => {
    expect(stagger).toBe(0.12);
  });

  test("a sent message: one letter after the other, from the first", () => {
    expect(waits(null)).toEqual([0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84]);
  });

  test("a tap on the first letter runs the same way", () => {
    expect(waits(0)).toEqual(waits(null));
  });

  test("a tap on a letter in the middle: that letter at once, then its neighbours on both sides", () => {
    expect(waits(3)).toEqual([0.36, 0.24, 0.12, 0, 0.12, 0.24, 0.36, 0.48]);
  });

  test("a tap on the last letter runs back to the first", () => {
    expect(waits(7)).toEqual([0.84, 0.72, 0.6, 0.48, 0.36, 0.24, 0.12, 0]);
  });

  test.each(letters)("a tap on letter %i: it hops at once, the others 0.12 s later per letter away", (tapped) => {
    expect(hopDelay(tapped, tapped, stagger)).toBe(0);
    for (const i of letters) {
      expect(hopDelay(i, tapped, stagger)).toBeCloseTo(Math.abs(i - tapped) * 0.12, 10);
      // A letter as far to the left as another is to the right hops with it
      const mirrored = 2 * tapped - i;
      if (letters.includes(mirrored)) expect(hopDelay(mirrored, tapped, stagger)).toBe(hopDelay(i, tapped, stagger));
    }
  });

  test("in steps, which is what the letters carry, the wait is a whole number", () => {
    expect(letters.map((i) => hopDelay(i, null, 1))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(letters.map((i) => hopDelay(i, 5, 1))).toEqual([5, 4, 3, 2, 1, 0, 1, 2]);
  });
});

describe("the letter a tap is on", () => {
  // Where the middle of each letter is in the room's header, 390 px wide: the two t are the narrow ones
  const middles = [70.4, 82.2, 91.7, 101.6, 111.1, 118.6, 123.9, 132];

  test("a tap on the middle of a letter is on that letter", () => {
    expect(middles.map((x) => tappedLetter(x, middles))).toEqual(letters);
  });

  test("between two letters it is the nearer one", () => {
    expect(tappedLetter(76, middles)).toBe(0);
    expect(tappedLetter(77, middles)).toBe(1);
    expect(tappedLetter(121, middles)).toBe(5);
    expect(tappedLetter(122, middles)).toBe(6);
  });

  test("left of the first letter it is the first, right of the last it is the last", () => {
    expect(tappedLetter(0, middles)).toBe(0);
    expect(tappedLetter(64, middles)).toBe(0);
    expect(tappedLetter(137, middles)).toBe(7);
    expect(tappedLetter(1000, middles)).toBe(7);
  });

  test("no point along the wordmark is on no letter, and the letters come in order", () => {
    const hit = [];
    for (let x = 60; x <= 140; x += 0.25) hit.push(tappedLetter(x, middles));
    expect([...new Set(hit)]).toEqual(letters);
    expect(hit).toEqual([...hit].sort((a, b) => a - b));
  });

  test("a wordmark of one letter", () => {
    expect(tappedLetter(5, [100])).toBe(0);
  });
});

describe("the markup", () => {
  // What the wordmark renders while no letter has been tapped, letter by letter. A tap must not change what a sent
  // message renders, and the home page's logo is made of the same letters
  const ROW = [
    '<div class="ec-logo-top" role="img" aria-label="Enchatto">',
    '<i data-c="E" style="--r:-7deg;--dy:0px;--d:0s;--i:0;--c:#3b6bff">E</i>',
    '<i data-c="n" style="--r:6deg;--dy:-5px;--d:-0.18s;--i:1;--c:#ff7ab6">n</i>',
    '<i data-c="c" style="--r:-7deg;--dy:0px;--d:-0.36s;--i:2;--c:#3fdcb0">c</i>',
    '<i data-c="h" style="--r:6deg;--dy:-5px;--d:-0.54s;--i:3;--c:#a77bff">h</i>',
    '<i data-c="a" style="--r:-7deg;--dy:0px;--d:-0.72s;--i:4;--c:#3b6bff">a</i>',
    '<i data-c="t" style="--r:6deg;--dy:-5px;--d:-0.8999999999999999s;--i:5;--c:#ff7ab6">t</i>',
    '<i data-c="t" style="--r:-7deg;--dy:0px;--d:-1.08s;--i:6;--c:#3fdcb0">t</i>',
    '<i data-c="o" style="--r:6deg;--dy:-5px;--d:-1.26s;--i:7;--c:#a77bff">o</i>',
    "</div>",
  ].join("");

  /** The header's wordmark as the room page renders it */
  const wordmark = (hopKey: number, hot = false) =>
    renderToStaticMarkup(<Wordmark text={TEXT} size={22} hopKey={hopKey} hot={hot} />);

  test("before any message the letters are still", () => {
    expect(wordmark(0)).toBe(`<div class="ec-wordmark" style="--fs:22px">${ROW}</div>`);
  });

  test("a sent message hops them from the first letter: every letter carries its own place as its steps", () => {
    expect(wordmark(1)).toBe(`<div class="ec-wordmark hop" style="--fs:22px">${ROW}</div>`);
  });

  test("every later message renders the same: it is the remount that plays the hop again", () => {
    expect(wordmark(2)).toBe(wordmark(1));
    expect(wordmark(40)).toBe(wordmark(1));
  });

  test("hot keeps them hopping, whatever the message count", () => {
    expect(wordmark(0, true)).toBe(`<div class="ec-wordmark hot" style="--fs:22px">${ROW}</div>`);
    expect(wordmark(3, true)).toBe(wordmark(0, true));
  });

  test("without props it is a still Enchatto at 24 px", () => {
    expect(renderToStaticMarkup(<Wordmark />)).toBe(`<div class="ec-wordmark" style="--fs:24px">${ROW}</div>`);
  });

  test.each([
    ["still", wordmark(0)],
    ["after a message", wordmark(1)],
    ["hot", wordmark(0, true)],
  ])("%s it is one image named Enchatto: not a button, not in the tab order", (_, html) => {
    expect(html.split('role="').length - 1).toBe(1);
    expect(html).toContain('role="img" aria-label="Enchatto"');
    expect(html).not.toMatch(/tabindex|<button|<a |onclick|aria-pressed|aria-haspopup/i);
  });

  test("the home page's logo is made of the same letters, and they are not the header's wordmark", () => {
    const home = renderToStaticMarkup(<Logo tagline="CHAT ACROSS LANGUAGES" />);
    expect(home.split(ROW).length - 1).toBe(1);
    expect(home.split("<i ").length - 1).toBe(TEXT.length);
    expect(home).not.toContain("ec-wordmark");
    expect(home.startsWith('<div class="ec-logo" style="--fs:54px">')).toBe(true);
  });
});
