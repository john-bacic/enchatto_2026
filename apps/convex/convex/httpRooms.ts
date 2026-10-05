import { HttpRouter } from "convex/server";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { isTransient, jsonAction } from "./httpShared";

/**
 * /api/rooms/snapshot: what one refresh of the host app reads in ten or eleven requests, in one answer.
 *
 * Body: { roomId, participantId, skip? }, and the callerId and callerToken every request carries.
 * Answer: { v: 1, the sections, errors }. Each section is the result of the public query its own route runs,
 * called with the arguments that route passes, so the switches (LOST_IN_TRANSLATION_HIDE_ANSWER,
 * EMOJI_MATCH_HIDE_CARDS) and the caller's token act on a section exactly as they do on its route:
 *
 *   room, participants   /api/rooms/state                rooms.getRoomState
 *   messages             /api/messages/list              messages.getRoomMessages
 *   reactions            /api/reactions/room-summaries   reactions.getRoomReactionSummaries
 *   activeSession        /api/games/active-session       games.getActiveGameSession
 *   gameStatus           /api/games/status               games.getGameStatus
 *   myActiveStep         /api/games/my-active-step       games.getMyActiveStep
 *   latestSession        /api/games/latest-session       games.getLatestGameSession
 *   wordRush             /api/word-rush/state            wordRush.getState
 *   emojiMatch           /api/emoji-match/active         emojiMatch.getActiveEmojiMatch
 *   emojiBingo           /api/emoji-bingo/active         emojiBingo.getActiveEmojiBingo
 *   truthOrDare          /api/truth-or-dare/active       truthOrDare.getActiveTruthOrDare
 *
 * A section differs from the body of its route in two places. Where the route answers {"ok":true} because
 * there is nothing (no game, no step, no such room), the section is null: for a room that does not exist
 * `room` and `participants` both are. And `wordRush` is the query's own result, the game or null, without
 * the {"game": …} the Word Rush route puts around it.
 *
 * A section is missing from the answer in two cases, and missing is not null:
 * - It is named in `skip`: its query is not run. A name that is no section is ignored.
 * - Its query was refused: it is named in `errors`, and the client keeps what it has. Not so for the room,
 *   its participants and its messages: without them there is nothing to show, so their failure fails the
 *   request with 400, as on their own routes.
 * A failure worth repeating (isTransient), in whichever section, fails the whole request with 503, as that
 * section's own route would. The host app slows its polling on a 503; a 200 with a section left out would
 * keep it asking at full speed a server that is asking for less.
 *
 * The reactions are not among the sections that fail the request, although the app today shows nothing of
 * a refresh whose reactions request failed. In a room without `reactionsByRoom` their query is refused for
 * good from the room's 4,095th message on (one index range for each message: reactions.ts,
 * poll-cost.test.ts), and here that costs the reactions, not the room.
 *
 * The queries run one after another, in the order the app asks today, never together. The game's status
 * is only asked for when there is a session to have one. A host holds one query at a time today, and a
 * refresh that ran them together would hold eleven. And the first failure worth repeating spares the
 * server the queries after it. They stay separate queries a few milliseconds apart, not one transaction.
 *
 * Not in the answer: the replay (asked for by its session id), the messages waiting for the host's
 * translator (a loop of their own) and the heartbeat (a write). POST only: no web page calls this.
 */
