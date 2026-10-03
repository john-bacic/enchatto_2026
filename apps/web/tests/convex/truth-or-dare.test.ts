import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import schema from "../../convex/schema";
import * as truthOrDareModule from "../../convex/truthOrDare";
import { Backend, createRoom, joinGuest, modules, newBackend, tokenFor } from "./setup";

const tod = api.truthOrDare;

type RoomId = Id<"rooms">;
type PlayerId = Id<"participants">;
type GameId = Id<"truthOrDareGames">;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const GUESTS = [
  { nickname: "Aiko", avatar: "fox" },
  { nickname: "Ben", avatar: "owl" },
  { nickname: "Chie", avatar: "cat" },
];

/** A room with its host and some web guests. With `tokens`, each registers a caller token: the host tokenFor(1), guest n tokenFor(n + 2) */
async function seatRoom(t: Backend, options: { guests?: number; tokens?: boolean } = {}) {
  const hostToken = options.tokens ? tokenFor(1) : undefined;
  const { roomId, hostId } = await createRoom(t, { hostToken });
  const guests: PlayerId[] = [];
  const guestTokens: (string | undefined)[] = [];
  for (let i = 0; i < (options.guests ?? 1); i++) {
    const token = options.tokens ? tokenFor(i + 2) : undefined;
    guests.push(await joinGuest(t, roomId, GUESTS[i].nickname, { avatar: GUESTS[i].avatar, token }));
    guestTokens.push(token);
  }
  return { roomId, hostId, guests, hostToken, guestTokens };
}

/**
 * A room with a game running. createGame shuffles the seats with Math.random; pinned at 0 for that one
 * call, the shuffle seats the guests in the order they joined and the host last, so `seats` is
 * [...guests, host] and the first turn belongs to the first guest.
 */
async function startGame(
  t: Backend,
  options: { guests?: number; tokens?: boolean; promptMode?: "normal" | "deep" | "spicy"; startedBy?: "host" | "guest" } = {}
) {
  const room = await seatRoom(t, options);
  const byGuest = options.startedBy === "guest";
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  const gameId: GameId = await t.mutation(tod.createGame, {
    roomId: room.roomId,
    hostParticipantId: byGuest ? room.guests[0] : room.hostId,
    promptMode: options.promptMode,
    token: byGuest ? room.guestTokens[0] : room.hostToken,
  });
  random.mockRestore();
  const seats = (await view(t, room.roomId)).playerOrder;
  expect(seats).toEqual([...room.guests, room.hostId]);
  return { ...room, gameId, seats };
}

/**
 * A backend that also enforces Convex's limits on one transaction (16 MiB read, 32,000 documents scanned
 * and so on), which newBackend() leaves off: a function that goes past them fails here as it would deployed
 */
function limitedBackend(): Backend {
  return convexTest({ schema, modules, transactionLimits: true });
}

/** What every client renders the game from */
async function view(t: Backend, roomId: RoomId) {
  const game = await t.query(tod.getActiveTruthOrDare, { roomId });
  if (!game) throw new Error("The room has no Truth or Dare game");
  return game;
}
type GameView = Awaited<ReturnType<typeof view>>;

/**
 * Real requests never share a millisecond, and getActiveTruthOrDare tells two turns dealt at one seat
 * apart by createdAt, so the frozen clock moves a little before every call a helper makes.
 */
function tick() {
  vi.advanceTimersByTime(5);
}

async function choose(t: Backend, gameId: GameId, participantId: PlayerId, choice: "truth" | "dare" = "truth") {
  tick();
  await t.mutation(tod.submitChoice, { gameId, participantId, choice });
}

async function answer(t: Backend, gameId: GameId, participantId: PlayerId, responseText = "an answer") {
  tick();
  return await t.mutation(tod.submitResponse, { gameId, participantId, responseText });
}

async function advance(t: Backend, gameId: GameId, participantId: PlayerId) {
  tick();
  await t.mutation(tod.advanceTurn, { gameId, participantId });
}

/** Whole turns: the holder chooses and answers, then the host deals the next seat */
async function playTurns(t: Backend, g: { roomId: RoomId; gameId: GameId; hostId: PlayerId }, count: number) {
  for (let i = 0; i < count; i++) {
    const holder = (await view(t, g.roomId)).currentTurnParticipantId!;
    await choose(t, g.gameId, holder);
    await answer(t, g.gameId, holder, `answer ${i + 1}`);
    await advance(t, g.gameId, g.hostId);
  }
}

/** The condition both clients cover the game with the round break on (truth-or-dare-game.tsx, TruthOrDareGameView.swift) */
function showsRoundBreak(game: GameView) {
  return (
    game.completedTurns > 0 &&
    game.completedTurns % 10 === 0 &&
    game.currentTurn?.status === "waiting_for_choice" &&
    game.roundBreakAckedTurns !== game.completedTurns
  );
}

async function heartbeat(t: Backend, participantId: PlayerId, presence: "online" | "away" = "online") {
  await t.mutation(api.participants.setParticipantOnline, { participantId, online: true, presence });
}

/** The 15 s to the absence check's next look, with a heartbeat first from everyone who is meant to be there */
async function nextLook(t: Backend, present: PlayerId[]) {
  for (const participantId of present) await heartbeat(t, participantId);
  vi.advanceTimersByTime(15_000);
  await t.finishInProgressScheduledFunctions();
}

async function post(t: Backend, path: string, body: unknown, headers?: Record<string, string>) {
  const res = await t.fetch(path, { method: "POST", body: JSON.stringify(body), headers });
  const text = await res.text();
  return { status: res.status, text, json: JSON.parse(text), headers: res.headers };
}

async function turnRows(t: Backend, gameId: GameId) {
  return await t.run(async (ctx) =>
    await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect()
  );
}

async function storedFiles(t: Backend) {
  return await t.run(async (ctx) => await ctx.db.system.query("_storage").collect());
}

/** What storage holds for a file: the URL it hands out and the bytes */
async function storedFile(t: Backend, storageId: Id<"_storage">) {
  return await t.run(async (ctx) => {
    const blob = await ctx.storage.get(storageId);
    return {
      url: await ctx.storage.getUrl(storageId),
      bytes: blob ? Array.from(new Uint8Array(await blob.arrayBuffer())) : null,
    };
  });
}

/**
 * Records the type and size of every Blob made while it is in place. The route gives storage a Blob, and a
 * deployment keeps that Blob's type as the file's contentType, which submitResponse then checks. convex-test
 * keeps no type at all, so this is the only place a wrong one can be seen. afterEach puts the real Blob back.
 */
function recordBlobs() {
  const made: { type: string; size: number }[] = [];
  const RealBlob = globalThis.Blob;
  vi.stubGlobal(
    "Blob",
    class extends RealBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        made.push({ type: this.type, size: this.size });
      }
    }
  );
  return made;
}

/** The game summaries the room's chat shows, parsed */
async function summaries(t: Backend, roomId: RoomId) {
  const messages = await t.query(api.messages.getRoomMessages, { roomId });
  const prefix = "truth_or_dare_summary:";
  return messages
    .filter((m) => m.kind === "system" && m.text?.startsWith(prefix))
    .map((m) => ({ senderId: m.senderId, ...JSON.parse(m.text!.slice(prefix.length)) }));
}

// Tiny but valid base64; the server checks the declared type and the encoding, not the pixels
const PNG = "data:image/png;base64,iVBORw0KGgo=";
const JPEG = "data:image/jpeg;base64,/9j/4AAQ";
// The same two images, decoded: the PNG signature and the first bytes of a JPEG
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
const DRAWING_ROUTE = "/api/truth-or-dare/submit-response";
const EIGHT_MB = 8 * 1024 * 1024;

// ─── Starting a game ─────────────────────────────────────────────────────────

