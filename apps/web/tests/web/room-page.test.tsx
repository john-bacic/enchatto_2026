import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getFunctionName, type FunctionReference, type FunctionReturnType } from "convex/server";
import { TEXTURES } from "@/lib/textures";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// The guest's room page (app/room/[roomId]/page.tsx), whole: its default export rendered to static markup with
// react-dom/server, as a browser draws it the first time its subscriptions have answered. convex/react and
// next/navigation are replaced: a query answers from a table keyed by function name, and nothing reaches a server.
// Each state is one snapshot of three things: every query the render asked for with its arguments ("skip" too),
// every mutation it asked for, and the markup. The two lists are sorted, so the order hooks are called in is free.
// The answers are written by hand after what the functions answer for a room in that state, and are typed as the
// functions' own return types: an answer the functions could no longer give fails `npm run typecheck`.
//
// No effect runs in a static render (see CLAUDE.md) and nothing is tapped. So this covers what the page draws from
// its queries and the link it was opened with, and which functions it subscribes to with which arguments. It does
// not cover: what a handler does and which mutation it calls with what, the order and the work of the effects
// (presence, the redirects, saved display settings, the offline queue), and anything behind a tap or an arriving
// message (the settings sheet, the leave dialog, the Resume buttons, the game picker, the replay sheet, floaters,
// the join cut-in, the vibe card, a queued message, the reply bar, the results of a game the page watched end).
//
// Of what stands behind a tap or a message, the section "Behind a tap, or after a message has arrived" holds the
// part the page's own view components draw (components/room): the settings sheet, the leave dialog, the vibe card,
// the count of queued messages, the join cut-in, the results of a game of Emoji Match the page watched end and the
// Resume buttons, each component rendered by itself with props such as the page hands it. That the tap or the
// message brings them up, and that the page hands them those props, is still not covered.
//
// Where the game picker, the replay sheet and the join cut-in stand among the room's layers is held in "the games
// together": a first render draws none of them, so the page is rendered there with a mark in place of each.
//
// The last section calls the rule of the End Game button by itself (lib/end-game.ts): which game a tap ends. It is
// the one thing here that is called and not drawn.
//
// When the page is meant to draw something else, `npx vitest run tests/web/room-page.test.tsx -u` (from apps/web)
// rewrites the snapshots, and their diff is the change to read.

// ─── The page's surroundings ─────────────────────────────────────────────────

/** What each function the page and its children subscribe to answers. One that is left out has not answered yet */
interface Answers {
  "rooms:getRoomState"?: FunctionReturnType<typeof api.rooms.getRoomState>;
  "messages:getRoomMessages"?: FunctionReturnType<typeof api.messages.getRoomMessages>;
  "games:getActiveGameSession"?: FunctionReturnType<typeof api.games.getActiveGameSession>;
  "games:getMyActiveStep"?: FunctionReturnType<typeof api.games.getMyActiveStep>;
  "games:getLatestGameSession"?: FunctionReturnType<typeof api.games.getLatestGameSession>;
  "games:getGameReplay"?: FunctionReturnType<typeof api.games.getGameReplay>;
  "games:getGameStatus"?: FunctionReturnType<typeof api.games.getGameStatus>;
  "wordRush:getState"?: FunctionReturnType<typeof api.wordRush.getState>;
  "emojiMatch:getActiveEmojiMatch"?: FunctionReturnType<typeof api.emojiMatch.getActiveEmojiMatch>;
  "emojiBingo:getActiveEmojiBingo"?: FunctionReturnType<typeof api.emojiBingo.getActiveEmojiBingo>;
  "truthOrDare:getActiveTruthOrDare"?: FunctionReturnType<typeof api.truthOrDare.getActiveTruthOrDare>;
  /** Asked once for each message, so it answers by message */
  "reactions:getReactionSummary"?: (args: { messageId: string }) => FunctionReturnType<typeof api.reactions.getReactionSummary>;
}

// Shared with the two mocks below, which vitest lifts above the imports
const browser = vi.hoisted(() => ({
  answers: {} as Record<string, unknown>,
  search: new URLSearchParams(),
  queries: [] as string[],
  mutations: [] as string[],
}));

/** A value as the lists show it: keys in alphabetical order, and a key that holds undefined still there */
function written(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(written).join(", ")}]`;
  const fields = value as Record<string, unknown>;
  return `{${Object.keys(fields).sort().map((key) => `${key}: ${written(fields[key])}`).join(", ")}}`;
}

vi.mock("next/navigation", () => ({
  // ROOM, below
  useParams: () => ({ roomId: "room1" }),
  useSearchParams: () => browser.search,
  useRouter: () => ({ replace: () => {}, push: () => {} }),
}));

vi.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: unknown }) => children,
  ConvexReactClient: class {},
  useQuery: (query: FunctionReference<"query">, args: unknown) => {
    const name = getFunctionName(query);
    browser.queries.push(`${name} ${args === "skip" ? "skip" : written(args)}`);
    if (args === "skip") return undefined;
    const answer = browser.answers[name];
    return typeof answer === "function" ? answer(args) : answer;
  },
  useMutation: (mutation: FunctionReference<"mutation">) => {
    browser.mutations.push(getFunctionName(mutation));
    return async () => {
      throw new Error("A static render calls no mutation");
    };
  },
}));

const NOW = Date.parse("2026-10-03T12:00:00Z");

beforeEach(() => {
  // The page and what it imports keep state in their modules (the tokens read so far, the voice speed): every
  // render starts from a page load
  vi.resetModules();
  browser.answers = {};
  browser.search = new URLSearchParams();
  browser.queries = [];
  browser.mutations = [];
  // The page needs a deployment to name. Whatever else the machine's environment says about a deployment or a
  // build stays out of the render
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://example.convex.cloud");
  for (const name of ["NEXT_PUBLIC_CONVEX_LEGACY_URL", "NEXT_PUBLIC_GIT_SHA", "NEXT_PUBLIC_VERCEL_URL"]) vi.stubEnv(name, "");
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── What is kept of a render ────────────────────────────────────────────────

/** The texture's name in place of its tile: the tile is a data URL of up to 4,000 characters, in every state */
function withoutTextureTile(html: string) {
  return html.replace(/url\(&quot;data:image\/svg\+xml,(.*?)&quot;\)/g, (_, tile: string) => {
    const texture = TEXTURES.find((t) => encodeURIComponent(t.svg) === tile.replaceAll("&#x27;", "'"));
    return `url(texture ${texture?.key ?? "unknown"})`;
  });
}

/** Chatto is the same 25 shapes wherever it stands: what is kept is its svg tag and whether its arm waves */
function withoutMascotShapes(html: string) {
  return html.replace(
    /(<svg class="ec-mascot[^>]*>)(.*?)<\/svg>/g,
    (_, tag: string, shapes: string) => `${tag}${shapes.includes('<g class="wave">') ? "waving" : "not waving"}</svg>`
  );
}

/**
 * Markup with a line for each tag, indented by how deep it is, so that a change shows as the lines it touches.
 * An element that holds nothing, or only text, stays on one line.
 */
function lines(html: string) {
  const parts = html.match(/<[^>]+>|[^<]+/g) ?? [];
  const isClose = (part: string | undefined) => part?.startsWith("</") === true;
  const isOpen = (part: string) => part.startsWith("<") && !part.startsWith("</") && !part.endsWith("/>");
  const out: string[] = [];
  let depth = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (isClose(part)) depth--;
    const indent = " ".repeat(depth);
    if (isOpen(part)) {
      const closedAt = isClose(parts[i + 1]) ? i + 1 : !parts[i + 1]?.startsWith("<") && isClose(parts[i + 2]) ? i + 2 : null;
      if (closedAt !== null) {
        out.push(indent + parts.slice(i, closedAt + 1).join(""));
        i = closedAt;
        continue;
      }
      depth++;
    }
    out.push(indent + part);
  }
  return out.join("\n");
}

/** The browser a render happens in. It is online and holds no caller token unless this says otherwise */
type Where = { offline?: boolean; tokens?: Record<string, string> };

/**
 * What `element` asks for and draws in the browser `where`: the queries and the mutations it asked for, and its
 * markup. `element` imports what it draws when it is called, which is after the modules were reset, so that what is
 * drawn and what renders it share one copy of React.
 */
async function render(element: () => Promise<ReactElement>, where: Where = {}) {
  // What the page asks of a browser while it renders: that there is a window, whether it is online, and the
  // caller tokens it keeps
  const kept: Record<string, string> = where.tokens ?? {};
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("navigator", { onLine: !where.offline, userAgent: "vitest", maxTouchPoints: 0 });
  vi.stubGlobal("localStorage", { getItem: (key: string) => kept[key] ?? null, setItem: () => {}, removeItem: () => {} });
  const said: string[] = [];
  for (const level of ["log", "info", "warn", "error"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => void said.push(String(args[0])));
  }

  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(await element());

  // React says for each background that its layout effect does not run in a static render. Nothing else may be
  // said: a warning about a key or an attribute is a defect of the page
  expect(said.filter((line) => !line.startsWith("Warning: useLayoutEffect does nothing on the server"))).toEqual([]);
  return [
    "queries",
    ...browser.queries.sort().map((line) => `  ${line}`),
    "mutations",
    ...browser.mutations.sort().map((line) => `  ${line}`),
    "markup",
    lines(withoutMascotShapes(withoutTextureTile(html))),
  ].join("\n");
}

/** The page in a browser that opened the link `?search`, once `answers` have arrived */
async function open(search: Record<string, string>, answers: Answers, where: Where = {}) {
  browser.search = new URLSearchParams(search);
  browser.answers = answers as Record<string, unknown>;
  return render(async () => {
    const { default: RoomPage } = await import("@/app/room/[roomId]/page");
    return <RoomPage />;
  }, where);
}

// ─── The room and the people in it ───────────────────────────────────────────

type RoomState = NonNullable<Answers["rooms:getRoomState"]>;
type Room = RoomState["room"];
type Person = RoomState["participants"][number];
type Message = NonNullable<Answers["messages:getRoomMessages"]>[number];
type PID = Id<"participants">;

const ROOM = "room1" as Id<"rooms">;
const HOST = "alex" as PID;
const YUKI = "yuki" as PID;
const SAM = "sam" as PID;
const MIKA = "mika" as PID;
const JO = "jo" as PID;

/** A time `seconds` before the fixed clock */
const ago = (seconds: number) => NOW - seconds * 1000;
/** A file as the server's storage serves it */
const file = (name: string) => `https://example.convex.cloud/api/storage/${name}`;

