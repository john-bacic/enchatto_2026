"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { GamePickerModal } from "@/components/game-picker-modal";
import { GameTaskOverlay } from "@/components/game-task-overlay";
import { GameReplayModal } from "@/components/game-replay-modal";
import { GameStatusBar } from "@/components/game-status-bar";
import { EmojiMatchGame } from "@/components/emoji-match-game";
import { TruthOrDareGame } from "@/components/truth-or-dare-game";
import { EmojiBingoGame } from "@/components/emoji-bingo-game";
import { WordRushGame } from "@/components/word-rush-game";
import { JoinRequired, LoadingState, RoomNotFound } from "@/components/room/center-states";
import { MessageErrorBoundary } from "@/components/room/message-error-boundary";
import { RoomHeader } from "@/components/room/room-header";
import { OfflineBanner } from "@/components/room/offline-banner";
import { HypeLayer } from "@/components/room/hype-layer";
import { DisplaySettingsSheet } from "@/components/room/display-settings-sheet";
import { LeaveConfirm } from "@/components/room/leave-confirm";
import { JoinCutIn } from "@/components/room/join-cut-in";
import { Icon } from "@/components/ui/icon";
import { RoomBackground } from "@/components/ui/effects";
import { avatarTint } from "@/lib/types";
import { textureForRoom } from "@/lib/textures";
import { t } from "@/lib/i18n";
import { teamInSession } from "@/lib/game-teams";
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
  const { truthOrDareGame, dismissedTruthOrDareId, setDismissedTruthOrDareId, endTruthOrDare, handleCreateTruthOrDare, handleSubmitTruthOrDareChoice, handleSubmitTruthOrDareResponse, handleAdvanceTruthOrDareTurn, handleSkipTruthOrDareTurn, handleEndTruthOrDare, handleSubmitTruthOrDareRating } = useTruthOrDare({ roomId, participantId, convexSiteUrl, setShowGamePicker });

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

  const { offlineQueue, queuedAsMessages, handleSend, handleSendImage, handleSendVoice, handleSendDrawing } = useOutbox({ roomId, participantId, isOnline, replyTo, setReplyTo, lang, convexSiteUrl });

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

  const wordRushLive = wordRushGame != null && (wordRushGame.status === "lobby" || wordRushGame.status === "active");

  const chatScale = CHAT_SIZES.find((s) => s.key === chatSize)?.scale ?? 1;

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
        <DisplaySettingsSheet setShowDisplaySettings={setShowDisplaySettings} me={me} lang={lang} showEnglish={showEnglish} toggleDisplay={toggleDisplay} showJapanese={showJapanese} showRomaji={showRomaji} chatSize={chatSize} pickChatSize={pickChatSize} setShowLeaveConfirm={setShowLeaveConfirm} convexUrl={convexUrl} roomId={roomId} />
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
