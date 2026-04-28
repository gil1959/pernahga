import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

async function getSmtp() {
  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"] } },
  });
  const m: Record<string, string> = {};
  settings.forEach((s) => { m[s.key] = s.value; });
  return m;
}

async function sendOtpEmail(email: string, otp: string, subject: string, title: string) {
  const smtp = await getSmtp();
  if (!smtp.smtpHost || !smtp.smtpUser || !smtp.smtpPass) {
    throw new Error("SMTP belum dikonfigurasi");
  }
  const transporter = nodemailer.createTransport({
    host: smtp.smtpHost,
    port: Number(smtp.smtpPort) || 587,
    secure: Number(smtp.smtpPort) === 465,
    auth: { user: smtp.smtpUser, pass: smtp.smtpPass },
  });
  await transporter.sendMail({
    from: smtp.smtpFrom || "Pernahga <noreply@pernahga.com>",
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f1ea; border-radius: 10px;">
        <h2 style="color: #2D2D2D;">${title}</h2>
        <p style="color: #4a4a4a; font-size: 16px;">Gunakan kode OTP berikut:</p>
        <div style="background-color: #2D2D2D; color: #F4F1EA; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 8px;">
          ${otp}
        </div>
        <p style="color: #4a4a4a; font-size: 14px;">Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kepada siapa pun.</p>
        <hr style="border: 1px solid #ddd8ce; margin: 20px 0;" />
        <p style="color: #8DA399; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Pernahga. Hak cipta dilindungi.</p>
      </div>
    `,
  });
}

// POST /api/auth/otp/send
export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();
    // type: "forgot_password" | "change_password"

    if (!email || !type) {
      return NextResponse.json({ message: "Email dan tipe wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (type === "forgot_password" && !user) {
      return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
    }

    if (type === "change_password" && !user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert OTP
    await prisma.otpToken.upsert({
      where: { identifier_type: { identifier: email, type } },
      update: { token: otp, expires },
      create: { identifier: email, token: otp, type, expires },
    });

    const subject = type === "forgot_password"
      ? "Reset Password Pernahga"
      : "Kode OTP Ganti Password Pernahga";
    const title = type === "forgot_password"
      ? "Reset Password Akun Anda"
      : "Verifikasi Ganti Password";

    await sendOtpEmail(email, otp, subject, title);

    return NextResponse.json({ message: "OTP berhasil dikirim" });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ message: error.message || "Gagal mengirim OTP" }, { status: 500 });
  }
}
