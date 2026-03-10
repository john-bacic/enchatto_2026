import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const joinRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    nickname: v.string(),
    platform: v.union(v.literal("ios"), v.literal("web")),
    avatar: v.object({
      type: v.union(v.literal("preset"), v.literal("custom")),
      value: v.string(),
    }),
    preferredLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const nickname = args.nickname.trim();
    if (!nickname || nickname.length > 30) {
      throw new Error("Nickname must be 1–30 characters");
    }

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (participants.length >= room.settings.maxParticipants) {
      throw new Error("Room is full");
    }

    const now = Date.now();
    const participantId = await ctx.db.insert("participants", {
      roomId: args.roomId,
      nickname,
      role: "participant",
      platform: args.platform,
      avatar: args.avatar,
      preferredLanguage: args.preferredLanguage,
      online: true,
      presence: "online",
      lastSeenAt: now,
      joinedAt: now,
    });

    // Insert system message for join
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: participantId,
      kind: "system",
      status: "processed",
      text: `join:${nickname}`,
      createdAt: now,
      processedAt: now,
    });

    // Activate room if still waiting
    if (room.status === "waiting") {
      await ctx.db.patch(args.roomId, { status: "active" });
    }

    return participantId;
  },
});

export const leaveRoom = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId);
    const now = Date.now();
    await ctx.db.patch(args.participantId, {
      online: false,
      lastSeenAt: now,
    });

    // Insert system message for leave
    if (participant && participant.online) {
      await ctx.db.insert("messages", {
        roomId: participant.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `leave:${participant.nickname}`,
        createdAt: now,
        processedAt: now,
      });
    }
  },
});

export const setParticipantOnline = mutation({
  args: {
    participantId: v.id("participants"),
    online: v.boolean(),
    presence: v.optional(v.union(v.literal("online"), v.literal("away"))),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId);
    const now = Date.now();
    await ctx.db.patch(args.participantId, {
      online: args.online,
      lastSeenAt: now,
      presence: args.online ? (args.presence ?? "online") : undefined,
    });

    // Insert system message when going offline
    if (participant && participant.online && !args.online) {
      await ctx.db.insert("messages", {
        roomId: participant.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `leave:${participant.nickname}`,
        createdAt: now,
        processedAt: now,
      });
    }

    // Insert system message when coming back online (rejoin)
    if (participant && !participant.online && args.online) {
      await ctx.db.insert("messages", {
        roomId: participant.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `${participant.nickname} has joined`,
        createdAt: now,
        processedAt: now,
      });
    }
  },
});

export const setTypingAction = mutation({
  args: {
    participantId: v.id("participants"),
    action: v.optional(v.union(v.literal("typing"), v.literal("drawing"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      typingAction: args.action,
    });
  },
});

export const updateParticipantAvatar = mutation({
  args: {
    participantId: v.id("participants"),
    avatar: v.object({
      type: v.union(v.literal("preset"), v.literal("custom")),
      value: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, { avatar: args.avatar });
  },
});

export const updateParticipantNickname = mutation({
  args: {
    participantId: v.id("participants"),
    nickname: v.string(),
  },
  handler: async (ctx, args) => {
    const nickname = args.nickname.trim();
    if (!nickname || nickname.length > 30) {
      throw new Error("Nickname must be 1–30 characters");
    }
    await ctx.db.patch(args.participantId, { nickname });
  },
});

export const kickParticipant = mutation({
  args: {
    participantId: v.id("participants"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.roomId !== args.roomId) throw new Error("Participant not in room");
    if (participant.role === "host") throw new Error("Cannot kick the host");

    await ctx.db.delete(args.participantId);
  },
});

export const getRoomParticipants = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

// Two-tier stale detection:
// "away" + 30s no heartbeat → offline (removed from list)
// "online" + 20s no heartbeat → mark as "away" (safety net)
export const cleanupStaleParticipants = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const awayOfflineCutoff = now - 30 * 1000; // away users go offline after 30s
    const onlineAwayCutoff = now - 20 * 1000;  // online users go away after 20s
    const allParticipants = await ctx.db.query("participants").collect();
    for (const p of allParticipants) {
      if (!p.online) continue;
      if (p.presence === "away" && p.lastSeenAt < awayOfflineCutoff) {
        await ctx.db.patch(p._id, { online: false, presence: undefined, typingAction: undefined });
        await ctx.db.insert("messages", {
          roomId: p.roomId,
          senderId: p._id,
          kind: "system",
          status: "processed",
          text: `leave:${p.nickname}`,
          createdAt: now,
          processedAt: now,
        });
      } else if (p.presence !== "away" && p.lastSeenAt < onlineAwayCutoff) {
        await ctx.db.patch(p._id, { presence: "away", typingAction: undefined });
      }
    }
  },
});
