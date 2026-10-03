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
    var onSave: (() -> Void)?
    var onDelete: () -> Void

    @State private var appeared = false

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(EC.ink.opacity(0.35))
                .opacity(appeared ? 1 : 0)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            VStack(spacing: 12) {
                // Reaction emoji row above; a message that has not reached the server cannot be reacted to
                if message.sendState == nil {
                    reactionBar
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 10)
                }

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
        HStack(spacing: 6) {
            ForEach(Array(supportedReactions.enumerated()), id: \.element) { i, emoji in
                Button {
                    Haptics.tap()
                    onReact(emoji)
                    dismiss()
                } label: {
                    EmojiArt(emoji: emoji, size: 28)
                        .frame(width: 42, height: 42)
                        .background(Circle().fill(isEmojiSelected(emoji) ? EC.yellow : .white))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: isEmojiSelected(emoji) ? 3 : 2))
                        .scaleEffect(appeared ? 1 : 0.3)
                        .animation(.spring(response: 0.35, dampingFraction: 0.55).delay(Double(i) * 0.03), value: appeared)
                }
                .buttonStyle(.pressable)
                .accessibilityLabel(emoji)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Capsule().fill(EC.paper))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 3))
        .background(Capsule().fill(EC.ink).offset(y: 5))
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
            showRomaji: showRomaji,
            onImageTap: nil
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

            actionDivider

            actionButton(
                title: L.t("Copy", preferredLanguage),
                icon: "doc.on.doc"
            ) {
                onCopy()
                dismiss()
            }

            if let onSave {
                actionDivider

                actionButton(
                    title: L.t("Save", preferredLanguage),
                    icon: "square.and.arrow.down"
                ) {
                    onSave()
                    dismiss()
                }
            }

            actionDivider

            actionButton(
                title: L.t("Delete", preferredLanguage),
                icon: "trash",
                isDestructive: true
            ) {
                onDelete()
                dismiss()
            }
        }
        .padding(.vertical, 4)
        .ecCard(radius: 20, border: 3, shadow: 5)
        .padding(.horizontal, 32)
    }

    private var actionDivider: some View {
        Rectangle().fill(EC.lineSoft).frame(width: 2, height: 28)
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
                    .font(.system(size: 18, weight: .bold))
                Text(title)
                    .font(.round(12, .black))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .foregroundStyle(isDestructive ? EC.red : EC.ink)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 9)
            .contentShape(Rectangle())
        }
        .buttonStyle(.pressable)
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
