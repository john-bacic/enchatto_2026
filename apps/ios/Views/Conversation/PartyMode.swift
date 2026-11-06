import SwiftUI

// MARK: - Party mode
//
// What the room shows while its vibe meter is at 150 or more (VibeScore.hypeAt), as the web's room does:
// components/room/hype-layer.tsx, join-cut-in.tsx and components/ui/effects.tsx, with their CSS in app/globals.css
// and app/screens.css

/// Pastel sunburst turning behind the messages, white at its middle (web: Rays rainbow)
struct PartyRays: View {
    private static let colors = [EC.pinkSoft, EC.yellowSoft, EC.mintSoft, EC.blueSoft, EC.violetSoft]
    /// Ten degrees a ray, the five colours over and over
    private static let stops: [Gradient.Stop] = (0..<36).flatMap { i -> [Gradient.Stop] in
        let color = colors[i % colors.count]
        return [.init(color: color, location: Double(i) / 36), .init(color: color, location: Double(i + 1) / 36)]
    }

    var body: some View {
        GeometryReader { geo in
            let center = CGPoint(x: geo.size.width / 2, y: geo.size.height * 0.42)
            let reach = 2 * hypot(geo.size.width / 2, max(center.y, geo.size.height - center.y))
            LoopClock { t in
                Circle()
                    .fill(AngularGradient(gradient: Gradient(stops: Self.stops), center: .center))
                    .frame(width: reach, height: reach)
                    .rotationEffect(.degrees((t / 40).truncatingRemainder(dividingBy: 1) * 360))
            }
            .opacity(0.95)
            .position(center)
            RadialGradient(
                stops: [
                    .init(color: .white.opacity(0.95), location: 0),
                    .init(color: .white.opacity(0.95), location: 90 / 330),
                    .init(color: .white.opacity(0), location: 1),
                ],
                center: UnitPoint(x: 0.5, y: 0.42),
                startRadius: 0,
                endRadius: 330
            )
        }
        .clipped()
    }
}

/// The people online, up to six, jumping along the bottom of the messages (web: .ec-crowd)
struct CheeringCrowd: View {
    let avatarIds: [String]

    var body: some View {
        LoopClock { t in
            HStack(spacing: 0) {
                ForEach(Array(avatarIds.enumerated()), id: \.offset) { i, avatarId in
                    let jump = Self.cheer(t, delay: Double(i % 3) * 0.15)
                    Spacer(minLength: 0)
                    Image(presetAvatar(for: avatarId).icon)
                        .resizable()
                        .interpolation(.high)
                        .scaledToFit()
                        .frame(width: 38, height: 38)
                        .shadow(color: EC.ink.opacity(0.45), radius: 0, x: 0, y: 3)
                        .rotationEffect(.degrees(-8 + 16 * jump))
                        .offset(y: -16 * jump)
                    Spacer(minLength: 0)
                }
            }
            .padding(.horizontal, 18)
        }
        .frame(height: 46, alignment: .bottom)
        .padding(.bottom, 2)
    }

    /// 0 on the ground to 1 in the air: up in half a second and back down in the next, overshooting at each end
    private static func cheer(_ seconds: Double, delay: Double) -> Double {
        guard seconds > 0 else { return 0 }
        let legs = (seconds - delay) / 0.5
        let into = legs - floor(legs)
        let rising = Int(floor(legs)) % 2 == 0
        return cubicBezier(rising ? into : 1 - into, 0.3, 1.6, 0.5, 1)
    }
}

/// String of flags across the top of the messages, swaying now and then (web: Bunting)
struct PartyBunting: View {
    private static let colors = [EC.pink, EC.blue, EC.yellow, EC.mint, EC.violet]

