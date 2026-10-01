import SwiftUI

struct HostQRCodeRoomView: View {
    let joinCode: String
    let roomId: String
    let hostId: String

    @Environment(\.scenePhase) private var scenePhase
    @State private var navigateToConversation = false
    @State private var showShareSheet = false
    @State private var confetti = 0
    @StateObject private var viewModel: HostRoomViewModel

    private let lang = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"

    init(joinCode: String, roomId: String, hostId: String) {
        self.joinCode = joinCode
        self.roomId = roomId
        self.hostId = hostId
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    private var joinURL: String {
        "https://enchatto.vercel.app/join/\(joinCode)"
    }

    private var guests: [Participant] {
        viewModel.participants.filter { $0.role == .participant }
    }

    var body: some View {
        VStack(spacing: 18) {
            OutlinedText(L.t("Room Ready!", lang), size: 36, fill: EC.yellow, outline: 3.5)
                .rotationEffect(.degrees(-4))
                .stampIn()
                .padding(.top, 12)

            ECQRCard(url: joinURL, size: 210)
                .popIn(delay: 0.15)

            RoomCodeTiles(code: joinCode)

            Text(L.t("Scan or enter code to join", lang))
                .font(.round(14, .bold))
                .foregroundStyle(EC.inkSoft)
                .multilineTextAlignment(.center)

            Text("\(guests.count) \(L.t("joined!", lang))")
                .font(.chunky(15))
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .background(Capsule().fill(EC.mint))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                .background(Capsule().fill(EC.ink).offset(y: 3))
                .id(guests.count)
                .popIn()

            guestRow

            Spacer(minLength: 0)

            VStack(spacing: 10) {
                Button {
                    Haptics.thump()
                    navigateToConversation = true
                } label: {
                    Text("\(L.t("Open Conversation", lang)) →")
                        .textCase(.uppercase)
                }
                .buttonStyle(.chunky(EC.pink))

                Button {
                    showShareSheet = true
                } label: {
                    Label(L.t("Share Link", lang), systemImage: "square.and.arrow.up")
                }
                .buttonStyle(.chunky(.white, size: .small))
            }
        }
        .padding(.horizontal, 22)
        .padding(.bottom, 12)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background {
            ZStack {
                RoomBackground(index: 7)
                RaysView(color: EC.pink.opacity(0.18), rays: 20)
                    .frame(width: 900, height: 900)
                    .offset(y: -120)
            }
            .ignoresSafeArea()
        }
        .overlay { ConfettiBurst(trigger: confetti).ignoresSafeArea() }
        .navigationBarBackButtonHidden(true)
        .onAppear { viewModel.startObserving() }
        .onDisappear { viewModel.stopObserving() }
        .onChange(of: scenePhase) { newPhase in
            viewModel.handleScenePhase(newPhase)
        }
        .onChange(of: guests.count) { newCount in
            if newCount > 0 {
                Haptics.success()
                confetti += 1
            }
        }
        .navigationDestination(isPresented: $navigateToConversation) {
            HostConversationView(roomId: roomId, hostId: hostId)
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(items: [
                "Join my Enchatto conversation!",
                URL(string: joinURL)!
            ])
        }
    }

    private var guestRow: some View {
        let shown = Array(guests.prefix(5))
        let empties = max(0, 2 - shown.count)
        return HStack(alignment: .bottom, spacing: 10) {
            ForEach(Array(shown.enumerated()), id: \.element.id) { i, p in
                VStack(spacing: 4) {
                    AvatarDisc(avatarId: p.avatar.value, size: 50)
                        .background(Circle().fill(EC.ink).offset(y: 3))
                    Text(p.nickname)
                        .font(.round(11, .black))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(.white))
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                }
                .frame(maxWidth: 70)
                .offset(y: i.isMultiple(of: 2) ? 0 : -10)
                .transition(.move(edge: .top).combined(with: .scale(scale: 0.4)))
            }
            ForEach(0..<empties, id: \.self) { _ in
                Text("?")
                    .font(.chunky(20))
                    .foregroundStyle(EC.inkSoft.opacity(0.7))
                    .frame(width: 50, height: 50)
                    .overlay(Circle().strokeBorder(EC.inkSoft.opacity(0.6), style: StrokeStyle(lineWidth: 3, dash: [6, 5])))
                    .padding(.bottom, 22)
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.55), value: guests.map(\.id))
        .frame(minHeight: 84)
    }
}

/// Join code as tilted chunky letter tiles
struct RoomCodeTiles: View {
    let code: String
    var tileSize: CGFloat = 46

    private let fills = [EC.pinkSoft, EC.yellowSoft, EC.mintSoft, EC.blueSoft, EC.violetSoft, EC.yellowSoft]

    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(code.enumerated()), id: \.offset) { i, ch in
                Text(String(ch))
                    .font(.chunky(tileSize * 0.48))
                    .foregroundStyle(EC.ink)
                    .frame(width: tileSize, height: tileSize * 1.08)
                    .ecCard(fill: fills[i % fills.count], radius: 13, border: 3, shadow: 4)
                    .rotationEffect(.degrees([-4, 3, -2, 4, -3, 2][i % 6]))
                    .offset(y: i % 3 == 1 ? -3 : 0)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(code)
    }
}

/// UIKit share sheet wrapper
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    NavigationStack {
        HostQRCodeRoomView(joinCode: "ABC123", roomId: "mock-room", hostId: "mock-host")
    }
}
