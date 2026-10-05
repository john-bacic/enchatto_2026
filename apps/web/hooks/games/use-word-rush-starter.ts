"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthedMutation } from "@/lib/convex";

export function useWordRushStarter({
  roomId,
  participantId,
  setShowGamePicker,
  cancelGameMutation,
}: {
  roomId: string;
  participantId: string;
  setShowGamePicker: Dispatch<SetStateAction<boolean>>;
  cancelGameMutation: ReturnType<typeof useAuthedMutation<typeof api.games.cancelGame>>;
}) {
  // Word Rush real-time subscription
  const wordRushGame = useQuery(api.wordRush.getState, {
    roomId: roomId as Id<"rooms">,
  });

  // Word Rush mutations
  const createWordRushLobby = useAuthedMutation(api.wordRush.createLobby);
  const cancelWordRush = useAuthedMutation(api.wordRush.cancel);

  const handleStartWordRush = useCallback(
    async ({ pack, sayIt }: { pack: string; sayIt: boolean }) => {
      if (!participantId) return;
      try {
        // Cancel any lingering active game first (ignore errors if no active game)
        try {
          await cancelGameMutation({
            roomId: roomId as Id<"rooms">,
            participantId: participantId as Id<"participants">,
          });
        } catch {
          // No active game to cancel — that's fine
        }
        await createWordRushLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
          pack,
          sayIt,
        });
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to start Word Rush:", err);
      }
    },
    [cancelGameMutation, createWordRushLobby, roomId, participantId]
  );

  return { wordRushGame, cancelWordRush, handleStartWordRush };
}
