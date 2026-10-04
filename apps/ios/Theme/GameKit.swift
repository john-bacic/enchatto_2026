import SwiftUI

// Shared chrome for the full-screen party games (Bingo, Match, Truth or Dare).

// MARK: - Header

/// White ink pill with the game's icon art: "🍀 EMOJI BINGO"
struct GKTitlePill: View {
    let icon: String
    let title: String

    var body: some View {
        HStack(spacing: 6) {
            PackIcon(icon, size: 24)
            Text(title.uppercased())
                .font(.chunky(13, relativeTo: .headline))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.leading, 6)
        .padding(.trailing, 12)
        .padding(.vertical, 4)
        .background(Capsule().fill(.white))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .background(Capsule().fill(EC.ink).offset(y: 3))
        .padding(.bottom, 3)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

struct GKHeader<Trailing: View>: View {
    let icon: String
    let title: String
    let lang: String
    var onMinimize: (() -> Void)?
    let trailing: Trailing

    init(icon: String, title: String, lang: String, onMinimize: (() -> Void)? = nil, @ViewBuilder trailing: () -> Trailing) {
        self.icon = icon
        self.title = title
        self.lang = lang
        self.onMinimize = onMinimize
        self.trailing = trailing()
    }

    var body: some View {
        HStack(spacing: 10) {
            if let onMinimize {
                Button(action: onMinimize) {
                    Image(systemName: "chevron.down")
                }
                .buttonStyle(.roundIcon(diameter: 40))
                .accessibilityLabel(L.t("Minimize", lang))
            }
            GKTitlePill(icon: icon, title: title)
            Spacer(minLength: 4)
            trailing
        }
        .padding(.horizontal, 16)
        .padding(.top, 6)
        .padding(.bottom, 2)
    }
}

/// Small "14/48 called" style counter used in headers
struct GKCounter: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.round(12, .black))
            .foregroundStyle(EC.ink.opacity(0.6))
            .lineLimit(1)
            .fixedSize()
    }
}

// MARK: - Timer ring

/// Pie countdown ring driven by a server turn start + timeout (ms since epoch)
struct GKTimerRing: View {
    let startedAtMs: Double
    let totalMs: Double
    var hurryBelow = 5
    var size: CGFloat = 44

    var body: some View {
        TimelineView(.periodic(from: .now, by: 0.25)) { ctx in
            let remaining = max(0, totalMs - (ctx.date.timeIntervalSince1970 * 1000 - startedAtMs))
            let secs = Int(ceil(remaining / 1000))
            let fraction = totalMs > 0 ? remaining / totalMs : 0
            let hurry = secs <= hurryBelow
            ZStack {
                Circle().fill(.white)
                Circle()
                    .trim(from: 0, to: fraction)
                    .stroke(hurry ? EC.red : EC.blue, lineWidth: size * 0.2)
                    .rotationEffect(.degrees(-90))
                    .padding(size * 0.1)
                Circle()
                    .fill(.white)
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    .padding(size * 0.2)
                Text("\(secs)")
                    .font(.chunky(size * 0.32))
                    .foregroundStyle(hurry ? EC.red : EC.ink)
                    .monospacedDigit()
            }
            .frame(width: size, height: size)
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 3))
            .background(Circle().fill(EC.ink).offset(y: 3))
            .rotationEffect(.degrees(hurry && secs > 0 ? (secs.isMultiple(of: 2) ? -7 : 7) : 0))
            .animation(.spring(response: 0.25, dampingFraction: 0.4), value: secs)
            .accessibilityElement()
            .accessibilityLabel("\(secs)s")
        }
    }
}

// MARK: - Players

struct GKPlayer: Identifiable {
    let id: String
    let nickname: String
    let avatarValue: String
    var isHost = false
    var isMe = false
}

/// Disc + name tile for lobby grids
struct GKPlayerTile: View {
    let player: GKPlayer
    let lang: String
    var size: CGFloat = 52

