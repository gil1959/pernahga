"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Users, Mail, Phone, Building2, Calendar, MessageSquare, Loader2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  phone: string | null;
  company: string | null;
  createdAt: string;
  _count: { consultations: number; testimonials: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    [u.name, u.email, u.company].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const userCount = users.filter(u => u.role === "USER").length;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Manajemen Pengguna
        </h1>
        <p style={{ color: "#6b6b6b" }}>Lihat dan pantau semua pengguna yang terdaftar</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Pengguna", value: users.length, color: "#3498db" },
          { label: "Regular User", value: userCount, color: "#8DA399" },
          { label: "Admin", value: adminCount, color: "#9b59b6" },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: "white", borderRadius: "12px", padding: "1.25rem 1.5rem", border: "1px solid #ede9df", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b6b6b" }}>{s.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau perusahaan..."
          style={{
            width: "100%", maxWidth: "400px", padding: "0.75rem 1rem",
            border: "1px solid #e5e0d8", borderRadius: "10px", fontSize: "0.9rem",
            fontFamily: "Plus Jakarta Sans, sans-serif", outline: "none", backgroundColor: "white",
            boxSizing: "border-box",
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" color="#8DA399" />
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9f8f6", borderBottom: "1px solid #ede9df" }}>
                {["Pengguna", "Kontak", "Perusahaan", "Role", "Aktivitas", "Bergabung"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 700, color: "#6b6b6b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0ede6" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafaf8")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: u.role === "ADMIN" ? "#9b59b615" : "#8DA39915", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: u.role === "ADMIN" ? "#9b59b6" : "#8DA399", fontSize: "0.9rem", flexShrink: 0 }}>
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: "#2D2D2D" }}>{u.name || "—"}</p>
                        <p style={{ color: "#6b6b6b", fontSize: "0.8rem" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "#6b6b6b" }}>
                    {u.phone ? <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Phone size={13} />{u.phone}</div> : "—"}
                  </td>
                  <td style={{ padding: "1rem", color: "#6b6b6b" }}>
                    {u.company ? <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Building2 size={13} />{u.company}</div> : "—"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: "50px",
                      backgroundColor: u.role === "ADMIN" ? "#9b59b615" : "#8DA39915",
                      color: u.role === "ADMIN" ? "#9b59b6" : "#8DA399",
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", color: "#6b6b6b", fontSize: "0.8rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><MessageSquare size={12} />{u._count.consultations} konsultasi</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "#6b6b6b", fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Calendar size={13} />
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b" }}>
              <Users size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <p>Tidak ada pengguna ditemukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
