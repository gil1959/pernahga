"use client";

import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Loader2,
  MessageCircle,
  X,
  Phone,
  User as UserIcon,
  Building,
  Calendar,
  Edit3,
  Search,
  Inbox,
  Mail,
} from "lucide-react";

type Consultation = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  topic: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED" | string;
  adminNotes?: string | null;
  createdAt: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
};

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING: { label: "Menunggu", bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  IN_PROGRESS: { label: "Diproses", bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  RESOLVED: { label: "Selesai", bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  CANCELLED: { label: "Batal", bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
};

export default function ConsultationList({ initialConsultations }: { initialConsultations: Consultation[] }) {
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const counts: Record<string, number> = { ALL: consultations.length, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, CANCELLED: 0 };
    for (const c of consultations) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
    return counts;
  }, [consultations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return consultations.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.topic?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q)
      );
    });
  }, [consultations, filter, search]);

  const openModal = (c: Consultation) => {
    setSelected(c);
    setAdminNotes(c.adminNotes || "");
    setStatus(c.status);
  };
  const closeModal = () => setSelected(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/consultations/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui pesanan");
      const updated = await res.json();
      setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success("Pesanan berhasil diperbarui");
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui pesanan";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"] as const).map((key) => {
          const meta = key === "ALL" ? null : STATUS_META[key];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "0.5rem 0.95rem",
                borderRadius: 999,
                border: `1px solid ${active ? "#2D2D2D" : "#ede9df"}`,
                backgroundColor: active ? "#2D2D2D" : "white",
                color: active ? "white" : "#2D2D2D",
                fontWeight: 700,
                fontSize: "0.825rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {key === "ALL" ? "Semua" : meta?.label}
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 999,
                  backgroundColor: active ? "rgba(255,255,255,0.2)" : "#f4f1ea",
                  color: active ? "white" : "#6b6b6b",
                  fontSize: "0.7rem",
                }}
              >
                {stats[key] || 0}
              </span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={14} color="#8b8b8b" style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / email / topik..."
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem 0.55rem 2.1rem",
              borderRadius: 10,
              border: "1px solid #ede9df",
              backgroundColor: "white",
              color: "#2D2D2D",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: "white", borderRadius: 16, border: "1px solid #ede9df", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#2D2D2D" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9f8f6", textAlign: "left", borderBottom: "1px solid #ede9df" }}>
                <th style={th}>Pelanggan</th>
                <th style={th}>Topik</th>
                <th style={th}>Tanggal</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#9b9b9b" }}>
                    <Inbox size={32} color="#cbd5e1" style={{ margin: "0 auto 0.5rem" }} />
                    <div style={{ fontWeight: 600 }}>Belum ada pesanan masuk</div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const meta = STATUS_META[c.status] ?? { label: c.status, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f1ede4" }}>
                      <td style={td}>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#6b6b6b", display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={11} /> {c.email}
                        </div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{c.topic}</div>
                        <div style={{ fontSize: "0.78rem", color: "#6b6b6b", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.message}
                        </div>
                      </td>
                      <td style={{ ...td, color: "#6b6b6b" }}>
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={td}>
                        <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <button
                          onClick={() => openModal(c)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "0.4rem 0.75rem",
                            borderRadius: 8,
                            border: "1px solid #ede9df",
                            backgroundColor: "white",
                            color: "#2D2D2D",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          <Edit3 size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,15,15,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "white", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", border: "1px solid #ede9df", color: "#2D2D2D" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1ede4", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "white", zIndex: 10 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageCircle size={18} color="#8DA399" /> Detail Pesanan
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "#6b6b6b", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
              <div style={{ backgroundColor: "#f9f8f6", padding: "1rem", borderRadius: 12, border: "1px solid #ede9df", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field icon={<UserIcon size={12} />} label="Nama Pelanggan">
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b6b6b" }}>{selected.email}</div>
                </Field>
                <Field icon={<Phone size={12} />} label="Nomor HP">
                  <div style={{ fontWeight: 700 }}>{selected.phone || selected.user?.phone || "-"}</div>
                </Field>
                <Field icon={<Building size={12} />} label="Perusahaan">
                  <div style={{ fontWeight: 700 }}>{selected.company || "-"}</div>
                </Field>
                <Field icon={<Calendar size={12} />} label="Tanggal Masuk">
                  <div style={{ fontWeight: 700 }}>{new Date(selected.createdAt).toLocaleString("id-ID")}</div>
                </Field>
              </div>

              <div>
                <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Topik & Pesan</h3>
                <div style={{ backgroundColor: "#f9f8f6", padding: "1.1rem", borderRadius: 12, border: "1px solid #ede9df" }}>
                  <div style={{ fontWeight: 800, marginBottom: "0.4rem", color: "#2D2D2D" }}>{selected.topic}</div>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "#3b3b3b", whiteSpace: "pre-wrap" }}>{selected.message}</p>
                </div>
              </div>

              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={lbl}>Status Pesanan</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
                    <option value="PENDING">Menunggu</option>
                    <option value="IN_PROGRESS">Diproses</option>
                    <option value="RESOLVED">Selesai</option>
                    <option value="CANCELLED">Batal</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Catatan Internal (hanya admin)</label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk pesanan ini..."
                    style={{ ...input, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  {(selected.phone || selected.user?.phone) && (
                    <a
                      href={`https://wa.me/${(selected.phone || selected.user?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Halo ${selected.name}, kami dari Pernahga. Menindaklanjuti pesanan Anda mengenai "${selected.topic}"...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "0.7rem 1.1rem", borderRadius: 10, backgroundColor: "white", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <MessageCircle size={15} /> Hubungi via WhatsApp
                    </a>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{ padding: "0.7rem 1.4rem", borderRadius: 10, backgroundColor: "#2D2D2D", color: "white", border: "none", fontSize: "0.875rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem", opacity: isUpdating ? 0.7 : 1 }}
                  >
                    {isUpdating ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : null} Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "#6b6b6b", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.85rem 1.25rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" };
const td: React.CSSProperties = { padding: "1rem 1.25rem", verticalAlign: "top" };
const lbl: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.4rem" };
const input: React.CSSProperties = { width: "100%", padding: "0.7rem 0.85rem", borderRadius: 10, backgroundColor: "white", color: "#2D2D2D", border: "1px solid #ede9df", outline: "none", fontSize: "0.9rem" };
