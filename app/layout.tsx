import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juol | Partidos de fútbol cerca tuyo",
  description: "Organizá y encontrá partidos de fútbol cerca tuyo con Juol.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://juol.lat"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/juol-icon.png", type: "image/png" },
    ],
    apple: "/juol-icon.png",
    shortcut: "/juol-icon.png",
  },
  openGraph: {
    title: "Juol — Se acabó el no completamos.",
    description: "Organizá y encontrá partidos de fútbol cerca tuyo. Paraguay.",
    siteName: "Juol",
    locale: "es_PY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Juol — Se acabó el no completamos.",
    description: "Organizá y encontrá partidos de fútbol cerca tuyo. Paraguay.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PY" className={lexend.variable}>
      <body>{children}</body>
    </html>
  );
}
