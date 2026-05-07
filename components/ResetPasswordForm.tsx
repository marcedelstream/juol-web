"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const missingSupabaseEnv = !hasSupabaseEnv();

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(missingSupabaseEnv ? "Falta configurar Supabase en la web." : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (missingSupabaseEnv) return;
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) { setMessage("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirm) { setMessage("Las contraseñas no coinciden."); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    setMessage(error ? "El enlace expiró o no es válido. Pedí otro correo de recuperación." : "Contraseña actualizada. Ya podés volver a Juol e iniciar sesión.");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="text-sm font-bold text-zinc-700">Nueva contraseña</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]" />
      <label className="mt-5 block text-sm font-bold text-zinc-700">Repetir contraseña</label>
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-[#ff6b00]" />
      <button disabled={!ready || loading} className="mt-6 h-12 w-full rounded-full bg-[#ff6b00] font-black text-white hover:bg-[#d95600] disabled:opacity-50">{loading ? "Guardando..." : "Cambiar contraseña"}</button>
      {!ready && <p className="mt-4 text-sm text-zinc-500">Abrí esta página desde el correo de recuperación para habilitar el cambio.</p>}
      {message && <p className="mt-4 text-sm font-semibold text-zinc-700">{message}</p>}
    </form>
  );
}
