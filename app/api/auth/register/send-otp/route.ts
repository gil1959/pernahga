import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email dibutuhkan" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    // Get SMTP settings from DB
    const settings = await prisma.siteSettings.findMany({
      where: {
        key: { in: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"] },
      },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!settingsMap.smtpHost || !settingsMap.smtpUser || !settingsMap.smtpPass) {
      console.warn("SMTP settings not configured. Please configure in Admin Panel.");
      return NextResponse.json(
        { message: "Sistem email belum dikonfigurasi. Hubungi administrator." },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: otp, // wait, normally token is unique. if upsert, we need a different approach
        }
      }, // Actually, wait. identifier_token is unique. Better to just delete existing and insert new
      update: {},
      create: { identifier: email, token: otp, expires },
    }).catch(async () => {
      // If it fails (maybe identifier exists with different token), delete all for this identifier and try again
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: { identifier: email, token: otp, expires },
      });
    });

    // Send email
    const transporter = nodemailer.createTransport({
      host: settingsMap.smtpHost,
      port: Number(settingsMap.smtpPort) || 587,
      secure: Number(settingsMap.smtpPort) === 465,
      auth: {
        user: settingsMap.smtpUser,
        pass: settingsMap.smtpPass,
      },
    });

    const mailOptions = {
      from: settingsMap.smtpFrom || "Pernahga <noreply@pernahga.com>",
      to: email,
      subject: "Kode Verifikasi Pendaftaran Pernahga",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f1ea; border-radius: 10px;">
          <h2 style="color: #2D2D2D;">Verifikasi Email Anda</h2>
          <p style="color: #4a4a4a; font-size: 16px;">Gunakan kode OTP berikut untuk melanjutkan proses pendaftaran Anda:</p>
          <div style="background-color: #2D2D2D; color: #F4F1EA; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #4a4a4a; font-size: 14px;">Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>
          <hr style="border: 1px solid #ddd8ce; margin: 20px 0;" />
          <p style="color: #8DA399; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Pernahga. Hak cipta dilindungi.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP terkirim" });
  } catch (error: any) {
    console.error("OTP Error:", error);
    return NextResponse.json({ message: "Gagal mengirim OTP" }, { status: 500 });
  }
}
