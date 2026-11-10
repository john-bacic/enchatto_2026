"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { DASH_ICON, DashCard } from "./lobby";
import DashRace from "./race";
import { dashCopy, raceClock } from "./strings";
import "./dash.css";

// Chatto Dash by yourself: any of the five courses against the clock, with no room and no server. Everything a
// race needs is worked out on the device (lib/dash/sim.ts), so this plays with no connection at all: the iPhone
// app carries a copy of it (apps/web/offline/dash-practice.tsx, built into apps/ios/Resources/DashOffline) for
// exactly that. A best time for each course is kept on the device.

/** Seconds from choosing a course to its start signal: the card, then 3, 2, 1. The length a room's round has */
const COUNTDOWN = 5;
const BESTS = "enchatto_dash_bests";
const TINTS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--blue-soft)", "#fff", "var(--violet-soft)"];

function readBests(): Record<string, number> {
  try {
    const kept = JSON.parse(localStorage.getItem(BESTS) ?? "{}");
    return kept && typeof kept === "object" ? kept : {};
  } catch {
    return {};
  }
}

export function DashPractice({
  avatar,
  lang,
  coarse,
  onClose,
  startCheckpoint,
}: {
  avatar: string;
  lang?: string;
  /** A touch screen: the thumb stick and the buttons are drawn */
  coarse: boolean;
  /** Leaves practice altogether. Without it there is nowhere to leave to, and no button for it */
  onClose?: () => void;
  /** Starts every run at this checkpoint, not the start line: for trying the end of a course out */
  startCheckpoint?: number;
}) {
  const c = dashCopy(lang);
  const [level, setLevel] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const [bests, setBests] = useState<Record<string, number>>({});
  /** The best there was before this run: what the run is measured against once it is itself the best */
  const [before, setBefore] = useState<number | undefined>(undefined);
  useEffect(() => setBests(readBests()), []);

  const started = useRef(0);
  const begin = (index: number) => {
    started.current = performance.now() + COUNTDOWN * 1000;
    setBefore(bests[String(index)]);
    setDone(null);
    setLevel(index);
    setRun((r) => r + 1);
  };
  const raceTime = useCallback(() => (performance.now() - started.current) / 1000, []);
  const racers = useMemo(() => [{ id: "me", avatar, name: "" }], [avatar]);
  const finishes = useMemo(() => (done === null ? ({} as Record<string, number>) : { me: done }), [done]);

  const finished = (seconds: number) => {
    setDone(seconds);
    if (level === null) return;
    const key = String(level);
    if (bests[key] !== undefined && bests[key] <= seconds) return;
    const next = { ...bests, [key]: Math.round(seconds * 100) / 100 };
    setBests(next);
    try {
      localStorage.setItem(BESTS, JSON.stringify(next));
    } catch {
      // No storage: the best lasts as long as the screen does
    }
  };

  if (level === null) {
    return (
      <DashCard>
        <>
          <Icon name={DASH_ICON} size={56} />
          <h2 className="ec-chunky" style={{ fontSize: 24, margin: "2px 0 2px", textShadow: "0 3px 0 var(--yellow)" }}>
            {c.title} · {c.practice}
          </h2>
          <p style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 12, lineHeight: 1.45 }}>{c.practiceBlurb}</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <AvatarDisc id={avatar} size={54} />
          </div>
          <div className="dash-rows" style={{ marginBottom: 12 }}>
            {LEVEL_NAMES.map((name, i) => {
              const best = bests[String(i)];
              return (
                <button key={i} className="dash-row dash-course" style={{ background: TINTS[i % TINTS.length] }} onClick={() => begin(i)}>
                  <span className="n">{i + 1}</span>
                  <span className="name">{lang === "ja" ? name.ja : name.en}</span>
                  <span className="time">{best !== undefined ? `${c.best} ${raceClock(best)}` : c.noBest}</span>
                  <span className="go" aria-hidden>
                    ▶
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11.5, fontWeight: 900, opacity: 0.6, marginBottom: onClose ? 12 : 0 }}>{coarse ? c.howTouch : c.howKeys}</p>
          {onClose && (
            <button className="ec-btn white" style={{ fontSize: 17 }} onClick={onClose}>
              {c.close}
            </button>
          )}
        </>
      </DashCard>
    );
  }

  const next = (level + 1) % LEVEL_NAMES.length;
  return (
    <>
      <DashRace
        key={`${level}:${run}`}
        levelIndex={level}
        round={level}
        rounds={LEVEL_NAMES.length}
        racers={racers}
        meId="me"
        raceTime={raceTime}
        serverNow={Date.now}
        finishes={finishes}
        coarse={coarse}
        lang={lang}
        canEnd={false}
        onFinish={finished}
        onMinimize={() => setLevel(null)}
        startCheckpoint={startCheckpoint}
      />
      {done !== null && (
        <div className="dash-after">
          <div className="ec-card dash-card">
            <p className="ec-chunky" style={{ fontSize: 15, marginBottom: 10 }}>
              {before === undefined || done < before ? c.newBest : `${c.best} ${raceClock(before)}`}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ec-btn white" style={{ flex: 1, fontSize: 15 }} onClick={() => begin(level)}>
                {c.again}
              </button>
              <button className="ec-btn pink" style={{ flex: 1.6, fontSize: 14, whiteSpace: "nowrap", paddingInline: 6 }} onClick={() => begin(next)}>
                {c.nextNow} ▶
              </button>
            </div>
            <button className="ec-btn white" style={{ marginTop: 8, fontSize: 14 }} onClick={() => setLevel(null)}>
              {c.allCourses}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
