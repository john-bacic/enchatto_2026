"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ParticipantList } from "@/components/participant-list";
import { VibeInfo } from "@/components/vibe-info";
import { MessageList } from "@/components/message-list";
import { MessageInput, type OutgoingVoiceClip } from "@/components/message-input";
import { GamePickerModal } from "@/components/game-picker-modal";
import { GameTaskOverlay } from "@/components/game-task-overlay";
import { GameReplayModal } from "@/components/game-replay-modal";
import { GameStatusBar } from "@/components/game-status-bar";
import { EmojiMatchGame } from "@/components/emoji-match-game";
import { TruthOrDareGame } from "@/components/truth-or-dare-game";
import { EmojiBingoGame } from "@/components/emoji-bingo-game";
import { TodDebugPanel, todTrace, tracedMutation } from "@/components/tod-debug-panel";
import { WordRushGame } from "@/components/word-rush-game";
import { isJapaneseText } from "@/components/message-item";
import { LoadingState } from "@/components/room/center-states";
import { MessageErrorBoundary } from "@/components/room/message-error-boundary";
import { AvatarDisc } from "@/components/ui/avatar";
import { Chatto } from "@/components/ui/chatto";
import { Icon, LangBadge } from "@/components/ui/icon";
import { Wordmark } from "@/components/ui/logo";
import { Bunting, Confetti, CutIn, Rays, RoomBackground } from "@/components/ui/effects";
import { QUEUED_ID_PREFIX, avatarIconSrc, avatarTint, getAvatarById } from "@/lib/types";
import { textureForRoom } from "@/lib/textures";
import { t } from "@/lib/i18n";
import { teamInSession } from "@/lib/game-teams";
import { useGameOnScreen } from "@/lib/game-results";
import { HYPE_AT, computeVibe, formatVibe, type VibeMessage } from "@/lib/vibe";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { CHAT_SIZES, useDisplayPrefs } from "@/hooks/use-display-prefs";
import { usePresence } from "@/hooks/use-presence";
import { useTypingAction } from "@/hooks/use-typing-action";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRoomRedirects } from "@/hooks/use-room-redirects";
import { TOKEN_PARAM, tokenFor, useAuthedMutation, useConvexSiteUrl, useConvexUrl } from "@/lib/convex";
import "@/app/screens.css";

interface QueuedMessage {
  id: string;
  kind: "text" | "image" | "drawing";
  text?: string;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: number;
}

