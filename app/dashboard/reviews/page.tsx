"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Star, Loader2, MessageSquareQuote, Trash2, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface MyReview {
  id: string;
  content: string;
  rating: number;
  company: string | null;
  role: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function UserReviewPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ content: "", rating: 5, company: "", role: "" });

  const fetchMyReviews = useCallback(async () => {
    setFetchingReviews(true);
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) setMyReviews(await res.json());
    } catch { /* silent */ }
    finally { setFetchingReviews(false); }
  }, []);

  useEffect(() => { fetchMyReviews(); }, [fetchMyReviews]);

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
      if (!res.ok) throw new Error(data.message || "Gagal mengirim ulasan");
      toast.success("Ulasan berhasil dikirim dan langsung tampil di homepage!");
      setFormData({ content: "", rating: 5, company: "", role: "" });
      setSubmitted(true);
      fetchMyReviews();
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
          Ulasan Saya
        </h1>
        <p style={{ color: "#6b6b6b" }}>
          Bagikan pengalaman Anda. Ulasan langsung tampil di homepage tanpa persetujuan admin.
        </p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#eaf4f0", border: "1px solid #c8ddd6", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <CheckCircle size={20} color="#8DA399" />
          <div>
            <p style={{ fontWeight: 700, color: "#2D2D2D", fontSize: "0.9rem" }}>Ulasan berhasil dikirim!</p>
            <p style={{ fontSize: "0.82rem", color: "#6b6b6b" }}>Ulasan Anda sudah langsung tampil di halaman utama website.</p>
          </div>
          <button onClick={() => setSubmitted(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9b9b9b", fontSize: "1.1rem" }}>✕</button>
        </div>
      )}

      {/* Form Ulasan */}
      <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "20px", border: "1px solid #ede9df", maxWidth: "800px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MessageSquareQuote size={18} color="#8DA399" /> Tulis Ulasan Baru
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Rating */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.75rem" }}>Rating Anda</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: formData.rating >= star ? "#f39c12" : "#ddd8ce", transition: "color 0.2s" }}>
                  <Star fill={formData.rating >= star ? "#f39c12" : "none"} size={32} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nama Perusahaan (Opsional)</label>
              <input id="company" name="company" type="text" className="input-field" placeholder="PT Teknologi Bersama" value={formData.company} onChange={handleChange} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="role" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Jabatan / Role (Opsional)</label>
              <input id="role" name="role" type="text" className="input-field" placeholder="CEO / CTO" value={formData.role} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>

          <div>
            <label htmlFor="content" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#2D2D2D", marginBottom: "0.5rem" }}>Isi Ulasan</label>
            <textarea id="content" name="content" required rows={5} className="input-field"
              placeholder="Ceritakan pengalaman Anda..." value={formData.content}
              onChange={handleChange} disabled={isLoading} style={{ resize: "vertical" }} />
          </div>

          <div style={{ borderTop: "1px solid #ede9df", paddingTop: "1.5rem" }}>
            <button type="submit" disabled={isLoading || !formData.content.trim()} className="btn-primary-green"
              style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <MessageSquareQuote size={18} />}
              Kirim Ulasan
            </button>
            <p style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "#6b6b6b" }}>
              Ulasan langsung tampil di homepage. Admin tetap bisa mengelola ulasan jika diperlukan.
            </p>
          </div>
        </form>
      </div>

      {/* My Reviews List */}
      <div style={{ maxWidth: "800px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1rem" }}>Ulasan Saya Sebelumnya</h2>
        {fetchingReviews ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} color="#8DA399" />
          </div>
        ) : myReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #e5e0d8", color: "#6b6b6b" }}>
            <MessageSquareQuote size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
            <p>Belum ada ulasan yang dikirim.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {myReviews.map((r) => (
              <div key={r.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "1.5rem", border: `1px solid ${r.isPublished ? "#ede9df" : "#fce8d0"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={r.rating >= s ? "#f39c12" : "none"} color={r.rating >= s ? "#f39c12" : "#ddd"} />)}
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: "50px", backgroundColor: r.isPublished ? "#eaf4f0" : "#fef3e2", color: r.isPublished ? "#8DA399" : "#d97706" }}>
                        {r.isPublished ? "Ditampilkan" : "Disembunyikan Admin"}
                      </span>
                      {r.role && <span style={{ fontSize: "0.8rem", color: "#9b9b9b" }}>{r.role}{r.company ? ` · ${r.company}` : ""}</span>}
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#4a4a4a", lineHeight: 1.6 }}>"{r.content}"</p>
                    <p style={{ fontSize: "0.75rem", color: "#9b9b9b", marginTop: "0.5rem" }}>
                      {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
