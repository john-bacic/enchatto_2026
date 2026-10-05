import SwiftUI

extension HostConversationView {
    // MARK: - QR Overlay

    @ViewBuilder
    var qrOverlay: some View {
        if showQRCode, let joinCode = viewModel.room?.joinCode {
            QRCodeFloatingPanel(joinCode: joinCode, isPresented: $showQRCode, lang: hostLanguage)
        }
    }

    // MARK: - Offline fade-out

    func updateHiddenOfflineIds(participants: [Participant]) {
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
    var gameStatusBarSection: some View {
        if let gameStatus = viewModel.gameStatus {
            GameStatusBarView(status: gameStatus, lang: hostLanguage, drawTimeLeft: viewModel.drawCountdownTimeLeft, myId: hostId)
        }
    }

    // MARK: - Header

    var headerView: some View {
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
                    EnchattoWordmark(
                        text: L.t("Enchatto", hostLanguage),
                        size: 22,
                        hopTrigger: logoHop,
                        hot: vibeHot && viewModel.room?.status != .closed,
                        hopOnTap: true
                    )
                    .onChange(of: latestDeliveredMessage?.id) { _ in
                        // Polls replace the whole list, so "new" means sent after this screen opened
                        guard let last = latestDeliveredMessage, last.kind != .system,
                              last.createdAt > screenOpenedAt else { return }
                        logoHop += 1
                    }
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
            .layoutPriority(1)

            Spacer(minLength: 0)

            HStack(spacing: 8) {
                VibeBadge(
                    messages: viewModel.messages,
                    languageOf: { message in
                        if message.kind == .text, let text = message.text {
                            return VibeScore.isJapanese(text) ? "ja" : "en"
                        }
                        return viewModel.participant(for: message.senderId)?.preferredLanguage ?? "en"
                    },
                    language: hostLanguage,
                    hot: $vibeHot,
                    onHype: fireVibeConfetti
                )
                .fixedSize()
                headerParticipants
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.7), value: headerOthers.count > 3)
        }
        .padding(.horizontal, 14)
        .padding(.top, 6)
        .padding(.bottom, 10)
        .background(Color.white.opacity(0.92).ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    /// Newest message the server has. The host's own placeholders are skipped, so a message hops the wordmark once,
    /// when the server's copy arrives, and a guest's message still does while one of the host's waits below it
    private var latestDeliveredMessage: Message? {
        viewModel.messages.last { !$0.isQueuedPlaceholder }
    }

    private var headerOthers: [Participant] {
        viewModel.participants.filter { $0.id != hostId && !hiddenOfflineIds.contains($0.id) }
    }

    /// Up to three avatars, past that one stack; either opens "In this room"
    @ViewBuilder
    private var headerParticipants: some View {
        let others = headerOthers
        if !others.isEmpty {
            Button {
                Haptics.tap()
                showInRoom = true
            } label: {
                if others.count > 3 {
                    ParticipantStack(participants: others)
                } else {
                    ParticipantAvatarRow(participants: others, maxVisible: 3, avatarSize: 30)
                }
            }
            .buttonStyle(.pressable)
            .accessibilityLabel("\(L.t("In this room", hostLanguage)) \(others.count + 1)")
            .transition(.scale.combined(with: .opacity))
        }
    }

    // MARK: - Offline banner

    /// What the banner says: the device is offline, or it is online and polls keep failing, or (polls fine) a send is being retried
    private var connectionBannerKey: String {
        if viewModel.isOffline { return "You're offline" }
        guard let issue = viewModel.pollIssue else { return "Sending…" }
        return issue == .failing ? "Can't update the room" : "Reconnecting..."
    }

    var offlineBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: viewModel.isOffline || viewModel.pollIssue != nil ? "wifi.slash" : "arrow.triangle.2.circlepath")
                .font(.system(size: 14, weight: .black))
            Text(L.t(connectionBannerKey, hostLanguage))
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
        .animation(.easeInOut(duration: 0.3), value: viewModel.pollIssue)
        .animation(.easeInOut(duration: 0.3), value: viewModel.isSendDelayed)
    }

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

    var vibeConfettiLayer: some View {
        ConfettiBurst(trigger: vibeConfetti, count: 50)
            .ignoresSafeArea()
            .onChange(of: viewModel.participants.map(\.id)) { confettiForNewArrivals($0) }
    }
}
