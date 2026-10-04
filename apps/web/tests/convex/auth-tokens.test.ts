// Caller tokens (commit 93ed5d0), across every module: registration, the three AUTH_MODE settings, callerId,
// host-only calls, calls from another room, the joinRoom reclaim matrix, the HTTP field names, and secrecy.
//
// The rules under test are in convex/participants.ts (registerToken, requireCaller, requireMember,
// requireHost, joinRoom) and CLAUDE.md ("Caller tokens, no accounts").
//
// What convex-test does not model, and what this file does about it:
// - A stored file has a size and a hash but no content type, so a voice clip cannot be sent here. The
//   send-audio and transcribe routes are only shown to get past the caller check.
// - participantSecrets and hostPushTokens are returned by no function, by design, so what is on record is
//   read with t.run.
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Backend, createRoom, joinGuest, modules, newBackend } from "./setup";

type Pid = Id<"participants">;

// ─── Tokens ──────────────────────────────────────────────────────────────────
// 64 hex characters, as both apps make them. Each repeats one pair, so any part of one is easy to find in a dump.
const hex = (pair: string) => pair.repeat(32);
const HOST = hex("a1");
const GUEST = hex("b2");
const SECOND_GUEST = hex("c3");
const OTHER_HOST = hex("d4");
const OTHER_GUEST = hex("e5");
/** Well formed, on record for nobody */
const NOBODY = hex("f6");
/** An APNs device token: also 64 hex characters, which is why the push route needs its guard */
const APNS = hex("9d");

/** A drawing as the web's offline queue sends it */
const PNG = "data:image/png;base64,iVBORw0KGgo=";
const SETTINGS = {
  sourceLanguage: "ja",
  targetLanguage: "en",
  romajiEnabled: true,
  suggestionsEnabled: true,
  maxParticipants: 7,
};

const MODES = [undefined, "log", "enforce"] as const;
type Mode = (typeof MODES)[number];
const modeName = (mode: string | undefined) => (mode === undefined ? "unset" : `"${mode}"`);
/** Unset is how a deployment starts, and what no-network.ts leaves the tests with */
function setMode(mode: string | undefined) {
  vi.stubEnv("AUTH_MODE", mode);
}

// ─── The log ─────────────────────────────────────────────────────────────────

let warn: MockInstance<typeof console.warn>;
/** Every answer a route gave in this test */
let responses: string[];

beforeEach(() => {
  vi.useFakeTimers();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  // The game modules trace every call
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  responses = [];
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** The lines a failed caller check wrote: "auth: <function> <reason>" */
const authLines = () =>
  warn.mock.calls.map((args) => args.join(" ")).filter((line) => line.startsWith("auth:"));

// ─── What is on record ───────────────────────────────────────────────────────

async function allSecrets(t: Backend) {
  return await t.run(async (ctx) =>
    (await ctx.db.query("participantSecrets").collect()).map(({ participantId, token }) => ({ participantId, token }))
  );
}
async function secretsOf(t: Backend, id: Pid): Promise<string[]> {
  return (await allSecrets(t)).filter((s) => s.participantId === id).map((s) => s.token);
}
async function deviceTokens(t: Backend, roomId: Id<"rooms">): Promise<string[]> {
  return await t.run(async (ctx) =>
    (await ctx.db.query("hostPushTokens").withIndex("by_roomId", (q) => q.eq("roomId", roomId)).collect()).map(
      (row) => row.token
    )
  );
}

/** Not the whole token and not a part of one. Reports which token, never the text searched */
function expectNoToken(text: string, tokens: string[], where: string) {
  for (const token of tokens) {
    expect(text.includes(token), `${where} contains the token ${token.slice(0, 4)}…`).toBe(false);
    expect(text.includes(token.slice(0, 16)), `${where} contains part of the token ${token.slice(0, 4)}…`).toBe(false);
  }
}

// ─── A room ──────────────────────────────────────────────────────────────────

type World = {
  t: Backend;
  roomId: Id<"rooms">;
  joinCode: string;
  hostId: Pid;
  guestId: Pid;
  /** The token on record for a participant; undefined for a legacy one */
  tokenOf: (id: Pid) => string | undefined;
  /** A token that is on record, for the other of the two */
  notTheTokenOf: (id: Pid) => string;
};

/**
 * A host and one guest. Each registered a token, unless `legacy`: then neither did, as builds before tokens.
 * `legacyHost`: only the host did not, as in a room an installed iOS build made and a current web guest joined
 */
async function makeWorld(options: { legacy?: boolean; legacyHost?: boolean } = {}): Promise<World> {
  const t = newBackend();
  const hostToken = options.legacy || options.legacyHost ? undefined : HOST;
  const guestToken = options.legacy ? undefined : GUEST;
  const { roomId, joinCode, hostId } = await createRoom(t, { hostToken });
  const guestId = await joinGuest(t, roomId, "Guest", { token: guestToken });
  return {
    t,
    roomId,
    joinCode,
    hostId,
    guestId,
    tokenOf: (id) => (id === hostId ? hostToken : id === guestId ? guestToken : undefined),
    notTheTokenOf: (id) => (id === hostId ? GUEST : HOST),
  };
}

const roomStatus = async (w: World) => (await w.t.query(api.rooms.getRoomState, { roomId: w.roomId }))?.room.status;
const roomBackground = async (w: World) => (await w.t.query(api.rooms.getRoomState, { roomId: w.roomId }))?.room.background;
/** A background the room does not have, so that a change of it can be seen */
const anotherBackground = async (w: World) => (((await roomBackground(w)) ?? 0) + 1) % 10;
const person = async (w: World, id: Pid) =>
  (await w.t.query(api.participants.getRoomParticipants, { roomId: w.roomId })).find((p) => p._id === id) ?? null;
const countMessages = async (w: World, kind: string) =>
  (await w.t.query(api.messages.getRoomMessages, { roomId: w.roomId })).filter((m) => m.kind === kind).length;
const messageStatus = async (w: World, messageId: Id<"messages">) =>
  (await w.t.query(api.messages.getMessageById, { messageId }))?.status ?? "gone";
const countReactions = async (w: World, messageId: Id<"messages">) =>
  (await w.t.query(api.reactions.getReactionsForMessage, { messageId })).length;

/** Everything below `arrange`s with the right tokens, so it works in whatever mode the test is in */
const say = (w: World, senderId: Pid, text = "hello") =>
  w.t.mutation(api.messages.sendTextMessage, { roomId: w.roomId, senderId, text, token: w.tokenOf(senderId) });

async function startLostInTranslation(w: World) {
  const sessionId = await w.t.mutation(api.games.startGame, {
    roomId: w.roomId,
    participantId: w.hostId,
    gameType: "lost_in_translation",
    token: w.tokenOf(w.hostId),
  });
  for (const id of [w.hostId, w.guestId]) {
    const step = await w.t.query(api.games.getMyActiveStep, { participantId: id });
    if (step) return { sessionId, drawer: id, stepId: step._id };
  }
  throw new Error("Nobody was given the first drawing");
}
const litSession = async (w: World) =>
  (await w.t.query(api.games.getActiveGameSession, { roomId: w.roomId }))?._id ?? null;
const litPhase = async (w: World) => (await w.t.query(api.games.getGameStatus, { roomId: w.roomId }))?.phase ?? null;

const matchLobby = (w: World, by: Pid) =>
  w.t.mutation(api.emojiMatch.createLobby, { roomId: w.roomId, hostParticipantId: by, token: w.tokenOf(by) });
const matchGame = async (w: World, gameId: Id<"emojiMatchGames">) =>
  (await w.t.query(api.emojiMatch.getEmojiMatchById, { gameId }))!;
/** Both in, started. `holder` has the first turn and `waiting` is the other one */
async function twoPlayerMatch(w: World) {
  const gameId = await matchLobby(w, w.hostId);
  await w.t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: w.guestId, token: w.tokenOf(w.guestId) });
  await w.t.mutation(api.emojiMatch.startGame, { gameId, participantId: w.hostId, token: w.tokenOf(w.hostId) });
  const holder = (await matchGame(w, gameId)).currentTurnParticipantId!;
  return { gameId, holder, waiting: holder === w.hostId ? w.guestId : w.hostId };
}

const bingoLobby = (w: World, by: Pid) =>
  w.t.mutation(api.emojiBingo.createLobby, { roomId: w.roomId, hostParticipantId: by, token: w.tokenOf(by) });
const bingoGame = async (w: World, gameId: Id<"emojiBingoGames">) =>
  (await w.t.query(api.emojiBingo.getEmojiBingoById, { gameId }))!;

const truthOrDare = async (w: World) => await w.t.query(api.truthOrDare.getActiveTruthOrDare, { roomId: w.roomId });
async function startTruthOrDare(w: World) {
  const gameId = await w.t.mutation(api.truthOrDare.createGame, {
    roomId: w.roomId,
    hostParticipantId: w.hostId,
    token: w.tokenOf(w.hostId),
  });
  const game = (await truthOrDare(w))!;
  return { gameId, holder: game.currentTurnParticipantId!, turnId: game.currentTurn!._id };
}
/** A turn that has been answered in text, which is what the host app translates */
async function answeredTurn(w: World) {
  const { gameId, holder, turnId } = await startTruthOrDare(w);
  const token = w.tokenOf(holder);
  await w.t.mutation(api.truthOrDare.submitChoice, { gameId, participantId: holder, choice: "truth", token });
  await w.t.mutation(api.truthOrDare.submitResponse, { gameId, participantId: holder, responseText: "an answer", token });
  return { gameId, holder, turnId };
}

const truthOrDareSummaries = async (w: World) =>
  (await w.t.query(api.messages.getRoomMessages, { roomId: w.roomId })).filter((m) =>
    m.text?.startsWith("truth_or_dare_summary:")
  );
/** A finished game whose summary the host then deleted: the one case in which postSummary posts anything */
async function summaryDeleted(w: World) {
  const { gameId } = await startTruthOrDare(w);
  const token = w.tokenOf(w.hostId);
  await w.t.mutation(api.truthOrDare.endGame, { gameId, participantId: w.hostId, token });
  for (const summary of await truthOrDareSummaries(w)) {
    await w.t.mutation(api.messages.deleteMessage, { messageId: summary._id, token });
  }
}
/** Ten turns answered: the round break, where the game waits for the host to continue */
async function atRoundBreak(w: World) {
  const { gameId } = await startTruthOrDare(w);
  for (let answered = 1; answered <= 10; answered++) {
    const holder = (await truthOrDare(w))!.currentTurnParticipantId!;
    const token = w.tokenOf(holder);
    await w.t.mutation(api.truthOrDare.submitChoice, { gameId, participantId: holder, choice: "truth", token });
    await w.t.mutation(api.truthOrDare.submitResponse, { gameId, participantId: holder, responseText: "an answer", token });
    // The newest turn at a seat is the live one, and turns dealt in the same millisecond cannot be told apart
    vi.setSystemTime(Date.now() + 1_000);
    if (answered < 10) {
      await w.t.mutation(api.truthOrDare.advanceTurn, { gameId, participantId: w.hostId, token: w.tokenOf(w.hostId) });
    }
  }
  const game = (await truthOrDare(w))!;
  expect([game.completedTurns, game.roundBreakAckedTurns]).toEqual([10, undefined]);
  return gameId;
}

const wordRushLobby = (w: World, by: Pid) =>
  w.t.mutation(api.wordRush.createLobby, { roomId: w.roomId, hostParticipantId: by, token: w.tokenOf(by) });
const wordRush = async (w: World) => await w.t.query(api.wordRush.getState, { roomId: w.roomId });

// ═════════════════════════════════════════════════════════════════════════════
// Registration
// ═════════════════════════════════════════════════════════════════════════════

const WELL_FORMED: Array<[string, string]> = [
  ["43 base64url characters, which is 32 random bytes", "AZaz09_-".repeat(5) + "AZa"],
  ["64 hex characters", hex("0f")],
  ["128 characters, the longest", "x".repeat(128)],
];
const MALFORMED: Array<[string, string]> = [
  ["empty", ""],
  ["42 characters, one too few", "a".repeat(42)],
  ["129 characters, one too many", "a".repeat(129)],
  ["standard base64, with + / and =", "ab+/".repeat(10) + "abc="],
  ["a space inside", "a".repeat(32) + " " + "a".repeat(31)],
  ["a newline at the end", "a".repeat(64) + "\n"],
  ["letters outside ASCII", "é".repeat(64)],
];

