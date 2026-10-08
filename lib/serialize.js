// Shapes Prisma rows into the flatter JSON the frontend and HTML generators expect.
// Phonemes are stored as one row per unit (see prisma/schema.prisma); these helpers
// turn that back into an ordered array of symbol strings for consumers that don't
// need to know about the underlying table.

// Prisma `include` shapes, shared by every route so each one returns the same JSON.
export const WORD_INCLUDE = { phonemes: true };

export const WORD_LIST_INCLUDE = {
  words: { include: WORD_INCLUDE },
  _count: { select: { activitySets: true } },
};

export const ACTIVITY_SET_INCLUDE = {
  wordList: { include: { words: { include: WORD_INCLUDE } } },
};

function orderedWords(words) {
  return [...(words || [])].sort((a, b) => a.position - b.position || a.id - b.id);
}

export function serializeWord(word) {
  const orderedPhonemes = [...(word.phonemes || [])].sort((a, b) => a.position - b.position);
  return {
    id: word.id,
    wordListId: word.wordListId,
    text: word.text,
    hint: word.hint,
    position: word.position,
    phonemes: orderedPhonemes.map((p) => p.symbol),
    createdAt: word.createdAt,
    updatedAt: word.updatedAt,
  };
}

export function serializeWordList(list) {
  return {
    id: list.id,
    title: list.title,
    // How many activities use this list, so the UI can warn before deleting it.
    activityCount: list._count?.activitySets ?? 0,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    words: orderedWords(list.words).map(serializeWord),
  };
}

// `words` is still returned directly on each activity set (taken from its word list)
// so the builders and HTML generators can keep reading `set.words` unchanged.
export function serializeActivitySet(set) {
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
    wordListId: set.wordListId,
    wordList: set.wordList ? { id: set.wordList.id, title: set.wordList.title } : null,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
    words: orderedWords(set.wordList?.words).map(serializeWord),
  };
}
