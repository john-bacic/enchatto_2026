import SwiftUI

struct HostConversationView: View {
    let roomId: String
    let hostId: String

    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel: HostRoomViewModel
    @State private var messageText = ""
    @State private var replyToId: String?
    @State private var showCloseConfirmation = false
    @State private var showDrawingComposer = false
    @State private var showCamera = false

    init(roomId: String, hostId: String) {
        self.roomId = roomId
        self.hostId = hostId
        _viewModel = StateObject(wrappedValue: HostRoomViewModel(roomId: roomId, hostId: hostId))
    }

    var body: some View {
        VStack(spacing: 0) {
            headerView

            if viewModel.isLoading {
                Spacer()
                ProgressView("Loading...")
                Spacer()
            } else if viewModel.messages.isEmpty {
                emptyStateView
            } else {
                messageListView
            }

            if let replyId = replyToId,
               let replyMsg = viewModel.messages.first(where: { $0.id == replyId }) {
                replyIndicator(for: replyMsg)
            }

            if !viewModel.isClosed {
                inputView
            } else {
                closedBanner
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear { viewModel.startObserving() }
        .onDisappear { viewModel.stopObserving() }
        .alert("Error", isPresented: .init(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
        .confirmationDialog("Close this room?", isPresented: $showCloseConfirmation, titleVisibility: .visible) {
            Button("Close Room", role: .destructive) {
                Task { await viewModel.closeRoom() }
            }
        } message: {
            Text("All participants will be disconnected. This cannot be undone.")
        }
        .sheet(isPresented: $viewModel.showParticipantSheet) {
            participantSheet
        }
    }

    // MARK: - Header

    private var headerView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Enchatto")
                    .font(.headline)
                HStack(spacing: 4) {
                    Text("\(viewModel.onlineCount) online")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if viewModel.isProcessing {
                        ProgressView()
                            .controlSize(.mini)
                        Text("Processing...")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                }
            }

            Spacer()

            // Participant avatars — tap to show sheet
            Button {
                viewModel.showParticipantSheet = true
            } label: {
                ParticipantAvatarRow(
                    participants: viewModel.participants,
                    maxVisible: 5,
                    avatarSize: 28
                )
            }
            .buttonStyle(.plain)

            // Menu
            Menu {
                Button {
                    viewModel.showParticipantSheet = true
                } label: {
                    Label("Participants", systemImage: "person.2")
                }

                Divider()

                Button(role: .destructive) {
                    showCloseConfirmation = true
                } label: {
                    Label("Close Room", systemImage: "xmark.circle")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.title3)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
        .overlay(alignment: .bottom) { Divider() }
    }

    // MARK: - Empty state

    private var emptyStateView: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 40))
                .foregroundStyle(.quaternary)
            Text("No messages yet")
                .foregroundStyle(.secondary)
            Text("Waiting for participants to start chatting")
                .font(.caption)
                .foregroundStyle(.tertiary)
            Spacer()
        }
    }

    // MARK: - Message list

    private var messageListView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.messages) { message in
                        let sender = viewModel.participant(for: message.senderId)
                        let replyTarget = viewModel.replyTarget(for: message)
                        let replyTargetSender = replyTarget.flatMap { viewModel.participant(for: $0.senderId) }

                        HostMessageRow(
                            message: message,
                            sender: sender,
                            isOwn: message.senderId == hostId,
                            replyTarget: replyTarget,
                            replyTargetSender: replyTargetSender,
                            onReply: { replyToId = message.id },
                            onSuggestionTap: { messageText = $0 },
                            onReact: { emoji in
                                Task { await viewModel.addReaction(messageId: message.id, emoji: emoji) }
                            }
                        )
                        .id(message.id)
                    }
                }
                .padding()
            }
            .onChange(of: viewModel.messages.count) { _ in
                if let lastId = viewModel.messages.last?.id {
                    withAnimation {
                        proxy.scrollTo(lastId, anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Reply indicator

    private func replyIndicator(for message: Message) -> some View {
        let sender = viewModel.participant(for: message.senderId)
        return HStack {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(Color.accentColor)
                .frame(width: 3)
            VStack(alignment: .leading, spacing: 1) {
                Text("Replying to \(sender?.nickname ?? "Unknown")")
                    .font(.caption)
                    .fontWeight(.medium)
                Text(message.text?.prefix(40).description ?? "")
                    .font(.caption2)
                    .lineLimit(1)
            }
            .foregroundStyle(.secondary)
            Spacer()
            Button {
                replyToId = nil
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
    }

    // MARK: - Input

    private var inputView: some View {
        VStack(spacing: 0) {
            Divider()
            HStack(spacing: 6) {
                // Photo picker
                ImagePickerView(isPresented: .constant(false)) { image in
                    Task { await viewModel.sendImage(image, replyToId: replyToId); replyToId = nil }
                }

                // Camera
                Button {
                    showCamera = true
                } label: {
                    Image(systemName: "camera")
                        .font(.body)
                }

                // Drawing
                Button {
                    showDrawingComposer = true
                } label: {
                    Image(systemName: "pencil.tip")
                        .font(.body)
                }

                // Text input
                TextField("Type a message...", text: $messageText)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { sendCurrentMessage() }

                Button(action: sendCurrentMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                }
                .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .background(Color(.systemBackground))
        .sheet(isPresented: $showDrawingComposer) {
            DrawingComposerView(
                onSend: { image in
                    showDrawingComposer = false
                    Task { await viewModel.sendDrawing(image, replyToId: replyToId); replyToId = nil }
                },
                onCancel: { showDrawingComposer = false }
            )
            .presentationDetents([.medium, .large])
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraPickerView(
                onImageCaptured: { image in
                    Task { await viewModel.sendImage(image, replyToId: replyToId); replyToId = nil }
                },
                isPresented: $showCamera
            )
            .ignoresSafeArea()
        }
    }

    // MARK: - Closed banner

    private var closedBanner: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "lock.fill")
                    .foregroundStyle(.secondary)
                Text("This room has been closed")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Button("Back to Home") {
                dismiss()
            }
            .font(.subheadline)
            .fontWeight(.medium)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
    }

    // MARK: - Participant sheet

    private var participantSheet: some View {
        NavigationStack {
            List {
                ForEach(viewModel.participants) { participant in
                    HStack(spacing: 12) {
                        ParticipantAvatarView(participant: participant, size: 36)

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 4) {
                                Text(participant.nickname)
                                    .fontWeight(.medium)
                                if participant.role == .host {
                                    Text("host")
                                        .font(.caption2)
                                        .padding(.horizontal, 4)
                                        .padding(.vertical, 1)
                                        .background(Color.accentColor)
                                        .foregroundStyle(.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 3))
                                }
                            }
                            Text(participant.online ? "Online" : "Offline")
                                .font(.caption)
                                .foregroundStyle(participant.online ? .green : .secondary)
                        }

                        Spacer()

                        // Kick button (non-host only)
                        if participant.role != .host {
                            Button(role: .destructive) {
                                Task { await viewModel.kickParticipant(participant.id) }
                            } label: {
                                Text("Remove")
                                    .font(.caption)
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }
                    }
                }
            }
            .navigationTitle("Participants")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        viewModel.showParticipantSheet = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Helpers

    private func sendCurrentMessage() {
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        Task {
            await viewModel.sendMessage(text, replyToId: replyToId)
            messageText = ""
            replyToId = nil
        }
    }
}

#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
