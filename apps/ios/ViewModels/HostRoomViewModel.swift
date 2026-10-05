import Foundation
import SwiftUI
import UIKit
import Combine
import Network
import NaturalLanguage
import Translation
import AVFoundation

@MainActor
class HostRoomViewModel: ObservableObject {
    @Published var room: Room? {
        // The saved record keeps the background the room is drawn on: the start screen shows it on the way back out
        didSet {
            guard let texture = textureIndex, texture != Self.textureIndex(of: oldValue) else { return }
            SavedHostRoom.setBackground(texture, roomId: roomId)
        }
    }
    @Published var participants: [Participant] = []
    @Published var messages: [Message] = []
    @Published var reactionSummaries: [String: [ReactionSummaryEntry]] = [:]
    @Published var isLoading = true
    @Published var error: String?
    @Published var showParticipantSheet = false
    @Published var selectedParticipant: Participant?
    @Published var processingCount = 0
    @Published var activeGameSession: GameSession?
    @Published var myActiveStep: GameStep?
    @Published var latestGameSession: GameSession?
    @Published var gameReplay: GameReplay?
    @Published var gameStatus: GameStatus?
    @Published var drawCountdownTimeLeft: Int = -1

    // MARK: - Word Rush state
    @Published var activeWordRushGame: WordRushGame?
    /// Short-lived error toast for the Word Rush UI ("Already answered", upload failures…)
    @Published var wordRushError: String?
    /// Keyed by `cardKey` — the server hides my pick/result until reveal
    @Published var wordRushMyChoices: [String: Int] = [:]
    @Published var wordRushMyResults: [String: WordRushResult] = [:]
    @Published var wordRushHints: [String: String] = [:]
    /// Keyed by `phaseKey`
    @Published var wordRushMyVotes: [String: WordRushVote] = [:]
    @Published var wordRushDismissedId: String?
    /// Set by the Word Rush cover while it's on screen so polling stays fast even with no live game
    var wordRushCoverOpen = false {
        didSet { if wordRushCoverOpen { startWordRushFastPoll() } }
    }
    var wordRushSeenLiveIds: Set<String> = []
    var wordRushPollTask: Task<Void, Never>?

    // MARK: - Emoji Match state
    @Published var activeEmojiMatchGame: EmojiMatchGame?
    var emojiMatchPollTask: Task<Void, Never>?
    /// Emoji Match flips the host has sent that the server has not answered yet, with when each was tapped.
    /// On a clock that only goes forward: the device's own can be set back while a flip is out
    var emojiMatchFlipsInFlight: [UUID: ContinuousClock.Instant] = [:]
    /// Goes up when a flip is sent and again when it is answered or fails. A board fetched before either may
    /// not show it
    var emojiMatchEpoch = 0

    // MARK: - Emoji Bingo state
    @Published var activeEmojiBingoGame: EmojiBingoGame?
    var emojiBingoPollTask: Task<Void, Never>?

    // MARK: - Truth or Dare state
    @Published var activeTruthOrDareGame: TruthOrDareGame?
    @Published var isTruthOrDareSubmitting = false
    var truthOrDarePollTask: Task<Void, Never>?

    // MARK: - Draw countdown beep state
    var drawCountdownTimer: Timer?
    var trackedDrawStartMs: Double?
    /// Holds strong reference to AVAudioPlayer so it doesn't deallocate mid-playback.
    var beepPlayer: AVAudioPlayer?

    let roomId: String
    let hostId: String
    let api: EnchattoAPI
    let processor: MessageProcessor
    var pollTask: Task<Void, Never>?
    var processingTask: Task<Void, Never>?
    var heartbeatTask: Task<Void, Never>?
    /// The heartbeat outlives backgrounding by a few seconds; it must not report the host as back
    var sceneInBackground = false
    /// Track message IDs currently being processed to avoid duplicates
    var processingMessageIds: Set<String> = []

    // MARK: - Offline support
    let networkMonitor = NetworkMonitor()
    @Published var isOffline: Bool = false
    var offlineQueue: [QueuedMessage] = []
    var isFlushing = false
    /// The pass over the send queue that is running, kept so it can be cancelled
    var flushTask: Task<Void, Never>?
    /// Id of the queued message that pass is sending right now
    var sendingId: String?
    /// Local "queued-…" id → server id once delivered; a reply, reaction or delete that still holds the local id goes through this
    var sentIds: [String: String] = [:] {
        didSet { deliveredIds = Set(sentIds.values) }
    }
    /// Server ids of the messages this device sent through its queue
    var deliveredIds = Set<String>()
    private var cancellables = Set<AnyCancellable>()

