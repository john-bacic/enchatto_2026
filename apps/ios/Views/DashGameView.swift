import SwiftUI
import WebKit

/// Chatto Dash on the phone. The game is the web's own (apps/web/app/play/dash): one engine, the same courses and
/// the same physics on every device, drawn here in a web view that covers the room. The page talks to the server
/// for itself, as a browser guest's does; this view hands it who is playing and puts it away when it asks.
///
/// The web view is the room's (DashWebStore), loaded before it is wanted and kept between showings: by the time a
/// race is started the page is already up, and coming back to a race put away does not load it again.
struct DashGameView: View {
    @ObservedObject var store: DashWebStore
    let roomId: String
    let participantId: String
    let lang: String
    /// The page asked to be put away: its minimize button, or Close on the podium
    let onClose: () -> Void
    /// The game was ended, or the room has none
    let onEnded: () -> Void

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                DashWebHost(store: store)
                    .opacity(store.phase == .ready ? 1 : 0)
                    .ignoresSafeArea()
                if store.phase != .ready { waiting }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .onAppear { store.insets = proxy.safeAreaInsets }
            .onChange(of: proxy.safeAreaInsets) { store.insets = $0 }
        }
        .ecPaperBackground()
        // A game, not a document: a thumb on the stick or a button near the screen's edge is not a swipe home,
        // the home bar is out of the way, and the screen stays on for someone who is only watching
        .defersSystemGestures(on: .all)
        .persistentSystemOverlays(.hidden)
        .onAppear {
            store.onMessage = { type in
                switch type {
                case "close": onClose()
                case "ended": onEnded()
                default: break
                }
            }
            store.warm(roomId: roomId, participantId: participantId, lang: lang)
            UIApplication.shared.isIdleTimerDisabled = true
        }
        .onDisappear {
            store.onMessage = nil
            UIApplication.shared.isIdleTimerDisabled = false
        }
    }

    private var waiting: some View {
        VStack(spacing: 14) {
            PackIcon("o-shootingstar", size: 72)
            Text(L.t("Chatto Dash", lang))
                .font(.chunky(26, relativeTo: .title))
                .foregroundStyle(EC.ink)
            if store.phase == .failed {
                Text(L.t("Couldn't load the race. Check your connection.", lang))
                    .font(.round(14, .bold))
                    .foregroundStyle(EC.ink.opacity(0.75))
                    .multilineTextAlignment(.center)
                Button(L.t("Try again", lang)) { store.reload() }
                    .buttonStyle(.chunky(EC.pink))
            } else {
                ProgressView()
                    .tint(EC.ink)
                Text(L.t("Loading the race…", lang))
                    .font(.round(14, .bold))
                    .foregroundStyle(EC.ink.opacity(0.75))
            }
            Button(L.t("Close", lang)) { onClose() }
                .buttonStyle(.chunky(.white, size: .small))
        }
        .padding(22)
        .frame(maxWidth: 320)
        .ecCard(radius: 24, border: 3, shadow: 6)
        .padding(24)
    }

    /// The page for this room and player. `lang` is what this device shows the room in, which a guest's phone
    /// may have changed since joining
    static func pageURL(roomId: String, participantId: String, lang: String) -> URL? {
        guard var components = URLComponents(string: AppConfig.webAppURL + "/play/dash") else { return nil }
        components.queryItems = [
            URLQueryItem(name: "room", value: roomId),
            URLQueryItem(name: "pid", value: participantId),
            URLQueryItem(name: "lang", value: lang),
        ]
        // A room this build made is on the backend the web app calls its legacy one, as in a room link
        if AppConfig.roomsOnLegacyBackend { components.queryItems?.append(URLQueryItem(name: "b", value: "legacy")) }
        return components.url
    }

    /// Run in the page before any of its own code. Puts this player's token where the web app keeps one
    /// (apps/web/lib/convex.tsx), so that the page's calls are made as this player. Only ever on the web app's
    /// own origin: the token is this player's key to the room
    static func bootstrap(for url: URL, participantId: String) -> String {
        func js(_ value: String) -> String {
            let data = (try? JSONSerialization.data(withJSONObject: [value])) ?? Data("[\"\"]".utf8)
            return String(String(decoding: data, as: UTF8.self).dropFirst().dropLast())
        }
        let origin = "\(url.scheme ?? "https")://\(url.host ?? "")" + (url.port.map { ":\($0)" } ?? "")
        var lines = ["if (location.origin === \(js(origin))) {"]
        if let caller = ConvexHTTPClient.caller, caller.id == participantId, let token = caller.token {
            lines.append("try { localStorage.setItem(\(js("enchatto_token_" + participantId)), \(js(token))); } catch (e) {}")
        }
        lines.append("}")
        return lines.joined(separator: "\n")
    }
}

