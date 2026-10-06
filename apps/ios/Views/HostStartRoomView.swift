import SwiftUI

struct HostStartRoomView: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var viewModel = HostStartRoomViewModel()
    @FocusState private var nameFocused: Bool

    private var lang: String { viewModel.hostLanguage }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    EnchattoLogo(ribbon: L.t("CHAT ACROSS LANGUAGES", lang))
                        .padding(.top, 24)

                    ChattoGreeting(size: 84)
                        .padding(.top, 10)

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Choose your avatar", lang))
                        AvatarPickerView(selectedAvatarId: $viewModel.hostAvatarId)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Your nickname", lang))
                        TextField(L.t("Enter your name", lang), text: $viewModel.hostNickname)
                            .focused($nameFocused)
                            .submitLabel(.done)
                            .ecField()
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        sectionTitle(L.t("Your language", lang))
                        HStack(spacing: 12) {
                            languageButton("en", label: "English")
                            languageButton("ja", label: "日本語")
                        }
                    }

                    if let error = viewModel.error {
                        Text(error)
                            .font(.round(13, .bold))
                            .foregroundStyle(EC.red)
                            .multilineTextAlignment(.center)
                    }

                    if let saved = viewModel.rejoinableRoom {
                        // In Create Room's place while there is a room to go back to. Busy while the server is asked
                        // about it and, when it is open, while that room is on screen over this one; a retry when
                        // the server cannot be reached
                        let busy = viewModel.isRejoining || viewModel.createdRoomId != nil
                        Button {
                            nameFocused = false
                            Haptics.thump()
                            Task { await viewModel.checkSavedRoom(tapped: true) }
                        } label: {
                            HStack(spacing: 12) {
                                if busy {
                                    ProgressView().tint(.white)
                                }
                                Text("\(L.t("Rejoin room", lang)) \(saved.joinCode)")
                                    .textCase(.uppercase)
                            }
                        }
                        .buttonStyle(.chunky(EC.pink))
                        .disabled(busy)
                        .padding(.top, 4)
                    } else {
                        Button {
                            nameFocused = false
                            Haptics.thump()
                            Task { await viewModel.createRoom() }
                        } label: {
                            if viewModel.isCreating {
                                ProgressView().tint(.white)
                            } else {
                                HStack(spacing: 12) {
                                    AvatarDisc(avatarId: viewModel.hostAvatarId, size: 38)
                                    Text(L.t("Create Room", lang))
                                        .textCase(.uppercase)
                                }
                            }
                        }
                        .buttonStyle(.chunky(EC.blue))
                        .disabled(!viewModel.canCreate)
                        .padding(.top, 4)
                    }

                    Text("v\(GitInfo.commitSHA)")
                        .font(.round(9, .medium))
                        .foregroundStyle(EC.inkSoft.opacity(0.6))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .scrollDismissesKeyboard(.interactively)
            .background {
                // Bare paper underneath, so a change of texture fades over paper and not over the window
                ZStack {
                    EC.paper
                    RoomBackground(index: viewModel.textureIndex)
                        .id(viewModel.textureIndex)
                        .transition(.opacity)
                }
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 0.35), value: viewModel.textureIndex)
            }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: Binding(
                get: { viewModel.createdRoomId != nil },
                set: { if !$0 { viewModel.createdRoomId = nil } }
            )) {
                if let roomId = viewModel.createdRoomId, let hostId = viewModel.createdHostId {
                    HostConversationView(roomId: roomId, hostId: hostId, textureIndex: viewModel.textureIndex)
                }
            }
            .task { await viewModel.checkSavedRoom(tapped: false) }
        }
        // Back in the foreground, a room the server could not be reached about is asked about again. In a room, or
        // with none saved, the check does nothing
        .onChange(of: scenePhase) { phase in
            guard phase == .active else { return }
            Task { await viewModel.checkSavedRoom(tapped: false) }
        }
        // A room entered without a tap, while the nickname is being typed: the keyboard does not follow into it
        .onChange(of: viewModel.createdRoomId) { roomId in
            if roomId != nil { nameFocused = false }
        }
        // What is shown from this screen draws ecPaperBackground() on this screen's texture
        .environment(\.roomTextureIndex, viewModel.textureIndex)
    }

    private func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(.round(17, .black))
            .foregroundStyle(EC.ink)
    }

    private func languageButton(_ code: String, label: String) -> some View {
        let selected = viewModel.hostLanguage == code
        return Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                viewModel.hostLanguage = code
            }
        } label: {
            HStack(spacing: 8) {
                LangBadge(lang: code, size: 24)
                Text(label)
            }
        }
        .buttonStyle(.chunky(selected ? EC.yellow : .white, size: .small))
        .rotationEffect(.degrees(selected ? -2 : 0))
        .offset(y: selected ? -2 : 0)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