describe("createGame", () => {
  test("deals in everyone in the room and opens the first seat's turn", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t, { guests: 2 });

    const gameId = await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    const game = await view(t, roomId);
    expect(game._id).toBe(gameId);
    expect(game.status).toBe("active");
    expect(game.hostParticipantId).toBe(hostId);
    expect(game.promptMode).toBe("normal");
    expect([...game.playerOrder].sort()).toEqual([hostId, ...guests].sort());
    expect(game.currentTurnIndex).toBe(0);
    expect(game.currentTurnParticipantId).toBe(game.playerOrder[0]);
    expect(game.currentTurn).toMatchObject({
      participantId: game.playerOrder[0],
      turnIndex: 0,
      status: "waiting_for_choice",
    });
    expect(game.totalTurns).toBe(1);
    expect(game.completedTurns).toBe(0);
    expect(game.playerInfo.map((p) => p.participantId)).toEqual(game.playerOrder);
    expect(game.playerInfo.map((p) => p.nickname).sort()).toEqual(["Aiko", "Ben", "Host"]);
  });

  // Review: "A double tap creates several active Truth or Dare games in one room" (fixed in ccda84d)
  test("a second create while a game is active returns that game and starts nothing", async () => {
    const t = newBackend();
    const { roomId, hostId, guests, gameId } = await startGame(t);

    const doubleTap = await post(t, "/api/truth-or-dare/create", { roomId, hostParticipantId: hostId });
    const fromGuest = await t.mutation(tod.createGame, { roomId, hostParticipantId: guests[0], promptMode: "deep" });

    expect(doubleTap.json).toEqual({ gameId });
    expect(fromGuest).toBe(gameId);
    const games = await t.run(async (ctx) =>
      await ctx.db
        .query("truthOrDareGames")
        .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
        .collect()
    );
    expect(games).toHaveLength(1);
    const game = await view(t, roomId);
    expect(game.totalTurns).toBe(1);
    expect(game.promptMode).toBe("normal");
    expect(game.hostParticipantId).toBe(hostId);
  });

  test("once a game has ended a new one can be started, and the room's start message is posted only once", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    await t.mutation(tod.endGame, { gameId, participantId: hostId });
    tick();

    const second = await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect(second).not.toBe(gameId);
    const game = await view(t, roomId);
    expect(game._id).toBe(second);
    expect(game.status).toBe("active");
    const messages = await t.query(api.messages.getRoomMessages, { roomId });
    expect(messages.filter((m) => m.text === "game:Truth or Dare")).toHaveLength(1);
  });

  test("a closed room cannot start a game", async () => {
    const t = newBackend();
    const { roomId, hostId } = await seatRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });

    await expect(t.mutation(tod.createGame, { roomId, hostParticipantId: hostId })).rejects.toThrow(/Room is closed/);
    expect(await t.query(tod.getActiveTruthOrDare, { roomId })).toBeNull();
  });

  test("two players are needed, and a guest who went offline is not one of them", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t);
    await t.mutation(api.participants.setParticipantOnline, { participantId: guests[0], online: false });

    await expect(t.mutation(tod.createGame, { roomId, hostParticipantId: hostId })).rejects.toThrow(/at least 2 players/);
    expect(await t.query(tod.getActiveTruthOrDare, { roomId })).toBeNull();
  });

  // Review bug 2: the leave beacon's `departed` flag was never cleared, so a guest who reloaded was
  // left out and the host's Start failed with "Need at least 2 players" (fixed in ccda84d)
  test("a guest who reloaded the page, leave beacon then heartbeat, is dealt in", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t);
    await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
    await heartbeat(t, guests[0]);

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, guests[0]].sort());
  });

  test("a guest who closed the tab, its leave beacon followed by the closing tab's away ping, gets no seat", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t, { guests: 2 });
    await t.mutation(api.participants.leaveRoom, { participantId: guests[1] });
    await heartbeat(t, guests[1], "away");

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, guests[0]].sort());
  });

  // Review bug 6: "Games deal in guests who are gone" (fixed in 17f6267)
  test("a guest not heard from for over three minutes gets no seat while two others are around", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t, { guests: 2 });
    vi.advanceTimersByTime(4 * 60_000);
    await heartbeat(t, hostId);
    await heartbeat(t, guests[0]);

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, guests[0]].sort());
  });

  test("a guest whose tab is in the background but was heard from lately still gets a seat: nobody can join later", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t, { guests: 2 });
    await heartbeat(t, guests[0], "away");

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, ...guests].sort());
  });

  test("whoever starts the game gets a seat even when their own heartbeat is stale", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t, { guests: 2 });
    vi.advanceTimersByTime(4 * 60_000);
    await heartbeat(t, guests[0]);
    await heartbeat(t, guests[1]);

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, ...guests].sort());
  });

  test("with fewer than two people around, a guest still marked online is dealt in so Start does something", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t);
    vi.advanceTimersByTime(4 * 60_000);
    await heartbeat(t, hostId);

    await t.mutation(tod.createGame, { roomId, hostParticipantId: hostId });

    expect([...(await view(t, roomId)).playerOrder].sort()).toEqual([hostId, guests[0]].sort());
  });

  test("that fallback does not deal in a guest who closed the tab: with nobody else, Start is refused", async () => {
    const t = newBackend();
    const { roomId, hostId, guests } = await seatRoom(t);
    await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
    // The closing tab's away ping marks them online again, but they stay departed
    await heartbeat(t, guests[0], "away");

    await expect(t.mutation(tod.createGame, { roomId, hostParticipantId: hostId })).rejects.toThrow(/at least 2 players/);
    expect(await t.query(tod.getActiveTruthOrDare, { roomId })).toBeNull();
  });

  /** A room whose chat holds drawings of a million characters each, the way Lost in Translation leaves them there */
  async function roomWithDrawingsInItsChat(t: Backend, drawings: number) {
    const room = await seatRoom(t);
    const drawing = `data:image/png;base64,${"A".repeat(1_000_000)}`;
    // Three to a transaction: one that wrote them all would itself be over the limit
    for (let written = 0; written < drawings; written += 3) {
      await t.run(async (ctx) => {
        for (let i = written; i < Math.min(written + 3, drawings); i++) {
          await ctx.db.insert("messages", {
            roomId: room.roomId,
            senderId: room.guests[0],
            kind: "drawing",
            status: "processed",
            mediaUrl: drawing,
            createdAt: Date.now(),
          });
        }
      });
    }
    return room;
  }

  // DEFECT: createGame (truthOrDare.ts:394) reads every message of the room with one collect(), only to
  // see whether "game:Truth or Dare" was posted before. Every Lost in Translation draw step posts its
  // drawing into the chat inline (games.ts:510, up to 1 MiB each), so a room that has played for a while
  // holds more than the 16 MiB one transaction may read. createGame then throws "Read too much data in a
  // single function execution": the route answers 400, neither app shows anything, and Start does nothing
  // for as long as the room lives. Today that room has a bigger fault first: messages.getRoomMessages,
  // which both apps load the chat with, reads the history the same way and fails with it, so this is what
  // stays broken once the chat is fixed. The review doc has this read under Performance for Emoji Bingo
  // and Emoji Match ("Game start and summary mutations read the room's whole message history to find one
  // system message"), not for Truth or Dare. postSummary (truthOrDare.ts:855), which no client calls,
  // reads the same way. Correct: whether a game was started here before is answered without the chat,
  // for instance from the room's truthOrDareGames rows.
  test.fails("a game can be started in a room whose chat holds more than 16 MiB", async () => {
    const t = limitedBackend();
    // A test.fails test passes when anything in it throws. A set-up that broke must not pass for the
    // defect: it is logged, the test returns without failing, and vitest reports a defect test that did not fail
    const room = await roomWithDrawingsInItsChat(t, 18).catch((error) => {
      console.error("The set-up of a defect test failed, so the test proves nothing:", error);
      return undefined;
    });
    if (!room) return;

    const res = await post(t, "/api/truth-or-dare/create", { roomId: room.roomId, hostParticipantId: room.hostId });

    expect(res.json).toEqual({ gameId: expect.any(String) });
    expect(res.status).toBe(200);
    expect((await view(t, room.roomId)).status).toBe("active");
  });

  // The control for the defect above: three drawings fewer and the same room starts a game, and nothing
  // else a game does comes near the limit
  test("with a deployment's limits on, a game is started, played and ended in a room whose chat holds 15 MB", async () => {
    const t = limitedBackend();
    const room = await roomWithDrawingsInItsChat(t, 15);

    const created = await post(t, "/api/truth-or-dare/create", { roomId: room.roomId, hostParticipantId: room.hostId });
    expect(created.json).toEqual({ gameId: expect.any(String) });
    const g = { roomId: room.roomId, gameId: created.json.gameId as GameId, hostId: room.hostId };
    await playTurns(t, g, 2);
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: room.hostId });

    const game = await view(t, room.roomId);
    expect(game.status).toBe("completed");
    expect(game.completedTurns).toBe(2);
  });
});

// ─── Truth or dare ───────────────────────────────────────────────────────────

describe("submitChoice", () => {
  test("the turn holder's choice deals a prompt of that kind in both languages and waits for the answer", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);

    await choose(t, gameId, seats[0], "dare");

    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.status).toBe("waiting_for_response");
    expect(turn.choice).toBe("dare");
    expect(turn.promptId).toMatch(/^n_d_\d{3}$/);
    expect(["text", "drawing"]).toContain(turn.promptResponseType);
    const prompt = JSON.parse(turn.promptText!);
    expect(prompt.en).toEqual(expect.any(String));
    expect(prompt.ja).toEqual(expect.any(String));
    expect(prompt.en.length).toBeGreaterThan(0);
    expect(prompt.ja.length).toBeGreaterThan(0);
  });

  test("nobody can choose for the player whose turn it is", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, seats } = await startGame(t);
    expect(seats[0]).not.toBe(hostId);

    await expect(t.mutation(tod.submitChoice, { gameId, participantId: hostId, choice: "truth" })).rejects.toThrow(/Not your turn/);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_choice");
  });

  test("a second choice does not replace the prompt already dealt", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "truth");
    const dealt = (await view(t, roomId)).currentTurn!;

    await choose(t, gameId, seats[0], "dare");

    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.choice).toBe("truth");
    expect(turn.promptId).toBe(dealt.promptId);
    expect(turn.promptText).toBe(dealt.promptText);
  });

  test.each(["deep", "spicy"] as const)("a %s game deals from the deep prompts", async (promptMode) => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t, { promptMode });

    await choose(t, gameId, seats[0], "truth");

    expect((await view(t, roomId)).currentTurn?.promptId).toMatch(/^d_t_\d{3}$/);
  });

  test("a prompt already used in the game is not dealt again, not even after a skip", async () => {
    const t = newBackend();
    const g = await startGame(t);
    // Every pick would land on the same prompt if used ones were not left out
    vi.spyOn(Math, "random").mockReturnValue(0);
    const dealt: string[] = [];

    await choose(t, g.gameId, g.seats[0], "truth");
    dealt.push((await view(t, g.roomId)).currentTurn!.promptId!);
    tick();
    await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.seats[0] });
    await choose(t, g.gameId, g.seats[0], "truth");
    dealt.push((await view(t, g.roomId)).currentTurn!.promptId!);
    await answer(t, g.gameId, g.seats[0]);
    await advance(t, g.gameId, g.hostId);
    await choose(t, g.gameId, g.seats[1], "truth");
    dealt.push((await view(t, g.roomId)).currentTurn!.promptId!);

    expect(new Set(dealt).size).toBe(3);
  });

  test("once every prompt of a kind has been used, a long game deals them again instead of failing", async () => {
    const t = newBackend();
    const g = await startGame(t, { promptMode: "deep" });
    const DEEP_DARES = 40;
    const dealt: string[] = [];

    // A skip keeps its prompt on the skipped turn, so it stays used: one more choice than there are prompts
    for (let i = 0; i <= DEEP_DARES; i++) {
      await choose(t, g.gameId, g.seats[0], "dare");
      dealt.push((await view(t, g.roomId)).currentTurn!.promptId!);
      tick();
      await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.seats[0] });
    }

    expect(new Set(dealt.slice(0, DEEP_DARES)).size).toBe(DEEP_DARES);
    expect(dealt.slice(0, DEEP_DARES)).toContain(dealt[DEEP_DARES]);
    expect(dealt.every((id) => /^d_d_\d{3}$/.test(id))).toBe(true);
  });
});

// ─── Answering ───────────────────────────────────────────────────────────────

