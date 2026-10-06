// /api/rooms/snapshot (convex/httpRooms.ts): what one refresh of the host app reads in ten or eleven requests,
// in one answer. The host app refreshes from it and decodes each section as it decodes the body of that
// section's route (apps/ios/Services/API/RealEnchattoAPI.swift), so this file holds every section equal
// to the body of the route it stands for: both are asked in the same instant, with the same caller and token,
// in each state a room can be in and under each switch. Three things are the snapshot's own and are tested as
// such: "nothing here" is null where a route answers {"ok":true}; the Word Rush section is the game itself
// where its route answers {"game": …}; and a section can be left out, by the caller (`skip`) or because its
// query was refused (`errors`).
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MockInstance } from "vitest";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getActiveEmojiBingo } from "../../convex/emojiBingo";
import { getActiveEmojiMatch } from "../../convex/emojiMatch";
import { getActiveGameSession, getGameStatus, getLatestGameSession, getMyActiveStep } from "../../convex/games";
import http from "../../convex/http";
import { getRoomMessages } from "../../convex/messages";
import { getRoomReactionSummaries } from "../../convex/reactions";
import { getRoomState } from "../../convex/rooms";
import { getActiveTruthOrDare } from "../../convex/truthOrDare";
import { getState as getWordRushState } from "../../convex/wordRush";
import { Backend, joinGuest, newBackend, tokenFor, withoutReactionsByRoom } from "./setup";

type PID = Id<"participants">;
type RoomId = Id<"rooms">;

const SNAPSHOT = "/api/rooms/snapshot";
const HOST = tokenFor(1);
const ANN = tokenFor(2);
const BEN = tokenFor(3);
const CY = tokenFor(4);
/** A token in the right format that nobody registered */
const NOBODYS = tokenFor(99);

const PNG = "data:image/png;base64,iVBORw0KGgo=";

let consoleWarn: MockInstance<typeof console.warn>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-05T12:00:00Z"));
  // games.ts logs every step
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  consoleWarn = vi.spyOn(console, "warn");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

// ─── The snapshot and the routes it stands for ───────────────────────────────

/**
 * What the snapshot reads, in the order it reads it: the sections of the answer, the route the host app gets
 * them from today, whether that route is asked by room or by participant, and the query behind both. `core`:
 * the request cannot be answered without it.
 */
const SOURCES = [
  { sections: ["room", "participants"], path: "/api/rooms/state", by: "roomId", query: getRoomState, core: true },
  { sections: ["messages"], path: "/api/messages/list", by: "roomId", query: getRoomMessages, core: true },
  { sections: ["reactions"], path: "/api/reactions/room-summaries", by: "roomId", query: getRoomReactionSummaries, core: false },
  { sections: ["activeSession"], path: "/api/games/active-session", by: "roomId", query: getActiveGameSession, core: false },
  { sections: ["gameStatus"], path: "/api/games/status", by: "roomId", query: getGameStatus, core: false },
  { sections: ["myActiveStep"], path: "/api/games/my-active-step", by: "participantId", query: getMyActiveStep, core: false },
  { sections: ["latestSession"], path: "/api/games/latest-session", by: "roomId", query: getLatestGameSession, core: false },
  { sections: ["wordRush"], path: "/api/word-rush/state", by: "roomId", query: getWordRushState, core: false },
  { sections: ["emojiMatch"], path: "/api/emoji-match/active", by: "roomId", query: getActiveEmojiMatch, core: false },
  { sections: ["emojiBingo"], path: "/api/emoji-bingo/active", by: "roomId", query: getActiveEmojiBingo, core: false },
  { sections: ["truthOrDare"], path: "/api/truth-or-dare/active", by: "roomId", query: getActiveTruthOrDare, core: false },
] as const;

type Source = (typeof SOURCES)[number];
const ALONE = SOURCES.filter((source) => !source.core);
const CORE = SOURCES.filter((source) => source.core);
const SECTIONS: string[] = SOURCES.flatMap((source) => [...source.sections]);

/** What a request is asked with: the room, whose step, and whatever the client says of its caller */
type Ask = { roomId: unknown; participantId: unknown; [key: string]: unknown };