/// EC.blue / pink / mint / violet mixed with 28% white; matches the web logo letters (globals.css)
private let logoAccents: [Color] = [Color(hex: "7294ff"), Color(hex: "ff9fca"), Color(hex: "75e6c6"), Color(hex: "c0a0ff")]

/// "Enchatto" wordmark matching the web home hero (components/ui/logo.tsx): hopping two-tone
/// letters on a spinning burst, a forked ribbon tagline and floating あ / A / ! / ? bits.
struct EnchattoLogo: View {
    var ribbon: String? = nil
    var size: CGFloat = 46

    private let letters = Array("Enchatto")
    private let accents = logoAccents

    /// Web measurements are px at a 54px wordmark
    private var k: CGFloat { size / 54 }

    var body: some View {
        VStack(spacing: 6 * k) {
            LoopClock { t in
                HStack(spacing: -size * 0.03) {
                    ForEach(letters.indices, id: \.self) { i in
                        hoppingLetter(i, t: t)
                    }
                }
                .background { burst(t) }
            }

            if let ribbon {
                LogoRibbon(text: ribbon, size: size)
            }
        }
        .overlay(alignment: .topLeading) { bit("あ", EC.mint, lead: 0.4, kana: true).offset(x: -22 * k, y: -14 * k) }
        .overlay(alignment: .topTrailing) { bit("A", EC.violet, lead: 1.2).offset(x: 20 * k, y: -18 * k) }
        .overlay(alignment: .topLeading) { bit("!", EC.red, lead: 1.8).offset(x: -10 * k, y: size * 1.45) }
        .overlay(alignment: .topTrailing) { bit("?", EC.yellow, lead: 0.9).offset(x: 8 * k, y: size * 1.37) }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Enchatto")
    }

    /// Web `ec-hop`: squash, leap with a counter-tilt, land; staggered 0.18s per letter
    private func hoppingLetter(_ i: Int, t: Double) -> some View {
        let odd = !i.isMultiple(of: 2)
        let tilt = odd ? 6.0 : -7.0
        let rest = odd ? -5.0 : 0
        let lead = t > 0 ? Double(i) * 0.18 : 0
        let lift = keyframed(t, period: 1.6, lead: lead, [(0, 0), (0.12, 4), (0.3, -12), (0.55, 0), (1, 0)])
        let rot = keyframed(t, period: 1.6, lead: lead, [(0, tilt), (0.12, tilt), (0.3, -tilt * 0.5), (0.55, tilt), (1, tilt)])
        let sx = keyframed(t, period: 1.6, lead: lead, [(0, 1), (0.12, 1.1), (0.3, 0.95), (0.55, 1), (1, 1)])
        let sy = keyframed(t, period: 1.6, lead: lead, [(0, 1), (0.12, 0.88), (0.3, 1.07), (0.55, 1), (1, 1)])
        return LogoLetter(character: String(letters[i]), size: size, accent: accents[i % accents.count])
            .scaleEffect(x: sx, y: sy)
            .offset(y: (rest + lift) * k)
            .rotationEffect(.degrees(rot))
    }

