// @vitest-environment node
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getFunctionName, type FunctionReference, type FunctionReturnType } from "convex/server";
import { t } from "@/lib/i18n";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { installBrowser, type Sim, type SimBrowser } from "./dom";

// The guest's room page (app/room/[roomId]/page.tsx) mounted with react-dom/client in a stand-in browser (dom.ts)
// and lived in: its effects run, the clock is the test's, and what the page drew can be read and tapped.
// convex/react and next/navigation are replaced as in room-page.test.tsx, except that an answer can change here:
// a query is a subscription that draws its subscribers again, and a mutation is one function for the life of the
// page that is written down when it is called.
//
// What is held: the message list and each bubble are drawn again for every change they show, and not for one they
// do not show. Both are React.memo components, and the page hands them the objects it handed them before for
// whatever holds what it held (lib/stable.ts). Each drawing of the list and of a bubble is counted where its own
// function runs, and what is on screen is read from the document.
//
// And where the reactions are read from. A room that keeps them by room (`reactionsByRoom`) is asked once for all
// of them, and the list hands each bubble its own message's; in any other room each bubble asks for its own. Both
// show the same pills, and neither shows a reaction before the server has answered for it. Where the server
// refuses the room's query, each bubble asks for its own as well, and the conversation stands.
//
// And what the page tells the room it is doing: the drawing sheet of Truth or Dare is written to the room when it
// opens and when it closes, and not each time the page is drawn. While it is open, the signal is written once more
// each time the room shows it gone.
//
// And what the page does by its clock alone. The vibe meter in the header shows at each 5-second move of its
// clock the numbers a page drawn at every move would show, and a move draws the page only when it changes one.
// The results of a Word Rush game that ended before the page opened go three minutes after the game ended, by
// the game's own timer.
//
// And what the page prints about a guest's game: the step of Lost in Translation at each change, and each traced
// action of Truth or Dare. A development build prints them; a production build prints nothing, and the debug panel
// lists the traced actions in both.
//
// And what a Truth or Dare action that fails does to the screen. Each of the seven (starting the game, the choice,
// an answer typed or drawn, Next Turn, Skip, End Game, a rating) tells the player in their language and leaves what
// they had entered for another try. All but starting the game wait a second first, for the room to say whether the
// game has moved on: an action the server refuses for that alone tells nothing, and neither does one it takes.

// ─── The page's surroundings ─────────────────────────────────────────────────

type RoomState = NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>;
type Person = RoomState["participants"][number];
type Message = FunctionReturnType<typeof api.messages.getRoomMessages>[number];
type Reactions = FunctionReturnType<typeof api.reactions.getReactionSummary>;
type RoomReactions = FunctionReturnType<typeof api.reactions.getRoomReactionSummaries>;
type Session = NonNullable<FunctionReturnType<typeof api.games.getActiveGameSession>>;
type Step = NonNullable<FunctionReturnType<typeof api.games.getMyActiveStep>>;
type DareGame = NonNullable<FunctionReturnType<typeof api.truthOrDare.getActiveTruthOrDare>>;
type RushGame = NonNullable<FunctionReturnType<typeof api.wordRush.getState>>;

/** What each function the page subscribes to answers. One that is left out has not answered yet */
interface Answers {
  "rooms:getRoomState"?: RoomState | null;
  "messages:getRoomMessages"?: Message[];
  "games:getActiveGameSession"?: Session | null;
  "games:getMyActiveStep"?: Step | null;
  "games:getLatestGameSession"?: Session | null;
  "wordRush:getState"?: RushGame | null;
  "emojiMatch:getActiveEmojiMatch"?: null;
  "emojiBingo:getActiveEmojiBingo"?: null;
  "truthOrDare:getActiveTruthOrDare"?: DareGame | null;
  /** Asked once for each message, so it is kept by message. A message that is not named has none */
  "reactions:getReactionSummary"?: Record<string, Reactions>;
  /** Asked once for the room: an entry for each message that has reactions */
  "reactions:getRoomReactionSummaries"?: RoomReactions;
}

// Shared with the mocks below, which vitest lifts above the imports
const server = vi.hoisted(() => ({
  answers: {} as Record<string, unknown>,
  subscribers: new Set<() => void>(),
  /** Every mutation the page called, in order */
  calls: [] as { name: string; args: Record<string, unknown> }[],
  /** What the server does with a mutation, if anything */
  onCall: null as ((name: string, args: Record<string, unknown>) => void) | null,
  /** The queries the server refuses, each with the error it answers */
  refused: {} as Record<string, Error>,
  /** A message whose bubble throws when it is drawn, if any */
  bubbleThrows: null as string | null,
  /** The reactions queries asked for, by message */
  reactionsAsked: [] as string[],
  /** The reactions queries asked for, by room */
  roomReactionsAsked: [] as string[],
  /** How many subscriptions to each reactions query are open: the hooks on the page that ask for it and are not skipped */
  reactionsOpen: {} as Record<string, number>,
  /** How often a hook that asks for the room's reactions has run */
  roomReactionsRun: 0,
  /** The deployments each query was asked of, where the page stands under a provider */
  askedOf: {} as Record<string, string[]>,
  search: new URLSearchParams(),
  draws: { page: 0, list: 0, bubbles: {} as Record<string, number> },
  /** How many drawing canvases have been mounted */
  canvases: 0,
  noReactions: [] as never[],
}));

vi.mock("next/navigation", () => {
  // One object each for the life of the page, as Next hands them out
  const params = { roomId: "room1" };
  const router = { replace: () => {}, push: () => {} };
  return {
    // The page asks for its params once each time it is drawn, and nothing else asks for them
    useParams: () => {
      server.draws.page++;
      return params;
    },
    useSearchParams: () => server.search,
    useRouter: () => router,
  };
});

vi.mock("convex/react", async () => {
  const { createContext, createElement, useContext, useEffect, useSyncExternalStore } = await import("react");
  const subscribe = (subscriber: () => void) => {
    server.subscribers.add(subscriber);
    return () => server.subscribers.delete(subscriber);
  };
  const mutations = new Map<string, (args: Record<string, unknown>) => Promise<null>>();
  /** A client is the deployment it was made for */
  class Client {
    constructor(readonly url: string) {}
  }
  const Deployment = createContext<Client | null>(null);
  return {
    ConvexProvider: ({ client, children }: { client: Client; children: ReactNode }) => createElement(Deployment.Provider, { value: client }, children),
    ConvexReactClient: Client,
    useQuery: (query: FunctionReference<"query">, args: "skip" | Record<string, unknown>) => {
      const name = getFunctionName(query);
      const skipped = args === "skip";
      // A query goes to the deployment of the provider it is asked under, as convex/react's own does
      const deployment = useContext(Deployment);
      if (deployment && !skipped && !server.askedOf[name]?.includes(deployment.url)) (server.askedOf[name] ??= []).push(deployment.url);
      if (name === "reactions:getRoomReactionSummaries" && !skipped) server.roomReactionsRun++;
      useEffect(() => {
        if (skipped || !name.startsWith("reactions:")) return;
        server.reactionsOpen[name] = (server.reactionsOpen[name] ?? 0) + 1;
        return () => void server.reactionsOpen[name]--;
      }, [name, skipped]);
      const answer = useSyncExternalStore(subscribe, () => {
        if (args === "skip") return undefined;
        if (server.refused[name]) return server.refused[name];
        if (name === "reactions:getRoomReactionSummaries") {
          const roomId = args.roomId as string;
          if (!server.roomReactionsAsked.includes(roomId)) server.roomReactionsAsked.push(roomId);
        }
        if (name !== "reactions:getReactionSummary") return server.answers[name];
        const messageId = args.messageId as string;
        if (!server.reactionsAsked.includes(messageId)) server.reactionsAsked.push(messageId);
        // An answer is one object until the server sends another, also the answer "none"
        return (server.answers[name] as Record<string, unknown> | undefined)?.[messageId] ?? server.noReactions;
      });
      // A query the server refused is thrown where it was asked, as convex/react's own does
      if (answer instanceof Error) throw answer;
      return answer;
    },
    useMutation: (mutation: FunctionReference<"mutation">) => {
      const name = getFunctionName(mutation);
      if (!mutations.has(name)) {
        mutations.set(name, async (args) => {
          server.calls.push({ name, args });
          server.onCall?.(name, args);
          return null;
        });
      }
      return mutations.get(name)!;
    },
  };
});

/**
 * A component as its module exports it, with `count` called each time its own function runs. One exported in
 * React.memo is counted inside the memo, which stays around it with the comparison it was given.
 */
function counted<Props>(exported: unknown, memo: typeof import("react").memo, count: (props: Props) => void) {
  type Draw = (props: Props) => ReactElement | null;
  const inMemo = typeof exported === "object" ? (exported as { type: Draw; compare: ((a: Props, b: Props) => boolean) | null }) : null;
  const draw = inMemo ? inMemo.type : (exported as Draw);
  const Counted = (props: Props) => {
    count(props);
    return draw(props);
  };
  return inMemo ? memo(Counted, inMemo.compare ?? undefined) : Counted;
}

vi.mock("@/components/message-item", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/message-item")>();
  const { memo } = await import("react");
  const count = ({ message }: { message: { _id: string } }) => {
    server.draws.bubbles[message._id] = (server.draws.bubbles[message._id] ?? 0) + 1;
    if (server.bubbleThrows === message._id) throw new Error("This bubble cannot be drawn");
  };
  return { ...actual, MessageItem: counted(actual.MessageItem, memo, count) };
});

vi.mock("@/components/message-list", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/message-list")>();
  const { memo } = await import("react");
  return { ...actual, MessageList: counted(actual.MessageList, memo, () => void server.draws.list++) };
});

// A drawing sheet's canvas asks a browser for something to paint on. What stands in for it is its two ways out:
// Cancel, and Send, which hands over a drawing. Each canvas carries the number it was mounted as: a canvas that is
// still the one it was has kept what was drawn on it
vi.mock("@/components/drawing-canvas", async () => {
  const { Fragment, createElement, forwardRef, useState } = await import("react");
  return {
    DrawingCanvas: forwardRef(function DrawingCanvas({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }, _ref) {
      const [canvas] = useState(() => ++server.canvases);
      return createElement(
        Fragment,
        null,
        createElement("button", { className: "sim-canvas-cancel", onClick: onCancel }),
        createElement("button", { className: "sim-canvas-send", "data-canvas": canvas, onClick: () => onSave("data:image/jpeg;base64,AAAA") })
      );
    }),
  };
});

const NOW = Date.parse("2026-10-03T12:00:00Z");

let browser: SimBrowser;
let leave: (() => void) | null = null;
/** What the page wrote to the console as an error or a warning: React's own complaints come this way */
let complaints: string[] = [];

beforeEach(() => {
  server.answers = {};
  server.calls = [];
  server.onCall = null;
  server.refused = {};
  server.bubbleThrows = null;
  server.reactionsAsked = [];
  server.roomReactionsAsked = [];
  server.reactionsOpen = {};
  server.roomReactionsRun = 0;
  server.askedOf = {};
  server.search = new URLSearchParams();
  server.draws = { page: 0, list: 0, bubbles: {} };
  server.canvases = 0;
  browser = installBrowser();
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://example.convex.cloud");
  vi.stubEnv("NEXT_PUBLIC_CONVEX_LEGACY_URL", "");
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
  vi.setSystemTime(NOW);
  complaints = [];
  vi.spyOn(console, "log").mockImplementation(() => {});
  for (const level of ["warn", "error"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => void complaints.push(String(args[0])));
  }
});

afterEach(() => {
  leave?.();
  leave = null;
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // A warning about a key, or about a change React was not told to expect, is a defect of the page or of the test
  expect(complaints).toEqual([]);
});

// ─── The room and the people in it ───────────────────────────────────────────

type PID = Id<"participants">;

const ROOM = "room1" as Id<"rooms">;
const HOST = "alex" as PID;
const YUKI = "yuki" as PID;
const SAM = "sam" as PID;
const MIKA = "mika" as PID;

/** A time `seconds` before the page was opened */
const ago = (seconds: number) => NOW - seconds * 1000;
const file = (name: string) => `https://example.convex.cloud/api/storage/${name}`;

const room: RoomState["room"] = {
  _id: ROOM,
  _creationTime: ago(3600),
  joinCode: "QKNUL4",
  status: "active",
  settings: { sourceLanguage: "ja", targetLanguage: "en", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 10 },
  hostId: HOST,
  createdAt: ago(3600),
  background: 4,
};

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

const alex: Person = { ...guest(HOST, "Alex", "fox", "en"), role: "host", platform: "ios" };
const yuki = guest(YUKI, "Yuki", "cat", "ja");
const sam = guest(SAM, "Sam", "whale", "en");
const mika = guest(MIKA, "Mika", "panda", "ja");

const message = (id: string, senderId: PID, secondsAgo: number, fields: Pick<Message, "kind" | "status"> & Partial<Message>): Message => ({
  _id: id as Id<"messages">,
  _creationTime: ago(secondsAgo),
  roomId: ROOM,
  senderId,
  createdAt: ago(secondsAgo),
  ...fields,
});

/** A text that has been translated */
const said = (id: string, senderId: PID, secondsAgo: number, text: string, translatedText: string, romaji: string, extra: Partial<Message> = {}) =>
  message(id, senderId, secondsAgo, { kind: "text", status: "processed", text, processing: { translatedText, romaji }, ...extra });

