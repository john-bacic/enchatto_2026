"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/drawing-canvas";
import { Icon } from "@/components/ui/icon";
import { Confetti } from "@/components/ui/effects";
import { t } from "@/lib/i18n";

interface GameStep {
  _id: string;
  stepIndex: number;
  stepType: "draw" | "guess";
  inputText?: string;
  hintText?: string;
  inputDrawingUrl?: string;
  chainMaxSteps: number;
  level?: number;
  round?: number;
  totalRounds?: number;
  options?: string[];
  correctOption?: string;
  timerEnabled?: number | boolean;
}

interface GameTaskOverlayProps {
  step: GameStep;
  onSubmit: (stepId: string, outputText?: string, outputDrawingUrl?: string, selectedOption?: string) => void;
  onQuit?: () => void;
  lang?: string;
}

const COPY = {
  en: { title: "LOST IN TRANSLATION", yourTurn: "YOUR TURN TO DRAW!", lv: "LV" },
  ja: { title: "ロスト・イン・トランスレーション", yourTurn: "あなたが描く番！", lv: "LV" },
};

const ANSWER_COLORS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--mint-soft)", "var(--blue-soft)"];

export function GameTaskOverlay({ step, onSubmit, onQuit, lang }: GameTaskOverlayProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // timerEnabled: number (0=off, 10/20/30=seconds) or legacy boolean
  const timerSeconds = typeof step.timerEnabled === "number"
    ? step.timerEnabled
    : (step.timerEnabled !== false ? 20 : 0);
  const timerOn = timerSeconds > 0;
  const [timeLeft, setTimeLeft] = useState(step.stepType === "draw" && timerOn ? timerSeconds : -1);
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const autoSubmittedRef = useRef(false);
  const c = lang === "ja" ? COPY.ja : COPY.en;

  const handleDrawingSave = useCallback(async (dataUrl: string) => {
    if (submitting) return;
    setSubmitting(true);
    await onSubmit(step._id, undefined, dataUrl);
  }, [submitting, onSubmit, step._id]);

  // Countdown timer for draw mode (only if timer enabled)
  useEffect(() => {
    if (step.stepType !== "draw" || !timerOn) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step.stepType, timerOn]);


  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft !== 0 || step.stepType !== "draw" || autoSubmittedRef.current || submitting) return;
    autoSubmittedRef.current = true;
    const dataUrl = canvasRef.current?.exportImage();
    if (dataUrl) {
      handleDrawingSave(dataUrl);
    }
  }, [timeLeft, step.stepType, submitting, handleDrawingSave]);

  const handleOptionSelect = (option: string) => {
    if (submitting || showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);

    // Wait 1.5s then submit
    setTimeout(async () => {
      setSubmitting(true);
      await onSubmit(step._id, option, undefined, option);
    }, 1500);
  };

  const isCorrect = selectedAnswer === step.correctOption;
  const round = step.round ?? 1;
  const totalRounds = step.totalRounds ?? 10;
  const level = step.level ?? 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
        background:
          "repeating-linear-gradient(-45deg, rgba(167, 123, 255, 0.09) 0 14px, transparent 14px 28px), var(--paper)",
      }}
    >
      {/* Header: quit + round segments */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 8px" }}>
        {onQuit && (
          <button
            className="ec-round-btn"
            onClick={() => setShowQuitConfirm(true)}
            aria-label={t("Quit", lang)}
            style={{ width: 40, height: 40, fontSize: 16, boxShadow: "0 3px 0 var(--ink)" }}
          >
            ✕
          </button>
        )}
        <div style={{ flex: 1, display: "flex", gap: 4 }}>
          {Array.from({ length: totalRounds }, (_, i) => {
            const done = i + 1 < round;
            const now = i + 1 === round;
            return (
              <i
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  border: "2px solid var(--ink)",
                  borderRadius: 6,
                  background: done ? "var(--mint)" : now ? "var(--yellow)" : "#fff",
                  animation: now ? "ec-pulse 0.8s ease-in-out infinite" : undefined,
                }}
              />
            );
          })}
        </div>
        <div className="ec-chunky" style={{ fontSize: 20, whiteSpace: "nowrap" }} aria-label={`${t("Round", lang)} ${round} ${t("of", lang)} ${totalRounds}`}>
          {round}
          <small style={{ fontSize: 13, opacity: 0.5 }}>/{totalRounds}</small>
        </div>
      </div>

      {/* Quit confirmation */}
      {showQuitConfirm && (
        <div
          className="ec-sheet-backdrop"
          style={{ zIndex: 70, alignItems: "center", padding: 20 }}
          onClick={() => setShowQuitConfirm(false)}
        >
          <div
            className="ec-card"
            style={{ width: "100%", maxWidth: 300, padding: "20px 18px 18px", textAlign: "center", animation: "ec-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="g-bang" size={52} />
            <div className="ec-chunky" style={{ fontSize: 20, margin: "6px 0 4px" }}>
              {t("Quit game?", lang)}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 16 }}>
              {t("Are you sure you want to quit the game?", lang)}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ec-btn white sm" onClick={() => setShowQuitConfirm(false)}>
                {t("Cancel", lang)}
              </button>
              <button
                className="ec-btn red sm"
                onClick={() => {
                  setShowQuitConfirm(false);
                  onQuit?.();
                }}
              >
                {t("Quit", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span
            className="ec-chunky"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
              padding: "3px 12px 3px 6px",
              border: "2.5px solid var(--ink)",
              borderRadius: 999,
              background: "#fff",
              boxShadow: "0 3px 0 var(--ink)",
              fontSize: lang === "ja" ? 11 : 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <Icon name="g-pencil" size={24} />
            {c.title}
          </span>
          <span
            style={{
              flex: "none",
              padding: "2px 10px",
              border: "2.5px solid var(--ink)",
              borderRadius: 999,
              background: "var(--violet-soft)",
              fontSize: 11,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {c.lv} {level}
          </span>
        </div>

        {step.stepType === "draw" ? (
          /* Draw mode: show prompt + canvas */
          <>
            <div className="ec-card" style={{ marginTop: 10, padding: "20px 16px 14px", textAlign: "center", borderRadius: 22 }}>
              <span
                className="ec-chunky"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: -16,
                  transform: "translateX(-50%) rotate(-2deg)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 12px 3px 6px",
                  border: "2.5px solid var(--ink)",
                  borderRadius: 999,
                  background: "var(--yellow)",
                  boxShadow: "0 3px 0 var(--ink)",
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon name="g-pencil" size={22} style={{ animation: "ec-wave 0.5s ease-in-out infinite alternate" }} />
                {c.yourTurn}
              </span>
              <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.6, marginBottom: 4 }}>
                {t("Draw this phrase:", lang)}
              </div>
              <div
                className="ec-chunky"
                style={{ fontSize: 26, lineHeight: 1.15, wordBreak: "break-word", animation: "ec-pop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1)" }}
              >
                {step.inputText}
              </div>
            </div>
            <DrawingCanvas
              ref={canvasRef}
              onSave={handleDrawingSave}
              onCancel={() => {}}
              gameMode
              countdownSeconds={timerOn ? timeLeft : -1}
              lang={lang}
            />
          </>
        ) : (
          /* Guess mode: show drawing + 4 multiple-choice buttons */
          <>
            {step.inputDrawingUrl && (
              <div className="ec-card" style={{ marginTop: 12, padding: 10, borderRadius: 24 }}>
                <span
                  className="ec-chunky"
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    left: "50%",
                    top: -18,
                    transform: "translateX(-50%) rotate(-2deg)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 12px 3px 6px",
                    border: "2.5px solid var(--ink)",
                    borderRadius: 999,
                    background: "var(--yellow)",
                    boxShadow: "0 3px 0 var(--ink)",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon name="g-question" size={24} />
                  {t("What is this drawing?", lang)}
                </span>
                <div
                  style={{
                    border: "2.5px dashed var(--line-soft)",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#fffdf8",
                  }}
                >
                  <img
                    src={step.inputDrawingUrl}
                    alt="Drawing to guess"
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                {showFeedback && (
                  <div
                    className="ec-stamp"
                    style={{
                      position: "absolute",
                      right: -6,
                      bottom: -14,
                      width: 84,
                      height: 84,
                      fontSize: lang === "ja" ? 15 : 13,
                      borderColor: isCorrect ? "var(--mint)" : "var(--red)",
                      color: isCorrect ? "#1aa37c" : "var(--red)",
                    }}
                  >
                    {isCorrect ? t("Correct!", lang) : t("Wrong!", lang)}
                  </div>
                )}
              </div>
            )}

            {/* Feedback text */}
            {showFeedback && (
              <div
                className="ec-outline"
                style={{
                  textAlign: "center",
                  fontSize: 30,
                  color: isCorrect ? "var(--mint)" : "var(--red)",
                  animation: isCorrect
                    ? "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both"
                    : "ec-shake 0.45s ease-in-out",
                }}
              >
                {isCorrect ? t("Correct!", lang) : t("Wrong!", lang)}
              </div>
            )}
            {showFeedback && isCorrect && <Confetti burstKey={step._id} count={40} />}

            {/* 2x2 grid of choice buttons */}
            {step.options && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: "auto", paddingTop: 6 }}>
                {step.options.map((option, i) => {
                  const picked = option === selectedAnswer;
                  const isAnswer = option === step.correctOption;
                  let bg = ANSWER_COLORS[i % ANSWER_COLORS.length];
                  let color = "var(--ink)";
                  let pressed = false;
                  let anim: string | undefined;
                  if (showFeedback) {
                    if (isAnswer) {
                      bg = "var(--mint)";
                      anim = "ec-kick 0.6s ease-in-out 2";
                    } else if (picked) {
                      bg = "var(--red)";
                      color = "#fff";
                      pressed = true;
                      anim = "ec-shake 0.45s ease-in-out";
                    }
                  } else if (picked) {
                    bg = "var(--blue)";
                    color = "#fff";
                    pressed = true;
                  }
                  const dim = showFeedback && !isAnswer && !picked;

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showFeedback || submitting}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 78,
                        padding: "10px 10px",
                        border: "3.5px solid var(--ink)",
                        borderRadius: 20,
                        background: bg,
                        color,
                        boxShadow: pressed ? "0 2px 0 var(--ink)" : "0 6px 0 var(--ink)",
                        transform: pressed ? "translateY(4px)" : "none",
                        opacity: dim ? 0.5 : 1,
                        fontFamily: "var(--chunky)",
                        fontWeight: 400,
                        fontSize: option.length > 18 ? 15 : 18,
                        lineHeight: 1.15,
                        textAlign: "center",
                        wordBreak: "break-word",
                        cursor: showFeedback || submitting ? "default" : "pointer",
                        transition: "transform 0.08s, box-shadow 0.08s, background 0.15s",
                        animation: anim,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: -6,
                          top: -9,
                          display: "grid",
                          placeItems: "center",
                          width: 24,
                          height: 24,
                          border: "2.5px solid var(--ink)",
                          borderRadius: 8,
                          background: ANSWER_COLORS[i % ANSWER_COLORS.length],
                          color: "var(--ink)",
                          fontSize: 12,
                          transform: "rotate(-8deg)",
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
