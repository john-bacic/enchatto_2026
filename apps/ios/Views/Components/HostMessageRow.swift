import AVFoundation
import SwiftUI
import UIKit

struct HostMessageRow: View {
    let message: Message
    let sender: Participant?
    let isOwn: Bool
    let replyTarget: Message?
    let replyTargetSender: Participant?
    var reactions: [ReactionSummaryEntry] = []
    var preferredLanguage: String = "en"
    var onReply: () -> Void
    var onSuggestionTap: ((String) -> Void)?
    var onReact: ((String) -> Void)?
    var onLongPress: (() -> Void)?
    var showEnglish: Bool = true
    var showJapanese: Bool = true
    var showRomaji: Bool = true

    private let maxBubbleWidth = UIScreen.main.bounds.width * 0.75
    private let avatarSize: CGFloat = 36

    @AppStorage(ChatTextSize.storageKey) private var textSize: ChatTextSize = .small
    @State private var textOpen = false

    var onImageTap: ((String) -> Void)?
    /// Retry and Delete under a bubble the server refused; shown only where both are given
    var onRetrySend: (() -> Void)?
    var onDeleteUnsent: (() -> Void)?

    private var isAudio: Bool { message.kind == .audio }
    /// A voice message's transcript (and its translation) stays collapsed until "Show text"
    private var showsText: Bool { !isAudio || textOpen }

    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 0) }

            VStack(alignment: isOwn ? .trailing : .leading, spacing: 6) {
                replyPreview
                bubbleRow
                unsentActions
                suggestionsRow
            }

            if !isOwn { Spacer(minLength: 0) }
        }
        .modifier(FreshMessagePop(isFresh: isFresh, fromTrailing: isOwn))
    }

    /// The host's own text, photo or drawing is on screen as a placeholder before the server's copy (which carries
    /// the clientId) arrives: only the placeholder pops in
    private var isFresh: Bool {
        guard Date().timeIntervalSince(message.createdAt) < 8 else { return false }
        return !(isOwn && !isAudio && message.clientId != nil && !message.isQueuedPlaceholder)
    }

    // MARK: - Unsent actions

    @ViewBuilder
    private var unsentActions: some View {
        if message.sendState == .failed, let onRetrySend, let onDeleteUnsent {
            HStack(spacing: 8) {
                Button(L.t("Delete", preferredLanguage)) { Haptics.tap(); onDeleteUnsent() }
                    .buttonStyle(.chunky(.white, size: .mini, fullWidth: false))
                Button(L.t("Retry", preferredLanguage)) { Haptics.tap(); onRetrySend() }
                    .buttonStyle(.chunky(EC.yellow, size: .mini, fullWidth: false))
            }
        }
    }

    // MARK: - Bubble row (avatar + bubble + react button)

    private var bubbleRow: some View {
        HStack(alignment: .bottom, spacing: 6) {
            if !isOwn {
                avatarColumn
            }

            HStack(alignment: .center, spacing: 6) {
                messageBubble
                    .onLongPressGesture {
                        onLongPress?()
                    }
                    .overlay(alignment: isOwn ? .bottomTrailing : .bottomLeading) {
                        if !reactions.isEmpty {
                            reactionChips
                                .padding(.horizontal, 12)
                                .offset(y: 18)
                        }
                    }
                    .padding(.bottom, reactions.isEmpty ? 0 : 16)

                if !isOwn && reactions.isEmpty {
                    Button { onLongPress?() } label: {
                        PackIcon("re-heart", size: 18)
                            .saturation(0)
                            .opacity(0.35)
                            .frame(width: 28, height: 28)
                    }
                    .buttonStyle(.pressable)
                    .accessibilityLabel(L.t("React", preferredLanguage))
                }
            }
            .frame(maxWidth: maxBubbleWidth, alignment: isOwn ? .trailing : .leading)
        }
    }

    // MARK: - Avatar column

    private var avatarColumn: some View {
        VStack(spacing: 3) {
            if let sender {
                AvatarDisc(avatarId: sender.avatar.value, size: avatarSize)
            } else {
                Circle()
                    .fill(EC.lineSoft)
                    .frame(width: avatarSize, height: avatarSize)
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
            }
            Text(sender?.nickname ?? L.t("Unknown", preferredLanguage))
                .font(.round(10, .black))
                .foregroundStyle(EC.inkSoft)
                .lineLimit(1)
                .frame(maxWidth: 44)
        }
        .padding(.bottom, reactions.isEmpty ? 4 : 20)
    }

    // MARK: - Reply preview

    @ViewBuilder
    private var replyPreview: some View {
        if replyTarget != nil {
            HStack(spacing: 6) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(EC.pink)
                    .frame(width: 4)

                VStack(alignment: .leading, spacing: 2) {
                    if let replyTargetSender {
                        HStack(spacing: 4) {
                            AvatarDisc(avatarId: replyTargetSender.avatar.value, size: 16)
                            Text(replyTargetSender.nickname)
                                .font(.round(11, .black))
                                .foregroundStyle(EC.ink)
                        }
                    }
                    replyContentText
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxBubbleWidth * 0.85, alignment: .leading)
            .ecOutline(fill: .white.opacity(0.85), radius: 12, border: 2)
            .padding(.leading, isOwn ? 0 : avatarSize + 6)
        }
    }

    @ViewBuilder
    private var replyContentText: some View {
        if let replyTarget {
            Group {
                switch replyTarget.kind {
                case .image:
                    Label(L.t("Photo", preferredLanguage), systemImage: "photo")
                case .drawing:
                    Label(L.t("Drawing", preferredLanguage), systemImage: "pencil.tip")
                case .audio:
                    Label(replyTarget.text?.prefix(60).description ?? L.t("Voice message", preferredLanguage), systemImage: "mic.fill")
                default:
                    Text(replyTarget.text?.prefix(60).description ?? "")
                }
            }
            .font(.round(11, .medium))
            .foregroundStyle(EC.inkSoft)
            .lineLimit(1)
        }
    }

    // MARK: - Bubble

    /// A voice message counts as delivered right away; only its collapsed transcript is still translating.
    /// A bubble that has not reached the server keeps the pending look even once its on-device translation is in
    private var isPending: Bool { (message.status == .pending && !isAudio) || message.sendState != nil }

    private var textColor: Color { isOwn && !isPending ? .white : EC.ink }

    private var bubbleFill: Color {
        if isPending { return EC.blueSoft }
        if isOwn { return EC.blue }
        // Guests' bubbles carry their avatar colour so a busy room is easy to scan
        if let sender, sender.role != .host { return sender.tint }
        return .white
    }

    private var bubbleShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 20,
            bottomLeadingRadius: isOwn ? 20 : 6,
            bottomTrailingRadius: isOwn ? 6 : 20,
            topTrailingRadius: 20,
            style: .continuous
        )
    }

    private var messageBubble: some View {
        bubbleContent
            .padding(.horizontal, 14)
            .padding(.top, 10)
            .padding(.bottom, 11)
            .background(bubbleShape.fill(bubbleFill))
            .overlay(
                bubbleShape.stroke(
                    message.sendState == .failed ? EC.red : (isPending ? EC.blue : EC.ink),
                    style: StrokeStyle(lineWidth: 3, dash: isPending ? [7, 5] : [])
                )
            )
            .background(bubbleShape.fill(isPending ? EC.blue.opacity(0.5) : EC.ink).offset(y: 5))
            .padding(.bottom, 5)
    }

    /// Determine if the original message text is Japanese
    private var isOriginalJapanese: Bool {
        guard let text = message.text, !text.isEmpty else { return false }
        // Check if text contains any Japanese characters (Hiragana, Katakana, CJK)
        return text.unicodeScalars.contains { scalar in
            let v = scalar.value
            return (0x3040...0x309F).contains(v) ||  // Hiragana
                   (0x30A0...0x30FF).contains(v) ||  // Katakana
                   (0x4E00...0x9FFF).contains(v)     // CJK
        }
    }

    /// The English text (original or translated, whichever is English)
    private var englishText: String? {
        if isOriginalJapanese {
            return message.processing?.translatedText
        } else {
            return message.text
        }
    }

    /// The Japanese text (original or translated, whichever is Japanese)
    private var japaneseText: String? {
        if isOriginalJapanese {
            return message.text
        } else {
            return message.processing?.translatedText
        }
    }

    private func primaryText(_ text: String) -> some View {
        Text(text)
            .font(.round(16 * textSize.scale, .black))
            .foregroundStyle(textColor)
            .fixedSize(horizontal: false, vertical: true)
    }

    private func romajiText(_ text: String) -> some View {
        Text(text)
            .font(.round(12 * textSize.scale, .bold))
            .italic()
            .foregroundStyle(isOwn && !isPending ? EC.pinkSoft : EC.pink)
            .fixedSize(horizontal: false, vertical: true)
    }

    private func translationLine(_ text: String, tag: String) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(tag)
                .font(.round(10, .black))
                .foregroundStyle(EC.ink)
                .padding(.horizontal, 5)
                .padding(.vertical, 1)
                .background(RoundedRectangle(cornerRadius: 5).fill(EC.yellow))
                .overlay(RoundedRectangle(cornerRadius: 5).strokeBorder(EC.ink, lineWidth: 1.5))
            Text(text)
                .font(.round(14 * textSize.scale, .bold))
                .foregroundStyle(textColor)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    @ViewBuilder
    private var bubbleContent: some View {
        VStack(alignment: .leading, spacing: 4) {
            if isAudio {
                VoiceMessagePlayer(message: message, isOwn: isOwn, lang: preferredLanguage)
                if let text = message.text, !text.isEmpty {
                    showTextToggle
                }
            }
            if showsText {
                textBlocks
            }
        }
    }

    private var showTextToggle: some View {
        VStack(alignment: .leading, spacing: 6) {
            DashedRule(color: isOwn ? .white.opacity(0.45) : EC.lineSoft)
            Button {
                Haptics.tap()
                withAnimation(.easeOut(duration: 0.2)) { textOpen.toggle() }
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 9, weight: .black))
                        .rotationEffect(.degrees(textOpen ? 180 : 0))
                    Text(L.t(textOpen ? "Hide text" : "Show text", preferredLanguage))
                        .font(.round(12.5, .black))
                }
                .foregroundStyle(isOwn ? Color.white.opacity(0.85) : EC.inkSoft)
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityAddTraits(.isButton)
        }
        .padding(.top, 6)
    }

    @ViewBuilder
    private var textBlocks: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Primary text — show preferred language first
            if preferredLanguage == "ja" {
                if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    primaryText(jp)
                    // Romaji grouped with Japanese
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        romajiText(romaji)
                    }
                } else if showEnglish, let en = englishText, !en.isEmpty {
                    primaryText(en)
                } else if let original = message.text, !original.isEmpty {
                    primaryText(original)
                }
            } else {
                if showEnglish, let en = englishText, !en.isEmpty {
                    primaryText(en)
                } else if showJapanese, let jp = japaneseText, !jp.isEmpty {
                    primaryText(jp)
                    // Romaji grouped with Japanese (fallback)
                    if message.status == .processed, showRomaji,
                       let romaji = message.processing?.romaji, !romaji.isEmpty {
                        romajiText(romaji)
                    }
                } else if let original = message.text, !original.isEmpty {
                    primaryText(original)
                }
            }

            // Media
            if message.kind == .image || message.kind == .drawing {
                if let url = message.mediaUrl {
                    let isDrawing = message.kind == .drawing
                    let thumbWidth: CGFloat = 200
                    // A picture sent from this device is drawn from memory and loads nothing, so the bubble does not
                    // fall back to the grey box when the server's copy (a new row, a CDN URL) replaces the placeholder
                    let sent = SentPictures.thumbnail(clientId: message.clientId)

                    AsyncImage(url: sent == nil ? URL(string: url) : nil) { phase in
                        if let image = sent.map({ Image(uiImage: $0) }) ?? phase.image {
                            image.resizable()
                                .scaledToFit()
                                .frame(maxWidth: thumbWidth)
                                .background(Color.white)
                                .onTapGesture { onImageTap?(url) }
                        } else {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(isOwn ? Color.white.opacity(0.25) : EC.blueSoft)
                                .frame(width: thumbWidth, height: 120)
                                .overlay {
                                    PackIcon(isDrawing ? "g-pencil" : "ui-photo", size: 36)
                                        .opacity(0.7)
                                }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(EC.ink, lineWidth: 2.5))
                    .padding(.vertical, 2)
                }
            }

            // Secondary content — always: divider between English and Japanese/Romaji
            if message.status == .processed, let processing = message.processing {
                let hasSecondary: Bool = {
                    if preferredLanguage == "ja" {
                        let primaryShowedJapanese = showJapanese && !(japaneseText ?? "").isEmpty
                        return primaryShowedJapanese && showEnglish && !(englishText ?? "").isEmpty
                    } else {
                        let primaryShowedEnglish = showEnglish && !(englishText ?? "").isEmpty
                        return primaryShowedEnglish && showJapanese && !(japaneseText ?? "").isEmpty
                    }
                }()
                // Romaji below divider only if not already shown with Japanese in primary
                let romajiAvailable = showRomaji && !(processing.romaji ?? "").isEmpty
                let romajiShownInPrimary: Bool = {
                    if preferredLanguage == "ja" {
                        return showJapanese && !(japaneseText ?? "").isEmpty
                    } else {
                        // Japanese was fallback primary (English not shown)
                        let englishShown = showEnglish && !(englishText ?? "").isEmpty
                        return !englishShown && showJapanese && !(japaneseText ?? "").isEmpty
                    }
                }()
                let hasRomajiBelow = romajiAvailable && !romajiShownInPrimary

                if hasSecondary || hasRomajiBelow {
                    VStack(alignment: .leading, spacing: 4) {
                        DashedRule(color: isOwn && !isPending ? .white.opacity(0.45) : EC.lineSoft)
                            .padding(.bottom, 4)
                        if preferredLanguage == "ja" {
                            // Romaji below divider if Japanese wasn't shown as primary
                            if hasRomajiBelow {
                                romajiText(processing.romaji!)
                            }
                            if showEnglish, let en = englishText, !en.isEmpty {
                                translationLine(en, tag: "EN")
                            }
                        } else {
                            // Romaji + Japanese grouped below divider
                            if hasRomajiBelow {
                                romajiText(processing.romaji!)
                            }
                            if showJapanese, let jp = japaneseText, !jp.isEmpty {
                                translationLine(jp, tag: "JA")
                            }
                        }
                    }
                    .padding(.top, 4)
                }
            }

            // Pending
            if message.status == .pending && message.sendState == nil {
                HStack(spacing: 6) {
                    Text(L.t("Processing...", preferredLanguage))
                        .font(.round(11, .black))
                        .foregroundStyle(isAudio && isOwn ? .white : EC.blue)
                    PendingDots()
                }
                .padding(.top, 2)
            }

            // Not on the server yet
            if message.sendState == .sending {
                HStack(spacing: 6) {
                    Text(L.t("Sending…", preferredLanguage))
                        .font(.round(11, .black))
                        .foregroundStyle(EC.blue)
                    PendingDots()
                }
                .padding(.top, 2)
            }

            // Failed
            if message.status == .failed {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 11, weight: .bold))
                    Text(message.processing?.error ?? L.t("Processing failed", preferredLanguage))
                        .font(.round(11, .black))
                }
                .foregroundStyle(isOwn ? EC.yellow : EC.red)
                .padding(.top, 2)
            }

            // Refused by the server
            if message.sendState == .failed {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 11, weight: .bold))
                    Text(L.t("Not sent", preferredLanguage))
                        .font(.round(11, .black))
                }
                .foregroundStyle(EC.red)
                .padding(.top, 2)
            }
        }
    }

    // MARK: - Reaction chips (overlapping the bubble's bottom edge)

    private var reactionChips: some View {
        HStack(spacing: 5) {
            ForEach(reactions, id: \.emoji) { entry in
                Button {
                    onLongPress?()
                } label: {
                    HStack(spacing: 3) {
                        EmojiArt(emoji: entry.emoji, size: 18)
                        if entry.count > 1 {
                            Text("\(entry.count)")
                                .font(.chunky(12))
                                .foregroundStyle(EC.ink)
                        }
                    }
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(entry.count > 1 ? EC.pinkSoft : .white))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                    .background(Capsule().fill(EC.ink).offset(y: 2))
                }
                .buttonStyle(.pressable)
                .transition(.scale(scale: 0.3).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.5), value: reactions.map { "\($0.emoji)\($0.count)" })
    }

    // MARK: - Suggestions

    private static let suggestionFills = [EC.pinkSoft, EC.blueSoft, EC.mintSoft, EC.yellowSoft]

    @ViewBuilder
    private var suggestionsRow: some View {
        if let suggestions = message.processing?.suggestions, !suggestions.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(Array(suggestions.prefix(4).enumerated()), id: \.element) { i, suggestion in
                        Button {
                            Haptics.tap()
                            onSuggestionTap?(suggestion)
                        } label: {
                            Text(suggestion)
                                .font(.round(12, .black))
                                .foregroundStyle(EC.ink)
                                .padding(.horizontal, 11)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(Self.suggestionFills[i % Self.suggestionFills.count]))
                                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                                .background(Capsule().fill(EC.ink).offset(y: 3))
                                .padding(.bottom, 3)
                        }
                        .buttonStyle(.pressable)
                    }
                }
                .padding(.vertical, 2)
            }
            .padding(.leading, isOwn ? 0 : avatarSize + 6)
        }
    }
}

