// Shapes Prisma rows into the flatter JSON the frontend and HTML generators expect.
// Phonemes are stored as one row per unit (see prisma/schema.prisma); these helpers
// turn that back into an ordered array of symbol strings for consumers that don't
// need to know about the underlying table.

export function serializeWord(word) {
  const orderedPhonemes = [...(word.phonemes || [])].sort((a, b) => a.position - b.position);
  return {
    id: word.id,
    activitySetId: word.activitySetId,
    text: word.text,
    hint: word.hint,
    position: word.position,
    phonemes: orderedPhonemes.map((p) => p.symbol),
    createdAt: word.createdAt,
    updatedAt: word.updatedAt,
  };
}

export function serializeActivitySet(set) {
  const orderedWords = [...(set.words || [])].sort((a, b) => a.position - b.position);
  return {
    id: set.id,
    title: set.title,
    type: set.type,
    difficulty: set.difficulty,
    maxGuesses: set.maxGuesses,
    rows: set.rows,
    cols: set.cols,
    showHints: set.showHints,
    theme: set.theme,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
    words: orderedWords.map(serializeWord),
  };
}
