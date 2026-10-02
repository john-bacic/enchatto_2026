"use client";

import { useEffect, useRef } from "react";
import { t } from "@/lib/i18n";

interface VibeInfoProps {
  vibe: string;
  score: number;
  hypeAt: number;
  messageCount: number;
  switches: number;
  mult: number;
  hype: boolean;
  lang: string;
  /** The badge that opened the card; clicks on it toggle instead of counting as "outside" */
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export function VibeInfo({ vibe, score, hypeAt, messageCount, switches, mult, hype, lang, anchorRef, onClose }: VibeInfoProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (cardRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  const rows = [
    { icon: "msg", title: "Each message", points: "+12", live: String(messageCount) },
    { icon: "swap", title: "EN ⇄ JA switch", points: "+20", live: String(switches) },
    { icon: "combo", title: "Back-and-forth combo", points: t("up to ×2", lang), live: `×${mult.toFixed(2)}` },
  ];

  return (
    <div ref={cardRef} className="ec-vibe-info" role="dialog" aria-label={t("What's the Vibe?", lang)}>
      <div className="ec-vibe-info-head">
        <h3>{t("What's the Vibe?", lang)}</h3>
        <b>{vibe}</b>
      </div>
      <p>
        {t(
          "A live party meter for the room. It climbs when people chat, and fastest when English and Japanese go back and forth.",
          lang,
        )}
      </p>
      <div className="ec-vibe-info-col">{t("Last minute", lang)}</div>
      {rows.map((r) => (
        <div key={r.icon} className="ec-vibe-info-row">
          <i className={r.icon} aria-hidden>
            <RowIcon kind={r.icon} />
          </i>
          <div>
            <strong>{t(r.title, lang)}</strong>
            <small>{r.points}</small>
          </div>
          <span>{r.live}</span>
        </div>
      ))}
      <div className="ec-vibe-info-goal">
        {hype ? t("Party mode is on!", lang) : t("Party mode at 150: confetti for every new message", lang)}
      </div>
      <div className="ec-vibe-info-bar">
        <i style={{ width: `max(8px, ${Math.min(1, score / hypeAt) * 100}%)` }} />
      </div>
      <p className="note">{t("Only the last minute counts, so it cools off when the chat goes quiet.", lang)}</p>
    </div>
  );
}

function RowIcon({ kind }: { kind: string }) {
  if (kind === "msg") {
    return (
      <svg viewBox="0 0 16 16">
        <path d="M3 3h10a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 13 11H7l-3 2.5V11H3a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 3 3z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "swap") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5.5h10M10.5 3 13 5.5 10.5 8M13 10.5H3M5.5 8 3 10.5 5.5 13" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16">
      <path d="M8 1.5c.6 2.4 4 4 4 7.6A4 4 0 0 1 4 9.1c0-1.6.8-2.7 1.8-3.6.1 1.2.6 2 1.4 2.4C7 5.6 7.4 3.4 8 1.5z" fill="currentColor" />
    </svg>
  );
}
