import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

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

export function registerWordRushRoutes(http: HttpRouter): void {
  for (const [name, handler] of Object.entries(wordRushRoutes)) {
    http.route({ path: `/api/word-rush/${name}`, method: "POST", handler: jsonAction(handler) });
  }
}
