import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Backend, createRoom, joinGuest, newBackend, tokenFor } from "./setup";

// Emoji Bingo (convex/emojiBingo.ts and the /api/emoji-bingo/* routes).
// lobby -> active (players take turns to roll; a turn nobody takes is rolled after 10 s)
//       -> won (after the first bingo an emoji is called every 3 s while the others play for 2nd, 3rd...)
//       -> completed (everyone placed, or the deck of 48 ran out) | canceled
//
// Cards and the deck are shuffled with Math.random. Tests that need a particular call next use stackDeck,
// which rearranges the undrawn part of the stored deck; everything else goes through the public functions.
// A test marked test.fails states the correct behaviour for a defect in the product code (see its DEFECT note).

type GameId = Id<"emojiBingoGames">;
type PlayerId = Id<"participants">;
type RoomId = Id<"rooms">;
type Game = Doc<"emojiBingoGames">;
type WinPattern = Game["winPattern"];

const FREE = "⭐";
const CENTRE = 12;
/** The line through the free centre: four calls complete it */
const MIDDLE_ROW = [10, 11, 12, 13, 14];
const CORNERS = [0, 4, 20, 24];
const TURN_MS = 10_000;
const GRACE_MS = 3_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function gameOf(t: Backend, gameId: GameId): Promise<Game> {
  const game = await t.query(api.emojiBingo.getEmojiBingoById, { gameId });
  if (!game) throw new Error("The game is gone");
  return game;
}

/**
 * The deck as the server holds it, read from the database. How much of it the queries show is a separate
 * question (see the DEFECT note on the draw order), so no test takes the order of the deck from a query.
 */
async function deckOf(t: Backend, gameId: GameId): Promise<string[]> {
  return await t.run(async (ctx) => (await ctx.db.get(gameId))!.drawDeck);
}

function seat(game: Game, playerId: PlayerId) {
  const player = game.players.find((p) => p.participantId === playerId);
  if (!player) throw new Error("Not a player in this game");
  return player;
}

/** Moves the clock, then lets the scheduled functions that came due run to the end */
async function advance(t: Backend, ms: number) {
  vi.advanceTimersByTime(ms);
  await t.finishInProgressScheduledFunctions();
}

/** A room whose host has opened a lobby, which the named guests have joined */
async function openLobby(t: Backend, guests: string[] = ["Aki"], winPattern?: WinPattern) {
  const { roomId, hostId } = await createRoom(t);
  const guestIds: PlayerId[] = [];
  for (const name of guests) guestIds.push(await joinGuest(t, roomId, name));
  const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId, winPattern });
  for (const participantId of guestIds) await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId });
  return { roomId, hostId, guestIds, gameId };
}

async function startedGame(t: Backend, guests: string[] = ["Aki"], winPattern?: WinPattern) {
  const table = await openLobby(t, guests, winPattern);
  await t.mutation(api.emojiBingo.startGame, { gameId: table.gameId, participantId: table.hostId });
  return table;
}

/** The player whose turn it is rolls */
async function rollTurn(t: Backend, gameId: GameId) {
  const game = await gameOf(t, gameId);
  await t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: game.currentTurnParticipantId as PlayerId });
}

/**
 * Fixture: moves these emojis to the front of the part of the deck that has not been drawn. The server
 * shuffles the deck with Math.random; this stands in for a lucky shuffle, so a test knows what is called next.
 */
async function stackDeck(t: Backend, gameId: GameId, next: string[]) {
  await t.run(async (ctx) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("The game is gone");
    const drawn = game.drawDeck.slice(0, game.drawIndex);
    const wanted = next.filter((e, i) => e !== FREE && next.indexOf(e) === i && !drawn.includes(e));
    const rest = game.drawDeck.slice(game.drawIndex).filter((e) => !wanted.includes(e));
    await ctx.db.patch(gameId, { drawDeck: [...drawn, ...wanted, ...rest] });
  });
}

/**
 * Fixture: writes a player's marks straight into the stored card. markCell cannot take a mark back and
 * refuses one on an emoji that has not been called; a test that needs either goes round it with this.
 */
async function writeMarks(t: Backend, gameId: GameId, playerId: PlayerId, markedCells: number[]) {
  await t.run(async (ctx) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("The game is gone");
    await ctx.db.patch(gameId, {
      players: game.players.map((p) => (p.participantId === playerId ? { ...p, markedCells } : p)),
    });
  });
}

function markCell(t: Backend, gameId: GameId, participantId: PlayerId, cellIndex: number) {
  return t.mutation(api.emojiBingo.markCell, { gameId, participantId, cellIndex });
}

function claim(t: Backend, gameId: GameId, participantId: PlayerId) {
  return t.mutation(api.emojiBingo.claimBingo, { gameId, participantId });
}

/**
 * Gets the emojis on these cells of the player's card called and marks them. While the game is active the
 * calls come from the turn holders' rolls; once it is won only the 3-second timer calls, so the clock moves.
 */
async function fill(t: Backend, gameId: GameId, playerId: PlayerId, cells: number[]) {
  const card = seat(await gameOf(t, gameId), playerId).card;
  const emojis = cells.filter((c) => c !== CENTRE).map((c) => card[c]);
  await stackDeck(t, gameId, emojis);
  for (let i = 0; i < 60; i++) {
    const game = await gameOf(t, gameId);
    if (emojis.every((e) => game.calledEmojis.includes(e))) break;
    if (game.status === "active") await rollTurn(t, gameId);
    else await advance(t, GRACE_MS);
  }
  const marked = seat(await gameOf(t, gameId), playerId).markedCells;
  for (const cellIndex of cells) {
    if (!marked.includes(cellIndex)) await markCell(t, gameId, playerId, cellIndex);
  }
}

/** Completes the cells and claims. The default is the middle row, a win under the "line" pattern */
async function win(t: Backend, gameId: GameId, playerId: PlayerId, cells: number[] = MIDDLE_ROW) {
  await fill(t, gameId, playerId, cells);
  return await claim(t, gameId, playerId);
}

/** A started game in which the host has claimed the first bingo and the guests have not placed: status "won" */
async function wonGame(t: Backend, guests: string[] = ["Aki"]) {
  const table = await startedGame(t, guests);
  expect(await win(t, table.gameId, table.hostId)).toEqual({ valid: true, placement: 1 });
  return table;
}

/** A game that a guest hosts and the room's host is not part of, brought to the given state */
async function guestHostedGame(t: Backend, state: "lobby" | "active" | "won") {
  const { roomId, hostId: roomHostId } = await createRoom(t);
  const gameHostId = await joinGuest(t, roomId, "Aki");
  const playerId = await joinGuest(t, roomId, "Ben", { avatar: "cat" });
  const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: gameHostId });
  await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: playerId });
  if (state !== "lobby") await t.mutation(api.emojiBingo.startGame, { gameId, participantId: gameHostId });
  if (state === "won") expect(await win(t, gameId, gameHostId)).toEqual({ valid: true, placement: 1 });
  return { roomId, roomHostId, gameHostId, playerId, gameId };
}

function cancel(t: Backend, gameId: GameId, participantId: PlayerId, token?: string) {
  return t.mutation(api.emojiBingo.cancelGame, { gameId, participantId, token });
}

function heartbeat(t: Backend, participantId: PlayerId) {
  return t.mutation(api.participants.setParticipantOnline, { participantId, online: true });
}

type SummaryRound = {
  players: Array<{ name: string; avatar: string; score: number; isWinner: boolean }>;
  totalPairs: number;
  isTie: boolean;
};
type Summary = { gameType: string; cancelled?: boolean; games: SummaryRound[] };
const SUMMARY_PREFIX = "emoji_match_summary:";

/** The summary cards in the room's chat, as a client reads them. Bingo shares the prefix with Emoji Match */
async function summaries(t: Backend, roomId: RoomId) {
  const messages = await t.query(api.messages.getRoomMessages, { roomId });
  return messages
    .filter((m) => m.kind === "system" && m.text?.startsWith(SUMMARY_PREFIX))
    .map((message) => ({ message, data: JSON.parse(message.text!.slice(SUMMARY_PREFIX.length)) as Summary }));
}

async function post(t: Backend, route: string, body: Record<string, unknown>) {
  const res = await t.fetch(`/api/emoji-bingo/${route}`, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: (await res.json()) as Record<string, any> };
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

describe("createLobby", () => {
  test("opens a lobby with the caller as host and only player, on the line pattern", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t, { hostNickname: "Yuki" });
    const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId });

    const game = await gameOf(t, gameId);
    expect(game).toMatchObject({
      roomId,
      status: "lobby",
      hostParticipantId: hostId,
      winPattern: "line",
      drawDeck: [],
      calledEmojis: [],
      drawIndex: 0,
    });
    expect(game.players).toEqual([
      { participantId: hostId, nickname: "Yuki", avatarValue: "default", joinedAt: Date.now(), card: [], markedCells: [], placement: 0 },
    ]);
  });

  test("a room has one game in progress at a time: a lobby, an active game and a won game all block a new lobby", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await openLobby(t);
    const another = () => t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: guestIds[0] });

    await expect(another(), "lobby").rejects.toThrow(/already in progress/);
    await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId });
    await expect(another(), "active").rejects.toThrow(/already in progress/);
    await win(t, gameId, hostId);
    expect((await gameOf(t, gameId)).status).toBe("won");
    await expect(another(), "won").rejects.toThrow(/already in progress/);

    await cancel(t, gameId, hostId);
    const nextId = await another();
    expect((await gameOf(t, nextId)).status).toBe("lobby");
  });

  // The game picker opens every game with createLobby, also the one after a game that was played to the end
  test("a game that has been played to the end does not stand in the way of a new lobby", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    expect((await gameOf(t, gameId)).status).toBe("completed");

    vi.advanceTimersByTime(1_000);
    const nextId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId, winPattern: "blackout" });
    expect(nextId).not.toBe(gameId);
    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId })).toMatchObject({
      _id: nextId,
      status: "lobby",
      winPattern: "blackout",
    });
  });

  // DEFECT: createLobby never looks at the room's status, so a lobby opens in a closed room; startGame then
  // writes a "game:Emoji Bingo" line into the closed room's chat and starts the roll timer, which also runs
  // on to the end of the deck in a room closed mid-game. Word Rush, Truth or Dare and Lost in Translation
  // refuse with "Room is closed", as does every message send. Low severity: only a client that missed the
  // close would ask.
  test.fails("a lobby cannot be opened in a closed room", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId })).rejects.toThrow(/closed/i);
  });
});