// Ten minutes ago: Sam says hello, Yuki asks how everyone is, Alex answers Sam's hello, Sam sends a photo, Mika
// a voice message, and Yuki's last message is still with the translator. Nothing of it counts for the vibe meter
// any more, so the meter's clock draws nothing
const chat: Message[] = [
  message("joined", SAM, 610, { kind: "system", status: "processed", text: "join:Sam" }),
  said("hello", SAM, 600, "Hello everyone!", "みなさん、こんにちは！", "minasan, konnichiwa!"),
  said("howareyou", YUKI, 590, "元気ですか？", "How are you?", "genki desu ka?"),
  said("welcome", HOST, 580, "Welcome, Sam", "ようこそ、サム", "youkoso, samu", { replyToId: "hello" as Id<"messages"> }),
  message("photo", SAM, 570, { kind: "image", status: "processed", mediaUrl: file("photo") }),
  message("voice", MIKA, 560, { kind: "audio", status: "processed", mediaUrl: file("voice"), durationMs: 3200, waveform: [0.1, 0.5, 0.9, 0.4] }),
  message("letsgo", YUKI, 550, { kind: "text", status: "pending", text: "行きましょう" }),
];
const BUBBLES = ["hello", "howareyou", "welcome", "photo", "voice", "letsgo"];

/** The room with Alex, Yuki, Sam and Mika in it and the conversation above, where no game has been played */
const talking = (extra: Answers = {}): Answers => ({
  "rooms:getRoomState": { room, participants: [alex, yuki, sam, mika] },
  "messages:getRoomMessages": chat,
  "games:getActiveGameSession": null,
  "games:getMyActiveStep": null,
  "games:getLatestGameSession": null,
  "wordRush:getState": null,
  "emojiMatch:getActiveEmojiMatch": null,
  "emojiBingo:getActiveEmojiBingo": null,
  "truthOrDare:getActiveTruthOrDare": null,
  "reactions:getReactionSummary": {},
  ...extra,
});

/** A game of Lost in Translation that Alex starts as the page opens, with 45 seconds to draw in */
const session: Session = {
  _id: "session1" as Id<"gameSessions">,
  _creationTime: NOW,
  roomId: ROOM,
  gameType: "lost-in-translation",
  status: "active",
  createdByParticipantId: HOST,
  playerIds: [HOST, YUKI, SAM],
  chainCount: 10,
  level: 1,
  timerEnabled: 45,
  createdAt: NOW,
};

// ─── The page, open ──────────────────────────────────────────────────────────

interface Page {
  /** The document's body: the page, and the sheets it puts beside itself */
  body: Sim;
  /** Runs `work` and lets React finish what it starts, promises included */
  act(work: () => void): Promise<void>;
  /** `tell`, and what the page makes of it */
  answer<Name extends keyof Answers>(name: Name, change: (now: NonNullable<Answers[Name]>) => Answers[Name]): Promise<void>;
  /** Moves the clock a second at a time, timers firing on the way */
  wait(seconds: number): Promise<void>;
  tap(node: Sim): Promise<void>;
}

/**
 * The server answers `name` anew, with what `change` makes of its answer so far, and every subscriber hears of it.
 * As from the server, the new answer is new objects all the way down, also where it says what the last one said.
 * The reactions are a query for each message, so there a message that is not changed keeps its answer.
 * Called from a timer or from `server.onCall`, which run while the page is at work; a test calls `page.answer`.
 */
function tell<Name extends keyof Answers>(name: Name, change: (now: NonNullable<Answers[Name]>) => Answers[Name]) {
  const answer = change(server.answers[name] as never);
  server.answers = { ...server.answers, [name]: name === "reactions:getReactionSummary" ? answer : structuredClone(answer) };
  for (const subscriber of [...server.subscribers]) subscriber();
}

/** The server refuses the query `name` from now on, and every subscriber hears of it */
function refuse(name: keyof Answers, why: string) {
  server.refused = { ...server.refused, [name]: new Error(why) };
  for (const subscriber of [...server.subscribers]) subscriber();
}

/**
 * The page as Yuki's browser draws it once `answers` have arrived. `link` is what the room link says besides who
 * she is, and with it the page stands under the app's provider (lib/convex.tsx), which picks the deployment.
 */
async function open(answers: Answers, link?: Record<string, string>): Promise<Page> {
  server.search = new URLSearchParams({ pid: YUKI, ...link });
  server.answers = answers as Record<string, unknown>;
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { default: RoomPage } = await import("@/app/room/[roomId]/page");
  const { ConvexClientProvider } = await import("@/lib/convex");
  const container = browser.document.body.appendChild(browser.document.createElement("div"));
  const root = createRoot(container as unknown as Element);
  const act = async (work: () => void) => {
    await React.act(async () => work());
  };
  await act(() => root.render(link ? <ConvexClientProvider><RoomPage /></ConvexClientProvider> : <RoomPage />));
  leave = () => React.act(() => root.unmount());
  drawnAgain();
  return {
    body: browser.document.body,
    act,
    answer: (name, change) => act(() => tell(name, change)),
    wait: async (seconds) => {
      for (let second = 0; second < seconds; second++) await act(() => void vi.advanceTimersByTime(1000));
    },
    tap: (node) => act(() => node.fire("click")),
  };
}

let seen = { page: 0, list: 0, bubbles: {} as Record<string, number> };
/** What was drawn since this was last asked: how often the page and the list, and which bubbles, by message */
function drawnAgain() {
  const now = { page: server.draws.page, list: server.draws.list, bubbles: { ...server.draws.bubbles } };
  const again = {
    page: now.page - seen.page,
    list: now.list - seen.list,
    bubbles: Object.keys(now.bubbles).filter((id) => now.bubbles[id] !== (seen.bubbles[id] ?? 0)).sort(),
  };
  seen = now;
  return again;
}

/** The one element of `found` */
function one(found: Sim[]) {
  expect(found.length).toBe(1);
  return found[0];
}

/** The bubble of the message `id`. Bubbles stand in the order of the messages that are not system lines */
function bubble(page: Page, id: string) {
  const spoken = (server.answers["messages:getRoomMessages"] as Message[]).filter((m) => m.kind !== "system");
  const at = spoken.findIndex((m) => m._id === id);
  expect(at).toBeGreaterThanOrEqual(0);
  return page.body.byClass("ec-msg")[at];
}

const labelled = (page: Page, label: string) => page.body.all((n) => n.attributes["aria-label"] === label);

/** Reaction pills as they stand under `node`: each one's emoji, the count it shows, and whether it is marked as Yuki's */
const pillsIn = (node: Sim) =>
  node.byClass("ec-react").map((pill) => [one(pill.all((n) => n.nodeName === "IMG")).attributes.alt, pill.textContent, pill.hasClass("mine")]);
/** The pills under the message `id` */
const pills = (page: Page, id: string) => pillsIn(bubble(page, id));
/** The emoji of the sheet a bubble's heart opens, as buttons */
const picker = (page: Page) => one(page.body.byClass("ec-picker-row")).all((n) => n.nodeName === "BUTTON");

/** `messages` with the message `id` changed as `fields` say */
const changed = (messages: Message[], id: string, fields: Partial<Message>) => messages.map((m) => (m._id === id ? { ...m, ...fields } : m));
/** The room with the person `id` changed as `fields` say */
const person = (id: PID, fields: Partial<Person>) => (state: RoomState): RoomState => ({
  ...state,
  participants: state.participants.map((p) => (p._id === id ? { ...p, ...fields } : p)),
});

// ─── What the list does not show ─────────────────────────────────────────────

describe("what the list does not show", () => {
  test("a minute of everyone's heartbeats: the page is drawn for each, the list and the bubbles for none", async () => {
    const page = await open(talking());
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length);
    // Each tab says every 15 seconds that it is still there, and the server moves that person's lastSeenAt: the
    // page's own tab as it calls the mutation, the other three 3, 7 and 11 seconds later
    const beat = (id: PID) => tell("rooms:getRoomState", person(id, { lastSeenAt: Date.now() }));
    server.onCall = (name, args) => {
      if (name === "participants:setParticipantOnline") beat(args.participantId as PID);
    };
    [HOST, SAM, MIKA].forEach((id, i) =>
      setTimeout(() => {
        beat(id);
        setInterval(() => beat(id), 15_000);
      }, (3 + 4 * i) * 1000)
    );
    await page.wait(60);
    expect(server.calls.filter((c) => c.name === "participants:setParticipantOnline").length).toBe(5);
    // Sixteen heartbeats in the minute, four from each tab
    const { page: pageDrawn, ...rest } = drawnAgain();
    expect(pageDrawn).toBeGreaterThanOrEqual(16);
    expect(rest).toEqual({ list: 0, bubbles: [] });
  });

  test("the chat text size: the room's scale changes, and no bubble is drawn again", async () => {
    const page = await open(talking());
    const scale = () => one(page.body.byClass("ec-room")).style["--chat-scale"];
    expect(scale()).toBe("1");
    await page.tap(one(labelled(page, t("Display settings", "ja"))));
    await page.tap(one(labelled(page, t("Large", "ja"))));
    expect(scale()).toBe("1.3");
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: [] });
  });

  test("someone puts the tab away, then closes it: the header counts them, and the list is not drawn again", async () => {
    const page = await open(talking());
    const header = () => one(page.body.byClass("ec-online-dot")).parentNode!.textContent;
    expect(header()).toBe(`4 ${t("online", "ja")}`);
    await page.answer("rooms:getRoomState", person(SAM, { presence: "away" }));
    expect(header()).toBe(`3 ${t("online", "ja")}, 1 ${t("away", "ja")}`);
    await page.answer("rooms:getRoomState", person(SAM, { online: false, presence: undefined }));
    expect(header()).toBe(`3 ${t("online", "ja")}`);
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: [] });
  });

  test("someone starts and stops typing: the indicator comes and goes under the bubbles, which are not drawn again", async () => {
    const page = await open(talking());
    expect(page.body.byClass("ec-typing").length).toBe(0);
    await page.answer("rooms:getRoomState", person(SAM, { typingAction: "typing" }));
    expect(one(page.body.byClass("ec-typing")).textContent).toBe("Sam");
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [] });
    await page.answer("rooms:getRoomState", person(SAM, { typingAction: undefined }));
    expect(page.body.byClass("ec-typing").length).toBe(0);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [] });
  });

  test("someone draws in a game: the countdown runs from the game's own seconds once the game is known", async () => {
    const page = await open(talking({ "games:getActiveGameSession": undefined }));
    await page.answer("rooms:getRoomState", person(SAM, { typingAction: "drawing", drawingStartedAt: NOW }));
    const countdown = () => one(page.body.byClass("ec-typing-bubble")).textContent;
    expect(countdown()).toBe(`${t("Drawing…", "ja")}20s`);
    await page.answer("games:getActiveGameSession", () => session);
    expect(countdown()).toBe(`${t("Drawing…", "ja")}45s`);
    await page.wait(2);
    expect(countdown()).toBe(`${t("Drawing…", "ja")}43s`);
    expect(drawnAgain().bubbles).toEqual([]);
  });
});

// ─── What a bubble shows ─────────────────────────────────────────────────────

