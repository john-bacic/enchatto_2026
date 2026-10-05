/**
 * A shuffled copy of a list (Fisher-Yates); the list it is given is left as it was. Math.random is drawn once
 * for every place but the first, from the last place down, so a list of n takes n - 1 draws. Tests replace
 * Math.random with a fixed sequence to get a known board, deck or team split, and they depend on that order.
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
