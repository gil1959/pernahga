"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2, Save, Plus, Trash2, Sparkles, Building2, Smile, ListChecks, ArrowLeft } from "lucide-react";

const PERSONA_OPTIONS = [
  { value: "SANTAI", label: "Santai", desc: "Akrab, gaya kakak/teman" },
  { value: "FORMAL", label: "Formal", desc: "Profesional, sapaan 'Anda'" },
  { value: "CERIA", label: "Ceria", desc: "Hangat, antusias" },
  { value: "PROFESIONAL", label: "Profesional", desc: "Fokus solusi, ramah" },
] as const;

interface FaqRow { q: string; a: string }

export default function WorkspacePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [businessIndustry, setBusinessIndustry] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [personaStyle, setPersonaStyle] = useState<string>("PROFESIONAL");
  const [personaTone, setPersonaTone] = useState("");
  const [personaSignature, setPersonaSignature] = useState("");
  const [faqs, setFaqs] = useState<FaqRow[]>([{ q: "", a: "" }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/workspace");
      if (!res.ok) throw new Error("Gagal load workspace");
      const d = await res.json();
      setBusinessName(d.businessName || "");
      setBusinessDesc(d.businessDesc || "");
      setBusinessIndustry(d.businessIndustry || "");
      setOperatingHours(d.operatingHours || "");
      setPersonaStyle(d.personaStyle || "PROFESIONAL");
      setPersonaTone(d.personaTone || "");
      setPersonaSignature(d.personaSignature || "");
      if (Array.isArray(d.faq) && d.faq.length > 0) setFaqs(d.faq);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal load workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    setSaving(true);
    try {
      const cleanedFaq = faqs.filter((f) => f.q.trim() && f.a.trim());
      const res = await fetch("/api/user/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, businessDesc, businessIndustry, operatingHours,
          personaStyle, personaTone, personaSignature,
          faq: cleanedFaq,
          onboardingDone: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Gagal menyimpan");
      }
      toast.success("Workspace tersimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = (i: number, field: "q" | "a", v: string) => {
    setFaqs(faqs.map((f, idx) => idx === i ? { ...f, [field]: v } : f));
  };
  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#8DA399" }} />
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" style={{ color: "#8DA399", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "1rem", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700 }}>
        <ArrowLeft size={14} /> Kembali ke Overview
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
        <Sparkles size={24} color="#8DA399" />
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", letterSpacing: "-0.02em" }}>
          Workspace Pega
        </h1>
      </div>
      <p style={{ color: "#6b6b6b", marginBottom: "2rem" }}>
        Konteks bisnis Anda yang akan dipakai Pega untuk balas customer. Update kapan aja.
      </p>

      {/* Bisnis */}
      <Section icon={<Building2 size={20} color="white" />} title="Tentang bisnis Anda">
        <Field label="Nama bisnis" hint="Nama yang akan disebut Pega ke customer">
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="contoh: Coaching Mira" style={inputStyle} />
        </Field>
        <Field label="Industri" hint="Coaching, konsultan, course, agency, dll">
          <input value={businessIndustry} onChange={(e) => setBusinessIndustry(e.target.value)} placeholder="contoh: Life Coaching" style={inputStyle} />
        </Field>
        <Field label="Deskripsi singkat">
          <textarea value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} placeholder="Sesi coaching 1-on-1 untuk profesional..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <Field label="Jam operasional">
          <input value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} placeholder="Senin-Jumat 09.00-17.00 WIB" style={inputStyle} />
        </Field>
      </Section>

      {/* Persona */}
      <Section icon={<Smile size={20} color="white" />} title="Persona Pega">
        <Field label="Gaya bicara">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {PERSONA_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setPersonaStyle(opt.value)} style={{
                textAlign: "left", padding: "1rem", borderRadius: 12,
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
        <Field label="Tone tambahan (opsional)">
          <input value={personaTone} onChange={(e) => setPersonaTone(e.target.value)} placeholder="Sering pakai 'kak', tutup dengan terimakasih" style={inputStyle} />
        </Field>
        <Field label="Tanda tangan pesan (opsional)">
          <input value={personaSignature} onChange={(e) => setPersonaSignature(e.target.value)} placeholder="Salam, Mira" style={inputStyle} />
        </Field>
      </Section>

      {/* FAQ */}
      <Section icon={<ListChecks size={20} color="white" />} title="FAQ produk / layanan">
        <p style={{ color: "#6b6b6b", marginBottom: "1rem", fontSize: "0.9rem" }}>
          Pega akan jawab customer dengan info ini. Maks 100 entry.
        </p>
        {faqs.map((f, i) => (
          <div key={i} style={{ backgroundColor: "#f4f1ea", borderRadius: 12, padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8DA399", textTransform: "uppercase" }}>FAQ {i + 1}</span>
              {faqs.length > 1 && (
                <button onClick={() => removeFaq(i)} type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Trash2 size={14} /> Hapus
                </button>
              )}
            </div>
            <input value={f.q} onChange={(e) => updateFaq(i, "q", e.target.value)} placeholder="Pertanyaan customer" style={{ ...inputStyle, marginBottom: 8 }} />
            <textarea value={f.a} onChange={(e) => updateFaq(i, "a", e.target.value)} placeholder="Jawaban Pega" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        ))}
        {faqs.length < 100 && (
          <button onClick={addFaq} type="button" style={{
            marginTop: 8, padding: "0.7rem 1.2rem", backgroundColor: "white", color: "#2D2D2D",
            borderRadius: 10, border: "1px dashed #8DA399", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Plus size={14} /> Tambah FAQ
          </button>
        )}
      </Section>

      {/* Save sticky */}
      <div style={{ position: "sticky", bottom: 0, padding: "1rem 0", marginTop: "2rem" }}>
        <button onClick={save} disabled={saving} style={{
          padding: "1rem 2rem", backgroundColor: "#2D2D2D", color: "white",
          borderRadius: 12, border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          {saving && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          <Save size={16} /> Simpan Workspace
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 16, padding: "2rem", border: "1px solid #ede9df", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#2D2D2D" }}>{title}</h2>
      </div>
      {children}
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
  width: "100%", padding: "0.75rem 1rem", border: "1px solid #ede9df",
  borderRadius: 10, outline: "none", fontSize: "0.95rem", fontFamily: "inherit",
};
