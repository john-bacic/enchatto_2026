"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

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
  const summaryList = useQuery(api.reactions.getReactionSummary, {
    messageId: messageId as Id<"messages">,
  });

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
    </div>
  );
}
