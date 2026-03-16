"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { getAvatarById } from "@/lib/types";

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          width: "100%",
          maxWidth: "400px",
          maxHeight: "80dvh",
          margin: "1rem",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            🎮 {t("Game Results", lang)} — {t("Level", lang)} {replay.session.level ?? 1}
          </h2>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>
          {/* Score summary */}
          {scoreEntries.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                🏆 {t("Scores", lang)}
              </div>
              {scoreEntries.map((entry, idx) => {
                const av = entry.avatar ? getAvatarById(entry.avatar.value) : null;
                return (
                  <div
                    key={entry.pid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.6rem",
                      background: idx === 0 ? "#fef3c7" : "var(--bg)",
                      borderRadius: "6px",
                      marginBottom: "0.3rem",
                      border: idx === 0 ? "1px solid #fbbf24" : "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: av?.color ?? "var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        flexShrink: 0,
                      }}
                    >
                      {av?.emoji ?? "?"}
                    </div>
                    <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600 }}>
                      {entry.nickname}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {entry.correct}/{entry.total} {t("correct", lang)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Round-by-round breakdown */}
          {replay.chains.map((chain, ci) => {
            const drawStep = chain.steps.find((s) => s.stepType === "draw" && s.status === "submitted");
            const guessSteps = chain.steps.filter((s) => s.stepType === "guess" && s.status === "submitted");
            const drawerPid = chain.drawerParticipantId;
            const drawer = drawerPid ? replay.participants[drawerPid] : null;

            return (
              <div key={chain._id} style={{ marginBottom: ci < replay.chains.length - 1 ? "1.5rem" : 0 }}>
                {/* Round header */}
                <div style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}>
                  {t("Round", lang)} {ci + 1}
                </div>

                {/* Drawer + prompt */}
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.6rem 0.75rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                }}>
                  <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                    {drawer?.nickname ?? "?"} {t("drew", lang)}: </span>
                  <strong>{translatePrompt(chain.originalPrompt, lang, replay.promptTranslations)}</strong>
                </div>

                {/* Drawing */}
                {drawStep?.outputDrawingUrl && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <img
                      src={drawStep.outputDrawingUrl}
                      alt="Drawing"
                      style={{
                        width: "100%",
                        maxWidth: "200px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}

                {/* Guesser results */}
                {guessSteps.map((step) => {
                  const participant = replay.participants[step.assignedParticipantId];
                  const av = participant ? getAvatarById(participant.avatar.value) : null;
                  const rawPicked = step.selectedOption ?? step.outputText ?? "?";
                  const picked = translatePrompt(rawPicked, lang, replay.promptTranslations);

                  return (
                    <div key={step._id} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", alignItems: "center" }}>
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: av?.color ?? "var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        flexShrink: 0,
                      }}>
                        {av?.emoji ?? "?"}
                      </div>
                      <span style={{ fontSize: "0.8rem" }}>
                        {participant?.nickname ?? "?"} {t("picked", lang)} <strong>{picked}</strong>
                      </span>
                      <span style={{ fontSize: "0.85rem" }}>
                        {step.correct ? "✅" : "❌"}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)" }}>
          {/* Timer picker (host only) */}
          {isHost && onNextLevel && (
            <div style={{
              display: "flex",
              gap: "0",
              marginBottom: "0.5rem",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}>
              {[10, 20, 30, 0].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTimerSeconds(sec)}
                  style={{
                    flex: 1,
                    padding: "0.4rem 0",
                    fontSize: "0.75rem",
                    fontWeight: timerSeconds === sec ? 700 : 500,
                    background: timerSeconds === sec ? "var(--primary)" : "var(--bg)",
                    color: timerSeconds === sec ? "#fff" : "var(--muted)",
                    border: "none",
                    borderRight: sec !== 0 ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                  }}
                >
                  {sec === 0 ? t("Off", lang) : `${sec}s`}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
              }}
            >
              {t("Close", lang)}
            </button>
            {isHost && onNextLevel && (
              <button
                onClick={() => {
                  onClose();
                  onNextLevel(timerSeconds);
                }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                {t("Next Level", lang)} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
