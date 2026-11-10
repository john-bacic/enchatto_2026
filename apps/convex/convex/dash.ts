import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { authFail, isPresent, requireCaller } from "./participants";

// Chatto Dash: an obstacle race through five courses, drawn from the ten there are. The server keeps the
// tournament: who is in, which courses it runs, which round is on, when its start signal is, who has crossed
// the line and the points. Of the courses themselves it knows only how many there are. Every obstacle is a function of the time since the start signal (apps/web/lib/dash),
// so each device works out the same course for itself, and a racer's own device says where that racer is
// (pushState) and that they have finished (finish). The time on a finish is the server's own clock.

type Game = Doc<"dashGames">;

/** Courses in a tournament */
export const DASH_LEVEL_COUNT = 5;
/** Courses there are to draw from: the levels in apps/web/lib/dash/levels, each known here by its place there */
export const DASH_COURSE_COUNT = 10;
/**
 * From a round being set up to its start signal: the level's card for a couple of seconds, then 3, 2, 1
 * (components/dash/race.tsx shows the card until 3.2 s before the signal). It was 8 s, which felt slow
 */
export const DASH_COUNTDOWN_MS = 5000;
/** A round ends this long after its start signal, whoever is still out on the course */
export const DASH_ROUND_LIMIT_MS = 150_000;
/** Once someone has crossed the line the others have this long left */
export const DASH_GRACE_MS = 30_000;
/** How long the round's results are up before the next round is set up */
export const DASH_RESULTS_MS = 10_000;
/** Nobody crosses a line sooner than this after the start signal */
const MIN_FINISH_MS = 8000;
const MAX_PLAYERS = 30;
/** A racer whose device has said nothing for this long is not waited for */
const SILENT_MS = 12_000;
/** Points for first, second, third and so on. Everyone who finishes gets at least one; nobody else gets any */
const POINTS = [10, 8, 6, 5, 4, 3, 2];

const SUMMARY_PREFIX = "emoji_match_summary:";
export const DASH_SUMMARY_GAME_TYPE = "Chatto Dash";

const LIVE = ["lobby", "racing", "results"] as const;

/**
 * The room's newest game, whatever state it is in. A room has one game under way at a time, and no lobby
 * is opened while one is, so a game that is under way is always the newest. One index range, one row.
 */
async function latestGame(ctx: QueryCtx | MutationCtx, roomId: Id<"rooms">): Promise<Game | null> {
  return await ctx.db
    .query("dashGames")
    .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
    .order("desc")
    .first();
}

async function liveGame(ctx: QueryCtx | MutationCtx, roomId: Id<"rooms">): Promise<Game | null> {
  const game = await latestGame(ctx, roomId);
  return game && (LIVE as readonly string[]).includes(game.status) ? game : null;
}

/**
 * The courses of a tournament: five of the ten, in an order of their own. The ones in `last` (the courses of
 * the tournament before) come up only when nothing else is left, so two tournaments in a row run all ten.
 * Drawn when the lobby opens, so that the lobby can name them.
 */
function drawCourses(last: number[] = []): number[] {
  const shuffled = (list: number[]) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const all = Array.from({ length: DASH_COURSE_COUNT }, (_, i) => i);
  const fresh = all.filter((i) => !last.includes(i));
  const seen = all.filter((i) => last.includes(i));
  return [...shuffled(fresh), ...shuffled(seen)].slice(0, DASH_LEVEL_COUNT);
}

function seat(participant: Doc<"participants">, now: number) {
  return {
    participantId: participant._id,
    nickname: participant.nickname,
    avatarValue: participant.avatar.value,
    joinedAt: now,
    score: 0,
  };
}

// ─── The chat's record of a tournament ───────────────────────────────────────
// Under the prefix and in the shape Emoji Match, Emoji Bingo and Word Rush use, told apart by gameType:
// builds from before this game draw it as a game they do not know by name, with its scores.

