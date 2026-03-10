import SwiftUI

struct HostStartRoomView: View {
    @StateObject private var viewModel = HostStartRoomViewModel()

    private var lang: String { viewModel.hostLanguage }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Title
                    VStack(spacing: 4) {
                        Text(L.t("Enchatto", lang))
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text(L.t("Create a conversation room", lang))
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 20)

                    // Form
                    VStack(spacing: 16) {
                        // Avatar
                        VStack(alignment: .leading, spacing: 8) {
                            Text(L.t("Choose your avatar", lang))
                                .font(.caption)
                                .fontWeight(.semibold)
                            AvatarPickerView(selectedAvatarId: $viewModel.hostAvatarId)
                        }

                        // Nickname
                        VStack(alignment: .leading, spacing: 4) {
                            Text(L.t("Your nickname", lang))
                                .font(.caption)
                                .fontWeight(.semibold)
                            TextField(L.t("Enter your name", lang), text: $viewModel.hostNickname)
                                .padding(8)
                                .background(Color(red: 1, green: 1, blue: 0, opacity: 0.15))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color(.separator), lineWidth: 0.5)
                                )
                        }

                        // Language preference
                        VStack(alignment: .leading, spacing: 4) {
                            Text(L.t("Your language", lang))
                                .font(.caption)
                                .fontWeight(.semibold)
                            Picker("Language", selection: $viewModel.hostLanguage) {
                                Text(L.t("English", lang)).tag("en")
                                Text(L.t("Japanese", lang)).tag("ja")
                            }
                            .pickerStyle(.segmented)
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
                                Text(L.t("Create Room", lang))
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(!viewModel.canCreate)

                    // Commit hash
                    Text("v\(GitInfo.commitSHA)")
                        .font(.system(size: 9))
                        .foregroundStyle(.secondary.opacity(0.5))
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
