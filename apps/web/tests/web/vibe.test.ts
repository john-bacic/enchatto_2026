import { describe, expect, test } from "vitest";
import { HYPE_AT, computeVibe, formatVibe, type VibeMessage } from "../../lib/vibe";

// lib/vibe.ts: the room header's VIBE number, worked out in the browser from the messages the page holds.
// The number is the chatter of the last 60 seconds, 12 a message and 20 more each time the language changes from
// one message to the next, times a multiplier that grows with the combo: the run of messages at the end of the
// chat that each answer the one before in the other language. System lines (joins, game results) count for nothing.
// The page passes the clock and how a message's language is told; here a message's sender is its language.

const NOW = Date.parse("2026-10-03T12:00:00Z");
const SECOND = 1000;

let serial = 0;
/** A message written in `lang`, sent `ago` milliseconds before NOW */
const said = (lang: "en" | "ja", ago: number, kind = "text"): VibeMessage => ({
  _id: `m${++serial}`,
  senderId: lang,
  kind,
  createdAt: NOW - ago,
});
const langOf = (m: VibeMessage) => m.senderId;
const vibeOf = (messages: VibeMessage[]) => computeVibe(messages, langOf, NOW);

/** `count` messages a second apart, the last one a second ago, each in the other language than the one before */
const backAndForth = (count: number) =>
  Array.from({ length: count }, (_, i) => said(i % 2 === 0 ? "en" : "ja", (count - i) * SECOND));

describe("the number", () => {
  test("is 0 in a room where nothing has been said", () => {
    expect(vibeOf([])).toEqual({ vibe: 0, combo: 0, mult: 1, hype: false, recentCount: 0, switches: 0 });
  });

  test("counts 12 for each message of the last 60 seconds, times the multiplier", () => {
    // One language throughout: no switch, and a combo of 1, which multiplies by 1.05
    expect(vibeOf([said("en", 1 * SECOND)])).toMatchObject({ recentCount: 1, switches: 0, combo: 1, vibe: 13 });
    const five = [5, 4, 3, 2, 1].map((s) => said("en", s * SECOND));
    expect(vibeOf(five)).toMatchObject({ recentCount: 5, switches: 0, combo: 1, vibe: 63 });
  });

  test("drops a message 60 seconds after it was sent", () => {
    expect(vibeOf([said("en", 60 * SECOND - 1)])).toMatchObject({ recentCount: 1, vibe: 13 });
    expect(vibeOf([said("en", 60 * SECOND)])).toMatchObject({ recentCount: 0, vibe: 0 });
  });

  test("adds 20 each time the language changes from one message to the next", () => {
    const chat = [said("en", 30 * SECOND), said("ja", 20 * SECOND), said("en", 10 * SECOND)];
    // (3 × 12 + 2 × 20) × 1.15, the multiplier of a combo of 3
    expect(vibeOf(chat)).toMatchObject({ recentCount: 3, switches: 2, combo: 3, vibe: 87 });
  });

  test("counts a change of language only between two messages of the last 60 seconds", () => {
    const chat = [said("en", 70 * SECOND), said("ja", 10 * SECOND)];
    // The older message still makes the combo 2: 12 × 1.1
    expect(vibeOf(chat)).toMatchObject({ recentCount: 1, switches: 0, combo: 2, vibe: 13 });
  });
});

