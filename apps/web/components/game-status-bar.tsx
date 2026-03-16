"use client";

import { getAvatarById } from "@/lib/types";
import { t } from "@/lib/i18n";

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
  const { currentRound, totalRounds, phase, drawerName, drawerAvatar, guessesSubmitted, guessesTotal, scores } = status;

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

  const drawerAv = drawerAvatar ? getAvatarById(drawerAvatar.value) : null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        fontSize: "0.8rem",
        overflow: "hidden",
      }}
    >
      {/* Round indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          flexShrink: 0,
          fontWeight: 700,
          fontSize: "0.75rem",
        }}
      >
        <span style={{ opacity: 0.8 }}>R</span>
        <span>{currentRound}/{totalRounds}</span>
      </div>

      {/* Phase + drawer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          flex: 1,
          minWidth: 0,
        }}
      >
        {drawerAv && (
          <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: drawerAv.color,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              flexShrink: 0,
            }}
          >
            {drawerAv.emoji}
          </span>
        )}
        {phase === "drawing" && (
          <span
            style={{
              display: "inline-block",
              animation: "gameStatusPencil 1s ease-in-out infinite",
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            ✏️
          </span>
        )}
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {phaseLabel}
        </span>
      </div>

      {/* Scores (top 3) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexShrink: 0,
        }}
      >
        {sortedScores.slice(0, 3).map(([pid, s]) => {
          const av = getAvatarById(s.avatar.value);
          return (
            <div
              key={pid}
              title={`${s.nickname}: ${s.correct}/${s.total}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "2px 6px",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: "0.65rem" }}>{av.emoji}</span>
              <span>{s.correct}</span>
            </div>
          );
        })}
      </div>

      {/* Pencil animation keyframes */}
      <style>{`
        @keyframes gameStatusPencil {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
