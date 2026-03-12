import Foundation

enum GitInfo {
    static let commitSHA: String = {
        Bundle.main.infoDictionary?["GitCommitSHA"] as? String ?? "dev"
    }()
}
