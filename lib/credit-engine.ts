/**
 * Credit Engine — LOCKED v1.0 (2026-05-23)
 *
 * System: real cost AI tracking (Cara 2)
 *   1 kredit = $0.001 USD (≈ Rp 16-17)
 *   kreditConsumed = ceil(realCostUSD / 0.001)
 *
 * Source of truth: MEMORY.md "Sistem Kredit LOCKED v1.0".
 * Pega Engine (Pega 2) calls these helpers when handling user-customer chats,
 * post generation, image gen, etc. Subscription is the per-user wallet.
 *
 * Anti-abuse rules (LOCKED):
 *   - Rate limit: max 10 task per minute per user
 *   - Daily soft cap: max 30% of cycle credits per day (warning, not hard block)
 *   - Hard ceiling: 402 when creditsUsed + projectedCost > creditsTotal
 *   - Alert at 80% via WA notification (separate cron, not here)
 */
import { prisma } from "@/lib/prisma";

/** $1 = ? credits. 1 kredit = $0.001 USD. */
export const CREDIT_USD_RATE = 0.001;

/** Free-tier task minimum charge to keep accountability. */
export const MIN_CHARGE = 1;

/** Stable task identifiers — UI labels live in lib/credit-labels.ts. */
export type TaskType =
  | "wa_reply"
  | "ig_dm_reply"
  | "tg_reply"
  | "email_reply"
  | "discord_reply"
  | "caption_gen"
  | "post_publish"
  | "image_gen"
  | "video_script"
  | "daily_briefing"
  | "lead_tag"
  | "booking"
  | "webhook_event"
  | "other";

/** Convert real USD cost to kredit (ceil to whole credit, min MIN_CHARGE). */
export function usdToCredits(costUsd: number): number {
  if (!Number.isFinite(costUsd) || costUsd <= 0) return MIN_CHARGE;
  return Math.max(MIN_CHARGE, Math.ceil(costUsd / CREDIT_USD_RATE));
}

/** Rate limit window helper. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

export class CreditError extends Error {
  status: number;
  code: "no_subscription" | "insufficient_credits" | "rate_limited" | "blocked";
  meta?: Record<string, unknown>;
  constructor(
    code: CreditError["code"],
    message: string,
    status = 402,
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

export interface ChargeInput {
  userId: string;
  taskType: TaskType;
  channel: string; // free-form, e.g. "whatsapp", "image_gen"
  /** Real AI cost in USD (from 9Router usageHistory). 0 = free task (still charges MIN). */
  costUsd?: number;
  /** Override credit amount instead of computing from cost. */
  creditsOverride?: number;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  meta?: Record<string, unknown>;
}

export interface ChargeResult {
  credits: number;
  creditsRemaining: number;
  creditsTotal: number;
  logId: string;
}

/**
 * Pre-flight check: call this BEFORE invoking the AI / 3rd-party API.
 * Verifies subscription is healthy and has at least 1 credit headroom.
 * Throws CreditError on failure (caller should return 402).
 */
export async function ensureBudget(userId: string): Promise<{
  subscription: NonNullable<Awaited<ReturnType<typeof prisma.subscription.findUnique>>>;
}> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    throw new CreditError("no_subscription", "Belum ada langganan aktif", 402);
  }
  if (sub.status === "EXPIRED" || sub.status === "DORMANT" || sub.status === "CANCELLED") {
    throw new CreditError("blocked", "Langganan tidak aktif", 402, { status: sub.status });
  }
  if (sub.creditsUsed >= sub.creditsTotal) {
    throw new CreditError(
      "insufficient_credits",
      "Kredit Anda habis untuk cycle ini",
      402,
      {
        creditsTotal: sub.creditsTotal,
        creditsUsed: sub.creditsUsed,
        resetAt: sub.creditsResetAt,
      }
    );
  }

  // Rate limit: max RATE_LIMIT_MAX tasks per RATE_LIMIT_WINDOW_MS.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.usageLog.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT_MAX) {
    throw new CreditError(
      "rate_limited",
      "Terlalu banyak permintaan dalam 1 menit, coba beberapa detik lagi",
      429,
      { window: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX }
    );
  }
  return { subscription: sub };
}