describe("the lobby", () => {
  test("a guest who joins is listed once, with their name and avatar and no card yet", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const aki = await joinGuest(t, roomId, "Aki", { avatar: "panda" });
    const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId });
    await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: aki });
    await expect(t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: aki })).rejects.toThrow(/Already joined/);

    const game = await gameOf(t, gameId);
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, aki]);
    expect(seat(game, aki)).toMatchObject({ nickname: "Aki", avatarValue: "panda", card: [], markedCells: [], placement: 0 });
    expect(game.hostParticipantId).toBe(hostId);
  });

  test("a game belongs to its room: someone from another room can neither join, open nor restart one here", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await openLobby(t);
    const outsider = (await createRoom(t)).hostId;
    const notHere = /not in this room/;

    await expect(t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: outsider }), "join").rejects.toThrow(notHere);
    expect((await gameOf(t, gameId)).players).toHaveLength(2);

    await cancel(t, gameId, hostId);
    await expect(t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: outsider }), "open").rejects.toThrow(notHere);
    await expect(t.mutation(api.emojiBingo.playAgain, { gameId, participantId: outsider }), "play again").rejects.toThrow(notHere);
    expect((await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }))?._id).toBe(gameId);
  });

  test("a lobby holds 30 players and refuses the 31st", async () => {
    const t = newBackend();
    const room = (await t.mutation(api.rooms.createRoom, {
      hostNickname: "Host",
      settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 50 },
    })) as { roomId: RoomId; hostId: PlayerId };
    const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId: room.roomId, hostParticipantId: room.hostId });
    for (let i = 1; i <= 29; i++) {
      const participantId = await joinGuest(t, room.roomId, `Guest ${i}`);
      await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId });
    }
    const late = await joinGuest(t, room.roomId, "Guest 30");

    await expect(t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: late })).rejects.toThrow(/full/i);
    expect((await gameOf(t, gameId)).players).toHaveLength(30);
  });

  test("a guest who leaves is taken out of the players", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await openLobby(t, ["Aki", "Ben"]);
    await t.mutation(api.emojiBingo.leaveLobby, { gameId, participantId: guestIds[0] });

    const game = await gameOf(t, gameId);
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, guestIds[1]]);
    expect(game).toMatchObject({ status: "lobby", hostParticipantId: hostId });
  });

  test("when the host leaves, the next player in line becomes the host and can start", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await openLobby(t, ["Aki", "Ben"]);
    await t.mutation(api.emojiBingo.leaveLobby, { gameId, participantId: hostId });

    const game = await gameOf(t, gameId);
    expect(game.hostParticipantId).toBe(guestIds[0]);
    expect(game.players.map((p) => p.participantId)).toEqual(guestIds);
    await t.mutation(api.emojiBingo.startGame, { gameId, participantId: guestIds[0] });
    expect((await gameOf(t, gameId)).status).toBe("active");
  });

  test("when the host leaves a lobby nobody else is in, the game is cancelled without a summary", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await openLobby(t, []);
    await t.mutation(api.emojiBingo.leaveLobby, { gameId, participantId: hostId });

    expect(await gameOf(t, gameId)).toMatchObject({ status: "canceled", players: [], endedAt: Date.now() });
    expect(await summaries(t, roomId)).toEqual([]);
  });

  test("only the lobby's host can change the win pattern or start the game", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await openLobby(t);
    await expect(
      t.mutation(api.emojiBingo.updateSettings, { gameId, participantId: guestIds[0], winPattern: "blackout" })
    ).rejects.toThrow(/Only the host/);
    await expect(t.mutation(api.emojiBingo.startGame, { gameId, participantId: guestIds[0] })).rejects.toThrow(/Only the host/);
    expect(await gameOf(t, gameId)).toMatchObject({ status: "lobby", winPattern: "line" });

    await t.mutation(api.emojiBingo.updateSettings, { gameId, participantId: hostId, winPattern: "four_corners" });
    await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId });
    expect(await gameOf(t, gameId)).toMatchObject({ status: "active", winPattern: "four_corners" });
  });

  test("joining, leaving, changing the pattern and starting are refused once the game has started", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    const late = await joinGuest(t, roomId, "Cho");
    const dealt = await gameOf(t, gameId);
    const notLobby = /not in lobby state/;

    await expect(t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: late }), "join").rejects.toThrow(notLobby);
    await expect(t.mutation(api.emojiBingo.leaveLobby, { gameId, participantId: guestIds[0] }), "leave").rejects.toThrow(notLobby);
    await expect(
      t.mutation(api.emojiBingo.updateSettings, { gameId, participantId: hostId, winPattern: "blackout" }),
      "settings"
    ).rejects.toThrow(notLobby);
    // A second tap on Start must not deal new cards
    await expect(t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId }), "start").rejects.toThrow(notLobby);

    expect(await gameOf(t, gameId)).toEqual(dealt);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

describe("startGame", () => {
  test("every player is dealt their own card: 24 different emojis around a free centre that starts marked", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, ["Aki", "Ben"]);
    const game = await gameOf(t, gameId);
    const deck = await deckOf(t, gameId);

    expect(game.players).toHaveLength(3);
    for (const player of game.players) {
      expect(player.card).toHaveLength(25);
      expect(player.card[CENTRE]).toBe(FREE);
      const emojis = player.card.filter((_, i) => i !== CENTRE);
      expect(new Set(emojis).size).toBe(24);
      expect(emojis).not.toContain(FREE);
      // Every cell can be called: it is somewhere in the deck
      expect(emojis.filter((e) => !deck.includes(e))).toEqual([]);
      expect(player.markedCells).toEqual([CENTRE]);
      expect(player.placement).toBe(0);
    }
    // Three independent shuffles: the same card twice is 1 in 48!/24!
    expect(new Set(game.players.map((p) => p.card.join(" "))).size).toBe(3);
    // Each card is its own 24 of the 48, not one set of 24 in three arrangements (1 in 3 * 10^13 for two cards)
    expect(new Set(game.players.map((p) => [...p.card].sort().join(" "))).size).toBe(3);
  });

  // The order of the calls is Math.random's: two games with the same deck are 1 in 48!. The turn order is
  // shuffled the same way, which no test checks: who taps Roll first changes nothing for anyone's card
  test("each game shuffles its own deck: two games do not call the emojis in the same order", async () => {
    const t = newBackend();
    const first = await startedGame(t);
    const second = await startedGame(t);
    const [deckA, deckB] = [await deckOf(t, first.gameId), await deckOf(t, second.gameId)];

    expect([...deckA].sort()).toEqual([...deckB].sort());
    expect(deckA).not.toEqual(deckB);
  });

  test("starting shuffles the 48 emojis into the deck, calls none, and hands the turn to the first in a turn order of all players", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t, ["Aki", "Ben"]);
    const game = await gameOf(t, gameId);

    expect(game).toMatchObject({
      status: "active",
      calledEmojis: [],
      drawIndex: 0,
      startedAt: Date.now(),
      turnStartedAt: Date.now(),
      turnTimeoutMs: TURN_MS,
    });
    const deck = await deckOf(t, gameId);
    expect(deck).toHaveLength(48);
    expect(new Set(deck).size).toBe(48);
    expect([...game.turnOrder!].sort()).toEqual([hostId, ...guestIds].sort());
    expect(game.currentTurnParticipantId).toBe(game.turnOrder![0]);
  });

  test("the chat gets one \"game:Emoji Bingo\" line per room, however many games are started", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t);
    const startLines = async () =>
      (await t.query(api.messages.getRoomMessages, { roomId })).filter((m) => m.text === "game:Emoji Bingo");

    expect(await startLines()).toMatchObject([{ kind: "system", status: "processed", senderId: hostId }]);

    await cancel(t, gameId, hostId);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiBingo.startGame, { gameId: nextId, participantId: hostId });
    expect(await startLines()).toHaveLength(1);
  });
});

// ─── Rolls ───────────────────────────────────────────────────────────────────

