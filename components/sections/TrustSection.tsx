"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Lock, FileCheck, Cpu, Globe2, KeyRound } from "lucide-react";

const trustItems = [
  {
    icon: <ShieldCheck size={24} />,
    title: "Enkripsi AES-256",
    desc: "Token akses akun customer dienkripsi end-to-end. Hanya Pega yang bisa baca, kami tidak menyimpan password.",
  },
  {
    icon: <Lock size={24} />,
    title: "Workspace Terisolasi",
    desc: "Setiap buyer punya workspace terpisah. Data Anda tidak pernah bercampur dengan customer lain.",
  },
  {
    icon: <FileCheck size={24} />,
    title: "Patuh UU PDP",
    desc: "Sesuai Undang-Undang Perlindungan Data Pribadi 2024. Audit log lengkap, retention sesuai regulasi.",
  },
  {
    icon: <KeyRound size={24} />,
    title: "OAuth Resmi",
    desc: "Koneksi via OAuth Meta, Google, dan partner BSP resmi. Tidak ada scraping, tidak ada akun palsu.",
  },
  {
    icon: <Cpu size={24} />,
    title: "Audit Trail Transparan",
    desc: "Setiap aksi Pega tercatat. Anda bisa lihat dan ekspor seluruh riwayat kapan saja.",
  },
  {
    icon: <Globe2 size={24} />,
    title: "Server Domestik",
    desc: "Data utama disimpan di server Indonesia. Cocok untuk kebutuhan kepatuhan dan latensi rendah.",
  },
];

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-padding" style={{ backgroundColor: "white" }}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Keamanan & Privasi
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
            Akun Customer Anda, Kendali Tetap di Tangan Anda
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
            Kami serius soal keamanan. Semua koneksi pakai OAuth resmi dan terenkripsi.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                padding: "1.25rem",
                borderRadius: "14px",
                border: "1px solid #ede9df",
                backgroundColor: "#fbfaf6",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(141,163,153,0.18)",
                  color: "#8DA399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#2D2D2D",
                    marginBottom: "0.35rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#5b5b5b", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
