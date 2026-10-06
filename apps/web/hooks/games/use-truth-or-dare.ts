"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { todTrace, tracedMutation } from "@/components/tod-debug-panel";
import { tokenFor, useAuthedMutation } from "@/lib/convex";

/** How long after a failed action the game is looked at again, before the player is told */
const SETTLE_MS = 1000;
/** How long the player is told for, as by Word Rush's toast */
const FAILURE_SHOWN_MS = 2800;

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

  // Where the game stands: the game on screen, its turn, and how far that turn has come. The screen starts a turn
  // or a stage of one afresh, and goes when the game is over, so a change here is a change the player sees
  const stage = truthOrDareGame
    ? [truthOrDareGame._id, truthOrDareGame.status, truthOrDareGame.currentTurn?._id, truthOrDareGame.currentTurn?.status].join(" ")
    : "";
  // What an action reads as it is sent
  const stageRef = useRef(stage);
  stageRef.current = stage;

  // Set while the player is being told that an action failed. It is the toast's key: a second failure pops it again
  const [truthOrDareFailure, setTruthOrDareFailure] = useState<number | null>(null);
  const failureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (failureTimer.current) clearTimeout(failureTimer.current);
  }, []);
  const tellFailure = useCallback(() => {
    setTruthOrDareFailure(Date.now());
    if (failureTimer.current) clearTimeout(failureTimer.current);
    failureTimer.current = setTimeout(() => setTruthOrDareFailure(null), FAILURE_SHOWN_MS);
  }, []);

  // Failed actions that are due to be judged: each with where the game stood when it was sent, and the function
  // its verdict goes to
  const due = useRef<{ sentAt: string; verdict: (movedOn: boolean) => void }[]>([]);
  const [judged, judge] = useReducer((n: number) => n + 1, 0);
  // Judged in an effect, which runs once the page is drawn with the room's latest answer: a timer by itself can
  // run before an answer that has arrived is drawn
  useEffect(() => {
    const failures = due.current;
    due.current = [];
    if (failures.some((failure) => failure.sentAt === stage)) tellFailure();
    for (const failure of failures) failure.verdict(failure.sentAt !== stage);
  }, [judged, stage, tellFailure]);

  /**
   * What becomes of a failed action that was sent while the game stood at `sentAt`. A refusal can mean only that
   * the game moved on before the action arrived (the turn was skipped, the game was ended), and the room's answer
   * that shows it can come a moment after the refusal. The refusal's words do not say which: a production
   * deployment hands a client "Server Error" for every one. So the game is looked at again SETTLE_MS later. Where
   * it has moved on, so has the screen, and this resolves to true. Where it stands as it stood, the player is told
   * and this resolves to false: the screen lets them try again with what they had entered.
   */
  const failed = useCallback(
    (sentAt: string) =>
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          due.current.push({ sentAt, verdict: resolve });
          judge();
        }, SETTLE_MS);
      }),
    []
  );

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
        // No game stands yet for the refusal to be late for. The picker is still open, to start from again
        tellFailure();
      }
    },
    [createTruthOrDare, roomId, participantId, tellFailure]
  );

  const handleSubmitTruthOrDareChoice = useCallback(
    async (gameId: string, choice: "truth" | "dare") => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
      try {
        await tracedMutation("submitChoice", `${choice} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareChoice({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            choice,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to submit choice:", err);
        return failed(sentAt);
      }
    },
    [submitTruthOrDareChoice, participantId, failed]
  );

  const handleSubmitTruthOrDareResponse = useCallback(
    async (gameId: string, responseText?: string, responseMediaUrl?: string) => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
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
          return true;
        }
        await tracedMutation("submitResponse:text", responseText?.slice(0, 30) ?? "", () =>
          submitTruthOrDareResponse({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            responseText,
            responseMediaUrl,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to submit response:", err);
        return failed(sentAt);
      }
    },
    [submitTruthOrDareResponse, participantId, convexSiteUrl, failed]
  );

  const handleAdvanceTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
      try {
        await tracedMutation("advanceTurn", `pid=${participantId.slice(-6)}`, () =>
          advanceTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to advance turn:", err);
        return failed(sentAt);
      }
    },
    [advanceTruthOrDareTurn, participantId, failed]
  );

  const handleSkipTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
      try {
        await tracedMutation("skipTurn", `pid=${participantId.slice(-6)}`, () =>
          skipTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to skip turn:", err);
        return failed(sentAt);
      }
    },
    [skipTruthOrDareTurn, participantId, failed]
  );

  const handleEndTruthOrDare = useCallback(
    async (gameId: string) => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
      try {
        await tracedMutation("endGame", `pid=${participantId.slice(-6)}`, () =>
          endTruthOrDare({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to end Truth or Dare:", err);
        return failed(sentAt);
      }
    },
    [endTruthOrDare, participantId, failed]
  );

  const handleSubmitTruthOrDareRating = useCallback(
    async (turnId: string, score: number) => {
      if (!participantId) return true;
      const sentAt = stageRef.current;
      try {
        await tracedMutation("submitRating", `score=${score} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareRating({
            turnId: turnId as Id<"truthOrDareTurns">,
            participantId: participantId as Id<"participants">,
            score,
          })
        );
        return true;
      } catch (err) {
        console.error("Failed to submit rating:", err);
        return failed(sentAt);
      }
    },
    [submitTruthOrDareRating, participantId, failed]
  );

  return { truthOrDareGame, truthOrDareFailure, dismissedTruthOrDareId, setDismissedTruthOrDareId, endTruthOrDare, handleCreateTruthOrDare, handleSubmitTruthOrDareChoice, handleSubmitTruthOrDareResponse, handleAdvanceTruthOrDareTurn, handleSkipTruthOrDareTurn, handleEndTruthOrDare, handleSubmitTruthOrDareRating };
}
