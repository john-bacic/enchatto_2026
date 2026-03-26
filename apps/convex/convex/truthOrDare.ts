import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── Prompt pools ───────────────────────────────────────────────────────────

type Prompt = {
  id: string;
  mode: "truth" | "dare";
  responseType: "text" | "photo" | "drawing";
  en: string;
  ja: string;
};

const TRUTH_PROMPTS: Prompt[] = [
  { id: "t1", mode: "truth", responseType: "text", en: "What is your favorite food?", ja: "好きな食べ物はなに？" },
  { id: "t2", mode: "truth", responseType: "text", en: "What is your favorite animal?", ja: "いちばん好きな動物は？" },
  { id: "t3", mode: "truth", responseType: "text", en: "What place would you love to visit?", ja: "行ってみたい場所はどこ？" },
  { id: "t4", mode: "truth", responseType: "text", en: "What makes you laugh?", ja: "何をすると笑っちゃう？" },
  { id: "t5", mode: "truth", responseType: "text", en: "What is your favorite movie?", ja: "好きな映画は？" },
  { id: "t6", mode: "truth", responseType: "text", en: "What is something you are proud of?", ja: "自分の好きなところをひとつ教えて" },
  { id: "t7", mode: "truth", responseType: "text", en: "What skill do you want to learn?", ja: "覚えてみたいことは？" },
  { id: "t8", mode: "truth", responseType: "text", en: "What is your dream job?", ja: "将来やってみたい仕事は？" },
  { id: "t9", mode: "truth", responseType: "text", en: "What is your favorite season?", ja: "好きな季節は？" },
  { id: "t10", mode: "truth", responseType: "text", en: "What game do you like most?", ja: "いちばん好きなゲームは？" },
];

const DARE_TEXT_PROMPTS: Prompt[] = [
  { id: "dt1", mode: "dare", responseType: "text", en: "Say hello in another language.", ja: "ほかの言語で「こんにちは」と言ってみよう" },
  { id: "dt2", mode: "dare", responseType: "text", en: "Describe your day in 3 words.", ja: "今日の気分を3つの言葉で言ってみよう" },
  { id: "dt3", mode: "dare", responseType: "text", en: "Use only emojis to describe your mood.", ja: "絵文字だけで今の気分を表してみよう" },
  { id: "dt4", mode: "dare", responseType: "text", en: "Write a silly sentence.", ja: "おもしろい文をひとつ書いてみよう" },
  { id: "dt5", mode: "dare", responseType: "text", en: "Name 3 foods quickly.", ja: "食べ物を3つすばやく言ってみよう" },
];

const DARE_PHOTO_PROMPTS: Prompt[] = [
  { id: "dp1", mode: "dare", responseType: "photo", en: "Take a photo of something red.", ja: "赤いものを写真で見せて" },
  { id: "dp2", mode: "dare", responseType: "photo", en: "Show something that makes you happy.", ja: "うれしくなるものを写真で見せて" },
  { id: "dp3", mode: "dare", responseType: "photo", en: "Take a photo of your favorite nearby object.", ja: "近くにある好きなものを写真で送って" },
  { id: "dp4", mode: "dare", responseType: "photo", en: "Find something soft and take a photo.", ja: "やわらかいものを見つけて写真を送って" },
];

const DARE_DRAWING_PROMPTS: Prompt[] = [
  { id: "dd1", mode: "dare", responseType: "drawing", en: "Draw a cat.", ja: "ねこを描いてみよう" },
  { id: "dd2", mode: "dare", responseType: "drawing", en: "Draw your mood.", ja: "今の気分を絵で描いてみよう" },
  { id: "dd3", mode: "dare", responseType: "drawing", en: "Draw your favorite food.", ja: "好きな食べ物を描いてみよう" },
  { id: "dd4", mode: "dare", responseType: "drawing", en: "Draw a monster.", ja: "モンスターを描いてみよう" },
  { id: "dd5", mode: "dare", responseType: "drawing", en: "Draw something the room can guess.", ja: "みんなが当てられる絵を描いてみよう" },
];

const ALL_DARE_PROMPTS = [...DARE_TEXT_PROMPTS, ...DARE_PHOTO_PROMPTS, ...DARE_DRAWING_PROMPTS];

