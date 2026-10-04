import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MockInstance } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { callerProof } from "../../convex/participants";
import schema from "../../convex/schema";
import { Backend, joinGuest, modules, newBackend, tokenFor } from "./setup";

// games.ts: Lost in Translation (sessions, chains, steps, the round watcher) and the retired Emojifyr.

type PID = Id<"participants">;
type RoomId = Id<"rooms">;
type SessionId = Id<"gameSessions">;
type Prompt = { text: string; ja: string; hint?: string; hintJa?: string };

// The watcher's timings as games.ts defines them. They are not exported, so a change there has to be made here too.
const ROUND_CHECK_MS = 10_000;
const ROUND_RECHECK_MS = 5_000;
const DRAW_GRACE_MS = ROUND_CHECK_MS + ROUND_RECHECK_MS + 10_000;
const DRAW_UNTIMED_LIMIT_MS = 180_000;
const GUESS_LIMIT_MS = 60_000;
// One absent player costs the room a look and a recheck
const ABSENT_MS = ROUND_CHECK_MS + ROUND_RECHECK_MS;

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const JPEG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==";

let consoleWarn: MockInstance<typeof console.warn>;
let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
  // games.ts logs every step, and authFail warns on every refused caller
  vi.spyOn(console, "log").mockImplementation(() => {});
  consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // convex-test reports a scheduled function that threw only on the console
  const crashed = consoleError.mock.calls.filter((call) =>
    String(call[0]).startsWith("Error when running scheduled function")
  );
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  expect(crashed).toEqual([]);
});

// The check above knows a crashed scheduled function only by convex-test's wording. If an upgrade changes the
// wording, the check goes quiet and this test fails.
test("a scheduled function that throws is reported in the words the afterEach looks for", async () => {
  const t = newBackend();
  await t.run(async (ctx) => {
    // Not a chain id, so the function's argument check throws
    await ctx.scheduler.runAfter(0, internal.games.roundDeadline, { chainId: "nonsense" as Id<"gameChains">, phase: "draw" });
  });
  await advance(t, 1);

  expect(String(consoleError.mock.calls[0]?.[0])).toMatch(/^Error when running scheduled function/);
  consoleError.mockClear();
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const AVATARS = ["fox", "cat", "owl", "bear"];

/**
 * A room with a host and one English-speaking guest per name, all of them just seen. The host speaks English
 * too: without hostLanguage a host is stored as Japanese and would get every prompt translated.
 */
async function room(
  t: Backend,
  guests: string[] = ["Ann"],
  host: { token?: string } = {}
): Promise<{ roomId: RoomId; hostId: PID; guestIds: PID[] }> {
  const created = await t.mutation(api.rooms.createRoom, {
    hostNickname: "Host",
    hostLanguage: "en",
    hostToken: host.token,
  });
  const roomId = created.roomId as RoomId;
  const hostId = created.hostId as PID;
  const guestIds: PID[] = [];
  for (const [i, name] of guests.entries()) {
    guestIds.push(await joinGuest(t, roomId, name, { avatar: AVATARS[i % AVATARS.length] }));
  }
  return { roomId, hostId, guestIds };
}

/** A word bank like the one the host app sends: n prompts, each with a translation and hints */
function bank(n: number): Prompt[] {
  return Array.from({ length: n }, (_, i) => {
    const k = String(i + 1).padStart(3, "0");
    return { text: `word ${k}`, ja: `言葉${k}`, hint: `hint ${k}`, hintJa: `ヒント${k}` };
  });
}

type StartExtras = {
  gameType?: string;
  level?: number;
  timerEnabled?: number | boolean;
  customPrompts?: Prompt[];
  token?: string;
};

async function start(t: Backend, roomId: RoomId, hostId: PID, extra: StartExtras = {}): Promise<SessionId> {
  return await t.mutation(api.games.startGame, {
    roomId,
    participantId: hostId,
    gameType: "lost-in-translation",
    ...extra,
  });
}

// ─── Time and presence ───────────────────────────────────────────────────────

/** Moves the clock and runs the scheduled functions that came due */
async function advance(t: Backend, ms: number): Promise<void> {
  vi.advanceTimersByTime(ms);
  await t.finishInProgressScheduledFunctions();
}

/** A heartbeat, as a visible tab or the foreground host app sends every 15 s */
async function beat(t: Backend, ...ids: PID[]): Promise<void> {
  for (const participantId of ids) {
    await t.mutation(api.participants.setParticipantOnline, { participantId, online: true });
  }
}

/** What a hidden tab or a backgrounded host app sends */
async function goAway(t: Backend, ...ids: PID[]): Promise<void> {
  for (const participantId of ids) {
    await t.mutation(api.participants.setParticipantOnline, { participantId, online: true, presence: "away" });
  }
}

/** Moves the clock in 5 s steps, with a heartbeat from everyone in `present` after each */
async function pass(t: Backend, ms: number, present: PID[] = []): Promise<void> {
  for (let left = ms; left > 0; left -= 5_000) {
    await advance(t, Math.min(5_000, left));
    await beat(t, ...present);
  }
}

// ─── What a client does ──────────────────────────────────────────────────────

async function myStep(t: Backend, participantId: PID) {
  return await t.query(api.games.getMyActiveStep, { participantId });
}

async function openStep(t: Backend, participantId: PID, type: "draw" | "guess") {
  const step = await myStep(t, participantId);
  if (!step || step.stepType !== type) throw new Error(`Expected an open ${type} step, found ${step?.stepType ?? "none"}`);
  return step;
}

/** Submits the player's open drawing step */
async function draw(t: Backend, participantId: PID, options: { url?: string; token?: string } = {}) {
  const step = await openStep(t, participantId, "draw");
  await t.mutation(api.games.submitGameStep, {
    stepId: step._id,
    participantId,
    outputDrawingUrl: options.url ?? PNG,
    token: options.token,
  });
  return step;
}

/** Submits the player's open guess step with the round's prompt, or with another of its options */
async function guess(t: Backend, participantId: PID, how: "right" | "wrong", token?: string) {
  const step = await openStep(t, participantId, "guess");
  const chain = await t.run(async (ctx) => await ctx.db.get(step.chainId));
  if (!chain?.options) throw new Error("The step's chain has no options");
  const selectedOption = how === "right" ? chain.originalPrompt : chain.options.find((o) => o !== chain.originalPrompt);
  await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId, selectedOption, token });
  return step;
}

// ─── What the database holds ─────────────────────────────────────────────────

async function sessionDoc(t: Backend, sessionId: SessionId) {
  const session = await t.run(async (ctx) => await ctx.db.get(sessionId));
  if (!session) throw new Error("Session not found");
  return session;
}

async function chainsOf(t: Backend, sessionId: SessionId) {
  const chains = await t.run(
    async (ctx) =>
      await ctx.db
        .query("gameChains")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", sessionId))
        .collect()
  );
  return chains.sort((a, b) => a.chainIndex - b.chainIndex);
}

async function stepsOf(t: Backend, sessionId: SessionId) {
  return await t.run(
    async (ctx) =>
      await ctx.db
        .query("gameSteps")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", sessionId))
        .collect()
  );
}

async function stepDoc(t: Backend, stepId: Id<"gameSteps">) {
  const step = await t.run(async (ctx) => await ctx.db.get(stepId));
  if (!step) throw new Error("Step not found");
  return step;
}

async function participantDoc(t: Backend, participantId: PID) {
  const participant = await t.run(async (ctx) => await ctx.db.get(participantId));
  if (!participant) throw new Error("Participant not found");
  return participant;
}

async function sessionsIn(t: Backend, roomId: RoomId) {
  return await t.run(
    async (ctx) =>
      await ctx.db
        .query("gameSessions")
        .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
        .collect()
  );
}

/** The room's messages, oldest first */
async function chatOf(t: Backend, roomId: RoomId) {
  const messages = await t.run(
    async (ctx) =>
      await ctx.db
        .query("messages")
        .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
        .collect()
  );
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/** The game records in a room's chat, without the join and leave lines */
async function gameRecords(t: Backend, roomId: RoomId): Promise<string[]> {
  return (await chatOf(t, roomId)).map((m) => m.text ?? "").filter((text) => text.startsWith("game"));
}

type Summary = {
  gameType: string;
  level: number;
  cancelled?: boolean;
  players: Record<string, { name: string; avatar: string }>;
  rounds: Array<{ round: number; prompt: string; results: Record<string, boolean> }>;
  totals: Record<string, { correct: number; total: number }>;
};

async function summariesIn(t: Backend, roomId: RoomId): Promise<Summary[]> {
  return (await gameRecords(t, roomId))
    .filter((text) => text.startsWith("game_summary:"))
    .map((text) => JSON.parse(text.slice("game_summary:".length)) as Summary);
}

async function post(t: Backend, path: string, body: Record<string, unknown>) {
  const res = await t.fetch(path, { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

// ─── Lost in Translation ─────────────────────────────────────────────────────

describe("startGame", () => {
  test("the host's Start opens a ten-round session with one drawing step, for the host", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);

    expect(await sessionDoc(t, sessionId)).toMatchObject({
      roomId,
      gameType: "lost-in-translation",
      status: "active",
      createdByParticipantId: hostId,
      playerIds: [hostId, ann],
      chainCount: 10,
      level: 1,
      timerEnabled: 20,
    });
    const chains = await chainsOf(t, sessionId);
    expect(chains).toHaveLength(10);
    expect(chains.every((c) => c.status === "active")).toBe(true);
    const steps = await stepsOf(t, sessionId);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      chainId: chains[0]._id,
      stepIndex: 0,
      stepType: "draw",
      assignedParticipantId: hostId,
      inputText: chains[0].originalPrompt,
      status: "active",
    });
  });

  test("the chat records the start with its level", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId, { level: 3 });

    const record = (await chatOf(t, roomId)).find((m) => m.text?.startsWith("game:"));
    expect(record).toMatchObject({
      kind: "system",
      status: "processed",
      senderId: hostId,
      text: "game:Lost in Translation Level 3",
    });
  });

  test("the drawing passes round by round through the players in join order", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);

    const chains = await chainsOf(t, sessionId);
    expect(chains.map((c) => c.drawerParticipantId)).toEqual([hostId, ann, ben, hostId, ann, ben, hostId, ann, ben, hostId]);
    expect(chains.every((c) => c.maxSteps === 3)).toBe(true);
  });

  test("every round has its own prompt, offered among four different options", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);

    const chains = await chainsOf(t, sessionId);
    expect(new Set(chains.map((c) => c.originalPrompt)).size).toBe(10);
    for (const chain of chains) {
      expect(chain.options).toHaveLength(4);
      expect(new Set(chain.options).size).toBe(4);
      expect(chain.options).toContain(chain.originalPrompt);
    }
  });

  test("a word bank from the host app supplies every prompt and option, and no wrong option is used twice", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });

    expect((await sessionDoc(t, sessionId)).customPrompts).toEqual(prompts);
    const chains = await chainsOf(t, sessionId);
    const offered = chains.flatMap((c) => c.options ?? []);
    const words = prompts.map((p) => p.text);
    expect(offered.every((o) => words.includes(o))).toBe(true);
    // 10 prompts and 30 wrong options from a bank of 40: each word is offered exactly once
    expect(new Set(offered).size).toBe(40);
  });

  // A Start that carries no word bank, as the web room page sends it, is played with the built-in phrases
  test("with no word bank each level plays its own built-in phrases, wrong options included, and a level above 4 plays level 4", async () => {
    /** Every option of every round of a game started at this level */
    async function optionsAt(level: number): Promise<string[]> {
      const t = newBackend();
      const { roomId, hostId } = await room(t);
      const sessionId = await start(t, roomId, hostId, { level });
      const options = (await chainsOf(t, sessionId)).flatMap((c) => c.options ?? []);
      expect(options).toHaveLength(40);
      return options;
    }
    const wordCounts = (options: string[]) => options.map((o) => o.split(" ").length);

    // A long phrase among single words would give the answer away, so the wrong options match the level too
    expect(new Set(wordCounts(await optionsAt(1)))).toEqual(new Set([1]));
    expect(new Set(wordCounts(await optionsAt(2)))).toEqual(new Set([2]));
    const [level3, level4, level9] = [await optionsAt(3), await optionsAt(4), await optionsAt(9)];
    for (const options of [level3, level4, level9]) expect(Math.min(...wordCounts(options))).toBeGreaterThan(2);
    expect(level4.filter((o) => level3.includes(o))).toEqual([]);
    expect(level9.filter((o) => level3.includes(o))).toEqual([]);
  });

  test("a guest cannot start a game", async () => {
    const t = newBackend();
    const { roomId, guestIds: [ann] } = await room(t);

    await expect(start(t, roomId, ann)).rejects.toThrow(/Only the host can start a game/);
    expect(await sessionsIn(t, roomId)).toEqual([]);
  });

  test("a second Start while a game is running is refused", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);

    await expect(start(t, roomId, hostId)).rejects.toThrow(/already in progress/);
    expect(await sessionsIn(t, roomId)).toHaveLength(1);
  });

  test("a game cannot start in a closed room", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await t.mutation(api.rooms.closeRoom, { roomId });

    await expect(start(t, roomId, hostId)).rejects.toThrow(/Room is closed/);
  });

  test("the host alone cannot start a game", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);

    await expect(start(t, roomId, hostId)).rejects.toThrow(/at least 2 players/);
  });

  test("a guest who left is not dealt in", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await t.mutation(api.participants.leaveRoom, { participantId: ann });

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, ben]);
  });

  // Review bug 2: `departed` used to stay set after a reload, which hid the guest from every game
  test("a guest who left and came back online is dealt in", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await t.mutation(api.participants.leaveRoom, { participantId: ann });
    await t.mutation(api.participants.setParticipantOnline, { participantId: ann, online: true, presence: "online" });

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, ann]);
  });

  // Review bug 6: `online` stays true for up to an hour after a phone is pocketed
  test("a guest still marked online but silent for over three minutes is not dealt in while others are here", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await advance(t, 4 * 60_000);
    await beat(t, hostId, ann);
    expect((await participantDoc(t, ben)).online).toBe(true);

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, ann]);
  });

  test("a guest whose phone dimmed a minute ago still gets a seat", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await goAway(t, ann);
    await advance(t, 60_000);
    await beat(t, hostId, ben);

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, ann, ben]);
  });

  test("Start still works when the only guest has been silent for over three minutes", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await advance(t, 4 * 60_000);

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, ann]);
  });

  test("pressing Start counts as the host being here, so the first look does not skip the host's drawing", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    // The host's last heartbeat is two minutes old and said "away"
    await goAway(t, hostId);
    await pass(t, 120_000, [ann]);

    await start(t, roomId, hostId);
    expect(await participantDoc(t, hostId)).toMatchObject({ online: true, presence: "online", lastSeenAt: Date.now() });

    await advance(t, ROUND_CHECK_MS);
    await advance(t, ROUND_RECHECK_MS);
    expect(await myStep(t, hostId)).toMatchObject({ stepType: "draw", status: "active", round: 1 });
  });

  test.each<[string, StartExtras, RegExp]>([
    ["more than 200 prompts", { customPrompts: bank(201) }, /Too many prompts/],
    ["a prompt over 200 characters", { customPrompts: [...bank(39), { text: "x".repeat(201), ja: "x" }] }, /Prompt too long/],
    ["a translation over 200 characters", { customPrompts: [...bank(39), { text: "x", ja: "x".repeat(201) }] }, /Prompt too long/],
    [
      "a hint over 200 characters",
      { customPrompts: [...bank(39), { text: "x", ja: "x", hint: "x".repeat(201) }] },
      /Prompt too long/,
    ],
    [
      "a Japanese hint over 200 characters",
      { customPrompts: [...bank(39), { text: "x", ja: "x", hintJa: "x".repeat(201) }] },
      /Prompt too long/,
    ],
    ["a game type over 40 characters", { gameType: "x".repeat(41) }, /Unknown game type/],
  ])("Start is refused with %s", async (_what, extra, error) => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);

    await expect(start(t, roomId, hostId, extra)).rejects.toThrow(error);
    expect(await sessionsIn(t, roomId)).toEqual([]);
  });

  test("200 prompts of 200 characters are within the caps", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const prompts = Array.from({ length: 200 }, (_, i) => ({
      text: `${i}`.padEnd(200, "a"),
      ja: `${i}`.padEnd(200, "あ"),
      hint: `${i}`.padEnd(200, "h"),
      hintJa: `${i}`.padEnd(200, "ひ"),
    }));

    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
  });

  // A word bank under thirteen prompts cannot give ten rounds a prompt and three wrong options each: it is not played
  test.each([0, 1, 2, 10, 11, 12])(
    "a custom word bank of %i prompts still gives every round four different options",
    async (size) => {
      const t = newBackend();
      const { roomId, hostId } = await room(t);

      const started = start(t, roomId, hostId, { customPrompts: bank(size) });
      await expect(started).resolves.toBeTruthy();
      for (const chain of await chainsOf(t, await started)) expect(new Set(chain.options).size).toBe(4);
    }
  );

  test("a word bank too small to play is replaced whole by the built-in phrases of the level", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const words = bank(12).map((p) => p.text);
    const sessionId = await start(t, roomId, hostId, { customPrompts: bank(12), level: 2 });

    const chains = await chainsOf(t, sessionId);
    expect(new Set(chains.map((c) => c.originalPrompt)).size).toBe(10);
    const offered = chains.flatMap((c) => c.options ?? []);
    expect(offered.filter((o) => words.includes(o))).toEqual([]);
    // Level 2's phrases are two words each
    expect(new Set(offered.map((o) => o.split(" ").length))).toEqual(new Set([2]));
  });

  test("thirteen prompts are the smallest word bank that is played: every prompt and option is its own", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const words = bank(13).map((p) => p.text);
    const sessionId = await start(t, roomId, hostId, { customPrompts: bank(13) });

    const chains = await chainsOf(t, sessionId);
    expect(new Set(chains.map((c) => c.originalPrompt)).size).toBe(10);
    for (const chain of chains) {
      expect(new Set(chain.options).size).toBe(4);
      expect(chain.options).toContain(chain.originalPrompt);
      expect(chain.options!.every((o) => words.includes(o))).toBe(true);
    }
  });

  // A text listed twice could be dealt twice into one round, or as two rounds' prompt
  test("a word bank is counted by its different texts", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);

    // 24 prompts, 12 different: too small, although ten rounds could be dealt from it
    const twelveTwice = [...bank(12), ...bank(12)];
    const words = twelveTwice.map((p) => p.text);
    const builtIn = await start(t, roomId, hostId, { customPrompts: twelveTwice });
    for (const chain of await chainsOf(t, builtIn)) {
      expect(new Set(chain.options).size).toBe(4);
      expect(chain.options!.filter((o) => words.includes(o))).toEqual([]);
    }
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    // 26 prompts, 13 different: played, with no text twice in a round and no prompt twice in the game
    const thirteenTwice = [...bank(13), ...bank(13)];
    const own = await start(t, roomId, hostId, { customPrompts: thirteenTwice });
    const chains = await chainsOf(t, own);
    expect(new Set(chains.map((c) => c.originalPrompt)).size).toBe(10);
    for (const chain of chains) {
      expect(new Set(chain.options).size).toBe(4);
      expect(chain.options!.every((o) => o.startsWith("word "))).toBe(true);
    }
    // The bank is stored as it was sent
    expect((await sessionDoc(t, own)).customPrompts).toEqual(thirteenTwice);
  });
});

describe("caller tokens", () => {
  const HOST_TOKEN = tokenFor(1);
  const ANN_TOKEN = tokenFor(2);

  /** A room whose host and guest both registered a token, as current builds do */
  async function tokenRoom(t: Backend) {
    const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
    const ann = await joinGuest(t, roomId, "Ann", { token: ANN_TOKEN });
    return { roomId, hostId, ann };
  }

  test("by default a missing token is logged and let through, so builds from before tokens keep working", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);

    const sessionId = await start(t, roomId, hostId);
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/^auth: games\.startGame no token/));
  });

  test("when enforced, Start needs the host's own token", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);
    vi.stubEnv("AUTH_MODE", "enforce");

    await expect(start(t, roomId, hostId)).rejects.toThrow(/Not authorised/);
    await expect(start(t, roomId, hostId, { token: ANN_TOKEN })).rejects.toThrow(/Not authorised/);
    expect(await sessionsIn(t, roomId)).toEqual([]);

    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN });
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
  });

  test("when enforced, another room's host cannot start or cancel a game here, even with its own token", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);
    const other = await room(t, ["Zed"], { token: tokenFor(3) });
    vi.stubEnv("AUTH_MODE", "enforce");

    await expect(start(t, roomId, other.hostId, { token: tokenFor(3) })).rejects.toThrow(/Not authorised/);
    expect(await sessionsIn(t, roomId)).toEqual([]);

    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN });
    await expect(
      t.mutation(api.games.cancelGame, { roomId, participantId: other.hostId, token: tokenFor(3) })
    ).rejects.toThrow(/Not authorised/);
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
  });

  test("when enforced, a host and a guest from before tokens still play without one", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    vi.stubEnv("AUTH_MODE", "enforce");

    await start(t, roomId, hostId);
    await draw(t, hostId);
    const step = await guess(t, ann, "right");
    expect((await stepDoc(t, step._id)).correct).toBe(true);
  });

  test("when enforced, a step is only taken with its player's token", async () => {
    const t = newBackend();
    const { roomId, hostId, ann } = await tokenRoom(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    await start(t, roomId, hostId, { token: HOST_TOKEN });
    await draw(t, hostId, { token: HOST_TOKEN });

    await expect(guess(t, ann, "right")).rejects.toThrow(/Not authorised/);
    // The host knows Ann's participant id and step id, but not her token
    await expect(guess(t, ann, "right", HOST_TOKEN)).rejects.toThrow(/Not authorised/);
    expect(await myStep(t, ann)).toMatchObject({ stepType: "guess", status: "active" });

    const step = await guess(t, ann, "right", ANN_TOKEN);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", correct: true });
  });

  test("when enforced, the submit action passes the caller's token on", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    await start(t, roomId, hostId, { token: HOST_TOKEN });
    const step = await openStep(t, hostId, "draw");

    await expect(
      t.action(api.games.submitGameStepWithTranslation, { stepId: step._id, participantId: hostId, outputDrawingUrl: PNG })
    ).rejects.toThrow(/Not authorised/);
    await t.action(api.games.submitGameStepWithTranslation, {
      stepId: step._id,
      participantId: hostId,
      outputDrawingUrl: PNG,
      token: HOST_TOKEN,
    });
    expect((await stepDoc(t, step._id)).status).toBe("submitted");
  });

  test("when enforced, Cancel needs the host's token", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN });

    await expect(t.mutation(api.games.cancelGame, { roomId, participantId: hostId })).rejects.toThrow(/Not authorised/);
    expect((await sessionDoc(t, sessionId)).status).toBe("active");

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId, token: HOST_TOKEN });
    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true });
  });

  test("when enforced, the routes read the token from callerToken", async () => {
    const t = newBackend();
    const { roomId, hostId } = await tokenRoom(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    const startBody = { roomId, participantId: hostId, gameType: "lost-in-translation", level: 1, timerEnabled: 20 };

    const refused = await post(t, "/api/games/start", startBody);
    expect(refused.status).toBe(400);
    expect(refused.body.error).toMatch(/Not authorised/);

    const started = await post(t, "/api/games/start", { ...startBody, callerToken: HOST_TOKEN });
    expect(started.status).toBe(200);
    const step = await openStep(t, hostId, "draw");
    const stepBody = { stepId: step._id, participantId: hostId, outputDrawingUrl: PNG };
    expect((await post(t, "/api/games/submit-step", stepBody)).status).toBe(400);
    expect((await post(t, "/api/games/submit-step", { ...stepBody, callerToken: HOST_TOKEN })).status).toBe(200);
    expect((await stepDoc(t, step._id)).status).toBe("submitted");

    expect((await post(t, "/api/games/cancel", { roomId, participantId: hostId })).status).toBe(400);
    expect((await post(t, "/api/games/cancel", { roomId, participantId: hostId, callerToken: HOST_TOKEN })).status).toBe(200);
    expect(await sessionDoc(t, started.body.sessionId)).toMatchObject({ status: "complete", cancelled: true });
  });
});

