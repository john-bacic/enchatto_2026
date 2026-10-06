"use client";

import { Suspense, memo, useState, useCallback, useEffect, useMemo, useRef, type ComponentProps } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageList } from "@/components/message-list";
import { MessageInput, type MessageInputHandle } from "@/components/message-input";
import { GamePickerModal } from "@/components/game-picker-modal";
import { GameStatusBar } from "@/components/game-status-bar";
import { WordRushGame } from "@/components/word-rush-game";
import { JoinRequired, LoadingState, RoomNotFound } from "@/components/room/center-states";
import { MessageErrorBoundary } from "@/components/room/message-error-boundary";
import { ReactionsFallback } from "@/components/room/reactions-fallback";
import { RoomHeader } from "@/components/room/room-header";
import { OfflineBanner } from "@/components/room/offline-banner";
import { HypeLayer } from "@/components/room/hype-layer";
import { DisplaySettingsSheet } from "@/components/room/display-settings-sheet";
import { LeaveConfirm } from "@/components/room/leave-confirm";
import { JoinCutIn } from "@/components/room/join-cut-in";
import { EmojiMatchLayer } from "@/components/room/emoji-match-layer";
import { EmojiBingoLayer } from "@/components/room/emoji-bingo-layer";
import { TruthOrDareLayer } from "@/components/room/truth-or-dare-layer";
import { ResumeButtons } from "@/components/room/resume-buttons";
import { LostInTranslationReplay, LostInTranslationTask } from "@/components/room/lost-in-translation-layer";
import { RoomBackground } from "@/components/ui/effects";
import { avatarTint } from "@/lib/types";
import { textureForRoom } from "@/lib/textures";
import { t } from "@/lib/i18n";
import { endGameRule } from "@/lib/end-game";
import { useReactionsByMessage } from "@/lib/reactions";
import { byId, useStableList } from "@/lib/stable";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { CHAT_SIZES, useDisplayPrefs } from "@/hooks/use-display-prefs";
import { usePresence } from "@/hooks/use-presence";
import { useTypingAction } from "@/hooks/use-typing-action";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRoomRedirects } from "@/hooks/use-room-redirects";
import { useOutbox } from "@/hooks/use-outbox";
import { useVibe } from "@/hooks/use-vibe";
import { useLostInTranslation } from "@/hooks/games/use-lost-in-translation";
import { useWordRushStarter } from "@/hooks/games/use-word-rush-starter";
import { useEmojiMatch } from "@/hooks/games/use-emoji-match";
import { useEmojiBingo } from "@/hooks/games/use-emoji-bingo";
import { useTruthOrDare } from "@/hooks/games/use-truth-or-dare";
import { TOKEN_PARAM, tokenFor, useAuthedMutation, useConvexSiteUrl, useConvexUrl } from "@/lib/convex";
import "@/app/screens.css";

/**
 * The message list of a room that keeps its reactions by room (`rooms.reactionsByRoom`): one subscription answers
 * for every message, and the list hands each bubble its own message's. The query is asked of the deployment the
 * room was read from, as every query under the page's provider is (lib/convex.tsx). A reaction draws this
 * component, the list and the bubble it is on, and not the page.
 */
