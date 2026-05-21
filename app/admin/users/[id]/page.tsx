"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, Loader2, Save, Mail, Phone, Building2, Calendar, Globe,
  Crown, Coins, ShieldOff, ShieldCheck, Activity, ToggleLeft, ToggleRight,
} from "lucide-react";

type CapabilityChannel =
  | "WHATSAPP" | "INSTAGRAM_DM" | "TELEGRAM" | "EMAIL" | "DISCORD"
  | "INSTAGRAM_POST" | "FACEBOOK_POST" | "LINKEDIN_POST" | "THREADS_POST" | "TWITTER_POST"
  | "TIKTOK_POST" | "PINTEREST_POST"
  | "BOOKING_CALENDAR" | "IMAGE_GEN" | "VIDEO_SCRIPT" | "DAILY_NEWS_BRIEFING"
  | "WEBHOOK_INTEGRATION" | "WHITE_LABEL";

const CAP_LABEL: Record<CapabilityChannel, string> = {
  WHATSAPP: "WhatsApp Customer Support",
  INSTAGRAM_DM: "Instagram DM Auto-Reply",
  TELEGRAM: "Telegram Bot",
  EMAIL: "Email Auto-Reply",
  DISCORD: "Discord Komunitas",
  INSTAGRAM_POST: "Auto-Posting Instagram",
  FACEBOOK_POST: "Auto-Posting Facebook",
  LINKEDIN_POST: "Auto-Posting LinkedIn",
  THREADS_POST: "Auto-Posting Threads",
  TWITTER_POST: "Auto-Posting X/Twitter",
  TIKTOK_POST: "Auto-Posting TikTok",
  PINTEREST_POST: "Auto-Posting Pinterest",
  BOOKING_CALENDAR: "Booking Calendar",
  IMAGE_GEN: "Image Generation",
  VIDEO_SCRIPT: "Video Script & Storyboard",
  DAILY_NEWS_BRIEFING: "Briefing Berita Harian",
  WEBHOOK_INTEGRATION: "Webhook Custom Integration",
  WHITE_LABEL: "White-Label Identity",
};

const ALL_CAPS: CapabilityChannel[] = Object.keys(CAP_LABEL) as CapabilityChannel[];

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phoneVerified: string | null;
  company: string | null;
  registrationIp: string | null;
  isBanned: boolean;
  bannedReason: string | null;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
    status: string;
    packageId: string;
    package: { id: string; title: string; price: string };
    creditsTotal: number;
    creditsUsed: number;
    startsAt: string;
    endsAt: string | null;
    trialEndsAt: string | null;
  } | null;
  capabilities: { channel: CapabilityChannel; enabled: boolean; grantedByPlan: boolean }[];
  connections: { id: string; channel: string; status: string; handle: string | null; notes: string | null; adminNotes: string | null; createdAt: string }[];
  usageLogs: { id: string; channel: string; credits: number; meta: string | null; createdAt: string }[];
}

