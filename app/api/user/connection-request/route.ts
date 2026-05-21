import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { CapabilityChannel } from "@prisma/client";

/**
 * POST /api/user/connection-request
 *
 * Body: { channel, handle?, notes? }
 *
 * Buyer-facing "Hubungi admin to connect" flow. Creates a ConnectionRequest
 * row in REQUESTED state. Admin handles connect manually until OAuth is
 * fully implemented.
 *
 * Validation:
 *  - User must have the channel granted by their plan AND admin-toggled on.
 *    Otherwise we return 403 with the min-plan hint so UI can show upgrade.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const channel = body.channel as CapabilityChannel;
  if (!channel) {
    return NextResponse.json({ message: "Channel wajib" }, { status: 400 });
  }

  // Ensure capability is enabled for this user.
  const cap = await prisma.userCapability.findUnique({
    where: { userId_channel: { userId: session.user.id, channel } },
  });
  if (!cap || !cap.enabled) {
    return NextResponse.json(
      { message: "Capability ini belum aktif di akun Anda. Upgrade paket atau hubungi admin." },
      { status: 403 }
    );
  }

  const handle = body.handle ? String(body.handle).slice(0, 200) : null;
  const notes = body.notes ? String(body.notes).slice(0, 1000) : null;

  // Avoid spam: if already an open REQUESTED for this channel, return existing.
  const existing = await prisma.connectionRequest.findFirst({
    where: { userId: session.user.id, channel, status: "REQUESTED" },
  });
  if (existing) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      request: existing,
      message: "Permintaan sudah ada, admin akan segera menghubungi.",
    });
  }

  const request = await prisma.connectionRequest.create({
    data: {
      userId: session.user.id,
      channel,
      status: "REQUESTED",
      handle,
      notes,
    },
  });
  return NextResponse.json({ ok: true, request });
}

/** GET /api/user/connection-request — list user's own connect history */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.connectionRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}
