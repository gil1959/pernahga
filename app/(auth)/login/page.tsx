"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Mail, KeyRound, Eye, EyeOff, ChevronLeft, User } from "lucide-react";
import Logo from "@/components/ui/Logo";

type Modal = null | "forgot_password" | "forgot_username";
type ForgotStep = "email" | "otp" | "reset" | "done";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Modal state
  const [modal, setModal] = useState<Modal>(null);

  // Forgot Password state
  const [fpStep, setFpStep] = useState<ForgotStep>("email");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpConfirmPass, setFpConfirmPass] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  // Forgot Username state
  const [fuEmail, setFuEmail] = useState("");
  const [fuLoading, setFuLoading] = useState(false);
  const [fuResult, setFuResult] = useState<{ name: string; email: string } | null>(null);

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
    } catch {
      toast.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Gagal login dengan Google");
      setIsGoogleLoading(false);
    }
  };

  // Forgot Password handlers
  const fpSendOtp = async () => {
    if (!fpEmail) return toast.error("Masukkan email");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, type: "forgot_password" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("OTP dikirim ke email Anda");
      setFpStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim OTP");
    } finally {
      setFpLoading(false);
    }
  };

  const fpVerifyAndReset = async () => {
    if (!fpOtp || fpOtp.length < 6) return toast.error("Masukkan kode OTP 6 digit");
    if (!fpNewPass || fpNewPass.length < 8) return toast.error("Password minimal 8 karakter");
    if (fpNewPass !== fpConfirmPass) return toast.error("Konfirmasi password tidak cocok");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Password berhasil direset!");
      setFpStep("done");
    } catch (err: any) {
      toast.error(err.message || "Gagal reset password");
    } finally {
      setFpLoading(false);
    }
  };

  const resetFpModal = () => {
    setFpStep("email"); setFpEmail(""); setFpOtp("");
    setFpNewPass(""); setFpConfirmPass(""); setModal(null);
  };

  // Forgot Username handler
  const fuSearch = async () => {
    if (!fuEmail) return toast.error("Masukkan email");
    setFuLoading(true);
    setFuResult(null);
    try {
      const res = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fuEmail }),
      });
      const data = await res.json();
      if (data.name) setFuResult({ name: data.name, email: data.email });
      else toast.success(data.message);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setFuLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #ddd8ce",
    borderRadius: "10px", fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif",
    color: "#2D2D2D", outline: "none", backgroundColor: "white",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#F4F1EA" }}>
      {/* Left Panel */}
      <div className="hidden-mobile" style={{
        flex: 1, backgroundColor: "#2D2D2D", padding: "4rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "#F4F1EA", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(141,163,153,0.15) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(141,163,153,0.1) 0%, transparent 60%)" }} />
        <div style={{ zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#F4F1EA" }}>
            <Logo size={42} />
            <span style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Pernahga</span>
          </Link>
        </div>
        <div style={{ zIndex: 1, maxWidth: "480px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            Solusi teknologi tepat untuk bisnis hebat.
          </h1>
          <p style={{ color: "rgba(244,241,234,0.7)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Masuk untuk mulai mengelola konsultasi Anda dan temukan layanan yang paling sesuai.
          </p>
        </div>
        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.4)" }}>
            © {new Date().getFullYear()} Pernahga. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem", maxWidth: "700px", width: "100%", margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#6b6b6b", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, marginBottom: "3rem", alignSelf: "flex-start" }}>
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }} className="show-mobile">
            <Logo size={48} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>
            {t("login_title")}
          </h2>
          <p style={{ color: "#6b6b6b", marginBottom: "2rem" }}>{t("login_subtitle")}</p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogle}
            disabled={isGoogleLoading}
            style={{
              width: "100%", padding: "0.875rem", backgroundColor: "white",
              border: "1.5px solid #ddd8ce", borderRadius: "10px", fontSize: "0.95rem",
              fontWeight: 600, cursor: isGoogleLoading ? "not-allowed" : "pointer",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem",
              marginBottom: "1.5rem", transition: "all 0.2s", color: "#2D2D2D",
              opacity: isGoogleLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!isGoogleLoading) (e.currentTarget as HTMLElement).style.borderColor = "#8DA399"; }}
            onMouseLeave={(e) => { if (!isGoogleLoading) (e.currentTarget as HTMLElement).style.borderColor = "#ddd8ce"; }}
          >
            {isGoogleLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Masuk dengan Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd8ce" }} />
            <span style={{ fontSize: "0.8rem", color: "#9b9b9b", fontWeight: 600 }}>atau</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd8ce" }} />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                {t("email")}
              </label>
              <input id="email" name="email" type="email" required className="input-field"
                placeholder="nama@perusahaan.com" value={formData.email}
                onChange={handleChange} disabled={isLoading} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D" }}>
                  {t("password")}
                </label>
                <button type="button" onClick={() => setModal("forgot_password")}
                  style={{ fontSize: "0.8rem", color: "#8DA399", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                  Lupa Password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input id="password" name="password" type={showPassword ? "text" : "password"}
                  required className="input-field" placeholder="••••••••"
                  value={formData.password} onChange={handleChange} disabled={isLoading}
                  style={{ paddingRight: "3rem" }} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: "100%", padding: "0.875rem", backgroundColor: "#8DA399",
              color: "white", border: "none", borderRadius: "10px", fontSize: "1rem",
              fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
              marginTop: "0.5rem", transition: "all 0.2s", opacity: isLoading ? 0.7 : 1,
            }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "#6d8a7f"; }}
              onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "#8DA399"; }}
            >
              {isLoading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
              {t("login_btn")}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <button type="button" onClick={() => setModal("forgot_username")}
              style={{ fontSize: "0.85rem", color: "#6b6b6b", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <User size={14} /> Lupa nama akun / username?
            </button>
            <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>
              {t("no_account")}{" "}
              <Link href="/register" style={{ color: "#8DA399", fontWeight: 700, textDecoration: "none" }}>
                {t("register_btn")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {modal === "forgot_password" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) resetFpModal(); }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "2.5rem", position: "relative" }}>
            <button onClick={resetFpModal} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b" }}>✕</button>

            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "#eaf4f0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <KeyRound size={22} color="#8DA399" />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.35rem" }}>Reset Password</h2>
              {fpStep === "email" && <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Masukkan email terdaftar, kami kirim kode OTP.</p>}
              {fpStep === "otp" && <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Cek email <strong>{fpEmail}</strong> dan masukkan kode OTP + password baru.</p>}
              {fpStep === "done" && <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Password berhasil direset! Silakan login kembali.</p>}
            </div>

            {fpStep === "email" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Email</label>
                  <input type="email" className="input-field" placeholder="nama@email.com" value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fpSendOtp()} />
                </div>
                <button onClick={fpSendOtp} disabled={fpLoading} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#8DA399", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: fpLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: fpLoading ? 0.7 : 1 }}>
                  {fpLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Mail size={16} />}
                  Kirim Kode OTP
                </button>
              </div>
            )}

            {fpStep === "otp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button onClick={() => setFpStep("email")} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "#6b6b6b", fontSize: "0.85rem", fontWeight: 600 }}>
                  <ChevronLeft size={16} /> Ganti Email
                </button>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Kode OTP (6 digit)</label>
                  <input type="text" className="input-field" placeholder="123456" maxLength={6}
                    value={fpOtp} onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: "1.5rem", fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Password Baru</label>
                  <input type="password" className="input-field" placeholder="Min. 8 karakter"
                    value={fpNewPass} onChange={(e) => setFpNewPass(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Konfirmasi Password</label>
                  <input type="password" className="input-field" placeholder="Ulangi password baru"
                    value={fpConfirmPass} onChange={(e) => setFpConfirmPass(e.target.value)} />
                </div>
                <button onClick={fpVerifyAndReset} disabled={fpLoading} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#8DA399", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: fpLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: fpLoading ? 0.7 : 1 }}>
                  {fpLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={16} />}
                  Reset Password
                </button>
                <button onClick={fpSendOtp} disabled={fpLoading} style={{ background: "none", border: "none", cursor: "pointer", color: "#8DA399", fontSize: "0.85rem", fontWeight: 600 }}>
                  Kirim ulang OTP
                </button>
              </div>
            )}

            {fpStep === "done" && (
              <button onClick={resetFpModal} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#2D2D2D", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>
                Kembali ke Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== FORGOT USERNAME MODAL ===== */}
      {modal === "forgot_username" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setModal(null); setFuEmail(""); setFuResult(null); } }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "2.5rem", position: "relative" }}>
            <button onClick={() => { setModal(null); setFuEmail(""); setFuResult(null); }} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b" }}>✕</button>
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "#f0ede6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <User size={22} color="#2D2D2D" />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.35rem" }}>Cari Akun</h2>
              <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Masukkan email terdaftar untuk melihat info akun Anda.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Email Terdaftar</label>
                <input type="email" className="input-field" placeholder="nama@email.com"
                  value={fuEmail} onChange={(e) => setFuEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fuSearch()} />
              </div>
              <button onClick={fuSearch} disabled={fuLoading} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#2D2D2D", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: fuLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: fuLoading ? 0.7 : 1 }}>
                {fuLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <User size={16} />}
                Cari Akun
              </button>
              {fuResult && (
                <div style={{ backgroundColor: "#eaf4f0", borderRadius: "12px", padding: "1.25rem", border: "1px solid #c8ddd6" }}>
                  <p style={{ fontSize: "0.8rem", color: "#6b6b6b", fontWeight: 600, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Akun Ditemukan</p>
                  <p style={{ fontWeight: 800, color: "#2D2D2D", fontSize: "1.1rem" }}>{fuResult.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>{fuResult.email}</p>
                  <button onClick={() => { setModal(null); setFuEmail(""); setFuResult(null); }} style={{ marginTop: "1rem", padding: "0.6rem 1.25rem", backgroundColor: "#8DA399", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                    Kembali Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 900px) { .hidden-mobile { display: none !important; } }
        .show-mobile { display: none; }
        @media (max-width: 900px) { .show-mobile { display: flex; } }
      `}</style>
    </div>
  );
}
