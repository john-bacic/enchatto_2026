import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

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

// ─── Caller tokens ───────────────────────────────────────────────────────────
// A participant id is on every guest's screen (rooms.getRoomState returns them all), so it cannot
// prove who is calling. Each client makes up a secret when it creates its participant and sends it
// with everything it does as that participant. The server cannot make the secret: mutations are
// deterministic.

/**
 * "log", the default, only reports what "enforce" would refuse, so this code can be live before
 * every client sends its token. Set per deployment: `npx convex env set AUTH_MODE enforce`.
 */
export function authMode(): "log" | "enforce" {
  return process.env.AUTH_MODE === "enforce" ? "enforce" : "log";
}

/**
 * A caller check failed. The same line is logged in both modes, so the log of a deployment in "log"
 * mode lists exactly the calls "enforce" would refuse.
 */
export function authFail(label: string, reason: string): void {
  console.warn(`auth: ${label} ${reason}`);
  if (authMode() === "enforce") throw new Error("Not authorised");
}

/** 32 random bytes are 43 characters as base64url and 64 as hex */
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43,128}$/;

// Not exported, and nothing may return what it reads: this is the only reader of the table
async function secretFor(ctx: QueryCtx | MutationCtx, participantId: Id<"participants">) {
  return await ctx.db
    .query("participantSecrets")
    .withIndex("by_participantId", (q) => q.eq("participantId", participantId))
    .first();
}

/** Looks at every character whatever matched before it, so the time taken says nothing about a guess */
function sameToken(given: string, stored: string): boolean {
  if (given.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < stored.length; i++) diff |= given.charCodeAt(i) ^ stored.charCodeAt(i);
  return diff === 0;
}

/**
 * Keeps the secret a client made up for its participant. A participant made without one is a legacy
 * participant: builds from before tokens send none, and are asked for none.
 */
export async function registerToken(
  ctx: MutationCtx,
  participantId: Id<"participants">,
  token: string | undefined
): Promise<void> {
  if (token === undefined) return;
  // Refused, not dropped: a client that sent a token believes its participant is protected
  if (!TOKEN_FORMAT.test(token)) throw new Error("Invalid token");
  await ctx.db.insert("participantSecrets", { participantId, token });
}

/**
 * The caller must be this participant. Returns the participant, or null when no caller was named
 * (only possible for functions that never took one) or the participant does not exist.
 */
export async function requireCaller(
  ctx: QueryCtx | MutationCtx,
  participantId: Id<"participants"> | undefined,
  token: string | undefined,
  label: string
): Promise<Doc<"participants"> | null> {
  if (participantId === undefined) return null;
  const participant = await ctx.db.get(participantId);
  if (!participant) {
    authFail(label, "unknown participant");
    return null;
  }
  const secret = await secretFor(ctx, participantId);
  // A legacy participant has nothing to check a token against, in either mode
  if (!secret) return participant;
  if (token === undefined) authFail(label, "no token");
  else if (!sameToken(token, secret.token)) authFail(label, "wrong token");
  return participant;
}

/** The caller must be this participant and a member of this room */
export async function requireMember(
  ctx: QueryCtx | MutationCtx,
  roomId: Id<"rooms">,
  participantId: Id<"participants"> | undefined,
  token: string | undefined,
  label: string
): Promise<Doc<"participants"> | null> {
  const caller = await requireCaller(ctx, participantId, token, label);
  if (caller && caller.roomId !== roomId) authFail(label, "not in this room");
  return caller;
}

/**
 * The caller must be the host of this room. Installed iOS builds name no caller on the host-only
 * routes (close, kick, the message processor), so when none is given the room's own host is
 * assumed, and has to prove it like any other caller.
 */
export async function requireHost(
  ctx: QueryCtx | MutationCtx,
  roomId: Id<"rooms">,
  callerId: Id<"participants"> | undefined,
  token: string | undefined,
  label: string
): Promise<void> {
  const room = await ctx.db.get(roomId);
  if (!room) return; // every caller reports a missing room in its own words
  const id = callerId ?? ctx.db.normalizeId("participants", room.hostId) ?? undefined;
  if (id === undefined) return authFail(label, "no host");
  const caller = await requireCaller(ctx, id, token, label);
  if (caller && (caller.role !== "host" || caller.roomId !== roomId)) authFail(label, "not the host");
}

