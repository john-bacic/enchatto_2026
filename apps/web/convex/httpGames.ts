import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

// --- Games ---

/** A team split out of a request body: lists of participant ids. Anything else counts as none sent */
function teamSplit(value: unknown): string[][] | undefined {
  const isIds = (team: unknown) => Array.isArray(team) && team.every((id) => typeof id === "string");
  return Array.isArray(value) && value.every(isIds) ? (value as string[][]) : undefined;
}

export function registerGameRoutes(http: HttpRouter): void {
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
}
