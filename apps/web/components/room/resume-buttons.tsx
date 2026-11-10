"use client";

import { Icon } from "@/components/ui/icon";
import { dashCopy } from "@/components/dash/strings";
import type { useDash } from "@/hooks/games/use-dash";
import type { useEmojiBingo } from "@/hooks/games/use-emoji-bingo";
import type { useEmojiMatch } from "@/hooks/games/use-emoji-match";
import type { useTruthOrDare } from "@/hooks/games/use-truth-or-dare";
import { dashLive } from "@/lib/dash/on-screen";
import { t } from "@/lib/i18n";

export function ResumeButtons({
  truthOrDareGame,
  dismissedTruthOrDareId,
  setDismissedTruthOrDareId,
  lang,
  emojiMatchGame,
  emojiMatchOnScreen,
  dismissedEmojiMatchId,
  setDismissedEmojiMatchId,
  emojiBingoGame,
  dismissedEmojiBingoId,
  setDismissedEmojiBingoId,
  dashGame,
  dismissedDashId,
  setDismissedDashId,
}: {
  truthOrDareGame: ReturnType<typeof useTruthOrDare>["truthOrDareGame"];
  dismissedTruthOrDareId: ReturnType<typeof useTruthOrDare>["dismissedTruthOrDareId"];
  setDismissedTruthOrDareId: ReturnType<typeof useTruthOrDare>["setDismissedTruthOrDareId"];
  lang: string;
  emojiMatchGame: ReturnType<typeof useEmojiMatch>["emojiMatchGame"];
  emojiMatchOnScreen: ReturnType<typeof useEmojiMatch>["emojiMatchOnScreen"];
  dismissedEmojiMatchId: ReturnType<typeof useEmojiMatch>["dismissedEmojiMatchId"];
  setDismissedEmojiMatchId: ReturnType<typeof useEmojiMatch>["setDismissedEmojiMatchId"];
  emojiBingoGame: ReturnType<typeof useEmojiBingo>["emojiBingoGame"];
  dismissedEmojiBingoId: ReturnType<typeof useEmojiBingo>["dismissedEmojiBingoId"];
  setDismissedEmojiBingoId: ReturnType<typeof useEmojiBingo>["setDismissedEmojiBingoId"];
  dashGame?: ReturnType<typeof useDash>["dashGame"];
  dismissedDashId?: ReturnType<typeof useDash>["dismissedDashId"];
  setDismissedDashId?: ReturnType<typeof useDash>["setDismissedDashId"];
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 76,
        right: "max(12px, calc(50% - 248px))",
        zIndex: 150,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {truthOrDareGame && truthOrDareGame.status === "active" && dismissedTruthOrDareId === truthOrDareGame._id && (
        <button
          className="ec-resume"
          onClick={() => setDismissedTruthOrDareId(null)}
          aria-label={t("Resume Truth or Dare", lang)}
          style={{ background: "var(--pink)" }}
        >
          <Icon name="g-question" size={26} />
          {t("Resume", lang)}
        </button>
      )}
      {emojiMatchGame && emojiMatchOnScreen && dismissedEmojiMatchId === emojiMatchGame._id && (
        <button
          className="ec-resume"
          onClick={() => setDismissedEmojiMatchId(null)}
          aria-label={t("Resume Emoji Match", lang)}
          style={{ background: "var(--violet)" }}
        >
          <Icon name="ui-game" size={26} />
          {t("Resume", lang)}
        </button>
      )}
      {emojiBingoGame && emojiBingoGame.status !== "canceled" && dismissedEmojiBingoId === emojiBingoGame._id && (
        <button
          className="ec-resume"
          onClick={() => setDismissedEmojiBingoId(null)}
          aria-label={t("Resume Emoji Bingo", lang)}
          style={{ background: "var(--mint)" }}
        >
          <Icon name="g-clover" size={26} />
          {t("Resume", lang)}
        </button>
      )}
      {dashGame && dashLive(dashGame) && dismissedDashId === dashGame._id && (
        <button
          className="ec-resume"
          onClick={() => setDismissedDashId?.(null)}
          aria-label={dashCopy(lang).resume}
          style={{ background: "var(--yellow)" }}
        >
          <Icon name="o-shootingstar" size={26} />
          {t("Resume", lang)}
        </button>
      )}
    </div>
  );
}
