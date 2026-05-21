"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Shield, ShieldCheck, Trash2, PlusCircle } from "lucide-react";

interface IpRow {
  id: string;
  ip: string;
  isWhitelist: boolean;
  notes: string | null;
  userId: string | null;
  user: { id: string; name: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRegisteredIpsPage() {
  const [rows, setRows] = useState<IpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newIp, setNewIp] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registered-ips");
      setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.ip, r.notes, r.user?.email, r.user?.name].some((v) => v?.toLowerCase().includes(q));
  });

  const toggleWhitelist = async (row: IpRow) => {
    await fetch("/api/admin/registered-ips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: row.ip, isWhitelist: !row.isWhitelist }),
    });
    toast.success(row.isWhitelist ? "Whitelist dicabut" : "IP di-whitelist");
    fetchRows();
  };

  const remove = async (row: IpRow) => {
    if (!confirm(`Hapus block untuk IP ${row.ip}?`)) return;
    await fetch(`/api/admin/registered-ips?ip=${encodeURIComponent(row.ip)}`, { method: "DELETE" });
    toast.success("IP dihapus dari daftar");
    fetchRows();
  };

  const addManual = async () => {
    if (!newIp.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/admin/registered-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIp.trim(), isWhitelist: true, notes: newNotes }),
      });
      toast.success("IP ditambahkan (whitelist)");
      setNewIp("");
      setNewNotes("");
      fetchRows();
    } finally {
      setAdding(false);
    }
  };

  const card: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #ede9df",
    padding: "1.5rem",
  };
  const inputBase: React.CSSProperties = {
    padding: "0.6rem 0.85rem",
    border: "1px solid #ede9df",
    borderRadius: "10px",
    fontSize: "0.9rem",
    backgroundColor: "white",
    outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D" }}>
          Daftar IP Terdaftar
        </h1>
        <p style={{ color: "#6b6b6b" }}>
          1 IP = 1 akun (default). Whitelist IP yang share legit (kantor/kos/cafe).
        </p>
      </div>

      <div style={{ ...card, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", marginBottom: "0.4rem", textTransform: "uppercase" }}>
              Tambah IP whitelist manual
            </label>
            <input style={{ ...inputBase, width: "100%" }} placeholder="103.45.67.89" value={newIp} onChange={(e) => setNewIp(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#6b6b6b", marginBottom: "0.4rem", textTransform: "uppercase" }}>
              Catatan
            </label>
            <input style={{ ...inputBase, width: "100%" }} placeholder="Kantor / cafe / dll" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
          </div>
          <button onClick={addManual} disabled={adding || !newIp.trim()} className="btn-primary-green" style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem", height: "fit-content" }}>
            {adding ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <PlusCircle size={14} />}
            Tambah
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari IP / user / email..."
          style={{ ...inputBase, width: "100%" }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "#6b6b6b" }}>Belum ada IP terdaftar.</div>
      ) : (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead style={{ backgroundColor: "#f9f8f6" }}>
              <tr>
                {["IP", "User", "Status", "Catatan", "Terakhir", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", borderBottom: "1px solid #ede9df" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #ede9df" }}>
                  <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontWeight: 700, color: "#2D2D2D" }}>{r.ip}</td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    {r.user ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{r.user.name || "—"}</div>
                        <div style={{ fontSize: "0.78rem", color: "#6b6b6b" }}>{r.user.email}</div>
                      </>
                    ) : <span style={{ color: "#9b9b9b" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "3px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      borderRadius: 999,
                      backgroundColor: r.isWhitelist ? "#10b981" : "#6b7280",
                      color: "white",
                    }}>
                      {r.isWhitelist ? <ShieldCheck size={12} /> : <Shield size={12} />}
                      {r.isWhitelist ? "WHITELIST" : "BLOCKED"}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", fontSize: "0.85rem", color: "#6b6b6b" }}>{r.notes || "—"}</td>
                  <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem", color: "#9b9b9b" }}>
                    {new Date(r.updatedAt).toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "0.875rem 1rem", display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => toggleWhitelist(r)}
                      style={{ padding: "0.4rem 0.75rem", border: "1px solid #ede9df", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      {r.isWhitelist ? "Block" : "Whitelist"}
                    </button>
                    <button
                      onClick={() => remove(r)}
                      style={{ padding: "0.4rem 0.6rem", border: "none", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#ef4444", cursor: "pointer" }}
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