describe("submitResponse", () => {
  test("a text answer completes the turn and is listed with its prompt", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "truth");

    const taken = await answer(t, gameId, seats[0], "ramen");

    expect(taken).toBe(true);
    const game = await view(t, roomId);
    expect(game.currentTurn).toMatchObject({ status: "completed", responseText: "ramen" });
    expect(game.currentTurn?.completedAt).toBe(Date.now());
    expect(game.completedTurns).toBe(1);
    expect(game.completedTurnsList).toHaveLength(1);
    expect(game.completedTurnsList[0]).toMatchObject({
      participantId: seats[0],
      choice: "truth",
      promptText: game.currentTurn?.promptText,
      responseText: "ramen",
      ratings: [],
    });
  });

  test("an answer sent before the player has chosen is not taken", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);

    const taken = await answer(t, gameId, seats[0], "too early");

    expect(taken).toBe(false);
    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.status).toBe("waiting_for_choice");
    expect(turn.responseText).toBeUndefined();
  });

  test("a second answer is not taken and the first one stays", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);
    await answer(t, gameId, seats[0], "first");

    const taken = await answer(t, gameId, seats[0], "second");

    expect(taken).toBe(false);
    const game = await view(t, roomId);
    expect(game.currentTurn?.responseText).toBe("first");
    expect(game.completedTurns).toBe(1);
  });

  test("nobody can answer for the player whose turn it is", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);

    await expect(t.mutation(tod.submitResponse, { gameId, participantId: hostId, responseText: "mine now" })).rejects.toThrow(/Not your turn/);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("an answer may be 2000 characters long and no longer", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);

    await expect(
      t.mutation(tod.submitResponse, { gameId, participantId: seats[0], responseText: "x".repeat(2001) })
    ).rejects.toThrow(/too long/i);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");

    expect(await answer(t, gameId, seats[0], "x".repeat(2000))).toBe(true);
    expect((await view(t, roomId)).currentTurn?.responseText).toHaveLength(2000);
  });

  test("the mutation takes no responseMediaUrl, link or inline image: a drawing only arrives as a file the route stored", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");

    for (const responseMediaUrl of ["https://example.com/not-a-drawing.png", PNG]) {
      await expect(
        t.mutation(tod.submitResponse, { gameId, participantId: seats[0], responseMediaUrl }),
        responseMediaUrl
      ).rejects.toThrow(/Unsupported drawing/);
    }

    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.status).toBe("waiting_for_response");
    expect(turn.responseMediaUrl).toBeUndefined();
  });

  test("a storage id handed straight to the mutation is refused when the file is gone or larger than a drawing", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const files = await t.run(async (ctx) => {
      const gone = await ctx.storage.store(new Blob([new Uint8Array(8)], { type: "image/png" }));
      await ctx.storage.delete(gone);
      const huge = await ctx.storage.store(new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: "image/png" }));
      return { gone, huge };
    });

    for (const [label, responseStorageId] of Object.entries(files)) {
      await expect(
        t.mutation(tod.submitResponse, { gameId, participantId: seats[0], responseStorageId }),
        label
      ).rejects.toThrow(/Unsupported drawing/);
    }
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  // convex-test records no content type for a stored file, so every other test here takes the "no recorded
  // type" path. A deployment records the type the upload declared; this writes the same field by hand.
  async function storeWithRecordedType(t: Backend, contentType: string) {
    return await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob([new Uint8Array(PNG_BYTES)]));
      // Not something a deployment lets a function do, hence the cast
      await (ctx.db as any).patch(storageId, { contentType });
      return storageId;
    });
  }

  test.each(["audio/mp4", "image/svg+xml", "image/gif", "text/html"])(
    "a stored file that storage recorded as %s is not taken as a drawing",
    async (contentType) => {
      const t = newBackend();
      const { roomId, gameId, seats } = await startGame(t);
      await choose(t, gameId, seats[0], "dare");
      const responseStorageId = await storeWithRecordedType(t, contentType);

      await expect(
        t.mutation(tod.submitResponse, { gameId, participantId: seats[0], responseStorageId })
      ).rejects.toThrow(/Unsupported drawing/);

      const turn = (await view(t, roomId)).currentTurn!;
      expect(turn.status).toBe("waiting_for_response");
      expect(turn.responseMediaUrl).toBeUndefined();
    }
  );

  // The two types the route stores: iOS draws PNG, the web canvas JPEG
  test.each(["image/png", "image/jpeg"])("a stored file that storage recorded as %s is taken", async (contentType) => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const responseStorageId = await storeWithRecordedType(t, contentType);

    tick();
    const taken = await t.mutation(tod.submitResponse, { gameId, participantId: seats[0], responseStorageId });

    expect(taken).toBe(true);
    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.status).toBe("completed");
    expect(turn.responseMediaUrl).toBe((await storedFile(t, responseStorageId)).url);
  });
});

describe("a drawing through /api/truth-or-dare/submit-response", () => {
  test.each([
    ["PNG", PNG, "image/png", PNG_BYTES],
    ["JPEG", JPEG, "image/jpeg", JPEG_BYTES],
  ])("a %s data URL is stored as a file and the turn shows the file's URL", async (_type, dataUrl, contentType, bytes) => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const blobs = recordBlobs();

    const res = await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: dataUrl });

    expect(res.status).toBe(200);
    expect(res.json).toEqual({ ok: true });
    // The web guest's browser posts from another origin and reads this answer
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const files = await storedFiles(t);
    expect(files).toHaveLength(1);
    const file = await storedFile(t, files[0]._id);
    // The decoded image, not the base64 text, under the type a deployment's submitResponse accepts
    expect(file.bytes).toEqual(bytes);
    expect(blobs).toContainEqual({ type: contentType, size: bytes.length });
    const game = await view(t, roomId);
    expect(game.currentTurn?.status).toBe("completed");
    expect(game.currentTurn?.responseMediaUrl).toEqual(expect.any(String));
    expect(game.currentTurn?.responseMediaUrl).toBe(file.url);
    expect(game.completedTurns).toBe(1);
  });

  test("the file's storage id is kept on the turn for the purge and never sent to a client", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");

    const submitted = await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: PNG });

    const storageId = (await turnRows(t, gameId))[0].responseStorageId!;
    expect(storageId).toBeTruthy();
    expect(submitted.text).not.toContain(storageId);

    // While the answered turn is the current one
    const asCurrent = await view(t, roomId);
    expect(asCurrent.currentTurn?.responseStorageId).toBeUndefined();
    expect(JSON.stringify(asCurrent)).not.toContain("responseStorageId");
    expect(JSON.stringify(asCurrent)).not.toContain(storageId);
    const route = await post(t, "/api/truth-or-dare/active", { roomId });
    expect(route.json.currentTurn.responseMediaUrl).toBe(asCurrent.currentTurn?.responseMediaUrl);
    expect(route.text).not.toContain("responseStorageId");
    expect(route.text).not.toContain(storageId);

    // And once it is only in the list of completed turns
    await advance(t, gameId, hostId);
    const asHistory = await view(t, roomId);
    expect(asHistory.completedTurnsList).toHaveLength(1);
    expect(JSON.stringify(asHistory)).not.toContain("responseStorageId");
    expect(JSON.stringify(asHistory)).not.toContain(storageId);
    expect((await post(t, "/api/truth-or-dare/active", { roomId })).text).not.toContain(storageId);
  });

  test("anything but a PNG or JPEG data URL is refused with 400: nothing is stored and the turn stays open", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const refused: [string, unknown, RegExp][] = [
      ["an SVG", "data:image/svg+xml;base64,PHN2Zz4=", /PNG or JPEG/],
      ["a GIF", "data:image/gif;base64,R0lGODlh", /PNG or JPEG/],
      ["a link", "https://example.com/cat.png", /PNG or JPEG/],
      ["a PNG that is not base64 encoded", "data:image/png,iVBORw0KGgo=", /PNG or JPEG/],
      ["a number", 42, /missing/],
      ["broken base64", "data:image/png;base64,***", /base64/],
    ];

    for (const [label, responseMediaUrl, error] of refused) {
      const res = await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl });
      expect(res.status, label).toBe(400);
      expect(res.json.error, label).toMatch(error);
      // Without it the web guest's browser cannot read why the drawing was refused
      expect(res.headers.get("Access-Control-Allow-Origin"), label).toBe("*");
    }

    expect(await storedFiles(t)).toHaveLength(0);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("a drawing of exactly 8 MB is taken", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    // 8 MB is two bytes past a multiple of three, so its base64 ends in one group of "AAA="
    const base64 = "AAAA".repeat((EIGHT_MB - 2) / 3) + "AAA=";

    const res = await post(t, DRAWING_ROUTE, {
      gameId,
      participantId: seats[0],
      responseMediaUrl: "data:image/png;base64," + base64,
    });

    expect(res.json).toEqual({ ok: true });
    expect(res.status).toBe(200);
    expect((await storedFiles(t)).map((file) => file.size)).toEqual([EIGHT_MB]);
    expect((await view(t, roomId)).currentTurn?.status).toBe("completed");
  });

  test("a drawing over 8 MB is refused and nothing is stored", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const tooLong = Math.ceil(EIGHT_MB / 3) * 4 + 4;

    const res = await post(t, DRAWING_ROUTE, {
      gameId,
      participantId: seats[0],
      responseMediaUrl: "data:image/png;base64," + "A".repeat(tooLong),
    });

    expect(res.status).toBe(400);
    expect(res.json.error).toMatch(/too large/i);
    expect(await storedFiles(t)).toHaveLength(0);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("a body that declares a length over the limit is refused on the header alone", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");

    const res = await post(
      t,
      DRAWING_ROUTE,
      { gameId, participantId: seats[0], responseMediaUrl: PNG },
      { "Content-Length": String(20 * 1024 * 1024) }
    );

    expect(res.status).toBe(400);
    expect(res.json.error).toMatch(/too large/i);
    expect(await storedFiles(t)).toHaveLength(0);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("a drawing sent for someone else's turn is refused and its file is not left behind", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");

    const res = await post(t, DRAWING_ROUTE, { gameId, participantId: hostId, responseMediaUrl: PNG });

    expect(res.status).toBe(400);
    expect(res.json.error).toMatch(/Not your turn/);
    expect(await storedFiles(t)).toHaveLength(0);
    expect((await view(t, roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("a second drawing for a turn already answered is dropped: the first stays and the new file is deleted", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: PNG });
    const firstUrl = (await view(t, roomId)).currentTurn?.responseMediaUrl;
    const firstFiles = await storedFiles(t);

    const res = await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: JPEG });

    expect(res.status).toBe(200);
    expect(res.json).toEqual({ ok: true });
    expect((await view(t, roomId)).currentTurn?.responseMediaUrl).toBe(firstUrl);
    expect((await storedFiles(t)).map((f) => f._id)).toEqual(firstFiles.map((f) => f._id));
  });

  test("a text answer goes through the same route, with a null drawing read as none", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);

    const res = await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseText: "sushi", responseMediaUrl: null });

    expect(res.status).toBe(200);
    expect((await view(t, roomId)).currentTurn).toMatchObject({ status: "completed", responseText: "sushi" });
    expect(await storedFiles(t)).toHaveLength(0);
  });

  test("the browser's preflight request is answered with the CORS headers", async () => {
    const t = newBackend();

    const res = await t.fetch(DRAWING_ROUTE, { method: "OPTIONS" });

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toMatch(/POST/);
  });

  // 93ed5d0: turns record the storage id "so it can be deleted"
  test("the closed-room purge takes the game's rows and the stored drawing with it", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: PNG });
    expect(await storedFiles(t)).toHaveLength(1);
    await t.mutation(api.rooms.closeRoom, { roomId });
    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
    await t.finishInProgressScheduledFunctions();
    vi.stubEnv("PURGE_CLOSED_ROOMS_AFTER_DAYS", "1");
    vi.spyOn(console, "log").mockImplementation(() => {});

    await t.mutation(internal.rooms.purgeClosedRooms, {});
    // The purge reschedules itself until the room is gone; nothing else is left to run in a closed room
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await storedFiles(t)).toHaveLength(0);
    const left = await t.run(async (ctx) => ({
      games: (await ctx.db.query("truthOrDareGames").collect()).length,
      turns: (await ctx.db.query("truthOrDareTurns").collect()).length,
      trace: (await ctx.db.query("todTrace").collect()).length,
    }));
    expect(left).toEqual({ games: 0, turns: 0, trace: 0 });
  });
});

