import Foundation

@MainActor
class HostStartRoomViewModel: ObservableObject {
    @Published var hostNickname = ""
    @Published var hostAvatarId = "fox"
    @Published var settings = RoomSettings.defaults
    @Published var isCreating = false
    @Published var error: String?

    // Set after room creation
    @Published var createdRoomId: String?
    @Published var createdJoinCode: String?
    @Published var createdHostId: String?

    private let api: EnchattoAPI

    init(api: EnchattoAPI = AppConfig.makeAPI()) {
        self.api = api
    }

    var canCreate: Bool {
        !hostNickname.trimmingCharacters(in: .whitespaces).isEmpty && !isCreating
    }

    func createRoom() async {
        guard canCreate else { return }

        isCreating = true
        error = nil

        do {
            let result = try await api.createRoom(
                hostNickname: hostNickname.trimmingCharacters(in: .whitespaces),
                settings: settings
            )
            createdRoomId = result.roomId
            createdJoinCode = result.joinCode
            createdHostId = result.hostId
        } catch {
            self.error = error.localizedDescription
        }

        isCreating = false
    }
}
