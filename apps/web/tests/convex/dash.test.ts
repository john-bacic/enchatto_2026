import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import {
  DASH_COUNTDOWN_MS,
  DASH_GRACE_MS,
  DASH_LEVEL_COUNT,
  DASH_RESULTS_MS,
  DASH_ROUND_LIMIT_MS,
  DASH_SUMMARY_GAME_TYPE,
} from "../../convex/dash";
import { Backend, createRoom, joinGuest, newBackend, tokenFor } from "./setup";

// Chatto Dash (convex/dash.ts and the /api/dash/* routes): a tournament of five obstacle races.
// lobby -> racing (a round: its start signal is DASH_COUNTDOWN_MS after it is set up)
//       -> results (the round's placings, for DASH_RESULTS_MS) -> racing (the next round) ...
//       -> completed (after the fifth round) | canceled
// The server knows nothing of the courses. A racer's own device says where they are and that they have
// crossed the line; the server times the finish by its own clock, ends the round and gives the points.

type GameId = Id<"dashGames">;
type PlayerId = Id<"participants">;
type Game = Doc<"dashGames">;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-09T12:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function gameOf(t: Backend, roomId: Id<"rooms">): Promise<Game> {
  const game = await t.query(api.dash.getActiveDash, { roomId });
  if (!game) throw new Error("The room has no game");
  return game;
}

/** Moves the clock, then lets the scheduled functions that came due run to the end */
async function advance(t: Backend, ms: number) {
  vi.advanceTimersByTime(ms);
  await t.finishInProgressScheduledFunctions();
}

/** A room whose host has opened a lobby, which the named guests have joined */
async function openLobby(t: Backend, guests: string[] = ["Aki"]) {
  const { roomId, hostId } = await createRoom(t);
  const guestIds: PlayerId[] = [];
  for (const name of guests) guestIds.push(await joinGuest(t, roomId, name));
  const gameId = await t.mutation(api.dash.createLobby, { roomId, hostParticipantId: hostId });
  for (const participantId of guestIds) await t.mutation(api.dash.joinLobby, { gameId, participantId });
  return { roomId, hostId, guestIds, gameId };
}

async function started(t: Backend, guests: string[] = ["Aki"]) {
  const lobby = await openLobby(t, guests);
  await t.mutation(api.dash.startGame, { gameId: lobby.gameId, participantId: lobby.hostId });
  return lobby;
}

/** A racer's device saying where they are: `p` of the way down the course */
async function say(t: Backend, gameId: GameId, participantId: PlayerId, round: number, p: number) {
  return await t.mutation(api.dash.pushState, { gameId, participantId, round, x: 0, y: 0, z: -160 * p, m: 0, g: true, p, rt: 10 });
}

describe("the lobby", () => {
  test("its host is seated; guests join and leave; a second lobby is refused", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await openLobby(t, ["Aki", "Ben"]);
    let game = await gameOf(t, roomId);
    expect(game).toMatchObject({ status: "lobby", hostParticipantId: hostId, round: 0, levels: [], finishes: [], results: [] });
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, ...guestIds]);
    expect(game.players.map((p) => p.score)).toEqual([0, 0, 0]);

    // Joining twice is one seat
    await t.mutation(api.dash.joinLobby, { gameId, participantId: guestIds[0] });
    expect((await gameOf(t, roomId)).players).toHaveLength(3);
    await expect(t.mutation(api.dash.createLobby, { roomId, hostParticipantId: guestIds[0] })).rejects.toThrow(/already in progress/);

    await t.mutation(api.dash.leaveLobby, { gameId, participantId: guestIds[1] });
    game = await gameOf(t, roomId);
    expect(game.players.map((p) => p.participantId)).toEqual([hostId, guestIds[0]]);
  });

  test("a host who leaves hands the lobby on; the last one out cancels it", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await openLobby(t);
    await t.mutation(api.dash.leaveLobby, { gameId, participantId: hostId });
    expect(await gameOf(t, roomId)).toMatchObject({ status: "lobby", hostParticipantId: guestIds[0] });
    await t.mutation(api.dash.leaveLobby, { gameId, participantId: guestIds[0] });
    expect(await gameOf(t, roomId)).toMatchObject({ status: "canceled", players: [] });
    // A canceled lobby is no game in progress: another can be opened
    await t.mutation(api.dash.createLobby, { roomId, hostParticipantId: hostId });
    expect(await gameOf(t, roomId)).toMatchObject({ status: "lobby" });
  });

  test("someone from another room cannot join, and only the lobby's host starts it", async () => {
    const t = newBackend();
    const { guestIds, gameId } = await openLobby(t);
    const other = await createRoom(t);
    await expect(t.mutation(api.dash.joinLobby, { gameId, participantId: other.hostId })).rejects.toThrow(/not in this room/);
    await expect(t.mutation(api.dash.startGame, { gameId, participantId: guestIds[0] })).rejects.toThrow(/Only the host/);
  });

  test("a closed room opens no lobby and starts no game", async () => {
    const t = newBackend();
    const { roomId, hostId, gameId } = await openLobby(t);
    await t.mutation(api.rooms.closeRoom, { roomId });
    await expect(t.mutation(api.dash.startGame, { gameId, participantId: hostId })).rejects.toThrow(/closed/);
    const closed = await createRoom(t);
    await t.mutation(api.rooms.closeRoom, { roomId: closed.roomId });
    await expect(t.mutation(api.dash.createLobby, { roomId: closed.roomId, hostParticipantId: closed.hostId })).rejects.toThrow(/closed/);
  });
});

