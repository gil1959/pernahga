import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/me
 *
 * Returns the signed-in user's identity + active subscription + capability
 * matrix. Used by the SaaS dashboard to render usage cards and connect
 * buttons in plan-aware mode.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      phoneVerified: true,
      company: true,
      isBanned: true,
      createdAt: true,
      onboardingDone: true,
      businessName: true,
      personaStyle: true,
      subscription: {
        select: {
          status: true,
          packageId: true,
          creditsTotal: true,
          creditsUsed: true,
          startsAt: true,
          endsAt: true,
          trialEndsAt: true,
          package: { select: { id: true, title: true, price: true } },
        },
      },
      capabilities: { select: { channel: true, enabled: true, grantedByPlan: true } },
      connections: {
        select: { id: true, channel: true, status: true, handle: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // Last 30-day usage aggregate per channel.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const usage = await prisma.usageLog.groupBy({
    by: ["channel"],
    _sum: { credits: true },
    where: { userId: user.id, createdAt: { gte: since } },
  });

  return NextResponse.json({
    user,
    usage: usage.map((u) => ({ channel: u.channel, credits: u._sum.credits || 0 })),
  });
}
