import SwiftUI
import PhotosUI

extension HostConversationView {
    /// The input bar with everything it presents. Each line adds one group of modifiers; they apply from the top down
    var inputView: some View {
        let withDictation = dictationHandlers(inputBar)
        let withAttachments = attachmentCovers(withDictation)
        let withGameSheets = gamePickerAndLostInTranslation(withAttachments)
        let withGames = fullScreenGames(withGameSheets)
        return withGames
    }

    /// The drawing composer, the camera and the photo library, and the send of a picked photo
    func attachmentCovers(_ content: some View) -> some View {
        content
            .fullScreenCover(isPresented: $showDrawingComposer) {
                DrawingComposerView(
                    lang: hostLanguage,
                    onSend: { image in
                        showDrawingComposer = false
                        viewModel.setTypingAction(nil)
                        let reply = replyToId
                        replyToId = nil
                        viewModel.sendDrawing(image, replyToId: reply)
                    },
                    onCancel: {
                        showDrawingComposer = false
                        viewModel.setTypingAction(nil)
                    },
                    triggerAutoSubmit: .constant(false)
                )
                .environment(\.roomTextureIndex, shownTextureIndex)
            }
            .fullScreenCover(isPresented: $showCamera) {
                CameraPickerView(
                    onImageCaptured: { image in
                        let reply = replyToId
                        replyToId = nil
                        viewModel.sendImage(image, replyToId: reply)
                    },
                    isPresented: $showCamera
                )
                .ignoresSafeArea()
            }
            .photosPicker(isPresented: $showPhotoLibrary, selection: $selectedPhotoItem, matching: .images)
            .onChange(of: selectedPhotoItem) { newItem in
                guard let newItem else { return }
                Task {
                    if let data = try? await newItem.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        let reply = replyToId
                        replyToId = nil
                        viewModel.sendImage(image, replyToId: reply)
                    }
                    selectedPhotoItem = nil
                }
            }
    }
}