/**
 * Post-flight charge: call this AFTER the AI / task completes successfully.
 * Atomically increments creditsUsed and creates a UsageLog row.
 * Returns the actual credits charged + remaining balance.
 */
export async function chargeCredits(input: ChargeInput): Promise<ChargeResult> {
  const credits =
    typeof input.creditsOverride === "number" && input.creditsOverride >= 0
      ? Math.max(MIN_CHARGE, Math.ceil(input.creditsOverride))
      : usdToCredits(input.costUsd ?? 0);

  // Atomic update + log creation in a single transaction.
  const result = await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { userId: input.userId },
    });
    if (!sub) {
      throw new CreditError("no_subscription", "Belum ada langganan aktif", 402);
    }

    const newUsed = sub.creditsUsed + credits;
    if (newUsed > sub.creditsTotal) {
      // Edge case: budget changed between ensureBudget() and chargeCredits().
      throw new CreditError(
        "insufficient_credits",
        "Kredit habis selama proses, task tidak di-charge",
        402,
        {
          creditsTotal: sub.creditsTotal,
          creditsUsed: sub.creditsUsed,
          requested: credits,
        }
      );
    }

    const updated = await tx.subscription.update({
      where: { userId: input.userId },
      data: { creditsUsed: { increment: credits } },
    });
    const log = await tx.usageLog.create({
      data: {
        userId: input.userId,
        channel: input.channel,
        credits,
        taskType: input.taskType,
        costUsd: input.costUsd ?? null,
        tokensIn: input.tokensIn ?? null,
        tokensOut: input.tokensOut ?? null,
        model: input.model ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
    return { updated, logId: log.id };
  });

  return {
    credits,
    creditsRemaining: result.updated.creditsTotal - result.updated.creditsUsed,
    creditsTotal: result.updated.creditsTotal,
    logId: result.logId,
  };
}

/**
 * One-shot helper: ensure budget + charge. Use only when AI cost is known
 * upfront (e.g. flat-priced action like Pollinations image gen).
 *
 * Note: for AI calls with variable cost, prefer the explicit pattern:
 *   await ensureBudget(userId) -> call AI -> chargeCredits({ costUsd })
 */
export async function spendCredits(input: ChargeInput): Promise<ChargeResult> {
  await ensureBudget(input.userId);
  return chargeCredits(input);
}

/**
 * Refresh credit cycle for a single user. Idempotent — safe to call from cron
 * even if not yet due. Returns true if a refresh actually happened.
 */
export async function refreshCycleIfDue(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { package: true },
  });
  if (!sub) return false;
  // Skip Trial / EXPIRED / CANCELLED / DORMANT.
  if (sub.status === "TRIAL" || sub.status === "EXPIRED" || sub.status === "DORMANT" || sub.status === "CANCELLED") {
    return false;
  }
  const now = new Date();
  if (!sub.creditsResetAt || sub.creditsResetAt > now) return false;

  const refreshDays = sub.package.creditsRefreshDays || 30;
  const monthlyCredits = sub.package.monthlyCredits || sub.creditsTotal;

  await prisma.subscription.update({
    where: { userId },
    data: {
      creditsUsed: 0,
      creditsTotal: monthlyCredits,
      creditsResetAt: new Date(now.getTime() + refreshDays * 24 * 60 * 60 * 1000),
      cycleStartAt: now,
      lastRefreshAt: now,
    },
  });
  return true;
}

/**
 * Bulk refresh: scan all subscriptions whose cycle is due. Used by Vercel cron.
 * Returns how many were refreshed.
 */
export async function refreshDueCycles(): Promise<number> {
  const now = new Date();
  const due = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "PAST_DUE"] },
      creditsResetAt: { lte: now },
    },
    select: { userId: true },
  });
  let refreshed = 0;
  for (const { userId } of due) {
    if (await refreshCycleIfDue(userId)) refreshed++;
  }
  return refreshed;
}