    var body: some View {
        GeometryReader { geo in
            LoopClock { t in
                let sway = keyframed(t, period: 2.4, [(0, 0), (0.8, 0), (0.84, -2.5), (0.88, 2.5), (0.92, -1.5), (1, 0)], ease: cssEaseInOut)
                let swell = keyframed(t, period: 2.4, [(0, 1), (0.8, 1), (0.84, 1.03), (0.88, 1.03), (0.92, 1), (1, 1)], ease: cssEaseInOut)
                Canvas { context, size in Self.draw(in: &context, size: size) }
                    .scaleEffect(swell, anchor: .top)
                    .rotationEffect(.degrees(sway), anchor: .top)
            }
            .frame(width: geo.size.width * 1.04, height: 34)
            .offset(x: -geo.size.width * 0.02)
        }
        .frame(height: 34)
    }

    /// The web's 400 × 34 drawing, stretched across
    private static func draw(in context: inout GraphicsContext, size: CGSize) {
        let sx = size.width / 400
        var line = Path()
        line.move(to: CGPoint(x: 0, y: 4))
        line.addQuadCurve(to: CGPoint(x: 400 * sx, y: 4), control: CGPoint(x: 200 * sx, y: 22))
        context.stroke(line, with: .color(EC.ink), lineWidth: 2.5)
        for i in 0..<16 {
            let x = 6 + CGFloat(i) * 25
            let y = 4 + 36 * (x / 400) * (1 - x / 400)
            var flag = Path()
            flag.move(to: CGPoint(x: x * sx, y: y))
            flag.addLine(to: CGPoint(x: (x + 18) * sx, y: y))
            flag.addLine(to: CGPoint(x: (x + 9) * sx, y: y + 16))
            flag.closeSubpath()
            context.fill(flag, with: .color(colors[i % colors.count]))
            context.stroke(flag, with: .color(EC.ink), style: StrokeStyle(lineWidth: 2.5, lineJoin: .round))
        }
    }
}

/// The back-and-forth combo from three on: each message in the other language from the one before, none of them
/// 90 s after it (web: .ec-combo). Give it the combo as its id, so that it pops in again each time it grows
struct ComboCard: View {
    let combo: Int
    let multiplier: Double
    let language: String

    var body: some View {
        LoopClock { t in
            let kick = keyframed(t, period: 0.6, [(0, 0), (0.5, 1), (1, 0)], ease: cssEaseInOut)
            card
                .scaleEffect(1 + 0.08 * kick)
                .rotationEffect(.degrees(-3 + kick))
        }
        .popIn()
    }

    private var card: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: 5) {
                Text("×\(combo)")
                    .font(.chunky(22))
                    .foregroundStyle(EC.red)
                Text(L.t("BACK & FORTH!", language))
                    .font(.round(11, .black))
                    .foregroundStyle(EC.ink)
            }
            Text(String(format: "VIBE ×%.2f", multiplier))
                .font(.round(10, .black))
                .foregroundStyle(EC.red)
        }
        .padding(.horizontal, 10)
        .padding(.top, 2)
        .padding(.bottom, 10)
        .overlay {
            // Full at a combo of 20, where the multiplier stops growing
            GeometryReader { geo in
                Capsule()
                    .fill(EC.blue)
                    .frame(width: (geo.size.width - 12) * CGFloat(min(combo, 20)) / 20, height: 4)
                    .offset(x: 6, y: geo.size.height - 7)
            }
        }
        .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(EC.yellowSoft))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
        .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(EC.ink).offset(y: 3))
    }
}

/// A new message's points, "+12", or "+32" when it switched language (web: .ec-floater)
struct VibeFloater: Identifiable {
    let id = UUID()
    let text: String
    /// Where it rises, across the messages from 0 to 1
    let across: CGFloat
}

/// Pops up and floats away in 1.4 s
struct VibeFloaterView: View {
    let text: String
    @State private var pose = 0

    private static let lift: [CGFloat] = [10, 0, -40]
    private static let scale: [CGFloat] = [0.6, 1.1, 1]
    private static let opacity: [Double] = [0, 1, 0]

    var body: some View {
        OutlinedText(text, size: 20, fill: EC.pink, outline: 2)
            .scaleEffect(Self.scale[pose])
            .offset(y: Self.lift[pose])
            .opacity(Self.opacity[pose])
            .task {
                withAnimation(.easeOut(duration: 0.28)) { pose = 1 }
                try? await Task.sleep(nanoseconds: 280_000_000)
                withAnimation(.easeOut(duration: 1.12)) { pose = 2 }
            }
    }
}