    /// Yellow + pink double star, spinning once every 18s
    private func burst(_ t: Double) -> some View {
        let d = size * 3.6
        let line = d / 200
        let spin = Angle.degrees(t.truncatingRemainder(dividingBy: 18) / 18 * 360)
        let outer = StarBurst(points: 14, innerRatio: 66 / 96)
        let inner = StarBurst(points: 12, innerRatio: 50 / 70)
        return ZStack {
            outer.fill(EC.yellow)
                .overlay(outer.stroke(EC.ink, style: StrokeStyle(lineWidth: 5 * line, lineJoin: .round)))
                .frame(width: d * 0.96, height: d * 0.96)
            inner.fill(EC.pink)
                .overlay(inner.stroke(EC.ink, style: StrokeStyle(lineWidth: 4 * line, lineJoin: .round)))
                .frame(width: d * 0.7, height: d * 0.7)
        }
        .rotationEffect(spin)
        .background(
            outer.fill(EC.ink.opacity(0.9))
                .frame(width: d * 0.96, height: d * 0.96)
                .rotationEffect(spin)
                .offset(y: 5 * k)
        )
    }

    /// Web `ec-float`: 8px ease-in-out bob every 2.4s
    /// `kana` gets the rounded face and a thinner outline so the loops stay open (web `.ec-logo-bits b.kana`)
    private func bit(_ glyph: String, _ color: Color, lead: Double, kana: Bool = false) -> some View {
        LoopClock { t in
            let rise = (1 - cos((t + lead) * 2 * .pi / 2.4)) / 2
            let glyphSize = size * (kana ? 0.62 : 0.5)
            OutlinedText(glyph, size: glyphSize, fill: color, outline: kana ? 1.5 : 2, font: kana ? .round(glyphSize, .black) : nil)
                .offset(y: -8 * k * (t > 0 ? rise : 0))
        }
    }
}

/// Header-sized `EnchattoLogo` letters: same two-tone colors and alternating tilt, no burst.
/// Still by default; each change of `hopTrigger` plays one hop wave, and `hot` keeps them hopping.
/// With `hopOnTap` a tap on a letter plays one too, spreading from that letter to both sides.
struct EnchattoWordmark: View {
    var text = "Enchatto"
    var size: CGFloat = 22
    var hopTrigger = 0
    var hot = false
    var hopOnTap = false

    @State private var hopStart: Date?
    /// Letter the wave in flight spreads from: the first for a message, the tapped one for a tap
    @State private var hopOrigin = 0

    private let accents = logoAccents
    private static let period = 1.6
    private static let stagger = 0.12

    var body: some View {
        let letters = Array(text)
        LoopClock(active: hot || hopStart != nil) { t in
            HStack(spacing: -size * 0.03) {
                ForEach(letters.indices, id: \.self) { i in
                    let glyph = letter(i, String(letters[i]), phase: phase(of: i, t: t))
                    if hopOnTap {
                        glyph
                            // The letter's own slot, wherever its hop draws it, and a fifth of its height above
                            // and below. No wider: the next letter starts there, and a button follows the last
                            .contentShape(Rectangle().scale(x: 1, y: 1.4))
                            // The finger landing is the tap: a press of no length and not a tap gesture, so that
                            // it neither waits for nor counts toward a triple tap the screen around it takes
                            .onLongPressGesture(minimumDuration: 0) {
                                Haptics.tap()
                                startHop(from: i)
                            }
                    } else {
                        glyph
                    }
                }
            }
        }
        .padding(.trailing, size * 0.12)
        .padding(.bottom, size * 0.14)
        .onChange(of: hopTrigger) { _ in startHop(from: 0) }
        // One element named by the word, also where its letters take a tap: the hop is a treat, not a control
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(text)
    }

    /// Plays one hop wave that starts at letter `origin` and reaches each other letter a stagger later per step
    private func startHop(from origin: Int) {
        // A wave already in flight absorbs back-to-back messages and taps instead of restarting mid-hop
        guard !hot, hopStart == nil else { return }
        let start = Date()
        hopOrigin = origin
        hopStart = start
        // The clock runs until the letter farthest from the origin has landed
        let farthest = max(origin, text.count - 1 - origin)
        let length = Self.period * 0.55 + Self.stagger * Double(farthest + 1)
        DispatchQueue.main.asyncAfter(deadline: .now() + length) {
            if hopStart == start { hopStart = nil }
        }
    }

