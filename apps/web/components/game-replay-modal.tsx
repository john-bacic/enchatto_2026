"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Confetti } from "@/components/ui/effects";

interface StepData {
  _id: string;
  stepIndex: number;
  stepType: "draw" | "guess";
  assignedParticipantId: string;
  inputText?: string;
  inputDrawingUrl?: string;
  outputText?: string;
  translatedOutputText?: string;
  outputDrawingUrl?: string;
  selectedOption?: string;
  correct?: boolean;
  status: string;
}

interface ChainData {
  _id: string;
  chainIndex: number;
  originalPrompt: string;
  options?: string[];
  drawerParticipantId?: string;
  steps: StepData[];
}

interface ReplayData {
  session: { _id: string; status: string; level?: number };
  chains: ChainData[];
  participants: Record<string, { nickname: string; avatar: { type: string; value: string } }>;
  scores?: Record<string, { correct: number; total: number }>;
  promptTranslations?: Record<string, string>;
}

interface GameReplayModalProps {
  isOpen: boolean;
  replay: ReplayData | null;
  isHost?: boolean;
  prevTimerSeconds?: number;
  onNextLevel?: (timerSeconds: number) => void;
  onClose: () => void;
  lang?: string;
}

// Translate a game prompt to the viewer's preferred language
function translatePrompt(text: string, lang: string | undefined, translations: Record<string, string> | undefined): string {
  if (!translations) return text;
  if (lang === "ja") {
    // English→Japanese
    return translations[text] ?? text;
  }
  // Japanese→English (reverse lookup)
  const entry = Object.entries(translations).find(([, ja]) => ja === text);
  return entry ? entry[0] : text;
}