describe("submitGameStep", () => {
  test("a drawing opens a guess for every other player and is posted to the chat", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    const step = await draw(t, hostId);

    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", outputDrawingUrl: PNG, submittedAt: Date.now() });
    const guesses = (await stepsOf(t, sessionId)).filter((s) => s.stepType === "guess");
    expect(guesses.map((s) => s.assignedParticipantId).sort()).toEqual([ann, ben].sort());
    for (const g of guesses) expect(g).toMatchObject({ chainId: step.chainId, status: "active", inputDrawingUrl: PNG });
    expect(await myStep(t, hostId)).toBeNull();

    const drawings = (await chatOf(t, roomId)).filter((m) => m.kind === "drawing");
    expect(drawings).toHaveLength(1);
    expect(drawings[0]).toMatchObject({ senderId: hostId, status: "processed", mediaUrl: PNG });
  });

  test("only the player a step was dealt to can submit it", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");

    await expect(
      t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, outputDrawingUrl: PNG })
    ).rejects.toThrow(/Not your step/);
    expect((await stepDoc(t, step._id)).status).toBe("active");
  });

  test.each([
    ["a link", "https://example.com/drawing.png"],
    ["an SVG data URL", "data:image/svg+xml;base64,PHN2Zy8+"],
    ["a PNG data URL over 1 MiB", "data:image/png;base64," + "A".repeat(1024 * 1024)],
  ])("%s is refused as a drawing and the step stays open", async (_what, url) => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");

    await expect(
      t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId, outputDrawingUrl: url })
    ).rejects.toThrow(/Unsupported drawing/);
    expect((await stepDoc(t, step._id)).status).toBe("active");
    expect((await chatOf(t, roomId)).filter((m) => m.kind === "drawing")).toEqual([]);
  });

  test("a JPEG data URL, which the web canvas sends, is accepted", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);

    const step = await draw(t, hostId, { url: JPEG });
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", outputDrawingUrl: JPEG });
  });

  // Neither client sends this: both always attach the canvas image. The guessers would get a guess with no picture
  test("a drawing step cannot be submitted without a drawing", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");

    await expect(t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId })).rejects.toThrow();
    expect((await stepDoc(t, step._id)).status).toBe("active");
    expect(await myStep(t, ann)).toBeNull();
  });

  test("a drawing step sent with only an answer, or with an empty drawing over the route, is refused in words and stays open", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");

    await expect(
      t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId, selectedOption: "Cat", outputText: "Cat" })
    ).rejects.toThrow(/Drawing is missing/);
    await expect(
      t.action(api.games.submitGameStepWithTranslation, { stepId: step._id, participantId: hostId })
    ).rejects.toThrow(/Drawing is missing/);
    // The route leaves an empty outputDrawingUrl out of what it passes on
    const empty = await post(t, "/api/games/submit-step", { stepId: step._id, participantId: hostId, outputDrawingUrl: "" });
    expect(empty.status).toBe(400);
    expect(empty.body.error).toMatch(/Drawing is missing/);

    expect(await stepDoc(t, step._id)).toMatchObject({ status: "active" });
    expect(await stepsOf(t, sessionId)).toHaveLength(1);
    expect(await myStep(t, ann)).toBeNull();
    expect((await chatOf(t, roomId)).filter((m) => m.kind === "drawing")).toEqual([]);

    // The step is still there to be drawn
    await draw(t, hostId);
    expect(await myStep(t, ann)).toMatchObject({ stepType: "guess", inputDrawingUrl: PNG });
  });

  // The overlay retries a submit until it is taken, so an answer to a step that is already closed is never an error
  test("a late submit with no drawing, to a drawing step that is already closed, is dropped like any late answer", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);
    const step = await draw(t, hostId);

    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId });
    expect((await post(t, "/api/games/submit-step", { stepId: step._id, participantId: hostId })).status).toBe(200);
    expect((await stepDoc(t, step._id)).outputDrawingUrl).toBe(PNG);
  });

  test("an answer over 500 characters is refused, and one of 500 is taken as a wrong guess", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    await draw(t, hostId);
    const step = await openStep(t, ann, "guess");

    await expect(
      t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, selectedOption: "x".repeat(501) })
    ).rejects.toThrow(/Answer too long/);
    // The cap is on whichever field carries the answer
    await expect(
      t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, outputText: "x".repeat(501) })
    ).rejects.toThrow(/Answer too long/);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, selectedOption: "x".repeat(500) });
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", correct: false });
  });

  test("a guess is right only when it is the round's prompt", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);

    const right = await guess(t, ann, "right");
    const wrong = await guess(t, ben, "wrong");
    expect(await stepDoc(t, right._id)).toMatchObject({ correct: true, selectedOption: chain.originalPrompt });
    const wrongDoc = await stepDoc(t, wrong._id);
    expect(wrongDoc.correct).toBe(false);
    expect(wrongDoc.selectedOption).not.toBe(chain.originalPrompt);
  });

  test("a guess made in Japanese is scored against the prompt's translation", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    const [chain] = await chainsOf(t, sessionId);
    const translation = prompts.find((p) => p.text === chain.originalPrompt)!.ja;
    await draw(t, hostId);

    const step = await openStep(t, yuki, "guess");
    expect(step.options).toContain(translation);
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption: translation });
    expect((await stepDoc(t, step._id)).correct).toBe(true);
  });

  // A Start that carries no word bank, as the web room page sends it, leaves only the built-in translations
  test("with no word bank, a Japanese guess is scored against the built-in translation", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    const aki = await joinGuest(t, roomId, "Aki", { language: "ja", avatar: "cat" });
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);

    // A Japanese-speaking player's options are the chain's, translated, in the same order
    const step = await openStep(t, yuki, "guess");
    const right = step.options![chain.options!.indexOf(chain.originalPrompt)];
    expect(right).not.toBe(chain.originalPrompt);
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption: right });
    expect((await stepDoc(t, step._id)).correct).toBe(true);

    const other = await openStep(t, aki, "guess");
    const wrong = other.options!.find((o) => o !== right)!;
    await t.mutation(api.games.submitGameStep, { stepId: other._id, participantId: aki, selectedOption: wrong });
    expect((await stepDoc(t, other._id)).correct).toBe(false);
  });

  // The session's word bank comes before the built-in one, in what is shown and in what is scored
  test("a Japanese guess is scored against the translation the player was shown, also for a built-in word", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    // Thirteen words of the built-in level 1 bank, each with a translation of the session's own
    const builtIn = ["Cat", "Dog", "Sun", "Tree", "Fish", "House", "Star", "Flower", "Car", "Bird", "Moon", "Apple", "Robot"];
    const prompts = builtIn.map((text, i) => ({ text, ja: `別訳${i}` }));
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    const [chain] = await chainsOf(t, sessionId);
    const shown = prompts.find((p) => p.text === chain.originalPrompt)!.ja;
    await draw(t, hostId);

    const step = await openStep(t, yuki, "guess");
    expect(step.options).toContain(shown);
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption: shown });
    expect((await stepDoc(t, step._id)).correct).toBe(true);
  });

  test("the built-in translation of a word the session's bank translates otherwise was not on offer, and is not right", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    const builtIn: Record<string, string> = {
      Cat: "猫", Dog: "犬", Sun: "太陽", Tree: "木", Fish: "魚", House: "家", Star: "星",
      Flower: "花", Car: "車", Bird: "鳥", Moon: "月", Apple: "りんご", Robot: "ロボット",
    };
    const prompts = Object.keys(builtIn).map((text, i) => ({ text, ja: `別訳${i}` }));
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);

    const step = await openStep(t, yuki, "guess");
    expect(step.options).not.toContain(builtIn[chain.originalPrompt]);
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption: builtIn[chain.originalPrompt] });
    expect((await stepDoc(t, step._id)).correct).toBe(false);
  });

  // Shown and scored are read from one map, in which the later of two entries for a text stands
  test("when a word bank lists a text twice, a Japanese guess is scored against the translation that was shown", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    const first = bank(13).map((p) => ({ text: p.text, ja: `先${p.ja}` }));
    const second = bank(13).map((p) => ({ text: p.text, ja: `後${p.ja}` }));
    const sessionId = await start(t, roomId, hostId, { customPrompts: [...first, ...second] });
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);

    const step = await openStep(t, yuki, "guess");
    const shown = step.options![chain.options!.indexOf(chain.originalPrompt)];
    expect(shown).toBe(second.find((p) => p.text === chain.originalPrompt)!.ja);
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption: shown });
    expect((await stepDoc(t, step._id)).correct).toBe(true);
  });

  test("a round waits for every guess, and the last one hands the drawing to the next player", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);

    await guess(t, ann, "right");
    let chains = await chainsOf(t, sessionId);
    expect(chains[0].status).toBe("active");
    expect(await myStep(t, ann)).toBeNull();

    await guess(t, ben, "wrong");
    chains = await chainsOf(t, sessionId);
    expect(chains[0].status).toBe("complete");
    expect(await myStep(t, ann)).toMatchObject({
      stepType: "draw",
      chainId: chains[1]._id,
      round: 2,
      inputText: chains[1].originalPrompt,
    });
    expect(await myStep(t, hostId)).toBeNull();
    expect(await myStep(t, ben)).toBeNull();
  });

  test("a drawing sent twice is taken once", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    const step = await draw(t, hostId);

    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId, outputDrawingUrl: JPEG });

    expect((await stepDoc(t, step._id)).outputDrawingUrl).toBe(PNG);
    expect((await stepsOf(t, sessionId)).filter((s) => s.stepType === "guess")).toHaveLength(2);
    expect((await chatOf(t, roomId)).filter((m) => m.kind === "drawing")).toHaveLength(1);
  });

  test("a second answer to the same guess does not replace the first", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);
    const step = await guess(t, ann, "wrong");

    await t.mutation(api.games.submitGameStep, {
      stepId: step._id,
      participantId: ann,
      selectedOption: chain.originalPrompt,
    });
    expect((await stepDoc(t, step._id)).correct).toBe(false);
  });

  test("the action the host app's route calls takes a drawing and a guess like the mutation", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);

    const drawStep = await openStep(t, hostId, "draw");
    await t.action(api.games.submitGameStepWithTranslation, {
      stepId: drawStep._id,
      participantId: hostId,
      outputDrawingUrl: PNG,
    });
    const guessStep = await openStep(t, ann, "guess");
    await t.action(api.games.submitGameStepWithTranslation, {
      stepId: guessStep._id,
      participantId: ann,
      outputText: chain.originalPrompt,
      selectedOption: chain.originalPrompt,
    });

    expect(await stepDoc(t, guessStep._id)).toMatchObject({ status: "submitted", correct: true });
    expect((await chainsOf(t, sessionId))[0].status).toBe("complete");
    await expect(
      t.action(api.games.submitGameStepWithTranslation, {
        stepId: (await openStep(t, ann, "draw"))._id,
        participantId: ann,
        outputDrawingUrl: "https://example.com/drawing.png",
      })
    ).rejects.toThrow(/Unsupported drawing/);
  });
});

// Review bug 9 and commit 17f6267: a round used to wait forever for a player who was not there
describe("the round watcher", () => {
  test("an absent drawer is timed out after two looks and the next round starts", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");
    await goAway(t, hostId);

    await advance(t, ROUND_CHECK_MS);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await advance(t, ROUND_RECHECK_MS);
    const chains = await chainsOf(t, sessionId);
    expect(chains[0].status).toBe("complete");
    expect(await myStep(t, ann)).toMatchObject({ stepType: "draw", chainId: chains[1]._id, round: 2 });
    // Nobody drew, so there is nothing to guess
    expect((await stepsOf(t, sessionId)).filter((s) => s.stepType === "guess")).toEqual([]);
  });

  test("a step the server closed stays 'submitted', which old host apps can decode, and is flagged timed out with no answer", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    await draw(t, hostId);
    const step = await openStep(t, ann, "guess");
    await goAway(t, ann);

    await advance(t, ROUND_CHECK_MS);
    await advance(t, ROUND_RECHECK_MS);
    const closed = await stepDoc(t, step._id);
    expect(closed).toMatchObject({ status: "submitted", timedOut: true, submittedAt: Date.now() });
    expect(closed.correct).toBeUndefined();
    expect(closed.selectedOption).toBeUndefined();
  });

  test("a drawer who is back by the second look keeps the step, and it then takes two more looks to time them out", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");
    await goAway(t, hostId);
    await advance(t, ROUND_CHECK_MS);

    await beat(t, hostId);
    await advance(t, ROUND_RECHECK_MS);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await goAway(t, hostId);
    await advance(t, ROUND_CHECK_MS);
    expect((await stepDoc(t, step._id)).status).toBe("active");
    await advance(t, ROUND_RECHECK_MS);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
  });

  test("a player whose heartbeat stopped counts as absent even though still marked online", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    // Ann's phone locked four minutes ago; she is dealt in only because she is the only guest
    await advance(t, 4 * 60_000);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    const step = await openStep(t, ann, "guess");
    expect((await participantDoc(t, ann)).online).toBe(true);

    await pass(t, ABSENT_MS, [hostId]);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
    // Round 2 is hers to draw, and is passed over the same way
    await pass(t, ABSENT_MS, [hostId]);
    const chains = await chainsOf(t, sessionId);
    expect(chains.slice(0, 3).map((c) => c.status)).toEqual(["complete", "complete", "active"]);
    expect(await myStep(t, hostId)).toMatchObject({ stepType: "draw", round: 3 });
  });

  test("a kicked drawer cannot come back, so the round is closed at the first look", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    await guess(t, ann, "right");
    await guess(t, ben, "right");
    const step = await openStep(t, ann, "draw");
    await t.mutation(api.participants.kickParticipant, { participantId: ann, roomId });

    await advance(t, ROUND_CHECK_MS);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
    expect((await chainsOf(t, sessionId))[1].status).toBe("complete");
    expect(await myStep(t, ben)).toMatchObject({ stepType: "draw", round: 3 });
  });

  test.each([
    [20, 20_000 + DRAW_GRACE_MS],
    [60, 60_000 + DRAW_GRACE_MS],
  ])("a drawer who is here but idle on a %i s timer is timed out after %i ms: the timer plus the grace", async (timer, limit) => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId, { timerEnabled: timer });
    const step = await openStep(t, hostId, "draw");

    await pass(t, limit - 5_000, [hostId, ann]);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await pass(t, 5_000, [hostId, ann]);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
    expect(await myStep(t, ann)).toMatchObject({ stepType: "draw", round: 2 });
  });

  test.each<[string, number | boolean]>([
    ["0", 0],
    ["false, as old sessions stored it", false],
  ])("with the timer off (%s) an idle drawer gets three minutes", async (_what, timerEnabled) => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId, { timerEnabled });
    const step = await openStep(t, hostId, "draw");

    await pass(t, DRAW_UNTIMED_LIMIT_MS - 5_000, [hostId, ann]);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await pass(t, 5_000, [hostId, ann]);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
  });

  test("a guesser who is here but never answers is timed out after a minute", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    const step = await openStep(t, ann, "guess");

    await pass(t, GUESS_LIMIT_MS - 5_000, [hostId, ann]);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    await pass(t, 5_000, [hostId, ann]);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
    expect((await chainsOf(t, sessionId))[0].status).toBe("complete");
    expect(await myStep(t, ann)).toMatchObject({ stepType: "draw", round: 2 });
  });

  test("an absent guesser is not closed out while another guesser is still deciding, and can come back and answer", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    const annStep = await openStep(t, ann, "guess");
    const benStep = await openStep(t, ben, "guess");
    await goAway(t, ann);

    await pass(t, 30_000, [hostId, ben]);
    expect((await stepDoc(t, annStep._id)).status).toBe("active");
    expect((await stepDoc(t, benStep._id)).status).toBe("active");

    await beat(t, ann);
    await guess(t, ann, "right");
    const answered = await stepDoc(t, annStep._id);
    expect(answered).toMatchObject({ status: "submitted", correct: true });
    expect(answered.timedOut).toBeUndefined();
    expect((await chainsOf(t, sessionId))[0].status).toBe("active");
  });

  test("when everyone still owing a guess is absent, the round ends after two looks and their guess is not scored", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await start(t, roomId, hostId);
    await draw(t, hostId);
    await guess(t, ann, "right");
    const benStep = await openStep(t, ben, "guess");
    await goAway(t, ben);

    await advance(t, ROUND_CHECK_MS);
    expect((await stepDoc(t, benStep._id)).status).toBe("active");
    await advance(t, ROUND_RECHECK_MS);
    expect(await stepDoc(t, benStep._id)).toMatchObject({ status: "submitted", timedOut: true });

    const status = await t.query(api.games.getGameStatus, { roomId });
    expect(status).toMatchObject({ currentRound: 2, phase: "drawing", drawerName: "Ann" });
    expect(status!.scores[ann]).toMatchObject({ correct: 1, total: 1 });
    expect(status!.scores[ben]).toMatchObject({ correct: 0, total: 0 });
  });

  test("when two guessers are absent, both of their steps are closed and neither is left holding one", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await start(t, roomId, hostId);
    await draw(t, hostId);
    const annStep = await openStep(t, ann, "guess");
    const benStep = await openStep(t, ben, "guess");
    await goAway(t, ann, ben);

    await pass(t, ABSENT_MS, [hostId]);
    expect(await stepDoc(t, annStep._id)).toMatchObject({ status: "submitted", timedOut: true });
    expect(await stepDoc(t, benStep._id)).toMatchObject({ status: "submitted", timedOut: true });
    // A guess left open would be what its player is shown from now on, in place of any later step
    expect(await myStep(t, ann)).toMatchObject({ stepType: "draw", round: 2 });
    expect(await myStep(t, ben)).toBeNull();
  });

  test("the drawing phase's watcher, firing after the drawing is in, is not a look at the guessers", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    await advance(t, 8_000);
    await draw(t, hostId);
    const step = await openStep(t, ann, "guess");
    await goAway(t, ann);

    // 10 s after the start the drawing watcher fires. Had it counted as a look, its recheck would close the guess at 15 s
    await advance(t, 2_000);
    await advance(t, ROUND_RECHECK_MS);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    // The guess phase's own watcher looks 10 s after the drawing came in, and again 5 s later
    await advance(t, 3_000);
    expect((await stepDoc(t, step._id)).status).toBe("active");
    await advance(t, ROUND_RECHECK_MS);
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", timedOut: true });
  });

  test("a drawing that arrives after its step was closed is dropped without an error", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");
    await goAway(t, hostId);
    await advance(t, ROUND_CHECK_MS);
    await advance(t, ROUND_RECHECK_MS);

    // Both clients show anything this mutation throws as an alert
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId, outputDrawingUrl: PNG });

    const late = await stepDoc(t, step._id);
    expect(late.timedOut).toBe(true);
    expect(late.outputDrawingUrl).toBeUndefined();
    expect((await chatOf(t, roomId)).filter((m) => m.kind === "drawing")).toEqual([]);
    expect((await stepsOf(t, sessionId)).filter((s) => s.stepType === "guess")).toEqual([]);
    expect(await myStep(t, ann)).toMatchObject({ stepType: "draw", round: 2 });
  });

  test("timing out a drawer clears the 'drawing' indicator a locked phone left behind", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    await start(t, roomId, hostId);
    await t.mutation(api.participants.setTypingAction, {
      participantId: hostId,
      action: "drawing",
      drawingStartedAt: Date.now(),
    });
    await goAway(t, hostId);

    await advance(t, ROUND_CHECK_MS);
    expect((await participantDoc(t, hostId)).typingAction).toBe("drawing");
    await advance(t, ROUND_RECHECK_MS);
    const host = await participantDoc(t, hostId);
    expect(host.typingAction).toBeUndefined();
    expect(host.drawingStartedAt).toBeUndefined();
  });

  test("a game in which nobody answers ends as cancelled, not as a finished level", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await goAway(t, hostId, ann);

    for (let round = 1; round <= 9; round++) await pass(t, ABSENT_MS);
    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({ currentRound: 10, phase: "drawing" });
    await pass(t, ABSENT_MS);

    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true, completedAt: Date.now() });
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1", "game_cancelled:Lost in Translation"]);
    const steps = await stepsOf(t, sessionId);
    expect(steps).toHaveLength(10);
    expect(steps.every((s) => s.stepType === "draw" && s.status === "submitted" && s.timedOut === true)).toBe(true);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
  });

  test("a game that runs out after some answered rounds posts a summary of those rounds only", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);
    await guess(t, ann, "right");
    await goAway(t, hostId, ann);

    for (let round = 2; round <= 10; round++) await pass(t, ABSENT_MS);

    const session = await sessionDoc(t, sessionId);
    expect(session.status).toBe("complete");
    expect(session.cancelled).toBeUndefined();
    const [summary, ...more] = await summariesIn(t, roomId);
    expect(more).toEqual([]);
    expect(summary.rounds).toEqual([{ round: 1, prompt: chain.originalPrompt, results: { [ann]: true } }]);
    expect(summary.totals).toEqual({ [hostId]: { correct: 0, total: 0 }, [ann]: { correct: 1, total: 1 } });
    expect(await gameRecords(t, roomId)).not.toContain("game_cancelled:Lost in Translation");
  });

  test("a game left running when its room is closed ends itself as cancelled", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await t.mutation(api.rooms.closeRoom, { roomId });

    for (let round = 1; round <= 10; round++) await pass(t, ABSENT_MS);
    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true });
  });
});

describe("a whole game", () => {
  /**
   * Host and Ann play all ten rounds of a level-2 game. The host draws the odd rounds and Ann the even ones.
   * Ann guesses right every time; the host guesses right in rounds 2 and 4 only.
   */
  async function playTenRounds(t: Backend) {
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId, { level: 2 });
    for (let round = 1; round <= 10; round++) {
      const [drawer, guesser] = round % 2 === 1 ? [hostId, ann] : [ann, hostId];
      await draw(t, drawer);
      await guess(t, guesser, guesser === ann || round <= 4 ? "right" : "wrong");
    }
    return { roomId, hostId, ann, sessionId };
  }

  test("after the tenth round the session is complete and no client has a game or a step left", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, sessionId } = await playTenRounds(t);

    const session = await sessionDoc(t, sessionId);
    expect(session).toMatchObject({ status: "complete", completedAt: Date.now() });
    expect(session.cancelled).toBeUndefined();
    expect((await chainsOf(t, sessionId)).every((c) => c.status === "complete")).toBe(true);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getGameStatus, { roomId })).toBeNull();
    expect(await myStep(t, hostId)).toBeNull();
    expect(await myStep(t, ann)).toBeNull();
    expect(await t.query(api.games.getLatestGameSession, { roomId })).toMatchObject({ _id: sessionId, status: "complete" });
  });

  test("the chat ends up with every drawing and one summary that scores each guess", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, sessionId } = await playTenRounds(t);
    const chains = await chainsOf(t, sessionId);

    const chat = await chatOf(t, roomId);
    const drawings = chat.filter((m) => m.kind === "drawing");
    expect(drawings.map((m) => m.senderId)).toEqual([hostId, ann, hostId, ann, hostId, ann, hostId, ann, hostId, ann]);
    expect(drawings.every((m) => m.mediaUrl === PNG)).toBe(true);
    expect(chat[chat.length - 1]).toMatchObject({ kind: "system", status: "processed", senderId: hostId });
    expect(chat[chat.length - 1].text).toMatch(/^game_summary:/);

    const [summary, ...more] = await summariesIn(t, roomId);
    expect(more).toEqual([]);
    expect(summary).toMatchObject({ gameType: "Lost in Translation", level: 2 });
    expect(summary.cancelled).toBeUndefined();
    expect(summary.players).toEqual({
      [hostId]: { name: "Host", avatar: "default" },
      [ann]: { name: "Ann", avatar: "fox" },
    });
    expect(summary.rounds.map((r) => r.round)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(summary.rounds.map((r) => r.prompt)).toEqual(chains.map((c) => c.originalPrompt));
    expect(summary.rounds[0].results).toEqual({ [ann]: true });
    expect(summary.rounds[3].results).toEqual({ [hostId]: true });
    expect(summary.rounds[5].results).toEqual({ [hostId]: false });
    expect(summary.totals).toEqual({ [hostId]: { correct: 2, total: 5 }, [ann]: { correct: 5, total: 5 } });
  });

  test("the replay of a finished game has every round's drawing and guess, the scores, the names and the translations", async () => {
    const t = newBackend();
    const { hostId, ann, sessionId } = await playTenRounds(t);

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.session).toMatchObject({ _id: sessionId, status: "complete" });
    expect(replay!.chains.map((c) => c.chainIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const chain of replay!.chains) {
      expect(chain.steps.map((s) => s.stepType)).toEqual(["draw", "guess"]);
      expect(chain.steps[0]).toMatchObject({ assignedParticipantId: chain.drawerParticipantId, outputDrawingUrl: PNG });
      for (const option of chain.options ?? []) expect(replay!.promptTranslations[option]).toBeTruthy();
    }
    expect(replay!.scores).toEqual({ [hostId]: { correct: 2, total: 5 }, [ann]: { correct: 5, total: 5 } });
    expect(replay!.participants).toEqual({
      [hostId]: { nickname: "Host", avatar: { type: "preset", value: "default" } },
      [ann]: { nickname: "Ann", avatar: { type: "preset", value: "fox" } },
    });
  });

  test("the watchers left over from a finished game change nothing", async () => {
    const t = newBackend();
    const { roomId, sessionId } = await playTenRounds(t);
    const before = { session: await sessionDoc(t, sessionId), steps: await stepsOf(t, sessionId), chat: await chatOf(t, roomId) };

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await sessionDoc(t, sessionId)).toEqual(before.session);
    expect(await stepsOf(t, sessionId)).toEqual(before.steps);
    expect(await chatOf(t, roomId)).toEqual(before.chat);
  });

  // A kicked participant is deleted, and the session still lists the id
  test.each(["runs to its end", "is cancelled"])(
    "a game that %s after a player was kicked keeps answering its polls and posts its summary, with the kicked player's score and no name",
    async (ending) => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
      const sessionId = await start(t, roomId, hostId);
      await draw(t, hostId);
      await guess(t, ann, "right");
      await guess(t, ben, "wrong");
      await t.mutation(api.participants.kickParticipant, { participantId: ben, roomId });

      // What the room polls, and what the kicked player's own tab still polls
      const status = await t.query(api.games.getGameStatus, { roomId });
      expect(status!.scores[ben]).toMatchObject({ correct: 0, total: 1 });
      expect(await myStep(t, ben)).toBeNull();

      if (ending === "is cancelled") {
        await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
      } else {
        await goAway(t, hostId, ann);
        for (let round = 2; round <= 10; round++) await pass(t, ABSENT_MS);
      }
      expect((await sessionDoc(t, sessionId)).status).toBe("complete");
      const [summary, ...more] = await summariesIn(t, roomId);
      expect(more).toEqual([]);
      expect(Object.keys(summary.players).sort()).toEqual([hostId, ann].sort());
      expect(summary.totals[ben]).toEqual({ correct: 0, total: 1 });

      const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
      expect(Object.keys(replay!.participants).sort()).toEqual([hostId, ann].sort());
      expect(replay!.scores[ben]).toEqual({ correct: 0, total: 1 });
    }
  );
});

