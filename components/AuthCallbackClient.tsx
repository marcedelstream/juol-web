"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

function isRecoveryCallback(url: URL, hashParams: URLSearchParams) {
  return (
    url.searchParams.get("juol_action") === "recovery" ||
    url.searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery"
  );
}

function buildAppUrl(url: URL, isRecovery: boolean): string {
  // Strip internal marker so the app doesn't get a param it doesn't know
  const params = new URLSearchParams(url.search);
  params.delete("juol_action");
  const search = params.toString() ? `?${params.toString()}` : "";
  const scheme = isRecovery ? "juol://reset-password" : "juol://auth-callback";
  return `${scheme}${search}${url.hash}`;
}

export function AuthCallbackClient() {
  const [status, setStatus] = useState<Status>("loading");
  const router = useRouter();

  const { appUrl, isRecovery } = useMemo(() => {
    if (typeof window === "undefined") {
      return { appUrl: "juol://auth-callback", isRecovery: false };
    }
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const recovery = isRecoveryCallback(url, hashParams);
    return { appUrl: buildAppUrl(url, recovery), isRecovery: recovery };
  }, []);

  async function validateInWeb() {
    if (!hasSupabaseEnv()) {
      setStatus("error");
      return;
    }

    setStatus("validating");
    const supabase = createSupabaseClient({ detectSessionInUrl: false });
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (!error) {
      if (isRecovery) {
        // Code exchanged on web — go to reset form keeping existing session
        router.replace("/reset-password");
        return;
      }
      setStatus("ok");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setStatus("ok");
      return;
    }

    if (isRecovery) {
      // PKCE code was generated on mobile — web can't exchange it.
      // Redirect to /reset-password so the user can request a new link from web.
      router.replace("/reset-password?web_fallback=1");
      return;
    }

    setStatus("error");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUrl]);

  const title = {
    loading: "Confirmando tu cuenta...",
    "open-app": isRecovery ? "Abrí Juol para continuar." : "Abrí Juol para terminar.",
    validating: "Validando tu correo...",
    ok: "Cuenta confirmada.",
    error: "El enlace expiró o no es válido.",
  };

  const subtitle = {
    loading: "Estamos verificando tu enlace, un momento.",
    "open-app": isRecovery
      ? "Tocá el botón para abrir Juol y restablecer tu contraseña. Si no tenés la app, podés hacerlo desde la web."
      : "La app puede iniciar sesión automáticamente con este enlace. Si no se abre, tocá el botón.",
    validating: "Estamos confirmando tu cuenta desde la web.",
    ok: "Ya podés abrir Juol e iniciar sesión con tu cuenta.",
    error: isRecovery
      ? "Pedí un nuevo enlace desde la app o restablecé tu contraseña desde la web."
      : "Pedí un nuevo enlace de verificación desde la app.",
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={64} height={64} className="mb-6 rounded-2xl" />
      <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">
        {isRecovery ? "RECUPERACIÓN DE CONTRASEÑA" : "VERIFICACIÓN"}
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">{title[status]}</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{subtitle[status]}</p>

      {status === "open-app" ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          {/* Primary: open the app via deep link */}
          <a
            href={appUrl}
            className="inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Abrir Juol
          </a>

          {isRecovery ? (
            /* Recovery web fallback: go to reset-password page */
            <Link
              href="/reset-password?web_fallback=1"
              className="text-sm font-bold text-zinc-500 hover:text-zinc-800"
            >
              Restablecer contraseña en la web
            </Link>
          ) : (
            <button
              type="button"
              onClick={validateInWeb}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-800"
            >
              Validar en esta web
            </button>
          )}
        </div>
      ) : status === "error" && isRecovery ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/reset-password?web_fallback=1"
            className="inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Restablecer contraseña
          </Link>
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
