import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { isPresent } from "./participants";

// ─── Trace helper ────────────────────────────────────────────────────────────

async function emTrace(
  ctx: any,
  gameId: Id<"emojiMatchGames">,
  action: string,
  participantId?: string,
  detail?: string,
) {
  try {
    await ctx.db.insert("emTrace", {
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

// --- Emoji pool ---

// Every entry has icon-pack art on web (lib/icons.ts) and iOS (IconPack.swift).
const EMOJI_POOL: Array<{ emoji: string; en: string; ja: string }> = [
  { emoji: "☀️", en: "Sun", ja: "たいよう" },
  { emoji: "☁️", en: "Cloud", ja: "くも" },
  { emoji: "☂️", en: "Umbrella", ja: "かさ" },
  { emoji: "⛄", en: "Snowman", ja: "ゆきだるま" },
  { emoji: "🌙", en: "Moon", ja: "つき" },
  { emoji: "🏠", en: "House", ja: "いえ" },
  { emoji: "☕", en: "Coffee", ja: "コーヒー" },
  { emoji: "🌷", en: "Tulip", ja: "チューリップ" },
  { emoji: "🍒", en: "Cherry", ja: "さくらんぼ" },
  { emoji: "🍞", en: "Bread", ja: "パン" },
  { emoji: "🍰", en: "Cake", ja: "ケーキ" },
  { emoji: "🚗", en: "Car", ja: "くるま" },
  { emoji: "🐳", en: "Whale", ja: "くじら" },
  { emoji: "🍦", en: "Ice Cream", ja: "アイス" },
  { emoji: "🍉", en: "Watermelon", ja: "すいか" },
  { emoji: "💎", en: "Diamond", ja: "ダイヤ" },
  { emoji: "🦋", en: "Butterfly", ja: "ちょうちょ" },
  { emoji: "📷", en: "Camera", ja: "カメラ" },
  { emoji: "📺", en: "TV", ja: "テレビ" },
  { emoji: "🚃", en: "Train", ja: "でんしゃ" },
  { emoji: "🌠", en: "Shooting Star", ja: "ながれぼし" },
  { emoji: "🌸", en: "Flower", ja: "はな" },
  { emoji: "⭐", en: "Star", ja: "ほし" },
  { emoji: "🎁", en: "Gift", ja: "プレゼント" },
  { emoji: "🐰", en: "Bunny", ja: "うさぎ" },
  { emoji: "🐼", en: "Panda", ja: "パンダ" },
  { emoji: "🐻", en: "Bear", ja: "くま" },
  { emoji: "👻", en: "Ghost", ja: "おばけ" },
  { emoji: "🐥", en: "Chick", ja: "ひよこ" },
  { emoji: "🐶", en: "Dog", ja: "いぬ" },
  { emoji: "🐱", en: "Cat", ja: "ねこ" },
  { emoji: "🐢", en: "Turtle", ja: "かめ" },
  { emoji: "🦭", en: "Seal", ja: "アザラシ" },
  { emoji: "🐝", en: "Bee", ja: "はち" },
  { emoji: "🐑", en: "Sheep", ja: "ひつじ" },
  { emoji: "🐷", en: "Pig", ja: "ぶた" },
  { emoji: "👑", en: "Crown", ja: "おうかん" },
  { emoji: "🍀", en: "Clover", ja: "クローバー" },
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

type Game = Doc<"emojiMatchGames">;

/**
 * Who plays after `currentId`. A player who is not here right now is passed over, so someone who
 * left is not handed turn after turn; they are back in the rotation as soon as they return.
 * isActive is left alone on purpose: both clients hide inactive players from the score strip.
 * `currentId` is the last candidate, so a lone present player keeps the turn and can finish the
 * board. If nobody is present the plain rotation applies, so the turn clock keeps moving.
 */
async function pickNextPlayer(
  ctx: MutationCtx,
  turnOrder: Id<"participants">[],
  players: Array<{ participantId: Id<"participants">; isActive: boolean }>,
  currentId: Id<"participants">
): Promise<Id<"participants"> | null> {
  const fallback = getNextEligiblePlayer(turnOrder, players, currentId);
  if (!fallback) return null;

  const activeSet = new Set(
    players.filter((p) => p.isActive).map((p) => p.participantId)
  );
  const now = Date.now();
  const currentIndex = turnOrder.indexOf(currentId);
  for (let offset = 1; offset <= turnOrder.length; offset++) {
    const nextId = turnOrder[(currentIndex + offset) % turnOrder.length];
    if (activeSet.has(nextId) && isPresent(await ctx.db.get(nextId), now)) return nextId;
  }
  return fallback;
}

/**
 * The server owns the turn clock. Call this wherever turnStartedAt is set; the timeout carries that
 * timestamp and does nothing if the turn has moved on by the time it fires.
 */
async function scheduleTurnTimeout(
  ctx: MutationCtx,
  gameId: Id<"emojiMatchGames">,
  turnTimeoutMs: number | undefined,
  turnStartedAt: number
): Promise<void> {
  if (!turnTimeoutMs) return; // single player: no turn clock
  await ctx.scheduler.runAfter(turnTimeoutMs, internal.emojiMatch.internalTimeoutTurn, {
    gameId,
    turnStartedAt,
  });
}

// Turns in a row that ran out with no card flipped before the game is ended: five minutes of 15 s
// turns. Without it a game left minimised keeps passing the turn for as long as the room is open.
const MAX_IDLE_TIMEOUTS = 20;

/**
 * Hands a lobby whose game host has gone to the room host. Installed iOS builds only show Start and
 * Cancel to the game host, so this is how the room host gets an abandoned lobby back. Only on the room
 * host's own request, and never from a game host who is here.
 */
async function claimLobby(ctx: MutationCtx, lobby: Game, callerId: Id<"participants">): Promise<boolean> {
  const caller = await ctx.db.get(callerId);
  if (!caller || caller.role !== "host" || caller.roomId !== lobby.roomId) return false;
  const now = Date.now();
  if (isPresent(await ctx.db.get(lobby.hostParticipantId), now)) return false;
  const joined = lobby.players.some((p) => p.participantId === callerId);
  await ctx.db.patch(lobby._id, {
    hostParticipantId: callerId,
    players: joined
      ? lobby.players
      : [
          ...lobby.players,
          {
            participantId: callerId,
            nickname: caller.nickname,
            avatarValue: caller.avatar.value,
            joinedAt: now,
            isActive: true,
            score: 0,
            turns: 0,
          },
        ],
  });
  return true;
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
      if (!existing) continue;
      // An abandoned lobby goes to the room host instead of blocking the room (see claimLobby)
      if (status === "lobby" && (await claimLobby(ctx, existing, args.hostParticipantId))) {
        return existing._id;
      }
      throw new Error("An emoji match game is already in progress");
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
          turns: 0,
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

    if (game.hostParticipantId !== args.participantId && (await claimLobby(ctx, game, args.participantId))) {
      return;
    }
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
          turns: 0,
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
    const turnTimeoutMs = isMultiplayer ? 15000 : undefined;
    // Open on someone who is here: a player who joined the lobby and left would cost a full turn clock
    const firstPlayer =
      (await pickNextPlayer(ctx, turnOrder, game.players, turnOrder[turnOrder.length - 1])) ?? turnOrder[0];

    await ctx.db.patch(args.gameId, {
      status: "active",
      board: shuffledCards,
      boardRows: rows,
      boardCols: cols,
      totalPairs: pairs,
      matchedPairCount: 0,
      selectedCardIds: [],
      turnOrder,
      currentTurnParticipantId: firstPlayer,
      turnTimeoutMs,
      startedAt: now,
      turnStartedAt: now,
    });
    await scheduleTurnTimeout(ctx, args.gameId, turnTimeoutMs, now);

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

    await emTrace(ctx, args.gameId, "flipCard", args.participantId.toString(), `card=${args.cardId} selected=${game.selectedCardIds.length}`);

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
          ? { ...p, score: p.score + 1, turns: (p.turns ?? 0) + 1 }
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

        await emTrace(ctx, args.gameId, "flipCard:complete", args.participantId.toString(), `pairs=${newMatchedCount}/${game.totalPairs}`);
        return { action: "game_complete" };
      }

      // Match but game continues
      const turnStartedAt = Date.now();
      await ctx.db.patch(args.gameId, {
        board: matchedBoard,
        selectedCardIds: [],
        matchedPairCount: newMatchedCount,
        players: updatedPlayers,
        turnStartedAt,
        idleTimeouts: 0,
      });
      await scheduleTurnTimeout(ctx, args.gameId, game.turnTimeoutMs, turnStartedAt);
      await emTrace(ctx, args.gameId, "flipCard:match", args.participantId.toString(), `pair=${firstCard.pairKey} matched=${newMatchedCount}/${game.totalPairs}`);
      return { action: "match" };
    }

    // Mismatch — increment turns for this player
    const mismatchPlayers = game.players.map((p: any) =>
      p.participantId === args.participantId
        ? { ...p, turns: (p.turns ?? 0) + 1 }
        : p
    );
    await emTrace(ctx, args.gameId, "flipCard:mismatch", args.participantId.toString(), `cards=${firstCard.pairKey}+${secondCard.pairKey}`);
    const resolveAt = Date.now() + game.mismatchRevealMs;
    await ctx.db.patch(args.gameId, {
      board: updatedBoard,
      selectedCardIds: updatedSelectedIds,
      players: mismatchPlayers,
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
    if (game.status !== "resolving") return; // Already resolved — no error
    if (game.resolveAt && Date.now() < game.resolveAt) return; // Too early — wait
    await emTrace(ctx, args.gameId, "resolveMismatch", undefined, `turn=${game.currentTurnParticipantId?.toString().slice(-6)}`);
    await passTurn(ctx, game);
  },
});

export const internalResolveMismatch = internalMutation({
  args: { gameId: v.id("emojiMatchGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "resolving") return;
    await passTurn(ctx, game);
  },
});

/**
 * End the current turn: turn back any unmatched card left open, hand the turn to the next player
 * and arm that turn's timeout. Used when a mismatch reveal ends and when a turn's clock runs out.
 */
async function passTurn(ctx: MutationCtx, game: Game, timedOut: boolean = false): Promise<void> {
  const selectedSet = new Set(game.selectedCardIds);
  const updatedBoard = game.board.map((c) =>
    selectedSet.has(c.cardId) && !c.isMatched ? { ...c, isRevealed: false } : c
  );
  const now = Date.now();

  // Kept on the game, not in the scheduled job, so the server clock and a web tab's timeoutTurn
  // count the same run. A turn in which a card was flipped is not idle, even though it ran out.
  const idle = timedOut && game.selectedCardIds.length === 0 ? (game.idleTimeouts ?? 0) + 1 : 0;

  // Nobody has touched the board for a long run of turns: end the game rather than tick on
  const nextPlayer =
    idle >= MAX_IDLE_TIMEOUTS
      ? null
      : await pickNextPlayer(ctx, game.turnOrder, game.players, game.currentTurnParticipantId!);

  if (!nextPlayer) {
    // Walked away from, not won: no winners, and the same chat record cancelGame leaves.
    // Status stays "completed" because the active-game query would otherwise fall back to an
    // older finished game; both clients show endReason "canceled" as a cancelled game.
    const sorted = [...game.players].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0]?.score ?? 0;
    await ctx.db.patch(game._id, {
      board: updatedBoard,
      selectedCardIds: [],
      status: "completed",
      currentTurnParticipantId: undefined,
      endedAt: now,
      resolveAt: undefined,
      result: { winnerParticipantIds: [], isTie: false, endReason: "canceled" },
    });
    if (maxScore > 0) {
      await upsertMatchEmojiSummary(ctx, game.roomId, game.hostParticipantId, {
        players: sorted.map((p) => ({
          name: p.nickname,
          avatar: p.avatarValue,
          score: p.score,
          isWinner: p.score === maxScore,
        })),
        totalPairs: game.totalPairs,
        isTie: sorted.filter((p) => p.score === maxScore).length > 1,
      }, true);
    } else {
      await ctx.db.insert("messages", {
        roomId: game.roomId,
        senderId: game.hostParticipantId,
        kind: "system",
        status: "processed",
        text: "game_cancelled:Match Emoji",
        createdAt: now,
      });
    }
    return;
  }

  await ctx.db.patch(game._id, {
    board: updatedBoard,
    selectedCardIds: [],
    status: "active",
    currentTurnParticipantId: nextPlayer,
    turnStartedAt: now,
    idleTimeouts: idle,
    resolveAt: undefined,
  });
  await scheduleTurnTimeout(ctx, game._id, game.turnTimeoutMs, now);
}

export const timeoutTurn = mutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    // The server ends turns itself (internalTimeoutTurn). Web clients still call this, racing that
    // timer and each other, so a call for a turn that already moved on, or one that is early because
    // the caller's clock runs fast, is expected: ignore it instead of rejecting it.
    if (game.status !== "active") return;
    if (game.currentTurnParticipantId !== args.participantId) return;
    if (!game.turnTimeoutMs || !game.turnStartedAt) return;
    // Allow 1s grace for client/server clock skew
    if (Date.now() - game.turnStartedAt < game.turnTimeoutMs - 1000) return;
    await doTimeoutTurn(ctx, game, "client");
  },
});