    /// Seconds into the current hop for letter `i`, or nil while it rests
    private func phase(of i: Int, t: Double) -> Double? {
        guard t > 0 else { return nil }
        if hot { return t + Double(i) * 0.18 }
        guard let hopStart else { return nil }
        let elapsed = t - hopStart.timeIntervalSinceReferenceDate - Double(abs(i - hopOrigin)) * Self.stagger
        return elapsed >= 0 && elapsed < Self.period ? elapsed : nil
    }

    /// Web `ec-wordmark-hop`: the home logo's squash, leap and land, scaled to the header size
    private func letter(_ i: Int, _ character: String, phase: Double?) -> some View {
        let odd = !i.isMultiple(of: 2)
        let tilt = odd ? 6.0 : -7.0
        let k = size / 54
        var lift = 0.0, rot = tilt, sx = 1.0, sy = 1.0
        if let p = phase {
            lift = keyframed(p, period: Self.period, [(0, 0), (0.12, 4), (0.3, -12), (0.55, 0), (1, 0)])
            rot = keyframed(p, period: Self.period, [(0, tilt), (0.12, tilt), (0.3, -tilt * 0.5), (0.55, tilt), (1, tilt)])
            sx = keyframed(p, period: Self.period, [(0, 1), (0.12, 1.1), (0.3, 0.95), (0.55, 1), (1, 1)])
            sy = keyframed(p, period: Self.period, [(0, 1), (0.12, 0.88), (0.3, 1.07), (0.55, 1), (1, 1)])
        }
        return LogoLetter(character: character, size: size, accent: accents[i % accents.count])
            .scaleEffect(x: sx, y: sy)
            .offset(y: (odd ? -size * 0.04 : 0) + lift * k)
            .rotationEffect(.degrees(rot))
    }
}

/// One wordmark letter: white top, accent bottom cut on a slant, ink outline, pink then ink drop
private struct LogoLetter: View {
    let character: String
    let size: CGFloat
    let accent: Color

    var body: some View {
        let k = size / 54
        let outline = min(3, max(1.5, 3.6 * k))
        let glyph = Text(character).font(.chunky(size))
        ZStack {
            glyph.foregroundStyle(EC.ink).offset(x: 7 * k, y: 8 * k)
            glyph.foregroundStyle(EC.pink).offset(x: 5 * k, y: 6 * k)
            ForEach(0..<12, id: \.self) { i in
                let a = Double(i) * .pi / 6
                glyph.foregroundStyle(EC.ink).offset(x: cos(a) * outline, y: sin(a) * outline)
            }
            glyph.foregroundStyle(.white)
            glyph.foregroundStyle(accent).mask(SlantedBottom())
        }
    }
}

private struct SlantedBottom: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.minX, y: rect.minY + rect.height * 0.6))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY + rect.height * 0.48))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
            p.closeSubpath()
        }
    }
}

/// Forked blue ribbon from the web logo (svg viewBox 300×60, stretched around the text)
private struct LogoRibbon: View {
    let text: String
    let size: CGFloat

    private var label: Text {
        Text(text).font(.round(size * 0.3, .black)).tracking(size * 0.3 * 0.08)
    }

    var body: some View {
        let k = size / 54
        ZStack {
            label.foregroundStyle(EC.ink).offset(y: 3)
            ForEach(0..<8, id: \.self) { i in
                let a = Double(i) * .pi / 4
                label.foregroundStyle(EC.ink).offset(x: cos(a) * 2, y: sin(a) * 2)
            }
            label.foregroundStyle(.white)
        }
        .fixedSize()
        .padding(.horizontal, 26 * k)
        .padding(.top, 7 * k)
        .padding(.bottom, 9 * k)
        .background {
            ZStack {
                RibbonArt(silhouette: true).offset(y: 4)
                RibbonArt(silhouette: false)
            }
            .padding(EdgeInsets(top: -4 * k, leading: -26 * k, bottom: -6 * k, trailing: -26 * k))
        }
        .rotationEffect(.degrees(-3))
    }
}

