import SwiftUI

struct WordRushCluesView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String

    private var me: String { viewModel.hostId }
    private var myPlayer: WordRushPlayer? { game.player(me) }
    /// Spectators see the choices for the language their UI isn't in
    private var learning: String { myPlayer?.learning ?? (lang == "ja" ? "en" : "ja") }
    private var myChoice: Int? { viewModel.wordRushMyChoices[game.cardKey] }
    private var answered: Bool { myChoice != nil || game.answer(for: me) != nil }
    private var hint: String? { viewModel.wordRushHints[game.cardKey] }
    private var emoji: [String] { game.card?.emoji ?? [] }

    var body: some View {
        TimelineView(.periodic(from: .now, by: 0.2)) { ctx in
            let elapsed = max(0, wrNowMs(ctx.date) - game.phaseStartedAt)
            let shown = min(max(emoji.count, 1), 1 + Int(elapsed / max(game.emojiStepMs, 1)))
            content(shown: shown, elapsed: elapsed)
        }
    }

    private func content(shown: Int, elapsed: Double) -> some View {
        VStack(spacing: 14) {
            statusRow
            pointsCard(shown: shown, elapsed: elapsed)

            Text(learning == "ja" ? L.t("What's this in Japanese?", lang) : L.t("What's this in English?", lang))
                .font(.chunky(21))
                .foregroundStyle(EC.ink)
                .multilineTextAlignment(.center)
                .padding(.top, 2)

            WordRushEmojiTiles(emoji: emoji, shown: shown)

            hintRow
            mascot(shown: shown)

            Spacer(minLength: 0)

            choices
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 8)
    }

    // MARK: - Status

    private var statusRow: some View {
        HStack(spacing: 10) {
            WordRushCountdownRing(startMs: game.phaseStartedAt, endMs: game.phaseEndsAt, size: 62)
            HStack(spacing: -8) {
                ForEach(game.players.prefix(6)) { p in
                    WordRushAvatar(player: p, size: 40, checked: game.answer(for: p.participantId) != nil,
                                   dimmed: game.answer(for: p.participantId) == nil && p.participantId != me)
                }
            }
            Text(wrT("{a}/{b} in", lang, ["a": "\(game.answers.count)", "b": "\(game.players.count)"]))
                .font(.round(12, .black))
                .foregroundStyle(EC.inkSoft)
                .fixedSize()
            Spacer(minLength: 0)
            if let streak = myPlayer?.streak, streak >= 2 {
                WordRushStreakBadge(streak: streak, lang: lang)
                    .transition(.scale.combined(with: .opacity))
            }
        }
    }

    private func pointsCard(shown: Int, elapsed: Double) -> some View {
        let points = wrPotentialPoints(elapsedMs: elapsed, stepMs: game.emojiStepMs, hinted: hint != nil, streak: myPlayer?.streak ?? 0)
        return HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 0) {
                Text(L.t("faster = more points", lang))
                    .font(.round(12, .black))
                    .foregroundStyle(EC.inkSoft)
                OutlinedText(answered ? L.t("LOCKED IN!", lang) : "+\(points)", size: answered ? 26 : 36, fill: answered ? EC.blue : .white)
                    .animation(.spring(response: 0.3, dampingFraction: 0.5), value: points)
            }
            Spacer()
            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { i in
                    Capsule()
                        .fill(i >= shown - 1 ? EC.yellow : EC.blueSoft)
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                        .frame(width: 30, height: 12)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .ecCard(radius: 22, shadow: 6)
    }

    // MARK: - Hint + mascot

    @ViewBuilder
    private var hintRow: some View {
        if let hint {
            HStack(spacing: 6) {
                PackIcon("g-bulb", size: 24)
                Text(hint).font(.round(16, .black)).foregroundStyle(EC.ink)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
            .ecOutline(fill: EC.yellowSoft, radius: 20, border: 2.5)
            .popIn()
        } else if myPlayer != nil && !answered {
            Button {
                Task { await viewModel.takeWordRushHint() }
            } label: {
                HStack(spacing: 6) {
                    PackIcon("g-bulb", size: 22)
                    Text(L.t("Hint", lang)).font(.round(14, .black)).foregroundStyle(EC.ink)
                    Text("−100").font(.chunky(13)).foregroundStyle(EC.red)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(Capsule().fill(.white.opacity(0.85)))
                .overlay(Capsule().strokeBorder(EC.ink, style: StrokeStyle(lineWidth: 2, dash: [5, 4])))
            }
            .buttonStyle(.pressable)
        }
    }

    private func mascot(shown: Int) -> some View {
        let line: String
        if myPlayer == nil {
            line = L.t("You're watching this round", lang)
        } else if answered {
            line = L.t("Locked in! Waiting for the others…", lang)
        } else if shown < 3 {
            line = L.t("One more emoji might give it away…!", lang)
        } else {
            line = L.t("All 3 are out — go go go!", lang)
        }
        return HStack(alignment: .center, spacing: 6) {
            ChattoView(size: 48)
            Text(line)
                .font(.round(14, .black))
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .ecCard(radius: 18, border: 2.5, shadow: 4)
                .rotationEffect(.degrees(-2))
                .id(line)
                .transition(.scale.combined(with: .opacity))
            Spacer(minLength: 0)
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: line)
    }

    // MARK: - Choices

    private var choices: some View {
        let letters = ["A", "B", "C", "D"]
        let columns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
        return LazyVGrid(columns: columns, spacing: 10) {
            if learning == "ja" {
                ForEach(Array((game.card?.choicesJa ?? []).enumerated()), id: \.offset) { i, c in
                    let reading = c.kana == c.ja ? c.romaji : "\(c.kana) · \(c.romaji)"
                    choiceButton(i, letter: letters[wrSafe: i] ?? "", primary: c.ja, secondary: reading)
                }
            } else {
                ForEach(Array((game.card?.choicesEn ?? []).enumerated()), id: \.offset) { i, c in
                    choiceButton(i, letter: letters[wrSafe: i] ?? "", primary: c, secondary: nil)
                }
            }
        }
    }

    private func choiceButton(_ index: Int, letter: String, primary: String, secondary: String?) -> some View {
        WordRushChoiceButton(
            letter: letter,
            primary: primary,
            secondary: secondary,
            selected: myChoice == index,
            dimmed: (answered && myChoice != index) || myPlayer == nil,
            lockedLabel: L.t("LOCKED IN!", lang)
        ) {
            Task { await viewModel.answerWordRush(choiceIndex: index) }
        }
        .disabled(answered || myPlayer == nil)
    }
}

// MARK: - Emoji tiles

struct WordRushEmojiTiles: View {
    let emoji: [String]
    let shown: Int

    private let fills = [EC.pinkSoft, EC.yellowSoft, EC.blueSoft]
    private let tilts: [Double] = [-5, 2, 5]

    var body: some View {
        HStack(spacing: 12) {
            ForEach(0..<3, id: \.self) { i in
                let revealed = i < shown && i < emoji.count
                ZStack {
                    if revealed {
                        EmojiArt(emoji: emoji[i], size: 66)
                            .transition(.asymmetric(
                                insertion: .offset(y: -260).combined(with: .scale(scale: 1.4)),
                                removal: .opacity
                            ))
                    } else {
                        Text("?")
                            .font(.chunky(34))
                            .foregroundStyle(EC.inkSoft.opacity(0.6))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 112)
                .background(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(revealed ? fills[i] : .white.opacity(0.6))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .strokeBorder(EC.ink, style: revealed ? StrokeStyle(lineWidth: 3) : StrokeStyle(lineWidth: 2.5, dash: [7, 5]))
                )
                .background(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(revealed ? EC.ink : .clear)
                        .offset(y: 6)
                )
                .rotationEffect(.degrees(revealed ? tilts[i] : 0))
                .scaleEffect(revealed ? 1 : 0.92)
                .animation(.interpolatingSpring(stiffness: 180, damping: 11), value: revealed)
            }
        }
        .onChange(of: shown) { _ in Haptics.tap() }
    }
}

struct WordRushChoiceButton: View {
    let letter: String
    let primary: String
    let secondary: String?
    let selected: Bool
    let dimmed: Bool
    let lockedLabel: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) {
                Text(primary)
                    .font(.chunky(secondary == nil ? 19 : 22))
                    .foregroundStyle(selected ? .white : EC.ink)
                    .lineLimit(2)
                    .minimumScaleFactor(0.55)
                    .multilineTextAlignment(.center)
                if let secondary {
                    Text(secondary)
                        .font(.round(12, .black))
                        .foregroundStyle(selected ? .white.opacity(0.85) : EC.pink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                }
            }
            .padding(.horizontal, 12)
            .frame(maxWidth: .infinity, minHeight: 82)
            .ecCard(fill: selected ? EC.blue : .white, radius: 22, shadow: selected ? 3 : 6)
            .overlay(alignment: .topLeading) {
                Text(letter)
                    .font(.chunky(12))
                    .foregroundStyle(EC.ink)
                    .frame(width: 24, height: 24)
                    .background(RoundedRectangle(cornerRadius: 7).fill(selected ? EC.yellow : EC.blueSoft))
                    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(EC.ink, lineWidth: 2))
                    .rotationEffect(.degrees(-8))
                    .offset(x: -5, y: -8)
            }
            .overlay(alignment: .topTrailing) {
                if selected {
                    Text(lockedLabel)
                        .font(.chunky(11))
                        .foregroundStyle(EC.ink)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(EC.yellow))
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                        .rotationEffect(.degrees(4))
                        .offset(x: 6, y: -12)
                        .stampIn()
                }
            }
            .opacity(dimmed && !selected ? 0.45 : 1)
            .scaleEffect(selected ? 1.03 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.55), value: selected)
        }
        .buttonStyle(.pressable)
    }
}

extension Array {
    subscript(wrSafe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
