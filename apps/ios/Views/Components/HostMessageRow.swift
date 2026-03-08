import SwiftUI
import UIKit

struct HostMessageRow: View {
    let message: Message
    let sender: Participant?
    let isOwn: Bool
    let replyTarget: Message?
    let replyTargetSender: Participant?
    var reactions: [ReactionSummaryEntry] = []
    var onReply: () -> Void
    var onSuggestionTap: ((String) -> Void)?
    var onReact: ((String) -> Void)?

    private let maxBubbleWidth = UIScreen.main.bounds.width * 0.75

    @State private var showActionSheet = false

    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 0) }

            VStack(alignment: isOwn ? .trailing : .leading, spacing: 4) {
                replyPreview
                bubbleRow
                reactionsRow
                suggestionsRow
                if isOwn { timestampRow }
            }

            if !isOwn { Spacer(minLength: 0) }
        }
        .confirmationDialog("", isPresented: $showActionSheet, titleVisibility: .hidden) {
            ForEach(supportedReactions, id: \.self) { emoji in
                Button(emoji) { onReact?(emoji) }
            }
            Button("Reply") { onReply() }
            Button("Cancel", role: .cancel) {}
        }
    }

    // MARK: - Bubble row (avatar + bubble + react button)

    private var bubbleRow: some View {
        HStack(alignment: .bottom, spacing: 4) {
            if !isOwn {
                avatarColumn
            }

            HStack(alignment: .center, spacing: 4) {
                messageBubble
                    .onLongPressGesture {
                        if !isOwn { showActionSheet = true }
                    }

                if !isOwn {
                    Button { showActionSheet = true } label: {
                        Image(systemName: "heart")
                            .font(.system(size: 12))
                            .foregroundStyle(Color(.systemGray4))
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: maxBubbleWidth, alignment: isOwn ? .trailing : .leading)
        }
    }

    // MARK: - Avatar column

    private var avatarColumn: some View {
        VStack(spacing: 2) {
            if let sender {
                ZStack {
                    Circle()
                        .fill(sender.avatarColor)
                        .frame(width: 28, height: 28)
                    Text(sender.avatarEmoji)
                        .font(.system(size: 16))
                }
                Text(sender.nickname)
                    .font(.system(size: 9))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .frame(maxWidth: 40)
            }
        }
    }

    private var timestampRow: some View {
        Text(message.createdAt, style: .time)
            .font(.caption2)
            .foregroundStyle(.quaternary)
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
                Label("Photo", systemImage: "photo")
                    .font(.caption2)
                    .italic()
            case .drawing:
                Label("Drawing", systemImage: "pencil.tip")
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
                topLeadingRadius: isOwn ? 16 : 4,
                bottomLeadingRadius: 16,
                bottomTrailingRadius: isOwn ? 4 : 16,
                topTrailingRadius: 16
            ))
            .opacity(message.status == .pending ? 0.7 : 1)
    }

    @ViewBuilder
    private var bubbleContent: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Original text
            if let text = message.text {
                Text(text)
                    .font(.body)
            }

            // Media placeholder
            if message.kind == .image || message.kind == .drawing {
                if let url = message.mediaUrl {
                    AsyncImage(url: URL(string: url)) { image in
                        image.resizable().scaledToFit()
                    } placeholder: {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(.systemGray5))
                            .frame(height: 120)
                            .overlay {
                                Image(systemName: message.kind == .image ? "photo" : "pencil.tip")
                                    .foregroundStyle(.secondary)
                            }
                    }
                    .frame(maxWidth: 200)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }

            // Processing results
            if message.status == .processed, let processing = message.processing {
                VStack(alignment: .leading, spacing: 4) {
                    if let romaji = processing.romaji, !romaji.isEmpty {
                        Text(romaji)
                            .font(.caption)
                            .italic()
                            .foregroundStyle(.secondary)
                    }

                    if let translated = processing.translatedText, !translated.isEmpty {
                        Text(translated)
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                }
                .padding(.top, 6)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color(.separator))
                        .frame(height: 0.5)
                }
            }

            // Pending
            if message.status == .pending {
                HStack(spacing: 4) {
                    ProgressView()
                        .controlSize(.mini)
                    Text("Processing...")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            // Failed
            if message.status == .failed {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption2)
                    Text(message.processing?.error ?? "Processing failed")
                        .font(.caption2)
                }
                .foregroundStyle(.red)
            }
        }
    }

    // MARK: - Reactions display

    @ViewBuilder
    private var reactionsRow: some View {
        if !reactions.isEmpty {
            HStack(spacing: 4) {
                ForEach(reactions, id: \.emoji) { entry in
                    HStack(spacing: 2) {
                        Text(entry.emoji)
                            .font(.system(size: 13))
                        if entry.count > 1 {
                            Text("\(entry.count)")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color(.systemGray5))
                    .clipShape(Capsule())
                }
            }
            .padding(.leading, isOwn ? 0 : 40)
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
