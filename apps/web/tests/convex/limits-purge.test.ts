// The abuse limits (participants.ts: takeRateLimit, sweepRateLimits) and the closed-room purge
// (rooms.ts: purgeClosedRooms, messages.ts: purgeRoomAudio), all from commit 93ed5d0.
//
// The limits are tested through the mutations and routes that take them. The purge is tested against a
// room that has a row in every table a room can own: see BELONGS below, which walks schema.ts table by
// table and is what every "nothing is left" assertion is built on.
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Doc, Id, TableNames } from "../../convex/_generated/dataModel";
import crons from "../../convex/crons";
import schema from "../../convex/schema";
import { Backend, createRoom, joinGuest, modules, newBackend, tokenFor } from "./setup";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 0, 10, 9, 0, 0);

let consoleWarn: MockInstance;
let consoleError: MockInstance;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
  // The functions log every game step and every refused purge setting. Errors stay visible
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  consoleError = vi.spyOn(console, "error");
});

afterEach(() => {
  // convex-test reports a scheduled function that threw only on the console
  const failedJobs = consoleError.mock.calls.filter((call) => String(call[0]).includes("Error when running scheduled function"));
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  expect(failedJobs).toEqual([]);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * A backend that also enforces Convex's limits on one transaction (16 MiB read, 32,000 documents scanned,
 * 16,000 written and so on), which newBackend() leaves off: a function that goes past them fails here as
 * it would when deployed. Every purge test runs on it, because fitting each step into one transaction is
 * what the purge's steps are for.
 */
function limitedBackend(): Backend {
  return convexTest({ schema, modules, transactionLimits: true });
}

/** POSTs JSON to a route the way the iOS app does */
async function post(t: Backend, path: string, body: Record<string, unknown>) {
  const res = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: (await res.json()) as Record<string, any> };
}

/**
 * Runs the scheduled functions that are due now (runAfter(0): a translation, the audio purge, the next
 * purge step), `generations` times over. Timers with a delay (game clocks) are left alone.
 */
async function runDue(t: Backend, generations = 1) {
  for (let i = 0; i < generations; i++) {
    vi.advanceTimersByTime(0);
    await t.finishInProgressScheduledFunctions();
  }
}

/** Scheduled functions still waiting to run whose name matches */
async function pendingJobs(t: Backend, name: RegExp): Promise<number> {
  return await t.run(async (ctx) => {
    const jobs = await ctx.db.system.query("_scheduled_functions").collect();
    return jobs.filter((job) => job.state.kind === "pending" && name.test(job.name)).length;
  });
}

/**
 * What a client's upload leaves in file storage. convex-test's storage keeps a file's size and hash but
 * not its content type, which a real upload records from the Content-Type header, so the type is written
 * onto the _storage row here.
 */
async function upload(t: Backend, contentType?: string, bytes = 256): Promise<Id<"_storage">> {
  return await t.run(async (ctx) => {
    const id = await ctx.storage.store(new Blob([new Uint8Array(bytes)]));
    if (contentType) await ctx.db.patch(id as any, { contentType } as any);
    return id;
  });
}

async function fileExists(t: Backend, id: Id<"_storage">): Promise<boolean> {
  return await t.run(async (ctx) => (await ctx.db.system.get(id)) !== null);
}

async function fileCount(t: Backend): Promise<number> {
  return await t.run(async (ctx) => (await ctx.db.system.query("_storage").collect()).length);
}

/** The rateLimits row of a key, as the database holds it */
async function allowance(t: Backend, key: string): Promise<Doc<"rateLimits"> | null> {
  return await t.run(
    async (ctx) =>
      await ctx.db
        .query("rateLimits")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique()
  );
}

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`fixture: no ${what}`);
  return value;
}

/** A drawing as both apps send it. The routes check the header and the size, not the pixels */
const PNG = `data:image/png;base64,${btoa("a drawing that is small enough to be one")}`;

/** A room of legacy participants (no tokens), so the limit tests are about limits only */
async function chatRoom(t: Backend) {
  const { roomId, hostId, joinCode } = await createRoom(t);
  const alice = await joinGuest(t, roomId, "Alice", { avatar: "fox" });
  const bob = await joinGuest(t, roomId, "Bob", { avatar: "cat" });
  return { roomId, hostId, joinCode, alice, bob };
}

const sendText = (t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">, text: string, clientId?: string) =>
  t.mutation(api.messages.sendTextMessage, { roomId, senderId, text, clientId });

/** Uses up exactly `units` of a sender's send allowance with text messages, each costing 100 plus its length */
async function spend(t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">, units: number) {
  for (let left = units; left > 0; ) {
    const cost = Math.min(left, 2100);
    if (cost < 101) throw new Error("fixture: a message costs at least 101 units");
    await sendText(t, roomId, senderId, "x".repeat(cost - 100));
    left -= cost;
  }
}

/** A voice message from an uploaded clip. No waveform, so nothing is scheduled for a clip without a transcript */
async function sendVoice(t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">, text?: string) {
  const storageId = await upload(t, "audio/mp4");
  const messageId = await t.mutation(api.messages.sendAudioMessage, {
    roomId,
    senderId,
    storageId,
    durationMs: 1500,
    waveform: [],
    text,
  });
  return { messageId, storageId };
}

/**
 * Voice messages written straight to the database, each with a clip of its own in storage: the send
 * allowance stops a sender at twenty clips a minute. Ten to a transaction, as they may be large.
 */
async function voiceRows(
  t: Backend,
  roomId: Id<"rooms">,
  senderId: Id<"participants">,
  count: number,
  fields: Partial<Doc<"messages">> = {}
): Promise<Id<"messages">[]> {
  const ids: Id<"messages">[] = [];
  for (let done = 0; done < count; done += 10) {
    await t.run(async (ctx) => {
      for (let i = done; i < Math.min(count, done + 10); i++) {
        const storageId = await ctx.storage.store(new Blob([new Uint8Array(16)]));
        ids.push(
          await ctx.db.insert("messages", {
            roomId,
            senderId,
            kind: "audio",
            status: "processed",
            text: "hello",
            mediaUrl: must(await ctx.storage.getUrl(storageId), "clip URL"),
            audioStorageId: storageId,
            durationMs: 1500,
            waveform: [],
            createdAt: Date.now(),
            processedAt: Date.now(),
            ...fields,
          })
        );
      }
    });
  }
  return ids;
}

/** How many of these voice messages still point at a clip, or are gone: closing a room keeps its messages. Read ten to a transaction, as they were written */
async function clipsLeft(t: Backend, messageIds: Id<"messages">[]): Promise<number> {
  let left = 0;
  for (let from = 0; from < messageIds.length; from += 10) {
    left += await t.run(async (ctx) => {
      const rows = await Promise.all(messageIds.slice(from, from + 10).map((id) => ctx.db.get(id)));
      return rows.filter((m) => !m || m.audioStorageId !== undefined || m.mediaUrl !== undefined).length;
    });
  }
  return left;
}

const sendImage = async (t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">, storageId?: Id<"_storage">) =>
  await t.mutation(api.messages.sendImageMessage, {
    roomId,
    senderId,
    storageId: storageId ?? (await upload(t, "image/jpeg")),
  });

const sendInlineDrawing = (t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">) =>
  t.mutation(api.messages.sendDrawingMessage, { roomId, senderId, mediaUrl: PNG });

/** Uploads a clip and asks the transcribe route for its text, as the iOS app does where it cannot recognise speech itself */
async function dictate(t: Backend, roomId: Id<"rooms">, senderId: Id<"participants">) {
  const storageId = await upload(t, "audio/mp4");
  const res = await post(t, "/api/messages/transcribe", { roomId, senderId, storageId });
  return { ...res, storageId };
}

const messagesOfKind = async (t: Backend, roomId: Id<"rooms">, kind: Doc<"messages">["kind"] = "text") =>
  (await t.query(api.messages.getRoomMessages, { roomId })).filter((m) => m.kind === kind);

// ─── The send allowance ──────────────────────────────────────────────────────

describe("the send allowance: 12,000 units a minute for each sender", () => {
  test("a text message costs 100 units plus its trimmed length", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    await sendText(t, roomId, alice, "x".repeat(50));
    expect(await allowance(t, `send:${alice}`)).toMatchObject({ count: 150, windowStart: T0 });

    await sendText(t, roomId, alice, "   hi   ");
    expect((await allowance(t, `send:${alice}`))?.count).toBe(150 + 102);
  });

  test("a hundred 20-character messages fit in a minute and the next one is refused", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const short = "x".repeat(20); // 120 units each: a hundred of them are exactly 12,000

    for (let i = 0; i < 100; i++) await sendText(t, roomId, alice, short);
    await expect(sendText(t, roomId, alice, short)).rejects.toThrow(/rate limit/);

    expect(await messagesOfKind(t, roomId)).toHaveLength(100);
  });

  test("only five messages of the full 2,000 characters fit in a minute", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const long = "x".repeat(2000);

    for (let i = 0; i < 5; i++) await sendText(t, roomId, alice, long);
    await expect(sendText(t, roomId, alice, long)).rejects.toThrow(/rate limit/);

    expect(await messagesOfKind(t, roomId)).toHaveLength(5);
  });

  test("a refused message is not stored and uses up no allowance", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const long = "x".repeat(2000);
    for (let i = 0; i < 5; i++) await sendText(t, roomId, alice, long); // 10,500 used, 1,500 left

    for (let i = 0; i < 3; i++) await expect(sendText(t, roomId, alice, long)).rejects.toThrow(/rate limit/);
    expect((await allowance(t, `send:${alice}`))?.count).toBe(10_500);
    expect(await messagesOfKind(t, roomId)).toHaveLength(5);

    // The 1,500 units the refusals did not take: a message of 1,400 characters still fits, to the unit
    await sendText(t, roomId, alice, "x".repeat(1400));
    expect((await allowance(t, `send:${alice}`))?.count).toBe(12_000);
    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);
  });

  test("the allowance comes back 60 seconds after the first message of the window", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    await sendText(t, roomId, alice, "first");
    vi.setSystemTime(T0 + 50_000);
    await spend(t, roomId, alice, 12_000 - 105);
    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);

    vi.setSystemTime(T0 + MINUTE - 1);
    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);

    // Ten seconds after the burst, but a minute after the window began
    vi.setSystemTime(T0 + MINUTE);
    await sendText(t, roomId, alice, "x".repeat(2000));
    expect(await allowance(t, `send:${alice}`)).toMatchObject({ count: 2100, windowStart: T0 + MINUTE });
  });

  test("each sender has an allowance of their own", async () => {
    const t = newBackend();
    const { roomId, hostId, alice, bob } = await chatRoom(t);
    await spend(t, roomId, alice, 12_000);
    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);

    await sendText(t, roomId, bob, "x".repeat(2000));
    await sendText(t, roomId, hostId, "x".repeat(2000));

    expect((await allowance(t, `send:${bob}`))?.count).toBe(2100);
    expect((await allowance(t, `send:${hostId}`))?.count).toBe(2100);
  });

  test("a voice message without a transcript costs 600 units of the same allowance", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    for (let i = 0; i < 20; i++) await sendVoice(t, roomId, alice);
    expect((await allowance(t, `send:${alice}`))?.count).toBe(12_000);

    await expect(sendVoice(t, roomId, alice)).rejects.toThrow(/rate limit/);
    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);
    expect(await messagesOfKind(t, roomId, "audio")).toHaveLength(20);
  });

  test("a voice message with a transcript costs 100 units plus the transcript's length", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    await sendVoice(t, roomId, alice, "hello there");

    expect((await allowance(t, `send:${alice}`))?.count).toBe(100 + "hello there".length);
  });

  test("text already sent leaves less room for voice", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    await spend(t, roomId, alice, 11_500);

    await expect(sendVoice(t, roomId, alice)).rejects.toThrow(/rate limit/); // 600 does not fit in 500
    await sendVoice(t, roomId, alice, "x".repeat(400)); // 500 does
  });

  test("a send repeated with its clientId costs nothing and is answered even when the allowance is spent", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const first = await sendText(t, roomId, alice, "x".repeat(2000), "client-1");
    await spend(t, roomId, alice, 12_000 - 2100);
    await expect(sendText(t, roomId, alice, "x", "client-2")).rejects.toThrow(/rate limit/);

    const again = await sendText(t, roomId, alice, "x".repeat(2000), "client-1");

    expect(again).toBe(first);
    expect((await allowance(t, `send:${alice}`))?.count).toBe(12_000);
  });

  test("a voice message sent again after a lost answer costs nothing and is answered, with or without a clientId", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const clip = async () => ({ roomId, senderId: alice, storageId: await upload(t, "audio/mp4"), durationMs: 1500, waveform: [] });
    const tagged = { ...(await clip()), clientId: "voice-1" };
    // A build from before clientId repeats its send with nothing to tell it by but the upload
    const untagged = await clip();
    const first = await t.mutation(api.messages.sendAudioMessage, tagged);
    const second = await t.mutation(api.messages.sendAudioMessage, untagged);
    await spend(t, roomId, alice, 12_000 - 2 * 600);
    await expect(sendVoice(t, roomId, alice)).rejects.toThrow(/rate limit/);

    expect(await t.mutation(api.messages.sendAudioMessage, tagged)).toBe(first);
    expect(await t.mutation(api.messages.sendAudioMessage, untagged)).toBe(second);

    expect((await allowance(t, `send:${alice}`))?.count).toBe(12_000);
    expect(await messagesOfKind(t, roomId, "audio")).toHaveLength(2);
  });

  test("a message refused for its content uses no allowance", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    await expect(sendText(t, roomId, alice, "   ")).rejects.toThrow(/empty/);
    await expect(sendText(t, roomId, alice, "x".repeat(2001))).rejects.toThrow(/too long/i);

    expect(await allowance(t, `send:${alice}`)).toBeNull();
  });

  test("someone who is not in the room is refused without an allowance being started for them", async () => {
    const t = newBackend();
    const { roomId, hostId, bob } = await chatRoom(t);
    const elsewhere = await chatRoom(t);
    await t.mutation(api.participants.kickParticipant, { roomId, participantId: bob, callerId: hostId });

    // AUTH_MODE is unset here: the membership check behind the allowance holds in "log" mode too
    await expect(sendText(t, roomId, elsewhere.alice, "hello")).rejects.toThrow(/Not a member/);
    await expect(sendText(t, roomId, bob, "hello")).rejects.toThrow(/Not a member/);

    expect(await allowance(t, `send:${elsewhere.alice}`)).toBeNull();
    expect(await allowance(t, `send:${bob}`)).toBeNull();
  });

  test("the limit is on whatever AUTH_MODE says, and under enforce a wrong token cannot spend someone's allowance", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const alice = await joinGuest(t, roomId, "Alice", { token: tokenFor(1) });
    const send = (token: string) =>
      t.mutation(api.messages.sendTextMessage, { roomId, senderId: alice, text: "x".repeat(2000), token });
    vi.stubEnv("AUTH_MODE", "enforce");

    for (let i = 0; i < 6; i++) await expect(send(tokenFor(2))).rejects.toThrow(/Not authorised/);
    expect(await allowance(t, `send:${alice}`)).toBeNull();

    for (let i = 0; i < 5; i++) await send(tokenFor(1));
    await expect(send(tokenFor(1))).rejects.toThrow(/rate limit/);
  });
});

