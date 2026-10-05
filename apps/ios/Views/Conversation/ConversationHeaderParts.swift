import SwiftUI

/// Collapsed header stand-in for a crowded room: two overlapped avatars with a head count
struct ParticipantStack: View {
    let participants: [Participant]

    var body: some View {
        ZStack(alignment: .topTrailing) {
            ZStack {
                if participants.count > 1 {
                    AvatarDisc(avatarId: participants[1].avatar.value, size: 26)
                        .offset(x: -12, y: 2)
                }
                if let first = participants.first {
                    AvatarDisc(avatarId: first.avatar.value, size: 32)
                }
            }
            .padding(.leading, 12)
            Text("\(participants.count)")
                .font(.chunky(11))
                .foregroundStyle(.white)
                .padding(.horizontal, 4)
                .frame(minWidth: 19, minHeight: 19)
                .background(Capsule().fill(EC.pink))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                .offset(x: 6, y: -6)
        }
    }
}

// MARK: - QR Code Icon
/// QR glyph made of sushi: side-view maki sit in the three finder corners, roe and sesame fill the
/// data corner. Drawn in a 100×100 box.
struct QRCodeIcon: View {
    private static let rice = Color(hex: "fffaf0")
    private static let salmon = Color(hex: "ff8a5c")
    private static let cucumber = Color(hex: "8ad35c")
    private static let tamago = Color(hex: "ffc93c")

    var body: some View {
        Canvas { ctx, size in
            ctx.scaleBy(x: size.width / 100, y: size.height / 100)
            Self.maki(ctx, cx: 28, top: 24, w: 40, h: 17, filling: Self.salmon)
            Self.maki(ctx, cx: 72, top: 24, w: 40, h: 17, filling: Self.cucumber)
            Self.maki(ctx, cx: 28, top: 66, w: 40, h: 17, filling: Self.tamago)
            for (x, y, color) in [(66.0, 64.0, Self.salmon), (80, 70, Self.cucumber), (70, 80, Self.salmon)] {
                let roe = Path(ellipseIn: CGRect(x: x - 5.5, y: y - 5.5, width: 11, height: 11))
                ctx.fill(roe, with: .color(color))
                ctx.stroke(roe, with: .color(EC.ink), lineWidth: 2.4)
            }
            ctx.fill(Path(ellipseIn: CGRect(x: 79, y: 81, width: 6, height: 6)), with: .color(EC.ink))
            ctx.fill(Path(ellipseIn: CGRect(x: 59.4, y: 75.4, width: 5.2, height: 5.2)), with: .color(EC.ink))
        }
    }

    /// Nori cylinder with a rice top and a finder-square filling
    private static func maki(_ ctx: GraphicsContext, cx: CGFloat, top: CGFloat, w: CGFloat, h: CGFloat, filling: Color) {
        let rx = w / 2
        let ry = w * 0.27
        var body = Path()
        body.move(to: CGPoint(x: cx - rx, y: top))
        body.addLine(to: CGPoint(x: cx - rx, y: top + h))
        for i in 1...24 {
            let a = Double.pi - Double.pi * Double(i) / 24
            body.addLine(to: CGPoint(x: cx + rx * cos(a), y: top + h + ry * sin(a)))
        }
        body.addLine(to: CGPoint(x: cx + rx, y: top))
        body.closeSubpath()
        let lid = Path(ellipseIn: CGRect(x: cx - rx, y: top - ry, width: w, height: ry * 2))

        ctx.fill(body, with: .color(EC.ink))
        ctx.fill(lid, with: .color(EC.ink))

        let rrx = rx * 0.8
        let rry = ry * 0.72
        ctx.fill(Path(ellipseIn: CGRect(x: cx - rrx, y: top - rry, width: rrx * 2, height: rry * 2)), with: .color(rice))
        let core = Path(
            roundedRect: CGRect(x: cx - rrx * 0.475, y: top - rry * 0.5, width: rrx * 0.95, height: rry),
            cornerRadius: rry * 0.22
        )
        ctx.fill(core, with: .color(filling))
        ctx.stroke(core, with: .color(EC.ink), lineWidth: rrx * 0.12)

        var shine = Path()
        shine.move(to: CGPoint(x: cx - rx * 0.7, y: top + ry * 0.95))
        shine.addLine(to: CGPoint(x: cx - rx * 0.7, y: top + h * 0.85))
        ctx.stroke(shine, with: .color(.white.opacity(0.9)), style: StrokeStyle(lineWidth: w * 0.07, lineCap: .round))
    }
}
