"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { PRESET_AVATARS } from "@/lib/types";
import "@/components/dash/dash.css";

const DashRace = dynamic(() => import("@/components/dash/race"), { ssr: false, loading: () => <div className="dash-stage" /> });

// Chatto Dash by yourself: any of the five courses, with no room and no server. For trying a course out.
// /play/dash/lab?level=2 opens the third course; cp=2 starts at its second checkpoint; t=20 starts its clock
// twenty seconds in.
function Lab() {
  const params = useSearchParams();
  const [level, setLevel] = useState(() => Math.max(0, Math.min(LEVEL_NAMES.length - 1, Number(params.get("level") ?? 0) || 0)));
  const [run, setRun] = useState(0);
  const [coarse, setCoarse] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const lang = params.get("lang") ?? "en";
  const skip = Number(params.get("t") ?? 0) || 0;
  const started = useRef(0);
  useEffect(() => {
    setCoarse(matchMedia("(pointer: coarse)").matches || params.get("touch") === "1");
  }, [params]);
  useMemo(() => {
    started.current = typeof performance === "undefined" ? 0 : performance.now() + 5000 - skip * 1000;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, run]);
  const raceTime = useCallback(() => (performance.now() - started.current) / 1000, []);
  const racers = useMemo(() => [{ id: "me", avatar: params.get("avatar") ?? PRESET_AVATARS[0].id, name: "You" }], [params]);
  const finishes = useMemo(() => {
    const out: Record<string, number> = {};
    if (done !== null) out.me = done;
    return out;
  }, [done]);
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
        onFinish={setDone}
        startCheckpoint={Number(params.get("cp") ?? 0) || 0}
      />
      <div style={{ position: "fixed", zIndex: 96, left: 8, bottom: 8, display: "flex", gap: 4 }}>
        {LEVEL_NAMES.map((_, i) => (
          <button
            key={i}
            className="dash-pill"
            style={{ background: i === level ? "var(--yellow)" : "#fff", minHeight: 28, minWidth: 28, padding: "0 6px" }}
            onClick={() => {
              setDone(null);
              setLevel(i);
              setRun((r) => r + 1);
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
}

export default function DashLabPage() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
