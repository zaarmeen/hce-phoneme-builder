import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validateActivitySetInput, validateWordInput } from "../../../lib/validation";
import { serializeActivitySet } from "../../../lib/serialize";

// GET /api/activity-sets — list every saved Wordle/Word Search configuration,
// each with its words and phonemes, most recently updated first.
export async function GET() {
  try {
    const sets = await prisma.activitySet.findMany({
      include: { words: { include: { phonemes: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(sets.map(serializeActivitySet));
  } catch (err) {
    console.error("GET /api/activity-sets failed:", err);
    return NextResponse.json({ error: "Failed to load activity sets." }, { status: 500 });
  }
}

// POST /api/activity-sets — create a new activity set. `words` is optional; each
// entry is validated the same way a standalone word would be via the words sub-route.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateActivitySetInput(body);
  const words = Array.isArray(body.words) ? body.words : [];
  words.forEach((w, i) => {
    validateWordInput(w).forEach((msg) => errors.push(`words[${i}]: ${msg}`));
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
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
        words: {
          create: words.map((w, i) => ({
            text: w.text.trim(),
            hint: w.hint ?? null,
            position: w.position ?? i,
            phonemes: {
              create: w.phonemes.map((symbol, pIndex) => ({ symbol, position: pIndex })),
            },
          })),
        },
      },
      include: { words: { include: { phonemes: true } } },
    });
    return NextResponse.json(serializeActivitySet(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/activity-sets failed:", err);
    return NextResponse.json({ error: "Failed to create activity set." }, { status: 500 });
  }
}