const room = (extra: Partial<Room> = {}): Room => ({
  _id: ROOM,
  _creationTime: ago(3600),
  joinCode: "QKNUL4",
  status: "active",
  settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 10 },
  hostId: HOST,
  createdAt: ago(3600),
  background: 4,
  ...extra,
});

/** A web guest who is in the room and has it in front of them */
const guest = (id: PID, nickname: string, avatar: string, language: string): Person => ({
  _id: id,
  _creationTime: ago(3000),
  roomId: ROOM,
  nickname,
  role: "participant",
  platform: "web",
  avatar: { type: "preset", value: avatar },
  preferredLanguage: language,
  online: true,
  presence: "online",
  lastSeenAt: ago(5),
  joinedAt: ago(3000),
});

// The host, who opened the room on an iPhone an hour ago
const alex: Person = { ...guest(HOST, "Alex", "fox", "en"), role: "host", platform: "ios", _creationTime: ago(3600), joinedAt: ago(3600) };
const yuki = guest(YUKI, "Yuki", "cat", "ja");
const sam = guest(SAM, "Sam", "whale", "en");
const mika = guest(MIKA, "Mika", "panda", "ja");
const jo = guest(JO, "Jo", "owl", "en");

/** A message of the room. `fields` holds its kind, its status and what that kind carries */
const message = (id: string, senderId: PID, secondsAgo: number, fields: Pick<Message, "kind" | "status"> & Partial<Message>): Message => ({
  _id: id as Id<"messages">,
  _creationTime: ago(secondsAgo),
  roomId: ROOM,
  senderId,
  createdAt: ago(secondsAgo),
  ...fields,
});

/** A line the server writes into the chat when someone joins or leaves */
const arrival = (id: string, senderId: PID, secondsAgo: number, text: string) =>
  message(id, senderId, secondsAgo, { kind: "system", status: "processed", text, processedAt: ago(secondsAgo) });

/** A line a game writes into the chat: that it started or ended, or its summary. The host's, with no processedAt */
const gameLine = (id: string, secondsAgo: number, text: string) => message(id, HOST, secondsAgo, { kind: "system", status: "processed", text });

const joins = [arrival("m1", YUKI, 3000, "join:Yuki"), arrival("m2", SAM, 2900, "join:Sam")];

/** The room with Alex, Yuki and Sam in it, where nobody has written and no game has been played */
const quiet = (extra: Answers = {}): Answers => ({
  "rooms:getRoomState": { room: room(), participants: [alex, yuki, sam] },
  "messages:getRoomMessages": joins,
  "games:getActiveGameSession": null,
  "games:getMyActiveStep": null,
  "games:getLatestGameSession": null,
  "wordRush:getState": null,
  "emojiMatch:getActiveEmojiMatch": null,
  "emojiBingo:getActiveEmojiBingo": null,
  "truthOrDare:getActiveTruthOrDare": null,
  "reactions:getReactionSummary": () => [],
  ...extra,
});

// ─── The games ───────────────────────────────────────────────────────────────

type Session = NonNullable<Answers["games:getLatestGameSession"]>;
type Step = NonNullable<Answers["games:getMyActiveStep"]>;
type Status = NonNullable<Answers["games:getGameStatus"]>;
type Replay = NonNullable<Answers["games:getGameReplay"]>;
type MatchGame = NonNullable<Answers["emojiMatch:getActiveEmojiMatch"]>;
type BingoGame = NonNullable<Answers["emojiBingo:getActiveEmojiBingo"]>;
type DareGame = NonNullable<Answers["truthOrDare:getActiveTruthOrDare"]>;
type DareTurn = NonNullable<DareGame["currentTurn"]>;
type RushGame = NonNullable<Answers["wordRush:getState"]>;

// Lost in Translation: Alex started a game of ten rounds for the three of them two minutes ago, with thirty
// seconds to draw in

const SESSION = "session1" as Id<"gameSessions">;
const session = (extra: Partial<Session> = {}): Session => ({
  _id: SESSION,
  _creationTime: ago(120),
  roomId: ROOM,
  gameType: "lost-in-translation",
  status: "active",
  createdByParticipantId: HOST,
  playerIds: [HOST, YUKI, SAM],
  chainCount: 10,
  level: 1,
  timerEnabled: 30,
  createdAt: ago(120),
  ...extra,
});

/** Yuki's open step. A draw step and a guess step carry different things, so `fields` holds them */
const step = (id: string, chain: string, fields: Pick<Step, "stepIndex" | "stepType" | "round" | "options" | "correctOption"> & Partial<Step>): Step => ({
  _id: id as Id<"gameSteps">,
  _creationTime: ago(120),
  gameSessionId: SESSION,
  chainId: chain as Id<"gameChains">,
  assignedParticipantId: YUKI,
  status: "active",
  createdAt: ago(120),
  inputText: undefined,
  hintText: undefined,
  chainMaxSteps: 3,
  level: 1,
  totalRounds: 10,
  timerEnabled: 30,
  ...fields,
});

/** Round 1 after Alex has drawn "Cat": Yuki's four answers, in her language */
const guessStep = (extra: Partial<Step> = {}) =>
  step("step2", "chain1", {
    stepIndex: 1,
    stepType: "guess",
    round: 1,
    inputDrawingUrl: file("round-1"),
    options: ["猫", "星", "家", "ドラゴン"],
    correctOption: "猫",
    ...extra,
  });

const score = (p: Person, correct: number, total: number) => ({ correct, total, nickname: p.nickname, avatar: p.avatar });

/** Round 1 while Yuki and Sam guess Alex's drawing */
const guessing: Status = {
  gameType: "lost-in-translation",
  level: 1,
  currentRound: 1,
  totalRounds: 10,
  phase: "guessing",
  drawerName: "Alex",
  drawerAvatar: alex.avatar,
  guessesSubmitted: 0,
  guessesTotal: 2,
  scores: { [HOST]: score(alex, 0, 0), [YUKI]: score(yuki, 0, 0), [SAM]: score(sam, 0, 0) },
  timerSeconds: 30,
  drawStartedAt: null,
};

const litStarted = gameLine("m3", 120, "game:Lost in Translation Level 1");
// The server posts each round's drawing into the chat as its drawer's message
const firstDrawing = message("m4", HOST, 100, { kind: "drawing", status: "processed", mediaUrl: file("round-1") });

// Emoji Match: Alex opened a lobby a minute and a half ago, and Yuki joined it

const matchSeat = (p: Person, pairs: number, turns: number): MatchGame["players"][number] => ({
  participantId: p._id,
  nickname: p.nickname,
  avatarValue: p.avatar.value,
  joinedAt: ago(90),
  isActive: true,
  score: pairs,
  turns,
});

