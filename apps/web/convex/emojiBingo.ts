import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── Trace helper ────────────────────────────────────────────────────────────

async function bingoTrace(
  ctx: any,
  gameId: Id<"emojiBingoGames">,
  action: string,
  participantId?: string,
  detail?: string,
) {
  try {
    await ctx.db.insert("bingoTrace", {
      gameId,
      action,
      participantId,
      detail: detail?.slice(0, 200),
      ts: Date.now(),
    });
  } catch {
    // never let tracing break gameplay
  }
}

// ─── Emoji pool (48 emojis) ─────────────────────────────────────────────────

const BINGO_EMOJI_POOL = [
  // Fruits (12)
  "🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🍒", "🥝", "🍌", "🍉", "🥭", "🫐",
  // Animals (12)
  "🐶", "🐱", "🐻", "🐼", "🐸", "🐵", "🦊", "🐰", "🐯", "🦁", "🐮", "🐷",
  // Sports (12)
  "⚽", "🏀", "🎾", "🏐", "🎱", "🏈", "⛳", "🎳", "🏓", "🥊", "🎯", "🏆",
  // Fun (12)
  "🌈", "🌸", "🔥", "💎", "🎵", "🎨", "🚀", "💡", "🎁", "🎈", "🎭", "🌙",
];

const FREE_SPACE = "⭐";
const TURN_TIMEOUT_MS = 10000; // 10 seconds to roll
const GRACE_ROLL_INTERVAL_MS = 3000; // auto-roll every 3s during grace period

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCard(): string[] {
  const selected = shuffleArray(BINGO_EMOJI_POOL).slice(0, 24);
  const card = [...selected.slice(0, 12), FREE_SPACE, ...selected.slice(12)];
  return card;
}

function getNextPlayer(
  turnOrder: string[],
  currentId: string,
): string {
  const idx = turnOrder.indexOf(currentId);
  return turnOrder[(idx + 1) % turnOrder.length];
}

/** Draw the next emoji from the deck and advance the turn. Returns the patch or null if deck exhausted. */
function drawAndAdvance(
  game: any,
): Record<string, any> | null {
  if (game.drawIndex >= game.drawDeck.length) return null;

  const emoji = game.drawDeck[game.drawIndex];
  const now = Date.now();
  const nextPlayer = getNextPlayer(game.turnOrder, game.currentTurnParticipantId);

  return {
    calledEmojis: [...game.calledEmojis, emoji],
    drawIndex: game.drawIndex + 1,
    currentTurnParticipantId: nextPlayer,
    turnStartedAt: now,
  };
}

// ─── Win pattern checking ────────────────────────────────────────────────────

const LINE_PATTERNS = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

const FOUR_CORNERS = [0, 4, 20, 24];

function checkWinPattern(
  markedCells: number[],
  winPattern: "line" | "four_corners" | "blackout",
): boolean {
  const marked = new Set(markedCells);
  if (winPattern === "line") {
    return LINE_PATTERNS.some((pattern) => pattern.every((i) => marked.has(i)));
  }
  if (winPattern === "four_corners") {
    return FOUR_CORNERS.every((i) => marked.has(i));
  }
  for (let i = 0; i < 25; i++) {
    if (!marked.has(i)) return false;
  }
  return true;
}

// ─── Summary helper ──────────────────────────────────────────────────────────
// Uses the SAME emoji_match_summary: format so the proven web renderer handles it.
// The gameType field distinguishes "Emoji Bingo" from "Match Emoji".

interface BingoRound {
  players: Array<{ name: string; avatar: string; marked: number; placement: number }>;
  winPattern: string;
}

