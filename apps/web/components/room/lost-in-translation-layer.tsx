"use client";

import type { Dispatch, SetStateAction } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { GameReplayModal } from "@/components/game-replay-modal";
import { GameTaskOverlay } from "@/components/game-task-overlay";
import type { useLostInTranslation } from "@/hooks/games/use-lost-in-translation";
import { teamInSession } from "@/lib/game-teams";

// Lost in Translation draws two things over the room, and the room page puts the game picker between them. The
// picker's backdrop and the replay's share a class and its z-index, so the one that stands later in the document
// is on top: the replay, which opens by itself when a game ends, covers an open picker. One component for both
// would move one of them to the other side of the picker

export function LostInTranslationTask({
  myActiveStep,
  dismissedGameStepId,
  handleSubmitGameStep,
  setDismissedGameStepId,
  me,
  cancelGameMutation,
  roomId,
  participantId,
  lang,
  latestGameSession,
}: {
  myActiveStep: ReturnType<typeof useLostInTranslation>["myActiveStep"];
  dismissedGameStepId: ReturnType<typeof useLostInTranslation>["dismissedGameStepId"];
  handleSubmitGameStep: ReturnType<typeof useLostInTranslation>["handleSubmitGameStep"];
  setDismissedGameStepId: ReturnType<typeof useLostInTranslation>["setDismissedGameStepId"];
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  cancelGameMutation: ReturnType<typeof useLostInTranslation>["cancelGameMutation"];
  roomId: string;
  participantId: string;
  lang: string;
  latestGameSession: ReturnType<typeof useLostInTranslation>["latestGameSession"];
}) {
  return (
    <GameTaskOverlay
      step={myActiveStep && myActiveStep._id !== dismissedGameStepId ? myActiveStep : null}
      onSubmit={handleSubmitGameStep}
      onQuit={async (stepId) => {
        setDismissedGameStepId(stepId);
        if (me?.role === "host") {
          try {
            await cancelGameMutation({
              roomId: roomId as Id<"rooms">,
              participantId: participantId as Id<"participants">,
            });
          } catch (err) {
            console.error("Failed to cancel game:", err);
          }
        }
      }}
      lang={lang}
      team={teamInSession(latestGameSession?.teams, participantId)}
    />
  );
}

export function LostInTranslationReplay({
  showGameReplay,
  gameReplay,
  me,
  latestGameSession,
  handleStartGame,
  setShowGameReplay,
  lang,
  participantId,
}: {
  showGameReplay: boolean;
  gameReplay: ReturnType<typeof useLostInTranslation>["gameReplay"];
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  latestGameSession: ReturnType<typeof useLostInTranslation>["latestGameSession"];
  handleStartGame: ReturnType<typeof useLostInTranslation>["handleStartGame"];
  setShowGameReplay: Dispatch<SetStateAction<boolean>>;
  lang: string;
  participantId: string;
}) {
  return (
    <GameReplayModal
      isOpen={showGameReplay}
      replay={gameReplay ?? null}
      isHost={me?.role === "host"}
      prevTimerSeconds={typeof latestGameSession?.timerEnabled === "number"
        ? latestGameSession.timerEnabled
        : (latestGameSession?.timerEnabled !== false ? 20 : 0)}
      onNextLevel={(timerSeconds) => {
        const nextLevel = (latestGameSession?.level as number ?? 1) + 1;
        handleStartGame("lost-in-translation", nextLevel, timerSeconds);
      }}
      onClose={() => setShowGameReplay(false)}
      lang={lang}
      meId={participantId}
    />
  );
}
