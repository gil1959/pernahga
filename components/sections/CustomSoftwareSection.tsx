"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Cpu, Rocket, Smartphone, Globe, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <Globe size={24} />,
    title: "Web & SaaS Development",
    desc: "Pembuatan aplikasi berbasis web dan dashboard operasional custom yang dioptimasi untuk kecepatan, skalabilitas, dan UI/UX profesional.",
  },
  {
    icon: <Cpu size={24} />,
    title: "Integrasi AI & Otomasi",
    desc: "Suntikkan kecerdasan buatan ke sistem Anda. Dari AI chatbot internal, data analysis otomatis, hingga integrasi API LLM terpusat.",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Mobile App Development",
    desc: "Aplikasi Android & iOS yang native dan responsif, terkoneksi langsung dengan database pusat dan ekosistem bisnis Anda.",
  },
  {
    icon: <Code2 size={24} />,
    title: "Custom System Architecture",
    desc: "Rancang bangun arsitektur sistem dari nol sesuai alur bisnis (workflow) spesifik yang tidak bisa diakomodasi software pabrikan.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Security & Maintenance",
    desc: "Sistem yang di-deploy dijaga dengan standar keamanan tinggi, maintenance berkala, dan jaminan uptime server.",
  },
  {
    icon: <Rocket size={24} />,
    title: "Scale-Ready Infrastructure",
    desc: "Infrastruktur cloud modern yang siap menampung lonjakan traffic tanpa membuat sistem bisnis Anda down.",
  },
];

export default function CustomSoftwareSection() {
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
            Software Custom
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
            Digitalisasi Bisnis Tanpa Batas dengan Solusi Custom
          </h2>
          <p
            style={{
              color: "#6b6b6b",
              fontSize: "1rem",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Selain Pega AI Assistant, kami juga membangun ekosistem software custom penuh yang dirancang spesifik untuk workflow unik perusahaan Anda.
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
