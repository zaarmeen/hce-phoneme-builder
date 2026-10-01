import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Without this, Next.js statically optimizes this route at build time (it reads no
// request data), caching one frozen snapshot of the dashboard forever instead of
// querying the database on every request. Observability data must always be live.
export const dynamic = "force-dynamic";

// GET /api/dashboard — aggregates the Event log and current ActivitySet/Word rows
// into the operational summary the /dashboard page displays: how many activities
// exist per type, generation success/failure counts, average time on page, the
// most-used activity type, and a short list of things that need attention (empty
// word lists, recent generation failures). Everything here is computed on demand
// from existing rows rather than maintained as separately-updated counters, so the
// numbers can never drift out of sync with the underlying data.
export async function GET() {
  try {
    const [
      activitySetsByType,
      totalWords,
      generationSuccessCount,
      generationFailureCount,
      pageViewAgg,
      activityTypeUsage,
      recentFailures,
      emptyActivitySets,
    ] = await Promise.all([
      prisma.activitySet.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.word.count(),
      prisma.event.count({ where: { type: "GENERATION_SUCCESS" } }),
      prisma.event.count({ where: { type: "GENERATION_FAILURE" } }),
      prisma.event.aggregate({
        where: { type: "PAGE_VIEW", durationMs: { not: null } },
        _avg: { durationMs: true },
        _count: { _all: true },
      }),
      prisma.event.groupBy({
        by: ["activityType"],
        where: { type: "GENERATION_SUCCESS", activityType: { not: null } },
        _count: { _all: true },
      }),
      prisma.event.findMany({
        where: { type: "GENERATION_FAILURE" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.activitySet.findMany({
        where: { words: { none: {} } },
        select: { id: true, title: true, type: true },
      }),
    ]);

    const countsByType = Object.fromEntries(
      activitySetsByType.map((row) => [row.type, row._count._all])
    );

    const mostUsedActivityType =
      activityTypeUsage.length === 0
        ? null
        : activityTypeUsage.reduce((best, row) =>
            row._count._all > (best?._count._all ?? -1) ? row : best
          , null)?.activityType ?? null;

    const alerts = [
      ...emptyActivitySets.map((s) => ({
        level: "warning",
        message: `"${s.title}" (${s.type === "WORDLE" ? "Wordle" : "Word Search"}) has no words yet.`,
      })),
      ...recentFailures.map((f) => ({
        level: "error",
        message: `Generation failed${f.reason ? `: ${f.reason.replace(/_/g, " ")}` : ""} at ${f.createdAt.toISOString()}.`,
      })),
    ];

    return NextResponse.json({
      activitySetsCreated: {
        wordle: countsByType.WORDLE ?? 0,
        wordsearch: countsByType.WORDSEARCH ?? 0,
        total: (countsByType.WORDLE ?? 0) + (countsByType.WORDSEARCH ?? 0),
      },
      totalWords,
      generation: {
        success: generationSuccessCount,
        failure: generationFailureCount,
        successRate:
          generationSuccessCount + generationFailureCount === 0
            ? null
            : generationSuccessCount / (generationSuccessCount + generationFailureCount),
      },
      averageTimeOnPageMs: pageViewAgg._avg.durationMs,
      pageViewCount: pageViewAgg._count._all,
      mostUsedActivityType,
      alerts,
    });
  } catch (err) {
    console.error("GET /api/dashboard failed:", err);
    return NextResponse.json({ error: "Failed to load dashboard data." }, { status: 500 });
  }
}
