import Foundation

enum GitInfo {
    /// The first seven characters of the commit the app is built from. The "Inject Git Commit SHA"
    /// build phase writes them into the built Info.plist on every build, or "unknown" when git names no commit.
    static let commitSHA: String = Bundle.main.infoDictionary?["GitCommitSHA"] as? String ?? "unknown"
}