/// Puts the room's web view on screen. The web view is the store's, not this view's: taken off screen it goes on
/// living, with its page loaded
private struct DashWebHost: UIViewRepresentable {
    @ObservedObject var store: DashWebStore

    func makeUIView(context: Context) -> UIView {
        let holder = UIView()
        holder.backgroundColor = .clear
        return holder
    }

    func updateUIView(_ holder: UIView, context: Context) {
        guard let web = store.web, web.superview !== holder else { return }
        web.frame = holder.bounds
        web.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        holder.addSubview(web)
    }
}

/// The room's Chatto Dash page, in a web view of its own that outlives the screen it is shown on. `warm` loads the
/// page ahead of need (the room does it when the game picker opens, and whenever the room has a race on); the page
/// then stays loaded, connected to the server, until the room screen goes away (`close`). So a race that is started
/// shows at once, and one that was put away is come back to as it was left.
@MainActor
final class DashWebStore: NSObject, ObservableObject {
    enum Phase { case idle, loading, ready, failed }

    @Published private(set) var phase: Phase = .idle
    @Published private(set) var web: WKWebView?
    /// What the page says while it is on screen: "close" or "ended". Nobody listens while it is only being kept
    /// warm, where "ended" means no more than that the room has no race yet
    var onMessage: ((String) -> Void)?
    /// The notch and the home bar. The page is drawn under both and keeps its own controls clear of them
    /// (--dash-top and --dash-bottom in apps/web/components/dash/dash.css)
    var insets = EdgeInsets() {
        didSet { applyInsets() }
    }

    static let channel = "enchattoDash"
    /// How long the page may take to say it is up before the wait is called a failure
    private static let patience: UInt64 = 20_000_000_000

    private var url: URL?
    private var lang = "en"
    /// A load that fails is tried once more by itself before anyone is told
    private var retried = false
    private var watchdog: Task<Void, Never>?

    /// Loads the page for this room and player unless it is loaded already
    func warm(roomId: String, participantId: String, lang: String) {
        guard !roomId.isEmpty, !participantId.isEmpty,
              let target = DashGameView.pageURL(roomId: roomId, participantId: participantId, lang: lang) else { return }
        self.lang = lang
        if web == nil { web = makeWeb(bootstrap: DashGameView.bootstrap(for: target, participantId: participantId)) }
        if url != target || phase == .idle || phase == .failed {
            url = target
            retried = false
            load()
        }
    }

    /// Try again, asked for by hand
    func reload() {
        retried = false
        load()
    }

    /// The room screen is gone: the page with it
    func close() {
        watchdog?.cancel()
        web?.configuration.userContentController.removeScriptMessageHandler(forName: DashWebStore.channel)
        web?.stopLoading()
        web?.removeFromSuperview()
        web = nil
        url = nil
        phase = .idle
    }

    private func load() {
        guard let web, let url else { return }
        phase = .loading
        web.load(URLRequest(url: url))
        watchdog?.cancel()
        watchdog = Task { [weak self] in
            try? await Task.sleep(nanoseconds: DashWebStore.patience)
            guard !Task.isCancelled, let self, self.phase == .loading else { return }
            self.failed()
        }
    }

