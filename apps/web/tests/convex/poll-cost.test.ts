// What one poll costs. The iOS host has no subscription: every 2 seconds HostRoomViewModel.refresh() asks
// for the whole room again, ten or eleven requests one after another, and every 1.5 seconds a loop of its
// own asks for the messages left for it to translate. Each answer is worked out and sent whole every time,
// so what a request reads and what it sends is paid again on every poll of every open room.
//
// One room is measured at three moments: idle after a long chat, after a finished game of Lost in
// Translation, and in the middle of a second game. Every request of the poll has a ceiling on the bytes of
// its answer, and the queries behind the costly ones have ceilings on what they read. A ceiling is today's
// figure: exact where it is a count (documents, index ranges) or the answer of a route with nothing to
// report, and rounded up by less than one percent where it is a size (the room's own answer by more, as
// its row says). A change that makes a poll cheaper lowers the ceilings it has earned, in the same commit.
//
// /api/rooms/snapshot answers in one request what a refresh asks for in all of its requests but the replay.
// No build calls it yet. It is measured beside them at each moment: its answer against theirs put together,
// and what it reads against what they read.
//
// The last describe is a chat long enough to meet one of the limits Convex puts on a single function.
import { convexTest } from "convex-test";
import { TransactionMetricsTracker } from "convex-test/dist/transactionMetrics.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import schema from "../../convex/schema";
import { Backend, joinGuest, modules, tokenFor } from "./setup";

type PID = Id<"participants">;
/** `players` in the order they came in: the host, then the guests. That is also the order a game deals them in */
type Room = { t: Backend; roomId: Id<"rooms">; hostId: PID; players: PID[] };

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const SECOND = 1000;
const KB = 1024;

const GUESTS = [
  { name: "Ann", avatar: "fox" },
  { name: "Bo", avatar: "cat" },
  { name: "Cy", avatar: "owl" },
];

/** A drawing of that many bytes as the data URL both apps send: base64, four characters for every three bytes */
function drawing(type: "png" | "jpeg", bytes: number): string {
  return `data:image/${type};base64,` + "A".repeat(Math.ceil(bytes / 3) * 4);
}

// Stand-ins of an assumed size, not a measured one: the host app sends its canvas as a PNG, the web page as
// a JPEG. The host's goes to the route that stores it as a file, so a poll carries its URL whatever it
// weighs. A guest's stays in the rows as it was sent, in the draw step, each guess step and the chat, and
// most of what a game costs a poll is those copies: the figures of the two game states scale with it
const HOST_DRAWING = drawing("png", 200 * KB);
const GUEST_DRAWING = drawing("jpeg", 5 * KB);

/**
 * A word bank like the one the host app sends with every Start: 40 prompts, each with a translation and
 * hints. All of one length, so that which ten the server's shuffle picks does not move a byte count.
 */
const WORD_BANK = Array.from({ length: 40 }, (_, i) => {
  const k = String(i + 1).padStart(2, "0");
  return { text: `word ${k}`, ja: `言葉${k}`, hint: `hint ${k}`, hintJa: `ヒント${k}` };
});

