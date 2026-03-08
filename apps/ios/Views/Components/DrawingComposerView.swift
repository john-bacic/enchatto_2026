import SwiftUI

struct DrawingComposerView: View {
    var onSend: (UIImage) -> Void
    var onCancel: () -> Void

    @State private var lines: [DrawingLine] = []
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4

    private let colors: [Color] = [.black, .red, .blue, .green, .orange, .purple]
    private let widths: [CGFloat] = [2, 4, 8]

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                // Canvas
                DrawingCanvasView(
                    lines: $lines,
                    strokeColor: selectedColor,
                    lineWidth: lineWidth
                )
                .frame(height: 280)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )

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

                // Actions
                HStack(spacing: 12) {
                    Button("Clear") {
                        lines = []
                    }
                    .buttonStyle(.bordered)

                    Spacer()

                    Button("Cancel") {
                        onCancel()
                    }
                    .buttonStyle(.bordered)

                    Button("Send") {
                        sendDrawing()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(lines.isEmpty)
                }
                .padding(.horizontal)
            }
            .padding()
            .navigationTitle("Draw")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func sendDrawing() {
        // Render the canvas to an image
        // We create an offscreen render of the drawing
        let size = CGSize(width: 320, height: 280)
        UIGraphicsBeginImageContextWithOptions(size, true, 2)
        guard let context = UIGraphicsGetCurrentContext() else { return }

        // White background
        context.setFillColor(UIColor.white.cgColor)
        context.fill(CGRect(origin: .zero, size: size))

        // Draw lines
        context.setLineCap(.round)
        context.setLineJoin(.round)
        for line in lines {
            guard line.points.count > 1 else { continue }
            context.setStrokeColor(line.color.cgColor)
            context.setLineWidth(line.width)
            context.beginPath()
            context.move(to: CGPoint(x: line.points[0].x, y: line.points[0].y))
            for point in line.points.dropFirst() {
                context.addLine(to: CGPoint(x: point.x, y: point.y))
            }
            context.strokePath()
        }

        if let image = UIGraphicsGetImageFromCurrentImageContext() {
            UIGraphicsEndImageContext()
            onSend(image)
        } else {
            UIGraphicsEndImageContext()
        }
    }
}

#Preview {
    DrawingComposerView(onSend: { _ in }, onCancel: {})
}
