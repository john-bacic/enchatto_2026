import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import http from "../../convex/http";
import * as wordRushFunctions from "../../convex/wordRush";
import { FALLBACK_DECK } from "../../convex/wordRushDeck";
import { Backend, createRoom, joinGuest, newBackend, tokenFor } from "./setup";

type RoomId = Id<"rooms">;
type GameId = Id<"wordRushGames">;
type PlayerId = Id<"participants">;
type FileId = Id<"_storage">;
type Game = Doc<"wordRushGames">;

const DECK_WORDS = new Set(FALLBACK_DECK.map((c) => c.en));
const PACKS = ["foodie", "travel", "slang", "anime", "feelings", "chat"];

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Moves the clock, then lets every scheduled function that came due run to its end */
async function tick(t: Backend, ms = 0) {
  vi.advanceTimersByTime(ms);
  await t.finishInProgressScheduledFunctions();
}

/** The functions warn on purpose in these cases (a failed token check, a skipped generation) */
function quiet() {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}

async function heartbeat(t: Backend, ...ids: PlayerId[]) {
  for (const participantId of ids) {
    await t.mutation(api.participants.setParticipantOnline, { participantId, online: true });
  }
}

/** The stored game, for fixtures and for what no query shows (the answer key, the generation counters) */
async function gameDoc(t: Backend, gameId: GameId): Promise<Game> {
  const game = await t.run(async (ctx) => await ctx.db.get(gameId));
  if (!game) throw new Error("Game not found");
  return game;
}

/** What a client sees */
async function stateOf(t: Backend, roomId: RoomId) {
  const state = await t.query(api.wordRush.getState, { roomId });
  if (!state) throw new Error("The room shows no Word Rush game");
  return state;
}

/**
 * A room whose host (a Japanese speaker, so learning English) has opened a lobby, and the guests in it.
 * A guest is "Name" (an English speaker, learning Japanese) or "Name:ja". The clock moves 1 ms after each
 * arrival, so the players joined in order and the lobby's first deck has been dealt.
 */
async function openLobby(t: Backend, options: { guests?: string[]; sayIt?: boolean; pack?: string } = {}) {
  const { roomId, hostId } = await createRoom(t);
  const gameId = await t.mutation(api.wordRush.createLobby, {
    roomId,
    hostParticipantId: hostId,
    pack: options.pack,
    sayIt: options.sayIt,
  });
  await tick(t, 1);
  const guests: PlayerId[] = [];
  for (const spec of options.guests ?? []) {
    const [name, language] = spec.split(":");
    const guestId = await joinGuest(t, roomId, name, { language: language ?? "en" });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: guestId });
    await tick(t, 1);
    guests.push(guestId);
  }
  return { roomId, hostId, gameId, guests };
}

async function startGame(t: Backend, options: { guests?: string[]; sayIt?: boolean } = {}) {
  const lobby = await openLobby(t, options);
  await t.mutation(api.wordRush.start, { gameId: lobby.gameId, participantId: lobby.hostId });
  return lobby;
}

function rightIndex(game: Game, playerId: PlayerId): number {
  const card = game.cards[game.cardIndex];
  const player = game.players.find((p) => p.participantId === playerId);
  if (!player) throw new Error("Not a player");
  return player.learning === "en"
    ? card.choicesEn.indexOf(card.en)
    : card.choicesJa.findIndex((c) => c.ja === card.ja.ja);
}

async function answer(t: Backend, gameId: GameId, playerId: PlayerId, how: "right" | "wrong" = "right") {
  const right = rightIndex(await gameDoc(t, gameId), playerId);
  return await t.mutation(api.wordRush.answer, {
    gameId,
    participantId: playerId,
    choiceIndex: how === "right" ? right : (right + 1) % 4,
  });
}

async function skip(t: Backend, gameId: GameId, by: PlayerId) {
  const game = await gameDoc(t, gameId);
  await t.mutation(api.wordRush.skip, { gameId, participantId: by, phaseSeq: game.phaseSeq });
}

/** Skips phase by phase until the game is in `phase` (of card `cardIndex`, when given) */
async function skipTo(t: Backend, gameId: GameId, by: PlayerId, phase: Game["phase"], cardIndex?: number) {
  for (let i = 0; i < 80; i++) {
    const game = await gameDoc(t, gameId);
    if (game.status !== "active") break;
    if (game.phase === phase && (cardIndex === undefined || game.cardIndex === cardIndex)) return game;
    await t.mutation(api.wordRush.skip, { gameId, participantId: by, phaseSeq: game.phaseSeq });
  }
  throw new Error(`The game never reached ${phase}`);
}

async function playToEnd(t: Backend, gameId: GameId, by: PlayerId) {
  for (let i = 0; i < 80; i++) {
    const game = await gameDoc(t, gameId);
    if (game.status !== "active") return game;
    await t.mutation(api.wordRush.skip, { gameId, participantId: by, phaseSeq: game.phaseSeq });
  }
  throw new Error("The game never ended");
}

/**
 * A file in storage, as an upload would leave it. convex-test's storage keeps a file's size and hash but not
 * its type, which the real upload endpoint records, so the type is written onto the row here.
 */
async function upload(t: Backend, options: { type?: string | null; bytes?: number } = {}): Promise<FileId> {
  const type = options.type === undefined ? "audio/mp4" : options.type;
  return await t.run(async (ctx) => {
    const id = await ctx.storage.store(new Blob([new Uint8Array(options.bytes ?? 4000)]));
    if (type !== null) await (ctx.db as any).patch(id, { contentType: type });
    return id;
  });
}

async function fileExists(t: Backend, id: FileId): Promise<boolean> {
  return await t.run(async (ctx) => (await ctx.db.system.get(id)) !== null);
}

/** A voice message in the chat, and the file it holds */
async function voiceMessageFile(t: Backend, roomId: RoomId, senderId: PlayerId): Promise<FileId> {
  const storageId = await upload(t);
  await t.mutation(api.messages.sendAudioMessage, { roomId, senderId, storageId, durationMs: 2000, waveform: [] });
  return storageId;
}

async function systemTexts(t: Backend, roomId: RoomId): Promise<string[]> {
  return await t.run(async (ctx) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
      .collect();
    return rows.filter((m) => m.kind === "system").map((m) => m.text ?? "");
  });
}

/** Fixture: a system line written straight into the room's chat, such as another game's summary */
async function postSystemLine(t: Backend, roomId: RoomId, senderId: PlayerId, text: string) {
  return await t.run(
    async (ctx) =>
      await ctx.db.insert("messages", { roomId, senderId, kind: "system", status: "processed", text, createdAt: Date.now() })
  );
}

type Summary = {
  gameType: string;
  games: Array<{
    players: Array<{ name: string; avatar: string; score: number; isWinner: boolean }>;
    totalPairs: number;
    isTie: boolean;
  }>;
};

/** Every score summary in the room's chat, parsed */
async function summaries(t: Backend, roomId: RoomId): Promise<Summary[]> {
  const prefix = "emoji_match_summary:";
  return (await systemTexts(t, roomId))
    .filter((text) => text.startsWith(prefix))
    .map((text) => JSON.parse(text.slice(prefix.length)) as Summary);
}

/** A card as the model is asked to write it */
function modelCard(n: number) {
  return {
    en: `word${n}`,
    ja: { ja: `語${n}`, kana: `ご${n}`, romaji: `go${n}` },
    ipa: "/wɜːd/",
    posEn: "noun",
    posJa: "名詞",
    emoji: ["🍎", "🍊", "🍋"],
    hookEn: "A hook.",
    hookJa: "フック。",
    exampleEn: "An example.",
    exampleJa: "例文。",
    scene: "stars",
    wrongEn: [`miss${n}a`, `miss${n}b`, `miss${n}c`],
    wrongJa: ["a", "b", "c"].map((s) => ({ ja: `外${n}${s}`, kana: `はず${s}`, romaji: `hazu${s}` })),
  };
}

const modelCards = (count: number) => Array.from({ length: count }, (_, i) => modelCard(i));

function modelReply(cards: unknown[]): Response {
  return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(cards) }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** Sets the model key and answers every model call with `reply`. Returns the mock, to count and read the calls */
function stubModel(reply: () => Response = () => modelReply(modelCards(12))) {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => reply());
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** A model that has been asked and has not answered yet */
function stubSlowModel() {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  let answerNow: (response: Response) => void = () => {};
  let markAsked: () => void = () => {};
  const asked = new Promise<void>((resolve) => (markAsked = resolve));
  vi.stubGlobal("fetch", () => {
    markAsked();
    return new Promise<Response>((resolve) => (answerNow = resolve));
  });
  return { asked, answer: (cards: unknown[]) => answerNow(modelReply(cards)) };
}

function promptOf(call: [RequestInfo | URL, RequestInit?]): string {
  return JSON.parse(String(call[1]?.body)).messages[0].content;
}

async function post(t: Backend, name: string, body: Record<string, unknown>) {
  const res = await t.fetch(`/api/word-rush/${name}`, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

describe("createLobby", () => {
  test("a new lobby has the caller as game host and only player, the mix pack, Say it on and ten cards", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({
      _id: gameId,
      status: "lobby",
      hostParticipantId: hostId,
      pack: "mix",
      sayIt: true,
      cardsReady: false,
      totalCards: 10,
      // The deck is dealt, and nobody sees a card of it before the start
      card: null,
    });
    expect(state.players.map((p) => p.participantId)).toEqual([hostId]);
  });

  test("asking again returns the caller's own open lobby, with its settings, instead of a second one", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t, { pack: "foodie" });
    const again = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, pack: "anime" });
    expect(again).toBe(gameId);
    expect((await stateOf(t, roomId)).pack).toBe("foodie");
    const games = await t.run(async (ctx) => await ctx.db.query("wordRushGames").collect());
    expect(games).toHaveLength(1);
  });

  test("a room has one lobby or running game at a time", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await openLobby(t, { guests: ["Ann"] });
    await expect(
      t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: guests[0] })
    ).rejects.toThrow(/already in progress/);
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    await expect(
      t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId })
    ).rejects.toThrow(/already in progress/);
  });

  test("an unknown pack, a closed room and a caller from another room are each refused", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const other = await createRoom(t);
    await expect(
      t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, pack: "pirates" })
    ).rejects.toThrow(/Unknown pack/);
    await expect(
      t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: other.hostId })
    ).rejects.toThrow(/not in this room/);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId })).rejects.toThrow(
      /Room is closed/
    );
    expect(await t.query(api.wordRush.getState, { roomId })).toBeNull();
  });
});

describe("taking over a lobby whose game host has gone (claimLobby)", () => {
  /** A lobby opened by a guest, with the room host not in it */
  async function guestLobby(t: Backend) {
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ann, pack: "foodie" });
    await tick(t, 1);
    return { roomId, hostId, ann, gameId };
  }

  test("the room host asking for a lobby is handed the abandoned one, with its settings and players kept", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, gameId } = await guestLobby(t);
    await tick(t, 45_000);
    await heartbeat(t, hostId);
    const claimed = await t.mutation(api.wordRush.createLobby, {
      roomId,
      hostParticipantId: hostId,
      pack: "anime",
      sayIt: false,
    });
    expect(claimed).toBe(gameId);
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(hostId);
    expect(state.players.map((p) => p.participantId)).toEqual([ann, hostId]);
    expect(state).toMatchObject({ pack: "foodie", sayIt: true });
  });

  test("the room host joining an abandoned lobby becomes its game host", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, gameId } = await guestLobby(t);
    await t.mutation(api.participants.leaveRoom, { participantId: ann });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(hostId);
    expect(state.players.map((p) => p.participantId)).toEqual([ann, hostId]);
  });

  test("a game host who is here keeps the lobby: the room host is refused a new one and joins as a player", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, gameId } = await guestLobby(t);
    await expect(t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId })).rejects.toThrow(
      /already in progress/
    );
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(ann);
    expect(state.players.map((p) => p.participantId)).toEqual([ann, hostId]);
  });

  test("a room host already seated in the lobby takes it over without a second seat", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, gameId } = await guestLobby(t);
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: hostId });
    await t.mutation(api.participants.setParticipantOnline, { participantId: ann, online: true, presence: "away" });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(hostId);
    expect(state.players.map((p) => p.participantId)).toEqual([ann, hostId]);
  });

  test("a game host who was kicked counts as gone", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, gameId } = await guestLobby(t);
    await t.mutation(api.participants.kickParticipant, { participantId: ann, roomId });
    expect(await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId })).toBe(gameId);
    expect((await stateOf(t, roomId)).hostParticipantId).toBe(hostId);
  });

  test("a guest cannot take over an abandoned lobby", async () => {
    const t = newBackend();
    const { roomId, ann, gameId } = await guestLobby(t);
    const ben = await joinGuest(t, roomId, "Ben");
    await t.mutation(api.participants.leaveRoom, { participantId: ann });
    await expect(t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ben })).rejects.toThrow(
      /already in progress/
    );
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: ben });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(ann);
    expect(state.players.map((p) => p.participantId)).toEqual([ann, ben]);
  });
});

