import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const session = await auth();
  
  if (!session?.user?.id) return null;

  const savedItems = await prisma.savedItem.findMany({
    where: { userId: session.user.id },
    include: { showcase: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Portofolio Disimpan
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: "1.05rem" }}>
          Koleksi proyek dan portofolio yang Anda simpan untuk referensi.
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem" }}>
          {savedItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(141,163,153,0.1)", color: "#8DA399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Bookmark size={32} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "0.5rem" }}>Belum ada portofolio disimpan</h3>
              <p style={{ color: "#6b6b6b", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
                Anda dapat menyimpan portofolio yang menarik dengan menekan tombol simpan pada halaman detail proyek.
              </p>
              <Link href="/showcase" className="btn-primary" style={{ padding: "0.75rem 1.5rem", textDecoration: "none", color: "white", backgroundColor: "#8DA399", borderRadius: "10px", fontWeight: 600 }}>
                Jelajahi Portofolio
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {savedItems.map(item => (
                <Link href={`/showcase/${item.showcase.slug}`} key={item.id} style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #ede9df", overflow: "hidden", textDecoration: "none", transition: "all 0.2s" }} className="hover-card">
                  <div style={{ width: "100%", height: "180px", backgroundColor: "#f4f1ea", position: "relative" }}>
                    <img src={item.showcase.thumbnail} alt={item.showcase.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "white", padding: "0.4rem", borderRadius: "50%", color: "#8DA399" }}>
                      <Bookmark size={18} fill="#8DA399" />
                    </div>
                  </div>
                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", lineHeight: 1.3, marginBottom: "0.5rem" }}>
                      {item.showcase.title}
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "#6b6b6b", flex: 1, marginBottom: "1rem" }}>
                      {item.showcase.description.length > 80 ? item.showcase.description.substring(0, 80) + "..." : item.showcase.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", color: "#8DA399", fontSize: "0.85rem", fontWeight: 700, gap: "0.3rem" }}>
                      Lihat detail proyek <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(45,45,45,0.05);
          border-color: #8DA399 !important;
        }
      `}</style>
    </div>
  );
}
