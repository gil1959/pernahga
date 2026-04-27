"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Youtube, Play } from "lucide-react";

interface Education {
  id: string;
  title: string;
  titleEn: string;
  description: string | null;
  descriptionEn: string | null;
  type: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  categoryEn: string | null;
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.181 8.181 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

export default function EducationSection({ educations }: { educations: Education[] }) {
  const t = useTranslations("education");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const getLocale = () => {
    if (typeof window === "undefined") return "id";
    return document.cookie.split("; ").find(r => r.startsWith("locale="))?.split("=")[1] || "id";
  };

  return (
    <section ref={ref} className="section-padding" style={{ backgroundColor: "#F4F1EA" }}>
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
            <div className="badge badge-green" style={{ marginBottom: "0.75rem" }}>
              <Youtube size={14} />
              Edukasi Teknologi
            </div>
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
            <Link href="/education" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              {t("viewAll")}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {educations.map((item, i) => {
            const locale = getLocale();
            const title = locale === "en" ? item.titleEn : item.title;
            const description = locale === "en" ? item.descriptionEn : item.description;
            const category = locale === "en" ? item.categoryEn : item.category;

            const isYoutube = item.type === "YOUTUBE";
            const videoId = isYoutube
              ? item.embedUrl.replace("https://www.youtube.com/embed/", "").split("?")[0]
              : null;
            const ytThumbnail = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : item.thumbnailUrl;

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
                {/* Thumbnail with play overlay */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    backgroundColor: "#2D2D2D",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    window.open(isYoutube
                      ? `https://youtube.com/watch?v=${videoId}`
                      : item.embedUrl.replace("/embed/v2/", "/video/"),
                    "_blank");
                  }}
                >
                  {ytThumbnail ? (
                    <img
                      src={ytThumbnail}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #8DA399, #2D2D2D)" }} />
                  )}

                  {/* Play button */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.2)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.4)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.2)")}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: isYoutube ? "#FF0000" : "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <Play size={22} fill="white" />
                    </div>
                  </div>

                  {/* Platform badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: isYoutube ? "#FF0000" : "#000000",
                      color: "white",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {isYoutube ? <Youtube size={12} /> : <TikTokIcon />}
                    {isYoutube ? "YouTube" : "TikTok"}
                  </div>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  {category && (
                    <span className="badge badge-green" style={{ fontSize: "0.72rem", marginBottom: "0.6rem" }}>
                      {category}
                    </span>
                  )}
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2D2D2D", lineHeight: 1.4, marginBottom: "0.4rem" }}>
                    {title}
                  </h3>
                  {description && (
                    <p style={{ fontSize: "0.825rem", color: "#6b6b6b", lineHeight: 1.6 }}>
                      {description.length > 100 ? description.substring(0, 100) + "..." : description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