describe("a round", () => {
  test("starting sets up the first of five courses, its start signal a countdown away", async () => {
    const t = newBackend();
    const { roomId } = await started(t);
    const game = await gameOf(t, roomId);
    const now = Date.now();
    expect(game).toMatchObject({
      status: "racing",
      round: 0,
      levels: Array.from({ length: DASH_LEVEL_COUNT }, (_, i) => i),
      roundStartsAt: now + DASH_COUNTDOWN_MS,
      roundEndsAt: now + DASH_COUNTDOWN_MS + DASH_ROUND_LIMIT_MS,
      finishes: [],
    });
  });

  test("a racer's place is one row, written over; it answers the server's clock", async () => {
    const t = newBackend();
    const { hostId, guestIds, gameId } = await started(t);
    expect(await say(t, gameId, hostId, 0, 0.1)).toEqual({ now: Date.now() });
    await say(t, gameId, hostId, 0, 0.3);
    await say(t, gameId, guestIds[0], 0, 0.2);
    const racers = await t.query(api.dash.getRacers, { gameId });
    expect(racers).toHaveLength(2);
    expect(racers.find((r) => r.id === hostId)).toMatchObject({ p: 0.3, round: 0, z: -48 });
    // Not a number, another round, someone who is not racing: nothing is written
    await expect(t.mutation(api.dash.pushState, { gameId, participantId: hostId, round: 0, x: NaN, y: 0, z: 0, m: 0, g: true, p: 0, rt: 0 })).rejects.toThrow();
    await say(t, gameId, hostId, 3, 0.9);
    expect((await t.query(api.dash.getRacers, { gameId })).find((r) => r.id === hostId)).toMatchObject({ p: 0.3 });
  });

  test("nobody crosses the line in the first seconds, or twice", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    await advance(t, DASH_COUNTDOWN_MS + 2000);
    await expect(t.mutation(api.dash.finish, { gameId, participantId: hostId, round: 0 })).rejects.toThrow(/only just started/);
    await advance(t, 30_000);
    // The guest is still out on the course, so the round goes on
    await say(t, gameId, guestIds[0], 0, 0.4);
    expect(await t.mutation(api.dash.finish, { gameId, participantId: hostId, round: 0 })).toEqual({ ms: 32_000 });
    await advance(t, 1000);
    expect(await t.mutation(api.dash.finish, { gameId, participantId: hostId, round: 0 })).toEqual({ ms: 32_000 });
    expect((await gameOf(t, roomId)).finishes).toEqual([{ participantId: hostId, ms: 32_000 }]);
    // A finish for a round that is over says nothing and changes nothing
    await advance(t, DASH_GRACE_MS);
    expect((await gameOf(t, roomId)).status).toBe("results");
    expect(await t.mutation(api.dash.finish, { gameId, participantId: guestIds[0], round: 0 })).toBeNull();
  });

  test("the first across starts a short clock for the rest; whoever is still out when it runs down gets no points", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t, ["Aki", "Ben"]);
    const [aki, ben] = guestIds;
    await advance(t, DASH_COUNTDOWN_MS + 40_000);
    for (const id of [hostId, aki, ben]) await say(t, gameId, id, 0, 0.5);
    await t.mutation(api.dash.finish, { gameId, participantId: aki, round: 0 });
    let game = await gameOf(t, roomId);
    expect(game.status).toBe("racing");
    expect(game.roundEndsAt).toBe(Date.now() + DASH_GRACE_MS);

    // Their devices keep talking, so they are waited for
    await advance(t, 10_000);
    await say(t, gameId, hostId, 0, 0.9);
    await say(t, gameId, ben, 0, 0.7);
    await t.mutation(api.dash.finish, { gameId, participantId: hostId, round: 0 });
    expect((await gameOf(t, roomId)).status).toBe("racing");

    await advance(t, DASH_GRACE_MS - 10_000);
    game = await gameOf(t, roomId);
    expect(game.status).toBe("results");
    expect(game.results).toHaveLength(1);
    expect(game.results[0].rows).toEqual([
      { participantId: aki, ms: 40_000, progress: 1, place: 1, points: 10 },
      { participantId: hostId, ms: 50_000, progress: 1, place: 2, points: 8 },
      { participantId: ben, progress: 0.7, place: 3, points: 0 },
    ]);
    expect(Object.fromEntries(game.players.map((p) => [p.participantId, p.score]))).toEqual({ [aki]: 10, [hostId]: 8, [ben]: 0 });
  });

  test("the round ends at once when everyone whose device is still talking has finished", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t, ["Aki", "Ben"]);
    await advance(t, DASH_COUNTDOWN_MS + 20_000);
    // Ben's phone went quiet long ago; the other two are racing
    await say(t, gameId, guestIds[1], 0, 0.1);
    await advance(t, 20_000);
    await say(t, gameId, hostId, 0, 0.9);
    await say(t, gameId, guestIds[0], 0, 0.9);
    await t.mutation(api.dash.finish, { gameId, participantId: hostId, round: 0 });
    expect((await gameOf(t, roomId)).status).toBe("racing");
    await t.mutation(api.dash.finish, { gameId, participantId: guestIds[0], round: 0 });
    const game = await gameOf(t, roomId);
    expect(game.status).toBe("results");
    expect(game.results[0].rows.map((r) => [r.place, r.points])).toEqual([[1, 10], [2, 8], [3, 0]]);
  });

  test("with nobody across, the round ends at its limit and those who got furthest are placed first", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    await advance(t, DASH_COUNTDOWN_MS + 5000);
    await say(t, gameId, hostId, 0, 0.2);
    await say(t, gameId, guestIds[0], 0, 0.6);
    await advance(t, DASH_ROUND_LIMIT_MS - 5000);
    const game = await gameOf(t, roomId);
    expect(game.status).toBe("results");
    expect(game.results[0].rows).toEqual([
      { participantId: guestIds[0], progress: 0.6, place: 1, points: 0 },
      { participantId: hostId, progress: 0.2, place: 2, points: 0 },
    ]);
  });
});

