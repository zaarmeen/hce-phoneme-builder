import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { validateWordInput } from "../../../../../lib/validation";
import { serializeWord, WORD_INCLUDE } from "../../../../../lib/serialize";
import { wordCreateData } from "../../../../../lib/wordData";

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /api/word-lists/:id/words: add a phoneme word to a word list. Every activity
// using this list picks the new word up automatically.
export async function POST(request, { params }) {
  const wordListId = parseId(params.id);
  if (!wordListId) return NextResponse.json({ error: "Invalid word list id." }, { status: 400 });

  const list = await prisma.wordList.findUnique({ where: { id: wordListId } });
  if (!list) return NextResponse.json({ error: "Word list not found." }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateWordInput(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  try {
    const wordCount = await prisma.word.count({ where: { wordListId } });
    const created = await prisma.word.create({
      data: { wordListId, ...wordCreateData(body, wordCount) },
      include: WORD_INCLUDE,
    });
    // Touch the list so "most recently updated" ordering reflects the new word.
    await prisma.wordList.update({ where: { id: wordListId }, data: { updatedAt: new Date() } });
    return NextResponse.json(serializeWord(created), { status: 201 });
  } catch (err) {
    console.error(`POST /api/word-lists/${wordListId}/words failed:`, err);
    return NextResponse.json({ error: "Failed to add word." }, { status: 500 });
  }
}
