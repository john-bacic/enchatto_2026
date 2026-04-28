"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { PRESET_AVATARS } from "@/lib/types";
import { t } from "@/lib/i18n";

// ─── Types ─────────────────────────────────��───────────────────���─────────────

interface BingoPlayer {
  participantId: string;
  nickname: string;
  avatarValue: string;
  joinedAt: number;
  card: string[];
  markedCells: number[];
  placement: number;
}

interface BingoGame {
  _id: string;
  roomId: string;
  status: "lobby" | "active" | "won" | "completed" | "canceled";
  hostParticipantId: string;
  winPattern: "line" | "four_corners" | "blackout";
  callIntervalMs: number;
  turnOrder?: string[];
  currentTurnParticipantId?: string;
  turnStartedAt?: number;
  turnTimeoutMs?: number;
  players: BingoPlayer[];
  drawDeck: string[];
  calledEmojis: string[];
  drawIndex: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  firstBingoAt?: number;
  nextDrawScheduledAt?: number;
}

interface EmojiBingoGameProps {
  game: BingoGame;
  myParticipantId: string;
  isHost: boolean;
  lang?: string;
  onJoinLobby: (gameId: string) => void;
  onLeaveLobby: (gameId: string) => void;
  onStartGame: (gameId: string) => void;
  onUpdateSettings: (gameId: string, winPattern?: string, callIntervalMs?: number) => void;
  onRollEmoji: (gameId: string) => void;
  onMarkCell: (gameId: string, cellIndex: number) => void;
  onClaimBingo: (gameId: string) => void;
  onCancelGame: (gameId: string) => void;
  onPlayAgain: (gameId: string) => void;
  onClose: () => void;
  onMinimize?: () => void;
}

// ─── Helpers ────────────────────────────────���────────────────────────────���───

function getEmoji(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.emoji ?? "👤";
}

const FREE_SPACE = "⭐";

// Win patterns for client-side detection
const LINE_PATTERNS = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];
const FOUR_CORNERS = [0, 4, 20, 24];

function hasWinningPattern(markedCells: number[], winPattern: string): boolean {
  const marked = new Set(markedCells);
  if (winPattern === "line") {
    return LINE_PATTERNS.some((p) => p.every((i) => marked.has(i)));
  }
  if (winPattern === "four_corners") {
    return FOUR_CORNERS.every((i) => marked.has(i));
  }
  // blackout
  for (let i = 0; i < 25; i++) if (!marked.has(i)) return false;
  return true;
}

function cellsAwayFromWin(markedCells: number[], winPattern: string): number {
  const marked = new Set(markedCells);
  if (winPattern === "line") {
    let minAway = 5;
    for (const pattern of LINE_PATTERNS) {
      const away = pattern.filter((i) => !marked.has(i)).length;
      minAway = Math.min(minAway, away);
    }
    return minAway;
  }
  if (winPattern === "four_corners") {
    return FOUR_CORNERS.filter((i) => !marked.has(i)).length;
  }
  // blackout
  let count = 0;
  for (let i = 0; i < 25; i++) if (!marked.has(i)) count++;
  return count;
}

const PATTERN_LABELS: Record<string, string> = {
  line: "Line",
  four_corners: "4 Corners",
  blackout: "Blackout",
};


// ─── BingoCell ───────────────────────────────────────────────────────────────

const BingoCell = memo(function BingoCell({
  emoji,
  index,
  isMarked,
  isCalled,
  isFree,
  onMark,
}: {
  emoji: string;
  index: number;
  isMarked: boolean;
  isCalled: boolean;
  isFree: boolean;
  onMark: (index: number) => void;
}) {
  const canMark = !isMarked && (isCalled || isFree);

  return (
    <button
      onClick={() => canMark && onMark(index)}
      style={{
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        border: isMarked
          ? "2px solid #22c55e"
          : isCalled && !isMarked
            ? "2px solid #facc15"
            : "1px solid var(--border)",
        borderRadius: "8px",
        background: isMarked
          ? isFree
            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
            : "linear-gradient(135deg, #22c55e, #16a34a)"
          : isFree
            ? "linear-gradient(135deg, #fef3c7, #fde68a)"
            : isCalled
              ? "rgba(250, 204, 21, 0.15)"
              : "var(--surface)",
        cursor: canMark ? "pointer" : "default",
        transition: "all 0.15s ease",
        position: "relative",
        padding: 0,
      }}
    >
      <span style={{ opacity: isMarked && !isFree ? 0.6 : 1 }}>{emoji}</span>
      {isMarked && !isFree && (
        <span style={{
          position: "absolute",
          fontSize: "1.1rem",
          color: "#fff",
          fontWeight: 700,
        }}>
          ✓
        </span>
      )}
    </button>
  );
});

