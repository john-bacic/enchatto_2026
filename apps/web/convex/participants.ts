import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

/** A heartbeat arrives every 15 s from a visible web tab and from the iOS host */
export const PRESENT_WITHIN_MS = 45_000;

/**
 * Whether someone is actually here right now, for deciding who to deal into a game or wait for.
 * `online` alone is not enough: it only goes false through the unload beacon or the hourly sweep,
 * so a pocketed phone stays "online" long after its owner stopped looking.
 */
export function isPresent(p: Doc<"participants"> | null | undefined, now: number): boolean {
  return (
    !!p &&
    p.online &&
    !p.departed &&
    p.presence !== "away" &&
    now - p.lastSeenAt < PRESENT_WITHIN_MS
  );
}

const AROUND_WITHIN_MS = 3 * 60_000;

/**
 * Whether someone was here recently enough to be dealt into a game that has no way to join later.
 * Looser than isPresent on purpose: a phone that dimmed while the host explained the rules should
 * still get a seat. Each game's own timeout moves past them if they do not come back.
 */
export function isAround(p: Doc<"participants"> | null | undefined, now: number): boolean {
  return !!p && p.online && !p.departed && now - p.lastSeenAt < AROUND_WITHIN_MS;
}

/** Languages the apps offer. preferredLanguage picks a player's Word Rush direction, the language of Lost in Translation prompts, the host's join push and the badge others see */
export const SUPPORTED_LANGUAGES = ["en", "ja"] as const;

export function isSupportedLanguage(value: unknown): value is (typeof SUPPORTED_LANGUAGES)[number] {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Push "X joined" to the iOS host when they're not looking at the room */
async function notifyHostOfJoin(
  ctx: MutationCtx,
  room: Doc<"rooms">,
  participants: Doc<"participants">[],
  nickname: string
) {
  const host = participants.find((p) => p._id === room.hostId);
  if (!host || (host.online && host.presence !== "away")) return;
  const pushToken = await ctx.db
    .query("hostPushTokens")
    .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
    .first();
  if (!pushToken) return;
  const ja = host.preferredLanguage.startsWith("ja");
  await ctx.scheduler.runAfter(0, internal.push.sendToHost, {
    roomId: room._id,
    token: pushToken.token,
    title: "Enchatto",
    body: ja ? `${nickname}さんがルーム${room.joinCode}に参加しました` : `${nickname} joined room ${room.joinCode}`,
  });
}

export const setHostPushToken = mutation({
  args: { roomId: v.id("rooms"), hostId: v.string(), token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== args.hostId) throw new Error("Only the host can register for notifications");
    if (!/^[0-9a-f]{64,200}$/i.test(args.token)) throw new Error("Invalid device token");
    const existing = await ctx.db
      .query("hostPushTokens")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (existing) await ctx.db.patch(existing._id, { token: args.token });
    else await ctx.db.insert("hostPushTokens", { roomId: args.roomId, token: args.token });
    return null;
  },
});

export const clearHostPushToken = internalMutation({
  args: { roomId: v.id("rooms"), token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hostPushTokens")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (existing?.token === args.token) await ctx.db.delete(existing._id);
    return null;
  },
});

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
    displaySettings: v.optional(v.object({
      showEnglish: v.boolean(),
      showJapanese: v.boolean(),
      showRomaji: v.boolean(),
    })),
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

    // Check for existing offline participant with same nickname + avatar (case-insensitive)
    const existing = participants.find(
      (p) =>
        !p.online &&
        p.nickname.toLowerCase().trim() === nickname.toLowerCase() &&
        p.avatar.value === args.avatar.value &&
        p.role !== "host"
    );

    if (existing) {
      const now = Date.now();
      await ctx.db.patch(existing._id, {
        online: true,
        departed: undefined,
        presence: "online",
        lastSeenAt: now,
        platform: args.platform,
        preferredLanguage: args.preferredLanguage,
        displaySettings: args.displaySettings,
      });

      // Insert system message for rejoin
      await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: existing._id,
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

      await notifyHostOfJoin(ctx, room, participants, nickname);
      return existing._id;
    }

    const onlineCount = participants.filter((p) => p.online).length;
    if (onlineCount >= room.settings.maxParticipants) {
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
      displaySettings: args.displaySettings,
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

    await notifyHostOfJoin(ctx, room, participants, nickname);
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
      departed: true,
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
      // The unload beacon and the stale sweep both set departed; someone who is back is not departed.
      // "away" does not count as back: a closing tab sends it right after its leave beacon.
      ...(args.online && args.presence !== "away" ? { departed: undefined } : {}),
    });

    if (participant) {
      const isHost = participant.role === "host";

      // Host: no system messages for presence changes
      if (!isHost) {
        // Non-host: keep existing leave/join messages
        if (participant.online && !args.online) {
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
        if (!participant.online && args.online) {
          await ctx.db.insert("messages", {
            roomId: participant.roomId,
            senderId: args.participantId,
            kind: "system",
            status: "processed",
            text: `join:${participant.nickname}`,
            createdAt: now,
            processedAt: now,
          });
        }
      }
    }
  },
});

export const setTypingAction = mutation({
  args: {
    participantId: v.id("participants"),
    action: v.optional(v.union(v.literal("typing"), v.literal("drawing"), v.literal("voicing"))),
    drawingStartedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      typingAction: args.action,
      drawingStartedAt: args.action === "drawing" ? args.drawingStartedAt : undefined,
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

export const updateDisplaySettings = mutation({
  args: {
    participantId: v.id("participants"),
    displaySettings: v.object({
      showEnglish: v.boolean(),
      showJapanese: v.boolean(),
      showRomaji: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      displaySettings: args.displaySettings,
    });
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

export const updateParticipantLanguage = mutation({
  args: {
    participantId: v.id("participants"),
    language: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!isSupportedLanguage(args.language)) throw new Error("Unsupported language");
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    // Word Rush keeps the direction a player joined a lobby with; everything else reads this field live
    if (participant.preferredLanguage !== args.language) {
      await ctx.db.patch(args.participantId, { preferredLanguage: args.language });
    }
    return null;
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
// "online" + 45s no heartbeat → mark as "away" (safety net)
export const cleanupStaleParticipants = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const awayOfflineCutoff = now - 30 * 1000; // away users go offline after 30s
    // Never mark away someone isPresent still accepts: games skip a player who reads as away
    const onlineAwayCutoff = now - PRESENT_WITHIN_MS;
    const allParticipants = await ctx.db.query("participants").collect();
    for (const p of allParticipants) {
      if (!p.online) continue;
      if (p.presence === "away" && p.lastSeenAt < awayOfflineCutoff) {
        // Mark offline and departed — remove from participant list
        await ctx.db.patch(p._id, { online: false, departed: true, presence: undefined, typingAction: undefined });
      } else if (p.presence !== "away" && p.lastSeenAt < onlineAwayCutoff) {
        await ctx.db.patch(p._id, { presence: "away", typingAction: undefined });
      }
    }
  },
});