    private func failed() {
        guard phase != .failed else { return }
        if !retried {
            retried = true
            Task { [weak self] in
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                guard let self, self.phase == .loading else { return }
                self.load()
            }
            return
        }
        watchdog?.cancel()
        phase = .failed
    }

    private func makeWeb(bootstrap: String) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        // The game's sounds are made in the page and start with the first touch of its controls
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        let content = WKUserContentController()
        content.addUserScript(WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // Through a go-between that does not hold the store: the web view keeps its message handler for good
        content.add(DashMessageRelay(self), name: DashWebStore.channel)
        configuration.userContentController = content

        // The size of the screen from the start: the page is laid out before it is shown
        let web = WKWebView(frame: UIScreen.main.bounds, configuration: configuration)
        web.navigationDelegate = self
        web.uiDelegate = self
        // Clear until the page has drawn: the room's paper shows through
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.backgroundColor = .clear
        // A game screen, not a document: nothing scrolls, bounces or zooms (two thumbs on the controls are not a
        // pinch), and no swipe leaves the page
        web.scrollView.isScrollEnabled = false
        web.scrollView.bounces = false
        web.scrollView.pinchGestureRecognizer?.isEnabled = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = false
        web.allowsLinkPreview = false
        #if DEBUG
        if #available(iOS 16.4, *) { web.isInspectable = true }
        #endif
        return web
    }

    /// Tells the page how much of the screen the notch and the home bar take. Said again whenever the page might
    /// not have it: once it has loaded, once it says it is up, and when the insets change
    private func applyInsets() {
        let top = Int(insets.top.rounded())
        let bottom = Int(insets.bottom.rounded())
        web?.evaluateJavaScript(
            "document.documentElement.style.setProperty('--dash-top','\(top)px');"
                + "document.documentElement.style.setProperty('--dash-bottom','\(bottom)px');",
            completionHandler: nil
        )
    }

    fileprivate func received(_ type: String) {
        if type == "ready" {
            watchdog?.cancel()
            retried = false
            phase = .ready
            applyInsets()
            return
        }
        onMessage?(type)
    }
}

/// Hands the page's messages to the store without the web view owning the store
private final class DashMessageRelay: NSObject, WKScriptMessageHandler {
    weak var store: DashWebStore?
    init(_ store: DashWebStore) { self.store = store }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        Task { @MainActor [weak store] in store?.received(type) }
    }
}

extension DashWebStore: WKNavigationDelegate, WKUIDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        applyInsets()
    }

    /// The page's own question ("End the game for everyone?"), asked as the app asks one. A web view shows no
    /// dialog of its own: without this the page's confirm() answers no
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        var presenter = webView.window?.rootViewController
        while let next = presenter?.presentedViewController { presenter = next }
        guard let presenter else { return completionHandler(false) }
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: L.t("Cancel", lang), style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: L.t("End Game", lang), style: .destructive) { _ in completionHandler(true) })
        presenter.present(alert, animated: true)
    }

    /// The web view shows the game and goes nowhere else: only the web app's own origin is loaded in it
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard navigationAction.targetFrame?.isMainFrame != false else { return decisionHandler(.allow) }
        let target = navigationAction.request.url
        let same = target?.scheme == url?.scheme && target?.host == url?.host && target?.port == url?.port
        decisionHandler(same ? .allow : .cancel)
    }

    /// A web app that does not have the game's page (one deployed before this game) answers 404 with a page of
    /// its own, which would otherwise sit there as if it were loading
    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if navigationResponse.isForMainFrame, let http = navigationResponse.response as? HTTPURLResponse, http.statusCode >= 400 {
            decisionHandler(.cancel)
            failed()
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        failed()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        failed()
    }

    /// iOS took the page's process (memory): the page is loaded again and picks the round up where it is
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        load()
    }
}