describe("cancelGame", () => {
  test("a guest cannot cancel the game", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);

    await expect(t.mutation(api.games.cancelGame, { roomId, participantId: ann })).rejects.toThrow(
      /Only the host can cancel a game/
    );
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
  });

  test("cancelling before anyone has guessed ends the game, closes what was open and posts a cancellation", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    const open = await openStep(t, ann, "guess");

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true, completedAt: Date.now() });
    expect((await chainsOf(t, sessionId)).every((c) => c.status === "complete")).toBe(true);
    expect(await stepDoc(t, open._id)).toMatchObject({ status: "submitted", timedOut: true });
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1", "game_cancelled:Lost in Translation"]);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
    expect(await myStep(t, ann)).toBeNull();
  });

  test("cancelling after answered rounds posts their summary, marked cancelled, and an unanswered guess is not a wrong one", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    const chains = await chainsOf(t, sessionId);
    await draw(t, hostId);
    await guess(t, ann, "right");
    await guess(t, ben, "wrong");
    await draw(t, ann);
    await guess(t, hostId, "right");
    // Ben has not answered round 2

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    const [summary, ...more] = await summariesIn(t, roomId);
    expect(more).toEqual([]);
    expect(summary).toMatchObject({ gameType: "Lost in Translation", level: 1, cancelled: true });
    expect(summary.rounds).toEqual([
      { round: 1, prompt: chains[0].originalPrompt, results: { [ann]: true, [ben]: false } },
      { round: 2, prompt: chains[1].originalPrompt, results: { [hostId]: true } },
    ]);
    expect(summary.totals).toEqual({
      [hostId]: { correct: 1, total: 1 },
      [ann]: { correct: 1, total: 1 },
      [ben]: { correct: 0, total: 1 },
    });
    expect(await gameRecords(t, roomId)).not.toContain("game_cancelled:Lost in Translation");
  });

  // Both clients call Cancel before every Start, to clear a game that may be lingering
  test("cancelling when no game is running, or a second time, changes nothing and posts nothing", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    expect(await gameRecords(t, roomId)).toEqual([]);

    const sessionId = await start(t, roomId, hostId);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    const cancelled = await sessionDoc(t, sessionId);
    await advance(t, 1_000);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    expect(await sessionDoc(t, sessionId)).toEqual(cancelled);
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1", "game_cancelled:Lost in Translation"]);
  });

  test("after a cancel a late drawing is dropped and the round's watcher does nothing", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    const records = await gameRecords(t, roomId);

    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId, outputDrawingUrl: PNG });
    await advance(t, ROUND_CHECK_MS);
    await advance(t, ROUND_RECHECK_MS);

    expect(await stepsOf(t, sessionId)).toHaveLength(1);
    expect((await stepDoc(t, step._id)).outputDrawingUrl).toBeUndefined();
    expect((await chatOf(t, roomId)).filter((m) => m.kind === "drawing")).toEqual([]);
    expect(await gameRecords(t, roomId)).toEqual(records);
  });

  test("a new game can start after a cancel and is then the latest session", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const first = await start(t, roomId, hostId);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    await advance(t, 1_000);

    const second = await start(t, roomId, hostId, { level: 2 });
    expect(second).not.toBe(first);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toMatchObject({ _id: second, level: 2 });
    expect(await t.query(api.games.getLatestGameSession, { roomId })).toMatchObject({ _id: second, status: "active" });
  });
});

describe("the queries clients poll", () => {
  test("with no game they all answer null", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);

    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getLatestGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getGameStatus, { roomId })).toBeNull();
    expect(await myStep(t, hostId)).toBeNull();
  });

  test("the drawer's step carries the prompt, the round and the session's settings, and nobody else has a step yet", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId, { level: 2, timerEnabled: 45 });
    const [chain] = await chainsOf(t, sessionId);

    expect(await myStep(t, hostId)).toMatchObject({
      gameSessionId: sessionId,
      stepType: "draw",
      status: "active",
      inputText: chain.originalPrompt,
      round: 1,
      totalRounds: 10,
      level: 2,
      timerEnabled: 45,
      chainMaxSteps: 2,
    });
    expect(await myStep(t, ann)).toBeNull();
  });

  test("a guesser's step carries the drawing and the round's four options", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);
    await draw(t, hostId);

    const step = await myStep(t, ann);
    expect(step).toMatchObject({ stepType: "guess", status: "active", inputDrawingUrl: PNG, round: 1, totalRounds: 10 });
    expect(step!.options).toEqual(chain.options);
    expect(step!.inputText).toBeUndefined();
  });

  // Both clients ask for the replay only once the session is complete, but the query answers for a running one too
  test("the replay of a running game leaves out the round still being guessed", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect((replay?.chains ?? []).filter((c) => c.status !== "complete").map((c) => c.originalPrompt)).toEqual([]);
  });

  test("the replay of a running game still decodes, gains each round as its last guess comes in, and is whole once the game is cancelled", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const chains = await chainsOf(t, sessionId);
    await draw(t, hostId);

    // Round 1 is being guessed. The body has every field the app's replay decoder requires, and no round
    const running = await post(t, "/api/games/replay", { gameSessionId: sessionId });
    expect(running.status).toBe(200);
    expect(running.body).toMatchObject({ session: { _id: sessionId, status: "active" }, chains: [] });
    expect(Object.keys(running.body)).toEqual(
      expect.arrayContaining(["chains", "participants", "promptTranslations", "scores", "session"])
    );

    await guess(t, ann, "right");
    await draw(t, ann);
    // Round 1 is over, round 2 is being guessed
    let replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.chains.map((c) => c.originalPrompt)).toEqual([chains[0].originalPrompt]);

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    // A finished game shows every round that was drawn, the one that was cut short included
    replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.chains.map((c) => c.originalPrompt)).toEqual([chains[0].originalPrompt, chains[1].originalPrompt]);
  });

  // The rule looks at the session, so a game that ended without its rounds being closed keeps its replay
  test("the replay of a finished game shows a drawn round whatever state the round itself was left in", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const chains = await chainsOf(t, sessionId);
    await draw(t, hostId);
    await t.run(async (ctx) => await ctx.db.patch(sessionId, { status: "complete", completedAt: Date.now() }));

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.chains.map((c) => [c.originalPrompt, c.status])).toEqual([[chains[0].originalPrompt, "active"]]);
  });

  // The translations cover every round's options, the rounds to come included, so they must not single out a prompt
  test("the replay of a running game translates every option on offer and nothing that tells the prompts apart", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    await draw(t, hostId);

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    // All 40 words of the bank are on offer in some round, each with its translation, in the order of their texts
    expect(Object.entries(replay!.promptTranslations)).toEqual(prompts.map((p) => [p.text, p.ja]));
    expect(replay!.chains).toEqual([]);
  });

  test("a Japanese-speaking player gets the prompt, its hint and the options in Japanese", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, []);
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja" });
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    const chains = await chainsOf(t, sessionId);

    // The English-speaking host draws round 1 from the English prompt
    expect((await openStep(t, hostId, "draw")).inputText).toBe(chains[0].originalPrompt);
    await draw(t, hostId);
    const guessStep = await openStep(t, yuki, "guess");
    expect(guessStep.options).toHaveLength(4);
    expect(guessStep.options!.every((o) => /^言葉\d{3}$/.test(o))).toBe(true);
    await guess(t, yuki, "right");

    const prompt = prompts.find((p) => p.text === chains[1].originalPrompt)!;
    expect(await openStep(t, yuki, "draw")).toMatchObject({ inputText: prompt.ja, hintText: prompt.hintJa });
  });

  test("the draw timer is reported in seconds, whether the session holds a number, nothing, or an old true or false", async () => {
    const cases: Array<[number | boolean | undefined, number]> = [[undefined, 20], [45, 45], [0, 0], [true, 20], [false, 0]];
    for (const [timerEnabled, seconds] of cases) {
      const t = newBackend();
      const { roomId, hostId } = await room(t);
      await start(t, roomId, hostId, { timerEnabled });

      expect((await myStep(t, hostId))!.timerEnabled, `step, ${timerEnabled}`).toBe(seconds);
      expect((await t.query(api.games.getGameStatus, { roomId }))!.timerSeconds, `status, ${timerEnabled}`).toBe(seconds);
    }
  });

  test("while someone draws, the status names the drawer, the round and when the drawing began", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await start(t, roomId, hostId, { level: 3 });
    const step = await openStep(t, hostId, "draw");

    const status = await t.query(api.games.getGameStatus, { roomId });
    expect(status).toMatchObject({
      gameType: "lost-in-translation",
      level: 3,
      currentRound: 1,
      totalRounds: 10,
      phase: "drawing",
      drawerName: "Host",
      drawerAvatar: { type: "preset", value: "default" },
      guessesSubmitted: 0,
      guessesTotal: 0,
      timerSeconds: 20,
      drawStartedAt: step.createdAt,
    });
    expect(Object.keys(status!.scores).sort()).toEqual([hostId, ann, ben].sort());
    expect(status!.scores[ann]).toEqual({ correct: 0, total: 0, nickname: "Ann", avatar: { type: "preset", value: "fox" } });
  });

  test("while the others guess, the status counts the guesses in and keeps the scores", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    await start(t, roomId, hostId);
    await draw(t, hostId);

    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({
      currentRound: 1,
      phase: "guessing",
      drawerName: "Host",
      guessesSubmitted: 0,
      guessesTotal: 2,
      drawStartedAt: null,
    });

    await guess(t, ann, "right");
    let status = await t.query(api.games.getGameStatus, { roomId });
    expect(status).toMatchObject({ phase: "guessing", guessesSubmitted: 1, guessesTotal: 2 });
    expect(status!.scores[ann]).toMatchObject({ correct: 1, total: 1 });

    await guess(t, ben, "wrong");
    status = await t.query(api.games.getGameStatus, { roomId });
    expect(status).toMatchObject({ currentRound: 2, phase: "drawing", drawerName: "Ann" });
    expect(status!.scores[ben]).toMatchObject({ correct: 0, total: 1 });
    expect(status!.scores[hostId]).toMatchObject({ correct: 0, total: 0 });
  });

  test("the replay holds only rounds that were drawn, and leaves out a guess the server closed", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    await guess(t, ann, "right");
    await goAway(t, ben);
    await pass(t, ABSENT_MS, [hostId, ann]);
    // Round 2 is open now: Ann has it to draw

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.chains).toHaveLength(1);
    expect(replay!.chains[0].steps.map((s) => [s.stepType, s.assignedParticipantId])).toEqual([
      ["draw", hostId],
      ["guess", ann],
    ]);
    expect(replay!.scores).toEqual({
      [hostId]: { correct: 0, total: 0 },
      [ann]: { correct: 1, total: 1 },
      [ben]: { correct: 0, total: 0 },
    });
  });

  // Every game the host app starts is played from its own word bank, which the built-in translations do not cover
  test("the replay of a game played from a word bank carries that bank's translations of the options", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { customPrompts: prompts });
    await draw(t, hostId);
    await guess(t, ann, "right");
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    const [chain] = replay!.chains;
    expect(chain.options).toHaveLength(4);
    for (const option of chain.options!) {
      expect(replay!.promptTranslations[option]).toBe(prompts.find((p) => p.text === option)!.ja);
    }
  });
});

// ─── Hiding the answer ───────────────────────────────────────────────────────
// LOST_IN_TRANSLATION_HIDE_ANSWER is off unless it is "on": installed host apps read `correctOption` off the open
// step to mark the pick. The answer to a guess comes back from the submit in both modes.