describe("a change a bubble shows draws that bubble again", () => {
  test("a message comes back translated: its bubble shows the translation and the stamp, and no other is drawn", async () => {
    const page = await open(talking());
    const letsgo = () => bubble(page, "letsgo");
    expect(letsgo().textContent).toBe(`行きましょう${t("translating", "ja")}`);
    expect(one(letsgo().byClass("ec-bubble")).hasClass("pending")).toBe(true);
    // The newest of Yuki's own messages carries Chatto while it waits
    expect(letsgo().byClass("ec-mascot").length).toBe(1);

    await page.answer("messages:getRoomMessages", (now) =>
      changed(now, "letsgo", { status: "processed", processing: { translatedText: "Let's go", romaji: "ikimashou" }, processedAt: NOW })
    );
    expect(letsgo().textContent).toBe("行きましょうikimashouENLet's goGOTIT!");
    expect(one(letsgo().byClass("ec-bubble")).hasClass("pending")).toBe(false);
    expect(letsgo().byClass("ec-mascot").length).toBe(0);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: ["letsgo"] });

    // The stamp goes three seconds later, by the bubble's own timer
    await page.wait(3);
    expect(letsgo().textContent).toBe("行きましょうikimashouENLet's go");
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: ["letsgo"] });
  });

  test("a message fails: its bubble says so", async () => {
    const page = await open(talking());
    await page.answer("messages:getRoomMessages", (now) => changed(now, "letsgo", { status: "failed", processing: { error: "Translation failed" } }));
    expect(bubble(page, "letsgo").textContent).toBe("行きましょうTranslation failed");
    expect(one(bubble(page, "letsgo").byClass("ec-bubble")).hasClass("failed")).toBe(true);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: ["letsgo"] });
  });

  test("a message's words change: its bubble shows them, and so does the reply that quotes it", async () => {
    const page = await open(talking());
    expect(one(bubble(page, "welcome").byClass("ec-reply")).textContent).toBe("Sam: Hello everyone!");
    await page.answer("messages:getRoomMessages", (now) =>
      changed(now, "hello", { text: "Hello again!", processing: { translatedText: "また、こんにちは！", romaji: "mata, konnichiwa!" } })
    );
    expect(one(bubble(page, "hello").byClass("ec-bubble")).textContent).toBe("また、こんにちは！mata, konnichiwa!ENHello again!");
    expect(one(bubble(page, "welcome").byClass("ec-reply")).textContent).toBe("Sam: Hello again!");
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: ["hello", "welcome"] });
  });

  test("a message is deleted: its bubble goes, and the reply to it stands without its quote", async () => {
    const page = await open(talking());
    await page.answer("messages:getRoomMessages", (now) => now.filter((m) => m._id !== "hello"));
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length - 1);
    expect(page.body.all((n) => n.textContent === "Hello everyone!").length).toBe(0);
    expect(bubble(page, "welcome").byClass("ec-reply").length).toBe(0);
    // The list keeps each message's elements as a group of their own, and React tells the groups apart by where
    // they stand: every bubble after the one that went is built anew
    expect(drawnAgain().bubbles).toEqual(["howareyou", "letsgo", "photo", "voice", "welcome"]);
  });

  test("a message arrives: it gets a bubble, and the bubbles that were there are left alone", async () => {
    const page = await open(talking());
    await page.answer("messages:getRoomMessages", (now) => [...now, said("fine", MIKA, 0, "元気です", "I'm fine", "genki desu")]);
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length + 1);
    expect(one(bubble(page, "fine").byClass("ec-bubble")).textContent).toBe("元気ですgenki desuENI'm fine");
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: ["fine"] });
  });

  test("reactions: the pills come and go under their message, mine marked, and no bubble is drawn again", async () => {
    const page = await open(talking());
    expect(page.body.byClass("ec-react").length).toBe(0);
    await page.answer("reactions:getReactionSummary", () => ({
      hello: [
        { emoji: "👍", count: 2, participantIds: [YUKI, SAM] },
        { emoji: "🔥", count: 1, participantIds: [SAM] },
      ],
    }));
    const pills = () => bubble(page, "hello").byClass("ec-react");
    expect(pills().map((pill) => [one(pill.all((n) => n.nodeName === "IMG")).attributes.alt, pill.textContent, pill.hasClass("mine")])).toEqual([
      ["👍", "2", true],
      ["🔥", "", false],
    ]);
    expect(page.body.byClass("ec-react").length).toBe(2);

    await page.answer("reactions:getReactionSummary", () => ({ hello: [{ emoji: "👍", count: 1, participantIds: [SAM] }] }));
    expect(pills().map((pill) => [pill.textContent, pill.hasClass("mine")])).toEqual([["", false]]);
    await page.answer("reactions:getReactionSummary", () => ({}));
    expect(page.body.byClass("ec-react").length).toBe(0);
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: [] });
  });

  test("someone takes another name and avatar: their bubbles, their join line and the quote of them show both", async () => {
    const page = await open(talking());
    const faces = (node: Sim) => node.all((n) => n.nodeName === "IMG" && n.attributes.src.startsWith("/icons/av-")).map((img) => img.attributes.alt);
    expect(one(bubble(page, "hello").byClass("ec-who")).textContent).toBe("Sam");
    expect(faces(bubble(page, "hello"))).toEqual(["Whale"]);

    await page.answer("rooms:getRoomState", person(SAM, { nickname: "Sammy", avatar: { type: "preset", value: "crab" } }));
    for (const id of ["hello", "photo"]) {
      expect(one(bubble(page, id).byClass("ec-who")).textContent).toBe("Sammy");
      expect(faces(bubble(page, id))).toEqual(["Crab"]);
    }
    // Alex's reply quotes Sam: the quote has Sam's new face and name, the bubble Alex's own
    expect(one(bubble(page, "welcome").byClass("ec-reply")).textContent).toBe("Sammy: Hello everyone!");
    expect(faces(bubble(page, "welcome"))).toEqual(["Crab", "Hamster"]);
    // The line that says Sam joined keeps the name it was written with, and takes the new face
    expect(faces(one(page.body.byClass("ec-sys")))).toEqual(["Crab"]);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: ["hello", "photo", "welcome"] });
  });

  test("the reader's language changes: every bubble is drawn in it", async () => {
    const page = await open(talking());
    const hello = () => one(bubble(page, "hello").byClass("ec-bubble")).textContent;
    expect(hello()).toBe("みなさん、こんにちは！minasan, konnichiwa!ENHello everyone!");
    expect(bubble(page, "letsgo").textContent).toBe(`行きましょう${t("translating", "ja")}`);
    await page.answer("rooms:getRoomState", person(YUKI, { preferredLanguage: "en" }));
    expect(hello()).toBe("Hello everyone!minasan, konnichiwa!JAみなさん、こんにちは！");
    expect(bubble(page, "letsgo").textContent).toBe("行きましょうtranslating");
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [...BUBBLES].sort() });
  });

  test("the display settings: a language switched off leaves every bubble, and comes back", async () => {
    const page = await open(talking());
    const hello = () => one(bubble(page, "hello").byClass("ec-bubble")).textContent;
    await page.tap(one(labelled(page, t("Display settings", "ja"))));
    const [english, japanese, romaji] = one(page.body.byClass("ec-sheet")).all((n) => n.nodeName === "INPUT");
    drawnAgain();

    await page.tap(english);
    expect(hello()).toBe("みなさん、こんにちは！minasan, konnichiwa!");
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [...BUBBLES].sort() });
    await page.tap(romaji);
    expect(hello()).toBe("みなさん、こんにちは！");
    await page.tap(english);
    await page.tap(japanese);
    expect(hello()).toBe("Hello everyone!");
    await page.tap(japanese);
    await page.tap(romaji);
    expect(hello()).toBe("みなさん、こんにちは！minasan, konnichiwa!ENHello everyone!");
  });

  test("a picture finishes loading: its bubble shows it, and the list scrolls to its end", async () => {
    const page = await open(talking());
    const photo = () => bubble(page, "photo");
    const picture = one(photo().all((n) => n.nodeName === "IMG" && n.attributes.src === file("photo")));
    expect(photo().byClass("ec-media-loading").length).toBe(1);
    expect(picture.style.display).toBe("none");
    const messages = one(page.body.byClass("ec-messages"));
    const scrolled = vi.spyOn(messages.lastChild!, "scrollIntoView");

    await page.act(() => picture.fire("load"));
    expect(photo().byClass("ec-media-loading").length).toBe(0);
    expect(picture.style.display).toBe("block");
    expect(scrolled).toHaveBeenCalledTimes(1);
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: [] });
  });

  test("a voice message is played: its button becomes Pause and its dot goes", async () => {
    const page = await open(talking());
    const voice = () => bubble(page, "voice");
    const button = () => one(voice().byClass("ec-vm-play")).attributes["aria-label"];
    expect(button()).toBe(t("Play", "ja"));
    expect(voice().byClass("ec-vm-dot").length).toBe(1);
    await page.tap(one(voice().byClass("ec-vm-play")));
    expect(button()).toBe(t("Pause", "ja"));
    expect(voice().byClass("ec-vm-dot").length).toBe(0);
    await page.tap(one(voice().byClass("ec-vm-play")));
    expect(button()).toBe(t("Play", "ja"));
  });
});

// ─── The newest bubble ───────────────────────────────────────────────────────

describe("the room is buzzing", () => {
  // One message a second up to the moment the page opens, English from Alex and Japanese from Yuki in turn
  const rally = Array.from({ length: 10 }, (_, i) =>
    i % 2 ? said(`r${i}`, YUKI, 9 - i, "いいね！", "Nice!", "ii ne!") : said(`r${i}`, HOST, 9 - i, "Nice!", "いいね！", "ii ne!")
  );

  test("the marquee is on the newest bubble, and moves when a message arrives", async () => {
    const page = await open(talking({ "messages:getRoomMessages": rally }));
    const lit = () => page.body.byClass("ec-msg").map((b) => b.byClass("ec-marquee").length);
    expect(one(page.body.byClass("ec-messages")).hasClass("hype")).toBe(true);
    expect(lit()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    await page.answer("messages:getRoomMessages", (now) => [...now, said("r10", SAM, 0, "So nice!", "すごくいいね！", "sugoku ii ne!")]);
    expect(lit()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(drawnAgain()).toMatchObject({ bubbles: ["r10", "r9"] });
  });

  test("the buzz dies down: the marquee and the list's hype go when the meter falls under its mark", async () => {
    const page = await open(talking({ "messages:getRoomMessages": rally }));
    const messages = () => one(page.body.byClass("ec-messages"));
    expect(messages().hasClass("hype")).toBe(true);
    // A minute on, none of the ten counts any more
    await page.wait(70);
    expect(messages().hasClass("hype")).toBe(false);
    expect(page.body.byClass("ec-marquee").length).toBe(0);
    // Only the bubble that had the marquee was drawn again
    expect(drawnAgain().bubbles).toEqual(["r9"]);
  });
});

// ─── The meter in the header ─────────────────────────────────────────────────

describe("the vibe meter, by the page's own clock", () => {
  // The conversation of ten minutes ago counts for nothing: the meter reads 0 as the page opens
  /** What the header's badge says */
  const meter = (page: Page) => one(page.body.byClass("ec-vibe")).attributes["aria-label"];
  /** The card behind the badge: the messages of the last minute, the changes of language among them, the multiplier */
  const card = (page: Page) => one(page.body.byClass("ec-vibe-info")).byClass("ec-vibe-info-row").map((row) => row.lastChild!.textContent);
  /** A text sent `seconds` after the page opened, which the translator has not answered yet */
  const sentAt = (id: string, senderId: PID, seconds: number, text: string) => message(id, senderId, -seconds, { kind: "text", status: "pending", text });
  /** The room's messages are answered with one more, sent at this moment */
  const says = (page: Page, id: string, senderId: PID, text: string) =>
    page.answer("messages:getRoomMessages", (now) => [...now, sentAt(id, senderId, (Date.now() - NOW) / 1000, text)]);
  /** Waits until `seconds` after the page opened */
  const until = (page: Page, seconds: number) => page.wait(seconds - (Date.now() - NOW) / 1000);

  /** Sam, Yuki and Sam again, 2, 13 and 24 seconds after the page opened, in English, Japanese and English */
  async function threeMessages(page: Page) {
    await until(page, 2);
    await says(page, "a", SAM, "Hello");
    // 12 × 1.05
    expect(meter(page)).toBe("VIBE 13");
    await until(page, 13);
    await says(page, "b", YUKI, "こんにちは");
    // (2 × 12 + 20) × 1.1
    expect(meter(page)).toBe("VIBE 48");
    await until(page, 24);
    await says(page, "c", SAM, "Nice");
    // (3 × 12 + 2 × 20) × 1.15
    expect(meter(page)).toBe("VIBE 87");
  }

  test("a room where nothing is said: the clock does not draw the page", async () => {
    const page = await open(talking());
    expect(meter(page)).toBe("VIBE 0");
    await page.wait(30);
    expect(drawnAgain()).toEqual({ page: 0, list: 0, bubbles: [] });
    expect(meter(page)).toBe("VIBE 0");
  });

  test("the number rises with each message and falls at the clock's moves a minute later; the clock draws the page for those moves only", async () => {
    const page = await open(talking());
    expect(meter(page)).toBe("VIBE 0");
    await threeMessages(page);
    drawnAgain();

    // A message leaves the count at the first move of the clock 60 seconds or more after it was sent
    const shown: [number, string][] = [];
    for (const at of [60, 64, 65, 70, 74, 75, 80, 84, 85, 180]) {
      await until(page, at);
      shown.push([at, meter(page)]);
    }
    expect(shown).toEqual([
      [60, "VIBE 87"],
      [64, "VIBE 87"],
      [65, "VIBE 51"],
      [70, "VIBE 51"],
      [74, "VIBE 51"],
      [75, "VIBE 14"],
      [80, "VIBE 14"],
      [84, "VIBE 14"],
      [85, "VIBE 0"],
      [180, "VIBE 0"],
    ]);
    // Thirty-two moves of the clock since the last message. Four changed a number: the three above, and the one
    // at 115 seconds that ends the combo. The list shows none of it
    expect(drawnAgain()).toEqual({ page: 4, list: 0, bubbles: [] });
  });

  test("the combo ends 90 seconds after the last message: the card's multiplier goes back to 1 while the number stays 0", async () => {
    const page = await open(talking());
    await threeMessages(page);
    await page.tap(one(page.body.byClass("ec-vibe")));
    expect(card(page)).toEqual(["3", "2", "×1.15"]);
    await until(page, 110);
    expect(meter(page)).toBe("VIBE 0");
    expect(card(page)).toEqual(["0", "0", "×1.15"]);
    await until(page, 115);
    expect(meter(page)).toBe("VIBE 0");
    expect(card(page)).toEqual(["0", "0", "×1.00"]);
  });

  test("a message that arrives between two moves of the clock shows at once, read at its own time", async () => {
    const page = await open(talking());
    await until(page, 2);
    await says(page, "a", SAM, "Hello");
    await until(page, 63);
    expect(meter(page)).toBe("VIBE 13");
    await page.act(() => void vi.advanceTimersByTime(500));
    await says(page, "b", YUKI, "こんにちは");
    // The clock stands at 60 seconds. At 63.5 the first message is over a minute old, and the second answers it: 12 × 1.1
    expect(meter(page)).toBe("VIBE 13");
    await page.tap(one(page.body.byClass("ec-vibe")));
    expect(card(page)).toEqual(["1", "0", "×1.10"]);
  });

  test("messages that reach the page late are counted from where the clock stands", async () => {
    const page = await open(talking());
    await until(page, 201);
    // Sent 100 and 150 seconds after the page opened, and answered only now
    await page.answer("messages:getRoomMessages", (now) => [...now, sentAt("a", SAM, 100, "Hello"), sentAt("b", YUKI, 150, "こんにちは")]);
    // The clock stands at 200 seconds: the first is not of the last minute, and the second answers it: 12 × 1.1
    expect(meter(page)).toBe("VIBE 13");
    await until(page, 209);
    expect(meter(page)).toBe("VIBE 13");
    await until(page, 210);
    expect(meter(page)).toBe("VIBE 0");
  });
});

// ─── What stands between the bubbles ─────────────────────────────────────────

describe("what a game leaves in the list", () => {
  test("Lost in Translation ends: the button to its results stands at the end of the list", async () => {
    const page = await open(talking());
    const results = () => page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === t("Game complete! View Results", "ja"));
    expect(results().length).toBe(0);
    const ended: Session = { ...session, status: "complete", completedAt: NOW };
    await page.answer("games:getLatestGameSession", () => ended);
    expect(one(results()).parentNode!.parentNode).toBe(one(page.body.byClass("ec-messages")));
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [] });
  });

  test("Truth or Dare ends: its summary card stands at the end of the list", async () => {
    const page = await open(talking());
    expect(page.body.byClass("ec-summary").length).toBe(0);
    const seat = (p: Person) => ({ participantId: p._id, nickname: p.nickname, avatarValue: p.avatar.value, online: p.online });
    const ended: DareGame = {
      _id: "dare1" as Id<"truthOrDareGames">,
      _creationTime: NOW,
      roomId: ROOM,
      status: "completed",
      hostParticipantId: HOST,
      promptMode: "normal",
      playerOrder: [YUKI, SAM],
      currentTurnIndex: 1,
      currentTurnParticipantId: SAM,
      createdAt: NOW,
      completedAt: NOW,
      currentTurn: null,
      completedTurns: 1,
      completedTurnsList: [
        { _id: "turn1" as Id<"truthOrDareTurns">, participantId: YUKI, choice: "truth", promptText: undefined, responseText: "ねこ", ratings: [{ participantId: SAM, score: 4 }], completedAt: NOW },
      ],
      totalTurns: 1,
      playerInfo: [seat(yuki), seat(sam)],
    };
    await page.answer("truthOrDare:getActiveTruthOrDare", () => ended);
    expect(one(page.body.byClass("ec-summary")).byClass("ec-podium-tile").map((tile) => tile.textContent)).toEqual(["Yuki★ 4", "Sam—"]);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [] });
  });
});