/// Bouncing "…" while a message is being translated
private struct PendingDots: View {
    var body: some View {
        LoopClock { t in
            HStack(spacing: 3) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill([EC.blue, EC.pink, EC.mint][i])
                        .frame(width: 6, height: 6)
                        .offset(y: -1.5 - 1.5 * loopWave(t, period: 0.7, delay: Double(i) * 0.12))
                }
            }
        }
    }
}

/// Springs a just-arrived message in; rows re-created by lazy scrolling stay put.
private struct FreshMessagePop: ViewModifier {
    let isFresh: Bool
    let fromTrailing: Bool
    @State private var shown = false

    func body(content: Content) -> some View {
        let hidden = isFresh && !shown
        content
            .scaleEffect(hidden ? 0.6 : 1, anchor: fromTrailing ? .bottomTrailing : .bottomLeading)
            .opacity(hidden ? 0 : 1)
            .onAppear {
                guard isFresh, !shown else { return }
                withAnimation(.spring(response: 0.38, dampingFraction: 0.62)) { shown = true }
            }
    }
}

/// Thumbnails of the photos and drawings the host sent from this device, by clientId (the placeholder and the server's
/// copy both carry it). Kept in memory only, and dropped by the system when memory is short: the bubble then loads its URL.
enum SentPictures {
    private static let thumbnails: NSCache<NSString, UIImage> = {
        let cache = NSCache<NSString, UIImage>()
        cache.countLimit = 12
        return cache
    }()

