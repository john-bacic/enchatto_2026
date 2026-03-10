import SwiftUI
import PhotosUI
import CoreImage.CIFilterBuiltins
import Translation

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
    @State private var tooltipParticipant: Participant?
    @State private var fullScreenImage: (url: String, messageId: String)?
    @StateObject private var speechRecognizer = SpeechRecognizer()

    init(roomId: String, hostId: String) {
        self.roomId = roomId
        self.hostId = hostId
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    var body: some View {
        VStack(spacing: 0) {
            headerView

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

    // MARK: - Header

    private var headerView: some View {
        HStack {
            // Host's own avatar + title
            Button {
                showQRCode = true
            } label: {
                HStack(spacing: 8) {
                    if let host = viewModel.participant(for: hostId) {
                        ZStack {
                            Circle()
                                .fill(host.avatarColor)
                                .frame(width: 32, height: 32)
                            Text(host.avatarEmoji)
                                .font(.system(size: 18))
                        }
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(L.t("Enchatto", hostLanguage))
                            .font(.headline)
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
                }
            }
            .buttonStyle(.plain)

            Spacer()

            // Other participant avatars — tap to show name tooltip
            ParticipantAvatarRow(
                participants: viewModel.participants.filter { $0.id != hostId },
                maxVisible: 5,
                avatarSize: 28,
                onTapParticipant: { participant in
                    withAnimation(.easeOut(duration: 0.15)) {
                        tooltipParticipant = tooltipParticipant?.id == participant.id ? nil : participant
                    }
                }
            )

            // Menu
            Menu {
                // Language display toggles
                Button {
                    showEnglish.toggle()
                } label: {
                    Label(L.t("English", hostLanguage), systemImage: showEnglish ? "checkmark.circle.fill" : "circle")
                }
                Button {
                    showJapanese.toggle()
                } label: {
                    Label(L.t("Japanese", hostLanguage), systemImage: showJapanese ? "checkmark.circle.fill" : "circle")
                }
                Button {
                    showRomaji.toggle()
                } label: {
                    Label(L.t("Romaji", hostLanguage), systemImage: showRomaji ? "checkmark.circle.fill" : "circle")
                }

                Divider()

                Button {
                    viewModel.showParticipantSheet = true
                } label: {
                    Label(L.t("Participants", hostLanguage), systemImage: "person.2")
                }

                Divider()

                Button(role: .destructive) {
                    showCloseConfirmation = true
                } label: {
                    Label(L.t("Close Room", hostLanguage), systemImage: "xmark.circle")
                }
            } label: {
                Image(systemName: "ellipsis")
                    .font(.title3)
                    .rotationEffect(.degrees(90))
                    .frame(width: 32, height: 44)
                    .contentShape(Rectangle())
            }
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

    private var messageListView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.messages) { message in
                        if message.kind == .system {
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

                    // Typing indicator bubbles
                    ForEach(viewModel.typingParticipants) { participant in
                        TypingBubble(participant: participant)
                    }
                }
                .padding()
            }
            .onPreferenceChange(MessageFramePreferenceKey.self) { frames in
                messageFrames = frames
            }
            .onChange(of: viewModel.messages.count) { _ in
                guard contextMenuMessageId == nil else { return }
                if let lastId = viewModel.messages.last?.id {
                    withAnimation {
                        proxy.scrollTo(lastId, anchor: .bottom)
                    }
                }
            }
        }
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

    private var voiceButton: some View {
        Button {
            if !speechRecognizer.isRecording {
                isTextEditorFocused = false
                viewModel.setTypingAction("voicing")
            } else {
                viewModel.setTypingAction(nil)
            }
            speechRecognizer.updateLocale(hostLanguage)
            speechRecognizer.toggleRecording()
        } label: {
            let recording = speechRecognizer.isRecording
            HStack(spacing: 4) {
                Image(systemName: recording ? "mic.fill" : "mic")
                    .font(.system(size: 14))
                Text(L.t("Voice", hostLanguage))
                    .font(.system(size: 13, weight: .medium))
            }
            .foregroundStyle(recording ? .red : .secondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(recording ? Color.red.opacity(0.15) : Color(.systemGray5))
            .clipShape(Capsule())
        }
    }

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

            voiceButton

            Spacer()

            // Send button
            SendButton(
                hasText: !messageText.trimmingCharacters(in: .whitespaces).isEmpty,
                action: sendCurrentMessage
            )
        }
        .padding(.horizontal, 10)
        .padding(.bottom, 10)
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
                        viewModel.setTypingAction(text.isEmpty ? nil : "typing")
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
            if !newTranscript.isEmpty {
                messageText = newTranscript
            }
        })
        .onChange(of: speechRecognizer.isRecording, perform: { recording in
            if !recording && !speechRecognizer.transcript.isEmpty {
                speechRecognizer.transcript = ""
            }
        })
        .fullScreenCover(isPresented: $showDrawingComposer) {
            DrawingComposerView(
                lang: hostLanguage,
                onSend: { image in
                    showDrawingComposer = false
                    Task { await viewModel.sendDrawing(image, replyToId: replyToId); replyToId = nil }
                },
                onCancel: { showDrawingComposer = false }
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
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        if speechRecognizer.isRecording {
            speechRecognizer.toggleRecording()
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
    @State private var pulsing = false

    var body: some View {
        Button(action: action) {
            ZStack {
                if hasText {
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
            pulsing = active
        }
        .onAppear {
            pulsing = hasText
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
        }
        return text
    }

    var body: some View {
        HStack(spacing: 8) {
            line
            Text(localizedText)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            line
        }
        .padding(.vertical, 4)
    }

    private var line: some View {
        Rectangle()
            .fill(Color(.separator))
            .frame(height: 0.5)
    }
}

// MARK: - Typing bubble indicator

private struct TypingBubble: View {
    let participant: Participant

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

            // Bubble with 3 animated dots
            HStack(spacing: 4) {
                BouncingDot(delay: 0)
                BouncingDot(delay: 0.15)
                BouncingDot(delay: 0.3)
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

/// Single bouncing dot — matches web keyframes:
/// 0%,60%,100%: y=0, opacity=0.4  |  30%: y=-4, opacity=1
/// Total cycle: 1.2s, staggered by delay
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

#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
