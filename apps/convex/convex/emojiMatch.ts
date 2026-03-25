import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// --- Emoji pool ---

const EMOJI_POOL: Array<{ emoji: string; en: string; ja: string }> = [
  { emoji: "🍎", en: "Apple", ja: "りんご" },
  { emoji: "🍌", en: "Banana", ja: "バナナ" },
  { emoji: "🍓", en: "Strawberry", ja: "いちご" },
  { emoji: "🍇", en: "Grapes", ja: "ぶどう" },
  { emoji: "🍒", en: "Cherry", ja: "さくらんぼ" },
  { emoji: "🐱", en: "Cat", ja: "ねこ" },
  { emoji: "🐶", en: "Dog", ja: "いぬ" },
  { emoji: "🐼", en: "Panda", ja: "パンダ" },
  { emoji: "🐸", en: "Frog", ja: "かえる" },
  { emoji: "🦊", en: "Fox", ja: "きつね" },
  { emoji: "⚽", en: "Soccer", ja: "サッカー" },
  { emoji: "🏀", en: "Basketball", ja: "バスケ" },
  { emoji: "🎈", en: "Balloon", ja: "ふうせん" },
  { emoji: "⭐", en: "Star", ja: "ほし" },
  { emoji: "🌙", en: "Moon", ja: "つき" },
  { emoji: "☀️", en: "Sun", ja: "たいよう" },
  { emoji: "🚗", en: "Car", ja: "くるま" },
  { emoji: "✈️", en: "Airplane", ja: "ひこうき" },
  { emoji: "🍣", en: "Sushi", ja: "すし" },
  { emoji: "🍜", en: "Ramen", ja: "ラーメン" },
  { emoji: "🎵", en: "Music", ja: "おんがく" },
  { emoji: "📱", en: "Phone", ja: "でんわ" },
  { emoji: "☕", en: "Coffee", ja: "コーヒー" },
  { emoji: "🎁", en: "Gift", ja: "プレゼント" },
  { emoji: "🌸", en: "Cherry Blossom", ja: "さくら" },
  { emoji: "🗻", en: "Mountain", ja: "やま" },
  { emoji: "⛩️", en: "Shrine", ja: "じんじゃ" },
  { emoji: "🐟", en: "Fish", ja: "さかな" },
  { emoji: "🍙", en: "Rice Ball", ja: "おにぎり" },
  { emoji: "🌈", en: "Rainbow", ja: "にじ" },
];

// --- Helpers ---

interface GameRound {
  players: Array<{ name: string; avatar: string; score: number; isWinner: boolean }>;
  totalPairs: number;
  isTie: boolean;
}

async function upsertMatchEmojiSummary(
  ctx: any,
  roomId: Id<"rooms">,
  senderId: Id<"participants">,
  newRound: GameRound,
  cancelled?: boolean,
) {
  // Find existing summary message in this room
  const allMessages = await ctx.db
    .query("messages")
    .withIndex("by_roomId_createdAt", (q: any) => q.eq("roomId", roomId))
    .order("desc")
    .collect();
  const existing = allMessages.find(
    (m: any) => m.kind === "system" && m.text?.startsWith("emoji_match_summary:")
  );

  if (existing) {
    // Parse existing data and append
    try {
      const oldData = JSON.parse(existing.text.slice("emoji_match_summary:".length));
      const games: GameRound[] = oldData.games ?? [
        // Migrate legacy single-game format
        { players: oldData.players, totalPairs: oldData.totalPairs, isTie: oldData.isTie },
      ];
      games.push(newRound);
      const summaryData = { gameType: "Match Emoji", cancelled, games };
      await ctx.db.patch(existing._id, {
        text: `emoji_match_summary:${JSON.stringify(summaryData)}`,
        createdAt: Date.now(),
      });
      return;
    } catch {
      // If parse fails, fall through to create new
    }
  }

  // Create new summary
  const summaryData = { gameType: "Match Emoji", cancelled, games: [newRound] };
  await ctx.db.insert("messages", {
    roomId,
    senderId,
    kind: "system",
    status: "processed",
    text: `emoji_match_summary:${JSON.stringify(summaryData)}`,
    createdAt: Date.now(),
  });
}

