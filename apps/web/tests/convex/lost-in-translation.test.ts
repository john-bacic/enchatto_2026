import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MockInstance } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Backend, joinGuest, newBackend, tokenFor } from "./setup";

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

  // DEFECT: startGame takes the prompts from a custom word bank of ten or more (games.ts:366), but takes every
  // round's wrong options from what is left of the bank once the prompts are picked, whatever its size
  // (games.ts:379-386). A bank of exactly ten, or an empty one, leaves nothing, and Start throws "Cannot read
  // properties of undefined (reading 'text')" at games.ts:394. A bank of 1, 2, 11 or 12 leaves one or two words,
  // and the game starts with the same wrong option two or three times in a round. Thirteen is the smallest bank
  // that works; the host app sends 40. Refusing a small bank in words would be a fix too, and this test would
  // then have to expect the refusal.
  test.fails.each([0, 1, 2, 10, 11, 12])(
    "a custom word bank of %i prompts still gives every round four different options",
    async (size) => {
      const t = newBackend();
      const { roomId, hostId } = await room(t);

      const started = start(t, roomId, hostId, { customPrompts: bank(size) });
      await expect(started).resolves.toBeTruthy();
      for (const chain of await chainsOf(t, await started)) expect(new Set(chain.options).size).toBe(4);
    }
  );
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

  // DEFECT: submitGameStep takes a drawing step that carries no drawing (games.ts:500-540 never checks for one),
  // and the submit-step route turns an empty outputDrawingUrl into exactly that (http.ts:448). The guessers then
  // get a guess step with no picture, and the round is counted in the end-of-game summary (finishRound and
  // cancelGame count every answered guess) but not in the live scores or the replay (both skip a round whose
  // drawing step has no outputDrawingUrl). Neither client sends this: both always attach the canvas image.
  test.fails("a drawing step cannot be submitted without a drawing", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    const step = await openStep(t, hostId, "draw");

    await expect(t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: hostId })).rejects.toThrow();
    expect((await stepDoc(t, step._id)).status).toBe("active");
    expect(await myStep(t, ann)).toBeNull();
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

  // DEFECT: for a custom prompt whose English text is also in the built-in bank, getMyActiveStep shows a
  // Japanese-speaking player the session's own translation (the custom prompts overwrite the built-in map,
  // games.ts:852-857), but submitGameStep scores against the built-in translation and looks at the session's
  // prompts only when there is none (games.ts:546-551). The option the server itself offered as the right one is
  // then scored wrong. Latent today: wherever the host app's word bank and the built-in bank share a text, they
  // share its translation.
  test.fails("a Japanese guess is scored against the translation the player was shown, also for a built-in word", async () => {
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

  // DEFECT: getMyActiveStep returns `correctOption` (the round's prompt) with a guess step that is still open
  // (games.ts:872-885), so a guesser's client holds the answer before the guess is made. The review's security
  // table lists it ("the correct Lost in Translation option before the guess") and the five fix commits left it.
  // Both clients read the field to colour the options on tap (game-task-overlay.tsx:99, GameTaskOverlayView.swift:195),
  // so a fix has to return correctness from the submit instead, and a client from before the fix would stamp every
  // pick "Wrong!".
  test.fails("a guesser's open step does not say which option is right", async () => {
    const t = newBackend();
    const { roomId, hostId, guestIds: [ann] } = await room(t);
    await start(t, roomId, hostId);
    await draw(t, hostId);

    const step = await openStep(t, ann, "guess");
    expect(step.correctOption).toBeUndefined();
  });

  // DEFECT: the same answer from another query. getGameReplay answers for a session that is still running, and
  // once the drawing is in, the round's chain is in it with originalPrompt (games.ts:1081-1096). Both clients ask
  // for the replay only once the session is complete (the web room page's gameReplay query, HostRoomViewModel's
  // "replay" poll), so leaving an unfinished round out needs no client change.
  test.fails("the replay of a running game leaves out the round still being guessed", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const sessionId = await start(t, roomId, hostId);
    await draw(t, hostId);

    const replay = await t.query(api.games.getGameReplay, { gameSessionId: sessionId });
    expect((replay?.chains ?? []).filter((c) => c.status !== "complete").map((c) => c.originalPrompt)).toEqual([]);
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

  test("Emojifyr and Lost in Translation cannot run together, and each one's queries and Cancel leave the other alone", async () => {
    const t = newBackend();
    const { roomId, hostId } = await room(t);
    const { sessionId } = await emojifyr(t, roomId, hostId, "writing");

    await expect(start(t, roomId, hostId)).rejects.toThrow(/already in progress/);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getLatestGameSession, { roomId })).toBeNull();
    expect(await t.query(api.games.getGameStatus, { roomId })).toBeNull();
    await t.mutation(api.games.cancelGame, { roomId, participantId: hostId });
    expect((await sessionDoc(t, sessionId)).status).toBe("active");
    expect(await gameRecords(t, roomId)).toEqual(["game:Emojifyr"]);

    await t.mutation(api.games.cancelEmojifyr, { gameSessionId: sessionId });
    await start(t, roomId, hostId);
    await expect(t.mutation(api.games.startEmojifyr, { roomId, createdByParticipantId: hostId })).rejects.toThrow(
      /already in progress/
    );
    expect(await t.query(api.games.getActiveEmojifyrSession, { roomId })).toBeNull();
  });

  // DEFECT: an Emojifyr session shuts Lost in Translation out of its room for good. startGame refuses while any
  // session is active (games.ts:334-338), cancelGame leaves an Emojifyr session alone (games.ts:693-694), and no
  // current build has a screen that calls cancelEmojifyr. Emojifyr asks for no token (CLAUDE.md), and every
  // participant id is on every guest's screen, so with tokens enforced a guest can still start it in the host's
  // name. The host's Start then fails with "A game is already in progress" until the room is closed. The test
  // above pins the two behaviours this rests on, so a fix changes that test too.
  test.fails("when enforced, a guest who starts Emojifyr in the host's name does not shut the host out of Lost in Translation", async () => {
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
