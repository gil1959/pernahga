"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

interface Showcase {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  thumbnail: string;
  tags: string;
  techStack: string;
  isFeatured: boolean;
}

export default function ShowcaseSection({ showcases }: { showcases: Showcase[] }) {
  const t = useTranslations("showcase");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const getLocale = () => {
    if (typeof window === "undefined") return "id";
    return document.cookie.split("; ").find(r => r.startsWith("locale="))?.split("=")[1] || "id";
  };

  return (
    <section ref={ref} className="section-padding" style={{ backgroundColor: "#ede9df" }}>
      <div className="container-custom">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-dark" style={{ marginBottom: "0.75rem" }}>Portofolio</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
              {t("title")}
            </h2>
            <p style={{ color: "#6b6b6b", marginTop: "0.5rem", maxWidth: "480px", fontSize: "0.95rem" }}>
              {t("subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/showcase" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              {t("viewAll")}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {showcases.map((item, i) => {
            const locale = getLocale();
            const title = locale === "en" ? item.titleEn : item.title;
            const description = locale === "en" ? item.descriptionEn : item.description;
            const tags: string[] = JSON.parse(item.tags);
            const techStack: string[] = JSON.parse(item.techStack);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="card-hover"
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid #ddd8ce",
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <img
                    src={item.thumbnail}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                  />
                  {item.isFeatured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "#8DA399",
                        color: "white",
                        padding: "0.2rem 0.65rem",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Featured
                    </div>
                  )}
                </div>

                <div style={{ padding: "1.5rem" }}>
                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.875rem" }}>
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-green" style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b6b6b", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {description}
                  </p>

                  {/* Tech stack */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
                    {techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          padding: "0.2rem 0.6rem",
                          backgroundColor: "#f4f1ea",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#4a4a4a",
                          border: "1px solid #ede9df",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/showcase/${item.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "#8DA399",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      transition: "gap 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.gap = "0.65rem")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.gap = "0.4rem")}
                  >
                    {t("viewDetail")}
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
