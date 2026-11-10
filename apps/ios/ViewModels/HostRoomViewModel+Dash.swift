import Foundation

extension HostRoomViewModel {
    /// Opens a Chatto Dash lobby, with this device's player in it. True when there is a game to show
    func createDashLobby() async -> Bool {
        do {
            _ = try await api.createDashLobby(roomId: roomId, hostParticipantId: hostId)
            await pollDashState()
            return activeDashGame?.isOn == true
        } catch {
            DebugConsole.shared.trace(source: .client, action: "dash:createLobby:error", detail: error.localizedDescription, ok: false)
            return false
        }
    }

    /// The room's game, asked for by itself: after opening a lobby, where the next refresh is too long to wait.
    /// Every other time the game comes with the refresh (the snapshot's `dash` section)
    func pollDashState() async {
        do {
            applyDashState(try await api.getActiveDash(roomId: roomId))
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:dash:error", detail: error.localizedDescription, ok: false)
        }
    }

    func applyDashState(_ game: DashGame?) {
        // Every assignment publishes: only a game that differs from the one on screen is assigned
        if game != activeDashGame { activeDashGame = game }
    }
}
