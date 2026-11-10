import { useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthedMutation } from "@/lib/convex";

/**
 * Chatto Dash as the room page needs it: the room's game, whether its screen has been put away, opening a
 * lobby from the game picker, and the mutation the End Game button calls. Everything inside the game's own
 * screen is the screen's (components/dash-game.tsx).
 */
export function useDash({
  roomId,
  participantId,
  setShowGamePicker,
}: {
  roomId: string;
  participantId: string;
  setShowGamePicker: (show: boolean) => void;
}) {
  const [dismissedDashId, setDismissedDashId] = useState<string | null>(null);

  const dashGame = useQuery(api.dash.getActiveDash, {
    roomId: roomId as Id<"rooms">,
  });

  const createDashLobby = useAuthedMutation(api.dash.createLobby);
  const cancelDash = useAuthedMutation(api.dash.cancelGame);

  const handleCreateDashLobby = useCallback(async () => {
    try {
      await createDashLobby({
        roomId: roomId as Id<"rooms">,
        hostParticipantId: participantId as Id<"participants">,
      });
      setDismissedDashId(null);
      setShowGamePicker(false);
    } catch (err) {
      console.error("Failed to create Chatto Dash lobby:", err);
    }
  }, [createDashLobby, roomId, participantId, setShowGamePicker]);

  return { dashGame, dismissedDashId, setDismissedDashId, cancelDash, handleCreateDashLobby };
}
