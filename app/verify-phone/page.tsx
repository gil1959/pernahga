"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const next = searchParams.get("next") || "/dashboard";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.phoneVerified) {
      router.replace(next);
    }
  }, [status, session, router, next]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Nomor WhatsApp minimal 10 digit");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, mode: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP");
      setMaskedPhone(data.phone || "");
      setStep("otp");
      toast.success("Kode OTP telah dikirim ke WhatsApp Anda");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Kode OTP harus 6 digit");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal verifikasi");
      toast.success("Nomor berhasil diverifikasi");
      // Refresh JWT so phoneVerified is true
      await update();
      setTimeout(() => router.replace(next), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #ddd8ce",
    borderRadius: "10px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#2D2D2D",
    outline: "none",
  };
  const labelBase: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#2D2D2D",
    marginBottom: "0.5rem",
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F4F1EA" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F4F1EA", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "440px", backgroundColor: "white", borderRadius: "16px", padding: "2.5rem", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#6b6b6b", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            <ArrowLeft size={14} />
            Beranda
          </Link>
          <Logo size={36} />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Verifikasi Nomor WhatsApp
        </h1>
        <p style={{ color: "#6b6b6b", marginBottom: "2rem", fontSize: "0.95rem" }}>
          {step === "phone"
            ? "Untuk keamanan akun, verifikasi nomor WhatsApp Anda sekali saja sebelum lanjut."
            : `Masukkan 6 digit OTP yang kami kirim ke ${maskedPhone}`}
        </p>

        {step === "phone" ? (
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="phone" style={labelBase}>
                Nomor WhatsApp aktif
              </label>
              <input
                id="phone"
                type="tel"
                required
                inputMode="numeric"
                style={inputBase}
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSending}
              />
              <p style={{ fontSize: "0.75rem", color: "#8b8b8b", marginTop: "0.4rem" }}>
                Kami hanya kirim 1 OTP. Pastikan nomor ini bisa terima WA.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSending}
              style={{
                width: "100%",
                padding: "0.875rem",
                backgroundColor: "#2D2D2D",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isSending ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                opacity: isSending ? 0.7 : 1,
              }}
            >
              {isSending && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
              {isSending ? "Mengirim OTP..." : "Kirim OTP ke WhatsApp"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="otp" style={labelBase}>
                Kode OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                style={{ ...inputBase, textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", fontWeight: 700 }}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={isVerifying}
              />
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSending || isVerifying}
              style={{
                background: "transparent",
                border: "none",
                color: "#8DA399",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: isSending ? "wait" : "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              {isSending ? "Mengirim ulang..." : "Kirim ulang OTP"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); }}
              disabled={isVerifying}
              style={{
                background: "transparent",
                border: "none",
                color: "#6b6b6b",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              Ubah nomor WhatsApp
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                padding: "0.875rem",
                backgroundColor: "#2D2D2D",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isVerifying ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                opacity: isVerifying ? 0.7 : 1,
              }}
            >
              {isVerifying && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
              {isVerifying ? "Memverifikasi..." : "Verifikasi & Lanjut"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #ddd8ce", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b6b6b",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <LogOut size={14} />
            Keluar dari akun
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
