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
