import SwiftUI
import PhotosUI
import CoreImage.CIFilterBuiltins
import Translation
import AudioToolbox

// PreferenceKey to capture message frames for context menu positioning
private struct MessageFramePreferenceKey: PreferenceKey {
    static var defaultValue: [String: CGRect] = [:]
    static func reduce(value: inout [String: CGRect], nextValue: () -> [String: CGRect]) {
        value.merge(nextValue(), uniquingKeysWith: { $1 })
    }
}


struct HostConversationView: View {
    let roomId: String
    let hostId: String

    @Environment(\.dismiss) private var dismiss
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var viewModel: HostRoomViewModel
    @State private var messageText = ""
    @FocusState private var isTextEditorFocused: Bool
    @State private var replyToId: String?
    @State private var showCloseConfirmation = false
    @State private var showDrawingComposer = false
    @State private var showCamera = false
    @State private var showPhotoLibrary = false
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showQRCode = false
    @State private var hostLanguage: String = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    @State private var contextMenuMessageId: String?
    @State private var messageFrames: [String: CGRect] = [:]
    @State private var messageToDelete: String?
    @State private var showEnglish = true
    @State private var showJapanese = true
    @State private var showRomaji = true
    @State private var showHostSettings = false
    @State private var tooltipParticipant: Participant?
    @State private var fullScreenImage: (url: String, messageId: String)?
    @State private var showGamePicker = false
    @State private var showGameReplay = false
    @State private var showGameTask = false
    @State private var showQuitGameConfirm = false
    @State private var showEndGameConfirm = false
    @State private var hiddenOfflineIds: Set<String> = []  // participants hidden after 10s offline
    @State private var showEmojifyrGame = false
    @State private var showEmojiMatchGame = false
    @State private var showTruthOrDareGame = false
    @StateObject private var speechRecognizer = SpeechRecognizer()

