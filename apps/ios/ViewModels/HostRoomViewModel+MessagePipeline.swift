import Foundation

extension HostRoomViewModel {
    // MARK: - Processing loop

    func processPendingMessages() async {
        guard let settings = room?.settings else { return }
        guard !isClosed else { return }

        do {
            let pending = try await api.getPendingMessages(roomId: roomId)

            for message in pending {
                // Skip if already being processed or not a text message
                guard message.kind == .text || message.kind == .audio,
                      !processingMessageIds.contains(message.id) else { continue }

                guard let text = message.text, !text.isEmpty else { continue }

                processingMessageIds.insert(message.id)
                processingCount += 1

                // Process in a child task so we can handle multiple messages
                Task { [weak self] in
                    guard let self else { return }
                    await self.processMessage(message, settings: settings)
                }
            }
        } catch {
            // Don't surface polling errors to the user
            DebugConsole.shared.trace(source: .network, action: "poll:pending:error", detail: error.localizedDescription, ok: false)
        }
    }

    private func processMessage(_ message: Message, settings: RoomSettings) async {
        let config = ProcessingConfig(from: settings)

        do {
            let result = try await processor.process(text: message.text ?? "", config: config)
            do {
                try await api.submitProcessedMessage(messageId: message.id, processing: result)
            } catch let error where error.isRetryableNetworkFailure || error.isCancellation {
                // The result could not be delivered, which is not the message's fault: it stays pending and the next pending poll processes it again
                DebugConsole.shared.trace(source: .network, action: "submitProcessed:retryLater", detail: error.localizedDescription, ok: false)
            }
        } catch {
            do {
                try await api.markMessageFailed(messageId: message.id, error: error.localizedDescription)
            } catch {
                DebugConsole.shared.trace(source: .processing, action: "markFailed:error", detail: error.localizedDescription, ok: false)
            }
        }

        // Clean up tracking
        await MainActor.run {
            processingMessageIds.remove(message.id)
            processingCount = max(0, processingCount - 1)
        }

        // Refresh to show updated state
        await refresh()
    }
}
