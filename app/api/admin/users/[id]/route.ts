import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { CapabilityChannel, SubscriptionStatus } from "@prisma/client";
import { PLAN_CAPABILITIES, PLAN_CREDITS, isPlanKey } from "@/lib/plans";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/**
 * GET /api/admin/users/[id]
 *
 * Returns full user dossier: identity, subscription, capabilities,
 * connection requests, recent usage logs.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: { include: { package: true } },
      capabilities: true,
      connections: { orderBy: { createdAt: "desc" } },
      usageLogs: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { consultations: true, testimonials: true, usageLogs: true } },
    },
  });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const allPackages = await prisma.package.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true, price: true, isActive: true },
  });

  return NextResponse.json({ user, allPackages });
}

/**
 * PATCH /api/admin/users/[id]
 *
 * Multi-purpose admin actions on a user:
 *  - body.action = "set_plan"            { packageId, status?, endsAt? }
 *  - body.action = "toggle_capability"   { channel, enabled }
 *  - body.action = "set_ban"             { isBanned, reason? }
 *  - body.action = "set_credits"         { creditsTotal?, creditsUsed?, creditsResetAt? }
 *  - body.action = "update_profile"      { name?, email?, phone?, company? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as string;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

  try {
    switch (action) {
      case "set_plan": {
        const packageId = String(body.packageId || "");
        const pkg = await prisma.package.findUnique({ where: { id: packageId } });
        if (!pkg) return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });

        const status: SubscriptionStatus = (body.status as SubscriptionStatus) || "ACTIVE";
        const endsAt: Date | null = body.endsAt ? new Date(body.endsAt) : null;

        // Build capability set from plan defaults.
        const planTitle = pkg.title as string;
        const grantedCaps: CapabilityChannel[] = isPlanKey(planTitle)
          ? PLAN_CAPABILITIES[planTitle]
          : [];
        const credits = isPlanKey(planTitle) ? PLAN_CREDITS[planTitle].monthly : pkg.monthlyCredits || 0;

        await prisma.$transaction(async (tx) => {
          await tx.subscription.upsert({
            where: { userId: user.id },
            update: {
              packageId,
              status,
              endsAt,
              creditsTotal: credits,
              // creditsUsed reset only when admin chooses; default keep
            },
            create: {
              userId: user.id,
              packageId,
              status,
              endsAt,
              creditsTotal: credits,
              creditsUsed: 0,
              startsAt: new Date(),
              paymentMethod: "manual",
            },
          });

          // Mark grantedByPlan for relevant capabilities; do NOT auto-disable
          // ones already enabled by previous admin action.
          const existingCaps = await tx.userCapability.findMany({ where: { userId: user.id } });
          const existingMap = new Map(existingCaps.map((c) => [c.channel, c]));

          for (const ch of grantedCaps) {
            if (existingMap.has(ch)) {
              await tx.userCapability.update({
                where: { userId_channel: { userId: user.id, channel: ch } },
                data: { grantedByPlan: true },
              });
            } else {
              await tx.userCapability.create({
                data: { userId: user.id, channel: ch, enabled: false, grantedByPlan: true },
              });
            }
          }
          // Capabilities not in new plan: keep, but mark grantedByPlan=false.
          for (const c of existingCaps) {
            if (!grantedCaps.includes(c.channel)) {
              await tx.userCapability.update({
                where: { userId_channel: { userId: user.id, channel: c.channel } },
                data: { grantedByPlan: false, enabled: false },
              });
            }
          }
        });

        return NextResponse.json({ ok: true, message: `Paket diubah ke ${pkg.title}` });
      }

      case "toggle_capability": {
        const channel = body.channel as CapabilityChannel;
        const enabled = Boolean(body.enabled);
        if (!channel) return NextResponse.json({ message: "Channel tidak valid" }, { status: 400 });
        await prisma.userCapability.upsert({
          where: { userId_channel: { userId: user.id, channel } },
          update: { enabled },
          create: { userId: user.id, channel, enabled, grantedByPlan: false },
        });
        return NextResponse.json({ ok: true });
      }

      case "set_ban": {
        const isBanned = Boolean(body.isBanned);
        const reason = body.reason ? String(body.reason) : null;
        await prisma.user.update({
          where: { id: user.id },
          data: { isBanned, bannedReason: isBanned ? reason : null },
        });
        return NextResponse.json({ ok: true });
      }

      case "set_credits": {
        const data: { creditsTotal?: number; creditsUsed?: number; creditsResetAt?: Date } = {};
        if (typeof body.creditsTotal === "number") data.creditsTotal = body.creditsTotal;
        if (typeof body.creditsUsed === "number") data.creditsUsed = body.creditsUsed;
        if (body.creditsResetAt) data.creditsResetAt = new Date(body.creditsResetAt);
        await prisma.subscription.update({
          where: { userId: user.id },
          data,
        });
        return NextResponse.json({ ok: true });
      }

      case "update_profile": {
        const data: { name?: string; email?: string; phone?: string; company?: string | null } = {};
        if (body.name !== undefined) data.name = String(body.name);
        if (body.email !== undefined) data.email = String(body.email).toLowerCase();
        if (body.phone !== undefined) data.phone = String(body.phone);
        if (body.company !== undefined) data.company = body.company ? String(body.company) : null;
        await prisma.user.update({ where: { id: user.id }, data });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ message: "Action tidak dikenal" }, { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memproses";
    console.error("admin/users/[id] PATCH error:", err);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — soft cleanup (ban) preferred, hard delete cascades */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ message: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