// ─── Pictures and drawings ───────────────────────────────────────────────────

describe("pictures and drawings: 20 a minute for each sender", () => {
  test("twenty pictures fit in a minute and the next one is refused", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    for (let i = 0; i < 20; i++) expect(await sendImage(t, roomId, alice)).toBeTruthy();
    await expect(sendImage(t, roomId, alice)).rejects.toThrow(/rate limit/);

    expect(await messagesOfKind(t, roomId, "image")).toHaveLength(20);
    expect((await allowance(t, `media:${alice}`))?.count).toBe(20);
  });

  test("drawings count against the same 20 as pictures", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    for (let i = 0; i < 12; i++) await sendImage(t, roomId, alice);
    for (let i = 0; i < 8; i++) await sendInlineDrawing(t, roomId, alice);

    await expect(sendInlineDrawing(t, roomId, alice)).rejects.toThrow(/rate limit/);
    await expect(sendImage(t, roomId, alice)).rejects.toThrow(/rate limit/);

    expect(await messagesOfKind(t, roomId, "drawing")).toHaveLength(8);
  });

  test("pictures do not draw on the allowance for text and voice, nor the other way round, nor on another sender's 20", async () => {
    const t = newBackend();
    const { roomId, alice, bob } = await chatRoom(t);
    for (let i = 0; i < 20; i++) await sendImage(t, roomId, alice);
    await spend(t, roomId, bob, 12_000);

    await sendText(t, roomId, alice, "x".repeat(2000));
    await sendVoice(t, roomId, alice);
    expect(await sendImage(t, roomId, bob)).toBeTruthy();
    await sendInlineDrawing(t, roomId, bob);

    expect((await allowance(t, `send:${alice}`))?.count).toBe(2100 + 600);
    expect((await allowance(t, `media:${bob}`))?.count).toBe(2);
  });

  test("a refused picture keeps its upload, and the same upload is sent once the minute is over", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    for (let i = 0; i < 20; i++) await sendImage(t, roomId, alice);
    const storageId = await upload(t, "image/jpeg");
    await expect(sendImage(t, roomId, alice, storageId)).rejects.toThrow(/rate limit/);
    expect(await fileExists(t, storageId)).toBe(true);

    vi.setSystemTime(T0 + MINUTE - 1);
    await expect(sendImage(t, roomId, alice, storageId)).rejects.toThrow(/rate limit/);
    vi.setSystemTime(T0 + MINUTE);
    const messageId = await sendImage(t, roomId, alice, storageId);

    expect(messageId).toBeTruthy();
    expect(await allowance(t, `media:${alice}`)).toMatchObject({ count: 1, windowStart: T0 + MINUTE });
  });

  test("a picture or a drawing repeated with its clientId costs nothing and is answered even when the 20 are used up", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const picture = { roomId, senderId: alice, storageId: await upload(t, "image/jpeg"), clientId: "picture-1" };
    const drawing = { roomId, senderId: alice, mediaUrl: PNG, clientId: "drawing-1" };
    const firstPicture = await t.mutation(api.messages.sendImageMessage, picture);
    const firstDrawing = await t.mutation(api.messages.sendDrawingMessage, drawing);
    for (let i = 0; i < 18; i++) await sendImage(t, roomId, alice);
    await expect(sendImage(t, roomId, alice)).rejects.toThrow(/rate limit/);

    expect(await t.mutation(api.messages.sendImageMessage, picture)).toBe(firstPicture);
    expect(await t.mutation(api.messages.sendDrawingMessage, drawing)).toBe(firstDrawing);

    expect((await allowance(t, `media:${alice}`))?.count).toBe(20);
    expect(await messagesOfKind(t, roomId, "image")).toHaveLength(19);
    expect(await messagesOfKind(t, roomId, "drawing")).toHaveLength(1);
  });

  test("an upload turned away for its type uses no allowance", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);

    const result = await sendImage(t, roomId, alice, await upload(t, "application/pdf"));

    expect(result).toBeNull();
    expect(await allowance(t, `media:${alice}`)).toBeNull();
  });
});

// ─── Dictation ───────────────────────────────────────────────────────────────

