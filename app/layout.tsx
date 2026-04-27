import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Pernahga — Konsultasi Teknologi & Solusi Software untuk Bisnis",
    template: "%s | Pernahga",
  },
  description:
    "Pernahga menyediakan konsultasi teknologi gratis dan solusi software custom untuk bisnis Anda. Dari analisis kebutuhan hingga implementasi, kami hadir sebagai mitra teknologi terpercaya.",
  keywords: [
    "konsultasi teknologi",
    "software bisnis",
    "solusi digital",
    "pengembangan software",
    "konsultasi IT",
    "pernahga",
  ],
  authors: [{ name: "Pernahga" }],
  creator: "Pernahga",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Pernahga",
    title: "Pernahga — Konsultasi Teknologi & Solusi Software untuk Bisnis",
    description:
      "Konsultasi teknologi gratis dan solusi software custom untuk bisnis Anda.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pernahga — Konsultasi Teknologi & Solusi Software",
    description:
      "Konsultasi teknologi gratis dan solusi software custom untuk bisnis Anda.",
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
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
