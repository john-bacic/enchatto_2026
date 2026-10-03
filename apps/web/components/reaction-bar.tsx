"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { EmojiArt } from "@/components/ui/icon";
import { isQueuedMessageId } from "@/lib/types";

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
  const summaryList = useQuery(
    api.reactions.getReactionSummary,
    isQueuedMessageId(messageId) ? "skip" : { messageId: messageId as Id<"messages"> }
  );

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

  if (activeReactions.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
      {activeReactions.map(([emoji, data]) => {
        const isMine = data.participantIds.includes(currentParticipantId);
        return (
          <button key={emoji} className={`ec-react${isMine ? " mine" : ""}`} onClick={() => onToggle(emoji, isMine)}>
            <EmojiArt emoji={emoji} size={18} />
            <b>{data.count}</b>
          </button>
        );
      })}
    </div>
  );
}