describe("hiding the answer", () => {
  const HOST_TOKEN = tokenFor(1);
  const ANN_TOKEN = tokenFor(2);
  const BEN_TOKEN = tokenFor(3);
  const SWITCH = "LOST_IN_TRANSLATION_HIDE_ANSWER";
  const NO_STEP = { status: 200, body: { ok: true } };

  /** A room whose host, Ann and Ben all registered a token, as current builds do. The host draws round 1 */
  async function tokenGame(t: Backend, extra: StartExtras = {}) {
    const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
    const ann = await joinGuest(t, roomId, "Ann", { token: ANN_TOKEN });
    const ben = await joinGuest(t, roomId, "Ben", { token: BEN_TOKEN, avatar: "cat" });
    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN, ...extra });
    const [chain] = await chainsOf(t, sessionId);
    const right = chain.originalPrompt;
    const wrong = chain.options!.find((o) => o !== right)!;
    return { roomId, hostId, ann, ben, sessionId, chain, right, wrong };
  }

  /** The same, with the host's drawing in: Ann and Ben each hold an open guess */
  async function guessing(t: Backend, extra: StartExtras = {}) {
    const game = await tokenGame(t, extra);
    await sendDrawing(t, game.hostId, HOST_TOKEN);
    return game;
  }

  /** The player's open step as their own client is sent it: asked for with their token, which works in both modes */
  async function stepFor(t: Backend, participantId: PID, token: string | undefined, type: "draw" | "guess") {
    const step = await t.query(api.games.getMyActiveStep, { participantId, token });
    if (!step || step.stepType !== type) throw new Error(`Expected an open ${type} step, found ${step?.stepType ?? "none"}`);
    return step;
  }

  async function sendDrawing(t: Backend, participantId: PID, token?: string) {
    const step = await stepFor(t, participantId, token, "draw");
    await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId, outputDrawingUrl: PNG, token });
  }

  /** Sends the player's pick for their open guess, and returns what the submit answers */
  async function answer(t: Backend, participantId: PID, selectedOption: string, token?: string) {
    const step = await stepFor(t, participantId, token, "guess");
    return await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId, selectedOption, token });
  }

  /** A player's open step as the database holds it: what someone who is not that player has to go by with the switch on */
  async function storedStep(t: Backend, sessionId: SessionId, participantId: PID) {
    const step = (await stepsOf(t, sessionId)).find((s) => s.assignedParticipantId === participantId && s.status === "active");
    if (!step) throw new Error("No open step");
    return step;
  }

  // ── What the step says ──

  test.each([undefined, "", "off", "true"])(
    "with the switch %j, a step is sent to anyone who asks, and names the option that is right",
    async (value) => {
      if (value !== undefined) vi.stubEnv(SWITCH, value);
      const t = newBackend();
      const { hostId, ann, sessionId, chain, right } = await tokenGame(t, { level: 2, timerEnabled: 45 });
      const settings = { chainMaxSteps: 3, level: 2, round: 1, totalRounds: 10, timerEnabled: 45 };

      // The drawer's step, asked for with no token, with somebody else's and with the drawer's: the token is not looked at
      const drawStep = await storedStep(t, sessionId, hostId);
      const expectedDraw = { ...drawStep, ...settings, inputText: right, options: chain.options, correctOption: right };
      for (const token of [undefined, ANN_TOKEN, HOST_TOKEN, "x"]) {
        expect(await t.query(api.games.getMyActiveStep, { participantId: hostId, token })).toStrictEqual(expectedDraw);
        expect(await post(t, "/api/games/my-active-step", { participantId: hostId, callerToken: token })).toStrictEqual({
          status: 200,
          body: expectedDraw,
        });
      }

      await sendDrawing(t, hostId, HOST_TOKEN);
      const guessStep = await storedStep(t, sessionId, ann);
      const expectedGuess = { ...guessStep, ...settings, options: chain.options, correctOption: right };
      for (const token of [undefined, HOST_TOKEN, ANN_TOKEN]) {
        expect(await t.query(api.games.getMyActiveStep, { participantId: ann, token })).toStrictEqual(expectedGuess);
        expect((await post(t, "/api/games/my-active-step", { participantId: ann, callerToken: token })).body).toStrictEqual(expectedGuess);
      }
    }
  );

  // Installed clients compare the tapped option with correctOption, and a Japanese-speaking player's options are Japanese
  test("with the switch unset, a Japanese-speaking player's step names the right option in Japanese", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja", token: ANN_TOKEN });
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN, customPrompts: prompts });
    const [chain] = await chainsOf(t, sessionId);
    const ja = prompts.find((p) => p.text === chain.originalPrompt)!.ja;
    await sendDrawing(t, hostId, HOST_TOKEN);

    const step = await openStep(t, yuki, "guess");
    expect(step.options).toContain(ja);
    expect(step.correctOption).toBe(ja);
  });

  // A participant id is on every guest's screen, so "my" step can be asked for by anyone. A drawing step carries
  // the prompt, and any step the id its answer is sent with
  test("with the switch on, a step is sent only to a caller with its player's token: anyone else is told there is none", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { hostId, ann, ben } = await tokenGame(t);
    consoleWarn.mockClear();

    expect(await t.query(api.games.getMyActiveStep, { participantId: hostId, token: HOST_TOKEN })).toMatchObject({ stepType: "draw" });
    // No token, another player's, and one that is not a token at all
    for (const token of [undefined, ANN_TOKEN, "x"]) {
      expect(await t.query(api.games.getMyActiveStep, { participantId: hostId, token })).toBeNull();
      expect(await post(t, "/api/games/my-active-step", { participantId: hostId, callerToken: token })).toEqual(NO_STEP);
    }

    await sendDrawing(t, hostId, HOST_TOKEN);
    expect(await t.query(api.games.getMyActiveStep, { participantId: ann, token: ANN_TOKEN })).toMatchObject({ stepType: "guess" });
    for (const token of [undefined, HOST_TOKEN, BEN_TOKEN, "x"]) {
      expect(await t.query(api.games.getMyActiveStep, { participantId: ann, token })).toBeNull();
      expect(await post(t, "/api/games/my-active-step", { participantId: ann, callerToken: token })).toEqual(NO_STEP);
    }
    // Ben's own token gets Ben's step, and no other
    expect(await t.query(api.games.getMyActiveStep, { participantId: ben, token: BEN_TOKEN })).toMatchObject({
      stepType: "guess",
      assignedParticipantId: ben,
    });
    // Held back in silence: the query is polled, and each of these would be a log line every 1.5 s
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  test("with the switch on, the step its player is sent does not say which option is right, and is otherwise whole", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { hostId, ann, sessionId, chain, right } = await tokenGame(t, { level: 2, timerEnabled: 45 });
    const settings = { chainMaxSteps: 3, level: 2, round: 1, totalRounds: 10, timerEnabled: 45 };

    // The drawer is still given the prompt, as the text to draw
    const expectedDraw = { ...(await storedStep(t, sessionId, hostId)), ...settings, inputText: right, options: chain.options };
    const drawStep = await t.query(api.games.getMyActiveStep, { participantId: hostId, token: HOST_TOKEN });
    expect(drawStep).not.toHaveProperty("correctOption");
    expect(drawStep).toStrictEqual(expectedDraw);
    expect(await post(t, "/api/games/my-active-step", { participantId: hostId, callerToken: HOST_TOKEN })).toStrictEqual({
      status: 200,
      body: expectedDraw,
    });

    await sendDrawing(t, hostId, HOST_TOKEN);
    const expectedGuess = { ...(await storedStep(t, sessionId, ann)), ...settings, options: chain.options };
    const guessStep = await t.query(api.games.getMyActiveStep, { participantId: ann, token: ANN_TOKEN });
    expect(guessStep).not.toHaveProperty("correctOption");
    expect(guessStep).not.toHaveProperty("inputText");
    expect(guessStep).toStrictEqual(expectedGuess);
    const overRoute = await post(t, "/api/games/my-active-step", { participantId: ann, callerId: ann, callerToken: ANN_TOKEN });
    expect(overRoute.body).not.toHaveProperty("correctOption");
    expect(overRoute).toStrictEqual({ status: 200, body: expectedGuess });
  });

  test("with the switch on, a Japanese-speaking player's steps are still in Japanese", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja", token: ANN_TOKEN });
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN, customPrompts: prompts });
    const chains = await chainsOf(t, sessionId);
    const jaOf = (text: string) => prompts.find((p) => p.text === text)!.ja;
    await sendDrawing(t, hostId, HOST_TOKEN);

    const guessStep = await stepFor(t, yuki, ANN_TOKEN, "guess");
    expect(guessStep.options).toEqual(chains[0].options!.map(jaOf));
    expect(guessStep).not.toHaveProperty("correctOption");
    await answer(t, yuki, jaOf(chains[0].originalPrompt), ANN_TOKEN);

    const prompt = prompts.find((p) => p.text === chains[1].originalPrompt)!;
    const drawStep = await stepFor(t, yuki, ANN_TOKEN, "draw");
    expect(drawStep).toMatchObject({ inputText: prompt.ja, hintText: prompt.hintJa });
    expect(drawStep).not.toHaveProperty("correctOption");
    expect(await myStep(t, yuki)).toBeNull();
  });

  // A participant made by a build from before tokens, or by a browser that blocks storage, has no token to show
  test("with the switch on, a player from before tokens is still sent their step without one", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const [chain] = await chainsOf(t, sessionId);

    const drawStep = await myStep(t, hostId);
    expect(drawStep).toMatchObject({ stepType: "draw", inputText: chain.originalPrompt });
    expect(drawStep).not.toHaveProperty("correctOption");
    expect((await post(t, "/api/games/my-active-step", { participantId: hostId })).body).toStrictEqual(drawStep);
    // A token sent for a participant with none on record changes nothing
    expect(await t.query(api.games.getMyActiveStep, { participantId: hostId, token: ANN_TOKEN })).toStrictEqual(drawStep);

    await draw(t, hostId);
    const guessStep = await myStep(t, ann);
    expect(guessStep).toMatchObject({ stepType: "guess", options: chain.options });
    expect(guessStep).not.toHaveProperty("correctOption");
    expect((await post(t, "/api/games/my-active-step", { participantId: ann })).body).toStrictEqual(guessStep);
  });

  test.each([undefined, "enforce"])(
    "with the switch on and AUTH_MODE %j, the step route reads the token from callerToken and never refuses the poll",
    async (mode) => {
      vi.stubEnv(SWITCH, "on");
      const t = newBackend();
      const { hostId, right } = await tokenGame(t);
      if (mode) vi.stubEnv("AUTH_MODE", mode);

      const proved = await post(t, "/api/games/my-active-step", { participantId: hostId, callerId: hostId, callerToken: HOST_TOKEN });
      expect(proved.status).toBe(200);
      expect(proved.body).toMatchObject({ stepType: "draw", inputText: right });

      // None, another player's, and values that are not a string: each is a 200 whose body is no step
      for (const callerToken of [undefined, ANN_TOKEN, "", 7, null, { $ne: "" }]) {
        expect(await post(t, "/api/games/my-active-step", { participantId: hostId, callerToken })).toEqual(NO_STEP);
      }
      // The token is not read from `token`, which on the routes is never the caller's
      expect(await post(t, "/api/games/my-active-step", { participantId: hostId, token: HOST_TOKEN })).toEqual(NO_STEP);
    }
  );

  // Every read a client can make without the token of the player it asks about, for every participant id in the
  // room. If any of it depended on which of the round's four options is the prompt, it would differ when the
  // prompt is swapped for another option.
  test("with the switch on, nothing a guesser can read before answering depends on which option is the prompt", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, ben, sessionId, chain } = await tokenGame(t, { customPrompts: bank(40) });
    vi.stubEnv(SWITCH, "on");

    async function everythingReadable(): Promise<string> {
      const seen: unknown[] = [];
      for (const participantId of [hostId, ann, ben]) {
        seen.push(await t.query(api.games.getMyActiveStep, { participantId }));
        seen.push((await post(t, "/api/games/my-active-step", { participantId })).body);
        // A guesser's own token is no help either: it gets her own open guess, and nobody else's step
        seen.push(await t.query(api.games.getMyActiveStep, { participantId, token: ANN_TOKEN }));
        seen.push((await post(t, "/api/games/my-active-step", { participantId, callerToken: ANN_TOKEN })).body);
      }
      seen.push(await t.query(api.games.getActiveGameSession, { roomId }));
      seen.push(await t.query(api.games.getLatestGameSession, { roomId }));
      seen.push(await t.query(api.games.getGameStatus, { roomId }));
      seen.push(await t.query(api.games.getGameReplay, { gameSessionId: sessionId }));
      seen.push((await chatOf(t, roomId)).map((m) => [m.kind, m.text, m.mediaUrl]));
      return JSON.stringify(seen);
    }

    /** Makes another of the round's options its prompt, as if the deal had gone that way */
    async function dealAsPrompt(option: string) {
      await t.run(async (ctx) => {
        await ctx.db.patch(chain._id, { originalPrompt: option });
        const drawStep = (await ctx.db.query("gameSteps").withIndex("by_chainId", (q) => q.eq("chainId", chain._id)).collect())
          .find((s) => s.stepType === "draw")!;
        await ctx.db.patch(drawStep._id, { inputText: option });
      });
    }

    for (const phase of ["drawing", "guessing"] as const) {
      if (phase === "guessing") await sendDrawing(t, hostId, HOST_TOKEN);
      const views = new Set<string>();
      for (const option of chain.options!) {
        await dealAsPrompt(option);
        views.add(await everythingReadable());
      }
      expect(views.size, phase).toBe(1);
      await dealAsPrompt(chain.originalPrompt);
    }
    // The guessing phase's reads are not empty: Ann's own open guess is among them
    expect(await everythingReadable()).toContain('"stepType":"guess"');
    // The check has teeth: with the switch off the same reads do tell the prompt apart
    vi.stubEnv(SWITCH, "off");
    const told = new Set<string>();
    for (const option of chain.options!) {
      await dealAsPrompt(option);
      told.add(await everythingReadable());
    }
    expect(told.size).toBe(4);
  });

  // ── What the submit answers ──

  test.each([undefined, "on"])(
    "with the switch %j, a guess is answered with whether it was right, which option was, and the pick on record",
    async (value) => {
      if (value !== undefined) vi.stubEnv(SWITCH, value);
      const t = newBackend();
      const { ann, ben, sessionId, right, wrong } = await guessing(t);

      expect(await answer(t, ann, right, ANN_TOKEN)).toStrictEqual({ correct: true, correctOption: right, selectedOption: right });
      // The last guess of the round, which also starts the next one
      expect(await answer(t, ben, wrong, BEN_TOKEN)).toStrictEqual({ correct: false, correctOption: right, selectedOption: wrong });
      expect(await storedStep(t, sessionId, ann)).toMatchObject({ stepType: "draw", stepIndex: 0 });
    }
  );

  // The host app sends its pick as outputText too, and the pick the server keeps is what the answer carries
  test("the pick in the answer is the one the step holds: sent as outputText alone, or not at all", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { ann, ben, right } = await guessing(t);
    const annStep = await stepFor(t, ann, ANN_TOKEN, "guess");
    const benStep = await stepFor(t, ben, BEN_TOKEN, "guess");

    expect(
      await t.mutation(api.games.submitGameStep, { stepId: annStep._id, participantId: ann, outputText: right, token: ANN_TOKEN })
    ).toStrictEqual({ correct: true, correctOption: right, selectedOption: right });
    expect(await t.mutation(api.games.submitGameStep, { stepId: benStep._id, participantId: ben, token: BEN_TOKEN })).toStrictEqual({
      correct: false,
      correctOption: right,
    });
    expect((await stepDoc(t, benStep._id)).selectedOption).toBeUndefined();
  });

  test("the answer names the option in the language the player was shown: Japanese from the word bank, English beside it", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
    const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja", token: ANN_TOKEN });
    const aki = await joinGuest(t, roomId, "Aki", { language: "ja", token: BEN_TOKEN, avatar: "cat" });
    const eve = await joinGuest(t, roomId, "Eve", { token: tokenFor(4), avatar: "owl" });
    const prompts = bank(40);
    const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN, customPrompts: prompts });
    const [chain] = await chainsOf(t, sessionId);
    const ja = prompts.find((p) => p.text === chain.originalPrompt)!.ja;
    await sendDrawing(t, hostId, HOST_TOKEN);

    const shown = (await stepFor(t, yuki, ANN_TOKEN, "guess")).options!;
    expect(shown).toContain(ja);
    expect(await answer(t, yuki, ja, ANN_TOKEN)).toEqual({ correct: true, correctOption: ja, selectedOption: ja });
    const wrongJa = shown.find((o) => o !== ja)!;
    expect(await answer(t, aki, wrongJa, BEN_TOKEN)).toEqual({ correct: false, correctOption: ja, selectedOption: wrongJa });
    expect(await answer(t, eve, chain.originalPrompt, tokenFor(4))).toEqual({
      correct: true,
      correctOption: chain.originalPrompt,
      selectedOption: chain.originalPrompt,
    });
    // A repeat is worded for its player too
    const akiStep = (await stepsOf(t, sessionId)).find((s) => s.assignedParticipantId === aki)!;
    expect(
      await t.mutation(api.games.submitGameStep, { stepId: akiStep._id, participantId: aki, selectedOption: ja, token: BEN_TOKEN })
    ).toEqual({ correct: false, correctOption: ja, selectedOption: wrongJa });
  });

  test.each([undefined, "on"])(
    "with the switch %j and no word bank, the answer names the option in the built-in translation a Japanese-speaking player was shown",
    async (value) => {
      if (value !== undefined) vi.stubEnv(SWITCH, value);
      const t = newBackend();
      const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
      const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja", token: ANN_TOKEN });
      const ben = await joinGuest(t, roomId, "Ben", { token: BEN_TOKEN, avatar: "cat" });
      const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN });
      const [chain] = await chainsOf(t, sessionId);
      await sendDrawing(t, hostId, HOST_TOKEN);

      const shown = (await stepFor(t, yuki, ANN_TOKEN, "guess")).options!;
      const right = shown[chain.options!.indexOf(chain.originalPrompt)];
      expect(right).not.toBe(chain.originalPrompt);
      const wrong = shown.find((o) => o !== right)!;
      expect(await answer(t, yuki, wrong, ANN_TOKEN)).toEqual({ correct: false, correctOption: right, selectedOption: wrong });
      expect(await answer(t, ben, chain.originalPrompt, BEN_TOKEN)).toEqual({
        correct: true,
        correctOption: chain.originalPrompt,
        selectedOption: chain.originalPrompt,
      });
    }
  );

  // The reply to the first send can be lost. The host app sends again, and must be told the same thing. The web does
  // not resend (the Convex client carries a lost reply itself); there the repeat is a second tab of the same player
  test("sending an answered guess again with its player's token returns the first answer and the first pick, and changes nothing", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { ann, ben, sessionId, right, wrong } = await guessing(t);
    const step = await stepFor(t, ann, ANN_TOKEN, "guess");
    const first = await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, selectedOption: wrong, token: ANN_TOKEN });
    expect(first).toStrictEqual({ correct: false, correctOption: right, selectedOption: wrong });
    const stored = await stepDoc(t, step._id);

    // Again with the same pick, and with the right one: the pick on record stands
    for (const selectedOption of [wrong, right]) {
      const again = { stepId: step._id, participantId: ann, selectedOption, token: ANN_TOKEN };
      expect(await t.mutation(api.games.submitGameStep, again)).toStrictEqual(first);
      expect(await t.action(api.games.submitGameStepWithTranslation, again)).toStrictEqual(first);
    }
    expect(await stepDoc(t, step._id)).toStrictEqual(stored);

    // Also once the round is over and the next one is being drawn
    await answer(t, ben, right, BEN_TOKEN);
    expect((await chainsOf(t, sessionId))[0].status).toBe("complete");
    expect(
      await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: ann, selectedOption: right, token: ANN_TOKEN })
    ).toStrictEqual(first);
    expect(await stepDoc(t, step._id)).toStrictEqual(stored);
    expect((await stepsOf(t, sessionId)).filter((s) => s.stepType === "draw")).toHaveLength(2);
  });

  test("a drawing, a guess the deadline closed and a guess a cancel closed are answered with nothing", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { roomId, hostId, ann, ben, right } = await tokenGame(t);
    const drawStep = await stepFor(t, hostId, HOST_TOKEN, "draw");
    const drawArgs = { stepId: drawStep._id, participantId: hostId, outputDrawingUrl: PNG, token: HOST_TOKEN };
    expect(await t.mutation(api.games.submitGameStep, drawArgs)).toBeNull();
    // And sent again, once it is in
    expect(await t.mutation(api.games.submitGameStep, drawArgs)).toBeNull();
    expect(await t.action(api.games.submitGameStepWithTranslation, drawArgs)).toBeNull();

    const annStep = await stepFor(t, ann, ANN_TOKEN, "guess");
    await goAway(t, ann, ben);
    await pass(t, ABSENT_MS, [hostId]);
    expect(await stepDoc(t, annStep._id)).toMatchObject({ status: "submitted", timedOut: true });
    const late = { stepId: annStep._id, participantId: ann, selectedOption: right, token: ANN_TOKEN };
    expect(await t.mutation(api.games.submitGameStep, late)).toBeNull();
    expect(await t.action(api.games.submitGameStepWithTranslation, late)).toBeNull();
    expect(
      await post(t, "/api/games/submit-step", { stepId: annStep._id, participantId: ann, selectedOption: right, callerToken: ANN_TOKEN })
    ).toEqual({ status: 200, body: { ok: true } });
    expect(await stepDoc(t, annStep._id)).not.toHaveProperty("correct");

    // Round 2: Ann draws, the host's and Ben's guesses are open when the game is cancelled
    await beat(t, ann, ben);
    await sendDrawing(t, ann, ANN_TOKEN);
    const hostStep = await stepFor(t, hostId, HOST_TOKEN, "guess");
    const benStep = await stepFor(t, ben, BEN_TOKEN, "guess");
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId, token: HOST_TOKEN });
    for (const [stepId, participantId, token] of [[hostStep._id, hostId, HOST_TOKEN], [benStep._id, ben, BEN_TOKEN]] as const) {
      expect(await t.mutation(api.games.submitGameStep, { stepId, participantId, selectedOption: right, token })).toBeNull();
      expect(await stepDoc(t, stepId)).toMatchObject({ status: "submitted", timedOut: true });
    }
  });

  // A dev deployment sends a function's log lines back to whoever called it, with or without the player's token
  test("taking a guess logs neither the pick, nor whether it was right, nor the prompt", async () => {
    /** What the same forged guess logs in a fresh game, sent with the prompt or with another option */
    async function loggedFor(pick: "right" | "wrong"): Promise<string> {
      const t = newBackend();
      const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
      const yuki = await joinGuest(t, roomId, "Yuki", { language: "ja", token: ANN_TOKEN });
      const prompts = bank(40);
      const sessionId = await start(t, roomId, hostId, { token: HOST_TOKEN, customPrompts: prompts });
      const [chain] = await chainsOf(t, sessionId);
      const ja = prompts.find((p) => p.text === chain.originalPrompt)!.ja;
      // The deal is random: the prompt goes first in one game and last in the other, so a line that gives its place differs too
      const others = chain.options!.filter((o) => o !== chain.originalPrompt);
      const options = pick === "right" ? [chain.originalPrompt, ...others] : [...others, chain.originalPrompt];
      await t.run(async (ctx) => await ctx.db.patch(chain._id, { options }));
      await sendDrawing(t, hostId, HOST_TOKEN);
      const step = await storedStep(t, sessionId, yuki);
      const wrongJa = prompts.find((p) => p.text === others[0])!.ja;
      const consoleLog = vi.mocked(console.log);
      consoleLog.mockClear();
      consoleWarn.mockClear();

      // Sent without her token, as someone who only knows her ids would
      const selectedOption = pick === "right" ? ja : wrongJa;
      expect(await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: yuki, selectedOption })).toBeNull();
      expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", correct: pick === "right" });
      const logged = JSON.stringify([...consoleLog.mock.calls, ...consoleWarn.mock.calls]);
      expect(logged).toContain("[submitGameStep]");
      for (const told of [chain.originalPrompt, ja, wrongJa]) expect(logged).not.toContain(told);
      return logged;
    }
    // A right pick and a wrong one log the same lines, whatever the lines are called
    expect(await loggedFor("right")).toBe(await loggedFor("wrong"));
  });

  test("a whole game with the switch on and tokens enforced: every drawer gets the prompt, every guess its answer, and the summary agrees", async () => {
    const t = newBackend();
    const { roomId, hostId, ann, ben, sessionId } = await tokenGame(t, { customPrompts: bank(40) });
    vi.stubEnv(SWITCH, "on");
    vi.stubEnv("AUTH_MODE", "enforce");
    const players: Array<[PID, string]> = [[hostId, HOST_TOKEN], [ann, ANN_TOKEN], [ben, BEN_TOKEN]];
    const chains = await chainsOf(t, sessionId);
    const rightAnswers = new Map<PID, number>(players.map(([id]) => [id, 0]));

    for (const [round, chain] of chains.entries()) {
      const [drawer, drawerToken] = players[round % 3];
      const drawStep = await t.query(api.games.getMyActiveStep, { participantId: drawer, token: drawerToken });
      expect(drawStep).toMatchObject({ stepType: "draw", round: round + 1, inputText: chain.originalPrompt });
      expect(drawStep).not.toHaveProperty("correctOption");
      await t.mutation(api.games.submitGameStep, { stepId: drawStep!._id, participantId: drawer, outputDrawingUrl: PNG, token: drawerToken });

      for (const [i, [guesser, token]] of players.filter(([id]) => id !== drawer).entries()) {
        const step = await t.query(api.games.getMyActiveStep, { participantId: guesser, token });
        expect(step).toMatchObject({ stepType: "guess", round: round + 1 });
        expect(step).not.toHaveProperty("correctOption");
        const correct = (round + i) % 2 === 0;
        const selectedOption = correct ? chain.originalPrompt : step!.options!.find((o) => o !== chain.originalPrompt)!;
        const sent = { stepId: step!._id, participantId: guesser, selectedOption, token };
        const expected = { correct, correctOption: chain.originalPrompt, selectedOption };
        expect(await t.mutation(api.games.submitGameStep, sent)).toEqual(expected);
        if (correct) rightAnswers.set(guesser, rightAnswers.get(guesser)! + 1);
        // The reply can be lost on any guess, the one that ends the game included
        expect(await t.mutation(api.games.submitGameStep, sent)).toEqual(expected);
      }
    }

    expect((await sessionDoc(t, sessionId)).status).toBe("complete");
    const [summary] = await summariesIn(t, roomId);
    expect(summary.rounds).toHaveLength(10);
    for (const [id] of players) expect(summary.totals[id].correct).toBe(rightAnswers.get(id));
  });

  // ── Who is answered ──

  // The rule the step query and the submit's answer both go by. It is not AUTH_MODE's: that decides what a call may do
  test.each([undefined, "enforce"])(
    "with AUTH_MODE %j, a caller's proof is the participant's token, or that none is on record, and a kicked player has neither",
    async (mode) => {
      const t = newBackend();
      const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
      const old = await joinGuest(t, roomId, "Old");
      const ben = await joinGuest(t, roomId, "Ben", { token: BEN_TOKEN, avatar: "cat" });
      if (mode) vi.stubEnv("AUTH_MODE", mode);
      const proof = async (participantId: PID, token?: string) => await t.run(async (ctx) => await callerProof(ctx, participantId, token));
      consoleWarn.mockClear();

      expect(await proof(hostId, HOST_TOKEN)).toBe("token");
      for (const token of [undefined, BEN_TOKEN, "", "x"]) expect(await proof(hostId, token)).toBe("none");
      for (const token of [undefined, HOST_TOKEN, "x"]) expect(await proof(old, token)).toBe("legacy");
      // Never a refusal and never a log line: it is asked on every poll
      expect(consoleWarn).not.toHaveBeenCalled();

      // A kick deletes the secret with the participant. That is not a participant with none on record
      for (const participantId of [ben, old]) {
        await t.mutation(api.participants.kickParticipant, { roomId, participantId, callerId: hostId, token: HOST_TOKEN });
        for (const token of [undefined, BEN_TOKEN]) expect(await proof(participantId, token)).toBe("none");
      }
    }
  );

  // requireCaller lets these calls through unless AUTH_MODE is enforce. The answer is held back in both modes
  test.each([undefined, "on"])(
    "with the switch %j and AUTH_MODE unset, a guess sent in someone else's name is taken, but answered with nothing",
    async (value) => {
      if (value !== undefined) vi.stubEnv(SWITCH, value);
      const t = newBackend();
      const { ann, ben, sessionId, right, wrong } = await guessing(t);
      const annStep = await storedStep(t, sessionId, ann);
      const benStep = await storedStep(t, sessionId, ben);

      // Ben knows Ann's participant id and step id, but not her token
      expect(await t.mutation(api.games.submitGameStep, { stepId: annStep._id, participantId: ann, selectedOption: wrong })).toBeNull();
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/^auth: games\.submitGameStep no token/));
      expect(await stepDoc(t, annStep._id)).toMatchObject({ status: "submitted", correct: false, selectedOption: wrong });

      // Sending her answered guess again is no way in either: with no token, with his own, over the action or the route
      const resend = { stepId: annStep._id, participantId: ann, selectedOption: right };
      expect(await t.mutation(api.games.submitGameStep, resend)).toBeNull();
      expect(await t.mutation(api.games.submitGameStep, { ...resend, token: BEN_TOKEN })).toBeNull();
      expect(await t.action(api.games.submitGameStepWithTranslation, { ...resend, token: BEN_TOKEN })).toBeNull();
      expect(await post(t, "/api/games/submit-step", { ...resend, callerId: ben, callerToken: BEN_TOKEN })).toEqual({ status: 200, body: { ok: true } });
      expect(await post(t, "/api/games/submit-step", resend)).toEqual({ status: 200, body: { ok: true } });

      // Ann herself is told what the guess on record came to, and which pick it was
      expect(await t.mutation(api.games.submitGameStep, { ...resend, token: ANN_TOKEN })).toEqual({
        correct: false,
        correctOption: right,
        selectedOption: wrong,
      });
      // A first answer sent with the wrong token is taken and not answered either
      expect(
        await t.mutation(api.games.submitGameStep, { stepId: benStep._id, participantId: ben, selectedOption: right, token: ANN_TOKEN })
      ).toBeNull();
      expect(await stepDoc(t, benStep._id)).toMatchObject({ status: "submitted", correct: true });
    }
  );

  test("when enforced, a guess without its player's token is refused, and with it is answered", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { ann, right, wrong } = await guessing(t);
    vi.stubEnv("AUTH_MODE", "enforce");
    const step = await stepFor(t, ann, ANN_TOKEN, "guess");
    const args = { stepId: step._id, participantId: ann, selectedOption: wrong };

    await expect(t.mutation(api.games.submitGameStep, args)).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(api.games.submitGameStep, { ...args, token: BEN_TOKEN })).rejects.toThrow(/Not authorised/);
    expect((await stepDoc(t, step._id)).status).toBe("active");

    const first = { correct: false, correctOption: right, selectedOption: wrong };
    expect(await t.mutation(api.games.submitGameStep, { ...args, token: ANN_TOKEN })).toEqual(first);
    // Her answered guess cannot be read back by anyone else
    await expect(t.mutation(api.games.submitGameStep, args)).rejects.toThrow(/Not authorised/);
    await expect(t.mutation(api.games.submitGameStep, { ...args, token: BEN_TOKEN })).rejects.toThrow(/Not authorised/);
    expect(await t.mutation(api.games.submitGameStep, { ...args, token: ANN_TOKEN })).toEqual(first);
  });

  // With no token on record there is nothing to tell the player from anyone who knows their ids. The first call
  // takes the guess, so only one caller is ever answered; a repeat takes nothing and could be asked by everyone
  test.each([[undefined, undefined], [undefined, "on"], ["enforce", undefined], ["enforce", "on"]])(
    "with AUTH_MODE %j and the switch %j, a player from before tokens is answered when the guess is taken, and with nothing when it is sent again",
    async (mode, value) => {
      if (value !== undefined) vi.stubEnv(SWITCH, value);
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann] } = await room(t);
      const sessionId = await start(t, roomId, hostId);
      const [chain] = await chainsOf(t, sessionId);
      const right = chain.originalPrompt;
      await draw(t, hostId);
      if (mode) vi.stubEnv("AUTH_MODE", mode);
      const step = await openStep(t, ann, "guess");
      const args = { stepId: step._id, participantId: ann, selectedOption: right };

      expect(await t.mutation(api.games.submitGameStep, args)).toStrictEqual({ correct: true, correctOption: right, selectedOption: right });
      expect(await t.mutation(api.games.submitGameStep, args)).toBeNull();
      expect(await t.mutation(api.games.submitGameStep, { ...args, token: ANN_TOKEN })).toBeNull();
      expect(await t.action(api.games.submitGameStepWithTranslation, args)).toBeNull();
      expect(await post(t, "/api/games/submit-step", args)).toEqual({ status: 200, body: { ok: true } });
    }
  );

  // A kick deletes the participant and their secret, and leaves their open step behind
  test("a guess sent in the name of a kicked player is not answered, with or without the token they had", async () => {
    vi.stubEnv(SWITCH, "on");
    const t = newBackend();
    const { roomId, hostId, ben, sessionId, right } = await guessing(t);
    const step = await storedStep(t, sessionId, ben);
    await t.mutation(api.participants.kickParticipant, { roomId, participantId: ben, callerId: hostId, token: HOST_TOKEN });

    expect(await t.query(api.games.getMyActiveStep, { participantId: ben, token: BEN_TOKEN })).toBeNull();
    const args = { stepId: step._id, participantId: ben, selectedOption: right };
    expect(await t.mutation(api.games.submitGameStep, args)).toBeNull();
    expect(await stepDoc(t, step._id)).toMatchObject({ status: "submitted", correct: true });
    expect(await t.mutation(api.games.submitGameStep, args)).toBeNull();
    expect(await t.mutation(api.games.submitGameStep, { ...args, token: BEN_TOKEN })).toBeNull();
  });

  // ── Over the route the host app calls ──

  test.each([undefined, "on"])("with the switch %j, the submit route answers a guess with the result as its body", async (value) => {
    if (value !== undefined) vi.stubEnv(SWITCH, value);
    const t = newBackend();
    const { hostId, ann, ben, sessionId } = await guessing(t);
    const chains = await chainsOf(t, sessionId);
    await answer(t, ann, chains[0].originalPrompt, ANN_TOKEN);
    await answer(t, ben, chains[0].originalPrompt, BEN_TOKEN);

    // A drawing is answered with nothing, which the route sends as {"ok":true}
    const drawStep = await stepFor(t, ann, ANN_TOKEN, "draw");
    expect(
      await post(t, "/api/games/submit-step", { stepId: drawStep._id, participantId: ann, outputDrawingUrl: PNG, callerId: ann, callerToken: ANN_TOKEN })
    ).toStrictEqual({ status: 200, body: { ok: true } });

    const step = await stepFor(t, hostId, HOST_TOKEN, "guess");
    const wrong = chains[1].options!.find((o) => o !== chains[1].originalPrompt)!;
    // The app sends its pick in both fields, and its token as callerToken
    const body = { stepId: step._id, participantId: hostId, outputText: wrong, selectedOption: wrong, callerId: hostId, callerToken: HOST_TOKEN };
    const expected = { status: 200, body: { correct: false, correctOption: chains[1].originalPrompt, selectedOption: wrong } };
    expect(await post(t, "/api/games/submit-step", body)).toStrictEqual(expected);
    // A retry after a lost reply
    expect(await post(t, "/api/games/submit-step", body)).toStrictEqual(expected);
    // Without the token the route has nothing to say, as for any answer that came too late
    expect(await post(t, "/api/games/submit-step", { ...body, callerToken: undefined })).toStrictEqual({ status: 200, body: { ok: true } });
    // And the action the route calls answers like the mutation
    expect(
      await t.action(api.games.submitGameStepWithTranslation, { stepId: step._id, participantId: hostId, selectedOption: wrong, token: HOST_TOKEN })
    ).toStrictEqual(expected.body);
  });
});