describe("dictation: 30 clips in five minutes for each sender", () => {
  test("thirty dictations are answered and the next gets 503 with a rate limit error", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);

    for (let i = 0; i < 30; i++) {
      // No GROQ key in tests: the route answers with no text, which is still an answer
      expect(await dictate(t, roomId, hostId)).toMatchObject({ status: 200, body: { text: null } });
    }
    const refused = await dictate(t, roomId, hostId);

    expect(refused.status).toBe(503);
    expect(refused.body.error).toMatch(/rate limit/);
    expect((await allowance(t, `dictation:${hostId}`))?.count).toBe(30);
  });

  test("a refused dictation still deletes the clip it came with", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    for (let i = 0; i < 30; i++) await dictate(t, roomId, hostId);

    const refused = await dictate(t, roomId, hostId);

    expect(refused.status).toBe(503);
    expect(await fileExists(t, refused.storageId)).toBe(false);
    expect(await fileCount(t)).toBe(0);
  });

  test("the dictation allowance comes back after five minutes", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    for (let i = 0; i < 30; i++) await dictate(t, roomId, hostId);

    vi.setSystemTime(T0 + 5 * MINUTE - 1);
    expect((await dictate(t, roomId, hostId)).status).toBe(503);
    vi.setSystemTime(T0 + 5 * MINUTE);
    expect((await dictate(t, roomId, hostId)).status).toBe(200);
  });

  test("dictation and sending do not draw on each other's allowance, and each speaker has their own", async () => {
    const t = newBackend();
    const { roomId, hostId, alice } = await chatRoom(t);
    for (let i = 0; i < 30; i++) await dictate(t, roomId, hostId);
    await spend(t, roomId, alice, 12_000);

    await sendText(t, roomId, hostId, "x".repeat(2000));
    expect((await dictate(t, roomId, alice)).status).toBe(200);

    expect((await dictate(t, roomId, hostId)).status).toBe(503);
  });

  test("a clip that fails the checks is neither counted nor deleted", async () => {
    const t = newBackend();
    const { roomId, hostId, alice } = await chatRoom(t);
    const voice = await sendVoice(t, roomId, alice, "hello");

    const res = await post(t, "/api/messages/transcribe", { roomId, senderId: hostId, storageId: voice.storageId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already used/);
    expect(await fileExists(t, voice.storageId)).toBe(true);
    expect(await allowance(t, `dictation:${hostId}`)).toBeNull();
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

describe("a throttled route answers 503, which the iOS send queue retries", () => {
  test("send-text answers 503 for the limit and 400 for any other refusal", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    await spend(t, roomId, hostId, 12_000);

    const throttled = await post(t, "/api/messages/send-text", { roomId, senderId: hostId, text: "hello" });
    const empty = await post(t, "/api/messages/send-text", { roomId, senderId: hostId, text: "   " });

    expect(throttled.status).toBe(503);
    expect(throttled.body.error).toMatch(/rate limit/);
    expect(empty.status).toBe(400);
  });

  test("send-text answers 200 with the message id again once the minute is over", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    await spend(t, roomId, hostId, 12_000);
    const body = { roomId, senderId: hostId, text: "hello", clientId: "queued-1" };
    expect((await post(t, "/api/messages/send-text", body)).status).toBe(503);

    vi.setSystemTime(T0 + MINUTE);
    const retried = await post(t, "/api/messages/send-text", body);

    expect(retried.status).toBe(200);
    expect(retried.body.messageId).toBeTruthy();
  });

  test("send-audio answers 503 and leaves the clip for the retry", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    await spend(t, roomId, hostId, 12_000);
    const storageId = await upload(t, "audio/mp4");
    const body = { roomId, senderId: hostId, storageId, durationMs: 1500, waveform: [] };

    const throttled = await post(t, "/api/messages/send-audio", body);

    expect(throttled.status).toBe(503);
    expect(throttled.body.error).toMatch(/rate limit/);
    expect(await fileExists(t, storageId)).toBe(true);
    vi.setSystemTime(T0 + MINUTE);
    expect((await post(t, "/api/messages/send-audio", body)).status).toBe(200);
  });

  test("send-image answers 503", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    for (let i = 0; i < 20; i++) await sendImage(t, roomId, hostId);

    const throttled = await post(t, "/api/messages/send-image", {
      roomId,
      senderId: hostId,
      storageId: await upload(t, "image/jpeg"),
    });

    expect(throttled.status).toBe(503);
    expect(throttled.body.error).toMatch(/rate limit/);
  });

  test("send-drawing answers 503 and does not keep the drawing it stored", async () => {
    const t = newBackend();
    const { roomId, hostId } = await chatRoom(t);
    for (let i = 0; i < 20; i++) await sendInlineDrawing(t, roomId, hostId);
    expect(await fileCount(t)).toBe(0);

    const throttled = await post(t, "/api/messages/send-drawing", { roomId, senderId: hostId, mediaUrl: PNG });

    expect(throttled.status).toBe(503);
    expect(throttled.body.error).toMatch(/rate limit/);
    expect(await fileCount(t)).toBe(0);
    expect(await messagesOfKind(t, roomId, "drawing")).toHaveLength(20);
  });
});

// The other two users of takeRateLimit have their tests with their games: Emojifyr's hourly ceiling in
// lost-in-translation.test.ts, Word Rush's generation caps in word-rush.test.ts.

// ─── The sweep of old rows ───────────────────────────────────────────────────

describe("sweepRateLimits", () => {
  test("deletes a row whose window began more than a day ago and keeps the rest", async () => {
    const t = newBackend();
    const { roomId, alice, bob } = await chatRoom(t);
    await sendText(t, roomId, alice, "hello"); // window from T0
    vi.setSystemTime(T0 + HOUR);
    await sendText(t, roomId, bob, "hello"); // window from T0 + 1 h

    vi.setSystemTime(T0 + DAY); // exactly a day: not yet "more than"
    await t.mutation(internal.participants.sweepRateLimits, {});
    expect(await allowance(t, `send:${alice}`)).not.toBeNull();

    vi.setSystemTime(T0 + DAY + 1);
    await t.mutation(internal.participants.sweepRateLimits, {});
    expect(await allowance(t, `send:${alice}`)).toBeNull();
    expect(await allowance(t, `send:${bob}`)).toMatchObject({ count: 105, windowStart: T0 + HOUR });
  });

  test("a row in use is not touched by the sweep", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    await spend(t, roomId, alice, 12_000);

    await t.mutation(internal.participants.sweepRateLimits, {});

    await expect(sendText(t, roomId, alice, "x")).rejects.toThrow(/rate limit/);
  });

  test("more than 500 stale rows are swept in batches that follow each other until none is left", async () => {
    const t = newBackend();
    await t.run(async (ctx) => {
      for (let i = 0; i < 1100; i++) {
        await ctx.db.insert("rateLimits", { key: `send:gone-${i}`, windowStart: T0 - 2 * DAY, count: 1 });
      }
      for (let i = 0; i < 3; i++) await ctx.db.insert("rateLimits", { key: `send:here-${i}`, windowStart: T0, count: 1 });
    });
    const rows = () => t.run(async (ctx) => (await ctx.db.query("rateLimits").collect()).map((row) => row.key));

    await t.mutation(internal.participants.sweepRateLimits, {});
    expect(await rows()).toHaveLength(603);

    await runDue(t, 3);
    expect((await rows()).sort()).toEqual(["send:here-0", "send:here-1", "send:here-2"]);
    expect(await pendingJobs(t, /sweepRateLimits/)).toBe(0);
  });
});

// ─── Crons ───────────────────────────────────────────────────────────────────

describe("the crons that start the sweep and the purge", () => {
  // convex-test does not run crons, so this reads what crons.ts registers
  type Schedule = { type: string; hours?: number; minutes?: number; seconds?: number };
  const registered = (crons as unknown as { crons: Record<string, { name: string; args: unknown[]; schedule: Schedule }> })
    .crons;
  const jobsFor = (name: string) => Object.values(registered).filter((job) => job.name === name);
  /** How often a job runs, however crons.ts writes it: { hours: 1 }, { minutes: 60 } and crons.hourly are all an hour */
  const period = ({ type, hours = 0, minutes = 0, seconds = 0 }: Schedule) =>
    type === "interval" ? hours * HOUR + minutes * MINUTE + seconds * 1000 : type === "hourly" ? HOUR : type === "daily" ? DAY : null;

  test("stale rate limit rows are swept every hour", () => {
    const sweep = jobsFor("participants:sweepRateLimits");
    expect(sweep).toHaveLength(1);
    expect(sweep[0].args).toEqual([{}]);
    expect(period(sweep[0].schedule)).toBe(HOUR);
  });

  test("the purge is started once a day, as a start: with no run id", () => {
    const purge = jobsFor("rooms:purgeClosedRooms");
    expect(purge).toHaveLength(1);
    expect(purge[0].args).toEqual([{}]);
    expect(period(purge[0].schedule)).toBe(DAY);
  });

  // The participants table keeps everyone who ever joined (only a kick or the purge deletes a row), so the hourly
  // sweep (participants.ts: cleanupStaleParticipants) must not read all of it: 32,000 rows is the most one
  // function may scan. It is here, not with the function's other tests, because only this file's backend
  // enforces the limits.
  test(
    "the hourly sweep of stale participants still runs when the deployment holds more than 32,000 participants",
    async () => {
      const t = limitedBackend();
      const room = await chatRoom(t);
      // The people of rooms closed long ago. Which room they were in makes no difference to the sweep
      const closed = await closedRoomWith(t, 0);
      for (let batch = 0; batch < 4; batch++) {
        await t.run(async (ctx) => {
          for (let i = 0; i < 8000; i++) {
            await ctx.db.insert("participants", {
              roomId: closed.roomId,
              nickname: `Guest ${batch}-${i}`,
              role: "participant",
              platform: "web",
              avatar: { type: "preset", value: "fox" },
              preferredLanguage: "en",
              online: false,
              departed: true,
              lastSeenAt: T0,
              joinedAt: T0,
            });
          }
        });
      }
      // Alice's tab died two minutes ago: no heartbeat, no leave beacon
      vi.setSystemTime(T0 + 2 * MINUTE);

      const outcome = await t.mutation(internal.participants.cleanupStaleParticipants, {}).then(
        () => "ran",
        (error) => String(error)
      );

      expect(outcome).toBe("ran");
      const people = await t.query(api.participants.getRoomParticipants, { roomId: room.roomId });
      expect(people.find((p) => p._id === room.alice)?.presence).toBe("away");
    },
    30_000
  );

  // What the first sweep meets on a deployment where the sweep has been failing: far more people still marked
  // online than one function may write (16,000 documents)
  test(
    "a backlog of 17,000 people still marked online is worked off in runs that each stay inside the limits",
    async () => {
      const t = limitedBackend();
      const closed = await closedRoomWith(t, 0);
      for (let batch = 0; batch < 2; batch++) {
        await t.run(async (ctx) => {
          for (let i = 0; i < 8500; i++) {
            await ctx.db.insert("participants", {
              roomId: closed.roomId,
              nickname: `Guest ${batch}-${i}`,
              role: "participant",
              platform: "web",
              avatar: { type: "preset", value: "fox" },
              preferredLanguage: "en",
              online: true,
              presence: "online",
              lastSeenAt: T0,
              joinedAt: T0,
            });
          }
        });
      }
      vi.setSystemTime(T0 + HOUR);

      await t.mutation(internal.participants.cleanupStaleParticipants, {});
      for (let runs = 0; (await pendingJobs(t, /cleanupStaleParticipants/)) > 0; runs++) {
        if (runs >= 100) throw new Error("the sweep never reached the end of its backlog");
        await runDue(t);
      }

      // A run that failed is reported by afterEach. Everyone was marked away, and nobody was looked at twice:
      // a second look in the same sweep would have taken them offline
      const backlog = await t.run(async (ctx) =>
        (await ctx.db.query("participants").collect()).filter((p) => p.nickname.startsWith("Guest "))
      );
      expect(backlog).toHaveLength(17_000);
      expect(backlog.filter((p) => p.online && p.presence === "away")).toHaveLength(17_000);
    },
    60_000
  );
});

