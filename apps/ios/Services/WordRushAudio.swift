import AVFoundation
import SwiftUI

/// Records a short AAC (m4a) clip for Word Rush "Say it!" / teach clips.
@MainActor
final class WordRushRecorder: NSObject, ObservableObject, AVAudioRecorderDelegate {
    static let maxDuration: TimeInterval = 5

    @Published private(set) var isRecording = false
    @Published private(set) var elapsed: TimeInterval = 0
    /// 0…1 input level while recording
    @Published private(set) var level: CGFloat = 0
    @Published private(set) var recordedURL: URL?
    @Published private(set) var recordedDuration: TimeInterval = 0
    @Published private(set) var permissionDenied = false

    /// Called with the file once a take finishes (tap-stop or max duration)
    var onFinish: ((URL) -> Void)?

    private var recorder: AVAudioRecorder?
    private var meterTimer: Timer?
    private var savedSession: (category: AVAudioSession.Category, mode: AVAudioSession.Mode, options: AVAudioSession.CategoryOptions)?

    func toggle() async {
        if isRecording { stop() } else { await start() }
    }

    func start() async {
        guard !isRecording else { return }
        guard await Self.requestPermission() else {
            permissionDenied = true
            Haptics.error()
            return
        }
        permissionDenied = false
        discardTake()

        let session = AVAudioSession.sharedInstance()
        savedSession = (session.category, session.mode, session.categoryOptions)
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)

            let url = FileManager.default.temporaryDirectory
                .appendingPathComponent("wordrush-\(UUID().uuidString).m4a")
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
            ]
            let rec = try AVAudioRecorder(url: url, settings: settings)
            rec.delegate = self
            rec.isMeteringEnabled = true
            guard rec.record(forDuration: Self.maxDuration) else {
                restoreSession()
                Haptics.error()
                return
            }
            recorder = rec
            elapsed = 0
            isRecording = true
            Haptics.thump()
            meterTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
                Task { @MainActor in self?.tick() }
            }
        } catch {
            restoreSession()
            Haptics.error()
        }
    }

    func stop() {
        guard isRecording else { return }
        recorder?.stop()
    }

    /// Throw away the current take (recording or recorded)
    func discardTake() {
        if isRecording {
            recorder?.delegate = nil
            recorder?.stop()
            recorder?.deleteRecording()
            finishRecording()
        }
        if let url = recordedURL { try? FileManager.default.removeItem(at: url) }
        recordedURL = nil
        recordedDuration = 0
    }

    private func tick() {
        guard let recorder, recorder.isRecording else { return }
        elapsed = recorder.currentTime
        recorder.updateMeters()
        let db = recorder.averagePower(forChannel: 0)
        level = CGFloat(max(0, min(1, (db + 50) / 50)))
    }

    private func finishRecording() {
        meterTimer?.invalidate()
        meterTimer = nil
        isRecording = false
        level = 0
        recorder = nil
        restoreSession()
    }

    private func restoreSession() {
        let session = AVAudioSession.sharedInstance()
        if let saved = savedSession {
            try? session.setCategory(saved.category, mode: saved.mode, options: saved.options)
        }
        savedSession = nil
    }

    nonisolated func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        let url = recorder.url
        Task { @MainActor in
            let duration = self.elapsed
            self.finishRecording()
            guard flag, duration > 0.25 else {
                try? FileManager.default.removeItem(at: url)
                return
            }
            self.recordedURL = url
            self.recordedDuration = duration
            self.onFinish?(url)
        }
    }

    static func requestPermission() async -> Bool {
        await withCheckedContinuation { cont in
            AVAudioSession.sharedInstance().requestRecordPermission { cont.resume(returning: $0) }
        }
    }
}

/// Plays a remote (Convex storage URL) or local clip, one at a time.
@MainActor
final class WordRushClipPlayer: ObservableObject {
    /// Absolute string of the URL currently playing
    @Published private(set) var playing: String?
    @Published private(set) var progress: Double = 0
    /// Absolute string of a URL that couldn't be decoded (e.g. webm recorded by Firefox)
    @Published private(set) var failed: String?

    private var player: AVPlayer?
    private var endObserver: NSObjectProtocol?
    private var timeObserver: Any?
    private var statusObserver: NSKeyValueObservation?

    func toggle(_ url: URL) {
        if playing == url.absoluteString { stop() } else { play(url) }
    }

    func play(_ url: URL) {
        stop()
        let session = AVAudioSession.sharedInstance()
        if session.category != .playAndRecord {
            try? session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        }
        try? session.setActive(true)

        let item = AVPlayerItem(url: url)
        let player = AVPlayer(playerItem: item)
        let key = url.absoluteString
        statusObserver = item.observe(\.status) { [weak self] item, _ in
            guard item.status == .failed else { return }
            Task { @MainActor in
                self?.stop()
                self?.failed = key
                Haptics.error()
            }
        }
        endObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.stop() }
        }
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.05, preferredTimescale: 600), queue: .main
        ) { [weak self, weak item] time in
            guard let item else { return }
            let total = item.duration.seconds
            let p = total.isFinite && total > 0 ? time.seconds / total : 0
            Task { @MainActor in self?.progress = min(1, max(0, p)) }
        }
        self.player = player
        playing = key
        failed = nil
        progress = 0
        player.play()
    }

    func stop() {
        if let timeObserver { player?.removeTimeObserver(timeObserver) }
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        statusObserver?.invalidate()
        statusObserver = nil
        timeObserver = nil
        endObserver = nil
        player?.pause()
        player = nil
        playing = nil
        progress = 0
    }
}

/// Text-to-speech for "Hear it" buttons
enum WordRushSpeech {
    private static let synth = AVSpeechSynthesizer()

    static func say(_ text: String, lang: String) {
        let session = AVAudioSession.sharedInstance()
        if session.category != .playAndRecord {
            try? session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        }
        try? session.setActive(true)
        synth.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: lang == "ja" ? "ja-JP" : "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.85
        synth.speak(utterance)
    }
}
