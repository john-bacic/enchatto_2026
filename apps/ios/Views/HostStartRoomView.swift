import SwiftUI

struct HostStartRoomView: View {
    @StateObject private var viewModel = HostStartRoomViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Title
                    VStack(spacing: 4) {
                        Text("Enchatto")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text("Create a conversation room")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 20)

                    // Form
                    VStack(spacing: 16) {
                        // Nickname
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Your nickname")
                                .font(.caption)
                                .fontWeight(.semibold)
                            TextField("Enter your name", text: $viewModel.hostNickname)
                                .textFieldStyle(.roundedBorder)
                        }

                        // Avatar
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Choose your avatar")
                                .font(.caption)
                                .fontWeight(.semibold)
                            AvatarPickerView(selectedAvatarId: $viewModel.hostAvatarId)
                        }

                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Error
                    if let error = viewModel.error {
                        Text(error)
                            .foregroundStyle(.red)
                            .font(.caption)
                    }

                    // Create button
                    Button {
                        Task { await viewModel.createRoom() }
                    } label: {
                        if viewModel.isCreating {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            HStack {
                                Text(presetAvatar(for: viewModel.hostAvatarId).emoji)
                                Text("Create Room")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(!viewModel.canCreate)
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
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
}

#Preview {
    HostStartRoomView()
}