function getBoardConfig(playerCount: number) {
  if (playerCount <= 4) return { rows: 4, cols: 4, pairs: 8 };
  if (playerCount <= 12) return { rows: 5, cols: 4, pairs: 10 };
  return { rows: 6, cols: 6, pairs: 18 };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextEligiblePlayer(
  turnOrder: Id<"participants">[],
  players: Array<{ participantId: Id<"participants">; isActive: boolean }>,
  currentId: Id<"participants">
): Id<"participants"> | null {
  const activeSet = new Set(
    players.filter((p) => p.isActive).map((p) => p.participantId)
  );
  if (activeSet.size === 0) return null;

  const currentIndex = turnOrder.indexOf(currentId);
  for (let offset = 1; offset <= turnOrder.length; offset++) {
    const nextId = turnOrder[(currentIndex + offset) % turnOrder.length];
    if (activeSet.has(nextId)) return nextId;
  }
  return null;
}

// --- Mutations ---

export const createLobby = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const participant = await ctx.db.get(args.hostParticipantId);
    if (!participant || participant.roomId !== args.roomId) {
      throw new Error("Participant not in this room");
    }

    // Check no existing active emoji match in room
    for (const status of ["lobby", "active", "resolving"] as const) {
      const existing = await ctx.db
        .query("emojiMatchGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", args.roomId).eq("status", status)
        )
        .first();
      if (existing) throw new Error("An emoji match game is already in progress");
    }

    const now = Date.now();
    const gameId = await ctx.db.insert("emojiMatchGames", {
      roomId: args.roomId,
      status: "lobby",
      hostParticipantId: args.hostParticipantId,
      players: [
        {
          participantId: args.hostParticipantId,
          nickname: participant.nickname,
          avatarValue: participant.avatar.value,
          joinedAt: now,
          isActive: true,
          score: 0,
        },
      ],
      turnOrder: [],
      board: [],
      selectedCardIds: [],
      matchedPairCount: 0,
      totalPairs: 0,
      boardRows: 0,
      boardCols: 0,
      mismatchRevealMs: 1200,
      createdAt: now,
    });

    return gameId;
  },
});

export const joinLobby = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
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
          isActive: true,
          score: 0,
        },
      ],
    });
  },
});

export const leaveLobby = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");

    const remainingPlayers = game.players.filter(
      (p) => p.participantId !== args.participantId
    );

    if (game.hostParticipantId === args.participantId) {
      if (remainingPlayers.length === 0) {
        await ctx.db.patch(args.gameId, {
          status: "canceled",
          players: [],
          endedAt: Date.now(),
        });
      } else {
        await ctx.db.patch(args.gameId, {
          hostParticipantId: remainingPlayers[0].participantId,
          players: remainingPlayers,
        });
      }
    } else {
      await ctx.db.patch(args.gameId, { players: remainingPlayers });
    }
  },
});

