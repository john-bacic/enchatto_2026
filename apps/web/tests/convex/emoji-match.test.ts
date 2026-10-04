import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Backend, createRoom, joinGuest, newBackend, tokenFor } from "./setup";

// Emoji Match (convex/emojiMatch.ts and the /api/emoji-match/* routes): a memory game. Players take
// turns flipping two cards; a pair scores and keeps the turn, a miss is shown for 1.2 s and passes it.
// The server owns the 15 s turn clock.

type GameId = Id<"emojiMatchGames">;
type PlayerId = Id<"participants">;
type RoomId = Id<"rooms">;
type Game = Doc<"emojiMatchGames">;

/** The rules' numbers, written out here on purpose: a change to one of them should be a decision */
const TURN_MS = 15_000;
const REVEAL_MS = 1_200;
const MAX_IDLE_TIMEOUTS = 20;
const PRESENT_WITHIN_MS = 45_000;

const T0 = Date.UTC(2026, 9, 3, 12, 0, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Moves the clock forward and runs the scheduled functions that came due */
async function advance(t: Backend, ms: number) {
  vi.advanceTimersByTime(ms);
  await t.finishInProgressScheduledFunctions();
}

/** The game as a client reads it */
async function getGame(t: Backend, gameId: GameId): Promise<Game> {
  const game = await t.query(api.emojiMatch.getEmojiMatchById, { gameId });
  if (!game) throw new Error("The game is missing");
  return game;
}

/**
 * The game as the server stores it. The tests take what was dealt from here and not from a query:
 * what a query may show of a face-down card is a rule of its own (see "queries"), and these tests
 * must keep working when the queries stop sending the pairs.
 */
async function storedGame(t: Backend, gameId: GameId): Promise<Game> {
  const game = await t.run(async (ctx) => await ctx.db.get(gameId));
  if (!game) throw new Error("The game is missing");
  return game;
}

/** A room that holds more than the default ten people */
async function createBigRoom(t: Backend) {
  const room = await t.mutation(api.rooms.createRoom, {
    hostNickname: "Host",
    settings: {
      sourceLanguage: "ja",
      targetLanguage: "en",
      romajiEnabled: true,
      suggestionsEnabled: true,
      maxParticipants: 50,
    },
  });
  return room as { roomId: RoomId; joinCode: string; hostId: PlayerId };
}

/** A room whose host opened a lobby that `guestCount` guests joined. Not started */
async function lobbyWith(t: Backend, guestCount: number) {
  const { roomId, hostId } = guestCount > 8 ? await createBigRoom(t) : await createRoom(t);
  const guests: PlayerId[] = [];
  for (let i = 0; i < guestCount; i++) guests.push(await joinGuest(t, roomId, `Guest ${i + 1}`));
  const gameId: GameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });
  for (const participantId of guests) await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId });
  return { roomId, hostId, guests, gameId };
}

/** The same, started by the host: host plus `guestCount` guests are playing */
async function startedGame(t: Backend, guestCount: number) {
  const lobby = await lobbyWith(t, guestCount);
  await t.mutation(api.emojiMatch.startGame, { gameId: lobby.gameId, participantId: lobby.hostId });
  return lobby;
}

/** A heartbeat, as a visible web tab and the iOS host send every 15 s */
async function heartbeat(t: Backend, ...ids: PlayerId[]) {
  for (const participantId of ids) {
    await t.mutation(api.participants.setParticipantOnline, { participantId, online: true });
  }
}

/**
 * A game of the host and one guest in which it is known who plays first. The shuffle decides that,
 * so the other player is away while the game starts (the first turn goes to someone who is here) and
 * back straight after. For tests whose result would otherwise depend on the shuffle: the host is
 * seated first, so "the guest scored more" is the case in which the order of a summary shows.
 */
async function startedGameOpenedBy(t: Backend, opener: "host" | "guest") {
  const lobby = await lobbyWith(t, 1);
  const away = opener === "host" ? lobby.guests[0] : lobby.hostId;
  await t.mutation(api.participants.setParticipantOnline, { participantId: away, online: true, presence: "away" });
  await t.mutation(api.emojiMatch.startGame, { gameId: lobby.gameId, participantId: lobby.hostId });
  await heartbeat(t, away);
  return { ...lobby, guestId: lobby.guests[0] };
}

/** The pairs still to be found, as [cardId, cardId], read from the stored board */
async function openPairs(t: Backend, gameId: GameId): Promise<Array<[string, string]>> {
  const byPair = new Map<string, string[]>();
  for (const card of (await storedGame(t, gameId)).board) {
    if (card.isMatched) continue;
    byPair.set(card.pairKey, [...(byPair.get(card.pairKey) ?? []), card.cardId]);
  }
  return [...byPair.values()].map((ids) => [ids[0], ids[1]] as [string, string]);
}

function seat(game: Game, id: PlayerId) {
  const player = game.players.find((p) => p.participantId === id);
  if (!player) throw new Error("Not a player in this game");
  return player;
}

async function flip(t: Backend, gameId: GameId, participantId: PlayerId, cardId: string) {
  return await t.mutation(api.emojiMatch.flipCard, { gameId, participantId, cardId });
}

/** Whoever's turn it is finds a pair */
async function takePair(t: Backend, gameId: GameId) {
  const game = await getGame(t, gameId);
  const [first, second] = (await openPairs(t, gameId))[0];
  await flip(t, gameId, game.currentTurnParticipantId!, first);
  return await flip(t, gameId, game.currentTurnParticipantId!, second);
}

async function takePairs(t: Backend, gameId: GameId, count: number) {
  let last: { action: string } | undefined;
  for (let i = 0; i < count; i++) last = await takePair(t, gameId);
  return last;
}

/** Whoever's turn it is turns two cards that do not match, which leaves the game "resolving" */
async function missPair(t: Backend, gameId: GameId) {
  const game = await getGame(t, gameId);
  const [[first], [second]] = await openPairs(t, gameId);
  await flip(t, gameId, game.currentTurnParticipantId!, first);
  return await flip(t, gameId, game.currentTurnParticipantId!, second);
}

/** The room's system lines, as a client reads the chat */
async function chatLines(t: Backend, roomId: RoomId): Promise<string[]> {
  const messages = await t.query(api.messages.getRoomMessages, { roomId });
  return messages.filter((m) => m.kind === "system").map((m) => m.text ?? "");
}

/** Fixture: a system line written straight into the room's chat, such as another game's summary */
async function postSystemLine(t: Backend, roomId: RoomId, senderId: PlayerId, text: string) {
  return await t.run(
    async (ctx) =>
      await ctx.db.insert("messages", { roomId, senderId, kind: "system", status: "processed", text, createdAt: Date.now() })
  );
}

const SUMMARY = "emoji_match_summary:";
const CANCELLED_LINE = "game_cancelled:Match Emoji";

function summariesIn(lines: string[]) {
  return lines.filter((line) => line.startsWith(SUMMARY)).map((line) => JSON.parse(line.slice(SUMMARY.length)));
}

/**
 * Replaces Math.random with a fixed sequence (mulberry32), so that a test about the shuffle gives the
 * same result on every run. Undone by mockRestore or restoreAllMocks.
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

/** Keeps the "auth:" warnings of tests that cause them on purpose out of the output. Undone by restoreAllMocks */
function muteAuthLog() {
  return vi.spyOn(console, "warn").mockImplementation(() => {});
}

async function post(t: Backend, path: string, body: Record<string, unknown>) {
  const res = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

describe("lobby", () => {
  test("createLobby opens a lobby with its creator as game host and only player", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "Aki", { avatar: "cat" });

    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: guestId });

    const game = await getGame(t, gameId);
    expect(game.status).toBe("lobby");
    expect(game.roomId).toBe(roomId);
    expect(game.hostParticipantId).toBe(guestId);
    expect(game.players).toHaveLength(1);
    expect(game.players[0]).toMatchObject({
      participantId: guestId,
      nickname: "Aki",
      avatarValue: "cat",
      isActive: true,
      score: 0,
    });
    expect(game.board).toEqual([]);
    expect(game.currentTurnParticipantId).toBeUndefined();
  });

  test("someone from another room can neither open a lobby here nor join one", async () => {
    const t = newBackend();
    const here = await createRoom(t);
    const elsewhere = await createRoom(t);

    await expect(
      t.mutation(api.emojiMatch.createLobby, { roomId: here.roomId, hostParticipantId: elsewhere.hostId })
    ).rejects.toThrow(/not in this room/i);
    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId: here.roomId })).toBeNull();

    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId: here.roomId, hostParticipantId: here.hostId });
    const stranger = await joinGuest(t, elsewhere.roomId, "Stranger");
    await expect(t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: stranger })).rejects.toThrow(
      /not in this room/i
    );
    expect((await getGame(t, gameId)).players).toHaveLength(1);
  });

  test("a room has one game at a time: a second lobby is refused while one is open or being played", async () => {
    const t = newBackend();
    const { roomId, hostId, guests: [guestId], gameId } = await lobbyWith(t, 1);
    const open = (participantId: PlayerId) =>
      t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: participantId });

    await expect(open(guestId)).rejects.toThrow(/already in progress/i);
    await expect(open(hostId)).rejects.toThrow(/already in progress/i); // a double tap on the host's button

    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    await expect(open(hostId)).rejects.toThrow(/already in progress/i);
    await missPair(t, gameId); // "resolving" counts as being played
    await expect(open(hostId)).rejects.toThrow(/already in progress/i);
  });

  test("joining seats a player once with a score of zero; a second join is refused", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "Aki", { avatar: "cat" });
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });

    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId });
    await expect(t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId })).rejects.toThrow(
      /already joined/i
    );

    const game = await getGame(t, gameId);
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, guestId]);
    expect(seat(game, guestId)).toMatchObject({ nickname: "Aki", avatarValue: "cat", isActive: true, score: 0 });
    expect(game.hostParticipantId).toBe(hostId);
  });

  test("a lobby holds 30 players and refuses the 31st", async () => {
    const t = newBackend();
    const { roomId, gameId } = await lobbyWith(t, 29);
    expect((await getGame(t, gameId)).players).toHaveLength(30);

    const late = await joinGuest(t, roomId, "Late");
    await expect(t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: late })).rejects.toThrow(/full/i);
    expect((await getGame(t, gameId)).players).toHaveLength(30);
  });

  test("once the game has started nobody can join, leave or start it again", async () => {
    const t = newBackend();
    const { roomId, hostId, guests: [guestId], gameId } = await startedGame(t, 1);
    const late = await joinGuest(t, roomId, "Late");

    await expect(t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: late })).rejects.toThrow(/not in lobby/i);
    await expect(t.mutation(api.emojiMatch.leaveLobby, { gameId, participantId: guestId })).rejects.toThrow(
      /not in lobby/i
    );
    await expect(t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId })).rejects.toThrow(
      /not in lobby/i
    );
    expect((await getGame(t, gameId)).players).toHaveLength(2);
  });

  test("a player who leaves the lobby is taken off the list", async () => {
    const t = newBackend();
    const { hostId, guests: [first, second], gameId } = await lobbyWith(t, 2);

    await t.mutation(api.emojiMatch.leaveLobby, { gameId, participantId: first });

    const game = await getGame(t, gameId);
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, second]);
    expect(game.hostParticipantId).toBe(hostId);
    expect(game.status).toBe("lobby");
  });

  test("when the game host leaves the lobby, the player who joined next becomes game host", async () => {
    const t = newBackend();
    const { hostId, guests: [first, second], gameId } = await lobbyWith(t, 2);

    await t.mutation(api.emojiMatch.leaveLobby, { gameId, participantId: hostId });

    const game = await getGame(t, gameId);
    expect(game.hostParticipantId).toBe(first);
    expect(game.players.map((p) => p.participantId)).toEqual([first, second]);
    // The new game host can start it
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: first });
    expect((await getGame(t, gameId)).status).toBe("active");
  });

  test("when the last player leaves, the lobby is cancelled and the room can open a new one", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await lobbyWith(t, 0);

    await t.mutation(api.emojiMatch.leaveLobby, { gameId, participantId: hostId });

    const game = await getGame(t, gameId);
    expect(game.status).toBe("canceled");
    expect(game.players).toEqual([]);
    expect(game.endedAt).toBe(T0);
    const next = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });
    expect(next).not.toBe(gameId);
  });

  // A closed room starts no game, as with Lost in Translation, Word Rush and Truth or Dare
  test("a lobby cannot be opened in a closed room", async () => {
    const t = newBackend();
    const room = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId: room.roomId });

    await expect(
      t.mutation(api.emojiMatch.createLobby, { roomId: room.roomId, hostParticipantId: room.hostId })
    ).rejects.toThrow(/closed/i);
  });

  // playAgain opens a lobby too: the second way in
  test("a finished game cannot be played again in a closed room", async () => {
    const t = newBackend();
    const started = await startedGame(t, 1);
    await t.mutation(api.emojiMatch.cancelGame, { gameId: started.gameId, participantId: started.hostId });
    await t.mutation(api.rooms.closeRoom, { roomId: started.roomId });

    await expect(
      t.mutation(api.emojiMatch.playAgain, { gameId: started.gameId, participantId: started.hostId })
    ).rejects.toThrow(/closed/i);
  });

  // A lobby that was open when the room closed: the third way to a game in a closed room
  test("a lobby left open when its room closed cannot be started", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await lobbyWith(t, 1);
    await t.mutation(api.rooms.closeRoom, { roomId });

    await expect(t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId })).rejects.toThrow(/closed/i);

    expect((await getGame(t, gameId)).status).toBe("lobby");
    expect(await chatLines(t, roomId)).not.toContain("game:Emoji Match");
    // Nothing was scheduled either: no turn clock is waiting to run in the closed room
    await advance(t, 2 * TURN_MS);
    expect((await getGame(t, gameId)).status).toBe("lobby");
  });

  test("the room host's takeover of an abandoned lobby is refused as well once the room is closed", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "Aki");
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: guestId });
    await t.mutation(api.rooms.closeRoom, { roomId }); // which also marks everyone as gone

    await expect(t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId })).rejects.toThrow(
      /closed/i
    );
    expect((await getGame(t, gameId)).hostParticipantId).toBe(guestId);
  });
});

