import SwiftUI

/// L.t with `{name}`-style placeholders
func wrT(_ key: String, _ lang: String, _ args: [String: String] = [:]) -> String {
    args.reduce(L.t(key, lang)) { $0.replacingOccurrences(of: "{\($1.key)}", with: $1.value) }
}

/// Server clock is epoch ms; device clocks are NTP-synced closely enough for 2.5s emoji steps.
func wrNowMs(_ date: Date = Date()) -> Double { date.timeIntervalSince1970 * 1000 }

func wrPackName(_ pack: String, _ lang: String) -> String {
    switch pack {
    case "foodie": return L.t("Foodie", lang)
    case "travel": return L.t("Travel", lang)
    case "slang": return L.t("Slang", lang)
    case "anime": return L.t("Anime", lang)
    case "feelings": return L.t("Feelings", lang)
    case "chat": return L.t("From this chat", lang)
    default: return L.t("Mix", lang)
    }
}

func wrPackEmoji(_ pack: String) -> String {
    switch pack {
    case "foodie": return "🍰"
    case "travel": return "🚃"
    case "slang": return "😂"
    case "anime": return "⭐"
    case "feelings": return "❤️"
    case "chat": return "💬"
    default: return "🎁"
    }
}

/// Points if you answer right now (mirrors wordRush.ts `answer`)
func wrPotentialPoints(elapsedMs: Double, stepMs: Double, hinted: Bool, streak: Int) -> Int {
    let base = elapsedMs < stepMs ? 300 : elapsedMs < stepMs * 2 ? 200 : 100
    let afterHint = hinted ? max(50, base - 100) : base
    let next = streak + 1
    let multiplier = next >= 5 ? 2.0 : next >= 3 ? 1.5 : 1.0
    return Int((Double(afterHint) * multiplier).rounded())
}

func wrStreakMultiplier(_ streak: Int) -> String? {
    streak >= 5 ? "×2" : streak >= 3 ? "×1.5" : nil
}

// MARK: - Top bar

struct WordRushTopBar: View {
    let game: WordRushGame
    let lang: String
    let isHost: Bool
    let results: [String: HostRoomViewModel.WordRushResult]
    let onMinimize: () -> Void
    let onSkip: () -> Void
    let onEnd: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            Menu {
                Button { onMinimize() } label: { Label(L.t("Minimize", lang), systemImage: "minus") }
                if isHost {
                    Button { onSkip() } label: { Label(L.t("Skip ahead", lang), systemImage: "forward.fill") }
                    Button(role: .destructive) { onEnd() } label: { Label(L.t("End game", lang), systemImage: "xmark") }
                }
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 17, weight: .black))
                    .foregroundStyle(EC.ink)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(.white))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
                    .background(Circle().fill(EC.ink).offset(y: 4))
                    .padding(.bottom, 4)
            }

            HStack(spacing: 4) {
                ForEach(0..<max(game.totalCards, 1), id: \.self) { i in
                    Capsule()
                        .fill(segmentColor(i))
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                        .frame(height: 11)
                }
            }

            HStack(alignment: .firstTextBaseline, spacing: 0) {
                Text("\(min(game.cardIndex + 1, game.totalCards))").font(.chunky(22)).foregroundStyle(EC.ink)
                Text("/\(game.totalCards)").font(.chunky(13)).foregroundStyle(EC.inkSoft)
            }
            .fixedSize()
        }
    }

    private func segmentColor(_ i: Int) -> Color {
        if i == game.cardIndex { return EC.yellow }
        if i > game.cardIndex { return .white }
        guard let r = results["\(game.id)-\(i)"] else { return EC.lineSoft }
        return r.correct ? EC.mint : EC.pink
    }
}

// MARK: - Countdown ring

struct WordRushCountdownRing: View {
    let startMs: Double
    let endMs: Double
    var size: CGFloat = 64

