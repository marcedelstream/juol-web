"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const missingSupabaseEnv = !hasSupabaseEnv();

type LinkStatus = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(missingSupabaseEnv ? "invalid" : "checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(missingSupabaseEnv ? "Falta configurar Supabase en la web." : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      if (missingSupabaseEnv) return;

      const supabase = createSupabaseClient();
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hasCode = url.searchParams.has("code");
      const hasHashSession = hashParams.has("access_token") && hashParams.has("refresh_token");
      const explicitError =
        url.searchParams.get("error") ||
        url.searchParams.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");

      if (explicitError) {
        setLinkStatus("invalid");
        setMessage("El enlace expiró o no es válido. Pedí otro correo de recuperación desde la app.");
        return;
      }

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setLinkStatus("invalid");
            setMessage("El enlace expiró o ya fue usado. Pedí otro correo de recuperación desde la app.");
            return;
          }
        }
      }

      if (hasHashSession) {
        await supabase.auth.getSession();
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setLinkStatus("ready");
        setMessage("");
      } else {
        setLinkStatus("invalid");
        setMessage("Abrí esta página desde el correo de recuperación más reciente para cambiar tu contraseña.");
      }
    }

    prepareRecoverySession();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (linkStatus !== "ready") {
      setMessage("El enlace todavía no está listo. Abrí el último correo de recuperación que recibiste.");
      return;
    }
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage("No pudimos cambiar la contraseña. Pedí otro correo de recuperación e intentá de nuevo.");
      return;
    }

    setPassword("");
    setConfirm("");
    setMessage("Contraseña actualizada. Ya podés volver a Juol e iniciar sesión.");
  }

  const buttonDisabled = linkStatus !== "ready" || loading;

  return (
    <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="text-sm font-bold text-zinc-700">Nueva contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="new-password"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-700">Repetir contraseña</label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]"
        autoComplete="new-password"
      />

      <button
        disabled={buttonDisabled}
        className="mt-6 h-12 w-full rounded-full bg-[#ff6b00] font-black text-white hover:bg-[#d95600] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Guardando..." : linkStatus === "checking" ? "Verificando enlace..." : "Cambiar contraseña"}
      </button>

      {linkStatus === "checking" && (
        <p className="mt-4 text-sm text-zinc-500">Estamos validando tu enlace de recuperación.</p>
      )}
      {linkStatus === "invalid" && (
        <p className="mt-4 text-sm text-zinc-500">
          Si el botón no se habilita, solicitá un nuevo correo desde Juol y abrí el enlace más reciente.
        </p>
      )}
      {message && <p className="mt-4 text-sm font-semibold text-zinc-700">{message}</p>}
    </form>
  );
}
