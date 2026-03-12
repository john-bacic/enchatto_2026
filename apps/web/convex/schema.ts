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
});
