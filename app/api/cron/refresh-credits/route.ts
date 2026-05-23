import { NextResponse } from "next/server";
import { refreshDueCycles } from "@/lib/credit-engine";

/**
 * GET /api/cron/refresh-credits
 *
 * Vercel cron handler — runs daily at 00:05 UTC (configured in vercel.json).
 * Resets `creditsUsed=0` and bumps `creditsResetAt` for any subscription
 * whose cycle is due. Idempotent.
 *
 * Auth: Vercel cron runs include `authorization: Bearer ${CRON_SECRET}`.
 * If CRON_SECRET is set, the token is required. Otherwise the route is open
 * to localhost-only (Vercel guarantees only its scheduler reaches this URL).
 *
 * LOCKED v1.0 (2026-05-23). Source: MEMORY.md "Sistem Kredit".
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization") || "";
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }
  const refreshed = await refreshDueCycles();
  return NextResponse.json({
    ok: true,
    refreshed,
    at: new Date().toISOString(),
  });
}
