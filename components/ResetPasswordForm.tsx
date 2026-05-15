"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const missingSupabaseEnv = !hasSupabaseEnv();

type LinkStatus = "checking" | "ready" | "invalid" | "success";

function clearRecoveryParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
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
        setLinkStatus("invalid");
        setMessage("El enlace expiro o no es valido. Pedi otro correo de recuperacion desde la app.");
        return;
      }

      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash") || hashParams.get("token_hash");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let sessionReady = false;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
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

      setLinkStatus("invalid");
      setMessage("Abriste un enlace vencido o ya usado. Pedi un nuevo correo de recuperacion desde Juol.");
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
        disabled={linkStatus === "success"}
      />

      <label className="mt-5 block text-sm font-bold text-zinc-700">Repetir contrasena</label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="new-password"
        disabled={linkStatus === "success"}
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
      {linkStatus === "invalid" && (
        <p className="mt-4 text-sm text-zinc-500">
          Si el boton no se habilita, solicita un nuevo correo desde Juol y abri el enlace mas reciente.
        </p>
      )}
      {message && <p className="mt-4 text-sm font-semibold text-zinc-700">{message}</p>}
    </form>
  );
}
