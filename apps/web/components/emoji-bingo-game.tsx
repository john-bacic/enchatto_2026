"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { t } from "@/lib/i18n";
import { AvatarDisc } from "@/components/ui/avatar";
import { Chatto } from "@/components/ui/chatto";
import { EmojiArt, Icon } from "@/components/ui/icon";
import { Confetti, CutIn } from "@/components/ui/effects";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const PATTERN_LABELS: Record<string, { en: string; ja: string }> = {
  line: { en: "Line", ja: "ライン" },
  four_corners: { en: "4 Corners", ja: "四隅" },
  blackout: { en: "Blackout", ja: "ぜんぶ" },
};
const patternLabel = (p: string, lang?: string) => {
  const l = PATTERN_LABELS[p];
  return l ? (lang === "ja" ? l.ja : l.en) : p;
};

// Names for the server's bingo pool, shown bilingually when an emoji is called.
const EMOJI_NAMES: Record<string, [string, string]> = {
  "☀️": ["Sun", "たいよう"], "☁️": ["Cloud", "くも"], "☂️": ["Umbrella", "かさ"], "⛄": ["Snowman", "ゆきだるま"],
  "🌙": ["Moon", "つき"], "🏠": ["House", "いえ"], "☕": ["Coffee", "コーヒー"], "🌷": ["Tulip", "チューリップ"],
  "🍒": ["Cherry", "さくらんぼ"], "🍞": ["Bread", "パン"], "🍰": ["Cake", "ケーキ"], "🚗": ["Car", "くるま"],
  "🍦": ["Ice Cream", "アイス"], "🍉": ["Watermelon", "すいか"], "💎": ["Diamond", "ダイヤ"], "🦋": ["Butterfly", "ちょうちょ"],
  "📷": ["Camera", "カメラ"], "📺": ["TV", "テレビ"], "🚃": ["Train", "でんしゃ"], "🥨": ["Pretzel", "プレッツェル"],
  "🌠": ["Shooting Star", "ながれぼし"], "🌸": ["Flower", "はな"], "🐈": ["Kitty", "こねこ"], "🎁": ["Gift", "プレゼント"],
  "🐰": ["Bunny", "うさぎ"], "🐼": ["Panda", "パンダ"], "🐻": ["Bear", "くま"], "👻": ["Ghost", "おばけ"],
  "🐥": ["Chick", "ひよこ"], "🪼": ["Jellyfish", "くらげ"], "🐶": ["Dog", "いぬ"], "🐹": ["Hamster", "ハムスター"],
  "🐱": ["Cat", "ねこ"], "🐢": ["Turtle", "かめ"], "🦭": ["Seal", "アザラシ"], "🐝": ["Bee", "はち"],
  "🐑": ["Sheep", "ひつじ"], "🐷": ["Pig", "ぶた"], "🐳": ["Whale", "くじら"], "🐕": ["Chihuahua", "チワワ"],
  "💡": ["Light Bulb", "でんきゅう"], "✏️": ["Pencil", "えんぴつ"], "👑": ["Crown", "おうかん"], "⚡": ["Lightning", "かみなり"],
  "❓": ["Question", "はてな"], "🍀": ["Clover", "クローバー"], "🎵": ["Music", "おんがく"], "🎀": ["Ribbon", "リボン"],
};

const COPY = {
  en: { oneAway: "1 AWAY!", bingo: "BINGO!", roll: "ROLL!", you: "YOU", gotBingo: "got BINGO!", players: "players" },
  ja: { oneAway: "あと1つ！", bingo: "ビンゴ！", roll: "ロール！", you: "あなた", gotBingo: "ビンゴ！", players: "人" },
};
const copy = (lang?: string) => (lang === "ja" ? COPY.ja : COPY.en);

const SCREEN_BG =
  "repeating-linear-gradient(-45deg, rgba(63, 220, 176, 0.1) 0 14px, transparent 14px 28px), var(--paper)";