    init(roomId: String, hostId: String) {
        self.roomId = roomId
        self.hostId = hostId
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    var body: some View {
        VStack(spacing: 0) {
            headerView

            gameStatusBarSection

            if viewModel.isOffline {
                offlineBanner
            }

            if viewModel.isLoading {
                Spacer()
                ProgressView(L.t("Loading...", hostLanguage))
                Spacer()
            } else if viewModel.messages.isEmpty {
                emptyStateView
            } else {
                messageListView
            }

            if let replyId = replyToId,
               let replyMsg = viewModel.messages.first(where: { $0.id == replyId }) {
                replyIndicator(for: replyMsg)
            }

            if !viewModel.isClosed {
                inputView
            } else {
                closedBanner
            }
        }
        .navigationBarBackButtonHidden(true)
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
        .confirmationDialog(L.t("Close this room?", hostLanguage), isPresented: $showCloseConfirmation, titleVisibility: .visible) {
            Button(L.t("Close Room", hostLanguage), role: .destructive) {
                Task { await viewModel.closeRoom() }
            }
        } message: {
            Text(L.t("All participants will be disconnected. This cannot be undone.", hostLanguage))
        }
        .sheet(isPresented: $viewModel.showParticipantSheet) {
            participantSheet
        }
        .overlay { hostSettingsOverlay }
        .overlay { contextMenuOverlay }
        .overlay { qrOverlay }
        .overlay { fullScreenImageOverlay }
        .overlay {
            if let participant = tooltipParticipant {
                Color.black.opacity(0.01)
                    .onTapGesture {
                        withAnimation { tooltipParticipant = nil }
                    }
                    .overlay(alignment: .topTrailing) {
                        HStack(spacing: 4) {
                            Text(participant.avatarEmoji)
                                .font(.system(size: 12))
                            Text(participant.nickname)
                                .font(.caption2)
                                .fontWeight(.medium)
                            if participant.isAway {
                                Text("·").foregroundStyle(.orange)
                                Text(L.t("Away", hostLanguage))
                                    .font(.caption2)
                                    .foregroundStyle(.orange)
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color(.systemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .shadow(color: .black.opacity(0.15), radius: 6, y: 2)
                        .padding(.top, 54)
                        .padding(.trailing, 44)
                        .transition(.opacity)
                    }
            }
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
    }

    // MARK: - QR Overlay

    @ViewBuilder
    private var qrOverlay: some View {
        if showQRCode, let joinCode = viewModel.room?.joinCode {
            QRCodeFloatingPanel(joinCode: joinCode, isPresented: $showQRCode, lang: hostLanguage)
        }
    }

    // MARK: - Full-screen image overlay

    @ViewBuilder
    private var fullScreenImageOverlay: some View {
        if let info = fullScreenImage {
            ZStack {
                Color.black.opacity(0.85)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation { fullScreenImage = nil }
                    }

                AsyncImage(url: URL(string: info.url)) { image in
                    image
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .padding()
                        .onLongPressGesture {
                            let impact = UIImpactFeedbackGenerator(style: .medium)
                            impact.impactOccurred()
                            withAnimation { fullScreenImage = nil }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                                contextMenuMessageId = info.messageId
                            }
                        }
                } placeholder: {
                    ProgressView()
                        .tint(.white)
                }
            }
            .transition(.opacity)
        }
    }

    // MARK: - Context menu overlay

    @ViewBuilder
    private var hostSettingsOverlay: some View {
        if showHostSettings {
            // Tap-outside dismiss layer
            Color.black.opacity(0.01)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation(.easeOut(duration: 0.2)) {
                        showHostSettings = false
                    }
                }

            GeometryReader { _ in
                VStack(alignment: .leading, spacing: 0) {
                    Button {
                        showEnglish.toggle()
                    } label: {
                        Label(L.t("English", hostLanguage), systemImage: showEnglish ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(showEnglish ? .primary : .secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)

                    Button {
                        showJapanese.toggle()
                    } label: {
                        Label(L.t("Japanese", hostLanguage), systemImage: showJapanese ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(showJapanese ? .primary : .secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)

                    Button {
                        showRomaji.toggle()
                    } label: {
                        Label(L.t("Romaji", hostLanguage), systemImage: showRomaji ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(showRomaji ? .primary : .secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)

                    Divider()
                        .padding(.vertical, 4)

                    Button {
                        showHostSettings = false
                        viewModel.showParticipantSheet = true
                    } label: {
                        Label(L.t("Participants", hostLanguage), systemImage: "person.2")
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)

                    Divider()
                        .padding(.vertical, 4)

                    Button {
                        showHostSettings = false
                        showCloseConfirmation = true
                    } label: {
                        Label(L.t("Close Room", hostLanguage), systemImage: "xmark.circle")
                            .foregroundStyle(.red)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                }
                .padding(.vertical, 8)
                .fixedSize()
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
                .offset(x: 12, y: 44)
            }
            .transition(.opacity)
        }
    }

    @ViewBuilder
    private var contextMenuOverlay: some View {
        if let menuMessageId = contextMenuMessageId,
           let message = viewModel.messages.first(where: { $0.id == menuMessageId }),
           let frame = messageFrames[menuMessageId] {
            let sender = viewModel.participant(for: message.senderId)
            let replyTarget = viewModel.replyTarget(for: message)
            let replyTargetSender = replyTarget.flatMap { viewModel.participant(for: $0.senderId) }

            MessageContextMenuOverlay(
                message: message,
                sender: sender,
                isOwn: message.senderId == hostId,
                replyTarget: replyTarget,
                replyTargetSender: replyTargetSender,
                reactions: viewModel.reactionSummaries[message.id] ?? [],
                hostId: hostId,
                preferredLanguage: hostLanguage,
                sourceFrame: frame,
                showEnglish: showEnglish,
                showJapanese: showJapanese,
                showRomaji: showRomaji,
                isPresented: Binding(
                    get: { contextMenuMessageId != nil },
                    set: { if !$0 { contextMenuMessageId = nil } }
                ),
                onReact: { emoji in
                    Task {
                        let summaries = viewModel.reactionSummaries[message.id] ?? []
                        if let existing = summaries.first(where: { $0.participantIds.contains(hostId) }) {
                            await viewModel.removeReaction(messageId: message.id, emoji: existing.emoji)
                        }
                        let tappedSame = summaries.contains { $0.emoji == emoji && $0.participantIds.contains(hostId) }
                        if !tappedSame {
                            await viewModel.addReaction(messageId: message.id, emoji: emoji)
                        }
                    }
                },
                onReply: {
                    replyToId = message.id
                },
                onCopy: {
                    UIPasteboard.general.string = message.text ?? ""
                },
                onSave: (message.kind == .image || message.kind == .drawing) ? {
                    guard let urlString = message.mediaUrl,
                          let url = URL(string: urlString) else { return }
                    Task {
                        do {
                            let (data, _) = try await URLSession.shared.data(from: url)
                            if let uiImage = UIImage(data: data) {
                                UIImageWriteToSavedPhotosAlbum(uiImage, nil, nil, nil)
                            }
                        } catch {}
                    }
                } : nil,
                onDelete: {
                    let idToDelete = message.id
                    contextMenuMessageId = nil
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        messageToDelete = idToDelete
                    }
                }
            )
        }
    }

    // MARK: - Offline fade-out

    private func updateHiddenOfflineIds(participants: [Participant]) {
        for p in participants {
            guard p.id != hostId else { continue }
            if !p.online && !hiddenOfflineIds.contains(p.id) {
                let pid = p.id
                DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
                    if let current = viewModel.participants.first(where: { $0.id == pid }),
                       !current.online {
                        withAnimation(.easeOut(duration: 0.3)) {
                            _ = hiddenOfflineIds.insert(pid)
                        }
                    }
                }
            } else if p.online {
                hiddenOfflineIds.remove(p.id)
            }
        }
    }

    // MARK: - Game Status Bar

    @ViewBuilder
    private var gameStatusBarSection: some View {
        if let gameStatus = viewModel.gameStatus {
            GameStatusBarView(status: gameStatus, lang: hostLanguage, drawTimeLeft: viewModel.drawCountdownTimeLeft)
        }
    }

    // MARK: - Header

    private var headerView: some View {
        HStack {
            // Host's own avatar — tap to show settings menu
            if let host = viewModel.participant(for: hostId) {
                Button {
                    withAnimation(.easeOut(duration: 0.2)) {
                        showHostSettings.toggle()
                    }
                } label: {
                    ZStack {
                        Circle()
                            .fill(host.avatarColor)
                            .frame(width: 32, height: 32)
                        Text(host.avatarEmoji)
                            .font(.system(size: 18))
                    }
                }
            }

            // Title + QR code — tap QR icon to show QR panel
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 5) {
                    Text(L.t("Enchatto", hostLanguage))
                        .font(.headline)
                    Button {
                        showQRCode = true
                    } label: {
                        QRCodeIcon()
                            .frame(width: 14, height: 14)
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                }
                HStack(spacing: 4) {
                    Text("\(viewModel.onlineCount) \(L.t("online", hostLanguage))\(viewModel.awayCount > 0 ? ", \(viewModel.awayCount) \(L.t("away", hostLanguage))" : "")")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if viewModel.isProcessing {
                        ProgressView()
                            .controlSize(.mini)
                        Text(L.t("Processing...", hostLanguage))
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                }
            }

            Spacer()

            // Other participant avatars — tap to show name tooltip
            ParticipantAvatarRow(
                participants: viewModel.participants.filter { $0.id != hostId && !hiddenOfflineIds.contains($0.id) },
                maxVisible: 5,
                avatarSize: 28,
                onTapParticipant: { participant in
                    withAnimation(.easeOut(duration: 0.15)) {
                        tooltipParticipant = tooltipParticipant?.id == participant.id ? nil : participant
                    }
                }
            )
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
        .overlay(alignment: .bottom) { Divider() }
    }

    // MARK: - Offline banner

    private var offlineBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .font(.subheadline)
            Text(L.t("You're offline", hostLanguage))
                .font(.subheadline)
                .fontWeight(.medium)
            if viewModel.pendingQueueCount > 0 {
                Text("(\(viewModel.pendingQueueCount) \(L.t("queued", hostLanguage)))")
                    .font(.caption)
                    .opacity(0.8)
            }
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color.orange)
        .transition(.move(edge: .top).combined(with: .opacity))
        .animation(.easeInOut(duration: 0.3), value: viewModel.isOffline)
    }

    // MARK: - Offline translation bridge

    @ViewBuilder
    private var offlineTranslatorBridge: some View {
        if #available(iOS 18.0, *) {
            OfflineTranslator(viewModel: viewModel)
        }
    }

    // MARK: - Empty state

    private var emptyStateView: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 40))
                .foregroundStyle(.quaternary)
            Text(L.t("No messages yet", hostLanguage))
                .foregroundStyle(.secondary)
            Text(L.t("Waiting for participants to start chatting", hostLanguage))
                .font(.caption)
                .foregroundStyle(.tertiary)
            Spacer()
        }
    }

    // MARK: - Message list

    /// Tracks how many messages have translations so we can auto-scroll when new translations arrive.
    private var translationFingerprint: Int {
        viewModel.messages.reduce(0) { count, msg in
            count
                + (msg.processing?.translatedText != nil ? 1 : 0)
                + (msg.processing?.romaji != nil ? 1 : 0)
        }
    }

    private var filteredMessages: [Message] {
        viewModel.messages.filter { msg in
            !(msg.kind == .system && (msg.text?.hasPrefix("away:") == true || msg.text?.hasPrefix("back:") == true))
        }
    }

    /// ID of the first message after game completedAt, or nil if bubble goes at end
    private var gameCompleteInsertBeforeId: String? {
        guard let completedAt = viewModel.latestGameSession?.completedAt else { return nil }
        return filteredMessages.first(where: { $0.createdAt > completedAt })?.id
    }

    private var messageListView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(filteredMessages) { message in
                        // Game complete bubble before first message after completedAt
                        if viewModel.isGameComplete,
                           let insertId = gameCompleteInsertBeforeId,
                           message.id == insertId {
                            gameCompleteBubble
                        }

                        if message.kind == .system, let text = message.text, text.hasPrefix("game_summary:") || text.hasPrefix("emoji_match_summary:") || text.hasPrefix("truth_or_dare_summary:") {
                            GameSummaryBanner(text: text, lang: hostLanguage)
                                .id(message.id)
                        } else if message.kind == .system {
                            SystemMessageRow(text: message.text ?? "", lang: hostLanguage)
                                .id(message.id)
                        } else {
                            let sender = viewModel.participant(for: message.senderId)
                            let replyTarget = viewModel.replyTarget(for: message)
                            let replyTargetSender = replyTarget.flatMap { viewModel.participant(for: $0.senderId) }

                            HostMessageRow(
                                message: message,
                                sender: sender,
                                isOwn: message.senderId == hostId,
                                replyTarget: replyTarget,
                                replyTargetSender: replyTargetSender,
                                reactions: viewModel.reactionSummaries[message.id] ?? [],
                                preferredLanguage: hostLanguage,
                                onReply: { replyToId = message.id },
                                onSuggestionTap: { messageText = $0 },
                                onReact: nil,
                                onLongPress: {
                                    let impact = UIImpactFeedbackGenerator(style: .medium)
                                    impact.impactOccurred()
                                    contextMenuMessageId = message.id
                                },
                                showEnglish: showEnglish,
                                showJapanese: showJapanese,
                                showRomaji: showRomaji,
                                onImageTap: { url in fullScreenImage = (url: url, messageId: message.id) }
                            )
                            .id(message.id)
                            .background(
                                GeometryReader { geo in
                                    Color.clear.preference(
                                        key: MessageFramePreferenceKey.self,
                                        value: [message.id: geo.frame(in: .global)]
                                    )
                                }
                            )
                        }
                    }

                    // Game complete bubble at end if no messages came after it
                    if viewModel.isGameComplete && gameCompleteInsertBeforeId == nil {
                        gameCompleteBubble
                    }

                    // Typing indicator bubbles
                    ForEach(viewModel.typingParticipants) { participant in
                        TypingBubble(participant: participant, lang: hostLanguage, timerSeconds: viewModel.latestGameSession?.timerEnabled ?? viewModel.myActiveStep?.timerEnabled ?? 20)
                    }

                    // Scroll anchor — extra height so last item isn't clipped
                    Color.clear.frame(height: 16).id("bottom-anchor")
                }
                .padding()
            }
            .onPreferenceChange(MessageFramePreferenceKey.self) { frames in
                messageFrames = frames
            }
            .onChange(of: viewModel.messages.count) { _ in
                guard contextMenuMessageId == nil else { return }
                withAnimation {
                    proxy.scrollTo("bottom-anchor", anchor: .bottom)
                }
            }
            .onChange(of: translationFingerprint) { _ in
                guard contextMenuMessageId == nil else { return }
                withAnimation {
                    proxy.scrollTo("bottom-anchor", anchor: .bottom)
                }
            }
            .onChange(of: viewModel.typingParticipants.count) { _ in
                guard contextMenuMessageId == nil else { return }
                withAnimation {
                    proxy.scrollTo("bottom-anchor", anchor: .bottom)
                }
            }
        }
    }

    // MARK: - Game complete bubble

    private var gameCompleteBubble: some View {
        Button {
            showGameReplay = true
        } label: {
            HStack(spacing: 6) {
                Text("🎮")
                Text(L.t("Game complete! View Results", hostLanguage))
                    .fontWeight(.semibold)
            }
            .font(.system(size: 14))
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                LinearGradient(
                    colors: [.accentColor, .purple],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.15), radius: 4, y: 2)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
    }

    // MARK: - Reply indicator

    private func replyIndicator(for message: Message) -> some View {
        let sender = viewModel.participant(for: message.senderId)
        return HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(Color.accentColor)
                .frame(width: 3, height: 28)
            VStack(alignment: .leading, spacing: 1) {
                Text("\(L.t("Replying to", hostLanguage)) \(sender?.nickname ?? L.t("Unknown", hostLanguage))")
                    .font(.caption)
                    .fontWeight(.medium)
                Text(message.text?.prefix(40).description ?? "")
                    .font(.caption2)
                    .lineLimit(1)
            }
            .foregroundStyle(.secondary)
            Spacer()
            Button {
                replyToId = nil
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color(.systemGray6))
    }

    // MARK: - Input

    @State private var showAttachMenu = false

    private var inputToolbar: some View {
        HStack(spacing: 10) {
            // Plus menu (camera + photo library)
            Menu {
                Button {
                    showCamera = true
                } label: {
                    Label(L.t("Camera", hostLanguage), systemImage: "camera")
                }
                Button {
                    showPhotoLibrary = true
                } label: {
                    Label(L.t("Photo", hostLanguage), systemImage: "photo")
                }
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(.secondary)
                    .frame(width: 30, height: 30)
                    .background(Color(.systemGray5))
                    .clipShape(Circle())
            }

            // Drawing button
            Button {
                showDrawingComposer = true
                viewModel.setTypingAction("drawing")
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "pencil.tip")
                        .font(.system(size: 14))
                    Text(L.t("Draw", hostLanguage))
                        .font(.system(size: 13, weight: .medium))
                }
                .foregroundStyle(.secondary)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color(.systemGray5))
                .clipShape(Capsule())
            }

            // Game button — End Game when active, Start Game otherwise
            if viewModel.activeGameSession != nil {
                Button {
                    showEndGameConfirm = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "stop.fill")
                            .font(.system(size: 12))
                        Text(L.t("End Game", hostLanguage))
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.red.opacity(0.85))
                    .clipShape(Capsule())
                }
            } else {
                Button {
                    showGamePicker = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "gamecontroller.fill")
                            .font(.system(size: 14))
                        Text(L.t("Games", hostLanguage))
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(.systemGray5))
                    .clipShape(Capsule())
                }
            }

            Spacer()

            // Voice/send toggle
            if speechRecognizer.isRecording {
                HStack(spacing: 6) {
                    voiceRecordingButton
                    SendButton(
                        hasText: !messageText.trimmingCharacters(in: .whitespaces).isEmpty,
                        action: sendCurrentMessage,
                        pulsate: false
                    )
                }
                .transition(.scale.combined(with: .opacity))
            } else if !messageText.trimmingCharacters(in: .whitespaces).isEmpty {
                SendButton(
                    hasText: true,
                    action: sendCurrentMessage
                )
                .transition(.scale.combined(with: .opacity))
            } else {
                voiceMicButton
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.2), value: !messageText.trimmingCharacters(in: .whitespaces).isEmpty)
        .animation(.easeInOut(duration: 0.2), value: speechRecognizer.isRecording)
        .padding(.horizontal, 10)
        .padding(.bottom, 10)
    }

    private var voiceMicButton: some View {
        Button {
            let haptic = UIImpactFeedbackGenerator(style: .medium)
            haptic.prepare()
            haptic.impactOccurred()
            AudioServicesPlaySystemSound(1113)
            isTextEditorFocused = false
            viewModel.setTypingAction("voicing")
            speechRecognizer.updateLocale(hostLanguage)
            // Delay recording start so haptic/audio play before audio session is claimed
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                self.speechRecognizer.toggleRecording()
            }
        } label: {
            Image(systemName: "mic.fill")
                .font(.system(size: 15))
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(Color(.systemGray3))
                .clipShape(Circle())
        }
    }

    private var voiceRecordingButton: some View {
        Button {
            AudioServicesPlaySystemSound(1114)
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            viewModel.setTypingAction(nil)
            speechRecognizer.toggleRecording()
        } label: {
            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.5))
                    .frame(width: 28, height: 28)
                    .scaleEffect(1.0 + speechRecognizer.audioLevel * 2.5)
                    .animation(.interpolatingSpring(stiffness: 200, damping: 12), value: speechRecognizer.audioLevel)
                Image(systemName: "mic.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.orange)
                    .frame(width: 28, height: 28)
                    .background(Color.white)
                    .clipShape(Circle())
            }
        }
    }

    private var inputView: some View {
        VStack(spacing: 0) {
            // Card container
            VStack(spacing: 0) {
                // Text area
                TextEditor(text: $messageText)
                    .focused($isTextEditorFocused)
                    .frame(minHeight: 36, maxHeight: 120)
                    .fixedSize(horizontal: false, vertical: true)
                    .scrollContentBackground(.hidden)
                    .onChange(of: messageText) { text in
                        if !speechRecognizer.isRecording {
                            viewModel.setTypingAction(text.isEmpty ? nil : "typing")
                        }
                    }
                    .onChange(of: isTextEditorFocused) { focused in
                        if focused && speechRecognizer.isRecording {
                            speechRecognizer.stopRecording()
                            viewModel.setTypingAction(messageText.isEmpty ? nil : "typing")
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 10)
                    .padding(.bottom, 4)
                    .overlay(alignment: .topLeading) {
                        if messageText.isEmpty {
                            Text(L.t("Type a message...", hostLanguage))
                                .foregroundColor(Color(.placeholderText))
                                .padding(.horizontal, 16)
                                .padding(.top, 18)
                                .allowsHitTesting(false)
                        }
                    }

                inputToolbar
            }
            .background(Color(.systemGray6).opacity(0.6))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color(.systemGray4).opacity(0.5), lineWidth: 0.5)
            )
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
        }
        .background(Color(.systemBackground))
        .onChange(of: speechRecognizer.transcript, perform: { newTranscript in
            if speechRecognizer.isRecording && !newTranscript.isEmpty {
                messageText = newTranscript
            }
        })
        .onChange(of: speechRecognizer.isRecording, perform: { recording in
            if !recording {
                // Apply final transcript then clear so it doesn't interfere with keyboard
                if !speechRecognizer.transcript.isEmpty {
                    messageText = speechRecognizer.transcript
                    speechRecognizer.transcript = ""
                }
            }
        })
        .fullScreenCover(isPresented: $showDrawingComposer) {
            DrawingComposerView(
                lang: hostLanguage,
                onSend: { image in
                    showDrawingComposer = false
                    viewModel.setTypingAction(nil)
                    Task { await viewModel.sendDrawing(image, replyToId: replyToId); replyToId = nil }
                },
                onCancel: {
                    showDrawingComposer = false
                    viewModel.setTypingAction(nil)
                },
                triggerAutoSubmit: .constant(false)
            )
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraPickerView(
                onImageCaptured: { image in
                    Task { await viewModel.sendImage(image, replyToId: replyToId); replyToId = nil }
                },
                isPresented: $showCamera
            )
            .ignoresSafeArea()
        }
        .photosPicker(isPresented: $showPhotoLibrary, selection: $selectedPhotoItem, matching: .images)
        .onChange(of: selectedPhotoItem) { newItem in
            guard let newItem else { return }
            Task {
                if let data = try? await newItem.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await viewModel.sendImage(image, replyToId: replyToId)
                    replyToId = nil
                }
                selectedPhotoItem = nil
            }
        }
        .sheet(isPresented: $showGamePicker) {
            GamePickerView(
                isHost: true,
                playerCount: viewModel.participants.filter { $0.online }.count,
                nextLevel: (viewModel.latestGameSession?.status == .complete && viewModel.latestGameSession?.cancelled != true ? (viewModel.latestGameSession?.level ?? 1) + 1 : 1),
                lang: hostLanguage,
                onStartGame: { gameType, level, timerSeconds in
                    showGamePicker = false
                    Task { await viewModel.startGame(gameType: gameType, level: level, timerSeconds: timerSeconds) }
                },
                onStartEmojifyr: {
                    showGamePicker = false
                    Task {
                        await viewModel.startEmojifyr()
                        showEmojifyrGame = true
                    }
                },
                onStartEmojiMatch: {
                    showGamePicker = false
                    Task {
                        await viewModel.createEmojiMatchLobby()
                    }
                },
                onStartTruthOrDare: { mode in
                    showGamePicker = false
                    Task {
                        await viewModel.createTruthOrDare(promptMode: mode)
                    }
                },
                onDismiss: { showGamePicker = false }
            )
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
        .fullScreenCover(isPresented: $showGameTask) {
            if let step = viewModel.myActiveStep {
                GameTaskOverlayView(
                    step: step,
                    lang: hostLanguage,
                    onSubmitDrawing: { image in
                        guard let data = image.pngData() else { return }
                        let base64 = data.base64EncodedString()
                        let mediaUrl = "data:image/png;base64,\(base64)"
                        Task {
                            await viewModel.submitGameStep(stepId: step.id, outputText: nil, outputDrawingUrl: mediaUrl)
                            // Don't set showGameTask = false here — .onChange handles it.
                            // Setting it here would race with .onChange and override
                            // showGameTask = true when the next step is immediately available.
                        }
                    },
                    onSubmitGuess: { selectedOption in
                        Task {
                            await viewModel.submitGameStep(stepId: step.id, outputText: selectedOption, outputDrawingUrl: nil, selectedOption: selectedOption)
                            // Don't set showGameTask = false here — .onChange handles it.
                        }
                    },
                    onQuit: {
                        showQuitGameConfirm = true
                    }
                )
                .id(step.id)
                .alert(L.t("Quit game?", hostLanguage), isPresented: $showQuitGameConfirm) {
                    Button(L.t("Cancel", hostLanguage), role: .cancel) {}
                    Button(L.t("Quit", hostLanguage), role: .destructive) {
                        showGameTask = false
                        Task {
                            await viewModel.cancelGame()
                        }
                    }
                } message: {
                    Text(L.t("Are you sure you want to quit the game?", hostLanguage))
                }
            }
        }
        .sheet(isPresented: $showGameReplay) {
            if let replay = viewModel.gameReplay {
                GameReplayView(
                    replay: replay,
                    lang: hostLanguage,
                    onDismiss: { showGameReplay = false },
                    onNextLevel: { timerSeconds in
                        let nextLevel = (viewModel.latestGameSession?.level ?? 1) + 1
                        showGameReplay = false
                        Task { await viewModel.startGame(gameType: "lost-in-translation", level: nextLevel, timerSeconds: timerSeconds) }
                    }
                )
            }
        }
        .onChange(of: viewModel.myActiveStep?.id) { newStepId in
            showGameTask = newStepId != nil
        }
        .onChange(of: viewModel.isGameComplete) { complete in
            if complete {
                showGameReplay = true
            }
        }
        .alert(L.t("End game?", hostLanguage), isPresented: $showEndGameConfirm) {
            Button(L.t("Cancel", hostLanguage), role: .cancel) {}
            Button(L.t("End Game", hostLanguage), role: .destructive) {
                Task { await viewModel.cancelGame() }
            }
        } message: {
            Text(L.t("This will end the game for all players and show results.", hostLanguage))
        }
        // MARK: - Emojifyr full-screen game
        .fullScreenCover(isPresented: $showEmojifyrGame) {
            EmojifyrGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showEmojifyrGame = false }
            )
        }
        .onChange(of: viewModel.activeEmojifyrSession) { session in
            if session != nil && !showEmojifyrGame {
                showEmojifyrGame = true
            }
        }
        // MARK: - Emoji Match full-screen game
        .fullScreenCover(isPresented: $showEmojiMatchGame) {
            EmojiMatchGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showEmojiMatchGame = false }
            )
        }
        .onChange(of: viewModel.activeEmojiMatchGame) { game in
            if let g = game, g.status != .canceled, g.status != .completed {
                if !showEmojiMatchGame {
                    showEmojiMatchGame = true
                }
            } else if game == nil || game?.status == .canceled {
                showEmojiMatchGame = false
            }
        }
        // MARK: - Truth or Dare full-screen game
        .fullScreenCover(isPresented: $showTruthOrDareGame) {
            TruthOrDareGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showTruthOrDareGame = false }
            )
        }
        .onChange(of: viewModel.activeTruthOrDareGame) { game in
            if let g = game, g.status == .active {
                if !showTruthOrDareGame {
                    showTruthOrDareGame = true
                }
            } else if game == nil || game?.status == .completed || game?.status == .canceled {
                showTruthOrDareGame = false
            }
        }
    }

    // MARK: - Closed banner

    private var closedBanner: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "lock.fill")
                    .foregroundStyle(.secondary)
                Text(L.t("This room has been closed", hostLanguage))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Button(L.t("Back to Home", hostLanguage)) {
                dismiss()
            }
            .font(.subheadline)
            .fontWeight(.medium)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
    }

    // MARK: - Participant sheet

    @State private var maxParticipants: Int = 10

    private var participantSheet: some View {
        NavigationStack {
            List {
                ForEach(viewModel.participants) { participant in
                    HStack(spacing: 12) {
                        ParticipantAvatarView(participant: participant, size: 36)

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 4) {
                                Text(participant.nickname)
                                    .fontWeight(.medium)
                                if participant.role == .host {
                                    Text(L.t("host", hostLanguage))
                                        .font(.caption2)
                                        .padding(.horizontal, 4)
                                        .padding(.vertical, 1)
                                        .background(Color.accentColor)
                                        .foregroundStyle(.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 3))
                                }
                            }
                            Text(participant.online ? (participant.isAway ? L.t("Away", hostLanguage) : L.t("Online", hostLanguage)) : L.t("Offline", hostLanguage))
                                .font(.caption)
                                .foregroundStyle(participant.online ? (participant.isAway ? .orange : .green) : .secondary)
                        }

                        Spacer()

                        // Kick button (non-host only)
                        if participant.role != .host {
                            Button(role: .destructive) {
                                Task { await viewModel.kickParticipant(participant.id) }
                            } label: {
                                Text(L.t("Remove", hostLanguage))
                                    .font(.caption)
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }
                    }
                }

                Section {
                    Stepper(
                        "\(L.t("Max participants:", hostLanguage)) \(maxParticipants)",
                        value: $maxParticipants,
                        in: 2...20
                    )
                    .font(.subheadline)

                    Picker(L.t("Language", hostLanguage), selection: $hostLanguage) {
                        Text("English").tag("en")
                        Text("日本語").tag("ja")
                    }
                    .font(.subheadline)
                    .onChange(of: hostLanguage) { newValue in
                        UserDefaults.standard.set(newValue, forKey: "enchatto_lastLanguage")
                    }

                    if !viewModel.translationPacksInstalled {
                        Button {
                            viewModel.requestTranslationDownload = true
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .foregroundStyle(.blue)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(L.t("Download Offline Translation", hostLanguage))
                                        .font(.subheadline)
                                    Text(L.t("Enables translation without internet", hostLanguage))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    } else {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                            Text(L.t("Offline translation ready", hostLanguage))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                } header: {
                    Text(L.t("Settings", hostLanguage))
                } footer: {
                    let deployment = AppConfig.convexDeploymentURL
                        .replacingOccurrences(of: "https://", with: "")
                        .replacingOccurrences(of: ".convex.site", with: "")
                    let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
                    VStack(spacing: 2) {
                        Text("\(deployment) · iOS v\(version)")
                        Text("github: \(GitInfo.commitSHA)")
                    }
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                    .padding(.top, 8)
                }
            }
            .navigationTitle(L.t("Participants", hostLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(L.t("Done", hostLanguage)) {
                        viewModel.showParticipantSheet = false
                    }
                }
            }
            .onAppear {
                maxParticipants = viewModel.room?.settings.maxParticipants ?? 10
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Helpers

    private func sendCurrentMessage() {
        let wasRecording = speechRecognizer.isRecording
        if wasRecording {
            speechRecognizer.stopRecording()
        }
        var text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        // Ensure punctuation for voice input (SwiftUI onChange may not have fired yet)
        if wasRecording {
            text = SpeechRecognizer.ensurePunctuation(text)
        }
        viewModel.setTypingAction(nil)
        Task {
            await viewModel.sendMessage(text, replyToId: replyToId)
            messageText = ""
            replyToId = nil
        }
    }
}

// MARK: - Send button with pulse

private struct SendButton: View {
    let hasText: Bool
    let action: () -> Void
    var pulsate: Bool = true
    @State private var pulsing = false

    var body: some View {
        Button {
            if hasText {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            action()
        } label: {
            ZStack {
                if hasText && pulsate {
                    Circle()
                        .fill(Color.accentColor)
                        .frame(width: 28, height: 28)
                        .scaleEffect(pulsing ? 1.8 : 1)
                        .opacity(pulsing ? 0 : 0.5)
                        .animation(
                            .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                            value: pulsing
                        )
                }
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 28))
                    .foregroundStyle(hasText ? Color.accentColor : Color(.systemGray4))
            }
        }
        .disabled(!hasText)
        .onChange(of: hasText) { active in
            pulsing = pulsate && active
        }
        .onAppear {
            pulsing = pulsate && hasText
        }
    }
}

// MARK: - Game Summary Banner

private struct GameSummaryBanner: View {
    let text: String
    var lang: String = "en"

    private struct PlayerScore: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let score: Int
        let total: Int
        let isWinner: Bool
    }

    private struct GameRoundData: Identifiable {
        let id = UUID()
        let players: [PlayerScore]
    }

    private struct TodPlayerRating: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let avgRating: Double?
        let turnsRated: Int
    }

    private enum SummaryData {
        case emojiMatch(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore])
        case litGame(title: String, subtitle: String, players: [PlayerScore])
        case truthOrDare(title: String, subtitle: String, players: [TodPlayerRating])
    }

    private var parsed: SummaryData? {
        if text.hasPrefix("game_summary:") {
            let json = String(text.dropFirst("game_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Game"
            let level = obj["level"] as? Int
            let cancelled = obj["cancelled"] as? Bool ?? false
            let rounds = obj["rounds"] as? [[String: Any]] ?? []
            let players = obj["players"] as? [String: [String: Any]] ?? [:]
            let totals = obj["totals"] as? [String: [String: Any]] ?? [:]

            let title = level != nil ? "\(gameType) — Level \(level!)" : gameType
            let subtitle = cancelled ? L.t("Game ended early", lang) : L.t("Game Complete", lang)

            var playerScores: [PlayerScore] = []
            for (pid, info) in players {
                let pName = info["name"] as? String ?? "?"
                let avatar = info["avatar"] as? String ?? "default"
                let t = totals[pid]
                let correct = t?["correct"] as? Int ?? 0
                let total = t?["total"] as? Int ?? 0
                playerScores.append(PlayerScore(name: pName, avatar: avatar, score: correct, total: total, isWinner: false))
            }
            playerScores.sort { $0.score > $1.score }
            let maxScore = playerScores.first?.score ?? 0
            playerScores = playerScores.map {
                PlayerScore(name: $0.name, avatar: $0.avatar, score: $0.score, total: $0.total, isWinner: $0.score == maxScore && maxScore > 0)
            }

            let roundCount = rounds.count
            let fullSubtitle = "\(subtitle) · \(roundCount) \(roundCount == 1 ? "round" : "rounds")"

            return .litGame(title: title, subtitle: fullSubtitle, players: playerScores)
        } else if text.hasPrefix("emoji_match_summary:") {
            let json = String(text.dropFirst("emoji_match_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Match Emoji"

            // Parse multi-game format (games array) or legacy single-game
            var gameRounds: [GameRoundData] = []
            if let gamesArr = obj["games"] as? [[String: Any]] {
                for g in gamesArr {
                    let playersArr = g["players"] as? [[String: Any]] ?? []
                    let scores = playersArr.map { p in
                        PlayerScore(
                            name: p["name"] as? String ?? "?",
                            avatar: p["avatar"] as? String ?? "default",
                            score: p["score"] as? Int ?? 0,
                            total: g["totalPairs"] as? Int ?? 0,
                            isWinner: p["isWinner"] as? Bool ?? false
                        )
                    }
                    gameRounds.append(GameRoundData(players: scores))
                }
            } else if let playersArr = obj["players"] as? [[String: Any]] {
                // Legacy single-game format
                let totalPairs = obj["totalPairs"] as? Int ?? 0
                let scores = playersArr.map { p in
                    PlayerScore(
                        name: p["name"] as? String ?? "?",
                        avatar: p["avatar"] as? String ?? "default",
                        score: p["score"] as? Int ?? 0,
                        total: totalPairs,
                        isWinner: p["isWinner"] as? Bool ?? false
                    )
                }
                gameRounds.append(GameRoundData(players: scores))
            }

            let gameCount = gameRounds.count
            let subtitle = "\(gameCount) \(gameCount == 1 ? "game" : "games") \(L.t("played", lang))"

            // Aggregate totals across all games
            var agg: [String: (name: String, avatar: String, totalScore: Int, wins: Int)] = [:]
            for g in gameRounds {
                for p in g.players {
                    let key = "\(p.name)|\(p.avatar)"
                    var entry = agg[key] ?? (name: p.name, avatar: p.avatar, totalScore: 0, wins: 0)
                    entry.totalScore += p.score
                    if p.isWinner { entry.wins += 1 }
                    agg[key] = entry
                }
            }
            var aggregated = agg.values.map { e in
                PlayerScore(name: e.name, avatar: e.avatar, score: e.totalScore, total: 0, isWinner: false)
            }
            aggregated.sort { $0.score > $1.score }
            let maxScore = aggregated.first?.score ?? 0
            aggregated = aggregated.map {
                PlayerScore(name: $0.name, avatar: $0.avatar, score: $0.score, total: $0.total, isWinner: $0.score == maxScore && maxScore > 0)
            }

            return .emojiMatch(title: gameType, subtitle: subtitle, games: gameRounds, aggregated: aggregated)
        } else if text.hasPrefix("truth_or_dare_summary:") {
            let json = String(text.dropFirst("truth_or_dare_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }

            let totalTurns = obj["totalTurns"] as? Int ?? 0
            let playersArr = obj["players"] as? [[String: Any]] ?? []

            var playerRatings: [TodPlayerRating] = []
            for p in playersArr {
                let name = p["name"] as? String ?? "?"
                let avatar = p["avatar"] as? String ?? "cat"
                let avgRating = p["avgRating"] as? Double
                let turnsRated = p["turnsRated"] as? Int ?? 0
                playerRatings.append(TodPlayerRating(name: name, avatar: avatar, avgRating: avgRating, turnsRated: turnsRated))
            }

            // Sort by rating descending (nil last)
            playerRatings.sort {
                guard let a = $0.avgRating else { return false }
                guard let b = $1.avgRating else { return true }
                return a > b
            }

            let subtitle = "\(totalTurns) \(totalTurns == 1 ? "turn" : "turns") \(L.t("played", lang))"
            return .truthOrDare(title: L.t("Truth or Dare", lang), subtitle: subtitle, players: playerRatings)
        }
        return nil
    }

    private var isTruthOrDare: Bool {
        if let data = parsed, case .truthOrDare = data { return true }
        return false
    }

    private var bannerGradient: LinearGradient {
        if isTruthOrDare {
            return LinearGradient(
                colors: [Color(red: 0.92, green: 0.35, blue: 0.05), Color(red: 0.96, green: 0.62, blue: 0.04), Color(red: 0.85, green: 0.47, blue: 0.02)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        }
        return LinearGradient(
            colors: [Color(red: 0.39, green: 0.4, blue: 0.95), Color(red: 0.55, green: 0.36, blue: 0.96), Color(red: 0.66, green: 0.33, blue: 0.97)],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
    }

    private var bannerShadowColor: Color {
        if isTruthOrDare {
            return Color(red: 0.92, green: 0.35, blue: 0.05).opacity(0.3)
        }
        return Color(red: 0.39, green: 0.4, blue: 0.95).opacity(0.3)
    }

    var body: some View {
        if let data = parsed {
            VStack(spacing: 10) {
                switch data {
                case .emojiMatch(let title, let subtitle, let games, let aggregated):
                    emojiMatchBody(title: title, subtitle: subtitle, games: games, aggregated: aggregated)
                case .litGame(let title, let subtitle, let players):
                    litGameBody(title: title, subtitle: subtitle, players: players)
                case .truthOrDare(let title, let subtitle, let players):
                    truthOrDareBody(title: title, subtitle: subtitle, players: players)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(bannerGradient)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: bannerShadowColor, radius: 8, y: 4)
            .padding(.horizontal, 4)
        } else {
            SystemMessageRow(text: text, lang: lang)
        }
    }

    // MARK: - Emoji Match body

    @ViewBuilder
    private func emojiMatchBody(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore]) -> some View {
        VStack(spacing: 2) {
            Text("🃏 \(title)")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            Text(subtitle)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.85))
        }

        ForEach(Array(games.enumerated()), id: \.element.id) { idx, game in
            emojiMatchGameRow(idx: idx, game: game)
        }

        emojiMatchPodium(aggregated: aggregated)
    }

    @ViewBuilder
    private func emojiMatchGameRow(idx: Int, game: GameRoundData) -> some View {
        let sorted = game.players.sorted { $0.score > $1.score }
        VStack(alignment: .leading, spacing: 4) {
            Text("Game \(idx + 1)")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white.opacity(0.8))
            HStack(spacing: 8) {
                ForEach(Array(sorted.enumerated()), id: \.element.id) { _, p in
                    let rank = sorted.firstIndex(where: { $0.score == p.score }) ?? 0
                    let placeEmoji = rank == 0 ? "🏆" : rank == 1 ? "🥈" : rank == 2 ? "🥉" : ""
                    HStack(spacing: 3) {
                        Text(presetAvatar(for: p.avatar).emoji).font(.system(size: 12))
                        Text(p.name + ":").font(.system(size: 11))
                        Text("\(p.score)").font(.system(size: 11, weight: .bold))
                        Text(placeEmoji).font(.system(size: 10))
                    }
                    .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    @ViewBuilder
    private func emojiMatchPodium(aggregated: [PlayerScore]) -> some View {
        let podium: [PlayerScore] = aggregated.count >= 3
            ? [aggregated[1], aggregated[0], aggregated[2]] + Array(aggregated.dropFirst(3))
            : aggregated
        HStack(spacing: 8) {
            ForEach(podium) { player in
                let rank = aggregated.firstIndex(where: { $0.score == player.score }) ?? 0
                let placeEmoji = rank == 0 && player.score > 0 ? "🏆" : rank == 1 ? "🥈" : rank == 2 ? "🥉" : ""
                playerCard(
                    emoji: presetAvatar(for: player.avatar).emoji,
                    name: player.name,
                    detail: "\(player.score) \(player.score == 1 ? L.t("pair", lang) : L.t("pairs", lang))",
                    placeEmoji: placeEmoji,
                    isHighlighted: player.isWinner
                )
            }
        }
    }

    // MARK: - Lost in Translation body

    @ViewBuilder
    private func litGameBody(title: String, subtitle: String, players: [PlayerScore]) -> some View {
        VStack(spacing: 2) {
            Text("🎮 \(title)")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            Text(subtitle)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.85))
        }

        HStack(spacing: 8) {
            ForEach(players) { player in
                playerCard(
                    emoji: presetAvatar(for: player.avatar).emoji,
                    name: player.name,
                    detail: "\(player.score)/\(player.total)",
                    placeEmoji: player.isWinner ? "👑" : "",
                    isHighlighted: player.isWinner
                )
            }
        }
    }

    // MARK: - Truth or Dare body

    @ViewBuilder
    private func truthOrDareBody(title: String, subtitle: String, players: [TodPlayerRating]) -> some View {
        VStack(spacing: 2) {
            Text("🎲 \(title)")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            Text(subtitle)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.85))
        }

        let topRating = players.first?.avgRating
        HStack(spacing: 8) {
            ForEach(players) { player in
                let isTop = player.avgRating != nil && player.avgRating == topRating
                let rank = players.firstIndex(where: { $0.avgRating == player.avgRating }) ?? 0
                let placeEmoji = rank == 0 && player.avgRating != nil ? "🏆" : rank == 1 ? "🥈" : rank == 2 ? "🥉" : ""
                let detail: String = {
                    if let avg = player.avgRating {
                        return "⭐ \(String(format: "%.1f", avg))"
                    }
                    return "—"
                }()
                playerCard(
                    emoji: presetAvatar(for: player.avatar).emoji,
                    name: player.name,
                    detail: detail,
                    placeEmoji: placeEmoji,
                    isHighlighted: isTop
                )
            }
        }
    }

    // MARK: - Shared player card

    private func playerCard(emoji: String, name: String, detail: String, placeEmoji: String, isHighlighted: Bool) -> some View {
        VStack(spacing: 4) {
            Text(placeEmoji)
                .font(.system(size: 12))
                .frame(height: 14)
            Text(emoji)
                .font(.system(size: 24))
            Text(name)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(1)
            Text(detail)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(isHighlighted ? .white : .white.opacity(0.85))
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 10)
        .frame(minWidth: 65)
        .background(isHighlighted ? Color.white.opacity(0.25) : Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isHighlighted ? Color.white.opacity(0.5) : Color.clear, lineWidth: 1.5)
        )
    }
}

// MARK: - System message (join/leave divider)

private struct SystemMessageRow: View {
    let text: String
    var lang: String = "en"

    private var localizedText: String {
        let parts = text.split(separator: ":", maxSplits: 1)
        guard parts.count == 2 else { return text }
        let action = String(parts[0])
        let name = String(parts[1])
        if action == "join" {
            return lang == "ja" ? "\(name)\(L.t("has joined", lang))" : "\(name) \(L.t("has joined", lang))"
        } else if action == "leave" {
            return lang == "ja" ? "\(name)\(L.t("has left", lang))" : "\(name) \(L.t("has left", lang))"
        } else if action == "game" {
            // name is like "Lost in Translation Level 2" or "Emojifyr" or "Emoji Match"
            if name.hasPrefix("Emojifyr") {
                return "🔥 \(L.t("Game Started: Emojifyr", lang))"
            }
            if name.hasPrefix("Emoji Match") {
                return "🃏 \(L.t("Game Started: Match Emoji", lang))"
            }
            if name.hasPrefix("Truth or Dare") {
                return "🎲 \(L.t("Game Started: Truth or Dare", lang))"
            }
            if let range = name.range(of: "Level "), let levelNum = Int(name[range.upperBound...].trimmingCharacters(in: .whitespaces)) {
                return "🎮 \(L.t("Game Started: Lost in Translation", lang)) — \(L.t("Level", lang)) \(levelNum)"
            }
            return "🎮 \(L.t("Game Started: Lost in Translation", lang))"
        } else if action == "game_cancelled" {
            return "🎮 \(L.t("Game ended", lang))"
        } else if action == "game_ended" {
            return "🎲 \(L.t("Game ended", lang))"
        } else if action == "game_correct" {
            let parts = name.split(separator: "|", maxSplits: 1)
            let guesserName = parts.count > 0 ? String(parts[0]) : "?"
            let prompt = parts.count > 1 ? String(parts[1]) : ""
            return "🎉 \(guesserName) \(L.t("guessed correctly!", lang)) (\(prompt))"
        } else if action == "game_wrong" {
            let parts = name.split(separator: "|", maxSplits: 1)
            let guesserName = parts.count > 0 ? String(parts[0]) : "?"
            let prompt = parts.count > 1 ? String(parts[1]) : ""
            return "❌ \(guesserName) \(L.t("guessed wrong", lang)) (\(prompt))"
        }
        return text
    }

    var body: some View {
        HStack(spacing: 6) {
            line
            Text(localizedText)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .fixedSize(horizontal: false, vertical: true)
            line
        }
        .padding(.vertical, 4)
    }

    private var line: some View {
        Rectangle()
            .fill(Color(.separator))
            .frame(minWidth: 8, maxWidth: 40, maxHeight: 0.5)
    }
}

// MARK: - Typing bubble indicator

private struct TypingBubble: View {
    let participant: Participant
    var lang: String = "en"
    var timerSeconds: Int = 20

    var body: some View {
        HStack(alignment: .bottom, spacing: 4) {
            // Avatar
            VStack(spacing: 2) {
                ZStack {
                    Circle()
                        .fill(participant.avatarColor)
                        .frame(width: 28, height: 28)
                    Text(participant.avatarEmoji)
                        .font(.system(size: 16))
                }
                Text(participant.nickname)
                    .font(.system(size: 9))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .frame(maxWidth: 40)
            }

            // Bubble with action-specific animation
            Group {
                if participant.typingAction == "drawing" {
                    // Pencil wiggle + label + countdown
                    HStack(spacing: 6) {
                        DrawingPencil()
                        DrawingCountdownLabel(
                            drawingStartedAt: participant.drawingStartedAt,
                            lang: lang,
                            timeLimit: timerSeconds
                        )
                    }
                } else if participant.typingAction == "voicing" {
                    // Orange pulsing bars + label
                    HStack(spacing: 6) {
                        VoiceBars()
                        Text(L.t("is speaking", lang))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    // Bouncing dots for typing
                    HStack(spacing: 4) {
                        BouncingDot(delay: 0)
                        BouncingDot(delay: 0.15)
                        BouncingDot(delay: 0.3)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color(.systemGray6))
            .clipShape(UnevenRoundedRectangle(
                topLeadingRadius: 16,
                bottomLeadingRadius: 4,
                bottomTrailingRadius: 16,
                topTrailingRadius: 16
            ))

            Spacer(minLength: 0)
        }
    }
}

/// Drawing countdown label that updates every second
private struct DrawingCountdownLabel: View {
    let drawingStartedAt: Double?
    var lang: String = "en"
    var timeLimit: Int = 20

    @State private var secondsLeft: Int? = nil
    @State private var timer: Timer? = nil

    var body: some View {
        HStack(spacing: 4) {
            Text(L.t("is drawing", lang))
                .font(.caption)
                .foregroundStyle(.secondary)
            if let secondsLeft {
                Text("\(secondsLeft)s")
                    .font(.caption.bold())
                    .foregroundStyle(secondsLeft <= 3 ? .red : .secondary)
            }
        }
        .onAppear { startTimer() }
        .onDisappear { timer?.invalidate(); timer = nil }
    }

    private func startTimer() {
        updateCountdown()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            Task { @MainActor in updateCountdown() }
        }
    }

    private func updateCountdown() {
        guard let startedAt = drawingStartedAt else { secondsLeft = nil; return }
        let elapsed = Int((Date().timeIntervalSince1970 * 1000 - startedAt) / 1000)
        secondsLeft = max(0, timeLimit - elapsed)
    }
}

/// Single bouncing dot for typing indicator
private struct BouncingDot: View {
    let delay: Double
    @State private var animating = false

    var body: some View {
        Circle()
            .fill(Color(.systemGray3))
            .frame(width: 7, height: 7)
            .opacity(animating ? 1 : 0.4)
            .offset(y: animating ? -4 : 0)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 0.36)
                    .repeatForever(autoreverses: true)
                    .delay(delay)
                ) {
                    animating = true
                }
            }
    }
}

/// Orange pulsing bars for voice indicator
private struct VoiceBars: View {
    @State private var animating = false

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<4) { i in
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(Color.orange)
                    .frame(width: 3, height: animating ? 14 : 4)
                    .opacity(animating ? 1 : 0.5)
                    .animation(
                        .easeInOut(duration: 0.4)
                        .repeatForever(autoreverses: true)
                        .delay(Double(i) * 0.15),
                        value: animating
                    )
            }
        }
        .frame(height: 16)
        .onAppear { animating = true }
    }
}

