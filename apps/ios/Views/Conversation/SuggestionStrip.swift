import SwiftUI

/// The things to say over the message box, picked by ConversationStarters with the web's rules (the web's strip is
/// apps/web/components/suggestion-strip.tsx). Keeps its own clock, so that a silence turning the replies into topics
/// draws the strip again and not the room
struct SuggestionStrip: View {
    let messages: [Message]
    let people: [Participant]
    let meId: String
    let hostId: String?
    /// Her language: "ja", or English for anything else. Each chip is in it, and a tap puts it in the box
    let lang: String
    /// The other language under each chip, and its romaji under that for an English reader
    let under: Bool
    let showRomaji: Bool
    /// The message she is replying to: the chips answer it
    let replyTo: Message?
    let gameOn: Bool
    /// Replies written for a message on this phone, by the message's id. They come first
    let ideas: [String: [StarterPhrase]]
    /// Messages whose replies are still being written on this phone: chips that answer one wait for them
    var waitingFor: Set<String> = []
    /// A tap on a chip, with its words
    let onPick: (String) -> Void
    /// A tap on the chip that offers a game. Without it there is no such chip
    let onGame: (() -> Void)?

    @State private var shuffle = 0
    @State private var dismissed: String?
    @State private var woken = 0
    /// Where the chips end, measured from the scroller's leading edge as it scrolls: past its width there are more
    @State private var chipsEnd: CGFloat = 0

    private static let tones = [EC.pinkSoft, EC.blueSoft, EC.mintSoft, EC.yellowSoft]
    private static let scroller = "suggestion-scroller"

    var body: some View {
        let now = Date()
        let (starters, wakeAt) = ConversationStarters.startersFor(StarterInput(
            messages: messages.map(StarterMessage.init),
            people: people.map { StarterPerson(id: $0.id, nickname: $0.nickname) },
            meId: meId,
            hostId: hostId,
            replyTo: replyTo.map(StarterMessage.init),
            now: (now.timeIntervalSince1970 * 1000).rounded(),
            month: Calendar.current.component(.month, from: now),
            gameOn: gameOn,
            shuffle: shuffle,
            ideas: ideas
        ))
        let chips = starters?.chips.filter { $0.kind != .game || onGame != nil } ?? []
        let shown = starters.flatMap { waits($0.key) ? nil : $0 }
        VStack(spacing: 0) {
            if let shown, !chips.isEmpty, shown.key != dismissed {
                row(shown, chips)
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.15), value: shown?.key)
        // Draws the strip again when the clock alone changes what it shows. Set again on waking, in case it woke a
        // moment early and nothing changed
        .background { Color.clear.task(id: Wake(at: wakeAt, woken: woken)) { await sleep(until: wakeAt) } }
    }

    /// Whether the chips under `key` answer a message whose replies are still being written here
    private func waits(_ key: String) -> Bool {
        guard let colon = key.firstIndex(of: ":"), ["said", "reply"].contains(key[..<colon]) else { return false }
        return waitingFor.contains(String(key[key.index(after: colon)...]))
    }

    private struct Wake: Equatable {
        let at: Double?
        let woken: Int
    }

    private struct ChipsEnd: PreferenceKey {
        static var defaultValue: CGFloat = 0
        static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
    }

    private func sleep(until wakeAt: Double?) async {
        guard let wakeAt else { return }
        let ms = max(0, wakeAt - Date().timeIntervalSince1970 * 1000)
        try? await Task.sleep(nanoseconds: UInt64(ms * 1_000_000))
        if !Task.isCancelled { woken += 1 }
    }

