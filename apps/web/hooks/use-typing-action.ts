"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthedMutation } from "@/lib/convex";

export function useTypingAction({
  participantId,
  myActiveStep,
}: {
  participantId: string;
  myActiveStep: FunctionReturnType<typeof api.games.getMyActiveStep> | undefined;
}) {
  const setTypingAction = useAuthedMutation(api.participants.setTypingAction);

  // Set typing action to "drawing" while on a draw step so other players see pencil indicator
  useEffect(() => {
    if (!participantId) return;
    if (myActiveStep?.stepType === "draw") {
      setTypingAction({
        participantId: participantId as Id<"participants">,
        action: "drawing",
        drawingStartedAt: (typeof myActiveStep?.timerEnabled === "number" ? myActiveStep.timerEnabled > 0 : myActiveStep?.timerEnabled !== false) ? Date.now() : undefined,
      }).catch(() => {});
      return () => {
        setTypingAction({
          participantId: participantId as Id<"participants">,
          action: undefined,
        }).catch(() => {});
      };
    }
  }, [myActiveStep?.stepType, myActiveStep?._id, participantId, setTypingAction]);

  const lastTypingAction = useRef<string | null>(null);
  const handleTypingChange = useCallback(
    (action: "typing" | "drawing" | "voicing" | null) => {
      if (!participantId) return;
      const key = action ?? "null";
      if (lastTypingAction.current === key) return;
      lastTypingAction.current = key;
      setTypingAction({
        participantId: participantId as Id<"participants">,
        action: action ?? undefined,
      }).catch(() => {});
    },
    [setTypingAction, participantId]
  );

  return { setTypingAction, handleTypingChange };
}
