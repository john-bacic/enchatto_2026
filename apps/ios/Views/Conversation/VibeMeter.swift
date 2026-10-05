import SwiftUI

// MARK: - Vibe meter

/// Party meter ported from web `computeVibe`: chatter in the last minute, boosted by EN⇄JA back-and-forth.
struct VibeScore {
    static let window: TimeInterval = 60
    static let comboGap: TimeInterval = 90
    static let hypeAt = 150

    let vibe: Int
    let hype: Bool
    let messageCount: Int
    let switches: Int
    let combo: Int
    let multiplier: Double

    init(messages: [Message], languageOf: (Message) -> String, now: Date) {
        let real = messages.filter { $0.kind != .system }
        let reference = max(now, real.last?.createdAt ?? now)
        let recent = real.filter { reference.timeIntervalSince($0.createdAt) < Self.window }

        var switches = 0
        for i in recent.indices.dropFirst() where languageOf(recent[i]) != languageOf(recent[i - 1]) {
            switches += 1
        }

        var combo = 0
        if let last = real.last, reference.timeIntervalSince(last.createdAt) < Self.comboGap {
            combo = 1
            for i in stride(from: real.count - 1, to: 0, by: -1) {
                let cur = real[i], prev = real[i - 1]
                if cur.createdAt.timeIntervalSince(prev.createdAt) > Self.comboGap
                    || languageOf(cur) == languageOf(prev) { break }
                combo += 1
            }
        }

        let mult = 1 + Double(min(combo, 20)) * 0.05
        vibe = Int((Double(recent.count * 12 + switches * 20) * mult).rounded())
        hype = vibe >= Self.hypeAt
        messageCount = recent.count
        self.switches = switches
        self.combo = combo
        multiplier = mult
    }

    static func isJapanese(_ text: String) -> Bool {
        text.unicodeScalars.contains {
            (0x3040...0x309F).contains($0.value) || (0x30A0...0x30FF).contains($0.value) || (0x4E00...0x9FFF).contains($0.value)
        }
    }
}

struct VibeBadge: View {
    let messages: [Message]
    let languageOf: (Message) -> String
    let language: String
    @Binding var hot: Bool
    /// Fired when the meter crosses into hype while the room is open
    var onHype: () -> Void = {}

    /// Opening a room whose last minute was already hot shouldn't burst
    @State private var shownAt = Date()
    @State private var showInfo = false

    var body: some View {
        TimelineView(.periodic(from: .now, by: 5)) { context in
            let score = VibeScore(messages: messages, languageOf: languageOf, now: context.date)
            LoopClock(active: score.hype) { t in
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("VIBE")
                        .font(.round(9, .black))
                    Text(Self.format(score.vibe))
                        .font(.chunky(16))
                        .monospacedDigit()
                        .contentTransition(.numericText())
                }
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 10)
                .frame(height: 34)
                .background(Capsule().fill(fill(hype: score.hype, t: t)))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                .background(Capsule().fill(EC.ink).offset(y: 3))
                .padding(.bottom, 3)
            }
            .nudge(on: score.vibe, active: score.vibe > 0, angle: 6, hop: 4)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: score.vibe)
            .onAppear { hot = score.hype }
            .onChange(of: score.hype) { isHype in
                hot = isHype
                if isHype, Date().timeIntervalSince(shownAt) > 3 { onHype() }
            }
            .contentShape(Capsule())
            .onTapGesture {
                Haptics.tap()
                showInfo = true
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Vibe \(score.vibe)")
            .accessibilityAddTraits(.isButton)
        }
        .popover(isPresented: $showInfo) {
            VibeInfoCard(messages: messages, languageOf: languageOf, language: language)
                .modifier(CompactPopover())
        }
    }

    private func fill(hype: Bool, t: Double) -> AnyShapeStyle {
        guard hype else { return AnyShapeStyle(EC.yellow) }
        let shift = (t / 2).truncatingRemainder(dividingBy: 1)
        return AnyShapeStyle(LinearGradient(
            colors: [EC.yellow, EC.pinkSoft, EC.blueSoft, EC.yellow, EC.pinkSoft],
            startPoint: UnitPoint(x: -shift * 2, y: 0.5),
            endPoint: UnitPoint(x: 2 - shift * 2, y: 0.5)
        ))
    }

    fileprivate static func format(_ n: Int) -> String {
        guard n >= 1000 else { return "\(n)" }
        let k = (Double(n) / 100).rounded() / 10
        return k == k.rounded() ? "\(Int(k))K" : "\(k)K"
    }
}