async function post(t: Backend, path: string, body: unknown) {
  const res = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

/** A route's answer to "nothing here": the query gave null, and jsonAction sends this in its place */
function saysNothing(body: unknown): boolean {
  return JSON.stringify(body) === '{"ok":true}';
}

/**
 * The snapshot the routes add up to: each route is asked as the host app asks it today, with this caller and
 * token, and its body becomes its section. The differences from a plain copy are the three the snapshot
 * means to have: null for {"ok":true}, the room route's two keys as two sections, and Word Rush unwrapped.
 */
async function fromRoutes(t: Backend, ask: Ask): Promise<Record<string, unknown>> {
  // Everything else the request carries goes to every route, as ConvexHTTPClient adds the caller to every body
  const { roomId: _roomId, participantId: _participantId, ...caller } = ask;

  const snapshot: Record<string, unknown> = { v: 1 };
  for (const source of SOURCES) {
    const answer = await post(t, source.path, { [source.by]: ask[source.by], ...caller });
    expect({ path: source.path, status: answer.status }).toEqual({ path: source.path, status: 200 });
    if (source.path === "/api/rooms/state") {
      // A room that does not exist: both sections are null
      snapshot.room = saysNothing(answer.body) ? null : answer.body.room;
      snapshot.participants = saysNothing(answer.body) ? null : answer.body.participants;
    } else if (source.path === "/api/word-rush/state") {
      // The one section that is not its route's body. The route answers {"game": the game or null}, which is
      // what RealEnchattoAPI.getWordRushState decodes; the section is what is inside: the query's own result
      expect(Object.keys(answer.body)).toEqual(["game"]);
      snapshot.wordRush = answer.body.game;
    } else {
      snapshot[source.sections[0]] = saysNothing(answer.body) ? null : answer.body;
    }
  }
  snapshot.errors = [];
  return snapshot;
}

/** Asks for the snapshot and for the routes it stands for, and holds the one equal to the others. Gives the snapshot */
async function sameAsRoutes(t: Backend, ask: Ask) {
  const snapshot = await post(t, SNAPSHOT, ask);
  expect(snapshot).toStrictEqual({ status: 200, body: await fromRoutes(t, ask) });
  return snapshot.body;
}

/**
 * Makes a query fail with this message for the rest of the test. convex-test runs a registered function's
 * `_handler`, so the query fails for the snapshot and for its own route alike; the tests below check the
 * second, which is what tells them the stub is in place.
 */
function failWith(query: unknown, message: string) {
  return vi.spyOn(query as { _handler: () => Promise<unknown> }, "_handler").mockRejectedValue(new Error(message));
}

/** Counts a query's runs and leaves it working */
function watch(query: unknown) {
  return vi.spyOn(query as { _handler: () => Promise<unknown> }, "_handler");
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

type Room = { t: Backend; roomId: RoomId; hostId: PID; guests: PID[]; tokenOf: Map<PID, string | undefined> };

/**
 * Moves the clock on a second without running anything scheduled, so every write of a fixture has an instant
 * of its own, as writes seconds apart have, and nothing a write scheduled (a translation, a round's deadline)
 * runs between the snapshot and the routes it is compared with.
 */
function tick() {
  vi.setSystemTime(Date.now() + 1000);
}

/**
 * A room as the two apps make one: an English-speaking host and up to three guests (Ann, Ben, Cy), each with
 * the token they registered when they came in. `tokens: false`: nobody registered one, as before tokens.
 */
async function openRoom(options: { guests?: number; tokens?: boolean } = {}): Promise<Room> {
  const t = newBackend();
  const tokens = options.tokens ?? true;
  const created = await t.mutation(api.rooms.createRoom, {
    hostNickname: "Host",
    hostAvatarId: "bear",
    hostLanguage: "en",
    hostToken: tokens ? HOST : undefined,
    background: 17,
  });
  const room: Room = { t, roomId: created.roomId, hostId: created.hostId, guests: [], tokenOf: new Map() };
  room.tokenOf.set(room.hostId, tokens ? HOST : undefined);
  const guests = [
    { name: "Ann", avatar: "fox", token: ANN },
    { name: "Ben", avatar: "cat", token: BEN },
    { name: "Cy", avatar: "owl", token: CY },
  ];
  for (const guest of guests.slice(0, options.guests ?? 2)) {
    tick();
    const token = tokens ? guest.token : undefined;
    const guestId = await joinGuest(t, room.roomId, guest.name, { avatar: guest.avatar, token });
    room.guests.push(guestId);
    room.tokenOf.set(guestId, token);
  }
  return room;
}

function everyone(room: Room): PID[] {
  return [room.hostId, ...room.guests];
}

/** What the host app sends with every request: whose step it wants, and itself as the caller */
function asHost(room: Room): Ask {
  return { roomId: room.roomId, participantId: room.hostId, callerId: room.hostId, callerToken: room.tokenOf.get(room.hostId) };
}

/** A chat: a translated message, an answer to it still waiting for its translation, and reactions on both */
async function chat(room: Room) {
  const { t, roomId, hostId, guests } = room;
  const [ann] = guests;
  tick();
  const first = await t.mutation(api.messages.sendTextMessage, { roomId, senderId: ann, text: "hello", token: room.tokenOf.get(ann) });
  tick();
  await t.mutation(api.messages.submitProcessedMessage, {
    messageId: first,
    processing: { translatedText: "こんにちは", romaji: "konnichiwa", suggestions: ["やあ"] },
    callerId: hostId,
    token: room.tokenOf.get(hostId),
  });
  tick();
  const second = await t.mutation(api.messages.sendTextMessage, {
    roomId,
    senderId: hostId,
    text: "やあ",
    replyToId: first,
    clientId: "ios-1",
    token: room.tokenOf.get(hostId),
  });
  for (const [messageId, participantId, emoji] of [
    [first, hostId, "👍"],
    [first, ann, "👍"],
    [first, ann, "❤️"],
    [second, ann, "😂"],
  ] as const) {
    tick();
    await t.mutation(api.reactions.addReaction, { messageId, participantId, emoji, token: room.tokenOf.get(participantId) });
  }
  return { first, second };
}

// ── Lost in Translation ──

async function startLostInTranslation(room: Room, extra: { teams?: "auto" } = {}) {
  tick();
  return await room.t.mutation(api.games.startGame, {
    roomId: room.roomId,
    participantId: room.hostId,
    gameType: "lost-in-translation",
    token: room.tokenOf.get(room.hostId),
    ...extra,
  });
}

async function stepOf(room: Room, participantId: PID) {
  return await room.t.query(api.games.getMyActiveStep, { participantId, token: room.tokenOf.get(participantId) });
}

/** Whoever holds the round's drawing step sends their drawing in. Gives who that was */
async function draw(room: Room): Promise<PID> {
  for (const participantId of everyone(room)) {
    const step = await stepOf(room, participantId);
    if (step?.stepType !== "draw") continue;
    tick();
    await room.t.mutation(api.games.submitGameStep, {
      stepId: step._id,
      participantId,
      outputDrawingUrl: PNG,
      token: room.tokenOf.get(participantId),
    });
    return participantId;
  }
  throw new Error("Nobody holds a drawing step");
}

/** Everyone who holds a guess answers it, the first of them with the right option and the others with a wrong one */
async function guess(room: Room) {
  let right = true;
  for (const participantId of everyone(room)) {
    const step = await stepOf(room, participantId);
    if (step?.stepType !== "guess") continue;
    const prompt = await room.t.run(async (ctx) => (await ctx.db.get(step.chainId))!.originalPrompt);
    tick();
    await room.t.mutation(api.games.submitGameStep, {
      stepId: step._id,
      participantId,
      selectedOption: right ? prompt : step.options!.find((option) => option !== prompt)!,
      token: room.tokenOf.get(participantId),
    });
    right = false;
  }
  if (right) throw new Error("Nobody holds a guess step");
}

/** A game in its second round: the host drew the first, the first guest has drawn the second, and the host holds a guess */
async function hostGuessing(options: { tokens?: boolean } = {}): Promise<Room> {
  const room = await openRoom(options);
  await startLostInTranslation(room);
  expect(await draw(room)).toBe(room.hostId);
  await guess(room);
  expect(await draw(room)).toBe(room.guests[0]);
  return room;
}

// ── The other four games ──

/** The stored row of a game: who holds the turn, and for Emoji Match which cards are a pair, whatever a query shows of it */
async function stored<Table extends "emojiMatchGames" | "emojiBingoGames" | "truthOrDareGames">(room: Room, gameId: Id<Table>) {
  const game = await room.t.run(async (ctx) => await ctx.db.get(gameId));
  if (!game) throw new Error("The game is missing");
  return game;
}

async function emojiMatchLobby(room: Room) {
  const { t, roomId, hostId, guests, tokenOf } = room;
  tick();
  const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId, token: tokenOf.get(hostId) });
  tick();
  await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guests[0], token: tokenOf.get(guests[0]) });
  return gameId;
}

