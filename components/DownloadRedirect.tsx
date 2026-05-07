"use client";

import Image from "next/image";
import { useEffect } from "react";
import { appStoreUrl, playStoreUrl } from "@/lib/env";
import { StoreButtons } from "./StoreButtons";

export function DownloadRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const target = /iphone|ipad|ipod|macintosh/.test(ua) ? appStoreUrl : /android/.test(ua) ? playStoreUrl : "";
    if (target) window.setTimeout(() => { window.location.href = target; }, 700);
  }, []);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Image src="/juol-icon.png" alt="Juol" width={80} height={80} className="mb-5 rounded-3xl" />
      <h1 className="text-4xl font-black tracking-tight">Descargá Juol</h1>
      <p className="mt-3 max-w-md text-zinc-600">Te estamos llevando a la tienda correcta. Si no pasa nada, elegí tu plataforma.</p>
      <div className="mt-8"><StoreButtons /></div>
    </div>
  );
}
