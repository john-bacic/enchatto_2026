"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/drawing-canvas";
import { Icon } from "@/components/ui/icon";
import { Confetti } from "@/components/ui/effects";
import { t } from "@/lib/i18n";
import { TEAM_LOOK, teamTitle, type TeamIndex } from "@/lib/game-teams";

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

/** Resolves with what games.submitGameStep answered once the server has taken the step; rejects when it refused */
type SubmitStep = (stepId: string, outputText?: string, outputDrawingUrl?: string, selectedOption?: string) => Promise<unknown>;

interface GameTaskOverlayProps {
  /** The caller's open step as games.getMyActiveStep gives it, or nothing when there is none to show */
  step: GameStep | null | undefined;
  onSubmit: SubmitStep;
  /** Told which step was on screen: while a guess is held that is not the step the query holds */
  onQuit?: (stepId: string) => void;
  lang?: string;
  /** A team game only: the team the caller plays in, read off the game session by the room page */
  team?: TeamIndex | null;
}

interface GameTaskViewProps {
  step: GameStep;
  /** The step is on screen because it is held, whatever the query says */
  held: boolean;
  onSubmit: SubmitStep;
  onHold: (step: GameStep, ms: number) => void;
  onRelease: (stepId: string) => void;
  onQuit?: () => void;
  lang?: string;
  team?: TeamIndex | null;
}

/** A sent guess that stays on screen whatever the query says, and when it stops doing so at the latest */
interface Hold {
  step: GameStep;
  until: number;
}

/** How a guess came out: whether the pick was right, which option was, and the pick the server has on record */
interface GuessResult {
  correct: boolean;
  correctOption: string;
  selectedOption?: string;
}

/** The result in what games.submitGameStep answered, or null when it answered without one */
function readGuessResult(value: unknown): GuessResult | null {
  if (typeof value !== "object" || value === null) return null;
  const { correct, correctOption, selectedOption } = value as Record<string, unknown>;
  if (typeof correct !== "boolean" || typeof correctOption !== "string") return null;
  return { correct, correctOption, selectedOption: typeof selectedOption === "string" ? selectedOption : undefined };
}

/** How long "Correct!" / "Wrong!" stays up */
const FEEDBACK_MS = 1500;
/** How long a sent guess is held for the server's answer. After that the screen follows the query again */
const REPLY_WAIT_MS = 5000;

const COPY = {
  en: { title: "LOST IN TRANSLATION", yourTurn: "YOUR TURN TO DRAW!", lv: "LV" },
  ja: { title: "ロスト・イン・トランスレーション", yourTurn: "あなたが描く番！", lv: "LV" },
};

const ANSWER_COLORS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--mint-soft)", "var(--blue-soft)"];

/**
 * Shows the caller's open step. A step that does not say which option is right (LOST_IN_TRANSLATION_HIDE_ANSWER) has
 * its guess sent at the tap, and the server's answer says how it came out. The server drops the step from
 * getMyActiveStep the moment it takes the guess, and can hand this player the next round's draw step in the same
 * update, so the guess is held on screen from the tap until its result has shown. The next step is mounted when the
 * hold ends, so a draw countdown starts when the canvas is on screen.
 */
export function GameTaskOverlay({ step, onSubmit, onQuit, lang, team }: GameTaskOverlayProps) {
  const [hold, setHold] = useState<Hold | null>(null);
  const holdStep = useCallback((guess: GameStep, ms: number) => setHold({ step: guess, until: Date.now() + ms }), []);
  const release = useCallback((stepId: string) => setHold((now) => (now?.step._id === stepId ? null : now)), []);

  // Every hold ends at its own deadline, whatever became of the guess: the answer can be lost with the connection,
  // and the step underneath may be this player's next drawing. Counted from the clock, so a timer the browser
  // delays in a hidden tab only ends it late
  useEffect(() => {
    if (!hold) return;
    const timer = setTimeout(() => setHold((now) => (now === hold ? null : now)), Math.max(0, hold.until - Date.now()));
    return () => clearTimeout(timer);
  }, [hold]);

  const shown = hold?.step ?? step;
  if (!shown) return null;
  return (
    <GameTaskView
      key={shown._id}
      step={shown}
      held={hold !== null}
      onSubmit={onSubmit}
      onHold={holdStep}
      onRelease={release}
      onQuit={
        onQuit &&
        (() => {
          setHold(null);
          onQuit(shown._id);
        })
      }
      lang={lang}
      team={team}
    />
  );
}