// ─── An abandoned lobby goes to the room host (claimLobby, commit 17f6267) ────

describe("taking over an abandoned lobby", () => {
  /** A lobby opened by a guest, with the room host not in it */
  async function guestLobby(t: Backend) {
    const { roomId, hostId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "Aki");
    const gameId: GameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: guestId });
    return { roomId, hostId, guestId, gameId };
  }

  const waysToBeGone: Array<[string, (t: Backend, id: PlayerId) => Promise<void>]> = [
    [
      "left the room",
      async (t, id) => {
        await t.mutation(api.participants.leaveRoom, { participantId: id });
      },
    ],
    [
      "put the app in the background",
      async (t, id) => {
        await t.mutation(api.participants.setParticipantOnline, { participantId: id, online: true, presence: "away" });
      },
    ],
    [
      "has sent no heartbeat for 45 s",
      async () => {
        vi.advanceTimersByTime(PRESENT_WITHIN_MS);
      },
    ],
  ];

  test.each(waysToBeGone)(
    "the room host's createLobby takes over a lobby whose game host %s",
    async (_way, leave) => {
      const t = newBackend();
      const { roomId, hostId, guestId, gameId } = await guestLobby(t);
      await leave(t, guestId);

      const claimed = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });

      expect(claimed).toBe(gameId);
      const game = await getGame(t, gameId);
      expect(game.status).toBe("lobby");
      expect(game.hostParticipantId).toBe(hostId);
      expect(game.players.map((p) => p.participantId)).toEqual([guestId, hostId]);
      expect(seat(game, hostId)).toMatchObject({ nickname: "Host", isActive: true, score: 0 });
    }
  );

  test("the room host's joinLobby takes over an abandoned lobby, seats the host once, and the host can start it", async () => {
    const t = newBackend();
    const { hostId, guestId, gameId } = await guestLobby(t);
    await t.mutation(api.participants.leaveRoom, { participantId: guestId });

    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: hostId });

    let game = await getGame(t, gameId);
    expect(game.hostParticipantId).toBe(hostId);
    expect(game.players.map((p) => p.participantId)).toEqual([guestId, hostId]);
    // Installed iOS builds only offer Start to the game host: this is what the takeover is for
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(hostId); // the only player who is here
  });

  test("a room host who was already in the lobby is not seated twice when taking it over", async () => {
    const t = newBackend();
    const { roomId, hostId, guestId, gameId } = await guestLobby(t);
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: hostId }); // an ordinary join: the guest is here
    expect((await getGame(t, gameId)).hostParticipantId).toBe(guestId);
    await t.mutation(api.participants.leaveRoom, { participantId: guestId });

    const claimed = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });

    expect(claimed).toBe(gameId);
    const game = await getGame(t, gameId);
    expect(game.hostParticipantId).toBe(hostId);
    expect(game.players.map((p) => p.participantId)).toEqual([guestId, hostId]);
  });

  test("a game host seen within the last 45 s keeps the lobby", async () => {
    const t = newBackend();
    const { roomId, hostId, guestId, gameId } = await guestLobby(t);
    vi.advanceTimersByTime(PRESENT_WITHIN_MS - 1);

    await expect(t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId })).rejects.toThrow(
      /already in progress/i
    );
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: hostId }); // joins as an ordinary player

    const game = await getGame(t, gameId);
    expect(game.hostParticipantId).toBe(guestId);
    expect(game.players.map((p) => p.participantId)).toEqual([guestId, hostId]);
  });

  test("only this room's host can take a lobby over: not another guest, not another room's host", async () => {
    const t = newBackend();
    const { roomId, guestId, gameId } = await guestLobby(t);
    const otherGuest = await joinGuest(t, roomId, "Ben");
    const otherRoom = await createRoom(t);
    await t.mutation(api.participants.leaveRoom, { participantId: guestId });

    await expect(t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: otherGuest })).rejects.toThrow(
      /already in progress/i
    );
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: otherGuest }); // an ordinary join
    await expect(
      t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: otherRoom.hostId })
    ).rejects.toThrow(/not in this room/i);

    const game = await getGame(t, gameId);
    expect(game.hostParticipantId).toBe(guestId);
    expect(game.players.map((p) => p.participantId)).toEqual([guestId, otherGuest]);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

describe("startGame", () => {
  test("only the game host can start: not another player, and not the room host when someone else hosts the game", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const gameHost = await joinGuest(t, roomId, "Aki");
    const player = await joinGuest(t, roomId, "Ben");
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: gameHost });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: player });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: hostId });

    await expect(t.mutation(api.emojiMatch.startGame, { gameId, participantId: player })).rejects.toThrow(
      /only the host/i
    );
    await expect(t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId })).rejects.toThrow(
      /only the host/i
    );
    expect((await getGame(t, gameId)).status).toBe("lobby");

    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: gameHost });
    expect((await getGame(t, gameId)).status).toBe("active");
  });

  test("start deals every card face down, in pairs of one emoji with an English and a Japanese label", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);

    const game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.board).toHaveLength(16);
    expect(new Set(game.board.map((c) => c.cardId)).size).toBe(16);
    expect(game.board.every((c) => !c.isRevealed && !c.isMatched)).toBe(true);
    expect(game.selectedCardIds).toEqual([]);
    expect(game.matchedPairCount).toBe(0);
    expect(game.totalPairs).toBe(8);

    // What was dealt, from the stored board
    const dealt = (await storedGame(t, gameId)).board;
    expect(dealt.map((c) => c.cardId)).toEqual(game.board.map((c) => c.cardId));
    const pairs = new Map<string, Game["board"]>();
    for (const card of dealt) pairs.set(card.pairKey, [...(pairs.get(card.pairKey) ?? []), card]);
    expect(pairs.size).toBe(8);
    const JAPANESE = /[\u3040-\u30ff\u4e00-\u9faf]/; // how the web client tells a Japanese label (emoji-match-game.tsx)
    for (const [a, b, ...rest] of pairs.values()) {
      expect(rest).toEqual([]);
      expect(a.content.kind).toBe("emoji");
      expect(b.content.kind).toBe("emoji");
      expect(a.content.value).toBeTruthy();
      expect(b.content.value).toBe(a.content.value);
      // Both cards are labelled, one of them in Japanese
      expect(a.content.label).toBeTruthy();
      expect(b.content.label).toBeTruthy();
      expect([a, b].filter((card) => JAPANESE.test(card.content.label ?? ""))).toHaveLength(1);
    }
    // No emoji is dealt twice
    expect(new Set(dealt.map((c) => c.content.value)).size).toBe(8);
  });

  test("start shuffles: the two cards of a pair are not left side by side, and another shuffle deals other emojis", async () => {
    const deal = async (seed: number) => {
      const t = newBackend();
      const { hostId, gameId } = await lobbyWith(t, 1);
      const random = seedRandom(seed);
      await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
      random.mockRestore();
      return (await storedGame(t, gameId)).board;
    };
    const one = await deal(1);
    const two = await deal(2);

    // The cards are made pair by pair; left like that, every pair sits on two neighbouring places
    const sideBySide = (board: Game["board"]) =>
      board.filter((card, i) => i % 2 === 0 && board[i + 1].pairKey === card.pairKey).length;
    expect(sideBySide(one)).toBeLessThan(8);
    expect(sideBySide(two)).toBeLessThan(8);
    // Eight of the pool's emojis, picked by the shuffle: not the same eight every game
    const emojis = (board: Game["board"]) => [...new Set(board.map((card) => card.content.value))].sort();
    expect(emojis(two)).not.toEqual(emojis(one));
  });

  test("start puts every player in the turn order, gives one of them the first turn and starts a 15 s clock", async () => {
    const t = newBackend();
    const { hostId, guests, gameId } = await startedGame(t, 2);

    const game = await getGame(t, gameId);
    expect([...game.turnOrder].sort()).toEqual([hostId, ...guests].sort());
    expect(game.turnOrder).toContain(game.currentTurnParticipantId);
    expect(game.turnTimeoutMs).toBe(TURN_MS);
    expect(game.startedAt).toBe(T0);
    expect(game.turnStartedAt).toBe(T0);
    expect(game.players.every((p) => p.score === 0)).toBe(true);
  });

  test.each([
    [4, 4, 4, 8],
    [5, 5, 4, 10],
    [12, 5, 4, 10],
    [13, 6, 6, 18],
  ])("%i players get a %i x %i board of %i pairs", async (players, rows, cols, pairs) => {
    const t = newBackend();
    const { gameId } = await startedGame(t, players - 1);

    const game = await getGame(t, gameId);
    expect(game.turnOrder).toHaveLength(players);
    expect(game.boardRows).toBe(rows);
    expect(game.boardCols).toBe(cols);
    expect(game.totalPairs).toBe(pairs);
    expect(game.board).toHaveLength(pairs * 2);
    expect(new Set((await storedGame(t, gameId)).board.map((c) => c.pairKey)).size).toBe(pairs);
  });

  test("a game of one has no turn clock: the player keeps the turn through a miss and can finish the board", async () => {
    const t = newBackend();
    const { hostId, gameId } = await startedGame(t, 0);
    expect((await getGame(t, gameId)).turnTimeoutMs).toBeUndefined();

    await advance(t, 4 * TURN_MS); // no server timeout
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: hostId }); // and a client's is ignored
    let game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(hostId);
    expect(game.turnStartedAt).toBe(T0);
    expect(game.idleTimeouts ?? 0).toBe(0);

    await missPair(t, gameId);
    await advance(t, REVEAL_MS);
    game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(hostId);

    expect(await takePairs(t, gameId, 8)).toEqual({ action: "game_complete" });
    game = await getGame(t, gameId);
    expect(game.result).toEqual({ winnerParticipantIds: [hostId], isTie: false, endReason: "all_matched" });
  });

  test("the first turn goes to a player who is here, wherever the shuffle put them", async () => {
    const absentCameFirst: boolean[] = [];
    for (const roll of [0, 0.3, 0.6, 0.999]) {
      const t = newBackend();
      const { hostId, guests: [guestId], gameId } = await lobbyWith(t, 1);
      await t.mutation(api.participants.setParticipantOnline, { participantId: guestId, online: true, presence: "away" });

      const random = vi.spyOn(Math, "random").mockReturnValue(roll);
      await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
      random.mockRestore();

      const game = await getGame(t, gameId);
      expect(game.currentTurnParticipantId).toBe(hostId);
      absentCameFirst.push(game.turnOrder[0] === guestId);
    }
    // The shuffle did put the absent player first in at least one of the games, so the rule was exercised
    expect(absentCameFirst).toContain(true);
  });

  test("the chat gets one 'game:Emoji Match' line for the room's first game and none for later ones", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });
    const second = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: second, participantId: hostId });

    const lines = await chatLines(t, roomId);
    expect(lines.filter((line) => line === "game:Emoji Match")).toHaveLength(1);
  });
});