describe("the tournament", () => {
  /** Runs a whole round: the host finishes at 30 s, the guest at 35 s, which ends it */
  async function raceRound(t: Backend, gameId: GameId, hostId: PlayerId, guestId: PlayerId, round: number, guestFirst = false) {
    await advance(t, DASH_COUNTDOWN_MS + 30_000);
    await say(t, gameId, hostId, round, 0.9);
    await say(t, gameId, guestId, round, 0.9);
    await t.mutation(api.dash.finish, { gameId, participantId: guestFirst ? guestId : hostId, round });
    await advance(t, 5000);
    await say(t, gameId, guestFirst ? hostId : guestId, round, 0.95);
    await t.mutation(api.dash.finish, { gameId, participantId: guestFirst ? hostId : guestId, round });
  }

  test("five rounds, each on the next course, then the podium and a line in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    const guest = guestIds[0];
    for (let round = 0; round < DASH_LEVEL_COUNT; round++) {
      let game = await gameOf(t, roomId);
      expect(game).toMatchObject({ status: "racing", round, finishes: [] });
      await raceRound(t, gameId, hostId, guest, round, round === 4);
      game = await gameOf(t, roomId);
      if (round < DASH_LEVEL_COUNT - 1) {
        expect(game).toMatchObject({ status: "results", round, nextAt: Date.now() + DASH_RESULTS_MS });
        expect(game.results[round].level).toBe(round);
        await advance(t, DASH_RESULTS_MS);
      }
    }
    const game = await gameOf(t, roomId);
    expect(game.status).toBe("completed");
    expect(game.results).toHaveLength(5);
    // Four wins and a second place against four seconds and a win
    expect(Object.fromEntries(game.players.map((p) => [p.participantId, p.score]))).toEqual({ [hostId]: 48, [guest]: 42 });
    // Nobody's place is kept once the tournament is over
    expect(await t.query(api.dash.getRacers, { gameId })).toEqual([]);

    const messages = await t.query(api.messages.getRoomMessages, { roomId });
    const summary = messages.find((m) => m.text?.startsWith("emoji_match_summary:"));
    expect(JSON.parse(summary!.text!.slice("emoji_match_summary:".length))).toEqual({
      gameType: DASH_SUMMARY_GAME_TYPE,
      cancelled: false,
      games: [
        {
          players: [
            { name: "Host", avatar: expect.any(String), score: 48, isWinner: true },
            { name: "Aki", avatar: expect.any(String), score: 42, isWinner: false },
          ],
          totalPairs: 5,
          isTie: false,
        },
      ],
    });
    // No "game:" start line: a build from before this game would name it as another
    expect(messages.some((m) => m.text?.startsWith("game:"))).toBe(false);
  });

  test("playing again opens a lobby with whoever is here, and its result joins the same line in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    for (let round = 0; round < DASH_LEVEL_COUNT; round++) {
      await raceRound(t, gameId, hostId, guestIds[0], round);
      await advance(t, DASH_RESULTS_MS);
    }
    expect((await gameOf(t, roomId)).status).toBe("completed");
    const again = await t.mutation(api.dash.playAgain, { gameId, participantId: guestIds[0] });
    const lobby = await gameOf(t, roomId);
    expect(lobby).toMatchObject({ _id: again, status: "lobby", hostParticipantId: guestIds[0] });
    expect(lobby.players[0].participantId).toBe(guestIds[0]);
    await expect(t.mutation(api.dash.playAgain, { gameId, participantId: hostId })).rejects.toThrow(/already in progress/);

    await t.mutation(api.dash.startGame, { gameId: again, participantId: guestIds[0] });
    await advance(t, DASH_COUNTDOWN_MS + 30_000);
    await say(t, again, guestIds[0], 0, 0.9);
    await t.mutation(api.dash.finish, { gameId: again, participantId: guestIds[0], round: 0 });
    await t.mutation(api.dash.cancelGame, { gameId: again, participantId: guestIds[0] });
    const summaries = (await t.query(api.messages.getRoomMessages, { roomId })).filter((m) => m.text?.startsWith("emoji_match_summary:"));
    expect(summaries).toHaveLength(1);
    const data = JSON.parse(summaries[0].text!.slice("emoji_match_summary:".length));
    expect(data.games).toHaveLength(2);
    expect(data.cancelled).toBe(true);
  });

  test("the game's host or the room's host ends it; a lobby that is ended leaves nothing in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await openLobby(t);
    await t.mutation(api.dash.cancelGame, { gameId, participantId: hostId });
    expect((await gameOf(t, roomId)).status).toBe("canceled");
    await expect(t.mutation(api.dash.cancelGame, { gameId, participantId: hostId })).rejects.toThrow(/cannot be canceled/);
    expect((await t.query(api.messages.getRoomMessages, { roomId })).some((m) => m.text?.startsWith("emoji_match_summary:"))).toBe(false);

    // A guest's own game, ended by the room's host
    const guestGame = await t.mutation(api.dash.createLobby, { roomId, hostParticipantId: guestIds[0] });
    await t.mutation(api.dash.cancelGame, { gameId: guestGame, participantId: hostId });
    expect((await gameOf(t, roomId)).status).toBe("canceled");
  });

  test("the host skips the wait after a round: the next course starts at once, and the wait's own call changes nothing", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    await raceRound(t, gameId, hostId, guestIds[0], 0);
    expect((await gameOf(t, roomId)).status).toBe("results");
    await advance(t, 2000);
    await t.mutation(api.dash.skipResults, { gameId, participantId: hostId });
    const startsAt = Date.now() + DASH_COUNTDOWN_MS;
    let game = await gameOf(t, roomId);
    expect(game).toMatchObject({ status: "racing", round: 1, finishes: [], roundStartsAt: startsAt });
    expect(game.nextAt).toBeUndefined();
    // A second press, and then the call that was scheduled for the end of the wait
    await t.mutation(api.dash.skipResults, { gameId, participantId: hostId });
    await advance(t, DASH_RESULTS_MS);
    game = await gameOf(t, roomId);
    expect(game).toMatchObject({ status: "racing", round: 1, roundStartsAt: startsAt });
    expect(game.results).toHaveLength(1);
  });

  test("a room that closes between two rounds ends the tournament", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds, gameId } = await started(t);
    await raceRound(t, gameId, hostId, guestIds[0], 0);
    expect((await gameOf(t, roomId)).status).toBe("results");
    await t.mutation(api.rooms.closeRoom, { roomId });
    await advance(t, DASH_RESULTS_MS);
    expect((await gameOf(t, roomId)).status).toBe("canceled");
  });
});