function pickRandomPrompt(mode: "truth" | "dare", usedIds: string[]): Prompt {
  const pool = mode === "truth" ? TRUTH_PROMPTS : ALL_DARE_PROMPTS;
  const available = pool.filter((p) => !usedIds.includes(p.id));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export const createGame = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    // Get online participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const onlinePlayers = participants.filter((p) => p.online && !p.departed);
    if (onlinePlayers.length < 2) throw new Error("Need at least 2 players");

    // Shuffle player order
    const playerIds = onlinePlayers.map((p) => p._id);
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    const now = Date.now();

    // Post system message (only if no existing truth_or_dare system message in room)
    const existingMessages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const hasExistingStart = existingMessages.some(
      (m) => m.kind === "system" && m.text === "game:Truth or Dare"
    );
    if (!hasExistingStart) {
      await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: args.hostParticipantId,
        kind: "system",
        status: "processed",
        text: "game:Truth or Dare",
        createdAt: now,
      });
    }

    // Create game
    const gameId = await ctx.db.insert("truthOrDareGames", {
      roomId: args.roomId,
      status: "active",
      hostParticipantId: args.hostParticipantId,
      playerOrder: playerIds,
      currentTurnIndex: 0,
      currentTurnParticipantId: playerIds[0],
      createdAt: now,
    });

    // Create first turn
    await ctx.db.insert("truthOrDareTurns", {
      gameId,
      turnIndex: 0,
      participantId: playerIds[0],
      status: "waiting_for_choice",
      createdAt: now,
    });

    return gameId;
  },
});

export const submitChoice = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    choice: v.union(v.literal("truth"), v.literal("dare")),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Find current turn
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) => t.turnIndex === game.currentTurnIndex && t.status === "waiting_for_choice"
    );
    if (!currentTurn) throw new Error("No active turn found");

    // Pick a prompt, avoiding recently used ones
    const usedIds = turns
      .filter((t) => t.promptId)
      .map((t) => t.promptId!);
    const prompt = pickRandomPrompt(args.choice, usedIds);

    await ctx.db.patch(currentTurn._id, {
      choice: args.choice,
      promptId: prompt.id,
      promptText: JSON.stringify({ en: prompt.en, ja: prompt.ja }),
      promptResponseType: prompt.responseType,
      status: "waiting_for_response",
    });
  },
});

export const submitResponse = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    responseText: v.optional(v.string()),
    responseMediaUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Find current turn
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) => t.turnIndex === game.currentTurnIndex && t.status === "waiting_for_response"
    );
    if (!currentTurn) throw new Error("No active turn waiting for response");

    await ctx.db.patch(currentTurn._id, {
      responseText: args.responseText,
      responseMediaUrl: args.responseMediaUrl,
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const advanceTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;

    // Only host can advance
    const host = await ctx.db.get(game.hostParticipantId);
    const caller = await ctx.db.get(args.participantId);
    if (!caller) throw new Error("Participant not found");
    // Allow room host or game host
    if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
      throw new Error("Only the host can advance turns");
    }

    // Get online players to skip disconnected ones
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", game.roomId))
      .collect();
    const onlineIds = new Set(
      participants.filter((p) => p.online && !p.departed).map((p) => p._id.toString())
    );

    // Find next online player
    let nextIndex = game.currentTurnIndex + 1;
    let attempts = 0;
    while (attempts < game.playerOrder.length) {
      const wrappedIndex = nextIndex % game.playerOrder.length;
      if (onlineIds.has(game.playerOrder[wrappedIndex].toString())) {
        const now = Date.now();
        await ctx.db.patch(args.gameId, {
          currentTurnIndex: wrappedIndex,
          currentTurnParticipantId: game.playerOrder[wrappedIndex],
        });
        await ctx.db.insert("truthOrDareTurns", {
          gameId: args.gameId,
          turnIndex: wrappedIndex,
          participantId: game.playerOrder[wrappedIndex],
          status: "waiting_for_choice",
          createdAt: now,
        });
        return;
      }
      nextIndex++;
      attempts++;
    }

    // No online players left — end game
    await ctx.db.patch(args.gameId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const skipTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Mark current turn as skipped
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) =>
        t.turnIndex === game.currentTurnIndex &&
        (t.status === "waiting_for_choice" || t.status === "waiting_for_response")
    );
    if (currentTurn) {
      await ctx.db.patch(currentTurn._id, {
        status: "skipped",
        completedAt: Date.now(),
      });
    }
  },
});

export const submitRating = mutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    participantId: v.id("participants"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.score < 1 || args.score > 10 || (args.score * 2) % 1 !== 0) throw new Error("Score must be 1-10 in 0.5 increments");

    const turn = await ctx.db.get(args.turnId);
    if (!turn) throw new Error("Turn not found");
    if (turn.status !== "completed") throw new Error("Turn not completed yet");

    // Don't let the active player rate themselves
    if (turn.participantId === args.participantId) return;

    const ratings = turn.ratings ?? [];
    // Replace existing rating from this participant
    const filtered = ratings.filter((r) => r.participantId !== args.participantId);
    filtered.push({ participantId: args.participantId, score: args.score });

    await ctx.db.patch(args.turnId, { ratings: filtered });
  },
});