export const startGame = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "lobby") throw new Error("Game is not in lobby state");
    if (game.hostParticipantId !== args.participantId) {
      throw new Error("Only the host can start the game");
    }

    const activePlayers = game.players.filter((p) => p.isActive);
    if (activePlayers.length < 1) {
      throw new Error("Need at least 1 player to start");
    }

    const { rows, cols, pairs } = getBoardConfig(activePlayers.length);

    // Pick random emojis and create English/Japanese pairs
    const selectedEmojis = shuffleArray(EMOJI_POOL).slice(0, pairs);

    const cards: Array<{
      cardId: string;
      pairKey: string;
      content: { kind: string; value: string; label?: string };
      isMatched: boolean;
      isRevealed: boolean;
    }> = [];

    for (let i = 0; i < selectedEmojis.length; i++) {
      const pairKey = `pair_${i}`;
      const item = selectedEmojis[i];
      cards.push({
        cardId: `card_${i * 2}`,
        pairKey,
        content: { kind: "emoji", value: item.emoji, label: item.en },
        isMatched: false,
        isRevealed: false,
      });
      cards.push({
        cardId: `card_${i * 2 + 1}`,
        pairKey,
        content: { kind: "emoji", value: item.emoji, label: item.ja },
        isMatched: false,
        isRevealed: false,
      });
    }

    const shuffledCards = shuffleArray(cards);
    const turnOrder = shuffleArray(activePlayers.map((p) => p.participantId));
    const now = Date.now();
    const isMultiplayer = activePlayers.length > 1;

    await ctx.db.patch(args.gameId, {
      status: "active",
      board: shuffledCards,
      boardRows: rows,
      boardCols: cols,
      totalPairs: pairs,
      matchedPairCount: 0,
      selectedCardIds: [],
      turnOrder,
      currentTurnParticipantId: turnOrder[0],
      turnTimeoutMs: isMultiplayer ? 15000 : undefined,
      startedAt: now,
      turnStartedAt: now,
    });

    // Post system message only for the first game in this room
    const existingGameMsg = await ctx.db
      .query("messages")
      .withIndex("by_roomId_createdAt", (q: any) => q.eq("roomId", game.roomId))
      .order("desc")
      .collect();
    const alreadyPosted = existingGameMsg.some(
      (m: any) => m.kind === "system" && m.text === "game:Emoji Match"
    );
    if (!alreadyPosted) {
      await ctx.db.insert("messages", {
        roomId: game.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `game:Emoji Match`,
        createdAt: now,
      });
    }
  },
});

export const flipCard = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
    cardId: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    const cardIndex = game.board.findIndex((c) => c.cardId === args.cardId);
    if (cardIndex === -1) throw new Error("Card not found");

    const card = game.board[cardIndex];
    if (card.isMatched) throw new Error("Card already matched");
    if (card.isRevealed) throw new Error("Card already revealed");
    if (game.selectedCardIds.length >= 2) throw new Error("Two cards already selected");

    const updatedBoard = [...game.board];
    updatedBoard[cardIndex] = { ...card, isRevealed: true };
    const updatedSelectedIds = [...game.selectedCardIds, args.cardId];

    if (updatedSelectedIds.length === 1) {
      await ctx.db.patch(args.gameId, {
        board: updatedBoard,
        selectedCardIds: updatedSelectedIds,
      });
      return { action: "first_card" };
    }

    // Second card — check for match
    const firstCard = updatedBoard.find((c) => c.cardId === updatedSelectedIds[0])!;
    const secondCard = updatedBoard[cardIndex];

    if (firstCard.pairKey === secondCard.pairKey) {
      // Match!
      const matchedBoard = updatedBoard.map((c) =>
        c.cardId === updatedSelectedIds[0] || c.cardId === args.cardId
          ? { ...c, isMatched: true, isRevealed: true }
          : c
      );
      const newMatchedCount = game.matchedPairCount + 1;
      const updatedPlayers = game.players.map((p) =>
        p.participantId === args.participantId
          ? { ...p, score: p.score + 1 }
          : p
      );

      if (newMatchedCount === game.totalPairs) {
        // Game complete
        const maxScore = Math.max(...updatedPlayers.map((p) => p.score));
        const winners = updatedPlayers.filter((p) => p.score === maxScore);
        const isTie = winners.length > 1;
        await ctx.db.patch(args.gameId, {
          board: matchedBoard,
          selectedCardIds: [],
          matchedPairCount: newMatchedCount,
          players: updatedPlayers,
          status: "completed",
          endedAt: Date.now(),
          result: {
            winnerParticipantIds: winners.map((w) => w.participantId),
            isTie,
            endReason: "all_matched",
          },
        });

        // Post/update game summary in chat
        await upsertMatchEmojiSummary(ctx, game.roomId, args.participantId, {
          players: updatedPlayers
            .sort((a, b) => b.score - a.score)
            .map((p) => ({
              name: p.nickname,
              avatar: p.avatarValue,
              score: p.score,
              isWinner: winners.some((w) => w.participantId === p.participantId),
            })),
          totalPairs: game.totalPairs,
          isTie,
        });

        return { action: "game_complete" };
      }

      // Match but game continues
      await ctx.db.patch(args.gameId, {
        board: matchedBoard,
        selectedCardIds: [],
        matchedPairCount: newMatchedCount,
        players: updatedPlayers,
        turnStartedAt: Date.now(),
      });
      return { action: "match" };
    }

    // Mismatch
    const resolveAt = Date.now() + game.mismatchRevealMs;
    await ctx.db.patch(args.gameId, {
      board: updatedBoard,
      selectedCardIds: updatedSelectedIds,
      status: "resolving",
      resolveAt,
    });

    // Schedule automatic resolution
    await ctx.scheduler.runAfter(
      game.mismatchRevealMs,
      internal.emojiMatch.internalResolveMismatch,
      { gameId: args.gameId }
    );

    return { action: "mismatch" };
  },
});

