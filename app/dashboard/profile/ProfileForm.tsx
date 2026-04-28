"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Save, KeyRound, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    company: user.company || "",
  });

  // Change Password
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwStep, setPwStep] = useState<"request" | "verify">("request");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwForm, setPwForm] = useState({ otp: "", newPassword: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil");
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, type: "change_password" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Kode OTP dikirim ke email Anda");
      setOtpSent(true);
      setPwStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.otp || pwForm.otp.length < 6) return toast.error("Masukkan kode OTP 6 digit");
    if (!pwForm.newPassword || pwForm.newPassword.length < 8) return toast.error("Password baru minimal 8 karakter");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Konfirmasi password tidak cocok");
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: pwForm.otp, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Password berhasil diperbarui!");
      setShowPwSection(false);
      setPwStep("request");
      setOtpSent(false);
      setPwForm({ otp: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah password");
    } finally {
      setPwLoading(false);
    }
  };

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "0.875rem", borderRadius: "10px",
    border: "1px solid #ede9df", backgroundColor: "white", outline: "none",
    fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.95rem", color: "#2D2D2D",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Profile Info Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Alamat Email</label>
          <input type="email" disabled value={user.email} style={{ ...inputSt, backgroundColor: "#f9f9f9", color: "#888" }} />
          <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>Email tidak dapat diubah.</p>
        </div>

        <div>
          <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nama Lengkap</label>
          <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} style={inputSt} disabled={isLoading} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label htmlFor="phone" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nomor Telepon</label>
            <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} style={inputSt} disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nama Perusahaan</label>
            <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} style={inputSt} disabled={isLoading} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={isLoading} style={{ padding: "0.875rem 2rem", backgroundColor: "#2D2D2D", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem", opacity: isLoading ? 0.7 : 1, transition: "all 0.2s" }}>
            {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Change Password Section */}
      <div style={{ borderTop: "1px solid #ede9df", paddingTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPwSection ? "1.5rem" : 0 }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <KeyRound size={18} color="#8DA399" /> Keamanan & Password
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#6b6b6b", marginTop: "0.25rem" }}>Ubah password akun menggunakan verifikasi OTP.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowPwSection(p => !p); if (!showPwSection) { setPwStep("request"); setOtpSent(false); setPwForm({ otp: "", newPassword: "", confirmPassword: "" }); } }}
            style={{ padding: "0.625rem 1.25rem", backgroundColor: showPwSection ? "#fce8e8" : "#f0ede6", color: showPwSection ? "#e74c3c" : "#2D2D2D", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            {showPwSection ? "Batal" : "Ganti Password"}
          </button>
        </div>

        {showPwSection && (
          <div style={{ backgroundColor: "#f9f8f6", borderRadius: "12px", padding: "1.5rem", border: "1px solid #ede9df" }}>
            {pwStep === "request" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: "#eaf4f0", borderRadius: "10px", border: "1px solid #c8ddd6" }}>
                  <Mail size={18} color="#8DA399" />
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D" }}>Verifikasi via Email</p>
                    <p style={{ fontSize: "0.8rem", color: "#6b6b6b" }}>Kode OTP akan dikirim ke <strong>{user.email}</strong></p>
                  </div>
                </div>
                <button onClick={handleSendOtp} disabled={otpLoading} style={{ padding: "0.875rem", backgroundColor: "#8DA399", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: otpLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: otpLoading ? 0.7 : 1, transition: "all 0.2s" }}>
                  {otpLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Mail size={16} />}
                  Kirim Kode OTP ke Email
                </button>
              </div>
            )}

            {pwStep === "verify" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#eaf4f0", borderRadius: "8px", fontSize: "0.85rem", color: "#2D2D2D" }}>
                  <ShieldCheck size={16} color="#8DA399" />
                  OTP dikirim ke <strong>{user.email}</strong>
                  <button onClick={handleSendOtp} disabled={otpLoading} style={{ marginLeft: "auto", background: "none", border: "none", color: "#8DA399", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                    {otpLoading ? "..." : "Kirim Ulang"}
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Kode OTP (6 digit)</label>
                  <input type="text" className="input-field" placeholder="123456" maxLength={6}
                    value={pwForm.otp} onChange={(e) => setPwForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
                    style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: "1.4rem", fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Password Baru</label>
                  <div style={{ position: "relative" }}>
                    <input type={showNewPw ? "text" : "password"} className="input-field" placeholder="Min. 8 karakter"
                      value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      style={{ paddingRight: "3rem" }} />
                    <button type="button" onClick={() => setShowNewPw(p => !p)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b" }}>
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Konfirmasi Password Baru</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirmPw ? "text" : "password"} className="input-field" placeholder="Ulangi password baru"
                      value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      style={{ paddingRight: "3rem" }} />
                    <button type="button" onClick={() => setShowConfirmPw(p => !p)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b" }}>
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p style={{ fontSize: "0.78rem", color: "#e74c3c", marginTop: "0.35rem" }}>Password tidak cocok</p>
                  )}
                </div>

                <button onClick={handleChangePassword} disabled={pwLoading} style={{ padding: "0.875rem", backgroundColor: "#2D2D2D", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: pwLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: pwLoading ? 0.7 : 1 }}>
                  {pwLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={16} />}
                  Perbarui Password
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