// ─── Ratings ─────────────────────────────────────────────────────────────────

describe("submitRating", () => {
  /** A game whose first turn (the first guest's) is answered, with the id of that turn */
  async function answeredTurn(t: Backend, options: { guests?: number } = {}) {
    const g = await startGame(t, options);
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    return { ...g, turnId };
  }

  test("a room member's rating is kept on the turn, snapped to the nearest half", async () => {
    const t = newBackend();
    const { roomId, hostId, turnId } = await answeredTurn(t);

    await t.mutation(tod.submitRating, { turnId, participantId: hostId, score: 3.3 });

    const game = await view(t, roomId);
    expect(game.currentTurn?.ratings).toEqual([{ participantId: hostId, score: 3.5 }]);
    expect(game.completedTurnsList[0].ratings).toEqual([{ participantId: hostId, score: 3.5 }]);
  });

  test("each member has one rating per turn: rating again replaces their earlier one", async () => {
    const t = newBackend();
    const { roomId, hostId, guests, turnId } = await answeredTurn(t, { guests: 2 });

    await t.mutation(tod.submitRating, { turnId, participantId: hostId, score: 2 });
    await t.mutation(tod.submitRating, { turnId, participantId: guests[1], score: 3 });
    await t.mutation(tod.submitRating, { turnId, participantId: hostId, score: 5 });

    const ratings = (await view(t, roomId)).currentTurn?.ratings ?? [];
    expect(ratings).toHaveLength(2);
    expect(ratings).toContainEqual({ participantId: hostId, score: 5 });
    expect(ratings).toContainEqual({ participantId: guests[1], score: 3 });
  });

  test("players do not rate their own answer", async () => {
    const t = newBackend();
    const { roomId, seats, turnId } = await answeredTurn(t);

    await t.mutation(tod.submitRating, { turnId, participantId: seats[0], score: 5 });

    expect((await view(t, roomId)).currentTurn?.ratings ?? []).toEqual([]);
  });

  test("someone who joined the room after the game started has no seat but may rate", async () => {
    const t = newBackend();
    const { roomId, seats, turnId } = await answeredTurn(t);
    const latecomer = await joinGuest(t, roomId, "Late", { avatar: "bear" });

    await t.mutation(tod.submitRating, { turnId, participantId: latecomer, score: 4 });

    const game = await view(t, roomId);
    expect(game.playerOrder).toEqual(seats);
    expect(game.currentTurn?.ratings).toEqual([{ participantId: latecomer, score: 4 }]);
  });

  test("a participant of another room cannot rate", async () => {
    const t = newBackend();
    const { roomId, turnId } = await answeredTurn(t);
    const elsewhere = await createRoom(t, { hostNickname: "Other host" });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(t.mutation(tod.submitRating, { turnId, participantId: elsewhere.hostId, score: 5 })).rejects.toThrow(/Not a member of this room/);
    expect((await view(t, roomId)).currentTurn?.ratings ?? []).toEqual([]);
  });

  test("a participant who was kicked cannot rate", async () => {
    const t = newBackend();
    const { roomId, guests, turnId } = await answeredTurn(t, { guests: 2 });
    await t.mutation(api.participants.kickParticipant, { participantId: guests[1], roomId });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(t.mutation(tod.submitRating, { turnId, participantId: guests[1], score: 5 })).rejects.toThrow(/Not a member of this room/);
    expect((await view(t, roomId)).currentTurn?.ratings ?? []).toEqual([]);
  });

  test("a turn cannot be rated before it is answered", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);
    const turnId = (await view(t, roomId)).currentTurn!._id;

    await expect(t.mutation(tod.submitRating, { turnId, participantId: hostId, score: 5 })).rejects.toThrow(/not completed/i);
  });

  test("a score that does not snap into 1 to 10, or is not a number at all, is refused", async () => {
    const t = newBackend();
    const { roomId, hostId, turnId } = await answeredTurn(t);

    for (const score of [0, 0.7, 10.3, 11, NaN]) {
      await expect(t.mutation(tod.submitRating, { turnId, participantId: hostId, score }), String(score)).rejects.toThrow(/Score must be/);
    }
    expect((await view(t, roomId)).currentTurn?.ratings ?? []).toEqual([]);
  });

  // DEFECT: submitRating (truthOrDare.ts:725) still takes the 1 to 10 of the slider both apps had for a
  // week. Since 3e58a33 (1 April 2026) both apps offer five stars and show the result out of five
  // (truth-or-dare-game.tsx:1164 "/5", TruthOrDareGameView.swift:367 "Everyone rates your answer 1–5"), and
  // the server was not changed with them. Any room member who calls the mutation themselves can give 10:
  // everyone then sees an average such as "7.5/5", and the round-break ranking and the chat summary put
  // that player on top. Correct: the server takes what the apps offer, 1 to 5, whether it refuses the
  // rest or caps it.
  test.fails("no rating above the five stars both apps offer is recorded", async () => {
    const t = newBackend();
    // As in the defect test under createGame: a broken set-up must not pass for the defect
    const g = await answeredTurn(t).catch((error) => {
      console.error("The set-up of a defect test failed, so the test proves nothing:", error);
      return undefined;
    });
    if (!g) return;

    const recorded: number[] = [];
    for (const score of [5.5, 6, 10]) {
      await t.mutation(tod.submitRating, { turnId: g.turnId, participantId: g.hostId, score }).catch(() => undefined);
      recorded.push(...((await view(t, g.roomId)).currentTurn?.ratings ?? []).map((rating) => rating.score));
    }

    expect(recorded.filter((score) => score > 5)).toEqual([]);
  });
});

// ─── Translation ─────────────────────────────────────────────────────────────

describe("submitTranslation", () => {
  async function answeredTurn(t: Backend, options: { tokens?: boolean } = {}) {
    const g = await startGame(t, options);
    tick();
    await t.mutation(tod.submitChoice, { gameId: g.gameId, participantId: g.seats[0], choice: "truth", token: g.guestTokens[0] });
    tick();
    await t.mutation(tod.submitResponse, { gameId: g.gameId, participantId: g.seats[0], responseText: "ラーメン", token: g.guestTokens[0] });
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    return { ...g, turnId };
  }

  test("the host app's translation of a text answer is stored on the turn", async () => {
    const t = newBackend();
    const { roomId, turnId } = await answeredTurn(t);

    // Installed host builds name no caller on this route
    const res = await post(t, "/api/truth-or-dare/submit-translation", { turnId, translatedText: "ramen" });

    expect(res.status).toBe(200);
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBe("ramen");
  });

  test("the first translation is kept: the host app posts again on every poll until it sees it stored", async () => {
    const t = newBackend();
    const { roomId, turnId } = await answeredTurn(t);
    await t.mutation(tod.submitTranslation, { turnId, translatedText: "ramen" });

    await t.mutation(tod.submitTranslation, { turnId, translatedText: "noodles" });

    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBe("ramen");
  });

  test("only a finished text answer takes a translation: not an open turn, not a drawing", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0], "dare");
    const turnId = (await view(t, roomId)).currentTurn!._id;

    await t.mutation(tod.submitTranslation, { turnId, translatedText: "too early" });
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBeUndefined();

    await post(t, DRAWING_ROUTE, { gameId, participantId: seats[0], responseMediaUrl: PNG });
    await t.mutation(tod.submitTranslation, { turnId, translatedText: "a cat" });
    const turn = (await view(t, roomId)).currentTurn!;
    expect(turn.status).toBe("completed");
    expect(turn.translatedResponseText).toBeUndefined();
  });

  test("a translation may be 8000 characters long and no longer", async () => {
    const t = newBackend();
    const { roomId, turnId } = await answeredTurn(t);

    await expect(t.mutation(tod.submitTranslation, { turnId, translatedText: "x".repeat(8001) })).rejects.toThrow(/too long/i);
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBeUndefined();

    await t.mutation(tod.submitTranslation, { turnId, translatedText: "x".repeat(8000) });
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toHaveLength(8000);
  });

  test("under enforce only the room's host, proving it with the host token, can post a translation", async () => {
    const t = newBackend();
    const { roomId, hostToken, guests, guestTokens, turnId } = await answeredTurn(t, { tokens: true });
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // A guest, even with their own valid token
    await expect(
      t.mutation(tod.submitTranslation, { turnId, translatedText: "guest's words", callerId: guests[0], token: guestTokens[0] })
    ).rejects.toThrow(/Not authorised/);
    // No caller named means the room's host, who still has to send the token
    await expect(t.mutation(tod.submitTranslation, { turnId, translatedText: "anonymous words" })).rejects.toThrow(/Not authorised/);
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBeUndefined();

    await t.mutation(tod.submitTranslation, { turnId, translatedText: "ramen", token: hostToken });
    expect((await view(t, roomId)).currentTurn?.translatedResponseText).toBe("ramen");
  });
});

