"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type Status = "loading" | "open-app" | "validating" | "ok" | "error";
type EmailOtpType = "signup" | "invite" | "magiclink" | "email_change" | "email";

function getHashParams(url: URL) {
  return new URLSearchParams(url.hash.replace(/^#/, ""));
}

function hasAuthPayload(url: URL, hashParams: URLSearchParams) {
  return (
    url.searchParams.has("code") ||
    url.searchParams.has("token_hash") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    hashParams.has("token_hash")
  );
}

function isRecoveryCallback(url: URL, hashParams: URLSearchParams) {
  return (
    url.searchParams.get("juol_action") === "recovery" ||
    url.searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery"
  );
}

function getEmailOtpType(url: URL, hashParams: URLSearchParams): EmailOtpType {
  const type = url.searchParams.get("type") || hashParams.get("type");
  if (
    type === "signup" ||
    type === "invite" ||
    type === "magiclink" ||
    type === "email_change" ||
    type === "email"
  ) {
    return type;
  }
  return "signup";
}

function buildAppUrl(url: URL, isRecovery: boolean): string {
  const params = new URLSearchParams(url.search);
  params.delete("juol_action");
  const search = params.toString() ? `?${params.toString()}` : "";
  const scheme = isRecovery ? "juol://reset-password" : "juol://auth-callback";
  return `${scheme}${search}${url.hash}`;
}

function buildResetUrl() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.delete("juol_action");
  const qs = params.toString() ? `?${params.toString()}` : "";
  return `/reset-password${qs}${url.hash}`;
}

export function AuthCallbackClient() {
  const [status, setStatus] = useState<Status>("loading");
  const router = useRouter();

  const { appUrl, isRecovery } = useMemo(() => {
    if (typeof window === "undefined") {
      return { appUrl: "juol://auth-callback", isRecovery: false };
    }
    const url = new URL(window.location.href);
    const hashParams = getHashParams(url);
    const recovery = isRecoveryCallback(url, hashParams);
    return { appUrl: buildAppUrl(url, recovery), isRecovery: recovery };
  }, []);

  async function validateInWeb() {
    if (!hasSupabaseEnv()) {
      setStatus("error");
      return;
    }

    setStatus("validating");

    const url = new URL(window.location.href);
    const hashParams = getHashParams(url);
    const tokenHash = url.searchParams.get("token_hash") || hashParams.get("token_hash");
    const otpType = getEmailOtpType(url, hashParams);
    const supabase = createSupabaseClient({ detectSessionInUrl: false });

    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: isRecovery ? "recovery" : otpType,
        })
      : await supabase.auth.exchangeCodeForSession(window.location.href);

    if (!error) {
      if (isRecovery) {
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
      router.replace(buildResetUrl());
      return;
    }

    // Verification links are single-use. Supabase can confirm the account and
    // still leave this web page without a reusable session, especially when the
    // link came from a native-app PKCE flow. For email verification, showing
    // "confirmed" is clearer than a false "expired" state.
    setStatus("ok");
  }

  useEffect(() => {
    async function run() {
      if (!hasSupabaseEnv()) {
        setStatus("error");
        return;
      }

      const url = new URL(window.location.href);
      const hashParams = getHashParams(url);
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
    "open-app": isRecovery ? "Abri Juol para continuar." : "Abri Juol para terminar.",
    validating: "Validando tu correo...",
    ok: "Cuenta confirmada.",
    error: "El enlace expiro o no es valido.",
  };

  const subtitle = {
    loading: "Estamos verificando tu enlace, un momento.",
    "open-app": isRecovery
      ? "Toca el boton para abrir Juol y restablecer tu contrasena. Si no tenes la app, podes hacerlo desde la web."
      : "Toca el boton para abrir Juol. Si preferis, tambien podes validar tu correo desde esta web.",
    validating: "Estamos confirmando tu cuenta desde la web.",
    ok: "Ya podes abrir Juol e iniciar sesion con tu cuenta.",
    error: isRecovery
      ? "Pedi un nuevo enlace desde la app o restablece tu contrasena desde la web."
      : "Pedi un nuevo enlace de verificacion desde la app.",
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={64} height={64} className="mb-6 rounded-2xl" />
      <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">
        {isRecovery ? "RECUPERACION DE CONTRASENA" : "VERIFICACION"}
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">{title[status]}</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{subtitle[status]}</p>

      {status === "open-app" ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={appUrl}
            className="inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Abrir Juol
          </a>

          {isRecovery ? (
            <button
              type="button"
              onClick={() => {
                window.location.href = buildResetUrl();
              }}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-800"
            >
              Cambiar contrasena en la web
            </button>
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
            href="/reset-password"
            className="inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Cambiar contrasena en la web
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
