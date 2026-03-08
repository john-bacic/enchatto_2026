import SwiftUI

struct AvatarPickerView: View {
    @Binding var selectedAvatarId: String
    var columns: Int = 4

    private let gridColumns: [GridItem]

    init(selectedAvatarId: Binding<String>, columns: Int = 4) {
        self._selectedAvatarId = selectedAvatarId
        self.columns = columns
        self.gridColumns = Array(repeating: GridItem(.flexible(), spacing: 10), count: columns)
    }

    var body: some View {
        LazyVGrid(columns: gridColumns, spacing: 10) {
            ForEach(presetAvatars, id: \.id) { avatar in
                let isSelected = selectedAvatarId == avatar.id
                Button {
                    selectedAvatarId = avatar.id
                } label: {
                    VStack(spacing: 2) {
                        ZStack {
                            Circle()
                                .fill(avatar.color)
                                .frame(width: 52, height: 52)

                            Text(avatar.emoji)
                                .font(.system(size: 28))

                            if isSelected {
                                Circle()
                                    .stroke(Color.accentColor, lineWidth: 3)
                                    .frame(width: 56, height: 56)
                            }
                        }

                        Text(avatar.id.capitalized)
                            .font(.caption2)
                            .foregroundStyle(isSelected ? .primary : .secondary)
                            .fontWeight(isSelected ? .semibold : .regular)
                    }
                }
                .buttonStyle(.plain)
            }
        }
    }
}

#Preview {
    AvatarPickerView(selectedAvatarId: .constant("cat"))
        .padding()
}
