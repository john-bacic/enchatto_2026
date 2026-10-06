import { describe, expect, test } from "vitest";
import { byId, sameValue, stableList } from "../../lib/stable";

// lib/stable.ts: a query answers with new objects every time, also for what did not change. stableList puts the
// objects of the answer before in place of the ones that hold the same, so that a component which is drawn again
// only for another object (React.memo: the message list and its bubbles) is drawn for what changed and for
// nothing else. The hook around it, useStableList, is held where the room page uses it: room-live.test.tsx.

interface Message {
  _id: string;
  senderId: string;
  status: string;
  text?: string;
  waveform?: number[];
  processing?: { translatedText?: string; romaji?: string; suggestions?: string[]; error?: string };
}

const hello = (): Message => ({
  _id: "m1",
  senderId: "sam",
  status: "processed",
  text: "Hello!",
  processing: { translatedText: "こんにちは！", romaji: "konnichiwa!", suggestions: ["Hi!", "Hey"] },
});
const voice = (): Message => ({ _id: "m2", senderId: "mika", status: "processed", waveform: [0.1, 0.5, 0.9] });
const waiting = (): Message => ({ _id: "m3", senderId: "yuki", status: "pending", text: "行きましょう" });

/** The same messages as the server sends them again: new objects all the way down */
const again = (messages: Message[]): Message[] => JSON.parse(JSON.stringify(messages));

