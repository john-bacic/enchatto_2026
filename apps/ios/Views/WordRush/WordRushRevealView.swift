import SwiftUI

struct WordRushRevealView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String

    @State private var burst = 0
    @State private var floatText: String?

    private var me: String { viewModel.hostId }
    private var myPlayer: WordRushPlayer? { game.player(me) }
    private var learning: String { myPlayer?.learning ?? (lang == "ja" ? "en" : "ja") }
    private var reveal: WordRushReveal? { game.card?.reveal }
    private var isHost: Bool { viewModel.canControlWordRush }

    /// nil = spectator, false = wrong or no answer
    private var myCorrect: Bool? {
        guard myPlayer != nil else { return nil }
        return game.answer(for: me)?.correct ?? viewModel.wordRushMyResults[game.cardKey]?.correct ?? false
    }

    private var myPoints: Int {
        game.answer(for: me)?.points ?? viewModel.wordRushMyResults[game.cardKey]?.points ?? 0
    }

    private var sayItNext: Bool {
        game.sayIt && game.cardIndex % 2 == 1 && game.players.count >= 2
    }

    var body: some View {
        ZStack {
            if let reveal {
                WordRushSceneOverlay(scene: reveal.scene).ignoresSafeArea()
            }

            VStack(spacing: 0) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        if let reveal {
                            wordCard(reveal)
                                .overlay(alignment: .topTrailing) { verdictStamp }
                                .padding(.top, 14)
                            playerResults
                            choicesRecap(reveal)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
                }
                footer
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
            }

            if let floatText {
                FloatingScore(text: floatText, fill: EC.yellow)
                    .offset(y: -120)
            }
            ConfettiBurst(trigger: burst).ignoresSafeArea()
        }
        .onAppear {
            guard let myCorrect else { return }
            if myCorrect {
                Haptics.success()
                floatText = "+\(myPoints)"
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { burst += 1 }
            } else {
                Haptics.error()
            }
        }
    }

    // MARK: - Word card

    private func wordCard(_ r: WordRushReveal) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Text(lang == "ja" ? r.posJa : r.posEn)
                    .font(.round(12, .black))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(RoundedRectangle(cornerRadius: 7).fill(EC.blue))
                    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(EC.ink, lineWidth: 2))
                if !r.ipa.isEmpty {
                    Text(r.ipa).font(.system(size: 15, weight: .semibold, design: .rounded)).foregroundStyle(EC.ink)
                }
                WordRushHearButton(text: r.en, lang: "en", size: 34)
            }

            OutlinedText(r.en, size: 44, fill: .white, outline: 3)
                .lineLimit(1)
                .minimumScaleFactor(0.4)
                .shadow(color: EC.blue, radius: 0, x: 0, y: 4)
                .stampIn()

            VStack(spacing: 2) {
                HStack(spacing: 8) {
                    Text(r.ja.kana == r.ja.ja ? r.ja.ja : "\(r.ja.ja)・\(r.ja.kana)")
                        .font(.chunky(22))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                        .padding(.horizontal, 10)
                        .background(EC.yellow.opacity(0.75).frame(height: 14).offset(y: 8))
                    WordRushHearButton(text: r.ja.ja, lang: "ja", size: 34)
                }
                Text(r.ja.romaji).font(.round(14, .black)).foregroundStyle(EC.pink)
            }
            .popIn(delay: 0.15)

            HStack(spacing: 18) {
                ForEach(Array((game.card?.emoji ?? []).enumerated()), id: \.offset) { i, e in
                    EmojiArt(emoji: e, size: 40).popIn(delay: 0.2 + Double(i) * 0.08)
                }
            }

            let hook = lang == "ja" ? r.hookJa : r.hookEn
            if !hook.isEmpty {
                HStack(alignment: .top, spacing: 8) {
                    PackIcon("g-bulb", size: 26)
                    Text(hook)
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(RoundedRectangle(cornerRadius: 18).fill(EC.blueSoft.opacity(0.5)))
                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(EC.blue, lineWidth: 2.5))
                .popIn(delay: 0.3)
            }

            if !r.exampleEn.isEmpty || !r.exampleJa.isEmpty {
                Line()
                    .stroke(EC.lineSoft, style: StrokeStyle(lineWidth: 2, dash: [6, 5]))
                    .frame(height: 2)
                VStack(spacing: 4) {
                    Text(r.exampleEn).font(.round(15, .black)).foregroundStyle(EC.ink)
                    Text(r.exampleJa).font(.round(13, .bold)).foregroundStyle(EC.inkSoft)
                }
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 18)
        .frame(maxWidth: .infinity)
        .ecCard(radius: 30, shadow: 8)
    }

    @ViewBuilder
    private var verdictStamp: some View {
        if let myCorrect {
            Text(myCorrect ? L.t("GOT IT!", lang) : L.t("MISS…", lang))
                .font(.chunky(15))
                .multilineTextAlignment(.center)
                .foregroundStyle(myCorrect ? EC.mint : EC.pink)
                .frame(width: 78, height: 78)
                .background(Circle().fill(.white.opacity(0.92)))
                .overlay(Circle().strokeBorder(myCorrect ? EC.mint : EC.pink, lineWidth: 4))
                .overlay(Circle().strokeBorder(myCorrect ? EC.mint : EC.pink, lineWidth: 1.5).padding(5))
                .rotationEffect(.degrees(14))
                .offset(x: 10, y: -24)
                .stampIn(delay: 0.35)
        }
    }

    // MARK: - Players

    private var playerResults: some View {
        HStack(spacing: 12) {
            ForEach(game.players.prefix(6)) { p in
                let a = game.answer(for: p.participantId)
                let correct = a?.correct == true
                VStack(spacing: 4) {
                    ZStack(alignment: .topLeading) {
                        WordRushAvatar(player: p, size: 50, dimmed: !correct)
                        if correct && p.streak >= 3 {
                            Text("🔥").font(.system(size: 18)).offset(x: -6, y: -8)
                        }
                    }
                    Text(correct ? "+\(a?.points ?? 0)" : L.t("miss", lang))
                        .font(.chunky(12))
                        .foregroundStyle(EC.ink)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(correct ? EC.mint : .white))
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                }
                .popIn(delay: 0.4)
            }
        }
    }

    private func choicesRecap(_ r: WordRushReveal) -> some View {
        let correct = r.correctIndex(learning: learning)
        let mine = game.answer(for: me)?.choiceIndex ?? viewModel.wordRushMyChoices[game.cardKey]
        let labels: [String] = learning == "ja"
            ? (game.card?.choicesJa ?? []).map { "\($0.ja) · \($0.romaji)" }
            : (game.card?.choicesEn ?? [])
        return LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)], spacing: 8) {
            ForEach(Array(labels.enumerated()), id: \.offset) { i, label in
                let isCorrect = i == correct
                let isMyMiss = i == mine && !isCorrect
                HStack(spacing: 5) {
                    if isCorrect {
                        Image(systemName: "checkmark").font(.system(size: 11, weight: .black))
                    } else if isMyMiss {
                        Image(systemName: "xmark").font(.system(size: 11, weight: .black))
                    }
                    Text(label).font(.round(13, .black)).lineLimit(1).minimumScaleFactor(0.6)
                }
                .foregroundStyle(isCorrect || isMyMiss ? EC.ink : EC.inkSoft)
                .frame(maxWidth: .infinity, minHeight: 34)
                .padding(.horizontal, 6)
                .ecOutline(fill: isCorrect ? EC.mint : isMyMiss ? EC.pinkSoft : .white.opacity(0.7), radius: 12, border: 2)
                .opacity(isCorrect || isMyMiss ? 1 : 0.7)
            }
        }
    }

    // MARK: - Footer

    private var footer: some View {
        VStack(spacing: 8) {
            if sayItNext {
                HStack(spacing: 10) {
                    PackIcon("g-music", size: 30)
                    Text(L.t("SAY IT! IS NEXT", lang)).font(.chunky(18)).foregroundStyle(.white)
                }
                .frame(maxWidth: .infinity, minHeight: 54)
                .ecCard(fill: EC.pink, radius: 22, shadow: 6)
                .popIn(delay: 0.5)
            }
            HStack {
                WordRushSecondsLeft(endMs: game.phaseEndsAt) { wrT("Next word in {n}s", lang, ["n": "\($0)"]) }
                    .font(.round(13, .black))
                    .foregroundStyle(EC.inkSoft)
                Spacer()
                if isHost {
                    Button(L.t("NEXT WORD ➜", lang)) { Task { await viewModel.skipWordRushPhase() } }
                        .buttonStyle(.chunky(EC.blue, size: .small, fullWidth: false))
                }
            }
        }
    }
}

private struct Line: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: 0, y: rect.midY))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        }
    }
}
