import AudioToolbox
import SwiftUI

struct EmojiBingoGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void
    var onMinimize: (() -> Void)? = nil

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var showCompleted = false
    @State private var lastCalledCount = 0
    @State private var confettiTrigger = 0
    @State private var cutIn: BingoCutIn?

    private struct BingoCutIn: Equatable {
        let id = UUID()
        let text: String
        let fill: Color
        let icon: String
    }

    private var myPlacement: Int {
        viewModel.activeEmojiBingoGame?.players.first { $0.participantId == viewModel.hostId }?.placement ?? 0
    }

    var body: some View {
        ZStack {
            RoomBackground(room: viewModel.room).ignoresSafeArea()

            if let game = viewModel.activeEmojiBingoGame {
                switch game.status {
                case .lobby:
                    lobbyView(game: game)
                case .active:
                    gameView(game: game)
                case .won:
                    gameView(game: game, showWonBanner: true)
                case .completed:
                    if showCompleted {
                        completedView(game: game)
                            .transition(.opacity)
                    } else {
                        gameView(game: game)
                    }
                case .canceled:
                    EmptyView()
                }
            }

            if let cutIn {
                CutInBanner(text: cutIn.text, fill: cutIn.fill, icon: cutIn.icon)
                    .id(cutIn.id)
                    .transition(.opacity)
            }

            ConfettiBurst(trigger: confettiTrigger, count: reduceMotion ? 24 : 60)
                .ignoresSafeArea()
        }
        .onChange(of: viewModel.activeEmojiBingoGame?.status) { newStatus in
            if newStatus == .completed {
                showCompleted = false
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    withAnimation { showCompleted = true }
                }
            } else {
                showCompleted = false
            }
            if newStatus == .won {
                celebrate(text: L.t("BINGO!", lang), fill: EC.pink, icon: "g-clover", bursts: 1)
            }
        }
        .onChange(of: myPlacement) { placement in
            guard placement > 0 else { return }
            Haptics.success()
            celebrate(
                text: placement == 1 ? L.t("You Won!", lang) : "BINGO! #\(placement)",
                fill: placement == 1 ? EC.yellow : EC.mint,
                icon: "g-crown",
                bursts: placement == 1 ? 3 : 1
            )
        }
        .onChange(of: viewModel.activeEmojiBingoGame?.calledEmojis.count ?? 0) { newCount in
            if newCount > lastCalledCount && lastCalledCount > 0 {
                // Play a short "pop" sound when a new emoji is called
                AudioServicesPlaySystemSound(1104)
                Haptics.tap()
            }
            lastCalledCount = newCount
        }
    }

    private func celebrate(text: String, fill: Color, icon: String, bursts: Int) {
        let banner = BingoCutIn(text: text, fill: fill, icon: icon)
        withAnimation { cutIn = banner }
        for i in 0..<bursts {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.45) { confettiTrigger += 1 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
            if cutIn == banner { withAnimation { cutIn = nil } }
        }
    }

    private func header(game: EmojiBingoGame) -> some View {
        GKHeader(icon: "g-clover", title: L.t("Emoji Bingo", lang), lang: lang, onMinimize: onMinimize) {
            if game.status == .active || game.status == .won {
                Button(L.t("End Game", lang)) {
                    Task { await viewModel.cancelEmojiBingo() }
                }
                .buttonStyle(.chunky(EC.red, size: .mini, fullWidth: false))
            }
        }
    }

    private func patternLabel(_ pattern: String) -> String {
        switch pattern {
        case "line": return L.t("Line", lang)
        case "four_corners": return L.t("Four Corners", lang)
        case "blackout": return L.t("Blackout", lang)
        default: return pattern
        }
    }

    // MARK: - Lobby

    private func lobbyView(game: EmojiBingoGame) -> some View {
        let amHost = game.hostParticipantId == viewModel.hostId
        let players = game.players.map {
            GKPlayer(
                id: $0.participantId, nickname: $0.nickname, avatarValue: $0.avatarValue,
                isHost: $0.participantId == game.hostParticipantId, isMe: $0.participantId == viewModel.hostId
            )
        }

        return VStack(spacing: 0) {
            // In front of the lobby's rays, which reach up behind the header
            header(game: game).zIndex(1)
            GKLobby(
                icon: "g-clover",
                title: L.t("Emoji Bingo", lang),
                tagline: L.t("Match emojis on your card as they are called!", lang),
                accent: EC.mint,
                playersLabel: "\(L.t("Players", lang)) (\(game.players.count))",
                players: players,
                lang: lang
            ) {
                ECChip(text: "\(L.t("Win Pattern:", lang)) \(patternLabel(game.winPattern))", fill: EC.yellow, icon: "g-crown")
            } footer: {
                if amHost {
                    Button(L.t("Start Game", lang)) {
                        Haptics.thump()
                        Task { await viewModel.startEmojiBingo() }
                    }
                    .buttonStyle(.chunky(EC.mint))
                    .gkWiggle(angle: 0.8, duration: 0.45)

                    Button(L.t("Cancel", lang)) {
                        Task { await viewModel.cancelEmojiBingo() }
                    }
                    .buttonStyle(.chunky(.white, size: .small))
                } else {
                    Text(L.t("Waiting for host...", lang))
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink.opacity(0.6))
                }
            }
        }
    }

    // MARK: - Game View (active / won)

    private func gameView(game: EmojiBingoGame, showWonBanner: Bool = false) -> some View {
        let hostPlayer = game.players.first { $0.participantId == viewModel.hostId }
        let marked = hostPlayer?.markedCells ?? []
        let canClaimBingo = hostPlayer.map { hasWinningPattern($0.markedCells, game.winPattern) } ?? false
        let oneAway = !canClaimBingo && (hostPlayer?.placement ?? 0) == 0 && isOneAway(marked, game.winPattern)

        return VStack(spacing: 0) {
            header(game: game)

            VStack(spacing: 10) {
                    calledHero(game: game)

                    if showWonBanner {
                        let placed = game.players.filter { $0.placement > 0 }.count
                        HStack(spacing: 8) {
                            PackIcon("g-crown", size: 28)
                            Text("BINGO! \(placed)/\(game.players.count) \(L.t("finished", lang))")
                                .font(.chunky(15))
                                .foregroundStyle(EC.ink)
                        }
                        .padding(.vertical, 8)
                        .frame(maxWidth: .infinity)
                        .ecCard(fill: EC.yellow, radius: 16, border: 3, shadow: 4)
                        .gkWiggle(angle: 1)
                    }

                    if game.status == .active {
                        turnStrip(game: game)
                    }

                    playersStrip(game: game)

                    if let hostPlayer {
                        GeometryReader { geo in
                            bingoCard(game: game, player: hostPlayer, fitting: geo.size)
                                .frame(width: geo.size.width, height: geo.size.height, alignment: .top)
                        }
                    } else {
                        Spacer()
                        Text(L.t("Waiting for your card...", lang))
                            .font(.round(15, .black))
                            .foregroundStyle(EC.ink.opacity(0.6))
                        Spacer()
                    }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 4)

            if hostPlayer != nil {
                bottomButtons(game: game, canClaimBingo: canClaimBingo, oneAway: oneAway)
            }
        }
    }

    private func calledHero(game: EmojiBingoGame) -> some View {
        let latest = game.calledEmojis.last
        let history = Array(game.calledEmojis.dropLast().reversed().prefix(6))
        let name = latest.flatMap { BingoEmojiNames.name(for: $0) }

        return HStack(spacing: 14) {
            ZStack {
                if !reduceMotion && latest != nil {
                    RaysView(color: EC.yellow.opacity(0.6), rays: 14)
                        .frame(width: 180, height: 180)
                }
                if let latest {
                    BingoBall(emoji: latest)
                        .id(game.calledEmojis.count)
                } else {
                    Circle()
                        .strokeBorder(EC.lineSoft, style: StrokeStyle(lineWidth: 3, dash: [6, 5]))
                        .frame(width: 84, height: 84)
                        .overlay(PackIcon("g-question", size: 44).opacity(0.5))
                }
            }
            .frame(width: 88, height: 92)

            VStack(alignment: .leading, spacing: 4) {
                if let name {
                    (Text(lang.hasPrefix("ja") ? name.ja : name.en) + Text("!  ") + Text(lang.hasPrefix("ja") ? name.en : name.ja).font(.round(15, .black)).foregroundColor(EC.pink))
                        .font(.chunky(20))
                        .foregroundStyle(EC.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                        .id("name-\(game.calledEmojis.count)")
                        .transition(.scale.combined(with: .opacity))
                } else if latest == nil {
                    Text(L.t("Roll!", lang))
                        .font(.chunky(20))
                        .foregroundStyle(EC.ink)
                }
                Text("\(game.calledEmojis.count)/\(game.drawDeck.count) \(L.t("called", lang)) · \(patternLabel(game.winPattern))")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.ink.opacity(0.6))
                if !history.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(Array(history.enumerated()), id: \.offset) { index, emoji in
                            EmojiArt(emoji: emoji, size: 20)
                                .padding(3)
                                .background(Circle().fill(.white))
                                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                                .opacity(max(0.45, 1 - Double(index) * 0.1))
                        }
                    }
                    .padding(.top, 2)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .ecCard(radius: 24, border: 3, shadow: 6)
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: game.calledEmojis.count)
        .accessibilityElement(children: .combine)
    }

    @ViewBuilder
    private func turnStrip(game: EmojiBingoGame) -> some View {
        let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
        let currentPlayer = game.players.first { $0.participantId == game.currentTurnParticipantId }

        HStack(spacing: 10) {
            if let player = currentPlayer {
                AvatarDisc(avatarId: player.avatarValue, size: 34, ring: isMyTurn ? EC.pink : nil)
            }
            if isMyTurn {
                Text(L.t("Your turn to roll!", lang))
                    .font(.chunky(16))
                    .foregroundStyle(EC.ink)
            } else if let player = currentPlayer {
                (Text(player.nickname).font(.chunky(15)) + Text(" \(L.t("is rolling...", lang))").font(.round(14, .bold)))
                    .foregroundStyle(EC.ink)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            if let started = game.turnStartedAt, let timeout = game.turnTimeoutMs {
                GKTimerRing(startedAtMs: started, totalMs: Double(timeout), hurryBelow: 3, size: 40)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .ecCard(fill: isMyTurn ? EC.yellow : .white, radius: 18, border: 3, shadow: 4)
        .rotationEffect(.degrees(isMyTurn ? -1 : 0))
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: isMyTurn)
    }

    private func playersStrip(game: EmojiBingoGame) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(game.players) { player in
                    let isMe = player.participantId == viewModel.hostId
                    HStack(spacing: 5) {
                        AvatarDisc(avatarId: player.avatarValue, size: 26)
                        if player.placement == 1 {
                            PackIcon("g-crown", size: 18)
                        } else if player.placement > 0 {
                            Text("#\(player.placement)").font(.chunky(11)).foregroundStyle(EC.ink)
                        }
                        Text("\(player.markedCells.count)")
                            .font(.chunky(14))
                            .foregroundStyle(EC.ink)
                            .monospacedDigit()
                    }
                    .padding(.leading, 3)
                    .padding(.trailing, 10)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(player.placement > 0 ? EC.yellowSoft : (isMe ? EC.pinkSoft : .white)))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(player.nickname) \(player.markedCells.count)")
                }
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 2)
        }
    }

    private func bingoCard(game: EmojiBingoGame, player: EmojiBingoPlayer, fitting size: CGSize) -> some View {
        let markedSet = Set(player.markedCells)
        let calledSet = Set(game.calledEmojis)
        let gap: CGFloat = 6
        let side = max(36, min((size.width - 20 - gap * 4) / 5, (size.height - 20 - 30 - 8 - gap * 4) / 5))
        let cols = Array(repeating: GridItem(.fixed(side), spacing: gap), count: 5)

        return VStack(spacing: 6) {
            HStack(spacing: gap) {
                ForEach(Array("BINGO"), id: \.self) { letter in
                    OutlinedText(String(letter), size: 22, fill: .white, outline: 2)
                        .frame(width: side)
                }
            }
            .accessibilityHidden(true)

            LazyVGrid(columns: cols, spacing: gap) {
                ForEach(0..<player.card.count, id: \.self) { index in
                    let emoji = player.card[index]
                    let isFreeSpace = emoji == "\u{2B50}"
                    let isMarked = markedSet.contains(index)
                    let isCalled = calledSet.contains(emoji)
                    BingoCell(
                        emoji: emoji,
                        isMarked: isMarked,
                        isHot: !isMarked && (isCalled || isFreeSpace),
                        isFree: isFreeSpace,
                        isJustCalled: emoji == game.calledEmojis.last
                    ) {
                        if !isMarked && (isCalled || isFreeSpace) {
                            Haptics.tap()
                            Task { await viewModel.markEmojiBingoCell(cellIndex: index) }
                        }
                    }
                    .disabled(isMarked || (!isCalled && !isFreeSpace))
                }
            }
        }
        .padding(10)
        .ecCard(fill: EC.blue, radius: 22, border: 3, shadow: 7)
    }

    private func bottomButtons(game: EmojiBingoGame, canClaimBingo: Bool, oneAway: Bool) -> some View {
        let canRoll = game.status == .active && game.currentTurnParticipantId == viewModel.hostId && !canClaimBingo

        return HStack(spacing: 10) {
            Button {
                Haptics.thump()
                Task { await viewModel.rollEmojiBingo() }
            } label: {
                HStack(spacing: 6) {
                    PackIcon("g-arrows", size: 24)
                    Text(L.t("Roll!", lang))
                }
            }
            .buttonStyle(.chunky(EC.blue))
            .frame(width: 136)
            .disabled(!canRoll)
            .gkWiggle(canRoll, angle: 1.5)

            Button {
                Haptics.success()
                Task { await viewModel.claimEmojiBingo() }
            } label: {
                Text("BINGO!").font(.chunky(24))
            }
            .buttonStyle(.chunky(EC.pink))
            .disabled(!canClaimBingo)
            .gkWiggle(canClaimBingo, angle: 3, duration: 0.18)
            .scaleEffect(canClaimBingo ? 1.04 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.5), value: canClaimBingo)
        }
        .padding(.horizontal, 16)
        .padding(.top, 6)
        .padding(.bottom, 10)
        .overlay(alignment: .topTrailing) {
            if oneAway {
                Text(L.t("1 AWAY!", lang))
                    .font(.chunky(15))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(RoundedRectangle(cornerRadius: 12).fill(EC.red))
                    .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(EC.ink, lineWidth: 3))
                    .background(RoundedRectangle(cornerRadius: 12).fill(EC.ink).offset(y: 4))
                    .rotationEffect(.degrees(8))
                    .gkWiggle(angle: 4, duration: 0.25)
                    .offset(x: -14, y: -26)
                    .popIn()
                    .allowsHitTesting(false)
            }
        }
    }

    // MARK: - Completed

    private func completedView(game: EmojiBingoGame) -> some View {
        let winners = game.players.filter { $0.placement > 0 }.sorted { $0.placement < $1.placement }
        let others = game.players.filter { $0.placement == 0 }.sorted { $0.markedCells.count > $1.markedCells.count }
        let ranked = winners + others
        let amWinner = winners.first?.participantId == viewModel.hostId
        let entries = ranked.map {
            GKPodiumEntry(
                id: $0.participantId, nickname: $0.nickname, avatarValue: $0.avatarValue,
                valueText: $0.placement > 0 ? "BINGO!" : "\($0.markedCells.count)/25",
                isMe: $0.participantId == viewModel.hostId
            )
        }
        let headline = amWinner
            ? L.t("You Won!", lang)
            : (winners.first.map { "\($0.nickname) \(L.t("Won!", lang))" } ?? L.t("Game Over", lang))

        return ZStack {
            GKCelebrationBackground(room: viewModel.room, celebrate: !winners.isEmpty)

            VStack(spacing: 14) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        OutlinedText(headline.uppercased(), size: 34, fill: EC.yellow)
                            .rotationEffect(.degrees(-4))
                            .multilineTextAlignment(.center)
                            .stampIn()
                            .padding(.top, 24)
                            .accessibilityAddTraits(.isHeader)

                        GKPodium(entries: Array(entries.prefix(3)), lang: lang)
                            .padding(.top, 30)

                        VStack(spacing: 10) {
                            if entries.count > 3 {
                                ForEach(Array(entries.dropFirst(3).enumerated()), id: \.element.id) { index, entry in
                                    GKRankRow(rank: index + 4, entry: entry, lang: lang)
                                }
                            }
                            GKFlowLayout(spacing: 6, lineSpacing: 6) {
                                ECChip(text: "\(game.calledEmojis.count) \(L.t("emojis called", lang))", fill: EC.mintSoft, icon: "g-clover")
                                ECChip(text: "\(game.players.count) \(L.t("players", lang))", fill: EC.blueSoft)
                                ECChip(text: patternLabel(game.winPattern), fill: EC.yellowSoft, icon: "g-crown")
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
                        Task { await viewModel.playAgainEmojiBingo() }
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

// MARK: - Ball

/// Yellow ball that rolls in from the left each time a new emoji is called
private struct BingoBall: View {
    let emoji: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var rolled = false

    var body: some View {
        EmojiArt(emoji: emoji, size: 56)
            .frame(width: 84, height: 84)
            .background(
                Circle().fill(RadialGradient(
                    colors: [.white, .white, EC.yellow, EC.yellow],
                    center: UnitPoint(x: 0.35, y: 0.3),
                    startRadius: 0,
                    endRadius: 60
                ))
            )
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3.5))
            .background(Circle().fill(EC.ink).offset(y: 5))
            .offset(x: rolled || reduceMotion ? 0 : -180)
            .rotationEffect(.degrees(rolled || reduceMotion ? 0 : -360))
            .scaleEffect(rolled ? 1 : 0.7)
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.6)) { rolled = true }
            }
            .accessibilityLabel(BingoEmojiNames.name(for: emoji)?.en ?? emoji)
    }
}