// ─── Flipping cards ──────────────────────────────────────────────────────────

describe("flipCard", () => {
  test("the first card of a turn is turned face up and the turn stays open", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const player = before.currentTurnParticipantId!;
    const [[cardId]] = await openPairs(t, gameId);

    expect(await flip(t, gameId, player, cardId)).toEqual({ action: "first_card" });

    const game = await getGame(t, gameId);
    expect(game.board.filter((c) => c.isRevealed).map((c) => c.cardId)).toEqual([cardId]);
    expect(game.board.some((c) => c.isMatched)).toBe(false);
    expect(game.selectedCardIds).toEqual([cardId]);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(player);
    expect(game.turnStartedAt).toBe(before.turnStartedAt); // the clock keeps running
  });

  test("a matching second card scores a point, keeps the turn and restarts the turn clock", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const player = before.currentTurnParticipantId!;
    const other = before.turnOrder.find((id) => id !== player)!;
    const [[first, second]] = await openPairs(t, gameId);
    vi.advanceTimersByTime(4_000);

    await flip(t, gameId, player, first);
    expect(await flip(t, gameId, player, second)).toEqual({ action: "match" });

    const game = await getGame(t, gameId);
    expect(game.board.filter((c) => c.isMatched).map((c) => c.cardId).sort()).toEqual([first, second].sort());
    expect(game.selectedCardIds).toEqual([]);
    expect(game.matchedPairCount).toBe(1);
    expect(seat(game, player)).toMatchObject({ score: 1, turns: 1 });
    expect(seat(game, other).score).toBe(0);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(player);
    expect(game.turnStartedAt).toBe(T0 + 4_000);
  });

  test("a second card that does not match is shown with the first for 1.2 s, counts a turn and scores nothing", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const player = before.currentTurnParticipantId!;
    const [[first], [second]] = await openPairs(t, gameId);

    await flip(t, gameId, player, first);
    expect(await flip(t, gameId, player, second)).toEqual({ action: "mismatch" });

    const game = await getGame(t, gameId);
    expect(game.status).toBe("resolving");
    expect(game.resolveAt).toBe(T0 + REVEAL_MS);
    expect(game.selectedCardIds).toEqual([first, second]);
    expect(game.board.filter((c) => c.isRevealed).map((c) => c.cardId).sort()).toEqual([first, second].sort());
    expect(game.board.some((c) => c.isMatched)).toBe(false);
    expect(seat(game, player)).toMatchObject({ score: 0, turns: 1 });
    expect(game.matchedPairCount).toBe(0);
  });

  test("a flip out of turn is refused and leaves the board alone", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const waiting = before.turnOrder.find((id) => id !== before.currentTurnParticipantId)!;

    await expect(flip(t, gameId, waiting, before.board[0].cardId)).rejects.toThrow(/not your turn/i);

    const game = await getGame(t, gameId);
    expect(game.board.some((c) => c.isRevealed)).toBe(false);
    expect(game.selectedCardIds).toEqual([]);
  });

  test("a card that is unknown, already face up or already matched cannot be flipped", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const player = before.currentTurnParticipantId!;
    const [[matchedA, matchedB], [faceUp]] = await openPairs(t, gameId);

    await expect(flip(t, gameId, player, "card_999")).rejects.toThrow(/card not found/i);

    await flip(t, gameId, player, matchedA);
    await flip(t, gameId, player, matchedB);
    await expect(flip(t, gameId, player, matchedA)).rejects.toThrow(/already matched/i);

    await flip(t, gameId, player, faceUp);
    await expect(flip(t, gameId, player, faceUp)).rejects.toThrow(/already revealed/i);

    const game = await getGame(t, gameId);
    expect(game.selectedCardIds).toEqual([faceUp]);
    expect(seat(game, player).score).toBe(1);
  });

  test("no card can be flipped in the lobby, while a miss is on show, or after the game is over", async () => {
    const t = newBackend();
    const { hostId, gameId } = await lobbyWith(t, 1);
    await expect(flip(t, gameId, hostId, "card_0")).rejects.toThrow(/not active/i);

    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    await missPair(t, gameId);
    const showing = await getGame(t, gameId);
    const third = showing.board.find((c) => !c.isRevealed)!;
    await expect(flip(t, gameId, showing.currentTurnParticipantId!, third.cardId)).rejects.toThrow(/not active/i);

    await advance(t, REVEAL_MS);
    await takePairs(t, gameId, 8);
    const done = await getGame(t, gameId);
    expect(done.status).toBe("completed");
    await expect(flip(t, gameId, hostId, done.board[0].cardId)).rejects.toThrow(/not active/i);
  });
});

// ─── The mismatch reveal ─────────────────────────────────────────────────────

describe("after a miss", () => {
  test("the server turns both cards back and passes the turn once the 1.2 s reveal is over", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    await missPair(t, gameId);

    await advance(t, REVEAL_MS - 1);
    expect((await getGame(t, gameId)).status).toBe("resolving");

    await advance(t, 1);
    const game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.board.some((c) => c.isRevealed)).toBe(false);
    expect(game.selectedCardIds).toEqual([]);
    expect(game.resolveAt).toBeUndefined();
    expect(game.currentTurnParticipantId).not.toBe(before.currentTurnParticipantId);
    expect(game.turnOrder).toContain(game.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0 + REVEAL_MS);
  });

  test("a client's resolveMismatch before the reveal is over does nothing", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    await missPair(t, gameId);
    const showing = await getGame(t, gameId);
    vi.setSystemTime(T0 + REVEAL_MS - 1);

    await t.mutation(api.emojiMatch.resolveMismatch, { gameId });

    const game = await getGame(t, gameId);
    expect(game.status).toBe("resolving");
    expect(game.currentTurnParticipantId).toBe(showing.currentTurnParticipantId);
    expect(game.board.filter((c) => c.isRevealed)).toHaveLength(2);
  });

  test("a client's resolveMismatch after the reveal passes the turn, and a repeat or the server's own timer does not pass it again", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 2);
    const before = await getGame(t, gameId);
    const order = before.turnOrder;
    const start = order.indexOf(before.currentTurnParticipantId!);
    await missPair(t, gameId);
    vi.setSystemTime(T0 + REVEAL_MS); // the reveal is over by the clock, and the server's timer has not run yet

    await t.mutation(api.emojiMatch.resolveMismatch, { gameId });
    let game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.board.some((c) => c.isRevealed)).toBe(false);
    expect(game.currentTurnParticipantId).toBe(order[(start + 1) % 3]);

    await t.mutation(api.emojiMatch.resolveMismatch, { gameId }); // a second tab: no error, no effect
    await advance(t, REVEAL_MS); // the server's timer
    game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(order[(start + 1) % 3]);
  });
});

// ─── Whose turn is next (pickNextPlayer, commit 17f6267) ─────────────────────

describe("the next player", () => {
  /** The current player misses and the reveal runs out */
  async function missAndPass(t: Backend, gameId: GameId) {
    await missPair(t, gameId);
    await advance(t, REVEAL_MS);
    return (await getGame(t, gameId)).currentTurnParticipantId;
  }

  test("the turn goes round the players in turn order", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 2);
    const before = await getGame(t, gameId);
    const order = before.turnOrder;
    const start = order.indexOf(before.currentTurnParticipantId!);

    for (let step = 1; step <= 4; step++) {
      expect(await missAndPass(t, gameId)).toBe(order[(start + step) % 3]);
    }
  });

  const waysToGo: Array<[string, (t: Backend, roomId: RoomId, id: PlayerId) => Promise<unknown>]> = [
    ["left the room", (t, _roomId, id) => t.mutation(api.participants.leaveRoom, { participantId: id })],
    // A kick deletes the participant, so the game is left holding an id that no longer resolves
    ["was kicked from the room", (t, roomId, id) => t.mutation(api.participants.kickParticipant, { roomId, participantId: id })],
  ];

  test.each(waysToGo)("a player who %s is passed over", async (_way, remove) => {
    const t = newBackend();
    // Three guests play, so that whoever goes is not the room host, who cannot be kicked
    const { roomId } = await createRoom(t);
    const players = [await joinGuest(t, roomId, "Aki"), await joinGuest(t, roomId, "Ben"), await joinGuest(t, roomId, "Chi")];
    const gameId: GameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: players[0] });
    for (const participantId of players.slice(1)) await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId });
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: players[0] });
    const before = await getGame(t, gameId);
    const order = before.turnOrder;
    const start = order.indexOf(before.currentTurnParticipantId!);
    const gone = order[(start + 1) % 3];
    const afterGone = order[(start + 2) % 3];
    await remove(t, roomId, gone);

    expect(await missAndPass(t, gameId)).toBe(afterGone);
    // and again on the next lap
    expect(await missAndPass(t, gameId)).toBe(order[start]);
    expect(await missAndPass(t, gameId)).toBe(afterGone);
    // isActive is left alone: both clients hide inactive players from the score strip
    expect(seat(await getGame(t, gameId), gone).isActive).toBe(true);
  });

  test("the only player who is here keeps the turn, and the other is back in the rotation on returning", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const here = before.currentTurnParticipantId!;
    const gone = before.turnOrder.find((id) => id !== here)!;
    await t.mutation(api.participants.setParticipantOnline, { participantId: gone, online: true, presence: "away" });

    expect(await missAndPass(t, gameId)).toBe(here);
    expect(await missAndPass(t, gameId)).toBe(here);

    await heartbeat(t, gone);
    expect(await missAndPass(t, gameId)).toBe(gone);
  });

  // Commit ccda84d: a heartbeat used to leave `departed` set, so someone who came back stayed out of games
  test("a player who left the room and came back is in the rotation again", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const here = before.currentTurnParticipantId!;
    const back = before.turnOrder.find((id) => id !== here)!;
    await t.mutation(api.participants.leaveRoom, { participantId: back });
    expect(await missAndPass(t, gameId)).toBe(here);

    await heartbeat(t, back); // the tab is open again
    expect(await missAndPass(t, gameId)).toBe(back);
  });

  test("when nobody is here the turn still goes round in order", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 2);
    const before = await getGame(t, gameId);
    const order = before.turnOrder;
    const start = order.indexOf(before.currentTurnParticipantId!);
    for (const participantId of order) await t.mutation(api.participants.leaveRoom, { participantId });

    expect(await missAndPass(t, gameId)).toBe(order[(start + 1) % 3]);
    expect(await missAndPass(t, gameId)).toBe(order[(start + 2) % 3]);
  });
});

