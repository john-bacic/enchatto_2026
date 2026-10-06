"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { t } from "@/lib/i18n";
import { isImeComposing } from "@/lib/keyboard";
import { DrawingCanvas, DrawingCanvasHandle } from "@/components/drawing-canvas";
import { todTrace } from "@/components/tod-debug-panel";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Confetti, Rays } from "@/components/ui/effects";

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
    roundBreakAckedTurns?: number;
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
  // The four that answer with a promise resolve to false when the action failed and the room page has told the player
  onSubmitChoice: (gameId: string, choice: "truth" | "dare") => Promise<boolean>;
  onSubmitResponse: (gameId: string, responseText?: string, responseMediaUrl?: string) => Promise<boolean>;
  onAdvanceTurn: (gameId: string) => Promise<boolean>;
  onSkipTurn: (gameId: string) => void;
  onEndGame: (gameId: string) => void;
  onSubmitRating: (turnId: string, score: number) => Promise<boolean>;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  onClose: () => void;
  onMinimize?: () => void;
}

type PlayerInfo = TruthOrDareGameProps["game"]["playerInfo"][number];
type RatedTurn = { participantId: string; ratings: Array<{ participantId: string; score: number }> };

const COPY = {
  en: {
    truthSub: "本当のこと",
    dareSub: "チャレンジ",
    or: "OR",
    rateHint: "Everyone rates your answer 1–5",
    lastTurn: "Last turn:",
    did: "did a",
    rated: "rated",
    normal: "Normal",
    turn: "turn",
  },
  ja: {
    truthSub: "TRUTH",
    dareSub: "DARE",
    or: "OR",
    rateHint: "みんなが答えを1〜5で評価するよ",
    lastTurn: "前のターン：",
    did: "→",
    rated: "人が評価",
    normal: "ノーマル",
    turn: "ターン",
  },
};

const TOD_CSS = `
@keyframes tod-l { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(-9deg) translateY(-8px); } }
@keyframes tod-r { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(9deg) translateY(-8px); } }
.tod-card { transition: transform 0.08s, box-shadow 0.08s; }
.tod-card:active:not(:disabled) { transform: translateY(6px) rotate(var(--tod-r)) !important; box-shadow: 0 3px 0 var(--ink) !important; animation: none !important; }
`;

function parsePrompt(text: string | undefined, lang?: string) {
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    return lang === "ja" ? parsed.ja : parsed.en;
  } catch {
    return text;
  }
}

function rankByRating(turns: RatedTurn[], playerInfo: PlayerInfo[]) {
  const playerScores: Record<string, { total: number; count: number }> = {};
  for (const rt of turns) {
    if (rt.ratings.length === 0) continue;
    const pid = rt.participantId;
    if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
    const avg = rt.ratings.reduce((s, r) => s + r.score, 0) / rt.ratings.length;
    playerScores[pid].total += avg;
    playerScores[pid].count += 1;
  }
  return Object.entries(playerScores)
    .map(([pid, s]) => ({
      pid,
      avg: s.total / s.count,
      player: playerInfo.find((p) => p.participantId === pid),
    }))
    .sort((a, b) => b.avg - a.avg);
}

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
        textTransform: "uppercase",
      }}
    >
      <Icon name="g-question" size={24} />
      {t("Truth or Dare", lang)}
    </span>
  );
}

function StarChip({ value, size = "md" }: { value: string; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span
      className="ec-chunky"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: sm ? "1px 6px 1px 3px" : "3px 10px 3px 5px",
        border: `${sm ? 2 : 2.5}px solid var(--ink)`,
        borderRadius: 999,
        background: "var(--yellow)",
        boxShadow: sm ? "0 2px 0 var(--ink)" : "0 3px 0 var(--ink)",
        fontSize: sm ? 10.5 : 14,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="o-star" size={sm ? 13 : 18} />
      {value}
    </span>
  );
}

function ChoiceTag({ choice, lang, small }: { choice: "truth" | "dare"; lang?: string; small?: boolean }) {
  const truth = choice === "truth";
  return (
    <span
      className="ec-chunky"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: small ? 4 : 6,
        padding: small ? "2px 10px 2px 4px" : "4px 16px 4px 6px",
        border: `${small ? 2.5 : 3.5}px solid var(--ink)`,
        borderRadius: 999,
        background: truth ? "var(--blue)" : "var(--pink)",
        boxShadow: small ? "0 3px 0 var(--ink)" : "0 5px 0 var(--ink)",
        color: "#fff",
        fontSize: small ? 13 : 20,
        textShadow: small ? "var(--outline2)" : "var(--outline2), 0 3px 0 var(--ink)",
        textTransform: "uppercase",
        transform: small ? undefined : "rotate(-4deg)",
        animation: small ? undefined : "ec-slam 0.5s cubic-bezier(0.3, 1.8, 0.5, 1) both",
      }}
    >
      <Icon name={truth ? "g-question" : "g-bang"} size={small ? 18 : 30} />
      {truth ? t("Truth", lang) : t("Dare", lang)}
    </span>
  );
}

