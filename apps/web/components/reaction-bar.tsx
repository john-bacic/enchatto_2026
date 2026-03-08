"use client";

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const SUPPORTED_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "👀"] as const;

interface ReactionBarProps {
  messageId: string;
  currentParticipantId: string;
  onToggle: (emoji: string, hasReacted: boolean) => void;
}

export function ReactionBar({
  messageId,
  currentParticipantId,
  onToggle,
}: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});

  const summaryList = useQuery(api.reactions.getReactionSummary, {
    messageId: messageId as Id<"messages">,
  });

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  // Position the picker using fixed positioning to avoid overflow clipping
  const adjustPosition = useCallback(() => {
    if (!pickerRef.current || !popoverRef.current) return;
    const triggerRect = pickerRef.current.getBoundingClientRect();
    const pickerWidth = popoverRef.current.offsetWidth;
    const padding = 8;

    // Center horizontally on the trigger button
    let left = triggerRect.left + triggerRect.width / 2 - pickerWidth / 2;

    // Clamp to viewport edges
    if (left < padding) {
      left = padding;
    } else if (left + pickerWidth > window.innerWidth - padding) {
      left = window.innerWidth - padding - pickerWidth;
    }

    const top = triggerRect.top - 4; // 4px gap above trigger

    setPickerStyle({
      position: "fixed" as const,
      left: `${left}px`,
      bottom: `${window.innerHeight - top}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (showPicker) {
      adjustPosition();
    }
  }, [showPicker, adjustPosition]);

  // Convert array format to a lookup map
  const reactionMap = new Map<string, { count: number; participantIds: string[] }>();
  if (Array.isArray(summaryList)) {
    for (const item of summaryList) {
      reactionMap.set(item.emoji, { count: item.count, participantIds: item.participantIds });
    }
  }

  const activeReactions = Array.from(reactionMap.entries()).filter(
    ([, data]) => data.count > 0
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
      {/* Existing reactions */}
      {activeReactions.map(([emoji, data]) => {
        const isMine = data.participantIds.includes(currentParticipantId);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji, isMine)}
            style={{
              fontSize: "0.8rem",
              padding: "0.15rem 0.45rem",
              borderRadius: "999px",
              background: isMine ? "var(--primary-light)" : "var(--bg)",
              border: isMine ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              transition: "all 0.12s ease",
            }}
          >
            <span>{emoji}</span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: isMine ? 600 : 400,
                color: isMine ? "var(--primary)" : "var(--muted)",
              }}
            >
              {data.count}
            </span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div style={{ position: "relative" }} ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            fontSize: "0.85rem",
            width: "1.6rem",
            height: "1.6rem",
            borderRadius: "999px",
            background: showPicker ? "var(--bg)" : "transparent",
            border: showPicker ? "1px solid var(--border)" : "none",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.12s ease",
          }}
          title="Add reaction"
        >
          +
        </button>

        {/* Picker */}
        {showPicker && (
          <div
            ref={popoverRef}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "0.4rem 0.5rem",
              display: "flex",
              gap: "0.1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              zIndex: 1000,
              ...pickerStyle,
            }}
          >
            {SUPPORTED_REACTIONS.map((emoji) => {
              const existing = reactionMap.get(emoji);
              const hasReacted = existing?.participantIds.includes(currentParticipantId) ?? false;
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    onToggle(emoji, hasReacted);
                    setShowPicker(false);
                  }}
                  style={{
                    fontSize: "1.2rem",
                    width: "2rem",
                    height: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: hasReacted ? "var(--primary-light)" : "transparent",
                    borderRadius: "6px",
                    transition: "background 0.1s ease",
                  }}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
