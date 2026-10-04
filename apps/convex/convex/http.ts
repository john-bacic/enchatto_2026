import { httpRouter } from "convex/server";
import { ActionCtx, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { DRAWING_MAX_BYTES } from "./participants";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper: parse JSON body and call a mutation/query. ctx is typed so the compiler checks the
// argument names each route passes: Convex refuses a call that carries an argument its function does not declare
function jsonAction(handler: (ctx: ActionCtx, body: any) => Promise<any>) {
  return httpAction(async (ctx, request) => {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    try {
      const body = await request.json();
      const result = await handler(ctx, body);
      return new Response(JSON.stringify(result ?? { ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      const message = e?.message ?? String(e);
      // Convex OCC / transient errors surface as system errors — return 503
      // so the iOS client can distinguish retryable from permanent failures.
      const isTransient = message.includes("OCC") || message.includes("overloaded") || message.includes("rate limit");
      return new Response(JSON.stringify({ error: message }), {
        status: isTransient ? 503 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
}

// Base64 inside JSON is a third larger than the image; the rest of the body is a few ids
const DRAWING_BODY_MAX_BYTES = Math.ceil(DRAWING_MAX_BYTES / 3) * 4 + 16 * 1024;

/** Refuses an oversized drawing on its declared length, before the body is read into memory */
function checkDrawingBodySize(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > DRAWING_BODY_MAX_BYTES) {
    throw new Error("Drawing too large (max 8 MB)");
  }
}

/**
 * The image inside a drawing's data URL. Type and size are checked here, before anything is stored: iOS
 * sends PNG, the web canvas JPEG, and nothing else is a drawing. A link is refused: stored as a drawing,
 * every viewer's device would fetch it.
 */
function decodeDrawing(dataUrl: unknown): Blob {
  if (typeof dataUrl !== "string") throw new Error("Drawing is missing");
  const comma = dataUrl.indexOf(",");
  const header = dataUrl.slice(0, Math.max(comma, 0));
  if (header !== "data:image/png;base64" && header !== "data:image/jpeg;base64") {
    throw new Error("Drawing must be a PNG or JPEG image");
  }
  const base64 = dataUrl.slice(comma + 1);
  if (base64.length > Math.ceil(DRAWING_MAX_BYTES / 3) * 4) throw new Error("Drawing too large (max 8 MB)");
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("Drawing is not valid base64");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  // "data:image/png;base64" without its first five and last seven characters is the type
  return new Blob([bytes], { type: header.slice(5, -7) });
}

// In every body the caller's token is `callerToken` and the caller's participant id is `callerId`
// (participants.ts: requireCaller). Never `token`: /api/rooms/push-token already carries the APNs device
// token under that name. Bodies from builds before tokens have neither field, and both are optional.

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

// --- Messages ---

http.route({
  path: "/api/messages/send-text",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const messageId = await ctx.runMutation(api.messages.sendTextMessage, {
      roomId: body.roomId,
      senderId: body.senderId,
      text: body.text,
      replyToId: body.replyToId,
      clientId: body.clientId,
      token: body.callerToken,
    });
    return { messageId };
  }),
});

http.route({
  path: "/api/messages/send-image",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const messageId = await ctx.runMutation(api.messages.sendImageMessage, {
      roomId: body.roomId,
      senderId: body.senderId,
      storageId: body.storageId,
      replyToId: body.replyToId,
      clientId: body.clientId,
      token: body.callerToken,
    });
    // The mutation deletes an upload it cannot use and returns null: a throw would have undone the delete
    if (!messageId) throw new Error("Picture rejected: it must be an image of at most 50 MB");
    return { messageId };
  }),
});

http.route({
  path: "/api/messages/send-audio",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const messageId = await ctx.runMutation(api.messages.sendAudioMessage, {
      roomId: body.roomId,
      senderId: body.senderId,
      storageId: body.storageId,
      durationMs: body.durationMs,
      waveform: body.waveform ?? [],
      text: body.text,
      lang: body.lang,
      replyToId: body.replyToId,
      clientId: body.clientId,
      token: body.callerToken,
    });
    return { messageId };
  }),
});

http.route({
  path: "/api/messages/transcribe",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const text = await ctx.runAction(internal.messages.transcribeDictation, {
      roomId: body.roomId,
      senderId: body.senderId,
      storageId: body.storageId,
      token: body.callerToken,
    });
    return { text };
  }),
});