    static func store(_ image: UIImage, clientId: String) {
        guard image.size.width > 0 else { return }
        // Bubble pictures are 200 pt wide; the full-size picture is not kept
        let size = CGSize(width: 200, height: (200 * image.size.height / image.size.width).rounded())
        let format = UIGraphicsImageRendererFormat.default()
        // Wide colour would double the memory of each thumbnail
        format.preferredRange = .standard
        let thumbnail = UIGraphicsImageRenderer(size: size, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
        thumbnails.setObject(thumbnail, forKey: clientId as NSString)
    }

    static func thumbnail(clientId: String?) -> UIImage? {
        clientId.flatMap { thumbnails.object(forKey: $0 as NSString) }
    }
}

// MARK: - Voice messages

/// One AVPlayer for the whole chat, so starting a voice message stops whichever was playing
@MainActor
final class VoicePlayback: ObservableObject {
    static let shared = VoicePlayback()
    /// Slow speeds are for language learners catching every word
    static let speeds: [Float] = [0.5, 0.75, 1, 1.5, 2]
    private static let playedKey = "enchatto_playedVoice"
    private static let speedKey = "enchatto_voiceSpeed"

    @Published private(set) var currentId: String?
    @Published private(set) var isPlaying = false
    @Published private(set) var progress: Double = 0
    @Published private(set) var speed: Float = 1
    @Published private(set) var playedIds: Set<String>
    /// Set while dictating: playback would switch the audio session away from recording
    var blocked = false