interface Floater {
  id: number;
  text: string;
  left: number;
}

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const pidParam = searchParams.get("pid") ?? "";
  // The join page adds tk=1 to a link whose participant it registered a token for. A browser that does not hold that
  // token was handed the link, or lost its storage: acting as that participant would be impersonation, so the page
  // treats the link as naming nobody and the visitor joins as themselves. A link without tk (a participant made
  // before tokens, or where storage is blocked) works by id alone, as it always has
  const tokenMissing = useMemo(
    () => typeof window !== "undefined" && pidParam !== "" && searchParams.get(TOKEN_PARAM) === "1" && !tokenFor(pidParam),
    [pidParam, searchParams]
  );
  const participantId = tokenMissing ? "" : pidParam;
  const convexSiteUrl = useConvexSiteUrl();
  const convexUrl = useConvexUrl();

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [showGameReplay, setShowGameReplay] = useState(false);
  const [dismissedGameStepId, setDismissedGameStepId] = useState<string | null>(null);
  const [dismissedEmojiMatchId, setDismissedEmojiMatchId] = useState<string | null>(null);
  const [dismissedEmojiBingoId, setDismissedEmojiBingoId] = useState<string | null>(null);
  const [dismissedTruthOrDareId, setDismissedTruthOrDareId] = useState<string | null>(null);

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
    participantId ? { participantId: participantId as Id<"participants">, token: tokenFor(participantId) } : "skip"
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

  // Word Rush real-time subscription
  const wordRushGame = useQuery(api.wordRush.getState, {
    roomId: roomId as Id<"rooms">,
  });

  // Emoji Match real-time subscription
  const emojiMatchGame = useQuery(api.emojiMatch.getActiveEmojiMatch, {
    roomId: roomId as Id<"rooms">,
  });
  // The answer is the room's latest game even when it ended long ago: its results are for a page that saw it played,
  // and never go over a Lost in Translation task
  const emojiMatchOnScreen = useGameOnScreen(
    emojiMatchGame,
    myActiveStep != null && myActiveStep._id !== dismissedGameStepId
  );
  const emojiBingoGame = useQuery(api.emojiBingo.getActiveEmojiBingo, {
    roomId: roomId as Id<"rooms">,
  });

  // Truth or Dare real-time subscription
  const truthOrDareGame = useQuery(api.truthOrDare.getActiveTruthOrDare, {
    roomId: roomId as Id<"rooms">,
  });

  // Trace T/D reactive query updates
  const prevTodRef = useRef<{ status?: string; turnStatus?: string; turnIdx?: number; turnId?: string }>({});
  useEffect(() => {
    if (!truthOrDareGame) return;
    const cur = {
      status: truthOrDareGame.status,
      turnStatus: truthOrDareGame.currentTurn?.status,
      turnIdx: truthOrDareGame.currentTurnIndex,
      turnId: truthOrDareGame.currentTurn?._id,
    };
    const prev = prevTodRef.current;
    if (cur.status !== prev.status || cur.turnStatus !== prev.turnStatus || cur.turnId !== prev.turnId) {
      todTrace({
        source: "client",
        action: "query:stateChange",
        detail: `status=${cur.status} turn=${cur.turnStatus} idx=${cur.turnIdx} pid=${truthOrDareGame.currentTurnParticipantId?.slice(-6)}`,
      });
    }
    prevTodRef.current = cur;
  }, [truthOrDareGame]);

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
  const sendTextMessage = useAuthedMutation(api.messages.sendTextMessage);
  const generateUploadUrl = useAuthedMutation(api.messages.generateUploadUrl);
  const sendImageMessage = useAuthedMutation(api.messages.sendImageMessage);
  const sendAudioMessage = useAuthedMutation(api.messages.sendAudioMessage);
  const startGameMutation = useAuthedMutation(api.games.startGame);
  const submitGameStepMutation = useAuthedMutation(api.games.submitGameStep);

  const { handleLeave } = usePresence({ participantId, convexUrl, router });
  const sendDrawingMessage = useAuthedMutation(api.messages.sendDrawingMessage);
  const addReaction = useAuthedMutation(api.reactions.addReaction);
  const removeReaction = useAuthedMutation(api.reactions.removeReaction);

  const { showEnglish, showJapanese, showRomaji, chatSize, toggleDisplay, pickChatSize } = useDisplayPrefs(participantId);

  const { setTypingAction, handleTypingChange } = useTypingAction({ participantId, myActiveStep });

  const participants = roomState?.participants ?? [];
  const messageList = messages ?? [];

  const me = participants.find((p) => p._id === participantId);
  const lang = me?.preferredLanguage ?? "ja";

  // A guest's header, input bar and browser chrome take a light tint of their avatar colour
  const meTint = me && me.role !== "host" ? avatarTint(me.avatar.value) : undefined;
  useThemeColor(meTint);

  useRoomRedirects({ participantId, tokenMissing, roomState, me, router });

  const replyMessage = replyTo
    ? messageList.find((m) => m._id === replyTo)
    : null;

  const enqueueMessage = useCallback(
    (msg: Omit<QueuedMessage, "id" | "createdAt">) => {
      const queued: QueuedMessage = {
        ...msg,
        id: `${QUEUED_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      // The server refuses these as well, and deletes the upload. Saying so here saves the upload.
      // A file the browser cannot name has no type and is let through, as the server lets it through. A declared
      // application/octet-stream is refused here on purpose (it is what a browser calls a .bin or .exe); the
      // server takes it only for builds that queued an untyped file that way
      if ((file.type && !file.type.startsWith("image/")) || file.size > 50 * 1024 * 1024) {
        alert(t("That picture can't be sent (images up to 50 MB)", lang));
        return;
      }
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
        const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
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
    [generateUploadUrl, sendImageMessage, roomId, participantId, replyTo, isOnline, enqueueMessage, lang]
  );

  const handleSendVoice = useCallback(
    async (clip: OutgoingVoiceClip) => {
      if (!participantId) return;
      const replyToId = replyTo ? (replyTo as Id<"messages">) : undefined;
      setReplyTo(null);
      try {
        if (!isOnline) throw new Error("offline");
        const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": clip.blob.type || "audio/mp4" },
          body: clip.blob,
        });
        if (!result.ok) throw new Error(`Upload failed (${result.status})`);
        const { storageId } = await result.json();
        await sendAudioMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          storageId,
          durationMs: clip.durationMs,
          waveform: clip.waveform,
          text: clip.text,
          lang: clip.lang,
          replyToId,
        });
      } catch (err) {
        // Audio can't sit in the offline queue, but the words can
        console.error("Failed to send voice message:", err);
        if (clip.text) enqueueMessage({ kind: "text", text: clip.text, replyToId });
      }
    },
    [generateUploadUrl, sendAudioMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
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
        // Use HTTP POST to convert base64 to file storage server-side.
        // This keeps the messages subscription payload small (CDN URLs only).
        const res = await fetch(`${convexSiteUrl}/api/messages/send-drawing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            senderId: participantId,
            // In a route's body the caller's token is callerToken: `token` there can be something else
            callerToken: tokenFor(participantId),
            mediaUrl: dataUrl,
            replyToId: replyTo ?? undefined,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send drawing, queuing:", err);
        enqueueMessage({ kind: "drawing", mediaUrl: dataUrl, replyToId: replyTo ?? undefined });
        setReplyTo(null);
      }
    },
    [sendDrawingMessage, roomId, participantId, replyTo, isOnline, enqueueMessage, convexSiteUrl]
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

  // Word Rush mutations
  const createWordRushLobby = useAuthedMutation(api.wordRush.createLobby);
  const cancelWordRush = useAuthedMutation(api.wordRush.cancel);

  // Emoji Match mutations
  const createEmojiMatchLobby = useAuthedMutation(api.emojiMatch.createLobby);
  const joinEmojiMatchLobby = useAuthedMutation(api.emojiMatch.joinLobby);
  const leaveEmojiMatchLobby = useAuthedMutation(api.emojiMatch.leaveLobby);
  const startEmojiMatch = useAuthedMutation(api.emojiMatch.startGame);
  const flipEmojiMatchCard = useAuthedMutation(api.emojiMatch.flipCard);
  const resolveEmojiMatchMismatch = useAuthedMutation(api.emojiMatch.resolveMismatch);
  const cancelEmojiMatch = useAuthedMutation(api.emojiMatch.cancelGame);
  const timeoutEmojiMatchTurn = useAuthedMutation(api.emojiMatch.timeoutTurn);
  const playAgainEmojiMatch = useAuthedMutation(api.emojiMatch.playAgain);

  // Emoji Bingo mutations
  const createEmojiBingoLobby = useAuthedMutation(api.emojiBingo.createLobby);
  const joinEmojiBingoLobby = useAuthedMutation(api.emojiBingo.joinLobby);
  const leaveEmojiBingoLobby = useAuthedMutation(api.emojiBingo.leaveLobby);
  const updateEmojiBingoSettings = useAuthedMutation(api.emojiBingo.updateSettings);
  const startEmojiBingo = useAuthedMutation(api.emojiBingo.startGame);
  const rollEmojiBingo = useAuthedMutation(api.emojiBingo.rollEmoji);
  const markEmojiBingoCell = useAuthedMutation(api.emojiBingo.markCell);
  const claimEmojiBingo = useAuthedMutation(api.emojiBingo.claimBingo);
  const cancelEmojiBingo = useAuthedMutation(api.emojiBingo.cancelGame);
  const playAgainEmojiBingo = useAuthedMutation(api.emojiBingo.playAgain);

  const cancelGameMutation = useAuthedMutation(api.games.cancelGame);
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

  const handleStartWordRush = useCallback(
    async ({ pack, sayIt }: { pack: string; sayIt: boolean }) => {
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
        await createWordRushLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
          pack,
          sayIt,
        });
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to start Word Rush:", err);
      }
    },
    [cancelGameMutation, createWordRushLobby, roomId, participantId]
  );

  // Emoji Match handlers
  const handleCreateEmojiMatchLobby = useCallback(
    async () => {
      if (!participantId) return;
      try {
        await createEmojiMatchLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
        });
        setDismissedEmojiMatchId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Emoji Match lobby:", err);
      }
    },
    [createEmojiMatchLobby, roomId, participantId]
  );

  const handleJoinEmojiMatchLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await joinEmojiMatchLobby({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to join Emoji Match lobby:", err);
      }
    },
    [joinEmojiMatchLobby, participantId]
  );

  const handleLeaveEmojiMatchLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await leaveEmojiMatchLobby({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to leave Emoji Match lobby:", err);
      }
    },
    [leaveEmojiMatchLobby, participantId]
  );

  const handleStartEmojiMatch = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await startEmojiMatch({
          gameId: gameId as Id<"emojiMatchGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to start Emoji Match:", err);
      }
    },
    [startEmojiMatch, participantId]
  );

  const handleFlipEmojiMatchCard = useCallback(
    async (gameId: string, cardId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("em:flipCard", `card=${cardId} pid=${participantId.slice(-6)}`, () =>
          flipEmojiMatchCard({
            gameId: gameId as Id<"emojiMatchGames">,
            cardId,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to flip card:", err);
      }
    },
    [flipEmojiMatchCard, participantId]
  );

  const handleResolveEmojiMatchMismatch = useCallback(
    async (gameId: string) => {
      try {
        await tracedMutation("em:resolveMismatch", "", () =>
          resolveEmojiMatchMismatch({
            gameId: gameId as Id<"emojiMatchGames">,
            callerId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to resolve mismatch:", err);
      }
    },
    [resolveEmojiMatchMismatch, participantId]
  );

  const handleCancelEmojiMatch = useCallback(
    async (gameId: string) => {
      try {
        await tracedMutation("em:cancel", "", () =>
          cancelEmojiMatch({
            gameId: gameId as Id<"emojiMatchGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to cancel Emoji Match:", err);
      }
    },
    [cancelEmojiMatch, participantId]
  );

  const handleTimeoutEmojiMatchTurn = useCallback(
    async (gameId: string, targetParticipantId: string) => {
      try {
        await tracedMutation("em:timeoutTurn", `pid=${targetParticipantId.slice(-6)}`, () =>
          timeoutEmojiMatchTurn({
            gameId: gameId as Id<"emojiMatchGames">,
            // Whose turn ran out; the caller, whose token the hook adds, is callerId
            participantId: targetParticipantId as Id<"participants">,
            callerId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to timeout turn:", err);
      }
    },
    [timeoutEmojiMatchTurn, participantId]
  );

  const handlePlayAgainEmojiMatch = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("em:playAgain", "", () =>
          playAgainEmojiMatch({
            gameId: gameId as Id<"emojiMatchGames">,
            participantId: participantId as Id<"participants">,
          })
        );
        setDismissedEmojiMatchId(null);
      } catch (err) {
        console.error("Failed to play again:", err);
      }
    },
    [playAgainEmojiMatch, participantId]
  );

  // Emoji Bingo handlers
  const handleCreateEmojiBingoLobby = useCallback(
    async () => {
      if (!participantId) return;
      try {
        await createEmojiBingoLobby({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
        });
        setDismissedEmojiBingoId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Emoji Bingo lobby:", err);
      }
    },
    [createEmojiBingoLobby, roomId, participantId]
  );

  const handleJoinEmojiBingoLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await joinEmojiBingoLobby({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to join Emoji Bingo lobby:", err);
      }
    },
    [joinEmojiBingoLobby, participantId]
  );

  const handleLeaveEmojiBingoLobby = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await leaveEmojiBingoLobby({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to leave Emoji Bingo lobby:", err);
      }
    },
    [leaveEmojiBingoLobby, participantId]
  );

  const handleUpdateEmojiBingoSettings = useCallback(
    async (gameId: string, winPattern?: string) => {
      if (!participantId) return;
      try {
        await updateEmojiBingoSettings({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
          winPattern: winPattern as any,
        });
      } catch (err) {
        console.error("Failed to update Emoji Bingo settings:", err);
      }
    },
    [updateEmojiBingoSettings, participantId]
  );

  const handleStartEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await startEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to start Emoji Bingo:", err);
      }
    },
    [startEmojiBingo, participantId]
  );

  const handleRollEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await rollEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to roll emoji:", err);
      }
    },
    [rollEmojiBingo, participantId]
  );

  const handleMarkEmojiBingoCell = useCallback(
    async (gameId: string, cellIndex: number) => {
      if (!participantId) return;
      try {
        await markEmojiBingoCell({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
          cellIndex,
        });
      } catch (err) {
        console.error("Failed to mark bingo cell:", err);
      }
    },
    [markEmojiBingoCell, participantId]
  );

  const handleClaimEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        return await claimEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to claim bingo:", err);
      }
    },
    [claimEmojiBingo, participantId]
  );

  const handleCancelEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await cancelEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
      } catch (err) {
        console.error("Failed to cancel Emoji Bingo:", err);
      }
    },
    [cancelEmojiBingo, participantId]
  );

  const handlePlayAgainEmojiBingo = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await playAgainEmojiBingo({
          gameId: gameId as Id<"emojiBingoGames">,
          participantId: participantId as Id<"participants">,
        });
        setDismissedEmojiBingoId(null);
      } catch (err) {
        console.error("Failed to play again:", err);
      }
    },
    [playAgainEmojiBingo, participantId]
  );

  // Truth or Dare mutations
  const createTruthOrDare = useAuthedMutation(api.truthOrDare.createGame);
  const submitTruthOrDareChoice = useAuthedMutation(api.truthOrDare.submitChoice);
  const submitTruthOrDareResponse = useAuthedMutation(api.truthOrDare.submitResponse);
  const advanceTruthOrDareTurn = useAuthedMutation(api.truthOrDare.advanceTurn);
  const skipTruthOrDareTurn = useAuthedMutation(api.truthOrDare.skipTurn);
  const endTruthOrDare = useAuthedMutation(api.truthOrDare.endGame);
  const submitTruthOrDareRating = useAuthedMutation(api.truthOrDare.submitRating);

  const handleCreateTruthOrDare = useCallback(
    async (mode: "normal" | "deep" = "normal") => {
      if (!participantId) return;
      try {
        await createTruthOrDare({
          roomId: roomId as Id<"rooms">,
          hostParticipantId: participantId as Id<"participants">,
          promptMode: mode,
        });
        setDismissedTruthOrDareId(null);
        setShowGamePicker(false);
      } catch (err) {
        console.error("Failed to create Truth or Dare:", err);
      }
    },
    [createTruthOrDare, roomId, participantId]
  );

  const handleSubmitTruthOrDareChoice = useCallback(
    async (gameId: string, choice: "truth" | "dare") => {
      if (!participantId) return;
      try {
        await tracedMutation("submitChoice", `${choice} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareChoice({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            choice,
          })
        );
      } catch (err) {
        console.error("Failed to submit choice:", err);
      }
    },
    [submitTruthOrDareChoice, participantId]
  );

  const handleSubmitTruthOrDareResponse = useCallback(
    async (gameId: string, responseText?: string, responseMediaUrl?: string) => {
      if (!participantId) return;
      const isImage = responseMediaUrl && responseMediaUrl.startsWith("data:");
      const payloadKB = isImage ? Math.round(responseMediaUrl!.length / 1024) : 0;
      try {
        if (isImage) {
          await tracedMutation("submitResponse:drawing", `${payloadKB}KB`, async () => {
                const res = await fetch(`${convexSiteUrl}/api/truth-or-dare/submit-response`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameId, participantId, callerToken: tokenFor(participantId), responseText, responseMediaUrl }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || `HTTP ${res.status}`);
            }
          });
          return;
        }
        await tracedMutation("submitResponse:text", responseText?.slice(0, 30) ?? "", () =>
          submitTruthOrDareResponse({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
            responseText,
            responseMediaUrl,
          })
        );
      } catch (err) {
        console.error("Failed to submit response:", err);
      }
    },
    [submitTruthOrDareResponse, participantId, convexSiteUrl]
  );

  const handleAdvanceTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("advanceTurn", `pid=${participantId.slice(-6)}`, () =>
          advanceTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to advance turn:", err);
      }
    },
    [advanceTruthOrDareTurn, participantId]
  );

  const handleSkipTruthOrDareTurn = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("skipTurn", `pid=${participantId.slice(-6)}`, () =>
          skipTruthOrDareTurn({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to skip turn:", err);
      }
    },
    [skipTruthOrDareTurn, participantId]
  );

  const handleEndTruthOrDare = useCallback(
    async (gameId: string) => {
      if (!participantId) return;
      try {
        await tracedMutation("endGame", `pid=${participantId.slice(-6)}`, () =>
          endTruthOrDare({
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: participantId as Id<"participants">,
          })
        );
      } catch (err) {
        console.error("Failed to end Truth or Dare:", err);
      }
    },
    [endTruthOrDare, participantId]
  );

  const handleSubmitTruthOrDareRating = useCallback(
    async (turnId: string, score: number) => {
      if (!participantId) return;
      try {
        await tracedMutation("submitRating", `score=${score} pid=${participantId.slice(-6)}`, () =>
          submitTruthOrDareRating({
            turnId: turnId as Id<"truthOrDareTurns">,
            participantId: participantId as Id<"participants">,
            score,
          })
        );
      } catch (err) {
        console.error("Failed to submit rating:", err);
      }
    },
    [submitTruthOrDareRating, participantId]
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
        // A guess is answered with how it came out, which the overlay shows
        return await submitGameStepMutation(args);
      } catch (err: any) {
        console.error("Failed to submit game step:", err);
        alert("Game step error: " + (err?.message ?? err?.data ?? String(err)));
        // The overlay undoes the pick, or lets Done send the drawing again
        throw err;
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
          const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
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
      if (text.startsWith("game:") || text.startsWith("game_cancelled:") || text.startsWith("game_correct:") || text.startsWith("game_wrong:") || text.startsWith("game_summary:") || text.startsWith("emoji_match_summary:") || text.startsWith("emoji_match_complete:")) return true;
      return false;
    }
    return true;
  });

  // ─── Vibe / hype ──────────────────────────────────────────────────────────
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

  // Loading state
  if (roomState === undefined || messages === undefined) {
    return <LoadingState lang={lang} />;
  }

  // Room not found
  if (roomState === null) {
    return (
      <>
        <RoomBackground />
        <div className="ec-center-state">
          <Chatto size={110} bob={false} wave={false} shadow />
          <h1>{t("Room not found", lang)}</h1>
          <p>{t("This room may have been closed.", lang)}</p>
          <a href="/" className="ec-btn white sm" style={{ width: "auto", padding: "0 22px", textDecoration: "none" }}>
            {t("Back home", lang)}
          </a>
        </div>
      </>
    );
  }

  const background = <RoomBackground texture={textureForRoom(roomState.room)} />;

  // No participant ID — user needs to join first
  if (!participantId) {
    const joinCode = roomState.room.joinCode;
    return (
      <>
        {background}
        <div className="ec-center-state">
          <Chatto size={110} shadow />
          <h1>{t("Join Required", lang)}</h1>
          <p>{t("You need to join this room first.", lang)}</p>
          <a href={`/join/${joinCode}`} className="ec-btn pink" style={{ width: "auto", padding: "0 28px", textDecoration: "none" }}>
            {t("Join Room", lang)}
          </a>
        </div>
      </>
    );
  }

  const isClosed = roomState.room.status === "closed";

  // Count ALL participants (including self) to match iOS header
  const allVisible = participants.filter((p) => !(p as any).departed);
  const onlineCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "online").length;
  const awayCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "away").length;
  const crowd = allVisible.filter((p) => (p as any).online).slice(0, 6);

  const wordRushLive = wordRushGame != null && (wordRushGame.status === "lobby" || wordRushGame.status === "active");

  const chatScale = CHAT_SIZES.find((s) => s.key === chatSize)?.scale ?? 1;

  return (
    <div className="ec-room" style={{ "--chat-scale": chatScale, "--me-tint": meTint } as React.CSSProperties}>
      {background}

      {/* Header */}
      <header className="ec-chat-head">
        {me && (
          <button
            onClick={() => setShowDisplaySettings(true)}
            aria-label={t("Display settings", lang)}
            style={{ flex: "none", padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: "50%" }}
          >
            <AvatarDisc id={me.avatar.value} size={40} />
          </button>
        )}
        <div className="ec-chat-title">
          <h1>
            <Wordmark text={t("Enchatto", lang)} size={22} hopKey={logoHop} hot={hype && !isClosed} />
          </h1>
          {isClosed ? (
            <span style={{ color: "var(--red)", opacity: 1 }}>{t("Room closed", lang)}</span>
          ) : (
            <span>
              <i className="ec-online-dot" />
              {onlineCount} {t("online", lang)}{awayCount > 0 ? `, ${awayCount} ${t("away", lang)}` : ""}
            </span>
          )}
        </div>
        <button
          ref={vibeRef}
          type="button"
          className={`ec-vibe${hype ? " hot" : ""}`}
          onClick={() => setShowVibeInfo((v) => !v)}
          aria-expanded={showVibeInfo}
          aria-label={`VIBE ${vibe}`}
        >
          <small>VIBE</small>
          <b key={vibe}>{formatVibe(vibe)}</b>
        </button>
        {showVibeInfo && (
          <VibeInfo
            vibe={formatVibe(vibe)}
            score={vibe}
            hypeAt={HYPE_AT}
            messageCount={recentCount}
            switches={switches}
            mult={mult}
            hype={hype}
            lang={lang}
            anchorRef={vibeRef}
            onClose={closeVibeInfo}
          />
        )}
        <ParticipantList
          participants={participants}
          currentParticipantId={participantId}
          roomCode={roomState.room.joinCode}
          onLeave={() => setShowLeaveConfirm(true)}
          lang={lang}
        />
      </header>

      {/* Offline banner */}
      {!isOnline && (
        <div className="ec-banner red">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="ec-chip" style={{ padding: "1px 8px", fontSize: 11 }}>
              {offlineQueue.length} {t("queued", lang)}
            </span>
          )}
        </div>
      )}

      {/* Game status bar */}
      {gameStatus && <GameStatusBar status={gameStatus} lang={lang} meId={participantId} />}

      {/* Messages + hype layers */}
      <div className="ec-stage">
        {hype && (
          <div className="ec-hype-layer">
            <Rays rainbow />
            <div className="ec-crowd">
              {crowd.map((p, i) => (
                <img key={p._id} src={avatarIconSrc(p.avatar.value)} alt="" style={{ animationDelay: `${(i % 3) * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        {hype && <Bunting top={0} />}
        {combo >= 3 && (
          <div key={combo} className="ec-combo" aria-live="polite">
            <b>×{combo}</b>
            <small>{t("BACK & FORTH!", lang)}</small>
            <em>VIBE ×{mult.toFixed(2)}</em>
            <i style={{ width: `calc((100% - 12px) * ${Math.min(combo, 20) / 20})` }} />
          </div>
        )}

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
            truthOrDareGame={truthOrDareGame}
            hype={hype}
          />
        </MessageErrorBoundary>

        {floaters.map((f) => (
          <span key={f.id} className="ec-floater" style={{ left: `${f.left}%`, bottom: 64 }}>
            {f.text}
          </span>
        ))}
      </div>

      {/* Input */}
      {!isClosed ? (
        <MessageInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendDrawing={handleSendDrawing}
          onSendVoice={handleSendVoice}
          onGameTap={() => setShowGamePicker(true)}
          isGameActive={(activeGameSession != null || wordRushLive || (emojiMatchGame != null && emojiMatchGame.status !== "completed" && emojiMatchGame.status !== "canceled") || (emojiBingoGame != null && !["completed", "canceled"].includes(emojiBingoGame.status)) || (truthOrDareGame != null && truthOrDareGame.status === "active")) && me?.role === "host"}
          onEndGame={me?.role === "host" ? async () => {
            if (confirm(t("This will end the game for all players and show results.", lang))) {
              if (truthOrDareGame && truthOrDareGame.status === "active") {
                await endTruthOrDare({ gameId: truthOrDareGame._id as Id<"truthOrDareGames">, participantId: participantId as Id<"participants"> });
              } else if (emojiBingoGame && !["completed", "canceled"].includes(emojiBingoGame.status)) {
                await cancelEmojiBingo({ gameId: emojiBingoGame._id as Id<"emojiBingoGames">, participantId: participantId as Id<"participants"> });
              } else if (emojiMatchGame && emojiMatchGame.status !== "completed" && emojiMatchGame.status !== "canceled") {
                await cancelEmojiMatch({ gameId: emojiMatchGame._id as Id<"emojiMatchGames">, participantId: participantId as Id<"participants"> });
              } else if (wordRushGame && wordRushLive) {
                try {
                  await cancelWordRush({ gameId: wordRushGame._id, participantId: participantId as Id<"participants"> });
                } catch (err) {
                  console.error("Failed to end Word Rush:", err);
                }
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
        <div className="ec-inputbar" style={{ textAlign: "center", fontSize: 13, fontWeight: 900, opacity: 0.85 }}>
          {t("This room has been closed by the host.", lang)}
        </div>
      )}

      {/* Language display settings sheet */}
      {showDisplaySettings && (
        <div className="ec-sheet-backdrop" style={{ zIndex: 100 }} onClick={() => setShowDisplaySettings(false)}>
          <div className="ec-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <div className="ec-sheet-grip" />
            <div className="ec-sheet-head">
              {me && <AvatarDisc id={me.avatar.value} size={40} />}
              <h2 style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                {t("Display for", lang)} {me?.nickname ?? ""}
              </h2>
              <button className="ec-round-btn" onClick={() => setShowDisplaySettings(false)} aria-label={t("Close", lang)}>
                ✕
              </button>
            </div>
            <div className="ec-sheet-body">
              <div>
                {([
                  { key: "en", label: t("English", lang), value: showEnglish, toggle: () => toggleDisplay("showEnglish") },
                  { key: "ja", label: t("Japanese", lang), value: showJapanese, toggle: () => toggleDisplay("showJapanese") },
                  { key: "romaji", label: t("Romaji", lang), value: showRomaji, toggle: () => toggleDisplay("showRomaji") },
                ] as const).map((item) => (
                  <label key={item.key} className="ec-toggle-row">
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {item.key === "romaji" ? (
                        <span className="ec-lang-badge" style={{ width: 26, height: 26, fontSize: 12, background: "var(--pink-soft)" }}>Ro</span>
                      ) : (
                        <LangBadge lang={item.key} />
                      )}
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={item.toggle}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                    />
                    <span className={`ec-switch${item.value ? " on" : ""}`} aria-hidden />
                  </label>
                ))}
                <div className="ec-toggle-row" style={{ cursor: "default" }}>
                  <span>{t("Chat text size", lang)}</span>
                  <div className="ec-size-picker" role="radiogroup" aria-label={t("Chat text size", lang)}>
                    {CHAT_SIZES.map((s) => (
                      <button
                        key={s.key}
                        role="radio"
                        aria-checked={chatSize === s.key}
                        aria-label={t(s.key === "s" ? "Small" : s.key === "m" ? "Medium" : "Large", lang)}
                        className={chatSize === s.key ? "on" : undefined}
                        style={{ fontSize: s.glyph }}
                        onClick={() => pickChatSize(s.key)}
                      >
                        A
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="ec-btn red sm" style={{ flex: 1 }} onClick={() => { setShowDisplaySettings(false); setShowLeaveConfirm(true); }}>
                  {t("Leave room", lang)}
                </button>
                <button className="ec-btn sm" style={{ flex: 1 }} onClick={() => setShowDisplaySettings(false)}>
                  {t("Done", lang)}
                </button>
              </div>
              <p className="ec-version" style={{ marginTop: 14 }}>
                {convexUrl.replace("https://", "").replace(".convex.cloud", "")} · web v0.1.0
                {process.env.NEXT_PUBLIC_GIT_SHA && process.env.NEXT_PUBLIC_GIT_SHA !== "dev" ? (<><br />github: {process.env.NEXT_PUBLIC_GIT_SHA}</>) : null}
                {process.env.NEXT_PUBLIC_VERCEL_URL ? (<><br />vercel: {process.env.NEXT_PUBLIC_VERCEL_URL}</>) : null}
              </p>
              {/* Game debug panel */}
              <div style={{ marginTop: 12, borderTop: "2.5px dashed var(--line-soft)", paddingTop: 12 }}>
                <TodDebugPanel roomId={roomId} embedded />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Word Rush (lobby, game and results manage their own visibility) */}
      <WordRushGame roomId={roomId as Id<"rooms">} participantId={participantId as Id<"participants">} lang={lang} isRoomHost={me?.role === "host"} />

      {/* Emoji Match game overlay */}
      {emojiMatchGame && emojiMatchOnScreen && dismissedEmojiMatchId !== emojiMatchGame._id && (
        <EmojiMatchGame
          game={emojiMatchGame}
          participants={participants}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onJoinLobby={handleJoinEmojiMatchLobby}
          onLeaveLobby={handleLeaveEmojiMatchLobby}
          onStartGame={handleStartEmojiMatch}
          onFlipCard={handleFlipEmojiMatchCard}
          onResolveMismatch={handleResolveEmojiMatchMismatch}
          onTimeoutTurn={handleTimeoutEmojiMatchTurn}
          onCancelGame={handleCancelEmojiMatch}
          onPlayAgain={handlePlayAgainEmojiMatch}
          onClose={() => setDismissedEmojiMatchId(emojiMatchGame._id)}
          onMinimize={() => setDismissedEmojiMatchId(emojiMatchGame._id)}
        />
      )}

      {/* Emoji Bingo game overlay */}
      {emojiBingoGame && emojiBingoGame.status !== "canceled" && dismissedEmojiBingoId !== emojiBingoGame._id && (
        <EmojiBingoGame
          game={emojiBingoGame}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onJoinLobby={handleJoinEmojiBingoLobby}
          onLeaveLobby={handleLeaveEmojiBingoLobby}
          onStartGame={handleStartEmojiBingo}
          onUpdateSettings={handleUpdateEmojiBingoSettings}
          onRollEmoji={handleRollEmojiBingo}
          onMarkCell={handleMarkEmojiBingoCell}
          onClaimBingo={handleClaimEmojiBingo}
          onCancelGame={handleCancelEmojiBingo}
          onPlayAgain={handlePlayAgainEmojiBingo}
          onClose={() => setDismissedEmojiBingoId(emojiBingoGame._id)}
          onMinimize={() => setDismissedEmojiBingoId(emojiBingoGame._id)}
        />
      )}

      {/* Truth or Dare game overlay — only show for active games */}
      {truthOrDareGame && truthOrDareGame.status === "active" && dismissedTruthOrDareId !== truthOrDareGame._id && (
        <TruthOrDareGame
          game={truthOrDareGame}
          myParticipantId={participantId}
          isHost={me?.role === "host"}
          lang={lang}
          onSubmitChoice={handleSubmitTruthOrDareChoice}
          onSubmitResponse={handleSubmitTruthOrDareResponse}
          onAdvanceTurn={handleAdvanceTruthOrDareTurn}
          onSkipTurn={handleSkipTruthOrDareTurn}
          onEndGame={handleEndTruthOrDare}
          onSubmitRating={handleSubmitTruthOrDareRating}
          onDrawingStateChange={(isDrawing) => {
            if (participantId) {
              setTypingAction({
                participantId: participantId as Id<"participants">,
                action: isDrawing ? "drawing" : undefined,
              }).catch(() => {});
            }
          }}
          onClose={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
          onMinimize={() => setDismissedTruthOrDareId(truthOrDareGame._id)}
        />
      )}

      {/* Floating resume buttons when games are minimized */}
      <div
        style={{
          position: "fixed",
          top: 76,
          right: "max(12px, calc(50% - 248px))",
          zIndex: 150,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        {truthOrDareGame && truthOrDareGame.status === "active" && dismissedTruthOrDareId === truthOrDareGame._id && (
          <button
            className="ec-resume"
            onClick={() => setDismissedTruthOrDareId(null)}
            aria-label={t("Resume Truth or Dare", lang)}
            style={{ background: "var(--pink)" }}
          >
            <Icon name="g-question" size={26} />
            {t("Resume", lang)}
          </button>
        )}
        {emojiMatchGame && emojiMatchOnScreen && dismissedEmojiMatchId === emojiMatchGame._id && (
          <button
            className="ec-resume"
            onClick={() => setDismissedEmojiMatchId(null)}
            aria-label={t("Resume Emoji Match", lang)}
            style={{ background: "var(--violet)" }}
          >
            <Icon name="ui-game" size={26} />
            {t("Resume", lang)}
          </button>
        )}
        {emojiBingoGame && emojiBingoGame.status !== "canceled" && dismissedEmojiBingoId === emojiBingoGame._id && (
          <button
            className="ec-resume"
            onClick={() => setDismissedEmojiBingoId(null)}
            aria-label={t("Resume Emoji Bingo", lang)}
            style={{ background: "var(--mint)" }}
          >
            <Icon name="g-clover" size={26} />
            {t("Resume", lang)}
          </button>
        )}
      </div>

      {/* Game task overlay. Always rendered: it keeps a sent guess on screen until its result has shown */}
      <GameTaskOverlay
        step={myActiveStep && myActiveStep._id !== dismissedGameStepId ? myActiveStep : null}
        onSubmit={handleSubmitGameStep}
        onQuit={async (stepId) => {
          setDismissedGameStepId(stepId);
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
        team={teamInSession(latestGameSession?.teams, participantId)}
      />

      {/* Game picker modal */}
      <GamePickerModal
        isOpen={showGamePicker}
        isHost={me?.role === "host"}
        playerCount={participants.filter((p) => (p as any).online && !(p as any).departed).length}
        hostName={participants.find((p) => p.role === "host")?.nickname ?? ""}
        nextLevel={(latestGameSession?.status === "complete" && latestGameSession?.level && !latestGameSession?.cancelled) ? (latestGameSession.level as number) + 1 : 1}
        onStartGame={handleStartGame}
        onStartWordRush={handleStartWordRush}
        onStartEmojiMatch={handleCreateEmojiMatchLobby}
        onStartEmojiBingo={handleCreateEmojiBingoLobby}
        onStartTruthOrDare={handleCreateTruthOrDare}
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
        meId={participantId}
      />

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div className="ec-modal-backdrop" style={{ zIndex: 210 }} onClick={() => setShowLeaveConfirm(false)}>
          <div className="ec-card ec-modal" onClick={(e) => e.stopPropagation()}>
            <Chatto size={84} bob={false} wave={false} style={{ margin: "0 auto 8px" }} />
            <h2 className="ec-chunky" style={{ fontSize: 22, marginBottom: 6 }}>
              {t("Leave room?", lang)}
            </h2>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 18 }}>
              {t("You can rejoin later with the same room code.", lang)}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ec-btn white sm" style={{ flex: 1 }} onClick={() => setShowLeaveConfirm(false)}>
                {t("Stay", lang)}
              </button>
              <button className="ec-btn red sm" style={{ flex: 1 }} onClick={handleLeave}>
                {t("Leave", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {cutIn && (
        <CutIn burstKey={cutIn.key}>
          {cutIn.avatar && (
            <span className="ec-cutin-av" style={{ background: getAvatarById(cutIn.avatar).color }}>
              <img src={avatarIconSrc(cutIn.avatar)} alt="" />
            </span>
          )}
          {lang === "ja" ? t("{name} JOINED!", lang).replace("{name}", cutIn.name) : t("{name} JOINED!", lang).replace("{name}", cutIn.name).toUpperCase()}
        </CutIn>
      )}
      {confettiKey && <Confetti burstKey={confettiKey} count={50} />}
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<LoadingState lang="ja" />}>
      <RoomContent />
    </Suspense>
  );
}
