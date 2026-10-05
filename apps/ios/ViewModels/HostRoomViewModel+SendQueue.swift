import Foundation
import NaturalLanguage
import Translation

extension HostRoomViewModel {
    // MARK: - Offline queue

    /// Messages waiting to go out. One the server refused is not waiting: it says so on its bubble
    var pendingQueueCount: Int { offlineQueue.filter(\.isWaiting).count }
    /// A waiting message has already failed once: sending is held up although the phone reports a connection
    var isSendDelayed: Bool { offlineQueue.contains { $0.isWaiting && $0.attempts > 0 } }

    func enqueue(_ queued: QueuedMessage) {
        offlineQueue.append(queued)
        mergeQueueIntoMessages()
        // On-device translation is for a message that has to wait (offline, or behind one being retried).
        // One that goes straight out is translated by the server and the host pipeline, as before.
        if queued.kind == .text, !networkMonitor.isConnected || isSendDelayed {
            // Signal OfflineTranslator to re-trigger .translationTask via invalidate()
            offlineQueueVersion += 1
        }
        kickFlush()
    }

    func mergeQueueIntoMessages() {
        // Remove old placeholders
        var merged = messages.filter { !$0.isQueuedPlaceholder }
        // Drop queued messages the server's list now contains: from here on the server's copy is the row
        if !offlineQueue.isEmpty {
            let serverIds = Set(merged.map(\.id))
            var realIdByClientId: [String: String] = [:]
            for message in merged {
                // Only the host's own: the server tells repeats apart by sender too, so another sender may carry the same clientId
                if let clientId = message.clientId, message.senderId == hostId { realIdByClientId[clientId] = message.id }
            }
            var delivered = Set<String>()
            for queued in offlineQueue {
                if let sent = queued.sentMessageId, serverIds.contains(sent) {
                    delivered.insert(queued.id)
                } else if let real = realIdByClientId[queued.clientId] {
                    // The send's answer was lost but the message is there
                    sentIds[queued.id] = real
                    delivered.insert(queued.id)
                }
            }
            if !delivered.isEmpty { offlineQueue.removeAll { delivered.contains($0.id) } }
        }
        // Append current queue as placeholder messages
        let placeholders = offlineQueue.map {
            $0.toPlaceholderMessage(roomId: roomId, senderId: hostId)
        }
        // Every placeholder goes last, in the order it was sent. One still on its way will be stamped by the server later
        // than everything listed, and sorting it by the phone's clock could put it above a message it follows. A refused
        // one stays there too: moved to its place in time when it turns "Not sent", it would leave the screen unnoticed
        merged.sort { $0.createdAt < $1.createdAt }
        merged.append(contentsOf: placeholders)
        // One assignment, so the list is published once per merge
        messages = merged
    }

    /// Called by the view's `.translationTask` with the session for a given direction.
    @available(iOS 18.0, *)
    func translateQueueBatch(session: TranslationSession, fromLang: String) async {
        var didTranslate = false
        let romajiService = MeCabRomajiService.shared

        // A snapshot of ids, not indices: the queue changes during the awaits below (a send finishes, a bubble is deleted)
        let candidates: [(id: String, text: String)] = offlineQueue.compactMap { queued in
            guard queued.kind == .text, queued.sentMessageId == nil, !queued.processingAttempted,
                  let text = queued.text, !text.isEmpty else { return nil }
            return (id: queued.id, text: text)
        }
        for candidate in candidates {
            let text = candidate.text
            guard detectLanguage(text) == fromLang else { continue }

            do {
                let response = try await session.translate(text)
                let translatedText = response.targetText
                let isJapanese = (fromLang == "ja")
                let romajiSource = isJapanese ? text : translatedText
                let romaji = try? await romajiService.transliterateJapaneseToRomaji(text: romajiSource)

                // Find the message again by id; skip it if it was sent or deleted meanwhile
                guard let index = offlineQueue.firstIndex(where: { $0.id == candidate.id }),
                      offlineQueue[index].sentMessageId == nil else { continue }
                offlineQueue[index].processing = ProcessingState(
                    translatedText: translatedText,
                    romaji: romaji,
                    suggestions: nil
                )
                offlineQueue[index].processingAttempted = true
                didTranslate = true
            } catch {
                // Translation failed — leave processingAttempted false so it retries
                DebugConsole.shared.trace(source: .processing, action: "offline:translate:error", detail: error.localizedDescription, ok: false)
            }
        }
        if didTranslate {
            mergeQueueIntoMessages()
        }
    }

