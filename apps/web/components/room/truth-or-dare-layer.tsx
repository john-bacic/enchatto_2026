"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TruthOrDareGame } from "@/components/truth-or-dare-game";
import type { useTruthOrDare } from "@/hooks/games/use-truth-or-dare";
import type { useTypingAction } from "@/hooks/use-typing-action";

export function TruthOrDareLayer({
  truthOrDareGame,
  dismissedTruthOrDareId,
  participantId,
  me,
  lang,
  handleSubmitTruthOrDareChoice,
  handleSubmitTruthOrDareResponse,
  handleAdvanceTruthOrDareTurn,
  handleSkipTruthOrDareTurn,
  handleEndTruthOrDare,
  handleSubmitTruthOrDareRating,
  setTypingAction,
  setDismissedTruthOrDareId,
}: {
  truthOrDareGame: ReturnType<typeof useTruthOrDare>["truthOrDareGame"];
  dismissedTruthOrDareId: ReturnType<typeof useTruthOrDare>["dismissedTruthOrDareId"];
  participantId: string;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
  handleSubmitTruthOrDareChoice: ReturnType<typeof useTruthOrDare>["handleSubmitTruthOrDareChoice"];
  handleSubmitTruthOrDareResponse: ReturnType<typeof useTruthOrDare>["handleSubmitTruthOrDareResponse"];
  handleAdvanceTruthOrDareTurn: ReturnType<typeof useTruthOrDare>["handleAdvanceTruthOrDareTurn"];
  handleSkipTruthOrDareTurn: ReturnType<typeof useTruthOrDare>["handleSkipTruthOrDareTurn"];
  handleEndTruthOrDare: ReturnType<typeof useTruthOrDare>["handleEndTruthOrDare"];
  handleSubmitTruthOrDareRating: ReturnType<typeof useTruthOrDare>["handleSubmitTruthOrDareRating"];
  setTypingAction: ReturnType<typeof useTypingAction>["setTypingAction"];
  setDismissedTruthOrDareId: ReturnType<typeof useTruthOrDare>["setDismissedTruthOrDareId"];
}) {
  return (
    <>
      {truthOrDareGame && truthOrDareGame.status === "active" && dismissedTruthOrDareId !== truthOrDareGame._id && (
        <TruthOrDareGame
          game={truthOrDareGame}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onSubmitChoice={handleSubmitTruthOrDareChoice}
          onSubmitResponse={handleSubmitTruthOrDareResponse}
          onAdvanceTurn={handleAdvanceTruthOrDareTurn}
          onSkipTurn={handleSkipTruthOrDareTurn}
          onEndGame={handleEndTruthOrDare}
          onSubmitRating={handleSubmitTruthOrDareRating}
          onDrawingStateChange={(isDrawing) => {
            if (participantId) {
              setTypingAction({
                participantId: participantId as Id<"participants">,
                action: isDrawing ? "drawing" : undefined,
              }).catch(() => {});
            }
          }}
          onClose={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
          onMinimize={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
        />
      )}
    </>
  );
}
