import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, sendPhoneOtp } from "@/lib/wa-fonnte";
import { getClientIp, ipAllowedForRegistration } from "@/lib/request-ip";

/**
 * POST /api/auth/register/send-otp
 *
 * Step 1 of the new registration flow.
 *
 * Body: { name, email, phone, password }
 *
 * Validates that:
 *  - email is not yet registered (rejects with 409)
 *  - phone is not yet registered (rejects with 409)
 * Then sends a 6-digit OTP to the provided phone via Fonnte.
 *
 * Note: nothing is persisted to User yet — the OTP is keyed by phone+type
 * "phone_register". The actual user is created in /api/auth/register only
 * after the OTP is verified.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Nama minimal 2 karakter" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Email tidak valid" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Kata sandi minimal 8 karakter" }, { status: 400 });
    }

    let phone: string;
    try {
      phone = normalizePhone(body.phone || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Nomor WhatsApp tidak valid";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    // IP dedup check (early — fail fast).
    const ip = getClientIp(req.headers);
    const ipCheck = await ipAllowedForRegistration(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json({ message: ipCheck.reason }, { status: 409 });
    }

    // Existence checks: email and phone must both be free.
    const [emailUser, phoneUser] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { phone } }),
    ]);

    if (emailUser && phoneUser) {
      return NextResponse.json(
        { message: "Email dan nomor WhatsApp sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }
    if (emailUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan login atau gunakan email lain." },
        { status: 409 }
      );
    }
    if (phoneUser) {
      return NextResponse.json(
        { message: "Nomor WhatsApp sudah terdaftar. Silakan login atau gunakan nomor lain." },
        { status: 409 }
      );
    }

    // Throttle: reuse existing OTP if created within last 60s.
    const existing = await prisma.otpToken.findUnique({
      where: { identifier_type: { identifier: phone, type: "phone_register" } },
    });
    const now = Date.now();
    const reuse =
      existing &&
      existing.expires.getTime() > now &&
      existing.createdAt.getTime() > now - 60_000;

    let otp: string;
    if (reuse) {
      otp = existing!.token;
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(now + 10 * 60 * 1000);
      await prisma.otpToken.upsert({
        where: { identifier_type: { identifier: phone, type: "phone_register" } },
        update: { token: otp, expires, createdAt: new Date() },
        create: { identifier: phone, token: otp, type: "phone_register", expires },
      });
    }

    try {
      await sendPhoneOtp(phone, otp);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim OTP WhatsApp";
      if (!reuse) {
        await prisma.otpToken.deleteMany({
          where: { identifier: phone, type: "phone_register" },
        });
      }
      return NextResponse.json({ message: msg }, { status: 502 });
    }

    return NextResponse.json({
      message: "Kode OTP telah dikirim ke WhatsApp Anda",
      phone: phone.replace(/^(\d{2})(\d+)(\d{3})$/, "$1***$3"),
    });
  } catch (error: unknown) {
    console.error("register/send-otp error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan, coba lagi sebentar." },
      { status: 500 }
    );
  }
}