// ─── What a room owns ────────────────────────────────────────────────────────

/**
 * schema.ts, table by table: the field through which a row belongs to a room. The row belongs to
 * whatever room the document in that field belongs to; null means the table holds no room data.
 * The type makes this fail to compile when schema.ts gains a table that is not listed here.
 */
const BELONGS: { [T in TableNames]: (keyof Doc<T> & string) | null } = {
  // The room itself
  rooms: "_id",
  // roomId: the room's APNs device token
  hostPushTokens: "roomId",
  // roomId
  participants: "roomId",
  // participantId -> participants.roomId
  participantSecrets: "participantId",
  // roomId (senderId is one of the room's participants, replyToId another of its messages)
  messages: "roomId",
  // messageId -> messages.roomId
  reactions: "messageId",
  // roomId: Lost in Translation and Emojifyr sessions
  gameSessions: "roomId",
  // gameSessionId -> gameSessions.roomId
  emojifyrRounds: "gameSessionId",
  // roundId -> emojifyrRounds.gameSessionId -> gameSessions.roomId
  emojifyrGuesses: "roundId",
  // roomId
  emojiMatchGames: "roomId",
  // roomId
  truthOrDareGames: "roomId",
  // gameId -> truthOrDareGames.roomId. Its drawing is a stored file (responseStorageId)
  truthOrDareTurns: "gameId",
  // gameId -> emojiMatchGames.roomId
  emTrace: "gameId",
  // gameId -> truthOrDareGames.roomId
  todTrace: "gameId",
  // gameSessionId -> gameSessions.roomId
  gameChains: "gameSessionId",
  // gameSessionId -> gameSessions.roomId (chainId points at a chain of the same session)
  gameSteps: "gameSessionId",
  // roomId. Its clips are stored files (storageIds, clipStorageId, teachClip.storageId)
  wordRushGames: "roomId",
  // gameId -> wordRushGames.roomId
  wordRushAnswers: "gameId",
  // gameId -> wordRushGames.roomId
  wordRushVotes: "gameId",
  // roomId
  emojiBingoGames: "roomId",
  // gameId -> emojiBingoGames.roomId
  bingoTrace: "gameId",
  // No room data: a key string that names a participant or a room ("send:<participantId>",
  // "media:<participantId>", "dictation:<participantId>", "wordrush:<roomId>") or everyone
  // ("emojifyr:all", "wordrush:all"). The purge leaves these rows; sweepRateLimits deletes them a day
  // after their window began
  rateLimits: null,
  // No room data: the purge's own lease, one row
  purgeRuns: null,
};

const TABLES = Object.keys(schema.tables) as TableNames[];
const ROOM_TABLES = TABLES.filter((table) => BELONGS[table] !== null);

type Row = { _id: string; _creationTime: number; [field: string]: unknown };
type Placed = { table: TableNames; row: Row };
type Dump = { rows: Placed[]; byId: Map<string, Placed>; files: string[] };

/** Every row of every table of the schema, and the id of every stored file */
async function dump(t: Backend): Promise<Dump> {
  const raw = await t.run(async (ctx) => {
    const tables: Record<string, Row[]> = {};
    for (const table of TABLES) tables[table] = await (ctx.db.query(table as any) as any).collect();
    const files = (await ctx.db.system.query("_storage").collect()).map((file) => file._id as string);
    return { tables, files };
  });
  const rows = TABLES.flatMap((table) => raw.tables[table].map((row) => ({ table, row })));
  return { rows, byId: new Map(rows.map((placed) => [placed.row._id, placed])), files: raw.files };
}

/** The room a row belongs to, found by following BELONGS. Null for a row whose parent is gone, or of a table without room data */
function roomOf(d: Dump, id: unknown): string | null {
  const placed = typeof id === "string" ? d.byId.get(id) : undefined;
  if (!placed) return null;
  const field = BELONGS[placed.table];
  if (field === null) return null;
  return placed.table === "rooms" ? placed.row._id : roomOf(d, placed.row[field]);
}

const rowsOf = (d: Dump, roomId: string) => d.rows.filter((placed) => roomOf(d, placed.row._id) === roomId);

/** Rows of room-owned tables that lead to no room: their parent has been deleted from under them */
const orphans = (d: Dump) =>
  d.rows
    .filter((placed) => BELONGS[placed.table] !== null && roomOf(d, placed.row._id) === null)
    .map((placed) => `${placed.table} ${placed.row._id}`);

/** The stored files a room's rows name, in any field */
function filesOf(d: Dump, roomId: string): string[] {
  const text = JSON.stringify(rowsOf(d, roomId).map((placed) => placed.row));
  return d.files.filter((file) => text.includes(file));
}

/** Rows that mention any of the ids anywhere: in an id field, an array, a string id, or JSON kept in a text */
function mentioning(d: Dump, ids: string[], tables: TableNames[]): string[] {
  return d.rows
    .filter((placed) => tables.includes(placed.table))
    .filter((placed) => {
      const text = JSON.stringify(placed.row);
      return ids.some((id) => text.includes(id));
    })
    .map((placed) => `${placed.table} ${placed.row._id}`);
}

const countByTable = (rows: Placed[]) =>
  Object.fromEntries(ROOM_TABLES.map((table) => [table, rows.filter((placed) => placed.table === table).length]));

// ─── A room with a row in every table ────────────────────────────────────────

type Member = { id: Id<"participants">; token: string | undefined };

/**
 * A room that has been used for everything, made through the same mutations and routes the apps call:
 * tokened and legacy participants, a push token, every kind of message with reactions and files, and
 * one game of each type caught in the middle. Game clocks are left pending: nothing here needs them.
 */
async function buildRichRoom(t: Backend, seed: number) {
  const created = await createRoom(t, { hostNickname: `Host ${seed}`, hostToken: tokenFor(seed * 100 + 1) });
  const { roomId, joinCode } = created;
  const join = async (nickname: string, avatar: string, language: string, n?: number): Promise<Member> => {
    const token = n === undefined ? undefined : tokenFor(seed * 100 + n);
    return { id: await joinGuest(t, roomId, nickname, { avatar, language, token }), token };
  };
  const host: Member = { id: created.hostId, token: tokenFor(seed * 100 + 1) };
  const alice = await join("Alice", "fox", "en", 2);
  const bob = await join("Bob", "cat", "ja", 3);
  const carol = await join("Carol", "owl", "en"); // from a build before tokens
  const members = [host, alice, bob, carol];
  const tokenOf = (id: Id<"participants"> | string | undefined) => must(members.find((m) => m.id === id), "member").token;

  await t.mutation(api.participants.setHostPushToken, {
    roomId,
    hostId: host.id,
    token: `${"c".repeat(63)}${seed}`,
    callerToken: host.token,
  });

  // Messages of every kind
  const text = await t.mutation(api.messages.sendTextMessage, {
    roomId,
    senderId: alice.id,
    text: "hello everyone",
    clientId: `client-${seed}`,
    token: alice.token,
  });
  const reply = await t.mutation(api.messages.sendTextMessage, {
    roomId,
    senderId: bob.id,
    text: "こんにちは",
    replyToId: text,
    token: bob.token,
  });
  const imageFile = await upload(t, "image/jpeg");
  const image = must(
    await t.mutation(api.messages.sendImageMessage, { roomId, senderId: alice.id, storageId: imageFile, token: alice.token }),
    "image message"
  );
  // The same upload sent twice: two rows that name one file
  const imageAgain = must(
    await t.mutation(api.messages.sendImageMessage, { roomId, senderId: alice.id, storageId: imageFile, token: alice.token }),
    "second image message"
  );
  const drawn = await post(t, "/api/messages/send-drawing", {
    roomId,
    senderId: host.id,
    mediaUrl: PNG,
    callerToken: host.token,
  });
  if (drawn.status !== 200) throw new Error(`fixture: drawing refused: ${drawn.body.error}`);
  const storedDrawing = drawn.body.messageId as Id<"messages">;
  const inlineDrawing = await t.mutation(api.messages.sendDrawingMessage, { roomId, senderId: carol.id, mediaUrl: PNG });
  const voiceFile = await upload(t, "audio/mp4");
  const voice = await t.mutation(api.messages.sendAudioMessage, {
    roomId,
    senderId: bob.id,
    storageId: voiceFile,
    durationMs: 1500,
    waveform: [0.2, 0.8],
    text: "やあ",
    lang: "ja",
    token: bob.token,
  });
  const react = (messageId: Id<"messages">, who: Member, emoji: string) =>
    t.mutation(api.reactions.addReaction, { messageId, participantId: who.id, emoji, token: who.token });
  await react(text, bob, "👍");
  await react(text, carol, "❤️");
  await react(reply, alice, "😮");
  await react(image, host, "🔥");
  await react(storedDrawing, alice, "😂");
  await react(inlineDrawing, bob, "😢");
  await react(voice, alice, "👍");

  // Someone the host removed: the participant and its secret are gone, the message and the reaction stay
  const dave = await join("Dave", "bear", "en", 4);
  const farewell = await t.mutation(api.messages.sendTextMessage, { roomId, senderId: dave.id, text: "bye", token: dave.token });
  await react(text, dave, "🔥");
  await t.mutation(api.participants.kickParticipant, { roomId, participantId: dave.id, callerId: host.id, token: host.token });

  // Lost in Translation: a session, its chains and steps, with a drawing kept inline in a step
  const lost = await t.mutation(api.games.startGame, {
    roomId,
    participantId: host.id,
    gameType: "lost_in_translation",
    token: host.token,
  });
  const drawStep = must(
    await t.run(
      async (ctx) =>
        await ctx.db
          .query("gameSteps")
          .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", lost))
          .first()
    ),
    "draw step"
  );
  await t.mutation(api.games.submitGameStep, {
    stepId: drawStep._id,
    participantId: drawStep.assignedParticipantId,
    outputDrawingUrl: PNG,
    token: tokenOf(drawStep.assignedParticipantId),
  });
  await t.mutation(api.games.cancelGame, { roomId, participantId: host.id, token: host.token });

  // Emojifyr, which takes no tokens: a session, a round and a guess
  const emojifyr = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: host.id });
  const round = must(await t.query(api.games.getCurrentEmojifyrRound, { gameSessionId: emojifyr }), "Emojifyr round");
  await t.mutation(api.games.submitEmojifyrSentence, { roundId: round._id, sentence: "I like sushi" });
  await t.mutation(api.games.submitEmojifyrEmojiClue, { roundId: round._id, emojiClue: "🍣❤️" });
  await t.mutation(api.games.submitEmojifyrGuess, { roundId: round._id, participantId: alice.id, guessText: "sushi love" });

  // Emoji Match: a game under way, with a trace row from a flipped card
  const match = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: host.id, token: host.token });
  await t.mutation(api.emojiMatch.joinLobby, { gameId: match, participantId: alice.id, token: alice.token });
  await t.mutation(api.emojiMatch.startGame, { gameId: match, participantId: host.id, token: host.token });
  const matchGame = must(await t.run(async (ctx) => await ctx.db.get(match)), "Emoji Match game");
  const flipper = must(matchGame.currentTurnParticipantId, "Emoji Match turn");
  await t.mutation(api.emojiMatch.flipCard, {
    gameId: match,
    participantId: flipper,
    cardId: matchGame.board[0].cardId,
    token: tokenOf(flipper),
  });

  // Emoji Bingo: a game under way, with its trace row from the start
  const bingo = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: host.id, token: host.token });
  await t.mutation(api.emojiBingo.joinLobby, { gameId: bingo, participantId: alice.id, token: alice.token });
  await t.mutation(api.emojiBingo.startGame, { gameId: bingo, participantId: host.id, token: host.token });

  // Truth or Dare: a turn answered with a drawing, which the route stores as a file, and trace rows
  const dare = await t.mutation(api.truthOrDare.createGame, { roomId, hostParticipantId: host.id, token: host.token });
  const dareGame = must(await t.run(async (ctx) => await ctx.db.get(dare)), "Truth or Dare game");
  const dared = must(dareGame.currentTurnParticipantId, "Truth or Dare turn");
  await t.mutation(api.truthOrDare.submitChoice, { gameId: dare, participantId: dared, choice: "dare", token: tokenOf(dared) });
  const answered = await post(t, "/api/truth-or-dare/submit-response", {
    gameId: dare,
    participantId: dared,
    responseMediaUrl: PNG,
    callerToken: tokenOf(dared),
  });
  if (answered.status !== 200) throw new Error(`fixture: Truth or Dare answer refused: ${answered.body.error}`);

  // Word Rush: played into a Say it! round, so the game holds a clip, a teaching clip, answers and a vote
  const rush = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: host.id, token: host.token });
  await t.mutation(api.wordRush.joinLobby, { gameId: rush, participantId: alice.id, token: alice.token });
  // The lobby's card generation, which is counted against the room, and the translations queued above
  // (no model key: the cards stay the built-in deck and the messages are marked failed)
  await runDue(t);
  await t.mutation(api.wordRush.start, { gameId: rush, participantId: host.id, token: host.token });
  let judged = false;
  for (let turn = 0; turn < 12 && !judged; turn++) {
    const game = must(await t.run(async (ctx) => await ctx.db.get(rush)), "Word Rush game");
    if (game.phase === "clues") {
      for (const player of [host, alice]) {
        await t.mutation(api.wordRush.answer, { gameId: rush, participantId: player.id, choiceIndex: 0, token: player.token });
      }
    } else if (game.phase === "reveal") {
      await t.mutation(api.wordRush.skip, { gameId: rush, participantId: host.id, phaseSeq: game.phaseSeq, token: host.token });
    } else if (game.phase === "mic") {
      const performer = must(game.performerId, "Word Rush performer");
      await t.mutation(api.wordRush.submitClip, {
        gameId: rush,
        participantId: performer,
        storageId: await upload(t, "audio/mp4"),
        token: tokenOf(performer),
      });
    } else if (game.phase === "judging") {
      const judge = game.performerId === host.id ? alice : host;
      await t.mutation(api.wordRush.submitTeachClip, {
        gameId: rush,
        participantId: judge.id,
        storageId: await upload(t, "audio/mp4"),
        token: judge.token,
      });
      await t.mutation(api.wordRush.vote, { gameId: rush, participantId: judge.id, vote: "close", token: judge.token });
      judged = true;
    }
  }
  if (!judged) throw new Error("fixture: Word Rush never reached a Say it! round");

  await runDue(t);

  return {
    roomId,
    joinCode,
    host,
    alice,
    bob,
    carol,
    kicked: dave.id,
    messages: { text, reply, image, imageAgain, storedDrawing, inlineDrawing, voice, farewell },
    imageFile,
  };
}

