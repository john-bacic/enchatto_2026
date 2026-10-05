import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

export function registerEmojifyrRoutes(http: HttpRouter): void {
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
}