// ─── Turn order ──────────────────────────────────────────────────────────────

describe("advanceTurn", () => {
  test("turns go round the seats in order and come back to the first", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const holders: PlayerId[] = [];

    for (let i = 0; i < 4; i++) {
      holders.push((await view(t, g.roomId)).currentTurnParticipantId!);
      await playTurns(t, g, 1);
    }

    expect(holders).toEqual([g.seats[0], g.seats[1], g.seats[2], g.seats[0]]);
    const game = await view(t, g.roomId);
    expect(game.currentTurnIndex).toBe(1);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
    expect(game.completedTurns).toBe(4);
    expect(game.totalTurns).toBe(5);
  });

  test("a guest who did not start the game cannot deal the next turn", async () => {
    const t = newBackend();
    const { roomId, gameId, seats } = await startGame(t);
    await choose(t, gameId, seats[0]);
    await answer(t, gameId, seats[0]);

    await expect(t.mutation(tod.advanceTurn, { gameId, participantId: seats[0] })).rejects.toThrow(/Only the host/);
    const game = await view(t, roomId);
    expect(game.currentTurnParticipantId).toBe(seats[0]);
    expect(game.totalTurns).toBe(1);
  });

  test("the guest who started the game and the room's host can both deal the next turn", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2, startedBy: "guest" });
    expect((await view(t, g.roomId)).hostParticipantId).toBe(g.guests[0]);
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);

    await advance(t, g.gameId, g.guests[0]);
    expect((await view(t, g.roomId)).currentTurnParticipantId).toBe(g.seats[1]);

    await choose(t, g.gameId, g.seats[1]);
    await answer(t, g.gameId, g.seats[1]);
    await advance(t, g.gameId, g.hostId);
    expect((await view(t, g.roomId)).currentTurnParticipantId).toBe(g.seats[2]);
  });

  test("a double tap on Next Turn deals one turn, not two", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);

    await advance(t, g.gameId, g.hostId);
    await advance(t, g.gameId, g.hostId);

    const game = await view(t, g.roomId);
    expect(game.currentTurnParticipantId).toBe(g.seats[1]);
    expect(game.totalTurns).toBe(2);
    expect(game.roundBreakAckedTurns).toBeUndefined();
  });

  test("an advance that arrives while the player is still answering leaves their turn alone", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);

    await advance(t, g.gameId, g.hostId);

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[0], status: "waiting_for_response" });
    expect(game.totalTurns).toBe(1);
  });

  test("the seat of a player who was kicked is passed over", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    await t.mutation(api.participants.kickParticipant, { participantId: g.seats[1], roomId: g.roomId });

    await advance(t, g.gameId, g.hostId);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("active");
    expect(game.currentTurnIndex).toBe(2);
    expect(game.currentTurn).toMatchObject({ participantId: g.hostId, status: "waiting_for_choice" });
  });

  test("when a kick leaves one player, dealing the next turn ends the game with its summary instead", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    await t.mutation(api.participants.kickParticipant, { participantId: g.seats[0], roomId: g.roomId });

    await advance(t, g.gameId, g.hostId);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("completed");
    expect(game.totalTurns).toBe(1);
    const posted = await summaries(t, g.roomId);
    expect(posted).toHaveLength(1);
    expect(posted[0].totalTurns).toBe(1);
  });
});

// ─── The round break ─────────────────────────────────────────────────────────

// Review bug 7: the break after every ten turns was client state. The host's Keep Playing changed
// nothing on the server, so a web guest holding the next turn waited behind the overlay for ever
// (fixed in 17f6267 with roundBreakAckedTurns)
describe("the round break", () => {
  test("after ten turns the break is up for everyone until the host continues, and the guest's next turn is untouched", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 10);
    const atBreak = await view(t, g.roomId);
    expect(atBreak.completedTurns).toBe(10);
    expect(atBreak.currentTurnParticipantId).toBe(g.guests[0]);
    expect(atBreak.roundBreakAckedTurns).toBeUndefined();
    expect(showsRoundBreak(atBreak)).toBe(true);

    const res = await post(t, "/api/truth-or-dare/ack-round-break", { gameId: g.gameId, participantId: g.hostId, completedTurns: 10 });

    expect(res.status).toBe(200);
    const after = await view(t, g.roomId);
    expect(after.roundBreakAckedTurns).toBe(10);
    expect(showsRoundBreak(after)).toBe(false);
    expect(after.currentTurn).toMatchObject({ _id: atBreak.currentTurn!._id, participantId: g.guests[0], status: "waiting_for_choice" });
    expect(after.totalTurns).toBe(11);
  });

  test("an older host app's Keep Playing, a second advanceTurn while the next turn waits, lifts the break too", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 10);
    expect(showsRoundBreak(await view(t, g.roomId))).toBe(true);

    await advance(t, g.gameId, g.hostId);

    const game = await view(t, g.roomId);
    expect(game.roundBreakAckedTurns).toBe(10);
    expect(showsRoundBreak(game)).toBe(false);
    expect(game.totalTurns).toBe(11);
  });

  test("the acknowledgement still counts when the next player has already started their turn", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 10);
    await choose(t, g.gameId, g.guests[0]);

    await t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.hostId, completedTurns: 10 });

    expect((await view(t, g.roomId)).roundBreakAckedTurns).toBe(10);
  });

  test("nothing is recorded when the count is not a multiple of ten", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 3);

    await t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.hostId, completedTurns: 3 });

    expect((await view(t, g.roomId)).roundBreakAckedTurns).toBeUndefined();
  });

  test("a guest cannot continue the game past the break", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 10);

    await expect(
      t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.guests[0], completedTurns: 10 })
    ).rejects.toThrow(/Only the host/);
    expect(showsRoundBreak(await view(t, g.roomId))).toBe(true);
  });

  test("the break after twenty turns needs its own acknowledgement: a late repeat of the one for ten does not lift it", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 10);
    await t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.hostId, completedTurns: 10 });
    await playTurns(t, g, 10);
    expect((await view(t, g.roomId)).completedTurns).toBe(20);
    expect(showsRoundBreak(await view(t, g.roomId))).toBe(true);

    await t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.hostId, completedTurns: 10 });
    const afterRepeat = await view(t, g.roomId);
    expect(afterRepeat.roundBreakAckedTurns).toBe(10);
    expect(showsRoundBreak(afterRepeat)).toBe(true);

    await t.mutation(tod.acknowledgeRoundBreak, { gameId: g.gameId, participantId: g.hostId, completedTurns: 20 });
    const after = await view(t, g.roomId);
    expect(after.roundBreakAckedTurns).toBe(20);
    expect(showsRoundBreak(after)).toBe(false);
  });
});

// ─── Skipping ────────────────────────────────────────────────────────────────

describe("skipTurn", () => {
  test("the turn holder's skip deals them a fresh turn at the same seat", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0]);
    const before = (await view(t, g.roomId)).currentTurn!;

    tick();
    await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.seats[0] });

    const game = await view(t, g.roomId);
    expect(game.currentTurn?._id).not.toBe(before._id);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[0], turnIndex: 0, status: "waiting_for_choice" });
    expect(game.currentTurn?.promptId).toBeUndefined();
    expect(game.currentTurnParticipantId).toBe(g.seats[0]);
    expect(game.totalTurns).toBe(2);
    expect(game.completedTurns).toBe(0);
    expect((await turnRows(t, g.gameId)).find((row) => row._id === before._id)?.status).toBe("skipped");
  });

  test("a guest cannot skip someone else's turn", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });

    await expect(t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.seats[1] })).rejects.toThrow(/Not your turn/);
    expect((await view(t, g.roomId)).totalTurns).toBe(1);
  });

  test("a host's Skip that arrives once the turn has moved to someone else changes nothing", async () => {
    const t = newBackend();
    const g = await startGame(t);
    expect(g.seats[0]).not.toBe(g.hostId);
    const before = (await view(t, g.roomId)).currentTurn!;

    tick();
    await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.hostId });

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ _id: before._id, participantId: g.seats[0], status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(1);
  });

  test("a skip that arrives after the answer does not deal the player a second turn", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);

    tick();
    await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.seats[0] });

    const game = await view(t, g.roomId);
    expect(game.currentTurn?.status).toBe("completed");
    expect(game.totalTurns).toBe(1);
  });
});

// Review bug 8: "Truth or Dare cannot move past a player who left or was kicked" (fixed in 17f6267)
describe("hostSkipTurn", () => {
  test("the host moves the game past another player's turn to the next seat", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    const stuck = (await view(t, g.roomId)).currentTurn!;

    const res = await post(t, "/api/truth-or-dare/host-skip-turn", { gameId: g.gameId, participantId: g.hostId, turnId: stuck._id });

    expect(res.status).toBe(200);
    const game = await view(t, g.roomId);
    expect(game.currentTurnIndex).toBe(1);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
    expect(game.completedTurns).toBe(0);
    expect((await turnRows(t, g.gameId)).find((row) => row._id === stuck._id)?.status).toBe("skipped");
  });

  test("a repeat of the same skip does not skip the next player as well", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const stuck = (await view(t, g.roomId)).currentTurn!;
    tick();
    await t.mutation(tod.hostSkipTurn, { gameId: g.gameId, participantId: g.hostId, turnId: stuck._id });

    tick();
    await t.mutation(tod.hostSkipTurn, { gameId: g.gameId, participantId: g.hostId, turnId: stuck._id });

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(2);
  });

  test("a guest cannot skip another player's turn", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const turnId = (await view(t, g.roomId)).currentTurn!._id;

    await expect(t.mutation(tod.hostSkipTurn, { gameId: g.gameId, participantId: g.seats[1], turnId })).rejects.toThrow(/Only the host/);
    expect((await view(t, g.roomId)).currentTurnParticipantId).toBe(g.seats[0]);
  });

  test("a turn that was answered while the host reached for Skip stays answered", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await answer(t, g.gameId, g.seats[0], "just in time");

    tick();
    await t.mutation(tod.hostSkipTurn, { gameId: g.gameId, participantId: g.hostId, turnId });

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ _id: turnId, status: "completed", responseText: "just in time" });
    expect(game.totalTurns).toBe(1);
  });

  test("the host can move past the open turn of a player who was kicked", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await t.mutation(api.participants.kickParticipant, { participantId: g.seats[0], roomId: g.roomId });

    tick();
    await t.mutation(tod.hostSkipTurn, { gameId: g.gameId, participantId: g.hostId, turnId });

    const game = await view(t, g.roomId);
    expect(game.status).toBe("active");
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
  });
});