async function postSummary(ctx: MutationCtx, game: Game, cancelled: boolean) {
  const top = Math.max(0, ...game.players.map((p) => p.score));
  const round = {
    players: game.players.map((p) => ({
      name: p.nickname,
      avatar: p.avatarValue,
      score: p.score,
      isWinner: top > 0 && p.score === top,
    })),
    totalPairs: game.results.length,
    isTie: top > 0 && game.players.filter((p) => p.score === top).length > 1,
  };
  const systemMessages = await ctx.db
    .query("messages")
    .withIndex("by_roomId_kind_createdAt", (q) => q.eq("roomId", game.roomId).eq("kind", "system"))
    .order("desc")
    .collect();
  for (const m of systemMessages) {
    if (!m.text?.startsWith(SUMMARY_PREFIX)) continue;
    let data: any;
    try {
      data = JSON.parse(m.text.slice(SUMMARY_PREFIX.length));
    } catch {
      continue;
    }
    if (!data || typeof data !== "object" || data.gameType !== DASH_SUMMARY_GAME_TYPE) continue;
    const games = Array.isArray(data.games) ? data.games : [];
    await ctx.db.patch(m._id, {
      text: `${SUMMARY_PREFIX}${JSON.stringify({ gameType: DASH_SUMMARY_GAME_TYPE, cancelled, games: [...games, round] })}`,
      createdAt: Date.now(),
    });
    return;
  }
  await ctx.db.insert("messages", {
    roomId: game.roomId,
    senderId: game.hostParticipantId,
    kind: "system",
    status: "processed",
    text: `${SUMMARY_PREFIX}${JSON.stringify({ gameType: DASH_SUMMARY_GAME_TYPE, cancelled, games: [round] })}`,
    createdAt: Date.now(),
  });
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

export const createLobby = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");
    await requireCaller(ctx, args.hostParticipantId, args.token, "dash.createLobby");
    const participant = await ctx.db.get(args.hostParticipantId);
    if (!participant || participant.roomId !== args.roomId) throw new Error("Participant not in this room");
    const before = await latestGame(ctx, args.roomId);
    if (before && (LIVE as readonly string[]).includes(before.status)) throw new Error("A Chatto Dash game is already in progress");

    const now = Date.now();
    return await ctx.db.insert("dashGames", {
      roomId: args.roomId,
      status: "lobby",
      hostParticipantId: args.hostParticipantId,
      players: [seat(participant, now)],
      levels: drawCourses(before?.levels),
      round: 0,
      finishes: [],
      results: [],
      createdAt: now,
    });
  },
});

export const joinLobby = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    await requireCaller(ctx, args.participantId, args.token, "dash.joinLobby");
    if (game.players.some((p) => p.participantId === args.participantId)) return;
    if (game.players.length >= MAX_PLAYERS) throw new Error(`Lobby is full (max ${MAX_PLAYERS} players)`);
    const participant = await ctx.db.get(args.participantId);
    if (!participant || participant.roomId !== game.roomId) throw new Error("Participant not in this room");
    await ctx.db.patch(args.gameId, { players: [...game.players, seat(participant, Date.now())] });
  },
});

export const leaveLobby = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    await requireCaller(ctx, args.participantId, args.token, "dash.leaveLobby");
    const remaining = game.players.filter((p) => p.participantId !== args.participantId);
    if (game.hostParticipantId !== args.participantId) {
      await ctx.db.patch(args.gameId, { players: remaining });
    } else if (remaining.length === 0) {
      await ctx.db.patch(args.gameId, { status: "canceled", players: [], endedAt: Date.now() });
    } else {
      await ctx.db.patch(args.gameId, { hostParticipantId: remaining[0].participantId, players: remaining });
    }
  },
});

export const startGame = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    await requireCaller(ctx, args.participantId, args.token, "dash.startGame");
    if (game.hostParticipantId !== args.participantId) throw new Error("Only the host can start the game");
    if (game.players.length < 1) throw new Error("Need at least 1 player to start");
    const room = await ctx.db.get(game.roomId);
    if (!room || room.status === "closed") throw new Error("Room is closed");

    const now = Date.now();
    const roundStartsAt = now + DASH_COUNTDOWN_MS;
    await ctx.db.patch(args.gameId, {
      status: "racing",
      // A lobby opened by the functions from before the courses were drawn has none yet
      levels: game.levels.length > 0 ? game.levels : drawCourses(),
      round: 0,
      roundStartsAt,
      roundEndsAt: roundStartsAt + DASH_ROUND_LIMIT_MS,
      finishes: [],
      results: [],
      players: game.players.map((p) => ({ ...p, score: 0 })),
      startedAt: now,
    });
    await ctx.scheduler.runAt(roundStartsAt + DASH_ROUND_LIMIT_MS, internal.dash.internalEndRound, { gameId: args.gameId, round: 0 });
  },
});

export const cancelGame = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!(LIVE as readonly string[]).includes(game.status)) throw new Error("Game cannot be canceled");
    const caller = await requireCaller(ctx, args.participantId, args.token, "dash.cancelGame");
    const isRoomHost = caller?.role === "host" && caller.roomId === game.roomId;
    if (caller && game.hostParticipantId !== args.participantId && !isRoomHost) {
      authFail("dash.cancelGame", "not the host");
    }
    await ctx.db.patch(args.gameId, { status: "canceled", endedAt: Date.now() });
    // A tournament stopped after a round or more still has points worth keeping in the chat
    if (game.results.length > 0) await postSummary(ctx, game, true);
  },
});

