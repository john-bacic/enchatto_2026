import SwiftUI

struct EmojiMatchGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void
    var onMinimize: (() -> Void)? = nil

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var showCompleted = false
    @State private var lastMatchedCount = 0
    @State private var streak = 0
    @State private var lastScorer: String?
    @State private var pairPop: PairPop?
    @State private var confettiTrigger = 0

    private struct PairPop: Equatable {
        let id = UUID()
        let text: String
        let fill: Color
        let big: Bool
    }

    var body: some View {
        ZStack {
            RoomBackground(room: viewModel.room).ignoresSafeArea()

            if let game = viewModel.activeEmojiMatchGame {
                switch game.status {
                case .lobby:
                    lobbyView(game: game)
                case .active, .resolving, .completed:
                    // One branch for the board in every status that shows it, so the card views live
                    // through the end of the game and the last pair pops like every other pair
                    if game.status == .completed && showCompleted {
                        completedView(game: game)
                            .transition(.opacity)
                    } else {
                        boardView(game: game)
                    }
                case .canceled:
                    EmptyView()
                }
            }

            if let pairPop {
                Group {
                    if pairPop.big {
                        CutInBanner(text: pairPop.text, fill: pairPop.fill, icon: "re-star")
                    } else {
                        ZStack {
                            Text(pairPop.text)
                                .font(.chunky(26))
                                .foregroundStyle(.white)
                                .shadow(color: EC.ink, radius: 0, y: 3)
                                .padding(.horizontal, 18)
                                .padding(.vertical, 6)
                                .ecCard(fill: pairPop.fill, radius: 16, border: 3.5, shadow: 5)
                                .rotationEffect(.degrees(-6))
                                .stampIn()
                            FloatingScore(text: "+1")
                                .offset(x: 70, y: -36)
                        }
                    }
                }
                .id(pairPop.id)
                .allowsHitTesting(false)
                .transition(.opacity)
            }

            ConfettiBurst(trigger: confettiTrigger, count: reduceMotion ? 20 : 50)
                .ignoresSafeArea()
        }
        .onChange(of: viewModel.activeEmojiMatchGame?.status) { newStatus in
            // A miss ends a combo even when the same player keeps the turn (the others are away)
            if newStatus == .resolving { streak = 0; lastScorer = nil }
            if newStatus == .completed {
                showCompleted = false
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    withAnimation { showCompleted = true }
                }
            } else {
                showCompleted = false
            }
        }
        .onChange(of: viewModel.activeEmojiMatchGame?.matchedPairCount ?? 0) { count in
            defer { lastMatchedCount = count }
            guard count > lastMatchedCount, let game = viewModel.activeEmojiMatchGame else {
                if count < lastMatchedCount { streak = 0; lastScorer = nil }
                return
            }
            let scorer = game.currentTurnParticipantId
            streak = scorer == lastScorer ? streak + 1 : 1
            lastScorer = scorer
            celebratePair(streak: streak)
        }
        .onChange(of: viewModel.activeEmojiMatchGame?.currentTurnParticipantId) { turn in
            if turn != lastScorer { streak = 0 }
        }
    }

    private func celebratePair(streak: Int) {
        Haptics.success()
        let pop: PairPop
        switch streak {
        case ...1: pop = PairPop(text: L.t("PAIR!", lang), fill: EC.mint, big: false)
        case 2: pop = PairPop(text: "\(L.t("COMBO", lang)) ×2!", fill: EC.yellow, big: false)
        default: pop = PairPop(text: "\(L.t("COMBO", lang)) ×\(streak)!", fill: EC.pink, big: true)
        }
        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { pairPop = pop }
        if streak >= 2 { confettiTrigger += 1 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.3) {
            if pairPop == pop { withAnimation { pairPop = nil } }
        }
    }

    private func header(game: EmojiMatchGame) -> some View {
        GKHeader(icon: "o-cherry", title: L.t("Emoji Match", lang), lang: lang, onMinimize: onMinimize) {
            if game.status != .lobby {
                GKCounter(text: "\(game.matchedPairCount)/\(game.totalPairs) \(L.t("pairs", lang))")
                Button(L.t("End Game", lang)) {
                    Task { await viewModel.cancelEmojiMatch() }
                }
                .buttonStyle(.chunky(EC.red, size: .mini, fullWidth: false))
            }
        }
    }

    // MARK: - Lobby

    private func lobbyView(game: EmojiMatchGame) -> some View {
        let amJoined = game.players.contains { $0.participantId == viewModel.hostId }
        let amHost = game.hostParticipantId == viewModel.hostId
        let players = game.players.map {
            GKPlayer(
                id: $0.participantId, nickname: $0.nickname, avatarValue: $0.avatarValue,
                isHost: $0.participantId == game.hostParticipantId, isMe: $0.participantId == viewModel.hostId
            )
        }

        return VStack(spacing: 0) {
            header(game: game)
            GKLobby(
                icon: "o-cherry",
                title: L.t("Emoji Match", lang),
                tagline: L.t("Find matching emoji pairs! Take turns flipping cards.", lang),
                accent: EC.violet,
                playersLabel: "\(L.t("Players", lang)) (\(game.players.count)/30)",
                players: players,
                lang: lang
            ) {
                ECChip(text: L.t("Works solo or multiplayer", lang), fill: EC.violetSoft, icon: "av-bunny")
            } footer: {
                if !amJoined {
                    Button(L.t("Join Game", lang)) {
                        Haptics.tap()
                        Task { await viewModel.joinEmojiMatchLobby() }
                    }
                    .buttonStyle(.chunky(EC.mint))
                }

                if amJoined && !amHost {
                    Button(L.t("Leave Lobby", lang)) {
                        Task { await viewModel.leaveEmojiMatchLobby() }
                    }
                    .buttonStyle(.chunky(.white, size: .small))
                }

                if amHost {
                    Button(L.t("Start Game", lang)) {
                        Haptics.thump()
                        Task { await viewModel.startEmojiMatch() }
                    }
                    .buttonStyle(.chunky(EC.violet))
                    .gkWiggle(angle: 0.8, duration: 0.45)

                    Button(L.t("Cancel", lang)) {
                        Task { await viewModel.cancelEmojiMatch() }
                    }
                    .buttonStyle(.chunky(.white, size: .small))
                }
            }
        }
    }

    // MARK: - Board

    private func boardView(game: EmojiMatchGame) -> some View {
        let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
        let isResolving = game.status == .resolving
        let currentPlayer = game.players.first { $0.participantId == game.currentTurnParticipantId }
        let canFlip = isMyTurn && !isResolving && game.selectedCardIds.count < 2

        return VStack(spacing: 10) {
            header(game: game)

            scoreStrip(game: game)

            HStack(spacing: 10) {
                if isMyTurn {
                    (Text(L.t("Your turn!", lang)) + Text(" ") + Text(L.t("Find a pair", lang)).foregroundColor(EC.pink))
                        .font(.chunky(19))
                        .foregroundStyle(EC.ink)
                } else if let player = currentPlayer {
                    AvatarDisc(avatarId: player.avatarValue, size: 30)
                    (Text(player.nickname) + Text(L.t("'s turn", lang)))
                        .font(.chunky(18))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                if let timeoutMs = game.turnTimeoutMs, let started = game.turnStartedAt, game.players.count > 1, game.status != .completed {
                    GKTimerRing(startedAtMs: started, totalMs: Double(timeoutMs), hurryBelow: 5, size: 38)
                }
            }
            .padding(.horizontal, 16)
            .animation(.spring(response: 0.35, dampingFraction: 0.6), value: isMyTurn)

            GeometryReader { geo in
                let cols = max(1, game.boardCols)
                let rows = max(1, Int(ceil(Double(game.board.count) / Double(cols))))
                let gap: CGFloat = cols > 4 ? 7 : 9
                let cellW = (geo.size.width - gap * CGFloat(cols - 1)) / CGFloat(cols)
                let cellH = (geo.size.height - gap * CGFloat(rows - 1)) / CGFloat(rows) - 4
                let height = min(cellH, cellW * 1.3)
                let width = min(cellW, height / 0.8)
                let columns = Array(repeating: GridItem(.fixed(width), spacing: gap), count: cols)

                LazyVGrid(columns: columns, spacing: gap) {
                    ForEach(game.board) { card in
                        FlipCardView(
                            card: card,
                            canFlip: canFlip && !card.isMatched && !card.isRevealed,
                            onFlip: {
                                Haptics.tap()
                                Task { await viewModel.flipEmojiMatchCard(cardId: card.cardId) }
                            }
                        )
                        .frame(width: width, height: height)
                    }
                }
                // Card ids repeat from game to game (card_0 ...): a new deal gets new card views, with nothing kept from the last
                .id(game.id)
                .frame(width: geo.size.width, height: geo.size.height, alignment: .center)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 14)
        }
    }

    private func scoreStrip(game: EmojiMatchGame) -> some View {
        let players = game.players.filter(\.isActive)
        let topScore = players.map(\.score).max() ?? 0

        return ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(players) { player in
                    let isTurn = player.participantId == game.currentTurnParticipantId
                    let isMe = player.participantId == viewModel.hostId
                    HStack(spacing: 6) {
                        AvatarDisc(avatarId: player.avatarValue, size: 32)
                        VStack(alignment: .leading, spacing: 0) {
                            Text(isMe ? L.t("You", lang).uppercased() : player.nickname)
                                .font(.round(11, .black))
                                .foregroundStyle(EC.ink)
                                .lineLimit(1)
                            Text("\(player.turns ?? 0) \(L.t("turns", lang))")
                                .font(.round(9.5, .bold))
                                .foregroundStyle(EC.ink.opacity(0.55))
                        }
                        Spacer(minLength: 4)
                        if player.score == topScore && topScore > 0 {
                            PackIcon("g-crown", size: 16)
                        }
                        Text("\(player.score)")
                            .font(.chunky(18))
                            .foregroundStyle(EC.ink)
                            .monospacedDigit()
                    }
                    .padding(.leading, 4)
                    .padding(.trailing, 10)
                    .padding(.vertical, 4)
                    .frame(minWidth: 110)
                    .background(
                        RoundedRectangle(cornerRadius: 17, style: .continuous)
                            .strokeBorder(EC.pink, lineWidth: isTurn ? 3 : 0)
                            .padding(-4)
                    )
                    .ecCard(fill: isTurn ? EC.yellow : .white, radius: 14, border: 2.5, shadow: isTurn ? 5 : 3)
                    .rotationEffect(.degrees(isTurn ? -2 : 0))
                    .offset(y: isTurn ? -3 : 0)
                    .animation(.spring(response: 0.35, dampingFraction: 0.55), value: isTurn)
                    .animation(.spring(response: 0.35, dampingFraction: 0.55), value: player.score)
                    .accessibilityElement(children: .combine)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    // MARK: - Completed

    private func completedView(game: EmojiMatchGame) -> some View {
        let isSolo = game.players.count == 1
        let isCanceled = game.result?.endReason == "canceled"
        let isWinner = game.result?.winnerParticipantIds.contains(viewModel.hostId) ?? false
        let sortedPlayers = game.players.sorted { $0.score > $1.score }

        let headline: String
        if isCanceled {
            headline = L.t("Game Canceled", lang)
        } else if isSolo {
            headline = L.t("Board Cleared!", lang)
        } else if game.result?.isTie == true {
            headline = L.t("It's a Tie!", lang)
        } else if isWinner {
            headline = L.t("You Won!", lang)
        } else {
            let winner = game.players.first { $0.participantId == game.result?.winnerParticipantIds.first }
            headline = "\(winner?.nickname ?? "?") \(L.t("Won!", lang))"
        }

        let entries = sortedPlayers.map {
            GKPodiumEntry(
                id: $0.participantId, nickname: $0.nickname, avatarValue: $0.avatarValue,
                valueText: "\($0.score) \(L.t($0.score == 1 ? "pair" : "pairs", lang))",
                isMe: $0.participantId == viewModel.hostId
            )
        }

        return ZStack {
            GKCelebrationBackground(room: viewModel.room, celebrate: !isCanceled)

            VStack(spacing: 14) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        OutlinedText(headline.uppercased(), size: 34, fill: isCanceled ? .white : EC.yellow)
                            .rotationEffect(.degrees(-4))
                            .multilineTextAlignment(.center)
                            .stampIn()
                            .padding(.top, 24)
                            .accessibilityAddTraits(.isHeader)

                        GKPodium(entries: Array(entries.prefix(3)), lang: lang)
                            .padding(.top, 30)

                        VStack(spacing: 10) {
                            ForEach(Array(entries.dropFirst(3).enumerated()), id: \.element.id) { index, entry in
                                GKRankRow(rank: index + 4, entry: entry, lang: lang)
                            }
                            ForEach(sortedPlayers.filter { $0.participantId == viewModel.hostId }) { me in
                                GKFlowLayout(spacing: 6, lineSpacing: 6) {
                                    ECChip(text: "\(me.score)/\(game.totalPairs) \(L.t("pairs", lang))", fill: EC.mintSoft, icon: "o-cherry")
                                    ECChip(text: "\(me.turns ?? 0) \(L.t("turns", lang))", fill: EC.violetSoft)
                                }
                            }
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity)
                        .ecCard(radius: 22)
                        .padding(.horizontal, 16)
                        .padding(.top, -12)
                    }
                }

                HStack(spacing: 10) {
                    Button(L.t("Back to Chat", lang)) { onDismiss() }
                        .buttonStyle(.chunky(EC.blue))
                    Button(L.t("Again!", lang)) {
                        Haptics.thump()
                        Task { await viewModel.playAgainEmojiMatch() }
                    }
                    .buttonStyle(.chunky(EC.pink))
                    .gkWiggle(angle: 1.2, duration: 0.4)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 10)
            }
        }
    }
}