describe("who may act", () => {
  test("enforce: a racer's place, finish and seat need that racer's token", async () => {
    const t = newBackend();
    const HOST = tokenFor(1);
    const GUEST = tokenFor(2);
    const { roomId, hostId } = await createRoom(t, { hostToken: HOST });
    const guestId = await joinGuest(t, roomId, "Aki", { token: GUEST });
    vi.stubEnv("AUTH_MODE", "enforce");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const gameId = await t.mutation(api.dash.createLobby, { roomId, hostParticipantId: hostId, token: HOST });
    await expect(t.mutation(api.dash.joinLobby, { gameId, participantId: guestId, token: HOST })).rejects.toThrow(/Not authorised/);
    await t.mutation(api.dash.joinLobby, { gameId, participantId: guestId, token: GUEST });
    await expect(t.mutation(api.dash.startGame, { gameId, participantId: hostId })).rejects.toThrow(/Not authorised/);
    await t.mutation(api.dash.startGame, { gameId, participantId: hostId, token: HOST });
    const where = { gameId, participantId: guestId, round: 0, x: 0, y: 0, z: 0, m: 0, g: true, p: 0.5, rt: 1 };
    await expect(t.mutation(api.dash.pushState, { ...where, token: HOST })).rejects.toThrow(/Not authorised/);
    await t.mutation(api.dash.pushState, { ...where, token: GUEST });
    await advance(t, DASH_COUNTDOWN_MS + 20_000);
    await expect(t.mutation(api.dash.finish, { gameId, participantId: guestId, round: 0, token: HOST })).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(api.dash.cancelGame, { gameId, participantId: guestId, token: GUEST })).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(api.dash.skipResults, { gameId, participantId: guestId, token: GUEST })).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(api.dash.clock, { participantId: guestId })).rejects.toThrow(/Not authorised/);
    expect(await t.mutation(api.dash.clock, { participantId: guestId, token: GUEST })).toEqual({ now: Date.now() });
  });
});

describe("the routes the iPhone app calls", () => {
  const post = async (t: Backend, path: string, body: unknown) => {
    const response = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };

  test("open a lobby and see it; the room without a game answers that there is none", async () => {
    const t = newBackend();
    const { roomId, hostId } = await createRoom(t);
    expect(await post(t, "/api/dash/active", { roomId })).toEqual({ status: 200, body: { ok: true } });
    const made = await post(t, "/api/dash/create-lobby", { roomId, hostParticipantId: hostId });
    expect(made.status).toBe(200);
    const gameId = made.body.gameId as GameId;
    expect((await post(t, "/api/dash/active", { roomId })).body).toMatchObject({ _id: gameId, status: "lobby" });
    await t.mutation(api.dash.cancelGame, { gameId, participantId: hostId });
    expect((await post(t, "/api/dash/active", { roomId })).body).toMatchObject({ status: "canceled" });
    expect((await post(t, "/api/dash/create-lobby", { roomId: "nope", hostParticipantId: hostId })).status).toBe(400);
  });
});