type RichRoom = Awaited<ReturnType<typeof buildRichRoom>>;

/** The host closes the room, and the audio purge that the close schedules runs */
async function closeRich(t: Backend, room: RichRoom) {
  await t.mutation(api.rooms.closeRoom, { roomId: room.roomId, callerId: room.host.id, token: room.host.token });
  await runDue(t);
}

/**
 * Puts a clip back on the room's voice message, as in a room that was closed before closing deleted the
 * clips. A closed room accepts no voice message, so this is written straight to the database.
 */
async function leaveClipBehind(t: Backend, room: RichRoom): Promise<Id<"_storage">> {
  const storageId = await upload(t, "audio/mp4");
  await t.run(async (ctx) => {
    await ctx.db.patch(room.messages.voice, { audioStorageId: storageId, mediaUrl: must(await ctx.storage.getUrl(storageId), "url") });
  });
  return storageId;
}

/** Starts a purge the way the cron does and runs its chain to the end. Returns the number of steps, the start included */
async function runPurge(t: Backend, maxSteps = 200): Promise<number> {
  await t.mutation(internal.rooms.purgeClosedRooms, {});
  let steps = 1;
  while ((await pendingJobs(t, /purgeClosedRooms/)) > 0) {
    if (++steps > maxSteps) throw new Error("the purge chain did not end");
    await runDue(t);
  }
  return steps;
}

const lease = (t: Backend) => t.run(async (ctx) => await ctx.db.query("purgeRuns").collect());

/**
 * Four used rooms, 31 days on: one closed 31 days ago, one closed 29 days ago, one still open, and one
 * closed 31 days ago whose closing time was never recorded. Each closed room still has a voice clip.
 */
async function fourRooms(t: Backend) {
  const old = await buildRichRoom(t, 1);
  const recent = await buildRichRoom(t, 2);
  const open = await buildRichRoom(t, 3);
  const undated = await buildRichRoom(t, 4);

  await closeRich(t, old);
  await closeRich(t, undated);
  await t.run(async (ctx) => await ctx.db.patch(undated.roomId, { closedAt: undefined }));
  vi.setSystemTime(T0 + 2 * DAY);
  await closeRich(t, recent);
  for (const room of [old, recent, undated]) await leaveClipBehind(t, room);

  vi.setSystemTime(T0 + 31 * DAY);
  return { old, recent, open, undated };
}

// ─── Plainer rooms, for the tests of steps and of the lease ──────────────────

/**
 * A closed room of a legacy host and `count` plain messages. The messages are written straight to the
 * database: sent one by one they would only meet the send limit, and the step tests need bulk.
 */
async function closedRoomWith(t: Backend, count: number, mediaUrl?: string) {
  const { roomId, hostId, joinCode } = await createRoom(t);
  await t.run(async (ctx) => {
    for (let i = 0; i < count; i++) {
      await ctx.db.insert("messages", {
        roomId,
        senderId: hostId,
        kind: mediaUrl ? "drawing" : "text",
        status: "processed",
        text: mediaUrl ? undefined : `message ${i}`,
        mediaUrl,
        createdAt: Date.now(),
        processedAt: Date.now(),
      });
    }
  });
  await t.mutation(api.rooms.closeRoom, { roomId });
  await runDue(t);
  return { roomId, hostId, joinCode };
}

const messageCount = async (t: Backend, roomId: Id<"rooms">) => (await t.query(api.messages.getRoomMessages, { roomId })).length;

/**
 * A room with a voice message and eighteen drawings kept inline at a million characters each, as Lost in
 * Translation rounds and the web's offline queue leave them: 18 MB, more than a transaction may read.
 * Closed, and the audio purge that the close schedules has run.
 */
async function roomOver16MiB(t: Backend) {
  const { roomId, hostId, alice } = await chatRoom(t);
  const voice = await sendVoice(t, roomId, alice, "hello");
  const drawing = `data:image/png;base64,${"A".repeat(1_000_000)}`;
  for (let batch = 0; batch < 6; batch++) {
    await t.run(async (ctx) => {
      for (let i = 0; i < 3; i++) {
        await ctx.db.insert("messages", {
          roomId,
          senderId: hostId,
          kind: "drawing",
          status: "processed",
          mediaUrl: drawing,
          createdAt: Date.now(),
          processedAt: Date.now(),
        });
      }
    });
  }
  await t.mutation(api.rooms.closeRoom, { roomId });
  await runDue(t);
  return { roomId, voice };
}

describe("the fixture: a room with a row in every table a room can own", () => {
  test("BELONGS lists every table of schema.ts", () => {
    expect(Object.keys(BELONGS).sort()).toEqual([...TABLES].sort());
  });

  test("a used room has rows in every room-owned table, stored files of every kind, and no orphans", async () => {
    const t = newBackend();
    const room = await buildRichRoom(t, 1);
    await closeRich(t, room);
    await leaveClipBehind(t, room);

    const d = await dump(t);
    const counts = countByTable(rowsOf(d, room.roomId));

    expect(Object.entries(counts).filter(([, count]) => count === 0)).toEqual([]);
    expect(counts.participantSecrets).toBe(3); // host, Alice and Bob. Carol is from before tokens; Dave's went when he was kicked
    expect(orphans(d)).toEqual([]);
    // A picture, a stored drawing, a voice clip, a Truth or Dare drawing, a Word Rush clip and a teaching clip
    expect(filesOf(d, room.roomId)).toHaveLength(6);
    expect(d.files).toHaveLength(6);
    const kinds = new Set(rowsOf(d, room.roomId).filter((p) => p.table === "messages").map((p) => p.row.kind));
    expect([...kinds].sort()).toEqual(["audio", "drawing", "image", "system", "text"]);
  });
});

// ─── The switch ──────────────────────────────────────────────────────────────

