"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { t } from "@/lib/i18n";
import { PRESET_AVATARS } from "@/lib/types";
import { DrawingCanvas, DrawingCanvasHandle } from "@/components/drawing-canvas";
import { todTrace } from "@/components/tod-debug-panel";

interface TruthOrDareGameProps {
  game: {
    _id: string;
    status: string;
    promptMode?: string;
    hostParticipantId: string;
    playerOrder: string[];
    currentTurnIndex: number;
    currentTurnParticipantId?: string;
    currentTurn: {
      _id: string;
      turnIndex: number;
      participantId: string;
      choice?: "truth" | "dare";
      promptText?: string;
      promptResponseType?: "text" | "photo" | "drawing";
      responseText?: string;
      translatedResponseText?: string;
      responseMediaUrl?: string;
      ratings?: Array<{ participantId: string; score: number }>;
      status: string;
    } | null;
    completedTurns: number;
    completedTurnsList?: Array<{
      _id: string;
      participantId: string;
      choice?: "truth" | "dare";
      promptText?: string;
      responseText?: string;
      ratings: Array<{ participantId: string; score: number }>;
    }>;
    playerInfo: Array<{
      participantId: string;
      nickname: string;
      avatarValue: string;
      online: boolean;
    }>;
  };
  myParticipantId: string;
  isHost: boolean;
  lang?: string;
  onSubmitChoice: (gameId: string, choice: "truth" | "dare") => void;
  onSubmitResponse: (gameId: string, responseText?: string, responseMediaUrl?: string) => void;
  onAdvanceTurn: (gameId: string) => void;
  onSkipTurn: (gameId: string) => void;
  onEndGame: (gameId: string) => void;
  onSubmitRating: (turnId: string, score: number) => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  onClose: () => void;
  onMinimize?: () => void;
}

