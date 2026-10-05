"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { EmojiBingoGame } from "@/components/emoji-bingo-game";
import type { useEmojiBingo } from "@/hooks/games/use-emoji-bingo";

export function EmojiBingoLayer({
  emojiBingoGame,
  dismissedEmojiBingoId,
  participantId,
  me,
  lang,
  handleJoinEmojiBingoLobby,
  handleLeaveEmojiBingoLobby,
  handleStartEmojiBingo,
  handleUpdateEmojiBingoSettings,
  handleRollEmojiBingo,
  handleMarkEmojiBingoCell,
  handleClaimEmojiBingo,
  handleCancelEmojiBingo,
  handlePlayAgainEmojiBingo,
  setDismissedEmojiBingoId,
}: {
  emojiBingoGame: ReturnType<typeof useEmojiBingo>["emojiBingoGame"];
  dismissedEmojiBingoId: ReturnType<typeof useEmojiBingo>["dismissedEmojiBingoId"];
  participantId: string;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
  handleJoinEmojiBingoLobby: ReturnType<typeof useEmojiBingo>["handleJoinEmojiBingoLobby"];
  handleLeaveEmojiBingoLobby: ReturnType<typeof useEmojiBingo>["handleLeaveEmojiBingoLobby"];
  handleStartEmojiBingo: ReturnType<typeof useEmojiBingo>["handleStartEmojiBingo"];
  handleUpdateEmojiBingoSettings: ReturnType<typeof useEmojiBingo>["handleUpdateEmojiBingoSettings"];
  handleRollEmojiBingo: ReturnType<typeof useEmojiBingo>["handleRollEmojiBingo"];
  handleMarkEmojiBingoCell: ReturnType<typeof useEmojiBingo>["handleMarkEmojiBingoCell"];
  handleClaimEmojiBingo: ReturnType<typeof useEmojiBingo>["handleClaimEmojiBingo"];
  handleCancelEmojiBingo: ReturnType<typeof useEmojiBingo>["handleCancelEmojiBingo"];
  handlePlayAgainEmojiBingo: ReturnType<typeof useEmojiBingo>["handlePlayAgainEmojiBingo"];
  setDismissedEmojiBingoId: ReturnType<typeof useEmojiBingo>["setDismissedEmojiBingoId"];
}) {
  return (
    <>
      {emojiBingoGame && emojiBingoGame.status !== "canceled" && dismissedEmojiBingoId !== emojiBingoGame._id && (
        <EmojiBingoGame
          game={emojiBingoGame}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onJoinLobby={handleJoinEmojiBingoLobby}
          onLeaveLobby={handleLeaveEmojiBingoLobby}
          onStartGame={handleStartEmojiBingo}
          onUpdateSettings={handleUpdateEmojiBingoSettings}
          onRollEmoji={handleRollEmojiBingo}
          onMarkCell={handleMarkEmojiBingoCell}
          onClaimBingo={handleClaimEmojiBingo}
          onCancelGame={handleCancelEmojiBingo}
          onPlayAgain={handlePlayAgainEmojiBingo}
          onClose={() => setDismissedEmojiBingoId(emojiBingoGame._id)}
          onMinimize={() => setDismissedEmojiBingoId(emojiBingoGame._id)}
        />
      )}
    </>
  );
}
