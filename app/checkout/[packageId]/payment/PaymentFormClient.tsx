"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, Building2, Loader2, User, Mail, Phone } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface PackageData {
  id: string;
  title: string;
  price: string;
}

export default function PaymentFormClient({ pkg }: { pkg: PackageData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const formatPrice = (priceStr: string) => {
    const lower = priceStr.toLowerCase();
    if (lower === "free" || lower === "gratis" || lower === "custom") return priceStr;
    const num = parseInt(priceStr.replace(/\D/g, ""), 10);
    if (!isNaN(num) && priceStr.trim().match(/^\d+$/)) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
    }
    return priceStr;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      MySwal.fire({
        icon: "warning",
        title: "Pilih Metode Pembayaran",
        text: "Silakan pilih salah satu metode pembayaran terlebih dahulu.",
        confirmButtonColor: "#8DA399",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call and payment processing
    setTimeout(() => {
      setIsLoading(false);
      MySwal.fire({
        icon: "success",
        title: "Pesanan Berhasil Dibuat!",
        text: `Terima kasih, silakan ikuti instruksi pembayaran untuk paket ${pkg.title}.`,
        confirmButtonColor: "#8DA399",
      }).then(() => {
        router.push("/dashboard"); // Redirect to dashboard or success page
      });
    }, 1500);
  };

  const paymentMethods = [
    { id: "dummy_offline", name: "Dummy Offline Payment", icon: <Wallet size={24} color="#8DA399" /> },
    { id: "bank_bca", name: "Transfer Bank BCA", icon: <Building2 size={24} color="#8DA399" /> },
    { id: "bank_mandiri", name: "Transfer Bank Mandiri", icon: <Building2 size={24} color="#8DA399" /> },
    { id: "bank_bni", name: "Transfer Bank BNI", icon: <Building2 size={24} color="#8DA399" /> },
    { id: "bank_bri", name: "Transfer Bank BRI", icon: <Building2 size={24} color="#8DA399" /> },
  ];

  return (
    <form onSubmit={handlePayment} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Formulir Data Diri */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(45,45,45,0.06)", border: "1px solid #ede9df" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1.5rem", borderBottom: "1px solid #f0ede6", paddingBottom: "1rem" }}>
          Informasi Pembeli
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nama Lengkap</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="#8DA399" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                name="name"
                required
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "8px", border: "1px solid #dcd7cb",
                  fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>Alamat Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="#8DA399" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                name="email"
                required
                placeholder="Masukkan alamat email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "8px", border: "1px solid #dcd7cb",
                  fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>Nomor Handphone (WhatsApp)</label>
            <div style={{ position: "relative" }}>
              <Phone size={18} color="#8DA399" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "8px", border: "1px solid #dcd7cb",
                  fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metode Pembayaran */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(45,45,45,0.06)", border: "1px solid #ede9df" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1.5rem", borderBottom: "1px solid #f0ede6", paddingBottom: "1rem" }}>
          Pilih Metode Pembayaran
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {paymentMethods.map((method) => (
            <label 
              key={method.id} 
              style={{ 
                display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", 
                borderRadius: "12px", border: selectedMethod === method.id ? "2px solid #8DA399" : "1px solid #ede9df",
                backgroundColor: selectedMethod === method.id ? "rgba(141,163,153,0.05)" : "#FFF",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", backgroundColor: "#F4F1EA", borderRadius: "8px" }}>
                {method.icon}
              </div>
              <span style={{ flex: 1, fontSize: "1rem", fontWeight: 600, color: "#2D2D2D" }}>{method.name}</span>
              <input 
                type="radio" 
                name="paymentMethod" 
                value={method.id} 
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                style={{ width: "20px", height: "20px", accentColor: "#8DA399" }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Summary & Pay */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(45,45,45,0.06)", border: "1px solid #ede9df" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D" }}>Total Tagihan</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D" }}>{formatPrice(pkg.price)}</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%", padding: "1rem", borderRadius: "12px", backgroundColor: "#8DA399", color: "#FFF",
            fontSize: "1.05rem", fontWeight: 700, border: "none", cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", transition: "all 0.2s",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={20} />}
          {isLoading ? "Memproses..." : "Konfirmasi & Bayar"}
        </button>
      </div>
    </form>
  );
}
