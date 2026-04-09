import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendTextMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    text: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const text = args.text.trim();
    if (!text) throw new Error("Message cannot be empty");
    if (text.length > 2000) throw new Error("Message too long (max 2000 characters)");

    // If all online participants only want English (no Japanese/Romaji), skip translation
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const onlineParticipants = participants.filter((p) => p.online);
    const allEnglishOnly = onlineParticipants.length > 0 &&
      onlineParticipants.every((p) => {
        const ds = p.displaySettings;
        if (ds) {
          // If they have display settings, check that Japanese and Romaji are off
          return !ds.showJapanese && !ds.showRomaji;
        }
        // No display settings saved yet — fall back to preferredLanguage
        return p.preferredLanguage === "en";
      });

    const now = Date.now();

    if (allEnglishOnly) {
      // Simple chat mode — no translation needed
      return await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: args.senderId,
        kind: "text",
        status: "processed",
        text,
        replyToId: args.replyToId,
        createdAt: now,
        processedAt: now,
      });
    }

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "text",
      status: "pending",
      text,
      replyToId: args.replyToId,
      createdAt: now,
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendImageMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    storageId: v.id("_storage"),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const mediaUrl = await ctx.storage.getUrl(args.storageId);
    if (!mediaUrl) throw new Error("Failed to get file URL");

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "image",
      status: "processed",
      mediaUrl,
      replyToId: args.replyToId,
      createdAt: Date.now(),
      processedAt: Date.now(),
    });
  },
});

export const sendDrawingMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    mediaUrl: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "drawing",
      status: "processed", // drawings don't need text processing
      mediaUrl: args.mediaUrl,
      replyToId: args.replyToId,
      createdAt: Date.now(),
      processedAt: Date.now(),
    });
  },
});

export const submitProcessedMessage = mutation({
  args: {
    messageId: v.id("messages"),
    processing: v.object({
      translatedText: v.optional(v.string()),
      romaji: v.optional(v.string()),
      suggestions: v.optional(v.array(v.string())),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      status: "processed",
      processing: args.processing,
      processedAt: Date.now(),
    });
  },
});

export const markMessageFailed = mutation({
  args: {
    messageId: v.id("messages"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      status: "failed",
      processing: { error: args.error },
      processedAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Delete associated reactions
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(args.messageId);
  },
});

export const getRoomMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId_createdAt", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getMessageById = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const getPendingMessagesForProcessor = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId_status", (q) =>
        q.eq("roomId", args.roomId).eq("status", "pending")
      )
      .collect();
  },
});
