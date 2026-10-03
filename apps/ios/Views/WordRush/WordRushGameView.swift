import SwiftUI

/// Full-screen Word Rush container: switches on status / phase and hosts shared chrome.
struct WordRushGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    /// Close for good (results "Back to chat", ended game)
    let onClose: () -> Void
    let onMinimize: () -> Void

    @StateObject private var clipPlayer = WordRushClipPlayer()
    @State private var showEndConfirm = false

    var body: some View {
        ZStack {
            RoomBackground(room: viewModel.room).ignoresSafeArea()

            if let game = viewModel.activeWordRushGame {
                content(game)
            } else {
                emptyState
            }
        }
        .overlay(alignment: .top) {
            if let error = viewModel.wordRushError {
                WordRushToast(text: error)
                    .padding(.top, 8)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .task(id: error) {
                        try? await Task.sleep(nanoseconds: 2_600_000_000)
                        withAnimation { viewModel.wordRushError = nil }
                    }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: viewModel.wordRushError)
        .alert(L.t("End Word Rush for everyone?", lang), isPresented: $showEndConfirm) {
            Button(L.t("Cancel", lang), role: .cancel) {}
            Button(L.t("End game", lang), role: .destructive) {
                Task { await viewModel.cancelWordRush() }
            }
        }
        .onAppear { viewModel.wordRushCoverOpen = true }
        .onDisappear {
            viewModel.wordRushCoverOpen = false
            clipPlayer.stop()
        }
        .onChange(of: viewModel.activeWordRushGame?.phaseKey) { _ in clipPlayer.stop() }
    }

    @ViewBuilder
    private func content(_ game: WordRushGame) -> some View {
        switch game.status {
        case .lobby:
            WordRushLobbyView(viewModel: viewModel, game: game, lang: lang, onMinimize: onMinimize, onCancel: { showEndConfirm = true })
        case .completed:
            WordRushResultsView(viewModel: viewModel, game: game, lang: lang, onClose: onClose)
        case .active, .unknown:
            activeView(game)
        }
    }

    private func activeView(_ game: WordRushGame) -> some View {
        let isHost = viewModel.canControlWordRush
        return VStack(spacing: 0) {
            WordRushTopBar(
                game: game,
                lang: lang,
                isHost: isHost,
                results: viewModel.wordRushMyResults,
                onMinimize: onMinimize,
                onSkip: { Task { await viewModel.skipWordRushPhase() } },
                onEnd: { showEndConfirm = true }
            )
            .padding(.horizontal, 16)
            .padding(.top, 6)

            Group {
                switch game.phase {
                case .clues:
                    WordRushCluesView(viewModel: viewModel, game: game, lang: lang)
                case .reveal:
                    WordRushRevealView(viewModel: viewModel, game: game, lang: lang)
                case .mic:
                    WordRushMicView(viewModel: viewModel, game: game, lang: lang, clipPlayer: clipPlayer)
                case .judging:
                    WordRushJudgeView(viewModel: viewModel, game: game, lang: lang, clipPlayer: clipPlayer)
                case .verdict:
                    WordRushVerdictView(viewModel: viewModel, game: game, lang: lang, clipPlayer: clipPlayer)
                case .unknown:
                    Spacer()
                }
            }
            .id(game.phaseKey)
            .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .opacity))
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: game.phaseKey)
    }

    private var emptyState: some View {
        VStack(spacing: 18) {
            ChattoView(size: 90)
            ProgressView().tint(EC.ink)
            Text(L.t("Dealing fresh cards…", lang)).font(.round(16, .black)).foregroundStyle(EC.ink)
            Button(L.t("Close", lang)) { onClose() }
                .buttonStyle(.chunky(.white, size: .small, fullWidth: false))
        }
    }
}
