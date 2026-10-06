// rooms.ts and participants.ts: creating, joining, presence, leaving, kicking, the update mutations, closing,
// the two sweeps the crons run, and the /api/rooms/* and /api/participants/* routes the iOS host calls.
// The caller-token rules (AUTH_MODE, requireCaller and friends) have their own file; setRoomBackground is
// held to them here, beside its other tests.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import crons from "../../convex/crons";
import { isAround, isPresent } from "../../convex/participants";
import { Backend, createRoom, joinGuest, newBackend, tokenFor } from "./setup";

const START = new Date("2026-10-03T12:00:00Z").getTime();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Moves the clock without running anything that was scheduled */
function clockTo(ms: number) {
  vi.setSystemTime(START + ms);
}

function settings(over: Partial<Doc<"rooms">["settings"]> = {}): Doc<"rooms">["settings"] {
  return {
    sourceLanguage: "en",
    targetLanguage: "ja",
    romajiEnabled: true,
    suggestionsEnabled: true,
    maxParticipants: 10,
    ...over,
  };
}

async function roomRow(t: Backend, roomId: Id<"rooms">): Promise<Doc<"rooms">> {
  const room = await t.run((ctx) => ctx.db.get(roomId));
  if (!room) throw new Error(`No room ${roomId}`);
  return room;
}

async function person(t: Backend, participantId: Id<"participants">): Promise<Doc<"participants">> {
  const participant = await t.run((ctx) => ctx.db.get(participantId));
  if (!participant) throw new Error(`No participant ${participantId}`);
  return participant;
}

async function people(t: Backend, roomId: Id<"rooms">): Promise<Doc<"participants">[]> {
  return await t.query(api.participants.getRoomParticipants, { roomId });
}

/** The room's system messages, oldest first: what the chat shows as "X joined" and "X left" */
async function announcements(t: Backend, roomId: Id<"rooms">): Promise<string[]> {
  const messages = await t.run((ctx) =>
    ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
      .collect()
  );
  return messages.filter((m) => m.kind === "system").map((m) => m.text ?? "");
}

/** Everything a mutation has asked the scheduler to run, run or not */
async function scheduled(t: Backend) {
  return await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
}

function heartbeat(t: Backend, participantId: Id<"participants">, presence?: "online" | "away") {
  return t.mutation(api.participants.setParticipantOnline, { participantId, online: true, presence });
}

function goOffline(t: Backend, participantId: Id<"participants">) {
  return t.mutation(api.participants.setParticipantOnline, { participantId, online: false });
}

/** What the web's unload beacon calls */
function leave(t: Backend, participantId: Id<"participants">) {
  return t.mutation(api.participants.leaveRoom, { participantId });
}

/** A room id of the right kind that points at nothing */
async function deletedRoom(t: Backend): Promise<Id<"rooms">> {
  const { roomId, hostId } = await createRoom(t);
  await t.run(async (ctx) => {
    await ctx.db.delete(hostId);
    await ctx.db.delete(roomId);
  });
  return roomId;
}

/** POSTs JSON the way ConvexHTTPClient does */
async function post(t: Backend, path: string, body: unknown) {
  const res = await t.fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, body: await res.json() };
}

/**
 * Replaces Math.random with a fixed sequence (mulberry32), so that a test of many random picks gives the same
 * result on every run. Undone by mockRestore or restoreAllMocks.
 */
function seedRandom(seed: number) {
  let state = seed >>> 0;
  return vi.spyOn(Math, "random").mockImplementation(() => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = Math.imul(state ^ (state >>> 15), state | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  });
}

/** A device token in the shape APNs gives out: 64 hex characters */
const DEVICE_TOKEN = "9e8d7c6b".repeat(8);

/** The retired textures, by index: a room is given none of them any more, and one that has one keeps it */
const RETIRED = [4, 9, 24, 25, 26];
/** The textures the server's own pick is made among: the first ten, less the retired ones */
const PICKED = [0, 1, 2, 3, 5, 6, 7, 8];

/**
 * A room that has `background`, whatever it is: a retired texture, as a room made before that one was retired
 * can have, or none, as a room from before the index was stored.
 */
async function roomWith(t: Backend, background: number | undefined) {
  const made = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 0 });
  await t.run((ctx) => ctx.db.patch(made.roomId, { background }));
  return made;
}

/**
 * The draws that land in one texture's share of the range when the pick is made among `count` textures: one
 * just inside each end of the share, and its middle.
 */
function drawsFor(k: number, count: number): number[] {
  return [(k + 0.001) / count, (k + 0.5) / count, (k + 0.999) / count];
}

/**
 * Keeps console.warn out of the test's output and collects the lines a failed caller check writes:
 * "auth: <function> <reason>". `clear` forgets the lines so far.
 */
function authLog() {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  return {
    lines: () => warn.mock.calls.map((args) => args.join(" ")).filter((line) => line.startsWith("auth:")),
    clear: () => warn.mockClear(),
  };
}

// ─── createRoom ──────────────────────────────────────────────────────────────

describe("createRoom", () => {
  test("makes a waiting room whose host is an online iOS participant", async () => {
    const t = newBackend();
    const { roomId, hostId, joinCode } = await createRoom(t, { hostNickname: "Mika" });

    const state = await t.query(api.rooms.getRoomState, { roomId });
    expect(state?.room).toMatchObject({ status: "waiting", hostId, joinCode, createdAt: START });
    expect(state?.room.closedAt).toBeUndefined();
    expect(state?.participants).toHaveLength(1);
    expect(state?.participants[0]).toMatchObject({
      _id: hostId,
      roomId,
      nickname: "Mika",
      role: "host",
      platform: "ios",
      avatar: { type: "preset", value: "default" },
      online: true,
      lastSeenAt: START,
      joinedAt: START,
    });
  });

  // The room document goes whole to every guest's page and to the host app, which reads the keys it knows
  // (Room.swift) and passes over the rest
  test("the room document is these fields and no other, on the row and in everything that sends it", async () => {
    const t = newBackend();
    const { roomId, hostId, joinCode } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const room = {
      _id: roomId,
      _creationTime: expect.any(Number),
      joinCode,
      status: "waiting",
      settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 10 },
      hostId,
      createdAt: START,
      background: 3,
      // Every reaction the room will have is stored with its id (reactions.ts)
      reactionsByRoom: true,
    };

    expect(await roomRow(t, roomId)).toStrictEqual(room);
    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room).toStrictEqual(room);
    expect(await t.query(api.rooms.getRoomByJoinCode, { joinCode })).toStrictEqual(room);
    expect((await post(t, "/api/rooms/state", { roomId })).body.room).toStrictEqual(room);
    expect((await post(t, "/api/rooms/snapshot", { roomId, participantId: hostId })).body.room).toStrictEqual(room);
  });

  test("gives a six-character join code with no 0, 1, I or O, and the code finds the room", async () => {
    const t = newBackend();
    // Not left to chance: these draws step through every position of the generator's alphabet, so a
    // character that should not be there turns up in one of the codes
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    const first = await createRoom(t);
    const found = await t.query(api.rooms.getRoomByJoinCode, { joinCode: first.joinCode });
    expect(found?._id).toBe(first.roomId);

    const used = new Set<string>(first.joinCode);
    expect(first.joinCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    for (let i = 0; i < 40; i++) {
      const { joinCode } = await createRoom(t);
      expect(joinCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
      for (const character of joinCode) used.add(character);
    }
    // All 32 turned up: the codes above held every character a code can hold
    expect([...used].sort().join("")).toBe("23456789ABCDEFGHJKLMNPQRSTUVWXYZ");
  });

  test("uses the default settings when the host sends none", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    expect((await roomRow(t, roomId)).settings).toEqual({
      sourceLanguage: "ja",
      targetLanguage: "en",
      romajiEnabled: true,
      suggestionsEnabled: true,
      maxParticipants: 10,
    });
  });

  test("the host nickname is trimmed and must then be 1 to 30 characters", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t, { hostNickname: "  Mika  " });
    expect((await person(t, hostId)).nickname).toBe("Mika");
    const longest = await createRoom(t, { hostNickname: "x".repeat(30) });
    expect((await person(t, longest.hostId)).nickname).toHaveLength(30);

    for (const hostNickname of ["", "   ", "x".repeat(31)]) {
      await expect(t.mutation(api.rooms.createRoom, { hostNickname })).rejects.toThrow(/Nickname must be/);
    }
  });

  test("maxParticipants must be between 2 and 50", async () => {
    const t = newBackend();
    for (const maxParticipants of [2, 50]) {
      const { roomId } = await t.mutation(api.rooms.createRoom, {
        hostNickname: "Mika",
        settings: settings({ maxParticipants }),
      });
      expect((await roomRow(t, roomId)).settings.maxParticipants).toBe(maxParticipants);
    }
    for (const maxParticipants of [1, 51, 0, -5, Infinity]) {
      await expect(
        t.mutation(api.rooms.createRoom, { hostNickname: "Mika", settings: settings({ maxParticipants }) })
      ).rejects.toThrow(/Max participants/);
    }
  });

  // 93ed5d0: `max < 2 || max > 50` let NaN through, and a room with NaN seats refuses nobody
  test("a maxParticipants that is not a number (NaN) is refused", async () => {
    const t = newBackend();
    await expect(
      t.mutation(api.rooms.createRoom, { hostNickname: "Mika", settings: settings({ maxParticipants: NaN }) })
    ).rejects.toThrow(/Max participants/);
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(0);
  });

  // The iOS host decodes maxParticipants as Int, and its own room's state would never decode
  test("a maxParticipants that is not a whole number is refused, by the mutation and by rooms/create", async () => {
    const t = newBackend();
    for (const maxParticipants of [2.5, 10.000001, 49.5]) {
      await expect(
        t.mutation(api.rooms.createRoom, { hostNickname: "Mika", settings: settings({ maxParticipants }) })
      ).rejects.toThrow(/Max participants/);
    }
    const res = await post(t, "/api/rooms/create", { hostNickname: "Mika", settings: settings({ maxParticipants: 2.5 }) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Max participants/);
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(0);
  });

  test("an avatar id over 64 characters and a language code over 16 are refused", async () => {
    const t = newBackend();
    await expect(
      t.mutation(api.rooms.createRoom, { hostNickname: "Mika", hostAvatarId: "a".repeat(65) })
    ).rejects.toThrow(/Invalid avatar/);
    await expect(
      t.mutation(api.rooms.createRoom, { hostNickname: "Mika", settings: settings({ sourceLanguage: "e".repeat(17) }) })
    ).rejects.toThrow(/Unsupported language/);
    await expect(
      t.mutation(api.rooms.createRoom, { hostNickname: "Mika", settings: settings({ targetLanguage: "j".repeat(17) }) })
    ).rejects.toThrow(/Unsupported language/);
  });

  // Review bug 19: the host was always stored with the room's source language, whatever they had chosen
  test("the host's own language is stored when the app sends it", async () => {
    const t = newBackend();
    const { hostId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Mika",
      hostLanguage: "ja",
      settings: settings({ sourceLanguage: "en", targetLanguage: "ja" }),
    });
    expect((await person(t, hostId)).preferredLanguage).toBe("ja");
  });

  test("a host language that is missing or not one the apps offer falls back to the room's source language", async () => {
    const t = newBackend();
    const base = { hostNickname: "Mika", settings: settings({ sourceLanguage: "en" }) };
    const older = await t.mutation(api.rooms.createRoom, base);
    expect((await person(t, older.hostId)).preferredLanguage).toBe("en");
    const odd = await t.mutation(api.rooms.createRoom, { ...base, hostLanguage: "fr" });
    expect((await person(t, odd.hostId)).preferredLanguage).toBe("en");
  });

  test("two rooms made one after the other never get the same background", async () => {
    const t = newBackend();
    // Every one of these draws picks the same texture: without the rule every room would get it. They are
    // not one constant, so that the rooms' join codes, which come from the same draws, are not all alike
    const sameTexture = [0.15, 0.17, 0.2, 0.23];
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => sameTexture[draws++ % sameTexture.length]);
    const backgrounds: number[] = [];
    for (let i = 0; i < 4; i++) {
      const { roomId } = await createRoom(t);
      const state = await t.query(api.rooms.getRoomState, { roomId });
      backgrounds.push(state?.room.background ?? -1);
    }
    for (const [i, background] of backgrounds.entries()) {
      // One of the first ten textures, the ones every build of both apps ships
      expect(Number.isInteger(background) && background >= 0 && background <= 9).toBe(true);
      if (i > 0) expect(background).not.toBe(backgrounds[i - 1]);
    }
  });

  test("the server's pick can be any of the first ten textures that are not retired and no other, and createRoom answers with the one the room got", async () => {
    const t = newBackend();
    // These draws step through the whole range, so the picks reach both ends of those eight
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    const picked = new Set<number>();
    let last = -1;
    for (let i = 0; i < 50; i++) {
      const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika" });
      expect((await roomRow(t, created.roomId)).background).toBe(created.background);
      expect(PICKED).toContain(created.background);
      expect(created.background).not.toBe(last);
      last = created.background;
      picked.add(created.background);
    }
    expect([...picked].sort()).toEqual(PICKED);
  });

  // The host app chooses the texture, so that a room can look like the start screen it was made from
  test("the room gets the background the app asks for, any of the 31 textures that are not retired, and createRoom answers with it", async () => {
    const t = newBackend();
    const random = vi.spyOn(Math, "random");
    const asked = Array.from({ length: 36 }, (_, background) => background).filter((background) => !RETIRED.includes(background));
    expect(asked).toHaveLength(31);
    for (const background of asked) {
      random.mockClear();
      const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background });
      expect(created.background).toBe(background);
      // The six draws of the join code, and none for a pick
      expect(random).toHaveBeenCalledTimes(6);
      expect((await roomRow(t, created.roomId)).background).toBe(background);
    }
  });

  // An installed build's list still offers the retired textures, and its start screen can be drawn on one
  test("a retired background the app asks for is not a refusal: the room gets the server's pick, as if none was sent", async () => {
    // The same draws for both backends, so the server picks the same textures in both
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    const unasked = newBackend();
    const picks: number[] = [];
    for (let i = 0; i < RETIRED.length; i++) {
      picks.push((await unasked.mutation(api.rooms.createRoom, { hostNickname: "Mika" })).background);
    }

    draws = 0;
    const t = newBackend();
    const made = [];
    for (const background of RETIRED) {
      made.push(await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background }));
    }
    // Read once every room is made: looking into the backend takes a draw of its own
    for (const [i, created] of made.entries()) {
      const stored = (await roomRow(t, created.roomId)).background;
      expect(PICKED).toContain(stored);
      expect(created.background).toBe(stored);
      expect(stored).toBe(picks[i]);
    }
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(RETIRED.length);
  });

  test("the background the app asks for is kept when the room before has the same one: only the server's pick avoids it", async () => {
    const t = newBackend();
    for (let i = 0; i < 3; i++) {
      const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 6 });
      expect(created.background).toBe(6);
      expect((await roomRow(t, created.roomId)).background).toBe(6);
    }
  });

  test("the server's pick differs from the room before when the app chose that room's background", async () => {
    // Every one of these draws picks the same texture, as in the test of two rooms made one after the other
    const sameTexture = [0.15, 0.17, 0.2, 0.23];
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => sameTexture[draws++ % sameTexture.length]);
    // The texture those draws pick when no room is in the way
    const alone = (await newBackend().mutation(api.rooms.createRoom, { hostNickname: "Mika" })).background;

    const t = newBackend();
    await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: alone });
    const next = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika" });
    expect(next.background).not.toBe(alone);
    expect(Number.isInteger(next.background) && next.background >= 0 && next.background <= 9).toBe(true);
    expect((await roomRow(t, next.roomId)).background).toBe(next.background);
  });

  // A build that names no background has the tiles of the first ten textures only, so the server picks among
  // those, less the retired ones, whatever the room before has. A room before with any other texture is in the
  // way of none of the eight
  test("the server's pick stays among the first ten textures that are not retired after a room with any of the 36, and is never that room's", async () => {
    seedRandom(36);
    const t = newBackend();
    // What leaves the pick to the server: no background, a retired one, and a number that is not a texture
    const unnamed = [undefined, 36, 4, -1, 26, 1.5, NaN];
    const afterOther = new Set<number>();
    // Each texture is the room before 14 times, twice with each of the seven above
    for (let n = 0; n < 36 * 14; n++) {
      const before = n % 36;
      await roomWith(t, before);
      const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: unnamed[n % unnamed.length] });
      const picked = created.background;
      expect(PICKED, `${picked} after ${before}`).toContain(picked);
      expect(picked, `after ${before}`).not.toBe(before);
      expect((await roomRow(t, created.roomId)).background).toBe(picked);
      if (!PICKED.includes(before)) afterOther.add(picked);
    }
    expect([...afterOther].sort()).toEqual(PICKED);
  });

  // The pick with its draw named: each texture it is made among has an equal share of the range, in the order of
  // the list. The room before is in the way only with one of the eight: a retired texture and one past the first
  // ten leave all eight, and so does a room with no stored background
  describe("the server's pick, draw by draw", () => {
    const BEFORE: Array<[what: string, background: number | undefined, has: boolean]> = [
      ["no room", undefined, false],
      ["a room with no stored background", undefined, true],
      ...PICKED.map((background): [string, number, boolean] => [`a room with texture ${background}`, background, true]),
      ["a room with the retired texture 4", 4, true],
      ["a room with the retired texture 9", 9, true],
      ["a room with the retired texture 24", 24, true],
      ["a room with texture 10", 10, true],
      ["a room with texture 35", 35, true],
    ];

    test.each(BEFORE)("after %s", async (_, before, hasRoom) => {
      const random = seedRandom(8);
      const t = newBackend();
      if (hasRoom) await roomWith(t, before);
      const among = PICKED.filter((background) => background !== before);
      expect(among).toHaveLength(before !== undefined && PICKED.includes(before) ? 7 : 8);

      // What leaves the pick to the server: no background, each retired one, and a number that is not a texture
      for (const asked of [undefined, ...RETIRED, 36, -1, 1.5, NaN]) {
        for (const [k, picked] of among.entries()) {
          for (const draw of drawsFor(k, among.length)) {
            random.mockReturnValueOnce(draw);
            const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: asked });
            // The room is taken away again, so that the one before it stays the last room made
            const stored = await t.run(async (ctx) => {
              const row = await ctx.db.get(created.roomId);
              await ctx.db.delete(created.hostId);
              await ctx.db.delete(created.roomId);
              return row?.background;
            });
            expect({ asked, draw, answered: created.background, stored }).toEqual({ asked, draw, answered: picked, stored: picked });
          }
        }
      }
    });
  });

  // -1 and 36 are one past each end of the list, and NaN is neither below the list nor above it. The iOS host
  // decodes the room's background as Int, so a fraction that was stored would fail every poll of the room
  test("a background that is not one of the textures is not a refusal: the room gets the server's pick, as if none was sent", async () => {
    const notTextures = [-1, 36, 1.5, NaN, Infinity];
    // The same draws for both backends, so the server picks the same textures in both
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    const unasked = newBackend();
    const picks: number[] = [];
    for (let i = 0; i < notTextures.length; i++) {
      picks.push((await unasked.mutation(api.rooms.createRoom, { hostNickname: "Mika" })).background);
    }

    draws = 0;
    const t = newBackend();
    const made = [];
    for (const background of notTextures) {
      made.push(await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background }));
    }
    // Read once every room is made: looking into the backend takes a draw of its own
    for (const [i, created] of made.entries()) {
      const stored = (await roomRow(t, created.roomId)).background ?? -1;
      // The pick is made among the first ten
      expect(Number.isInteger(stored) && stored >= 0 && stored <= 9).toBe(true);
      expect(created.background).toBe(stored);
      expect(stored).toBe(picks[i]);
    }
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(notTextures.length);
  });
});

