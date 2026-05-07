"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export function AuthCallbackClient() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    async function run() {
      if (!hasSupabaseEnv()) {
        setStatus("error");
        return;
      }
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      setStatus(error ? "error" : "ok");
    }
    run();
  }, []);

  const messages = {
    loading: "Confirmando tu cuenta...",
    ok: "Cuenta confirmada.",
    error: "El enlace expiró o no es válido.",
  };

  const subtitles = {
    loading: "Estamos verificando tu enlace, un momento.",
    ok: "Ya podés abrir Juol e iniciar sesión con tu cuenta.",
    error: "Pedí un nuevo enlace de verificación desde la app.",
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={64} height={64} className="mb-6 rounded-2xl" />
      <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">VERIFICACIÓN</p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">{messages[status]}</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{subtitles[status]}</p>
      <Link
        href="/descargar"
        className="mt-8 inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
      >
        Abrir Juol
      </Link>
    </div>
  );
}
