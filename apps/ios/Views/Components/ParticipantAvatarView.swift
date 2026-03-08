import SwiftUI

struct ParticipantAvatarView: View {
    let participant: Participant
    var size: CGFloat = 32

    var body: some View {
        ZStack {
            Circle()
                .fill(participant.avatarColor)
                .frame(width: size, height: size)

            Text(participant.avatarEmoji)
                .font(.system(size: size * 0.55))
        }
        .opacity(participant.online ? 1 : 0.5)
        .overlay(alignment: .bottomTrailing) {
            Circle()
                .fill(participant.online ? Color.green : Color(.systemGray4))
                .frame(width: size * 0.28, height: size * 0.28)
                .overlay {
                    Circle()
                        .stroke(Color(.systemBackground), lineWidth: 1.5)
                }
        }
    }
}

/// Horizontal row of participant avatars with overflow count
struct ParticipantAvatarRow: View {
    let participants: [Participant]
    var maxVisible: Int = 5
    var avatarSize: CGFloat = 32
    var onTapParticipant: ((Participant) -> Void)?

    var body: some View {
        HStack(spacing: -avatarSize * 0.2) {
            ForEach(participants.prefix(maxVisible)) { participant in
                ParticipantAvatarView(participant: participant, size: avatarSize)
                    .onTapGesture {
                        onTapParticipant?(participant)
                    }
            }

            if participants.count > maxVisible {
                ZStack {
                    Circle()
                        .fill(Color(.systemGray4))
                        .frame(width: avatarSize, height: avatarSize)
                    Text("+\(participants.count - maxVisible)")
                        .font(.system(size: avatarSize * 0.3))
                        .fontWeight(.semibold)
                        .foregroundStyle(.secondary)
                }
            }
        }
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