// ─── joinRoom ────────────────────────────────────────────────────────────────

describe("joinRoom", () => {
  test("adds the guest as an online participant with what they chose", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const displaySettings = { showEnglish: true, showJapanese: true, showRomaji: false };
    const guestId = await t.mutation(api.participants.joinRoom, {
      roomId,
      nickname: "Ana",
      platform: "web",
      avatar: { type: "preset", value: "panda" },
      preferredLanguage: "ja",
      displaySettings,
    });
    expect(await person(t, guestId)).toMatchObject({
      roomId,
      nickname: "Ana",
      role: "participant",
      platform: "web",
      avatar: { type: "preset", value: "panda" },
      preferredLanguage: "ja",
      displaySettings,
      online: true,
      presence: "online",
      lastSeenAt: START,
      joinedAt: START,
    });
  });

  test("the first join turns a waiting room active and is announced in the chat", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    expect((await roomRow(t, roomId)).status).toBe("waiting");
    await joinGuest(t, roomId, "Ana");
    expect((await roomRow(t, roomId)).status).toBe("active");
    expect(await announcements(t, roomId)).toEqual(["join:Ana"]);
  });

  test("the nickname is trimmed and must then be 1 to 30 characters", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "  Ana ");
    expect((await person(t, guestId)).nickname).toBe("Ana");
    for (const nickname of ["", "   ", "x".repeat(31)]) {
      await expect(joinGuest(t, roomId, nickname)).rejects.toThrow(/Nickname must be/);
    }
    expect(await people(t, roomId)).toHaveLength(2);
  });

  test("an avatar value over 64 characters and a language code over 16 are refused", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await expect(joinGuest(t, roomId, "Ana", { avatar: "a".repeat(65) })).rejects.toThrow(/Invalid avatar/);
    await expect(joinGuest(t, roomId, "Ana", { language: "e".repeat(17) })).rejects.toThrow(/Unsupported language/);
  });

  test("a closed room takes no new guests", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(joinGuest(t, roomId, "Ana")).rejects.toThrow(/Room is closed/);
  });

  test("a room that does not exist is reported as not found", async () => {
    const t = newBackend();
    const roomId = await deletedRoom(t);
    await expect(joinGuest(t, roomId, "Ana")).rejects.toThrow(/Room not found/);
  });

  test("a new guest is refused once the people online, the host included, reach maxParticipants", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Mika",
      settings: settings({ maxParticipants: 2 }),
    });
    await joinGuest(t, roomId, "Ana");
    await expect(joinGuest(t, roomId, "Ben", { avatar: "cat" })).rejects.toThrow(/Room is full/);
    expect(await people(t, roomId)).toHaveLength(2);
  });

  test("a seat frees up when someone goes offline", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Mika",
      settings: settings({ maxParticipants: 2 }),
    });
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    const ben = await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    expect((await person(t, ben)).online).toBe(true);
  });

  test("a guest who left and joins again with the same name and avatar gets their own participant back", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana", { avatar: "panda", language: "en" });
    await heartbeat(t, ana, "away"); // the tab was in the background when it closed, as on a phone
    await leave(t, ana);
    clockTo(5 * MINUTE);
    const again = await joinGuest(t, roomId, "Ana", { avatar: "panda", language: "ja" });
    expect(again).toBe(ana);
    expect(await people(t, roomId)).toHaveLength(2);

    // Back in the room: online, not departed, announced, and with the language chosen this time
    const row = await person(t, ana);
    expect(row).toMatchObject({ online: true, presence: "online", preferredLanguage: "ja", lastSeenAt: START + 5 * MINUTE });
    expect(row.departed).toBeUndefined();
    expect(row.joinedAt).toBe(START);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana", "join:Ana"]);
  });

  test("the match on the name ignores case and spaces around it", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const first = await joinGuest(t, roomId, "Ana");
    await goOffline(t, first);
    expect(await joinGuest(t, roomId, "  aNA ")).toBe(first);
  });

  test("the same name with another avatar is a new participant", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const first = await joinGuest(t, roomId, "Ana", { avatar: "panda" });
    await leave(t, first);
    const other = await joinGuest(t, roomId, "Ana", { avatar: "cat" });
    expect(other).not.toBe(first);
    expect((await person(t, first)).online).toBe(false);
  });

  test("a second person with the name and avatar of someone who is online gets their own participant", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const first = await joinGuest(t, roomId, "Ana", { avatar: "panda" });
    const second = await joinGuest(t, roomId, "Ana", { avatar: "panda" });
    expect(second).not.toBe(first);
    expect((await people(t, roomId)).filter((p) => p.nickname === "Ana" && p.online)).toHaveLength(2);
  });

  test("the host's participant is never handed to a guest who joins under the host's name and avatar", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t, { hostNickname: "Mika" });
    await goOffline(t, hostId);
    const guestId = await joinGuest(t, roomId, "Mika", { avatar: "default" });
    expect(guestId).not.toBe(hostId);
    expect((await person(t, guestId)).role).toBe("participant");
    expect(await person(t, hostId)).toMatchObject({ role: "host", online: false, platform: "ios" });
  });

  describe("the limit of 300 members ever", () => {
    /** People who joined and left: rows that no longer count towards maxParticipants */
    async function addPastMembers(t: Backend, roomId: Id<"rooms">, count: number) {
      await t.run(async (ctx) => {
        for (let i = 0; i < count; i++) {
          await ctx.db.insert("participants", {
            roomId,
            nickname: `Past ${i}`,
            role: "participant",
            platform: "web",
            avatar: { type: "preset", value: "fox" },
            preferredLanguage: "en",
            online: false,
            departed: true,
            lastSeenAt: START,
            joinedAt: START,
          });
        }
      });
    }

    test("a new guest is refused once the room has had 300 members, however few are online", async () => {
      const t = newBackend();
      const { roomId } = await createRoom(t);
      await addPastMembers(t, roomId, 298); // with the host: 299
      await joinGuest(t, roomId, "Ana"); // the 300th
      await expect(joinGuest(t, roomId, "Ben", { avatar: "cat" })).rejects.toThrow(/Room is full/);
      const everyone = await people(t, roomId);
      expect(everyone).toHaveLength(300);
      expect(everyone.filter((p) => p.online)).toHaveLength(2);
    });

    test("someone who was already a member is still let back in at the limit", async () => {
      const t = newBackend();
      const { roomId } = await createRoom(t);
      await addPastMembers(t, roomId, 299);
      const past = (await people(t, roomId)).find((p) => p.nickname === "Past 7");
      const back = await joinGuest(t, roomId, "Past 7", { avatar: "fox" });
      expect(back).toBe(past?._id);
      expect((await person(t, back)).online).toBe(true);
      expect(await people(t, roomId)).toHaveLength(300);
    });
  });

  describe("the push to a host who is not looking", () => {
    async function roomWithDevice(t: Backend, hostLanguage: "en" | "ja") {
      const room = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", hostLanguage });
      await t.mutation(api.participants.setHostPushToken, {
        roomId: room.roomId,
        hostId: room.hostId,
        token: DEVICE_TOKEN,
      });
      return room;
    }
    async function pushes(t: Backend) {
      return (await scheduled(t)).filter((job) => job.name.includes("sendToHost"));
    }

    test("an away host is sent who joined and which room", async () => {
      const t = newBackend();
      const { roomId, hostId, joinCode } = await roomWithDevice(t, "en");
      await heartbeat(t, hostId, "away");
      await joinGuest(t, roomId, "Ana");
      const sent = await pushes(t);
      expect(sent).toHaveLength(1);
      expect(sent[0].args[0]).toMatchObject({
        roomId,
        token: DEVICE_TOKEN,
        title: "Enchatto",
        body: `Ana joined room ${joinCode}`,
      });
    });

    test("a host whose language is Japanese gets the push in Japanese", async () => {
      const t = newBackend();
      const { roomId, hostId, joinCode } = await roomWithDevice(t, "ja");
      await goOffline(t, hostId);
      await joinGuest(t, roomId, "Ana");
      const sent = await pushes(t);
      expect(sent).toHaveLength(1);
      expect(sent[0].args[0]).toMatchObject({ body: `Anaさんがルーム${joinCode}に参加しました` });
    });

    test("no push is sent while the host is in the room", async () => {
      const t = newBackend();
      const { roomId } = await roomWithDevice(t, "en");
      await joinGuest(t, roomId, "Ana");
      expect(await pushes(t)).toHaveLength(0);
    });

    test("an away host is sent a push when a guest who had left comes back, too", async () => {
      const t = newBackend();
      const { roomId, hostId, joinCode } = await roomWithDevice(t, "en");
      const ana = await joinGuest(t, roomId, "Ana");
      await leave(t, ana);
      expect(await pushes(t)).toHaveLength(0);

      await heartbeat(t, hostId, "away");
      expect(await joinGuest(t, roomId, "Ana")).toBe(ana);
      const sent = await pushes(t);
      expect(sent).toHaveLength(1);
      expect(sent[0].args[0]).toMatchObject({ token: DEVICE_TOKEN, body: `Ana joined room ${joinCode}` });
    });

    // An app that was killed or crashed in the foreground never said "away": the push goes by isPresent, not by the stored flags
    test("a host who has been silent for two minutes is sent the push, though their last heartbeat said online", async () => {
      const t = newBackend();
      const { roomId } = await roomWithDevice(t, "en");
      clockTo(2 * MINUTE);
      await joinGuest(t, roomId, "Ana");
      expect(await pushes(t)).toHaveLength(1);
    });

    test("the push is held back until 45 seconds after the host's last heartbeat, and sent from then on", async () => {
      const t = newBackend();
      const { roomId, hostId } = await roomWithDevice(t, "en");
      await heartbeat(t, hostId, "online");
      clockTo(45 * SECOND - 1);
      await joinGuest(t, roomId, "Ana");
      expect(await pushes(t)).toHaveLength(0);

      clockTo(45 * SECOND);
      await joinGuest(t, roomId, "Ben", { avatar: "cat" });
      const sent = await pushes(t);
      expect(sent).toHaveLength(1);
      expect(sent[0].args[0]).toMatchObject({ body: expect.stringContaining("Ben joined room") });
    });

    // The 45 seconds count from the last heartbeat, with or without a presence in it, not from when the room was made
    test("a host whose heartbeats keep arriving is not sent a push, however long the room has been open", async () => {
      const t = newBackend();
      const { roomId, hostId } = await roomWithDevice(t, "en");
      clockTo(10 * MINUTE);
      await heartbeat(t, hostId);
      clockTo(10 * MINUTE + 30 * SECOND);
      await joinGuest(t, roomId, "Ana");
      expect(await pushes(t)).toHaveLength(0);
    });
  });
});

