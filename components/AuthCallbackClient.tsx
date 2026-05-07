"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export function AuthCallbackClient() {
  const [status, setStatus] = useState("Confirmando tu cuenta...");

  useEffect(() => {
    async function run() {
      if (!hasSupabaseEnv()) { setStatus("Falta configurar Supabase en la web."); return; }
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      setStatus(error ? "El enlace expiró o no es válido." : "Cuenta confirmada. Ya podés abrir Juol.");
    }
    run();
  }, []);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Image src="/juol-icon.png" alt="Juol" width={80} height={80} className="mb-5 rounded-3xl" />
      <h1 className="text-4xl font-black tracking-tight">{status}</h1>
      <Link href="/descargar" className="mt-8 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-black text-white">Abrir Juol</Link>
    </div>
  );
}