// MARK: - Cell

private struct BingoCell: View {
    let emoji: String
    let isMarked: Bool
    let isHot: Bool
    let isFree: Bool
    let isJustCalled: Bool
    let onTap: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var stamped = false

    var body: some View {
        Button(action: onTap) {
            GeometryReader { geo in
                let side = geo.size.width
                ZStack {
                    if isFree {
                        ChattoView(size: side * 0.62, bob: false)
                    } else {
                        EmojiArt(emoji: emoji, size: side * 0.76)
                    }
                    if isMarked {
                        Circle()
                            .fill(EC.pink.opacity(0.22))
                            .overlay(Circle().strokeBorder(EC.pink, lineWidth: 4))
                            .padding(4)
                            .scaleEffect(stamped ? 1 : 2.4)
                            .rotationEffect(.degrees(stamped ? -12 : -40))
                            .opacity(stamped ? 1 : 0)
                    }
                }
                .frame(width: side, height: side)
            }
            .aspectRatio(1, contentMode: .fit)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(fill))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
            .overlay {
                if isHot && isJustCalled && !isFree {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(EC.yellow, lineWidth: 3)
                        .padding(-3)
                }
            }
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(EC.ink).offset(y: 3))
            .nudge(on: isHot, active: isHot, angle: 6)
        }
        .buttonStyle(.pressable)
        .onAppear {
            stamped = isMarked
        }
        .onChange(of: isMarked) { marked in
            if marked {
                withAnimation(reduceMotion ? .easeOut(duration: 0.2) : .spring(response: 0.32, dampingFraction: 0.5)) { stamped = true }
            } else {
                stamped = false
            }
        }
        .accessibilityLabel(BingoEmojiNames.name(for: emoji)?.en ?? emoji)
        .accessibilityAddTraits(isMarked ? .isSelected : [])
    }

    private var fill: Color {
        if isFree { return EC.yellow }
        if isHot { return EC.mintSoft }
        return .white
    }
}

// MARK: - Win pattern checking

private let linePatterns: [[Int]] = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
]
private let fourCorners = [0, 4, 20, 24]

private func hasWinningPattern(_ markedCells: [Int], _ winPattern: String) -> Bool {
    let marked = Set(markedCells)
    switch winPattern {
    case "line": return linePatterns.contains { $0.allSatisfy { marked.contains($0) } }
    case "four_corners": return fourCorners.allSatisfy { marked.contains($0) }
    case "blackout": return marked.count >= 25
    default: return false
    }
}

private func isOneAway(_ markedCells: [Int], _ winPattern: String) -> Bool {
    let marked = Set(markedCells)
    switch winPattern {
    case "line": return linePatterns.contains { line in line.filter { !marked.contains($0) }.count == 1 }
    case "four_corners": return fourCorners.filter { !marked.contains($0) }.count == 1
    case "blackout": return marked.count == 24
    default: return false
    }
}
