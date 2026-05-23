"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Check, X, Plug, AlertCircle, Save, Zap, Eye, EyeOff } from "lucide-react";

interface Schema {
  provider: string;
  displayName: string;
  description: string;
  secretFields: Array<{ key: string; label: string; placeholder?: string; help?: string }>;
  publicFields: Array<{ key: string; label: string; placeholder?: string; help?: string }>;
}

interface Integration {
  provider: string;
  displayName: string;
  enabled: boolean;
  status: "NOT_CONFIGURED" | "PENDING_TEST" | "VALID" | "INVALID" | "DISABLED";
  lastTestedAt: string | null;
  lastTestError: string | null;
  publicFields: Record<string, string>;
  maskedSecrets: Record<string, string>;
}

interface Row {
  schema: Schema;
  integration: Integration;
  loadError?: string;
}

const STATUS_INFO: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  NOT_CONFIGURED: { color: "#6b7280", bg: "#f3f4f6", label: "Belum disetup", icon: <Plug size={12} /> },
  PENDING_TEST: { color: "#f59e0b", bg: "#fef3c7", label: "Belum dites", icon: <AlertCircle size={12} /> },
  VALID: { color: "#10b981", bg: "#d1fae5", label: "Valid", icon: <Check size={12} /> },
  INVALID: { color: "#ef4444", bg: "#fee2e2", label: "Invalid", icon: <X size={12} /> },
  DISABLED: { color: "#6b7280", bg: "#f3f4f6", label: "Nonaktif", icon: <X size={12} /> },
};

