/**
 * /data-deletion — public page (no auth) that explains how a user can
 * request deletion of their PernahGa account and any data we received
 * from Meta (Facebook / Instagram / Threads).
 *
 * MANDATORY untuk Meta App Review (User Data Deletion URL).
 * Compliance:
 *   - Meta Platform Terms (User Data Deletion Request callback)
 *   - Indonesian PDP Law UU 27/2022 tentang Pelindungan Data Pribadi
 */
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import Link from "next/link";
import { Mail, Trash2, ShieldCheck, Clock } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Penghapusan Data — PernahGa",
  description:
    "Cara mengajukan penghapusan akun dan data PernahGa. Patuh dengan Meta Platform Terms dan UU 27/2022 (PDP Law).",
  alternates: { canonical: "https://www.pernahga.com/data-deletion" },
  robots: { index: true, follow: true },
};

const SUPPORT_EMAIL = "support@pernahga.com";

export default function DataDeletionPage() {
  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: 70, backgroundColor: "#F4F1EA", minHeight: "100vh" }}>
        {/* Header band */}
        <div style={{ backgroundColor: "#2D2D2D", padding: "4rem 0", textAlign: "center" }}>
          <div className="container-custom">
            <h1
              style={{
                fontSize: "clamp(2rem, 3vw, 2.5rem)",
                fontWeight: 800,
                color: "#F4F1EA",
                letterSpacing: "-0.02em",
              }}
            >
              Penghapusan Data
            </h1>
            <p
              style={{
                color: "rgba(244,241,234,0.75)",
                marginTop: "0.5rem",
                fontSize: "0.95rem",
              }}
            >
              Cara mengajukan penghapusan akun PernahGa dan data Meta yang terhubung.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="container-custom" style={{ padding: "3rem 1.5rem" }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "3rem",
              borderRadius: 20,
              border: "1px solid #ede9df",
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#2D2D2D" }}>
              PernahGa menghormati hak kamu atas data pribadi. Kalau kamu mau menghapus
              akun PernahGa beserta semua data yang kami terima dari Meta (Facebook,
              Instagram, Threads), ada dua jalur yang bisa kamu pilih.
            </p>

            <SectionCard
              icon={<Trash2 size={20} color="#8DA399" />}
              title="Opsi 1 — Hapus dari dalam aplikasi"
            >
              <ol
                style={{
                  paddingLeft: "1.2rem",
                  color: "#2D2D2D",
                  display: "grid",
                  gap: 8,
                  lineHeight: 1.7,
                }}
              >
                <li>
                  Login ke{" "}
                  <Link
                    href="/dashboard"
                    style={{ color: "#8DA399", fontWeight: 700, textDecoration: "underline" }}
                  >
                    dashboard PernahGa
                  </Link>
                  .
                </li>
                <li>
                  Buka <strong>Settings</strong> &rarr; <strong>Akun</strong>.
                </li>
                <li>
                  Klik <strong>Delete Account</strong>, lalu konfirmasi via email.
                </li>
                <li>
                  Semua data terkait Meta (token, page ID, IG handle, riwayat DM) akan
                  dihapus permanen dalam 30 hari.
                </li>
              </ol>
            </SectionCard>

            <SectionCard
              icon={<Mail size={20} color="#8DA399" />}
              title="Opsi 2 — Email ke tim support"
            >
              <p style={{ color: "#2D2D2D", lineHeight: 1.7, marginBottom: 12 }}>
                Kalau kamu ga punya akses ke dashboard, kirim email ke{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Permintaan%20Penghapusan%20Data`}
                  style={{ color: "#8DA399", fontWeight: 700, textDecoration: "underline" }}
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                dengan subjek <em>&quot;Permintaan Penghapusan Data&quot;</em>. Sertakan:
              </p>
              <ul
                style={{
                  paddingLeft: "1.2rem",
                  color: "#2D2D2D",
                  display: "grid",
                  gap: 6,
                  lineHeight: 1.7,
                }}
              >
                <li>Nama lengkap dan email yang dipakai daftar di PernahGa.</li>
                <li>Username Instagram / Facebook Page yang terhubung (kalau ingat).</li>
                <li>Alasan singkat (opsional, buat feedback kami).</li>
              </ul>
              <p style={{ color: "#6b6b6b", fontSize: "0.85rem", marginTop: 12, lineHeight: 1.7 }}>
                Tim kami akan konfirmasi dalam 2x24 jam kerja, dan menyelesaikan
                penghapusan dalam 30 hari kalender.
              </p>
            </SectionCard>

            <SectionCard
              icon={<ShieldCheck size={20} color="#8DA399" />}
              title="Apa yang akan dihapus"
            >
              <ul
                style={{
                  paddingLeft: "1.2rem",
                  color: "#2D2D2D",
                  display: "grid",
                  gap: 6,
                  lineHeight: 1.7,
                }}
              >
                <li>Profil akun PernahGa (nama, email, nomor HP, password hash).</li>
                <li>Token akses Meta (FB Page, Instagram Business, Threads).</li>
                <li>Daftar Page / IG Business / Threads handle yang terhubung.</li>
                <li>Riwayat DM, komentar, dan log webhook yang masuk via Meta.</li>
                <li>Konten yang kamu buat di PernahGa (caption, post draft, media).</li>
              </ul>
              <p style={{ color: "#6b6b6b", fontSize: "0.85rem", marginTop: 12, lineHeight: 1.7 }}>
                Catatan: data yang sudah dipost ke Facebook / Instagram / Threads tetap ada
                di platform Meta. Untuk hapus dari sana, kamu perlu hapus langsung lewat
                aplikasi resmi mereka.
              </p>
            </SectionCard>

            <SectionCard
              icon={<Clock size={20} color="#8DA399" />}
              title="Jangka waktu &amp; kepatuhan"
            >
              <p style={{ color: "#2D2D2D", lineHeight: 1.7 }}>
                PernahGa tunduk pada{" "}
                <a
                  href="https://developers.facebook.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#8DA399", fontWeight: 700, textDecoration: "underline" }}
                >
                  Meta Platform Terms
                </a>{" "}
                dan Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang
                Pelindungan Data Pribadi (UU PDP). Permintaan penghapusan akan diproses
                paling lambat 30 (tiga puluh) hari kalender setelah permintaan diterima
                dan diverifikasi.
              </p>
              <p style={{ color: "#2D2D2D", lineHeight: 1.7, marginTop: 12 }}>
                Sebagian data tertentu (misal: log billing, faktur pajak) mungkin tetap
                kami simpan terbatas waktu sesuai kewajiban hukum perpajakan. Detailnya
                ada di{" "}
                <Link
                  href="/privacy"
                  style={{ color: "#8DA399", fontWeight: 700, textDecoration: "underline" }}
                >
                  Kebijakan Privasi
                </Link>
                .
              </p>
            </SectionCard>

            <div
              style={{
                marginTop: "2rem",
                padding: "1.25rem 1.5rem",
                backgroundColor: "#F4F1EA",
                borderRadius: 12,
                border: "1px solid #ede9df",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "#6b6b6b", lineHeight: 1.7, margin: 0 }}>
                Punya pertanyaan? Kirim email ke{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  style={{ color: "#8DA399", fontWeight: 700 }}
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                atau lihat{" "}
                <Link href="/privacy" style={{ color: "#8DA399", fontWeight: 700 }}>
                  Kebijakan Privasi
                </Link>{" "}
                untuk detail penanganan data.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </SessionProvider>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "0.85rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#F4F1EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "#2D2D2D",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: 4 }}>{children}</div>
    </section>
  );
}