function TitlePill({ lang }: { lang?: string }) {
  return (
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
      <Icon name="g-clover" size={24} />
      {t("Emoji Bingo", lang)}
    </span>
  );
}

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="ec-sheet-backdrop" style={{ zIndex: 95, alignItems: "center", padding: 16 }} onClick={onClose}>
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
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

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
        position: "relative",
        aspectRatio: "1",
        display: "grid",
        placeItems: "center",
        padding: 0,
        border: "2.5px solid var(--ink)",
        borderRadius: 12,
        background: isFree ? "var(--yellow)" : canMark ? "var(--mint-soft)" : "#fff",
        boxShadow: "0 3px 0 var(--ink)",
        cursor: canMark ? "pointer" : "default",
        animation: canMark ? "ec-pulse 1s ease-in-out infinite" : undefined,
        overflow: "visible",
      }}
    >
      {isFree ? (
        <Chatto size={38} bob={false} wave={false} />
      ) : (
        <EmojiArt emoji={emoji} size="78%" />
      )}
      {isMarked && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 4,
              border: "4px solid var(--pink)",
              borderRadius: "50%",
              background: "rgba(255, 122, 182, 0.22)",
              animation: "bingo-stamp 0.45s cubic-bezier(0.3, 1.8, 0.5, 1) both",
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: -5,
              bottom: -5,
              display: "grid",
              placeItems: "center",
              width: 18,
              height: 18,
              border: "2px solid var(--ink)",
              borderRadius: "50%",
              background: "var(--pink)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 900,
              lineHeight: 1,
              animation: "ec-pop-in 0.3s 0.15s cubic-bezier(0.3, 1.8, 0.5, 1) both",
            }}
          >
            ✓
          </span>
        </>
      )}
    </button>
  );
});

// ─── LobbyView ───────────────────────────────────────────────────────────────

