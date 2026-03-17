"use client";

import { t } from "@/lib/i18n";

interface EmojifyrStatusBarProps {
  roundIndex: number;
  status: string; // writing, generating, preview, guessing, reveal
  writerName?: string;
  lang: string;
}

export function EmojifyrStatusBar({ roundIndex, status, writerName, lang }: EmojifyrStatusBarProps) {
  const phaseLabel =
    status === "writing"
      ? `${writerName ?? "?"} ${t("is writing...", lang)}`
      : status === "generating" || status === "preview"
        ? t("Generating emojis...", lang)
        : status === "guessing"
          ? t("Guessing...", lang)
          : status === "reveal"
            ? t("Revealing answer!", lang)
            : t("Starting", lang) + "...";

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
        <span>🔥</span>
        <span>{t("Round", lang)} {roundIndex + 1}</span>
      </div>

      {/* Phase */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          flex: 1,
          minWidth: 0,
        }}
      >
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
    </div>
  );
}
