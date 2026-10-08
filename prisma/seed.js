// Seeds the database with two starter word lists and three activities built from the
// Assessment 1 hard-coded corpus (lib/phonemeData.js), so the app has real data to
// demonstrate CRUD against immediately after `npx prisma db seed`, instead of an
// empty database.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Small hand-picked slice of the old WORD_BANK[3] and WORD_SEARCH_DEFAULT lists —
// enough to demonstrate the workflow without duplicating the entire corpus here.
const WORDLE_SEED_WORDS = [
  ["bed", ["b", "e", "d"]],
  ["bike", ["b", "ɑe", "k"]],
  ["chin", ["tʃ", "ɪ", "n"]],
  ["ship", ["ʃ", "ɪ", "p"]],
  ["ring", ["ɹ", "ɪ", "ŋ"]],
];

const WORDSEARCH_SEED_WORDS = [
  ["chin", ["tʃ", "ɪ", "n"]],
  ["bait", ["b", "æɪ", "t"]],
  ["jam", ["dʒ", "æ", "m"]],
  ["ring", ["ɹ", "ɪ", "ŋ"]],
  ["boot", ["b", "ʉː", "t"]],
];

function toWordRows(words) {
  return words.map(([text, phonemes], i) => ({
    text,
    position: i,
    phonemes: { create: phonemes.map((symbol, p) => ({ symbol, position: p })) },
  }));
}

async function main() {
  const [existingSets, existingLists] = await Promise.all([
    prisma.activitySet.count(),
    prisma.wordList.count(),
  ]);
  if (existingSets > 0 || existingLists > 0) {
    console.log(
      `Skipping seed: ${existingLists} word list(s) and ${existingSets} activity set(s) already exist.`
    );
    return;
  }

  // Two reusable word lists...
  const wordleList = await prisma.wordList.create({
    data: {
      title: "Starter 3-phoneme words",
      words: { create: toWordRows(WORDLE_SEED_WORDS) },
    },
  });
  const wordSearchList = await prisma.wordList.create({
    data: {
      title: "Starter word search words",
      words: { create: toWordRows(WORDSEARCH_SEED_WORDS) },
    },
  });

  // ...and three activities. The first and third share one list, showing a single
  // word list reused by both a Wordle and a Word Search.
  await prisma.activitySet.create({
    data: {
      title: "Starter Wordle: 3 phoneme words",
      type: "WORDLE",
      difficulty: 3,
      maxGuesses: 6,
      showHints: true,
      theme: "light",
      wordListId: wordleList.id,
    },
  });

  await prisma.activitySet.create({
    data: {
      title: "Starter Word Search: 5 words",
      type: "WORDSEARCH",
      difficulty: 3,
      rows: 10,
      cols: 10,
      showHints: true,
      theme: "light",
      wordListId: wordSearchList.id,
    },
  });

  await prisma.activitySet.create({
    data: {
      title: "Starter Word Search: 3 phoneme words",
      type: "WORDSEARCH",
      difficulty: 3,
      rows: 8,
      cols: 8,
      showHints: true,
      theme: "light",
      wordListId: wordleList.id,
    },
  });

  console.log("Seed complete: 2 word lists and 3 activity sets created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
