"use client";

import "./word-rush/word-rush.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Rays } from "@/components/ui/effects";
import { CluesView } from "./word-rush/clues";
import { LobbySheet } from "./word-rush/lobby";
import { ResultsView, type SeenWord } from "./word-rush/results";
import { RevealView } from "./word-rush/reveal";
import { JudgingView, MicView, VerdictView } from "./word-rush/say-it";
import {
  SceneParticles,
  errorText,
  useServerSkew,
  useTicker,
  type MyAnswer,
  type ViewProps,
  type WRLang,
  type WRState,
} from "./word-rush/shared";
import { stringsFor, type WordRushStrings } from "./word-rush/strings";

export interface WordRushGameProps {
  roomId: Id<"rooms">;
  participantId: Id<"participants">;
  /** UI language of the viewer ("ja" | "en") */
  lang: string;
  /** The room host may start, skip and end any Word Rush game in the room */
  isRoomHost?: boolean;
}

const DISMISSED_KEY = "enchatto:word-rush:dismissed";
const RESULTS_WINDOW_MS = 3 * 60 * 1000;

function loadDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveDismissed(list: string[]) {
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(list.slice(-30)));
  } catch {
    // private mode etc.
  }
}

function Header({
  state,
  s,
  isHost,
  myId,
  history,
  onMinimize,
  toast,
}: {
  state: WRState;
  s: WordRushStrings;
  isHost: boolean;
  myId: Id<"participants">;
  history: Record<number, boolean | null> | undefined;
  onMinimize: () => void;
  toast: ViewProps["toast"];
}) {
  const skip = useMutation(api.wordRush.skip);
  const cancel = useMutation(api.wordRush.cancel);
  const [menu, setMenu] = useState(false);

  const segClass = (i: number) => {
    const res = history?.[i];
    if (i === state.cardIndex && (state.phase === "clues" || res == null)) return "now";
    if (i > state.cardIndex) return "";
    return res === true ? "ok" : res === false ? "miss" : "done";
  };

  return (
    <div className="wr-head">
      <button type="button" className="ec-round-btn" onClick={onMinimize} aria-label={s.minimize} title={s.minimize}>
        ✕
      </button>
      <div className="wr-segs">
        {Array.from({ length: state.totalCards }, (_, i) => (
          <i key={i} className={segClass(i)} />
        ))}
      </div>
      <div className="wr-count">
        {state.cardIndex + 1}
        <small>/{state.totalCards}</small>
      </div>
      {isHost && (
        <button type="button" className="ec-round-btn" onClick={() => setMenu((m) => !m)} aria-label="Host menu" style={{ fontFamily: "var(--chunky)" }}>
          ⋯
        </button>
      )}
      {menu && (
        <div className="wr-menu">
          <button
            type="button"
            className="ec-btn white sm"
            onClick={() => {
              setMenu(false);
              skip({ gameId: state._id, participantId: myId, phaseSeq: state.phaseSeq }).catch((e) => toast(errorText(e, s.error)));
            }}
          >
            ⏭ {s.menuSkip}
          </button>
          <button
            type="button"
            className="ec-btn red sm"
            onClick={() => {
              setMenu(false);
              if (!window.confirm(s.confirmEnd)) return;
              cancel({ gameId: state._id, participantId: myId }).catch((e) => toast(errorText(e, s.error)));
            }}
          >
            {s.menuEnd}
          </button>
        </div>
      )}
    </div>
  );
}

