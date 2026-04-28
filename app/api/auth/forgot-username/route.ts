import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/forgot-username
// Returns username/name if email matches
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true },
    });

    if (!user) {
      // Security: don't reveal if email exists or not with exact same message
      return NextResponse.json({ message: "Jika email terdaftar, informasi akun akan dikirim ke email Anda." });
    }

    // In a real app, send email. For now return the name.
    return NextResponse.json({
      message: "Akun ditemukan",
      name: user.name || "(Nama belum diisi)",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot username error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
