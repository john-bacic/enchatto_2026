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
            let saved = SavedRoom.load()
            // A room whose record is still kept is the one to go back to. A room that closed has left none
            rejoinableRoom = saved
            // The background the room's screen was last drawn on, which the host can change from inside the room.
            // The room's record has it: still saved while the room is open, set aside when it closed
            if let record = saved ?? SavedRoom.dropped, record.roomId == oldValue {
                textureIndex = RoomTexture.index(background: record.background, joinCode: record.joinCode)
                textureIsFromRoom = true
            }
            // A room that closed while the host was in it has left no record to go back to
            if saved == nil { pickFreshTexture() }
        }
    }
    @Published var createdJoinCode: String?
    /// This device's participant in the room on screen: its host's for a room created here, a guest's for one joined
    @Published var createdHostId: String?
    /// Whether this device went into the room on screen as its host
    @Published private(set) var enteredAsHost = true
    @Published private(set) var isJoining = false

    /// The room there is to go back to: the saved room this device hosts or is a guest in, read from its record when
    /// this screen is made, at each check and on the way back out of a room, until the server says it is closed or
    /// gone. This screen goes back into that room, or offers "Rejoin room" when the server cannot be reached. While
    /// this device hosts it there is no Create Room. It stays on the way into that room and while this device is in
    /// it, with this screen still there underneath
    @Published private(set) var rejoinableRoom: SavedRoom?
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
        if let saved = SavedRoom.load() {
            self.textureIndex = RoomTexture.index(background: saved.background, joinCode: saved.joinCode)
            self.textureIsFromRoom = true
            // From the first frame, before the server has been asked
            self.rejoinableRoom = saved
        } else {
            self.textureIndex = RoomTexture.randomIndex()
            self.textureIsFromRoom = false
        }
    }

    /// Never while there is a room this device hosts to go back to: a room created then would leave that one open
    /// without its host. A room it is a guest in is left for the new one
    var canCreate: Bool {
        rejoinableRoom?.isHost != true && !hostNickname.trimmingCharacters(in: .whitespaces).isEmpty && !isCreating && !isJoining
    }

    func createRoom() async {
        // Nor while a room is on screen: this screen is still there underneath it
        guard canCreate, createdRoomId == nil else { return }

        isCreating = true
        error = nil
        await leaveSavedGuestRoom()

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
            SavedRoom(roomId: result.roomId, participantId: result.hostId, joinCode: result.joinCode, deployment: AppConfig.convexDeploymentURL, token: result.hostToken, background: texture, hosting: true).save()
            // Before the room screen exists: its first requests already go out as the host
            api.setCaller(hostId: result.hostId, token: result.hostToken)
            // Coming back out of the room, this screen is drawn on the room's background
            textureIndex = texture
            textureIsFromRoom = true
            enteredAsHost = true
            createdRoomId = result.roomId
            createdJoinCode = result.joinCode
            createdHostId = result.hostId
        } catch {
            self.error = error.localizedDescription
        }

        isCreating = false
    }

    // MARK: - Joining

    /// The join code in what was typed or scanned: the code itself, or a room's join link
    /// (https://enchatto.vercel.app/join/CODE, what the room's QR code holds). nil when there is none
    nonisolated static func joinCode(in input: String) -> String? {
        var candidate = input.trimmingCharacters(in: .whitespacesAndNewlines)
        if let url = URL(string: candidate), url.scheme != nil {
            let parts = url.pathComponents
            guard let at = parts.firstIndex(of: "join"), at + 1 < parts.count else { return nil }
            candidate = parts[at + 1]
        }
        let code = candidate.uppercased()
        let alphabet = Set("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        return code.count == 6 && code.allSatisfy(alphabet.contains) ? code : nil
    }

    var canJoin: Bool {
        !hostNickname.trimmingCharacters(in: .whitespaces).isEmpty && !isJoining && !isCreating && createdRoomId == nil
    }

    /// Joins a room as a guest, by its code or join link, and goes in. Not while this device hosts a room: that one
    /// would be left without its host. A room this device is a guest in already is gone back into; another one it
    /// was a guest in is left first. Says false when it did not go in, with `error` saying why
    @discardableResult
    func joinRoom(_ input: String) async -> Bool {
        guard canJoin else { return false }
        guard let code = Self.joinCode(in: input) else {
            error = L.t("That's not a room code", hostLanguage)
            return false
        }
        if let saved = SavedRoom.load() {
            if saved.joinCode == code {
                await checkSavedRoom(tapped: true)
                return createdRoomId != nil
            }
            if saved.isHost {
                error = L.t("You're hosting a room. Close it before joining another.", hostLanguage)
                return false
            }
        }

        isJoining = true
        error = nil
        defer { isJoining = false }
        await leaveSavedGuestRoom()
        do {
            let result = try await api.joinRoom(
                joinCode: code,
                nickname: hostNickname.trimmingCharacters(in: .whitespaces),
                avatarId: hostAvatarId,
                language: hostLanguage
            )
            let texture = RoomTexture.index(background: result.background, joinCode: result.joinCode)
            SavedRoom(roomId: result.roomId, participantId: result.participantId, joinCode: result.joinCode, deployment: AppConfig.convexDeploymentURL, token: result.token, background: texture, hosting: false).save()
            rejoinableRoom = SavedRoom.load()
            api.setCaller(hostId: result.participantId, token: result.token)
            textureIndex = texture
            textureIsFromRoom = true
            enteredAsHost = false
            createdJoinCode = result.joinCode
            createdHostId = result.participantId
            createdRoomId = result.roomId
            return true
        } catch {
            let message = error.localizedDescription
            if message.contains("Room not found") {
                self.error = L.t("No room with that code", hostLanguage)
            } else if message.contains("Room is closed") {
                self.error = L.t("This room has been closed", hostLanguage)
            } else if message.contains("Room is full") {
                self.error = L.t("This room is full", hostLanguage)
            } else {
                self.error = message
            }
            return false
        }
    }

    /// Leaves the room this device was last a guest in, for one it creates or joins. Whatever the server says, this
    /// device is done with it
    private func leaveSavedGuestRoom() async {
        guard let saved = SavedRoom.load(), !saved.isHost else { return }
        api.setCaller(hostId: saved.participantId, token: saved.token)
        try? await api.leaveRoom(participantId: saved.participantId)
        api.setCaller(hostId: nil, token: nil)
        SavedRoom.clear(roomId: saved.roomId)
        rejoinableRoom = nil
    }

    /// Asks the server about the room saved by the last createRoom or joinRoom. Open, with this device in it: goes back in.
    /// Closed or gone: forgets it, and the screen offers Create Room. Anything else: keeps it, and the screen offers
    /// "Rejoin room" so the host can retry. One check at a time: a second one asked for meanwhile does nothing.
    /// `tapped` is the check that button asks for: it says why the host is not in the room, and a refusal from the
    /// server forgets the room too
    func checkSavedRoom(tapped: Bool) async {
        guard createdRoomId == nil, !isCreating, !isRejoining else { return }
        guard let saved = SavedRoom.load() else {
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
        var hosting = saved.isHost
        do {
            let state = try await api.getRoomState(roomId: saved.roomId)
            // Host or guest: a host the room was handed away from while it was gone goes back in as a guest. A
            // guest who was removed is no longer in it
            open = state.room.status != .closed
                && state.participants.contains { $0.id == saved.participantId }
            hosting = state.room.hostId == saved.participantId
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
        guard createdRoomId == nil, SavedRoom.load()?.roomId == saved.roomId else { return }

        if open {
            // The room's own word on its background, which a record saved by a build that stored none could only
            // work out from the join code
            if let texture {
                textureIndex = texture
                textureIsFromRoom = true
            }
            // The token saved at creation or joining; nil for a room an earlier build made, whose host the server takes
            // by id alone
            api.setCaller(hostId: saved.participantId, token: saved.token)
            SavedRoom.setHosting(hosting, roomId: saved.roomId)
            // The room is there: what an earlier tap was told about it is taken away
            error = nil
            enteredAsHost = hosting
            createdJoinCode = saved.joinCode
            createdHostId = saved.participantId
            createdRoomId = saved.roomId
        } else if unreachable {
            if tapped { self.error = L.t("Couldn't reach the room. Try again.", hostLanguage) }
        } else {
            SavedRoom.clear(roomId: saved.roomId)
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