describe("registering a token", () => {
  test("createRoom keeps hostToken for the host and answers with the room, its join code and the host, not the token", async () => {
    const t = newBackend();
    const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Host", hostToken: HOST });
    expect(created).toMatchObject({ roomId: expect.any(String), joinCode: expect.any(String), hostId: expect.any(String) });
    expectNoToken(JSON.stringify(created), [HOST], "createRoom's answer");
    expect(await allSecrets(t)).toEqual([{ participantId: created.hostId, token: HOST }]);
  });

  test("joinRoom keeps token for the new participant and returns only its id", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t, { hostToken: HOST });
    const guestId = await t.mutation(api.participants.joinRoom, {
      roomId,
      nickname: "Guest",
      platform: "web",
      avatar: { type: "preset", value: "fox" },
      preferredLanguage: "en",
      token: GUEST,
    });
    expect(typeof guestId).toBe("string");
    expect(await allSecrets(t)).toEqual([
      { participantId: hostId, token: HOST },
      { participantId: guestId, token: GUEST },
    ]);
  });

  test("a host or a guest made without a token has no secret: a legacy participant", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    await joinGuest(t, roomId, "Guest");
    expect(await allSecrets(t)).toEqual([]);
  });

  test.each(WELL_FORMED)("a token of %s is accepted from a host and from a guest", async (_what, token) => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t, { hostToken: token });
    const guestId = await joinGuest(t, roomId, "Guest", { token });
    expect(await secretsOf(t, hostId)).toEqual([token]);
    expect(await secretsOf(t, guestId)).toEqual([token]);
  });

  test("createRoom refuses a malformed hostToken and makes no room, rather than a host with no protection", async () => {
    const t = newBackend();
    for (const [what, token] of MALFORMED) {
      await expect(createRoom(t, { hostToken: token }), what).rejects.toThrow(/Invalid token/);
    }
    const made = await t.run(async (ctx) => ({
      rooms: (await ctx.db.query("rooms").collect()).length,
      participants: (await ctx.db.query("participants").collect()).length,
      secrets: (await ctx.db.query("participantSecrets").collect()).length,
    }));
    expect(made).toEqual({ rooms: 0, participants: 0, secrets: 0 });
  });

  test("joinRoom refuses a malformed token and adds nobody to the room", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    for (const [what, token] of MALFORMED) {
      await expect(joinGuest(t, roomId, "Guest", { token }), what).rejects.toThrow(/Invalid token/);
    }
    const state = await t.query(api.rooms.getRoomState, { roomId });
    expect(state?.participants.map((p) => p._id)).toEqual([hostId]);
    // The join that was refused did not start the conversation either
    expect(state?.room.status).toBe("waiting");
    expect(await allSecrets(t)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// What a failed check does, in each mode, in every module
// ═════════════════════════════════════════════════════════════════════════════

type GateCase<D> = {
  /** module.function, which is also what the log line calls it */
  fn: string;
  /** The name in the log line when the check is made by another function than the one called */
  label?: string;
  /** Brings the room to where the call can succeed, and says whose call it is */
  arrange: (w: World) => Promise<{ actor: Pid; data: D }>;
  act: (w: World, token: string | undefined, data: D, actor: Pid) => Promise<unknown>;
  /** Something a client can read that changes when the call takes effect */
  observe: (w: World, data: D) => Promise<unknown>;
};
function gate<D>(c: GateCase<D>): GateCase<any> {
  return c;
}

const GATED: GateCase<any>[] = [
  // ── rooms ──
  gate({
    fn: "rooms.closeRoom",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    // No callerId, as installed iOS builds call it: the room's own host is assumed
    act: (w, token) => w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token }),
    observe: roomStatus,
  }),
  gate({
    fn: "rooms.updateRoomSettings",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.rooms.updateRoomSettings, { roomId: w.roomId, settings: SETTINGS, callerId: w.hostId, token }),
    observe: async (w) => (await w.t.query(api.rooms.getRoomState, { roomId: w.roomId }))?.room.settings.maxParticipants,
  }),
  gate({
    fn: "rooms.setRoomBackground",
    arrange: async (w) => ({ actor: w.hostId, data: await anotherBackground(w) }),
    act: (w, token, background) =>
      w.t.mutation(api.rooms.setRoomBackground, { roomId: w.roomId, background, callerId: w.hostId, token }),
    observe: roomBackground,
  }),

  // ── participants ──
  gate({
    fn: "participants.setParticipantOnline",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    // The heartbeat both apps send every 15 s
    act: (w, token) =>
      w.t.mutation(api.participants.setParticipantOnline, { participantId: w.hostId, online: true, presence: "away", token }),
    observe: async (w) => (await person(w, w.hostId))?.presence ?? null,
  }),
  gate({
    fn: "participants.setTypingAction",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.participants.setTypingAction, { participantId: w.guestId, action: "typing", token }),
    observe: async (w) => (await person(w, w.guestId))?.typingAction ?? null,
  }),
  gate({
    fn: "participants.updateParticipantNickname",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.participants.updateParticipantNickname, { participantId: w.guestId, nickname: "Renamed", token }),
    observe: async (w) => (await person(w, w.guestId))?.nickname,
  }),
  gate({
    fn: "participants.updateParticipantAvatar",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.participants.updateParticipantAvatar, {
        participantId: w.guestId,
        avatar: { type: "preset", value: "owl" },
        token,
      }),
    observe: async (w) => (await person(w, w.guestId))?.avatar.value,
  }),
  gate({
    fn: "participants.updateDisplaySettings",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.participants.updateDisplaySettings, {
        participantId: w.guestId,
        displaySettings: { showEnglish: true, showJapanese: false, showRomaji: true },
        token,
      }),
    observe: async (w) => (await person(w, w.guestId))?.displaySettings ?? null,
  }),
  gate({
    fn: "participants.updateParticipantLanguage",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.participants.updateParticipantLanguage, { participantId: w.guestId, language: "ja", token }),
    observe: async (w) => (await person(w, w.guestId))?.preferredLanguage,
  }),
  gate({
    fn: "participants.leaveRoom",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.participants.leaveRoom, { participantId: w.guestId, token }),
    observe: async (w) => (await person(w, w.guestId))?.online,
  }),
  gate({
    fn: "participants.kickParticipant",
    arrange: async (w) => ({ actor: w.hostId, data: await joinGuest(w.t, w.roomId, "Victim", { avatar: "owl" }) }),
    act: (w, token, victim) => w.t.mutation(api.participants.kickParticipant, { participantId: victim, roomId: w.roomId, token }),
    observe: async (w, victim) => (await person(w, victim)) !== null,
  }),
  gate({
    fn: "participants.setHostPushToken",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    // Here alone `token` is the APNs device token and the caller's own is callerToken
    act: (w, token) =>
      w.t.mutation(api.participants.setHostPushToken, { roomId: w.roomId, hostId: w.hostId, token: APNS, callerToken: token }),
    observe: (w) => deviceTokens(w.t, w.roomId),
  }),

  // ── messages ──
  gate({
    fn: "messages.sendTextMessage",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.messages.sendTextMessage, { roomId: w.roomId, senderId: w.guestId, text: "hello", token }),
    observe: (w) => countMessages(w, "text"),
  }),
  gate({
    fn: "messages.sendDrawingMessage",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.messages.sendDrawingMessage, { roomId: w.roomId, senderId: w.guestId, mediaUrl: PNG, token }),
    observe: (w) => countMessages(w, "drawing"),
  }),
  gate({
    fn: "messages.submitProcessedMessage",
    arrange: async (w) => ({ actor: w.hostId, data: await say(w, w.guestId) }),
    // The message processor of installed iOS builds names no caller
    act: (w, token, messageId) =>
      w.t.mutation(api.messages.submitProcessedMessage, { messageId, processing: { translatedText: "こんにちは" }, token }),
    observe: messageStatus,
  }),
  gate({
    fn: "messages.deleteMessage",
    arrange: async (w) => ({ actor: w.hostId, data: await say(w, w.guestId) }),
    act: (w, token, messageId) => w.t.mutation(api.messages.deleteMessage, { messageId, callerId: w.hostId, token }),
    observe: messageStatus,
  }),

  // ── reactions ──
  gate({
    fn: "reactions.addReaction",
    arrange: async (w) => ({ actor: w.guestId, data: await say(w, w.hostId) }),
    act: (w, token, messageId) =>
      w.t.mutation(api.reactions.addReaction, { messageId, participantId: w.guestId, emoji: "👍", token }),
    observe: countReactions,
  }),
  gate({
    fn: "reactions.removeReaction",
    arrange: async (w) => {
      const messageId = await say(w, w.hostId);
      await w.t.mutation(api.reactions.addReaction, {
        messageId,
        participantId: w.guestId,
        emoji: "👍",
        token: w.tokenOf(w.guestId),
      });
      return { actor: w.guestId, data: messageId };
    },
    act: (w, token, messageId) =>
      w.t.mutation(api.reactions.removeReaction, { messageId, participantId: w.guestId, emoji: "👍", token }),
    observe: countReactions,
  }),

  // ── games (Lost in Translation) ──
  gate({
    fn: "games.startGame",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    act: (w, token) =>
      w.t.mutation(api.games.startGame, { roomId: w.roomId, participantId: w.hostId, gameType: "lost_in_translation", token }),
    observe: litSession,
  }),
  gate({
    fn: "games.cancelGame",
    arrange: async (w) => {
      await startLostInTranslation(w);
      return { actor: w.hostId, data: null };
    },
    act: (w, token) => w.t.mutation(api.games.cancelGame, { roomId: w.roomId, participantId: w.hostId, token }),
    observe: litSession,
  }),
  gate({
    // The action both apps call; it hands the token to the mutation, which makes the check
    fn: "games.submitGameStepWithTranslation",
    label: "games.submitGameStep",
    arrange: async (w) => {
      const { drawer, stepId } = await startLostInTranslation(w);
      return { actor: drawer, data: stepId };
    },
    act: (w, token, stepId, drawer) =>
      w.t.action(api.games.submitGameStepWithTranslation, { stepId, participantId: drawer, outputDrawingUrl: PNG, token }),
    observe: litPhase,
  }),

  // ── emojiMatch ──
  gate({
    fn: "emojiMatch.createLobby",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.emojiMatch.createLobby, { roomId: w.roomId, hostParticipantId: w.guestId, token }),
    observe: async (w) => (await w.t.query(api.emojiMatch.getActiveEmojiMatch, { roomId: w.roomId }))?._id ?? null,
  }),
  gate({
    fn: "emojiMatch.joinLobby",
    arrange: async (w) => ({ actor: w.guestId, data: await matchLobby(w, w.hostId) }),
    act: (w, token, gameId) => w.t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: w.guestId, token }),
    observe: async (w, gameId) => (await matchGame(w, gameId)).players.length,
  }),
  gate({
    fn: "emojiMatch.flipCard",
    arrange: async (w) => {
      // A game of one: the host has every turn
      const gameId = await matchLobby(w, w.hostId);
      await w.t.mutation(api.emojiMatch.startGame, { gameId, participantId: w.hostId, token: w.tokenOf(w.hostId) });
      return { actor: w.hostId, data: gameId };
    },
    act: (w, token, gameId) =>
      w.t.mutation(api.emojiMatch.flipCard, { gameId, participantId: w.hostId, cardId: "card_0", token }),
    observe: async (w, gameId) => (await matchGame(w, gameId)).selectedCardIds,
  }),

  // ── emojiBingo ──
  gate({
    fn: "emojiBingo.createLobby",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    act: (w, token) => w.t.mutation(api.emojiBingo.createLobby, { roomId: w.roomId, hostParticipantId: w.hostId, token }),
    observe: async (w) => (await w.t.query(api.emojiBingo.getActiveEmojiBingo, { roomId: w.roomId }))?._id ?? null,
  }),
  gate({
    fn: "emojiBingo.joinLobby",
    arrange: async (w) => ({ actor: w.guestId, data: await bingoLobby(w, w.hostId) }),
    act: (w, token, gameId) => w.t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: w.guestId, token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).players.length,
  }),
  gate({
    fn: "emojiBingo.updateSettings",
    arrange: async (w) => ({ actor: w.hostId, data: await bingoLobby(w, w.hostId) }),
    act: (w, token, gameId) =>
      w.t.mutation(api.emojiBingo.updateSettings, { gameId, participantId: w.hostId, winPattern: "blackout", token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).winPattern,
  }),
  gate({
    fn: "emojiBingo.rollEmoji",
    arrange: async (w) => {
      const gameId = await bingoLobby(w, w.hostId);
      await w.t.mutation(api.emojiBingo.startGame, { gameId, participantId: w.hostId, token: w.tokenOf(w.hostId) });
      return { actor: w.hostId, data: gameId };
    },
    act: (w, token, gameId) => w.t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: w.hostId, token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).drawIndex,
  }),

  // ── truthOrDare ──
  gate({
    fn: "truthOrDare.createGame",
    arrange: async (w) => ({ actor: w.hostId, data: null }),
    act: (w, token) => w.t.mutation(api.truthOrDare.createGame, { roomId: w.roomId, hostParticipantId: w.hostId, token }),
    observe: async (w) => (await truthOrDare(w))?._id ?? null,
  }),
  gate({
    fn: "truthOrDare.submitChoice",
    arrange: async (w) => {
      const { gameId, holder } = await startTruthOrDare(w);
      return { actor: holder, data: gameId };
    },
    act: (w, token, gameId, holder) =>
      w.t.mutation(api.truthOrDare.submitChoice, { gameId, participantId: holder, choice: "truth", token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?.status,
  }),
  gate({
    fn: "truthOrDare.submitTranslation",
    arrange: async (w) => ({ actor: w.hostId, data: (await answeredTurn(w)).turnId }),
    // The host app names no caller here either
    act: (w, token, turnId) => w.t.mutation(api.truthOrDare.submitTranslation, { turnId, translatedText: "答え", token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?.translatedResponseText ?? null,
  }),
  gate({
    fn: "truthOrDare.postSummary",
    arrange: async (w) => {
      await summaryDeleted(w);
      return { actor: w.guestId, data: null };
    },
    act: (w, token) => w.t.mutation(api.truthOrDare.postSummary, { roomId: w.roomId, participantId: w.guestId, token }),
    observe: async (w) => (await truthOrDareSummaries(w)).length,
  }),

  // ── wordRush ──
  gate({
    fn: "wordRush.createLobby",
    arrange: async (w) => ({ actor: w.guestId, data: null }),
    act: (w, token) => w.t.mutation(api.wordRush.createLobby, { roomId: w.roomId, hostParticipantId: w.guestId, token }),
    observe: async (w) => (await wordRush(w))?._id ?? null,
  }),
  gate({
    fn: "wordRush.joinLobby",
    arrange: async (w) => ({ actor: w.guestId, data: await wordRushLobby(w, w.hostId) }),
    act: (w, token, gameId) => w.t.mutation(api.wordRush.joinLobby, { gameId, participantId: w.guestId, token }),
    observe: async (w) => (await wordRush(w))?.players.length,
  }),
  gate({
    fn: "wordRush.cancel",
    arrange: async (w) => ({ actor: w.hostId, data: await wordRushLobby(w, w.hostId) }),
    act: (w, token, gameId) => w.t.mutation(api.wordRush.cancel, { gameId, participantId: w.hostId, token }),
    observe: async (w) => (await wordRush(w))?.status ?? null,
  }),
];

const MODULES = [...new Set(GATED.map((c) => c.fn.split(".")[0]))];

describe("a call for a participant who registered a token", () => {
  // Guards the tests below, and the legacy ones after them, against a table that has lost a module
  test("the table has at least two functions from each of the nine modules", () => {
    const perModule = MODULES.map((module) => [module, GATED.filter((c) => c.fn.startsWith(`${module}.`)).length] as const);
    expect(perModule.map(([module]) => module).sort()).toEqual([
      "emojiBingo",
      "emojiMatch",
      "games",
      "messages",
      "participants",
      "reactions",
      "rooms",
      "truthOrDare",
      "wordRush",
    ]);
    for (const [module, count] of perModule) expect(count, module).toBeGreaterThanOrEqual(2);
  });

  for (const c of GATED) describe(c.fn, () => {
    const label = c.label ?? c.fn;

    test("AUTH_MODE unset or log: without the token, or with someone else's, the call is logged and goes through", async () => {
      for (const mode of [undefined, "log"] as const) {
        for (const missing of [true, false]) {
          const where = `AUTH_MODE ${modeName(mode)}, ${missing ? "no token" : "another participant's token"}`;
          setMode(undefined);
          const w = await makeWorld();
          const { actor, data } = await c.arrange(w);
          const before = await c.observe(w, data);
          setMode(mode);
          warn.mockClear();

          await c.act(w, missing ? undefined : w.notTheTokenOf(actor), data, actor);

          expect(authLines(), where).toEqual([`auth: ${label} ${missing ? "no token" : "wrong token"}`]);
          expect(await c.observe(w, data), where).not.toEqual(before);
        }
      }
    });

    test("AUTH_MODE enforce: without the token, or with any other, the call is refused and changes nothing; with it, it goes through", async () => {
      const w = await makeWorld();
      const { actor, data } = await c.arrange(w);
      const before = await c.observe(w, data);
      setMode("enforce");
      warn.mockClear();

      await expect(c.act(w, undefined, data, actor), "no token").rejects.toThrow(/Not authorised/);
      await expect(c.act(w, w.notTheTokenOf(actor), data, actor), "another participant's token").rejects.toThrow(/Not authorised/);
      await expect(c.act(w, NOBODY, data, actor), "a token nobody registered").rejects.toThrow(/Not authorised/);
      // The same lines log mode writes, so a log-mode deployment's log lists exactly what enforce refuses
      expect(authLines()).toEqual([`auth: ${label} no token`, `auth: ${label} wrong token`, `auth: ${label} wrong token`]);
      expect(await c.observe(w, data)).toEqual(before);

      warn.mockClear();
      await c.act(w, w.tokenOf(actor), data, actor);
      expect(authLines()).toEqual([]);
      expect(await c.observe(w, data)).not.toEqual(before);
    });
  });
});

describe("a legacy participant, made before tokens, is asked for none", () => {
  test.each(MODULES)("%s: its calls go through with no token and no log line, in every mode", async (module) => {
    for (const c of GATED.filter((c) => c.fn.startsWith(`${module}.`))) {
      for (const mode of MODES) {
        const where = `${c.fn}, AUTH_MODE ${modeName(mode)}`;
        setMode(undefined);
        const w = await makeWorld({ legacy: true });
        const { actor, data } = await c.arrange(w);
        const before = await c.observe(w, data);
        setMode(mode);
        warn.mockClear();

        await c.act(w, undefined, data, actor);

        expect(authLines(), where).toEqual([]);
        expect(await c.observe(w, data), where).not.toEqual(before);
      }
    }
  });

  test("enforce: a token sent for a legacy participant has nothing to be checked against, and is not", async () => {
    for (const c of GATED) {
      setMode(undefined);
      const w = await makeWorld({ legacy: true });
      const { actor, data } = await c.arrange(w);
      const before = await c.observe(w, data);
      setMode("enforce");
      warn.mockClear();

      await c.act(w, NOBODY, data, actor);

      expect(authLines(), c.fn).toEqual([]);
      expect(await c.observe(w, data), c.fn).not.toEqual(before);
    }
  });
});

describe("the mode and the comparison", () => {
  test("only the exact value enforce enforces: any other AUTH_MODE logs the call and lets it through", async () => {
    for (const value of ["log", "Enforce", "ENFORCE", " enforce", "enforced", "true", "1", ""]) {
      setMode(undefined);
      const w = await makeWorld();
      setMode(value);
      warn.mockClear();
      await w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId });
      expect(authLines(), `AUTH_MODE=${JSON.stringify(value)}`).toEqual(["auth: rooms.closeRoom no token"]);
      expect(await roomStatus(w), `AUTH_MODE=${JSON.stringify(value)}`).toBe("closed");
    }
  });

  test("enforce: only the token exactly as registered passes: not a part of it, not more than it, not another case", async () => {
    const w = await makeWorld();
    setMode("enforce");
    const nearly = [
      // The right length with one character wrong: the first, one in the middle, the last
      `b${HOST.slice(1)}`,
      `${HOST.slice(0, 40)}f${HOST.slice(41)}`,
      `${HOST.slice(0, 63)}2`,
      HOST.slice(0, 63),
      HOST.slice(1),
      `${HOST}a1`,
      HOST.toUpperCase(),
      ` ${HOST}`,
      `${HOST} `,
      `${HOST}\n`,
      "",
      "x",
    ];
    for (const token of nearly) {
      await expect(
        w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token }),
        JSON.stringify(token)
      ).rejects.toThrow(/Not authorised/);
    }
    expect(await roomStatus(w)).toBe("active");
    await w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token: HOST });
    expect(await roomStatus(w)).toBe("closed");
  });

  test("a refusal gives nothing away: neither the error nor the log line holds the token on record or the one tried", async () => {
    const w = await makeWorld();
    setMode("enforce");
    const error: Error = await w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token: NOBODY }).then(
      () => new Error("the call went through"),
      (e) => e
    );
    expect(error.message).toMatch(/Not authorised/);
    const said = [error.message, String(error.stack), ...warn.mock.calls.map((args) => args.join(" "))].join("\n");
    expectNoToken(said, [HOST, GUEST, NOBODY], "the refusal");
  });

  test("enforce: a participant who does not exist, or no longer does, cannot be called for", async () => {
    const w = await makeWorld();
    const goneId = await joinGuest(w.t, w.roomId, "Gone", { avatar: "owl", token: SECOND_GUEST });
    await w.t.mutation(api.participants.kickParticipant, { participantId: goneId, roomId: w.roomId, token: HOST });
    setMode("enforce");
    warn.mockClear();
    await expect(
      w.t.mutation(api.messages.sendTextMessage, { roomId: w.roomId, senderId: goneId, text: "still here", token: SECOND_GUEST })
    ).rejects.toThrow(/Not authorised/);
    // Named as the host-only caller, too
    await expect(w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, callerId: goneId, token: SECOND_GUEST })).rejects.toThrow(
      /Not authorised/
    );
    expect(authLines()).toEqual([
      "auth: messages.sendTextMessage unknown participant",
      "auth: rooms.closeRoom unknown participant",
    ]);
    expect(await countMessages(w, "text")).toBe(0);
    expect(await roomStatus(w)).toBe("active");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// callerId: who is calling, where it is not the participant the call is about
