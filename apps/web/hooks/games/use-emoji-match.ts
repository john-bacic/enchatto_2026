"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { tracedMutation } from "@/components/tod-debug-panel";
import { useAuthedMutation } from "@/lib/convex";
import { useGameOnScreen } from "@/lib/game-results";

export function useEmojiMatch({
  roomId,
  participantId,
  taskOpen,
  setShowGamePicker,
}: {
  roomId: string;
  participantId: string;
  taskOpen: boolean;
  setShowGamePicker: Dispatch<SetStateAction<boolean>>;
}) {
  const [dismissedEmojiMatchId, setDismissedEmojiMatchId] = useState<string | null>(null);

  // Emoji Match real-time subscription
  const emojiMatchGame = useQuery(api.emojiMatch.getActiveEmojiMatch, {
    roomId: roomId as Id<"rooms">,
  });
  // The answer is the room's latest game even when it ended long ago: its results are for a page that saw it played,
  // and never go over a Lost in Translation task
  const emojiMatchOnScreen = useGameOnScreen(
    emojiMatchGame,
    taskOpen
  );

  // Emoji Match mutations
  const createEmojiMatchLobby = useAuthedMutation(api.emojiMatch.createLobby);
  const joinEmojiMatchLobby = useAuthedMutation(api.emojiMatch.joinLobby);
  const leaveEmojiMatchLobby = useAuthedMutation(api.emojiMatch.leaveLobby);
  const startEmojiMatch = useAuthedMutation(api.emojiMatch.startGame);
  const flipEmojiMatchCard = useAuthedMutation(api.emojiMatch.flipCard);
  const resolveEmojiMatchMismatch = useAuthedMutation(api.emojiMatch.resolveMismatch);
  const cancelEmojiMatch = useAuthedMutation(api.emojiMatch.cancelGame);
  const timeoutEmojiMatchTurn = useAuthedMutation(api.emojiMatch.timeoutTurn);
  const playAgainEmojiMatch = useAuthedMutation(api.emojiMatch.playAgain);

  // Emoji Match handlers
  const handleCreateEmojiMatchLobby = useCallback(
    async () => {
      if (!participantId) return;
      try {
        await createEmojiMatchLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
        });
        setDismissedEmojiMatchId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Emoji Match lobby:", err);
      }
    },
    [createEmojiMatchLobby, roomId, participantId]
  );

  const handleJoinEmojiMatchLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await joinEmojiMatchLobby({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to join Emoji Match lobby:", err);
      }
    },
    [joinEmojiMatchLobby, participantId]
  );

  const handleLeaveEmojiMatchLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await leaveEmojiMatchLobby({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to leave Emoji Match lobby:", err);
      }
    },
    [leaveEmojiMatchLobby, participantId]
  );

  const handleStartEmojiMatch = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await startEmojiMatch({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to start Emoji Match:", err);
      }
    },
    [startEmojiMatch, participantId]
  );

  const handleFlipEmojiMatchCard = useCallback(
    async (gameId: string, cardId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("em:flipCard", `card=${cardId} pid=${participantId.slice(-6)}`, () =>
          flipEmojiMatchCard({
            gameId: gameId as Id<"emojiMatchGames">,
            cardId,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to flip card:", err);
      }
    },
    [flipEmojiMatchCard, participantId]
  );

  const handleResolveEmojiMatchMismatch = useCallback(
    async (gameId: string) => {
      try {
        await tracedMutation("em:resolveMismatch", "", () =>
          resolveEmojiMatchMismatch({
            gameId: gameId as Id<"emojiMatchGames">,
            callerId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to resolve mismatch:", err);
      }
    },
    [resolveEmojiMatchMismatch, participantId]
  );

  const handleCancelEmojiMatch = useCallback(
    async (gameId: string) => {
      try {
        await tracedMutation("em:cancel", "", () =>
          cancelEmojiMatch({
            gameId: gameId as Id<"emojiMatchGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to cancel Emoji Match:", err);
      }
    },
    [cancelEmojiMatch, participantId]
  );

  const handleTimeoutEmojiMatchTurn = useCallback(
    async (gameId: string, targetParticipantId: string) => {
      try {
        await tracedMutation("em:timeoutTurn", `pid=${targetParticipantId.slice(-6)}`, () =>
          timeoutEmojiMatchTurn({
            gameId: gameId as Id<"emojiMatchGames">,
            // Whose turn ran out; the caller, whose token the hook adds, is callerId
            participantId: targetParticipantId as Id<"participants">,
            callerId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to timeout turn:", err);
      }
    },
    [timeoutEmojiMatchTurn, participantId]
  );

  const handlePlayAgainEmojiMatch = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("em:playAgain", "", () =>
          playAgainEmojiMatch({
            gameId: gameId as Id<"emojiMatchGames">,
            participantId: participantId as Id<"participants">,
          })
        );
        setDismissedEmojiMatchId(null);
      } catch (err) {
        console.error("Failed to play again:", err);
      }
    },
    [playAgainEmojiMatch, participantId]
  );

  return { emojiMatchGame, emojiMatchOnScreen, dismissedEmojiMatchId, setDismissedEmojiMatchId, cancelEmojiMatch, handleCreateEmojiMatchLobby, handleJoinEmojiMatchLobby, handleLeaveEmojiMatchLobby, handleStartEmojiMatch, handleFlipEmojiMatchCard, handleResolveEmojiMatchMismatch, handleCancelEmojiMatch, handleTimeoutEmojiMatchTurn, handlePlayAgainEmojiMatch };
}
