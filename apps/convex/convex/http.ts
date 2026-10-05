import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { registerRoomRoutes } from "./httpRooms";
import { registerMessageRoutes } from "./httpMessages";
import { checkDrawingBodySize, corsHeaders, decodeDrawing, jsonAction } from "./httpShared";

const http = httpRouter();

registerRoomRoutes(http);
registerMessageRoutes(http);

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
