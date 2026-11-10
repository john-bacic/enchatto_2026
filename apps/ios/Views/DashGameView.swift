import SwiftUI
import WebKit

/// Chatto Dash on the phone. The game is the web's own (apps/web/app/play/dash): one engine, the same courses and
/// the same physics on every device, drawn here in a web view that covers the room. The page talks to the server
/// for itself, as a browser guest's does; this view hands it who is playing and puts it away when it asks.
struct DashGameView: View {
    let roomId: String
    let participantId: String
    let lang: String
    /// The page asked to be put away: its minimize button, or Close on the podium
    let onClose: () -> Void
    /// The game was ended, or the room has none
    let onEnded: () -> Void

    private enum Phase { case loading, ready, failed }
    @State private var phase: Phase = .loading
    @State private var attempt = 0

    /// How long the page may take to say it is up before the wait is called a failure
    private static let patience: UInt64 = 20_000_000_000

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                if let url = DashGameView.pageURL(roomId: roomId, participantId: participantId, lang: lang) {
                    DashWebView(
                        url: url,
                        bootstrap: DashGameView.bootstrap(for: url, participantId: participantId),
                        insets: proxy.safeAreaInsets,
                        lang: lang,
                        attempt: attempt,
                        onMessage: { type in
                            switch type {
                            case "ready": phase = .ready
                            case "close": onClose()
                            case "ended": onEnded()
                            default: break
                            }
                        },
                        onFail: { phase = .failed }
                    )
                    .opacity(phase == .ready ? 1 : 0)
                    .ignoresSafeArea()
                }
                if phase != .ready { waiting }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .ecPaperBackground()
        .task(id: attempt) {
            try? await Task.sleep(nanoseconds: DashGameView.patience)
            if !Task.isCancelled, phase == .loading { phase = .failed }
        }
    }

    private var waiting: some View {
        VStack(spacing: 14) {
            PackIcon("o-shootingstar", size: 72)
            Text(L.t("Chatto Dash", lang))
                .font(.chunky(26, relativeTo: .title))
                .foregroundStyle(EC.ink)
            if phase == .failed {
                Text(L.t("Couldn't load the race. Check your connection.", lang))
                    .font(.round(14, .bold))
                    .foregroundStyle(EC.ink.opacity(0.75))
                    .multilineTextAlignment(.center)
                Button(L.t("Try again", lang)) {
                    phase = .loading
                    attempt += 1
                }
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

private struct DashWebView: UIViewRepresentable {
    let url: URL
    let bootstrap: String
    /// The notch and the home bar. The page is drawn under both and keeps its own controls clear of them
    /// (--dash-top and --dash-bottom in apps/web/components/dash/dash.css)
    let insets: EdgeInsets
    let lang: String
    /// Counted up to load the page again after a failure
    let attempt: Int
    let onMessage: (String) -> Void
    let onFail: () -> Void

    static let channel = "enchattoDash"

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        // The game's sounds are made in the page and start with the first touch of its controls
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        let content = WKUserContentController()
        content.addUserScript(WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        content.add(context.coordinator, name: DashWebView.channel)
        configuration.userContentController = content

        let web = WKWebView(frame: .zero, configuration: configuration)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        // Clear until the page has drawn: the room's paper shows through
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.backgroundColor = .clear
        // A game screen, not a document: nothing scrolls, bounces or zooms, and no swipe leaves the page
        web.scrollView.isScrollEnabled = false
        web.scrollView.bounces = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = false
        web.allowsLinkPreview = false
        #if DEBUG
        if #available(iOS 16.4, *) { web.isInspectable = true }
        #endif
        context.coordinator.attempt = attempt
        web.load(URLRequest(url: url))
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.applyInsets(to: web)
        if context.coordinator.attempt != attempt {
            context.coordinator.attempt = attempt
            web.load(URLRequest(url: url))
        }
    }

    static func dismantleUIView(_ web: WKWebView, coordinator: Coordinator) {
        web.configuration.userContentController.removeScriptMessageHandler(forName: channel)
        web.stopLoading()
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
        var parent: DashWebView
        var attempt = 0

        init(_ parent: DashWebView) { self.parent = parent }

        /// Tells the page how much of the screen the notch and the home bar take. Said again whenever the page
        /// might not have it: once it has loaded, once it says it is up, and when the insets change
        func applyInsets(to web: WKWebView) {
            let top = Int(parent.insets.top.rounded())
            let bottom = Int(parent.insets.bottom.rounded())
            web.evaluateJavaScript(
                "document.documentElement.style.setProperty('--dash-top','\(top)px');"
                    + "document.documentElement.style.setProperty('--dash-bottom','\(bottom)px');",
                completionHandler: nil
            )
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
            if type == "ready", let web = message.webView { applyInsets(to: web) }
            parent.onMessage(type)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            applyInsets(to: webView)
        }

        /// The page's own question ("End the game for everyone?"), asked as the app asks one. A web view shows no
        /// dialog of its own: without this the page's confirm() answers no
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            var presenter = webView.window?.rootViewController
            while let next = presenter?.presentedViewController { presenter = next }
            guard let presenter else { return completionHandler(false) }
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: L.t("Cancel", parent.lang), style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: L.t("End Game", parent.lang), style: .destructive) { _ in completionHandler(true) })
            presenter.present(alert, animated: true)
        }

        /// The web view shows the game and goes nowhere else: only the web app's own origin is loaded in it
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard navigationAction.targetFrame?.isMainFrame != false else { return decisionHandler(.allow) }
            let target = navigationAction.request.url
            let same = target?.scheme == parent.url.scheme && target?.host == parent.url.host && target?.port == parent.url.port
            decisionHandler(same ? .allow : .cancel)
        }

        /// A web app that does not have the game's page (one deployed before this game) answers 404 with a page of
        /// its own, which would otherwise sit there as if it were loading
        func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
            if navigationResponse.isForMainFrame, let http = navigationResponse.response as? HTTPURLResponse, http.statusCode >= 400 {
                decisionHandler(.cancel)
                parent.onFail()
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.onFail()
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.onFail()
        }

        /// iOS took the page's process (memory): the page is loaded again and picks the round up where it is
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()
        }
    }
}