/// iPhone turns popovers into full sheets unless told otherwise (16.4+); older systems get a short sheet
private struct CompactPopover: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 16.4, *) {
            content
                .presentationCompactAdaptation(.popover)
                .presentationBackground(EC.paper)
        } else {
            content.presentationDetents([.medium])
        }
    }
}

/// What the Vibe meter means, with the room's live breakdown
private struct VibeInfoCard: View {
    let messages: [Message]
    let languageOf: (Message) -> String
    let language: String

    var body: some View {
        TimelineView(.periodic(from: .now, by: 5)) { context in
            let score = VibeScore(messages: messages, languageOf: languageOf, now: context.date)
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .firstTextBaseline) {
                    Text(L.t("What's the Vibe?", language))
                        .font(.chunky(18))
                    Spacer(minLength: 8)
                    Text(VibeBadge.format(score.vibe))
                        .font(.chunky(18))
                        .monospacedDigit()
                }
                .foregroundStyle(EC.ink)

                Text(L.t("A live party meter for the room. It climbs when people chat, and fastest when English and Japanese go back and forth.", language))
                    .font(.round(13, .medium))
                    .foregroundStyle(EC.ink.opacity(0.75))
                    .fixedSize(horizontal: false, vertical: true)

                VStack(spacing: 8) {
                    HStack {
                        Spacer()
                        Text(L.t("Last minute", language))
                            .font(.round(10, .black))
                            .foregroundStyle(EC.inkSoft)
                    }
                    row(icon: "bubble.left.fill", tint: EC.blue, title: "Each message", points: "+12", live: "\(score.messageCount)")
                    row(icon: "arrow.left.arrow.right", tint: EC.pink, title: "EN ⇄ JA switch", points: "+20", live: "\(score.switches)")
                    row(icon: "flame.fill", tint: EC.yellow, title: "Back-and-forth combo", points: L.t("up to ×2", language), live: String(format: "×%.2f", score.multiplier))
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text(score.hype ? L.t("Party mode is on!", language) : L.t("Party mode at 150: confetti for every new message", language))
                        .font(.round(12, .black))
                        .foregroundStyle(EC.ink)
                        .fixedSize(horizontal: false, vertical: true)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(EC.ink.opacity(0.08))
                            Capsule()
                                .fill(EC.pink)
                                .frame(width: max(8, geo.size.width * min(1, CGFloat(score.vibe) / CGFloat(VibeScore.hypeAt))))
                        }
                    }
                    .frame(height: 8)
                    .animation(.spring(response: 0.4, dampingFraction: 0.8), value: score.vibe)
                }

                Text(L.t("Only the last minute counts, so it cools off when the chat goes quiet.", language))
                    .font(.round(11, .bold))
                    .foregroundStyle(EC.inkSoft)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(16)
            .frame(width: 300)
        }
    }

    private func row(icon: String, tint: Color, title: String, points: String, live: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(tint == EC.yellow ? EC.ink : .white)
                .frame(width: 26, height: 26)
                .background(Circle().fill(tint))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
            VStack(alignment: .leading, spacing: 1) {
                Text(L.t(title, language))
                    .font(.round(13, .black))
                    .foregroundStyle(EC.ink)
                Text(points)
                    .font(.round(11, .bold))
                    .foregroundStyle(EC.inkSoft)
            }
            Spacer(minLength: 8)
            Text(live)
                .font(.chunky(13))
                .monospacedDigit()
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 8)
                .frame(minWidth: 34, minHeight: 24)
                .background(Capsule().fill(.white))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
        }
    }
}
