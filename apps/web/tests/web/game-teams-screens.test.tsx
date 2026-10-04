import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { GameReplayModal } from "@/components/game-replay-modal";
import { GameStatusBar } from "@/components/game-status-bar";
import { GameTaskOverlay } from "@/components/game-task-overlay";
import { MessageList } from "@/components/message-list";
import { readTeams, teamInSession, teamOf } from "@/lib/game-teams";
import { avatarIconSrc } from "@/lib/types";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Backend, joinGuest, newBackend } from "../convex/setup";

// The screens of a Lost in Translation team game on the web: the status bar, the summary card in the chat, the
// replay sheet and the team tab of the guess and draw overlay, as static markup. Without team data each of them
// is the screen of an individual game.

type PID = Id<"participants">;

afterEach(() => {
  vi.restoreAllMocks();
});

/** How often `text` is in `html` */
const count = (html: string, text: string) => html.split(text).length - 1;

/** Where `text` first is in `html`. It has to be there: "comes before" must not pass on a text that is missing */
const at = (html: string, text: string) => {
  const index = html.indexOf(text);
  expect(index, `"${text}" is on the screen`).toBeGreaterThanOrEqual(0);
  return index;
};

/** What a reader sees of `html`: its text, without the tags */
const words = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** The avatars drawn in `html`, in order */
const faces = (html: string) => html.match(/\/icons\/av-[a-z]+\.png/g) ?? [];

const person = (nickname: string, avatar: string, correct = 0) => ({
  correct,
  total: 4,
  nickname,
  avatar: { type: "preset", value: avatar },
});

// Five players: a, c, e are Team Mint and b, d are Team Grape
const mint = ["a", "c", "e"];
const grape = ["b", "d"];
const people: Record<string, { name: string; avatar: string }> = {
  a: { name: "Ann", avatar: "cat" },
  b: { name: "Bea", avatar: "panda" },
  c: { name: "Cy", avatar: "whale" },
  d: { name: "Di", avatar: "owl" },
  e: { name: "Ed", avatar: "moon" },
};
const teams = (points: [number, number]) => [
  { memberIds: mint, points: points[0] },
  { memberIds: grape, points: points[1] },
];
/** The avatar a player is drawn with */
const face = (pid: string) => avatarIconSrc(people[pid].avatar);

/** The status bar's two rows, Team Mint's first. A row is its team's name, then its members' faces, then its points */
const barRows = (html: string) => {
  const [mintRow, grapeRow] = html.slice(at(html, ">Team Mint<")).split(">Team Grape<");
  return { mintRow, grapeRow };
};

/** The summary card's two tiles, Team Mint's first, and what the strip of rounds under them reads */
const cardParts = (html: string) => {
  const [, mintTile, rest] = html.split('class="ec-podium-tile');
  // The strip begins with Team Mint's name: the last time the card says it
  const stripAt = rest.lastIndexOf("Team Mint");
  return { mintTile, grapeTile: rest.slice(0, stripAt), strip: words(rest.slice(stripAt)) };
};

/**
 * The replay sheet of a game with a winner: its podium, between the headline and the scores, cut at the two teams'
 * names, and the scores under it. A pillar is its team's faces, its name, then its points, so `middle` is Team
 * Mint's points and then Team Grape's faces
 */
const sheetParts = (html: string) => {
  const [mintTop, middle, grapePillar] = html.slice(at(html, "wins!"), at(html, ">Scores<")).split(/>Team (?:Mint|Grape)</);
  return { mintTop, middle, grapePillar, scores: html.slice(at(html, ">Scores<"), at(html, "Round")) };
};

/** The replay sheet's round cards, in order: the first card of the sheet is the scores */
const roundCards = (html: string) => html.split('class="ec-card"').slice(2);