private struct RibbonArt: View {
    let silhouette: Bool

    private static let leftTail: [CGPoint] = [
        CGPoint(x: 0, y: 14), CGPoint(x: 26, y: 8), CGPoint(x: 22, y: 30),
        CGPoint(x: 26, y: 52), CGPoint(x: 0, y: 46), CGPoint(x: 10, y: 30),
    ]
    private static let rightTail: [CGPoint] = leftTail.map { CGPoint(x: 300 - $0.x, y: $0.y) }
    private static let band: [CGPoint] = [
        CGPoint(x: 18, y: 4), CGPoint(x: 282, y: 4), CGPoint(x: 282, y: 56), CGPoint(x: 18, y: 56),
    ]

    var body: some View {
        ZStack {
            piece(Self.leftTail, EC.blueDeep)
            piece(Self.rightTail, EC.blueDeep)
            piece(Self.band, EC.blue)
            if !silhouette {
                ViewBoxPath(points: [CGPoint(x: 30, y: 13), CGPoint(x: 270, y: 13)], closed: false)
                    .stroke(.white.opacity(0.6), style: StrokeStyle(lineWidth: 2.5, dash: [8, 6]))
            }
        }
    }

    private func piece(_ points: [CGPoint], _ fill: Color) -> some View {
        let shape = ViewBoxPath(points: points)
        return shape.fill(silhouette ? EC.ink : fill)
            .overlay(shape.stroke(EC.ink, style: StrokeStyle(lineWidth: 3, lineJoin: .round)))
    }
}

/// Polyline in a 300×60 viewBox, stretched non-uniformly to the rect (svg preserveAspectRatio="none")
private struct ViewBoxPath: Shape {
    let points: [CGPoint]
    var closed = true

    func path(in rect: CGRect) -> Path {
        Path { p in
            p.addLines(points.map {
                CGPoint(x: rect.minX + $0.x / 300 * rect.width, y: rect.minY + $0.y / 60 * rect.height)
            })
            if closed { p.closeSubpath() }
        }
    }
}

/// Hopping Chatto with a wobbling bubble that alternates こんにちは！ / Hello! (web home hero)
private struct ChattoGreeting: View {
    var size: CGFloat = 96

    var body: some View {
        let k = size / 120
        ChattoView(size: size, hop: true)
            .overlay(alignment: .topLeading) {
                LoopClock { t in
                    let english = !Int(t / 2.4).isMultiple(of: 2)
                    let rot = keyframed(t, period: 2.4, [(0, -4), (0.1, 3), (0.2, -4), (1, -4)])
                    let scale = keyframed(t, period: 2.4, [(0, 1), (0.1, 1.08), (0.2, 1), (1, 1)])
                    Text(english ? "Hello!" : "こんにちは！")
                        .font(.round(15, .black))
                        .foregroundStyle(EC.ink)
                        .fixedSize()
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .ecCard(radius: 18, border: 3, shadow: 4)
                        .overlay(alignment: .bottomLeading) {
                            BubbleTail()
                                .fill(.white)
                                .overlay(BubbleTail().stroke(EC.ink, style: StrokeStyle(lineWidth: 3, lineJoin: .round)))
                                .frame(width: 14, height: 11)
                                .offset(x: 16, y: 8)
                        }
                        .scaleEffect(scale)
                        .rotationEffect(.degrees(rot))
                }
                .offset(x: 102 * k, y: -16 * k)
            }
            .accessibilityHidden(true)
    }
}

/// Down-left bubble tail, open at the top so it merges into the bubble
private struct BubbleTail: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.maxX, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.minX + rect.width * 0.25, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        }
    }
}

#Preview {
    HostStartRoomView()
}
