"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthedMutation } from "@/lib/convex";

export function useEmojiBingo({
  roomId,
  participantId,
  setShowGamePicker,
}: {
  roomId: string;
  participantId: string;
  setShowGamePicker: Dispatch<SetStateAction<boolean>>;
}) {
  const [dismissedEmojiBingoId, setDismissedEmojiBingoId] = useState<string | null>(null);

  const emojiBingoGame = useQuery(api.emojiBingo.getActiveEmojiBingo, {
    roomId: roomId as Id<"rooms">,
  });

  // Emoji Bingo mutations
  const createEmojiBingoLobby = useAuthedMutation(api.emojiBingo.createLobby);
  const joinEmojiBingoLobby = useAuthedMutation(api.emojiBingo.joinLobby);
  const leaveEmojiBingoLobby = useAuthedMutation(api.emojiBingo.leaveLobby);
  const updateEmojiBingoSettings = useAuthedMutation(api.emojiBingo.updateSettings);
  const startEmojiBingo = useAuthedMutation(api.emojiBingo.startGame);
  const rollEmojiBingo = useAuthedMutation(api.emojiBingo.rollEmoji);
  const markEmojiBingoCell = useAuthedMutation(api.emojiBingo.markCell);
  const claimEmojiBingo = useAuthedMutation(api.emojiBingo.claimBingo);
  const cancelEmojiBingo = useAuthedMutation(api.emojiBingo.cancelGame);
  const playAgainEmojiBingo = useAuthedMutation(api.emojiBingo.playAgain);

  // Emoji Bingo handlers
  const handleCreateEmojiBingoLobby = useCallback(
    async () => {
      if (!participantId) return;
      try {
        await createEmojiBingoLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
        });
        setDismissedEmojiBingoId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Emoji Bingo lobby:", err);
      }
    },
    [createEmojiBingoLobby, roomId, participantId]
  );

  const handleJoinEmojiBingoLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await joinEmojiBingoLobby({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to join Emoji Bingo lobby:", err);
      }
    },
    [joinEmojiBingoLobby, participantId]
  );

  const handleLeaveEmojiBingoLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await leaveEmojiBingoLobby({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to leave Emoji Bingo lobby:", err);
      }
    },
    [leaveEmojiBingoLobby, participantId]
  );

  const handleUpdateEmojiBingoSettings = useCallback(
    async (gameId: string, winPattern?: string) => {
      if (!participantId) return;
      try {
        await updateEmojiBingoSettings({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
          winPattern: winPattern as any,
        });
      } catch (err) {
        console.error("Failed to update Emoji Bingo settings:", err);
      }
    },
    [updateEmojiBingoSettings, participantId]
  );

  const handleStartEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await startEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to start Emoji Bingo:", err);
      }
    },
    [startEmojiBingo, participantId]
  );

  const handleRollEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await rollEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to roll emoji:", err);
      }
    },
    [rollEmojiBingo, participantId]
  );

  const handleMarkEmojiBingoCell = useCallback(
    async (gameId: string, cellIndex: number) => {
      if (!participantId) return;
      try {
        await markEmojiBingoCell({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
          cellIndex,
        });
      } catch (err) {
        console.error("Failed to mark bingo cell:", err);
      }
    },
    [markEmojiBingoCell, participantId]
  );

  const handleClaimEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        return await claimEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to claim bingo:", err);
      }
    },
    [claimEmojiBingo, participantId]
  );

  const handleCancelEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await cancelEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to cancel Emoji Bingo:", err);
      }
    },
    [cancelEmojiBingo, participantId]
  );

  const handlePlayAgainEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await playAgainEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
        setDismissedEmojiBingoId(null);
      } catch (err) {
        console.error("Failed to play again:", err);
      }
    },
    [playAgainEmojiBingo, participantId]
  );

  return { emojiBingoGame, dismissedEmojiBingoId, setDismissedEmojiBingoId, cancelEmojiBingo, handleCreateEmojiBingoLobby, handleJoinEmojiBingoLobby, handleLeaveEmojiBingoLobby, handleUpdateEmojiBingoSettings, handleStartEmojiBingo, handleRollEmojiBingo, handleMarkEmojiBingoCell, handleClaimEmojiBingo, handleCancelEmojiBingo, handlePlayAgainEmojiBingo };
}