http.route({
  path: "/api/messages/send-drawing",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/messages/send-drawing",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Set once the drawing is in file storage, so a send that then fails does not leave the file behind
    let storageId: Id<"_storage"> | undefined;
    try {
      checkDrawingBodySize(request);
      const body = await request.json();
      // A send repeated after a lost answer is answered here, before the drawing is stored a second time
      const repeat: Id<"messages"> | null =
        typeof body.clientId === "string" && body.clientId
          ? await ctx.runQuery(internal.messages.findRepeat, {
              roomId: body.roomId,
              senderId: body.senderId,
              clientId: body.clientId,
            })
          : null;
      let messageId = repeat;
      if (!messageId) {
        // Stored as a file so the messages subscription carries a CDN URL, not the whole base64
        storageId = await ctx.storage.store(decodeDrawing(body.mediaUrl));
        messageId = await ctx.runMutation(api.messages.sendDrawingMessage, {
          roomId: body.roomId,
          senderId: body.senderId,
          storageId,
          replyToId: body.replyToId,
          clientId: body.clientId,
          token: body.callerToken,
        });
      }
      return new Response(JSON.stringify({ messageId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      // No message was made, so nothing refers to the file just stored
      if (storageId) await ctx.storage.delete(storageId).catch(() => undefined);
      const message = e?.message ?? String(e);
      return new Response(JSON.stringify({ error: message }), {
        // As jsonAction: a throttled send is a 503, which the iOS send queue retries (see TOO_FAST in messages.ts)
        status: message.includes("rate limit") ? 503 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/api/messages/list",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.messages.getRoomMessages, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/messages/pending",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.messages.getPendingMessagesForProcessor, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/messages/submit-processed",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.messages.submitProcessedMessage, {
      messageId: body.messageId,
      processing: body.processing,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/messages/delete",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.messages.deleteMessage, {
      messageId: body.messageId,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/messages/mark-failed",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.messages.markMessageFailed, {
      messageId: body.messageId,
      error: body.error,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

// --- Reactions ---

http.route({
  path: "/api/reactions/add",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.reactions.addReaction, {
      messageId: body.messageId,
      participantId: body.participantId,
      emoji: body.emoji,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/reactions/remove",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.reactions.removeReaction, {
      messageId: body.messageId,
      participantId: body.participantId,
      emoji: body.emoji,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/reactions/room-summaries",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.reactions.getRoomReactionSummaries, {
      roomId: body.roomId,
    });
  }),
});

// --- Games ---

/** A team split out of a request body: lists of participant ids. Anything else counts as none sent */
function teamSplit(value: unknown): string[][] | undefined {
  const isIds = (team: unknown) => Array.isArray(team) && team.every((id) => typeof id === "string");
  return Array.isArray(value) && value.every(isIds) ? (value as string[][]) : undefined;
}

http.route({
  path: "/api/games/start",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const sessionId = await ctx.runMutation(api.games.startGame, {
      roomId: body.roomId,
      participantId: body.participantId,
      gameType: body.gameType,
      level: body.level,
      timerEnabled: body.timerEnabled,
      customPrompts: body.customPrompts,
      token: body.callerToken,
      // Builds from before teams send none, which is an individual game. So is a value this server cannot read:
      // a Start is never refused over its teams
      teams: body.teams === "auto" ? "auto" : teamSplit(body.teams),
    });
    return { sessionId };
  }),
});

http.route({
  path: "/api/games/deal-teams",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.games.dealTeams, {
      roomId: body.roomId,
      participantId: body.participantId,
      previous: teamSplit(body.previous),
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/games/submit-step",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const args: Record<string, unknown> = {
      stepId: body.stepId,
      participantId: body.participantId,
    };
    if (body.outputText) args.outputText = body.outputText;
    if (body.outputDrawingUrl) args.outputDrawingUrl = body.outputDrawingUrl;
    if (body.selectedOption) args.selectedOption = body.selectedOption;
    if (typeof body.callerToken === "string") args.token = body.callerToken;
    // A guess is answered with its result; anything else with nothing, which goes out as {"ok":true}
    return await ctx.runAction(api.games.submitGameStepWithTranslation, args as any);
  }),
});

http.route({
  path: "/api/games/cancel",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.cancelGame, {
      roomId: body.roomId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/games/active-session",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getActiveGameSession, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/games/my-active-step",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getMyActiveStep, {
      participantId: body.participantId,
      // The app sends callerToken with every request. Anything that is not a string counts as none: a poll is never refused
      token: typeof body.callerToken === "string" ? body.callerToken : undefined,
    });
  }),
});

