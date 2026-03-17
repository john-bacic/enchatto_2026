import SwiftUI

struct EmojifyrGuessView: View {
    let emojiClue: String
    let guessCount: Int
    let lang: String
    let onSubmitGuess: (String) -> Void

    @State private var guessText = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 20) {
            Text(L.t("What does this mean?", lang))
                .font(.title3)
                .fontWeight(.bold)
                .padding(.top, 24)

            Text(emojiClue)
                .font(.system(size: 56))
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if guessCount > 0 {
                Text("\(guessCount) \(guessCount == 1 ? "guess" : "guesses")")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 10) {
                TextField(L.t("Type your guess...", lang), text: $guessText)
                    .focused($isFocused)
                    .textFieldStyle(.roundedBorder)

                Button {
                    let trimmed = guessText.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !trimmed.isEmpty else { return }
                    onSubmitGuess(trimmed)
                    guessText = ""
                } label: {
                    Text(L.t("Submit Guess", lang))
                        .fontWeight(.semibold)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(guessText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.gray.opacity(0.3) : Color.purple)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(guessText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(.horizontal)

            Spacer()
        }
        .onAppear {
            isFocused = true
        }
    }
}