    var body: some View {
        VStack(spacing: 4) {
            AvatarDisc(avatarId: player.avatarValue, size: size, ring: player.isMe ? EC.pink : nil)
                .background(Circle().fill(EC.ink).offset(y: 3))
                .overlay(alignment: .topTrailing) {
                    if player.isHost {
                        PackIcon("g-crown", size: 22)
                            .rotationEffect(.degrees(14))
                            .offset(x: 6, y: -8)
                    }
                }
            Text(player.isMe ? L.t("You", lang) : player.nickname)
                .font(.round(12, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(player.isHost ? "\(player.nickname), \(L.t("HOST", lang))" : player.nickname)
    }
}

/// Full lobby screen: hero art with rays, title, tagline, extras, player grid, footer buttons
struct GKLobby<Extra: View, Footer: View>: View {
    let icon: String
    let title: String
    let tagline: String
    let accent: Color
    let playersLabel: String
    let players: [GKPlayer]
    let lang: String
    let extra: Extra
    let footer: Footer

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    init(
        icon: String, title: String, tagline: String, accent: Color, playersLabel: String,
        players: [GKPlayer], lang: String,
        @ViewBuilder extra: () -> Extra, @ViewBuilder footer: () -> Footer
    ) {
        self.icon = icon
        self.title = title
        self.tagline = tagline
        self.accent = accent
        self.playersLabel = playersLabel
        self.players = players
        self.lang = lang
        self.extra = extra()
        self.footer = footer()
    }

    var body: some View {
        VStack(spacing: 14) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    ZStack {
                        if !reduceMotion {
                            RaysView(color: accent.opacity(0.35)).frame(width: 300, height: 300)
                        }
                        PackIcon(icon, size: 84)
                            .padding(18)
                            .background(Circle().fill(accent))
                            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 4))
                            .background(Circle().fill(EC.ink).offset(y: 6))
                            .gkBob(delay: 0)
                            .popIn()
                    }
                    .frame(height: 170)
                    .padding(.top, 8)

                    OutlinedText(title.uppercased(), size: 32, fill: .white)
                        .rotationEffect(.degrees(-3))
                        .stampIn(delay: 0.1)
                        .multilineTextAlignment(.center)
                        .accessibilityAddTraits(.isHeader)

                    Text(tagline)
                        .font(.round(15, .bold))
                        .foregroundStyle(EC.ink.opacity(0.75))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)

                    extra

                    VStack(alignment: .leading, spacing: 12) {
                        ECLabel("\(playersLabel)")
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 70), spacing: 10)], spacing: 14) {
                            ForEach(Array(players.enumerated()), id: \.element.id) { index, player in
                                GKPlayerTile(player: player, lang: lang)
                                    .popIn(delay: 0.15 + Double(index) * 0.05)
                            }
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .ecCard(radius: 24)
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 8)
            }

            VStack(spacing: 8) { footer }
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
        }
    }
}

// MARK: - Results

struct GKPodiumEntry: Identifiable {
    let id: String
    let nickname: String
    let avatarValue: String
    let valueText: String
    var isMe = false
}

/// Top-3 podium (2 · 1 · 3) with the crown on first place
struct GKPodium: View {
    let entries: [GKPodiumEntry]
    let lang: String

    var body: some View {
        let ranks = [1, 0, 2].filter { entries.indices.contains($0) }
        HStack(alignment: .bottom, spacing: 8) {
            ForEach(ranks, id: \.self) { rank in
                column(rank: rank, entry: entries[rank])
            }
        }
        .padding(.horizontal, 16)
    }

