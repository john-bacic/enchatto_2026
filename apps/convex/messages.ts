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

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "text",
      status: "pending",
      text,
      replyToId: args.replyToId,
      createdAt: Date.now(),
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
