import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Juol | Partidos de fútbol cerca tuyo",
  description: "Organizá y encontrá partidos de fútbol cerca tuyo con Juol.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://juol.lat"),
  icons: { icon: "/favicon.svg", apple: "/juol-icon.png" },
  openGraph: {
    title: "Juol",
    description: "Organizá y encontrá partidos de fútbol cerca tuyo.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Juol" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PY">
      <body>{children}</body>
    </html>
  );
}


