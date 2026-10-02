import Combine
import Foundation
import Accelerate
import os

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
    /// Normalized mic level (0...1). Deliberately not @Published: a 20Hz publish would re-render
    /// every view observing this object, so meters poll it instead.
    private(set) var level: CGFloat = 0

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var audioEngine = AVAudioEngine()
    private var tapInstalled = false
    /// Changes on every start/stop so permission callbacks from a superseded start bail out.
    private var startToken = UUID()
    private var isStarting = false
    private var restartWork: DispatchWorkItem?
    private var observers: [NSObjectProtocol] = []

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
    /// Set once on-device recognition fails (missing/corrupt asset, simulator); later sessions use the server
    private var preferServer = false
    /// Sessions that errored within a second without producing text. Restarting into a broken
    /// recognizer forever would leave a "listening" pill that never transcribes.
    private var quickFailures = 0
    private var sessionGotResult = false
    private let log = Logger(subsystem: "com.enchatto.app", category: "speech")

    init(locale: Locale = Locale(identifier: "en-US")) {
        speechRecognizer = SFSpeechRecognizer(locale: locale)
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
            guard let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  AVAudioSession.InterruptionType(rawValue: raw) == .began else { return }
            Task { @MainActor in self?.stopRecording() }
        })
    }

    deinit {
        observers.forEach(NotificationCenter.default.removeObserver)
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
        guard !isRecording, !isStarting else { return }
        isStarting = true
        quickFailures = 0
        let token = UUID()
        startToken = token
        recognitionTask?.cancel()
        recognitionTask = nil
        committedText = ""
        currentSessionText = ""
        transcript = ""

        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                guard let self, self.startToken == token else { return }
                guard status == .authorized else {
                    self.isStarting = false
                    return
                }
                self.requestMicPermission(token: token)
            }
        }
    }

    private func requestMicPermission(token: UUID) {
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            Task { @MainActor in
                guard let self, self.startToken == token else { return }
                self.isStarting = false
                guard granted else { return }
                self.isRecording = true
                self.beginSession()
            }
        }
    }

    func stopRecording() {
        startToken = UUID()
        isStarting = false
        restartWork?.cancel()
        restartWork = nil
        isRestarting = false
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
        level = 0
        // Release audio session so keyboard dictation and other apps can use the mic
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: - Session lifecycle

    /// Start a fresh recognition session (request + audio tap + task).
    private func beginSession() {
        guard isRecording else { return }
        guard let speechRecognizer, speechRecognizer.isAvailable else {
            stopRecording()
            return
        }
        tearDownSession()

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true
        if speechRecognizer.supportsOnDeviceRecognition, !preferServer {
            request.requiresOnDeviceRecognition = true
        }
        let usedOnDevice = request.requiresOnDeviceRecognition
        recognitionRequest = request

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            stopRecording()
            return
        }

        // Use a fresh audio engine to avoid stale tap issues
        audioEngine = AVAudioEngine()
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        // installTap raises an uncatchable NSException on a 0Hz/0ch format (no input route, mid-interruption)
        guard recordingFormat.sampleRate > 0, recordingFormat.channelCount > 0 else {
            stopRecording()
            return
        }
        let meter = LevelMeter()
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            request.append(buffer)
            guard let normalized = meter.process(buffer) else { return }
            DispatchQueue.main.async { [weak self] in
                guard let self, self.isRecording else { return }
                self.level = normalized
            }
        }
        tapInstalled = true

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            stopRecording()
            return
        }

        currentSessionText = ""
        sessionGotResult = false
        let activeSessionId = UUID()
        sessionId = activeSessionId
        let startedAt = Date()

        // Start recognition task
        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self, self.isRecording, self.sessionId == activeSessionId else { return }

                if let result {
                    self.sessionGotResult = true
                    self.quickFailures = 0
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
                } else if let error {
                    self.silenceTimer?.invalidate()
                    let nsError = error as NSError
                    // Silence timeouts take seconds; an instant error means the recognizer itself is broken
                    if !self.sessionGotResult, Date().timeIntervalSince(startedAt) < 1 {
                        self.log.error("Recognition failed instantly (onDevice: \(usedOnDevice)): \(nsError.domain, privacy: .public) \(nsError.code) \(nsError.localizedDescription, privacy: .public)")
                        if usedOnDevice { self.preferServer = true }
                        self.quickFailures += 1
                        if self.quickFailures >= 3 {
                            self.stopRecording()
                            return
                        }
                    }
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
        if tapInstalled {
            audioEngine.inputNode.removeTap(onBus: 0)
            tapInstalled = false
        }
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
        let work = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.restartWork = nil
            self.isRestarting = false
            guard self.isRecording else { return }
            self.beginSession()
        }
        restartWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3, execute: work)
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

/// Mic level as dB above a tracked noise floor, so it reads the same regardless of input gain
/// (.measurement mode disables AGC, which leaves raw RMS tiny). Only touched from the audio thread.
private final class LevelMeter: @unchecked Sendable {
    private var floor: Float?
    private var lastEmit: CFAbsoluteTime = 0

    func process(_ buffer: AVAudioPCMBuffer) -> CGFloat? {
        guard let data = buffer.floatChannelData?[0], buffer.frameLength > 0 else { return nil }
        var rms: Float = 0
        vDSP_rmsqv(data, 1, &rms, vDSP_Length(buffer.frameLength))
        let db = 20 * log10(max(rms, 1e-7))
        // Snaps down to quiet instantly, creeps up ~1.5dB/s so steady hum fades out of the meter
        let current = floor.map { db < $0 ? db : min($0 + 0.07, db) } ?? db
        floor = current
        let now = CFAbsoluteTimeGetCurrent()
        guard now - lastEmit >= 0.04 else { return nil }
        lastEmit = now
        return CGFloat(min(1, max(0, (db - current - 6) / 24)))
    }
}

#else

/// Stub for non-iOS platforms (satisfies SourceKit on macOS).
@MainActor
final class SpeechRecognizer: ObservableObject {
    @Published var transcript = ""
    @Published var isRecording = false
    private(set) var level: CGFloat = 0
    func updateLocale(_ localeIdentifier: String) {}
    func toggleRecording() {}
    func startRecording() {}
    func stopRecording() {}
}

#endif
