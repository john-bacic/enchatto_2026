import SwiftUI

struct MessageContextMenuOverlay: View {
    let message: Message
    let sender: Participant?
    let isOwn: Bool
    let replyTarget: Message?
    let replyTargetSender: Participant?
    let reactions: [ReactionSummaryEntry]
    let hostId: String
    let preferredLanguage: String
    let sourceFrame: CGRect
    var showEnglish: Bool = true
    var showJapanese: Bool = true
    var showRomaji: Bool = true
    @Binding var isPresented: Bool

    var onReact: (String) -> Void
    var onReply: () -> Void
    var onCopy: () -> Void
    var onDelete: () -> Void

    @State private var appeared = false

    var body: some View {
        ZStack {
            // Dimmed blurred background
            Color.black.opacity(appeared ? 0.4 : 0)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            VStack(spacing: 12) {
                // Reaction emoji row above
                reactionBar
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 10)

                // Isolated message bubble
                messageBubbleClone
                    .scaleEffect(appeared ? 1.02 : 1.0)

                // Action buttons below
                actionButtons
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -10)
            }
            .position(
                x: UIScreen.main.bounds.width / 2,
                y: clampedVerticalCenter
            )
        }
        .onAppear {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }

    // MARK: - Vertical positioning

    private var clampedVerticalCenter: CGFloat {
        let screenHeight = UIScreen.main.bounds.height
        let contentHeight: CGFloat = 60 + sourceFrame.height + 120
        let idealY = sourceFrame.midY
        let minY = contentHeight / 2 + 60
        let maxY = screenHeight - contentHeight / 2 - 40
        return min(max(idealY, minY), maxY)
    }

    // MARK: - Reaction bar

    private var reactionBar: some View {
        HStack(spacing: 8) {
            ForEach(supportedReactions, id: \.self) { emoji in
                Button {
                    onReact(emoji)
                    dismiss()
                } label: {
                    Text(emoji)
                        .font(.system(size: 28))
                        .padding(6)
                        .background(
                            isEmojiSelected(emoji)
                                ? Color.accentColor.opacity(0.2)
                                : Color(.systemGray6)
                        )
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
    }

    private func isEmojiSelected(_ emoji: String) -> Bool {
        reactions.contains { $0.emoji == emoji && $0.participantIds.contains(hostId) }
    }

    // MARK: - Message clone

    private var messageBubbleClone: some View {
        HostMessageRow(
            message: message,
            sender: sender,
            isOwn: isOwn,
            replyTarget: replyTarget,
            replyTargetSender: replyTargetSender,
            reactions: reactions,
            preferredLanguage: preferredLanguage,
            onReply: {},
            onSuggestionTap: nil,
            onReact: nil,
            onLongPress: nil,
            showEnglish: showEnglish,
            showJapanese: showJapanese,
            showRomaji: showRomaji
        )
        .allowsHitTesting(false)
        .padding(.horizontal)
    }

    // MARK: - Action buttons

    private var actionButtons: some View {
        HStack(spacing: 0) {
            actionButton(
                title: L.t("Reply", preferredLanguage),
                icon: "arrowshape.turn.up.left.fill"
            ) {
                onReply()
                dismiss()
            }

            Divider().frame(height: 20)

            actionButton(
                title: L.t("Copy", preferredLanguage),
                icon: "doc.on.doc"
            ) {
                onCopy()
                dismiss()
            }

            Divider().frame(height: 20)

            actionButton(
                title: L.t("Delete", preferredLanguage),
                icon: "trash",
                isDestructive: true
            ) {
                onDelete()
                dismiss()
            }
        }
        .padding(.vertical, 6)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.horizontal, 40)
    }

    private func actionButton(
        title: String,
        icon: String,
        isDestructive: Bool = false,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                Text(title)
                    .font(.caption)
            }
            .foregroundStyle(isDestructive ? .red : .primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Dismiss

    private func dismiss() {
        withAnimation(.spring(response: 0.25, dampingFraction: 0.9)) {
            appeared = false
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
            isPresented = false
        }
    }
}
