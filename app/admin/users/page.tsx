"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Mail, Phone, Calendar, Loader2, ShieldOff, Shield, ExternalLink } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  phone: string | null;
  phoneVerified: string | null;
  company: string | null;
  registrationIp: string | null;
  isBanned: boolean;
  createdAt: string;
  subscription: {
    status: string;
    package: { title: string; price: string };
    creditsTotal: number;
    creditsUsed: number;
    endsAt: string | null;
    trialEndsAt: string | null;
  } | null;
  _count: { consultations: number; testimonials: number; usageLogs: number };
}

const STATUS_COLOR: Record<string, string> = {
  TRIAL: "#f59e0b",
  ACTIVE: "#10b981",
  PAST_DUE: "#ef4444",
  CANCELLED: "#6b7280",
  EXPIRED: "#6b7280",
  DORMANT: "#a78bfa",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "trial" | "active" | "banned">("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = [u.name, u.email, u.phone, u.company, u.registrationIp]
      .some((v) => v?.toLowerCase().includes(q));
    if (!matchSearch) return false;
    if (filter === "trial") return u.subscription?.status === "TRIAL";
    if (filter === "active") return u.subscription?.status === "ACTIVE";
    if (filter === "banned") return u.isBanned;
    return true;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "ADMIN").length,
    trial: users.filter((u) => u.subscription?.status === "TRIAL").length,
    active: users.filter((u) => u.subscription?.status === "ACTIVE").length,
    banned: users.filter((u) => u.isBanned).length,
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Manajemen Pengguna
        </h1>
        <p style={{ color: "#6b6b6b" }}>Kelola plan, capability, dan akses tiap user</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total", value: stats.total, color: "#2D2D2D", filter: "all" as const },
          { label: "Trial", value: stats.trial, color: STATUS_COLOR.TRIAL, filter: "trial" as const },
          { label: "Aktif", value: stats.active, color: STATUS_COLOR.ACTIVE, filter: "active" as const },
          { label: "Admin", value: stats.admin, color: "#8DA399", filter: "all" as const },
          { label: "Banned", value: stats.banned, color: "#ef4444", filter: "banned" as const },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilter(s.filter)}
            style={{
              backgroundColor: filter === s.filter ? "#2D2D2D" : "white",
              color: filter === s.filter ? "white" : "#2D2D2D",
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              border: filter === s.filter ? "none" : "1px solid #ede9df",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: filter === s.filter ? "rgba(255,255,255,0.7)" : "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: filter === s.filter ? "white" : s.color }}>
              {s.value}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / email / phone / IP / company..."
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #ede9df",
            borderRadius: "10px",
            fontSize: "0.95rem",
            outline: "none",
            backgroundColor: "white",
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "white", padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px solid #ede9df" }}>
          <Users size={48} color="#cbd5e1" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#6b6b6b" }}>Tidak ada pengguna sesuai filter.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead style={{ backgroundColor: "#f9f8f6" }}>
              <tr>
                {["User", "Plan", "Kredit", "IP", "Daftar", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", borderBottom: "1px solid #ede9df" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const sub = u.subscription;
                const planName = sub?.package.title || "—";
                const planStatus = sub?.status || "—";
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #ede9df", backgroundColor: u.isBanned ? "#fef2f2" : "transparent" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {u.isBanned ? <ShieldOff size={14} color="#ef4444" /> : (u.role === "ADMIN" ? <Shield size={14} color="#8DA399" /> : null)}
                        <div>
                          <div style={{ fontWeight: 700, color: "#2D2D2D" }}>{u.name || "—"}</div>
                          <div style={{ fontSize: "0.78rem", color: "#6b6b6b", display: "flex", gap: "0.75rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                              <Mail size={11} /> {u.email}
                            </span>
                            {u.phone && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Phone size={11} /> {u.phone}{u.phoneVerified ? "" : " (unverified)"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "#2D2D2D" }}>{planName}</div>
                      <span style={{
                        display: "inline-block",
                        marginTop: 4,
                        padding: "2px 8px",
                        backgroundColor: STATUS_COLOR[planStatus] || "#6b7280",
                        color: "white",
                        borderRadius: 999,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}>
                        {planStatus}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {sub ? (
                        <span style={{ color: "#2D2D2D" }}>
                          {sub.creditsUsed} <span style={{ color: "#9b9b9b" }}>/ {sub.creditsTotal}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#6b6b6b" }}>
                      {u.registrationIp || "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem", color: "#6b6b6b" }}>
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link
                        href={`/admin/users/${u.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#8DA399", fontWeight: 700, textDecoration: "none", fontSize: "0.85rem" }}
                      >
                        Detail <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