// ─── The server's turn clock (review bug 10, commit 17f6267) ─────────────────

describe("the turn clock", () => {
  test("a turn nobody plays is ended by the server after 15 s, with no client call, and not before", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);

    await advance(t, TURN_MS - 1);
    let game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(before.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0);

    await advance(t, 1);
    game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).not.toBe(before.currentTurnParticipantId);
    expect(game.turnOrder).toContain(game.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0 + TURN_MS);

    // The next turn has its own clock
    await advance(t, TURN_MS);
    game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(before.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0 + 2 * TURN_MS);
  });

  test("a turn that runs out with one card turned puts the card back, passes the turn and is not counted as idle", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    await advance(t, TURN_MS); // an idle turn first, so there is a count to reset
    const before = await getGame(t, gameId);
    expect(before.idleTimeouts).toBe(1);
    const player = before.currentTurnParticipantId!;
    const [[cardId]] = await openPairs(t, gameId);
    await flip(t, gameId, player, cardId);

    await advance(t, TURN_MS);

    const game = await getGame(t, gameId);
    expect(game.board.some((c) => c.isRevealed)).toBe(false);
    expect(game.selectedCardIds).toEqual([]);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).not.toBe(player);
    expect(game.idleTimeouts).toBe(0);
    expect(seat(game, player).score).toBe(0);
  });

  test("a match restarts the clock: the timer of the old turn does nothing, and the turn ends 15 s after the match", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    vi.advanceTimersByTime(5_000);
    await takePair(t, gameId);
    const matched = await getGame(t, gameId);
    const player = matched.currentTurnParticipantId!;
    expect(matched.turnStartedAt).toBe(T0 + 5_000);

    await advance(t, 10_000); // 15 s after the start: the first timer fires
    let game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(player);
    expect(game.turnStartedAt).toBe(T0 + 5_000);

    await advance(t, 4_999);
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(player);

    await advance(t, 1); // 15 s after the match
    game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).not.toBe(player);
    expect(game.turnStartedAt).toBe(T0 + 20_000);
    expect(seat(game, player).score).toBe(1);
  });

  test("the scheduled timeout carries its turn's start time: one for an earlier turn does nothing, the current one passes the turn", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);

    await t.mutation(internal.emojiMatch.internalTimeoutTurn, { gameId, turnStartedAt: T0 - TURN_MS });
    let game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(before.currentTurnParticipantId);
    expect(game.idleTimeouts ?? 0).toBe(0);

    await t.mutation(internal.emojiMatch.internalTimeoutTurn, { gameId, turnStartedAt: before.turnStartedAt! });
    game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).not.toBe(before.currentTurnParticipantId);
    expect(game.idleTimeouts).toBe(1);
  });

  test("a timer that fires while a miss is on show does nothing; the end of the reveal starts the next turn and its clock", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    vi.advanceTimersByTime(14_500);
    await missPair(t, gameId); // on show until 15.7 s
    const showing = await getGame(t, gameId);

    await advance(t, 500); // 15 s: the turn's timer
    let game = await getGame(t, gameId);
    expect(game.status).toBe("resolving");
    expect(game.currentTurnParticipantId).toBe(showing.currentTurnParticipantId);
    expect(game.board.filter((c) => c.isRevealed)).toHaveLength(2);

    await advance(t, 700); // 15.7 s: the reveal ends
    game = await getGame(t, gameId);
    const next = game.currentTurnParticipantId;
    expect(game.status).toBe("active");
    expect(next).not.toBe(showing.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0 + 15_700);
    expect(game.idleTimeouts).toBe(0);

    await advance(t, TURN_MS - 1);
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(next);
    await advance(t, 1);
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(showing.currentTurnParticipantId);
  });

  test("the clock stops in a closed room instead of ticking on", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    await t.mutation(api.rooms.closeRoom, { roomId });

    await advance(t, TURN_MS);
    await advance(t, 30 * TURN_MS);

    const game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).toBe(before.currentTurnParticipantId);
    expect(game.turnStartedAt).toBe(T0);
    expect(game.idleTimeouts ?? 0).toBe(0);
    expect(await chatLines(t, roomId)).not.toContain(CANCELLED_LINE);
  });

  test("timers left over from a game that was won or cancelled do nothing", async () => {
    const t = newBackend();
    const won = await startedGame(t, 1);
    vi.advanceTimersByTime(1_000);
    await takePairs(t, won.gameId, 8);
    const cancelled = await startedGame(t, 1);
    await missPair(t, cancelled.gameId); // cancelled while a miss is on show
    await t.mutation(api.emojiMatch.cancelGame, { gameId: cancelled.gameId, participantId: cancelled.hostId });

    await advance(t, REVEAL_MS);
    await advance(t, TURN_MS);
    await advance(t, TURN_MS);

    const wonGame = await getGame(t, won.gameId);
    expect(wonGame.status).toBe("completed");
    expect(wonGame.result?.endReason).toBe("all_matched");
    expect(await chatLines(t, won.roomId)).not.toContain(CANCELLED_LINE);

    const cancelledGame = await getGame(t, cancelled.gameId);
    expect(cancelledGame.status).toBe("canceled");
    expect((await chatLines(t, cancelled.roomId)).filter((line) => line === CANCELLED_LINE)).toHaveLength(1);
  });
});

// ─── timeoutTurn, the call web tabs still make ───────────────────────────────

describe("timeoutTurn from a client", () => {
  test("it is ignored until one second before the 15 s limit, and from then on it ends the turn", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const player = before.currentTurnParticipantId!;

    vi.setSystemTime(T0 + TURN_MS - 1_001);
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: player });
    let game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(player);
    expect(game.turnStartedAt).toBe(T0);

    vi.setSystemTime(T0 + TURN_MS - 1_000);
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: player });
    game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.currentTurnParticipantId).not.toBe(player);
    expect(game.turnStartedAt).toBe(T0 + TURN_MS - 1_000);
    expect(game.idleTimeouts).toBe(1);
  });

  test("a call naming a player whose turn it is not is ignored", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const before = await getGame(t, gameId);
    const waiting = before.turnOrder.find((id) => id !== before.currentTurnParticipantId)!;
    vi.setSystemTime(T0 + TURN_MS);

    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: waiting });

    const game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(before.currentTurnParticipantId);
    expect(game.idleTimeouts ?? 0).toBe(0);
  });

  test("a second tab's call and the server's own timer do not pass the same turn again, and count it once", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 2);
    const before = await getGame(t, gameId);
    const order = before.turnOrder;
    const start = order.indexOf(before.currentTurnParticipantId!);
    const timedOut = order[start];
    vi.advanceTimersByTime(TURN_MS - 1_000);

    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: timedOut });
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: timedOut }); // another tab
    await advance(t, 1_000); // the server's timer for that turn

    let game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(order[(start + 1) % 3]);
    expect(game.idleTimeouts).toBe(1);

    // The server's timer for the new turn and the clients' calls count in the same run
    await advance(t, TURN_MS - 1_000);
    game = await getGame(t, gameId);
    expect(game.currentTurnParticipantId).toBe(order[(start + 2) % 3]);
    expect(game.idleTimeouts).toBe(2);
  });

  test("a call for a game that is not in play is ignored without an error", async () => {
    const t = newBackend();
    const { hostId, gameId } = await lobbyWith(t, 1);
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: hostId });
    expect((await getGame(t, gameId)).status).toBe("lobby");

    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    await missPair(t, gameId);
    const showing = await getGame(t, gameId);
    vi.setSystemTime(T0 + TURN_MS);
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: showing.currentTurnParticipantId! });
    expect((await getGame(t, gameId)).status).toBe("resolving");

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: showing.currentTurnParticipantId! });
    expect((await getGame(t, gameId)).status).toBe("canceled");
  });
});

// ─── The idle cap (commit 17f6267) ───────────────────────────────────────────

describe("a game nobody is playing", () => {
  test("is ended as cancelled after 20 turns in a row with no card flipped, with a line in the chat, and then stops", async () => {
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 1);

    for (let i = 1; i < MAX_IDLE_TIMEOUTS; i++) await advance(t, TURN_MS);
    let game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.idleTimeouts).toBe(MAX_IDLE_TIMEOUTS - 1);

    await advance(t, TURN_MS);
    game = await getGame(t, gameId);
    // "completed", not "canceled": both clients show a completed game with endReason "canceled" as a
    // cancelled game's results, where status "canceled" closes the game screen.
    expect(game.status).toBe("completed");
    expect(game.result).toEqual({ winnerParticipantIds: [], isTie: false, endReason: "canceled" });
    expect(game.currentTurnParticipantId).toBeUndefined();
    expect(game.endedAt).toBe(T0 + MAX_IDLE_TIMEOUTS * TURN_MS);
    let lines = await chatLines(t, roomId);
    expect(lines.filter((line) => line === CANCELLED_LINE)).toHaveLength(1);
    expect(summariesIn(lines)).toEqual([]);

    await advance(t, 5 * TURN_MS);
    lines = await chatLines(t, roomId);
    expect(lines.filter((line) => line === CANCELLED_LINE)).toHaveLength(1);
    expect((await getGame(t, gameId)).endedAt).toBe(T0 + MAX_IDLE_TIMEOUTS * TURN_MS);
  });

  test("leaves the summary, marked cancelled and with no winner on the game, when pairs had been found", async () => {
    const t = newBackend();
    // The guest, seated second, is the one who scores: the summary has to put the scorer first
    const { roomId, gameId, guestId: scorer } = await startedGameOpenedBy(t, "guest");
    vi.advanceTimersByTime(1_000);
    await takePair(t, gameId);

    for (let i = 0; i < MAX_IDLE_TIMEOUTS; i++) await advance(t, TURN_MS);

    const game = await getGame(t, gameId);
    expect(game.status).toBe("completed");
    expect(game.result).toEqual({ winnerParticipantIds: [], isTie: false, endReason: "canceled" });
    const lines = await chatLines(t, roomId);
    expect(lines).not.toContain(CANCELLED_LINE);
    const [summary, ...others] = summariesIn(lines);
    expect(others).toEqual([]);
    expect(summary.gameType).toBe("Match Emoji");
    expect(summary.cancelled).toBe(true);
    expect(summary.games).toHaveLength(1);
    // As when a host cancels: the top scorer is marked in the summary, though the game has no winner
    expect(summary.games[0].players[0]).toMatchObject({ name: seat(game, scorer).nickname, score: 1, isWinner: true });
    expect(summary.games[0].players[1]).toMatchObject({ score: 0, isWinner: false });
  });

  test("a match resets the count of idle turns", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    for (let i = 0; i < 3; i++) await advance(t, TURN_MS);
    expect((await getGame(t, gameId)).idleTimeouts).toBe(3);

    await takePair(t, gameId);
    expect((await getGame(t, gameId)).idleTimeouts).toBe(0);

    // so it takes a fresh run of 20 to end the game
    for (let i = 1; i < MAX_IDLE_TIMEOUTS; i++) await advance(t, TURN_MS);
    expect((await getGame(t, gameId)).status).toBe("active");
    await advance(t, TURN_MS);
    expect((await getGame(t, gameId)).status).toBe("completed");
  });

  test("a miss resets the count of idle turns", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    for (let i = 0; i < 3; i++) await advance(t, TURN_MS);
    expect((await getGame(t, gameId)).idleTimeouts).toBe(3);

    await missPair(t, gameId);
    await advance(t, REVEAL_MS);

    const game = await getGame(t, gameId);
    expect(game.status).toBe("active");
    expect(game.idleTimeouts).toBe(0);
  });
});

// ─── Completion and the summary ──────────────────────────────────────────────

