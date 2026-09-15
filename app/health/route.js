import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// GET /health — used by the assessment demo and by Docker's HEALTHCHECK to confirm
// the app is up and can actually reach the database, not just that Next.js is running.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" }, { status: 200 });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
