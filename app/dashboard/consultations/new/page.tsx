import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import NewConsultationForm from "./NewConsultationForm";

export const dynamic = "force-dynamic";

export default async function NewConsultationPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return null;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link 
          href="/dashboard/consultations" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#6b6b6b", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Buat Konsultasi Baru
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: "1.05rem" }}>
          Ceritakan masalah atau kebutuhan teknologi bisnis Anda. Kami akan menghubungi Anda segera.
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden", maxWidth: "800px" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <MessageCircle size={20} color="#8DA399" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2D2D2D" }}>
            Detail Konsultasi
          </h2>
        </div>

        <div style={{ padding: "2rem" }}>
          <NewConsultationForm user={user} />
        </div>
      </div>
    </div>
  );
}