describe("finishing the game", () => {
  /**
   * A two-player game played to the end: the first player takes `firstScore` pairs, the other the rest.
   * The first player is the host on every run (see startedGameOpenedBy)
   */
  async function playedOut(t: Backend, firstScore: number) {
    const started = await startedGameOpenedBy(t, "host");
    const first = started.hostId;
    const second = started.guestId;
    vi.advanceTimersByTime(1_000);
    await takePairs(t, started.gameId, firstScore);
    await missPair(t, started.gameId);
    await advance(t, REVEAL_MS);
    const last = await takePairs(t, started.gameId, 8 - firstScore);
    return { ...started, first, second, last };
  }

  test("matching the last pair completes the game and names the top scorer the winner", async () => {
    const t = newBackend();
    const { gameId, first, second, last } = await playedOut(t, 5);

    expect(last).toEqual({ action: "game_complete" });
    const game = await getGame(t, gameId);
    expect(game.status).toBe("completed");
    expect(game.matchedPairCount).toBe(8);
    expect(game.board.every((c) => c.isMatched)).toBe(true);
    expect(game.selectedCardIds).toEqual([]);
    expect(seat(game, first).score).toBe(5);
    expect(seat(game, second).score).toBe(3);
    expect(game.result).toEqual({ winnerParticipantIds: [first], isTie: false, endReason: "all_matched" });
    expect(game.endedAt).toBe(Date.now());
  });

  test("equal top scores are a tie, and both players are winners", async () => {
    const t = newBackend();
    const { gameId, first, second } = await playedOut(t, 4);

    const game = await getGame(t, gameId);
    expect(game.status).toBe("completed");
    expect(game.result?.isTie).toBe(true);
    expect([...game.result!.winnerParticipantIds].sort()).toEqual([first, second].sort());
    expect(game.result?.endReason).toBe("all_matched");
  });

  test("a finished game posts one summary to the chat, players in score order with the winner marked", async () => {
    const t = newBackend();
    // The host, seated first, scores less: score order is not the order the players are seated in
    const { roomId, gameId, first, second } = await playedOut(t, 3);

    const game = await getGame(t, gameId);
    const lines = await chatLines(t, roomId);
    expect(summariesIn(lines)).toEqual([
      {
        gameType: "Match Emoji",
        games: [
          {
            players: [
              { name: seat(game, second).nickname, avatar: seat(game, second).avatarValue, score: 5, isWinner: true },
              { name: seat(game, first).nickname, avatar: seat(game, first).avatarValue, score: 3, isWinner: false },
            ],
            totalPairs: 8,
            isTie: false,
          },
        ],
      },
    ]);
    expect(lines).not.toContain(CANCELLED_LINE);
  });

  test("a later game's result is added to the room's one summary message, which moves to the end of the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await playedOut(t, 5);
    // Something is said in the chat between the two games
    const bystander = await joinGuest(t, roomId, "Bystander");
    vi.advanceTimersByTime(10_000);
    await t.mutation(api.participants.setParticipantOnline, { participantId: bystander, online: false });
    vi.advanceTimersByTime(10_000);
    const second = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: second, participantId: hostId });
    await takePairs(t, second, 8);

    const lines = await chatLines(t, roomId);
    expect(lines).toContain("leave:Bystander");
    // Clients show the chat in this order: the updated summary is below everything said before it
    expect(lines[lines.length - 1].startsWith(SUMMARY)).toBe(true);
    const summaries = summariesIn(lines);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].gameType).toBe("Match Emoji");
    expect(summaries[0].games).toHaveLength(2);
    expect(summaries[0].games[0].players.map((p: { score: number }) => p.score)).toEqual([5, 3]);
    expect(summaries[0].games[1].players.map((p: { score: number }) => p.score)).toEqual([8, 0]);
  });

  // Word Rush and Emoji Bingo post their summaries under the same "emoji_match_summary:" prefix and are
  // told apart by gameType. The fixture below is the text wordRush.ts writes.
  test("a finished game leaves another game's summary message alone and posts its own", async () => {
    const t = newBackend();
    const wordRush =
      SUMMARY +
      JSON.stringify({
        gameType: "Word Rush",
        games: [{ players: [{ name: "Host", avatar: "default", score: 3, isWinner: true }], totalPairs: 5, isTie: false }],
      });
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    const wordRushMessage = await postSystemLine(t, roomId, hostId, wordRush);
    vi.advanceTimersByTime(1_000);
    await takePairs(t, gameId, 8);

    const kept = await t.query(api.messages.getMessageById, { messageId: wordRushMessage });
    expect(kept?.text).toBe(wordRush);
    const summaries = summariesIn(await chatLines(t, roomId));
    expect(summaries.map((s) => s.gameType).sort()).toEqual(["Match Emoji", "Word Rush"]);
  });

  // The fixture is the text emojiBingo.ts writes; a player's name is no gameType, whatever it says
  test("an Emoji Bingo summary is left alone too, also when one of its players is called Match Emoji", async () => {
    const t = newBackend();
    const bingo =
      SUMMARY +
      JSON.stringify({
        gameType: "Emoji Bingo",
        games: [{ players: [{ name: "Match Emoji", avatar: "default", score: 5, isWinner: true }], totalPairs: 25, isTie: false }],
      });
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    const bingoMessage = await postSystemLine(t, roomId, hostId, bingo);
    vi.advanceTimersByTime(1_000);
    await takePair(t, gameId);
    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId }); // the other way a summary is written

    expect((await t.query(api.messages.getMessageById, { messageId: bingoMessage }))?.text).toBe(bingo);
    const summaries = summariesIn(await chatLines(t, roomId));
    expect(summaries.map((s) => s.gameType).sort()).toEqual(["Emoji Bingo", "Match Emoji"]);
    expect(summaries.find((s) => s.gameType === "Match Emoji")).toMatchObject({ cancelled: true, games: [{ totalPairs: 8 }] });
  });

  test("a later game finds its own summary behind a newer one of another game, and adds its round there", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 0);
    await takePairs(t, gameId, 8);
    const [own] = (await t.query(api.messages.getRoomMessages, { roomId })).filter((m) => m.text?.startsWith(SUMMARY));
    vi.advanceTimersByTime(1_000);
    const wordRush = SUMMARY + JSON.stringify({ gameType: "Word Rush", games: [{ players: [], totalPairs: 5, isTie: false }] });
    const wordRushMessage = await postSystemLine(t, roomId, hostId, wordRush);
    vi.advanceTimersByTime(1_000);

    const second = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: second, participantId: hostId });
    await takePairs(t, second, 8);

    expect((await t.query(api.messages.getMessageById, { messageId: wordRushMessage }))?.text).toBe(wordRush);
    const updated = await t.query(api.messages.getMessageById, { messageId: own._id });
    expect(summariesIn([updated!.text!])[0]).toMatchObject({ gameType: "Match Emoji", games: [{}, {}] });
    expect(updated!.createdAt).toBe(Date.now()); // moved below the Word Rush card
    expect(summariesIn(await chatLines(t, roomId))).toHaveLength(2);
  });

  // Rooms that played before summaries carried a gameType: only Emoji Match wrote them then
  test.each([
    ["one game, the oldest format", { players: [{ name: "Host", avatar: "default", score: 8, isWinner: true }], totalPairs: 8, isTie: false }],
    ["a list of games", { games: [{ players: [{ name: "Host", avatar: "default", score: 8, isWinner: true }], totalPairs: 8, isTie: false }] }],
  ])("a summary from before gameType existed (%s) is this game's: the next round is added to it", async (_format, old) => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 0);
    const oldMessage = await postSystemLine(t, roomId, hostId, SUMMARY + JSON.stringify(old));
    vi.advanceTimersByTime(1_000);
    await takePairs(t, gameId, 8);

    const summaries = summariesIn(await chatLines(t, roomId));
    expect(summaries).toHaveLength(1);
    expect(summaries[0].gameType).toBe("Match Emoji");
    expect(summaries[0].games).toEqual([
      { players: [{ name: "Host", avatar: "default", score: 8, isWinner: true }], totalPairs: 8, isTie: false },
      { players: [{ name: "Host", avatar: "default", score: 8, isWinner: true }], totalPairs: 8, isTie: false },
    ]);
    expect((await t.query(api.messages.getMessageById, { messageId: oldMessage }))?.createdAt).toBe(Date.now());
  });
});

// ─── Cancelling ──────────────────────────────────────────────────────────────

describe("cancelGame", () => {
  test("the game host can cancel a running game: no winners, and a cancelled line in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    vi.advanceTimersByTime(3_000);

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });

    const game = await getGame(t, gameId);
    expect(game.status).toBe("canceled");
    expect(game.result).toEqual({ winnerParticipantIds: [], isTie: false, endReason: "canceled" });
    expect(game.endedAt).toBe(T0 + 3_000);
    const lines = await chatLines(t, roomId);
    expect(lines.filter((line) => line === CANCELLED_LINE)).toHaveLength(1);
    expect(summariesIn(lines)).toEqual([]);
  });

  test("a lobby can be cancelled before it starts, which frees the room for a new one", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await lobbyWith(t, 1);

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });

    expect((await getGame(t, gameId)).status).toBe("canceled");
    const next = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId });
    expect(next).not.toBe(gameId);
  });

  test("the room host can cancel a game somebody else hosts, without being in it", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const gameHost = await joinGuest(t, roomId, "Aki");
    const player = await joinGuest(t, roomId, "Ben");
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: gameHost });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: player });
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: gameHost });

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });

    expect((await getGame(t, gameId)).status).toBe("canceled");
  });

  test("a player who hosts neither the game nor the room cannot cancel", async () => {
    const t = newBackend();
    const { guests: [guestId], gameId } = await startedGame(t, 1);

    await expect(t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: guestId })).rejects.toThrow(
      /only the host/i
    );
    expect((await getGame(t, gameId)).status).toBe("active");
  });

  test("a game cancelled after pairs were found leaves the summary, marked cancelled, instead of the cancelled line", async () => {
    const t = newBackend();
    // The guest, seated second, is the one who scores: the summary has to put the scorer first
    const { roomId, hostId, gameId, guestId: scorer } = await startedGameOpenedBy(t, "guest");
    vi.advanceTimersByTime(1_000);
    await takePairs(t, gameId, 2);

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });

    const game = await getGame(t, gameId);
    expect(game.result).toEqual({ winnerParticipantIds: [], isTie: false, endReason: "canceled" });
    const lines = await chatLines(t, roomId);
    expect(lines).not.toContain(CANCELLED_LINE);
    const [summary, ...others] = summariesIn(lines);
    expect(others).toEqual([]);
    expect(summary).toMatchObject({ gameType: "Match Emoji", cancelled: true });
    expect(summary.games).toHaveLength(1);
    expect(summary.games[0].totalPairs).toBe(8);
    expect(summary.games[0].players[0]).toMatchObject({ name: seat(game, scorer).nickname, score: 2, isWinner: true });
    expect(summary.games[0].players[1]).toMatchObject({ score: 0, isWinner: false });
  });

  test("a game that is already over cannot be cancelled, and nothing more is posted", async () => {
    const t = newBackend();
    const cancelled = await startedGame(t, 1);
    await t.mutation(api.emojiMatch.cancelGame, { gameId: cancelled.gameId, participantId: cancelled.hostId });
    const won = await startedGame(t, 0);
    await takePairs(t, won.gameId, 8);

    await expect(
      t.mutation(api.emojiMatch.cancelGame, { gameId: cancelled.gameId, participantId: cancelled.hostId })
    ).rejects.toThrow(/already finished/i);
    await expect(
      t.mutation(api.emojiMatch.cancelGame, { gameId: won.gameId, participantId: won.hostId })
    ).rejects.toThrow(/already finished/i);

    expect((await chatLines(t, cancelled.roomId)).filter((line) => line === CANCELLED_LINE)).toHaveLength(1);
    const wonGame = await getGame(t, won.gameId);
    expect(wonGame.status).toBe("completed");
    expect(wonGame.result?.endReason).toBe("all_matched");
  });
});

