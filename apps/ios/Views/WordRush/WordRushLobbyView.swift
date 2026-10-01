import SwiftUI

struct WordRushLobbyView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    let onMinimize: () -> Void
    let onCancel: () -> Void

    @State private var busy = false

    private var me: String { viewModel.hostId }
    private var isHost: Bool { game.hostParticipantId == me }
    private var joined: Bool { game.player(me) != nil }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button(action: onMinimize) { Image(systemName: "chevron.down") }
                    .buttonStyle(.roundIcon())
                    .accessibilityLabel(L.t("Minimize", lang))
                Spacer()
                cardsChip
            }
            .padding(.horizontal, 16)
            .padding(.top, 6)

            ScrollView {
                VStack(spacing: 18) {
                    hero
                    settingsCard
                    playersCard
                }
                .padding(.horizontal, 18)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }

            actions
                .padding(.horizontal, 18)
                .padding(.bottom, 10)
        }
    }

    // MARK: - Hero

    private var hero: some View {
        VStack(spacing: 10) {
            ZStack {
                RaysView().frame(width: 260, height: 260)
                HStack(spacing: -10) {
                    EmojiArt(emoji: "🌸", size: 62).rotationEffect(.degrees(-12))
                    EmojiArt(emoji: "⚡", size: 74).offset(y: -12)
                    EmojiArt(emoji: "💬", size: 62).rotationEffect(.degrees(12))
                }
                .popIn()
            }
            .frame(height: 120)

            OutlinedText(L.t("Word Rush", lang), size: 40, fill: EC.yellow)
                .stampIn(delay: 0.1)
            Text(L.t("Guess the word from 3 emoji. Learn it. Say it!", lang))
                .font(.round(15, .bold))
                .foregroundStyle(EC.ink)
                .multilineTextAlignment(.center)
            HStack(spacing: 8) {
                ECChip(text: "日本語の人 → English", fill: EC.blueSoft)
                ECChip(text: "English speakers → 日本語", fill: EC.pinkSoft)
            }
        }
    }

    private var cardsChip: some View {
        HStack(spacing: 6) {
            if game.cardsReady {
                Image(systemName: "sparkles").font(.system(size: 13, weight: .black))
            } else {
                ProgressView().scaleEffect(0.7).tint(EC.ink)
            }
            Text(game.cardsReady ? L.t("Fresh AI cards ready!", lang) : L.t("AI cards cooking…", lang))
                .font(.round(12, .black))
        }
        .foregroundStyle(EC.ink)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(Capsule().fill(game.cardsReady ? EC.mintSoft : EC.yellowSoft))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
        .animation(.spring(response: 0.4, dampingFraction: 0.6), value: game.cardsReady)
    }

    // MARK: - Settings

    private var settingsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            ECLabel(L.t("Word pack", lang))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], spacing: 8) {
                ForEach(WordRushPacks.all, id: \.self) { pack in
                    let selected = game.pack == pack
                    Button {
                        guard isHost, !selected else { return }
                        Haptics.tap()
                        Task { await viewModel.updateWordRushSettings(pack: pack) }
                    } label: {
                        HStack(spacing: 5) {
                            EmojiArt(emoji: wrPackEmoji(pack), size: 20)
                            Text(wrPackName(pack, lang))
                                .font(.round(13, .black))
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                        }
                        .foregroundStyle(selected ? .white : EC.ink)
                        .frame(maxWidth: .infinity, minHeight: 38)
                        .padding(.horizontal, 6)
                        .ecOutline(fill: selected ? EC.blue : .white, radius: 14, border: 2.5)
                    }
                    .buttonStyle(.pressable)
                    .disabled(!isHost && !selected)
                    .opacity(!isHost && !selected ? 0.55 : 1)
                }
            }

            Divider().overlay(EC.lineSoft)

            HStack(spacing: 12) {
                PackIcon("g-music", size: 34)
                VStack(alignment: .leading, spacing: 2) {
                    Text(L.t("Say it!", lang)).font(.chunky(17)).foregroundStyle(EC.ink)
                    Text(L.t("Every 2nd word, someone takes the mic", lang))
                        .font(.round(12, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
                Spacer()
                Toggle("", isOn: Binding(
                    get: { game.sayIt },
                    set: { value in
                        Haptics.tap()
                        Task { await viewModel.updateWordRushSettings(sayIt: value) }
                    }
                ))
                .labelsHidden()
                .tint(EC.pink)
                .disabled(!isHost)
            }
            if game.sayIt && game.players.count < 2 {
                Text(L.t("Say it! needs 2+ players", lang))
                    .font(.round(12, .black))
                    .foregroundStyle(EC.red)
            }
        }
        .padding(16)
        .ecCard(radius: 24, shadow: 6)
    }

    // MARK: - Players

    private var playersCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                ECLabel(L.t("Players", lang))
                Spacer()
                Text("\(game.players.count)")
                    .font(.chunky(15))
                    .foregroundStyle(EC.ink)
            }
            ForEach(game.players) { player in
                HStack(spacing: 10) {
                    AvatarDisc(avatarId: player.avatarValue, size: 40)
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(player.nickname).font(.round(15, .black)).foregroundStyle(EC.ink).lineLimit(1)
                            if player.participantId == game.hostParticipantId {
                                ECChip(text: L.t("host", lang), fill: EC.yellow, icon: "g-crown")
                            }
                            if player.participantId == me {
                                ECChip(text: L.t("you", lang), fill: EC.blueSoft)
                            }
                        }
                        HStack(spacing: 4) {
                            Text(L.t("learning", lang)).font(.round(11, .bold)).foregroundStyle(EC.inkSoft)
                            LangBadge(lang: player.learning, size: 18)
                            Text(player.learning == "ja" ? "日本語" : "English")
                                .font(.round(11, .black))
                                .foregroundStyle(EC.ink)
                        }
                    }
                    Spacer()
                }
                .popIn()
            }
        }
        .padding(16)
        .ecCard(radius: 24, shadow: 6)
        .animation(.spring(response: 0.35, dampingFraction: 0.7), value: game.players.count)
    }

    // MARK: - Actions

    @ViewBuilder
    private var actions: some View {
        if isHost {
            VStack(spacing: 6) {
                Button(L.t("START WORD RUSH!", lang)) { run { await viewModel.startWordRush() } }
                    .buttonStyle(.chunky(EC.pink))
                Button(L.t("Cancel", lang), action: onCancel)
                    .font(.round(14, .black))
                    .foregroundStyle(EC.inkSoft)
            }
        } else if !joined {
            HStack(spacing: 10) {
                Button(L.t("Not now", lang), action: onMinimize)
                    .buttonStyle(.chunky(.white, fullWidth: true))
                Button(L.t("JOIN!", lang)) { run { await viewModel.joinWordRush() } }
                    .buttonStyle(.chunky(EC.pink))
            }
        } else {
            VStack(spacing: 6) {
                HStack(spacing: 8) {
                    ProgressView().tint(EC.ink)
                    Text(L.t("Waiting for the host to start…", lang))
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink)
                }
                .padding(.vertical, 10)
                Button(L.t("Leave", lang)) { run { await viewModel.leaveWordRush() } }
                    .buttonStyle(.chunky(.white, size: .small))
            }
        }
    }

    private func run(_ action: @escaping () async -> Void) {
        guard !busy else { return }
        busy = true
        Task {
            await action()
            busy = false
        }
    }
}
