"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Scale, Building2, Home, Mic2, Sparkles } from "lucide-react";

const useCases = [
  {
    icon: <Briefcase size={26} />,
    title: "Coach & Konsultan",
    desc: "Pega handle DM lead, qualifikasi prospek, dan booking sesi. Anda fokus ngajar dan konsultasi.",
    metric: "Hemat 25 jam/minggu",
  },
  {
    icon: <Scale size={26} />,
    title: "Lawyer Praktek Mandiri",
    desc: "Pega screening pertanyaan klien awal, kirim brosur layanan, dan jadwalkan konsultasi formal.",
    metric: "3x lebih banyak konsultasi",
  },
  {
    icon: <Home size={26} />,
    title: "Agen Properti Top",
    desc: "Pega balas inquiry listing, kirim brochure unit, dan setup viewing sesuai kalendar Anda.",
    metric: "20+ inquiry/hari ter-handle",
  },
  {
    icon: <Building2 size={26} />,
    title: "UMKM Berkembang",
    desc: "Pega jadi customer service yang ngga pernah absen. Tim kecil tetap bisa scale tanpa hire admin.",
    metric: "Setara 1 admin penuh",
  },
  {
    icon: <Mic2 size={26} />,
    title: "Content Creator B2B",
    desc: "Pega kelola kolaborasi DM brand, posting jadwal konten, dan recap performance harian.",
    metric: "Posting konsisten 7 hari",
  },
  {
    icon: <Sparkles size={26} />,
    title: "Solo Founder Startup",
    desc: "Pega tangani inbound leads, schedule demo, dan recap pipeline ke email tiap pagi.",
    metric: "Lead response < 5 menit",
  },
];

export default function UseCaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ backgroundColor: "white" }}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Buat Siapa Pega Cocok
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#2D2D2D",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Profesional yang Sudah Beralih ke Pega
          </h2>
          <p
            style={{
              color: "#6b6b6b",
              fontSize: "1rem",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Mereka yang menghargai waktu lebih dari sekadar uang. Kalau ada satu yang mirip Anda, mungkin sudah saatnya pindah.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {useCases.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                backgroundColor: "#F4F1EA",
                borderRadius: "16px",
                padding: "1.75rem 1.5rem",
                border: "1px solid #ede9df",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  backgroundColor: "#2D2D2D",
                  color: "#8DA399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {u.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#2D2D2D",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {u.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#5b5b5b",
                  lineHeight: 1.65,
                  marginBottom: "1rem",
                }}
              >
                {u.desc}
              </p>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.75rem",
                  backgroundColor: "rgba(141,163,153,0.15)",
                  border: "1px solid rgba(141,163,153,0.3)",
                  color: "#6d8a7f",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: "50px",
                }}
              >
                {u.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
