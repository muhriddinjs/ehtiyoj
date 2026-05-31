import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "EXTIYOJ — Qibla, Masjid va Zarurat",
  description:
    "Qibla yo'nalishi, yaqin masjidlar, hojatxonalar va namoz vaqtlari. Musulmonlar uchun qulay mobil ilova.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EXTIYOJ",
  },
  keywords: ["qibla", "masjid", "namoz", "extiyoj", "hojatxona", "tasbex"],
  authors: [{ name: "EXTIYOJ Team" }],
  openGraph: {
    title: "EXTIYOJ",
    description: "Qibla, Masjid, Zarurat — musulmonlar uchun",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040D1F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <PWARegister />
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
