"use client";

import { useState, useCallback, useRef } from "react";
import { t } from "@/lib/i18n";
import { PRESET_AVATARS } from "@/lib/types";
import { DrawingCanvas } from "@/components/drawing-canvas";

interface TruthOrDareGameProps {
  game: {
    _id: string;
    status: string;
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
      responseMediaUrl?: string;
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
  onClose: () => void;
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
  onClose,
}: TruthOrDareGameProps) {
  const [responseText, setResponseText] = useState("");
  const [showDrawing, setShowDrawing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(5);
  const [hasRated, setHasRated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          background: "rgba(0,0,0,0.6)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "340px",
            width: "100%",
            margin: "1rem",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎲</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {t("Game ended", lang)}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            {t("Truth or Dare", lang)}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
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
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.75rem",
                marginBottom: "1rem",
                textAlign: "left",
              }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem" }}>
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
              background: "var(--primary)",
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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
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
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
          🎲 {t("Truth or Dare", lang)}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
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
                      background: isActive ? "rgba(139,92,246,0.4)" : "transparent",
                      borderRadius: "50%",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: isActive ? "2px solid #8b5cf6" : "2px solid transparent",
                    }}
                  >
                    {emoji}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#fff", marginTop: "0.15rem" }}>
                    {p.nickname}
                  </span>
                  {avgRating !== null && (
                    <span style={{ fontSize: "0.6rem", color: "#f59e0b", marginTop: "0.1rem" }}>
                      ⭐ {avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          width: "100%",
          maxWidth: "400px",
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
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button
                    onClick={() => onSubmitChoice(game._id, "truth")}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {t("Truth", lang)}
                  </button>
                  <button
                    onClick={() => onSubmitChoice(game._id, "dare")}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {t("Dare", lang)}
                  </button>
                </div>
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
          <div style={{ textAlign: "center", width: "100%" }}>
            {/* Show choice badge */}
            <div
              style={{
                display: "inline-block",
                padding: "0.3rem 1rem",
                borderRadius: "20px",
                background: turn.choice === "truth"
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
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
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && responseText.trim()) {
                          onSubmitResponse(game._id, responseText.trim());
                          setResponseText("");
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
                    <button
                      onClick={() => {
                        if (responseText.trim()) {
                          onSubmitResponse(game._id, responseText.trim());
                          setResponseText("");
                        }
                      }}
                      disabled={!responseText.trim()}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        background: responseText.trim() ? "var(--primary)" : "rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontWeight: 600,
                        border: "none",
                        cursor: responseText.trim() ? "pointer" : "default",
                      }}
                    >
                      {t("Send Answer", lang)}
                    </button>
                  </div>
                )}

                {/* Photo response */}
                {turn.promptResponseType === "photo" && (
                  <div style={{ width: "100%" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      style={{ display: "none" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      📷 {t("Take a photo", lang)}
                    </button>
                  </div>
                )}

                {/* Drawing response — uses the same DrawingModal as chat */}
                {turn.promptResponseType === "drawing" && (
                  <button
                    onClick={() => setShowDrawing(true)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "1rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ {t("Draw your answer", lang)}
                  </button>
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
                        onSave={handleDrawingSave}
                        onCancel={() => setShowDrawing(false)}
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
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                {t("Waiting for", lang)} {currentPlayer?.nickname} {t("to respond...", lang)}
              </p>
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
              const displayValue = myRating ? myRating.score : sliderValue;

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
                      ⭐ {avg}/10 ({ratings.length}/{eligibleRaters.length} rated)
                    </p>
                  )}

                  {/* Rating slider (don't show to the player who answered) */}
                  {!isActivePlayer && !myRating && (
                    <div style={{ padding: "0 0.5rem" }}>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        {t("Rate this answer", lang)}
                      </p>

                      {/* Star + number ABOVE the slider */}
                      <p style={{
                        color: "#f59e0b",
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        marginBottom: "0.6rem",
                      }}>
                        ⭐ {Number.isInteger(sliderValue) ? sliderValue : sliderValue.toFixed(1)}
                      </p>

                      {/* Slider bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", minWidth: "0.8rem" }}>1</span>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          step={0.5}
                          value={sliderValue}
                          onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                          style={{
                            flex: 1,
                            accentColor: "#f59e0b",
                            height: "6px",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", minWidth: "1.2rem" }}>10</span>
                      </div>

                      {/* Submit button */}
                      <button
                        onClick={() => {
                          onSubmitRating(turn._id, sliderValue);
                          setHasRated(true);
                        }}
                        style={{
                          marginTop: "1.5rem",
                          padding: "0.5rem 1.5rem",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {t("Submit Rating", lang)}
                      </button>
                    </div>
                  )}

                  {/* After submitting, show confirmed rating */}
                  {!isActivePlayer && myRating && (
                    <p style={{ color: "#f59e0b", fontSize: "0.9rem", fontWeight: 600 }}>
                      ⭐ {Number.isInteger(myRating.score) ? myRating.score : myRating.score.toFixed(1)}/10
                    </p>
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
                      onClick={() => onAdvanceTurn(game._id)}
                      style={{
                        padding: "0.7rem 2rem",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {t("Next Turn", lang)} →
                    </button>
                  )}

                  {/* Host can force advance if someone is AFK */}
                  {isHost && !allRated && (
                    <button
                      onClick={() => onAdvanceTurn(game._id)}
                      style={{
                        padding: "0.4rem 1rem",
                        background: "transparent",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        marginTop: "0.5rem",
                      }}
                    >
                      {t("Skip ratings", lang)}
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
