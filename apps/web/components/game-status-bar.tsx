"use client";

import { t } from "@/lib/i18n";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { TeamDot, YourTeamTag } from "@/components/ui/team";
import { TEAM_LOOK, readTeamIndex, readTeams, teamOf, teamTitle, type GameTeam, type TeamIndex } from "@/lib/game-teams";

type Score = { correct: number; total: number; nickname: string; avatar: { type: string; value: string } };

interface GameStatusBarProps {
  status: {
    gameType: string;
    level: number;
    currentRound: number;
    totalRounds: number;
    phase: "drawing" | "guessing" | "waiting";
    drawerName: string | null;
    drawerAvatar: { type: string; value: string } | null;
    guessesSubmitted: number;
    guessesTotal: number;
    scores: Record<string, Score>;
    /** A team game only: the two teams, with their points over the rounds that have ended */
    teams?: GameTeam[];
    /** A team game only: the team (0 or 1) whose member has the drawing this round, null between rounds */
    drawingTeam?: number | null;
  };
  lang: string;
  /** The viewer, to mark their own team */
  meId?: string;
}

/**
 * The two teams under the phase line, one row each: name, members in the order they take the drawing, points.
 * A row holds its team's whole name beside three-digit points on a phone 320 px wide, which two tiles side by
 * side do not; members who do not fit beside them go onto a second line.
 */
