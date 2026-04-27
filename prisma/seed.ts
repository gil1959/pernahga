import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const defaultSettings = [
  { key: "whatsappNumber", value: "628xxxxxxxxxx" },
  { key: "email", value: "hello@pernahga.com" },
  { key: "phone", value: "+62 xxx xxxx xxxx" },
  { key: "address", value: "Jakarta, Indonesia" },
  { key: "heroTitle", value: "Bingung Butuh Software Apa?\nKami Bantu Carikan Solusinya" },
  { key: "heroTitleEn", value: "Confused About What Software You Need?\nWe Help Find the Solution" },
  { key: "heroSubtitle", value: "Konsultasi gratis, solusi tepat. Pernahga hadir untuk membantu bisnis Anda berkembang dengan teknologi yang tepat." },
  { key: "heroSubtitleEn", value: "Free consultation, precise solutions. Pernahga is here to help your business grow with the right technology." },
  { key: "aboutTitle", value: "Kami Fokus pada Solusi, Bukan Sekadar Produk" },
  { key: "aboutTitleEn", value: "We Focus on Solutions, Not Just Products" },
  { key: "aboutText", value: "Pernahga adalah perusahaan konsultasi teknologi yang percaya bahwa setiap bisnis memiliki kebutuhan unik. Kami tidak menawarkan solusi generik — kami mendengarkan, menganalisis, dan membangun solusi yang tepat untuk Anda." },
  { key: "aboutTextEn", value: "Pernahga is a technology consulting company that believes every business has unique needs. We don't offer generic solutions — we listen, analyze, and build the right solution for you." },
  { key: "termsContent", value: "<h1>Terms of Service</h1><p>Dengan mengakses dan menggunakan layanan Pernahga, Anda menyetujui syarat dan ketentuan berikut ini...</p>" },
  { key: "privacyContent", value: "<h1>Privacy Policy</h1><p>Pernahga berkomitmen untuk melindungi privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan dan menggunakan informasi Anda...</p>" },
  { key: "refundContent", value: "<h1>Refund Policy</h1><p>Kepuasan klien adalah prioritas kami. Jika Anda tidak puas dengan layanan kami, silakan hubungi kami dalam 7 hari...</p>" },
  { key: "instagramUrl", value: "" },
  { key: "linkedinUrl", value: "" },
  { key: "twitterUrl", value: "" },
  { key: "youtubeUrl", value: "" },
];

const packages = [
  {
    title: "Konsultasi Dasar",
    titleEn: "Basic Consultation",
    description: "Cocok untuk Anda yang baru mulai dan ingin memahami kebutuhan teknologi bisnis.",
    descriptionEn: "Perfect for those just starting out and wanting to understand their business technology needs.",
    price: "Gratis",
    priceNote: "Satu sesi 60 menit",
    priceNoteEn: "One 60-minute session",
    features: JSON.stringify([
      "1x Sesi Konsultasi Online",
      "Analisis kebutuhan awal",
      "Rekomendasi teknologi",
      "Laporan ringkas via email",
    ]),
    featuresEn: JSON.stringify([
      "1x Online Consultation Session",
      "Initial needs analysis",
      "Technology recommendations",
      "Brief report via email",
    ]),
    isPopular: false,
    isActive: true,
    order: 1,
  },
  {
    title: "Konsultasi Profesional",
    titleEn: "Professional Consultation",
    description: "Untuk bisnis yang siap take action. Dapatkan roadmap teknologi yang komprehensif.",
    descriptionEn: "For businesses ready to take action. Get a comprehensive technology roadmap.",
    price: "Rp 2.500.000",
    priceNote: "Per proyek",
    priceNoteEn: "Per project",
    features: JSON.stringify([
      "3x Sesi Konsultasi Online",
      "Analisis bisnis mendalam",
      "Roadmap teknologi 6 bulan",
      "Rekomendasi vendor & tools",
      "Dokumen spesifikasi teknis",
      "Support via WhatsApp 30 hari",
    ]),
    featuresEn: JSON.stringify([
      "3x Online Consultation Sessions",
      "In-depth business analysis",
      "6-month technology roadmap",
      "Vendor & tools recommendations",
      "Technical specification document",
      "WhatsApp support for 30 days",
    ]),
    isPopular: true,
    isActive: true,
    order: 2,
  },
  {
    title: "Solusi Enterprise",
    titleEn: "Enterprise Solution",
    description: "Paket lengkap dari konsultasi hingga pengembangan software custom untuk bisnis besar.",
    descriptionEn: "Complete package from consultation to custom software development for large businesses.",
    price: "Custom",
    priceNote: "Hubungi kami untuk penawaran",
    priceNoteEn: "Contact us for a quote",
    features: JSON.stringify([
      "Konsultasi tidak terbatas",
      "Pengembangan software custom",
      "Tim dedicated",
      "Manajemen proyek penuh",
      "Integrasi sistem existing",
      "Pelatihan tim internal",
      "Maintenance & support 1 tahun",
    ]),
    featuresEn: JSON.stringify([
      "Unlimited consultations",
      "Custom software development",
      "Dedicated team",
      "Full project management",
      "Existing system integration",
      "Internal team training",
      "1-year maintenance & support",
    ]),
    isPopular: false,
    isActive: true,
    order: 3,
  },
];

