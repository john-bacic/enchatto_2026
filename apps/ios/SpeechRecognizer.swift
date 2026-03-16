import Combine
import Foundation
import Accelerate

#if os(iOS)
import Speech
import AVFoundation

/// Wraps Apple's Speech framework for on-device speech-to-text.
///
/// Architecture: each pause between utterances creates a full session boundary.
/// When Apple finalizes a result or silence is detected, the current session is
/// torn down completely and a fresh one starts. Committed text from prior sessions
/// is preserved and new speech appears on a new line.
@MainActor
final class SpeechRecognizer: ObservableObject {
    @Published var transcript = ""
    @Published var isRecording = false
    /// Normalized audio level (0...1) representing current mic input volume.
    @Published var audioLevel: CGFloat = 0

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var audioEngine = AVAudioEngine()

    /// Accumulated text from completed sessions (each line is one utterance).
    private var committedText = ""
    /// The latest partial text from the current active session.
    private var currentSessionText = ""
    /// Prevents re-entrant session restarts.
    private var isRestarting = false
    /// Timer: if no new results for 1.5s, force-end the session to commit.
    private var silenceTimer: Timer?
    /// Unique ID for the current session — callbacks from old sessions are ignored.
    private var sessionId: UUID = UUID()
    /// Timestamp of last audio level update (throttle to ~20fps).
    private var lastLevelUpdate: CFAbsoluteTime = 0

    init(locale: Locale = Locale(identifier: "en-US")) {
        speechRecognizer = SFSpeechRecognizer(locale: locale)
    }

    func updateLocale(_ localeIdentifier: String) {
        let locale = localeIdentifier == "ja" ? Locale(identifier: "ja-JP") : Locale(identifier: "en-US")
        speechRecognizer = SFSpeechRecognizer(locale: locale)
    }