// ─── Play again ──────────────────────────────────────────────────────────────

describe("playAgain", () => {
  /** A three-player game that the host cancelled after finding a pair or not */
  async function finishedGame(t: Backend) {
    const started = await startedGame(t, 2);
    vi.advanceTimersByTime(1_000);
    await takePair(t, started.gameId);
    await t.mutation(api.emojiMatch.cancelGame, { gameId: started.gameId, participantId: started.hostId });
    return started;
  }

  test("it needs a finished game, and is refused once the next lobby is open", async () => {
    const t = newBackend();
    const { hostId, guests: [guestId], gameId } = await startedGame(t, 1);
    await expect(t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId })).rejects.toThrow(
      /not finished/i
    );

    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });
    const next: GameId = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: guestId });
    // The other player's tap a moment later
    const tapAgain = () => t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await expect(tapAgain()).rejects.toThrow(/already in progress/i);

    // or later still, from a results screen left open while the next game is being played
    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: guestId });
    await expect(tapAgain()).rejects.toThrow(/already in progress/i);
    await missPair(t, next); // "resolving" counts as being played
    await expect(tapAgain()).rejects.toThrow(/already in progress/i);
    expect((await t.run(async (ctx) => await ctx.db.query("emojiMatchGames").collect())).length).toBe(2);
  });

  test("it opens a new lobby hosted by whoever asked, with the players who are here and every score back to zero", async () => {
    const t = newBackend();
    const { roomId, hostId, guests: [first, second], gameId } = await finishedGame(t);

    const next = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: first });

    expect(next).not.toBe(gameId);
    const lobby = await getGame(t, next);
    expect(lobby.status).toBe("lobby");
    expect(lobby.roomId).toBe(roomId);
    expect(lobby.hostParticipantId).toBe(first);
    expect(lobby.players.map((p) => p.participantId)).toEqual([hostId, first, second]);
    expect(lobby.players.every((p) => p.score === 0 && (p.turns ?? 0) === 0 && p.isActive)).toBe(true);
    expect(lobby.board).toEqual([]);
    expect(lobby.result).toBeUndefined();
    // The finished game keeps its own record
    expect((await getGame(t, gameId)).status).toBe("canceled");
  });

  test("players who are not here are left out, even if they still read as online; whoever asked is always in", async () => {
    const t = newBackend();
    const { roomId, hostId, guests: [first, second], gameId } = await finishedGame(t);
    vi.advanceTimersByTime(PRESENT_WITHIN_MS + 1_000); // everyone's last heartbeat is now too old
    await heartbeat(t, hostId); // the host's app is open; the second guest's phone is in a pocket

    // The first guest's tab has sent no heartbeat either, and asks
    const next = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: first });

    const pocketed = (await t.query(api.participants.getRoomParticipants, { roomId })).find((p) => p._id === second);
    expect(pocketed).toMatchObject({ online: true });
    const lobby = await getGame(t, next);
    expect(lobby.players.map((p) => p.participantId)).toEqual([hostId, first]);
    expect(lobby.hostParticipantId).toBe(first);
  });

  test("someone who did not play the last game can ask, and is seated first as game host", async () => {
    const t = newBackend();
    const { roomId, hostId, guests, gameId } = await finishedGame(t);
    const newcomer = await joinGuest(t, roomId, "Newcomer", { avatar: "owl" });

    const next = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: newcomer });

    const lobby = await getGame(t, next);
    expect(lobby.hostParticipantId).toBe(newcomer);
    expect(lobby.players.map((p) => p.participantId)).toEqual([newcomer, hostId, ...guests]);
    expect(seat(lobby, newcomer)).toMatchObject({ nickname: "Newcomer", avatarValue: "owl", score: 0 });
  });

  test("someone from another room cannot open the next lobby here", async () => {
    const t = newBackend();
    const { roomId, gameId } = await finishedGame(t);
    const elsewhere = await createRoom(t);

    await expect(
      t.mutation(api.emojiMatch.playAgain, { gameId, participantId: elsewhere.hostId })
    ).rejects.toThrow(/not in this room/i);
    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId })).toMatchObject({ _id: gameId, status: "canceled" });
  });

  test("the next game plays by the same clock: a miss is shown for 1.2 s and a turn lasts 15 s", async () => {
    const t = newBackend();
    const { hostId, gameId } = await finishedGame(t);
    const next: GameId = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: hostId });
    const startedAt = Date.now();
    expect((await getGame(t, next)).turnTimeoutMs).toBe(TURN_MS);

    await missPair(t, next);
    expect((await getGame(t, next)).resolveAt).toBe(startedAt + REVEAL_MS);
    await advance(t, REVEAL_MS - 1);
    expect((await getGame(t, next)).status).toBe("resolving");
    await advance(t, 1);
    expect((await getGame(t, next)).status).toBe("active");
  });
});

// ─── What the queries return ─────────────────────────────────────────────────

describe("queries", () => {
  test("getActiveEmojiMatch is null for a room that has had no game, whatever other rooms are playing", async () => {
    const t = newBackend();
    const playing = await startedGame(t, 1);
    const quiet = await createRoom(t);

    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId: quiet.roomId })).toBeNull();
    expect((await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId: playing.roomId }))?._id).toBe(playing.gameId);
  });

  test("a lobby or a game in play is returned ahead of an older finished game", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    await takePairs(t, gameId, 8);
    const active = () => t.query(api.emojiMatch.getActiveEmojiMatch, { roomId });

    const next = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    expect(await active()).toMatchObject({ _id: next, status: "lobby" });

    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: hostId });
    expect(await active()).toMatchObject({ _id: next, status: "active" });

    await missPair(t, next);
    expect(await active()).toMatchObject({ _id: next, status: "resolving" });
  });

  test("with nothing in play the newest finished game is returned, result included, for the results screen", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    await takePairs(t, gameId, 8);
    const first = await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId });
    expect(first).toMatchObject({ _id: gameId, status: "completed" });
    expect(first?.result?.endReason).toBe("all_matched");

    const next = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: hostId });
    await takePairs(t, next, 8);
    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId })).toMatchObject({
      _id: next,
      status: "completed",
    });
  });

  test("a cancelled game is returned when the room has had no other, marked as cancelled", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });

    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId })).toMatchObject({
      _id: gameId,
      status: "canceled",
      result: { endReason: "canceled" },
    });
  });

  // With nothing in play the room's latest game is returned, whether it was completed or cancelled
  test("after a newer game is cancelled, that game is the one returned, not an older completed one", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 1);
    await takePairs(t, gameId, 8);
    vi.advanceTimersByTime(60_000);
    const next: GameId = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: hostId });
    await t.mutation(api.emojiMatch.cancelGame, { gameId: next, participantId: hostId });

    const latest = await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId });
    expect(latest?._id).toBe(next);
  });

  // The other way to a cancelled game: the last player walks out of the lobby that Play Again opened
  test("after the next lobby is abandoned, the cancelled lobby is the one returned, in the shape clients decode", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 0);
    await takePairs(t, gameId, 8);
    vi.advanceTimersByTime(60_000);
    const next: GameId = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.leaveLobby, { gameId: next, participantId: hostId });

    // No result on it: iOS decodes result as optional, and both clients hide a game whose status is "canceled"
    const { status, body } = await post(t, "/api/emoji-match/active", { roomId });
    expect(status).toBe(200);
    expect(body).toMatchObject({ _id: next, status: "canceled", players: [], board: [], selectedCardIds: [] });
    expect(body.result).toBeUndefined();
  });

  test("a game completed after an older one was cancelled is the one returned", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startedGame(t, 0);
    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId });
    vi.advanceTimersByTime(60_000);
    const next: GameId = await t.mutation(api.emojiMatch.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.emojiMatch.startGame, { gameId: next, participantId: hostId });
    await takePairs(t, next, 8);

    expect(await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId })).toMatchObject({ _id: next, status: "completed" });
  });

  // Hiding the face-down cards is behind a switch, off unless it is set to "on": builds that turn their own
  // tapped card over before the server answers would draw an empty face
  test.each([undefined, "", "off", "true"])(
    "with EMOJI_MATCH_HIDE_CARDS %j, clients are sent the board as it is stored",
    async (value) => {
      if (value !== undefined) vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", value);
      const t = newBackend();
      const { roomId, gameId } = await startedGame(t, 1);
      const stored = (await storedGame(t, gameId)).board;
      expect(stored.every((c) => c.pairKey && c.content.value)).toBe(true);

      expect((await t.query(api.emojiMatch.getEmojiMatchById, { gameId }))!.board).toEqual(stored);
      expect((await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId }))!.board).toEqual(stored);
    }
  );

  // With the switch on, both queries send a face-down card without its pair and its emoji: face-down cards
  // look alike apart from their id
  test("with the switch on, a face-down card looks like every other face-down card to a client", async () => {
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 1);
    const seen = [
      await t.query(api.emojiMatch.getEmojiMatchById, { gameId }),
      await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId }),
    ].map((game) => game!.board.filter((c) => !c.isRevealed && !c.isMatched));
    for (const faceDown of seen) expect(faceDown).toHaveLength(16);

    for (const faceDown of seen) {
      const looks = new Set(faceDown.map(({ cardId: _cardId, ...rest }) => JSON.stringify(rest)));
      expect(looks.size).toBe(1);
    }
  });

  // The cards are numbered after the shuffle, so an id says nothing about the pair. Clients use it only as a key
  test("a card's id does not say which card is its pair", async () => {
    const t = newBackend();
    const { hostId, gameId } = await lobbyWith(t, 1);
    seedRandom(7); // a fixed shuffle, so that this is the same test on every run
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    const pairs = await openPairs(t, gameId);
    expect(pairs).toHaveLength(8);

    const number = (cardId: string) => Number(cardId.replace(/\D+/g, ""));
    const givenAway = pairs.filter(([a, b]) => Math.floor(number(a) / 2) === Math.floor(number(b) / 2));
    expect(givenAway.length).toBeLessThan(pairs.length);
  });

  // The test above rules out one numbering. This is the rule itself: which ids pair up is the shuffle's doing
  test("the ids are the places on the board, and which two of them are a pair changes from deal to deal", async () => {
    const deal = async (seed: number) => {
      const t = newBackend();
      const { hostId, gameId } = await lobbyWith(t, 1);
      const random = seedRandom(seed);
      await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
      random.mockRestore();
      const board = (await storedGame(t, gameId)).board;
      expect(board.map((c) => c.cardId)).toEqual(board.map((_, place) => `card_${place}`));
      // Every pair as "card_a+card_b", lower place first
      const number = (cardId: string) => Number(cardId.replace(/\D+/g, ""));
      return (await openPairs(t, gameId)).map((pair) => [...pair].sort((a, b) => number(a) - number(b)).join("+")).sort();
    };
    const one = await deal(1);
    const two = await deal(2);

    expect(one).toHaveLength(8);
    expect(two).not.toEqual(one);
    expect(two.filter((pair) => one.includes(pair)).length).toBeLessThan(4);
  });

  test("a card keeps its id and its place for the whole game: through a miss, a match and the end", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 0);
    const dealt = (await getGame(t, gameId)).board.map((c) => c.cardId);
    const ids = async () => (await getGame(t, gameId)).board.map((c) => c.cardId);

    await missPair(t, gameId);
    expect(await ids()).toEqual(dealt);
    await advance(t, REVEAL_MS);
    expect(await ids()).toEqual(dealt);
    await takePair(t, gameId);
    expect(await ids()).toEqual(dealt);
    await takePairs(t, gameId, 7);
    expect((await getGame(t, gameId)).status).toBe("completed");
    expect(await ids()).toEqual(dealt);
  });

  test("with the switch on, a card that is turned back after a miss is hidden again, and one flipped alone is hidden when its turn runs out", async () => {
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 1);
    const [[first], [second], [alone]] = await openPairs(t, gameId);
    const seen = async (cardId: string) =>
      [
        await t.query(api.emojiMatch.getEmojiMatchById, { gameId }),
        await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId }),
      ].map((game) => game!.board.find((c) => c.cardId === cardId)!);
    const hidden = { pairKey: "", content: { kind: "emoji", value: "" }, isMatched: false, isRevealed: false };

    let player = (await getGame(t, gameId)).currentTurnParticipantId!;
    await flip(t, gameId, player, first);
    await flip(t, gameId, player, second);
    for (const cardId of [first, second]) {
      for (const card of await seen(cardId)) expect(card.content.value).toBeTruthy();
    }
    await advance(t, REVEAL_MS);
    for (const cardId of [first, second]) {
      for (const card of await seen(cardId)) expect(card).toEqual({ cardId, ...hidden });
    }

    player = (await getGame(t, gameId)).currentTurnParticipantId!;
    await flip(t, gameId, player, alone);
    for (const card of await seen(alone)) expect(card.content.value).toBeTruthy();
    await advance(t, TURN_MS);
    for (const card of await seen(alone)) expect(card).toEqual({ cardId: alone, ...hidden });
  });

  // The stored game keeps every card whole: the server decides a match from it, not from what clients are sent
  test("hiding the cards from clients leaves the stored board, and the game it decides, as they were", async () => {
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");
    const t = newBackend();
    const { gameId } = await startedGame(t, 0);
    const stored = (await storedGame(t, gameId)).board;
    expect(stored.every((c) => c.pairKey && c.content.value && c.content.label)).toBe(true);
    await t.query(api.emojiMatch.getEmojiMatchById, { gameId });
    expect((await storedGame(t, gameId)).board).toEqual(stored);

    // Two cards that are not a pair are a miss: on the blanked board every face-down pairKey is "", and
    // a server that compared those would call any two cards a match
    expect(await missPair(t, gameId)).toEqual({ action: "mismatch" });
    await advance(t, REVEAL_MS);
    // A client that knows only ids and what it has been shown can still play the board to the end
    expect(await takePairs(t, gameId, 8)).toEqual({ action: "game_complete" });
  });

  // What clients must still be sent with the face-down cards hidden
  test("a client is shown the emoji and label of every card that is face up or matched", async () => {
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", "on");
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 1);
    const player = (await getGame(t, gameId)).currentTurnParticipantId!;
    const [[matchedA, matchedB], [faceUp]] = await openPairs(t, gameId);
    await flip(t, gameId, player, matchedA);
    await flip(t, gameId, player, matchedB);
    await flip(t, gameId, player, faceUp);
    const dealt = (await storedGame(t, gameId)).board;

    for (const game of [
      await t.query(api.emojiMatch.getEmojiMatchById, { gameId }),
      await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId }),
    ]) {
      for (const cardId of [matchedA, matchedB, faceUp]) {
        const shown = game!.board.find((c) => c.cardId === cardId)!;
        expect(shown.content).toEqual(dealt.find((c) => c.cardId === cardId)!.content);
        expect(shown.content.value).toBeTruthy();
        expect(shown.content.label).toBeTruthy();
      }
    }
  });

  test("the game a client reads never carries a caller token", async () => {
    const t = newBackend();
    const hostToken = tokenFor(1);
    const guestToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const guestId = await joinGuest(t, roomId, "Aki", { token: guestToken });
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId, token: hostToken });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId, token: guestToken });
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId, token: hostToken });
    const game = await getGame(t, gameId);
    await t.mutation(api.emojiMatch.flipCard, {
      gameId,
      participantId: game.currentTurnParticipantId!,
      cardId: game.board[0].cardId,
      token: game.currentTurnParticipantId === hostId ? hostToken : guestToken,
    });

    const seen = JSON.stringify([
      await t.query(api.emojiMatch.getEmojiMatchById, { gameId }),
      await t.query(api.emojiMatch.getActiveEmojiMatch, { roomId }),
      await t.query(api.emojiMatch.getEmTraceByRoom, { roomId }),
    ]);
    expect(seen).toContain(gameId);
    expect(seen).not.toContain(hostToken);
    expect(seen).not.toContain(guestToken);
  });

  // Review bug 1 (commit ccda84d): getRecentEmTrace returned the trace rows, and so the game and
  // participant ids, of every room to any caller.
  test("trace rows can only be read one room at a time: the unscoped query is gone", async () => {
    const t = newBackend();
    const one = await startedGame(t, 1);
    const two = await startedGame(t, 1);
    await takePair(t, one.gameId);
    await missPair(t, two.gameId);

    const rows = await t.query(api.emojiMatch.getEmTraceByRoom, { roomId: one.roomId });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.gameId === one.gameId)).toBe(true);
    expect(JSON.stringify(rows)).not.toContain(two.gameId);
    expect(await t.query(api.emojiMatch.getEmTraceByRoom, { roomId: one.roomId, limit: 1 })).toHaveLength(1);

    const emojiMatch = await import("../../convex/emojiMatch");
    expect(Object.keys(emojiMatch)).not.toContain("getRecentEmTrace");
    await expect(t.query((api.emojiMatch as any).getRecentEmTrace, {})).rejects.toThrow();
  });
});

