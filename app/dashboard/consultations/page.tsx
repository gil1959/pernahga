import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LifeBuoy, MessageSquare, ChevronRight, Plus, CheckCircle2, Clock, XCircle, Link2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Menunggu", bg: "#fef3c7", color: "#b45309", icon: <Clock size={13} /> },
  IN_PROGRESS: { label: "Diproses", bg: "#dbeafe", color: "#1d4ed8", icon: <Clock size={13} /> },
  RESOLVED: { label: "Selesai", bg: "#dcfce7", color: "#166534", icon: <CheckCircle2 size={13} /> },
  CANCELLED: { label: "Batal", bg: "#fee2e2", color: "#b91c1c", icon: <XCircle size={13} /> },
  REQUESTED: { label: "Diminta", bg: "#fef3c7", color: "#b45309", icon: <Clock size={13} /> },
  CONNECTED: { label: "Terhubung", bg: "#dcfce7", color: "#166534", icon: <CheckCircle2 size={13} /> },
  REJECTED: { label: "Ditolak", bg: "#fee2e2", color: "#b91c1c", icon: <XCircle size={13} /> },
};

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [consultations, connections] = await Promise.all([
    prisma.consultation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.connectionRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <LifeBuoy size={22} color="#8DA399" />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
              Pusat Bantuan
            </h1>
          </div>
          <p style={{ color: "#6b6b6b" }}>
            Tiket support, permintaan koneksi channel, dan riwayat konsultasi Anda.
          </p>
        </div>
        <Link
          href="/dashboard/consultations/new"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1.25rem", backgroundColor: "#2D2D2D", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}
        >
          <Plus size={15} /> Tiket Baru
        </Link>
      </div>

      {/* Connection requests */}
      <Section title="Permintaan Koneksi Channel" icon={<Link2 size={16} color="#8DA399" />}>
        {connections.length === 0 ? (
          <Empty text="Belum ada permintaan koneksi. Tombol Connect di Overview akan membuat permintaan ke admin." />
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {connections.map((c) => {
              const meta = STATUS_META[c.status] ?? { label: c.status, bg: "#f1f5f9", color: "#475569", icon: null };
              return (
                <div key={c.id} style={card}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2D2D2D", marginBottom: 4 }}>{c.channel}</div>
                    {c.handle && <div style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>{c.handle}</div>}
                    {c.notes && <div style={{ fontSize: "0.85rem", color: "#6b6b6b", marginTop: 4 }}>{c.notes}</div>}
                    <div style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: 6 }}>
                      {new Date(c.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, backgroundColor: meta.bg, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Support tickets / consultations */}
      <Section title="Tiket Bantuan & Konsultasi" icon={<MessageSquare size={16} color="#8DA399" />}>
        {consultations.length === 0 ? (
          <Empty text="Belum ada tiket. Klik Tiket Baru kalau butuh bantuan admin." />
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {consultations.map((c) => {
              const meta = STATUS_META[c.status] ?? { label: c.status, bg: "#f1f5f9", color: "#475569", icon: null };
              return (
                <div key={c.id} style={card}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2D2D2D", marginBottom: 4 }}>{c.topic}</div>
                    <div style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>
                      {c.message.length > 120 ? c.message.substring(0, 120) + "..." : c.message}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: 6 }}>
                      {new Date(c.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, backgroundColor: meta.bg, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {icon}
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ backgroundColor: "white", padding: "2rem", textAlign: "center", borderRadius: 12, border: "1px dashed #ede9df", color: "#9b9b9b", fontSize: "0.875rem" }}>
      {text}
    </div>
  );
}

const card: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid #ede9df",
  borderRadius: 12,
  padding: "1rem 1.1rem",
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
};
