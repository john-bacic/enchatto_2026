import SwiftUI

struct DrawingComposerView: View {
    var lang: String = "en"
    var onSend: (UIImage) -> Void
    var onCancel: () -> Void
    var gameMode: Bool = false
    var countdownSeconds: Int = -1 // -1 = no countdown
    @Binding var triggerAutoSubmit: Bool

    @State private var lines: [DrawingLine] = []
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4
    @State private var canvasView: DrawingUIView?
    @State private var hue: CGFloat = 0
    @State private var lightness: CGFloat = 0 // 0 = black, 0.5 = pure color, 1 = white

    private let minWidth: CGFloat = 1
    private let maxWidth: CGFloat = 40

    private var hasDrawing: Bool { !lines.isEmpty }

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            spectrumColorPicker
            canvasSection
            Spacer()
            bottomBar
        }
        // In a game the cover around it draws the background
        .ecPaperBackground(drawn: !gameMode)
        .onChange(of: triggerAutoSubmit) { triggered in
            if triggered {
                sendDrawing()
            }
        }
    }

    // MARK: - Canvas

    private var canvasSection: some View {
        DrawingCanvasView(
            lines: $lines,
            strokeColor: selectedColor,
            lineWidth: lineWidth,
            onViewReady: { canvasView = $0 }
        )
        .aspectRatio(1, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
        .ecCard(radius: 22, border: 3.5, shadow: 7)
        .padding(.horizontal)
    }

    // MARK: - Bottom bar

    private var bottomBar: some View {
        ZStack {
            // Close — bottom left
            HStack {
                Button {
                    onCancel()
                } label: {
                    Image(systemName: "xmark")
                }
                .buttonStyle(.roundIcon(diameter: 54))
                .accessibilityLabel(L.t("Close", lang))
                Spacer()
            }

            // Send — bottom center
            DrawingSendButton(hasDrawing: hasDrawing, countdownSeconds: countdownSeconds) {
                sendDrawing()
            }

            // Undo — bottom right
            HStack {
                Spacer()
                Button {
                    if !lines.isEmpty {
                        Haptics.tap()
                        lines.removeLast()
                    }
                } label: {
                    Image(systemName: "arrow.uturn.backward")
                }
                .buttonStyle(.roundIcon(hasDrawing ? EC.yellow : EC.lineSoft, diameter: 54))
                .disabled(!hasDrawing)
                .accessibilityLabel("Undo")
            }
        }
        .padding(.horizontal)
        .padding(.bottom, 24)
    }

    // MARK: - Spectrum color picker

    private var spectrumColorPicker: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                VStack(spacing: 10) {
                    SpectrumBar(
                        value: $hue,
                        gradient: LinearGradient(
                            colors: stride(from: 0.0, through: 1.0, by: 1.0 / 6.0).map {
                                Color(hue: $0, saturation: 1, brightness: 1)
                            },
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        thumbColor: Color(hue: hue, saturation: 1, brightness: 1)
                    )
                    SpectrumBar(
                        value: $lightness,
                        gradient: LinearGradient(
                            colors: [.black, Color(hue: hue, saturation: 1, brightness: 1), .white],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        thumbColor: selectedColor
                    )
                }
                Circle()
                    .fill(selectedColor)
                    .frame(width: max(lineWidth, 6), height: max(lineWidth, 6))
                    .overlay(Circle().strokeBorder(EC.ink.opacity(0.25), lineWidth: 1))
                    .frame(width: 46, height: 46)
                    .ecCard(radius: 14, border: 2.5, shadow: 3)
            }
            PenSizeBar(value: $lineWidth, range: minWidth...maxWidth, color: selectedColor)
        }
        .padding(.horizontal)
        .onChange(of: hue) { _ in
            // If brightness is at black or white extremes, reset to center so the color is visible
            if lightness <= 0.05 || lightness >= 0.95 {
                lightness = 0.5
            }
            syncColorFromSpectrum()
        }
        .onChange(of: lightness) { _ in syncColorFromSpectrum() }
    }

    private func syncColorFromSpectrum() {
        if lightness <= 0.5 {
            let b = lightness * 2
            selectedColor = Color(hue: hue, saturation: 1, brightness: b)
        } else {
            let s = 1 - (lightness - 0.5) * 2
            selectedColor = Color(hue: hue, saturation: s, brightness: 1)
        }
    }

    private func sendDrawing() {
        guard let image = canvasView?.renderToImage() else { return }
        onSend(image)
    }
}

// MARK: - Drawing send button with pulse

private struct DrawingSendButton: View {
    let hasDrawing: Bool
    var countdownSeconds: Int = -1
    let action: () -> Void
    @State private var pulsing = false
    @State private var countdownPulse = false

    private var showCountdown: Bool { countdownSeconds >= 0 }
    private var isUrgent: Bool { countdownSeconds <= 3 && countdownSeconds >= 0 }

