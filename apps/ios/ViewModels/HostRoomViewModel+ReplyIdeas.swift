import Foundation

extension HostRoomViewModel {
    /// The strip answers a message for this long after it was said; replies written later would not be shown
    private static let replyIdeasFreshFor = ConversationStarters.lullMs / 1000
    /// How many messages the model reads, the one it answers the last
    private static let replyContextLines = 8

    /// Has replies written on this phone by Apple's on-device model for the newest message someone said, while the
    /// strip still answers it, and for `replyToId`, the message being replied to. The host's are uploaded as well, for
    /// everyone else's strip: a web guest has no model of its own. Nothing on a phone without the model
    func considerReplyIdeas(replyingTo replyToId: String? = nil) {
        guard room?.settings.suggestionsEnabled == true else { return }
        var wanted: [Message] = []
        // The host's own message too: the others answer it
        if let newest = messages.last(where: { $0.kind != .system && $0.kind != .unknown }),
           Date().timeIntervalSince(newest.createdAt) < Self.replyIdeasFreshFor,
           isHost || newest.senderId != hostId {
            wanted.append(newest)
        }
        if let replyToId, let target = message(withId: replyToId), target.senderId != hostId {
            wanted.append(target)
        }
        let fresh = wanted.filter { answerable($0) && !replyIdeasAsked.contains($0.id) && !replyIdeasWaiting.contains($0.id) }
        guard !fresh.isEmpty, #available(iOS 26.0, *), ReplyIdeaWriter.isAvailable else { return }
        // A busy room moves on: only the latest two wait
        replyIdeasWaiting = Array((replyIdeasWaiting + fresh.map(\.id)).suffix(2))
        writeNextReplyIdeas()
    }

    /// Words someone said, already on the server: a text, or a voice message once it has its transcript
    private func answerable(_ message: Message) -> Bool {
        (message.kind == .text || message.kind == .audio) && !message.isQueuedPlaceholder
            && !(message.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// One at a time: the model answers one request at a time, and a phone has other work
    @available(iOS 26.0, *)
    private func writeNextReplyIdeas() {
        guard replyIdeaTask == nil, let id = replyIdeasWaiting.popLast() else { return }
        guard let target = message(withId: id) else { return writeNextReplyIdeas() }
        replyIdeasAsked.insert(id)
        let chat = replyContext(endingWith: target)
        let uploads = isHost
        replyIdeaTask = Task { [weak self] in
            let replies = await ReplyIdeaWriter.replies(to: chat)
            guard let self else { return }
            self.replyIdeaTask = nil
            if !replies.isEmpty {
                let recent = Set(self.messages.suffix(30).map(\.id))
                self.replyIdeas = self.replyIdeas.filter { recent.contains($0.key) }.merging([id: replies]) { $1 }
                // Nothing to do about a failure: the others' strips offer the deck's replies instead
                if uploads { try? await self.api.setSuggestedReplies(messageId: id, replies: replies) }
            }
            self.writeNextReplyIdeas()
        }
    }

    /// What the model reads: the words said up to `target`, `target` the last of them
    private func replyContext(endingWith target: Message) -> [ReplyIdeas.Line] {
        guard let end = messages.firstIndex(where: { $0.id == target.id }) else { return [] }
        return messages[...end].filter(answerable).suffix(Self.replyContextLines).map {
            ReplyIdeas.Line(
                name: participant(for: $0.senderId)?.nickname ?? "Someone",
                text: $0.text ?? "",
                translation: $0.processing?.translatedText
            )
        }
    }
}