// ─── Abuse limits ────────────────────────────────────────────────────────────
// Always on, whatever AUTH_MODE says: they bound what one participant or room can spend and store,
// not who is calling.

/**
 * Counts `cost` against `key` and says whether it still fits in `limit` per `windowMs`. A refused use
 * writes nothing. Windows are fixed, so a burst across a window edge can reach twice the limit.
 * Wherever a user's own request takes the limit, the key names one participant or room: a row that
 * everyone writes makes unrelated users' mutations conflict and retry.
 */
export async function takeRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
  cost: number = 1
): Promise<boolean> {
  const now = Date.now();
  // Never two rows for a key: two first uses read the same empty index range, so one of them retries and finds the row
  const row = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (!row) {
    await ctx.db.insert("rateLimits", { key, windowStart: now, count: cost });
    return true;
  }
  if (now - row.windowStart >= windowMs) {
    await ctx.db.patch(row._id, { windowStart: now, count: cost });
    return true;
  }
  if (row.count + cost > limit) return false;
  await ctx.db.patch(row._id, { count: row.count + cost });
  return true;
}

/** Largest drawing a route stores, decoded. A real one is flat line art from a phone or iPad canvas: well under 1 MB, a few at worst */
export const DRAWING_MAX_BYTES = 8 * 1024 * 1024;
/** A drawing kept in the document itself (game steps, the web's offline queue). Longer never worked: a document holds 1 MiB */
const INLINE_DRAWING_MAX_CHARS = 1024 * 1024;

/** A PNG or JPEG data URL, which is all either app draws. A link is never a drawing: every viewer's device would fetch it */
export function isInlineDrawing(url: string): boolean {
  return (
    url.length <= INLINE_DRAWING_MAX_CHARS &&
    (url.startsWith("data:image/png;base64,") || url.startsWith("data:image/jpeg;base64,"))
  );
}

/**
 * URL of a drawing a route stored. The routes check type and size before storing, so a file that fails here
 * reached storage another way. A file with no recorded type passes: every drawing depends on this check, and
 * it must not depend on storage having kept the type the route gave it.
 */
export async function storedDrawingUrl(ctx: MutationCtx, storageId: Id<"_storage">): Promise<string> {
  const file = await ctx.db.system.get(storageId);
  if (
    !file ||
    file.size > DRAWING_MAX_BYTES ||
    (!!file.contentType && file.contentType !== "image/png" && file.contentType !== "image/jpeg")
  ) {
    throw new Error("Unsupported drawing");
  }
  const url = await ctx.storage.getUrl(storageId);
  if (!url) throw new Error("Failed to get file URL");
  return url;
}

/**
 * The voice message that holds this file, if any. Messages show audioStorageId to the room, and whatever
 * holds a file deletes it later (deleteMessage, purgeRoomAudio, a finished Word Rush game, dictation),
 * so attaching someone else's clip to something of your own would be a way to delete it.
 */
export async function heldByVoiceMessage(
  ctx: QueryCtx | MutationCtx,
  storageId: Id<"_storage">
): Promise<Doc<"messages"> | null> {
  return await ctx.db
    .query("messages")
    .withIndex("by_audioStorageId", (q) => q.eq("audioStorageId", storageId))
    .first();
}

/**
 * Deletes a file unless it is already gone, which must not fail the mutation: two rows can point at
 * one file, and a purge can be stopped and run again. The lookup and the delete are one transaction,
 * so the file cannot go in between.
 */
export async function deleteStoredFile(ctx: MutationCtx, storageId: Id<"_storage">): Promise<void> {
  if (await ctx.db.system.get(storageId)) await ctx.storage.delete(storageId);
}

