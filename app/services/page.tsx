import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PackagesSection from "@/components/sections/PackagesSection";
import { prisma } from "@/lib/prisma";
import SessionProvider from "@/components/providers/SessionProvider";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [packages, settingsArr] = await Promise.all([
    prisma.package.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.siteSettings.findMany(),
  ]);

  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => {
    settings[s.key] = s.value;
  });

  const whatsappNumber = settings.whatsappNumber || "628xxxxxxxxxx";

  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>
        <div style={{ backgroundColor: "#2D2D2D", padding: "4rem 0", textAlign: "center" }}>
          <div className="container-custom">
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#F4F1EA", marginBottom: "1rem" }}>
              Layanan Kami
            </h1>
            <p style={{ color: "rgba(244,241,234,0.7)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
              Dari konsultasi hingga implementasi software kustom, kami menyediakan solusi terpadu untuk mengembangkan bisnis Anda.
            </p>
          </div>
        </div>
        <PackagesSection packages={packages} whatsappNumber={whatsappNumber} />
      </main>
      <Footer />
    </SessionProvider>
  );
}