    private var player: AVPlayer?
    private var duration: Double = 1
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?

    private init() {
        playedIds = Set(UserDefaults.standard.stringArray(forKey: Self.playedKey) ?? [])
        let saved = UserDefaults.standard.float(forKey: Self.speedKey)
        if Self.speeds.contains(saved) { speed = saved }
    }

    func toggle(id: String, url: URL, durationMs: Double?) {
        if currentId == id, let player {
            if isPlaying { player.pause() } else { resume(player) }
            isPlaying.toggle()
            return
        }
        play(id: id, url: url, durationMs: durationMs, from: 0)
    }

    func seek(id: String, url: URL, durationMs: Double?, to fraction: Double) {
        if currentId == id, let player {
            player.seek(to: CMTime(seconds: fraction * duration, preferredTimescale: 600))
            progress = fraction
            if !isPlaying {
                resume(player)
                isPlaying = true
            }
            return
        }
        play(id: id, url: url, durationMs: durationMs, from: fraction)
    }

    /// Applies to every voice message and is remembered
    func setSpeed(_ newSpeed: Float) {
        speed = newSpeed
        UserDefaults.standard.set(newSpeed, forKey: Self.speedKey)
        if isPlaying { player?.rate = newSpeed }
    }

    func stop() {
        player?.pause()
        teardown()
        currentId = nil
        isPlaying = false
        progress = 0
    }

