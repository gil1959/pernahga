"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, MessageCircle, MoreVertical, X, Phone, User, Building, Calendar, Edit3 } from "lucide-react";

export default function ConsultationList({ initialConsultations }: { initialConsultations: any[] }) {
  const [consultations, setConsultations] = useState(initialConsultations);
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");

  const openModal = (consult: any) => {
    setSelectedConsult(consult);
    setAdminNotes(consult.adminNotes || "");
    setStatus(consult.status);
  };

  const closeModal = () => {
    setSelectedConsult(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsult) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/consultations/${selectedConsult.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui pesanan");

      const updated = await res.json();
      setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success("Pesanan berhasil diperbarui");
      closeModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (s: string) => {
    switch(s) {
      case "RESOLVED": return { bg: "rgba(46, 125, 50, 0.2)", color: "#4caf50" };
      case "IN_PROGRESS": return { bg: "rgba(21, 101, 192, 0.2)", color: "#64b5f6" };
      case "CANCELLED": return { bg: "rgba(198, 40, 40, 0.2)", color: "#ef5350" };
      default: return { bg: "rgba(245, 127, 23, 0.2)", color: "#ffb300" };
    }
  };

  return (
    <div style={{ backgroundColor: "#1a1a1a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#F4F1EA", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
              <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "rgba(244,241,234,0.6)" }}>Pelanggan</th>
              <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "rgba(244,241,234,0.6)" }}>Topik</th>
              <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "rgba(244,241,234,0.6)" }}>Tanggal</th>
              <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "rgba(244,241,234,0.6)" }}>Status</th>
              <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "rgba(244,241,234,0.6)", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "rgba(244,241,234,0.4)" }}>
                  Belum ada data pesanan/konsultasi.
                </td>
              </tr>
            ) : (
              consultations.map((consult) => {
                const statusStyle = getStatusStyle(consult.status);
                return (
                  <tr key={consult.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background-color 0.2s" }} className="hover-row">
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{consult.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)" }}>{consult.email}</div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontWeight: 500 }}>{consult.topic}</div>
                      <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)", marginTop: "0.25rem", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {consult.message}
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "rgba(244,241,234,0.7)" }}>
                      {new Date(consult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{ padding: "0.3rem 0.75rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {consult.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                      <button
                        onClick={() => openModal(consult)}
                        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.5rem", color: "#F4F1EA", cursor: "pointer", transition: "all 0.2s" }}
                        title="Detail & Update"
                        className="action-btn"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail & Update */}
      {selectedConsult && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "#2D2D2D", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", color: "#F4F1EA" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#2D2D2D", zIndex: 10 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageCircle size={20} color="#8DA399" /> Detail Konsultasi
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(244,241,234,0.6)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "grid", gap: "1.5rem" }}>
              {/* User Info */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <User size={12} /> Nama Pelanggan
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedConsult.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.7)" }}>{selectedConsult.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Phone size={12} /> Telepon
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedConsult.user?.phone || "-"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Building size={12} /> Perusahaan
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedConsult.company || "-"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.5)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={12} /> Tanggal Masuk
                  </div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedConsult.createdAt).toLocaleString('id-ID')}</div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 style={{ fontSize: "0.9rem", color: "rgba(244,241,234,0.5)", marginBottom: "0.5rem" }}>Topik & Pesan</h3>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#8DA399" }}>{selectedConsult.topic}</div>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(244,241,234,0.9)", whiteSpace: "pre-wrap" }}>
                    {selectedConsult.message}
                  </p>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(244,241,234,0.8)", marginBottom: "0.5rem" }}>
                    Status Pesanan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", backgroundColor: "#1a1a1a", color: "#F4F1EA", border: "1px solid rgba(255,255,255,0.1)", outline: "none", fontSize: "0.95rem" }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(244,241,234,0.8)", marginBottom: "0.5rem" }}>
                    Catatan Internal (Hanya dilihat admin)
                  </label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk pesanan ini..."
                    style={{ width: "100%", padding: "0.875rem", borderRadius: "10px", backgroundColor: "#1a1a1a", color: "#F4F1EA", border: "1px solid rgba(255,255,255,0.1)", outline: "none", resize: "vertical", fontSize: "0.95rem", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "0.5rem" }}>
                  <a
                    href={`https://wa.me/${selectedConsult.user?.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Halo ${selectedConsult.name}, kami dari Pernahga. Menindaklanjuti konsultasi Anda mengenai "${selectedConsult.topic}"...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "0.875rem 1.5rem", borderRadius: "10px", backgroundColor: "transparent", color: "#4caf50", border: "1px solid #4caf50", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <MessageCircle size={18} /> Hubungi via WhatsApp
                  </a>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{ padding: "0.875rem 2rem", borderRadius: "10px", backgroundColor: "#8DA399", color: "#1a1a1a", border: "none", fontSize: "0.95rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "opacity 0.2s", opacity: isUpdating ? 0.7 : 1 }}
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover { background-color: rgba(255,255,255,0.02); }
        .action-btn:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
