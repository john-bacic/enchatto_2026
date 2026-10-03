import SwiftUI
import UserNotifications

@main
struct EnchattoApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    init() {
        ECFonts.register()
    }

    var body: some Scene {
        WindowGroup {
            HostStartRoomView()
        }
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let hex = deviceToken.map { String(format: "%02x", $0) }.joined()
        Task { @MainActor in PushManager.shared.finishRegistration(hex) }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[push] registration failed: \(error.localizedDescription)")
        Task { @MainActor in PushManager.shared.finishRegistration(nil) }
    }

    /// The join already shows in the chat when the room is on screen
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        []
    }
}

@MainActor
final class PushManager {
    static let shared = PushManager()

    private var deviceToken: String?
    private var waiters: [CheckedContinuation<String?, Never>] = []

    /// Asks for permission (once; iOS remembers the answer) and returns the APNs token, or nil if denied/unavailable
    func requestToken() async -> String? {
        let granted = (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])) ?? false
        guard granted else { return nil }
        if let deviceToken { return deviceToken }
        return await withCheckedContinuation { continuation in
            waiters.append(continuation)
            if waiters.count == 1 {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }

    func finishRegistration(_ token: String?) {
        if let token { deviceToken = token }
        let pending = waiters
        waiters = []
        pending.forEach { $0.resume(returning: token) }
    }
}