interface PackageOption {
  id: string;
  title: string;
  price: string;
  isActive: boolean;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [data, setData] = useState<UserDetail | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "", company: "" });
  const [planForm, setPlanForm] = useState({ packageId: "", status: "ACTIVE", endsAt: "" });
  const [creditForm, setCreditForm] = useState({ creditsTotal: 0, creditsUsed: 0 });
  const [banForm, setBanForm] = useState({ isBanned: false, reason: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        toast.error("Gagal memuat user");
        return;
      }
      const body = await res.json();
      const u: UserDetail = body.user;
      setData(u);
      setPackages(body.allPackages || []);
      setProfile({
        name: u.name || "",
        email: u.email,
        phone: u.phone || "",
        company: u.company || "",
      });
      setPlanForm({
        packageId: u.subscription?.packageId || "",
        status: u.subscription?.status || "ACTIVE",
        endsAt: u.subscription?.endsAt ? u.subscription.endsAt.slice(0, 10) : "",
      });
      setCreditForm({
        creditsTotal: u.subscription?.creditsTotal || 0,
        creditsUsed: u.subscription?.creditsUsed || 0,
      });
      setBanForm({ isBanned: u.isBanned, reason: u.bannedReason || "" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function callAction(body: object, successMsg: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal");
      toast.success(successMsg);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const updateProfile = () => callAction({ action: "update_profile", ...profile }, "Profil disimpan");
  const setPlan = () => callAction(
    { action: "set_plan", packageId: planForm.packageId, status: planForm.status, endsAt: planForm.endsAt || null },
    "Paket diperbarui"
  );
  const setCredits = () => callAction(
    { action: "set_credits", creditsTotal: Number(creditForm.creditsTotal), creditsUsed: Number(creditForm.creditsUsed) },
    "Kredit diperbarui"
  );
  const setBan = () => callAction(
    { action: "set_ban", isBanned: banForm.isBanned, reason: banForm.reason },
    banForm.isBanned ? "User di-banned" : "Ban dicabut"
  );
  const toggleCap = (channel: CapabilityChannel, enabled: boolean) =>
    callAction({ action: "toggle_capability", channel, enabled }, `${CAP_LABEL[channel]} ${enabled ? "diaktifkan" : "dinonaktifkan"}`);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#6b6b6b" }}>
        User tidak ditemukan.
        <div style={{ marginTop: "1rem" }}>
          <Link href="/admin/users" style={{ color: "#8DA399", fontWeight: 700 }}>
            Kembali ke daftar
          </Link>
        </div>
      </div>
    );
  }

  const capMap = new Map(data.capabilities.map((c) => [c.channel, c]));

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.85rem",
    border: "1px solid #ede9df",
    borderRadius: "10px",
    fontSize: "0.9rem",
    backgroundColor: "white",
    outline: "none",
  };
  const labelBase: React.CSSProperties = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#6b6b6b",
    marginBottom: "0.4rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const card: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #ede9df",
    padding: "1.5rem",
  };
  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
    fontWeight: 700,
    color: "#2D2D2D",
  };

  return (
    <div>
      <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#6b6b6b", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        <ArrowLeft size={14} /> Kembali ke daftar
      </Link>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D" }}>
          {data.name || data.email}
        </h1>
        <p style={{ color: "#6b6b6b" }}>
          {data.email} · {data.role}{data.isBanned && <span style={{ marginLeft: 8, color: "#ef4444", fontWeight: 700 }}>· BANNED</span>}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Profile */}
        <div style={card}>
          <div style={headerRow}><Mail size={16} /> Profil</div>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <div>
              <label style={labelBase}>Nama</label>
              <input style={inputBase} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label style={labelBase}>Email</label>
              <input style={inputBase} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <label style={labelBase}>Phone</label>
              <input style={inputBase} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <label style={labelBase}>Company</label>
              <input style={inputBase} value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
            </div>
            <button onClick={updateProfile} disabled={saving} className="btn-primary-green" style={{ alignSelf: "flex-start", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
              Simpan profil
            </button>
            <div style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: "0.25rem", display: "grid", gap: "0.2rem" }}>
              <div><Globe size={11} style={{ display: "inline" }} /> IP daftar: <code>{data.registrationIp || "—"}</code></div>
              <div><Calendar size={11} style={{ display: "inline" }} /> Daftar: {new Date(data.createdAt).toLocaleString("id-ID")}</div>
              {data.phoneVerified && <div><Phone size={11} style={{ display: "inline" }} /> Phone verified: {new Date(data.phoneVerified).toLocaleDateString("id-ID")}</div>}
            </div>
          </div>
        </div>

        {/* Plan */}
        <div style={card}>
          <div style={headerRow}><Crown size={16} /> Paket / Subscription</div>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <div>
              <label style={labelBase}>Paket</label>
              <select style={inputBase} value={planForm.packageId} onChange={(e) => setPlanForm({ ...planForm, packageId: e.target.value })}>
                <option value="">— Tidak ada —</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} ({p.price})</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div>
                <label style={labelBase}>Status</label>
                <select style={inputBase} value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}>
                  {["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED", "DORMANT"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelBase}>Berakhir</label>
                <input type="date" style={inputBase} value={planForm.endsAt} onChange={(e) => setPlanForm({ ...planForm, endsAt: e.target.value })} />
              </div>
            </div>
            <button onClick={setPlan} disabled={saving || !planForm.packageId} className="btn-primary-green" style={{ alignSelf: "flex-start", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
              Set paket
            </button>

            {data.subscription && (
              <div style={{ marginTop: "0.5rem", padding: "0.85rem", backgroundColor: "#f9f8f6", borderRadius: "10px", fontSize: "0.85rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{data.subscription.package.title} · {data.subscription.status}</div>
                <div style={{ color: "#6b6b6b" }}>
                  Mulai {new Date(data.subscription.startsAt).toLocaleDateString("id-ID")}
                  {data.subscription.endsAt && ` · Berakhir ${new Date(data.subscription.endsAt).toLocaleDateString("id-ID")}`}
                  {data.subscription.trialEndsAt && data.subscription.status === "TRIAL" && ` · Trial sampai ${new Date(data.subscription.trialEndsAt).toLocaleDateString("id-ID")}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credits */}
        <div style={card}>
          <div style={headerRow}><Coins size={16} /> Kredit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            <div>
              <label style={labelBase}>Total kuota</label>
              <input type="number" style={inputBase} value={creditForm.creditsTotal} onChange={(e) => setCreditForm({ ...creditForm, creditsTotal: Number(e.target.value) })} />
            </div>
            <div>
              <label style={labelBase}>Terpakai</label>
              <input type="number" style={inputBase} value={creditForm.creditsUsed} onChange={(e) => setCreditForm({ ...creditForm, creditsUsed: Number(e.target.value) })} />
            </div>
          </div>
          <button onClick={setCredits} disabled={saving || !data.subscription} className="btn-primary-green" style={{ marginTop: "0.85rem", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            Set kredit
          </button>
          {!data.subscription && <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#9b9b9b" }}>Set paket dulu sebelum atur kredit.</p>}
        </div>

        {/* Ban */}
        <div style={card}>
          <div style={headerRow}>
            {banForm.isBanned ? <ShieldOff size={16} color="#ef4444" /> : <ShieldCheck size={16} color="#10b981" />}
            Status Akses
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
            <input
              type="checkbox"
              checked={banForm.isBanned}
              onChange={(e) => setBanForm({ ...banForm, isBanned: e.target.checked })}
            />
            <span>Banned (login langsung ditolak)</span>
          </label>
          <div>
            <label style={labelBase}>Alasan (opsional)</label>
            <input style={inputBase} value={banForm.reason} onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })} placeholder="Pembayaran fraud / abuse / dll" />
          </div>
          <button onClick={setBan} disabled={saving} style={{
            marginTop: "0.85rem",
            padding: "0.6rem 1.25rem",
            fontSize: "0.85rem",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            color: "white",
            backgroundColor: banForm.isBanned ? "#ef4444" : "#10b981",
            fontWeight: 700,
          }}>
            {banForm.isBanned ? "Banned User" : "Cabut Ban"}
          </button>
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <div style={headerRow}><ToggleRight size={16} /> Capability (Toggle Manual)</div>
        <p style={{ fontSize: "0.85rem", color: "#6b6b6b", marginBottom: "1rem" }}>
          Centang biru = di-grant oleh paket. Toggle untuk aktifkan/nonaktifkan kapabilitas pada user ini.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
          {ALL_CAPS.map((ch) => {
            const cap = capMap.get(ch);
            const granted = cap?.grantedByPlan ?? false;
            const enabled = cap?.enabled ?? false;
            return (
              <button
                key={ch}
                onClick={() => toggleCap(ch, !enabled)}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 0.85rem",
                  borderRadius: "10px",
                  border: granted ? "1px solid #8DA399" : "1px solid #ede9df",
                  backgroundColor: enabled ? "rgba(141,163,153,0.1)" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#2D2D2D", fontSize: "0.9rem" }}>{CAP_LABEL[ch]}</div>
                  <div style={{ fontSize: "0.72rem", color: granted ? "#8DA399" : "#9b9b9b", fontWeight: 600 }}>
                    {granted ? "Termasuk paket" : "Tidak termasuk paket"}
                  </div>
                </div>
                {enabled ? <ToggleRight size={28} color="#8DA399" /> : <ToggleLeft size={28} color="#cbd5e1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection requests */}
      {data.connections.length > 0 && (
        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <div style={headerRow}><Activity size={16} /> Permintaan Connect</div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {data.connections.map((c) => (
              <div key={c.id} style={{ padding: "0.75rem", border: "1px solid #ede9df", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{CAP_LABEL[c.channel as CapabilityChannel] || c.channel}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b6b6b" }}>
                    {c.handle && <>handle: <code>{c.handle}</code> · </>}
                    {new Date(c.createdAt).toLocaleString("id-ID")}
                  </div>
                  {c.notes && <div style={{ fontSize: "0.85rem", color: "#4a4a4a", marginTop: "0.25rem" }}>{c.notes}</div>}
                </div>
                <span style={{
                  padding: "3px 10px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  borderRadius: 999,
                  backgroundColor: c.status === "ACTIVE" ? "#10b981" : c.status === "REJECTED" ? "#ef4444" : "#f59e0b",
                  color: "white",
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent usage */}
      <div style={card}>
        <div style={headerRow}><Activity size={16} /> Aktivitas terakhir (50 entri)</div>
        {data.usageLogs.length === 0 ? (
          <p style={{ color: "#9b9b9b", fontSize: "0.85rem" }}>Belum ada aktivitas.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.4rem", maxHeight: "300px", overflowY: "auto" }}>
            {data.usageLogs.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "8px", backgroundColor: "#f9f8f6", fontSize: "0.85rem" }}>
                <span><strong>{l.channel}</strong></span>
                <span style={{ color: "#6b6b6b" }}>{l.credits} kredit · {new Date(l.createdAt).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
