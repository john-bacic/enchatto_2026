"use client";

import { t } from "@/lib/i18n";
import { getAvatarById } from "@/lib/types";

interface EmojifyrRevealModalProps {
  emojiClue: string;
  originalSentence: string;
  guesses: Array<{ participantId: string; guessText: string; nickname?: string; avatar?: string }>;
  isHost: boolean;
  lang: string;
  onNextRound?: () => void;
  onClose: () => void;
}

export function EmojifyrRevealModal({
  emojiClue,
  originalSentence,
  guesses,
  isHost,
  lang,
  onNextRound,
  onClose,
}: EmojifyrRevealModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "400px",
          margin: "1rem",
          maxHeight: "80dvh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            {t("Emojifyr Result", lang)}
          </h2>
        </div>

        {/* Emoji clue */}
        <div
          style={{
            fontSize: "2.5rem",
            lineHeight: 1.3,
            textAlign: "center",
            padding: "0.75rem 0.5rem",
            background: "var(--bg)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            wordBreak: "break-word",
          }}
        >
          {emojiClue}
        </div>

        {/* Original sentence revealed */}
        <div
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "8px",
            padding: "0.75rem",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "0.25rem" }}>
            {t("Original", lang)}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
            {originalSentence}
          </div>
        </div>

        {/* Guesses list */}
        {guesses.length > 0 && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--muted)" }}>
              {t("Guesses", lang)} ({guesses.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {guesses.map((g, i) => {
                const av = g.avatar ? getAvatarById(g.avatar) : null;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "var(--bg)",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {av && (
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: av.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          flexShrink: 0,
                        }}
                      >
                        {av.emoji}
                      </span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>
                        {g.nickname ?? "?"}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {g.guessText}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "8px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t("Close", lang)}
          </button>
          {isHost && onNextRound && (
            <button
              onClick={onNextRound}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                fontSize: "0.85rem",
              }}
            >
              {t("Next Round", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
