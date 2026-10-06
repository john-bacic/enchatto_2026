"use client";

import { EmojiArt } from "@/components/ui/icon";
import { iconForEmoji } from "@/lib/icons";

interface SuggestionChipsProps {
  suggestions: string[];
  /** Called with the suggestion a tap is on. Without it a tap does nothing */
  onSelect?: (text: string) => void;
}

const CHIP_TONES = ["var(--pink-soft)", "var(--blue-soft)", "var(--mint-soft)", "var(--yellow-soft)"];

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="ec-chips">
      {suggestions.slice(0, 4).map((suggestion, i) => (
        <button
          key={i}
          // A chip does not take the focus: a message field that has it keeps it, and a phone's keyboard stays up
          // under the tap instead of closing and moving the page before the click lands
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect?.(suggestion)}
          style={{ "--c": CHIP_TONES[i % CHIP_TONES.length], animationDelay: `${i * 0.06}s` } as React.CSSProperties}
        >
          {iconForEmoji(suggestion.trim()) ? <EmojiArt emoji={suggestion.trim()} size={22} /> : suggestion}
        </button>
      ))}
    </div>
  );
}
