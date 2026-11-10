"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";
import { DashGameView } from "@/components/dash-game";
import { dashCopy } from "@/components/dash/strings";
import { RoomBackground } from "@/components/ui/effects";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { dashLive } from "@/lib/dash/on-screen";
import { textureForRoom } from "@/lib/textures";

// Chatto Dash by itself, for the iPhone app: the room's game and nothing else of the room. The app shows this
// page in a web view over its room screen (apps/ios/Views/DashGameView.swift), so that the race is the same
// code on a phone as in a browser. /play/dash?room=<room id>&pid=<participant id>, with b=legacy for a room on
// the legacy backend, as on a room link. The app puts the participant's token where the web keeps one
// (lib/convex.tsx) before the page loads, and is told when to put the page away:
// window.webkit.messageHandlers.enchattoDash gets { type: "close" } (the minimize button, Close on the podium)
// or { type: "ended" } (the game was ended, or the room has none).

type NativeMessage = { type: "close" | "ended" | "ready" };
function tellApp(message: NativeMessage) {
  const handlers = (window as unknown as { webkit?: { messageHandlers?: Record<string, { postMessage(m: unknown): void }> } }).webkit?.messageHandlers;
  handlers?.enchattoDash?.postMessage(message);
}

function Embedded() {
  const params = useSearchParams();
  const roomId = params.get("room") ?? "";
  const participantId = params.get("pid") ?? "";
  const state = useQuery(api.rooms.getRoomState, roomId ? { roomId: roomId as Id<"rooms"> } : "skip");
  const game = useQuery(api.dash.getActiveDash, roomId ? { roomId: roomId as Id<"rooms"> } : "skip");
  const me = state?.participants.find((p) => p._id === participantId);
  const lang = params.get("lang") ?? me?.preferredLanguage ?? "en";
  const c = dashCopy(lang);
  const close = useCallback(() => tellApp({ type: "close" }), []);

  useEffect(() => {
    tellApp({ type: "ready" });
    // The app loads this page ahead of need, before the room has a race at all: the race's own code is fetched
    // now too, so that nothing is left to fetch when one is started
    void import("@/components/dash/race");
  }, []);

  // A game that was on and is not any more: the app takes the page down
  const wasLive = useRef(false);
  const live = dashLive(game);
  useEffect(() => {
    if (game === undefined) return;
    if (live) wasLive.current = true;
    else if (wasLive.current || game === null || game.status === "canceled") tellApp({ type: "ended" });
  }, [game, live]);

  return (
    <>
      <RoomBackground texture={state?.room ? textureForRoom(state.room) : undefined} waiting={state === undefined} />
      {game && live ? (
        <DashGameView game={game} participantId={participantId} isRoomHost={me?.role === "host"} lang={lang} onMinimize={close} onClose={close} />
      ) : game !== undefined ? (
        <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", padding: 24 }}>
          <button className="ec-btn white" style={{ maxWidth: 260 }} onClick={close}>
            {c.close}
          </button>
        </div>
      ) : null}
    </>
  );
}

export default function DashEmbedPage() {
  return (
    <Suspense fallback={null}>
      <Embedded />
    </Suspense>
  );
}
