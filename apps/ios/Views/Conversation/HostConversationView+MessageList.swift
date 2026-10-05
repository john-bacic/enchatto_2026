import SwiftUI

// PreferenceKey to capture message frames for context menu positioning
private struct MessageFramePreferenceKey: PreferenceKey {
    static var defaultValue: [String: CGRect] = [:]
    static func reduce(value: inout [String: CGRect], nextValue: () -> [String: CGRect]) {
        value.merge(nextValue(), uniquingKeysWith: { $1 })
    }
}

/// Latest on-screen frame per message row, read when the long-press menu opens
final class MessageFrameStore {
    var frames: [String: CGRect] = [:]
}

/// Keyboard dismiss with a gentler slide than the system's scroll dismiss; the keyboard inherits this animation's duration
private enum KeyboardDismiss {
    static func slow(duration: TimeInterval = 0.42) {
        UIView.animate(withDuration: duration, delay: 0, options: [.curveEaseInOut, .beginFromCurrentState, .allowUserInteraction]) {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}

/// Put inside a ScrollView's content: dismisses the keyboard as soon as the enclosing scroll view starts a drag
private struct ScrollDragKeyboardDismisser: UIViewRepresentable {
    func makeUIView(context: Context) -> HookView {
        let view = HookView(frame: .zero)
        view.isUserInteractionEnabled = false
        return view
    }

    func updateUIView(_ uiView: HookView, context: Context) {}

    /// Attaches when it lands in a window, the first moment its scroll view ancestor is guaranteed to exist
    final class HookView: UIView {
        private weak var pan: UIPanGestureRecognizer?

        override func didMoveToWindow() {
            super.didMoveToWindow()
            guard window != nil else { return }
            var ancestor = superview
            while let current = ancestor, !(current is UIScrollView) { ancestor = current.superview }
            guard let scrollView = ancestor as? UIScrollView, pan !== scrollView.panGestureRecognizer else { return }
            pan?.removeTarget(self, action: #selector(handlePan(_:)))
            scrollView.panGestureRecognizer.addTarget(self, action: #selector(handlePan(_:)))
            pan = scrollView.panGestureRecognizer
        }

        @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
            if gesture.state == .began { KeyboardDismiss.slow() }
        }
    }
}

extension HostConversationView {
    // MARK: - Full-screen image overlay

    @ViewBuilder
    var fullScreenImageOverlay: some View {
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
    var contextMenuOverlay: some View {
        // A menu opened on a placeholder carries on with the server's copy (and its row's frame) once that replaces it
        if let menuMessageId = contextMenuMessageId,
           let message = viewModel.message(withId: menuMessageId),
           let frame = messageFrames.frames[menuMessageId] ?? messageFrames.frames[message.id] {
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

    // MARK: - Empty state

    var emptyStateView: some View {
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
        .contentShape(Rectangle())
        .onTapGesture { KeyboardDismiss.slow() }
        .simultaneousGesture(DragGesture(minimumDistance: 8).onChanged { _ in
            if isTextEditorFocused { KeyboardDismiss.slow() }
        })
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
            msg.kind != .unknown
                && !(msg.kind == .system && (msg.text?.hasPrefix("away:") == true || msg.text?.hasPrefix("back:") == true))
        }
    }

    /// ID of the first message after game completedAt, or nil if bubble goes at end
    private var gameCompleteInsertBeforeId: String? {
        guard let completedAt = viewModel.latestGameSession?.completedAt else { return nil }
        return filteredMessages.first(where: { $0.createdAt > completedAt })?.id
    }

    var messageListView: some View {
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
                                onImageTap: { url in fullScreenImage = (url: url, messageId: message.id) },
                                onRetrySend: { viewModel.retrySend(id: message.id) },
                                onDeleteUnsent: { Task { await viewModel.deleteMessage(messageId: message.id) } },
                                replacesPlaceholder: viewModel.wasSentFromThisDevice(message.id)
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
                .background(ScrollDragKeyboardDismisser())
            }
            .scrollDismissesKeyboard(.interactively)
            .onPreferenceChange(MessageFramePreferenceKey.self) { frames in
                messageFrames.frames = frames
            }
            .onAppear { scrollToNewest(proxy, animated: false) }
            .onChange(of: viewModel.messages.count) { _ in
                guard contextMenuMessageId == nil else { return }
                scrollToNewest(proxy)
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
            .onChange(of: isTextEditorFocused) { focused in
                guard focused else { return }
                // After the keyboard has shrunk the list, so the newest message sits above it
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    withAnimation(.easeOut(duration: 0.25)) {
                        proxy.scrollTo("bottom-anchor", anchor: .bottom)
                    }
                }
            }
        }
    }

    /// Scrolls the list to its newest message, and once more shortly after. The first pass can stop short and leave
    /// the newest message under the input bar: it runs before a new row of the lazy stack has its height, and a
    /// send closes the keyboard, which is still changing the height of the list
    private func scrollToNewest(_ proxy: ScrollViewProxy, animated: Bool = true) {
        if animated {
            withAnimation { proxy.scrollTo("bottom-anchor", anchor: .bottom) }
        } else {
            proxy.scrollTo("bottom-anchor", anchor: .bottom)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            guard contextMenuMessageId == nil else { return }
            withAnimation(.easeOut(duration: 0.25)) {
                proxy.scrollTo("bottom-anchor", anchor: .bottom)
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
}
