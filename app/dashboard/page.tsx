"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Loader2, Coins, Crown, Calendar, Zap, ArrowUpRight, ChevronRight, X,
  CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { CapabilityCard, type CapabilityChannel } from "@/components/dashboard/CapabilityCard";

interface Me {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    phoneVerified: string | null;
    isBanned: boolean;
    onboardingDone?: boolean;
    businessName?: string | null;
    personaStyle?: string | null;
    subscription: {
      status: string;
      package: { id: string; title: string; price: string };
      creditsTotal: number;
      creditsUsed: number;
      startsAt: string;
      endsAt: string | null;
      trialEndsAt: string | null;
    } | null;
    capabilities: { channel: CapabilityChannel; enabled: boolean; grantedByPlan: boolean }[];
    connections: { id: string; channel: string; status: string; handle: string | null; createdAt: string }[];
  };
  usage: { channel: string; credits: number }[];
}

const STATUS_BADGE: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  TRIAL: { color: "#f59e0b", label: "Trial", icon: <Zap size={12} /> },
  ACTIVE: { color: "#10b981", label: "Aktif", icon: <CheckCircle2 size={12} /> },
  PAST_DUE: { color: "#ef4444", label: "Tertunggak", icon: <AlertTriangle size={12} /> },
  CANCELLED: { color: "#6b7280", label: "Dibatalkan", icon: <X size={12} /> },
  EXPIRED: { color: "#6b7280", label: "Kedaluwarsa", icon: <Clock size={12} /> },
  DORMANT: { color: "#a78bfa", label: "Dormant", icon: <Clock size={12} /> },
};

