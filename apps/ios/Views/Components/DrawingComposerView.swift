import SwiftUI

struct DrawingComposerView: View {
    var lang: String = "en"
    var onSend: (UIImage) -> Void
    var onCancel: () -> Void

    @State private var lines: [DrawingLine] = []
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4
    @State private var canvasView: DrawingUIView?

    private let bwColors: [Color] = [.black, .white]
    private let rainbowColors: [Color] = [
        Color(red: 0xef/255, green: 0x44/255, blue: 0x44/255), // #ef4444
        Color(red: 0xff/255, green: 0x8c/255, blue: 0x00/255), // #ff8c00
        Color(red: 0xfa/255, green: 0xcc/255, blue: 0x15/255), // #facc15
        Color(red: 0x22/255, green: 0xc5/255, blue: 0x5e/255), // #22c55e
        Color(red: 0x3b/255, green: 0x82/255, blue: 0xf6/255), // #3b82f6
        Color(red: 0x4f/255, green: 0x46/255, blue: 0xe5/255), // #4f46e5
        Color(red: 0x8b/255, green: 0x5c/255, blue: 0xf6/255), // #8b5cf6
    ]
    private let minWidth: CGFloat = 1
    private let maxWidth: CGFloat = 40

    private var hasDrawing: Bool { !lines.isEmpty }

    var body: some View {
        VStack(spacing: 16) {
            Spacer()

                HStack(spacing: 12) {
                    // Left: color rows + slider
                    VStack(alignment: .leading, spacing: 8) {
                        // Black + white
                        HStack(spacing: 10) {
                            ForEach(bwColors, id: \.self) { color in
                                Circle()
                                    .fill(color)
                                    .frame(width: 28, height: 28)
                                    .overlay(
                                        Circle()
                                            .stroke(selectedColor == color ? Color.accentColor : color == .white ? Color(.systemGray4) : Color.clear, lineWidth: 2)
                                            .padding(-2)
                                    )
                                    .onTapGesture { selectedColor = color }
                            }
                        }

                        // Rainbow colors
                        HStack(spacing: 10) {
                            ForEach(rainbowColors, id: \.self) { color in
                                Circle()
                                    .fill(color)
                                    .frame(width: 28, height: 28)
                                    .overlay(
                                        Circle()
                                            .stroke(selectedColor == color ? Color.accentColor : Color.clear, lineWidth: 2)
                                            .padding(-2)
                                    )
                                    .onTapGesture { selectedColor = color }
                            }
                        }

                        // Thickness slider
                        Slider(value: $lineWidth, in: minWidth...maxWidth)
                            .tint(.accentColor)
                            .padding(.horizontal, 4)
                    }

                    // Right: thickness indicator
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(.systemGray6))
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.systemGray4), lineWidth: 1)
                        Circle()
                            .fill(selectedColor)
                            .frame(width: lineWidth, height: lineWidth)
                    }
                    .frame(width: 48, height: 64)
                }
                .padding(.horizontal)

            // Canvas — centered
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

                Spacer()

                // Bottom bar: Close (left) — Send (center) — Clear (right)
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
                    DrawingSendButton(hasDrawing: hasDrawing) {
                        sendDrawing()
                    }

                    // Clear — bottom right
                    HStack {
                        Spacer()
                        Button {
                            lines = []
                        } label: {
                            Image(systemName: "xmark")
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
        .background(Color(.systemBackground))
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
        // Start at the point (left center)
        path.move(to: CGPoint(x: 0, y: rect.midY))
        // Top-left edge going up to top
        path.addLine(to: CGPoint(x: pointDepth, y: 0))
        // Top edge to top-right corner
        path.addLine(to: CGPoint(x: rect.maxX - r, y: 0))
        // Top-right rounded corner
        path.addArc(
            center: CGPoint(x: rect.maxX - r, y: r),
            radius: r,
            startAngle: .degrees(-90),
            endAngle: .degrees(0),
            clockwise: false
        )
        // Right edge down to bottom-right corner
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - r))
        // Bottom-right rounded corner
        path.addArc(
            center: CGPoint(x: rect.maxX - r, y: rect.maxY - r),
            radius: r,
            startAngle: .degrees(0),
            endAngle: .degrees(90),
            clockwise: false
        )
        // Bottom edge back to left
        path.addLine(to: CGPoint(x: pointDepth, y: rect.maxY))
        // Close back to the point
        path.closeSubpath()
        return path
    }
}

// MARK: - Drawing send button with pulse

private struct DrawingSendButton: View {
    let hasDrawing: Bool
    let action: () -> Void
    @State private var pulsing = false

    var body: some View {
        Button(action: action) {
            ZStack {
                if hasDrawing {
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
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(hasDrawing ? Color.accentColor : Color(.systemGray4))
            }
        }
        .disabled(!hasDrawing)
        .onChange(of: hasDrawing) { active in
            pulsing = active
        }
        .onAppear {
            pulsing = hasDrawing
        }
    }
}

#Preview {
    DrawingComposerView(onSend: { _ in }, onCancel: {})
}
