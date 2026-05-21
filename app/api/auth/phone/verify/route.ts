import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePhone } from "@/lib/wa-fonnte";

/**
 * POST /api/auth/phone/verify
 *
 * Body: { phone, otp, mode? }
 *  - mode "verify" (default): signed-in user verifies their own phone.
 *
 * On success the user.phoneVerified is set to now() and OTP token is
 * consumed.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const otp = String(body.otp || "").trim();
    let phone: string;
    try {
      phone = normalizePhone(body.phone || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Nomor WhatsApp tidak valid";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: "Kode OTP harus 6 digit" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }
    if (user.phoneVerified) {
      return NextResponse.json({ message: "Nomor sudah diverifikasi" }, { status: 400 });
    }
    if (user.phone !== phone) {
      return NextResponse.json(
        { message: "Nomor tidak cocok dengan permintaan OTP. Kirim ulang OTP." },
        { status: 400 }
      );
    }

    const record = await prisma.otpToken.findUnique({
      where: { identifier_type: { identifier: phone, type: "phone_verify" } },
    });
    if (!record || record.token !== otp) {
      return NextResponse.json({ message: "Kode OTP tidak valid" }, { status: 400 });
    }
    if (record.expires.getTime() < Date.now()) {
      return NextResponse.json({ message: "Kode OTP sudah kedaluwarsa" }, { status: 400 });
    }

    // Atomic update + cleanup.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: new Date() },
      }),
      prisma.otpToken.delete({
        where: { identifier_type: { identifier: phone, type: "phone_verify" } },
      }),
    ]);

    return NextResponse.json({ message: "Nomor berhasil diverifikasi" });
  } catch (error: unknown) {
    console.error("phone/verify error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan, coba lagi sebentar." },
      { status: 500 }
    );
  }
}
