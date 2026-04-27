"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    company: user.company || "",
  });

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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Alamat Email
        </label>
        <input
          type="email"
          disabled
          value={user.email}
          style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "#f9f9f9", color: "#888", outline: "none" }}
        />
        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>Email tidak dapat diubah.</p>
      </div>

      <div>
        <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "white", outline: "none" }}
          disabled={isLoading}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <label htmlFor="phone" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
            Nomor Telepon
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "white", outline: "none" }}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
            Nama Perusahaan
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "white", outline: "none" }}
            disabled={isLoading}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "0.875rem 2rem",
            backgroundColor: "#2D2D2D",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