async function upsertBingoSummary(
  ctx: any,
  roomId: Id<"rooms">,
  senderId: Id<"participants">,
  newRound: BingoRound,
  cancelled?: boolean,
) {
  // Convert bingo data to emoji_match_summary format:
  // players get score = marked, isWinner = placement === 1, totalPairs = 25
  const convertedRound = {
    players: newRound.players.map((p) => ({
      name: p.name,
      avatar: p.avatar,
      score: p.marked,
      isWinner: p.placement === 1,
    })),
    totalPairs: 25,
    isTie: false,
  };

  const allMessages = await ctx.db
    .query("messages")
    .withIndex("by_roomId_createdAt", (q: any) => q.eq("roomId", roomId))
    .order("desc")
    .collect();

  // Look for existing emoji_match_summary with gameType "Emoji Bingo", OR old emoji_bingo_summary
  const existing = allMessages.find(
    (m: any) => m.kind === "system" && (
      (m.text?.startsWith("emoji_match_summary:") && m.text?.includes('"Emoji Bingo"')) ||
      m.text?.startsWith("emoji_bingo_summary:")
    )
  );

  if (existing) {
    try {
      const prefix = existing.text.startsWith("emoji_match_summary:") ? "emoji_match_summary:" : "emoji_bingo_summary:";
      const oldData = JSON.parse(existing.text.slice(prefix.length));
      const games = oldData.games ?? [];
      games.push(convertedRound);
      const summaryData = { gameType: "Emoji Bingo", cancelled, games };
      await ctx.db.patch(existing._id, {
        text: `emoji_match_summary:${JSON.stringify(summaryData)}`,
        createdAt: Date.now(),
      });
      return;
    } catch {
      // fall through
    }
  }

  const summaryData = { gameType: "Emoji Bingo", cancelled, games: [convertedRound] };
  await ctx.db.insert("messages", {
    roomId,
    senderId,
    kind: "system",
    status: "processed",
    text: `emoji_match_summary:${JSON.stringify(summaryData)}`,
    createdAt: Date.now(),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export const createLobby = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
    winPattern: v.optional(v.union(v.literal("line"), v.literal("four_corners"), v.literal("blackout"))),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const participant = await ctx.db.get(args.hostParticipantId);
    if (!participant || participant.roomId !== args.roomId) {
      throw new Error("Participant not in this room");
    }

    for (const status of ["lobby", "active", "won"] as const) {
      const existing = await ctx.db
        .query("emojiBingoGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", args.roomId).eq("status", status)
        )
        .first();
      if (existing) throw new Error("An Emoji Bingo game is already in progress");
    }

    const now = Date.now();
    const gameId = await ctx.db.insert("emojiBingoGames", {
      roomId: args.roomId,
      status: "lobby",
      hostParticipantId: args.hostParticipantId,
      winPattern: args.winPattern ?? "line",
      callIntervalMs: GRACE_ROLL_INTERVAL_MS,
      turnOrder: [],
      turnTimeoutMs: TURN_TIMEOUT_MS,
      players: [
        {
          participantId: args.hostParticipantId,
          nickname: participant.nickname,
          avatarValue: participant.avatar.value,
          joinedAt: now,
          card: [],
          markedCells: [],
          placement: 0,
        },
      ],
      drawDeck: [],
      calledEmojis: [],
      drawIndex: 0,
      createdAt: now,
    });

    return gameId;
  },
});

export const joinLobby = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");

    if (game.players.some((p) => p.participantId === args.participantId)) {
      throw new Error("Already joined this lobby");
    }
    if (game.players.length >= 30) {
      throw new Error("Lobby is full (max 30 players)");
    }

    const participant = await ctx.db.get(args.participantId);
    if (!participant || participant.roomId !== game.roomId) {
      throw new Error("Participant not in this room");
    }

    await ctx.db.patch(args.gameId, {
      players: [
        ...game.players,
        {
          participantId: args.participantId,
          nickname: participant.nickname,
          avatarValue: participant.avatar.value,
          joinedAt: Date.now(),
          card: [],
          markedCells: [],
          placement: 0,
        },
      ],
    });
  },
});

export const leaveLobby = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");

    const remaining = game.players.filter(
      (p) => p.participantId !== args.participantId
    );

    if (game.hostParticipantId === args.participantId) {
      if (remaining.length === 0) {
        await ctx.db.patch(args.gameId, {
          status: "canceled",
          players: [],
          endedAt: Date.now(),
        });
      } else {
        await ctx.db.patch(args.gameId, {
          hostParticipantId: remaining[0].participantId,
          players: remaining,
        });
      }
    } else {
      await ctx.db.patch(args.gameId, { players: remaining });
    }
  },
});

