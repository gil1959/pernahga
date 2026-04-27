import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import SessionProvider from "@/components/providers/SessionProvider";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settingsArr = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => {
    settings[s.key] = s.value;
  });

  const whatsappNumber = settings.whatsappNumber || "628xxxxxxxxxx";
  const email = settings.email || "hello@pernahga.com";
  const phone = settings.phone || "+62 xxx xxxx xxxx";
  const address = settings.address || "Jakarta, Indonesia";

  const waUrl = `https://wa.me/${whatsappNumber}?text=Halo%20Pernahga!`;

  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#F4F1EA", minHeight: "100vh" }}>
        <div style={{ backgroundColor: "#2D2D2D", padding: "6rem 0 4rem", textAlign: "center" }}>
          <div className="container-custom">
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#F4F1EA", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              Hubungi Kami
            </h1>
            <p style={{ color: "rgba(244,241,234,0.7)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
              Ada pertanyaan? Tim kami siap membantu Anda memberikan solusi teknologi terbaik.
            </p>
          </div>
        </div>

        <div className="container-custom" style={{ padding: "4rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto", alignItems: "center" }}>
            
            {/* Contact Info */}
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "2rem" }}>
                Informasi Kontak
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#8DA399", border: "1px solid #ede9df" }}>
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.2rem" }}>WhatsApp (Fast Response)</p>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", textDecoration: "none" }}>{whatsappNumber}</a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#8DA399", border: "1px solid #ede9df" }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.2rem" }}>Email</p>
                    <a href={`mailto:${email}`} style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", textDecoration: "none" }}>{email}</a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#8DA399", border: "1px solid #ede9df" }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.2rem" }}>Telepon</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>{phone}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#8DA399", border: "1px solid #ede9df" }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.2rem" }}>Alamat</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>{address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual CTA */}
            <div style={{ backgroundColor: "#8DA399", borderRadius: "24px", padding: "3rem", color: "white", textAlign: "center", boxShadow: "0 20px 40px rgba(141,163,153,0.3)" }}>
              <MessageCircle size={48} style={{ margin: "0 auto 1.5rem", opacity: 0.9 }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Konsultasi Spesifik?</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", marginBottom: "2rem" }}>
                Anda bisa daftar dan buat akun untuk menjadwalkan konsultasi yang tercatat dalam sistem kami.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: "white", color: "#8DA399", border: "none", width: "100%", justifyContent: "center" }}>
                  Chat via WhatsApp
                </a>
                <a href="/login" className="btn-secondary" style={{ color: "white", borderColor: "white", width: "100%", justifyContent: "center" }}>
                  Masuk ke Dashboard
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </SessionProvider>
  );
}
