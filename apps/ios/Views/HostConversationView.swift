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
    @AppStorage(ChatTextSize.storageKey) private var chatTextSize: ChatTextSize = .small
    @State private var showHostSettings = false
    @State private var tooltipParticipant: Participant?
    @State private var fullScreenImage: (url: String, messageId: String)?
    @State private var showGamePicker = false
    @State private var showGameReplay = false
    @State private var showGameTask = false
    @State private var showQuitGameConfirm = false
    @State private var showEndGameConfirm = false
    @State private var hiddenOfflineIds: Set<String> = []  // participants hidden after 10s offline
    @State private var showWordRushGame = false
    @State private var showEmojiMatchGame = false
    @State private var showTruthOrDareGame = false
    @State private var minimizedTruthOrDareGameId: String? = nil
    @State private var minimizedEmojiMatchGameId: String? = nil
    @State private var minimizedEmojiBingoGameId: String? = nil
    @State private var minimizedWordRushGameId: String? = nil
    @State private var showEmojiBingoGame = false
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
        .background { RoomBackground(room: viewModel.room).ignoresSafeArea() }
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
        .overlay {
            if let participant = tooltipParticipant {
                Color.black.opacity(0.01)
                    .onTapGesture {
                        withAnimation { tooltipParticipant = nil }
                    }
                    .overlay(alignment: .topTrailing) {
                        HStack(spacing: 6) {
                            AvatarDisc(avatarId: participant.avatar.value, size: 22)
                            Text(participant.nickname)
                                .font(.round(13, .black))
                                .foregroundStyle(EC.ink)
                            if participant.isAway {
                                ECChip(text: L.t("Away", hostLanguage), fill: EC.yellow)
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .ecCard(radius: 14, border: 2.5, shadow: 3)
                        .padding(.top, 62)
                        .padding(.trailing, 44)
                        .transition(.scale(scale: 0.6, anchor: .topTrailing).combined(with: .opacity))
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
                VStack(alignment: .leading, spacing: 2) {
                    settingsToggle(L.t("English", hostLanguage), isOn: $showEnglish) {
                        LangBadge(lang: "en", size: 22)
                    }
                    settingsToggle(L.t("Japanese", hostLanguage), isOn: $showJapanese) {
                        LangBadge(lang: "ja", size: 22)
                    }
                    settingsToggle(L.t("Romaji", hostLanguage), isOn: $showRomaji) {
                        Text("Ro")
                            .font(.round(11, .black))
                            .foregroundStyle(.white)
                            .frame(width: 22, height: 22)
                            .background(Circle().fill(EC.violet))
                            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    }

                    chatTextSizePicker

                    DashedRule()
                        .padding(.vertical, 6)
                        .padding(.horizontal, 12)

                    Button {
                        showHostSettings = false
                        viewModel.showParticipantSheet = true
                    } label: {
                        Label(L.t("Participants", hostLanguage), systemImage: "person.2.fill")
                            .font(.round(15, .black))
                            .foregroundStyle(EC.ink)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                    }
                    .buttonStyle(.pressable)

                    Button {
                        showHostSettings = false
                        showCloseConfirmation = true
                    } label: {
                        Text(L.t("Close Room", hostLanguage))
                    }
                    .buttonStyle(.chunky(EC.red, size: .mini))
                    .padding(.horizontal, 10)
                    .padding(.top, 4)
                }
                .padding(.vertical, 10)
                .frame(width: 230)
                .ecCard(radius: 20, border: 3, shadow: 6)
                .offset(x: 12, y: 62)
            }
            .transition(.scale(scale: 0.7, anchor: .topLeading).combined(with: .opacity))
        }
    }

    private var chatTextSizePicker: some View {
        HStack(spacing: 10) {
            Text(L.t("Chat text size", hostLanguage))
                .font(.round(15, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 4)
            HStack(spacing: 0) {
                ForEach(Array(ChatTextSize.allCases.enumerated()), id: \.element) { index, size in
                    Button {
                        Haptics.tap()
                        withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) { chatTextSize = size }
                    } label: {
                        Text("A")
                            .font(.chunky(11 + CGFloat(index) * 3))
                            .foregroundStyle(EC.ink)
                            .frame(width: 30, height: 28)
                            .background(chatTextSize == size ? EC.yellow : .white)
                            .overlay(alignment: .leading) {
                                if index > 0 {
                                    Rectangle().fill(EC.ink).frame(width: 2)
                                }
                            }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(L.t(size.label, hostLanguage))
                    .accessibilityAddTraits(chatTextSize == size ? .isSelected : [])
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 9, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 7)
    }

    private func settingsToggle<Badge: View>(_ title: String, isOn: Binding<Bool>, @ViewBuilder badge: () -> Badge) -> some View {
        Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.25, dampingFraction: 0.6)) { isOn.wrappedValue.toggle() }
        } label: {
            HStack(spacing: 10) {
                badge()
                Text(title)
                    .font(.round(15, .black))
                    .foregroundStyle(isOn.wrappedValue ? EC.ink : EC.inkSoft)
                Spacer(minLength: 8)
                Image(systemName: "checkmark")
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(isOn.wrappedValue ? EC.ink : .clear)
                    .frame(width: 24, height: 24)
                    .background(RoundedRectangle(cornerRadius: 7).fill(isOn.wrappedValue ? EC.mint : .white))
                    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(EC.ink, lineWidth: 2.5))
                    .scaleEffect(isOn.wrappedValue ? 1 : 0.9)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .contentShape(Rectangle())
        }
        .buttonStyle(.pressable)
        .accessibilityAddTraits(isOn.wrappedValue ? .isSelected : [])
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
        HStack(spacing: 10) {
            // Host's own avatar — tap to show settings menu
            if let host = viewModel.participant(for: hostId) {
                Button {
                    Haptics.tap()
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                        showHostSettings.toggle()
                    }
                } label: {
                    AvatarDisc(avatarId: host.avatar.value, size: 44)
                        .background(Circle().fill(EC.ink).offset(y: 3))
                }
                .buttonStyle(.pressable)
                .accessibilityLabel(L.t("Settings", hostLanguage))
            }

            // Wordmark + QR button
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 8) {
                    EnchattoWordmark(text: L.t("Enchatto", hostLanguage), size: 22)
                    if let joinCode = viewModel.room?.joinCode {
                        Button {
                            Haptics.tap()
                            showQRCode = true
                        } label: {
                            QRCodeIcon()
                                .frame(width: 32, height: 32)
                                .contentShape(Rectangle().inset(by: -6))
                        }
                        .buttonStyle(.pressable)
                        .accessibilityLabel("\(L.t("Room Code", hostLanguage)) \(joinCode)")
                    }
                }
                HStack(spacing: 5) {
                    Circle()
                        .fill(EC.mint)
                        .frame(width: 8, height: 8)
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
                    Text("\(viewModel.onlineCount) \(L.t("online", hostLanguage))\(viewModel.awayCount > 0 ? ", \(viewModel.awayCount) \(L.t("away", hostLanguage))" : "")")
                        .font(.round(12, .bold))
                        .foregroundStyle(EC.inkSoft)
                        .lineLimit(1)
                    if viewModel.isProcessing {
                        ProgressView()
                            .controlSize(.mini)
                            .tint(EC.pink)
                        Text(L.t("Processing...", hostLanguage))
                            .font(.round(11, .black))
                            .foregroundStyle(EC.pink)
                            .lineLimit(1)
                    }
                }
            }

            Spacer(minLength: 0)

            // Other participant avatars — tap to show name tooltip
            ParticipantAvatarRow(
                participants: viewModel.participants.filter { $0.id != hostId && !hiddenOfflineIds.contains($0.id) },
                maxVisible: 4,
                avatarSize: 32,
                onTapParticipant: { participant in
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        tooltipParticipant = tooltipParticipant?.id == participant.id ? nil : participant
                    }
                }
            )
        }
        .padding(.horizontal, 14)
        .padding(.top, 6)
        .padding(.bottom, 10)
        .background(Color.white.opacity(0.92).ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    // MARK: - Offline banner

    private var offlineBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 14, weight: .black))
            Text(L.t("You're offline", hostLanguage))
                .font(.round(14, .black))
            if viewModel.pendingQueueCount > 0 {
                Text("\(viewModel.pendingQueueCount) \(L.t("queued", hostLanguage))")
                    .font(.round(11, .black))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(.white))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
            }
        }
        .foregroundStyle(EC.ink)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(EC.yellow)
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
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
        VStack(spacing: 14) {
            Spacer()
            ChattoView(size: 96)
            VStack(spacing: 6) {
                Text(L.t("No messages yet", hostLanguage))
                    .font(.chunky(18))
                    .foregroundStyle(EC.ink)
                Text(L.t("Waiting for participants to start chatting", hostLanguage))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .ecCard(radius: 20, border: 3, shadow: 5)
            .padding(.horizontal, 40)
            if let joinCode = viewModel.room?.joinCode {
                Button {
                    showQRCode = true
                } label: {
                    Label(joinCode, systemImage: "qrcode")
                }
                .buttonStyle(.chunky(EC.yellow, size: .small, fullWidth: false))
            }
            Spacer()
        }
        .frame(maxWidth: .infinity)
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
                LazyVStack(spacing: 14) {
                    ForEach(filteredMessages) { message in
                        // Game complete bubble before first message after completedAt
                        if viewModel.isGameComplete,
                           let insertId = gameCompleteInsertBeforeId,
                           message.id == insertId {
                            gameCompleteBubble
                        }

                        if message.kind == .system, let text = message.text, text.hasPrefix("game_summary:") || text.hasPrefix("emoji_match_summary:") || text.hasPrefix("emoji_bingo_summary:") || text.hasPrefix("truth_or_dare_summary:") {
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
                .padding(.horizontal, 12)
                .padding(.top, 14)
            }
            .scrollDismissesKeyboard(.interactively)
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
            HStack(spacing: 8) {
                PackIcon("g-crown", size: 24)
                Text(L.t("Game complete! View Results", hostLanguage))
            }
        }
        .buttonStyle(.chunky(EC.violet, size: .small, fullWidth: false))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
        .popIn()
    }

    // MARK: - Reply indicator

    private func replyIndicator(for message: Message) -> some View {
        let sender = viewModel.participant(for: message.senderId)
        return HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(EC.pink)
                .frame(width: 4, height: 32)
            if let sender {
                AvatarDisc(avatarId: sender.avatar.value, size: 26)
            }
            VStack(alignment: .leading, spacing: 1) {
                Text("\(L.t("Replying to", hostLanguage)) \(sender?.nickname ?? L.t("Unknown", hostLanguage))")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.ink)
                Text(message.text?.prefix(40).description ?? "")
                    .font(.round(12, .medium))
                    .foregroundStyle(EC.inkSoft)
                    .lineLimit(1)
            }
            Spacer()
            Button {
                replyToId = nil
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.roundIcon(diameter: 28))
            .accessibilityLabel(L.t("Cancel", hostLanguage))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
        .background(EC.pinkSoft)
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    // MARK: - Input

    @State private var showAttachMenu = false
    @State private var vibeHot = false
    @State private var vibeConfetti = 0
    @State private var knownParticipantIds: Set<String> = []

    private func fireVibeConfetti() {
        Haptics.thump()
        vibeConfetti += 1
    }

    /// Web parity: a new arrival while the room is hot gets a confetti welcome
    private func confettiForNewArrivals(_ ids: [String]) {
        let arrived = Set(ids).subtracting(knownParticipantIds)
        let isFirstLoad = knownParticipantIds.isEmpty
        knownParticipantIds.formUnion(ids)
        if !isFirstLoad, vibeHot, arrived.contains(where: { $0 != hostId }) {
            fireVibeConfetti()
        }
    }

    private var vibeConfettiLayer: some View {
        ConfettiBurst(trigger: vibeConfetti, count: 50)
            .ignoresSafeArea()
            .onChange(of: viewModel.participants.map(\.id)) { confettiForNewArrivals($0) }
    }

    private var inputToolbar: some View {
        HStack(spacing: 8) {
            // Game button — End Game when active, Start Game otherwise
            if viewModel.activeGameSession != nil {
                Button {
                    showEndGameConfirm = true
                } label: {
                    Image(systemName: "stop.fill")
                        .font(.system(size: 14, weight: .black))
                }
                .buttonStyle(.roundIcon(EC.red, diameter: 40))
                .accessibilityLabel(L.t("End Game", hostLanguage))
            } else {
                Button {
                    Haptics.tap()
                    showGamePicker = true
                } label: {
                    PackIcon("ui-game", size: 26)
                }
                .buttonStyle(.roundIcon(EC.pinkSoft, diameter: 40))
                .accessibilityLabel(L.t("Games", hostLanguage))
            }

            // Drawing button
            Button {
                showDrawingComposer = true
                viewModel.setTypingAction("drawing")
            } label: {
                PackIcon("g-pencil", size: 24)
            }
            .buttonStyle(.roundIcon(EC.yellowSoft, diameter: 40))
            .accessibilityLabel(L.t("Draw", hostLanguage))

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
                PackIcon("ui-camera", size: 24)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(EC.blueSoft))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
                    .background(Circle().fill(EC.ink).offset(y: 4))
                    .padding(.bottom, 4)
            }
            .accessibilityLabel(L.t("Photo", hostLanguage))

            VibeBadge(
                messages: viewModel.messages,
                languageOf: { message in
                    if message.kind == .text, let text = message.text {
                        return VibeScore.isJapanese(text) ? "ja" : "en"
                    }
                    return viewModel.participant(for: message.senderId)?.preferredLanguage ?? "en"
                },
                hot: $vibeHot,
                onHype: fireVibeConfetti
            )

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
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: !messageText.trimmingCharacters(in: .whitespaces).isEmpty)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: speechRecognizer.isRecording)
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
        }
        .buttonStyle(.roundIcon(diameter: 44))
        .accessibilityLabel(L.t("Voice", hostLanguage))
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
                    .fill(EC.pink.opacity(0.45))
                    .frame(width: 44, height: 44)
                    .scaleEffect(1.0 + speechRecognizer.audioLevel * 1.6)
                    .animation(.interpolatingSpring(stiffness: 200, damping: 12), value: speechRecognizer.audioLevel)
                Image(systemName: "mic.fill")
                    .font(.system(size: 17, weight: .black))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(EC.pink))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
            }
        }
        .accessibilityLabel(L.t("Voice", hostLanguage))
    }

    private var inputView: some View {
        VStack(spacing: 0) {
            VStack(spacing: 8) {
                // Text area
                TextEditor(text: $messageText)
                    .focused($isTextEditorFocused)
                    .font(.round(16, .bold))
                    .foregroundStyle(EC.ink)
                    .tint(EC.pink)
                    .frame(minHeight: 40, maxHeight: 120)
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
                    .padding(.horizontal, 10)
                    .padding(.vertical, 3)
                    .overlay(alignment: .topLeading) {
                        if messageText.isEmpty {
                            Text(L.t("Type a message...", hostLanguage))
                                .font(.round(16, .bold))
                                .foregroundStyle(EC.inkSoft)
                                .padding(.leading, 15)
                                .padding(.top, 11)
                                .allowsHitTesting(false)
                        }
                    }
                    .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(EC.paper))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .strokeBorder(isTextEditorFocused ? EC.blue : EC.ink, lineWidth: 3)
                    )
                    .animation(.easeOut(duration: 0.15), value: isTextEditorFocused)

                inputToolbar
            }
            .padding(.horizontal, 12)
            .padding(.top, 10)
            .padding(.bottom, 6)
        }
        .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
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
                onStartWordRush: { pack, sayIt in
                    showGamePicker = false
                    minimizedWordRushGameId = nil
                    Task {
                        await viewModel.createWordRushLobby(pack: pack, sayIt: sayIt)
                        if viewModel.presentableWordRushGame != nil { showWordRushGame = true }
                    }
                },
                onStartEmojiMatch: {
                    showGamePicker = false
                    Task {
                        await viewModel.createEmojiMatchLobby()
                    }
                },
                onStartEmojiBingo: {
                    showGamePicker = false
                    Task {
                        await viewModel.createEmojiBingoLobby()
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
        // MARK: - Word Rush full-screen game
        .fullScreenCover(isPresented: $showWordRushGame) {
            WordRushGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onClose: {
                    viewModel.dismissWordRushResults()
                    showWordRushGame = false
                },
                onMinimize: {
                    minimizedWordRushGameId = viewModel.activeWordRushGame?.id
                    showWordRushGame = false
                }
            )
            .overlay { DebugConsoleView() }
        }
        .onChange(of: viewModel.presentableWordRushGame.map { "\($0.id)|\($0.status.rawValue)" }) { _ in
            if let g = viewModel.presentableWordRushGame {
                if !showWordRushGame && minimizedWordRushGameId != g.id {
                    showWordRushGame = true
                }
            } else {
                showWordRushGame = false
                minimizedWordRushGameId = nil
            }
        }
        // MARK: - Emoji Match full-screen game
        .fullScreenCover(isPresented: $showEmojiMatchGame) {
            EmojiMatchGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showEmojiMatchGame = false },
                onMinimize: {
                    if let g = viewModel.activeEmojiMatchGame {
                        minimizedEmojiMatchGameId = g.id
                    }
                    showEmojiMatchGame = false
                }
            )
            .overlay { DebugConsoleView() }
            .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
        }
        .onChange(of: viewModel.activeEmojiMatchGame) { game in
            if let g = game, g.status != .canceled, g.status != .completed {
                if !showEmojiMatchGame && minimizedEmojiMatchGameId != g.id {
                    showEmojiMatchGame = true
                }
            } else if game == nil || game?.status == .canceled {
                showEmojiMatchGame = false
                minimizedEmojiMatchGameId = nil
            }
        }
        // MARK: - Emoji Bingo full-screen game
        .fullScreenCover(isPresented: $showEmojiBingoGame) {
            EmojiBingoGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showEmojiBingoGame = false },
                onMinimize: {
                    if let g = viewModel.activeEmojiBingoGame {
                        minimizedEmojiBingoGameId = g.id
                    }
                    showEmojiBingoGame = false
                }
            )
            .overlay { DebugConsoleView() }
            .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
        }
        .onChange(of: viewModel.activeEmojiBingoGame) { game in
            if let g = game, g.status != .canceled, g.status != .completed {
                if !showEmojiBingoGame && minimizedEmojiBingoGameId != g.id {
                    showEmojiBingoGame = true
                }
            } else if game == nil || game?.status == .canceled {
                showEmojiBingoGame = false
                minimizedEmojiBingoGameId = nil
            }
        }
        // MARK: - Truth or Dare full-screen game
        .fullScreenCover(isPresented: $showTruthOrDareGame) {
            TruthOrDareGameView(
                viewModel: viewModel,
                lang: hostLanguage,
                onDismiss: { showTruthOrDareGame = false },
                onMinimize: {
                    if let g = viewModel.activeTruthOrDareGame {
                        minimizedTruthOrDareGameId = g.id
                    }
                    showTruthOrDareGame = false
                }
            )
            .overlay { DebugConsoleView() }
            .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
        }
        .onChange(of: viewModel.activeTruthOrDareGame) { game in
            if let g = game, g.status == .active {
                if !showTruthOrDareGame && minimizedTruthOrDareGameId != g.id {
                    showTruthOrDareGame = true
                }
            } else if game == nil || game?.status == .completed || game?.status == .canceled {
                showTruthOrDareGame = false
                minimizedTruthOrDareGameId = nil
            }
        }
    }

    // MARK: - Minimized game resume buttons

    @ViewBuilder
    private var minimizedGameResumeButtons: some View {
        VStack(alignment: .trailing, spacing: 8) {
            if let game = viewModel.activeTruthOrDareGame,
               game.status == .active,
               minimizedTruthOrDareGameId == game.id,
               !showTruthOrDareGame {
                resumePill(
                    emoji: "❓",
                    colors: [EC.yellow],
                    accessibility: L.t("Resume Truth or Dare", hostLanguage)
                ) {
                    minimizedTruthOrDareGameId = nil
                    showTruthOrDareGame = true
                }
            }
            if let game = viewModel.activeEmojiMatchGame,
               game.status != .canceled, game.status != .completed,
               minimizedEmojiMatchGameId == game.id,
               !showEmojiMatchGame {
                resumePill(
                    emoji: "⭐",
                    colors: [EC.violet],
                    accessibility: L.t("Resume Emoji Match", hostLanguage)
                ) {
                    minimizedEmojiMatchGameId = nil
                    showEmojiMatchGame = true
                }
            }
            if let game = viewModel.activeEmojiBingoGame,
               game.status != .canceled, game.status != .completed,
               minimizedEmojiBingoGameId == game.id,
               !showEmojiBingoGame {
                resumePill(
                    emoji: "🍀",
                    colors: [EC.mint],
                    accessibility: L.t("Resume Emoji Bingo", hostLanguage)
                ) {
                    minimizedEmojiBingoGameId = nil
                    showEmojiBingoGame = true
                }
            }
            if let game = viewModel.presentableWordRushGame,
               minimizedWordRushGameId == game.id,
               !showWordRushGame {
                resumePill(
                    emoji: "⚡",
                    colors: [EC.pink],
                    accessibility: L.t("Resume Word Rush", hostLanguage)
                ) {
                    minimizedWordRushGameId = nil
                    showWordRushGame = true
                }
            }
        }
        .padding(.top, 72)
        .padding(.trailing, 12)
    }

    private func resumePill(
        emoji: String,
        colors: [Color],
        accessibility: String,
        action: @escaping () -> Void
    ) -> some View {
        let fill = colors.first ?? EC.yellow
        return Button(action: action) {
            HStack(spacing: 6) {
                EmojiArt(emoji: emoji, size: 22)
                Text(L.t("Resume", hostLanguage))
                    .font(.chunky(13))
                    .foregroundStyle(EC.textOn(fill))
                Image(systemName: "play.fill")
                    .font(.system(size: 10, weight: .black))
                    .foregroundStyle(EC.textOn(fill))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Capsule().fill(fill))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 3))
            .background(Capsule().fill(EC.ink).offset(y: 4))
            .padding(.bottom, 4)
        }
        .buttonStyle(.pressable)
        .transition(.scale(scale: 0.4, anchor: .trailing).combined(with: .opacity))
        .accessibilityLabel(accessibility)
    }

    // MARK: - Closed banner

    private var closedBanner: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 14, weight: .black))
                Text(L.t("This room has been closed", hostLanguage))
                    .font(.round(15, .black))
            }
            .foregroundStyle(EC.ink)
            Button(L.t("Back to Home", hostLanguage)) {
                dismiss()
            }
            .buttonStyle(.chunky(EC.pink, size: .small))
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    // MARK: - Participant sheet

    @State private var maxParticipants: Int = 10

    private var participantSheet: some View {
        NavigationStack {
            List {
                ForEach(viewModel.participants) { participant in
                    HStack(spacing: 12) {
                        ParticipantAvatarView(participant: participant, size: 42)

                        VStack(alignment: .leading, spacing: 3) {
                            HStack(spacing: 6) {
                                Text(participant.nickname)
                                    .font(.round(16, .black))
                                    .foregroundStyle(EC.ink)
                                LangBadge(lang: participant.preferredLanguage, size: 18)
                                if participant.role == .host {
                                    ECChip(text: L.t("host", hostLanguage), fill: EC.blue)
                                }
                            }
                            Text(participant.online ? (participant.isAway ? L.t("Away", hostLanguage) : L.t("Online", hostLanguage)) : L.t("Offline", hostLanguage))
                                .font(.round(12, .bold))
                                .foregroundStyle(participant.online ? (participant.isAway ? Color(hex: "c78a00") : Color(hex: "14a37c")) : EC.inkSoft)
                        }

                        Spacer()

                        // Kick button (non-host only)
                        if participant.role != .host {
                            Button(role: .destructive) {
                                Task { await viewModel.kickParticipant(participant.id) }
                            } label: {
                                Text(L.t("Remove", hostLanguage))
                            }
                            .buttonStyle(.chunky(EC.red, size: .mini, fullWidth: false))
                        }
                    }
                    .padding(.vertical, 4)
                    .listRowBackground(Color.white)
                }

                Section {
                    Stepper(
                        "\(L.t("Max participants:", hostLanguage)) \(maxParticipants)",
                        value: $maxParticipants,
                        in: 2...20
                    )
                    .font(.round(15, .bold))
                    .foregroundStyle(EC.ink)
                    .listRowBackground(Color.white)

                    HStack(spacing: 10) {
                        Text(L.t("Language", hostLanguage))
                            .font(.round(15, .bold))
                            .foregroundStyle(EC.ink)
                        Spacer()
                        ForEach([("en", "English"), ("ja", "日本語")], id: \.0) { code, label in
                            Button {
                                Haptics.tap()
                                hostLanguage = code
                            } label: {
                                HStack(spacing: 5) {
                                    LangBadge(lang: code, size: 18)
                                    Text(label)
                                }
                            }
                            .buttonStyle(.chunky(hostLanguage == code ? EC.yellow : .white, size: .mini, fullWidth: false))
                        }
                    }
                    .listRowBackground(Color.white)
                    .onChange(of: hostLanguage) { newValue in
                        UserDefaults.standard.set(newValue, forKey: "enchatto_lastLanguage")
                    }

                    if !viewModel.translationPacksInstalled {
                        Button {
                            viewModel.requestTranslationDownload = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .font(.system(size: 22))
                                    .foregroundStyle(EC.blue)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(L.t("Download Offline Translation", hostLanguage))
                                        .font(.round(15, .black))
                                        .foregroundStyle(EC.ink)
                                    Text(L.t("Enables translation without internet", hostLanguage))
                                        .font(.round(12, .medium))
                                        .foregroundStyle(EC.inkSoft)
                                }
                            }
                        }
                        .listRowBackground(Color.white)
                    } else {
                        HStack(spacing: 8) {
                            PackIcon("g-ok", size: 22)
                            Text(L.t("Offline translation ready", hostLanguage))
                                .font(.round(15, .bold))
                                .foregroundStyle(EC.inkSoft)
                        }
                        .listRowBackground(Color.white)
                    }
                } header: {
                    ECLabel(L.t("Settings", hostLanguage))
                } footer: {
                    let deployment = AppConfig.convexDeploymentURL
                        .replacingOccurrences(of: "https://", with: "")
                        .replacingOccurrences(of: ".convex.site", with: "")
                    let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
                    VStack(spacing: 2) {
                        Text("\(deployment) · iOS v\(version)")
                        Text("github: \(GitInfo.commitSHA)")
                    }
                    .font(.round(10, .medium))
                    .foregroundStyle(EC.inkSoft)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                    .padding(.top, 8)
                }
            }
            .scrollContentBackground(.hidden)
            .background(RoomBackground(room: viewModel.room).ignoresSafeArea())
            .tint(EC.blue)
            .navigationTitle(L.t("Participants", hostLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(L.t("Done", hostLanguage)) {
                        viewModel.showParticipantSheet = false
                    }
                    .buttonStyle(.chunky(EC.blue, size: .mini, fullWidth: false))
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
            Image(systemName: "paperplane.fill")
                .font(.system(size: 17, weight: .black))
                .rotationEffect(.degrees(pulsing ? 8 : -4))
                .animation(
                    pulsing ? .easeInOut(duration: 0.5).repeatForever(autoreverses: true) : .default,
                    value: pulsing
                )
        }
        .buttonStyle(.roundIcon(hasText ? EC.blue : EC.lineSoft, diameter: 44))
        .accessibilityLabel("Send")
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

    private struct BingoPlayerScore: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let marked: Int
        let placement: Int
    }

    private struct BingoRoundData: Identifiable {
        let id = UUID()
        let players: [BingoPlayerScore]
        let winPattern: String
    }

    private enum SummaryData {
        case emojiMatch(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore])
        case emojiBingo(title: String, subtitle: String, games: [BingoRoundData], aggregated: [BingoPlayerScore])
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

            // If gameType is "Emoji Bingo", route to the bingo renderer (green gradient)
            if gameType.contains("Bingo") {
                // Bingo winners are whoever claimed first, not whoever marked the most
                var bingoPlayers: [BingoPlayerScore] = agg.values.map { e in
                    BingoPlayerScore(name: e.name, avatar: e.avatar, marked: e.totalScore, placement: e.wins)
                }
                bingoPlayers.sort { (a: BingoPlayerScore, b: BingoPlayerScore) -> Bool in
                    a.placement != b.placement ? a.placement > b.placement : a.marked > b.marked
                }
                let bingoRounds = gameRounds.map { round in
                    let bp = round.players.map { p in
                        BingoPlayerScore(name: p.name, avatar: p.avatar, marked: p.score, placement: p.isWinner ? 1 : 0)
                    }
                    return BingoRoundData(players: bp, winPattern: "line")
                }
                return .emojiBingo(title: gameType, subtitle: subtitle, games: bingoRounds, aggregated: bingoPlayers)
            }

            return .emojiMatch(title: gameType, subtitle: subtitle, games: gameRounds, aggregated: aggregated)
        } else if text.hasPrefix("emoji_bingo_summary:") {
            let json = String(text.dropFirst("emoji_bingo_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Emoji Bingo"
            let cancelled = obj["cancelled"] as? Bool ?? false

            var bingoRounds: [BingoRoundData] = []
            if let gamesArr = obj["games"] as? [[String: Any]] {
                for g in gamesArr {
                    let playersArr = g["players"] as? [[String: Any]] ?? []
                    let winPattern = g["winPattern"] as? String ?? "line"
                    let scores = playersArr.map { p in
                        BingoPlayerScore(
                            name: p["name"] as? String ?? "?",
                            avatar: p["avatar"] as? String ?? "default",
                            marked: p["marked"] as? Int ?? 0,
                            placement: p["placement"] as? Int ?? 0
                        )
                    }
                    bingoRounds.append(BingoRoundData(players: scores, winPattern: winPattern))
                }
            }

            let gameCount = bingoRounds.count
            let subtitle = cancelled ? L.t("Game ended early", lang) : "\(L.t("Game Complete", lang)) · \(gameCount) \(gameCount == 1 ? "game" : "games")"

            // Aggregate across rounds
            var agg: [String: (name: String, avatar: String, wins: Int, totalMarked: Int)] = [:]
            for g in bingoRounds {
                for p in g.players {
                    let key = "\(p.name)|\(p.avatar)"
                    var entry = agg[key] ?? (name: p.name, avatar: p.avatar, wins: 0, totalMarked: 0)
                    if p.placement == 1 { entry.wins += 1 }
                    entry.totalMarked += p.marked
                    agg[key] = entry
                }
            }
            var aggregated = agg.values.map { e in
                BingoPlayerScore(name: e.name, avatar: e.avatar, marked: e.totalMarked, placement: e.wins)
            }
            aggregated.sort { $0.placement > $1.placement || ($0.placement == $1.placement && $0.marked > $1.marked) }

            return .emojiBingo(title: gameType, subtitle: subtitle, games: bingoRounds, aggregated: aggregated)
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

    private enum BannerStyle {
        case lit, match, wordRush, bingo, truthOrDare

        var fill: Color {
            switch self {
            case .lit: return EC.blueSoft
            case .match: return EC.violetSoft
            case .wordRush: return EC.yellowSoft
            case .bingo: return EC.mintSoft
            case .truthOrDare: return EC.pinkSoft
            }
        }

        var accent: Color {
            switch self {
            case .lit: return EC.blue
            case .match: return EC.violet
            case .wordRush: return EC.yellow
            case .bingo: return EC.mint
            case .truthOrDare: return EC.pink
            }
        }

        var icon: String {
            switch self {
            case .lit: return "g-pencil"
            case .match: return "o-diamond"
            case .wordRush: return "g-bolt"
            case .bingo: return "g-clover"
            case .truthOrDare: return "g-question"
            }
        }
    }

    private static func isWordRush(_ title: String) -> Bool { title == "Word Rush" }

    private var style: BannerStyle {
        switch parsed {
        case .some(.truthOrDare): return .truthOrDare
        case .some(.emojiBingo): return .bingo
        case .some(.emojiMatch(let title, _, _, _)): return Self.isWordRush(title) ? .wordRush : .match
        default: return .lit
        }
    }

    var body: some View {
        if let data = parsed {
            VStack(spacing: 12) {
                switch data {
                case .emojiMatch(let title, let subtitle, let games, let aggregated):
                    emojiMatchBody(title: title, subtitle: subtitle, games: games, aggregated: aggregated)
                case .emojiBingo(let title, let subtitle, let games, let aggregated):
                    emojiBingoBody(title: title, subtitle: subtitle, games: games, aggregated: aggregated)
                case .litGame(let title, let subtitle, let players):
                    litGameBody(title: title, subtitle: subtitle, players: players)
                case .truthOrDare(let title, let subtitle, let players):
                    truthOrDareBody(title: title, subtitle: subtitle, players: players)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .ecCard(fill: style.fill, radius: 24, border: 3, shadow: 6)
            .padding(.horizontal, 4)
        } else {
            SystemMessageRow(text: text, lang: lang)
        }
    }

    // MARK: - Shared pieces

    private func header(title: String, subtitle: String) -> some View {
        HStack(spacing: 10) {
            PackIcon(style.icon, size: 30)
                .padding(6)
                .background(Circle().fill(style.accent))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
                .rotationEffect(.degrees(-8))
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.chunky(17))
                    .foregroundStyle(EC.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(subtitle)
                    .font(.round(11, .bold))
                    .foregroundStyle(EC.inkSoft)
            }
            Spacer(minLength: 0)
        }
    }

    /// Centred when it fits, horizontally scrollable when it doesn't
    private func fitRow<Content: View>(spacing: CGFloat = 8, @ViewBuilder _ content: () -> Content) -> some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .bottom, spacing: spacing) { content() }
                .padding(.vertical, 4)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .bottom, spacing: spacing) { content() }
                    .padding(.vertical, 4)
                    .padding(.horizontal, 4)
            }
        }
    }

    private func roundRow<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label)
                .font(.round(10, .black))
                .tracking(1)
                .textCase(.uppercase)
                .foregroundStyle(EC.inkSoft)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) { content() }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .frame(maxWidth: .infinity, alignment: .leading)
        .ecOutline(fill: .white.opacity(0.85), radius: 14, border: 2)
    }

    @ViewBuilder
    private func rankMark(_ rank: Int, size: CGFloat) -> some View {
        if rank == 0 {
            PackIcon("g-crown", size: size + 4)
        } else if rank <= 2 {
            Text("\(rank + 1)")
                .font(.chunky(size * 0.62))
                .foregroundStyle(EC.ink)
                .frame(width: size, height: size)
                .background(Circle().fill(rank == 1 ? EC.lineSoft : Color(hex: "f3dcc8")))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
        }
    }

    private func miniScore(avatar: String, name: String, value: String, rank: Int?, dim: Bool = false) -> some View {
        HStack(spacing: 4) {
            AvatarDisc(avatarId: avatar, size: 20)
            Text(name)
                .font(.round(11, .bold))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            if !value.isEmpty {
                Text(value)
                    .font(.chunky(12))
                    .foregroundStyle(EC.ink)
            }
            if let rank {
                rankMark(rank, size: 15)
            }
        }
        .opacity(dim ? 0.6 : 1)
    }

    private func playerCard(avatar: String, name: String, detail: String, rank: Int?, isHighlighted: Bool) -> some View {
        VStack(spacing: 4) {
            ZStack {
                if let rank { rankMark(rank, size: 18) }
            }
            .frame(height: 22)
            AvatarDisc(avatarId: avatar, size: 40)
            Text(name)
                .font(.round(11, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            Text(detail)
                .font(.chunky(14))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .frame(minWidth: 72)
        .ecCard(fill: isHighlighted ? EC.yellow : .white, radius: 16, border: 2.5, shadow: isHighlighted ? 5 : 3)
        .rotationEffect(.degrees(isHighlighted ? -3 : 0))
        .offset(y: isHighlighted ? -4 : 0)
    }

    // MARK: - Emoji Match / Word Rush body

    @ViewBuilder
    private func emojiMatchBody(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore]) -> some View {
        let wordRush = Self.isWordRush(title)
        header(title: L.t(title, lang), subtitle: subtitle)

        if games.count > 1 {
            ForEach(Array(games.enumerated()), id: \.element.id) { idx, game in
                emojiMatchGameRow(idx: idx, game: game)
            }
        }

        emojiMatchPodium(aggregated: aggregated, wordRush: wordRush)
    }

    @ViewBuilder
    private func emojiMatchGameRow(idx: Int, game: GameRoundData) -> some View {
        let sorted = game.players.sorted { $0.score > $1.score }
        roundRow("\(L.t("Game", lang)) \(idx + 1)") {
            ForEach(sorted) { p in
                let rank = sorted.firstIndex(where: { $0.score == p.score }) ?? 0
                miniScore(avatar: p.avatar, name: p.name, value: "\(p.score)", rank: rank <= 2 ? rank : nil)
            }
        }
    }

    @ViewBuilder
    private func emojiMatchPodium(aggregated: [PlayerScore], wordRush: Bool) -> some View {
        let podium: [PlayerScore] = aggregated.count >= 3
            ? [aggregated[1], aggregated[0], aggregated[2]] + Array(aggregated.dropFirst(3))
            : aggregated
        fitRow {
            ForEach(podium) { player in
                let rank = aggregated.firstIndex(where: { $0.score == player.score }) ?? 0
                let detail = wordRush
                    ? "\(player.score) \(L.t("pts", lang))"
                    : "\(player.score) \(player.score == 1 ? L.t("pair", lang) : L.t("pairs", lang))"
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: rank == 0 ? (player.score > 0 ? 0 : nil) : (rank <= 2 ? rank : nil),
                    isHighlighted: player.isWinner
                )
            }
        }
    }

    // MARK: - Emoji Bingo body

    @ViewBuilder
    private func emojiBingoBody(title: String, subtitle: String, games: [BingoRoundData], aggregated: [BingoPlayerScore]) -> some View {
        header(title: title, subtitle: subtitle)

        let patternLabels: [String: String] = ["line": "Line", "four_corners": "4 Corners", "blackout": "Blackout"]
        ForEach(Array(games.enumerated()), id: \.element.id) { idx, game in
            let winners = game.players.filter { $0.placement > 0 }.sorted { $0.placement < $1.placement }
            let others = game.players.filter { $0.placement == 0 }.sorted { $0.marked > $1.marked }
            roundRow("\(games.count > 1 ? "Game \(idx + 1) · " : "")\(patternLabels[game.winPattern] ?? game.winPattern)") {
                ForEach(winners) { p in
                    miniScore(avatar: p.avatar, name: p.name, value: "", rank: min(p.placement - 1, 2))
                }
                ForEach(others) { p in
                    miniScore(avatar: p.avatar, name: p.name, value: "\(p.marked)/25", rank: nil, dim: true)
                }
            }
        }

        emojiBingoPodium(aggregated: aggregated)
    }

    @ViewBuilder
    private func emojiBingoPodium(aggregated: [BingoPlayerScore]) -> some View {
        fitRow {
            ForEach(aggregated) { player in
                let isWinner = player.placement > 0
                let detail = isWinner
                    ? (player.placement > 1 ? "\(player.placement)× BINGO!" : "BINGO!")
                    : "\(player.marked) \(L.t("marked", lang))"
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: isWinner ? 0 : nil,
                    isHighlighted: isWinner
                )
            }
        }
    }

    // MARK: - Lost in Translation body

    @ViewBuilder
    private func litGameBody(title: String, subtitle: String, players: [PlayerScore]) -> some View {
        header(title: title, subtitle: subtitle)

        fitRow {
            ForEach(players) { player in
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: "\(player.score)/\(player.total)",
                    rank: player.isWinner ? 0 : nil,
                    isHighlighted: player.isWinner
                )
            }
        }
    }

    // MARK: - Truth or Dare body

    @ViewBuilder
    private func truthOrDareBody(title: String, subtitle: String, players: [TodPlayerRating]) -> some View {
        header(title: title, subtitle: subtitle)

        let topRating = players.first?.avgRating
        fitRow {
            ForEach(players) { player in
                let isTop = player.avgRating != nil && player.avgRating == topRating
                let rank = players.firstIndex(where: { $0.avgRating == player.avgRating }) ?? 0
                let detail: String = {
                    if let avg = player.avgRating {
                        return "★ \(String(format: "%.1f", avg))"
                    }
                    return "—"
                }()
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: rank == 0 ? (player.avgRating != nil ? 0 : nil) : (rank <= 2 ? rank : nil),
                    isHighlighted: isTop
                )
            }
        }
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
            // name is like "Lost in Translation Level 2" or "Word Rush" or "Emoji Match"
            if name.hasPrefix("Emoji Bingo") {
                return "🎰 \(L.t("Game Started: Emoji Bingo", lang))"
            }
            if name.hasPrefix("Word Rush") {
                return "⚡ \(L.t("Game Started: Word Rush", lang))"
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

    private static let iconOverrides: [String: String] = [
        "🎮": "ui-game", "❌": "g-no", "🎉": "g-ok", "🎲": "g-question", "🃏": "o-diamond", "🎰": "g-clover",
    ]

    /// Splits a leading "<emoji> " off the localized text so it can be drawn as pack art
    private var parts: (icon: String?, text: String) {
        let full = localizedText
        guard let first = full.first,
              let scalar = first.unicodeScalars.first,
              scalar.value > 0x2000, scalar.properties.isEmoji,
              full.dropFirst().first == " " else { return (nil, full) }
        return (String(first), String(full.dropFirst(2)))
    }

    private var fill: Color {
        if text.hasPrefix("game_correct:") { return EC.mintSoft }
        if text.hasPrefix("game_wrong:") { return EC.pinkSoft }
        if text.hasPrefix("game:") { return EC.yellowSoft }
        if text.hasPrefix("leave:") { return EC.paper }
        return .white
    }

    var body: some View {
        let p = parts
        HStack(spacing: 6) {
            if text.hasPrefix("join:") {
                PackIcon("re-wave", size: 18)
            } else if let icon = p.icon {
                if let asset = Self.iconOverrides[icon] {
                    PackIcon(asset, size: 18)
                } else {
                    EmojiArt(emoji: icon, size: 18)
                }
            }
            Text(p.text)
                .font(.round(12, .black))
                .foregroundStyle(text.hasPrefix("leave:") ? EC.inkSoft : EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 5)
        .background(Capsule().fill(fill))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .background(Capsule().fill(EC.ink).offset(y: 3))
        .padding(.bottom, 3)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 2)
    }
}

