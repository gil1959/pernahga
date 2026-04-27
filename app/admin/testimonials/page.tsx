"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { MessageSquareQuote, Check, X, Star, Trash2, Eye, EyeOff, Loader2, Plus, Pencil } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  avatar: string | null;
  content: string;
  contentEn: string | null;
  rating: number;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", role: "", content: "", contentEn: "", rating: 5, isPublished: false });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/testimonials");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = items.filter(t => {
    if (filter === "pending") return !t.isPublished;
    if (filter === "published") return t.isPublished;
    return true;
  });

  const togglePublish = async (t: Testimonial) => {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    if (res.ok) { toast.success(t.isPublished ? "Disembunyikan" : "Dipublikasikan!"); fetch_(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); fetch_(); }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", company: "", role: "", content: "", contentEn: "", rating: 5, isPublished: false });
    setShowModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({ name: t.name, company: t.company || "", role: t.role || "", content: t.content, contentEn: t.contentEn || "", rating: t.rating, isPublished: t.isPublished });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.content) return toast.error("Nama dan konten wajib diisi");
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Testimoni diperbarui!" : "Testimoni ditambahkan!");
      setShowModal(false);
      fetch_();
    } catch { toast.error("Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem", border: "1px solid #e5e0d8",
    borderRadius: "8px", fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif",
    color: "#2D2D2D", outline: "none", boxSizing: "border-box", backgroundColor: "#fafaf8",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#6b6b6b",
    marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.04em",
  };

  const pendingCount = items.filter(t => !t.isPublished).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Testimonial
          </h1>
          <p style={{ color: "#6b6b6b" }}>
            Moderasi ulasan pelanggan.
            {pendingCount > 0 && <span style={{ marginLeft: "0.5rem", backgroundColor: "#e74c3c", color: "white", fontSize: "0.75rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px" }}>{pendingCount} menunggu</span>}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary-green" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>
          <Plus size={18} /> Tambah Testimoni
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(["all", "pending", "published"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif",
              borderColor: filter === f ? "#8DA399" : "#e5e0d8",
              backgroundColor: filter === f ? "#8DA399" : "white",
              color: filter === f ? "white" : "#6b6b6b",
            }}>
            {f === "all" ? "Semua" : f === "pending" ? "Menunggu" : "Dipublikasi"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" color="#8DA399" />
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              backgroundColor: "white", borderRadius: "16px", padding: "1.5rem",
              border: `1px solid ${t.isPublished ? "#ede9df" : "#fce8d0"}`,
              boxShadow: "0 2px 8px rgba(45,45,45,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0ede6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#8DA399", fontSize: "1rem" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#2D2D2D", fontSize: "0.95rem" }}>{t.name}</p>
                      <p style={{ fontSize: "0.8rem", color: "#6b6b6b" }}>
                        {[t.role, t.company].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "2px", marginLeft: "0.25rem" }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={t.rating >= s ? "#f39c12" : "none"} color={t.rating >= s ? "#f39c12" : "#ddd"} />)}
                    </div>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: "50px",
                      backgroundColor: t.isPublished ? "#eaf4f0" : "#fef3e2",
                      color: t.isPublished ? "#8DA399" : "#d97706",
                    }}>
                      {t.isPublished ? "Dipublikasi" : "Menunggu"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#4a4a4a", lineHeight: 1.6, borderLeft: "3px solid #ede9df", paddingLeft: "0.75rem" }}>
                    "{t.content}"
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9b9b9b", marginTop: "0.5rem" }}>
                    {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button onClick={() => togglePublish(t)} title={t.isPublished ? "Sembunyikan" : "Publikasikan"}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                      backgroundColor: t.isPublished ? "#fce8e8" : "#eaf4f0",
                      color: t.isPublished ? "#e74c3c" : "#8DA399",
                    }}>
                    {t.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    {t.isPublished ? "Sembunyikan" : "Publikasikan"}
                  </button>
                  <button onClick={() => openEdit(t)}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, backgroundColor: "#f0ede6", color: "#2D2D2D" }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, backgroundColor: "#fce8e8", color: "#e74c3c" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #e5e0d8" }}>
              <MessageSquareQuote size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <p>Tidak ada testimoni di kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D" }}>{editingId ? "Edit Testimoni" : "Tambah Testimoni"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
            </div>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nama</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama pelanggan" />
                </div>
                <div>
                  <label style={labelStyle}>Perusahaan</label>
                  <input style={inputStyle} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="PT ..." />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Jabatan</label>
                  <input style={inputStyle} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="CEO / Direktur" />
                </div>
                <div>
                  <label style={labelStyle}>Rating</label>
                  <div style={{ display: "flex", gap: "0.375rem", paddingTop: "0.5rem" }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <Star size={24} fill={form.rating >= s ? "#f39c12" : "none"} color={form.rating >= s ? "#f39c12" : "#ddd"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Konten Ulasan (ID)</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Tuliskan ulasan..." />
              </div>
              <div>
                <label style={labelStyle}>Review Content (EN)</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.contentEn} onChange={e => setForm(p => ({ ...p, contentEn: e.target.value }))} placeholder="Write the review in English..." />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Langsung Publikasikan</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "0.75rem 1.5rem", borderRadius: "10px", border: "1px solid #e5e0d8", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary-green" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
