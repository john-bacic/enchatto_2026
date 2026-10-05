import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { useEmojiBingo } from "@/hooks/games/use-emoji-bingo";
import type { useEmojiMatch } from "@/hooks/games/use-emoji-match";
import type { useLostInTranslation } from "@/hooks/games/use-lost-in-translation";
import type { useTruthOrDare } from "@/hooks/games/use-truth-or-dare";
import type { useWordRushStarter } from "@/hooks/games/use-word-rush-starter";
import { t } from "@/lib/i18n";

/**
 * What the room's End Game button needs: whether this is the host with a game on, and the function that ends one
 * once the host has confirmed. It ends the first of these that is on: Truth or Dare, Emoji Bingo, Emoji Match,
 * Word Rush; with none of them on it cancels Lost in Translation. Anyone but the host gets no function.
 */
export function endGameRule({
  wordRushGame,
  activeGameSession,
  emojiMatchGame,
  emojiBingoGame,
  truthOrDareGame,
  me,
  lang,
  endTruthOrDare,
  participantId,
  cancelEmojiBingo,
  cancelEmojiMatch,
  cancelWordRush,
  cancelGameMutation,
  roomId,
}: {
  wordRushGame: ReturnType<typeof useWordRushStarter>["wordRushGame"];
  activeGameSession: ReturnType<typeof useLostInTranslation>["activeGameSession"];
  emojiMatchGame: ReturnType<typeof useEmojiMatch>["emojiMatchGame"];
  emojiBingoGame: ReturnType<typeof useEmojiBingo>["emojiBingoGame"];
  truthOrDareGame: ReturnType<typeof useTruthOrDare>["truthOrDareGame"];
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
  endTruthOrDare: ReturnType<typeof useTruthOrDare>["endTruthOrDare"];
  participantId: string;
  cancelEmojiBingo: ReturnType<typeof useEmojiBingo>["cancelEmojiBingo"];
  cancelEmojiMatch: ReturnType<typeof useEmojiMatch>["cancelEmojiMatch"];
  cancelWordRush: ReturnType<typeof useWordRushStarter>["cancelWordRush"];
  cancelGameMutation: ReturnType<typeof useLostInTranslation>["cancelGameMutation"];
  roomId: string;
}) {
  const wordRushLive = wordRushGame != null && (wordRushGame.status === "lobby" || wordRushGame.status === "active");
  const isGameActive = (activeGameSession != null || wordRushLive || (emojiMatchGame != null && emojiMatchGame.status !== "completed" && emojiMatchGame.status !== "canceled") || (emojiBingoGame != null && !["completed", "canceled"].includes(emojiBingoGame.status)) || (truthOrDareGame != null && truthOrDareGame.status === "active")) && me?.role === "host";
  const onEndGame = me?.role === "host" ? async () => {
    if (confirm(t("This will end the game for all players and show results.", lang))) {
      if (truthOrDareGame && truthOrDareGame.status === "active") {
        await endTruthOrDare({ gameId: truthOrDareGame._id as Id<"truthOrDareGames">, participantId: participantId as Id<"participants"> });
      } else if (emojiBingoGame && !["completed", "canceled"].includes(emojiBingoGame.status)) {
        await cancelEmojiBingo({ gameId: emojiBingoGame._id as Id<"emojiBingoGames">, participantId: participantId as Id<"participants"> });
      } else if (emojiMatchGame && emojiMatchGame.status !== "completed" && emojiMatchGame.status !== "canceled") {
        await cancelEmojiMatch({ gameId: emojiMatchGame._id as Id<"emojiMatchGames">, participantId: participantId as Id<"participants"> });
      } else if (wordRushGame && wordRushLive) {
        try {
          await cancelWordRush({ gameId: wordRushGame._id, participantId: participantId as Id<"participants"> });
        } catch (err) {
          console.error("Failed to end Word Rush:", err);
        }
      } else {
        await cancelGameMutation({ roomId: roomId as Id<"rooms">, participantId: participantId as Id<"participants"> });
      }
    }
  } : undefined;
  return { isGameActive, onEndGame };
}
