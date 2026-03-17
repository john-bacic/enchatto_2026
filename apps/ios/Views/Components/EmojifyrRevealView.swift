import SwiftUI

struct EmojifyrRevealView: View {
    let emojiClue: String
    let originalSentence: String
    let guesses: [EmojifyrGuess]
    let participants: [Participant]
    let isHost: Bool
    let lang: String
    let onNextRound: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    HStack(spacing: 6) {
                        Text("\u{1F3AE}")
                        Text(L.t("Emojifyr Result", lang))
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .padding(.top, 20)

                    // Emoji clue
                    VStack(spacing: 6) {
                        Text(L.t("Emoji clue:", lang))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(emojiClue)
                            .font(.system(size: 48))
                            .multilineTextAlignment(.center)
                    }

                    // Original sentence
                    VStack(spacing: 6) {
                        Text(L.t("Original sentence", lang))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(originalSentence)
                            .font(.title3)
                            .fontWeight(.medium)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.purple.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)

                    // Guesses
                    if !guesses.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(L.t("Guesses:", lang))
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(guesses) { guess in
                                HStack(spacing: 10) {
                                    let participant = participants.first { $0.id == guess.participantId }
                                    Text(participant?.avatarEmoji ?? "\u{1F464}")
                                        .font(.title3)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(participant?.nickname ?? L.t("Unknown", lang))
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Text(guess.guessText)
                                            .font(.body)
                                    }
                                    Spacer()
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 6)
                            }
                        }
                    }

                    Spacer(minLength: 20)

                    // Buttons
                    VStack(spacing: 12) {
                        if isHost {
                            Button {
                                onNextRound()
                            } label: {
                                Text(L.t("Next Round", lang))
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color.purple)
                                    .foregroundStyle(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }

                        Button {
                            onDismiss()
                        } label: {
                            Text(L.t("Continue", lang))
                                .fontWeight(.medium)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color(.systemGray5))
                                .foregroundStyle(.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