http.route({
  path: "/api/games/latest-session",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getLatestGameSession, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/games/replay",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getGameReplay, {
      gameSessionId: body.gameSessionId,
    });
  }),
});

http.route({
  path: "/api/games/status",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getGameStatus, {
      roomId: body.roomId,
    });
  }),
});

// --- Emojifyr ---

http.route({
  path: "/api/emojifyr/start",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const sessionId = await ctx.runMutation(api.games.startEmojifyr, {
      roomId: body.roomId,
      createdByParticipantId: body.createdByParticipantId,
    });
    return { sessionId };
  }),
});

http.route({
  path: "/api/emojifyr/submit-sentence",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.submitEmojifyrSentence, {
      roundId: body.roundId,
      sentence: body.sentence,
      isInitialism: body.isInitialism === true ? true : undefined,
    });
  }),
});

http.route({
  path: "/api/emojifyr/update-sentence",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.updateEmojifyrSentence, {
      roundId: body.roundId,
      sentence: body.sentence,
    });
  }),
});

http.route({
  path: "/api/emojifyr/submit-emoji-clue",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runAction(api.games.submitEmojifyrEmojiClueWithTranslation, {
      roundId: body.roundId,
      emojiClue: body.emojiClue,
    });
  }),
});

http.route({
  path: "/api/emojifyr/submit-guess",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runAction(api.games.submitEmojifyrGuessWithTranslation, {
      roundId: body.roundId,
      participantId: body.participantId,
      guessText: body.guessText,
    });
  }),
});

http.route({
  path: "/api/emojifyr/reveal",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.revealEmojifyrRound, {
      roundId: body.roundId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/advance-round",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.advanceEmojifyrRound, {
      gameSessionId: body.gameSessionId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/cancel",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.cancelEmojifyr, {
      gameSessionId: body.gameSessionId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/active-session",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getActiveEmojifyrSession, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/current-round",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getCurrentEmojifyrRound, {
      gameSessionId: body.gameSessionId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/guesses",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getEmojifyrGuesses, {
      roundId: body.roundId,
    });
  }),
});

http.route({
  path: "/api/emojifyr/generate-emoji-clue",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runAction(api.games.generateEmojiClue, {
      sentence: body.sentence,
    });
  }),
});

http.route({
  path: "/api/emojifyr/game-state",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.games.getEmojifyrGameState, {
      roomId: body.roomId,
    });
  }),
});

// --- Emoji Match ---

http.route({
  path: "/api/emoji-match/create-lobby",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const gameId = await ctx.runMutation(api.emojiMatch.createLobby, {
      roomId: body.roomId,
      hostParticipantId: body.hostParticipantId,
      token: body.callerToken,
    });
    return { gameId };
  }),
});