export default function IntegrationsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cryptoKeyOk, setCryptoKeyOk] = useState<boolean>(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const d = await res.json();
      setRows(d.providers || []);
      setCryptoKeyOk(d.cryptoKeyOk !== false);
      if (!activeTab && d.providers?.length > 0) {
        setActiveTab(d.providers[0].schema.provider);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal load");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
      </div>
    );
  }

  const active = rows.find((r) => r.schema.provider === activeTab);

  return (
    <div style={{ padding: "2rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
          Integrasi
        </h1>
        <p style={{ color: "#6b6b6b", marginTop: 4 }}>
          Connect AI ke channel user — Discord, Telegram, Email, WhatsApp Evolution, Meta Business.
          Isi credential, test, lalu aktifkan biar user bisa pakai dari dashboard.
        </p>
      </div>

      {!cryptoKeyOk && (
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          marginBottom: "1.5rem",
          color: "#854d0e",
          fontSize: "0.85rem",
        }}>
          <strong style={{ display: "block", marginBottom: 6 }}>⚠️ Mode plaintext (encryption off)</strong>
          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>CRYPTO_MASTER_KEY</code> env belum diset di Vercel.
          Credential tetap bisa disave dan dipakai, tapi disimpan plaintext di database.
          Untuk production-grade encryption, set env CRYPTO_MASTER_KEY (32-byte hex) lalu redeploy.
        </div>
      )}

      {/* Tab strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {rows.map((r) => {
          const status = STATUS_INFO[r.integration.status];
          const isActive = activeTab === r.schema.provider;
          return (
            <button key={r.schema.provider}
              onClick={() => setActiveTab(r.schema.provider)}
              style={{
                padding: "0.75rem 1.2rem",
                borderRadius: 12,
                border: isActive ? "2px solid #2D2D2D" : "1px solid #ede9df",
                backgroundColor: isActive ? "#2D2D2D" : "white",
                color: isActive ? "white" : "#2D2D2D",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
              <span>{r.schema.displayName}</span>
              <span style={{
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: "0.7rem",
                fontWeight: 700,
                backgroundColor: isActive ? "rgba(255,255,255,0.18)" : status.bg,
                color: isActive ? "white" : status.color,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}>
                {r.integration.enabled ? "ON" : "OFF"}
              </span>
            </button>
          );
        })}
      </div>

      {active && <ProviderForm key={active.schema.provider} row={active} onSaved={fetchAll} />}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProviderForm({ row, onSaved }: { row: Row; onSaved: () => void }) {
  const { schema, integration } = row;
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [publicFields, setPublicFields] = useState<Record<string, string>>(integration.publicFields);
  const [enabled, setEnabled] = useState(integration.enabled);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const status = STATUS_INFO[integration.status];

  const submit = async (action: "save" | "test" | "toggle", overrides: Record<string, unknown> = {}) => {
    if (action === "test") setTesting(true); else setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: schema.provider,
          action,
          secrets: action === "save" ? secrets : undefined,
          publicFields: action === "save" ? publicFields : undefined,
          enabled: action === "toggle" ? !integration.enabled : (action === "save" ? enabled : undefined),
          ...overrides,
        }),
      });
      // Try parse JSON even on error so we get backend message
      const d = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      if (action === "test") {
        if (d.ok) toast.success(d.message || "Test berhasil");
        else toast.error(d.message || "Test gagal");
      } else if (action === "save") {
        toast.success("Tersimpan");
        setSecrets({}); // clear input setelah save
      } else {
        toast.success(`Provider ${integration.enabled ? "dimatikan" : "diaktifkan"}`);
      }
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal", { duration: 7000 });
    } finally {
      setSaving(false);
      setTesting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "white", borderRadius: 16, padding: "2rem", border: "1px solid #ede9df" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 4 }}>{schema.displayName}</h2>
          <p style={{ color: "#6b6b6b", fontSize: "0.9rem", maxWidth: 640 }}>{schema.description}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <span style={{
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: "0.78rem",
            fontWeight: 700,
            backgroundColor: status.bg,
            color: status.color,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
            {status.icon} {status.label}
          </span>
          <button
            onClick={() => submit("toggle")}
            disabled={saving}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 10,
              border: "none",
              backgroundColor: integration.enabled ? "#10b981" : "#9ca3af",
              color: "white",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}>
            {integration.enabled ? "AKTIF" : "NONAKTIF"} (klik toggle)
          </button>
        </div>
      </div>

      {integration.lastTestError && (
        <div style={{ marginTop: 16, padding: "0.85rem 1rem", borderRadius: 10, backgroundColor: "#fef2f2", color: "#991b1b", fontSize: "0.85rem" }}>
          <strong>Error terakhir:</strong> {integration.lastTestError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: "2rem" }}>
        {/* Public fields */}
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 12, letterSpacing: "-0.01em" }}>Konfigurasi Publik</h3>
          {schema.publicFields.map((f) => (
            <FieldRow key={f.key} label={f.label} hint={f.help}>
              <input
                value={publicFields[f.key] ?? ""}
                onChange={(e) => setPublicFields({ ...publicFields, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                style={inputStyle}
              />
            </FieldRow>
          ))}
        </div>

        {/* Secret fields */}
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 12, letterSpacing: "-0.01em" }}>Credential (Encrypted)</h3>
          {schema.secretFields.map((f) => {
            const masked = integration.maskedSecrets[f.key];
            const has = Boolean(masked);
            return (
              <FieldRow key={f.key} label={f.label} hint={f.help}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showSecret[f.key] ? "text" : "password"}
                    value={secrets[f.key] ?? ""}
                    onChange={(e) => setSecrets({ ...secrets, [f.key]: e.target.value })}
                    placeholder={has ? `Tersimpan: ${masked} (kosongkan = tetap)` : f.placeholder}
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button type="button"
                    onClick={() => setShowSecret({ ...showSecret, [f.key]: !showSecret[f.key] })}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#6b6b6b",
                      cursor: "pointer",
                      padding: 4,
                    }}>
                    {showSecret[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </FieldRow>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: "2rem", alignItems: "center" }}>
        <button onClick={() => submit("save")} disabled={saving}
          style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "#2D2D2D",
            color: "white",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
          {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          <Save size={14} /> Simpan
        </button>
        <button onClick={() => submit("test")} disabled={testing}
          style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "#8DA399",
            color: "white",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
          {testing && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          <Zap size={14} /> Test Connect
        </button>
        {integration.lastTestedAt && (
          <span style={{ fontSize: "0.78rem", color: "#9b9b9b" }}>
            Terakhir dites: {new Date(integration.lastTestedAt).toLocaleString("id-ID")}
          </span>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: "0.72rem", color: "#9b9b9b", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 1rem",
  border: "1px solid #ede9df",
  borderRadius: 10,
  outline: "none",
  fontSize: "0.9rem",
  fontFamily: "inherit",
};
