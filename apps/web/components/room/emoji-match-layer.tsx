"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { EmojiMatchGame } from "@/components/emoji-match-game";
import type { useEmojiMatch } from "@/hooks/games/use-emoji-match";

export function EmojiMatchLayer({
  emojiMatchGame,
  emojiMatchOnScreen,
  dismissedEmojiMatchId,
  participants,
  participantId,
  me,
  lang,
  handleJoinEmojiMatchLobby,
  handleLeaveEmojiMatchLobby,
  handleStartEmojiMatch,
  handleFlipEmojiMatchCard,
  handleResolveEmojiMatchMismatch,
  handleTimeoutEmojiMatchTurn,
  handleCancelEmojiMatch,
  handlePlayAgainEmojiMatch,
  setDismissedEmojiMatchId,
}: {
  emojiMatchGame: ReturnType<typeof useEmojiMatch>["emojiMatchGame"];
  emojiMatchOnScreen: ReturnType<typeof useEmojiMatch>["emojiMatchOnScreen"];
  dismissedEmojiMatchId: ReturnType<typeof useEmojiMatch>["dismissedEmojiMatchId"];
  participants: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"];
  participantId: string;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
  handleJoinEmojiMatchLobby: ReturnType<typeof useEmojiMatch>["handleJoinEmojiMatchLobby"];
  handleLeaveEmojiMatchLobby: ReturnType<typeof useEmojiMatch>["handleLeaveEmojiMatchLobby"];
  handleStartEmojiMatch: ReturnType<typeof useEmojiMatch>["handleStartEmojiMatch"];
  handleFlipEmojiMatchCard: ReturnType<typeof useEmojiMatch>["handleFlipEmojiMatchCard"];
  handleResolveEmojiMatchMismatch: ReturnType<typeof useEmojiMatch>["handleResolveEmojiMatchMismatch"];
  handleTimeoutEmojiMatchTurn: ReturnType<typeof useEmojiMatch>["handleTimeoutEmojiMatchTurn"];
  handleCancelEmojiMatch: ReturnType<typeof useEmojiMatch>["handleCancelEmojiMatch"];
  handlePlayAgainEmojiMatch: ReturnType<typeof useEmojiMatch>["handlePlayAgainEmojiMatch"];
  setDismissedEmojiMatchId: ReturnType<typeof useEmojiMatch>["setDismissedEmojiMatchId"];
}) {
  return (
    <>
      {emojiMatchGame && emojiMatchOnScreen && dismissedEmojiMatchId !== emojiMatchGame._id && (
        <EmojiMatchGame
          game={emojiMatchGame}
          participants={participants}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onJoinLobby={handleJoinEmojiMatchLobby}
          onLeaveLobby={handleLeaveEmojiMatchLobby}
          onStartGame={handleStartEmojiMatch}
          onFlipCard={handleFlipEmojiMatchCard}
          onResolveMismatch={handleResolveEmojiMatchMismatch}
          onTimeoutTurn={handleTimeoutEmojiMatchTurn}
          onCancelGame={handleCancelEmojiMatch}
          onPlayAgain={handlePlayAgainEmojiMatch}
          onClose={() => setDismissedEmojiMatchId(emojiMatchGame._id)}
          onMinimize={() => setDismissedEmojiMatchId(emojiMatchGame._id)}
        />
      )}
    </>
  );
}