function LobbyView({
  game,
  myParticipantId,
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
    <ModalBackdrop onClose={onClose}>
      <Icon name="g-clover" size={64} style={{ animation: "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" }} />
      <h2 className="ec-chunky" style={{ fontSize: 24, margin: "4px 0 4px", textShadow: "0 3px 0 var(--mint)" }}>
        {t("Emoji Bingo", lang)}
      </h2>
      <p style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 14, lineHeight: 1.45 }}>
        {t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang)}
      </p>

      {/* Pattern selector (host only) */}
      {isGameHost && (
        <>
          <div className="ec-label" style={{ justifyContent: "flex-start", marginBottom: 6 }}>
            {t("Win Pattern", lang)}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["line", "four_corners", "blackout"] as const).map((p) => {
              const on = game.winPattern === p;
              return (
                <button
                  key={p}
                  onClick={() => onUpdateSettings(game._id, p, undefined)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    border: "2.5px solid var(--ink)",
                    borderRadius: 999,
                    background: on ? "var(--mint)" : "#fff",
                    boxShadow: on ? "0 3px 0 var(--ink)" : "none",
                    transform: on ? "translateY(-2px)" : "none",
                    fontSize: 12.5,
                    fontWeight: 900,
                  }}
                >
                  {patternLabel(p, lang)}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Player list */}
      <div
        style={{
          padding: "8px 10px",
          marginBottom: 16,
          border: "2.5px solid var(--ink)",
          borderRadius: 16,
          background: "#fff",
          maxHeight: 150,
          overflowY: "auto",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.6, marginBottom: 6 }}>
          {game.players.length} {t("players", lang)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {game.players.map((p) => (
            <span
              key={p.participantId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 10px 2px 2px",
                border: "2px solid var(--ink)",
                borderRadius: 999,
                background: p.participantId === game.hostParticipantId ? "var(--yellow-soft)" : "var(--paper)",
                fontSize: 12.5,
                fontWeight: 900,
                animation: "ec-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1)",
              }}
            >
              <AvatarDisc id={p.avatarValue} size={24} border={2} />
              {p.nickname}
              {p.participantId === game.hostParticipantId && (
                <span style={{ fontSize: 10, opacity: 0.6 }}>({t("host", lang)})</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isInLobby ? (
        <button className="ec-btn mint wiggle" onClick={() => onJoinLobby(game._id)}>
          {t("Join Game", lang)}
        </button>
      ) : isGameHost ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ec-btn white" style={{ flex: 1, fontSize: 17 }} onClick={() => onCancelGame(game._id)}>
            {t("Cancel", lang)}
          </button>
          <button className="ec-btn pink wiggle" style={{ flex: 1.3, fontSize: 17 }} onClick={() => onStartGame(game._id)}>
            {t("Start Game", lang)}
          </button>
        </div>
      ) : (
        <button className="ec-btn white" style={{ fontSize: 17 }} onClick={() => onLeaveLobby(game._id)}>
          {t("Leave Lobby", lang)}
        </button>
      )}
    </ModalBackdrop>
  );
}

// ─── GamePlayView ────────────────────────────────────────────────────────────

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
  const c = copy(lang);
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
  const placedCount = game.players.filter((p) => p.placement > 0).length;
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

  // Celebrate each new BINGO (mine gets the big slam + confetti, others a cut-in)
  const [celebrate, setCelebrate] = useState<{ key: number; name: string; mine: boolean } | null>(null);
  const prevPlacedRef = useRef(placedCount);
  useEffect(() => {
    if (placedCount > prevPlacedRef.current) {
      const latest = [...game.players].filter((p) => p.placement > 0).sort((a, b) => b.placement - a.placement)[0];
      if (latest) {
        setCelebrate({ key: Date.now(), name: latest.nickname, mine: latest.participantId === myParticipantId });
      }
    }
    prevPlacedRef.current = placedCount;
  }, [placedCount, game.players, myParticipantId]);

  const handleRoll = useCallback(() => {
    onRollEmoji(game._id);
  }, [game._id, onRollEmoji]);

  const handleMark = useCallback((cellIndex: number) => {
    onMarkCell(game._id, cellIndex);
  }, [game._id, onMarkCell]);

  const handleBingo = useCallback(async () => {
    const result = await (onClaimBingo as (id: string) => unknown)(game._id) as { valid?: boolean } | undefined;
    if (result && result.valid === false) {
      setToast(t("Not yet!", lang));
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2000);
    }
  }, [game._id, onClaimBingo, lang]);

  if (!me) {
    // Spectator view
    return (
      <ModalBackdrop onClose={onClose}>
        <Icon name="g-clover" size={56} />
        <p className="ec-chunky" style={{ fontSize: 20, marginTop: 4 }}>{t("Emoji Bingo", lang)}</p>
        <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, margin: "6px 0 14px" }}>
          {t("Game in progress", lang)} — {game.calledEmojis.length}/48 {t("called", lang)}
        </p>
        {latestEmoji && (
          <div style={{ marginBottom: 14 }}>
            <EmojiArt emoji={latestEmoji} size={56} />
          </div>
        )}
        <button className="ec-btn white sm" onClick={onClose}>
          {t("Close", lang)}
        </button>
      </ModalBackdrop>
    );
  }

  const latestName = latestEmoji ? EMOJI_NAMES[latestEmoji] : undefined;
  const hurry = countdown != null && countdown <= 3;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 95,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: SCREEN_BG,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", maxWidth: 520, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px 8px", flexShrink: 0 }}>
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
          <TitlePill lang={lang} />
          <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 900, opacity: 0.6, whiteSpace: "nowrap" }}>
            {game.calledEmojis.length}/48 {t("called", lang)} · {patternLabel(game.winPattern, lang)}
          </span>
          {isGameHost && (
            <button
              onClick={() => onCancelGame(game._id)}
              style={{
                flex: "none",
                padding: "3px 10px",
                border: "2.5px solid var(--ink)",
                borderRadius: 999,
                background: "var(--red)",
                color: "#fff",
                boxShadow: "0 2px 0 var(--ink)",
                fontSize: 11.5,
                fontWeight: 900,
              }}
            >
              {t("End", lang)}
            </button>
          )}
        </div>

        {/* The bottom padding holds the card's 6px shadow, which a scrolling area cuts at its edge */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "2px 14px 8px" }}>
          {/* BINGO progress banner */}
          {game.status === "won" && (
            <div
              className="ec-chunky"
              style={{
                alignSelf: "center",
                padding: "3px 16px",
                border: "3px solid var(--ink)",
                borderRadius: 999,
                background: "var(--yellow)",
                boxShadow: "0 3px 0 var(--ink)",
                fontSize: 14,
                transform: "rotate(-2deg)",
              }}
            >
              BINGO! {placedCount}/{totalPlayers} {t("finished", lang)}
            </div>
          )}

          {/* Called emoji + turn */}
          <div className="ec-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 22, boxShadow: "0 5px 0 var(--ink)", flexShrink: 0 }}>
            <div
              key={animKey}
              style={{
                display: "grid",
                placeItems: "center",
                flex: "none",
                width: 76,
                height: 76,
                border: "3.5px solid var(--ink)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #fff 0 20%, var(--yellow) 21%)",
                boxShadow: "0 5px 0 var(--ink)",
                animation: animKey > 0 ? "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" : undefined,
              }}
            >
              {latestEmoji ? (
                <EmojiArt emoji={latestEmoji} size={52} />
              ) : (
                <span className="ec-chunky" style={{ fontSize: 30, opacity: 0.4 }}>?</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {latestEmoji ? (
                <h3 key={animKey} className="ec-chunky" style={{ fontSize: 18, lineHeight: 1.15, animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)" }}>
                  {latestName ? (
                    <>
                      {latestName[0]}! <span style={{ color: "var(--pink)" }}>{latestName[1]}！</span>
                    </>
                  ) : (
                    latestEmoji
                  )}
                </h3>
              ) : (
                <h3 style={{ fontSize: 13, fontWeight: 900, opacity: 0.6 }}>{t("Waiting for first roll...", lang)}</h3>
              )}
              {game.status === "active" && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 12, fontWeight: 900 }}>
                  {currentTurnPlayer && <AvatarDisc id={currentTurnPlayer.avatarValue} size={22} border={2} />}
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isMyTurn ? "var(--blue)" : undefined, opacity: isMyTurn ? 1 : 0.65 }}>
                    {isMyTurn
                      ? t("Your turn to roll!", lang)
                      : `${currentTurnPlayer ? currentTurnPlayer.nickname : "..."} ${t("is rolling...", lang)}`}
                  </span>
                  {countdown != null && countdown > 0 && (
                    <span
                      className="ec-chunky"
                      style={{
                        flex: "none",
                        marginLeft: "auto",
                        padding: "0 7px",
                        border: "2px solid var(--ink)",
                        borderRadius: 999,
                        background: hurry ? "var(--red)" : "#fff",
                        color: hurry ? "#fff" : "var(--ink)",
                        fontSize: 11,
                      }}
                    >
                      {countdown}s
                    </span>
                  )}
                </div>
              )}
              {game.calledEmojis.length > 1 && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {game.calledEmojis.slice(0, -1).reverse().slice(0, 6).map((e, i) => (
                    <span
                      key={`${e}-${i}`}
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 26,
                        height: 26,
                        border: "2px solid var(--ink)",
                        borderRadius: "50%",
                        background: "#fff",
                        opacity: 1 - i * 0.1,
                      }}
                    >
                      <EmojiArt emoji={e} size={19} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player status */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", flexShrink: 0, padding: "2px 0 4px" }}>
            {[...game.players]
              .sort((a, b) => b.markedCells.length - a.markedCells.length)
              .map((p) => {
                const turn = p.participantId === game.currentTurnParticipantId && game.status === "active";
                return (
                  <span
                    key={p.participantId}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      flex: "none",
                      padding: "2px 9px 2px 2px",
                      border: "2px solid var(--ink)",
                      borderRadius: 999,
                      background: p.placement > 0 ? "var(--mint-soft)" : turn ? "var(--yellow)" : "#fff",
                      boxShadow: turn ? "0 3px 0 var(--ink)" : "0 2px 0 var(--ink)",
                      transform: turn ? "translateY(-1px)" : "none",
                      fontSize: 11.5,
                      fontWeight: 900,
                    }}
                  >
                    <AvatarDisc id={p.avatarValue} size={22} border={1.5} />
                    {p.participantId === myParticipantId ? c.you : p.nickname}
                    <span className="ec-chunky" style={{ fontSize: 11, opacity: 0.75 }}>{p.markedCells.length}/25</span>
                    {p.placement === 1 && <Icon name="g-crown" size={18} />}
                    {p.placement > 1 && (
                      <span className="ec-chunky" style={{ fontSize: 11, color: "var(--pink)" }}>#{p.placement}</span>
                    )}
                  </span>
                );
              })}
          </div>

          {/* 5x5 Bingo Card. Never shorter than the card, so that a screen too short for it scrolls to the card's end */}
          <div style={{ flex: "1 0 auto", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <div
              className="ec-card"
              style={{
                // As wide as leaves the whole card and its shadow in view: 362px is the rest of the screen (about
                // 323px), the 33px the card is taller than wide, and a little slack. Not under 270px, where the
                // cells stop shrinking (the mascot in the free cell has a fixed size) and would stick out of the
                // card: a screen too short for that scrolls instead
                width: "min(100%, 440px, max(270px, calc(100dvh - 362px - env(safe-area-inset-bottom))))",
                padding: 8,
                borderRadius: 22,
                background: "var(--blue)",
                boxShadow: "0 6px 0 var(--ink)",
              }}
            >
              <div
                className="ec-chunky"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  marginBottom: 4,
                  color: "#fff",
                  fontSize: 20,
                  textAlign: "center",
                  textShadow: "var(--outline2), 0 3px 0 var(--ink)",
                }}
              >
                {"BINGO".split("").map((l) => <span key={l}>{l}</span>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
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
          </div>
        </div>

        {/* Roll / BINGO buttons */}
        <div style={{ position: "relative", display: "flex", gap: 10, padding: "14px 14px calc(16px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
          {away === 1 && me.placement === 0 && (
            <span
              className="ec-chunky"
              style={{
                position: "absolute",
                right: 18,
                top: -18,
                zIndex: 2,
                padding: "3px 12px",
                border: "3px solid var(--ink)",
                borderRadius: 12,
                background: "var(--red)",
                color: "#fff",
                fontSize: 15,
                boxShadow: "0 4px 0 var(--ink)",
                transform: "rotate(8deg)",
                animation: "ec-kick 0.5s ease-in-out 3",
                pointerEvents: "none",
              }}
            >
              {c.oneAway}
            </span>
          )}
          <button
            className={`ec-btn${isMyTurn && !canBingo ? " wiggle" : ""}`}
            style={{ flex: 1, minHeight: 62, fontSize: 19 }}
            onClick={handleRoll}
            disabled={!(game.status === "active" && isMyTurn)}
          >
            {c.roll}
            {isMyTurn && countdown != null && countdown > 0 && (
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  minWidth: 28,
                  height: 28,
                  border: "2.5px solid var(--ink)",
                  borderRadius: "50%",
                  background: hurry ? "var(--red)" : "#fff",
                  color: hurry ? "#fff" : "var(--ink)",
                  textShadow: "none",
                  fontSize: 14,
                }}
              >
                {countdown}
              </span>
            )}
          </button>
          <button
            className={`ec-btn pink${canBingo ? " wiggle" : ""}`}
            style={{
              flex: 1.2,
              minHeight: 62,
              fontSize: 24,
              animation: canBingo ? "ec-kick 0.6s ease-in-out 4" : undefined,
            }}
            onClick={handleBingo}
            disabled={!canBingo}
          >
            {c.bingo}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="ec-chunky"
          style={{
            position: "fixed",
            bottom: 110,
            left: "50%",
            zIndex: 200,
            padding: "6px 18px",
            border: "3px solid var(--ink)",
            borderRadius: 14,
            background: "var(--red)",
            color: "#fff",
            boxShadow: "0 4px 0 var(--ink)",
            fontSize: 18,
            animation: "bingo-shake 0.35s ease-in-out",
            transform: "translateX(-50%) rotate(-3deg)",
          }}
        >
          {toast}
        </div>
      )}

      {celebrate?.mine && (
        <>
          <Confetti burstKey={celebrate.key} />
          <div
            key={celebrate.key}
            className="ec-outline"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: "34%",
              zIndex: 160,
              textAlign: "center",
              fontSize: 64,
              color: "var(--pink)",
              pointerEvents: "none",
              animation: "bingo-slam-out 2.2s cubic-bezier(0.3, 1.8, 0.5, 1) both",
            }}
          >
            BINGO!
          </div>
        </>
      )}
      {celebrate && !celebrate.mine && (
        <CutIn burstKey={celebrate.key} colors={["#ffd23f", "#ffe57a"]}>
          <Icon name="g-crown" size={40} />
          {celebrate.name} {c.gotBingo}
        </CutIn>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes bingo-stamp {
          0% { transform: scale(2.4) rotate(-40deg); opacity: 0; }
          100% { transform: scale(1) rotate(-12deg); opacity: 1; }
        }
        @keyframes bingo-shake {
          0%, 100% { transform: translateX(-50%) rotate(-3deg); }
          25% { transform: translateX(calc(-50% + 8px)) rotate(-3deg); }
          75% { transform: translateX(calc(-50% - 8px)) rotate(-3deg); }
        }
        @keyframes bingo-slam-out {
          0% { transform: rotate(-4deg) scale(2.4); opacity: 0; }
          20% { transform: rotate(-4deg) scale(1); opacity: 1; }
          30% { transform: rotate(-7deg) scale(1.08); }
          40%, 85% { transform: rotate(-4deg) scale(1); opacity: 1; }
          100% { transform: rotate(-4deg) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── CompletedView ───────────────────────────────────────────────────────────

function CompletedView({
  game,
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

  const placeColors = ["", "var(--yellow)", "var(--blue-soft)", "var(--pink-soft)"];

  return (
    <ModalBackdrop onClose={onClose}>
      {!isCanceled && winners.length > 0 && <Confetti burstKey={game._id} />}
      {isCanceled ? (
        <h2 className="ec-chunky" style={{ fontSize: 22, marginBottom: 12 }}>
          {t("Game Canceled", lang)}
        </h2>
      ) : winners.length === 0 ? (
        <h2 className="ec-chunky" style={{ fontSize: 22, marginBottom: 12 }}>
          {t("No Winner", lang)}
        </h2>
      ) : (
        <h2
          className="ec-outline"
          style={{
            fontSize: 48,
            color: "var(--pink)",
            marginBottom: 14,
            animation: "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both",
          }}
        >
          BINGO!
        </h2>
      )}

      {/* Winners */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {winners.map((w, i) => (
          <div
            key={w.participantId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px 6px 6px",
              border: "3px solid var(--ink)",
              borderRadius: 999,
              background: placeColors[w.placement] ?? "#fff",
              boxShadow: "0 4px 0 var(--ink)",
              transform: w.placement === 1 ? "rotate(-1.5deg)" : "none",
              animation: `ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) ${0.1 * i}s both`,
            }}
          >
            <span style={{ position: "relative" }}>
              <AvatarDisc id={w.avatarValue} size={w.placement === 1 ? 46 : 38} />
              {w.placement === 1 && (
                <Icon name="g-crown" size={26} style={{ position: "absolute", left: "50%", top: -18, marginLeft: -13, transform: "rotate(-10deg)" }} />
              )}
            </span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontSize: 15, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {w.nickname}
            </span>
            <span className="ec-chunky" style={{ fontSize: 13, opacity: 0.7 }}>{w.markedCells.length}/25</span>
            <span className="ec-chunky" style={{ fontSize: 20 }}>#{w.placement}</span>
          </div>
        ))}
      </div>

      {/* Other players */}
      {others.length > 0 && (
        <div style={{ marginTop: 12, padding: "6px 10px", border: "2.5px dashed var(--ink)", borderRadius: 14, background: "#fff" }}>
          {others.map((p) => (
            <div key={p.participantId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 13, fontWeight: 900 }}>
              <AvatarDisc id={p.avatarValue} size={26} border={2} />
              <span style={{ opacity: 0.75 }}>{p.nickname}</span>
              <span className="ec-chunky" style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>{p.markedCells.length}/25</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ margin: "14px 0 16px", fontSize: 12, fontWeight: 900, opacity: 0.6 }}>
        {patternLabel(game.winPattern, lang)} · {game.calledEmojis.length} {t("called", lang)}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="ec-btn white" style={{ flex: 1, fontSize: 17 }} onClick={onClose}>
          {t("Exit", lang)}
        </button>
        <button className="ec-btn pink wiggle" style={{ flex: 1.3, fontSize: 17 }} onClick={() => onPlayAgain(game._id)}>
          {t("Play Again", lang)}
        </button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

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
