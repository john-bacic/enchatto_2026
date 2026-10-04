import { describe, expect, test } from "vitest";
import {
  leadingTeam,
  readTeamIndex,
  readTeamPoints,
  readTeams,
  teamInSession,
  teamOf,
  teamResultLine,
  teamTitle,
} from "../../lib/game-teams";

// lib/game-teams.ts: how the web reads the teams of a Lost in Translation game out of what the server sends.
// Everything is read leniently: what is not two teams is an individual game, never an error.

const two = [
  { memberIds: ["a", "c", "e"], points: 240 },
  { memberIds: ["b", "d"], points: 300 },
];

describe("readTeams", () => {
  test("two teams with their players and points are read as they are", () => {
    expect(readTeams(two)).toEqual(two);
  });

  test("an answer from a server that knows nothing of teams has none", () => {
    expect(readTeams(undefined)).toBeNull();
    expect(readTeams(null)).toBeNull();
  });

  test("anything that is not two teams is no teams, so the individual game is drawn", () => {
    expect(readTeams([])).toBeNull();
    expect(readTeams([two[0]])).toBeNull();
    expect(readTeams([...two, two[0]])).toBeNull();
    expect(readTeams({ 0: two[0], 1: two[1] })).toBeNull();
    expect(readTeams("auto")).toBeNull();
    // The session's own shape, two lists of ids, is not what a status or a replay carries
    expect(readTeams([["a"], ["b"]])).toBeNull();
    expect(readTeams([two[0], { memberIds: ["b"] }])).toBeNull();
    expect(readTeams([two[0], { memberIds: "b", points: 1 }])).toBeNull();
    expect(readTeams([two[0], { memberIds: [1, 2], points: 1 }])).toBeNull();
    expect(readTeams([two[0], { memberIds: ["b"], points: "1" }])).toBeNull();
    expect(readTeams([two[0], { memberIds: ["b"], points: NaN }])).toBeNull();
    expect(readTeams([two[0], null])).toBeNull();
  });

  test("fields this build does not know are left out", () => {
    expect(readTeams([{ ...two[0], name: "Mint" }, two[1]])).toEqual(two);
  });
});

describe("readTeamPoints", () => {
  test("what a round gave the two teams is read as it is, nothing included", () => {
    expect(readTeamPoints([60, 30])).toEqual([60, 30]);
    expect(readTeamPoints([0, 0])).toEqual([0, 0]);
  });

  test("a round without points, void or cut short, has none to show", () => {
    expect(readTeamPoints(undefined)).toBeNull();
    expect(readTeamPoints(null)).toBeNull();
  });

  test("anything that is not two numbers is no points", () => {
    expect(readTeamPoints([])).toBeNull();
    expect(readTeamPoints([60])).toBeNull();
    expect(readTeamPoints([60, 30, 0])).toBeNull();
    expect(readTeamPoints([60, "30"])).toBeNull();
    expect(readTeamPoints([60, NaN])).toBeNull();
    expect(readTeamPoints({ right: 1, counted: 2 })).toBeNull();
  });
});

describe("who is in which team", () => {
  const teams = readTeams(two)!;

  test("a player is in the team that lists them", () => {
    expect(teamOf(teams, "a")).toBe(0);
    expect(teamOf(teams, "d")).toBe(1);
  });

  test("someone who is in neither, and nobody at all, has no team", () => {
    expect(teamOf(teams, "z")).toBeNull();
    expect(teamOf(teams, "")).toBeNull();
    expect(teamOf(teams, undefined)).toBeNull();
    expect(teamOf(teams, null)).toBeNull();
  });

  test("the session's own teams, two lists of ids, say the same", () => {
    const session = [["a", "c", "e"], ["b", "d"]];
    expect(teamInSession(session, "c")).toBe(0);
    expect(teamInSession(session, "b")).toBe(1);
    expect(teamInSession(session, "z")).toBeNull();
    expect(teamInSession(session, "")).toBeNull();
  });

  test("a session without teams, or with anything that is not two lists, puts nobody in a team", () => {
    expect(teamInSession(undefined, "a")).toBeNull();
    expect(teamInSession(null, "a")).toBeNull();
    expect(teamInSession([], "a")).toBeNull();
    expect(teamInSession([["a"]], "a")).toBeNull();
    expect(teamInSession([["a"], ["b"], ["c"]], "a")).toBeNull();
    expect(teamInSession([["a"], "b"], "a")).toBeNull();
    expect(teamInSession("a", "a")).toBeNull();
  });

  test("a team's number on its own is 0 or 1, and anything else is no team", () => {
    expect(readTeamIndex(0)).toBe(0);
    expect(readTeamIndex(1)).toBe(1);
    expect(readTeamIndex(2)).toBeNull();
    expect(readTeamIndex(-1)).toBeNull();
    expect(readTeamIndex("0")).toBeNull();
    expect(readTeamIndex(null)).toBeNull();
    expect(readTeamIndex(undefined)).toBeNull();
  });
});

describe("the result", () => {
  const level: [{ memberIds: string[]; points: number }, { memberIds: string[]; points: number }] = [
    { memberIds: ["a"], points: 540 },
    { memberIds: ["b"], points: 540 },
  ];

  test("the team with more points leads, and level teams have no leader", () => {
    expect(leadingTeam(readTeams(two)!)).toBe(1);
    expect(leadingTeam([two[1], two[0]])).toBe(0);
    expect(leadingTeam(level)).toBeNull();
  });

  test("team 0 is Team Mint and team 1 is Team Grape, in both languages", () => {
    expect(teamTitle(0)).toBe("Team Mint");
    expect(teamTitle(1, "en")).toBe("Team Grape");
    expect(teamTitle(0, "ja")).toBe("ミントチーム");
    expect(teamTitle(1, "ja")).toBe("グレープチーム");
  });

  test("the headline names the winner in the viewer's language", () => {
    expect(teamResultLine(readTeams(two)!, "en")).toBe("Team Grape wins!");
    expect(teamResultLine(readTeams(two)!, "ja")).toBe("グレープチームの勝ち！");
    expect(teamResultLine([two[1], two[0]])).toBe("Team Mint wins!");
  });

  test("level points are a draw, and nobody is named", () => {
    expect(teamResultLine(level, "en")).toBe("It's a draw!");
    expect(teamResultLine(level, "ja")).toBe("引き分け！");
    expect(teamResultLine([{ memberIds: [], points: 0 }, { memberIds: [], points: 0 }])).toBe("It's a draw!");
  });
});
