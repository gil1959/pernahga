import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/ui/Logo";
import { Instagram, Youtube, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  const currentYear = new Date().getFullYear();

  // Fetch settings from database
  const settings = await prisma.siteSettings.findMany({
    where: {
      key: { in: ["instagramUrl", "tiktokUrl", "youtubeUrl", "whatsappNumber", "email", "phone", "address"] }
    }
  });

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const igUrl = settingsMap.instagramUrl || "#";
  const ttUrl = settingsMap.tiktokUrl || "#";
  const ytUrl = settingsMap.youtubeUrl || "#";

  // Tiktok SVG icon
  const TiktokIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );

  return (
    <footer
      style={{
        backgroundColor: "#2D2D2D",
        color: "#F4F1EA",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(244,241,234,0.1)",
          }}
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "1rem" }}>
              <Logo size={36} />
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#F4F1EA", letterSpacing: "-0.02em" }}>
                Pernahga
              </span>
            </Link>
            <p style={{ fontSize: "0.9rem", color: "rgba(244,241,234,0.6)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {t("tagline")}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { icon: <Instagram size={18} />, href: igUrl, label: "Instagram" },
                { icon: <TiktokIcon size={18} />, href: ttUrl, label: "TikTok" },
                { icon: <Youtube size={18} />, href: ytUrl, label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="social-icon-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(141,163,153,0.15)",
                    color: "#8DA399",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              {t("links_product")}
            </h3>
            <ul style={{ listStyle: "none" }}>
              {[
                { href: "/services", label: tNav("services") },
                { href: "/showcase", label: tNav("showcase") },
                { href: "/education", label: tNav("education") },
                { href: "/contact", label: tNav("consultation") },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "0.6rem" }}>
                  <Link
                    href={link.href}
                    className="footer-link"
                    style={{
                      color: "rgba(244,241,234,0.6)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              {t("links_legal")}
            </h3>
            <ul style={{ listStyle: "none" }}>
              {[
                { href: "/terms", label: t("terms") },
                { href: "/privacy", label: t("privacy") },
                { href: "/refund", label: t("refund") },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "0.6rem" }}>
                  <Link
                    href={link.href}
                    className="footer-link"
                    style={{
                      color: "rgba(244,241,234,0.6)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8DA399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Kontak
            </h3>
            <ul style={{ listStyle: "none" }}>
              {[
                { icon: <Mail size={16} />, text: settingsMap.email || "hello@pernahga.com", href: `mailto:${settingsMap.email || "hello@pernahga.com"}` },
                { icon: <Phone size={16} />, text: settingsMap.phone || "+62 xxx xxxx xxxx", href: `tel:${settingsMap.phone || "+62xxxxxxxxxx"}` },
                { icon: <MessageCircle size={16} />, text: "WhatsApp", href: `https://wa.me/${settingsMap.whatsappNumber || "628xxxxxxxxxx"}` },
                { icon: <MapPin size={16} />, text: settingsMap.address || "Jakarta, Indonesia", href: "#" },
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: "0.7rem" }}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="footer-link-flex"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "rgba(244,241,234,0.6)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      transition: "color 0.2s",
                    }}
                  >
                    <span style={{ color: "#8DA399", flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.4)" }}>
            © {currentYear} Pernahga. Hak cipta dilindungi.
          </p>
          <p style={{ fontSize: "0.85rem", color: "rgba(244,241,234,0.4)" }}>
            Dibuat dengan{" "}
            <span style={{ color: "#8DA399" }}>♥</span>
            {" "}untuk bisnis Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
