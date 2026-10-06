import SwiftUI

// MARK: - QR Code Floating Panel

struct QRCodeFloatingPanel: View {
    let joinCode: String
    @Binding var isPresented: Bool
    var lang: String = "en"
    @Environment(\.roomTextureIndex) private var roomTextureIndex
    @State private var dragOffset: CGFloat = 0
    @State private var appeared = false
    @State private var copied = false

    private var joinURL: String {
        "https://enchatto.vercel.app/join/\(joinCode)"
    }

    var body: some View {
        ZStack(alignment: .top) {
            // Dimmed background
            EC.ink.opacity(appeared ? 0.45 : 0)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            // Panel
            VStack(spacing: 14) {
                // Drag handle
                Capsule()
                    .fill(EC.lineSoft)
                    .frame(width: 44, height: 6)
                    .padding(.top, 10)

                ECQRCard(url: joinURL, size: 190)

                Button {
                    Haptics.success()
                    UIPasteboard.general.string = joinURL
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { copied = true }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation { copied = false }
                    }
                } label: {
                    VStack(spacing: 8) {
                        ECLabel(L.t("Room Code", lang))
                        RoomCodeTiles(code: joinCode, tileSize: 40)
                            .opacity(copied ? 0.6 : 1)
                        if copied {
                            ECChip(text: L.t("Copied!", lang), fill: EC.mint)
                                .transition(.scale.combined(with: .opacity))
                        } else {
                            Text(L.t("Tap to copy link", lang))
                                .font(.round(12, .bold))
                                .foregroundStyle(EC.inkSoft)
                                .transition(.opacity)
                        }
                    }
                }
                .buttonStyle(.pressable)

                Text(L.t("Scan or enter code to join", lang))
                    .font(.round(13, .bold))
                    .foregroundStyle(EC.inkSoft)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
            }
            .frame(maxWidth: .infinity)
            .background {
                // The texture of the room behind it
                RoomBackground(index: roomTextureIndex, blobs: false)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            }
            .ecCard(fill: .clear, radius: 28, border: 3.5, shadow: 8)
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .offset(y: appeared ? dragOffset : -800)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        // Only allow upward drag
                        if value.translation.height < 0 {
                            dragOffset = value.translation.height
                        }
                    }
                    .onEnded { value in
                        if value.translation.height < -80 {
                            dismiss()
                        } else {
                            withAnimation(.spring(response: 0.3)) {
                                dragOffset = 0
                            }
                        }
                    }
            )
        }
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }

    private func dismiss() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.9)) {
            appeared = false
            dragOffset = -800
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            isPresented = false
        }
    }
}
