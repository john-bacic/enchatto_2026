"use client";

import { Suspense, useState, useCallback, useEffect, useRef, Component, type ReactNode } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ParticipantList } from "@/components/participant-list";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { getAvatarById } from "@/lib/types";
import { t } from "@/lib/i18n";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const participantId = searchParams.get("pid") ?? "";

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);

  // Real-time subscriptions
  const roomState = useQuery(api.rooms.getRoomState, {
    roomId: roomId as Id<"rooms">,
  });
  const messages = useQuery(api.messages.getRoomMessages, {
    roomId: roomId as Id<"rooms">,
  });

  // Mutations
  const sendTextMessage = useMutation(api.messages.sendTextMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendImageMessage = useMutation(api.messages.sendImageMessage);
  const setParticipantOnline = useMutation(api.participants.setParticipantOnline);

  // Mark online on mount, heartbeat, offline on leave
  useEffect(() => {
    if (!participantId) return;
    const pid = participantId as Id<"participants">;

    // Mark online
    setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});

    // Heartbeat every 15s to keep lastSeenAt fresh
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});
      }
    }, 15_000);

    // Fire-and-forget "away" on page close via sendBeacon + fetch keepalive
    const markAwayBeacon = () => {
      const url = `https://helpful-bulldog-420.convex.cloud/api/mutation`;
      const body = JSON.stringify({
        path: "participants:setParticipantOnline",
        args: { participantId, online: true, presence: "away" },
      });
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };

    // Mark away/online on tab visibility change
    const handleVisibility = () => {
      if (document.hidden) {
        setParticipantOnline({ participantId: pid, online: true, presence: "away" }).catch(() => {});
      } else {
        setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", markAwayBeacon);
    window.addEventListener("pagehide", markAwayBeacon);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", markAwayBeacon);
      window.removeEventListener("pagehide", markAwayBeacon);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [participantId, setParticipantOnline]);
  const sendDrawingMessage = useMutation(api.messages.sendDrawingMessage);
  const addReaction = useMutation(api.reactions.addReaction);
  const removeReaction = useMutation(api.reactions.removeReaction);
  const setTypingAction = useMutation(api.participants.setTypingAction);

  const participants = roomState?.participants ?? [];
  const messageList = messages ?? [];

  const me = participants.find((p) => p._id === participantId);
  const lang = me?.preferredLanguage ?? "ja";

  const replyMessage = replyTo
    ? messageList.find((m) => m._id === replyTo)
    : null;

  const handleSend = useCallback(
    async (text: string) => {
      if (!participantId) return;
      try {
        await sendTextMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          text,
          replyToId: replyTo
            ? (replyTo as Id<"messages">)
            : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [sendTextMessage, roomId, participantId, replyTo]
  );

  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string, hasReacted: boolean) => {
      if (!participantId) return;
      try {
        if (hasReacted) {
          await removeReaction({
            messageId: messageId as Id<"messages">,
            participantId: participantId as Id<"participants">,
            emoji,
          });
        } else {
          await addReaction({
            messageId: messageId as Id<"messages">,
            participantId: participantId as Id<"participants">,
            emoji,
          });
        }
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
      }
    },
    [addReaction, removeReaction, participantId]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      if (!participantId) return;
      try {
        // Upload to Convex file storage
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        await sendImageMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          storageId,
          replyToId: replyTo ? (replyTo as Id<"messages">) : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send image:", err);
      }
    },
    [generateUploadUrl, sendImageMessage, roomId, participantId, replyTo]
  );

  const handleSendDrawing = useCallback(
    async (dataUrl: string) => {
      if (!participantId) return;
      // TODO: Upload data URL to storage and get permanent URL
      try {
        await sendDrawingMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          mediaUrl: dataUrl,
          replyToId: replyTo ? (replyTo as Id<"messages">) : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send drawing:", err);
      }
    },
    [sendDrawingMessage, roomId, participantId, replyTo]
  );

  const lastTypingAction = useRef<string | null>(null);
  const handleTypingChange = useCallback(
    (action: "typing" | "drawing" | "voicing" | null) => {
      if (!participantId) return;
      const key = action ?? "null";
      if (lastTypingAction.current === key) return;
      lastTypingAction.current = key;
      setTypingAction({
        participantId: participantId as Id<"participants">,
        action: action ?? undefined,
      }).catch(() => {});
    },
    [setTypingAction, participantId]
  );

  const typingParticipants = participants
    .filter((p) => p._id !== participantId && (p as any).typingAction)
    .map((p) => ({
      _id: p._id,
      nickname: p.nickname,
      avatar: p.avatar,
      typingAction: (p as any).typingAction as "typing" | "drawing" | "voicing",
    }));

  const handleReply = (messageId: string) => {
    setReplyTo(messageId);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleLeave = async () => {
    if (!participantId) return;
    try {
      await setParticipantOnline({
        participantId: participantId as Id<"participants">,
        online: false,
      });
    } catch {}
    router.push("/");
  };

  // Loading state
  if (roomState === undefined || messages === undefined) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          color: "var(--muted)",
        }}
      >
        {t("Loading room...", lang)}
      </div>
    );
  }

  // Room not found
  if (roomState === null) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t("Room not found", lang)}</h1>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          {t("This room may have been closed.", lang)}
        </p>
      </div>
    );
  }

  // No participant ID — user needs to join first
  if (!participantId) {
    const joinCode = roomState.room.joinCode;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t("Join Required", lang)}</h1>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          {t("You need to join this room first.", lang)}
        </p>
        <a
          href={`/join/${joinCode}`}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {t("Join Room", lang)}
        </a>
      </div>
    );
  }

  const isClosed = roomState.room.status === "closed";

  const otherParticipants = participants.filter((p) => p._id !== participantId);
  const activeOthers = otherParticipants.filter((p) => (p as any).online);
  const onlineCount = activeOthers.filter((p) => ((p as any).presence ?? "online") === "online").length;
  const awayCount = activeOthers.length - onlineCount;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {(() => {
            if (me) {
              const av = getAvatarById(me.avatar.value);
              return (
                <div
                  onClick={() => setShowDisplaySettings(true)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: av.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  {av.emoji}
                </div>
              );
            }
            return null;
          })()}
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{t("Enchatto", lang)}</h1>
            {isClosed ? (
              <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                {t("Room closed", lang)}
              </span>
            ) : (
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {onlineCount} {t("online", lang)}{awayCount > 0 ? `, ${awayCount} ${t("away", lang)}` : ""}
              </span>
            )}
          </div>
        </div>
        <ParticipantList
          participants={participants.filter((p) => p._id !== participantId)}
          currentParticipantId={participantId}
          onLeave={() => setShowLeaveConfirm(true)}
          lang={lang}
        />
      </header>

      {/* Messages */}
      <MessageErrorBoundary lang={lang}>
        <MessageList
          messages={messageList}
          participants={participants}
          currentParticipantId={participantId}
          preferredLanguage={lang}
          onReply={handleReply}
          onToggleReaction={handleToggleReaction}
          typingParticipants={typingParticipants}
          lang={lang}
          showEnglish={showEnglish}
          showJapanese={showJapanese}
          showRomaji={showRomaji}
        />
      </MessageErrorBoundary>

      {/* Input */}
      {!isClosed ? (
        <MessageInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendDrawing={handleSendDrawing}
          replyTo={replyMessage ?? null}
          onCancelReply={handleCancelReply}
          onTypingChange={handleTypingChange}
          lang={lang}
        />
      ) : (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "0.85rem",
          }}
        >
          {t("This room has been closed by the host.", lang)}
        </div>
      )}

      {/* Language display settings modal */}
      {showDisplaySettings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowDisplaySettings(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "280px",
              margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              {t("Display", lang)}
            </h2>
            {([
              { label: t("English", lang), value: showEnglish, toggle: () => setShowEnglish((v) => !v) },
              { label: t("Japanese", lang), value: showJapanese, toggle: () => setShowJapanese((v) => !v) },
              { label: t("Romaji", lang), value: showRomaji, toggle: () => setShowRomaji((v) => !v) },
            ] as const).map((item) => (
              <label
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                {item.label}
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={item.toggle}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                />
              </label>
            ))}
            <button
              onClick={() => setShowDisplaySettings(false)}
              style={{
                marginTop: "1rem",
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              {t("Done", lang)}
            </button>
          </div>
        </div>
      )}

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "320px",
              margin: "1rem",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {t("Leave room?", lang)}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {t("You can rejoin later with the same room code.", lang)}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("Stay", lang)}
              </button>
              <button
                onClick={handleLeave}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("Leave", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployment indicator */}
      {process.env.NEXT_PUBLIC_GIT_SHA && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.6rem",
            color: "var(--muted)",
            opacity: 0.5,
            padding: "0.15rem 0",
          }}
        >
          v{process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7)}
        </div>
      )}
    </div>
  );
}

class MessageErrorBoundary extends Component<
  { children: ReactNode; lang?: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; lang?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontSize: "0.9rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          {t("Something went wrong displaying messages.", this.props.lang)}{" "}
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ color: "var(--primary)", textDecoration: "underline", background: "none" }}
          >
            {t("Try again", this.props.lang)}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100dvh",
            color: "var(--muted)",
          }}
        >
          {t("Loading room...", typeof window !== "undefined" ? localStorage.getItem("enchatto_lastLanguage") ?? "ja" : "ja")}
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
