import { t } from "./i18n";

/** One of the two teams of a Lost in Translation team game, as the server sends it */
export interface GameTeam {
  /** Its players' participant ids, in the order they take their team's turns to draw */
  memberIds: string[];
  /** Its points over the rounds that have ended: a round still being guessed adds nothing yet */
  points: number;
}

/** A team is known by its place in the game's `teams`: 0 or 1 */
export type TeamIndex = 0 | 1;

/**
 * Team 0 is Team Mint and team 1 is Team Grape on every client (iOS: EC.mint / EC.mintSoft and EC.violet /
 * EC.violetSoft). Not pink and blue: in this app those mean Japanese and English. Text on either colour is ink:
 * plain white does not read on mint. The one exception is the points on a replay pillar, which are white inside an
 * ink outline, like the ranks on the individual podium.
 */
export const TEAM_LOOK = [
  { name: "Team Mint", color: "var(--mint)", soft: "var(--mint-soft)" },
  { name: "Team Grape", color: "var(--violet)", soft: "var(--violet-soft)" },
] as const;

/**
 * The two teams in what games.getGameStatus or games.getGameReplay answered, or in a game_summary message.
 * Null for an individual game, for a server that knows nothing of teams, and for anything else that is not two
 * teams: the caller then draws an individual game.
 */
export function readTeams(value: unknown): [GameTeam, GameTeam] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const teams: GameTeam[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const { memberIds, points } = entry as Record<string, unknown>;
    if (!Array.isArray(memberIds) || !memberIds.every((id) => typeof id === "string")) return null;
    if (typeof points !== "number" || !Number.isFinite(points)) return null;
    teams.push({ memberIds: memberIds as string[], points });
  }
  return [teams[0], teams[1]];
}

/** A team's number as the server sends it on its own (the team whose member has the drawing), or null */
export function readTeamIndex(value: unknown): TeamIndex | null {
  return value === 0 || value === 1 ? value : null;
}

/**
 * What a round gave team 0 and team 1, or null: a round that gave neither team anything has no points to show.
 * That is a round still open, one a team had nobody counted in, and one the host's Cancel cut short.
 */
export function readTeamPoints(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const [mint, grape] = value;
  if (typeof mint !== "number" || !Number.isFinite(mint) || typeof grape !== "number" || !Number.isFinite(grape)) return null;
  return [mint, grape];
}

/** The team a participant plays in, or null for someone who is in neither: a guest who came after the start */
export function teamOf(teams: readonly GameTeam[], participantId: string | null | undefined): TeamIndex | null {
  if (!participantId) return null;
  return readTeamIndex(teams.findIndex((team) => team.memberIds.includes(participantId)));
}

/**
 * The team a participant plays in, read off the game session's own `teams`: two lists of participant ids.
 * Null in an individual game, and for anything that is not two lists.
 */
export function teamInSession(sessionTeams: unknown, participantId: string | null | undefined): TeamIndex | null {
  if (!participantId || !Array.isArray(sessionTeams) || sessionTeams.length !== 2) return null;
  if (!sessionTeams.every((members) => Array.isArray(members))) return null;
  return readTeamIndex(sessionTeams.findIndex((members: unknown[]) => members.includes(participantId)));
}

/** The team ahead on points, or null while they are level. Level at the end is a draw: nothing breaks the tie */
export function leadingTeam(teams: readonly [GameTeam, GameTeam]): TeamIndex | null {
  if (teams[0].points === teams[1].points) return null;
  return teams[0].points > teams[1].points ? 0 : 1;
}

/** "Team Mint" / "ミントチーム" */
export function teamTitle(team: TeamIndex, lang?: string): string {
  return t(TEAM_LOOK[team].name, lang);
}

/** The headline of a finished game: "Team Mint wins!", or "It's a draw!" */
export function teamResultLine(teams: readonly [GameTeam, GameTeam], lang?: string): string {
  const winner = leadingTeam(teams);
  return winner === null ? t("It's a draw!", lang) : t("{team} wins!", lang).replace("{team}", teamTitle(winner, lang));
}