// ─── A game that ended before the page opened ────────────────────────────────

describe("the results of a Word Rush game the page did not see played", () => {
  const seat = (p: Person, learning: "en" | "ja", score: number) => ({
    participantId: p._id,
    nickname: p.nickname,
    avatarValue: p.avatar.value,
    learning,
    score,
    streak: 0,
    bestStreak: 2,
    correct: score,
    sayItBonus: 0,
  });
  // Alex and Yuki played ten cards, and the game ended a minute before the page opened
  const ended: RushGame = {
    _id: "rush1" as Id<"wordRushGames">,
    roomId: ROOM,
    status: "completed",
    hostParticipantId: HOST,
    pack: "mix",
    sayIt: false,
    cardsReady: true,
    players: [seat(alex, "ja", 4), seat(yuki, "en", 3)],
    totalCards: 10,
    cardIndex: 9,
    phase: "reveal",
    phaseSeq: 30,
    phaseStartedAt: ago(65),
    phaseEndsAt: ago(60),
    emojiStepMs: 2500,
    card: null,
    answers: [],
    performer: null,
    votedIds: [],
    verdict: null,
    teachClip: null,
    endedAt: ago(60),
  };

  test("they stand until three minutes after the game ended, and go then in a room where nothing draws the page", async () => {
    const page = await open(talking({ "wordRush:getState": ended }));
    const results = () => page.body.byClass("wr-overlay").length;
    expect(results()).toBe(1);
    await page.wait(119);
    expect(results()).toBe(1);
    await page.wait(2);
    expect(results()).toBe(0);
    expect(drawnAgain().page).toBe(0);
  });
});

// ─── The handlers a bubble is handed ─────────────────────────────────────────

describe("what a bubble is handed to call", () => {
  test("the sheet behind a bubble's heart: a reaction is sent, taken back from its pill, and Reply quotes the message", async () => {
    const page = await open(talking());
    const heart = () => one(bubble(page, "hello").byClass("ec-react-add"));
    await page.tap(heart());
    await page.tap(picker(page)[0]);
    expect(page.body.byClass("ec-picker-row").length).toBe(0);
    expect(server.calls.at(-1)).toEqual({ name: "reactions:addReaction", args: { messageId: "hello", participantId: YUKI, emoji: "👍", token: undefined } });

    await page.answer("reactions:getReactionSummary", () => ({ hello: [{ emoji: "👍", count: 1, participantIds: [YUKI] }] }));
    await page.tap(one(bubble(page, "hello").byClass("ec-react")));
    expect(server.calls.at(-1)).toEqual({ name: "reactions:removeReaction", args: { messageId: "hello", participantId: YUKI, emoji: "👍", token: undefined } });

    expect(page.body.byClass("ec-reply-bar").length).toBe(0);
    await page.tap(heart());
    await page.tap(one(page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === t("↩ Reply", "ja"))));
    expect(one(page.body.byClass("ec-reply-bar")).textContent).toBe(`Hello everyone!${t("Cancel", "ja")}`);
  });

  test("offline, a bubble is handed no way to react: every bubble is drawn again, and a tap sends nothing", async () => {
    const page = await open(talking());
    await page.act(() => {
      browser.navigator.onLine = false;
      browser.fireOnWindow("offline");
    });
    expect(page.body.byClass("ec-banner").length).toBe(1);
    expect(drawnAgain()).toMatchObject({ list: 1, bubbles: [...BUBBLES].sort() });
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    await page.tap(picker(page)[0]);
    expect(server.calls.filter((c) => c.name.startsWith("reactions:"))).toEqual([]);
  });
});

// ─── A message that waits for the network ────────────────────────────────────

describe("a message written offline", () => {
  test("is shown as waiting and asks for no reactions; back online it is sent, and the server's message takes its place", async () => {
    const page = await open(talking());
    await page.act(() => {
      browser.navigator.onLine = false;
      browser.fireOnWindow("offline");
    });
    drawnAgain();

    const field = one(page.body.all((n) => n.nodeName === "TEXTAREA"));
    field.value = "あとで行きます";
    await page.act(() => field.fire("input"));
    await page.tap(one(labelled(page, t("Send", "ja"))));
    const bubbles = () => page.body.byClass("ec-msg");
    expect(bubbles().length).toBe(BUBBLES.length + 1);
    expect(bubbles().at(-1)!.textContent).toBe(`あとで行きます${t("translating", "ja")}`);
    expect(one(page.body.byClass("ec-banner")).textContent).toBe(`${t("You're offline", "ja")}1 ${t("queued", "ja")}`);
    expect(server.calls.filter((c) => c.name === "messages:sendTextMessage")).toEqual([]);
    expect([...server.reactionsAsked].sort()).toEqual([...BUBBLES].sort());
    // Chatto rides on the newest of Yuki's messages that wait: it leaves the one before, which is drawn again for
    // that alone, and no other bubble that was there is
    expect(bubble(page, "letsgo").byClass("ec-mascot").length).toBe(0);
    expect(bubbles().at(-1)!.byClass("ec-mascot").length).toBe(1);
    expect(drawnAgain().bubbles.filter((id) => !id.startsWith("queued-"))).toEqual(["letsgo"]);

    // The server takes the message as the page sends it
    server.onCall = (name, args) => {
      if (name !== "messages:sendTextMessage") return;
      tell("messages:getRoomMessages", (now) => [...now, message("later", YUKI, 0, { kind: "text", status: "pending", text: args.text as string })]);
    };
    await page.act(() => {
      browser.navigator.onLine = true;
      browser.fireOnWindow("online");
    });
    expect(server.calls.filter((c) => c.name === "messages:sendTextMessage")).toEqual([
      { name: "messages:sendTextMessage", args: { roomId: ROOM, senderId: YUKI, text: "あとで行きます", replyToId: undefined, token: undefined } },
    ]);
    expect(page.body.byClass("ec-banner").length).toBe(0);
    expect(bubbles().length).toBe(BUBBLES.length + 1);
    expect(bubble(page, "later").textContent).toBe(`あとで行きます${t("translating", "ja")}`);
    expect(server.reactionsAsked).toContain("later");
  });
});

// ─── Where the reactions are read from ───────────────────────────────────────

const PER_MESSAGE = "reactions:getReactionSummary";
const PER_ROOM = "reactions:getRoomReactionSummaries";

/** The room as one made since reactions carry their room is */
const keptByRoom: RoomState["room"] = { ...room, reactionsByRoom: true };

/** The conversation in a room that keeps its reactions by room. Nobody has reacted unless `extra` says so */
const talkingByRoom = (extra: Answers = {}): Answers =>
  talking({ "rooms:getRoomState": { room: keptByRoom, participants: [alex, yuki, sam, mika] }, [PER_ROOM]: [], ...extra });

/** Reactions by message as the room's query answers them: an entry for each message that has any */
const forRoom = (given: Record<string, Reactions>): RoomReactions =>
  Object.entries(given)
    .filter(([, reactions]) => reactions.length > 0)
    .map(([messageId, reactions]) => ({ messageId, reactions }));

const thumb = (...participantIds: PID[]) => ({ emoji: "👍", count: participantIds.length, participantIds });
const fire = (...participantIds: PID[]) => ({ emoji: "🔥", count: participantIds.length, participantIds });
const heart = (...participantIds: PID[]) => ({ emoji: "❤️", count: participantIds.length, participantIds });

describe("a room that keeps its reactions by room", () => {
  test("one subscription answers for every message: the pills stand under their messages, and no bubble asks for its own", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(YUKI, SAM), fire(SAM)], photo: [heart(MIKA)] }) }));
    expect(server.roomReactionsAsked).toEqual([ROOM]);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
    expect(server.reactionsAsked).toEqual([]);
    expect(pills(page, "hello")).toEqual([
      ["👍", "2", true],
      ["🔥", "", false],
    ]);
    expect(pills(page, "photo")).toEqual([["❤️", "", false]]);
    expect(page.body.byClass("ec-react").length).toBe(3);
  });

  test("a reaction given or taken back draws its message's bubble again, and no other", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(YUKI, SAM), fire(SAM)], photo: [heart(MIKA)] }) }));

    // Sam gives the voice message a heart. The page itself is not drawn: the list's own subscription heard of it
    await page.answer(PER_ROOM, (now) => [...now, { messageId: "voice", reactions: [heart(SAM)] }]);
    expect(pills(page, "voice")).toEqual([["❤️", "", false]]);
    expect(drawnAgain()).toEqual({ page: 0, list: 1, bubbles: ["voice"] });

    // Yuki's thumb under the first message is taken back
    await page.answer(PER_ROOM, (now) => now.map((entry) => (entry.messageId === "hello" ? { ...entry, reactions: [thumb(SAM), fire(SAM)] } : entry)));
    expect(pills(page, "hello")).toEqual([
      ["👍", "", false],
      ["🔥", "", false],
    ]);
    expect(drawnAgain()).toEqual({ page: 0, list: 1, bubbles: ["hello"] });

    // The photo's only reaction is taken back: the server names the message no more
    await page.answer(PER_ROOM, (now) => now.filter((entry) => entry.messageId !== "photo"));
    expect(pills(page, "photo")).toEqual([]);
    expect(pills(page, "voice")).toEqual([["❤️", "", false]]);
    expect(drawnAgain()).toEqual({ page: 0, list: 1, bubbles: ["photo"] });

    // The server sends what it sent before, as new objects: nothing is drawn
    await page.answer(PER_ROOM, (now) => now);
    expect(drawnAgain()).toEqual({ page: 0, list: 0, bubbles: [] });

    // The entries come in the order of each message's oldest reaction, which a reaction taken back can change
    await page.answer(PER_ROOM, (now) => [...now].reverse());
    expect(page.body.byClass("ec-react").length).toBe(3);
    expect(drawnAgain().bubbles).toEqual([]);
  });

  test("until the server has answered for the reactions there are no pills, and no bubble asks in the meantime", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: undefined }));
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length);
    expect(page.body.byClass("ec-react").length).toBe(0);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
    expect(server.reactionsAsked).toEqual([]);

    await page.answer(PER_ROOM, () => forRoom({ hello: [thumb(SAM)] }));
    expect(pills(page, "hello")).toEqual([["👍", "", false]]);
    expect(drawnAgain()).toEqual({ page: 0, list: 1, bubbles: ["hello"] });
  });

  test("the sheet behind a bubble's heart shows the message's reactions from the room's, and asks for nothing", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(YUKI), fire(SAM, MIKA)], photo: [heart(MIKA)] }) }));
    const sheet = () => one(page.body.byClass("ec-sheet"));
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    expect(pillsIn(sheet())).toEqual([
      ["👍", "1", true],
      ["🔥", "2", false],
    ]);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
    expect(server.reactionsAsked).toEqual([]);

    // A reaction that arrives while the sheet is open shows in it
    await page.answer(PER_ROOM, () => forRoom({ hello: [thumb(YUKI), fire(SAM, MIKA), heart(HOST)], photo: [heart(MIKA)] }));
    expect(pillsIn(sheet())).toEqual([
      ["👍", "1", true],
      ["🔥", "2", false],
      ["❤️", "1", false],
    ]);

    // A tap on Yuki's own takes it back, and one on somebody else's gives the same
    await page.tap(sheet().byClass("ec-react")[0]);
    expect(server.calls.at(-1)).toEqual({ name: "reactions:removeReaction", args: { messageId: "hello", participantId: YUKI, emoji: "👍", token: undefined } });
    expect(page.body.byClass("ec-sheet").length).toBe(0);
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    await page.tap(sheet().byClass("ec-react")[1]);
    expect(server.calls.at(-1)).toEqual({ name: "reactions:addReaction", args: { messageId: "hello", participantId: YUKI, emoji: "🔥", token: undefined } });
    expect(page.body.byClass("ec-sheet").length).toBe(0);
  });

  test("a message written offline has no pills and asks for nothing, nor does the server's message that takes its place", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(SAM)] }) }));
    await page.act(() => {
      browser.navigator.onLine = false;
      browser.fireOnWindow("offline");
    });
    const field = one(page.body.all((n) => n.nodeName === "TEXTAREA"));
    field.value = "あとで行きます";
    await page.act(() => field.fire("input"));
    await page.tap(one(labelled(page, t("Send", "ja"))));
    const bubbles = () => page.body.byClass("ec-msg");
    expect(bubbles().length).toBe(BUBBLES.length + 1);
    expect(bubbles().at(-1)!.textContent).toBe(`あとで行きます${t("translating", "ja")}`);
    expect(page.body.byClass("ec-react").length).toBe(1);

    server.onCall = (name, args) => {
      if (name !== "messages:sendTextMessage") return;
      tell("messages:getRoomMessages", (now) => [...now, message("later", YUKI, 0, { kind: "text", status: "pending", text: args.text as string })]);
    };
    await page.act(() => {
      browser.navigator.onLine = true;
      browser.fireOnWindow("online");
    });
    expect(bubble(page, "later").textContent).toBe(`あとで行きます${t("translating", "ja")}`);
    expect(pills(page, "hello")).toEqual([["👍", "", false]]);
    expect(page.body.byClass("ec-react").length).toBe(1);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
    expect(server.reactionsAsked).toEqual([]);
  });

  test("a minute of everyone's heartbeats: neither the list nor a bubble is drawn, the reactions are not read again, and the pills stand", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(YUKI, SAM)] }) }));
    const readAtOpen = server.roomReactionsRun;
    const beat = (id: PID) => tell("rooms:getRoomState", person(id, { lastSeenAt: Date.now() }));
    server.onCall = (name, args) => {
      if (name === "participants:setParticipantOnline") beat(args.participantId as PID);
    };
    [HOST, SAM, MIKA].forEach((id, i) =>
      setTimeout(() => {
        beat(id);
        setInterval(() => beat(id), 15_000);
      }, (3 + 4 * i) * 1000)
    );
    await page.wait(60);
    const { page: pageDrawn, ...rest } = drawnAgain();
    expect(pageDrawn).toBeGreaterThanOrEqual(16);
    expect(rest).toEqual({ list: 0, bubbles: [] });
    expect(server.roomReactionsRun).toBe(readAtOpen);
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
  });
});

