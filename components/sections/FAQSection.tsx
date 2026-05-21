"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Bagaimana cara membatalkan langganan?",
    a: "Cukup satu klik di dashboard. Tidak ada dialog retensi, tidak ada pertanyaan menyebalkan. Kami menyimpan setting Anda 90 hari, jadi kalau ingin lanjut nanti tinggal aktifkan kembali.",
  },
  {
    q: "Apakah data customer saya aman?",
    a: "Ya. Token akses dienkripsi AES-256, workspace tiap buyer terisolasi, dan semua koneksi pakai OAuth resmi. Kami tidak pernah menyimpan password Anda dan patuh UU PDP 2024.",
  },
  {
    q: "Channel apa saja yang didukung?",
    a: "Instagram (Business/Creator), WhatsApp Business, Telegram, dan LinkedIn (paket Pro+). Kami akan tambah Threads dan TikTok segera.",
  },
  {
    q: "Bagaimana sistem kredit bekerja?",
    a: "Setiap aksi Pega (balas DM, posting, generate caption, dll) menggunakan kredit. Kuota kredit di-refresh otomatis sesuai paket. Sisa kredit bisa di-top up kapan saja.",
  },
  {
    q: "Apakah saya bisa upgrade atau downgrade?",
    a: "Bisa kapan saja. Saat upgrade, biaya disesuaikan secara prorata. Saat downgrade, perubahan berlaku di siklus billing berikutnya.",
  },
  {
    q: "Apakah saya bisa atur tone Pega sesuai brand saya?",
    a: "Ya. Anda bisa atur persona, tone (formal/santai/ramah), jam aktif, dan upload knowledge base. Pega akan menyesuaikan gaya bicara persis seperti brand Anda.",
  },
  {
    q: "Bagaimana kalau Pega salah merespons customer?",
    a: "Setiap aksi tercatat di audit log. Anda bisa intervensi atau perbaiki kapan saja. Pega juga belajar dari koreksi Anda untuk respons selanjutnya.",
  },
  {
    q: "Apakah ada kontrak jangka panjang?",
    a: "Tidak. Bayar bulanan, batalkan kapan saja. Untuk paket Enterprise tersedia kontrak tahunan dengan diskon.",
  },
];

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: "14px",
        backgroundColor: "white",
        border: "1px solid #ede9df",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "1.1rem 1.25rem",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#2D2D2D" }}>{q}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: open ? "#8DA399" : "rgba(141,163,153,0.15)",
            color: open ? "white" : "#8DA399",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 1.25rem 1.1rem", color: "#5b5b5b", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ backgroundColor: "#F4F1EA" }}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "2.5rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Pertanyaan Umum
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
            Hal yang Sering Ditanyakan
          </h2>
          <p
            style={{
              color: "#6b6b6b",
              fontSize: "1rem",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Kalau jawaban Anda belum di sini, langsung tanya tim kami via WhatsApp.
          </p>
        </motion.div>

        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <FAQItem
                q={f.q}
                a={f.a}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