    private func column(rank: Int, entry: GKPodiumEntry) -> some View {
        let heights: [CGFloat] = [104, 74, 54]
        let fills = [EC.yellow, EC.blue, EC.pink]
        return VStack(spacing: 2) {
            AvatarDisc(avatarId: entry.avatarValue, size: rank == 0 ? 70 : 60, ring: entry.isMe ? EC.pink : nil)
                .background(Circle().fill(EC.ink).offset(y: 4))
                .overlay(alignment: .top) {
                    if rank == 0 {
                        PackIcon("g-crown", size: 44)
                            .rotationEffect(.degrees(-10))
                            .offset(y: -32)
                            .stampIn(delay: 0.5)
                    }
                }
                .gkBob(delay: Double(rank) * 0.15)
                .padding(.bottom, 6)
            Text(entry.isMe ? L.t("You", lang) : entry.nickname)
                .font(.round(12, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            Text(entry.valueText)
                .font(.chunky(15))
                .foregroundStyle(EC.ink)
            OutlinedText("\(rank + 1)", size: 32, fill: .white, outline: 2.5)
                .frame(maxWidth: .infinity)
                .frame(height: heights[rank])
                .background(UnevenTopRoundedRect(radius: 14).fill(fills[rank]))
                .overlay(UnevenTopRoundedRect(radius: 14).stroke(EC.ink, lineWidth: 3.5))
                .padding(.top, 4)
        }
        .frame(width: 104)
        .popIn(delay: 0.2 + Double(2 - rank) * 0.15)
        .accessibilityElement(children: .combine)
    }
}

/// Rect with only the top corners rounded (iOS 16 has no UnevenRoundedRectangle)
struct UnevenTopRoundedRect: Shape {
    var radius: CGFloat

    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + radius))
        p.addQuadCurve(to: CGPoint(x: rect.minX + radius, y: rect.minY), control: CGPoint(x: rect.minX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX - radius, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY + radius), control: CGPoint(x: rect.maxX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        return p
    }
}

/// Ranked row below the podium (4th place and on, or full lists)
struct GKRankRow: View {
    let rank: Int
    let entry: GKPodiumEntry
    let lang: String

    var body: some View {
        HStack(spacing: 10) {
            Text("\(rank)")
                .font(.chunky(15))
                .foregroundStyle(EC.ink.opacity(0.6))
                .frame(width: 22)
            AvatarDisc(avatarId: entry.avatarValue, size: 32)
            Text(entry.isMe ? L.t("You", lang) : entry.nickname)
                .font(.round(14, .black))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
            Spacer()
            Text(entry.valueText)
                .font(.chunky(15))
                .foregroundStyle(EC.ink)
        }
        .padding(.vertical, 5)
        .padding(.leading, 6)
        .padding(.trailing, 14)
        .background(Capsule().fill(entry.isMe ? EC.yellowSoft : .white))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .background(Capsule().fill(EC.ink).offset(y: 3))
        .padding(.bottom, 3)
        .accessibilityElement(children: .combine)
    }
}

/// Room paper + big spinning rays + confetti burst on appear
struct GKCelebrationBackground: View {
    let room: Room?
    var celebrate = true
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var burst = 0

    var body: some View {
        ZStack {
            RoomBackground(room: room)
            if !reduceMotion {
                GeometryReader { geo in
                    RaysView(color: EC.yellow.opacity(0.5), rays: 22)
                        .frame(width: 460, height: 460)
                        .position(x: geo.size.width / 2, y: geo.size.height * 0.28)
                }
            }
            if celebrate {
                ConfettiBurst(trigger: burst, count: reduceMotion ? 20 : 60)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            guard celebrate else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { burst += 1 }
        }
    }
}

// MARK: - Patterns

/// Polka dots (match card backs, truth card)
struct GKDotPattern: View {
    var color: Color = .white.opacity(0.45)
    var spacing: CGFloat = 14
    var radius: CGFloat = 2.5

    var body: some View {
        Canvas { ctx, size in
            var y = spacing / 2
            var row = 0
            while y < size.height + spacing {
                var x = row.isMultiple(of: 2) ? spacing / 2 : spacing
                while x < size.width + spacing {
                    ctx.fill(Path(ellipseIn: CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2)), with: .color(color))
                    x += spacing
                }
                y += spacing
                row += 1
            }
        }
        .allowsHitTesting(false)
    }
}

/// Diagonal candy stripes (dare card)
struct GKStripePattern: View {
    var color: Color = .white.opacity(0.18)
    var width: CGFloat = 12