http.route({
  path: "/api/emoji-match/join",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.joinLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/leave",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.leaveLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/start",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.startGame, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/flip-card",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.emojiMatch.flipCard, {
      gameId: body.gameId,
      participantId: body.participantId,
      cardId: body.cardId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/resolve-mismatch",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.resolveMismatch, {
      gameId: body.gameId,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/timeout-turn",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.timeoutTurn, {
      gameId: body.gameId,
      // Whose turn ran out. The caller is callerId, and the token is the caller's.
      participantId: body.participantId,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/cancel",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.cancelGame, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-match/play-again",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const gameId = await ctx.runMutation(api.emojiMatch.playAgain, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
    return { gameId };
  }),
});

http.route({
  path: "/api/emoji-match/active",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.emojiMatch.getActiveEmojiMatch, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/emoji-match/state",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.emojiMatch.getEmojiMatchById, {
      gameId: body.gameId,
    });
  }),
});

// --- Truth or Dare ---

http.route({
  path: "/api/truth-or-dare/create",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const gameId = await ctx.runMutation(api.truthOrDare.createGame, {
      roomId: body.roomId,
      hostParticipantId: body.hostParticipantId,
      promptMode: body.promptMode,
      token: body.callerToken,
    });
    return { gameId };
  }),
});

http.route({
  path: "/api/truth-or-dare/submit-choice",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.submitChoice, {
      gameId: body.gameId,
      participantId: body.participantId,
      choice: body.choice,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/submit-response",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/truth-or-dare/submit-response",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Set once the drawing is in file storage, so a submit that then fails does not leave the file behind
    let storageId: Id<"_storage"> | undefined;
    try {
      checkDrawingBodySize(request);
      const body = await request.json();
      // Stored as a file so the subscription payload stays small (a CDN URL instead of the full base64).
      // Without this, large base64 strings crash the WebSocket on subscribers.
      if (body.responseMediaUrl !== undefined && body.responseMediaUrl !== null) {
        storageId = await ctx.storage.store(decodeDrawing(body.responseMediaUrl));
      }
      const taken: boolean = await ctx.runMutation(api.truthOrDare.submitResponse, {
        gameId: body.gameId,
        participantId: body.participantId,
        responseText: body.responseText,
        responseStorageId: storageId,
        token: body.callerToken,
      });
      // Not this player's open turn any more (a second tap, a skipped turn): nothing refers to the drawing
      if (storageId && !taken) await ctx.storage.delete(storageId).catch(() => undefined);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      if (storageId) await ctx.storage.delete(storageId).catch(() => undefined);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/api/truth-or-dare/advance-turn",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.advanceTurn, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/skip-turn",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.skipTurn, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/host-skip-turn",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.hostSkipTurn, {
      gameId: body.gameId,
      participantId: body.participantId,
      turnId: body.turnId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/ack-round-break",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.acknowledgeRoundBreak, {
      gameId: body.gameId,
      participantId: body.participantId,
      completedTurns: body.completedTurns,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/end",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.endGame, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/submit-rating",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.submitRating, {
      turnId: body.turnId,
      participantId: body.participantId,
      score: body.score,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/submit-translation",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.truthOrDare.submitTranslation, {
      turnId: body.turnId,
      translatedText: body.translatedText,
      callerId: body.callerId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/truth-or-dare/active",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.truthOrDare.getActiveTruthOrDare, {
      roomId: body.roomId,
    });
  }),
});

// --- Emoji Bingo ---

http.route({
  path: "/api/emoji-bingo/create-lobby",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const gameId = await ctx.runMutation(api.emojiBingo.createLobby, {
      roomId: body.roomId,
      hostParticipantId: body.hostParticipantId,
      winPattern: body.winPattern,
      token: body.callerToken,
    });
    return { gameId };
  }),
});

