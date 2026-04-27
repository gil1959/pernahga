"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Email harus diisi");
      return;
    }
    
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP");
      
      setOtpSent(true);
      toast.success("Kode OTP telah dikirim ke email Anda");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      toast.success("Registrasi berhasil, silakan masuk");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#F4F1EA" }}>
      {/* Right Panel - Info (Reversed for Register) */}
      <div
        className="hidden-mobile"
        style={{
          flex: 1,
          backgroundColor: "#8DA399",
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#F4F1EA",
          position: "relative",
          overflow: "hidden",
          order: 2,
        }}
      >
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(45,45,45,0.1) 0%, transparent 60%)" }} />
        
        <div style={{ zIndex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#F4F1EA" }}>
            <span style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
              Pernahga
            </span>
            <Logo size={42} />
          </Link>
        </div>

        <div style={{ zIndex: 1, maxWidth: "480px", alignSelf: "flex-end", textAlign: "right" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            Bergabung bersama solusi tepat.
          </h1>
          <p style={{ color: "rgba(244,241,234,0.9)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Buat akun sekarang untuk mendapatkan akses konsultasi gratis pertama Anda dan berbagai panduan bisnis lainnya.
          </p>
        </div>

        <div style={{ zIndex: 1, textAlign: "right" }}>
          <p style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.6)" }}>
            © {new Date().getFullYear()} Pernahga. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Left Panel - Register Form */}
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
          order: 1,
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
          <div style={{ display: "flex", justifySelf: "center", marginBottom: "2rem" }} className="show-mobile">
            <Logo size={48} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>
            {t("register_title")}
          </h2>
          <p style={{ color: "#6b6b6b", marginBottom: "2.5rem" }}>
            {otpSent ? "Masukkan kode verifikasi yang dikirim ke email Anda" : t("register_subtitle")}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {!otpSent ? (
              <>
                <div>
                  <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                    {t("name")}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Budi Santoso"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSendingOtp}
                  />
                </div>

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
                    disabled={isSendingOtp}
                  />
                </div>

                <div>
                  <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                    {t("password")}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSendingOtp}
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="otp" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                  Kode Verifikasi (OTP)
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="input-field"
                  placeholder="Masukkan 6 digit kode"
                  value={formData.otp}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", fontWeight: 700 }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isSendingOtp}
              style={{
                width: "100%",
                padding: "0.875rem",
                backgroundColor: "#2D2D2D",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: (isLoading || isSendingOtp) ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                transition: "all 0.2s",
                opacity: (isLoading || isSendingOtp) ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if(!isLoading && !isSendingOtp) (e.currentTarget as HTMLElement).style.backgroundColor = "#4a4a4a";
              }}
              onMouseLeave={(e) => {
                if(!isLoading && !isSendingOtp) (e.currentTarget as HTMLElement).style.backgroundColor = "#2D2D2D";
              }}
            >
              {(isLoading || isSendingOtp) && <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />}
              {!otpSent ? (isSendingOtp ? "Mengirim OTP..." : "Daftar Akun") : (isLoading ? "Memverifikasi..." : "Verifikasi & Daftar")}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>
              {t("have_account")}{" "}
              <Link href="/login" style={{ color: "#2D2D2D", fontWeight: 700, textDecoration: "none" }}>
                {t("login_btn")}
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
