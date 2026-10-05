import SwiftUI
import AudioToolbox

extension HostConversationView {
    // MARK: - Reply indicator

    func replyIndicator(for message: Message) -> some View {
        let sender = viewModel.participant(for: message.senderId)
        return HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(EC.pink)
                .frame(width: 4, height: 32)
            if let sender {
                AvatarDisc(avatarId: sender.avatar.value, size: 26)
            }
            VStack(alignment: .leading, spacing: 1) {
                Text("\(L.t("Replying to", hostLanguage)) \(sender?.nickname ?? L.t("Unknown", hostLanguage))")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.ink)
                Text(message.text?.prefix(40).description ?? "")
                    .font(.round(12, .medium))
                    .foregroundStyle(EC.inkSoft)
                    .lineLimit(1)
            }
            Spacer()
            Button {
                replyToId = nil
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.roundIcon(diameter: 28))
            .accessibilityLabel(L.t("Cancel", hostLanguage))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
        .background(EC.pinkSoft)
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    // MARK: - Input

    /// Tools fold into a chevron while typing so the field gets the width (web parity)
    private var toolsCollapsed: Bool {
        (isTextEditorFocused || !messageText.isEmpty) && !toolsOpen
    }

    private var toolsToggle: some View {
        Button {
            Haptics.tap()
            toolsOpen = true
        } label: {
            Path { p in
                p.move(to: CGPoint(x: 2.5, y: 2))
                p.addLine(to: CGPoint(x: 8, y: 8))
                p.addLine(to: CGPoint(x: 2.5, y: 14))
            }
            .stroke(EC.ink, style: StrokeStyle(lineWidth: 2.6, lineCap: .round, lineJoin: .round))
            .frame(width: 10, height: 16)
            .frame(width: 24, height: 44)
            .contentShape(Rectangle().inset(by: -6))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(L.t("More tools", hostLanguage))
    }

    private var toolButtons: some View {
        HStack(spacing: 8) {
            // Game button — End Game when active, Start Game otherwise
            if viewModel.activeGameSession != nil {
                Button {
                    showEndGameConfirm = true
                } label: {
                    Image(systemName: "stop.fill")
                        .font(.system(size: 14, weight: .black))
                }
                .buttonStyle(.roundIcon(EC.red, diameter: 40))
                .accessibilityLabel(L.t("End Game", hostLanguage))
            } else {
                Button {
                    Haptics.tap()
                    showGamePicker = true
                } label: {
                    PackIcon("ui-game", size: 26)
                }
                .buttonStyle(.roundIcon(EC.pinkSoft, diameter: 40))
                .accessibilityLabel(L.t("Games", hostLanguage))
            }

            // Drawing button
            Button {
                showDrawingComposer = true
                viewModel.setTypingAction("drawing")
            } label: {
                PackIcon("g-pencil", size: 24)
            }
            .buttonStyle(.roundIcon(EC.yellowSoft, diameter: 40))
            .accessibilityLabel(L.t("Draw", hostLanguage))

            // Plus menu (camera + photo library)
            Menu {
                Button {
                    showCamera = true
                } label: {
                    Label(L.t("Camera", hostLanguage), systemImage: "camera")
                }
                Button {
                    showPhotoLibrary = true
                } label: {
                    Label(L.t("Photo", hostLanguage), systemImage: "photo")
                }
            } label: {
                PackIcon("ui-camera", size: 24)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(EC.blueSoft))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
                    .background(Circle().fill(EC.ink).offset(y: 4))
                    .padding(.bottom, 4)
            }
            .accessibilityLabel(L.t("Photo", hostLanguage))
        }
    }

    private var trailingInputButton: some View {
        Group {
            if speechRecognizer.isRecording {
                SendButton(
                    hasText: sendingVoice || speechRecognizer.audioOnly
                        || !messageText.trimmingCharacters(in: .whitespaces).isEmpty,
                    action: sendingVoice ? sendVoiceMessage : sendCurrentMessage,
                    pulsate: false
                )
                .accessibilityLabel(sendingVoice ? L.t("Send voice message", hostLanguage) : "Send")
                .transition(.scale.combined(with: .opacity))
            } else if !messageText.trimmingCharacters(in: .whitespaces).isEmpty {
                SendButton(
                    hasText: true,
                    action: sendCurrentMessage
                )
                .transition(.scale.combined(with: .opacity))
            } else {
                voiceMicButton
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: !messageText.trimmingCharacters(in: .whitespaces).isEmpty)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: speechRecognizer.isRecording)
    }

