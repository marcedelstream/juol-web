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
    let appOpened = false;

    const markOpened = () => {
      appOpened = true;
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", markOpened);
      window.removeEventListener("blur", markOpened);
    };

    const onVisibilityChange = () => {
      if (document.hidden) markOpened();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", markOpened, { once: true });
    window.addEventListener("blur", markOpened, { once: true });

    window.location.href = target;
    window.setTimeout(() => {
      cleanup();
      if (!appOpened && !document.hidden) window.location.href = "/descargar";
    }, 1600);
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