/** The lobby. A game past the lobby adds its board, its turns and its scores */
const matchGame = (extra: Partial<MatchGame> = {}): MatchGame => ({
  _id: "match1" as Id<"emojiMatchGames">,
  _creationTime: ago(90),
  roomId: ROOM,
  status: "lobby",
  hostParticipantId: HOST,
  players: [matchSeat(alex, 0, 0), matchSeat(yuki, 0, 0)],
  turnOrder: [],
  board: [],
  selectedCardIds: [],
  matchedPairCount: 0,
  totalPairs: 0,
  boardRows: 0,
  boardCols: 0,
  mismatchRevealMs: 1200,
  createdAt: ago(90),
  ...extra,
});

// Sixteen cards as dealt: each pair is one emoji, once with its English word and once with its Japanese one
// prettier-ignore
const DEALT: Array<[pair: number, emoji: string, label: string]> = [
  [0, "☀️", "Sun"], [4, "☂️", "かさ"], [0, "☀️", "たいよう"], [6, "⛄", "ゆきだるま"],
  [1, "🐝", "Bee"], [5, "🌸", "はな"], [1, "🐝", "はち"], [7, "🐶", "いぬ"],
  [2, "☁️", "Cloud"], [5, "🌸", "Flower"], [2, "☁️", "くも"], [6, "⛄", "Snowman"],
  [3, "🐼", "Panda"], [7, "🐶", "Dog"], [3, "🐼", "パンダ"], [4, "☂️", "Umbrella"],
];
/** The board with the cards of `matchedPairs` found, and the cards at `faceUp` turned over */
const board = (matchedPairs: number[], faceUp: number[] = []): MatchGame["board"] =>
  DEALT.map(([pair, value, label], i) => ({
    cardId: `card_${i}`,
    pairKey: `pair_${pair}`,
    content: { kind: "emoji", value, label },
    isMatched: matchedPairs.includes(pair),
    isRevealed: matchedPairs.includes(pair) || faceUp.includes(i),
  }));
/** What starting the game adds to the lobby */
const matchDealt = { turnOrder: [HOST, YUKI], totalPairs: 8, boardRows: 4, boardCols: 4, startedAt: ago(60), turnTimeoutMs: 15000, idleTimeouts: 0 };
/** The game twenty seconds after its last pair was found: Alex won with five pairs in six turns, Yuki has three in five */
const matchFinished = matchGame({
  ...matchDealt,
  status: "completed",
  players: [matchSeat(alex, 5, 6), matchSeat(yuki, 3, 5)],
  currentTurnParticipantId: HOST,
  board: board([0, 1, 2, 3, 4, 5, 6, 7]),
  matchedPairCount: 8,
  turnStartedAt: ago(20),
  endedAt: ago(20),
  result: { winnerParticipantIds: [HOST], isTie: false, endReason: "all_matched" },
});

// Emoji Bingo: the same lobby, of another game

const FREE = "⭐";
// prettier-ignore
const ALEX_CARD = ["🦋", "🐱", "🐳", "🚃", "☂️", "🐰", "🐶", "📺", "⚡", "👑", "📷", "🦭", FREE, "🍞", "🐑", "🍰", "🪼", "🌙", "🥨", "💎", "🍉", "🍦", "🌠", "🐼", "🐹"];
// prettier-ignore
const YUKI_CARD = ["🚗", "🍦", "🌸", "🍰", "⛄", "🍉", "👑", "🪼", "🚃", "👻", "🐑", "🌠", FREE, "🐕", "🍞", "🎀", "📷", "⚡", "🐢", "🐶", "🐥", "🍀", "🌷", "📺", "☀️"];
// The 48 emojis in the order they are called
// prettier-ignore
const DECK = ["⚡", "🍞", "🚗", "🐝", "🍦", "☀️", "🍉", "🐱", "📺", "📷", "🐢", "🐷", "🦭", "☂️", "🐼", "🦋", "🎵", "🐶", "☕", "👑", "🌸", "✏️", "🥨", "🪼", "🐈", "☁️", "❓", "🐳", "🐻", "💡", "👻", "🚃", "🐑", "🌠", "🎀", "🐹", "🎁", "⛄", "💎", "🐥", "🌙", "🏠", "🍒", "🐕", "🍀", "🐰", "🍰", "🌷"];
// What each has marked once twenty emojis are called. Yuki's are a line: the diagonal through the free centre
const ALEX_MARKS = [12, 8, 13, 21, 20, 1, 7, 10, 11, 4, 23, 0, 6, 9];
const YUKI_MARKS = [12, 17, 14, 0, 1, 24, 5, 23, 16, 18, 19, 6];

const bingoSeat = (p: Person, card: string[], markedCells: number[], placement = 0): BingoGame["players"][number] => ({
  participantId: p._id,
  nickname: p.nickname,
  avatarValue: p.avatar.value,
  joinedAt: ago(90),
  card,
  markedCells,
  placement,
});

/** The lobby: cards are dealt when the game starts */
const bingoGame = (extra: Partial<BingoGame> = {}): BingoGame => ({
  _id: "bingo1" as Id<"emojiBingoGames">,
  _creationTime: ago(90),
  roomId: ROOM,
  status: "lobby",
  hostParticipantId: HOST,
  winPattern: "line",
  callIntervalMs: 3000,
  turnOrder: [],
  turnTimeoutMs: 10000,
  players: [bingoSeat(alex, [], []), bingoSeat(yuki, [], [])],
  drawDeck: [],
  calledEmojis: [],
  drawIndex: 0,
  createdAt: ago(90),
  ...extra,
});

/** The game after `calls` emojis, with Alex to roll. Clients are sent the deck with the emojis still to come left blank */
const bingoAfter = (calls: number, extra: Partial<BingoGame>): BingoGame =>
  bingoGame({
    turnOrder: [HOST, YUKI],
    currentTurnParticipantId: HOST,
    drawDeck: DECK.map((emoji, i) => (i < calls ? emoji : "")),
    calledEmojis: DECK.slice(0, calls),
    drawIndex: calls,
    startedAt: ago(80),
    ...extra,
  });

// Truth or Dare: Alex started a game a minute ago. Yuki is first, then Sam, then Alex

const DARE = "dare1" as Id<"truthOrDareGames">;
const dareTurn = (id: string, index: number, participantId: PID, extra: Partial<DareTurn> = {}): DareTurn => ({
  _id: id as Id<"truthOrDareTurns">,
  _creationTime: ago(60),
  gameId: DARE,
  turnIndex: index,
  participantId,
  status: "waiting_for_choice",
  createdAt: ago(60),
  responseMediaUrl: undefined,
  responseStorageId: undefined,
  ...extra,
});
const dareSeat = (p: Person) => ({ participantId: p._id, nickname: p.nickname, avatarValue: p.avatar.value, online: p.online });

/** The game at its first turn, before Yuki has chosen */
const dareGame = (extra: Partial<DareGame> = {}): DareGame => ({
  _id: DARE,
  _creationTime: ago(60),
  roomId: ROOM,
  status: "active",
  hostParticipantId: HOST,
  promptMode: "normal",
  playerOrder: [YUKI, SAM, HOST],
  currentTurnIndex: 0,
  currentTurnParticipantId: YUKI,
  createdAt: ago(60),
  currentTurn: dareTurn("turn1", 0, YUKI),
  completedTurns: 0,
  completedTurnsList: [],
  totalTurns: 1,
  playerInfo: [dareSeat(yuki), dareSeat(sam), dareSeat(alex)],
  ...extra,
});
const dareStarted = gameLine("m3", 60, "game:Truth or Dare");
// A prompt is stored in both languages
const DARE_PROMPT = JSON.stringify({ en: "What is your favorite food?", ja: "好きな食べ物は何？" });

// Word Rush: Alex opened a lobby half a minute ago, and Yuki joined it. An English speaker learns Japanese

const rushSeat = (p: Person, learning: "en" | "ja"): RushGame["players"][number] => ({
  participantId: p._id,
  nickname: p.nickname,
  avatarValue: p.avatar.value,
  learning,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correct: 0,
  sayItBonus: 0,
});

/** The lobby, with its ten cards dealt */
const rushGame = (extra: Partial<RushGame> = {}): RushGame => ({
  _id: "rush1" as Id<"wordRushGames">,
  roomId: ROOM,
  status: "lobby",
  hostParticipantId: HOST,
  pack: "mix",
  sayIt: false,
  cardsReady: true,
  players: [rushSeat(alex, "ja"), rushSeat(yuki, "en")],
  totalCards: 10,
  cardIndex: 0,
  phase: "clues",
  phaseSeq: 0,
  phaseStartedAt: ago(30),
  phaseEndsAt: ago(30),
  emojiStepMs: 2500,
  card: null,
  answers: [],
  performer: null,
  votedIds: [],
  verdict: null,
  teachClip: null,
  endedAt: null,
  ...extra,
});

