import SwiftUI
import UIKit

struct HostMessageRow: View {
    let message: Message
    let sender: Participant?
    let isOwn: Bool
    let replyTarget: Message?
    let replyTargetSender: Participant?
    var reactions: [ReactionSummaryEntry] = []
    var preferredLanguage: String = "en"
    var onReply: () -> Void
    var onSuggestionTap: ((String) -> Void)?
    var onReact: ((String) -> Void)?
    var onLongPress: (() -> Void)?
    var showEnglish: Bool = true
    var showJapanese: Bool = true
    var showRomaji: Bool = true

    private let maxBubbleWidth = UIScreen.main.bounds.width * 0.75
    private let avatarSize: CGFloat = 36

    @AppStorage(ChatTextSize.storageKey) private var textSize: ChatTextSize = .small

    var onImageTap: ((String) -> Void)?

    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 0) }

            VStack(alignment: isOwn ? .trailing : .leading, spacing: 6) {
                replyPreview
                bubbleRow
                suggestionsRow
            }

            if !isOwn { Spacer(minLength: 0) }
        }
        .modifier(FreshMessagePop(isFresh: Date().timeIntervalSince(message.createdAt) < 8, fromTrailing: isOwn))
    }

    // MARK: - Bubble row (avatar + bubble + react button)

    private var bubbleRow: some View {
        HStack(alignment: .bottom, spacing: 6) {
            if !isOwn {
                avatarColumn
            }

            HStack(alignment: .center, spacing: 6) {
                messageBubble
                    .onLongPressGesture {
                        onLongPress?()
                    }
                    .overlay(alignment: isOwn ? .bottomTrailing : .bottomLeading) {
                        if !reactions.isEmpty {
                            reactionChips
                                .padding(.horizontal, 12)
                                .offset(y: 18)
                        }
                    }
                    .padding(.bottom, reactions.isEmpty ? 0 : 16)

                if !isOwn && reactions.isEmpty {
                    Button { onLongPress?() } label: {
                        PackIcon("re-heart", size: 18)
                            .saturation(0)
                            .opacity(0.35)
                            .frame(width: 28, height: 28)
                    }
                    .buttonStyle(.pressable)
                    .accessibilityLabel(L.t("React", preferredLanguage))
                }
            }
            .frame(maxWidth: maxBubbleWidth, alignment: isOwn ? .trailing : .leading)
        }
    }

    // MARK: - Avatar column

    private var avatarColumn: some View {
        VStack(spacing: 3) {
            if let sender {
                AvatarDisc(avatarId: sender.avatar.value, size: avatarSize)
            } else {
                Circle()
                    .fill(EC.lineSoft)
                    .frame(width: avatarSize, height: avatarSize)
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
            }
            Text(sender?.nickname ?? L.t("Unknown", preferredLanguage))
                .font(.round(10, .black))
                .foregroundStyle(EC.inkSoft)
                .lineLimit(1)
                .frame(maxWidth: 44)
        }
        .padding(.bottom, reactions.isEmpty ? 4 : 20)
    }

    // MARK: - Reply preview

    @ViewBuilder
    private var replyPreview: some View {
        if replyTarget != nil {
            HStack(spacing: 6) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(EC.pink)
                    .frame(width: 4)

                VStack(alignment: .leading, spacing: 2) {
                    if let replyTargetSender {
                        HStack(spacing: 4) {
                            AvatarDisc(avatarId: replyTargetSender.avatar.value, size: 16)
                            Text(replyTargetSender.nickname)
                                .font(.round(11, .black))
                                .foregroundStyle(EC.ink)
                        }
                    }
                    replyContentText
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxBubbleWidth * 0.85, alignment: .leading)
            .ecOutline(fill: .white.opacity(0.85), radius: 12, border: 2)
            .padding(.leading, isOwn ? 0 : avatarSize + 6)
        }
    }

    @ViewBuilder
    private var replyContentText: some View {
        if let replyTarget {
            Group {
                switch replyTarget.kind {
                case .image:
                    Label(L.t("Photo", preferredLanguage), systemImage: "photo")
                case .drawing:
                    Label(L.t("Drawing", preferredLanguage), systemImage: "pencil.tip")
                default:
                    Text(replyTarget.text?.prefix(60).description ?? "")
                }
            }
            .font(.round(11, .medium))
            .foregroundStyle(EC.inkSoft)
            .lineLimit(1)
        }
    }

    // MARK: - Bubble

    private var isPending: Bool { message.status == .pending }

    private var textColor: Color { isOwn && !isPending ? .white : EC.ink }

    private var bubbleFill: Color {
        if isPending { return EC.blueSoft }
        return isOwn ? EC.blue : .white
    }

    private var bubbleShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 20,
            bottomLeadingRadius: isOwn ? 20 : 6,
            bottomTrailingRadius: isOwn ? 6 : 20,
            topTrailingRadius: 20,
            style: .continuous
        )
    }

    private var messageBubble: some View {
        bubbleContent
            .padding(.horizontal, 14)
            .padding(.top, 10)
            .padding(.bottom, 11)
            .background(bubbleShape.fill(bubbleFill))
            .overlay(
                bubbleShape.stroke(
                    isPending ? EC.blue : EC.ink,
                    style: StrokeStyle(lineWidth: 3, dash: isPending ? [7, 5] : [])
                )
            )
            .background(bubbleShape.fill(isPending ? EC.blue.opacity(0.5) : EC.ink).offset(y: 5))
            .padding(.bottom, 5)
    }

    /// Determine if the original message text is Japanese
    private var isOriginalJapanese: Bool {
        guard let text = message.text, !text.isEmpty else { return false }
        // Check if text contains any Japanese characters (Hiragana, Katakana, CJK)
        return text.unicodeScalars.contains { scalar in
            let v = scalar.value
            return (0x3040...0x309F).contains(v) ||  // Hiragana
                   (0x30A0...0x30FF).contains(v) ||  // Katakana
                   (0x4E00...0x9FFF).contains(v)     // CJK
        }
    }

    /// The English text (original or translated, whichever is English)
    private var englishText: String? {
        if isOriginalJapanese {
            return message.processing?.translatedText
        } else {
            return message.text
        }
    }

    /// The Japanese text (original or translated, whichever is Japanese)
    private var japaneseText: String? {
        if isOriginalJapanese {
            return message.text
        } else {
            return message.processing?.translatedText
        }
    }

    private func primaryText(_ text: String) -> some View {
        Text(text)
            .font(.round(16 * textSize.scale, .black))
            .foregroundStyle(textColor)
            .fixedSize(horizontal: false, vertical: true)
    }

    private func romajiText(_ text: String) -> some View {
        Text(text)
            .font(.round(12 * textSize.scale, .bold))
            .italic()
            .foregroundStyle(isOwn && !isPending ? EC.pinkSoft : EC.pink)
            .fixedSize(horizontal: false, vertical: true)
    }

    private func translationLine(_ text: String, tag: String) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(tag)
                .font(.round(10, .black))
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 5)
                .padding(.vertical, 1)
                .background(RoundedRectangle(cornerRadius: 5).fill(EC.yellow))
                .overlay(RoundedRectangle(cornerRadius: 5).strokeBorder(EC.ink, lineWidth: 1.5))
            Text(text)
                .font(.round(14 * textSize.scale, .bold))
                .foregroundStyle(textColor)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    @ViewBuilder
    private var bubbleContent: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Primary text — show preferred language first
            if preferredLanguage == "ja" {
                if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    primaryText(jp)
                    // Romaji grouped with Japanese
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        romajiText(romaji)
                    }
                } else if showEnglish, let en = englishText, !en.isEmpty {
                    primaryText(en)
                }
            } else {
                if showEnglish, let en = englishText, !en.isEmpty {
                    primaryText(en)
                } else if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    primaryText(jp)
                    // Romaji grouped with Japanese (fallback)
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        romajiText(romaji)
                    }
                }
            }

            // Media
            if message.kind == .image || message.kind == .drawing {
                if let url = message.mediaUrl {
                    let isDrawing = message.kind == .drawing
                    let thumbWidth: CGFloat = 200

                    AsyncImage(url: URL(string: url)) { phase in
                        if let image = phase.image {
                            image.resizable()
                                .scaledToFit()
                                .frame(maxWidth: thumbWidth)
                                .background(Color.white)
                                .onTapGesture { onImageTap?(url) }
                        } else {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(isOwn ? Color.white.opacity(0.25) : EC.blueSoft)
                                .frame(width: thumbWidth, height: 120)
                                .overlay {
                                    PackIcon(isDrawing ? "g-pencil" : "ui-photo", size: 36)
                                        .opacity(0.7)
                                }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(EC.ink, lineWidth: 2.5))
                    .padding(.vertical, 2)
                }
            }

            // Secondary content — always: divider between English and Japanese/Romaji
            if message.status == .processed, let processing = message.processing {
                let hasSecondary: Bool = {
                    if preferredLanguage == "ja" {
                        let primaryShowedJapanese = showJapanese && !(japaneseText ?? "").isEmpty
                        return primaryShowedJapanese && showEnglish && !(englishText ?? "").isEmpty
                    } else {
                        let primaryShowedEnglish = showEnglish && !(englishText ?? "").isEmpty
                        return primaryShowedEnglish && showJapanese && !(japaneseText ?? "").isEmpty
                    }
                }()
                // Romaji below divider only if not already shown with Japanese in primary
                let romajiAvailable = showRomaji && !(processing.romaji ?? "").isEmpty
                let romajiShownInPrimary: Bool = {
                    if preferredLanguage == "ja" {
                        return showJapanese && !(japaneseText ?? "").isEmpty
                    } else {
                        // Japanese was fallback primary (English not shown)
                        let englishShown = showEnglish && !(englishText ?? "").isEmpty
                        return !englishShown && showJapanese && !(japaneseText ?? "").isEmpty
                    }
                }()
                let hasRomajiBelow = romajiAvailable && !romajiShownInPrimary

                if hasSecondary || hasRomajiBelow {
                    VStack(alignment: .leading, spacing: 4) {
                        DashedRule(color: isOwn ? .white.opacity(0.45) : EC.lineSoft)
                            .padding(.bottom, 4)
                        if preferredLanguage == "ja" {
                            // Romaji below divider if Japanese wasn't shown as primary
                            if hasRomajiBelow {
                                romajiText(processing.romaji!)
                            }
                            if showEnglish, let en = englishText, !en.isEmpty {
                                translationLine(en, tag: "EN")
                            }
                        } else {
                            // Romaji + Japanese grouped below divider
                            if hasRomajiBelow {
                                romajiText(processing.romaji!)
                            }
                            if showJapanese, let jp = japaneseText, !jp.isEmpty {
                                translationLine(jp, tag: "JA")
                            }
                        }
                    }
                    .padding(.top, 4)
                }
            }

            // Pending
            if isPending {
                HStack(spacing: 6) {
                    Text(L.t("Processing...", preferredLanguage))
                        .font(.round(11, .black))
                        .foregroundStyle(EC.blue)
                    PendingDots()
                }
                .padding(.top, 2)
            }

            // Failed
            if message.status == .failed {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 11, weight: .bold))
                    Text(message.processing?.error ?? L.t("Processing failed", preferredLanguage))
                        .font(.round(11, .black))
                }
                .foregroundStyle(isOwn ? EC.yellow : EC.red)
                .padding(.top, 2)
            }
        }
    }

    // MARK: - Reaction chips (overlapping the bubble's bottom edge)

    private var reactionChips: some View {
        HStack(spacing: 5) {
            ForEach(reactions, id: \.emoji) { entry in
                Button {
                    onLongPress?()
                } label: {
                    HStack(spacing: 3) {
                        EmojiArt(emoji: entry.emoji, size: 18)
                        if entry.count > 1 {
                            Text("\(entry.count)")
                                .font(.chunky(12))
                                .foregroundStyle(EC.ink)
                        }
                    }
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(entry.count > 1 ? EC.pinkSoft : .white))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                    .background(Capsule().fill(EC.ink).offset(y: 2))
                }
                .buttonStyle(.pressable)
                .transition(.scale(scale: 0.3).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.5), value: reactions.map { "\($0.emoji)\($0.count)" })
    }

    // MARK: - Suggestions

    private static let suggestionFills = [EC.pinkSoft, EC.blueSoft, EC.mintSoft, EC.yellowSoft]

    @ViewBuilder
    private var suggestionsRow: some View {
        if let suggestions = message.processing?.suggestions, !suggestions.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(Array(suggestions.prefix(4).enumerated()), id: \.element) { i, suggestion in
                        Button {
                            Haptics.tap()
                            onSuggestionTap?(suggestion)
                        } label: {
                            Text(suggestion)
                                .font(.round(12, .black))
                                .foregroundStyle(EC.ink)
                                .padding(.horizontal, 11)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(Self.suggestionFills[i % Self.suggestionFills.count]))
                                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                                .background(Capsule().fill(EC.ink).offset(y: 3))
                                .padding(.bottom, 3)
                        }
                        .buttonStyle(.pressable)
                    }
                }
                .padding(.vertical, 2)
            }
            .padding(.leading, isOwn ? 0 : avatarSize + 6)
        }
    }
}

