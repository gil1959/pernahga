"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        toast.error("Email atau kata sandi salah");
      } else {
        toast.success("Berhasil masuk");
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#F4F1EA" }}>
      {/* Left Panel - Hidden on mobile */}
      <div
        className="hidden-mobile"
        style={{
          flex: 1,
          backgroundColor: "#2D2D2D",
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#F4F1EA",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(141,163,153,0.15) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(141,163,153,0.1) 0%, transparent 60%)" }} />
        
        <div style={{ zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#F4F1EA" }}>
            <Logo size={42} />
            <span style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
              Pernahga
            </span>
          </Link>
        </div>

        <div style={{ zIndex: 1, maxWidth: "480px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            Solusi teknologi tepat untuk bisnis hebat.
          </h1>
          <p style={{ color: "rgba(244,241,234,0.7)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Masuk untuk mulai mengelola konsultasi Anda dan temukan layanan yang paling sesuai dengan kebutuhan perusahaan Anda.
          </p>
        </div>

        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.4)" }}>
            © {new Date().getFullYear()} Pernahga. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem",
          maxWidth: "700px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: "#6b6b6b", 
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            marginBottom: "3rem",
            alignSelf: "flex-start"
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }} className="show-mobile">
            <Logo size={48} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>
            {t("login_title")}
          </h2>
          <p style={{ color: "#6b6b6b", marginBottom: "2.5rem" }}>
            {t("login_subtitle")}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="nama@perusahaan.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D" }}>
                  {t("password")}
                </label>
                {/* <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "#8DA399", textDecoration: "none", fontWeight: 600 }}>
                  {t("forgot_password")}
                </Link> */}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.875rem",
                backgroundColor: "#8DA399",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                transition: "all 0.2s",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if(!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "#6d8a7f";
              }}
              onMouseLeave={(e) => {
                if(!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "#8DA399";
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />}
              {t("login_btn")}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>
              {t("no_account")}{" "}
              <Link href="/register" style={{ color: "#8DA399", fontWeight: 700, textDecoration: "none" }}>
                {t("register_btn")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
        }
        .show-mobile { display: none; }
        @media (max-width: 900px) {
          .show-mobile { display: flex; }
        }
      `}</style>
    </div>
  );
}