// ─── Before the room is on screen ────────────────────────────────────────────

describe("before the room is on screen", () => {
  // 64 hex characters, as lib/convex.tsx makes them
  const TOKEN = "5e".repeat(32);

  test("nothing has answered yet: the loading screen", async () => {
    expect(await open({ pid: YUKI }, {})).toMatchSnapshot();
  });

  test("the room has answered that it is gone, the messages have not answered: still the loading screen", async () => {
    expect(await open({ pid: YUKI }, { "rooms:getRoomState": null })).toMatchSnapshot();
  });

  test("the room is gone: room not found", async () => {
    expect(await open({ pid: YUKI }, quiet({ "rooms:getRoomState": null, "messages:getRoomMessages": [] }))).toMatchSnapshot();
  });

  test("the room is gone and the link names nobody: room not found, not join required", async () => {
    expect(await open({}, quiet({ "rooms:getRoomState": null, "messages:getRoomMessages": [] }))).toMatchSnapshot();
  });

  test("a link that names nobody: join required", async () => {
    expect(await open({}, quiet())).toMatchSnapshot();
  });

  test("a link made for a browser that holds a token, opened in one that does not: join required, and no step is asked for", async () => {
    expect(await open({ pid: YUKI, tk: "1" }, quiet())).toMatchSnapshot();
  });

  test("the same link in the browser that holds the token: the room, and the token goes with the step query", async () => {
    // Under the key lib/convex.tsx keeps a participant's token at
    expect(await open({ pid: YUKI, tk: "1" }, quiet(), { tokens: { [`enchatto_token_${YUKI}`]: TOKEN } })).toMatchSnapshot();
  });

  test("a room the host has closed: the closed header and input bar", async () => {
    // Closing a room takes everyone in it offline
    const gone = (p: Person): Person => ({ ...p, online: false, departed: true });
    const closed = quiet({
      "rooms:getRoomState": { room: room({ status: "closed", closedAt: ago(30) }), participants: [alex, yuki, sam].map(gone) },
    });
    expect(await open({ pid: YUKI }, closed)).toMatchSnapshot();
  });
});

// ─── The chat ────────────────────────────────────────────────────────────────

describe("the chat", () => {
  // A conversation with a message of every kind: a translated text with suggestions and reactions, a reply, a text
  // whose translation failed, a picture, a drawing, a voice message whose transcript is still being translated,
  // someone who came and left, and a text still waiting for its translation
  const conversation: Message[] = [
    ...joins,
    message("m3", HOST, 600, {
      kind: "text",
      status: "processed",
      text: "Hello everyone!",
      processing: { translatedText: "みなさん、こんにちは！", romaji: "minasan, konnichiwa!", suggestions: ["こんにちは！", "よろしくね"] },
      processedAt: ago(598),
    }),
    message("m4", YUKI, 580, {
      kind: "text",
      status: "processed",
      text: "はじめまして",
      replyToId: "m3" as Id<"messages">,
      processing: { translatedText: "Nice to meet you", romaji: "hajimemashite" },
      processedAt: ago(578),
    }),
    message("m5", SAM, 560, { kind: "text", status: "failed", text: "Where is everyone from?", processing: { error: "Translation failed" }, processedAt: ago(555) }),
    message("m6", SAM, 540, { kind: "image", status: "processed", mediaUrl: file("photo"), processedAt: ago(540) }),
    message("m7", YUKI, 520, { kind: "drawing", status: "processed", mediaUrl: file("drawing"), processedAt: ago(520) }),
    message("m8", SAM, 500, {
      kind: "audio",
      status: "pending",
      text: "Good morning",
      mediaUrl: file("voice"),
      audioStorageId: "voice" as Id<"_storage">,
      durationMs: 3200,
      waveform: [0.1, 0.5, 0.9, 0.4],
    }),
    arrival("m9", MIKA, 480, "join:Mika"),
    arrival("m10", MIKA, 470, "leave:Mika"),
    message("m11", YUKI, 120, { kind: "text", status: "pending", text: "みんなはどこから来ましたか？" }),
  ];
  // Sam is typing, Jo has the tab in the background, and Mika has left
  const everyone: Person[] = [alex, yuki, { ...sam, typingAction: "typing" }, { ...mika, online: false, departed: true }, { ...jo, presence: "away" }];
  const talking = quiet({
    "rooms:getRoomState": { room: room(), participants: everyone },
    "messages:getRoomMessages": conversation,
    "reactions:getReactionSummary": ({ messageId }) =>
      messageId === "m3"
        ? [
            { emoji: "👍", count: 2, participantIds: [YUKI, SAM] },
            { emoji: "🔥", count: 1, participantIds: [SAM] },
          ]
        : [],
  });

  test("a guest who reads Japanese, with a message of every kind", async () => {
    expect(await open({ pid: YUKI }, talking)).toMatchSnapshot();
  });

  test("the same conversation for a guest who reads English", async () => {
    expect(await open({ pid: SAM }, talking)).toMatchSnapshot();
  });

  test("the same conversation for the host", async () => {
    expect(await open({ pid: HOST }, talking)).toMatchSnapshot();
  });

  test("ten quick messages back and forth between two languages: the hype layer and the combo", async () => {
    // One a second up to the fixed clock, English from Alex and Japanese from Yuki in turn
    const rally = Array.from({ length: 10 }, (_, i) =>
      message(`m${i + 3}`, i % 2 ? YUKI : HOST, 9 - i, {
        kind: "text",
        status: "processed",
        text: i % 2 ? "いいね！" : "Nice!",
        processing: i % 2 ? { translatedText: "Nice!", romaji: "ii ne!" } : { translatedText: "いいね！", romaji: "ii ne!" },
        processedAt: ago(9 - i),
      })
    );
    expect(await open({ pid: YUKI }, quiet({ "messages:getRoomMessages": [...joins, ...rally] }))).toMatchSnapshot();
  });

  test("a browser that is offline: the banner", async () => {
    expect(await open({ pid: YUKI }, quiet(), { offline: true })).toMatchSnapshot();
  });

  test("a browser that is offline while a game is on: the banner, above the game's status bar", async () => {
    // Round 1 of Lost in Translation: Yuki has guessed Alex's drawing, rightly, and waits for Sam's guess
    const answers = quiet({
      "messages:getRoomMessages": [...joins, litStarted, firstDrawing],
      "games:getActiveGameSession": session(),
      "games:getLatestGameSession": session(),
      "games:getGameStatus": { ...guessing, guessesSubmitted: 1, scores: { ...guessing.scores, [YUKI]: score(yuki, 1, 1) } },
    });
    expect(await open({ pid: YUKI }, answers, { offline: true })).toMatchSnapshot();
  });
});

// ─── Lost in Translation ─────────────────────────────────────────────────────

