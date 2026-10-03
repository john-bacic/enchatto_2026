"use client";

import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthedMutation } from "@/lib/convex";
import { AvatarDisc } from "@/components/ui/avatar";
import { Confetti } from "@/components/ui/effects";
import { Icon } from "@/components/ui/icon";
import { errorText, sfx, speak, type ViewProps, type WRLang } from "./shared";

export interface SeenWord {
  cardIndex: number;
  en: string;
  ja: string;
  correct: boolean | null;
}

const PODIUM = [
  { place: 2, height: 74, color: "var(--blue)", d: "-.2s", d2: ".15s" },
  { place: 1, height: 104, color: "var(--yellow)", d: "0s", d2: "0s" },
  { place: 3, height: 54, color: "var(--pink)", d: "-.35s", d2: ".3s" },
];

export function ResultsView({
  state,
  myId,
  learning,
  s,
  toast,
  words,
  onClose,
}: Pick<ViewProps, "state" | "myId" | "learning" | "s" | "toast"> & { words: SeenWord[]; onClose: () => void }) {
  const playAgain = useAuthedMutation(api.wordRush.playAgain);
  const [busy, setBusy] = useState(false);
  const ranked = [...state.players].sort((a, b) => b.score - a.score || b.correct - a.correct);
  const top = ranked.slice(0, 3);

  useEffect(() => {
    sfx("tada");
  }, []);

  const again = async () => {
    setBusy(true);
    try {
      await playAgain({ gameId: state._id, participantId: myId });
      onClose();
    } catch (e) {
      toast(errorText(e, s.error));
      setBusy(false);
    }
  };

  const target: WRLang = learning;

  return (
    <>
      <Confetti burstKey={state._id} />
      <div className="wr-title" style={{ marginTop: 18 }}>
        {s.resultsTitle}
      </div>
      <div className="wr-podium">
        {PODIUM.map((slot) => {
          const p = top[slot.place - 1];
          if (!p) return <div key={slot.place} className="wr-pod" />;
          return (
            <div key={slot.place} className="wr-pod">
              <div className="av" style={{ "--d": slot.d } as React.CSSProperties}>
                {slot.place === 1 && <img className="crown" src="/icons/g-crown.png" alt="" />}
                <AvatarDisc id={p.avatarValue} size={slot.place === 1 ? 72 : 62} border={3.5} />
              </div>
              <div className="name">{p.participantId === myId ? s.you : p.nickname}</div>
              <div className="score">{p.score.toLocaleString()}</div>
              <div className="block" style={{ height: slot.height, background: slot.color, "--d2": slot.d2 } as React.CSSProperties}>
                {slot.place}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ec-card" style={{ padding: "14px 12px 16px", marginTop: -14, borderRadius: "0 0 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="wr-stats">
          {ranked.map((p, i) => (
            <div key={p.participantId} className={`wr-stat-row${p.participantId === myId ? " me" : ""}`}>
              <span className="rank">{i + 1}</span>
              <AvatarDisc id={p.avatarValue} size={28} />
              <span className="nm">{p.participantId === myId ? s.you : p.nickname}</span>
              <span className="chips">
                <span style={{ "--c": "var(--mint-soft)" } as React.CSSProperties} title={s.correct}>
                  <Icon name="g-ok" size={14} />
                  {p.correct}/{state.totalCards}
                </span>
                <span style={{ "--c": "var(--yellow-soft)" } as React.CSSProperties} title={s.bestStreak}>
                  <Icon name="g-bolt" size={14} />
                  {p.bestStreak}
                </span>
                {state.sayIt && (
                  <span style={{ "--c": "var(--pink-soft)" } as React.CSSProperties} title={s.sayItBonus}>
                    <Icon name="g-music" size={14} />+{p.sayItBonus}
                  </span>
                )}
              </span>
              <b>{p.score.toLocaleString()}</b>
            </div>
          ))}
        </div>

        {words.length > 0 && (
          <div>
            <div className="ec-label" style={{ justifyContent: "center" }}>
              {s.wordsThisGame} <small>{s.tapToHear}</small>
            </div>
            <div className="wr-words">
              {words.map((w) => (
                <button
                  key={w.cardIndex}
                  type="button"
                  style={{ "--c": w.correct === false ? "var(--pink-soft)" : "var(--mint-soft)" } as React.CSSProperties}
                  onClick={() => speak(target === "en" ? w.en : w.ja, target)}
                >
                  {target === "en" ? w.en : w.ja} <em>{target === "en" ? w.ja : w.en}</em>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 10 }}>
        <button type="button" className="ec-btn" style={{ flex: 1, fontSize: 17, lineHeight: 1.1 }} onClick={onClose}>
          {s.backToChat}
        </button>
        <button type="button" className="ec-btn pink wiggle" style={{ flex: 1, fontSize: 18 }} onClick={again} disabled={busy}>
          {s.again}
        </button>
      </div>
    </>
  );
}
