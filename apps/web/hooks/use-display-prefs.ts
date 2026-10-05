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

export function useDisplayPrefs(participantId: string) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [chatSize, setChatSize] = useState<ChatSize>("s");
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

  return { showEnglish, showJapanese, showRomaji, chatSize, toggleDisplay, pickChatSize };
}