describe("the status bar", () => {
  const status = {
    gameType: "lost-in-translation",
    level: 1,
    currentRound: 3,
    totalRounds: 10,
    phase: "drawing" as const,
    drawerName: "Bea",
    drawerAvatar: { type: "preset", value: "panda" },
    guessesSubmitted: 0,
    guessesTotal: 4,
    scores: Object.fromEntries(Object.entries(people).map(([pid, p], i) => [pid, person(p.name, p.avatar, i)])),
  };
  const bar = (extra: object, meId?: string, lang = "en") =>
    renderToStaticMarkup(<GameStatusBar status={{ ...status, ...extra }} lang={lang} meId={meId} />);

  test("without teams it is the bar of an individual game, whoever looks at it", () => {
    const plain = bar({});
    // The top three, by right answers
    expect(plain).toContain('title="Ed: 4/4"');
    expect(plain).not.toContain("Team Mint");
    expect(bar({}, "a")).toBe(plain);
    expect(bar({ teams: undefined, drawingTeam: undefined }, "a")).toBe(plain);
    expect(bar({ teams: null, drawingTeam: null }, "a")).toBe(plain);
  });

  test("team fields that are not two teams are an individual game too, never an error", () => {
    const plain = bar({});
    for (const junk of [[], [teams([1, 2])[0]], [mint, grape], "auto", { 0: 1 }, [{ memberIds: mint }, { memberIds: grape }]]) {
      expect(bar({ teams: junk, drawingTeam: 0 }, "a"), JSON.stringify(junk)).toBe(plain);
    }
  });

  test("with teams it names both, shows their points as sent, and leaves the top three out", () => {
    const html = bar({ teams: teams([240, 300]), drawingTeam: 1 }, "a");
    expect(count(html, ">Team Mint<")).toBe(1);
    expect(count(html, ">Team Grape<")).toBe(1);
    const { mintRow, grapeRow } = barRows(html);
    expect(mintRow).toContain(">240<");
    expect(mintRow).not.toContain(">300<");
    expect(grapeRow).toContain(">300<");
    expect(html).not.toContain('title="Ed: 4/4"');
    // Every member's face is in their own team's row: five faces, and the drawer's in the phase line
    expect(faces(mintRow)).toEqual(mint.map(face));
    expect(faces(grapeRow)).toEqual(grape.map(face));
    expect(count(html, "/icons/av-")).toBe(6);
  });

  test("the viewer's own team is marked once, and it is the team that lists them", () => {
    const forMint = bar({ teams: teams([240, 300]), drawingTeam: 1 }, "c");
    expect(count(forMint, "YOUR TEAM")).toBe(1);
    expect(at(forMint, "YOUR TEAM")).toBeLessThan(at(forMint, ">Team Mint<"));
    const forGrape = bar({ teams: teams([240, 300]), drawingTeam: 1 }, "d");
    expect(count(forGrape, "YOUR TEAM")).toBe(1);
    expect(at(forGrape, "YOUR TEAM")).toBeGreaterThan(at(forGrape, ">Team Mint<"));
    expect(at(forGrape, "YOUR TEAM")).toBeLessThan(at(forGrape, ">Team Grape<"));
  });

  test("someone who is in neither team sees no team marked as theirs", () => {
    expect(bar({ teams: teams([240, 300]), drawingTeam: 1 }, "z")).not.toContain("YOUR TEAM");
    expect(bar({ teams: teams([240, 300]), drawingTeam: 1 })).not.toContain("YOUR TEAM");
  });

  test("the team whose player has the drawing holds the pencil, and between rounds neither does", () => {
    const grapeDraws = bar({ teams: teams([0, 0]), drawingTeam: 1 }, "a");
    expect(grapeDraws).toContain('alt="Team Grape is drawing"');
    expect(grapeDraws).not.toContain('alt="Team Mint');
    const mintDraws = bar({ teams: teams([0, 0]), drawingTeam: 0 }, "a");
    expect(mintDraws).toContain('alt="Team Mint is drawing"');
    expect(mintDraws).not.toContain('alt="Team Grape');
    // Once the drawing is in, the others guess
    expect(bar({ teams: teams([0, 0]), drawingTeam: 0, phase: "guessing" }, "a")).toContain('alt="Team Mint drew"');
    expect(bar({ teams: teams([0, 0]), drawingTeam: 1 }, "b", "ja")).toContain('alt="グレープチームが描画中"');
    for (const none of [null, undefined, 2, "0"]) {
      expect(bar({ teams: teams([0, 0]), drawingTeam: none, phase: "waiting" }, "a"), String(none)).not.toContain('alt="Team');
    }
  });

  test("a Japanese-speaking guest reads it in Japanese", () => {
    const html = bar({ teams: teams([240, 300]), drawingTeam: 1 }, "b", "ja");
    expect(html).toContain("あなたのチーム");
    expect(html).toContain("ミントチーム");
    expect(html).toContain("グレープチーム");
    expect(html).not.toContain("Team");
  });
});

