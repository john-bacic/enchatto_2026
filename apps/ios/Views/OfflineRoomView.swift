import AVFoundation
import SwiftUI
import Translation

/// A room with no connection: one phone passed back and forth between two people, each writing or speaking in
/// their own language. The phone translates between English and Japanese by itself (Apple's on-device
/// translation, iOS 18 and its two language packs), reads the Japanese in romaji, and can say a translation
/// aloud. Nothing leaves the phone and nobody else can join: a room others join needs the server. The
/// conversation is kept on the phone between visits (OfflineRoomStore).
struct OfflineRoomView: View {
    /// The language of whoever's phone this is: their lines sit on the right
    let myLang: String
    let avatarId: String
    let onClose: () -> Void

    @StateObject private var store = OfflineRoomStore()
    @StateObject private var speech = SpeechRecognizer()
    @StateObject private var voice = OfflineVoice()
    @State private var draft = ""
    @State private var draftLang = "en"
    @State private var confirmClear = false
    @State private var showPractice = false
    @FocusState private var typing: Bool

    /// The language the app's own words are shown in
    private var lang: String { myLang }

    var body: some View {
        VStack(spacing: 0) {
            header
            if store.translator == .needsPacks || store.translator == .unavailable { translatorNote }
            conversation
            inputBar
        }
        .ecPaperBackground()
        .background { translatorBridge }
        .onAppear { draftLang = myLang == "ja" ? "ja" : "en" }
        .onDisappear {
            if speech.isRecording { speech.stopRecording() }
            voice.stop()
        }
        .confirmationDialog(L.t("Clear this conversation?", lang), isPresented: $confirmClear, titleVisibility: .visible) {
            Button(L.t("Clear", lang), role: .destructive) { store.clear() }
            Button(L.t("Cancel", lang), role: .cancel) {}
        }
        .fullScreenCover(isPresented: $showPractice) {
            DashPracticeView(avatarId: avatarId, lang: lang) { showPractice = false }
        }
    }

