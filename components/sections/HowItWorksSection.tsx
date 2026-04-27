"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, BarChart2, Wrench } from "lucide-react";

const steps = [
  {
    icon: <MessageCircle size={28} />,
    number: "01",
    key: "step1",
  },
  {
    icon: <BarChart2 size={28} />,
    number: "02",
    key: "step2",
  },
  {
    icon: <Wrench size={28} />,
    number: "03",
    key: "step3",
  },
];

export default function HowItWorksSection() {
  const t = useTranslations("howItWorks");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ backgroundColor: "#2D2D2D", overflow: "hidden" }}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div className="badge" style={{ backgroundColor: "rgba(141,163,153,0.15)", color: "#8DA399", border: "1px solid rgba(141,163,153,0.3)", marginBottom: "1rem" }}>
            Cara Kerja
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#F4F1EA", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p style={{ color: "rgba(244,241,234,0.6)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            {t("subtitle")}
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            position: "relative",
          }}
          className="steps-grid"
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "16.67%",
              right: "16.67%",
              height: "2px",
              background: "linear-gradient(90deg, #8DA399, rgba(141,163,153,0.3))",
              zIndex: 0,
            }}
            className="connector-line"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: i === 0 ? "#8DA399" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${i === 0 ? "#8DA399" : "rgba(141,163,153,0.3)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  color: i === 0 ? "white" : "#8DA399",
                  position: "relative",
                  transition: "all 0.3s",
                }}
              >
                {step.icon}
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#8DA399",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#F4F1EA",
                  marginBottom: "0.6rem",
                }}
              >
                {t(`${step.key}_title` as "step1_title" | "step2_title" | "step3_title")}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(244,241,234,0.55)",
                  lineHeight: 1.7,
                }}
              >
                {t(`${step.key}_desc` as "step1_desc" | "step2_desc" | "step3_desc")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .connector-line { display: none !important; }
        }
      `}</style>
    </section>
  );
}
