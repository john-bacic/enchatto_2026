"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarDisc } from "@/components/ui/avatar";
import { DashGame, type Hud, type NetState, type RacerInfo } from "@/lib/dash/game";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { getLevel } from "@/lib/dash/levels";
import { unlockSound } from "@/lib/dash/sfx";
import { dashCopy, ordinal, raceClock } from "./strings";

export interface RaceProps {
  levelIndex: number;
  round: number;
  rounds: number;
  racers: RacerInfo[];
  /** The local racer's id, or null to watch */
  meId: string | null;
  /** Seconds since the round's start signal, by the server's clock */
  raceTime: () => number;
  /** Server time the round ends at, and whether anyone has finished (the others are then on a short clock) */
  endsAt?: number;
  serverNow: () => number;
  /** Seconds each finisher took, by id */
  finishes: Record<string, number>;
  coarse: boolean;
  lang?: string;
  canEnd: boolean;
  onSend?: (state: NetState) => void;
  onFinish?: (seconds: number) => void;
  /** Hands the running game to the caller, who feeds it the other racers; null when it stops */
  onGame?: (game: DashGame | null) => void;
  onMinimize?: () => void;
  onEnd?: () => void;
  sendEvery?: number;
  startCheckpoint?: number;
  /**
   * Names this racer's run of this round. With it, the checkpoint reached is kept for the tab, so that a race
   * put away and come back to (or a page loaded again) goes on from there and not from the start line
   */
  resumeKey?: string;
}

const RESUME = "enchatto_dash_cp_";
function reachedBefore(key: string | undefined): number {
  if (!key) return 0;
  try {
    return Number(sessionStorage.getItem(RESUME + key) ?? 0) || 0;
  } catch {
    return 0;
  }
}

const EMPTY_HUD: Hud = { t: -99, place: 1, racing: 1, progress: {}, finished: false, checkpoint: 0, falls: 0, watching: null };

