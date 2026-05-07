import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juol | Partidos de fútbol cerca tuyo",
  description: "Organizá y encontrá partidos de fútbol cerca tuyo con Juol.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://juol.lat"),
  openGraph: {
    title: "Juol",
    description: "Organizá y encontrá partidos de fútbol cerca tuyo.",
    images: ["/juol-icon.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PY">
      <body>{children}</body>
    </html>
  );
}