describe("the routes the host app calls", () => {
  const SESSION_FIELDS = ["_id", "roomId", "gameType", "status", "createdByParticipantId", "playerIds", "chainCount", "_creationTime"];
  const STEP_FIELDS = ["_id", "gameSessionId", "chainId", "stepIndex", "stepType", "assignedParticipantId", "status", "_creationTime"];

  test("start answers with the session id, and the polling routes then carry every field the app's decoders require", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);

    const started = await post(t, "/api/games/start", {
      roomId,
      participantId: hostId,
      gameType: "lost-in-translation",
      level: 3,
      timerEnabled: 30,
      customPrompts: bank(40),
    });
    expect(started.status).toBe(200);
    const sessionId = started.body.sessionId as SessionId;
    const stored = await sessionDoc(t, sessionId);
    expect(stored.playerIds).toEqual([hostId, ann]);
    expect(stored.customPrompts).toHaveLength(40);

    const session = await post(t, "/api/games/active-session", { roomId });
    expect(session.status).toBe(200);
    expect(session.body).toMatchObject({ _id: sessionId, status: "active", timerEnabled: 30, level: 3 });
    expect(Object.keys(session.body)).toEqual(expect.arrayContaining(SESSION_FIELDS));

    const step = await post(t, "/api/games/my-active-step", { participantId: hostId });
    expect(step.body).toMatchObject({ stepType: "draw", status: "active", round: 1, totalRounds: 10, timerEnabled: 30 });
    expect(Object.keys(step.body)).toEqual(expect.arrayContaining(STEP_FIELDS));

    const status = await post(t, "/api/games/status", { roomId });
    expect(Object.keys(status.body)).toEqual(
      expect.arrayContaining(["gameType", "level", "currentRound", "totalRounds", "phase", "guessesSubmitted", "guessesTotal", "scores"])
    );

    const latest = await post(t, "/api/games/latest-session", { roomId });
    expect(latest.body._id).toBe(sessionId);
  });

  // The app tells "no game" from a game by failing to decode the body, so the body must never look like one
  test("with no game the polling routes answer 200 with a body that is not a session or a step", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);

    for (const [path, body] of [
      ["/api/games/active-session", { roomId }],
      ["/api/games/latest-session", { roomId }],
      ["/api/games/status", { roomId }],
      ["/api/games/my-active-step", { participantId: hostId }],
    ] as const) {
      const res = await post(t, path, body);
      expect(res.status).toBe(200);
      expect(res.body._id).toBeUndefined();
      expect(res.body.gameType).toBeUndefined();
    }
  });

  test("a refused start is a 400 that says why", async () => {
    const t = newBackend();
    const { roomId, guestIds: [ann] } = await room(t);

    const res = await post(t, "/api/games/start", { roomId, participantId: ann, gameType: "lost-in-translation" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only the host can start a game/);
  });

  test("submit-step takes the host's drawing and guess, refuses a link with a 400, and answers 200 for an answer that came too late", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    const chains = await chainsOf(t, sessionId);
    const drawStep = await openStep(t, hostId, "draw");

    const link = await post(t, "/api/games/submit-step", {
      stepId: drawStep._id,
      participantId: hostId,
      outputDrawingUrl: "https://example.com/drawing.png",
    });
    expect(link.status).toBe(400);
    expect(link.body.error).toMatch(/Unsupported drawing/);

    const drawn = await post(t, "/api/games/submit-step", { stepId: drawStep._id, participantId: hostId, outputDrawingUrl: PNG });
    expect(drawn).toEqual({ status: 200, body: { ok: true } });
    expect(await stepDoc(t, drawStep._id)).toMatchObject({ status: "submitted", outputDrawingUrl: PNG });

    await guess(t, ann, "right");
    await draw(t, ann);
    // The app sends its pick in both fields
    const guessStep = await openStep(t, hostId, "guess");
    const answer = chains[1].originalPrompt;
    const guessed = await post(t, "/api/games/submit-step", {
      stepId: guessStep._id,
      participantId: hostId,
      outputText: answer,
      selectedOption: answer,
    });
    expect(guessed.status).toBe(200);
    expect(await stepDoc(t, guessStep._id)).toMatchObject({ status: "submitted", correct: true });

    // The overlay retries a submit until it gets a 200, so a dropped late answer must be one
    const late = await post(t, "/api/games/submit-step", { stepId: drawStep._id, participantId: hostId, outputDrawingUrl: JPEG });
    expect(late.status).toBe(200);
    expect((await stepDoc(t, drawStep._id)).outputDrawingUrl).toBe(PNG);
  });

  test("cancel ends the game, and the replay route then returns what the replay screen decodes", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    await guess(t, ann, "right");

    const cancelled = await post(t, "/api/games/cancel", { roomId, participantId: hostId });
    expect(cancelled).toEqual({ status: 200, body: { ok: true } });
    const latest = await post(t, "/api/games/latest-session", { roomId });
    expect(latest.body).toMatchObject({ _id: sessionId, status: "complete", cancelled: true });

    const replay = await post(t, "/api/games/replay", { gameSessionId: sessionId });
    expect(replay.status).toBe(200);
    expect(Object.keys(replay.body)).toEqual(
      expect.arrayContaining(["chains", "participants", "promptTranslations", "scores", "session"])
    );
    expect(replay.body.chains).toHaveLength(1);
    expect(Object.keys(replay.body.chains[0])).toEqual(
      expect.arrayContaining(["_id", "chainIndex", "originalPrompt", "status", "steps"])
    );
    expect(Object.keys(replay.body.chains[0].steps[0])).toEqual(expect.arrayContaining(STEP_FIELDS));
  });
});

// ─── Teams ───────────────────────────────────────────────────────────────────
// Four players or more can play as two teams. The host's client asks for them with `teams`; a build from before
// teams sends none and plays individually, as it always did.

