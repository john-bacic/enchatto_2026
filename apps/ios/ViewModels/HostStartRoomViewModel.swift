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
    @Published var createdRoomId: String? {
        // Back on this screen (the room's navigation binding sets nil): nothing more is sent as that room's host
        didSet {
            guard createdRoomId == nil else { return }
            api.setCaller(hostId: nil, token: nil)
            let saved = SavedHostRoom.load()
            // A room whose record is still kept is the one to go back to. A room that closed has left none
            rejoinableRoom = saved
            // The background the room's screen was last drawn on, which the host can change from inside the room.
            // The room's record has it: still saved while the room is open, set aside when it closed
            if let record = saved ?? SavedHostRoom.dropped, record.roomId == oldValue {
                textureIndex = RoomTexture.index(background: record.background, joinCode: record.joinCode)
                textureIsFromRoom = true
            }
            // A room that closed while the host was in it has left no record to go back to
            if saved == nil { pickFreshTexture() }
        }
    }
    @Published var createdJoinCode: String?
    @Published var createdHostId: String?

    /// The room there is to go back to: the saved room this device hosts, read from its record when this screen is
    /// made, at each check and on the way back out of a room, until the server says it is closed or gone. While
    /// there is one this screen offers no Create Room: it goes back into that room, or offers "Rejoin room" when the
    /// server cannot be reached. It stays on the way into that room and while the host is in it, with this screen
    /// still there underneath
    @Published private(set) var rejoinableRoom: SavedHostRoom?
    /// The server is being asked about that room
    @Published private(set) var isRejoining = false

    /// Index into RoomTexture.all of the background this screen is drawn on, which is the background of the room
    /// entered from it, created or rejoined: that of the room there is to go back to, or with no such room one
    /// picked at random
    @Published private(set) var textureIndex: Int
    /// Whether `textureIndex` is that of a room this device was in. Once there is no such room to go back to, the
    /// screen picks another, so that a new chat does not look like the last one
    private(set) var textureIsFromRoom: Bool

    private let api: EnchattoAPI

    init(api: EnchattoAPI = AppConfig.makeAPI()) {
        self.api = api
        self.hostNickname = UserDefaults.standard.string(forKey: "enchatto_lastNickname") ?? ""
        self.hostAvatarId = UserDefaults.standard.string(forKey: "enchatto_lastAvatarId") ?? "fox"
        self.hostLanguage = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
        if let saved = SavedHostRoom.load() {
            self.textureIndex = RoomTexture.index(background: saved.background, joinCode: saved.joinCode)
            self.textureIsFromRoom = true
            // From the first frame, before the server has been asked
            self.rejoinableRoom = saved
        } else {
            self.textureIndex = RoomTexture.randomIndex()
            self.textureIsFromRoom = false
        }
    }

    /// Never while there is a room to go back to: a room created then would leave that one open without its host
    var canCreate: Bool {
        rejoinableRoom == nil && !hostNickname.trimmingCharacters(in: .whitespaces).isEmpty && !isCreating && !isRejoining
    }

    func createRoom() async {
        // Nor while a room is on screen: this screen is still there underneath it
        guard canCreate, createdRoomId == nil else { return }

        isCreating = true
        error = nil

        // The room looks like the screen it is entered from
        let background = textureIndex

        do {
            let result = try await api.createRoom(
                hostNickname: hostNickname.trimmingCharacters(in: .whitespaces),
                hostAvatarId: hostAvatarId,
                hostLanguage: hostLanguage,
                settings: settings,
                background: background
            )
            // What the room screen will draw. A server that names no background is taken to have given the one asked for
            let texture = RoomTexture.index(background: result.background ?? background, joinCode: result.joinCode)
            // The only record there is: a room is not created while an earlier one's is kept (canCreate)
            SavedHostRoom(roomId: result.roomId, hostId: result.hostId, joinCode: result.joinCode, deployment: AppConfig.convexDeploymentURL, hostToken: result.hostToken, background: texture).save()
            // Before the room screen exists: its first requests already go out as the host
            api.setCaller(hostId: result.hostId, token: result.hostToken)
            // Coming back out of the room, this screen is drawn on the room's background
            textureIndex = texture
            textureIsFromRoom = true
            createdRoomId = result.roomId
            createdJoinCode = result.joinCode
            createdHostId = result.hostId
        } catch {
            self.error = error.localizedDescription
        }

        isCreating = false
    }

    /// Asks the server about the room saved by the last createRoom. Open, with this device as its host: goes back in.
    /// Closed or gone: forgets it, and the screen offers Create Room. Anything else: keeps it, and the screen offers
    /// "Rejoin room" so the host can retry. One check at a time: a second one asked for meanwhile does nothing.
    /// `tapped` is the check that button asks for: it says why the host is not in the room, and a refusal from the
    /// server forgets the room too
    func checkSavedRoom(tapped: Bool) async {
        guard createdRoomId == nil, !isCreating, !isRejoining else { return }
        guard let saved = SavedHostRoom.load() else {
            rejoinableRoom = nil
            pickFreshTexture()
            return
        }
        rejoinableRoom = saved
        isRejoining = true
        if tapped { error = nil }
        defer { isRejoining = false }

        var open = false
        var unreachable = false
        var texture: Int?
        do {
            let state = try await api.getRoomState(roomId: saved.roomId)
            open = state.room.status != .closed
                && state.room.hostId == saved.hostId
                && state.participants.contains { $0.id == saved.hostId }
            texture = RoomTexture.index(background: state.room.background, joinCode: state.room.joinCode)
        } catch {
            // A cancelled check says nothing about the room
            if Task.isCancelled || error.isCancellation { return }
            // The record is the only way back into the room, so it is dropped only on the server's own word that the
            // room is gone. Any other failure (a certificate the phone does not trust, a captive network's page) says
            // nothing about the room and keeps the offer. A 4xx is not that word either (a missing room is answered
            // 200, below), so it only drops the record when the host tapped and would otherwise be stuck on it.
            var gone = tapped && error.isServerRefusal
            // A room that does not exist is answered 200 {"ok":true}: decoding stops at the missing top-level "room".
            // Any other undecodable reply is not that answer
            if let decoding = error as? DecodingError, case .keyNotFound(let key, let context) = decoding {
                gone = key.stringValue == "room" && context.codingPath.isEmpty
            }
            // What MockEnchattoAPI throws for it
            if let apiError = error as? APIError, case .roomNotFound = apiError { gone = true }
            unreachable = !gone
        }

        // The answer is about the record that was asked about. With the host in a room by now, or with the record
        // gone or another room's, it changes nothing. A record that only has another background since is still
        // about this room
        guard createdRoomId == nil, SavedHostRoom.load()?.roomId == saved.roomId else { return }

        if open {
            // The room's own word on its background, which a record saved by a build that stored none could only
            // work out from the join code
            if let texture {
                textureIndex = texture
                textureIsFromRoom = true
            }
            // The token saved at creation; nil for a room an earlier build made, whose host the server takes by id alone
            api.setCaller(hostId: saved.hostId, token: saved.hostToken)
            // The room is there: what an earlier tap was told about it is taken away
            error = nil
            createdJoinCode = saved.joinCode
            createdHostId = saved.hostId
            createdRoomId = saved.roomId
        } else if unreachable {
            if tapped { self.error = L.t("Couldn't reach the room. Try again.", hostLanguage) }
        } else {
            SavedHostRoom.clear(roomId: saved.roomId)
            rejoinableRoom = nil
            pickFreshTexture()
            // Said only after a tap. A check without one also takes away what an earlier tap was told about the room
            self.error = tapped ? L.t("This room has been closed", hostLanguage) : nil
        }
    }

    /// With no room to go back to, the background of the last one gives way to another picked at random. One that
    /// no room has had stays: it is waiting for the room created from this screen
    private func pickFreshTexture() {
        guard textureIsFromRoom else { return }
        textureIndex = RoomTexture.randomIndex(not: textureIndex)
        textureIsFromRoom = false
    }
}