describe("Lost in Translation", () => {
  test("a guess: Alex's drawing with four answers in the guesser's language, and the status bar", async () => {
    const answers = quiet({
      "messages:getRoomMessages": [...joins, litStarted, firstDrawing],
      "games:getActiveGameSession": session(),
      "games:getLatestGameSession": session(),
      "games:getGameStatus": guessing,
      "games:getMyActiveStep": guessStep(),
    });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });

  describe("round 2, which Yuki draws", () => {
    const drawing: Status = {
      ...guessing,
      currentRound: 2,
      phase: "drawing",
      drawerName: "Yuki",
      drawerAvatar: yuki.avatar,
      guessesTotal: 0,
      scores: { [HOST]: score(alex, 0, 0), [YUKI]: score(yuki, 1, 1), [SAM]: score(sam, 0, 1) },
      drawStartedAt: ago(8),
    };
    // Yuki's page told the room eight seconds ago that she is drawing
    const round2 = quiet({
      "rooms:getRoomState": { room: room(), participants: [alex, { ...yuki, typingAction: "drawing", drawingStartedAt: ago(8) }, sam] },
      "messages:getRoomMessages": [...joins, litStarted, firstDrawing],
      "games:getActiveGameSession": session(),
      "games:getLatestGameSession": session(),
      "games:getGameStatus": drawing,
    });

    test("for Yuki: the word, its hint and the canvas", async () => {
      const draw = step("step4", "chain2", {
        stepIndex: 0,
        stepType: "draw",
        round: 2,
        inputText: "お化け",
        hintText: "怖い",
        options: ["お化け", "ロボット", "ヘビ", "花"],
        correctOption: "お化け",
      });
      expect(await open({ pid: YUKI }, { ...round2, "games:getMyActiveStep": draw })).toMatchSnapshot();
    });

    test("for the host, who waits: Yuki is drawing with twenty-two of the game's thirty seconds left, and the game can be ended", async () => {
      expect(await open({ pid: HOST }, round2)).toMatchSnapshot();
    });
  });

  test("a team game: both teams in the status bar, and the guesser's team on the answer sheet", async () => {
    const teams = [
      [SAM, MIKA],
      [HOST, YUKI, JO],
    ];
    const inTeams = session({ playerIds: [HOST, YUKI, SAM, MIKA, JO], teams, teamAway: [HOST, YUKI, SAM, MIKA, JO] });
    // Alex, of Team Grape, drew. Sam has answered and was right; a round's points come when it ends
    const status: Status = {
      ...guessing,
      guessesSubmitted: 1,
      guessesTotal: 4,
      scores: { [HOST]: score(alex, 0, 0), [YUKI]: score(yuki, 0, 0), [SAM]: score(sam, 1, 1), [MIKA]: score(mika, 0, 0), [JO]: score(jo, 0, 0) },
      teams: [
        { memberIds: teams[0], points: 0 },
        { memberIds: teams[1], points: 0 },
      ],
      drawingTeam: 1,
    };
    const answers = quiet({
      "rooms:getRoomState": { room: room(), participants: [alex, yuki, sam, mika, jo] },
      "messages:getRoomMessages": [
        ...joins,
        arrival("m3", MIKA, 2800, "join:Mika"),
        arrival("m4", JO, 2700, "join:Jo"),
        gameLine("m5", 120, "game:Lost in Translation Level 1"),
        { ...firstDrawing, _id: "m6" as Id<"messages"> },
      ],
      "games:getActiveGameSession": inTeams,
      "games:getLatestGameSession": inTeams,
      "games:getGameStatus": status,
      "games:getMyActiveStep": guessStep({ chainMaxSteps: 5 }),
    });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });

  /** Round 1 was played, then the host ended the game a minute ago. `since` is what was written in the chat after that */
  const endedGame = (since: Message[]): Answers => {
    const ended = session({ status: "complete", cancelled: true, completedAt: ago(60) });
    const chain = "chain1" as Id<"gameChains">;
    const played = { _creationTime: ago(120), gameSessionId: SESSION, chainId: chain, status: "submitted" as const, createdAt: ago(120) };
    const replay: Replay = {
      session: ended,
      chains: [
        {
          _id: chain,
          _creationTime: ago(120),
          gameSessionId: SESSION,
          chainIndex: 0,
          originalPrompt: "Cat",
          options: ["Cat", "Star", "House", "Dragon"],
          drawerParticipantId: HOST,
          status: "complete",
          currentStepIndex: 1,
          maxSteps: 3,
          steps: [
            { ...played, _id: "step1" as Id<"gameSteps">, stepIndex: 0, stepType: "draw", assignedParticipantId: HOST, inputText: "Cat", outputDrawingUrl: file("round-1"), submittedAt: ago(100) },
            { ...played, _id: "step2" as Id<"gameSteps">, stepIndex: 1, stepType: "guess", assignedParticipantId: YUKI, outputText: "猫", selectedOption: "猫", correct: true, submittedAt: ago(90) },
            { ...played, _id: "step3" as Id<"gameSteps">, stepIndex: 2, stepType: "guess", assignedParticipantId: SAM, outputText: "Star", selectedOption: "Star", correct: false, submittedAt: ago(85) },
          ],
        },
      ],
      participants: {
        [HOST]: { nickname: "Alex", avatar: alex.avatar },
        [YUKI]: { nickname: "Yuki", avatar: yuki.avatar },
        [SAM]: { nickname: "Sam", avatar: sam.avatar },
      },
      scores: { [HOST]: { correct: 0, total: 0 }, [YUKI]: { correct: 1, total: 1 }, [SAM]: { correct: 0, total: 1 } },
      // For the words of all ten rounds, played or not
      // prettier-ignore
      promptTranslations: {
        Apple: "りんご", Banana: "バナナ", Bird: "鳥", Cake: "ケーキ", Car: "車", Cat: "猫", Dog: "犬", Dragon: "ドラゴン", Fish: "魚", Flower: "花",
        Ghost: "お化け", House: "家", Moon: "月", Pizza: "ピザ", Robot: "ロボット", Rocket: "ロケット", Snake: "ヘビ", Star: "星", Sun: "太陽", Tree: "木",
      },
    };
    const summary = {
      gameType: "Lost in Translation",
      level: 1,
      cancelled: true,
      players: { [HOST]: { name: "Alex", avatar: "fox" }, [YUKI]: { name: "Yuki", avatar: "cat" }, [SAM]: { name: "Sam", avatar: "whale" } },
      rounds: [{ round: 1, prompt: "Cat", results: { [YUKI]: true, [SAM]: false } }],
      totals: replay.scores,
    };
    return quiet({
      "messages:getRoomMessages": [...joins, litStarted, firstDrawing, gameLine("m5", 60, `game_summary:${JSON.stringify(summary)}`), ...since],
      "games:getLatestGameSession": ended,
      "games:getGameReplay": replay,
    });
  };

  // The summary is the last message: the button stands at the end of the chat
  test("a game the host ended after one round: its summary card and the button to its results, and the replay is asked for", async () => {
    expect(await open({ pid: YUKI }, endedGame([]))).toMatchSnapshot();
  });

  test("a game the host ended after one round: its summary card, the button to its results above what was written since, and the replay is asked for", async () => {
    // Sam wrote half a minute after the game ended. The button stands where the game ended, above his message,
    // and not at the end of the chat
    const since = message("m6", SAM, 30, {
      kind: "text",
      status: "processed",
      text: "Good game!",
      processing: { translatedText: "いいゲームだったね！", romaji: "ii geemu datta ne!" },
      processedAt: ago(28),
    });
    expect(await open({ pid: YUKI }, endedGame([since]))).toMatchSnapshot();
  });
});

// ─── Emoji Match ─────────────────────────────────────────────────────────────

describe("Emoji Match", () => {
  const started = gameLine("m3", 60, "game:Emoji Match");

  test("the lobby, for a player who has joined it", async () => {
    expect(await open({ pid: YUKI }, quiet({ "emojiMatch:getActiveEmojiMatch": matchGame() }))).toMatchSnapshot();
  });

  test("a game in play, for the host whose turn it is: one pair found and one card turned over", async () => {
    const playing = matchGame({
      ...matchDealt,
      status: "active",
      players: [matchSeat(alex, 1, 1), matchSeat(yuki, 0, 0)],
      currentTurnParticipantId: HOST,
      board: board([0], [1]),
      selectedCardIds: ["card_1"],
      matchedPairCount: 1,
      turnStartedAt: ago(4),
    });
    const answers = quiet({ "messages:getRoomMessages": [...joins, started], "emojiMatch:getActiveEmojiMatch": playing });
    expect(await open({ pid: HOST }, answers)).toMatchSnapshot();
  });

  test("a finished game the page did not see being played: no results screen on a first render, only its card in the chat", async () => {
    const summary = {
      gameType: "Match Emoji",
      games: [
        {
          players: [
            { name: "Alex", avatar: "fox", score: 5, isWinner: true },
            { name: "Yuki", avatar: "cat", score: 3, isWinner: false },
          ],
          totalPairs: 8,
          isTie: false,
        },
      ],
    };
    const answers = quiet({
      "messages:getRoomMessages": [...joins, started, gameLine("m4", 20, `emoji_match_summary:${JSON.stringify(summary)}`)],
      "emojiMatch:getActiveEmojiMatch": matchFinished,
    });
    expect(await open({ pid: HOST }, answers)).toMatchSnapshot();
  });
});

// ─── Emoji Bingo ─────────────────────────────────────────────────────────────