describe("teams", () => {
  type Split = string[][];
  type TeamView = { memberIds: string[]; points: number };
  type TeamSummary = Omit<Summary, "rounds"> & {
    rounds: Array<Summary["rounds"][number] & { teamPoints?: [number, number] }>;
    teams?: TeamView[];
  };

  // Every key of an individual game's documents and answers, as builds from before teams have always been sent them
  const SESSION_KEYS = [
    "_creationTime", "_id", "chainCount", "createdAt", "createdByParticipantId", "gameType", "level", "playerIds",
    "roomId", "status", "timerEnabled",
  ];
  const CHAIN_KEYS = [
    "_creationTime", "_id", "chainIndex", "currentStepIndex", "drawerParticipantId", "gameSessionId", "maxSteps",
    "options", "originalPrompt", "status",
  ];
  const STATUS_KEYS = [
    "currentRound", "drawStartedAt", "drawerAvatar", "drawerName", "gameType", "guessesSubmitted", "guessesTotal",
    "level", "phase", "scores", "timerSeconds", "totalRounds",
  ];
  const REPLAY_KEYS = ["chains", "participants", "promptTranslations", "scores", "session"];

  /** A room with the host, who speaks English, and one guest per language given, named G1, G2, … in join order */
  async function teamRoom(t: Backend, languages: string[], host: { token?: string } = {}) {
    const { roomId, hostId } = await room(t, [], host);
    // A room seats ten until its host raises the limit
    if (languages.length >= 10) {
      const { settings } = (await t.run(async (ctx) => await ctx.db.get(roomId)))!;
      await t.mutation(api.rooms.updateRoomSettings, { roomId, settings: { ...settings, maxParticipants: 50 } });
    }
    const guestIds: PID[] = [];
    for (const [i, language] of languages.entries()) {
      guestIds.push(await joinGuest(t, roomId, `G${i + 1}`, { language, avatar: AVATARS[i % AVATARS.length] }));
    }
    return { roomId, hostId, guestIds, players: [hostId, ...guestIds] };
  }

  async function startTeams(t: Backend, roomId: RoomId, hostId: PID, teams: "auto" | Split, extra: StartExtras = {}) {
    return await t.mutation(api.games.startGame, { roomId, participantId: hostId, gameType: "lost-in-translation", teams, ...extra });
  }

  async function storedTeams(t: Backend, sessionId: SessionId): Promise<PID[][]> {
    const { teams } = await sessionDoc(t, sessionId);
    if (!teams) throw new Error("The session has no teams");
    return teams;
  }

  /** Math.random as a fixed sequence (mulberry32), so that a deal can be made again. Undone by mockRestore or restoreAllMocks */
  function seedRandom(seed: number) {
    let state = seed >>> 0;
    return vi.spyOn(Math, "random").mockImplementation(() => {
      state = (state + 0x6d2b79f5) >>> 0;
      let x = Math.imul(state ^ (state >>> 15), state | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    });
  }

  /** Two teams that hold every player once, each in drawing order: the host, then the others as they joined */
  function expectTeams(teams: PID[][] | null | undefined, players: PID[]): asserts teams is PID[][] {
    expect(teams).toHaveLength(2);
    expect([...teams![0], ...teams![1]].sort()).toEqual([...players].sort());
    for (const team of teams!) {
      expect(team).toEqual(players.filter((p) => team.includes(p)));
      expect(team.length).toBeGreaterThanOrEqual(2);
    }
    expect(Math.abs(teams![0].length - teams![1].length)).toBeLessThanOrEqual(1);
  }

  /**
   * What a fresh deal promises on top of that: the teams as even as the players allow in size, in speakers of
   * Japanese, in speakers of anything else and in players away. An even number is shared out in halves, an odd
   * one leaves the teams one apart.
   */
  async function expectEven(t: Backend, teams: PID[][] | null | undefined, players: PID[], away: PID[] = []) {
    expectTeams(teams, players);
    const japanese: PID[] = [];
    for (const p of players) if ((await participantDoc(t, p)).preferredLanguage.startsWith("ja")) japanese.push(p);
    const kinds: Array<[string, (p: PID) => boolean]> = [
      ["size", () => true],
      ["Japanese", (p) => japanese.includes(p)],
      ["other languages", (p) => !japanese.includes(p)],
      ["away", (p) => away.includes(p)],
    ];
    for (const [kind, is] of kinds) {
      const apart = Math.abs(teams[0].filter(is).length - teams[1].filter(is).length);
      expect(apart, `${kind}: ${JSON.stringify(teams)}`).toBe(players.filter(is).length % 2);
    }
  }

  /** The two groups of a split, whichever is called team 0 */
  const sides = (teams: string[][]) => teams.map((team) => [...team].sort().join()).sort().join(" | ");

  /** Plays one round to its end: the drawer draws, and every other player guesses, right if listed here and wrong if not */
  async function playRound(t: Backend, players: PID[], drawer: PID, right: PID[]) {
    await draw(t, drawer);
    for (const guesser of players.filter((p) => p !== drawer)) await guess(t, guesser, right.includes(guesser) ? "right" : "wrong");
  }

  /** What the room's status says of the teams: their points */
  async function points(t: Backend, roomId: RoomId): Promise<number[]> {
    const status = await t.query(api.games.getGameStatus, { roomId });
    return status!.teams!.map((team) => team.points);
  }

  async function teamSummary(t: Backend, roomId: RoomId): Promise<TeamSummary> {
    const [summary, ...more] = (await summariesIn(t, roomId)) as TeamSummary[];
    expect(more).toEqual([]);
    return summary;
  }

  /** Host, G2 and G4 against G1 and G3. The drawing goes Host, G1, G2, G3, G4, G1, Host, G3, G2, G1 */
  async function threeAgainstTwo(t: Backend, extra: StartExtras = {}) {
    const { roomId, hostId, guestIds: [g1, g2, g3, g4], players } = await teamRoom(t, ["ja", "en", "ja", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g2, g4], [g1, g3]], extra);
    return { roomId, hostId, g1, g2, g3, g4, players, sessionId };
  }

  /** Host and G2 against G1 and G3. The drawing goes Host, G1, G2, G3, and round again */
  async function twoAgainstTwo(t: Backend, extra: StartExtras = {}) {
    const { roomId, hostId, guestIds: [g1, g2, g3], players } = await teamRoom(t, ["ja", "en", "ja"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g2], [g1, g3]], extra);
    return { roomId, hostId, g1, g2, g3, players, sessionId };
  }

  // ── Who plays in teams ──

  test.each([4, 5, 6])(
    "a Start that says nothing of teams is an individual game with %i players too, stored and answered as it always was",
    async (count) => {
      const t = newBackend();
      const languages = Array.from({ length: count - 1 }, (_, i) => (i % 2 === 0 ? "ja" : "en"));
      const { roomId, hostId, players } = await teamRoom(t, languages);
      const sessionId = await start(t, roomId, hostId);

      const session = await sessionDoc(t, sessionId);
      expect(Object.keys(session).sort()).toEqual(SESSION_KEYS);
      expect(session.playerIds).toEqual(players);
      // The drawing passes through the players in join order
      const chains = await chainsOf(t, sessionId);
      expect(chains.map((c) => c.drawerParticipantId)).toEqual(chains.map((_, r) => players[r % count]));

      // Round 1 to its end, and round 2 with one guess in
      await playRound(t, players, hostId, players.slice(1, 3));
      await draw(t, players[1]);
      await guess(t, hostId, "right");

      const status = await post(t, "/api/games/status", { roomId });
      expect(Object.keys(status.body).sort()).toEqual(STATUS_KEYS);
      expect(Object.keys(status.body.scores).sort()).toEqual([...players].sort());
      for (const score of Object.values(status.body.scores)) {
        expect(Object.keys(score as object).sort()).toEqual(["avatar", "correct", "nickname", "total"]);
      }
      const active = await post(t, "/api/games/active-session", { roomId });
      expect(Object.keys(active.body).sort()).toEqual(SESSION_KEYS);
      for (const chain of await chainsOf(t, sessionId)) expect(Object.keys(chain).sort()).toEqual(CHAIN_KEYS);

      await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
      const latest = await post(t, "/api/games/latest-session", { roomId });
      expect(Object.keys(latest.body).sort()).toEqual([...SESSION_KEYS, "cancelled", "completedAt"].sort());
      const replay = await post(t, "/api/games/replay", { gameSessionId: sessionId });
      expect(Object.keys(replay.body).sort()).toEqual(REPLAY_KEYS);
      expect(replay.body.chains).toHaveLength(2);
      for (const chain of replay.body.chains) expect(Object.keys(chain).sort()).toEqual([...CHAIN_KEYS, "steps"].sort());
      for (const score of Object.values(replay.body.scores)) expect(Object.keys(score as object).sort()).toEqual(["correct", "total"]);

      const records = await gameRecords(t, roomId);
      const summary = JSON.parse(records.find((r) => r.startsWith("game_summary:"))!.slice("game_summary:".length));
      expect(Object.keys(summary)).toEqual(["gameType", "level", "cancelled", "players", "rounds", "totals"]);
      for (const round of summary.rounds) expect(Object.keys(round)).toEqual(["round", "prompt", "results"]);
      expect(Object.keys(summary.totals).sort()).toEqual([...players].sort());
      expect(JSON.stringify([status.body, active.body, latest.body, replay.body, records])).not.toMatch(/team/i);
    }
  );

  test("an individual game of four that runs to its end posts the summary it always did", async () => {
    const t = newBackend();
    const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja"]);
    const sessionId = await start(t, roomId, hostId);
    for (const chain of await chainsOf(t, sessionId)) await playRound(t, players, chain.drawerParticipantId!, [players[1]]);

    const records = await gameRecords(t, roomId);
    const summary = JSON.parse(records.find((r) => r.startsWith("game_summary:"))!.slice("game_summary:".length));
    expect(Object.keys(summary)).toEqual(["gameType", "level", "players", "rounds", "totals"]);
    expect(summary.rounds).toHaveLength(10);
    for (const round of summary.rounds) expect(Object.keys(round)).toEqual(["round", "prompt", "results"]);
    expect(Object.keys(await sessionDoc(t, sessionId)).sort()).toEqual([...SESSION_KEYS, "completedAt"].sort());
    for (const chain of await chainsOf(t, sessionId)) expect(Object.keys(chain).sort()).toEqual(CHAIN_KEYS);
  });

  test.each([2, 3])("with %i players a game is individual whatever was asked for, and the Start is not refused", async (count) => {
    for (const asked of ["auto", "a split", "auto over the route"]) {
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en"].slice(0, count - 1));
      const sessionId =
        asked === "auto over the route"
          ? (await post(t, "/api/games/start", { roomId, participantId: hostId, gameType: "lost-in-translation", teams: "auto" })).body.sessionId
          : await startTeams(t, roomId, hostId, asked === "auto" ? "auto" : [[hostId], players.slice(1)]);

      expect(Object.keys(await sessionDoc(t, sessionId)).sort(), asked).toEqual(SESSION_KEYS);
      expect((await chainsOf(t, sessionId)).slice(0, 4).map((c) => c.drawerParticipantId)).toEqual(
        [0, 1, 2, 3].map((r) => players[r % count])
      );
      const status = await t.query(api.games.getGameStatus, { roomId });
      expect(Object.keys(status!).sort(), asked).toEqual(STATUS_KEYS);
    }
  });

  // Who is dealt in is settled at Start, not by how many are in the room
  test("four in the room of whom one has left are three players: an individual game", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3] } = await teamRoom(t, ["ja", "en", "ja"]);
    await t.mutation(api.participants.leaveRoom, { participantId: g3 });

    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g1], [g2, g3]]);
    expect(Object.keys(await sessionDoc(t, sessionId)).sort()).toEqual(SESSION_KEYS);
    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, g1, g2]);
  });

  test("a Start with 'auto' stores the teams the server dealt, with nobody having had a turn yet, and the status names them", async () => {
    const t = newBackend();
    const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, "auto");

    const session = await sessionDoc(t, sessionId);
    expect(Object.keys(session).sort()).toEqual([...SESSION_KEYS, "teamAway", "teams"].sort());
    expect(session.playerIds).toEqual(players);
    expect(session.teamAway).toEqual(players);
    await expectEven(t, session.teams, players);
    const status = await t.query(api.games.getGameStatus, { roomId });
    expect(status!.teams).toEqual(session.teams!.map((memberIds) => ({ memberIds, points: 0 })));
    // The host draws round 1, so the host's team is the one drawing
    expect(status!.drawingTeam).toBe(session.teams![0].includes(hostId) ? 0 : 1);
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1"]);
  });

  // ── The deal ──

  // The guests' languages, and which guests (1 = G1) have their phone dimmed: dealt in, but not here right now
  test.each<[string, string[], number[]]>([
    ["four who speak one language", ["en", "en", "en"], []],
    ["two and two", ["ja", "en", "ja"], []],
    ["three Japanese speakers and two others", ["ja", "ja", "en", "ja"], []],
    ["five and one", ["en", "en", "ja", "en", "en"], []],
    ["three and four", ["ja", "ja", "ja", "en", "en", "en"], []],
    ["languages the apps do not offer", ["ja-JP", "ko", "ja", "fr"], []],
    ["two of three Japanese speakers away", ["ja", "ja", "ja"], [2, 3]],
    ["one away in each language", ["ja", "ja", "en", "en", "en"], [2, 3]],
    ["four of eight away", ["ja", "ja", "ja", "en", "en", "en", "ja"], [2, 5, 6, 7]],
    ["three of seven away, all of one language", ["en", "en", "en", "ja", "ja", "ja"], [1, 2, 3]],
    ["everyone but the host away", ["ja", "en", "ja", "en", "ja"], [1, 2, 3, 4, 5]],
  ])("a deal is as even as the players allow in size, in each language and in players away: %s", async (_name, languages, dimmed) => {
    const t = newBackend();
    const { roomId, hostId, guestIds, players } = await teamRoom(t, languages);
    const away = dimmed.map((n) => guestIds[n - 1]);
    await goAway(t, ...away);

    const dealt = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const random = seedRandom(seed);
      const { playerIds, teams } = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId });
      random.mockRestore();
      expect(playerIds).toEqual(players);
      await expectEven(t, teams, players, away);
      dealt.add(sides(teams!));
    }
    // Chance has a say: forty deals are not one deal made forty times
    expect(dealt.size).toBeGreaterThan(1);
  });

  // "ja-JP" is Japanese for the split, as "ja" is, and every other language is the other half of the room
  test("the languages shared out are Japanese and everything else, however a language is written", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3] } = await teamRoom(t, ["ja-JP", "ko", "ja"]);

    for (let seed = 1; seed <= 20; seed++) {
      const random = seedRandom(seed);
      const { teams } = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId });
      random.mockRestore();
      // One of the two Japanese speakers on each team, with the host or with G2
      expect([sides([[hostId, g1], [g2, g3]]), sides([[hostId, g3], [g1, g2]])]).toContain(sides(teams!));
    }
  });

  test("the host who asks counts as here, whatever their last heartbeat said", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2], players } = await teamRoom(t, ["en", "en", "en"]);
    // By their last heartbeat the host, G1 and G2 are away
    await goAway(t, hostId, g1, g2);

    for (let seed = 1; seed <= 20; seed++) {
      const random = seedRandom(seed);
      const { teams } = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId });
      random.mockRestore();
      // G1 and G2 are the two away, and are never on one team. With the host a third, they could be
      await expectEven(t, teams, players, [g1, g2]);
    }
  });

  test("the deal is Math.random's: the same draws make the same teams, and other draws make others", async () => {
    const deals: string[] = [];
    for (const seed of [11, 11, 12, 13, 14, 15, 16, 17]) {
      const random = seedRandom(seed);
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja", "en", "ja"]);
      const teams = await storedTeams(t, await startTeams(t, roomId, hostId, "auto"));
      random.mockRestore();
      // Ids are the same in every fresh backend, so a deal can be compared by each player's place in the room
      deals.push(JSON.stringify(teams.map((team) => team.map((p) => players.indexOf(p)))));
    }
    expect(deals[1]).toBe(deals[0]);
    expect(new Set(deals).size).toBeGreaterThan(2);
  });

  // ── The split the host's picker sends ──

  test("a split that holds every player once, the teams at most one apart, is played as sent, each team in drawing order", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4] } = await teamRoom(t, ["ja", "en", "ja", "en"]);
    // Both Japanese speakers on one team, and neither list in join order: what the host saw is not second-guessed
    const sessionId = await startTeams(t, roomId, hostId, [[g3, g1], [g4, hostId, g2]]);

    expect(await storedTeams(t, sessionId)).toEqual([[g1, g3], [hostId, g2, g4]]);
  });

  test("an id that is not a player's is dropped: a guest who left, another room's guest, and no id at all", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4] } = await teamRoom(t, ["ja", "en", "ja", "en"]);
    const elsewhere = await teamRoom(t, ["en"]);
    await t.mutation(api.participants.setParticipantOnline, { participantId: g4, online: false });

    const sessionId = await startTeams(t, roomId, hostId, [
      [hostId, g1, elsewhere.guestIds[0], "not an id"],
      [g2, g3, g4],
    ]);

    expect((await sessionDoc(t, sessionId)).playerIds).toEqual([hostId, g1, g2, g3]);
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1], [g2, g3]]);
  });

  test("a player listed in both teams, or twice in one, stays where they are listed first", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3] } = await teamRoom(t, ["ja", "en", "ja"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g1, hostId], [g1, g2, g3, hostId]]);

    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1], [g2, g3]]);
  });

  test("a player the split leaves out joins the smaller team, and between equal teams the one with fewer speakers of their language", async () => {
    const t = newBackend();
    // Host en, G1 ja, G2 en, G3 ja, then two the picker had not seen: G4 ja, G5 en
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["ja", "en", "ja", "ja", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g2], [g1, g3]]);

    // G4 finds the teams equal and team 0 without a Japanese speaker; G5 then finds team 1 the smaller
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g2, g4], [g1, g3, g5]]);
  });

  test("a player the split leaves out joins the smaller team even when the other has fewer speakers of their language", async () => {
    const t = newBackend();
    // Host en and G1 en against G2, G3 and G4, all ja; then G5 en, whom the picker had not seen
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["en", "ja", "ja", "ja", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g1], [g2, g3, g4]]);

    // Team 1 has no English speaker, but team 0 is the smaller: G5 joins it, and nobody who was kept is moved
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1, g5], [g2, g3, g4]]);
  });

  test("a player the split leaves out who is away joins, between teams equal in size and language, the one with fewer players away", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["en", "en", "en", "en", "en"]);
    await goAway(t, g1, g4);

    // G4, away, finds G1 away on team 0 and nobody away on team 1; G5 then finds team 0 the smaller
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g1], [g2, g3]]);
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1, g5], [g2, g3, g4]]);
  });

  test("the host the split leaves out is seated like anyone else, and still draws round 1", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4] } = await teamRoom(t, ["ja", "ja", "en", "en"]);

    // The host speaks English, and joins the team without an English speaker: here team 1
    const sessionId = await startTeams(t, roomId, hostId, [[g3, g4], [g1, g2]]);
    expect(await storedTeams(t, sessionId)).toEqual([[g3, g4], [hostId, g1, g2]]);
    expect((await chainsOf(t, sessionId)).slice(0, 3).map((c) => c.drawerParticipantId)).toEqual([hostId, g3, g1]);
  });

  test("teams more than one apart are evened out by the fewest moves: an empty team, and five against one", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5], players } = await teamRoom(t, ["ja", "en", "ja", "en", "ja"]);

    // Everyone on one side. Three cross, each time the last in the drawing order of the language team 0 has most
    // in excess: G5, then G4 (three English speakers against none), then G3
    const oneSided = await startTeams(t, roomId, hostId, [players, []]);
    expect(await storedTeams(t, oneSided)).toEqual([[hostId, g1, g2], [g3, g4, g5]]);
    await expectEven(t, await storedTeams(t, oneSided), players);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    // Five against one, the one being Japanese. Two cross: G4, the last of three English speakers against none,
    // then G3. Nobody who could stay is moved
    const lopsided = await startTeams(t, roomId, hostId, [[hostId, g1, g2, g3, g4], [g5]]);
    expect(await storedTeams(t, lopsided)).toEqual([[hostId, g1, g2], [g3, g4, g5]]);
  });

  test("evening out takes a speaker of the language most in excess, not simply the last in line", async () => {
    const t = newBackend();
    // Host en, G1 ja, G2 ja, G3 en, G4 en against G5 en. Two cross: G4, the last in line while both languages are
    // two in excess, then G2: team 0 then has two Japanese speakers against none, and G3, the last in line, stays
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["ja", "ja", "en", "en", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g1, g2, g3, g4], [g5]]);

    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1, g3], [g2, g4, g5]]);
  });

  test("of those who could cross, one who is away goes first while their team has more players away", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4], players } = await teamRoom(t, ["en", "en", "en", "en"]);
    await goAway(t, g1, g2);

    // Two of the five cross. G4 is the last in the drawing order, but G2 goes first: both players away are on
    // team 0. With one of them on each team, G4 follows
    const sessionId = await startTeams(t, roomId, hostId, [players, []]);
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1, g3], [g2, g4]]);
  });

  test("a team of one is never played: with four players a one-against-three split becomes two against two", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3] } = await teamRoom(t, ["en", "en", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, [[hostId], [g1, g2, g3]]);

    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g3], [g1, g2]]);
  });

  test("the split shown for six still fits when two of them have left by Start", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["ja", "en", "ja", "en", "ja"]);
    const shown = [[hostId, g1, g4], [g2, g3, g5]];
    await t.mutation(api.participants.setParticipantOnline, { participantId: g2, online: false });
    await t.mutation(api.participants.setParticipantOnline, { participantId: g3, online: false });

    const sessionId = await startTeams(t, roomId, hostId, shown);

    // Team 1 is down to G5, so one of team 0 crosses: G4, whose language team 0 has two of against none
    expect(await storedTeams(t, sessionId)).toEqual([[hostId, g1], [g4, g5]]);
  });

  test.each<[string, (players: PID[]) => Split]>([
    ["no list", () => []],
    ["two empty lists", () => [[], []]],
    ["two lists of strangers", () => [["x"], ["y", "z"]]],
    ["players in a third list only, which is no team", (players) => [[], [], players]],
  ])("a split that keeps nobody is a fresh deal: %s", async (_name, split) => {
    for (let seed = 1; seed <= 10; seed++) {
      const random = seedRandom(seed);
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja", "en"]);
      const sessionId = await startTeams(t, roomId, hostId, split(players));
      random.mockRestore();

      await expectEven(t, await storedTeams(t, sessionId), players);
    }
  });

  test.each<[string, (players: PID[]) => Split]>([
    ["one list", (players) => [players]],
    ["one player listed 300 times", (players) => [Array.from({ length: 300 }, () => players[1]), [players[2]]]],
    ["three lists", (players) => [[players[0]], [players[1]], [players[2], players[3]]]],
    ["the host alone on a team", (players) => [[players[0]], players.slice(1)]],
    ["everyone in both lists", (players) => [players, players]],
  ])("a split of any shape ends as two teams of at least two that hold every player once: %s", async (_name, split) => {
    const t = newBackend();
    const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja", "en"]);
    const sessionId = await startTeams(t, roomId, hostId, split(players));

    expectTeams(await storedTeams(t, sessionId), players);
    expect((await chainsOf(t, sessionId))[0].drawerParticipantId).toBe(hostId);
  });

  test("over the route, 'auto' and a split are passed on, and anything else is a Start without teams, never a refusal", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3], players } = await teamRoom(t, ["ja", "en", "ja"]);
    const body = { roomId, participantId: hostId, gameType: "lost-in-translation" };

    const auto = await post(t, "/api/games/start", { ...body, teams: "auto" });
    expect(auto.status).toBe(200);
    expect(Object.keys(auto.body)).toEqual(["sessionId"]);
    await expectEven(t, await storedTeams(t, auto.body.sessionId), players);
    await post(t, "/api/games/cancel", { roomId, participantId: hostId });

    const split = await post(t, "/api/games/start", { ...body, teams: [[g3, hostId], [g1, g2]] });
    expect(await storedTeams(t, split.body.sessionId)).toEqual([[hostId, g3], [g1, g2]]);
    await post(t, "/api/games/cancel", { roomId, participantId: hostId });

    for (const teams of [null, true, false, 2, "teams", "", {}, { auto: true }, [hostId, g1], [[hostId, 1], [g2, g3]], [[hostId, g1], null]]) {
      const res = await post(t, "/api/games/start", { ...body, teams });
      expect(res.status, JSON.stringify(teams)).toBe(200);
      expect(Object.keys(await sessionDoc(t, res.body.sessionId)).sort(), JSON.stringify(teams)).toEqual(SESSION_KEYS);
      await post(t, "/api/games/cancel", { roomId, participantId: hostId });
    }
  });

  // ── The picker's deal ──

  describe("dealTeams", () => {
    /** Everything a mutation could have written to */
    async function everythingStored(t: Backend): Promise<string> {
      return JSON.stringify(
        await t.run(async (ctx) => ({
          rooms: await ctx.db.query("rooms").collect(),
          participants: await ctx.db.query("participants").collect(),
          messages: await ctx.db.query("messages").collect(),
          sessions: await ctx.db.query("gameSessions").collect(),
          chains: await ctx.db.query("gameChains").collect(),
          steps: await ctx.db.query("gameSteps").collect(),
          rateLimits: await ctx.db.query("rateLimits").collect(),
        }))
      );
    }

    test("answers with who would be dealt in and an even split of them, and writes nothing", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [g1, g2, g3, g4] } = await teamRoom(t, ["ja", "en", "ja", "en"]);
      await t.mutation(api.participants.setParticipantOnline, { participantId: g4, online: false });
      // The host's last heartbeat said "away". A Start records that the host is here; a deal records nothing
      await goAway(t, hostId);
      const before = await everythingStored(t);

      const dealt = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId });
      const again = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: dealt.teams! });

      expect(Object.keys(dealt).sort()).toEqual(["playerIds", "teams"]);
      expect(dealt.playerIds).toEqual([hostId, g1, g2, g3]);
      await expectEven(t, dealt.teams, [hostId, g1, g2, g3]);
      await expectEven(t, again.teams, [hostId, g1, g2, g3]);
      expect(await everythingStored(t)).toBe(before);
    });

    test.each([2, 3])("with %i players there are no teams to show", async (count) => {
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en"].slice(0, count - 1));

      const answer = { playerIds: players, teams: null };
      expect(await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).toEqual(answer);
      expect(await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: [[hostId], []] })).toEqual(answer);
      expect(await post(t, "/api/games/deal-teams", { roomId, participantId: hostId })).toEqual({ status: 200, body: answer });
    });

    test("it deals from the players a Start would deal in, and the split it returns, sent back with Start, is the one played", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [g1, g2, g3, g4, g5] } = await teamRoom(t, ["ja", "en", "ja", "en", "ja"]);
      // G5 has left, and G4's phone went dark four minutes ago: neither is dealt in
      await t.mutation(api.participants.leaveRoom, { participantId: g5 });
      await advance(t, 4 * 60_000);
      await beat(t, hostId, g1, g2, g3);
      const dealt = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId });
      expect(dealt.playerIds).toEqual([hostId, g1, g2, g3]);
      expect(g4).toBeTruthy();

      const sessionId = await startTeams(t, roomId, hostId, dealt.teams!);
      expect((await sessionDoc(t, sessionId)).playerIds).toEqual(dealt.playerIds);
      expect(await storedTeams(t, sessionId)).toEqual(dealt.teams);
    });

    test("Reshuffle, which sends the split on screen, comes back with other teams every time, just as even", async () => {
      seedRandom(5);
      const t = newBackend();
      // Two and two: there are only two ways to pair them, so chance alone would repeat the split every other press
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja"]);

      let shown = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams!;
      for (let press = 0; press < 30; press++) {
        const next = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: shown })).teams!;
        expect(sides(next)).not.toBe(sides(shown));
        // The same two groups under the other team's name are the same teams
        const swapped = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: [shown[1], shown[0]] })).teams!;
        expect(sides(swapped)).not.toBe(sides(shown));
        await expectEven(t, next, players);
        shown = next;
      }
    });

    test.each([0, 0.25, 0.5, 0.75, 0.999])(
      "when chance deals the split on screen again (Math.random stuck at %f), two players alike in language and in being here change sides",
      async (stuck) => {
        vi.spyOn(Math, "random").mockReturnValue(stuck);
        const t = newBackend();
        // Two Japanese speakers and four others, of whom G2 and G4 are away
        const { roomId, hostId, guestIds: [, g2, , g4], players } = await teamRoom(t, ["ja", "en", "ja", "en", "en"]);
        await goAway(t, g2, g4);
        const shown = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams!;
        expect((await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams).toEqual(shown);

        const next = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: shown })).teams!;
        expect(sides(next)).not.toBe(sides(shown));
        // As even as the split it replaces, in every count
        await expectEven(t, next, players, [g2, g4]);
        // Two changed sides, and nobody else
        expect(next[0].filter((p) => !shown[0].includes(p))).toHaveLength(1);
        expect(next[1].filter((p) => !shown[1].includes(p))).toHaveLength(1);
      }
    );

    // Host en here, G1 ja here, G2 ja away, G3 en away: one split alone is even in every count
    test("when no other split is as even, Reshuffle still comes back with other teams, even in size and language", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [g1, g2, g3], players } = await teamRoom(t, ["ja", "ja", "en"]);
      await goAway(t, g2, g3);
      const only = sides([[hostId, g2], [g1, g3]]);

      for (let seed = 1; seed <= 10; seed++) {
        const random = seedRandom(seed);
        const shown = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams!;
        expect(sides(shown)).toBe(only);
        const next = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: shown })).teams!;
        random.mockRestore();
        // The two Japanese speakers change sides, or the two others: either way these teams
        expect(sides(next)).toBe(sides([[hostId, g1], [g2, g3]]));
        await expectEven(t, next, players);
      }
    });

    // Host en here, G1 ja here, G2 ja away, G3 en here, G4 en away: three splits are even in every count, and a
    // fresh deal comes up with one of them, [Host, G2, G3] against [G1, G4], every other time
    test("when other splits are as even, Reshuffle comes back with one of them: the players away stay shared out", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [, g2, , g4], players } = await teamRoom(t, ["ja", "ja", "en", "en"]);
      await goAway(t, g2, g4);

      const seen = new Set<string>();
      for (let seed = 1; seed <= 40; seed++) {
        const random = seedRandom(seed);
        const shown = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams!;
        const next = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: shown })).teams!;
        random.mockRestore();
        expect(sides(next)).not.toBe(sides(shown));
        await expectEven(t, next, players, [g2, g4]);
        seen.add(sides(shown));
      }
      expect(seen.size).toBe(3);
    });

    test("a split on screen that this room's players do not make up is nothing to differ from", async () => {
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, ["ja", "en", "ja"]);

      for (const previous of [[], [players], [["x"], ["y"]], [[], [], []]]) {
        const { teams } = await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous });
        await expectEven(t, teams, players);
      }
      // Over the route, a value that is no split is none sent
      for (const previous of [null, "auto", 7, [hostId], [[hostId, 3]]]) {
        const res = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, previous });
        expect(res.status, JSON.stringify(previous)).toBe(200);
        await expectEven(t, res.body.teams, players);
      }
    });

    test("a guest who was on the split shown and has left since does not make the teams count as new", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const t = newBackend();
      const { roomId, hostId, guestIds: [g1, g2, g3, g4] } = await teamRoom(t, ["ja", "en", "ja", "en"]);
      await t.mutation(api.participants.leaveRoom, { participantId: g4 });
      const stuck = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams!;

      // The split on screen still lists G4. Chance deals the four who stayed as before, which is not other teams
      const shown = [[...stuck[0], g4], stuck[1]];
      const next = (await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, previous: shown })).teams!;
      expect(sides(next)).not.toBe(sides(stuck));
      expectTeams(next, [hostId, g1, g2, g3]);
    });

    test("in a closed room nothing is dealt, as nothing can be started there", async () => {
      const t = newBackend();
      const { roomId, hostId } = await teamRoom(t, ["ja", "en", "ja"]);
      await t.mutation(api.rooms.closeRoom, { roomId });

      await expect(startTeams(t, roomId, hostId, "auto")).rejects.toThrow(/Room is closed/);
      await expect(t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).rejects.toThrow(/Room is closed/);
      const refused = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId });
      expect(refused.status).toBe(400);
      expect(refused.body.error).toMatch(/Room is closed/);
    });

    test("only the host can ask, and when enforced only with the host's own token; the route reads it from callerToken", async () => {
      const t = newBackend();
      const HOST_TOKEN = tokenFor(1);
      const G1_TOKEN = tokenFor(2);
      const { roomId, hostId } = await room(t, [], { token: HOST_TOKEN });
      const g1 = await joinGuest(t, roomId, "G1", { token: G1_TOKEN });
      for (const name of ["G2", "G3"]) await joinGuest(t, roomId, name);
      const other = await room(t, ["Zed"], { token: tokenFor(3) });

      await expect(t.mutation(api.games.dealTeams, { roomId, participantId: g1, token: G1_TOKEN })).rejects.toThrow(
        /Only the host can start a game/
      );
      // Not enforced: a missing token is logged and let through
      expect((await t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).teams).toHaveLength(2);
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/^auth: games\.dealTeams no token/));

      vi.stubEnv("AUTH_MODE", "enforce");
      await expect(t.mutation(api.games.dealTeams, { roomId, participantId: hostId })).rejects.toThrow(/Not authorised/);
      await expect(t.mutation(api.games.dealTeams, { roomId, participantId: hostId, token: G1_TOKEN })).rejects.toThrow(/Not authorised/);
      await expect(t.mutation(api.games.dealTeams, { roomId, participantId: other.hostId, token: tokenFor(3) })).rejects.toThrow(
        /Not authorised/
      );
      expect((await t.mutation(api.games.dealTeams, { roomId, participantId: hostId, token: HOST_TOKEN })).teams).toHaveLength(2);

      const refused = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId });
      expect(refused.status).toBe(400);
      expect(refused.body.error).toMatch(/Not authorised/);
      // The token is not read from `token`, which on the routes is never the caller's
      expect((await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, token: HOST_TOKEN })).status).toBe(400);
      const dealt = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, callerId: hostId, callerToken: HOST_TOKEN });
      expect(dealt.status).toBe(200);
      expect(Object.keys(dealt.body).sort()).toEqual(["playerIds", "teams"]);
      expect(dealt.body.playerIds).toHaveLength(4);
      expectTeams(dealt.body.teams, dealt.body.playerIds);
      // And the split on screen from `previous`. Chance is held still, so it deals the same teams again
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const shown = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, callerToken: HOST_TOKEN });
      const again = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, callerToken: HOST_TOKEN });
      expect(again.body.teams).toEqual(shown.body.teams);
      const next = await post(t, "/api/games/deal-teams", { roomId, participantId: hostId, callerToken: HOST_TOKEN, previous: shown.body.teams });
      expect(sides(next.body.teams)).not.toBe(sides(shown.body.teams));
    });
  });

  // ── Who draws ──

  test.each<[string, string[], (p: PID[]) => Split, number[]]>([
    // The numbers are places in the room: 0 is the host, 1 is G1
    ["two against two", ["ja", "en", "ja"], (p) => [[p[0], p[2]], [p[1], p[3]]], [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]],
    ["three against two", ["ja", "en", "ja", "en"], (p) => [[p[0], p[2], p[4]], [p[1], p[3]]], [0, 1, 2, 3, 4, 1, 0, 3, 2, 1]],
    ["two against three, the host on the smaller team", ["ja", "en", "ja", "en"], (p) => [[p[0], p[2]], [p[1], p[3], p[4]]], [0, 1, 2, 3, 0, 4, 2, 1, 0, 3]],
    ["three against three", ["ja", "en", "ja", "en", "ja"], (p) => [[p[0], p[2], p[4]], [p[1], p[3], p[5]]], [0, 1, 2, 3, 4, 5, 0, 1, 2, 3]],
    ["three against two, the host on team 1", ["ja", "en", "ja", "en"], (p) => [[p[1], p[3]], [p[0], p[2], p[4]]], [0, 1, 2, 3, 4, 1, 0, 3, 2, 1]],
    ["three against three, the host on team 1", ["ja", "en", "ja", "en", "ja"], (p) => [[p[1], p[3], p[5]], [p[0], p[2], p[4]]], [0, 1, 2, 3, 4, 5, 0, 1, 2, 3]],
  ])(
    "the teams take the drawing in turn, the host's team first with the host, each going through its members in order: %s",
    async (_name, languages, split, order) => {
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, languages);
      const sessionId = await startTeams(t, roomId, hostId, split(players));

      const chains = await chainsOf(t, sessionId);
      expect(chains.map((c) => players.indexOf(c.drawerParticipantId!))).toEqual(order);
      // Each team draws five of the ten rounds
      const [team0] = await storedTeams(t, sessionId);
      expect(chains.filter((c) => team0.includes(c.drawerParticipantId!))).toHaveLength(5);
      expect(chains.every((c) => c.maxSteps === players.length)).toBe(true);
      expect(await myStep(t, hostId)).toMatchObject({ stepType: "draw", round: 1 });
    }
  );

  // The host's row is made with the room, so the host is the first to have joined. The drawing order does not lean on it
  test("round 1 is drawn by whoever pressed Start, wherever they come in the join order", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [g1, g2, g3] } = await teamRoom(t, ["ja", "en", "ja"]);
    await t.run(async (ctx) => await ctx.db.patch(g2, { role: "host" }));

    const sessionId = await startTeams(t, roomId, g2, [[g1, g3], [hostId, g2]]);
    expect(await storedTeams(t, sessionId)).toEqual([[g1, g3], [g2, hostId]]);
    expect((await chainsOf(t, sessionId)).slice(0, 4).map((c) => c.drawerParticipantId)).toEqual([g2, g1, hostId, g3]);
  });

  test("everyone but the drawer guesses, the drawer's own team included, and a step says nothing of teams", async () => {
    const t = newBackend();
    const { hostId, g1, g2, g3, sessionId } = await twoAgainstTwo(t);
    const [chain] = await chainsOf(t, sessionId);
    expect(JSON.stringify(await myStep(t, hostId))).not.toMatch(/team/i);
    await draw(t, hostId);

    const guesses = (await stepsOf(t, sessionId)).filter((s) => s.stepType === "guess");
    expect(guesses.map((s) => s.assignedParticipantId)).toEqual([g1, g2, g3]);
    const step = await post(t, "/api/games/my-active-step", { participantId: g2 });
    expect(step.body).toMatchObject({ stepType: "guess", round: 1, totalRounds: 10, chainMaxSteps: 4 });
    expect(JSON.stringify(step.body)).not.toMatch(/team/i);
    // The answer to a guess is what it is in any game
    const open = await openStep(t, g2, "guess");
    expect(
      await t.mutation(api.games.submitGameStep, { stepId: open._id, participantId: g2, selectedOption: chain.originalPrompt })
    ).toStrictEqual({ correct: true, correctOption: chain.originalPrompt, selectedOption: chain.originalPrompt });
  });

  test("the status names the team whose member has the round, through its drawing and its guessing", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players } = await threeAgainstTwo(t);

    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({ phase: "drawing", drawerName: "Host", drawingTeam: 0 });
    await draw(t, hostId);
    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({ phase: "guessing", drawerName: "Host", drawingTeam: 0 });
    for (const guesser of [g1, g2, g3, g4]) await guess(t, guesser, "right");
    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({ phase: "drawing", drawerName: "G1", drawingTeam: 1 });
    await playRound(t, players, g1, []);
    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({ phase: "drawing", drawerName: "G2", drawingTeam: 0 });
  });

  // ── Points ──

  // Each round: how many of team 0's guessers and of team 1's are right, and the points that gives the two teams.
  // The team whose member draws has one guesser fewer than its size.
  test.each<[number, Array<[[number, number], [number, number]]>]>([
    [2, [[[1, 1], [60, 30]], [[1, 0], [30, 0]], [[0, 2], [0, 60]], [[2, 1], [60, 60]]]],
    [3, [[[1, 1], [30, 20]], [[2, 2], [40, 60]], [[2, 3], [60, 60]], [[0, 1], [0, 30]]]],
    [4, [[[1, 3], [20, 45]], [[1, 2], [15, 40]], [[2, 1], [40, 15]], [[3, 3], [45, 60]]]],
    [5, [[[1, 1], [15, 12]], [[2, 3], [24, 45]], [[3, 4], [45, 48]], [[3, 2], [36, 30]]]],
    [6, [[[2, 5], [24, 50]], [[1, 4], [10, 48]], [[3, 0], [36, 0]], [[6, 1], [60, 12]]]],
    // Sixty does not divide by seven: a seventh guesser's share is rounded to the nearest point, up (3 of 7 is
    // 25.7) or down (2 of 7 is 17.1)
    [7, [[[5, 3], [50, 26]], [[5, 1], [43, 10]], [[6, 7], [60, 60]], [[2, 2], [17, 20]]]],
  ])(
    "a team's points for a round are the share of its guessers who were right, out of 60, and its total their sum: teams of %i",
    async (size, rounds) => {
      const t = newBackend();
      const { roomId, hostId, players } = await teamRoom(t, Array.from({ length: 2 * size - 1 }, () => "en"));
      const teams = [players.filter((_, i) => i % 2 === 0), players.filter((_, i) => i % 2 === 1)];
      const sessionId = await startTeams(t, roomId, hostId, teams);
      const chains = await chainsOf(t, sessionId);

      const totals = [0, 0];
      for (const [r, [right, expected]] of rounds.entries()) {
        const drawer = chains[r].drawerParticipantId!;
        const guessers = teams.map((team) => team.filter((p) => p !== drawer));
        await playRound(t, players, drawer, [...guessers[0].slice(0, right[0]), ...guessers[1].slice(0, right[1])]);

        expect((await chainsOf(t, sessionId))[r].teamRound, `round ${r + 1}`).toEqual([
          { right: right[0], counted: guessers[0].length },
          { right: right[1], counted: guessers[1].length },
        ]);
        totals[0] += expected[0];
        totals[1] += expected[1];
        expect(await points(t, roomId), `after round ${r + 1}`).toEqual(totals);
      }

      // The next round is being drawn when the host ends the game: every round before it keeps its points
      await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
      const standing = [
        { memberIds: teams[0], points: totals[0] },
        { memberIds: teams[1], points: totals[1] },
      ];
      const summary = await teamSummary(t, roomId);
      expect(summary.teams).toEqual(standing);
      expect(summary.rounds.map((round) => round.teamPoints)).toEqual(rounds.map(([, expected]) => expected));
      const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
      expect(replay!.teams).toEqual(standing);
      expect(replay!.chains.map((c) => c.teamPoints)).toEqual(rounds.map(([, expected]) => expected));
      // Every player of the session has a name in the replay: in a team of six or more, someone never draws
      expect(Object.keys(replay!.participants).sort()).toEqual([...players].sort());
    }
  );

  test.each([undefined, "on"])(
    "with the switch %j, the teams' points stand still while a round is open and move when its last guess is in",
    async (value) => {
      if (value !== undefined) vi.stubEnv("LOST_IN_TRANSLATION_HIDE_ANSWER", value);
      const t = newBackend();
      const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
      await playRound(t, players, hostId, [g2, g1, g3]);
      expect(await points(t, roomId)).toEqual([30, 60]);

      /** Everything that tells a client how the teams stand */
      async function board() {
        const status = await t.query(api.games.getGameStatus, { roomId });
        const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
        const session = await t.query(api.games.getActiveGameSession, { roomId });
        return JSON.stringify([
          status!.teams,
          (await post(t, "/api/games/status", { roomId })).body.teams,
          replay!.teams,
          replay!.chains.map((c) => [c.teamPoints, c.teamRound]),
          [session!.teams, session!.teamAway],
          (await chainsOf(t, sessionId)).map((c) => c.teamRound),
        ]);
      }
      const before = await board();
      expect(before).toContain('"points":30');

      // Round 2: G1 draws, and three of the four guesses come in, all of them right
      await draw(t, g1);
      expect(await board()).toBe(before);
      for (const guesser of [hostId, g2, g3]) {
        await guess(t, guesser, "right");
        expect(await board(), "a guess is in").toBe(before);
        // Each player's own score moves at once, as it always did
        expect((await t.query(api.games.getGameStatus, { roomId }))!.scores[guesser].correct).toBeGreaterThan(0);
      }

      await guess(t, g4, "wrong");
      expect(await board()).not.toBe(before);
      expect(await points(t, roomId)).toEqual([30 + 40, 60 + 60]);
    }
  );

  test("one strike: a guess the server closed is a wrong answer once for a player who was playing, and is left out for one who was not", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
    const results = async () => (await chainsOf(t, sessionId)).map((c) => c.teamRound).filter((r) => r !== undefined);
    const away = async () => (await sessionDoc(t, sessionId)).teamAway;
    expect(await away()).toEqual(players);

    // Round 1, the host draws. G3 has not had a turn and does not answer: left out, so team 1 is G1 alone
    await goAway(t, g3);
    await draw(t, hostId);
    for (const guesser of [g1, g2, g4]) await guess(t, guesser, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g2, g4]);
    expect(await results()).toEqual([[{ right: 2, counted: 2 }, { right: 1, counted: 1 }]]);
    expect(await points(t, roomId)).toEqual([60, 60]);
    expect(await away()).toEqual([g3]);

    // Round 2, G1 draws. G3 is back and counts with the answer given. G4 answered round 1 and now does not:
    // a wrong answer for team 0, which is one right out of three
    await beat(t, g3);
    await goAway(t, g4);
    await draw(t, g1);
    await guess(t, hostId, "right");
    await guess(t, g2, "wrong");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g2, g3]);
    expect((await results())[1]).toEqual([{ right: 1, counted: 3 }, { right: 1, counted: 1 }]);
    expect(await points(t, roomId)).toEqual([60 + 20, 60 + 60]);
    expect(await away()).toEqual([g4]);

    // Round 3, G2 draws. G4 misses again: this time left out, so team 0 is the host alone
    await draw(t, g2);
    await guess(t, hostId, "right");
    await guess(t, g1, "wrong");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g2, g3]);
    expect((await results())[2]).toEqual([{ right: 1, counted: 1 }, { right: 1, counted: 2 }]);
    expect(await points(t, roomId)).toEqual([80 + 60, 120 + 30]);
    expect(await away()).toEqual([g4]);

    // Round 4, G3 draws. G4 is back and answers, wrongly: counted again
    await beat(t, g4);
    await playRound(t, players, g3, [hostId, g2, g1]);
    expect((await results())[3]).toEqual([{ right: 2, counted: 3 }, { right: 1, counted: 1 }]);
    expect(await points(t, roomId)).toEqual([140 + 40, 150 + 60]);
    expect(await away()).toEqual([]);

    // A player's own score counts only the guesses they answered, as in any game
    const status = await t.query(api.games.getGameStatus, { roomId });
    expect(status!.scores[g4]).toMatchObject({ correct: 1, total: 2 });
    expect(status!.scores[g3]).toMatchObject({ correct: 2, total: 2 });
  });

  test("the drawer of one round who does not answer the next counts as a wrong answer: a drawing sent is a turn played", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, players, sessionId } = await twoAgainstTwo(t);
    await playRound(t, players, hostId, [g1, g2, g3]);

    await goAway(t, hostId);
    await draw(t, g1);
    await guess(t, g2, "right");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [g1, g2, g3]);

    expect((await chainsOf(t, sessionId))[1].teamRound).toEqual([{ right: 1, counted: 2 }, { right: 1, counted: 1 }]);
    expect(await points(t, roomId)).toEqual([60 + 30, 60 + 60]);
  });

  test("a drawer who sent no drawing and does not answer the next round is left out of it: a drawing not sent is a turn not played", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, players, sessionId } = await twoAgainstTwo(t);
    await playRound(t, players, hostId, [g1, g2, g3]);
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([]);

    // Round 2 is G1's to draw, and G1 is gone: no drawing, and G1 has now missed a turn
    await goAway(t, g1);
    await pass(t, ABSENT_MS, [hostId, g2, g3]);
    expect((await chainsOf(t, sessionId))[1].teamRound).toEqual([{ right: 0, counted: 0 }, { right: 0, counted: 0 }]);
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([g1]);

    // Round 3, G2 draws. G1 answered round 1, but their last turn was the drawing: left out, not a wrong answer,
    // so team 1 is G3 alone
    await draw(t, g2);
    await guess(t, hostId, "right");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g2, g3]);
    expect((await chainsOf(t, sessionId))[2].teamRound).toEqual([{ right: 1, counted: 1 }, { right: 1, counted: 1 }]);
    expect(await points(t, roomId)).toEqual([60 + 60, 60 + 60]);
  });

  test("one strike is each player's own: a teammate who is away does not excuse one who was playing", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, sessionId } = await threeAgainstTwo(t);

    // Round 1, the host draws. G4 has had no turn and does not answer: left out
    await goAway(t, g4);
    await draw(t, hostId);
    for (const guesser of [g1, g2, g3]) await guess(t, guesser, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g2, g3]);
    expect((await chainsOf(t, sessionId))[0].teamRound).toEqual([{ right: 1, counted: 1 }, { right: 2, counted: 2 }]);
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([g4]);

    // Round 2, G1 draws. G2 answered round 1 and now does not: a wrong answer for team 0, while G4 is still left out
    await goAway(t, g2);
    await draw(t, g1);
    await guess(t, hostId, "right");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g3]);
    expect((await chainsOf(t, sessionId))[1].teamRound).toEqual([{ right: 1, counted: 2 }, { right: 1, counted: 1 }]);
    expect(await points(t, roomId)).toEqual([60 + 30, 60 + 60]);
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([g2, g4]);
  });

  test("a round in which a team has nobody counted, and a round nobody drew, give neither team points", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, sessionId } = await twoAgainstTwo(t);
    const chains = await chainsOf(t, sessionId);

    // Round 1, the host draws. G2, team 0's only guesser, has not had a turn and does not answer. Team 1 is
    // right twice, and gets nothing for it: with nobody of team 0 counted the round is void
    await goAway(t, g2);
    await draw(t, hostId);
    await guess(t, g1, "right");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g3]);
    expect((await chainsOf(t, sessionId))[0].teamRound).toEqual([{ right: 0, counted: 0 }, { right: 2, counted: 2 }]);
    expect(await points(t, roomId)).toEqual([0, 0]);

    // Round 2, G1 draws. G2 misses again and is still left out; the host is right, G3 is not
    await draw(t, g1);
    await guess(t, hostId, "right");
    await guess(t, g3, "wrong");
    await pass(t, ABSENT_MS, [hostId, g1, g3]);
    expect(await points(t, roomId)).toEqual([60, 0]);

    // Round 3 is G2's to draw, and is passed over: no drawing, no guesses, no points. Team 1 draws next
    await pass(t, ABSENT_MS, [hostId, g1, g3]);
    expect((await chainsOf(t, sessionId))[2]).toMatchObject({
      status: "complete",
      teamRound: [{ right: 0, counted: 0 }, { right: 0, counted: 0 }],
    });
    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({
      currentRound: 4,
      phase: "drawing",
      drawerName: "G3",
      drawingTeam: 1,
      teams: [{ memberIds: [hostId, g2], points: 60 }, { memberIds: [g1, g3], points: 0 }],
    });
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([g2]);

    // The summary and the replay list a void round with its answers and without points
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    const summary = await teamSummary(t, roomId);
    expect(summary.rounds).toEqual([
      { round: 1, prompt: chains[0].originalPrompt, results: { [g1]: true, [g3]: true } },
      { round: 2, prompt: chains[1].originalPrompt, results: { [hostId]: true, [g3]: false }, teamPoints: [60, 0] },
    ]);
    expect(summary.teams!.map((team) => team.points)).toEqual([60, 0]);
    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.chains.map((c) => c.teamPoints)).toEqual([undefined, [60, 0]]);
    expect(replay!.chains.every((c) => "teamPoints" in c === (c.chainIndex === 1))).toBe(true);
    expect(replay!.teams!.map((team) => team.points)).toEqual([60, 0]);
  });

  test("a round in which team 1 has nobody counted gives neither team points", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, sessionId } = await twoAgainstTwo(t);

    // Round 1, the host draws. G1 and G3, all of team 1, have had no turn and do not answer: both are left out.
    // G2 is right for team 0, which gets nothing for it
    await goAway(t, g1, g3);
    await draw(t, hostId);
    await guess(t, g2, "right");
    await pass(t, ABSENT_MS, [hostId, g2]);
    expect((await chainsOf(t, sessionId))[0].teamRound).toEqual([{ right: 1, counted: 1 }, { right: 0, counted: 0 }]);
    expect(await points(t, roomId)).toEqual([0, 0]);
  });

  /**
   * Two against two, to the end: host and G2 against G1 and G3. Team 0's guessers are always right; team 1's are
   * right in the first `rightRounds` rounds only.
   */
  async function playTeamGame(t: Backend, rightRounds: number) {
    const { roomId, hostId, g1, g2, g3, players, sessionId } = await twoAgainstTwo(t, { level: 2 });
    const chains = await chainsOf(t, sessionId);
    for (const [r, chain] of chains.entries()) {
      await playRound(t, players, chain.drawerParticipantId!, r < rightRounds ? players : [hostId, g2]);
    }
    return { roomId, hostId, g1, g2, g3, players, sessionId, chains };
  }

  test("the summary of a team game names the teams with their points and each round's, after everything it held before", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, chains } = await playTeamGame(t, 4);

    const records = await gameRecords(t, roomId);
    expect(records.filter((r) => !r.startsWith("game_summary:"))).toEqual(["game:Lost in Translation Level 2"]);
    const summary = await teamSummary(t, roomId);
    // `teams` is the last key, and a round's points come after its results
    expect(Object.keys(summary)).toEqual(["gameType", "level", "players", "rounds", "totals", "teams"]);
    expect(summary.teams).toEqual([
      { memberIds: [hostId, g2], points: 600 },
      { memberIds: [g1, g3], points: 240 },
    ]);
    expect(summary.rounds.map((round) => round.teamPoints)).toEqual([
      [60, 60], [60, 60], [60, 60], [60, 60], [60, 0], [60, 0], [60, 0], [60, 0], [60, 0], [60, 0],
    ]);
    expect(Object.keys(summary.rounds[0])).toEqual(["round", "prompt", "results", "teamPoints"]);
    // What a build from before teams reads is what an individual game holds
    expect(summary).toMatchObject({ gameType: "Lost in Translation", level: 2 });
    expect(summary.players).toEqual({
      [hostId]: { name: "Host", avatar: "default" },
      [g1]: { name: "G1", avatar: "fox" },
      [g2]: { name: "G2", avatar: "cat" },
      [g3]: { name: "G3", avatar: "owl" },
    });
    expect(summary.rounds[0]).toEqual({
      round: 1,
      prompt: chains[0].originalPrompt,
      results: { [g1]: true, [g2]: true, [g3]: true },
      teamPoints: [60, 60],
    });
    expect(summary.totals).toEqual({
      [hostId]: { correct: 7, total: 7 },
      [g1]: { correct: 3, total: 7 },
      [g2]: { correct: 8, total: 8 },
      [g3]: { correct: 3, total: 8 },
    });
  });

  test("the replay of a team game has the teams with their points, each round's points, and every player's name and own score", async () => {
    const t = newBackend();
    const { hostId, g1, g2, g3, players, sessionId } = await playTeamGame(t, 4);

    const replay = await post(t, "/api/games/replay", { gameSessionId: sessionId });
    expect(Object.keys(replay.body).sort()).toEqual([...REPLAY_KEYS, "teams"].sort());
    expect(replay.body.session.teams).toEqual([[hostId, g2], [g1, g3]]);
    expect(replay.body.teams).toEqual([
      { memberIds: [hostId, g2], points: 600 },
      { memberIds: [g1, g3], points: 240 },
    ]);
    expect(replay.body.chains.map((c: { teamPoints?: number[] }) => c.teamPoints)).toEqual([
      [60, 60], [60, 60], [60, 60], [60, 60], [60, 0], [60, 0], [60, 0], [60, 0], [60, 0], [60, 0],
    ]);
    for (const chain of replay.body.chains) {
      expect(Object.keys(chain).sort()).toEqual([...CHAIN_KEYS, "steps", "teamPoints", "teamRound"].sort());
    }
    expect(Object.keys(replay.body.participants).sort()).toEqual([...players].sort());
    expect(replay.body.scores).toEqual({
      [hostId]: { correct: 7, total: 7 },
      [g1]: { correct: 3, total: 7 },
      [g2]: { correct: 8, total: 8 },
      [g3]: { correct: 3, total: 8 },
    });
  });

  test("teams level on points are a draw: nothing breaks the tie and nothing names a winner", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, sessionId } = await playTeamGame(t, 10);

    const level = [
      { memberIds: [hostId, g2], points: 600 },
      { memberIds: [g1, g3], points: 600 },
    ];
    const summary = await teamSummary(t, roomId);
    expect(summary.teams).toEqual(level);
    expect(Object.keys(summary.teams![0])).toEqual(["memberIds", "points"]);
    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.teams).toEqual(level);
    expect(JSON.stringify([summary, replay, await sessionDoc(t, sessionId)])).not.toMatch(/winner|tie/i);
  });

  test("the round a Cancel cuts short gives the teams nothing, and the summary and the replay say what the status said", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
    const chains = await chainsOf(t, sessionId);
    await playRound(t, players, hostId, [g2, g1, g3]);
    // Round 2: team 0 has all answered right, and G3 of team 1 has not answered yet
    await draw(t, g1);
    for (const guesser of [hostId, g2, g4]) await guess(t, guesser, "right");
    const status = await t.query(api.games.getGameStatus, { roomId });
    expect(status!.teams).toEqual([
      { memberIds: [hostId, g2, g4], points: 30 },
      { memberIds: [g1, g3], points: 60 },
    ]);

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    const summary = await teamSummary(t, roomId);
    expect(Object.keys(summary)).toEqual(["gameType", "level", "cancelled", "players", "rounds", "totals", "teams"]);
    expect(summary.teams).toEqual(status!.teams);
    // The cut-short round is listed with its answers, which count for each player: only the teams get nothing for it
    expect(summary.rounds).toEqual([
      { round: 1, prompt: chains[0].originalPrompt, results: { [g1]: true, [g2]: true, [g3]: true, [g4]: false }, teamPoints: [30, 60] },
      { round: 2, prompt: chains[1].originalPrompt, results: { [hostId]: true, [g2]: true, [g4]: true } },
    ]);
    expect(summary.totals[hostId]).toEqual({ correct: 1, total: 1 });

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.teams).toEqual(status!.teams);
    expect(replay!.chains.map((c) => c.teamPoints)).toEqual([[30, 60], undefined]);
    expect(replay!.scores[hostId]).toEqual({ correct: 1, total: 1 });
    // Nothing was stored for the round, and its closed guess did not make G3 away
    const stored = await chainsOf(t, sessionId);
    expect(stored.map((c) => c.teamRound !== undefined)).toEqual([true, ...Array.from({ length: 9 }, () => false)]);
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual([]);
  });

  test("the replay of a team game names every player of the session, also those the game never reached", async () => {
    const t = newBackend();
    const { roomId, hostId, players } = await teamRoom(t, Array.from({ length: 11 }, () => "en"));
    const namedIn = async (gameSessionId: SessionId) =>
      Object.keys((await t.query(api.games.getGameReplay, { gameSessionId }))!.participants).sort();

    // An individual game ended at once names the ten players who had a round to draw, as it always did
    const individual = await start(t, roomId, hostId);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    expect(await namedIn(individual)).toEqual(players.slice(0, 10).sort());

    // Six against six: one member of each team has no round to draw
    const inTeams = await startTeams(t, roomId, hostId, "auto");
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    expect(await namedIn(inTeams)).toEqual([...players].sort());
  });

  test("a team game cancelled before anyone answered posts a cancellation and no summary, like any game", async () => {
    const t = newBackend();
    const { roomId, hostId, sessionId } = await threeAgainstTwo(t);
    await draw(t, hostId);

    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });

    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1", "game_cancelled:Lost in Translation"]);
    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.teams!.map((team) => team.points)).toEqual([0, 0]);
  });

  test("a team game whose rounds run out unanswered still ends with the points it had, and those rounds give none", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
    await playRound(t, players, hostId, [g2, g1]);
    await goAway(t, hostId, g1, g2, g3, g4);
    for (let round = 2; round <= 10; round++) await pass(t, ABSENT_MS);

    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete" });
    // Each of the five had a round to draw among those nine: a drawing not sent is a turn not played
    expect((await sessionDoc(t, sessionId)).teamAway).toEqual(players);
    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.teams!.map((team) => team.points)).toEqual([30, 30]);
    const summary = await teamSummary(t, roomId);
    expect(summary.cancelled).toBeUndefined();
    expect(summary.teams!.map((team) => team.points)).toEqual([30, 30]);
    expect(summary.rounds).toHaveLength(1);
  });

  test("a kicked player stays on the team's list, costs the team one wrong answer, and is then left out", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
    await playRound(t, players, hostId, [g2, g1, g3]);
    await t.mutation(api.participants.kickParticipant, { participantId: g4, roomId });

    // Round 2, G1 draws. G4 cannot come back, so the first look closes the guess they were dealt
    await draw(t, g1);
    await guess(t, hostId, "right");
    await guess(t, g2, "right");
    await guess(t, g3, "wrong");
    await pass(t, ROUND_CHECK_MS, [hostId, g1, g2, g3]);
    expect((await chainsOf(t, sessionId))[1].teamRound).toEqual([{ right: 2, counted: 3 }, { right: 0, counted: 1 }]);

    // Round 3, G2 draws: the host is team 0's only counted guesser
    await draw(t, g2);
    await guess(t, hostId, "right");
    await guess(t, g1, "right");
    await guess(t, g3, "right");
    await pass(t, ROUND_CHECK_MS, [hostId, g1, g2, g3]);
    expect((await chainsOf(t, sessionId))[2].teamRound).toEqual([{ right: 1, counted: 1 }, { right: 2, counted: 2 }]);

    expect(await t.query(api.games.getGameStatus, { roomId })).toMatchObject({
      currentRound: 4,
      teams: [
        { memberIds: [hostId, g2, g4], points: 30 + 40 + 60 },
        { memberIds: [g1, g3], points: 60 + 0 + 60 },
      ],
    });
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    // The team still lists the id; the names do not have it, as in any game
    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect(replay!.teams![0].memberIds).toEqual([hostId, g2, g4]);
    expect(Object.keys(replay!.participants).sort()).toEqual([hostId, g1, g2, g3].sort());
    const summary = await teamSummary(t, roomId);
    // The chat card says what the status said: the strike is in the stored result, not in the answers
    expect(summary.teams!.map((team) => team.points)).toEqual([130, 120]);
    expect(summary.rounds.map((round) => round.teamPoints)).toEqual([[30, 60], [40, 0], [60, 60]]);
    expect(summary.teams![0].memberIds).toEqual([hostId, g2, g4]);
    expect(Object.keys(summary.players).sort()).toEqual([hostId, g1, g2, g3].sort());
  });

  test("a game that runs to its end after a void round and a strike posts the points the status had", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, sessionId } = await twoAgainstTwo(t);
    const chains = await chainsOf(t, sessionId);

    // Round 1, the host draws. G2, team 0's only guesser, has had no turn and does not answer: void, with two answers
    await goAway(t, g2);
    await draw(t, hostId);
    await guess(t, g1, "right");
    await guess(t, g3, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g3]);

    // Round 2, G1 draws: everyone answers right
    await beat(t, g2);
    await draw(t, g1);
    for (const guesser of [hostId, g2, g3]) await guess(t, guesser, "right");

    // Round 3, G2 draws. G3 answered round 2 and now does not: a wrong answer for team 1
    await goAway(t, g3);
    await draw(t, g2);
    await guess(t, hostId, "right");
    await guess(t, g1, "right");
    await pass(t, ABSENT_MS, [hostId, g1, g2]);
    expect(await points(t, roomId)).toEqual([120, 90]);

    // Nobody draws rounds 4 to 10, and the game ends by itself
    await goAway(t, hostId, g1, g2, g3);
    for (let round = 4; round <= 10; round++) await pass(t, ABSENT_MS);
    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete" });

    const summary = await teamSummary(t, roomId);
    expect(summary.cancelled).toBeUndefined();
    expect(summary.teams!.map((team) => team.points)).toEqual([120, 90]);
    // The void round is listed with its answers and without points; the strike is in round 3's
    expect(summary.rounds).toEqual([
      { round: 1, prompt: chains[0].originalPrompt, results: { [g1]: true, [g3]: true } },
      { round: 2, prompt: chains[1].originalPrompt, results: { [hostId]: true, [g2]: true, [g3]: true }, teamPoints: [60, 60] },
      { round: 3, prompt: chains[2].originalPrompt, results: { [hostId]: true, [g1]: true }, teamPoints: [60, 30] },
    ]);
  });

  // ── Builds from before teams, in a game that has them ──

  test("a team game sends every field an older build decodes, its own under new keys, and only players in the maps read by player", async () => {
    const t = newBackend();
    const { roomId, hostId, g1, g2, g3, g4, players, sessionId } = await threeAgainstTwo(t);
    const everyone = [...players].sort();
    await playRound(t, players, hostId, [g2, g1, g3]);
    const standing = [
      { memberIds: [hostId, g2, g4], points: 30 },
      { memberIds: [g1, g3], points: 60 },
    ];

    for (const path of ["/api/games/active-session", "/api/games/latest-session"]) {
      const session = await post(t, path, { roomId });
      expect(Object.keys(session.body).sort(), path).toEqual([...SESSION_KEYS, "teamAway", "teams"].sort());
      expect(session.body.playerIds).toEqual(players);
      expect(session.body.teams).toEqual([[hostId, g2, g4], [g1, g3]]);
    }

    const status = await post(t, "/api/games/status", { roomId });
    expect(Object.keys(status.body).sort()).toEqual([...STATUS_KEYS, "drawingTeam", "teams"].sort());
    expect(status.body).toMatchObject({ gameType: "lost-in-translation", level: 1, currentRound: 2, totalRounds: 10, phase: "drawing" });
    expect(status.body.teams).toEqual(standing);
    expect(status.body.drawingTeam).toBe(1);
    // An older host app decodes `scores` as a map of one fixed shape: an entry of any other fails the whole status
    expect(Object.keys(status.body.scores).sort()).toEqual(everyone);
    for (const score of Object.values(status.body.scores)) {
      expect(Object.keys(score as object).sort()).toEqual(["avatar", "correct", "nickname", "total"]);
    }
    expect(status.body.scores[g2]).toEqual({ correct: 1, total: 1, nickname: "G2", avatar: { type: "preset", value: "cat" } });

    await post(t, "/api/games/cancel", { roomId, participantId: hostId });
    const replay = await post(t, "/api/games/replay", { gameSessionId: sessionId });
    expect(Object.keys(replay.body).sort()).toEqual([...REPLAY_KEYS, "teams"].sort());
    expect(replay.body.teams).toEqual(standing);
    expect(Object.keys(replay.body.scores).sort()).toEqual(everyone);
    for (const score of Object.values(replay.body.scores)) expect(Object.keys(score as object).sort()).toEqual(["correct", "total"]);
    expect(replay.body.scores[g4]).toEqual({ correct: 0, total: 1 });
    expect(Object.keys(replay.body.participants).sort()).toEqual(everyone);
    for (const named of Object.values(replay.body.participants)) expect(Object.keys(named as object).sort()).toEqual(["avatar", "nickname"]);

    const summary = await teamSummary(t, roomId);
    expect(Object.keys(summary.players).sort()).toEqual(everyone);
    for (const player of Object.values(summary.players)) expect(Object.keys(player).sort()).toEqual(["avatar", "name"]);
    expect(Object.keys(summary.totals).sort()).toEqual(everyone);
    for (const total of Object.values(summary.totals)) expect(Object.keys(total).sort()).toEqual(["correct", "total"]);
    for (const round of summary.rounds) expect(everyone).toEqual(expect.arrayContaining(Object.keys(round.results)));
  });

  // The reads of "nothing a guesser can read before answering depends on which option is the prompt", in a team game
  // that has a round behind it and points on the board
  test("with the switch on, nothing a reader without a player's token can fetch in a team game depends on which option is the prompt", async () => {
    const t = newBackend();
    const TOKENS = [tokenFor(1), tokenFor(2), tokenFor(3), tokenFor(4)];
    const { roomId, hostId } = await room(t, [], { token: TOKENS[0] });
    const g1 = await joinGuest(t, roomId, "G1", { token: TOKENS[1], language: "ja" });
    const g2 = await joinGuest(t, roomId, "G2", { token: TOKENS[2] });
    const g3 = await joinGuest(t, roomId, "G3", { token: TOKENS[3], language: "ja" });
    const sessionId = await startTeams(t, roomId, hostId, [[hostId, g2], [g1, g3]], { token: TOKENS[0], customPrompts: bank(40) });
    await draw(t, hostId, { token: TOKENS[0] });
    await guess(t, g1, "right", TOKENS[1]);
    await guess(t, g2, "wrong", TOKENS[2]);
    await guess(t, g3, "right", TOKENS[3]);
    // Round 2 is G1's to draw
    const chain = (await chainsOf(t, sessionId))[1];
    vi.stubEnv("LOST_IN_TRANSLATION_HIDE_ANSWER", "on");

    async function everythingReadable(): Promise<string> {
      const seen: unknown[] = [];
      for (const participantId of [hostId, g1, g2, g3]) {
        seen.push(await t.query(api.games.getMyActiveStep, { participantId }));
        seen.push((await post(t, "/api/games/my-active-step", { participantId })).body);
        // A guesser's own token gets her own open guess, and nobody else's step
        seen.push(await t.query(api.games.getMyActiveStep, { participantId, token: TOKENS[2] }));
        seen.push((await post(t, "/api/games/my-active-step", { participantId, callerToken: TOKENS[2] })).body);
      }
      seen.push(await t.query(api.games.getActiveGameSession, { roomId }));
      seen.push((await post(t, "/api/games/active-session", { roomId })).body);
      seen.push(await t.query(api.games.getLatestGameSession, { roomId }));
      seen.push(await t.query(api.games.getGameStatus, { roomId }));
      seen.push((await post(t, "/api/games/status", { roomId })).body);
      seen.push(await t.query(api.games.getGameReplay, { gameSessionId: sessionId }));
      seen.push((await post(t, "/api/games/replay", { gameSessionId: sessionId })).body);
      seen.push((await chatOf(t, roomId)).map((m) => [m.kind, m.text, m.mediaUrl]));
      return JSON.stringify(seen);
    }

    /** Makes another of the round's options its prompt, as if the deal had gone that way */
    async function dealAsPrompt(option: string) {
      await t.run(async (ctx) => {
        await ctx.db.patch(chain._id, { originalPrompt: option });
        const drawStep = (await ctx.db.query("gameSteps").withIndex("by_chainId", (q) => q.eq("chainId", chain._id)).collect())
          .find((s) => s.stepType === "draw")!;
        await ctx.db.patch(drawStep._id, { inputText: option });
      });
    }

    for (const phase of ["drawing", "guessing"] as const) {
      if (phase === "guessing") {
        const step = await t.query(api.games.getMyActiveStep, { participantId: g1, token: TOKENS[1] });
        await t.mutation(api.games.submitGameStep, { stepId: step!._id, participantId: g1, outputDrawingUrl: PNG, token: TOKENS[1] });
      }
      const views = new Set<string>();
      for (const option of chain.options!) {
        await dealAsPrompt(option);
        views.add(await everythingReadable());
      }
      expect(views.size, phase).toBe(1);
      await dealAsPrompt(chain.originalPrompt);
    }
    // The reads are a team game's, with the first round's points among them and G2's own open guess
    const seen = await everythingReadable();
    expect(seen).toContain(`"teams":[{"memberIds":["${hostId}","${g2}"],"points":0},{"memberIds":["${g1}","${g3}"],"points":60}]`);
    expect(seen).toContain('"drawingTeam":1');
    expect(seen).toContain('"stepType":"guess"');
    // The check has teeth: with the switch off the same reads do tell the prompt apart
    vi.stubEnv("LOST_IN_TRANSLATION_HIDE_ANSWER", "off");
    const told = new Set<string>();
    for (const option of chain.options!) {
      await dealAsPrompt(option);
      told.add(await everythingReadable());
    }
    expect(told.size).toBe(4);
  });
});

