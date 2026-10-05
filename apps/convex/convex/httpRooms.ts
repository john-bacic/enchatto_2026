import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

export function registerRoomRoutes(http: HttpRouter): void {
  // --- Rooms ---

  http.route({
    path: "/api/rooms/create",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.createRoom, {
        hostNickname: body.hostNickname,
        hostAvatarId: body.hostAvatarId,
        settings: body.settings,
        hostLanguage: typeof body.hostLanguage === "string" ? body.hostLanguage : undefined,
        hostToken: typeof body.hostToken === "string" ? body.hostToken : undefined,
        background: typeof body.background === "number" ? body.background : undefined,
      });
    }),
  });

  http.route({
    path: "/api/rooms/close",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.rooms.closeRoom, {
        roomId: body.roomId,
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/rooms/state",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runQuery(api.rooms.getRoomState, { roomId: body.roomId });
    }),
  });

  http.route({
    path: "/api/rooms/push-token",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.setHostPushToken, {
        roomId: body.roomId,
        hostId: body.hostId,
        token: body.token, // the APNs device token
        callerToken: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/rooms/background",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.setRoomBackground, {
        roomId: body.roomId,
        background: body.background,
        callerId: body.callerId,
        token: body.callerToken,
      });
    }),
  });

  // --- Participants ---

  http.route({
    path: "/api/participants/set-online",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.setParticipantOnline, {
        participantId: body.participantId,
        online: body.online,
        presence: body.presence,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/participants/kick",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.kickParticipant, {
        participantId: body.participantId,
        roomId: body.roomId,
        callerId: body.callerId,
        token: body.callerToken,
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
        drawingStartedAt: body.drawingStartedAt,
        token: body.callerToken,
      });
    }),
  });

  http.route({
    path: "/api/participants/set-language",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      await ctx.runMutation(api.participants.updateParticipantLanguage, {
        participantId: body.participantId,
        language: body.language,
        token: body.callerToken,
      });
    }),
  });

  // --- Storage ---

  http.route({
    path: "/api/storage/generate-upload-url",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      const uploadUrl = await ctx.runMutation(api.messages.generateUploadUrl, {
        callerId: body.callerId,
        token: body.callerToken,
      });
      return { uploadUrl };
    }),
  });
}
