import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/** GET /api/admin/users — list with subscription + plan summary. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      phoneVerified: true,
      company: true,
      registrationIp: true,
      isBanned: true,
      createdAt: true,
      subscription: {
        select: {
          status: true,
          packageId: true,
          creditsTotal: true,
          creditsUsed: true,
          startsAt: true,
          endsAt: true,
          trialEndsAt: true,
          package: { select: { title: true, price: true } },
        },
      },
      _count: { select: { consultations: true, testimonials: true, usageLogs: true } },
    },
  });
  return NextResponse.json(users);
}
