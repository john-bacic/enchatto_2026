import SwiftUI

// MARK: - Send button with pulse

struct SendButton: View {
    let hasText: Bool
    let action: () -> Void
    var pulsate: Bool = true
    @State private var pulsing = false

    var body: some View {
        Button {
            if hasText {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            action()
        } label: {
            Image(systemName: "paperplane.fill")
                .font(.system(size: 17, weight: .black))
                .rotationEffect(.degrees(pulsing ? 8 : -4))
                .animation(
                    pulsing ? .easeInOut(duration: 0.5).repeatForever(autoreverses: true) : .default,
                    value: pulsing
                )
        }
        .buttonStyle(.roundIcon(hasText ? EC.blue : EC.lineSoft, diameter: 44))
        .accessibilityLabel("Send")
        .disabled(!hasText)
        .onChange(of: hasText) { active in
            pulsing = pulsate && active
        }
        .onAppear {
            pulsing = pulsate && hasText
        }
    }
}

/// Scrolling dictation meter: newest sample on the right, silence drawn as dots
struct VoiceWaveform: View {
    /// Polled, not observed — observing would re-render on every level tick
    let recognizer: SpeechRecognizer
    var tint: Color = EC.ink
    @State private var samples = [CGFloat](repeating: 0, count: 64)
    private let timer = Timer.publish(every: 0.07, on: .main, in: .common).autoconnect()

    var body: some View {
        Canvas { ctx, size in
            let step: CGFloat = 6
            let bar: CGFloat = 3
            let count = min(samples.count, Int(size.width / step))
            for i in 0..<count {
                let v = samples[samples.count - count + i]
                let live = v > 0
                let h = live ? max(bar, min(size.height, 4 + v * (size.height - 4))) : bar
                let x = size.width - CGFloat(count - i) * step + (step - bar) / 2
                let rect = CGRect(x: x, y: (size.height - h) / 2, width: bar, height: h)
                ctx.fill(Path(roundedRect: rect, cornerRadius: bar / 2), with: .color(live ? tint : EC.inkSoft.opacity(0.45)))
            }
        }
        .onReceive(timer) { _ in
            let level = recognizer.level
            samples.removeFirst()
            samples.append(level < 0.05 ? 0 : level)
        }
        .accessibilityHidden(true)
    }
}

/// Red dot + elapsed recording time; replaces the stop button while sending as a voice message
struct ClipTimer: View {
    /// Polled for the same reason as VoiceWaveform
    let recognizer: SpeechRecognizer
    let lang: String
    @State private var blink = false

    var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(EC.red)
                .frame(width: 8, height: 8)
                .opacity(blink ? 0.35 : 1)
                .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: blink)
            TimelineView(.periodic(from: .now, by: 0.5)) { _ in
                let s = Int(recognizer.clipDuration)
                Text("\(s / 60):" + String(format: "%02d", s % 60))
                    .font(.round(13, .black))
                    .monospacedDigit()
                    .foregroundStyle(EC.ink)
            }
        }
        .padding(.horizontal, 6)
        .frame(height: 32)
        .onAppear { blink = true }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(L.t("Recording...", lang))
    }
}
