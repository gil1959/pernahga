"use client";

/**
 * Smart Connect Modal — chooses the right flow based on channel:
 *  - WHATSAPP    → QR code via Evolution API
 *  - TELEGRAM    → 2 cards: Bot Pega (1-klik) | Bot Brand (2 menit, paste token)
 *  - DISCORD     → 1-klik OAuth Add to Server
 *  - EMAIL       → 1-klik OAuth Google
 *  - others      → manual ConnectionRequest (legacy fallback)
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader2, X, Bot, ArrowRight, Sparkles, RefreshCw, CheckCircle2, ExternalLink, Copy } from "lucide-react";
import type { CapabilityChannel } from "@prisma/client";

interface Props {
  channel: CapabilityChannel;
  meta: { label: string; iconBg: string; icon: React.ReactNode };
  onClose: () => void;
  onSuccess: () => void;
}

type View = "menu" | "wa-qr" | "tg-options" | "tg-option2" | "submitting";

export default function ConnectModal({ channel, meta, onClose, onSuccess }: Props) {
  const [view, setView] = useState<View>(() => initialView(channel));
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45,45,45,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "white", borderRadius: 16, maxWidth: 520, width: "100%", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {meta.icon}
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#2D2D2D" }}>Connect {meta.label}</h2>
              <p style={{ color: "#9b9b9b", fontSize: "0.78rem" }}>Pega akan handle channel ini buat Anda</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b6b6b" }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: 10, backgroundColor: "#fef2f2", color: "#991b1b", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {errorMsg}
          </div>
        )}

        {channel === "WHATSAPP" && <WhatsAppFlow setBusy={setBusy} setError={setErrorMsg} onSuccess={onSuccess} />}
        {channel === "TELEGRAM" && view === "tg-options" && (
          <TelegramOptions onPickOption2={() => setView("tg-option2")} setError={setErrorMsg} onSuccess={onSuccess} />
        )}
        {channel === "TELEGRAM" && view === "tg-option2" && (
          <TelegramOption2 onBack={() => setView("tg-options")} setError={setErrorMsg} onSuccess={onSuccess} />
        )}
        {channel === "DISCORD" && <DiscordFlow />}
        {channel === "EMAIL" && <EmailFlow />}
        {channel === "PEGA_CHAT" && <PegaChatFlow />}
        {!["WHATSAPP", "TELEGRAM", "DISCORD", "EMAIL", "PEGA_CHAT"].includes(channel) && (
          <ManualRequest channel={channel} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}

function initialView(channel: CapabilityChannel): View {
  if (channel === "TELEGRAM") return "tg-options";
  return "menu";
}

// ---------------- WHATSAPP ----------------
function WhatsAppFlow({ setBusy, setError, onSuccess }: { setBusy: (b: boolean) => void; setError: (m: string | null) => void; onSuccess: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [pairing, setPairing] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [state, setState] = useState<string>("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  const startConnect = useCallback(async () => {
    setBusy(true);
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/user/connect/whatsapp", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Gagal");
      setQr(d.qrCode || null);
      setPairing(d.pairingCode || null);
      setInstanceName(d.instanceName);
      setState("connecting");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  }, [setBusy, setError]);

  useEffect(() => { startConnect(); }, [startConnect, refreshKey]);

  // Poll status every 3s
  useEffect(() => {
    if (!instanceName || state === "open") return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/user/connect/whatsapp?instanceName=${instanceName}`);
        const d = await res.json();
        setState(d.state);
        if (d.state === "open") {
          toast.success("WhatsApp terhubung!");
          onSuccess();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [instanceName, state, onSuccess]);

  if (state === "open") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <CheckCircle2 size={48} color="#10b981" />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: 12, color: "#2D2D2D" }}>WhatsApp Terhubung!</h3>
        <p style={{ color: "#6b6b6b", fontSize: "0.9rem", marginTop: 6 }}>Pega siap balas chat customer Anda 24/7.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#6b6b6b", marginBottom: "1rem" }}>
        <strong>Cara scan:</strong> WhatsApp di HP → Settings → Linked Devices → Link a device → arahkan kamera ke QR di bawah.
      </p>
      <div style={{ display: "flex", justifyContent: "center", padding: "1rem", border: "1px dashed #ede9df", borderRadius: 12, marginBottom: "1rem", minHeight: 240, alignItems: "center" }}>
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`} alt="QR Code WhatsApp" style={{ maxWidth: 220 }} />
        ) : (
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
        )}
      </div>
      {pairing && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f3f1ec", borderRadius: 10, marginBottom: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.72rem", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Atau pakai kode pairing</div>
          <div style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 800, color: "#2D2D2D", marginTop: 4, letterSpacing: "0.08em" }}>{pairing}</div>
        </div>
      )}
      <div style={{ fontSize: "0.78rem", color: "#9b9b9b", textAlign: "center", marginBottom: "1rem" }}>
        Status: <strong style={{ color: state === "open" ? "#10b981" : "#f59e0b" }}>{state}</strong>
      </div>
      <button onClick={() => setRefreshKey((k) => k + 1)}
        style={{ width: "100%", padding: "0.75rem", borderRadius: 10, border: "1px solid #ede9df", backgroundColor: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <RefreshCw size={14} /> Refresh QR
      </button>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ---------------- TELEGRAM ----------------
function TelegramOptions({ onPickOption2, setError, onSuccess }: { onPickOption2: () => void; setError: (m: string | null) => void; onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);

  const pickOption1 = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user/connect/telegram?variant=option1");
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Gagal");
      // Open Telegram in new tab
      window.open(d.startGroupUrl, "_blank");
      toast.success("Telegram terbuka. Invite bot ke chat/group Anda.");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#6b6b6b", marginBottom: "1rem" }}>Pilih cara connect Telegram:</p>
      <div style={{ display: "grid", gap: 12 }}>
        <button onClick={pickOption1} disabled={busy}
          style={cardButtonStyle("#26A5E4")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Sparkles size={24} color="white" />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 800, color: "white" }}>Connect Cepat (Bot Pega)</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", marginTop: 2 }}>1 klik · bot bernama Pega · 30 detik</div>
            </div>
            {busy ? <Loader2 size={18} color="white" style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={18} color="white" />}
          </div>
        </button>
        <button onClick={onPickOption2}
          style={cardButtonStyle("white", "#2D2D2D", "1px solid #ede9df")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bot size={24} color="#2D2D2D" />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#2D2D2D" }}>Bikin Bot Brand Anda</div>
              <div style={{ fontSize: "0.78rem", color: "#6b6b6b", marginTop: 2 }}>2 menit · bot pakai nama bisnis Anda · branding terjaga</div>
            </div>
            <ArrowRight size={18} color="#2D2D2D" />
          </div>
        </button>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function TelegramOption2({ onBack, setError, onSuccess }: { onBack: () => void; setError: (m: string | null) => void; onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user/connect/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: token }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Gagal");
      toast.success(`Bot @${d.botUsername} aktif!`);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#6b6b6b", cursor: "pointer", fontSize: "0.85rem", marginBottom: "1rem" }}>← Kembali</button>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>Bikin Bot dengan Brand Anda</h3>
      <p style={{ fontSize: "0.85rem", color: "#6b6b6b", marginBottom: "1.25rem" }}>Cuma 4 step, sekitar 2 menit:</p>
      <ol style={{ paddingLeft: "1.2rem", marginBottom: "1.5rem", display: "grid", gap: 10 }}>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>
          Buka Telegram, chat ke{" "}
          <a href="https://t.me/BotFather" target="_blank" rel="noopener" style={{ color: "#26A5E4", fontWeight: 700, textDecoration: "underline" }}>
            @BotFather <ExternalLink size={11} style={{ display: "inline" }} />
          </a>
        </li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Ketik <code style={codeStyle}>/newbot</code>, kasih nama bot (contoh: &quot;Mira Coaching&quot;)</li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Kasih username bot (harus akhiran <code style={codeStyle}>bot</code>, contoh: <code style={codeStyle}>MiraCoaching_bot</code>)</li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Copy token yang BotFather kirim, paste di sini:</li>
      </ol>
      <input value={token} onChange={(e) => setToken(e.target.value)}
        placeholder="123456789:ABCxxxYYYzzz..."
        style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ede9df", borderRadius: 10, fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }} />
      <button onClick={submit} disabled={busy || !token}
        style={{ width: "100%", padding: "0.85rem", backgroundColor: "#26A5E4", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: token ? "pointer" : "not-allowed", opacity: token ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {busy && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
        Test & Connect
      </button>
    </div>
  );
}

// ---------------- DISCORD ----------------
function DiscordFlow() {
  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#6b6b6b", marginBottom: "1.25rem" }}>
        Pega akan join ke server Discord Anda dengan 1 klik via Discord OAuth. Anda pilih server, klik Authorize, selesai.
      </p>
      <a href="/api/user/connect/discord/start"
        style={{ display: "block", padding: "0.85rem 1.5rem", backgroundColor: "#5865F2", color: "white", borderRadius: 10, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
        Add Pega to Discord Server
      </a>
    </div>
  );
}

// ---------------- EMAIL ----------------
function EmailFlow() {
  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#6b6b6b", marginBottom: "1.25rem" }}>
        Login dengan Google untuk kasih izin Pega kirim & baca email. Aman, pakai OAuth resmi.
      </p>
      <a href="/api/user/connect/email/start"
        style={{ display: "block", padding: "0.85rem 1.5rem", backgroundColor: "#2D2D2D", color: "white", borderRadius: 10, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
        Connect dengan Google
      </a>
    </div>
  );
}

// ---------------- MANUAL FALLBACK ----------------
function PegaChatFlow() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
        Pega Chat aktif otomatis begitu kamu connect <strong>WhatsApp</strong> atau <strong>Telegram</strong>.
        Gunakan untuk minta laporan, brainstorm, draft caption, dst.
      </p>

      <div style={{ background: "#1a1a1a", borderRadius: "0.6rem", padding: "0.85rem 1rem", border: "1px solid #2a2a2a" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#F4F1EA", marginBottom: "0.4rem" }}>Via WhatsApp</p>
        <p style={{ fontSize: "0.78rem", color: "#9b9b9b", lineHeight: 1.6 }}>
          Buka WhatsApp → fitur <em>"Pesan ke diri sendiri"</em> → chat apapun.
          Pega bakal balas sesuai paket aktif kamu. Kalau minta hal di luar paket (mis. coding di Trial),
          Pega kasih tau perlu upgrade.
        </p>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: "0.6rem", padding: "0.85rem 1rem", border: "1px solid #2a2a2a" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#F4F1EA", marginBottom: "0.4rem" }}>Via Telegram</p>
        <p style={{ fontSize: "0.78rem", color: "#9b9b9b", lineHeight: 1.6 }}>
          Klik tombol Connect di card <strong>Telegram</strong>. Pilih opsi pertama (Bot Pega Pusat) →
          tap link → Start. Setelah binding, semua chat di bot itu = personal mode.
        </p>
      </div>

      <p style={{ fontSize: "0.72rem", color: "#9b9b9b", marginTop: "0.4rem" }}>
        Setiap balasan tetap potong kredit sesuai cost AI real (1 kredit ≈ $0.001).
      </p>
    </div>
  );
}

function ManualRequest({ channel, onSuccess }: { channel: CapabilityChannel; onSuccess: () => void }) {
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/user/connection-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, handle, notes }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Permintaan dikirim. Admin akan kontak Anda.");
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: "0.85rem", color: "#6b6b6b", marginBottom: "1rem" }}>
        Channel ini perlu setup manual. Isi info, admin akan kontak Anda.
      </p>
      <div style={{ display: "grid", gap: 12, marginBottom: "1rem" }}>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle / nomor akun"
          style={{ padding: "0.7rem 1rem", border: "1px solid #ede9df", borderRadius: 10, fontSize: "0.9rem" }} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan" rows={3}
          style={{ padding: "0.7rem 1rem", border: "1px solid #ede9df", borderRadius: 10, fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit" }} />
      </div>
      <button onClick={submit} disabled={busy}
        style={{ width: "100%", padding: "0.85rem", backgroundColor: "#2D2D2D", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
        {busy ? "Mengirim..." : "Kirim Permintaan"}
      </button>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  backgroundColor: "#f3f1ec",
  padding: "1px 6px",
  borderRadius: 4,
  fontFamily: "monospace",
  fontSize: "0.85em",
};

function cardButtonStyle(bg: string, color = "white", border = "none"): React.CSSProperties {
  return {
    padding: "1rem 1.25rem",
    borderRadius: 12,
    border,
    backgroundColor: bg,
    cursor: "pointer",
    color,
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
  };
}
