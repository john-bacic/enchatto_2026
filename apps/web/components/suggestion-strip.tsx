"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { EmojiArt, Icon } from "@/components/ui/icon";
import { iconForEmoji } from "@/lib/icons";
import { t } from "@/lib/i18n";
import { startersFor, type Chip, type StarterMessage, type StarterPerson } from "@/lib/conversation-starters";

const CHIP_TONES = ["var(--pink-soft)", "var(--blue-soft)", "var(--mint-soft)", "var(--yellow-soft)"];

interface SuggestionStripProps {
  /** For the replies the host's phone wrote, which come first */
  roomId: Id<"rooms">;
  messages: readonly StarterMessage[];
  /** This tab's messages that wait to be sent, after the room's */
  queued: readonly StarterMessage[];
  people: readonly StarterPerson[];
  meId: string;
  hostId?: string;
  /** Her language: "ja", or English for anything else. Each chip is in it, and a tap puts it in the box */
  lang: string;
  /** The other language under each chip, and its romaji under that for an English reader */
  under: boolean;
  showRomaji: boolean;
  /** The message she is replying to: the chips answer it */
  replyTo: StarterMessage | null;
  gameOn: boolean;
  /** A tap on a chip, with its words */
  onPick: (text: string) => void;
  /** A tap on the chip that offers a game. Without it there is no such chip */
  onGame?: () => void;
}

/** What a chip says, the line under it, each with its language, and how to read that line out */
function faceOf(chip: Chip, lang: string, under: boolean, showRomaji: boolean) {
  if (chip.kind === "game") return { say: t("Play a game?", lang) };
  if (!chip.phrase) return { say: chip.text ?? "" };
  const { en, ja, romaji } = chip.phrase;
  if (!under) return lang === "ja" ? { say: ja, sayLang: "ja" } : { say: en, sayLang: "en" };
  if (lang === "ja") return { say: ja, sayLang: "ja", sub: en, subLang: "en" };
  return { say: en, sayLang: "en", sub: ja, subLang: "ja", romaji: showRomaji ? romaji : undefined };
}

/**
 * The things to say over the message box (lib/conversation-starters.ts picks them). Keeps its own clock and its
 * own subscription, so that a silence turning the replies into topics, or replies the host's phone wrote, draw
 * the strip again and not the page
 */
export const SuggestionStrip = memo(function SuggestionStrip({
  roomId,
  messages,
  queued,
  people,
  meId,
  hostId,
  lang,
  under,
  showRomaji,
  replyTo,
  gameOn,
  onPick,
  onGame,
}: SuggestionStripProps) {
  const [woken, wake] = useState(0);
  const [shuffle, setShuffle] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const written = useQuery(api.messages.getSuggestedReplies, { roomId });
  const ideas = useMemo(() => Object.fromEntries((written ?? []).map((row) => [row.messageId, row.replies])), [written]);

  const now = Date.now();
  const { starters, wakeAt } = startersFor({
    messages: queued.length > 0 ? [...messages, ...queued] : messages,
    people,
    meId,
    hostId,
    replyTo,
    now,
    month: new Date(now).getMonth() + 1,
    gameOn,
    shuffle,
    ideas,
  });

  // Draws the strip again when the clock alone changes what it shows. Set again on waking, in case the timer
  // fired a moment early and nothing changed
  useEffect(() => {
    if (wakeAt === null) return;
    const timer = setTimeout(() => wake((n) => n + 1), Math.max(0, wakeAt - Date.now()));
    return () => clearTimeout(timer);
  }, [wakeAt, woken]);

  const chips = starters?.chips.filter((chip) => chip.kind !== "game" || onGame) ?? [];
  if (!starters || chips.length === 0 || starters.key === dismissed) return null;

  return (
    <div className="ec-suggest">
      <div className="ec-suggest-row" role="group" aria-label={t("Things to say", lang)}>
        {chips.map((chip, i) => {
          const { say, sayLang, sub, subLang, romaji } = faceOf(chip, lang, under, showRomaji);
          return (
            <button
              key={chip.key}
              type="button"
              className={`ec-suggest-chip${chip.kind === "game" ? " game" : ""}`}
              // A chip does not take the focus: a message field that has it keeps it, and a phone's keyboard stays
              // up under the tap instead of closing and moving the page before the click lands
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => (chip.kind === "game" ? onGame?.() : onPick(say))}
              style={{ "--c": CHIP_TONES[i % CHIP_TONES.length], animationDelay: `${i * 50}ms` } as React.CSSProperties}
            >
              {chip.kind === "game" && <Icon name="ui-game" size={20} />}
              <span className="say" lang={sayLang}>
                {iconForEmoji(say.trim()) ? <EmojiArt emoji={say.trim()} size={22} /> : say}
              </span>
              {sub && (
                <span className="sub" lang={subLang}>
                  {sub}
                </span>
              )}
              {romaji && <span className="romaji">{romaji}</span>}
            </button>
          );
        })}
      </div>
      {chips.some((chip) => chip.kind === "topic") && (
        <button
          type="button"
          className="ec-suggest-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShuffle((n) => n + 1)}
          aria-label={t("Other topics", lang)}
        >
          <EmojiArt emoji="🎲" size={20} />
        </button>
      )}
      <button
        type="button"
        className="ec-suggest-btn"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setDismissed(starters.key)}
        aria-label={t("Hide suggestions", lang)}
      >
        <svg viewBox="0 0 10 10" aria-hidden>
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
        </svg>
      </button>
    </div>
  );
});
