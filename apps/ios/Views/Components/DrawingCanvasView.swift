import SwiftUI

/// A simple freehand drawing canvas
struct DrawingCanvasView: UIViewRepresentable {
    @Binding var lines: [DrawingLine]
    var strokeColor: Color
    var lineWidth: CGFloat
    var onViewReady: ((DrawingUIView) -> Void)?

    func makeUIView(context: Context) -> DrawingUIView {
        let view = DrawingUIView()
        view.backgroundColor = .white
        view.delegate = context.coordinator
        view.strokeColor = UIColor(strokeColor)
        view.lineWidth = lineWidth
        DispatchQueue.main.async { onViewReady?(view) }
        return view
    }

    func updateUIView(_ uiView: DrawingUIView, context: Context) {
        uiView.strokeColor = UIColor(strokeColor)
        uiView.lineWidth = lineWidth
        if uiView.lines.count != lines.count {
            uiView.lines = lines
            uiView.setNeedsDisplay()
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, DrawingUIViewDelegate {
        var parent: DrawingCanvasView

        init(_ parent: DrawingCanvasView) {
            self.parent = parent
        }

        func drawingDidUpdate(lines: [DrawingLine]) {
            parent.lines = lines
        }
    }
}

// MARK: - Data types

struct DrawingPoint {
    let x: CGFloat
    let y: CGFloat
}

struct DrawingLine {
    var points: [DrawingPoint]
    var color: UIColor
    var width: CGFloat
}

// MARK: - UIKit drawing view

protocol DrawingUIViewDelegate: AnyObject {
    func drawingDidUpdate(lines: [DrawingLine])
}

class DrawingUIView: UIView {
    weak var delegate: DrawingUIViewDelegate?
    var lines: [DrawingLine] = []
    var strokeColor: UIColor = .black
    var lineWidth: CGFloat = 4

    private var currentLine: DrawingLine?

    override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
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

        // Draw current line
        if let current = currentLine, current.points.count > 1 {
            context.setStrokeColor(current.color.cgColor)
            context.setLineWidth(current.width)
            context.beginPath()
            context.move(to: CGPoint(x: current.points[0].x, y: current.points[0].y))
            for point in current.points.dropFirst() {
                context.addLine(to: CGPoint(x: point.x, y: point.y))
            }
            context.strokePath()
        }
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        currentLine = DrawingLine(
            points: [DrawingPoint(x: point.x, y: point.y)],
            color: strokeColor,
            width: lineWidth
        )
        setNeedsDisplay()
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        currentLine?.points.append(DrawingPoint(x: point.x, y: point.y))
        setNeedsDisplay()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let current = currentLine {
            lines.append(current)
            currentLine = nil
            delegate?.drawingDidUpdate(lines: lines)
        }
        setNeedsDisplay()
    }

    /// Render the canvas to a UIImage
    func renderToImage() -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(bounds.size, true, 0)
        defer { UIGraphicsEndImageContext() }
        drawHierarchy(in: bounds, afterScreenUpdates: true)
        return UIGraphicsGetImageFromCurrentImageContext()
    }
}
