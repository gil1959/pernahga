"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Youtube, Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface EducationItem {
  id: string;
  title: string;
  titleEn: string;
  description: string | null;
  descriptionEn: string | null;
  type: "YOUTUBE" | "TIKTOK";
  embedUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  categoryEn: string | null;
  isPublished: boolean;
  order: number;
}

const emptyForm = {
  title: "", titleEn: "", description: "", descriptionEn: "",
  type: "YOUTUBE" as "YOUTUBE" | "TIKTOK", embedUrl: "",
  thumbnailUrl: "", category: "", categoryEn: "", isPublished: true, order: 0,
};

export default function AdminEducationPage() {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/education");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (item: EducationItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title, titleEn: item.titleEn,
      description: item.description || "", descriptionEn: item.descriptionEn || "",
      type: item.type, embedUrl: item.embedUrl,
      thumbnailUrl: item.thumbnailUrl || "", category: item.category || "",
      categoryEn: item.categoryEn || "", isPublished: item.isPublished, order: item.order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.embedUrl) return toast.error("Judul dan URL embed wajib diisi");
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/education/${editingId}` : "/api/admin/education";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, order: Number(form.order) }) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Konten diperbarui!" : "Konten ditambahkan!");
      setShowModal(false);
      fetch_();
    } catch { toast.error("Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus konten ini?")) return;
    const res = await fetch(`/api/admin/education/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); fetch_(); }
  };

  const togglePublish = async (item: EducationItem) => {
    await fetch(`/api/admin/education/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    fetch_();
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Konten Edukasi
          </h1>
          <p style={{ color: "#6b6b6b" }}>Kelola video YouTube dan TikTok yang ditampilkan di website</p>
        </div>
        <button onClick={openAdd} className="btn-primary-green" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>
          <Plus size={18} /> Tambah Konten
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" color="#8DA399" />
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {items.map(item => (
            <div key={item.id} style={{
              backgroundColor: "white", borderRadius: "16px", padding: "1.25rem 1.5rem",
              border: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "1.25rem",
              boxShadow: "0 2px 8px rgba(45,45,45,0.04)", opacity: item.isPublished ? 1 : 0.6,
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
                backgroundColor: item.type === "YOUTUBE" ? "#e74c3c20" : "#2D2D2D15",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Youtube size={22} color={item.type === "YOUTUBE" ? "#e74c3c" : "#2D2D2D"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#2D2D2D" }}>{item.title}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px", backgroundColor: item.type === "YOUTUBE" ? "#e74c3c20" : "#2D2D2D15", color: item.type === "YOUTUBE" ? "#e74c3c" : "#2D2D2D" }}>
                    {item.type}
                  </span>
                  {item.category && <span style={{ fontSize: "0.7rem", color: "#9b9b9b" }}>#{item.category}</span>}
                </div>
                <p style={{ fontSize: "0.8rem", color: "#9b9b9b", fontFamily: "monospace" }}>{item.embedUrl.substring(0, 60)}...</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => togglePublish(item)} title={item.isPublished ? "Nonaktifkan" : "Aktifkan"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: item.isPublished ? "#8DA399" : "#ccc", padding: "0.5rem" }}>
                  {item.isPublished ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => openEdit(item)}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, backgroundColor: "#f0ede6", color: "#2D2D2D" }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(item.id)}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, backgroundColor: "#fce8e8", color: "#e74c3c" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #e5e0d8" }}>
              Belum ada konten edukasi.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D" }}>{editingId ? "Edit Konten" : "Tambah Konten Edukasi"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
            </div>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Judul (ID)</label>
                  <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Judul konten..." />
                </div>
                <div>
                  <label style={labelStyle}>Title (EN)</label>
                  <input style={inputStyle} value={form.titleEn} onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))} placeholder="Content title..." />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tipe Platform</label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {(["YOUTUBE", "TIKTOK"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                      style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: `2px solid ${form.type === t ? "#8DA399" : "#e5e0d8"}`, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", backgroundColor: form.type === t ? "#eaf4f0" : "white", color: form.type === t ? "#8DA399" : "#6b6b6b", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Embed URL</label>
                <input style={inputStyle} value={form.embedUrl} onChange={e => setForm(p => ({ ...p, embedUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/xxxxx" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Kategori (ID)</label>
                  <input style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Strategi Bisnis" />
                </div>
                <div>
                  <label style={labelStyle}>Category (EN)</label>
                  <input style={inputStyle} value={form.categoryEn} onChange={e => setForm(p => ({ ...p, categoryEn: e.target.value }))} placeholder="Business Strategy" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Deskripsi (ID)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Description (EN)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.descriptionEn} onChange={e => setForm(p => ({ ...p, descriptionEn: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <label style={labelStyle}>Urutan</label>
                  <input style={inputStyle} type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Tampilkan di Website</span>
                </label>
              </div>
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