// ─── Caller tokens (commit 93ed5d0) ──────────────────────────────────────────

describe("caller tokens", () => {
  const HOST_TOKEN = tokenFor(1);
  const GUEST_TOKEN = tokenFor(2);

  // A failed check writes an "auth:" line to the log in both modes; these tests cause them on purpose
  let authLog: ReturnType<typeof muteAuthLog>;
  beforeEach(() => {
    authLog = muteAuthLog();
  });

  async function tokenedRoom(t: Backend) {
    const { roomId, hostId } = await createRoom(t, { hostToken: HOST_TOKEN });
    const guestId = await joinGuest(t, roomId, "Aki", { token: GUEST_TOKEN });
    return { roomId, hostId, guestId };
  }

  async function tokenedLobby(t: Backend) {
    const room = await tokenedRoom(t);
    const gameId: GameId = await t.mutation(api.emojiMatch.createLobby, {
      roomId: room.roomId,
      hostParticipantId: room.hostId,
      token: HOST_TOKEN,
    });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: room.guestId, token: GUEST_TOKEN });
    return { ...room, gameId };
  }

  async function tokenedGame(t: Backend) {
    const lobby = await tokenedLobby(t);
    await t.mutation(api.emojiMatch.startGame, { gameId: lobby.gameId, participantId: lobby.hostId, token: HOST_TOKEN });
    const game = await getGame(t, lobby.gameId);
    const current = game.currentTurnParticipantId!;
    const tokenOf = (id: PlayerId) => (id === lobby.hostId ? HOST_TOKEN : GUEST_TOKEN);
    return { ...lobby, game, current, tokenOf };
  }

  /** One call made as one participant: `own` is that participant's token, `other` the other player's */
  type Gated = { call: (token: string | undefined) => Promise<unknown>; own: string; other: string };

  const gated: Array<[string, (t: Backend) => Promise<Gated>]> = [
    [
      "createLobby",
      async (t) => {
        const { roomId, guestId } = await tokenedRoom(t);
        return {
          call: (token) => t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: guestId, token }),
          own: GUEST_TOKEN,
          other: HOST_TOKEN,
        };
      },
    ],
    [
      "joinLobby",
      async (t) => {
        const { roomId, hostId, guestId } = await tokenedRoom(t);
        const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId, token: HOST_TOKEN });
        return {
          call: (token) => t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId, token }),
          own: GUEST_TOKEN,
          other: HOST_TOKEN,
        };
      },
    ],
    [
      "leaveLobby",
      async (t) => {
        const { gameId, guestId } = await tokenedLobby(t);
        return {
          call: (token) => t.mutation(api.emojiMatch.leaveLobby, { gameId, participantId: guestId, token }),
          own: GUEST_TOKEN,
          other: HOST_TOKEN,
        };
      },
    ],
    [
      "startGame",
      async (t) => {
        const { gameId, hostId } = await tokenedLobby(t);
        return {
          call: (token) => t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId, token }),
          own: HOST_TOKEN,
          other: GUEST_TOKEN,
        };
      },
    ],
    [
      "flipCard",
      async (t) => {
        const { gameId, game, current, tokenOf, hostId, guestId } = await tokenedGame(t);
        const cardId = game.board[0].cardId;
        return {
          call: (token) => t.mutation(api.emojiMatch.flipCard, { gameId, participantId: current, cardId, token }),
          own: tokenOf(current),
          other: tokenOf(current === hostId ? guestId : hostId),
        };
      },
    ],
    [
      "cancelGame",
      async (t) => {
        const { gameId, hostId } = await tokenedGame(t);
        return {
          call: (token) => t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId, token }),
          own: HOST_TOKEN,
          other: GUEST_TOKEN,
        };
      },
    ],
    [
      "playAgain",
      async (t) => {
        const { gameId, hostId, guestId } = await tokenedGame(t);
        await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId, token: HOST_TOKEN });
        return {
          call: (token) => t.mutation(api.emojiMatch.playAgain, { gameId, participantId: guestId, token }),
          own: GUEST_TOKEN,
          other: HOST_TOKEN,
        };
      },
    ],
    [
      "resolveMismatch naming its caller",
      async (t) => {
        const { gameId, guestId } = await tokenedGame(t);
        return {
          call: (token) => t.mutation(api.emojiMatch.resolveMismatch, { gameId, callerId: guestId, token }),
          own: GUEST_TOKEN,
          other: HOST_TOKEN,
        };
      },
    ],
    [
      "timeoutTurn naming its caller",
      async (t) => {
        const { gameId, hostId, guestId, current, tokenOf } = await tokenedGame(t);
        // The other player's tab reports the turn: the token to check is the caller's, not the turn-holder's
        const caller = current === hostId ? guestId : hostId;
        return {
          call: (token) =>
            t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: current, callerId: caller, token }),
          own: tokenOf(caller),
          other: tokenOf(current),
        };
      },
    ],
  ];

  test.each(gated)(
    "under enforce, %s is refused without the participant's token or with someone else's, and accepted with their own",
    async (_name, prepare) => {
      vi.stubEnv("AUTH_MODE", "enforce");
      const t = newBackend();
      const { call, own, other } = await prepare(t);

      await expect(call(undefined)).rejects.toThrow(/not authorised/i);
      await expect(call(other)).rejects.toThrow(/not authorised/i);
      await call(own);
    }
  );

  test("in log mode, the default, a call without its token is let through", async () => {
    const t = newBackend();
    const { gameId, hostId } = await tokenedLobby(t);

    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId });
    expect((await getGame(t, gameId)).status).toBe("active");
    await t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: hostId, token: GUEST_TOKEN });
    expect((await getGame(t, gameId)).status).toBe("canceled");

    // and each is reported, so the log lists what enforce would refuse
    const logged = authLog.mock.calls.map((call) => String(call[0]));
    expect(logged).toContainEqual(expect.stringMatching(/^auth: emojiMatch\.startGame no token/));
    expect(logged).toContainEqual(expect.stringMatching(/^auth: emojiMatch\.cancelGame wrong token/));
  });

  test("participants from before tokens need none, even under enforce", async () => {
    vi.stubEnv("AUTH_MODE", "enforce");
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);

    expect(await takePair(t, gameId)).toEqual({ action: "match" });
  });

  test("under enforce a caller who names nobody can still end a finished reveal or an expired turn", async () => {
    vi.stubEnv("AUTH_MODE", "enforce");
    const t = newBackend();
    const { gameId, game, current, tokenOf } = await tokenedGame(t);
    const [[first], [second]] = await openPairs(t, gameId);
    await t.mutation(api.emojiMatch.flipCard, { gameId, participantId: current, cardId: first, token: tokenOf(current) });
    await t.mutation(api.emojiMatch.flipCard, { gameId, participantId: current, cardId: second, token: tokenOf(current) });

    vi.setSystemTime(T0 + REVEAL_MS);
    await t.mutation(api.emojiMatch.resolveMismatch, { gameId });
    const passed = await getGame(t, gameId);
    expect(passed.status).toBe("active");
    expect(passed.currentTurnParticipantId).not.toBe(current);

    vi.setSystemTime(T0 + REVEAL_MS + TURN_MS);
    await t.mutation(api.emojiMatch.timeoutTurn, { gameId, participantId: passed.currentTurnParticipantId! });
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(current);
  });

  test("under enforce the host of another room cannot cancel a game here", async () => {
    vi.stubEnv("AUTH_MODE", "enforce");
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const elsewhere = await createRoom(t);

    await expect(
      t.mutation(api.emojiMatch.cancelGame, { gameId, participantId: elsewhere.hostId })
    ).rejects.toThrow(/not authorised/i);
    expect((await getGame(t, gameId)).status).toBe("active");
  });
});

