import SwiftUI

// MARK: - Confetti

/// Burst of confetti each time `trigger` changes. Overlay it full-screen; it ignores touches.
struct ConfettiBurst: View {
    let trigger: Int
    var count = 46

    private struct Piece: Identifiable {
        let id = UUID()
        let x: CGFloat
        let drift: CGFloat
        let color: Color
        let size: CGSize
        let spin: Double
        let delay: Double
        let duration: Double
        let circle: Bool
    }

    @State private var pieces: [Piece] = []
    @State private var falling = false

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(pieces) { p in
                    Group {
                        if p.circle {
                            Circle().fill(p.color)
                        } else {
                            Rectangle().fill(p.color)
                        }
                    }
                    .frame(width: p.size.width, height: p.size.height)
                    .overlay(Rectangle().stroke(EC.ink.opacity(0.15), lineWidth: 1).opacity(p.circle ? 0 : 1))
                    .rotationEffect(.degrees(falling ? p.spin : 0))
                    .position(
                        x: geo.size.width * p.x + (falling ? p.drift : 0),
                        y: falling ? geo.size.height + 40 : -30
                    )
                    .animation(.easeIn(duration: p.duration).delay(p.delay), value: falling)
                }
            }
        }
        .allowsHitTesting(false)
        .onChange(of: trigger) { _ in fire() }
    }

    private func fire() {
        let colors = [EC.pink, EC.yellow, EC.blue, EC.mint, EC.violet, EC.red]
        falling = false
        pieces = (0..<count).map { _ in
            Piece(
                x: .random(in: 0.02...0.98),
                drift: .random(in: -70...70),
                color: colors.randomElement()!,
                size: CGSize(width: .random(in: 7...12), height: .random(in: 10...18)),
                spin: .random(in: -720...720),
                delay: .random(in: 0...0.35),
                duration: .random(in: 1.4...2.4),
                circle: Bool.random() && Bool.random()
            )
        }
        DispatchQueue.main.async { falling = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { pieces = [] }
    }
}

// MARK: - Cut-in banner

/// Skewed banner that slams in across the screen ("CORRECT!", "NATIVE!")
struct CutInBanner: View {
    let text: String
    var fill: Color = EC.pink
    var icon: String? = nil
    @State private var shown = false

    var body: some View {
        HStack(spacing: 12) {
            if let icon { PackIcon(icon, size: 44) }
            OutlinedText(text, size: 34, fill: EC.textOn(fill) == .white ? .white : EC.yellow)
        }
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity)
        .background(
            Rectangle()
                .fill(fill)
                .overlay(Rectangle().stroke(EC.ink, lineWidth: 4))
                .rotationEffect(.degrees(-4))
                .padding(.horizontal, -40)
        )
        .offset(x: shown ? 0 : -500)
        .scaleEffect(shown ? 1 : 1.3)
        .onAppear {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.65)) { shown = true }
        }
        .allowsHitTesting(false)
    }
}

// MARK: - Looping motion

/// Clock-driven loop. Never start loops with `withAnimation(.repeatForever)` in onAppear: the
/// repeating transaction can capture unrelated layout changes (nav bar / safe area settling) and
/// make whole headers and input bars bob forever.
struct LoopClock<Content: View>: View {
    var active = true
    @ViewBuilder let content: (_ seconds: Double) -> Content
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        if active && !reduceMotion {
            TimelineView(.animation) { ctx in
                content(ctx.date.timeIntervalSinceReferenceDate)
            }
        } else {
            content(0)
        }
    }
}

/// Smooth -1...1 wave for LoopClock time
func loopWave(_ seconds: Double, period: Double, delay: Double = 0) -> Double {
    sin((seconds - delay) * 2 * .pi / period)
}

/// One-shot damped wiggle/hop, replayed whenever `trigger` changes. Finite, so nothing loops.
private struct NudgeEffect: GeometryEffect {
    var progress: Double
    let angle: Double
    let hop: CGFloat

    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func effectValue(size: CGSize) -> ProjectionTransform {
        let damp = 1 - progress
        let wave = sin(progress * .pi * 4) * damp
        let rot = CGFloat(wave * angle * .pi / 180)
        let lift = -abs(CGFloat(sin(progress * .pi * 2))) * hop * CGFloat(damp)
        let t = CGAffineTransform(translationX: size.width / 2, y: size.height / 2 + lift)
            .rotated(by: rot)
            .translatedBy(x: -size.width / 2, y: -size.height / 2)
        return ProjectionTransform(t)
    }
}

