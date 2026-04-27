"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function Navbar() {
  const t = useTranslations("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("id");
  const [isUserOpen, setIsUserOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Read locale from cookie
    const locale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] || "id";
    setCurrentLocale(locale);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLocale = () => {
    const newLocale = currentLocale === "id" ? "en" : "id";
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    setCurrentLocale(newLocale);
    window.location.reload();
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/showcase", label: t("showcase") },
    { href: "/education", label: t("education") },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Berhasil keluar");
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        backgroundColor: isScrolled ? "rgba(244, 241, 234, 0.95)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid #ddd8ce" : "1px solid transparent",
        boxShadow: isScrolled ? "0 2px 20px rgba(45,45,45,0.08)" : "none",
      }}
    >
      <div className="container-custom">
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "70px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Logo size={36} />
            <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#2D2D2D", letterSpacing: "-0.02em" }}>
              Pernahga
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: isActive(link.href) ? 700 : 500,
                  color: isActive(link.href) ? "#8DA399" : "#2D2D2D",
                  transition: "all 0.2s",
                  backgroundColor: isActive(link.href) ? "rgba(141, 163, 153, 0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="hidden-mobile">
            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "50px",
                border: "1.5px solid #ddd8ce",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#2D2D2D",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                transition: "all 0.2s",
              }}
            >
              <Globe size={14} />
              {currentLocale.toUpperCase()}
            </button>

            {session ? (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "50px",
                    border: "1.5px solid #ddd8ce",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#2D2D2D",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      backgroundColor: "#8DA399",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  {session.user?.name?.split(" ")[0]}
                  <ChevronDown size={14} />
                </button>

                {isUserOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      backgroundColor: "white",
                      border: "1px solid #ddd8ce",
                      borderRadius: "12px",
                      boxShadow: "0 8px 30px rgba(45,45,45,0.12)",
                      overflow: "hidden",
                      minWidth: "180px",
                      animation: "fadeInUp 0.2s ease",
                    }}
                  >
                    {(session.user as { role?: string })?.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        style={{ display: "block", padding: "0.7rem 1rem", textDecoration: "none", color: "#2D2D2D", fontSize: "0.9rem", borderBottom: "1px solid #f0ede6", transition: "background 0.2s" }}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      style={{ display: "block", padding: "0.7rem 1rem", textDecoration: "none", color: "#2D2D2D", fontSize: "0.9rem", borderBottom: "1px solid #f0ede6", transition: "background 0.2s" }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ display: "block", width: "100%", padding: "0.7rem 1rem", textAlign: "left", border: "none", background: "transparent", color: "#e74c3c", fontSize: "0.9rem", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "background 0.2s" }}
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                  {t("login")}
                </Link>
                <Link href="/contact" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                  {t("consultation")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1.5px solid #ddd8ce",
              background: "white",
              cursor: "pointer",
              color: "#2D2D2D",
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          style={{
            backgroundColor: "rgba(244, 241, 234, 0.98)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid #ddd8ce",
            padding: "1rem 1.5rem 1.5rem",
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "0.85rem 0",
                borderBottom: "1px solid #ede9df",
                textDecoration: "none",
                fontWeight: isActive(link.href) ? 700 : 500,
                color: isActive(link.href) ? "#8DA399" : "#2D2D2D",
                fontSize: "1rem",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={toggleLocale} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              <Globe size={14} />
              {currentLocale === "id" ? "EN" : "ID"}
            </button>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  {t("login")}
                </Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  {t("consultation")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
