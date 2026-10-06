import SwiftUI

/// The 52 room backgrounds. Order must match apps/web/lib/textures.ts TEXTURES — rooms store an index.
/// Tiles are @3x PNG renders of the web SVGs (Assets.xcassets/Textures).
/// None is ever taken out: a texture that is no longer offered is marked `retired`, here, in TEXTURES and on the
/// server (RETIRED_BACKGROUNDS in convex/rooms.ts), and keeps its place, its index and its tile.
struct RoomTexture {
    let key: String
    let blobA: Color
    let blobB: Color
    /// A retired texture is drawn for a room that has it, and no pick lands on it
    var retired = false

    private static let pink = Color(red: 1, green: 122 / 255, blue: 182 / 255).opacity(0.18)
    private static let blue = Color(red: 59 / 255, green: 107 / 255, blue: 1).opacity(0.13)
    private static let yellow = Color(red: 1, green: 210 / 255, blue: 63 / 255).opacity(0.26)
    private static let violet = Color(red: 167 / 255, green: 123 / 255, blue: 1).opacity(0.17)
    private static let mint = Color(red: 63 / 255, green: 220 / 255, blue: 176 / 255).opacity(0.2)

    static let all: [RoomTexture] = [
        RoomTexture(key: "grid", blobA: pink, blobB: blue),
        RoomTexture(key: "dots", blobA: pink, blobB: blue),
        RoomTexture(key: "gingham", blobA: yellow, blobB: blue),
        RoomTexture(key: "sprinkles", blobA: violet, blobB: mint),
        RoomTexture(key: "doodles", blobA: pink, blobB: blue, retired: true),
        RoomTexture(key: "stripes", blobA: mint, blobB: violet),
        RoomTexture(key: "zigzag", blobA: yellow, blobB: blue),
        RoomTexture(key: "bubbles", blobA: mint, blobB: blue),
        RoomTexture(key: "plaid", blobA: pink, blobB: mint),
        RoomTexture(key: "alphabet", blobA: yellow, blobB: violet, retired: true),
        RoomTexture(key: "sakura", blobA: pink, blobB: violet),
        RoomTexture(key: "seigaiha", blobA: blue, blobB: mint),
        RoomTexture(key: "onigiri", blobA: mint, blobB: violet),
        RoomTexture(key: "honeycomb", blobA: yellow, blobB: pink),
        RoomTexture(key: "argyle", blobA: pink, blobB: blue),
        RoomTexture(key: "clouds", blobA: blue, blobB: violet),
        RoomTexture(key: "asanoha", blobA: mint, blobB: blue),
        RoomTexture(key: "cherries", blobA: mint, blobB: pink),
        RoomTexture(key: "shippo", blobA: blue, blobB: yellow),
        RoomTexture(key: "terrazzo", blobA: yellow, blobB: blue),
        RoomTexture(key: "crossstitch", blobA: yellow, blobB: violet),
        RoomTexture(key: "paws", blobA: violet, blobB: yellow),
        RoomTexture(key: "waves", blobA: violet, blobB: pink),
        RoomTexture(key: "hearts", blobA: pink, blobB: yellow),
        RoomTexture(key: "brush", blobA: pink, blobB: blue, retired: true),
        RoomTexture(key: "pencil", blobA: violet, blobB: mint, retired: true),
        RoomTexture(key: "candylines", blobA: yellow, blobB: pink, retired: true),
        RoomTexture(key: "jimmies", blobA: yellow, blobB: violet),
        RoomTexture(key: "minihearts", blobA: blue, blobB: pink),
        RoomTexture(key: "dabs", blobA: pink, blobB: blue),
        RoomTexture(key: "softcheck", blobA: pink, blobB: mint),
        RoomTexture(key: "rainbowgrid", blobA: blue, blobB: yellow),
        RoomTexture(key: "swatches", blobA: mint, blobB: yellow),
        RoomTexture(key: "squiggles", blobA: yellow, blobB: pink),
        RoomTexture(key: "memphis", blobA: blue, blobB: pink),
        RoomTexture(key: "shapes", blobA: mint, blobB: violet),
        RoomTexture(key: "kikko", blobA: mint, blobB: pink),
        RoomTexture(key: "usagi", blobA: violet, blobB: blue),
        RoomTexture(key: "kakinohana", blobA: yellow, blobB: blue),
        RoomTexture(key: "fuji", blobA: blue, blobB: pink),
        RoomTexture(key: "sankuzushi", blobA: yellow, blobB: mint),
        RoomTexture(key: "kiku", blobA: violet, blobB: yellow),
        RoomTexture(key: "hishi", blobA: mint, blobB: yellow),
        RoomTexture(key: "raimon", blobA: blue, blobB: yellow),
        RoomTexture(key: "kanoko", blobA: pink, blobB: violet),
        RoomTexture(key: "nami", blobA: mint, blobB: blue),
        RoomTexture(key: "fundo", blobA: yellow, blobB: violet),
        RoomTexture(key: "ume", blobA: pink, blobB: mint),
        RoomTexture(key: "komezashi", blobA: mint, blobB: violet),
        RoomTexture(key: "uroko", blobA: pink, blobB: yellow),
        RoomTexture(key: "kasumi", blobA: blue, blobB: violet),
        RoomTexture(key: "yagasuri", blobA: violet, blobB: pink),
    ]