// ─── The absence check ───────────────────────────────────────────────────────

// Review bugs 6 and 8: a turn dealt to someone who is not there never ended (fixed in 17f6267).
// The server looks at the holder of the open turn every 15 s and skips them after two looks in a
// row that find them away, as long as someone else is there to play.
describe("the absence check", () => {
  test("a turn holder who is away for two looks in a row is skipped and the next seat is dealt", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const stuck = (await view(t, g.roomId)).currentTurn!;
    await heartbeat(t, g.seats[0], "away");

    await nextLook(t, [g.seats[1], g.hostId]);
    expect((await view(t, g.roomId)).currentTurn).toMatchObject({ _id: stuck._id, status: "waiting_for_choice" });

    await nextLook(t, [g.seats[1], g.hostId]);
    const game = await view(t, g.roomId);
    expect(game.status).toBe("active");
    expect(game.currentTurnIndex).toBe(1);
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(2);
    expect((await turnRows(t, g.gameId)).find((row) => row._id === stuck._id)?.status).toBe("skipped");
  });

  test("a turn holder whose heartbeats simply stop is skipped within a minute", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await heartbeat(t, g.seats[0]);

    await nextLook(t, [g.hostId]);
    await nextLook(t, [g.hostId]);
    // 30 s of silence is still within the 45 s that count as present
    expect((await view(t, g.roomId)).currentTurnParticipantId).toBe(g.seats[0]);

    // At 45 s they are found gone for the first time, which alone does not cost them the turn
    await nextLook(t, [g.hostId]);
    expect((await view(t, g.roomId)).currentTurn).toMatchObject({ participantId: g.seats[0], status: "waiting_for_choice" });
    expect((await view(t, g.roomId)).totalTurns).toBe(1);

    await nextLook(t, [g.hostId]);
    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ participantId: g.hostId, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(2);
  });

  test("a holder who keeps sending heartbeats is never skipped, however long they take", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;

    for (let i = 0; i < 8; i++) await nextLook(t, [g.seats[0], g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ _id: turnId, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(1);
  });

  test("one look that finds the holder away is forgiven when they are back by the next", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;

    await heartbeat(t, g.seats[0], "away");
    await nextLook(t, [g.hostId]); // away: first miss
    await nextLook(t, [g.seats[0], g.hostId]); // back: the count starts over
    await heartbeat(t, g.seats[0], "away");
    await nextLook(t, [g.hostId]); // away again: a first miss, not a second

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ _id: turnId, participantId: g.seats[0], status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(1);
  });

  test("a player who chose and then left is skipped as well", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0]);
    const stuck = (await view(t, g.roomId)).currentTurn!;
    expect(stuck.status).toBe("waiting_for_response");
    await heartbeat(t, g.seats[0], "away");

    await nextLook(t, [g.hostId]);
    await nextLook(t, [g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ participantId: g.hostId, status: "waiting_for_choice" });
    expect(game.completedTurns).toBe(0);
    expect((await turnRows(t, g.gameId)).find((row) => row._id === stuck._id)?.status).toBe("skipped");
  });

  test("a first turn dealt to a guest who is already away is skipped at the first look", async () => {
    const t = newBackend();
    const room = await seatRoom(t);
    await heartbeat(t, room.guests[0], "away");
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    await t.mutation(tod.createGame, { roomId: room.roomId, hostParticipantId: room.hostId });
    random.mockRestore();
    expect((await view(t, room.roomId)).currentTurnParticipantId).toBe(room.guests[0]);

    await nextLook(t, [room.hostId]);

    expect((await view(t, room.roomId)).currentTurn).toMatchObject({ participantId: room.hostId, status: "waiting_for_choice" });
  });

  test("a seat that rotation deals to a player who is already away is skipped at the first look", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    await heartbeat(t, g.seats[1], "away");
    await advance(t, g.gameId, g.hostId);
    expect((await view(t, g.roomId)).currentTurnParticipantId).toBe(g.seats[1]);

    await nextLook(t, [g.seats[0], g.hostId]);

    expect((await view(t, g.roomId)).currentTurn).toMatchObject({ participantId: g.hostId, status: "waiting_for_choice" });
  });

  test("with nobody else there the absent holder keeps the turn, and is skipped once someone is back", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await heartbeat(t, g.seats[0], "away");
    await heartbeat(t, g.hostId, "away");

    for (let i = 0; i < 4; i++) await nextLook(t, []);
    const empty = await view(t, g.roomId);
    expect(empty.currentTurn).toMatchObject({ _id: turnId, status: "waiting_for_choice" });
    expect(empty.totalTurns).toBe(1);

    await nextLook(t, [g.hostId]);
    const game = await view(t, g.roomId);
    expect(game.currentTurn).toMatchObject({ participantId: g.hostId, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(2);
  });

  test("a turn holder who was kicked is passed at the very next look", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await t.mutation(api.participants.kickParticipant, { participantId: g.seats[0], roomId: g.roomId });

    await nextLook(t, [g.seats[1], g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("active");
    expect(game.currentTurn).toMatchObject({ participantId: g.seats[1], status: "waiting_for_choice" });
  });

  test("when the kicked holder leaves one player, the look ends the game and posts its summary", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await t.mutation(api.participants.kickParticipant, { participantId: g.seats[0], roomId: g.roomId });

    await nextLook(t, [g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("completed");
    const posted = await summaries(t, g.roomId);
    expect(posted).toHaveLength(1);
    expect(posted[0].senderId).toBe(g.hostId);
  });

  test("ending the game stops the looks: the turn it ended on is not skipped afterwards", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await heartbeat(t, g.seats[0], "away");
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    const ended = await view(t, g.roomId);

    for (let i = 0; i < 3; i++) await nextLook(t, [g.seats[1], g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("completed");
    expect(game.currentTurn).toMatchObject({ _id: ended.currentTurn!._id, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(1);
  });

  test("closing the room stops the looks: its game is left as it was", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await heartbeat(t, g.seats[0], "away");
    await t.mutation(api.rooms.closeRoom, { roomId: g.roomId });

    // The host app may keep polling a room it closed, which would otherwise count as someone waiting
    for (let i = 0; i < 4; i++) await nextLook(t, [g.hostId]);

    const game = await view(t, g.roomId);
    expect(game.status).toBe("active");
    expect(game.currentTurn).toMatchObject({ _id: turnId, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(1);
  });
});

// ─── Ending ──────────────────────────────────────────────────────────────────

describe("endGame", () => {
  test("the host's End Game completes the game and posts a summary of answered turns and average ratings", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const [guest] = g.guests;
    // Turn 1, the guest's: rated 4
    await choose(t, g.gameId, guest);
    await answer(t, g.gameId, guest);
    await t.mutation(tod.submitRating, { turnId: (await view(t, g.roomId)).currentTurn!._id, participantId: g.hostId, score: 4 });
    await advance(t, g.gameId, g.hostId);
    // Turn 2, the host's: answered, not rated
    await choose(t, g.gameId, g.hostId);
    await answer(t, g.gameId, g.hostId);
    await advance(t, g.gameId, g.hostId);
    // Turn 3, the guest's: rated 3
    await choose(t, g.gameId, guest);
    await answer(t, g.gameId, guest);
    await t.mutation(tod.submitRating, { turnId: (await view(t, g.roomId)).currentTurn!._id, participantId: g.hostId, score: 3 });
    await advance(t, g.gameId, g.hostId);
    // Turn 4, the host's: skipped, so it does not count
    tick();
    await t.mutation(tod.skipTurn, { gameId: g.gameId, participantId: g.hostId });

    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });

    const game = await view(t, g.roomId);
    expect(game._id).toBe(g.gameId);
    expect(game.status).toBe("completed");
    expect(game.completedAt).toBe(Date.now());
    expect(game.completedTurnsList).toHaveLength(3);
    const posted = await summaries(t, g.roomId);
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      senderId: g.hostId,
      gameType: "Truth or Dare",
      totalTurns: 3,
      players: [
        { name: "Aiko", avatar: "fox", avgRating: 3.5, turnsRated: 2 },
        { name: "Host", avgRating: null, turnsRated: 0 },
      ],
    });
  });

  test("in the summary a turn's rating is the mean of everyone who rated it", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await t.mutation(tod.submitRating, { turnId, participantId: g.hostId, score: 5 });
    await t.mutation(tod.submitRating, { turnId, participantId: g.guests[1], score: 2 });

    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });

    const posted = await summaries(t, g.roomId);
    expect(posted).toHaveLength(1);
    expect(posted[0].players).toEqual([
      { name: "Aiko", avatar: "fox", avgRating: 3.5, turnsRated: 1 },
      { name: "Ben", avatar: "owl", avgRating: null, turnsRated: 0 },
      expect.objectContaining({ name: "Host", avgRating: null, turnsRated: 0 }),
    ]);
  });

  // Review: "`endGame` posts a new summary message on every call" (fixed in 17f6267)
  test("a second End Game posts no second summary, and neither does postSummary", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    const endedAt = (await view(t, g.roomId)).completedAt;
    tick();

    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    await t.mutation(tod.postSummary, { roomId: g.roomId, participantId: g.guests[0] });

    expect(await summaries(t, g.roomId)).toHaveLength(1);
    expect((await view(t, g.roomId)).completedAt).toBe(endedAt);
  });

  test("a game ended in the middle of a turn takes no more play: choices and answers are refused and skips change nothing", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    const { gameId, hostId } = g;
    await choose(t, gameId, g.seats[0]);
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    await t.mutation(tod.endGame, { gameId, participantId: hostId });
    const ended = await view(t, g.roomId);
    expect(ended.currentTurn).toMatchObject({ _id: turnId, status: "waiting_for_response" });
    tick();

    await expect(t.mutation(tod.submitChoice, { gameId, participantId: g.seats[0], choice: "truth" })).rejects.toThrow(/not active/);
    await expect(t.mutation(tod.submitResponse, { gameId, participantId: g.seats[0], responseText: "late" })).rejects.toThrow(/not active/);
    await t.mutation(tod.skipTurn, { gameId, participantId: g.seats[0] });
    await t.mutation(tod.hostSkipTurn, { gameId, participantId: hostId, turnId });

    expect(await view(t, g.roomId)).toEqual(ended);
  });

  test("a Next Turn that arrives after the game ended deals nothing", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2 });
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0]);
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    const ended = await view(t, g.roomId);

    await advance(t, g.gameId, g.hostId);

    expect(await view(t, g.roomId)).toEqual(ended);
    expect(ended.totalTurns).toBe(1);
  });

  // 93ed5d0: "Until tokens anyone could end the game. Both apps only offer End Game to the host."
  describe("who may end it", () => {
    test("under enforce a guest who did not start it, the host of another room and a caller with the wrong token are all refused", async () => {
      const t = newBackend();
      const g = await startGame(t, { guests: 2, tokens: true });
      const elsewhere = await createRoom(t, { hostNickname: "Other host", hostToken: tokenFor(50) });
      vi.stubEnv("AUTH_MODE", "enforce");
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const refused = {
        "a guest with their own token": { participantId: g.guests[0], token: g.guestTokens[0] },
        "another room's host": { participantId: elsewhere.hostId, token: tokenFor(50) },
        "the host's id with a guest's token": { participantId: g.hostId, token: g.guestTokens[0] },
      };

      for (const [label, caller] of Object.entries(refused)) {
        await expect(t.mutation(tod.endGame, { gameId: g.gameId, ...caller }), label).rejects.toThrow(/Not authorised/);
      }

      expect((await view(t, g.roomId)).status).toBe("active");
      expect(await summaries(t, g.roomId)).toHaveLength(0);
    });

    test("under enforce the guest who started the game can end it", async () => {
      const t = newBackend();
      const g = await startGame(t, { guests: 2, tokens: true, startedBy: "guest" });
      vi.stubEnv("AUTH_MODE", "enforce");

      await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.guests[0], token: g.guestTokens[0] });

      expect((await view(t, g.roomId)).status).toBe("completed");
    });

    test("under enforce the room's host can end a game a guest started, and the other guest cannot", async () => {
      const t = newBackend();
      const g = await startGame(t, { guests: 2, tokens: true, startedBy: "guest" });
      vi.stubEnv("AUTH_MODE", "enforce");
      vi.spyOn(console, "warn").mockImplementation(() => {});

      await expect(
        t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.guests[1], token: g.guestTokens[1] })
      ).rejects.toThrow(/Not authorised/);
      expect((await view(t, g.roomId)).status).toBe("active");

      await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId, token: g.hostToken });
      expect((await view(t, g.roomId)).status).toBe("completed");
    });

    test("in log mode, the default, a guest's End Game still goes through and is reported in the log", async () => {
      const t = newBackend();
      const g = await startGame(t, { guests: 2, tokens: true });
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.guests[0], token: g.guestTokens[0] });

      expect((await view(t, g.roomId)).status).toBe("completed");
      expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^auth: truthOrDare\.endGame not the host/));
    });
  });
});