private struct NudgeModifier<T: Equatable>: ViewModifier {
    let trigger: T
    let active: Bool
    let angle: Double
    let hop: CGFloat
    let delay: Double
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var progress = 1.0

    func body(content: Content) -> some View {
        content
            .modifier(NudgeEffect(progress: progress, angle: angle, hop: hop))
            .onAppear { play() }
            .onChange(of: trigger) { _ in play() }
    }

    private func play() {
        guard active, !reduceMotion else { return }
        progress = 0
        withAnimation(.easeOut(duration: 0.7).delay(delay)) { progress = 1 }
    }
}

extension View {
    /// Wiggle (and optionally hop) once on appear and each time `trigger` changes
    func nudge<T: Equatable>(on trigger: T, active: Bool = true, angle: Double = 4, hop: CGFloat = 0, delay: Double = 0) -> some View {
        modifier(NudgeModifier(trigger: trigger, active: active, angle: angle, hop: hop, delay: delay))
    }
}

// MARK: - Rays

/// Slowly spinning sunburst behind a hero element
struct RaysView: View {
    var color: Color = EC.yellow.opacity(0.45)
    var rays = 18

    var body: some View {
        let stops: [Gradient.Stop] = (0..<rays).flatMap { i -> [Gradient.Stop] in
            let a = Double(i) / Double(rays)
            let mid = (Double(i) + 0.5) / Double(rays)
            let b = Double(i + 1) / Double(rays)
            return [
                .init(color: color, location: a),
                .init(color: color, location: mid),
                .init(color: .clear, location: mid),
                .init(color: .clear, location: b),
            ]
        }
        LoopClock { t in
            Circle()
                .fill(AngularGradient(gradient: Gradient(stops: stops), center: .center))
                .mask(RadialGradient(colors: [.black, .black.opacity(0)], center: .center, startRadius: 10, endRadius: 220))
                .rotationEffect(.degrees(t.truncatingRemainder(dividingBy: 24) / 24 * 360))
        }
        .allowsHitTesting(false)
    }
}

// MARK: - Stamp / pop-in

extension View {
    /// Slams in from big → normal with a little rotation (web: ec-stamp)
    func stampIn(delay: Double = 0) -> some View {
        modifier(StampInModifier(delay: delay))
    }

    /// Pops in from small with a springy overshoot
    func popIn(delay: Double = 0) -> some View {
        modifier(PopInModifier(delay: delay))
    }
}

private struct StampInModifier: ViewModifier {
    let delay: Double
    @State private var landed = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(landed ? 1 : 2.2)
            .rotationEffect(.degrees(landed ? -4 : -18))
            .opacity(landed ? 1 : 0)
            .onAppear {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.55).delay(delay)) { landed = true }
            }
    }
}

private struct PopInModifier: ViewModifier {
    let delay: Double
    @State private var shown = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(shown ? 1 : 0.4)
            .opacity(shown ? 1 : 0)
            .onAppear {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.6).delay(delay)) { shown = true }
            }
    }
}

// MARK: - Floating score

/// "+300" that floats up and fades. Re-create with a new `.id()` to replay.
struct FloatingScore: View {
    let text: String
    var fill: Color = EC.yellow
    @State private var up = false

    var body: some View {
        OutlinedText(text, size: 30, fill: fill)
            .offset(y: up ? -70 : 0)
            .opacity(up ? 0 : 1)
            .scaleEffect(up ? 1.2 : 0.8)
            .onAppear {
                withAnimation(.easeOut(duration: 1.1)) { up = true }
            }
            .allowsHitTesting(false)
    }
}

// MARK: - Haptics

enum Haptics {
    static func tap() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    static func thump() { UIImpactFeedbackGenerator(style: .heavy).impactOccurred() }
    static func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
    static func error() { UINotificationFeedbackGenerator().notificationOccurred(.error) }
}
