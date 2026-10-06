import { HttpRouter } from "convex/server";
import { ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { decodeDrawing, jsonAction } from "./httpShared";
import { isInlineDrawing } from "./participants";

// --- Games ---

/** A team split out of a request body: lists of participant ids. Anything else counts as none sent */
function teamSplit(value: unknown): string[][] | undefined {
  const isIds = (team: unknown) => Array.isArray(team) && team.every((id) => typeof id === "string");
  return Array.isArray(value) && value.every(isIds) ? (value as string[][]) : undefined;
}

/** What the submit-step route passes on, once every field of it is known to be text */
type StepArgs = {
  stepId: string;
  participantId: string;
  outputText?: string;
  outputDrawingUrl?: string;
  selectedOption?: string;
  token?: string;
};

/**
 * The drawing of a step's answer as the file to store, or null when the answer is to be passed on as it
 * came: a field of it is not text, it carries no drawing that games.submitGameStep would keep, its step is
 * not the caller's open drawing step, or its base64 does not decode. Whatever is passed on is answered, and
 * refused, by games.submitGameStep: a drawing is stored only where that would have taken it.
 */
async function drawingToStore(ctx: ActionCtx, args: Record<string, unknown>): Promise<Blob | null> {
  if (Object.values(args).some((value) => typeof value !== "string")) return null;
  const { stepId, participantId, outputDrawingUrl, token } = args as StepArgs;
  if (!outputDrawingUrl || !isInlineDrawing(outputDrawingUrl)) return null;
  // Asked before decoding: a drawing sent again after a lost answer, or after the round's deadline, costs one read
  if (!(await ctx.runQuery(internal.games.takesStoredDrawing, { stepId, participantId, token }))) return null;
  try {
    return decodeDrawing(outputDrawingUrl);
  } catch {
    return null;
  }
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

      // The host app sends its drawing as a data URL of 50 to 270 KB. Kept as that, the step, every guess
      // step and the chat message would each hold a copy, and every poll of every client would carry them.
      // Stored as a file, they hold its URL.
      const drawing = await drawingToStore(ctx, args);
      let storageId: Id<"_storage"> | null = null;
      if (drawing) {
        try {
          storageId = await ctx.storage.store(drawing);
        } catch (err: any) {
          // A round does not depend on file storage: the request is passed on as it came, and the step keeps the data URL
          console.error("[submit-step] drawing not stored:", err?.message ?? err);
        }
      }
      if (storageId) {
        const { stepId, participantId, outputText, selectedOption, token } = args as StepArgs;
        let taken = false;
        try {
          taken = await ctx.runMutation(internal.games.submitStoredDrawing, {
            stepId: stepId as Id<"gameSteps">,
            participantId: participantId as Id<"participants">,
            storageId,
            outputText,
            selectedOption,
            token,
          });
        } finally {
          // Refused, or the step was closed while the file was being stored: nothing refers to the file
          if (!taken) await ctx.storage.delete(storageId).catch(() => undefined);
        }
        // A drawing is answered with nothing, taken or not
        return;
      }
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