describe("the combo", () => {
  test("is the run of messages at the end that each answer the one before in the other language", () => {
    const chat = [said("en", 5 * SECOND), said("en", 4 * SECOND), said("ja", 3 * SECOND), said("en", 2 * SECOND), said("ja", 1 * SECOND)];
    expect(vibeOf(chat).combo).toBe(4);
  });

  test("starts again at 1 when a message follows one in the same language", () => {
    const chat = [said("ja", 3 * SECOND), said("en", 2 * SECOND), said("en", 1 * SECOND)];
    expect(vibeOf(chat).combo).toBe(1);
  });

  test("does not reach back over a gap of more than 90 seconds", () => {
    const answeredLate = (gap: number) => [said("en", 10 * SECOND + gap), said("ja", 10 * SECOND)];
    expect(vibeOf(answeredLate(90 * SECOND)).combo).toBe(2);
    expect(vibeOf(answeredLate(90 * SECOND + 1)).combo).toBe(1);
  });

  test("is over once the last message is 90 seconds old", () => {
    const chat = (ago: number) => [said("en", ago + SECOND), said("ja", ago)];
    expect(vibeOf(chat(90 * SECOND - 1))).toMatchObject({ combo: 2, mult: 1.1 });
    expect(vibeOf(chat(90 * SECOND))).toMatchObject({ combo: 0, mult: 1 });
  });

  test("reaches back past the 60 seconds the number counts", () => {
    const chat = [
      said("en", 80 * SECOND),
      said("ja", 75 * SECOND),
      said("en", 70 * SECOND),
      said("ja", 40 * SECOND),
      said("en", 30 * SECOND),
      said("ja", 20 * SECOND),
      said("en", 10 * SECOND),
    ];
    // (4 × 12 + 3 × 20) × 1.35
    expect(vibeOf(chat)).toMatchObject({ recentCount: 4, switches: 3, combo: 7, vibe: 146 });
  });
});

describe("the multiplier", () => {
  test("is 1 plus 0.05 for each message of the combo", () => {
    expect(vibeOf(backAndForth(1)).mult).toBeCloseTo(1.05, 10);
    expect(vibeOf(backAndForth(4)).mult).toBeCloseTo(1.2, 10);
    expect(vibeOf(backAndForth(10)).mult).toBeCloseTo(1.5, 10);
  });

  test("stops growing at a combo of 20, where it doubles the number", () => {
    // (20 × 12 + 19 × 20) × 2
    expect(vibeOf(backAndForth(20))).toMatchObject({ combo: 20, mult: 2, vibe: 1240 });
    // (25 × 12 + 24 × 20) × 2: the combo itself goes on counting
    expect(vibeOf(backAndForth(25))).toMatchObject({ combo: 25, mult: 2, vibe: 1560 });
  });
});

describe("hype", () => {
  test("is on from 150", () => {
    expect(HYPE_AT).toBe(150);
    const ago = (seconds: number[], langs: string) =>
      seconds.map((s, i) => said(langs[i] === "e" ? "en" : "ja", s * SECOND));
    // (8 × 12 + 2 × 20) × 1.1 = 149.6, shown as 150
    expect(vibeOf(ago([8, 7, 6, 5, 4, 3, 2, 1], "eeejjjje"))).toMatchObject({ vibe: 150, hype: true });
    // One message fewer: (7 × 12 + 2 × 20) × 1.1 = 136.4
    expect(vibeOf(ago([7, 6, 5, 4, 3, 2, 1], "eejjjje"))).toMatchObject({ vibe: 136, hype: false });
  });
});

describe("system lines", () => {
  test("alone make no vibe", () => {
    const lines = [said("en", 2 * SECOND, "system"), said("ja", 1 * SECOND, "system")];
    expect(vibeOf(lines)).toEqual({ vibe: 0, combo: 0, mult: 1, hype: false, recentCount: 0, switches: 0 });
  });

  test("are not counted, and neither break a combo nor make a change of language", () => {
    const chat = [said("en", 3 * SECOND), said("ja", 2 * SECOND)];
    const withLines = [said("ja", 4 * SECOND, "system"), chat[0], said("en", 2500, "system"), chat[1], said("ja", 1 * SECOND, "system")];
    expect(vibeOf(withLines)).toEqual(vibeOf(chat));
    expect(vibeOf(chat)).toMatchObject({ recentCount: 2, switches: 1, combo: 2, vibe: 48 });
  });
});

describe("formatVibe", () => {
  test("writes a number below 1,000 as it is", () => {
    expect(formatVibe(0)).toBe("0");
    expect(formatVibe(999)).toBe("999");
  });

  test("writes thousands with a K and one decimal, which is left out when it is 0", () => {
    expect(formatVibe(1000)).toBe("1K");
    expect(formatVibe(1500)).toBe("1.5K");
    expect(formatVibe(2000)).toBe("2K");
    expect(formatVibe(12_300)).toBe("12.3K");
  });
});