// ─── setParticipantOnline ────────────────────────────────────────────────────

describe("setParticipantOnline", () => {
  test("a heartbeat refreshes lastSeenAt, reads as online when no presence is sent, and announces nothing", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(15 * SECOND);
    await heartbeat(t, ana);
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "online", lastSeenAt: START + 15 * SECOND });
    expect(await announcements(t, roomId)).toEqual(["join:Ana"]);
  });

  test("an away ping keeps the guest online but away, and coming back makes them online again", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await heartbeat(t, ana, "away");
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "away" });
    await heartbeat(t, ana, "online");
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "online" });
    expect(await announcements(t, roomId)).toEqual(["join:Ana"]);
  });

  test("going offline drops the presence and announces that the guest left", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    const row = await person(t, ana);
    expect(row.online).toBe(false);
    expect(row.presence).toBeUndefined();
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
  });

  test("going offline a second time announces nothing more: a double tap on Leave sends it twice", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    await goOffline(t, ana);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
  });

  test("coming back online after being offline announces the guest again", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    await heartbeat(t, ana, "online");
    expect((await person(t, ana)).online).toBe(true);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana", "join:Ana"]);
  });

  test("the host going offline and coming back is never announced", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await goOffline(t, hostId);
    await heartbeat(t, hostId, "online");
    expect((await person(t, hostId)).online).toBe(true);
    expect(await announcements(t, roomId)).toEqual([]);
  });

  // Review bug 2: every unload sets departed, and nothing cleared it, so a guest who reloaded could chat but
  // was hidden from the member list and left out of games
  test("a guest who reloads after the leave beacon is no longer departed", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    expect((await person(t, ana)).departed).toBe(true);

    await heartbeat(t, ana, "online"); // what the room page sends when it mounts
    const row = await person(t, ana);
    expect(row.online).toBe(true);
    expect(row.departed).toBeUndefined();
  });

  // Review bug 2, the other way in: the sweep sets departed too
  test("a guest the stale sweep took offline is no longer departed after their next heartbeat", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await heartbeat(t, ana, "away");
    clockTo(MINUTE);
    await t.mutation(internal.participants.cleanupStaleParticipants, {});
    expect(await person(t, ana)).toMatchObject({ online: false, departed: true });

    await heartbeat(t, ana); // an older build's heartbeat names no presence
    const row = await person(t, ana);
    expect(row.online).toBe(true);
    expect(row.departed).toBeUndefined();
  });

  test("an away ping does not clear departed: a closing tab sends one right after its leave beacon", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    await heartbeat(t, ana, "away");
    expect((await person(t, ana)).departed).toBe(true);
  });

  // A closing tab sends its leave beacon and then, from visibilitychange, an "away" ping: the ping can land second
  test("an away ping that lands after the leave beacon does not announce the guest as joined", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    await heartbeat(t, ana, "away");
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
    // The other half of the defect: a fix that only drops the message leaves the seat taken
    expect((await person(t, ana)).online).toBe(false);
  });

  // The page sends the beacon four times (two events, twice each), so the ping can also land between two of them
  test("an away ping between two leave beacons leaves one leave in the chat and the guest's own row to come back to", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Mika",
      settings: settings({ maxParticipants: 2 }),
    });
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    await heartbeat(t, ana, "away");
    await leave(t, ana);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);

    // The seat is free and the row is theirs again: neither would hold if the ping had put them back online
    expect(await joinGuest(t, roomId, "Ana")).toBe(ana);
    expect(await people(t, roomId)).toHaveLength(2);
  });

  // The Leave button sends online: false and does not set departed. A tab hidden before that answer came
  // back sends "away" behind it
  test("an away ping does not bring back a guest who went offline with Leave", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    clockTo(5 * SECOND);
    await heartbeat(t, ana, "away");
    const row = await person(t, ana);
    expect(row.online).toBe(false);
    expect(row.presence).toBeUndefined();
    expect(row.lastSeenAt).toBe(START + 5 * SECOND);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
  });

  test("a guest who is offline after an away ping is back, and announced once, with their next online heartbeat", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    await heartbeat(t, ana, "away");
    await heartbeat(t, ana, "online"); // the reloaded page mounts
    const row = await person(t, ana);
    expect(row).toMatchObject({ online: true, presence: "online" });
    expect(row.departed).toBeUndefined();
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana", "join:Ana"]);
  });

  // The iOS host heartbeats "away" from the background. One the sweep took offline must not read as back, and
  // its room must not be closed as abandoned while those heartbeats arrive
  test("an away heartbeat from a host the sweep took offline keeps the room open without bringing the host back", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await heartbeat(t, hostId, "away");
    clockTo(MINUTE);
    await t.mutation(internal.participants.cleanupStaleParticipants, {});
    expect(await person(t, hostId)).toMatchObject({ online: false, departed: true });

    clockTo(14 * MINUTE);
    await heartbeat(t, hostId, "away");
    expect(await person(t, hostId)).toMatchObject({ online: false, departed: true, lastSeenAt: START + 14 * MINUTE });
    clockTo(28 * MINUTE);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(0);
    expect((await roomRow(t, roomId)).status).toBe("waiting");

    // Back in the foreground
    await heartbeat(t, hostId, "online");
    const host = await person(t, hostId);
    expect(host).toMatchObject({ online: true, presence: "online" });
    expect(host.departed).toBeUndefined();
    expect(await announcements(t, roomId)).toEqual([]);
  });

  test("an away ping from someone who is online still marks them away, departed or not", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    // A row from before heartbeats cleared the flag: online and departed at once
    await t.run((ctx) => ctx.db.patch(ana, { departed: true }));
    clockTo(5 * SECOND);
    await heartbeat(t, ana, "away");
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "away", departed: true, lastSeenAt: START + 5 * SECOND });
    expect(await announcements(t, roomId)).toEqual(["join:Ana"]);
  });

  test("a heartbeat from a guest who was kicked fails and does not bring them back", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.kickParticipant, { participantId: ana, roomId });
    vi.spyOn(console, "warn").mockImplementation(() => undefined); // the "auth: unknown participant" line
    await expect(heartbeat(t, ana, "online")).rejects.toThrow();
    expect((await people(t, roomId)).map((p) => p.nickname)).toEqual(["Host"]);
  });
});

// ─── Who counts as here ──────────────────────────────────────────────────────

describe("presence as the games judge it (isPresent, isAround)", () => {
  test("a guest is present until 45 seconds after their last heartbeat", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const row = await person(t, ana);
    expect(isPresent(row, START)).toBe(true);
    expect(isPresent(row, START + 45 * SECOND - 1)).toBe(true);
    expect(isPresent(row, START + 45 * SECOND)).toBe(false);
  });

  test("an away guest is not present, but is around for three minutes", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await heartbeat(t, ana, "away");
    const row = await person(t, ana);
    expect(isPresent(row, START)).toBe(false);
    expect(isAround(row, START)).toBe(true);
    expect(isAround(row, START + 3 * MINUTE - 1)).toBe(true);
    expect(isAround(row, START + 3 * MINUTE)).toBe(false);
  });

  // Review bug 2 as the games met it: a guest who had reloaded was never dealt in again
  test("a guest who left is not present, and is present again from their next heartbeat", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await leave(t, ana);
    expect(isPresent(await person(t, ana), START)).toBe(false);
    expect(isAround(await person(t, ana), START)).toBe(false);

    clockTo(10 * SECOND);
    await heartbeat(t, ana, "online");
    expect(isPresent(await person(t, ana), START + 10 * SECOND)).toBe(true);
    expect(isAround(await person(t, ana), START + 10 * SECOND)).toBe(true);
  });

  // The room page's Leave button sends online: false, which refreshes lastSeenAt and does not set departed:
  // only `online` says this guest has gone
  test("a guest who went offline with Leave is neither present nor around, though heard from that moment", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(10 * SECOND);
    await goOffline(t, ana);
    const row = await person(t, ana);
    expect(row.lastSeenAt).toBe(START + 10 * SECOND);
    expect(row.departed).toBeUndefined();
    expect(isPresent(row, START + 10 * SECOND)).toBe(false);
    expect(isAround(row, START + 10 * SECOND)).toBe(false);
  });

  // A row can read online and departed at once: an away ping does not clear departed, and rows from before
  // ccda84d kept the flag through every heartbeat. Departed alone has to keep such a guest out of a game
  test("a departed guest is neither present nor around while the row still reads online", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const row = await person(t, await joinGuest(t, roomId, "Ana"));
    expect(isPresent(row, START)).toBe(true);
    expect(isAround(row, START)).toBe(true);
    expect(isPresent({ ...row, departed: true }, START)).toBe(false);
    expect(isAround({ ...row, departed: true }, START)).toBe(false);
    expect(isAround({ ...row, departed: true, presence: "away" }, START)).toBe(false);
  });

  test("nobody is present or around when there is no participant to ask about", () => {
    expect(isPresent(null, START)).toBe(false);
    expect(isPresent(undefined, START)).toBe(false);
    expect(isAround(null, START)).toBe(false);
    expect(isAround(undefined, START)).toBe(false);
  });
});

// ─── leaveRoom ───────────────────────────────────────────────────────────────

