import { describe, expect, test } from "vitest";
import { HYPE_AT, computeVibe, formatVibe, sameVibe, vibeAt, type Vibe, type VibeMessage } from "../../lib/vibe";

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
    // The changes counted are those among the last 60 seconds' messages, wherever they stand in the chat
    const lateChange = [said("en", 80 * SECOND), said("en", 70 * SECOND), said("ja", 20 * SECOND), said("en", 10 * SECOND)];
    expect(vibeOf(lateChange)).toMatchObject({ recentCount: 2, switches: 1 });
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

// ─── The meter's clock ───────────────────────────────────────────────────────

// hooks/use-vibe.ts reads the meter with vibeAt each time the page is drawn, at a clock it moves every 5 seconds,
// and a move of the clock draws the page only when sameVibe says that a number changed. No effect runs here (see
// CLAUDE.md), so the hook itself is not run: a page is played through a room's messages by the two functions the
// hook is made of, beside a page that is drawn again at every move of its clock. At every step the two show the
// same numbers. The page opens at NOW, and times are seconds after that. The hook itself, with its clock, runs on
// the mounted page in room-live.test.tsx.

const TICK = 5;

/** A message on its way to the page: it arrives `at` seconds after the page opened, having been sent at `sentAt` */
interface Arrival {
  at: number;
  message: VibeMessage;
}
const arrives = (at: number, lang: "en" | "ja", sentAt = at, kind = "text"): Arrival => ({
  at,
  message: { _id: `m${++serial}`, senderId: lang, kind, createdAt: NOW + sentAt * SECOND },
});

/**
 * The page from when it opens to `seconds` later, as useVibe keeps it: a message that arrives draws the page, and
 * so does a move of the clock that changes a number. Gives what the page shows after everything that happened at
 * a time, and the times at which the clock drew it. `held` is what the room already held when the page opened.
 */
function play(arrivals: Arrival[], seconds: number, held: VibeMessage[] = []) {
  const steps: { at: number; message?: VibeMessage }[] = [...arrivals];
  for (let at = TICK; at <= seconds; at += TICK) steps.push({ at });
  // A message that arrives at a move of the clock arrives first
  steps.sort((a, b) => a.at - b.at || Number(!a.message) - Number(!b.message));

  let messages = held;
  let clock = NOW;
  let shown = vibeAt(messages, langOf, clock);
  const shownAt = new Map<number, Vibe>([[0, shown]]);
  const clockDraws: number[] = [];
  for (const step of steps) {
    if (step.message) {
      // The room's query answers its messages in the order they were sent
      messages = [...messages, step.message].sort((a, b) => a.createdAt - b.createdAt);
      shown = vibeAt(messages, langOf, clock);
    } else {
      clock = NOW + step.at * SECOND;
      if (!sameVibe(shown, vibeAt(messages, langOf, clock))) {
        shown = vibeAt(messages, langOf, clock);
        clockDraws.push(step.at);
      }
    }
    // The page that is drawn at every move of its clock reads the meter at the last move, or at its newest
    // message when that is later
    const everyMove = computeVibe(messages, langOf, Math.max(clock, messages[messages.length - 1]?.createdAt ?? 0));
    expect({ at: step.at, ...shown }).toEqual({ at: step.at, ...everyMove });
    shownAt.set(step.at, shown);
  }
  return { at: (time: number) => shownAt.get(time)!, clockDraws };
}