export const updateSettings = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
    winPattern: v.optional(v.union(v.literal("line"), v.literal("four_corners"), v.literal("blackout"))),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    if (game.hostParticipantId !== args.participantId) {
      throw new Error("Only the host can change settings");
    }

    if (args.winPattern) {
      await ctx.db.patch(args.gameId, { winPattern: args.winPattern });
    }
  },
});

export const startGame = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    if (game.hostParticipantId !== args.participantId) {
      throw new Error("Only the host can start the game");
    }
    if (game.players.length < 1) {
      throw new Error("Need at least 1 player to start");
    }

    const players = game.players.map((p) => ({
      ...p,
      card: generateCard(),
      markedCells: [12],
      placement: 0,
    }));

    const drawDeck = shuffleArray([...BINGO_EMOJI_POOL]);
    const turnOrder = shuffleArray(players.map((p) => p.participantId));
    const now = Date.now();

    await ctx.db.patch(args.gameId, {
      status: "active",
      players,
      drawDeck,
      calledEmojis: [],
      drawIndex: 0,
      turnOrder,
      currentTurnParticipantId: turnOrder[0],
      turnStartedAt: now,
      turnTimeoutMs: TURN_TIMEOUT_MS,
      startedAt: now,
    });

    // Schedule auto-roll timeout for first player
    await ctx.scheduler.runAfter(TURN_TIMEOUT_MS, internal.emojiBingo.internalAutoRoll, {
      gameId: args.gameId,
      expectedDrawIndex: 0,
    });

    await bingoTrace(ctx, args.gameId, "startGame", args.participantId.toString(),
      `players=${players.length} pattern=${game.winPattern} firstTurn=${turnOrder[0]}`);

    // Post system message
    const existingGameMsg = await ctx.db
      .query("messages")
      .withIndex("by_roomId_createdAt", (q: any) => q.eq("roomId", game.roomId))
      .order("desc")
      .collect();
    const alreadyPosted = existingGameMsg.some(
      (m: any) => m.kind === "system" && m.text === "game:Emoji Bingo"
    );
    if (!alreadyPosted) {
      await ctx.db.insert("messages", {
        roomId: game.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `game:Emoji Bingo`,
        createdAt: now,
      });
    }
  },
});

// ─── Roll Emoji (the core turn-based interaction) ────────────────────────────

export const rollEmoji = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active" && game.status !== "won") {
      throw new Error("Game is not active");
    }
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn to roll");
    }

    const patch = drawAndAdvance(game);
    if (!patch) {
      // Deck exhausted
      await ctx.db.patch(args.gameId, {
        status: "completed",
        endedAt: Date.now(),
      });
      const round: BingoRound = {
        players: game.players.map((p) => ({
          name: p.nickname, avatar: p.avatarValue, marked: p.markedCells.length, placement: p.placement,
        })),
        winPattern: game.winPattern,
      };
      await upsertBingoSummary(ctx, game.roomId, args.participantId, round);
      return;
    }

    await ctx.db.patch(args.gameId, patch);

    // Schedule timeout for next player's turn
    if (game.status === "active") {
      await ctx.scheduler.runAfter(TURN_TIMEOUT_MS, internal.emojiBingo.internalAutoRoll, {
        gameId: args.gameId,
        expectedDrawIndex: game.drawIndex + 1,
      });
    }

    await bingoTrace(ctx, args.gameId, "rollEmoji", args.participantId.toString(),
      `emoji=${game.drawDeck[game.drawIndex]} draw=${game.drawIndex + 1}/${game.drawDeck.length}`);
  },
});

export const markCell = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
    cellIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active" && game.status !== "won") {
      throw new Error("Game is not active");
    }

    const playerIndex = game.players.findIndex(
      (p) => p.participantId === args.participantId
    );
    if (playerIndex === -1) throw new Error("Player not in this game");

    const player = game.players[playerIndex];
    if (args.cellIndex < 0 || args.cellIndex >= 25) {
      throw new Error("Invalid cell index");
    }
    if (player.markedCells.includes(args.cellIndex)) {
      throw new Error("Cell already marked");
    }

    const cellEmoji = player.card[args.cellIndex];
    if (cellEmoji !== FREE_SPACE && !game.calledEmojis.includes(cellEmoji)) {
      throw new Error("This emoji has not been called yet");
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerIndex] = {
      ...player,
      markedCells: [...player.markedCells, args.cellIndex],
    };

    await ctx.db.patch(args.gameId, { players: updatedPlayers });
  },
});

