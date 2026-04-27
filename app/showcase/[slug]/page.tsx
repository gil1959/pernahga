import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const showcase = await prisma.showcase.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!showcase) return { title: "Not Found" };
  
  return {
    title: `${showcase.title} | Portofolio Pernahga`,
    description: showcase.description,
  };
}

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await prisma.showcase.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!item) notFound();

  const tags: string[] = JSON.parse(item.tags || "[]");
  const techStack: string[] = JSON.parse(item.techStack || "[]");
  const images: string[] = JSON.parse(item.images || "[]");

  return (
    <SessionProvider>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#F4F1EA", minHeight: "100vh" }}>
        {/* Header content */}
        <div style={{ backgroundColor: "#2D2D2D", color: "#F4F1EA", paddingTop: "4rem", paddingBottom: "2rem" }}>
          <div className="container-custom">
            <Link 
              href="/showcase" 
              className="text-gray-300 hover:text-white transition-colors"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2rem", fontSize: "0.9rem", fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> Kembali ke Portofolio
            </Link>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {tags.map(tag => (
                <span key={tag} style={{ backgroundColor: "rgba(141,163,153,0.15)", color: "#8DA399", padding: "0.3rem 0.75rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid rgba(141,163,153,0.3)" }}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, marginBottom: "1.5rem", maxWidth: "800px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              {item.title}
            </h1>
            
            <p style={{ fontSize: "1.1rem", color: "rgba(244,241,234,0.8)", maxWidth: "800px", lineHeight: 1.7, marginBottom: "3rem" }}>
              {item.description}
            </p>
          </div>
        </div>

        {/* Thumbnail Hero */}
        <div className="container-custom" style={{ marginTop: "-2rem", marginBottom: "4rem" }}>
          <div style={{ width: "100%", borderRadius: "20px", overflow: "hidden", border: "1px solid #ede9df", backgroundColor: "white", boxShadow: "0 10px 40px rgba(45,45,45,0.1)" }}>
            <img 
              src={item.thumbnail} 
              alt={item.title} 
              style={{ width: "100%", height: "auto", maxHeight: "600px", objectFit: "cover", display: "block" }} 
            />
          </div>
        </div>

        <div className="container-custom" style={{ paddingBottom: "5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem", alignItems: "start" }}>
            
            {/* Main content */}
            <div>
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2.5rem", border: "1px solid #ede9df", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "1rem" }}>
                  Tentang Proyek
                </h2>
                <div style={{ fontSize: "1rem", color: "#4a4a4a", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {item.longDescription}
                </div>
              </div>

              {item.caseStudy && (
                <div style={{ backgroundColor: "#2D2D2D", borderRadius: "20px", padding: "2.5rem", color: "#F4F1EA", marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F4F1EA", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Check size={24} color="#8DA399" /> Studi Kasus
                  </h2>
                  <div style={{ fontSize: "1rem", color: "rgba(244,241,234,0.85)", lineHeight: 1.8, fontStyle: "italic", borderLeft: "3px solid #8DA399", paddingLeft: "1.5rem" }}>
                    &ldquo;{item.caseStudy}&rdquo;
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Screenshot ${idx + 1}`} 
                      style={{ width: "100%", borderRadius: "16px", border: "1px solid #ede9df" }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ position: "sticky", top: "100px" }}>
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", border: "1px solid #ede9df", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2D2D2D", marginBottom: "1.25rem", borderBottom: "1px solid #ede9df", paddingBottom: "0.75rem" }}>
                  Teknologi Digunakan
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {techStack.map(tech => (
                    <span key={tech} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#F4F1EA", color: "#2D2D2D", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, border: "1px solid #ede9df" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {item.demoUrl && (
                <a 
                  href={item.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary-green"
                  style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
                >
                  <ExternalLink size={18} /> Kunjungi Website
                </a>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </SessionProvider>
  );
}