    func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }

    // MARK: - Public start/stop

    func startRecording() {
        recognitionTask?.cancel()
        recognitionTask = nil
        committedText = ""
        currentSessionText = ""
        transcript = ""

        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                guard status == .authorized else { return }
                self?.requestMicPermission()
            }
        }
    }

    private func requestMicPermission() {
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            Task { @MainActor in
                guard granted else { return }
                self?.isRecording = true
                self?.beginSession()
            }
        }
    }

    func stopRecording() {
        silenceTimer?.invalidate()
        silenceTimer = nil
        isRecording = false
        tearDownSession()
        // Final punctuation
        if !currentSessionText.isEmpty {
            let full = buildFullTranscript(currentSession: currentSessionText)
            transcript = Self.ensurePunctuation(full)
        } else if !committedText.isEmpty {
            transcript = committedText
        }
        committedText = ""
        currentSessionText = ""
        audioLevel = 0
        // Release audio session so keyboard dictation and other apps can use the mic
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: - Session lifecycle

    /// Start a fresh recognition session (request + audio tap + task).
    private func beginSession() {
        guard let speechRecognizer, speechRecognizer.isAvailable, isRecording else { return }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true
        if speechRecognizer.supportsOnDeviceRecognition {
            request.requiresOnDeviceRecognition = true
        }
        recognitionRequest = request

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            return
        }

        // Use a fresh audio engine to avoid stale tap issues
        audioEngine = AVAudioEngine()
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            request.append(buffer)
            // Throttle level updates
            let now = CFAbsoluteTimeGetCurrent()
            guard let self, now - self.lastLevelUpdate > 0.05 else { return }
            self.lastLevelUpdate = now
            guard let channelData = buffer.floatChannelData?[0] else { return }
            let frameLength = UInt(buffer.frameLength)
            var rms: Float = 0
            vDSP_rmsqv(channelData, 1, &rms, frameLength)
            let normalized = min(CGFloat(rms) * 10.0, 1.0)
            DispatchQueue.main.async { [weak self] in
                self?.audioLevel = normalized
            }
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            return
        }

        currentSessionText = ""
        let activeSessionId = UUID()
        sessionId = activeSessionId

        // Start recognition task
        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self, self.isRecording, self.sessionId == activeSessionId else { return }

                if let result {
                    // Apple's formattedString is cumulative within THIS session only
                    self.currentSessionText = result.bestTranscription.formattedString
                    self.transcript = self.buildFullTranscript(currentSession: self.currentSessionText)

                    // Reset silence timer on each result
                    self.silenceTimer?.invalidate()
                    self.silenceTimer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: false) { _ in
                        Task { @MainActor in
                            guard self.sessionId == activeSessionId else { return }
                            // Force-end this session to commit text
                            self.recognitionRequest?.endAudio()
                        }
                    }

                    if result.isFinal {
                        self.silenceTimer?.invalidate()
                        self.handleSessionEnd()
                    }
                } else if error != nil {
                    self.silenceTimer?.invalidate()
                    self.handleSessionEnd()
                }
            }
        }
    }

    /// Tear down current audio engine + request + task without touching committed state.
    private func tearDownSession() {
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        audioEngine.inputNode.removeTap(onBus: 0)
        // Cancel task first, then nil out — sessionId is already invalidated
        // so any callbacks triggered by cancel will be ignored.
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
    }

    /// Called when the current session ends (isFinal or error). Commits text and restarts.
    private func handleSessionEnd() {
        guard isRecording, !isRestarting else { return }
        isRestarting = true

        // Invalidate session ID IMMEDIATELY so any stale callbacks from the
        // old task are ignored — even during the 0.3s restart delay.
        sessionId = UUID()

        // Commit current session text
        if !currentSessionText.isEmpty {
            let full = buildFullTranscript(currentSession: currentSessionText)
            committedText = Self.ensurePunctuation(full)
            transcript = committedText
            currentSessionText = ""
        }

        // Tear down and restart after a brief delay to let audio system settle
        tearDownSession()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self, self.isRecording else {
                self?.isRestarting = false
                return
            }
            self.isRestarting = false
            self.beginSession()
        }
    }

    /// Build the full display transcript from committed lines + current session.
    private func buildFullTranscript(currentSession: String) -> String {
        if committedText.isEmpty {
            return currentSession
        }
        if currentSession.isEmpty {
            return committedText
        }
        return committedText + "\n" + currentSession
    }

    // MARK: - Punctuation

    /// Ensure the last line of the transcript ends with punctuation.
    static func ensurePunctuation(_ text: String) -> String {
        let lines = text.components(separatedBy: "\n")
        guard var lastLine = lines.last else { return text }
        let prefix = lines.dropLast().joined(separator: "\n")

        lastLine = lastLine.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !lastLine.isEmpty else { return text }

        let endPunctuation: Set<Character> = [".", "!", "?", "。", "！", "？", "…"]
        if endPunctuation.contains(lastLine.last!) {
            return prefix.isEmpty ? lastLine : prefix + "\n" + lastLine
        }

        let isJapanese = lastLine.contains(where: { c in
            guard let s = c.unicodeScalars.first else { return false }
            return (s.value >= 0x3040 && s.value <= 0x9FFF) || (s.value >= 0x30A0 && s.value <= 0x30FF)
        })

        let lower = lastLine.lowercased()

        let questionStarters = ["who ", "what ", "where ", "when ", "why ", "how ",
                                "is ", "are ", "was ", "were ", "do ", "does ", "did ",
                                "can ", "could ", "would ", "should ", "will ", "shall ",
                                "have ", "has ", "had ", "don't ", "isn't ", "aren't "]
        let isQuestion = questionStarters.contains(where: { lower.hasPrefix($0) })
            || lower.hasSuffix(" right") || lower.hasSuffix(" huh")
        let jpQuestion = lastLine.hasSuffix("か") || lastLine.hasSuffix("かな")
            || lastLine.hasSuffix("でしょう") || lastLine.hasSuffix("ですか")

        if isQuestion || jpQuestion {
            lastLine += isJapanese ? "？" : "?"
            return prefix.isEmpty ? lastLine : prefix + "\n" + lastLine
        }

        let exclamStarters = ["wow", "oh", "yes", "no", "hey", "stop", "wait",
                              "help", "nice", "awesome", "amazing", "great",
                              "let's go", "come on", "hurry"]
        let isExclaim = exclamStarters.contains(where: { lower.hasPrefix($0) })
        let jpExclaim = lastLine.hasSuffix("よ") || lastLine.hasSuffix("ぞ")
            || lastLine.hasSuffix("ね") || lastLine.hasSuffix("なあ")
            || lastLine.hasSuffix("すごい") || lastLine.hasSuffix("やばい")

        if isExclaim || jpExclaim {
            lastLine += isJapanese ? "！" : "!"
            return prefix.isEmpty ? lastLine : prefix + "\n" + lastLine
        }

        lastLine += isJapanese ? "。" : "."
        return prefix.isEmpty ? lastLine : prefix + "\n" + lastLine
    }
}

#else

/// Stub for non-iOS platforms (satisfies SourceKit on macOS).
@MainActor
final class SpeechRecognizer: ObservableObject {
    @Published var transcript = ""
    @Published var isRecording = false
    func updateLocale(_ localeIdentifier: String) {}
    func toggleRecording() {}
    func stopRecording() {}
}

#endif
