import Foundation

@MainActor
class HostStartRoomViewModel: ObservableObject {
    @Published var hostNickname: String {
        didSet { UserDefaults.standard.set(hostNickname, forKey: "enchatto_lastNickname") }
    }
    @Published var hostAvatarId: String {
        didSet { UserDefaults.standard.set(hostAvatarId, forKey: "enchatto_lastAvatarId") }
    }
    @Published var hostLanguage: String {
        didSet { UserDefaults.standard.set(hostLanguage, forKey: "enchatto_lastLanguage") }
    }
    @Published var settings = RoomSettings.defaults
    @Published var isCreating = false
    @Published var error: String?

    // Set after room creation
    @Published var createdRoomId: String?
    @Published var createdJoinCode: String?
    @Published var createdHostId: String?

    /// Room this device was hosting when the app last stopped, offered as "Rejoin room" once the server says it is open or cannot be reached
    @Published private(set) var rejoinableRoom: SavedHostRoom?
    @Published private(set) var isRejoining = false

    private let api: EnchattoAPI

    init(api: EnchattoAPI = AppConfig.makeAPI()) {
        self.api = api
        self.hostNickname = UserDefaults.standard.string(forKey: "enchatto_lastNickname") ?? ""
        self.hostAvatarId = UserDefaults.standard.string(forKey: "enchatto_lastAvatarId") ?? "fox"
        self.hostLanguage = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    }

    var canCreate: Bool {
        !hostNickname.trimmingCharacters(in: .whitespaces).isEmpty && !isCreating && !isRejoining
    }

    func createRoom() async {
        guard canCreate else { return }

        isCreating = true
        error = nil

        do {
            let result = try await api.createRoom(
                hostNickname: hostNickname.trimmingCharacters(in: .whitespaces),
                hostAvatarId: hostAvatarId,
                hostLanguage: hostLanguage,
                settings: settings
            )
            // Replaces any earlier record. That room is not closed from here: it closes itself once its host stays away
            SavedHostRoom(roomId: result.roomId, hostId: result.hostId, joinCode: result.joinCode, deployment: AppConfig.convexDeploymentURL).save()
            rejoinableRoom = nil
            createdRoomId = result.roomId
            createdJoinCode = result.joinCode
            createdHostId = result.hostId
        } catch {
            self.error = error.localizedDescription
        }

        isCreating = false
    }

    /// Asks the server about the room saved by the last createRoom. Open: offers "Rejoin room", or with `enter` goes back in.
    /// Closed or gone: forgets it. Anything else: keeps it so the host can retry.
    func checkSavedRoom(enter: Bool) async {
        guard createdRoomId == nil, !isCreating, !isRejoining else { return }
        guard let saved = SavedHostRoom.load() else {
            rejoinableRoom = nil
            return
        }
        if enter {
            isRejoining = true
            error = nil
        }
        defer { if enter { isRejoining = false } }

        var open = false
        var unreachable = false
        do {
            let state = try await api.getRoomState(roomId: saved.roomId)
            open = state.room.status != .closed
                && state.room.hostId == saved.hostId
                && state.participants.contains { $0.id == saved.hostId }
        } catch {
            // A cancelled check says nothing about the room
            if Task.isCancelled || error.isCancellation { return }
            // The record is the only way back into the room, so it is dropped only on the server's own word that the
            // room is gone. Any other failure (a certificate the phone does not trust, a captive network's page) says
            // nothing about the room and keeps the offer. A 4xx is not that word either (a missing room is answered
            // 200, below), so it only drops the record when the host tapped and would otherwise be stuck on it.
            var gone = enter && error.isServerRefusal
            // A room that does not exist is answered 200 {"ok":true}: decoding stops at the missing top-level "room".
            // Any other undecodable reply is not that answer
            if let decoding = error as? DecodingError, case .keyNotFound(let key, let context) = decoding {
                gone = key.stringValue == "room" && context.codingPath.isEmpty
            }
            // What MockEnchattoAPI throws for it
            if let apiError = error as? APIError, case .roomNotFound = apiError { gone = true }
            unreachable = !gone
        }

        // A room created while the request was out replaces the record: this answer is about the old one
        guard createdRoomId == nil, SavedHostRoom.load() == saved else { return }

        if open {
            if enter {
                rejoinableRoom = nil
                createdJoinCode = saved.joinCode
                createdHostId = saved.hostId
                createdRoomId = saved.roomId
            } else {
                rejoinableRoom = saved
            }
        } else if unreachable {
            rejoinableRoom = saved
            if enter { self.error = L.t("Couldn't reach the room. Try again.", hostLanguage) }
        } else {
            SavedHostRoom.clear(roomId: saved.roomId)
            rejoinableRoom = nil
            if enter { self.error = L.t("This room has been closed", hostLanguage) }
        }
    }
}
