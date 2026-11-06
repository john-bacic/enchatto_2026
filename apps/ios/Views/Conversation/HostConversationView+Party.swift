import SwiftUI

/// A guest's arrival, on the join cut-in
struct JoinCutIn {
    /// The join message's
    let id: String
    let name: String
    let avatarId: String?
}

/// What changes when messages arrive, or when the first load is over
struct MessagesArrival: Equatable {
    let loading: Bool
    let count: Int
    let newestId: String?
}

extension HostConversationView {
    // MARK: - Party mode (PartyMode.swift)

    /// The language a message counts in on the vibe meter: its text's, or else its sender's
    func vibeLanguage(of message: Message) -> String {
        if message.kind == .text, let text = message.text {
            return VibeScore.isJapanese(text) ? "ja" : "en"
        }
        return viewModel.participant(for: message.senderId)?.preferredLanguage ?? "en"
    }

    var messagesArrival: MessagesArrival {
        MessagesArrival(loading: viewModel.isLoading, count: viewModel.messages.count, newestId: viewModel.messages.last?.id)
    }

    /// Behind the messages in party mode: the rays, and the people online cheering along the bottom
    var partyBackdrop: some View {
        ZStack(alignment: .bottom) {
            if vibe.hype {
                PartyRays()
                CheeringCrowd(avatarIds: viewModel.participants.filter(\.online).prefix(6).map(\.avatar.value))
            }
        }
        .animation(.easeOut(duration: 0.8), value: vibe.hype)
        .allowsHitTesting(false)
    }

    /// In front of the messages: the bunting in party mode, the combo card from a back-and-forth of three, and the
    /// points new messages float up
    var partyFront: some View {
        ZStack(alignment: .topLeading) {
            if vibe.hype {
                PartyBunting()
            }
            if vibe.combo >= 3 {
                ComboCard(combo: vibe.combo, multiplier: vibe.multiplier, language: hostLanguage)
                    .id(vibe.combo)
                    .padding(.leading, 10)
                    .padding(.top, 30)
            }
            GeometryReader { geo in
                ForEach(vibeFloaters) { floater in
                    VibeFloaterView(text: floater.text)
                        .position(x: geo.size.width * floater.across, y: geo.size.height - 76)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .animation(.easeOut(duration: 0.8), value: vibe.hype)
        .allowsHitTesting(false)
    }

    @ViewBuilder
    var joinCutInLayer: some View {
        if let cutIn = joinCutIn {
            JoinCutInBanner(name: cutIn.name, avatarId: cutIn.avatarId, language: hostLanguage)
                .id(cutIn.id)
        }
    }

    /// Looks over the messages that came since the last look (web: useVibe). A guest's arrival gets the cut-in, with
    /// confetti in party mode, and in party mode each new message floats its points up
    func partyForNewMessages() {
        let delivered = viewModel.messages.filter { !$0.isQueuedPlaceholder }
        guard var seen = partySeenIds else {
            // The room as it was when the screen opened is no news
            if !viewModel.isLoading { partySeenIds = Set(delivered.map(\.id)) }
            return
        }
        // Not older than the screen either: after a first load that failed, the next one brings the whole room
        let fresh = delivered.filter { !seen.contains($0.id) && $0.createdAt > screenOpenedAt.addingTimeInterval(-5) }
        seen.formUnion(delivered.map(\.id))
        partySeenIds = seen
        guard !fresh.isEmpty else { return }

        let hype = VibeScore(messages: viewModel.messages, languageOf: vibeLanguage(of:), now: Date()).hype
        for message in fresh where message.kind == .system {
            guard let text = message.text, text.hasPrefix("join:"),
                  message.senderId != hostId, message.senderId != viewModel.room?.hostId else { continue }
            if !reduceMotion {
                showJoinCutIn(JoinCutIn(
                    id: message.id,
                    name: String(text.dropFirst("join:".count)),
                    avatarId: viewModel.participant(for: message.senderId)?.avatar.value
                ))
            }
            if hype { fireVibeConfetti() }
        }

        guard hype, !reduceMotion else { return }
        let said = delivered.filter { $0.kind != .system }
        for message in fresh where message.kind != .system {
            guard let at = said.firstIndex(where: { $0.id == message.id }) else { continue }
            let switched = at > 0 && vibeLanguage(of: said[at - 1]) != vibeLanguage(of: message)
            let floater = VibeFloater(text: switched ? "+32" : "+12", across: .random(in: 0.18...0.82))
            vibeFloaters.append(floater)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                vibeFloaters.removeAll { $0.id == floater.id }
            }
        }
    }

    private func showJoinCutIn(_ cutIn: JoinCutIn) {
        joinCutIn = cutIn
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            if joinCutIn?.id == cutIn.id { joinCutIn = nil }
        }
    }
}
