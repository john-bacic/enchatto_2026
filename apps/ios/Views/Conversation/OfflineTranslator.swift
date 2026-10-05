import SwiftUI
import Translation

// MARK: - Offline translation via Apple Translation framework

@available(iOS 18.0, *)
struct OfflineTranslator: View {
    @ObservedObject var viewModel: HostRoomViewModel
    @State private var enJaConfig: TranslationSession.Configuration?
    @State private var jaEnConfig: TranslationSession.Configuration?
    @State private var showDownloadPresentation = false

    var body: some View {
        ZStack {
            // Each direction on its OWN view — two .translationTask modifiers
            // on the same view can conflict and prevent sessions from starting.
            Color.clear
                .translationTask(enJaConfig) { session in
                    DebugConsole.shared.trace(source: .processing, action: "offline:en→ja:batch")
                    await viewModel.translateQueueBatch(session: session, fromLang: "en")
                }
            Color.clear
                .translationTask(jaEnConfig) { session in
                    DebugConsole.shared.trace(source: .processing, action: "offline:ja→en:batch")
                    await viewModel.translateQueueBatch(session: session, fromLang: "ja")
                }
        }
        .frame(width: 0, height: 0)
        // Download prompt — Apple's translation overlay handles the download flow
        .translationPresentation(isPresented: $showDownloadPresentation, text: "Hello")
        // Re-trigger translation sessions when new messages are enqueued
        .onChange(of: viewModel.offlineQueueVersion) { _, _ in
            guard viewModel.translationPacksInstalled else { return }
            enJaConfig?.invalidate()
            jaEnConfig?.invalidate()
        }
        // React to user tapping the download button in participant sheet
        .onChange(of: viewModel.requestTranslationDownload) { _, newValue in
            if newValue {
                showDownloadPresentation = true
                viewModel.requestTranslationDownload = false
            }
        }
        // Re-check after download presentation dismisses
        .onChange(of: showDownloadPresentation) { _, isPresented in
            if !isPresented {
                Task { await checkAndStart() }
            }
        }
        // Check on room open and initialize configs if packs are installed
        .task {
            await checkAndStart()
        }
    }

    private func checkAndStart() async {
        let availability = LanguageAvailability()
        let enJa = await availability.status(
            from: Locale.Language(identifier: "en"),
            to: Locale.Language(identifier: "ja")
        )
        let jaEn = await availability.status(
            from: Locale.Language(identifier: "ja"),
            to: Locale.Language(identifier: "en")
        )
        viewModel.translationPacksInstalled = (enJa == .installed && jaEn == .installed)

        // Initialize configs so .translationTask is ready to fire on invalidate()
        if viewModel.translationPacksInstalled && enJaConfig == nil {
            enJaConfig = .init(
                source: Locale.Language(identifier: "en"),
                target: Locale.Language(identifier: "ja")
            )
            jaEnConfig = .init(
                source: Locale.Language(identifier: "ja"),
                target: Locale.Language(identifier: "en")
            )
        }
    }
}
