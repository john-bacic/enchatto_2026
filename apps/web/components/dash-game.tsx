"use client";

import dynamic from "next/dynamic";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { DashGame, NetState } from "@/lib/dash/game";
import { useAuthedMutation } from "@/lib/convex";
import { DashLobby } from "./dash/lobby";
import { DashFinal, DashRoundResults } from "./dash/results";
import { dashCopy } from "./dash/strings";
import "./dash/dash.css";

// The race draws with three.js, which is only fetched once a race is on
const DashRace = dynamic(() => import("./dash/race"), {
  ssr: false,
  loading: () => <div className="dash-stage" />,
});

/**
 * Chatto Dash, whatever state its game is in: the lobby, a round being raced, the results between two rounds,
 * the podium. The game is the room's (dash.getActiveDash); everything a racer's device says to the server
 * during a round goes from here.
 */
export function DashGameView({
  game,
  participantId,
  isRoomHost,
  lang,
  onMinimize,
  onClose,
}: {
  game: Doc<"dashGames">;
  participantId: string;
  isRoomHost: boolean;
  lang?: string;
  onMinimize?: () => void;
  onClose: () => void;
}) {
  const c = dashCopy(lang);
  const convex = useConvex();
  // The race itself (three.js and the courses) is fetched as soon as there is a game to show, in its lobby, and
  // not when the first round's countdown has already begun: a slow connection would start that racer late
  useEffect(() => {
    void import("./dash/race");
  }, []);

  const joinLobby = useAuthedMutation(api.dash.joinLobby);
  const leaveLobby = useAuthedMutation(api.dash.leaveLobby);
  const startGame = useAuthedMutation(api.dash.startGame);
  const cancelGame = useAuthedMutation(api.dash.cancelGame);
  const playAgain = useAuthedMutation(api.dash.playAgain);
  const skipResults = useAuthedMutation(api.dash.skipResults);
  const pushState = useAuthedMutation(api.dash.pushState);
  const finish = useAuthedMutation(api.dash.finish);
  const clock = useAuthedMutation(api.dash.clock);

  const gameId = game._id;
  const me = participantId as Id<"participants">;
  const racing = game.players.some((p) => p.participantId === participantId);
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches);
  }, []);

  // ── The server's clock. Every device draws the obstacles by it, so they agree on where each one is ──
  const offset = useRef(0);
  const bestTrip = useRef(Infinity);
  const bestAt = useRef(0);
  const noteClock = useCallback((serverNow: number, sentAt: number, tripMs: number) => {
    // The answer with the shortest trip says the most; an old best is let go after half a minute
    const stale = performance.now() - bestAt.current > 30_000;
    if (tripMs >= bestTrip.current && !stale) return;
    bestTrip.current = tripMs;
    bestAt.current = performance.now();
    offset.current = serverNow - (sentAt + tripMs / 2);
  }, []);
  const serverNow = useCallback(() => Date.now() + offset.current, []);
  useEffect(() => {
    let stop = false;
    (async () => {
      for (let i = 0; i < 4 && !stop; i++) {
        const sentAt = Date.now();
        const t0 = performance.now();
        try {
          const { now } = await clock({ participantId: me });
          noteClock(now, sentAt, performance.now() - t0);
        } catch {
          // The next answer will do
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    })();
    return () => {
      stop = true;
    };
  }, [clock, noteClock, me, game.status, game.round]);

  // ── A round ──
  const round = game.round;
  const startsAt = game.roundStartsAt ?? 0;
  const raceTime = useCallback(() => (Date.now() + offset.current - startsAt) / 1000, [startsAt]);
  const running = useRef<DashGame | null>(null);
  const pushing = useRef(false);
  const onSend = useCallback(
    (s: NetState) => {
      if (pushing.current) return;
      pushing.current = true;
      const sentAt = Date.now();
      const t0 = performance.now();
      pushState({ gameId, participantId: me, round, ...s })
        .then((r) => noteClock(r.now, sentAt, performance.now() - t0))
        .catch(() => {})
        .finally(() => {
          pushing.current = false;
        });
    },
    [pushState, gameId, me, round, noteClock]
  );
  const onFinish = useCallback(() => {
    let tries = 0;
    const send = () => {
      finish({ gameId, participantId: me, round }).catch(() => {
        if (++tries < 5) setTimeout(send, 800);
      });
    };
    send();
  }, [finish, gameId, me, round]);

  // The other racers: asked for a few times a second while a round is on, slower the more of them there are
  const isRacing = game.status === "racing";
  const everyMs = 200 + Math.max(0, game.players.length - 4) * 20;
  useEffect(() => {
    if (!isRacing) return;
    let asking = false;
    const id = setInterval(() => {
      const live = running.current;
      if (!live || asking || document.hidden) return;
      asking = true;
      convex
        .query(api.dash.getRacers, { gameId })
        .then((rows) => {
          for (const r of rows) if (r.round === round) running.current?.setRemote(r.id, r);
        })
        .catch(() => {})
        .finally(() => {
          asking = false;
        });
    }, everyMs);
    return () => clearInterval(id);
  }, [isRacing, convex, gameId, round, everyMs]);

  const racers = useMemo(
    () => game.players.map((p) => ({ id: p.participantId as string, avatar: p.avatarValue, name: p.nickname })),
    // A round's racers are those the game had when it started
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameId, round, game.players.length]
  );
  // Someone who had already crossed the line when this screen came up (they put it away and came back) watches
  // the rest of the round. Worked out once a round: crossing the line with the screen up changes nothing here
  const finishedBefore = useMemo(
    () => game.finishes.some((f) => f.participantId === participantId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameId, round]
  );
  const finishes = useMemo(() => {
    const out: Record<string, number> = {};
    for (const f of game.finishes) out[f.participantId] = f.ms / 1000;
    return out;
  }, [game.finishes]);

  const act = (what: string, run: () => Promise<unknown>) => () => {
    run().catch((err) => console.error(`Chatto Dash: ${what} failed`, err));
  };
  const canEnd = isRoomHost || game.hostParticipantId === participantId;
  const end = () => {
    if (confirm(c.endConfirm)) act("end", () => cancelGame({ gameId, participantId: me }))();
  };

  if (game.status === "lobby") {
    return (
      <DashLobby
        game={game}
        participantId={participantId}
        lang={lang}
        coarse={coarse}
        onJoin={act("join", () => joinLobby({ gameId, participantId: me }))}
        onLeave={act("leave", () => leaveLobby({ gameId, participantId: me }))}
        onStart={act("start", () => startGame({ gameId, participantId: me }))}
        onCancel={act("cancel", () => cancelGame({ gameId, participantId: me }))}
        onClose={onMinimize ?? onClose}
      />
    );
  }
  if (game.status === "racing") {
    return (
      <DashRace
        key={`${gameId}:${round}`}
        levelIndex={game.levels[round] ?? round}
        round={round}
        rounds={game.levels.length}
        racers={racers}
        meId={racing && !finishedBefore ? participantId : null}
        resumeKey={`${gameId}:${round}:${participantId}`}
        raceTime={raceTime}
        endsAt={game.roundEndsAt}
        serverNow={serverNow}
        finishes={finishes}
        coarse={coarse}
        lang={lang}
        canEnd={canEnd}
        onSend={onSend}
        onFinish={onFinish}
        onGame={(g) => {
          running.current = g;
        }}
        onMinimize={onMinimize}
        onEnd={end}
        sendEvery={everyMs}
      />
    );
  }
  if (game.status === "results") {
    return (
      <DashRoundResults
        key={game.results.length}
        game={game}
        participantId={participantId}
        lang={lang}
        serverNow={serverNow}
        onNext={canEnd ? act("next course", () => skipResults({ gameId, participantId: me })) : undefined}
      />
    );
  }
  if (game.status === "completed") {
    return (
      <DashFinal
        game={game}
        participantId={participantId}
        lang={lang}
        onPlayAgain={act("play again", () => playAgain({ gameId, participantId: me }))}
        onClose={onClose}
      />
    );
  }
  return null;
}