describe("Emoji Bingo", () => {
  const started = gameLine("m3", 80, "game:Emoji Bingo");

  test("the lobby, for someone in the room who has not joined it", async () => {
    expect(await open({ pid: SAM }, quiet({ "emojiBingo:getActiveEmojiBingo": bingoGame() }))).toMatchSnapshot();
  });

  test("a game in play, for a player who waits for the host to roll: six emojis called", async () => {
    const playing = bingoAfter(6, {
      status: "active",
      players: [bingoSeat(alex, ALEX_CARD, [12, 8, 13, 21]), bingoSeat(yuki, YUKI_CARD, [12, 17, 14, 0, 1, 24])],
      turnStartedAt: ago(3),
    });
    const answers = quiet({ "messages:getRoomMessages": [...joins, started], "emojiBingo:getActiveEmojiBingo": playing });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });

  test("after the first bingo, for the host who plays on for second place", async () => {
    const won = bingoAfter(20, {
      status: "won",
      players: [bingoSeat(alex, ALEX_CARD, ALEX_MARKS), bingoSeat(yuki, YUKI_CARD, YUKI_MARKS, 1)],
      turnStartedAt: ago(2),
      firstBingoAt: ago(2),
    });
    const answers = quiet({ "messages:getRoomMessages": [...joins, started], "emojiBingo:getActiveEmojiBingo": won });
    expect(await open({ pid: HOST }, answers)).toMatchSnapshot();
  });

  test("a game that ran out of emojis: unlike Emoji Match, its results are on screen on a first render", async () => {
    const over = bingoAfter(48, {
      status: "completed",
      players: [bingoSeat(alex, ALEX_CARD, ALEX_MARKS), bingoSeat(yuki, YUKI_CARD, YUKI_MARKS, 1)],
      turnTimeoutMs: 15000,
      startedAt: ago(200),
      turnStartedAt: ago(35),
      firstBingoAt: ago(120),
      endedAt: ago(20),
    });
    const summary = {
      gameType: "Emoji Bingo",
      games: [
        {
          players: [
            { name: "Alex", avatar: "fox", score: 14, isWinner: false },
            { name: "Yuki", avatar: "cat", score: 12, isWinner: true },
          ],
          totalPairs: 25,
          isTie: false,
        },
      ],
    };
    const answers = quiet({
      "messages:getRoomMessages": [...joins, gameLine("m3", 200, "game:Emoji Bingo"), gameLine("m4", 20, `emoji_match_summary:${JSON.stringify(summary)}`)],
      "emojiBingo:getActiveEmojiBingo": over,
    });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });
});

// ─── Truth or Dare ───────────────────────────────────────────────────────────

describe("Truth or Dare", () => {
  test("my turn: truth or dare?", async () => {
    const answers = quiet({ "messages:getRoomMessages": [...joins, dareStarted], "truthOrDare:getActiveTruthOrDare": dareGame() });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });

  test("another player's turn, for the host: Yuki chose truth and is answering", async () => {
    const answering = dareGame({
      currentTurn: dareTurn("turn1", 0, YUKI, { status: "waiting_for_response", choice: "truth", promptId: "n_t_001", promptText: DARE_PROMPT, promptResponseType: "text" }),
    });
    const answers = quiet({ "messages:getRoomMessages": [...joins, dareStarted], "truthOrDare:getActiveTruthOrDare": answering });
    expect(await open({ pid: HOST }, answers)).toMatchSnapshot();
  });

  test("a game the host ended: no screen, and one summary card in the chat, made from the game", async () => {
    const ratings = [
      { participantId: HOST, score: 4 },
      { participantId: SAM, score: 4 },
    ];
    const ended = dareGame({
      status: "completed",
      completedAt: ago(20),
      currentTurnIndex: 1,
      currentTurnParticipantId: SAM,
      currentTurn: dareTurn("turn2", 1, SAM, { _creationTime: ago(30), createdAt: ago(30) }),
      completedTurns: 1,
      completedTurnsList: [
        { _id: "turn1" as Id<"truthOrDareTurns">, participantId: YUKI, choice: "truth", promptText: DARE_PROMPT, responseText: "寿司が大好きです", ratings, completedAt: ago(40) },
      ],
      totalTurns: 2,
    });
    // The server also writes the summary into the chat as a line of the host's, which the page leaves out
    const summary = {
      gameType: "Truth or Dare",
      totalTurns: 1,
      players: [
        { name: "Yuki", avatar: "cat", avgRating: 4, turnsRated: 1 },
        { name: "Sam", avatar: "whale", avgRating: null, turnsRated: 0 },
        { name: "Alex", avatar: "fox", avgRating: null, turnsRated: 0 },
      ],
    };
    const answers = quiet({
      "messages:getRoomMessages": [...joins, dareStarted, gameLine("m4", 20, `truth_or_dare_summary:${JSON.stringify(summary)}`)],
      "truthOrDare:getActiveTruthOrDare": ended,
    });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });
});

// ─── Word Rush ───────────────────────────────────────────────────────────────

describe("Word Rush", () => {
  test("a lobby a guest opened, for the room's host: the room's host has the game host's buttons too", async () => {
    const yukis = rushGame({ hostParticipantId: YUKI, players: [rushSeat(yuki, "en"), rushSeat(alex, "ja")] });
    expect(await open({ pid: HOST }, quiet({ "wordRush:getState": yukis }))).toMatchSnapshot();
  });

  test("the first card, a second and a half into its clues, for a player who learns English", async () => {
    const playing = rushGame({
      status: "active",
      phaseSeq: 1,
      phaseStartedAt: ago(1.5),
      phaseEndsAt: ago(-13.5),
      card: {
        emoji: ["🏮", "👘", "🍧"],
        choicesEn: ["new year", "beach trip", "summer festival", "fireworks"],
        choicesJa: [
          { ja: "お正月", kana: "おしょうがつ", romaji: "oshōgatsu" },
          { ja: "花見", kana: "はなみ", romaji: "hanami" },
          { ja: "海水浴", kana: "かいすいよく", romaji: "kaisuiyoku" },
          { ja: "夏祭り", kana: "なつまつり", romaji: "natsumatsuri" },
        ],
        reveal: null,
      },
    });
    const answers = quiet({ "messages:getRoomMessages": [...joins, gameLine("m3", 2, "game:Word Rush")], "wordRush:getState": playing });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });
});

// ─── More than one game, and none ────────────────────────────────────────────

describe("the games together", () => {
  test("all five open at once, which the server allows: every game's screen, in the page's order", async () => {
    // Two lobbies and a Word Rush lobby opened, then Truth or Dare started, then Lost in Translation, whose first
    // drawing Yuki is guessing
    const answers = quiet({
      "messages:getRoomMessages": [...joins, dareStarted, { ...litStarted, _id: "m4" as Id<"messages"> }, { ...firstDrawing, _id: "m5" as Id<"messages"> }],
      "games:getActiveGameSession": session(),
      "games:getLatestGameSession": session(),
      "games:getGameStatus": guessing,
      "games:getMyActiveStep": guessStep(),
      "wordRush:getState": rushGame(),
      "emojiMatch:getActiveEmojiMatch": matchGame(),
      "emojiBingo:getActiveEmojiBingo": bingoGame(),
      "truthOrDare:getActiveTruthOrDare": dareGame(),
    });
    expect(await open({ pid: YUKI }, answers)).toMatchSnapshot();
  });

  test("a canceled Emoji Match lobby and a canceled Emoji Bingo lobby, for the host: nothing on screen, and no game to end", async () => {
    const answers = quiet({
      "messages:getRoomMessages": [...joins, gameLine("m3", 80, "game_cancelled:Match Emoji")],
      "emojiMatch:getActiveEmojiMatch": matchGame({
        status: "canceled",
        players: [matchSeat(alex, 0, 0)],
        result: { winnerParticipantIds: [], isTie: false, endReason: "canceled" },
        endedAt: ago(80),
      }),
      "emojiBingo:getActiveEmojiBingo": bingoGame({ status: "canceled", players: [bingoSeat(alex, [], [])], endedAt: ago(70) }),
    });
    expect(await open({ pid: HOST }, answers)).toMatchSnapshot();
  });

  // The game picker and the replay sheet draw nothing while they are closed, and the join cut-in nothing until
  // somebody joins, so no render above shows where they stand among the room's layers. It matters: the picker's
  // backdrop and the replay's share a z-index, as do the wrapper of the Resume buttons and the cut-in, and of two
  // such layers the later one in the document is on top. The replay opens by itself when a game ends and covers an
  // open picker, and a cut-in passes over the Resume buttons. Here each of the three is replaced by a mark that is
  // always drawn. The wrapper of the Resume buttons is drawn in every render, and is found by its style: fixed, at
  // the z-index it shares with the cut-in
  describe("the order of the layers that a first render does not draw", () => {
    // The marks are for this render alone: resetting the modules keeps a replacement, and tests below draw the
    // real cut-in
    afterEach(() => {
      for (const path of ["@/components/game-picker-modal", "@/components/game-replay-modal", "@/components/room/join-cut-in"]) vi.doUnmock(path);
    });

    test("the Resume buttons, then the game picker, then the replay over it, then the join cut-in", async () => {
      vi.doMock("@/components/game-picker-modal", () => ({ GamePickerModal: () => <i data-layer="picker" /> }));
      vi.doMock("@/components/game-replay-modal", () => ({ GameReplayModal: () => <i data-layer="replay" /> }));
      vi.doMock("@/components/room/join-cut-in", () => ({ JoinCutIn: () => <i data-layer="cut-in" /> }));
      const page = await open({ pid: HOST }, quiet());
      const layers = [...page.matchAll(/data-layer="([a-z-]+)"|<div style="position:fixed;[^"]*z-index:150;/g)].map((found) => found[1] ?? "resume");
      expect(layers).toEqual(["resume", "picker", "replay", "cut-in"]);
    });
  });
});