describe("purgeClosedRooms does nothing unless PURGE_CLOSED_ROOMS_AFTER_DAYS is a number of at least 1", () => {
  async function longClosedRoom(t: Backend) {
    const room = await buildRichRoom(t, 1);
    await closeRich(t, room);
    await leaveClipBehind(t, room);
    vi.setSystemTime(T0 + 400 * DAY);
    return room;
  }

  test("unset: no row, no file and no lease is touched, and nothing is scheduled", async () => {
    const t = limitedBackend();
    await longClosedRoom(t);
    const before = await dump(t);

    await t.mutation(internal.rooms.purgeClosedRooms, {});

    expect(await dump(t)).toEqual(before);
    expect(await lease(t)).toEqual([]);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
  });

  test.each(["", "0", "-5", "0.5", "abc", "30 days", "NaN", "Infinity", " "])(
    "set to %j: nothing is touched and nothing is scheduled",
    async (value) => {
      const t = limitedBackend();
      await longClosedRoom(t);
      const before = await dump(t);
      vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", value);

      await t.mutation(internal.rooms.purgeClosedRooms, {});

      expect(await dump(t)).toEqual(before);
      expect(await lease(t)).toEqual([]);
      expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    }
  );

  test.each([
    ["1", DAY],
    ["1.5", 1.5 * DAY],
  ])("set to %j, the least that counts: a room goes once it has been closed for longer than that", async (value, retention) => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 3);
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", value);

    vi.setSystemTime(T0 + retention);
    await runPurge(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).not.toBeNull();

    vi.setSystemTime(T0 + retention + 1);
    await runPurge(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
    expect(consoleWarn).not.toHaveBeenCalledWith(expect.stringMatching(/PURGE_CLOSED_ROOMS_AFTER_DAYS/));
  });

  test("a value that is set but unusable is reported in the log", async () => {
    const t = limitedBackend();
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "thirty");

    await t.mutation(internal.rooms.purgeClosedRooms, {});

    expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/PURGE_CLOSED_ROOMS_AFTER_DAYS/));
  });

  test("unsetting the switch stops a run at its next step", async () => {
    const t = limitedBackend();
    const room = await closedRoomWith(t, 120);
    vi.setSystemTime(T0 + 31 * DAY);
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "30");
    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await messageCount(t, room.roomId)).toBe(70);

    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "");
    await runDue(t, 3);

    expect(await messageCount(t, room.roomId)).toBe(70);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
  });
});

// ─── What a run deletes ──────────────────────────────────────────────────────

describe("purgeClosedRooms with a retention of 30 days", () => {
  beforeEach(() => {
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "30");
  });

  test("no row in any table refers to the purged room afterwards", async () => {
    const t = limitedBackend();
    const { old } = await fourRooms(t);
    const before = await dump(t);
    const owned = rowsOf(before, old.roomId);
    // The ids of its rows and files, and of the participant the host removed, whose own row went then
    const ids = [...owned.map((placed) => placed.row._id), ...filesOf(before, old.roomId), old.kicked];
    expect(mentioning(before, [old.kicked], ROOM_TABLES).length).toBeGreaterThanOrEqual(2);

    await runPurge(t);

    const after = await dump(t);
    // Every row the room owned is gone, table by table
    expect(countByTable(rowsOf(after, old.roomId))).toEqual(Object.fromEntries(ROOM_TABLES.map((table) => [table, 0])));
    expect(owned.filter((placed) => after.byId.has(placed.row._id)).map((placed) => `${placed.table} ${placed.row._id}`)).toEqual([]);
    // Nothing that is left was a child of something deleted
    expect(orphans(after)).toEqual([]);
    // No row that is left names the room, its people, its messages, its games or its files, in any field
    expect(mentioning(after, ids, ROOM_TABLES)).toEqual([]);
  });

  test("the purged room's stored files are deleted", async () => {
    const t = limitedBackend();
    const { old } = await fourRooms(t);
    const before = await dump(t);
    const files = filesOf(before, old.roomId);
    expect(files).toHaveLength(6);
    expect(files).toContain(old.imageFile);

    await runPurge(t);

    const after = await dump(t);
    expect(files.filter((file) => after.files.includes(file))).toEqual([]);
    // The other three rooms keep their six each
    expect(after.files).toHaveLength(18);
    for (const file of files) {
      expect(await t.run(async (ctx) => await ctx.storage.getUrl(file as Id<"_storage">))).toBeNull();
    }
  });

  test("a Word Rush game's clips from a Say it! round that is over are deleted too", async () => {
    const t = limitedBackend();
    const room = await buildRichRoom(t, 1);
    const rush = async () =>
      must(
        await t.run(
          async (ctx) =>
            await ctx.db
              .query("wordRushGames")
              .withIndex("by_roomId", (q) => q.eq("roomId", room.roomId))
              .unique()
        ),
        "Word Rush game"
      );
    // The fixture stops at the verdict of a Say it! round. The host moves on to the next card: the game then
    // has no current clip or teaching clip, and still lists both files to delete when it ends
    const atVerdict = await rush();
    await t.mutation(api.wordRush.skip, {
      gameId: atVerdict._id,
      participantId: room.host.id,
      phaseSeq: atVerdict.phaseSeq,
      token: room.host.token,
    });
    const game = await rush();
    expect(game).toMatchObject({ status: "active", phase: "clues", storageIds: atVerdict.storageIds });
    expect(game.storageIds).toHaveLength(2);
    expect(game.clipStorageId).toBeUndefined();
    expect(game.teachClip).toBeUndefined();
    await closeRich(t, room);
    vi.setSystemTime(T0 + 31 * DAY);

    await runPurge(t);

    for (const id of game.storageIds) expect(await fileExists(t, id)).toBe(false);
    expect(await fileCount(t)).toBe(0);
  });

  test("a room whose games ran on by their clocks after it closed, to their ends, is purged whole", async () => {
    const t = limitedBackend();
    const room = await buildRichRoom(t, 1);
    await closeRich(t, room);
    const mid = countByTable(rowsOf(await dump(t), room.roomId));
    // Nobody is left to play: each game's timers run it to its end, or stop when they find the room closed
    expect(await pendingJobs(t, /./)).toBeGreaterThan(0);
    for (let hours = 0; (await pendingJobs(t, /./)) > 0; hours++) {
      if (hours >= 200) throw new Error("the game clocks of a closed room never stopped");
      vi.advanceTimersByTime(HOUR);
      await t.finishInProgressScheduledFunctions();
    }
    const ended = await dump(t);
    // What the clocks left is not what the other tests purge: the Word Rush game, now over, has deleted its
    // own two clips. Emoji Bingo's roll timer stops at a closed room, like Emoji Match's turn clock, so its
    // game is left as the close found it and has no new trace rows
    expect(countByTable(rowsOf(ended, room.roomId)).bingoTrace).toBe(mid.bingoTrace);
    expect(ended.files).toHaveLength(3);
    vi.setSystemTime(T0 + 31 * DAY);

    await runPurge(t);

    const after = await dump(t);
    expect(orphans(after)).toEqual([]);
    expect(after.rows.filter((placed) => BELONGS[placed.table] !== null).map((placed) => `${placed.table} ${placed.row._id}`)).toEqual([]);
    expect(after.files).toEqual([]);
  });

  test("a room closed more recently, an open room and a closed room with no closing time keep every row and file", async () => {
    const t = limitedBackend();
    const { recent, open, undated } = await fourRooms(t);
    const before = await dump(t);

    await runPurge(t);

    const after = await dump(t);
    for (const room of [recent, open, undated]) {
      expect(rowsOf(after, room.roomId)).toEqual(rowsOf(before, room.roomId));
      expect(filesOf(after, room.roomId)).toEqual(filesOf(before, room.roomId));
      expect(filesOf(after, room.roomId)).toHaveLength(6);
    }
    expect((await t.query(api.rooms.getRoomState, { roomId: open.roomId }))?.room.status).toBe("active");
    expect((await t.query(api.rooms.getRoomState, { roomId: recent.roomId }))?.participants).toHaveLength(4);
  });

  test("the purged room can no longer be read by its id or its join code", async () => {
    const t = limitedBackend();
    const { old } = await fourRooms(t);
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode: old.joinCode }))?._id).toBe(old.roomId);

    await runPurge(t);

    expect(await t.query(api.rooms.getRoomState, { roomId: old.roomId })).toBeNull();
    // What the iOS start screen is told about the room it saved: 200 with no "room" is how it learns the room
    // is gone and stops offering to rejoin it (HostStartRoomViewModel.checkSavedRoom)
    expect(await post(t, "/api/rooms/state", { roomId: old.roomId })).toEqual({ status: 200, body: { ok: true } });
    expect(await t.query(api.rooms.getRoomByJoinCode, { joinCode: old.joinCode })).toBeNull();
    expect(await t.query(api.messages.getRoomMessages, { roomId: old.roomId })).toEqual([]);
    expect(await t.query(api.messages.getMessageById, { messageId: old.messages.image })).toBeNull();
    expect(await t.query(api.reactions.getRoomReactionSummaries, { roomId: old.roomId })).toEqual([]);
  });

  test("rateLimits rows are left alone, and the hourly sweep removes the last mention of the room", async () => {
    const t = limitedBackend();
    const { old } = await fourRooms(t);
    const before = await dump(t);
    const ids = [...rowsOf(before, old.roomId).map((placed) => placed.row._id), old.kicked];
    const limits = (d: Dump) => d.rows.filter((placed) => placed.table === "rateLimits").map((placed) => placed.row);
    // Rows keyed by the room and by its people: a guest's sends and pictures, the room's Word Rush generations
    const keys = [`send:${old.alice.id}`, `media:${old.alice.id}`, `wordrush:${old.roomId}`];
    expect(limits(before).map((row) => row.key)).toEqual(expect.arrayContaining(keys));

    await runPurge(t);
    const purged = await dump(t);
    expect(limits(purged)).toEqual(limits(before));
    expect(mentioning(purged, ids, ["rateLimits"]).length).toBeGreaterThanOrEqual(keys.length);

    await t.mutation(internal.participants.sweepRateLimits, {});
    const swept = await dump(t);
    expect(limits(swept)).toEqual([]);
    expect(mentioning(swept, ids, TABLES)).toEqual([]);
  });

  test("the run leaves one lease row that says it finished and how many rooms it deleted", async () => {
    const t = limitedBackend();
    await fourRooms(t);

    await runPurge(t);

    expect(await lease(t)).toEqual([
      expect.objectContaining({ runId: T0 + 31 * DAY, heartbeatAt: T0 + 31 * DAY, roomsPurged: 1, finishedAt: T0 + 31 * DAY }),
    ]);
  });

  test("a room is kept until it has been closed for longer than the retention, to the millisecond", async () => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 3);

    vi.setSystemTime(T0 + 30 * DAY);
    await runPurge(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).not.toBeNull();
    expect(await messageCount(t, roomId)).toBe(3);

    vi.setSystemTime(T0 + 30 * DAY + 1);
    await runPurge(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
  });

  test("with nothing old enough, a run finishes at once and schedules nothing", async () => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 3);
    vi.setSystemTime(T0 + 5 * DAY);

    await t.mutation(internal.rooms.purgeClosedRooms, {});

    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 0, finishedAt: T0 + 5 * DAY })]);
    expect(await messageCount(t, roomId)).toBe(3);
  });

  test("several old rooms go in one run, the longest closed first", async () => {
    const t = limitedBackend();
    const first = await closedRoomWith(t, 2);
    vi.setSystemTime(T0 + DAY);
    const second = await closedRoomWith(t, 2);
    vi.setSystemTime(T0 + 2 * DAY);
    const third = await closedRoomWith(t, 2);
    vi.setSystemTime(T0 + 40 * DAY);
    const left = async () => {
      const here = [];
      for (const room of [first, second, third]) {
        if (await t.query(api.rooms.getRoomState, { roomId: room.roomId })) here.push(room.roomId);
      }
      return here;
    };

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await left()).toEqual([second.roomId, third.roomId]);
    await runDue(t);
    expect(await left()).toEqual([third.roomId]);
    await runDue(t, 2);
    expect(await left()).toEqual([]);

    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 3, finishedAt: T0 + 40 * DAY })]);
  });

  test("a second run on a later day reuses the lease row", async () => {
    const t = limitedBackend();
    await closedRoomWith(t, 2);
    vi.setSystemTime(T0 + 31 * DAY);
    await runPurge(t);
    await closedRoomWith(t, 2);
    vi.setSystemTime(T0 + 62 * DAY);

    await runPurge(t);

    expect(await lease(t)).toEqual([expect.objectContaining({ runId: T0 + 62 * DAY, roomsPurged: 1, finishedAt: T0 + 62 * DAY })]);
  });
});

