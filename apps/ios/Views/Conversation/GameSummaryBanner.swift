import SwiftUI

// MARK: - Game Summary Banner

struct GameSummaryBanner: View {
    let text: String
    var lang: String = "en"

    private struct PlayerScore: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let score: Int
        let total: Int
        let isWinner: Bool
        /// The participant, where a summary names one: what a team's player list is matched by
        var pid: String = ""
    }

    /// One team of a Lost in Translation team game, with its players' own scores
    private struct TeamScore: Identifiable {
        let team: LITTeam
        let points: Int
        let players: [PlayerScore]
        let isWinner: Bool

        var id: Int { team.rawValue }
    }

    /// The team side of a Lost in Translation summary
    private struct TeamResult {
        let teams: [TeamScore]
        /// What each round that scored gave the two teams
        let rounds: [(round: Int, points: [Int])]
        /// A game ended early has points and names no winner
        let cancelled: Bool
    }

    private struct GameRoundData: Identifiable {
        let id = UUID()
        let players: [PlayerScore]
    }

    private struct TodPlayerRating: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let avgRating: Double?
        let turnsRated: Int
    }

    private struct BingoPlayerScore: Identifiable {
        let id = UUID()
        let name: String
        let avatar: String
        let marked: Int
        let placement: Int
    }

    private struct BingoRoundData: Identifiable {
        let id = UUID()
        let players: [BingoPlayerScore]
        let winPattern: String
    }

    private enum SummaryData {
        case emojiMatch(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore])
        case emojiBingo(title: String, subtitle: String, games: [BingoRoundData], aggregated: [BingoPlayerScore])
        /// `teams` is nil for an individual game, and for a summary from before teams
        case litGame(title: String, subtitle: String, players: [PlayerScore], teams: TeamResult?)
        case truthOrDare(title: String, subtitle: String, players: [TodPlayerRating])
    }

    private var parsed: SummaryData? {
        if text.hasPrefix("game_summary:") {
            let json = String(text.dropFirst("game_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Game"
            let level = obj["level"] as? Int
            let cancelled = obj["cancelled"] as? Bool ?? false
            let rounds = obj["rounds"] as? [[String: Any]] ?? []
            let players = obj["players"] as? [String: [String: Any]] ?? [:]
            let totals = obj["totals"] as? [String: [String: Any]] ?? [:]

            let title = level != nil ? "\(gameType) — Level \(level!)" : gameType
            let subtitle = cancelled ? L.t("Game ended early", lang) : L.t("Game Complete", lang)

            var playerScores: [PlayerScore] = []
            for (pid, info) in players {
                let pName = info["name"] as? String ?? "?"
                let avatar = info["avatar"] as? String ?? "default"
                let t = totals[pid]
                let correct = t?["correct"] as? Int ?? 0
                let total = t?["total"] as? Int ?? 0
                playerScores.append(PlayerScore(name: pName, avatar: avatar, score: correct, total: total, isWinner: false, pid: pid))
            }
            playerScores.sort { $0.score > $1.score }
            let maxScore = playerScores.first?.score ?? 0
            playerScores = playerScores.map {
                PlayerScore(name: $0.name, avatar: $0.avatar, score: $0.score, total: $0.total, isWinner: $0.score == maxScore && maxScore > 0, pid: $0.pid)
            }

            let roundCount = rounds.count
            let fullSubtitle = "\(subtitle) · \(roundCount) \(roundCount == 1 ? "round" : "rounds")"

            // A team game carries its two teams and their points, which are shown as the server sends them
            let teamResult = LITTeams.summaryTeams(obj).map { teams in
                TeamResult(
                    teams: LITTeam.allCases.map { team in
                        let score = teams[team.rawValue]
                        return TeamScore(
                            team: team,
                            points: score.points,
                            players: playerScores.filter { score.memberIds.contains($0.pid) },
                            isWinner: !cancelled && score.points > teams[1 - team.rawValue].points
                        )
                    },
                    rounds: LITTeams.summaryRounds(obj),
                    cancelled: cancelled
                )
            }

            return .litGame(title: title, subtitle: fullSubtitle, players: playerScores, teams: teamResult)
        } else if text.hasPrefix("emoji_match_summary:") {
            let json = String(text.dropFirst("emoji_match_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Match Emoji"

            // Parse multi-game format (games array) or legacy single-game
            var gameRounds: [GameRoundData] = []
            if let gamesArr = obj["games"] as? [[String: Any]] {
                for g in gamesArr {
                    let playersArr = g["players"] as? [[String: Any]] ?? []
                    let scores = playersArr.map { p in
                        PlayerScore(
                            name: p["name"] as? String ?? "?",
                            avatar: p["avatar"] as? String ?? "default",
                            score: p["score"] as? Int ?? 0,
                            total: g["totalPairs"] as? Int ?? 0,
                            isWinner: p["isWinner"] as? Bool ?? false
                        )
                    }
                    gameRounds.append(GameRoundData(players: scores))
                }
            } else if let playersArr = obj["players"] as? [[String: Any]] {
                // Legacy single-game format
                let totalPairs = obj["totalPairs"] as? Int ?? 0
                let scores = playersArr.map { p in
                    PlayerScore(
                        name: p["name"] as? String ?? "?",
                        avatar: p["avatar"] as? String ?? "default",
                        score: p["score"] as? Int ?? 0,
                        total: totalPairs,
                        isWinner: p["isWinner"] as? Bool ?? false
                    )
                }
                gameRounds.append(GameRoundData(players: scores))
            }

            let gameCount = gameRounds.count
            let subtitle = "\(gameCount) \(gameCount == 1 ? "game" : "games") \(L.t("played", lang))"

            // Aggregate totals across all games
            var agg: [String: (name: String, avatar: String, totalScore: Int, wins: Int)] = [:]
            for g in gameRounds {
                for p in g.players {
                    let key = "\(p.name)|\(p.avatar)"
                    var entry = agg[key] ?? (name: p.name, avatar: p.avatar, totalScore: 0, wins: 0)
                    entry.totalScore += p.score
                    if p.isWinner { entry.wins += 1 }
                    agg[key] = entry
                }
            }
            var aggregated = agg.values.map { e in
                PlayerScore(name: e.name, avatar: e.avatar, score: e.totalScore, total: 0, isWinner: false)
            }
            aggregated.sort { $0.score > $1.score }
            let maxScore = aggregated.first?.score ?? 0
            aggregated = aggregated.map {
                PlayerScore(name: $0.name, avatar: $0.avatar, score: $0.score, total: $0.total, isWinner: $0.score == maxScore && maxScore > 0)
            }

            // If gameType is "Emoji Bingo", route to the bingo renderer (green gradient)
            if gameType.contains("Bingo") {
                // Bingo winners are whoever claimed first, not whoever marked the most
                var bingoPlayers: [BingoPlayerScore] = agg.values.map { e in
                    BingoPlayerScore(name: e.name, avatar: e.avatar, marked: e.totalScore, placement: e.wins)
                }
                bingoPlayers.sort { (a: BingoPlayerScore, b: BingoPlayerScore) -> Bool in
                    a.placement != b.placement ? a.placement > b.placement : a.marked > b.marked
                }
                let bingoRounds = gameRounds.map { round in
                    let bp = round.players.map { p in
                        BingoPlayerScore(name: p.name, avatar: p.avatar, marked: p.score, placement: p.isWinner ? 1 : 0)
                    }
                    return BingoRoundData(players: bp, winPattern: "line")
                }
                return .emojiBingo(title: gameType, subtitle: subtitle, games: bingoRounds, aggregated: bingoPlayers)
            }

            return .emojiMatch(title: gameType, subtitle: subtitle, games: gameRounds, aggregated: aggregated)
        } else if text.hasPrefix("emoji_bingo_summary:") {
            let json = String(text.dropFirst("emoji_bingo_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            let gameType = obj["gameType"] as? String ?? "Emoji Bingo"
            let cancelled = obj["cancelled"] as? Bool ?? false

            var bingoRounds: [BingoRoundData] = []
            if let gamesArr = obj["games"] as? [[String: Any]] {
                for g in gamesArr {
                    let playersArr = g["players"] as? [[String: Any]] ?? []
                    let winPattern = g["winPattern"] as? String ?? "line"
                    let scores = playersArr.map { p in
                        BingoPlayerScore(
                            name: p["name"] as? String ?? "?",
                            avatar: p["avatar"] as? String ?? "default",
                            marked: p["marked"] as? Int ?? 0,
                            placement: p["placement"] as? Int ?? 0
                        )
                    }
                    bingoRounds.append(BingoRoundData(players: scores, winPattern: winPattern))
                }
            }

            let gameCount = bingoRounds.count
            let subtitle = cancelled ? L.t("Game ended early", lang) : "\(L.t("Game Complete", lang)) · \(gameCount) \(gameCount == 1 ? "game" : "games")"

            // Aggregate across rounds
            var agg: [String: (name: String, avatar: String, wins: Int, totalMarked: Int)] = [:]
            for g in bingoRounds {
                for p in g.players {
                    let key = "\(p.name)|\(p.avatar)"
                    var entry = agg[key] ?? (name: p.name, avatar: p.avatar, wins: 0, totalMarked: 0)
                    if p.placement == 1 { entry.wins += 1 }
                    entry.totalMarked += p.marked
                    agg[key] = entry
                }
            }
            var aggregated = agg.values.map { e in
                BingoPlayerScore(name: e.name, avatar: e.avatar, marked: e.totalMarked, placement: e.wins)
            }
            aggregated.sort { $0.placement > $1.placement || ($0.placement == $1.placement && $0.marked > $1.marked) }

            return .emojiBingo(title: gameType, subtitle: subtitle, games: bingoRounds, aggregated: aggregated)
        } else if text.hasPrefix("truth_or_dare_summary:") {
            let json = String(text.dropFirst("truth_or_dare_summary:".count))
            guard let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }

            let totalTurns = obj["totalTurns"] as? Int ?? 0
            let playersArr = obj["players"] as? [[String: Any]] ?? []

            var playerRatings: [TodPlayerRating] = []
            for p in playersArr {
                let name = p["name"] as? String ?? "?"
                let avatar = p["avatar"] as? String ?? "cat"
                let avgRating = p["avgRating"] as? Double
                let turnsRated = p["turnsRated"] as? Int ?? 0
                playerRatings.append(TodPlayerRating(name: name, avatar: avatar, avgRating: avgRating, turnsRated: turnsRated))
            }

            // Sort by rating descending (nil last)
            playerRatings.sort {
                guard let a = $0.avgRating else { return false }
                guard let b = $1.avgRating else { return true }
                return a > b
            }

            let subtitle = "\(totalTurns) \(totalTurns == 1 ? "turn" : "turns") \(L.t("played", lang))"
            return .truthOrDare(title: L.t("Truth or Dare", lang), subtitle: subtitle, players: playerRatings)
        }
        return nil
    }

    private enum BannerStyle {
        case lit, match, wordRush, bingo, truthOrDare

        var fill: Color {
            switch self {
            case .lit: return EC.blueSoft
            case .match: return EC.violetSoft
            case .wordRush: return EC.yellowSoft
            case .bingo: return EC.mintSoft
            case .truthOrDare: return EC.pinkSoft
            }
        }

        var accent: Color {
            switch self {
            case .lit: return EC.blue
            case .match: return EC.violet
            case .wordRush: return EC.yellow
            case .bingo: return EC.mint
            case .truthOrDare: return EC.pink
            }
        }

        var icon: String {
            switch self {
            case .lit: return "g-pencil"
            case .match: return "o-diamond"
            case .wordRush: return "g-bolt"
            case .bingo: return "g-clover"
            case .truthOrDare: return "g-question"
            }
        }
    }

    private static func isWordRush(_ title: String) -> Bool { title == "Word Rush" }

    private var style: BannerStyle {
        switch parsed {
        case .some(.truthOrDare): return .truthOrDare
        case .some(.emojiBingo): return .bingo
        case .some(.emojiMatch(let title, _, _, _)): return Self.isWordRush(title) ? .wordRush : .match
        default: return .lit
        }
    }

    var body: some View {
        if let data = parsed {
            VStack(spacing: 12) {
                switch data {
                case .emojiMatch(let title, let subtitle, let games, let aggregated):
                    emojiMatchBody(title: title, subtitle: subtitle, games: games, aggregated: aggregated)
                case .emojiBingo(let title, let subtitle, let games, let aggregated):
                    emojiBingoBody(title: title, subtitle: subtitle, games: games, aggregated: aggregated)
                case .litGame(let title, let subtitle, let players, let teams):
                    litGameBody(title: title, subtitle: subtitle, players: players, teams: teams)
                case .truthOrDare(let title, let subtitle, let players):
                    truthOrDareBody(title: title, subtitle: subtitle, players: players)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .ecCard(fill: style.fill, radius: 24, border: 3, shadow: 6)
            .padding(.horizontal, 4)
        } else {
            SystemMessageRow(text: text, lang: lang)
        }
    }

    // MARK: - Shared pieces

    private func header(title: String, subtitle: String) -> some View {
        HStack(spacing: 10) {
            PackIcon(style.icon, size: 30)
                .padding(6)
                .background(Circle().fill(style.accent))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
                .rotationEffect(.degrees(-8))
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.chunky(17))
                    .foregroundStyle(EC.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(subtitle)
                    .font(.round(11, .bold))
                    .foregroundStyle(EC.inkSoft)
            }
            Spacer(minLength: 0)
        }
    }

    /// Centred when it fits, horizontally scrollable when it doesn't
    private func fitRow<Content: View>(spacing: CGFloat = 8, @ViewBuilder _ content: () -> Content) -> some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .bottom, spacing: spacing) { content() }
                .padding(.vertical, 4)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .bottom, spacing: spacing) { content() }
                    // 10 pt above the cards for the winner's, which is tilted 3 degrees and lifted 4 pt:
                    // a horizontal scroll view also cuts at its top edge
                    .padding(.top, 10)
                    .padding(.bottom, 4)
                    .padding(.horizontal, 4)
            }
            // 6 of those 10 pt overlap the 12 pt gap above the row: it is as tall as the row that fits
            .padding(.top, -6)
        }
    }

    private func roundRow<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label)
                .font(.round(10, .black))
                .tracking(1)
                .textCase(.uppercase)
                .foregroundStyle(EC.inkSoft)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) { content() }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .frame(maxWidth: .infinity, alignment: .leading)
        .ecOutline(fill: .white.opacity(0.85), radius: 14, border: 2)
    }

    @ViewBuilder
    private func rankMark(_ rank: Int, size: CGFloat) -> some View {
        if rank == 0 {
            PackIcon("g-crown", size: size + 4)
        } else if rank <= 2 {
            Text("\(rank + 1)")
                .font(.chunky(size * 0.62))
                .foregroundStyle(EC.ink)
                .frame(width: size, height: size)
                .background(Circle().fill(rank == 1 ? EC.lineSoft : Color(hex: "f3dcc8")))
                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 1.5))
        }
    }

    private func miniScore(avatar: String, name: String, value: String, rank: Int?, dim: Bool = false) -> some View {
        HStack(spacing: 4) {
            AvatarDisc(avatarId: avatar, size: 20)
            Text(name)
                .font(.round(11, .bold))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            if !value.isEmpty {
                Text(value)
                    .font(.chunky(12))
                    .foregroundStyle(EC.ink)
            }
            if let rank {
                rankMark(rank, size: 15)
            }
        }
        .opacity(dim ? 0.6 : 1)
    }

    private func playerCard(avatar: String, name: String, detail: String, rank: Int?, isHighlighted: Bool) -> some View {
        VStack(spacing: 4) {
            ZStack {
                if let rank { rankMark(rank, size: 18) }
            }
            .frame(height: 22)
            AvatarDisc(avatarId: avatar, size: 40)
            Text(name)
                .font(.round(11, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            Text(detail)
                .font(.chunky(14))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .frame(minWidth: 72)
        .ecCard(fill: isHighlighted ? EC.yellow : .white, radius: 16, border: 2.5, shadow: isHighlighted ? 5 : 3)
        .rotationEffect(.degrees(isHighlighted ? -3 : 0))
        .offset(y: isHighlighted ? -4 : 0)
    }

    // MARK: - Emoji Match / Word Rush body

    @ViewBuilder
    private func emojiMatchBody(title: String, subtitle: String, games: [GameRoundData], aggregated: [PlayerScore]) -> some View {
        let wordRush = Self.isWordRush(title)
        header(title: L.t(title, lang), subtitle: subtitle)

        if games.count > 1 {
            ForEach(Array(games.enumerated()), id: \.element.id) { idx, game in
                emojiMatchGameRow(idx: idx, game: game)
            }
        }

        emojiMatchPodium(aggregated: aggregated, wordRush: wordRush)
    }

    @ViewBuilder
    private func emojiMatchGameRow(idx: Int, game: GameRoundData) -> some View {
        let sorted = game.players.sorted { $0.score > $1.score }
        roundRow("\(L.t("Game", lang)) \(idx + 1)") {
            ForEach(sorted) { p in
                let rank = sorted.firstIndex(where: { $0.score == p.score }) ?? 0
                miniScore(avatar: p.avatar, name: p.name, value: "\(p.score)", rank: rank <= 2 ? rank : nil)
            }
        }
    }

    @ViewBuilder
    private func emojiMatchPodium(aggregated: [PlayerScore], wordRush: Bool) -> some View {
        let podium: [PlayerScore] = aggregated.count >= 3
            ? [aggregated[1], aggregated[0], aggregated[2]] + Array(aggregated.dropFirst(3))
            : aggregated
        fitRow {
            ForEach(podium) { player in
                let rank = aggregated.firstIndex(where: { $0.score == player.score }) ?? 0
                let detail = wordRush
                    ? "\(player.score) \(L.t("pts", lang))"
                    : "\(player.score) \(player.score == 1 ? L.t("pair", lang) : L.t("pairs", lang))"
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: rank == 0 ? (player.score > 0 ? 0 : nil) : (rank <= 2 ? rank : nil),
                    isHighlighted: player.isWinner
                )
            }
        }
    }

    // MARK: - Emoji Bingo body

    @ViewBuilder
    private func emojiBingoBody(title: String, subtitle: String, games: [BingoRoundData], aggregated: [BingoPlayerScore]) -> some View {
        header(title: title, subtitle: subtitle)

        let patternLabels: [String: String] = ["line": "Line", "four_corners": "4 Corners", "blackout": "Blackout"]
        ForEach(Array(games.enumerated()), id: \.element.id) { idx, game in
            let winners = game.players.filter { $0.placement > 0 }.sorted { $0.placement < $1.placement }
            let others = game.players.filter { $0.placement == 0 }.sorted { $0.marked > $1.marked }
            roundRow("\(games.count > 1 ? "Game \(idx + 1) · " : "")\(patternLabels[game.winPattern] ?? game.winPattern)") {
                ForEach(winners) { p in
                    miniScore(avatar: p.avatar, name: p.name, value: "", rank: min(p.placement - 1, 2))
                }
                ForEach(others) { p in
                    miniScore(avatar: p.avatar, name: p.name, value: "\(p.marked)/25", rank: nil, dim: true)
                }
            }
        }

        emojiBingoPodium(aggregated: aggregated)
    }

    @ViewBuilder
    private func emojiBingoPodium(aggregated: [BingoPlayerScore]) -> some View {
        fitRow {
            ForEach(aggregated) { player in
                let isWinner = player.placement > 0
                let detail = isWinner
                    ? (player.placement > 1 ? "\(player.placement)× BINGO!" : "BINGO!")
                    : "\(player.marked) \(L.t("marked", lang))"
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: isWinner ? 0 : nil,
                    isHighlighted: isWinner
                )
            }
        }
    }

    // MARK: - Lost in Translation body

    @ViewBuilder
    private func litGameBody(title: String, subtitle: String, players: [PlayerScore], teams: TeamResult?) -> some View {
        header(title: title, subtitle: subtitle)

        if let teams {
            litTeamsBody(teams)
        } else {
            fitRow {
                ForEach(players) { player in
                    playerCard(
                        avatar: player.avatar,
                        name: player.name,
                        detail: "\(player.score)/\(player.total)",
                        rank: player.isWinner ? 0 : nil,
                        isHighlighted: player.isWinner
                    )
                }
            }
        }
    }

    /// Team game: who won, or that nobody did, the two teams side by side, and what each round gave them
    @ViewBuilder
    private func litTeamsBody(_ result: TeamResult) -> some View {
        if !result.cancelled {
            let winner = result.teams.first { $0.isWinner }?.team
            Text(winner?.winsLine(lang) ?? L.t("It's a draw!", lang))
                .font(.chunky(15))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }

        HStack(alignment: .top, spacing: 8) {
            ForEach(result.teams) { score in
                litTeamBlock(score)
            }
        }

        if !result.rounds.isEmpty {
            litTeamRounds(result.rounds)
        }
    }

    /// One team: its name on its colour, its points, and its players' own scores
    private func litTeamBlock(_ score: TeamScore) -> some View {
        VStack(spacing: 6) {
            HStack(spacing: 4) {
                if score.isWinner { rankMark(0, size: 16) }
                LITTeamChip(team: score.team, lang: lang)
            }
            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text("\(score.points)")
                    .font(.chunky(20))
                    .foregroundStyle(EC.ink)
                Text(L.t("pts", lang))
                    .font(.round(10, .black))
                    .foregroundStyle(EC.inkSoft)
            }
            VStack(alignment: .leading, spacing: 4) {
                ForEach(score.players) { player in
                    miniScore(avatar: player.avatar, name: player.name, value: "\(player.score)/\(player.total)", rank: nil)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(8)
        .frame(maxWidth: .infinity)
        .ecCard(fill: score.team.soft, radius: 16, border: 2.5, shadow: score.isWinner ? 5 : 3)
        .rotationEffect(.degrees(score.isWinner ? -2 : 0))
        .accessibilityElement(children: .combine)
    }

    /// The rounds that scored, a column each, under a row a team. A round that gave neither team points has
    /// no column. The points are in ink: the team's name, on its colour, leads the row. The columns share what
    /// width the card has, so every round is on screen without scrolling
    private func litTeamRounds(_ rounds: [(round: Int, points: [Int])]) -> some View {
        Grid(alignment: .trailing, horizontalSpacing: 2, verticalSpacing: 5) {
            GridRow {
                Text(L.t("Round", lang))
                    .font(.round(10, .black))
                    .tracking(1)
                    .textCase(.uppercase)
                    .foregroundStyle(EC.inkSoft)
                    .fixedSize()
                    .gridColumnAlignment(.leading)
                ForEach(Array(rounds.enumerated()), id: \.offset) { _, round in
                    litTeamRoundCell("\(round.round)", font: .round(10, .black), color: EC.inkSoft)
                }
            }

            ForEach(LITTeam.allCases) { team in
                GridRow {
                    // The name keeps its width: the numbers share what is left
                    LITTeamChip(team: team, lang: lang, size: 10)
                        .fixedSize()
                    ForEach(Array(rounds.enumerated()), id: \.offset) { _, round in
                        litTeamRoundCell("\(round.points[team.rawValue])", font: .chunky(12), color: EC.ink)
                    }
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(rounds.map { round in
            let points = LITTeam.allCases.map { "\($0.name(lang)) \(round.points[$0.rawValue])" }
            return "\(L.t("Round", lang)) \(round.round): \(points.joined(separator: ", "))"
        }.joined(separator: ". "))
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .frame(maxWidth: .infinity, alignment: .leading)
        .ecOutline(fill: .white.opacity(0.85), radius: 14, border: 2)
    }

    /// One number of the rounds grid. Up to 32 points wide, and narrower, with smaller digits if it must be, when
    /// the card cannot give every round that much
    private func litTeamRoundCell(_ text: String, font: Font, color: Color) -> some View {
        Text(text)
            .font(font)
            .foregroundStyle(color)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
            .frame(maxWidth: 32, alignment: .trailing)
    }

    // MARK: - Truth or Dare body

    @ViewBuilder
    private func truthOrDareBody(title: String, subtitle: String, players: [TodPlayerRating]) -> some View {
        header(title: title, subtitle: subtitle)

        let topRating = players.first?.avgRating
        fitRow {
            ForEach(players) { player in
                let isTop = player.avgRating != nil && player.avgRating == topRating
                let rank = players.firstIndex(where: { $0.avgRating == player.avgRating }) ?? 0
                let detail: String = {
                    if let avg = player.avgRating {
                        return "★ \(String(format: "%.1f", avg))"
                    }
                    return "—"
                }()
                playerCard(
                    avatar: player.avatar,
                    name: player.name,
                    detail: detail,
                    rank: rank == 0 ? (player.avgRating != nil ? 0 : nil) : (rank <= 2 ? rank : nil),
                    isHighlighted: isTop
                )
            }
        }
    }
}