/// Bulbs chasing round the newest bubble (web: .ec-marquee). Laid over the bubble 7 pt larger all round, so that
/// they ring it clear of its border
struct MarqueeLights: View {
    var body: some View {
        GeometryReader { geo in
            let radius = min(26, min(geo.size.width, geo.size.height) / 2)
            let perimeter = 2 * (geo.size.width + geo.size.height) - (8 - 2 * .pi) * radius
            // A whole number of bulbs round the ring, so that none crowd where it closes
            let gap = perimeter / max(8, (perimeter / 12).rounded())
            LoopClock { t in
                let run = CGFloat((t * 32).truncatingRemainder(dividingBy: Double(gap * 2)))
                let ring = RoundedRectangle(cornerRadius: radius, style: .circular)
                ZStack {
                    ring.stroke(EC.yellow, style: Self.bulbs(width: 7, every: gap * 2, at: run))
                    ring.stroke(EC.pink, style: Self.bulbs(width: 7, every: gap * 2, at: run + gap))
                    ring.stroke(.white, style: Self.bulbs(width: 3, every: gap, at: run))
                }
            }
        }
        .allowsHitTesting(false)
    }

    /// Dots `width` across, `every` points apart along the path, the first `at` points along it
    private static func bulbs(width: CGFloat, every: CGFloat, at: CGFloat) -> StrokeStyle {
        let start = at.truncatingRemainder(dividingBy: every)
        return StrokeStyle(lineWidth: width, lineCap: .round, dash: [0, every], dashPhase: every - start)
    }
}

/// Who joined, on a striped band that sweeps across the screen in 2.4 s (web: CutIn in join-cut-in.tsx). Give it
/// the join's id, so that the next one sweeps again
struct JoinCutInBanner: View {
    let name: String
    let avatarId: String?
    let language: String
    /// Where the band is, in its own widths: in from the right, a stop in the middle, out to the left
    @State private var shift: CGFloat = 1.1

    private var title: String {
        let text = L.t("{name} JOINED!", language).replacingOccurrences(of: "{name}", with: name)
        return language == "ja" ? text : text.uppercased()
    }

    var body: some View {
        GeometryReader { geo in
            let width = geo.size.width * 1.4
            ZStack {
                CutInStripes()
                    .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 4) }
                    .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 4) }
                HStack(spacing: 10) {
                    if let avatarId { AvatarDisc(avatarId: avatarId, size: 54) }
                    OutlinedText(title, size: 30)
                }
            }
            .frame(width: width, height: 74)
            .rotationEffect(.degrees(-8))
            .offset(x: shift * width)
            .position(x: geo.size.width / 2, y: geo.size.height * 0.38 + 37)
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
        .task {
            withAnimation(.timingCurve(0.2, 0.9, 0.3, 1, duration: 0.43)) { shift = 0 }
            try? await Task.sleep(nanoseconds: 1_730_000_000)
            withAnimation(.timingCurve(0.2, 0.9, 0.3, 1, duration: 0.67)) { shift = -1.1 }
        }
    }
}

/// Pink stripes 22 pt wide, leaning right
private struct CutInStripes: View {
    var body: some View {
        Canvas { context, size in
            context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(EC.pink))
            // 45° stripes: 44 pt a pair square to them is 44√2 along the band
            let pair = 44 * 2.squareRoot()
            var x = -size.height
            while x < size.width {
                var stripe = Path()
                stripe.move(to: CGPoint(x: x + size.height, y: 0))
                stripe.addLine(to: CGPoint(x: x + size.height + pair / 2, y: 0))
                stripe.addLine(to: CGPoint(x: x + pair / 2, y: size.height))
                stripe.addLine(to: CGPoint(x: x, y: size.height))
                stripe.closeSubpath()
                context.fill(stripe, with: .color(Color(hex: "ff9ccc")))
                x += pair
            }
        }
    }
}
