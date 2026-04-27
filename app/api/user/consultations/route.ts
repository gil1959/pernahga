import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { topic, message } = await req.json();

    if (!topic || !message) {
      return NextResponse.json({ message: "Topik dan pesan harus diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId: user.id,
        name: user.name || "Tanpa Nama",
        email: user.email,
        company: user.company || null,
        topic,
        message,
        status: "PENDING"
      },
    });

    return NextResponse.json({ message: "Konsultasi berhasil dibuat", consultation }, { status: 201 });
  } catch (error) {
    console.error("Create consultation error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
