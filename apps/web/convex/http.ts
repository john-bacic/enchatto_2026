import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper: parse JSON body and call a mutation/query
function jsonAction(handler: (ctx: any, body: any) => Promise<any>) {
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
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/messages/send-drawing",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      let mediaUrl = body.mediaUrl;

      // Convert base64 data URLs to Convex file storage so the messages
      // subscription payload stays small (CDN URL instead of full base64).
      if (mediaUrl && typeof mediaUrl === "string" && mediaUrl.startsWith("data:")) {
        const match = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64 = match[2];
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          const storageId = await ctx.storage.store(blob);
          mediaUrl = await ctx.storage.getUrl(storageId);
        }
      }

      const messageId = await ctx.runMutation(api.messages.sendDrawingMessage, {
        roomId: body.roomId,
        senderId: body.senderId,
        mediaUrl: mediaUrl,
        replyToId: body.replyToId,
      });
      return new Response(JSON.stringify({ messageId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
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
    });
  }),
});

http.route({
  path: "/api/emoji-match/resolve-mismatch",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.resolveMismatch, {
      gameId: body.gameId,
    });
  }),
});

http.route({
  path: "/api/emoji-match/timeout-turn",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.emojiMatch.timeoutTurn, {
      gameId: body.gameId,
      participantId: body.participantId,
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
    try {
      const body = await request.json();
      let mediaUrl = body.responseMediaUrl;

      // Convert base64 data URLs to Convex file storage so the subscription
      // payload stays small (a CDN URL instead of the full base64).
      // Without this, large base64 strings crash the WebSocket on subscribers.
      if (mediaUrl && typeof mediaUrl === "string" && mediaUrl.startsWith("data:")) {
        const match = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64 = match[2];
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          const storageId = await ctx.storage.store(blob);
          mediaUrl = await ctx.storage.getUrl(storageId);
        }
      }

      await ctx.runMutation(api.truthOrDare.submitResponse, {
        gameId: body.gameId,
        participantId: body.participantId,
        responseText: body.responseText,
        responseMediaUrl: mediaUrl,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
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
      callIntervalMs: body.callIntervalMs,
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

export default http;
