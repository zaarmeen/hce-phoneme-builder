import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validateActivitySetInput, validateWordInput } from "../../../lib/validation";
import { serializeActivitySet, ACTIVITY_SET_INCLUDE } from "../../../lib/serialize";
import { wordCreateData } from "../../../lib/wordData";

// Without this, Next.js can treat this GET handler as static and cache one response
// from build time, when the database isn't even reachable. The list must be live.
export const dynamic = "force-dynamic";

// GET /api/activity-sets: list every saved Wordle/Word Search configuration, each
// with its word list's words and phonemes, most recently updated first.
export async function GET() {
  try {
    const sets = await prisma.activitySet.findMany({
      include: ACTIVITY_SET_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(sets.map(serializeActivitySet));
  } catch (err) {
    console.error("GET /api/activity-sets failed:", err);
    return NextResponse.json({ error: "Failed to load activity sets." }, { status: 500 });
  }
}

// POST /api/activity-sets: create a new activity set.
// - `wordListId` links it to an existing reusable word list (the normal path).
// - `words` (older API shape) creates a new word list named after the activity and
//   links it, so existing API clients keep working.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateActivitySetInput(body);
  const words = Array.isArray(body?.words) ? body.words : [];
  words.forEach((w, i) => {
    validateWordInput(w).forEach((msg) => errors.push(`words[${i}]: ${msg}`));
  });
  if (body?.wordListId && words.length > 0) {
    errors.push("Send either wordListId or words, not both.");
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  const wordListId = body.wordListId ? Number(body.wordListId) : null;
  if (wordListId) {
    const list = await prisma.wordList.findUnique({ where: { id: wordListId } });
    if (!list) {
      return NextResponse.json(
        { error: "Validation failed.", details: [`Word list ${wordListId} does not exist.`] },
        { status: 400 }
      );
    }
  }

  try {
    const created = await prisma.activitySet.create({
      data: {
        title: body.title.trim(),
        type: body.type,
        difficulty: body.difficulty ?? 3,
        maxGuesses: body.type === "WORDLE" ? body.maxGuesses ?? 6 : null,
        rows: body.type === "WORDSEARCH" ? body.rows ?? 10 : null,
        cols: body.type === "WORDSEARCH" ? body.cols ?? 10 : null,
        showHints: body.showHints ?? true,
        theme: body.theme ?? "light",
        ...(wordListId
          ? { wordList: { connect: { id: wordListId } } }
          : words.length > 0
          ? {
              wordList: {
                create: {
                  title: body.title.trim(),
                  words: { create: words.map((w, i) => wordCreateData(w, i)) },
                },
              },
            }
          : {}),
      },
      include: ACTIVITY_SET_INCLUDE,
    });
    return NextResponse.json(serializeActivitySet(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/activity-sets failed:", err);
    return NextResponse.json({ error: "Failed to create activity set." }, { status: 500 });
  }
}
