"use client";

import { Suspense, useState, useCallback, useEffect, useRef, Component, type ReactNode } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ParticipantList } from "@/components/participant-list";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { GamePickerModal } from "@/components/game-picker-modal";
import { GameTaskOverlay } from "@/components/game-task-overlay";
import { GameReplayModal } from "@/components/game-replay-modal";
import { GameStatusBar } from "@/components/game-status-bar";
import { EmojifyrGameScreen } from "@/components/emojifyr-game-screen";
import { getAvatarById } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useNetworkStatus } from "@/hooks/use-network-status";

interface QueuedMessage {
  id: string;
  kind: "text" | "image" | "drawing";
  text?: string;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: number;
}

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
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [showGameReplay, setShowGameReplay] = useState(false);
  const [dismissedGameStepId, setDismissedGameStepId] = useState<string | null>(null);

  // Network status & offline queue
  const { isOnline } = useNetworkStatus();
  const [offlineQueue, setOfflineQueue] = useState<QueuedMessage[]>([]);
  const isFlushingRef = useRef(false);

  // Real-time subscriptions
  const roomState = useQuery(api.rooms.getRoomState, {
    roomId: roomId as Id<"rooms">,
  });
  const messages = useQuery(api.messages.getRoomMessages, {
    roomId: roomId as Id<"rooms">,
  });
  const activeGameSession = useQuery(api.games.getActiveGameSession, {
    roomId: roomId as Id<"rooms">,
  });
  const myActiveStep = useQuery(
    api.games.getMyActiveStep,
    participantId ? { participantId: participantId as Id<"participants"> } : "skip"
  );
  // Debug: trace game step changes
  useEffect(() => {
    console.log("[GAME] myActiveStep:", myActiveStep ? { id: myActiveStep._id, type: myActiveStep.stepType, round: myActiveStep.round, chain: (myActiveStep as any).chainId } : null);
  }, [myActiveStep]);

  const latestGameSession = useQuery(api.games.getLatestGameSession, {
    roomId: roomId as Id<"rooms">,
  });
  const gameReplay = useQuery(
    api.games.getGameReplay,
    latestGameSession && latestGameSession.status === "complete"
      ? { gameSessionId: latestGameSession._id }
      : "skip"
  );
  const gameStatus = useQuery(
    api.games.getGameStatus,
    activeGameSession ? { roomId: roomId as Id<"rooms"> } : "skip"
  );

  // Emojifyr real-time subscriptions
  const emojifyrState = useQuery(api.games.getEmojifyrGameState, {
    roomId: roomId as Id<"rooms">,
  });
  const emojifyrSession = emojifyrState?.session ?? null;
  const emojifyrRound = emojifyrState?.currentRound ?? null;
  const emojifyrGuesses = emojifyrState?.guesses ?? [];


  // Auto-show game replay when a game completes or is cancelled
  const prevActiveGameRef = useRef(activeGameSession);
  useEffect(() => {
    const wasActive = prevActiveGameRef.current != null;
    const nowInactive = activeGameSession == null;
    const hasCompleteGame = latestGameSession?.status === "complete";
    if (wasActive && nowInactive && hasCompleteGame) {
      setShowGameReplay(true);
    }
    prevActiveGameRef.current = activeGameSession;
  }, [activeGameSession, latestGameSession?.status]);

  // Mutations
  const sendTextMessage = useMutation(api.messages.sendTextMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendImageMessage = useMutation(api.messages.sendImageMessage);
  const setParticipantOnline = useMutation(api.participants.setParticipantOnline);
  const startGameMutation = useMutation(api.games.startGame);
  const submitGameStepMutation = useMutation(api.games.submitGameStep);

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

  // Set typing action to "drawing" while on a draw step so other players see pencil indicator
  useEffect(() => {
    if (!participantId) return;
    if (myActiveStep?.stepType === "draw") {
      setTypingAction({
        participantId: participantId as Id<"participants">,
        action: "drawing",
        drawingStartedAt: (typeof myActiveStep?.timerEnabled === "number" ? myActiveStep.timerEnabled > 0 : myActiveStep?.timerEnabled !== false) ? Date.now() : undefined,
      }).catch(() => {});
      return () => {
        setTypingAction({
          participantId: participantId as Id<"participants">,
          action: undefined,
        }).catch(() => {});
      };
    }
  }, [myActiveStep?.stepType, myActiveStep?._id, participantId, setTypingAction]);

  const participants = roomState?.participants ?? [];
  const messageList = messages ?? [];

  const me = participants.find((p) => p._id === participantId);
  const lang = me?.preferredLanguage ?? "ja";

  // Redirect to join screen if participant was removed (kicked)
  useEffect(() => {
    if (participantId && roomState && roomState.participants.length > 0 && !me) {
      router.replace(`/join/${roomState.room.joinCode}`);
    }
  }, [participantId, roomState, me, router]);

  // Redirect to home screen if room is closed
  useEffect(() => {
    if (roomState?.room.status === "closed") {
      router.replace("/");
    }
  }, [roomState?.room.status, router]);

  const replyMessage = replyTo
    ? messageList.find((m) => m._id === replyTo)
    : null;

  const enqueueMessage = useCallback(
    (msg: Omit<QueuedMessage, "id" | "createdAt">) => {
      const queued: QueuedMessage = {
        ...msg,
        id: `queued-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setOfflineQueue((q) => [...q, queued]);
      return queued;
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!participantId) return;
      if (!isOnline) {
        enqueueMessage({ kind: "text", text, replyToId: replyTo ?? undefined });
        setReplyTo(null);
        return;
      }
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
        console.error("Failed to send message, queuing:", err);
        enqueueMessage({ kind: "text", text, replyToId: replyTo ?? undefined });
        setReplyTo(null);
      }
    },
    [sendTextMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
  );

  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string, hasReacted: boolean) => {
      if (!participantId || !isOnline) return;
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
    [addReaction, removeReaction, participantId, isOnline]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      if (!participantId) return;
      if (!isOnline) {
        // Convert to base64 data URL for offline queue
        const reader = new FileReader();
        reader.onloadend = () => {
          enqueueMessage({ kind: "image", mediaUrl: reader.result as string, replyToId: replyTo ?? undefined });
          setReplyTo(null);
        };
        reader.readAsDataURL(file);
        return;
      }
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
        console.error("Failed to send image, queuing:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          enqueueMessage({ kind: "image", mediaUrl: reader.result as string, replyToId: replyTo ?? undefined });
          setReplyTo(null);
        };
        reader.readAsDataURL(file);
      }
    },
    [generateUploadUrl, sendImageMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
  );

  const handleSendDrawing = useCallback(
    async (dataUrl: string) => {
      if (!participantId) return;
      if (!isOnline) {
        enqueueMessage({ kind: "drawing", mediaUrl: dataUrl, replyToId: replyTo ?? undefined });
        setReplyTo(null);
        return;
      }
      try {
        await sendDrawingMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          mediaUrl: dataUrl,
          replyToId: replyTo ? (replyTo as Id<"messages">) : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send drawing, queuing:", err);
        enqueueMessage({ kind: "drawing", mediaUrl: dataUrl, replyToId: replyTo ?? undefined });
        setReplyTo(null);
      }
    },
    [sendDrawingMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
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

  // Compute timer seconds from active game SESSION (not step — watchers don't have
  // an active step during the draw phase, so myActiveStep would be null for them,
  // causing timerSeconds to always default to 20).
  const sessionTimer = activeGameSession?.timerEnabled ?? myActiveStep?.timerEnabled;
  const activeTimerSeconds = typeof sessionTimer === "number"
    ? sessionTimer
    : (sessionTimer !== false ? 20 : 0);

  const typingParticipants = participants
    .filter((p) => p._id !== participantId && (p as any).typingAction)
    .map((p) => ({
      _id: p._id,
      nickname: p.nickname,
      avatar: p.avatar,
      typingAction: (p as any).typingAction as "typing" | "drawing" | "voicing",
      drawingStartedAt: (p as any).drawingStartedAt as number | undefined,
      timerSeconds: activeTimerSeconds,
    }));

  const handleReply = (messageId: string) => {
    setReplyTo(messageId);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // Emojifyr mutations
  const startEmojifyrMutation = useMutation(api.games.startEmojifyr);
  const submitEmojifyrSentenceMutation = useMutation(api.games.submitEmojifyrSentence);
  const submitEmojifyrGuessMutation = useMutation(api.games.submitEmojifyrGuess);
  const revealEmojifyrRoundMutation = useMutation(api.games.revealEmojifyrRound);
  const advanceEmojifyrRoundMutation = useMutation(api.games.advanceEmojifyrRound);
  const cancelEmojifyrMutation = useMutation(api.games.cancelEmojifyr);
  const submitEmojifyrEmojiClueMutation = useMutation(api.games.submitEmojifyrEmojiClue);
  const generateEmojiClueAction = useAction(api.games.generateEmojiClue);

  const cancelGameMutation = useMutation(api.games.cancelGame);
  const handleStartGame = useCallback(
    async (gameType: string, level: number = 1, timerSeconds: number = 20) => {
      if (!participantId) return;
      try {
        // Cancel any lingering active game first
        await cancelGameMutation({
          roomId: roomId as Id<"rooms">,
          participantId: participantId as Id<"participants">,
        });
        await startGameMutation({
          roomId: roomId as Id<"rooms">,
          participantId: participantId as Id<"participants">,
          gameType,
          level,
          timerEnabled: timerSeconds,
        });
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    },
    [cancelGameMutation, startGameMutation, roomId, participantId]
  );

  const handleStartEmojifyr = useCallback(
    async () => {
      if (!participantId) return;
      try {
        // Cancel any lingering active game first (ignore errors if no active game)
        try {
          await cancelGameMutation({
            roomId: roomId as Id<"rooms">,
            participantId: participantId as Id<"participants">,
          });
        } catch {
          // No active game to cancel — that's fine
        }
        await startEmojifyrMutation({
          roomId: roomId as Id<"rooms">,
          createdByParticipantId: participantId as Id<"participants">,
        });
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to start Emojifyr:", err);
      }
    },
    [cancelGameMutation, startEmojifyrMutation, roomId, participantId]
  );

  const handleSubmitEmojifyrSentence = useCallback(
    async (sentence: string) => {
      if (!emojifyrRound) return;
      try {
        await submitEmojifyrSentenceMutation({
          roundId: emojifyrRound._id,
          sentence,
        });
      } catch (err) {
        console.error("Failed to submit Emojifyr sentence:", err);
      }
    },
    [submitEmojifyrSentenceMutation, emojifyrRound]
  );

  const handleSubmitEmojifyrGuess = useCallback(
    async (guess: string) => {
      if (!emojifyrRound || !participantId) return;
      try {
        await submitEmojifyrGuessMutation({
          roundId: emojifyrRound._id,
          participantId: participantId as Id<"participants">,
          guessText: guess,
        });
      } catch (err) {
        console.error("Failed to submit Emojifyr guess:", err);
      }
    },
    [submitEmojifyrGuessMutation, emojifyrRound, participantId]
  );

  const handleEmojifyrNextRound = useCallback(
    async () => {
      if (!emojifyrSession) return;
      try {
        await advanceEmojifyrRoundMutation({
          gameSessionId: emojifyrSession._id as Id<"gameSessions">,
        });
      } catch (err) {
        console.error("Failed to advance Emojifyr round:", err);
      }
    },
    [advanceEmojifyrRoundMutation, emojifyrSession, emojifyrRound]
  );

  const handleCancelEmojifyr = useCallback(
    async () => {
      if (!emojifyrSession) return;
      try {
        await cancelEmojifyrMutation({
          gameSessionId: emojifyrSession._id as Id<"gameSessions">,
        });
      } catch (err) {
        console.error("Failed to cancel Emojifyr:", err);
      }
    },
    [cancelEmojifyrMutation, emojifyrSession]
  );

  const handleGenerateEmojiClue = useCallback(
    async (sentence: string) => {
      try {
        const result = await generateEmojiClueAction({ sentence });
        return result.emojiClue;
      } catch (err) {
        console.error("Failed to generate emoji clue:", err);
        return null;
      }
    },
    [generateEmojiClueAction]
  );

  const handleSubmitEmojifyrEmojiClue = useCallback(
    async (emojiClue: string) => {
      if (!emojifyrRound) return;
      try {
        await submitEmojifyrEmojiClueMutation({
          roundId: emojifyrRound._id,
          emojiClue,
        });
      } catch (err) {
        console.error("Failed to submit emoji clue:", err);
      }
    },
    [submitEmojifyrEmojiClueMutation, emojifyrRound]
  );

  const handleRevealEmojifyr = useCallback(
    async () => {
      if (!emojifyrRound) return;
      try {
        await revealEmojifyrRoundMutation({
          roundId: emojifyrRound._id,
        });
      } catch (err) {
        console.error("Failed to reveal Emojifyr round:", err);
      }
    },
    [revealEmojifyrRoundMutation, emojifyrRound]
  );

  const handleSubmitGameStep = useCallback(
    async (stepId: string, outputText?: string, outputDrawingUrl?: string, selectedOption?: string) => {
      if (!participantId) return;
      try {
        // Call mutation directly (not via action) for reliable Convex reactivity
        const args: any = {
          stepId: stepId as Id<"gameSteps">,
          participantId: participantId as Id<"participants">,
        };
        if (outputText !== undefined) args.outputText = outputText;
        if (outputDrawingUrl !== undefined) args.outputDrawingUrl = outputDrawingUrl;
        if (selectedOption !== undefined) args.selectedOption = selectedOption;
        await submitGameStepMutation(args);
      } catch (err: any) {
        console.error("Failed to submit game step:", err);
        alert("Game step error: " + (err?.message ?? err?.data ?? String(err)));
      }
    },
    [submitGameStepMutation, participantId]
  );

  // Flush offline queue when back online
  const flushQueue = useCallback(async () => {
    if (isFlushingRef.current || offlineQueue.length === 0) return;
    isFlushingRef.current = true;
    const remaining = [...offlineQueue];
    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      try {
        if (item.kind === "text" && item.text) {
          await sendTextMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            text: item.text,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        } else if (item.kind === "image" && item.mediaUrl) {
          // Convert data URL back to blob for upload
          const res = await fetch(item.mediaUrl);
          const blob = await res.blob();
          const uploadUrl = await generateUploadUrl();
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type || "image/png" },
            body: blob,
          });
          const { storageId } = await uploadResult.json();
          await sendImageMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            storageId,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        } else if (item.kind === "drawing" && item.mediaUrl) {
          await sendDrawingMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            mediaUrl: item.mediaUrl,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        }
        // Remove successfully sent item
        setOfflineQueue((q) => q.filter((m) => m.id !== item.id));
      } catch (err) {
        console.error("Flush failed at item, stopping:", item.id, err);
        break; // Stop on first failure, retry next time
      }
    }
    isFlushingRef.current = false;
  }, [offlineQueue, roomId, participantId, sendTextMessage, generateUploadUrl, sendImageMessage, sendDrawingMessage]);

  // Auto-flush when transitioning offline→online
  const wasOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      flushQueue();
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline, flushQueue]);

  // Merge queued messages into the display list
  const queuedAsMessages = offlineQueue.map((q) => ({
    _id: q.id,
    senderId: participantId,
    kind: q.kind,
    status: "pending" as const,
    text: q.text,
    mediaUrl: q.mediaUrl,
    replyToId: q.replyToId,
    createdAt: q.createdAt,
  }));
  // Filter out host's own join/leave/away/back system messages (keep game messages)
  const roomHostId = roomState?.room?.hostId;
  const displayMessages = [...messageList, ...queuedAsMessages].filter((m) => {
    if (m.kind === "system" && roomHostId && m.senderId === roomHostId) {
      const text = m.text ?? "";
      if (text.startsWith("game:") || text.startsWith("game_cancelled:") || text.startsWith("game_correct:") || text.startsWith("game_wrong:")) return true;
      return false;
    }
    return true;
  });

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

  // Count ALL participants (including self) to match iOS header
  const allVisible = participants.filter((p) => !(p as any).departed);
  const onlineCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "online").length;
  const awayCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "away").length;

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
          <div style={{ lineHeight: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, lineHeight: 1 }}>{t("Enchatto", lang)}</h1>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                title={t("Leave room", lang)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.15rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--muted)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
            {isClosed ? (
              <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                {t("Room closed", lang)}
              </span>
            ) : (
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", lineHeight: 1, marginTop: "1px", display: "block" }}>
                {onlineCount} {t("online", lang)}{awayCount > 0 ? `, ${awayCount} ${t("away", lang)}` : ""}
              </span>
            )}
          </div>
        </div>
        <ParticipantList
          participants={participants.filter((p) => p._id !== participantId)}
          currentParticipantId={participantId}
          lang={lang}
        />
      </header>

      {/* Offline banner */}
      {!isOnline && (
        <div
          style={{
            background: "#f97316",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span>{t("You're offline", lang)}</span>
          {offlineQueue.length > 0 && (
            <span
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: "10px",
                padding: "0.1rem 0.5rem",
                fontSize: "0.75rem",
              }}
            >
              {offlineQueue.length} {t("queued", lang)}
            </span>
          )}
        </div>
      )}

      {/* Game status bar */}
      {gameStatus && <GameStatusBar status={gameStatus} lang={lang} />}

      {/* Messages */}
      <MessageErrorBoundary lang={lang}>
        <MessageList
          messages={displayMessages}
          participants={participants}
          currentParticipantId={participantId}
          preferredLanguage={lang}
          onReply={handleReply}
          onToggleReaction={isOnline ? handleToggleReaction : undefined}
          typingParticipants={typingParticipants}
          lang={lang}
          showEnglish={showEnglish}
          showJapanese={showJapanese}
          showRomaji={showRomaji}
          isGameComplete={latestGameSession?.status === "complete" && !activeGameSession}
          gameCompletedAt={latestGameSession?.completedAt}
          onViewGameResults={() => setShowGameReplay(true)}
        />
      </MessageErrorBoundary>

      {/* Input */}
      {!isClosed ? (
        <MessageInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendDrawing={handleSendDrawing}
          onGameTap={() => setShowGamePicker(true)}
          isGameActive={(activeGameSession != null || emojifyrSession != null) && me?.role === "host"}
          onEndGame={me?.role === "host" ? async () => {
            if (confirm(t("This will end the game for all players and show results.", lang))) {
              if (emojifyrSession) {
                await cancelEmojifyrMutation({ gameSessionId: emojifyrSession._id as Id<"gameSessions"> });
              } else {
                await cancelGameMutation({ roomId: roomId as Id<"rooms">, participantId: participantId as Id<"participants"> });
              }
            }
          } : undefined}
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
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              {t("Display for", lang)} {me?.nickname ?? ""}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
              {t("Room", lang)}: <strong>{roomState.room.joinCode}</strong>
            </p>
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
            <p style={{ marginTop: "0.75rem", fontSize: "0.65rem", color: "var(--muted)", textAlign: "center", opacity: 0.6, lineHeight: 1.4 }}>
              {process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "").replace(".convex.cloud", "") ?? ""} · web v0.1.0
              {process.env.NEXT_PUBLIC_GIT_SHA && process.env.NEXT_PUBLIC_GIT_SHA !== "dev" ? (<><br />github: {process.env.NEXT_PUBLIC_GIT_SHA}</>) : null}
              {process.env.NEXT_PUBLIC_VERCEL_URL ? (<><br />vercel: {process.env.NEXT_PUBLIC_VERCEL_URL}</>) : null}
            </p>
          </div>
        </div>
      )}

      {/* Emojifyr full-screen game */}
      {emojifyrSession && emojifyrSession.status === "active" && (
        <EmojifyrGameScreen
          session={emojifyrSession}
          currentRound={emojifyrRound}
          guesses={emojifyrGuesses}
          participants={participants}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onSubmitSentence={handleSubmitEmojifyrSentence}
          onGenerateEmojiClue={handleGenerateEmojiClue}
          onSubmitEmojiClue={handleSubmitEmojifyrEmojiClue}
          onSubmitGuess={handleSubmitEmojifyrGuess}
          onReveal={handleRevealEmojifyr}
          onNextRound={handleEmojifyrNextRound}
          onEndGame={handleCancelEmojifyr}
        />
      )}

      {/* Game task overlay */}
      {myActiveStep && myActiveStep._id !== dismissedGameStepId && (
        <GameTaskOverlay
          key={myActiveStep._id}
          step={myActiveStep}
          onSubmit={handleSubmitGameStep}
          onQuit={async () => {
            setDismissedGameStepId(myActiveStep._id);
            if (me?.role === "host") {
              try {
                await cancelGameMutation({
                  roomId: roomId as Id<"rooms">,
                  participantId: participantId as Id<"participants">,
                });
              } catch (err) {
                console.error("Failed to cancel game:", err);
              }
            }
          }}
          lang={lang}
        />
      )}

      {/* Game picker modal */}
      <GamePickerModal
        isOpen={showGamePicker}
        isHost={me?.role === "host"}
        playerCount={participants.filter((p) => (p as any).online && !(p as any).departed).length}
        hostName={participants.find((p) => p.role === "host")?.nickname ?? ""}
        nextLevel={(latestGameSession?.status === "complete" && latestGameSession?.level && !latestGameSession?.cancelled) ? (latestGameSession.level as number) + 1 : 1}
        onStartGame={handleStartGame}
        onStartEmojifyr={handleStartEmojifyr}
        onRequestGame={(msg) => handleSend(msg)}
        onClose={() => setShowGamePicker(false)}
        lang={lang}
      />

      {/* Game replay modal */}
      <GameReplayModal
        isOpen={showGameReplay}
        replay={gameReplay ?? null}
        isHost={me?.role === "host"}
        prevTimerSeconds={typeof latestGameSession?.timerEnabled === "number"
          ? latestGameSession.timerEnabled
          : (latestGameSession?.timerEnabled !== false ? 20 : 0)}
        onNextLevel={(timerSeconds) => {
          const nextLevel = (latestGameSession?.level as number ?? 1) + 1;
          handleStartGame("lost-in-translation", nextLevel, timerSeconds);
        }}
        onClose={() => setShowGameReplay(false)}
        lang={lang}
      />

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
