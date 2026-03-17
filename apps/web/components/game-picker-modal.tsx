"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type GameTab = "lost-in-translation" | "emojifyr";

interface GamePickerModalProps {
  isOpen: boolean;
  isHost: boolean;
  playerCount: number;
  hostName?: string;
  nextLevel?: number;
  onStartGame: (gameType: string, level: number, timerSeconds: number) => void;
  onStartEmojifyr?: () => void;
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
  onRequestGame,
  onClose,
  lang,
}: GamePickerModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [selectedGame, setSelectedGame] = useState<GameTab>("lost-in-translation");

  if (!isOpen) return null;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.5rem 0.25rem",
    fontSize: "0.8rem",
    fontWeight: active ? 700 : 500,
    background: active ? "linear-gradient(135deg, var(--primary), #7c3aed)" : "var(--bg)",
    color: active ? "#fff" : "var(--muted)",
    border: "none",
    cursor: "pointer",
    borderRadius: active ? "8px" : "8px",
    transition: "all 0.2s ease",
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
        {/* Game tab selector */}
        <div style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1rem",
          background: "var(--bg)",
          borderRadius: "10px",
          padding: "0.2rem",
          border: "1px solid var(--border)",
        }}>
          <button
            onClick={() => setSelectedGame("lost-in-translation")}
            style={tabStyle(selectedGame === "lost-in-translation")}
          >
            🎨 {t("Lost in Translation", lang)}
          </button>
          <button
            onClick={() => setSelectedGame("emojifyr")}
            style={tabStyle(selectedGame === "emojifyr")}
          >
            🔥 {t("Emojifyr", lang)}
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
                  {t("Write a sentence, turn it into emojis, and guess!", lang)}
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
                  {t("Write a sentence, turn it into emojis, and guess!", lang)}
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
      </div>
    </div>
  );
}