export const resolveMismatch = mutation({
  args: { gameId: v.id("emojiMatchGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "resolving") throw new Error("Game is not in resolving state");
    if (game.resolveAt && Date.now() < game.resolveAt) {
      throw new Error("Mismatch reveal period has not elapsed yet");
    }
    await doResolveMismatch(ctx, game);
  },
});

export const internalResolveMismatch = internalMutation({
  args: { gameId: v.id("emojiMatchGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "resolving") return;
    await doResolveMismatch(ctx, game);
  },
});

async function doResolveMismatch(ctx: any, game: any) {
  const selectedSet = new Set(game.selectedCardIds);
  const updatedBoard = game.board.map((c: any) =>
    selectedSet.has(c.cardId) ? { ...c, isRevealed: false } : c
  );

  const nextPlayer = getNextEligiblePlayer(
    game.turnOrder,
    game.players,
    game.currentTurnParticipantId!
  );

  if (!nextPlayer) {
    const maxScore = Math.max(...game.players.map((p: any) => p.score));
    const winners = game.players.filter(
      (p: any) => p.score === maxScore && p.isActive
    );
    await ctx.db.patch(game._id, {
      board: updatedBoard,
      selectedCardIds: [],
      status: "completed",
      currentTurnParticipantId: undefined,
      endedAt: Date.now(),
      resolveAt: undefined,
      result: {
        winnerParticipantIds: winners.map((w: any) => w.participantId),
        isTie: winners.length > 1,
        endReason: "abandoned",
      },
    });
    return;
  }

  await ctx.db.patch(game._id, {
    board: updatedBoard,
    selectedCardIds: [],
    status: "active",
    currentTurnParticipantId: nextPlayer,
    turnStartedAt: Date.now(),
    resolveAt: undefined,
  });
}

export const timeoutTurn = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not this player's turn");
    }
    if (!game.turnTimeoutMs || !game.turnStartedAt) return;
    // Allow 1s grace for client/server clock skew
    if (Date.now() - game.turnStartedAt < game.turnTimeoutMs - 1000) {
      throw new Error("Turn has not timed out yet");
    }

    const selectedSet = new Set(game.selectedCardIds);
    const updatedBoard = game.board.map((c) =>
      selectedSet.has(c.cardId) && !c.isMatched
        ? { ...c, isRevealed: false }
        : c
    );

    const nextPlayer = getNextEligiblePlayer(
      game.turnOrder,
      game.players,
      args.participantId
    );

    if (!nextPlayer) {
      const maxScore = Math.max(...game.players.map((p) => p.score));
      const winners = game.players.filter(
        (p) => p.score === maxScore && p.isActive
      );
      await ctx.db.patch(args.gameId, {
        board: updatedBoard,
        selectedCardIds: [],
        status: "completed",
        currentTurnParticipantId: undefined,
        endedAt: Date.now(),
        result: {
          winnerParticipantIds: winners.map((w) => w.participantId),
          isTie: winners.length > 1,
          endReason: "abandoned",
        },
      });
      return;
    }

    await ctx.db.patch(args.gameId, {
      board: updatedBoard,
      selectedCardIds: [],
      currentTurnParticipantId: nextPlayer,
      turnStartedAt: Date.now(),
    });
  },
});

