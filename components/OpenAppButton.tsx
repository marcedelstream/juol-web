"use client";

import { appScheme } from "@/lib/env";

function buildDeepLink(path = "") {
  const scheme = appScheme.trim() || "juol://";
  const root = scheme.includes("://")
    ? scheme.replace(/\/+$/, "")
    : `${scheme.replace(/:$/, "")}://`;
  return path ? `${root}/${path.replace(/^\/+/, "")}` : root;
}

export function OpenAppButton({ partidoId, className }: { partidoId?: string; className?: string }) {
  function openApp() {
    const target = partidoId ? buildDeepLink(`/partido/${partidoId}`) : buildDeepLink();
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
