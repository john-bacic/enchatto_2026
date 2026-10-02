import SwiftUI

/// Emoji → icon-pack asset. Game data stays as emoji strings; views swap in art when mapped.
/// Keep in sync with apps/web/lib/icons.ts.
enum IconPack {
    static let emojiIcons: [String: String] = [
        // objects
        "☀️": "o-sun", "🌞": "o-sun", "☁️": "o-cloud", "☂️": "o-umbrella", "⛄": "o-snowman",
        "🌙": "o-moon", "🏠": "o-house", "☕": "o-coffee", "🌷": "o-tulip", "🍒": "o-cherry",
        "🍞": "o-bread", "🍺": "o-beer", "🍰": "o-cake", "🚗": "o-car", "🐳": "o-whale",
        "🍦": "o-icecream", "🍉": "o-watermelon", "💎": "o-diamond", "🦋": "o-butterfly",
        "⛱️": "o-parasol", "📷": "o-camera", "📺": "o-tv", "🚃": "o-train", "🥨": "o-pretzel",
        "🌠": "o-shootingstar", "🌸": "o-flower", "⭐": "o-star", "🎁": "o-gift", "🎀": "o-bow",
        // animals
        "🐰": "av-bunny", "🐼": "av-panda", "🐻": "av-bear", "👻": "av-ghost", "🐥": "av-chick",
        "🪼": "av-jelly", "🐶": "av-puppy", "🐹": "av-hamster", "🐱": "av-cat", "🐈": "av-bluecat",
        "🐢": "av-turtle", "🦭": "av-seal", "🐝": "av-bee", "🐑": "av-sheep", "🐷": "av-pig",
        "🐕": "av-chihuahua",
        // symbols
        "💡": "g-bulb", "✏️": "g-pencil", "👑": "g-crown", "⚡": "g-bolt", "❓": "g-question",
        "❗": "g-bang", "🍀": "g-clover", "👂": "g-ear", "🎵": "g-music", "🎶": "g-music",
        // reactions
        "👍": "re-thumbs", "❤️": "re-heart", "😂": "re-laugh", "😮": "re-wow", "😢": "re-cry",
        "🔥": "re-star", "✌️": "re-peace", "👋": "re-wave",
    ]

    static func icon(for emoji: String) -> String? {
        emojiIcons[emoji] ?? emojiIcons[emoji.replacingOccurrences(of: "\u{FE0F}", with: "")]
    }
}

/// Icon-pack art for an emoji, falling back to the system emoji glyph.
struct EmojiArt: View {
    let emoji: String
    var size: CGFloat = 32

    var body: some View {
        if let icon = IconPack.icon(for: emoji) {
            Image(icon).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
        } else {
            Text(emoji).font(.system(size: size * 0.82)).frame(width: size, height: size)
        }
    }
}

/// Icon asset at a fixed square size
struct PackIcon: View {
    let name: String
    var size: CGFloat = 28

    init(_ name: String, size: CGFloat = 28) {
        self.name = name
        self.size = size
    }

    var body: some View {
        Image(name).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
    }
}

/// Coloured ink-ringed disc with the avatar's icon art
struct AvatarDisc: View {
    let avatarId: String
    var size: CGFloat = 40
    var ring: Color? = nil

    var body: some View {
        let avatar = presetAvatar(for: avatarId)
        Image(avatar.icon)
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .padding(size * 0.1)
            .frame(width: size, height: size)
            .background(Circle().fill(avatar.color))
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: max(2, size * 0.065)))
            .overlay {
                if let ring {
                    Circle().strokeBorder(ring, lineWidth: 3).padding(-5)
                }
            }
    }
}

/// The Chatto speech-bubble mascot
struct ChattoView: View {
    var size: CGFloat = 96
    var bob = true
    /// Home-hero jump (web `ec-bob` + `ec-shadow`) with a ground shadow, instead of the gentle bob
    var hop = false
    var wave = true

    var body: some View {
        if hop {
            hopping
        } else {
            LoopClock(active: bob) { t in
                let w = loopWave(t, period: 2.2)
                ChattoArt(size: size, seconds: t, wave: wave)
                    .offset(y: -size * 0.03 * (w + 1))
                    .rotationEffect(.degrees(-3 * w))
            }
        }
    }

    private var hopping: some View {
        LoopClock { t in
            let k = size / 120
            let y = keyframed(t, period: 1.1, [(0, 0), (0.15, 2), (0.4, -10), (0.65, 0), (1, 0)])
            let sx = keyframed(t, period: 1.1, [(0, 1), (0.15, 1.07), (0.4, 0.96), (0.65, 1), (1, 1)])
            let sy = keyframed(t, period: 1.1, [(0, 1), (0.15, 0.92), (0.4, 1.05), (0.65, 1), (1, 1)])
            let shadow = keyframed(t, period: 1.1, [(0, 1), (0.4, 0.7), (1, 1)])
            let shadowAlpha = keyframed(t, period: 1.1, [(0, 1), (0.4, 0.6), (1, 1)])
            VStack(spacing: -6 * k) {
                ChattoArt(size: size, seconds: t, wave: wave)
                    .scaleEffect(x: sx, y: sy, anchor: .bottom)
                    .offset(y: y * k)
                    .zIndex(1)
                Ellipse()
                    .fill(EC.ink.opacity(0.16 * shadowAlpha))
                    .frame(width: size * 0.58, height: 12 * k)
                    .scaleEffect(shadow)
            }
        }
    }
}

