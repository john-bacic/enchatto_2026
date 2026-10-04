import SwiftUI

struct GameReplayView: View {
    let replay: GameReplay
    let lang: String
    let onDismiss: () -> Void
    var onNextLevel: ((Int) -> Void)?
    /// How many players are here for the next level, as the host's screen counts them. A caller that does not
    /// count the room leaves it out, and this game's own players are taken to be here still
    var playersHere: Int
    @State private var timerSeconds: Int = 20

    init(replay: GameReplay, lang: String, onDismiss: @escaping () -> Void, onNextLevel: ((Int) -> Void)? = nil, playersHere: Int? = nil) {
        self.replay = replay
        self.lang = lang
        self.onDismiss = onDismiss
        self.onNextLevel = onNextLevel
        self.playersHere = playersHere ?? replay.session.playerIds.count
        self._timerSeconds = State(initialValue: replay.session.timerEnabled ?? 20)
    }

    /// Translate a game prompt to the viewer's preferred language
    private func translatePrompt(_ text: String) -> String {
        guard let translations = replay.promptTranslations else { return text }
        if lang == "ja" {
            // English → Japanese
            return translations[text] ?? text
        }
        // Japanese → English (reverse lookup)
        if let entry = translations.first(where: { $0.value == text }) {
            return entry.key
        }
        return text
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Score summary: by team in a team game
                    if let teams = replay.teamScores {
                        teamSummary(teams, replay.scores ?? [:])
                    } else if let scores = replay.scores, !scores.isEmpty {
                        scoreSummary(scores)
                    }

                    // Round-by-round breakdown
                    ForEach(replay.chains) { chain in
                        roundView(chain)
                    }
                }
                .padding(16)
            }

            if let onNextLevel {
                VStack(spacing: 10) {
                    // Timer picker (host only, when next level available)
                    HStack(spacing: 8) {
                        PackIcon("g-bolt", size: 20)
                        ForEach([10, 20, 30, 0], id: \.self) { secs in
                            Button {
                                Haptics.tap()
                                timerSeconds = secs
                            } label: {
                                Text(secs == 0 ? L.t("Off", lang) : "\(secs)s")
                            }
                            .buttonStyle(.chunky(timerSeconds == secs ? EC.yellow : .white, size: .mini))
                        }
                    }

                    Button {
                        onNextLevel(timerSeconds)
                    } label: {
                        Text("\(L.t("Next Level", lang)) →")
                    }
                    .buttonStyle(.chunky(EC.pink))

                    // The next level keeps this game's teams while enough players are here for teams; the game
                    // picker is where they are reshuffled
                    if LITTeams.keptForNextLevel(replay.session.teams, playersHere: playersHere) {
                        Text(L.t("Same teams", lang))
                            .font(.round(11.5, .bold))
                            .foregroundStyle(EC.inkSoft)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                .padding(.bottom, 8)
                .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
                .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
            }
        }
        .ecPaperBackground()
    }

    private var header: some View {
        ZStack {
            VStack(spacing: 2) {
                OutlinedText(L.t("Game Results", lang), size: 22, fill: EC.yellow, outline: 3)
                Text("\(L.t("Level", lang)) \(replay.session.level ?? 1)")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.inkSoft)
            }
            HStack {
                Spacer()
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark")
                }
                .buttonStyle(.roundIcon(diameter: 34))
                .accessibilityLabel(L.t("Close", lang))
            }
            .padding(.trailing, 14)
        }
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(Color.white.opacity(0.92).ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    // MARK: - Score Summary

    @ViewBuilder
    private func scoreSummary(_ scores: [String: ScoreInfo]) -> some View {
        let sorted = scores.sorted { $0.value.correct > $1.value.correct }

        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                PackIcon("g-crown", size: 22)
                Text(L.t("Scores", lang))
                    .font(.round(16, .black))
                    .foregroundStyle(EC.ink)
            }

            ForEach(Array(sorted.enumerated()), id: \.element.key) { index, entry in
                let participant = replay.participants[entry.key]

                HStack(spacing: 10) {
                    Text("\(index + 1)")
                        .font(.chunky(13))
                        .foregroundStyle(EC.ink)
                        .frame(width: 24, height: 24)
                        .background(Circle().fill(index == 0 ? EC.yellow : .white))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))

                    AvatarDisc(avatarId: participant?.avatar.value ?? "", size: 32)

                    Text(participant?.nickname ?? "?")
                        .font(.round(15, .black))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)

                    Spacer()

                    Text("\(entry.value.correct)/\(entry.value.total)")
                        .font(.chunky(16))
                        .foregroundStyle(EC.ink)
                    Text(L.t("correct", lang))
                        .font(.round(11, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .ecCard(fill: index == 0 ? EC.yellowSoft : .white, radius: 16, border: 2.5, shadow: index == 0 ? 5 : 3)
                .rotationEffect(.degrees(index == 0 ? -1 : 0))
            }
        }
    }

    // MARK: - Team Summary

    /// The team a player was on, in a team game
    private func team(of participantId: String?) -> LITTeam? {
        guard let participantId else { return nil }
        return LITTeam(index: replay.teamScores?.firstIndex { $0.memberIds.contains(participantId) })
    }

    /// The team of a round's drawer or guesser, in front of them
    @ViewBuilder
    private func teamStripe(_ participantId: String?) -> some View {
        if let team = team(of: participantId) {
            LITTeamStripe(team: team, lang: lang)
        }
    }

    /// The result by team: who won or that it is a draw, then each team's points, as the server sends them,
    /// over its players' own scores
    @ViewBuilder
    private func teamSummary(_ teams: [GameTeamScore], _ scores: [String: ScoreInfo]) -> some View {
        // A game ended early has points and names no winner. Equal points are a draw
        let finished = replay.session.cancelled != true
        let winner: LITTeam? = !finished || teams[0].points == teams[1].points ? nil : (teams[0].points > teams[1].points ? .mint : .grape)
        let onTeams = Set(teams.flatMap(\.memberIds))
        let others = scores.filter { !onTeams.contains($0.key) }

        VStack(alignment: .leading, spacing: 12) {
            if finished {
                HStack(spacing: 8) {
                    if winner != nil {
                        PackIcon("g-crown", size: 26)
                            .accessibilityHidden(true)
                    }
                    OutlinedText(
                        winner?.winsLine(lang) ?? L.t("It's a draw!", lang),
                        size: 20, fill: winner?.color ?? EC.yellow, outline: 2.5
                    )
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                }
                .frame(maxWidth: .infinity)
                .accessibilityElement(children: .combine)
            }

            ForEach(winner == .grape ? [LITTeam.grape, .mint] : [LITTeam.mint, .grape]) { team in
                teamCard(team, teams[team.rawValue], scores, won: winner == team)
            }

            // Nobody is expected here: a player the server scored and put on neither team is still shown
            if !others.isEmpty {
                scoreSummary(others)
            }
        }
    }

    private func teamCard(_ team: LITTeam, _ score: GameTeamScore, _ scores: [String: ScoreInfo], won: Bool) -> some View {
        let members = score.memberIds.enumerated().sorted {
            let (a, b) = (scores[$0.element]?.correct ?? 0, scores[$1.element]?.correct ?? 0)
            return a != b ? a > b : $0.offset < $1.offset
        }.map(\.element)

        return VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                if won { PackIcon("g-crown", size: 22).accessibilityHidden(true) }
                LITTeamChip(team: team, lang: lang, size: 14)
                Spacer()
                Text("\(score.points)")
                    .font(.chunky(22))
                    .foregroundStyle(EC.ink)
                Text(L.t("pts", lang))
                    .font(.round(11, .bold))
                    .foregroundStyle(EC.inkSoft)
            }

            ForEach(members, id: \.self) { pid in
                let participant = replay.participants[pid]
                HStack(spacing: 10) {
                    AvatarDisc(avatarId: participant?.avatar.value ?? "", size: 28)
                    Text(participant?.nickname ?? "?")
                        .font(.round(14, .black))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)
                    Spacer()
                    Text("\(scores[pid]?.correct ?? 0)/\(scores[pid]?.total ?? 0)")
                        .font(.chunky(14))
                        .foregroundStyle(EC.ink)
                    Text(L.t("correct", lang))
                        .font(.round(11, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .ecOutline(fill: .white, radius: 12, border: 2)
            }
        }
        .padding(12)
        .ecCard(fill: team.soft, radius: 20, border: 3, shadow: won ? 6 : 4)
        .rotationEffect(.degrees(won ? -1 : 0))
    }

    // MARK: - Round View

    @ViewBuilder
    private func roundView(_ chain: GameChainReplay) -> some View {
        let drawStep = chain.steps.first(where: { $0.stepType == .draw && $0.status == .submitted })
        let answered = chain.steps.filter { $0.stepType == .guess && $0.status == .submitted }
        // In a team game a team's guessers stand together; an individual game keeps the server's order
        let guessSteps = replay.teamScores == nil ? answered : answered.sorted {
            let (a, b) = (team(of: $0.assignedParticipantId)?.rawValue ?? 2, team(of: $1.assignedParticipantId)?.rawValue ?? 2)
            return a != b ? a < b : $0.stepIndex < $1.stepIndex
        }
        let drawerPid = chain.drawerParticipantId
        let drawer = drawerPid.flatMap { replay.participants[$0] }

        VStack(alignment: .leading, spacing: 10) {
            // Round header
            HStack(spacing: 8) {
                ECChip(text: "\(L.t("Round", lang)) \(chain.chainIndex + 1)", fill: EC.violetSoft)
                Spacer()
            }

            // What the round gave each team. A round that gave neither team points says nothing
            if let points = chain.roundPoints, replay.teamScores != nil {
                HStack(spacing: 6) {
                    ForEach(LITTeam.allCases) { team in
                        LITTeamPoints(team: team, points: points[team.rawValue], lang: lang, gained: true)
                    }
                }
            }

            // Drawer + prompt
            HStack(spacing: 8) {
                teamStripe(drawerPid)
                AvatarDisc(avatarId: drawer?.avatar.value ?? "", size: 28)
                Text("\(drawer?.nickname ?? "?") \(L.t("drew", lang)):")
                    .font(.round(12, .bold))
                    .foregroundStyle(EC.inkSoft)
                Text(translatePrompt(chain.originalPrompt))
                    .font(.round(15, .black))
                    .foregroundStyle(EC.ink)
            }

            // Drawing
            if let drawingUrl = drawStep?.outputDrawingUrl {
                Group {
                    if let uiImage = decodeBase64Image(drawingUrl) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                    } else {
                        AsyncImage(url: URL(string: drawingUrl)) { phase in
                            if let image = phase.image {
                                image
                                    .resizable()
                                    .scaledToFit()
                            } else {
                                Color.white.aspectRatio(1, contentMode: .fit)
                            }
                        }
                    }
                }
                .frame(maxWidth: 200)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
                .frame(maxWidth: .infinity)
            }

            // Guesser results
            ForEach(guessSteps) { step in
                guesserResultView(step)
            }
        }
        .padding(14)
        .ecCard(radius: 20, border: 3, shadow: 5)
    }

    @ViewBuilder
    private func guesserResultView(_ step: GameStep) -> some View {
        let participant = replay.participants[step.assignedParticipantId]
        let rawPicked = step.selectedOption ?? step.outputText ?? "?"
        let picked = translatePrompt(rawPicked)
        let correct = step.correct == true

        HStack(spacing: 8) {
            teamStripe(step.assignedParticipantId)
            AvatarDisc(avatarId: participant?.avatar.value ?? "", size: 24)

            let name = participant?.nickname ?? "?"
            let pickedText = Text(picked).font(.round(13, .black)).foregroundColor(EC.ink)
            Group {
                if lang == "ja" {
                    Text("\(name)が「") + pickedText + Text("」を選んだ")
                } else {
                    Text("\(name) \(L.t("picked", lang)) ") + pickedText
                }
            }
            .font(.round(12, .bold))
            .foregroundColor(EC.inkSoft)
            .lineLimit(2)

            Spacer(minLength: 4)

            PackIcon(correct ? "g-ok" : "g-no", size: 20)
                .accessibilityLabel(correct ? L.t("Correct!", lang) : L.t("Wrong!", lang))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(RoundedRectangle(cornerRadius: 12).fill(correct ? EC.mintSoft : EC.pinkSoft))
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
