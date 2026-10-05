import SwiftUI

// MARK: - Typing bubble indicator

struct TypingBubble: View {
    let participant: Participant
    var lang: String = "en"
    var timerSeconds: Int = 20

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            // Avatar
            VStack(spacing: 3) {
                AvatarDisc(avatarId: participant.avatar.value, size: 36)
                Text(participant.nickname)
                    .font(.round(10, .black))
                    .foregroundStyle(EC.inkSoft)
                    .lineLimit(1)
                    .frame(maxWidth: 44)
            }
            .padding(.bottom, 4)

            // Bubble with action-specific animation
            Group {
                if participant.typingAction == "drawing" {
                    // Pencil wiggle + label + countdown
                    HStack(spacing: 6) {
                        DrawingPencil()
                        DrawingCountdownLabel(
                            drawingStartedAt: participant.drawingStartedAt,
                            lang: lang,
                            timeLimit: timerSeconds
                        )
                    }
                } else if participant.typingAction == "voicing" {
                    // Orange pulsing bars + label
                    HStack(spacing: 6) {
                        VoiceBars()
                        Text(L.t("Speaking…", lang))
                            .font(.round(12, .black))
                            .foregroundStyle(EC.inkSoft)
                    }
                } else {
                    // Bouncing dots for typing
                    HStack(spacing: 4) {
                        BouncingDot(delay: 0, color: EC.blue)
                        BouncingDot(delay: 0.15, color: EC.pink)
                        BouncingDot(delay: 0.3, color: EC.mint)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .background(typingShape.fill(.white))
            .overlay(typingShape.stroke(EC.ink, lineWidth: 3))
            .background(typingShape.fill(EC.ink).offset(y: 4))
            .padding(.bottom, 4)

            Spacer(minLength: 0)
        }
        .transition(.scale(scale: 0.5, anchor: .bottomLeading).combined(with: .opacity))
    }

    private var typingShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 20,
            bottomLeadingRadius: 6,
            bottomTrailingRadius: 20,
            topTrailingRadius: 20,
            style: .continuous
        )
    }
}

/// Drawing countdown label that updates every second
private struct DrawingCountdownLabel: View {
    let drawingStartedAt: Double?
    var lang: String = "en"
    var timeLimit: Int = 20

    @State private var secondsLeft: Int? = nil
    @State private var timer: Timer? = nil

    var body: some View {
        HStack(spacing: 4) {
            Text(L.t("Drawing…", lang))
                .font(.round(12, .black))
                .foregroundStyle(EC.inkSoft)
            if let secondsLeft {
                Text("\(secondsLeft)s")
                    .font(.chunky(12))
                    .foregroundStyle(secondsLeft <= 3 ? EC.red : EC.ink)
            }
        }
        .onAppear { startTimer() }
        .onDisappear { timer?.invalidate(); timer = nil }
    }

    private func startTimer() {
        updateCountdown()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            Task { @MainActor in updateCountdown() }
        }
    }

    private func updateCountdown() {
        guard let startedAt = drawingStartedAt else { secondsLeft = nil; return }
        let elapsed = Int((Date().timeIntervalSince1970 * 1000 - startedAt) / 1000)
        secondsLeft = max(0, timeLimit - elapsed)
    }
}

/// Single bouncing dot for typing indicator
private struct BouncingDot: View {
    let delay: Double
    var color: Color = EC.inkSoft

    var body: some View {
        LoopClock { t in
            let up = (loopWave(t, period: 0.72, delay: delay) + 1) / 2
            Circle()
                .fill(color)
                .frame(width: 9, height: 9)
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
                .opacity(0.6 + 0.4 * up)
                .offset(y: -5 * up)
        }
    }
}

/// Orange pulsing bars for voice indicator
private struct VoiceBars: View {
    var body: some View {
        LoopClock { t in
            HStack(spacing: 2) {
                ForEach(0..<4) { i in
                    let level = (loopWave(t, period: 0.8, delay: Double(i) * 0.15) + 1) / 2
                    RoundedRectangle(cornerRadius: 2)
                        .fill(EC.pink)
                        .frame(width: 4, height: 5 + 11 * level)
                        .opacity(0.5 + 0.5 * level)
                }
            }
        }
        .frame(height: 16)
    }
}

/// Wiggling pencil for drawing indicator
private struct DrawingPencil: View {
    var body: some View {
        LoopClock { t in
            let w = loopWave(t, period: 0.8)
            PackIcon("g-pencil", size: 20)
                .rotationEffect(.degrees(-1 + 9 * w))
                .offset(y: -1 - w)
        }
    }
}
