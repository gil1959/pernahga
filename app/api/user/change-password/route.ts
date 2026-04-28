import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// POST /api/user/change-password
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp, newPassword, currentPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ message: "Password baru minimal 8 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // If user has a password (not OAuth-only), verify OTP
    if (otp) {
      const otpRecord = await prisma.otpToken.findUnique({
        where: { identifier_type: { identifier: user.email, type: "change_password" } },
      });

      if (!otpRecord || otpRecord.token !== otp) {
        return NextResponse.json({ message: "Kode OTP tidak valid" }, { status: 400 });
      }

      if (new Date() > otpRecord.expires) {
        await prisma.otpToken.delete({
          where: { identifier_type: { identifier: user.email, type: "change_password" } },
        });
        return NextResponse.json({ message: "Kode OTP sudah kedaluwarsa" }, { status: 400 });
      }

      // Delete OTP after use
      await prisma.otpToken.delete({
        where: { identifier_type: { identifier: user.email, type: "change_password" } },
      });
    } else if (currentPassword && user.password) {
      // Alternative: verify with current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: "Verifikasi diperlukan (OTP atau password saat ini)" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
