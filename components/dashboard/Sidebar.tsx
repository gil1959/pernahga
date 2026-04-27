"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Logo from "@/components/ui/Logo";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Bookmark, 
  User,
  LogOut,
  Home
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function UserSidebar() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  const menuItems = [
    { href: "/dashboard", label: t("title"), icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/consultations", label: t("consultations"), icon: <MessageCircle size={20} /> },
    { href: "/dashboard/saved", label: t("saved"), icon: <Bookmark size={20} /> },
    { href: "/dashboard/profile", label: t("profile"), icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "white",
        borderRight: "1px solid #ede9df",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #ede9df" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#2D2D2D" }}>
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
            Pernahga
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
                color: isActive ? "#8DA399" : "#6b6b6b",
                backgroundColor: isActive ? "rgba(141,163,153,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(45,45,45,0.03)";
                  (e.currentTarget as HTMLElement).style.color = "#2D2D2D";
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
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

      <div style={{ padding: "1.5rem 1rem", borderTop: "1px solid #ede9df", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "transparent",
            color: "#6b6b6b",
            fontSize: "0.95rem",
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(45,45,45,0.03)";
            (e.currentTarget as HTMLElement).style.color = "#2D2D2D";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
          }}
        >
          <Home size={20} />
          Kembali ke Beranda
        </Link>
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