async function emojiMatchStarted(room: Room) {
  const gameId = await emojiMatchLobby(room);
  tick();
  await room.t.mutation(api.emojiMatch.startGame, { gameId, participantId: room.hostId, token: room.tokenOf.get(room.hostId) });
  return gameId;
}

/** Whoever holds the turn turns this card over */
async function flip(room: Room, gameId: Id<"emojiMatchGames">, cardId: string) {
  const participantId = (await stored(room, gameId)).currentTurnParticipantId as PID;
  tick();
  await room.t.mutation(api.emojiMatch.flipCard, { gameId, participantId, cardId, token: room.tokenOf.get(participantId) });
}

/** Of the cards still face down: [a card, its pair, a card that is not its pair]. The last pair has no third */
async function faceDown(room: Room, gameId: Id<"emojiMatchGames">): Promise<[string, string, string | undefined]> {
  const open = (await stored(room, gameId)).board.filter((card) => !card.isMatched && !card.isRevealed);
  const [first] = open;
  const pair = open.find((card) => card.cardId !== first.cardId && card.pairKey === first.pairKey)!;
  const other = open.find((card) => card.pairKey !== first.pairKey);
  return [first.cardId, pair.cardId, other?.cardId];
}

async function emojiBingoStarted(room: Room) {
  const { t, roomId, hostId, guests, tokenOf } = room;
  tick();
  const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId, token: tokenOf.get(hostId) });
  tick();
  await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: guests[0], token: tokenOf.get(guests[0]) });
  tick();
  await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId, token: tokenOf.get(hostId) });
  return gameId;
}

async function wordRushLobby(room: Room) {
  const { t, roomId, hostId, guests, tokenOf } = room;
  const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, token: tokenOf.get(hostId) });
  // The lobby's deck is dealt by a function the lobby schedules to run at once. Nothing else in these rooms is
  // due within the millisecond: a game's round watcher is seconds away
  vi.advanceTimersByTime(1);
  await t.finishInProgressScheduledFunctions();
  tick();
  await t.mutation(api.wordRush.joinLobby, { gameId, participantId: guests[0], token: tokenOf.get(guests[0]) });
  return gameId;
}

// ─── Every state of a room ───────────────────────────────────────────────────

/** A state by its name, how a room gets into it, and what the snapshot must then show: the comparison is not of two empty answers */
type State = [name: string, build: () => Promise<Room>, shows: Record<string, unknown>];

const NO_GAME = {
  activeSession: null,
  gameStatus: null,
  myActiveStep: null,
  latestSession: null,
  wordRush: null,
  emojiMatch: null,
  emojiBingo: null,
  truthOrDare: null,
};

