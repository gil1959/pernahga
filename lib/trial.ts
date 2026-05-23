import { prisma } from "@/lib/prisma";
import { PLAN_CAPABILITIES, PLAN_CREDITS } from "@/lib/plans";

/**
 * Provision a Trial subscription + default capabilities for a user that
 * doesn't have one yet. Idempotent: if a subscription already exists, it
 * does nothing.
 *
 * Called from:
 *  - /api/auth/register (manual email+phone register)
 *  - /api/auth/phone/verify (Google OAuth + legacy users that verify a
 *    phone number for the first time)
 */
export async function provisionTrial(userId: string): Promise<void> {
  const existing = await prisma.subscription.findFirst({ where: { userId } });
  if (existing) return;

  const trialPkg = await prisma.package.findFirst({
    where: { title: "Trial" },
  });

  // Skip silently if Trial package row hasn't been seeded yet.
  if (!trialPkg) return;

  const cfg = PLAN_CREDITS.Trial;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + (cfg.trialDays ?? 3) * 24 * 60 * 60 * 1000);

  await prisma.subscription.create({
    data: {
      userId,
      packageId: trialPkg.id,
      status: "TRIAL",
      creditsTotal: cfg.monthly,
      creditsUsed: 0,
      startsAt: now,
      endsAt: trialEndsAt,
      trialEndsAt,
      cycleStartAt: now,
      paymentMethod: "trial",
    },
  });

  const caps = PLAN_CAPABILITIES.Trial;
  if (caps.length === 0) return;

  await prisma.userCapability.createMany({
    data: caps.map((channel) => ({
      userId,
      channel,
      enabled: true,
      grantedByPlan: true,
    })),
    skipDuplicates: true,
  });
}
