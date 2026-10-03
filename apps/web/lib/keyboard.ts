import type { KeyboardEvent } from "react";

/**
 * True while an IME is composing. The Enter that confirms a Japanese conversion reports
 * `key: "Enter"` (Safari flags it only with keyCode 229), so submit handlers must ignore it.
 */
export function isImeComposing(e: KeyboardEvent): boolean {
  return e.nativeEvent.isComposing || e.keyCode === 229;
}
