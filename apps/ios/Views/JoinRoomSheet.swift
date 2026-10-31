import SwiftUI
import AVFoundation

/// Joining a room as a guest from the start screen: its code typed in, or its QR code scanned
struct JoinRoomSheet: View {
    @ObservedObject var viewModel: HostStartRoomViewModel
    @Binding var code: String
    @Environment(\.dismiss) private var dismiss
    @FocusState private var codeFocused: Bool
    @State private var scanning = false
    @State private var cameraDenied = false

    private var lang: String { viewModel.hostLanguage }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack {
                Text(L.t("Join a Room", lang))
                    .font(.chunky(24))
                    .foregroundStyle(EC.ink)
                Spacer()
                Button {
                    Haptics.tap()
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .black))
                        .foregroundStyle(EC.ink)
                }
                .buttonStyle(.roundIcon(.white, diameter: 40))
                .accessibilityLabel(L.t("Close", lang))
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(L.t("Room code", lang))
                    .font(.round(17, .black))
                    .foregroundStyle(EC.ink)
                TextField(L.t("Enter the 6-letter code", lang), text: $code)
                    .font(.chunky(22))
                    .tracking(3)
                    .textInputAutocapitalization(.characters)
                    .autocorrectionDisabled()
                    .keyboardType(.asciiCapable)
                    .submitLabel(.join)
                    .focused($codeFocused)
                    .onSubmit(join)
                    .ecField()
                    .onChange(of: code) { typed in
                        // A pasted join link gives its code; anything else is cut to six letters and digits
                        let cleaned = HostStartRoomViewModel.joinCode(in: typed)
                            ?? String(typed.uppercased().filter { $0.isASCII && ($0.isLetter || $0.isNumber) }.prefix(6))
                        if cleaned != typed { code = cleaned }
                    }
            }

            if let error = viewModel.error {
                Text(error)
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.red)
            }
            if cameraDenied {
                Text(L.t("Camera access is off. Turn it on in Settings to scan.", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
            }

            Button(action: join) {
                if viewModel.isJoining {
                    ProgressView().tint(.white)
                } else {
                    Text(L.t("Join", lang)).textCase(.uppercase)
                }
            }
            .buttonStyle(.chunky(EC.pink))
            .disabled(code.count != 6 || !viewModel.canJoin)

            Button {
                Haptics.tap()
                codeFocused = false
                Task { await openScanner() }
            } label: {
                Label(L.t("Scan QR code", lang), systemImage: "qrcode.viewfinder")
            }
            .buttonStyle(.chunky(.white, size: .small))
            .disabled(viewModel.isJoining)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 20)
        .padding(.top, 26)
        .background(EC.paper.ignoresSafeArea())
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
        .onAppear {
            viewModel.error = nil
            if code.isEmpty { codeFocused = true }
        }
        .fullScreenCover(isPresented: $scanning) {
            scanner
        }
    }

    private var scanner: some View {
        ZStack {
            QRScannerView { value in
                scanning = false
                code = HostStartRoomViewModel.joinCode(in: value) ?? code
                join()
            }
            .ignoresSafeArea()

            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .strokeBorder(.white, style: StrokeStyle(lineWidth: 4, dash: [18, 10]))
                .frame(width: 250, height: 250)
                .accessibilityHidden(true)

            VStack {
                HStack {
                    Spacer()
                    Button {
                        Haptics.tap()
                        scanning = false
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 15, weight: .black))
                            .foregroundStyle(EC.ink)
                    }
                    .buttonStyle(.roundIcon(.white, diameter: 44))
                    .accessibilityLabel(L.t("Close", lang))
                }
                Spacer()
                Text(L.t("Point the camera at the room's QR code", lang))
                    .font(.round(15, .black))
                    .foregroundStyle(EC.ink)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .ecCard(radius: 18, border: 3, shadow: 4)
            }
            .padding(20)
        }
        .background(Color.black)
    }

    private func join() {
        guard code.count == 6, viewModel.canJoin else { return }
        codeFocused = false
        Haptics.thump()
        let typed = code
        Task {
            // The room screen is pushed under this sheet; the start screen takes the sheet away once it is
            await viewModel.joinRoom(typed)
        }
    }

    private func openScanner() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            cameraDenied = false
            scanning = true
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            cameraDenied = !granted
            scanning = granted
        default:
            cameraDenied = true
        }
    }
}

/// The camera, looking for a room's QR code. Calls `onCode` once, with the first code that holds a room's code or
/// join link; any other QR code is passed over
struct QRScannerView: UIViewControllerRepresentable {
    let onCode: (String) -> Void

    func makeUIViewController(context: Context) -> ScannerController {
        let controller = ScannerController()
        controller.onCode = onCode
        return controller
    }

    func updateUIViewController(_ controller: ScannerController, context: Context) {}

    final class ScannerController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
        var onCode: ((String) -> Void)?
        private let session = AVCaptureSession()
        private var preview: AVCaptureVideoPreviewLayer?
        private var found = false

        override func viewDidLoad() {
            super.viewDidLoad()
            view.backgroundColor = .black
            guard let device = AVCaptureDevice.default(for: .video),
                  let input = try? AVCaptureDeviceInput(device: device),
                  session.canAddInput(input) else { return }
            session.addInput(input)
            let output = AVCaptureMetadataOutput()
            guard session.canAddOutput(output) else { return }
            session.addOutput(output)
            output.setMetadataObjectsDelegate(self, queue: .main)
            output.metadataObjectTypes = [.qr]
            let layer = AVCaptureVideoPreviewLayer(session: session)
            layer.videoGravity = .resizeAspectFill
            view.layer.addSublayer(layer)
            preview = layer
        }

        override func viewDidLayoutSubviews() {
            super.viewDidLayoutSubviews()
            preview?.frame = view.bounds
        }

        // startRunning blocks until the camera is up, so not on the main thread
        override func viewWillAppear(_ animated: Bool) {
            super.viewWillAppear(animated)
            let session = session
            DispatchQueue.global(qos: .userInitiated).async { session.startRunning() }
        }

        override func viewWillDisappear(_ animated: Bool) {
            super.viewWillDisappear(animated)
            let session = session
            DispatchQueue.global(qos: .userInitiated).async { session.stopRunning() }
        }

        func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
            guard !found,
                  let value = (metadataObjects.first as? AVMetadataMachineReadableCodeObject)?.stringValue,
                  HostStartRoomViewModel.joinCode(in: value) != nil else { return }
            found = true
            Haptics.thump()
            onCode?(value)
        }
    }
}