export const playAgain = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    await requireCaller(ctx, args.participantId, args.token, "dash.playAgain");
    const room = await ctx.db.get(game.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");
    if (await liveGame(ctx, game.roomId)) throw new Error("A Chatto Dash game is already in progress");
    const participant = await ctx.db.get(args.participantId);
    if (!participant || participant.roomId !== game.roomId) throw new Error("Participant not in this room");

    // The caller, then whoever of the last game's players is here right now; anyone else can tap Join
    const now = Date.now();
    const players = [seat(participant, now)];
    for (const old of game.players) {
      if (old.participantId === args.participantId) continue;
      const p = await ctx.db.get(old.participantId);
      if (p && p.roomId === game.roomId && isPresent(p, now)) players.push(seat(p, now));
    }
    return await ctx.db.insert("dashGames", {
      roomId: game.roomId,
      status: "lobby",
      hostParticipantId: args.participantId,
      players,
      levels: drawCourses(game.levels),
      round: 0,
      finishes: [],
      results: [],
      createdAt: now,
    });
  },
});

// ─── A round ─────────────────────────────────────────────────────────────────

/**
 * Closes the round that is on: places everyone, adds the points, and either puts the results up for a
 * while or, after the last round, ends the tournament. Those who crossed the line are placed by their
 * time; the rest by how far down the course their device last said they were, with no points.
 */
async function endRound(ctx: MutationCtx, game: Game) {
  const now = Date.now();
  const racers = await ctx.db
    .query("dashRacers")
    .withIndex("by_game", (q) => q.eq("gameId", game._id))
    .collect();
  const progressOf = (id: Id<"participants">) => {
    const row = racers.find((r) => r.participantId === id && r.round === game.round);
    return row ? Math.max(0, Math.min(1, row.p)) : 0;
  };
  const finished = [...game.finishes].sort((a, b) => a.ms - b.ms);
  const rest = game.players
    .filter((p) => !finished.some((f) => f.participantId === p.participantId))
    .map((p) => ({ participantId: p.participantId, progress: progressOf(p.participantId) }))
    .sort((a, b) => b.progress - a.progress);
  const rows = [
    ...finished.map((f, i) => ({
      participantId: f.participantId,
      ms: f.ms,
      progress: 1,
      place: i + 1,
      points: POINTS[i] ?? 1,
    })),
    ...rest.map((r, i) => ({
      participantId: r.participantId,
      progress: r.progress,
      place: finished.length + i + 1,
      points: 0,
    })),
  ];
  const players = game.players.map((p) => ({
    ...p,
    score: p.score + (rows.find((r) => r.participantId === p.participantId)?.points ?? 0),
  }));
  const results = [...game.results, { level: game.levels[game.round] ?? game.round, rows }];
  const last = game.round + 1 >= game.levels.length;
  if (last) {
    await ctx.db.patch(game._id, { status: "completed", players, results, endedAt: now });
    await postSummary(ctx, { ...game, players, results }, false);
    for (const r of racers) await ctx.db.delete(r._id);
  } else {
    await ctx.db.patch(game._id, { status: "results", players, results, nextAt: now + DASH_RESULTS_MS });
    await ctx.scheduler.runAfter(DASH_RESULTS_MS, internal.dash.internalNextRound, { gameId: game._id, round: game.round });
  }
}

export const internalEndRound = internalMutation({
  args: { gameId: v.id("dashGames"), round: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "racing" || game.round !== args.round) return;
    // This was scheduled for the round's end as it stood then; a first finish moves the end earlier and
    // schedules its own call, so the one that comes at the right time is the one that acts
    if (Date.now() < (game.roundEndsAt ?? 0) - 250) return;
    await endRound(ctx, game);
  },
});

/** Takes a game that is showing a round's results on to the next round's countdown */
async function nextRound(ctx: MutationCtx, game: Game) {
  const room = await ctx.db.get(game.roomId);
  if (!room || room.status === "closed") {
    await ctx.db.patch(game._id, { status: "canceled", endedAt: Date.now() });
    return;
  }
  const round = game.round + 1;
  const roundStartsAt = Date.now() + DASH_COUNTDOWN_MS;
  await ctx.db.patch(game._id, {
    status: "racing",
    round,
    roundStartsAt,
    roundEndsAt: roundStartsAt + DASH_ROUND_LIMIT_MS,
    finishes: [],
    nextAt: undefined,
  });
  await ctx.scheduler.runAt(roundStartsAt + DASH_ROUND_LIMIT_MS, internal.dash.internalEndRound, { gameId: game._id, round });
}

export const internalNextRound = internalMutation({
  args: { gameId: v.id("dashGames"), round: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "results" || game.round !== args.round) return;
    await nextRound(ctx, game);
  },
});

/**
 * The host has seen enough of a round's results: the next course's countdown starts now, for everyone, and
 * not when the results' time is up. The call scheduled for then finds the game racing and does nothing.
 * Pressed when the results are no longer up (twice, or as their time ran out), it does nothing either.
 */
