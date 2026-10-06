"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { t } from "@/lib/i18n";
import { AvatarDisc } from "@/components/ui/avatar";
import { EmojiArt, Icon } from "@/components/ui/icon";
import { Confetti } from "@/components/ui/effects";

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

// The game's name and the two buttons of its results are worded here, for these screens alone: an entry of
// lib/i18n.ts words every screen that asks for the same English, as the game picker and Emoji Bingo's results do
const COPY = {
  en: { name: "Emoji Match", pairs: "pairs", you: "YOU", findPair: "Find a pair", pair: "PAIR! +1", turns: (n: number) => `${n} ${n === 1 ? "turn" : "turns"}`, secs: (n: number) => `${n}s`, exit: "Exit", playAgain: "Play Again" },
  ja: { name: "絵文字マッチ", pairs: "ペア", you: "あなた", findPair: "ペアを探そう", pair: "ペア！+1", turns: (n: number) => `${n}回`, secs: (n: number) => `${n}秒`, exit: "閉じる", playAgain: "もう一回" },
};
const copy = (lang?: string) => (lang === "ja" ? COPY.ja : COPY.en);

const JA_RE = /[\u3040-\u30ff\u4e00-\u9faf]/;

const SCREEN_BG =
  "repeating-linear-gradient(-45deg, rgba(167, 123, 255, 0.1) 0 14px, transparent 14px 28px), var(--paper)";

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

  // Delay showing completed screen so players can see the final board.
  // A game that had already ended when this mounted (put away, then brought back with Resume) goes straight to
  // the results. The room page does not mount this for a game that ended before the page saw it.
  const [showCompleted, setShowCompleted] = useState(game.status === "completed");
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

/* ── Shared bits ───────────────────────────────────────────── */

function ModalCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="ec-sheet-backdrop" style={{ zIndex: 95, alignItems: "center", padding: 16 }}>
      <div
        className="ec-card"
        style={{
          width: "100%",
          maxWidth: 360,
          maxHeight: "90dvh",
          overflowY: "auto",
          padding: "22px 18px 18px",
          textAlign: "center",
          background: "var(--paper)",
          animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
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
    <ModalCard>
      <Icon name="o-cherry" size={64} style={{ animation: "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" }} />
      <h2 className="ec-chunky" style={{ fontSize: 24, margin: "4px 0", textShadow: "0 3px 0 var(--violet)" }}>
        {copy(lang).name}
      </h2>
      <p style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 14, lineHeight: 1.45 }}>
        {t("Match English and Japanese words! Flip cards to pair translations.", lang)}
      </p>

      {/* Player list */}
      <div
        style={{
          padding: "8px 10px",
          marginBottom: 16,
          border: "2.5px solid var(--ink)",
          borderRadius: 16,
          background: "#fff",
          maxHeight: 200,
          overflowY: "auto",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.6, marginBottom: 6 }}>
          {t("Players", lang)} ({game.players.length}/30)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {game.players.map((p: any) => (
            <span
              key={p.participantId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 10px 2px 2px",
                border: "2px solid var(--ink)",
                borderRadius: 999,
                background: p.participantId === game.hostParticipantId ? "var(--violet-soft)" : "var(--paper)",
                fontSize: 12.5,
                fontWeight: 900,
                animation: "ec-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1)",
              }}
            >
              <AvatarDisc id={p.avatarValue} size={24} border={2} />
              {p.nickname}
              {p.participantId === game.hostParticipantId && (
                <span className="ec-chunky" style={{ fontSize: 9, color: "var(--violet)" }}>
                  {t("HOST", lang)}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!amJoined && (
          <button className="ec-btn violet wiggle" onClick={onJoin}>
            {t("Join Game", lang)}
          </button>
        )}
        {amJoined && !amHost && (
          <button className="ec-btn white" style={{ fontSize: 17 }} onClick={onLeave}>
            {t("Leave Lobby", lang)}
          </button>
        )}
        {amHost && (
          <button className="ec-btn pink wiggle" onClick={onStart}>
            {t("Start Game", lang)}
          </button>
        )}
        {!amJoined && !amHost && (
          <button className="ec-btn white sm" onClick={onClose}>
            {t("Close", lang)}
          </button>
        )}
      </div>
    </ModalCard>
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
  const c = copy(lang);
  const currentPlayer = game.players.find(
    (p: any) => p.participantId === game.currentTurnParticipantId
  );

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
      // The server ends the turn on its own clock; this only nudges it. Outside "active" (a mismatch
      // reveal, the final board) the clock on screen is the finished turn's: there is nothing to end.
      if (remaining === 0 && game.status === "active" && !timeoutFiredRef.current) {
        timeoutFiredRef.current = true;
        onTimeoutTurn();
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [game.turnTimeoutMs, game.turnStartedAt, game.status, onTimeoutTurn]);

  // "PAIR! +1" pop whenever a new pair is matched
  const [pairPop, setPairPop] = useState<number | null>(null);
  const prevPairsRef = useRef(game.matchedPairCount);
  useEffect(() => {
    if (game.matchedPairCount > prevPairsRef.current) {
      const key = Date.now();
      setPairPop(key);
      const timer = setTimeout(() => setPairPop((k) => (k === key ? null : k)), 1500);
      prevPairsRef.current = game.matchedPairCount;
      return () => clearTimeout(timer);
    }
    prevPairsRef.current = game.matchedPairCount;
  }, [game.matchedPairCount]);

  const canFlip = isMyTurn && game.status === "active" && game.selectedCardIds.length < 2;
  const hurry = timeLeft !== null && timeLeft < 5000;
  const timerPct = timeLeft !== null && game.turnTimeoutMs ? (timeLeft / game.turnTimeoutMs) * 100 : 0;
  const rows = game.boardRows ?? Math.ceil(game.board.length / game.boardCols);

  const ranked = [...game.players].filter((p: any) => p.isActive).sort((a: any, b: any) => b.score - a.score);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", flexDirection: "column", overflow: "hidden", background: SCREEN_BG }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", maxWidth: 520, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px 8px", flexShrink: 0 }}>
          {/* End Game is controlled by the iOS host only */}
          {onMinimize && (
            <button
              className="ec-round-btn"
              onClick={onMinimize}
              aria-label={t("Minimize", lang)}
              title={t("Minimize", lang)}
              style={{ width: 40, height: 40, fontSize: 20, boxShadow: "0 3px 0 var(--ink)" }}
            >
              –
            </button>
          )}
          <span
            className="ec-chunky"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 12px 3px 6px",
              border: "2.5px solid var(--ink)",
              borderRadius: 999,
              background: "#fff",
              boxShadow: "0 3px 0 var(--ink)",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="o-cherry" size={24} />
            {c.name}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 900, opacity: 0.6, whiteSpace: "nowrap" }}>
            {game.matchedPairCount}/{game.totalPairs} {c.pairs}
          </span>
        </div>

        {/* Score chips — sorted by score. A row that scrolls sideways also cuts what is drawn above it, so its top
            padding holds the leader's crown and the ring of the current player's chip, which is lifted and tilted.
            The margin takes half of that room from the empty padding under the header. The bottom padding holds
            the shadow under the tilted chip's lower end */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 14px 10px", marginTop: -8, flexShrink: 0 }}>
          {ranked.map((p: any) => {
            const isCurrent = p.participantId === game.currentTurnParticipantId;
            const rank = ranked.findIndex((r: any) => r.score === p.score);
            const isMe = p.participantId === myParticipantId;
            return (
              <div
                key={p.participantId}
                style={{
                  position: "relative",
                  flex: ranked.length <= 3 ? 1 : "none",
                  minWidth: 104,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px 4px 4px",
                  border: "2.5px solid var(--ink)",
                  borderRadius: 14,
                  background: isCurrent ? "var(--yellow)" : "#fff",
                  boxShadow: isCurrent ? "0 5px 0 var(--ink), 0 0 0 3px var(--pink)" : "0 3px 0 var(--ink)",
                  transform: isCurrent ? "translateY(-3px) rotate(-2deg)" : "none",
                  transition: "transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1), background 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {rank === 0 && p.score > 0 && (
                  <Icon name="g-crown" size={22} style={{ position: "absolute", left: 8, top: -14, transform: "rotate(-12deg)" }} />
                )}
                <AvatarDisc id={p.avatarValue} size={32} border={2} shadow={false} />
                <span style={{ minWidth: 0, lineHeight: 1.1 }}>
                  <span style={{ display: "block", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", fontSize: 11, fontWeight: 900 }}>
                    {isMe ? c.you : p.nickname}
                  </span>
                  <span style={{ display: "block", fontSize: 9.5, fontWeight: 900, opacity: 0.55 }}>
                    {c.turns(p.turns ?? 0)}
                  </span>
                </span>
                <b key={p.score} className="ec-chunky" style={{ marginLeft: "auto", fontSize: 19, fontWeight: 400, animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)" }}>
                  {p.score}
                </b>
              </div>
            );
          })}
        </div>

        {/* Turn indicator + timer */}
        <div style={{ padding: "0 14px 4px", flexShrink: 0 }}>
          <div
            key={game.currentTurnParticipantId}
            className="ec-chunky"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 19,
              textAlign: "center",
              animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)",
            }}
          >
            {!isMyTurn && currentPlayer && <AvatarDisc id={currentPlayer.avatarValue} size={28} border={2} />}
            {isMyTurn ? (
              <span>
                {t("Your turn!", lang)} <span style={{ color: "var(--pink)" }}>{c.findPair}</span>
              </span>
            ) : (
              <span>{`${currentPlayer?.nickname ?? "?"}${t("'s turn", lang)}`}</span>
            )}
          </div>
          {timeLeft !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 14, border: "2.5px solid var(--ink)", borderRadius: 999, background: "#fff", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${timerPct}%`,
                    height: "100%",
                    background: hurry ? "var(--red)" : "var(--mint)",
                    borderRight: timerPct > 0 && timerPct < 100 ? "2.5px solid var(--ink)" : "none",
                    transition: "width 0.25s linear, background 0.2s",
                  }}
                />
              </div>
              <span
                className="ec-chunky"
                style={{
                  minWidth: 34,
                  textAlign: "right",
                  fontSize: 15,
                  color: hurry ? "var(--red)" : "var(--ink)",
                  animation: hurry ? "ec-kick 0.5s ease-in-out infinite" : undefined,
                }}
              >
                {c.secs(Math.ceil(timeLeft / 1000))}
              </span>
            </div>
          )}
        </div>

        {/* Board. The top padding is room for the ring around a matched or mismatched card in the first row,
            which is drawn 4px outside the card: the board cuts whatever passes its edge */}
        <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6px 14px 16px", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${game.boardCols}, 1fr)`,
              gap: game.boardCols > 4 ? 6 : 9,
              width: `min(100%, ${game.boardCols * 104}px, calc((100dvh - 250px) * ${(game.boardCols * 0.75) / rows}))`,
            }}
          >
            {game.board.map((card: any) => (
              <MatchCard
                // Card ids repeat from game to game (card_0 ...): a new deal gets new cards, with nothing kept from the last
                key={`${game._id}:${card.cardId}`}
                card={card}
                isClickable={canFlip && !card.isMatched && !card.isRevealed}
                mismatch={game.status === "resolving" && card.isRevealed && !card.isMatched}
                small={game.boardCols > 4}
                onClick={() => onFlipCard(card.cardId)}
              />
            ))}
          </div>
          {pairPop !== null && (
            <div
              key={pairPop}
              className="ec-chunky"
              style={{
                position: "absolute",
                zIndex: 9,
                left: "50%",
                // 42% of the way down the board, not counting its 6px of top padding
                top: "calc(6px + (100% - 6px) * 0.42)",
                padding: "6px 18px",
                border: "3.5px solid var(--ink)",
                borderRadius: 16,
                background: "var(--mint)",
                color: "#fff",
                fontSize: 26,
                textShadow: "var(--outline2), 0 3px 0 var(--ink)",
                boxShadow: "0 5px 0 var(--ink)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                animation: "match-pair-pop 1.5s cubic-bezier(0.3, 1.8, 0.5, 1) both",
              }}
            >
              {c.pair}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes match-pair-pop {
          0% { transform: translateX(-50%) rotate(-6deg) scale(2.2); opacity: 0; }
          25% { transform: translateX(-50%) rotate(-6deg) scale(1); opacity: 1; }
          35% { transform: translateX(-50%) rotate(-8deg) scale(1.08); }
          45%, 80% { transform: translateX(-50%) rotate(-6deg) scale(1); opacity: 1; }
          100% { transform: translateX(-50%) rotate(-6deg) translateY(-30px); opacity: 0; }
        }
        @keyframes match-gone {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.6) rotate(8deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────── */

const MatchCard = memo(function MatchCard({
  card,
  isClickable,
  mismatch,
  small,
  onClick,
}: {
  card: any;
  isClickable: boolean;
  mismatch: boolean;
  small: boolean;
  onClick: () => void;
}) {
  const showFace = card.isRevealed || card.isMatched;
  // Matched cards celebrate briefly, then leave an empty dashed slot.
  const [gone, setGone] = useState<boolean>(card.isMatched);
  useEffect(() => {
    if (!card.isMatched) {
      setGone(false);
      return;
    }
    const timer = setTimeout(() => setGone(true), 1300);
    return () => clearTimeout(timer);
  }, [card.isMatched]);

  // The server sends a face-down card without its face, in the same answer that turns it back. The
  // front keeps drawing the face this card last showed until the turn back has hidden it, then drops it.
  const [lastFace, setLastFace] = useState<{ value: string; label?: string } | null>(null);
  const { value: ownValue, label: ownLabel } = card.content;
  useEffect(() => {
    if (ownValue) {
      setLastFace({ value: ownValue, label: ownLabel });
      return;
    }
    const timer = setTimeout(() => setLastFace(null), 600);
    return () => clearTimeout(timer);
  }, [ownValue, ownLabel]);
  const shown: { value: string; label?: string } = ownValue ? card.content : lastFace ?? card.content;

  const label = shown.label;
  const isJa = label ? JA_RE.test(label) : false;

  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: small ? 12 : 16,
    border: "3px solid var(--ink)",
    boxShadow: "0 4px 0 var(--ink)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        position: "relative",
        perspective: "600px",
        cursor: isClickable ? "pointer" : "default",
        aspectRatio: "3 / 4",
        width: "100%",
      }}
    >
      {/* Empty slot left behind by a matched pair */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: small ? 12 : 16,
          border: "3px dashed var(--line-soft)",
          opacity: gone ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
      {!(gone && card.isMatched) && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            animation: card.isMatched ? "match-gone 0.3s 1s ease-in both" : undefined,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transition: "transform 0.5s cubic-bezier(0.3, 1.4, 0.5, 1)",
              transform: showFace ? "rotateY(180deg)" : "rotateY(0deg)",
              willChange: "transform",
            }}
          >
            {/* Back face */}
            <div
              style={{
                ...face,
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 2.5px, transparent 3px) 0 0 / 14px 14px, var(--violet)",
              }}
            >
              <span className="ec-outline" style={{ fontSize: small ? 20 : 28, textShadow: "var(--outline2), 0 3px 0 var(--ink)" }}>
                ?
              </span>
            </div>

            {/* Front face */}
            <div
              style={{
                ...face,
                transform: "rotateY(180deg)",
                background: card.isMatched ? "var(--mint-soft)" : "#fff",
                boxShadow: card.isMatched
                  ? "0 4px 0 var(--ink), 0 0 0 4px var(--mint)"
                  : mismatch
                  ? "0 4px 0 var(--ink), 0 0 0 4px var(--red)"
                  : "0 4px 0 var(--ink)",
                padding: "4px 3px",
                gap: 2,
              }}
            >
              <span style={{ display: "grid", placeItems: "center", animation: mismatch ? "ec-shake 0.45s ease-in-out" : card.isMatched ? "ec-kick 0.5s ease-in-out 2" : undefined }}>
                <EmojiArt emoji={shown.value} size={small ? 30 : 46} />
              </span>
              {label && (
                <span
                  style={{
                    maxWidth: "100%",
                    padding: "0 2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    lineHeight: 1.1,
                    fontSize: small ? 9 : isJa ? 11 : 12,
                    fontWeight: 900,
                    color: isJa ? "var(--pink)" : "var(--ink)",
                  }}
                >
                  {label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Only re-render if this card's state actually changed
  return prev.card.isRevealed === next.card.isRevealed
    && prev.card.isMatched === next.card.isMatched
    && prev.isClickable === next.isClickable
    && prev.mismatch === next.mismatch
    && prev.small === next.small;
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
  const isCanceled = result?.endReason === "canceled";

  let headline = "";
  let icon = "g-crown";
  if (isCanceled) {
    headline = t("Game Canceled", lang);
    icon = "re-cry";
  } else if (isSolo) {
    headline = t("Board Cleared!", lang);
    icon = "ui-sparkle";
  } else if (result?.isTie) {
    headline = t("It's a Tie!", lang);
    icon = "re-peace";
  } else if (isWinner) {
    headline = t("You Won!", lang);
    icon = "g-crown";
  } else {
    const winner = game.players.find(
      (p: any) => p.participantId === result?.winnerParticipantIds?.[0]
    );
    // The name is put in by a function: as a replacement string, a "$" in a name would be read as a pattern
    headline = t("{name} Won!", lang).replace("{name}", () => winner?.nickname ?? "?");
  }
  const celebrate = !isCanceled && (isWinner || isSolo);

  return (
    <ModalCard>
      {celebrate && <Confetti burstKey={game._id} />}
      <Icon name={icon} size={64} style={{ animation: "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" }} />
      <h2
        className={celebrate ? "ec-outline" : "ec-chunky"}
        style={{
          fontSize: celebrate ? 34 : 24,
          color: celebrate ? "var(--yellow)" : undefined,
          margin: "6px 0 14px",
          animation: celebrate ? "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both" : undefined,
        }}
      >
        {headline}
      </h2>

      {/* Scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
        {sortedPlayers.map((p: any, i: number) => {
          const isMe = p.participantId === myParticipantId;
          const rank = sortedPlayers.findIndex((r: any) => r.score === p.score);
          return (
            <div
              key={p.participantId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px 4px 4px",
                border: "2.5px solid var(--ink)",
                borderRadius: 999,
                background: rank === 0 && !isCanceled ? "var(--yellow-soft)" : "#fff",
                boxShadow: "0 3px 0 var(--ink)",
                animation: `ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) ${0.08 * i}s both`,
              }}
            >
              <span className="ec-chunky" style={{ width: 22, fontSize: 14, textAlign: "center" }}>
                {rank === 0 ? <Icon name="g-crown" size={22} /> : `${rank + 1}`}
              </span>
              <AvatarDisc id={p.avatarValue} size={30} border={2} />
              <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontSize: 13.5, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.nickname}
                {isMe && <span style={{ color: "var(--pink)", marginLeft: 4 }}>({t("you", lang)})</span>}
              </span>
              <span style={{ fontSize: 11, fontWeight: 900, opacity: 0.55 }}>
                {p.turns ?? 0}/{p.score}/{game.totalPairs}
              </span>
              <span className="ec-chunky" style={{ fontSize: 18 }}>{p.score}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="ec-btn white" style={{ flex: 1, fontSize: 17 }} onClick={onClose}>
          {copy(lang).exit}
        </button>
        <button className="ec-btn pink wiggle" style={{ flex: 1.3, fontSize: 17 }} onClick={onPlayAgain}>
          {copy(lang).playAgain}
        </button>
      </div>
    </ModalCard>
  );
}