describe("the summary card in the chat", () => {
  type Round = { round: number; prompt: string; results: Record<string, boolean>; teamPoints?: [number, number] };
  const rounds = (points: Array<[number, number] | null>): Round[] =>
    points.map((teamPoints, r) => ({ round: r + 1, prompt: "Cat", results: {}, ...(teamPoints ? { teamPoints } : {}) }));
  const summary = (extra: object) => ({
    gameType: "Lost in Translation",
    level: 1,
    players: people,
    rounds: rounds([[60, 30], [40, 60], null]),
    totals: { a: { correct: 2, total: 3 }, b: { correct: 3, total: 3 }, c: { correct: 1, total: 2 }, d: { correct: 0, total: 2 }, e: { correct: 3, total: 3 } },
    ...extra,
  });
  const card = (data: object, meId = "a", lang = "en") =>
    renderToStaticMarkup(
      <MessageList
        messages={[{ _id: "m1", senderId: "a", kind: "system", status: "processed", text: `game_summary:${JSON.stringify(data)}`, createdAt: 1 }]}
        participants={[]}
        currentParticipantId={meId}
        onReply={() => {}}
        lang={lang}
      />
    );

  test("without teams it is the podium of an individual game", () => {
    const plain = card(summary({}));
    expect(plain).toContain("ec-podium-rank");
    expect(plain).not.toContain("Team Mint");
    expect(plain).not.toContain("wins!");
    expect(card(summary({ teams: null }))).toBe(plain);
    expect(card(summary({ teams: [mint, grape] }))).toBe(plain);
  });

  test("the winner is named, with both teams' points and each team's players under its name", () => {
    const html = card(summary({ teams: teams([100, 90]) }));
    expect(html).toContain("Team Mint wins!");
    // Each tile holds its own team's points, and the winner's is the raised one with the crown
    const { mintTile, grapeTile } = cardParts(html);
    expect(mintTile).toContain(">100<");
    expect(mintTile.startsWith(" top")).toBe(true);
    expect(mintTile).toContain("g-crown");
    expect(grapeTile).toContain(">90<");
    expect(grapeTile.startsWith(" top")).toBe(false);
    expect(grapeTile).not.toContain("g-crown");
    // The sticker is on the viewer's own team, whichever won: Ann is of Team Mint and Di of Team Grape
    expect(count(html, "YOUR TEAM")).toBe(1);
    expect(mintTile).toContain("YOUR TEAM");
    const forGrape = card(summary({ teams: teams([100, 90]) }), "d");
    expect(count(forGrape, "YOUR TEAM")).toBe(1);
    expect(cardParts(forGrape).grapeTile).toContain("YOUR TEAM");
    expect(html).not.toContain("ec-podium-rank");
    // Team Mint's tile, with its three players, comes before Team Grape's, with its two
    const order = ["Ed", "Ann", "Cy", "Bea", "Di"].map((name) => html.indexOf(`>${name}<`));
    expect(order.every((at) => at > 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(html.indexOf("Team Grape")).toBeGreaterThan(order[2]);
    expect(html.indexOf("Team Grape")).toBeLessThan(order[3]);
  });

  test("level points are a draw, and no team is named the winner", () => {
    const html = card(summary({ teams: teams([100, 100]) }));
    expect(html).toContain("It&#x27;s a draw!");
    expect(html).not.toContain("wins!");
    expect(html).not.toContain("ec-podium-tile top");
    expect(card(summary({ teams: teams([100, 100]) }), "b", "ja")).toContain("引き分け！");
  });

  test("a game the host ended early shows the points and names no winner", () => {
    const html = card(summary({ teams: teams([100, 30]), cancelled: true }));
    expect(html).toContain(">100<");
    expect(html).toContain(">30<");
    expect(html).not.toContain("wins!");
    expect(html).not.toContain("draw!");
    expect(html).not.toContain("ec-podium-tile top");
  });

  test("each round's points are shown for both teams, and a round that gave none shows none", () => {
    const html = card(summary({ teams: teams([100, 90]) }));
    // Team Mint's line, the rounds' numbers, then Team Grape's line. Round 3 gave neither team anything: a dash for each
    expect(cardParts(html).strip).toContain("Team Mint 60 40 – 1 2 3 30 60 – Team Grape");
    expect(count(html, ">–</span>")).toBe(2);
    expect(count(card(summary({ teams: teams([0, 0]), rounds: rounds([null, null]) })), ">–</span>")).toBe(4);
    // A round nobody answered is not in the summary, and the rounds that are keep their own numbers
    const gap = rounds([[60, 30], [40, 60]]).map((round, r) => ({ ...round, round: [1, 3][r] }));
    expect(cardParts(card(summary({ teams: teams([100, 90]), rounds: gap }))).strip).toContain("Team Mint 60 40 1 3 30 60 Team Grape");
  });

  test("in Japanese", () => {
    const html = card(summary({ teams: teams([90, 100]) }), "b", "ja");
    expect(html).toContain("グレープチームの勝ち！");
    expect(html).toContain("あなたのチーム");
    expect(html).not.toContain("Team");
  });
});

describe("the replay sheet", () => {
  const guess = (id: string, pid: string, correct: boolean) => ({
    _id: id,
    stepIndex: 1,
    stepType: "guess" as const,
    assignedParticipantId: pid,
    selectedOption: correct ? "Cat" : "Dog",
    correct,
    status: "submitted",
  });
  const chain = (index: number, drawer: string, guesses: Array<[string, boolean]>, teamPoints?: [number, number]) => ({
    _id: `c${index}`,
    chainIndex: index,
    originalPrompt: "Cat",
    options: ["Cat", "Dog", "Sun", "Tree"],
    drawerParticipantId: drawer,
    ...(teamPoints ? { teamPoints } : {}),
    steps: [
      { _id: `c${index}d`, stepIndex: 0, stepType: "draw" as const, assignedParticipantId: drawer, outputDrawingUrl: "data:image/png;base64,AA==", status: "submitted" },
      ...guesses.map(([pid, correct], k) => guess(`c${index}g${k}`, pid, correct)),
    ],
  });
  const replay = (extra: object, cancelled = false) => ({
    session: { _id: "s1", status: "complete", level: 1, ...(cancelled ? { cancelled: true } : {}) },
    chains: [
      // Ann (Mint) draws: Team Mint's two guessers are right, one of Team Grape's two is
      chain(0, "a", [["b", true], ["c", true], ["d", false], ["e", true]], [60, 30]),
      // Bea (Grape) draws and nobody of Team Mint answers: the round gave no points
      chain(1, "b", [["d", true]]),
    ],
    participants: Object.fromEntries(Object.entries(people).map(([pid, p]) => [pid, { nickname: p.name, avatar: { type: "preset", value: p.avatar } }])),
    scores: { a: { correct: 0, total: 0 }, b: { correct: 1, total: 1 }, c: { correct: 1, total: 1 }, d: { correct: 1, total: 2 }, e: { correct: 1, total: 1 } },
    ...extra,
  });
  // The confetti is drawn at random
  const sheet = (data: ReturnType<typeof replay>, meId?: string, lang = "en") => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    return renderToStaticMarkup(<GameReplayModal isOpen replay={data} onClose={() => {}} lang={lang} meId={meId} />);
  };

  test("without teams it is the sheet of an individual game, whoever looks at it", () => {
    const plain = sheet(replay({}));
    expect(plain).not.toContain("Team Mint");
    expect(sheet(replay({}), "a")).toBe(plain);
    expect(sheet(replay({ teams: null }), "a")).toBe(plain);
    expect(sheet(replay({ teams: [mint, grape] }), "a")).toBe(plain);
  });

  test("the winner is named, with both teams' points and each team's players under its name", () => {
    const html = sheet(replay({ teams: teams([60, 30]) }), "c");
    expect(html).toContain("Team Mint wins!");
    expect(count(html, "YOUR TEAM")).toBe(1);
    // The sheet's title has a crown of its own: the winner has one over its pillar and one by its name
    expect(count(html, "g-crown")).toBe(3);
    // Each pillar has its own team's faces over it and its own team's points on it
    const { mintTop, middle, grapePillar, scores } = sheetParts(html);
    expect(faces(mintTop)).toEqual(mint.map(face));
    expect(faces(middle)).toEqual(grape.map(face));
    expect(mintTop).toContain("g-crown");
    expect(middle).toContain(">60</div>");
    expect(middle).toContain("YOUR TEAM");
    expect(grapePillar).toContain(">30</div>");
    // In the scores each team's name has its own points by it, and the winner's a crown. The viewer's own row is marked
    expect(words(scores)).toMatch(/Team Mint 60 pts .* Team Grape 30 pts/);
    expect(words(scores)).toContain("Cy (you)");
    expect(count(html, "(you)")).toBe(1);
    // A long name is cut short with an ellipsis. The marker is not part of what is cut: it follows the name's own
    // span and does not shrink
    expect(scores).toMatch(/text-overflow:ellipsis[^>]*>Cy<\/span><span style="flex:none[^>]*>\(you\)<\/span>/);
    const grapeAt = scores.lastIndexOf("Team Grape");
    expect(at(scores, "g-crown")).toBeLessThan(grapeAt);
    // With Team Grape ahead the crowns are Team Grape's, and the sticker stays on the viewer's team
    const behind = sheetParts(sheet(replay({ teams: teams([30, 60]) }), "c"));
    expect(behind.mintTop).not.toContain("g-crown");
    expect(behind.middle).toContain("g-crown");
    expect(behind.middle).toContain("YOUR TEAM");
    expect(behind.scores.indexOf("g-crown")).toBeGreaterThan(behind.scores.lastIndexOf("Team Grape"));
    // Each player's row follows their own team's name
    for (const name of ["Ann", "Cy", "Ed"]) expect(at(scores, `>${name}`)).toBeLessThan(grapeAt);
    for (const name of ["Bea", "Di"]) expect(at(scores, `>${name}`)).toBeGreaterThan(grapeAt);
  });

  test("a round shows what it gave each team, and a round that gave none shows no points", () => {
    const html = sheet(replay({ teams: teams([60, 30]) }), "c");
    const [first, second] = roundCards(html);
    // Each team's points are by its own name, over its own guessers
    expect(words(first)).toContain("Team Mint +60 pts Cy picked Cat Ed picked Cat Team Grape +30 pts Bea picked Cat Di picked Dog");
    // Team Mint drew round 1, and has the one pencil
    expect(count(first, 'alt="drew"')).toBe(1);
    expect(at(first, 'alt="drew"')).toBeLessThan(at(first, "Team Grape"));
    expect(second).not.toMatch(/\+\d/);
    // Nobody of Team Mint answered round 2 and it gave no points: only Team Grape, which drew, is named
    expect(second).not.toContain("Team Mint");
    expect(second).toContain("Team Grape");
  });

  test("a team game's rounds have the server's numbers, and a round that was not drawn leaves a gap", () => {
    // Rounds 3 and 4 were not drawn, so the server sends rounds 1, 2 and 5. In round 5 Ed (Mint) draws: one of
    // Team Mint's two guessers is right, and both of Team Grape's are
    const chains = [
      chain(0, "a", [["b", true], ["c", true], ["d", false], ["e", true]], [60, 30]),
      chain(1, "b", [["a", true], ["c", true], ["d", true], ["e", true]], [60, 60]),
      chain(4, "e", [["a", true], ["b", true], ["c", false], ["d", true]], [30, 60]),
    ];
    /** The number each round card of the sheet is headed with */
    const numbers = (html: string) => roundCards(html).map((card) => Number(/(?:Round|ラウンド) (\d+)/.exec(words(card))?.[1]));
    const html = sheet(replay({ teams: teams([150, 150]), chains }), "c");
    // The same numbers as the strip of the summary card in the chat, which reads them off the server's summary
    expect(numbers(html)).toEqual([1, 2, 5]);
    expect(numbers(sheet(replay({ teams: teams([150, 150]), chains }), "b", "ja"))).toEqual([1, 2, 5]);
    // The card headed round 5 holds round 5's drawer, points and guesses
    expect(words(roundCards(html)[2])).toContain(
      "Round 5 Ed drew: Cat Team Mint +30 pts Ann picked Cat Cy picked Dog Team Grape +60 pts Bea picked Cat Di picked Cat"
    );
    // An individual game's sheet counts the rounds it lists
    expect(numbers(sheet(replay({ chains }), "c"))).toEqual([1, 2, 3]);
  });

  test("level points are a draw, and a game ended early names no winner", () => {
    const level = sheet(replay({ teams: teams([60, 60]) }), "c");
    expect(level).toContain("It&#x27;s a draw!");
    expect(level).not.toContain("wins!");
    expect(count(level, "g-crown")).toBe(1);
    expect(sheet(replay({ teams: teams([60, 60]) }), "b", "ja")).toContain("引き分け！");
    const early = sheet(replay({ teams: teams([60, 30]) }, true), "c");
    expect(early).not.toContain("wins!");
    expect(early).not.toContain("draw!");
    expect(count(early, "g-crown")).toBe(1);
    expect(early).toContain(">60<");
  });
});

describe("the team tab of the guess and draw overlay", () => {
  const step = (stepType: "draw" | "guess") => ({
    _id: "st1",
    stepIndex: 1,
    stepType,
    inputText: "Cat",
    inputDrawingUrl: "data:image/png;base64,AA==",
    chainMaxSteps: 5,
    level: 1,
    round: 2,
    totalRounds: 10,
    options: ["Cat", "Dog", "Sun", "Tree"],
    timerEnabled: 20,
  });
  const overlay = (stepType: "draw" | "guess", team?: 0 | 1 | null, lang = "en") =>
    renderToStaticMarkup(<GameTaskOverlay step={step(stepType)} onSubmit={async () => null} onQuit={() => {}} lang={lang} team={team} />);

  beforeEach(() => {
    // A static render runs no layout effects, and React says so of the overlay's each time. Anything else it reports is shown
    const report = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) report(...args);
    });
  });

  test.each(["draw", "guess"] as const)("a %s step names the player's team", (stepType) => {
    expect(overlay(stepType, 0)).toContain("Team Mint");
    expect(overlay(stepType, 1)).toContain("Team Grape");
    expect(overlay(stepType, 1, "ja")).toContain("グレープチーム");
  });

  test.each(["draw", "guess"] as const)("without a team a %s step is the overlay of an individual game", (stepType) => {
    const plain = renderToStaticMarkup(<GameTaskOverlay step={step(stepType)} onSubmit={async () => null} onQuit={() => {}} lang="en" />);
    expect(plain).not.toContain("Team");
    expect(overlay(stepType, null)).toBe(plain);
    expect(overlay(stepType, undefined)).toBe(plain);
  });
});

