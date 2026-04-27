"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Package, Plus, Pencil, Trash2, Star, ToggleLeft, ToggleRight, X, Loader2, Check } from "lucide-react";

interface PackageItem {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  priceNote: string | null;
  priceNoteEn: string | null;
  features: string;
  featuresEn: string;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

const emptyForm = {
  title: "", titleEn: "",
  description: "", descriptionEn: "",
  price: "", priceNote: "", priceNoteEn: "",
  features: "", featuresEn: "",
  isPopular: false, isActive: true, order: 0,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/packages");
    const data = await res.json();
    setPackages(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: packages.length + 1 });
    setShowModal(true);
  };

  const openEdit = (pkg: PackageItem) => {
    setEditingId(pkg.id);
    setForm({
      title: pkg.title, titleEn: pkg.titleEn,
      description: pkg.description, descriptionEn: pkg.descriptionEn,
      price: pkg.price, priceNote: pkg.priceNote || "", priceNoteEn: pkg.priceNoteEn || "",
      features: JSON.parse(pkg.features).join("\n"),
      featuresEn: JSON.parse(pkg.featuresEn).join("\n"),
      isPopular: pkg.isPopular, isActive: pkg.isActive, order: pkg.order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.price) return toast.error("Judul dan harga wajib diisi");
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: JSON.stringify(form.features.split("\n").map(s => s.trim()).filter(Boolean)),
        featuresEn: JSON.stringify(form.featuresEn.split("\n").map(s => s.trim()).filter(Boolean)),
        order: Number(form.order),
      };
      const url = editingId ? `/api/admin/packages/${editingId}` : "/api/admin/packages";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Paket diperbarui!" : "Paket ditambahkan!");
      setShowModal(false);
      fetchPackages();
    } catch {
      toast.error("Gagal menyimpan paket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus paket ini?")) return;
    const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Paket dihapus"); fetchPackages(); }
    else toast.error("Gagal menghapus");
  };

  const togglePopular = async (pkg: PackageItem) => {
    await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pkg, isPopular: !pkg.isPopular }),
    });
    fetchPackages();
  };

  const toggleActive = async (pkg: PackageItem) => {
    await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pkg, isActive: !pkg.isActive }),
    });
    fetchPackages();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem",
    border: "1px solid #e5e0d8", borderRadius: "8px",
    fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif",
    color: "#2D2D2D", outline: "none", boxSizing: "border-box",
    backgroundColor: "#fafaf8",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600,
    color: "#6b6b6b", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.04em",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Paket &amp; Harga
          </h1>
          <p style={{ color: "#6b6b6b" }}>Kelola paket layanan yang ditampilkan di website</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary-green"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}
        >
          <Plus size={18} /> Tambah Paket
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" color="#8DA399" />
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {packages.map((pkg) => (
            <div key={pkg.id} style={{
              backgroundColor: "white", borderRadius: "16px", padding: "1.5rem",
              border: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "1.5rem",
              boxShadow: "0 2px 8px rgba(45,45,45,0.04)", opacity: pkg.isActive ? 1 : 0.6,
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
                backgroundColor: pkg.isPopular ? "#2D2D2D" : "#f0ede6",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Package size={22} color={pkg.isPopular ? "#8DA399" : "#6b6b6b"} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "#2D2D2D" }}>{pkg.title}</span>
                  {pkg.isPopular && (
                    <span style={{ backgroundColor: "#8DA399", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px" }}>
                      POPULER
                    </span>
                  )}
                  {!pkg.isActive && (
                    <span style={{ backgroundColor: "#e0e0e0", color: "#666", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "50px" }}>
                      NONAKTIF
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.85rem", color: "#6b6b6b", marginBottom: "0.25rem" }}>{pkg.description}</p>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#8DA399" }}>{pkg.price}</span>
                {pkg.priceNote && <span style={{ fontSize: "0.8rem", color: "#9b9b9b", marginLeft: "0.5rem" }}>{pkg.priceNote}</span>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => togglePopular(pkg)} title={pkg.isPopular ? "Hapus Popular" : "Set Popular"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: pkg.isPopular ? "#f39c12" : "#ccc", padding: "0.5rem" }}>
                  <Star size={18} fill={pkg.isPopular ? "#f39c12" : "none"} />
                </button>
                <button onClick={() => toggleActive(pkg)} title={pkg.isActive ? "Nonaktifkan" : "Aktifkan"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: pkg.isActive ? "#8DA399" : "#ccc", padding: "0.5rem" }}>
                  {pkg.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => openEdit(pkg)}
                  style={{ background: "#f0ede6", border: "none", cursor: "pointer", padding: "0.5rem 0.75rem", borderRadius: "8px", color: "#2D2D2D", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(pkg.id)}
                  style={{ background: "#fce8e8", border: "none", cursor: "pointer", padding: "0.5rem 0.75rem", borderRadius: "8px", color: "#e74c3c", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #e5e0d8" }}>
              Belum ada paket. Klik "Tambah Paket" untuk memulai.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", width: "100%", maxWidth: "760px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2D2D2D" }}>
                {editingId ? "Edit Paket" : "Tambah Paket Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b6b" }}><X size={22} /></button>
            </div>

            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Judul (ID)</label>
                  <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Konsultasi Profesional" />
                </div>
                <div>
                  <label style={labelStyle}>Title (EN)</label>
                  <input style={inputStyle} value={form.titleEn} onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))} placeholder="Professional Consultation" />
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Harga</label>
                  <input style={inputStyle} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Rp 2.500.000 / Custom / Gratis" />
                </div>
                <div>
                  <label style={labelStyle}>Catatan Harga (ID)</label>
                  <input style={inputStyle} value={form.priceNote} onChange={e => setForm(p => ({ ...p, priceNote: e.target.value }))} placeholder="Per proyek" />
                </div>
                <div>
                  <label style={labelStyle}>Price Note (EN)</label>
                  <input style={inputStyle} value={form.priceNoteEn} onChange={e => setForm(p => ({ ...p, priceNoteEn: e.target.value }))} placeholder="Per project" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Fitur (ID) — satu per baris</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={6} value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder={"3x Sesi Konsultasi\nAnalisis bisnis mendalam\n..."} />
                </div>
                <div>
                  <label style={labelStyle}>Features (EN) — one per line</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={6} value={form.featuresEn} onChange={e => setForm(p => ({ ...p, featuresEn: e.target.value }))} placeholder={"3x Consultation Sessions\nIn-depth business analysis\n..."} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <label style={labelStyle}>Urutan</label>
                  <input style={inputStyle} type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}>
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm(p => ({ ...p, isPopular: e.target.checked }))} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Tandai Populer</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D2D2D" }}>Aktif</span>
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
                {editingId ? "Simpan Perubahan" : "Tambah Paket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