export const cancelGame = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Allow both the game lobby host and the room host to cancel
    const participant = await ctx.db.get(args.participantId);
    const isGameHost = game.hostParticipantId === args.participantId;
    const isRoomHost = participant?.role === "host";
    if (!isGameHost && !isRoomHost) {
      throw new Error("Only the host can cancel the game");
    }
    if (game.status === "completed" || game.status === "canceled") {
      throw new Error("Game is already finished");
    }

    await ctx.db.patch(args.gameId, {
      status: "canceled",
      endedAt: Date.now(),
      result: {
        winnerParticipantIds: [],
        isTie: false,
        endReason: "canceled",
      },
    });

    // Post/update summary if any pairs were matched, otherwise just cancelled message
    const anyScores = game.players.some((p) => p.score > 0);
    if (anyScores) {
      const sorted = [...game.players].sort((a, b) => b.score - a.score);
      const maxScore = sorted[0]?.score ?? 0;
      await upsertMatchEmojiSummary(ctx, game.roomId, args.participantId, {
        players: sorted.map((p) => ({
          name: p.nickname,
          avatar: p.avatarValue,
          score: p.score,
          isWinner: p.score === maxScore && maxScore > 0,
        })),
        totalPairs: game.totalPairs,
        isTie: sorted.filter((p) => p.score === maxScore).length > 1,
      }, true);
    } else {
      await ctx.db.insert("messages", {
        roomId: game.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: "game_cancelled:Match Emoji",
        createdAt: Date.now(),
      });
    }
  },
});

export const playAgain = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "completed" && game.status !== "canceled") {
      throw new Error("Game is not finished");
    }

    // Check no existing active game in room
    for (const status of ["lobby", "active", "resolving"] as const) {
      const existing = await ctx.db
        .query("emojiMatchGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", game.roomId).eq("status", status)
        )
        .first();
      if (existing) throw new Error("An emoji match game is already in progress");
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
          isActive: true,
          score: 0,
        });
      }
    }

    if (!newPlayers.some((p) => p.participantId === args.participantId)) {
      newPlayers.unshift({
        participantId: args.participantId,
        nickname: participant.nickname,
        avatarValue: participant.avatar.value,
        joinedAt: now,
        isActive: true,
        score: 0,
      });
    }

    const newGameId = await ctx.db.insert("emojiMatchGames", {
      roomId: game.roomId,
      status: "lobby",
      hostParticipantId: args.participantId,
      players: newPlayers,
      turnOrder: [],
      board: [],
      selectedCardIds: [],
      matchedPairCount: 0,
      totalPairs: 0,
      boardRows: 0,
      boardCols: 0,
      mismatchRevealMs: 1200,
      createdAt: now,
    });

    return newGameId;
  },
});

// --- Queries ---

export const getActiveEmojiMatch = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Check for in-progress games first (lobby/active/resolving)
    for (const status of ["active", "resolving", "lobby"] as const) {
      const game = await ctx.db
        .query("emojiMatchGames")
        .withIndex("by_roomId_status", (q) =>
          q.eq("roomId", args.roomId).eq("status", status)
        )
        .first();
      if (game) return game;
    }
    // If no in-progress game, return the most recently completed game
    // so the results screen can display. Use order("desc") to get newest.
    const completed = await ctx.db
      .query("emojiMatchGames")
      .withIndex("by_roomId_status", (q) =>
        q.eq("roomId", args.roomId).eq("status", "completed")
      )
      .order("desc")
      .first();
    if (completed) return completed;
    return null;
  },
});

export const getEmojiMatchById = query({
  args: { gameId: v.id("emojiMatchGames") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});