function TeamRows({
  teams,
  scores,
  drawerTeam,
  drawing,
  meId,
  lang,
}: {
  teams: [GameTeam, GameTeam];
  scores: Record<string, Score>;
  /** The team whose member has this round's drawing */
  drawerTeam: TeamIndex | null;
  /** They are drawing now. Once the drawing is in, the others guess */
  drawing: boolean;
  meId?: string;
  lang: string;
}) {
  const mine = teamOf(teams, meId);
  // What the pencil says of its team: "Team Mint is drawing", and "Team Mint drew" once the others guess
  const pencilAlt = (team: TeamIndex) => `${teamTitle(team, lang)}${lang === "ja" ? "" : " "}${t(drawing ? "is drawing" : "drew", lang)}`;
  return (
    // Room above each row for the sticker that sits on the top edge of the viewer's own
    <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 7 }}>
      {teams.map((team, i) => {
        const index = i === 0 ? 0 : 1;
        const isMine = index === mine;
        return (
          <div
            key={index}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px 3px 5px",
              border: "2.5px solid var(--ink)",
              borderRadius: 14,
              background: TEAM_LOOK[index].soft,
              boxShadow: isMine ? "0 3px 0 var(--ink)" : "none",
            }}
          >
            {/* Above the team's name, clear of the dot and of the name's own letters */}
            {isMine && <YourTeamTag lang={lang} style={{ left: 24, top: -13 }} />}
            {/* The team's colour, as a dot. On the team whose player has this round's drawing it holds a pencil, waving while they draw */}
            <span style={{ display: "grid", placeItems: "center", flex: "none", width: 18, height: 18 }}>
              {index === drawerTeam ? (
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 18,
                    height: 18,
                    border: "2px solid var(--ink)",
                    borderRadius: "50%",
                    background: TEAM_LOOK[index].color,
                  }}
                >
                  <Icon
                    name="g-pencil"
                    size={13}
                    alt={pencilAlt(index)}
                    style={{ animation: drawing ? "ec-wave 0.5s ease-in-out infinite alternate" : undefined }}
                  />
                </span>
              ) : (
                <TeamDot team={index} />
              )}
            </span>
            <span className="ec-chunky" style={{ flex: "none", fontSize: 12, whiteSpace: "nowrap" }}>
              {teamTitle(index, lang)}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
              {team.memberIds.map(
                (pid) =>
                  scores[pid] && <AvatarDisc key={pid} id={scores[pid].avatar.value} size={18} border={1.5} />
              )}
            </div>
            {/* Keyed by the points, so the number kicks when a round that has ended adds to it */}
            <span
              key={team.points}
              className="ec-chunky"
              style={{ flex: "none", fontSize: 18, lineHeight: 1, animation: "ec-kick 0.6s ease-in-out" }}
            >
              {team.points}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function GameStatusBar({ status, lang, meId }: GameStatusBarProps) {
  const { level, currentRound, totalRounds, phase, drawerName, drawerAvatar, guessesSubmitted, guessesTotal, scores } = status;
  // Null in an individual game and from a server that sends no teams: the bar is then that of an individual game
  const teams = readTeams(status.teams);

  // Sort scores by correct descending
  const sortedScores = Object.entries(scores).sort(
    ([, a], [, b]) => b.correct - a.correct
  );

  const phaseLabel =
    phase === "drawing"
      ? `${drawerName ?? "?"} ${t("is drawing", lang)}...`
      : phase === "guessing"
        ? guessesTotal > 0
          ? `${t("Guessing", lang)}... (${guessesSubmitted}/${guessesTotal})`
          : t("Guessing", lang) + "..."
        : t("Starting", lang) + "...";

  const guessPct = guessesTotal > 0 ? Math.min(100, (guessesSubmitted / guessesTotal) * 100) : 0;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        gap: 7,
        padding: "8px 12px 9px",
        background: "var(--paper)",
        borderBottom: "3px solid var(--ink)",
        boxShadow: "0 3px 0 rgba(29, 27, 79, 0.12)",
      }}
    >
      {/* Round segments */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className="ec-chunky"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            flex: "none",
            padding: "1px 9px 1px 3px",
            border: "2.5px solid var(--ink)",
            borderRadius: 999,
            background: "var(--violet-soft)",
            fontSize: 11,
          }}
        >
          <Icon name="g-pencil" size={20} />
          {t("Level", lang)} {level}
        </span>
        <div style={{ flex: 1, display: "flex", gap: 3 }}>
          {Array.from({ length: totalRounds }, (_, i) => {
            const done = i + 1 < currentRound;
            const now = i + 1 === currentRound;
            return (
              <i
                key={i}
                style={{
                  flex: 1,
                  height: 9,
                  border: "2px solid var(--ink)",
                  borderRadius: 6,
                  background: done ? "var(--mint)" : now ? "var(--yellow)" : "#fff",
                  animation: now ? "ec-pulse 0.9s ease-in-out infinite" : undefined,
                }}
              />
            );
          })}
        </div>
        <span className="ec-chunky" style={{ flex: "none", fontSize: 16, lineHeight: 1 }}>
          {currentRound}
          <small style={{ fontSize: 11, opacity: 0.5 }}>/{totalRounds}</small>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {/* Phase + drawer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: 1,
            minWidth: 0,
            padding: "2px 10px 2px 2px",
            border: "2.5px solid var(--ink)",
            borderRadius: 999,
            background: phase === "drawing" ? "var(--yellow)" : phase === "guessing" ? "var(--blue-soft)" : "#fff",
            boxShadow: "0 2px 0 var(--ink)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {phase === "guessing" && guessesTotal > 0 && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: `${guessPct}%`,
                background: "var(--mint-soft)",
                transition: "width 0.4s ease",
              }}
            />
          )}
          {drawerAvatar ? (
            <AvatarDisc id={drawerAvatar.value} size={24} border={2} style={{ position: "relative" }} />
          ) : (
            <span style={{ width: 4 }} />
          )}
          <span
            style={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {phaseLabel}
          </span>
          {phase === "drawing" && (
            <Icon
              name="g-pencil"
              size={20}
              style={{ position: "relative", flex: "none", animation: "ec-wave 0.5s ease-in-out infinite alternate" }}
            />
          )}
        </div>

        {/* Scores (top 3). A team game shows the teams' points instead, in rows of their own */}
        {!teams && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "none" }}>
            {sortedScores.slice(0, 3).map(([pid, s], i) => (
              <div
                key={pid}
                title={`${s.nickname}: ${s.correct}/${s.total}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "1px 7px 1px 1px",
                  border: "2px solid var(--ink)",
                  borderRadius: 999,
                  background: i === 0 && s.correct > 0 ? "var(--yellow-soft)" : "#fff",
                }}
              >
                <AvatarDisc id={s.avatar.value} size={20} border={1.5} />
                <span className="ec-chunky" style={{ fontSize: 12 }}>
                  {s.correct}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {teams && (
        <TeamRows
          teams={teams}
          scores={scores}
          drawerTeam={readTeamIndex(status.drawingTeam)}
          drawing={phase === "drawing"}
          meId={meId}
          lang={lang}
        />
      )}
    </div>
  );
}
