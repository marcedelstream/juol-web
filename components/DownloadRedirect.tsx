"use client";

import Image from "next/image";
import { useEffect } from "react";
import { appStoreUrl, playStoreUrl } from "@/lib/env";
import { StoreButtons } from "./StoreButtons";

export function DownloadRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const target = /iphone|ipad|ipod|macintosh/.test(ua)
      ? appStoreUrl
      : /android/.test(ua)
        ? playStoreUrl
        : "";
    if (target) window.setTimeout(() => { window.location.href = target; }, 700);
  }, []);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={72} height={72} className="mb-6 rounded-[22px]" />
      <p className="text-[10px] font-black tracking-widest text-[#FD7401]">DISPONIBLE EN</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Descargá Juol</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">
        Te estamos llevando a la tienda correcta. Si no pasa nada, elegí tu plataforma.
      </p>
      <div className="mt-8">
        <StoreButtons />
      </div>
    </div>
  );
}
