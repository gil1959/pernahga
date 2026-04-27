"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { MonitorPlay, Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, Star, ExternalLink } from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  longDescription: string;
  longDescriptionEn: string;
  thumbnail: string;
  images: string;
  tags: string;
  techStack: string;
  demoUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
}

const emptyForm = {
  title: "", titleEn: "", slug: "",
  description: "", descriptionEn: "",
  longDescription: "", longDescriptionEn: "",
  thumbnail: "", images: "", tags: "", techStack: "",
  demoUrl: "", caseStudy: "", caseStudyEn: "",
  isPublished: false, isFeatured: false, order: 0,
};

export default function AdminShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/showcase");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (item: ShowcaseItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title, titleEn: item.titleEn, slug: item.slug,
      description: item.description, descriptionEn: item.descriptionEn,
      longDescription: item.longDescription, longDescriptionEn: item.longDescriptionEn,
      thumbnail: item.thumbnail,
      images: JSON.parse(item.images).join("\n"),
      tags: JSON.parse(item.tags).join(", "),
      techStack: JSON.parse(item.techStack).join(", "),
      demoUrl: item.demoUrl || "", caseStudy: "", caseStudyEn: "",
      isPublished: item.isPublished, isFeatured: item.isFeatured, order: item.order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return toast.error("Judul dan slug wajib diisi");
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: JSON.stringify(form.images.split("\n").map(s => s.trim()).filter(Boolean)),
        tags: JSON.stringify(form.tags.split(",").map(s => s.trim()).filter(Boolean)),
        techStack: JSON.stringify(form.techStack.split(",").map(s => s.trim()).filter(Boolean)),
        order: Number(form.order),
      };
      const url = editingId ? `/api/admin/showcase/${editingId}` : "/api/admin/showcase";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error");
      }
      toast.success(editingId ? "Portofolio diperbarui!" : "Portofolio ditambahkan!");
      setShowModal(false);
      fetch_();
    } catch (e: any) { toast.error(e.message || "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus portofolio ini?")) return;
    const res = await fetch(`/api/admin/showcase/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); fetch_(); }
  };

  const togglePublish = async (item: ShowcaseItem) => {
    await fetch(`/api/admin/showcase/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    fetch_();
  };

  const toggleFeatured = async (item: ShowcaseItem) => {
    await fetch(`/api/admin/showcase/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !item.isFeatured }),
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
            Portofolio
          </h1>
          <p style={{ color: "#6b6b6b" }}>Kelola proyek dan studi kasus yang ditampilkan di website</p>
        </div>
        <button onClick={openAdd} className="btn-primary-green" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>
          <Plus size={18} /> Tambah Portofolio
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" color="#8DA399" />
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {items.map(item => {
            const tags: string[] = (() => { try { return JSON.parse(item.tags); } catch { return []; } })();
            const tech: string[] = (() => { try { return JSON.parse(item.techStack); } catch { return []; } })();
            return (
              <div key={item.id} style={{
                backgroundColor: "white", borderRadius: "16px", padding: "1.25rem 1.5rem",
                border: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "1.25rem",
                boxShadow: "0 2px 8px rgba(45,45,45,0.04)", opacity: item.isPublished ? 1 : 0.65,
              }}>
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title}
                    style={{ width: "80px", height: "54px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#2D2D2D" }}>{item.title}</span>
                    {item.isFeatured && <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px", backgroundColor: "#fef3e2", color: "#d97706" }}>FEATURED</span>}
                    {!item.isPublished && <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px", backgroundColor: "#e0e0e0", color: "#666" }}>DRAFT</span>}
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#6b6b6b", marginBottom: "0.4rem" }}>{item.description}</p>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    {tech.slice(0, 4).map(t => (
                      <span key={t} style={{ fontSize: "0.7rem", backgroundColor: "#f0ede6", color: "#6b6b6b", padding: "0.1rem 0.5rem", borderRadius: "50px" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                  <button onClick={() => toggleFeatured(item)} title="Toggle Featured"
                    style={{ background: "none", border: "none", cursor: "pointer", color: item.isFeatured ? "#f39c12" : "#ccc", padding: "0.5rem" }}>
                    <Star size={18} fill={item.isFeatured ? "#f39c12" : "none"} />
                  </button>
                  <button onClick={() => togglePublish(item)} title={item.isPublished ? "Jadikan Draft" : "Publikasikan"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: item.isPublished ? "#8DA399" : "#ccc", padding: "0.5rem" }}>
                    {item.isPublished ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  {item.demoUrl && (
                    <a href={item.demoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", padding: "0.5rem", borderRadius: "8px", color: "#6b6b6b" }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button onClick={() => openEdit(item)}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, backgroundColor: "#f0ede6", color: "#2D2D2D" }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: "#fce8e8", color: "#e74c3c" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #e5e0d8" }}>
              <MonitorPlay size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <p>Belum ada portofolio.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "820px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D" }}>{editingId ? "Edit Portofolio" : "Tambah Portofolio"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
            </div>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Judul (ID)</label>
                  <input style={inputStyle} value={form.title} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, title: v, slug: editingId ? p.slug : slugify(v) })); }} placeholder="Nama Proyek" />
                </div>
                <div>
                  <label style={labelStyle}>Title (EN)</label>
                  <input style={inputStyle} value={form.titleEn} onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))} placeholder="Project Name" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Slug (URL)</label>
                <input style={inputStyle} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="nama-proyek-url" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Deskripsi Singkat (ID)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Short Description (EN)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={form.descriptionEn} onChange={e => setForm(p => ({ ...p, descriptionEn: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Deskripsi Panjang (ID)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.longDescription} onChange={e => setForm(p => ({ ...p, longDescription: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Long Description (EN)</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.longDescriptionEn} onChange={e => setForm(p => ({ ...p, longDescriptionEn: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>URL Thumbnail</label>
                <input style={inputStyle} value={form.thumbnail} onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>URL Gambar Tambahan (satu per baris)</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} placeholder={"https://image1.jpg\nhttps://image2.jpg"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Tags (pisah koma)</label>
                  <input style={inputStyle} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Web App, SaaS, B2B" />
                </div>
                <div>
                  <label style={labelStyle}>Tech Stack (pisah koma)</label>
                  <input style={inputStyle} value={form.techStack} onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} placeholder="Next.js, MySQL, Redis" />
                </div>
                <div>
                  <label style={labelStyle}>URL Demo</label>
                  <input style={inputStyle} value={form.demoUrl} onChange={e => setForm(p => ({ ...p, demoUrl: e.target.value }))} placeholder="https://demo.example.com" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Publikasikan</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Tampilkan sebagai Featured</span>
                </label>
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D", marginRight: "0.5rem" }}>Urutan:</label>
                  <input style={{ ...inputStyle, width: "80px", display: "inline-block" }} type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                </div>
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
