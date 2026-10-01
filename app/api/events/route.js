import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validateEventInput } from "../../../lib/validation";

// POST /api/events — records one observability/usage event (see prisma/schema.prisma's
// Event model). Called from the frontend via lib/trackEvent.js whenever something
// dashboard-worthy happens: an activity set is created, a page is viewed, or an HTML
// activity is generated (successfully or not).
//
// `navigator.sendBeacon` (used by trackEvent when leaving a page) sends its body as
// `text/plain`, not `application/json`, so this route parses the raw body as JSON
// itself rather than relying on a Content-Type check.
export async function POST(request) {
  let body;
  try {
    const raw = await request.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateEventInput(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  try {
    await prisma.event.create({
      data: {
        type: body.type,
        activityType: body.activityType ?? null,
        page: body.page ?? null,
        durationMs: body.durationMs !== undefined && body.durationMs !== null ? Math.round(Number(body.durationMs)) : null,
        reason: body.reason ?? null,
      },
    });
    // 204: the caller (sendBeacon or a fire-and-forget fetch) never reads the body.
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("POST /api/events failed:", err);
    // Analytics failures should never surface as something the user needs to handle.
    return NextResponse.json({ error: "Failed to record event." }, { status: 500 });
  }
}
