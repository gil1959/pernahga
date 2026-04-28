import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const reviews = await prisma.testimonial.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content, rating, company, role } = await req.json();

    if (!content || !rating) {
      return NextResponse.json(
        { message: "Konten ulasan dan rating wajib diisi" },
        { status: 400 }
      );
    }

    const review = await prisma.testimonial.create({
      data: {
        userId: session.user.id,
        name: session.user.name || "Bintang Tamu",
        company: company || (session.user as { company?: string }).company || "",
        role: role || "",
        content,
        rating: parseInt(rating),
        isPublished: true, // Langsung tampil tanpa persetujuan admin
      },
    });

    return NextResponse.json(
      { message: "Ulasan berhasil dikirim dan langsung tampil", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ulasan error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengirim ulasan" },
      { status: 500 }
    );
  }
}
