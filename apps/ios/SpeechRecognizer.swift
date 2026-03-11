import Combine
import Foundation

#if os(iOS)
import Speech
import AVFoundation

/// Wraps Apple's Speech framework for on-device speech-to-text.
@MainActor
final class SpeechRecognizer: ObservableObject {
    @Published var transcript = ""
    @Published var isRecording = false

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

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

    func startRecording() {
        recognitionTask?.cancel()
        recognitionTask = nil

        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                guard status == .authorized else { return }
                self?.requestMicAndBegin()
            }
        }
    }

    private func requestMicAndBegin() {
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            Task { @MainActor in
                guard granted else { return }
                self?.beginRecording()
            }
        }
    }

    private func beginRecording() {
        guard let speechRecognizer, speechRecognizer.isAvailable else { return }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true
        if speechRecognizer.supportsOnDeviceRecognition {
            request.requiresOnDeviceRecognition = true
        }
        recognitionRequest = request

        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            return
        }

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            request.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            return
        }

        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self, self.isRecording else { return }
                if let result {
                    let text = result.bestTranscription.formattedString
                    self.transcript = Self.ensurePunctuation(text)
                    if result.isFinal {
                        self.stopRecording()
                    }
                } else if error != nil {
                    self.stopRecording()
                }
            }
        }

        isRecording = true
    }

    /// Ensure the transcript ends with punctuation (.  !  ?)
    static func ensurePunctuation(_ text: String) -> String {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return trimmed }

        // Already has ending punctuation (English or Japanese)
        let lastChar = trimmed.last!
        let endPunctuation: Set<Character> = [".", "!", "?", "。", "！", "？", "…"]
        if endPunctuation.contains(lastChar) { return trimmed }

        // Check if text contains Japanese characters (for choosing full-width punctuation)
        let isJapanese = trimmed.contains(where: { c in
            guard let s = c.unicodeScalars.first else { return false }
            return (s.value >= 0x3040 && s.value <= 0x9FFF) || (s.value >= 0x30A0 && s.value <= 0x30FF)
        })

        // Detect question patterns (English)
        let lower = trimmed.lowercased()
        let questionStarters = ["who ", "what ", "where ", "when ", "why ", "how ",
                                "is ", "are ", "was ", "were ", "do ", "does ", "did ",
                                "can ", "could ", "would ", "should ", "will ", "shall ",
                                "have ", "has ", "had ", "don't ", "isn't ", "aren't "]
        let isQuestion = questionStarters.contains(where: { lower.hasPrefix($0) })
            || lower.hasSuffix(" right")
            || lower.hasSuffix(" huh")

        // Detect question patterns (Japanese)
        let jpQuestion = trimmed.hasSuffix("か") || trimmed.hasSuffix("かな")
            || trimmed.hasSuffix("でしょう") || trimmed.hasSuffix("ですか")

        if isQuestion || jpQuestion {
            return trimmed + (isJapanese ? "？" : "?")
        }

        // Detect exclamatory patterns (English)
        let exclamStarters = ["wow", "oh", "yes", "no", "hey", "stop", "wait",
                              "help", "nice", "awesome", "amazing", "great",
                              "let's go", "come on", "hurry"]
        let isExclaim = exclamStarters.contains(where: { lower.hasPrefix($0) })

        // Detect exclamatory patterns (Japanese)
        let jpExclaim = trimmed.hasSuffix("よ") || trimmed.hasSuffix("ぞ")
            || trimmed.hasSuffix("ね") || trimmed.hasSuffix("なあ")
            || trimmed.hasSuffix("すごい") || trimmed.hasSuffix("やばい")

        if isExclaim || jpExclaim {
            return trimmed + (isJapanese ? "！" : "!")
        }

        // Default: add a period
        return trimmed + (isJapanese ? "。" : ".")
    }

    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        // Apply punctuation BEFORE clearing isRecording so onChange(of: transcript)
        // propagates the punctuated text to messageText first
        if !transcript.isEmpty {
            transcript = Self.ensurePunctuation(transcript)
        }
        isRecording = false
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