const STATES: State[] = [
  [
    "a room just opened, with its host alone",
    () => openRoom({ guests: 0 }),
    // "waiting" until the first guest comes in
    {
      room: { status: "waiting", background: 17, reactionsByRoom: true },
      participants: [{ nickname: "Host", role: "host" }],
      messages: [],
      reactions: [],
      ...NO_GAME,
    },
  ],
  [
    "a chat with reactions and no game",
    async () => {
      const room = await openRoom();
      await chat(room);
      return room;
    },
    {
      participants: [{ nickname: "Host" }, { nickname: "Ann" }, { nickname: "Ben" }],
      // Two join lines, then the chat
      messages: [
        { kind: "system" },
        { kind: "system" },
        { text: "hello", status: "processed", processing: { translatedText: "こんにちは" } },
        { text: "やあ", status: "pending" },
      ],
      reactions: [
        { reactions: [{ emoji: "👍", count: 2 }, { emoji: "❤️", count: 1 }] },
        { reactions: [{ emoji: "😂", count: 1 }] },
      ],
      ...NO_GAME,
    },
  ],
  [
    // No reactionsByRoom on the room and no roomId on its reactions: they are found through the messages
    "the same chat in a room from before reactions carried their room",
    async () => {
      const room = await openRoom();
      await chat(room);
      await withoutReactionsByRoom(room.t, room.roomId);
      return room;
    },
    {
      room: expect.not.objectContaining({ reactionsByRoom: expect.anything() }),
      reactions: [
        { reactions: [{ emoji: "👍", count: 2 }, { emoji: "❤️", count: 1 }] },
        { reactions: [{ emoji: "😂", count: 1 }] },
      ],
      ...NO_GAME,
    },
  ],
  [
    "Lost in Translation, the host drawing the first round",
    async () => {
      const room = await openRoom();
      await chat(room);
      await startLostInTranslation(room);
      return room;
    },
    {
      activeSession: { status: "active", gameType: "lost-in-translation" },
      gameStatus: { currentRound: 1, phase: "drawing" },
      myActiveStep: { stepType: "draw", round: 1 },
      latestSession: { status: "active" },
    },
  ],
  [
    "Lost in Translation, the guests guessing at the host's drawing",
    async () => {
      const room = await openRoom();
      await startLostInTranslation(room);
      await draw(room);
      return room;
    },
    { activeSession: { status: "active" }, gameStatus: { currentRound: 1, phase: "guessing", guessesTotal: 2 }, myActiveStep: null },
  ],
  [
    "Lost in Translation, the host guessing at a guest's drawing",
    () => hostGuessing(),
    {
      activeSession: { status: "active" },
      gameStatus: { currentRound: 2, phase: "guessing" },
      myActiveStep: { stepType: "guess", round: 2, inputDrawingUrl: PNG },
    },
  ],
  [
    "Lost in Translation played as two teams",
    async () => {
      const room = await openRoom({ guests: 3 });
      await startLostInTranslation(room, { teams: "auto" });
      await draw(room);
      return room;
    },
    { activeSession: { status: "active", teams: [expect.any(Array), expect.any(Array)] }, gameStatus: { phase: "guessing" } },
  ],
  [
    "Lost in Translation finished",
    async () => {
      const room = await openRoom();
      await startLostInTranslation(room);
      for (let round = 1; round <= 10; round++) {
        await draw(room);
        await guess(room);
      }
      return room;
    },
    { activeSession: null, gameStatus: null, myActiveStep: null, latestSession: { status: "complete", gameType: "lost-in-translation" } },
  ],
  [
    "Lost in Translation ended by the host in its first round",
    async () => {
      const room = await openRoom();
      await startLostInTranslation(room);
      tick();
      await room.t.mutation(api.games.cancelGame, { roomId: room.roomId, participantId: room.hostId, token: HOST });
      return room;
    },
    {
      activeSession: null,
      gameStatus: null,
      myActiveStep: null,
      // A game that was ended is stored as complete; the chat says how it ended
      latestSession: { status: "complete" },
      messages: expect.arrayContaining([expect.objectContaining({ text: "game_cancelled:Lost in Translation" })]),
    },
  ],
  [
    // The session queries leave Emojifyr out; the step query takes whichever session is active
    "an Emojifyr session, which is not a game these sections know",
    async () => {
      const room = await openRoom();
      tick();
      await room.t.mutation(api.games.startEmojifyr, { roomId: room.roomId, createdByParticipantId: room.hostId });
      return room;
    },
    NO_GAME,
  ],
  [
    "an Emoji Match lobby",
    async () => {
      const room = await openRoom();
      await emojiMatchLobby(room);
      return room;
    },
    { emojiMatch: { status: "lobby", players: [{}, {}] }, emojiBingo: null },
  ],
  [
    "Emoji Match in play, one card turned over",
    async () => {
      const room = await openRoom();
      const gameId = await emojiMatchStarted(room);
      await flip(room, gameId, (await faceDown(room, gameId))[0]);
      return room;
    },
    { emojiMatch: { status: "active", board: expect.arrayContaining([expect.objectContaining({ isRevealed: true })]) } },
  ],
  [
    "Emoji Match with a miss on show",
    async () => {
      const room = await openRoom();
      const gameId = await emojiMatchStarted(room);
      const [first, , other] = await faceDown(room, gameId);
      await flip(room, gameId, first);
      await flip(room, gameId, other!);
      return room;
    },
    { emojiMatch: { status: "resolving" } },
  ],
  [
    "Emoji Match finished",
    async () => {
      const room = await openRoom();
      const gameId = await emojiMatchStarted(room);
      for (let pair = 1; pair <= 8; pair++) {
        const [first, second] = await faceDown(room, gameId);
        await flip(room, gameId, first);
        await flip(room, gameId, second);
      }
      return room;
    },
    { emojiMatch: { status: "completed" } },
  ],
  [
    "Emoji Bingo in play, the first emoji called",
    async () => {
      const room = await openRoom();
      const gameId = await emojiBingoStarted(room);
      const participantId = (await stored(room, gameId)).currentTurnParticipantId as PID;
      tick();
      await room.t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId, token: room.tokenOf.get(participantId) });
      return room;
    },
    { emojiBingo: { status: "active", calledEmojis: [expect.any(String)] }, emojiMatch: null },
  ],
  [
    "Truth or Dare, a truth chosen and its answer awaited",
    async () => {
      const room = await openRoom();
      const { t, roomId, hostId, tokenOf } = room;
      tick();
      const gameId = await t.mutation(api.truthOrDare.createGame, { roomId, hostParticipantId: hostId, token: tokenOf.get(hostId) });
      const participantId = (await stored(room, gameId)).currentTurnParticipantId as PID;
      tick();
      await t.mutation(api.truthOrDare.submitChoice, { gameId, participantId, choice: "truth", token: tokenOf.get(participantId) });
      return room;
    },
    { truthOrDare: { status: "active", currentTurn: { choice: "truth" } } },
  ],
  [
    "a Word Rush lobby",
    async () => {
      const room = await openRoom();
      await wordRushLobby(room);
      return room;
    },
    { wordRush: { status: "lobby", card: null, players: [{}, {}] } },
  ],
  [
    "Word Rush in play, its first card up",
    async () => {
      const room = await openRoom();
      const gameId = await wordRushLobby(room);
      tick();
      await room.t.mutation(api.wordRush.start, { gameId, participantId: room.hostId, token: HOST });
      return room;
    },
    { wordRush: { status: "active", card: expect.any(Object) } },
  ],
  [
    "a closed room",
    async () => {
      const room = await openRoom();
      await chat(room);
      tick();
      await room.t.mutation(api.rooms.closeRoom, { roomId: room.roomId, callerId: room.hostId, token: HOST });
      return room;
    },
    { room: { status: "closed" }, participants: [{}, {}, {}], ...NO_GAME },
  ],
  [
    // Closing a room ends none of its games: their routes go on answering with them, and so do their sections
    "a closed room with its games still in it",
    async () => {
      const room = await openRoom();
      const { t, roomId, hostId, tokenOf } = room;
      await startLostInTranslation(room);
      await emojiMatchStarted(room);
      await emojiBingoStarted(room);
      await wordRushLobby(room);
      tick();
      await t.mutation(api.truthOrDare.createGame, { roomId, hostParticipantId: hostId, token: tokenOf.get(hostId) });
      tick();
      await t.mutation(api.rooms.closeRoom, { roomId, callerId: hostId, token: HOST });
      return room;
    },
    {
      room: { status: "closed" },
      activeSession: { status: "active" },
      gameStatus: { phase: "drawing" },
      myActiveStep: { stepType: "draw" },
      latestSession: { status: "active" },
      emojiMatch: { status: "active" },
      emojiBingo: { status: "active" },
      truthOrDare: { status: "active" },
      wordRush: { status: "lobby" },
    },
  ],
];

