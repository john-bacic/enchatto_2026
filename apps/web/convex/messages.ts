import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

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

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "text",
      status: "pending",
      text,
      replyToId: args.replyToId,
      createdAt: now,
    });

    // Always translate server-side (EN↔JA + romaji)
    await ctx.scheduler.runAfter(0, internal.messages.translateMessageServerSide, {
      messageId,
      roomId: args.roomId,
    });

    return messageId;
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

// --- Server-side translation (fallback when no iOS host is online) ---

function detectLanguage(text: string): "en" | "ja" {
  const cjkRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/;
  return cjkRegex.test(text) ? "ja" : "en";
}

async function callClaude(apiKey: string, prompt: string, maxTokens = 512): Promise<string | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

export const translateMessageServerSide = internalAction({
  args: {
    messageId: v.id("messages"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(
      internal.messages.getMessageByIdInternal,
      { messageId: args.messageId }
    );
    if (!message || message.status !== "pending" || !message.text) return;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.messages.markMessageFailedInternal, {
        messageId: args.messageId,
        error: "Translation unavailable (no API key)",
      });
      return;
    }

    const text = message.text;
    const sourceLang = detectLanguage(text);
    const targetLang = sourceLang === "ja" ? "en" : "ja";
    const fromName = sourceLang === "ja" ? "Japanese" : "English";
    const toName = targetLang === "ja" ? "Japanese" : "English";

    // Translate
    const translatedText = await callClaude(
      apiKey,
      `Translate the following ${fromName} text to ${toName}. Output only the translation, nothing else.\n\n${text}`,
      512
    );

    // Generate romaji if the result or source is Japanese
    let romaji: string | undefined;
    const japaneseText = sourceLang === "ja" ? text : translatedText;
    if (japaneseText) {
      const romajiResult = await callClaude(
        apiKey,
        `Convert the following Japanese text to romaji. Output only the romaji, nothing else.\n\n${japaneseText}`,
        256
      );
      if (romajiResult) romaji = romajiResult;
    }

    await ctx.runMutation(internal.messages.submitProcessedInternal, {
      messageId: args.messageId,
      processing: {
        translatedText: translatedText ?? undefined,
        romaji,
      },
    });
  },
});

export const getMessageByIdInternal = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const submitProcessedInternal = internalMutation({
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

export const markMessageFailedInternal = internalMutation({
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
