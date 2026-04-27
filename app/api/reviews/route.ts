import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
        company: company || session.user.company || "",
        role: role || "",
        content,
        rating: parseInt(rating),
        isPublished: false, // Default: butuh persetujuan admin
      },
    });

    return NextResponse.json(
      { message: "Ulasan berhasil dikirim dan menunggu persetujuan", review },
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
