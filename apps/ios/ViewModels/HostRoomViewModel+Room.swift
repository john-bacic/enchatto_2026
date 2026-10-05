import Foundation

extension HostRoomViewModel {
    func closeRoom() async {
        do {
            try await api.closeRoom(roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func kickParticipant(_ participantId: String) async {
        do {
            try await api.kickParticipant(participantId: participantId, roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Background

    /// Index into RoomTexture.all the room is drawn on; nil until the room's state is here
    var textureIndex: Int? { Self.textureIndex(of: room) }

    static func textureIndex(of room: Room?) -> Int? {
        room.map { RoomTexture.index(background: $0.background, joinCode: $0.joinCode) }
    }

    /// Gives the room another background, picked at random, for everyone in it. It is drawn here at once
    func randomizeBackground() {
        guard let current = textureIndex, !isClosed else { return }
        let before = room?.background
        room?.background = RoomTexture.randomIndex(not: current)
        guard backgroundTask == nil else { return }
        // No request was out, so the background the room had until this tap is the one the server has
        backgroundTask = Task { [weak self] in
            await self?.sendBackground(onServer: before)
        }
    }

    /// One request at a time, until the server has the background on screen. A pick made while a request is out
    /// is not sent on its own: the next request carries the latest. No state changes the background while this
    /// runs (see roomOnScreen), so the room's is the latest pick. `onServer` is the background the server has,
    /// kept up with its answers: the one that comes back when a request fails
    private func sendBackground(onServer: Int?) async {
        var onServer = onServer
        defer { backgroundTask = nil }
        while let picked = room?.background, picked != onServer {
            backgroundEpoch += 1
            defer { backgroundEpoch += 1 }
            do {
                try Task.checkCancellation()
                try await api.setRoomBackground(roomId: roomId, background: picked)
                onServer = picked
            } catch {
                // The host has left the room. Whether the server took the pick is not known here; the next
                // state says what the room has
                if Task.isCancelled || error.isCancellation { return }
                // The background the server has comes back, whatever was picked meanwhile
                room?.background = onServer
                self.error = error.localizedDescription
                return
            }
        }
    }

    /// The server's room as it is shown. A state asked for at `epoch` is the server's word on the background only
    /// if no pick has been sent or answered since and none is waiting: any other may be from before the server
    /// took a pick, and showing it as it is would put an earlier background back until the next state. So such
    /// a state leaves the background on screen; the rest of it is shown
    func roomOnScreen(_ server: Room, askedAt epoch: Int) -> Room {
        guard backgroundTask != nil || epoch != backgroundEpoch, let shown = room else { return server }
        var room = server
        room.background = shown.background
        return room
    }

    // MARK: - Host language

    /// Called when the host switches language in Settings; the switch has already applied on this device
    func setHostLanguage(_ language: String) {
        guard language != hostLanguage else { return }
        hostLanguage = language
        hostLanguageRetryAfter = .distantPast
        syncHostLanguage()
    }

    /// Sends this device's language when the server's copy differs. Runs after every poll, so a room made on a server
    /// that ignored the language at creation, or a switch made offline, catches up on its own.
    func syncHostLanguage() {
        let wanted = hostLanguage
        guard hostLanguageTask == nil, Date() >= hostLanguageRetryAfter,
              networkMonitor.isConnected, !isClosed,
              let host = participant(for: hostId), host.preferredLanguage != wanted else { return }
        let api = self.api
        let hostId = self.hostId
        hostLanguageTask = Task { [weak self] in
            var failure: Error?
            do {
                try await api.setParticipantLanguage(participantId: hostId, language: wanted)
            } catch {
                failure = error
            }
            guard let self else { return }
            self.hostLanguageTask = nil
            // Cancelled, or another language was picked meanwhile: the next poll starts over
            guard let failure, !Task.isCancelled, !failure.isCancellation, self.hostLanguage == wanted else { return }
            // Giving up for good takes the server's own refusal; an error that never reached it says nothing about the route
            self.hostLanguageRetryAfter = failure.isServerRefusal ? .distantFuture : Date().addingTimeInterval(30)
            DebugConsole.shared.trace(source: .network, action: "setLanguage:error", detail: failure.localizedDescription, ok: false)
        }
    }

    func setTypingAction(_ action: String?, drawingStartedAt: Double? = nil) {
        let key = action ?? "nil"
        guard key != lastTypingAction else { return }
        lastTypingAction = key
        Task {
            try? await api.setTypingAction(participantId: hostId, action: action, drawingStartedAt: drawingStartedAt)
        }
    }
}
