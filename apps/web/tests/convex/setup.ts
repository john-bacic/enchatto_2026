/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import schema from "../../convex/schema";

// Every Convex module, _generated included (convex-test finds the functions folder by it).
// The pattern leaves out files with two dots in the name, such as *.d.ts
export const modules = import.meta.glob("../../convex/**/!(*.*.*)*.*s");

/** A fresh in-memory backend with the real schema and functions */
export function newBackend() {
  return convexTest(schema, modules);
}

export type Backend = ReturnType<typeof newBackend>;

/** A caller token in the format the server accepts: 64 hex characters, different for each n */
export function tokenFor(n: number): string {
  return n.toString(16).padStart(64, "0");
}

/** Creates a room the way the iOS host does. Pass hostToken for a host that registered a token */
export async function createRoom(t: Backend, options: { hostNickname?: string; hostToken?: string } = {}) {
  const result = await t.mutation(api.rooms.createRoom, {
    hostNickname: options.hostNickname ?? "Host",
    hostToken: options.hostToken,
  });
  return result as { roomId: Id<"rooms">; joinCode: string; hostId: Id<"participants"> };
}

/** Joins the way the web guest does. Pass token for a guest that registered one */
export async function joinGuest(
  t: Backend,
  roomId: Id<"rooms">,
  nickname: string,
  options: { avatar?: string; language?: string; token?: string } = {}
): Promise<Id<"participants">> {
  return await t.mutation(api.participants.joinRoom, {
    roomId,
    nickname,
    platform: "web",
    avatar: { type: "preset", value: options.avatar ?? "fox" },
    preferredLanguage: options.language ?? "en",
    token: options.token,
  });
}

/**
 * Turns a room into what a room from before reactions carried their room is: no reactionsByRoom on it, and
 * no roomId on the reactions it has. A reaction added afterwards is stored with its roomId, as in such a room.
 */
export async function withoutReactionsByRoom(t: Backend, roomId: Id<"rooms">) {
  await t.run(async (ctx) => {
    await ctx.db.patch(roomId, { reactionsByRoom: undefined });
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
      .collect();
    for (const reaction of reactions) await ctx.db.patch(reaction._id, { roomId: undefined });
  });
}
