"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type Status = "loading" | "validating" | "ok" | "processed" | "error";
type EmailOtpType = "signup" | "invite" | "magiclink" | "email_change" | "email";

function getHashParams(url: URL) {
  return new URLSearchParams(url.hash.replace(/^#/, ""));
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

function buildResetUrl(url: URL) {
  const params = new URLSearchParams(url.search);
  params.delete("juol_action");
  const qs = params.toString() ? `?${params.toString()}` : "";
  return `/reset-password${qs}${url.hash}`;
}

export function AuthCallbackClient() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Estamos verificando tu enlace, un momento.");
  const processedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    async function validateInWeb() {
      if (processedRef.current) return;
      processedRef.current = true;

      if (!hasSupabaseEnv()) {
        setStatus("error");
        setMessage("Falta configurar Supabase en la web.");
        return;
      }

      setStatus("validating");

      const url = new URL(window.location.href);
      const hashParams = getHashParams(url);
      const explicitError =
        url.searchParams.get("error") ||
        url.searchParams.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");

      if (explicitError) {
        setStatus("processed");
        setMessage("Este enlace ya fue procesado o ya no se puede reutilizar. Abri Juol e intenta iniciar sesion; si no entra, pedi un nuevo enlace.");
        return;
      }

      if (isRecoveryCallback(url, hashParams)) {
        router.replace(buildResetUrl(url));
        return;
      }

      const tokenHash = url.searchParams.get("token_hash") || hashParams.get("token_hash");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = url.searchParams.get("code");
      const otpType = getEmailOtpType(url, hashParams);
      const supabase = createSupabaseClient({ detectSessionInUrl: false });
      const hasPayload = Boolean(tokenHash || accessToken || refreshToken || code);

      if (!hasPayload) {
        setStatus("error");
        setMessage("No encontramos un token de verificacion en este enlace. Pedi uno nuevo desde Juol.");
        return;
      }

      let isConfirmed = false;

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });
        isConfirmed = !error;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        isConfirmed = !error;
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        isConfirmed = !error;
      }

      const { data } = await supabase.auth.getSession();
      if (isConfirmed || data.session) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus("ok");
        setMessage("Tu correo ya fue verificado. Ahora podes abrir Juol e iniciar sesion.");
        return;
      }

      setStatus("processed");
      setMessage("Este enlace ya fue procesado o tu cuenta ya estaba verificada. Abri Juol e intenta iniciar sesion; si no entra, pedi un nuevo enlace.");
    }

    validateInWeb();
  }, [router]);

  const title = {
    loading: "Confirmando tu cuenta...",
    validating: "Validando tu correo...",
    ok: "Cuenta confirmada.",
    processed: "Enlace ya procesado.",
    error: "No pudimos validar el enlace.",
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-16 text-center">
      <Image src="/juol-icon.png" alt="Juol" width={64} height={64} className="mb-6 rounded-2xl" />
      <p className="text-[10px] font-black tracking-widest text-[#FD7401]">VERIFICACION</p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">{title[status]}</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{message}</p>

      {status === "ok" || status === "processed" ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="juol://"
            className="inline-flex rounded-full bg-[#FD7401] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
          >
            Abrir Juol
          </a>
          <Link href="/descargar" className="text-sm font-bold text-zinc-500 hover:text-zinc-800">
            Descargar Juol
          </Link>
        </div>
      ) : status === "error" ? (
        <Link
          href="/descargar"
          className="mt-8 inline-flex rounded-full bg-[#FD7401] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
        >
          Abrir Juol
        </Link>
      ) : null}
    </div>
  );
}
