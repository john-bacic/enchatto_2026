import SwiftUI

struct EmojifyrPreviewView: View {
    let sentence: String
    let emojiClue: String?
    let isGenerating: Bool
    let lang: String
    let onUse: () -> Void
    let onRegenerate: () -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                VStack(spacing: 8) {
                    Text(L.t("Original sentence:", lang))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(sentence)
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                VStack(spacing: 8) {
                    Text(L.t("Generated emoji clue:", lang))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    if isGenerating {
                        ProgressView(L.t("Generating emojis...", lang))
                            .padding()
                    } else if let clue = emojiClue {
                        Text(clue)
                            .font(.system(size: 56))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                }

                Spacer()

                if !isGenerating {
                    VStack(spacing: 12) {
                        Button {
                            onUse()
                        } label: {
                            Text(L.t("Use", lang))
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(emojiClue != nil ? Color.purple : Color.gray.opacity(0.3))
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(emojiClue == nil)

                        Button {
                            onRegenerate()
                        } label: {
                            Text(L.t("Regenerate", lang))
                                .fontWeight(.medium)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color(.systemGray5))
                                .foregroundStyle(.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L.t("Cancel", lang)) {
                        onCancel()
                    }
                }
            }
        }
    }
}
