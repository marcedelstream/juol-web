"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type Status = "loading" | "open-app" | "validating" | "ok" | "error";

function hasAuthPayload(url: URL, hashParams: URLSearchParams) {
  return (
    url.searchParams.has("code") ||
    url.searchParams.has("token_hash") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token")
  );
}

export function AuthCallbackClient() {
  const [status, setStatus] = useState<Status>("loading");

  const appUrl = useMemo(() => {
    if (typeof window === "undefined") return "juol://auth-callback";
    const url = new URL(window.location.href);
    return `juol://auth-callback${url.search}${url.hash}`;
  }, []);

  async function validateInWeb() {
    if (!hasSupabaseEnv()) {
      setStatus("error");
      return;
    }

    setStatus("validating");
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (!error) {
      setStatus("ok");
      return;
    }

    const { data } = await supabase.auth.getSession();
    setStatus(data.session ? "ok" : "error");
  }

  useEffect(() => {
    async function run() {
      if (!hasSupabaseEnv()) {
        setStatus("error");
        return;
      }

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const explicitError =
        url.searchParams.get("error") ||
        url.searchParams.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");

      if (explicitError) {
        setStatus("error");
        return;
      }

      if (!hasAuthPayload(url, hashParams)) {
        validateInWeb();
        return;
      }

      setStatus("open-app");
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isMobile) {
        window.setTimeout(() => {
          window.location.href = appUrl;
        }, 500);
      }
    }

    run();
  }, [appUrl]);

  const messages = {
    loading: "Confirmando tu cuenta...",
    "open-app": "Abrí Juol para terminar.",
    validating: "Validando tu correo...",
    ok: "Cuenta confirmada.",
    error: "El enlace expiró o no es válido.",
  };

  const subtitles = {
    loading: "Estamos verificando tu enlace, un momento.",
    "open-app": "La app puede iniciar sesión automáticamente con este enlace. Si no se abre, tocá el botón.",
    validating: "Estamos confirmando tu cuenta desde la web.",
    ok: "Ya podés abrir Juol e iniciar sesión con tu cuenta.",
    error: "Pedí un nuevo enlace de verificación desde la app.",
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={64} height={64} className="mb-6 rounded-2xl" />
      <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">VERIFICACIÓN</p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">{messages[status]}</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{subtitles[status]}</p>

      {status === "open-app" ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={appUrl}
            className="inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Abrir Juol
          </a>
          <button
            type="button"
            onClick={validateInWeb}
            className="text-sm font-bold text-zinc-500 hover:text-zinc-800"
          >
            Validar en esta web
          </button>
        </div>
      ) : (
        <Link
          href="/descargar"
          className="mt-8 inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
        >
          Abrir Juol
        </Link>
      )}
    </div>
  );
}
