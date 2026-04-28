"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { t } from "@/lib/i18n";
import { getAvatarById } from "@/lib/types";

interface EmojiMatchGameProps {
  game: any;
  participants: any[];
  myParticipantId: string;
  isHost: boolean;
  lang?: string;
  onJoinLobby: (gameId: string) => void;
  onLeaveLobby: (gameId: string) => void;
  onStartGame: (gameId: string) => void;
  onFlipCard: (gameId: string, cardId: string) => void;
  onResolveMismatch: (gameId: string) => void;
  onTimeoutTurn: (gameId: string, participantId: string) => void;
  onCancelGame: (gameId: string) => void;
  onPlayAgain: (gameId: string) => void;
  onClose: () => void;
  onMinimize?: () => void;
}

export function EmojiMatchGame({
  game,
  participants,
  myParticipantId,
  isHost,
  lang,
  onJoinLobby,
  onLeaveLobby,
  onStartGame,
  onFlipCard,
  onResolveMismatch,
  onTimeoutTurn,
  onCancelGame,
  onPlayAgain,
  onClose,
  onMinimize,
}: EmojiMatchGameProps) {
  const isMyTurn = game.currentTurnParticipantId === myParticipantId;
  const amJoined = game.players.some(
    (p: any) => p.participantId === myParticipantId
  );
  const amHost = game.hostParticipantId === myParticipantId;

  // Delay showing completed screen so players can see the final board
  const [showCompleted, setShowCompleted] = useState(false);
  const prevStatusRef = useRef(game.status);

  useEffect(() => {
    if (game.status === "completed" && prevStatusRef.current !== "completed") {
      const timer = setTimeout(() => setShowCompleted(true), 1500);
      return () => clearTimeout(timer);
    }
    if (game.status !== "completed") {
      setShowCompleted(false);
    }
    prevStatusRef.current = game.status;
  }, [game.status]);

  // Auto-resolve mismatch — poll until resolved instead of single attempt
  useEffect(() => {
    if (game.status !== "resolving") return;

    const tryResolve = () => {
      // Only attempt if the reveal period should have passed
      if (game.resolveAt && Date.now() >= game.resolveAt) {
        onResolveMismatch(game._id);
      }
    };

    // Initial attempt after the reveal delay
    const initialDelay = game.resolveAt
      ? Math.max(0, game.resolveAt - Date.now()) + 200
      : 1300;
    const timer = setTimeout(tryResolve, initialDelay);

    // Keep retrying every 500ms in case the first attempt fails
    const interval = setInterval(tryResolve, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [game.status, game.resolveAt, game._id, onResolveMismatch]);

  // Stabilize callbacks — must be before any early returns (Rules of Hooks)
  const gameId = game._id;
  const currentTurnId = game.currentTurnParticipantId;
  const stableOnFlipCard = useCallback(
    (cardId: string) => onFlipCard(gameId, cardId),
    [onFlipCard, gameId]
  );
  const stableOnTimeoutTurn = useCallback(() => {
    if (currentTurnId) onTimeoutTurn(gameId, currentTurnId);
  }, [onTimeoutTurn, gameId, currentTurnId]);
  const stableOnCancel = useCallback(
    () => onCancelGame(gameId),
    [onCancelGame, gameId]
  );

  if (game.status === "lobby") {
    return (
      <LobbyView
        game={game}
        amJoined={amJoined}
        amHost={amHost}
        lang={lang}
        onJoin={() => onJoinLobby(game._id)}
        onLeave={() => onLeaveLobby(game._id)}
        onStart={() => onStartGame(game._id)}
        onCancel={() => onCancelGame(game._id)}
        onClose={onClose}
      />
    );
  }

  if (game.status === "active" || game.status === "resolving" || (game.status === "completed" && !showCompleted)) {
    return (
      <GameBoardView
        game={game}
        myParticipantId={myParticipantId}
        isMyTurn={isMyTurn}
        amHost={amHost}
        lang={lang}
        onFlipCard={stableOnFlipCard}
        onTimeoutTurn={stableOnTimeoutTurn}
        onCancel={stableOnCancel}
        onMinimize={onMinimize}
      />
    );
  }

  if ((game.status === "completed" && showCompleted) || game.status === "canceled") {
    return (
      <CompletedView
        game={game}
        myParticipantId={myParticipantId}
        lang={lang}
        onPlayAgain={() => onPlayAgain(game._id)}
        onClose={onClose}
      />
    );
  }

  return null;
}

/* ── Lobby ─────────────────────────────────────────────────── */

function LobbyView({
  game,
  amJoined,
  amHost,
  lang,
  onJoin,
  onLeave,
  onStart,
  onCancel,
  onClose,
}: {
  game: any;
  amJoined: boolean;
  amHost: boolean;
  lang?: string;
  onJoin: () => void;
  onLeave: () => void;
  onStart: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🃏</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {t("Emoji Match", lang)}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.5 }}>
          {t("Match English and Japanese words! Flip cards to pair translations.", lang)}
        </p>

        {/* Player list */}
        <div style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "0.75rem",
          marginBottom: "1rem",
          maxHeight: "200px",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muted)" }}>
            {t("Players", lang)} ({game.players.length}/30)
          </div>
          {game.players.map((p: any) => {
            const avatar = getAvatarById(p.avatarValue);
            return (
              <div key={p.participantId} style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.25rem 0", fontSize: "0.85rem",
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: avatar?.color ?? "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem",
                }}>
                  {avatar?.emoji ?? "?"}
                </span>
                <span>{p.nickname}</span>
                {p.participantId === game.hostParticipantId && (
                  <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 600 }}>
                    {t("HOST", lang)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {!amJoined && (
            <button onClick={onJoin} style={primaryBtnStyle}>
              {t("Join Game", lang)}
            </button>
          )}
          {amJoined && !amHost && (
            <button onClick={onLeave} style={secondaryBtnStyle}>
              {t("Leave Lobby", lang)}
            </button>
          )}
          {amHost && (
            <button onClick={onStart} style={primaryBtnStyle}>
              {t("Start Game", lang)}
            </button>
          )}
          {!amJoined && !amHost && (
            <button onClick={onClose} style={secondaryBtnStyle}>
              {t("Close", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Game Board ────────────────────────────────────────────── */

function GameBoardView({
  game,
  myParticipantId,
  isMyTurn,
  amHost,
  lang,
  onFlipCard,
  onTimeoutTurn,
  onCancel,
  onMinimize,
}: {
  game: any;
  myParticipantId: string;
  isMyTurn: boolean;
  amHost: boolean;
  lang?: string;
  onFlipCard: (cardId: string) => void;
  onTimeoutTurn: () => void;
  onCancel: () => void;
  onMinimize?: () => void;
}) {
  const currentPlayer = game.players.find(
    (p: any) => p.participantId === game.currentTurnParticipantId
  );
  const currentAvatar = currentPlayer ? getAvatarById(currentPlayer.avatarValue) : null;

  // Turn timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timeoutFiredRef = useRef(false);

  useEffect(() => {
    timeoutFiredRef.current = false;
  }, [game.currentTurnParticipantId, game.turnStartedAt]);

  useEffect(() => {
    if (!game.turnTimeoutMs || !game.turnStartedAt) {
      setTimeLeft(null);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - game.turnStartedAt;
      const remaining = Math.max(0, game.turnTimeoutMs - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && !timeoutFiredRef.current) {
        timeoutFiredRef.current = true;
        onTimeoutTurn();
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [game.turnTimeoutMs, game.turnStartedAt, onTimeoutTurn]);

  const canFlip = isMyTurn && game.status === "active" && game.selectedCardIds.length < 2;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 90, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "0.75rem 1rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🃏</span>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            {t("Emoji Match", lang)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            {game.matchedPairCount}/{game.totalPairs}
          </span>
          {/* End Game is controlled by the iOS host only */}
          {onMinimize && (
            <button
              onClick={onMinimize}
              aria-label={t("Minimize", lang)}
              title={t("Minimize", lang)}
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "6px",
                background: "var(--bg)",
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

      {/* Turn indicator */}
      <div style={{
        padding: "0.5rem 1rem", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "0.5rem",
        background: isMyTurn
          ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.1))"
          : "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}>
        {currentAvatar && (
          <span style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: currentAvatar.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem",
          }}>
            {currentAvatar.emoji}
          </span>
        )}
        <span style={{
          fontSize: "0.85rem", fontWeight: 600,
          color: isMyTurn ? "var(--primary)" : "var(--foreground)",
        }}>
          {isMyTurn
            ? t("Your turn!", lang)
            : `${currentPlayer?.nickname ?? "?"}'s ${t("turn", lang)}`}
        </span>
        {timeLeft !== null && (
          <span style={{
            fontSize: "0.75rem",
            color: timeLeft < 5000 ? "#ef4444" : "var(--muted)",
            fontWeight: timeLeft < 5000 ? 700 : 400,
            marginLeft: "0.5rem",
          }}>
            {Math.ceil(timeLeft / 1000)}s
          </span>
        )}
      </div>

      {/* Score strip — sorted by score, with placement emojis */}
      <div style={{
        padding: "0.4rem 1rem", display: "flex", gap: "0.75rem",
        overflowX: "auto", borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        {(() => { const ranked = [...game.players].filter((p: any) => p.isActive).sort((a: any, b: any) => b.score - a.score); return ranked.map((p: any, i: number) => {
          const avatar = getAvatarById(p.avatarValue);
          const isCurrent = p.participantId === game.currentTurnParticipantId;
          const rank = ranked.findIndex((r: any) => r.score === p.score);
          const placeEmoji = rank === 0 ? "🏆" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : "";
          return (
            <div key={p.participantId} style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              opacity: isCurrent ? 1 : 0.6, whiteSpace: "nowrap",
            }}>
              {placeEmoji && <span style={{ fontSize: "0.6rem" }}>{placeEmoji}</span>}
              <span style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: avatar?.color ?? "var(--primary)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem",
                border: isCurrent ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
                {avatar?.emoji ?? "?"}
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                {p.turns ?? 0}/{p.score}/{game.totalPairs}
              </span>
            </div>
          );
        }); })()}
      </div>

      {/* Board */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0.75rem", overflow: "hidden",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${game.boardCols}, 1fr)`,
          gap: "8px",
          width: "100%",
          maxWidth: `${game.boardCols * 90}px`,
        }}>
          {game.board.map((card: any) => (
            <MatchCard
              key={card.cardId}
              card={card}
              isClickable={canFlip && !card.isMatched && !card.isRevealed}
              onClick={() => onFlipCard(card.cardId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────── */

const MatchCard = memo(function MatchCard({
  card,
  isClickable,
  onClick,
}: {
  card: any;
  isClickable: boolean;
  onClick: () => void;
}) {
  const showFace = card.isRevealed || card.isMatched;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        perspective: "600px",
        cursor: isClickable ? "pointer" : "default",
        aspectRatio: "1",
        width: "100%",
      }}
    >
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.35s ease",
        transform: showFace ? "rotateY(180deg)" : "rotateY(0deg)",
        willChange: "transform",
      }}>
        {/* Back face */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #6366f1, #7c3aed)",
          border: "2px solid rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.3)", fontSize: "1.2rem", fontWeight: 700,
        }}>
          ?
        </div>

        {/* Front face */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: "8px",
          background: card.isMatched
            ? "rgba(34,197,94,0.15)"
            : "var(--surface)",
          border: card.isMatched
            ? "2px solid #22c55e"
            : "2px solid var(--primary)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "2px",
          opacity: card.isMatched ? 0.7 : 1,
          transition: "opacity 0.3s, background 0.3s",
        }}>
          <span style={{ fontSize: "clamp(1rem, 3.5vw, 1.6rem)", lineHeight: 1 }}>
            {card.content.value}
          </span>
          {card.content.label && (
            <span style={{
              fontSize: "clamp(0.45rem, 1.5vw, 0.65rem)",
              fontWeight: 600,
              color: "var(--foreground)",
              lineHeight: 1,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              padding: "0 2px",
              position: "absolute",
              bottom: "6px",
            }}>
              {card.content.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render if this card's state actually changed
  return prev.card.isRevealed === next.card.isRevealed
    && prev.card.isMatched === next.card.isMatched
    && prev.isClickable === next.isClickable;
});

/* ── Completed ─────────────────────────────────────────────── */

function CompletedView({
  game,
  myParticipantId,
  lang,
  onPlayAgain,
  onClose,
}: {
  game: any;
  myParticipantId: string;
  lang?: string;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  const result = game.result;
  const isSolo = game.players.length === 1;
  const isWinner = result?.winnerParticipantIds?.includes(myParticipantId);
  const sortedPlayers = [...game.players].sort((a: any, b: any) => b.score - a.score);

  let headline = "";
  let emoji = "🏆";
  if (result?.endReason === "canceled") {
    headline = t("Game Canceled", lang);
    emoji = "😔";
  } else if (isSolo) {
    headline = t("Board Cleared!", lang);
    emoji = "🎉";
  } else if (result?.isTie) {
    headline = t("It's a Tie!", lang);
    emoji = "🤝";
  } else if (isWinner) {
    headline = t("You Won!", lang);
    emoji = "🏆";
  } else {
    const winner = game.players.find(
      (p: any) => p.participantId === result?.winnerParticipantIds?.[0]
    );
    headline = `${winner?.nickname ?? "?"} ${t("Won!", lang)}`;
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, maxWidth: "380px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{emoji}</div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {headline}
        </h2>

        {/* Scores */}
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", width: "100%",
        }}>
          {sortedPlayers.map((p: any, i: number) => {
            const avatar = getAvatarById(p.avatarValue);
            const isMe = p.participantId === myParticipantId;
            const rank = sortedPlayers.findIndex((r: any) => r.score === p.score);
            return (
              <div key={p.participantId} style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.35rem 0", fontWeight: isMe ? 700 : 400,
              }}>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", width: "1.5rem" }}>
                  {rank === 0 ? "🏆" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${i + 1}.`}
                </span>
                <span style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: avatar?.color ?? "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem",
                }}>
                  {avatar?.emoji ?? "?"}
                </span>
                <span style={{ flex: 1, fontSize: "0.85rem" }}>
                  {p.nickname}
                  {isMe && (
                    <span style={{ color: "var(--primary)", marginLeft: "0.25rem" }}>
                      ({t("you", lang)})
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {p.turns ?? 0}/{p.score}/{game.totalPairs}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
          <button onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1 }}>
            {t("Exit", lang)}
          </button>
          <button onClick={onPlayAgain} style={{ ...primaryBtnStyle, flex: 1 }}>
            {t("Play Again", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Styles ─────────────────────────────────────────── */

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center",
};

const panelStyle: React.CSSProperties = {
  background: "var(--surface)", borderRadius: "var(--radius)",
  padding: "1.5rem", width: "100%", maxWidth: "340px",
  margin: "1rem", textAlign: "center",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "0.6rem", borderRadius: "8px",
  background: "linear-gradient(135deg, var(--primary), #7c3aed)",
  color: "#fff", fontWeight: 600, cursor: "pointer",
  border: "none", fontSize: "0.85rem", width: "100%",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.6rem", borderRadius: "8px",
  background: "var(--bg)", border: "1px solid var(--border)",
  fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", width: "100%",
};