    private func play(id: String, url: URL, durationMs: Double?, from fraction: Double) {
        guard !blocked else { return }
        stop()
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio)
        try? session.setActive(true)

        let item = AVPlayerItem(url: url)
        // Keeps pitch natural at every offered speed; the cheaper algorithms only handle a few fixed rates
        item.audioTimePitchAlgorithm = .spectral
        let player = AVPlayer(playerItem: item)
        self.player = player
        duration = max(0.1, (durationMs ?? 1000) / 1000)
        currentId = id
        progress = fraction
        timeObserver = player.addPeriodicTimeObserver(forInterval: CMTime(value: 1, timescale: 20), queue: .main) { [weak self] time in
            Task { @MainActor in
                guard let self, self.currentId == id else { return }
                if let real = player.currentItem?.duration.seconds, real.isFinite, real > 0 { self.duration = real }
                self.progress = min(1, time.seconds / self.duration)
            }
        }
        endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak self] _ in
            Task { @MainActor in
                guard let self, self.currentId == id else { return }
                self.stop()
            }
        }
        if fraction > 0 { player.seek(to: CMTime(seconds: fraction * duration, preferredTimescale: 600)) }
        resume(player)
        isPlaying = true
        markPlayed(id)
    }

    private func resume(_ player: AVPlayer) {
        player.playImmediately(atRate: speed)
    }

    private func teardown() {
        if let timeObserver { player?.removeTimeObserver(timeObserver) }
        timeObserver = nil
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        endObserver = nil
        player = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func markPlayed(_ id: String) {
        guard !playedIds.contains(id) else { return }
        playedIds.insert(id)
        var list = UserDefaults.standard.stringArray(forKey: Self.playedKey) ?? []
        list.append(id)
        UserDefaults.standard.set(Array(list.suffix(300)), forKey: Self.playedKey)
    }
}