const RoomReactionsMessageList = memo(function RoomReactionsMessageList({
  roomId,
  ...listProps
}: ComponentProps<typeof MessageList> & { roomId: Id<"rooms"> }) {
  const reactions = useReactionsByMessage(useQuery(api.reactions.getRoomReactionSummaries, { roomId }));
  return <MessageList {...listProps} reactions={reactions} />;
});

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

  // Network status & offline queue
  const { isOnline } = useNetworkStatus();

  // Real-time subscriptions
  const roomState = useQuery(api.rooms.getRoomState, {
    roomId: roomId as Id<"rooms">,
  });
  const messages = useQuery(api.messages.getRoomMessages, {
    roomId: roomId as Id<"rooms">,
  });

  const { dismissedGameStepId, setDismissedGameStepId, activeGameSession, myActiveStep, latestGameSession, gameReplay, gameStatus, activeTimerSeconds, cancelGameMutation, handleStartGame, handleSubmitGameStep } = useLostInTranslation({ roomId, participantId, setShowGamePicker });
  const { wordRushGame, cancelWordRush, handleStartWordRush } = useWordRushStarter({ roomId, participantId, setShowGamePicker, cancelGameMutation });

  const taskOpen = myActiveStep != null && myActiveStep._id !== dismissedGameStepId;
  const { emojiMatchGame, emojiMatchOnScreen, dismissedEmojiMatchId, setDismissedEmojiMatchId, cancelEmojiMatch, handleCreateEmojiMatchLobby, handleJoinEmojiMatchLobby, handleLeaveEmojiMatchLobby, handleStartEmojiMatch, handleFlipEmojiMatchCard, handleResolveEmojiMatchMismatch, handleCancelEmojiMatch, handleTimeoutEmojiMatchTurn, handlePlayAgainEmojiMatch } = useEmojiMatch({ roomId, participantId, taskOpen, setShowGamePicker });
  const { emojiBingoGame, dismissedEmojiBingoId, setDismissedEmojiBingoId, cancelEmojiBingo, handleCreateEmojiBingoLobby, handleJoinEmojiBingoLobby, handleLeaveEmojiBingoLobby, handleUpdateEmojiBingoSettings, handleStartEmojiBingo, handleRollEmojiBingo, handleMarkEmojiBingoCell, handleClaimEmojiBingo, handleCancelEmojiBingo, handlePlayAgainEmojiBingo } = useEmojiBingo({ roomId, participantId, setShowGamePicker });
  const { truthOrDareGame, truthOrDareFailure, dismissedTruthOrDareId, setDismissedTruthOrDareId, endTruthOrDare, handleCreateTruthOrDare, handleSubmitTruthOrDareChoice, handleSubmitTruthOrDareResponse, handleAdvanceTruthOrDareTurn, handleSkipTruthOrDareTurn, handleEndTruthOrDare, handleSubmitTruthOrDareRating } = useTruthOrDare({ roomId, participantId, convexSiteUrl, setShowGamePicker });

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

  const { handleLeave } = usePresence({ participantId, convexUrl, router });
  const addReaction = useAuthedMutation(api.reactions.addReaction);
  const removeReaction = useAuthedMutation(api.reactions.removeReaction);

  const { showEnglish, showJapanese, showRomaji, chatSize, toggleDisplay, pickChatSize } = useDisplayPrefs(participantId);

  const participants = roomState?.participants ?? [];
  const messageList = messages ?? [];

  const me = participants.find((p) => p._id === participantId);
  const lang = me?.preferredLanguage ?? "ja";

  const { handleTypingChange, handleDrawingStateChange } = useTypingAction({ participantId, myActiveStep, storedAction: me?.typingAction });

  // A guest's header, input bar and browser chrome take a light tint of their avatar colour
  const meTint = me && me.role !== "host" ? avatarTint(me.avatar.value) : undefined;
  useThemeColor(meTint);

  useRoomRedirects({ participantId, tokenMissing, roomState, me, router });

  const replyMessage = replyTo
    ? messageList.find((m) => m._id === replyTo)
    : null;

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

  // The people as the message list draws them: the fields its props name, which leave out lastSeenAt and whatever
  // else a heartbeat or a keystroke moves. A person who is as they were is the object the list already has
  const shownParticipants = useStableList(
    participants.map(({ _id, nickname, role, avatar }) => ({ _id, nickname, role, avatar })),
    byId
  );

  // Who is typing, drawing or speaking: the same list, and the same people in it, until one of them starts or stops
  const typingParticipants = useStableList(
    participants
      .filter((p) => p._id !== participantId && (p as any).typingAction)
      .map((p) => ({
        _id: p._id,
        nickname: p.nickname,
        avatar: p.avatar,
        typingAction: (p as any).typingAction as "typing" | "drawing" | "voicing",
        drawingStartedAt: (p as any).drawingStartedAt as number | undefined,
        timerSeconds: activeTimerSeconds,
      })),
    byId
  );

  const handleReply = useCallback((messageId: string) => {
    setReplyTo(messageId);
  }, []);

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // A tap on a suggestion under a message puts it in the message box. The box keeps its own text, so it is asked
  // through its handle: the handler is one function for the life of the page, so a tap draws neither the list nor
  // a bubble. The tap itself draws the box alone; the page is drawn when the room answers the typing notice the tap
  // sends, as it is for a keystroke. A closed room has no box, and a tap there does nothing
  const messageInput = useRef<MessageInputHandle>(null);
  const handleSuggestionTap = useCallback((suggestion: string) => messageInput.current?.fill(suggestion), []);

  const handleViewGameResults = useCallback(() => setShowGameReplay(true), []);

  const { offlineQueue, queuedAsMessages, handleSend, handleSendImage, handleSendVoice, handleSendDrawing } = useOutbox({ roomId, participantId, isOnline, replyTo, setReplyTo, lang, convexSiteUrl });

  // Filter out host's own join/leave/away/back system messages (keep game messages)
  const roomHostId = roomState?.room?.hostId;
  // A message the server sent again as it was is the object the list already has
  const shownMessages = useStableList(messageList, byId);
  const displayMessages = useMemo(
    () =>
      [...shownMessages, ...queuedAsMessages].filter((m) => {
        if (m.kind === "system" && roomHostId && m.senderId === roomHostId) {
          const text = m.text ?? "";
          if (text.startsWith("game:") || text.startsWith("game_cancelled:") || text.startsWith("game_correct:") || text.startsWith("game_wrong:") || text.startsWith("game_summary:") || text.startsWith("emoji_match_summary:") || text.startsWith("emoji_match_complete:")) return true;
          return false;
        }
        return true;
      }),
    [shownMessages, queuedAsMessages, roomHostId]
  );

  // ─── Vibe / hype ──────────────────────────────────────────────────────────
  const { vibe, combo, mult, hype, recentCount, switches, showVibeInfo, setShowVibeInfo, vibeRef, closeVibeInfo, floaters, cutIn, confettiKey, logoHop } = useVibe({ messages, messageList, participants, participantId, roomState });

  // Loading state
  if (roomState === undefined || messages === undefined) {
    return <LoadingState lang={lang} />;
  }

  // Room not found
  if (roomState === null) {
    return <RoomNotFound lang={lang} />;
  }

  const background = <RoomBackground texture={textureForRoom(roomState.room)} />;

  // No participant ID — user needs to join first
  if (!participantId) {
    const joinCode = roomState.room.joinCode;
    return <JoinRequired background={background} lang={lang} joinCode={joinCode} />;
  }

  const isClosed = roomState.room.status === "closed";

  // Count ALL participants (including self) to match iOS header
  const allVisible = participants.filter((p) => !(p as any).departed);
  const onlineCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "online").length;
  const awayCount = allVisible.filter((p) => (p as any).online && ((p as any).presence ?? "online") === "away").length;
  const crowd = allVisible.filter((p) => (p as any).online).slice(0, 6);

  const { isGameActive, onEndGame } = endGameRule({ wordRushGame, activeGameSession, emojiMatchGame, emojiBingoGame, truthOrDareGame, me, lang, endTruthOrDare, participantId, cancelEmojiBingo, cancelEmojiMatch, cancelWordRush, cancelGameMutation, roomId });

  const chatScale = CHAT_SIZES.find((s) => s.key === chatSize)?.scale ?? 1;

  // What the message list is handed, whichever way the room's reactions are read
  const listProps: ComponentProps<typeof MessageList> = {
    messages: displayMessages,
    participants: shownParticipants,
    currentParticipantId: participantId,
    preferredLanguage: lang,
    onReply: handleReply,
    onToggleReaction: isOnline ? handleToggleReaction : undefined,
    onSuggestionTap: handleSuggestionTap,
    typingParticipants,
    lang,
    showEnglish,
    showJapanese,
    showRomaji,
    isGameComplete: latestGameSession?.status === "complete" && !activeGameSession,
    gameCompletedAt: latestGameSession?.completedAt,
    onViewGameResults: handleViewGameResults,
    truthOrDareGame,
    hype,
  };

  // A room made since reactions carry their room is asked for all of them at once. Any other is not: the server
  // answers the room's query there by reading every message, again each time one of them changes, and each bubble
  // subscribes to its own message's reactions instead. So does each bubble once the server has refused the room's
  // query (ReactionsFallback): the conversation stays on screen
  const reactionsByRoom = roomState.room.reactionsByRoom === true;

  return (
    <div className="ec-room" style={{ "--chat-scale": chatScale, "--me-tint": meTint } as React.CSSProperties}>
      {background}

      {/* Header */}
      <RoomHeader me={me} setShowDisplaySettings={setShowDisplaySettings} lang={lang} logoHop={logoHop} hype={hype} isClosed={isClosed} onlineCount={onlineCount} awayCount={awayCount} vibeRef={vibeRef} setShowVibeInfo={setShowVibeInfo} showVibeInfo={showVibeInfo} vibe={vibe} recentCount={recentCount} switches={switches} mult={mult} closeVibeInfo={closeVibeInfo} participants={participants} participantId={participantId} roomState={roomState} setShowLeaveConfirm={setShowLeaveConfirm} />

      {/* Offline banner */}
      {!isOnline && (
        <OfflineBanner lang={lang} offlineQueue={offlineQueue} />
      )}

      {/* Game status bar */}
      {gameStatus && <GameStatusBar status={gameStatus} lang={lang} meId={participantId} />}

      {/* Messages + hype layers */}
      <div className="ec-stage">
        <HypeLayer hype={hype} crowd={crowd} combo={combo} lang={lang} mult={mult} />

        <MessageErrorBoundary lang={lang}>
          {reactionsByRoom ? (
            <ReactionsFallback fallback={<MessageList {...listProps} />}>
              <RoomReactionsMessageList roomId={roomId as Id<"rooms">} {...listProps} />
            </ReactionsFallback>
          ) : (
            <MessageList {...listProps} />
          )}
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
          ref={messageInput}
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendDrawing={handleSendDrawing}
          onSendVoice={handleSendVoice}
          onGameTap={() => setShowGamePicker(true)}
          isGameActive={isGameActive}
          onEndGame={onEndGame}
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
        <DisplaySettingsSheet setShowDisplaySettings={setShowDisplaySettings} me={me} lang={lang} showEnglish={showEnglish} toggleDisplay={toggleDisplay} showJapanese={showJapanese} showRomaji={showRomaji} chatSize={chatSize} pickChatSize={pickChatSize} setShowLeaveConfirm={setShowLeaveConfirm} convexUrl={convexUrl} roomId={roomId} />
      )}

      {/* Word Rush (lobby, game and results manage their own visibility) */}
      <WordRushGame roomId={roomId as Id<"rooms">} participantId={participantId as Id<"participants">} lang={lang} isRoomHost={me?.role === "host"} />

      {/* Emoji Match game overlay */}
      <EmojiMatchLayer emojiMatchGame={emojiMatchGame} emojiMatchOnScreen={emojiMatchOnScreen} dismissedEmojiMatchId={dismissedEmojiMatchId} participants={participants} participantId={participantId} me={me} lang={lang} handleJoinEmojiMatchLobby={handleJoinEmojiMatchLobby} handleLeaveEmojiMatchLobby={handleLeaveEmojiMatchLobby} handleStartEmojiMatch={handleStartEmojiMatch} handleFlipEmojiMatchCard={handleFlipEmojiMatchCard} handleResolveEmojiMatchMismatch={handleResolveEmojiMatchMismatch} handleTimeoutEmojiMatchTurn={handleTimeoutEmojiMatchTurn} handleCancelEmojiMatch={handleCancelEmojiMatch} handlePlayAgainEmojiMatch={handlePlayAgainEmojiMatch} setDismissedEmojiMatchId={setDismissedEmojiMatchId} />

      {/* Emoji Bingo game overlay */}
      <EmojiBingoLayer emojiBingoGame={emojiBingoGame} dismissedEmojiBingoId={dismissedEmojiBingoId} participantId={participantId} me={me} lang={lang} handleJoinEmojiBingoLobby={handleJoinEmojiBingoLobby} handleLeaveEmojiBingoLobby={handleLeaveEmojiBingoLobby} handleStartEmojiBingo={handleStartEmojiBingo} handleUpdateEmojiBingoSettings={handleUpdateEmojiBingoSettings} handleRollEmojiBingo={handleRollEmojiBingo} handleMarkEmojiBingoCell={handleMarkEmojiBingoCell} handleClaimEmojiBingo={handleClaimEmojiBingo} handleCancelEmojiBingo={handleCancelEmojiBingo} handlePlayAgainEmojiBingo={handlePlayAgainEmojiBingo} setDismissedEmojiBingoId={setDismissedEmojiBingoId} />

      {/* Truth or Dare game overlay — only show for active games. A failed action of the game is told here too */}
      <TruthOrDareLayer truthOrDareGame={truthOrDareGame} truthOrDareFailure={truthOrDareFailure} dismissedTruthOrDareId={dismissedTruthOrDareId} participantId={participantId} me={me} lang={lang} handleSubmitTruthOrDareChoice={handleSubmitTruthOrDareChoice} handleSubmitTruthOrDareResponse={handleSubmitTruthOrDareResponse} handleAdvanceTruthOrDareTurn={handleAdvanceTruthOrDareTurn} handleSkipTruthOrDareTurn={handleSkipTruthOrDareTurn} handleEndTruthOrDare={handleEndTruthOrDare} handleSubmitTruthOrDareRating={handleSubmitTruthOrDareRating} handleDrawingStateChange={handleDrawingStateChange} setDismissedTruthOrDareId={setDismissedTruthOrDareId} />

      {/* Floating resume buttons when games are minimized */}
      <ResumeButtons truthOrDareGame={truthOrDareGame} dismissedTruthOrDareId={dismissedTruthOrDareId} setDismissedTruthOrDareId={setDismissedTruthOrDareId} lang={lang} emojiMatchGame={emojiMatchGame} emojiMatchOnScreen={emojiMatchOnScreen} dismissedEmojiMatchId={dismissedEmojiMatchId} setDismissedEmojiMatchId={setDismissedEmojiMatchId} emojiBingoGame={emojiBingoGame} dismissedEmojiBingoId={dismissedEmojiBingoId} setDismissedEmojiBingoId={setDismissedEmojiBingoId} />

      {/* Game task overlay. Always rendered: it keeps a sent guess on screen until its result has shown */}
      <LostInTranslationTask myActiveStep={myActiveStep} dismissedGameStepId={dismissedGameStepId} handleSubmitGameStep={handleSubmitGameStep} setDismissedGameStepId={setDismissedGameStepId} me={me} cancelGameMutation={cancelGameMutation} roomId={roomId} participantId={participantId} lang={lang} latestGameSession={latestGameSession} />

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
      <LostInTranslationReplay showGameReplay={showGameReplay} gameReplay={gameReplay} me={me} latestGameSession={latestGameSession} handleStartGame={handleStartGame} setShowGameReplay={setShowGameReplay} lang={lang} participantId={participantId} />

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <LeaveConfirm setShowLeaveConfirm={setShowLeaveConfirm} lang={lang} handleLeave={handleLeave} />
      )}

      <JoinCutIn cutIn={cutIn} lang={lang} confettiKey={confettiKey} />
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