// One clock for the whole file, moved by hand. A describe builds its room once and then measures it in many
// tests, and a game's round watcher, due 10 s after a step opens, must never run in between
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
  // games.ts logs every step
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterAll(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/**
 * Moves the clock on without running anything scheduled. Every write of the fixture gets an instant of its
 * own this way, as writes that are seconds apart have. convex-test gives rows written at the same instant
 * creation times a thousandth of a millisecond apart, and those digits would be counted in every answer.
 */
function tick(ms = SECOND) {
  vi.setSystemTime(Date.now() + ms);
}

// ─── Ceilings on what a call reads ───────────────────────────────────────────

type Reads = {
  /** Documents the call may read */
  documentsRead: number;
  /** Index ranges it may read. A document fetched by its id counts as one */
  databaseQueries: number;
  /** Bytes of documents it may read */
  bytesRead: number;
};

/**
 * The limits the room's backend puts on one function call. Empty, they are Convex's own (16 MiB read, 32,000
 * documents, 4,096 index ranges), so the room is built and polled under the limits a deployment enforces.
 * convex-test reads this object again for each call, which is what lets `within` lower a limit for one call
 * only; the first test below fails if it ever stops doing so.
 */
const limits: Partial<Reads> = {};

function meteredBackend(): Backend {
  return convexTest({ schema, modules, transactionLimits: limits });
}

/**
 * Runs `call` with the ceilings as the backend's limits. A call that reads past one is refused, in
 * convex-test's words for the limit ("Scanned too many documents", "Too many index ranges read", "Read too
 * much data") and with the ceiling as "limit", never the amount read: to see what a call reads, lower its
 * ceiling until the call is refused.
 */
async function within<T>(ceilings: Partial<Reads>, call: () => Promise<T>): Promise<T> {
  Object.assign(limits, ceilings);
  try {
    return await call();
  } finally {
    delete limits.documentsRead;
    delete limits.databaseQueries;
    delete limits.bytesRead;
  }
}

/**
 * What `call` reads, added up over every function it runs. A ceiling holds one function call, and a route
 * that runs several queries is as many calls, so a sum is taken where convex-test does its own counting:
 * its tracker is told of every document and every index range a function reads. The second test below
 * fails if it stops being told, or counts differently from the ceilings.
 */
async function reads(call: () => Promise<unknown>): Promise<Reads> {
  const documents = vi.spyOn(TransactionMetricsTracker.prototype, "trackRead");
  const ranges = vi.spyOn(TransactionMetricsTracker.prototype, "trackIndexRange");
  try {
    await call();
    return {
      documentsRead: documents.mock.calls.length,
      databaseQueries: ranges.mock.calls.length,
      bytesRead: documents.mock.calls.reduce((sum, [bytes]) => sum + bytes, 0),
    };
  } finally {
    documents.mockRestore();
    ranges.mockRestore();
  }
}

// ─── The room ────────────────────────────────────────────────────────────────

/** The token each player registered when they came in */
function tokenOf(room: Room, participantId: PID): string {
  return tokenFor(room.players.indexOf(participantId) + 1);
}

/** POSTs JSON the way ConvexHTTPClient does, the host's id and token on every body. `bytes` is the answer as sent */
async function post(room: Room, path: string, body: Record<string, unknown>) {
  const res = await room.t.fetch(path, {
    method: "POST",
    body: JSON.stringify({ ...body, callerId: room.hostId, callerToken: tokenOf(room, room.hostId) }),
  });
  const sent = new Uint8Array(await res.arrayBuffer());
  return { status: res.status, bytes: sent.byteLength, body: JSON.parse(new TextDecoder().decode(sent)) };
}

/** A room as the two apps make one: a host who named a background, three guests, a token each, all just heard from */
async function openRoom(t: Backend): Promise<Room> {
  const created = await t.mutation(api.rooms.createRoom, {
    hostNickname: "Host",
    hostAvatarId: "bear",
    hostLanguage: "en",
    hostToken: tokenFor(1),
    background: 17,
  });
  const room: Room = { t, roomId: created.roomId, hostId: created.hostId, players: [created.hostId] };
  for (const [i, guest] of GUESTS.entries()) {
    tick();
    room.players.push(await joinGuest(t, room.roomId, guest.name, { avatar: guest.avatar, token: tokenFor(i + 2) }));
  }
  await heartbeat(room);
  return room;
}

/** What every open tab and the host app send each 15 s. A game deals in whoever was heard from in the last 3 minutes */
async function heartbeat(room: Room) {
  tick();
  for (const participantId of room.players) {
    await room.t.mutation(api.participants.setParticipantOnline, {
      participantId,
      online: true,
      presence: "online",
      token: tokenOf(room, participantId),
    });
  }
}

/** `count` text messages a second apart, from each player in turn, as they are once translated: text, translation, romaji */
async function chat(room: Room, count: number): Promise<Id<"messages">[]> {
  return await room.t.run(async (ctx) => {
    const ids: Id<"messages">[] = [];
    for (let i = 0; i < count; i++) {
      tick();
      ids.push(
        await ctx.db.insert("messages", {
          roomId: room.roomId,
          senderId: room.players[i % room.players.length],
          kind: "text",
          status: "processed",
          text: "This is a fairly ordinary chat message number " + i,
          processing: {
            translatedText: "これはごく普通のチャットメッセージです " + i,
            romaji: "kore wa goku futsuu no chatto messeeji desu " + i,
          },
          createdAt: Date.now(),
          processedAt: Date.now() + 500,
        })
      );
    }
    return ids;
  });
}

/** A 👍 from the host on `count` of the messages, spread evenly, and a ❤️ from the first guest on every other one of those */
async function react(room: Room, messages: Id<"messages">[], count: number) {
  const [host, guest] = room.players;
  for (let i = 0; i < count; i++) {
    const messageId = messages[Math.floor((i * messages.length) / count)];
    tick();
    await room.t.mutation(api.reactions.addReaction, { messageId, participantId: host, emoji: "👍", token: tokenOf(room, host) });
    if (i % 2 === 0) {
      await room.t.mutation(api.reactions.addReaction, { messageId, participantId: guest, emoji: "❤️", token: tokenOf(room, guest) });
    }
  }
}

/** Start, as the host app sends it: an individual game with a 20 s timer and the app's word bank */
async function startGame(room: Room) {
  await heartbeat(room);
  tick();
  const started = await post(room, "/api/games/start", {
    roomId: room.roomId,
    participantId: room.hostId,
    gameType: "lost-in-translation",
    level: 1,
    timerEnabled: 20,
    customPrompts: WORD_BANK,
  });
  expect(started.status).toBe(200);
}

/** A player's answer to their step. The host's goes through the route its app posts to, a guest's through the mutation the web page calls */
async function submit(
  room: Room,
  participantId: PID,
  stepId: Id<"gameSteps">,
  answer: { outputDrawingUrl: string } | { selectedOption: string }
) {
  tick(2 * SECOND);
  if (participantId === room.hostId) {
    const sent = await post(room, "/api/games/submit-step", { stepId, participantId, ...answer });
    expect(sent.status).toBe(200);
  } else {
    await room.t.mutation(api.games.submitGameStep, { stepId, participantId, token: tokenOf(room, participantId), ...answer });
  }
}

async function stepOf(room: Room, participantId: PID) {
  return await room.t.query(api.games.getMyActiveStep, { participantId, token: tokenOf(room, participantId) });
}

/** The room's newest game, as the refresh is told of it */
async function latestSession(room: Room) {
  return (await room.t.query(api.games.getLatestGameSession, { roomId: room.roomId }))!;
}

/** Whoever has the round's drawing step sends in their drawing */
async function draw(room: Room) {
  for (const participantId of room.players) {
    const step = await stepOf(room, participantId);
    if (step?.stepType !== "draw") continue;
    await submit(room, participantId, step._id, { outputDrawingUrl: participantId === room.hostId ? HOST_DRAWING : GUEST_DRAWING });
    return;
  }
  throw new Error("Nobody has a drawing step");
}

/** The other three answer in the order they came in: the first picks the right option, the other two a wrong one */
async function guess(room: Room) {
  let right = true;
  for (const participantId of room.players) {
    const step = await stepOf(room, participantId);
    if (step?.stepType !== "guess") continue;
    const prompt = await room.t.run(async (ctx) => (await ctx.db.get(step.chainId))!.originalPrompt);
    const pick = right ? prompt : step.options!.find((option) => option !== prompt)!;
    await submit(room, participantId, step._id, { selectedOption: pick });
    right = false;
  }
  if (right) throw new Error("Nobody has a guess step");
}

async function playRound(room: Room) {
  await draw(room);
  await guess(room);
}

// The three moments follow one another in a room's life, so each is made from the one before it. A describe
// makes its room from the start, on a backend of its own, up to the moment it measures: it needs no other
// describe to have run, and the three can run in any order

async function idleRoom(): Promise<Room> {
  const t = meteredBackend();
  // The backend holds another room as well, with a chat of 50 messages and 8 reactions of its own, as a
  // deployment holds many: a query that reads past its own room reads those rows too, and goes over its
  // ceilings
  const other = await openRoom(t);
  await react(other, await chat(other, 50), 5);
  // A second passes before the measured room is opened. In the same instant as the other room's last
  // reaction its row would be given a creation time with a fraction (see tick), and /api/rooms/state would
  // send those digits
  tick();
  const room = await openRoom(t);
  await react(room, await chat(room, 300), 25);
  return room;
}

async function roomAfterAGame(): Promise<Room> {
  const room = await idleRoom();
  await startGame(room);
  for (let round = 1; round <= 10; round++) await playRound(room);
  return room;
}

async function roomInASecondGame(): Promise<Room> {
  const room = await roomAfterAGame();
  await startGame(room);
  for (let round = 1; round <= 5; round++) await playRound(room);
  await draw(room);
  return room;
}

// ─── The poll ────────────────────────────────────────────────────────────────

/** The one request of a refresh that the snapshot does not stand for: the app goes on asking for it by itself */
const REPLAY = "/api/games/replay";

/**
 * The requests of one HostRoomViewModel.refresh(), in its order and on its conditions: the game's status
 * only while a game is running, the replay only once the latest game is complete. The answer to "nothing
 * here" is {"ok":true}. Gives the bytes of each answer by its path. `replay: false` leaves the replay
 * out: what is left is what a snapshot stands for.
 */
async function refresh(room: Room, options: { replay?: boolean } = {}): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  const ask = async (path: string, body: Record<string, unknown>) => {
    const answer = await post(room, path, body);
    expect({ path, status: answer.status }).toEqual({ path, status: 200 });
    sizes.set(path, answer.bytes);
    return answer.body;
  };
  const { roomId } = room;
  await ask("/api/rooms/state", { roomId });
  await ask("/api/messages/list", { roomId });
  await ask("/api/reactions/room-summaries", { roomId });
  const active = await ask("/api/games/active-session", { roomId });
  if (active._id) await ask("/api/games/status", { roomId });
  await ask("/api/games/my-active-step", { participantId: room.hostId });
  const latest = await ask("/api/games/latest-session", { roomId });
  if (latest.status === "complete" && options.replay !== false) await ask(REPLAY, { gameSessionId: latest._id });
  await ask("/api/word-rush/state", { roomId });
  await ask("/api/emoji-match/active", { roomId });
  await ask("/api/emoji-bingo/active", { roomId });
  await ask("/api/truth-or-dare/active", { roomId });
  return sizes;
}

