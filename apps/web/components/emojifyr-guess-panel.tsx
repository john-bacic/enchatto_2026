"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

interface EmojifyrGuessPanelProps {
  emojiClue: string;
  lang: string;
  guessCount?: number;
  onSubmitGuess: (guess: string) => void;
}

export function EmojifyrGuessPanel({ emojiClue, lang, guessCount, onSubmitGuess }: EmojifyrGuessPanelProps) {
  const [guess, setGuess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const trimmed = guess.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    onSubmitGuess(trimmed);
  };

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
          maxWidth: "380px",
          margin: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
          {t("What does this mean?", lang)}
        </h2>

        {/* Emoji clue display */}
        <div
          style={{
            fontSize: "3rem",
            lineHeight: 1.3,
            padding: "1rem 0.5rem",
            background: "var(--bg)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            wordBreak: "break-word",
          }}
        >
          {emojiClue}
        </div>

        {/* Guess count */}
        {guessCount !== undefined && guessCount > 0 && (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            {guessCount} {t("guesses submitted", lang)}
          </div>
        )}

        {/* Text input */}
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={t("Type your guess...", lang)}
          autoFocus
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--foreground)",
            fontSize: "0.95rem",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!guess.trim() || submitting}
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "8px",
            background: !guess.trim() ? "var(--border)" : "linear-gradient(135deg, var(--primary), #7c3aed)",
            color: "#fff",
            fontWeight: 600,
            cursor: !guess.trim() ? "default" : "pointer",
            border: "none",
            fontSize: "0.85rem",
          }}
        >
          {submitting ? t("Submitting...", lang) : t("Submit Guess", lang)}
        </button>
      </div>
    </div>
  );
}
