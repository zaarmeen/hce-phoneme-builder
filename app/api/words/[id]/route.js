import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { validateWordInput } from "../../../../lib/validation";
import { serializeWord } from "../../../../lib/serialize";

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT /api/words/:id — update a word's text, hint, position, and/or phoneme sequence.
// Sending `phonemes` replaces the word's whole phoneme sequence (simplest correct
// behaviour for a small, fixed-size sequence like this rather than diffing it).
export async function PUT(request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid word id." }, { status: 400 });

  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Word not found." }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateWordInput(body, { partial: true });
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  const data = {};
  if (body.text !== undefined) data.text = body.text.trim();
  if (body.hint !== undefined) data.hint = body.hint;
  if (body.position !== undefined) data.position = Number(body.position);
  if (body.phonemes !== undefined) {
    data.phonemes = {
      deleteMany: {},
      create: body.phonemes.map((symbol, i) => ({ symbol, position: i })),
    };
  }

  try {
    const updated = await prisma.word.update({
      where: { id },
      data,
      include: { phonemes: true },
    });
    return NextResponse.json(serializeWord(updated));
  } catch (err) {
    console.error(`PUT /api/words/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to update word." }, { status: 500 });
  }
}

// DELETE /api/words/:id — remove a word (and its phonemes, via cascade).
export async function DELETE(_request, { params }) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid word id." }, { status: 400 });

  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Word not found." }, { status: 404 });

  try {
    await prisma.word.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/words/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to delete word." }, { status: 500 });
  }
}
