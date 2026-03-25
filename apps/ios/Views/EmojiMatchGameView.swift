import SwiftUI

struct EmojiMatchGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void

    @State private var showCompleted = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.indigo.opacity(0.9), Color.purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            if let game = viewModel.activeEmojiMatchGame {
                switch game.status {
                case .lobby:
                    lobbyView(game: game)
                case .active, .resolving:
                    boardView(game: game)
                case .completed:
                    if showCompleted {
                        completedView(game: game)
                    } else {
                        boardView(game: game)
                    }
                case .canceled:
                    EmptyView()
                }
            }
        }
        .onChange(of: viewModel.activeEmojiMatchGame?.status) { newStatus in
            if newStatus == .completed {
                showCompleted = false
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    withAnimation { showCompleted = true }
                }
            } else {
                showCompleted = false
            }
        }
    }

    // MARK: - Lobby

    private func lobbyView(game: EmojiMatchGame) -> some View {
        let amJoined = game.players.contains { $0.participantId == viewModel.hostId }
        let amHost = game.hostParticipantId == viewModel.hostId

        return VStack(spacing: 16) {
            Spacer()

            Text("🃏")
                .font(.system(size: 48))
            Text(L.t("Emoji Match", lang))
                .font(.title2.bold())
                .foregroundStyle(.white)
            Text(L.t("Find matching emoji pairs! Take turns flipping cards.", lang))
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // Player list
            VStack(alignment: .leading, spacing: 8) {
                Text("\(L.t("Players", lang)) (\(game.players.count)/30)")
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
                if !amJoined {
                    Button(L.t("Join Game", lang)) {
                        Task { await viewModel.joinEmojiMatchLobby() }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(.indigo)
                }

                if amJoined && !amHost {
                    Button(L.t("Leave Lobby", lang)) {
                        Task { await viewModel.leaveEmojiMatchLobby() }
                    }
                    .buttonStyle(.bordered)
                    .tint(.white)
                }

                if amHost {
                    Button(L.t("Start Game", lang)) {
                        Task { await viewModel.startEmojiMatch() }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(.indigo)

                    Button(L.t("Cancel", lang)) {
                        Task { await viewModel.cancelEmojiMatch() }
                    }
                    .buttonStyle(.bordered)
                    .tint(.white.opacity(0.7))
                }
            }
            .padding(.bottom, 30)
        }
    }

    // MARK: - Board

    private func boardView(game: EmojiMatchGame) -> some View {
        let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
        let isResolving = game.status == .resolving
        let currentPlayer = game.players.first { $0.participantId == game.currentTurnParticipantId }
        let canFlip = isMyTurn && !isResolving && game.selectedCardIds.count < 2

        return VStack(spacing: 0) {
            // Header
            HStack {
                Text("🃏")
                Text(L.t("Emoji Match", lang))
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                Text("\(game.matchedPairCount)/\(game.totalPairs)")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.7))

                Button {
                    Task { await viewModel.cancelEmojiMatch() }
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

            // Turn indicator
            HStack(spacing: 8) {
                if let player = currentPlayer {
                    Circle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 24, height: 24)
                        .overlay(Text(avatarEmoji(player.avatarValue)).font(.caption2))
                    Text(isMyTurn ? L.t("Your turn!", lang) : "\(player.nickname)'s \(L.t("turn", lang))")
                        .font(.subheadline.bold())
                        .foregroundStyle(isMyTurn ? .yellow : .white)
                }
                Spacer()
                if let timeoutMs = game.turnTimeoutMs, let started = game.turnStartedAt, game.players.count > 1 {
                    let elapsed = Date().timeIntervalSince1970 * 1000 - started
                    let remaining = max(0, Double(timeoutMs) - elapsed)
                    Text("\(Int(ceil(remaining / 1000)))s")
                        .font(.caption.bold())
                        .foregroundStyle(remaining < 5000 ? .red : .white.opacity(0.7))
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 6)
            .background(isMyTurn ? Color.yellow.opacity(0.15) : Color.clear)

            // Score strip — sorted by score, with placement emojis
            let rankedPlayers = game.players.filter(\.isActive).sorted { $0.score > $1.score }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(Array(rankedPlayers.enumerated()), id: \.element.id) { index, player in
                        let isCurrent = player.participantId == game.currentTurnParticipantId
                        HStack(spacing: 4) {
                            Text(index == 0 ? "🏆" : index == 1 ? "🥈" : index == 2 ? "🥉" : "")
                                .font(.system(size: 10))
                            Circle()
                                .fill(Color.white.opacity(isCurrent ? 0.3 : 0.15))
                                .frame(width: 20, height: 20)
                                .overlay(Text(avatarEmoji(player.avatarValue)).font(.system(size: 9)))
                            Text("\(player.score)")
                                .font(.caption.bold())
                                .foregroundStyle(.white)
                        }
                        .opacity(isCurrent ? 1.0 : 0.6)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 6)
            }

            // Board grid — centered, no scrolling
            let cols = Array(repeating: GridItem(.flexible(), spacing: 6), count: game.boardCols)
            Spacer()
            LazyVGrid(columns: cols, spacing: 6) {
                ForEach(game.board) { card in
                    cardView(card: card, canFlip: canFlip && !card.isMatched && !card.isRevealed, game: game)
                }
            }
            .padding()
            Spacer()
        }
    }

    private func cardView(card: EmojiMatchCard, canFlip: Bool, game: EmojiMatchGame) -> some View {
        FlipCardView(
            card: card,
            canFlip: canFlip,
            onFlip: { Task { await viewModel.flipEmojiMatchCard(cardId: card.cardId) } }
        )
    }

    // MARK: - Completed

    private func completedView(game: EmojiMatchGame) -> some View {
        let isSolo = game.players.count == 1
        let isWinner = game.result?.winnerParticipantIds.contains(viewModel.hostId) ?? false
        let sortedPlayers = game.players.sorted { $0.score > $1.score }

        var headline: String
        var emoji: String
        if game.result?.endReason == "canceled" {
            headline = L.t("Game Canceled", lang)
            emoji = "😔"
        } else if isSolo {
            headline = L.t("Board Cleared!", lang)
            emoji = "🎉"
        } else if game.result?.isTie == true {
            headline = L.t("It's a Tie!", lang)
            emoji = "🤝"
        } else if isWinner {
            headline = L.t("You Won!", lang)
            emoji = "🏆"
        } else {
            let winner = game.players.first { $0.participantId == game.result?.winnerParticipantIds.first }
            headline = "\(winner?.nickname ?? "?") \(L.t("Won!", lang))"
            emoji = "🏆"
        }

        return VStack(spacing: 16) {
            Spacer()

            Text(emoji)
                .font(.system(size: 48))
            Text(headline)
                .font(.title2.bold())
                .foregroundStyle(.white)

            // Scores
            VStack(spacing: 8) {
                ForEach(Array(sortedPlayers.enumerated()), id: \.element.id) { index, player in
                    let isMe = player.participantId == viewModel.hostId
                    HStack(spacing: 8) {
                        Text(index == 0 ? "🏆" : index == 1 ? "🥈" : index == 2 ? "🥉" : "\(index + 1).")
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
                        Text("\(player.score) \(player.score == 1 ? L.t("pair", lang) : L.t("pairs", lang))")
                            .font(.subheadline.bold())
                            .foregroundStyle(.white)
                    }
                }
            }
            .padding()
            .background(.white.opacity(0.1))
            .cornerRadius(12)
            .padding(.horizontal)

            Spacer()

            VStack(spacing: 10) {
                Button(L.t("Play Again", lang)) {
                    Task { await viewModel.playAgainEmojiMatch() }
                }
                .buttonStyle(.borderedProminent)
                .tint(.white)
                .foregroundStyle(.indigo)

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
            ("bear", "🐻"), ("cat", "🐱"), ("dog", "🐶"), ("fox", "🦊"),
            ("frog", "🐸"), ("koala", "🐨"), ("lion", "🦁"), ("monkey", "🐵"),
            ("mouse", "🐭"), ("octopus", "🐙"), ("owl", "🦉"), ("panda", "🐼"),
            ("penguin", "🐧"), ("rabbit", "🐰"), ("tiger", "🐯"), ("whale", "🐳"),
        ]
        return avatars.first { $0.id == avatarValue }?.emoji ?? "👤"
    }
}

// MARK: - Flip Card View (separate struct for proper state tracking)

private struct FlipCardView: View {
    let card: EmojiMatchCard
    let canFlip: Bool
    let onFlip: () -> Void

    // Local rotation state drives the animation independently from server data
    @State private var showFace = false

    var body: some View {
        let targetShowFace = card.isRevealed || card.isMatched

        Button {
            if canFlip { onFlip() }
        } label: {
            ZStack {
                // Back face — visible when rotation < 90 degrees
                cardBack
                    .opacity(showFace ? 0 : 1)
                    .rotation3DEffect(.degrees(showFace ? 180 : 0), axis: (x: 0, y: 1, z: 0))

                // Front face — visible when rotation >= 90 degrees
                cardFront
                    .opacity(showFace ? 1 : 0)
                    .rotation3DEffect(.degrees(showFace ? 0 : -180), axis: (x: 0, y: 1, z: 0))
            }
            .aspectRatio(1, contentMode: .fit)
            .opacity(1.0)
        }
        .disabled(!canFlip)
        .onAppear {
            // Set initial state without animation
            showFace = targetShowFace
        }
        .onChange(of: targetShowFace) { newValue in
            withAnimation(.easeInOut(duration: 0.35)) {
                showFace = newValue
            }
        }
    }

    private var cardBack: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(
                LinearGradient(
                    colors: [.indigo, .purple],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .overlay(
                Text("?")
                    .font(.title2.bold())
                    .foregroundStyle(.white.opacity(0.3))
            )
    }

    private var cardFront: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(card.isMatched ? Color(red: 0.85, green: 0.98, blue: 0.88) : Color.white.opacity(0.95))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(card.isMatched ? Color.mint : Color.indigo, lineWidth: 2)
            )
            .overlay(
                ZStack {
                    Text(card.content.value)
                        .font(.system(size: 28))
                    if let label = card.content.label {
                        VStack {
                            Spacer()
                            Text(label)
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundStyle(.primary)
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                                .padding(.horizontal, 2)
                                .padding(.bottom, 10)
                        }
                    }
                }
            )
    }
}
