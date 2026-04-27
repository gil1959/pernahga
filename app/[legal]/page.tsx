import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";

import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const resolvedParams = await params;
  const locale = await getLocale();
  const isTerms = resolvedParams.legal === "terms";
  const isPrivacy = resolvedParams.legal === "privacy";
  const isRefund = resolvedParams.legal === "refund";

  if (!isTerms && !isPrivacy && !isRefund) {
    return <div>Not found</div>;
  }

  let baseKey = "";
  let title = "";

  if (isTerms) {
    baseKey = "termsContent";
    title = locale === "en" ? "Terms of Service" : "Syarat & Ketentuan";
  } else if (isPrivacy) {
    baseKey = "privacyContent";
    title = locale === "en" ? "Privacy Policy" : "Kebijakan Privasi";
  } else if (isRefund) {
    baseKey = "refundContent";
    title = locale === "en" ? "Refund Policy" : "Kebijakan Pengembalian Dana";
  }

  const keyConfig = locale === "en" ? `${baseKey}En` : baseKey;

  const setting = await prisma.siteSettings.findUnique({
    where: { key: keyConfig }
  });

  // Fallback to Indonesian if English is empty
  let content = setting?.value;
  if (!content && locale === "en") {
    const fallbackSetting = await prisma.siteSettings.findUnique({
      where: { key: baseKey }
    });
    content = fallbackSetting?.value;
  }

  content = content || `<p>Berisi kebijakan ${title}.</p>`;

  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#F4F1EA", minHeight: "100vh" }}>
        <div style={{ backgroundColor: "#2D2D2D", padding: "4rem 0", textAlign: "center" }}>
          <div className="container-custom">
            <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 800, color: "#F4F1EA", letterSpacing: "-0.02em" }}>
              {title}
            </h1>
          </div>
        </div>

        <div className="container-custom" style={{ padding: "4rem 1.5rem" }}>
          <div 
            style={{ backgroundColor: "white", padding: "3rem", borderRadius: "20px", border: "1px solid #ede9df", maxWidth: "800px", margin: "0 auto" }}
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </main>
      <Footer />
    </SessionProvider>
  );
}