// ─── LobbyView ──────────────────────────────────────────��───────────────────

function LobbyView({
  game,
  myParticipantId,
  isHost,
  lang,
  onJoinLobby,
  onLeaveLobby,
  onStartGame,
  onUpdateSettings,
  onCancelGame,
  onClose,
}: EmojiBingoGameProps & { game: BingoGame }) {
  const isInLobby = game.players.some((p) => p.participantId === myParticipantId);
  const isGameHost = game.hostParticipantId === myParticipantId;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)", borderRadius: "16px", padding: "1.5rem",
        width: "100%", maxWidth: "340px", margin: "1rem", textAlign: "center",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎰</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {t("Emoji Bingo", lang)}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.4 }}>
          {t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang)}
        </p>

        {/* Pattern selector (host only) */}
        {isGameHost && (
          <>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.35rem", textAlign: "left" }}>
              {t("Win Pattern", lang)}
            </div>
            <div style={{
              display: "flex", gap: 0, marginBottom: "0.75rem",
              borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)",
            }}>
              {(["line", "four_corners", "blackout"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdateSettings(game._id, p, undefined)}
                  style={{
                    flex: 1, padding: "0.45rem 0", fontSize: "0.75rem",
                    fontWeight: game.winPattern === p ? 700 : 500,
                    background: game.winPattern === p ? "linear-gradient(135deg, #10b981, #059669)" : "var(--bg)",
                    color: game.winPattern === p ? "#fff" : "var(--muted)",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {PATTERN_LABELS[p]}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Player list */}
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "1rem",
          maxHeight: "120px", overflowY: "auto",
        }}>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
            {game.players.length} {t("players", lang)}
          </div>
          {game.players.map((p) => (
            <div key={p.participantId} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.2rem 0", fontSize: "0.8rem",
            }}>
              <span>{getEmoji(p.avatarValue)}</span>
              <span>{p.nickname}</span>
              {p.participantId === game.hostParticipantId && (
                <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>({t("host", lang)})</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {!isInLobby ? (
          <button
            onClick={() => onJoinLobby(game._id)}
            style={{
              width: "100%", padding: "0.6rem", borderRadius: "8px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff", fontWeight: 600, cursor: "pointer", border: "none",
            }}
          >
            {t("Join Game", lang)}
          </button>
        ) : isGameHost ? (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onCancelGame(game._id)}
              style={{
                flex: 1, padding: "0.6rem", borderRadius: "8px",
                background: "var(--bg)", border: "1px solid var(--border)",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              {t("Cancel", lang)}
            </button>
            <button
              onClick={() => onStartGame(game._id)}
              style={{
                flex: 1, padding: "0.6rem", borderRadius: "8px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff", fontWeight: 600, cursor: "pointer", border: "none",
              }}
            >
              {t("Start Game", lang)}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onLeaveLobby(game._id)}
            style={{
              width: "100%", padding: "0.6rem", borderRadius: "8px",
              background: "var(--bg)", border: "1px solid var(--border)",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            {t("Leave Lobby", lang)}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── GamePlayView ────────────────────────────────���───────────────────────────

function GamePlayView({
  game,
  myParticipantId,
  lang,
  onRollEmoji,
  onMarkCell,
  onClaimBingo,
  onCancelGame,
  onClose,
  onMinimize,
}: EmojiBingoGameProps & { game: BingoGame }) {
  const me = game.players.find((p) => p.participantId === myParticipantId);
  const calledSet = new Set(game.calledEmojis);
  const markedSet = me ? new Set(me.markedCells) : new Set<number>();

  const canBingo = me ? hasWinningPattern(me.markedCells, game.winPattern) && me.placement === 0 : false;
  const away = me ? cellsAwayFromWin(me.markedCells, game.winPattern) : 99;
  const isGameHost = game.hostParticipantId === myParticipantId;
  const isMyTurn = game.currentTurnParticipantId === myParticipantId && game.status === "active";
  const currentTurnPlayer = game.players.find((p) => p.participantId === game.currentTurnParticipantId);

  // Toast state for false bingo
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Turn countdown (10s timeout)
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!game.turnStartedAt || !game.turnTimeoutMs || game.status === "won") { setCountdown(null); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((game.turnStartedAt! + (game.turnTimeoutMs ?? 10000) - Date.now()) / 1000));
      setCountdown(remaining);
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [game.turnStartedAt, game.turnTimeoutMs, game.status]);

  // Track how many players have finished
  const placedCount = game.players.filter((p: any) => p.placement > 0).length;
  const totalPlayers = game.players.length;

  // Latest called emoji animation
  const latestEmoji = game.calledEmojis.length > 0
    ? game.calledEmojis[game.calledEmojis.length - 1]
    : null;
  const [animKey, setAnimKey] = useState(0);
  const prevCountRef = useRef(game.calledEmojis.length);
  useEffect(() => {
    if (game.calledEmojis.length > prevCountRef.current) {
      setAnimKey((k) => k + 1);
    }
    prevCountRef.current = game.calledEmojis.length;
  }, [game.calledEmojis.length]);

  const handleRoll = useCallback(() => {
    onRollEmoji(game._id);
  }, [game._id, onRollEmoji]);

  const handleMark = useCallback((cellIndex: number) => {
    onMarkCell(game._id, cellIndex);
  }, [game._id, onMarkCell]);

  const handleBingo = useCallback(async () => {
    const result = await (onClaimBingo as any)(game._id);
    if (result && result.valid === false) {
      setToast(t("Not yet!", lang));
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2000);
    }
  }, [game._id, onClaimBingo, lang]);

  if (!me) {
    // Spectator view
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center",
      }} onClick={onClose}>
        <div style={{
          background: "var(--surface)", borderRadius: "16px", padding: "1.5rem",
          textAlign: "center", maxWidth: "300px",
        }} onClick={(e) => e.stopPropagation()}>
          <p style={{ fontSize: "1rem", fontWeight: 600 }}>🎰 {t("Emoji Bingo", lang)}</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.5rem 0" }}>
            {t("Game in progress", lang)} — {game.calledEmojis.length}/48 {t("called", lang)}
          </p>
          <button onClick={onClose} style={{
            padding: "0.5rem 1.5rem", borderRadius: "8px",
            background: "var(--bg)", border: "1px solid var(--border)",
            fontWeight: 600, cursor: "pointer",
          }}>
            {t("Close", lang)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 95, display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🎰</span>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t("Emoji Bingo", lang)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            {game.calledEmojis.length}/48 {t("called", lang)} · {PATTERN_LABELS[game.winPattern]}
          </span>
          {isGameHost && (
            <button onClick={() => onCancelGame(game._id)} style={{
              padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem",
              background: "var(--surface)", border: "1px solid var(--border)",
              cursor: "pointer", color: "#ef4444",
            }}>
              {t("End", lang)}
            </button>
          )}
          {onMinimize && (
            <button
              onClick={onMinimize}
              aria-label={t("Minimize", lang)}
              title={t("Minimize", lang)}
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "6px",
                background: "var(--surface)",
                color: "var(--foreground)",
                fontSize: "1rem",
                fontWeight: 700,
                border: "1px solid var(--border)",
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

      {/* BINGO progress banner */}
      {game.status === "won" && (
        <div style={{
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          color: "#000", textAlign: "center", padding: "0.4rem",
          fontWeight: 700, fontSize: "0.85rem",
        }}>
          BINGO! {placedCount}/{totalPlayers} {t("finished", lang)}
        </div>
      )}

      {/* Turn indicator */}
      {game.status === "active" && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0.75rem", padding: "0.5rem 0.75rem",
          background: isMyTurn ? "rgba(16,185,129,0.1)" : "transparent",
          borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <span style={{ fontSize: "0.85rem", color: isMyTurn ? "#059669" : "var(--muted)", fontWeight: isMyTurn ? 700 : 400 }}>
            {isMyTurn
              ? t("Your turn to roll!", lang)
              : `${currentTurnPlayer ? `${getEmoji(currentTurnPlayer.avatarValue)} ${currentTurnPlayer.nickname}` : "..."} ${t("is rolling...", lang)}`}
          </span>
          {countdown != null && countdown > 0 && (
            <span style={{ fontSize: "0.75rem", color: countdown <= 3 ? "#ef4444" : "var(--muted)" }}>
              {countdown}s
            </span>
          )}
        </div>
      )}

      {/* Called emoji strip */}
      <div style={{
        padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          overflowX: "auto", WebkitOverflowScrolling: "touch",
        }}>
          {latestEmoji && (
            <div key={animKey} style={{
              fontSize: "2rem", flexShrink: 0,
              animation: "bingo-bounce 0.4s ease-out",
            }}>
              {latestEmoji}
            </div>
          )}
          {game.calledEmojis.slice(0, -1).reverse().slice(0, 7).map((e, i) => (
            <span key={`${e}-${i}`} style={{
              fontSize: "1.2rem", opacity: 0.5 - i * 0.05, flexShrink: 0,
            }}>
              {e}
            </span>
          ))}
          {game.calledEmojis.length === 0 && (
            <span style={{
              fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic",
            }}>
              {t("Waiting for first roll...", lang)}
            </span>
          )}
        </div>
      </div>

      {/* Player status bar */}
      <div style={{
        display: "flex", gap: "0.5rem", padding: "0.35rem 0.75rem",
        overflowX: "auto", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        {[...game.players]
          .sort((a, b) => b.markedCells.length - a.markedCells.length)
          .map((p) => (
            <div key={p.participantId} style={{
              display: "flex", alignItems: "center", gap: "0.2rem",
              fontSize: "0.7rem", flexShrink: 0,
              fontWeight: p.participantId === myParticipantId ? 700 : 400,
              color: p.placement > 0 ? "#22c55e" : "var(--muted)",
            }}>
              {p.participantId === game.currentTurnParticipantId && game.status === "active" && <span>🎲</span>}
              <span>{getEmoji(p.avatarValue)}</span>
              <span>{p.markedCells.length}/25</span>
              {p.placement === 1 && <span>🏆</span>}
              {p.placement === 2 && <span>🥈</span>}
              {p.placement === 3 && <span>🥉</span>}
            </div>
          ))}
      </div>

      {/* Near-bingo indicator */}
      {away === 1 && me.placement === 0 && (
        <div style={{
          textAlign: "center", padding: "0.3rem",
          background: "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.2))",
          fontSize: "0.8rem", fontWeight: 700, color: "#b45309",
        }}>
          1 {t("away", lang)}!
        </div>
      )}

      {/* 5x5 Bingo Card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0.5rem",
        overflow: "hidden",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "4px",
          width: "100%",
          maxWidth: "360px",
          aspectRatio: "1",
        }}>
          {me.card.map((emoji, i) => (
            <BingoCell
              key={i}
              emoji={emoji}
              index={i}
              isMarked={markedSet.has(i)}
              isCalled={calledSet.has(emoji)}
              isFree={emoji === FREE_SPACE}
              onMark={handleMark}
            />
          ))}
        </div>
      </div>

      {/* Roll / BINGO button */}
      <div style={{ padding: "0.5rem 0.75rem 1rem", flexShrink: 0 }}>
        {canBingo ? (
          <button
            onClick={handleBingo}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.2rem",
              cursor: "pointer",
              border: "none",
              letterSpacing: "0.1em",
              animation: "bingo-pulse 1.5s ease-in-out infinite",
            }}
          >
            BINGO!
          </button>
        ) : game.status === "active" && isMyTurn ? (
          <button
            onClick={handleRoll}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.2rem",
              cursor: "pointer",
              border: "none",
              letterSpacing: "0.05em",
              animation: "bingo-pulse 1.5s ease-in-out infinite",
            }}
          >
            🎲 {t("Roll!", lang)}
          </button>
        ) : (
          <button
            disabled
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              background: "var(--border)",
              color: "var(--muted)",
              fontWeight: 800,
              fontSize: "1.2rem",
              cursor: "default",
              border: "none",
              letterSpacing: "0.1em",
            }}
          >
            BINGO!
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "6rem", left: "50%", transform: "translateX(-50%)",
          background: "#ef4444", color: "#fff", padding: "0.5rem 1.25rem",
          borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem",
          zIndex: 200, animation: "bingo-shake 0.3s ease-in-out",
        }}>
          {toast}
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes bingo-bounce {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bingo-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px 4px rgba(16,185,129,0.3); }
        }
        @keyframes bingo-shake {
          0%, 100% { transform: translateX(-50%); }
          25% { transform: translateX(calc(-50% + 8px)); }
          75% { transform: translateX(calc(-50% - 8px)); }
        }
        @keyframes bingo-confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── CompletedView ───────────────────────────────────────────────────────────

function CompletedView({
  game,
  myParticipantId,
  lang,
  onPlayAgain,
  onClose,
}: EmojiBingoGameProps & { game: BingoGame }) {
  const winners = [...game.players]
    .filter((p) => p.placement > 0)
    .sort((a, b) => a.placement - b.placement);
  const others = game.players
    .filter((p) => p.placement === 0)
    .sort((a, b) => b.markedCells.length - a.markedCells.length);
  const isCanceled = game.status === "canceled";

  const placementEmoji = ["", "🏆", "🥈", "🥉"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)", borderRadius: "16px", padding: "1.5rem",
        width: "100%", maxWidth: "340px", margin: "1rem", textAlign: "center",
      }} onClick={(e) => e.stopPropagation()}>
        {isCanceled ? (
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            {t("Game Canceled", lang)}
          </h2>
        ) : winners.length === 0 ? (
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            {t("No Winner", lang)}
          </h2>
        ) : (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>🎉</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              BINGO!
            </h2>
          </>
        )}

        {/* Winners */}
        {winners.map((w) => (
          <div key={w.participantId} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.5rem", marginBottom: "0.5rem", fontSize: "1rem",
          }}>
            <span style={{ fontSize: "1.3rem" }}>{placementEmoji[w.placement]}</span>
            <span style={{ fontSize: "1.2rem" }}>{getEmoji(w.avatarValue)}</span>
            <span style={{ fontWeight: 700 }}>{w.nickname}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {w.markedCells.length}/25
            </span>
          </div>
        ))}

        {/* Other players */}
        {others.length > 0 && (
          <div style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "0.5rem", marginTop: "0.5rem",
            marginBottom: "1rem",
          }}>
            {others.map((p) => (
              <div key={p.participantId} style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.2rem 0", fontSize: "0.8rem", color: "var(--muted)",
              }}>
                <span>{getEmoji(p.avatarValue)}</span>
                <span>{p.nickname}</span>
                <span style={{ marginLeft: "auto" }}>{p.markedCells.length}/25</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
          {PATTERN_LABELS[game.winPattern]} · {game.calledEmojis.length} {t("called", lang)}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px",
              background: "var(--bg)", border: "1px solid var(--border)",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            {t("Exit", lang)}
          </button>
          <button
            onClick={() => onPlayAgain(game._id)}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff", fontWeight: 600, cursor: "pointer", border: "none",
            }}
          >
            {t("Play Again", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────���─────

export function EmojiBingoGame(props: EmojiBingoGameProps) {
  const { game } = props;

  if (game.status === "lobby") {
    return <LobbyView {...props} game={game} />;
  }
  if (game.status === "active" || game.status === "won") {
    return <GamePlayView {...props} game={game} />;
  }
  if (game.status === "completed" || game.status === "canceled") {
    return <CompletedView {...props} game={game} />;
  }
  return null;
}