export function TruthOrDareGame({
  game,
  myParticipantId,
  isHost,
  lang,
  onSubmitChoice,
  onSubmitResponse,
  onAdvanceTurn,
  onSkipTurn,
  onEndGame,
  onSubmitRating,
  onDrawingStateChange,
  onClose,
  onMinimize,
}: TruthOrDareGameProps) {
  const responseInputRef = useRef<HTMLInputElement>(null);
  const responseSectionRef = useRef<HTMLDivElement>(null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null); // tracks which action is in-flight
  // Track which completedTurns milestone was dismissed (by user click or host advancing)
  const [dismissedRoundBreak, setDismissedRoundBreak] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);

  // Track keyboard height via visualViewport for Android only.
  // iOS Safari handles keyboard avoidance natively — adding paddingBottom
  // on iOS causes the content to scroll too high.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) return; // let iOS handle it natively
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const kbH = window.innerHeight - vv.height;
      setKeyboardHeight(kbH > 50 ? kbH : 0);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  // Reset local state when turn changes or turn status advances
  const turnStatus = game.currentTurn?.status;
  useEffect(() => {
    setStarRating(0);
    setHasRated(false);
    setSubmitting(null); // clear any stale submitting state
    if (responseInputRef.current) responseInputRef.current.value = "";
  }, [game.currentTurn?._id, turnStatus]);

  // Show round break at every 10-turn milestone.
  // Track which turnIndex triggered the round break so we can detect
  // when the host advances past it (Keep Playing creates a new turnIndex).
  const [roundBreakTurnIndex, setRoundBreakTurnIndex] = useState<number | null>(null);

  const shouldShowRoundBreak = game.completedTurns > 0 &&
    game.completedTurns % 10 === 0 &&
    game.currentTurn?.status === "waiting_for_choice" &&
    dismissedRoundBreak !== game.completedTurns;

  // When the round break condition is first met, record the turnIndex.
  // If the turnIndex changes while the condition is still met, the host advanced — dismiss.
  const isRoundBreak = shouldShowRoundBreak && (
    roundBreakTurnIndex === null || roundBreakTurnIndex === game.currentTurnIndex
  );

  useEffect(() => {
    if (shouldShowRoundBreak) {
      if (roundBreakTurnIndex === null) {
        // First time showing — record which turnIndex triggered it
        setRoundBreakTurnIndex(game.currentTurnIndex);
      } else if (roundBreakTurnIndex !== game.currentTurnIndex) {
        // TurnIndex changed while round break active — host clicked Keep Playing
        setDismissedRoundBreak(game.completedTurns);
        setRoundBreakTurnIndex(null);
      }
    } else {
      setRoundBreakTurnIndex(null);
    }
  }, [shouldShowRoundBreak, game.currentTurnIndex, roundBreakTurnIndex, game.completedTurns]);

  // Signal drawing state to other players via typing indicator
  useEffect(() => {
    onDrawingStateChange?.(showDrawing);
    return () => { onDrawingStateChange?.(false); };
  }, [showDrawing, onDrawingStateChange]);

  const isMyTurn = game.currentTurnParticipantId === myParticipantId;
  const currentPlayer = game.playerInfo.find(
    (p) => p.participantId === game.currentTurnParticipantId
  );
  const currentPlayerEmoji = PRESET_AVATARS.find(
    (a) => a.id === currentPlayer?.avatarValue
  )?.emoji ?? "🐱";

  const turn = game.currentTurn;

  // Parse prompt text (stored as JSON { en, ja })
  const promptDisplay = (() => {
    if (!turn?.promptText) return "";
    try {
      const parsed = JSON.parse(turn.promptText);
      return lang === "ja" ? parsed.ja : parsed.en;
    } catch {
      return turn.promptText;
    }
  })();

  const handlePhotoCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        onSubmitResponse(game._id, undefined, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [game._id, onSubmitResponse]
  );

  const handleDrawingSave = useCallback(
    (dataUrl: string) => {
      setShowDrawing(false);
      onSubmitResponse(game._id, undefined, dataUrl);
    },
    [game._id, onSubmitResponse]
  );

  // Game completed
  if (game.status === "completed" || game.status === "canceled") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(135deg, #f59e0b, #ea580c, #7c3aed)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            maxWidth: "340px",
            width: "100%",
            margin: "1rem",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎲</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
            {t("Game ended", lang)}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            {t("Truth or Dare", lang)}
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "1rem" }}>
            {game.completedTurns} {t("played", lang)}
          </p>

          {/* Ratings summary */}
          {(() => {
            const turns = game.completedTurnsList ?? [];
            const ratedTurns = turns.filter((t) => t.ratings.length > 0);
            if (ratedTurns.length === 0) return null;

            // Per-player average
            const playerScores: Record<string, { total: number; count: number }> = {};
            for (const t of ratedTurns) {
              const pid = t.participantId;
              if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
              const avg = t.ratings.reduce((s, r) => s + r.score, 0) / t.ratings.length;
              playerScores[pid].total += avg;
              playerScores[pid].count += 1;
            }

            const sorted = Object.entries(playerScores)
              .map(([pid, s]) => ({
                pid,
                avg: s.total / s.count,
                player: game.playerInfo.find((p) => p.participantId === pid),
              }))
              .sort((a, b) => b.avg - a.avg);

            return (
              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "0.75rem",
                marginBottom: "1rem",
                textAlign: "left",
              }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem", color: "#fff" }}>
                  ⭐ {t("Ratings", lang)}
                </p>
                {sorted.map(({ pid, avg, player }) => {
                  const emoji = PRESET_AVATARS.find((a) => a.id === player?.avatarValue)?.emoji ?? "🐱";
                  return (
                    <div key={pid} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8rem",
                      padding: "0.2rem 0",
                      color: "#fff",
                    }}>
                      <span>{emoji} {player?.nickname ?? "?"}</span>
                      <span style={{ fontWeight: 600 }}>⭐ {avg.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 2rem",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("Close", lang)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        paddingBottom: keyboardHeight,
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #7c3aed 100%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        transition: "padding-bottom 0.15s ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          🎲 {t("Truth or Dare", lang)}
          <span style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.15)", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: 600 }}>
            {game.completedTurns + (turn?.status === "waiting_for_choice" || turn?.status === "waiting_for_response" ? 1 : 0)}/{Math.ceil((game.completedTurns + 1) / 10) * 10}
          </span>
          {game.promptMode === "deep" && (
            <span style={{ fontSize: "0.65rem", background: "rgba(217,119,6,0.8)", padding: "0.1rem 0.4rem", borderRadius: "10px" }}>
              🌊 {t("Deep", lang)}
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {isHost && (
            <button
              onClick={() => onEndGame(game._id)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "6px",
                background: "rgba(239,68,68,0.8)",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("🛑 End Game", lang)}
            </button>
          )}
          {onMinimize && (
            <button
              onClick={onMinimize}
              aria-label={t("Minimize", lang)}
              title={t("Minimize", lang)}
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              –
            </button>
          )}
        </div>
      </div>

      {/* Player strip */}
      {(() => {
        // Compute per-player average ratings from all completed turns
        const playerRatings: Record<string, { total: number; count: number }> = {};
        for (const t of (game.completedTurnsList ?? [])) {
          if (t.ratings.length > 0) {
            const pid = t.participantId;
            if (!playerRatings[pid]) playerRatings[pid] = { total: 0, count: 0 };
            const avg = t.ratings.reduce((s, r) => s + r.score, 0) / t.ratings.length;
            playerRatings[pid].total += avg;
            playerRatings[pid].count += 1;
          }
        }

        return (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              overflowX: "auto",
              width: "100%",
              justifyContent: "center",
            }}
          >
            {game.playerInfo.filter((p) => p.online).map((p) => {
              const emoji = PRESET_AVATARS.find((a) => a.id === p.avatarValue)?.emoji ?? "🐱";
              const isActive = p.participantId === game.currentTurnParticipantId;
              const pr = playerRatings[p.participantId];
              const avgRating = pr ? (pr.total / pr.count) : null;
              return (
                <div
                  key={p.participantId}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.5rem",
                      background: isActive ? "rgba(251,146,60,0.4)" : "transparent",
                      borderRadius: "50%",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: isActive ? "2px solid #fb923c" : "2px solid transparent",
                    }}
                  >
                    {emoji}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#fff", marginTop: "0.15rem" }}>
                    {p.nickname}
                  </span>
                  {avgRating !== null && (
                    <span style={{ fontSize: "0.6rem", color: "#fff", marginTop: "0.1rem" }}>
                      ⭐ {avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Round break interstitial — every 10 turns */}
      {isRoundBreak && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ea580c, #d97706)",
              borderRadius: "20px",
              padding: "2rem 1.5rem",
              textAlign: "center",
              maxWidth: "340px",
              width: "100%",
              border: "1px solid rgba(251,146,60,0.3)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <h2 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {t("Round Complete!", lang)}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
              {game.completedTurns} {t("turns played", lang)}
            </p>

            {/* Mini ratings summary */}
            {(() => {
              const turns = game.completedTurnsList ?? [];
              const ratedTurns = turns.filter((rt) => rt.ratings.length > 0);
              if (ratedTurns.length === 0) return null;

              const playerScores: Record<string, { total: number; count: number }> = {};
              for (const rt of ratedTurns) {
                const pid = rt.participantId;
                if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
                const avg = rt.ratings.reduce((s, r) => s + r.score, 0) / rt.ratings.length;
                playerScores[pid].total += avg;
                playerScores[pid].count += 1;
              }

              const sorted = Object.entries(playerScores)
                .map(([pid, s]) => ({
                  pid,
                  avg: s.total / s.count,
                  player: game.playerInfo.find((p) => p.participantId === pid),
                }))
                .sort((a, b) => b.avg - a.avg);

              return (
                <div style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "0.6rem 0.75rem",
                  margin: "0.75rem 0",
                  textAlign: "left",
                }}>
                  {sorted.slice(0, 3).map(({ pid, avg, player }, i) => {
                    const emoji = PRESET_AVATARS.find((a) => a.id === player?.avatarValue)?.emoji ?? "🐱";
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                    return (
                      <div key={pid} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.8rem",
                        color: "#fff",
                        padding: "0.2rem 0",
                      }}>
                        <span>{medal} {emoji} {player?.nickname ?? "?"}</span>
                        <span style={{ fontWeight: 600, color: "#fff" }}>⭐ {avg.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {isHost ? (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  onClick={() => onEndGame(game._id)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,0.8)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t("End Game", lang)}
                </button>
                <button
                  onClick={() => {
                    setDismissedRoundBreak(game.completedTurns);
                    onAdvanceTurn(game._id);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t("Keep Playing", lang)} →
                </button>
              </div>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "1rem" }}>
                {t("Waiting for host...", lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: keyboardHeight > 0 ? "flex-start" : "center",
          padding: "1rem",
          width: "100%",
          maxWidth: "400px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Step 1: Waiting for choice */}
        {turn?.status === "waiting_for_choice" && (
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {currentPlayerEmoji}
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {isMyTurn
                ? t("It's your turn!", lang)
                : `${currentPlayer?.nickname}${t("'s turn!", lang)}`}
            </h2>

            {isMyTurn ? (
              <>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                  {t("Truth or Dare?", lang)}
                </p>
                {submitting === "choice" ? (
                  <div style={{ padding: "1rem", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                ) : (
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      if (submitting) return;
                      setSubmitting("choice");
                      todTrace({ source: "client", action: "btn:truth", detail: `turnStatus=${turn?.status} isMyTurn=${isMyTurn}` });
                      onSubmitChoice(game._id, "truth");
                    }}
                    disabled={!!submitting}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      border: "none",
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    {t("Truth", lang)}
                  </button>
                  <button
                    onClick={() => {
                      if (submitting) return;
                      setSubmitting("choice");
                      todTrace({ source: "client", action: "btn:dare", detail: `turnStatus=${turn?.status} isMyTurn=${isMyTurn}` });
                      onSubmitChoice(game._id, "dare");
                    }}
                    disabled={!!submitting}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #ea580c, #d97706)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      border: "none",
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    {t("Dare", lang)}
                  </button>
                </div>
                )}
                {/* Skip option */}
                <button
                  onClick={() => onSkipTurn(game._id)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.4rem 1rem",
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {t("Skip", lang)}
                </button>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                {t("Waiting for", lang)} {currentPlayer?.nickname} {t("to choose...", lang)}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Waiting for response */}
        {turn?.status === "waiting_for_response" && (
          <div ref={responseSectionRef} style={{ textAlign: "center", width: "100%" }}>
            {/* Show choice badge */}
            <div
              style={{
                display: "inline-block",
                padding: "0.3rem 1rem",
                borderRadius: "20px",
                background: turn.choice === "truth"
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : "linear-gradient(135deg, #ea580c, #d97706)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {turn.choice === "truth" ? t("Truth", lang) : t("Dare", lang)}
            </div>

            {/* Prompt */}
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.4 }}>
                {promptDisplay}
              </p>
            </div>

            {isMyTurn ? (
              <>
                {/* Text response */}
                {(turn.promptResponseType === "text" || !turn.promptResponseType) && (
                  <div style={{ width: "100%" }}>
                    <input
                      ref={responseInputRef}
                      type="text"
                      defaultValue=""
                      onFocus={() => {
                        // Only scroll on Android — iOS handles keyboard scroll natively
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                        if (!isIOS) {
                          setTimeout(() => {
                            responseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 300);
                        }
                      }}
                      onKeyDown={(e) => {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (e.key === "Enter" && val && !submitting) {
                          setSubmitting("response");
                          onSubmitResponse(game._id, val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      placeholder={t("Type your answer...", lang)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "10px",
                        border: "none",
                        fontSize: "1rem",
                        outline: "none",
                        marginBottom: "0.75rem",
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const val = responseInputRef.current?.value.trim() || "";
                          if (val && !submitting) {
                            setSubmitting("response");
                            onSubmitResponse(game._id, val);
                            if (responseInputRef.current) responseInputRef.current.value = "";
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "0.65rem",
                          borderRadius: "8px",
                          background: submitting ? "rgba(255,255,255,0.15)" : "#7c3aed",
                          color: "#fff",
                          fontWeight: 600,
                          border: "none",
                          cursor: submitting ? "default" : "pointer",
                        }}
                      >
                        {submitting === "response" ? "..." : t("Send Answer", lang)}
                      </button>
                      {turn.choice === "dare" && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { if (!submitting) { setSubmitting("response"); onSubmitResponse(game._id, "✅ Done!"); } }}
                          style={{
                            flex: 1,
                            padding: "0.65rem",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "#fff",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {t("Done Dare", lang)}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Drawing response */}
                {turn.promptResponseType === "drawing" && (
                  <div style={{ width: "100%" }}>
                    <button
                      onClick={() => setShowDrawing(true)}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #ea580c, #d97706)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ {t("Draw your answer", lang)}
                    </button>
                    {turn.choice === "dare" && (
                      <button
                        onClick={() => onSubmitResponse(game._id, "✅ Done!")}
                        style={{
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #22c55e, #16a34a)",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "1rem",
                          border: "none",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                        }}
                      >
                        {t("Done Dare", lang)}
                      </button>
                    )}
                  </div>
                )}

                {/* Drawing overlay with prompt visible */}
                {showDrawing && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 300,
                      padding: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--surface)",
                        borderRadius: "var(--radius)",
                        padding: "1.25rem",
                        width: "100%",
                        maxWidth: "380px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Prompt reminder */}
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "0.5rem 0.75rem",
                          marginBottom: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {promptDisplay}
                        </p>
                      </div>
                      <DrawingCanvas
                        ref={drawingCanvasRef}
                        onSave={handleDrawingSave}
                        onCancel={() => setShowDrawing(false)}
                        gameMode
                      />
                    </div>
                  </div>
                )}

                {/* Skip option */}
                <button
                  onClick={() => onSkipTurn(game._id)}
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.4rem 1rem",
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {t("Skip", lang)}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                {turn.promptResponseType === "drawing" ? (
                  <>
                    <div style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      padding: "0.75rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <span className="td-drawing-pencil">✏️</span>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                        {currentPlayer?.nickname} {t("is drawing", lang)}...
                      </span>
                    </div>
                    <style jsx>{`
                      .td-drawing-pencil {
                        display: inline-block;
                        font-size: 1.1rem;
                        animation: tdDrawingWiggle 0.8s infinite ease-in-out;
                      }
                      @keyframes tdDrawingWiggle {
                        0%, 100% { transform: rotate(-10deg) translateY(0); }
                        25% { transform: rotate(5deg) translateY(-2px); }
                        50% { transform: rotate(-5deg) translateY(0); }
                        75% { transform: rotate(8deg) translateY(-1px); }
                      }
                    `}</style>
                  </>
                ) : (
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                    {t("Waiting for", lang)} {currentPlayer?.nickname} {t("to respond...", lang)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Turn completed — show response */}
        {(turn?.status === "completed" || turn?.status === "skipped") && (
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              {currentPlayerEmoji}
            </div>
            <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
              {currentPlayer?.nickname} {turn.status === "skipped" ? t("Skipped!", lang) : t("answered:", lang)}
            </h3>

            {/* Show original prompt as reminder */}
            {turn.choice && promptDisplay && (
              <>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.2rem 0.75rem",
                    borderRadius: "20px",
                    background: turn.choice === "truth"
                      ? "rgba(59,130,246,0.3)"
                      : "rgba(234,88,12,0.3)",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {turn.choice === "truth" ? t("Truth", lang) : t("Dare", lang)}
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "10px",
                    padding: "0.6rem 0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.4 }}>
                    {promptDisplay}
                  </p>
                </div>
              </>
            )}

            {turn.status === "completed" && (
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {turn.responseText && (
                  <p style={{ color: "#fff", fontSize: "1.1rem" }}>{turn.responseText}</p>
                )}
                {turn.translatedResponseText && (
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontStyle: "italic", marginTop: "0.3rem" }}>{turn.translatedResponseText}</p>
                )}
                {turn.responseMediaUrl && (
                  <img
                    src={turn.responseMediaUrl}
                    alt="Response"
                    onClick={() => setFullScreenImage(turn.responseMediaUrl!)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
            )}

            {/* Rating section */}
            {turn.status === "completed" && (() => {
              const ratings = turn.ratings ?? [];
              const myRating = ratings.find((r) => r.participantId === myParticipantId);
              const avg = ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
                : null;
              const isActivePlayer = turn.participantId === myParticipantId;
              const displayValue = myRating ? myRating.score : starRating;

              // Count eligible raters (online, non-active players)
              const eligibleRaters = game.playerInfo.filter(
                (p) => p.online && p.participantId !== turn.participantId
              );
              const allRated = eligibleRaters.length > 0 &&
                eligibleRaters.every((p) => ratings.some((r) => r.participantId === p.participantId));

              return (
                <div style={{ marginBottom: "1rem" }}>
                  {/* Average rating display */}
                  {avg && (
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                      ⭐ {avg}/5 ({ratings.length}/{eligibleRaters.length} rated)
                    </p>
                  )}

                  {/* Star rating (don't show to the player who answered) */}
                  {!isActivePlayer && !myRating && (
                    <div style={{ padding: "0 0.5rem" }}>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        {t("Rate this answer", lang)}
                      </p>

                      {/* 5 clickable stars */}
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setStarRating(star)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "2rem",
                              padding: "0.1rem",
                              filter: star <= starRating ? "none" : "grayscale(1) opacity(0.3)",
                              transition: "filter 0.15s, transform 0.15s",
                              transform: star <= starRating ? "scale(1.1)" : "scale(1)",
                            }}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>

                      {/* Submit button */}
                      <button
                        onClick={() => {
                          if (starRating > 0 && !submitting) {
                            setSubmitting("rating");
                            todTrace({ source: "client", action: "btn:submitRating", detail: `score=${starRating} turnId=${turn._id.slice(-6)}` });
                            onSubmitRating(turn._id, starRating);
                            setHasRated(true);
                          }
                        }}
                        disabled={starRating === 0 || !!submitting}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem 1.5rem",
                          borderRadius: "8px",
                          background: starRating > 0 && !submitting
                            ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                            : "rgba(255,255,255,0.15)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          border: "none",
                          cursor: starRating > 0 ? "pointer" : "default",
                        }}
                      >
                        {submitting === "rating" ? "..." : t("Submit Rating", lang)}
                      </button>
                    </div>
                  )}

                  {/* After submitting, show confirmed rating */}
                  {!isActivePlayer && myRating && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.2rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            fontSize: "1.4rem",
                            filter: star <= myRating.score ? "none" : "grayscale(1) opacity(0.3)",
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Waiting indicator when not everyone has rated */}
                  {!allRated && !isActivePlayer && myRating && (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                      {t("Waiting for others to rate...", lang)}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Host advances — only after all have rated */}
            {(() => {
              if (!turn || turn.status !== "completed" && turn.status !== "skipped") return null;
              const ratings = turn?.ratings ?? [];
              const eligibleRaters = game.playerInfo.filter(
                (p) => p.online && p.participantId !== turn.participantId
              );
              const allRated = turn.status === "skipped" || eligibleRaters.length === 0 ||
                eligibleRaters.every((p) => ratings.some((r) => r.participantId === p.participantId));

              return (
                <>
                  {isHost && allRated && (
                    <button
                      onClick={() => { if (!submitting) { setSubmitting("advance"); onAdvanceTurn(game._id); } }}
                      disabled={!!submitting}
                      style={{
                        padding: "0.7rem 2rem",
                        borderRadius: "10px",
                        background: submitting === "advance" ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #ea580c, #d97706)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        border: "none",
                        cursor: submitting ? "default" : "pointer",
                      }}
                    >
                      {submitting === "advance" ? "..." : `${t("Next Turn", lang)} →`}
                    </button>
                  )}

                  {/* Host can force advance if someone is AFK */}
                  {isHost && !allRated && (
                    <button
                      onClick={() => { if (!submitting) { setSubmitting("advance"); onAdvanceTurn(game._id); } }}
                      disabled={!!submitting}
                      style={{
                        padding: "0.4rem 1rem",
                        background: "transparent",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        cursor: submitting ? "default" : "pointer",
                        marginTop: "0.5rem",
                      }}
                    >
                      {submitting === "advance" ? "..." : t("Skip ratings", lang)}
                    </button>
                  )}

                  {!isHost && !allRated && (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                      {t("Waiting for all ratings...", lang)}
                    </p>
                  )}

                  {!isHost && allRated && (
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                      {t("Waiting for host...", lang)}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Full-screen image viewer */}
      {fullScreenImage && (
        <div
          onClick={() => setFullScreenImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "1rem",
          }}
        >
          <img
            src={fullScreenImage}
            alt="Full size"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

    </div>
  );
}
