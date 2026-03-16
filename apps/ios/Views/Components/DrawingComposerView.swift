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
        .background(Color(.systemBackground))
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
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
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
                    ZStack {
                        Circle()
                            .fill(Color(.systemBackground))
                            .frame(width: 56, height: 56)
                            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 2)
                        Image(systemName: "xmark")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundStyle(Color(.label))
                    }
                }
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
                        lines.removeLast()
                    }
                } label: {
                    Image(systemName: "arrow.uturn.backward")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.vertical, 8)
                        .padding(.leading, 16)
                        .padding(.trailing, 12)
                        .background(
                            TagShape()
                                .fill(hasDrawing ? Color.red : Color(.systemGray4))
                        )
                }
                .disabled(!hasDrawing)
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
                    .frame(width: 36, height: 36)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(.systemGray6))
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color(.systemGray4), lineWidth: 1))
                    )
            }
            Slider(value: $lineWidth, in: minWidth...maxWidth)
                .tint(.accentColor)
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

// MARK: - Tag shape (pointed left, rounded right)

private struct TagShape: Shape {
    func path(in rect: CGRect) -> Path {
        let r: CGFloat = 8 // corner radius for right side
        let pointDepth: CGFloat = 10

        var path = Path()
        path.move(to: CGPoint(x: 0, y: rect.midY))
        path.addLine(to: CGPoint(x: pointDepth, y: 0))
        path.addLine(to: CGPoint(x: rect.maxX - r, y: 0))
        path.addArc(
            center: CGPoint(x: rect.maxX - r, y: r),
            radius: r,
            startAngle: .degrees(-90),
            endAngle: .degrees(0),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - r))
        path.addArc(
            center: CGPoint(x: rect.maxX - r, y: rect.maxY - r),
            radius: r,
            startAngle: .degrees(0),
            endAngle: .degrees(90),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: pointDepth, y: rect.maxY))
        path.closeSubpath()
        return path
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
            return isUrgent ? .red : .accentColor
        }
        return hasDrawing ? Color.accentColor : Color(.systemGray4)
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                // Pulse ring — idle mode
                if hasDrawing && !showCountdown {
                    Circle()
                        .fill(Color.accentColor)
                        .frame(width: 56, height: 56)
                        .scaleEffect(pulsing ? 1.8 : 1)
                        .opacity(pulsing ? 0 : 0.5)
                        .animation(
                            .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                            value: pulsing
                        )
                }
                // Pulse ring — countdown mode (restarts each second)
                if showCountdown {
                    Circle()
                        .fill(buttonColor)
                        .frame(width: 56, height: 56)
                        .scaleEffect(countdownPulse ? 1.8 : 1)
                        .opacity(countdownPulse ? 0 : 0.5)
                }
                // Main button
                if showCountdown {
                    Circle()
                        .fill(buttonColor)
                        .frame(width: 56, height: 56)
                    Text("\(countdownSeconds)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                } else {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 56))
                        .foregroundStyle(buttonColor)
                }
            }
        }
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
                RoundedRectangle(cornerRadius: 10)
                    .fill(gradient)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(.separator), lineWidth: 0.5)
                    )
                Circle()
                    .fill(thumbColor)
                    .frame(width: 16, height: 16)
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    .shadow(color: Color.black.opacity(0.25), radius: 2, x: 0, y: 1)
                    .position(x: 8 + value * (geo.size.width - 16), y: geo.size.height / 2)
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
        .frame(height: 20)
    }
}

#Preview {
    DrawingComposerView(onSend: { _ in }, onCancel: {}, triggerAutoSubmit: .constant(false))
}