    var body: some View {
        Canvas { ctx, size in
            var x = -size.height
            while x < size.width {
                var p = Path()
                p.move(to: CGPoint(x: x, y: size.height))
                p.addLine(to: CGPoint(x: x + width, y: size.height))
                p.addLine(to: CGPoint(x: x + width + size.height, y: 0))
                p.addLine(to: CGPoint(x: x + size.height, y: 0))
                p.closeSubpath()
                ctx.fill(p, with: .color(color))
                x += width * 2
            }
        }
        .allowsHitTesting(false)
    }
}

// MARK: - Teams

/// The two teams of a Lost in Translation team game, by their place in the session's `teams`.
/// Not pink and blue: in this app those mean Japanese and English (LangBadge).
enum LITTeam: Int, CaseIterable, Identifiable {
    case mint, grape

    /// nil for anything but 0 and 1
    init?(index: Int?) {
        guard let index, let team = LITTeam(rawValue: index) else { return nil }
        self = team
    }

    var id: Int { rawValue }
    var color: Color { self == .mint ? EC.mint : EC.violet }
    var soft: Color { self == .mint ? EC.mintSoft : EC.violetSoft }

    func name(_ lang: String) -> String {
        L.t(self == .mint ? "Team Mint" : "Team Grape", lang)
    }

    /// "Team Mint wins!"
    func winsLine(_ lang: String) -> String {
        L.t("{team} wins!", lang).replacingOccurrences(of: "{team}", with: name(lang))
    }
}

/// A team's name on its colour. Ink on both: it reads on mint and on violet, white only on violet
struct LITTeamChip: View {
    let team: LITTeam
    let lang: String
    var size: CGFloat = 12

    var body: some View {
        Text(team.name(lang))
            .font(.round(size, .black))
            .foregroundStyle(EC.ink)
            .lineLimit(1)
            .minimumScaleFactor(0.7)
            .padding(.horizontal, size * 0.8)
            .padding(.vertical, size * 0.33)
            .background(Capsule().fill(team.color))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
    }
}

/// A team's colour as a short bar in front of one of its players. Ink-outlined, so it shows on any fill:
/// a right guess's row in the results is mintSoft
struct LITTeamStripe: View {
    let team: LITTeam
    let lang: String

    var body: some View {
        Capsule()
            .fill(team.color)
            .frame(width: 7, height: 20)
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 1.5))
            .accessibilityLabel(team.name(lang))
    }
}

/// A team's points on its colour, next to its name: the colour alone never says whose points they are.
/// As wide as it is given, so that two of them share a row evenly
struct LITTeamPoints: View {
    let team: LITTeam
    let points: Int
    let lang: String
    /// "+60": what one round gave the team, not its total
    var gained = false
    /// The team has the drawing this round
    var isDrawing = false
    /// Its drawing is in and the others are guessing: "drew" rather than "is drawing"
    var drawingDone = false
    /// The avatar of the player this device belongs to, on that player's team
    var myAvatarId: String? = nil

    var body: some View {
        HStack(spacing: 4) {
            if let myAvatarId {
                AvatarDisc(avatarId: myAvatarId, size: 18)
            }
            Text(team.name(lang))
                .font(.round(12, .black))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            if isDrawing {
                PackIcon("g-pencil", size: 16)
            }
            Spacer(minLength: 2)
            Text(gained ? "+\(points)" : "\(points)")
                .font(.chunky(13))
                .lineLimit(1)
        }
        .foregroundStyle(EC.ink)
        .padding(.leading, myAvatarId == nil ? 9 : 3)
        .padding(.trailing, 9)
        .padding(.vertical, 3)
        .frame(maxWidth: .infinity, minHeight: 26)
        .background(Capsule().fill(team.color))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(team.name(lang))\(isDrawing ? " \(L.t(drawingDone ? "drew" : "is drawing", lang))" : ""): \(gained ? "+" : "")\(points) \(L.t("pts", lang))")
    }
}

// MARK: - Flow layout

