import SwiftUI

extension HostConversationView {
    @ViewBuilder
    var hostSettingsOverlay: some View {
        if showHostSettings {
            // Tap-outside dismiss layer
            Color.black.opacity(0.01)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation(.easeOut(duration: 0.2)) {
                        showHostSettings = false
                    }
                }

            GeometryReader { _ in
                VStack(alignment: .leading, spacing: 2) {
                    settingsToggle(L.t("English", hostLanguage), isOn: $showEnglish) {
                        LangBadge(lang: "en", size: 22)
                    }
                    settingsToggle(L.t("Japanese", hostLanguage), isOn: $showJapanese) {
                        LangBadge(lang: "ja", size: 22)
                    }
                    settingsToggle(L.t("Romaji", hostLanguage), isOn: $showRomaji) {
                        Text("Ro")
                            .font(.round(11, .black))
                            .foregroundStyle(.white)
                            .frame(width: 22, height: 22)
                            .background(Circle().fill(EC.violet))
                            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    }

                    chatTextSizePicker

                    DashedRule()
                        .padding(.vertical, 6)
                        .padding(.horizontal, 12)

                    Button {
                        showHostSettings = false
                        viewModel.showParticipantSheet = true
                    } label: {
                        Label(L.t("Settings", hostLanguage), systemImage: "gearshape.fill")
                            .font(.round(15, .black))
                            .foregroundStyle(EC.ink)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                    }
                    .buttonStyle(.pressable)
                }
                .padding(.vertical, 10)
                .frame(width: 230)
                .ecCard(radius: 20, border: 3, shadow: 6)
                .offset(x: 12, y: 62)
                .onChange(of: showEnglish) { on in
                    if !on && !showJapanese { showJapanese = true }
                }
                .onChange(of: showJapanese) { on in
                    if !on && !showEnglish { showEnglish = true }
                }
            }
            .transition(.scale(scale: 0.7, anchor: .topLeading).combined(with: .opacity))
        }
    }

    private var chatTextSizePicker: some View {
        HStack(spacing: 10) {
            Text(L.t("Chat text size", hostLanguage))
                .font(.round(15, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 4)
            HStack(spacing: 0) {
                ForEach(Array(ChatTextSize.allCases.enumerated()), id: \.element) { index, size in
                    Button {
                        Haptics.tap()
                        withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) { chatTextSize = size }
                    } label: {
                        Text("A")
                            .font(.chunky(11 + CGFloat(index) * 3))
                            .foregroundStyle(EC.ink)
                            .frame(width: 30, height: 28)
                            .background(chatTextSize == size ? EC.yellow : .white)
                            .overlay(alignment: .leading) {
                                if index > 0 {
                                    Rectangle().fill(EC.ink).frame(width: 2)
                                }
                            }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(L.t(size.label, hostLanguage))
                    .accessibilityAddTraits(chatTextSize == size ? .isSelected : [])
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 9, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 7)
    }

    private func settingsToggle<Badge: View>(_ title: String, isOn: Binding<Bool>, @ViewBuilder badge: () -> Badge) -> some View {
        Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.25, dampingFraction: 0.6)) { isOn.wrappedValue.toggle() }
        } label: {
            HStack(spacing: 10) {
                badge()
                Text(title)
                    .font(.round(15, .black))
                    .foregroundStyle(isOn.wrappedValue ? EC.ink : EC.inkSoft)
                Spacer(minLength: 8)
                Image(systemName: "checkmark")
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(isOn.wrappedValue ? EC.ink : .clear)
                    .frame(width: 24, height: 24)
                    .background(RoundedRectangle(cornerRadius: 7).fill(isOn.wrappedValue ? EC.mint : .white))
                    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(EC.ink, lineWidth: 2.5))
                    .scaleEffect(isOn.wrappedValue ? 1 : 0.9)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .contentShape(Rectangle())
        }
        .buttonStyle(.pressable)
        .accessibilityAddTraits(isOn.wrappedValue ? .isSelected : [])
    }

    // MARK: - Closed banner

    var closedBanner: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 14, weight: .black))
                Text(L.t("This room has been closed", hostLanguage))
                    .font(.round(15, .black))
            }
            .foregroundStyle(EC.ink)
            Button(L.t("Back to Home", hostLanguage)) {
                dismiss()
            }
            .buttonStyle(.chunky(EC.pink, size: .small))
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    // MARK: - In this room / Settings sheets

    /// One member as a chunky card (matches web "In this room"); guests carry their avatar tint
    private func personCard(_ participant: Participant, onRemove: (() -> Void)? = nil) -> some View {
        let away = participant.online && participant.isAway
        let status = participant.online ? (away ? "Away" : "Online") : "Offline"
        let dot = participant.online ? (away ? EC.yellow : EC.mint) : EC.inkSoft
        return HStack(spacing: 12) {
            ParticipantAvatarView(participant: participant, size: 44)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(participant.nickname)
                        .font(.round(16, .black))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)
                    LangBadge(lang: participant.preferredLanguage, size: 18)
                }
                HStack(spacing: 5) {
                    Circle()
                        .fill(dot)
                        .frame(width: 9, height: 9)
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
                    Text(L.t(status, hostLanguage))
                        .font(.round(12, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
            }

            Spacer(minLength: 6)

            if participant.id == hostId {
                ECChip(text: L.t("me", hostLanguage).uppercased(), fill: EC.pink)
            }
            if participant.role == .host {
                ECChip(text: L.t("host", hostLanguage).uppercased(), fill: EC.violet)
            }
            if let onRemove {
                Button(role: .destructive, action: onRemove) {
                    Text(L.t("Remove", hostLanguage))
                }
                .buttonStyle(.chunky(EC.red, size: .mini, fullWidth: false))
            }
        }
        .padding(.leading, 8)
        .padding(.trailing, 12)
        .padding(.vertical, 8)
        .ecCard(fill: participant.role == .host ? .white : participant.tint, radius: 18, border: 3, shadow: 4)
        .opacity(participant.online ? 1 : 0.6)
    }

    /// Host first, then online, away, offline
    private var roomMembers: [Participant] {
        func rank(_ p: Participant) -> Int {
            if p.id == hostId { return 0 }
            return p.online ? (p.isAway ? 2 : 1) : 3
        }
        return viewModel.participants.sorted { rank($0) < rank($1) }
    }

    /// Bottom sheet from the header avatars, like web's "In this room"
    var inRoomSheet: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(L.t("In this room", hostLanguage))
                        .font(.chunky(24))
                        .foregroundStyle(EC.ink)
                    if let code = viewModel.room?.joinCode {
                        HStack(spacing: 6) {
                            ECLabel(L.t("Room", hostLanguage))
                            ECChip(text: code, fill: EC.yellow)
                        }
                    }
                }
                Spacer()
                ECChip(text: "\(roomMembers.count)")
                Button {
                    Haptics.tap()
                    showInRoom = false
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .black))
                        .foregroundStyle(EC.ink)
                }
                .buttonStyle(.roundIcon(.white, diameter: 40))
                .accessibilityLabel(L.t("Close", hostLanguage))
            }

            ScrollView {
                VStack(spacing: 10) {
                    ForEach(roomMembers) { participant in
                        personCard(participant, onRemove: participant.role == .host || viewModel.isClosed ? nil : {
                            Haptics.tap()
                            Task { await viewModel.kickParticipant(participant.id) }
                        })
                    }
                }
                .padding(.horizontal, 2)
                .padding(.vertical, 4)
            }

            if !viewModel.isClosed {
                closeRoomButton
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 26)
        .padding(.bottom, 12)
        .background(EC.paper.ignoresSafeArea())
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    /// Close Room, on "In this room" and on Settings, with the dialog that asks first. The dialog is attached to the
    /// button, so it is inside whichever sheet is up: a dialog is presented from what is in front
    private var closeRoomButton: some View {
        Button {
            Haptics.tap()
            showCloseConfirmation = true
        } label: {
            Text(L.t("Close Room", hostLanguage))
        }
        .buttonStyle(.chunky(EC.red, size: .mini))
        .confirmationDialog(L.t("Close this room?", hostLanguage), isPresented: $showCloseConfirmation, titleVisibility: .visible) {
            Button(L.t("Close Room", hostLanguage), role: .destructive) {
                // The sheet the button is on goes away, and the closed banner shows
                showInRoom = false
                viewModel.showParticipantSheet = false
                Task { await viewModel.closeRoom() }
            }
        } message: {
            Text(L.t("All participants will be disconnected. This cannot be undone.", hostLanguage))
        }
    }

    var settingsSheet: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 10) {
                        Text(L.t("Language", hostLanguage))
                            .font(.round(15, .bold))
                            .foregroundStyle(EC.ink)
                        Spacer()
                        ForEach([("en", "English"), ("ja", "日本語")], id: \.0) { code, label in
                            Button {
                                Haptics.tap()
                                hostLanguage = code
                            } label: {
                                HStack(spacing: 5) {
                                    LangBadge(lang: code, size: 18)
                                    Text(label)
                                }
                            }
                            .buttonStyle(.chunky(hostLanguage == code ? EC.yellow : .white, size: .mini, fullWidth: false))
                        }
                    }
                    .listRowBackground(Color.white)
                    .onChange(of: hostLanguage) { newValue in
                        UserDefaults.standard.set(newValue, forKey: "enchatto_lastLanguage")
                        viewModel.setHostLanguage(newValue)
                    }

                    if !viewModel.isClosed {
                        HStack(spacing: 10) {
                            Text(L.t("Background", hostLanguage))
                                .font(.round(15, .bold))
                                .foregroundStyle(EC.ink)
                            Spacer()
                            // Another of the textures, for everyone in the room
                            Button {
                                Haptics.tap()
                                viewModel.randomizeBackground()
                            } label: {
                                HStack(spacing: 5) {
                                    PackIcon("g-arrows", size: 18)
                                        .accessibilityHidden(true)
                                    Text(L.t("Random", hostLanguage))
                                }
                            }
                            .buttonStyle(.chunky(.white, size: .mini, fullWidth: false))
                            // There is no background to change from until the room's state is here
                            .disabled(viewModel.room == nil)
                        }
                        .listRowBackground(Color.white)
                    }

                    if !viewModel.translationPacksInstalled {
                        Button {
                            viewModel.requestTranslationDownload = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .font(.system(size: 22))
                                    .foregroundStyle(EC.blue)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(L.t("Download Offline Translation", hostLanguage))
                                        .font(.round(15, .black))
                                        .foregroundStyle(EC.ink)
                                    Text(L.t("Enables translation without internet", hostLanguage))
                                        .font(.round(12, .medium))
                                        .foregroundStyle(EC.inkSoft)
                                }
                            }
                        }
                        .listRowBackground(Color.white)
                    } else {
                        HStack(spacing: 8) {
                            PackIcon("g-ok", size: 22)
                            Text(L.t("Offline translation ready", hostLanguage))
                                .font(.round(15, .bold))
                                .foregroundStyle(EC.inkSoft)
                        }
                        .listRowBackground(Color.white)
                    }
                } footer: {
                    let deployment = AppConfig.convexDeploymentURL
                        .replacingOccurrences(of: "https://", with: "")
                        .replacingOccurrences(of: ".convex.site", with: "")
                    let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
                    VStack(spacing: 2) {
                        Text("\(deployment) · iOS v\(version)")
                        Text("github: \(GitInfo.commitSHA)")
                    }
                    .font(.round(10, .medium))
                    .foregroundStyle(EC.inkSoft)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                    .padding(.top, 8)
                }
            }
            .scrollContentBackground(.hidden)
            .safeAreaInset(edge: .bottom) {
                if !viewModel.isClosed {
                    closeRoomButton
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                        .padding(.bottom, 12)
                }
            }
            .background(FadingRoomBackground(index: shownTextureIndex).ignoresSafeArea())
            .tint(EC.blue)
            .navigationTitle(L.t("Settings", hostLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(L.t("Done", hostLanguage)) {
                        viewModel.showParticipantSheet = false
                    }
                    .buttonStyle(.chunky(EC.blue, size: .mini, fullWidth: false))
                }
            }
        }
        // An open room has the background row and Close Room besides
        .presentationDetents([.height(viewModel.isClosed ? 320 : 440)])
        .presentationDragIndicator(.visible)
        // The room screen's alert again, inside the sheet: an alert is presented from what is in front, and a
        // background the server refused comes back while this sheet is up
        .alert("Error", isPresented: .init(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
}
