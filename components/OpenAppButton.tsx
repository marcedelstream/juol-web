"use client";

import { appScheme } from "@/lib/env";

export function OpenAppButton({ partidoId, className }: { partidoId?: string; className?: string }) {
  function openApp() {
    const base = appScheme.endsWith("://") ? appScheme.slice(0, -2) : appScheme.replace(/\/$/, "");
    const target = partidoId ? `${base}/partido/${partidoId}` : appScheme;
    window.location.href = target;
    window.setTimeout(() => { window.location.href = "/descargar"; }, 1100);
  }

  return (
    <button
      onClick={openApp}
      className={
        className ??
        "rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#d95600]"
      }
    >
      Abrir en Juol
    </button>
  );
}
