// Chatto Dash outside the race itself: the screens before and after a round rendered to static markup (the
// lobby, a round's results, the podium), the rule for when the room draws the game at all, the Resume button,
// and the End Game button's rule with a tournament on. The race is three.js on a canvas and is not drawn here;
// what its physics does is held by dash-levels.test.ts.

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { DashLobby } from "@/components/dash/lobby";
import { DashFinal, DashRoundResults, standings } from "@/components/dash/results";
import { ordinal, raceClock } from "@/components/dash/strings";
import { ResumeButtons } from "@/components/room/resume-buttons";
import { DASH_COURSE_COUNT, DASH_LEVEL_COUNT } from "@/convex/dash";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { dashLive, dashOn } from "@/lib/dash/on-screen";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { LEVEL_COUNT } from "@/lib/dash/levels";
import { endGameRule } from "@/lib/end-game";

type Game = Doc<"dashGames">;
const pid = (name: string) => name as Id<"participants">;
const NOW = 1_800_000_000_000;

function game(over: Partial<Game> = {}): Game {
  return {
    _id: "dash1" as Id<"dashGames">,
    _creationTime: NOW,
    roomId: "room1" as Id<"rooms">,
    status: "lobby",
    hostParticipantId: pid("host"),
    players: [
      { participantId: pid("host"), nickname: "Hana", avatarValue: "rabbit", joinedAt: NOW, score: 0 },
      { participantId: pid("aki"), nickname: "Aki", avatarValue: "fox", joinedAt: NOW, score: 0 },
    ],
    levels: [7, 2, 9, 0, 5],
    round: 0,
    finishes: [],
    results: [],
    createdAt: NOW,
    ...over,
  };
}

const text = (markup: string) =>
  markup.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const noop = () => {};

describe("the courses", () => {
  test("the server counts as many as there are, and each has a name; a tournament runs some of them", () => {
    expect(LEVEL_COUNT).toBe(DASH_COURSE_COUNT);
    expect(LEVEL_NAMES).toHaveLength(DASH_COURSE_COUNT);
    expect(DASH_LEVEL_COUNT).toBeLessThanOrEqual(DASH_COURSE_COUNT);
  });
});

describe("the lobby", () => {
  const draw = (g: Game, me: string, lang = "en") =>
    text(renderToStaticMarkup(<DashLobby game={g} participantId={me} lang={lang} coarse onJoin={noop} onLeave={noop} onStart={noop} onCancel={noop} onClose={noop} />));

  test("its host is offered Start and Cancel, with the tournament's five courses in their order and everyone who is in", () => {
    const shown = draw(game(), "host");
    expect(shown).toContain("Chatto Dash");
    const drawn = [7, 2, 9, 0, 5].map((level) => LEVEL_NAMES[level].en);
    expect(drawn.map((name) => shown.indexOf(name))).toEqual([...drawn.map((name) => shown.indexOf(name))].sort((a, b) => a - b));
    LEVEL_NAMES.forEach((name, level) => expect(shown.includes(name.en)).toBe([7, 2, 9, 0, 5].includes(level)));
    // A lobby from before the courses were drawn names none
    expect(draw(game({ levels: [] }), "host")).not.toContain("five courses");
    expect(shown).toContain("Hana");
    expect(shown).toContain("Aki");
    expect(shown).toContain("START!");
    expect(shown).toContain("Cancel");
    expect(shown).not.toContain("JOIN THE RACE!");
  });

  test("a player waits for the host; someone who is not in is offered a seat", () => {
    expect(draw(game(), "aki")).toContain("Waiting for the host to start");
    expect(draw(game(), "aki")).toContain("Leave");
    const outside = draw(game(), "ben");
    expect(outside).toContain("JOIN THE RACE!");
    expect(outside).not.toContain("START!");
  });

  test("in Japanese", () => {
    const shown = draw(game(), "host", "ja");
    expect(shown).toContain("チャットダッシュ");
    expect(shown).toContain("スタート！");
    for (const level of [7, 2, 9, 0, 5]) expect(shown).toContain(LEVEL_NAMES[level].ja);
  });
});

