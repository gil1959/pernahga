"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

export default function NewConsultationForm({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal membuat konsultasi");
      }

      toast.success("Konsultasi berhasil dibuat!");
      router.push("/dashboard/consultations");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <label htmlFor="topic" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Topik Konsultasi <span style={{ color: "red" }}>*</span>
        </label>
        <select
          id="topic"
          name="topic"
          required
          value={formData.topic}
          onChange={handleChange}
          style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "white", outline: "none", fontSize: "0.95rem" }}
          disabled={isLoading}
        >
          <option value="" disabled>Pilih Topik Konsultasi</option>
          <option value="Pengembangan Website">Pengembangan Website</option>
          <option value="Pembuatan Aplikasi Mobile">Pembuatan Aplikasi Mobile</option>
          <option value="Sistem Informasi / ERP">Sistem Informasi / ERP</option>
          <option value="Desain UI/UX">Desain UI/UX</option>
          <option value="Konsultasi IT Umum">Konsultasi IT Umum</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
          Pesan / Detail Masalah <span style={{ color: "red" }}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={handleChange}
          placeholder="Ceritakan secara detail mengenai masalah atau kebutuhan bisnis Anda..."
          style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", border: "1px solid #ede9df", backgroundColor: "white", outline: "none", resize: "vertical", fontSize: "0.95rem", fontFamily: "inherit" }}
          disabled={isLoading}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          type="submit"
          disabled={isLoading || !formData.topic || !formData.message}
          style={{
            padding: "0.875rem 2.5rem",
            backgroundColor: "#2D2D2D",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: (isLoading || !formData.topic || !formData.message) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            opacity: (isLoading || !formData.topic || !formData.message) ? 0.7 : 1,
          }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
          Kirim Pesan
        </button>
      </div>
    </form>
  );
}