    /// Incremented when a text message is going to wait in the queue (offline, or a send failed
    /// and will be retried), so the OfflineTranslator view can call `invalidate()` on its configs.
    @Published var offlineQueueVersion = 0

    /// Whether the on-device en↔ja translation packs are installed.
    @Published var translationPacksInstalled = true
    /// Set to true from the download banner; the OfflineTranslator observes this.
    @Published var requestTranslationDownload = false

    init(
        roomId: String,
        hostId: String,
        api: EnchattoAPI = AppConfig.makeAPI(),
        processor: MessageProcessor = MessageProcessor()
    ) {
        self.roomId = roomId
        self.hostId = hostId
        self.api = api
        self.processor = processor

        // Bind isOffline to inverse of networkMonitor.isConnected
        networkMonitor.$isConnected
            .map { !$0 }
            .assign(to: &$isOffline)

        // Fire reconnect handler
        networkMonitor.onReconnect = { [weak self] in
            Task { @MainActor [weak self] in
                self?.handleReconnect()
            }
        }

        // Close room when the app is killed while still running. iOS usually kills a suspended app
        // without this notification; the server closes those rooms once the host's heartbeat stops.
        NotificationCenter.default.publisher(for: UIApplication.willTerminateNotification)
            .sink { [weak self] _ in
                guard let self else { return }
                let roomId = self.roomId
                let api = self.api
                // The process ends when this returns, so wait (briefly) for the request to go out
                let done = DispatchSemaphore(value: 0)
                Task.detached {
                    try? await api.closeRoom(roomId: roomId)
                    done.signal()
                }
                _ = done.wait(timeout: .now() + 2)
            }
            .store(in: &cancellables)
    }

    // MARK: - Poll health

    enum PollIssue: Equatable {
        case reconnecting   // server unreachable or busy; polling goes on, more slowly
        case failing        // server answers with something a retry won't fix (4xx, unreadable reply)
    }

    /// Set when two polls in a row have failed, cleared by the next complete poll. Drives a banner, never the alert.
    @Published var pollIssue: PollIssue?
    var consecutivePollFailures = 0
    /// Last poll failure written to the debug console, so one that repeats is logged once
    var lastPollFailureLogged: String?

    var pushRegistered = false

    /// Sends the background the host picked in Settings, and then whatever the host has picked meanwhile
    var backgroundTask: Task<Void, Never>?
    /// Goes up when a background is sent and again when the request is answered or fails. A state asked for
    /// before either may be from before the server took the change
    var backgroundEpoch = 0

    /// Language picked on this device. The server's copy sets the host's Word Rush direction, the language of
    /// Lost in Translation prompts and of the join push, and the badge guests see.
    var hostLanguage = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    var hostLanguageTask: Task<Void, Never>?
    /// Earliest next send: never again after a server that refused (one without the route), 30 s after any other failure
    var hostLanguageRetryAfter = Date.distantPast

    /// The refresh the last `commitGuess` started: the one that moves `myActiveStep` on from that guess
    var guessRefresh: Task<Void, Never>?

    /// A guess the host has sent whose Correct! / Wrong! has yet to be seen. The server closes a guess step as it
    /// takes the guess, so the next poll finds no step, or the host's next drawing; the game cover goes on showing
    /// this one. Presentation only: `myActiveStep` and the polls are what they are without it
    @Published var heldGuessStep: GameStep?
    /// Ends the hold when nothing else has: every hold has a deadline
    var guessHoldTimer: Task<Void, Never>?
    /// The guess is on its way and its reply is not in yet
    var guessHoldAwaitsReply = false

    // MARK: - Helpers

    func participant(for id: String) -> Participant? {
        participants.first { $0.id == id }
    }

    var onlineCount: Int {
        participants.filter { $0.online && !$0.isAway }.count
    }

    var awayCount: Int {
        participants.filter(\.isAway).count
    }

    var guestParticipants: [Participant] {
        participants.filter { $0.role != .host }
    }

    var isClosed: Bool {
        room?.status == .closed
    }

    var isProcessing: Bool {
        processingCount > 0
    }

    /// Participants (other than host) who are currently typing or drawing
    var typingParticipants: [Participant] {
        participants.filter { $0.id != hostId && $0.typingAction != nil }
    }

    var lastTypingAction: String?

}
