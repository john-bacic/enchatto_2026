// @vitest-environment node
import type { ReactElement } from "react";
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

// ─── The page's surroundings ─────────────────────────────────────────────────

type RoomState = NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>;
type Person = RoomState["participants"][number];
type Message = FunctionReturnType<typeof api.messages.getRoomMessages>[number];
type Reactions = FunctionReturnType<typeof api.reactions.getReactionSummary>;
type Session = NonNullable<FunctionReturnType<typeof api.games.getActiveGameSession>>;
type DareGame = NonNullable<FunctionReturnType<typeof api.truthOrDare.getActiveTruthOrDare>>;

/** What each function the page subscribes to answers. One that is left out has not answered yet */
interface Answers {
  "rooms:getRoomState"?: RoomState | null;
  "messages:getRoomMessages"?: Message[];
  "games:getActiveGameSession"?: Session | null;
  "games:getMyActiveStep"?: null;
  "games:getLatestGameSession"?: Session | null;
  "wordRush:getState"?: null;
  "emojiMatch:getActiveEmojiMatch"?: null;
  "emojiBingo:getActiveEmojiBingo"?: null;
  "truthOrDare:getActiveTruthOrDare"?: DareGame | null;
  /** Asked once for each message, so it is kept by message. A message that is not named has none */
  "reactions:getReactionSummary"?: Record<string, Reactions>;
}

// Shared with the mocks below, which vitest lifts above the imports
const server = vi.hoisted(() => ({
  answers: {} as Record<string, unknown>,
  subscribers: new Set<() => void>(),
  /** Every mutation the page called, in order */
  calls: [] as { name: string; args: Record<string, unknown> }[],
  /** What the server does with a mutation, if anything */
  onCall: null as ((name: string, args: Record<string, unknown>) => void) | null,
  /** The reactions queries asked for, by message */
  reactionsAsked: [] as string[],
  search: new URLSearchParams(),
  draws: { page: 0, list: 0, bubbles: {} as Record<string, number> },
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
  const { useSyncExternalStore } = await import("react");
  const subscribe = (subscriber: () => void) => {
    server.subscribers.add(subscriber);
    return () => server.subscribers.delete(subscriber);
  };
  const mutations = new Map<string, (args: Record<string, unknown>) => Promise<null>>();
  return {
    ConvexProvider: ({ children }: { children: unknown }) => children,
    ConvexReactClient: class {},
    useQuery: (query: FunctionReference<"query">, args: "skip" | Record<string, unknown>) => {
      const name = getFunctionName(query);
      return useSyncExternalStore(subscribe, () => {
        if (args === "skip") return undefined;
        if (name !== "reactions:getReactionSummary") return server.answers[name];
        const messageId = args.messageId as string;
        if (!server.reactionsAsked.includes(messageId)) server.reactionsAsked.push(messageId);
        // An answer is one object until the server sends another, also the answer "none"
        return (server.answers[name] as Record<string, unknown> | undefined)?.[messageId] ?? server.noReactions;
      });
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
  };
  return { ...actual, MessageItem: counted(actual.MessageItem, memo, count) };
});

vi.mock("@/components/message-list", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/message-list")>();
  const { memo } = await import("react");
  return { ...actual, MessageList: counted(actual.MessageList, memo, () => void server.draws.list++) };
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
  server.reactionsAsked = [];
  server.search = new URLSearchParams();
  server.draws = { page: 0, list: 0, bubbles: {} };
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

/** The page as Yuki's browser draws it once `answers` have arrived */
async function open(answers: Answers): Promise<Page> {
  server.search = new URLSearchParams({ pid: YUKI });
  server.answers = answers as Record<string, unknown>;
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { default: RoomPage } = await import("@/app/room/[roomId]/page");
  const container = browser.document.body.appendChild(browser.document.createElement("div"));
  const root = createRoot(container as unknown as Element);
  const act = async (work: () => void) => {
    await React.act(async () => work());
  };
  await act(() => root.render(<RoomPage />));
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

// ─── The handlers a bubble is handed ─────────────────────────────────────────

describe("what a bubble is handed to call", () => {
  const picker = (page: Page) => one(page.body.byClass("ec-picker-row")).all((n) => n.nodeName === "BUTTON");

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
});