// MARK: - Flip Card View (separate struct for proper state tracking)

private struct FlipCardView: View {
    let card: EmojiMatchCard
    let canFlip: Bool
    let onFlip: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // Local rotation state drives the animation independently from server data
    @State private var showFace = false
    @State private var gone = false
    @State private var matchPop = false
    // The face this card last showed. The server sends a face-down card without its face, in the same
    // answer that turns it back, so the front draws this until the turn back has hidden it
    @State private var lastFace: EmojiMatchContent?

    /// What the front draws: the card's own face, or, once the server has taken it back, the one it showed
    private var face: EmojiMatchContent {
        card.content.value.isEmpty ? lastFace ?? card.content : card.content
    }

    var body: some View {
        let targetShowFace = card.isRevealed || card.isMatched

        Button {
            if canFlip { onFlip() }
        } label: {
            ZStack {
                if gone {
                    goneCard
                } else {
                    cardBack
                        .opacity(showFace ? 0 : 1)
                        .rotation3DEffect(.degrees(showFace ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.6)

                    cardFront
                        .opacity(showFace ? 1 : 0)
                        .rotation3DEffect(.degrees(showFace ? 0 : -180), axis: (x: 0, y: 1, z: 0), perspective: 0.6)
                }
            }
            .scaleEffect(matchPop ? 1.12 : 1)
            .rotationEffect(.degrees(matchPop ? -4 : 0))
        }
        .buttonStyle(.pressable)
        .disabled(!canFlip)
        .onAppear {
            // Set initial state without animation
            showFace = targetShowFace
            gone = card.isMatched
        }
        .onChange(of: targetShowFace) { newValue in
            withAnimation(reduceMotion ? .easeInOut(duration: 0.2) : .spring(response: 0.45, dampingFraction: 0.65)) {
                showFace = newValue
            }
        }
        .task(id: card.content) {
            // Keep a face while the card has one. When it comes without (turned back), wait out the
            // turn, which has the front at no opacity well inside a second, then drop the kept face.
            // A card that is turned up again first cancels this: its face comes with it.
            if !card.content.value.isEmpty {
                lastFace = card.content
            } else if lastFace != nil {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                if !Task.isCancelled { lastFace = nil }
            }
        }
        .onChange(of: card.isMatched) { matched in
            guard matched else {
                gone = false
                return
            }
            withAnimation(.spring(response: 0.3, dampingFraction: 0.4)) { matchPop = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.6)) { matchPop = false }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                withAnimation(.easeInOut(duration: 0.35)) { gone = true }
            }
        }
        .accessibilityLabel(showFace ? (card.content.label ?? card.content.value) : "?")
        .accessibilityAddTraits(card.isMatched ? .isSelected : [])
    }

    private var shape: RoundedRectangle { RoundedRectangle(cornerRadius: 16, style: .continuous) }

    private var cardBack: some View {
        ZStack {
            shape.fill(EC.violet)
            GKDotPattern(color: .white.opacity(0.45), spacing: 13, radius: 2.4)
                .clipShape(shape)
            OutlinedText("?", size: 26, fill: .white, outline: 2)
        }
        .overlay(shape.strokeBorder(EC.ink, lineWidth: 3))
        .background(shape.fill(EC.ink).offset(y: 4))
    }

    private var cardFront: some View {
        GeometryReader { geo in
            VStack(spacing: 2) {
                EmojiArt(emoji: face.value, size: min(geo.size.width * 0.62, geo.size.height * 0.5))
                if let label = face.label {
                    Text(label)
                        .font(.round(11, .black))
                        .foregroundStyle(card.isMatched ? EC.ink : EC.pink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                        .padding(.horizontal, 4)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .background(shape.fill(card.isMatched ? EC.mintSoft : .white))
        .overlay(shape.strokeBorder(EC.ink, lineWidth: 3))
        .overlay {
            if card.isMatched {
                shape.strokeBorder(EC.mint, lineWidth: 4).padding(-5)
            }
        }
        .background(shape.fill(EC.ink).offset(y: 4))
    }

    private var goneCard: some View {
        ZStack {
            shape.strokeBorder(EC.lineSoft, style: StrokeStyle(lineWidth: 3, dash: [7, 6]))
            EmojiArt(emoji: card.content.value, size: 30)
                .opacity(0.22)
                .grayscale(0.6)
        }
        .transition(.scale(scale: 0.8).combined(with: .opacity))
    }
}