describe("a room that keeps its reactions by room, whose query the server refuses", () => {
  const TOO_MANY = "Too many documents read in a single function execution (limit: 32000)";
  const given = { hello: [thumb(YUKI, SAM), fire(SAM)], photo: [heart(MIKA)] };
  /** React says where a component threw and which boundary took it: the one thing the page writes to the console here */
  function thrownOnce() {
    expect(complaints.length).toBe(1);
    expect(complaints[0]).toMatch(/^The above error occurred in the <RoomReactionsMessageList\d*> component/);
    complaints = [];
  }
  /** The conversation, with the pills each bubble's own subscription answers for */
  function conversationStands(page: Page) {
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length);
    expect(page.body.byClass("ec-empty").length).toBe(0);
    expect(pills(page, "hello")).toEqual([
      ["👍", "2", true],
      ["🔥", "", false],
    ]);
    expect(pills(page, "photo")).toEqual([["❤️", "", false]]);
    expect([...server.reactionsAsked].sort()).toEqual([...BUBBLES].sort());
  }

  test("while the page is open: the conversation stands, and each bubble asks for its own message's reactions", async () => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom(given), [PER_MESSAGE]: given }));
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 1 });
    expect(server.reactionsAsked).toEqual([]);

    await page.act(() => refuse(PER_ROOM, TOO_MANY));
    thrownOnce();
    conversationStands(page);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 0, [PER_MESSAGE]: BUBBLES.length });

    // A reaction that arrives shows under its message, and a tap still sends one
    await page.answer(PER_MESSAGE, (now) => ({ ...now, voice: [heart(SAM)] }));
    expect(pills(page, "voice")).toEqual([["❤️", "", false]]);
    await page.tap(one(bubble(page, "voice").byClass("ec-react")));
    expect(server.calls.at(-1)).toEqual({ name: "reactions:addReaction", args: { messageId: "voice", participantId: YUKI, emoji: "❤️", token: undefined } });

    // The page is drawn again, by a heartbeat: the room's reactions are not asked for a second time
    const read = server.roomReactionsRun;
    await page.answer("rooms:getRoomState", person(SAM, { lastSeenAt: Date.now() }));
    expect(server.roomReactionsRun).toBe(read);
    expect(server.reactionsOpen).toEqual({ [PER_ROOM]: 0, [PER_MESSAGE]: BUBBLES.length });
    expect(complaints).toEqual([]);
  });

  test("from the first answer: the page opens on the conversation, with each bubble's own subscription", async () => {
    server.refused = { [PER_ROOM]: new Error(TOO_MANY) };
    const page = await open(talkingByRoom({ [PER_MESSAGE]: given }));
    thrownOnce();
    conversationStands(page);
    expect(server.reactionsOpen).toEqual({ [PER_MESSAGE]: BUBBLES.length });
  });
});

describe("a room from before reactions carried their room", () => {
  test("each bubble subscribes to its own message's reactions, and the room's are never asked for", async () => {
    const page = await open(talking({ [PER_MESSAGE]: { hello: [thumb(YUKI, SAM), fire(SAM)] } }));
    expect(pills(page, "hello")).toEqual([
      ["👍", "2", true],
      ["🔥", "", false],
    ]);
    expect(server.reactionsOpen).toEqual({ [PER_MESSAGE]: BUBBLES.length });
    expect([...server.reactionsAsked].sort()).toEqual([...BUBBLES].sort());
    expect(server.roomReactionsAsked).toEqual([]);

    // The sheet subscribes to its message's reactions for as long as it is open
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    expect(pillsIn(one(page.body.byClass("ec-sheet")))).toEqual([
      ["👍", "2", true],
      ["🔥", "1", false],
    ]);
    expect(server.reactionsOpen).toEqual({ [PER_MESSAGE]: BUBBLES.length + 1 });
    await page.tap(one(labelled(page, t("Close", "ja"))));
    expect(server.reactionsOpen).toEqual({ [PER_MESSAGE]: BUBBLES.length });
    expect(server.roomReactionsAsked).toEqual([]);
  });
});

// Both kinds of room, one after the other: what a guest who reacts sees, and when
const ROOM_KINDS = [
  ["a room that keeps its reactions by room", true],
  ["a room from before reactions carried their room", false],
] as const;

describe.each(ROOM_KINDS)("a reaction given and taken back in %s", (_, byRoom) => {
  /** The room where the server holds the reactions `given` */
  const withReactions = (given: Record<string, Reactions>) => (byRoom ? talkingByRoom({ [PER_ROOM]: forRoom(given) }) : talking({ [PER_MESSAGE]: given }));
  /** The server answers the query this kind of room reads: the reactions are now `given` */
  const answered = (page: Page, given: Record<string, Reactions>) =>
    byRoom ? page.answer(PER_ROOM, () => forRoom(given)) : page.answer(PER_MESSAGE, () => given);
  /** Whether each pill under the message `id` is playing its pop */
  const popping = (page: Page, id: string) => bubble(page, id).byClass("ec-react").map((pill) => pill.byClass("pop").length === 1);

  test("the tap sends it and closes the sheet; the pill comes, counts and goes with the server's answers, and not before", async () => {
    const page = await open(withReactions({}));
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    await page.tap(picker(page)[0]);
    expect(server.calls.at(-1)).toEqual({ name: "reactions:addReaction", args: { messageId: "hello", participantId: YUKI, emoji: "👍", token: undefined } });
    // Sent and not yet answered: the sheet is gone, and no pill stands in for the answer
    expect(page.body.byClass("ec-sheet").length).toBe(0);
    expect(page.body.byClass("ec-react").length).toBe(0);
    await page.wait(3);
    expect(page.body.byClass("ec-react").length).toBe(0);

    await answered(page, { hello: [thumb(YUKI)] });
    expect(pills(page, "hello")).toEqual([["👍", "", true]]);
    expect(popping(page, "hello")).toEqual([false]);

    // Sam gives the same: the pill counts two, and pops
    await answered(page, { hello: [thumb(YUKI, SAM)] });
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    expect(popping(page, "hello")).toEqual([true]);

    // Yuki taps her pill. It stays as it is until the server has taken her reaction back
    await page.tap(one(bubble(page, "hello").byClass("ec-react")));
    expect(server.calls.at(-1)).toEqual({ name: "reactions:removeReaction", args: { messageId: "hello", participantId: YUKI, emoji: "👍", token: undefined } });
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    await page.wait(3);
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);

    await answered(page, { hello: [thumb(SAM)] });
    expect(pills(page, "hello")).toEqual([["👍", "", false]]);
    await answered(page, {});
    expect(page.body.byClass("ec-react").length).toBe(0);
  });

  test("the server answers as the mutation is made: the pill is there when the tap has been dealt with", async () => {
    const page = await open(withReactions({}));
    server.onCall = (name, args) => {
      if (name !== "reactions:addReaction") return;
      const given = { [args.messageId as string]: [thumb(args.participantId as PID)] };
      if (byRoom) tell(PER_ROOM, () => forRoom(given));
      else tell(PER_MESSAGE, () => given);
    };
    await page.tap(one(bubble(page, "hello").byClass("ec-react-add")));
    await page.tap(picker(page)[0]);
    expect(pills(page, "hello")).toEqual([["👍", "", true]]);
    expect(page.body.byClass("ec-react").length).toBe(1);
  });
});

describe.each(ROOM_KINDS)("a bubble that throws as it is drawn in %s", (_, byRoom) => {
  test("the card stands in for the list, and Try again brings the list back as it was read before", async () => {
    const given = { hello: [thumb(YUKI, SAM)] };
    const page = await open(byRoom ? talkingByRoom({ [PER_ROOM]: forRoom(given), [PER_MESSAGE]: given }) : talking({ [PER_MESSAGE]: given }));
    const asked = { ...server.reactionsOpen };
    const tryAgain = () => page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === t("Try again", "ja"));

    server.bubbleThrows = "photo";
    await page.answer("messages:getRoomMessages", (now) => changed(now, "photo", { mediaUrl: file("other") }));
    expect(page.body.byClass("ec-msg").length).toBe(0);
    expect(tryAgain().length).toBe(1);
    // React says where each throw was caught, and the page writes nothing else to the console
    expect(complaints.filter((line) => !line.startsWith("The above error occurred in the <"))).toEqual([]);
    complaints = [];

    server.bubbleThrows = null;
    await page.tap(one(tryAgain()));
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length);
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    expect(server.reactionsOpen).toEqual(asked);
  });
});

// ─── Answers that arrive one after the other ─────────────────────────────────

describe("the messages answer before the room does", () => {
  test("the host's own arrival line is left out once the room says who the host is", async () => {
    const lines = [message("hostjoined", HOST, 620, { kind: "system", status: "processed", text: "join:Alex" }), ...chat];
    const page = await open(talking({ "rooms:getRoomState": undefined, "messages:getRoomMessages": lines }));
    expect(page.body.byClass("ec-messages").length).toBe(0);
    await page.answer("rooms:getRoomState", () => ({ room, participants: [alex, yuki, sam, mika] }));
    expect(page.body.byClass("ec-sys").map((line) => line.textContent)).toEqual([`Sam${t("has joined", "ja")}`]);
    expect(page.body.byClass("ec-msg").length).toBe(BUBBLES.length);
  });

  test.each(ROOM_KINDS)("nothing is asked about reactions until the room has answered, and then only what is asked of %s", async (_, byRoom) => {
    const state: RoomState = { room: byRoom ? keptByRoom : room, participants: [alex, yuki, sam, mika] };
    const given = { hello: [thumb(YUKI, SAM)] };
    const page = await open(talking({ "rooms:getRoomState": undefined, [PER_MESSAGE]: given, [PER_ROOM]: forRoom(given) }));
    expect(server.reactionsOpen).toEqual({});
    expect(server.reactionsAsked).toEqual([]);
    expect(server.roomReactionsAsked).toEqual([]);

    await page.answer("rooms:getRoomState", () => state);
    const asked = () => ({ open: server.reactionsOpen, byMessage: [...server.reactionsAsked].sort(), byRoom: server.roomReactionsAsked });
    const expected = byRoom
      ? { open: { [PER_ROOM]: 1 }, byMessage: [], byRoom: [ROOM] }
      : { open: { [PER_MESSAGE]: BUBBLES.length }, byMessage: [...BUBBLES].sort(), byRoom: [] };
    expect(asked()).toEqual(expected);
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    drawnAgain();

    // The room answers again, its host having given it another texture: the list and the pills stay as they are
    await page.answer("rooms:getRoomState", (now) => ({ ...now, room: { ...now.room, background: 7 } }));
    expect(drawnAgain()).toMatchObject({ list: 0, bubbles: [] });
    expect(pills(page, "hello")).toEqual([["👍", "2", true]]);
    expect(asked()).toEqual(expected);
  });
});

// ─── The deployment the room is on ───────────────────────────────────────────

describe("the deployment a room's reactions are asked of", () => {
  const MAIN = "https://example.convex.cloud";
  const OTHER = "https://other.convex.cloud";

  // lib/convex.tsx makes its clients as it is loaded, from the environment it finds then
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_LEGACY_URL", OTHER);
    vi.resetModules();
  });
  afterEach(() => vi.resetModules());

  test.each([
    ["a link to the app's own deployment", {}, MAIN],
    ["a link to the other deployment (?b=legacy)", { b: "legacy" }, OTHER],
  ])("%s: the room's reactions are asked of the deployment the room was read from", async (_, link, url) => {
    const page = await open(talkingByRoom({ [PER_ROOM]: forRoom({ hello: [thumb(SAM)] }) }), link);
    expect(server.askedOf["rooms:getRoomState"]).toEqual([url]);
    expect(server.askedOf[PER_ROOM]).toEqual([url]);
    expect(Object.keys(server.askedOf)).not.toContain(PER_MESSAGE);
    expect(pills(page, "hello")).toEqual([["👍", "", false]]);
  });

  test("a room from before on the other deployment: each bubble's reactions are asked of it too", async () => {
    const page = await open(talking({ [PER_MESSAGE]: { hello: [thumb(SAM)] } }), { b: "legacy" });
    expect(server.askedOf["rooms:getRoomState"]).toEqual([OTHER]);
    expect(server.askedOf[PER_MESSAGE]).toEqual([OTHER]);
    expect(Object.keys(server.askedOf)).not.toContain(PER_ROOM);
    expect(pills(page, "hello")).toEqual([["👍", "", false]]);
  });
});