export const skipResults = mutation({
  args: { gameId: v.id("dashGames"), participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    const caller = await requireCaller(ctx, args.participantId, args.token, "dash.skipResults");
    const isRoomHost = caller?.role === "host" && caller.roomId === game.roomId;
    if (caller && game.hostParticipantId !== args.participantId && !isRoomHost) {
      authFail("dash.skipResults", "not the host");
    }
    if (game.status !== "results") return;
    await nextRound(ctx, game);
  },
});

/**
 * Where a racer is, said by their own device a few times a second. One row per racer, written over each
 * time. Answers the server's clock: the device keeps its own in step with it from these answers, which is
 * how every device agrees on where the obstacles are.
 */
export const pushState = mutation({
  args: {
    gameId: v.id("dashGames"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
    round: v.number(),
    x: v.number(),
    y: v.number(),
    z: v.number(),
    /** The racer's mode (apps/web/lib/dash/types.ts: MODE_) */
    m: v.number(),
    g: v.boolean(),
    /** Share of the course behind them, 0 to 1 */
    p: v.number(),
    /** Seconds since the start signal by the racer's own reckoning, when this was true */
    rt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "racing" || game.round !== args.round) return { now };
    if (!game.players.some((p) => p.participantId === args.participantId)) return { now };
    await requireCaller(ctx, args.participantId, args.token, "dash.pushState");
    for (const n of [args.x, args.y, args.z, args.p, args.rt, args.m]) {
      if (!Number.isFinite(n) || Math.abs(n) > 100_000) throw new Error("Not a position");
    }
    const row = {
      gameId: args.gameId,
      participantId: args.participantId,
      round: args.round,
      x: args.x,
      y: args.y,
      z: args.z,
      m: args.m,
      g: args.g,
      p: args.p,
      rt: args.rt,
      updatedAt: now,
    };
    const existing = await ctx.db
      .query("dashRacers")
      .withIndex("by_game_participant", (q) => q.eq("gameId", args.gameId).eq("participantId", args.participantId))
      .first();
    if (existing) await ctx.db.replace(existing._id, row);
    else await ctx.db.insert("dashRacers", row);
    return { now };
  },
});

/**
 * The server's clock, for a device that has no pushState answers to read it from: before the first round,
 * and for someone watching. A mutation, not a query: a query's answer is kept and handed out again.
 */
export const clock = mutation({
  args: { participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "dash.clock");
    return { now: Date.now() };
  },
});

export const finish = mutation({
  args: {
    gameId: v.id("dashGames"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
    round: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "racing" || game.round !== args.round) return null;
    await requireCaller(ctx, args.participantId, args.token, "dash.finish");
    if (!game.players.some((p) => p.participantId === args.participantId)) throw new Error("Not in this game");
    const already = game.finishes.find((f) => f.participantId === args.participantId);
    if (already) return { ms: already.ms };
    const now = Date.now();
    const ms = now - (game.roundStartsAt ?? now);
    if (ms < MIN_FINISH_MS) throw new Error("The race has only just started");

    const finishes = [...game.finishes, { participantId: args.participantId, ms }];
    const patch: Partial<Game> = { finishes };
    if (game.finishes.length === 0 && now + DASH_GRACE_MS < (game.roundEndsAt ?? Infinity)) {
      patch.roundEndsAt = now + DASH_GRACE_MS;
      await ctx.scheduler.runAt(now + DASH_GRACE_MS, internal.dash.internalEndRound, { gameId: game._id, round: game.round });
    }
    await ctx.db.patch(game._id, patch);

    // Nobody left to wait for? Those still out are the ones whose devices are still talking
    const racers = await ctx.db
      .query("dashRacers")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .collect();
    const stillOut = game.players.some((p) => {
      if (finishes.some((f) => f.participantId === p.participantId)) return false;
      const row = racers.find((r) => r.participantId === p.participantId);
      return !!row && row.round === game.round && now - row.updatedAt < SILENT_MS;
    });
    if (!stillOut) await endRound(ctx, { ...game, ...patch } as Game);
    return { ms };
  },
});

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * The room's Chatto Dash game: the one in progress, else the one that ended last (for its results), else
 * null. Asked by the host app with every refresh and held open by every web guest.
 */
export const getActiveDash = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => await latestGame(ctx, args.roomId),
});

/** Where every racer of a game last said they were. Asked for a few times a second during a round, by each device */
export const getRacers = query({
  args: { gameId: v.id("dashGames") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("dashRacers")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    return rows.map((r) => ({ id: r.participantId, round: r.round, x: r.x, y: r.y, z: r.z, m: r.m, g: r.g, p: r.p, rt: r.rt }));
  },
});
