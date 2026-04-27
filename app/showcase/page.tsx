import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import { prisma } from "@/lib/prisma";
import SessionProvider from "@/components/providers/SessionProvider";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const showcases = await prisma.showcase.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>
        <div style={{ backgroundColor: "#2D2D2D", padding: "6rem 0 4rem", textAlign: "center" }}>
          <div className="container-custom">
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#F4F1EA", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              Portofolio Solusi
            </h1>
            <p style={{ color: "rgba(244,241,234,0.7)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
              Beberapa hasil kerja nyata kami yang telah membantu mempercepat pertumbuhan bisnis klien-klien kami.
            </p>
          </div>
        </div>
        <ShowcaseSection showcases={showcases} />
      </main>
      <Footer />
    </SessionProvider>
  );
}
