import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const data = await req.json();
  
  const consultation = await prisma.consultation.update({
    where: { id: resolvedParams.id },
    data: {
      status: data.status,
      adminNotes: data.adminNotes,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    }
  });
  
  return NextResponse.json(consultation);
}
