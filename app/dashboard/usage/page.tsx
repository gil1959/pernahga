"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Activity } from "lucide-react";

interface UsageRow { channel: string; credits: number }
interface Me {
  user: { subscription: { creditsTotal: number; creditsUsed: number; package: { title: string } } | null };
  usage: UsageRow[];
}

export default function UsagePage() {
  const [data, setData] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  if (loading) return <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}><Loader2 style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} size={32} /></div>;
  if (!data) return null;

  const sub = data.user.subscription;
  const totalSpent = data.usage.reduce((sum, r) => sum + r.credits, 0);

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>Usage</h1>
      <p style={{ color: "#6b6b6b", marginBottom: "2rem" }}>Detail pemakaian kredit per channel (30 hari terakhir)</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <Stat label="Paket" value={sub?.package.title || "—"} />
        <Stat label="Kredit terpakai" value={totalSpent.toLocaleString("id-ID")} />
        <Stat label="Sisa kuota" value={sub ? (sub.creditsTotal - sub.creditsUsed).toLocaleString("id-ID") : "—"} />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Activity size={16} color="#8DA399" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Per Channel</h2>
        </div>
        {data.usage.length === 0 ? (
          <p style={{ color: "#9b9b9b", fontSize: "0.9rem" }}>Belum ada aktivitas tercatat 30 hari terakhir.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {data.usage.sort((a, b) => b.credits - a.credits).map((row) => (
              <div key={row.channel} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 0.85rem", backgroundColor: "#f9f8f6", borderRadius: "10px" }}>
                <span style={{ fontWeight: 600, color: "#2D2D2D" }}>{row.channel}</span>
                <span style={{ fontWeight: 700, color: "#8DA399" }}>{row.credits.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #ede9df" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", marginTop: "0.4rem" }}>{value}</div>
    </div>
  );
}