describe("after a round", () => {
  const afterOne = game({
    status: "results",
    levels: [0, 1, 2, 3, 4],
    round: 0,
    nextAt: NOW + 10_000,
    players: [
      { participantId: pid("host"), nickname: "Hana", avatarValue: "rabbit", joinedAt: NOW, score: 8 },
      { participantId: pid("aki"), nickname: "Aki", avatarValue: "fox", joinedAt: NOW, score: 10 },
    ],
    results: [
      {
        level: 0,
        rows: [
          { participantId: pid("aki"), ms: 41_250, progress: 1, place: 1, points: 10 },
          { participantId: pid("host"), ms: 63_400, progress: 1, place: 2, points: 8 },
        ],
      },
    ],
  });

  test("the round's placings with their times, then the standings", () => {
    const shown = text(renderToStaticMarkup(<DashRoundResults game={afterOne} participantId="host" lang="en" serverNow={() => NOW} />));
    expect(shown).toContain("Round 1/5 · Kaiten Rush");
    expect(shown.indexOf("Aki")).toBeLessThan(shown.indexOf("Hana"));
    expect(shown).toContain("0:41.3");
    expect(shown).toContain("1:03.4");
    expect(shown).toContain("+10");
    expect(shown).toContain("10 pts");
  });

  test("only whoever is handed the way on gets the button that skips the wait", () => {
    const waiting = text(renderToStaticMarkup(<DashRoundResults game={afterOne} participantId="guest" lang="en" serverNow={() => NOW} />));
    expect(waiting).toContain("Next course in");
    expect(waiting).not.toContain("Next course ▶");
    const host = renderToStaticMarkup(<DashRoundResults game={afterOne} participantId="host" lang="en" serverNow={() => NOW} onNext={noop} />);
    expect(text(host)).toContain("Next course ▶");
    expect(host.match(/<button/g)).toHaveLength(1);
  });

  test("someone who did not finish is shown by how far they got", () => {
    const dnf = { ...afterOne, results: [{ level: 0, rows: [afterOne.results[0].rows[0], { participantId: pid("host"), progress: 0.62, place: 2, points: 0 }] }] };
    const shown = text(renderToStaticMarkup(<DashRoundResults game={dnf} participantId="host" lang="en" serverNow={() => NOW} />));
    expect(shown).toContain("62%");
    expect(shown).toContain("+0");
  });

  test("the podium names the winner, or a tie", () => {
    const done = { ...afterOne, status: "completed" as const, endedAt: NOW };
    const shown = text(renderToStaticMarkup(<DashFinal game={done} participantId="host" lang="en" onPlayAgain={noop} onClose={noop} />));
    expect(shown).toContain("WINNER!");
    expect(shown).toContain("PLAY AGAIN");
    const level = { ...done, players: done.players.map((p) => ({ ...p, score: 9 })) };
    expect(text(renderToStaticMarkup(<DashFinal game={level} participantId="host" lang="en" onPlayAgain={noop} onClose={noop} />))).toContain("IT'S A TIE!");
    expect(standings(level).map((p) => p.place)).toEqual([1, 1]);
    expect(standings(done).map((p) => [p.nickname, p.place])).toEqual([["Aki", 1], ["Hana", 2]]);
  });
});

describe("the words", () => {
  test("places and times", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23].map((n) => ordinal(n, "en"))).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd"]);
    expect(ordinal(2, "ja")).toBe("2位");
    expect(raceClock(5.04)).toBe("0:05.0");
    expect(raceClock(83.42)).toBe("1:23.4");
  });
});

describe("when the room draws the game", () => {
  test("a lobby, a race and results always; a podium for five minutes; a canceled game never", () => {
    expect(dashLive(null)).toBe(false);
    for (const status of ["lobby", "racing", "results"]) {
      expect(dashLive({ status }, NOW)).toBe(true);
      expect(dashOn({ status })).toBe(true);
    }
    expect(dashLive({ status: "canceled" }, NOW)).toBe(false);
    expect(dashLive({ status: "completed", endedAt: NOW - 4 * 60_000 }, NOW)).toBe(true);
    expect(dashLive({ status: "completed", endedAt: NOW - 6 * 60_000 }, NOW)).toBe(false);
    expect(dashOn({ status: "completed" })).toBe(false);
    expect(dashOn(undefined)).toBe(false);
  });

  test("put away, it leaves a Resume button", () => {
    const base = { truthOrDareGame: null, dismissedTruthOrDareId: null, setDismissedTruthOrDareId: noop, lang: "en", emojiMatchGame: null, emojiMatchOnScreen: false, dismissedEmojiMatchId: null, setDismissedEmojiMatchId: noop, emojiBingoGame: null, dismissedEmojiBingoId: null, setDismissedEmojiBingoId: noop } as unknown as Parameters<typeof ResumeButtons>[0];
    const racing = game({ status: "racing" });
    expect(renderToStaticMarkup(<ResumeButtons {...base} dashGame={racing} dismissedDashId={racing._id} setDismissedDashId={noop} />)).toContain("Resume Chatto Dash");
    expect(renderToStaticMarkup(<ResumeButtons {...base} dashGame={racing} dismissedDashId={null} setDismissedDashId={noop} />)).not.toContain("Resume Chatto Dash");
    expect(renderToStaticMarkup(<ResumeButtons {...base} dashGame={game({ status: "canceled" })} dismissedDashId={racing._id} setDismissedDashId={noop} />)).not.toContain("Resume Chatto Dash");
  });
});

describe("the End Game button", () => {
  const rule = (dashGame: Game | null, role: "host" | "participant", cancelDash = vi.fn(async () => null)) => ({
    cancelDash,
    ...endGameRule({
      wordRushGame: null,
      activeGameSession: null,
      emojiMatchGame: null,
      emojiBingoGame: null,
      truthOrDareGame: null,
      dashGame,
      me: { role } as never,
      lang: "en",
      endTruthOrDare: vi.fn() as never,
      participantId: "host",
      cancelEmojiBingo: vi.fn() as never,
      cancelEmojiMatch: vi.fn() as never,
      cancelWordRush: vi.fn() as never,
      cancelDash: cancelDash as never,
      cancelGameMutation: vi.fn() as never,
      roomId: "room1",
    }),
  });

  test("a tournament under way is a game that is on, for the host to end", async () => {
    vi.stubGlobal("confirm", () => true);
    const on = rule(game({ status: "racing" }), "host");
    expect(on).toMatchObject({ gameOn: true, isGameActive: true });
    await on.onEndGame!();
    expect(on.cancelDash).toHaveBeenCalledWith({ gameId: "dash1", participantId: "host" });
    expect(rule(game({ status: "racing" }), "participant")).toMatchObject({ gameOn: true, isGameActive: false, onEndGame: undefined });
    expect(rule(game({ status: "completed" }), "host")).toMatchObject({ gameOn: false, isGameActive: false });
    vi.unstubAllGlobals();
  });
});
