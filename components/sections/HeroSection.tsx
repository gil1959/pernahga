"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircle, ArrowRight, Users, FolderOpen, Star, Zap } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function HeroSection({ settings }: { settings: Record<string, string> }) {
  const t = useTranslations("hero");
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || settings.whatsappNumber || "628xxxxxxxxxx";
  const locale = typeof window !== "undefined"
    ? document.cookie.split("; ").find(r => r.startsWith("locale="))?.split("=")[1] || "id"
    : "id";

  const heroTitle = locale === "en" ? settings.heroTitleEn : settings.heroTitle;
  const heroSubtitle = locale === "en" ? settings.heroSubtitleEn : settings.heroSubtitle;

  const waMessage = "Halo Pernahga! Saya ingin konsultasi mengenai kebutuhan teknologi bisnis saya.";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const stats = [
    { icon: <Users size={20} />, value: "50+", label: t("stats.clients") },
    { icon: <FolderOpen size={20} />, value: "80+", label: t("stats.projects") },
    { icon: <Star size={20} />, value: "3+", label: t("stats.years") },
    { icon: <Zap size={20} />, value: "100%", label: t("stats.free") },
  ];

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "90px",
        paddingBottom: "4rem",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#F4F1EA",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "45%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(141,163,153,0.08) 0%, rgba(141,163,153,0.15) 100%)",
          clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(141,163,153,0.1) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div className="container-custom" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="badge badge-green" style={{ marginBottom: "1.5rem" }}>
                <Zap size={14} />
                {t("badge")}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1.25rem",
                letterSpacing: "-0.03em",
                color: "#2D2D2D",
              }}
              dangerouslySetInnerHTML={{
                __html: (heroTitle || "Bingung Butuh Software Apa?\nKami Bantu Carikan Solusinya")
                  .replace(/\n/g, '<br/>')
                  .replace(/(Kami Bantu|We Help)/g, '<span style="color:#8DA399">$1</span>')
              }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: "1.05rem",
                color: "#4a4a4a",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "480px",
              }}
            >
              {heroSubtitle || "Konsultasi gratis, solusi tepat. Pernahga hadir untuk membantu bisnis Anda berkembang dengan teknologi yang tepat."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}
            >
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ fontSize: "1rem" }}
              >
                <MessageCircle size={18} />
                {t("cta_primary")}
              </a>
              <Link href="/showcase" className="btn-secondary" style={{ fontSize: "1rem" }}>
                {t("cta_secondary")}
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
              }}
              className="stats-grid"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    textAlign: "center",
                    padding: "1rem 0.5rem",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    border: "1px solid #ede9df",
                    boxShadow: "0 2px 8px rgba(45,45,45,0.05)",
                  }}
                >
                  <div style={{ color: "#8DA399", display: "flex", justifyContent: "center", marginBottom: "0.25rem" }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b6b6b", fontWeight: 500 }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  backgroundColor: "white",
                  borderRadius: "24px",
                  padding: "3rem",
                  boxShadow: "0 30px 80px rgba(45,45,45,0.12)",
                  border: "1px solid #ede9df",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                <Logo size={100} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2D2D2D" }}>Pernahga</p>
                  <p style={{ fontSize: "0.85rem", color: "#8DA399", fontWeight: 500 }}>Tech Consultation</p>
                </div>

                {/* Consultation process visual */}
                <div style={{ width: "100%" }}>
                  {["Analisis kebutuhan bisnis", "Rekomendasi solusi", "Implementasi tepat sasaran"].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "10px",
                        backgroundColor: i === 1 ? "rgba(141,163,153,0.1)" : "transparent",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#8DA399",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#2D2D2D" }}>{step}</span>
                    </motion.div>
                  ))}
                </div>

                <div style={{ width: "100%", padding: "0.85rem 1rem", backgroundColor: "#2D2D2D", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MessageCircle size={18} color="#8DA399" />
                  <span style={{ color: "#F4F1EA", fontSize: "0.85rem", fontWeight: 600 }}>Konsultasi Gratis Sekarang</span>
                </div>
              </motion.div>

              {/* Floating accent cards */}
              <motion.div
                animate={{ y: [0, 8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-30px",
                  backgroundColor: "#8DA399",
                  borderRadius: "14px",
                  padding: "0.75rem 1rem",
                  boxShadow: "0 10px 30px rgba(141,163,153,0.3)",
                }}
              >
                <p style={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>100% Gratis</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem" }}>Konsultasi Pertama</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{
                  position: "absolute",
                  bottom: "30px",
                  left: "-30px",
                  backgroundColor: "#2D2D2D",
                  borderRadius: "14px",
                  padding: "0.75rem 1rem",
                  boxShadow: "0 10px 30px rgba(45,45,45,0.2)",
                }}
              >
                <p style={{ color: "#F4F1EA", fontSize: "0.75rem", fontWeight: 700 }}>50+ Klien</p>
                <p style={{ color: "rgba(244,241,234,0.6)", fontSize: "0.7rem" }}>Puas dengan solusi kami</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