// ─── The routes the iOS host calls ───────────────────────────────────────────

describe("HTTP routes", () => {
  test("a game from lobby to play-again over the routes, in the shapes the iOS host decodes", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const guestId = await joinGuest(t, roomId, "Aki");
    const leaver = await joinGuest(t, roomId, "Ben");

    const created = await post(t, "/api/emoji-match/create-lobby", { roomId, hostParticipantId: hostId });
    expect(created.status).toBe(200);
    // iOS decodes {gameId: String}; it would not mind another field beside it
    expect(created.body).toMatchObject({ gameId: expect.any(String) });
    const gameId = created.body.gameId as GameId;

    // Calls that return nothing answer {ok:true}
    const ok = { status: 200, body: { ok: true } };
    expect(await post(t, "/api/emoji-match/join", { gameId, participantId: guestId })).toEqual(ok);
    expect(await post(t, "/api/emoji-match/join", { gameId, participantId: leaver })).toEqual(ok);
    expect(await post(t, "/api/emoji-match/leave", { gameId, participantId: leaver })).toEqual(ok);
    expect(await post(t, "/api/emoji-match/start", { gameId, participantId: hostId })).toEqual(ok);

    const active = await post(t, "/api/emoji-match/active", { roomId });
    expect(active.status).toBe(200);
    expect(active.body).toMatchObject({ _id: gameId, roomId, status: "active", hostParticipantId: hostId });
    expect(active.body.players.map((p: { participantId: string }) => p.participantId)).toEqual([hostId, guestId]);
    expect(active.body.board).toHaveLength(16);
    const state = await post(t, "/api/emoji-match/state", { gameId });
    expect(state).toEqual(active);

    const game = await getGame(t, gameId);
    const player = game.currentTurnParticipantId!;
    const [[first], [second]] = await openPairs(t, gameId);
    expect(await post(t, "/api/emoji-match/flip-card", { gameId, participantId: player, cardId: first })).toEqual({
      status: 200,
      body: { action: "first_card" },
    });
    expect(await post(t, "/api/emoji-match/flip-card", { gameId, participantId: player, cardId: second })).toEqual({
      status: 200,
      body: { action: "mismatch" },
    });

    vi.setSystemTime(T0 + REVEAL_MS);
    expect(await post(t, "/api/emoji-match/resolve-mismatch", { gameId })).toEqual(ok);
    const passed = await getGame(t, gameId);
    expect(passed.status).toBe("active");
    expect(passed.currentTurnParticipantId).not.toBe(player);

    vi.setSystemTime(T0 + REVEAL_MS + TURN_MS);
    expect(
      await post(t, "/api/emoji-match/timeout-turn", { gameId, participantId: passed.currentTurnParticipantId })
    ).toEqual(ok);
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(player);

    expect(await post(t, "/api/emoji-match/cancel", { gameId, participantId: hostId })).toEqual(ok);
    expect((await getGame(t, gameId)).status).toBe("canceled");

    const again = await post(t, "/api/emoji-match/play-again", { gameId, participantId: hostId });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ gameId: expect.any(String) });
    expect(again.body.gameId).not.toBe(gameId);
    expect((await getGame(t, again.body.gameId)).status).toBe("lobby");
  });

  // EmojiMatchCard and EmojiMatchContent (apps/ios/Models/EmojiMatchGame.swift) are the same in every
  // build: cardId, pairKey, content.kind and content.value are required strings, label is optional. A
  // card that fails to decode fails the whole game, which the app reads as "no game".
  test.each([
    ["off", 0],
    ["on", 13],
  ])("with the hiding switch %s, every card the routes send has the fields the iOS decoder requires", async (hiding, blank) => {
    vi.stubEnv("EMOJI_MATCH_HIDE_CARDS", hiding);
    const t = newBackend();
    const { roomId, gameId } = await startedGame(t, 0);
    const [[matchedA, matchedB], [faceUp]] = await openPairs(t, gameId);
    const player = (await getGame(t, gameId)).currentTurnParticipantId!;
    for (const cardId of [matchedA, matchedB, faceUp]) await flip(t, gameId, player, cardId);

    for (const [path, body] of [
      ["/api/emoji-match/active", { roomId }],
      ["/api/emoji-match/state", { gameId }],
    ] as const) {
      const res = await post(t, path, body);
      expect([path, res.status]).toEqual([path, 200]);
      const board: Array<Record<string, any>> = res.body.board;
      expect(board).toHaveLength(16);
      expect(new Set(board.map((card) => card.cardId)).size).toBe(16);
      for (const card of board) {
        expect(card).toEqual({
          cardId: expect.any(String),
          pairKey: expect.any(String),
          content: expect.objectContaining({ kind: expect.any(String), value: expect.any(String) }),
          isMatched: expect.any(Boolean),
          isRevealed: expect.any(Boolean),
        });
        if ("label" in card.content) expect(card.content.label).toEqual(expect.any(String));
      }
      // Three with their faces either way. With the switch on, the 13 face down have nothing to tell them apart
      expect(board.filter((card) => card.content.value === "")).toHaveLength(blank);
      expect(board.filter((card) => card.isMatched).map((card) => card.cardId).sort()).toEqual([matchedA, matchedB].sort());
      expect(board.find((card) => card.cardId === faceUp)).toMatchObject({ isRevealed: true, isMatched: false });
      if (hiding === "on") {
        expect(JSON.stringify(board.filter((card) => !card.isRevealed && !card.isMatched))).not.toMatch(/pair_|label/);
      }
    }
  });

  test("a refusal is answered 400 with the reason", async () => {
    const t = newBackend();
    const { gameId } = await startedGame(t, 1);
    const game = await getGame(t, gameId);
    const waiting = game.turnOrder.find((id) => id !== game.currentTurnParticipantId)!;

    const res = await post(t, "/api/emoji-match/flip-card", {
      gameId,
      participantId: waiting,
      cardId: game.board[0].cardId,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not your turn/i);
  });

  // The body is what an iOS build decodes as "no game": it is not a game document
  test("with no game in the room, the active route answers {ok:true}", async () => {
    const t = newBackend();
    const { roomId } = await createRoom(t);

    expect(await post(t, "/api/emoji-match/active", { roomId })).toEqual({ status: 200, body: { ok: true } });
  });

  // The iOS host sends callerToken with every body; a route that drops it locks the host out under enforce
  test("every route that acts for a participant hands callerToken to its function as that participant's token", async () => {
    vi.stubEnv("AUTH_MODE", "enforce");
    muteAuthLog();
    const t = newBackend();
    const hostToken = tokenFor(1);
    const guestToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const guestId = await joinGuest(t, roomId, "Aki", { token: guestToken });
    const tokenOf = (id: PlayerId) => (id === hostId ? hostToken : guestToken);

    /** The route refuses the body without callerToken and accepts the same body with it */
    const gatedPost = async (path: string, body: Record<string, unknown>, callerToken: string) => {
      const refused = await post(t, path, body);
      expect([path, refused.status]).toEqual([path, 400]);
      expect(refused.body.error).toMatch(/not authorised/i);
      const accepted = await post(t, path, { ...body, callerToken });
      expect([path, accepted.status]).toEqual([path, 200]);
      return accepted.body;
    };

    const created = await gatedPost("/api/emoji-match/create-lobby", { roomId, hostParticipantId: hostId }, hostToken);
    const gameId = created.gameId as GameId;
    await gatedPost("/api/emoji-match/join", { gameId, participantId: guestId }, guestToken);
    await gatedPost("/api/emoji-match/leave", { gameId, participantId: guestId }, guestToken);
    expect((await getGame(t, gameId)).players.map((p) => p.participantId)).toEqual([hostId]);
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId, token: guestToken });
    await gatedPost("/api/emoji-match/start", { gameId, participantId: hostId }, hostToken);

    const player = (await getGame(t, gameId)).currentTurnParticipantId!;
    const waiting = player === hostId ? guestId : hostId;
    const [[first]] = await openPairs(t, gameId);
    expect(
      await gatedPost("/api/emoji-match/flip-card", { gameId, participantId: player, cardId: first }, tokenOf(player))
    ).toEqual({ action: "first_card" });

    // These two name their caller as callerId; the token is the caller's, whoever's turn it is
    await gatedPost("/api/emoji-match/resolve-mismatch", { gameId, callerId: waiting }, tokenOf(waiting));
    await gatedPost("/api/emoji-match/timeout-turn", { gameId, participantId: player, callerId: waiting }, tokenOf(waiting));

    await gatedPost("/api/emoji-match/cancel", { gameId, participantId: hostId }, hostToken);
    expect((await getGame(t, gameId)).status).toBe("canceled");
    const again = await gatedPost("/api/emoji-match/play-again", { gameId, participantId: hostId }, hostToken);
    expect((await getGame(t, again.gameId)).hostParticipantId).toBe(hostId);
  });

  test("timeout-turn and resolve-mismatch take the caller as callerId, apart from whose turn ran out", async () => {
    vi.stubEnv("AUTH_MODE", "enforce");
    muteAuthLog();
    const t = newBackend();
    const hostToken = tokenFor(1);
    const guestToken = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken });
    const guestId = await joinGuest(t, roomId, "Aki", { token: guestToken });
    const gameId = await t.mutation(api.emojiMatch.createLobby, { roomId, hostParticipantId: hostId, token: hostToken });
    await t.mutation(api.emojiMatch.joinLobby, { gameId, participantId: guestId, token: guestToken });
    await t.mutation(api.emojiMatch.startGame, { gameId, participantId: hostId, token: hostToken });
    const current = (await getGame(t, gameId)).currentTurnParticipantId!;
    // The other player's tab reports the turn and proves itself with its own token, not the turn-holder's.
    // Caller and turn-holder are different people here on every run, whoever the shuffle put first
    const caller = current === hostId ? guestId : hostId;
    const callerToken = caller === hostId ? hostToken : guestToken;
    const turnHoldersToken = caller === hostId ? guestToken : hostToken;
    vi.setSystemTime(T0 + TURN_MS);

    for (const path of ["/api/emoji-match/timeout-turn", "/api/emoji-match/resolve-mismatch"]) {
      const wrong = await post(t, path, { gameId, participantId: current, callerId: caller, callerToken: turnHoldersToken });
      expect([path, wrong.status]).toEqual([path, 400]);
      expect(wrong.body.error).toMatch(/not authorised/i);
    }
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(current);

    const right = await post(t, "/api/emoji-match/timeout-turn", {
      gameId,
      participantId: current,
      callerId: caller,
      callerToken,
    });
    expect(right).toEqual({ status: 200, body: { ok: true } });
    expect((await getGame(t, gameId)).currentTurnParticipantId).toBe(caller);
  });
});
