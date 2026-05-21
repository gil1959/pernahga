"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Lock, CheckCircle2, MessageCircle, Send, Mail, Hash, Calendar, Film, Newspaper, Webhook } from "lucide-react";

export type CapabilityChannel =
  | "WHATSAPP" | "INSTAGRAM_DM" | "TELEGRAM" | "EMAIL" | "DISCORD"
  | "INSTAGRAM_POST" | "FACEBOOK_POST" | "LINKEDIN_POST" | "THREADS_POST" | "TWITTER_POST"
  | "TIKTOK_POST" | "PINTEREST_POST"
  | "BOOKING_CALENDAR" | "IMAGE_GEN" | "VIDEO_SCRIPT" | "DAILY_NEWS_BRIEFING"
  | "WEBHOOK_INTEGRATION" | "WHITE_LABEL";

const CAP_META: Record<CapabilityChannel, {
  label: string;
  desc: string;
  minPlan: string;
  iconBg: string;
  icon: React.ReactNode;
}> = {
  WHATSAPP: { label: "WhatsApp", desc: "CS bot WA dengan tone Anda", minPlan: "Starter", iconBg: "#25d366", icon: <MessageCircle size={18} color="white" /> },
  INSTAGRAM_DM: { label: "Instagram DM", desc: "Auto-reply DM IG 24/7", minPlan: "Starter", iconBg: "#E4405F", icon: <MessageCircle size={18} color="white" /> },
  TELEGRAM: { label: "Telegram", desc: "Bot Telegram custom", minPlan: "Starter", iconBg: "#0088cc", icon: <Send size={18} color="white" /> },
  EMAIL: { label: "Email", desc: "Auto-reply email customer", minPlan: "Pro", iconBg: "#6366f1", icon: <Mail size={18} color="white" /> },
  DISCORD: { label: "Discord", desc: "Bot Discord komunitas", minPlan: "Business", iconBg: "#5865F2", icon: <Hash size={18} color="white" /> },
  INSTAGRAM_POST: { label: "Auto-Post Instagram", desc: "Post feed/reels/story terjadwal", minPlan: "Pro", iconBg: "#E4405F", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>IG</span> },
  FACEBOOK_POST: { label: "Auto-Post Facebook", desc: "Post FB page terjadwal", minPlan: "Pro", iconBg: "#1877F2", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>FB</span> },
  LINKEDIN_POST: { label: "Auto-Post LinkedIn", desc: "Post LinkedIn personal/company", minPlan: "Pro", iconBg: "#0A66C2", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>in</span> },
  THREADS_POST: { label: "Auto-Post Threads", desc: "Post Threads terjadwal", minPlan: "Pro", iconBg: "#000000", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>@</span> },
  TWITTER_POST: { label: "Auto-Post X/Twitter", desc: "Post X/Twitter terjadwal", minPlan: "Pro", iconBg: "#000000", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>X</span> },
  TIKTOK_POST: { label: "Auto-Post TikTok", desc: "Post TikTok terjadwal", minPlan: "Business", iconBg: "#000000", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>TT</span> },
  PINTEREST_POST: { label: "Auto-Post Pinterest", desc: "Pin Pinterest terjadwal", minPlan: "Business", iconBg: "#E60023", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>P</span> },
  BOOKING_CALENDAR: { label: "Booking Calendar", desc: "Google Calendar / Cal.com", minPlan: "Pro", iconBg: "#3b82f6", icon: <Calendar size={18} color="white" /> },
  IMAGE_GEN: { label: "Image Generation", desc: "AI image untuk konten", minPlan: "Pro", iconBg: "#a855f7", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>AI</span> },
  VIDEO_SCRIPT: { label: "Video Script", desc: "Storyboard + script otomatis", minPlan: "Business", iconBg: "#ec4899", icon: <Film size={18} color="white" /> },
  DAILY_NEWS_BRIEFING: { label: "Briefing Berita Harian", desc: "Update industri tiap pagi", minPlan: "Pro", iconBg: "#f59e0b", icon: <Newspaper size={18} color="white" /> },
  WEBHOOK_INTEGRATION: { label: "Webhook Integration", desc: "CRM / ERP / Notion", minPlan: "Business", iconBg: "#06b6d4", icon: <Webhook size={18} color="white" /> },
  WHITE_LABEL: { label: "White-Label", desc: "Brand sebagai milik Anda", minPlan: "Enterprise", iconBg: "#64748b", icon: <span style={{ color: "white", fontWeight: 800, fontSize: 11 }}>WL</span> },
};

interface Props {
  channel: CapabilityChannel;
  caps: { channel: CapabilityChannel; enabled: boolean; grantedByPlan: boolean }[];
  onUpgrade: (info: { channel: CapabilityChannel; minPlan: string }) => void;
  onConnected: () => void;
}

export function CapabilityCard({ channel, caps, onUpgrade, onConnected }: Props) {
  const meta = CAP_META[channel];
  const cap = caps.find((c) => c.channel === channel);
  const enabled = cap?.enabled ?? false;
  const granted = cap?.grantedByPlan ?? false;

  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConnect = () => {
    if (!enabled) {
      onUpgrade({ channel, minPlan: meta.minPlan });
      return;
    }
    setOpen(true);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/connection-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, handle, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.duplicate ? "Permintaan sudah ada, admin akan menghubungi" : "Permintaan dikirim, admin akan kontak segera");
      setOpen(false);
      setHandle("");
      setNotes("");
      onConnected();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid #ede9df",
        padding: "1.25rem",
        opacity: enabled ? 1 : 0.85,
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {meta.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#2D2D2D", fontSize: "0.95rem" }}>{meta.label}</div>
            <div style={{ fontSize: "0.78rem", color: "#6b6b6b", lineHeight: 1.3 }}>{meta.desc}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {enabled ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>
              <CheckCircle2 size={12} /> AKTIF
            </span>
          ) : granted ? (
            <span style={{ fontSize: "0.72rem", color: "#f59e0b", fontWeight: 700 }}>BELUM AKTIF</span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#9b9b9b", fontWeight: 700 }}>
              <Lock size={11} /> {meta.minPlan.toUpperCase()}+
            </span>
          )}
          <button
            onClick={handleConnect}
            disabled={submitting}
            style={{
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: enabled ? "#2D2D2D" : "#f3f1ec",
              color: enabled ? "white" : "#6b6b6b",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            {enabled ? "Connect" : "Upgrade"}
          </button>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45,45,45,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: "16px", maxWidth: "440px", width: "100%", padding: "2rem" }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              {meta.icon}
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.4rem" }}>
              Connect {meta.label}
            </h2>
            <p style={{ color: "#6b6b6b", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
              Isi info berikut. Admin akan menghubungi Anda untuk proses connect manual.
            </p>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  Handle / Akun
                </label>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="contoh: @namaanda atau nomor WA"
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #ede9df", borderRadius: "10px", outline: "none", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail tambahan (jam aktif, persona Pega, dll)"
                  rows={3}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #ede9df", borderRadius: "10px", outline: "none", fontSize: "0.9rem", resize: "vertical" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                onClick={submit}
                disabled={submitting || !handle.trim()}
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  backgroundColor: "#2D2D2D",
                  color: "white",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: submitting ? "wait" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.4rem",
                  opacity: submitting || !handle.trim() ? 0.7 : 1,
                }}
              >
                {submitting && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                Kirim Permintaan
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={submitting}
                style={{ flex: 1, padding: "0.85rem", backgroundColor: "white", color: "#2D2D2D", borderRadius: "10px", border: "1px solid #ede9df", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
