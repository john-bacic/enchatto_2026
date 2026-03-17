import SwiftUI

struct EmojifyrSentenceInputView: View {
    let lang: String
    let onSubmit: (String) -> Void
    let onCancel: () -> Void

    @State private var sentence = ""
    @FocusState private var isFocused: Bool

    private let maxCharacters = 80

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text(L.t("Write a sentence for Emojifyr", lang))
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.top, 24)

                Text(L.t("Use a short, visual sentence that can be turned into emojis.", lang))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                VStack(alignment: .trailing, spacing: 6) {
                    TextEditor(text: $sentence)
                        .focused($isFocused)
                        .frame(minHeight: 100, maxHeight: 160)
                        .padding(8)
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
                        )
                        .onChange(of: sentence) { newValue in
                            if newValue.count > maxCharacters {
                                sentence = String(newValue.prefix(maxCharacters))
                            }
                        }

                    Text("\(sentence.count) / \(maxCharacters)")
                        .font(.caption)
                        .foregroundStyle(sentence.count > maxCharacters ? .red : .secondary)
                }
                .padding(.horizontal)

                Button {
                    onSubmit(sentence.trimmingCharacters(in: .whitespacesAndNewlines))
                } label: {
                    Text(L.t("Generate Emojis", lang))
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(canSubmit ? Color.purple : Color.gray.opacity(0.3))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(!canSubmit)
                .padding(.horizontal)

                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L.t("Cancel", lang)) {
                        onCancel()
                    }
                }
            }
            .onAppear {
                isFocused = true
            }
        }
    }

    private var canSubmit: Bool {
        let trimmed = sentence.trimmingCharacters(in: .whitespacesAndNewlines)
        return !trimmed.isEmpty && sentence.count <= maxCharacters
    }
}
