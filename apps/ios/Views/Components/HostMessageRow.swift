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

    var onImageTap: ((String) -> Void)?

    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 0) }

            VStack(alignment: isOwn ? .trailing : .leading, spacing: 4) {
                replyPreview
                bubbleRow
                suggestionsRow
            }

            if !isOwn { Spacer(minLength: 0) }
        }
    }

    // MARK: - Bubble row (avatar + bubble + react button)

    private var bubbleRow: some View {
        HStack(alignment: .bottom, spacing: 4) {
            if !isOwn {
                avatarColumn
            }

            HStack(alignment: .center, spacing: 4) {
                // Reactions to the left of own bubble
                if isOwn && !reactions.isEmpty {
                    reactionChips
                }

                messageBubble
                    .onLongPressGesture {
                        onLongPress?()
                    }

                // Reactions or heart to the right of others' bubble
                if !isOwn {
                    if !reactions.isEmpty {
                        reactionChips
                    } else {
                        Button { onLongPress?() } label: {
                            Image(systemName: "heart")
                                .font(.system(size: 12))
                                .foregroundStyle(Color(.systemGray4))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .frame(maxWidth: maxBubbleWidth, alignment: isOwn ? .trailing : .leading)
        }
    }

    // MARK: - Avatar column

    private var avatarColumn: some View {
        VStack(spacing: 2) {
            ZStack {
                Circle()
                    .fill(sender?.avatarColor ?? Color(.systemGray5))
                    .frame(width: 28, height: 28)
                Text(sender?.avatarEmoji ?? "👤")
                    .font(.system(size: 16))
            }
            Text(sender?.nickname ?? "Unknown")
                .font(.system(size: 9))
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .frame(maxWidth: 40)
        }
    }

    // MARK: - Reply preview

    @ViewBuilder
    private var replyPreview: some View {
        if replyTarget != nil {
            HStack(spacing: 4) {
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(Color.accentColor.opacity(0.5))
                    .frame(width: 3)

                VStack(alignment: .leading, spacing: 1) {
                    if let name = replyTargetSender?.nickname {
                        HStack(spacing: 3) {
                            Text(replyTargetSender?.avatarEmoji ?? "")
                                .font(.caption2)
                            Text(name)
                                .font(.caption2)
                                .fontWeight(.semibold)
                        }
                    }
                    replyContentText
                }
                .foregroundStyle(.secondary)
            }
            .padding(.leading, isOwn ? 0 : 40)
        }
    }

    @ViewBuilder
    private var replyContentText: some View {
        if let replyTarget {
            switch replyTarget.kind {
            case .image:
                Label(L.t("Photo", preferredLanguage), systemImage: "photo")
                    .font(.caption2)
                    .italic()
            case .drawing:
                Label(L.t("Drawing", preferredLanguage), systemImage: "pencil.tip")
                    .font(.caption2)
                    .italic()
            default:
                Text(replyTarget.text?.prefix(60).description ?? "")
                    .font(.caption2)
                    .lineLimit(1)
            }
        }
    }

    // MARK: - Bubble

    private var messageBubble: some View {
        bubbleContent
            .padding(10)
            .background(isOwn ? Color.accentColor.opacity(0.12) : Color(.systemGray6))
            .clipShape(UnevenRoundedRectangle(
                topLeadingRadius: 16,
                bottomLeadingRadius: isOwn ? 16 : 4,
                bottomTrailingRadius: isOwn ? 4 : 16,
                topTrailingRadius: 16
            ))
            .opacity(message.status == .pending ? 0.7 : 1)
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

    @ViewBuilder
    private var bubbleContent: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Primary text — show preferred language first
            if preferredLanguage == "ja" {
                if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    Text(jp).font(.body)
                    // Romaji grouped with Japanese
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        Text(romaji)
                            .font(.caption)
                            .italic()
                            .foregroundStyle(.secondary)
                    }
                } else if showEnglish, let en = englishText, !en.isEmpty {
                    Text(en).font(.body)
                }
            } else {
                if showEnglish, let en = englishText, !en.isEmpty {
                    Text(en).font(.body)
                } else if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    Text(jp).font(.body)
                    // Romaji grouped with Japanese (fallback)
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        Text(romaji)
                            .font(.caption)
                            .italic()
                            .foregroundStyle(.secondary)
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
                                .onTapGesture { onImageTap?(url) }
                        } else {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(.systemGray5))
                                .frame(width: thumbWidth, height: 120)
                                .overlay {
                                    Image(systemName: isDrawing ? "pencil.tip" : "photo")
                                        .foregroundStyle(.secondary)
                                }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 8))
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
                        if preferredLanguage == "ja" {
                            // Romaji below divider if Japanese wasn't shown as primary
                            if hasRomajiBelow {
                                Text(processing.romaji!)
                                    .font(.caption)
                                    .italic()
                                    .foregroundStyle(.secondary)
                            }
                            if showEnglish, let en = englishText, !en.isEmpty {
                                Text(en)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        } else {
                            // Romaji + Japanese grouped below divider
                            if hasRomajiBelow {
                                Text(processing.romaji!)
                                    .font(.caption)
                                    .italic()
                                    .foregroundStyle(.secondary)
                            }
                            if showJapanese, let jp = japaneseText, !jp.isEmpty {
                                Text(jp)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    .padding(.top, 6)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(Color(.separator))
                            .frame(height: 0.5)
                    }
                }
            }

            // Pending
            if message.status == .pending {
                HStack(spacing: 4) {
                    ProgressView()
                        .controlSize(.mini)
                    Text(L.t("Processing...", preferredLanguage))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            // Failed
            if message.status == .failed {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption2)
                    Text(message.processing?.error ?? L.t("Processing failed", preferredLanguage))
                        .font(.caption2)
                }
                .foregroundStyle(.red)
            }
        }
    }

    // MARK: - Reaction chips (inline, next to bubble)

    private var reactionChips: some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(reactions, id: \.emoji) { entry in
                Button {
                    onLongPress?()
                } label: {
                    HStack(spacing: 2) {
                        Text(entry.emoji)
                            .font(.system(size: 12))
                        if entry.count > 1 {
                            Text("\(entry.count)")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Color(.systemGray5))
                    .clipShape(Capsule())
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Suggestions

    @ViewBuilder
    private var suggestionsRow: some View {
        if let suggestions = message.processing?.suggestions, !suggestions.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(suggestions.prefix(4), id: \.self) { suggestion in
                        Button {
                            onSuggestionTap?(suggestion)
                        } label: {
                            Text(suggestion)
                                .font(.caption)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color(.systemGray5))
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.leading, isOwn ? 0 : 40)
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
}
