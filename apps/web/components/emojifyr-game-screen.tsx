"use client";

import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/i18n";
import { getAvatarById } from "@/lib/types";
import { RANDOM_PHRASES_EN, RANDOM_PHRASES_JA, INITIALISMS } from "@/lib/random-phrases";

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
  onSubmitSentence: (sentence: string, isInitialism?: boolean) => void;
  onGenerateEmojiClue: (sentence: string) => Promise<string | null>;
  onSubmitEmojiClue: (emojiClue: string) => void;
  onUpdateSentence: (sentence: string) => void;
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
  onGenerateEmojiClue,
  onSubmitEmojiClue,
  onUpdateSentence,
  onSubmitGuess,
  onReveal,
  onNextRound,
  onEndGame,
}: EmojifyrGameScreenProps) {
  const [sentence, setSentence] = useState("");
  const [guess, setGuess] = useState("");
  const [submittingSentence, setSubmittingSentence] = useState(false);
  const [submittingGuess, setSubmittingGuess] = useState(false);

  // Preview state for writer — persists regardless of backend round status changes
  const [previewEmojiClue, setPreviewEmojiClue] = useState<string | null>(null);
  const [isGeneratingEmoji, setIsGeneratingEmoji] = useState(false);
  const [submittedSentence, setSubmittedSentence] = useState("");
  const [showingPreview, setShowingPreview] = useState(false);

  // Reset state when round changes
  const roundId = currentRound?._id ?? null;
  useEffect(() => {
    setSentence("");
    setGuess("");
    setSubmittingSentence(false);
    setSubmittingGuess(false);
    setPreviewEmojiClue(null);
    setIsGeneratingEmoji(false);
    setSubmittedSentence("");
    setShowingPreview(false);
  }, [roundId]);

  const roundStatus = currentRound?.status ?? null;
  const roundIndex = currentRound?.roundIndex ?? 0;
  const isWriter = currentRound?.writerParticipantId === myParticipantId;
  const alreadyGuessed = guesses.some((g: any) => g.participantId === myParticipantId);
  const emojiClue = currentRound?.emojiClue ?? "";
  const originalSentence = currentRound?.originalSentence ?? "";
  const translatedSentence = currentRound?.translatedSentence ?? "";

  const writerParticipant = participants.find(
    (p: any) => p._id === currentRound?.writerParticipantId
  );
  const writerName = writerParticipant?.nickname ?? "?";

  const maxLen = 80;

  const handleRandom = useCallback(() => {
    const list = lang === "ja" ? RANDOM_PHRASES_JA : RANDOM_PHRASES_EN;
    const pick = list[Math.floor(Math.random() * list.length)];
    setSentence(pick);
  }, [lang]);

  const handleSubmitSentence = async () => {
    const trimmed = sentence.trim();
    if (!trimmed || submittingSentence) return;
    setSubmittingSentence(true);
    setSubmittedSentence(trimmed);
    setShowingPreview(true);
    const isInit = INITIALISMS.some((i) => i.text.toUpperCase() === trimmed.toUpperCase());
    onSubmitSentence(trimmed, isInit || undefined);
    // Start generating emoji preview
    setIsGeneratingEmoji(true);
    const clue = await onGenerateEmojiClue(trimmed);
    setPreviewEmojiClue(clue);
    setIsGeneratingEmoji(false);
  };

  const handleRegenerate = async () => {
    const trimmed = submittedSentence.trim();
    if (!trimmed || isGeneratingEmoji) return;
    // Update the sentence on the server if it was edited
    onUpdateSentence(trimmed);
    setIsGeneratingEmoji(true);
    setPreviewEmojiClue(null);
    const clue = await onGenerateEmojiClue(trimmed);
    setPreviewEmojiClue(clue);
    setIsGeneratingEmoji(false);
  };

  const handleUseEmojiClue = () => {
    if (!previewEmojiClue) return;
    // If sentence was edited, update it on the server before submitting
    const trimmed = submittedSentence.trim();
    if (trimmed) {
      onUpdateSentence(trimmed);
    }
    setShowingPreview(false);
    onSubmitEmojiClue(previewEmojiClue);
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

    // Writer preview — persists regardless of backend round status changes
    // (iOS host may auto-submit an emoji clue, advancing the round to "guessing",
    // but the web writer should stay on the preview until they click "Use")
    if (showingPreview && isWriter) {
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
          {/* Editable sentence */}
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: "0.5rem" }}>
              {t("Original:", lang)}
            </div>
            <textarea
              value={submittedSentence}
              onChange={(e) => setSubmittedSentence(e.target.value)}
              maxLength={maxLen}
              style={{
                width: "100%",
                minHeight: "60px",
                padding: "0.75rem",
                borderRadius: "10px",
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginTop: "0.25rem",
            }}>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => {
                    const list = lang === "ja" ? RANDOM_PHRASES_JA : RANDOM_PHRASES_EN;
                    setSubmittedSentence(list[Math.floor(Math.random() * list.length)]);
                  }}
                  style={{
                    padding: "0.3rem 0.6rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.75rem",
                  }}
                >
                  🎲 {t("Random", lang)}
                </button>
                <button
                  onClick={() => {
                    const pick = INITIALISMS[Math.floor(Math.random() * INITIALISMS.length)];
                    setSubmittedSentence(pick.text);
                  }}
                  style={{
                    padding: "0.3rem 0.6rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.75rem",
                  }}
                >
                  🔤 Init
                </button>
              </div>
              <span style={{
                fontSize: "0.75rem",
                color: submittedSentence.length >= maxLen ? "#fca5a5" : "rgba(255,255,255,0.5)",
              }}>
                {submittedSentence.length} / {maxLen}
              </span>
            </div>
          </div>

          {/* Emoji clue label */}
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
            {t("Generated emoji clue:", lang)}
          </div>

          {/* Generating spinner or editable emoji preview */}
          {isGeneratingEmoji ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
                ✨
              </div>
              <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", marginTop: "0.5rem" }}>
                {t("Generating emojis...", lang)}
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={previewEmojiClue ?? ""}
              onChange={(e) => setPreviewEmojiClue(e.target.value)}
              placeholder="🐱💤🛋️"
              style={{
                width: "100%",
                fontSize: "2.5rem",
                textAlign: "center",
                padding: "0.75rem",
                borderRadius: "16px",
                border: "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
            />
          )}

          {/* Initialism definition for writer */}
          {(() => {
            const initMatch = INITIALISMS.find(
              (i) => i.text.toUpperCase() === (submittedSentence || "").trim().toUpperCase()
            );
            if (!initMatch) return null;
            const def = lang === "ja" ? initMatch.defJa : initMatch.defEn;
            return (
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", padding: "0.5rem 0.85rem", background: "rgba(255,255,255,0.1)", borderRadius: "10px", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                🔤 <span style={{ fontWeight: 700 }}>{initMatch.text}</span> — {def}
              </div>
            );
          })()}

          {/* Use / Regenerate buttons */}
          {!isGeneratingEmoji && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={handleUseEmojiClue}
                disabled={!previewEmojiClue}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "12px",
                  background: previewEmojiClue
                    ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                    : "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: previewEmojiClue ? "pointer" : "default",
                  border: "none",
                  fontSize: "1rem",
                  opacity: previewEmojiClue ? 1 : 0.5,
                }}
              >
                {t("Use", lang)}
              </button>
              <button
                onClick={handleRegenerate}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "1rem",
                }}
              >
                {t("Regenerate", lang)}
              </button>
            </div>
          )}
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
              {t("Write something for Emojifyr", lang)}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              {t("Write something short and visual that can be turned into emojis.", lang)}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginTop: "-0.5rem",
            }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleRandom}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.8rem",
                  }}
                >
                  🎲 {t("Random", lang)}
                </button>
                <button
                  onClick={() => {
                    const pick = INITIALISMS[Math.floor(Math.random() * INITIALISMS.length)];
                    setSentence(pick.text);
                  }}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.8rem",
                  }}
                >
                  🔤 Init
                </button>
              </div>
              <span style={{
                fontSize: "0.75rem",
                color: sentence.length >= maxLen ? "#fca5a5" : "rgba(255,255,255,0.5)",
              }}>
                {sentence.length} / {maxLen}
              </span>
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
        // Writer should be in showingPreview state (handled above);
        // fallback in case they reached this status without local preview
        return (
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "2rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
              ✨
            </div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", marginTop: "0.5rem" }}>
              {t("Generating emojis...", lang)}
            </div>
          </div>
        );
      }
      // Non-writer sees waiting message with writer's name
      return (
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "emojifyrPulse 1.5s ease-in-out infinite" }}>
            ✨
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {writerName} {t("is generating emojis...", lang)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.75rem", lineHeight: 1.6 }}>
            {lang === "ja" ? "この絵文字の意味、わかるかな？" : "Can you guess what the emojis mean?"}
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
              {currentRound?.isInitialism
                ? t("What is this init?", lang)
                : t("What is this phrase?", lang)}
            </h2>
            {(lang === "ja" ? currentRound?.hintJa : currentRound?.hintEn) ? (
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, textAlign: "center", fontStyle: "italic" }}>
                {lang === "ja" ? currentRound.hintJa : currentRound.hintEn}
              </div>
            ) : null}
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
            <button
              onClick={() => {
                if (submittingGuess) return;
                setSubmittingGuess(true);
                onSubmitGuess("🤷 " + t("I don't know", lang));
              }}
              disabled={submittingGuess}
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                cursor: submittingGuess ? "default" : "pointer",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "0.9rem",
              }}
            >
              🤷 {t("I don't know", lang)}
            </button>
          </div>
        );
      }
      // Writer view — players are guessing
      const initMatchWriter = INITIALISMS.find(
        (i) => i.text.toUpperCase() === (originalSentence || "").trim().toUpperCase()
      );
      return (
        <div style={{ textAlign: "center", color: "#fff", width: "100%", maxWidth: "400px", padding: "0 1rem" }}>
          <div style={{ fontSize: "3rem", lineHeight: 1.3, wordBreak: "break-word", marginBottom: "1rem" }}>
            {emojiClue}
          </div>
          {initMatchWriter && (
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", padding: "0.4rem 0.75rem", background: "rgba(255,255,255,0.08)", borderRadius: "8px", marginBottom: "1rem" }}>
              🔤 <span style={{ fontWeight: 600 }}>{initMatchWriter.text}</span> — {lang === "ja" ? initMatchWriter.defJa : initMatchWriter.defEn}
            </div>
          )}
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
              {t("Original", lang)}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {originalSentence}
            </div>
            {translatedSentence && (
              <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.35rem", fontStyle: "italic" }}>
                {translatedSentence}
              </div>
            )}
            {(() => {
              const initMatch = INITIALISMS.find(
                (i) => i.text.toUpperCase() === (originalSentence || "").trim().toUpperCase()
              );
              if (!initMatch) return null;
              const def = lang === "ja" ? initMatch.defJa : initMatch.defEn;
              return (
                <div style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "0.5rem", padding: "0.5rem", background: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.15rem" }}>🔤 {initMatch.text}</div>
                  <div>{def}</div>
                </div>
              );
            })()}
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
                        {g.translatedGuessText && (
                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                            {g.translatedGuessText}
                          </div>
                        )}
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
