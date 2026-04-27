import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, company } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, company },
    });

    return NextResponse.json({ message: "Profil diperbarui", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