export const endGame = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;

    // Mark as completed if still active
    if (game.status === "active") {
      await ctx.db.patch(args.gameId, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    // Always compute and post summary
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", game.roomId))
      .collect();

    const playerScores: Record<string, { total: number; count: number }> = {};
    let totalCompletedTurns = 0;
    for (const t of turns) {
      if (t.status === "completed") totalCompletedTurns++;
      const ratings = t.ratings ?? [];
      if (ratings.length === 0) continue;
      const pid = t.participantId.toString();
      const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
      if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
      playerScores[pid].total += avg;
      playerScores[pid].count += 1;
    }

    const playerSummaries = game.playerOrder.map((pid) => {
      const p = participants.find((pp) => pp._id === pid);
      const scores = playerScores[pid.toString()];
      return {
        name: p?.nickname ?? "?",
        avatar: p?.avatar?.value ?? "cat",
        avgRating: scores ? Math.round((scores.total / scores.count) * 10) / 10 : null,
        turnsRated: scores?.count ?? 0,
      };
    });

    const summaryData = {
      gameType: "Truth or Dare",
      totalTurns: totalCompletedTurns,
      players: playerSummaries,
    };

    await ctx.db.insert("messages", {
      roomId: game.roomId,
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `truth_or_dare_summary:${JSON.stringify(summaryData)}`,
      createdAt: Date.now(),
    });
  },
});

// Post summary for a completed game (can be called by any participant)
export const postSummary = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    // Find the most recently completed game
    const allGames = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const game = allGames
      .filter((g) => g.status === "completed")
      .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))[0];
    if (!game) return;

    // Check if summary already posted
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const hasSummary = messages.some(
      (m) => m.kind === "system" && m.text?.startsWith("truth_or_dare_summary:")
        && m.createdAt >= game.createdAt
    );
    if (hasSummary) return;

    // Compute and post
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const playerScores: Record<string, { total: number; count: number }> = {};
    let totalCompletedTurns = 0;
    for (const t of turns) {
      if (t.status === "completed") totalCompletedTurns++;
      const ratings = t.ratings ?? [];
      if (ratings.length === 0) continue;
      const pid = t.participantId.toString();
      const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
      if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
      playerScores[pid].total += avg;
      playerScores[pid].count += 1;
    }

    const playerSummaries = game.playerOrder.map((pid) => {
      const p = participants.find((pp) => pp._id === pid);
      const scores = playerScores[pid.toString()];
      return {
        name: p?.nickname ?? "?",
        avatar: p?.avatar?.value ?? "cat",
        avgRating: scores ? Math.round((scores.total / scores.count) * 10) / 10 : null,
        turnsRated: scores?.count ?? 0,
      };
    });

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `truth_or_dare_summary:${JSON.stringify({
        gameType: "Truth or Dare",
        totalTurns: totalCompletedTurns,
        players: playerSummaries,
      })}`,
      createdAt: Date.now(),
    });
  },
});

// ─── Queries ────────────────────────────────────────────────────────────────

export const getActiveTruthOrDare = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Find active OR most recently completed game
    const allGames = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Prefer active, fall back to most recently completed
    const game = allGames.find((g) => g.status === "active")
      ?? allGames
          .filter((g) => g.status === "completed")
          .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))[0]
      ?? null;
    if (!game) return null;

    // Get all turns for this game
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    // Get current turn (latest for current turn index)
    const currentTurn = turns
      .filter((t) => t.turnIndex === game.currentTurnIndex)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

    // Get participants for display
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const playerInfo = game.playerOrder.map((pid) => {
      const p = participants.find((pp) => pp._id === pid);
      return {
        participantId: pid,
        nickname: p?.nickname ?? "?",
        avatarValue: p?.avatar?.value ?? "cat",
        online: p?.online ?? false,
      };
    });

    // All completed turns with ratings for the summary
    const completedTurnsList = turns
      .filter((t) => t.status === "completed")
      .map((t) => ({
        _id: t._id,
        participantId: t.participantId,
        choice: t.choice,
        promptText: t.promptText,
        responseText: t.responseText,
        responseMediaUrl: t.responseMediaUrl,
        ratings: t.ratings ?? [],
        completedAt: t.completedAt,
      }));

    return {
      ...game,
      currentTurn,
      completedTurns: completedTurnsList.length,
      completedTurnsList,
      totalTurns: turns.length,
      playerInfo,
    };
  },
});