    private func detectLanguage(_ text: String) -> String {
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(text)
        return recognizer.dominantLanguage == .japanese ? "ja" : "en"
    }

    func handleReconnect() {
        // Back online: do not sit out a backoff earned while the connection was bad
        for index in offlineQueue.indices { offlineQueue[index].nextAttemptAt = .distantPast }
        kickFlush()
        Task { [weak self] in await self?.refresh() }
    }

    private enum FlushStep { case sent, skipped, stop }

    /// Blamed failures before a message is marked failed and the queue moves on. Blamed are the ones that can be about
    /// this one message, which would otherwise hold up everything behind it: a retryable status the server answered
    /// with, and a photo or drawing that does not get through while the room's own polls do. A text that fails in
    /// transit is never blamed, so an outage does not mark it failed.
    private static let maxServerAttempts = 5
    /// Timed-out attempts at a photo or drawing before it is marked failed: each one has already held the
    /// queue for up to a minute
    private static let maxMediaTimeouts = 2
    /// Refusals for sending too fast before a message is marked failed. The server's allowance is per minute and
    /// the sixth attempt comes a minute after the first, so a throttled message goes out once the minute is over.
    /// A ceiling all the same: a server that never stops refusing must not hold the queue for good
    private static let maxThrottledAttempts = 7

    /// 2, 4, 8, 16, then 30 s; checked on the poll, so a retry lands up to one poll later
    private static func retryDelay(afterAttempts attempts: Int) -> TimeInterval {
        min(30, pow(2, Double(attempts)))
    }

    /// Starts a pass over the send queue unless one is running
    func kickFlush() {
        guard !isFlushing, networkMonitor.isConnected,
              let next = offlineQueue.first(where: { $0.isWaiting }), next.nextAttemptAt <= Date() else { return }
        // Set here, synchronously, so two kicks in one turn cannot start two passes
        isFlushing = true
        flushTask = Task { [weak self] in
            var delivered = false
            while !Task.isCancelled, let step = await self?.sendNextQueued(), step != .stop {
                if step == .sent { delivered = true }
            }
            self?.isFlushing = false
            if delivered, !Task.isCancelled { await self?.refresh() }
        }
    }