describe("rollEmoji", () => {
  test("the turn holder's roll calls the next emoji in the deck and passes the turn round the table", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, ["Aki", "Ben"]);
    const before = await gameOf(t, gameId);
    const order = before.turnOrder!;
    const deck = await deckOf(t, gameId);

    vi.advanceTimersByTime(2_000);
    await rollTurn(t, gameId);
    const first = await gameOf(t, gameId);
    expect(first.calledEmojis).toEqual([deck[0]]);
    expect(first.drawIndex).toBe(1);
    expect(first.currentTurnParticipantId).toBe(order[1]);
    expect(first.turnStartedAt).toBe(Date.now());

    await rollTurn(t, gameId);
    await rollTurn(t, gameId);
    const third = await gameOf(t, gameId);
    expect(third.calledEmojis).toEqual(deck.slice(0, 3));
    expect(third.currentTurnParticipantId).toBe(order[0]);
  });

  test("only the player whose turn it is may roll", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, ["Aki", "Ben"]);
    const watcher = await joinGuest(t, roomId, "Cho");
    const game = await gameOf(t, gameId);
    const waiting = game.turnOrder![1] as PlayerId;

    await expect(t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: waiting })).rejects.toThrow(/Not your turn/);
    await expect(t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: watcher })).rejects.toThrow(/Not your turn/);
    expect(await gameOf(t, gameId)).toMatchObject({ drawIndex: 0, calledEmojis: [], currentTurnParticipantId: game.turnOrder![0] });
  });

  test("rolls, marks and claims are refused before the game starts and after it ends", async () => {
    const t = newBackend();
    const { gameId, hostId } = await openLobby(t, []);
    const refuseAll = async (when: string) => {
      const notActive = /not active/;
      await expect(t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: hostId }), `roll ${when}`).rejects.toThrow(notActive);
      await expect(markCell(t, gameId, hostId, 14), `mark ${when}`).rejects.toThrow(notActive);
      await expect(claim(t, gameId, hostId), `claim ${when}`).rejects.toThrow(notActive);
    };

    await refuseAll("in the lobby");

    // One mark short of a line when the game is cancelled; the last call is already out
    await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId });
    await fill(t, gameId, hostId, [10, 11, 13]);
    await stackDeck(t, gameId, [seat(await gameOf(t, gameId), hostId).card[14]]);
    await rollTurn(t, gameId);
    await cancel(t, gameId, hostId);
    const ended = await gameOf(t, gameId);

    await refuseAll("after the cancel");
    expect(await gameOf(t, gameId)).toEqual(ended);
  });

  test("when the deck runs out and nobody has claimed, the game ends completed with no winner and a summary", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t);
    for (let i = 0; i < 48; i++) await rollTurn(t, gameId);
    const allCalled = await gameOf(t, gameId);
    expect(allCalled).toMatchObject({ status: "active", drawIndex: 48 });
    expect(allCalled.calledEmojis).toEqual(await deckOf(t, gameId));

    await rollTurn(t, gameId);
    for (let i = 0; i < 6; i++) await advance(t, TURN_MS);

    const ended = await gameOf(t, gameId);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTypeOf("number");
    expect(ended.calledEmojis).toHaveLength(48);
    expect(ended.players.map((p) => p.placement)).toEqual([0, 0]);
    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.data.games).toHaveLength(1);
    expect(summary.data.games[0].players.map((p) => p.isWinner)).toEqual([false, false]);
  });

  // DEFECT: the roll after the 48th call ends the game on the spot (rollEmoji and internalAutoRoll both set
  // "completed" when the deck is empty). A player whose pattern needed the last emoji has until the next
  // player taps Roll, or 10 s (3 s once the game is won) for the timer, to mark and claim; after that markCell
  // and claimBingo throw "Game is not active" and the summary shows no winner. Under blackout the last call is
  // the one that matters about half the time. Listed in the review ("Bingo completes on the first roll after
  // the 48th call"); none of the five commits changed it.
  test.fails("a roll that arrives after the last emoji was called still leaves time to claim it", async () => {
    const t = newBackend();
    const { gameId, guestIds } = await startedGame(t);
    const aki = guestIds[0];
    // Aki's row needs the very last emoji in the deck
    const last = seat(await gameOf(t, gameId), aki).card[10];
    await t.run(async (ctx) => {
      const game = (await ctx.db.get(gameId))!;
      await ctx.db.patch(gameId, { drawDeck: [...game.drawDeck.filter((e) => e !== last), last] });
    });
    for (let i = 0; i < 48; i++) await rollTurn(t, gameId);
    expect((await gameOf(t, gameId)).calledEmojis[47]).toBe(last);

    // The next player taps Roll before Aki has marked the call that completes the row
    await rollTurn(t, gameId);
    expect((await gameOf(t, gameId)).status, "one roll after the last call").not.toBe("completed");
    for (const cellIndex of [10, 11, 13, 14]) await markCell(t, gameId, aki, cellIndex);
    expect(await claim(t, gameId, aki)).toMatchObject({ valid: true, placement: 1 });
  });
});

describe("the turn timer", () => {
  test("a turn nobody takes is rolled after 10 seconds, and so is the next one", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t);
    const before = await gameOf(t, gameId);
    const order = before.turnOrder!;
    const deck = await deckOf(t, gameId);

    await advance(t, 9_000);
    expect((await gameOf(t, gameId)).drawIndex).toBe(0);

    await advance(t, 1_000);
    const first = await gameOf(t, gameId);
    expect(first.calledEmojis).toEqual([deck[0]]);
    expect(first.currentTurnParticipantId).toBe(order[1]);
    expect(first.turnStartedAt).toBe(Date.now());
    expect(first.status).toBe("active");

    await advance(t, 9_000);
    expect((await gameOf(t, gameId)).drawIndex).toBe(1);
    await advance(t, 1_000);
    const second = await gameOf(t, gameId);
    expect(second.calledEmojis).toEqual(deck.slice(0, 2));
    expect(second.currentTurnParticipantId).toBe(order[0]);
  });

  test("a roll restarts the 10 seconds: the timer set for the turn before it does nothing", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t);

    await advance(t, 4_000);
    await rollTurn(t, gameId);
    expect((await gameOf(t, gameId)).drawIndex).toBe(1);

    // 10 s after the start: the first turn's timer comes due, but that turn was taken
    await advance(t, 6_000);
    expect((await gameOf(t, gameId)).drawIndex).toBe(1);
    await advance(t, 3_000);
    expect((await gameOf(t, gameId)).drawIndex).toBe(1);
    // 10 s after the roll
    await advance(t, 1_000);
    expect((await gameOf(t, gameId)).drawIndex).toBe(2);
  });

  test("a player who has left the room does not hold the game up: their turn is rolled for them", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    const aki = guestIds[0];
    if ((await gameOf(t, gameId)).currentTurnParticipantId !== aki) await rollTurn(t, gameId);
    const before = await gameOf(t, gameId);
    expect(before.currentTurnParticipantId).toBe(aki);

    await t.mutation(api.participants.leaveRoom, { participantId: aki });
    await advance(t, TURN_MS);

    const after = await gameOf(t, gameId);
    expect(after.drawIndex).toBe(before.drawIndex + 1);
    expect(after.currentTurnParticipantId).toBe(hostId);
    await t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: hostId });
    expect((await gameOf(t, gameId)).drawIndex).toBe(before.drawIndex + 2);
  });

  test("with nobody playing, the timer calls all 48 emojis and then ends the game", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    for (const id of [hostId, guestIds[0]]) await t.mutation(api.participants.setParticipantOnline, { participantId: id, online: false });
    for (let i = 0; i < 48; i++) await advance(t, TURN_MS);
    const allCalled = await gameOf(t, gameId);
    expect(allCalled).toMatchObject({ status: "active", drawIndex: 48 });
    expect(allCalled.calledEmojis).toEqual(await deckOf(t, gameId));

    for (let i = 0; i < 6; i++) await advance(t, TURN_MS);
    const ended = await gameOf(t, gameId);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTypeOf("number");
    expect(ended.calledEmojis).toHaveLength(48);
    expect(await summaries(t, roomId)).toHaveLength(1);

    // Nothing is left running
    await advance(t, 6 * TURN_MS);
    expect(await gameOf(t, gameId)).toEqual(ended);
    expect(await summaries(t, roomId)).toHaveLength(1);
  });

  test("after a cancel the pending timer calls nothing", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t);
    await rollTurn(t, gameId);
    await cancel(t, gameId, hostId);

    await advance(t, 3 * TURN_MS);
    expect(await gameOf(t, gameId)).toMatchObject({ status: "canceled", drawIndex: 1 });
  });
});

// ─── Marks ───────────────────────────────────────────────────────────────────

describe("markCell", () => {
  test("a cell can be marked once its emoji has been called and not before, on the caller's card only", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    await expect(markCell(t, gameId, hostId, 0)).rejects.toThrow(/not been called/);
    expect(seat(await gameOf(t, gameId), hostId).markedCells).toEqual([CENTRE]);

    await stackDeck(t, gameId, [seat(await gameOf(t, gameId), hostId).card[0]]);
    await rollTurn(t, gameId);
    await markCell(t, gameId, hostId, 0);
    await expect(markCell(t, gameId, hostId, 1)).rejects.toThrow(/not been called/);

    const game = await gameOf(t, gameId);
    expect(seat(game, hostId).markedCells).toEqual([CENTRE, 0]);
    expect(seat(game, guestIds[0]).markedCells).toEqual([CENTRE]);

    // And the other way round: a guest's mark leaves the host's card as it was
    await fill(t, gameId, guestIds[0], [24]);
    const after = await gameOf(t, gameId);
    expect(seat(after, guestIds[0]).markedCells).toEqual([CENTRE, 24]);
    expect(seat(after, hostId).markedCells).toEqual([CENTRE, 0]);
  });

  test("a cell cannot be marked twice, and the free centre counts as marked from the start", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t);
    await stackDeck(t, gameId, [seat(await gameOf(t, gameId), hostId).card[0]]);
    await rollTurn(t, gameId);
    await markCell(t, gameId, hostId, 0);

    await expect(markCell(t, gameId, hostId, 0)).rejects.toThrow(/already marked/);
    await expect(markCell(t, gameId, hostId, CENTRE)).rejects.toThrow(/already marked/);
    expect(seat(await gameOf(t, gameId), hostId).markedCells).toEqual([CENTRE, 0]);
  });

  test("a cell that is not on the card is refused, even when every emoji has been called", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t);
    for (let i = 0; i < 48; i++) await rollTurn(t, gameId);

    await expect(markCell(t, gameId, hostId, -1)).rejects.toThrow(/Invalid cell/);
    await expect(markCell(t, gameId, hostId, 25)).rejects.toThrow(/Invalid cell/);
    await expect(markCell(t, gameId, hostId, 2.5)).rejects.toThrow();
    expect(seat(await gameOf(t, gameId), hostId).markedCells).toEqual([CENTRE]);
  });

  test("someone in the room who is not in the game can neither mark nor claim", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t);
    const watcher = await joinGuest(t, roomId, "Cho");
    await expect(markCell(t, gameId, watcher, CENTRE)).rejects.toThrow(/not in this game/);
    await expect(claim(t, gameId, watcher)).rejects.toThrow(/not in this game/);
  });
});