export const claimBingo = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active" && game.status !== "won") {
      throw new Error("Game is not active");
    }

    const playerIndex = game.players.findIndex(
      (p) => p.participantId === args.participantId
    );
    if (playerIndex === -1) throw new Error("Player not in this game");

    const player = game.players[playerIndex];
    if (player.placement > 0) {
      throw new Error("You already placed!");
    }

    for (const cellIdx of player.markedCells) {
      const emoji = player.card[cellIdx];
      if (emoji !== FREE_SPACE && !game.calledEmojis.includes(emoji)) {
        return { valid: false, reason: "marked_uncalled" };
      }
    }

    if (!checkWinPattern(player.markedCells, game.winPattern)) {
      return { valid: false, reason: "pattern_incomplete" };
    }

    const existingPlacements = game.players
      .filter((p) => p.placement > 0)
      .map((p) => p.placement);
    const nextPlacement = existingPlacements.length === 0
      ? 1
      : Math.max(...existingPlacements) + 1;

    const updatedPlayers = [...game.players];
    updatedPlayers[playerIndex] = { ...player, placement: nextPlacement };

    const now = Date.now();
    const patch: any = { players: updatedPlayers };

    // Check if ALL players have now placed
    const allPlaced = updatedPlayers.every((p) => p.placement > 0);

    if (allPlaced) {
      // Everyone finished — complete the game
      patch.status = "completed";
      patch.endedAt = now;
    } else if (game.status === "active") {
      // First bingo — switch to "won" and keep auto-rolling
      patch.status = "won";
      patch.firstBingoAt = now;

      // Schedule auto-rolls so the game keeps going
      await ctx.scheduler.runAfter(GRACE_ROLL_INTERVAL_MS, internal.emojiBingo.internalAutoRoll, {
        gameId: args.gameId,
        expectedDrawIndex: game.drawIndex,
      });
    } else if (game.status === "won") {
      // Another player finished but not all yet — check again
      // (no state change needed, auto-rolling is already scheduled)
    }

    await ctx.db.patch(args.gameId, patch);

    // Post summary if game just completed
    if (allPlaced) {
      const round: BingoRound = {
        players: updatedPlayers.map((p) => ({
          name: p.nickname, avatar: p.avatarValue, marked: p.markedCells.length, placement: p.placement,
        })),
        winPattern: game.winPattern,
      };
      await upsertBingoSummary(ctx, game.roomId, game.hostParticipantId, round);
    }

    await bingoTrace(ctx, args.gameId, "claimBingo", args.participantId.toString(),
      `placement=${nextPlacement} pattern=${game.winPattern}`);

    return { valid: true, placement: nextPlacement };
  },
});

export const cancelGame = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!["lobby", "active", "won"].includes(game.status)) {
      throw new Error("Game cannot be canceled");
    }

    const now = Date.now();
    await ctx.db.patch(args.gameId, {
      status: "canceled",
      endedAt: now,
    });

    if (game.status !== "lobby") {
      const round: BingoRound = {
        players: game.players.map((p) => ({
          name: p.nickname,
          avatar: p.avatarValue,
          marked: p.markedCells.length,
          placement: p.placement,
        })),
        winPattern: game.winPattern,
      };
      await upsertBingoSummary(ctx, game.roomId, args.participantId, round, true);
    }

    await bingoTrace(ctx, args.gameId, "cancelGame", args.participantId.toString());
  },
});

