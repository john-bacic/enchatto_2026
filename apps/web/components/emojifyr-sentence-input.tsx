"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

interface EmojifyrSentenceInputProps {
  lang: string;
  onSubmit: (sentence: string) => void;
  onCancel: () => void;
}

export function EmojifyrSentenceInput({ lang, onSubmit, onCancel }: EmojifyrSentenceInputProps) {
  const [sentence, setSentence] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxLen = 80;

  const handleSubmit = async () => {
    const trimmed = sentence.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    onSubmit(trimmed);
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
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>🔥</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            {t("Write a sentence for Emojifyr", lang)}
          </h2>
        </div>

        {/* Helper text */}
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", textAlign: "center", margin: 0, lineHeight: 1.4 }}>
          {t("Use a short, visual sentence that can be turned into emojis.", lang)}
        </p>

        {/* Textarea */}
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          maxLength={maxLen}
          placeholder={t("e.g. A cat riding a skateboard", lang)}
          autoFocus
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--foreground)",
            fontSize: "0.95rem",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />

        {/* Character counter */}
        <div
          style={{
            textAlign: "right",
            fontSize: "0.75rem",
            color: sentence.length >= maxLen ? "#ef4444" : "var(--muted)",
            marginTop: "-0.5rem",
          }}
        >
          {sentence.length} / {maxLen}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onCancel}
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
            {t("Cancel", lang)}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!sentence.trim() || submitting}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "8px",
              background: !sentence.trim() ? "var(--border)" : "linear-gradient(135deg, var(--primary), #7c3aed)",
              color: "#fff",
              fontWeight: 600,
              cursor: !sentence.trim() ? "default" : "pointer",
              border: "none",
              fontSize: "0.85rem",
            }}
          >
            {submitting ? t("Submitting...", lang) : t("Generate Emojis", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
