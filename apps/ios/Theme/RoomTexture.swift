import SwiftUI

/// The 10 room backgrounds. Order must match apps/web/lib/textures.ts TEXTURES — rooms store an index.
/// Tiles are @3x PNG renders of the web SVGs (Assets.xcassets/Textures).
struct RoomTexture {
    let key: String
    let blobA: Color
    let blobB: Color

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
        RoomTexture(key: "doodles", blobA: pink, blobB: blue),
        RoomTexture(key: "stripes", blobA: mint, blobB: violet),
        RoomTexture(key: "zigzag", blobA: yellow, blobB: blue),
        RoomTexture(key: "bubbles", blobA: mint, blobB: blue),
        RoomTexture(key: "plaid", blobA: pink, blobB: mint),
        RoomTexture(key: "alphabet", blobA: yellow, blobB: violet),
    ]

    /// Older rooms have no stored index: FNV-1a of the join code, identical to the web client.
    static func index(background: Int?, joinCode: String?) -> Int {
        if let background, all.indices.contains(background) { return background }
        guard let joinCode, !joinCode.isEmpty else { return 0 }
        var h: UInt32 = 0x811c_9dc5
        for unit in joinCode.utf16 {
            h = (h ^ UInt32(unit)) &* 0x0100_0193
        }
        return Int(h % UInt32(all.count))
    }

    static func forRoom(_ room: Room?) -> RoomTexture {
        all[index(background: room?.background, joinCode: room?.joinCode)]
    }
}

/// Paper + tiled texture + two soft colour blobs (web: .ec-paper)
struct RoomBackground: View {
    let texture: RoomTexture

    init(index: Int) {
        texture = RoomTexture.all[RoomTexture.all.indices.contains(index) ? index : 0]
    }

    init(room: Room?) {
        texture = RoomTexture.forRoom(room)
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .topLeading) {
                EC.paper
                Image("tex-\(texture.key)")
                    .resizable(resizingMode: .tile)
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
        .allowsHitTesting(false)
    }
}