export const playAgain = mutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    for (const status of ["lobby", "active", "won"] as const) {
      const existing = await ctx.db
        .query("emojiBingoGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", game.roomId).eq("status", status)
        )
        .first();
      if (existing) throw new Error("An Emoji Bingo game is already in progress");
    }

    const participant = await ctx.db.get(args.participantId);
    if (!participant || participant.roomId !== game.roomId) {
      throw new Error("Participant not in this room");
    }

    const now = Date.now();
    const newPlayers = [];

    for (const player of game.players) {
      const p = await ctx.db.get(player.participantId);
      if (p && p.online && !p.departed && p.roomId === game.roomId) {
        newPlayers.push({
          participantId: player.participantId,
          nickname: p.nickname,
          avatarValue: p.avatar.value,
          joinedAt: now,
          card: [] as string[],
          markedCells: [] as number[],
          placement: 0,
        });
      }
    }

    if (!newPlayers.some((p) => p.participantId === args.participantId)) {
      newPlayers.unshift({
        participantId: args.participantId,
        nickname: participant.nickname,
        avatarValue: participant.avatar.value,
        joinedAt: now,
        card: [] as string[],
        markedCells: [] as number[],
        placement: 0,
      });
    }

    const newGameId = await ctx.db.insert("emojiBingoGames", {
      roomId: game.roomId,
      status: "lobby",
      hostParticipantId: args.participantId,
      winPattern: game.winPattern,
      callIntervalMs: GRACE_ROLL_INTERVAL_MS,
      turnOrder: [],
      turnTimeoutMs: TURN_TIMEOUT_MS,
      players: newPlayers,
      drawDeck: [],
      calledEmojis: [],
      drawIndex: 0,
      createdAt: now,
    });

    return newGameId;
  },
});

// ─── Internal scheduled mutations ────────────────────────────────────────────

export const internalAutoRoll = internalMutation({
  args: {
    gameId: v.id("emojiBingoGames"),
    expectedDrawIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    if (game.status !== "active" && game.status !== "won") return;
    // If someone already rolled (drawIndex advanced), this timeout is stale — skip
    if (game.drawIndex !== args.expectedDrawIndex) return;

    const patch = drawAndAdvance(game);
    if (!patch) {
      await ctx.db.patch(args.gameId, {
        status: "completed",
        endedAt: Date.now(),
      });
      const round: BingoRound = {
        players: game.players.map((p) => ({
          name: p.nickname, avatar: p.avatarValue, marked: p.markedCells.length, placement: p.placement,
        })),
        winPattern: game.winPattern,
      };
      await upsertBingoSummary(ctx, game.roomId, game.hostParticipantId, round);
      return;
    }

    await ctx.db.patch(args.gameId, patch);

    // Schedule next timeout/auto-roll
    const interval = game.status === "won" ? GRACE_ROLL_INTERVAL_MS : TURN_TIMEOUT_MS;
    await ctx.scheduler.runAfter(interval, internal.emojiBingo.internalAutoRoll, {
      gameId: args.gameId,
      expectedDrawIndex: game.drawIndex + 1,
    });

    await bingoTrace(ctx, args.gameId, "autoRoll", undefined,
      `emoji=${game.drawDeck[game.drawIndex]} draw=${game.drawIndex + 1}/${game.drawDeck.length} mode=${game.status}`);
  },
});

export const internalEndGracePeriod = internalMutation({
  args: { gameId: v.id("emojiBingoGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    if (game.status !== "won") return;

    const now = Date.now();
    await ctx.db.patch(args.gameId, {
      status: "completed",
      endedAt: now,
    });

    const round: BingoRound = {
      players: game.players.map((p) => ({
        name: p.nickname,
        avatar: p.avatarValue,
        marked: p.markedCells.length,
        placement: p.placement,
      })),
      winPattern: game.winPattern,
    };
    await upsertBingoSummary(ctx, game.roomId, game.hostParticipantId, round);

    await bingoTrace(ctx, args.gameId, "gracePeriodEnd", undefined,
      `winners=${game.players.filter((p) => p.placement > 0).length}`);
  },
});

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getActiveEmojiBingo = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    for (const status of ["active", "won", "lobby"] as const) {
      const game = await ctx.db
        .query("emojiBingoGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", args.roomId).eq("status", status)
        )
        .first();
      if (game) return game;
    }
    for (const endStatus of ["completed", "canceled"] as const) {
      const game = await ctx.db
        .query("emojiBingoGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", args.roomId).eq("status", endStatus)
        )
        .order("desc")
        .first();
      if (game) return game;
    }
    return null;
  },
});

export const getEmojiBingoById = query({
  args: { gameId: v.id("emojiBingoGames") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});
