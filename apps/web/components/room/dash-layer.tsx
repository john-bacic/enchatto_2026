"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { DashGameView } from "@/components/dash-game";
import type { useDash } from "@/hooks/games/use-dash";
import { dashLive } from "@/lib/dash/on-screen";

export function DashLayer({
  dashGame,
  dismissedDashId,
  setDismissedDashId,
  participantId,
  me,
  lang,
}: {
  dashGame: ReturnType<typeof useDash>["dashGame"];
  dismissedDashId: ReturnType<typeof useDash>["dismissedDashId"];
  setDismissedDashId: ReturnType<typeof useDash>["setDismissedDashId"];
  participantId: string;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
}) {
  return (
    <>
      {dashGame && dashLive(dashGame) && dismissedDashId !== dashGame._id && (
        <DashGameView
          game={dashGame}
          participantId={participantId}
          isRoomHost={me?.role === "host"}
          lang={lang}
          onMinimize={() => setDismissedDashId(dashGame._id)}
          onClose={() => setDismissedDashId(dashGame._id)}
        />
      )}
    </>
  );
}
