import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

export function registerEmojiBingoRoutes(http: HttpRouter): void {
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
}
