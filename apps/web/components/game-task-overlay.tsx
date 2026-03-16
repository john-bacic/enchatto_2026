"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/drawing-canvas";
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {onQuit && (
          <button
            onClick={() => setShowQuitConfirm(true)}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--border)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "var(--muted)",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        )}
        <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>
          🎮 {t("Level", lang)} {step.level ?? 1}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.15rem" }}>
          {t("Round", lang)} {step.round ?? 1} {t("of", lang)} {step.totalRounds ?? 10}
        </div>
      </div>

      {/* Quit confirmation */}
      {showQuitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowQuitConfirm(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "280px",
              margin: "1rem",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              {t("Quit game?", lang)}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
              {t("Are you sure you want to quit the game?", lang)}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowQuitConfirm(false)}
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
                {t("Cancel", lang)}
              </button>
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  onQuit?.();
                }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                {t("Quit", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        {step.stepType === "draw" ? (
          /* Draw mode: show prompt + canvas */
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
                {t("Draw this phrase:", lang)}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                {step.inputText}
              </div>
            </div>
            <DrawingCanvas
              ref={canvasRef}
              onSave={handleDrawingSave}
              onCancel={() => {}}
              gameMode
              countdownSeconds={timerOn ? timeLeft : -1}
            />
          </div>
        ) : (
          /* Guess mode: show drawing + 4 multiple-choice buttons */
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                textAlign: "center",
                padding: "0.6rem 1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "var(--radius)",
                color: "#fff",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              🤔 {t("What is this drawing?", lang)}
            </div>
            {step.inputDrawingUrl && (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <img
                  src={step.inputDrawingUrl}
                  alt="Drawing to guess"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            )}

            {/* Feedback text */}
            {showFeedback && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: isCorrect ? "#22c55e" : "#ef4444",
                  padding: "0.5rem 0",
                }}
              >
                {isCorrect ? t("Correct!", lang) : t("Wrong!", lang)}
              </div>
            )}

            {/* 2x2 grid of choice buttons */}
            {step.options && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                {step.options.map((option) => {
                  let bg = "var(--surface)";
                  let border = "1px solid var(--border)";
                  let color = "inherit";

                  if (showFeedback) {
                    if (option === step.correctOption) {
                      bg = "#dcfce7";
                      border = "2px solid #22c55e";
                      color = "#15803d";
                    } else if (option === selectedAnswer && !isCorrect) {
                      bg = "#fee2e2";
                      border = "2px solid #ef4444";
                      color = "#dc2626";
                    }
                  } else if (option === selectedAnswer) {
                    bg = "var(--primary)";
                    color = "#fff";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showFeedback || submitting}
                      style={{
                        padding: "0.75rem 0.5rem",
                        borderRadius: "var(--radius)",
                        background: bg,
                        border,
                        color,
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: showFeedback || submitting ? "default" : "pointer",
                        textAlign: "center",
                        lineHeight: 1.3,
                        minHeight: "3rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
