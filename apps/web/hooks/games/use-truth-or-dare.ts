"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { todTrace, tracedMutation } from "@/components/tod-debug-panel";
import { tokenFor, useAuthedMutation } from "@/lib/convex";

export function useTruthOrDare({
  roomId,
  participantId,
  convexSiteUrl,
  setShowGamePicker,
}: {
  roomId: string;
  participantId: string;
  convexSiteUrl: string;
  setShowGamePicker: Dispatch<SetStateAction<boolean>>;
}) {
  const [dismissedTruthOrDareId, setDismissedTruthOrDareId] = useState<string | null>(null);

  // Truth or Dare real-time subscription
  const truthOrDareGame = useQuery(api.truthOrDare.getActiveTruthOrDare, {
    roomId: roomId as Id<"rooms">,
  });

  // Trace T/D reactive query updates
  const prevTodRef = useRef<{ status?: string; turnStatus?: string; turnIdx?: number; turnId?: string }>({});
  useEffect(() => {
    if (!truthOrDareGame) return;
    const cur = {
      status: truthOrDareGame.status,
      turnStatus: truthOrDareGame.currentTurn?.status,
      turnIdx: truthOrDareGame.currentTurnIndex,
      turnId: truthOrDareGame.currentTurn?._id,
    };
    const prev = prevTodRef.current;
    if (cur.status !== prev.status || cur.turnStatus !== prev.turnStatus || cur.turnId !== prev.turnId) {
      todTrace({
        source: "client",
        action: "query:stateChange",
        detail: `status=${cur.status} turn=${cur.turnStatus} idx=${cur.turnIdx} pid=${truthOrDareGame.currentTurnParticipantId?.slice(-6)}`,
      });
    }
    prevTodRef.current = cur;
  }, [truthOrDareGame]);

  // Truth or Dare mutations
  const createTruthOrDare = useAuthedMutation(api.truthOrDare.createGame);
  const submitTruthOrDareChoice = useAuthedMutation(api.truthOrDare.submitChoice);
  const submitTruthOrDareResponse = useAuthedMutation(api.truthOrDare.submitResponse);
  const advanceTruthOrDareTurn = useAuthedMutation(api.truthOrDare.advanceTurn);
  const skipTruthOrDareTurn = useAuthedMutation(api.truthOrDare.skipTurn);
  const endTruthOrDare = useAuthedMutation(api.truthOrDare.endGame);
  const submitTruthOrDareRating = useAuthedMutation(api.truthOrDare.submitRating);

  const handleCreateTruthOrDare = useCallback(
    async (mode: "normal" | "deep" = "normal") => {
      if (!participantId) return;
      try {
        await createTruthOrDare({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
          promptMode: mode,
        });
        setDismissedTruthOrDareId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Truth or Dare:", err);
      }
    },
    [createTruthOrDare, roomId, participantId]
  );

  const handleSubmitTruthOrDareChoice = useCallback(
    async (gameId: string, choice: "truth" | "dare") => {
      if (!participantId) return;
      try {
        await tracedMutation("submitChoice", `${choice} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareChoice({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            choice,
          })
        );
      } catch (err) {
        console.error("Failed to submit choice:", err);
      }
    },
    [submitTruthOrDareChoice, participantId]
  );

  const handleSubmitTruthOrDareResponse = useCallback(
    async (gameId: string, responseText?: string, responseMediaUrl?: string) => {
      if (!participantId) return;
      const isImage = responseMediaUrl && responseMediaUrl.startsWith("data:");
      const payloadKB = isImage ? Math.round(responseMediaUrl!.length / 1024) : 0;
      try {
        if (isImage) {
          await tracedMutation("submitResponse:drawing", `${payloadKB}KB`, async () => {
                const res = await fetch(`${convexSiteUrl}/api/truth-or-dare/submit-response`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameId, participantId, callerToken: tokenFor(participantId), responseText, responseMediaUrl }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || `HTTP ${res.status}`);
            }
          });
          return;
        }
        await tracedMutation("submitResponse:text", responseText?.slice(0, 30) ?? "", () =>
          submitTruthOrDareResponse({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            responseText,
            responseMediaUrl,
          })
        );
      } catch (err) {
        console.error("Failed to submit response:", err);
      }
    },
    [submitTruthOrDareResponse, participantId, convexSiteUrl]
  );

  const handleAdvanceTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("advanceTurn", `pid=${participantId.slice(-6)}`, () =>
          advanceTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to advance turn:", err);
      }
    },
    [advanceTruthOrDareTurn, participantId]
  );

  const handleSkipTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("skipTurn", `pid=${participantId.slice(-6)}`, () =>
          skipTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to skip turn:", err);
      }
    },
    [skipTruthOrDareTurn, participantId]
  );

  const handleEndTruthOrDare = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("endGame", `pid=${participantId.slice(-6)}`, () =>
          endTruthOrDare({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to end Truth or Dare:", err);
      }
    },
    [endTruthOrDare, participantId]
  );

  const handleSubmitTruthOrDareRating = useCallback(
    async (turnId: string, score: number) => {
      if (!participantId) return;
      try {
        await tracedMutation("submitRating", `score=${score} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareRating({
            turnId: turnId as Id<"truthOrDareTurns">,
            participantId: participantId as Id<"participants">,
            score,
          })
        );
      } catch (err) {
        console.error("Failed to submit rating:", err);
      }
    },
    [submitTruthOrDareRating, participantId]
  );

  return { truthOrDareGame, dismissedTruthOrDareId, setDismissedTruthOrDareId, endTruthOrDare, handleCreateTruthOrDare, handleSubmitTruthOrDareChoice, handleSubmitTruthOrDareResponse, handleAdvanceTruthOrDareTurn, handleSkipTruthOrDareTurn, handleEndTruthOrDare, handleSubmitTruthOrDareRating };
}
