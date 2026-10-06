import { v } from "convex/values";
import { IndexNames, NamedIndex, NamedTableInfo } from "convex/server";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { DataModel, Doc, Id, TableNames } from "./_generated/dataModel";
import { deleteStoredFile, isSupportedLanguage, registerToken, requireHost } from "./participants";

// Must match the texture lists on web (lib/textures.ts) and iOS (RoomTexture.swift).
const BACKGROUND_COUNT = 52;
// The retired textures, by index: the ones the two lists mark retired. A retired texture keeps its place in the
// lists and is still drawn for a room that has it, and no room is given it any more.
const RETIRED_BACKGROUNDS = [4, 9, 24, 25, 26];
// The server's own pick is made among the first ten textures, less the retired ones. Every build has the tiles of
// those ten, and an iPhone build that sends no background has no others: given any other, its host would not see
// the room as the guests do.
const PICKED_BACKGROUND_COUNT = 10;

export const createRoom = mutation({
  args: {
    hostNickname: v.string(),
    hostAvatarId: v.optional(v.string()),
    hostLanguage: v.optional(v.string()),
    // The host app's caller token (participants.ts: registerToken). Builds that send none make a legacy host
    hostToken: v.optional(v.string()),
    // The texture the host app chose for the room, as its index in the texture lists. Builds that send none get the server's pick
    background: v.optional(v.number()),
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

    const now = Date.now();

    const settings = args.settings ?? {
      sourceLanguage: "ja",
      targetLanguage: "en",
      romajiEnabled: true,
      suggestionsEnabled: true,
      maxParticipants: 10,
    };

    if (!isSeatCount(settings.maxParticipants)) {
      throw new Error("Max participants must be between 2 and 50");
    }
    // The app sends a preset's id and "en" or "ja". Length only, so a build that sends another code is not refused
    if ((args.hostAvatarId?.length ?? 0) > 64) throw new Error("Invalid avatar");
    if (settings.sourceLanguage.length > 16 || settings.targetLanguage.length > 16) {
      throw new Error("Unsupported language");
    }

    // The app names the texture, so that a room can look like the start screen it was made from. A value that
    // is not one of the textures, or a retired texture, is no reason to refuse the room: the pick is then made
    // here, as for a build that sends none, and different from the last room's
    let background = args.background;
    if (!isBackground(background) || isRetired(background)) {
      const lastRoom = await ctx.db.query("rooms").order("desc").first();
      background = pickBackground(lastRoom?.background);
    }

    // After every check above, so a room that is refused has not looked anything up
    const joinCode = await freeJoinCode(ctx);

    const roomId = await ctx.db.insert("rooms", {
      joinCode,
      status: "waiting",
      settings,
      hostId: "", // will be updated after host participant is created
      createdAt: now,
      background,
      // Every reaction this room will have is written with the room's id (reactions.ts: addReaction)
      reactionsByRoom: true,
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
    await registerToken(ctx, hostId, args.hostToken);

    // Update room with host ID
    await ctx.db.patch(roomId, { hostId: hostId });

    return { roomId, joinCode, hostId, background };
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
  args: { roomId: v.id("rooms"), callerId: v.optional(v.id("participants")), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    await requireHost(ctx, args.roomId, args.callerId, args.token, "rooms.closeRoom");
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

// ─── Purge of closed rooms ───────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Rows one step may delete. Kept small: every row is found by reading its index range again from the
 * start, past the rows the step has already deleted, so a step's work grows faster than this number.
 */
const PURGE_ROWS_PER_STEP = 50;
/** A drawing kept as a data URL in its row (a game step, a chat message) makes a few rows megabytes: a step also stops on what it has read */
const PURGE_CHARS_PER_STEP = 1_000_000;
/** A run stops after this many rooms and the rest wait for the next day, so one run cannot empty a deployment */
const PURGE_ROOMS_PER_RUN = 500;
/** ...or after this long, whatever is left */
const PURGE_RUN_MS = 60 * 60 * 1000;
/** Steps follow each other within seconds. A lease this old belongs to a chain that died */
const PURGE_LEASE_MS = 10 * 60 * 1000;

type PurgeBudget = { rows: number; chars: number };

/** Days a closed room is kept. Unset, or not a number of at least 1, means nothing is ever deleted */
function purgeAfterDays(): number | null {
  const raw = process.env.PURGE_CLOSED_ROOMS_AFTER_DAYS;
  if (!raw) return null;
  const days = Number(raw);
  if (Number.isFinite(days) && days >= 1) return days;
  console.warn("purge: PURGE_CLOSED_ROOMS_AFTER_DAYS is not a number of at least 1, so nothing is deleted");
  return null;
}

/** Deletes what a room owns. Returns false when the step's budget ran out first. */
async function purgeRoomRows(ctx: MutationCtx, roomId: Id<"rooms">, budget: PurgeBudget): Promise<boolean> {
  /**
   * Deletes the rows of `table` whose `field` is `value`, one at a time, until none is left (true) or the
   * step's budget is spent (false). One row per read: a row can be close to the 1 MiB document limit, and
   * reading rows in bulk would let a few of them fill a transaction. A row is charged after it is deleted,
   * so every step deletes at least one row however large it is. `children` deletes what the row owns
   * first; when that runs out of budget the row stays for the next step.
   */
  async function where<T extends TableNames, I extends IndexNames<NamedTableInfo<DataModel, T>>>(
    table: T,
    index: I,
    field: NamedIndex<NamedTableInfo<DataModel, T>, I>[0],
    value: string,
    children?: (row: Doc<T>) => Promise<boolean>
  ): Promise<boolean> {
    while (budget.rows > 0 && budget.chars > 0) {
      // Built loosely because the table is only known at each call. The signature above still has the
      // compiler check table, index and field there: a wrong name would otherwise only show when a purge runs.
      const row: Doc<T> | null = await (ctx.db.query(table) as any)
        .withIndex(index, (q: any) => q.eq(field, value))
        .first();
      if (!row) return true;
      if (children && !(await children(row))) return false;
      await ctx.db.delete(row._id);
      budget.rows -= 1;
      budget.chars -= JSON.stringify(row).length;
    }
    return false;
  }
  const file = async (id: Id<"_storage"> | undefined) => {
    if (id) await deleteStoredFile(ctx, id);
    return true;
  };

  // Children before their parent: a child is only found through its parent's id, so a parent deleted
  // first would strand them. Participants go last, normally in the step that also deletes the room, so
  // no client is shown a room with people missing from it.
  return (
    // Lost in Translation and Emojifyr. A drawing the submit-step route stored is a file, named on its
    // draw step; any other is a data URL in the steps and goes with them
    (await where("gameSessions", "by_roomId", "roomId", roomId, async (session) =>
      (await where("emojifyrRounds", "by_gameSessionId", "gameSessionId", session._id, (round) =>
        where("emojifyrGuesses", "by_roundId", "roundId", round._id)
      )) &&
      (await where("gameSteps", "by_gameSessionId", "gameSessionId", session._id, (step) =>
        file(step.outputDrawingStorageId)
      )) &&
      (await where("gameChains", "by_gameSessionId", "gameSessionId", session._id))
    )) &&
    (await where("emojiMatchGames", "by_roomId", "roomId", roomId, (game) =>
      where("emTrace", "by_gameId", "gameId", game._id)
    )) &&
    (await where("emojiBingoGames", "by_roomId", "roomId", roomId, (game) =>
      where("bingoTrace", "by_gameId", "gameId", game._id)
    )) &&
    (await where("truthOrDareGames", "by_roomId", "roomId", roomId, async (game) =>
      (await where("todTrace", "by_gameId", "gameId", game._id)) &&
      (await where("truthOrDareTurns", "by_gameId", "gameId", game._id, (turn) => file(turn.responseStorageId)))
    )) &&
    (await where("wordRushGames", "by_roomId", "roomId", roomId, async (game) => {
      if (!(await where("wordRushAnswers", "by_game_card", "gameId", game._id))) return false;
      if (!(await where("wordRushVotes", "by_game_card", "gameId", game._id))) return false;
      // A game that ended has already deleted its clips; one still open when the room closed may not have
      for (const id of [...game.storageIds, game.clipStorageId, game.teachClip?.storageId]) await file(id);
      return true;
    })) &&
    (await where("messages", "by_roomId", "roomId", roomId, async (message) =>
      (await where("reactions", "by_messageId", "messageId", message._id)) &&
      (await file(message.audioStorageId)) &&
      (await file(message.mediaStorageId))
    )) &&
    (await where("hostPushTokens", "by_roomId", "roomId", roomId)) &&
    (await where("participants", "by_roomId", "roomId", roomId, (participant) =>
      where("participantSecrets", "by_participantId", "participantId", participant._id)
    ))
  );
}

/**
 * Deletes rooms that have been closed for PURGE_CLOSED_ROOMS_AFTER_DAYS days, with everything they own.
 * Does nothing while that variable is unset. Started once a day by the cron, or by hand with
 * `npx convex run rooms:purgeClosedRooms`. Each step deletes a bounded number of rows and schedules the
 * next. Nothing is carried between steps except the run's id: every step looks up what is left, so a
 * step that is lost or repeated costs nothing.
 */
export const purgeClosedRooms = internalMutation({
  // Set by the chain itself. A call without it is a start
  args: { runId: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const days = purgeAfterDays();
    if (days === null) return null;
    const now = Date.now();

    // One row is the lease. A start leaves a chain that is still moving alone, and a step whose run is
    // no longer the lease's stops, so two chains never delete side by side.
    const lease = await ctx.db.query("purgeRuns").first();
    if (args.runId === undefined) {
      if (lease && lease.finishedAt === undefined && now - lease.heartbeatAt < PURGE_LEASE_MS) return null;
    } else if (!lease || lease.finishedAt !== undefined || lease.runId !== args.runId) {
      return null;
    }
    const runId = args.runId ?? now;
    let roomsPurged = args.runId !== undefined && lease ? lease.roomsPurged : 0;

    // This range holds only closed rooms whose closing time is known and at least `days` old, oldest
    // first. An open room is never read here, so it cannot be deleted here.
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_status_closedAt", (q) =>
        q.eq("status", "closed").gt("closedAt", 0).lt("closedAt", now - days * DAY_MS)
      )
      .first();

    let finished = !room || now - runId >= PURGE_RUN_MS;
    if (room && !finished) {
      // The room document goes last, in the transaction that found nothing else left. Until then the
      // room still reads as closed to anything that asks, and it is what the next step finds it by.
      if (await purgeRoomRows(ctx, room._id, { rows: PURGE_ROWS_PER_STEP, chars: PURGE_CHARS_PER_STEP })) {
        await ctx.db.delete(room._id);
        roomsPurged += 1;
        finished = roomsPurged >= PURGE_ROOMS_PER_RUN;
      }
    }

    const state = { runId, heartbeatAt: now, roomsPurged, finishedAt: finished ? now : undefined };
    if (lease) await ctx.db.patch(lease._id, state);
    else await ctx.db.insert("purgeRuns", state);
    if (finished) console.log(`purge: run ${runId} deleted ${roomsPurged} rooms`);
    else await ctx.scheduler.runAfter(0, internal.rooms.purgeClosedRooms, { runId });
    return null;
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
    callerId: v.optional(v.id("participants")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Cannot update a closed room");
    await requireHost(ctx, args.roomId, args.callerId, args.token, "rooms.updateRoomSettings");
    // The same bounds createRoom holds the settings to
    if (!isSeatCount(args.settings.maxParticipants)) {
      throw new Error("Max participants must be between 2 and 50");
    }
    if (args.settings.sourceLanguage.length > 16 || args.settings.targetLanguage.length > 16) {
      throw new Error("Unsupported language");
    }

    await ctx.db.patch(args.roomId, { settings: args.settings });
  },
});

/**
 * The host gives an open room another texture. Every guest's page draws the index stored on the room, so
 * they follow by themselves. Answers with the index the room now has, which is the server's own pick when
 * the one asked for is retired.
 */
export const setRoomBackground = mutation({
  args: {
    roomId: v.id("rooms"),
    // The texture's index in the texture lists
    background: v.number(),
    callerId: v.optional(v.id("participants")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");
    await requireHost(ctx, args.roomId, args.callerId, args.token, "rooms.setRoomBackground");
    // Refused, where createRoom makes its own pick: the room has a background to keep
    if (!isBackground(args.background)) throw new Error("Unknown background");
    // A retired texture is asked for by a build whose own list still offers it. That is not refused, which
    // would fail its host's tap: the room gets the server's pick, never the index stored on it. A room with
    // none stored is drawn by its join code, and its pick can be the texture it is drawn with
    const background = isRetired(args.background) ? pickBackground(room.background) : args.background;

    await ctx.db.patch(args.roomId, { background });
    return { background };
  },
});

/**
 * A maxParticipants a room may have: a whole number from 2 to 50. Whole, because the room document goes to
 * the iOS host as it is and the app decodes this field as an Int: one fraction fails every poll of the room.
 * NaN and Infinity are not whole numbers either.
 */
function isSeatCount(value: number): boolean {
  return Number.isInteger(value) && value >= 2 && value <= 50;
}

/**
 * The index of one of the textures, a retired one included: a whole number from 0 to BACKGROUND_COUNT - 1.
 * Whole for the reason a seat count is: the iOS app decodes the room's background as an Int. NaN and
 * Infinity are not whole numbers either.
 */
function isBackground(value: number | undefined): value is number {
  return value !== undefined && Number.isInteger(value) && value >= 0 && value < BACKGROUND_COUNT;
}

/** A texture that is still drawn for a room that has it, and that no room is given any more */
function isRetired(background: number): boolean {
  return RETIRED_BACKGROUNDS.includes(background);
}

/**
 * The server's own pick of a background: at random among the first ten textures that are not retired, and
 * never `avoid`, the index stored on the last room made or on the room the pick is for. A room with none
 * stored leaves nothing to avoid.
 */
function pickBackground(avoid: number | undefined): number {
  const among: number[] = [];
  for (let background = 0; background < PICKED_BACKGROUND_COUNT; background++) {
    if (!isRetired(background) && background !== avoid) among.push(background);
  }
  return among[Math.floor(Math.random() * among.length)];
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Codes createRoom draws before it gives up. A draw meets a taken code about once in a billion for each room there is, so even a second draw is rare */
const JOIN_CODE_DRAWS = 10;

/**
 * A join code that no room holds, open or closed. getRoomByJoinCode answers the oldest room with a code,
 * and a closed room keeps its code until the purge deletes it, so a new room that shared a code with any
 * earlier room could not be joined by code or QR. The lookup is part of this transaction: two rooms made
 * at the same moment cannot both find the same code free.
 */
async function freeJoinCode(ctx: MutationCtx): Promise<string> {
  for (let draw = 0; draw < JOIN_CODE_DRAWS; draw++) {
    const joinCode = generateJoinCode();
    const holder = await ctx.db
      .query("rooms")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", joinCode))
      .first();
    if (!holder) return joinCode;
  }
  // That many taken codes in a row is not chance. A refusal the host can repeat, rather than a loop that may never end
  throw new Error("Could not make a join code. Please try again");
}