export function GameReplayModal({ isOpen, replay, isHost, prevTimerSeconds, onNextLevel, onClose, lang }: GameReplayModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(prevTimerSeconds ?? 20);

  if (!isOpen || !replay) return null;

  // Build sorted leaderboard from scores
  const scoreEntries = replay.scores
    ? Object.entries(replay.scores)
        .map(([pid, score]) => ({
          pid,
          nickname: replay.participants[pid]?.nickname ?? "?",
          avatar: replay.participants[pid]?.avatar,
          ...score,
        }))
        .sort((a, b) => b.correct - a.correct)
    : [];

  const podium = [scoreEntries[1], scoreEntries[0], scoreEntries[2]];
  const podiumStyle = [
    { h: 58, bg: "var(--blue)", rank: 2 },
    { h: 84, bg: "var(--yellow)", rank: 1 },
    { h: 42, bg: "var(--pink)", rank: 3 },
  ];

  const timerChip = (on: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "5px 0",
    border: "2.5px solid var(--ink)",
    borderRadius: 999,
    background: on ? "var(--yellow)" : "#fff",
    boxShadow: on ? "0 3px 0 var(--ink)" : "none",
    transform: on ? "translateY(-2px)" : "none",
    fontSize: 12.5,
    fontWeight: 900,
  });

  return (
    <div className="ec-sheet-backdrop" onClick={onClose}>
      <Confetti burstKey={replay.session._id} count={50} />
      <div
        className="ec-sheet"
        style={{ display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "88dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "12px 16px 8px", textAlign: "center" }}>
          <div style={{ width: 54, height: 6, margin: "0 auto 10px", borderRadius: 3, background: "var(--line-soft)" }} />
          <h2
            className="ec-chunky"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 22,
              textShadow: "0 3px 0 var(--yellow)",
              animation: "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both",
            }}
          >
            <Icon name="g-crown" size={32} />
            {t("Game Results", lang)}
          </h2>
          <div style={{ marginTop: 4 }}>
            <span
              style={{
                padding: "2px 10px",
                border: "2.5px solid var(--ink)",
                borderRadius: 999,
                background: "var(--violet-soft)",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {t("Level", lang)} {replay.session.level ?? 1}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px 16px" }}>
          {/* Podium */}
          {scoreEntries.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginTop: 18 }}>
              {podium.map((entry, i) => {
                if (!entry) return <div key={i} style={{ width: 96 }} />;
                const ps = podiumStyle[i];
                return (
                  <div key={entry.pid} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96 }}>
                    <div style={{ position: "relative", animation: `ec-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) ${0.15 * (3 - ps.rank)}s both` }}>
                      {ps.rank === 1 && (
                        <Icon
                          name="g-crown"
                          size={34}
                          style={{ position: "absolute", left: "50%", top: -26, marginLeft: -17, transform: "rotate(-10deg)", zIndex: 1 }}
                        />
                      )}
                      {entry.avatar ? <AvatarDisc id={entry.avatar.value} size={ps.rank === 1 ? 58 : 50} /> : null}
                    </div>
                    <div style={{ marginTop: 6, maxWidth: "100%", fontSize: 12, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.nickname}
                    </div>
                    <div className="ec-chunky" style={{ fontSize: 14 }}>
                      {entry.correct}/{entry.total}
                    </div>
                    <div
                      className="ec-chunky"
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "100%",
                        height: ps.h,
                        marginTop: 4,
                        border: "3px solid var(--ink)",
                        borderBottom: 0,
                        borderRadius: "14px 14px 0 0",
                        background: ps.bg,
                        color: "#fff",
                        fontSize: 28,
                        textShadow: "var(--outline2), 0 3px 0 var(--ink)",
                      }}
                    >
                      {ps.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {scoreEntries.length > 0 && (
            <div className="ec-card" style={{ borderRadius: "0 0 20px 20px", padding: "8px 10px", marginBottom: 18, boxShadow: "0 5px 0 var(--ink)" }}>
              <div className="ec-label" style={{ justifyContent: "center", marginBottom: 6 }}>
                {t("Scores", lang)}
              </div>
              {scoreEntries.map((entry, idx) => (
                <div
                  key={entry.pid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 10px 4px 4px",
                    marginBottom: 5,
                    border: "2.5px solid var(--ink)",
                    borderRadius: 999,
                    background: idx === 0 ? "var(--yellow-soft)" : "#fff",
                  }}
                >
                  {entry.avatar && <AvatarDisc id={entry.avatar.value} size={28} border={2} />}
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.nickname}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>
                    <b className="ec-chunky" style={{ fontSize: 14, opacity: 1 }}>{entry.correct}</b>/{entry.total} {t("correct", lang)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Round-by-round breakdown */}
          {replay.chains.map((chain, ci) => {
            const drawStep = chain.steps.find((s) => s.stepType === "draw" && s.status === "submitted");
            const guessSteps = chain.steps.filter((s) => s.stepType === "guess" && s.status === "submitted");
            const drawerPid = chain.drawerParticipantId;
            const drawer = drawerPid ? replay.participants[drawerPid] : null;

            return (
              <div
                key={chain._id}
                className="ec-card"
                style={{
                  marginTop: 12,
                  marginBottom: ci < replay.chains.length - 1 ? 18 : 6,
                  padding: "16px 12px 12px",
                  borderRadius: 22,
                  boxShadow: "0 5px 0 var(--ink)",
                }}
              >
                {/* Round header */}
                <span
                  className="ec-chunky"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: -14,
                    padding: "2px 10px",
                    border: "2.5px solid var(--ink)",
                    borderRadius: 10,
                    background: "var(--violet)",
                    color: "#fff",
                    fontSize: 12,
                    transform: "rotate(-3deg)",
                    textShadow: "0 2px 0 var(--ink)",
                  }}
                >
                  {t("Round", lang)} {ci + 1}
                </span>

                {/* Drawer + prompt */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {drawer && <AvatarDisc id={drawer.avatar.value} size={32} border={2.5} />}
                  <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.6 }}>
                      {drawer?.nickname ?? "?"} {t("drew", lang)}:
                    </div>
                    <div className="ec-chunky" style={{ fontSize: 16, wordBreak: "break-word" }}>
                      {translatePrompt(chain.originalPrompt, lang, replay.promptTranslations)}
                    </div>
                  </div>
                  <Icon name="g-pencil" size={26} style={{ marginLeft: "auto" }} />
                </div>

                {/* Drawing */}
                {drawStep?.outputDrawingUrl && (
                  <div style={{ marginBottom: 8, padding: 4, border: "2.5px dashed var(--line-soft)", borderRadius: 14, background: "#fffdf8" }}>
                    <img
                      src={drawStep.outputDrawingUrl}
                      alt="Drawing"
                      style={{ display: "block", width: "100%", maxWidth: 220, margin: "0 auto", borderRadius: 10 }}
                    />
                  </div>
                )}

                {/* Guesser results */}
                {guessSteps.map((step) => {
                  const participant = replay.participants[step.assignedParticipantId];
                  const rawPicked = step.selectedOption ?? step.outputText ?? "?";
                  const picked = translatePrompt(rawPicked, lang, replay.promptTranslations);

                  return (
                    <div
                      key={step._id}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "3px 6px 3px 3px",
                        marginTop: 5,
                        border: "2px solid var(--ink)",
                        borderRadius: 999,
                        background: step.correct ? "var(--mint-soft)" : "var(--pink-soft)",
                      }}
                    >
                      {participant ? <AvatarDisc id={participant.avatar.value} size={26} border={2} /> : null}
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700 }}>
                        {lang === "ja" ? (
                          <>
                            {participant?.nickname ?? "?"}が「<strong style={{ fontWeight: 900 }}>{picked}</strong>」を選んだ
                          </>
                        ) : (
                          <>
                            {participant?.nickname ?? "?"} {t("picked", lang)} <strong style={{ fontWeight: 900 }}>{picked}</strong>
                          </>
                        )}
                      </span>
                      <Icon name={step.correct ? "g-ok" : "g-no"} size={24} alt={step.correct ? "✓" : "✗"} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: "3px solid var(--ink)", background: "#fff" }}>
          {/* Timer picker (host only) */}
          {isHost && onNextLevel && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[10, 20, 30, 0].map((sec) => (
                <button key={sec} onClick={() => setTimerSeconds(sec)} style={timerChip(timerSeconds === sec)}>
                  {sec === 0 ? t("Off", lang) : `${sec}s`}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ec-btn white" style={{ flex: 1, minHeight: 54, fontSize: 17 }} onClick={onClose}>
              {t("Close", lang)}
            </button>
            {isHost && onNextLevel && (
              <button
                className="ec-btn pink wiggle"
                style={{ flex: 1.3, minHeight: 54, fontSize: 17 }}
                onClick={() => {
                  onClose();
                  onNextLevel(timerSeconds);
                }}
              >
                {t("Next Level", lang)} ➜
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