    /// How many textures the join code picks among: the first ten, however long the list is. Every build of the app
    /// and of the web page has those ten, so they all draw a room with no stored index alike, and it keeps its texture.
    private static let joinCodeCount = 10

    /// Older rooms have no stored index: FNV-1a of the join code, identical to the web client.
    static func index(background: Int?, joinCode: String?) -> Int {
        if let background, all.indices.contains(background) { return background }
        guard let joinCode, !joinCode.isEmpty else { return 0 }
        var h: UInt32 = 0x811c_9dc5
        for unit in joinCode.utf16 {
            h = (h ^ UInt32(unit)) &* 0x0100_0193
        }
        return Int(h % UInt32(joinCodeCount))
    }

    /// Any of the textures that are not retired, or with `not` any of them but that one
    static func randomIndex(not current: Int? = nil) -> Int {
        let offered = all.indices.filter { !all[$0].retired && $0 != current }
        return offered.randomElement() ?? 0
    }

    static func forRoom(_ room: Room?) -> RoomTexture {
        all[index(background: room?.background, joinCode: room?.joinCode)]
    }
}

/// Paper + tiled texture + two soft colour blobs (web: .ec-paper). A panel or a sheet shown over a screen
/// passes `blobs: false`: the texture alone, without a circle cut off at two of its corners
struct RoomBackground: View {
    let texture: RoomTexture
    let blobs: Bool

    init(index: Int, blobs: Bool = true) {
        texture = RoomTexture.all[RoomTexture.all.indices.contains(index) ? index : 0]
        self.blobs = blobs
    }

    init(room: Room?) {
        texture = RoomTexture.forRoom(room)
        blobs = true
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .topLeading) {
                EC.paper
                Image("tex-\(texture.key)")
                    .resizable(resizingMode: .tile)
                if blobs {
                    Circle()
                        .fill(texture.blobA)
                        .frame(width: 220, height: 220)
                        .position(x: geo.size.width * 0.1, y: geo.size.height * 0.16)
                    Circle()
                        .fill(texture.blobB)
                        .frame(width: 300, height: 300)
                        .position(x: geo.size.width * 0.92, y: geo.size.height * 0.82)
                }
            }
        }
        .allowsHitTesting(false)
    }
}

/// A RoomBackground that cross-fades to the new texture when its index changes, as the start screen's does
struct FadingRoomBackground: View {
    let index: Int
    var blobs = true

    var body: some View {
        // Bare paper underneath, so a change of texture fades over paper and not over whatever is behind
        ZStack {
            EC.paper
            RoomBackground(index: index, blobs: blobs)
                .id(index)
                .transition(.opacity)
        }
        .animation(.easeInOut(duration: 0.35), value: index)
        .allowsHitTesting(false)
    }
}

private struct RoomTextureIndexKey: EnvironmentKey {
    static let defaultValue = 0
}

extension EnvironmentValues {
    /// Index into RoomTexture.all of the screen a view is shown from, which `ecPaperBackground()` draws. The room
    /// screen and the start screen each set their own; where neither has it is 0, the plain grid
    var roomTextureIndex: Int {
        get { self[RoomTextureIndexKey.self] }
        set { self[RoomTextureIndexKey.self] = newValue }
    }
}
