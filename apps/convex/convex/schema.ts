import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    joinCode: v.string(),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("closed")),
    settings: v.object({
      sourceLanguage: v.string(),
      targetLanguage: v.string(),
      romajiEnabled: v.boolean(),
      suggestionsEnabled: v.boolean(),
      maxParticipants: v.number(),
    }),
    hostId: v.string(),
    createdAt: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_joinCode", ["joinCode"])
    .index("by_status", ["status"]),

  participants: defineTable({
    roomId: v.id("rooms"),
    nickname: v.string(),
    role: v.union(v.literal("host"), v.literal("participant")),
    platform: v.union(v.literal("ios"), v.literal("web")),
    avatar: v.object({
      type: v.union(v.literal("preset"), v.literal("custom")),
      value: v.string(),
    }),
    preferredLanguage: v.string(),
    online: v.boolean(),
    departed: v.optional(v.boolean()),
    presence: v.optional(v.union(v.literal("online"), v.literal("away"))),
    typingAction: v.optional(v.union(v.literal("typing"), v.literal("drawing"), v.literal("voicing"))),
    drawingStartedAt: v.optional(v.number()),
    lastSeenAt: v.number(),
    joinedAt: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_role", ["roomId", "role"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    kind: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("drawing"),
      v.literal("system")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("failed")
    ),
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    processing: v.optional(
      v.object({
        translatedText: v.optional(v.string()),
        romaji: v.optional(v.string()),
        suggestions: v.optional(v.array(v.string())),
        error: v.optional(v.string()),
      })
    ),
    replyToId: v.optional(v.id("messages")),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"])
    .index("by_roomId_createdAt", ["roomId", "createdAt"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_messageId_participantId", ["messageId", "participantId"]),

  gameSessions: defineTable({
    roomId: v.id("rooms"),
    gameType: v.string(),
    status: v.union(v.literal("active"), v.literal("complete")),
    createdByParticipantId: v.id("participants"),
    playerIds: v.array(v.id("participants")),
    playerOrder: v.optional(v.array(v.id("participants"))),
    chainCount: v.number(),
    level: v.optional(v.number()),
    timerEnabled: v.optional(v.union(v.boolean(), v.number())),
    customPrompts: v.optional(v.array(v.object({
      text: v.string(),
      ja: v.string(),
      hint: v.optional(v.string()),
      hintJa: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    cancelled: v.optional(v.boolean()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  emojifyrRounds: defineTable({
    gameSessionId: v.id("gameSessions"),
    roundIndex: v.number(),
    writerParticipantId: v.id("participants"),
    originalSentence: v.optional(v.string()),
    translatedSentence: v.optional(v.string()),
    emojiClue: v.optional(v.string()),
    status: v.union(
      v.literal("writing"),
      v.literal("generating"),
      v.literal("preview"),
      v.literal("guessing"),
      v.literal("reveal"),
      v.literal("complete")
    ),
    isInitialism: v.optional(v.boolean()),
    hintEn: v.optional(v.string()),
    hintJa: v.optional(v.string()),
    maxCharacters: v.number(),
    startedAt: v.number(),
    revealedAt: v.optional(v.number()),
  })
    .index("by_gameSessionId", ["gameSessionId"]),

  emojifyrGuesses: defineTable({
    roundId: v.id("emojifyrRounds"),
    participantId: v.id("participants"),
    guessText: v.string(),
    translatedGuessText: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_roundId", ["roundId"]),

  emojiMatchGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("lobby"),
      v.literal("active"),
      v.literal("resolving"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    players: v.array(v.object({
      participantId: v.id("participants"),
      nickname: v.string(),
      avatarValue: v.string(),
      joinedAt: v.number(),
      isActive: v.boolean(),
      score: v.number(),
    })),
    turnOrder: v.array(v.id("participants")),
    currentTurnParticipantId: v.optional(v.id("participants")),
    board: v.array(v.object({
      cardId: v.string(),
      pairKey: v.string(),
      content: v.object({
        kind: v.string(),
        value: v.string(),
        label: v.optional(v.string()),
      }),
      isMatched: v.boolean(),
      isRevealed: v.boolean(),
    })),
    selectedCardIds: v.array(v.string()),
    matchedPairCount: v.number(),
    totalPairs: v.number(),
    boardRows: v.number(),
    boardCols: v.number(),
    turnTimeoutMs: v.optional(v.number()),
    mismatchRevealMs: v.number(),
    result: v.optional(v.object({
      winnerParticipantIds: v.array(v.id("participants")),
      isTie: v.boolean(),
      endReason: v.string(),
    })),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    turnStartedAt: v.optional(v.number()),
    resolveAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  truthOrDareGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    promptMode: v.optional(v.union(v.literal("normal"), v.literal("deep"), v.literal("spicy"))),
    playerOrder: v.array(v.id("participants")),
    currentTurnIndex: v.number(),
    currentTurnParticipantId: v.optional(v.id("participants")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  truthOrDareTurns: defineTable({
    gameId: v.id("truthOrDareGames"),
    turnIndex: v.number(),
    participantId: v.id("participants"),
    choice: v.optional(v.union(v.literal("truth"), v.literal("dare"))),
    promptId: v.optional(v.string()),
    promptText: v.optional(v.string()),
    promptResponseType: v.optional(v.union(
      v.literal("text"),
      v.literal("photo"),
      v.literal("drawing")
    )),
    responseText: v.optional(v.string()),
    translatedResponseText: v.optional(v.string()),
    responseMediaUrl: v.optional(v.string()),
    ratings: v.optional(v.array(v.object({
      participantId: v.id("participants"),
      score: v.number(),
    }))),
    status: v.union(
      v.literal("waiting_for_choice"),
      v.literal("waiting_for_response"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_status", ["gameId", "status"]),

  gameChains: defineTable({
    gameSessionId: v.id("gameSessions"),
    chainIndex: v.number(),
    originalPrompt: v.string(),
    options: v.optional(v.array(v.string())),
    drawerParticipantId: v.optional(v.id("participants")),
    status: v.union(v.literal("active"), v.literal("complete")),
    currentStepIndex: v.number(),
    maxSteps: v.number(),
  })
    .index("by_gameSessionId", ["gameSessionId"]),

  gameSteps: defineTable({
    gameSessionId: v.id("gameSessions"),
    chainId: v.id("gameChains"),
    stepIndex: v.number(),
    stepType: v.union(v.literal("draw"), v.literal("guess")),
    assignedParticipantId: v.id("participants"),
    inputText: v.optional(v.string()),
    hintText: v.optional(v.string()),
    inputDrawingUrl: v.optional(v.string()),
    outputText: v.optional(v.string()),
    translatedOutputText: v.optional(v.string()),
    outputDrawingUrl: v.optional(v.string()),
    selectedOption: v.optional(v.string()),
    correct: v.optional(v.boolean()),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("submitted")),
    createdAt: v.number(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_gameSessionId", ["gameSessionId"])
    .index("by_chainId", ["chainId"])
    .index("by_assignedParticipantId_status", ["assignedParticipantId", "status"]),
});