// ─── Behind a tap, or after a message has arrived ────────────────────────────

// What the page's own view components draw in states no first render of the page reaches. Each is rendered by
// itself, with props such as the page hands it: in the quiet room, or with the games a test names. What a tap would
// call does nothing here
describe("what a first render of the page does not reach, each view component by itself", () => {
  const nothing = () => {};

  test("the display settings sheet of a guest who reads Japanese, with romaji off and medium text: the debug panel closed, asking for nothing", async () => {
    const sheet = await render(async () => {
      const { DisplaySettingsSheet } = await import("@/components/room/display-settings-sheet");
      return (
        <DisplaySettingsSheet
          setShowDisplaySettings={nothing}
          me={yuki}
          lang="ja"
          showEnglish
          toggleDisplay={nothing}
          showJapanese
          showRomaji={false}
          chatSize="m"
          pickChatSize={nothing}
          setShowLeaveConfirm={nothing}
          convexUrl="https://example.convex.cloud"
          roomId={ROOM}
        />
      );
    });
    expect(sheet).toMatchSnapshot();
  });

  test("the same sheet in a deployed build, for a guest who reads English: the build's commit and address under the deployment's name", async () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_SHA", "abc1234");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "enchatto.vercel.app");
    const sheet = await render(async () => {
      const { DisplaySettingsSheet } = await import("@/components/room/display-settings-sheet");
      return (
        <DisplaySettingsSheet
          setShowDisplaySettings={nothing}
          me={sam}
          lang="en"
          showEnglish
          toggleDisplay={nothing}
          showJapanese
          showRomaji
          chatSize="s"
          pickChatSize={nothing}
          setShowLeaveConfirm={nothing}
          convexUrl="https://example.convex.cloud"
          roomId={ROOM}
        />
      );
    });
    expect(sheet).toMatchSnapshot();
  });

  test("the leave dialog", async () => {
    const dialog = await render(async () => {
      const { LeaveConfirm } = await import("@/components/room/leave-confirm");
      return <LeaveConfirm setShowLeaveConfirm={nothing} lang="ja" handleLeave={async () => {}} />;
    });
    expect(dialog).toMatchSnapshot();
  });

  test("the header with the vibe card open under its badge", async () => {
    // Three messages in the last minute, each in the other language than the one before it: three messages and two
    // changes of language, times the 1.15 of a combo of three, is (3 × 12 + 2 × 20) × 1.15 = 87
    const people = [alex, yuki, sam];
    const header = await render(async () => {
      const { RoomHeader } = await import("@/components/room/room-header");
      return (
        <RoomHeader
          me={yuki}
          setShowDisplaySettings={nothing}
          lang="ja"
          logoHop={0}
          hype={false}
          isClosed={false}
          onlineCount={3}
          awayCount={0}
          vibeRef={{ current: null }}
          setShowVibeInfo={nothing}
          showVibeInfo
          vibe={87}
          recentCount={3}
          switches={2}
          mult={1.15}
          closeVibeInfo={nothing}
          participants={people}
          participantId={YUKI}
          roomState={{ room: room(), participants: people }}
          setShowLeaveConfirm={nothing}
        />
      );
    });
    expect(header).toMatchSnapshot();
  });

  test("the offline banner while two messages wait to be sent: their count", async () => {
    // As the outbox keeps them: an id of its own making, and no answer from a server yet
    const waiting = [
      { id: "queued-1", kind: "text" as const, text: "こんにちは", createdAt: ago(20) },
      { id: "queued-2", kind: "text" as const, text: "聞こえますか？", createdAt: ago(10) },
    ];
    const banner = await render(async () => {
      const { OfflineBanner } = await import("@/components/room/offline-banner");
      return <OfflineBanner lang="ja" offlineQueue={waiting} />;
    });
    expect(banner).toMatchSnapshot();
  });

  describe("Mika joins", () => {
    test("for a guest who reads Japanese: the cut-in with her avatar", async () => {
      const cutIn = await render(async () => {
        const { JoinCutIn } = await import("@/components/room/join-cut-in");
        return <JoinCutIn cutIn={{ key: "m3", name: "Mika", avatar: "panda" }} lang="ja" confettiKey={null} />;
      });
      expect(cutIn).toMatchSnapshot();
    });

    test("for a guest who reads English, before the room lists her: the line in capitals, and no avatar", async () => {
      const cutIn = await render(async () => {
        const { JoinCutIn } = await import("@/components/room/join-cut-in");
        return <JoinCutIn cutIn={{ key: "m3", name: "Mika", avatar: "" }} lang="en" confettiKey={null} />;
      });
      expect(cutIn).toMatchSnapshot();
    });

    test("while the room is in hype: fifty pieces of confetti after the cut-in", async () => {
      const cutIn = await render(async () => {
        const { JoinCutIn } = await import("@/components/room/join-cut-in");
        return <JoinCutIn cutIn={{ key: "m3", name: "Mika", avatar: "panda" }} lang="ja" confettiKey="m3" />;
      });
      const [banner, confetti, ...more] = cutIn.split("\n").filter((line) => line.startsWith("<div"));
      expect(banner).toMatch(/^<div class="ec-cutin"/);
      expect(confetti).toBe('<div class="ec-confetti" aria-hidden="true">');
      expect(more).toEqual([]);
      expect(cutIn.split("\n").filter((line) => line.startsWith(" <i style="))).toHaveLength(50);
    });
  });

  // Emoji Match's results are for a page that saw the game played, which no first render has. Here the game's layer
  // is handed the finished game as a page hands it: emojiMatchOnScreen says whether that page watched it end
  describe("a game of Emoji Match that ended while the page watched", () => {
    const later = async () => {};
    /** What a render gives when nothing is drawn */
    const EMPTY = ["queries", "mutations", "markup", ""].join("\n");
    /** The layer in `viewer`'s page. `state` is what that page keeps about the game */
    const layer = (viewer: Person, state: { emojiMatchOnScreen: boolean; dismissedEmojiMatchId: string | null }) =>
      render(async () => {
        const { EmojiMatchLayer } = await import("@/components/room/emoji-match-layer");
        return (
          <EmojiMatchLayer
            emojiMatchGame={matchFinished}
            emojiMatchOnScreen={state.emojiMatchOnScreen}
            dismissedEmojiMatchId={state.dismissedEmojiMatchId}
            participants={[alex, yuki, sam]}
            participantId={viewer._id}
            me={viewer}
            lang={viewer.preferredLanguage}
            handleJoinEmojiMatchLobby={later}
            handleLeaveEmojiMatchLobby={later}
            handleStartEmojiMatch={later}
            handleFlipEmojiMatchCard={later}
            handleResolveEmojiMatchMismatch={later}
            handleTimeoutEmojiMatchTurn={later}
            handleCancelEmojiMatch={later}
            handlePlayAgainEmojiMatch={later}
            setDismissedEmojiMatchId={nothing}
          />
        );
      });

    // Yuki reads the screen's own words in Japanese: the headline that names the winner, "you", Exit and Play Again
    test("for Yuki, who came second: the results, Alex's five pairs above her three", async () => {
      expect(await layer(yuki, { emojiMatchOnScreen: true, dismissedEmojiMatchId: null })).toMatchSnapshot();
    });

    test("for Alex, who won: You Won! for a headline, and seventy pieces of confetti", async () => {
      const results = (await layer(alex, { emojiMatchOnScreen: true, dismissedEmojiMatchId: null })).split("\n");
      expect(results.filter((line) => line.includes("<h2"))).toEqual([expect.stringMatching(/<h2 class="ec-outline"[^>]*>You Won!<\/h2>$/)]);
      expect(results.filter((line) => line.includes('class="ec-confetti"'))).toHaveLength(1);
      expect(results.filter((line) => line.trimStart().startsWith("<i style="))).toHaveLength(70);
    });

    test("once the player has put the results away: nothing", async () => {
      expect(await layer(yuki, { emojiMatchOnScreen: true, dismissedEmojiMatchId: matchFinished._id })).toBe(EMPTY);
    });

    test("in a page that did not see the game played: nothing", async () => {
      expect(await layer(yuki, { emojiMatchOnScreen: false, dismissedEmojiMatchId: null })).toBe(EMPTY);
    });
  });

  describe("the Resume buttons", () => {
    /** The buttons' column in Yuki's page, where the three games that can be put away are all on. `away` are the ones she has put away */
    const column = (away: { dare: boolean; match: boolean; bingo: boolean }) =>
      render(async () => {
        const { ResumeButtons } = await import("@/components/room/resume-buttons");
        const dare = dareGame();
        const match = matchGame();
        const bingo = bingoGame();
        return (
          <ResumeButtons
            truthOrDareGame={dare}
            dismissedTruthOrDareId={away.dare ? dare._id : null}
            setDismissedTruthOrDareId={nothing}
            lang="ja"
            emojiMatchGame={match}
            emojiMatchOnScreen
            dismissedEmojiMatchId={away.match ? match._id : null}
            setDismissedEmojiMatchId={nothing}
            emojiBingoGame={bingo}
            dismissedEmojiBingoId={away.bingo ? bingo._id : null}
            setDismissedEmojiBingoId={nothing}
          />
        );
      });
    const labels = (drawn: string) => [...drawn.matchAll(/<button class="ec-resume" aria-label="([^"]*)"/g)].map((button) => button[1]);

    test("with all three games put away: a button for each in one column, Truth or Dare's on top", async () => {
      expect(await column({ dare: true, match: true, bingo: true })).toMatchSnapshot();
    });

    test("with only Emoji Bingo put away: its button alone", async () => {
      expect(labels(await column({ dare: false, match: false, bingo: true }))).toEqual(["絵文字ビンゴを再開"]);
    });

    test("with no game put away: the column stands empty", async () => {
      const drawn = await column({ dare: false, match: false, bingo: false });
      expect(labels(drawn)).toEqual([]);
      expect(drawn.split("\n").filter((line) => line.includes("<div"))).toEqual([expect.stringMatching(/^<div style="position:fixed;[^"]*"><\/div>$/)]);
    });
  });
});

// ─── End Game ────────────────────────────────────────────────────────────────

// The rule the room's End Game button follows (lib/end-game.ts), called by itself with the five games as the page's
// hooks hold them. The mutations are stand-ins that note what they were called with
describe("the End Game button's rule", () => {
  type Rule = typeof import("@/lib/end-game").endGameRule;
  type Games = Pick<Parameters<Rule>[0], "activeGameSession" | "wordRushGame" | "emojiMatchGame" | "emojiBingoGame" | "truthOrDareGame">;

  /** Every game on at once, which the server allows: three lobbies, Truth or Dare at its first turn, and Lost in Translation */
  const all: Games = { activeGameSession: session(), wordRushGame: rushGame(), emojiMatchGame: matchGame(), emojiBingoGame: bingoGame(), truthOrDareGame: dareGame() };
  const none: Games = { activeGameSession: null, wordRushGame: null, emojiMatchGame: null, emojiBingoGame: null, truthOrDareGame: null };
  /** The four games that keep a status once they have ended, played to the end. A Lost in Translation that has ended is no active session */
  const over: Games = {
    activeGameSession: null,
    wordRushGame: rushGame({ status: "completed" }),
    emojiMatchGame: matchFinished,
    emojiBingoGame: bingoGame({ status: "completed" }),
    truthOrDareGame: dareGame({ status: "completed" }),
  };
  /** Called off instead: three keep a status, and a Word Rush that was called off is not answered at all */
  const calledOff: Games = {
    activeGameSession: null,
    wordRushGame: null,
    emojiMatchGame: matchGame({ status: "canceled" }),
    emojiBingoGame: bingoGame({ status: "canceled" }),
    truthOrDareGame: dareGame({ status: "canceled" }),
  };
  const QUESTION = "This will end the game for all players and show results.";

  /**
   * The rule in `viewer`'s page while the room has `games`. `answer` is what the viewer says when asked, and the
   * mutation named by `refusing` fails. `called` lists the mutations called with their arguments, `asked` the
   * questions put, `logged` what was said on the console as an error
   */
  async function rule(viewer: Person, games: Games, { answer = true, refusing = "" } = {}) {
    const { endGameRule } = await import("@/lib/end-game");
    const called: string[] = [];
    const asked: string[] = [];
    const logged: string[] = [];
    vi.stubGlobal("confirm", (question: string) => {
      asked.push(question);
      return answer;
    });
    vi.spyOn(console, "error").mockImplementation((...said: unknown[]) => void logged.push(said.map(String).join(" ")));
    const mutation = (name: string) => async (args: unknown) => {
      called.push(`${name} ${written(args)}`);
      if (name === refusing) throw new Error(`${name} refused`);
      return undefined as never;
    };
    const { isGameActive, onEndGame } = endGameRule({
      ...games,
      me: viewer,
      lang: "en",
      participantId: viewer._id,
      roomId: ROOM,
      endTruthOrDare: mutation("truthOrDare:endGame"),
      cancelEmojiBingo: mutation("emojiBingo:cancelGame"),
      cancelEmojiMatch: mutation("emojiMatch:cancelGame"),
      cancelWordRush: mutation("wordRush:cancel"),
      cancelGameMutation: mutation("games:cancelGame"),
    });
    return { isGameActive, onEndGame, called, asked, logged };
  }

  // Each row has one game fewer on than the row above it: the game that row ended
  test.each<[string, Games, string]>([
    ["Truth or Dare, with every game on", all, 'truthOrDare:endGame {gameId: "dare1", participantId: "alex"}'],
    ["Emoji Bingo, once Truth or Dare is over", { ...all, truthOrDareGame: over.truthOrDareGame }, 'emojiBingo:cancelGame {gameId: "bingo1", participantId: "alex"}'],
    ["Emoji Match, once Emoji Bingo is over too", { ...over, activeGameSession: all.activeGameSession, wordRushGame: all.wordRushGame, emojiMatchGame: all.emojiMatchGame }, 'emojiMatch:cancelGame {gameId: "match1", participantId: "alex"}'],
    ["Word Rush, once Emoji Match is over too", { ...over, activeGameSession: all.activeGameSession, wordRushGame: all.wordRushGame }, 'wordRush:cancel {gameId: "rush1", participantId: "alex"}'],
    ["Lost in Translation, once Word Rush is over too", { ...over, activeGameSession: all.activeGameSession }, 'games:cancelGame {participantId: "alex", roomId: "room1"}'],
  ])("the host's tap asks once and ends one game, the first that is on: %s", async (_, games, call) => {
    const { isGameActive, onEndGame, called, asked } = await rule(alex, games);
    expect(isGameActive).toBe(true);
    await onEndGame?.();
    expect(asked).toEqual([QUESTION]);
    expect(called).toEqual([call]);
  });

  test.each<[string, Partial<Games>, string]>([
    ["Lost in Translation", { activeGameSession: all.activeGameSession }, 'games:cancelGame {participantId: "alex", roomId: "room1"}'],
    ["a Word Rush lobby", { wordRushGame: all.wordRushGame }, 'wordRush:cancel {gameId: "rush1", participantId: "alex"}'],
    ["an Emoji Match lobby", { emojiMatchGame: all.emojiMatchGame }, 'emojiMatch:cancelGame {gameId: "match1", participantId: "alex"}'],
    ["an Emoji Bingo lobby", { emojiBingoGame: all.emojiBingoGame }, 'emojiBingo:cancelGame {gameId: "bingo1", participantId: "alex"}'],
    ["Truth or Dare", { truthOrDareGame: all.truthOrDareGame }, 'truthOrDare:endGame {gameId: "dare1", participantId: "alex"}'],
  ])("a room whose only game is %s: the host has a game to end, and the tap ends it", async (_, game, call) => {
    const { isGameActive, onEndGame, called } = await rule(alex, { ...none, ...game });
    expect(isGameActive).toBe(true);
    await onEndGame?.();
    expect(called).toEqual([call]);
  });

  test("the host answers no: nothing is ended", async () => {
    const { onEndGame, called, asked } = await rule(alex, all, { answer: false });
    await onEndGame?.();
    expect(asked).toEqual([QUESTION]);
    expect(called).toEqual([]);
  });

  test("a room with no game, or with games that were all played to the end or called off: the host has no game to end", async () => {
    expect((await rule(alex, none)).isGameActive).toBe(false);
    expect((await rule(alex, over)).isGameActive).toBe(false);
    expect((await rule(alex, calledOff)).isGameActive).toBe(false);
  });

  test("a guest has no game to end and nothing to tap, whatever is on", async () => {
    const { isGameActive, onEndGame } = await rule(yuki, all);
    expect(isGameActive).toBe(false);
    expect(onEndGame).toBeUndefined();
  });

  test("Word Rush refuses to end: the tap logs it, and goes on to no other game", async () => {
    const { onEndGame, called, logged } = await rule(alex, { ...none, wordRushGame: all.wordRushGame, activeGameSession: all.activeGameSession }, { refusing: "wordRush:cancel" });
    await onEndGame?.();
    expect(called).toEqual(['wordRush:cancel {gameId: "rush1", participantId: "alex"}']);
    expect(logged).toEqual(["Failed to end Word Rush: Error: wordRush:cancel refused"]);
  });
});
