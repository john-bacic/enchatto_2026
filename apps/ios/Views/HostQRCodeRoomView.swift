import SwiftUI
import CoreImage.CIFilterBuiltins

struct HostQRCodeRoomView: View {
    let joinCode: String
    let roomId: String
    let hostId: String

    @Environment(\.scenePhase) private var scenePhase
    @State private var navigateToConversation = false
    @State private var participantCount = 0
    @State private var showShareSheet = false
    @StateObject private var viewModel: HostRoomViewModel

    init(joinCode: String, roomId: String, hostId: String) {
        self.joinCode = joinCode
        self.roomId = roomId
        self.hostId = hostId
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    private var joinURL: String {
        "https://enchatto.vercel.app/join/\(joinCode)"
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Text("Room Ready")
                .font(.title2)
                .fontWeight(.bold)

            // QR Code
            if let qrImage = generateQRCode(from: joinURL) {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 220, height: 220)
                    .padding()
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(radius: 4)
            }

            // Join code display
            VStack(spacing: 4) {
                Text("Room Code")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(joinCode)
                    .font(.system(.title, design: .monospaced))
                    .fontWeight(.bold)
            }

            Text("Scan QR code or enter the room code to join")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // Live participant count
            HStack(spacing: 6) {
                Image(systemName: "person.2.fill")
                    .foregroundStyle(.secondary)
                let guestCount = max(0, viewModel.participants.count - 1) // exclude host
                Text("\(guestCount) participant\(guestCount == 1 ? "" : "s") joined")
                    .foregroundStyle(.secondary)
            }
            .font(.subheadline)

            // Participant avatars
            if viewModel.participants.count > 1 {
                HStack(spacing: -4) {
                    ForEach(viewModel.participants.filter { $0.role == .participant }.prefix(8)) { p in
                        Text(p.avatarEmoji)
                            .font(.title2)
                    }
                }
            }

            Spacer()

            // Action buttons
            VStack(spacing: 12) {
                Button {
                    navigateToConversation = true
                } label: {
                    Text("Open Conversation")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                Button {
                    showShareSheet = true
                } label: {
                    Label("Share Link", systemImage: "square.and.arrow.up")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
            }
            .padding(.horizontal)
        }
        .padding()
        .navigationBarBackButtonHidden(true)
        .onAppear { viewModel.startObserving() }
        .onDisappear { viewModel.stopObserving() }
        .onChange(of: scenePhase) { newPhase in
            viewModel.handleScenePhase(newPhase)
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

    private func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"

        guard let outputImage = filter.outputImage else { return nil }

        let scale = 10.0
        let scaledImage = outputImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
            return nil
        }

        return UIImage(cgImage: cgImage)
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