/// Wiggling pencil for drawing indicator
private struct DrawingPencil: View {
    @State private var animating = false

    var body: some View {
        Text("✏️")
            .font(.system(size: 14))
            .rotationEffect(.degrees(animating ? 8 : -10))
            .offset(y: animating ? -2 : 0)
            .animation(
                .easeInOut(duration: 0.4)
                .repeatForever(autoreverses: true),
                value: animating
            )
            .onAppear { animating = true }
    }
}

// MARK: - QR Code Floating Panel

private struct PressedDimButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.4 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

private struct QRCodeFloatingPanel: View {
    let joinCode: String
    @Binding var isPresented: Bool
    var lang: String = "en"
    @State private var dragOffset: CGFloat = 0
    @State private var appeared = false
    @State private var copied = false

    private var joinURL: String {
        "https://enchatto.vercel.app/join/\(joinCode)"
    }

    var body: some View {
        ZStack(alignment: .top) {
            // Dimmed background
            Color.black.opacity(appeared ? 0.3 : 0)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            // Panel
            VStack(spacing: 16) {
                // Drag handle
                Capsule()
                    .fill(Color(.systemGray4))
                    .frame(width: 36, height: 5)
                    .padding(.top, 10)

                if let qrImage = generateQRCode(from: joinURL) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 180, height: 180)
                        .padding(12)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .shadow(radius: 2)
                }

                Button {
                    UIPasteboard.general.string = joinURL
                    withAnimation { copied = true }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation { copied = false }
                    }
                } label: {
                    VStack(spacing: 3) {
                        Text(L.t("Room Code", lang))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(joinCode)
                            .font(.system(.title2, design: .monospaced))
                            .fontWeight(.bold)
                            .foregroundStyle(copied ? .secondary : .primary)
                        if copied {
                            Label(L.t("Copied!", lang), systemImage: "checkmark.circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.green)
                                .transition(.opacity)
                        } else {
                            Text(L.t("Tap to copy link", lang))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                                .transition(.opacity)
                        }
                    }
                }
                .buttonStyle(PressedDimButtonStyle())

                Text(L.t("Scan or enter code to join", lang))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.bottom, 16)
            }
            .frame(maxWidth: .infinity)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(color: .black.opacity(0.15), radius: 10, y: 4)
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .offset(y: appeared ? dragOffset : -400)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        // Only allow upward drag
                        if value.translation.height < 0 {
                            dragOffset = value.translation.height
                        }
                    }
                    .onEnded { value in
                        if value.translation.height < -80 {
                            dismiss()
                        } else {
                            withAnimation(.spring(response: 0.3)) {
                                dragOffset = 0
                            }
                        }
                    }
            )
        }
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }

    private func dismiss() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.9)) {
            appeared = false
            dragOffset = -400
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            isPresented = false
        }
    }

    private func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"

        guard let outputImage = filter.outputImage else { return nil }

        let scale = 10.0
        let scaledImage = outputImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
            return nil
        }

        return UIImage(cgImage: cgImage)
    }
}