describe("a whole team game, from the server's functions to the screens", () => {
  const PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
    // games.ts logs every step
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Plays the open round: the drawer draws, then everyone else guesses, right if `right` says so */
  async function playRound(t: Backend, players: PID[], right: (pid: PID) => boolean, afterFirstGuess?: () => Promise<void>) {
    const stepOf = async (participantId: PID) => await t.query(api.games.getMyActiveStep, { participantId });
    for (const pid of players) {
      const step = await stepOf(pid);
      if (step?.stepType === "draw") await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: pid, outputDrawingUrl: PNG });
    }
    let first = true;
    for (const pid of players) {
      const step = await stepOf(pid);
      if (step?.stepType !== "guess") continue;
      const chain = await t.run(async (ctx) => await ctx.db.get(step.chainId));
      const selectedOption = right(pid) ? chain!.originalPrompt : chain!.options!.find((option) => option !== chain!.originalPrompt);
      await t.mutation(api.games.submitGameStep, { stepId: step._id, participantId: pid, selectedOption });
      if (first && afterFirstGuess) await afterFirstGuess();
      first = false;
    }
  }

  test("five players in two teams: the bar, the tab, the card and the sheet show what the server sends", async () => {
    const t = newBackend();
    const created = await t.mutation(api.rooms.createRoom, { hostNickname: "Host", hostLanguage: "en" });
    const roomId = created.roomId as Id<"rooms">;
    const hostId = created.hostId as PID;
    const guests = [
      await joinGuest(t, roomId, "Yuki", { avatar: "cat", language: "ja" }),
      await joinGuest(t, roomId, "Mika", { avatar: "panda", language: "ja" }),
      await joinGuest(t, roomId, "Sam", { avatar: "whale", language: "en" }),
      await joinGuest(t, roomId, "Jo", { avatar: "owl", language: "en" }),
    ];
    const players = [hostId, ...guests];
    const me = guests[0];
    await t.mutation(api.games.startGame, { roomId, participantId: hostId, gameType: "lost-in-translation", teams: "auto" });

    // The status of a team game, as the room page hands it to the bar
    const status = (await t.query(api.games.getGameStatus, { roomId }))!;
    const dealt = readTeams(status.teams)!;
    expect(dealt.map((team) => team.memberIds.length).sort()).toEqual([2, 3]);
    expect(dealt.map((team) => team.points)).toEqual([0, 0]);
    // The host draws round 1, so the host's team has the drawing
    expect(status.drawingTeam).toBe(teamOf(dealt, hostId));
    const bar = renderToStaticMarkup(<GameStatusBar status={status} lang="ja" meId={me} />);
    expect(count(bar, "あなたのチーム")).toBe(1);
    expect(bar).toContain("ミントチーム");
    expect(bar).toContain("グレープチーム");

    // The overlay's tab: the room page reads the player's team off the session, which says what the status says
    const session = (await t.query(api.games.getLatestGameSession, { roomId }))!;
    for (const pid of players) expect(teamInSession(session.teams, pid)).toBe(teamOf(dealt, pid));
    expect(teamInSession(session.teams, me)).not.toBeNull();
    const mine = teamOf(dealt, me)!;

    // Round 1: Team Mint's guessers are all right and Team Grape's all wrong. While the round is open the
    // teams' points stay where they were
    await playRound(
      t,
      players,
      (pid) => teamOf(dealt, pid) === 0,
      async () => {
        const open = (await t.query(api.games.getGameStatus, { roomId }))!;
        expect(readTeams(open.teams)!.map((team) => team.points)).toEqual([0, 0]);
      }
    );
    const after = (await t.query(api.games.getGameStatus, { roomId }))!;
    expect(readTeams(after.teams)!.map((team) => team.points)).toEqual([60, 0]);
    const barAfter = renderToStaticMarkup(<GameStatusBar status={after} lang="en" meId={me} />);
    // Each team's points are in its own row, and the sticker is over the name of the team the viewer plays in
    const rows = barRows(barAfter);
    expect(rows.mintRow).toContain(">60<");
    expect(rows.mintRow).not.toContain(">0<");
    expect(rows.grapeRow).toContain(">0<");
    expect(count(barAfter, "YOUR TEAM")).toBe(1);
    expect(at(barAfter, "YOUR TEAM") < at(barAfter, ">Team Mint<")).toBe(mine === 0);

    // The other nine rounds: everyone is right
    for (let r = 1; r < 10; r++) await playRound(t, players, () => true);
    expect(await t.query(api.games.getActiveGameSession, { roomId })).toBeNull();

    // The summary card in the chat
    const messages = await t.query(api.messages.getRoomMessages, { roomId });
    const summary = messages.find((m) => m.text?.startsWith("game_summary:"))!;
    const data = JSON.parse(summary.text!.slice("game_summary:".length));
    expect(readTeams(data.teams)!.map((team) => team.points)).toEqual([600, 540]);
    expect(data.rounds[0].teamPoints).toEqual([60, 0]);
    const roomState = (await t.query(api.rooms.getRoomState, { roomId }))!;
    const card = renderToStaticMarkup(
      <MessageList messages={[summary]} participants={roomState.participants} currentParticipantId={me} onReply={() => {}} lang="en" />
    );
    expect(card).toContain("Team Mint wins!");
    // Each tile holds its own team's points and players. The winner's has the crown, and the viewer's the sticker
    const tiles = cardParts(card);
    const tileOf = [tiles.mintTile, tiles.grapeTile];
    expect(tiles.mintTile).toContain(">600<");
    expect(tiles.mintTile).toContain("g-crown");
    expect(tiles.grapeTile).toContain(">540<");
    expect(tiles.grapeTile).not.toContain("g-crown");
    expect(count(card, "YOUR TEAM")).toBe(1);
    expect(tileOf[mine]).toContain("YOUR TEAM");
    const names = ["Host", "Yuki", "Mika", "Sam", "Jo"];
    for (const [k, pid] of players.entries()) expect(tileOf[teamOf(dealt, pid)!], names[k]).toContain(`>${names[k]}<`);

    // The replay sheet
    const finished = (await t.query(api.games.getLatestGameSession, { roomId }))!;
    const replay = (await t.query(api.games.getGameReplay, { gameSessionId: finished._id }))!;
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sheet = renderToStaticMarkup(<GameReplayModal isOpen replay={replay} onClose={() => {}} lang="en" meId={me} />);
    expect(sheet).toContain("Team Mint wins!");
    // Team Mint's pillar has the crown over it. Each pillar holds its own team's points, and the viewer's the sticker
    const pillars = sheetParts(sheet);
    expect(pillars.mintTop).toContain("g-crown");
    expect(pillars.middle).toContain(">600</div>");
    expect(pillars.grapePillar).toContain(">540</div>");
    expect(count(sheet, "YOUR TEAM")).toBe(1);
    expect([pillars.middle, pillars.grapePillar][mine]).toContain("YOUR TEAM");
    // The viewer's own row in the scores is marked
    expect(words(pillars.scores)).toContain("Yuki (you)");
    expect(count(sheet, "(you)")).toBe(1);
    // Round 1 gave Team Mint 60 points and Team Grape none
    expect(words(roundCards(sheet)[0])).toMatch(/Team Mint \+60 pts .*Team Grape \+0 pts/);

    // The same room played without teams, a while later, is an individual game
    vi.setSystemTime(new Date("2026-10-03T12:30:00Z"));
    await t.mutation(api.games.startGame, { roomId, participantId: hostId, gameType: "lost-in-translation" });
    const plain = (await t.query(api.games.getGameStatus, { roomId }))!;
    expect(readTeams(plain.teams)).toBeNull();
    const plainSession = (await t.query(api.games.getLatestGameSession, { roomId }))!;
    expect(teamInSession(plainSession.teams, me)).toBeNull();
    const plainBar = renderToStaticMarkup(<GameStatusBar status={plain} lang="en" meId={me} />);
    expect(plainBar).not.toContain("YOUR TEAM");
    expect(plainBar).not.toContain("Team Mint");
    await t.finishAllScheduledFunctions(vi.runAllTimers);
  });
});