function GameTaskView({ step, held, onSubmit, onHold, onRelease, onQuit, lang, team }: GameTaskViewProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // How the pick came out, once that is known: read off the step at the tap, or the server's answer to the guess
  const [result, setResult] = useState<GuessResult | null>(null);
  // Set at the tap, before any render: a second tap finds it
  const pickedRef = useRef(false);
  // False once unmounted: a submit can be answered after the overlay has gone. A layout effect, because its
  // cleanup runs in the commit that removes the view; a passive one runs in a later task, and a reply landing
  // in between would hold this step again
  const aliveRef = useRef(true);
  useLayoutEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
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
    try {
      await onSubmit(step._id, undefined, dataUrl);
    } catch {
      // The room page has said why. The drawing is still on the canvas, and Done sends it again
      if (aliveRef.current) setSubmitting(false);
    }
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

  // The server refused the guess, and the room page has said why. Nothing was recorded, so the pick can be made again
  const undoPick = () => {
    if (!aliveRef.current) return;
    pickedRef.current = false;
    setSelectedAnswer(null);
    setResult(null);
  };

  const handleOptionSelect = async (option: string) => {
    if (pickedRef.current) return;
    pickedRef.current = true;
    setSelectedAnswer(option);

    const answer = step.correctOption;
    if (typeof answer === "string") {
      // The step says which option is right: the pick is marked at once
      setResult({ correct: option === answer, correctOption: answer });

      // Wait 1.5s then submit
      setTimeout(async () => {
        try {
          await onSubmit(step._id, option, undefined, option);
        } catch {
          undoPick();
        }
      }, FEEDBACK_MS);
      return;
    }

    // The step does not say: the guess goes to the server now and its answer marks the pick. The server drops the
    // step once it has the guess, so the step is held on screen from here
    onHold(step, REPLY_WAIT_MS);
    let answered: unknown;
    try {
      answered = await onSubmit(step._id, option, undefined, option);
    } catch {
      undoPick();
      if (aliveRef.current) onRelease(step._id);
      return;
    }
    if (!aliveRef.current) return;
    const outcome = readGuessResult(answered);
    if (!outcome) {
      // The guess was closed before it arrived, or the server does not tell this caller how it came out
      onRelease(step._id);
      return;
    }
    // The pick on record is the one marked: a guess that was already in is not replaced by this one
    if (outcome.selectedOption !== undefined && step.options?.includes(outcome.selectedOption)) {
      setSelectedAnswer(outcome.selectedOption);
    }
    setResult(outcome);
    onHold(step, FEEDBACK_MS);
  };

  const showFeedback = result !== null;
  const isCorrect = result?.correct === true;
  const round = step.round ?? 1;
  const totalRounds = step.totalRounds ?? 10;
  const level = step.level ?? 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // A held guess stays above the sheets (z-index 100): the last guess of a game ends it, and the replay sheet
        // opens underneath, to be seen when the hold ends
        zIndex: held ? 110 : 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
        background:
          "repeating-linear-gradient(-45deg, rgba(167, 123, 255, 0.09) 0 14px, transparent 14px 28px), var(--paper)",
      }}
    >
      {/* The player's team, as a tab hanging from the top edge: it takes no room from the drawing */}
      {(team === 0 || team === 1) && (
        <span
          className="ec-chunky"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            padding: "0 12px 2px",
            border: "2.5px solid var(--ink)",
            borderTop: 0,
            borderRadius: "0 0 12px 12px",
            background: TEAM_LOOK[team].color,
            fontSize: 11,
            lineHeight: "17px",
            whiteSpace: "nowrap",
          }}
        >
          {teamTitle(team, lang)}
        </span>
      )}

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
                  // A pick that was right is the answer, whatever words the server names it in
                  const isAnswer = showFeedback && (option === result.correctOption || (picked && isCorrect));
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
                      disabled={selectedAnswer !== null}
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
                        cursor: selectedAnswer !== null ? "default" : "pointer",
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
