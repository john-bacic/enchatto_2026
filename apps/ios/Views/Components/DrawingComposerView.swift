import SwiftUI

struct DrawingComposerView: View {
    var lang: String = "en"
    var onSend: (UIImage) -> Void
    var onCancel: () -> Void

    @State private var lines: [DrawingLine] = []
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4
    @State private var canvasView: DrawingUIView?

    private let colors: [Color] = [.black, .red, .blue, .green, .orange, .purple]
    private let widths: [CGFloat] = [2, 4, 8]

    private var hasDrawing: Bool { !lines.isEmpty }

    var body: some View {
        VStack(spacing: 16) {
            Spacer()

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

                // Color picker
                HStack(spacing: 10) {
                    ForEach(colors, id: \.self) { color in
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

                    Spacer()

                    // Line width
                    ForEach(widths, id: \.self) { width in
                        Circle()
                            .fill(Color(.label))
                            .frame(width: width + 4, height: width + 4)
                            .padding(6)
                            .background(
                                Circle()
                                    .stroke(lineWidth == width ? Color.accentColor : Color(.systemGray4), lineWidth: 1)
                            )
                            .onTapGesture { lineWidth = width }
                    }
                }
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
