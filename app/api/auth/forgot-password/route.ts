import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/forgot-password
export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter" }, { status: 400 });
    }

    // Verify OTP
    const otpRecord = await prisma.otpToken.findUnique({
      where: { identifier_type: { identifier: email, type: "forgot_password" } },
    });

    if (!otpRecord || otpRecord.token !== otp) {
      return NextResponse.json({ message: "Kode OTP tidak valid" }, { status: 400 });
    }

    if (new Date() > otpRecord.expires) {
      await prisma.otpToken.delete({
        where: { identifier_type: { identifier: email, type: "forgot_password" } },
      });
      return NextResponse.json({ message: "Kode OTP sudah kedaluwarsa" }, { status: 400 });
    }

    // Check user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete OTP
    await prisma.otpToken.delete({
      where: { identifier_type: { identifier: email, type: "forgot_password" } },
    });

    return NextResponse.json({ message: "Password berhasil direset" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
