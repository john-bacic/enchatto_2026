import SwiftUI

struct HostStartRoomView: View {
    @StateObject private var viewModel = HostStartRoomViewModel()
    @FocusState private var nameFocused: Bool

    private var lang: String { viewModel.hostLanguage }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    EnchattoLogo(ribbon: L.t("Create a conversation room", lang))
                        .padding(.top, 8)

                    chattoSays

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Choose your avatar", lang))
                        AvatarPickerView(selectedAvatarId: $viewModel.hostAvatarId)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Your nickname", lang))
                        TextField(L.t("Enter your name", lang), text: $viewModel.hostNickname)
                            .focused($nameFocused)
                            .submitLabel(.done)
                            .ecField()
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Your language", lang))
                        HStack(spacing: 12) {
                            languageButton("en", label: "English")
                            languageButton("ja", label: "日本語")
                        }
                    }

                    if let error = viewModel.error {
                        Text(error)
                            .font(.round(13, .bold))
                            .foregroundStyle(EC.red)
                            .multilineTextAlignment(.center)
                    }

                    Button {
                        nameFocused = false
                        Haptics.thump()
                        Task { await viewModel.createRoom() }
                    } label: {
                        if viewModel.isCreating {
                            ProgressView().tint(.white)
                        } else {
                            HStack(spacing: 12) {
                                AvatarDisc(avatarId: viewModel.hostAvatarId, size: 38)
                                Text(L.t("Create Room", lang))
                                    .textCase(.uppercase)
                            }
                        }
                    }
                    .buttonStyle(.chunky(EC.blue))
                    .disabled(!viewModel.canCreate)
                    .padding(.top, 4)

                    Text("v\(GitInfo.commitSHA)")
                        .font(.round(9, .medium))
                        .foregroundStyle(EC.inkSoft.opacity(0.6))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .scrollDismissesKeyboard(.interactively)
            .ecPaperBackground()
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: Binding(
                get: { viewModel.createdRoomId != nil },
                set: { if !$0 { viewModel.createdRoomId = nil } }
            )) {
                if let roomId = viewModel.createdRoomId, let hostId = viewModel.createdHostId {
                    HostConversationView(roomId: roomId, hostId: hostId)
                }
            }
        }
    }

    private var chattoSays: some View {
        HStack(alignment: .center, spacing: 10) {
            ChattoView(size: 70)
            Text(L.t("Pick your look, then I'll make you a QR code!", lang))
                .font(.round(14, .black))
                .foregroundStyle(EC.ink)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .ecCard(radius: 18, border: 3, shadow: 5)
                .overlay(alignment: .leading) {
                    SpeechTail()
                        .fill(.white)
                        .overlay(SpeechTail().stroke(EC.ink, style: StrokeStyle(lineWidth: 3, lineJoin: .round)))
                        .frame(width: 12, height: 18)
                        .offset(x: -9, y: -3)
                }
        }
    }

    private func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(.round(17, .black))
            .foregroundStyle(EC.ink)
    }

    private func languageButton(_ code: String, label: String) -> some View {
        let selected = viewModel.hostLanguage == code
        return Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                viewModel.hostLanguage = code
            }
        } label: {
            HStack(spacing: 8) {
                LangBadge(lang: code, size: 24)
                Text(label)
            }
        }
        .buttonStyle(.chunky(selected ? EC.yellow : .white, size: .small))
        .rotationEffect(.degrees(selected ? -2 : 0))
        .offset(y: selected ? -2 : 0)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

/// Left-pointing speech bubble tail (open on the right so it merges with the bubble)
private struct SpeechTail: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.maxX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        return path
    }
}

/// Chunky multicolour "Enchatto" wordmark on a spinning burst, with a ribbon underneath
struct EnchattoLogo: View {
    var ribbon: String? = nil
    var size: CGFloat = 46

    private let letters = Array("Enchatto")
    private let fills: [Color] = [.white, EC.blue, EC.yellow, EC.pink, .white, EC.mint, EC.yellow, EC.violet]

    var body: some View {
        VStack(spacing: -4) {
            HStack(spacing: -size * 0.1) {
                ForEach(letters.indices, id: \.self) { i in
                    OutlinedText(String(letters[i]), size: size, fill: fills[i % fills.count], outline: 3.5)
                        .rotationEffect(.degrees(i.isMultiple(of: 2) ? -5 : 4))
                        .offset(y: i.isMultiple(of: 2) ? 0 : -3)
                }
            }
            .background {
                LoopClock { t in
                    let spin = Angle.degrees(t.truncatingRemainder(dividingBy: 18) / 18 * 360)
                    StarBurst(points: 16, innerRatio: 0.8)
                        .fill(EC.pink)
                        .overlay(StarBurst(points: 16, innerRatio: 0.8).stroke(EC.ink, lineWidth: 3))
                        .frame(width: size * 2.6, height: size * 2.6)
                        .rotationEffect(spin)
                        .background(
                            StarBurst(points: 16, innerRatio: 0.8)
                                .fill(EC.ink)
                                .frame(width: size * 2.6, height: size * 2.6)
                                .rotationEffect(spin)
                                .offset(y: 5)
                        )
                }
            }

            if let ribbon {
                Text(ribbon)
                    .font(.round(14, .black))
                    .tracking(1)
                    .textCase(.uppercase)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 8)
                    .background(Rectangle().fill(EC.blue))
                    .overlay(Rectangle().strokeBorder(EC.ink, lineWidth: 3))
                    .background(Rectangle().fill(EC.ink).offset(y: 4))
                    .rotationEffect(.degrees(-3))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Enchatto")
    }
}

#Preview {
    HostStartRoomView()
}
