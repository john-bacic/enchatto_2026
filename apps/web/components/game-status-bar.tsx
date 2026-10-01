"use client";

import { t } from "@/lib/i18n";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";

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
    scores: Record<string, { correct: number; total: number; nickname: string; avatar: { type: string; value: string } }>;
  };
  lang: string;
}

export function GameStatusBar({ status, lang }: GameStatusBarProps) {
  const { level, currentRound, totalRounds, phase, drawerName, drawerAvatar, guessesSubmitted, guessesTotal, scores } = status;

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

        {/* Scores (top 3) */}
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
      </div>
    </div>
  );
}
