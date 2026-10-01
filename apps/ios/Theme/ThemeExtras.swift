import CoreImage.CIFilterBuiltins
import SwiftUI

// MARK: - QR code

enum QRCodeImage {
    /// Ink-on-white QR. Level "H" tolerates a logo covering the centre.
    static func make(_ string: String, level: String = "H") -> UIImage? {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = level
        guard let output = filter.outputImage else { return nil }
        let colored = output.applyingFilter("CIFalseColor", parameters: [
            "inputColor0": CIColor(red: 29 / 255, green: 27 / 255, blue: 79 / 255),
            "inputColor1": CIColor(red: 1, green: 1, blue: 1),
        ])
        let scaled = colored.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cgImage = CIContext().createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}

/// Ink-on-white QR card with Chatto in the middle
struct ECQRCard: View {
    let url: String
    var size: CGFloat = 220

    var body: some View {
        if let image = QRCodeImage.make(url) {
            Image(uiImage: image)
                .interpolation(.none)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
                .overlay {
                    ChattoView(size: size * 0.17, bob: false)
                        .padding(size * 0.03)
                        .ecOutline(radius: size * 0.06, border: 2.5)
                }
                .padding(size * 0.07)
                .ecCard(radius: 26, border: 3.5, shadow: 7)
                .accessibilityLabel("QR code")
        }
    }
}

// MARK: - Shapes

/// Spiky starburst used behind logos and big moments
struct StarBurst: Shape {
    var points = 14
    var innerRatio: CGFloat = 0.78

    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        var path = Path()
        for i in 0..<(points * 2) {
            let angle = CGFloat(i) * .pi / CGFloat(points) - .pi / 2
            let r = i.isMultiple(of: 2) ? radius : radius * innerRatio
            let pt = CGPoint(x: center.x + cos(angle) * r, y: center.y + sin(angle) * r)
            if i == 0 { path.move(to: pt) } else { path.addLine(to: pt) }
        }
        path.closeSubpath()
        return path
    }
}

/// Horizontal dashed rule (translation divider inside bubbles)
struct DashedRule: View {
    var color: Color = EC.lineSoft

    var body: some View {
        Line()
            .stroke(color, style: StrokeStyle(lineWidth: 2.5, lineCap: .round, dash: [5, 5]))
            .frame(height: 2.5)
    }

    private struct Line: Shape {
        func path(in rect: CGRect) -> Path {
            var path = Path()
            path.move(to: CGPoint(x: 0, y: rect.midY))
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
            return path
        }
    }
}

// MARK: - Presence

struct PresenceDot: View {
    let participant: Participant
    var size: CGFloat = 10

    var body: some View {
        Circle()
            .fill(participant.online ? (participant.isAway ? EC.yellow : EC.mint) : EC.lineSoft)
            .frame(width: size, height: size)
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: max(1.5, size * 0.2)))
    }
}

// MARK: - Text field

extension View {
    /// White ink-outlined input with a small hard shadow
    func ecField(radius: CGFloat = 18) -> some View {
        font(.round(17, .bold))
            .foregroundStyle(EC.ink)
            .tint(EC.pink)
            .padding(.horizontal, 16)
            .frame(minHeight: 52)
            .ecCard(radius: radius, border: 3, shadow: 5)
    }
}