/**
 * The request of the host's other loop, for the messages left for it to translate, held to reading nothing:
 * with nothing waiting, the two index ranges it looks in are empty however long the chat is.
 */
async function pendingPoll(room: Room) {
  return await within({ documentsRead: 0, databaseQueries: 2, bytesRead: 0 }, () =>
    post(room, "/api/messages/pending", { roomId: room.roomId })
  );
}

function total(sizes: Map<string, number>): number {
  return [...sizes.values()].reduce((sum, bytes) => sum + bytes, 0);
}

/**
 * What the snapshot's answer spends on saying which section is which: a section goes out under its name,
 * which a route's answer does not carry. 153 bytes in all, `v` and `errors` included, once the names the
 * room and Word Rush routes send of their own are taken off.
 */
const NAMES = 153;

/**
 * The snapshot, asked as the host app would ask it: for the room, and for the host's own step. `extra` is
 * how many bytes longer its answer is than the answers it stands for put together (`sizes`, less the
 * replay): NAMES, less 7 for every {"ok":true} of a route that the snapshot says as null, and 4 more for
 * the null it sends as the status when no game is running, where a refresh sends no request at all.
 */
async function snapshot(room: Room, sizes: Map<string, number>) {
  const answer = await post(room, "/api/rooms/snapshot", { roomId: room.roomId, participantId: room.hostId });
  expect(answer.status).toBe(200);
  expect(answer.body.errors).toEqual([]);
  return { ...answer, extra: answer.bytes - (total(sizes) - (sizes.get(REPLAY) ?? 0)) };
}

