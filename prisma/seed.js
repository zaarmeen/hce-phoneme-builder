// Seeds the database with two starter activity sets built from the Assessment 1
// hard-coded corpus (lib/phonemeData.js), so the app has real data to demonstrate
// CRUD against immediately after `npx prisma db seed`, instead of an empty database.

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

async function main() {
  const existing = await prisma.activitySet.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} activity set(s) already exist.`);
    return;
  }

  await prisma.activitySet.create({
    data: {
      title: "Starter Wordle — 3 phoneme words",
      type: "WORDLE",
      difficulty: 3,
      maxGuesses: 6,
      showHints: true,
      theme: "light",
      words: {
        create: WORDLE_SEED_WORDS.map(([text, phonemes], i) => ({
          text,
          position: i,
          phonemes: { create: phonemes.map((symbol, p) => ({ symbol, position: p })) },
        })),
      },
    },
  });

  await prisma.activitySet.create({
    data: {
      title: "Starter Word Search — 5 words",
      type: "WORDSEARCH",
      difficulty: 3,
      rows: 10,
      cols: 10,
      showHints: true,
      theme: "light",
      words: {
        create: WORDSEARCH_SEED_WORDS.map(([text, phonemes], i) => ({
          text,
          position: i,
          phonemes: { create: phonemes.map((symbol, p) => ({ symbol, position: p })) },
        })),
      },
    },
  });

  console.log("Seed complete: 2 activity sets created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
