"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Logo from "@/components/ui/Logo";
import { 
  LayoutDashboard, 
  Package, 
  MonitorPlay, 
  Youtube, 
  MessageSquareQuote, 
  Settings, 
  Users,
  LogOut,
  MessageCircle
} from "lucide-react";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/consultations", label: "Pesanan", icon: <MessageCircle size={20} /> },
  { href: "/admin/packages", label: "Paket & Harga", icon: <Package size={20} /> },
  { href: "/admin/showcase", label: "Portofolio", icon: <MonitorPlay size={20} /> },
  { href: "/admin/education", label: "Edukasi", icon: <Youtube size={20} /> },
  { href: "/admin/testimonials", label: "Testimonial", icon: <MessageSquareQuote size={20} /> },
  { href: "/admin/users", label: "Pengguna", icon: <Users size={20} /> },
  { href: "/admin/settings", label: "Pengaturan", icon: <Settings size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "#2D2D2D",
        color: "#F4F1EA",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#F4F1EA" }}>
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
            Admin Panel
          </span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "1.5rem 1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#F4F1EA" : "rgba(244,241,234,0.6)",
                backgroundColor: isActive ? "rgba(141,163,153,0.3)" : "transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "#F4F1EA";
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(244,241,234,0.6)";
                }
              }}
            >
              <div style={{ color: isActive ? "#8DA399" : "inherit" }}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1.5rem 1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "transparent",
            color: "#e74c3c",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            textAlign: "left"
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(231, 76, 60, 0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