// MARK: - Typing bubble indicator

private struct TypingBubble: View {
    let participant: Participant
    var lang: String = "en"
    var timerSeconds: Int = 20

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            // Avatar
            VStack(spacing: 3) {
                AvatarDisc(avatarId: participant.avatar.value, size: 36)
                Text(participant.nickname)
                    .font(.round(10, .black))
                    .foregroundStyle(EC.inkSoft)
                    .lineLimit(1)
                    .frame(maxWidth: 44)
            }
            .padding(.bottom, 4)

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
                        Text(L.t("Speaking…", lang))
                            .font(.round(12, .black))
                            .foregroundStyle(EC.inkSoft)
                    }
                } else {
                    // Bouncing dots for typing
                    HStack(spacing: 4) {
                        BouncingDot(delay: 0, color: EC.blue)
                        BouncingDot(delay: 0.15, color: EC.pink)
                        BouncingDot(delay: 0.3, color: EC.mint)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .background(typingShape.fill(.white))
            .overlay(typingShape.stroke(EC.ink, lineWidth: 3))
            .background(typingShape.fill(EC.ink).offset(y: 4))
            .padding(.bottom, 4)

            Spacer(minLength: 0)
        }
        .transition(.scale(scale: 0.5, anchor: .bottomLeading).combined(with: .opacity))
    }

    private var typingShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 20,
            bottomLeadingRadius: 6,
            bottomTrailingRadius: 20,
            topTrailingRadius: 20,
            style: .continuous
        )
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
            Text(L.t("Drawing…", lang))
                .font(.round(12, .black))
                .foregroundStyle(EC.inkSoft)
            if let secondsLeft {
                Text("\(secondsLeft)s")
                    .font(.chunky(12))
                    .foregroundStyle(secondsLeft <= 3 ? EC.red : EC.ink)
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
    var color: Color = EC.inkSoft

    var body: some View {
        LoopClock { t in
            let up = (loopWave(t, period: 0.72, delay: delay) + 1) / 2
            Circle()
                .fill(color)
                .frame(width: 9, height: 9)
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
                .opacity(0.6 + 0.4 * up)
                .offset(y: -5 * up)
        }
    }
}

