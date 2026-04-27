import { prisma } from "@/lib/prisma";
import ConsultationList from "./ConsultationList";

export const dynamic = "force-dynamic";

export default async function AdminConsultationsPage() {
  const consultations = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    }
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#F4F1EA", marginBottom: "0.5rem" }}>
          Kelola Pesanan & Konsultasi
        </h1>
        <p style={{ color: "rgba(244,241,234,0.6)" }}>
          Lihat pesan dari pengguna, perbarui status, dan berikan catatan internal.
        </p>
      </div>

      <ConsultationList initialConsultations={consultations} />
    </div>
  );
}
