"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { isJapaneseText } from "@/components/message-item";
import { computeVibe, type VibeMessage } from "@/lib/vibe";

interface Floater {
  id: number;
  text: string;
  left: number;
}

export function useVibe({
  messages,
  messageList,
  participants,
  participantId,
  roomState,
}: {
  messages: FunctionReturnType<typeof api.messages.getRoomMessages> | undefined;
  messageList: FunctionReturnType<typeof api.messages.getRoomMessages>;
  participants: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"];
  participantId: string;
  roomState: FunctionReturnType<typeof api.rooms.getRoomState> | undefined;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const langOf = useCallback(
    (m: VibeMessage) => {
      if (m.kind === "text" && m.text) return isJapaneseText(m.text) ? "ja" : "en";
      return participants.find((p) => p._id === m.senderId)?.preferredLanguage ?? "en";
    },
    [participants]
  );
  const { vibe, combo, mult, hype, recentCount, switches } = computeVibe(
    messageList,
    langOf,
    Math.max(now, messageList[messageList.length - 1]?.createdAt ?? 0),
  );
  const [showVibeInfo, setShowVibeInfo] = useState(false);
  const vibeRef = useRef<HTMLButtonElement>(null);
  const closeVibeInfo = useCallback(() => setShowVibeInfo(false), []);

  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [cutIn, setCutIn] = useState<{ key: string; name: string; avatar: string } | null>(null);
  const [confettiKey, setConfettiKey] = useState<string | null>(null);
  const [logoHop, setLogoHop] = useState(0);
  const seenIdsRef = useRef<Set<string> | null>(null);
  const hypeRef = useRef(hype);
  hypeRef.current = hype;

  useEffect(() => {
    if (!messages) return;
    if (!seenIdsRef.current) {
      seenIdsRef.current = new Set(messages.map((m) => m._id));
      return;
    }
    const seen = seenIdsRef.current;
    const fresh = messages.filter((m) => !seen.has(m._id));
    if (fresh.length === 0) return;
    fresh.forEach((m) => seen.add(m._id));
    if (fresh.some((m) => m.kind !== "system")) setLogoHop((n) => n + 1);

    for (const m of fresh) {
      if (m.kind !== "system" || !m.text?.startsWith("join:")) continue;
      if (m.senderId === participantId || m.senderId === roomState?.room?.hostId) continue;
      const joiner = participants.find((p) => p._id === m.senderId);
      setCutIn({ key: m._id, name: m.text.slice("join:".length), avatar: joiner?.avatar.value ?? "" });
      if (hypeRef.current) setConfettiKey(m._id);
    }

    if (!hypeRef.current) return;
    const real = messages.filter((m) => m.kind !== "system");
    const added = fresh.filter((m) => m.kind !== "system");
    const items = added.map((m) => {
      const idx = real.findIndex((r) => r._id === m._id);
      const prev = idx > 0 ? real[idx - 1] : undefined;
      const switched = !!prev && langOf(prev) !== langOf(m);
      return { id: m.createdAt + Math.random(), text: switched ? "+32" : "+12", left: 18 + Math.random() * 64 };
    });
    if (items.length === 0) return;
    setFloaters((f) => [...f, ...items]);
    const ids = new Set(items.map((i) => i.id));
    setTimeout(() => setFloaters((f) => f.filter((x) => !ids.has(x.id))), 1400);
  }, [messages, participantId, participants, roomState?.room?.hostId, langOf]);

  return { vibe, combo, mult, hype, recentCount, switches, showVibeInfo, setShowVibeInfo, vibeRef, closeVibeInfo, floaters, cutIn, confettiKey, logoHop };
}