/** A request of the refresh and the most bytes its answer may have */
type Ceiling = [path: string, bytes: number];

describe("an idle room: four people, 300 chat messages, 38 reactions on 25 of them", () => {
  let room: Room;
  let sizes: Map<string, number>;
  beforeAll(async () => {
    room = await idleRoom();
    sizes = await refresh(room);
  });

  test("a ceiling below what a call reads refuses the call, and is gone once the call is over", async () => {
    // The room and its four participants: 5 documents in 2 index ranges
    const state = () => room.t.query(api.rooms.getRoomState, { roomId: room.roomId });
    await expect(within({ documentsRead: 4 }, state)).rejects.toThrow(/Scanned too many documents .*limit: 4\b/);
    await expect(within({ databaseQueries: 1 }, state)).rejects.toThrow(/Too many index ranges read .*limit: 1\b/);
    await expect(within({ bytesRead: 100 }, state)).rejects.toThrow(/Read too much data .*limit: 100 bytes/);
    expect((await within({ documentsRead: 5, databaseQueries: 2 }, state))?.participants).toHaveLength(4);
    expect(limits).toEqual({});
    expect((await state())?.participants).toHaveLength(4);
  });

  test("what a call reads is counted as its ceilings count it", async () => {
    const state = () => room.t.query(api.rooms.getRoomState, { roomId: room.roomId });
    const read = await reads(state);
    expect(read).toMatchObject({ documentsRead: 5, databaseQueries: 2 });
    // To the byte: the call stays within what was counted, and not within one byte less
    expect((await within(read, state))?.participants).toHaveLength(4);
    await expect(within({ bytesRead: read.bytesRead - 1 }, state)).rejects.toThrow(/Read too much data/);
  });

  const REFRESH: Ceiling[] = [
    // The room and its four participants. Rounded up further than the others: the room document goes out
    // whole, and one more setting on it is not a poll grown heavy
    ["/api/rooms/state", 1_800],
    // All 303 messages whole (the chat and three join lines), each with its translation and romaji
    ["/api/messages/list", 141_000],
    // The 25 messages that have reactions, with who gave each
    ["/api/reactions/room-summaries", 4_700],
    // No game of any kind: each of the rest answers {"ok":true}, Word Rush {"game":null}
    ["/api/games/active-session", 11],
    ["/api/games/my-active-step", 11],
    ["/api/games/latest-session", 11],
    ["/api/word-rush/state", 13],
    ["/api/emoji-match/active", 11],
    ["/api/emoji-bingo/active", 11],
    ["/api/truth-or-dare/active", 11],
  ];

  test.each(REFRESH)("%s answers in at most %i bytes", (path, ceiling) => {
    expect(sizes.get(path)).toBeLessThanOrEqual(ceiling);
  });

  test("one refresh is those ten requests, and at most 147,000 bytes in all", () => {
    expect([...sizes.keys()]).toEqual(REFRESH.map(([path]) => path));
    // What an idle room sends its host every 2 seconds
    expect(total(sizes)).toBeLessThanOrEqual(147_000);
  });

  test("the snapshot is those ten answers in one, at most 147,000 bytes", async () => {
    const answer = await snapshot(room, sizes);
    expect(answer.bytes).toBeLessThanOrEqual(147_000);
    // The names, the status as null, and null for six of the seven answers with nothing to report
    expect(answer.extra).toBe(NAMES + 4 - 6 * 7);
  });

  test("the snapshot reads what the ten requests read between them", async () => {
    const apart = await reads(() => refresh(room));
    const together = await reads(() => snapshot(room, sizes));
    // The same queries, each run once
    expect(together).toEqual(apart);
    // Nearly all of it is the chat read twice: for the messages, and again to look for each one's reactions
    expect(together).toMatchObject({ documentsRead: 650, databaseQueries: 323 });
    expect(together.bytesRead).toBeLessThanOrEqual(262_000);
  });

  test("the pending loop's request answers [] and reads no message", async () => {
    expect(await pendingPoll(room)).toEqual({ status: 200, bytes: 2, body: [] });
  });

  test("the reaction summaries are read within their ceilings", async () => {
    const summaries = await within(
      {
        // Every message of the room and the 38 reactions
        documentsRead: 341,
        // One for the messages, then one for each message's reactions
        databaseQueries: 304,
        // The 303 messages whole, to answer with 4.7 KB about 25 of them
        bytesRead: 134_000,
      },
      () => room.t.query(api.reactions.getRoomReactionSummaries, { roomId: room.roomId })
    );
    expect(summaries).toHaveLength(25);
    expect(summaries.flatMap((summary) => summary.reactions).reduce((sum, reaction) => sum + reaction.count, 0)).toBe(38);
  });

  test("the message list is read within its ceilings", async () => {
    const messages = await within(
      {
        // Each message once
        documentsRead: 303,
        // All of them from one index range
        databaseQueries: 1,
        // What 303 text messages hold
        bytesRead: 127_000,
      },
      () => room.t.query(api.messages.getRoomMessages, { roomId: room.roomId })
    );
    expect(messages).toHaveLength(303);
  });
});

