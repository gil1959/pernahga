import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageCircle, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");
  
  if (!session?.user?.id) return null;

  const consultations = await prisma.consultation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

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
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Pesanan & Konsultasi
          </h1>
          <p style={{ color: "#6b6b6b", fontSize: "1.05rem" }}>
            Lacak riwayat konsultasi dan layanan yang Anda pesan.
          </p>
        </div>
        <Link href="/" className="btn-primary" style={{ padding: "0.75rem 1.5rem", textDecoration: "none", color: "white", backgroundColor: "#8DA399", borderRadius: "10px", fontWeight: 600 }}>
          Pesan Baru
        </Link>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem" }}>
          {consultations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(141,163,153,0.1)", color: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <MessageCircle size={32} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>Belum ada pesanan</h3>
              <p style={{ color: "#6b6b6b", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
                Anda belum pernah melakukan konsultasi atau pemesanan layanan. Mulai jelajahi layanan kami.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {consultations.map(consult => {
                const style = getActivityColor(consult.status);
                return (
                  <div key={consult.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "1.5rem", borderRadius: "12px", backgroundColor: "#F4F1EA", border: "1px solid #ede9df", transition: "all 0.2s" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                        {consult.topic}
                      </h3>
                      <p style={{ fontSize: "0.95rem", color: "#4a4a4a", marginBottom: "1rem", maxWidth: "600px" }}>
                        {consult.message.length > 100 ? consult.message.substring(0, 100) + "..." : consult.message}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#8DA399", fontWeight: 600 }}>
                        {new Date(consult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "50px", backgroundColor: style.bg, color: style.color, fontSize: "0.8rem", fontWeight: 700 }}>
                        {style.icon}
                        {translateStatus(consult.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
