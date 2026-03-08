import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createRoom = mutation({
  args: {
    hostNickname: v.string(),
    hostAvatarId: v.optional(v.string()),
    settings: v.optional(
      v.object({
        sourceLanguage: v.string(),
        targetLanguage: v.string(),
        romajiEnabled: v.boolean(),
        suggestionsEnabled: v.boolean(),
        maxParticipants: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const nickname = args.hostNickname.trim();
    if (!nickname || nickname.length > 30) {
      throw new Error("Nickname must be 1–30 characters");
    }

    const joinCode = generateJoinCode();
    const now = Date.now();

    const settings = args.settings ?? {
      sourceLanguage: "ja",
      targetLanguage: "en",
      romajiEnabled: true,
      suggestionsEnabled: true,
      maxParticipants: 10,
    };

    if (settings.maxParticipants < 2 || settings.maxParticipants > 50) {
      throw new Error("Max participants must be between 2 and 50");
    }

    const roomId = await ctx.db.insert("rooms", {
      joinCode,
      status: "waiting",
      settings,
      hostId: "", // will be updated after host participant is created
      createdAt: now,
    });

    // Create host participant
    const hostId = await ctx.db.insert("participants", {
      roomId,
      nickname,
      role: "host",
      platform: "ios",
      avatar: { type: "preset", value: args.hostAvatarId ?? "default" },
      preferredLanguage: settings.sourceLanguage,
      online: true,
      lastSeenAt: now,
      joinedAt: now,
    });

    // Update room with host ID
    await ctx.db.patch(roomId, { hostId: hostId });

    return { roomId, joinCode, hostId };
  },
});

export const closeRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") return; // already closed

    await ctx.db.patch(args.roomId, {
      status: "closed",
      closedAt: Date.now(),
    });

    // Set all participants offline
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    await Promise.all(
      participants.map((p) =>
        ctx.db.patch(p._id, { online: false, lastSeenAt: Date.now() })
      )
    );
  },
});

export const getRoomByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .first();
  },
});

export const getRoomState = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    return { room, participants };
  },
});

export const updateRoomSettings = mutation({
  args: {
    roomId: v.id("rooms"),
    settings: v.object({
      sourceLanguage: v.string(),
      targetLanguage: v.string(),
      romajiEnabled: v.boolean(),
      suggestionsEnabled: v.boolean(),
      maxParticipants: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Cannot update a closed room");

    await ctx.db.patch(args.roomId, { settings: args.settings });
  },
});

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
