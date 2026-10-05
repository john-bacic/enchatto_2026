import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

export function registerEmojiMatchRoutes(http: HttpRouter): void {
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
}