    /// The phone's translator, where the system has one. It draws nothing
    @ViewBuilder
    private var translatorBridge: some View {
        if #available(iOS 18.0, *) {
            OfflineRoomTranslator(store: store)
        } else {
            Color.clear.onAppear { store.translator = .unavailable }
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 10) {
            Button {
                Haptics.tap()
                onClose()
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.roundIcon(.white, diameter: 40))
            .accessibilityLabel(L.t("Close", lang))

            VStack(alignment: .leading, spacing: 1) {
                Text(L.t("Offline room", lang))
                    .font(.chunky(19, relativeTo: .title3))
                    .foregroundStyle(EC.ink)
                Text(L.t("Kept on this iPhone only", lang))
                    .font(.round(11.5, .bold))
                    .foregroundStyle(EC.inkSoft)
            }
            Spacer(minLength: 0)

            if DashPracticeView.isAvailable {
                Button {
                    Haptics.tap()
                    typing = false
                    showPractice = true
                } label: {
                    PackIcon("o-shootingstar", size: 24)
                }
                .buttonStyle(.roundIcon(EC.blueSoft, diameter: 40))
                .accessibilityLabel(L.t("Practice Chatto Dash", lang))
            }
            if !store.lines.isEmpty {
                Button {
                    Haptics.tap()
                    confirmClear = true
                } label: {
                    Image(systemName: "trash")
                }
                .buttonStyle(.roundIcon(.white, diameter: 40))
                .accessibilityLabel(L.t("Clear", lang))
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 8)
        .padding(.bottom, 10)
        .background(EC.paper.opacity(0.92).ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    /// Why nothing is being translated, and what would change that
    private var translatorNote: some View {
        VStack(alignment: .leading, spacing: 8) {
            if store.translator == .needsPacks {
                Text(L.t("To translate with no connection, this iPhone needs the English and Japanese language packs. Download them once while you're online.", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Button(L.t("Get language packs", lang)) {
                    Haptics.tap()
                    store.wantsPacks = true
                }
                .buttonStyle(.chunky(EC.yellow, size: .small))
            } else {
                Text(L.t("This iPhone can't translate between English and Japanese by itself. You can still write things down here.", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .ecCard(fill: EC.yellowSoft, radius: 18, border: 3, shadow: 4)
        .padding(.horizontal, 14)
        .padding(.top, 10)
    }

    // MARK: - Conversation

    private var conversation: some View {
        ScrollViewReader { proxy in
            ScrollView {
                if store.lines.isEmpty {
                    VStack(spacing: 12) {
                        ChattoView(size: 84, hop: true)
                        Text(L.t("Say something in English or Japanese, then pass the phone.", lang))
                            .font(.round(15, .bold))
                            .foregroundStyle(EC.ink.opacity(0.75))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 36)
                    .padding(.top, 70)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(store.lines) { line in
                            OfflineBubble(
                                line: line,
                                mine: line.lang == (myLang == "ja" ? "ja" : "en"),
                                translator: store.translator,
                                lang: lang,
                                speaking: voice.speaking == line.id,
                                onSpeak: { voice.say($0, in: $1, for: line.id) },
                                onRetry: { store.retry() },
                                onDelete: { store.remove(line.id) }
                            )
                            .id(line.id)
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                }
            }
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: store.lines.count) { _ in
                guard let last = store.lines.last else { return }
                withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo(last.id, anchor: .bottom) }
            }
            .onAppear {
                if let last = store.lines.last { proxy.scrollTo(last.id, anchor: .bottom) }
            }
        }
    }

    // MARK: - Input

    private var inputBar: some View {
        VStack(spacing: 8) {
            // Whose turn it is: what is typed or spoken next is in this language
            HStack(spacing: 8) {
                languageChip("en", label: "English")
                languageChip("ja", label: "日本語")
                Spacer(minLength: 0)
            }
            HStack(spacing: 10) {
                Group {
                    if speech.isRecording {
                        Text(speech.transcript.isEmpty ? L.t("Listening...", lang) : speech.transcript)
                            .font(.round(16, .bold))
                            .foregroundStyle(speech.transcript.isEmpty ? EC.inkSoft : EC.ink)
                            .lineLimit(3)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 16)
                            .frame(minHeight: 52)
                            .ecCard(radius: 18, border: 3, shadow: 5)
                    } else {
                        TextField(L.t("Type a message...", lang), text: $draft, axis: .vertical)
                            .lineLimit(1...4)
                            .focused($typing)
                            .submitLabel(.send)
                            .onSubmit(send)
                            .padding(.vertical, 6)
                            .ecField()
                    }
                }
                if speech.isRecording {
                    Button(action: stopListening) {
                        Image(systemName: "stop.fill")
                    }
                    .buttonStyle(.roundIcon(EC.red, diameter: 50))
                    .accessibilityLabel(L.t("Send", lang))
                } else if draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Button(action: startListening) {
                        Image(systemName: "mic.fill")
                    }
                    .buttonStyle(.roundIcon(.white, diameter: 50))
                    .accessibilityLabel(L.t("Listening...", lang))
                } else {
                    Button(action: send) {
                        Image(systemName: "arrow.up")
                    }
                    .buttonStyle(.roundIcon(EC.blue, diameter: 50))
                    .accessibilityLabel(L.t("Send", lang))
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 10)
        .padding(.bottom, 8)
        .background(EC.paper.opacity(0.92).ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: speech.isRecording)
    }

    private func languageChip(_ code: String, label: String) -> some View {
        let selected = draftLang == code
        return Button {
            guard !speech.isRecording else { return }
            Haptics.tap()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { draftLang = code }
        } label: {
            HStack(spacing: 6) {
                LangBadge(lang: code, size: 20)
                Text(label)
                    .font(.round(13, .black))
                    .foregroundStyle(EC.ink)
            }
            .padding(.leading, 6)
            .padding(.trailing, 12)
            .padding(.vertical, 5)
            .background(Capsule().fill(selected ? EC.yellow : .white))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
            .background(Capsule().fill(EC.ink).offset(y: selected ? 3 : 0))
            .offset(y: selected ? -2 : 0)
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        Haptics.tap()
        store.say(text, in: draftLang)
        draft = ""
    }

    private func startListening() {
        Haptics.tap()
        typing = false
        voice.stop()
        speech.updateLocale(draftLang)
        speech.captureClip = false
        speech.startRecording()
    }

    /// What was heard is said, in the language that was being listened for
    private func stopListening() {
        Haptics.tap()
        speech.stopRecording()
        let heard = speech.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        speech.transcript = ""
        if !heard.isEmpty { store.say(heard, in: draftLang) }
    }
}

// MARK: - A line of the conversation

private struct OfflineBubble: View {
    let line: OfflineConversation.Line
    let mine: Bool
    let translator: OfflineRoomStore.Translator
    let lang: String
    let speaking: Bool
    let onSpeak: (String, String) -> Void
    let onRetry: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 0) {
            if mine { Spacer(minLength: 40) }
            VStack(alignment: .leading, spacing: 7) {
                said(line.text, in: line.lang, romaji: line.lang == "ja" ? line.romaji : nil, speakable: false)
                DashedRule(color: EC.ink.opacity(0.18))
                if let translation = line.translation {
                    said(translation, in: line.otherLang, romaji: line.otherLang == "ja" ? line.romaji : nil, speakable: true)
                } else {
                    waiting
                }
            }
            .padding(.horizontal, 13)
            .padding(.vertical, 11)
            .ecCard(fill: mine ? EC.yellowSoft : EC.pinkSoft, radius: 20, border: 3, shadow: 5)
            .contextMenu {
                Button {
                    UIPasteboard.general.string = line.translation ?? line.text
                } label: {
                    Label(L.t("Copy", lang), systemImage: "doc.on.doc")
                }
                Button(role: .destructive, action: onDelete) {
                    Label(L.t("Delete", lang), systemImage: "trash")
                }
            }
            if !mine { Spacer(minLength: 40) }
        }
    }

    private func said(_ text: String, in language: String, romaji: String?, speakable: Bool) -> some View {
        HStack(alignment: .top, spacing: 8) {
            LangBadge(lang: language, size: 20)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 2) {
                Text(text)
                    .font(.round(17, .bold))
                    .foregroundStyle(EC.ink)
                    .fixedSize(horizontal: false, vertical: true)
                // Japanese written in Latin letters already is its own reading
                if let romaji, !romaji.isEmpty, romaji != text {
                    Text(romaji)
                        .font(.round(12.5, .medium))
                        .italic()
                        .foregroundStyle(EC.pink)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            if speakable {
                Spacer(minLength: 4)
                Button {
                    Haptics.tap()
                    onSpeak(text, language)
                } label: {
                    Image(systemName: speaking ? "speaker.wave.3.fill" : "speaker.wave.2.fill")
                }
                .buttonStyle(.roundIcon(speaking ? EC.yellow : .white, diameter: 32))
                .accessibilityLabel(L.t("Say it aloud", lang))
            }
        }
    }

    @ViewBuilder
    private var waiting: some View {
        if line.failed {
            Button(action: onRetry) {
                Label(L.t("Couldn't translate. Tap to try again.", lang), systemImage: "arrow.clockwise")
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.red)
            }
            .buttonStyle(.plain)
        } else {
            switch translator {
            case .ready, .checking:
                HStack(spacing: 8) {
                    ProgressView().tint(EC.ink)
                    Text(L.t("Translating…", lang))
                        .font(.round(13, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
            case .needsPacks:
                Text(L.t("Waiting for the language packs", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
            case .unavailable:
                Text(L.t("No translation on this iPhone", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
            }
        }
    }
}

// MARK: - The phone's own translator

/// Hands the conversation's untranslated lines to Apple's on-device translation, one direction to a session,
/// and puts the answers back. A session only exists inside `.translationTask`, so this is a view that draws
/// nothing: each direction's task runs when its configuration is first set and each time it is invalidated,
/// which is whenever the store has something new waiting.
@available(iOS 18.0, *)
private struct OfflineRoomTranslator: View {
    @ObservedObject var store: OfflineRoomStore
    @State private var enJa: TranslationSession.Configuration?
    @State private var jaEn: TranslationSession.Configuration?
    @State private var showDownload = false

    var body: some View {
        ZStack {
            // A view for each direction: two translation tasks on one view can keep each other from starting
            Color.clear.translationTask(enJa) { session in await run(session, from: "en") }
            Color.clear.translationTask(jaEn) { session in await run(session, from: "ja") }
        }
        .frame(width: 0, height: 0)
        // Apple's own sheet downloads the packs
        .translationPresentation(isPresented: $showDownload, text: "Hello")
        .onChange(of: store.waitingVersion) { _, _ in
            guard store.translator == .ready else { return }
            #if DEBUG && targetEnvironment(simulator)
            if standIn {
                Task { await pretend() }
                return
            }
            #endif
            enJa?.invalidate()
            jaEn?.invalidate()
        }
        .onChange(of: store.wantsPacks) { _, wanted in
            guard wanted else { return }
            store.wantsPacks = false
            showDownload = true
        }
        .onChange(of: showDownload) { _, shown in
            if !shown { Task { await check() } }
        }
        .task { await check() }
    }

    #if DEBUG && targetEnvironment(simulator)
    @State private var standIn = false

    private func pretend() async {
        for line in store.waiting(from: "en") + store.waiting(from: "ja") {
            try? await Task.sleep(nanoseconds: 500_000_000)
            store.translated(line.id, as: line.lang == "en" ? "これはシミュレーターの仮の翻訳です。" : "This is the Simulator's stand-in translation.")
        }
    }
    #endif

    private func run(_ session: TranslationSession, from lang: String) async {
        for line in store.waiting(from: lang) {
            do {
                let response = try await session.translate(line.text)
                store.translated(line.id, as: response.targetText)
            } catch {
                store.failed(line.id)
            }
        }
    }

    private func check() async {
        let english = Locale.Language(identifier: "en")
        let japanese = Locale.Language(identifier: "ja")
        let availability = LanguageAvailability()
        let there = await availability.status(from: english, to: japanese)
        let back = await availability.status(from: japanese, to: english)
        guard there == .installed, back == .installed else {
            #if DEBUG && targetEnvironment(simulator)
            // The Simulator has no on-device translation at all. So that the room can be tried there, a stand-in
            // answers with the same sentence every time. Never on a phone
            if there == .unsupported {
                store.translator = .ready
                standIn = true
                await pretend()
                return
            }
            #endif
            store.translator = (there == .unsupported || back == .unsupported) ? .unavailable : .needsPacks
            return
        }
        store.translator = .ready
        if enJa == nil {
            // Setting these starts each direction's task, which translates whatever is already waiting
            enJa = .init(source: english, target: japanese)
            jaEn = .init(source: japanese, target: english)
        } else {
            store.translateWaiting()
        }
    }
}

// MARK: - Saying a translation aloud

/// Reads a line out in its language with the phone's own voices, which need no connection
@MainActor
final class OfflineVoice: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    /// The line being read, if any
    @Published private(set) var speaking: UUID?
    private let synthesizer = AVSpeechSynthesizer()

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    func say(_ text: String, in lang: String, for id: UUID) {
        let again = speaking == id
        stop()
        // A second tap on the line being read stops it
        guard !again else { return }
        // Heard with the ring switch off too, as a translation asked for by a tap should be
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: lang == "ja" ? "ja-JP" : "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.92
        speaking = id
        synthesizer.speak(utterance)
    }

    func stop() {
        if synthesizer.isSpeaking { synthesizer.stopSpeaking(at: .immediate) }
        speaking = nil
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in self.ended() }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        Task { @MainActor in self.ended() }
    }

    /// A line stopped for the sake of another is heard of after the other has begun: that one is still being read
    private func ended() {
        if !synthesizer.isSpeaking { speaking = nil }
    }
}
