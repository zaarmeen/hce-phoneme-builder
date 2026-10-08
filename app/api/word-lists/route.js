import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validateWordListInput, validateWordInput } from "../../../lib/validation";
import { serializeWordList, WORD_LIST_INCLUDE } from "../../../lib/serialize";
import { wordCreateData } from "../../../lib/wordData";

export const dynamic = "force-dynamic";

// GET /api/word-lists: every reusable word list with its words and phonemes, plus
// how many activities use each one. Most recently updated first.
export async function GET() {
  try {
    const lists = await prisma.wordList.findMany({
      include: WORD_LIST_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(lists.map(serializeWordList));
  } catch (err) {
    console.error("GET /api/word-lists failed:", err);
    return NextResponse.json({ error: "Failed to load word lists." }, { status: 500 });
  }
}

// POST /api/word-lists: create a word list. `words` is optional and validated the
// same way as a word added later through /api/word-lists/:id/words.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateWordListInput(body);
  const words = Array.isArray(body?.words) ? body.words : [];
  words.forEach((w, i) => {
    validateWordInput(w).forEach((msg) => errors.push(`words[${i}]: ${msg}`));
  });
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  try {
    const created = await prisma.wordList.create({
      data: {
        title: body.title.trim(),
        words: { create: words.map((w, i) => wordCreateData(w, i)) },
      },
      include: WORD_LIST_INCLUDE,
    });
    return NextResponse.json(serializeWordList(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/word-lists failed:", err);
    return NextResponse.json({ error: "Failed to create word list." }, { status: 500 });
  }
}