/** Self-contained Word Rush overlay: subscribes to api.wordRush.getState and renders lobby / play / results. */
export function WordRushGame({ roomId, participantId, lang, isRoomHost = false }: WordRushGameProps) {
  const state = useQuery(api.wordRush.getState, { roomId });
  const s = stringsFor(lang);

  const [minimizedId, setMinimizedId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, MyAnswer>>({});
  const [hints, setHints] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, Record<number, boolean | null>>>({});
  const [words, setWords] = useState<Record<string, SeenWord[]>>({});
  const [toastMsg, setToastMsg] = useState<{ text: string; kind: "error" | "info"; key: number } | null>(null);
  const seenActive = useRef(new Set<string>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setDismissed(loadDismissed()), []);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const toast = useCallback((text: string, kind: "error" | "info" = "error") => {
    setToastMsg({ text, kind, key: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const gameId = state?._id;
  const minimized = !!gameId && minimizedId === gameId;
  const active = state?.status === "active";
  const skew = useServerSkew(gameId, state?.phaseSeq, state?.phaseStartedAt);
  const now = useTicker(100, active && !minimized) - skew;
  const me = state?.players.find((p) => p.participantId === participantId) ?? null;

  if (state && active) seenActive.current.add(state._id);

  useEffect(() => {
    if (!state || state.status !== "active" || state.phase === "clues" || !state.card?.reveal) return;
    const id = state._id;
    const ci = state.cardIndex;
    const reveal = state.card.reveal;
    const inGame = state.players.some((p) => p.participantId === participantId);
    const mine = state.answers.find((a) => a.participantId === participantId);
    const correct = inGame ? !!mine?.correct : null;
    setHistory((h) => (h[id]?.[ci] !== undefined ? h : { ...h, [id]: { ...h[id], [ci]: correct } }));
    setWords((w) => {
      const list = w[id] ?? [];
      if (list.some((x) => x.cardIndex === ci)) return w;
      return { ...w, [id]: [...list, { cardIndex: ci, en: reveal.en, ja: reveal.ja.ja, correct }] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?._id, state?.cardIndex, state?.phase, participantId]);

  const toastEl = toastMsg && (
    <div key={toastMsg.key} className={`wr-toast${toastMsg.kind === "info" ? " info" : ""}`} role="status">
      {toastMsg.text}
    </div>
  );

  if (!state) return toastEl || null;

  const id = state._id;
  const isHost = isRoomHost || state.hostParticipantId === participantId;
  const learning: WRLang = me?.learning ?? (lang === "ja" ? "en" : "ja");
  const cardKey = `${id}:${state.cardIndex}`;

  const pill = (
    <>
      <button type="button" className="wr-pill" onClick={() => setMinimizedId(null)}>
        <span className="badge">🌸</span>
        {state.status === "lobby" ? s.pillLobby : s.pillCard(state.cardIndex + 1, state.totalCards)}
        {state.status === "active" && <span className="live" />}
        {state.status === "lobby" && !me && <span className="join">{s.joinShort}</span>}
      </button>
      {toastEl}
    </>
  );

  if (state.status === "lobby") {
    if (minimized) return pill;
    return (
      <>
        <LobbySheet state={state} myId={participantId} isHost={isHost} s={s} toast={toast} onMinimize={() => setMinimizedId(id)} />
        {toastEl}
      </>
    );
  }

  if (state.status === "completed") {
    const recent = state.endedAt != null && Date.now() - state.endedAt < RESULTS_WINDOW_MS;
    const show = !dismissed.includes(id) && (seenActive.current.has(id) || recent) && !(minimized && !me);
    if (!show) return toastEl || null;
    const close = () => {
      const next = [...dismissed.filter((x) => x !== id), id];
      setDismissed(next);
      saveDismissed(next);
    };
    return (
      <>
        <div className="wr-overlay">
          <Rays rainbow />
          <div className="wr-col">
            <div className="wr-body" style={{ paddingTop: 10 }}>
              <ResultsView
                state={state}
                myId={participantId}
                learning={learning}
                s={s}
                toast={toast}
                words={(words[id] ?? []).slice().sort((a, b) => a.cardIndex - b.cardIndex)}
                onClose={close}
              />
            </div>
          </div>
        </div>
        {toastEl}
      </>
    );
  }

  if (minimized) return pill;

  const viewProps: ViewProps = { state, me, myId: participantId, learning, s, lang, now, isHost, toast };
  const scene = state.phase === "reveal" ? state.card?.reveal?.scene : undefined;

  let body: React.ReactNode = null;
  switch (state.phase) {
    case "clues":
      body = (
        <CluesView
          key={state.phaseSeq}
          {...viewProps}
          myAnswer={answers[cardKey] ?? null}
          hint={hints[cardKey] ?? null}
          onAnswered={(a) => setAnswers((m) => ({ ...m, [cardKey]: a }))}
          onHint={(h) => setHints((m) => ({ ...m, [cardKey]: h }))}
        />
      );
      break;
    case "reveal":
      body = <RevealView key={state.phaseSeq} {...viewProps} />;
      break;
    case "mic":
      body = <MicView key={state.phaseSeq} {...viewProps} />;
      break;
    case "judging":
      body = <JudgingView key={state.phaseSeq} {...viewProps} />;
      break;
    case "verdict":
      body = <VerdictView key={state.phaseSeq} {...viewProps} />;
      break;
  }

  return (
    <>
      <div className={`wr-overlay${scene ? ` scene-${scene}` : ""}`} role="dialog" aria-label={s.gameName}>
        {scene && <SceneParticles scene={scene} />}
        {state.phase === "verdict" && <Rays />}
        <div className="wr-col">
          <Header
            state={state}
            s={s}
            isHost={isHost}
            myId={participantId}
            history={history[id]}
            onMinimize={() => setMinimizedId(id)}
            toast={toast}
          />
          <div className="wr-body">{body}</div>
        </div>
      </div>
      {toastEl}
    </>
  );
}
