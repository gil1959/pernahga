import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, QrCode, Sparkles, Send, MessagesSquare, Settings } from "lucide-react";
import { toast } from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

export default function ConnectModal({ capability, onSuccess, onClose }: { capability: any; onSuccess: () => void; onClose: () => void }) {
  if (capability.channel === "WHATSAPP") return <WhatsAppConnect onSuccess={onSuccess} />;
  if (capability.channel === "TELEGRAM") return <TelegramConnect onSuccess={onSuccess} />;
  return <ManualConnect channel={capability.channel} onSuccess={onSuccess} />;
}

// ----------------------------------
// WhatsApp Flow
// ----------------------------------
function WhatsAppConnect({ onSuccess }: { onSuccess: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [pairing, setPairing] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const startConnect = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/user/connect/whatsapp", { method: "POST" });
      const rawText = await res.text();
      let d;
      try {
        d = JSON.parse(rawText);
      } catch (e) {
        throw new Error(`Invalid JSON: ${rawText.slice(0, 500)}`);
      }
      
      if (!res.ok) throw new Error(d.message || JSON.stringify(d).slice(0, 100));
      setQr(d.qrCode || null);
      setPairing(d.pairingCode || null);
      setInstanceName(d.instanceName);
      setState("connecting");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal parse response");
    } finally {
      setBusy(false);
    }
  }, [setBusy, setError]);

  useEffect(() => { startConnect(); }, [startConnect, refreshKey]);

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
        Pega akan handle channel ini buat Anda
      </p>
      {error && (
        <div style={{ padding: "0.8rem", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, fontSize: "0.8rem", marginBottom: "1rem", whiteSpace: "pre-wrap", overflowX: "auto" }}>
          <b>Error dari Server:</b><br/>{error}
        </div>
      )}
      <div style={{ padding: "1.5rem", border: "1px solid #ede9df", borderRadius: 16, background: "#faf9f6", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 250, justifyContent: "center" }}>
        {busy ? (
          <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Loading QR Code...</p>
        ) : qr ? (
          <>
            <div style={{ background: "white", padding: "1rem", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              {qr.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR Code" style={{ width: 180, height: 180, objectFit: "contain" }} />
              ) : (
                <QRCodeSVG value={qr} size={180} />
              )}
            </div>
            {pairing && (
              <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b6b6b" }}>Atau Pairing Code: <strong style={{ color: "#2D2D2D" }}>{pairing}</strong></p>
            )}
            <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#6b6b6b", textAlign: "center", lineHeight: 1.5 }}>
              Cara scan: WhatsApp di HP → Settings → Linked Devices → Link a device → arahkan kamera ke QR di atas.
            </p>
            <p style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "#999", fontWeight: 700 }}>
              Status: {state || "connecting..."}
            </p>
          </>
        ) : !error ? (
          <p style={{ fontSize: "0.9rem", color: "#6b6b6b" }}>Gagal generate QR.</p>
        ) : null}
      </div>
      <button
        onClick={() => setRefreshKey(k => k + 1)}
        disabled={busy}
        style={{
          width: "100%", padding: "0.8rem", background: "#f1f1f1", color: "#2D2D2D", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", marginTop: "1rem"
        }}
      >
        Refresh QR
      </button>
    </div>
  );
}

// ----------------------------------
// Telegram Flow
// ----------------------------------
function TelegramConnect({ onSuccess }: { onSuccess: () => void }) {
  const [view, setView] = useState<"pick" | "botfather">("pick");
  const [botToken, setBotToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cardButtonStyle = (bg: string) => ({
    width: "100%", padding: "1.2rem", background: bg, border: "none", borderRadius: 16, color: "white", cursor: "pointer", textAlign: "left" as const, transition: "transform 0.2s"
  });

  const pickOption1 = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/user/connect/telegram-bot", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Gagal");
      window.open(d.startGroupUrl, "_blank");
      toast.success("Telegram terbuka. Invite bot ke chat/group Anda.");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  if (view === "botfather") {
    return <TelegramBotFatherFlow onSuccess={onSuccess} onBack={() => setView("pick")} />;
  }

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#6b6b6b", marginBottom: "1rem" }}>Pilih cara connect Telegram:</p>
      {error && <p style={{ color: "#b91c1c", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
      <div style={{ display: "grid", gap: 12 }}>
        <button onClick={pickOption1} disabled={busy} style={cardButtonStyle("#26A5E4")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Sparkles size={24} color="white" />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Pake Bot Pega (Instan)</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: 4 }}>Tinggal invite bot official Pega ke group/chat Anda.</div>
            </div>
          </div>
        </button>
        <button onClick={() => setView("botfather")} style={cardButtonStyle("#2D2D2D")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Settings size={24} color="white" />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Bikin Bot Sendiri (Custom)</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: 4 }}>Bikin bot dengan nama dan foto brand Anda sendiri.</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function TelegramBotFatherFlow({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitToken = async () => {
    if (!token.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/user/connect/telegram-bot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() })
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
      {error && <p style={{ color: "#b91c1c", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
      <p style={{ fontSize: "0.85rem", color: "#6b6b6b", marginBottom: "1.25rem" }}>Cuma 4 step, sekitar 2 menit:</p>
      <ol style={{ paddingLeft: "1.2rem", marginBottom: "1.5rem", display: "grid", gap: 10 }}>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Buka Telegram, chat ke <a href="https://t.me/BotFather" target="_blank" rel="noopener" style={{ color: "#26A5E4", fontWeight: 700, textDecoration: "underline" }}>@BotFather</a></li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Ketik <code style={{ background: "#ede9df", padding: "2px 6px", borderRadius: 4 }}>/newbot</code> lalu ikutin instruksinya</li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>BotFather bakal kasih pesan panjang yang ada <strong>HTTP API Token</strong></li>
        <li style={{ fontSize: "0.85rem", color: "#2D2D2D" }}>Copy token itu dan paste di bawah ini:</li>
      </ol>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={token} onChange={e => setToken(e.target.value)} placeholder="Contoh: 123456789:ABCdefGHI..."
          style={{ flex: 1, padding: "0.7rem 1rem", border: "1px solid #ede9df", borderRadius: 10, fontSize: "0.85rem" }} />
        <button onClick={submitToken} disabled={busy || !token.trim()}
          style={{ padding: "0 1.2rem", background: "#2D2D2D", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Cek..." : "Konek"}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------
// Manual Connect Fallback
// ----------------------------------
function ManualConnect({ channel, onSuccess }: { channel: string; onSuccess: () => void }) {
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/user/connect/manual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, handle, notes })
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
          style={{ padding: "0.7rem 1rem", border: "1px solid #ede9df", borderRadius: 10, fontSize: "0.9rem", fontFamily: "inherit" }} />
      </div>
      <button onClick={submit} disabled={busy}
        style={{ width: "100%", padding: "0.8rem", background: "#2D2D2D", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
        {busy ? "Mengirim..." : "Kirim Request Setup"}
      </button>
    </div>
  );
}
