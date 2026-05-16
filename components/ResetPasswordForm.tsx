"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { siteUrl } from "@/lib/env";

const missingSupabaseEnv = !hasSupabaseEnv();

type LinkStatus = "checking" | "ready" | "invalid" | "success";

function clearRecoveryParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Web fallback: request a new recovery email from the browser.
// This time the web Supabase client stores the code_verifier in localStorage,
// so when the user opens the new link in this browser, PKCE exchange succeeds.
function ResendForm({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setErr("Ingresá tu email."); return; }
    setSending(true);
    setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });
    setSending(false);
    if (error) { setErr("No pudimos enviar el correo. Verificá el email e intentá de nuevo."); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-4 text-sm font-semibold text-zinc-700">
        Te enviamos un nuevo enlace. Abrilo desde este navegador para cambiar tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={handleResend} className="mt-6">
      <p className="mb-3 text-sm text-zinc-500">
        Ingresá tu email para recibir un nuevo enlace de recuperación.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="email"
      />
      {err && <p className="mt-2 text-sm font-semibold text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={sending}
        className="mt-4 h-12 w-full rounded-full bg-[#ff6b00] font-black text-white hover:bg-[#d95600] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "Enviando..." : "Enviar nuevo enlace"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const processedRef = useRef(false);
  const supabase = useMemo<SupabaseClient | null>(
    () => (missingSupabaseEnv ? null : createSupabaseClient({ detectSessionInUrl: false })),
    []
  );
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(missingSupabaseEnv ? "invalid" : "checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(missingSupabaseEnv ? "Falta configurar Supabase en la web." : "");
  const [loading, setLoading] = useState(false);
  const [isWebFallback, setIsWebFallback] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      if (!supabase) return;
      if (processedRef.current) return;
      processedRef.current = true;

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

      const explicitError =
        url.searchParams.get("error") ||
        url.searchParams.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");

      if (explicitError) {
        setIsWebFallback(true);
        setLinkStatus("invalid");
        setMessage("El enlace expiró o no es válido.");
        return;
      }

      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash") || hashParams.get("token_hash");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let sessionReady = false;

      if (code) {
        // Pass the full URL so Supabase can extract all needed params
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        sessionReady = !error;
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        sessionReady = !error;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        sessionReady = !error;
      }

      const { data } = await supabase.auth.getSession();
      if (sessionReady || data.session) {
        clearRecoveryParams();
        setLinkStatus("ready");
        setMessage("");
        return;
      }

      setIsWebFallback(true);
      setLinkStatus("invalid");
      setMessage("El enlace no es válido o ya fue usado.");
    }

    prepareRecoverySession();
  }, [supabase]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!supabase || linkStatus !== "ready") {
      setMessage("El enlace todavia no esta listo. Abri el ultimo correo de recuperacion que recibiste.");
      return;
    }
    if (password.length < 6) {
      setMessage("La contrasena debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMessage("Las contrasenas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage("No pudimos cambiar la contrasena. Pedi otro correo de recuperacion e intenta de nuevo.");
      return;
    }

    setPassword("");
    setConfirm("");
    setLinkStatus("success");
    setMessage("Contrasena actualizada. Ya podes volver a Juol e iniciar sesion.");
  }

  const buttonDisabled = linkStatus !== "ready" || loading;

  return (
    <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="text-sm font-bold text-zinc-700">Nueva contrasena</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="new-password"
        disabled={linkStatus !== "ready"}
      />

      <label className="mt-5 block text-sm font-bold text-zinc-700">Repetir contrasena</label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="new-password"
        disabled={linkStatus !== "ready"}
      />

      <button
        disabled={buttonDisabled}
        className="mt-6 h-12 w-full rounded-full bg-[#ff6b00] font-black text-white hover:bg-[#d95600] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Guardando..." : linkStatus === "checking" ? "Verificando enlace..." : "Cambiar contrasena"}
      </button>

      {linkStatus === "checking" && (
        <p className="mt-4 text-sm text-zinc-500">Estamos validando tu enlace de recuperacion.</p>
      )}
      {message && <p className="mt-4 text-sm font-semibold text-zinc-700">{message}</p>}

      {/* Web fallback: offer to resend a new recovery email from the browser */}
      {linkStatus === "invalid" && isWebFallback && supabase && (
        <ResendForm supabase={supabase} />
      )}
    </form>
  );
}