describe("leaveRoom", () => {
  test("marks the guest offline and departed, keeps their row and announces that they left", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(MINUTE);
    await leave(t, ana);
    expect(await person(t, ana)).toMatchObject({ online: false, departed: true, lastSeenAt: START + MINUTE });
    expect((await people(t, roomId)).map((p) => p._id)).toContain(ana);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
  });

  test("a repeated leave announces nothing more: the page sends the beacon from two events, twice each", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    for (let i = 0; i < 4; i++) await leave(t, ana);
    expect(await announcements(t, roomId)).toEqual(["join:Ana", "leave:Ana"]);
  });

  // Both apps list whoever has a typingAction, online or not, and a closed tab cannot clear its own
  test("leaving clears what the guest was shown as doing", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "typing" });
    await leave(t, ana);
    expect((await person(t, ana)).typingAction).toBeUndefined();
  });

  test("leaving in the middle of a drawing clears the drawing and when it started", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "drawing", drawingStartedAt: START });
    await leave(t, ana);
    const row = await person(t, ana);
    expect(row.typingAction).toBeUndefined();
    expect(row.drawingStartedAt).toBeUndefined();
  });

  // The room page's Leave button: setParticipantOnline with online: false
  test("going offline with Leave clears what the guest was shown as doing, too", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "drawing", drawingStartedAt: START });
    await goOffline(t, ana);
    const row = await person(t, ana);
    expect(row.typingAction).toBeUndefined();
    expect(row.drawingStartedAt).toBeUndefined();
  });

  test("a heartbeat or an away ping from someone who is online leaves what they are shown as doing", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "voicing" });
    await heartbeat(t, ana, "online");
    expect((await person(t, ana)).typingAction).toBe("voicing");
    await heartbeat(t, ana, "away");
    expect((await person(t, ana)).typingAction).toBe("voicing");
  });
});

// ─── kickParticipant ─────────────────────────────────────────────────────────

describe("kickParticipant", () => {
  test("removes the guest from the room and leaves everyone else", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const ben = await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    await t.mutation(api.participants.kickParticipant, { participantId: ana, roomId });
    expect((await people(t, roomId)).map((p) => p._id).sort()).toEqual([hostId, ben].sort());
  });

  test("the host cannot be kicked", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await expect(t.mutation(api.participants.kickParticipant, { participantId: hostId, roomId })).rejects.toThrow(
      /Cannot kick the host/
    );
    expect(await people(t, roomId)).toHaveLength(1);
  });

  test("a participant of another room is refused", async () => {
    const t = newBackend();
    const mine = await createRoom(t);
    const theirs = await createRoom(t);
    const ana = await joinGuest(t, theirs.roomId, "Ana");
    await expect(
      t.mutation(api.participants.kickParticipant, { participantId: ana, roomId: mine.roomId })
    ).rejects.toThrow(/Participant not in room/);
    expect(await people(t, theirs.roomId)).toHaveLength(2);
  });

  test("kicking someone who is already gone is reported, not ignored", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.kickParticipant, { participantId: ana, roomId });
    await expect(t.mutation(api.participants.kickParticipant, { participantId: ana, roomId })).rejects.toThrow(
      /Participant not found/
    );
  });

  test("a kicked guest who joins again is a new participant", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.kickParticipant, { participantId: ana, roomId });
    const again = await joinGuest(t, roomId, "Ana");
    expect(again).not.toBe(ana);
    expect((await people(t, roomId)).filter((p) => p.nickname === "Ana")).toHaveLength(1);
  });
});

// ─── The update mutations ────────────────────────────────────────────────────

describe("participant updates", () => {
  // Review bug 19: there was no way to change the host's language after the room was made
  test("updateParticipantLanguage stores en or ja", async () => {
    const t = newBackend();
    const { hostId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", hostLanguage: "en" });
    expect(await t.mutation(api.participants.updateParticipantLanguage, { participantId: hostId, language: "ja" })).toBeNull();
    expect((await person(t, hostId)).preferredLanguage).toBe("ja");
    await t.mutation(api.participants.updateParticipantLanguage, { participantId: hostId, language: "en" });
    expect((await person(t, hostId)).preferredLanguage).toBe("en");
  });

  test("updateParticipantLanguage refuses a language the apps do not offer", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana", { language: "en" });
    for (const language of ["fr", "", "EN", "ja-JP"]) {
      await expect(
        t.mutation(api.participants.updateParticipantLanguage, { participantId: ana, language })
      ).rejects.toThrow(/Unsupported language/);
    }
    expect((await person(t, ana)).preferredLanguage).toBe("en");
  });

  test("updateParticipantLanguage reports a participant that no longer exists", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.kickParticipant, { participantId: ana, roomId });
    vi.spyOn(console, "warn").mockImplementation(() => undefined); // the "auth: unknown participant" line
    await expect(
      t.mutation(api.participants.updateParticipantLanguage, { participantId: ana, language: "ja" })
    ).rejects.toThrow(/Participant not found/);
  });

  test("updateParticipantNickname holds the new name to the rule joining does: trimmed, 1 to 30 characters", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.updateParticipantNickname, { participantId: ana, nickname: "  Anna " });
    expect((await person(t, ana)).nickname).toBe("Anna");
    for (const nickname of ["", "  ", "x".repeat(31)]) {
      await expect(
        t.mutation(api.participants.updateParticipantNickname, { participantId: ana, nickname })
      ).rejects.toThrow(/Nickname must be/);
    }
    expect((await person(t, ana)).nickname).toBe("Anna");
  });

  test("updateParticipantAvatar stores the avatar and refuses a value over 64 characters", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana", { avatar: "fox" });
    await t.mutation(api.participants.updateParticipantAvatar, {
      participantId: ana,
      avatar: { type: "preset", value: "whale" },
    });
    expect((await person(t, ana)).avatar).toEqual({ type: "preset", value: "whale" });
    await expect(
      t.mutation(api.participants.updateParticipantAvatar, {
        participantId: ana,
        avatar: { type: "custom", value: "a".repeat(65) },
      })
    ).rejects.toThrow(/Invalid avatar/);
    expect((await person(t, ana)).avatar.value).toBe("whale");
  });

  test("updateDisplaySettings replaces the guest's display settings", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const displaySettings = { showEnglish: false, showJapanese: true, showRomaji: true };
    await t.mutation(api.participants.updateDisplaySettings, { participantId: ana, displaySettings });
    expect((await person(t, ana)).displaySettings).toEqual(displaySettings);
  });

  test("setTypingAction shows what the guest is doing and clears it when no action is sent", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    for (const action of ["typing", "voicing", "drawing"] as const) {
      await t.mutation(api.participants.setTypingAction, { participantId: ana, action });
      expect((await person(t, ana)).typingAction).toBe(action);
    }
    await t.mutation(api.participants.setTypingAction, { participantId: ana });
    expect((await person(t, ana)).typingAction).toBeUndefined();
  });

  test("setTypingAction keeps drawingStartedAt only while the guest is drawing", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "drawing", drawingStartedAt: START });
    expect((await person(t, ana)).drawingStartedAt).toBe(START);
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "typing", drawingStartedAt: START });
    expect((await person(t, ana)).drawingStartedAt).toBeUndefined();
  });
});

// ─── updateRoomSettings ──────────────────────────────────────────────────────

describe("updateRoomSettings", () => {
  test("replaces the room's settings", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const next = settings({ romajiEnabled: false, maxParticipants: 4 });
    await t.mutation(api.rooms.updateRoomSettings, { roomId, settings: next });
    expect((await roomRow(t, roomId)).settings).toEqual(next);
  });

  // 93ed5d0: the update had no bounds at all, so it was the way round createRoom's
  test("holds the settings to the bounds createRoom does", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const before = (await roomRow(t, roomId)).settings;
    for (const maxParticipants of [1, 51, NaN]) {
      await expect(
        t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants }) })
      ).rejects.toThrow(/Max participants/);
    }
    for (const over of [{ sourceLanguage: "e".repeat(17) }, { targetLanguage: "j".repeat(17) }]) {
      await expect(t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings(over) })).rejects.toThrow(
        /Unsupported language/
      );
    }
    expect((await roomRow(t, roomId)).settings).toEqual(before);
  });

  // Room.swift decodes maxParticipants as Int: a fraction stored here would fail every /api/rooms/state poll on the host's phone
  test("a maxParticipants that is not a whole number is refused", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await expect(
      t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants: 2.5 }) })
    ).rejects.toThrow(/Max participants/);
  });

  test("a fraction is refused wherever it falls in the range, and the settings stay as they were", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const before = (await roomRow(t, roomId)).settings;
    for (const maxParticipants of [2.000001, 10.5, 49.999, Infinity]) {
      await expect(
        t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants }) })
      ).rejects.toThrow(/Max participants/);
    }
    expect((await roomRow(t, roomId)).settings).toEqual(before);
    // The whole numbers at both ends are still taken
    for (const maxParticipants of [2, 50]) {
      await t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants }) });
      expect((await roomRow(t, roomId)).settings.maxParticipants).toBe(maxParticipants);
    }
  });

  test("a closed room's settings cannot be changed", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings() })).rejects.toThrow(
      /Cannot update a closed room/
    );
  });

  test("a lower limit keeps the people already in and refuses the next guest", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await joinGuest(t, roomId, "Ana");
    await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    await t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants: 2 }) });
    expect((await people(t, roomId)).filter((p) => p.online)).toHaveLength(3);
    await expect(joinGuest(t, roomId, "Cy", { avatar: "dog" })).rejects.toThrow(/Room is full/);
  });
});

// ─── setRoomBackground ───────────────────────────────────────────────────────

