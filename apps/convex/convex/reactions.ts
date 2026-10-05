import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { authFail, requireCaller } from "./participants";

const SUPPORTED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!SUPPORTED_REACTIONS.includes(args.emoji)) {
      throw new Error("Unsupported reaction emoji");
    }

    const caller = await requireCaller(ctx, args.participantId, args.token, "reactions.addReaction");
    const message = await ctx.db.get(args.messageId);
    // Deleted while the tap was on its way. Not an error, and a reaction to nothing would outlive the room's purge
    if (!message) return null;
    if (caller && message.roomId !== caller.roomId) authFail("reactions.addReaction", "message not in this room");

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
      // The message's room: what getRoomReactionSummaries finds a room's reactions by
      roomId: message.roomId,
    });
  },
});

export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "reactions.removeReaction");
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

/**
 * The reactions of a room, for each message that has any: who gave which emoji.
 *
 * A room with `reactionsByRoom` holds no reaction without its id (schema.ts), so one index range is all of
 * them, however long the chat is. The entries then come in the order of each message's oldest reaction; a
 * client finds a message's entry by its id.
 *
 * Any other room may hold reactions that have no roomId. Those are found through the room's messages, one
 * index range for each message, and the entries come in the order of the chat. A function may read 4,096
 * index ranges, and the room and its messages take one each, so such a room is refused from its 4,095th
 * message on.
 */
export const getRoomReactionSummaries = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (room?.reactionsByRoom) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
        .collect();

      const byMessage = new Map<string, Map<string, string[]>>();
      for (const r of reactions) {
        const byEmoji = byMessage.get(r.messageId) ?? new Map<string, string[]>();
        const list = byEmoji.get(r.emoji) ?? [];
        list.push(`${r.participantId}`);
        byEmoji.set(r.emoji, list);
        byMessage.set(r.messageId, byEmoji);
      }

      return Array.from(byMessage.entries()).map(([messageId, byEmoji]) => ({
        messageId,
        reactions: Array.from(byEmoji.entries()).map(([emoji, pids]) => ({
          emoji,
          count: pids.length,
          participantIds: pids,
        })),
      }));
    }

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

/**
 * Reactions one step of fillReactionRoomIds reads. Kept small: a step reads each one's message whole, and a
 * message that holds a drawing as a data URL can be close to the 1 MiB document limit, so ten of them are
 * still inside the 16 MiB one function may read.
 */
const FILL_ROOM_IDS_PER_STEP = 10;

/**
 * Gives every reaction that has no roomId the room of its message. No function and no client calls it. It
 * is there to be run by hand, `npx convex run reactions:fillReactionRoomIds`, should a room with
 * `reactionsByRoom` ever hold a reaction without one: its summaries do not show that reaction until this
 * has run. The reactions from before the field are given theirs as well. It marks no room.
 *
 * Each step reads a bounded number of the reactions that have no roomId and schedules the next, with
 * nothing carried between steps but the place in that index range. A reaction that has a roomId is never
 * read, so a chain that was stopped is taken up again by a new start, and a second run changes nothing. A
 * reaction whose message is gone is left as it is. Answers how many reactions the step gave a roomId.
 */
export const fillReactionRoomIds = internalMutation({
  // Set by the chain itself. A call without it starts at the first such reaction
  args: { cursor: v.optional(v.string()) },
  returns: v.number(),
  handler: async (ctx, args): Promise<number> => {
    const { page, isDone, continueCursor } = await ctx.db
      .query("reactions")
      .withIndex("by_roomId", (q) => q.eq("roomId", undefined))
      .paginate({ cursor: args.cursor ?? null, numItems: FILL_ROOM_IDS_PER_STEP });

    let filled = 0;
    for (const reaction of page) {
      const message = await ctx.db.get(reaction.messageId);
      if (!message) continue;
      await ctx.db.patch(reaction._id, { roomId: message.roomId });
      filled++;
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(0, internal.reactions.fillReactionRoomIds, { cursor: continueCursor });
    }
    return filled;
  },
});