describe("the meter's clock", () => {
  const NOTHING = { vibe: 0, combo: 0, mult: 1, hype: false, recentCount: 0, switches: 0 };

  test("draws nothing in a room where nothing is said", () => {
    expect(play([], 600).clockDraws).toEqual([]);
    // Nor in a room whose last message is older than the 90 seconds a combo lasts
    const old = [said("en", 300 * SECOND), said("ja", 200 * SECOND)];
    const room = play([], 600, old);
    expect(room.at(0)).toEqual(NOTHING);
    expect(room.clockDraws).toEqual([]);
  });

  test("lets the number fall after the last message, and draws only at the moves where it falls", () => {
    const room = play([arrives(2, "en"), arrives(13, "ja"), arrives(24, "en")], 180);
    // (3 × 12 + 2 × 20) × 1.15
    expect(room.at(24)).toMatchObject({ recentCount: 3, switches: 2, combo: 3, vibe: 87 });
    expect(room.at(60)).toEqual(room.at(24));
    // A message leaves the count at the first move of the clock 60 seconds or more after it was sent
    expect(room.at(65)).toMatchObject({ recentCount: 2, switches: 1, combo: 3, vibe: 51 });
    expect(room.at(75)).toMatchObject({ recentCount: 1, switches: 0, combo: 3, vibe: 14 });
    expect(room.at(85)).toMatchObject({ recentCount: 0, combo: 3, vibe: 0 });
    // The combo is over 90 seconds after the last message: the number stays 0, the multiplier goes back to 1
    expect(room.at(110)).toMatchObject({ vibe: 0, combo: 3, mult: 1.15 });
    expect(room.at(115)).toEqual(NOTHING);
    expect(room.clockDraws).toEqual([65, 75, 85, 115]);
  });

  test("shows a message that arrives between two moves at once, and reads the meter at that message's time", () => {
    const room = play([arrives(2, "en"), arrives(63.5, "ja")], 180);
    expect(room.at(60)).toMatchObject({ recentCount: 1, combo: 1, vibe: 13 });
    // The clock stands at 60 s. At 63.5 s the first message is over a minute old, and the second answers it: 12 × 1.1
    expect(room.at(63.5)).toMatchObject({ recentCount: 1, switches: 0, combo: 2, vibe: 13 });
    expect(room.at(120)).toEqual(room.at(63.5));
    expect(room.at(125)).toMatchObject({ recentCount: 0, vibe: 0, combo: 2 });
    expect(room.clockDraws).toEqual([125, 155]);
  });

  test("starts hype with the message that brings the number to 150, and ends it at a move of the clock", () => {
    const chat = [arrives(1.5, "en"), arrives(2.5, "ja"), arrives(3.5, "en"), arrives(4.5, "ja"), arrives(6.5, "en")];
    const room = play(chat, 180);
    // (4 × 12 + 3 × 20) × 1.2 = 129.6, then (5 × 12 + 4 × 20) × 1.25
    expect(room.at(4.5)).toMatchObject({ vibe: 130, hype: false });
    expect(room.at(6.5)).toMatchObject({ vibe: 175, hype: true });
    expect(room.at(60)).toMatchObject({ vibe: 175, hype: true });
    // The first four messages are a minute old at the move at 65: 12 × 1.25 is left
    expect(room.at(65)).toMatchObject({ recentCount: 1, combo: 5, vibe: 15, hype: false });
    expect(room.clockDraws).toEqual([65, 70, 100]);
  });

  test("counts a message that reaches the page late from where the clock stands", () => {
    // A tab that was offline for a while is handed what was said meanwhile. At 201 s the clock stands at 200 s
    const room = play([arrives(201, "en", 100), arrives(201, "ja", 150)], 300);
    // The first is 100 seconds old and is not counted, though the second, 50 seconds old, answers it: 12 × 1.1
    expect(room.at(201)).toMatchObject({ recentCount: 1, switches: 0, combo: 2, vibe: 13 });
    expect(room.at(205)).toMatchObject({ recentCount: 1, vibe: 13 });
    expect(room.at(210)).toMatchObject({ recentCount: 0, vibe: 0, combo: 2 });
    expect(room.clockDraws).toEqual([210, 240]);
  });

  test("counts a message from its own time where the browser's clock is behind the server's", () => {
    // Sent at what the browser takes for 37 s, it arrives at 7 s
    const room = play([arrives(7, "en", 37)], 180);
    expect(room.at(7)).toMatchObject({ recentCount: 1, combo: 1, vibe: 13 });
    expect(room.at(95)).toMatchObject({ recentCount: 1, vibe: 13 });
    expect(room.at(100)).toMatchObject({ recentCount: 0, vibe: 0, combo: 1 });
    expect(room.clockDraws).toEqual([100, 130]);
  });

  test("shows what a page drawn at every move shows, in rooms made at random", () => {
    // mulberry32: the same rooms at every run
    let state = 20261003;
    const random = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let moves = 0;
    let draws = 0;
    for (let room = 0; room < 300; room++) {
      const arrivals: Arrival[] = [];
      // Stretches of quick chat and of silence
      let gap = 1;
      for (let at = random() * 10; at < 400; at += gap * (0.5 + random())) {
        if (random() < 0.2) gap = random() < 0.5 ? 0.5 + random() * 3 : 10 + random() * 120;
        const time = Math.round(at * 10) / 10;
        // One in ten was sent long before it arrives, one in ten is ahead of the browser's clock
        const roll = random();
        const sentAt = roll < 0.1 ? time - random() * 200 : roll < 0.2 ? time + random() * 40 : time;
        arrivals.push(arrives(time, random() < 0.5 ? "en" : "ja", sentAt, random() < 0.15 ? "system" : "text"));
      }
      const played = play(arrivals, 400);
      moves += 400 / TICK;
      draws += played.clockDraws.length;
    }
    // The equality is checked at every step inside play. Most moves of the clock change nothing
    expect(draws).toBeGreaterThan(0);
    expect(draws).toBeLessThan(moves / 2);
  });
});

describe("sameVibe", () => {
  test("is true for two readings of the same numbers", () => {
    const chat = backAndForth(4);
    expect(sameVibe(vibeOf(chat), vibeOf([...chat]))).toBe(true);
  });

  test("is false when any one number differs", () => {
    const reading = vibeOf(backAndForth(4));
    const others: Vibe[] = [
      { ...reading, vibe: reading.vibe + 1 },
      { ...reading, combo: reading.combo + 1 },
      { ...reading, mult: reading.mult + 0.05 },
      { ...reading, hype: !reading.hype },
      { ...reading, recentCount: reading.recentCount + 1 },
      { ...reading, switches: reading.switches + 1 },
    ];
    // One for each number a reading holds
    expect(others.length).toBe(Object.keys(reading).length);
    for (const other of others) expect(sameVibe(reading, other)).toBe(false);
  });
});