describe("setRoomBackground", () => {
  const HOST = tokenFor(1);
  const GUEST = tokenFor(2);
  const OTHER_HOST = tokenFor(3);
  /** Well formed, on record for nobody */
  const NOBODY = tokenFor(4);
  const MODES = [undefined, "log", "enforce"] as const;
  const modeName = (mode: string | undefined) => `AUTH_MODE ${mode ?? "unset"}`;

  /** A room with background 3. Its host and its one guest each registered a token, unless `legacyHost` */
  async function roomOfTwo(options: { legacyHost?: boolean } = {}) {
    const t = newBackend();
    const { roomId, hostId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Mika",
      hostToken: options.legacyHost ? undefined : HOST,
      background: 3,
    });
    const guestId = await joinGuest(t, roomId, "Ana", { token: GUEST });
    return { t, roomId, hostId, guestId };
  }

  test("gives the room the background the host asks for, answers with it, and every reader of the room sees it", async () => {
    const t = newBackend();
    const { roomId, joinCode } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    await joinGuest(t, roomId, "Ana");

    expect(await t.mutation(api.rooms.setRoomBackground, { roomId, background: 8 })).toEqual({ background: 8 });

    // What the web room page subscribes to, what the join page finds the room by, and what the iOS host polls
    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.background).toBe(8);
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode }))?.background).toBe(8);
    expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(8);
  });

  test("each of the 31 textures that are not retired is taken, and nothing is picked", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const random = vi.spyOn(Math, "random");
    // Down from the last texture, so that every one of the 31 is a change, the 3 the room starts with too
    const asked = Array.from({ length: 36 }, (_, n) => 35 - n).filter((background) => !RETIRED.includes(background));
    expect(asked).toHaveLength(31);
    for (const background of asked) {
      random.mockClear();
      expect(await t.mutation(api.rooms.setRoomBackground, { roomId, background })).toEqual({ background });
      expect(random).not.toHaveBeenCalled();
      expect((await roomRow(t, roomId)).background).toBe(background);
    }
  });

  // An installed build's Random button picks among its own whole list, which still offers the retired textures.
  // The room then gets the server's pick: one of the first ten that are not retired, which every build has the
  // tile of, and never the one the room has, so that the tap changes the room. The pick is made as createRoom's
  // is: each texture it is made among has an equal share of the range, in the order of the list
  describe("a retired texture is not refused: the room gets the server's pick, and the answer names it", () => {
    const HAS: Array<[what: string, background: number | undefined]> = [
      ...PICKED.map((background): [string, number] => [`texture ${background}`, background]),
      ["the retired texture 4", 4],
      ["the retired texture 9", 9],
      ["the retired texture 25", 25],
      ["texture 10", 10],
      ["texture 35", 35],
      ["no stored background", undefined],
    ];

    test.each(HAS)("in a room that has %s", async (_, has) => {
      const random = seedRandom(9);
      const t = newBackend();
      const { roomId } = await roomWith(t, has);
      const among = PICKED.filter((background) => background !== has);
      expect(among).toHaveLength(has !== undefined && PICKED.includes(has) ? 7 : 8);

      for (const asked of RETIRED) {
        for (const [k, picked] of among.entries()) {
          for (const draw of drawsFor(k, among.length)) {
            random.mockReturnValueOnce(draw);
            const answer = await t.mutation(api.rooms.setRoomBackground, { roomId, background: asked });
            // The room is given back the background it had, for the next pick to be made from the same room
            const stored = await t.run(async (ctx) => {
              const row = await ctx.db.get(roomId);
              await ctx.db.patch(roomId, { background: has });
              return row?.background;
            });
            expect({ asked, draw, answer, stored }).toEqual({ asked, draw, answer: { background: picked }, stored: picked });
          }
        }
      }
    });

    test("every reader of the room sees the texture the room got, and the rest of the room stays as it is", async () => {
      seedRandom(4);
      const t = newBackend();
      const { roomId, joinCode } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
      await joinGuest(t, roomId, "Ana");
      const before = await roomRow(t, roomId);

      const { background } = await t.mutation(api.rooms.setRoomBackground, { roomId, background: 26 });
      expect(PICKED.filter((picked) => picked !== 3)).toContain(background);

      expect(await roomRow(t, roomId)).toEqual({ ...before, background });
      expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.background).toBe(background);
      expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode }))?.background).toBe(background);
      expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(background);
    });

    test("it is the host's to ask for, like any other: under enforce a guest is refused and the room keeps its background", async () => {
      authLog();
      const { t, roomId, hostId, guestId } = await roomOfTwo();
      vi.stubEnv("AUTH_MODE", "enforce");
      await expect(
        t.mutation(api.rooms.setRoomBackground, { roomId, background: 4, callerId: guestId, token: GUEST })
      ).rejects.toThrow(/Not authorised/);
      expect((await roomRow(t, roomId)).background).toBe(3);

      const answer = await t.mutation(api.rooms.setRoomBackground, { roomId, background: 4, callerId: hostId, token: HOST });
      expect(PICKED.filter((picked) => picked !== 3)).toContain(answer.background);
      expect((await roomRow(t, roomId)).background).toBe(answer.background);
    });

    test("a closed room keeps its background, and a room that does not exist is reported as not found", async () => {
      const t = newBackend();
      const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
      await t.mutation(api.rooms.closeRoom, { roomId });
      await expect(t.mutation(api.rooms.setRoomBackground, { roomId, background: 9 })).rejects.toThrow(/Room is closed/);
      expect((await roomRow(t, roomId)).background).toBe(3);
      await expect(
        t.mutation(api.rooms.setRoomBackground, { roomId: await deletedRoom(t), background: 9 })
      ).rejects.toThrow(/Room not found/);
    });
  });

  // A request whose answer is lost leaves the app showing the background from before, and its next pick can
  // be the one the room already got
  test("the background the room already has is taken again, and answered the same", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    for (let i = 0; i < 2; i++) {
      expect(await t.mutation(api.rooms.setRoomBackground, { roomId, background: 8 })).toEqual({ background: 8 });
      expect((await roomRow(t, roomId)).background).toBe(8);
    }
  });

  // -1 and 36 are one past each end of the texture list. The iOS host decodes the room's background as Int, so
  // a fraction that was stored would fail every poll of the room
  test("a number that is not one of the 36 textures is refused, and the room keeps the background it has", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const before = await roomRow(t, roomId);
    for (const background of [-1, 36, 99, 1.5, NaN, Infinity, -Infinity, 0.5, 8.999, 35.5]) {
      await expect(
        t.mutation(api.rooms.setRoomBackground, { roomId, background }),
        String(background)
      ).rejects.toThrow(/Unknown background/);
    }
    expect(await roomRow(t, roomId)).toEqual(before);
  });

  test("a closed room keeps its background", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    await t.mutation(api.rooms.closeRoom, { roomId });
    const before = await roomRow(t, roomId);
    await expect(t.mutation(api.rooms.setRoomBackground, { roomId, background: 8 })).rejects.toThrow(/Room is closed/);
    expect(await roomRow(t, roomId)).toEqual(before);
  });

  test("a room that does not exist is reported as not found", async () => {
    const t = newBackend();
    const roomId = await deletedRoom(t);
    await expect(t.mutation(api.rooms.setRoomBackground, { roomId, background: 8 })).rejects.toThrow(/Room not found/);
  });

  test("only the background changes: the rest of the room, its people, its chat and every other room stay as they are", async () => {
    // A room nobody has joined is waiting, and one with a guest is active
    for (const withGuest of [false, true]) {
      // Each pass starts at the same hour, so the change below is always ten minutes after everything before it
      clockTo(0);
      const t = newBackend();
      const { roomId } = await t.mutation(api.rooms.createRoom, {
        hostNickname: "Mika",
        background: 3,
        settings: settings({ maxParticipants: 12 }),
      });
      if (withGuest) await joinGuest(t, roomId, "Ana");
      const other = await t.mutation(api.rooms.createRoom, { hostNickname: "Ken", background: 3 });
      const before = {
        room: await roomRow(t, roomId),
        other: await roomRow(t, other.roomId),
        people: await people(t, roomId),
        chat: await announcements(t, roomId),
        jobs: await scheduled(t),
      };
      expect(before.room.status).toBe(withGuest ? "active" : "waiting");

      clockTo(10 * MINUTE);
      await t.mutation(api.rooms.setRoomBackground, { roomId, background: 6 });

      expect(await roomRow(t, roomId)).toEqual({ ...before.room, background: 6 });
      expect(await roomRow(t, other.roomId)).toEqual(before.other);
      expect(await people(t, roomId)).toEqual(before.people);
      expect(await announcements(t, roomId)).toEqual(before.chat);
      expect(await scheduled(t)).toEqual(before.jobs);
    }
  });

  // The caller check is requireHost, the one closeRoom and updateRoomSettings make. Its rules are in
  // auth-tokens.test.ts; the tests from here on hold this mutation to them.

  test("AUTH_MODE unset or log: a call without the host's token, or with another, is logged and goes through", async () => {
    const log = authLog();
    for (const mode of [undefined, "log"] as const) {
      for (const [token, reason] of [
        [undefined, "no token"],
        [GUEST, "wrong token"],
        [NOBODY, "wrong token"],
      ] as const) {
        const where = `${modeName(mode)}, ${reason}`;
        const { t, roomId, hostId } = await roomOfTwo();
        vi.stubEnv("AUTH_MODE", mode);
        log.clear();

        expect(
          await t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, callerId: hostId, token }),
          where
        ).toEqual({ background: 8 });

        expect(log.lines(), where).toEqual([`auth: rooms.setRoomBackground ${reason}`]);
        expect((await roomRow(t, roomId)).background, where).toBe(8);
      }
    }
  });

  test("AUTH_MODE enforce: without the host's token, or with any other, the call is refused and the room keeps its background; with it, it goes through", async () => {
    const log = authLog();
    const { t, roomId, hostId } = await roomOfTwo();
    const before = await roomRow(t, roomId);
    vi.stubEnv("AUTH_MODE", "enforce");
    log.clear();

    for (const token of [undefined, GUEST, NOBODY]) {
      await expect(
        t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, callerId: hostId, token }),
        token ?? "no token"
      ).rejects.toThrow(/Not authorised/);
    }
    // The same lines the other modes write, so a deployment's log lists exactly what enforce refuses
    expect(log.lines()).toEqual([
      "auth: rooms.setRoomBackground no token",
      "auth: rooms.setRoomBackground wrong token",
      "auth: rooms.setRoomBackground wrong token",
    ]);
    expect(await roomRow(t, roomId)).toEqual(before);

    log.clear();
    expect(
      await t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, callerId: hostId, token: HOST })
    ).toEqual({ background: 8 });
    expect(log.lines()).toEqual([]);
    expect((await roomRow(t, roomId)).background).toBe(8);
  });

  // The host app names its caller on every request. A call that names none is taken for the room's host
  test("enforce: with no caller named the room's own host is assumed, and has to prove it like any other", async () => {
    const log = authLog();
    const { t, roomId } = await roomOfTwo();
    vi.stubEnv("AUTH_MODE", "enforce");
    log.clear();

    for (const token of [undefined, GUEST]) {
      await expect(
        t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, token }),
        token ?? "no token"
      ).rejects.toThrow(/Not authorised/);
    }
    expect(log.lines()).toEqual([
      "auth: rooms.setRoomBackground no token",
      "auth: rooms.setRoomBackground wrong token",
    ]);
    expect((await roomRow(t, roomId)).background).toBe(3);

    expect(await t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, token: HOST })).toEqual({
      background: 8,
    });
  });

  test("a guest who calls in its own name, with its own token, is logged as not the host, and refused under enforce", async () => {
    const log = authLog();
    for (const mode of MODES) {
      const { t, roomId, guestId } = await roomOfTwo();
      vi.stubEnv("AUTH_MODE", mode);
      log.clear();

      const call = t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, callerId: guestId, token: GUEST });
      if (mode === "enforce") await expect(call, modeName(mode)).rejects.toThrow(/Not authorised/);
      else expect(await call, modeName(mode)).toEqual({ background: 8 });

      expect(log.lines(), modeName(mode)).toEqual(["auth: rooms.setRoomBackground not the host"]);
      expect((await roomRow(t, roomId)).background, modeName(mode)).toBe(mode === "enforce" ? 3 : 8);
    }
  });

  test("the host of another room is logged as not the host, and refused under enforce, though its token is good in its own room", async () => {
    const log = authLog();
    for (const mode of MODES) {
      const { t, roomId } = await roomOfTwo();
      const other = await t.mutation(api.rooms.createRoom, { hostNickname: "Ken", hostToken: OTHER_HOST, background: 5 });
      const outsider = { callerId: other.hostId, token: OTHER_HOST };
      vi.stubEnv("AUTH_MODE", mode);
      log.clear();

      const call = t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, ...outsider });
      if (mode === "enforce") await expect(call, modeName(mode)).rejects.toThrow(/Not authorised/);
      else expect(await call, modeName(mode)).toEqual({ background: 8 });

      expect(log.lines(), modeName(mode)).toEqual(["auth: rooms.setRoomBackground not the host"]);
      expect((await roomRow(t, roomId)).background, modeName(mode)).toBe(mode === "enforce" ? 3 : 8);

      // The token is not the reason for the refusal: it changes the room it is the host of, and only that one
      log.clear();
      await t.mutation(api.rooms.setRoomBackground, { roomId: other.roomId, background: 1, ...outsider });
      expect(log.lines(), modeName(mode)).toEqual([]);
      expect((await roomRow(t, other.roomId)).background, modeName(mode)).toBe(1);
      expect((await roomRow(t, roomId)).background, modeName(mode)).toBe(mode === "enforce" ? 3 : 8);
    }
  });

  // A room an installed iOS build made: its host has no token to be asked for, but the caller a call names is
  // still held to being the host
  test("a host who registered no token is asked for none, in every mode, and a guest of that room is still not the host", async () => {
    const log = authLog();
    for (const mode of MODES) {
      const { t, roomId, hostId, guestId } = await roomOfTwo({ legacyHost: true });
      vi.stubEnv("AUTH_MODE", mode);
      log.clear();

      const asGuest = t.mutation(api.rooms.setRoomBackground, { roomId, background: 8, callerId: guestId, token: GUEST });
      if (mode === "enforce") await expect(asGuest, modeName(mode)).rejects.toThrow(/Not authorised/);
      else await asGuest;
      expect(log.lines(), modeName(mode)).toEqual(["auth: rooms.setRoomBackground not the host"]);
      expect((await roomRow(t, roomId)).background, modeName(mode)).toBe(mode === "enforce" ? 3 : 8);

      log.clear();
      // With no token, and with one there is nothing to check against
      for (const [background, token] of [
        [6, undefined],
        [7, NOBODY],
      ] as const) {
        await t.mutation(api.rooms.setRoomBackground, { roomId, background, callerId: hostId, token });
        expect((await roomRow(t, roomId)).background, modeName(mode)).toBe(background);
      }
      expect(log.lines(), modeName(mode)).toEqual([]);
    }
  });
});

// ─── A room that has a retired background ────────────────────────────────────

// No stored row is rewritten when a texture is retired: the room goes on being drawn with it, by every build
// that knows the index, until its host gives it another
describe("a room that has a retired background", () => {
  test.each(RETIRED)("keeps texture %i, and every reader of the room is given it", async (background) => {
    const t = newBackend();
    const { roomId, hostId, joinCode } = await roomWith(t, background);
    const ana = await joinGuest(t, roomId, "Ana");
    const before = await roomRow(t, roomId);
    expect(before.background).toBe(background);

    // What goes on in a room and beside it: another room is made, the settings change, people come and go
    await t.mutation(api.rooms.createRoom, { hostNickname: "Ken" });
    await t.mutation(api.rooms.updateRoomSettings, { roomId, settings: settings({ maxParticipants: 12 }) });
    await heartbeat(t, hostId);
    await leave(t, ana);
    await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    await t.mutation(internal.rooms.closeAbandonedRooms);
    expect(await roomRow(t, roomId)).toEqual({ ...before, settings: settings({ maxParticipants: 12 }) });

    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.background).toBe(background);
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode }))?.background).toBe(background);
    expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(background);
    const snapshot = await post(t, "/api/rooms/snapshot", { roomId, participantId: hostId });
    expect(snapshot.status).toBe(200);
    expect(snapshot.body.room.background).toBe(background);

    // Closed, it has it still
    await t.mutation(api.rooms.closeRoom, { roomId });
    expect((await roomRow(t, roomId)).background).toBe(background);
    expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(background);
  });

  test("is given the texture its host asks for, as any room is", async () => {
    const t = newBackend();
    const { roomId } = await roomWith(t, 24);
    expect(await t.mutation(api.rooms.setRoomBackground, { roomId, background: 17 })).toEqual({ background: 17 });
    expect((await roomRow(t, roomId)).background).toBe(17);
  });
});

// ─── closeRoom ───────────────────────────────────────────────────────────────

