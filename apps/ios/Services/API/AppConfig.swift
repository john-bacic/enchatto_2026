import Foundation

/// App-wide configuration
enum AppConfig {
    /// Convex deployment URL (set after running `npx convex dev`)
    /// Format: "https://your-deployment.convex.site"
    static let convexDeploymentURL = "https://basic-ram-104.convex.site"

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
