"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Star, Loader2, MessageSquareQuote } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    content: "",
    rating: 5,
    company: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim ulasan");
      }

      toast.success("Ulasan berhasil dikirim dan menunggu verifikasi Admin!");
      setFormData({ content: "", rating: 5, company: "", role: "" });
      router.refresh(); // Refresh data kalo ada SSR list
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Tulis Ulasan
        </h1>
        <p style={{ color: "#6b6b6b" }}>
          Bagikan pengalaman Anda bekerja sama dengan kami. Ulasan Anda sangat berarti.
        </p>
      </div>

      <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "20px", border: "1px solid #ede9df", maxWidth: "800px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.75rem" }}>
              Rating Anda
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: formData.rating >= star ? "#f39c12" : "#ddd8ce",
                    transition: "color 0.2s"
                  }}
                >
                  <Star fill={formData.rating >= star ? "#f39c12" : "none"} size={32} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                Nama Perusahaan (Opsional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                className="input-field"
                placeholder="Misal: PT Teknologi Bersama"
                value={formData.company}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="role" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
                Jabatan / Role (Opsional)
              </label>
              <input
                id="role"
                name="role"
                type="text"
                className="input-field"
                placeholder="Misal: CEO / CTO"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>
              Isi Ulasan
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={5}
              className="input-field"
              placeholder="Ceritakan pengalaman Anda terkait solusi yang kami berikan..."
              value={formData.content}
              onChange={handleChange}
              disabled={isLoading}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ borderTop: "1px solid #ede9df", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={isLoading || formData.content.trim() === ""}
              className="btn-primary-green"
              style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquareQuote size={18} />}
              Kirim Ulasan Anda
            </button>
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b6b6b" }}>
              Catatan: Setiap ulasan yang dikirimkan akan ditinjau oleh Admin sebelum ditampilkan di halaman utama website.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
