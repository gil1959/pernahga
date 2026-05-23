/**
 * GET /api/user/connections
 *   → List current user's connected channels (with status & label).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const conns = await prisma.userConnection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      channel: true,
      provider: true,
      externalId: true,
      label: true,
      status: true,
      lastEventAt: true,
      createdAt: true,
      publicData: true,
    },
  });
  return NextResponse.json({
    connections: conns.map((c) => ({
      ...c,
      publicData: c.publicData ? JSON.parse(c.publicData) : null,
    })),
  });
}