function TodCard({
  kind,
  label,
  sub,
  onClick,
  disabled,
  idle,
}: {
  kind: "truth" | "dare";
  label: string;
  sub: string;
  onClick?: () => void;
  disabled?: boolean;
  idle: boolean;
}) {
  const truth = kind === "truth";
  const rot = truth ? "-6deg" : "6deg";
  return (
    <button
      className="tod-card"
      onClick={onClick}
      disabled={disabled}
      style={{
        ["--tod-r" as string]: rot,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: 150,
        height: 220,
        padding: "0 6px",
        border: "4px solid var(--ink)",
        borderRadius: 28,
        boxShadow: "0 9px 0 var(--ink)",
        background: truth
          ? "radial-gradient(circle, rgba(255, 255, 255, 0.25) 0 3px, transparent 3.5px) 0 0 / 18px 18px, var(--blue)"
          : "repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.18) 0 12px, transparent 12px 24px), var(--pink)",
        color: "#fff",
        fontFamily: "var(--chunky)",
        fontSize: /[^\x00-\x7F]/.test(label) ? 19 : 30,
        whiteSpace: "nowrap",
        lineHeight: 1.1,
        textShadow: "var(--outline3), 0 5px 0 var(--ink)",
        textTransform: "uppercase",
        transform: `rotate(${rot})`,
        animation: idle ? `${truth ? "tod-l" : "tod-r"} 1.6s ease-in-out infinite` : undefined,
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: onClick ? (disabled ? 0.6 : 1) : 0.55,
      }}
    >
      <Icon name={truth ? "g-question" : "g-bang"} size={90} style={{ filter: "drop-shadow(0 4px 0 rgba(29, 27, 79, 0.6))" }} />
      {label}
      <span style={{ fontFamily: "var(--round)", fontSize: 14, fontWeight: 900, textTransform: "none" }}>{sub}</span>
    </button>
  );
}

