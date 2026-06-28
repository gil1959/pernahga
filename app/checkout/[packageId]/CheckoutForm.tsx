"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Tag } from "lucide-react";
import { toast } from "react-hot-toast";

interface PackageData {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string;
}

export default function CheckoutForm({ pkg }: { pkg: PackageData }) {
  const router = useRouter();
  const [voucher, setVoucher] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Parse features safely
  let parsedFeatures: string[] = [];
  try {
    parsedFeatures = JSON.parse(pkg.features);
  } catch (e) {
    parsedFeatures = [pkg.features];
  }

  const formatPrice = (priceStr: string) => {
    const lower = priceStr.toLowerCase();
    if (lower === "free" || lower === "gratis" || lower === "custom") return priceStr;
    const num = parseInt(priceStr.replace(/\D/g, ""), 10);
    if (!isNaN(num) && priceStr.trim().match(/^\d+$/)) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
    }
    return priceStr;
  };

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, voucher }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Silakan login terlebih dahulu");
          // Redirect to login with callback
          router.push(`/login?callbackUrl=/checkout/${pkg.id}`);
          return;
        }
        throw new Error(data.message || "Terjadi kesalahan");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("Gagal mendapatkan link pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Detail Paket */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(45,45,45,0.06)", border: "1px solid #ede9df" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f0ede6" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem" }}>{pkg.title}</h2>
            <p style={{ color: "#6b6b6b", fontSize: "0.95rem" }}>{pkg.description}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#8DA399" }}>
              {formatPrice(pkg.price)}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#9b9b9b", marginTop: "0.25rem" }}>/ bulan</div>
          </div>
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1rem" }}>Benefit Paket:</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "2rem" }}>
          {parsedFeatures.map((feat, idx) => (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(141,163,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                <Check size={12} color="#8DA399" strokeWidth={3} />
              </div>
              <span style={{ fontSize: "0.95rem", color: "#4a4a4a" }}>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Form Voucher */}
        <div style={{ backgroundColor: "#F4F1EA", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.75rem" }}>Punya Kode Promo?</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Tag size={18} color="#8DA399" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Masukkan kode voucher"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "8px", border: "1px solid #dcd7cb",
                  fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s"
                }}
              />
            </div>
            <button
              style={{ padding: "0 1.25rem", borderRadius: "8px", backgroundColor: "#2D2D2D", color: "#FFF", fontWeight: 600, border: "none", cursor: "pointer", transition: "background-color 0.2s" }}
              onClick={() => toast.success("Voucher belum divalidasi (UI Only)")}
            >
              Terapkan
            </button>
          </div>
        </div>

        {/* Summary & Pay */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>Total Tagihan</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D" }}>{formatPrice(pkg.price)}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={isLoading}
          style={{
            width: "100%", padding: "1rem", borderRadius: "12px", backgroundColor: "#8DA399", color: "#FFF",
            fontSize: "1.05rem", fontWeight: 700, border: "none", cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", transition: "all 0.2s",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <ShieldCheck size={20} />
          {isLoading ? "Memproses..." : "Bayar Sekarang"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#9b9b9b", marginTop: "1rem" }}>
          Pembayaran aman dan diproses secara instan.
        </p>
      </div>
    </div>
  );
}
