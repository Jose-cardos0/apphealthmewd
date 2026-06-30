import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import IconSprite from "@/components/IconSprite";
import PwaRegister from "@/components/PwaRegister";
import { I18nProvider, type Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "HealthMe GLP-1",
  description: "Deine smarte Begleitung auf dem Weg zum Wunschgewicht.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/pwa/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "HealthMe",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f4f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang: Lang = cookies().get("lang")?.value === "en" ? "en" : "de";
  return (
    <html lang={lang} translate="no">
      <head>
        {/* Browser-Übersetzung deaktivieren – sie kollidiert mit Reacts DOM
            (NotFoundError: removeChild). Die App ist mehrsprachig (DE/EN). */}
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <IconSprite />
        <PwaRegister />
        <I18nProvider initial={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
