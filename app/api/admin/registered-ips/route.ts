import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/** GET /api/admin/registered-ips — list of registered IPs + first user. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const rows = await prisma.registeredIp.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  // Hydrate user names manually (no relation defined to keep schema simple).
  const userIds = Array.from(new Set(rows.map((r) => r.userId).filter(Boolean) as string[]));
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));
  return NextResponse.json(
    rows.map((r) => ({ ...r, user: r.userId ? userMap.get(r.userId) || null : null }))
  );
}

/** POST { ip, isWhitelist?, notes? } — create or update an IP entry. */
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const ip = String(body.ip || "").trim();
  if (!ip) return NextResponse.json({ message: "IP wajib diisi" }, { status: 400 });

  const row = await prisma.registeredIp.upsert({
    where: { ip },
    update: {
      isWhitelist: body.isWhitelist !== undefined ? Boolean(body.isWhitelist) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
    },
    create: {
      ip,
      isWhitelist: Boolean(body.isWhitelist),
      notes: body.notes ? String(body.notes) : null,
    },
  });
  return NextResponse.json(row);
}

/** DELETE ?ip=xxx — remove IP block. */
export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const ip = url.searchParams.get("ip");
  if (!ip) return NextResponse.json({ message: "IP wajib" }, { status: 400 });
  await prisma.registeredIp.delete({ where: { ip } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