describe("the same room after a finished game of Lost in Translation", () => {
  let room: Room;
  let sizes: Map<string, number>;
  beforeAll(async () => {
    room = await roomAfterAGame();
    sizes = await refresh(room);
  });

  // Rows without a comment are as in the idle room
  const REFRESH: Ceiling[] = [
    ["/api/rooms/state", 1_800],
    // 315 messages: the game put its start line, its ten drawings and its summary in the chat. The host's
    // three drawings are the URLs of their files, the guests' seven are data URLs
    ["/api/messages/list", 195_000],
    ["/api/reactions/room-summaries", 4_700],
    ["/api/games/active-session", 11],
    ["/api/games/my-active-step", 11],
    // The finished session, which carries the 40 prompts of its word bank
    ["/api/games/latest-session", 3_520],
    // The ten rounds with all four steps of each. A round's drawing goes out once, on its draw step, as
    // the URL of its file or as the data URL it is kept as: the three guess steps are sent without the
    // copy each of them stores
    ["/api/games/replay", 73_000],
    ["/api/word-rush/state", 13],
    ["/api/emoji-match/active", 11],
    ["/api/emoji-bingo/active", 11],
    ["/api/truth-or-dare/active", 11],
  ];

  test.each(REFRESH)("%s answers in at most %i bytes", (path, ceiling) => {
    expect(sizes.get(path)).toBeLessThanOrEqual(ceiling);
  });

  test("one refresh is those eleven requests, and at most 278,000 bytes in all", () => {
    expect([...sizes.keys()]).toEqual(REFRESH.map(([path]) => path));
    // Sent every 2 seconds for as long as the finished game is the room's latest
    expect(total(sizes)).toBeLessThanOrEqual(278_000);
  });

  test("the snapshot is those answers in one but for the replay, at most 205,000 bytes", async () => {
    const answer = await snapshot(room, sizes);
    // The chat with the game's ten drawings in it. The replay is not part of a snapshot
    expect(answer.bytes).toBeLessThanOrEqual(205_000);
    // As in the idle room, but the latest session is there to send
    expect(answer.extra).toBe(NAMES + 4 - 5 * 7);
  });

  test("the snapshot reads what the ten requests it stands for read between them", async () => {
    const apart = await reads(() => refresh(room, { replay: false }));
    const together = await reads(() => snapshot(room, sizes));
    expect(together).toEqual(apart);
    expect(together).toMatchObject({ documentsRead: 675, databaseQueries: 335 });
    // The chat twice over, with the guests' seven drawings in it: for the messages, and again on the way
    // to the reactions
    expect(together.bytesRead).toBeLessThanOrEqual(372_000);
  });

  test("the pending loop's request answers [] and reads no message", async () => {
    expect(await pendingPoll(room)).toEqual({ status: 200, bytes: 2, body: [] });
  });

  test("the replay is read within its ceilings", async () => {
    const session = await latestSession(room);
    const replay = await within(
      {
        // The session, its 10 rounds, their 40 steps and the 4 players
        documentsRead: 55,
        // The session, the rounds, the steps, and each player by id
        databaseQueries: 7,
        // Each of the guests' seven drawings four times over, as the steps hold it, to answer with it once.
        // The host's three are files: their steps hold a URL
        bytesRead: 216_000,
      },
      () => room.t.query(api.games.getGameReplay, { gameSessionId: session._id })
    );
    expect(replay?.session.status).toBe("complete");
    expect(replay?.chains.map((chain) => chain.steps.length)).toEqual(Array(10).fill(4));
  });

  test("the message list is read within its ceilings", async () => {
    const messages = await within(
      {
        // Each message once
        documentsRead: 315,
        // All of them from one index range
        databaseQueries: 1,
        // The chat as before, the guests' seven drawings and the URLs of the host's three
        bytesRead: 180_000,
      },
      () => room.t.query(api.messages.getRoomMessages, { roomId: room.roomId })
    );
    const drawings = messages.filter((message) => message.kind === "drawing");
    expect(drawings.map((message) => message.mediaUrl?.startsWith("https://"))).toEqual(
      // The host drew rounds 1, 5 and 9
      [true, false, false, false, true, false, false, false, true, false]
    );
  });

  test("the reaction summaries are read within their ceilings", async () => {
    const summaries = await within(
      {
        // Every message of the room and the 38 reactions
        documentsRead: 353,
        // One for the messages, then one for each message's reactions
        databaseQueries: 316,
        // The guests' seven drawings with the rest, to answer with the same 4.7 KB as before the game
        bytesRead: 187_000,
      },
      () => room.t.query(api.reactions.getRoomReactionSummaries, { roomId: room.roomId })
    );
    expect(summaries).toHaveLength(25);
  });
});

