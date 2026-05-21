"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Image as ImageIcon, FileText, Calendar, Users, Inbox } from "lucide-react";

const features = [
  {
    icon: <MessageSquare size={24} />,
    title: "Balas DM Customer Otomatis",
    desc: "Pega membalas DM Instagram, WhatsApp, dan Telegram dalam tone Anda. Konsisten dan responsif tanpa Anda harus stand-by.",
  },
  {
    icon: <ImageIcon size={24} />,
    title: "Posting Konten Medsos Terjadwal",
    desc: "Bikin caption, susun visual, dan posting feed Instagram sesuai jadwal yang Anda tetapkan setiap minggu.",
  },
  {
    icon: <Inbox size={24} />,
    title: "Lead Qualification & Nurture",
    desc: "Saring lead masuk, kasih jawaban awal, lanjut nurture sampai siap closing. Anda hanya turun untuk closing.",
  },
  {
    icon: <Calendar size={24} />,
    title: "Booking Kalender Terintegrasi",
    desc: "Customer booking sesi langsung ke kalender Anda. Pega konfirmasi, kirim pengingat, dan reschedule otomatis.",
  },
  {
    icon: <FileText size={24} />,
    title: "Laporan Harian via WhatsApp",
    desc: "Setiap pagi Anda dapat ringkasan: jumlah DM, lead masuk, booking, dan top interaksi customer dari semalam.",
  },
  {
    icon: <Users size={24} />,
    title: "Knowledge Base Customer",
    desc: "Upload FAQ, harga, dan info brand. Pega pakai itu untuk jawab pertanyaan dengan akurat tanpa salah info.",
  },
];

export default function WhatPegaDoesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ backgroundColor: "white", overflow: "hidden" }}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Apa yang Pega Kerjain
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
            Enam Tugas Operasional yang Habis Waktu Anda
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
            Pega ngambil alih kerjaan repetitif yang biasanya bikin Anda stuck di laptop sampai malam.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                backgroundColor: "#F4F1EA",
                border: "1px solid #ede9df",
                borderRadius: "16px",
                padding: "1.75rem 1.5rem",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(141,163,153,0.18)",
                  color: "#8DA399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {f.icon}
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
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#5b5b5b",
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
