import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./CheckoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CheckoutPage({
  params,
}: {
  params: { packageId: string };
}) {
  const pkg = await prisma.package.findUnique({
    where: { id: params.packageId },
  });

  if (!pkg) {
    notFound();
  }

  const packageData = {
    id: pkg.id,
    title: pkg.title,
    description: pkg.description,
    price: pkg.price,
    features: pkg.features,
  };

  return (
    <div style={{ backgroundColor: "#F4F1EA", minHeight: "100vh", padding: "4rem 2rem" }}>
      <div className="container-custom" style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        <Link 
          href="/#pricing" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#6b6b6b", textDecoration: "none", marginBottom: "2rem", fontSize: "0.95rem", fontWeight: 600, transition: "color 0.2s" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Pilihan Paket
        </Link>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "2rem", textAlign: "center", letterSpacing: "-0.02em" }}>
          Selesaikan Pesanan Anda
        </h1>
        
        <CheckoutForm pkg={packageData} />
      </div>
    </div>
  );
}
