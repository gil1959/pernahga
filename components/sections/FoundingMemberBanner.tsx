"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "founding-banner-dismissed";

export default function FoundingMemberBanner() {
  const [visible, setVisible] = useState(false);
  const [slotsLeft] = useState(3);
  const totalSlots = 5;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      role="region"
      aria-label="Founding Member program"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: "#2D2D2D",
        color: "#F4F1EA",
        padding: "0.55rem 1rem",
        borderBottom: "1px solid #1f1f1f",
        boxShadow: "0 2px 18px rgba(45,45,45,0.4)",
      }}
    >
      <div
        className="container-custom"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.2rem 0.6rem",
            backgroundColor: "rgba(141,163,153,0.18)",
            border: "1px solid rgba(141,163,153,0.4)",
            borderRadius: "50px",
            color: "#8DA399",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <Star size={12} fill="#8DA399" stroke="#8DA399" />
          Founding Member
        </span>
        <span style={{ color: "rgba(244,241,234,0.85)" }}>
          {slotsLeft} dari {totalSlots} slot tersisa &middot; Diskon 50% lifetime untuk early adopter
        </span>
        <Link
          href="/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.35rem 0.9rem",
            backgroundColor: "#8DA399",
            color: "white",
            borderRadius: "50px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "transform 0.2s",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Klaim Sekarang
          <ArrowRight size={14} />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup banner"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid rgba(244,241,234,0.25)",
            color: "rgba(244,241,234,0.7)",
            cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
