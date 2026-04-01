import SwiftUI
import PhotosUI

struct TruthOrDareGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void

    @State private var responseText = ""
    @State private var showPhotoPicker = false
    @State private var showDrawing = false
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var triggerAutoSubmit = false
    @State private var fullScreenImageUrl: String?
    @State private var starRating: Int = 0
    @State private var pencilWiggle = false

    var body: some View {
        let game = viewModel.activeTruthOrDareGame
        if let game, game.status == .active {
            activeGameView(game: game)
        } else if let game, game.status == .completed || game.status == .canceled {
            completedView(game: game)
        } else {
            ProgressView()
        }
    }

    // MARK: - Active Game View

    private func activeGameView(game: TruthOrDareGame) -> some View {
        let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
        let currentPlayer = game.playerInfo?.first(where: { $0.participantId == game.currentTurnParticipantId })
        let avatarEmoji = avatarEmojiFor(currentPlayer?.avatarValue ?? "cat")

        return ZStack {
            LinearGradient(
                colors: [Color(hex: "#1a1a2e"), Color(hex: "#16213e"), Color(hex: "#0f3460")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("🎲 \(L.t("Truth or Dare", lang))")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                    Button {
                        Task { await viewModel.endTruthOrDare() }
                    } label: {
                        Text(L.t("🛑 End Game", lang))
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.red.opacity(0.8))
                            .cornerRadius(6)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)

                // Player strip
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        if let players = game.playerInfo?.filter({ $0.online }) {
                            let pRatings = playerRatingsMap(turns: game.completedTurnsList ?? [])
                            ForEach(players) { p in
                                let emoji = avatarEmojiFor(p.avatarValue)
                                let isActive = p.participantId == game.currentTurnParticipantId
                                let avgRating = pRatings[p.participantId]
                                VStack(spacing: 2) {
                                    Text(emoji)
                                        .font(.system(size: 28))
                                        .frame(width: 44, height: 44)
                                        .background(isActive ? Color.purple.opacity(0.4) : Color.clear)
                                        .clipShape(Circle())
                                        .overlay(Circle().stroke(isActive ? Color.purple : Color.clear, lineWidth: 2))
                                    Text(p.nickname)
                                        .font(.system(size: 10))
                                        .foregroundColor(.white)
                                    if let avg = avgRating {
                                        Text("⭐ \(String(format: "%.1f", avg))")
                                            .font(.system(size: 9))
                                            .foregroundColor(.yellow)
                                    }
                                }
                                .opacity(isActive ? 1 : 0.5)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 8)

                Spacer()

                // Main content
                if let turn = game.currentTurn {
                    turnContent(turn: turn, isMyTurn: isMyTurn, currentPlayer: currentPlayer, avatarEmoji: avatarEmoji, game: game)
                }

                Spacer()
            }

            // Full-screen image overlay
            if let imageUrl = fullScreenImageUrl, let url = URL(string: imageUrl) {
                Color.black.opacity(0.9)
                    .ignoresSafeArea()
                    .onTapGesture { fullScreenImageUrl = nil }

                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .padding()
                } placeholder: {
                    ProgressView().tint(.white)
                }
                .onTapGesture { fullScreenImageUrl = nil }
            }
        }
        .onChange(of: game.currentTurn?.id) { _ in
            starRating = 0
        }
    }

    // MARK: - Turn Content

    @ViewBuilder
    private func turnContent(turn: TruthOrDareTurn, isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, avatarEmoji: String, game: TruthOrDareGame) -> some View {
        switch turn.status {
        case .waiting_for_choice:
            choiceView(isMyTurn: isMyTurn, currentPlayer: currentPlayer, avatarEmoji: avatarEmoji)

        case .waiting_for_response:
            promptView(turn: turn, isMyTurn: isMyTurn, currentPlayer: currentPlayer, game: game)

        case .completed, .skipped:
            responseView(turn: turn, currentPlayer: currentPlayer, avatarEmoji: avatarEmoji, game: game)
        }
    }

    // MARK: - Choice View

    private func choiceView(isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, avatarEmoji: String) -> some View {
        VStack(spacing: 16) {
            Text(avatarEmoji)
                .font(.system(size: 60))

            Text(isMyTurn
                ? L.t("It's your turn!", lang)
                : "\(currentPlayer?.nickname ?? "")\(L.t("'s turn!", lang))")
                .font(.title2.bold())
                .foregroundColor(.white)

            if isMyTurn {
                Text(L.t("Truth or Dare?", lang))
                    .font(.title3)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.bottom, 8)

                HStack(spacing: 20) {
                    Button {
                        Task { await viewModel.submitTruthOrDareChoice(choice: "truth") }
                    } label: {
                        Text(L.t("Truth", lang))
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(colors: [.blue, .blue.opacity(0.7)],
                                               startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .cornerRadius(12)
                    }

                    Button {
                        Task { await viewModel.submitTruthOrDareChoice(choice: "dare") }
                    } label: {
                        Text(L.t("Dare", lang))
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(colors: [.red, .red.opacity(0.7)],
                                               startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 32)

                Button {
                    Task { await viewModel.skipTruthOrDareTurn() }
                } label: {
                    Text(L.t("Skip", lang))
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                }
                .padding(.top, 8)
            } else {
                Text("\(L.t("Waiting for", lang)) \(currentPlayer?.nickname ?? "") \(L.t("to choose...", lang))")
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .padding()
    }

    // MARK: - Prompt View

    private func promptView(turn: TruthOrDareTurn, isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, game: TruthOrDareGame) -> some View {
        VStack(spacing: 16) {
            // Choice badge
            Text(turn.choice == .truth ? L.t("Truth", lang) : L.t("Dare", lang))
                .font(.caption.bold())
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .background(
                    turn.choice == .truth
                        ? LinearGradient(colors: [.blue, .blue.opacity(0.7)], startPoint: .leading, endPoint: .trailing)
                        : LinearGradient(colors: [.red, .red.opacity(0.7)], startPoint: .leading, endPoint: .trailing)
                )
                .cornerRadius(20)

            // Prompt
            Text(turn.localizedPrompt(lang: lang))
                .font(.title3.bold())
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.white.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal)

            if isMyTurn {
                responseInput(turn: turn, game: game)
            } else {
                if turn.promptResponseType == .drawing {
                    // Animated pencil indicator when another player is drawing
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Text("✏️")
                                .font(.title2)
                                .rotationEffect(.degrees(pencilWiggle ? 8 : -10))
                                .animation(
                                    .easeInOut(duration: 0.4).repeatForever(autoreverses: true),
                                    value: pencilWiggle
                                )
                                .onAppear { pencilWiggle = true }
                                .onDisappear { pencilWiggle = false }

                            Text("\(currentPlayer?.nickname ?? "") \(L.t("is drawing", lang))...")
                                .foregroundColor(.white.opacity(0.7))
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(16)
                    }
                } else {
                    Text("\(L.t("Waiting for", lang)) \(currentPlayer?.nickname ?? "") \(L.t("to respond...", lang))")
                        .foregroundColor(.white.opacity(0.5))
                }
            }
        }
        .padding()
    }

    // MARK: - Response Input

    @ViewBuilder
    private func responseInput(turn: TruthOrDareTurn, game: TruthOrDareGame) -> some View {
        let responseType = turn.promptResponseType ?? .text

        switch responseType {
        case .text:
            VStack(spacing: 12) {
                TextField(L.t("Type your answer...", lang), text: $responseText)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)

                Button {
                    guard !responseText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    let text = responseText.trimmingCharacters(in: .whitespaces)
                    responseText = ""
                    Task { await viewModel.submitTruthOrDareResponse(responseText: text, responseMediaUrl: nil) }
                } label: {
                    Text(L.t("Send Answer", lang))
                        .font(.body.bold())
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(responseText.trimmingCharacters(in: .whitespaces).isEmpty ? Color.gray : Color.purple)
                        .cornerRadius(10)
                }
                .disabled(responseText.trimmingCharacters(in: .whitespaces).isEmpty)
                .padding(.horizontal)

                if turn.choice == .dare {
                    Button {
                        Task { await viewModel.submitTruthOrDareResponse(responseText: "✅ Done!", responseMediaUrl: nil) }
                    } label: {
                        Text(L.t("Done Dare", lang))
                            .font(.body.bold())
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(LinearGradient(colors: [Color.green, Color.green.opacity(0.7)], startPoint: .leading, endPoint: .trailing))
                            .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
            }

        case .photo:
            // Photo dares removed — fall through to drawing
            EmptyView()

        case .drawing:
            Button {
                showDrawing = true
            } label: {
                Label(L.t("Draw your answer", lang), systemImage: "pencil.tip")
                    .font(.body.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(LinearGradient(colors: [.purple, .purple.opacity(0.7)], startPoint: .leading, endPoint: .trailing))
                    .cornerRadius(12)
            }
            .padding(.horizontal)
            .fullScreenCover(isPresented: $showDrawing) {
                VStack(spacing: 0) {
                    // Show the prompt
                    Text(turn.localizedPrompt(lang: lang))
                        .font(.subheadline.bold())
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                        .padding(.top, 12)
                        .padding(.bottom, 4)

                    DrawingComposerView(
                        lang: lang,
                        onSend: { image in
                            showDrawing = false
                            guard let data = image.pngData() else { return }
                            let base64 = data.base64EncodedString()
                            let mediaUrl = "data:image/png;base64,\(base64)"
                            Task { await viewModel.submitTruthOrDareResponse(responseText: nil, responseMediaUrl: mediaUrl) }
                        },
                        onCancel: { showDrawing = false },
                        triggerAutoSubmit: $triggerAutoSubmit
                    )
                }
            }

            if turn.choice == .dare {
                Button {
                    Task { await viewModel.submitTruthOrDareResponse(responseText: "✅ Done!", responseMediaUrl: nil) }
                } label: {
                    Text(L.t("Done Dare", lang))
                        .font(.body.bold())
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(LinearGradient(colors: [Color.green, Color.green.opacity(0.7)], startPoint: .leading, endPoint: .trailing))
                        .cornerRadius(12)
                }
                .padding(.horizontal)
            }
        }

        // Skip option
        Button {
            Task { await viewModel.skipTruthOrDareTurn() }
        } label: {
            Text(L.t("Skip", lang))
                .font(.caption)
                .foregroundColor(.white.opacity(0.5))
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
        }
        .padding(.top, 4)
    }

    // MARK: - Response View (turn completed)

    private func responseView(turn: TruthOrDareTurn, currentPlayer: TruthOrDarePlayerInfo?, avatarEmoji: String, game: TruthOrDareGame) -> some View {
        VStack(spacing: 16) {
            Text(avatarEmoji)
                .font(.system(size: 50))

            Text("\(currentPlayer?.nickname ?? "") \(turn.status == .skipped ? L.t("Skipped!", lang) : L.t("answered:", lang))")
                .font(.headline)
                .foregroundColor(.white)

            // Show original prompt as reminder
            if let choice = turn.choice {
                Text(choice == .truth ? L.t("Truth", lang) : L.t("Dare", lang))
                    .font(.caption.bold())
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(
                        Capsule().fill(choice == .truth ? Color.blue.opacity(0.3) : Color.red.opacity(0.3))
                    )

                Text(turn.localizedPrompt(lang: lang))
                    .font(.subheadline)
                    .italic()
                    .foregroundColor(.white.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
            }

            if turn.status == .completed {
                VStack(spacing: 8) {
                    if let text = turn.responseText {
                        Text(text)
                            .font(.title3)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
                    }
                    if let translated = turn.translatedResponseText {
                        Text(translated)
                            .font(.subheadline)
                            .italic()
                            .foregroundColor(.white.opacity(0.6))
                            .padding(.horizontal)
                    }
                    if let mediaUrl = turn.responseMediaUrl, let url = URL(string: mediaUrl) {
                        AsyncImage(url: url) { image in
                            image.resizable().scaledToFit()
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(maxHeight: 200)
                        .cornerRadius(12)
                        .onTapGesture {
                            fullScreenImageUrl = mediaUrl
                        }
                    }
                }
                .padding(.horizontal)
            }

            // Rating section
            if turn.status == .completed {
                let ratings = turn.ratings ?? []
                let myRating = ratings.first(where: { $0.participantId == viewModel.hostId })
                let isActivePlayer = turn.participantId == viewModel.hostId
                let eligibleRaters = (game.playerInfo ?? []).filter { $0.online && $0.participantId != turn.participantId }
                let allRated = eligibleRaters.isEmpty || eligibleRaters.allSatisfy { p in ratings.contains(where: { $0.participantId == p.participantId }) }

                VStack(spacing: 8) {
                    // Average rating
                    if !ratings.isEmpty {
                        let avg = ratings.reduce(0.0) { $0 + $1.score } / Double(ratings.count)
                        Text("⭐ \(String(format: "%.1f", avg))/5 (\(ratings.count)/\(eligibleRaters.count) rated)")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }

                    // Star rating (not for the answerer, only if not yet rated)
                    if !isActivePlayer && myRating == nil {
                        Text(L.t("Rate this answer", lang))
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.6))
                            .padding(.bottom, 4)

                        VStack(spacing: 12) {
                            // 5 clickable stars
                            HStack(spacing: 8) {
                                ForEach(1...5, id: \.self) { star in
                                    Button {
                                        starRating = star
                                    } label: {
                                        Text("⭐")
                                            .font(.system(size: 32))
                                            .saturation(star <= starRating ? 1.0 : 0.0)
                                            .opacity(star <= starRating ? 1.0 : 0.3)
                                            .scaleEffect(star <= starRating ? 1.1 : 1.0)
                                            .animation(.easeInOut(duration: 0.15), value: starRating)
                                    }
                                }
                            }

                            // Submit button
                            Button {
                                guard starRating > 0 else { return }
                                Task { await viewModel.submitTruthOrDareRating(turnId: turn.id, score: Double(starRating)) }
                            } label: {
                                Text(L.t("Submit Rating", lang))
                                    .font(.subheadline.bold())
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 10)
                                    .background(
                                        starRating > 0
                                            ? LinearGradient(colors: [.yellow, .orange], startPoint: .leading, endPoint: .trailing)
                                            : LinearGradient(colors: [.gray.opacity(0.3), .gray.opacity(0.3)], startPoint: .leading, endPoint: .trailing)
                                    )
                                    .cornerRadius(8)
                            }
                            .disabled(starRating == 0)
                            .padding(.top, 8)
                        }
                    }

                    // After submitting, show confirmed rating as stars
                    if !isActivePlayer, let myR = myRating {
                        HStack(spacing: 4) {
                            ForEach(1...5, id: \.self) { star in
                                Text("⭐")
                                    .font(.system(size: 22))
                                    .saturation(Double(star) <= myR.score ? 1.0 : 0.0)
                                    .opacity(Double(star) <= myR.score ? 1.0 : 0.3)
                            }
                        }
                        if !allRated {
                            Text(L.t("Waiting for others to rate...", lang))
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.4))
                        }
                    }
                }

                // Host advances — only after all have rated
                if allRated {
                    Button {
                        Task { await viewModel.advanceTruthOrDareTurn() }
                    } label: {
                        Text("\(L.t("Next Turn", lang)) →")
                            .font(.body.bold())
                            .foregroundColor(.white)
                            .padding(.horizontal, 32)
                            .padding(.vertical, 12)
                            .background(
                                LinearGradient(colors: [.purple, .purple.opacity(0.7)],
                                               startPoint: .leading, endPoint: .trailing)
                            )
                            .cornerRadius(10)
                    }
                    .padding(.top, 8)
                } else {
                    // Host can force advance if someone is AFK
                    Button {
                        Task { await viewModel.advanceTruthOrDareTurn() }
                    } label: {
                        Text(L.t("Skip ratings", lang))
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.4))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 6)
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    }
                    .padding(.top, 8)
                }
            } else {
                // Skipped turn — just show next turn
                Button {
                    Task { await viewModel.advanceTruthOrDareTurn() }
                } label: {
                    Text("\(L.t("Next Turn", lang)) →")
                        .font(.body.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 12)
                        .background(
                            LinearGradient(colors: [.purple, .purple.opacity(0.7)],
                                           startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(10)
                }
                .padding(.top, 8)
            }
        }
        .padding()
    }

    // MARK: - Completed View

    private func completedView(game: TruthOrDareGame) -> some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#1a1a2e"), Color(hex: "#16213e")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                Text("🎲")
                    .font(.system(size: 60))
                Text(L.t("Game ended", lang))
                    .font(.title2.bold())
                    .foregroundColor(.white)
                Text(L.t("Truth or Dare", lang))
                    .foregroundColor(.white.opacity(0.7))
                Text("\(game.completedTurns ?? 0) \(L.t("played", lang))")
                    .foregroundColor(.white.opacity(0.5))
                    .font(.caption)

                // Ratings summary
                if let turns = game.completedTurnsList, !turns.isEmpty {
                    let ratedTurns = turns.filter { !$0.ratings.isEmpty }
                    if !ratedTurns.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("⭐ \(L.t("Ratings", lang))")
                                .font(.caption.bold())
                                .foregroundColor(.white)

                            ForEach(ratingSummary(turns: ratedTurns, players: game.playerInfo ?? []), id: \.pid) { entry in
                                HStack {
                                    Text("\(entry.emoji) \(entry.name)")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                    Spacer()
                                    Text("⭐ \(String(format: "%.1f", entry.avg))")
                                        .font(.caption.bold())
                                        .foregroundColor(.white)
                                }
                            }
                        }
                        .padding(12)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(10)
                        .padding(.horizontal)
                    }
                }

                Button {
                    onDismiss()
                } label: {
                    Text(L.t("Close", lang))
                        .font(.body.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 10)
                        .background(Color.purple)
                        .cornerRadius(8)
                }
                .padding(.top, 16)
            }
        }
    }

    // MARK: - Helpers

    private struct RatingSummaryEntry {
        let pid: String
        let name: String
        let emoji: String
        let avg: Double
    }

    private func ratingSummary(turns: [TruthOrDareCompletedTurn], players: [TruthOrDarePlayerInfo]) -> [RatingSummaryEntry] {
        var scores: [String: (total: Double, count: Int)] = [:]
        for t in turns {
            let pid = t.participantId
            let avg = Double(t.ratings.reduce(0) { $0 + $1.score }) / Double(t.ratings.count)
            if scores[pid] == nil { scores[pid] = (0, 0) }
            scores[pid]!.total += avg
            scores[pid]!.count += 1
        }
        return scores
            .map { (pid, s) in
                let player = players.first(where: { $0.participantId == pid })
                return RatingSummaryEntry(
                    pid: pid,
                    name: player?.nickname ?? "?",
                    emoji: avatarEmojiFor(player?.avatarValue ?? "cat"),
                    avg: s.total / Double(s.count)
                )
            }
            .sorted { $0.avg > $1.avg }
    }

    private func playerRatingsMap(turns: [TruthOrDareCompletedTurn]) -> [String: Double] {
        var scores: [String: (total: Double, count: Int)] = [:]
        for t in turns where !t.ratings.isEmpty {
            let pid = t.participantId
            let avg = t.ratings.reduce(0.0) { $0 + $1.score } / Double(t.ratings.count)
            if scores[pid] == nil { scores[pid] = (0, 0) }
            scores[pid]!.total += avg
            scores[pid]!.count += 1
        }
        return scores.mapValues { $0.total / Double($0.count) }
    }

    private func avatarEmojiFor(_ value: String) -> String {
        let avatars: [String: String] = [
            "cat": "🐱", "dog": "🐶", "fox": "🦊", "bear": "🐻",
            "panda": "🐼", "monkey": "🐵", "owl": "🦉", "penguin": "🐧",
            "frog": "🐸", "unicorn": "🦄", "dragon": "🐉", "koala": "🐨",
            "tiger": "🐯", "lion": "🦁", "rabbit": "🐰", "hamster": "🐹",
            "octopus": "🐙", "dolphin": "🐬", "butterfly": "🦋", "bee": "🐝",
        ]
        return avatars[value] ?? "🐱"
    }
}

// Color(hex:) extension is defined in Participant.swift