/// Orange pulsing bars for voice indicator
private struct VoiceBars: View {
    var body: some View {
        LoopClock { t in
            HStack(spacing: 2) {
                ForEach(0..<4) { i in
                    let level = (loopWave(t, period: 0.8, delay: Double(i) * 0.15) + 1) / 2
                    RoundedRectangle(cornerRadius: 2)
                        .fill(EC.pink)
                        .frame(width: 4, height: 5 + 11 * level)
                        .opacity(0.5 + 0.5 * level)
                }
            }
        }
        .frame(height: 16)
    }
}

/// Wiggling pencil for drawing indicator
private struct DrawingPencil: View {
    var body: some View {
        LoopClock { t in
            let w = loopWave(t, period: 0.8)
            PackIcon("g-pencil", size: 20)
                .rotationEffect(.degrees(-1 + 9 * w))
                .offset(y: -1 - w)
        }
    }
}

// MARK: - QR Code Floating Panel

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
            EC.ink.opacity(appeared ? 0.45 : 0)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            // Panel
            VStack(spacing: 14) {
                // Drag handle
                Capsule()
                    .fill(EC.lineSoft)
                    .frame(width: 44, height: 6)
                    .padding(.top, 10)

                ECQRCard(url: joinURL, size: 190)

                Button {
                    Haptics.success()
                    UIPasteboard.general.string = joinURL
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { copied = true }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation { copied = false }
                    }
                } label: {
                    VStack(spacing: 8) {
                        ECLabel(L.t("Room Code", lang))
                        RoomCodeTiles(code: joinCode, tileSize: 40)
                            .opacity(copied ? 0.6 : 1)
                        if copied {
                            ECChip(text: L.t("Copied!", lang), fill: EC.mint)
                                .transition(.scale.combined(with: .opacity))
                        } else {
                            Text(L.t("Tap to copy link", lang))
                                .font(.round(12, .bold))
                                .foregroundStyle(EC.inkSoft)
                                .transition(.opacity)
                        }
                    }
                }
                .buttonStyle(.pressable)

                Text(L.t("Scan or enter code to join", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
            }
            .frame(maxWidth: .infinity)
            .background {
                RoomBackground(index: 1)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            }
            .ecCard(fill: .clear, radius: 28, border: 3.5, shadow: 8)
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .offset(y: appeared ? dragOffset : -800)
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
            dragOffset = -800
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            isPresented = false
        }
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
                    DebugConsole.shared.trace(source: .processing, action: "offline:en→ja:batch")
                    await viewModel.translateQueueBatch(session: session, fromLang: "en")
                }
            Color.clear
                .translationTask(jaEnConfig) { session in
                    DebugConsole.shared.trace(source: .processing, action: "offline:ja→en:batch")
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

// MARK: - Vibe meter

/// Party meter ported from web `computeVibe`: chatter in the last minute, boosted by EN⇄JA back-and-forth.
private struct VibeScore {
    static let window: TimeInterval = 60
    static let comboGap: TimeInterval = 90
    static let hypeAt = 150

    let vibe: Int
    let hype: Bool

    init(messages: [Message], languageOf: (Message) -> String, now: Date) {
        let real = messages.filter { $0.kind != .system }
        let reference = max(now, real.last?.createdAt ?? now)
        let recent = real.filter { reference.timeIntervalSince($0.createdAt) < Self.window }

        var switches = 0
        for i in recent.indices.dropFirst() where languageOf(recent[i]) != languageOf(recent[i - 1]) {
            switches += 1
        }

        var combo = 0
        if let last = real.last, reference.timeIntervalSince(last.createdAt) < Self.comboGap {
            combo = 1
            for i in stride(from: real.count - 1, to: 0, by: -1) {
                let cur = real[i], prev = real[i - 1]
                if cur.createdAt.timeIntervalSince(prev.createdAt) > Self.comboGap
                    || languageOf(cur) == languageOf(prev) { break }
                combo += 1
            }
        }

        let mult = 1 + Double(min(combo, 20)) * 0.05
        vibe = Int((Double(recent.count * 12 + switches * 20) * mult).rounded())
        hype = vibe >= Self.hypeAt
    }

    static func isJapanese(_ text: String) -> Bool {
        text.unicodeScalars.contains {
            (0x3040...0x309F).contains($0.value) || (0x30A0...0x30FF).contains($0.value) || (0x4E00...0x9FFF).contains($0.value)
        }
    }
}

private struct VibeBadge: View {
    let messages: [Message]
    let languageOf: (Message) -> String
    @Binding var hot: Bool
    /// Fired when the meter crosses into hype while the room is open
    var onHype: () -> Void = {}

    /// Opening a room whose last minute was already hot shouldn't burst
    @State private var shownAt = Date()

    var body: some View {
        TimelineView(.periodic(from: .now, by: 5)) { context in
            let score = VibeScore(messages: messages, languageOf: languageOf, now: context.date)
            LoopClock(active: score.hype) { t in
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("VIBE")
                        .font(.round(9, .black))
                    Text(Self.format(score.vibe))
                        .font(.chunky(16))
                        .monospacedDigit()
                        .contentTransition(.numericText())
                }
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 10)
                .frame(height: 34)
                .background(Capsule().fill(fill(hype: score.hype, t: t)))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                .background(Capsule().fill(EC.ink).offset(y: 3))
                .padding(.bottom, 3)
            }
            .nudge(on: score.vibe, active: score.vibe > 0, angle: 6, hop: 4)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: score.vibe)
            .onAppear { hot = score.hype }
            .onChange(of: score.hype) { isHype in
                hot = isHype
                if isHype, Date().timeIntervalSince(shownAt) > 3 { onHype() }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Vibe \(score.vibe)")
        }
    }

    private func fill(hype: Bool, t: Double) -> AnyShapeStyle {
        guard hype else { return AnyShapeStyle(EC.yellow) }
        let shift = (t / 2).truncatingRemainder(dividingBy: 1)
        return AnyShapeStyle(LinearGradient(
            colors: [EC.yellow, EC.pinkSoft, EC.blueSoft, EC.yellow, EC.pinkSoft],
            startPoint: UnitPoint(x: -shift * 2, y: 0.5),
            endPoint: UnitPoint(x: 2 - shift * 2, y: 0.5)
        ))
    }

    private static func format(_ n: Int) -> String {
        guard n >= 1000 else { return "\(n)" }
        let k = (Double(n) / 100).rounded() / 10
        return k == k.rounded() ? "\(Int(k))K" : "\(k)K"
    }
}