    private func row(_ starters: Starters, _ chips: [StarterChip]) -> some View {
        HStack(spacing: 6) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 7) {
                    ForEach(Array(chips.enumerated()), id: \.element.key) { i, chip in
                        chipButton(chip, tone: Self.tones[i % Self.tones.count])
                    }
                }
                // Equal heights; room for the chips' shadows, which the scroller would clip
                .fixedSize(horizontal: false, vertical: true)
                .padding(.leading, 12)
                .padding(.trailing, 14)
                .padding(.top, 6)
                .padding(.bottom, 7)
                .background {
                    GeometryReader { content in
                        Color.clear.preference(key: ChipsEnd.self, value: content.frame(in: .named(Self.scroller)).maxX)
                    }
                }
            }
            .coordinateSpace(name: Self.scroller)
            .onPreferenceChange(ChipsEnd.self) { chipsEnd = $0 }
            // Faded at the edge while there are more chips past it, and only then: a chip that fits keeps its border
            .mask {
                GeometryReader { box in
                    LinearGradient(
                        stops: [.init(color: .black, location: chipsEnd > box.size.width + 1 ? 0.92 : 1), .init(color: .clear, location: 1)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                }
            }
            if chips.contains(where: { $0.kind == .topic }) {
                roundButton(L.t("Other topics", lang), action: { shuffle += 1 }) {
                    EmojiArt(emoji: "🎲", size: 20)
                }
            }
            roundButton(L.t("Hide suggestions", lang), action: { dismissed = starters.key }) {
                Path { p in
                    p.move(to: CGPoint(x: 1.5, y: 1.5))
                    p.addLine(to: CGPoint(x: 8.5, y: 8.5))
                    p.move(to: CGPoint(x: 8.5, y: 1.5))
                    p.addLine(to: CGPoint(x: 1.5, y: 8.5))
                }
                .stroke(EC.ink, style: StrokeStyle(lineWidth: 2.4, lineCap: .round))
                .frame(width: 10, height: 10)
            }
        }
        .padding(.trailing, 12)
        .padding(.top, 4)
    }

    /// What a chip says, the line under it, and how to read that line out
    private func face(of chip: StarterChip) -> (say: String, sub: String?, romaji: String?) {
        if chip.kind == .game { return (L.t("Play a game?", lang), nil, nil) }
        guard let phrase = chip.phrase else { return (chip.text ?? "", nil, nil) }
        if !under { return (lang == "ja" ? phrase.ja : phrase.en, nil, nil) }
        if lang == "ja" { return (phrase.ja, phrase.en, nil) }
        return (phrase.en, phrase.ja, showRomaji && !phrase.romaji.isEmpty ? phrase.romaji : nil)
    }

    private func chipButton(_ chip: StarterChip, tone: Color) -> some View {
        let face = face(of: chip)
        let emoji = face.say.trimmingCharacters(in: .whitespacesAndNewlines)
        let shape = RoundedRectangle(cornerRadius: 16, style: .continuous)
        return Button {
            Haptics.tap()
            if chip.kind == .game { onGame?() } else { onPick(face.say) }
        } label: {
            HStack(spacing: 6) {
                if chip.kind == .game { PackIcon("ui-game", size: 20) }
                CappedWidth(max: 216) {
                    VStack(alignment: .leading, spacing: 1) {
                        if IconPack.icon(for: emoji) != nil {
                            EmojiArt(emoji: emoji, size: 22)
                        } else {
                            Text(face.say)
                                .font(.round(13, .black))
                                .foregroundStyle(EC.ink)
                        }
                        if let sub = face.sub {
                            Text(sub)
                                .font(.round(10.5, .bold))
                                .foregroundStyle(EC.inkSoft)
                        }
                        if let romaji = face.romaji {
                            Text(romaji)
                                .font(.round(10.5, .bold))
                                .italic()
                                .foregroundStyle(EC.pink)
                        }
                    }
                    .lineLimit(1)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 5)
            .frame(maxHeight: .infinity)
            .background(shape.fill(chip.kind == .game ? EC.violetSoft : tone))
            .overlay(shape.strokeBorder(EC.ink, lineWidth: 2.5))
            .background(shape.fill(EC.ink).offset(y: 3))
        }
        .buttonStyle(.pressable)
    }

    private func roundButton<Content: View>(_ label: String, action: @escaping () -> Void, @ViewBuilder content: () -> Content) -> some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            content()
                .frame(width: 30, height: 30)
                .background(Circle().fill(.white))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
        }
        .buttonStyle(.pressable)
        .accessibilityLabel(label)
    }
}

/// Its content as wide as it wants up to `max`, a line of text cut short there. A frame's maxWidth does not do it in
/// a horizontal scroller, which asks for the content's ideal width: the text would run out of the frame instead
private struct CappedWidth: Layout {
    let max: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = min(proposal.width ?? .infinity, max)
        return subviews.first?.sizeThatFits(ProposedViewSize(width: width, height: proposal.height)) ?? .zero
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        subviews.first?.place(at: bounds.origin, proposal: ProposedViewSize(width: bounds.width, height: bounds.height))
    }
}

extension StarterMessage {
    init(_ message: Message) {
        self.init(
            id: message.id,
            senderId: message.senderId,
            kind: message.kind.rawValue,
            text: message.text,
            translatedText: message.processing?.translatedText,
            suggestions: message.processing?.suggestions,
            createdAt: (message.createdAt.timeIntervalSince1970 * 1000).rounded()
        )
    }
}