describe("the same room in a second game, the sixth round drawn and waiting for its guesses", () => {
  let room: Room;
  let sizes: Map<string, number>;
  beforeAll(async () => {
    room = await roomInASecondGame();
    sizes = await refresh(room);
  });

  // Rows without a comment are as in the idle room
  const REFRESH: Ceiling[] = [
    ["/api/rooms/state", 1_800],
    // 322 messages: the first game's ten drawings and six of the second's, eleven of them a guest's
    ["/api/messages/list", 224_000],
    ["/api/reactions/room-summaries", 4_700],
    // The running session with its word bank. A refresh is sent it twice, as the active session and as the latest
    ["/api/games/active-session", 3_490],
    // Round, phase, drawer and the four players' scores
    ["/api/games/status", 725],
    // The host's guess step, with the guest's drawing it is to guess at
    ["/api/games/my-active-step", 7_350],
    ["/api/games/latest-session", 3_490],
    ["/api/word-rush/state", 13],
    ["/api/emoji-match/active", 11],
    ["/api/emoji-bingo/active", 11],
    ["/api/truth-or-dare/active", 11],
  ];

  test.each(REFRESH)("%s answers in at most %i bytes", (path, ceiling) => {
    expect(sizes.get(path)).toBeLessThanOrEqual(ceiling);
  });

  test("one refresh is those eleven requests, and at most 246,000 bytes in all", () => {
    expect([...sizes.keys()]).toEqual(REFRESH.map(([path]) => path));
    // Sent every 2 seconds while the game is played
    expect(total(sizes)).toBeLessThanOrEqual(246_000);
  });

  test("the snapshot is those eleven answers in one, at most 246,000 bytes", async () => {
    const answer = await snapshot(room, sizes);
    expect(answer.bytes).toBeLessThanOrEqual(246_000);
    // The names, and null for the three games that are not being played
    expect(answer.extra).toBe(NAMES - 3 * 7);
  });

  test("the snapshot reads what the eleven requests read between them", async () => {
    const apart = await reads(() => refresh(room));
    const together = await reads(() => snapshot(room, sizes));
    expect(together).toEqual(apart);
    expect(together).toMatchObject({ documentsRead: 757, databaseQueries: 352 });
    // The chat with its sixteen drawings twice over, and every step of the running game twice as well: for
    // the host's step, and again for the status. Only a guest's drawing is in those rows
    expect(together.bytesRead).toBeLessThanOrEqual(685_000);
  });

  test("the pending loop's request answers [] and reads no message", async () => {
    expect(await pendingPoll(room)).toEqual({ status: 200, bytes: 2, body: [] });
  });

  test("the host's step is read within its ceilings", async () => {
    const step = await within(
      {
        // The host, the session, all 24 steps the game has so far, and the round
        documentsRead: 27,
        // One for each of those four
        databaseQueries: 4,
        // The four drawings by guests four times over, to answer with one step. The host's two are files
        bytesRead: 123_000,
      },
      () => stepOf(room, room.hostId)
    );
    expect(step).toMatchObject({ stepType: "guess", round: 6, inputDrawingUrl: GUEST_DRAWING });
  });

  test("the game's status is read within its ceilings", async () => {
    const status = await within(
      {
        // The session, its 10 rounds, the 24 steps, the drawer and the 4 players
        documentsRead: 40,
        // The session, the rounds, the steps, and five participants by id
        databaseQueries: 8,
        // Those drawings again, to answer with 0.7 KB that holds none
        bytesRead: 127_000,
      },
      () => room.t.query(api.games.getGameStatus, { roomId: room.roomId })
    );
    expect(status).toMatchObject({ currentRound: 6, phase: "guessing", guessesSubmitted: 0, guessesTotal: 3 });
  });
});