// ═════════════════════════════════════════════════════════════════════════════

const UPLOAD_URLS: Array<[string, (t: Backend, args: { callerId?: Pid; token?: string }) => Promise<string>]> = [
  ["messages.generateUploadUrl", (t, args) => t.mutation(api.messages.generateUploadUrl, args)],
  ["wordRush.generateClipUploadUrl", (t, args) => t.mutation(api.wordRush.generateClipUploadUrl, args)],
];

describe.each(UPLOAD_URLS)("%s", (label, generate) => {
  test("enforce: a caller who names nobody gets a URL, as installed builds do; one who names itself needs its token", async () => {
    const w = await makeWorld();
    setMode("enforce");
    expect(await generate(w.t, {})).toEqual(expect.any(String));
    await expect(generate(w.t, { callerId: w.guestId }), "named, no token").rejects.toThrow(/Not authorised/);
    await expect(generate(w.t, { callerId: w.guestId, token: HOST }), "named, the host's token").rejects.toThrow(/Not authorised/);
    expect(await generate(w.t, { callerId: w.guestId, token: GUEST })).toEqual(expect.any(String));
  });

  test("unset or log: a named caller without its token gets the URL and a log line", async () => {
    for (const mode of [undefined, "log"] as const) {
      setMode(undefined);
      const w = await makeWorld();
      setMode(mode);
      warn.mockClear();
      expect(await generate(w.t, { callerId: w.guestId }), modeName(mode)).toEqual(expect.any(String));
      expect(authLines(), modeName(mode)).toEqual([`auth: ${label} no token`]);
    }
  });

  test("a caller who names itself gets no URL once its room has closed, with the right token or without a mode", async () => {
    const w = await makeWorld();
    await w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token: HOST });
    for (const mode of MODES) {
      setMode(mode);
      await expect(generate(w.t, { callerId: w.guestId, token: GUEST }), modeName(mode)).rejects.toThrow(/Room is closed/);
    }
  });
});

describe("emojiMatch.timeoutTurn: participantId is whose turn ran out, callerId is who says so", () => {
  const turn = async (w: World, gameId: Id<"emojiMatchGames">) => (await matchGame(w, gameId)).currentTurnParticipantId;

  test("enforce: the token is checked against callerId, so the turn holder's own token does not speak for the caller", async () => {
    const w = await makeWorld();
    const { gameId, holder, waiting } = await twoPlayerMatch(w);
    // The turn's 15 s are up; the server's own timer has not run
    vi.setSystemTime(Date.now() + 15_000);
    setMode("enforce");
    const call = { gameId, participantId: holder, callerId: waiting };

    await expect(w.t.mutation(api.emojiMatch.timeoutTurn, call), "no token").rejects.toThrow(/Not authorised/);
    await expect(
      w.t.mutation(api.emojiMatch.timeoutTurn, { ...call, token: w.tokenOf(holder) }),
      "the turn holder's token"
    ).rejects.toThrow(/Not authorised/);
    expect(await turn(w, gameId)).toBe(holder);

    await w.t.mutation(api.emojiMatch.timeoutTurn, { ...call, token: w.tokenOf(waiting) });
    expect(await turn(w, gameId)).toBe(waiting);
  });

  test("enforce: a caller who names nobody is let through, as web tabs and builds from before tokens call it", async () => {
    const w = await makeWorld();
    const { gameId, holder, waiting } = await twoPlayerMatch(w);
    vi.setSystemTime(Date.now() + 15_000);
    setMode("enforce");
    warn.mockClear();
    await w.t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: holder });
    expect(await turn(w, gameId)).toBe(waiting);
    expect(authLines()).toEqual([]);
  });

  test("enforce: naming nobody does nothing the server was not about to do: a turn with time left is not ended", async () => {
    const w = await makeWorld();
    const { gameId, holder } = await twoPlayerMatch(w);
    vi.setSystemTime(Date.now() + 5_000);
    setMode("enforce");
    await w.t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: holder });
    expect(await turn(w, gameId)).toBe(holder);
  });

  test("unset or log: a caller who names itself without its token ends the turn, and the call is logged", async () => {
    for (const mode of [undefined, "log"] as const) {
      setMode(undefined);
      const w = await makeWorld();
      const { gameId, holder, waiting } = await twoPlayerMatch(w);
      vi.setSystemTime(Date.now() + 15_000);
      setMode(mode);
      warn.mockClear();
      await w.t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: holder, callerId: waiting });
      expect(authLines(), modeName(mode)).toEqual(["auth: emojiMatch.timeoutTurn no token"]);
      expect(await turn(w, gameId), modeName(mode)).toBe(waiting);
    }
  });
});

