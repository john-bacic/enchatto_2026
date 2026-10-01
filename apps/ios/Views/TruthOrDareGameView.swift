import SwiftUI
import PhotosUI

struct TruthOrDareGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void
    var onMinimize: (() -> Void)? = nil

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var responseText = ""
    @State private var showPhotoPicker = false
    @State private var showDrawing = false
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var triggerAutoSubmit = false
    @State private var fullScreenImageUrl: String?
    @State private var starRating: Int = 0
    @State private var dismissedRoundBreak: Int = 0
    @State private var pickedChoice: TruthOrDareChoice?
    @State private var confettiTrigger = 0

    var body: some View {
        let game = viewModel.activeTruthOrDareGame
        if let game, game.status == .active {
            activeGameView(game: game)
        } else if let game, game.status == .completed || game.status == .canceled {
            completedView(game: game)
        } else {
            ZStack {
                RoomBackground(room: viewModel.room).ignoresSafeArea()
                ProgressView().tint(EC.ink)
            }
        }
    }

    // MARK: - Round break

    @ViewBuilder
    private func roundBreakInterstitial(game: TruthOrDareGame) -> some View {
        if let completedTurns = game.completedTurns,
           completedTurns > 0,
           completedTurns % 10 == 0,
           game.currentTurn?.status == .waiting_for_choice,
           dismissedRoundBreak != completedTurns {
            ZStack {
                EC.ink.opacity(0.55)
                    .ignoresSafeArea()

                VStack(spacing: 12) {
                    PackIcon("g-crown", size: 56)
                        .popIn()
                    OutlinedText(L.t("Round Complete!", lang).uppercased(), size: 26, fill: EC.yellow)
                        .rotationEffect(.degrees(-3))
                        .stampIn(delay: 0.1)
                        .multilineTextAlignment(.center)
                    Text("\(completedTurns) \(L.t("turns played", lang))")
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink.opacity(0.6))

                    roundBreakRatings(game: game)

                    HStack(spacing: 10) {
                        Button(L.t("End Game", lang)) {
                            Task { await viewModel.endTruthOrDare() }
                        }
                        .buttonStyle(.chunky(EC.red, size: .small))

                        Button("\(L.t("Keep Playing", lang)) →") {
                            Haptics.thump()
                            dismissedRoundBreak = completedTurns
                            Task { await viewModel.advanceTruthOrDareTurn() }
                        }
                        .buttonStyle(.chunky(EC.mint, size: .small))
                    }
                    .padding(.top, 6)
                }
                .padding(20)
                .ecCard(fill: EC.paper, radius: 28, border: 3.5, shadow: 8)
                .padding(.horizontal, 20)
                .popIn()
            }
            .onAppear {
                Haptics.success()
                confettiTrigger += 1
            }
        }
    }

    @ViewBuilder
    private func roundBreakRatings(game: TruthOrDareGame) -> some View {
        if let turns = game.completedTurnsList, !turns.isEmpty {
            let ratedTurns = turns.filter { !$0.ratings.isEmpty }
            if !ratedTurns.isEmpty {
                let summary = ratingSummary(turns: ratedTurns, players: game.playerInfo ?? [])
                VStack(spacing: 8) {
                    ForEach(Array(summary.prefix(3).enumerated()), id: \.element.pid) { index, entry in
                        GKRankRow(rank: index + 1, entry: podiumEntry(entry), lang: lang)
                    }
                }
            }
        }
    }

    // MARK: - Chrome

    private func playerStrip(game: TruthOrDareGame) -> some View {
        let row = HStack(spacing: 10) {
            if let players = game.playerInfo?.filter({ $0.online }) {
                let pRatings = playerRatingsMap(turns: game.completedTurnsList ?? [])
                ForEach(Array(players.enumerated()), id: \.element.id) { index, p in
                    playerStripCell(
                        player: p,
                        isActive: p.participantId == game.currentTurnParticipantId,
                        avgRating: pRatings[p.participantId],
                        index: index
                    )
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 10)
        .padding(.bottom, 4)

        return ViewThatFits(in: .horizontal) {
            row
            ScrollView(.horizontal, showsIndicators: false) { row }
        }
    }

    private func playerStripCell(player: TruthOrDarePlayerInfo, isActive: Bool, avgRating: Double?, index: Int) -> some View {
        VStack(spacing: 3) {
            AvatarDisc(avatarId: player.avatarValue, size: isActive ? 50 : 40, ring: isActive ? EC.pink : nil)
                .background(Circle().fill(EC.ink).offset(y: 3))
                .gkBob(delay: Double(index) * 0.12, height: isActive ? 6 : 3)
            Text(player.participantId == viewModel.hostId ? L.t("You", lang) : player.nickname)
                .font(.round(10.5, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            if let avg = avgRating {
                HStack(spacing: 2) {
                    PackIcon("o-star", size: 12)
                    Text(String(format: "%.1f", avg))
                        .font(.chunky(10))
                        .foregroundStyle(EC.ink)
                }
            }
        }
        .frame(minWidth: 52)
        .opacity(isActive ? 1 : 0.7)
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: isActive)
        .accessibilityElement(children: .combine)
    }

    private func headerBar(game: TruthOrDareGame) -> some View {
        let completed = game.completedTurns ?? 0
        let inProgress = (game.currentTurn?.status == .waiting_for_choice || game.currentTurn?.status == .waiting_for_response) ? 1 : 0
        let current = completed + inProgress
        let roundOf = max(10, Int(ceil(Double(completed + 1) / 10.0)) * 10)

        return GKHeader(icon: "g-question", title: L.t("Truth or Dare", lang), lang: lang, onMinimize: onMinimize ?? onDismiss) {
            GKCounter(text: "\(current)/\(roundOf)")
            Button(L.t("End Game", lang)) {
                Task { await viewModel.endTruthOrDare() }
            }
            .buttonStyle(.chunky(EC.red, size: .mini, fullWidth: false))
        }
    }

    // MARK: - Active Game View

    private func activeGameView(game: TruthOrDareGame) -> some View {
        let isMyTurn = game.currentTurnParticipantId == viewModel.hostId
        let currentPlayer = game.playerInfo?.first(where: { $0.participantId == game.currentTurnParticipantId })
        let isChoosing = game.currentTurn?.status == .waiting_for_choice

        return ZStack {
            RoomBackground(room: viewModel.room).ignoresSafeArea()
            if !reduceMotion {
                GeometryReader { geo in
                    RaysView(color: (isChoosing ? EC.pink : EC.yellow).opacity(0.35), rays: 20)
                        .frame(width: 520, height: 520)
                        .position(x: geo.size.width / 2, y: geo.size.height * 0.42)
                }
                .ignoresSafeArea()
            }

            VStack(spacing: 0) {
                headerBar(game: game)

                GeometryReader { geo in
                    ScrollView(showsIndicators: false) {
                        Group {
                            if let turn = game.currentTurn {
                                turnContent(turn: turn, isMyTurn: isMyTurn, currentPlayer: currentPlayer, game: game)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: geo.size.height)
                    }
                    .scrollDismissesKeyboard(.interactively)
                }

                playerStrip(game: game)
            }

            roundBreakInterstitial(game: game)

            ConfettiBurst(trigger: confettiTrigger, count: reduceMotion ? 20 : 54)
                .ignoresSafeArea()

            // Full-screen image overlay
            if let imageUrl = fullScreenImageUrl, let url = URL(string: imageUrl) {
                EC.ink.opacity(0.9)
                    .ignoresSafeArea()
                    .onTapGesture { fullScreenImageUrl = nil }

                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .padding()
                } placeholder: {
                    ProgressView().tint(.white)
                }
                .onTapGesture { fullScreenImageUrl = nil }
            }
        }
        .onChange(of: game.currentTurn?.id) { _ in
            starRating = 0
            pickedChoice = nil
        }
        .onChange(of: game.currentTurn?.status) { status in
            if status == .completed { Haptics.success() }
        }
        .onChange(of: game.currentTurn?.ratings?.count ?? 0) { _ in
            celebrateIfLegendary()
        }
    }

    /// Big confetti when everyone has rated and the answer averages 4.5+
    private func celebrateIfLegendary() {
        guard let game = viewModel.activeTruthOrDareGame, let turn = game.currentTurn, turn.status == .completed else { return }
        let ratings = turn.ratings ?? []
        let eligible = (game.playerInfo ?? []).filter { $0.online && $0.participantId != turn.participantId }
        guard !ratings.isEmpty, eligible.allSatisfy({ p in ratings.contains { $0.participantId == p.participantId } }) else { return }
        let avg = ratings.reduce(0.0) { $0 + $1.score } / Double(ratings.count)
        if avg >= 4.5 {
            Haptics.success()
            confettiTrigger += 1
        }
    }

    // MARK: - Turn Content

    @ViewBuilder
    private func turnContent(turn: TruthOrDareTurn, isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, game: TruthOrDareGame) -> some View {
        switch turn.status {
        case .waiting_for_choice:
            choiceView(isMyTurn: isMyTurn, currentPlayer: currentPlayer, game: game)

        case .waiting_for_response:
            promptView(turn: turn, isMyTurn: isMyTurn, currentPlayer: currentPlayer, game: game)

        case .completed, .skipped:
            responseView(turn: turn, currentPlayer: currentPlayer, game: game)
        }
    }

    // MARK: - Choice View

    private func turnPill(isMyTurn: Bool, player: TruthOrDarePlayerInfo?) -> some View {
        HStack(spacing: 10) {
            AvatarDisc(avatarId: player?.avatarValue ?? "cat", size: 46)
            Text((isMyTurn ? L.t("It's your turn!", lang) : "\(player?.nickname ?? "")\(L.t("'s turn!", lang))").uppercased())
                .font(.chunky(19))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        }
        .padding(.leading, 6)
        .padding(.trailing, 18)
        .padding(.vertical, 6)
        .background(Capsule().fill(isMyTurn ? EC.yellow : .white))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 3.5))
        .background(Capsule().fill(EC.ink).offset(y: 5))
        .padding(.bottom, 5)
        .stampIn()
        .id(player?.participantId ?? "")
    }

    private func modesRow(game: TruthOrDareGame) -> some View {
        let mode = game.promptMode ?? "normal"
        return HStack(spacing: 6) {
            ForEach(["normal", "deep"], id: \.self) { m in
                let on = m == mode
                HStack(spacing: 4) {
                    if m == "deep" { PackIcon("o-whale", size: 16) }
                    Text(L.t(m == "normal" ? "Normal" : "Deep", lang))
                        .font(.round(12, .black))
                        .foregroundStyle(on ? EC.yellow : EC.ink)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 4)
                .background(Capsule().fill(on ? EC.ink : .white))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                .opacity(on ? 1 : 0.6)
            }
        }
        .accessibilityElement(children: .combine)
    }

    private func choiceView(isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, game: TruthOrDareGame) -> some View {
        let canPick = isMyTurn && !viewModel.isTruthOrDareSubmitting && pickedChoice == nil

        return VStack(spacing: 16) {
            modesRow(game: game)

            turnPill(isMyTurn: isMyTurn, player: currentPlayer)

            ZStack {
                HStack(spacing: 14) {
                    todCard(.truth, enabled: canPick, dimmed: !isMyTurn)
                    todCard(.dare, enabled: canPick, dimmed: !isMyTurn)
                }
                Text(L.t("OR", lang))
                    .font(.chunky(18))
                    .foregroundStyle(EC.ink)
                    .frame(width: 52, height: 52)
                    .background(Circle().fill(EC.yellow))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3.5))
                    .background(Circle().fill(EC.ink).offset(y: 4))
                    .rotationEffect(.degrees(-8))
                    .offset(y: -44)
                    .opacity(pickedChoice == nil ? 1 : 0)
                    .accessibilityHidden(true)
            }
            .padding(.top, 8)

            if isMyTurn {
                if viewModel.isTruthOrDareSubmitting {
                    ProgressView().tint(EC.ink)
                }
                Button(L.t("Skip", lang)) {
                    Task { await viewModel.skipTruthOrDareTurn() }
                }
                .buttonStyle(.chunky(.white, size: .mini, fullWidth: false))
            } else {
                Text("\(L.t("Waiting for", lang)) \(currentPlayer?.nickname ?? "") \(L.t("to choose...", lang))")
                    .font(.round(14, .black))
                    .foregroundStyle(EC.ink.opacity(0.6))
                    .multilineTextAlignment(.center)
            }

            HStack(spacing: 4) {
                Text(L.t("Everyone rates your answer 1–5", lang))
                    .font(.round(13, .black))
                    .foregroundStyle(EC.ink.opacity(0.7))
                PackIcon("o-star", size: 20)
            }

            lastTurnCard(game: game)
        }
    }

    private func todCard(_ choice: TruthOrDareChoice, enabled: Bool, dimmed: Bool) -> some View {
        let isTruth = choice == .truth
        let fill = isTruth ? EC.pink : EC.violet
        let shape = RoundedRectangle(cornerRadius: 28, style: .continuous)
        let picked = pickedChoice == choice
        let other = pickedChoice != nil && !picked

        return Button {
            Haptics.thump()
            withAnimation(.spring(response: 0.35, dampingFraction: 0.55)) { pickedChoice = choice }
            let turnId = viewModel.activeTruthOrDareGame?.currentTurn?.id
            Task { await viewModel.submitTruthOrDareChoice(choice: choice.rawValue) }
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                let turn = viewModel.activeTruthOrDareGame?.currentTurn
                if turn?.id == turnId && turn?.status == .waiting_for_choice {
                    withAnimation { pickedChoice = nil }
                }
            }
        } label: {
            VStack(spacing: 8) {
                PackIcon(isTruth ? "g-question" : "g-bang", size: 84)
                    .shadow(color: EC.ink.opacity(0.55), radius: 0, y: 4)
                OutlinedText(isTruth ? "TRUTH" : "DARE", size: 28, fill: .white)
                Text(L.t(isTruth ? "Truth" : "Dare", "ja"))
                    .font(.round(14, .black))
                    .foregroundStyle(.white)
                    .shadow(color: EC.ink, radius: 0, y: 2)
            }
            .frame(width: 150, height: 224)
            .background(
                ZStack {
                    shape.fill(fill)
                    if isTruth {
                        GKDotPattern(color: .white.opacity(0.3), spacing: 18, radius: 3)
                    } else {
                        GKStripePattern(color: .white.opacity(0.18), width: 12)
                    }
                }
                .clipShape(shape)
            )
            .overlay(shape.strokeBorder(EC.ink, lineWidth: 4))
            .background(shape.fill(EC.ink).offset(y: 9))
            .rotationEffect(.degrees(picked ? 0 : (isTruth ? -6 : 6)))
            .gkBob(delay: isTruth ? 0 : 0.35, height: enabled ? 8 : 0)
            .scaleEffect(picked ? 1.12 : (other ? 0.85 : 1))
            .opacity(other ? 0.25 : (dimmed ? 0.6 : 1))
            .zIndex(picked ? 1 : 0)
        }
        .buttonStyle(.pressable)
        .disabled(!enabled)
        .accessibilityLabel(L.t(isTruth ? "Truth" : "Dare", lang))
    }

    @ViewBuilder
    private func lastTurnCard(game: TruthOrDareGame) -> some View {
        if let last = game.completedTurnsList?.last {
            let player = game.playerInfo?.first { $0.participantId == last.participantId }
            let avg = last.ratings.isEmpty ? nil : last.ratings.reduce(0.0) { $0 + $1.score } / Double(last.ratings.count)
            HStack(spacing: 10) {
                AvatarDisc(avatarId: player?.avatarValue ?? "cat", size: 36)
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("\(L.t("Last turn", lang)): \(player?.nickname ?? "?")")
                            .font(.round(12.5, .black))
                            .foregroundStyle(EC.ink)
                            .lineLimit(1)
                        if let choice = last.choice {
                            choiceChip(choice, small: true)
                        }
                    }
                    Text("\"\(localizedPrompt(last.promptText))\"")
                        .font(.round(12, .bold))
                        .foregroundStyle(EC.ink.opacity(0.6))
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
                if let avg {
                    HStack(spacing: 3) {
                        PackIcon("o-star", size: 18)
                        Text(String(format: "%.1f", avg))
                            .font(.chunky(18))
                            .foregroundStyle(EC.ink)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .ecCard(fill: EC.yellow, radius: 12, border: 2.5, shadow: 3)
                }
            }
            .padding(10)
            .ecCard(radius: 18, border: 3, shadow: 5)
            .padding(.top, 6)
        }
    }

    private func choiceChip(_ choice: TruthOrDareChoice, small: Bool = false) -> some View {
        let isTruth = choice == .truth
        return Text(L.t(isTruth ? "Truth" : "Dare", lang).uppercased())
            .font(small ? .chunky(10) : .chunky(14))
            .foregroundStyle(.white)
            .padding(.horizontal, small ? 7 : 14)
            .padding(.vertical, small ? 2 : 5)
            .background(Capsule().fill(isTruth ? EC.pink : EC.violet))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: small ? 2 : 3))
            .background(Capsule().fill(EC.ink).offset(y: small ? 0 : 3))
    }

    // MARK: - Prompt View

    private func promptView(turn: TruthOrDareTurn, isMyTurn: Bool, currentPlayer: TruthOrDarePlayerInfo?, game: TruthOrDareGame) -> some View {
        let isTruth = turn.choice == .truth

        return VStack(spacing: 18) {
            turnPill(isMyTurn: isMyTurn, player: currentPlayer)

            VStack(spacing: 12) {
                PackIcon(isTruth ? "g-question" : "g-bang", size: 52)
                Text(turn.localizedPrompt(lang: lang))
                    .font(.round(21, .black))
                    .foregroundStyle(EC.ink)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, 20)
            .padding(.top, 26)
            .padding(.bottom, 22)
            .frame(maxWidth: .infinity)
            .ecCard(fill: isTruth ? EC.pinkSoft : EC.violetSoft, radius: 26, border: 3.5, shadow: 8)
            .overlay(alignment: .top) {
                if let choice = turn.choice {
                    choiceChip(choice)
                        .rotationEffect(.degrees(-4))
                        .offset(y: -16)
                }
            }
            .rotationEffect(.degrees(-1.5))
            .stampIn()
            .id(turn.id)
            .padding(.top, 10)

            if isMyTurn {
                responseInput(turn: turn, game: game)
            } else if turn.promptResponseType == .drawing {
                // Animated pencil indicator when another player is drawing
                HStack(spacing: 8) {
                    LoopClock { t in
                        PackIcon("g-pencil", size: 30)
                            .rotationEffect(.degrees(-1 + 9 * loopWave(t, period: 0.8)))
                    }

                    Text("\(currentPlayer?.nickname ?? "") \(L.t("is drawing", lang))...")
                        .font(.round(15, .black))
                        .foregroundStyle(EC.ink)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 10)
                .ecCard(fill: EC.yellowSoft, radius: 18, border: 3, shadow: 4)
            } else {
                HStack(spacing: 8) {
                    AvatarDisc(avatarId: currentPlayer?.avatarValue ?? "cat", size: 28)
                    Text("\(L.t("Waiting for", lang)) \(currentPlayer?.nickname ?? "") \(L.t("to respond...", lang))")
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink.opacity(0.6))
                }
            }
        }
    }

    // MARK: - Response Input

    @ViewBuilder
    private func responseInput(turn: TruthOrDareTurn, game: TruthOrDareGame) -> some View {
        let responseType = turn.promptResponseType ?? .text
        let trimmed = responseText.trimmingCharacters(in: .whitespaces)

        switch responseType {
        case .text:
            VStack(spacing: 12) {
                TextField(L.t("Type your answer...", lang), text: $responseText, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(.vertical, 8)
                    .ecField()

                Button {
                    guard !trimmed.isEmpty else { return }
                    let text = trimmed
                    responseText = ""
                    Haptics.thump()
                    Task { await viewModel.submitTruthOrDareResponse(responseText: text, responseMediaUrl: nil) }
                } label: {
                    HStack(spacing: 8) {
                        PackIcon("re-wave", size: 24)
                        Text(L.t("Send Answer", lang))
                    }
                }
                .buttonStyle(.chunky(EC.violet))
                .disabled(trimmed.isEmpty)

                if turn.choice == .dare {
                    doneDareButton
                }
            }

        case .photo:
            // Photo dares removed — fall through to drawing
            EmptyView()

        case .drawing:
            VStack(spacing: 12) {
                Button {
                    showDrawing = true
                } label: {
                    HStack(spacing: 8) {
                        PackIcon("g-pencil", size: 26)
                        Text(L.t("Draw your answer", lang))
                    }
                }
                .buttonStyle(.chunky(EC.pink))
                .fullScreenCover(isPresented: $showDrawing) {
                    VStack(spacing: 0) {
                        // Show the prompt
                        Text(turn.localizedPrompt(lang: lang))
                            .font(.round(16, .black))
                            .foregroundStyle(EC.ink)
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
                    doneDareButton
                }
            }
        }

        // Skip option
        Button(L.t("Skip", lang)) {
            Task { await viewModel.skipTruthOrDareTurn() }
        }
        .buttonStyle(.chunky(.white, size: .mini, fullWidth: false))
    }

    private var doneDareButton: some View {
        Button {
            Haptics.success()
            Task { await viewModel.submitTruthOrDareResponse(responseText: "✅ Done!", responseMediaUrl: nil) }
        } label: {
            HStack(spacing: 8) {
                PackIcon("g-ok", size: 24)
                Text(L.t("Done Dare", lang))
            }
        }
        .buttonStyle(.chunky(EC.mint))
    }

    // MARK: - Response View (turn completed)

    private func responseView(turn: TruthOrDareTurn, currentPlayer: TruthOrDarePlayerInfo?, game: TruthOrDareGame) -> some View {
        VStack(spacing: 14) {
            HStack(spacing: 12) {
                AvatarDisc(avatarId: currentPlayer?.avatarValue ?? "cat", size: 54)
                    .background(Circle().fill(EC.ink).offset(y: 3))
                VStack(alignment: .leading, spacing: 2) {
                    Text(currentPlayer?.nickname ?? "")
                        .font(.chunky(19))
                        .foregroundStyle(EC.ink)
                    Text(turn.status == .skipped ? L.t("Skipped!", lang) : L.t("answered:", lang))
                        .font(.round(14, .black))
                        .foregroundStyle(turn.status == .skipped ? EC.red : EC.ink.opacity(0.6))
                }
                Spacer(minLength: 0)
                if let choice = turn.choice {
                    choiceChip(choice)
                        .rotationEffect(.degrees(6))
                }
            }

            if turn.choice != nil {
                Text(turn.localizedPrompt(lang: lang))
                    .font(.round(14, .bold))
                    .italic()
                    .foregroundStyle(EC.ink.opacity(0.6))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }

            if turn.status == .completed {
                VStack(spacing: 10) {
                    if let text = turn.responseText {
                        Text(text)
                            .font(.round(21, .black))
                            .foregroundStyle(EC.ink)
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    if let translated = turn.translatedResponseText {
                        DashedRule()
                        Text(translated)
                            .font(.round(15, .bold))
                            .italic()
                            .foregroundStyle(EC.ink.opacity(0.6))
                            .multilineTextAlignment(.center)
                    }
                    if let mediaUrl = turn.responseMediaUrl, let url = URL(string: mediaUrl) {
                        AsyncImage(url: url) { image in
                            image.resizable().scaledToFit()
                        } placeholder: {
                            ProgressView().tint(EC.ink)
                        }
                        .frame(maxHeight: 200)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(EC.ink, lineWidth: 2.5))
                        .onTapGesture {
                            fullScreenImageUrl = mediaUrl
                        }
                    }
                }
                .padding(18)
                .frame(maxWidth: .infinity)
                .ecCard(radius: 24, border: 3.5, shadow: 7)
                .stampIn()
                .id("answer-\(turn.id)")
            }

            // Rating section
            if turn.status == .completed {
                ratingSection(turn: turn, game: game)
            } else {
                // Skipped turn — just show next turn
                nextTurnButton
            }
        }
    }

    @ViewBuilder
    private func ratingSection(turn: TruthOrDareTurn, game: TruthOrDareGame) -> some View {
        let ratings = turn.ratings ?? []
        let myRating = ratings.first(where: { $0.participantId == viewModel.hostId })
        let isActivePlayer = turn.participantId == viewModel.hostId
        let eligibleRaters = (game.playerInfo ?? []).filter { $0.online && $0.participantId != turn.participantId }
        let allRated = eligibleRaters.isEmpty || eligibleRaters.allSatisfy { p in ratings.contains(where: { $0.participantId == p.participantId }) }

        VStack(spacing: 10) {
            // Average rating
            if !ratings.isEmpty {
                let avg = ratings.reduce(0.0) { $0 + $1.score } / Double(ratings.count)
                HStack(spacing: 6) {
                    PackIcon("o-star", size: 22)
                    Text(String(format: "%.1f", avg))
                        .font(.chunky(18))
                        .foregroundStyle(EC.ink)
                    Text("/5 · \(ratings.count)/\(eligibleRaters.count) \(L.t("rated", lang))")
                        .font(.round(12, .black))
                        .foregroundStyle(EC.ink.opacity(0.6))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 4)
                .ecCard(fill: allRated && avg >= 4.5 ? EC.yellow : .white, radius: 14, border: 2.5, shadow: 3)
                .gkWiggle(allRated && avg >= 4.5, angle: 2)
            }

            // Star rating (not for the answerer, only if not yet rated)
            if !isActivePlayer && myRating == nil {
                ECLabel(L.t("Rate this answer", lang))

                HStack(spacing: 6) {
                    ForEach(1...5, id: \.self) { star in
                        Button {
                            Haptics.tap()
                            starRating = star
                        } label: {
                            PackIcon("o-star", size: 44)
                                .grayscale(star <= starRating ? 0 : 1)
                                .opacity(star <= starRating ? 1 : 0.35)
                                .scaleEffect(star <= starRating ? 1.12 : 1)
                                .rotationEffect(.degrees(star <= starRating ? Double(star - 3) * 4 : 0))
                                .animation(.spring(response: 0.25, dampingFraction: 0.45).delay(Double(star) * 0.03), value: starRating)
                        }
                        .buttonStyle(.pressable)
                        .accessibilityLabel("\(star)")
                        .accessibilityAddTraits(star <= starRating ? .isSelected : [])
                    }
                }

                Button {
                    guard starRating > 0 else { return }
                    Haptics.thump()
                    Task { await viewModel.submitTruthOrDareRating(turnId: turn.id, score: Double(starRating)) }
                } label: {
                    if viewModel.isTruthOrDareSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text(L.t("Submit Rating", lang))
                    }
                }
                .buttonStyle(.chunky(EC.violet, size: .small, fullWidth: false))
                .disabled(starRating == 0 || viewModel.isTruthOrDareSubmitting)
            }

            // After submitting, show confirmed rating as stars
            if !isActivePlayer, let myR = myRating {
                HStack(spacing: 4) {
                    ForEach(1...5, id: \.self) { star in
                        PackIcon("o-star", size: 28)
                            .grayscale(Double(star) <= myR.score ? 0 : 1)
                            .opacity(Double(star) <= myR.score ? 1 : 0.3)
                    }
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("\(Int(myR.score))/5")
                if !allRated {
                    Text(L.t("Waiting for others to rate...", lang))
                        .font(.round(12, .black))
                        .foregroundStyle(EC.ink.opacity(0.5))
                }
            }

            // Host advances — only after all have rated
            if allRated {
                nextTurnButton
            } else {
                // Host can force advance if someone is AFK
                Button(L.t("Skip ratings", lang)) {
                    Task { await viewModel.advanceTruthOrDareTurn() }
                }
                .buttonStyle(.chunky(.white, size: .mini, fullWidth: false))
                .padding(.top, 4)
            }
        }
    }

    private var nextTurnButton: some View {
        Button("\(L.t("Next Turn", lang)) →") {
            Haptics.thump()
            Task { await viewModel.advanceTruthOrDareTurn() }
        }
        .buttonStyle(.chunky(EC.pink))
        .gkWiggle(angle: 1, duration: 0.45)
        .padding(.top, 4)
    }

    // MARK: - Completed View

    private func completedView(game: TruthOrDareGame) -> some View {
        let ratedTurns = (game.completedTurnsList ?? []).filter { !$0.ratings.isEmpty }
        let summary = ratingSummary(turns: ratedTurns, players: game.playerInfo ?? [])
        let entries = summary.map(podiumEntry)

        return ZStack {
            GKCelebrationBackground(room: viewModel.room, celebrate: !entries.isEmpty)

            VStack(spacing: 14) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        OutlinedText(L.t("Game ended", lang).uppercased(), size: 34, fill: EC.yellow)
                            .rotationEffect(.degrees(-4))
                            .stampIn()
                            .padding(.top, 24)
                            .accessibilityAddTraits(.isHeader)

                        HStack(spacing: 6) {
                            ECChip(text: L.t("Truth or Dare", lang), fill: EC.pinkSoft, icon: "g-question")
                            ECChip(text: "\(game.completedTurns ?? 0) \(L.t("played", lang))", fill: EC.violetSoft)
                        }

                        if entries.isEmpty {
                            ChattoView(size: 110)
                                .padding(.top, 20)
                        } else {
                            GKPodium(entries: Array(entries.prefix(3)), lang: lang)
                                .padding(.top, 34)

                            VStack(spacing: 10) {
                                HStack(spacing: 6) {
                                    PackIcon("o-star", size: 20)
                                    ECLabel(L.t("Ratings", lang))
                                }
                                ForEach(Array(entries.enumerated()), id: \.element.id) { index, entry in
                                    GKRankRow(rank: index + 1, entry: entry, lang: lang)
                                }
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity)
                            .ecCard(radius: 22)
                            .padding(.horizontal, 16)
                            .padding(.top, -12)
                        }
                    }
                }

                HStack(spacing: 10) {
                    Button(L.t("Close", lang)) { onDismiss() }
                        .buttonStyle(.chunky(EC.blue))
                    Button("\(L.t("Play Again", lang)) →") {
                        Haptics.thump()
                        Task {
                            await viewModel.createTruthOrDare(promptMode: game.promptMode ?? "normal")
                        }
                    }
                    .buttonStyle(.chunky(EC.pink))
                    .gkWiggle(angle: 1.2, duration: 0.4)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 10)
            }
        }
    }

    // MARK: - Helpers

    private struct RatingSummaryEntry {
        let pid: String
        let name: String
        let avatarValue: String
        let avg: Double
    }

    private func podiumEntry(_ entry: RatingSummaryEntry) -> GKPodiumEntry {
        GKPodiumEntry(
            id: entry.pid,
            nickname: entry.name,
            avatarValue: entry.avatarValue,
            valueText: "★ \(String(format: "%.1f", entry.avg))",
            isMe: entry.pid == viewModel.hostId
        )
    }

    private func localizedPrompt(_ text: String?) -> String {
        guard let text,
              let data = text.data(using: .utf8),
              let parsed = try? JSONSerialization.jsonObject(with: data) as? [String: String] else {
            return text ?? ""
        }
        return parsed[lang] ?? parsed["en"] ?? text
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
                    avatarValue: player?.avatarValue ?? "cat",
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
}