// ─── Claims ──────────────────────────────────────────────────────────────────

describe("claimBingo", () => {
  test("a complete line is a bingo: first place, and the game moves to won while the others play on", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    await fill(t, gameId, hostId, MIDDLE_ROW);

    expect(await claim(t, gameId, hostId)).toEqual({ valid: true, placement: 1 });
    const game = await gameOf(t, gameId);
    expect(game.status).toBe("won");
    expect(game.firstBingoAt).toBe(Date.now());
    expect(game.endedAt).toBeUndefined();
    expect(seat(game, hostId).placement).toBe(1);
    expect(seat(game, guestIds[0]).placement).toBe(0);
  });

  test("a claim without a complete pattern is turned down and changes nothing", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t);
    expect(await claim(t, gameId, hostId)).toEqual({ valid: false, reason: "pattern_incomplete" });

    // Four in a row is one short
    await fill(t, gameId, hostId, [10, 11, 13]);
    expect(await claim(t, gameId, hostId)).toEqual({ valid: false, reason: "pattern_incomplete" });
    // The four corners are not a line, and nor are eleven marks that complete no row, column or diagonal
    await fill(t, gameId, hostId, CORNERS);
    expect(await claim(t, gameId, hostId)).toEqual({ valid: false, reason: "pattern_incomplete" });
    await fill(t, gameId, hostId, [1, 2, 9]);
    expect(await claim(t, gameId, hostId)).toEqual({ valid: false, reason: "pattern_incomplete" });

    const game = await gameOf(t, gameId);
    expect(seat(game, hostId).markedCells).toHaveLength(11);
    expect(game.status).toBe("active");
    expect(game.firstBingoAt).toBeUndefined();
    expect(game.players.map((p) => p.placement)).toEqual([0, 0]);
    expect(await summaries(t, roomId)).toEqual([]);
  });

  test("each of the five rows, five columns and two diagonals wins under the line pattern", async () => {
    const five = [0, 1, 2, 3, 4];
    const lines: Array<[string, number[]]> = [
      ...five.map((r): [string, number[]] => [`row ${r}`, five.map((c) => r * 5 + c)]),
      ...five.map((c): [string, number[]] => [`column ${c}`, five.map((r) => r * 5 + c)]),
      ["diagonal", [0, 6, 12, 18, 24]],
      ["other diagonal", [4, 8, 12, 16, 20]],
    ];
    for (const [name, cells] of lines) {
      const t = newBackend();
      const { gameId, hostId } = await startedGame(t);
      expect(await win(t, gameId, hostId, cells), name).toEqual({ valid: true, placement: 1 });
    }
  });

  test("under four corners a line does not win, the corners do", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t, ["Aki"], "four_corners");
    expect(await win(t, gameId, hostId, MIDDLE_ROW)).toEqual({ valid: false, reason: "pattern_incomplete" });
    expect(await win(t, gameId, hostId, [0, 4, 20])).toEqual({ valid: false, reason: "pattern_incomplete" });
    expect(await win(t, gameId, hostId, CORNERS)).toEqual({ valid: true, placement: 1 });
  });

  test("blackout needs every cell on the card", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t, ["Aki"], "blackout");
    const allButLast = Array.from({ length: 24 }, (_, i) => i);
    expect(await win(t, gameId, hostId, allButLast)).toEqual({ valid: false, reason: "pattern_incomplete" });
    expect(await win(t, gameId, hostId, [24])).toEqual({ valid: true, placement: 1 });
    expect(seat(await gameOf(t, gameId), hostId).markedCells).toHaveLength(25);
  });

  // The tests above show that each pattern wins and that a few incomplete cards do not. This one takes every
  // pattern apart cell by cell: a line that the server knew by only four of its cells would pass all of those
  test("a pattern needs every one of its cells: with any one of them unmarked the claim is turned down", async () => {
    const five = [0, 1, 2, 3, 4];
    const patterns: Array<[WinPattern, number[][]]> = [
      [
        "line",
        [
          ...five.map((r) => five.map((c) => r * 5 + c)),
          ...five.map((c) => five.map((r) => r * 5 + c)),
          [0, 6, 12, 18, 24],
          [4, 8, 12, 16, 20],
        ],
      ],
      ["four_corners", [CORNERS]],
      ["blackout", [Array.from({ length: 25 }, (_, i) => i)]],
    ];
    for (const [winPattern, shapes] of patterns) {
      const t = newBackend();
      const { gameId, hostId } = await startedGame(t, ["Aki"], winPattern);
      // With every emoji out any mark is a fair one. Marks cannot be taken back, so each card is written
      for (let i = 0; i < 48; i++) await rollTurn(t, gameId);
      let turnedDown = 0;
      for (const shape of shapes) {
        for (const missing of shape.filter((c) => c !== CENTRE)) {
          await writeMarks(t, gameId, hostId, [CENTRE, ...shape.filter((c) => c !== missing && c !== CENTRE)]);
          expect(await claim(t, gameId, hostId), `${winPattern} without cell ${missing}`).toEqual({
            valid: false,
            reason: "pattern_incomplete",
          });
          turnedDown++;
        }
      }
      // 12 lines of 5 cells, 8 of them without the free centre and 4 through it; 4 corners; 24 cells
      expect(turnedDown, winPattern).toBe({ line: 56, four_corners: 4, blackout: 24 }[winPattern]);
      expect(await gameOf(t, gameId)).toMatchObject({ status: "active", drawIndex: 48 });
    }
  });

  test("a card with a mark on an emoji that was never called does not win", async () => {
    const t = newBackend();
    const { gameId, hostId } = await startedGame(t);
    // markCell refuses such a mark, so the row is written straight into the stored card
    await writeMarks(t, gameId, hostId, MIDDLE_ROW);

    expect(await claim(t, gameId, hostId)).toEqual({ valid: false, reason: "marked_uncalled" });
    expect(await gameOf(t, gameId)).toMatchObject({ status: "active" });
  });

  test("a player places once; later bingos take the next places, and the game completes when everyone has placed", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await wonGame(t, ["Aki", "Ben"]);
    const [aki, ben] = guestIds;
    await expect(claim(t, gameId, hostId)).rejects.toThrow(/already placed/);

    // The others keep marking what the 3-second timer calls
    expect(await win(t, gameId, ben)).toEqual({ valid: true, placement: 2 });
    const stillWon = await gameOf(t, gameId);
    expect(stillWon.status).toBe("won");
    expect(stillWon.endedAt).toBeUndefined();
    expect(seat(stillWon, hostId).placement).toBe(1);

    expect(await win(t, gameId, aki)).toEqual({ valid: true, placement: 3 });
    const ended = await gameOf(t, gameId);
    expect(ended).toMatchObject({ status: "completed", endedAt: Date.now() });
    expect(seat(ended, ben).placement).toBe(2);
    expect(seat(ended, aki).placement).toBe(3);

    // The timer that was calling emojis stops
    await advance(t, 4 * GRACE_MS);
    expect((await gameOf(t, gameId)).drawIndex).toBe(ended.drawIndex);
  });

  test("a solo game completes on the first bingo, without passing through won", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    expect(await win(t, gameId, hostId)).toEqual({ valid: true, placement: 1 });

    const ended = await gameOf(t, gameId);
    expect(ended).toMatchObject({ status: "completed", endedAt: Date.now() });
    expect(ended.firstBingoAt).toBeUndefined();
    expect(await summaries(t, roomId)).toHaveLength(1);
  });
});

// ─── After the first bingo ───────────────────────────────────────────────────

