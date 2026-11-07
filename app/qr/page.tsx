import type { Metadata } from "next";
import { PanelQR } from "@/components/PanelQR";

export const metadata: Metadata = {
  title: "QR de entrada | Panel JUOL",
  robots: { index: false, follow: false },
};

export default function QrPage() {
  return <PanelQR />;
}