// ─── Steps ───────────────────────────────────────────────────────────────────

describe("a purge run works in steps of 50 rows", () => {
  beforeEach(() => {
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "30");
  });

  test("each step deletes at most 50 rows and schedules the next, until the room itself goes", async () => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 120);
    vi.setSystemTime(T0 + 31 * DAY);

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await messageCount(t, roomId)).toBe(70);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);

    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(20);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);

    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(0);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();

    // One more step looks for another room, finds none and ends the run
    await runDue(t);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 1, finishedAt: T0 + 31 * DAY })]);
  });

  test("until its last step the room still reads as closed, with all its participants", async () => {
    const t = limitedBackend();
    const { roomId, joinCode } = await closedRoomWith(t, 120);
    const guest = await t.run(
      async (ctx) =>
        await ctx.db.insert("participants", {
          roomId,
          nickname: "Guest",
          role: "participant",
          platform: "web",
          avatar: { type: "preset", value: "fox" },
          preferredLanguage: "en",
          online: false,
          departed: true,
          lastSeenAt: T0,
          joinedAt: T0,
        })
    );
    vi.setSystemTime(T0 + 31 * DAY);

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    await runDue(t);

    const state = must(await t.query(api.rooms.getRoomState, { roomId }), "room state");
    expect(state.room.status).toBe("closed");
    expect(state.participants.map((p) => p._id)).toContain(guest);
    expect(state.participants).toHaveLength(2);
    expect((await t.query(api.rooms.getRoomByJoinCode, { joinCode }))?.status).toBe("closed");
    // ...and it is still closed to anyone who tries to use it
    await expect(joinGuest(t, roomId, "Late")).rejects.toThrow(/closed/);
  });

  test("a step also stops on the size of what it has deleted: two rows of 600,000 characters", async () => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 5, `data:image/png;base64,${"A".repeat(600_000)}`);
    vi.setSystemTime(T0 + 31 * DAY);
    const drawings = () =>
      t.run(async (ctx) => {
        // Counted in place: handing five rows of this size back to the test would be the slow part of it
        let count = 0;
        for await (const _ of ctx.db.query("messages").withIndex("by_roomId", (q) => q.eq("roomId", roomId))) count++;
        return count;
      });

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await drawings()).toBe(3);
    await runDue(t);
    expect(await drawings()).toBe(1);
    await runDue(t);
    expect(await drawings()).toBe(0);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
  });

  test("a row whose children did not all fit in the step stays for the next one", async () => {
    const t = limitedBackend();
    const { roomId, hostId } = await closedRoomWith(t, 1);
    const [message] = await t.query(api.messages.getRoomMessages, { roomId });
    await t.run(async (ctx) => {
      for (let i = 0; i < 60; i++) {
        await ctx.db.insert("reactions", { messageId: message._id, participantId: hostId, emoji: "👍", createdAt: T0 });
      }
    });
    vi.setSystemTime(T0 + 31 * DAY);

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await t.query(api.reactions.getReactionsForMessage, { messageId: message._id })).toHaveLength(10);
    expect(await t.query(api.messages.getMessageById, { messageId: message._id })).not.toBeNull();

    await runDue(t);
    expect(await t.query(api.reactions.getReactionsForMessage, { messageId: message._id })).toEqual([]);
    expect(await t.query(api.messages.getMessageById, { messageId: message._id })).toBeNull();
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
  });

  test("a used room is deleted over several steps and the run still finishes", async () => {
    const t = limitedBackend();
    const room = await buildRichRoom(t, 1);
    await closeRich(t, room);
    vi.setSystemTime(T0 + 31 * DAY);
    const rows = rowsOf(await dump(t), room.roomId).length;
    expect(rows).toBeGreaterThan(50);

    const steps = await runPurge(t);

    // 50 rows a step, the room document with the last of them, and one step that finds no other room
    expect(steps).toBe(Math.floor((rows - 1) / 50) + 2);
    expect(rowsOf(await dump(t), room.roomId)).toEqual([]);
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 1, finishedAt: T0 + 31 * DAY })]);
  });

  // Every table whose rows hang off another row of the room and not off the room itself, reactions (the test
  // above) and secrets (one for a participant at most) left out. Taken from BELONGS, so a table added to
  // schema.ts is tried here as soon as it is listed there
  const CHILD_TABLES = ROOM_TABLES.filter(
    (table) => !["_id", "roomId"].includes(BELONGS[table] ?? "") && !["reactions", "participantSecrets"].includes(table)
  );

  test.each(CHILD_TABLES)("a parent with more %s rows than one step deletes waits for them all: none is stranded", async (table) => {
    const t = limitedBackend();
    const room = await buildRichRoom(t, 1);
    await closeRich(t, room);
    const row = must(
      rowsOf(await dump(t), room.roomId).find((placed) => placed.table === table),
      `${table} row`
    ).row;
    // Sixty more like it under the same parent, as a longer game leaves them. A parent deleted while some of
    // them are left would strand them for good: they are only found through its id
    await t.run(async (ctx) => {
      const { _id, _creationTime, ...copy } = row;
      for (let i = 0; i < 60; i++) await ctx.db.insert(table, copy as any);
    });
    vi.setSystemTime(T0 + 31 * DAY);

    await runPurge(t);

    const after = await dump(t);
    expect(orphans(after)).toEqual([]);
    // It was the only room: nothing is left in any table a room can own, and no file
    expect(after.rows.filter((placed) => BELONGS[placed.table] !== null).map((placed) => `${placed.table} ${placed.row._id}`)).toEqual([]);
    expect(after.files).toEqual([]);
  });

  test("a room holding more than one transaction may read is purged inside Convex's transaction limits", async () => {
    const t = limitedBackend();
    const { roomId, voice } = await roomOver16MiB(t);
    vi.setSystemTime(T0 + 31 * DAY);

    const steps = await runPurge(t);

    // Eighteen rows of a million characters: a step stops after the row that takes it past its million
    expect(steps).toBeGreaterThanOrEqual(18);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
    expect(await t.run(async (ctx) => await ctx.db.query("messages").first())).toBeNull();
    expect(await fileExists(t, voice.storageId)).toBe(false);
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 1, finishedAt: T0 + 31 * DAY })]);
  });

  test("a run stops after 500 rooms and leaves the rest, the most recently closed, for the next run", async () => {
    const t = limitedBackend();
    const roomIds = await t.run(async (ctx) => {
      const ids: Id<"rooms">[] = [];
      for (let i = 0; i < 502; i++) {
        ids.push(
          await ctx.db.insert("rooms", {
            joinCode: `ROOM${i}`,
            status: "closed",
            settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 10 },
            hostId: "",
            createdAt: T0,
            closedAt: T0 + i,
          })
        );
      }
      return ids;
    });
    vi.setSystemTime(T0 + 31 * DAY);

    // One room a step. More rounds than the run needs: a chain that has ended leaves nothing to run
    await t.mutation(internal.rooms.purgeClosedRooms, {});
    await runDue(t, 510);

    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    const left = await t.run(async (ctx) => (await ctx.db.query("rooms").collect()).map((room) => room._id));
    expect(left).toEqual(roomIds.slice(500));
    expect(await lease(t)).toEqual([expect.objectContaining({ roomsPurged: 500, finishedAt: T0 + 31 * DAY })]);

    vi.setSystemTime(T0 + 32 * DAY);
    await runPurge(t);
    expect(await t.run(async (ctx) => await ctx.db.query("rooms").collect())).toEqual([]);
  });
});

// ─── The lease ───────────────────────────────────────────────────────────────