describe("after the first bingo", () => {
  // Commit ccda84d. Before it a roll in "won" drew an emoji without scheduling the next call, which made
  // both pending timers stale: nothing was ever called again.
  test("a roll is ignored, whoever sends it", async () => {
    const t = newBackend();
    const { gameId } = await wonGame(t);
    const before = await gameOf(t, gameId);
    const order = before.turnOrder as PlayerId[];
    const holder = before.currentTurnParticipantId as PlayerId;
    const other = order.find((id) => id !== holder)!;

    await t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: holder });
    await t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: other });

    const after = await gameOf(t, gameId);
    expect(after.status).toBe("won");
    expect(after.drawIndex).toBe(before.drawIndex);
    expect(after.calledEmojis).toEqual(before.calledEmojis);
    expect(after.currentTurnParticipantId).toBe(holder);
  });

  test("a stray roll does not stop the automatic calls", async () => {
    const t = newBackend();
    const { gameId } = await wonGame(t);
    const before = await gameOf(t, gameId);
    await t.mutation(api.emojiBingo.rollEmoji, { gameId, participantId: before.currentTurnParticipantId as PlayerId });

    for (let i = 1; i <= 3; i++) {
      await advance(t, GRACE_MS);
      expect((await gameOf(t, gameId)).drawIndex).toBe(before.drawIndex + i);
    }
  });

  test("an emoji is called every 3 seconds, and the 10-second timer of the turn it interrupted adds none", async () => {
    const t = newBackend();
    const { gameId } = await wonGame(t);
    const before = await gameOf(t, gameId);
    const called = async () => (await gameOf(t, gameId)).drawIndex - before.drawIndex;

    await advance(t, 2_000);
    expect(await called()).toBe(0);
    await advance(t, 1_000);
    expect(await called()).toBe(1);
    await advance(t, 2_000);
    expect(await called()).toBe(1);
    await advance(t, 1_000);
    expect(await called()).toBe(2);
    await advance(t, 3_000);
    expect(await called()).toBe(3);
    // 10 s after the last roll: the interrupted turn's timer comes due
    await advance(t, 1_000);
    expect(await called()).toBe(3);
    await advance(t, 2_000);
    expect(await called()).toBe(4);

    const after = await gameOf(t, gameId);
    expect(after.calledEmojis).toEqual((await deckOf(t, gameId)).slice(0, before.drawIndex + 4));
    expect(after.status).toBe("won");
  });

  test("the automatic calls end the game when the deck runs out, and the placement stands", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await wonGame(t);
    const left = 48 - (await gameOf(t, gameId)).drawIndex;
    for (let i = 0; i < left; i++) await advance(t, GRACE_MS);
    expect(await gameOf(t, gameId)).toMatchObject({ status: "won", drawIndex: 48 });

    for (let i = 0; i < 20; i++) await advance(t, GRACE_MS);
    const ended = await gameOf(t, gameId);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTypeOf("number");
    expect(seat(ended, hostId).placement).toBe(1);
    expect(seat(ended, guestIds[0]).placement).toBe(0);
    const [summary] = await summaries(t, roomId);
    expect(summary.data.games[0].players).toEqual([
      { name: "Host", avatar: "default", score: 5, isWinner: true },
      { name: "Aki", avatar: "fox", score: 1, isWinner: false },
    ]);

    await advance(t, 5 * GRACE_MS);
    expect(await gameOf(t, gameId)).toEqual(ended);
  });

  // DEFECT: the timer's side of "a roll that arrives after the last emoji was called..." above, which is the
  // side everyone playing on after the first bingo meets. Once the game is won an emoji is called every 3 s,
  // and what comes 3 s after the 48th is the end of the game. Every other emoji can be marked and claimed for
  // as long as the game runs; the last one for 3 s. Under blackout a card needs the 48th call half the time,
  // so whoever plays on for 2nd place then has 3 s to find it, mark it and tap Bingo. A fix that only makes
  // rollEmoji ignore a roll on an empty deck leaves this as it is: the end has to wait longer than the gap
  // between two calls. Same review item, same fix (a last window to claim in when the deck runs out).
  test.fails("after the first bingo, the last emoji called can still be claimed when the next call would have come", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    const aki = guestIds[0];
    const dealt = await gameOf(t, gameId);
    const hostRow = MIDDLE_ROW.map((c) => seat(dealt, hostId).card[c]);
    // A cell of Aki's that the host's winning row does not call (at least 20 of the 24 qualify), and its row
    const akiCard = seat(dealt, aki).card;
    const lastCell = akiCard.findIndex((e, i) => i !== CENTRE && !hostRow.includes(e));
    const akiRow = [0, 1, 2, 3, 4].map((c) => lastCell - (lastCell % 5) + c);
    const last = akiCard[lastCell];
    await t.run(async (ctx) => {
      const game = (await ctx.db.get(gameId))!;
      await ctx.db.patch(gameId, { drawDeck: [...game.drawDeck.filter((e) => e !== last), last] });
    });

    expect(await win(t, gameId, hostId)).toEqual({ valid: true, placement: 1 });
    const left = 48 - (await gameOf(t, gameId)).drawIndex;
    for (let i = 0; i < left; i++) await advance(t, GRACE_MS);
    const allCalled = await gameOf(t, gameId);
    expect(allCalled).toMatchObject({ status: "won", drawIndex: 48 });
    expect(allCalled.calledEmojis[47]).toBe(last);

    // Aki takes as long over the last call as the server allows for any other
    await advance(t, GRACE_MS);
    expect((await gameOf(t, gameId)).status, "3 s after the last call").toBe("won");
    for (const cellIndex of akiRow) {
      if (cellIndex !== CENTRE) await markCell(t, gameId, aki, cellIndex);
    }
    expect(await claim(t, gameId, aki)).toEqual({ valid: true, placement: 2 });
  });
});

// ─── A whole game ────────────────────────────────────────────────────────────

test("an unrigged two-player game runs from the lobby to completed through the public functions alone", async () => {
  const t = newBackend();
  const { roomId, hostId } = await createRoom(t);
  const aki = await joinGuest(t, roomId, "Aki");
  const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId });
  await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: aki });
  await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId });

  const rowOf = (game: Game, id: PlayerId) => [10, 11, 13, 14].map((c) => seat(game, id).card[c]);
  const rowCalled = (game: Game, id: PlayerId) => rowOf(game, id).every((e) => game.calledEmojis.includes(e));

  // Turns alternate until the host's middle row has been called: 48 rolls at the most. Both loops are
  // counted: under the fake clock a loop that waits for a call that never comes would spin for ever, and
  // vitest's own timeout cannot fire while it does
  let game = await gameOf(t, gameId);
  for (let i = 0; i < 48 && !rowCalled(game, hostId); i++) {
    await rollTurn(t, gameId);
    game = await gameOf(t, gameId);
  }
  expect(rowCalled(game, hostId), "the host's row was called").toBe(true);
  for (const cellIndex of [10, 11, 13, 14]) await markCell(t, gameId, hostId, cellIndex);
  expect(await claim(t, gameId, hostId)).toEqual({ valid: true, placement: 1 });
  expect((await gameOf(t, gameId)).status).toBe("won");

  // From here the timer calls. Once all 48 are out Aki's row is certainly called, one step before the deck ends the game
  game = await gameOf(t, gameId);
  for (let i = 0; i < 48 && !rowCalled(game, aki); i++) {
    await advance(t, GRACE_MS);
    game = await gameOf(t, gameId);
  }
  expect(rowCalled(game, aki), "the timer went on calling until Aki's row was out").toBe(true);
  for (const cellIndex of [10, 11, 13, 14]) await markCell(t, gameId, aki, cellIndex);
  expect(await claim(t, gameId, aki)).toEqual({ valid: true, placement: 2 });

  const ended = await gameOf(t, gameId);
  expect(ended.status).toBe("completed");
  expect(ended.players.map((p) => p.placement)).toEqual([1, 2]);
  const [summary, ...others] = await summaries(t, roomId);
  expect(others).toEqual([]);
  expect(summary.data.games[0].players.map((p) => [p.name, p.isWinner])).toEqual([["Host", true], ["Aki", false]]);
});

// ─── Cancel ──────────────────────────────────────────────────────────────────

describe("cancelGame", () => {
  test("cancelling a lobby ends it without a summary", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await openLobby(t);
    await cancel(t, gameId, hostId);

    expect(await gameOf(t, gameId)).toMatchObject({ status: "canceled", endedAt: Date.now() });
    expect(await summaries(t, roomId)).toEqual([]);
  });

  test("cancelling an active game ends it and posts a summary marked cancelled, with each player's marks", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t);
    await fill(t, gameId, hostId, [10, 11]);
    await cancel(t, gameId, hostId);

    expect(await gameOf(t, gameId)).toMatchObject({ status: "canceled", endedAt: Date.now() });
    expect((await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }))?.status).toBe("canceled");
    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.data.cancelled).toBe(true);
    expect(summary.data.games[0].players).toEqual([
      { name: "Host", avatar: "default", score: 3, isWinner: false },
      { name: "Aki", avatar: "fox", score: 1, isWinner: false },
    ]);
  });

  test("cancelling after the first bingo keeps the winner in the cancelled summary", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await wonGame(t);
    await cancel(t, gameId, hostId);

    expect((await gameOf(t, gameId)).status).toBe("canceled");
    const [summary] = await summaries(t, roomId);
    expect(summary.data.cancelled).toBe(true);
    expect(summary.data.games[0].players.map((p) => p.isWinner)).toEqual([true, false]);
  });

  test("a game that has ended cannot be cancelled, so a second tap posts nothing", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t);
    await cancel(t, gameId, hostId);
    const endedAt = (await gameOf(t, gameId)).endedAt;
    vi.advanceTimersByTime(1_000);

    await expect(cancel(t, gameId, hostId)).rejects.toThrow(/cannot be canceled/);
    expect((await gameOf(t, gameId)).endedAt).toBe(endedAt);
    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.data.games).toHaveLength(1);

    const solo = await startedGame(t, []);
    await win(t, solo.gameId, solo.hostId);
    await expect(cancel(t, solo.gameId, solo.hostId)).rejects.toThrow(/cannot be canceled/);
    expect((await gameOf(t, solo.gameId)).status).toBe("completed");
  });

  // Commit 93ed5d0. Until then cancelGame made no check: anyone could end anyone's game.
  describe("who may cancel, with AUTH_MODE=enforce", () => {
    const states = ["lobby", "active", "won"] as const;

    beforeEach(() => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    test("a player who hosts neither the game nor the room cannot cancel it, in the lobby, in play or once won", async () => {
      for (const state of states) {
        const t = newBackend();
        const { gameId, playerId } = await guestHostedGame(t, state);
        vi.stubEnv("AUTH_MODE", "enforce");

        await expect(cancel(t, gameId, playerId), state).rejects.toThrow(/Not authorised/);
        const game = await gameOf(t, gameId);
        expect(game.status, state).toBe(state);
        expect(game.endedAt, state).toBeUndefined();
        vi.unstubAllEnvs();
      }
    });

    test("the guest who hosts the game and the room's host can each cancel it, in the lobby, in play or once won", async () => {
      for (const state of states) {
        for (const who of ["gameHostId", "roomHostId"] as const) {
          const t = newBackend();
          const game = await guestHostedGame(t, state);
          vi.stubEnv("AUTH_MODE", "enforce");

          await cancel(t, game.gameId, game[who]);
          expect((await gameOf(t, game.gameId)).status, `${state}, ${who}`).toBe("canceled");
          vi.unstubAllEnvs();
        }
      }
    });

    test("the host of another room cannot cancel", async () => {
      const t = newBackend();
      const { gameId } = await guestHostedGame(t, "active");
      const elsewhere = await createRoom(t);
      vi.stubEnv("AUTH_MODE", "enforce");

      await expect(cancel(t, gameId, elsewhere.hostId)).rejects.toThrow(/Not authorised/);
      expect((await gameOf(t, gameId)).status).toBe("active");
    });
  });

  test("in log mode a cancel by someone who is not a host goes through, and is logged as one enforce would refuse", async () => {
    const t = newBackend();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { gameId, playerId, gameHostId } = await guestHostedGame(t, "active");
    expect(warn).not.toHaveBeenCalled();

    await cancel(t, gameId, playerId);
    expect((await gameOf(t, gameId)).status).toBe("canceled");
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^auth: emojiBingo\.cancelGame not the host/));

    // The game's own host is not logged
    warn.mockClear();
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: gameHostId });
    await cancel(t, nextId, gameHostId);
    expect(warn).not.toHaveBeenCalled();
  });
});

