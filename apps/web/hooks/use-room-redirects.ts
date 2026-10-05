"use client";

import { useEffect } from "react";
import type { useRouter } from "next/navigation";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export function useRoomRedirects({
  participantId,
  tokenMissing,
  roomState,
  me,
  router,
}: {
  participantId: string;
  tokenMissing: boolean;
  roomState: FunctionReturnType<typeof api.rooms.getRoomState> | undefined;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  router: ReturnType<typeof useRouter>;
}) {
  // Redirect to join screen if participant was removed (kicked)
  useEffect(() => {
    if (participantId && roomState && roomState.participants.length > 0 && !me) {
      router.replace(`/join/${roomState.room.joinCode}`);
    }
  }, [participantId, roomState, me, router]);

  // A visitor without the token goes on to the join screen; until it loads, the "Join Required" screen below shows
  useEffect(() => {
    if (tokenMissing && roomState && roomState.room.status !== "closed") {
      router.replace(`/join/${roomState.room.joinCode}`);
    }
  }, [tokenMissing, roomState, router]);

  // Redirect to home screen if room is closed
  useEffect(() => {
    if (roomState?.room.status === "closed") {
      router.replace("/");
    }
  }, [roomState?.room.status, router]);
}