// ─── What the page tells the room it is doing ────────────────────────────────

describe("Truth or Dare's drawing signal", () => {
  const seat = (p: Person) => ({ participantId: p._id, nickname: p.nickname, avatarValue: p.avatar.value, online: p.online });
  const GAME = "dare1" as Id<"truthOrDareGames">;
  /** A turn of the game, as the room is sent the one it is at */
  const turn = (id: string, turnIndex: number, participantId: PID, fields: Partial<NonNullable<DareGame["currentTurn"]>>): NonNullable<DareGame["currentTurn"]> => ({
    _id: id as Id<"truthOrDareTurns">,
    _creationTime: NOW,
    gameId: GAME,
    turnIndex,
    participantId,
    status: "waiting_for_choice",
    createdAt: NOW,
    responseMediaUrl: undefined,
    responseStorageId: undefined,
    ...fields,
  });
  // Yuki and Sam play, and it is Yuki's turn: a dare she answers with a drawing
  const game: DareGame = {
    _id: GAME,
    _creationTime: NOW,
    roomId: ROOM,
    status: "active",
    hostParticipantId: HOST,
    promptMode: "normal",
    playerOrder: [YUKI, SAM],
    currentTurnIndex: 0,
    currentTurnParticipantId: YUKI,
    createdAt: NOW,
    currentTurn: turn("turn1", 0, YUKI, {
      choice: "dare",
      promptText: JSON.stringify({ en: "Draw your favourite food", ja: "好きな食べ物を描いて" }),
      promptResponseType: "drawing",
      status: "waiting_for_response",
    }),
    completedTurns: 0,
    completedTurnsList: [],
    totalTurns: 1,
    playerInfo: [seat(yuki), seat(sam)],
  };

  /** Every participants.setTypingAction the page called, in order: the action it set, or "clear" */
  const signals = () => server.calls.filter((c) => c.name === "participants:setTypingAction").map((c) => (c.args.action as string | undefined) ?? "clear");
  /** What the room holds as Yuki's action */
  const stored = () => (server.answers["rooms:getRoomState"] as RoomState).participants.find((p) => p._id === YUKI)!.typingAction;

  /**
   * The room as its server keeps it while the page is open: an action Yuki's tab sets is hers a tenth of a second
   * later, and all four tabs say every 15 seconds that they are still there. Each answer draws the page.
   */
  function roomLives() {
    const beat = (id: PID) => tell("rooms:getRoomState", person(id, { lastSeenAt: Date.now() }));
    server.onCall = (name, args) => {
      if (name === "participants:setParticipantOnline") beat(args.participantId as PID);
      if (name === "participants:setTypingAction") {
        const typingAction = args.action as Person["typingAction"];
        setTimeout(() => tell("rooms:getRoomState", person(args.participantId as PID, { typingAction })), 100);
      }
    };
    [HOST, SAM, MIKA].forEach((id, i) =>
      setTimeout(() => {
        beat(id);
        setInterval(() => beat(id), 15_000);
      }, (3 + 4 * i) * 1000)
    );
  }

  const drawButton = (page: Page) => one(page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === t("Draw your answer", "ja")));
  /** How many drawing sheets are open */
  const sheets = (page: Page) => page.body.byClass("sim-canvas-cancel").length;

  test("one write when the sheet opens and one when it closes, however often the page is drawn meanwhile", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    // The overlay says that nothing is being drawn as it comes up
    expect(signals()).toEqual(["clear"]);
    await page.wait(30);
    expect(drawnAgain().page).toBeGreaterThanOrEqual(8);
    expect(signals()).toEqual(["clear"]);

    await page.tap(drawButton(page));
    expect(sheets(page)).toBe(1);
    expect(signals()).toEqual(["clear", "drawing"]);
    await page.wait(30);
    expect(drawnAgain().page).toBeGreaterThanOrEqual(8);
    expect(signals()).toEqual(["clear", "drawing"]);
    expect(stored()).toBe("drawing");

    await page.tap(one(page.body.byClass("sim-canvas-cancel")));
    expect(sheets(page)).toBe(0);
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
    await page.wait(30);
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
    expect(stored()).toBeUndefined();
  });

  test("the turn is skipped under the open sheet: the sheet goes, and the signal with it", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(drawButton(page));
    await page.wait(5);
    expect(stored()).toBe("drawing");

    await page.answer("truthOrDare:getActiveTruthOrDare", (now) => ({ ...now, currentTurnIndex: 1, currentTurnParticipantId: SAM, currentTurn: turn("turn2", 1, SAM, {}), totalTurns: 2 }));
    expect(sheets(page)).toBe(0);
    await page.wait(5);
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
    expect(stored()).toBeUndefined();
  });

  test("the game is ended under the open sheet: the overlay goes, and the signal with it", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(drawButton(page));
    await page.wait(5);
    expect(stored()).toBe("drawing");

    await page.answer("truthOrDare:getActiveTruthOrDare", (now) => ({ ...now, status: "canceled", completedAt: Date.now() }));
    expect(sheets(page)).toBe(0);
    await page.wait(5);
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
    expect(stored()).toBeUndefined();
  });

  test("the page is left with the sheet open: the signal is cleared on the way out", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    await page.tap(drawButton(page));
    expect(signals()).toEqual(["clear", "drawing"]);
    leave!();
    leave = null;
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
  });

  test("the server takes the action away under the open sheet: it is sent once more each time, and stands", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(drawButton(page));
    await page.wait(3);
    expect(stored()).toBe("drawing");

    // The sweep finds the tab quiet and marks it away, with no action (participants.cleanupStaleParticipants)
    await page.answer("rooms:getRoomState", person(YUKI, { presence: "away", typingAction: undefined }));
    expect(signals()).toEqual(["clear", "drawing", "drawing"]);
    await page.wait(30);
    expect(signals()).toEqual(["clear", "drawing", "drawing"]);
    expect(stored()).toBe("drawing");

    // Another tab of Yuki's is closed, and its leave clears what the room holds for her (participants.leaveRoom)
    await page.answer("rooms:getRoomState", person(YUKI, { online: false, departed: true, typingAction: undefined }));
    await page.wait(30);
    expect(signals()).toEqual(["clear", "drawing", "drawing", "drawing"]);
    expect(stored()).toBe("drawing");

    // Another tab of hers writes in its chat field, and stops
    await page.answer("rooms:getRoomState", person(YUKI, { typingAction: "typing" }));
    await page.wait(2);
    expect(stored()).toBe("drawing");
    await page.answer("rooms:getRoomState", person(YUKI, { typingAction: undefined }));
    await page.wait(30);
    expect(signals()).toEqual(["clear", "drawing", "drawing", "drawing", "drawing", "drawing"]);
    expect(stored()).toBe("drawing");

    await page.tap(one(page.body.byClass("sim-canvas-cancel")));
    await page.wait(5);
    expect(signals().slice(6)).toEqual(["clear"]);
    expect(stored()).toBeUndefined();
  });

  test("the server takes the action away and does not keep the one it is sent: it is sent once, not again and again", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(drawButton(page));
    await page.wait(3);
    const keeps = server.onCall!;
    server.onCall = (name, args) => {
      if (name !== "participants:setTypingAction") keeps(name, args);
    };
    await page.answer("rooms:getRoomState", person(YUKI, { typingAction: undefined }));
    await page.wait(60);
    expect(drawnAgain().page).toBeGreaterThanOrEqual(16);
    expect(signals()).toEqual(["clear", "drawing", "drawing"]);
  });

  test("with no sheet open, the action going from the room is nothing to this tab", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    // Another tab of Yuki's has its own sheet open, and closes it
    await page.answer("rooms:getRoomState", person(YUKI, { typingAction: "drawing" }));
    await page.answer("rooms:getRoomState", person(YUKI, { typingAction: undefined }));
    await page.wait(30);
    expect(signals()).toEqual(["clear"]);

    // This tab's sheet, opened and closed: the room's answer to the close is not a reason to send anything
    await page.tap(drawButton(page));
    await page.wait(3);
    await page.tap(one(page.body.byClass("sim-canvas-cancel")));
    await page.wait(30);
    expect(signals()).toEqual(["clear", "drawing", "clear"]);
    expect(stored()).toBeUndefined();
  });

  test("a clear of this tab's own is still on its way when the sheet opens: the room's answer to it costs one more write, and no more", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(one(labelled(page, t("Minimize", "ja"))));
    const field = one(page.body.all((n) => n.nodeName === "TEXTAREA"));
    field.value = "ちょっと";
    await page.act(() => field.fire("input"));
    await page.wait(1);
    expect(stored()).toBe("typing");

    // The overlay clears the field's signal as it comes back up, and the sheet is opened before the room has answered
    await page.tap(one(labelled(page, t("Resume Truth or Dare", "ja"))));
    await page.act(() => void vi.advanceTimersByTime(50));
    await page.tap(drawButton(page));
    expect(signals()).toEqual(["clear", "typing", "clear", "drawing"]);
    await page.act(() => void vi.advanceTimersByTime(60));
    expect(stored()).toBeUndefined();
    expect(signals()).toEqual(["clear", "typing", "clear", "drawing", "drawing"]);
    await page.wait(30);
    expect(signals()).toEqual(["clear", "typing", "clear", "drawing", "drawing"]);
    expect(stored()).toBe("drawing");
  });

  test("a message left in the field, then the sheet opened: the field's own clear two seconds on does not take the signal down", async () => {
    const page = await open(talking({ "truthOrDare:getActiveTruthOrDare": game }));
    roomLives();
    await page.tap(one(labelled(page, t("Minimize", "ja"))));
    const field = one(page.body.all((n) => n.nodeName === "TEXTAREA"));
    field.value = "ちょっと";
    await page.act(() => field.fire("input"));
    expect(signals()).toEqual(["clear", "typing"]);

    // The overlay says again that nothing is being drawn as it comes back up
    await page.tap(one(labelled(page, t("Resume Truth or Dare", "ja"))));
    expect(signals()).toEqual(["clear", "typing", "clear"]);
    await page.tap(drawButton(page));
    expect(signals()).toEqual(["clear", "typing", "clear", "drawing"]);
    await page.wait(5);
    expect(sheets(page)).toBe(1);
    expect(signals()).toEqual(["clear", "typing", "clear", "drawing"]);
    expect(stored()).toBe("drawing");
  });
});

// ─── What the page prints ────────────────────────────────────────────────────

describe("the debug lines about a guest's game", () => {
  const seat = (p: Person) => ({ participantId: p._id, nickname: p.nickname, avatarValue: p.avatar.value, online: p.online });
  const GAME = "dare1" as Id<"truthOrDareGames">;
  // Truth or Dare between Yuki and Sam, at Yuki's turn: she has not chosen yet
  const choosing: DareGame = {
    _id: GAME,
    _creationTime: NOW,
    roomId: ROOM,
    status: "active",
    hostParticipantId: HOST,
    promptMode: "normal",
    playerOrder: [YUKI, SAM],
    currentTurnIndex: 0,
    currentTurnParticipantId: YUKI,
    createdAt: NOW,
    currentTurn: {
      _id: "turn1" as Id<"truthOrDareTurns">,
      _creationTime: NOW,
      gameId: GAME,
      turnIndex: 0,
      participantId: YUKI,
      status: "waiting_for_choice",
      createdAt: NOW,
      responseMediaUrl: undefined,
      responseStorageId: undefined,
    },
    completedTurns: 0,
    completedTurnsList: [],
    totalTurns: 1,
    playerInfo: [seat(yuki), seat(sam)],
  };
  // Round 1 of Lost in Translation, where Yuki guesses Alex's drawing
  const guess: Step = {
    _id: "step2" as Id<"gameSteps">,
    _creationTime: NOW,
    gameSessionId: session._id,
    chainId: "chain1" as Id<"gameChains">,
    stepIndex: 1,
    stepType: "guess",
    assignedParticipantId: YUKI,
    status: "active",
    createdAt: NOW,
    round: 1,
    inputText: undefined,
    hintText: undefined,
    inputDrawingUrl: file("round-1"),
    options: ["猫", "星", "家", "ドラゴン"],
    correctOption: "猫",
    chainMaxSteps: 3,
    level: 1,
    totalRounds: 10,
    timerEnabled: 45,
  };

  // The panel keeps its log in its module, as the page keeps what it has traced: each test starts from a page load
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.resetModules());

  /**
   * The page in a build of the kind `mode`, with both games on. React takes its own build from NODE_ENV as it is
   * loaded, and a test needs its development build, so React is loaded before the page's build is named.
   */
  async function openIn(mode: "production" | "development") {
    await import("react");
    await import("react-dom/client");
    vi.stubEnv("NODE_ENV", mode);
    return open(talking({ "truthOrDare:getActiveTruthOrDare": choosing }));
  }

  /** Yuki chooses truth, and then her step of Lost in Translation arrives */
  async function play(page: Page) {
    await page.tap(one(page.body.all((n) => n.nodeName === "BUTTON" && n.hasClass("tod-card") && n.textContent.startsWith(t("Truth", "ja")))));
    await page.answer("games:getMyActiveStep", () => guess);
  }

  /** Everything the page printed with console.log, each line as its arguments */
  const printed = () => vi.mocked(console.log).mock.calls;

  /** The actions the debug panel lists, oldest first. It stands at the foot of the display settings sheet */
  async function traced(page: Page) {
    await page.tap(one(labelled(page, t("Display settings", "ja"))));
    await page.tap(one(page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === "Game Debug")));
    const count = one(page.body.all((n) => n.nodeName === "SPAN" && /^\d+ entries$/.test(n.textContent)));
    const entries = count.parentNode!.parentNode!.parentNode!.lastChild!.childNodes;
    expect(count.textContent).toBe(`${entries.length} entries`);
    return entries.map((entry) => entry.all((n) => n.nodeName === "SPAN")[1].textContent).reverse();
  }

  const TRACED = ["query:stateChange", "btn:truth", "submitChoice:start", "submitChoice:ok"];

  test("a production build prints none of them, and the debug panel still lists each traced action", async () => {
    const page = await openIn("production");
    await play(page);
    expect(printed()).toEqual([]);
    expect(await traced(page)).toEqual(TRACED);
  });

  test("a development build prints the step at each change and every traced action, which the panel lists too", async () => {
    const page = await openIn("development");
    await play(page);
    expect(printed()).toEqual([
      ["[GAME] myActiveStep:", null],
      ["%c[T/D] 🟢 query:stateChange — status=active turn=waiting_for_choice idx=0 pid=yuki", "color: gray"],
      ["%c[T/D] 🟢 btn:truth — turnStatus=waiting_for_choice isMyTurn=true", "color: gray"],
      ["%c[T/D] 🟢 submitChoice:start — truth pid=yuki", "color: gray"],
      // The time the mutation took stands before the dash when it is a millisecond or more
      [expect.stringMatching(/^%c\[T\/D\] 🟢 submitChoice:ok( \d+ms)? — truth pid=yuki$/), "color: gray"],
      ["[GAME] myActiveStep:", { id: "step2", type: "guess", round: 1, chain: "chain1" }],
    ]);
    expect(await traced(page)).toEqual(TRACED);
  });
});

