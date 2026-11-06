"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthedMutation } from "@/lib/convex";

export const CHAT_SIZES = [
  { key: "s", scale: 1, glyph: 13 },
  { key: "m", scale: 1.15, glyph: 16 },
  { key: "l", scale: 1.3, glyph: 19 },
] as const;
export type ChatSize = (typeof CHAT_SIZES)[number]["key"];
const CHAT_SIZE_KEY = "enchatto_chatTextSize";
const DISPLAY_KEY = "enchatto_displaySettings";
type DisplayPrefs = { showEnglish: boolean; showJapanese: boolean; showRomaji: boolean };
const SUGGEST_KEY = "enchatto_suggestPrefs";
/**
 * The things to say over the message box: whether they are shown, and whether each has the other language under her
 * own. Until she says, a Japanese reader has the English under hers and an English reader her English alone
 */
type SuggestPrefs = { show: boolean; under?: boolean };

function readSuggestPrefs(): SuggestPrefs | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SUGGEST_KEY) ?? "null") as Partial<SuggestPrefs> | null;
    if (typeof saved?.show === "boolean") {
      return typeof saved.under === "boolean" ? { show: saved.show, under: saved.under } : { show: saved.show };
    }
  } catch {}
  return null;
}

function readDisplayPrefs(): DisplayPrefs | null {
  try {
    const saved = JSON.parse(localStorage.getItem(DISPLAY_KEY) ?? "null") as Partial<DisplayPrefs> | null;
    if (
      typeof saved?.showEnglish === "boolean" &&
      typeof saved.showJapanese === "boolean" &&
      typeof saved.showRomaji === "boolean"
    ) {
      return { showEnglish: saved.showEnglish, showJapanese: saved.showJapanese, showRomaji: saved.showRomaji };
    }
  } catch {}
  return null;
}

/** `lang` is her language: "ja", or English for anything else */
export function useDisplayPrefs(participantId: string, lang: string) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [chatSize, setChatSize] = useState<ChatSize>("s");
  const [suggestPrefs, setSuggestPrefs] = useState<SuggestPrefs>({ show: true });
  const suggestUnder = suggestPrefs.under ?? lang === "ja";
  const updateDisplaySettings = useAuthedMutation(api.participants.updateDisplaySettings);

  // Set once saved prefs have been read, so the first render's defaults never reach Convex
  const initializedRef = useRef(false);

  // Sync display settings to Convex whenever toggles change
  useEffect(() => {
    if (!participantId || !initializedRef.current) return;
    updateDisplaySettings({
      participantId: participantId as Id<"participants">,
      displaySettings: { showEnglish, showJapanese, showRomaji },
    }).catch(() => {});
  }, [showEnglish, showJapanese, showRomaji, participantId, updateDisplaySettings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_SIZE_KEY);
      if (CHAT_SIZES.some((s) => s.key === saved)) setChatSize(saved as ChatSize);
    } catch {
      // storage blocked
    }
    const prefs = readDisplayPrefs();
    initializedRef.current = true;
    if (prefs) {
      setShowEnglish(prefs.showEnglish);
      setShowJapanese(prefs.showJapanese);
      setShowRomaji(prefs.showRomaji);
    }
    const suggest = readSuggestPrefs();
    if (suggest) setSuggestPrefs(suggest);
  }, []);
  const toggleDisplay = useCallback(
    (key: keyof DisplayPrefs) => {
      const current = { showEnglish, showJapanese, showRomaji };
      const next = { ...current, [key]: !current[key] };
      setShowEnglish(next.showEnglish);
      setShowJapanese(next.showJapanese);
      setShowRomaji(next.showRomaji);
      try {
        localStorage.setItem(DISPLAY_KEY, JSON.stringify(next));
      } catch {
        // storage blocked
      }
    },
    [showEnglish, showJapanese, showRomaji],
  );
  const pickChatSize = useCallback((size: ChatSize) => {
    setChatSize(size);
    try {
      localStorage.setItem(CHAT_SIZE_KEY, size);
    } catch {
      // storage blocked
    }
  }, []);
  // Kept in this browser alone: the room's other people and its phones have no use for them
  const toggleSuggestPref = useCallback(
    (key: keyof SuggestPrefs) => {
      const current = { show: suggestPrefs.show, under: suggestUnder };
      const next = { ...suggestPrefs, [key]: !current[key] };
      setSuggestPrefs(next);
      try {
        localStorage.setItem(SUGGEST_KEY, JSON.stringify(next));
      } catch {
        // storage blocked
      }
    },
    [suggestPrefs, suggestUnder],
  );

  return {
    showEnglish,
    showJapanese,
    showRomaji,
    chatSize,
    toggleDisplay,
    pickChatSize,
    showSuggestions: suggestPrefs.show,
    suggestUnder,
    toggleSuggestPref,
  };
}
