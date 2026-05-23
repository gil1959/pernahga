"use client";

import { useState } from "react";
import { Loader2, Lock, CheckCircle2, Mail, Calendar, Film, Newspaper, Webhook, Sparkles, Crown } from "lucide-react";
import {
  SiWhatsapp,
  SiInstagram,
  SiTelegram,
  SiDiscord,
  SiFacebook,
  SiThreads,
  SiX,
  SiTiktok,
  SiPinterest,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import ConnectModal from "./ConnectModal";

export type CapabilityChannel =
  | "WHATSAPP" | "INSTAGRAM_DM" | "TELEGRAM" | "EMAIL" | "DISCORD"
  | "INSTAGRAM_POST" | "FACEBOOK_POST" | "LINKEDIN_POST" | "THREADS_POST" | "TWITTER_POST"
  | "TIKTOK_POST" | "PINTEREST_POST"
  | "BOOKING_CALENDAR" | "IMAGE_GEN" | "VIDEO_SCRIPT" | "DAILY_NEWS_BRIEFING"
  | "WEBHOOK_INTEGRATION" | "WHITE_LABEL";

/**
 * Capability metadata. Brand logos use react-icons/si (SimpleIcons —
 * accurate brand SVGs with proper marks). Non-brand capabilities
 * (Email, Booking, Image Gen, etc.) keep neutral lucide icons.
 */
const CAP_META: Record<CapabilityChannel, {
  label: string;
  desc: string;
  minPlan: string;
  iconBg: string;
  icon: React.ReactNode;
}> = {
  WHATSAPP: { label: "WhatsApp", desc: "CS bot WA dengan tone Anda", minPlan: "Starter", iconBg: "#25D366", icon: <SiWhatsapp size={20} color="white" /> },
  INSTAGRAM_DM: { label: "Instagram DM", desc: "Auto-reply DM IG 24/7", minPlan: "Starter", iconBg: "#E4405F", icon: <SiInstagram size={20} color="white" /> },
  TELEGRAM: { label: "Telegram", desc: "Bot Telegram custom", minPlan: "Starter", iconBg: "#26A5E4", icon: <SiTelegram size={20} color="white" /> },
  EMAIL: { label: "Email", desc: "Auto-reply email customer", minPlan: "Pro", iconBg: "#6366f1", icon: <Mail size={18} color="white" /> },
  DISCORD: { label: "Discord", desc: "Bot Discord komunitas", minPlan: "Business", iconBg: "#5865F2", icon: <SiDiscord size={20} color="white" /> },
  INSTAGRAM_POST: { label: "Auto-Post Instagram", desc: "Post feed/reels/story terjadwal", minPlan: "Pro", iconBg: "#E4405F", icon: <SiInstagram size={20} color="white" /> },
  FACEBOOK_POST: { label: "Auto-Post Facebook", desc: "Post FB page terjadwal", minPlan: "Pro", iconBg: "#1877F2", icon: <SiFacebook size={20} color="white" /> },
  LINKEDIN_POST: { label: "Auto-Post LinkedIn", desc: "Post LinkedIn personal/company", minPlan: "Pro", iconBg: "#0A66C2", icon: <FaLinkedinIn size={20} color="white" /> },
  THREADS_POST: { label: "Auto-Post Threads", desc: "Post Threads terjadwal", minPlan: "Pro", iconBg: "#000000", icon: <SiThreads size={20} color="white" /> },
  TWITTER_POST: { label: "Auto-Post X/Twitter", desc: "Post X/Twitter terjadwal", minPlan: "Pro", iconBg: "#000000", icon: <SiX size={18} color="white" /> },
  TIKTOK_POST: { label: "Auto-Post TikTok", desc: "Post TikTok terjadwal", minPlan: "Business", iconBg: "#000000", icon: <SiTiktok size={20} color="white" /> },
  PINTEREST_POST: { label: "Auto-Post Pinterest", desc: "Pin Pinterest terjadwal", minPlan: "Business", iconBg: "#BD081C", icon: <SiPinterest size={20} color="white" /> },
  BOOKING_CALENDAR: { label: "Booking Calendar", desc: "Google Calendar / Cal.com", minPlan: "Pro", iconBg: "#3b82f6", icon: <Calendar size={18} color="white" /> },
  IMAGE_GEN: { label: "Image Generation", desc: "AI image untuk konten", minPlan: "Pro", iconBg: "#a855f7", icon: <Sparkles size={18} color="white" /> },
  VIDEO_SCRIPT: { label: "Video Script", desc: "Storyboard + script otomatis", minPlan: "Business", iconBg: "#ec4899", icon: <Film size={18} color="white" /> },
  DAILY_NEWS_BRIEFING: { label: "Briefing Berita Harian", desc: "Update industri tiap pagi", minPlan: "Pro", iconBg: "#f59e0b", icon: <Newspaper size={18} color="white" /> },
  WEBHOOK_INTEGRATION: { label: "Webhook Integration", desc: "CRM / ERP / Notion", minPlan: "Business", iconBg: "#06b6d4", icon: <Webhook size={18} color="white" /> },
  WHITE_LABEL: { label: "White-Label", desc: "Brand sebagai milik Anda", minPlan: "Enterprise", iconBg: "#64748b", icon: <Crown size={18} color="white" /> },
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

  const handleConnect = () => {
    if (!enabled) {
      onUpgrade({ channel, minPlan: meta.minPlan });
      return;
    }
    setOpen(true);
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
        <ConnectModal
          channel={channel}
          meta={{ label: meta.label, iconBg: meta.iconBg, icon: meta.icon }}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            onConnected();
          }}
        />
      )}
    </>
  );
}
