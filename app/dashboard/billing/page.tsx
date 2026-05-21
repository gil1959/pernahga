"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Crown, Calendar, ArrowUpRight, MessageSquare } from "lucide-react";

interface Sub {
  status: string;
  package: { title: string; price: string };
  creditsTotal: number;
  creditsUsed: number;
  startsAt: string;
  endsAt: string | null;
  trialEndsAt: string | null;
}

const STATUS_COPY: Record<string, { color: string; label: string }> = {
  TRIAL: { color: "#f59e0b", label: "Trial Aktif" },
  ACTIVE: { color: "#10b981", label: "Aktif" },
  PAST_DUE: { color: "#ef4444", label: "Tertunggak" },
  CANCELLED: { color: "#6b7280", label: "Dibatalkan" },
  EXPIRED: { color: "#6b7280", label: "Kedaluwarsa" },
  DORMANT: { color: "#a78bfa", label: "Dormant" },
};

export default function BillingPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setSub(data?.user?.subscription || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  if (loading) return <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}><Loader2 style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} size={32} /></div>;

  const status = sub ? STATUS_COPY[sub.status] : null;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>Paket & Billing</h1>
      <p style={{ color: "#6b6b6b", marginBottom: "2rem" }}>Detail langganan dan tagihan akun Anda</p>

      {!sub ? (
        <div style={{ backgroundColor: "white", padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px solid #ede9df" }}>
          <Crown size={48} color="#cbd5e1" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Belum ada paket aktif</h2>
          <p style={{ color: "#6b6b6b", marginBottom: "1.5rem" }}>Pilih paket untuk mulai pakai Pega</p>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.85rem 1.5rem", backgroundColor: "#2D2D2D", color: "white", borderRadius: "10px", textDecoration: "none", fontWeight: 700 }}>
            Lihat Paket <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: "#2D2D2D",
            color: "white",
            padding: "2rem",
            borderRadius: "16px",
            backgroundImage: "linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "1.5rem",
          }}>
            <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(141,163,153,0.2) 0%, transparent 60%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", textTransform: "uppercase", letterSpacing: "0.08em" }}>Paket Saat Ini</span>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0" }}>{sub.package.title}</h2>
              <div style={{ fontSize: "1.25rem", color: "rgba(244,241,234,0.85)" }}>
                {sub.package.price === "custom" || sub.package.price === "Gratis" ? sub.package.price : `Rp ${Number(sub.package.price).toLocaleString("id-ID")} / bulan`}
              </div>
              {status && (
                <span style={{ display: "inline-flex", alignItems: "center", marginTop: "1rem", padding: "4px 12px", backgroundColor: status.color, borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {status.label}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Mulai</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2D2D2D", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} color="#8DA399" /> {new Date(sub.startsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", marginBottom: "0.5rem" }}>{sub.status === "TRIAL" ? "Trial sampai" : "Berakhir"}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2D2D2D", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} color="#8DA399" />
                {sub.status === "TRIAL"
                  ? (sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—")
                  : (sub.endsAt ? new Date(sub.endsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—")}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fffbf0", padding: "1.5rem", borderRadius: "16px", border: "1px solid #fde68a" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>Butuh upgrade / cancel?</h3>
            <p style={{ color: "#6b6b6b", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Hubungi admin via WhatsApp atau lihat paket lain di halaman Paket.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.25rem", backgroundColor: "#2D2D2D", color: "white", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>
                Lihat Paket Lain <ArrowUpRight size={14} />
              </Link>
              <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.25rem", backgroundColor: "white", color: "#2D2D2D", border: "1px solid #ede9df", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>
                <MessageSquare size={14} /> Kontak Admin
              </Link>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