const showcases = [
  {
    title: "SiapKerja — Platform Rekrutmen UMKM",
    titleEn: "SiapKerja — SME Recruitment Platform",
    slug: "siapkerja-platform-rekrutmen",
    description: "Platform digital yang menghubungkan UMKM dengan talenta lokal secara efisien.",
    descriptionEn: "A digital platform connecting SMEs with local talent efficiently.",
    longDescription: "SiapKerja adalah solusi rekrutmen berbasis web yang kami kembangkan untuk membantu UMKM di Indonesia menemukan karyawan yang tepat tanpa biaya mahal. Platform ini dilengkapi dengan sistem matching otomatis, manajemen lowongan, dan dashboard analitik sederhana.",
    longDescriptionEn: "SiapKerja is a web-based recruitment solution we developed to help Indonesian SMEs find the right employees without expensive costs. The platform is equipped with an automatic matching system, vacancy management, and a simple analytics dashboard.",
    thumbnail: "https://placehold.co/800x500/8DA399/F4F1EA?text=SiapKerja",
    images: JSON.stringify([
      "https://placehold.co/800x500/8DA399/F4F1EA?text=SiapKerja+Dashboard",
      "https://placehold.co/800x500/2D2D2D/F4F1EA?text=SiapKerja+Mobile",
    ]),
    tags: JSON.stringify(["Rekrutmen", "UMKM", "Platform", "Web App"]),
    techStack: JSON.stringify(["Next.js", "Node.js", "MySQL", "Tailwind CSS"]),
    demoUrl: "",
    caseStudy: "UMKM klien kami berhasil mengurangi waktu rekrutmen dari 3 minggu menjadi 5 hari...",
    caseStudyEn: "Our client's SME managed to reduce recruitment time from 3 weeks to 5 days...",
    isPublished: true,
    isFeatured: true,
    order: 1,
  },
  {
    title: "KasirKu — Software POS untuk Restoran",
    titleEn: "KasirKu — POS Software for Restaurants",
    slug: "kasirku-software-pos-restoran",
    description: "Sistem Point of Sale modern yang mudah digunakan oleh siapapun, tanpa pelatihan panjang.",
    descriptionEn: "A modern Point of Sale system that anyone can use without lengthy training.",
    longDescription: "KasirKu dirancang khusus untuk restoran dan kafe skala kecil menengah yang membutuhkan sistem kasir digital sederhana namun powerful. Dilengkapi manajemen menu, laporan penjualan real-time, dan integrasi printer termal.",
    longDescriptionEn: "KasirKu is designed specifically for small to medium restaurants and cafes that need a simple yet powerful digital cashier system. Equipped with menu management, real-time sales reports, and thermal printer integration.",
    thumbnail: "https://placehold.co/800x500/2D2D2D/F4F1EA?text=KasirKu",
    images: JSON.stringify([
      "https://placehold.co/800x500/2D2D2D/F4F1EA?text=KasirKu+POS",
      "https://placehold.co/800x500/8DA399/F4F1EA?text=KasirKu+Report",
    ]),
    tags: JSON.stringify(["POS", "Restoran", "Desktop App", "Kasir"]),
    techStack: JSON.stringify(["Electron.js", "React", "SQLite", "Node.js"]),
    demoUrl: "",
    caseStudy: "Restoran Pak Seto kini melayani 40% lebih banyak pelanggan per jam setelah menggunakan KasirKu...",
    caseStudyEn: "Pak Seto's restaurant now serves 40% more customers per hour since using KasirKu...",
    isPublished: true,
    isFeatured: true,
    order: 2,
  },
  {
    title: "InventorySmart — Manajemen Gudang",
    titleEn: "InventorySmart — Warehouse Management",
    slug: "inventorysmart-manajemen-gudang",
    description: "Sistem manajemen inventori berbasis cloud untuk bisnis distribusi dan retail.",
    descriptionEn: "Cloud-based inventory management system for distribution and retail businesses.",
    longDescription: "InventorySmart membantu bisnis distribusi mengelola stok barang secara real-time, mencegah kehabisan stok, dan mengoptimalkan rantai pasokan. Sistem ini dapat diakses dari mana saja menggunakan browser.",
    longDescriptionEn: "InventorySmart helps distribution businesses manage stock in real-time, prevent stockouts, and optimize the supply chain. The system can be accessed from anywhere using a browser.",
    thumbnail: "https://placehold.co/800x500/8DA399/2D2D2D?text=InventorySmart",
    images: JSON.stringify([
      "https://placehold.co/800x500/8DA399/2D2D2D?text=Inventory+Dashboard",
    ]),
    tags: JSON.stringify(["Inventori", "Warehouse", "Cloud", "SaaS"]),
    techStack: JSON.stringify(["Laravel", "Vue.js", "MySQL", "Redis"]),
    demoUrl: "",
    caseStudy: "",
    caseStudyEn: "",
    isPublished: true,
    isFeatured: false,
    order: 3,
  },
];