describe.each([undefined, "log", "enforce"])("with AUTH_MODE %j", (mode) => {
  test.each(STATES)("%s: every section is the body of its own route", async (_name, build, shows) => {
    const room = await build();
    if (mode) vi.stubEnv("AUTH_MODE", mode);
    consoleWarn.mockClear();

    const snapshot = await sameAsRoutes(room.t, asHost(room));
    expect(snapshot).toMatchObject(shows);

    // None of the queries looks at the caller, so in every mode the answer is the same whoever asks: a guest
    // with a guest's token, the host with a token nobody registered, the host with none, nobody at all
    // (LOST_IN_TRANSLATION_HIDE_ANSWER, which does make one section depend on the token, is off here)
    const { roomId, hostId: participantId, guests } = room;
    for (const caller of [
      { callerId: guests[0], callerToken: ANN },
      { callerId: participantId, callerToken: NOBODYS },
      { callerId: participantId },
      {},
    ]) {
      expect(await sameAsRoutes(room.t, { roomId, participantId, ...caller })).toStrictEqual(snapshot);
    }
    // And no call is written up as unauthorised: a poll every 2 s would fill the log
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});

// Every switch at once, on every state: what a section hides it hides as its route does, with the host's
// token and without one
describe("with AUTH_MODE enforce and both switches that hide answers on", () => {
  test.each(STATES)("%s: every section is the body of its own route", async (_name, build, shows) => {
    const room = await build();
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.stubEnv("LOST_IN_TRANSLATION_HIDE_ANSWER", "on");
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");

    const asked = await sameAsRoutes(room.t, asHost(room));
    expect(asked).toMatchObject(shows);

    const { myActiveStep, ...rest } = asked;
    const { myActiveStep: unproved, ...restUnproved } = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: room.hostId });
    // The step is the one section that needs the token; nothing else changes without it
    expect(unproved).toBeNull();
    expect(restUnproved).toStrictEqual(rest);
    if (myActiveStep) expect(myActiveStep).not.toHaveProperty("correctOption");
  });
});

test("the Word Rush section is the game itself or null, not the {game} its route wraps it in", async () => {
  const room = await openRoom();
  const ask = asHost(room);

  // No game: the route's body is {"game":null}, the section null
  expect((await post(room.t, "/api/word-rush/state", ask)).body).toStrictEqual({ game: null });
  expect((await post(room.t, SNAPSHOT, ask)).body.wordRush).toBeNull();

  const gameId = await wordRushLobby(room);
  const route = (await post(room.t, "/api/word-rush/state", ask)).body;
  const section = (await post(room.t, SNAPSHOT, ask)).body.wordRush;
  expect(route.game).toMatchObject({ _id: gameId, status: "lobby" });
  expect(section).toStrictEqual(route.game);
  expect(section).not.toHaveProperty("game");
});

// ─── The switches that hide answers ──────────────────────────────────────────

describe("LOST_IN_TRANSLATION_HIDE_ANSWER", () => {
  const SWITCH = "LOST_IN_TRANSLATION_HIDE_ANSWER";

  /** Who can be asking for the host's step, as [who, what the request says of its caller, whether that proves to be the host] */
  const CALLERS: Array<[string, (room: Room) => Record<string, unknown>, boolean]> = [
    ["the host's token", (room) => ({ callerId: room.hostId, callerToken: HOST }), true],
    // The token alone is the proof: the step is the host's whoever the request names as its caller
    ["the host's token and no caller id", () => ({ callerToken: HOST }), true],
    ["a guest's token", (room) => ({ callerId: room.guests[0], callerToken: ANN }), false],
    ["a token nobody registered", (room) => ({ callerId: room.hostId, callerToken: NOBODYS }), false],
    ["no token", (room) => ({ callerId: room.hostId }), false],
    ["a token that is not a string", (room) => ({ callerId: room.hostId, callerToken: 7 }), false],
    // On the routes the caller's token is callerToken; `token` is never read as one
    ["the host's token under the name token", (room) => ({ callerId: room.hostId, token: HOST }), false],
  ];

  describe.each([undefined, "log", "enforce"])("with AUTH_MODE %j", (mode) => {
    test.each(CALLERS)("off: asked with %s, the host's step is sent, and names the right option", async (_who, caller) => {
      const room = await hostGuessing();
      if (mode) vi.stubEnv("AUTH_MODE", mode);

      const snapshot = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: room.hostId, ...caller(room) });
      expect(snapshot.myActiveStep).toMatchObject({ stepType: "guess", assignedParticipantId: room.hostId });
      expect(snapshot.myActiveStep.options).toContain(snapshot.myActiveStep.correctOption);
    });

    test.each(CALLERS)("on: asked with %s", async (_who, caller, provesHost) => {
      const room = await hostGuessing();
      vi.stubEnv(SWITCH, "on");
      if (mode) vi.stubEnv("AUTH_MODE", mode);
      consoleWarn.mockClear();

      const snapshot = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: room.hostId, ...caller(room) });
      if (provesHost) {
        // The step, without the answer
        expect(snapshot.myActiveStep).toMatchObject({ stepType: "guess", assignedParticipantId: room.hostId, options: expect.any(Array) });
        expect(snapshot.myActiveStep).not.toHaveProperty("correctOption");
      } else {
        // Told there is no step, not refused: the rest of the room is still answered, and nothing is logged
        expect(snapshot.myActiveStep).toBeNull();
        expect(snapshot.activeSession).toMatchObject({ status: "active" });
      }
      expect(consoleWarn).not.toHaveBeenCalled();
    });
  });

  test("on: a guest's own token gets that guest's step, and the host's token does not", async () => {
    const room = await openRoom();
    await startLostInTranslation(room);
    await draw(room);
    vi.stubEnv(SWITCH, "on");
    const [ann] = room.guests;

    const own = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: ann, callerId: ann, callerToken: ANN });
    expect(own.myActiveStep).toMatchObject({ stepType: "guess", assignedParticipantId: ann });
    expect(own.myActiveStep).not.toHaveProperty("correctOption");

    const hosts = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: ann, callerId: room.hostId, callerToken: HOST });
    expect(hosts.myActiveStep).toBeNull();
  });

  test.each([undefined, "on"])("%j: a player with no token on record is sent their step without one", async (value) => {
    const room = await hostGuessing({ tokens: false });
    if (value) vi.stubEnv(SWITCH, value);

    for (const caller of [{}, { callerId: room.hostId }, { callerId: room.hostId, callerToken: NOBODYS }]) {
      const snapshot = await sameAsRoutes(room.t, { roomId: room.roomId, participantId: room.hostId, ...caller });
      expect(snapshot.myActiveStep).toMatchObject({ stepType: "guess", assignedParticipantId: room.hostId });
      expect("correctOption" in snapshot.myActiveStep).toBe(value === undefined);
    }
  });
});