export default function DashRace(props: RaceProps) {
  const { levelIndex, racers, meId, coarse, lang } = props;
  const c = dashCopy(lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<DashGame | null>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLElement>(null);
  const live = useRef(props);
  live.current = props;
  // The clock is known before the game has drawn anything: a race come back to does not flash its opening card
  const [hud, setHud] = useState<Hud>(() => ({ ...EMPTY_HUD, t: props.raceTime() }));
  const [failed, setFailed] = useState(false);
  const [pressed, setPressed] = useState<{ jump?: boolean; dive?: boolean }>({});
  const racerKey = racers.map((r) => r.id).join(",");
  const level = useMemo(() => getLevel(levelIndex), [levelIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let game: DashGame;
    let reached = reachedBefore(live.current.resumeKey);
    try {
      game = new DashGame({
        canvas,
        levelIndex,
        racers: live.current.racers,
        meId,
        raceTime: () => live.current.raceTime(),
        onSend: (s) => live.current.onSend?.(s),
        onFinish: (s) => live.current.onFinish?.(s),
        onHud: (next) => {
          setHud(next);
          const key = live.current.resumeKey;
          if (key && next.checkpoint > reached) {
            reached = next.checkpoint;
            try {
              sessionStorage.setItem(RESUME + key, String(reached));
            } catch {
              // Kept for this visit only, then
            }
          }
        },
        sendEvery: live.current.sendEvery,
        startCheckpoint: Math.max(live.current.startCheckpoint ?? 0, reached),
      });
    } catch (err) {
      console.error("Chatto Dash could not start:", err);
      setFailed(true);
      return;
    }
    gameRef.current = game;
    live.current.onGame?.(game);
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : null;
    observer?.observe(canvas);
    return () => {
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      live.current.onGame?.(null);
      gameRef.current = null;
      game.dispose();
    };
    // The racers are fixed for a round: a new list is a new round
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, meId, racerKey]);

  // The thumb stick: wherever the left thumb lands is its centre
  const stickId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const onStickDown = (e: React.PointerEvent) => {
    unlockSound();
    if (stickId.current !== null || !meId) return;
    stickId.current = e.pointerId;
    origin.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    if (stickRef.current) {
      stickRef.current.style.display = "block";
      stickRef.current.style.left = `${e.clientX}px`;
      stickRef.current.style.top = `${e.clientY}px`;
    }
    if (knobRef.current) knobRef.current.style.transform = "";
  };
  const onStickMove = (e: React.PointerEvent) => {
    if (e.pointerId !== stickId.current) return;
    const R = 46;
    let dx = (e.clientX - origin.current.x) / R;
    let dy = (e.clientY - origin.current.y) / R;
    const l = Math.hypot(dx, dy);
    if (l > 1) {
      dx /= l;
      dy /= l;
    }
    // A thumb resting near the middle is not a walk
    const dead = l < 0.14;
    gameRef.current?.setStick(dead ? 0 : dx, dead ? 0 : dy);
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx * R}px, ${dy * R}px)`;
  };
  const onStickUp = (e: React.PointerEvent) => {
    if (e.pointerId !== stickId.current) return;
    stickId.current = null;
    gameRef.current?.setStick(0, 0);
    if (stickRef.current) stickRef.current.style.display = "none";
  };
  const button = (name: "jump" | "dive") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      unlockSound();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      gameRef.current?.press(name, true);
      setPressed((p) => ({ ...p, [name]: true }));
    },
    onPointerUp: () => {
      gameRef.current?.press(name, false);
      setPressed((p) => ({ ...p, [name]: false }));
    },
    onPointerCancel: () => {
      gameRef.current?.press(name, false);
      setPressed((p) => ({ ...p, [name]: false }));
    },
    onLostPointerCapture: () => {
      gameRef.current?.press(name, false);
      setPressed((p) => ({ ...p, [name]: false }));
    },
  });

  const t = hud.t;
  const name = LEVEL_NAMES[levelIndex % LEVEL_NAMES.length];
  const count = t < 0 ? Math.ceil(-t) : 0;
  const myFinish = meId ? props.finishes[meId] : undefined;
  const someoneFinished = Object.keys(props.finishes).length > 0;
  const secondsLeft = props.endsAt ? Math.max(0, Math.ceil((props.endsAt - props.serverNow()) / 1000)) : null;
  const finishPlace = meId && myFinish !== undefined ? 1 + Object.values(props.finishes).filter((s) => s < myFinish).length : null;

  return (
    <div className="dash-stage" onPointerDown={unlockSound} onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} />
      {/* The left of the screen is the thumb stick's, whatever is drawn there */}
      {coarse && meId && (
        <div
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "58%", touchAction: "none" }}
          onPointerDown={onStickDown}
          onPointerMove={onStickMove}
          onPointerUp={onStickUp}
          onPointerCancel={onStickUp}
          // A touch the system took over (a swipe from the screen's edge) ends without an up: the stick lets go
          onLostPointerCapture={onStickUp}
        />
      )}
      <div ref={stickRef} className="dash-stick" style={{ display: "none" }}>
        <i ref={knobRef} />
      </div>

      <div className="dash-hud">
        <div className="dash-top">
          {props.onMinimize && (
            <button className="ec-round-btn" onClick={props.onMinimize} aria-label={c.minimize} title={c.minimize} style={{ width: 38, height: 38, fontSize: 20, boxShadow: "0 3px 0 var(--ink)" }}>
              –
            </button>
          )}
          <span className="dash-pill" style={{ flexShrink: 1, minWidth: 0 }}>
            {props.round + 1}/{props.rounds} · {lang === "ja" ? name.ja : name.en}
          </span>
          <span style={{ flex: 1 }} />
          {t > 0 && <span className="dash-pill clock">{raceClock(myFinish ?? t)}</span>}
          {props.canEnd && props.onEnd && (
            <button className="dash-pill pink" onClick={props.onEnd}>
              {c.end}
            </button>
          )}
        </div>
        {meId && t > 0 && !hud.finished && hud.racing > 1 && (
          <div className="dash-place ec-outline">
            {ordinal(hud.place, lang)}
            <small> / {hud.racing}</small>
          </div>
        )}
        {(hud.watching || !meId) && t > 0 && (
          <div style={{ marginTop: 8 }}>
            <span className="dash-pill yellow">
              {c.watching}
              {hud.watching ? `: ${racers.find((r) => r.id === hud.watching)?.name ?? ""}` : ""}
            </span>
          </div>
        )}
        {someoneFinished && !hud.finished && secondsLeft !== null && t > 0 && (
          <div style={{ marginTop: 8 }}>
            <span className="dash-pill pink">
              {c.hurry} {secondsLeft}
            </span>
          </div>
        )}
      </div>

      {racers.length > 0 && t > -4 && (
        <div className="dash-track" aria-hidden>
          {racers.map((r) => (
            <span key={r.id} className={r.id === meId ? "me" : undefined} style={{ bottom: `${Math.round((hud.progress[r.id] ?? 0) * 100)}%` }}>
              <AvatarDisc id={r.avatar} size={r.id === meId ? 30 : 22} border={2} shadow={false} />
            </span>
          ))}
        </div>
      )}

      <div className="dash-center">
        {failed ? (
          <div className="ec-card dash-card">
            <p style={{ fontWeight: 900 }}>{c.noWebgl}</p>
          </div>
        ) : t < -3.2 ? (
          <div className="ec-card dash-card">
            <div className="ec-chunky" style={{ fontSize: 13, opacity: 0.6 }}>
              {c.round} {props.round + 1}/{props.rounds}
            </div>
            <h2 className="ec-chunky" style={{ fontSize: 28, lineHeight: 1.15, margin: "4px 0 6px", textShadow: `0 3px 0 ${level.theme.accent2}` }}>
              {lang === "ja" ? level.name.ja : level.name.en}
            </h2>
            <p style={{ fontSize: 14, fontWeight: 900, opacity: 0.8 }}>{lang === "ja" ? level.tagline.ja : level.tagline.en}</p>
          </div>
        ) : count > 0 ? (
          <div key={count} className="dash-count ec-outline">
            {count}
          </div>
        ) : t >= 0 && t < 0.9 ? (
          <div className="dash-count ec-outline" style={{ fontSize: 96, color: "var(--yellow)" }}>
            {c.go}
          </div>
        ) : hud.finished ? (
          <div className="ec-card dash-card" style={{ marginBottom: "38vh" }}>
            <h2 className="ec-chunky" style={{ fontSize: 28, textShadow: "0 3px 0 var(--yellow)" }}>
              {c.finished}
            </h2>
            {finishPlace !== null && myFinish !== undefined && (
              <p className="ec-chunky" style={{ fontSize: 18, margin: "2px 0" }}>
                {ordinal(finishPlace, lang)} · {raceClock(myFinish)}
              </p>
            )}
            {hud.racing > 1 && (
              <p style={{ fontSize: 13, fontWeight: 900, opacity: 0.7 }}>
                {c.waitingOthers} {secondsLeft !== null ? secondsLeft : ""}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {meId && coarse && !hud.finished && (
        <div className="dash-buttons">
          <div className={`dash-button dive${pressed.dive ? " down" : ""}`} {...button("dive")}>
            {c.dive}
          </div>
          <div className={`dash-button jump${pressed.jump ? " down" : ""}`} {...button("jump")}>
            {c.jump}
          </div>
        </div>
      )}
      {meId && !coarse && t < 6 && <div className="dash-hint">{c.howKeys}</div>}
    </div>
  );
}