describe("joinLobby and leaveLobby", () => {
  test("a player is set to learn the language that is not their own", async () => {
    const t = newBackend();
    const { roomId } = await openLobby(t, { guests: ["Ann", "Ken:ja"] });
    // The host of a room made without a host language is stored with the room's source language, Japanese
    expect((await stateOf(t, roomId)).players.map((p) => [p.nickname, p.learning])).toEqual([
      ["Host", "en"],
      ["Ann", "ja"],
      ["Ken", "en"],
    ]);
  });

  test("the host's direction follows the language the app sent with the room, and a lobby keeps the direction a player joined with", async () => {
    const t = newBackend();
    const { roomId, hostId } = await t.mutation(api.rooms.createRoom, { hostNickname: "Host", hostLanguage: "en" });
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    expect((await stateOf(t, roomId)).players[0].learning).toBe("ja");
    await t.mutation(api.participants.updateParticipantLanguage, { participantId: hostId, language: "ja" });
    expect((await stateOf(t, roomId)).players[0].learning).toBe("ja");
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    expect((await stateOf(t, roomId)).players[0].learning).toBe("en");
  });

  test("a seat shows the player's name and avatar, with every count at zero", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    const owl = await joinGuest(t, roomId, "Olly", { avatar: "owl" });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: owl });
    expect((await stateOf(t, roomId)).players[1]).toMatchObject({
      participantId: owl,
      nickname: "Olly",
      avatarValue: "owl",
      learning: "ja",
      score: 0,
      streak: 0,
      bestStreak: 0,
      correct: 0,
      sayItBonus: 0,
    });
  });

  test("joining twice keeps one seat", async () => {
    const t = newBackend();
    const { roomId, gameId, guests } = await openLobby(t, { guests: ["Ann"] });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: guests[0] });
    expect((await stateOf(t, roomId)).players).toHaveLength(2);
  });

  test("a lobby holds 30 players and refuses the next", async () => {
    const t = newBackend();
    const { roomId, hostId } = await t.mutation(api.rooms.createRoom, {
      hostNickname: "Host",
      settings: {
        sourceLanguage: "ja",
        targetLanguage: "en",
        romajiEnabled: true,
        suggestionsEnabled: true,
        maxParticipants: 50,
      },
    });
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    for (let i = 1; i <= 29; i++) {
      const guest = await joinGuest(t, roomId, `Guest ${i}`);
      await t.mutation(api.wordRush.joinLobby, { gameId, participantId: guest });
    }
    expect((await stateOf(t, roomId)).players).toHaveLength(30);
    const late = await joinGuest(t, roomId, "Late");
    await expect(t.mutation(api.wordRush.joinLobby, { gameId, participantId: late })).rejects.toThrow(/full/);
  });

  test("someone from another room cannot join", async () => {
    const t = newBackend();
    const { roomId, gameId } = await openLobby(t);
    const other = await createRoom(t);
    await expect(t.mutation(api.wordRush.joinLobby, { gameId, participantId: other.hostId })).rejects.toThrow(
      /not in this room/
    );
    expect((await stateOf(t, roomId)).players).toHaveLength(1);
  });

  test("once the game has started nobody joins or leaves, and the settings are fixed", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    const late = await joinGuest(t, roomId, "Late");
    await expect(t.mutation(api.wordRush.joinLobby, { gameId, participantId: late })).rejects.toThrow(
      /already started/
    );
    await expect(t.mutation(api.wordRush.leaveLobby, { gameId, participantId: guests[0] })).rejects.toThrow(
      /already started/
    );
    await expect(
      t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" })
    ).rejects.toThrow(/already started/);
    const state = await stateOf(t, roomId);
    expect(state.pack).toBe("mix");
    expect(state.players.map((p) => p.participantId)).toEqual([hostId, guests[0]]);
  });

  test("a guest who leaves the lobby gives up their seat", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await openLobby(t, { guests: ["Ann", "Ben"] });
    await t.mutation(api.wordRush.leaveLobby, { gameId, participantId: guests[0] });
    const state = await stateOf(t, roomId);
    expect(state.players.map((p) => p.participantId)).toEqual([hostId, guests[1]]);
    expect(state.hostParticipantId).toBe(hostId);
  });

  test("when the game host leaves, the next player becomes game host", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await openLobby(t, { guests: ["Ann", "Ben"] });
    await t.mutation(api.wordRush.leaveLobby, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(guests[0]);
    expect(state.players.map((p) => p.participantId)).toEqual(guests);
  });

  test("when the last player leaves, the lobby is cancelled and the room can open another", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.wordRush.leaveLobby, { gameId, participantId: hostId });
    expect(await t.query(api.wordRush.getState, { roomId })).toBeNull();
    const next = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    expect(next).not.toBe(gameId);
  });
});

describe("who may run a lobby (mayControl)", () => {
  test("a player who is not the game host cannot change the settings, start or cancel", async () => {
    const t = newBackend();
    const { roomId, gameId, guests } = await openLobby(t, { guests: ["Ann"] });
    const ann = { gameId, participantId: guests[0] };
    await expect(t.mutation(api.wordRush.updateSettings, { ...ann, sayIt: false })).rejects.toThrow(
      /Only the host can change settings/
    );
    await expect(t.mutation(api.wordRush.start, ann)).rejects.toThrow(/Only the host can start/);
    await expect(t.mutation(api.wordRush.cancel, ann)).rejects.toThrow(/Only the host can end/);
    expect(await stateOf(t, roomId)).toMatchObject({ status: "lobby", sayIt: true });
  });

  test("the room host can change the settings of a guest's lobby and start it, and the guest stays game host", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ann });
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, sayIt: false });
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({ status: "active", sayIt: false, hostParticipantId: ann });
    // Running a guest's lobby does not deal the room host in
    expect(state.players.map((p) => p.participantId)).toEqual([ann]);
  });

  test("the host of another room has no say here", async () => {
    const t = newBackend();
    const { roomId, gameId } = await openLobby(t);
    const other = await createRoom(t);
    const stranger = { gameId, participantId: other.hostId };
    await expect(t.mutation(api.wordRush.start, stranger)).rejects.toThrow(/Only the host can start/);
    await expect(t.mutation(api.wordRush.cancel, stranger)).rejects.toThrow(/Only the host can end/);
    expect((await stateOf(t, roomId)).status).toBe("lobby");
  });
});

describe("updateSettings", () => {
  test("a new pack deals that pack's built-in cards at once and marks the cards not ready until they are generated", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    expect((await stateOf(t, roomId)).cardsReady).toBe(true);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "foodie" });
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "foodie", cardsReady: false, totalCards: 10 });
    const dealt = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    const foodie = FALLBACK_DECK.filter((c) => c.packs.includes("foodie")).map((c) => c.en);
    expect(dealt).toEqual(expect.arrayContaining(foodie));
  });

  test("switching Say it, or naming the pack already chosen, starts no generation", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, sayIt: false, pack: "mix" });
    expect(await stateOf(t, roomId)).toMatchObject({ sayIt: false, cardsReady: true });
    await tick(t, 1500);
    expect((await gameDoc(t, gameId)).genCount).toBe(1);
  });

  test("an unknown pack is refused and the rest of the request is not applied", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    await expect(
      t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, sayIt: false, pack: "pirates" })
    ).rejects.toThrow(/Unknown pack/);
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "mix", sayIt: true, cardsReady: true });
  });
});

// ─── Card generation ─────────────────────────────────────────────────────────

describe("card generation without a model key", () => {
  test("the scheduled job makes the built-in deck ready, and no model is called", async () => {
    const t = newBackend();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    expect((await stateOf(t, roomId)).cardsReady).toBe(false);
    await tick(t);
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    const words = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    expect(new Set(words).size).toBe(10);
    expect(words.every((w) => DECK_WORDS.has(w))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("every card has three emoji and four choices in each language, the right one among them once", async () => {
    const t = newBackend();
    const { gameId } = await openLobby(t);
    const { cards } = await gameDoc(t, gameId);
    expect(cards).toHaveLength(10);
    for (const card of cards) {
      expect(card.emoji).toHaveLength(3);
      expect(card.choicesEn).toHaveLength(4);
      expect(card.choicesEn.filter((c) => c === card.en)).toHaveLength(1);
      expect(card.choicesJa).toHaveLength(4);
      expect(card.choicesJa.filter((c) => c.ja === card.ja.ja)).toHaveLength(1);
    }
  });

  test("a room's next lobby is dealt ten built-in words its last game did not use", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    const used = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    const next = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    const words = (await gameDoc(t, next)).cards.map((c) => c.en);
    expect(new Set(words).size).toBe(10);
    expect(words.filter((w) => used.includes(w))).toEqual([]);
  });

  // The built-in deck holds 24 cards: a lobby is dealt ten of them whatever the room was dealt before
  test("every lobby gets a full built-in deck, however many the room has had", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const dealt: number[] = [];
    for (let lobby = 0; lobby < 4; lobby++) {
      const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
      await tick(t);
      dealt.push((await stateOf(t, roomId)).totalCards);
      await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    }
    expect(dealt).toEqual([10, 10, 10, 10]);
  });

  test("a room that has played through the built-in deck is still dealt ten different cards, the unplayed ones among them", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const played: string[][] = [];
    for (let game = 0; game < 5; game++) {
      const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
      await tick(t);
      const words = (await gameDoc(t, gameId)).cards.map((c) => c.en);
      expect(new Set(words).size, `game ${game + 1}`).toBe(10);
      expect(words.every((w) => DECK_WORDS.has(w)), `game ${game + 1}`).toBe(true);
      expect((await stateOf(t, roomId)).cardsReady).toBe(true);
      played.push(words);
      // Started, so its words count as played, then ended to make room for the next lobby
      await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
      await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    }
    // Two games use 20 of the 24 cards without a repeat. The third takes the four that are left and
    // fills up with six the room has seen
    expect(played[1].filter((w) => played[0].includes(w))).toEqual([]);
    const unplayed = [...DECK_WORDS].filter((w) => !played[0].includes(w) && !played[1].includes(w));
    expect(unplayed).toHaveLength(4);
    expect(unplayed.filter((w) => !played[2].includes(w))).toEqual([]);
  });

  test("a lobby that was cancelled before it started does not hold its words back from the next one", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    // A mix lobby is dealt every built-in word of the mix pack first, unless the room has played them
    const mix = FALLBACK_DECK.filter((c) => c.packs.includes("mix")).map((c) => c.en);
    expect(mix.length).toBeGreaterThan(0);
    const abandoned = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    const shown = (await gameDoc(t, abandoned)).cards.map((c) => c.en);
    expect(mix.filter((w) => !shown.includes(w))).toEqual([]);
    await t.mutation(api.wordRush.cancel, { gameId: abandoned, participantId: hostId });

    const next = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    const words = (await gameDoc(t, next)).cards.map((c) => c.en);
    expect(mix.filter((w) => !words.includes(w))).toEqual([]);
  });

  test("cards that arrive empty leave the lobby its built-in deck, ready to start", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    const builtIn = (await gameDoc(t, gameId)).cards;
    // As while a generation is running
    await t.run(async (ctx) => await ctx.db.patch(gameId, { cardsReady: false }));
    await t.mutation(internal.wordRush.setCards, { gameId, pack: "mix", cards: [], seq: 0 });
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    expect((await gameDoc(t, gameId)).cards).toEqual(builtIn);
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    expect((await stateOf(t, roomId)).status).toBe("active");
  });
});

