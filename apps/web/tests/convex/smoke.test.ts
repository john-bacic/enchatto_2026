import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { createRoom, joinGuest, newBackend, tokenFor } from "./setup";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

test("create, join, send through a mutation and through a route", async () => {
  const t = newBackend();
  const { roomId, hostId, joinCode } = await createRoom(t);
  expect(joinCode).toMatch(/^[A-Z2-9]{6}$/);
  const guestId = await joinGuest(t, roomId, "Guest");
  const messageId = await t.mutation(api.messages.sendTextMessage, { roomId, senderId: guestId, text: "hello" });
  expect(messageId).toBeTruthy();

  const res = await t.fetch("/api/rooms/state", { method: "POST", body: JSON.stringify({ roomId }) });
  expect(res.status).toBe(200);
  const state = await res.json();
  expect(state.participants.map((p: any) => p._id).sort()).toEqual([hostId, guestId].sort());

  await t.finishAllScheduledFunctions(vi.runAllTimers);
});

test("AUTH_MODE is read from the environment", async () => {
  const t = newBackend();
  const token = tokenFor(1);
  const { roomId, hostId } = await createRoom(t, { hostToken: token });
  vi.stubEnv("AUTH_MODE", "enforce");
  await expect(t.mutation(api.rooms.closeRoom, { roomId })).rejects.toThrow(/Not authorised/);
  await t.mutation(api.rooms.closeRoom, { roomId, callerId: hostId, token });
  const state = await t.query(api.rooms.getRoomState, { roomId });
  expect(state?.room.status).toBe("closed");
  await t.finishAllScheduledFunctions(vi.runAllTimers);
});
