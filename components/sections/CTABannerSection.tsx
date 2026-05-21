"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function CTABannerSection({}: { whatsappNumber: string }) {
  const t = useTranslations("cta");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ backgroundColor: "#F4F1EA" }}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{
            background: "linear-gradient(135deg, #8DA399 0%, #6d8a7f 100%)",
            borderRadius: "24px",
            padding: "4rem 3rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              left: "-40px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                fontWeight: 800,
                color: "white",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
                maxWidth: "600px",
                margin: "0 auto 1rem",
              }}
            >
              {t("title")}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "1rem",
                marginBottom: "2.5rem",
                maxWidth: "480px",
                margin: "0 auto 2.5rem",
              }}
            >
              {t("subtitle")}
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 2.25rem",
                  backgroundColor: "#2D2D2D",
                  color: "#F4F1EA",
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  boxShadow: "0 8px 30px rgba(45,45,45,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(45,45,45,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(45,45,45,0.3)";
                }}
              >
                <Zap size={20} />
                {t("button")}
              </Link>
              <Link
                href="#how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 1.75rem",
                  backgroundColor: "transparent",
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.5)",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "all 0.3s ease",
                }}
              >
                {t("button_secondary")}
                <ArrowRight size={18} />
              </Link>
            </div>

            <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
              {t("note")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