describe("emojiMatch.resolveMismatch: callerId is who is calling", () => {
  /** The turn holder turns up two cards that do not match; the reveal has run its 1.2 s */
  async function mismatchShown(w: World) {
    const { gameId, holder, waiting } = await twoPlayerMatch(w);
    // The pairs are read from the stored board: the query sends a face-down card without its pairKey
    const board = (await w.t.run(async (ctx) => await ctx.db.get(gameId)))!.board;
    const second = board.find((card) => card.pairKey !== board[0].pairKey)!;
    for (const card of [board[0], second]) {
      await w.t.mutation(api.emojiMatch.flipCard, { gameId, participantId: holder, cardId: card.cardId, token: w.tokenOf(holder) });
    }
    expect((await matchGame(w, gameId)).status).toBe("resolving");
    vi.setSystemTime(Date.now() + 1_300);
    return { gameId, holder, waiting };
  }

  test("enforce: a caller who names itself needs its token", async () => {
    const w = await makeWorld();
    const { gameId, holder, waiting } = await mismatchShown(w);
    setMode("enforce");
    await expect(w.t.mutation(api.emojiMatch.resolveMismatch, { gameId, callerId: waiting })).rejects.toThrow(/Not authorised/);
    await expect(
      w.t.mutation(api.emojiMatch.resolveMismatch, { gameId, callerId: waiting, token: w.tokenOf(holder) })
    ).rejects.toThrow(/Not authorised/);
    expect((await matchGame(w, gameId)).status).toBe("resolving");

    await w.t.mutation(api.emojiMatch.resolveMismatch, { gameId, callerId: waiting, token: w.tokenOf(waiting) });
    const game = await matchGame(w, gameId);
    expect([game.status, game.currentTurnParticipantId]).toEqual(["active", waiting]);
  });

  test("enforce: a caller who names nobody is let through", async () => {
    const w = await makeWorld();
    const { gameId, waiting } = await mismatchShown(w);
    setMode("enforce");
    await w.t.mutation(api.emojiMatch.resolveMismatch, { gameId });
    const game = await matchGame(w, gameId);
    expect([game.status, game.currentTurnParticipantId]).toEqual(["active", waiting]);
  });

  test("unset or log: a caller who names itself without its token resolves the mismatch, and the call is logged", async () => {
    for (const mode of [undefined, "log"] as const) {
      setMode(undefined);
      const w = await makeWorld();
      const { gameId, waiting } = await mismatchShown(w);
      setMode(mode);
      warn.mockClear();
      await w.t.mutation(api.emojiMatch.resolveMismatch, { gameId, callerId: waiting });
      expect(authLines(), modeName(mode)).toEqual(["auth: emojiMatch.resolveMismatch no token"]);
      const game = await matchGame(w, gameId);
      expect([game.status, game.currentTurnParticipantId], modeName(mode)).toEqual(["active", waiting]);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Host-only calls
// ═════════════════════════════════════════════════════════════════════════════

type HostOnlyCase<D> = {
  fn: string;
  arrange?: (w: World) => Promise<D>;
  /** The call `caller` makes in its own name, presenting `token` */
  act: (w: World, caller: Pid, token: string | undefined, data: D) => Promise<unknown>;
  observe: (w: World, data: D) => Promise<unknown>;
  /** What a guest who names itself is told. A rule older than tokens answers in its own words */
  toldAsItself?: RegExp;
};
function hostOnly<D>(c: HostOnlyCase<D>): HostOnlyCase<any> {
  return c;
}

const HOST_ONLY: HostOnlyCase<any>[] = [
  hostOnly({
    fn: "rooms.closeRoom",
    act: (w, caller, token) => w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, callerId: caller, token }),
    observe: roomStatus,
  }),
  hostOnly({
    fn: "rooms.updateRoomSettings",
    act: (w, caller, token) =>
      w.t.mutation(api.rooms.updateRoomSettings, { roomId: w.roomId, settings: SETTINGS, callerId: caller, token }),
    observe: async (w) => (await w.t.query(api.rooms.getRoomState, { roomId: w.roomId }))?.room.settings.maxParticipants,
  }),
  hostOnly({
    fn: "rooms.setRoomBackground",
    arrange: anotherBackground,
    act: (w, caller, token, background) =>
      w.t.mutation(api.rooms.setRoomBackground, { roomId: w.roomId, background, callerId: caller, token }),
    observe: roomBackground,
  }),
  hostOnly({
    fn: "participants.kickParticipant",
    arrange: (w) => joinGuest(w.t, w.roomId, "Victim", { avatar: "owl" }),
    act: (w, caller, token, victim) =>
      w.t.mutation(api.participants.kickParticipant, { participantId: victim, roomId: w.roomId, callerId: caller, token }),
    observe: async (w, victim) => (await person(w, victim)) !== null,
  }),
  hostOnly({
    fn: "participants.setHostPushToken",
    act: (w, caller, token) =>
      w.t.mutation(api.participants.setHostPushToken, { roomId: w.roomId, hostId: caller, token: APNS, callerToken: token }),
    observe: (w) => deviceTokens(w.t, w.roomId),
    toldAsItself: /Only the host can register/,
  }),
  hostOnly({
    fn: "messages.submitProcessedMessage",
    arrange: (w) => say(w, w.guestId),
    act: (w, caller, token, messageId) =>
      w.t.mutation(api.messages.submitProcessedMessage, {
        messageId,
        processing: { translatedText: "not what was said" },
        callerId: caller,
        token,
      }),
    observe: async (w, messageId) => (await w.t.query(api.messages.getMessageById, { messageId }))?.processing ?? null,
  }),
  hostOnly({
    fn: "messages.markMessageFailed",
    arrange: (w) => say(w, w.guestId),
    act: (w, caller, token, messageId) =>
      w.t.mutation(api.messages.markMessageFailed, { messageId, error: "no", callerId: caller, token }),
    observe: messageStatus,
  }),
  hostOnly({
    fn: "messages.deleteMessage",
    // The guest's own message: deleting is the host's alone
    arrange: (w) => say(w, w.guestId),
    act: (w, caller, token, messageId) => w.t.mutation(api.messages.deleteMessage, { messageId, callerId: caller, token }),
    observe: messageStatus,
  }),
  hostOnly({
    fn: "games.startGame",
    act: (w, caller, token) =>
      w.t.mutation(api.games.startGame, { roomId: w.roomId, participantId: caller, gameType: "lost_in_translation", token }),
    observe: litSession,
    toldAsItself: /Only the host can start a game/,
  }),
  hostOnly({
    fn: "games.cancelGame",
    arrange: startLostInTranslation,
    act: (w, caller, token) => w.t.mutation(api.games.cancelGame, { roomId: w.roomId, participantId: caller, token }),
    observe: litSession,
    toldAsItself: /Only the host can cancel a game/,
  }),
  hostOnly({
    fn: "truthOrDare.submitTranslation",
    arrange: async (w) => (await answeredTurn(w)).turnId,
    act: (w, caller, token, turnId) =>
      w.t.mutation(api.truthOrDare.submitTranslation, { turnId, translatedText: "答え", callerId: caller, token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?.translatedResponseText ?? null,
  }),
  hostOnly({
    fn: "truthOrDare.endGame",
    arrange: async (w) => (await startTruthOrDare(w)).gameId,
    act: (w, caller, token, gameId) => w.t.mutation(api.truthOrDare.endGame, { gameId, participantId: caller, token }),
    observe: async (w) => (await truthOrDare(w))?.status,
  }),
  hostOnly({
    fn: "emojiBingo.cancelGame",
    arrange: (w) => bingoLobby(w, w.hostId),
    act: (w, caller, token, gameId) => w.t.mutation(api.emojiBingo.cancelGame, { gameId, participantId: caller, token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).status,
  }),
  hostOnly({
    fn: "emojiMatch.cancelGame",
    arrange: (w) => matchLobby(w, w.hostId),
    act: (w, caller, token, gameId) => w.t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: caller, token }),
    observe: async (w, gameId) => (await matchGame(w, gameId)).status,
    toldAsItself: /Only the host can cancel the game/,
  }),
  hostOnly({
    fn: "wordRush.cancel",
    arrange: (w) => wordRushLobby(w, w.hostId),
    act: (w, caller, token, gameId) => w.t.mutation(api.wordRush.cancel, { gameId, participantId: caller, token }),
    observe: async (w) => (await wordRush(w))?.status ?? null,
    toldAsItself: /Only the host can end the game/,
  }),
];

describe("what only the host may do", () => {
  for (const c of HOST_ONLY) {
    test(`enforce: a guest cannot call ${c.fn}, as itself with its own token or by naming the host; the host can`, async () => {
      const w = await makeWorld();
      const data = await c.arrange?.(w);
      const before = await c.observe(w, data);
      setMode("enforce");

      await expect(c.act(w, w.guestId, GUEST, data), "as itself").rejects.toThrow(c.toldAsItself ?? /Not authorised/);
      await expect(c.act(w, w.hostId, GUEST, data), "naming the host, with its own token").rejects.toThrow(/Not authorised/);
      await expect(c.act(w, w.hostId, undefined, data), "naming the host, with no token").rejects.toThrow(/Not authorised/);
      expect(await c.observe(w, data)).toEqual(before);

      await c.act(w, w.hostId, HOST, data);
      expect(await c.observe(w, data)).not.toEqual(before);
    });
  }

  // A room an installed iOS build made: its host has no token to be asked for, but the caller a call names is
  // still held to being the host. (With no caller named the room's own host is assumed: the "rooms.closeRoom"
  // tests in the table further up.)
  for (const c of HOST_ONLY) {
    test(`enforce: where the host holds no token, a guest who names itself still cannot call ${c.fn}, and the host is asked for none`, async () => {
      const w = await makeWorld({ legacyHost: true });
      const data = await c.arrange?.(w);
      const before = await c.observe(w, data);
      setMode("enforce");

      await expect(c.act(w, w.guestId, GUEST, data), "as itself").rejects.toThrow(c.toldAsItself ?? /Not authorised/);
      expect(await c.observe(w, data)).toEqual(before);

      await c.act(w, w.hostId, undefined, data);
      expect(await c.observe(w, data)).not.toEqual(before);
    });
  }

  test("enforce: a room whose hostId names no participant has no host to assume, so a call that names no caller is refused", async () => {
    const w = await makeWorld();
    // Not a state createRoom leaves behind: it fills hostId in the transaction that makes the room
    await w.t.run(async (ctx) => await ctx.db.patch(w.roomId, { hostId: "" }));
    setMode("enforce");
    warn.mockClear();
    await expect(w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, token: HOST })).rejects.toThrow(/Not authorised/);
    expect(authLines()).toEqual(["auth: rooms.closeRoom no host"]);
    expect(await roomStatus(w)).toBe("active");
  });

  test("unset or log: a guest's host-only call goes through, logged as not the host", async () => {
    for (const mode of [undefined, "log"] as const) {
      setMode(undefined);
      const w = await makeWorld();
      setMode(mode);
      warn.mockClear();
      await w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, callerId: w.guestId, token: GUEST });
      expect(authLines(), modeName(mode)).toEqual(["auth: rooms.closeRoom not the host"]);
      expect(await roomStatus(w), modeName(mode)).toBe("closed");
    }
  });

  test("the host's push registration is refused for anyone the room does not name as its host, in every mode", async () => {
    for (const mode of MODES) {
      setMode(undefined);
      const w = await makeWorld();
      setMode(mode);
      await expect(
        w.t.mutation(api.participants.setHostPushToken, { roomId: w.roomId, hostId: w.guestId, token: APNS, callerToken: GUEST }),
        modeName(mode)
      ).rejects.toThrow(/Only the host can register/);
      expect(await deviceTokens(w.t, w.roomId), modeName(mode)).toEqual([]);
    }
  });

  test("the host's caller token sent as the device token is refused in every mode, and never stored or sent to Apple", async () => {
    for (const mode of MODES) {
      setMode(undefined);
      const w = await makeWorld();
      setMode(mode);
      await expect(
        w.t.mutation(api.participants.setHostPushToken, { roomId: w.roomId, hostId: w.hostId, token: HOST, callerToken: HOST }),
        modeName(mode)
      ).rejects.toThrow(/Invalid device token/);
      expect(await deviceTokens(w.t, w.roomId), modeName(mode)).toEqual([]);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Another room
// ═════════════════════════════════════════════════════════════════════════════

type Rooms = World & { other: { roomId: Id<"rooms">; hostId: Pid; guestId: Pid } };

/** makeWorld's room, and a second one whose host and guest hold tokens of their own */
async function twoRooms(): Promise<Rooms> {
  const w = await makeWorld();
  const other = await createRoom(w.t, { hostNickname: "Other host", hostToken: OTHER_HOST });
  const guestId = await joinGuest(w.t, other.roomId, "Outsider", { avatar: "cat", token: OTHER_GUEST });
  return { ...w, other: { roomId: other.roomId, hostId: other.hostId, guestId } };
}

type OutsiderCase<D> = {
  fn: string;
  /** Which member of the other room tries */
  as: "host" | "guest";
  arrange?: (w: Rooms) => Promise<D>;
  act: (w: Rooms, outsider: Pid, token: string, data: D) => Promise<unknown>;
  observe: (w: Rooms, data: D) => Promise<unknown>;
  /** A membership rule older than tokens answers in its own words, in every mode */
  told?: RegExp;
};
function outsider<D>(c: OutsiderCase<D>): OutsiderCase<any> {
  return c;
}

const OUTSIDERS: OutsiderCase<any>[] = [
  outsider({
    fn: "rooms.closeRoom",
    as: "host",
    act: (w, who, token) => w.t.mutation(api.rooms.closeRoom, { roomId: w.roomId, callerId: who, token }),
    observe: roomStatus,
  }),
  outsider({
    fn: "rooms.updateRoomSettings",
    as: "host",
    act: (w, who, token) =>
      w.t.mutation(api.rooms.updateRoomSettings, { roomId: w.roomId, settings: SETTINGS, callerId: who, token }),
    observe: async (w) => (await w.t.query(api.rooms.getRoomState, { roomId: w.roomId }))?.room.settings.maxParticipants,
  }),
  outsider({
    fn: "rooms.setRoomBackground",
    as: "host",
    arrange: anotherBackground,
    act: (w, who, token, background) =>
      w.t.mutation(api.rooms.setRoomBackground, { roomId: w.roomId, background, callerId: who, token }),
    observe: roomBackground,
  }),
  outsider({
    fn: "participants.kickParticipant",
    as: "host",
    act: (w, who, token) =>
      w.t.mutation(api.participants.kickParticipant, { participantId: w.guestId, roomId: w.roomId, callerId: who, token }),
    observe: async (w) => (await person(w, w.guestId)) !== null,
  }),
  outsider({
    fn: "messages.sendTextMessage",
    as: "guest",
    act: (w, who, token) => w.t.mutation(api.messages.sendTextMessage, { roomId: w.roomId, senderId: who, text: "hello", token }),
    observe: (w) => countMessages(w, "text"),
  }),
  outsider({
    fn: "messages.deleteMessage",
    as: "host",
    arrange: (w) => say(w, w.guestId),
    act: (w, who, token, messageId) => w.t.mutation(api.messages.deleteMessage, { messageId, callerId: who, token }),
    observe: messageStatus,
  }),
  outsider({
    // A translation of its own choosing under a message in this room
    fn: "messages.submitProcessedMessage",
    as: "host",
    arrange: (w) => say(w, w.guestId),
    act: (w, who, token, messageId) =>
      w.t.mutation(api.messages.submitProcessedMessage, {
        messageId,
        processing: { translatedText: "not what was said" },
        callerId: who,
        token,
      }),
    observe: async (w, messageId) => (await w.t.query(api.messages.getMessageById, { messageId }))?.processing ?? null,
  }),
  outsider({
    fn: "messages.markMessageFailed",
    as: "host",
    arrange: (w) => say(w, w.guestId),
    act: (w, who, token, messageId) =>
      w.t.mutation(api.messages.markMessageFailed, { messageId, error: "no", callerId: who, token }),
    observe: messageStatus,
  }),
  outsider({
    fn: "reactions.addReaction",
    as: "guest",
    arrange: (w) => say(w, w.guestId),
    act: (w, who, token, messageId) => w.t.mutation(api.reactions.addReaction, { messageId, participantId: who, emoji: "👍", token }),
    observe: countReactions,
  }),
  outsider({
    fn: "games.startGame",
    as: "host",
    act: (w, who, token) =>
      w.t.mutation(api.games.startGame, { roomId: w.roomId, participantId: who, gameType: "lost_in_translation", token }),
    observe: litSession,
  }),
  outsider({
    fn: "games.cancelGame",
    as: "host",
    arrange: startLostInTranslation,
    act: (w, who, token) => w.t.mutation(api.games.cancelGame, { roomId: w.roomId, participantId: who, token }),
    observe: litSession,
  }),
  outsider({
    fn: "emojiMatch.createLobby",
    as: "guest",
    act: (w, who, token) => w.t.mutation(api.emojiMatch.createLobby, { roomId: w.roomId, hostParticipantId: who, token }),
    observe: async (w) => (await w.t.query(api.emojiMatch.getActiveEmojiMatch, { roomId: w.roomId }))?._id ?? null,
    told: /Participant not in this room/,
  }),
  outsider({
    fn: "emojiMatch.joinLobby",
    as: "guest",
    arrange: (w) => matchLobby(w, w.hostId),
    act: (w, who, token, gameId) => w.t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: who, token }),
    observe: async (w, gameId) => (await matchGame(w, gameId)).players.length,
    told: /Participant not in this room/,
  }),
  outsider({
    fn: "emojiMatch.cancelGame",
    as: "host",
    arrange: (w) => matchLobby(w, w.hostId),
    act: (w, who, token, gameId) => w.t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: who, token }),
    observe: async (w, gameId) => (await matchGame(w, gameId)).status,
  }),
  outsider({
    fn: "emojiBingo.createLobby",
    as: "guest",
    act: (w, who, token) => w.t.mutation(api.emojiBingo.createLobby, { roomId: w.roomId, hostParticipantId: who, token }),
    observe: async (w) => (await w.t.query(api.emojiBingo.getActiveEmojiBingo, { roomId: w.roomId }))?._id ?? null,
    told: /Participant not in this room/,
  }),
  outsider({
    fn: "emojiBingo.joinLobby",
    as: "guest",
    arrange: (w) => bingoLobby(w, w.hostId),
    act: (w, who, token, gameId) => w.t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: who, token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).players.length,
    told: /Participant not in this room/,
  }),
  outsider({
    fn: "emojiBingo.cancelGame",
    as: "host",
    arrange: (w) => bingoLobby(w, w.hostId),
    act: (w, who, token, gameId) => w.t.mutation(api.emojiBingo.cancelGame, { gameId, participantId: who, token }),
    observe: async (w, gameId) => (await bingoGame(w, gameId)).status,
  }),
  outsider({
    fn: "truthOrDare.createGame",
    as: "guest",
    act: (w, who, token) => w.t.mutation(api.truthOrDare.createGame, { roomId: w.roomId, hostParticipantId: who, token }),
    observe: async (w) => (await truthOrDare(w))?._id ?? null,
  }),
  outsider({
    fn: "truthOrDare.submitTranslation",
    as: "host",
    arrange: async (w) => (await answeredTurn(w)).turnId,
    act: (w, who, token, turnId) =>
      w.t.mutation(api.truthOrDare.submitTranslation, { turnId, translatedText: "答え", callerId: who, token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?.translatedResponseText ?? null,
  }),
  outsider({
    // The answered turn is what the host's Next Turn moves on from
    fn: "truthOrDare.advanceTurn",
    as: "host",
    arrange: async (w) => (await answeredTurn(w)).gameId,
    act: (w, who, token, gameId) => w.t.mutation(api.truthOrDare.advanceTurn, { gameId, participantId: who, token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?._id,
  }),
  outsider({
    fn: "truthOrDare.acknowledgeRoundBreak",
    as: "host",
    arrange: atRoundBreak,
    act: (w, who, token, gameId) =>
      w.t.mutation(api.truthOrDare.acknowledgeRoundBreak, { gameId, participantId: who, completedTurns: 10, token }),
    observe: async (w) => (await truthOrDare(w))?.roundBreakAckedTurns ?? null,
  }),
  outsider({
    fn: "truthOrDare.hostSkipTurn",
    as: "host",
    arrange: startTruthOrDare,
    act: (w, who, token, { gameId, turnId }) =>
      w.t.mutation(api.truthOrDare.hostSkipTurn, { gameId, participantId: who, turnId, token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?._id,
  }),
  outsider({
    fn: "truthOrDare.submitRating",
    as: "guest",
    arrange: async (w) => (await answeredTurn(w)).turnId,
    act: (w, who, token, turnId) => w.t.mutation(api.truthOrDare.submitRating, { turnId, participantId: who, score: 4, token }),
    observe: async (w) => (await truthOrDare(w))?.currentTurn?.ratings ?? [],
  }),
  outsider({
    fn: "truthOrDare.endGame",
    as: "host",
    arrange: async (w) => (await startTruthOrDare(w)).gameId,
    act: (w, who, token, gameId) => w.t.mutation(api.truthOrDare.endGame, { gameId, participantId: who, token }),
    observe: async (w) => (await truthOrDare(w))?.status,
  }),
  outsider({
    fn: "truthOrDare.postSummary",
    as: "guest",
    arrange: summaryDeleted,
    act: (w, who, token) => w.t.mutation(api.truthOrDare.postSummary, { roomId: w.roomId, participantId: who, token }),
    observe: async (w) => (await truthOrDareSummaries(w)).length,
  }),
  outsider({
    fn: "wordRush.createLobby",
    as: "guest",
    act: (w, who, token) => w.t.mutation(api.wordRush.createLobby, { roomId: w.roomId, hostParticipantId: who, token }),
    observe: async (w) => (await wordRush(w))?._id ?? null,
    told: /Participant not in this room/,
  }),
  outsider({
    fn: "wordRush.cancel",
    as: "host",
    arrange: (w) => wordRushLobby(w, w.hostId),
    act: (w, who, token, gameId) => w.t.mutation(api.wordRush.cancel, { gameId, participantId: who, token }),
    observe: async (w) => (await wordRush(w))?.status ?? null,
    told: /Only the host can end the game/,
  }),
];

describe("a member of another room", () => {
  for (const c of OUTSIDERS) {
    test(`enforce: the other room's ${c.as} cannot call ${c.fn} here, though its token is good in its own room`, async () => {
      const w = await twoRooms();
      const data = await c.arrange?.(w);
      const before = await c.observe(w, data);
      setMode("enforce");
      const [who, token] = c.as === "host" ? [w.other.hostId, OTHER_HOST] : [w.other.guestId, OTHER_GUEST];
      // The token is not the reason for the refusal below
      await w.t.mutation(api.participants.setTypingAction, { participantId: who, action: "typing", token });

      await expect(c.act(w, who, token, data)).rejects.toThrow(c.told ?? /Not authorised/);
      expect(await c.observe(w, data)).toEqual(before);
    });
  }

  test("a message cannot be sent into a room its sender is not in, in any mode: text, drawing or picture", async () => {
    for (const mode of MODES) {
      setMode(undefined);
      const w = await twoRooms();
      const storageId = await w.t.run(async (ctx) => await ctx.storage.store(new Blob(["a picture"])));
      setMode(mode);
      warn.mockClear();
      const from = { roomId: w.roomId, senderId: w.other.guestId, token: OTHER_GUEST };
      const refusal = mode === "enforce" ? /Not authorised/ : /Not a member of this room/;

      await expect(w.t.mutation(api.messages.sendTextMessage, { ...from, text: "hello" }), modeName(mode)).rejects.toThrow(refusal);
      await expect(w.t.mutation(api.messages.sendDrawingMessage, { ...from, mediaUrl: PNG }), modeName(mode)).rejects.toThrow(refusal);
      await expect(w.t.mutation(api.messages.sendImageMessage, { ...from, storageId }), modeName(mode)).rejects.toThrow(refusal);

      expect(authLines(), modeName(mode)).toEqual([
        "auth: messages.sendTextMessage not in this room",
        "auth: messages.sendDrawingMessage not in this room",
        "auth: messages.sendImageMessage not in this room",
      ]);
      expect(
        [await countMessages(w, "text"), await countMessages(w, "drawing"), await countMessages(w, "image")],
        modeName(mode)
      ).toEqual([0, 0, 0]);
    }
  });

  // These two check the token and the room separately, so the refusal is the older one in every mode. It comes
  // before the file is looked at, which is as far as a clip gets here (see the top of the file).
  test("nor a voice message, nor a clip for dictation, in any mode, and the clip is not deleted", async () => {
    for (const mode of MODES) {
      setMode(undefined);
      const w = await twoRooms();
      const storageId = await w.t.run(async (ctx) => await ctx.storage.store(new Blob(["a clip"])));
      setMode(mode);
      const from = { roomId: w.roomId, senderId: w.other.guestId, storageId };

      await expect(
        w.t.mutation(api.messages.sendAudioMessage, { ...from, durationMs: 1000, waveform: [0.5], token: OTHER_GUEST }),
        modeName(mode)
      ).rejects.toThrow(/Not a member of this room/);
      const dictation = await post(w.t, "/api/messages/transcribe", { ...from, callerId: w.other.guestId, callerToken: OTHER_GUEST });
      expect([dictation.status, dictation.json.error], modeName(mode)).toEqual([
        400,
        expect.stringMatching(/Not a member of this room/),
      ]);

      expect(await countMessages(w, "audio"), modeName(mode)).toBe(0);
      expect(await w.t.run(async (ctx) => await ctx.db.system.get(storageId)), modeName(mode)).not.toBeNull();
    }
  });

  test("enforce: the other room's host cannot kick someone here by naming its own room, where it is the host", async () => {
    const w = await twoRooms();
    setMode("enforce");
    await expect(
      w.t.mutation(api.participants.kickParticipant, {
        participantId: w.guestId,
        roomId: w.other.roomId,
        callerId: w.other.hostId,
        token: OTHER_HOST,
      })
    ).rejects.toThrow(/Participant not in room/);
    expect(await person(w, w.guestId)).not.toBeNull();
    expect(await secretsOf(w.t, w.guestId)).toEqual([GUEST]);
  });

  test("unset or log: where no older rule stops it, a call from another room's member goes through, logged as not in this room", async () => {
    for (const mode of [undefined, "log"] as const) {
      setMode(undefined);
      const w = await twoRooms();
      setMode(mode);
      warn.mockClear();
      await w.t.mutation(api.truthOrDare.createGame, { roomId: w.roomId, hostParticipantId: w.other.guestId, token: OTHER_GUEST });
      expect(authLines(), modeName(mode)).toEqual(["auth: truthOrDare.createGame not in this room"]);
      expect((await truthOrDare(w))?.status, modeName(mode)).toBe("active");
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// joinRoom: who gets an offline participant back
// ═════════════════════════════════════════════════════════════════════════════

/** The token the caller coming back holds */
const MINE = hex("7a");
/** The token someone else registered under the same name and avatar */
const THEIRS = hex("8b");

type RowKind = "legacy" | "mine" | "theirs";
const ROW_TOKEN: Record<RowKind, string | undefined> = { legacy: undefined, mine: MINE, theirs: THEIRS };
const ROW_NAME: Record<RowKind, string> = {
  legacy: "a legacy row",
  mine: "a row with the caller's token",
  theirs: "a row with another token",
};

/**
 * A room with offline participants called Sam with the fox avatar, made in this order. Each joined while the
 * ones before were still online, and someone online is never handed over, so each is a row of its own.
 */
async function offlineRows(kinds: RowKind[]) {
  const t = newBackend();
  const { roomId } = await createRoom(t);
  const rows: { kind: RowKind; id: Pid }[] = [];
  for (const kind of kinds) rows.push({ kind, id: await joinGuest(t, roomId, "Sam", { token: ROW_TOKEN[kind] }) });
  for (const row of rows) {
    await t.mutation(api.participants.leaveRoom, { participantId: row.id, token: ROW_TOKEN[row.kind] });
  }
  expect(new Set(rows.map((row) => row.id)).size).toBe(kinds.length);
  return { t, roomId, rows };
}

/** What the caller is given: one of the rows, or "new" for a participant that did not exist */
type Given = RowKind | "new";
const always = (given: Given): Record<"unset" | "log" | "enforce", Given> => ({ unset: given, log: given, enforce: given });
/** A legacy row goes to a caller with a token only while not enforcing */
const UNLESS_ENFORCING = { unset: "legacy", log: "legacy", enforce: "new" } as const;

const RECLAIM: Array<{ rows: RowKind[]; token: boolean; given: Record<"unset" | "log" | "enforce", Given>; rule: string }> = [
  { rows: ["legacy"], token: false, given: always("legacy"), rule: "gets it back, in every mode" },
  {
    rows: ["legacy"],
    token: true,
    given: UNLESS_ENFORCING,
    rule: "gets it and its token is put on record, except under enforce: then it joins as new and the row is left alone",
  },
  { rows: ["mine"], token: true, given: always("mine"), rule: "gets it back, in every mode" },
  { rows: ["mine"], token: false, given: always("new"), rule: "joins as new, in every mode" },
  { rows: ["theirs"], token: true, given: always("new"), rule: "joins as new, in every mode" },
  { rows: ["theirs"], token: false, given: always("new"), rule: "joins as new, in every mode" },
  { rows: ["legacy", "mine"], token: true, given: always("mine"), rule: "gets the row with its token, in every mode" },
  { rows: ["mine", "legacy"], token: true, given: always("mine"), rule: "gets the row with its token, in every mode" },
  { rows: ["legacy", "mine"], token: false, given: always("legacy"), rule: "gets the legacy row, in every mode" },
  { rows: ["mine", "legacy"], token: false, given: always("legacy"), rule: "gets the legacy row, in every mode" },
  {
    rows: ["legacy", "theirs"],
    token: true,
    given: UNLESS_ENFORCING,
    rule: "gets the legacy row, except under enforce: then it joins as new",
  },
  {
    rows: ["theirs", "legacy"],
    token: true,
    given: UNLESS_ENFORCING,
    rule: "gets the legacy row, except under enforce: then it joins as new",
  },
  { rows: ["legacy", "theirs"], token: false, given: always("legacy"), rule: "gets the legacy row, in every mode" },
  { rows: ["theirs", "legacy"], token: false, given: always("legacy"), rule: "gets the legacy row, in every mode" },
  { rows: ["theirs", "mine"], token: true, given: always("mine"), rule: "gets the row with its token, in every mode" },
  { rows: ["mine", "theirs"], token: true, given: always("mine"), rule: "gets the row with its token, in every mode" },
  { rows: ["mine", "theirs"], token: false, given: always("new"), rule: "joins as new, in every mode" },
];

describe("joinRoom: someone coming back under the name and avatar of an offline participant", () => {
  for (const { rows: kinds, token: hasToken, given, rule } of RECLAIM) {
    const offline = kinds.map((kind) => ROW_NAME[kind]).join(", then ");
    test(`offline: ${offline}. A caller with ${hasToken ? "a" : "no"} token ${rule}`, async () => {
      for (const mode of MODES) {
        const where = `AUTH_MODE ${modeName(mode)}`;
        setMode(undefined);
        const { t, roomId, rows } = await offlineRows(kinds);
        const callerToken = hasToken ? MINE : undefined;
        const expected = given[mode ?? "unset"];
        setMode(mode);

        const got = await joinGuest(t, roomId, "Sam", { token: callerToken });

        const gotKind: Given = rows.find((row) => row.id === got)?.kind ?? "new";
        expect(gotKind, where).toBe(expected);

        // The invariant: what the caller will present from now on is what is on record for what it was given.
        // A caller with a token holds a participant with that token, and one with none holds a legacy one.
        expect(await secretsOf(t, got), where).toEqual(hasToken ? [MINE] : []);

        // Every row that was not handed over is as it was: offline, with the secret it had
        const state = await t.query(api.rooms.getRoomState, { roomId });
        for (const row of rows) {
          const online = state?.participants.find((p) => p._id === row.id)?.online;
          if (row.id === got) {
            expect(online, `${where}, the row handed over`).toBe(true);
            continue;
          }
          expect(online, `${where}, ${ROW_NAME[row.kind]} not handed over`).toBe(false);
          const kept = ROW_TOKEN[row.kind];
          expect(await secretsOf(t, row.id), `${where}, ${ROW_NAME[row.kind]} not handed over`).toEqual(kept ? [kept] : []);
        }
        // The host, the rows, and one more only when the caller joined as new
        expect(state?.participants.length, where).toBe(1 + rows.length + (expected === "new" ? 1 : 0));

        // And as a client sees it: once enforcing, the caller's own credentials work for what it was given
        setMode("enforce");
        await t.mutation(api.participants.setTypingAction, { participantId: got, action: "typing", token: callerToken });
        if (hasToken) {
          await expect(
            t.mutation(api.participants.setTypingAction, { participantId: got, action: "typing" }),
            `${where}: the participant handed over is protected`
          ).rejects.toThrow(/Not authorised/);
        }
      }
    });
  }

  test("of two legacy rows the older is handed over and the other left alone", async () => {
    for (const hasToken of [false, true]) {
      const { t, roomId, rows } = await offlineRows(["legacy", "legacy"]);
      const got = await joinGuest(t, roomId, "Sam", { token: hasToken ? MINE : undefined });
      expect(got).toBe(rows[0].id);
      expect(await allSecrets(t)).toEqual(hasToken ? [{ participantId: rows[0].id, token: MINE }] : []);
    }
  });

  test("a legacy row taken with a token is that caller's from then on: this is why enforce does not hand one over", async () => {
    const { t, roomId, rows } = await offlineRows(["legacy"]);
    setMode("log");
    expect(await joinGuest(t, roomId, "Sam", { token: MINE })).toBe(rows[0].id);
    // The browser that made the row sends no token, as it never has
    warn.mockClear();
    await t.mutation(api.participants.setTypingAction, { participantId: rows[0].id, action: "typing" });
    expect(authLines()).toEqual(["auth: participants.setTypingAction no token"]);
    setMode("enforce");
    await expect(t.mutation(api.participants.setTypingAction, { participantId: rows[0].id, action: "drawing" })).rejects.toThrow(
      /Not authorised/
    );
    await t.mutation(api.participants.setTypingAction, { participantId: rows[0].id, action: "drawing", token: MINE });
  });

  test("enforce: the owner of a legacy row that a token-bearing caller asked for still has it, and gets it back", async () => {
    const { t, roomId, rows } = await offlineRows(["legacy"]);
    setMode("enforce");
    const newcomer = await joinGuest(t, roomId, "Sam", { token: MINE });
    expect(newcomer).not.toBe(rows[0].id);
    // The old browser comes back with no token and is given its own participant, still without a secret
    expect(await joinGuest(t, roomId, "Sam")).toBe(rows[0].id);
    await t.mutation(api.participants.setTypingAction, { participantId: rows[0].id, action: "typing" });
    expect(await allSecrets(t)).toEqual([{ participantId: newcomer, token: MINE }]);
  });

  test("a participant who is online is not handed over, whatever the caller holds: the same token makes a second one", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const first = await joinGuest(t, roomId, "Sam", { token: MINE });
    const second = await joinGuest(t, roomId, "Sam", { token: MINE });
    expect(second).not.toBe(first);
    expect(await allSecrets(t)).toEqual([
      { participantId: first, token: MINE },
      { participantId: second, token: MINE },
    ]);
  });

  test("the host's row is never handed over, not even to a caller with the host's own token", async () => {
    for (const mode of MODES) {
      setMode(undefined);
      const t = newBackend();
      const { roomId, hostId } = await createRoom(t, { hostNickname: "Sam", hostToken: HOST });
      await t.mutation(api.participants.setParticipantOnline, { participantId: hostId, online: false, token: HOST });
      setMode(mode);
      for (const token of [HOST, undefined]) {
        const got = await joinGuest(t, roomId, "Sam", { avatar: "default", token });
        expect(got, modeName(mode)).not.toBe(hostId);
      }
      const state = await t.query(api.rooms.getRoomState, { roomId });
      expect(state?.participants.filter((p) => p.role === "host").map((p) => p._id), modeName(mode)).toEqual([hostId]);
      expect(state?.participants.find((p) => p._id === hostId)?.online, modeName(mode)).toBe(false);
    }
  });

  test("a malformed token is refused whether or not there is a row to hand over, and the row stays offline and legacy", async () => {
    for (const mode of MODES) {
      for (const kinds of [["legacy"], ["mine"], []] as RowKind[][]) {
        const where = `AUTH_MODE ${modeName(mode)}, offline: ${kinds.join() || "nobody"}`;
        setMode(undefined);
        const { t, roomId, rows } = await offlineRows(kinds);
        const secretsBefore = await allSecrets(t);
        setMode(mode);
        await expect(joinGuest(t, roomId, "Sam", { token: "short" }), where).rejects.toThrow(/Invalid token/);
        const state = await t.query(api.rooms.getRoomState, { roomId });
        expect(state?.participants.filter((p) => p.role !== "host").map((p) => [p._id, p.online]), where).toEqual(
          rows.map((row) => [row.id, false])
        );
        expect(await allSecrets(t), where).toEqual(secretsBefore);
      }
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Kicking
// ═════════════════════════════════════════════════════════════════════════════

describe("kicking a participant", () => {
  test("removes their secret with them, and nobody else's", async () => {
    const w = await makeWorld();
    const kickedId = await joinGuest(w.t, w.roomId, "Kicked", { avatar: "owl", token: SECOND_GUEST });
    expect(await secretsOf(w.t, kickedId)).toEqual([SECOND_GUEST]);

    await w.t.mutation(api.participants.kickParticipant, { participantId: kickedId, roomId: w.roomId, token: HOST });

    expect(await allSecrets(w.t)).toEqual([
      { participantId: w.hostId, token: HOST },
      { participantId: w.guestId, token: GUEST },
    ]);
  });

  test("enforce: the token of someone kicked opens nothing any more", async () => {
    const w = await makeWorld();
    const kickedId = await joinGuest(w.t, w.roomId, "Kicked", { avatar: "owl", token: SECOND_GUEST });
    setMode("enforce");
    await w.t.mutation(api.participants.kickParticipant, { participantId: kickedId, roomId: w.roomId, callerId: w.hostId, token: HOST });

    const as = { participantId: kickedId, token: SECOND_GUEST };
    await expect(w.t.mutation(api.participants.setParticipantOnline, { ...as, online: true })).rejects.toThrow(/Not authorised/);
    await expect(w.t.mutation(api.participants.setTypingAction, { ...as, action: "typing" })).rejects.toThrow(/Not authorised/);
    await expect(
      w.t.mutation(api.messages.sendTextMessage, { roomId: w.roomId, senderId: kickedId, text: "let me in", token: SECOND_GUEST })
    ).rejects.toThrow(/Not authorised/);
    expect(await countMessages(w, "text")).toBe(0);
  });

  test("someone kicked who joins again is a new participant, holding the token they came with", async () => {
    const w = await makeWorld();
    const kickedId = await joinGuest(w.t, w.roomId, "Kicked", { avatar: "owl", token: SECOND_GUEST });
    await w.t.mutation(api.participants.kickParticipant, { participantId: kickedId, roomId: w.roomId, token: HOST });

    const againId = await joinGuest(w.t, w.roomId, "Kicked", { avatar: "owl", token: SECOND_GUEST });

    expect(againId).not.toBe(kickedId);
    expect(await secretsOf(w.t, againId)).toEqual([SECOND_GUEST]);
    expect(await secretsOf(w.t, kickedId)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Emojifyr: no token, no check
// ═════════════════════════════════════════════════════════════════════════════

/** Every public mutation and action that declares no token of any kind. All are Emojifyr's */
const EMOJIFYR = [
  "games:advanceEmojifyrRound",
  "games:cancelEmojifyr",
  "games:generateEmojiClue",
  "games:patchEmojifyrRoundHints",
  "games:patchEmojifyrRoundTranslation",
  "games:revealEmojifyrRound",
  "games:startEmojifyr",
  "games:submitEmojifyrEmojiClue",
  "games:submitEmojifyrEmojiClueWithTranslation",
  "games:submitEmojifyrGuess",
  "games:submitEmojifyrGuessWithTranslation",
  "games:submitEmojifyrSentence",
  "games:updateEmojifyrSentence",
];

/** The public functions of one kind, as "module:function", with the arguments each declares */
async function publicFunctions(kind: "isQuery" | "isMutation" | "isAction") {
  const found: { name: string; args: Record<string, unknown> }[] = [];
  for (const [path, load] of Object.entries(modules)) {
    if (path.includes("/_generated/")) continue;
    const file = path.slice(path.lastIndexOf("/convex/") + "/convex/".length).replace(/\.[cm]?[jt]s$/, "");
    for (const [name, fn] of Object.entries((await load()) as Record<string, any>)) {
      if (typeof fn !== "function" || !fn[kind] || !fn.isPublic) continue;
      const spec = JSON.parse(fn.exportArgs());
      found.push({ name: `${file}:${name}`, args: spec.type === "object" ? spec.value : {} });
    }
  }
  // Plain code-unit order, the order Array.prototype.sort gives the lists these are compared with
  return found.sort((a, b) => (a.name < b.name ? -1 : 1));
}

describe("Emojifyr, which installed iOS builds still call without a token", () => {
  test("a round is played and the game cancelled by participants who hold tokens, with none sent, in every mode", async () => {
    for (const mode of MODES) {
      const where = `AUTH_MODE ${modeName(mode)}`;
      setMode(undefined);
      const { t, roomId, hostId, guestId } = await makeWorld();
      setMode(mode);
      warn.mockClear();

      const gameSessionId = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });
      const first = (await t.query(api.games.getCurrentEmojifyrRound, { gameSessionId }))!;
      await t.mutation(api.games.submitEmojifyrSentence, { roundId: first._id, sentence: "A cat on a train" });
      await t.mutation(api.games.updateEmojifyrSentence, { roundId: first._id, sentence: "A cat on a fast train" });
      await t.action(api.games.submitEmojifyrEmojiClueWithTranslation, { roundId: first._id, emojiClue: "🐱🚃" });
      await t.action(api.games.submitEmojifyrGuessWithTranslation, { roundId: first._id, participantId: guestId, guessText: "cat train" });
      // The only guesser has guessed, so the round reveals itself
      expect((await t.query(api.games.getEmojifyrGameState, { roomId }))?.currentRound?.status, where).toBe("reveal");

      await t.mutation(api.games.advanceEmojifyrRound, { gameSessionId });
      const second = (await t.query(api.games.getCurrentEmojifyrRound, { gameSessionId }))!;
      expect(second.roundIndex, where).toBe(1);
      await t.mutation(api.games.revealEmojifyrRound, { roundId: second._id });
      await t.mutation(api.games.cancelEmojifyr, { gameSessionId });
      expect(await t.query(api.games.getActiveEmojifyrSession, { roomId }), where).toBeNull();

      expect(authLines(), where).toEqual([]);
    }
  });

  test("enforce: the clue generator asks for no caller", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "🐱🚃" }] }), { status: 200 }))
    );
    const { t } = await makeWorld();
    setMode("enforce");
    expect(await t.action(api.games.generateEmojiClue, { sentence: "A cat on a train" })).toEqual({ emojiClue: "🐱🚃" });
    expect(authLines()).toEqual([]);
  });

  test("it is the one exception: every other public mutation and action declares a caller token", async () => {
    const callable = [...(await publicFunctions("isMutation")), ...(await publicFunctions("isAction"))];
    // Guards the search below against finding nothing because it looked at nothing
    expect(callable.length).toBeGreaterThan(80);
    const tokenless = callable
      .filter((f) => !["token", "callerToken", "hostToken"].some((name) => name in f.args))
      .map((f) => f.name)
      .sort();
    expect(tokenless).toEqual(EMOJIFYR);
    // On the push registration `token` is the APNs device token, so the caller's has to have its own name
    expect(Object.keys(callable.find((f) => f.name === "participants:setHostPushToken")!.args)).toContain("callerToken");
  });

  // ── What the exception must not let a caller with no token do to the game that is gated ──
  // Both rules are in convex/games.ts and both calls are reachable over the /api/emojifyr/* routes as well.

  // cancelEmojifyr and advanceEmojifyrRound act on Emojifyr's own sessions only. The id of a running Lost in
  // Translation game is in games.getActiveGameSession, which every guest reads.
  test("enforce: Lost in Translation, which only the host may cancel, is not ended by cancelEmojifyr from a caller with no token", async () => {
    const w = await makeWorld();
    const { sessionId } = await startLostInTranslation(w);
    setMode("enforce");
    // The game's own cancel turns the same caller away
    await expect(w.t.mutation(api.games.cancelGame, { roomId: w.roomId, participantId: w.hostId })).rejects.toThrow(
      /Not authorised/
    );

    // Refusing the call and ignoring it would both be right
    await w.t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId }).catch(() => undefined);

    expect(await litSession(w)).toBe(sessionId);
  });

  // startEmojifyr takes the host's id, which every guest can read, as the host's word, and no current build shows
  // an Emojifyr session or can cancel one. So it does not count as a game in progress: startGame ends it.
  test("enforce: a caller with no token who names the host cannot leave the host unable to start Lost in Translation", async () => {
    const w = await makeWorld();
    setMode("enforce");
    // Refusing the call and ignoring it would both be right
    await w.t.mutation(api.games.startEmojifyr, { roomId: w.roomId, createdByParticipantId: w.hostId }).catch(() => undefined);

    // What the iOS host does on Start: cancel whatever is lingering, then start
    await w.t.mutation(api.games.cancelGame, { roomId: w.roomId, participantId: w.hostId, token: HOST });
    const outcome = await w.t
      .mutation(api.games.startGame, { roomId: w.roomId, participantId: w.hostId, gameType: "lost_in_translation", token: HOST })
      .then(
        () => "started",
        (e: Error) => e.message
      );
    expect(outcome).toBe("started");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HTTP: what the iOS host sends
// ═════════════════════════════════════════════════════════════════════════════

async function post(t: Backend, path: string, body: unknown) {
  const response = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
  const text = await response.text();
  responses.push(text);
  return { status: response.status, text, json: text ? JSON.parse(text) : null };
}

/** What the current iOS build adds to every body */
type Caller = { callerId: Pid; callerToken: string };

/** A room made over HTTP by a host app that registers a token, with a guest who holds one. Enforcing from here on */
async function roomOverHttp() {
  const t = newBackend();
  const created = await post(t, "/api/rooms/create", { hostNickname: "Host", hostAvatarId: "cat", hostToken: HOST });
  expect(created.status).toBe(200);
  const { roomId, hostId, joinCode } = created.json as { roomId: Id<"rooms">; hostId: Pid; joinCode: string };
  const guestId = await joinGuest(t, roomId, "Guest", { token: GUEST });
  setMode("enforce");
  const host: Caller = { callerId: hostId, callerToken: HOST };
  const guest: Caller = { callerId: guestId, callerToken: GUEST };
  const callerFor = (id: Pid) => (id === hostId ? host : guest);
  const w: World = {
    t,
    roomId,
    joinCode,
    hostId,
    guestId,
    tokenOf: (id) => (id === hostId ? HOST : id === guestId ? GUEST : undefined),
    notTheTokenOf: (id) => (id === hostId ? GUEST : HOST),
  };
  return { t, w, roomId, hostId, guestId, host, guest, callerFor };
}

/**
 * Posts the body twice. Once with callerId but no callerToken, which must be refused, and once with both,
 * which must be accepted. Returns the accepted answer.
 */
async function gated(t: Backend, path: string, body: Record<string, unknown>, caller: Caller) {
  const bare = await post(t, path, { ...body, callerId: caller.callerId });
  expect({ path, status: bare.status, error: bare.json?.error }).toEqual({
    path,
    status: 400,
    error: expect.stringMatching(/Not authorised/),
  });
  const full = await post(t, path, { ...body, ...caller });
  expect({ path, status: full.status, error: full.json?.error }).toEqual({ path, status: 200, error: undefined });
  return full.json;
}

/**
 * For a call that cannot succeed here. Without callerToken it is refused as not authorised; with it, it is
 * refused for another reason or not at all: the token took it past the caller check.
 */
async function pastCallerCheck(t: Backend, path: string, body: Record<string, unknown>, caller: Caller) {
  const bare = await post(t, path, { ...body, callerId: caller.callerId });
  expect({ path, error: bare.json?.error }).toEqual({ path, error: expect.stringMatching(/Not authorised/) });
  const full = await post(t, path, { ...body, ...caller });
  expect({ path, error: full.json?.error ?? "" }).toEqual({ path, error: expect.not.stringMatching(/Not authorised/) });
}

describe("HTTP routes", () => {
  // No answer a route gives may carry a token
  afterEach(() => expectNoToken(responses.join("\n"), [HOST, GUEST, APNS], "a route's answer"));

  describe("/api/rooms/create", () => {
    test("registers hostToken for the host and answers without it", async () => {
      const t = newBackend();
      const created = await post(t, "/api/rooms/create", { hostNickname: "Host", hostToken: HOST });
      expect(created.status).toBe(200);
      // What the host app decodes. That the token is not in the answer is checked after every test here
      expect(created.json).toMatchObject({ roomId: expect.any(String), joinCode: expect.any(String), hostId: expect.any(String) });
      expect(await allSecrets(t)).toEqual([{ participantId: created.json.hostId, token: HOST }]);
    });

    test("answers 400 to a malformed hostToken and makes no room", async () => {
      const t = newBackend();
      const refused = await post(t, "/api/rooms/create", { hostNickname: "Host", hostToken: "abc" });
      expect([refused.status, refused.json.error]).toEqual([400, expect.stringMatching(/Invalid token/)]);
      expect(await t.run(async (ctx) => (await ctx.db.query("rooms").collect()).length)).toBe(0);
    });

    test("without hostToken makes a legacy host, as installed builds do", async () => {
      const t = newBackend();
      const created = await post(t, "/api/rooms/create", { hostNickname: "Host" });
      expect(created.status).toBe(200);
      expect(await allSecrets(t)).toEqual([]);
    });
  });

  describe("/api/rooms/push-token", () => {
    test("enforce: `token` stays the APNs device token and the caller proves itself with callerToken", async () => {
      const { t, roomId, hostId, host } = await roomOverHttp();
      await gated(t, "/api/rooms/push-token", { roomId, hostId, token: APNS }, host);
      // What was stored for Apple is the device token, and the caller's token went nowhere but the check
      expect(await deviceTokens(t, roomId)).toEqual([APNS]);
      expect(await allSecrets(t)).toEqual([
        { participantId: hostId, token: HOST },
        { participantId: expect.anything(), token: GUEST },
      ]);
    });

    test("enforce: the host's caller token in `token` is not taken for the caller's proof, nor stored as a device token", async () => {
      const { t, roomId, hostId } = await roomOverHttp();
      // The mistake a client would make by using the same field name as every other route
      const asProof = await post(t, "/api/rooms/push-token", { roomId, hostId, callerId: hostId, token: HOST });
      expect([asProof.status, asProof.json.error]).toEqual([400, expect.stringMatching(/Not authorised/)]);
      const asDevice = await post(t, "/api/rooms/push-token", { roomId, hostId, callerId: hostId, token: HOST, callerToken: HOST });
      expect([asDevice.status, asDevice.json.error]).toEqual([400, expect.stringMatching(/Invalid device token/)]);
      expect(await deviceTokens(t, roomId)).toEqual([]);
    });
  });

  describe("enforce: a body without callerToken is refused and the same body with it is accepted", () => {
    test("rooms and participants routes", async () => {
      const { t, w, roomId, hostId, guestId, host } = await roomOverHttp();
      await gated(t, "/api/participants/set-online", { participantId: hostId, online: true, presence: "away" }, host);
      await gated(t, "/api/participants/set-typing", { participantId: hostId, action: "typing" }, host);
      await gated(t, "/api/participants/set-language", { participantId: hostId, language: "en" }, host);
      const me = await person(w, hostId);
      expect([me?.presence, me?.typingAction, me?.preferredLanguage]).toEqual(["away", "typing", "en"]);

      await gated(t, "/api/participants/kick", { participantId: guestId, roomId }, host);
      expect(await person(w, guestId)).toBeNull();

      await gated(t, "/api/rooms/close", { roomId }, host);
      expect(await roomStatus(w)).toBe("closed");
    });

    test("storage and messages routes", async () => {
      const { t, w, roomId, hostId, host } = await roomOverHttp();
      const sender = { roomId, senderId: hostId };

      expect((await gated(t, "/api/storage/generate-upload-url", {}, host)).uploadUrl).toEqual(expect.any(String));

      const { messageId } = await gated(t, "/api/messages/send-text", { ...sender, text: "hi", clientId: "c1" }, host);
      await gated(t, "/api/messages/submit-processed", { messageId, processing: { translatedText: "やあ" } }, host);
      expect(await messageStatus(w, messageId)).toBe("processed");

      const second = await gated(t, "/api/messages/send-text", { ...sender, text: "again", clientId: "c2" }, host);
      await gated(t, "/api/messages/mark-failed", { messageId: second.messageId, error: "no" }, host);
      expect(await messageStatus(w, second.messageId)).toBe("failed");

      await gated(t, "/api/messages/send-drawing", { ...sender, mediaUrl: PNG }, host);
      expect(await countMessages(w, "drawing")).toBe(1);

      const storageId = await t.run(async (ctx) => await ctx.storage.store(new Blob(["a picture"])));
      await gated(t, "/api/messages/send-image", { ...sender, storageId }, host);
      expect(await countMessages(w, "image")).toBe(1);

      await gated(t, "/api/messages/delete", { messageId }, host);
      expect(await messageStatus(w, messageId)).toBe("gone");

      // A voice clip cannot be made here (see the top of the file), so these two are only shown to get
      // past the caller check with the token and not without it
      const clip = await t.run(async (ctx) => await ctx.storage.store(new Blob(["a clip"])));
      await pastCallerCheck(t, "/api/messages/send-audio", { ...sender, storageId: clip, durationMs: 1000, waveform: [0.5] }, host);
      await pastCallerCheck(t, "/api/messages/transcribe", { ...sender, storageId: clip }, host);
    });

    test("reactions routes", async () => {
      const { t, w, hostId, guestId, host } = await roomOverHttp();
      const messageId = await say(w, guestId);
      const reaction = { messageId, participantId: hostId, emoji: "👍" };
      await gated(t, "/api/reactions/add", reaction, host);
      expect(await countReactions(w, messageId)).toBe(1);
      await gated(t, "/api/reactions/remove", reaction, host);
      expect(await countReactions(w, messageId)).toBe(0);
    });

    test("games routes", async () => {
      const { t, w, roomId, hostId, host, callerFor } = await roomOverHttp();
      const { sessionId } = await gated(t, "/api/games/start", { roomId, participantId: hostId, gameType: "lost_in_translation" }, host);
      expect(await litSession(w)).toBe(sessionId);

      const drawer = (await w.t.query(api.games.getMyActiveStep, { participantId: hostId })) ? hostId : w.guestId;
      const step = (await w.t.query(api.games.getMyActiveStep, { participantId: drawer }))!;
      await gated(t, "/api/games/submit-step", { stepId: step._id, participantId: drawer, outputDrawingUrl: PNG }, callerFor(drawer));
      expect(await litPhase(w)).toBe("guessing");

      await gated(t, "/api/games/cancel", { roomId, participantId: hostId }, host);
      expect(await litSession(w)).toBeNull();
    });

    test("emoji-match routes, where callerId is the caller on timeout-turn and resolve-mismatch", async () => {
      const { t, w, roomId, hostId, guestId, host, guest } = await roomOverHttp();
      const { gameId } = await gated(t, "/api/emoji-match/create-lobby", { roomId, hostParticipantId: hostId }, host);
      await gated(t, "/api/emoji-match/join", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/emoji-match/leave", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/emoji-match/start", { gameId, participantId: hostId }, host);
      await gated(t, "/api/emoji-match/flip-card", { gameId, participantId: hostId, cardId: "card_0" }, host);
      expect((await matchGame(w, gameId)).selectedCardIds).toEqual(["card_0"]);

      await gated(t, "/api/emoji-match/timeout-turn", { gameId, participantId: hostId }, host);
      await gated(t, "/api/emoji-match/resolve-mismatch", { gameId }, host);
      // A body that names no caller is let through, as from an installed build
      expect((await post(t, "/api/emoji-match/timeout-turn", { gameId, participantId: hostId })).status).toBe(200);
      expect((await post(t, "/api/emoji-match/resolve-mismatch", { gameId })).status).toBe(200);

      await gated(t, "/api/emoji-match/cancel", { gameId, participantId: hostId }, host);
      expect((await matchGame(w, gameId)).status).toBe("canceled");
      const again = await gated(t, "/api/emoji-match/play-again", { gameId, participantId: hostId }, host);
      expect((await matchGame(w, again.gameId)).status).toBe("lobby");
    });

    test("emoji-bingo routes", async () => {
      const { t, w, roomId, hostId, guestId, host, guest } = await roomOverHttp();
      const { gameId } = await gated(t, "/api/emoji-bingo/create-lobby", { roomId, hostParticipantId: hostId, winPattern: "line" }, host);
      await gated(t, "/api/emoji-bingo/join", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/emoji-bingo/leave", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/emoji-bingo/start", { gameId, participantId: hostId }, host);
      await gated(t, "/api/emoji-bingo/roll", { gameId, participantId: hostId }, host);
      expect((await bingoGame(w, gameId)).drawIndex).toBe(1);

      // Roll until something on the host's card has been called, so there is a cell that can be marked
      let cellIndex = -1;
      for (let rolls = 0; cellIndex < 0 && rolls < 48; rolls++) {
        const game = await bingoGame(w, gameId);
        cellIndex = game.players[0].card.findIndex((emoji) => game.calledEmojis.includes(emoji));
        if (cellIndex < 0) await w.t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: hostId, token: HOST });
      }
      await gated(t, "/api/emoji-bingo/mark-cell", { gameId, participantId: hostId, cellIndex }, host);
      expect((await bingoGame(w, gameId)).players[0].markedCells).toContain(cellIndex);

      expect((await gated(t, "/api/emoji-bingo/claim-bingo", { gameId, participantId: hostId }, host)).valid).toBe(false);
      await gated(t, "/api/emoji-bingo/cancel", { gameId, participantId: hostId }, host);
      expect((await bingoGame(w, gameId)).status).toBe("canceled");
      const again = await gated(t, "/api/emoji-bingo/play-again", { gameId, participantId: hostId }, host);
      expect((await bingoGame(w, again.gameId)).status).toBe("lobby");
    });

    test("truth-or-dare routes, where callerId is the caller on submit-translation", async () => {
      const { t, w, roomId, hostId, guestId, host, callerFor } = await roomOverHttp();
      // The newest turn at a seat is the live one, and turns dealt in the same millisecond cannot be told apart
      const later = () => vi.setSystemTime(Date.now() + 1_000);
      const { gameId } = await gated(t, "/api/truth-or-dare/create", { roomId, hostParticipantId: hostId }, host);
      const dealt = (await truthOrDare(w))!;
      const holder = dealt.currentTurnParticipantId!;
      const rater = holder === hostId ? guestId : hostId;
      const turnId = dealt.currentTurn!._id;

      await gated(t, "/api/truth-or-dare/submit-choice", { gameId, participantId: holder, choice: "truth" }, callerFor(holder));
      await gated(t, "/api/truth-or-dare/submit-response", { gameId, participantId: holder, responseText: "an answer" }, callerFor(holder));
      await gated(t, "/api/truth-or-dare/submit-translation", { turnId, translatedText: "答え" }, host);
      await gated(t, "/api/truth-or-dare/submit-rating", { turnId, participantId: rater, score: 4 }, callerFor(rater));
      const answered = (await truthOrDare(w))!.currentTurn!;
      expect([answered.status, answered.translatedResponseText, answered.ratings]).toEqual([
        "completed",
        "答え",
        [{ participantId: rater, score: 4 }],
      ]);

      await gated(t, "/api/truth-or-dare/ack-round-break", { gameId, participantId: hostId, completedTurns: 1 }, host);
      later();
      await gated(t, "/api/truth-or-dare/advance-turn", { gameId, participantId: hostId }, host);
      const next = (await truthOrDare(w))!;
      expect(next.currentTurnParticipantId).toBe(rater);
      later();
      await gated(t, "/api/truth-or-dare/skip-turn", { gameId, participantId: rater }, callerFor(rater));
      const dealtAgain = (await truthOrDare(w))!.currentTurn!;
      expect(dealtAgain._id).not.toBe(next.currentTurn!._id);
      later();
      await gated(t, "/api/truth-or-dare/host-skip-turn", { gameId, participantId: hostId, turnId: dealtAgain._id }, host);
      expect((await truthOrDare(w))!.currentTurnParticipantId).toBe(holder);

      await gated(t, "/api/truth-or-dare/end", { gameId, participantId: hostId }, host);
      expect((await truthOrDare(w))!.status).toBe("completed");
    });

    test("word-rush routes", async () => {
      const { t, w, roomId, hostId, guestId, host, guest } = await roomOverHttp();
      const { gameId } = await gated(t, "/api/word-rush/create-lobby", { roomId, hostParticipantId: hostId }, host);
      await gated(t, "/api/word-rush/join", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/word-rush/leave", { gameId, participantId: guestId }, guest);
      await gated(t, "/api/word-rush/update-settings", { gameId, participantId: hostId, sayIt: false }, host);
      await gated(t, "/api/word-rush/start", { gameId, participantId: hostId }, host);
      expect((await wordRush(w))?.status).toBe("active");

      expect(typeof (await gated(t, "/api/word-rush/hint", { gameId, participantId: hostId }, host)).hint).toBe("string");
      expect(await gated(t, "/api/word-rush/answer", { gameId, participantId: hostId, choiceIndex: 0 }, host)).toHaveProperty("correct");
      await gated(t, "/api/word-rush/skip-mic", { gameId, participantId: hostId }, host);
      const phaseSeq = (await wordRush(w))!.phaseSeq;
      await gated(t, "/api/word-rush/skip", { gameId, participantId: hostId, phaseSeq }, host);
      expect((await wordRush(w))!.phaseSeq).toBeGreaterThan(phaseSeq);

      // These three need a voice clip in play, which cannot be made here (see the top of the file)
      const clip = await t.run(async (ctx) => await ctx.storage.store(new Blob(["a clip"])));
      await pastCallerCheck(t, "/api/word-rush/submit-clip", { gameId, participantId: hostId, storageId: clip }, host);
      await pastCallerCheck(t, "/api/word-rush/vote", { gameId, participantId: hostId, vote: "native" }, host);
      await pastCallerCheck(t, "/api/word-rush/submit-teach-clip", { gameId, participantId: hostId, storageId: clip }, host);

      await gated(t, "/api/word-rush/cancel", { gameId, participantId: hostId }, host);
      expect(await wordRush(w)).toBeNull();

      // play-again wants a finished game: the host skips through every card of a second one
      const second = await gated(t, "/api/word-rush/create-lobby", { roomId, hostParticipantId: hostId }, host);
      await gated(t, "/api/word-rush/start", { gameId: second.gameId, participantId: hostId }, host);
      for (let skips = 0; skips < 100 && (await wordRush(w))?.status === "active"; skips++) {
        const now = (await wordRush(w))!.phaseSeq;
        await w.t.mutation(api.wordRush.skip, { gameId: second.gameId, participantId: hostId, phaseSeq: now, token: HOST });
      }
      expect((await wordRush(w))?.status).toBe("completed");
      const again = await gated(t, "/api/word-rush/play-again", { gameId: second.gameId, participantId: hostId }, host);
      expect(again.gameId).not.toBe(second.gameId);
      expect((await wordRush(w))?.status).toBe("lobby");
    });
  });

  test("enforce: the host-only routes hand callerId on: a guest who names itself is refused as not the host", async () => {
    const { t, w, roomId, guestId, guest } = await roomOverHttp();
    const victim = await joinGuest(t, roomId, "Victim", { avatar: "owl" });
    const messageId = await say(w, guestId);
    const { turnId } = await answeredTurn(w);
    const routes: Array<[path: string, label: string, body: Record<string, unknown>]> = [
      ["/api/rooms/background", "rooms.setRoomBackground", { roomId, background: 4 }],
      ["/api/rooms/close", "rooms.closeRoom", { roomId }],
      ["/api/participants/kick", "participants.kickParticipant", { participantId: victim, roomId }],
      ["/api/messages/submit-processed", "messages.submitProcessedMessage", { messageId, processing: { translatedText: "no" } }],
      ["/api/messages/mark-failed", "messages.markMessageFailed", { messageId, error: "no" }],
      ["/api/messages/delete", "messages.deleteMessage", { messageId }],
      ["/api/truth-or-dare/submit-translation", "truthOrDare.submitTranslation", { turnId, translatedText: "no" }],
    ];
    for (const [path, label, body] of routes) {
      warn.mockClear();
      const refused = await post(t, path, { ...body, ...guest });
      expect({ path, status: refused.status, error: refused.json.error }).toEqual({
        path,
        status: 400,
        error: expect.stringMatching(/Not authorised/),
      });
      // Had callerId been left behind, the room's host would have been assumed and the reason would be "wrong token"
      expect(authLines(), path).toEqual([`auth: ${label} not the host`]);
    }
    expect(await roomStatus(w)).toBe("active");
    expect(await person(w, victim)).not.toBeNull();
    expect(await messageStatus(w, messageId)).toBe("pending");
    expect((await truthOrDare(w))?.currentTurn?.translatedResponseText).toBeUndefined();
  });

  test("enforce: a caller token sent as `token`, the name the functions use, is not read: only callerToken is", async () => {
    const { t, w, roomId, hostId } = await roomOverHttp();
    const bodies: Array<[string, Record<string, unknown>]> = [
      ["/api/messages/send-text", { roomId, senderId: hostId, text: "hi" }],
      ["/api/participants/set-typing", { participantId: hostId, action: "typing" }],
      ["/api/emoji-match/create-lobby", { roomId, hostParticipantId: hostId }],
      ["/api/word-rush/create-lobby", { roomId, hostParticipantId: hostId }],
      ["/api/rooms/background", { roomId, background: 4 }],
      ["/api/rooms/close", { roomId }],
    ];
    for (const [path, body] of bodies) {
      const refused = await post(t, path, { ...body, callerId: hostId, token: HOST });
      expect({ path, status: refused.status, error: refused.json.error }).toEqual({
        path,
        status: 400,
        error: expect.stringMatching(/Not authorised/),
      });
    }
    // Still open, and nothing was said
    expect([await roomStatus(w), await countMessages(w, "text")]).toEqual(["active", 0]);
  });

  test("enforce: an installed build, which sends no token and names no caller, keeps working in a room it made", async () => {
    const t = newBackend();
    setMode("enforce");
    const created = await post(t, "/api/rooms/create", { hostNickname: "Old build", hostAvatarId: "cat" });
    const { roomId, hostId } = created.json as { roomId: Id<"rooms">; hostId: Pid };
    const guestId = await joinGuest(t, roomId, "Guest");
    warn.mockClear();

    const ok = async (path: string, body: Record<string, unknown>) => {
      const answer = await post(t, path, body);
      expect({ path, status: answer.status, error: answer.json?.error }).toEqual({ path, status: 200, error: undefined });
      return answer.json;
    };
    await ok("/api/participants/set-online", { participantId: hostId, online: true, presence: "online" });
    await ok("/api/participants/set-typing", { participantId: hostId, action: "typing" });
    await ok("/api/participants/set-language", { participantId: hostId, language: "en" });
    await ok("/api/rooms/push-token", { roomId, hostId, token: APNS });
    await ok("/api/storage/generate-upload-url", {});
    const { messageId } = await ok("/api/messages/send-text", { roomId, senderId: hostId, text: "hello", clientId: "c1" });
    await ok("/api/messages/submit-processed", { messageId, processing: { translatedText: "やあ" } });
    await ok("/api/reactions/add", { messageId, participantId: hostId, emoji: "👍" });
    const match = await ok("/api/emoji-match/create-lobby", { roomId, hostParticipantId: hostId });
    await ok("/api/emoji-match/timeout-turn", { gameId: match.gameId, participantId: hostId });
    await ok("/api/emoji-match/resolve-mismatch", { gameId: match.gameId });
    await ok("/api/emoji-bingo/create-lobby", { roomId, hostParticipantId: hostId });
    await ok("/api/truth-or-dare/create", { roomId, hostParticipantId: hostId });
    await ok("/api/word-rush/create-lobby", { roomId, hostParticipantId: hostId });
    await ok("/api/games/start", { roomId, participantId: hostId, gameType: "lost_in_translation" });
    await ok("/api/games/cancel", { roomId, participantId: hostId });
    await ok("/api/participants/kick", { participantId: guestId, roomId });
    await ok("/api/messages/delete", { messageId });
    await ok("/api/rooms/close", { roomId });

    expect((await t.query(api.rooms.getRoomState, { roomId }))?.room.status).toBe("closed");
    expect(authLines()).toEqual([]);
  });

  test("enforce: the Emojifyr routes take no caller, and are not upset by the callerId and callerToken a current build adds to every body", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "🐱\n猫" }] }), { status: 200 }))
    );
    for (const sendsCaller of [false, true]) {
      setMode(undefined);
      const { t, roomId, hostId, guestId, host } = await roomOverHttp();
      warn.mockClear();
      const ok = async (path: string, body: Record<string, unknown>) => {
        const answer = await post(t, path, sendsCaller ? { ...body, ...host } : body);
        expect({ path, sendsCaller, status: answer.status, error: answer.json?.error }).toEqual({
          path,
          sendsCaller,
          status: 200,
          error: undefined,
        });
        return answer.json;
      };

      const { sessionId: gameSessionId } = await ok("/api/emojifyr/start", { roomId, createdByParticipantId: hostId });
      expect((await ok("/api/emojifyr/active-session", { roomId }))._id).toBe(gameSessionId);
      const round = await ok("/api/emojifyr/current-round", { gameSessionId });
      await ok("/api/emojifyr/submit-sentence", { roundId: round._id, sentence: "A cat on a train" });
      await ok("/api/emojifyr/update-sentence", { roundId: round._id, sentence: "A cat on a fast train" });
      expect((await ok("/api/emojifyr/generate-emoji-clue", { sentence: "A cat on a fast train" })).emojiClue).toBe("🐱\n猫");
      await ok("/api/emojifyr/submit-emoji-clue", { roundId: round._id, emojiClue: "🐱🚃" });
      await ok("/api/emojifyr/submit-guess", { roundId: round._id, participantId: guestId, guessText: "cat train" });
      expect((await ok("/api/emojifyr/guesses", { roundId: round._id })).length).toBe(1);
      await ok("/api/emojifyr/reveal", { roundId: round._id });
      expect((await ok("/api/emojifyr/game-state", { roomId })).currentRound.status).toBe("reveal");
      await ok("/api/emojifyr/advance-round", { gameSessionId });
      await ok("/api/emojifyr/cancel", { gameSessionId });
      expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();

      expect(authLines()).toEqual([]);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Secrecy
// ═════════════════════════════════════════════════════════════════════════════

describe("a registered token never comes back", () => {
  test("no public query and no read route returns a caller token or the host's device token, in whole or in part", async () => {
    const t = newBackend();
    const UPGRADED = hex("7c");
    const tokens = [HOST, GUEST, SECOND_GUEST, UPGRADED, APNS];

    // What the two calls that register a token answer
    const answers: unknown[] = [];
    const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Host", hostToken: HOST });
    answers.push(created);
    const { roomId, joinCode, hostId } = created;
    const guestId = await joinGuest(t, roomId, "Guest", { token: GUEST });
    const secondId = await joinGuest(t, roomId, "Second", { avatar: "owl", token: SECOND_GUEST });
    // A legacy participant who came back with a token: the other way a secret gets written
    const oldId = await joinGuest(t, roomId, "Old", { avatar: "cat" });
    await t.mutation(api.participants.leaveRoom, { participantId: oldId });
    answers.push(guestId, secondId, await joinGuest(t, roomId, "Old", { avatar: "cat", token: UPGRADED }));
    answers.push(await t.mutation(api.participants.setHostPushToken, { roomId, hostId, token: APNS, callerToken: HOST }));
    const tokenOf = new Map<Pid, string>([
      [hostId, HOST],
      [guestId, GUEST],
      [secondId, SECOND_GUEST],
      [oldId, UPGRADED],
    ]);
    expect((await allSecrets(t)).map((s) => s.token).sort()).toEqual([HOST, GUEST, SECOND_GUEST, UPGRADED].sort());
    expect(await deviceTokens(t, roomId)).toEqual([APNS]);

    const asked = new Set<string>();
    const seen: string[] = [JSON.stringify(answers)];
    /** Runs a public query, which must find something: an empty answer hides nothing and proves nothing */
    const ask = async (query: any, args: Record<string, unknown>): Promise<any> => {
      const name = getFunctionName(query);
      const result = await t.query(query, args as any);
      expect(result === null || (Array.isArray(result) && result.length === 0), `${name} found nothing`).toBe(false);
      asked.add(name);
      seen.push(JSON.stringify(result));
      return result;
    };
    const read = async (path: string, body: Record<string, unknown>) => {
      const answer = await post(t, path, body);
      expect([path, answer.status]).toEqual([path, 200]);
      expect(answer.json === null || (Array.isArray(answer.json) && answer.json.length === 0), `${path} found nothing`).toBe(false);
      seen.push(answer.text);
    };

    // ── The room and its chat ──
    const messageId = await t.mutation(api.messages.sendTextMessage, { roomId, senderId: guestId, text: "hello", token: GUEST });
    await t.mutation(api.messages.sendDrawingMessage, { roomId, senderId: hostId, mediaUrl: PNG, token: HOST });
    await t.mutation(api.reactions.addReaction, { messageId, participantId: secondId, emoji: "👍", token: SECOND_GUEST });
    await ask(api.rooms.getRoomByJoinCode, { joinCode });
    await ask(api.rooms.getRoomState, { roomId });
    await ask(api.participants.getRoomParticipants, { roomId });
    await ask(api.messages.getRoomMessages, { roomId });
    await ask(api.messages.getMessageById, { messageId });
    await ask(api.messages.getPendingMessagesForProcessor, { roomId });
    await ask(api.reactions.getReactionsForMessage, { messageId });
    await ask(api.reactions.getReactionSummary, { messageId });
    await ask(api.reactions.getRoomReactionSummaries, { roomId });
    await read("/api/rooms/state", { roomId });
    await read("/api/messages/list", { roomId });
    await read("/api/messages/pending", { roomId });
    await read("/api/reactions/room-summaries", { roomId });

    // ── Emojifyr, which cannot run beside Lost in Translation ──
    const emojifyrId = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });
    const round = await ask(api.games.getCurrentEmojifyrRound, { gameSessionId: emojifyrId });
    await t.mutation(api.games.submitEmojifyrSentence, { roundId: round._id, sentence: "A cat on a train" });
    await t.mutation(api.games.submitEmojifyrEmojiClue, { roundId: round._id, emojiClue: "🐱🚃" });
    await t.mutation(api.games.submitEmojifyrGuess, { roundId: round._id, participantId: guestId, guessText: "cat train" });
    await ask(api.games.getActiveEmojifyrSession, { roomId });
    await ask(api.games.getEmojifyrRoundById, { roundId: round._id });
    await ask(api.games.getEmojifyrGuesses, { roundId: round._id });
    await ask(api.games.getEmojifyrGameState, { roomId });
    await read("/api/emojifyr/active-session", { roomId });
    await read("/api/emojifyr/current-round", { gameSessionId: emojifyrId });
    await read("/api/emojifyr/guesses", { roundId: round._id });
    await read("/api/emojifyr/game-state", { roomId });
    await t.mutation(api.games.cancelEmojifyr, { gameSessionId: emojifyrId });

    // ── Lost in Translation, with the first drawing in ──
    const everyone = [hostId, guestId, secondId, oldId];
    const sessionId = await t.mutation(api.games.startGame, { roomId, participantId: hostId, gameType: "lost_in_translation", token: HOST });
    let drawer: Pid | undefined;
    for (const id of everyone) {
      const step = await t.query(api.games.getMyActiveStep, { participantId: id });
      if (!step) continue;
      drawer = id;
      await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: id, outputDrawingUrl: PNG, token: tokenOf.get(id) });
      break;
    }
    const guesser = everyone.find((id) => id !== drawer)!;
    await ask(api.games.getActiveGameSession, { roomId });
    await ask(api.games.getMyActiveStep, { participantId: guesser });
    await ask(api.games.getGameStatus, { roomId });
    await ask(api.games.getLatestGameSession, { roomId });
    await ask(api.games.getGameReplay, { gameSessionId: sessionId });
    await read("/api/games/active-session", { roomId });
    await read("/api/games/my-active-step", { participantId: guesser });
    await read("/api/games/status", { roomId });
    await read("/api/games/latest-session", { roomId });
    await read("/api/games/replay", { gameSessionId: sessionId });

    // ── Emoji Match, with a card turned ──
    const matchId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId, token: HOST });
    await t.mutation(api.emojiMatch.joinLobby, { gameId: matchId, participantId: guestId, token: GUEST });
    await t.mutation(api.emojiMatch.startGame, { gameId: matchId, participantId: hostId, token: HOST });
    const match = await ask(api.emojiMatch.getEmojiMatchById, { gameId: matchId });
    const turn: Pid = match.currentTurnParticipantId;
    await t.mutation(api.emojiMatch.flipCard, { gameId: matchId, participantId: turn, cardId: "card_0", token: tokenOf.get(turn) });
    await ask(api.emojiMatch.getActiveEmojiMatch, { roomId });
    await ask(api.emojiMatch.getEmTraceByRoom, { roomId });
    await read("/api/emoji-match/active", { roomId });
    await read("/api/emoji-match/state", { gameId: matchId });

    // ── Emoji Bingo ──
    const bingoId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId, token: HOST });
    await t.mutation(api.emojiBingo.joinLobby, { gameId: bingoId, participantId: guestId, token: GUEST });
    await t.mutation(api.emojiBingo.startGame, { gameId: bingoId, participantId: hostId, token: HOST });
    await ask(api.emojiBingo.getActiveEmojiBingo, { roomId });
    await ask(api.emojiBingo.getEmojiBingoById, { gameId: bingoId });
    await read("/api/emoji-bingo/active", { roomId });
    await read("/api/emoji-bingo/state", { gameId: bingoId });

    // ── Truth or Dare, with a choice made ──
    const todId = await t.mutation(api.truthOrDare.createGame, { roomId, hostParticipantId: hostId, token: HOST });
    const dealt = await ask(api.truthOrDare.getActiveTruthOrDare, { roomId });
    const holder: Pid = dealt.currentTurnParticipantId;
    await t.mutation(api.truthOrDare.submitChoice, { gameId: todId, participantId: holder, choice: "truth", token: tokenOf.get(holder) });
    await ask(api.truthOrDare.getTrace, { gameId: todId });
    await ask(api.truthOrDare.getTraceByRoom, { roomId });
    await read("/api/truth-or-dare/active", { roomId });

    // ── Word Rush ──
    const rushId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, token: HOST });
    await t.mutation(api.wordRush.joinLobby, { gameId: rushId, participantId: guestId, token: GUEST });
    await ask(api.wordRush.getState, { roomId });
    await read("/api/word-rush/state", { roomId });

    // Every public query there is was asked. A new one has to be added above before this passes
    expect([...asked].sort()).toEqual((await publicFunctions("isQuery")).map((f) => f.name));

    const everything = seen.join("\n");
    // The search has the room's people in it, so it is a search of real answers
    for (const id of everyone) expect(everything.includes(id), `participant ${id} appears in what was read`).toBe(true);
    expectNoToken(everything, tokens, "what the queries and read routes returned");
  });
});
