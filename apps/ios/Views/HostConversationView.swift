import SwiftUI
import PhotosUI
import CoreImage.CIFilterBuiltins

struct HostConversationView: View {
    let roomId: String
    let hostId: String
    /// Index into RoomTexture.all drawn until the room's own state arrives: the start screen's, which is the room's
    let textureIndex: Int

    @Environment(\.dismiss) var dismiss
    @Environment(\.scenePhase) private var scenePhase
    @StateObject var viewModel: HostRoomViewModel
    @State var messageText = ""
    @FocusState var isTextEditorFocused: Bool
    @State var replyToId: String?
    @State var showCloseConfirmation = false
    @State var showDrawingComposer = false
    @State var showCamera = false
    @State var showPhotoLibrary = false
    @State var selectedPhotoItem: PhotosPickerItem?
    @State var showQRCode = false
    @State var hostLanguage: String = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    @State var contextMenuMessageId: String?
    /// Not @State: row frames change every scroll frame and must not re-render the room
    @State var messageFrames = MessageFrameStore()
    @State var messageToDelete: String?
    @AppStorage("enchatto_showEnglish") var showEnglish = true
    @AppStorage("enchatto_showJapanese") var showJapanese = true
    @AppStorage("enchatto_showRomaji") var showRomaji = true
    @AppStorage(ChatTextSize.storageKey) var chatTextSize: ChatTextSize = .small
    @State var showHostSettings = false
    @State var showInRoom = false
    @State var fullScreenImage: (url: String, messageId: String)?
    @State var showGamePicker = false
    @State var showGameReplay = false
    @State var showGameTask = false
    @State var showQuitGameConfirm = false
    /// The live step when the host quit. Letting go of a held guess uncovers it, and that must not bring
    /// the game cover back
    @State var quitOnStepId: String?
    @State var showEndGameConfirm = false
    @State var hiddenOfflineIds: Set<String> = []  // participants hidden after 10s offline
    @State var showWordRushGame = false
    @State var showEmojiMatchGame = false
    @State var showTruthOrDareGame = false
    @State var minimizedTruthOrDareGameId: String? = nil
    @State var minimizedEmojiMatchGameId: String? = nil
    @State var minimizedEmojiBingoGameId: String? = nil
    @State var minimizedWordRushGameId: String? = nil
    @State var showEmojiBingoGame = false
    @StateObject var speechRecognizer = SpeechRecognizer()
    /// "text" or "voice": what the send button does while dictating; remembered between dictations
    @AppStorage("enchatto_voiceMode") var voiceMode = "text"
    @AppStorage("enchatto_voiceModeHinted") var voiceModeHinted = false
    @State var modeNudge = false
    @State var micLongPressed = false
    @State private var showAttachMenu = false
    @State var toolsOpen = false
    @State var preVoiceText = ""
    @State var transcribingDictation = false
    @State var vibeHot = false
    @State var vibeConfetti = 0
    @State var logoHop = 0
    @State var screenOpenedAt = Date()
    @State var knownParticipantIds: Set<String> = []

    init(roomId: String, hostId: String, textureIndex: Int = 0) {
        self.roomId = roomId
        self.hostId = hostId
        self.textureIndex = textureIndex
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    /// Index into RoomTexture.all this screen is drawn on: the room's own once its state is here
    var shownTextureIndex: Int { viewModel.textureIndex ?? textureIndex }

    var body: some View {
        VStack(spacing: 0) {
            headerView

            gameStatusBarSection

            if viewModel.isOffline || viewModel.pollIssue != nil || viewModel.isSendDelayed {
                offlineBanner
            }

            if viewModel.isLoading {
                Spacer()
                VStack(spacing: 10) {
                    ChattoView(size: 64)
                    Text(L.t("Loading...", hostLanguage))
                        .font(.round(14, .black))
                        .foregroundStyle(EC.inkSoft)
                }
                Spacer()
            } else if viewModel.messages.isEmpty {
                emptyStateView
            } else {
                messageListView
            }

            // Resolved through the view model: the bar stays when the placeholder being replied to becomes the server's copy
            if let replyId = replyToId,
               let replyMsg = viewModel.message(withId: replyId) {
                replyIndicator(for: replyMsg)
            }

            if !viewModel.isClosed {
                inputView
            } else {
                closedBanner
            }
        }
        .background { FadingRoomBackground(index: shownTextureIndex).ignoresSafeArea() }
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .background { offlineTranslatorBridge }
        .onAppear { viewModel.startObserving() }
        .onDisappear { viewModel.stopObserving() }
        .onChange(of: scenePhase) { newPhase in
            viewModel.handleScenePhase(newPhase)
        }
        .onChange(of: viewModel.participants) { participants in
            updateHiddenOfflineIds(participants: participants)
        }
        .alert("Error", isPresented: .init(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
        .sheet(isPresented: $viewModel.showParticipantSheet) {
            settingsSheet
        }
        .sheet(isPresented: $showInRoom) {
            inRoomSheet
        }
        .overlay { hostSettingsOverlay }
        .overlay { contextMenuOverlay }
        .overlay { qrOverlay }
        .overlay {
            ZStack {
                vibeConfettiLayer
                fullScreenImageOverlay
            }
        }
        .overlay(alignment: .topTrailing) { minimizedGameResumeButtons }
        .overlay { DebugConsoleView() }
        .onTapGesture(count: 3) {
            DebugConsole.shared.isEnabled.toggle()
        }
        .confirmationDialog(
            L.t("Delete this message?", hostLanguage),
            isPresented: Binding(
                get: { messageToDelete != nil },
                set: { if !$0 { messageToDelete = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button(L.t("Delete", hostLanguage), role: .destructive) {
                if let id = messageToDelete {
                    Task { await viewModel.deleteMessage(messageId: id) }
                }
            }
        } message: {
            Text(L.t("This will remove the message for everyone.", hostLanguage))
        }
        // A view shown over the room draws ecPaperBackground() on the room's texture. What a sheet or a cover
        // shows is given the index again where it is presented, so that it does not rest on what a
        // presentation inherits from its presenter
        .environment(\.roomTextureIndex, shownTextureIndex)
    }

    // MARK: - Offline translation bridge

    @ViewBuilder
    private var offlineTranslatorBridge: some View {
        if #available(iOS 18.0, *) {
            OfflineTranslator(viewModel: viewModel)
        }
    }

}

#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