    var body: some View {
        TimelineView(.periodic(from: .now, by: 0.1)) { ctx in
            let now = wrNowMs(ctx.date)
            let total = max(1, endMs - startMs)
            let left = max(0, endMs - now)
            let fraction = left / total
            let secs = Int(ceil(left / 1000))
            let urgent = secs <= 3
            ZStack {
                Circle().fill(.white)
                Circle()
                    .trim(from: 0, to: fraction)
                    .stroke(urgent ? EC.red : EC.blue, style: StrokeStyle(lineWidth: size * 0.14, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .padding(size * 0.1)
                    .animation(.linear(duration: 0.1), value: fraction)
                Text("\(secs)")
                    .font(.chunky(size * 0.36))
                    .foregroundStyle(urgent ? EC.red : EC.ink)
                    .scaleEffect(urgent ? 1.12 : 1)
                    .animation(.spring(response: 0.25, dampingFraction: 0.4), value: secs)
            }
            .frame(width: size, height: size)
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
            .background(Circle().fill(EC.ink).offset(y: 4))
        }
    }
}

/// "Next word in 5s" style countdown text
struct WordRushSecondsLeft: View {
    let endMs: Double
    let render: (Int) -> String

    var body: some View {
        TimelineView(.periodic(from: .now, by: 0.25)) { ctx in
            Text(render(max(0, Int(ceil((endMs - wrNowMs(ctx.date)) / 1000)))))
        }
    }
}

// MARK: - Player bubble

struct WordRushAvatar: View {
    let player: WordRushPlayer
    var size: CGFloat = 46
    var checked = false
    var dimmed = false
    var ring: Color? = nil

    var body: some View {
        AvatarDisc(avatarId: player.avatarValue, size: size, ring: ring)
            .saturation(dimmed ? 0 : 1)
            .opacity(dimmed ? 0.55 : 1)
            .overlay(alignment: .bottomTrailing) {
                if checked {
                    Image(systemName: "checkmark")
                        .font(.system(size: size * 0.24, weight: .black))
                        .foregroundStyle(.white)
                        .frame(width: size * 0.42, height: size * 0.42)
                        .background(Circle().fill(EC.mint))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                        .offset(x: 4, y: 4)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.5), value: checked)
    }
}

// MARK: - Streak flame

struct WordRushStreakBadge: View {
    let streak: Int
    let lang: String

    var body: some View {
        let hot = streak >= 5
        HStack(spacing: 4) {
            LoopClock { t in
                let w = loopWave(t, period: hot ? 0.36 : 0.7)
                Text(hot ? "🔥🔥" : "🔥")
                    .font(.system(size: hot ? 18 : 16))
                    .scaleEffect(1.05 + 0.13 * w)
                    .rotationEffect(.degrees(6 * w))
            }
            Text(wrT("{n} in a row", lang, ["n": "\(streak)"]))
                .font(.round(13, .black))
                .foregroundStyle(hot ? .white : EC.red)
            if let mult = wrStreakMultiplier(streak) {
                Text(mult).font(.chunky(12)).foregroundStyle(hot ? EC.yellow : EC.ink)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Capsule().fill(hot ? EC.red : EC.yellowSoft))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .background(Capsule().fill(EC.ink).offset(y: 3))
        .rotationEffect(.degrees(-3))
        .nudge(on: streak, angle: 6)
    }
}

// MARK: - Clip bar

/// Play button + bouncing waveform for a recorded clip
struct WordRushClipBar: View {
    let url: URL?
    @ObservedObject var player: WordRushClipPlayer
    var tint: Color = EC.blue
    var caption: String? = nil
    var lang = "en"

    var body: some View {
        let isPlaying = url.map { player.playing == $0.absoluteString } ?? false
        HStack(spacing: 12) {
            Button {
                guard let url else { return }
                Haptics.tap()
                player.toggle(url)
            } label: {
                Image(systemName: isPlaying ? "stop.fill" : "play.fill")
            }
            .buttonStyle(.roundIcon(tint, diameter: 50))
            .disabled(url == nil)

            WordRushWaveform(active: isPlaying, progress: isPlaying ? player.progress : 0, tint: tint)
                .frame(height: 40)

            if let url, player.failed == url.absoluteString {
                Text(L.t("Can't play this clip", lang))
                    .font(.round(12, .black))
                    .foregroundStyle(EC.red)
                    .multilineTextAlignment(.trailing)
                    .lineLimit(2)
                    .frame(maxWidth: 80)
            } else if let caption {
                Text(caption)
                    .font(.round(12, .black))
                    .foregroundStyle(EC.ink)
                    .multilineTextAlignment(.trailing)
                    .lineLimit(2)
                    .frame(maxWidth: 80)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .ecCard(radius: 26, shadow: 5)
    }
}

struct WordRushWaveform: View {
    let active: Bool
    var progress: Double = 0
    var tint: Color = EC.blue
    private let heights: [CGFloat] = [0.35, 0.6, 0.85, 0.5, 1, 0.7, 0.45, 0.9, 0.6, 0.3, 0.75, 0.95, 0.55, 0.4, 0.8, 0.6, 0.35, 0.7, 0.5, 0.25]

    var body: some View {
        TimelineView(.animation(minimumInterval: 1 / 20, paused: !active)) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            GeometryReader { geo in
                HStack(alignment: .center, spacing: 3) {
                    ForEach(heights.indices, id: \.self) { i in
                        let wobble = active ? 0.65 + 0.35 * sin(t * 9 + Double(i) * 1.3) : 1
                        let played = Double(i) / Double(heights.count) < progress
                        Capsule()
                            .fill(active && !played ? tint.opacity(0.45) : tint)
                            .frame(height: max(4, geo.size.height * heights[i] * wobble))
                    }
                }
                .frame(maxHeight: .infinity)
            }
        }
    }
}

// MARK: - Toast

struct WordRushToast: View {
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(EC.yellow)
            Text(text).font(.round(14, .black)).foregroundStyle(.white).lineLimit(2)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Capsule().fill(EC.ink))
        .overlay(Capsule().strokeBorder(.white.opacity(0.4), lineWidth: 1.5))
        .padding(.horizontal, 24)
    }
}

// MARK: - Scene particles

/// Decorative ambient layer for the reveal card (petals|sparkles|bubbles|hearts|notes|stars|snow|confetti)
struct WordRushSceneOverlay: View {
    let scene: String

    private struct Particle {
        let x: Double, speed: Double, size: Double, phase: Double, sway: Double, spin: Double
    }

    private let particles: [Particle] = (0..<22).map { i in
        var g = WordRushSeededRandom(seed: UInt64(i * 7919 + 13))
        return Particle(
            x: g.next(), speed: 0.06 + g.next() * 0.08, size: 16 + g.next() * 16,
            phase: g.next(), sway: 10 + g.next() * 26, spin: g.next() * 2 - 1
        )
    }

    private var glyphs: [String] {
        switch scene {
        case "petals": return ["🌸", "🌸", "💮"]
        case "sparkles": return ["✨", "⭐️", "✨"]
        case "bubbles": return ["🫧", "🫧", "🫧"]
        case "hearts": return ["💗", "💕", "❤️"]
        case "notes": return ["🎵", "🎶", "🎵"]
        case "stars": return ["⭐️", "🌟", "✨"]
        case "snow": return ["❄️", "❄️", "⛄️"]
        default: return ["🎉", "🎊", "✨"]
        }
    }

    /// Bubbles and notes float up; everything else drifts down
    private var rises: Bool { scene == "bubbles" || scene == "notes" }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1 / 30)) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            Canvas { context, size in
                let symbols = glyphs.map { context.resolve(Text($0).font(.system(size: 22))) }
                for (i, p) in particles.enumerated() {
                    let cycle = (t * p.speed + p.phase).truncatingRemainder(dividingBy: 1)
                    let yFrac = rises ? 1 - cycle : cycle
                    let y = -30 + yFrac * (size.height + 60)
                    let x = p.x * size.width + sin(t * 1.2 + p.phase * 6) * p.sway
                    var c = context
                    c.opacity = 0.75
                    c.translateBy(x: x, y: y)
                    c.rotate(by: .degrees(t * 40 * p.spin))
                    c.scaleBy(x: p.size / 22, y: p.size / 22)
                    c.draw(symbols[i % symbols.count], at: .zero)
                }
            }
        }
        .allowsHitTesting(false)
    }
}

