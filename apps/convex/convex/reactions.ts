import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SUPPORTED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    if (!SUPPORTED_REACTIONS.includes(args.emoji)) {
      throw new Error("Unsupported reaction emoji");
    }

    // Check for existing reaction with same emoji from same participant
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_messageId_participantId", (q) =>
        q.eq("messageId", args.messageId).eq("participantId", args.participantId)
      )
      .collect();

    const alreadyReacted = existing.find((r) => r.emoji === args.emoji);
    if (alreadyReacted) return alreadyReacted._id;

    return await ctx.db.insert("reactions", {
      messageId: args.messageId,
      participantId: args.participantId,
      emoji: args.emoji,
      createdAt: Date.now(),
    });
  },
});

export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_messageId_participantId", (q) =>
        q.eq("messageId", args.messageId).eq("participantId", args.participantId)
      )
      .collect();

    const reaction = existing.find((r) => r.emoji === args.emoji);
    if (reaction) {
      await ctx.db.delete(reaction._id);
    }
  },
});

export const getReactionsForMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();
  },
});

export const getReactionSummary = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();

    if (reactions.length === 0) return [];

    const map = new Map<string, string[]>();
    for (const r of reactions) {
      const list = map.get(r.emoji) ?? [];
      list.push(`${r.participantId}`);
      map.set(r.emoji, list);
    }

    return Array.from(map.entries()).map(([emoji, pids]) => ({
      emoji,
      count: pids.length,
      participantIds: pids,
    }));
  },
});

export const getRoomReactionSummaries = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const result: Array<{
      messageId: string;
      reactions: Array<{ emoji: string; count: number; participantIds: string[] }>;
    }> = [];

    for (const msg of messages) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
        .collect();

      if (reactions.length === 0) continue;

      const map = new Map<string, string[]>();
      for (const r of reactions) {
        const list = map.get(r.emoji) ?? [];
        list.push(`${r.participantId}`);
        map.set(r.emoji, list);
      }

      result.push({
        messageId: `${msg._id}`,
        reactions: Array.from(map.entries()).map(([emoji, pids]) => ({
          emoji,
          count: pids.length,
          participantIds: pids,
        })),
      });
    }

    return result;
  },
});
