import SwiftUI

struct ParticipantAvatarView: View {
    let participant: Participant
    var size: CGFloat = 32

    var body: some View {
        AvatarDisc(avatarId: participant.avatar.value, size: size)
            .saturation(participant.online ? 1 : 0.2)
            .opacity(participant.online ? (participant.isAway ? 0.75 : 1) : 0.55)
            .overlay(alignment: .bottomTrailing) {
                PresenceDot(participant: participant, size: max(9, size * 0.32))
                    .offset(x: size * 0.04, y: size * 0.04)
            }
            .accessibilityElement()
            .accessibilityLabel(participant.nickname)
    }
}

/// Horizontal row of participant avatars with overflow count
struct ParticipantAvatarRow: View {
    let participants: [Participant]
    var maxVisible: Int = 5
    var avatarSize: CGFloat = 32
    var onTapParticipant: ((Participant) -> Void)?

    var body: some View {
        HStack(spacing: -avatarSize * 0.25) {
            ForEach(participants.prefix(maxVisible)) { participant in
                ParticipantAvatarView(participant: participant, size: avatarSize)
                    .onTapGesture {
                        onTapParticipant?(participant)
                    }
                    .transition(.scale.combined(with: .opacity))
            }

            if participants.count > maxVisible {
                Text("+\(participants.count - maxVisible)")
                    .font(.chunky(avatarSize * 0.34))
                    .foregroundStyle(EC.ink)
                    .frame(width: avatarSize, height: avatarSize)
                    .background(Circle().fill(.white))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: max(2, avatarSize * 0.065)))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.6), value: participants.map(\.id))
    }
}

#Preview {
    let participants = [
        Participant(id: "1", roomId: "r", nickname: "Alice", role: .participant, platform: .web, avatar: AvatarConfig(type: .preset, value: "cat"), preferredLanguage: "en", online: true, lastSeenAt: Date(), joinedAt: Date()),
        Participant(id: "2", roomId: "r", nickname: "Bob", role: .host, platform: .ios, avatar: AvatarConfig(type: .preset, value: "fox"), preferredLanguage: "ja", online: true, lastSeenAt: Date(), joinedAt: Date()),
        Participant(id: "3", roomId: "r", nickname: "Charlie", role: .participant, platform: .web, avatar: AvatarConfig(type: .preset, value: "dolphin"), preferredLanguage: "en", online: false, lastSeenAt: Date(), joinedAt: Date()),
    ]

    VStack(spacing: 20) {
        HStack(spacing: 12) {
            ForEach(participants) { p in
                ParticipantAvatarView(participant: p, size: 44)
            }
        }
        ParticipantAvatarRow(participants: participants)
    }
    .padding()
}
