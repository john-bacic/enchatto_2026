import SwiftUI
import AudioToolbox

struct EmojiBingoGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void

    @State private var showCompleted = false
    @State private var lastCalledCount = 0

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.06, green: 0.73, blue: 0.51).opacity(0.9), Color(red: 0.04, green: 0.55, blue: 0.38).opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

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
                    } else {
                        gameView(game: game)
                    }
                case .canceled:
                    EmptyView()
                }
            }
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
        }
        .onChange(of: viewModel.activeEmojiBingoGame?.calledEmojis.count ?? 0) { newCount in
            if newCount > lastCalledCount && lastCalledCount > 0 {
                // Play a short "pop" sound when a new emoji is called
                AudioServicesPlaySystemSound(1104)
            }
            lastCalledCount = newCount
        }
    }

    // MARK: - Lobby

    private func lobbyView(game: EmojiBingoGame) -> some View {
        let amHost = game.hostParticipantId == viewModel.hostId
        let patternLabel: String = {
            switch game.winPattern {
            case "line": return "Line"
            case "four_corners": return "Four Corners"
            case "blackout": return "Blackout"
            default: return game.winPattern
            }
        }()

        return VStack(spacing: 16) {
            Spacer()

            Text("\u{1F3B0}")
                .font(.system(size: 48))
            Text(L.t("Emoji Bingo", lang))
                .font(.title2.bold())
                .foregroundStyle(.white)
            Text(L.t("Match emojis on your card as they are called!", lang))
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // Win pattern badge
            HStack(spacing: 6) {
                Text("\u{1F3AF}")
                    .font(.caption)
                Text(L.t("Win Pattern:", lang))
                    .font(.caption.bold())
                    .foregroundStyle(.white.opacity(0.7))
                Text(L.t(patternLabel, lang))
                    .font(.caption.bold())
                    .foregroundStyle(.yellow)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(.white.opacity(0.1))
            .cornerRadius(8)

            // Player list
            VStack(alignment: .leading, spacing: 8) {
                Text("\(L.t("Players", lang)) (\(game.players.count))")
                    .font(.caption.bold())
                    .foregroundStyle(.white.opacity(0.7))

                ForEach(game.players) { player in
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.white.opacity(0.2))
                            .frame(width: 28, height: 28)
                            .overlay(Text(avatarEmoji(player.avatarValue)).font(.caption))
                        Text(player.nickname)
                            .foregroundStyle(.white)
                            .font(.subheadline)
                        if player.participantId == game.hostParticipantId {
                            Text(L.t("HOST", lang))
                                .font(.caption2.bold())
                                .foregroundStyle(.yellow)
                        }
                        Spacer()
                    }
                }
            }
            .padding()
            .background(.white.opacity(0.1))
            .cornerRadius(12)
            .padding(.horizontal)

            Spacer()

            VStack(spacing: 10) {
                if amHost {
                    Button(L.t("Start Game", lang)) {
                        Task { await viewModel.startEmojiBingo() }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(Color(red: 0.06, green: 0.73, blue: 0.51))

                    Button(L.t("Cancel", lang)) {
                        Task { await viewModel.cancelEmojiBingo() }
                    }
                    .buttonStyle(.bordered)
                    .tint(.white.opacity(0.7))
                }
            }
            .padding(.bottom, 30)
        }
    }

    // MARK: - Game View (active / won)

    private func gameView(game: EmojiBingoGame, showWonBanner: Bool = false) -> some View {
        let hostPlayer = game.players.first { $0.participantId == viewModel.hostId }
        let markedSet = Set(hostPlayer?.markedCells ?? [])
        let calledSet = Set(game.calledEmojis)
        let canClaimBingo = hostPlayer != nil && hasWinningPattern(hostPlayer!.markedCells, game.winPattern)

        return VStack(spacing: 0) {
            // Header
            HStack {
                Text("\u{1F3B0}")
                Text(L.t("Emoji Bingo", lang))
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                Text("\(game.calledEmojis.count)/\(game.drawDeck.count)")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.7))

                Button {
                    Task { await viewModel.cancelEmojiBingo() }
                } label: {
                    Text(L.t("End Game", lang))
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.red.opacity(0.7))
                        .clipShape(Capsule())
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 10)

            // Won banner
            if showWonBanner {
                HStack {
                    Text("\u{1F389}")
                    Text(L.t("BINGO! Verifying winners...", lang))
                        .font(.subheadline.bold())
                        .foregroundStyle(.yellow)
                    Text("\u{1F389}")
                }
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(Color.yellow.opacity(0.2))
            }

            // Turn indicator + Roll button
            if game.status == .active {
                let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
                let currentPlayer = game.players.first { $0.participantId == game.currentTurnParticipantId }

                HStack(spacing: 12) {
                    if isMyTurn {
                        Button {
                            Task { await viewModel.rollEmojiBingo() }
                        } label: {
                            HStack(spacing: 6) {
                                Text("\u{1F3B2}") // 🎲
                                    .font(.title2)
                                Text(L.t("Roll!", lang))
                                    .font(.headline.bold())
                            }
                            .foregroundStyle(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(
                                LinearGradient(
                                    colors: [Color(red: 0.06, green: 0.73, blue: 0.51), Color(red: 0.04, green: 0.55, blue: 0.38)],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .cornerRadius(14)
                        }
                    } else if let player = currentPlayer {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(Color.white.opacity(0.2))
                                .frame(width: 24, height: 24)
                                .overlay(Text(avatarEmoji(player.avatarValue)).font(.caption2))
                            Text("\(player.nickname)")
                                .foregroundStyle(.white)
                                .font(.subheadline)
                            Text(L.t("is rolling...", lang))
                                .foregroundStyle(.white.opacity(0.6))
                                .font(.subheadline)
                        }
                    }

                    if let started = game.turnStartedAt, let timeout = game.turnTimeoutMs {
                        let remaining = max(0, Int(ceil((started + Double(timeout) - Date().timeIntervalSince1970 * 1000) / 1000)))
                        Text("\(remaining)s")
                            .font(.caption.bold())
                            .foregroundStyle(remaining <= 3 ? .red : .white.opacity(0.6))
                    }
                }
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(game.currentTurnParticipantId == viewModel.hostId ? Color.white.opacity(0.1) : Color.clear)
            }

            // Called emojis strip — latest big, older ones trail smaller (like web)
            HStack(spacing: 8) {
                if let latest = game.calledEmojis.last {
                    Text(latest)
                        .font(.system(size: 48))
                        .scaleEffect(1.0)
                        .animation(.spring(response: 0.3, dampingFraction: 0.5), value: game.calledEmojis.count)
                        .id("latest-\(game.calledEmojis.count)")
                }
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 4) {
                        ForEach(Array(game.calledEmojis.dropLast().reversed().prefix(8).enumerated()), id: \.offset) { index, emoji in
                            Text(emoji)
                                .font(.system(size: 24))
                                .opacity(max(0.3, 1.0 - Double(index) * 0.1))
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            // Player status bar
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(game.players) { player in
                        HStack(spacing: 4) {
                            Circle()
                                .fill(Color.white.opacity(0.15))
                                .frame(width: 20, height: 20)
                                .overlay(Text(avatarEmoji(player.avatarValue)).font(.system(size: 9)))
                            if player.placement > 0 {
                                Text(placementEmoji(player.placement))
                                    .font(.system(size: 10))
                            }
                            Text("\(player.markedCells.count)")
                                .font(.caption.bold())
                                .foregroundStyle(.white)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 6)
            }

            // 5x5 Bingo card
            if let hostPlayer = hostPlayer {
                Spacer()
                let cols = Array(repeating: GridItem(.flexible(), spacing: 5), count: 5)
                LazyVGrid(columns: cols, spacing: 5) {
                    ForEach(0..<hostPlayer.card.count, id: \.self) { index in
                        let emoji = hostPlayer.card[index]
                        let isMarked = markedSet.contains(index)
                        let isCalled = calledSet.contains(emoji)
                        let isFreeSpace = emoji == "\u{2B50}" // star emoji

                        Button {
                            if !isMarked && (isCalled || isFreeSpace) {
                                Task { await viewModel.markEmojiBingoCell(cellIndex: index) }
                            }
                        } label: {
                            ZStack {
                                if isMarked {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.green)
                                } else if isFreeSpace {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.yellow.opacity(0.8))
                                } else if isCalled {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color(red: 1.0, green: 1.0, blue: 0.85))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.yellow, lineWidth: 3)
                                        )
                                } else {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.white)
                                }

                                VStack(spacing: 1) {
                                    Text(emoji)
                                        .font(.system(size: 30))
                                    if isMarked && !isFreeSpace {
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.system(size: 12))
                                            .foregroundStyle(.white)
                                    }
                                }
                            }
                            .aspectRatio(1, contentMode: .fit)
                        }
                        .disabled(isMarked || (!isCalled && !isFreeSpace))
                    }
                }
                .padding(.horizontal, 10)
                Spacer()
            } else {
                Spacer()
                Text(L.t("Waiting for your card...", lang))
                    .foregroundStyle(.white.opacity(0.6))
                Spacer()
            }

            // BINGO button
            if hostPlayer != nil {
                Button {
                    Task { await viewModel.claimEmojiBingo() }
                } label: {
                    Text("BINGO!")
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(canClaimBingo ? Color.yellow.opacity(0.8) : Color.white.opacity(0.15))
                        .cornerRadius(16)
                }
                .disabled(!canClaimBingo)
                .padding(.horizontal)
                .padding(.bottom, 16)
            }
        }
    }

    // MARK: - Completed

    private func completedView(game: EmojiBingoGame) -> some View {
        let winners = game.players.filter { $0.placement > 0 }.sorted { $0.placement < $1.placement }
        let amWinner = winners.contains { $0.participantId == viewModel.hostId }

        return VStack(spacing: 16) {
            Spacer()

            Text(amWinner ? "\u{1F3C6}" : "\u{1F389}")
                .font(.system(size: 48))
            Text(amWinner ? L.t("You Won!", lang) : (winners.first.map { "\($0.nickname) \(L.t("Won!", lang))" } ?? L.t("Game Over", lang)))
                .font(.title2.bold())
                .foregroundStyle(.white)

            // Winner podium
            VStack(spacing: 8) {
                ForEach(winners) { player in
                    let isMe = player.participantId == viewModel.hostId
                    HStack(spacing: 8) {
                        Text(placementEmoji(player.placement))
                            .font(.caption)
                            .frame(width: 24)
                        Circle()
                            .fill(Color.white.opacity(0.2))
                            .frame(width: 24, height: 24)
                            .overlay(Text(avatarEmoji(player.avatarValue)).font(.caption2))
                        Text(player.nickname)
                            .foregroundStyle(.white)
                            .fontWeight(isMe ? .bold : .regular)
                        if isMe {
                            Text("(\(L.t("you", lang)))")
                                .font(.caption)
                                .foregroundStyle(.yellow)
                        }
                        Spacer()
                    }
                }
            }
            .padding()
            .background(.white.opacity(0.1))
            .cornerRadius(12)
            .padding(.horizontal)

            // Stats
            VStack(spacing: 4) {
                Text("\(game.calledEmojis.count) \(L.t("emojis called", lang))")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.6))
                Text("\(game.players.count) \(L.t("players", lang))")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.6))
            }

            Spacer()

            VStack(spacing: 10) {
                Button(L.t("Play Again", lang)) {
                    Task { await viewModel.playAgainEmojiBingo() }
                }
                .buttonStyle(.borderedProminent)
                .tint(.white)
                .foregroundStyle(Color(red: 0.06, green: 0.73, blue: 0.51))

                Button(L.t("Exit", lang)) {
                    onDismiss()
                }
                .buttonStyle(.bordered)
                .tint(.white.opacity(0.7))
            }
            .padding(.bottom, 30)
        }
    }

    // MARK: - Helpers

    private func avatarEmoji(_ avatarValue: String) -> String {
        let avatars: [(id: String, emoji: String)] = [
            ("bear", "\u{1F43B}"), ("cat", "\u{1F431}"), ("dog", "\u{1F436}"), ("fox", "\u{1F98A}"),
            ("frog", "\u{1F438}"), ("koala", "\u{1F428}"), ("lion", "\u{1F981}"), ("monkey", "\u{1F435}"),
            ("mouse", "\u{1F42D}"), ("octopus", "\u{1F419}"), ("owl", "\u{1F989}"), ("panda", "\u{1F43C}"),
            ("penguin", "\u{1F427}"), ("rabbit", "\u{1F430}"), ("tiger", "\u{1F42F}"), ("whale", "\u{1F433}"),
        ]
        return avatars.first { $0.id == avatarValue }?.emoji ?? "\u{1F464}"
    }

    private func placementEmoji(_ placement: Int) -> String {
        switch placement {
        case 1: return "\u{1F3C6}"
        case 2: return "\u{1F948}"
        case 3: return "\u{1F949}"
        default: return "\(placement)."
        }
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