// ─── A Truth or Dare action that fails ───────────────────────────────────────

describe("a Truth or Dare action that fails", () => {
  const seat = (p: Person) => ({ participantId: p._id, nickname: p.nickname, avatarValue: p.avatar.value, online: p.online });
  const GAME = "dare1" as Id<"truthOrDareGames">;
  type Turn = NonNullable<DareGame["currentTurn"]>;
  const turn = (id: string, turnIndex: number, participantId: PID, fields: Partial<Turn>): Turn => ({
    _id: id as Id<"truthOrDareTurns">,
    _creationTime: NOW,
    gameId: GAME,
    turnIndex,
    participantId,
    status: "waiting_for_choice",
    createdAt: NOW,
    responseMediaUrl: undefined,
    responseStorageId: undefined,
    ...fields,
  });
  /** The game of Yuki and Sam at the turn `currentTurn` */
  const gameAt = (currentTurn: Turn, extra: Partial<DareGame> = {}): DareGame => ({
    _id: GAME,
    _creationTime: NOW,
    roomId: ROOM,
    status: "active",
    hostParticipantId: HOST,
    promptMode: "normal",
    playerOrder: [YUKI, SAM],
    currentTurnIndex: currentTurn.turnIndex,
    currentTurnParticipantId: currentTurn.participantId,
    createdAt: NOW,
    currentTurn,
    completedTurns: 0,
    completedTurnsList: [],
    totalTurns: 1,
    playerInfo: [seat(yuki), seat(sam)],
    ...extra,
  });
  const PROMPT = JSON.stringify({ en: "What is your favourite food?", ja: "好きな食べ物は？" });

  // Yuki's turn, before she has chosen
  const choosing = gameAt(turn("turn1", 0, YUKI, {}));
  /** Yuki's turn once she has chosen truth: a question she answers in writing, or with a drawing */
  const answering = (promptResponseType: "text" | "drawing") =>
    gameAt(turn("turn1", 0, YUKI, { choice: "truth", promptText: PROMPT, promptResponseType, status: "waiting_for_response" }));
  /** Sam's turn once he has answered, with the ratings the room has given his answer */
  const answered = (ratings: NonNullable<Turn["ratings"]> = []) =>
    gameAt(turn("turn2", 1, SAM, { choice: "truth", promptText: PROMPT, promptResponseType: "text", responseText: "Sushi", ratings, status: "completed", completedAt: NOW }), {
      completedTurns: 1,
      completedTurnsList: [{ _id: "turn2" as Id<"truthOrDareTurns">, participantId: SAM, choice: "truth", promptText: PROMPT, responseText: "Sushi", ratings, completedAt: NOW }],
      totalTurns: 2,
    });
  // Ten turns have been played and the eleventh, Yuki's, is dealt: the round break stands until the host goes on
  const roundBreak = gameAt(turn("turn11", 0, YUKI, {}), { completedTurns: 10, totalTurns: 11 });
  /** The game with Sam's next turn dealt, as it is once Yuki's is over or skipped */
  const samsTurn = (now: DareGame): DareGame => ({ ...now, currentTurnIndex: 1, currentTurnParticipantId: SAM, currentTurn: turn("turn2", 1, SAM, {}), totalTurns: now.totalTurns + 1 });

  type Lang = "ja" | "en";
  const LANGS: Lang[] = ["ja", "en"];
  /** What the player is told, as lib/i18n.ts has it */
  const FAILED = { en: "Something went wrong. Try again.", ja: "エラーが発生しました。もう一度お試しください。" };
  /**
   * A refusal of the mutation `name` as a client is handed it. With `thrown`, the sentence the function threw, it is
   * worded as the dev deployment words it; without, as a production deployment does, which says "Server Error"
   * whatever was thrown.
   */
  const refusal = (name: string, thrown?: string) =>
    `[CONVEX M(${name})] [Request ID: 0123456789abcdef] Server Error\n${thrown ? `Uncaught Error: ${thrown}\n    at handler (../convex/truthOrDare.ts:444:13)\n\n` : ""}  Called by client`;

  /**
   * The page of Yuki, who reads `lang`, with `game` on. `asHost` makes her the one with the host's buttons: the
   * game picker's Start, End Game, Next Turn and Keep Playing.
   */
  const openOn = (game: DareGame | null, lang: Lang, asHost = false) =>
    open(
      talking({
        "rooms:getRoomState": { room, participants: [alex, { ...yuki, preferredLanguage: lang, role: asHost ? "host" : "participant" }, sam, mika] },
        "truthOrDare:getActiveTruthOrDare": game,
      })
    );

  /** The server refuses every call of the mutation `name`, having thrown `thrown` if that is given, and `then` happens besides */
  function refuses(name: string, thrown?: string, then: () => void = () => {}) {
    server.onCall = (called) => {
      if (called !== name) return;
      then();
      throw new Error(refusal(name, thrown));
    };
  }
  /** The server takes every call of the mutation `name`, and the game becomes what `change` makes of it */
  function takes(name: string, change: (now: DareGame) => DareGame) {
    server.onCall = (called) => {
      if (called === name) tell("truthOrDare:getActiveTruthOrDare", (now) => change(now!));
    };
  }
  /** The arguments of every call of the mutation `name` */
  const sent = (name: string) => server.calls.filter((c) => c.name === name).map((c) => c.args);

  /** What the page is telling the player: the words of each toast on screen */
  const told = (page: Page) => page.body.all((n) => n.attributes.role === "status").map((n) => n.textContent);
  /** The failures the page logged as errors since this was last asked. The check after each test finds none left */
  function logged() {
    const lines = complaints;
    complaints = [];
    return lines;
  }
  /** Five seconds pass, and at none of them is anything told. A toast stands for nearly three */
  async function toldNothing(page: Page) {
    for (let second = 0; second < 5; second++) {
      expect(told(page)).toEqual([]);
      await page.wait(1);
    }
    expect(told(page)).toEqual([]);
  }
  /** Nothing of a refusal is on the page: not what wraps it, and not `thrown`, the sentence the function threw */
  function noRefusalWords(page: Page, thrown?: string) {
    expect(page.body.textContent).not.toMatch(/CONVEX|Request ID|Server Error|Uncaught|handler|HTTP \d|Failed to/);
    if (thrown) expect(page.body.textContent).not.toContain(thrown);
  }

  const button = (page: Page, text: string) => one(page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === text));
  const buttons = (page: Page, text: string) => page.body.all((n) => n.nodeName === "BUTTON" && n.textContent === text);
  const off = (node: Sim) => "disabled" in node.attributes;
  /** The Truth card and the Dare card */
  const cards = (page: Page) => page.body.byClass("tod-card");
  /** The field a written answer is typed in */
  const field = (page: Page) => one(page.body.all((n) => n.nodeName === "INPUT" && n.hasClass("ec-field")));
  /** How many of the five stars are lit */
  const stars = (page: Page) =>
    page.body
      .all((n) => n.nodeName === "BUTTON" && /^[1-5]$/.test(n.attributes["aria-label"] ?? ""))
      .filter((star) => String(one(star.all((n) => n.nodeName === "IMG")).style.filter).startsWith("drop-shadow")).length;
  /** The drawing sheets on screen, each as the number of its canvas. A sheet that is put away while its drawing is sent is not on screen */
  const sheets = (page: Page) =>
    page.body
      .byClass("sim-canvas-send")
      .filter((send) => {
        for (let node: Sim | null = send; node; node = node.parentNode) if (node.style.display === "none") return false;
        return true;
      })
      .map((send) => Number(send.attributes["data-canvas"]));

  // ─── Each action, refused ──────────────────────────────────────────────────

  describe.each(LANGS)("for a guest who reads %s", (lang) => {
    test("the choice: the player is told a second later, and the cards can be tapped again", async () => {
      const page = await openOn(choosing, lang);
      refuses("truthOrDare:submitChoice");
      await page.tap(cards(page)[0]);
      // Until then the screen is as it is while a choice is on its way
      expect(cards(page).map(off)).toEqual([true, true]);
      expect(buttons(page, t("Skip", lang)).length).toBe(0);
      expect(told(page)).toEqual([]);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page);
      expect(cards(page).map(off)).toEqual([false, false]);
      expect(buttons(page, t("Skip", lang)).length).toBe(1);
      expect(logged()).toEqual(["Failed to submit choice:"]);
      await page.wait(3);
      expect(told(page)).toEqual([]);

      // The second try is taken: the question comes, and nothing is told
      takes("truthOrDare:submitChoice", () => answering("text"));
      await page.tap(cards(page)[0]);
      const choice = { gameId: GAME, participantId: YUKI, choice: "truth", token: undefined };
      expect(sent("truthOrDare:submitChoice")).toEqual([choice, choice]);
      expect(field(page).attributes.placeholder).toBe(t("Type your answer...", lang));
      await toldNothing(page);
    });

    test("a written answer: it is back in its field, and Send Answer sends it again", async () => {
      const page = await openOn(answering("text"), lang);
      // The dev deployment hands over what the function threw: English, whoever reads it
      refuses("truthOrDare:submitResponse", "Answer too long (max 2000 characters)");
      field(page).value = "すしです";
      await page.tap(button(page, t("Send Answer", lang)));
      // As while an answer is on its way: the field is empty and the button is off
      expect(field(page).value).toBe("");
      expect(buttons(page, t("Send Answer", lang)).length).toBe(0);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Answer too long");
      expect(field(page).value).toBe("すしです");
      expect(off(button(page, t("Send Answer", lang)))).toBe(false);
      expect(logged()).toEqual(["Failed to submit response:"]);
      await page.wait(3);

      takes("truthOrDare:submitResponse", (now) => ({ ...now, currentTurn: { ...now.currentTurn!, responseText: "すしです", status: "completed", completedAt: NOW } }));
      await page.tap(button(page, t("Send Answer", lang)));
      const answer = { gameId: GAME, participantId: YUKI, responseText: "すしです", responseMediaUrl: undefined, token: undefined };
      expect(sent("truthOrDare:submitResponse")).toEqual([answer, answer]);
      expect(page.body.all((n) => n.nodeName === "INPUT" && n.hasClass("ec-field")).length).toBe(0);
      await toldNothing(page);
    });

    test("a drawn answer: its sheet is back on screen with the same canvas, and Send sends the drawing again", async () => {
      const page = await openOn(answering("drawing"), lang);
      const requests: { url: string; body: Record<string, unknown> }[] = [];
      let answer = (): Response => new Response(JSON.stringify({ error: "Uncaught Error: Unsupported drawing\n    at handler (../convex/truthOrDare.ts:502:55)\n" }), { status: 400 });
      vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
        requests.push({ url, body: JSON.parse(init.body as string) });
        return answer();
      });
      await page.tap(button(page, t("Draw your answer", lang)));
      expect(sheets(page)).toEqual([1]);
      await page.tap(one(page.body.byClass("sim-canvas-send")));
      // As while a drawing is on its way: no sheet on screen
      expect(sheets(page)).toEqual([]);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Unsupported drawing");
      expect(sheets(page)).toEqual([1]);
      expect(logged()).toEqual(["Failed to submit response:"]);
      await page.wait(3);

      answer = () => {
        tell("truthOrDare:getActiveTruthOrDare", (now) => ({ ...now!, currentTurn: { ...now!.currentTurn!, responseMediaUrl: file("answer"), status: "completed", completedAt: NOW } }));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      };
      await page.tap(one(page.body.byClass("sim-canvas-send")));
      const request = {
        url: "https://example.convex.site/api/truth-or-dare/submit-response",
        body: { gameId: GAME, participantId: YUKI, responseMediaUrl: "data:image/jpeg;base64,AAAA" },
      };
      expect(requests).toEqual([request, request]);
      expect(page.body.byClass("sim-canvas-send").length).toBe(0);
      await toldNothing(page);
      // The room is told that she draws for as long as a sheet is on screen
      expect(server.calls.filter((c) => c.name === "participants:setTypingAction").map((c) => c.args.action ?? "clear")).toEqual(["clear", "drawing", "clear", "drawing", "clear"]);
    });

    test("a rating: the stars stay lit, and Submit Rating sends them again", async () => {
      const page = await openOn(answered(), lang);
      refuses("truthOrDare:submitRating", "Not a member of this room");
      await page.tap(one(labelled(page, "4")));
      await page.tap(button(page, t("Submit Rating", lang)));
      expect(buttons(page, t("Submit Rating", lang)).length).toBe(0);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Not a member");
      expect(stars(page)).toBe(4);
      expect(off(button(page, t("Submit Rating", lang)))).toBe(false);
      expect(logged()).toEqual(["Failed to submit rating:"]);
      await page.wait(3);

      takes("truthOrDare:submitRating", () => answered([{ participantId: YUKI, score: 4 }]));
      await page.tap(button(page, t("Submit Rating", lang)));
      const rating = { turnId: "turn2", participantId: YUKI, score: 4, token: undefined };
      expect(sent("truthOrDare:submitRating")).toEqual([rating, rating]);
      expect(buttons(page, t("Submit Rating", lang)).length).toBe(0);
      await toldNothing(page);
    });

    test("Skip: the player is told, and can skip again", async () => {
      const page = await openOn(choosing, lang);
      refuses("truthOrDare:skipTurn");
      await page.tap(button(page, t("Skip", lang)));
      expect(told(page)).toEqual([]);
      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page);
      expect(logged()).toEqual(["Failed to skip turn:"]);
      await page.wait(3);

      // The server deals her a turn in place of the one she skipped
      takes("truthOrDare:skipTurn", (now) => ({ ...now, currentTurn: turn("turn2", 0, YUKI, {}), totalTurns: 2 }));
      await page.tap(button(page, t("Skip", lang)));
      const skip = { gameId: GAME, participantId: YUKI, token: undefined };
      expect(sent("truthOrDare:skipTurn")).toEqual([skip, skip]);
      await toldNothing(page);
    });

    test("Next Turn, for the host: the button is on again", async () => {
      const page = await openOn(answered([{ participantId: YUKI, score: 4 }]), lang, true);
      const next = `${t("Next Turn", lang)} ➜`;
      refuses("truthOrDare:advanceTurn", "Only the host can advance turns");
      await page.tap(button(page, next));
      expect(buttons(page, next).length).toBe(0);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Only the host");
      expect(off(button(page, next))).toBe(false);
      expect(logged()).toEqual(["Failed to advance turn:"]);
      await page.wait(3);

      takes("truthOrDare:advanceTurn", (now) => ({ ...now, currentTurnIndex: 0, currentTurnParticipantId: YUKI, currentTurn: turn("turn3", 0, YUKI, {}), totalTurns: 3 }));
      await page.tap(button(page, next));
      const advance = { gameId: GAME, participantId: YUKI, token: undefined };
      expect(sent("truthOrDare:advanceTurn")).toEqual([advance, advance]);
      expect(cards(page).length).toBe(2);
      await toldNothing(page);
    });

    test("Keep Playing at the round break, for the host: the break is back", async () => {
      const page = await openOn(roundBreak, lang, true);
      const keep = `${t("Keep Playing", lang)} ➜`;
      const breaks = () => page.body.all((n) => n.nodeName === "H2" && n.textContent === t("Round Complete!", lang)).length;
      refuses("truthOrDare:advanceTurn");
      await page.tap(button(page, keep));
      // As while the host's tap is on its way: the break has left this screen
      expect(breaks()).toBe(0);

      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page);
      expect(breaks()).toBe(1);
      expect(logged()).toEqual(["Failed to advance turn:"]);
      await page.wait(3);

      takes("truthOrDare:advanceTurn", (now) => ({ ...now, roundBreakAckedTurns: 10 }));
      await page.tap(button(page, keep));
      expect(sent("truthOrDare:advanceTurn").length).toBe(2);
      expect(breaks()).toBe(0);
      await toldNothing(page);
    });

    test("End Game, for the host: the player is told, and can end it again", async () => {
      const page = await openOn(choosing, lang, true);
      refuses("truthOrDare:endGame", "Not authorised");
      await page.tap(button(page, t("End Game", lang)));
      await page.wait(1);
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Not authorised");
      expect(logged()).toEqual(["Failed to end Truth or Dare:"]);
      await page.wait(3);

      takes("truthOrDare:endGame", (now) => ({ ...now, status: "completed", completedAt: NOW }));
      await page.tap(button(page, t("End Game", lang)));
      const end = { gameId: GAME, participantId: YUKI, token: undefined };
      expect(sent("truthOrDare:endGame")).toEqual([end, end]);
      expect(cards(page).length).toBe(0);
      await toldNothing(page);
    });

    test("starting the game, for the host: the player is told at once, and the picker stays open to start from again", async () => {
      const page = await openOn(null, lang, true);
      const pickers = () => page.body.byClass("ec-sheet").length;
      await page.tap(one(labelled(page, t("Games", lang))));
      await page.tap(one(page.body.all((n) => n.attributes.role === "button" && n.textContent.startsWith(t("Truth or Dare", lang)))));
      refuses("truthOrDare:createGame", "Room is closed");
      await page.tap(button(page, t("Start Game", lang)));
      expect(told(page)).toEqual([FAILED[lang]]);
      noRefusalWords(page, "Room is closed");
      expect(pickers()).toBe(1);
      expect(logged()).toEqual(["Failed to create Truth or Dare:"]);
      await page.wait(3);
      expect(told(page)).toEqual([]);

      takes("truthOrDare:createGame", () => choosing);
      await page.tap(button(page, t("Start Game", lang)));
      const create = { roomId: ROOM, hostParticipantId: YUKI, promptMode: "normal", token: undefined };
      expect(sent("truthOrDare:createGame")).toEqual([create, create]);
      expect(pickers()).toBe(0);
      expect(cards(page).length).toBe(2);
      await toldNothing(page);
    });
  });

  test("a written answer that failed is not put back over one the player has typed since", async () => {
    const page = await openOn(answering("text"), "ja");
    refuses("truthOrDare:submitResponse");
    field(page).value = "すしです";
    await page.tap(button(page, t("Send Answer", "ja")));
    field(page).value = "ラーメン";
    await page.wait(1);
    expect(told(page)).toEqual([FAILED.ja]);
    expect(field(page).value).toBe("ラーメン");
    expect(logged()).toEqual(["Failed to submit response:"]);
  });

  test("a drawing that cannot be sent at all, the network being down: its sheet is back on screen too", async () => {
    const page = await openOn(answering("drawing"), "ja");
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    await page.tap(button(page, t("Draw your answer", "ja")));
    await page.tap(one(page.body.byClass("sim-canvas-send")));
    expect(sheets(page)).toEqual([]);
    await page.wait(1);
    expect(told(page)).toEqual([FAILED.ja]);
    noRefusalWords(page);
    expect(sheets(page)).toEqual([1]);
    expect(logged()).toEqual(["Failed to submit response:"]);
  });

  // ─── An action the server takes ────────────────────────────────────────────

  // The stand-in server takes each call and the room does not answer in these five seconds: nothing but the
  // action's own coming back can change the screen
  describe("an action the server takes tells nothing", () => {
    const startGame = async (page: Page) => {
      await page.tap(one(labelled(page, t("Games", "ja"))));
      await page.tap(one(page.body.all((n) => n.attributes.role === "button" && n.textContent.startsWith(t("Truth or Dare", "ja")))));
      await page.tap(button(page, t("Start Game", "ja")));
    };
    const rate = async (page: Page) => {
      await page.tap(one(labelled(page, "5")));
      await page.tap(button(page, t("Submit Rating", "ja")));
    };

    test.each<[string, DareGame | null, boolean, (page: Page) => Promise<void>, string, Record<string, unknown>]>([
      ["the choice", choosing, false, (page) => page.tap(cards(page)[1]), "truthOrDare:submitChoice", { gameId: GAME, participantId: YUKI, choice: "dare" }],
      ["a rating", answered(), false, rate, "truthOrDare:submitRating", { turnId: "turn2", participantId: YUKI, score: 5 }],
      ["Skip", choosing, false, (page) => page.tap(button(page, t("Skip", "ja"))), "truthOrDare:skipTurn", { gameId: GAME, participantId: YUKI }],
      ["Next Turn", answered([{ participantId: YUKI, score: 4 }]), true, (page) => page.tap(button(page, `${t("Next Turn", "ja")} ➜`)), "truthOrDare:advanceTurn", { gameId: GAME, participantId: YUKI }],
      ["Keep Playing", roundBreak, true, (page) => page.tap(button(page, `${t("Keep Playing", "ja")} ➜`)), "truthOrDare:advanceTurn", { gameId: GAME, participantId: YUKI }],
      ["End Game", choosing, true, (page) => page.tap(button(page, t("End Game", "ja"))), "truthOrDare:endGame", { gameId: GAME, participantId: YUKI }],
      ["starting the game", null, true, startGame, "truthOrDare:createGame", { roomId: ROOM, hostParticipantId: YUKI, promptMode: "normal" }],
    ])("%s", async (_, game, asHost, act, mutation, args) => {
      const page = await openOn(game, "ja", asHost);
      await act(page);
      expect(sent(mutation)).toEqual([{ ...args, token: undefined }]);
      await toldNothing(page);
      expect(logged()).toEqual([]);
    });

    test("a written answer: the field empties as it is sent, and stays empty", async () => {
      const page = await openOn(answering("text"), "ja");
      field(page).value = "すしです";
      await page.tap(button(page, t("Send Answer", "ja")));
      expect(sent("truthOrDare:submitResponse")).toEqual([{ gameId: GAME, participantId: YUKI, responseText: "すしです", responseMediaUrl: undefined, token: undefined }]);
      expect(field(page).value).toBe("");
      await toldNothing(page);
      expect(field(page).value).toBe("");
      expect(logged()).toEqual([]);
    });

    test("a drawn answer: the sheet goes as it is sent and stays away, and the room is told once that she has stopped drawing", async () => {
      const page = await openOn(answering("drawing"), "ja");
      vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
      await page.tap(button(page, t("Draw your answer", "ja")));
      await page.tap(one(page.body.byClass("sim-canvas-send")));
      expect(sheets(page)).toEqual([]);
      await toldNothing(page);
      expect(sheets(page)).toEqual([]);
      expect(server.calls.filter((c) => c.name === "participants:setTypingAction").map((c) => c.args.action ?? "clear")).toEqual(["clear", "drawing", "clear"]);
      expect(logged()).toEqual([]);
    });
  });

  // ─── A refusal because the game had moved on ───────────────────────────────

  // The server throws at an action that arrives for a turn that is no longer the player's, or for a game that is
  // over. The room's answer that shows as much reaches the page with the refusal, or a moment after it
  describe("an action the server refuses because the game had moved on tells nothing", () => {
    /** The room answers `change` this many milliseconds after the refusal */
    const later = (ms: number, change: (now: DareGame) => DareGame) => () => void setTimeout(() => tell("truthOrDare:getActiveTruthOrDare", (now) => change(now!)), ms);
    /** Nothing is told in five seconds, and Sam's turn is on screen by then */
    async function movedOnQuietly(page: Page, lang: Lang) {
      await toldNothing(page);
      expect(page.body.textContent).toContain(`${t("Waiting for", lang)} Sam ${t("to choose...", lang)}`);
    }

    test.each([
      ["as the dev deployment words it", "Not your turn"],
      ["as a production deployment words it", undefined],
    ])("a choice for a turn that was skipped while the player was away, %s", async (_, thrown) => {
      const page = await openOn(choosing, "ja");
      refuses("truthOrDare:submitChoice", thrown, later(300, samsTurn));
      await page.tap(cards(page)[0]);
      await movedOnQuietly(page, "ja");
      expect(logged()).toEqual(["Failed to submit choice:"]);
    });

    test("a choice that reaches a game the host has just ended: the screen goes", async () => {
      const page = await openOn(choosing, "en");
      refuses("truthOrDare:submitChoice", "Game is not active", later(300, (now) => ({ ...now, status: "completed", completedAt: NOW })));
      await page.tap(cards(page)[0]);
      await toldNothing(page);
      expect(cards(page).length).toBe(0);
      expect(logged()).toEqual(["Failed to submit choice:"]);
    });

    test("a written answer for a turn the host has skipped, the room's answer coming first", async () => {
      const page = await openOn(answering("text"), "en");
      refuses("truthOrDare:submitResponse", "Not your turn", () => tell("truthOrDare:getActiveTruthOrDare", (now) => samsTurn(now!)));
      field(page).value = "Sushi";
      await page.tap(button(page, t("Send Answer", "en")));
      await movedOnQuietly(page, "en");
      expect(logged()).toEqual(["Failed to submit response:"]);
    });

    test("a drawn answer for a turn the host has skipped: the sheet stays away", async () => {
      const page = await openOn(answering("drawing"), "ja");
      vi.stubGlobal("fetch", async () => {
        setTimeout(() => tell("truthOrDare:getActiveTruthOrDare", (now) => samsTurn(now!)), 300);
        return new Response(JSON.stringify({ error: "Uncaught Error: Not your turn\n    at handler (../convex/truthOrDare.ts:495:13)\n" }), { status: 400 });
      });
      await page.tap(button(page, t("Draw your answer", "ja")));
      await page.tap(one(page.body.byClass("sim-canvas-send")));
      await movedOnQuietly(page, "ja");
      expect(page.body.byClass("sim-canvas-send").length).toBe(0);
      expect(logged()).toEqual(["Failed to submit response:"]);
    });

    test("a guest's Skip for a turn that has moved on", async () => {
      const page = await openOn(choosing, "ja");
      refuses("truthOrDare:skipTurn", undefined, later(300, samsTurn));
      await page.tap(button(page, t("Skip", "ja")));
      await movedOnQuietly(page, "ja");
      expect(logged()).toEqual(["Failed to skip turn:"]);
    });
  });
});