    /// Tap dictates in the remembered mode; long-press goes straight to a voice message
    private var voiceMicButton: some View {
        Button {
            // The long-press already started; this is its finger-up
            if micLongPressed {
                micLongPressed = false
                return
            }
            beginVoice(voiceMode)
        } label: {
            Image(systemName: "mic.fill")
        }
        .buttonStyle(.roundIcon(diameter: 44))
        .simultaneousGesture(
            LongPressGesture(minimumDuration: 0.45).onEnded { _ in
                micLongPressed = true
                beginVoice("voice")
            }
        )
        .accessibilityLabel(L.t("Voice", hostLanguage))
        .accessibilityAction(named: L.t("Voice message", hostLanguage)) { beginVoice("voice") }
    }

    /// Send goes out as audio: recording is running and the switch is on Voice
    private var sendingVoice: Bool {
        speechRecognizer.isRecording && speechRecognizer.clipActive && voiceMode == "voice"
    }

    private func beginVoice(_ mode: String) {
        guard !speechRecognizer.isRecording else { return }
        voiceMode = mode
        let haptic = UIImpactFeedbackGenerator(style: .medium)
        haptic.prepare()
        haptic.impactOccurred()
        AudioServicesPlaySystemSound(1113)
        isTextEditorFocused = false
        preVoiceText = messageText
        viewModel.setTypingAction("voicing")
        speechRecognizer.updateLocale(hostLanguage)
        speechRecognizer.captureClip = true
        // Delay recording start so haptic/audio play before audio session is claimed
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            self.speechRecognizer.startRecording()
        }
    }

    private var voiceModeSwitch: some View {
        HStack(spacing: 2) {
            voiceModeButton("text", icon: "text.alignleft", label: "Text")
            voiceModeButton("voice", icon: "waveform", label: "Voice message")
        }
        .padding(2)
        .background(Capsule().fill(.white))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .scaleEffect(modeNudge ? 1.14 : 1)
        .rotationEffect(.degrees(modeNudge ? -5 : 0))
        .animation(
            modeNudge ? .easeInOut(duration: 0.16).repeatCount(5, autoreverses: true) : .easeOut(duration: 0.15),
            value: modeNudge
        )
        .accessibilityElement(children: .contain)
        .accessibilityLabel(L.t("Send as", hostLanguage))
        .transition(.scale(scale: 0.6).combined(with: .opacity))
    }

    private func voiceModeButton(_ mode: String, icon: String, label: String) -> some View {
        let on = voiceMode == mode
        return Button {
            guard !on else { return }
            Haptics.tap()
            withAnimation(.easeOut(duration: 0.15)) { voiceMode = mode }
        } label: {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(on ? .white : EC.inkSoft)
                .frame(width: 30, height: 22)
                .background(Capsule().fill(on ? (mode == "voice" ? EC.blue : EC.pink) : .clear))
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(L.t(label, hostLanguage))
        .accessibilityAddTraits(on ? .isSelected : [])
    }

    /// First recording ever: wiggle the switch once so people notice it
    private func nudgeModeSwitchIfNew(_ active: Bool) {
        guard active, !voiceModeHinted else { return }
        voiceModeHinted = true
        modeNudge = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { modeNudge = false }
    }

    /// Stops dictation and sends the recording (transcript attached); field goes back to what was typed before
    private func sendVoiceMessage() {
        speechRecognizer.stopRecording()
        // stopRecording publishes the final, punctuated transcript synchronously
        let transcript = speechRecognizer.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        speechRecognizer.transcript = ""
        messageText = preVoiceText
        viewModel.setTypingAction(messageText.isEmpty ? nil : "typing")
        let clip = speechRecognizer.takeClip()
        let reply = replyToId
        replyToId = nil
        Task {
            if let clip, clip.durationMs >= 600 {
                await viewModel.sendVoice(clip, text: transcript, replyToId: reply)
            } else {
                if let clip { try? FileManager.default.removeItem(at: clip.url) }
                if !transcript.isEmpty { viewModel.sendMessage(transcript, replyToId: reply) }
            }
        }
    }

    /// Replaces the field while dictating: cancel, live waveform, stop (send sits outside like the mic did)
    private var voicePill: some View {
        HStack(spacing: 6) {
            Button(action: cancelVoice) {
                Image(systemName: "xmark")
                    .font(.system(size: 13, weight: .black))
                    .foregroundStyle(EC.ink)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(.white))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
            }
            .buttonStyle(.pressable)
            .accessibilityLabel(L.t("Cancel", hostLanguage))

            VoiceWaveform(recognizer: speechRecognizer, tint: sendingVoice ? EC.blue : EC.ink)
                .frame(height: 28)

            if sendingVoice {
                ClipTimer(recognizer: speechRecognizer, lang: hostLanguage)
                    .transition(.opacity)
            } else {
                Button(action: stopVoice) {
                    RoundedRectangle(cornerRadius: 2.5)
                        .fill(EC.ink)
                        .frame(width: 11, height: 11)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(.white))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
                }
                .buttonStyle(.pressable)
                .accessibilityLabel(L.t("Stop", hostLanguage))
                .transition(.opacity)
            }
        }
        .padding(.horizontal, 5)
        .frame(height: 46)
        .background(RoundedRectangle(cornerRadius: 23, style: .continuous).fill(EC.paper))
        .overlay(
            RoundedRectangle(cornerRadius: 23, style: .continuous)
                .strokeBorder(sendingVoice ? EC.blue : EC.pink, lineWidth: 3)
        )
        .animation(.easeOut(duration: 0.18), value: sendingVoice)
        // Length cap: send what's there in voice mode, otherwise just stop recording audio
        .task(id: speechRecognizer.clipActive) {
            guard speechRecognizer.clipActive else { return }
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 500_000_000)
                guard speechRecognizer.clipActive,
                      speechRecognizer.clipDuration >= SpeechRecognizer.maxClipSeconds - 0.5 else { continue }
                if sendingVoice {
                    sendVoiceMessage()
                } else if speechRecognizer.audioOnly {
                    stopVoice()
                } else {
                    speechRecognizer.discardClip()
                }
                return
            }
        }
    }

    /// Keeps the dictated text in the field for editing
    private func stopVoice() {
        AudioServicesPlaySystemSound(1114)
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        viewModel.setTypingAction(nil)
        speechRecognizer.stopRecording()
        if let clip = audioOnlyDictation() {
            transcribingDictation = true
            Task {
                if let text = await viewModel.transcribeDictation(clip), !text.isEmpty { messageText = text }
                transcribingDictation = false
            }
            return
        }
        speechRecognizer.discardClip()
    }

    /// The recording of a dictation the recognizer couldn't transcribe (call after stopRecording)
    private func audioOnlyDictation() -> VoiceClipFile? {
        guard speechRecognizer.audioOnly else { return nil }
        return speechRecognizer.takeClip()
    }

    /// Throws the dictation away and restores whatever was typed before
    private func cancelVoice() {
        AudioServicesPlaySystemSound(1114)
        Haptics.tap()
        speechRecognizer.stopRecording()
        speechRecognizer.discardClip()
        // stopRecording publishes the final transcript; clear it so the isRecording handler doesn't apply it
        speechRecognizer.transcript = ""
        messageText = preVoiceText
        viewModel.setTypingAction(messageText.isEmpty ? nil : "typing")
    }

    @ViewBuilder
    private var clearTextButton: some View {
        if !messageText.isEmpty {
            Button {
                Haptics.tap()
                speechRecognizer.transcript = ""
                if speechRecognizer.isRecording { speechRecognizer.stopRecording() }
                speechRecognizer.discardClip()
                messageText = ""
            } label: {
                // Same glyph as web .ec-clear-text: 12pt box, arms inset 1.2
                Path { p in
                    p.move(to: CGPoint(x: 1.2, y: 1.2))
                    p.addLine(to: CGPoint(x: 10.8, y: 10.8))
                    p.move(to: CGPoint(x: 10.8, y: 1.2))
                    p.addLine(to: CGPoint(x: 1.2, y: 10.8))
                }
                .stroke(EC.inkSoft, style: StrokeStyle(lineWidth: 1.7, lineCap: .round))
                .frame(width: 12, height: 12)
                .padding(10)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .padding(.top, 7)
            .padding(.trailing, 4)
            .accessibilityLabel(L.t("Clear", hostLanguage))
            .transition(.opacity)
        }
    }

    private var voiceLiveLine: some View {
        let live = speechRecognizer.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        return HStack(spacing: 10) {
            Text(live.isEmpty ? L.t("Listening...", hostLanguage) : live)
                .font(.round(15, .bold))
                .foregroundStyle(live.isEmpty ? EC.inkSoft.opacity(0.7) : EC.ink)
                .lineLimit(2)
                .truncationMode(.head)
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityAddTraits(.updatesFrequently)
            if speechRecognizer.clipActive {
                voiceModeSwitch
            }
        }
        .padding(.leading, 20)
        .padding(.trailing, speechRecognizer.clipActive ? 12 : 68)
        .padding(.top, 10)
        .animation(.easeOut(duration: 0.18), value: speechRecognizer.clipActive)
        .transition(.opacity)
        .onChange(of: speechRecognizer.clipActive) { nudgeModeSwitchIfNew($0) }
    }

    var inputBar: some View {
        VStack(spacing: 0) {
            if speechRecognizer.isRecording {
                voiceLiveLine
            }
            HStack(alignment: .bottom, spacing: 8) {
                if speechRecognizer.isRecording {
                    voicePill
                        .transition(.opacity)
                } else {
                    if toolsCollapsed {
                        toolsToggle
                            .transition(.scale(scale: 0.4).combined(with: .opacity))
                    } else {
                        toolButtons
                            .transition(.move(edge: .leading).combined(with: .opacity))
                    }
                    messageField
                }
                trailingInputButton
            }
            .animation(.spring(response: 0.34, dampingFraction: 0.86), value: toolsCollapsed)
            .animation(.spring(response: 0.34, dampingFraction: 0.86), value: speechRecognizer.isRecording)
            .padding(.horizontal, 12)
            .padding(.top, 10)
            .padding(.bottom, 6)
        }
        .animation(.spring(response: 0.34, dampingFraction: 0.86), value: speechRecognizer.isRecording)
        .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    /// While the host dictates, the transcript is the message text; when dictation stops, the last transcript stays
    func dictationHandlers(_ content: some View) -> some View {
        content
            .onChange(of: speechRecognizer.transcript, perform: { newTranscript in
                if speechRecognizer.isRecording && !newTranscript.isEmpty {
                    messageText = newTranscript
                }
            })
            .onChange(of: speechRecognizer.isRecording, perform: { recording in
                if !recording {
                    micLongPressed = false
                    // Ended without a send (interruption, recognizer gave up): nothing will claim the recording
                    speechRecognizer.discardClip()
                    // Apply final transcript then clear so it doesn't interfere with keyboard
                    if !speechRecognizer.transcript.isEmpty {
                        messageText = speechRecognizer.transcript
                        speechRecognizer.transcript = ""
                    }
                }
            })
    }

    private var messageField: some View {
        TextEditor(text: $messageText)
            .focused($isTextEditorFocused)
            .font(.round(16, .bold))
            .foregroundStyle(EC.ink)
            .tint(EC.pink)
            .frame(minHeight: 40, maxHeight: 120)
            .fixedSize(horizontal: false, vertical: true)
            .scrollContentBackground(.hidden)
            .onChange(of: messageText) { text in
                toolsOpen = false
                if !speechRecognizer.isRecording {
                    viewModel.setTypingAction(text.isEmpty ? nil : "typing")
                }
            }
            .onChange(of: isTextEditorFocused) { focused in
                if focused { toolsOpen = false }
                if focused && speechRecognizer.isRecording {
                    speechRecognizer.stopRecording()
                    speechRecognizer.discardClip()
                    viewModel.setTypingAction(messageText.isEmpty ? nil : "typing")
                }
            }
            .padding(.leading, 10)
            .padding(.trailing, messageText.isEmpty ? 10 : 30)
            .padding(.vertical, 3)
            .overlay(alignment: .topLeading) {
                if messageText.isEmpty {
                    Text(L.t(transcribingDictation ? "Transcribing..." : "Type a message...", hostLanguage))
                        .font(.round(16, .bold))
                        .foregroundStyle(EC.inkSoft)
                        .padding(.leading, 15)
                        .padding(.top, 11)
                        .allowsHitTesting(false)
                }
            }
            .overlay(alignment: .topTrailing) { clearTextButton }
            .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(EC.paper))
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .strokeBorder(isTextEditorFocused ? EC.blue : EC.ink, lineWidth: 3)
            )
            .animation(.easeOut(duration: 0.15), value: isTextEditorFocused)
    }

    // MARK: - Helpers

    private func sendCurrentMessage() {
        isTextEditorFocused = false
        let wasRecording = speechRecognizer.isRecording
        if wasRecording {
            speechRecognizer.stopRecording()
        }
        if wasRecording, let clip = audioOnlyDictation() {
            viewModel.setTypingAction(nil)
            let reply = replyToId
            let typed = messageText
            // Cleared now, not after the awaits: text typed while the clip is transcribed must survive
            replyToId = nil
            speechRecognizer.transcript = ""
            messageText = ""
            transcribingDictation = true
            Task {
                let text = await viewModel.transcribeDictation(clip)
                transcribingDictation = false
                guard let text, !text.isEmpty else {
                    // Nothing was sent: give back what was in the field unless something new was typed
                    if messageText.isEmpty { messageText = typed }
                    return
                }
                viewModel.sendMessage(text, replyToId: reply)
            }
            return
        }
        speechRecognizer.discardClip()
        var text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        // Ensure punctuation for voice input (SwiftUI onChange may not have fired yet)
        if wasRecording {
            text = SpeechRecognizer.ensurePunctuation(text)
        }
        let reply = replyToId
        // One synchronous step: a second tap finds an empty field, and the isRecording handler finds no transcript to copy back
        speechRecognizer.transcript = ""
        messageText = ""
        replyToId = nil
        viewModel.setTypingAction(nil)
        viewModel.sendMessage(text, replyToId: reply)
    }
}