describe("EMOJI_MATCH_HIDE_CARDS", () => {
  /** A game with one card turned over and fifteen face down */
  async function oneCardTurned() {
    const room = await openRoom();
    const gameId = await emojiMatchStarted(room);
    await flip(room, gameId, (await faceDown(room, gameId))[0]);
    return room;
  }
  type Card = { isRevealed: boolean; isMatched: boolean; pairKey: string; content: { value: string } };

  test.each([undefined, "off"])("%j: the board is sent as it is stored, every card with its emoji and its pair", async (value) => {
    const room = await oneCardTurned();
    if (value) vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", value);

    const board: Card[] = (await sameAsRoutes(room.t, asHost(room))).emojiMatch.board;
    expect(board).toHaveLength(16);
    expect(board.every((card) => card.pairKey !== "" && card.content.value !== "")).toBe(true);
  });

  test("on: the fifteen face-down cards are sent without their emoji and their pair, the turned one whole", async () => {
    const room = await oneCardTurned();
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");

    const board: Card[] = (await sameAsRoutes(room.t, asHost(room))).emojiMatch.board;
    const down = board.filter((card) => !card.isRevealed && !card.isMatched);
    expect(down).toHaveLength(15);
    expect(down.every((card) => card.pairKey === "" && card.content.value === "")).toBe(true);
    const [turned] = board.filter((card) => card.isRevealed);
    expect(turned.pairKey).not.toBe("");
    expect(turned.content.value).not.toBe("");
  });
});

test("the answer holds nobody's token, the caller's included", async () => {
  const room = await hostGuessing();
  await chat(room);
  vi.stubEnv("LOST_IN_TRANSLATION_HIDE_ANSWER", "on");

  const res = await room.t.fetch(SNAPSHOT, { method: "POST", body: JSON.stringify(asHost(room)) });
  const text = await res.text();
  // The answer is the whole room: its people are in it, and the host's step, which only the host's token gets
  for (const participantId of everyone(room)) expect(text).toContain(participantId);
  expect(JSON.parse(text).myActiveStep).toMatchObject({ stepType: "guess" });
  for (const token of [HOST, ANN, BEN]) expect(text).not.toContain(token);
});

// ─── A section whose query fails ─────────────────────────────────────────────