describe("closeRoom", () => {
  test("closes the room, stamps when, and marks everyone offline and departed", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await joinGuest(t, roomId, "Ana");
    await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    clockTo(10 * MINUTE);
    await t.mutation(api.rooms.closeRoom, { roomId });

    expect(await roomRow(t, roomId)).toMatchObject({ status: "closed", closedAt: START + 10 * MINUTE });
    const everyone = await people(t, roomId);
    expect(everyone).toHaveLength(3);
    for (const p of everyone) expect(p).toMatchObject({ online: false, departed: true });
  });

  test("closing a closed room changes nothing: closedAt keeps its first value", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    clockTo(HOUR);
    await t.mutation(api.rooms.closeRoom, { roomId });
    expect(await roomRow(t, roomId)).toMatchObject({ status: "closed", closedAt: START });
    // One purge of the room's voice clips, from the first close only
    expect((await scheduled(t)).filter((job) => job.name.includes("purgeRoomAudio"))).toHaveLength(1);
  });

  test("a room that does not exist is reported as not found", async () => {
    const t = newBackend();
    const roomId = await deletedRoom(t);
    await expect(t.mutation(api.rooms.closeRoom, { roomId })).rejects.toThrow(/Room not found/);
  });

  test("the room's voice clips are deleted soon after it closes", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["a voice clip"], { type: "audio/webm" })));
    const messageId = await t.run((ctx) =>
      ctx.db.insert("messages", {
        roomId,
        senderId: ana,
        kind: "audio",
        status: "processed",
        audioStorageId: storageId,
        mediaUrl: "https://example.invalid/clip",
        durationMs: 1200,
        createdAt: START,
      })
    );
    await t.mutation(api.rooms.closeRoom, { roomId });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await t.run((ctx) => ctx.db.system.get(storageId))).toBeNull();
    const message = await t.run((ctx) => ctx.db.get(messageId));
    expect(message?.audioStorageId).toBeUndefined();
    expect(message?.mediaUrl).toBeUndefined();
  });

  test("a closed room is still found by its join code, as closed: the join page says so", async () => {
    const t = newBackend();
    const { roomId, joinCode } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    expect(await t.query(api.rooms.getRoomByJoinCode, { joinCode })).toMatchObject({ _id: roomId, status: "closed" });
  });
});

// ─── Queries ─────────────────────────────────────────────────────────────────

describe("room queries", () => {
  test("getRoomByJoinCode answers null for a code no room has", async () => {
    const t = newBackend();
    await createRoom(t);
    expect(await t.query(api.rooms.getRoomByJoinCode, { joinCode: "000000" })).toBeNull();
  });

  // createRoom draws again while any room, open or closed, holds the code: getRoomByJoinCode answers the oldest room with it
  test("the join code a new room is given finds that room, though an earlier room drew the same code", async () => {
    const t = newBackend();
    // The same draws for both rooms, which is what createRoom meets one time in a billion per earlier room.
    // Past those the draws differ, so a createRoom that draws again gets a code that is free
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    const old = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId: old.roomId });
    clockTo(HOUR);
    draws = 0;
    const fresh = await createRoom(t);

    const found = await t.query(api.rooms.getRoomByJoinCode, { joinCode: fresh.joinCode });
    expect(found?._id).toBe(fresh.roomId);
  });

  /** Makes createRoom's draws repeat from the start for every room: each new room first draws the codes the earlier ones drew */
  function sameDrawsForEveryRoom() {
    let draws = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (((draws++ * 37) % 128) + 0.5) / 128);
    return () => {
      draws = 0;
    };
  }

  test("a new room never shares its code with a room that is still open, and each code finds its own room", async () => {
    const t = newBackend();
    const again = sameDrawsForEveryRoom();
    const rooms = [];
    for (let i = 0; i < 4; i++) {
      again();
      rooms.push(await createRoom(t));
    }
    expect(new Set(rooms.map((room) => room.joinCode)).size).toBe(4);
    for (const room of rooms) {
      expect(room.joinCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
      expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode: room.joinCode }))?._id).toBe(room.roomId);
    }
    // One row per code in the table itself, not only in what createRoom answered
    const stored = await t.run((ctx) => ctx.db.query("rooms").collect());
    expect(stored.map((room) => room.joinCode).sort()).toEqual(rooms.map((room) => room.joinCode).sort());
  });

  test("a code is free again once the room that held it is gone, as after the purge of closed rooms", async () => {
    const t = newBackend();
    const again = sameDrawsForEveryRoom();
    const old = await createRoom(t);
    await t.run(async (ctx) => {
      await ctx.db.delete(old.hostId);
      await ctx.db.delete(old.roomId);
    });
    again();
    const fresh = await createRoom(t);
    expect(fresh.joinCode).toBe(old.joinCode);
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode: fresh.joinCode }))?._id).toBe(fresh.roomId);
  });

  // A stubbed or broken Math.random must not hang the mutation: after ten taken codes it stops
  test("createRoom gives up with an error, and makes nothing, when every code it draws is taken", async () => {
    const t = newBackend();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const first = await createRoom(t);
    const drawsForOneRoom = random.mock.calls.length;

    await expect(createRoom(t)).rejects.toThrow(/Could not make a join code/);
    // Ten codes of six draws each, and the draw for the background: not one more
    expect(random.mock.calls.length - drawsForOneRoom).toBe(10 * 6 + 1);
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(1);
    expect(await t.run((ctx) => ctx.db.query("participants").collect())).toHaveLength(1);

    const res = await post(t, "/api/rooms/create", { hostNickname: "Mika" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Could not make a join code/);

    // The first room is untouched and its code still leads to it
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode: first.joinCode }))?._id).toBe(first.roomId);
  });

  test("getRoomState answers null for a room that does not exist", async () => {
    const t = newBackend();
    const roomId = await deletedRoom(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
  });

  test("getRoomState lists everyone who joined, with those who went offline or left", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const ben = await joinGuest(t, roomId, "Ben", { avatar: "cat" });
    await goOffline(t, ana);
    await leave(t, ben);

    const state = await t.query(api.rooms.getRoomState, { roomId });
    expect(state?.room._id).toBe(roomId);
    expect(state?.participants.map((p) => p._id).sort()).toEqual([hostId, ana, ben].sort());
    expect(state?.participants.find((p) => p._id === ben)).toMatchObject({ online: false, departed: true });
  });

  test("getRoomParticipants lists the people of that room only", async () => {
    const t = newBackend();
    const one = await createRoom(t, { hostNickname: "Mika" });
    const two = await createRoom(t, { hostNickname: "Ken" });
    await joinGuest(t, one.roomId, "Ana");
    await joinGuest(t, two.roomId, "Ben");
    expect((await people(t, one.roomId)).map((p) => p.nickname).sort()).toEqual(["Ana", "Mika"]);
    expect((await people(t, two.roomId)).map((p) => p.nickname).sort()).toEqual(["Ben", "Ken"]);
  });

  // What the web room page subscribes to and the iOS host polls: another room's people must not be in it
  test("getRoomState and rooms/state list the people of that room only", async () => {
    const t = newBackend();
    const one = await createRoom(t, { hostNickname: "Mika" });
    const two = await createRoom(t, { hostNickname: "Ken" });
    await joinGuest(t, one.roomId, "Ana");
    await joinGuest(t, two.roomId, "Ben");
    for (const [room, names] of [
      [one, ["Ana", "Mika"]],
      [two, ["Ben", "Ken"]],
    ] as const) {
      const state = await t.query(api.rooms.getRoomState, { roomId: room.roomId });
      expect(state?.participants.map((p) => p.nickname).sort()).toEqual(names);
      const res = await post(t, "/api/rooms/state", { roomId: room.roomId });
      expect(res.body.room._id).toBe(room.roomId);
      expect(res.body.participants.map((p: Doc<"participants">) => p.nickname).sort()).toEqual(names);
    }
  });

  test("nothing a guest can read about a room carries a caller token or the host's device token", async () => {
    const t = newBackend();
    const hostToken = "a1b2c3d4".repeat(8);
    const guestToken = "d4c3b2a1".repeat(8);
    const { roomId, hostId, joinCode } = await createRoom(t, { hostToken });
    await joinGuest(t, roomId, "Ana", { token: guestToken });
    await t.mutation(api.participants.setHostPushToken, { roomId, hostId, token: DEVICE_TOKEN, callerToken: hostToken });

    const readable = JSON.stringify([
      await t.query(api.rooms.getRoomState, { roomId }),
      await t.query(api.rooms.getRoomByJoinCode, { joinCode }),
      await t.query(api.participants.getRoomParticipants, { roomId }),
      (await post(t, "/api/rooms/state", { roomId })).body,
    ]);
    for (const secret of [hostToken, guestToken, DEVICE_TOKEN]) expect(readable).not.toContain(secret);
    // The fixture did store all three, so the check above is not passing on an empty room
    expect(await t.run((ctx) => ctx.db.query("participantSecrets").collect())).toHaveLength(2);
    expect(await t.run((ctx) => ctx.db.query("hostPushTokens").collect())).toHaveLength(1);
  });
});

// ─── The host's device token ─────────────────────────────────────────────────

describe("setHostPushToken", () => {
  async function tokensOf(t: Backend, roomId: Id<"rooms">) {
    const rows = await t.run((ctx) =>
      ctx.db
        .query("hostPushTokens")
        .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
        .collect()
    );
    return rows.map((row) => row.token);
  }

  test("keeps one device token per room: registering again replaces it", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await t.mutation(api.participants.setHostPushToken, { roomId, hostId, token: DEVICE_TOKEN });
    const newer = "0f1e2d3c".repeat(8);
    await t.mutation(api.participants.setHostPushToken, { roomId, hostId, token: newer });
    expect(await tokensOf(t, roomId)).toEqual([newer]);
  });

  test("only the room's host can register a device", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await expect(
      t.mutation(api.participants.setHostPushToken, { roomId, hostId: ana, token: DEVICE_TOKEN })
    ).rejects.toThrow(/Only the host/);
    expect(await tokensOf(t, roomId)).toEqual([]);
  });

  test("a token that is not 64 to 200 hex characters is refused", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    for (const token of ["", "abc123", "z".repeat(64), "a".repeat(63), "a".repeat(201)]) {
      await expect(t.mutation(api.participants.setHostPushToken, { roomId, hostId, token })).rejects.toThrow(
        /Invalid device token/
      );
    }
    expect(await tokensOf(t, roomId)).toEqual([]);
  });

  test("a token Apple rejected is forgotten, unless the host has registered a newer one since", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await t.mutation(api.participants.setHostPushToken, { roomId, hostId, token: DEVICE_TOKEN });
    await t.mutation(internal.participants.clearHostPushToken, { roomId, token: "0f1e2d3c".repeat(8) });
    expect(await tokensOf(t, roomId)).toEqual([DEVICE_TOKEN]);
    await t.mutation(internal.participants.clearHostPushToken, { roomId, token: DEVICE_TOKEN });
    expect(await tokensOf(t, roomId)).toEqual([]);
  });
});

// ─── closeAbandonedRooms ─────────────────────────────────────────────────────

// convex-test runs no crons: the two sweeps are called directly below. This is the only check that crons.ts
// still registers them (the review found a copy of the backend in which both had gone missing)
test("crons.ts runs closeAbandonedRooms every five minutes and the stale-participant sweep every hour", () => {
  const jobs = Object.values(crons.crons);
  expect(jobs.find((job) => job.name === "rooms:closeAbandonedRooms")?.schedule).toEqual({
    type: "interval",
    minutes: 5,
  });
  expect(jobs.find((job) => job.name === "participants:cleanupStaleParticipants")?.schedule).toEqual({
    type: "interval",
    hours: 1,
  });
});

// Only a run the sweep itself asked for carries a cursor and the sweep's clock
test("the cron starts the stale-participant sweep as a start: with no cursor and no clock of its own", () => {
  const sweeps = Object.values(crons.crons).filter((job) => job.name === "participants:cleanupStaleParticipants");
  expect(sweeps).toHaveLength(1);
  expect(sweeps[0].args).toEqual([{}]);
});

describe("closeAbandonedRooms", () => {
  test("closes a room whose host has been silent for more than 15 minutes", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await joinGuest(t, roomId, "Ana");
    clockTo(15 * MINUTE + 1);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(1);

    expect(await roomRow(t, roomId)).toMatchObject({ status: "closed", closedAt: START + 15 * MINUTE + 1 });
    const everyone = await people(t, roomId);
    expect(everyone).toHaveLength(2);
    for (const p of everyone) expect(p).toMatchObject({ online: false, departed: true });
  });

  // No host can ever heartbeat for such a room, and the purge only takes rooms that have closed
  test("closes a room whose host participant no longer exists, however recently it was made", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await joinGuest(t, roomId, "Ana");
    await t.run((ctx) => ctx.db.delete(hostId));
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(1);
    expect((await roomRow(t, roomId)).status).toBe("closed");
  });

  test("leaves a room whose host was heard from within the last 15 minutes", async () => {
    const t = newBackend();
    const quiet = await createRoom(t); // last heard at START
    const live = await createRoom(t);
    clockTo(10 * MINUTE);
    await heartbeat(t, live.hostId, "away"); // a backgrounded host still counts as there
    clockTo(15 * MINUTE); // exactly 15 minutes for the first room, 5 for the second
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(0);
    expect((await roomRow(t, quiet.roomId)).status).toBe("waiting");
    expect((await roomRow(t, live.roomId)).status).toBe("waiting");
  });

  test("guests' heartbeats do not keep a room open: only the host's count", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(16 * MINUTE);
    await heartbeat(t, ana, "online");
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(1);
    expect((await roomRow(t, roomId)).status).toBe("closed");
  });

  test("closes waiting and active rooms alike, and says how many", async () => {
    const t = newBackend();
    const waiting = await createRoom(t);
    const active = await createRoom(t);
    await joinGuest(t, active.roomId, "Ana");
    expect((await roomRow(t, active.roomId)).status).toBe("active");
    clockTo(20 * MINUTE);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(2);
    expect((await roomRow(t, waiting.roomId)).status).toBe("closed");
    expect((await roomRow(t, active.roomId)).status).toBe("closed");
  });

  test("leaves rooms that are already closed as they are", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    clockTo(HOUR);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(0);
    expect((await roomRow(t, roomId)).closedAt).toBe(START);
  });

  test("closes at most 100 rooms in one run, and the rest in the next", async () => {
    const t = newBackend();
    for (let i = 0; i < 101; i++) await createRoom(t);
    clockTo(20 * MINUTE);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(100);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms)).toBe(1);
    const open = await t.run((ctx) =>
      ctx.db
        .query("rooms")
        .filter((q) => q.neq(q.field("status"), "closed"))
        .collect()
    );
    expect(open).toHaveLength(0);
  });
});

