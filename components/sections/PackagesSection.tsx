"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Check, Zap, MessageCircle } from "lucide-react";

interface Package {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  priceNote: string | null;
  priceNoteEn: string | null;
  features: string;
  featuresEn: string;
  isPopular: boolean;
}

export default function PackagesSection({
  packages,
  whatsappNumber,
}: {
  packages: Package[];
  whatsappNumber: string;
}) {
  const t = useTranslations("services");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const getLocale = () => {
    if (typeof window === "undefined") return "id";
    return document.cookie.split("; ").find(r => r.startsWith("locale="))?.split("=")[1] || "id";
  };

  return (
    <section ref={ref} className="section-padding" style={{ backgroundColor: "#F4F1EA" }}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            <Zap size={14} />
            Paket & Harga
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "1rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            {t("subtitle")}
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {packages.map((pkg, i) => {
            const locale = getLocale();
            const title = locale === "en" ? pkg.titleEn : pkg.title;
            const description = locale === "en" ? pkg.descriptionEn : pkg.description;
            const priceNote = locale === "en" ? pkg.priceNoteEn : pkg.priceNote;
            const features: string[] = JSON.parse(
              locale === "en" ? pkg.featuresEn : pkg.features
            );
            const isCustom = pkg.price === "Custom" || pkg.price === "Gratis";
            const waMessage = `Halo Pernahga! Saya tertarik dengan paket ${pkg.title}. Bisa ceritakan lebih lanjut?`;
            const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{
                  backgroundColor: pkg.isPopular ? "#2D2D2D" : "white",
                  borderRadius: "20px",
                  padding: "2rem",
                  border: pkg.isPopular ? "none" : "1px solid #ede9df",
                  boxShadow: pkg.isPopular
                    ? "0 20px 60px rgba(45,45,45,0.25)"
                    : "0 4px 20px rgba(45,45,45,0.06)",
                  position: "relative",
                  transform: pkg.isPopular ? "scale(1.03)" : "scale(1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                whileHover={{ y: -6 }}
              >
                {pkg.isPopular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#8DA399",
                      color: "white",
                      padding: "0.3rem 1.25rem",
                      borderRadius: "50px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("popular")}
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: pkg.isPopular ? "#F4F1EA" : "#2D2D2D",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: pkg.isPopular ? "rgba(244,241,234,0.6)" : "#6b6b6b", lineHeight: 1.6 }}>
                    {description}
                  </p>
                </div>

                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: pkg.isPopular ? "#F4F1EA" : "#2D2D2D" }}>
                    {pkg.price}
                  </div>
                  {priceNote && (
                    <div style={{ fontSize: "0.8rem", color: pkg.isPopular ? "rgba(244,241,234,0.5)" : "#9b9b9b", marginTop: "0.25rem" }}>
                      {priceNote}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8DA399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                    {t("features")}
                  </p>
                  <ul style={{ listStyle: "none" }}>
                    {features.map((feature, j) => (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.65rem",
                          padding: "0.45rem 0",
                          borderBottom: j < features.length - 1
                            ? `1px solid ${pkg.isPopular ? "rgba(244,241,234,0.08)" : "#f0ede6"}`
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(141,163,153,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "1px",
                          }}
                        >
                          <Check size={12} color="#8DA399" strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: "0.875rem", color: pkg.isPopular ? "rgba(244,241,234,0.8)" : "#4a4a4a" }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.875rem 1.5rem",
                    borderRadius: "12px",
                    backgroundColor: pkg.isPopular ? "#8DA399" : "#2D2D2D",
                    color: "white",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(45,45,45,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <MessageCircle size={16} />
                  {isCustom && pkg.price !== "Gratis" ? t("cta_custom") : t("cta")}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
