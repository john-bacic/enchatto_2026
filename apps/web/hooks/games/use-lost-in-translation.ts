"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { tokenFor, useAuthedMutation } from "@/lib/convex";

export function useLostInTranslation({
  roomId,
  participantId,
  setShowGamePicker,
}: {
  roomId: string;
  participantId: string;
  setShowGamePicker: Dispatch<SetStateAction<boolean>>;
}) {
  const [dismissedGameStepId, setDismissedGameStepId] = useState<string | null>(null);

  const activeGameSession = useQuery(api.games.getActiveGameSession, {
    roomId: roomId as Id<"rooms">,
  });
  const myActiveStep = useQuery(
    api.games.getMyActiveStep,
    participantId ? { participantId: participantId as Id<"participants">, token: tokenFor(participantId) } : "skip"
  );
  // Debug: trace game step changes. A production build prints nothing
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[GAME] myActiveStep:", myActiveStep ? { id: myActiveStep._id, type: myActiveStep.stepType, round: myActiveStep.round, chain: (myActiveStep as any).chainId } : null);
    }
  }, [myActiveStep]);

  const latestGameSession = useQuery(api.games.getLatestGameSession, {
    roomId: roomId as Id<"rooms">,
  });
  const gameReplay = useQuery(
    api.games.getGameReplay,
    latestGameSession && latestGameSession.status === "complete"
      ? { gameSessionId: latestGameSession._id }
      : "skip"
  );
  const gameStatus = useQuery(
    api.games.getGameStatus,
    activeGameSession ? { roomId: roomId as Id<"rooms"> } : "skip"
  );

  // Mutations
  const startGameMutation = useAuthedMutation(api.games.startGame);
  const submitGameStepMutation = useAuthedMutation(api.games.submitGameStep);

  // Compute timer seconds from active game SESSION (not step — watchers don't have
  // an active step during the draw phase, so myActiveStep would be null for them,
  // causing timerSeconds to always default to 20).
  const sessionTimer = activeGameSession?.timerEnabled ?? myActiveStep?.timerEnabled;
  const activeTimerSeconds = typeof sessionTimer === "number"
    ? sessionTimer
    : (sessionTimer !== false ? 20 : 0);

  const cancelGameMutation = useAuthedMutation(api.games.cancelGame);
  const handleStartGame = useCallback(
    async (gameType: string, level: number = 1, timerSeconds: number = 20) => {
      if (!participantId) return;
      try {
        // Cancel any lingering active game first
        await cancelGameMutation({
          roomId: roomId as Id<"rooms">,
          participantId: participantId as Id<"participants">,
        });
        await startGameMutation({
          roomId: roomId as Id<"rooms">,
          participantId: participantId as Id<"participants">,
          gameType,
          level,
          timerEnabled: timerSeconds,
        });
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    },
    [cancelGameMutation, startGameMutation, roomId, participantId]
  );

  const handleSubmitGameStep = useCallback(
    async (stepId: string, outputText?: string, outputDrawingUrl?: string, selectedOption?: string) => {
      if (!participantId) return;
      try {
        // Call mutation directly (not via action) for reliable Convex reactivity
        const args: any = {
          stepId: stepId as Id<"gameSteps">,
          participantId: participantId as Id<"participants">,
        };
        if (outputText !== undefined) args.outputText = outputText;
        if (outputDrawingUrl !== undefined) args.outputDrawingUrl = outputDrawingUrl;
        if (selectedOption !== undefined) args.selectedOption = selectedOption;
        // A guess is answered with how it came out, which the overlay shows
        return await submitGameStepMutation(args);
      } catch (err: any) {
        console.error("Failed to submit game step:", err);
        alert("Game step error: " + (err?.message ?? err?.data ?? String(err)));
        // The overlay undoes the pick, or lets Done send the drawing again
        throw err;
      }
    },
    [submitGameStepMutation, participantId]
  );

  return { dismissedGameStepId, setDismissedGameStepId, activeGameSession, myActiveStep, latestGameSession, gameReplay, gameStatus, activeTimerSeconds, cancelGameMutation, handleStartGame, handleSubmitGameStep };
}
