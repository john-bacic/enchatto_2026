import SwiftUI
import WebKit

/// Chatto Dash by yourself: any course against the clock, with no room and no connection. The game is the web's
/// own, as in a room (DashGameView), but here the page is a copy the app carries (Resources/DashOffline, built from
/// apps/web by `npm run build:dash-offline`) and is served to the web view from the app's own files: nothing is
/// fetched from anywhere. Best times are the page's to keep, on this device.
struct DashPracticeView: View {
    let avatarId: String
    let lang: String
    let onClose: () -> Void

    @State private var ready = false

    /// Whether this build carries the practice page at all
    static var isAvailable: Bool { DashOfflineFiles.file(for: "/index.html") != nil }

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                DashPracticeWeb(
                    avatarId: avatarId,
                    lang: lang,
                    insets: proxy.safeAreaInsets,
                    onMessage: { type in
                        switch type {
                        case "ready": ready = true
                        case "close": onClose()
                        default: break
                        }
                    }
                )
                .opacity(ready ? 1 : 0)
                .ignoresSafeArea()
                if !ready {
                    ProgressView().tint(EC.ink)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .ecPaperBackground()
        // As in a room's race: a thumb near the screen's edge is not a swipe home, and the screen stays on
        .defersSystemGestures(on: .all)
        .persistentSystemOverlays(.hidden)
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
    }
}

/// The app's own files, served to a web view as a site: the practice page and what it asks for. `/fonts/<file>` is
/// one of the app's fonts; everything else is a file of Resources/DashOffline, by its path there. A page loaded
/// this way has one origin, so the pictures it draws into the 3D scene are its own (a page opened straight from a
/// file may not read its neighbours' pixels)
final class DashOfflineFiles: NSObject, WKURLSchemeHandler {
    static let scheme = "enchatto-offline"

    static func pageURL(avatarId: String, lang: String) -> URL? {
        var components = URLComponents()
        components.scheme = scheme
        components.host = "dash"
        components.path = "/index.html"
        components.queryItems = [URLQueryItem(name: "avatar", value: avatarId), URLQueryItem(name: "lang", value: lang)]
        return components.url
    }

    /// The file a path names, or nil: nothing outside the practice page's folder and the app's fonts
    static func file(for path: String) -> URL? {
        let parts = path.split(separator: "/").map(String.init)
        guard !parts.isEmpty, !parts.contains(where: { $0 == ".." || $0.hasPrefix(".") }) else { return nil }
        let found: URL?
        if parts.count == 2, parts[0] == "fonts" {
            found = Bundle.main.url(forResource: parts[1], withExtension: nil)
        } else {
            found = Bundle.main.url(forResource: "DashOffline", withExtension: nil)?.appendingPathComponent(parts.joined(separator: "/"))
        }
        guard let found, FileManager.default.fileExists(atPath: found.path) else { return nil }
        return found
    }

    private static let types = [
        "html": "text/html; charset=utf-8", "js": "text/javascript; charset=utf-8", "css": "text/css; charset=utf-8",
        "png": "image/png", "ttf": "font/ttf", "json": "application/json",
    ]

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url,
              let file = DashOfflineFiles.file(for: url.path),
              let data = try? Data(contentsOf: file),
              let response = HTTPURLResponse(
                  url: url,
                  statusCode: 200,
                  httpVersion: "HTTP/1.1",
                  headerFields: [
                      "Content-Type": DashOfflineFiles.types[file.pathExtension.lowercased()] ?? "application/octet-stream",
                      "Content-Length": String(data.count),
                  ]
              )
        else {
            task.didFailWithError(URLError(.fileDoesNotExist))
            return
        }
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

private struct DashPracticeWeb: UIViewRepresentable {
    let avatarId: String
    let lang: String
    /// The notch and the home bar. The page is drawn under both and keeps its own controls clear of them
    /// (--dash-top and --dash-bottom in apps/web/components/dash/dash.css)
    let insets: EdgeInsets
    let onMessage: (String) -> Void

    static let channel = "enchattoDash"

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.setURLSchemeHandler(DashOfflineFiles(), forURLScheme: DashOfflineFiles.scheme)
        configuration.userContentController.add(context.coordinator, name: DashPracticeWeb.channel)

        let web = WKWebView(frame: UIScreen.main.bounds, configuration: configuration)
        web.navigationDelegate = context.coordinator
        // Clear: the app's paper shows behind the page
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.backgroundColor = .clear
        web.scrollView.isScrollEnabled = false
        web.scrollView.bounces = false
        web.scrollView.pinchGestureRecognizer?.isEnabled = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = false
        web.allowsLinkPreview = false
        #if DEBUG
        if #available(iOS 16.4, *) { web.isInspectable = true }
        #endif
        if let url = DashOfflineFiles.pageURL(avatarId: avatarId, lang: lang) { web.load(URLRequest(url: url)) }
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.applyInsets(to: web)
    }

    static func dismantleUIView(_ web: WKWebView, coordinator: Coordinator) {
        web.configuration.userContentController.removeScriptMessageHandler(forName: channel)
        web.stopLoading()
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        var parent: DashPracticeWeb

        init(_ parent: DashPracticeWeb) { self.parent = parent }

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

        /// The page is the app's own and goes nowhere else
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(navigationAction.request.url?.scheme == DashOfflineFiles.scheme ? .allow : .cancel)
        }

        /// iOS took the page's process (memory): the page is loaded again, at its list of courses
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()
        }
    }
}