// MARK: - QR Code Icon
/// QR glyph made of sushi: side-view maki sit in the three finder corners, roe and sesame fill the
/// data corner. Drawn in a 100×100 box.
private struct QRCodeIcon: View {
    private static let rice = Color(hex: "fffaf0")
    private static let salmon = Color(hex: "ff8a5c")
    private static let cucumber = Color(hex: "8ad35c")
    private static let tamago = Color(hex: "ffc93c")

    var body: some View {
        Canvas { ctx, size in
            ctx.scaleBy(x: size.width / 100, y: size.height / 100)
            Self.maki(ctx, cx: 28, top: 24, w: 40, h: 17, filling: Self.salmon)
            Self.maki(ctx, cx: 72, top: 24, w: 40, h: 17, filling: Self.cucumber)
            Self.maki(ctx, cx: 28, top: 66, w: 40, h: 17, filling: Self.tamago)
            for (x, y, color) in [(66.0, 64.0, Self.salmon), (80, 70, Self.cucumber), (70, 80, Self.salmon)] {
                let roe = Path(ellipseIn: CGRect(x: x - 5.5, y: y - 5.5, width: 11, height: 11))
                ctx.fill(roe, with: .color(color))
                ctx.stroke(roe, with: .color(EC.ink), lineWidth: 2.4)
            }
            ctx.fill(Path(ellipseIn: CGRect(x: 79, y: 81, width: 6, height: 6)), with: .color(EC.ink))
            ctx.fill(Path(ellipseIn: CGRect(x: 59.4, y: 75.4, width: 5.2, height: 5.2)), with: .color(EC.ink))
        }
    }