describe("card generation with a model key", () => {
  test("the model's cards replace the built-in deck", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, gameId } = await openLobby(t);
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    const cards = (await gameDoc(t, gameId)).cards;
    expect(cards.map((c) => c.en)).toEqual(modelCards(10).map((c) => c.en));
    expect(cards[0].choicesEn.slice().sort()).toEqual(["miss0a", "miss0b", "miss0c", "word0"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
    expect((init?.headers as Record<string, string>)["x-api-key"]).toBe("test-key");
  });

  test("a reply with too few usable cards is topped up from the built-in deck", async () => {
    const t = newBackend();
    quiet();
    const broken = [
      { ...modelCard(20), emoji: ["🍎", "🍊"] },
      { ...modelCard(21), wrongEn: ["only", "two"] },
      { ...modelCard(22), ja: { ja: "語", kana: "", romaji: "go" } },
      { ...modelCard(23), en: "word1" },
      { ...modelCard(24), wrongJa: modelCard(24).wrongJa.slice(0, 2) },
      // The right answer among the wrong ones: taken out, that leaves two
      { ...modelCard(25), wrongEn: ["word25", "miss25a", "miss25b"] },
    ];
    stubModel(() => modelReply([...modelCards(4), ...broken]));
    const { gameId } = await openLobby(t);
    const words = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    expect(words.slice(0, 4)).toEqual(["word0", "word1", "word2", "word3"]);
    expect(words).toHaveLength(10);
    expect(words.slice(4).every((w) => DECK_WORDS.has(w))).toBe(true);
  });

  test("the top-up never repeats a word the model gave", async () => {
    const t = newBackend();
    quiet();
    // Nine usable cards, among them every built-in word of the mix pack, which a top-up would deal first
    const mix = FALLBACK_DECK.filter((c) => c.packs.includes("mix")).map((c) => c.en);
    const cards = [...modelCards(9 - mix.length), ...mix.map((en, i) => ({ ...modelCard(50 + i), en }))];
    expect(mix.length).toBeGreaterThan(0);
    expect(cards).toHaveLength(9);
    stubModel(() => modelReply(cards));
    const { gameId } = await openLobby(t);
    const words = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    expect(words).toHaveLength(10);
    expect(new Set(words).size).toBe(10);
  });

  test("a reply wrapped in prose, with the emoji as one string and an unknown scene, is still used", async () => {
    const t = newBackend();
    const cards = modelCards(12).map((c) => ({ ...c, emoji: "🍎🍊🍋", scene: "lava" }));
    stubModel(
      () =>
        new Response(
          JSON.stringify({ content: [{ type: "text", text: `Here you go:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`` }] })
        )
    );
    const { gameId } = await openLobby(t);
    const dealt = (await gameDoc(t, gameId)).cards;
    expect(dealt.map((c) => c.en)).toEqual(modelCards(10).map((c) => c.en));
    expect(dealt[0]).toMatchObject({ emoji: ["🍎", "🍊", "🍋"], scene: "sparkles" });
  });

  test("a failed model call leaves the lobby ready with the built-in deck", async () => {
    const t = newBackend();
    quiet();
    const fetchMock = stubModel(() => new Response("overloaded", { status: 529 }));
    const { roomId, gameId } = await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    expect((await gameDoc(t, gameId)).cards.every((c) => DECK_WORDS.has(c.en))).toBe(true);
  });

  test("words the room's last two games were dealt are not dealt again, and the model is told which", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId, gameId } = await startGame(t);
    /** Ends the room's game and opens its next lobby. Returns that lobby and the words it was dealt */
    async function nextLobby(running: GameId) {
      await t.mutation(api.wordRush.cancel, { gameId: running, participantId: hostId });
      const next = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
      await tick(t);
      return { gameId: next, words: (await gameDoc(t, next)).cards.map((c) => c.en) };
    }
    const first = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    expect(first).toEqual(modelCards(10).map((c) => c.en));

    // The model answers with the same twelve words every time: only the two new ones are taken
    const second = await nextLobby(gameId);
    expect(second.words).toHaveLength(10);
    expect(second.words.slice(0, 2)).toEqual(["word10", "word11"]);
    expect(second.words.filter((w) => first.includes(w))).toEqual([]);
    const [firstPrompt, secondPrompt] = fetchMock.mock.calls.map(promptOf);
    for (const word of first) {
      expect(firstPrompt).not.toContain(word);
      expect(secondPrompt).toContain(word);
    }

    await t.mutation(api.wordRush.start, { gameId: second.gameId, participantId: hostId });
    const third = await nextLobby(second.gameId);
    expect(third.words).toHaveLength(10);
    expect(third.words.filter((w) => first.includes(w) || second.words.includes(w))).toEqual([]);
  });

  test("the words of a lobby that was cancelled before it started are not kept from the model", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId, gameId } = await openLobby(t);
    const abandoned = (await gameDoc(t, gameId)).cards.map((c) => c.en);
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    const next = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    // Nobody saw those cards, so the model may give them again, and does
    expect(promptOf(fetchMock.mock.calls[1])).not.toMatch(/Do NOT reuse/);
    expect((await gameDoc(t, next)).cards.map((c) => c.en)).toEqual(abandoned);
  });

  test("only the chat pack sends the room's recent lines to the model, each cut to 200 characters", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    await t.mutation(api.messages.sendTextMessage, { roomId, senderId: ann, text: `sushi ${"x".repeat(500)}` });
    await tick(t);
    const fetchMock = stubModel();
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "chat" });
    await tick(t, 1500);
    const [mix, chat] = fetchMock.mock.calls.map(promptOf);
    expect(mix).not.toContain("sushi");
    expect(chat).toContain(`sushi ${"x".repeat(194)}`);
    expect(chat).not.toContain("x".repeat(195));
    // What a guest typed is handed over as material, never as an instruction. If this wording changes,
    // keep a sentence that says so next to the lines
    expect(chat).toMatch(/not instructions/i);
  });

  test("the chat pack sends the 40 latest chat lines, oldest first, and nothing that is not a chat line", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    await t.run(async (ctx) => {
      const row = { roomId, status: "processed" as const };
      for (let i = 1; i <= 45; i++) {
        await ctx.db.insert("messages", { ...row, senderId: ann, kind: "text", text: `line ${i}.`, createdAt: Date.now() + i });
      }
      await ctx.db.insert("messages", {
        ...row,
        senderId: hostId,
        kind: "system",
        text: "game:Emoji Match",
        createdAt: Date.now() + 46,
      });
    });
    const fetchMock = stubModel();
    await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, pack: "chat" });
    await tick(t);
    const prompt = promptOf(fetchMock.mock.calls[0]);
    const sent = [...prompt.matchAll(/line (\d+)\./g)].map((match) => Number(match[1]));
    expect(sent).toEqual(Array.from({ length: 40 }, (_, i) => i + 6));
    expect(prompt).not.toContain("game:Emoji Match");
  });

  test("WORD_RUSH_MODEL names the model that is asked", async () => {
    const t = newBackend();
    vi.stubEnv("WORD_RUSH_MODEL", "a-model-for-this-test");
    const fetchMock = stubModel();
    await openLobby(t);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).model).toBe("a-model-for-this-test");
  });
});

describe("generation debounce and sequence", () => {
  test("the first deck is generated at once, a changed pack 1.5 s after the tap", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId, gameId } = await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await tick(t, 1499);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((await stateOf(t, roomId)).cardsReady).toBe(false);
    await tick(t, 1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await stateOf(t, roomId)).cardsReady).toBe(true);
  });

  test("taps less than 1.5 s apart cost one model call, for the last pack tapped", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await tick(t, 1000);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "slang" });
    await tick(t, 500);
    // The anime generation came due, found a newer tap and stood down
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((await stateOf(t, roomId)).cardsReady).toBe(false);
    await tick(t, 1000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const theme = promptOf(fetchMock.mock.calls[1]).match(/^Theme: (.*)$/m)?.[1];
    expect(theme).toMatch(/slang/);
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "slang", cardsReady: true });
    // The superseded generation is not counted against the game's allowance
    expect((await gameDoc(t, gameId)).genCount).toBe(2);
  });

  test("cards from a generation that was running when the pack changed are dropped, even when the pack changed back", async () => {
    const t = newBackend();
    const model = stubSlowModel();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    vi.advanceTimersByTime(0);
    await model.asked;
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "mix" });
    model.answer(modelCards(12));
    await t.finishInProgressScheduledFunctions();
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "mix", cardsReady: false });
    expect((await gameDoc(t, gameId)).cards.every((c) => DECK_WORDS.has(c.en))).toBe(true);
  });

  test("a game started while its cards are being generated plays the built-in deck", async () => {
    const t = newBackend();
    const model = stubSlowModel();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    vi.advanceTimersByTime(0);
    await model.asked;
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    model.answer(modelCards(12));
    await t.finishInProgressScheduledFunctions();
    expect(await stateOf(t, roomId)).toMatchObject({ status: "active", totalCards: 10 });
    expect((await gameDoc(t, gameId)).cards.every((c) => DECK_WORDS.has(c.en))).toBe(true);
  });

  test("a generation queued for a lobby that was cancelled first makes no model call", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    await tick(t);
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await gameDoc(t, gameId)).genCount).toBe(0);
  });

  test("a lobby row and a queued job left by the build before sequence numbers still get the lobby its cards", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, gameId } = await openLobby(t);
    // As that build left them: a row with neither counter, and a queued job with no seq argument
    await t.run(async (ctx) => {
      const { _id, _creationTime, genSeq, genCount, ...row } = (await ctx.db.get(gameId))!;
      await ctx.db.replace(gameId, { ...row, cardsReady: false, cards: row.cards.slice(0, 3) });
      await ctx.scheduler.runAfter(0, internal.wordRush.generateCards, { gameId });
    });
    await tick(t);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    expect((await gameDoc(t, gameId)).genCount).toBe(1);
  });

  test("a job with no sequence number counts as the first, so a later pack change supersedes it", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await t.run(async (ctx) => {
      await ctx.scheduler.runAfter(0, internal.wordRush.generateCards, { gameId });
    });
    await tick(t);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((await stateOf(t, roomId)).cardsReady).toBe(false);
    // Nor can cards from such a job, already past its claim, land on the newer pack choice
    await t.mutation(internal.wordRush.setCards, {
      gameId,
      pack: "anime",
      cards: (await gameDoc(t, gameId)).cards.slice(0, 2),
    });
    expect(await stateOf(t, roomId)).toMatchObject({ cardsReady: false, totalCards: 10 });
  });
});

describe("generation limits", () => {
  /** Opens a lobby and changes its pack nine times, 1.5 s apart: ten generations, the most one game may have */
  async function tenGenerations(t: Backend, roomId: RoomId, hostId: PlayerId) {
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    for (let i = 0; i < 9; i++) {
      await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: PACKS[i % PACKS.length] });
      await tick(t, 1500);
    }
    return gameId;
  }

  /** What the limits have counted, by key: `wordrush:<roomId>` for a room, `wordrush:all` for the shared ceiling */
  async function counted(t: Backend): Promise<Record<string, number>> {
    const rows = await t.run(async (ctx) => await ctx.db.query("rateLimits").collect());
    return Object.fromEntries(rows.map((row) => [row.key, row.count]));
  }

  test("a game pays for ten generations; after that a pack change keeps the built-in deck and the lobby is still made ready", async () => {
    const t = newBackend();
    quiet();
    const fetchMock = stubModel();
    const { roomId, hostId } = await createRoom(t);
    const gameId = await tenGenerations(t, roomId, hostId);
    expect(fetchMock).toHaveBeenCalledTimes(10);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await tick(t, 1500);
    expect(fetchMock).toHaveBeenCalledTimes(10);
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "anime", cardsReady: true, totalCards: 10 });
    expect((await gameDoc(t, gameId)).cards.every((c) => DECK_WORDS.has(c.en))).toBe(true);
  });

  test("a room gets 30 generations an hour across its games; other rooms and the next hour are not affected", async () => {
    const t = newBackend();
    quiet();
    const fetchMock = stubModel();
    const { roomId, hostId } = await createRoom(t);
    // The room's hour starts with its first generation
    const hourEnds = Date.now() + 60 * 60_000;
    for (let lobby = 0; lobby < 3; lobby++) {
      const gameId = await tenGenerations(t, roomId, hostId);
      // An eleventh, refused for the game's own count, is not counted against the room
      await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "mix" });
      await tick(t, 1500);
      await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    }
    expect(fetchMock).toHaveBeenCalledTimes(30);

    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    expect(fetchMock).toHaveBeenCalledTimes(30);
    expect((await stateOf(t, roomId)).cardsReady).toBe(true);

    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(31);

    // A generation that comes due in the last millisecond of the hour is still refused
    await tick(t, hourEnds - 1 - 1500 - Date.now());
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await tick(t, 1500);
    expect(Date.now()).toBe(hourEnds - 1);
    expect(fetchMock).toHaveBeenCalledTimes(31);

    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "slang" });
    await tick(t, 1500);
    expect(fetchMock).toHaveBeenCalledTimes(32);
  });

  test("WORD_RUSH_GENERATIONS_PER_HOUR_MAX caps generations across all rooms, for an hour", async () => {
    const t = newBackend();
    quiet();
    vi.stubEnv("WORD_RUSH_GENERATIONS_PER_HOUR_MAX", "2");
    const fetchMock = stubModel();
    await openLobby(t);
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const third = await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await stateOf(t, third.roomId)).toMatchObject({ cardsReady: true, totalCards: 10 });
    expect((await gameDoc(t, third.gameId)).cards.every((c) => DECK_WORDS.has(c.en))).toBe(true);

    // 59 minutes on a room that has had nothing is still refused; once the hour is over the next one is served
    await tick(t, 59 * 60_000);
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await tick(t, 61_000);
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  // A room's 30 an hour count the generations it was given, not the ones the shared ceiling refused it
  test("a generation refused by the shared ceiling does not use up the room's own allowance", async () => {
    const t = newBackend();
    quiet();
    vi.stubEnv("WORD_RUSH_GENERATIONS_PER_HOUR_MAX", "1");
    const fetchMock = stubModel();
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // 59 minutes into the ceiling's hour another room asks 30 times, and is refused each time
    await tick(t, 59 * 60_000);
    const { hostId, gameId } = await openLobby(t);
    for (let i = 0; i < 29; i++) {
      await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: PACKS[i % PACKS.length] });
      await tick(t, 1500);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The ceiling's hour is over, and this room has had no generation at all
    await tick(t, 60_000);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "mix" });
    await tick(t, 1500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("a refusal by the shared ceiling leaves a room's count where it was, and the ceiling's too", async () => {
    const t = newBackend();
    quiet();
    vi.stubEnv("WORD_RUSH_GENERATIONS_PER_HOUR_MAX", "3");
    const fetchMock = stubModel();
    // Two generations for this room, then one for another: the ceiling is reached
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack: "anime" });
    await tick(t, 1500);
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const pack of ["slang", "travel", "foodie"]) {
      await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack });
      await tick(t, 1500);
    }
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(await counted(t)).toMatchObject({ [`wordrush:${roomId}`]: 2, "wordrush:all": 3 });
    // Nor are the refused generations counted against the game's own ten
    expect((await gameDoc(t, gameId)).genCount).toBe(2);
    expect(await stateOf(t, roomId)).toMatchObject({ pack: "foodie", cardsReady: true, totalCards: 10 });
  });

  test("a room over its own 30 an hour does not use up the ceiling every room shares", async () => {
    const t = newBackend();
    quiet();
    vi.stubEnv("WORD_RUSH_GENERATIONS_PER_HOUR_MAX", "31");
    const fetchMock = stubModel();
    const { roomId, hostId } = await createRoom(t);
    for (let lobby = 0; lobby < 3; lobby++) {
      const gameId = await tenGenerations(t, roomId, hostId);
      await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    }
    expect(fetchMock).toHaveBeenCalledTimes(30);
    // Refused on the room's own count, three times over: the shared count stays at 30
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId });
    await tick(t);
    for (const pack of ["anime", "slang"]) {
      await t.mutation(api.wordRush.updateSettings, { gameId, participantId: hostId, pack });
      await tick(t, 1500);
    }
    expect(fetchMock).toHaveBeenCalledTimes(30);
    expect(await counted(t)).toMatchObject({ [`wordrush:${roomId}`]: 30, "wordrush:all": 30 });
    // So another room still gets the one generation left under the ceiling, and the room after it none
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(31);
    await openLobby(t);
    expect(fetchMock).toHaveBeenCalledTimes(31);
  });

  test("without that ceiling, rooms share no counter", async () => {
    const t = newBackend();
    const fetchMock = stubModel();
    const rooms = [await openLobby(t), await openLobby(t), await openLobby(t)];
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // A row every room writes would make unrelated rooms' generations conflict: each counter names one room
    const keys = await t.run(async (ctx) => (await ctx.db.query("rateLimits").collect()).map((r) => r.key));
    expect(keys).toHaveLength(3);
    for (const { roomId } of rooms) expect(keys.filter((key) => key.includes(roomId))).toHaveLength(1);
  });
});

// ─── Play ────────────────────────────────────────────────────────────────────

describe("start", () => {
  test("starting shows the first card for 15 s and announces the game in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t, { guests: ["Ann"] });
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({ status: "active", phase: "clues", cardIndex: 0, phaseStartedAt: Date.now() });
    expect(state.phaseEndsAt - state.phaseStartedAt).toBe(15_000);
    expect(state.card?.emoji).toHaveLength(3);
    // The clients show the second and third emoji this long apart, in step with the 300, 200 and 100 points
    expect(state.emojiStepMs).toBe(2500);
    expect(await systemTexts(t, roomId)).toContain("game:Word Rush");
  });

  test("a lobby with no cards cannot be started", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.run(async (ctx) => await ctx.db.patch(gameId, { cards: [] }));
    await expect(t.mutation(api.wordRush.start, { gameId, participantId: hostId })).rejects.toThrow(/No cards/);
    expect((await stateOf(t, roomId)).status).toBe("lobby");
  });

  test("a second start is refused", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    await expect(t.mutation(api.wordRush.start, { gameId, participantId: hostId })).rejects.toThrow(/already started/);
    expect((await systemTexts(t, roomId)).filter((text) => text === "game:Word Rush")).toHaveLength(1);
  });
});

describe("clues and answers", () => {
  test("until the reveal the players see the choices but not the answer, nor what anyone picked", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await answer(t, gameId, hostId);
    const state = await stateOf(t, roomId);
    expect(state).not.toHaveProperty("cards");
    expect(Object.keys(state.card ?? {}).sort()).toEqual(["choicesEn", "choicesJa", "emoji", "reveal"]);
    expect(state.card?.reveal).toBeNull();
    expect(state.answers).toEqual([
      { participantId: hostId, elapsedMs: 0, choiceIndex: null, correct: null, points: null },
    ]);
  });

  test("the reveal shows the word with its notes, where it sits among the choices, and every answer", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    const game = await gameDoc(t, gameId);
    const card = game.cards[0];
    await answer(t, gameId, hostId);
    await answer(t, gameId, guests[0], "wrong");
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("reveal");
    const { en, ja, ipa, posEn, posJa, hookEn, hookJa, exampleEn, exampleJa, scene } = card;
    expect(state.card?.reveal).toMatchObject({ en, ja, ipa, posEn, posJa, hookEn, hookJa, exampleEn, exampleJa, scene });
    expect(state.card).toMatchObject({ emoji: card.emoji, choicesEn: card.choicesEn, choicesJa: card.choicesJa });
    expect(state.answers.map((a) => [a.participantId, a.choiceIndex, a.correct, a.points])).toEqual([
      [hostId, rightIndex(game, hostId), true, 300],
      [guests[0], (rightIndex(game, guests[0]) + 1) % 4, false, 0],
    ]);
  });

  test("each card's reveal says where the right word sits among the choices, in both languages", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { sayIt: false });
    const { cards } = await gameDoc(t, gameId);
    expect(cards).toHaveLength(10);
    // Every card, because the choices are shuffled: on one card a wrong index can be right by chance
    for (const [cardIndex, card] of cards.entries()) {
      await skipTo(t, gameId, hostId, "reveal", cardIndex);
      const shown = (await stateOf(t, roomId)).card!;
      expect(shown.choicesEn[shown.reveal!.correctEnIndex]).toBe(card.en);
      expect(shown.choicesJa[shown.reveal!.correctJaIndex]).toEqual(card.ja);
    }
  });

  test("a right answer is worth 300 in the first 2.5 s, 200 in the next 2.5 s and 100 after", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben", "Cat"] });
    expect(await answer(t, gameId, hostId)).toEqual({ correct: true, points: 300 });
    await tick(t, 2500);
    expect(await answer(t, gameId, guests[0])).toEqual({ correct: true, points: 200 });
    await tick(t, 2500);
    expect(await answer(t, gameId, guests[1])).toEqual({ correct: true, points: 100 });
    expect((await stateOf(t, roomId)).players.map((p) => p.score)).toEqual([300, 200, 100, 0]);
  });

  test("a wrong answer scores nothing and ends the streak", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    await answer(t, gameId, hostId);
    await skipTo(t, gameId, hostId, "clues", 1);
    expect(await answer(t, gameId, hostId, "wrong")).toEqual({ correct: false, points: 0 });
    expect((await stateOf(t, roomId)).players[0]).toMatchObject({ score: 300, streak: 0, bestStreak: 1, correct: 1 });
  });

  test("a streak of three multiplies the points by 1.5 and a streak of five by 2", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    const points: number[] = [];
    for (let card = 0; card < 5; card++) {
      await skipTo(t, gameId, hostId, "clues", card);
      points.push((await answer(t, gameId, hostId)).points);
    }
    expect(points).toEqual([300, 300, 450, 450, 600]);
    expect((await stateOf(t, roomId)).players[0]).toMatchObject({ score: 2100, streak: 5, bestStreak: 5, correct: 5 });
  });

  test("a hint shows the first letter in the player's direction and costs 100 points, down to 50 at the least", async () => {
    const t = newBackend();
    const { hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
    const card = (await gameDoc(t, gameId)).cards[0];
    const mask = (s: string) =>
      s
        .split(" ")
        .map((w) => w[0] + "·".repeat(w.length - 1))
        .join(" ");
    expect(await t.mutation(api.wordRush.takeHint, { gameId, participantId: hostId })).toBe(mask(card.en));
    expect(await answer(t, gameId, hostId)).toEqual({ correct: true, points: 200 });
    await tick(t, 6000);
    const hint = await t.mutation(api.wordRush.takeHint, { gameId, participantId: guests[0] });
    expect(hint).toBe(`${card.ja.kana[0]}… (${mask(card.ja.romaji)})`);
    // Asking again shows it again and costs nothing more
    expect(await t.mutation(api.wordRush.takeHint, { gameId, participantId: guests[0] })).toBe(hint);
    expect(await answer(t, gameId, guests[0])).toEqual({ correct: true, points: 50 });
  });

  test("a hint costs points on the card it was taken on, and on no later card", async () => {
    const t = newBackend();
    const { hostId, gameId } = await startGame(t);
    await t.mutation(api.wordRush.takeHint, { gameId, participantId: hostId });
    expect(await answer(t, gameId, hostId)).toEqual({ correct: true, points: 200 });
    await skipTo(t, gameId, hostId, "clues", 1);
    expect(await answer(t, gameId, hostId)).toEqual({ correct: true, points: 300 });
  });

  test("a player answers a card once, and only players answer or take hints", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    const watcher = await joinGuest(t, roomId, "Watcher");
    await answer(t, gameId, hostId);
    await expect(answer(t, gameId, hostId)).rejects.toThrow(/Already answered/);
    await expect(
      t.mutation(api.wordRush.answer, { gameId, participantId: watcher, choiceIndex: 0 })
    ).rejects.toThrow(/not in this game/);
    await expect(t.mutation(api.wordRush.takeHint, { gameId, participantId: watcher })).rejects.toThrow(
      /not in this game/
    );
    expect((await stateOf(t, roomId)).answers).toHaveLength(1);
  });

  test("the reveal starts as soon as every player has answered", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    await answer(t, gameId, hostId);
    expect((await stateOf(t, roomId)).phase).toBe("clues");
    await tick(t, 3000);
    await answer(t, gameId, guests[0]);
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("reveal");
    expect(state.phaseEndsAt - Date.now()).toBe(8000);
  });

  test("clues close after 15 s, and a player who did not answer loses their streak", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    await answer(t, gameId, hostId);
    await answer(t, gameId, guests[0]);
    await skipTo(t, gameId, hostId, "clues", 1);
    await answer(t, gameId, hostId);
    await tick(t, 14_999);
    expect((await stateOf(t, roomId)).phase).toBe("clues");
    await tick(t, 1);
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("reveal");
    expect(state.players.map((p) => p.streak)).toEqual([2, 0]);
  });

  test("answers and hints are refused once the reveal has started, and in a game that is not running", async () => {
    const t = newBackend();
    const { hostId, gameId } = await openLobby(t, { guests: ["Ann"] });
    const host = { gameId, participantId: hostId };
    await expect(t.mutation(api.wordRush.answer, { ...host, choiceIndex: 0 })).rejects.toThrow(/not active/);
    await t.mutation(api.wordRush.start, host);
    await skipTo(t, gameId, hostId, "reveal");
    await expect(t.mutation(api.wordRush.answer, { ...host, choiceIndex: 0 })).rejects.toThrow(/Too late/);
    await expect(t.mutation(api.wordRush.takeHint, host)).rejects.toThrow(/No hints/);
  });

  test("the reveal lasts 8 s, then the next card's clues begin", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    await answer(t, gameId, hostId);
    await tick(t, 7999);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "reveal", cardIndex: 0 });
    await tick(t, 1);
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({ phase: "clues", cardIndex: 1, answers: [] });
    expect(state.card?.reveal).toBeNull();
    // The clock for the points starts again with each card
    expect(await answer(t, gameId, hostId)).toEqual({ correct: true, points: 300 });
  });

  test("the timer of a phase that ended early does nothing when it comes due", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t);
    await answer(t, gameId, hostId);
    await tick(t, 8000);
    const before = await stateOf(t, roomId);
    expect(before).toMatchObject({ phase: "clues", cardIndex: 1 });
    // 15 s after the start: the first card's clue timer, set before the answer cut that phase short
    await tick(t, 7000);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 1, phaseSeq: before.phaseSeq });
  });
});

describe("skip", () => {
  test("a skip moves the game on one phase, and a repeat carrying the old sequence number is ignored", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    const { phaseSeq } = await stateOf(t, roomId);
    await t.mutation(api.wordRush.skip, { gameId, participantId: hostId, phaseSeq });
    await t.mutation(api.wordRush.skip, { gameId, participantId: hostId, phaseSeq });
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "reveal", cardIndex: 0, phaseSeq: phaseSeq + 1 });
  });

  test("only the game host or the room host can skip", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    const ben = await joinGuest(t, roomId, "Ben");
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ann });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: ben });
    await t.mutation(api.wordRush.start, { gameId, participantId: ann });
    const { phaseSeq } = await stateOf(t, roomId);
    await expect(t.mutation(api.wordRush.skip, { gameId, participantId: ben, phaseSeq })).rejects.toThrow(
      /Only the host can skip/
    );
    expect((await stateOf(t, roomId)).phase).toBe("clues");
    // The room host is not a player in this game
    await t.mutation(api.wordRush.skip, { gameId, participantId: hostId, phaseSeq });
    expect((await stateOf(t, roomId)).phase).toBe("reveal");
  });
});

// ─── Say it! ─────────────────────────────────────────────────────────────────

describe("the mic", () => {
  test("after every second card the player who has performed least takes the mic, earliest joiner first", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
    const performers: PlayerId[] = [];
    for (const cardIndex of [1, 3, 5, 7]) {
      await skipTo(t, gameId, hostId, "reveal", cardIndex);
      await skip(t, gameId, hostId);
      const state = await stateOf(t, roomId);
      expect(state).toMatchObject({ phase: "mic", cardIndex });
      performers.push(state.performer!.participantId);
    }
    expect(performers).toEqual([hostId, guests[0], guests[1], hostId]);
  });

  test("the performer is shown the card's word in the language they are learning", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await skipTo(t, gameId, hostId, "mic");
    const first = await gameDoc(t, gameId);
    expect((await stateOf(t, roomId)).performer).toEqual({
      participantId: hostId,
      lang: "en",
      word: first.cards[1].en,
      kana: "",
      romaji: "",
      clipUrl: null,
    });
    await skip(t, gameId, hostId);
    const second = await skipTo(t, gameId, hostId, "mic");
    const { ja, kana, romaji } = second.cards[3].ja;
    expect((await stateOf(t, roomId)).performer).toMatchObject({ lang: "ja", word: ja, kana, romaji });
  });

  test("there is no mic round with Say it off, nor for a player on their own", async () => {
    const t = newBackend();
    for (const options of [{ guests: ["Ann"], sayIt: false }, { guests: [], sayIt: true }]) {
      const { roomId, hostId, gameId } = await startGame(t, options);
      await skipTo(t, gameId, hostId, "reveal", 1);
      await skip(t, gameId, hostId);
      expect(await stateOf(t, roomId), JSON.stringify(options)).toMatchObject({
        phase: "clues",
        cardIndex: 2,
        performer: null,
      });
    }
  });

  test("the performer's clip opens 10 s of judging and is served to the players", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await skipTo(t, gameId, hostId, "mic");
    const clip = await upload(t);
    await t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: clip });
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("judging");
    expect(state.phaseEndsAt - Date.now()).toBe(10_000);
    expect(state.performer?.clipUrl).toEqual(expect.any(String));
  });

  test("only the performer can submit a clip, and only on the mic; a refused clip is not deleted", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    const clip = await upload(t);
    await expect(
      t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: clip })
    ).rejects.toThrow(/not your turn/);
    await skipTo(t, gameId, hostId, "mic");
    await expect(
      t.mutation(api.wordRush.submitClip, { gameId, participantId: guests[0], storageId: clip })
    ).rejects.toThrow(/not your turn/);
    expect((await stateOf(t, roomId)).phase).toBe("mic");
    expect(await fileExists(t, clip)).toBe(true);

    // Once the clip is in and judging has begun, the performer cannot send another take
    await t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: clip });
    const judging = await stateOf(t, roomId);
    await expect(
      t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: await upload(t) })
    ).rejects.toThrow(/not your turn/);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "judging", phaseSeq: judging.phaseSeq });
  });

  test("a clip must be an audio file of at most 2 MB that still exists", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await skipTo(t, gameId, hostId, "mic");
    const submit = (storageId: FileId) =>
      t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId });
    await expect(submit(await upload(t, { type: "image/png" }))).rejects.toThrow(/Not a voice clip/);
    await expect(submit(await upload(t, { type: null }))).rejects.toThrow(/Not a voice clip/);
    await expect(submit(await upload(t, { bytes: 2 * 1024 * 1024 + 1 }))).rejects.toThrow(/Not a voice clip/);
    const gone = await upload(t);
    await t.run(async (ctx) => await ctx.storage.delete(gone));
    await expect(submit(gone)).rejects.toThrow(/Upload not found/);
    expect((await stateOf(t, roomId)).phase).toBe("mic");
    await submit(await upload(t, { type: "audio/wav", bytes: 2 * 1024 * 1024 }));
    expect((await stateOf(t, roomId)).phase).toBe("judging");
  });

  test("a voice message's file cannot be submitted as a clip, and outlives the game", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    const voice = await voiceMessageFile(t, roomId, guests[0]);
    await skipTo(t, gameId, hostId, "mic");
    await expect(
      t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: voice })
    ).rejects.toThrow(/already used/);
    await playToEnd(t, gameId, hostId);
    expect(await fileExists(t, voice)).toBe(true);
  });

  test("the performer, the game host or the room host can skip the mic; another player cannot", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    const ben = await joinGuest(t, roomId, "Ben");
    const cat = await joinGuest(t, roomId, "Cat");
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ann });
    for (const participantId of [ben, cat]) {
      await tick(t, 1);
      await t.mutation(api.wordRush.joinLobby, { gameId, participantId });
    }
    await t.mutation(api.wordRush.start, { gameId, participantId: ann });

    // Outside the mic phase a skip-mic from anyone is a late tap, and changes nothing
    const { phaseSeq } = await stateOf(t, roomId);
    await t.mutation(api.wordRush.skipMic, { gameId, participantId: cat });
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 0, phaseSeq });

    // Ann, the game host, is first on the mic; Ben is second, Cat third
    await skipTo(t, gameId, ann, "mic");
    await expect(t.mutation(api.wordRush.skipMic, { gameId, participantId: cat })).rejects.toThrow(
      /Only the performer or host can skip/
    );
    await t.mutation(api.wordRush.skipMic, { gameId, participantId: hostId });
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 2 });

    await skipTo(t, gameId, ann, "mic");
    await t.mutation(api.wordRush.skipMic, { gameId, participantId: ben });
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 4 });

    await skipTo(t, gameId, ann, "mic");
    await t.mutation(api.wordRush.skipMic, { gameId, participantId: ann });
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 6 });
  });

  test("a performer who sends nothing is passed over after 15 s", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await skipTo(t, gameId, hostId, "mic");
    await tick(t, 14_999);
    expect((await stateOf(t, roomId)).phase).toBe("mic");
    await tick(t, 1);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 2, performer: null });
  });
});

describe("judging", () => {
  /** A game in judging: the host (learning English) performed; Ann speaks English, Ken is learning it too */
  async function judging(t: Backend, guests = ["Ann", "Ken:ja"]) {
    const game = await startGame(t, { guests });
    await skipTo(t, game.gameId, game.hostId, "mic");
    const clip = await upload(t);
    await t.mutation(api.wordRush.submitClip, { gameId: game.gameId, participantId: game.hostId, storageId: clip });
    return { ...game, clip, ann: game.guests[0], ken: game.guests[1] };
  }

  test("the verdict comes when the last judge votes, and a native speaker's vote counts double", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ken } = await judging(t);
    await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "native" });
    expect((await stateOf(t, roomId)).phase).toBe("judging");
    await t.mutation(api.wordRush.vote, { gameId, participantId: ken, vote: "huh" });
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("verdict");
    // 20 x 2 from Ann and 0 x 1 from Ken, out of a possible 60
    expect(state.verdict).toEqual({
      bonus: 40,
      label: "close",
      votes: [
        { judgeId: ann, vote: "native", weight: 2 },
        { judgeId: ken, vote: "huh", weight: 1 },
      ],
    });
    expect(state.players.find((p) => p.participantId === hostId)).toMatchObject({ score: 40, sayItBonus: 40 });
  });

  test("the label is native from 70% of the possible points, close from 35% and huh below", async () => {
    const t = newBackend();
    /** The verdict on the host's English after these votes, one from each guest in the order they joined */
    async function verdictOf(guests: string[], votes: Array<"huh" | "close" | "native">) {
      const game = await judging(t, guests);
      for (const [i, vote] of votes.entries()) {
        await t.mutation(api.wordRush.vote, { gameId: game.gameId, participantId: game.guests[i], vote });
      }
      return (await stateOf(t, game.roomId)).verdict;
    }
    // Ann and Amy speak English, so each has a double vote: 100 possible points. 70 of them is native, 60 is not
    expect(await verdictOf(["Ann", "Amy", "Ken:ja"], ["native", "close", "close"])).toMatchObject({
      bonus: 70,
      label: "native",
    });
    expect(await verdictOf(["Ann", "Amy", "Ken:ja"], ["native", "close", "huh"])).toMatchObject({
      bonus: 60,
      label: "close",
    });
    // 30 of a possible 80 is 37.5%, close; 20 of a possible 60 is a third, huh
    expect(await verdictOf(["Ann", "Ken:ja", "Kai:ja"], ["huh", "native", "close"])).toMatchObject({
      bonus: 30,
      label: "close",
    });
    expect(await verdictOf(["Ann", "Ken:ja"], ["huh", "native"])).toMatchObject({ bonus: 20, label: "huh" });
  });

  test("each Say it round is judged on its own votes", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ken } = await judging(t);
    await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "native" });
    await t.mutation(api.wordRush.vote, { gameId, participantId: ken, vote: "native" });
    expect((await stateOf(t, roomId)).verdict).toMatchObject({ bonus: 60 });

    // The second round is Ann's, in Japanese: the host and Ken are the native speakers now
    await skipTo(t, gameId, hostId, "mic", 3);
    await t.mutation(api.wordRush.submitClip, { gameId, participantId: ann, storageId: await upload(t) });
    expect((await stateOf(t, roomId)).votedIds).toEqual([]);
    await t.mutation(api.wordRush.vote, { gameId, participantId: hostId, vote: "huh" });
    expect((await stateOf(t, roomId)).votedIds).toEqual([hostId]);
    await t.mutation(api.wordRush.vote, { gameId, participantId: ken, vote: "close" });
    const state = await stateOf(t, roomId);
    expect(state.verdict).toEqual({
      bonus: 20,
      label: "huh",
      votes: [
        { judgeId: hostId, vote: "huh", weight: 2 },
        { judgeId: ken, vote: "close", weight: 2 },
      ],
    });
    expect(state.players.map((p) => p.sayItBonus)).toEqual([60, 20, 0]);
  });

  test("while judging, players see who has voted and not how", async () => {
    const t = newBackend();
    const { roomId, gameId, ann } = await judging(t);
    await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "close" });
    const state = await stateOf(t, roomId);
    expect(state.votedIds).toEqual([ann]);
    expect(state.verdict).toBeNull();
  });

  test("judging closes after 10 s with the votes that are in, and the verdict shows for 7 s", async () => {
    const t = newBackend();
    const { roomId, gameId, ann } = await judging(t);
    await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "close" });
    await tick(t, 10_000);
    const state = await stateOf(t, roomId);
    expect(state.phase).toBe("verdict");
    expect(state.verdict).toMatchObject({ bonus: 20, label: "close", votes: [{ judgeId: ann }] });
    expect(state.votedIds).toEqual([]);
    await tick(t, 6999);
    expect((await stateOf(t, roomId)).phase).toBe("verdict");
    await tick(t, 1);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 2, verdict: null, performer: null });
  });

  test("a round nobody judged gives no bonus", async () => {
    const t = newBackend();
    const { roomId, hostId } = await judging(t);
    await tick(t, 10_000);
    const state = await stateOf(t, roomId);
    expect(state.verdict).toEqual({ bonus: 0, label: "huh", votes: [] });
    expect(state.players.find((p) => p.participantId === hostId)?.score).toBe(0);
  });

  test("the performer cannot vote, nobody votes twice, and only players vote, only while judging", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ken } = await judging(t);
    const watcher = await joinGuest(t, roomId, "Watcher");
    const vote = (participantId: PlayerId) => t.mutation(api.wordRush.vote, { gameId, participantId, vote: "native" });
    await expect(vote(hostId)).rejects.toThrow(/can't judge yourself/);
    await expect(vote(watcher)).rejects.toThrow(/not in this game/);
    await vote(ann);
    await expect(vote(ann)).rejects.toThrow(/Already voted/);
    await vote(ken);
    await expect(vote(ken)).rejects.toThrow(/Judging is closed/);
    expect((await stateOf(t, roomId)).verdict?.votes).toHaveLength(2);
  });
});

describe("teach clips", () => {
  /** As judging above, with a second English speaker, Amy, so two players could teach the host's word */
  async function judging(t: Backend) {
    const game = await startGame(t, { guests: ["Ann", "Ken:ja", "Amy"] });
    await skipTo(t, game.gameId, game.hostId, "mic");
    const clip = await upload(t);
    await t.mutation(api.wordRush.submitClip, { gameId: game.gameId, participantId: game.hostId, storageId: clip });
    const [ann, ken, amy] = game.guests;
    return { ...game, clip, ann, ken, amy };
  }

  test("a native speaker's teach clip is served to the players with the teacher's id", async () => {
    const t = newBackend();
    const { roomId, gameId, ann } = await judging(t);
    expect((await stateOf(t, roomId)).teachClip).toBeNull();
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: await upload(t) });
    expect((await stateOf(t, roomId)).teachClip).toEqual({ url: expect.any(String), byParticipantId: ann });
  });

  test("a native speaker can still teach once the verdict is in, and the clip is gone on the next card", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann } = await judging(t);
    await skipTo(t, gameId, hostId, "verdict");
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: await upload(t) });
    expect((await stateOf(t, roomId)).teachClip?.byParticipantId).toBe(ann);
    await skip(t, gameId, hostId);
    expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", teachClip: null });
  });

  test("the performer, a learner of the same language and a non-player cannot teach", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ken } = await judging(t);
    const watcher = await joinGuest(t, roomId, "Watcher");
    for (const participantId of [hostId, ken, watcher]) {
      const storageId = await upload(t);
      await expect(
        t.mutation(api.wordRush.submitTeachClip, { gameId, participantId, storageId })
      ).rejects.toThrow(/Only a native speaker can teach/);
      expect(await fileExists(t, storageId)).toBe(true);
    }
    expect((await stateOf(t, roomId)).teachClip).toBeNull();
  });

  test("nobody teaches before a clip has been performed", async () => {
    const t = newBackend();
    const { hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    const teach = async () =>
      t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: guests[0], storageId: await upload(t) });
    await expect(teach()).rejects.toThrow(/Only a native speaker can teach/);
    await skipTo(t, gameId, hostId, "mic");
    await expect(teach()).rejects.toThrow(/Only a native speaker can teach/);
  });

  test("a teach clip must be an audio file of at most 2 MB that still exists", async () => {
    const t = newBackend();
    const { roomId, gameId, ann } = await judging(t);
    const teach = (storageId: FileId) =>
      t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId });
    await expect(teach(await upload(t, { type: "video/mp4" }))).rejects.toThrow(/Not a voice clip/);
    await expect(teach(await upload(t, { type: null }))).rejects.toThrow(/Not a voice clip/);
    await expect(teach(await upload(t, { bytes: 2 * 1024 * 1024 + 1 }))).rejects.toThrow(/Not a voice clip/);
    const gone = await upload(t);
    await t.run(async (ctx) => await ctx.storage.delete(gone));
    await expect(teach(gone)).rejects.toThrow(/Upload not found/);
    expect((await stateOf(t, roomId)).teachClip).toBeNull();
  });

  test("a voice message's file cannot be used as a teach clip, even after someone has taught, and outlives the game", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, amy } = await judging(t);
    const voice = await voiceMessageFile(t, roomId, hostId);
    await expect(
      t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: voice })
    ).rejects.toThrow(/already used/);
    // With a teach clip in place, a later teacher's file is deleted: it must never be someone else's
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: await upload(t) });
    await expect(
      t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: amy, storageId: voice })
    ).rejects.toThrow(/already used/);
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    expect(await fileExists(t, voice)).toBe(true);
  });

  test("a clip already in the game cannot be sent again as a teach clip", async () => {
    const t = newBackend();
    const { roomId, gameId, clip, ann, amy } = await judging(t);
    const taught = await upload(t);
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: taught });
    for (const storageId of [clip, taught]) {
      await expect(
        t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: amy, storageId })
      ).rejects.toThrow(/already used/);
      expect(await fileExists(t, storageId)).toBe(true);
    }
    expect((await stateOf(t, roomId)).performer?.clipUrl).toEqual(expect.any(String));
  });

  test("the first teach clip stays; a later teacher's upload is deleted", async () => {
    const t = newBackend();
    const { roomId, gameId, ann, amy } = await judging(t);
    const first = await upload(t);
    const second = await upload(t);
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: ann, storageId: first });
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: amy, storageId: second });
    expect((await stateOf(t, roomId)).teachClip?.byParticipantId).toBe(ann);
    expect(await fileExists(t, first)).toBe(true);
    expect(await fileExists(t, second)).toBe(false);
  });
});

describe("generateClipUploadUrl", () => {
  test("a caller who names nobody gets an upload URL, as installed builds expect, and so does a named player", async () => {
    const t = newBackend();
    const { hostId } = await createRoom(t);
    // The URL itself is convex-test's stand-in: only that one comes back is asserted
    expect(await t.mutation(api.wordRush.generateClipUploadUrl, {})).toEqual(expect.any(String));
    expect(await t.mutation(api.wordRush.generateClipUploadUrl, { callerId: hostId })).toEqual(expect.any(String));
  });

  test("a named caller whose room has closed is refused", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.wordRush.generateClipUploadUrl, { callerId: hostId })).rejects.toThrow(
      /Room is closed/
    );
  });
});

// ─── Results ─────────────────────────────────────────────────────────────────

describe("the end of a game", () => {
  test("after the last card the game is completed, with the final scores and no card", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"], sayIt: false });
    await answer(t, gameId, hostId);
    await skipTo(t, gameId, hostId, "reveal", 9);
    await tick(t, 8000);
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({ status: "completed", endedAt: Date.now(), card: null, performer: null });
    expect(state.players.map((p) => p.score)).toEqual([300, 0]);
  });

  test("the scores are posted to the chat with the top scorer as winner", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"], sayIt: false });
    await answer(t, gameId, hostId);
    await playToEnd(t, gameId, hostId);
    const avatars = await t.run(async (ctx) => {
      const rows = await ctx.db
        .query("participants")
        .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
        .collect();
      return rows.map((p) => p.avatar.value);
    });
    expect(avatars).toHaveLength(2);
    expect(await summaries(t, roomId)).toEqual([
      {
        gameType: "Word Rush",
        games: [
          {
            players: [
              { name: "Host", avatar: avatars[0], score: 300, isWinner: true },
              { name: "Ann", avatar: avatars[1], score: 0, isWinner: false },
            ],
            totalPairs: 10,
            isTie: false,
          },
        ],
      },
    ]);
  });

  test("a deck shorter than ten cards is played to its last card, and the summary counts its cards", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t, { sayIt: false });
    // No lobby is dealt a short deck any more, but a game left with one before that plays out all the same
    await t.run(async (ctx) => {
      const game = (await ctx.db.get(gameId))!;
      await ctx.db.patch(gameId, { cards: game.cards.slice(0, 3) });
    });
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId });
    await skipTo(t, gameId, hostId, "reveal", 2);
    expect(await stateOf(t, roomId)).toMatchObject({ status: "active", totalCards: 3 });
    await skip(t, gameId, hostId);
    expect((await stateOf(t, roomId)).status).toBe("completed");
    expect((await summaries(t, roomId))[0].games[0].totalPairs).toBe(3);
  });

  test("equal top scores are a tie with two winners, and a game nobody scored in has no winner", async () => {
    const t = newBackend();
    const tied = await startGame(t, { guests: ["Ann"], sayIt: false });
    await answer(t, tied.gameId, tied.hostId);
    await answer(t, tied.gameId, tied.guests[0]);
    await playToEnd(t, tied.gameId, tied.hostId);
    const [tie] = await summaries(t, tied.roomId);
    expect(tie.games[0].isTie).toBe(true);
    expect(tie.games[0].players.map((p) => p.isWinner)).toEqual([true, true]);

    const blank = await startGame(t, { guests: ["Ann"], sayIt: false });
    await playToEnd(t, blank.gameId, blank.hostId);
    const [none] = await summaries(t, blank.roomId);
    expect(none.games[0].players.map((p) => p.isWinner)).toEqual([false, false]);
  });

  test("a room's next game is added to its Word Rush summary, and another game's summary is left alone", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { sayIt: false });
    const match = `emoji_match_summary:${JSON.stringify({ gameType: "Emoji Match", games: [{ players: [], totalPairs: 8, isTie: false }] })}`;
    await t.run(async (ctx) => {
      await ctx.db.insert("messages", {
        roomId,
        senderId: hostId,
        kind: "system",
        status: "processed",
        text: match,
        createdAt: Date.now(),
      });
    });
    await playToEnd(t, gameId, hostId);
    const rematch = await t.mutation(api.wordRush.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.wordRush.start, { gameId: rematch, participantId: hostId });
    await tick(t, 1000);
    await answer(t, rematch, hostId);
    await playToEnd(t, rematch, hostId);

    const all = await summaries(t, roomId);
    expect(all.map((s) => [s.gameType, s.games.length])).toEqual([
      ["Emoji Match", 1],
      ["Word Rush", 2],
    ]);
    expect(all[1].games.map((g) => g.players[0].score)).toEqual([0, 300]);
    expect(await systemTexts(t, roomId)).toContain(match);
    // The summary moves down with each game: it is the room's latest message again, below the rematch's announcement
    const latest = await t.run(
      async (ctx) =>
        await ctx.db
          .query("messages")
          .withIndex("by_roomId_createdAt", (q) => q.eq("roomId", roomId))
          .order("desc")
          .first()
    );
    expect(latest?.text).toMatch(/^emoji_match_summary:.*"Word Rush"/);
  });

  test("a chat line that reads like a summary is not taken for one", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"], sayIt: false });
    const fake = `emoji_match_summary:${JSON.stringify({ gameType: "Word Rush", games: [] })}`;
    const messageId = await t.mutation(api.messages.sendTextMessage, { roomId, senderId: guests[0], text: fake });
    await playToEnd(t, gameId, hostId);
    expect((await t.run(async (ctx) => await ctx.db.get(messageId)))?.text).toBe(fake);
    const [summary] = await summaries(t, roomId);
    expect(summary.games).toHaveLength(1);
  });

  // Emoji Match and Emoji Bingo post their summaries under the same prefix. The fixtures are texts as
  // emojiMatch.ts and emojiBingo.ts write them; a player's name is no gameType, whatever it says
  test.each([
    ["an Emoji Match summary", { gameType: "Match Emoji" }],
    ["an Emoji Match summary from before gameType existed", {}],
    ["an Emoji Bingo summary", { gameType: "Emoji Bingo" }],
  ])("%s is left alone, also when one of its players is called Word Rush: the game posts its own", async (_whose, head) => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { sayIt: false });
    const otherText = `emoji_match_summary:${JSON.stringify({
      ...head,
      games: [{ players: [{ name: "Word Rush", avatar: "default", score: 3, isWinner: true }], totalPairs: 8, isTie: false }],
    })}`;
    const otherId = await postSystemLine(t, roomId, hostId, otherText);
    const other = await t.run(async (ctx) => await ctx.db.get(otherId));
    expect(other?.text).toBe(otherText);
    await tick(t, 1000);
    await answer(t, gameId, hostId);
    await playToEnd(t, gameId, hostId);

    // The same text, at the same place in the chat
    expect(await t.run(async (ctx) => await ctx.db.get(otherId))).toEqual(other);
    const own = (await summaries(t, roomId)).filter((s) => s.gameType === "Word Rush");
    expect(own).toHaveLength(1);
    expect(own[0].games).toMatchObject([{ players: [{ name: "Host", score: 300, isWinner: true }], totalPairs: 10, isTie: false }]);
    expect(await summaries(t, roomId)).toHaveLength(2);
  });

  // No function writes such a line. The fixture is a summary of this game cut short
  test("a system line under the summary prefix whose text is not JSON is passed over: the game ends and posts its summary", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { sayIt: false });
    const cutShort = 'emoji_match_summary:{"gameType":"Word Rush","games":[';
    const lineId = await postSystemLine(t, roomId, hostId, cutShort);
    const line = await t.run(async (ctx) => await ctx.db.get(lineId));
    await tick(t, 1000);

    expect((await playToEnd(t, gameId, hostId)).status).toBe("completed");

    expect(await t.run(async (ctx) => await ctx.db.get(lineId))).toEqual(line);
    const posted = (await systemTexts(t, roomId)).filter((text) => text.startsWith("emoji_match_summary:") && text !== cutShort);
    expect(posted.map((text) => JSON.parse(text.slice("emoji_match_summary:".length)))).toMatchObject([
      { gameType: "Word Rush", games: [{ players: [{ name: "Host", score: 0 }], totalPairs: 10 }] },
    ]);
    expect(posted).toHaveLength(1);
  });

  test("a game that ends on a Say it round deletes its clips and shows no performer, clip or verdict", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
    // The fifth mic round, after the last card, is the host's again
    await skipTo(t, gameId, hostId, "reveal", 9);
    await skip(t, gameId, hostId);
    const clip = await upload(t);
    const taught = await upload(t);
    await t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: clip });
    await t.mutation(api.wordRush.submitTeachClip, { gameId, participantId: guests[0], storageId: taught });
    await t.mutation(api.wordRush.vote, { gameId, participantId: guests[0], vote: "native" });
    expect(await stateOf(t, roomId)).toMatchObject({ status: "active", phase: "verdict", cardIndex: 9 });
    await tick(t, 7000);
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({ status: "completed", performer: null, teachClip: null, verdict: null, votedIds: [] });
    expect(state.players.map((p) => [p.score, p.sayItBonus])).toEqual([
      [40, 40],
      [0, 0],
    ]);
    expect(await fileExists(t, clip)).toBe(false);
    expect(await fileExists(t, taught)).toBe(false);
  });
});

describe("cancel", () => {
  test("a cancelled lobby disappears without a word in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t, { guests: ["Ann"] });
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    expect(await t.query(api.wordRush.getState, { roomId })).toBeNull();
    expect((await systemTexts(t, roomId)).filter((text) => /Word Rush/.test(text))).toEqual([]);
  });

  test("cancelling a running game announces it, deletes its clips and stops its timers", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await startGame(t, { guests: ["Ann"] });
    await skipTo(t, gameId, hostId, "mic");
    const clip = await upload(t);
    await t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: clip });
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    expect(await t.query(api.wordRush.getState, { roomId })).toBeNull();
    expect(await systemTexts(t, roomId)).toContain("game_cancelled:Word Rush");
    expect(await fileExists(t, clip)).toBe(false);
    const before = await gameDoc(t, gameId);
    await tick(t, 10_000);
    expect(await gameDoc(t, gameId)).toEqual(before);
    expect(await summaries(t, roomId)).toEqual([]);
  });

  test("the room host can cancel a guest's game", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: ann });
    await t.mutation(api.wordRush.start, { gameId, participantId: ann });
    await t.mutation(api.wordRush.cancel, { gameId, participantId: hostId });
    expect((await gameDoc(t, gameId)).status).toBe("canceled");
  });

  test("cancelling a game that has finished or was already cancelled changes nothing, whoever asks", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"], sayIt: false });
    await playToEnd(t, gameId, hostId);
    await t.mutation(api.wordRush.cancel, { gameId, participantId: guests[0] });
    expect((await stateOf(t, roomId)).status).toBe("completed");

    const rematch = await t.mutation(api.wordRush.playAgain, { gameId, participantId: hostId });
    await t.mutation(api.wordRush.start, { gameId: rematch, participantId: hostId });
    await t.mutation(api.wordRush.cancel, { gameId: rematch, participantId: hostId });
    await t.mutation(api.wordRush.cancel, { gameId: rematch, participantId: hostId });
    const cancelled = (await systemTexts(t, roomId)).filter((text) => text === "game_cancelled:Word Rush");
    expect(cancelled).toHaveLength(1);
  });
});

describe("playAgain", () => {
  /** A finished three-player game with the pack and Say it setting changed from their defaults */
  async function finished(t: Backend) {
    const lobby = await openLobby(t, { guests: ["Ann", "Ben"], pack: "foodie", sayIt: false });
    await t.mutation(api.wordRush.start, { gameId: lobby.gameId, participantId: lobby.hostId });
    await answer(t, lobby.gameId, lobby.hostId);
    await playToEnd(t, lobby.gameId, lobby.hostId);
    const [ann, ben] = lobby.guests;
    return { ...lobby, ann, ben };
  }

  test("whoever asks for the rematch hosts it, with the present players dealt in, scores at zero and the same settings", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ben } = await finished(t);
    const rematch = await t.mutation(api.wordRush.playAgain, { gameId, participantId: ann });
    expect(rematch).not.toBe(gameId);
    const state = await stateOf(t, roomId);
    expect(state).toMatchObject({
      _id: rematch,
      status: "lobby",
      hostParticipantId: ann,
      pack: "foodie",
      sayIt: false,
      endedAt: null,
    });
    expect(state.players.map((p) => p.participantId)).toEqual([ann, hostId, ben]);
    expect(state.players.map((p) => p.score)).toEqual([0, 0, 0]);
  });

  test("a previous player who has gone quiet, is away or has left is not dealt in, and can join by hand", async () => {
    const t = newBackend();
    const lobby = await openLobby(t, { guests: ["Ann", "Ben", "Cat", "Dan"], sayIt: false });
    const [ann, ben, cat, dan] = lobby.guests;
    await t.mutation(api.wordRush.start, { gameId: lobby.gameId, participantId: lobby.hostId });
    await playToEnd(t, lobby.gameId, lobby.hostId);
    await tick(t, 45_000);
    // Ben sent no heartbeat for 45 s; Cat's tab is in the background; Dan closed his
    await heartbeat(t, lobby.hostId, ann, dan);
    await t.mutation(api.participants.setParticipantOnline, { participantId: cat, online: true, presence: "away" });
    await t.mutation(api.participants.leaveRoom, { participantId: dan });

    const rematch = await t.mutation(api.wordRush.playAgain, { gameId: lobby.gameId, participantId: ann });
    expect((await stateOf(t, lobby.roomId)).players.map((p) => p.participantId)).toEqual([ann, lobby.hostId]);
    await t.mutation(api.wordRush.joinLobby, { gameId: rematch, participantId: ben });
    expect((await stateOf(t, lobby.roomId)).players.map((p) => p.participantId)).toEqual([ann, lobby.hostId, ben]);
  });

  test("a previous player who left and has come back is dealt in", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ben } = await finished(t);
    // As a reload does: the page's leave beacon, then the heartbeat of the page that loads
    await t.mutation(api.participants.leaveRoom, { participantId: ben });
    await heartbeat(t, ben);
    await t.mutation(api.wordRush.playAgain, { gameId, participantId: ann });
    expect((await stateOf(t, roomId)).players.map((p) => p.participantId)).toEqual([ann, hostId, ben]);
  });

  test("a rematch still opens after a previous player was kicked", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ben } = await finished(t);
    await t.mutation(api.participants.kickParticipant, { participantId: ben, roomId });
    await t.mutation(api.wordRush.playAgain, { gameId, participantId: ann });
    expect((await stateOf(t, roomId)).players.map((p) => p.participantId)).toEqual([ann, hostId]);
  });

  test("someone who sat the last game out can ask for the rematch and is dealt in", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann, ben } = await finished(t);
    const eve = await joinGuest(t, roomId, "Eve");
    await t.mutation(api.wordRush.playAgain, { gameId, participantId: eve });
    const state = await stateOf(t, roomId);
    expect(state.hostParticipantId).toBe(eve);
    expect(state.players.map((p) => p.participantId)).toEqual([eve, hostId, ann, ben]);
  });

  test("when the guest who asked for the rematch leaves, the room host can start it, cancel it or take it over", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, ann } = await finished(t);
    const rematch = await t.mutation(api.wordRush.playAgain, { gameId, participantId: ann });
    await t.mutation(api.participants.leaveRoom, { participantId: ann });

    expect(await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId })).toBe(rematch);
    expect((await stateOf(t, roomId)).hostParticipantId).toBe(hostId);
    await t.mutation(api.wordRush.start, { gameId: rematch, participantId: hostId });
    expect((await stateOf(t, roomId)).status).toBe("active");
    await t.mutation(api.wordRush.cancel, { gameId: rematch, participantId: hostId });
    expect(await t.query(api.wordRush.getState, { roomId })).toBeNull();
  });

  test("the second of two rematch requests is refused, and one lobby is opened", async () => {
    const t = newBackend();
    const { roomId, gameId, ann, ben } = await finished(t);
    const rematch = await t.mutation(api.wordRush.playAgain, { gameId, participantId: ann });
    await expect(t.mutation(api.wordRush.playAgain, { gameId, participantId: ben })).rejects.toThrow(
      /already in progress/
    );
    expect(await stateOf(t, roomId)).toMatchObject({ _id: rematch, hostParticipantId: ann });
  });

  test("a rematch is refused for a game that has not finished, in a closed room, and to someone from another room", async () => {
    const t = newBackend();
    const running = await startGame(t, { guests: ["Ann"] });
    await expect(
      t.mutation(api.wordRush.playAgain, { gameId: running.gameId, participantId: running.hostId })
    ).rejects.toThrow(/not finished/);
    await t.mutation(api.wordRush.cancel, { gameId: running.gameId, participantId: running.hostId });
    await expect(
      t.mutation(api.wordRush.playAgain, { gameId: running.gameId, participantId: running.hostId })
    ).rejects.toThrow(/not finished/);

    const { roomId, hostId, gameId } = await finished(t);
    await expect(
      t.mutation(api.wordRush.playAgain, { gameId, participantId: running.hostId })
    ).rejects.toThrow(/not in this room/);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.wordRush.playAgain, { gameId, participantId: hostId })).rejects.toThrow(
      /Room is closed/
    );
  });
});

// ─── Callers ─────────────────────────────────────────────────────────────────

describe("caller tokens", () => {
  /** A room whose host and guest Ann each registered a token, with the host's lobby open and Ann in it */
  async function tokenedLobby(t: Backend) {
    const { roomId, hostId } = await createRoom(t, { hostToken: tokenFor(1) });
    const ann = await joinGuest(t, roomId, "Ann", { token: tokenFor(2) });
    const gameId = await t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, token: tokenFor(1) });
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: ann, token: tokenFor(2) });
    return { roomId, hostId, ann, gameId };
  }

  test("under enforce every Word Rush mutation refuses a caller with another participant's token, or none", async () => {
    const t = newBackend();
    quiet();
    const { roomId, hostId, gameId } = await tokenedLobby(t);
    const storageId = await upload(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    // Ann's token, sent with the host's id
    const token = tokenFor(2);
    const asHost = { gameId, participantId: hostId, token };
    const calls: Record<string, () => Promise<unknown>> = {
      createLobby: () => t.mutation(api.wordRush.createLobby, { roomId, hostParticipantId: hostId, token }),
      joinLobby: () => t.mutation(api.wordRush.joinLobby, asHost),
      leaveLobby: () => t.mutation(api.wordRush.leaveLobby, asHost),
      updateSettings: () => t.mutation(api.wordRush.updateSettings, { ...asHost, sayIt: false }),
      start: () => t.mutation(api.wordRush.start, asHost),
      answer: () => t.mutation(api.wordRush.answer, { ...asHost, choiceIndex: 0 }),
      takeHint: () => t.mutation(api.wordRush.takeHint, asHost),
      submitClip: () => t.mutation(api.wordRush.submitClip, { ...asHost, storageId }),
      skipMic: () => t.mutation(api.wordRush.skipMic, asHost),
      vote: () => t.mutation(api.wordRush.vote, { ...asHost, vote: "native" }),
      submitTeachClip: () => t.mutation(api.wordRush.submitTeachClip, { ...asHost, storageId }),
      skip: () => t.mutation(api.wordRush.skip, { ...asHost, phaseSeq: 0 }),
      cancel: () => t.mutation(api.wordRush.cancel, asHost),
      playAgain: () => t.mutation(api.wordRush.playAgain, asHost),
      generateClipUploadUrl: () => t.mutation(api.wordRush.generateClipUploadUrl, { callerId: hostId, token }),
      "start, with no token": () => t.mutation(api.wordRush.start, { gameId, participantId: hostId }),
    };
    // Every public mutation the module exports is in the list: a new one has to be added, and so checked
    const publicMutations = Object.entries(wordRushFunctions as Record<string, unknown>)
      .filter(([, fn]) => {
        const registered = fn as { isMutation?: boolean; isPublic?: boolean };
        return registered.isMutation === true && registered.isPublic === true;
      })
      .map(([name]) => name);
    expect(publicMutations.sort()).toEqual(Object.keys(calls).filter((name) => name in wordRushFunctions).sort());
    for (const [name, call] of Object.entries(calls)) {
      await expect(call(), name).rejects.toThrow(/Not authorised/);
    }
    expect(await stateOf(t, roomId)).toMatchObject({ status: "lobby", hostParticipantId: hostId, sayIt: true });
  });

  test("under enforce the caller's own token is accepted, and a participant from before tokens needs none", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await tokenedLobby(t);
    const legacy = await joinGuest(t, roomId, "Old");
    vi.stubEnv("AUTH_MODE", "enforce");
    await t.mutation(api.wordRush.joinLobby, { gameId, participantId: legacy });
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId, token: tokenFor(1) });
    const state = await stateOf(t, roomId);
    expect(state.status).toBe("active");
    expect(state.players.map((p) => p.participantId)).toContain(legacy);
  });

  test("without enforce a wrong token is logged and let through", async () => {
    const t = newBackend();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { roomId, hostId, gameId } = await tokenedLobby(t);
    await t.mutation(api.wordRush.start, { gameId, participantId: hostId, token: tokenFor(2) });
    expect((await stateOf(t, roomId)).status).toBe("active");
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^auth: wordRush\.start wrong token/));
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

describe("the /api/word-rush routes", () => {
  test("a host can open, set up, start, play, cancel and replay a game through the routes", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    const ann = await joinGuest(t, roomId, "Ann");

    const created = await post(t, "create-lobby", { roomId, hostParticipantId: hostId, pack: "travel", sayIt: false });
    expect(created.status).toBe(200);
    const gameId: GameId = created.body.gameId;
    expect(await post(t, "join", { gameId, participantId: ann })).toEqual({ status: 200, body: { ok: true } });
    const opened = await post(t, "state", { roomId });
    expect(opened.body.game).toMatchObject({ _id: gameId, status: "lobby", pack: "travel", sayIt: false });
    expect(opened.body.game.players).toHaveLength(2);
    // The app sends only the setting that changed
    expect(await post(t, "update-settings", { gameId, participantId: hostId, pack: "anime" })).toMatchObject({
      status: 200,
    });
    expect(await post(t, "update-settings", { gameId, participantId: hostId, sayIt: true })).toMatchObject({
      status: 200,
    });
    expect((await post(t, "state", { roomId })).body.game).toMatchObject({ pack: "anime", sayIt: true });

    expect(await post(t, "start", { gameId, participantId: hostId })).toMatchObject({ status: 200 });
    const hint = await post(t, "hint", { gameId, participantId: hostId });
    expect(hint.body.hint).toEqual(expect.any(String));
    const choiceIndex = rightIndex(await gameDoc(t, gameId), hostId);
    expect(await post(t, "answer", { gameId, participantId: hostId, choiceIndex })).toEqual({
      status: 200,
      body: { correct: true, points: 200 },
    });
    const { phaseSeq } = (await post(t, "state", { roomId })).body.game;
    expect(await post(t, "skip", { gameId, participantId: hostId, phaseSeq })).toMatchObject({ status: 200 });
    expect((await post(t, "state", { roomId })).body.game.phase).toBe("reveal");

    await playToEnd(t, gameId, hostId);
    const again = await post(t, "play-again", { gameId, participantId: hostId });
    expect(again.status).toBe(200);
    expect(again.body.gameId).not.toBe(gameId);
    expect(await post(t, "leave", { gameId: again.body.gameId, participantId: ann })).toMatchObject({ status: 200 });
    expect(await post(t, "cancel", { gameId: again.body.gameId, participantId: hostId })).toMatchObject({
      status: 200,
    });
    expect((await post(t, "state", { roomId })).body).toEqual({ game: null });
  });

  test("the mic, clip, vote and teach routes carry a Say it round", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
    await skipTo(t, gameId, hostId, "mic");
    expect(await post(t, "skip-mic", { gameId, participantId: hostId })).toMatchObject({ status: 200 });
    await skipTo(t, gameId, hostId, "mic");
    const clip = await upload(t);
    const taught = await upload(t);
    // Ann, learning Japanese, performs; the host is the Japanese speaker
    expect(await post(t, "submit-clip", { gameId, participantId: guests[0], storageId: clip })).toMatchObject({
      status: 200,
    });
    expect(await post(t, "submit-teach-clip", { gameId, participantId: hostId, storageId: taught })).toMatchObject({
      status: 200,
    });
    expect(await post(t, "vote", { gameId, participantId: hostId, vote: "native" })).toMatchObject({ status: 200 });
    expect(await post(t, "vote", { gameId, participantId: guests[1], vote: "close" })).toMatchObject({ status: 200 });
    const { game } = (await post(t, "state", { roomId })).body;
    // 20 x 2 from the host and 10 x 1 from Ben
    expect(game).toMatchObject({ phase: "verdict", verdict: { bonus: 50, label: "native" } });
    expect(game.teachClip.byParticipantId).toBe(hostId);
  });

  test("a room with no game answers { game: null }, and a refusal is a 400 with the reason", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    expect(await post(t, "state", { roomId })).toEqual({ status: 200, body: { game: null } });
    const refused = await post(t, "create-lobby", { roomId, hostParticipantId: hostId, pack: "pirates" });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Unknown pack/);
  });

  test("callerToken in the body is checked as the caller's token", async () => {
    const t = newBackend();
    quiet();
    const { roomId, hostId } = await createRoom(t, { hostToken: tokenFor(1) });
    vi.stubEnv("AUTH_MODE", "enforce");
    const refused = await post(t, "create-lobby", { roomId, hostParticipantId: hostId, callerId: hostId });
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Not authorised/);
    const accepted = await post(t, "create-lobby", {
      roomId,
      hostParticipantId: hostId,
      callerId: hostId,
      callerToken: tokenFor(1),
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body.gameId).toEqual(expect.any(String));
  });

  test("under enforce every route that acts for a participant passes callerToken on", async () => {
    const t = newBackend();
    quiet();
    const { roomId, hostId } = await createRoom(t, { hostToken: tokenFor(1) });
    const gameId = await t.mutation(api.wordRush.createLobby, {
      roomId,
      hostParticipantId: hostId,
      token: tokenFor(1),
    });
    const storageId = await upload(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    const host = { gameId, participantId: hostId };
    // In an order that keeps the lobby open as long as possible
    const bodies: Record<string, Record<string, unknown>> = {
      "create-lobby": { roomId, hostParticipantId: hostId },
      join: host,
      "update-settings": { ...host, sayIt: false },
      answer: { ...host, choiceIndex: 0 },
      hint: host,
      "submit-clip": { ...host, storageId },
      "skip-mic": host,
      vote: { ...host, vote: "native" },
      "submit-teach-clip": { ...host, storageId },
      skip: { ...host, phaseSeq: 0 },
      "play-again": host,
      start: host,
      cancel: host,
      leave: host,
    };
    // Every Word Rush route but the state query is in the list: a new one has to be added, and so checked
    const prefix = "/api/word-rush/";
    const routes = http
      .getRoutes()
      .map(([path]) => path)
      .filter((path) => path.startsWith(prefix))
      .map((path) => path.slice(prefix.length));
    expect(Object.keys(bodies).sort()).toEqual(routes.filter((name) => name !== "state").sort());

    for (const [name, body] of Object.entries(bodies)) {
      const unsigned = await post(t, name, { ...body, callerId: hostId });
      expect(unsigned, name).toMatchObject({ status: 400, body: { error: expect.stringMatching(/Not authorised/) } });
      // With the token the call gets past the caller check. The game's own rules may still refuse it (there is
      // nothing to answer in a lobby): that is not what is tested here
      const signed = await post(t, name, { ...body, callerId: hostId, callerToken: tokenFor(1) });
      expect(signed.body.error ?? "", name).not.toMatch(/Not authorised/);
    }
    // The signed settings change, start and cancel went through: only a started game's cancel is announced
    expect(await gameDoc(t, gameId)).toMatchObject({ status: "canceled", sayIt: false });
    expect(await systemTexts(t, roomId)).toContain("game_cancelled:Word Rush");
  });
});

// ─── Players who have left ───────────────────────────────────────────────────

describe("players who have left", () => {
  /** What a tab sends as it is hidden: a phone that locked, or a look at another app */
  async function goAway(t: Backend, participantId: PlayerId) {
    await t.mutation(api.participants.setParticipantOnline, { participantId, online: true, presence: "away" });
  }

  describe("the clues", () => {
    // The clues end early on the answers of the players who are still here, not on a count of all players
    test("the reveal starts once every player who is still here has answered", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
      await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
      await answer(t, gameId, hostId);
      expect((await stateOf(t, roomId)).phase).toBe("reveal");
    });

    test("a closing tab's away ping, before or after its leave beacon, does not make the player waited for", async () => {
      const t = newBackend();
      for (const order of ["beacon first", "ping first"]) {
        const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
        if (order === "ping first") await goAway(t, guests[0]);
        await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
        if (order === "beacon first") await goAway(t, guests[0]);
        await answer(t, gameId, hostId);
        expect((await stateOf(t, roomId)).phase, order).toBe("reveal");
      }
    });

    test("a player who was kicked is not waited for, and one who is still here is", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      await t.mutation(api.participants.kickParticipant, { participantId: guests[0], roomId });
      await answer(t, gameId, hostId);
      expect((await stateOf(t, roomId)).phase).toBe("clues");
      await answer(t, gameId, guests[1]);
      const state = await stateOf(t, roomId);
      expect(state.phase).toBe("reveal");
      // The kicked player keeps their place on the scoreboard, with no answer and no streak
      expect(state.players.map((p) => [p.participantId, p.streak])).toEqual([
        [hostId, 1],
        [guests[0], 0],
        [guests[1], 1],
      ]);
    });

    test("a player whose phone has just locked is still waited for, and the 15 s timer still closes the clues", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
      await goAway(t, guests[0]);
      await answer(t, gameId, hostId);
      await tick(t, 14_999);
      expect((await stateOf(t, roomId)).phase).toBe("clues");
      // Back in time: their answer is taken and ends the clues
      await heartbeat(t, guests[0]);
      expect(await answer(t, gameId, guests[0])).toEqual({ correct: true, points: 100 });
      expect((await stateOf(t, roomId)).phase).toBe("reveal");

      // On the next card they stay away, and the timer closes the clues as it always has
      await skipTo(t, gameId, hostId, "clues", 1);
      await goAway(t, guests[0]);
      await answer(t, gameId, hostId);
      await tick(t, 14_999);
      expect((await stateOf(t, roomId)).phase).toBe("clues");
      await tick(t, 1);
      expect((await stateOf(t, roomId)).phase).toBe("reveal");
    });

    test("a player not heard from for 45 s is no longer waited for, whether their tab said away or just went quiet", async () => {
      const t = newBackend();
      for (const lastWord of ["away", "nothing"]) {
        const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"], sayIt: false });
        if (lastWord === "away") await goAway(t, guests[0]);
        else await heartbeat(t, guests[0]);
        // One millisecond short of 45 s they are still waited for
        await tick(t, 44_999);
        await skipTo(t, gameId, hostId, "clues", 1);
        await answer(t, gameId, hostId);
        expect((await stateOf(t, roomId)).phase, lastWord).toBe("clues");
        await tick(t, 1);
        await skipTo(t, gameId, hostId, "clues", 2);
        await answer(t, gameId, hostId);
        expect((await stateOf(t, roomId)).phase, lastWord).toBe("reveal");
      }
    });

    test("an app in the background that is still heard from is waited for", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"], sayIt: false });
      // The iOS app keeps its heartbeat going in the background, and says "away" with each one
      await goAway(t, hostId);
      await tick(t, 40_000);
      await goAway(t, hostId);
      await tick(t, 10_000);
      await heartbeat(t, guests[0]);
      await skipTo(t, gameId, hostId, "clues", 1);
      await answer(t, gameId, guests[0]);
      expect((await stateOf(t, roomId)).phase).toBe("clues");
    });

    test("a player who left and has come back is waited for again and plays on", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
      await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
      await answer(t, gameId, hostId);
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "reveal", cardIndex: 0 });
      // As a reload does: the leave beacon, then the heartbeat of the page that loads
      await heartbeat(t, guests[0]);
      await skipTo(t, gameId, hostId, "clues", 1);
      await answer(t, gameId, hostId);
      expect((await stateOf(t, roomId)).phase).toBe("clues");
      expect(await answer(t, gameId, guests[0])).toEqual({ correct: true, points: 300 });
      const state = await stateOf(t, roomId);
      expect(state.phase).toBe("reveal");
      expect(state.players.map((p) => p.score)).toEqual([600, 300]);
    });
  });

  describe("the mic", () => {
    // The mic goes to a player who is still here
    test("a player who has left is not put on the mic", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      // The host would be first on the mic; make it Ann's turn by having the host perform first
      await skipTo(t, gameId, hostId, "mic");
      await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
      await skip(t, gameId, hostId);
      await skipTo(t, gameId, hostId, "mic");
      expect((await stateOf(t, roomId)).performer?.participantId).toBe(guests[1]);
    });

    test("a player who was kicked is not put on the mic, when the reveal ends on its timer as on a skip", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      await skipTo(t, gameId, hostId, "mic");
      await t.mutation(api.participants.kickParticipant, { participantId: guests[0], roomId });
      await skip(t, gameId, hostId);
      await skipTo(t, gameId, hostId, "reveal", 3);
      await tick(t, 8000);
      expect(await stateOf(t, roomId)).toMatchObject({
        phase: "mic",
        cardIndex: 3,
        performer: { participantId: guests[1] },
      });
    });

    test("a player passed over while they were gone takes the mic at the next round once they are back", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      await skipTo(t, gameId, hostId, "mic", 1);
      await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
      await skip(t, gameId, hostId);
      await skipTo(t, gameId, hostId, "mic", 3);
      expect((await stateOf(t, roomId)).performer?.participantId).toBe(guests[1]);
      await heartbeat(t, guests[0]);
      await skip(t, gameId, hostId);
      await skipTo(t, gameId, hostId, "mic", 5);
      expect((await stateOf(t, roomId)).performer?.participantId).toBe(guests[0]);
      // Their clip is taken like anyone's
      await t.mutation(api.wordRush.submitClip, { gameId, participantId: guests[0], storageId: await upload(t) });
      expect((await stateOf(t, roomId)).phase).toBe("judging");
    });

    test("a player whose phone has just locked keeps their turn on the mic", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      await skipTo(t, gameId, hostId, "mic", 1);
      await skip(t, gameId, hostId);
      await skipTo(t, gameId, hostId, "reveal", 3);
      await goAway(t, guests[0]);
      await skip(t, gameId, hostId);
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "mic", performer: { participantId: guests[0] } });
    });

    test("with fewer than two players still here there is no mic round, and the game goes on to the next card", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann"] });
      await t.mutation(api.participants.leaveRoom, { participantId: guests[0] });
      await skipTo(t, gameId, hostId, "reveal", 1);
      await skip(t, gameId, hostId);
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "clues", cardIndex: 2, performer: null });
      // Nobody performed, so nobody's turn was used up: back in the room, the two play the next round
      await heartbeat(t, guests[0]);
      await skipTo(t, gameId, hostId, "reveal", 3);
      await skip(t, gameId, hostId);
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "mic", performer: { participantId: hostId } });
    });
  });

  describe("the judging", () => {
    /** A game in judging: the host performed, and Ann and Ben are the judges */
    async function judging(t: Backend) {
      const game = await startGame(t, { guests: ["Ann", "Ben"] });
      await skipTo(t, game.gameId, game.hostId, "mic");
      const storageId = await upload(t);
      await t.mutation(api.wordRush.submitClip, { gameId: game.gameId, participantId: game.hostId, storageId });
      return { ...game, ann: game.guests[0], ben: game.guests[1] };
    }

    // The verdict comes on the votes of the judges who are still here, not on a count of all players
    test("the verdict comes once every judge who is still here has voted", async () => {
      const t = newBackend();
      const { roomId, hostId, gameId, guests } = await startGame(t, { guests: ["Ann", "Ben"] });
      await skipTo(t, gameId, hostId, "mic");
      await t.mutation(api.wordRush.submitClip, { gameId, participantId: hostId, storageId: await upload(t) });
      await t.mutation(api.participants.leaveRoom, { participantId: guests[1] });
      await t.mutation(api.wordRush.vote, { gameId, participantId: guests[0], vote: "native" });
      expect((await stateOf(t, roomId)).phase).toBe("verdict");
    });

    test("a judge who was kicked is not waited for", async () => {
      const t = newBackend();
      const { roomId, gameId, ann, ben } = await judging(t);
      await t.mutation(api.participants.kickParticipant, { participantId: ben, roomId });
      await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "close" });
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "verdict", verdict: { votes: [{ judgeId: ann }] } });
    });

    test("a judge whose phone has just locked is still waited for, and the 10 s timer still closes the judging", async () => {
      const t = newBackend();
      const { roomId, gameId, ann, ben } = await judging(t);
      await goAway(t, ben);
      await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "close" });
      await tick(t, 9999);
      expect((await stateOf(t, roomId)).phase).toBe("judging");
      await tick(t, 1);
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "verdict", verdict: { votes: [{ judgeId: ann }] } });
    });

    test("a judge who left and has come back is waited for again, and their vote counts", async () => {
      const t = newBackend();
      const { roomId, gameId, ann, ben } = await judging(t);
      await t.mutation(api.participants.leaveRoom, { participantId: ben });
      await heartbeat(t, ben);
      await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "native" });
      expect((await stateOf(t, roomId)).phase).toBe("judging");
      await t.mutation(api.wordRush.vote, { gameId, participantId: ben, vote: "native" });
      const state = await stateOf(t, roomId);
      expect(state.phase).toBe("verdict");
      expect(state.verdict?.votes.map((v) => v.judgeId)).toEqual([ann, ben]);
    });

    test("a vote from a judge who reads as gone is still taken, and the judges who are here are still waited for", async () => {
      const t = newBackend();
      const { roomId, gameId, ann, ben } = await judging(t);
      await t.mutation(api.participants.leaveRoom, { participantId: ben });
      // Their tab is back before its first heartbeat has said so
      await t.mutation(api.wordRush.vote, { gameId, participantId: ben, vote: "close" });
      expect((await stateOf(t, roomId)).phase).toBe("judging");
      await t.mutation(api.wordRush.vote, { gameId, participantId: ann, vote: "close" });
      expect(await stateOf(t, roomId)).toMatchObject({ phase: "verdict", verdict: { bonus: 40 } });
    });
  });
});