/// Wrapping row of chips
struct GKFlowLayout: Layout {
    var spacing: CGFloat = 6
    var lineSpacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews: subviews)
        let height = rows.map(\.height).reduce(0, +) + CGFloat(max(0, rows.count - 1)) * lineSpacing
        let width = rows.map(\.width).max() ?? 0
        return CGSize(width: proposal.width ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for index in row.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(at: CGPoint(x: x, y: y + (row.height - size.height) / 2), proposal: .unspecified)
                x += size.width + spacing
            }
            y += row.height + lineSpacing
        }
    }

    private struct Row {
        var indices: [Int] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = []
        var current = Row()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let needed = current.indices.isEmpty ? size.width : current.width + spacing + size.width
            if needed > width, !current.indices.isEmpty {
                rows.append(current)
                current = Row()
            }
            current.width = current.indices.isEmpty ? size.width : current.width + spacing + size.width
            current.height = max(current.height, size.height)
            current.indices.append(index)
        }
        if !current.indices.isEmpty { rows.append(current) }
        return rows
    }
}

/// Selectable pill (packs, timer, modes). Selected = yellow, raised with a hard shadow.
struct GKChoiceChip: View {
    let text: String
    var icon: String? = nil
    let selected: Bool
    var selectedFill: Color = EC.yellow
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            HStack(spacing: 5) {
                if let icon { PackIcon(icon, size: 20) }
                Text(text)
                    .font(.round(13, .black))
                    .foregroundStyle(selected ? EC.textOn(selectedFill) : EC.ink)
                    .lineLimit(1)
            }
            .padding(.leading, icon == nil ? 12 : 6)
            .padding(.trailing, 12)
            .padding(.vertical, 5)
            .background(Capsule().fill(selected ? selectedFill : .white))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
            .background(Capsule().fill(EC.ink).offset(y: selected ? 3 : 0))
            .offset(y: selected ? -2 : 0)
            .padding(.vertical, 2)
            .animation(.spring(response: 0.25, dampingFraction: 0.55), value: selected)
        }
        .buttonStyle(.pressable)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

// MARK: - Toggle

/// Ink-outlined pill switch
struct GKPopToggleStyle: ToggleStyle {
    var onColor: Color = EC.mint

    func makeBody(configuration: Configuration) -> some View {
        Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { configuration.isOn.toggle() }
        } label: {
            HStack(spacing: 12) {
                configuration.label
                Spacer(minLength: 0)
                ZStack(alignment: configuration.isOn ? .trailing : .leading) {
                    Capsule()
                        .fill(configuration.isOn ? onColor : Color(hex: "eceaf3"))
                        .frame(width: 52, height: 30)
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
                    Circle()
                        .fill(.white)
                        .frame(width: 22, height: 22)
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2.5))
                        .padding(.horizontal, 4)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityValue(configuration.isOn ? "On" : "Off")
    }
}

// MARK: - Motion

extension View {
    /// Looping wobble ("1 AWAY!", hot buttons). Off under Reduce Motion.
    func gkWiggle(_ active: Bool = true, angle: Double = 3, duration: Double = 0.3) -> some View {
        modifier(GKWiggleModifier(active: active, angle: angle, duration: duration))
    }

    /// Looping cheer hop for avatars
    func gkBob(delay: Double = 0, height: CGFloat = 6) -> some View {
        modifier(GKBobModifier(delay: delay, height: height))
    }
}

// Both are one-shot nudges (on appear / when becoming active), not loops: constant motion on
// headers and bottom buttons was distracting.
private struct GKWiggleModifier: ViewModifier {
    let active: Bool
    let angle: Double
    let duration: Double

    func body(content: Content) -> some View {
        content.nudge(on: active, active: active, angle: angle * 2.5)
    }
}

private struct GKBobModifier: ViewModifier {
    let delay: Double
    let height: CGFloat

    func body(content: Content) -> some View {
        content.nudge(on: height, active: height > 0, angle: 0, hop: height * 1.5, delay: delay)
    }
}