/** A turn's clock ran out. Shared by the scheduled timeout and the public mutation web clients call. */
async function doTimeoutTurn(ctx: MutationCtx, game: Game, source: "server" | "client"): Promise<void> {
  await emTrace(ctx, game._id, "timeoutTurn", game.currentTurnParticipantId?.toString(), `by=${source}`);
  await passTurn(ctx, game, true);
}

export const internalTimeoutTurn = internalMutation({
  args: {
    gameId: v.id("emojiMatchGames"),
    turnStartedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    // Not active: the game ended, or a mismatch is being revealed (its resolve starts the next
    // turn and schedules that turn's timeout)
    if (!game || game.status !== "active") return;
    // Stale: a match, a mismatch or an earlier timeout already restarted the clock
    if (game.turnStartedAt !== args.turnStartedAt) return;
    if (!game.currentTurnParticipantId) return;
    // A closed room has nobody left to play: stop here so an abandoned game does not tick forever
    const room = await ctx.db.get(game.roomId);
    if (!room || room.status === "closed") return;
    await doTimeoutTurn(ctx, game, "server");
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
      // Deal in only the people who are here right now; anyone else can tap Join when they are back.
      // The caller is always in, whatever their last heartbeat says.
      const isCaller = player.participantId === args.participantId;
      if (p && p.roomId === game.roomId && (isCaller || isPresent(p, now))) {
        newPlayers.push({
          participantId: player.participantId,
          nickname: p.nickname,
          avatarValue: p.avatar.value,
          joinedAt: now,
          isActive: true,
          score: 0,
          turns: 0,
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
    // If no in-progress game, return the most recently completed/canceled game
    // so the results screen can display.
    for (const endStatus of ["completed", "canceled"] as const) {
      const game = await ctx.db
        .query("emojiMatchGames")
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

export const getEmojiMatchById = query({
  args: { gameId: v.id("emojiMatchGames") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// ─── Trace queries ───────────────────────────────────────────────────────────
// Trace rows hold game and participant ids, so every trace query must be scoped to one room.

export const getEmTraceByRoom = query({
  args: {
    roomId: v.id("rooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("emojiMatchGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const game = games.find((g) => g.status === "active" || g.status === "resolving")
      ?? games.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!game) return [];
    const entries = await ctx.db
      .query("emTrace")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();
    return entries.sort((a, b) => b.ts - a.ts).slice(0, args.limit ?? 200);
  },
});
