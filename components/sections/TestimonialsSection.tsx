"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  avatar: string | null;
  content: string;
  contentEn: string | null;
  rating: number;
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("testimonials");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [current, setCurrent] = useState(0);

  const getLocale = () => {
    if (typeof window === "undefined") return "id";
    return document.cookie.split("; ").find(r => r.startsWith("locale="))?.split("=")[1] || "id";
  };

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section ref={ref} className="section-padding" style={{ backgroundColor: "#2D2D2D", overflow: "hidden" }}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div className="badge" style={{ backgroundColor: "rgba(141,163,153,0.15)", color: "#8DA399", border: "1px solid rgba(141,163,153,0.3)", marginBottom: "1rem" }}>
            Testimonial
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#F4F1EA", letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p style={{ color: "rgba(244,241,234,0.5)", marginTop: "0.6rem" }}>{t("subtitle")}</p>
        </motion.div>

        {/* Main testimonial */}
        {testimonials.length > 0 && (
          <div style={{ maxWidth: "780px", margin: "0 auto" }}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(141,163,153,0.2)",
                borderRadius: "20px",
                padding: "2.5rem",
                position: "relative",
              }}
            >
              <Quote
                size={48}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  color: "rgba(141,163,153,0.15)",
                }}
              />

              {/* Stars */}
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} size={18} fill="#8DA399" color="#8DA399" />
                ))}
              </div>

              <p style={{ fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(244,241,234,0.85)", marginBottom: "2rem", fontStyle: "italic" }}>
                &ldquo;{getLocale() === "en" ? (testimonials[current].contentEn || testimonials[current].content) : testimonials[current].content}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#8DA399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {testimonials[current].name[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#F4F1EA", fontSize: "0.95rem" }}>{testimonials[current].name}</p>
                  <p style={{ color: "rgba(244,241,234,0.5)", fontSize: "0.85rem" }}>
                    {testimonials[current].role}{testimonials[current].company && ` · ${testimonials[current].company}`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  onClick={prev}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid rgba(141,163,153,0.3)",
                    background: "transparent",
                    color: "#8DA399",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      style={{
                        width: i === current ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        backgroundColor: i === current ? "#8DA399" : "rgba(141,163,153,0.3)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        padding: 0,
                      }}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid rgba(141,163,153,0.3)",
                    background: "transparent",
                    color: "#8DA399",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