/// Bouncing "…" while a message is being translated
private struct PendingDots: View {
    var body: some View {
        LoopClock { t in
            HStack(spacing: 3) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill([EC.blue, EC.pink, EC.mint][i])
                        .frame(width: 6, height: 6)
                        .offset(y: -1.5 - 1.5 * loopWave(t, period: 0.7, delay: Double(i) * 0.12))
                }
            }
        }
    }
}

/// Springs a just-arrived message in; rows re-created by lazy scrolling stay put.
private struct FreshMessagePop: ViewModifier {
    let isFresh: Bool
    let fromTrailing: Bool
    @State private var shown = false

    func body(content: Content) -> some View {
        let hidden = isFresh && !shown
        content
            .scaleEffect(hidden ? 0.6 : 1, anchor: fromTrailing ? .bottomTrailing : .bottomLeading)
            .opacity(hidden ? 0 : 1)
            .onAppear {
                guard isFresh, !shown else { return }
                withAnimation(.spring(response: 0.38, dampingFraction: 0.62)) { shown = true }
            }
    }
}

#Preview {
    let sender = Participant(
        id: "p1", roomId: "r", nickname: "Alice", role: .participant, platform: .web,
        avatar: AvatarConfig(type: .preset, value: "cat"), preferredLanguage: "en",
        online: true, lastSeenAt: Date(), joinedAt: Date()
    )
    let message = Message(
        id: "m1", roomId: "r", senderId: "p1", kind: .text, status: .processed,
        text: "こんにちは！",
        processing: ProcessingState(
            translatedText: "Hello!",
            romaji: "Konnichiwa!",
            suggestions: ["Nice to meet you", "Hi there!"]
        ),
        createdAt: Date()
    )

    VStack {
        HostMessageRow(
            message: message, sender: sender, isOwn: false,
            replyTarget: nil, replyTargetSender: nil,
            onReply: {}
        )
    }
    .padding()
    .ecPaperBackground()
}