http.route({
  path: "/api/emoji-bingo/join",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.joinLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/leave",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.leaveLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/start",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.startGame, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/roll",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.rollEmoji, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/mark-cell",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.markCell, {
      gameId: body.gameId,
      participantId: body.participantId,
      cellIndex: body.cellIndex,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/claim-bingo",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.emojiBingo.claimBingo, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/cancel",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiBingo.cancelGame, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/play-again",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const gameId = await ctx.runMutation(api.emojiBingo.playAgain, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    });
    return { gameId };
  }),
});

http.route({
  path: "/api/emoji-bingo/active",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.emojiBingo.getActiveEmojiBingo, {
      roomId: body.roomId,
    });
  }),
});

http.route({
  path: "/api/emoji-bingo/state",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.emojiBingo.getEmojiBingoById, {
      gameId: body.gameId,
    });
  }),
});

// --- Word Rush ---

const wordRushRoutes: Record<string, (ctx: any, body: any) => Promise<any>> = {
  "create-lobby": async (ctx, body) => ({
    gameId: await ctx.runMutation(api.wordRush.createLobby, {
      roomId: body.roomId,
      hostParticipantId: body.hostParticipantId,
      pack: body.pack,
      sayIt: body.sayIt,
      token: body.callerToken,
    }),
  }),
  join: (ctx, body) =>
    ctx.runMutation(api.wordRush.joinLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  leave: (ctx, body) =>
    ctx.runMutation(api.wordRush.leaveLobby, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  "update-settings": (ctx, body) =>
    ctx.runMutation(api.wordRush.updateSettings, {
      gameId: body.gameId,
      participantId: body.participantId,
      pack: body.pack,
      sayIt: body.sayIt,
      token: body.callerToken,
    }),
  start: (ctx, body) =>
    ctx.runMutation(api.wordRush.start, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  answer: (ctx, body) =>
    ctx.runMutation(api.wordRush.answer, {
      gameId: body.gameId,
      participantId: body.participantId,
      choiceIndex: body.choiceIndex,
      token: body.callerToken,
    }),
  hint: async (ctx, body) => ({
    hint: await ctx.runMutation(api.wordRush.takeHint, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  }),
  "submit-clip": (ctx, body) =>
    ctx.runMutation(api.wordRush.submitClip, {
      gameId: body.gameId,
      participantId: body.participantId,
      storageId: body.storageId,
      token: body.callerToken,
    }),
  "skip-mic": (ctx, body) =>
    ctx.runMutation(api.wordRush.skipMic, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  vote: (ctx, body) =>
    ctx.runMutation(api.wordRush.vote, {
      gameId: body.gameId,
      participantId: body.participantId,
      vote: body.vote,
      token: body.callerToken,
    }),
  "submit-teach-clip": (ctx, body) =>
    ctx.runMutation(api.wordRush.submitTeachClip, {
      gameId: body.gameId,
      participantId: body.participantId,
      storageId: body.storageId,
      token: body.callerToken,
    }),
  skip: (ctx, body) =>
    ctx.runMutation(api.wordRush.skip, {
      gameId: body.gameId,
      participantId: body.participantId,
      phaseSeq: body.phaseSeq,
      token: body.callerToken,
    }),
  cancel: (ctx, body) =>
    ctx.runMutation(api.wordRush.cancel, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  "play-again": async (ctx, body) => ({
    gameId: await ctx.runMutation(api.wordRush.playAgain, {
      gameId: body.gameId,
      participantId: body.participantId,
      token: body.callerToken,
    }),
  }),
  state: async (ctx, body) => ({
    game: await ctx.runQuery(api.wordRush.getState, { roomId: body.roomId }),
  }),
};

for (const [name, handler] of Object.entries(wordRushRoutes)) {
  http.route({ path: `/api/word-rush/${name}`, method: "POST", handler: jsonAction(handler) });
}

export default http;