// MARK: - Offline translation via Apple Translation framework

@available(iOS 18.0, *)
private struct OfflineTranslator: View {
    @ObservedObject var viewModel: HostRoomViewModel
    @State private var enJaConfig: TranslationSession.Configuration?
    @State private var jaEnConfig: TranslationSession.Configuration?
    @State private var showDownloadPresentation = false

    var body: some View {
        ZStack {
            // Each direction on its OWN view — two .translationTask modifiers
            // on the same view can conflict and prevent sessions from starting.
            Color.clear
                .translationTask(enJaConfig) { session in
                    print("[OfflineTranslator] en→ja session active, translating batch")
                    await viewModel.translateQueueBatch(session: session, fromLang: "en")
                }
            Color.clear
                .translationTask(jaEnConfig) { session in
                    print("[OfflineTranslator] ja→en session active, translating batch")
                    await viewModel.translateQueueBatch(session: session, fromLang: "ja")
                }
        }
        .frame(width: 0, height: 0)
        // Download prompt — Apple's translation overlay handles the download flow
        .translationPresentation(isPresented: $showDownloadPresentation, text: "Hello")
        // Re-trigger translation sessions when new messages are enqueued
        .onChange(of: viewModel.offlineQueueVersion) { _, _ in
            guard viewModel.translationPacksInstalled else { return }
            enJaConfig?.invalidate()
            jaEnConfig?.invalidate()
        }
        // React to user tapping the download button in participant sheet
        .onChange(of: viewModel.requestTranslationDownload) { _, newValue in
            if newValue {
                showDownloadPresentation = true
                viewModel.requestTranslationDownload = false
            }
        }
        // Re-check after download presentation dismisses
        .onChange(of: showDownloadPresentation) { _, isPresented in
            if !isPresented {
                Task { await checkAndStart() }
            }
        }
        // Check on room open and initialize configs if packs are installed
        .task {
            await checkAndStart()
        }
    }

    private func checkAndStart() async {
        let availability = LanguageAvailability()
        let enJa = await availability.status(
            from: Locale.Language(identifier: "en"),
            to: Locale.Language(identifier: "ja")
        )
        let jaEn = await availability.status(
            from: Locale.Language(identifier: "ja"),
            to: Locale.Language(identifier: "en")
        )
        viewModel.translationPacksInstalled = (enJa == .installed && jaEn == .installed)

        // Initialize configs so .translationTask is ready to fire on invalidate()
        if viewModel.translationPacksInstalled && enJaConfig == nil {
            enJaConfig = .init(
                source: Locale.Language(identifier: "en"),
                target: Locale.Language(identifier: "ja")
            )
            jaEnConfig = .init(
                source: Locale.Language(identifier: "ja"),
                target: Locale.Language(identifier: "en")
            )
        }
    }
}

// MARK: - QR Code Icon (from Font Awesome qrcode-solid)
private struct QRCodeIcon: View {
    var body: some View {
        Image(systemName: "qrcode")
            .resizable()
            .scaledToFit()
    }
}


#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
