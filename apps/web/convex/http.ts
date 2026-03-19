import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper: parse JSON body and call a mutation/query
function jsonAction(handler: (ctx: any, body: any) => Promise<any>) {
  return httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await handler(ctx, body);
      return new Response(JSON.stringify(result ?? { ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
}

// --- Rooms ---

http.route({
  path: "/api/rooms/create",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.rooms.createRoom, {
      hostNickname: body.hostNickname,
      hostAvatarId: body.hostAvatarId,
      settings: body.settings,
    });
  }),
});

http.route({
  path: "/api/rooms/close",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.rooms.closeRoom, { roomId: body.roomId });
  }),
});

http.route({
  path: "/api/rooms/state",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.rooms.getRoomState, { roomId: body.roomId });
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
    });
  }),
});

// --- Storage ---

http.route({
  path: "/api/storage/generate-upload-url",
  method: "POST",
  handler: jsonAction(async (ctx) => {
    const uploadUrl = await ctx.runMutation(api.messages.generateUploadUrl);
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
    });
    return { messageId };
  }),
});

http.route({
  path: "/api/messages/send-drawing",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const messageId = await ctx.runMutation(api.messages.sendDrawingMessage, {
      roomId: body.roomId,
      senderId: body.senderId,
      mediaUrl: body.mediaUrl,
      replyToId: body.replyToId,
    });
    return { messageId };
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
    });
  }),
});

http.route({
  path: "/api/messages/delete",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.messages.deleteMessage, {
      messageId: body.messageId,
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
    });
    return { sessionId };
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
    await ctx.runAction(api.games.submitGameStepWithTranslation, args as any);
  }),
});

http.route({
  path: "/api/games/cancel",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.cancelGame, {
      roomId: body.roomId,
      participantId: body.participantId,
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
    await ctx.runMutation(api.games.submitEmojifyrEmojiClue, {
      roundId: body.roundId,
      emojiClue: body.emojiClue,
    });
  }),
});

http.route({
  path: "/api/emojifyr/submit-guess",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.games.submitEmojifyrGuess, {
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

export default http;
