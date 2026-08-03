"use client";

import { FormEvent, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export function ProWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!hasSupabaseEnv()) { setStatus("error"); return; }
    setStatus("loading");
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("pro_waitlist_web").upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });
    setStatus(error ? "error" : "ok");
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="min-h-12 flex-1 rounded-full border border-zinc-200 bg-white px-5 text-sm outline-none focus:border-[#FD7401]" />
      <button disabled={status === "loading"} className="min-h-12 rounded-full bg-[#FD7401] px-6 text-sm font-black text-white hover:bg-[#d95600] disabled:opacity-60">Quiero ser Pro</button>
      {status === "ok" && <p className="text-sm font-semibold text-emerald-700 sm:self-center">Listo, te avisamos primero.</p>}
      {status === "error" && <p className="text-sm font-semibold text-red-600 sm:self-center">No pudimos guardar tu email.</p>}
    </form>
  );
}
