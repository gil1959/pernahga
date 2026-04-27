import { prisma } from "@/lib/prisma";
import { Users, Package, MonitorPlay, MessageSquareQuote, Youtube } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    userCount,
    packageCount,
    showcaseCount,
    educationCount,
    testimonialCount
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.package.count(),
    prisma.showcase.count(),
    prisma.education.count(),
    prisma.testimonial.count(),
  ]);

  const stats = [
    { label: "Total Pengguna", value: userCount, icon: <Users size={24} />, color: "#3498db" },
    { label: "Paket Layanan", value: packageCount, icon: <Package size={24} />, color: "#8DA399" },
    { label: "Portofolio", value: showcaseCount, icon: <MonitorPlay size={24} />, color: "#9b59b6" },
    { label: "Konten Edukasi", value: educationCount, icon: <Youtube size={24} />, color: "#e74c3c" },
    { label: "Testimonial", value: testimonialCount, icon: <MessageSquareQuote size={24} />, color: "#f39c12" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Dashboard Overview
        </h1>
        <p style={{ color: "#6b6b6b" }}>
          Selamat datang di panel admin Pernahga. Berikut ringkasan data website Anda.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem"
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #ede9df",
              boxShadow: "0 4px 20px rgba(45,45,45,0.04)",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: `${stat.color}15`,
                color: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.25rem" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2D2D2D", lineHeight: 1 }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "2rem", border: "1px solid #ede9df", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center" }}>
        <MonitorPlay size={48} color="#8DA399" style={{ marginBottom: "1rem", opacity: 0.5 }} />
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Sistem Admin Siap Digunakan
        </h3>
        <p style={{ color: "#6b6b6b", maxWidth: "400px" }}>
          Gunakan menu di sebelah kiri untuk mengelola berbagai komponen website, mulai dari paket harga hingga pengaturan situs.
        </p>
      </div>
    </div>
  );
}
