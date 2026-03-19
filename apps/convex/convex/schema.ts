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