    /// Nori cylinder with a rice top and a finder-square filling
    private static func maki(_ ctx: GraphicsContext, cx: CGFloat, top: CGFloat, w: CGFloat, h: CGFloat, filling: Color) {
        let rx = w / 2
        let ry = w * 0.27
        var body = Path()
        body.move(to: CGPoint(x: cx - rx, y: top))
        body.addLine(to: CGPoint(x: cx - rx, y: top + h))
        for i in 1...24 {
            let a = Double.pi - Double.pi * Double(i) / 24
            body.addLine(to: CGPoint(x: cx + rx * cos(a), y: top + h + ry * sin(a)))
        }
        body.addLine(to: CGPoint(x: cx + rx, y: top))
        body.closeSubpath()
        let lid = Path(ellipseIn: CGRect(x: cx - rx, y: top - ry, width: w, height: ry * 2))

        ctx.fill(body, with: .color(EC.ink))
        ctx.fill(lid, with: .color(EC.ink))

        let rrx = rx * 0.8
        let rry = ry * 0.72
        ctx.fill(Path(ellipseIn: CGRect(x: cx - rrx, y: top - rry, width: rrx * 2, height: rry * 2)), with: .color(rice))
        let core = Path(
            roundedRect: CGRect(x: cx - rrx * 0.475, y: top - rry * 0.5, width: rrx * 0.95, height: rry),
            cornerRadius: rry * 0.22
        )
        ctx.fill(core, with: .color(filling))
        ctx.stroke(core, with: .color(EC.ink), lineWidth: rrx * 0.12)

        var shine = Path()
        shine.move(to: CGPoint(x: cx - rx * 0.7, y: top + ry * 0.95))
        shine.addLine(to: CGPoint(x: cx - rx * 0.7, y: top + h * 0.85))
        ctx.stroke(shine, with: .color(.white.opacity(0.9)), style: StrokeStyle(lineWidth: w * 0.07, lineCap: .round))
    }
}


#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
