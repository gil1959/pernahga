"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";

type Cell = "yes" | "no" | "partial" | string;

const rows: Array<{ label: string; pega: Cell; admin: Cell; chatgpt: Cell }> = [
  { label: "Aktif 24 jam tanpa absen", pega: "yes", admin: "no", chatgpt: "yes" },
  { label: "Konsisten dengan brand voice Anda", pega: "yes", admin: "partial", chatgpt: "no" },
  { label: "Akses langsung ke Instagram & WhatsApp", pega: "yes", admin: "yes", chatgpt: "no" },
  { label: "Posting konten medsos otomatis", pega: "yes", admin: "partial", chatgpt: "no" },
  { label: "Booking kalender terintegrasi", pega: "yes", admin: "yes", chatgpt: "no" },
  { label: "Laporan harian otomatis", pega: "yes", admin: "partial", chatgpt: "no" },
  { label: "Tidak ada onboarding lama", pega: "yes", admin: "no", chatgpt: "yes" },
  { label: "Bisa di-cancel kapan saja", pega: "yes", admin: "no", chatgpt: "yes" },
  { label: "Biaya per bulan", pega: "Mulai Rp 249rb", admin: "Rp 4-7 juta", chatgpt: "Rp 300rb" },
];

function CellIcon({ value }: { value: Cell | string }) {
  if (value === "yes") return <Check size={18} color="#8DA399" strokeWidth={3} />;
  if (value === "no") return <X size={18} color="#c95757" strokeWidth={2.5} />;
  if (value === "partial") return <Minus size={18} color="#b59c4d" strokeWidth={2.5} />;
  return (
    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2D2D2D" }}>{value}</span>
  );
}

export default function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const headerCellStyle: React.CSSProperties = {
    padding: "1rem 0.85rem",
    fontSize: "0.85rem",
    fontWeight: 700,
    textAlign: "center",
    color: "#2D2D2D",
  };

  const cellStyle: React.CSSProperties = {
    padding: "0.85rem 0.75rem",
    fontSize: "0.9rem",
    color: "#3a3a3a",
    borderTop: "1px solid #ede9df",
    textAlign: "center",
    verticalAlign: "middle",
  };

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
          style={{ textAlign: "center", marginBottom: "2.75rem" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Pilih yang Tepat
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
            Pega vs Hire Admin vs ChatGPT
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
            Bandingkan kemampuan dan biaya. Kami transparan, tidak menyembunyikan kelebihan kompetitor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            border: "1px solid #ede9df",
            boxShadow: "0 8px 30px rgba(45,45,45,0.06)",
            overflow: "hidden",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "640px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#fbfaf6" }}>
                <th style={{ ...headerCellStyle, textAlign: "left", paddingLeft: "1.25rem", width: "38%" }}>
                  Kemampuan
                </th>
                <th style={{ ...headerCellStyle, backgroundColor: "rgba(141,163,153,0.12)" }}>
                  <div style={{ color: "#8DA399", fontWeight: 800 }}>Pega</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b6b6b", fontWeight: 500, marginTop: "0.15rem" }}>
                    AI Asisten Managed
                  </div>
                </th>
                <th style={headerCellStyle}>
                  <div>Hire Admin</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b6b6b", fontWeight: 500, marginTop: "0.15rem" }}>
                    Karyawan tetap
                  </div>
                </th>
                <th style={headerCellStyle}>
                  <div>ChatGPT</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b6b6b", fontWeight: 500, marginTop: "0.15rem" }}>
                    AI generic
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellStyle, textAlign: "left", paddingLeft: "1.25rem", fontWeight: 500 }}>
                    {row.label}
                  </td>
                  <td style={{ ...cellStyle, backgroundColor: "rgba(141,163,153,0.06)" }}>
                    <CellIcon value={row.pega} />
                  </td>
                  <td style={cellStyle}>
                    <CellIcon value={row.admin} />
                  </td>
                  <td style={cellStyle}>
                    <CellIcon value={row.chatgpt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "#8b8b8b",
            fontSize: "0.8rem",
          }}
        >
          Estimasi biaya admin berdasar UMR Jakarta + tunjangan. ChatGPT Plus per akun standar.
        </p>
      </div>
    </section>
  );
}
