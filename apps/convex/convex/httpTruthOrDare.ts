import { HttpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { checkDrawingBodySize, corsHeaders, decodeDrawing, jsonAction } from "./httpShared";

export function registerTruthOrDareRoutes(http: HttpRouter): void {
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
}