    /// Sends the oldest waiting message. `.stop` ends the pass: nothing is due, offline, cancelled, or a failure worth
    /// retrying (nothing behind it may go first)
    private func sendNextQueued() async -> FlushStep {
        guard networkMonitor.isConnected,
              let queued = offlineQueue.first(where: { $0.isWaiting }),
              queued.nextAttemptAt <= Date() else { return .stop }
        // Lets deleteMessage tell whether the bubble it removes is the one in flight
        sendingId = queued.id
        defer { if sendingId == queued.id { sendingId = nil } }
        do {
            let messageId = try await send(queued)
            guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else {
                // Gone during the request. If a poll already saw it on the server it is in sentIds;
                // otherwise the host deleted it: take it back
                if sentIds[queued.id] == nil { try? await api.deleteMessage(messageId: messageId) }
                return .sent
            }
            offlineQueue[index].sentMessageId = messageId
            offlineQueue[index].attempts = 0
            sentIds[queued.id] = messageId
            let processing = offlineQueue[index].processing
            mergeQueueIntoMessages()
            if queued.kind == .text, let processing {
                try? await api.submitProcessedMessage(messageId: messageId, processing: processing)
            }
            return .sent
        } catch {
            // Stopping the pass is not a failure of the message
            if Task.isCancelled || error.isCancellation { return .stop }
            DebugConsole.shared.trace(source: .network, action: "send:error", detail: error.localizedDescription, ok: false)
            guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else { return .skipped }
            var serverAnswered = false
            // The wording the server's limits use (messages.ts: TOO_FAST)
            var throttled = false
            if let apiError = error as? APIError, case .http(let status, let message) = apiError {
                serverAnswered = true
                throttled = status == 503 && message.contains("rate limit")
            }
            let attempts = offlineQueue[index].attempts + 1
            // Counted apart from `attempts`: timeouts in a dead spot must not use up the allowance, or the first 5xx
            // after them would mark the message failed
            let roomReachable = networkMonitor.isConnected && consecutivePollFailures == 0
            let mediaBlamed = queued.kind != .text && roomReachable
            let blamed = offlineQueue[index].blamedFailures + ((serverAnswered || mediaBlamed) ? 1 : 0)
            let slow = mediaBlamed && !serverAnswered && (error as? URLError)?.code == .timedOut
            let allowed = slow ? Self.maxMediaTimeouts : (throttled ? Self.maxThrottledAttempts : Self.maxServerAttempts)
            if error.isRetryableNetworkFailure, blamed < allowed {
                offlineQueue[index].attempts = attempts
                offlineQueue[index].blamedFailures = blamed
                offlineQueue[index].nextAttemptAt = Date().addingTimeInterval(Self.retryDelay(afterAttempts: attempts))
                // It is going to wait: translate it on the device meanwhile, as for a message queued offline
                if attempts == 1 { offlineQueueVersion += 1 }
                mergeQueueIntoMessages()
                return .stop
            }
            offlineQueue[index].sendFailed = true
            mergeQueueIntoMessages()
            return .skipped
        }
    }

    /// One attempt at one queued message; returns the server's message id
    private func send(_ queued: QueuedMessage) async throws -> String {
        // A reply to a bubble that was itself queued: its server id by now, or no reply if it never went out
        let replyToId = serverMessageId(queued.replyToId)
        switch queued.kind {
        case .text:
            return try await api.sendTextMessage(
                roomId: roomId,
                senderId: hostId,
                text: queued.text ?? "",
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .image:
            let storageId: String
            if let uploaded = queued.storageId {
                storageId = uploaded
            } else {
                // Decode base64 data URL back to raw data for Convex storage upload
                let mediaUrl = queued.mediaUrl ?? ""
                guard let comma = mediaUrl.firstIndex(of: ","),
                      let imageData = Data(base64Encoded: String(mediaUrl[mediaUrl.index(after: comma)...])) else {
                    throw APIError.serverError("Invalid image data")
                }
                let contentType = mediaUrl.hasPrefix("data:image/png") ? "image/png" : "image/jpeg"
                let uploadUrl = try await api.generateUploadUrl()
                storageId = try await api.uploadData(imageData, to: uploadUrl, contentType: contentType)
                // Deleted while it uploaded: do not post a photo only to take it back
                guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else {
                    throw APIError.serverError("Deleted before it was sent")
                }
                offlineQueue[index].storageId = storageId
            }
            return try await api.sendImageMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .drawing:
            return try await api.sendDrawingMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: queued.mediaUrl ?? "",
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .system, .audio, .unknown:
            throw APIError.serverError("Unsupported queued message")
        }
    }

    /// Retry on a failed bubble: back in line, same clientId
    func retrySend(id: String) {
        guard let index = offlineQueue.firstIndex(where: { $0.id == id }), offlineQueue[index].sendFailed else { return }
        offlineQueue[index].sendFailed = false
        offlineQueue[index].attempts = 0
        offlineQueue[index].blamedFailures = 0
        offlineQueue[index].nextAttemptAt = .distantPast
        offlineQueue[index].storageId = nil
        mergeQueueIntoMessages()
        kickFlush()
    }
}
