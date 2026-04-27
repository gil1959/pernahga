import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageCircle, Bookmark, ArrowRight, CheckCircle2, Clock, XCircle, Hand } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");
  
  if (!session?.user?.id) return null;

  const [consultations, savedItems] = await Promise.all([
    prisma.consultation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.savedItem.findMany({
      where: { userId: session.user.id },
      include: { showcase: true },
      orderBy: { createdAt: "desc" },
      take: 3
    })
  ]);

  const getActivityColor = (status: string) => {
    switch(status) {
      case "RESOLVED": return { bg: "#e8f5e9", color: "#2e7d32", icon: <CheckCircle2 size={16} /> };
      case "IN_PROGRESS": return { bg: "#e3f2fd", color: "#1565c0", icon: <Clock size={16} /> };
      case "CANCELLED": return { bg: "#ffebee", color: "#c62828", icon: <XCircle size={16} /> };
      default: return { bg: "#fff8e1", color: "#f57f17", icon: <Clock size={16} /> };
    }
  };

  const translateStatus = (status: string) => {
    switch(status) {
      case "PENDING": return t("status_pending");
      case "IN_PROGRESS": return t("status_in_progress");
      case "RESOLVED": return t("status_resolved");
      case "CANCELLED": return t("status_cancelled");
      default: return status;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          {t("title")}
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {t("welcome")}, <strong style={{ color: "#2D2D2D" }}>{session.user.name}</strong> <Hand size={18} color="#8DA399" />
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem"
        }}
      >
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(141,163,153,0.15)", color: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.25rem" }}>
              {t("consultations")}
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2D2D2D", lineHeight: 1 }}>
              {consultations.length}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(45,45,45,0.08)", color: "#2D2D2D", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bookmark size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.25rem" }}>
              {t("saved")}
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2D2D2D", lineHeight: 1 }}>
              {savedItems.length}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Konsultasi Terbaru */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #ede9df", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>
              Riwayat Konsultasi
            </h2>
            <Link href="/dashboard/consultations" style={{ fontSize: "0.85rem", color: "#8DA399", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {consultations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <p style={{ color: "#6b6b6b", marginBottom: "1rem" }}>{t("no_consultations")}</p>
                <Link href="/dashboard/consultations/new" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                  {t("new_consultation")}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {consultations.map(consult => {
                  const style = getActivityColor(consult.status);
                  return (
                    <div key={consult.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "1rem", borderRadius: "10px", backgroundColor: "#F4F1EA", border: "1px solid #ede9df" }}>
                      <div>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.35rem" }}>
                          {consult.topic}
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>
                          {new Date(consult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", borderRadius: "50px", backgroundColor: style.bg, color: style.color, fontSize: "0.75rem", fontWeight: 700 }}>
                        {style.icon}
                        {translateStatus(consult.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Portofolio Tersimpan */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #ede9df" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>
              Portofolio Disimpan
            </h2>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {savedItems.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b6b6b", fontSize: "0.9rem", padding: "1rem 0" }}>Belum ada item yang disimpan</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {savedItems.map(item => (
                  <Link href={`/showcase/${item.showcase.slug}`} key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
                    <div style={{ width: "60px", height: "45px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: "#ede9df" }}>
                      <img src={item.showcase.thumbnail} alt={item.showcase.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2D2D2D", lineHeight: 1.3, marginBottom: "0.25rem" }}>
                        {item.showcase.title.length > 30 ? item.showcase.title.substring(0, 30) + "..." : item.showcase.title}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "#8DA399", fontWeight: 600 }}>Lihat detail <ArrowRight size={10} style={{ verticalAlign: "middle" }}/></p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