describe("a section whose query fails", () => {
  // In a game, so that the status query is asked: the snapshot does not run it without a session
  const build = hostGuessing;
  const REFUSAL = "ArgumentValidationError: Value does not match validator.";
  /** The three things jsonAction answers 503 for (isTransient in convex/httpShared.ts), each as part of a longer message */
  const WORTH_REPEATING = [
    "Documents read from or written to the table changed while this function ran (OCC)",
    "The backend is overloaded, try again",
    "Too many requests: rate limit exceeded",
  ];

  function bodyFor(source: Source, ask: Ask) {
    return { [source.by]: ask[source.by], callerId: ask.callerId, callerToken: ask.callerToken };
  }

  test.each(ALONE.map((source) => [source.sections[0], source] as const))(
    "%s refused: the request is answered 200 without it, it is named in errors, and the rest is as the routes say",
    async (section, source) => {
      const room = await build();
      const ask = asHost(room);
      const expected = await fromRoutes(room.t, ask);
      expect(expected[section]).not.toBeUndefined();
      failWith(source.query, REFUSAL);

      // On its own route the same failure is a 400. From a game's route the app reads that as "keep what you
      // have". From the reactions route it gives the whole refresh up, which the snapshot does not ask of it:
      // see the long chat in poll-cost.test.ts
      expect(await post(room.t, source.path, bodyFor(source, ask))).toStrictEqual({ status: 400, body: { error: REFUSAL } });

      const snapshot = await post(room.t, SNAPSHOT, ask);
      const { [section]: _refused, ...rest } = expected;
      expect(snapshot).toStrictEqual({ status: 200, body: { ...rest, errors: [section] } });
      // Left out, which is not null: null would say there is no game
      expect(section in snapshot.body).toBe(false);
    }
  );

  test.each(CORE.map((source) => [source.sections.join(" and "), source] as const))(
    "%s refused: the request fails with 400, as their own route does",
    async (_sections, source) => {
      const room = await build();
      const ask = asHost(room);
      failWith(source.query, REFUSAL);

      const refused = { status: 400, body: { error: REFUSAL } };
      expect(await post(room.t, source.path, bodyFor(source, ask))).toStrictEqual(refused);
      expect(await post(room.t, SNAPSHOT, ask)).toStrictEqual(refused);
    }
  );

  describe.each(WORTH_REPEATING)("a failure worth repeating (%s)", (message) => {
    test.each(SOURCES.map((source) => [source.sections.join(" and "), source] as const))(
      "in %s: the whole request answers 503, as that section's own route does",
      async (_sections, source) => {
        const room = await build();
        const ask = asHost(room);
        failWith(source.query, message);

        const busy = { status: 503, body: { error: message } };
        expect(await post(room.t, source.path, bodyFor(source, ask))).toStrictEqual(busy);
        expect(await post(room.t, SNAPSHOT, ask)).toStrictEqual(busy);
      }
    );
  });

  test("three sections refused: each is named, in the order they are read", async () => {
    const room = await build();
    const ask = asHost(room);
    const { reactions: _reactions, wordRush: _wordRush, emojiMatch: _emojiMatch, ...rest } = await fromRoutes(room.t, ask);
    failWith(getActiveEmojiMatch, REFUSAL);
    failWith(getWordRushState, REFUSAL);
    failWith(getRoomReactionSummaries, REFUSAL);

    // Word Rush is read before Emoji Match: the order is the reading's, not the alphabet's
    expect(await post(room.t, SNAPSHOT, ask)).toStrictEqual({ status: 200, body: { ...rest, errors: ["reactions", "wordRush", "emojiMatch"] } });
  });

  test("a refused section and one worth repeating: the request answers 503", async () => {
    const room = await build();
    failWith(getRoomReactionSummaries, REFUSAL);
    failWith(getActiveEmojiBingo, WORTH_REPEATING[1]);

    expect(await post(room.t, SNAPSHOT, asHost(room))).toStrictEqual({ status: 503, body: { error: WORTH_REPEATING[1] } });
  });

  // Not a stub: the argument check of the real query, as a request with a mangled participant id meets it
  test.each([
    ["is not an id", "nonsense"],
    ["is missing", undefined],
    ["is the id of a room", "room"],
  ])("a participantId that %s leaves myActiveStep out and names it; its own route answers 400", async (_how, value) => {
    const room = await build();
    const participantId = value === "room" ? room.roomId : value;
    const ask = { ...asHost(room), participantId };

    const alone = await post(room.t, "/api/games/my-active-step", ask);
    expect(alone).toMatchObject({ status: 400, body: { error: expect.stringMatching(/Validator error/) } });

    const { myActiveStep: _step, ...rest } = await fromRoutes(room.t, asHost(room));
    expect(await post(room.t, SNAPSHOT, ask)).toStrictEqual({ status: 200, body: { ...rest, errors: ["myActiveStep"] } });
  });
});

// ─── Which queries run, and in what order ────────────────────────────────────

