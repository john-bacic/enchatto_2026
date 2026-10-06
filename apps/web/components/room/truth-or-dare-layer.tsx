"use client";

import type { CSSProperties } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { TruthOrDareGame } from "@/components/truth-or-dare-game";
import type { useTruthOrDare } from "@/hooks/games/use-truth-or-dare";
import type { useTypingAction } from "@/hooks/use-typing-action";
import { t } from "@/lib/i18n";

// The look of Word Rush's toast (.wr-toast in word-rush.css), over Truth or Dare's own screen and over the game
// picker. It takes no taps, so that a button under it can be tapped again while it shows
const failureToast: CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: "calc(110px + env(safe-area-inset-bottom))",
  zIndex: 240,
  translate: "-50% 0",
  maxWidth: "calc(100vw - 32px)",
  padding: "8px 16px",
  border: "3px solid var(--ink)",
  borderRadius: 16,
  background: "var(--red)",
  color: "#fff",
  boxShadow: "0 4px 0 var(--ink)",
  fontWeight: 900,
  fontSize: 14,
  textAlign: "center",
  pointerEvents: "none",
  animation: "ec-pop 0.3s cubic-bezier(0.3, 1.6, 0.5, 1) both",
};

export function TruthOrDareLayer({
  truthOrDareGame,
  truthOrDareFailure,
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
  handleDrawingStateChange,
  setDismissedTruthOrDareId,
}: {
  truthOrDareGame: ReturnType<typeof useTruthOrDare>["truthOrDareGame"];
  truthOrDareFailure: ReturnType<typeof useTruthOrDare>["truthOrDareFailure"];
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
  handleDrawingStateChange: ReturnType<typeof useTypingAction>["handleDrawingStateChange"];
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
          onDrawingStateChange={handleDrawingStateChange}
          onClose={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
          onMinimize={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
        />
      )}
      {/* A failed action, told for a few seconds. Starting a game can fail too, so this does not wait for a game */}
      {truthOrDareFailure !== null && (
        <div key={truthOrDareFailure} role="status" style={failureToast}>
          {t("Something went wrong. Try again.", lang)}
        </div>
      )}
    </>
  );
}
