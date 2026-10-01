import SwiftUI

@main
struct EnchattoApp: App {
    init() {
        ECFonts.register()
    }

    var body: some Scene {
        WindowGroup {
            HostStartRoomView()
        }
    }
}