// The chat of this describe grows from one part to the next, so its parts run in the order they are written
// in, even when the run is shuffled
describe("a long chat, on a backend with Convex's own limits", { shuffle: false }, () => {
  let room: Room;
  beforeAll(async () => {
    room = await openRoom(convexTest({ schema, modules, transactionLimits: true }));
    await chat(room, 4_000);
  });

  /** One of the three requests every refresh starts with, as the room's host is answered */
  async function ask(path: string) {
    return await post(room, path, { roomId: room.roomId });
  }

  /** The snapshot, asked as the host app would ask it */
  async function askSnapshot() {
    return await post(room, "/api/rooms/snapshot", { roomId: room.roomId, participantId: room.hostId });
  }

  test("at 4,000 chat messages the room, its messages and its reaction summaries are answered", async () => {
    expect((await ask("/api/rooms/state")).status).toBe(200);
    expect((await ask("/api/messages/list")).status).toBe(200);
    expect((await ask("/api/reactions/room-summaries")).status).toBe(200);
    // And the snapshot, whole
    expect(await askSnapshot()).toMatchObject({ status: 200, body: { messages: { length: 4_003 }, reactions: [], errors: [] } });
  });

  describe("at 4,100 chat messages", () => {
    beforeAll(async () => {
      await chat(room, 100);
    });

    test("the room and its messages are answered", async () => {
      expect((await ask("/api/rooms/state")).status).toBe(200);
      // The chat and the three join lines
      expect(await ask("/api/messages/list")).toMatchObject({ status: 200, body: { length: 4_103 } });
    });

    // DEFECT: a chat that grows long enough takes the host's screen down with it. getRoomReactionSummaries
    // reads the room's messages and then one index range of reactions for each of them (reactions.ts), and
    // Convex allows one function 4,096 ranges. From the room's 4,096th message on the query is refused, with
    // or without a single reaction in the room, and /api/reactions/room-summaries answers 400. The host app
    // asks for the room, the messages and these summaries at the start of every refresh and shows none of
    // them when one fails (HostRoomViewModel.refresh), so from then on its screen stops following the room:
    // no new message appears, and no game. Guests are not affected: the web page asks for each message's
    // reactions on their own.
    // The assertion holds for any fix that still answers the route: for one, the room's reactions read
    // through an index of their own.
    test.fails("the reaction summaries are answered", async () => {
      expect((await ask("/api/reactions/room-summaries")).status).toBe(200);
    });

    // The snapshot runs the same query and is refused the same summaries, but it does not let them take the
    // room with them: the request is answered, with the summaries left out and named, so a host app that
    // refreshes from it goes on following the room and only its reactions stand still. The limit is not a
    // failure worth repeating, which would be a 503 for the whole request: asked again, it is met again.
    test("the snapshot is answered with the room and its messages, and names the reaction summaries as refused", async () => {
      const answer = await askSnapshot();
      expect(answer.status).toBe(200);
      expect(answer.body.errors).toEqual(["reactions"]);
      expect(answer.body).not.toHaveProperty("reactions");
      expect(answer.body.room._id).toBe(room.roomId);
      expect(answer.body.participants).toHaveLength(4);
      expect(answer.body.messages).toHaveLength(4_103);
    });
  });
});