function Dots() {
  return (
    <span className="ec-dots" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

const ghostChip: React.CSSProperties = {
  alignSelf: "center",
  padding: "5px 16px",
  border: "2.5px solid var(--ink)",
  borderRadius: 999,
  background: "#fff",
  boxShadow: "0 3px 0 var(--ink)",
  fontSize: 13,
  fontWeight: 900,
  color: "var(--ink)",
  cursor: "pointer",
};

const softText: React.CSSProperties = { fontSize: 13.5, fontWeight: 900, opacity: 0.65, textAlign: "center" };

/** Runs `undo` when the action `sent` comes back as failed, so that the player can try again */
function orUndo(sent: Promise<boolean>, undo: () => void) {
  void sent.then((ok) => {
    if (!ok) undo();
  });
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
  const c = lang === "ja" ? COPY.ja : COPY.en;
  const responseInputRef = useRef<HTMLInputElement>(null);
  const responseSectionRef = useRef<HTMLDivElement>(null);
  const [showDrawing, setShowDrawing] = useState(false);
  // A sheet that is away is off screen and still mounted, with the drawing on its canvas. It is away while its
  // drawing is on its way to the server, and a failure brings it back as it was
  const [sheetAway, setSheetAway] = useState(false);
  // Set once a send of the sheet's drawing has failed. The sheet has a Close from then on, which puts it away: the
  // screen under it, with Skip, is in reach again, and Draw your answer brings the sheet back with its drawing
  const [drawingUnsent, setDrawingUnsent] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null); // tracks which action is in-flight
  // Hides the round break at once on the device that tapped Keep Playing.
  // The server's roundBreakAckedTurns is what releases everyone else.
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
    setShowDrawing(false); // a turn skipped from under an open drawing sheet must not leave it open
    setSheetAway(false);
    setDrawingUnsent(false);
    if (responseInputRef.current) responseInputRef.current.value = "";
  }, [game.currentTurn?._id, turnStatus]);

  // Show round break at every 10-turn milestone, until the host continues past it.
  // The turn changing is not that signal: an absent player can be skipped while the break is up.
  const isRoundBreak = game.completedTurns > 0 &&
    game.completedTurns % 10 === 0 &&
    game.currentTurn?.status === "waiting_for_choice" &&
    game.roundBreakAckedTurns !== game.completedTurns &&
    dismissedRoundBreak !== game.completedTurns;

  // Signal drawing state to other players via typing indicator
  const sheetOnScreen = showDrawing && !sheetAway;
  useEffect(() => {
    onDrawingStateChange?.(sheetOnScreen);
    return () => { onDrawingStateChange?.(false); };
  }, [sheetOnScreen, onDrawingStateChange]);

  const isMyTurn = game.currentTurnParticipantId === myParticipantId;
  const currentPlayer = game.playerInfo.find(
    (p) => p.participantId === game.currentTurnParticipantId
  );

  const turn = game.currentTurn;

  const promptDisplay = parsePrompt(turn?.promptText, lang);

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
      setSheetAway(true);
      orUndo(onSubmitResponse(game._id, undefined, dataUrl), () => {
        setSheetAway(false);
        setDrawingUnsent(true);
      });
    },
    [game._id, onSubmitResponse]
  );

  // Undoes the send of a typed answer: the buttons work again, and the answer is back in the field unless the
  // player has typed another since
  const answerBack = (val: string) => () => {
    setSubmitting(null);
    const field = responseInputRef.current;
    if (field && !field.value) field.value = val;
  };

  // Game completed
  if (game.status === "completed" || game.status === "canceled") {
    const sorted = rankByRating(game.completedTurnsList ?? [], game.playerInfo);
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--paper)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          isolation: "isolate",
          color: "var(--ink)",
        }}
      >
        <Rays rainbow />
        {game.status === "completed" && <Confetti burstKey={game._id} />}
        <div
          className="ec-card"
          style={{
            padding: "22px 18px 18px",
            textAlign: "center",
            maxWidth: 360,
            width: "100%",
            margin: 16,
            maxHeight: "90dvh",
            overflowY: "auto",
            background: "var(--paper)",
            animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)",
          }}
        >
          <Icon name="g-question" size={72} style={{ animation: "ec-pop-in 0.5s 0.1s cubic-bezier(0.3, 1.6, 0.5, 1) both" }} />
          <h2
            className="ec-outline"
            style={{
              margin: "4px 0 2px",
              fontSize: 32,
              lineHeight: 1.1,
              textShadow: "var(--outline3), 0 5px 0 var(--ink)",
              animation: "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both",
            }}
          >
            {t("Game ended", lang)}
          </h2>
          <p style={{ fontSize: 14, fontWeight: 900, marginBottom: 14 }}>
            {t("Truth or Dare", lang)} · {game.completedTurns} {t("played", lang)}
          </p>

          {sorted.length > 0 && (
            <div
              style={{
                border: "3px solid var(--ink)",
                borderRadius: 18,
                background: "#fff",
                boxShadow: "0 4px 0 var(--ink)",
                padding: "10px 12px",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              <p className="ec-chunky" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 6 }}>
                <Icon name="o-star" size={20} /> {t("Ratings", lang)}
              </p>
              {sorted.map(({ pid, avg, player }, i) => (
                <div
                  key={pid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 0",
                    borderTop: i === 0 ? undefined : "2px dashed var(--line-soft)",
                  }}
                >
                  <span style={{ position: "relative", flex: "none" }}>
                    <AvatarDisc id={player?.avatarValue ?? ""} size={36} />
                    {i === 0 && (
                      <Icon name="g-crown" size={22} style={{ position: "absolute", left: 7, top: -13 }} />
                    )}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {player?.nickname ?? "?"}
                  </span>
                  <StarChip value={avg.toFixed(1)} />
                </div>
              ))}
            </div>
          )}

          <button className="ec-btn" onClick={onClose} style={{ width: "100%" }}>
            {t("Close", lang)}
          </button>
        </div>
      </div>
    );
  }

  const choiceIdle = turn?.status === "waiting_for_choice";
  const lastTurn = (game.completedTurnsList ?? [])[(game.completedTurnsList ?? []).length - 1];
  const lastTurnPlayer = lastTurn ? game.playerInfo.find((p) => p.participantId === lastTurn.participantId) : undefined;
  const orderIndex = (pid: string) => {
    const i = game.playerOrder.indexOf(pid);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  // Per-player average ratings from all completed turns
  const playerRatings: Record<string, { total: number; count: number }> = {};
  for (const rt of (game.completedTurnsList ?? [])) {
    if (rt.ratings.length > 0) {
      const pid = rt.participantId;
      if (!playerRatings[pid]) playerRatings[pid] = { total: 0, count: 0 };
      const avg = rt.ratings.reduce((s, r) => s + r.score, 0) / rt.ratings.length;
      playerRatings[pid].total += avg;
      playerRatings[pid].count += 1;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        paddingBottom: keyboardHeight,
        background: "var(--paper)",
        color: "var(--ink)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        isolation: "isolate",
        transition: "padding-bottom 0.15s ease-out",
      }}
    >
      <style>{TOD_CSS}</style>
      <Rays />

      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "max(10px, env(safe-area-inset-top)) 14px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {onMinimize && (
          <button
            className="ec-round-btn"
            onClick={onMinimize}
            aria-label={t("Minimize", lang)}
            title={t("Minimize", lang)}
            style={{ width: 40, height: 40, fontFamily: "var(--chunky)", fontSize: 18, boxShadow: "0 3px 0 var(--ink)" }}
          >
            –
          </button>
        )}
        <TitlePill lang={lang} />
        {isHost && (
          <button
            onClick={() => onEndGame(game._id)}
            style={{
              flex: "none",
              marginLeft: "auto",
              padding: "3px 10px",
              border: "2.5px solid var(--ink)",
              borderRadius: 999,
              background: "var(--red)",
              boxShadow: "0 2px 0 var(--ink)",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {t("End Game", lang)}
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: "none" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "3px 12px",
            border: "2.5px solid var(--ink)",
            borderRadius: 999,
            background: "var(--ink)",
            color: "var(--yellow)",
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {game.promptMode === "deep" ? (
            <>
              {t("Deep", lang)}
              <Icon name="o-whale" size={16} />
            </>
          ) : (
            c.normal
          )}
        </span>
        <span
          style={{
            padding: "3px 12px",
            border: "2.5px solid var(--ink)",
            borderRadius: 999,
            background: "#fff",
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {c.turn} {game.completedTurns + (turn?.status === "waiting_for_choice" || turn?.status === "waiting_for_response" ? 1 : 0)}/{Math.ceil((game.completedTurns + 1) / 10) * 10}
        </span>
      </div>

      {/* Round break interstitial — every 10 turns */}
      {isRoundBreak && (() => {
        const sorted = rankByRating(game.completedTurnsList ?? [], game.playerInfo);
        return (
          <div
            className="ec-sheet-backdrop"
            style={{ position: "absolute", zIndex: 250, alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <Confetti burstKey={`round-${game.completedTurns}`} />
            <div
              className="ec-card"
              style={{
                padding: "22px 18px 18px",
                textAlign: "center",
                maxWidth: 340,
                width: "100%",
                background: "var(--paper)",
                animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)",
              }}
            >
              <Icon name="ui-sparkle" size={60} style={{ animation: "ec-pop-in 0.5s 0.1s cubic-bezier(0.3, 1.6, 0.5, 1) both" }} />
              <h2
                className="ec-outline"
                style={{
                  fontSize: 28,
                  lineHeight: 1.15,
                  margin: "4px 0 2px",
                  textShadow: "var(--outline3), 0 4px 0 var(--ink)",
                  animation: "ec-slam 0.6s cubic-bezier(0.3, 1.8, 0.5, 1) both",
                }}
              >
                {t("Round Complete!", lang)}
              </h2>
              <p style={{ fontSize: 13.5, fontWeight: 900, opacity: 0.65 }}>
                {game.completedTurns} {t("turns played", lang)}
              </p>

              {sorted.length > 0 && (
                <div
                  style={{
                    border: "3px solid var(--ink)",
                    borderRadius: 16,
                    background: "#fff",
                    boxShadow: "0 4px 0 var(--ink)",
                    padding: "6px 12px",
                    margin: "14px 0 4px",
                    textAlign: "left",
                  }}
                >
                  {sorted.slice(0, 3).map(({ pid, avg, player }, i) => (
                    <div
                      key={pid}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 0",
                        borderTop: i === 0 ? undefined : "2px dashed var(--line-soft)",
                      }}
                    >
                      <span className="ec-chunky" style={{ width: 18, fontSize: 16, textAlign: "center" }}>{i + 1}</span>
                      <span style={{ position: "relative", flex: "none" }}>
                        <AvatarDisc id={player?.avatarValue ?? ""} size={34} />
                        {i === 0 && <Icon name="g-crown" size={20} style={{ position: "absolute", left: 7, top: -12 }} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {player?.nickname ?? "?"}
                      </span>
                      <StarChip value={avg.toFixed(1)} />
                    </div>
                  ))}
                </div>
              )}

              {isHost ? (
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="ec-btn red sm" onClick={() => onEndGame(game._id)} style={{ flex: 1 }}>
                    {t("End Game", lang)}
                  </button>
                  <button
                    className="ec-btn mint sm"
                    onClick={() => {
                      setDismissedRoundBreak(game.completedTurns);
                      orUndo(onAdvanceTurn(game._id), () => setDismissedRoundBreak(0));
                    }}
                    style={{ flex: 1.3 }}
                  >
                    {t("Keep Playing", lang)} ➜
                  </button>
                </div>
              ) : (
                <p style={{ ...softText, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {t("Waiting for host...", lang)} <Dots />
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "6px 16px 12px",
          width: "100%",
          maxWidth: 420,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Step 1: Waiting for choice */}
        {turn?.status === "waiting_for_choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, margin: "auto 0" }}>
              <div
                key={turn._id}
                className="ec-chunky"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  maxWidth: "100%",
                  padding: "6px 18px 6px 6px",
                  border: "3.5px solid var(--ink)",
                  borderRadius: 999,
                  background: isMyTurn ? "var(--yellow)" : "#fff",
                  boxShadow: "0 5px 0 var(--ink)",
                  fontSize: 19,
                  textTransform: lang === "ja" ? undefined : "uppercase",
                  animation: "ec-pop-in 0.45s cubic-bezier(0.3, 1.6, 0.5, 1) both",
                }}
              >
                <AvatarDisc id={currentPlayer?.avatarValue ?? ""} size={46} shadow={false} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isMyTurn
                    ? t("It's your turn!", lang)
                    : `${currentPlayer?.nickname}${t("'s turn!", lang)}`}
                </span>
              </div>

              <div style={{ position: "relative", display: "flex", justifyContent: "center", gap: 14, marginTop: 6 }}>
                <TodCard
                  kind="truth"
                  label={t("Truth", lang)}
                  sub={c.truthSub}
                  idle={isMyTurn && !submitting}
                  disabled={!!submitting}
                  onClick={isMyTurn ? () => {
                    if (submitting) return;
                    setSubmitting("choice");
                    todTrace({ source: "client", action: "btn:truth", detail: `turnStatus=${turn?.status} isMyTurn=${isMyTurn}` });
                    orUndo(onSubmitChoice(game._id, "truth"), () => setSubmitting(null));
                  } : undefined}
                />
                <span
                  className="ec-chunky"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    zIndex: 2,
                    transform: "translate(-50%, -50%) rotate(-8deg)",
                    display: "grid",
                    placeItems: "center",
                    width: 58,
                    height: 58,
                    border: "3.5px solid var(--ink)",
                    borderRadius: "50%",
                    background: "var(--yellow)",
                    boxShadow: "0 4px 0 var(--ink)",
                    fontSize: 19,
                    pointerEvents: "none",
                  }}
                >
                  {c.or}
                </span>
                <TodCard
                  kind="dare"
                  label={t("Dare", lang)}
                  sub={c.dareSub}
                  idle={isMyTurn && !submitting}
                  disabled={!!submitting}
                  onClick={isMyTurn ? () => {
                    if (submitting) return;
                    setSubmitting("choice");
                    todTrace({ source: "client", action: "btn:dare", detail: `turnStatus=${turn?.status} isMyTurn=${isMyTurn}` });
                    orUndo(onSubmitChoice(game._id, "dare"), () => setSubmitting(null));
                  } : undefined}
                />
              </div>

              {isMyTurn ? (
                submitting === "choice" ? (
                  <div style={{ padding: "8px 0" }}><Dots /></div>
                ) : (
                  <>
                    <div style={{ ...softText, display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                      {c.rateHint} <Icon name="o-star" size={18} />
                    </div>
                    <button onClick={() => onSkipTurn(game._id)} style={ghostChip}>
                      {t("Skip", lang)}
                    </button>
                  </>
                )
              ) : (
                <p style={{ ...softText, display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  {t("Waiting for", lang)} {currentPlayer?.nickname} {t("to choose...", lang)} <Dots />
                </p>
              )}
            </div>

            {lastTurn && lastTurn.choice && (
              <div
                className="ec-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 18,
                  boxShadow: "0 5px 0 var(--ink)",
                }}
              >
                <AvatarDisc id={lastTurnPlayer?.avatarValue ?? ""} size={40} shadow={false} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 900, lineHeight: 1.35 }}>
                  {c.lastTurn} {lastTurnPlayer?.nickname ?? "?"} {c.did}{" "}
                  <span style={{ color: lastTurn.choice === "truth" ? "var(--blue)" : "var(--pink)", textTransform: "uppercase" }}>
                    {lastTurn.choice === "truth" ? t("Truth", lang) : t("Dare", lang)}
                  </span>
                  {lastTurn.promptText && (
                    <span style={{ display: "block", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      “{parsePrompt(lastTurn.promptText, lang)}”
                    </span>
                  )}
                </div>
                {lastTurn.ratings.length > 0 && (
                  <StarChip
                    value={(lastTurn.ratings.reduce((s, r) => s + r.score, 0) / lastTurn.ratings.length).toFixed(1)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Waiting for response */}
        {turn?.status === "waiting_for_response" && (
          <div
            ref={responseSectionRef}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              width: "100%",
              margin: keyboardHeight > 0 ? "0 0 auto" : "auto 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AvatarDisc id={currentPlayer?.avatarValue ?? ""} size={40} />
              {turn.choice && <ChoiceTag key={turn._id} choice={turn.choice} lang={lang} />}
            </div>

            {/* Prompt */}
            <div style={{ width: "100%", padding: 9 }}>
              <div
                className="ec-card"
                style={{
                  position: "relative",
                  padding: "26px 18px",
                  borderRadius: 22,
                  textAlign: "center",
                  animation: "ec-pop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1)",
                }}
              >
                <div className="ec-marquee" />
                <p className="ec-chunky" style={{ fontSize: promptDisplay.length > 70 ? 18 : 21, lineHeight: 1.35 }}>
                  {promptDisplay}
                </p>
              </div>
            </div>

            {isMyTurn ? (
              <>
                {/* Text response */}
                {(turn.promptResponseType === "text" || !turn.promptResponseType) && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      ref={responseInputRef}
                      className="ec-field"
                      type="text"
                      defaultValue=""
                      maxLength={2000}
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
                        if (isImeComposing(e)) return;
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (e.key === "Enter" && val && !submitting) {
                          setSubmitting("response");
                          orUndo(onSubmitResponse(game._id, val), answerBack(val));
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      placeholder={t("Type your answer...", lang)}
                      style={{ fontSize: 16 }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="ec-btn sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const val = responseInputRef.current?.value.trim() || "";
                          if (val && !submitting) {
                            setSubmitting("response");
                            orUndo(onSubmitResponse(game._id, val), answerBack(val));
                            if (responseInputRef.current) responseInputRef.current.value = "";
                          }
                        }}
                        disabled={!!submitting}
                        style={{ flex: 1 }}
                      >
                        {submitting === "response" ? <Dots /> : t("Send Answer", lang)}
                      </button>
                      {turn.choice === "dare" && (
                        <button
                          className="ec-btn mint sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { if (!submitting) { setSubmitting("response"); orUndo(onSubmitResponse(game._id, "✅ Done!"), () => setSubmitting(null)); } }}
                          style={{ flex: 1, gap: 6 }}
                        >
                          <Icon name="g-ok" size={22} />
                          {t("Done Dare", lang)}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Drawing response */}
                {turn.promptResponseType === "drawing" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Also brings back a sheet that is away, with its drawing */}
                    <button className="ec-btn yellow" onClick={() => { setShowDrawing(true); setSheetAway(false); }} style={{ width: "100%", gap: 8 }}>
                      <Icon name="g-pencil" size={28} />
                      {t("Draw your answer", lang)}
                    </button>
                    {turn.choice === "dare" && (
                      <button
                        className="ec-btn mint sm"
                        onClick={() => onSubmitResponse(game._id, "✅ Done!")}
                        style={{ width: "100%", gap: 6 }}
                      >
                        <Icon name="g-ok" size={22} />
                        {t("Done Dare", lang)}
                      </button>
                    )}
                  </div>
                )}

                {/* Drawing overlay with prompt visible */}
                {showDrawing && (
                  <div className="ec-sheet-backdrop" style={{ zIndex: 300, display: sheetAway ? "none" : undefined }}>
                    <div className="ec-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: "18px 16px max(16px, env(safe-area-inset-bottom))" }}>
                      <div
                        className="ec-chunky"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 12,
                          padding: "10px 12px",
                          border: "3px solid var(--ink)",
                          borderRadius: 16,
                          background: turn.choice === "truth" ? "var(--blue-soft)" : "var(--pink-soft)",
                          boxShadow: "0 3px 0 var(--ink)",
                          fontSize: 15,
                          lineHeight: 1.3,
                        }}
                      >
                        <Icon name="g-pencil" size={26} />
                        <span style={{ flex: 1 }}>{promptDisplay}</span>
                        {/* The canvas has no Close in a game. This one puts the sheet away with its drawing kept */}
                        {drawingUnsent && (
                          <button
                            className="ec-round-btn"
                            onClick={() => setSheetAway(true)}
                            aria-label={t("Close", lang)}
                            title={t("Close", lang)}
                            style={{ width: 40, height: 40, boxShadow: "0 3px 0 var(--ink)" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
                              <line x1="6" y1="6" x2="18" y2="18" />
                              <line x1="18" y1="6" x2="6" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <DrawingCanvas
                        ref={drawingCanvasRef}
                        onSave={handleDrawingSave}
                        onCancel={() => setShowDrawing(false)}
                        gameMode
                        lang={lang}
                      />
                    </div>
                  </div>
                )}

                {/* Skip option */}
                <button onClick={() => onSkipTurn(game._id)} style={ghostChip}>
                  {t("Skip", lang)}
                </button>
              </>
            ) : turn.promptResponseType === "drawing" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px 8px 10px",
                  border: "3px solid var(--ink)",
                  borderRadius: 999,
                  background: "#fff",
                  boxShadow: "0 4px 0 var(--ink)",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                <Icon name="g-pencil" size={26} style={{ animation: "ec-wiggle 0.8s ease-in-out infinite" }} />
                {currentPlayer?.nickname} {t("is drawing", lang)} <Dots />
              </div>
            ) : (
              <p style={{ ...softText, display: "flex", alignItems: "center", gap: 8 }}>
                {t("Waiting for", lang)} {currentPlayer?.nickname} {t("to respond...", lang)} <Dots />
              </p>
            )}
          </div>
        )}

        {/* Step 3: Turn completed — show response */}
        {(turn?.status === "completed" || turn?.status === "skipped") && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", margin: "auto 0" }}>
            <div style={{ position: "relative" }}>
              <AvatarDisc
                key={turn._id}
                id={currentPlayer?.avatarValue ?? ""}
                size={68}
                style={{ animation: "ec-pop-in 0.45s cubic-bezier(0.3, 1.6, 0.5, 1) both" }}
              />
              {turn.status === "skipped" && (
                <span
                  className="ec-stamp"
                  style={{ position: "absolute", right: -46, top: -8, width: 58, height: 58, fontSize: 13, transform: "rotate(-14deg)" }}
                >
                  {t("Skip", lang)}
                </span>
              )}
            </div>
            <h3 className="ec-chunky" style={{ fontSize: 19, textAlign: "center" }}>
              {currentPlayer?.nickname} {turn.status === "skipped" ? t("Skipped!", lang) : t("answered:", lang)}
            </h3>

            {/* Show original prompt as reminder */}
            {turn.choice && promptDisplay && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  border: "2.5px dashed var(--line-soft)",
                  borderRadius: 14,
                }}
              >
                <ChoiceTag choice={turn.choice} lang={lang} small />
                <p style={{ flex: 1, fontSize: 13, fontWeight: 800, fontStyle: "italic", lineHeight: 1.4, opacity: 0.7 }}>
                  {promptDisplay}
                </p>
              </div>
            )}

            {turn.status === "completed" && (
              <div
                className="ec-card"
                style={{
                  width: "100%",
                  padding: "16px 16px",
                  borderRadius: 22,
                  textAlign: "center",
                  animation: "ec-pop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1)",
                }}
              >
                {turn.responseText && (
                  <p className="ec-chunky" style={{ fontSize: 20, lineHeight: 1.35, wordBreak: "break-word" }}>{turn.responseText}</p>
                )}
                {turn.translatedResponseText && (
                  <p
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "2px dashed var(--line-soft)",
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--pink)",
                      wordBreak: "break-word",
                    }}
                  >
                    {turn.translatedResponseText}
                  </p>
                )}
                {turn.responseMediaUrl && (
                  <img
                    src={turn.responseMediaUrl}
                    alt="Response"
                    onClick={() => setFullScreenImage(turn.responseMediaUrl!)}
                    style={{
                      display: "block",
                      margin: turn.responseText ? "10px auto 0" : "0 auto",
                      maxWidth: "100%",
                      maxHeight: 250,
                      border: "3px solid var(--ink)",
                      borderRadius: 14,
                      background: "#fff",
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

              // Count eligible raters (online, non-active players)
              const eligibleRaters = game.playerInfo.filter(
                (p) => p.online && p.participantId !== turn.participantId
              );
              const allRated = eligibleRaters.length > 0 &&
                eligibleRaters.every((p) => ratings.some((r) => r.participantId === p.participantId));

              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  {/* Average rating display */}
                  {avg && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StarChip value={`${avg}/5`} />
                      <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.6 }}>
                        {ratings.length}/{eligibleRaters.length} {c.rated}
                      </span>
                    </div>
                  )}

                  {/* Star rating (don't show to the player who answered) */}
                  {!isActivePlayer && !myRating && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <p className="ec-chunky" style={{ fontSize: 14 }}>
                        {t("Rate this answer", lang)}
                      </p>

                      {/* 5 clickable stars */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const on = star <= starRating;
                          return (
                            <button
                              key={star}
                              onClick={() => setStarRating(star)}
                              aria-label={`${star}`}
                              style={{ display: "grid", placeItems: "center", width: 50, height: 50, padding: 0, background: "none", border: "none", cursor: "pointer" }}
                            >
                              <Icon
                                key={`${star}-${on}`}
                                name="o-star"
                                size={44}
                                style={{
                                  filter: on ? "drop-shadow(0 3px 0 rgba(29, 27, 79, 0.5))" : "grayscale(1) opacity(0.3)",
                                  transform: on ? "scale(1.08)" : "scale(0.9)",
                                  transition: "transform 0.15s",
                                  animation: on ? `ec-pop 0.35s ${(star - 1) * 0.04}s cubic-bezier(0.3, 1.8, 0.5, 1)` : undefined,
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit button */}
                      <button
                        className="ec-btn pink sm"
                        onClick={() => {
                          if (starRating > 0 && !submitting) {
                            setSubmitting("rating");
                            todTrace({ source: "client", action: "btn:submitRating", detail: `score=${starRating} turnId=${turn._id.slice(-6)}` });
                            orUndo(onSubmitRating(turn._id, starRating), () => {
                              setSubmitting(null);
                              setHasRated(false);
                            });
                            setHasRated(true);
                          }
                        }}
                        disabled={starRating === 0 || !!submitting}
                        style={{ minWidth: 200, marginTop: 2 }}
                      >
                        {submitting === "rating" ? <Dots /> : t("Submit Rating", lang)}
                      </button>
                    </div>
                  )}

                  {/* After submitting, show confirmed rating */}
                  {!isActivePlayer && myRating && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="o-star"
                          size={30}
                          style={{
                            filter: star <= myRating.score ? "none" : "grayscale(1) opacity(0.3)",
                            animation: star <= myRating.score ? `ec-pop-in 0.35s ${(star - 1) * 0.05}s cubic-bezier(0.3, 1.8, 0.5, 1) both` : undefined,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Waiting indicator when not everyone has rated */}
                  {!allRated && !isActivePlayer && myRating && (
                    <p style={{ ...softText, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      {t("Waiting for others to rate...", lang)} <Dots />
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
                      className={`ec-btn${submitting ? "" : " wiggle"}`}
                      onClick={() => { if (!submitting) { setSubmitting("advance"); orUndo(onAdvanceTurn(game._id), () => setSubmitting(null)); } }}
                      disabled={!!submitting}
                      style={{ minWidth: 220, marginTop: 4 }}
                    >
                      {submitting === "advance" ? <Dots /> : `${t("Next Turn", lang)} ➜`}
                    </button>
                  )}

                  {/* Host can force advance if someone is AFK */}
                  {isHost && !allRated && (
                    <button
                      onClick={() => { if (!submitting) { setSubmitting("advance"); orUndo(onAdvanceTurn(game._id), () => setSubmitting(null)); } }}
                      disabled={!!submitting}
                      style={{ ...ghostChip, fontSize: 12, cursor: submitting ? "default" : "pointer" }}
                    >
                      {submitting === "advance" ? "..." : t("Skip ratings", lang)}
                    </button>
                  )}

                  {!isHost && !allRated && (
                    <p style={{ ...softText, fontSize: 12 }}>
                      {t("Waiting for all ratings...", lang)}
                    </p>
                  )}

                  {!isHost && allRated && (
                    <p style={{ ...softText, display: "flex", alignItems: "center", gap: 8 }}>
                      {t("Waiting for host...", lang)} <Dots />
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Turn order. A strip that scrolls sideways also cuts what is drawn above it: 8px of its top padding lies
          over the empty padding at the foot of the main area, as room for the active avatar's bounce */}
      {keyboardHeight === 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 16px max(12px, env(safe-area-inset-bottom))",
            marginTop: -8,
            overflowX: "auto",
            width: "100%",
            maxWidth: 520,
            justifyContent: "safe center",
            flex: "none",
          }}
        >
          {game.playerInfo
            .filter((p) => p.online)
            .sort((a, b) => orderIndex(a.participantId) - orderIndex(b.participantId))
            .map((p) => {
              const isActive = p.participantId === game.currentTurnParticipantId;
              const pr = playerRatings[p.participantId];
              const avgRating = pr ? (pr.total / pr.count) : null;
              return (
                <div
                  key={p.participantId}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    flex: "none",
                    width: 56,
                    paddingTop: 2,
                  }}
                >
                  <AvatarDisc
                    id={p.avatarValue}
                    size={isActive ? 48 : 40}
                    style={{
                      boxShadow: isActive ? "0 3px 0 var(--ink), 0 0 0 3px var(--yellow)" : undefined,
                      opacity: isActive ? 1 : 0.75,
                      animation: isActive && choiceIdle ? "ec-bob 1.6s ease-in-out 2" : undefined,
                    }}
                  />
                  <span
                    style={{
                      maxWidth: "100%",
                      padding: isActive ? "0 6px" : 0,
                      borderRadius: 999,
                      background: isActive ? "var(--ink)" : "transparent",
                      color: isActive ? "var(--yellow)" : "var(--ink)",
                      fontSize: 10.5,
                      fontWeight: 900,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nickname}
                  </span>
                  {avgRating !== null && <StarChip value={avgRating.toFixed(1)} size="sm" />}
                </div>
              );
            })}
        </div>
      )}

      {/* Full-screen image viewer */}
      {fullScreenImage && (
        <div
          onClick={() => setFullScreenImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(29, 27, 79, 0.92)",
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
              border: "4px solid #fff",
              borderRadius: 16,
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
}