// ─── Caller tokens ───────────────────────────────────────────────────────────

describe("caller tokens (commit 93ed5d0)", () => {
  test("with AUTH_MODE=enforce every mutation refuses a caller who does not send their token", async () => {
    const t = newBackend();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const hostToken = tokenFor(1);
    const akiToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const aki = await joinGuest(t, roomId, "Aki", { token: akiToken });
    vi.stubEnv("AUTH_MODE", "enforce");
    const refused = /Not authorised/;
    const bingo = api.emojiBingo;

    await expect(t.mutation(bingo.createLobby, { roomId, hostParticipantId: hostId }), "createLobby").rejects.toThrow(refused);
    const gameId = await t.mutation(bingo.createLobby, { roomId, hostParticipantId: hostId, token: hostToken });

    await expect(t.mutation(bingo.joinLobby, { gameId, participantId: aki }), "joinLobby").rejects.toThrow(refused);
    await t.mutation(bingo.joinLobby, { gameId, participantId: aki, token: akiToken });

    await expect(
      t.mutation(bingo.updateSettings, { gameId, participantId: hostId, winPattern: "blackout" }),
      "updateSettings"
    ).rejects.toThrow(refused);
    await expect(t.mutation(bingo.leaveLobby, { gameId, participantId: aki }), "leaveLobby").rejects.toThrow(refused);
    await expect(t.mutation(bingo.startGame, { gameId, participantId: hostId }), "startGame").rejects.toThrow(refused);
    expect(await gameOf(t, gameId)).toMatchObject({ status: "lobby", winPattern: "line" });
    expect((await gameOf(t, gameId)).players).toHaveLength(2);
    await t.mutation(bingo.startGame, { gameId, participantId: hostId, token: hostToken });

    const holder = (await gameOf(t, gameId)).currentTurnParticipantId as PlayerId;
    await expect(t.mutation(bingo.rollEmoji, { gameId, participantId: holder }), "rollEmoji").rejects.toThrow(refused);
    await expect(t.mutation(bingo.markCell, { gameId, participantId: aki, cellIndex: CENTRE }), "markCell").rejects.toThrow(refused);
    await expect(t.mutation(bingo.claimBingo, { gameId, participantId: aki }), "claimBingo").rejects.toThrow(refused);
    await expect(t.mutation(bingo.cancelGame, { gameId, participantId: hostId }), "cancelGame").rejects.toThrow(refused);
    expect(await gameOf(t, gameId)).toMatchObject({ status: "active", drawIndex: 0 });

    // The token proves who is calling: someone else's is as good as none
    await expect(cancel(t, gameId, hostId, akiToken), "cancelGame, another player's token").rejects.toThrow(refused);
    await cancel(t, gameId, hostId, hostToken);

    await expect(t.mutation(bingo.playAgain, { gameId, participantId: aki }), "playAgain").rejects.toThrow(refused);
    const nextId = await t.mutation(bingo.playAgain, { gameId, participantId: aki, token: akiToken });
    expect((await gameOf(t, nextId)).hostParticipantId).toBe(aki);
  });

  test("participants from before tokens play under enforce without one", async () => {
    const t = newBackend();
    vi.stubEnv("AUTH_MODE", "enforce");
    const { gameId, hostId, guestIds } = await startedGame(t);

    expect(await win(t, gameId, hostId)).toEqual({ valid: true, placement: 1 });
    expect(await win(t, gameId, guestIds[0])).toEqual({ valid: true, placement: 2 });
    expect((await gameOf(t, gameId)).status).toBe("completed");
  });

  test("in log mode a call without the token goes through and is logged", async () => {
    const t = newBackend();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { roomId, hostId } = await createRoom(t, { hostToken: tokenFor(1) });

    const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId });
    expect((await gameOf(t, gameId)).status).toBe("lobby");
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^auth: emojiBingo\.createLobby no token/));
  });
});

// ─── Summary message ─────────────────────────────────────────────────────────

describe("the summary in the chat", () => {
  test("a finished game posts one system message in the shape the web summary card reads", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    await win(t, gameId, hostId);
    expect(await summaries(t, roomId)).toEqual([]);
    await win(t, gameId, guestIds[0]);

    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.message).toMatchObject({ kind: "system", status: "processed", senderId: hostId, createdAt: Date.now() });
    expect(summary.data).toEqual({
      gameType: "Emoji Bingo",
      games: [
        {
          players: [
            { name: "Host", avatar: "default", score: 5, isWinner: true },
            { name: "Aki", avatar: "fox", score: 5, isWinner: false },
          ],
          totalPairs: 25,
          isTie: false,
        },
      ],
    });
  });

  test("a later game in the same room is added to the same message as another round", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    const [first] = await summaries(t, roomId);

    vi.advanceTimersByTime(60_000);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiBingo.startGame, { gameId: nextId, participantId: hostId });
    await cancel(t, nextId, hostId);

    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.message._id).toBe(first.message._id);
    // Moved to the end of the chat
    expect(summary.message.createdAt).toBe(Date.now());
    expect(summary.data.gameType).toBe("Emoji Bingo");
    expect(summary.data.games.map((g) => g.players.map((p) => p.isWinner))).toEqual([[true], [false]]);
    // The card's subtitle follows the latest round: "Game ended early" for this one...
    expect(summary.data.cancelled).toBe(true);

    // ...and "Game Complete" again once a third game is played to the end
    const thirdId = await t.mutation(api.emojiBingo.playAgain, { gameId: nextId, participantId: hostId });
    await t.mutation(api.emojiBingo.startGame, { gameId: thirdId, participantId: hostId });
    await win(t, thirdId, hostId);
    const [latest, ...rest] = await summaries(t, roomId);
    expect(rest).toEqual([]);
    expect(latest.message._id).toBe(first.message._id);
    expect(latest.data.cancelled).toBeUndefined();
    expect(latest.data.games.map((g) => g.players.map((p) => p.isWinner))).toEqual([[true], [false], [true]]);
  });

  test("an Emoji Match summary in the room is left alone: Bingo posts its own", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    const matchText =
      SUMMARY_PREFIX +
      JSON.stringify({
        gameType: "Match Emoji",
        games: [{ players: [{ name: "Host", avatar: "default", score: 3, isWinner: true }], totalPairs: 8, isTie: false }],
      });
    await t.run(async (ctx) => {
      await ctx.db.insert("messages", {
        roomId,
        senderId: hostId,
        kind: "system",
        status: "processed",
        text: matchText,
        createdAt: Date.now(),
      });
    });
    vi.advanceTimersByTime(1_000);
    await win(t, gameId, hostId);

    const all = await summaries(t, roomId);
    expect(all).toHaveLength(2);
    expect(all.filter((s) => s.message.text === matchText)).toHaveLength(1);
    const bingo = all.find((s) => s.data.gameType === "Emoji Bingo")!;
    expect(bingo.data.games).toHaveLength(1);
    expect(bingo.data.games[0].totalPairs).toBe(25);
  });

  // DEFECT: the fault is in convex/emojiMatch.ts, the damage is to Bingo's summary. upsertMatchEmojiSummary
  // takes the room's latest "emoji_match_summary:" message as its own whatever its gameType, and Bingo writes
  // its summary under that prefix. An Emoji Match game that ends after a Bingo game appends its round to the
  // Bingo message and relabels it "Match Emoji": the Bingo card is gone from the chat and its rounds are shown
  // as match rounds (marked cells as pairs out of 25). Bingo's own finder checks for "Emoji Bingo" (the test
  // above). Listed in the review ("The Emoji Match summary overwrites the Emoji Bingo or Word Rush summary
  // message"); none of the five commits changed it.
  test.fails("an Emoji Match game that ends afterwards leaves the Bingo summary as it was", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    const [bingo, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(bingo.data.gameType).toBe("Emoji Bingo");

    // An Emoji Match game in which one pair is found before the host ends it, which posts a match summary
    vi.advanceTimersByTime(1_000);
    const matchId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: matchId, participantId: hostId });
    const board = await t.run(async (ctx) => (await ctx.db.get(matchId))!.board);
    const twin = board.find((c) => c.pairKey === board[0].pairKey && c.cardId !== board[0].cardId)!;
    for (const card of [board[0], twin]) {
      await t.mutation(api.emojiMatch.flipCard, { gameId: matchId, participantId: hostId, cardId: card.cardId });
    }
    await t.mutation(api.emojiMatch.cancelGame, { gameId: matchId, participantId: hostId });

    const after = await summaries(t, roomId);
    expect(after.filter((s) => s.data.gameType === "Match Emoji")).toHaveLength(1);
    expect(after.filter((s) => s.data.gameType === "Emoji Bingo").map((s) => s.message.text)).toEqual([bingo.message.text]);
  });

  test("a summary stored under the old emoji_bingo_summary prefix is carried over, not duplicated", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    const oldRound = { players: [{ name: "Host", avatar: "default", score: 7, isWinner: true }], totalPairs: 25, isTie: false };
    await t.run(async (ctx) => {
      await ctx.db.insert("messages", {
        roomId,
        senderId: hostId,
        kind: "system",
        status: "processed",
        text: `emoji_bingo_summary:${JSON.stringify({ games: [oldRound] })}`,
        createdAt: Date.now(),
      });
    });
    await win(t, gameId, hostId);

    const messages = await t.query(api.messages.getRoomMessages, { roomId });
    expect(messages.filter((m) => m.text?.startsWith("emoji_bingo_summary:"))).toEqual([]);
    const [summary, ...others] = await summaries(t, roomId);
    expect(others).toEqual([]);
    expect(summary.data.gameType).toBe("Emoji Bingo");
    expect(summary.data.games).toHaveLength(2);
    expect(summary.data.games[0]).toEqual(oldRound);
  });
});