async function roomSnapshot(ctx: ActionCtx, body: any) {
  const { roomId } = body;
  // Anything but a list counts as nothing to skip: a poll is never refused over it
  const skip: unknown[] = Array.isArray(body.skip) ? body.skip : [];
  const wanted = (section: string) => !skip.includes(section);
  const snapshot: Record<string, unknown> = { v: 1 };
  const errors: string[] = [];

  /** One of the sections that may fail alone. Gives the query's answer, or undefined when it was skipped or refused */
  const read = async <T>(section: string, query: () => Promise<T>): Promise<T | undefined> => {
    if (!wanted(section)) return undefined;
    try {
      const answer = await query();
      snapshot[section] = answer;
      return answer;
    } catch (e: any) {
      if (isTransient(e?.message ?? String(e))) throw e;
      errors.push(section);
      return undefined;
    }
  };

  // The room, its participants and its messages: whatever these throw fails the request
  if (wanted("room") || wanted("participants")) {
    const state = await ctx.runQuery(api.rooms.getRoomState, { roomId });
    if (wanted("room")) snapshot.room = state?.room ?? null;
    if (wanted("participants")) snapshot.participants = state?.participants ?? null;
  }
  if (wanted("messages")) {
    snapshot.messages = await ctx.runQuery(api.messages.getRoomMessages, { roomId });
  }

  await read("reactions", () => ctx.runQuery(api.reactions.getRoomReactionSummaries, { roomId }));

  const activeSession = await read("activeSession", () => ctx.runQuery(api.games.getActiveGameSession, { roomId }));
  if (activeSession === null) {
    // No session, so no status: the query would say so itself, and the app does not ask it either
    if (wanted("gameStatus")) snapshot.gameStatus = null;
  } else {
    // A session, or no word of one (skipped or refused): the status query finds the session by itself
    await read("gameStatus", () => ctx.runQuery(api.games.getGameStatus, { roomId }));
  }
  await read("myActiveStep", () =>
    ctx.runQuery(api.games.getMyActiveStep, {
      participantId: body.participantId,
      // As on /api/games/my-active-step: anything that is not a string counts as no token. The token goes
      // to this query and nowhere else
      token: typeof body.callerToken === "string" ? body.callerToken : undefined,
    })
  );
  await read("latestSession", () => ctx.runQuery(api.games.getLatestGameSession, { roomId }));

  await read("wordRush", () => ctx.runQuery(api.wordRush.getState, { roomId }));
  await read("emojiMatch", () => ctx.runQuery(api.emojiMatch.getActiveEmojiMatch, { roomId }));
  await read("emojiBingo", () => ctx.runQuery(api.emojiBingo.getActiveEmojiBingo, { roomId }));
  await read("truthOrDare", () => ctx.runQuery(api.truthOrDare.getActiveTruthOrDare, { roomId }));

  snapshot.errors = errors;
  return snapshot;
}

export function registerRoomRoutes(http: HttpRouter): void {
  // --- Rooms ---

  http.route({
    path: "/api/rooms/create",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.createRoom, {
        hostNickname: body.hostNickname,
        hostAvatarId: body.hostAvatarId,
        settings: body.settings,
        hostLanguage: typeof body.hostLanguage === "string" ? body.hostLanguage : undefined,
        hostToken: typeof body.hostToken === "string" ? body.hostToken : undefined,
        background: typeof body.background === "number" ? body.background : undefined,
      });
    }),
  });

  http.route({
    path: "/api/rooms/close",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.rooms.closeRoom, {
        roomId: body.roomId,
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/rooms/state",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runQuery(api.rooms.getRoomState, { roomId: body.roomId });
    }),
  });

  http.route({
    path: "/api/rooms/snapshot",
    method: "POST",
    handler: jsonAction(roomSnapshot),
  });

  http.route({
    path: "/api/rooms/push-token",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.setHostPushToken, {
        roomId: body.roomId,
        hostId: body.hostId,
        token: body.token, // the APNs device token
        callerToken: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/rooms/background",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.setRoomBackground, {
        roomId: body.roomId,
        background: body.background,
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  // --- Participants ---

  http.route({
    path: "/api/participants/set-online",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.setParticipantOnline, {
        participantId: body.participantId,
        online: body.online,
        presence: body.presence,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/participants/kick",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.kickParticipant, {
        participantId: body.participantId,
        roomId: body.roomId,
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/participants/set-typing",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.setTypingAction, {
        participantId: body.participantId,
        action: body.action,
        drawingStartedAt: body.drawingStartedAt,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/participants/set-language",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.updateParticipantLanguage, {
        participantId: body.participantId,
        language: body.language,
        token: body.callerToken,
      });
    }),
  });

  // --- Storage ---

  http.route({
    path: "/api/storage/generate-upload-url",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      const uploadUrl = await ctx.runMutation(api.messages.generateUploadUrl, {
        callerId: body.callerId,
        token: body.callerToken,
      });
      return { uploadUrl };
    }),
  });
}