describe("the queries behind a snapshot", () => {
  test("in a game, each runs once, one after another in the order the app asks today", async () => {
    const room = await hostGuessing();
    const runs = SOURCES.map((source) => watch(source.query));

    expect((await post(room.t, SNAPSHOT, asHost(room))).status).toBe(200);

    expect(runs.map((run) => run.mock.calls.length)).toEqual(SOURCES.map(() => 1));
    const order = runs.map((run) => run.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test("without a session the status query is not run, and the section is null as its route says", async () => {
    const room = await openRoom();
    const status = watch(getGameStatus);

    const snapshot = await post(room.t, SNAPSHOT, asHost(room));
    expect(snapshot.body).toMatchObject({ activeSession: null, gameStatus: null });
    expect(status).not.toHaveBeenCalled();

    expect((await post(room.t, "/api/games/status", asHost(room))).body).toStrictEqual({ ok: true });
    expect(status).toHaveBeenCalledTimes(1);
  });

  // This is what "one after another" means to the server. Queries started together would all be under way
  // when one of them failed, and the ones after it would still run, behind an answer that asked for less
  test.each(SOURCES.map((source, i) => [source.sections.join(" and "), i] as const))(
    "after a failure worth repeating in %s, none of the queries after it is run",
    async (_sections, failing) => {
      const room = await hostGuessing();
      const runs = SOURCES.map((source, i) =>
        i === failing ? failWith(source.query, "The backend is overloaded, try again") : watch(source.query)
      );

      expect((await post(room.t, SNAPSHOT, asHost(room))).status).toBe(503);
      // A query left running behind the answer runs now: the test backend runs one function at a time, and
      // this request, which asks none of the watched queries, waits its turn behind whatever is left
      await post(room.t, "/api/messages/pending", { roomId: room.roomId });

      expect(runs.map((run) => run.mock.calls.length)).toEqual(SOURCES.map((_, i) => (i <= failing ? 1 : 0)));
    }
  );

  test("a refused section does not stop the ones after it", async () => {
    const room = await hostGuessing();
    const failing = SOURCES.findIndex((source) => source.query === getRoomReactionSummaries);
    const runs = SOURCES.map((source, i) => (i === failing ? failWith(source.query, "No") : watch(source.query)));

    expect((await post(room.t, SNAPSHOT, asHost(room))).body.errors).toEqual(["reactions"]);
    expect(runs.map((run) => run.mock.calls.length)).toEqual(SOURCES.map(() => 1));
  });
});

// ─── Leaving sections out ────────────────────────────────────────────────────

describe("skip", () => {
  test("a section named in skip is left out and its query is not run; the rest is as the routes say", async () => {
    const room = await hostGuessing();
    await wordRushLobby(room);
    const ask = asHost(room);
    const { wordRush: _wordRush, emojiBingo: _emojiBingo, truthOrDare: _truthOrDare, ...rest } = await fromRoutes(room.t, ask);
    expect(_wordRush).toMatchObject({ status: "lobby" });
    // What the app will leave out: the games whose own fast poll is running, or that it is sending an action to
    const skipped = [watch(getWordRushState), watch(getActiveEmojiBingo), watch(getActiveTruthOrDare)];

    const snapshot = await post(room.t, SNAPSHOT, { ...ask, skip: ["wordRush", "emojiBingo", "truthOrDare"] });

    expect(snapshot).toStrictEqual({ status: 200, body: rest });
    for (const run of skipped) expect(run).not.toHaveBeenCalled();
  });

  test("a skipped section whose query would fail is not an error", async () => {
    const room = await openRoom();
    failWith(getActiveEmojiMatch, "The backend is overloaded, try again");

    const snapshot = await post(room.t, SNAPSHOT, { ...asHost(room), skip: ["emojiMatch"] });
    expect(snapshot.status).toBe(200);
    expect(snapshot.body.errors).toEqual([]);
    expect("emojiMatch" in snapshot.body).toBe(false);
  });

  test.each([
    ["names that are no section", ["replay", "errors", "v", "", "Room", 7, null, ["room"]]],
    ["an empty list", []],
    ["a string", "room"],
    ["a number", 7],
    ["null", null],
    ["an object", { room: true }],
  ])("%s skips nothing", async (_what, skip) => {
    const room = await hostGuessing();
    const ask = asHost(room);
    expect(await post(room.t, SNAPSHOT, { ...ask, skip })).toStrictEqual({ status: 200, body: await fromRoutes(room.t, ask) });
  });

  test("the room and its participants are read together and left out one by one", async () => {
    const room = await openRoom();
    const ask = asHost(room);
    const { room: _room, participants: _participants, ...rest } = await fromRoutes(room.t, ask);
    const state = watch(getRoomState);

    expect((await post(room.t, SNAPSHOT, { ...ask, skip: ["room"] })).body).toStrictEqual({ v: 1, participants: _participants, ...rest });
    expect((await post(room.t, SNAPSHOT, { ...ask, skip: ["participants"] })).body).toStrictEqual({ v: 1, room: _room, ...rest });
    expect(state).toHaveBeenCalledTimes(2);
    expect((await post(room.t, SNAPSHOT, { ...ask, skip: ["room", "participants"] })).body).toStrictEqual(rest);
    expect(state).toHaveBeenCalledTimes(2);
  });

  test("with the session skipped the status is still its route's answer, in a game and out of one", async () => {
    const playing = await hostGuessing();
    const inGame = await fromRoutes(playing.t, asHost(playing));
    expect(inGame.gameStatus).toMatchObject({ currentRound: 2 });
    expect((await post(playing.t, SNAPSHOT, { ...asHost(playing), skip: ["activeSession"] })).body.gameStatus).toStrictEqual(inGame.gameStatus);

    const idle = await openRoom();
    const snapshot = (await post(idle.t, SNAPSHOT, { ...asHost(idle), skip: ["activeSession"] })).body;
    expect(snapshot.gameStatus).toBeNull();
    expect("activeSession" in snapshot).toBe(false);
  });

  test("everything skipped: the answer is its version and an empty list of errors, and no query is run", async () => {
    const room = await hostGuessing();
    const runs = SOURCES.map((source) => watch(source.query));

    expect(await post(room.t, SNAPSHOT, { ...asHost(room), skip: SECTIONS })).toStrictEqual({ status: 200, body: { v: 1, errors: [] } });
    for (const run of runs) expect(run).not.toHaveBeenCalled();
  });
});

// ─── Rooms that are not there, and requests that are not requests ─────────────

describe("a room that does not exist", () => {
  test("a room deleted with its people: room and participants are null where the route says {ok:true}, and the request is answered", async () => {
    const room = await openRoom();
    await chat(room);
    await room.t.run(async (ctx) => {
      for (const table of ["messages", "participants"] as const) {
        const rows = await ctx.db.query(table).withIndex("by_roomId", (q) => q.eq("roomId", room.roomId)).collect();
        for (const row of rows) await ctx.db.delete(row._id);
      }
      await ctx.db.delete(room.roomId);
    });
    const ask = asHost(room);
    expect((await post(room.t, "/api/rooms/state", ask)).body).toStrictEqual({ ok: true });

    const snapshot = await sameAsRoutes(room.t, ask);
    expect(snapshot).toStrictEqual({ v: 1, room: null, participants: null, messages: [], reactions: [], ...NO_GAME, errors: [] });
  });

  test.each([
    ["is not an id", "nonsense"],
    ["is missing", undefined],
    ["is the id of a participant", "participant"],
  ])("a roomId that %s is refused with 400 and the words of the room route", async (_how, value) => {
    const room = await openRoom();
    const ask = { ...asHost(room), roomId: value === "participant" ? room.hostId : value };

    const alone = await post(room.t, "/api/rooms/state", ask);
    expect(alone).toMatchObject({ status: 400, body: { error: expect.stringMatching(/Validator error/) } });
    expect(await post(room.t, SNAPSHOT, ask)).toStrictEqual(alone);
  });
});

describe("the request", () => {
  test.each([
    ["not JSON", "not json"],
    ["empty", ""],
    ["the JSON null", "null"],
    ["a JSON list", "[]"],
  ])("a body that is %s is refused with 400", async (_what, body) => {
    const t = newBackend();
    const res = await t.fetch(SNAPSHOT, { method: "POST", body });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: expect.any(String) });
  });

  test("the route is POST only: no preflight is answered, since no web page calls it", () => {
    const methods = http.getRoutes().filter(([path]) => path === SNAPSHOT).map(([, method]) => method);
    expect(methods).toEqual(["POST"]);
  });

  test("the answer is JSON and, like every route's, readable from any origin", async () => {
    const room = await openRoom();
    const res = await room.t.fetch(SNAPSHOT, { method: "POST", body: JSON.stringify(asHost(room)) });
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
