// Turns validated word input ({ text, hint, phonemes }) into the nested Prisma
// `create` data for a Word and its ordered Phoneme rows. Shared by every route that
// creates words so they are always stored the same way.
export function wordCreateData(word, fallbackPosition) {
  return {
    text: word.text.trim(),
    hint: word.hint ?? null,
    position: word.position ?? fallbackPosition,
    phonemes: {
      create: word.phonemes.map((symbol, i) => ({ symbol, position: i })),
    },
  };
}