// ─── cleanupStaleParticipants ────────────────────────────────────────────────

describe("cleanupStaleParticipants", () => {
  const sweep = (t: Backend) => t.mutation(internal.participants.cleanupStaleParticipants, {});

  test("marks someone away once they have been silent for more than 45 seconds, and clears what they were shown as doing", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "typing" });
    clockTo(45 * SECOND + 1);
    await sweep(t);
    const row = await person(t, ana);
    expect(row).toMatchObject({ online: true, presence: "away", lastSeenAt: START });
    expect(row.typingAction).toBeUndefined();
    expect(row.departed).toBeUndefined();
  });

  // 17f6267: the sweep used to mark away at 20 s, so it could take out of a game someone isPresent still accepts
  test("does not mark away anyone who still counts as present", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(30 * SECOND);
    await sweep(t);
    expect((await person(t, ana)).presence).toBe("online");
    expect(isPresent(await person(t, ana), START + 30 * SECOND)).toBe(true);
    clockTo(45 * SECOND - 1);
    await sweep(t);
    expect((await person(t, ana)).presence).toBe("online");
  });

  test("takes an away participant offline and departed once they have been silent for more than 30 seconds", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    // A guest who switched apps mid-sentence: the tab reports away and says no more
    await t.mutation(api.participants.setTypingAction, { participantId: ana, action: "typing" });
    await heartbeat(t, ana, "away");
    clockTo(30 * SECOND + 1);
    await sweep(t);
    const row = await person(t, ana);
    expect(row).toMatchObject({ online: false, departed: true });
    expect(row.presence).toBeUndefined();
    // Nobody is left to clear it: both apps show whoever has a typingAction, online or not
    expect(row.typingAction).toBeUndefined();
    // Unlike a leave, the sweep announces nothing
    expect(await announcements(t, roomId)).toEqual(["join:Ana"]);
  });

  test("leaves an away participant who was heard from within the last 30 seconds", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await heartbeat(t, ana, "away");
    clockTo(30 * SECOND);
    await sweep(t);
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "away" });
  });

  test("someone whose phone went silent while online is away after one run and offline after the next", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    clockTo(HOUR);
    await sweep(t);
    expect(await person(t, ana)).toMatchObject({ online: true, presence: "away" });
    expect(await person(t, hostId)).toMatchObject({ online: true, presence: "away" });
    clockTo(2 * HOUR);
    await sweep(t);
    expect(await person(t, ana)).toMatchObject({ online: false, departed: true });
    expect(await person(t, hostId)).toMatchObject({ online: false, departed: true });
  });

  test("does not touch someone who is already offline", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    await goOffline(t, ana);
    const before = await person(t, ana);
    clockTo(HOUR);
    await sweep(t);
    expect(await person(t, ana)).toEqual(before);
  });

  describe("a sweep with more to do than one run takes", () => {
    /** People whose tabs died without a word: online, last heard from at START. Every third had already gone away */
    async function addSilentGuests(t: Backend, roomId: Id<"rooms">, count: number) {
      await t.run(async (ctx) => {
        for (let i = 0; i < count; i++) {
          await ctx.db.insert("participants", {
            roomId,
            nickname: `Silent ${i}`,
            role: "participant",
            platform: "web",
            avatar: { type: "preset", value: "fox" },
            preferredLanguage: "en",
            online: true,
            presence: i % 3 === 0 ? "away" : "online",
            typingAction: "typing",
            lastSeenAt: START,
            joinedAt: START,
          });
        }
      });
    }
    const sweepJobs = async (t: Backend) => (await scheduled(t)).filter((job) => job.name.includes("cleanupStaleParticipants"));

    test("goes through 500 people a run, and the runs follow each other until everyone has been looked at once", async () => {
      const t = newBackend();
      const { roomId, hostId } = await createRoom(t);
      await addSilentGuests(t, roomId, 1100);
      await goOffline(t, hostId); // only the 1,100 are in the sweep's way
      clockTo(HOUR);

      await sweep(t);
      const afterOne = (await people(t, roomId)).filter((p) => p._id !== hostId);
      expect(afterOne.filter((p) => p.typingAction === undefined)).toHaveLength(500);
      // The next run is asked for with where this one stopped and the clock the sweep started by
      const jobs = await sweepJobs(t);
      expect(jobs).toHaveLength(1);
      expect(jobs[0].args).toEqual([{ cursor: expect.any(String), now: START + HOUR }]);

      await t.finishAllScheduledFunctions(vi.runAllTimers);
      const everyone = (await people(t, roomId)).filter((p) => p._id !== hostId);
      expect(everyone).toHaveLength(1100);
      for (const p of everyone) expect(p.typingAction).toBeUndefined();
      // Each was looked at once. Those who were away are offline. Those who were online are away and no
      // more: a run that looked at them again would have taken them offline in the same sweep
      const wasAway = (p: Doc<"participants">) => Number(p.nickname.split(" ")[1]) % 3 === 0;
      for (const p of everyone.filter(wasAway)) expect(p).toMatchObject({ online: false, departed: true });
      for (const p of everyone.filter((p) => !wasAway(p))) expect(p).toMatchObject({ online: true, presence: "away" });
      expect(everyone.filter((p) => !wasAway(p) && p.departed)).toHaveLength(0);
      // Three runs for 1,100 people, and no fourth one waiting
      const all = await sweepJobs(t);
      expect(all).toHaveLength(2);
      expect(all.every((job) => job.state.kind === "success")).toBe(true);
    });

    test("a sweep that fits in one run asks for no other", async () => {
      const t = newBackend();
      const { roomId } = await createRoom(t);
      await addSilentGuests(t, roomId, 300);
      clockTo(HOUR);
      await sweep(t);
      expect((await people(t, roomId)).filter((p) => p.typingAction !== undefined)).toHaveLength(0);
      expect(await sweepJobs(t)).toHaveLength(0);
    });

    // The runs of one sweep can be seconds apart. Who is stale is judged once, by the clock the sweep started by
    test("a later run does not take in people who went silent after the sweep started", async () => {
      const t = newBackend();
      const { roomId, hostId } = await createRoom(t);
      await addSilentGuests(t, roomId, 600);
      await goOffline(t, hostId);
      clockTo(HOUR);
      // In a room of their own (the first has had its 300 members), and heard from as the sweep starts
      const late = await joinGuest(t, (await createRoom(t)).roomId, "Late");
      await sweep(t);

      clockTo(HOUR + 10 * MINUTE); // the next run is held up
      await t.finishAllScheduledFunctions(vi.runAllTimers);
      expect(await person(t, late)).toMatchObject({ online: true, presence: "online" });
      expect((await people(t, roomId)).filter((p) => p.typingAction !== undefined)).toHaveLength(0);
    });
  });
});

// ─── purgeGameTraces ─────────────────────────────────────────────────────────

describe("purgeGameTraces", () => {
  /** Trace rows as the three games write them, each kind under a game of its own */
  async function seedTraces(t: Backend, counts: { em: number; tod: number; bingo: number }) {
    const { roomId, hostId } = await createRoom(t);
    await t.run(async (ctx) => {
      const emGame = await ctx.db.insert("emojiMatchGames", {
        roomId,
        status: "canceled",
        hostParticipantId: hostId,
        players: [],
        turnOrder: [],
        board: [],
        selectedCardIds: [],
        matchedPairCount: 0,
        totalPairs: 0,
        boardRows: 0,
        boardCols: 0,
        mismatchRevealMs: 1000,
        createdAt: START,
      });
      const todGame = await ctx.db.insert("truthOrDareGames", {
        roomId,
        status: "canceled",
        hostParticipantId: hostId,
        playerOrder: [],
        currentTurnIndex: 0,
        createdAt: START,
      });
      const bingoGame = await ctx.db.insert("emojiBingoGames", {
        roomId,
        status: "canceled",
        hostParticipantId: hostId,
        winPattern: "line",
        callIntervalMs: 5000,
        players: [],
        drawDeck: [],
        calledEmojis: [],
        drawIndex: 0,
        createdAt: START,
      });
      for (let i = 0; i < counts.em; i++) {
        await ctx.db.insert("emTrace", { gameId: emGame, action: "flip", participantId: hostId, ts: START + i });
      }
      for (let i = 0; i < counts.tod; i++) {
        await ctx.db.insert("todTrace", { gameId: todGame, action: "advanceTurn", participantId: hostId, ts: START + i });
      }
      for (let i = 0; i < counts.bingo; i++) {
        await ctx.db.insert("bingoTrace", { gameId: bingoGame, action: "roll", participantId: hostId, ts: START + i });
      }
    });
  }

  async function traceCounts(t: Backend) {
    return await t.run(async (ctx) => ({
      em: (await ctx.db.query("emTrace").collect()).length,
      tod: (await ctx.db.query("todTrace").collect()).length,
      bingo: (await ctx.db.query("bingoTrace").collect()).length,
    }));
  }

  // Review bug 1: the trace rows hold game and participant ids for every room. The queries that returned them
  // are gone (the games' own files test that); this is the function that empties the tables
  test("empties the three trace tables, says how many rows it deleted and leaves the games alone", async () => {
    const t = newBackend();
    await seedTraces(t, { em: 3, tod: 2, bingo: 4 });
    expect(await t.mutation(internal.rooms.purgeGameTraces)).toBe(9);
    expect(await traceCounts(t)).toEqual({ em: 0, tod: 0, bingo: 0 });
    expect(await t.run((ctx) => ctx.db.query("emojiMatchGames").collect())).toHaveLength(1);
    expect(await t.run((ctx) => ctx.db.query("truthOrDareGames").collect())).toHaveLength(1);
    expect(await t.run((ctx) => ctx.db.query("emojiBingoGames").collect())).toHaveLength(1);
    expect((await scheduled(t)).filter((job) => job.name.includes("purgeGameTraces"))).toHaveLength(0);
  });

  test("deletes 500 rows in one run and carries on by itself until none are left", async () => {
    const t = newBackend();
    await seedTraces(t, { em: 498, tod: 2, bingo: 3 });
    expect(await t.mutation(internal.rooms.purgeGameTraces)).toBe(500);
    expect(await traceCounts(t)).toEqual({ em: 0, tod: 0, bingo: 3 });

    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect(await traceCounts(t)).toEqual({ em: 0, tod: 0, bingo: 0 });
  });
});

// ─── HTTP routes the iOS host calls ──────────────────────────────────────────

