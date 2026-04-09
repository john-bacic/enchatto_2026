"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type GameTab = "lost-in-translation" | "emoji-bingo" | "emojifyr" | "emoji-match" | "truth-or-dare";

interface GamePickerModalProps {
  isOpen: boolean;
  isHost: boolean;
  playerCount: number;
  hostName?: string;
  nextLevel?: number;
  onStartGame: (gameType: string, level: number, timerSeconds: number) => void;
  onStartEmojifyr?: () => void;
  onStartEmojiMatch?: () => void;
  onStartEmojiBingo?: () => void;
  onStartTruthOrDare?: (mode: "normal" | "deep") => void;
  onRequestGame: (message: string) => void;
  onClose: () => void;
  lang?: string;
}

export function GamePickerModal({
  isOpen,
  isHost,
  playerCount,
  hostName,
  nextLevel = 1,
  onStartGame,
  onStartEmojifyr,
  onStartEmojiMatch,
  onStartEmojiBingo,
  onStartTruthOrDare,
  onRequestGame,
  onClose,
  lang,
}: GamePickerModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [selectedGame, setSelectedGame] = useState<GameTab>("lost-in-translation");
  const [todMode, setTodMode] = useState<"normal" | "deep">("normal");

  if (!isOpen) return null;

  const gameColors: Record<GameTab, string> = {
    "lost-in-translation": "linear-gradient(135deg, #3b82f6, #2563eb)",
    "emoji-bingo": "linear-gradient(135deg, #10b981, #059669)",
    "emojifyr": "linear-gradient(135deg, #ef4444, #dc2626)",
    "emoji-match": "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    "truth-or-dare": "linear-gradient(135deg, #ea580c, #d97706)",
  };

  const tabStyle = (active: boolean, tab: GameTab): React.CSSProperties => ({
    padding: "0.6rem 0.75rem",
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 500,
    background: active ? gameColors[tab] : "var(--bg)",
    color: active ? "#fff" : "var(--muted)",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
  });

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
          padding: "1.5rem",
          width: "100%",
          maxWidth: "340px",
          margin: "1rem",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Game selector — vertical list */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          marginBottom: "1rem",
          background: "var(--bg)",
          borderRadius: "10px",
          padding: "0.25rem",
          border: "1px solid var(--border)",
        }}>
          <button
            onClick={() => setSelectedGame("lost-in-translation")}
            style={tabStyle(selectedGame === "lost-in-translation", "lost-in-translation")}
          >
            🎨 {t("Lost in Translation", lang)}
          </button>
          <button
            onClick={() => setSelectedGame("emoji-bingo")}
            style={tabStyle(selectedGame === "emoji-bingo", "emoji-bingo")}
          >
            🎰 {t("Emoji Bingo", lang)}
          </button>
          <button
            onClick={() => setSelectedGame("emojifyr")}
            style={tabStyle(selectedGame === "emojifyr", "emojifyr")}
          >
            🔥 {t("Emojifyr", lang)}
          </button>
          <button
            onClick={() => setSelectedGame("emoji-match")}
            style={tabStyle(selectedGame === "emoji-match", "emoji-match")}
          >
            🃏 {t("Emoji Match", lang)}
          </button>
          <button
            onClick={() => setSelectedGame("truth-or-dare")}
            style={tabStyle(selectedGame === "truth-or-dare", "truth-or-dare")}
          >
            🎲 {t("Truth or Dare", lang)}
          </button>
        </div>

        {/* Lost in Translation content */}
        {selectedGame === "lost-in-translation" && (
          <>
            {!isHost ? (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎨</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Lost in Translation", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.4 }}>
                  {t("A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!", lang)}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {t("Only the host can start a game.", lang)}
                </p>
                <button
                  onClick={() => {
                    onRequestGame(`${hostName} ${t("can we play \"Lost in Translation\"? 🎮", lang)}`);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("Ask to play!", lang)}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎨</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Lost in Translation", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                  {t("A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.8rem",
                }}>
                  <div style={{ fontWeight: 600 }}>
                    {t("Level", lang)} {nextLevel}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                    {nextLevel === 1
                      ? t("1 word with hint", lang)
                      : nextLevel === 2
                      ? t("2 words", lang)
                      : `${Math.min(nextLevel, 4)}+ ${t("words", lang)}`}
                    {" · "}{t("10 rounds", lang)}
                  </div>
                </div>
                {/* Timer selector */}
                <div style={{
                  display: "flex",
                  gap: "0",
                  marginBottom: "0.75rem",
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
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {playerCount} {t("players", lang)}
                </p>
                {playerCount < 2 ? (
                  <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    {t("Need at least 2 players to start.", lang)}
                  </p>
                ) : null}
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
                    {t("Cancel", lang)}
                  </button>
                  <button
                    onClick={() => onStartGame("lost-in-translation", nextLevel, timerSeconds)}
                    disabled={playerCount < 2}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: playerCount < 2 ? "var(--border)" : "var(--primary)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: playerCount < 2 ? "default" : "pointer",
                      border: "none",
                    }}
                  >
                    {nextLevel > 1 ? `${t("Level", lang)} ${nextLevel}` : t("Start Game", lang)}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Emoji Bingo content */}
        {selectedGame === "emoji-bingo" && (
          <>
            {!isHost ? (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎰</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emoji Bingo", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "1rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--foreground)" }}>
                    {t("How it works", lang)}
                  </div>
                  {t("Emojis are called automatically", lang)} → {t("Tap matching emojis on your card", lang)} → {t("Complete the pattern and hit BINGO!", lang)}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {t("Only the host can start a game.", lang)}
                </p>
                <button
                  onClick={() => {
                    onRequestGame(`${hostName} ${t("can we play \"Emoji Bingo\"? 🎰", lang)}`);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("Ask to play!", lang)}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎰</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emoji Bingo", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang)}
                </p>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "1rem",
                }}>
                  <span>{playerCount} {t("players", lang)}</span>
                  <span>~3–5 {t("min", lang)}</span>
                </div>
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
                    {t("Cancel", lang)}
                  </button>
                  <button
                    onClick={() => onStartEmojiBingo?.()}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {t("Start Game", lang)}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Emojifyr content */}
        {selectedGame === "emojifyr" && (
          <>
            {!isHost ? (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔥</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emojifyr", lang)} 🔥
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Write something, turn it into emojis, and guess!", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "1rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--foreground)" }}>
                    {t("How it works", lang)}
                  </div>
                  {t("One player writes a sentence", lang)} → {t("Host converts it to emojis", lang)} → {t("Everyone guesses the original", lang)}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {t("Only the host can start a game.", lang)}
                </p>
                <button
                  onClick={() => {
                    onRequestGame(`${hostName} ${t("can we play \"Emojifyr\"? 🔥", lang)}`);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("Ask to play!", lang)}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔥</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emojifyr", lang)} 🔥
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Write something, turn it into emojis, and guess!", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--foreground)" }}>
                    {t("How it works", lang)}
                  </div>
                  {t("One player writes a sentence", lang)} → {t("Host converts it to emojis", lang)} → {t("Everyone guesses the original", lang)}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "1rem",
                }}>
                  <span>{playerCount} {t("players", lang)}</span>
                  <span>~1–2 {t("min per round", lang)}</span>
                </div>
                {playerCount < 2 ? (
                  <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    {t("Need at least 2 players to start.", lang)}
                  </p>
                ) : null}
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
                    {t("Cancel", lang)}
                  </button>
                  <button
                    onClick={() => onStartEmojifyr?.()}
                    disabled={playerCount < 2}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: playerCount < 2 ? "var(--border)" : "linear-gradient(135deg, var(--primary), #7c3aed)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: playerCount < 2 ? "default" : "pointer",
                      border: "none",
                    }}
                  >
                    {t("Start Game", lang)}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Truth or Dare content */}
        {selectedGame === "truth-or-dare" && (
          <>
            {!isHost ? (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎲</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Truth or Dare", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("A social game: answer a question or complete a challenge! Take turns with your group.", lang)}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {t("Only the host can start a game.", lang)}
                </p>
                <button
                  onClick={() => {
                    onRequestGame(`${hostName} ${t("can we play \"Truth or Dare\"? 🎲", lang)}`);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("Ask to play!", lang)}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎲</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Truth or Dare", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("A social game: answer a question or complete a challenge! Take turns with your group.", lang)}
                </p>
                {/* Mode selector */}
                <div style={{
                  display: "flex",
                  gap: "0",
                  marginBottom: "0.75rem",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}>
                  {(["normal", "deep"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTodMode(mode)}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0",
                        fontSize: "0.8rem",
                        fontWeight: todMode === mode ? 700 : 500,
                        background: todMode === mode
                          ? (mode === "deep" ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "var(--primary)")
                          : "var(--bg)",
                        color: todMode === mode ? "#fff" : "var(--muted)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {mode === "normal" ? t("Normal", lang) : `${t("Deep", lang)} 🌊`}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "1rem",
                }}>
                  <span>{playerCount} {t("players", lang)}</span>
                  <span>{t("Rotates through all players", lang)}</span>
                </div>
                {playerCount < 2 ? (
                  <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    {t("Need at least 2 players to start.", lang)}
                  </p>
                ) : null}
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
                    {t("Cancel", lang)}
                  </button>
                  <button
                    onClick={() => onStartTruthOrDare?.(todMode)}
                    disabled={playerCount < 2}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: playerCount < 2 ? "var(--border)" : "linear-gradient(135deg, var(--primary), #7c3aed)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: playerCount < 2 ? "default" : "pointer",
                      border: "none",
                    }}
                  >
                    {t("Start Game", lang)}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Emoji Match content */}
        {selectedGame === "emoji-match" && (
          <>
            {!isHost ? (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🃏</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emoji Match", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Find matching emoji pairs! Take turns flipping cards.", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "1rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--foreground)" }}>
                    {t("How it works", lang)}
                  </div>
                  {t("Flip two cards per turn", lang)} → {t("Match a pair to score", lang)} → {t("Most matches wins!", lang)}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {t("Only the host can start a game.", lang)}
                </p>
                <button
                  onClick={() => {
                    onRequestGame(`${hostName} ${t("can we play \"Emoji Match\"? 🃏", lang)}`);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("Ask to play!", lang)}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🃏</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {t("Emoji Match", lang)}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {t("Find matching emoji pairs! Take turns flipping cards.", lang)}
                </p>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--foreground)" }}>
                    {t("How it works", lang)}
                  </div>
                  {t("Flip two cards per turn", lang)} → {t("Match a pair to score", lang)} → {t("Most matches wins!", lang)}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "1rem",
                }}>
                  <span>{playerCount} {t("players", lang)}</span>
                  <span>{t("Works solo or multiplayer", lang)}</span>
                </div>
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
                    {t("Cancel", lang)}
                  </button>
                  <button
                    onClick={() => onStartEmojiMatch?.()}
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
                    {t("Start Game", lang)}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
