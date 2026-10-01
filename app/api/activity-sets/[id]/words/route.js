import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { validateWordInput } from "../../../../../lib/validation";
import { serializeWord } from "../../../../../lib/serialize";

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /api/activity-sets/:id/words — add a new phoneme word to an existing activity set.
export async function POST(request, { params }) {
  const activitySetId = parseId(params.id);
  if (!activitySetId) {
    return NextResponse.json({ error: "Invalid activity set id." }, { status: 400 });
  }

  const set = await prisma.activitySet.findUnique({ where: { id: activitySetId } });
  if (!set) return NextResponse.json({ error: "Activity set not found." }, { status: 404 });

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
    const wordCount = await prisma.word.count({ where: { activitySetId } });
    const created = await prisma.word.create({
      data: {
        activitySetId,
        text: body.text.trim(),
        hint: body.hint ?? null,
        position: body.position ?? wordCount,
        phonemes: {
          create: body.phonemes.map((symbol, i) => ({ symbol, position: i })),
        },
      },
      include: { phonemes: true },
    });
    return NextResponse.json(serializeWord(created), { status: 201 });
  } catch (err) {
    console.error(`POST /api/activity-sets/${activitySetId}/words failed:`, err);
    return NextResponse.json({ error: "Failed to add word." }, { status: 500 });
  }
}
