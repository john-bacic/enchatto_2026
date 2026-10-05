import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { shuffleArray } from "../../convex/gameShared";
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

// The shuffle that Lost in Translation, Emojifyr, Emoji Match, Emoji Bingo and Word Rush deal with
// (convex/gameShared.ts). The tests of boards, decks, turn orders and team splits replace Math.random with a
// fixed sequence, so which draw moves which place is something they rely on.
test("shuffleArray takes one draw for every place but the first, from the last place down, and leaves its list alone", () => {
  const list = ["a", "b", "c", "d", "e"];
  const random = vi.spyOn(Math, "random");
  try {
    // The last place changes with the first, the fourth with the third, the third stays, the second changes with the first
    for (const draw of [0, 0.5, 0.9, 0]) random.mockReturnValueOnce(draw);
    const shuffled = shuffleArray(list);

    expect(shuffled).toEqual(["b", "e", "d", "c", "a"]);
    expect(random).toHaveBeenCalledTimes(4);
    expect(list).toEqual(["a", "b", "c", "d", "e"]);
    expect(shuffled).not.toBe(list);

    // Nothing to change places with: no draw
    random.mockClear();
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray(["a"])).toEqual(["a"]);
    expect(random).not.toHaveBeenCalled();
  } finally {
    random.mockRestore();
  }
});
