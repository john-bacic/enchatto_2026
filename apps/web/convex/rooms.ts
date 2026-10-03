import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { isSupportedLanguage } from "./participants";

// Must match the texture lists on web (lib/textures.ts) and iOS (RoomTexture.swift).
const BACKGROUND_COUNT = 10;

export const createRoom = mutation({
  args: {
    hostNickname: v.string(),
    hostAvatarId: v.optional(v.string()),
    hostLanguage: v.optional(v.string()),
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

    const lastRoom = await ctx.db.query("rooms").order("desc").first();
    let background = Math.floor(Math.random() * (BACKGROUND_COUNT - 1));
    if (lastRoom?.background !== undefined && background >= lastRoom.background) background++;

    const roomId = await ctx.db.insert("rooms", {
      joinCode,
      status: "waiting",
      settings,
      hostId: "", // will be updated after host participant is created
      createdAt: now,
      background,
    });

    // Create host participant
    const hostId = await ctx.db.insert("participants", {
      roomId,
      nickname,
      role: "host",
      platform: "ios",
      avatar: { type: "preset", value: args.hostAvatarId ?? "default" },
      // The host's own language. Builds that do not send it keep the old value, the room's source language
      preferredLanguage: isSupportedLanguage(args.hostLanguage) ? args.hostLanguage : settings.sourceLanguage,
      online: true,
      lastSeenAt: now,
      joinedAt: now,
    });

    // Update room with host ID
    await ctx.db.patch(roomId, { hostId: hostId });

    return { roomId, joinCode, hostId };
  },
});

async function closeRoomNow(ctx: MutationCtx, roomId: Id<"rooms">) {
  await ctx.db.patch(roomId, {
    status: "closed",
    closedAt: Date.now(),
  });

  // Set all participants offline
  const participants = await ctx.db
    .query("participants")
    .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
    .collect();

  await Promise.all(
    participants.map((p) =>
      ctx.db.patch(p._id, { online: false, departed: true, lastSeenAt: Date.now() })
    )
  );

  await ctx.scheduler.runAfter(0, internal.messages.purgeRoomAudio, { roomId });
}

export const closeRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") return; // already closed
    await closeRoomNow(ctx, args.roomId);
  },
});

/**
 * The iOS host sends a heartbeat every 15s while the app is open, and iOS gives no reliable signal
 * when an app is killed. A room whose host has been silent this long is treated as abandoned.
 * Long enough to survive a locked phone or a quick switch to another app mid-conversation.
 */
const HOST_GONE_MS = 15 * 60 * 1000;
/** Keeps one run well inside mutation limits; a backlog drains over successive runs */
const MAX_CLOSES_PER_RUN = 100;

export const closeAbandonedRooms = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = Date.now() - HOST_GONE_MS;
    let closed = 0;
    for (const status of ["waiting", "active"] as const) {
      const rooms = await ctx.db
        .query("rooms")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      for (const room of rooms) {
        if (closed >= MAX_CLOSES_PER_RUN) return closed;
        const hostId = ctx.db.normalizeId("participants", room.hostId);
        const host = hostId ? await ctx.db.get(hostId) : null;
        if (host && host.lastSeenAt >= cutoff) continue;
        await closeRoomNow(ctx, room._id);
        closed++;
      }
    }
    return closed;
  },
});

const TRACE_PURGE_BATCH = 500;

/**
 * Game trace rows hold full game and participant ids. Run once to empty the trace tables:
 * `npx convex run rooms:purgeGameTraces`. It reschedules itself until nothing is left.
 */
export const purgeGameTraces = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    let deleted = 0;
    for (const table of ["emTrace", "todTrace", "bingoTrace"] as const) {
      const rows = await ctx.db.query(table).take(TRACE_PURGE_BATCH - deleted);
      for (const row of rows) await ctx.db.delete(row._id);
      deleted += rows.length;
      if (deleted >= TRACE_PURGE_BATCH) break;
    }
    if (deleted >= TRACE_PURGE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.rooms.purgeGameTraces, {});
    }
    return deleted;
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