// ─── Caller tokens ───────────────────────────────────────────────────────────

describe("caller tokens (93ed5d0)", () => {
  test("under enforce no call acts for a participant who registered a token unless it carries that token", async () => {
    const t = newBackend();
    const g = await startGame(t, { tokens: true });
    const { roomId, gameId, hostId, hostToken } = g;
    // An answered turn to rate and translate, then the host's own open turn
    await t.mutation(tod.submitChoice, { gameId, participantId: g.guests[0], choice: "truth", token: g.guestTokens[0] });
    await t.mutation(tod.submitResponse, { gameId, participantId: g.guests[0], responseText: "done", token: g.guestTokens[0] });
    const answered = (await view(t, roomId)).currentTurn!._id;
    tick();
    await t.mutation(tod.advanceTurn, { gameId, participantId: hostId, token: hostToken });
    const before = await view(t, roomId);
    const open = before.currentTurn!._id;
    expect(before.currentTurnParticipantId).toBe(hostId);
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const asHostWithoutToken: Record<string, () => Promise<unknown>> = {
      createGame: () => t.mutation(tod.createGame, { roomId, hostParticipantId: hostId }),
      submitChoice: () => t.mutation(tod.submitChoice, { gameId, participantId: hostId, choice: "truth" }),
      submitResponse: () => t.mutation(tod.submitResponse, { gameId, participantId: hostId, responseText: "forged" }),
      submitRating: () => t.mutation(tod.submitRating, { turnId: answered, participantId: hostId, score: 5 }),
      submitTranslation: () => t.mutation(tod.submitTranslation, { turnId: answered, translatedText: "forged" }),
      advanceTurn: () => t.mutation(tod.advanceTurn, { gameId, participantId: hostId }),
      acknowledgeRoundBreak: () => t.mutation(tod.acknowledgeRoundBreak, { gameId, participantId: hostId, completedTurns: 1 }),
      skipTurn: () => t.mutation(tod.skipTurn, { gameId, participantId: hostId }),
      hostSkipTurn: () => t.mutation(tod.hostSkipTurn, { gameId, participantId: hostId, turnId: open }),
      endGame: () => t.mutation(tod.endGame, { gameId, participantId: hostId }),
      postSummary: () => t.mutation(tod.postSummary, { roomId, participantId: hostId }),
    };
    for (const [name, call] of Object.entries(asHostWithoutToken)) {
      await expect(call(), name).rejects.toThrow(/Not authorised/);
    }

    expect(await view(t, roomId)).toEqual(before);
  });

  test("under enforce another participant's token is no better than none", async () => {
    const t = newBackend();
    const g = await startGame(t, { tokens: true });
    const [guest] = g.guests;
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      t.mutation(tod.submitChoice, { gameId: g.gameId, participantId: guest, choice: "truth", token: g.hostToken })
    ).rejects.toThrow(/Not authorised/);
    expect((await view(t, g.roomId)).currentTurn?.status).toBe("waiting_for_choice");

    await t.mutation(tod.submitChoice, { gameId: g.gameId, participantId: guest, choice: "truth", token: g.guestTokens[0] });
    expect((await view(t, g.roomId)).currentTurn?.status).toBe("waiting_for_response");
  });

  test("players from before tokens, who registered none, play on under enforce", async () => {
    const t = newBackend();
    const g = await startGame(t);
    vi.stubEnv("AUTH_MODE", "enforce");

    await playTurns(t, g, 2);

    expect((await view(t, g.roomId)).completedTurns).toBe(2);
  });

  test("in log mode a call without its token is let through and reported in the log", async () => {
    const t = newBackend();
    const g = await startGame(t, { tokens: true });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await t.mutation(tod.submitChoice, { gameId: g.gameId, participantId: g.guests[0], choice: "truth" });

    expect((await view(t, g.roomId)).currentTurn?.status).toBe("waiting_for_response");
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^auth: truthOrDare\.submitChoice no token/));
  });

  test("under enforce someone from another room cannot start a game here", async () => {
    const t = newBackend();
    const room = await seatRoom(t, { tokens: true });
    const elsewhere = await createRoom(t, { hostNickname: "Other host", hostToken: tokenFor(50) });
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      t.mutation(tod.createGame, { roomId: room.roomId, hostParticipantId: elsewhere.hostId, token: tokenFor(50) })
    ).rejects.toThrow(/Not authorised/);
    expect(await t.query(tod.getActiveTruthOrDare, { roomId: room.roomId })).toBeNull();
  });

  test("under enforce someone from another room cannot ask for this room's summary to be posted", async () => {
    const t = newBackend();
    const g = await startGame(t, { tokens: true });
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId, token: g.hostToken });
    const elsewhere = await createRoom(t, { hostNickname: "Other host", hostToken: tokenFor(50) });
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      t.mutation(tod.postSummary, { roomId: g.roomId, participantId: elsewhere.hostId, token: tokenFor(50) })
    ).rejects.toThrow(/Not authorised/);

    // A member's own call is let in, and finds the summary already posted
    await t.mutation(tod.postSummary, { roomId: g.roomId, participantId: g.guests[0], token: g.guestTokens[0] });
    expect(await summaries(t, g.roomId)).toHaveLength(1);
  });

  test("under enforce the host of another room cannot deal, skip or continue this room's game", async () => {
    const t = newBackend();
    const g = await startGame(t, { guests: 2, tokens: true });
    const elsewhere = await createRoom(t, { hostNickname: "Other host", hostToken: tokenFor(50) });
    const intruder = { gameId: g.gameId, participantId: elsewhere.hostId, token: tokenFor(50) };
    const openTurnId = (await view(t, g.roomId)).currentTurn!._id;
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(t.mutation(tod.hostSkipTurn, { ...intruder, turnId: openTurnId })).rejects.toThrow(/Not authorised/);
    expect((await view(t, g.roomId)).currentTurn?._id).toBe(openTurnId);

    await t.mutation(tod.submitChoice, { gameId: g.gameId, participantId: g.guests[0], choice: "truth", token: g.guestTokens[0] });
    await t.mutation(tod.submitResponse, { gameId: g.gameId, participantId: g.guests[0], responseText: "done", token: g.guestTokens[0] });
    await expect(t.mutation(tod.advanceTurn, intruder)).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(tod.acknowledgeRoundBreak, { ...intruder, completedTurns: 1 })).rejects.toThrow(/Not authorised/);

    const game = await view(t, g.roomId);
    expect(game.currentTurn?._id).toBe(openTurnId);
    expect(game.totalTurns).toBe(1);
  });
});

