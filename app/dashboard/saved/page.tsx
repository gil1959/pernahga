import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Activity as ActivityIcon, Zap, MessageSquare, Image as ImageIcon, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM_DM: "Instagram DM",
  TELEGRAM: "Telegram",
  EMAIL: "Email",
  DISCORD: "Discord",
  INSTAGRAM_POST: "Instagram Post",
  FACEBOOK_POST: "Facebook Post",
  LINKEDIN_POST: "LinkedIn Post",
  THREADS_POST: "Threads",
  TWITTER_POST: "Twitter/X",
  TIKTOK_POST: "TikTok",
  PINTEREST_POST: "Pinterest",
  BOOKING_CALENDAR: "Booking",
  IMAGE_GEN: "Image Gen",
  VIDEO_SCRIPT: "Video Script",
  DAILY_NEWS_BRIEFING: "Briefing Harian",
  WEBHOOK_INTEGRATION: "Webhook",
  WHITE_LABEL: "White-label",
};

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      where: { userId: session.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.usageLog.aggregate({
      where: { userId: session.user.id, createdAt: { gte: since } },
      _sum: { credits: true },
      _count: { _all: true },
    }),
  ]);

  const totalCredits = total._sum.credits ?? 0;
  const totalActions = total._count?._all ?? 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <ActivityIcon size={22} color="#8DA399" />
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
            Aktivitas
          </h1>
        </div>
        <p style={{ color: "#6b6b6b" }}>
          Histori kerja Pega untuk Anda dalam 30 hari terakhir.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <Stat icon={<Zap size={16} color="#8DA399" />} label="Kredit terpakai" value={totalCredits.toLocaleString("id-ID")} />
        <Stat icon={<MessageSquare size={16} color="#8DA399" />} label="Aktivitas" value={totalActions.toLocaleString("id-ID")} />
        <Stat icon={<BarChart3 size={16} color="#8DA399" />} label="Periode" value="30 hari" />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: 16, border: "1px solid #ede9df", overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <ImageIcon size={36} color="#cbd5e1" style={{ margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.4rem" }}>Belum ada aktivitas</h3>
            <p style={{ color: "#6b6b6b", fontSize: "0.875rem", maxWidth: 380, margin: "0 auto" }}>
              Setelah Anda menghubungkan channel dan Pega mulai bekerja, semua kerjaannya akan tampil di sini.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1ede4", backgroundColor: "#f9f8f6", fontSize: "0.72rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.04em", display: "grid", gridTemplateColumns: "1.5fr 1fr 0.6fr 1fr", gap: "1rem" }}>
              <span>Aksi</span>
              <span>Channel</span>
              <span style={{ textAlign: "right" }}>Kredit</span>
              <span style={{ textAlign: "right" }}>Waktu</span>
            </div>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f5f1e8", display: "grid", gridTemplateColumns: "1.5fr 1fr 0.6fr 1fr", gap: "1rem", alignItems: "center", fontSize: "0.875rem" }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#2D2D2D" }}>{log.channel}</div>
                  {log.meta && <div style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: 2 }}>{log.meta}</div>}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", backgroundColor: "#f4f1ea", color: "#2D2D2D", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, width: "fit-content" }}>
                  {CHANNEL_LABEL[log.channel] ?? log.channel}
                </span>
                <span style={{ textAlign: "right", fontWeight: 700, color: "#8DA399" }}>{log.credits}</span>
                <span style={{ textAlign: "right", color: "#6b6b6b", fontSize: "0.78rem" }}>
                  {new Date(log.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: 16, border: "1px solid #ede9df" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", marginTop: "0.4rem" }}>{value}</div>
    </div>
  );
}
