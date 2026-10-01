"use client";

import { useState, useEffect } from "react";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";

interface TypingParticipant {
  _id: string;
  nickname: string;
  avatar: { type: string; value: string };
  typingAction: "typing" | "drawing" | "voicing";
  drawingStartedAt?: number;
  timerSeconds?: number;
}

interface TypingIndicatorProps {
  participants: TypingParticipant[];
  lang?: string;
}

function actionLabel(action: string, lang?: string): string {
  if (action === "drawing") return t("is drawing", lang);
  if (action === "voicing") return t("is speaking", lang);
  return t("is typing", lang);
}

// Shown next to the avatar, which already names the person
function bubbleLabel(action: "drawing" | "voicing", lang?: string): string {
  return action === "drawing" ? t("Drawing…", lang) : t("Speaking…", lang);
}

function useDrawingCountdown(drawingStartedAt?: number, timeLimit = 20): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => {
    if (!drawingStartedAt) return null;
    return Math.max(0, timeLimit - Math.floor((Date.now() - drawingStartedAt) / 1000));
  });

  useEffect(() => {
    if (!drawingStartedAt) { setSecondsLeft(null); return; }
    const update = () => {
      const elapsed = Math.floor((Date.now() - drawingStartedAt) / 1000);
      setSecondsLeft(Math.max(0, timeLimit - elapsed));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [drawingStartedAt, timeLimit]);

  return secondsLeft;
}

function Who({ participant }: { participant: TypingParticipant }) {
  return (
    <div className="ec-who">
      <AvatarDisc id={participant.avatar.value} size={36} border={2.5} />
      <small>{participant.nickname}</small>
    </div>
  );
}

function DrawingIndicatorBubble({ participant, lang }: { participant: TypingParticipant; lang?: string }) {
  const countdown = useDrawingCountdown(participant.drawingStartedAt, participant.timerSeconds || 20);

  return (
    <div className="ec-typing">
      <Who participant={participant} />
      <div className="ec-typing-bubble">
        <Icon name="g-pencil" size={22} className="ec-pencil" />
        <span className="label">{bubbleLabel("drawing", lang)}</span>
        {countdown !== null && (
          <span
            className="ec-chunky"
            style={{ fontSize: 14, color: countdown <= 3 ? "var(--red)" : "var(--ink)" }}
          >
            {countdown}s
          </span>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ participants, lang }: TypingIndicatorProps) {
  if (participants.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {participants.map((p) => p.typingAction === "drawing" ? (
        <DrawingIndicatorBubble key={p._id} participant={p} lang={lang} />
      ) : (
        <div key={p._id} className="ec-typing">
          <Who participant={p} />
          <div className="ec-typing-bubble" aria-label={`${p.nickname} ${actionLabel(p.typingAction, lang)}`}>
            {p.typingAction === "voicing" ? (
              <>
                <span className="ec-voice-bars"><i /><i /><i /><i /></span>
                <span className="label">{bubbleLabel("voicing", lang)}</span>
              </>
            ) : (
              <span className="ec-dots"><i /><i /><i /></span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
