import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { labelForTask } from "@/lib/credit-labels";

/**
 * GET /api/user/usage-feed
 * Real-time recent usage history for the authenticated user.
 * Returns last 30 entries with friendly task labels (no token/USD exposure).
 *
 * LOCKED v1.0 (2026-05-23) — backs the dashboard "Aktivitas Kredit" panel.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));

  const [logs, sub] = await Promise.all([
    prisma.usageLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        channel: true,
        credits: true,
        taskType: true,
        createdAt: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { creditsTotal: true, creditsUsed: true, creditsResetAt: true, status: true },
    }),
  ]);

  return NextResponse.json({
    subscription: sub,
    logs: logs.map((l) => ({
      id: l.id,
      label: labelForTask(l.taskType),
      channel: l.channel,
      credits: l.credits,
      at: l.createdAt,
    })),
  });
}