export default function DashboardOverviewPage() {
  const [data, setData] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeFor, setUpgradeFor] = useState<{ channel: CapabilityChannel; minPlan: string } | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Gagal memuat akun");
      setData(await res.json());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat akun");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
      </div>
    );
  }
  if (!data) return null;

  const u = data.user;
  const sub = u.subscription;
  const usagePct = sub && sub.creditsTotal > 0
    ? Math.min(100, Math.round((sub.creditsUsed / sub.creditsTotal) * 100))
    : 0;
  const statusInfo = STATUS_BADGE[sub?.status || ""] || STATUS_BADGE.EXPIRED;
  const planTitle = sub?.package.title || "Belum berlangganan";
  const enabledCaps = u.capabilities.filter((c) => c.enabled);
  const grantedCaps = u.capabilities.filter((c) => c.grantedByPlan);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
          Halo, {u.name?.split(" ")[0] || "there"}
        </h1>
        <p style={{ color: "#6b6b6b" }}>Pantau usage, kelola connect, dan kontrol Pega di sini.</p>
      </div>

      {/* Onboarding nudge */}
      {!u.onboardingDone && (
        <div style={{
          backgroundColor: "#fef3c7",
          border: "1px solid #fde68a",
          padding: "1.25rem 1.5rem",
          borderRadius: 16,
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 2 }}>
              Setup Pega Anda dulu
            </div>
            <div style={{ fontSize: "0.85rem", color: "#78350f" }}>
              Kasih konteks bisnis + persona biar Pega bisa balas customer dengan tone Anda.
            </div>
          </div>
          <Link href="/onboarding" style={{
            padding: "0.65rem 1.2rem",
            backgroundColor: "#2D2D2D",
            color: "white",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.85rem",
            whiteSpace: "nowrap",
          }}>
            Mulai Setup
          </Link>
        </div>
      )}

      {/* Plan + Usage */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{
          backgroundColor: "#2D2D2D",
          color: "#F4F1EA",
          padding: "1.5rem",
          borderRadius: "16px",
          backgroundImage: "linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(141,163,153,0.2) 0%, transparent 60%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Crown size={18} color="#8DA399" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8DA399" }}>
                Paket Anda
              </span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#F4F1EA" }}>{planTitle}</h2>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "4px 10px",
              backgroundColor: statusInfo.color,
              color: "white",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
            }}>
              {statusInfo.icon} {statusInfo.label}
            </span>

            {sub?.endsAt && (
              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "rgba(244,241,234,0.7)" }}>
                <Calendar size={14} style={{ display: "inline", marginRight: 6 }} />
                Berakhir {new Date(sub.endsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            {sub?.status === "TRIAL" && sub.trialEndsAt && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#f59e0b" }}>
                Trial sampai {new Date(sub.trialEndsAt).toLocaleDateString("id-ID")}
              </div>
            )}

            <Link href="/services" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1.25rem",
              padding: "0.6rem 1.25rem",
              backgroundColor: "#8DA399",
              color: "#F4F1EA",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}>
              {sub ? "Upgrade Paket" : "Pilih Paket"} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Coins size={18} color="#8DA399" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b" }}>
              Kredit (30 hari)
            </span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D" }}>
            {sub ? sub.creditsUsed.toLocaleString("id-ID") : 0}
            <span style={{ fontSize: "1rem", color: "#9b9b9b", fontWeight: 600 }}>
              {" "}/ {sub?.creditsTotal.toLocaleString("id-ID") || 0}
            </span>
          </div>
          <div style={{ height: "10px", backgroundColor: "#f3f1ec", borderRadius: 999, marginTop: "0.85rem", overflow: "hidden" }}>
            <div style={{
              width: `${usagePct}%`,
              height: "100%",
              backgroundColor: usagePct > 90 ? "#ef4444" : usagePct > 70 ? "#f59e0b" : "#8DA399",
              transition: "width 0.5s",
            }} />
          </div>
          <p style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: "0.5rem" }}>
            {sub ? `Sisa ${(sub.creditsTotal - sub.creditsUsed).toLocaleString("id-ID")} kredit bulan ini` : "Berlangganan untuk dapat kredit bulanan."}
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D" }}>Channel & Capability</h2>
            <p style={{ color: "#6b6b6b", fontSize: "0.875rem" }}>
              {enabledCaps.length} aktif · {grantedCaps.length} tersedia di paket
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          <CapabilityCard channel="WHATSAPP" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="PEGA_CHAT" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="INSTAGRAM_DM" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="TELEGRAM" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="EMAIL" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="DISCORD" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="INSTAGRAM_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="LINKEDIN_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="FACEBOOK_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="THREADS_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="TWITTER_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="TIKTOK_POST" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="BOOKING_CALENDAR" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="IMAGE_GEN" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
          <CapabilityCard channel="DAILY_NEWS_BRIEFING" caps={u.capabilities} onUpgrade={setUpgradeFor} onConnected={fetchMe} />
        </div>
      </div>

      {/* Recent connection requests */}
      {u.connections.length > 0 && (
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.85rem" }}>
            Permintaan Connect Anda
          </h3>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {u.connections.slice(0, 5).map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 0.85rem", backgroundColor: "#f9f8f6", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{c.channel}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b6b6b" }}>
                    {c.handle && <>handle: {c.handle} · </>}
                    {new Date(c.createdAt).toLocaleString("id-ID")}
                  </div>
                </div>
                <span style={{
                  alignSelf: "center",
                  padding: "3px 10px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  borderRadius: 999,
                  backgroundColor: c.status === "ACTIVE" ? "#10b981" : c.status === "REJECTED" ? "#ef4444" : "#f59e0b",
                  color: "white",
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeFor && (
        <UpgradeModal channel={upgradeFor.channel} minPlan={upgradeFor.minPlan} onClose={() => setUpgradeFor(null)} />
      )}

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function UpgradeModal({ channel, minPlan, onClose }: { channel: CapabilityChannel; minPlan: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(45,45,45,0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          maxWidth: "440px",
          width: "100%",
          padding: "2rem",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "0.85rem", right: "0.85rem", border: "none", background: "transparent", cursor: "pointer", color: "#6b6b6b" }}
        >
          <X size={18} />
        </button>
        <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(245,158,11,0.12)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
          <Crown size={28} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Fitur ini eksklusif paket {minPlan}
        </h2>
        <p style={{ color: "#6b6b6b", marginBottom: "1.5rem", lineHeight: 1.55 }}>
          Untuk mengaktifkan <strong>{channel.replace(/_/g, " ").toLowerCase()}</strong>, silakan upgrade paket Anda ke <strong>{minPlan}</strong> atau lebih tinggi.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/services"
            style={{
              flex: 1,
              padding: "0.85rem",
              backgroundColor: "#2D2D2D",
              color: "white",
              borderRadius: "10px",
              textAlign: "center",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Lihat Paket
          </Link>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.85rem",
              backgroundColor: "white",
              color: "#2D2D2D",
              border: "1px solid #ede9df",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}
