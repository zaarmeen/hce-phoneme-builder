import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { validateWordListInput } from "../../../../lib/validation";
import { serializeWordList, WORD_LIST_INCLUDE } from "../../../../lib/serialize";

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/word-lists/:id: one word list with its words and phonemes.
export async function GET(_request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid word list id." }, { status: 400 });

  const list = await prisma.wordList.findUnique({ where: { id }, include: WORD_LIST_INCLUDE });
  if (!list) return NextResponse.json({ error: "Word list not found." }, { status: 404 });

  return NextResponse.json(serializeWordList(list));
}

// PUT /api/word-lists/:id: rename a word list. Words are changed through
// /api/word-lists/:id/words and /api/words/:id.
export async function PUT(request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid word list id." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateWordListInput(body, { partial: true });
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  const existing = await prisma.wordList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Word list not found." }, { status: 404 });

  try {
    const updated = await prisma.wordList.update({
      where: { id },
      data: body.title !== undefined ? { title: body.title.trim() } : {},
      include: WORD_LIST_INCLUDE,
    });
    return NextResponse.json(serializeWordList(updated));
  } catch (err) {
    console.error(`PUT /api/word-lists/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to update word list." }, { status: 500 });
  }
}

// DELETE /api/word-lists/:id: deletes the list and its words (cascade). Activities
// that used it are kept, with no word list, until a teacher picks another one.
export async function DELETE(_request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid word list id." }, { status: 400 });

  const existing = await prisma.wordList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Word list not found." }, { status: 404 });

  try {
    await prisma.wordList.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/word-lists/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to delete word list." }, { status: 500 });
  }
}
