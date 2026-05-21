import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/wa-fonnte";

/**
 * POST /api/auth/register
 *
 * Final step of registration:
 *  1. Re-validate inputs (defense in depth — client may have replayed an old
 *     OTP after staleness on email/phone uniqueness).
 *  2. Verify the OTP keyed by (phone, "phone_register").
 *  3. Create the User (password hashed) with phoneVerified set to now().
 *  4. Consume the OTP token.
 *
 * Body: { name, email, phone, password, otp }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const otp = String(body.otp || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Nama minimal 2 karakter" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Email tidak valid" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Kata sandi minimal 8 karakter" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: "Kode OTP harus 6 digit" }, { status: 400 });
    }

    let phone: string;
    try {
      phone = normalizePhone(body.phone || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Nomor WhatsApp tidak valid";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    // Re-check uniqueness: someone else may have registered the same email/phone
    // in the window between OTP send and OTP verify.
    const [emailUser, phoneUser] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { phone } }),
    ]);
    if (emailUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }
    if (phoneUser) {
      return NextResponse.json({ message: "Nomor WhatsApp sudah terdaftar" }, { status: 409 });
    }

    const record = await prisma.otpToken.findUnique({
      where: { identifier_type: { identifier: phone, type: "phone_register" } },
    });
    if (!record || record.token !== otp) {
      return NextResponse.json({ message: "Kode OTP tidak valid" }, { status: 400 });
    }
    if (record.expires.getTime() < Date.now()) {
      return NextResponse.json({ message: "Kode OTP sudah kedaluwarsa, kirim ulang" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          phoneVerified: new Date(),
          role: "USER",
        },
      }),
      prisma.otpToken.delete({
        where: { identifier_type: { identifier: phone, type: "phone_register" } },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