/// Deterministic tiny PRNG so particle layouts don't reshuffle on every render
struct WordRushSeededRandom {
    private var state: UInt64
    init(seed: UInt64) { state = seed &+ 0x9E37_79B9_7F4A_7C15 }
    mutating func next() -> Double {
        state = state &* 6_364_136_223_846_793_005 &+ 1_442_695_040_888_963_407
        return Double((state >> 33) % 10_000) / 10_000
    }
}

// MARK: - Spotlight

/// Soft cone of light from the top (mic / judging stage)
struct WordRushSpotlight: View {
    var color: Color = EC.yellow

    var body: some View {
        GeometryReader { geo in
            Path { p in
                let w = geo.size.width
                p.move(to: CGPoint(x: w * 0.42, y: 0))
                p.addLine(to: CGPoint(x: w * 0.58, y: 0))
                p.addLine(to: CGPoint(x: w * 0.85, y: geo.size.height * 0.55))
                p.addLine(to: CGPoint(x: w * 0.15, y: geo.size.height * 0.55))
                p.closeSubpath()
            }
            .fill(LinearGradient(colors: [color.opacity(0.4), color.opacity(0)], startPoint: .top, endPoint: .bottom))
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}

/// Red "● ON THE MIC!" tag
struct WordRushTag: View {
    let text: String
    var fill: Color = EC.red
    var dot = true

    var body: some View {
        HStack(spacing: 6) {
            if dot { Circle().fill(.white).frame(width: 9, height: 9) }
            Text(text).font(.chunky(15)).foregroundStyle(EC.textOn(fill))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 7)
        .background(RoundedRectangle(cornerRadius: 10).fill(fill))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(EC.ink, lineWidth: 3))
        .background(RoundedRectangle(cornerRadius: 10).fill(EC.ink).offset(y: 4))
        .rotationEffect(.degrees(-3))
    }
}

/// Small "Hear it" speaker button (TTS)
struct WordRushHearButton: View {
    let text: String
    let lang: String
    var size: CGFloat = 40

    var body: some View {
        Button {
            Haptics.tap()
            WordRushSpeech.say(text, lang: lang)
        } label: {
            PackIcon("g-ear", size: size * 0.7)
        }
        .buttonStyle(.roundIcon(.white, diameter: size))
    }
}
