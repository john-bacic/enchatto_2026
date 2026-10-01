import SwiftUI

struct AvatarPickerView: View {
    @Binding var selectedAvatarId: String
    var columns: Int = 4

    private let gridColumns: [GridItem]

    init(selectedAvatarId: Binding<String>, columns: Int = 4) {
        self._selectedAvatarId = selectedAvatarId
        self.columns = columns
        self.gridColumns = Array(repeating: GridItem(.flexible(), spacing: 12), count: columns)
    }

    var body: some View {
        LazyVGrid(columns: gridColumns, spacing: 12) {
            ForEach(presetAvatars, id: \.id) { avatar in
                Button {
                    Haptics.tap()
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.55)) {
                        selectedAvatarId = avatar.id
                    }
                } label: {
                    AvatarTile(avatar: avatar, isSelected: selectedAvatarId == avatar.id)
                }
                .buttonStyle(.pressable)
                .accessibilityLabel(avatar.label)
                .accessibilityAddTraits(selectedAvatarId == avatar.id ? .isSelected : [])
            }
        }
    }
}

private struct AvatarTile: View {
    let avatar: PresetAvatar
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 5) {
            Image(avatar.icon)
                .resizable()
                .interpolation(.high)
                .scaledToFit()
                .padding(8)
                .frame(maxWidth: .infinity)
                .aspectRatio(1.15, contentMode: .fit)
                .ecCard(fill: isSelected ? EC.yellow : avatar.color, radius: 18, border: 3, shadow: isSelected ? 6 : 4)
                .background(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .strokeBorder(EC.pink, lineWidth: 4)
                        .padding(-4)
                        .opacity(isSelected ? 1 : 0)
                )
                .overlay(alignment: .topTrailing) {
                    if isSelected {
                        PackIcon("o-star", size: 18)
                            .offset(x: 6, y: -6)
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                .rotationEffect(.degrees(isSelected ? -3 : 0))
                .scaleEffect(isSelected ? 1.06 : 1)
                .offset(y: isSelected ? -4 : 0)
                .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isSelected)
                .nudge(on: isSelected, active: isSelected, angle: 8, hop: 6)
                .zIndex(isSelected ? 1 : 0)

            Text(avatar.label)
                .font(.round(11, isSelected ? .black : .bold))
                .foregroundStyle(isSelected ? EC.ink : EC.inkSoft)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
    }
}

#Preview {
    AvatarPickerView(selectedAvatarId: .constant("cat"))
        .padding()
        .ecPaperBackground()
}