describe("/api/rooms/* and /api/participants/*", () => {
  test("rooms/create answers 200 with exactly roomId, joinCode, hostId and background, as JSON", async () => {
    const t = newBackend();
    const res = await post(t, "/api/rooms/create", { hostNickname: "Mika" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    expect(res.body).toEqual({
      roomId: expect.any(String),
      hostId: expect.any(String),
      joinCode: expect.stringMatching(/^[A-HJ-NP-Z2-9]{6}$/),
      background: expect.any(Number),
    });
    const room = await roomRow(t, res.body.roomId);
    expect(room).toMatchObject({ hostId: res.body.hostId, joinCode: res.body.joinCode, status: "waiting" });
    // The texture the room got, which the body did not ask for
    expect(Number.isInteger(room.background)).toBe(true);
    expect(res.body.background).toBe(room.background);
  });

  // Review bug 19, through the body the iOS app sends (RealEnchattoAPI.createRoom)
  test("rooms/create takes the app's whole body: avatar, host language, host token, background and settings", async () => {
    const t = newBackend();
    const hostToken = "a1b2c3d4".repeat(8);
    const sent = settings({ sourceLanguage: "en", targetLanguage: "ja", maxParticipants: 12 });
    const res = await post(t, "/api/rooms/create", {
      hostNickname: "Mika",
      hostAvatarId: "rabbit",
      hostLanguage: "ja",
      hostToken,
      background: 7,
      settings: sent,
    });
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(["background", "hostId", "joinCode", "roomId"]);
    expect(res.body.background).toBe(7);
    expect((await roomRow(t, res.body.roomId)).background).toBe(7);
    expect((await roomRow(t, res.body.roomId)).settings).toEqual(sent);
    expect(await person(t, res.body.hostId)).toMatchObject({
      nickname: "Mika",
      preferredLanguage: "ja",
      avatar: { type: "preset", value: "rabbit" },
    });
  });

  test("rooms/create gives the room the background in the body when it is a number, and answers with the one the room got", async () => {
    const t = newBackend();
    for (const background of [7, 0, 8, 10, 35]) {
      const res = await post(t, "/api/rooms/create", { hostNickname: "Mika", background });
      expect(res.status).toBe(200);
      expect(res.body.background).toBe(background);
      expect((await roomRow(t, res.body.roomId)).background).toBe(background);
    }
    // A number that is not a texture is still a room, with the server's pick, and so is a retired texture
    for (const background of [-1, 36, 1.5, ...RETIRED]) {
      const res = await post(t, "/api/rooms/create", { hostNickname: "Mika", background });
      expect(res.status).toBe(200);
      expect(Object.keys(res.body).sort()).toEqual(["background", "hostId", "joinCode", "roomId"]);
      const stored = (await roomRow(t, res.body.roomId)).background;
      expect(PICKED, String(background)).toContain(stored);
      expect(res.body.background).toBe(stored);
    }
  });

  // createRoom declares background a number, and Convex refuses a call whose argument is of another type
  test("rooms/create leaves out a background that is not a number: the room is made, with the server's pick", async () => {
    // Every room below is the first of its backend and gets the same draws, so the server's pick is the same for each
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const unasked = await post(newBackend(), "/api/rooms/create", { hostNickname: "Mika" });
    expect(unasked.status).toBe(200);
    // Not the 7 the bodies below ask for, and not what null or a boolean reads as when turned into a number
    expect([0, 1, 7]).not.toContain(unasked.body.background);

    for (const background of ["7", "", null, { index: 7 }, [7], true, false]) {
      const t = newBackend();
      const res = await post(t, "/api/rooms/create", { hostNickname: "Mika", background });
      expect(res.status).toBe(200);
      expect(res.body.background).toBe(unasked.body.background);
      expect((await roomRow(t, res.body.roomId)).background).toBe(unasked.body.background);
    }
  });

  test("rooms/create answers 400 with the reason when the room is refused", async () => {
    const t = newBackend();
    const refused = await post(t, "/api/rooms/create", { hostNickname: "   " });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Nickname must be/);
    const incomplete = await post(t, "/api/rooms/create", {});
    expect(incomplete.status).toBe(400);
    expect(typeof incomplete.body.error).toBe("string");
    expect(await t.run((ctx) => ctx.db.query("rooms").collect())).toHaveLength(0);
  });

  test("rooms/state answers the room and its people with the fields the iOS models decode", async () => {
    const t = newBackend();
    const { roomId, hostId, joinCode } = await createRoom(t, { hostNickname: "Mika" });
    const ana = await joinGuest(t, roomId, "Ana", { avatar: "panda", language: "ja" });
    await heartbeat(t, ana, "away");

    const res = await post(t, "/api/rooms/state", { roomId });
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(["participants", "room"]);
    // Room.swift: every field but closedAt and background is required
    expect(res.body.room).toMatchObject({
      _id: roomId,
      joinCode,
      status: "active",
      hostId,
      createdAt: START,
      background: expect.any(Number),
      settings: {
        sourceLanguage: "ja",
        targetLanguage: "en",
        romajiEnabled: true,
        suggestionsEnabled: true,
        maxParticipants: 10,
      },
    });
    // Participant.swift: every field but presence, typingAction and drawingStartedAt is required
    expect(res.body.participants).toHaveLength(2);
    expect(res.body.participants.find((p: Doc<"participants">) => p._id === hostId)).toMatchObject({
      roomId,
      nickname: "Mika",
      role: "host",
      platform: "ios",
      avatar: { type: "preset", value: "default" },
      preferredLanguage: "ja",
      online: true,
      lastSeenAt: START,
      joinedAt: START,
    });
    expect(res.body.participants.find((p: Doc<"participants">) => p._id === ana)).toMatchObject({
      roomId,
      nickname: "Ana",
      role: "participant",
      platform: "web",
      avatar: { type: "preset", value: "panda" },
      preferredLanguage: "ja",
      online: true,
      presence: "away",
      lastSeenAt: START,
      joinedAt: START,
    });
  });

  // Review bug 21: the app's "Rejoin room" reads a 200 with no "room" key as the server's word that the room is gone
  test("rooms/state answers 200 {ok: true}, with no room key, for a room that no longer exists", async () => {
    const t = newBackend();
    const roomId = await deletedRoom(t);
    const res = await post(t, "/api/rooms/state", { roomId });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test("rooms/state answers 400 for an id that is not a room's", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t);
    for (const roomId of ["not-an-id", hostId]) {
      const res = await post(t, "/api/rooms/state", { roomId });
      expect(res.status).toBe(400);
      expect(typeof res.body.error).toBe("string");
    }
  });

  test("rooms/close closes the room and answers {ok: true}, the second time too", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    for (let i = 0; i < 2; i++) {
      const res = await post(t, "/api/rooms/close", { roomId });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    }
    expect((await post(t, "/api/rooms/state", { roomId })).body.room).toMatchObject({
      status: "closed",
      closedAt: START,
    });
  });

  test("rooms/background gives the room in the body the background in the body, and answers with exactly that", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const other = await t.mutation(api.rooms.createRoom, { hostNickname: "Ken", background: 3 });

    const res = await post(t, "/api/rooms/background", { roomId, background: 8 });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    expect(res.body).toEqual({ background: 8 });

    // What the host app polls, and what the guests' pages subscribe to
    expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(8);
    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.background).toBe(8);
    expect((await roomRow(t, other.roomId)).background).toBe(3);
  });

  // What an installed build's Random button can send. The app reads nothing of the answer: it draws its own pick
  // and takes the room's background from its next refresh of the room
  test("rooms/background answers 200 to a retired texture, with the background the room got in its place", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const other = await t.mutation(api.rooms.createRoom, { hostNickname: "Ken", background: 3 });
    let has = 3;
    for (const background of [...RETIRED, ...RETIRED]) {
      const res = await post(t, "/api/rooms/background", { roomId, background });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/application\/json/);
      expect(res.body).toEqual({ background: expect.any(Number) });
      // One of the first ten that are not retired, and not the one the room had
      expect(PICKED.filter((picked) => picked !== has), `${background} in a room with ${has}`).toContain(res.body.background);
      has = res.body.background;
      expect((await post(t, "/api/rooms/state", { roomId })).body.room.background).toBe(has);
      expect((await roomRow(t, roomId)).background).toBe(has);
    }
    expect((await roomRow(t, other.roomId)).background).toBe(3);
  });

  // ConvexHTTPClient adds callerId and callerToken to every body
  test("rooms/background hands on callerId and callerToken: under enforce only the host's own are taken", async () => {
    const log = authLog();
    const t = newBackend();
    const hostToken = tokenFor(1);
    const guestToken = tokenFor(2);
    const { roomId, hostId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", hostToken, background: 3 });
    const ana = await joinGuest(t, roomId, "Ana", { token: guestToken });
    vi.stubEnv("AUTH_MODE", "enforce");

    const refused: Array<[caller: Record<string, unknown>, reason: string]> = [
      [{ callerId: hostId }, "no token"],
      // The name the function uses is not the name the body uses
      [{ callerId: hostId, token: hostToken }, "no token"],
      [{ callerId: hostId, callerToken: guestToken }, "wrong token"],
      // Had callerId been left behind, the room's host would have been assumed and the reason would be "wrong token"
      [{ callerId: ana, callerToken: guestToken }, "not the host"],
    ];
    for (const [caller, reason] of refused) {
      log.clear();
      const res = await post(t, "/api/rooms/background", { roomId, background: 8, ...caller });
      expect({ caller, status: res.status, error: res.body.error }).toEqual({
        caller,
        status: 400,
        error: expect.stringMatching(/Not authorised/),
      });
      expect(log.lines(), reason).toEqual([`auth: rooms.setRoomBackground ${reason}`]);
    }
    expect((await roomRow(t, roomId)).background).toBe(3);

    log.clear();
    const res = await post(t, "/api/rooms/background", { roomId, background: 8, callerId: hostId, callerToken: hostToken });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ background: 8 });
    expect(log.lines()).toEqual([]);
    expect((await roomRow(t, roomId)).background).toBe(8);
  });

  test("rooms/background answers 400 with the reason when the change is refused, and the room keeps its background", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    for (const background of [-1, 36, 1.5]) {
      const res = await post(t, "/api/rooms/background", { roomId, background });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: expect.stringMatching(/Unknown background/) });
    }
    expect((await roomRow(t, roomId)).background).toBe(3);

    const gone = await post(t, "/api/rooms/background", { roomId: await deletedRoom(t), background: 8 });
    expect(gone.status).toBe(400);
    expect(gone.body.error).toMatch(/Room not found/);

    await t.mutation(api.rooms.closeRoom, { roomId });
    const closed = await post(t, "/api/rooms/background", { roomId, background: 8 });
    expect(closed.status).toBe(400);
    expect(closed.body.error).toMatch(/Room is closed/);
    expect((await roomRow(t, roomId)).background).toBe(3);
  });

  // setRoomBackground declares background a number, and Convex refuses a call whose argument is of another type.
  // Read as a number, most of these would be a texture: "7" and [7] are 7, true is 1, and "", null and false are 0
  test("rooms/background answers 400 to a background that is not a number, or to none, and the room keeps the one it has", async () => {
    const t = newBackend();
    const { roomId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", background: 3 });
    const before = await roomRow(t, roomId);
    for (const background of ["7", "", null, { index: 7 }, [7], true, false, undefined]) {
      const res = await post(t, "/api/rooms/background", { roomId, background });
      expect({ background, status: res.status }).toEqual({ background, status: 400 });
      expect(typeof res.body.error).toBe("string");
    }
    expect(await roomRow(t, roomId)).toEqual(before);
  });

  test("rooms/push-token stores the host's device token, and answers 400 to anyone else", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const refused = await post(t, "/api/rooms/push-token", { roomId, hostId: ana, token: DEVICE_TOKEN });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Only the host/);

    const res = await post(t, "/api/rooms/push-token", { roomId, hostId, token: DEVICE_TOKEN });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    const stored = await t.run((ctx) => ctx.db.query("hostPushTokens").collect());
    expect(stored.map((row) => ({ roomId: row.roomId, token: row.token }))).toEqual([{ roomId, token: DEVICE_TOKEN }]);
  });

  test("participants/set-online is the host's heartbeat: it carries the presence and refreshes lastSeenAt", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t);
    clockTo(15 * SECOND);
    const away = await post(t, "/api/participants/set-online", { participantId: hostId, online: true, presence: "away" });
    expect(away.status).toBe(200);
    expect(away.body).toEqual({ ok: true });
    expect(await person(t, hostId)).toMatchObject({ online: true, presence: "away", lastSeenAt: START + 15 * SECOND });

    // Builds from before the app reported "away" send no presence at all
    const plain = await post(t, "/api/participants/set-online", { participantId: hostId, online: true });
    expect(plain.status).toBe(200);
    expect((await person(t, hostId)).presence).toBe("online");
  });

  // Review bug 2 for the host: the sweep had marked a locked phone departed, and games then found too few players
  test("participants/set-online brings back a host the sweep had marked departed", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t);
    clockTo(HOUR);
    await t.mutation(internal.participants.cleanupStaleParticipants, {});
    await t.mutation(internal.participants.cleanupStaleParticipants, {});
    expect(await person(t, hostId)).toMatchObject({ online: false, departed: true });

    const res = await post(t, "/api/participants/set-online", { participantId: hostId, online: true, presence: "online" });
    expect(res.status).toBe(200);
    const host = await person(t, hostId);
    expect(host.online).toBe(true);
    expect(host.departed).toBeUndefined();
    expect(isPresent(host, START + HOUR)).toBe(true);
  });

  test("participants/kick removes the guest, and answers 400 with the reason for the host", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ana = await joinGuest(t, roomId, "Ana");
    const res = await post(t, "/api/participants/kick", { participantId: ana, roomId });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect((await people(t, roomId)).map((p) => p._id)).toEqual([hostId]);

    const refused = await post(t, "/api/participants/kick", { participantId: hostId, roomId });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Cannot kick the host/);
  });

  test("participants/set-typing shows what the host is doing, and a body with no action clears it", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t);
    const drawing = await post(t, "/api/participants/set-typing", {
      participantId: hostId,
      action: "drawing",
      drawingStartedAt: START,
    });
    expect(drawing.status).toBe(200);
    expect(drawing.body).toEqual({ ok: true });
    expect(await person(t, hostId)).toMatchObject({ typingAction: "drawing", drawingStartedAt: START });

    const cleared = await post(t, "/api/participants/set-typing", { participantId: hostId });
    expect(cleared.status).toBe(200);
    expect((await person(t, hostId)).typingAction).toBeUndefined();
  });

  // Review bug 19: the route the app keeps the host's language in sync through
  test("participants/set-language changes the host's language, and answers 400 for one the apps do not offer", async () => {
    const t = newBackend();
    const { hostId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Mika", hostLanguage: "en" });
    const res = await post(t, "/api/participants/set-language", { participantId: hostId, language: "ja" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect((await person(t, hostId)).preferredLanguage).toBe("ja");

    const refused = await post(t, "/api/participants/set-language", { participantId: hostId, language: "fr" });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Unsupported language/);
    expect((await person(t, hostId)).preferredLanguage).toBe("ja");
  });

  test("a body that is not JSON is answered 400 with an error, not a crash", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    for (const path of ["/api/rooms/close", "/api/rooms/background", "/api/participants/set-online"]) {
      const res = await post(t, path, "this is not json");
      expect(res.status).toBe(400);
      expect(typeof res.body.error).toBe("string");
    }
    expect((await roomRow(t, roomId)).status).toBe("waiting");
  });
});
