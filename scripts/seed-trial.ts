/**
 * Auto-seed the Trial package row.
 *
 * Idempotent: runs on every Vercel deploy via the build script. If a row
 * with title="Trial" already exists, this script does nothing. Otherwise
 * it creates a Trial row using the LOCKED v2.0 capability matrix:
 *
 *   - 200 credits / 3 days
 *   - Pro-level access (1 channel)
 *   - Auto-reply DM + auto-posting feed IG (preview)
 *
 * Source of truth: foundation.md v2.0 + memory/2026-05-21.md
 */
import { PrismaClient, CapabilityChannel } from "@prisma/client";

const prisma = new PrismaClient();

const TRIAL_CAPABILITIES: CapabilityChannel[] = [
  // Trial = preview level Pro, 1 channel pilihan
  "WHATSAPP",
  "INSTAGRAM_DM",
  "TELEGRAM",
  "EMAIL",
  "INSTAGRAM_POST",
  "IMAGE_GEN",
];

async function main() {
  const existing = await prisma.package.findFirst({ where: { title: "Trial" } });
  if (existing) {
    console.log("[seed-trial] Trial package already exists, skipping.");
    return;
  }

  const features = [
    "200 kredit untuk uji coba 3 hari",
    "Akses level Pro (1 channel pilihan)",
    "Auto-reply DM + auto-posting feed IG (preview)",
    "Verifikasi nomor HP via WhatsApp OTP",
    "Tanpa kartu kredit, batal kapan saja",
  ];

  const featuresEn = [
    "200 credits for a 3-day trial",
    "Pro-level access (1 channel of your choice)",
    "DM auto-reply + IG feed auto-posting (preview)",
    "Phone verification via WhatsApp OTP",
    "No credit card required, cancel anytime",
  ];

  await prisma.package.create({
    data: {
      title: "Trial",
      titleEn: "Trial",
      description: "Coba semua fitur Pega level Pro selama 3 hari, gratis tanpa kartu kredit.",
      descriptionEn: "Try Pega's Pro-level features free for 3 days. No credit card required.",
      price: "Gratis",
      priceNote: "3 hari trial",
      priceNoteEn: "3-day trial",
      features: JSON.stringify(features),
      featuresEn: JSON.stringify(featuresEn),
      isPopular: false,
      isActive: false, // hidden from public packages page; used only for Trial provisioning
      order: 0,
      defaultCapabilities: JSON.stringify(TRIAL_CAPABILITIES),
      monthlyCredits: 200,
      creditsRefreshDays: 0,
    },
  });
  console.log("[seed-trial] Trial package created.");
}

main()
  .catch((err) => {
    console.error("[seed-trial] FAILED:", err);
    // Don't break the build — Trial provisioning will just be a no-op.
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