    private var buttonColor: Color {
        if showCountdown {
            return isUrgent ? EC.red : EC.blue
        }
        return hasDrawing ? EC.blue : EC.lineSoft
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                if hasDrawing && !showCountdown {
                    Circle()
                        .fill(EC.blue)
                        .frame(width: 66, height: 66)
                        .scaleEffect(pulsing ? 1.7 : 1)
                        .opacity(pulsing ? 0 : 0.45)
                        .animation(
                            .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                            value: pulsing
                        )
                }
                if showCountdown {
                    Circle()
                        .fill(buttonColor)
                        .frame(width: 66, height: 66)
                        .scaleEffect(countdownPulse ? 1.7 : 1)
                        .opacity(countdownPulse ? 0 : 0.45)
                }
                Circle()
                    .fill(EC.ink)
                    .frame(width: 66, height: 66)
                    .offset(y: 5)
                Circle()
                    .fill(buttonColor)
                    .frame(width: 66, height: 66)
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3.5))
                if showCountdown {
                    Text("\(countdownSeconds)")
                        .font(.chunky(28))
                        .foregroundStyle(.white)
                        .contentTransition(.numericText())
                } else {
                    Image(systemName: "paperplane.fill")
                        .font(.system(size: 26, weight: .black))
                        .foregroundStyle(hasDrawing ? .white : EC.inkSoft)
                        .offset(x: -1, y: 1)
                }
            }
            .scaleEffect(isUrgent && countdownPulse ? 1.06 : 1)
        }
        .buttonStyle(.pressable)
        .accessibilityLabel("Send")
        .disabled(!hasDrawing && !showCountdown)
        .onChange(of: hasDrawing) { active in
            pulsing = active && !showCountdown
        }
        .onChange(of: countdownSeconds) { _ in
            // Restart pulse animation each second
            countdownPulse = false
            withAnimation(.easeOut(duration: 1.0)) {
                countdownPulse = true
            }
        }
        .onAppear {
            pulsing = hasDrawing && !showCountdown
        }
    }
}

// MARK: - Spectrum bar (hue or brightness)

private struct SpectrumBar: View {
    @Binding var value: CGFloat
    let gradient: LinearGradient
    let thumbColor: Color

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(gradient)
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                Circle()
                    .fill(thumbColor)
                    .frame(width: 24, height: 24)
                    .overlay(Circle().strokeBorder(Color.white, lineWidth: 3))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    .position(x: 12 + value * (geo.size.width - 24), y: geo.size.height / 2)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { drag in
                        let x = max(0, min(drag.location.x, geo.size.width))
                        value = x / geo.size.width
                    }
            )
        }
        .frame(height: 26)
    }
}

// MARK: - Pen size bar (tap-to-set, like spectrum bars)

private struct PenSizeBar: View {
    @Binding var value: CGFloat
    let range: ClosedRange<CGFloat>
    let color: Color

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                // Track: gradient from thin to thick
                PenSizeTrack()
                    .fill(Color.white)
                    .overlay(PenSizeTrack().stroke(EC.ink, style: StrokeStyle(lineWidth: 2.5, lineJoin: .round)))
                // Thumb
                Circle()
                    .fill(color)
                    .frame(width: 24, height: 24)
                    .overlay(Circle().strokeBorder(Color.white, lineWidth: 3))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    .position(x: thumbX(in: geo.size.width), y: geo.size.height / 2)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { drag in
                        let x = max(0, min(drag.location.x, geo.size.width))
                        let pct = x / geo.size.width
                        value = range.lowerBound + pct * (range.upperBound - range.lowerBound)
                    }
            )
        }
        .frame(height: 26)
    }

    private func thumbX(in width: CGFloat) -> CGFloat {
        let pct = (value - range.lowerBound) / (range.upperBound - range.lowerBound)
        return 12 + pct * (width - 24)
    }
}

private struct PenSizeTrack: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let thin = rect.height * 0.15
        let thick = rect.height * 0.45
        p.move(to: CGPoint(x: rect.minX + thin, y: rect.midY - thin))
        p.addLine(to: CGPoint(x: rect.maxX - thick, y: rect.midY - thick))
        p.addArc(center: CGPoint(x: rect.maxX - thick, y: rect.midY), radius: thick, startAngle: .degrees(-90), endAngle: .degrees(90), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX + thin, y: rect.midY + thin))
        p.addArc(center: CGPoint(x: rect.minX + thin, y: rect.midY), radius: thin, startAngle: .degrees(90), endAngle: .degrees(270), clockwise: false)
        p.closeSubpath()
        return p
    }
}

#Preview {
    DrawingComposerView(onSend: { _ in }, onCancel: {}, triggerAutoSubmit: .constant(false))
}
