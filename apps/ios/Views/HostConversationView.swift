import SwiftUI
import CoreImage.CIFilterBuiltins

struct HostConversationView: View {
    let roomId: String
    let hostId: String

    @Environment(\.dismiss) private var dismiss
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var viewModel: HostRoomViewModel
    @State private var messageText = ""
    @State private var replyToId: String?
    @State private var showCloseConfirmation = false
    @State private var showDrawingComposer = false
    @State private var showCamera = false
    @State private var showQRCode = false

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
        .onChange(of: scenePhase) { newPhase in
            viewModel.handleScenePhase(newPhase)
        }
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
        .sheet(isPresented: $showQRCode) {
            if let joinCode = viewModel.room?.joinCode {
                QRCodeSheet(joinCode: joinCode)
            }
        }
    }

    // MARK: - Header

    private var headerView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Button {
                    showQRCode = true
                } label: {
                    Text("Enchatto")
                        .font(.headline)
                }
                .buttonStyle(.plain)
                HStack(spacing: 4) {
                    Text("\(viewModel.onlineCount) online\(viewModel.awayCount > 0 ? ", \(viewModel.awayCount) away" : "")")
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
                TextEditor(text: $messageText)
                    .frame(minHeight: 36, maxHeight: 100)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.systemGray4), lineWidth: 0.5)
                    )
                    .overlay(alignment: .topLeading) {
                        if messageText.isEmpty {
                            Text("Type a message...")
                                .foregroundColor(Color(.placeholderText))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 12)
                                .allowsHitTesting(false)
                        }
                    }

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
        .fullScreenCover(isPresented: $showDrawingComposer) {
            DrawingComposerView(
                onSend: { image in
                    showDrawingComposer = false
                    Task { await viewModel.sendDrawing(image, replyToId: replyToId); replyToId = nil }
                },
                onCancel: { showDrawingComposer = false }
            )
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
                            Text(participant.online ? (participant.isAway ? "Away" : "Online") : "Offline")
                                .font(.caption)
                                .foregroundStyle(participant.online ? (participant.isAway ? .orange : .green) : .secondary)
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

// MARK: - QR Code Sheet

private struct QRCodeSheet: View {
    let joinCode: String
    @Environment(\.dismiss) private var dismiss

    private var joinURL: String {
        "https://enchatto.vercel.app/join/\(joinCode)"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()

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

                Spacer()
            }
            .navigationTitle("Room QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
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

#Preview {
    NavigationStack {
        HostConversationView(roomId: "mock-room", hostId: "mock-host")
    }
}