const educations = [
  {
    title: "Kapan Bisnis Anda Butuh Software Custom?",
    titleEn: "When Does Your Business Need Custom Software?",
    description: "Banyak bisnis yang masih bingung: apakah cukup pakai software off-the-shelf atau perlu yang custom? Simak penjelasannya di sini.",
    descriptionEn: "Many businesses are still confused: is off-the-shelf software enough or do they need custom? Watch the explanation here.",
    type: "YOUTUBE" as const,
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Strategi Bisnis",
    categoryEn: "Business Strategy",
    isPublished: true,
    order: 1,
  },
  {
    title: "5 Tanda Bisnis Anda Butuh Digitalisasi Sekarang",
    titleEn: "5 Signs Your Business Needs Digitalization Now",
    description: "Apakah bisnis Anda mengalami tanda-tanda ini? Jika iya, sudah saatnya beralih ke solusi digital.",
    descriptionEn: "Is your business experiencing these signs? If so, it's time to switch to a digital solution.",
    type: "YOUTUBE" as const,
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Digitalisasi",
    categoryEn: "Digitalization",
    isPublished: true,
    order: 2,
  },
  {
    title: "Cara Pilih Vendor Software yang Tepat",
    titleEn: "How to Choose the Right Software Vendor",
    description: "Tips praktis memilih vendor software yang dapat dipercaya tanpa malah rugi di belakangnya.",
    descriptionEn: "Practical tips for choosing a trustworthy software vendor without getting burned later.",
    type: "TIKTOK" as const,
    embedUrl: "https://www.tiktok.com/embed/v2/7000000000000000000",
    category: "Tips Teknologi",
    categoryEn: "Tech Tips",
    isPublished: true,
    order: 3,
  },
];

const testimonials = [
  {
    name: "Budi Santoso",
    company: "CV Maju Jaya",
    role: "Direktur",
    content: "Pernahga benar-benar membantu kami memahami apa yang bisnis kami butuhkan. Konsultasi gratuisnya sangat bernilai, dan software yang direkomendasikan langsung berdampak.",
    contentEn: "Pernahga really helped us understand what our business needed. The free consultation was extremely valuable, and the recommended software had an immediate impact.",
    rating: 5,
    isPublished: true,
    order: 1,
  },
  {
    name: "Sari Dewi",
    company: "Toko Online Sari",
    role: "Pemilik",
    content: "Awalnya saya pikir butuh software yang mahal, ternyata setelah konsultasi, ada solusi yang lebih cocok dan terjangkau. Tim Pernahga sangat profesional.",
    contentEn: "At first I thought I needed expensive software, but after the consultation, there was a more suitable and affordable solution. The Pernahga team is very professional.",
    rating: 5,
    isPublished: true,
    order: 2,
  },
  {
    name: "Hendra Wijaya",
    company: "PT Nusantara Digital",
    role: "CTO",
    content: "Sebagai perusahaan teknologi sendiri, kami menggunakan Pernahga untuk second opinion. Rekomendasinya tepat sasaran dan analysis-nya mendalam.",
    contentEn: "As a technology company ourselves, we used Pernahga for a second opinion. The recommendations were on point and the analysis was in-depth.",
    rating: 5,
    isPublished: true,
    order: 3,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    "@RAGILgg12345",
    12
  );

  await prisma.user.upsert({
    where: { email: "pernahgaofficial@gmail.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Admin Pernahga",
      email: "pernahgaofficial@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created");

  // Seed site settings
  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Site settings seeded");

  // Seed packages
  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({
      where: { title: pkg.title },
    });
    if (!existing) {
      await prisma.package.create({ data: pkg });
    }
  }
  console.log("✅ Packages seeded");

  // Seed showcases
  for (const showcase of showcases) {
    await prisma.showcase.upsert({
      where: { slug: showcase.slug },
      update: {},
      create: showcase,
    });
  }
  console.log("✅ Showcases seeded");

  // Seed educations
  for (const edu of educations) {
    const existing = await prisma.education.findFirst({
      where: { title: edu.title },
    });
    if (!existing) {
      await prisma.education.create({ data: edu });
    }
  }
  console.log("✅ Education content seeded");

  // Seed testimonials
  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    }
  }
  console.log("✅ Testimonials seeded");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
