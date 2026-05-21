import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePhone, sendPhoneOtp } from "@/lib/wa-fonnte";

/**
 * POST /api/auth/phone/send-otp
 *
 * Two modes:
 *  - mode "register": phone must NOT exist yet (used during registration).
 *      body: { phone, mode: "register" }
 *  - mode "verify": user must be signed in; sets/updates their phone and
 *      sends OTP. Allowed phone changes:
 *        a) user has no phone yet (Google signup, or migrated user)
 *        b) provided phone equals user.phone but phoneVerified is null
 *      body: { phone, mode: "verify" }
 *
 * Rate limiting is best-effort: max 1 active OTP per identifier; sending
 * within 60s of last create returns the same window.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body.mode === "register" ? "register" : "verify";
    let phone: string;
    try {
      phone = normalizePhone(body.phone || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Nomor HP tidak valid";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    if (mode === "register") {
      // Phone must be unused.
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { message: "Nomor HP sudah terdaftar. Silakan login atau gunakan nomor lain." },
          { status: 409 }
        );
      }
    } else {
      // verify mode: must be signed in.
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

      // If user already has a different phone but ours is unverified, allow change.
      if (user.phone && user.phone !== phone) {
        const conflict = await prisma.user.findUnique({ where: { phone } });
        if (conflict) {
          return NextResponse.json(
            { message: "Nomor HP sudah terdaftar di akun lain" },
            { status: 409 }
          );
        }
        await prisma.user.update({ where: { id: user.id }, data: { phone } });
      } else if (!user.phone) {
        const conflict = await prisma.user.findUnique({ where: { phone } });
        if (conflict) {
          return NextResponse.json(
            { message: "Nomor HP sudah terdaftar di akun lain" },
            { status: 409 }
          );
        }
        await prisma.user.update({ where: { id: user.id }, data: { phone } });
      }
    }

    // Throttle: re-use OTP within 60s if already created.
    const otpType = mode === "register" ? "phone_register" : "phone_verify";
    const existingToken = await prisma.otpToken.findUnique({
      where: { identifier_type: { identifier: phone, type: otpType } },
    });
    const now = Date.now();
    const reuseExisting =
      existingToken &&
      existingToken.expires.getTime() > now &&
      existingToken.createdAt.getTime() > now - 60_000;

    let otp: string;
    if (reuseExisting) {
      otp = existingToken!.token;
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(now + 10 * 60 * 1000);
      await prisma.otpToken.upsert({
        where: { identifier_type: { identifier: phone, type: otpType } },
        update: { token: otp, expires, createdAt: new Date() },
        create: { identifier: phone, token: otp, type: otpType, expires },
      });
    }

    try {
      await sendPhoneOtp(phone, otp);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim OTP";
      // Roll back: delete unsent token so user bisa retry.
      if (!reuseExisting) {
        await prisma.otpToken.deleteMany({
          where: { identifier: phone, type: otpType },
        });
      }
      return NextResponse.json({ message: msg }, { status: 502 });
    }

    return NextResponse.json({
      message: "Kode OTP telah dikirim ke nomor HP Anda",
      // Echo masked phone so the UI can show "OTP dikirim ke *****890"
      phone: phone.replace(/^(\d{2})(\d+)(\d{3})$/, "$1***$3"),
    });
  } catch (error: unknown) {
    console.error("phone/send-otp error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan, coba lagi sebentar." },
      { status: 500 }
    );
  }
}
