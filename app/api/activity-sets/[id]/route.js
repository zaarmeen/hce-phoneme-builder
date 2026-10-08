import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { validateActivitySetInput } from "../../../../lib/validation";
import { serializeActivitySet, ACTIVITY_SET_INCLUDE } from "../../../../lib/serialize";

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/activity-sets/:id: fetch one activity set with its word list's words and phonemes.
export async function GET(_request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid activity set id." }, { status: 400 });

  const set = await prisma.activitySet.findUnique({
    where: { id },
    include: ACTIVITY_SET_INCLUDE,
  });
  if (!set) return NextResponse.json({ error: "Activity set not found." }, { status: 404 });

  return NextResponse.json(serializeActivitySet(set));
}

// PUT /api/activity-sets/:id: update activity-level settings (title, difficulty,
// hints, theme, Wordle/Word Search specific fields) and which word list it uses
// (`wordListId`, or null to unlink). Words themselves are edited through
// /api/word-lists/:id/words and /api/words/:id.
export async function PUT(request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid activity set id." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateActivitySetInput(body, { partial: true });
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  const existing = await prisma.activitySet.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Activity set not found." }, { status: 404 });

  if (body.wordListId !== undefined && body.wordListId !== null) {
    const list = await prisma.wordList.findUnique({ where: { id: Number(body.wordListId) } });
    if (!list) {
      return NextResponse.json(
        { error: "Validation failed.", details: [`Word list ${body.wordListId} does not exist.`] },
        { status: 400 }
      );
    }
  }

  const data = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.type !== undefined) data.type = body.type;
  if (body.difficulty !== undefined) data.difficulty = Number(body.difficulty);
  if (body.maxGuesses !== undefined) data.maxGuesses = body.maxGuesses === null ? null : Number(body.maxGuesses);
  if (body.rows !== undefined) data.rows = body.rows === null ? null : Number(body.rows);
  if (body.cols !== undefined) data.cols = body.cols === null ? null : Number(body.cols);
  if (body.showHints !== undefined) data.showHints = body.showHints;
  if (body.theme !== undefined) data.theme = body.theme;
  if (body.wordListId !== undefined) {
    data.wordList =
      body.wordListId === null ? { disconnect: true } : { connect: { id: Number(body.wordListId) } };
  }

  try {
    const updated = await prisma.activitySet.update({
      where: { id },
      data,
      include: ACTIVITY_SET_INCLUDE,
    });
    return NextResponse.json(serializeActivitySet(updated));
  } catch (err) {
    console.error(`PUT /api/activity-sets/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to update activity set." }, { status: 500 });
  }
}

// DELETE /api/activity-sets/:id: deletes the activity only. Its word list (and the
// words in it) are kept, because other activities may still be using them.
export async function DELETE(_request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid activity set id." }, { status: 400 });

  const existing = await prisma.activitySet.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Activity set not found." }, { status: 404 });

  try {
    await prisma.activitySet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/activity-sets/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to delete activity set." }, { status: 500 });
  }
}
