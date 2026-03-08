"use client";

import { Suspense, useState, useCallback, useEffect, useRef, Component, type ReactNode } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ParticipantList } from "@/components/participant-list";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const participantId = searchParams.get("pid") ?? "";

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
      const url = `https://basic-ram-104.convex.cloud/api/mutation`;
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
    (action: "typing" | "drawing" | null) => {
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
      typingAction: (p as any).typingAction as "typing" | "drawing",
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
        Loading room...
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Room not found</h1>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          This room may have been closed.
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Join Required</h1>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          You need to join this room first.
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
          Join Room
        </a>
      </div>
    );
  }

  const isClosed = roomState.room.status === "closed";

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
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Enchatto</h1>
          {isClosed && (
            <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
              Room closed
            </span>
          )}
        </div>
        <ParticipantList
          participants={participants}
          currentParticipantId={participantId}
          onLeave={() => setShowLeaveConfirm(true)}
        />
      </header>

      {/* Messages */}
      <MessageErrorBoundary>
        <MessageList
          messages={messageList}
          participants={participants}
          currentParticipantId={participantId}
          onReply={handleReply}
          onToggleReaction={handleToggleReaction}
          typingParticipants={typingParticipants}
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
          This room has been closed by the host.
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
              Leave room?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              You can rejoin later with the same room code.
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
                Stay
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
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

class MessageErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
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
          Something went wrong displaying messages.{" "}
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ color: "var(--primary)", textDecoration: "underline", background: "none" }}
          >
            Try again
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
          Loading room...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
