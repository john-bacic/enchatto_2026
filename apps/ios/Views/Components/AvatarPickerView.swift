import SwiftUI

struct AvatarPickerView: View {
    @Binding var selectedAvatarId: String
    var columns: Int = 4
    var rows: Int = 2

    @State private var page = 0
    @State private var width: CGFloat = 0

    private let spacing: CGFloat = 12
    /// `ecCard` pads this much below every tile for its hard shadow, so each row is taller than the art.
    private let cardShadow: CGFloat = 6
    /// Room inside the pager. It has to be real layout space: a paging TabView clips to its frame,
    /// and negative padding puts that room outside the frame, which is what sliced off the top row.
    private let topRoom: CGFloat = 22
    private let bottomRoom: CGFloat = 8
    private let sideRoom: CGFloat = 14

    private var pages: [[PresetAvatar]] {
        let perPage = columns * rows
        return stride(from: 0, to: presetAvatars.count, by: perPage).map {
            Array(presetAvatars[$0..<min($0 + perPage, presetAvatars.count)])
        }
    }

    private var pageHeight: CGFloat {
        let tile = (width - spacing * CGFloat(columns - 1)) / CGFloat(columns)
        let row = tile / 1.15 + cardShadow
        let grid = row * CGFloat(rows) + spacing * CGFloat(rows - 1)
        return grid + topRoom + bottomRoom
    }

    var body: some View {
        VStack(spacing: 16) {
            if width > 0 {
                TabView(selection: $page) {
                    ForEach(pages.indices, id: \.self) { index in
                        grid(pages[index])
                            .padding(.top, topRoom)
                            .padding(.bottom, bottomRoom)
                            .padding(.horizontal, sideRoom)
                            .frame(maxHeight: .infinity, alignment: .top)
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: pageHeight)
                .padding(.horizontal, -sideRoom)
            }

            if pages.count > 1 {
                pageDots
            }
        }
        .background {
            GeometryReader { geo in
                Color.clear
                    .onAppear { width = geo.size.width }
                    .onChange(of: geo.size.width) { width = $0 }
            }
        }
        .onAppear {
            if let index = pages.firstIndex(where: { $0.contains { $0.id == selectedAvatarId } }) {
                page = index
            }
        }
    }

    private func grid(_ avatars: [PresetAvatar]) -> some View {
        LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: spacing), count: columns),
            spacing: spacing
        ) {
            ForEach(avatars, id: \.id) { avatar in
                Button {
                    Haptics.tap()
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.55)) {
                        selectedAvatarId = avatar.id
                    }
                } label: {
                    AvatarTile(avatar: avatar, isSelected: selectedAvatarId == avatar.id)
                }
                .buttonStyle(.pressable)
                .zIndex(selectedAvatarId == avatar.id ? 1 : 0)
                .accessibilityLabel(avatar.label)
                .accessibilityAddTraits(selectedAvatarId == avatar.id ? .isSelected : [])
            }
        }
    }

    private var pageDots: some View {
        HStack(spacing: 8) {
            ForEach(pages.indices, id: \.self) { index in
                Capsule()
                    .fill(index == page ? EC.ink : EC.inkSoft.opacity(0.35))
                    .frame(width: index == page ? 20 : 8, height: 8)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) { page = index }
                    }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: page)
        .accessibilityHidden(true)
    }
}

private struct AvatarTile: View {
    let avatar: PresetAvatar
    let isSelected: Bool

    var body: some View {
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
    }
}

#Preview {
    AvatarPickerView(selectedAvatarId: .constant("cat"))
        .padding()
        .ecPaperBackground()
}
