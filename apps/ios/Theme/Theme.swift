import CoreText
import SwiftUI

// Mirrors the tokens in apps/web/app/globals.css.
enum EC {
    static let ink = Color(hex: "1d1b4f")
    static let inkSoft = Color(hex: "8a8cb0")
    static let lineSoft = Color(hex: "c9cbe8")
    static let paper = Color(hex: "fff8ec")
    static let blue = Color(hex: "3b6bff")
    static let blueDeep = Color(hex: "2647c9")
    static let blueSoft = Color(hex: "d9e4ff")
    static let pink = Color(hex: "ff7ab6")
    static let pinkSoft = Color(hex: "ffd0e4")
    static let yellow = Color(hex: "ffd23f")
    static let yellowSoft = Color(hex: "fff4c4")
    static let mint = Color(hex: "3fdcb0")
    static let mintSoft = Color(hex: "dcfaef")
    static let violet = Color(hex: "a77bff")
    static let violetSoft = Color(hex: "efe6ff")
    static let red = Color(hex: "ff4f6d")

    /// Ink text reads on these fills; everything else gets white text.
    static func textOn(_ fill: Color) -> Color {
        [yellow, mint, .white, yellowSoft, mintSoft, pinkSoft, blueSoft, violetSoft].contains(fill) ? ink : .white
    }
}

// MARK: - Fonts

enum ECFonts {
    static let files = ["DelaGothicOne-Regular", "ZenMaruGothic-Medium", "ZenMaruGothic-Bold", "ZenMaruGothic-Black"]

    /// Info.plist is generated (no UIAppFonts), so register bundled TTFs at launch.
    static func register() {
        for name in files {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}

enum RoundWeight: String {
    case medium = "ZenMaruGothic-Medium"
    case bold = "ZenMaruGothic-Bold"
    case black = "ZenMaruGothic-Black"
}

extension Font {
    /// Dela Gothic One — headlines, buttons, scores. The bundled file has no common kanji: its kanji strokes are so
    /// heavy that dense characters fill in at button and label sizes. Kanji come from Zen Maru Gothic Black instead,
    /// named here as the face to fall to, since a missing glyph would otherwise get the system's regular weight
    static func chunky(_ size: CGFloat, relativeTo style: Font.TextStyle = .title) -> Font {
        let kanji = UIFontDescriptor(fontAttributes: [.name: RoundWeight.black.rawValue])
        let descriptor = UIFontDescriptor(fontAttributes: [.name: "DelaGothicOne-Regular", .cascadeList: [kanji]])
        // The size follows the text size setting as it stood when the view was drawn
        let scaled = UIFontMetrics(forTextStyle: style.uiTextStyle).scaledValue(for: size)
        return Font(UIFont(descriptor: descriptor, size: scaled))
    }

    /// Zen Maru Gothic — body copy
    static func round(_ size: CGFloat, _ weight: RoundWeight = .bold, relativeTo style: Font.TextStyle = .body) -> Font {
        .custom(weight.rawValue, size: size, relativeTo: style)
    }
}

private extension Font.TextStyle {
    var uiTextStyle: UIFont.TextStyle {
        switch self {
        case .largeTitle: .largeTitle
        case .title: .title1
        case .title2: .title2
        case .title3: .title3
        case .headline: .headline
        case .subheadline: .subheadline
        case .body: .body
        case .callout: .callout
        case .footnote: .footnote
        case .caption: .caption1
        case .caption2: .caption2
        @unknown default: .body
        }
    }
}

/// Chat bubble text size from the room's display settings, stored per device
enum ChatTextSize: String, CaseIterable {
    case small, medium, large

    static let storageKey = "enchatto_chatTextSize"

    var scale: CGFloat {
        switch self {
        case .small: 1
        case .medium: 1.15
        case .large: 1.3
        }
    }

    var label: String {
        switch self {
        case .small: "Small"
        case .medium: "Medium"
        case .large: "Large"
        }
    }
}

// MARK: - Card

struct ECCardModifier: ViewModifier {
    var fill: Color = .white
    var radius: CGFloat = 26
    var border: CGFloat = 3
    var shadow: CGFloat = 7

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        content
            .background(shape.fill(fill))
            .overlay(shape.strokeBorder(EC.ink, lineWidth: border))
            .background(shape.fill(EC.ink).offset(y: shadow))
            .padding(.bottom, shadow)
    }
}

extension View {
    func ecCard(fill: Color = .white, radius: CGFloat = 26, border: CGFloat = 3, shadow: CGFloat = 7) -> some View {
        modifier(ECCardModifier(fill: fill, radius: radius, border: border, shadow: shadow))
    }

    /// Thin ink outline without the hard shadow
    func ecOutline(fill: Color = .white, radius: CGFloat = 16, border: CGFloat = 2.5) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        return background(shape.fill(fill)).overlay(shape.strokeBorder(EC.ink, lineWidth: border))
    }

    /// Fixed-size dot paper background used by full-screen views outside a room
    func ecPaperBackground() -> some View {
        background(RoomBackground(index: 0).ignoresSafeArea())
    }
}

// MARK: - Buttons

enum ChunkySize {
    case large, small, mini

    var height: CGFloat { self == .large ? 58 : self == .small ? 44 : 34 }
    var font: CGFloat { self == .large ? 20 : self == .small ? 15 : 13 }
    var radius: CGFloat { self == .large ? 22 : self == .small ? 16 : 12 }
    var border: CGFloat { self == .large ? 3.5 : 3 }
    var shadow: CGFloat { self == .large ? 7 : self == .small ? 4 : 3 }
}

