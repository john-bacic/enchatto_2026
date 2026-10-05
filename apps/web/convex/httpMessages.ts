import { HttpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { checkDrawingBodySize, corsHeaders, decodeDrawing, jsonAction } from "./httpShared";

export function registerMessageRoutes(http: HttpRouter): void {
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
        clientId: body.clientId,
        token: body.callerToken,
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
        clientId: body.clientId,
        token: body.callerToken,
      });
      // The mutation deletes an upload it cannot use and returns null: a throw would have undone the delete
      if (!messageId) throw new Error("Picture rejected: it must be an image of at most 50 MB");
      return { messageId };
    }),
  });

  http.route({
    path: "/api/messages/send-audio",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      const messageId = await ctx.runMutation(api.messages.sendAudioMessage, {
        roomId: body.roomId,
        senderId: body.senderId,
        storageId: body.storageId,
        durationMs: body.durationMs,
        waveform: body.waveform ?? [],
        text: body.text,
        lang: body.lang,
        replyToId: body.replyToId,
        clientId: body.clientId,
        token: body.callerToken,
      });
      return { messageId };
    }),
  });

  http.route({
    path: "/api/messages/transcribe",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      const text = await ctx.runAction(internal.messages.transcribeDictation, {
        roomId: body.roomId,
        senderId: body.senderId,
        storageId: body.storageId,
        token: body.callerToken,
      });
      return { text };
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
      // Set once the drawing is in file storage, so a send that then fails does not leave the file behind
      let storageId: Id<"_storage"> | undefined;
      try {
        checkDrawingBodySize(request);
        const body = await request.json();
        // A send repeated after a lost answer is answered here, before the drawing is stored a second time
        const repeat: Id<"messages"> | null =
          typeof body.clientId === "string" && body.clientId
            ? await ctx.runQuery(internal.messages.findRepeat, {
                roomId: body.roomId,
                senderId: body.senderId,
                clientId: body.clientId,
              })
            : null;
        let messageId = repeat;
        if (!messageId) {
          // Stored as a file so the messages subscription carries a CDN URL, not the whole base64
          storageId = await ctx.storage.store(decodeDrawing(body.mediaUrl));
          messageId = await ctx.runMutation(api.messages.sendDrawingMessage, {
            roomId: body.roomId,
            senderId: body.senderId,
            storageId,
            replyToId: body.replyToId,
            clientId: body.clientId,
            token: body.callerToken,
          });
        }
        return new Response(JSON.stringify({ messageId }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        // No message was made, so nothing refers to the file just stored
        if (storageId) await ctx.storage.delete(storageId).catch(() => undefined);
        const message = e?.message ?? String(e);
        return new Response(JSON.stringify({ error: message }), {
          // As jsonAction: a throttled send is a 503, which the iOS send queue retries (see TOO_FAST in messages.ts)
          status: message.includes("rate limit") ? 503 : 400,
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
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/messages/delete",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.messages.deleteMessage, {
        messageId: body.messageId,
        callerId: body.callerId,
        token: body.callerToken,
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
        callerId: body.callerId,
        token: body.callerToken,
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
        token: body.callerToken,
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
        token: body.callerToken,
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
}