// ─── What clients are sent ───────────────────────────────────────────────────

describe("getActiveTruthOrDare", () => {
  test("a room that never had a game has none, which the route sends as { ok: true }", async () => {
    const t = newBackend();
    const { roomId } = await seatRoom(t);

    expect(await t.query(tod.getActiveTruthOrDare, { roomId })).toBeNull();
    // Installed iOS builds read a body that does not decode as a game as "no game"
    const res = await post(t, "/api/truth-or-dare/active", { roomId });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ ok: true });
  });

  test("the active game is returned ahead of an earlier finished one, and only this room's", async () => {
    const t = newBackend();
    const g = await startGame(t);
    const other = await startGame(t);
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    tick();
    const second = await t.mutation(tod.createGame, { roomId: g.roomId, hostParticipantId: g.hostId });

    const game = await view(t, g.roomId);

    expect(game._id).toBe(second);
    expect(game.status).toBe("active");
    expect(game.completedTurnsList).toEqual([]);
    expect((await view(t, other.roomId))._id).toBe(other.gameId);
  });

  // The host app shows the finished game's results from this
  test("with no game active, the one that finished last is returned", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await playTurns(t, g, 1);
    await t.mutation(tod.endGame, { gameId: g.gameId, participantId: g.hostId });
    vi.advanceTimersByTime(60_000);
    const second = await t.mutation(tod.createGame, { roomId: g.roomId, hostParticipantId: g.hostId });
    vi.advanceTimersByTime(60_000);
    await t.mutation(tod.endGame, { gameId: second, participantId: g.hostId });

    const game = await view(t, g.roomId);

    expect(game._id).toBe(second);
    expect(game.status).toBe("completed");
    expect(game.completedTurns).toBe(0);
  });

  // TruthOrDareGame.swift: a body missing one of these does not decode, which the app reads as "no game"
  test("the active route's body has every field the installed iOS decoder requires", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0]);
    await answer(t, g.gameId, g.seats[0], "ramen");
    const answered = (await view(t, g.roomId)).currentTurn!._id;
    await t.mutation(tod.submitRating, { turnId: answered, participantId: g.hostId, score: 4 });
    await advance(t, g.gameId, g.hostId);

    const { status, json } = await post(t, "/api/truth-or-dare/active", { roomId: g.roomId });

    expect(status).toBe(200);
    expect(json).toMatchObject({
      _id: g.gameId,
      _creationTime: expect.any(Number),
      roomId: g.roomId,
      status: "active",
      hostParticipantId: g.hostId,
      playerOrder: g.seats,
      currentTurnIndex: 1,
      currentTurnParticipantId: g.hostId,
      completedTurns: 1,
      totalTurns: 2,
    });
    expect(json.currentTurn).toMatchObject({
      _id: expect.any(String),
      _creationTime: expect.any(Number),
      gameId: g.gameId,
      turnIndex: 1,
      participantId: g.hostId,
      status: "waiting_for_choice",
    });
    expect(json.completedTurnsList).toEqual([
      expect.objectContaining({
        _id: answered,
        participantId: g.seats[0],
        choice: "truth",
        responseText: "ramen",
        ratings: [{ participantId: g.hostId, score: 4 }],
      }),
    ]);
    expect(json.playerInfo).toEqual([
      { participantId: g.seats[0], nickname: "Aiko", avatarValue: "fox", online: true },
      // Which avatar a host is created with is createRoom's business
      { participantId: g.hostId, nickname: "Host", avatarValue: expect.any(String), online: true },
    ]);
  });

  test("an inline data URL left on a turn from before file storage is not sent to subscribers", async () => {
    const t = newBackend();
    const g = await startGame(t);
    await choose(t, g.gameId, g.seats[0], "dare");
    const turnId = (await view(t, g.roomId)).currentTurn!._id;
    // Only old rows hold one: submitResponse no longer accepts a URL, so the row is written directly
    await t.run(async (ctx) => {
      await ctx.db.patch(turnId, { status: "completed", completedAt: Date.now(), responseMediaUrl: PNG });
    });

    const game = await view(t, g.roomId);

    expect(game.currentTurn?._id).toBe(turnId);
    expect(game.currentTurn?.responseMediaUrl).toBeUndefined();
    expect(JSON.stringify(game)).not.toContain("data:image");
  });
});

// Review bug 1: getRecentTrace returned game and participant ids for every room (deleted in ccda84d)
describe("trace queries", () => {
  test("there is no trace query that is not scoped to a game or a room", async () => {
    const t = newBackend();
    await startGame(t);

    // Whatever words the backend refuses a missing function with
    await expect(t.query((tod as any).getRecentTrace, {})).rejects.toThrow();
    // The module's whole public surface for traces: one query by game, one by room
    const traceExports = Object.keys(truthOrDareModule).filter((name) => /trace/i.test(name));
    expect(traceExports.sort()).toEqual(["getTrace", "getTraceByRoom"]);
    await expect(t.query((tod as any).getTrace, {})).rejects.toThrow();
    await expect(t.query((tod as any).getTraceByRoom, {})).rejects.toThrow();
  });

  test("a room's trace holds only its own game's rows", async () => {
    const t = newBackend();
    const mine = await startGame(t);
    const theirs = await startGame(t);
    await choose(t, mine.gameId, mine.seats[0]);
    await choose(t, theirs.gameId, theirs.seats[0]);

    const byRoom = await t.query(tod.getTraceByRoom, { roomId: mine.roomId });
    const byGame = await t.query(tod.getTrace, { gameId: mine.gameId });

    expect(byRoom.length).toBeGreaterThan(0);
    expect(byRoom.every((row) => row.gameId === mine.gameId)).toBe(true);
    expect(byGame.map((row) => row._id).sort()).toEqual(byRoom.map((row) => row._id).sort());
    expect(JSON.stringify(byRoom)).not.toContain(theirs.seats[0]);
  });
});

// ─── The host app's path ─────────────────────────────────────────────────────

describe("the HTTP routes", () => {
  test("a whole game is played through the routes under enforce, every body carrying callerId and callerToken as the iOS client sends them", async () => {
    const t = newBackend();
    const { roomId, hostId, hostToken, guests, guestTokens } = await seatRoom(t, { tokens: true });
    vi.stubEnv("AUTH_MODE", "enforce");
    const tokenOf = new Map<string, string>([
      [hostId, hostToken!],
      [guests[0], guestTokens[0]!],
    ]);
    const answers: string[] = [];
    const send = async (path: string, actor: PlayerId, body: Record<string, unknown>) => {
      tick();
      const res = await post(t, `/api/truth-or-dare/${path}`, { ...body, callerId: actor, callerToken: tokenOf.get(actor) });
      answers.push(res.text);
      return res;
    };
    const ok = async (path: string, actor: PlayerId, body: Record<string, unknown>) => {
      const res = await send(path, actor, body);
      expect(res.json.error, path).toBeUndefined();
      expect(res.status, path).toBe(200);
      return res.json;
    };
    const active = async () => await ok("active", hostId, { roomId });

    const { gameId } = await ok("create", hostId, { roomId, hostParticipantId: hostId, promptMode: "normal" });
    let game = await active();
    expect(game._id).toBe(gameId);
    const [first, second] = game.playerOrder as PlayerId[];
    expect([first, second].sort()).toEqual([hostId, guests[0]].sort());

    // The first player looks at the prompt and asks for another
    expect(await ok("submit-choice", first, { gameId, participantId: first, choice: "truth" })).toEqual({ ok: true });
    await ok("skip-turn", first, { gameId, participantId: first });
    game = await active();
    expect(game.currentTurn).toMatchObject({ participantId: first, status: "waiting_for_choice" });
    expect(game.totalTurns).toBe(2);

    // Answers, is rated by the other player, and the host app adds its translation
    await ok("submit-choice", first, { gameId, participantId: first, choice: "dare" });
    await ok("submit-response", first, { gameId, participantId: first, responseText: "こんにちは" });
    game = await active();
    const turnId = game.currentTurn._id;
    await ok("submit-rating", second, { turnId, participantId: second, score: 4 });
    await ok("submit-translation", hostId, { turnId, translatedText: "hello" });
    game = await active();
    expect(game.currentTurn).toMatchObject({
      status: "completed",
      choice: "dare",
      responseText: "こんにちは",
      translatedResponseText: "hello",
      ratings: [{ participantId: second, score: 4 }],
    });

    // The next seat is dealt, and the host skips it
    await ok("advance-turn", hostId, { gameId, participantId: hostId });
    game = await active();
    expect(game.currentTurn).toMatchObject({ participantId: second, status: "waiting_for_choice" });
    await ok("host-skip-turn", hostId, { gameId, participantId: hostId, turnId: game.currentTurn._id });
    game = await active();
    expect(game.currentTurn).toMatchObject({ participantId: first, status: "waiting_for_choice" });

    // The first player draws this time
    await ok("submit-choice", first, { gameId, participantId: first, choice: "dare" });
    await ok("submit-response", first, { gameId, participantId: first, responseMediaUrl: PNG });
    game = await active();
    expect(game.currentTurn.status).toBe("completed");
    const [drawing] = await storedFiles(t);
    expect(game.currentTurn.responseMediaUrl).toEqual(expect.any(String));
    expect(game.currentTurn.responseMediaUrl).toBe((await storedFile(t, drawing._id)).url);
    await ok("ack-round-break", hostId, { gameId, participantId: hostId, completedTurns: game.completedTurns });

    await ok("end", hostId, { gameId, participantId: hostId });
    game = await active();
    expect(game.status).toBe("completed");
    expect(game.completedTurns).toBe(2);
    expect(await summaries(t, roomId)).toHaveLength(1);

    // A refusal is a 400 with the reason in `error`
    const late = await send("submit-choice", first, { gameId, participantId: first, choice: "truth" });
    expect(late.status).toBe(400);
    expect(late.json.error).toMatch(/not active/);

    // Nothing any route answered, from the create to the refusal, gives away the stored drawing's id
    expect((await turnRows(t, gameId)).map((row) => row.responseStorageId)).toContain(drawing._id);
    expect(answers).not.toHaveLength(0);
    for (const body of answers) {
      expect(body).not.toContain("responseStorageId");
      expect(body).not.toContain(drawing._id);
    }
  });
});
