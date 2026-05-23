"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Building2, Smile, ListChecks } from "lucide-react";

const PERSONA_OPTIONS = [
  { value: "SANTAI", label: "Santai", desc: "Akrab, gaya kakak/teman" },
  { value: "FORMAL", label: "Formal", desc: "Profesional, sapaan 'Anda'" },
  { value: "CERIA", label: "Ceria", desc: "Hangat, antusias" },
  { value: "PROFESIONAL", label: "Profesional", desc: "Fokus solusi, ramah" },
] as const;

interface FaqRow { q: string; a: string }

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // step 1
  const [businessName, setBusinessName] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [businessIndustry, setBusinessIndustry] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  // step 2
  const [personaStyle, setPersonaStyle] = useState<string>("PROFESIONAL");
  const [personaTone, setPersonaTone] = useState("");
  const [personaSignature, setPersonaSignature] = useState("");
  // step 3
  const [faqs, setFaqs] = useState<FaqRow[]>([{ q: "", a: "" }]);

  // load existing values (so user can edit later via /onboarding too)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/user/workspace");
        if (!res.ok) return;
        const d = await res.json();
        if (!alive) return;
        setBusinessName(d.businessName || "");
        setBusinessDesc(d.businessDesc || "");
        setBusinessIndustry(d.businessIndustry || "");
        setOperatingHours(d.operatingHours || "");
        setPersonaStyle(d.personaStyle || "PROFESIONAL");
        setPersonaTone(d.personaTone || "");
        setPersonaSignature(d.personaSignature || "");
        if (Array.isArray(d.faq) && d.faq.length > 0) setFaqs(d.faq);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const persist = async (extra: Record<string, unknown> = {}) => {
    const cleanedFaq = faqs.filter((f) => f.q.trim() && f.a.trim());
    const res = await fetch("/api/user/workspace", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName, businessDesc, businessIndustry, operatingHours,
        personaStyle, personaTone, personaSignature,
        faq: cleanedFaq,
        ...extra,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || "Gagal menyimpan");
    }
  };

  const nextStep = async () => {
    setLoading(true);
    try {
      await persist();
      setStep(step + 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      await persist({ onboardingDone: true });
      toast.success("Setup selesai, selamat datang di PernahGa");
      router.push("/dashboard");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    router.push("/dashboard");
  };

  const updateFaq = (i: number, field: "q" | "a", v: string) => {
    setFaqs(faqs.map((f, idx) => idx === i ? { ...f, [field]: v } : f));
  };
  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F1EA", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
            <Sparkles size={18} color="#8DA399" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Setup Pega
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Kenalkan Pega ke bisnis Anda
          </h1>
          <p style={{ color: "#6b6b6b" }}>
            3 langkah sebentar biar Pega bisa bicara seperti Anda. Bisa diskip dan diisi nanti.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              flex: 1, height: 6, borderRadius: 999,
              backgroundColor: step >= n ? "#8DA399" : "#ede9df",
              transition: "background-color 0.3s",
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "white", borderRadius: 20, padding: "2.5rem", border: "1px solid #ede9df" }}>
          {step === 1 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase" }}>Langkah 1 dari 3</div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D" }}>Tentang bisnis Anda</h2>
                </div>
              </div>
              <Field label="Nama bisnis" hint="Nama yang akan disebut Pega ke customer">
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="contoh: Coaching Mira"
                  style={inputStyle}
                />
              </Field>
              <Field label="Industri" hint="Coaching, konsultan, course, agency, dll">
                <input
                  value={businessIndustry}
                  onChange={(e) => setBusinessIndustry(e.target.value)}
                  placeholder="contoh: Life Coaching"
                  style={inputStyle}
                />
              </Field>
              <Field label="Deskripsi singkat" hint="Pega akan pakai ini saat customer nanya 'apa sih bisnis ini?'">
                <textarea
                  value={businessDesc}
                  onChange={(e) => setBusinessDesc(e.target.value)}
                  placeholder="contoh: Sesi coaching 1-on-1 untuk profesional yang lagi cari arah karir baru..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
              <Field label="Jam operasional" hint="Format bebas, contoh: Senin-Jumat 09.00-17.00 WIB">
                <input
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Senin-Jumat 09.00-17.00 WIB"
                  style={inputStyle}
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Smile size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase" }}>Langkah 2 dari 3</div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D" }}>Persona Pega</h2>
                </div>
              </div>
              <Field label="Gaya bicara" hint="Pilih yang paling pas dengan brand Anda">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {PERSONA_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      type="button"
                      onClick={() => setPersonaStyle(opt.value)}
                      style={{
                        textAlign: "left",
                        padding: "1rem",
                        borderRadius: 12,
                        border: personaStyle === opt.value ? "2px solid #8DA399" : "1px solid #ede9df",
                        backgroundColor: personaStyle === opt.value ? "#f3f5f3" : "white",
                        cursor: "pointer",
                      }}>
                      <div style={{ fontWeight: 700, color: "#2D2D2D" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "#6b6b6b", marginTop: 4 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Tone tambahan (opsional)" hint="Misalnya 'sering pakai emoji', 'selalu sebut nama customer'">
                <input
                  value={personaTone}
                  onChange={(e) => setPersonaTone(e.target.value)}
                  placeholder="Sering pakai 'kak', tutup dengan terimakasih"
                  style={inputStyle}
                />
              </Field>
              <Field label="Tanda tangan pesan (opsional)" hint="Pega akan tutup balasan dengan teks ini">
                <input
                  value={personaSignature}
                  onChange={(e) => setPersonaSignature(e.target.value)}
                  placeholder="Salam, Mira"
                  style={inputStyle}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ListChecks size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase" }}>Langkah 3 dari 3</div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2D2D2D" }}>FAQ produk</h2>
                </div>
              </div>
              <p style={{ color: "#6b6b6b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Tambahkan pertanyaan customer yang sering muncul. Pega akan jawab pakai info ini.
                Bisa ditambah/edit nanti dari halaman Workspace.
              </p>
              {faqs.map((f, i) => (
                <div key={i} style={{ backgroundColor: "#f4f1ea", borderRadius: 12, padding: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", textTransform: "uppercase" }}>FAQ {i + 1}</span>
                    {faqs.length > 1 && (
                      <button onClick={() => removeFaq(i)} type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }}>
                        Hapus
                      </button>
                    )}
                  </div>
                  <input
                    value={f.q}
                    onChange={(e) => updateFaq(i, "q", e.target.value)}
                    placeholder="Pertanyaan customer (contoh: Berapa harga sesi konsultasi?)"
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <textarea
                    value={f.a}
                    onChange={(e) => updateFaq(i, "a", e.target.value)}
                    placeholder="Jawaban Pega"
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              ))}
              {faqs.length < 30 && (
                <button onClick={addFaq} type="button" style={{
                  marginTop: 8,
                  padding: "0.7rem 1.2rem",
                  backgroundColor: "white",
                  color: "#2D2D2D",
                  borderRadius: 10,
                  border: "1px dashed #8DA399",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}>
                  + Tambah FAQ
                </button>
              )}
            </>
          )}

          {/* Footer actions */}
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button onClick={skip} type="button" style={skipBtn}>
              Skip dulu, isi nanti
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} type="button" style={secondaryBtn}>
                  <ArrowLeft size={14} /> Kembali
                </button>
              )}
              {step < 3 ? (
                <button onClick={nextStep} disabled={loading} type="button" style={primaryBtn}>
                  {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  Lanjut <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={finish} disabled={submitting} type="button" style={primaryBtn}>
                  {submitting && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  Selesai <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {hint && <div style={{ fontSize: "0.78rem", color: "#9b9b9b", marginBottom: 8 }}>{hint}</div>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1px solid #ede9df",
  borderRadius: 10,
  outline: "none",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};
const primaryBtn: React.CSSProperties = {
  padding: "0.75rem 1.4rem",
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
};
const secondaryBtn: React.CSSProperties = {
  padding: "0.75rem 1.2rem",
  backgroundColor: "white",
  color: "#2D2D2D",
  borderRadius: 10,
  border: "1px solid #ede9df",
  fontWeight: 700,
  fontSize: "0.9rem",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};
const skipBtn: React.CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "transparent",
  color: "#6b6b6b",
  borderRadius: 10,
  border: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
};