describe("whether two values hold the same", () => {
  test("numbers, strings, booleans, null and undefined: by value", () => {
    expect(sameValue(1, 1)).toBe(true);
    expect(sameValue("a", "a")).toBe(true);
    expect(sameValue(NaN, NaN)).toBe(true);
    expect(sameValue(null, null)).toBe(true);
    expect(sameValue(undefined, undefined)).toBe(true);
    expect(sameValue(1, 2)).toBe(false);
    expect(sameValue(1, "1")).toBe(false);
    expect(sameValue(0, false)).toBe(false);
    expect(sameValue(null, undefined)).toBe(false);
    expect(sameValue(null, {})).toBe(false);
  });

  test("arrays: item by item, in order", () => {
    expect(sameValue([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(sameValue([], [])).toBe(true);
    expect(sameValue([1, 2], [2, 1])).toBe(false);
    expect(sameValue([1, 2], [1, 2, 3])).toBe(false);
    expect(sameValue([1, 2, 3], [1, 2])).toBe(false);
    expect(sameValue([1, [2, 3]], [1, [2, 4]])).toBe(false);
  });

  test("objects: field by field, whatever order the fields were written in", () => {
    expect(sameValue({ a: 1, b: { c: [1] } }, { b: { c: [1] }, a: 1 })).toBe(true);
    expect(sameValue({}, {})).toBe(true);
    expect(sameValue({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameValue({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(sameValue({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(sameValue({ a: 1 }, { b: 1 })).toBe(false);
    expect(sameValue({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
  });

  test("a field that holds undefined is not the same as no field", () => {
    expect(sameValue({ a: 1, b: undefined }, { a: 1 })).toBe(false);
    expect(sameValue({ a: undefined }, { b: undefined })).toBe(false);
    expect(sameValue({ a: undefined }, { a: undefined })).toBe(true);
  });

  test("a field is the object's own: one every object inherits does not count", () => {
    expect(sameValue({ toString: Object.prototype.toString }, { other: Object.prototype.toString })).toBe(false);
  });

  test("a place in an array that holds nothing is the same only as another such place", () => {
    const gap = (...rest: unknown[]) => [, ...rest];
    expect(sameValue(gap(1), [2, 1])).toBe(false);
    expect(sameValue([2, 1], gap(1))).toBe(false);
    expect(sameValue(gap(1), [undefined, 1])).toBe(false);
    expect(sameValue([undefined, 1], gap(1))).toBe(false);
    expect(sameValue(gap(1), gap(1))).toBe(true);
    expect(sameValue(gap(1), gap(2))).toBe(false);
    expect(sameValue({ list: gap(1) }, { list: [{ a: 1 }, 1] })).toBe(false);
  });

  test("an array is not the object with its fields", () => {
    expect(sameValue([1], { 0: 1 })).toBe(false);
    expect(sameValue({ 0: 1 }, [1])).toBe(false);
    expect(sameValue([], {})).toBe(false);
  });

  test("an object that is not plain is the same only as itself", () => {
    const date = new Date(0);
    expect(sameValue(date, date)).toBe(true);
    expect(sameValue(new Date(0), new Date(0))).toBe(false);
    expect(sameValue(new Date(0), new Date(1))).toBe(false);
    expect(sameValue(new Uint8Array([1]).buffer, new Uint8Array([2]).buffer)).toBe(false);
    expect(sameValue(new Map(), new Map())).toBe(false);
    expect(sameValue({ at: new Date(0) }, { at: new Date(0) })).toBe(false);
    // An object made with no prototype is plain
    expect(sameValue(Object.assign(Object.create(null), { a: 1 }), { a: 1 })).toBe(true);
  });
});

describe("a list beside the list before it", () => {
  test("nothing changed: the answer is the list before, with its own objects", () => {
    const before = [hello(), voice(), waiting()];
    expect(stableList(before, again(before), byId)).toBe(before);
    expect(stableList(before, before, byId)).toBe(before);
    const none: Message[] = [];
    expect(stableList(none, [], byId)).toBe(none);
  });

  test("one item changed: that item is the new one, and every other is the object it was", () => {
    const before = [hello(), voice(), waiting()];
    const next = again(before);
    next[2] = { ...next[2], status: "processed", processing: { translatedText: "Let's go" } };
    const list = stableList(before, next, byId);
    expect(list).not.toBe(before);
    expect(list).toEqual(next);
    expect(list[0]).toBe(before[0]);
    expect(list[1]).toBe(before[1]);
    expect(list[2]).toBe(next[2]);
  });

  test("a change deep inside an item makes it the new one", () => {
    const before = [hello(), voice()];
    const romaji = again(before);
    romaji[0].processing!.romaji = "konnichiwa";
    expect(stableList(before, romaji, byId)[0]).toBe(romaji[0]);
    const suggestion = again(before);
    suggestion[0].processing!.suggestions!.push("Yo");
    expect(stableList(before, suggestion, byId)[0]).toBe(suggestion[0]);
    const failed = again(before);
    failed[0].processing = { error: "Translation failed" };
    expect(stableList(before, failed, byId)[0]).toBe(failed[0]);
    const wave = again(before);
    wave[1].waveform![2] = 0.8;
    const list = stableList(before, wave, byId);
    expect(list[0]).toBe(before[0]);
    expect(list[1]).toBe(wave[1]);
  });

  test("a field that came or went makes the item the new one", () => {
    const before = [hello(), waiting()];
    const translated = again(before);
    translated[1].processing = {};
    expect(stableList(before, translated, byId)[1]).toBe(translated[1]);
    const bare = again(before);
    delete bare[0].processing;
    expect(stableList(before, bare, byId)[0]).toBe(bare[0]);
  });

  test("an item is added: the ones that were there are the objects they were", () => {
    const before = [hello(), voice()];
    const next = [...again(before), waiting()];
    const list = stableList(before, next, byId);
    expect(list).toEqual(next);
    expect(list[0]).toBe(before[0]);
    expect(list[1]).toBe(before[1]);
    expect(list[2]).toBe(next[2]);
    // At the front as at the end
    const front = stableList(before, [waiting(), ...again(before)], byId);
    expect(front.map((m) => m._id)).toEqual(["m3", "m1", "m2"]);
    expect(front[1]).toBe(before[0]);
    expect(front[2]).toBe(before[1]);
  });

  test("an item is removed: the rest are the objects they were, in a list of their own", () => {
    const before = [hello(), voice(), waiting()];
    const next = again(before).filter((m) => m._id !== "m2");
    const list = stableList(before, next, byId);
    expect(list).not.toBe(before);
    expect(list.length).toBe(2);
    expect(list[0]).toBe(before[0]);
    expect(list[1]).toBe(before[2]);
    // The last one removed: as long as the list before, less one
    const shorter = stableList(before, again(before).slice(0, 2), byId);
    expect(shorter).not.toBe(before);
    expect(shorter[1]).toBe(before[1]);
    expect(stableList(before, [], byId)).toEqual([]);
  });

  test("the order changes: each item is the object it was, in the new order", () => {
    const before = [hello(), voice(), waiting()];
    const [a, b, c] = again(before);
    const list = stableList(before, [c, a, b], byId);
    expect(list).not.toBe(before);
    expect(list[0]).toBe(before[2]);
    expect(list[1]).toBe(before[0]);
    expect(list[2]).toBe(before[1]);
  });

  test("an item is found by its key, not by where it stands: another item in its place is the new one", () => {
    const before = [hello(), voice()];
    const other = { ...hello(), _id: "m9" };
    const list = stableList(before, [other, ...again(before).slice(1)], byId);
    expect(list[0]).toBe(other);
    expect(list[1]).toBe(before[1]);
  });

  test("neither list is changed", () => {
    const before = [hello(), voice()];
    const next = again(before);
    next[0].text = "Hello again!";
    const kept = [[...before], [...next]];
    stableList(before, next, byId);
    expect(before).toEqual(kept[0]);
    expect(before[0]).toBe(kept[0][0]);
    expect(next[1]).toBe(kept[1][1]);
    expect(before[0].text).toBe("Hello!");
  });

  test("any field can be the key", () => {
    type Summary = { messageId: string; reactions: { emoji: string; count: number; participantIds: string[] }[] };
    const byMessage = (summary: Summary) => summary.messageId;
    const before: Summary[] = [
      { messageId: "m1", reactions: [{ emoji: "👍", count: 2, participantIds: ["yuki", "sam"] }] },
      { messageId: "m2", reactions: [{ emoji: "🔥", count: 1, participantIds: ["sam"] }] },
    ];
    const next: Summary[] = JSON.parse(JSON.stringify(before));
    next[1].reactions[0] = { emoji: "🔥", count: 2, participantIds: ["sam", "yuki"] };
    const list = stableList(before, next, byMessage);
    expect(list[0]).toBe(before[0]);
    expect(list[1]).toBe(next[1]);
  });
});

describe("the people of a room, as the message list is handed them", () => {
  interface Person {
    _id: string;
    nickname: string;
    role: string;
    avatar: { type: string; value: string };
    online: boolean;
    typingAction?: string;
    lastSeenAt: number;
  }
  // The fields the room page hands the list of each person. What the page itself hands down is held in
  // room-live.test.tsx
  const shown = (people: Person[]) => people.map(({ _id, nickname, role, avatar }) => ({ _id, nickname, role, avatar }));
  const people = (): Person[] => [
    { _id: "yuki", nickname: "Yuki", role: "participant", avatar: { type: "preset", value: "cat" }, online: true, lastSeenAt: 1000 },
    { _id: "sam", nickname: "Sam", role: "participant", avatar: { type: "preset", value: "whale" }, online: true, lastSeenAt: 1000 },
  ];

  test("a heartbeat, a keystroke or a tab put away changes nobody: the list is the one before", () => {
    const before = shown(people());
    const [yuki, sam] = people();
    const next = shown([{ ...yuki, lastSeenAt: 16_000 }, { ...sam, lastSeenAt: 18_000, typingAction: "typing", online: false }]);
    expect(stableList(before, next, byId)).toBe(before);
  });

  test("another name or another avatar changes that person, and nobody else", () => {
    const before = shown(people());
    const [yuki, sam] = people();
    const renamed = stableList(before, shown([yuki, { ...sam, nickname: "Sammy", lastSeenAt: 18_000 }]), byId);
    expect(renamed[0]).toBe(before[0]);
    expect(renamed[1]).toEqual({ _id: "sam", nickname: "Sammy", role: "participant", avatar: { type: "preset", value: "whale" } });
    const redrawn = stableList(before, shown([{ ...yuki, avatar: { type: "preset", value: "fox" } }, sam]), byId);
    expect(redrawn[0].avatar.value).toBe("fox");
    expect(redrawn[1]).toBe(before[1]);
  });
});