// ─── Emojifyr ────────────────────────────────────────────────────────────────
// Retired: no current build offers it, but installed host apps still call these functions and routes.

describe("Emojifyr", () => {
  const SENTENCE = "A cat flies to the moon";
  const CLUE = "🐱🚀🌕";

  async function currentRound(t: Backend, sessionId: SessionId) {
    const round = await t.query(api.games.getCurrentEmojifyrRound, { gameSessionId: sessionId });
    if (!round) throw new Error("No open Emojifyr round");
    return round;
  }

  /** The stored round, read past the queries */
  async function roundDoc(t: Backend, roundId: Id<"emojifyrRounds">) {
    const round = await t.run(async (ctx) => await ctx.db.get(roundId));
    if (!round) throw new Error("Round not found");
    return round;
  }

  /** Starts Emojifyr and takes its first round as far as the given status */
  async function emojifyr(t: Backend, roomId: RoomId, hostId: PID, upTo: "writing" | "generating" | "guessing") {
    const sessionId: SessionId = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });
    const roundId = (await currentRound(t, sessionId))._id;
    if (upTo !== "writing") await t.mutation(api.games.submitEmojifyrSentence, { roundId, sentence: SENTENCE });
    if (upTo === "guessing") await t.mutation(api.games.submitEmojifyrEmojiClue, { roundId, emojiClue: CLUE });
    return { sessionId, roundId };
  }

  /** Sets a key and answers every model call. Returns the prompts the functions sent, in order */
  function stubModel(): string[] {
    const prompts: string[] = [];
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal("fetch", async (_url: unknown, init?: RequestInit) => {
      const prompt: string = JSON.parse(String(init?.body)).messages[0].content;
      prompts.push(prompt);
      const text = prompt.startsWith("Translate")
        ? "translated text"
        : prompt.includes("playful one-sentence hint")
          ? "Something furry is going up\nもふもふが上へ"
          : CLUE;
      return new Response(JSON.stringify({ content: [{ type: "text", text }] }), { status: 200 });
    });
    return prompts;
  }

  /** The row of the hourly ceiling every Emojifyr model call shares */
  async function allowanceRows(t: Backend) {
    return await t.run(
      async (ctx) =>
        await ctx.db
          .query("rateLimits")
          .withIndex("by_key", (q) => q.eq("key", "emojifyr:all"))
          .collect()
    );
  }

  /** Records `used` model calls in the hour that starts now */
  async function useAllowance(t: Backend, used: number) {
    await t.run(async (ctx) => {
      await ctx.db.insert("rateLimits", { key: "emojifyr:all", windowStart: Date.now(), count: used });
    });
  }

  test("a round runs from writing through guessing to the reveal, and the next one goes to the next player", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann, ben] } = await room(t, ["Ann", "Ben"]);

    const sessionId: SessionId = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });
    const session = await sessionDoc(t, sessionId);
    expect(session).toMatchObject({ gameType: "emojifyr", status: "active" });
    expect(session.playerOrder![0]).toBe(hostId);
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr"]);
    const round = await currentRound(t, sessionId);
    expect(round).toMatchObject({ roundIndex: 0, status: "writing", writerParticipantId: hostId, maxCharacters: 80 });

    await t.mutation(api.games.submitEmojifyrSentence, { roundId: round._id, sentence: SENTENCE });
    expect(await roundDoc(t, round._id)).toMatchObject({ status: "generating", originalSentence: SENTENCE });

    await t.mutation(api.games.submitEmojifyrEmojiClue, { roundId: round._id, emojiClue: CLUE });
    expect(await roundDoc(t, round._id)).toMatchObject({ status: "guessing", emojiClue: CLUE });

    await t.mutation(api.games.submitEmojifyrGuess, { roundId: round._id, participantId: ann, guessText: "cat rocket" });
    expect((await currentRound(t, sessionId)).status).toBe("guessing");
    await t.mutation(api.games.submitEmojifyrGuess, { roundId: round._id, participantId: ben, guessText: "space cat" });
    expect(await currentRound(t, sessionId)).toMatchObject({ status: "reveal", revealedAt: Date.now() });
    const guesses = await t.query(api.games.getEmojifyrGuesses, { roundId: round._id });
    expect(guesses.map((g) => [g.participantId, g.guessText])).toEqual([[ann, "cat rocket"], [ben, "space cat"]]);

    await t.mutation(api.games.advanceEmojifyrRound, { gameSessionId: sessionId });
    expect((await roundDoc(t, round._id)).status).toBe("complete");
    expect(await currentRound(t, sessionId)).toMatchObject({
      roundIndex: 1,
      status: "writing",
      writerParticipantId: session.playerOrder![1],
    });
    expect(await t.query(api.games.getEmojifyrGameState, { roomId })).toMatchObject({ totalRounds: 2, completedRounds: 1 });
  });

  test("the state the clients poll hides the sentence until the reveal and the clue until the guessing", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const { roundId } = await emojifyr(t, roomId, hostId, "generating");

    let state = await t.query(api.games.getEmojifyrGameState, { roomId });
    expect(state!.currentRound!.status).toBe("generating");
    expect(state!.currentRound!.originalSentence).toBeUndefined();
    expect(state!.currentRound!.emojiClue).toBeUndefined();

    await t.mutation(api.games.submitEmojifyrEmojiClue, { roundId, emojiClue: CLUE });
    state = await t.query(api.games.getEmojifyrGameState, { roomId });
    expect(state!.currentRound!.emojiClue).toBe(CLUE);
    expect(state!.currentRound!.originalSentence).toBeUndefined();

    await t.mutation(api.games.submitEmojifyrGuess, { roundId, participantId: ann, guessText: "cat rocket" });
    state = await t.query(api.games.getEmojifyrGameState, { roomId });
    expect(state!.currentRound).toMatchObject({ status: "reveal", originalSentence: SENTENCE, emojiClue: CLUE });
    expect(state!.guesses).toHaveLength(1);
    expect(state!.participants[ann]).toEqual({ nickname: "Ann", avatar: { type: "preset", value: "fox" } });
  });

  test("a sentence must be 1 to 80 characters", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "writing");

    await expect(t.mutation(api.games.submitEmojifyrSentence, { roundId, sentence: "" })).rejects.toThrow(/between 1 and 80/);
    await expect(t.mutation(api.games.submitEmojifyrSentence, { roundId, sentence: "x".repeat(81) })).rejects.toThrow(
      /between 1 and 80/
    );
    expect((await currentRound(t, sessionId)).status).toBe("writing");

    await t.mutation(api.games.submitEmojifyrSentence, { roundId, sentence: "x".repeat(80) });
    expect((await currentRound(t, sessionId)).status).toBe("generating");
  });

  test("cancelling ends the session and its round and records it in the chat", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "guessing");

    await t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId });

    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true, completedAt: Date.now() });
    expect((await roundDoc(t, roundId)).status).toBe("complete");
    expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getEmojifyrGameState, { roomId })).toBeNull();
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr", "game_cancelled:Emojifyr"]);
  });

  test("Emojifyr asks for no token, even where tokens are enforced", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: tokenFor(1) });
    const ann = await joinGuest(t, roomId, "Ann", { token: tokenFor(2) });
    vi.stubEnv("AUTH_MODE", "enforce");

    const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "guessing");
    await t.mutation(api.games.submitEmojifyrGuess, { roundId, participantId: ann, guessText: "cat rocket" });
    expect((await currentRound(t, sessionId)).status).toBe("reveal");
    await t.mutation(api.games.advanceEmojifyrRound, { gameSessionId: sessionId });
    await t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId });
    expect((await sessionDoc(t, sessionId)).status).toBe("complete");
  });

  // Emojifyr is opened without a token and no current build can close it, so it gives way to a Start. The other
  // way round it does not: a running Lost in Translation game, which only the host may end, keeps Emojifyr out.
  test("Emojifyr and Lost in Translation cannot run together: a Start ends Emojifyr, and each one's queries and Cancel leave the other alone", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const { sessionId } = await emojifyr(t, roomId, hostId, "writing");

    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getLatestGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getGameStatus, { roomId })).toBeNull();
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr"]);

    const litId = await start(t, roomId, hostId);
    // Emojifyr ended as its own Cancel ends it, for the builds that still show it
    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true, completedAt: Date.now() });
    expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getEmojifyrGameState, { roomId })).toBeNull();
    expect(await gameRecords(t, roomId)).toEqual([
      "game:Emojifyr",
      "game_cancelled:Emojifyr",
      "game:Lost in Translation Level 1",
    ]);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toMatchObject({ _id: litId, status: "active" });
    expect(await myStep(t, hostId)).toMatchObject({ stepType: "draw", gameSessionId: litId });

    await expect(t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId })).rejects.toThrow(
      /already in progress/
    );
    expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();
    expect((await sessionDoc(t, litId)).status).toBe("active");
  });

  test("a Start that is refused leaves a running Emojifyr game as it was", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t, ["Ann"], { token: tokenFor(1) });
    const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "guessing");
    const before = await sessionDoc(t, sessionId);

    vi.stubEnv("AUTH_MODE", "enforce");
    await expect(start(t, roomId, hostId)).rejects.toThrow(/Not authorised/);
    await expect(start(t, roomId, ann)).rejects.toThrow(/Only the host can start a game/);
    // Refused after the Emojifyr session was found: nobody is left to play with
    await t.mutation(api.participants.leaveRoom, { participantId: ann });
    await expect(start(t, roomId, hostId, { token: tokenFor(1) })).rejects.toThrow(/at least 2 players/);

    expect(await sessionDoc(t, sessionId)).toEqual(before);
    expect((await roundDoc(t, roundId)).status).toBe("guessing");
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr"]);
  });

  test("when enforced, a guest who starts Emojifyr in the host's name does not shut the host out of Lost in Translation", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: tokenFor(1) });
    await joinGuest(t, roomId, "Ann", { token: tokenFor(2) });
    vi.stubEnv("AUTH_MODE", "enforce");
    // The guest's call: it names the host and carries no token, because the function takes none
    await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });

    // What both clients send when the host presses Start: Cancel, then Start
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId, token: tokenFor(1) });
    await expect(start(t, roomId, hostId, { token: tokenFor(1) })).resolves.toBeTruthy();
  });

  // Cancel and Start are two calls. Were it Cancel that cleared Emojifyr, a caller who reopens it in between would
  // still keep the host out, so it is Start that does, and the host's route with it.
  test("a guest who reopens Emojifyr between the host's Cancel and Start, again and again, never keeps the game from starting", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t, [], { token: tokenFor(1) });
    await joinGuest(t, roomId, "Ann", { token: tokenFor(2) });
    vi.stubEnv("AUTH_MODE", "enforce");

    for (const level of [1, 2, 3]) {
      expect((await post(t, "/api/games/cancel", { roomId, participantId: hostId, callerToken: tokenFor(1) })).status).toBe(200);
      const reopened: SessionId = await t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId });

      const started = await post(t, "/api/games/start", {
        roomId,
        participantId: hostId,
        gameType: "lost-in-translation",
        level,
        customPrompts: bank(40),
        callerToken: tokenFor(1),
      });
      expect(started.status).toBe(200);
      expect(await t.query(api.games.getActiveGameSession, { roomId })).toMatchObject({ _id: started.body.sessionId, level });
      expect(await sessionDoc(t, reopened)).toMatchObject({ status: "complete", cancelled: true });
    }
    expect((await sessionsIn(t, roomId)).filter((s) => s.status === "active")).toHaveLength(1);
  });

  // Emojifyr's rounds are written without a token as well, and at any size. A Start that read them to close them
  // could be pushed over what one transaction may read, and the room kept out of the game that way instead.
  test("an Emojifyr session whose rounds hold more than a transaction may read still gives way to a Start", async () => {
    // Enforces Convex's limits on one transaction (16 MiB read), which newBackend() leaves off
    const t: Backend = convexTest({ schema, modules, transactionLimits: true });
    const { roomId, hostId } = await room(t);
    const { sessionId } = await emojifyr(t, roomId, hostId, "writing");
    for (let i = 0; i < 17; i++) await t.mutation(api.games.advanceEmojifyrRound, { gameSessionId: sessionId });
    const roundIds = await t.run(async (ctx) => (await ctx.db.query("emojifyrRounds").collect()).map((r) => r._id));
    expect(roundIds).toHaveLength(18);
    // Just under the 1 MiB a document may hold, eighteen times
    for (const roundId of roundIds) {
      await t.mutation(api.games.patchEmojifyrRoundTranslation, { roundId, translatedSentence: "x".repeat(1_000_000) });
    }
    await expect(t.run(async (ctx) => (await ctx.db.query("emojifyrRounds").collect()).length)).rejects.toThrow(
      /Read too much data/
    );

    const litId = await start(t, roomId, hostId);

    expect(await sessionDoc(t, sessionId)).toMatchObject({ status: "complete", cancelled: true });
    expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toMatchObject({ _id: litId, status: "active" });
  });

  // Their ids come from the same table as Lost in Translation's, and a running game's id is in what every guest reads
  test("Emojifyr's Cancel and Next round, which take no token, refuse a session that is not Emojifyr's, also over their routes", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);
    const before = { session: await sessionDoc(t, sessionId), chains: await chainsOf(t, sessionId), steps: await stepsOf(t, sessionId) };

    await expect(t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId })).rejects.toThrow(/Not an Emojifyr game/);
    await expect(t.mutation(api.games.advanceEmojifyrRound, { gameSessionId: sessionId })).rejects.toThrow(/Not an Emojifyr game/);
    for (const path of ["/api/emojifyr/cancel", "/api/emojifyr/advance-round"]) {
      const refused = await post(t, path, { gameSessionId: sessionId });
      expect(refused.status).toBe(400);
      expect(refused.body.error).toMatch(/Not an Emojifyr game/);
    }

    expect({ session: await sessionDoc(t, sessionId), chains: await chainsOf(t, sessionId), steps: await stepsOf(t, sessionId) }).toEqual(before);
    expect(await t.run(async (ctx) => await ctx.db.query("emojifyrRounds").collect())).toEqual([]);
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1"]);
    // The game goes on
    const step = await guess(t, ann, "right");
    expect((await stepDoc(t, step._id)).correct).toBe(true);
  });

  // The same holds for a game that is over: its id is in the latest-session query
  test("Emojifyr's Cancel does not touch a finished Lost in Translation game or add to the chat", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    const before = await sessionDoc(t, sessionId);
    await advance(t, 1_000);

    await expect(t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId })).rejects.toThrow(/Not an Emojifyr game/);

    expect(await sessionDoc(t, sessionId)).toEqual(before);
    expect(await gameRecords(t, roomId)).toEqual(["game:Lost in Translation Level 1", "game_cancelled:Lost in Translation"]);
  });

  describe("model calls", () => {
    test("the clue generator returns the model's emoji for a sentence of up to 320 characters, and refuses a longer one unasked", async () => {
      const t = newBackend();
      const prompts = stubModel();

      await expect(t.action(api.games.generateEmojiClue, { sentence: "x".repeat(321) })).rejects.toThrow(/Sentence too long/);
      expect(prompts).toEqual([]);
      expect(await allowanceRows(t)).toEqual([]);

      const longest = "x".repeat(320);
      expect(await t.action(api.games.generateEmojiClue, { sentence: longest })).toEqual({ emojiClue: CLUE });
      expect(prompts).toHaveLength(1);
      expect(prompts[0]).toContain(`Sentence: ${longest}`);
    });

    test("without a key the clue generator fails with a readable error and spends no allowance", async () => {
      const t = newBackend();

      await expect(t.action(api.games.generateEmojiClue, { sentence: SENTENCE })).rejects.toThrow(/ANTHROPIC_API_KEY/);
      expect(await allowanceRows(t)).toEqual([]);
    });

    test("every model call, whichever function makes it, counts against the one hourly allowance", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann] } = await room(t, ["Ann", "Ben"]);
      const { roundId } = await emojifyr(t, roomId, hostId, "generating");
      const prompts = stubModel();

      await t.action(api.games.generateEmojiClue, { sentence: SENTENCE });
      await t.action(api.games.submitEmojifyrEmojiClueWithTranslation, { roundId, emojiClue: CLUE });
      await t.action(api.games.submitEmojifyrGuessWithTranslation, { roundId, participantId: ann, guessText: "cat rocket" });

      // One for the clue, two for its hint and the sentence's translation, one for the guess's translation
      expect(prompts).toHaveLength(4);
      const rows = await allowanceRows(t);
      expect(rows).toHaveLength(1);
      expect(rows[0].count).toBe(4);
    });

    test("the 1500th call of the hour goes through and the next is refused as a rate limit, without asking the model", async () => {
      const t = newBackend();
      const prompts = stubModel();
      await useAllowance(t, 1499);

      expect(await t.action(api.games.generateEmojiClue, { sentence: SENTENCE })).toEqual({ emojiClue: CLUE });
      await expect(t.action(api.games.generateEmojiClue, { sentence: SENTENCE })).rejects.toThrow(/rate limit/);
      expect(prompts).toHaveLength(1);
      expect((await allowanceRows(t))[0].count).toBe(1500);
    });

    // The old host app makes a clue on the device when this route answers 503
    test("the clue route answers 503 once the allowance is used up, and 200 with the clue before that", async () => {
      const t = newBackend();
      stubModel();
      await useAllowance(t, 1499);

      expect(await post(t, "/api/emojifyr/generate-emoji-clue", { sentence: SENTENCE })).toEqual({
        status: 200,
        body: { emojiClue: CLUE },
      });
      const refused = await post(t, "/api/emojifyr/generate-emoji-clue", { sentence: SENTENCE });
      expect(refused.status).toBe(503);
      expect(refused.body.error).toMatch(/rate limit/);
    });

    test("the allowance comes back an hour after its window began", async () => {
      const t = newBackend();
      stubModel();
      await useAllowance(t, 1500);

      await advance(t, 60 * 60_000 - 1);
      await expect(t.action(api.games.generateEmojiClue, { sentence: SENTENCE })).rejects.toThrow(/rate limit/);
      await advance(t, 1);
      expect(await t.action(api.games.generateEmojiClue, { sentence: SENTENCE })).toEqual({ emojiClue: CLUE });
      expect((await allowanceRows(t))[0]).toMatchObject({ count: 1, windowStart: Date.now() });
    });

    test("a clue over 500 characters is refused and the round does not move", async () => {
      const t = newBackend();
      const { roomId, hostId } = await room(t);
      const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "generating");
      const prompts = stubModel();

      await expect(
        t.action(api.games.submitEmojifyrEmojiClueWithTranslation, { roundId, emojiClue: "x".repeat(501) })
      ).rejects.toThrow(/Emoji clue too long/);
      expect((await currentRound(t, sessionId)).status).toBe("generating");
      expect(prompts).toEqual([]);
    });

    test("submitting a clue starts the guessing and adds a hint in both languages and the sentence's translation", async () => {
      const t = newBackend();
      const { roomId, hostId } = await room(t);
      const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "generating");
      const prompts = stubModel();

      await t.action(api.games.submitEmojifyrEmojiClueWithTranslation, { roundId, emojiClue: CLUE });

      expect(await currentRound(t, sessionId)).toMatchObject({
        status: "guessing",
        emojiClue: CLUE,
        hintEn: "Something furry is going up",
        hintJa: "もふもふが上へ",
        translatedSentence: "translated text",
      });
      expect(prompts[0]).toContain(CLUE);
      expect(prompts[1]).toMatch(/^Translate the following English text to Japanese/);
      expect(prompts[1]).toContain(SENTENCE);
    });

    test("over the ceiling a clue still starts the guessing, without a hint or a translation", async () => {
      const t = newBackend();
      const { roomId, hostId } = await room(t);
      const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "generating");
      const prompts = stubModel();
      await useAllowance(t, 1500);

      await t.action(api.games.submitEmojifyrEmojiClueWithTranslation, { roundId, emojiClue: CLUE });

      const round = await currentRound(t, sessionId);
      expect(round).toMatchObject({ status: "guessing", emojiClue: CLUE });
      expect(round.hintEn).toBeUndefined();
      expect(round.translatedSentence).toBeUndefined();
      expect(prompts).toEqual([]);
    });

    test("a guess over 300 characters is refused and not recorded", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann] } = await room(t);
      const { roundId } = await emojifyr(t, roomId, hostId, "guessing");
      const prompts = stubModel();

      await expect(
        t.action(api.games.submitEmojifyrGuessWithTranslation, { roundId, participantId: ann, guessText: "x".repeat(301) })
      ).rejects.toThrow(/Guess too long/);
      expect(await t.query(api.games.getEmojifyrGuesses, { roundId })).toEqual([]);
      expect(prompts).toEqual([]);
    });

    test("a guess is recorded with its translation into the other language", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann] } = await room(t);
      const { roundId } = await emojifyr(t, roomId, hostId, "guessing");
      const prompts = stubModel();

      await t.action(api.games.submitEmojifyrGuessWithTranslation, { roundId, participantId: ann, guessText: "猫のロケット" });

      const [recorded] = await t.query(api.games.getEmojifyrGuesses, { roundId });
      expect(recorded).toMatchObject({ participantId: ann, guessText: "猫のロケット", translatedGuessText: "translated text" });
      expect(prompts[0]).toMatch(/^Translate the following Japanese text to English/);
    });

    test("over the ceiling a guess is still recorded, untranslated, and still ends the round", async () => {
      const t = newBackend();
      const { roomId, hostId, guestIds: [ann] } = await room(t);
      const { sessionId, roundId } = await emojifyr(t, roomId, hostId, "guessing");
      const prompts = stubModel();
      await useAllowance(t, 1500);

      await t.action(api.games.submitEmojifyrGuessWithTranslation, { roundId, participantId: ann, guessText: "cat rocket" });

      const [recorded] = await t.query(api.games.getEmojifyrGuesses, { roundId });
      expect(recorded).toMatchObject({ participantId: ann, guessText: "cat rocket" });
      expect(recorded.translatedGuessText).toBeUndefined();
      expect(prompts).toEqual([]);
      expect((await currentRound(t, sessionId)).status).toBe("reveal");
    });
  });

  test("the old host app's routes run a round from start to cancel", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);

    const started = await post(t, "/api/emojifyr/start", { roomId, createdByParticipantId: hostId });
    expect(started.status).toBe(200);
    const gameSessionId = started.body.sessionId as SessionId;
    expect((await post(t, "/api/emojifyr/active-session", { roomId })).body).toMatchObject({ _id: gameSessionId, gameType: "emojifyr" });
    const round = await post(t, "/api/emojifyr/current-round", { gameSessionId });
    expect(round.body).toMatchObject({ status: "writing", writerParticipantId: hostId });
    const roundId = round.body._id;

    expect(await post(t, "/api/emojifyr/submit-sentence", { roundId, sentence: SENTENCE })).toEqual({ status: 200, body: { ok: true } });
    expect((await post(t, "/api/emojifyr/update-sentence", { roundId, sentence: "A dog flies to the moon" })).status).toBe(200);
    // No key in the test backend: the clue is taken and the hint is skipped
    expect((await post(t, "/api/emojifyr/submit-emoji-clue", { roundId, emojiClue: CLUE })).status).toBe(200);
    expect((await post(t, "/api/emojifyr/submit-guess", { roundId, participantId: ann, guessText: "dog rocket" })).status).toBe(200);

    const state = await post(t, "/api/emojifyr/game-state", { roomId });
    expect(state.body.currentRound).toMatchObject({ status: "reveal", originalSentence: "A dog flies to the moon", emojiClue: CLUE });
    const guesses = await post(t, "/api/emojifyr/guesses", { roundId });
    expect(guesses.body).toHaveLength(1);
    expect(guesses.body[0]).toMatchObject({ participantId: ann, guessText: "dog rocket" });

    expect((await post(t, "/api/emojifyr/advance-round", { gameSessionId })).status).toBe(200);
    expect((await post(t, "/api/emojifyr/current-round", { gameSessionId })).body).toMatchObject({ roundIndex: 1, status: "writing" });
    expect((await post(t, "/api/emojifyr/reveal", { roundId: (await currentRound(t, gameSessionId))._id })).status).toBe(200);
    expect((await currentRound(t, gameSessionId)).status).toBe("reveal");
    expect((await post(t, "/api/emojifyr/cancel", { gameSessionId })).status).toBe(200);
    expect((await post(t, "/api/emojifyr/active-session", { roomId })).body._id).toBeUndefined();
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr", "game_cancelled:Emojifyr"]);
  });
});
