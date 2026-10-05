import Foundation
import UIKit

extension HostRoomViewModel {
    // MARK: - Actions

    /// Queues a text message and starts sending. The bubble is in `messages` when this returns
    func sendMessage(_ text: String, replyToId: String? = nil, clientId: String = UUID().uuidString) {
        // The server trims too; trimming here keeps a newline-only text from becoming a refused message
        let text = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        enqueue(QueuedMessage(text: text, replyToId: replyToId, clientId: clientId))
    }

    /// Uploads a recorded clip as a voice message. Audio can't wait in the offline queue,
    /// so if it can't go out the transcript is sent as a text message instead; with no transcript the host is told.
    func sendVoice(_ clip: VoiceClipFile, text: String, replyToId: String? = nil) async {
        defer { try? FileManager.default.removeItem(at: clip.url) }
        let transcript = text.trimmingCharacters(in: .whitespacesAndNewlines)
        // One id for the clip and for the text that replaces it: if the clip did arrive, the text is not a second message
        let clientId = UUID().uuidString
        // Set once send-audio is on its way: from then on a failure does not say whether the message was made
        var audioRequestOut = false
        do {
            guard networkMonitor.isConnected else { throw APIError.serverError("Offline") }
            let data = try Data(contentsOf: clip.url)
            func upload() async throws -> String {
                let uploadUrl = try await api.generateUploadUrl()
                return try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
            }
            let storageId: String
            do {
                storageId = try await upload()
            } catch let error where error.isRetryableNetworkFailure {
                // No message exists before send-audio, so the upload can be repeated whatever became of the first try.
                // send-audio itself is not repeated here: its request may have arrived (the client repeats a 5xx answer once)
                try await Task.sleep(nanoseconds: 1_000_000_000)
                storageId = try await upload()
            }
            audioRequestOut = true
            _ = try await api.sendAudioMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                durationMs: clip.durationMs,
                waveform: clip.waveform,
                text: transcript.isEmpty ? nil : transcript,
                replyToId: serverMessageId(replyToId),
                clientId: clientId
            )
            await refresh()
        } catch {
            DebugConsole.shared.trace(source: .network, action: "sendVoice:error", detail: error.localizedDescription, ok: false)
            if !transcript.isEmpty {
                sendMessage(transcript, replyToId: replyToId, clientId: clientId)
            } else if !Task.isCancelled, !error.isCancellation {
                // The answer may be what was lost: look for the clip before telling the host to record it again
                if audioRequestOut {
                    await refresh()
                    if messages.contains(where: { $0.clientId == clientId && $0.senderId == hostId }) { return }
                }
                // Nothing to send in its place and the recording is gone: say so instead of dropping it without a sign
                self.error = L.t("Couldn't send. Try again.", hostLanguage)
            }
        }
    }

    /// Dictation text made on the server from the recording (device recognizer unusable); nil on failure
    func transcribeDictation(_ clip: VoiceClipFile) async -> String? {
        defer { try? FileManager.default.removeItem(at: clip.url) }
        do {
            guard networkMonitor.isConnected else { throw APIError.serverError("Offline") }
            let data = try Data(contentsOf: clip.url)
            let uploadUrl = try await api.generateUploadUrl()
            let storageId = try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
            let text = try await api.transcribeDictation(roomId: roomId, senderId: hostId, storageId: storageId)
            return text?.trimmingCharacters(in: .whitespacesAndNewlines)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "transcribeDictation:error", detail: error.localizedDescription, ok: false)
            return nil
        }
    }

    func sendImage(_ image: UIImage, replyToId: String? = nil) {
        guard let data = image.jpegData(compressionQuality: 0.7) else { return }
        let base64 = data.base64EncodedString()
        let queued = QueuedMessage(kind: .image, mediaUrl: "data:image/jpeg;base64,\(base64)", replyToId: replyToId)
        // The bubble draws from this, as a placeholder and as the server's copy, instead of loading the picture again
        SentPictures.store(image, clientId: queued.clientId)
        enqueue(queued)
    }

    func sendDrawing(_ image: UIImage, replyToId: String? = nil) {
        guard let data = image.pngData() else { return }
        let base64 = data.base64EncodedString()
        let queued = QueuedMessage(kind: .drawing, mediaUrl: "data:image/png;base64,\(base64)", replyToId: replyToId)
        SentPictures.store(image, clientId: queued.clientId)
        enqueue(queued)
    }

    func addReaction(messageId: String, emoji: String) async {
        // A message that has not reached the server cannot be reacted to
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.addReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func removeReaction(messageId: String, emoji: String) async {
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.removeReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func deleteMessage(messageId: String) async {
        // A queued message is dropped here; the request is only needed once the server has it
        if messageId.hasPrefix("queued-") {
            // A photo still uploading keeps the pass, and every message behind it, waiting for that request to end.
            // Only then: once send-image (or a text or drawing send) is out, the request may already have made the
            // message, and the pass has to hear the answer to take it back
            let uploading = sendingId == messageId
                && offlineQueue.contains { $0.id == messageId && $0.kind == .image && $0.storageId == nil }
            offlineQueue.removeAll { $0.id == messageId }
            mergeQueueIntoMessages()
            // The next poll starts a new pass for what is left
            if uploading { flushTask?.cancel() }
        }
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.deleteMessage(messageId: messageId)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func replyTarget(for message: Message) -> Message? {
        guard let replyToId = message.replyToId else { return nil }
        return self.message(withId: replyToId)
    }

    /// A message by id; a local "queued-…" id still resolves after the server's copy has replaced the placeholder
    func message(withId id: String) -> Message? {
        if let found = messages.first(where: { $0.id == id }) { return found }
        guard let sent = sentIds[id] else { return nil }
        return messages.first { $0.id == sent }
    }

    /// Whether the server's copy of a message replaced a placeholder that was already on this screen. Known from
    /// the send's own answer, so it does not depend on the server echoing the clientId (one from before
    /// clientId existed does not)
    func wasSentFromThisDevice(_ messageId: String) -> Bool {
        deliveredIds.contains(messageId)
    }

    /// The id the server knows a message by; nil for one that has not been delivered. A local id is never sent to the server
    func serverMessageId(_ id: String?) -> String? {
        guard let id, id.hasPrefix("queued-") else { return id }
        return sentIds[id]
    }
}
