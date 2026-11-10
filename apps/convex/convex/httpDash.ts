import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

// Chatto Dash for the iPhone app. The whole game runs in a web view that talks to Convex as the web app does
// (the lobby, dash.pushState, dash.getRacers, ending it), so the app only needs to open a lobby and to know
// that a game is on. The second it mostly has from the room snapshot (httpRooms.ts).
export function registerDashRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/dash/create-lobby",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      const gameId = await ctx.runMutation(api.dash.createLobby, {
        roomId: body.roomId,
        hostParticipantId: body.hostParticipantId,
        token: body.callerToken,
      });
      return { gameId };
    }),
  });

  http.route({
    path: "/api/dash/active",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runQuery(api.dash.getActiveDash, { roomId: body.roomId });
    }),
  });
}