/// Vector Chatto drawn in the web SVG's `-6 -8 132 140` viewBox, with the `ec-wave` arm and
/// `ec-blink` eyes driven by LoopClock time (`seconds == 0` is the still pose).
struct ChattoArt: View {
    var size: CGFloat
    var seconds: Double = 0
    var wave = true

    /// Viewbox units of overdraw so the swinging arm and antenna ball aren't clipped
    private static let bleed: CGFloat = 10

    private var armAngle: Double {
        guard wave, seconds != 0 else { return 0 }
        let p = (seconds / 1.4).truncatingRemainder(dividingBy: 1)
        let swing = p < 0.5 ? p * 2 : (1 - p) * 2
        return -18 + 34 * cubicBezier(swing, 0.42, 0, 0.58, 1)
    }

    private var eyeScale: CGFloat {
        guard seconds != 0 else { return 1 }
        let p = (seconds / 3.6).truncatingRemainder(dividingBy: 1)
        if p < 0.94 { return 1 }
        if p < 0.96 { return 1 - 0.9 * (p - 0.94) / 0.02 }
        return 0.1 + 0.9 * (p - 0.96) / 0.04
    }

    var body: some View {
        let s = size / 132
        let bleed = Self.bleed
        let angle = armAngle
        let blink = eyeScale
        Canvas { ctx, _ in
            ctx.scaleBy(x: s, y: s)
            ctx.translateBy(x: 6 + bleed, y: 8 + bleed)

            func circle(_ cx: CGFloat, _ cy: CGFloat, _ r: CGFloat) -> Path {
                Path(ellipseIn: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2))
            }
            func line(_ points: CGPoint...) -> Path {
                var p = Path()
                p.addLines(points)
                return p
            }
            func ink(_ g: GraphicsContext, _ path: Path, _ width: CGFloat) {
                g.stroke(path, with: .color(EC.ink), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            }
            func blob(_ g: GraphicsContext, _ path: Path, _ fill: Color, _ width: CGFloat = 3.5) {
                g.fill(path, with: .color(fill))
                ink(g, path, width)
            }

            for x in [44.0, 76.0] {
                blob(ctx, Path(ellipseIn: CGRect(x: x - 13, y: 112, width: 26, height: 16)), EC.blue, 4)
            }

            ink(ctx, line(CGPoint(x: 16, y: 62), CGPoint(x: 2, y: 48)), 4)
            blob(ctx, circle(2, 47, 6), EC.yellow)

            var arm = ctx
            arm.translateBy(x: 104, y: 60)
            arm.rotate(by: .degrees(angle))
            arm.translateBy(x: -104, y: -60)
            ink(arm, line(CGPoint(x: 104, y: 60), CGPoint(x: 118, y: 40)), 4)
            blob(arm, circle(118, 39, 6), EC.yellow)

            var antenna = Path()
            antenna.move(to: CGPoint(x: 60, y: 14))
            antenna.addQuadCurve(to: CGPoint(x: 64, y: -3), control: CGPoint(x: 55, y: 2))
            ink(ctx, antenna, 4)
            blob(ctx, circle(65, -3, 6), EC.pink)

            var body = Path()
            body.move(to: CGPoint(x: 56, y: 14))
            body.addLine(to: CGPoint(x: 64, y: 14))
            body.addCurve(to: CGPoint(x: 106, y: 54), control1: CGPoint(x: 88, y: 14), control2: CGPoint(x: 106, y: 30))
            body.addCurve(to: CGPoint(x: 64, y: 96), control1: CGPoint(x: 106, y: 78), control2: CGPoint(x: 88, y: 96))
            body.addLine(to: CGPoint(x: 50, y: 96))
            body.addLine(to: CGPoint(x: 28, y: 112))
            body.addLine(to: CGPoint(x: 34, y: 92))
            body.addCurve(to: CGPoint(x: 14, y: 54), control1: CGPoint(x: 22, y: 85), control2: CGPoint(x: 14, y: 71))
            body.addCurve(to: CGPoint(x: 56, y: 14), control1: CGPoint(x: 14, y: 30), control2: CGPoint(x: 32, y: 14))
            body.closeSubpath()
            blob(ctx, body, EC.yellow, 4.5)

            var shine = Path()
            shine.move(to: CGPoint(x: 26, y: 40))
            shine.addCurve(to: CGPoint(x: 54, y: 20), control1: CGPoint(x: 30, y: 28), control2: CGPoint(x: 42, y: 21))
            ctx.stroke(shine, with: .color(.white.opacity(0.75)), style: StrokeStyle(lineWidth: 5, lineCap: .round))

            var eyes = ctx
            eyes.translateBy(x: 0, y: 50)
            eyes.scaleBy(x: 1, y: blink)
            eyes.translateBy(x: 0, y: -50)
            for x in [45.0, 77.0] {
                blob(eyes, circle(x, 50, 11), .white)
                eyes.fill(circle(x + 2, 51, 5.5), with: .color(EC.ink))
                eyes.fill(circle(x + 4, 48.5, 2), with: .color(.white))
            }

            for x in [32.0, 90.0] {
                ctx.fill(Path(ellipseIn: CGRect(x: x - 7, y: 62.5, width: 14, height: 9)), with: .color(EC.pink.opacity(0.8)))
            }

            var mouth = Path()
            mouth.move(to: CGPoint(x: 52, y: 66))
            mouth.addQuadCurve(to: CGPoint(x: 70, y: 66), control: CGPoint(x: 61, y: 80))
            mouth.closeSubpath()
            blob(ctx, mouth, EC.red)
        }
        .frame(width: size + bleed * 2 * s, height: size * 140 / 132 + bleed * 2 * s)
        .padding(-bleed * s)
        .accessibilityHidden(true)
    }
}