/** Push "X joined" to the iOS host when they're not looking at the room */
async function notifyHostOfJoin(
  ctx: MutationCtx,
  room: Doc<"rooms">,
  participants: Doc<"participants">[],
  nickname: string
) {
  const host = participants.find((p) => p._id === room.hostId);
  // Not the stored flags alone: an app that was killed or crashed never said "away" and still reads online
  if (!host || isPresent(host, Date.now())) return;
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
  // `token` is the APNs device token, so here alone the caller's own token arrives as callerToken
  args: { roomId: v.id("rooms"), hostId: v.string(), token: v.string(), callerToken: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== args.hostId) throw new Error("Only the host can register for notifications");
    // No caller id: the line above has just established that the caller claims to be the room's host
    await requireHost(ctx, args.roomId, undefined, args.callerToken, "participants.setHostPushToken");
    // A caller token is 64 hex characters and passes the format check below. One sent in `token` by
    // mistake would be stored here and sent to Apple as a device token.
    const hostId = ctx.db.normalizeId("participants", room.hostId);
    const secret = hostId ? await secretFor(ctx, hostId) : null;
    if (secret && sameToken(args.token, secret.token)) throw new Error("Invalid device token");
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

// Six times the largest room. The online limit in joinRoom can be stepped around by going offline and
// joining again; this bounds the rows, join messages and rate-limit keys one room can make.
const MAX_ROOM_MEMBERS_EVER = 300;

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
    // The caller token this browser made for the room (registerToken). Builds that send none make a legacy participant
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const nickname = args.nickname.trim();
    if (!nickname || nickname.length > 30) {
      throw new Error("Nickname must be 1–30 characters");
    }
    // Both apps send a preset's id and "en" or "ja". Length only, so a build that sends another code is not refused
    if (args.avatar.value.length > 64) throw new Error("Invalid avatar");
    if (args.preferredLanguage.length > 16) throw new Error("Unsupported language");

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Someone coming back: an offline participant with the same nickname and avatar (case-insensitive).
    // Both are on every guest's screen, so once a participant has a token they prove nothing: only the
    // same token gets it back, and anyone else joins as a new participant. A legacy participant is
    // handed over on name and avatar as before, and takes the caller's token. Not while enforcing: its
    // owner sends no token and would be refused from then on, so a caller with a token joins as new.
    const legacyHandover = args.token === undefined || authMode() !== "enforce";
    let existing: Doc<"participants"> | undefined;
    let existingIsLegacy = false;
    for (const p of participants) {
      if (
        p.online ||
        p.role === "host" ||
        p.nickname.toLowerCase().trim() !== nickname.toLowerCase() ||
        p.avatar.value !== args.avatar.value
      ) {
        continue;
      }
      const secret = await secretFor(ctx, p._id);
      if (!secret) {
        if (!existing && legacyHandover) {
          existing = p;
          existingIsLegacy = true;
        }
      } else if (args.token !== undefined && sameToken(args.token, secret.token)) {
        existing = p;
        existingIsLegacy = false;
        break;
      }
    }

    if (existing) {
      // The caller will present its token for this participant from now on, so it has to be the one on record
      if (existingIsLegacy) await registerToken(ctx, existing._id, args.token);
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

    // After the branch above: someone coming back reuses their row
    if (participants.length >= MAX_ROOM_MEMBERS_EVER) throw new Error("Room is full");
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
    await registerToken(ctx, participantId, args.token);

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
  args: { participantId: v.id("participants"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const participant = await requireCaller(ctx, args.participantId, args.token, "participants.leaveRoom");
    const now = Date.now();
    await ctx.db.patch(args.participantId, {
      online: false,
      departed: true,
      lastSeenAt: now,
      // Both apps show whoever has a typingAction, online or not, and a closed tab cannot clear its own
      typingAction: undefined,
      drawingStartedAt: undefined,
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
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const participant = await requireCaller(ctx, args.participantId, args.token, "participants.setParticipantOnline");
    const now = Date.now();
    // "away" says the tab or app went to the background, which is not an arrival. A closing tab sends it
    // right after its leave beacon and the two can land in either order, so someone who is offline stays
    // offline and is not announced. They were still heard from: a host the sweep took offline keeps its
    // room open with these pings from the background (rooms.closeAbandonedRooms).
    if (participant && !participant.online && args.online && args.presence === "away") {
      await ctx.db.patch(args.participantId, { lastSeenAt: now });
      return;
    }
    await ctx.db.patch(args.participantId, {
      online: args.online,
      lastSeenAt: now,
      presence: args.online ? (args.presence ?? "online") : undefined,
      // The unload beacon and the stale sweep both set departed; someone who is back is not departed.
      // "away" does not count as back: a closing tab sends it right after its leave beacon.
      ...(args.online && args.presence !== "away" ? { departed: undefined } : {}),
      // Gone offline, as in leaveRoom: nobody is left to clear what they were shown as doing
      ...(args.online ? {} : { typingAction: undefined, drawingStartedAt: undefined }),
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
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "participants.setTypingAction");
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
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "participants.updateParticipantAvatar");
    if (args.avatar.value.length > 64) throw new Error("Invalid avatar");
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
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "participants.updateDisplaySettings");
    await ctx.db.patch(args.participantId, {
      displaySettings: args.displaySettings,
    });
  },
});

export const updateParticipantNickname = mutation({
  args: {
    participantId: v.id("participants"),
    nickname: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCaller(ctx, args.participantId, args.token, "participants.updateParticipantNickname");
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
    token: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!isSupportedLanguage(args.language)) throw new Error("Unsupported language");
    const participant = await requireCaller(ctx, args.participantId, args.token, "participants.updateParticipantLanguage");
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
    // Who is being kicked. The host doing it is callerId, or the room's own host when none is named
    participantId: v.id("participants"),
    roomId: v.id("rooms"),
    callerId: v.optional(v.id("participants")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireHost(ctx, args.roomId, args.callerId, args.token, "participants.kickParticipant");
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.roomId !== args.roomId) throw new Error("Participant not in room");
    if (participant.role === "host") throw new Error("Cannot kick the host");

    // The secret goes with the participant
    const secret = await secretFor(ctx, args.participantId);
    if (secret) await ctx.db.delete(secret._id);
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

/** Rows one run of the stale sweep looks at. A sweep with more to do carries on in a run of its own */
const STALE_SWEEP_BATCH = 500;

// Two-tier stale detection:
// "away" + 30s no heartbeat → offline (removed from list)
// "online" + 45s no heartbeat → mark as "away" (safety net)
export const cleanupStaleParticipants = internalMutation({
  // Set by the sweep itself when one run did not reach the end. The cron's call has neither: a start
  args: { cursor: v.optional(v.string()), now: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // One clock for the whole sweep: the cursor only fits the range it was made in
    const now = args.now ?? Date.now();
    const awayOfflineCutoff = now - 30 * 1000; // away users go offline after 30s
    // Never mark away someone isPresent still accepts: games skip a player who reads as away
    const onlineAwayCutoff = now - PRESENT_WITHIN_MS;
    // Only who is online and has been silent for the shorter of the two times. The table keeps everyone
    // who ever joined, so reading all of it would in time be more than one function may read.
    const { page, isDone, continueCursor } = await ctx.db
      .query("participants")
      .withIndex("by_online_lastSeenAt", (q) =>
        q.eq("online", true).lt("lastSeenAt", Math.max(awayOfflineCutoff, onlineAwayCutoff))
      )
      .paginate({ cursor: args.cursor ?? null, numItems: STALE_SWEEP_BATCH });
    for (const p of page) {
      if (p.presence === "away" && p.lastSeenAt < awayOfflineCutoff) {
        // Mark offline and departed — remove from participant list
        await ctx.db.patch(p._id, { online: false, departed: true, presence: undefined, typingAction: undefined });
      } else if (p.presence !== "away" && p.lastSeenAt < onlineAwayCutoff) {
        await ctx.db.patch(p._id, { presence: "away", typingAction: undefined });
      }
    }
    // On from the cursor, never from the start again: someone just marked away is still in the range, and
    // a second look in the same sweep would take them offline at once instead of at the next sweep
    if (!isDone) {
      await ctx.scheduler.runAfter(0, internal.participants.cleanupStaleParticipants, { cursor: continueCursor, now });
    }
    return null;
  },
});

const RATE_LIMIT_SWEEP_BATCH = 500;

/**
 * Rate-limit rows are tiny and one per key, but keys die with their participants and rooms. Every
 * window is an hour or less, so a row whose window began a day ago counts nothing.
 */
export const sweepRateLimits = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const stale = await ctx.db
      .query("rateLimits")
      .withIndex("by_windowStart", (q) => q.lt("windowStart", Date.now() - 24 * 60 * 60 * 1000))
      .take(RATE_LIMIT_SWEEP_BATCH);
    for (const row of stale) await ctx.db.delete(row._id);
    // A full batch means there may be more: carry on now rather than an hour from now
    if (stale.length === RATE_LIMIT_SWEEP_BATCH) {
      await ctx.scheduler.runAfter(0, internal.participants.sweepRateLimits, {});
    }
    return null;
  },
});