/// Play/pause, seekable waveform that fills as it plays, duration and speed
private struct VoiceMessagePlayer: View {
    let message: Message
    let isOwn: Bool
    let lang: String
    @ObservedObject private var playback = VoicePlayback.shared

    private var url: URL? { message.mediaUrl.flatMap(URL.init(string:)) }
    private var isCurrent: Bool { playback.currentId == message.id }
    private var playing: Bool { isCurrent && playback.isPlaying }
    private var progress: Double { isCurrent ? playback.progress : 0 }
    private var totalSeconds: Double { (message.durationMs ?? 0) / 1000 }
    private var unplayed: Bool { !isOwn && !playback.playedIds.contains(message.id) }
    private var tint: Color { isOwn ? .white : EC.ink }

    private var bars: [Double] {
        if let waveform = message.waveform, !waveform.isEmpty { return waveform }
        return Self.placeholder(seed: message.id)
    }

    var body: some View {
        HStack(spacing: 10) {
            Button {
                guard let url else { return }
                Haptics.tap()
                playback.toggle(id: message.id, url: url, durationMs: message.durationMs)
            } label: {
                Image(systemName: playing ? "pause.fill" : "play.fill")
                    .font(.system(size: 14, weight: .black))
                    .foregroundStyle(EC.ink)
                    .offset(x: playing ? 0 : 1.5)
                    .frame(width: 38, height: 38)
                    .background(Circle().fill(isOwn ? .white : EC.yellow))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
                    .background(Circle().fill(EC.ink).offset(y: 3))
                    .padding(.bottom, 3)
            }
            .buttonStyle(.pressable)
            .disabled(url == nil)
            .opacity(url == nil ? 0.5 : 1)
            .accessibilityLabel(L.t(playing ? "Pause" : "Play", lang))

            waveform
                .frame(height: 30)
                .frame(minWidth: 120)

            VStack(alignment: .trailing, spacing: 3) {
                if url != nil {
                    Text(Self.clock(playing || progress > 0 ? progress * totalSeconds : totalSeconds))
                        .font(.round(12, .black))
                        .monospacedDigit()
                    Menu {
                        Picker(L.t("Playback speed", lang), selection: Binding(
                            get: { playback.speed },
                            set: { Haptics.tap(); playback.setSpeed($0) }
                        )) {
                            ForEach(VoicePlayback.speeds, id: \.self) { s in
                                Text(Self.speedLabel(s)).tag(s)
                            }
                        }
                    } label: {
                        Text(Self.speedLabel(playback.speed))
                            .font(.round(10.5, .black))
                            .foregroundStyle(tint)
                            .padding(.horizontal, 5)
                            .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(tint, lineWidth: 2))
                            .contentShape(Rectangle())
                    }
                    .menuOrder(.fixed)
                    .accessibilityLabel(L.t("Playback speed", lang))
                } else {
                    Text(L.t("Voice message expired", lang))
                        .font(.round(10.5, .black))
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 84, alignment: .trailing)
                        .opacity(0.75)
                }
            }
            .foregroundStyle(tint)
        }
        .overlay(alignment: .topTrailing) {
            if unplayed {
                Circle()
                    .fill(EC.pink)
                    .frame(width: 14, height: 14)
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
                    .offset(x: 20, y: -16)
                    .accessibilityHidden(true)
            }
        }
    }

    private var waveform: some View {
        GeometryReader { geo in
            Canvas { ctx, size in
                let count = bars.count
                let gap: CGFloat = 1.5
                let bar = max(1.5, min(3.5, (size.width - gap * CGFloat(count - 1)) / CGFloat(count)))
                let step = (size.width - bar) / CGFloat(max(1, count - 1))
                for (i, p) in bars.enumerated() {
                    let h = 4 + CGFloat(p) * (size.height - 4)
                    let rect = CGRect(x: CGFloat(i) * step, y: (size.height - h) / 2, width: bar, height: h)
                    let played = (Double(i) + 0.5) / Double(count) <= progress
                    ctx.fill(Path(roundedRect: rect, cornerRadius: bar / 2), with: .color(tint.opacity(played ? 1 : 0.32)))
                }
            }
            .contentShape(Rectangle())
            .gesture(
                SpatialTapGesture().onEnded { value in
                    guard let url else { return }
                    let fraction = min(1, max(0, value.location.x / geo.size.width))
                    playback.seek(id: message.id, url: url, durationMs: message.durationMs, to: fraction)
                }
            )
        }
        .accessibilityHidden(true)
    }

    private static func clock(_ seconds: Double) -> String {
        let s = max(0, Int(seconds.rounded()))
        return "\(s / 60):" + String(format: "%02d", s % 60)
    }

    private static func speedLabel(_ speed: Float) -> String {
        speed == speed.rounded() ? "\(Int(speed))×" : "\(speed)×"
    }

    /// Stand-in shape for clips recorded without a level meter, stable per message (same as web)
    private static func placeholder(seed: String) -> [Double] {
        var h: UInt32 = 2_166_136_261
        for c in seed.utf8 { h = (h ^ UInt32(c)) &* 16_777_619 }
        var prev = 0.5
        return (0..<48).map { _ in
            h = (h ^ (h >> 13)) &* 1_274_126_177
            prev = prev * 0.45 + Double(h % 1000) / 1000 * 0.55
            return 0.2 + prev * 0.8
        }
    }
}

#Preview {
    let sender = Participant(
        id: "p1", roomId: "r", nickname: "Alice", role: .participant, platform: .web,
        avatar: AvatarConfig(type: .preset, value: "cat"), preferredLanguage: "en",
        online: true, lastSeenAt: Date(), joinedAt: Date()
    )
    let message = Message(
        id: "m1", roomId: "r", senderId: "p1", kind: .text, status: .processed,
        text: "こんにちは！",
        processing: ProcessingState(
            translatedText: "Hello!",
            romaji: "Konnichiwa!",
            suggestions: ["Nice to meet you", "Hi there!"]
        ),
        createdAt: Date()
    )

    VStack {
        HostMessageRow(
            message: message, sender: sender, isOwn: false,
            replyTarget: nil, replyTargetSender: nil,
            onReply: {}
        )
    }
    .padding()
    .ecPaperBackground()
}