// ─── Play again ──────────────────────────────────────────────────────────────

describe("playAgain", () => {
  test("opens a new lobby hosted by whoever asked, with the same pattern, fresh seats, and the old game untouched", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t, ["Aki"], "four_corners");
    const aki = guestIds[0];
    await win(t, gameId, hostId, CORNERS);
    await win(t, gameId, aki, CORNERS);
    const ended = await gameOf(t, gameId);
    expect(ended.status).toBe("completed");
    await heartbeat(t, hostId);
    await heartbeat(t, aki);

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: aki });

    expect(nextId).not.toBe(gameId);
    const next = await gameOf(t, nextId);
    expect(next).toMatchObject({
      roomId,
      status: "lobby",
      hostParticipantId: aki,
      winPattern: "four_corners",
      drawDeck: [],
      calledEmojis: [],
      drawIndex: 0,
    });
    expect(next.players.map((p) => p.participantId)).toEqual([hostId, aki]);
    for (const player of next.players) expect(player).toMatchObject({ card: [], markedCells: [], placement: 0 });
    expect(await gameOf(t, gameId)).toEqual(ended);
    expect((await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }))?._id).toBe(nextId);
  });

  // Commit 17f6267: only people who are here now are dealt in. Before it, "online and not departed" was enough.
  const absences: Array<[string, (t: Backend, id: PlayerId) => Promise<unknown>]> = [
    ["has not been heard from for 45 seconds", async () => {}],
    ["has gone away", (t, id) => t.mutation(api.participants.setParticipantOnline, { participantId: id, online: true, presence: "away" })],
    ["has left the room", (t, id) => t.mutation(api.participants.leaveRoom, { participantId: id })],
  ];
  test.each(absences)("a player who %s is not given a seat in the next lobby", async (_what, makeAbsent) => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t, ["Aki", "Ben"]);
    const [aki, ben] = guestIds;
    await cancel(t, gameId, hostId);
    await advance(t, 50_000);
    await heartbeat(t, hostId);
    await heartbeat(t, aki);
    await makeAbsent(t, ben);

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: aki });
    expect((await gameOf(t, nextId)).players.map((p) => p.participantId)).toEqual([hostId, aki]);
  });

  // Commit ccda84d: coming back online clears "departed". Before it, a guest who had reloaded was never dealt in again.
  test("a player who left and came back is given a seat", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t, ["Aki", "Ben"]);
    const [aki, ben] = guestIds;
    await cancel(t, gameId, hostId);
    await t.mutation(api.participants.leaveRoom, { participantId: ben });
    await advance(t, 50_000);
    for (const id of [hostId, aki, ben]) await heartbeat(t, id);

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: aki });
    expect((await gameOf(t, nextId)).players.map((p) => p.participantId)).toEqual([hostId, aki, ben]);
  });

  // The iOS host cannot join a Bingo lobby, so the room's host is seated on "online and not departed" alone
  test("after a quiet minute the room's host and whoever asks still keep their seats, in the old order", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t, ["Aki", "Ben"]);
    const [aki, ben] = guestIds;
    await cancel(t, gameId, hostId);
    await advance(t, 50_000);

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: ben });
    const next = await gameOf(t, nextId);
    expect(next.players.map((p) => p.participantId)).toEqual([hostId, ben]);
    expect(next.players.map((p) => p.participantId)).not.toContain(aki);
    expect(next.hostParticipantId).toBe(ben);
  });

  // The room host's exception is "online and not departed", not "always"
  test("the room's host is not given a seat once they have gone offline", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    await cancel(t, gameId, hostId);
    await t.mutation(api.participants.setParticipantOnline, { participantId: hostId, online: false });

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: guestIds[0] });
    const next = await gameOf(t, nextId);
    expect(next.players.map((p) => p.participantId)).toEqual([guestIds[0]]);
    expect(next.hostParticipantId).toBe(guestIds[0]);
  });

  test("a seat in the next lobby shows the player's name and avatar as they are now, not as they were dealt", async () => {
    const t = newBackend();
    const { gameId, hostId, guestIds } = await startedGame(t);
    const aki = guestIds[0];
    await cancel(t, gameId, hostId);
    await t.mutation(api.participants.updateParticipantNickname, { participantId: aki, nickname: "Akira" });
    await t.mutation(api.participants.updateParticipantAvatar, { participantId: aki, avatar: { type: "preset", value: "owl" } });

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    expect(seat(await gameOf(t, nextId), aki)).toMatchObject({ nickname: "Akira", avatarValue: "owl" });
    expect(seat(await gameOf(t, gameId), aki)).toMatchObject({ nickname: "Aki", avatarValue: "fox" });
  });

  test("someone who sat the last game out can ask: they become host, first in the list", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    const cho = await joinGuest(t, roomId, "Cho", { avatar: "owl" });
    await cancel(t, gameId, hostId);

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: cho });
    const next = await gameOf(t, nextId);
    expect(next.hostParticipantId).toBe(cho);
    expect(next.players.map((p) => p.participantId)).toEqual([cho, hostId, guestIds[0]]);
    expect(seat(next, cho)).toMatchObject({ nickname: "Cho", avatarValue: "owl", card: [], markedCells: [], placement: 0 });
  });

  test("a player who was kicked from the room is passed over", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t, ["Aki", "Ben"]);
    await cancel(t, gameId, hostId);
    await t.mutation(api.participants.kickParticipant, { roomId, participantId: guestIds[1] });

    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    expect((await gameOf(t, nextId)).players.map((p) => p.participantId)).toEqual([hostId, guestIds[0]]);
  });

  test("it is refused while a game is in progress, so two taps open one lobby", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    await expect(t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId })).rejects.toThrow(/already in progress/);

    await cancel(t, gameId, hostId);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    await expect(t.mutation(api.emojiBingo.playAgain, { gameId, participantId: guestIds[0] })).rejects.toThrow(/already in progress/);

    const lobbies = await t.run(async (ctx) =>
      ctx.db
        .query("emojiBingoGames")
        .withIndex("by_roomId_status", (q) => q.eq("roomId", roomId).eq("status", "lobby"))
        .collect()
    );
    expect(lobbies.map((g) => g._id)).toEqual([nextId]);
  });
});

// ─── Queries ─────────────────────────────────────────────────────────────────

