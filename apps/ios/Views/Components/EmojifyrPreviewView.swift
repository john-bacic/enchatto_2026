import SwiftUI

struct EmojifyrPreviewView: View {
    @Binding var sentence: String
    let emojiClue: String?
    let isGenerating: Bool
    let lang: String
    let maxCharacters: Int
    let onUse: () -> Void
    let onRegenerate: (String) -> Void
    let onCancel: () -> Void

    @FocusState private var isEditing: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                VStack(spacing: 8) {
                    Text(L.t("Original sentence:", lang))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $sentence)
                        .focused($isEditing)
                        .frame(minHeight: 60, maxHeight: 100)
                        .padding(8)
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .onChange(of: sentence) { newValue in
                            if newValue.count > maxCharacters {
                                sentence = String(newValue.prefix(maxCharacters))
                            }
                        }
                    Text("\(sentence.count) / \(maxCharacters)")
                        .font(.caption)
                        .foregroundStyle(sentence.count >= maxCharacters ? .red : .secondary)
                }
                .padding(.horizontal)

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
                            onRegenerate(sentence)
                        } label: {
                            Text(L.t("Regenerate", lang))
                                .fontWeight(.medium)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color(.systemGray5))
                                .foregroundStyle(.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(sentence.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
