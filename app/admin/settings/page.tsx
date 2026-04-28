"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Settings, Save, Loader2, Globe, MessageCircle, Mail, MapPin, Type, FileText, Share2, KeyRound } from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  return (
    <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e0d8" }}>
      <Editor
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.3.0/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 350,
          menubar: false,
          statusbar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image code | removeformat help',
          content_style: 'body { font-family: Plus Jakarta Sans, Helvetica, Arial, sans-serif; font-size:14px; color: #2D2D2D; }',
          skin: 'oxide',
        }}
      />
    </div>
  );
};

interface SettingsMap { [key: string]: string; }

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  isHtml?: boolean;
  rows?: number;
}

const sections: { title: string; icon: React.ReactNode; fields: Field[] }[] = [
  {
    title: "Kontak & Info",
    icon: <Globe size={18} />,
    fields: [
      { key: "whatsappNumber", label: "Nomor WhatsApp", placeholder: "628xxxxxxxxxx", hint: "Format: 628xxxx (tanpa +)" },
      { key: "email", label: "Email", placeholder: "hello@pernahga.com" },
      { key: "phone", label: "Telepon", placeholder: "+62 xxx xxxx xxxx" },
      { key: "address", label: "Alamat", placeholder: "Jakarta, Indonesia" },
    ],
  },
  {
    title: "Hero Section",
    icon: <Type size={18} />,
    fields: [
      { key: "heroTitle", label: "Judul Hero (ID)", placeholder: "Bingung Butuh Software Apa?", multiline: true },
      { key: "heroTitleEn", label: "Hero Title (EN)", placeholder: "Confused About What Software?", multiline: true },
      { key: "heroSubtitle", label: "Subtitle Hero (ID)", placeholder: "Konsultasi gratis...", multiline: true },
      { key: "heroSubtitleEn", label: "Hero Subtitle (EN)", placeholder: "Free consultation...", multiline: true },
    ],
  },
  {
    title: "Tentang Kami",
    icon: <FileText size={18} />,
    fields: [
      { key: "aboutTitle", label: "Judul About (ID)", placeholder: "Kami Fokus pada Solusi..." },
      { key: "aboutTitleEn", label: "About Title (EN)", placeholder: "We Focus on Solutions..." },
      { key: "aboutText", label: "Teks About (ID)", placeholder: "Pernahga adalah...", multiline: true },
      { key: "aboutTextEn", label: "About Text (EN)", placeholder: "Pernahga is...", multiline: true },
    ],
  },
  {
    title: "Media Sosial",
    icon: <Share2 size={18} />,
    fields: [
      { key: "instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/pernahga" },
      { key: "tiktokUrl", label: "TikTok URL", placeholder: "https://tiktok.com/@pernahga" },
      { key: "youtubeUrl", label: "YouTube URL", placeholder: "https://youtube.com/@pernahga" },
    ],
  },
  {
    title: "Halaman Legal",
    icon: <FileText size={18} />,
    fields: [
      { key: "termsContent", label: "Konten Terms of Service (ID)", placeholder: "<h1>Terms of Service</h1><p>...</p>", multiline: true, isHtml: true },
      { key: "termsContentEn", label: "Konten Terms of Service (EN)", placeholder: "<h1>Terms of Service</h1><p>...</p>", multiline: true, isHtml: true },
      { key: "privacyContent", label: "Konten Privacy Policy (ID)", placeholder: "<h1>Privacy Policy</h1><p>...</p>", multiline: true, isHtml: true },
      { key: "privacyContentEn", label: "Konten Privacy Policy (EN)", placeholder: "<h1>Privacy Policy</h1><p>...</p>", multiline: true, isHtml: true },
      { key: "refundContent", label: "Konten Refund Policy (ID)", placeholder: "<h1>Refund Policy</h1><p>...</p>", multiline: true, isHtml: true },
      { key: "refundContentEn", label: "Konten Refund Policy (EN)", placeholder: "<h1>Refund Policy</h1><p>...</p>", multiline: true, isHtml: true },
    ],
  },
  {
    title: "SMTP & Keamanan",
    icon: <Settings size={18} />,
    fields: [
      { key: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com" },
      { key: "smtpPort", label: "SMTP Port", placeholder: "587" },
      { key: "smtpUser", label: "SMTP User (Email)", placeholder: "email@domain.com" },
      { key: "smtpPass", label: "SMTP Password / App Password", placeholder: "xxxx xxxx xxxx xxxx" },
      { key: "smtpFrom", label: "Email Pengirim (From)", placeholder: "Pernahga <noreply@pernahga.com>" },
      { key: "captchaSiteKey", label: "Captcha Site Key (v3/v2)", placeholder: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" },
      { key: "captchaSecretKey", label: "Captcha Secret Key", placeholder: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe" },
    ],
  },
  {
    title: "Google OAuth (Login Google)",
    icon: <KeyRound size={18} />,
    fields: [
      {
        key: "googleOAuthEnabled",
        label: "Aktifkan Login Google",
        placeholder: "true",
        hint: "Isi 'true' untuk aktifkan, kosongkan atau 'false' untuk nonaktifkan.",
      },
      {
        key: "googleClientId",
        label: "Google Client ID",
        placeholder: "xxxx.apps.googleusercontent.com",
        hint: "Dari Google Cloud Console → APIs & Services → Credentials",
      },
      {
        key: "googleClientSecret",
        label: "Google Client Secret",
        placeholder: "GOCSPX-xxxxxxxxxxxx",
        hint: "Juga simpan di env var GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET di Vercel/server.",
      },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    setSettings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings(p => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Pengaturan berhasil disimpan!");
      setDirty(false);
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", border: "1px solid #e5e0d8",
    borderRadius: "10px", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
    color: "#2D2D2D", outline: "none", boxSizing: "border-box", backgroundColor: "#fafaf8",
    transition: "border-color 0.2s",
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
      <Loader2 size={36} className="animate-spin" color="#8DA399" />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Pengaturan Situs
          </h1>
          <p style={{ color: "#6b6b6b" }}>Ubah konten dan konfigurasi website secara langsung</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="btn-primary-green"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem", opacity: (!dirty && !saving) ? 0.6 : 1 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {dirty && (
        <div style={{ backgroundColor: "#fef3e2", border: "1px solid #fed7aa", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#92400e", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings size={16} />
          Ada perubahan yang belum disimpan.
        </div>
      )}

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f9f8f6" }}>
              <div style={{ color: "#8DA399" }}>{section.icon}</div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D" }}>{section.title}</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#6b6b6b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {field.label}
                  </label>
                  {field.isHtml ? (
                    <RichTextEditor
                      value={settings[field.key] || ""}
                      onChange={(content) => handleChange(field.key, content)}
                    />
                  ) : field.multiline ? (
                    <textarea
                      style={{ ...inputStyle, resize: "vertical" }}
                      rows={field.rows || 3}
                      value={settings[field.key] || ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      style={inputStyle}
                      value={settings[field.key] || ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.hint && <p style={{ fontSize: "0.78rem", color: "#9b9b9b", marginTop: "0.35rem" }}>{field.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="btn-primary-green"
          style={{ padding: "0.875rem 2rem", fontSize: "1rem", opacity: (!dirty && !saving) ? 0.6 : 1 }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </button>
      </div>
    </div>
  );
}
