import Foundation

/// App-wide configuration
enum AppConfig {
    /// Convex HTTP actions base URL. Debug builds use the dev deployment, Release
    /// (TestFlight / App Store) uses production. The web app falls back to dev
    /// for join codes it can't find on production, so older builds keep working.
    #if DEBUG
    static let convexDeploymentURL = "https://helpful-bulldog-420.convex.site"
    #else
    static let convexDeploymentURL = "https://basic-ram-104.convex.site"
    #endif

    /// The web app, where Chatto Dash is shown from (DashGameView).
    /// A Debug build started with `-enchatto_webBase http://localhost:3100` shows the game from a web app
    /// running on this Mac, for a game the live site does not have yet
    static var webAppURL: String {
        #if DEBUG
        if let local = UserDefaults.standard.string(forKey: "enchatto_webBase"), !local.isEmpty { return local }
        #endif
        return "https://enchatto.vercel.app"
    }

    /// Whether this build's rooms are on the backend the web app calls its legacy one (the dev deployment):
    /// a link into such a room says so with `b=legacy`
    static var roomsOnLegacyBackend: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    /// Whether to use mock data instead of real backend
    static let useMockAPI = false

    /// Create the appropriate API implementation
    static func makeAPI() -> EnchattoAPI {
        if useMockAPI {
            return MockEnchattoAPI()
        } else {
            return RealEnchattoAPI(deploymentURL: convexDeploymentURL)
        }
    }
}
