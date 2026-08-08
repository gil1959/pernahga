import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "PernahGa — AI Asisten Managed untuk Solo Professional",
    template: "%s | PernahGa",
  },
  description:
    "Pega adalah AI asisten managed yang menangani DM customer, posting medsos, dan operasional harian. Hemat 20+ jam per minggu tanpa hire admin baru. Trial 3 hari gratis tanpa kartu kredit.",
  keywords: [
    "AI asisten",
    "AI customer service",
    "otomasi medsos",
    "social media automation",
    "AI managed assistant",
    "pernahga",
    "pega",
    "asisten virtual",
    "chatbot WhatsApp",
    "chatbot Instagram",
  ],
  authors: [{ name: "PernahGa" }],
  creator: "PernahGa",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "PernahGa",
    title: "PernahGa — AI Asisten Managed untuk Solo Professional",
    description:
      "Pega ngerjain DM customer, posting medsos, dan operasional harian. Anda fokus ke kerja yang bernilai tinggi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PernahGa — AI Asisten Managed untuk Solo Professional",
    description:
      "Pega ngerjain DM customer, posting medsos, dan operasional harian. Trial 3 hari gratis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PernahGa",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://pernahga.com",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://pernahga.com"}/favicon.ico`,
    "description": "Pega adalah AI asisten managed yang menangani DM customer, posting medsos, dan operasional harian."
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#2D2D2D",
                color: "#F4F1EA",
                borderRadius: "10px",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#8DA399",
                  secondary: "#F4F1EA",
                },
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
