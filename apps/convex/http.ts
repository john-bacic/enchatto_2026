import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper: parse JSON body and call a mutation/query
function jsonAction(handler: (ctx: any, body: any) => Promise<any>) {
  return httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await handler(ctx, body);
      return new Response(JSON.stringify(result ?? { ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
  path: "/api/participants/set-typing",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.participants.setTypingAction, {
      participantId: body.participantId,
      action: body.action,
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
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    const messageId = await ctx.runMutation(api.messages.sendDrawingMessage, {
      roomId: body.roomId,
      senderId: body.senderId,
      mediaUrl: body.mediaUrl,
      replyToId: body.replyToId,
    });
    return { messageId };
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
  path: "/api/messages/mark-failed",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    await ctx.runMutation(api.messages.markMessageFailed, {
      messageId: body.messageId,
      error: body.error,
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

// --- Reactions ---

http.route({
  path: "/api/reactions/room-summaries",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runQuery(api.reactions.getRoomReactionSummaries, {
      roomId: body.roomId,
    });
  }),
});

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

export default http;
