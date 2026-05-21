import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";
import ConsultationList from "./ConsultationList";

export const dynamic = "force-dynamic";

export default async function AdminConsultationsPage() {
  const rawConsultations = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Serialize Date -> ISO string so the client component receives plain objects.
  const consultations = rawConsultations.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt?.toISOString?.() ?? null,
  }));

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <MessageSquare size={22} color="#8DA399" />
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
            Pesanan & Konsultasi
          </h1>
        </div>
        <p style={{ color: "#6b6b6b" }}>
          Kelola pesan masuk, perbarui status, dan tambahkan catatan internal.
        </p>
      </div>

      <ConsultationList initialConsultations={consultations as never} />
    </div>
  );
}