struct ChunkyButtonStyle: ButtonStyle {
    var fill: Color = EC.blue
    var size: ChunkySize = .large
    var fullWidth = true

    func makeBody(configuration: Configuration) -> some View {
        ChunkyButtonBody(configuration: configuration, fill: fill, size: size, fullWidth: fullWidth)
    }

    private struct ChunkyButtonBody: View {
        let configuration: Configuration
        let fill: Color
        let size: ChunkySize
        let fullWidth: Bool
        @Environment(\.isEnabled) private var isEnabled

        var body: some View {
            let pressed = configuration.isPressed && isEnabled
            let shape = RoundedRectangle(cornerRadius: size.radius, style: .continuous)
            let text = EC.textOn(fill)
            configuration.label
                .font(.chunky(size.font, relativeTo: .headline))
                .foregroundStyle(text)
                .shadow(color: text == .white ? EC.ink.opacity(0.5) : .clear, radius: 0, y: size == .large ? 3 : 2)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .padding(.horizontal, size == .mini ? 12 : 18)
                .frame(maxWidth: fullWidth ? .infinity : nil, minHeight: size.height)
                .background(shape.fill(fill))
                .overlay(shape.strokeBorder(EC.ink, lineWidth: size.border))
                .offset(y: pressed ? size.shadow - 2 : 0)
                .background(shape.fill(EC.ink).offset(y: size.shadow))
                .padding(.bottom, size.shadow)
                .opacity(isEnabled ? 1 : 0.5)
                .animation(.easeOut(duration: 0.08), value: pressed)
                .contentShape(shape)
        }
    }
}

extension ButtonStyle where Self == ChunkyButtonStyle {
    static func chunky(_ fill: Color = EC.blue, size: ChunkySize = .large, fullWidth: Bool = true) -> ChunkyButtonStyle {
        ChunkyButtonStyle(fill: fill, size: size, fullWidth: fullWidth)
    }
}

/// Circular white ink-outlined icon button (header back / close / more)
struct RoundIconButtonStyle: ButtonStyle {
    var fill: Color = .white
    var diameter: CGFloat = 44

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed
        configuration.label
            .font(.system(size: diameter * 0.4, weight: .black))
            .foregroundStyle(EC.textOn(fill))
            .frame(width: diameter, height: diameter)
            .background(Circle().fill(fill))
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
            .offset(y: pressed ? 2 : 0)
            .background(Circle().fill(EC.ink).offset(y: 4))
            .padding(.bottom, 4)
            .animation(.easeOut(duration: 0.08), value: pressed)
    }
}

extension ButtonStyle where Self == RoundIconButtonStyle {
    static func roundIcon(_ fill: Color = .white, diameter: CGFloat = 44) -> RoundIconButtonStyle {
        RoundIconButtonStyle(fill: fill, diameter: diameter)
    }
}

/// Small bouncy press feedback for tappable cards/tiles
struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PressableStyle {
    static var pressable: PressableStyle { PressableStyle() }
}

// MARK: - Text

/// Chunky text with an ink outline (web: text-shadow --outline3)
struct OutlinedText: View {
    let text: String
    var size: CGFloat = 28
    var fill: Color = .white
    var outline: CGFloat = 3
    var dropShadow = true
    /// Defaults to the chunky display face
    var font: Font?

    init(_ text: String, size: CGFloat = 28, fill: Color = .white, outline: CGFloat = 3, dropShadow: Bool = true, font: Font? = nil) {
        self.text = text
        self.size = size
        self.fill = fill
        self.outline = outline
        self.dropShadow = dropShadow
        self.font = font
    }

    var body: some View {
        ZStack {
            ForEach(0..<12, id: \.self) { i in
                let a = Double(i) * .pi / 6
                Text(text).foregroundStyle(EC.ink).offset(x: cos(a) * outline, y: sin(a) * outline)
            }
            if dropShadow {
                Text(text).foregroundStyle(EC.ink).offset(y: outline + 2)
            }
            Text(text).foregroundStyle(fill)
        }
        .font(font ?? .chunky(size))
        .padding(outline)
    }
}

/// Small rounded pill label
struct ECChip: View {
    let text: String
    var fill: Color = .white
    var icon: String? = nil

    var body: some View {
        HStack(spacing: 4) {
            if let icon {
                Image(icon).resizable().scaledToFit().frame(width: 16, height: 16)
            }
            Text(text).font(.round(12, .black)).foregroundStyle(EC.textOn(fill))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(Capsule().fill(fill))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
    }
}

/// "A" / "あ" language badge
struct LangBadge: View {
    let lang: String
    var size: CGFloat = 22

    var body: some View {
        let ja = lang.hasPrefix("ja")
        Text(ja ? "あ" : "A")
            .font(.round(size * 0.55, .black))
            .foregroundStyle(.white)
            .frame(width: size, height: size)
            .background(Circle().fill(ja ? EC.pink : EC.blue))
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: max(1.5, size * 0.09)))
    }
}

/// Section label ("YOUR NAME", "PICK A BUDDY")
struct ECLabel: View {
    let text: String

    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text.uppercased())
            .font(.round(12, .black))
            .tracking(1.2)
            .foregroundStyle(EC.inkSoft)
    }
}