describe("the queries clients poll", () => {
  test("a game in progress is returned ahead of an older finished one, and only for its own room", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    expect((await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }))?._id).toBe(gameId);

    vi.advanceTimersByTime(1_000);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId })).toMatchObject({ _id: nextId, status: "lobby" });
    await t.mutation(api.emojiBingo.startGame, { gameId: nextId, participantId: hostId });
    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId })).toMatchObject({ _id: nextId, status: "active" });

    const elsewhere = await createRoom(t);
    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId: elsewhere.roomId })).toBeNull();
  });

  test("with nothing in progress the most recent completed game is returned", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    vi.advanceTimersByTime(1_000);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiBingo.startGame, { gameId: nextId, participantId: hostId });
    await win(t, nextId, hostId);

    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId })).toMatchObject({ _id: nextId, status: "completed" });
  });

  // DEFECT: getActiveEmojiBingo looks for a completed game before a cancelled one, whatever their order in
  // time. After game 1 completes, Play Again opens a lobby and that lobby (or the game started from it) is
  // cancelled, the query goes back to game 1. The web hides a cancelled game but shows a completed one, and
  // Play Again cleared its dismissed id, so game 1's results pop up again (for whoever tapped Play Again and
  // anyone who never closed them; the iOS host's game screen goes back to them too) and their Play Again
  // button acts on the stale game. The review lists this fault for Emoji Match's query (emojiMatch.ts, low),
  // which has the same shape, not for this one; none of the five commits changed either.
  test.fails("after a newer game is cancelled, the room's latest game is the cancelled one, not an older completed game", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId } = await startedGame(t, []);
    await win(t, gameId, hostId);
    vi.advanceTimersByTime(1_000);
    const nextId = await t.mutation(api.emojiBingo.playAgain, { gameId, participantId: hostId });
    await cancel(t, nextId, hostId);

    expect((await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }))?._id).toBe(nextId);
  });

  test("the polled game has every field the iOS decoder requires", async () => {
    const t = newBackend();
    const { roomId, gameId, hostId, guestIds } = await startedGame(t);
    const { status, body } = await post(t, "active", { roomId });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      _id: gameId,
      roomId,
      status: "active",
      hostParticipantId: hostId,
      winPattern: "line",
      callIntervalMs: GRACE_MS,
      turnTimeoutMs: TURN_MS,
      calledEmojis: [],
      drawIndex: 0,
    });
    expect(body._creationTime).toBeTypeOf("number");
    expect(Array.isArray(body.drawDeck)).toBe(true);
    expect([...body.turnOrder].sort()).toEqual([hostId, guestIds[0]].sort());
    expect(body.turnOrder).toContain(body.currentTurnParticipantId);
    expect(body.players).toHaveLength(2);
    // The decoder ignores a field it does not know, so only the seven it requires are named, with their types
    for (const player of body.players) {
      expect(player).toMatchObject({
        participantId: expect.any(String),
        nickname: expect.any(String),
        avatarValue: expect.any(String),
        joinedAt: expect.any(Number),
        markedCells: [CENTRE],
        placement: 0,
      });
      expect(player.card).toHaveLength(25);
      expect(player.card.every((cell: unknown) => typeof cell === "string")).toBe(true);
    }
    // Swift decodes these as Int and fails on a fraction, and a failed decode reads as "no game"
    for (const whole of [body.callIntervalMs, body.turnTimeoutMs, body.drawIndex]) {
      expect(Number.isInteger(whole)).toBe(true);
    }
  });

  test("the polled game carries nobody's caller token", async () => {
    const t = newBackend();
    const hostToken = tokenFor(1);
    const akiToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const aki = await joinGuest(t, roomId, "Aki", { token: akiToken });
    const gameId = await t.mutation(api.emojiBingo.createLobby, { roomId, hostParticipantId: hostId, token: hostToken });
    await t.mutation(api.emojiBingo.joinLobby, { gameId, participantId: aki, token: akiToken });
    await t.mutation(api.emojiBingo.startGame, { gameId, participantId: hostId, token: hostToken });

    const polled = JSON.stringify([
      await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }),
      await t.query(api.emojiBingo.getEmojiBingoById, { gameId }),
    ]);
    expect(polled).toContain(aki);
    expect(polled).not.toContain(hostToken);
    expect(polled).not.toContain(akiToken);
  });

  // DEFECT: both queries return the stored document whole, so every client receives drawDeck, the order in
  // which all 48 emojis will be called (and every other player's card). A player can read the next calls off
  // the subscription or the /api/emoji-bingo/state response. Listed in the review under Security ("Game
  // queries send answers to clients: the Bingo draw order"); none of the five commits changed it. The iOS
  // model decodes drawDeck as a required array, so a fix has to keep the field, and the iOS game screen
  // prints calledEmojis.count/drawDeck.count ("5/48 called"): 48 entries with the undrawn ones blanked keep
  // that label right on installed builds, where an emptied or cut deck would read "5/0" or "5/5".
  test.fails("the polled game does not give away the order of the emojis still to be called", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t);
    await rollTurn(t, gameId);
    const stored = await t.run(async (ctx) => (await ctx.db.get(gameId))!);
    const upcoming = stored.drawDeck.slice(stored.drawIndex);
    expect(upcoming).toHaveLength(47);

    for (const polled of [
      await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId }),
      await t.query(api.emojiBingo.getEmojiBingoById, { gameId }),
    ]) {
      expect(polled!.calledEmojis).toEqual(stored.calledEmojis);
      expect(polled!.drawDeck.slice(polled!.drawIndex)).not.toEqual(upcoming);
    }
  });
});

// ─── HTTP routes (the iOS host) ──────────────────────────────────────────────

describe("the /api/emoji-bingo routes", () => {
  // Commit 93ed5d0. The route used to forward callIntervalMs, which the mutation never declared, so a body
  // that carried it was refused by the argument validator.
  test("create-lobby ignores a callIntervalMs in the body, and takes the win pattern from it", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const { status, body } = await post(t, "create-lobby", {
      roomId,
      hostParticipantId: hostId,
      winPattern: "blackout",
      callIntervalMs: 500,
    });

    expect(status).toBe(200);
    expect(Object.keys(body)).toEqual(["gameId"]);
    const game = await gameOf(t, body.gameId);
    expect(game).toMatchObject({ status: "lobby", hostParticipantId: hostId, winPattern: "blackout", callIntervalMs: GRACE_MS });
  });

  test("a whole game can be played through the routes", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const aki = await joinGuest(t, roomId, "Aki");
    const ok = { status: 200, body: { ok: true } };

    const created = await post(t, "create-lobby", { roomId, hostParticipantId: hostId });
    const gameId = created.body.gameId as GameId;
    expect(await post(t, "join", { gameId, participantId: aki })).toEqual(ok);
    expect(await post(t, "leave", { gameId, participantId: aki })).toEqual(ok);
    expect((await post(t, "state", { gameId })).body.players).toHaveLength(1);
    expect(await post(t, "join", { gameId, participantId: aki })).toEqual(ok);
    expect(await post(t, "start", { gameId, participantId: hostId })).toEqual(ok);

    const dealt = (await post(t, "state", { gameId })).body;
    expect(dealt).toMatchObject({ _id: gameId, status: "active", drawIndex: 0 });
    const card: string[] = dealt.players.find((p: { participantId: string }) => p.participantId === hostId).card;
    await stackDeck(t, gameId, [10, 11, 13, 14].map((c) => card[c]));
    for (let i = 0; i < 4; i++) {
      const holder = (await post(t, "state", { gameId })).body.currentTurnParticipantId;
      expect(await post(t, "roll", { gameId, participantId: holder })).toEqual(ok);
    }
    for (const cellIndex of [10, 11, 13, 14]) {
      expect(await post(t, "mark-cell", { gameId, participantId: hostId, cellIndex })).toEqual(ok);
    }

    expect(await post(t, "claim-bingo", { gameId, participantId: aki })).toEqual({
      status: 200,
      body: { valid: false, reason: "pattern_incomplete" },
    });
    expect(await post(t, "claim-bingo", { gameId, participantId: hostId })).toEqual({
      status: 200,
      body: { valid: true, placement: 1 },
    });
    expect((await post(t, "active", { roomId })).body).toMatchObject({ _id: gameId, status: "won", drawIndex: 4 });

    expect(await post(t, "cancel", { gameId, participantId: hostId })).toEqual(ok);
    expect((await post(t, "state", { gameId })).body.status).toBe("canceled");

    const again = await post(t, "play-again", { gameId, participantId: hostId });
    expect(again.status).toBe(200);
    expect(Object.keys(again.body)).toEqual(["gameId"]);
    expect(again.body.gameId).not.toBe(gameId);
    expect((await post(t, "active", { roomId })).body).toMatchObject({ _id: again.body.gameId, status: "lobby" });
  });

  test("a refusal comes back as 400 with the reason in error", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t);
    const game = await gameOf(t, gameId);
    const waiting = game.turnOrder![1];

    const res = await post(t, "roll", { gameId, participantId: waiting });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Not your turn/);
    expect((await gameOf(t, gameId)).drawIndex).toBe(0);
  });

  test("a room that never played has no game: the query returns null, which the route sends as { ok: true }", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    expect(await t.query(api.emojiBingo.getActiveEmojiBingo, { roomId })).toBeNull();
    // The iOS client fails to decode this as a game and reads that as "no game"
    expect(await post(t, "active", { roomId })).toEqual({ status: 200, body: { ok: true } });
  });

  test("every route passes the body's callerToken on: under enforce each works with it and is refused without", async () => {
    const t = newBackend();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const hostToken = tokenFor(1);
    const akiToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const aki = await joinGuest(t, roomId, "Aki", { token: akiToken });
    vi.stubEnv("AUTH_MODE", "enforce");
    // The iOS client adds callerId and callerToken to every body
    const asHost = { callerId: hostId, callerToken: hostToken };
    const asAki = { callerId: aki, callerToken: akiToken };
    const refused = async (route: string, body: Record<string, unknown>) => {
      const res = await post(t, route, body);
      expect(res.status, route).toBe(400);
      expect(res.body.error, route).toMatch(/Not authorised/);
    };
    const accepted = async (route: string, body: Record<string, unknown>) => {
      const res = await post(t, route, body);
      expect(res.status, `${route}: ${res.body.error}`).toBe(200);
      return res.body;
    };

    await refused("create-lobby", { roomId, hostParticipantId: hostId, callerId: hostId });
    const gameId = (await accepted("create-lobby", { roomId, hostParticipantId: hostId, ...asHost })).gameId as GameId;
    await refused("join", { gameId, participantId: aki, callerId: aki });
    await accepted("join", { gameId, participantId: aki, ...asAki });
    await refused("leave", { gameId, participantId: aki, callerId: aki });
    await accepted("leave", { gameId, participantId: aki, ...asAki });
    await refused("start", { gameId, participantId: hostId, callerId: hostId });
    await accepted("start", { gameId, participantId: hostId, ...asHost });

    await stackDeck(t, gameId, [seat(await gameOf(t, gameId), hostId).card[0]]);
    // Someone else's token is as good as none
    await refused("roll", { gameId, participantId: hostId, callerId: hostId, callerToken: akiToken });
    await accepted("roll", { gameId, participantId: hostId, ...asHost });
    await refused("mark-cell", { gameId, participantId: hostId, cellIndex: 0, callerId: hostId });
    await accepted("mark-cell", { gameId, participantId: hostId, cellIndex: 0, ...asHost });
    await refused("claim-bingo", { gameId, participantId: hostId, callerId: hostId });
    expect(await accepted("claim-bingo", { gameId, participantId: hostId, ...asHost })).toEqual({
      valid: false,
      reason: "pattern_incomplete",
    });
    await refused("cancel", { gameId, participantId: hostId, callerId: hostId });
    await accepted("cancel", { gameId, participantId: hostId, ...asHost });
    await refused("play-again", { gameId, participantId: hostId, callerId: hostId });
    await accepted("play-again", { gameId, participantId: hostId, ...asHost });
  });
});