describe("the purgeRuns lease keeps two chains from deleting side by side", () => {
  beforeEach(() => {
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "30");
  });

  /** A room of 220 messages, 31 days closed, with the first step of a run done: 170 left, one step waiting */
  async function runUnderWay(t: Backend) {
    const room = await closedRoomWith(t, 220);
    vi.setSystemTime(T0 + 31 * DAY);
    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await messageCount(t, room.roomId)).toBe(170);
    return room;
  }
  const NOW = T0 + 31 * DAY;

  test("a start while a run is under way deletes nothing, schedules nothing and leaves the lease as it is", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);
    const before = await lease(t);
    expect(before).toEqual([expect.objectContaining({ runId: NOW, heartbeatAt: NOW, roomsPurged: 0 })]);
    expect(before[0].finishedAt).toBeUndefined();

    vi.setSystemTime(NOW + 10 * MINUTE - 1);
    await t.mutation(internal.rooms.purgeClosedRooms, {});

    expect(await messageCount(t, roomId)).toBe(170);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);
    expect(await lease(t)).toEqual(before);
  });

  test("only one chain carries on after a second start: one step's rows go per round", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);
    await t.mutation(internal.rooms.purgeClosedRooms, {});

    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(120);
    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(70);
  });

  test("every step moves the lease's heartbeat, so a start more than ten minutes into a run that is still working is refused", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);
    vi.setSystemTime(NOW + 6 * MINUTE);
    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(120);
    const before = await lease(t);
    expect(before).toEqual([expect.objectContaining({ runId: NOW, heartbeatAt: NOW + 6 * MINUTE })]);

    // Twelve minutes after the run began, six after its last step
    vi.setSystemTime(NOW + 12 * MINUTE);
    await t.mutation(internal.rooms.purgeClosedRooms, {});

    expect(await messageCount(t, roomId)).toBe(120);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);
    expect(await lease(t)).toEqual(before);
  });

  test("a step that carries another run's id does nothing", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);
    const before = await lease(t);

    await t.mutation(internal.rooms.purgeClosedRooms, { runId: NOW - DAY });

    expect(await messageCount(t, roomId)).toBe(170);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);
    expect(await lease(t)).toEqual(before);
  });

  test("a step with no lease on record does nothing", async () => {
    const t = limitedBackend();
    const { roomId } = await closedRoomWith(t, 3);
    vi.setSystemTime(NOW);

    await t.mutation(internal.rooms.purgeClosedRooms, { runId: NOW });

    expect(await messageCount(t, roomId)).toBe(3);
    expect(await lease(t)).toEqual([]);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
  });

  test("a step of a run that has finished does nothing", async () => {
    const t = limitedBackend();
    await closedRoomWith(t, 3);
    vi.setSystemTime(NOW);
    await runPurge(t);
    const { roomId } = await t.run(async (ctx) => {
      const roomId = await ctx.db.insert("rooms", {
        joinCode: "LATER1",
        status: "closed",
        settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 10 },
        hostId: "",
        createdAt: T0,
        closedAt: T0,
      });
      return { roomId };
    });

    await t.mutation(internal.rooms.purgeClosedRooms, { runId: NOW });

    expect(await t.query(api.rooms.getRoomState, { roomId })).not.toBeNull();
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
  });

  test("a start takes over a lease that has not moved for ten minutes, and the old chain's step then stops", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);

    // The first chain's next step is still waiting when the cron, or someone by hand, starts again
    vi.setSystemTime(NOW + 10 * MINUTE);
    await t.mutation(internal.rooms.purgeClosedRooms, {});
    expect(await messageCount(t, roomId)).toBe(120);
    expect(await lease(t)).toEqual([expect.objectContaining({ runId: NOW + 10 * MINUTE, heartbeatAt: NOW + 10 * MINUTE })]);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(2);

    // Both waiting steps run. Only the new run's deletes anything or schedules another
    await runDue(t);
    expect(await messageCount(t, roomId)).toBe(70);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(1);

    await runDue(t, 3);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
    expect(await lease(t)).toHaveLength(1);
  });

  test("a run stops once it is an hour old, and the next start finishes the room", async () => {
    const t = limitedBackend();
    const { roomId } = await runUnderWay(t);

    vi.setSystemTime(NOW + HOUR);
    await runDue(t);

    expect(await messageCount(t, roomId)).toBe(170);
    expect(await pendingJobs(t, /purgeClosedRooms/)).toBe(0);
    expect(await lease(t)).toEqual([expect.objectContaining({ runId: NOW, roomsPurged: 0, finishedAt: NOW + HOUR })]);

    vi.setSystemTime(NOW + DAY);
    await runPurge(t);
    expect(await t.query(api.rooms.getRoomState, { roomId })).toBeNull();
    expect(await lease(t)).toEqual([expect.objectContaining({ runId: NOW + DAY, roomsPurged: 1, finishedAt: NOW + DAY })]);
  });
});

// ─── Voice clips when a room closes ──────────────────────────────────────────

describe("purgeRoomAudio: closing a room deletes its voice clips", () => {
  test("the clip and its URL go; the transcript, the translation and the rest of the message stay", async () => {
    const t = newBackend();
    const { roomId, hostId, alice } = await chatRoom(t);
    const voice = await sendVoice(t, roomId, alice, "hello there");
    await t.mutation(api.messages.submitProcessedMessage, {
      messageId: voice.messageId,
      processing: { translatedText: "こんにちは", romaji: "konnichiwa" },
      callerId: hostId,
    });
    expect((await t.query(api.messages.getMessageById, { messageId: voice.messageId }))?.mediaUrl).toBeTruthy();

    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t);

    expect(await fileExists(t, voice.storageId)).toBe(false);
    const message = must(await t.query(api.messages.getMessageById, { messageId: voice.messageId }), "voice message");
    expect(message.audioStorageId).toBeUndefined();
    expect(message.mediaUrl).toBeUndefined();
    expect(message).toMatchObject({
      kind: "audio",
      status: "processed",
      text: "hello there",
      durationMs: 1500,
      processing: { translatedText: "こんにちは", romaji: "konnichiwa" },
    });
  });

  test("pictures and stored drawings keep their files when the room closes", async () => {
    const t = newBackend();
    const { roomId, hostId, alice } = await chatRoom(t);
    const imageFile = await upload(t, "image/jpeg");
    const image = must(await sendImage(t, roomId, alice, imageFile), "image message");
    const drawn = await post(t, "/api/messages/send-drawing", { roomId, senderId: hostId, mediaUrl: PNG });
    await sendVoice(t, roomId, alice);
    expect(await fileCount(t)).toBe(3);

    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t);

    expect(await fileCount(t)).toBe(2);
    expect(await fileExists(t, imageFile)).toBe(true);
    expect((await t.query(api.messages.getMessageById, { messageId: image }))?.mediaUrl).toBeTruthy();
    expect((await t.query(api.messages.getMessageById, { messageId: drawn.body.messageId }))?.mediaUrl).toBeTruthy();
  });

  test("a clip that is already gone does not keep the others from being deleted", async () => {
    const t = newBackend();
    const { roomId, alice, bob } = await chatRoom(t);
    const first = await sendVoice(t, roomId, alice);
    const second = await sendVoice(t, roomId, bob, "still here");
    await t.run(async (ctx) => await ctx.storage.delete(first.storageId));

    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t);

    expect(await fileExists(t, second.storageId)).toBe(false);
    for (const voice of [first, second]) {
      const message = must(await t.query(api.messages.getMessageById, { messageId: voice.messageId }), "voice message");
      expect(message.audioStorageId).toBeUndefined();
      expect(message.mediaUrl).toBeUndefined();
    }
  });

  test("another room's clips are not touched", async () => {
    const t = newBackend();
    const closing = await chatRoom(t);
    const other = await chatRoom(t);
    await sendVoice(t, closing.roomId, closing.alice);
    const kept = await sendVoice(t, other.roomId, other.alice);

    await t.mutation(api.rooms.closeRoom, { roomId: closing.roomId });
    await runDue(t);

    expect(await fileExists(t, kept.storageId)).toBe(true);
    expect((await t.query(api.messages.getMessageById, { messageId: kept.messageId }))?.audioStorageId).toBe(kept.storageId);
  });

  test("a room closed because its host went silent loses its clips too", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const voice = await sendVoice(t, roomId, alice);

    vi.setSystemTime(T0 + 15 * MINUTE + 1);
    expect(await t.mutation(internal.rooms.closeAbandonedRooms, {})).toBe(1);
    await runDue(t);

    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.status).toBe("closed");
    expect(await fileExists(t, voice.storageId)).toBe(false);
  });

  // The audio purge reads only the messages that still have a clip: a room's inline drawings, up to 1 MiB each, are more than one transaction may read
  test("closing a room whose messages add up to more than 16 MiB still deletes its voice clips", async () => {
    const t = limitedBackend();
    const room = await roomOver16MiB(t);
    expect(await fileExists(t, room.voice.storageId)).toBe(false);
  });

  test("a room with more voice messages than one step clears loses every clip, fifty a step", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const voices = await voiceRows(t, roomId, alice, 100);
    const picture = must(await sendImage(t, roomId, alice), "image message");
    expect(await clipsLeft(t, voices)).toBe(100);

    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t);
    expect(await clipsLeft(t, voices)).toBe(50);
    expect(await pendingJobs(t, /purgeRoomAudio/)).toBe(1);

    await runDue(t);
    expect(await clipsLeft(t, voices)).toBe(0);
    // A full step cannot tell that it was the last: one more runs, finds nothing and schedules no other
    expect(await pendingJobs(t, /purgeRoomAudio/)).toBe(1);
    await runDue(t);
    expect(await pendingJobs(t, /purgeRoomAudio/)).toBe(0);

    // Only the picture's file is left, and every voice message is still there with its transcript
    expect(await fileCount(t)).toBe(1);
    expect((await t.query(api.messages.getMessageById, { messageId: picture }))?.mediaUrl).toBeTruthy();
    expect((await messagesOfKind(t, roomId, "audio")).map((m) => m.text)).toEqual(voices.map(() => "hello"));
  });

  test("voice messages that together hold more than one transaction may read are cleared inside Convex's limits", async () => {
    const t = limitedBackend();
    const { roomId, alice } = await chatRoom(t);
    // Each as large as a voice message gets: a full transcript, and the longest translation, romaji and
    // suggestions a host may submit. 130 of them are 18 MB
    const long = (chars: number) => "あ".repeat(chars);
    const voices = await voiceRows(t, roomId, alice, 130, {
      text: long(2000),
      processing: { translatedText: long(20_000), romaji: long(20_000), suggestions: Array.from({ length: 10 }, () => long(500)) },
    });

    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t, 4);

    // A step that read or wrote too much would have failed, which afterEach reports
    expect(await clipsLeft(t, voices)).toBe(0);
    expect(await fileCount(t)).toBe(0);
    expect(await pendingJobs(t, /purgeRoomAudio/)).toBe(0);
  });

  test("running it again on a closed room changes nothing", async () => {
    const t = newBackend();
    const { roomId, alice } = await chatRoom(t);
    const voice = await sendVoice(t, roomId, alice, "hello");
    await t.mutation(api.rooms.closeRoom, { roomId });
    await runDue(t);
    const before = await t.query(api.messages.getRoomMessages, { roomId });

    await t.mutation(internal.messages.purgeRoomAudio, { roomId });

    expect(await t.query(api.messages.getRoomMessages, { roomId })).toEqual(before);
    expect(await fileExists(t, voice.storageId)).toBe(false);
  });
});
