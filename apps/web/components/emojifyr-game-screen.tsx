"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";
import { getAvatarById } from "@/lib/types";

interface EmojifyrGameScreenProps {
  // Game state (from Convex)
  session: any; // GameSession
  currentRound: any; // EmojifyrRound
  guesses: any[]; // EmojifyrGuess[]
  participants: any[]; // participants in the room

  // Current user info
  myParticipantId: string;
  isHost: boolean;
  lang: string;

  // Actions
  onSubmitSentence: (sentence: string) => void;
  onSubmitGuess: (guess: string) => void;
  onReveal: () => void;
  onNextRound: () => void;
  onEndGame: () => void;
}

export function EmojifyrGameScreen({
  session,
  currentRound,
  guesses,
  participants,
  myParticipantId,
  isHost,
  lang,
  onSubmitSentence,
  onSubmitGuess,
  onReveal,
  onNextRound,
  onEndGame,
}: EmojifyrGameScreenProps) {
  const [sentence, setSentence] = useState("");
  const [guess, setGuess] = useState("");
  const [submittingSentence, setSubmittingSentence] = useState(false);
  const [submittingGuess, setSubmittingGuess] = useState(false);

  // Reset state when round changes
  const roundId = currentRound?._id ?? null;
  useEffect(() => {
    setSentence("");
    setGuess("");
    setSubmittingSentence(false);
    setSubmittingGuess(false);
  }, [roundId]);

  const roundStatus = currentRound?.status ?? null;
  const roundIndex = currentRound?.roundIndex ?? 0;
  const isWriter = currentRound?.writerParticipantId === myParticipantId;
  const alreadyGuessed = guesses.some((g: any) => g.participantId === myParticipantId);
  const emojiClue = currentRound?.emojiClue ?? "";
  const originalSentence = currentRound?.originalSentence ?? "";

  const writerParticipant = participants.find(
    (p: any) => p._id === currentRound?.writerParticipantId
  );
  const writerName = writerParticipant?.nickname ?? "?";

  const maxLen = 80;

  const handleSubmitSentence = () => {
    const trimmed = sentence.trim();
    if (!trimmed || submittingSentence) return;
    setSubmittingSentence(true);
    onSubmitSentence(trimmed);
  };

  const handleSubmitGuess = () => {
    const trimmed = guess.trim();
    if (!trimmed || submittingGuess) return;
    setSubmittingGuess(true);
    onSubmitGuess(trimmed);
  };

  // Auto-dismiss when game is complete
  if (roundStatus === "complete") {
    return null;
  }

  const renderPhaseContent = () => {
    // Loading — round not yet available
    if (!currentRound) {
      return (
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
            🔥
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {t("Game Starting...", lang)}
          </div>
        </div>
      );
    }

    // Phase 1: Writing
    if (roundStatus === "writing") {
      if (isWriter) {
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            maxWidth: "400px",
            padding: "0 1rem",
          }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0, textAlign: "center" }}>
              {t("Write a sentence for Emojifyr", lang)}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              {t("Use a short, visual sentence that can be turned into emojis.", lang)}
            </p>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              maxLength={maxLen}
              placeholder={t("e.g. A cat riding a skateboard", lang)}
              autoFocus
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "0.85rem",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "1rem",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
            />
            <div style={{
              alignSelf: "flex-end",
              fontSize: "0.75rem",
              color: sentence.length >= maxLen ? "#fca5a5" : "rgba(255,255,255,0.5)",
              marginTop: "-0.5rem",
            }}>
              {sentence.length} / {maxLen}
            </div>
            <button
              onClick={handleSubmitSentence}
              disabled={!sentence.trim() || submittingSentence}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                background: !sentence.trim()
                  ? "rgba(255,255,255,0.15)"
                  : "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
                fontWeight: 700,
                cursor: !sentence.trim() ? "default" : "pointer",
                border: "none",
                fontSize: "1rem",
                opacity: !sentence.trim() ? 0.5 : 1,
              }}
            >
              {submittingSentence ? t("Submitting...", lang) : t("Generate Emojis", lang)}
            </button>
          </div>
        );
      }
      // Not the writer — waiting
      return (
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "emojifyrBounce 2s ease-in-out infinite" }}>
            ✏️
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {writerName} {t("is writing...", lang)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>
            {t("Waiting for writer...", lang)}
          </div>
        </div>
      );
    }

    // Phase 2: Generating / Preview
    if (roundStatus === "generating" || roundStatus === "preview") {
      if (isWriter) {
        // Writer sees confirmation that their sentence is being converted
        return (
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {t("Sentence submitted!", lang)}
            </div>
            <div style={{ fontSize: "2rem", marginTop: "1rem", marginBottom: "0.5rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
              ✨
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>
              {t("Waiting for emoji translation...", lang)}
            </div>
          </div>
        );
      }
      // Non-writer sees waiting message
      return (
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔥</div>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
            ✨
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {t("Generating emojis...", lang)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>
            {t("Waiting for emoji translation...", lang)}
          </div>
        </div>
      );
    }

    // Phase 3: Guessing
    if (roundStatus === "guessing") {
      if (!isWriter) {
        if (alreadyGuessed) {
          // Already submitted a guess — waiting
          return (
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem", lineHeight: 1.3, wordBreak: "break-word" }}>
                {emojiClue}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 600, marginTop: "1rem", color: "rgba(255,255,255,0.8)" }}>
                {t("Submit Guess", lang)} ✓
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
                {guesses.length} {t("guesses submitted", lang)}
              </div>
            </div>
          );
        }
        // Show guess input
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            maxWidth: "400px",
            padding: "0 1rem",
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              {t("What does this mean?", lang)}
            </h2>
            <div style={{
              fontSize: "3rem",
              lineHeight: 1.3,
              padding: "1rem",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              border: "2px solid rgba(255,255,255,0.15)",
              wordBreak: "break-word",
              textAlign: "center",
              width: "100%",
              boxSizing: "border-box",
            }}>
              {emojiClue}
            </div>
            {guesses.length > 0 && (
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                {guesses.length} {t("guesses submitted", lang)}
              </div>
            )}
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmitGuess(); }}
              placeholder={t("Type your guess...", lang)}
              autoFocus
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
            />
            <button
              onClick={handleSubmitGuess}
              disabled={!guess.trim() || submittingGuess}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                background: !guess.trim()
                  ? "rgba(255,255,255,0.15)"
                  : "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
                fontWeight: 700,
                cursor: !guess.trim() ? "default" : "pointer",
                border: "none",
                fontSize: "1rem",
                opacity: !guess.trim() ? 0.5 : 1,
              }}
            >
              {submittingGuess ? t("Submitting...", lang) : t("Submit Guess", lang)}
            </button>
          </div>
        );
      }
      // Writer view — players are guessing
      return (
        <div style={{ textAlign: "center", color: "#fff", width: "100%", maxWidth: "400px", padding: "0 1rem" }}>
          <div style={{ fontSize: "3rem", lineHeight: 1.3, wordBreak: "break-word", marginBottom: "1rem" }}>
            {emojiClue}
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {t("Players are guessing...", lang)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
            {guesses.length} {t("guesses submitted", lang)}
          </div>
          <button
            onClick={onReveal}
            style={{
              marginTop: "1.5rem",
              padding: "0.85rem 2rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              fontSize: "1rem",
            }}
          >
            {t("Reveal", lang)}
          </button>
        </div>
      );
    }

    // Phase 4: Reveal
    if (roundStatus === "reveal") {
      const participantMap: Record<string, any> = {};
      for (const p of participants) {
        participantMap[p._id] = p;
      }

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          maxWidth: "400px",
          padding: "0 1rem",
          maxHeight: "80dvh",
          overflow: "auto",
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            {t("Emojifyr Result", lang)}
          </h2>

          {/* Emoji clue */}
          <div style={{
            fontSize: "2.5rem",
            lineHeight: 1.3,
            textAlign: "center",
            padding: "0.75rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "16px",
            border: "2px solid rgba(255,255,255,0.15)",
            wordBreak: "break-word",
            width: "100%",
            boxSizing: "border-box",
          }}>
            {emojiClue}
          </div>

          {/* Original sentence */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            borderRadius: "12px",
            padding: "0.85rem",
            color: "#fff",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "0.25rem" }}>
              {t("Original sentence", lang)}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {originalSentence}
            </div>
          </div>

          {/* Guesses list */}
          {guesses.length > 0 && (
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "rgba(255,255,255,0.6)" }}>
                {t("Guesses", lang)} ({guesses.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {guesses.map((g: any, i: number) => {
                  const pInfo = participantMap[g.participantId];
                  const av = pInfo?.avatar?.value ? getAvatarById(pInfo.avatar.value) : null;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem 0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {av && (
                        <span style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: av.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}>
                          {av.emoji}
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                          {pInfo?.nickname ?? "?"}
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#fff" }}>
                          {g.guessText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Round button (host only) */}
          {isHost && (
            <button
              onClick={onNextRound}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                fontSize: "1rem",
                marginTop: "0.25rem",
              }}
            >
              {t("Next Round", lang)}
            </button>
          )}
        </div>
      );
    }

    // Default fallback — waiting
    return (
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
          🔥
        </div>
        <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)" }}>
          {t("Waiting for host...", lang)}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100dvh",
      zIndex: 9999,
      background: "linear-gradient(135deg, #4f46e5, #7c3aed, #6d28d9)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        background: "rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.3rem" }}>🔥</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
            {t("Emojifyr", lang)}
          </span>
          {currentRound && (
            <span style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginLeft: "0.25rem",
            }}>
              {t("Round", lang)} {roundIndex + 1}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm(t("End game?", lang))) {
              onEndGame();
            }
          }}
          style={{
            padding: "0.4rem 0.85rem",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: "0.8rem",
          }}
        >
          {t("End Game", lang)}
        </button>
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "1rem",
      }}>
        {renderPhaseContent()}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes emojifyrPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes emojifyrBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
