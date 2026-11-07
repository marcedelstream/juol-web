"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type Partido = { id: string; direccion_texto: string | null; hora_partido: string; marca: string | null; estado: string; precio_cancha: number | null };
type Qr = { partido: Partido; codigo: string; vence_en: number; svg: string; entradas: number; confirmados: number; cobrado: number };

async function pedir(ruta: string, token: string) {
  const res = await fetch(ruta, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "No se pudo cargar.");
  return json;
}

const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Paraguay es UTC-4 fijo.
function cuando(iso: string) {
  const py = new Date(new Date(iso).getTime() - 4 * 60 * 60 * 1000);
  const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const hora = `${String(py.getUTCHours()).padStart(2, "0")}:${String(py.getUTCMinutes()).padStart(2, "0")}`;
  const mismoDia = py.toISOString().slice(0, 10) === hoy.toISOString().slice(0, 10);
  return `${mismoDia ? "Hoy" : `${dias[py.getUTCDay()]} ${py.getUTCDate()}/${py.getUTCMonth() + 1}`} · ${hora}`;
}

// Panel del encargado: elige un partido de marca y muestra el QR de entrada,
// que se renueva solo cada 30 segundos.
export function PanelQR() {
  const supabase = useMemo(() => (hasSupabaseEnv() ? createSupabaseClient() : null), []);
  const [token, setToken] = useState<string | null | undefined>(hasSupabaseEnv() ? undefined : null);
  const [partidos, setPartidos] = useState<Partido[] | null>(null);
  const [elegido, setElegido] = useState<string | null>(null);
  const [qr, setQr] = useState<Qr | null>(null);
  const [segundos, setSegundos] = useState(30);
  const [error, setError] = useState("");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setToken(s?.access_token ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!token || elegido) return;
    pedir("/api/admin/marca", token).then((j) => setPartidos(j.partidos)).catch((e) => setError(e.message));
  }, [token, elegido]);

  // Trae el QR y vuelve a pedirlo justo cuando vence.
  useEffect(() => {
    if (!token || !elegido) return;
    let activo = true;
    async function cargar() {
      try {
        const j: Qr = await pedir(`/api/admin/marca?partido=${elegido}`, token!);
        if (!activo) return;
        setQr(j);
        setError("");
        setSegundos(j.vence_en);
        temporizador.current = setTimeout(cargar, j.vence_en * 1000 + 300);
      } catch (e) {
        if (!activo) return;
        setError((e as Error).message);
        temporizador.current = setTimeout(cargar, 5000);
      }
    }
    cargar();
    return () => { activo = false; if (temporizador.current) clearTimeout(temporizador.current); };
  }, [token, elegido]);

  useEffect(() => {
    if (!qr) return;
    const t = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [qr]);

  const marco = "mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white px-5 pb-8 pt-8 text-[#111827]";

  if (token === undefined) return <main className={marco} />;

  if (!token) {
    return (
      <main className={marco}>
        <span className="text-[13px] font-medium text-[#6B7280]">Panel JUOL</span>
        <h1 className="mb-3 mt-1 text-[32px] font-black leading-[34px]">Partidos de marca</h1>
        <p className="text-[15px] leading-[22px] text-[#6B7280]">Ingresá primero al panel con tu cuenta de admin y volvé a esta página.</p>
        <Link href="/" className="mt-auto flex h-[54px] items-center justify-center rounded-full bg-[#232323] text-[15px] font-semibold text-white">Ir al panel</Link>
      </main>
    );
  }

  if (elegido) {
    return (
      <main className={marco}>
        <button onClick={() => { setElegido(null); setQr(null); }} aria-label="Volver" className="-ml-2.5 flex h-11 w-11 items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="mt-2 text-[28px] font-black leading-[30px]">{qr?.partido.direccion_texto || "Partido de marca"}</h1>
        <p className="mt-1.5 text-[15px] leading-[22px] text-[#6B7280]">
          Mostralo después de cobrar los Gs {miles(qr?.partido.precio_cancha ?? 20000)}.
        </p>

        <div className="mt-4 flex aspect-square items-center justify-center rounded-[28px] border border-[#E5E7EB] p-5">
          {qr ? (
            <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" aria-label="QR de entrada" dangerouslySetInnerHTML={{ __html: qr.svg }} />
          ) : (
            <span className="text-sm text-[#6B7280]">Generando QR…</span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[13px] text-[#6B7280]">Cambia en {segundos} s</span>
          <span className="text-base font-semibold tracking-[2px]">{qr?.codigo ?? "······"}</span>
        </div>
        {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
          <span className="flex flex-col gap-px rounded-2xl bg-[#F9FAFB] px-3.5 py-3">
            <span className="text-[22px] font-semibold leading-[26px]">{qr ? `${qr.entradas} de ${qr.confirmados}` : "–"}</span>
            <span className="text-[13px] text-[#4B5563]">Entradas marcadas</span>
          </span>
          <span className="flex flex-col gap-px rounded-2xl bg-[#F9FAFB] px-3.5 py-3">
            <span className="text-[22px] font-semibold leading-[26px]">{qr ? `Gs ${miles(qr.cobrado)}` : "–"}</span>
            <span className="text-[13px] text-[#4B5563]">Cobrado</span>
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className={marco}>
      <span className="text-[13px] font-medium text-[#6B7280]">Panel JUOL</span>
      <h1 className="mb-5 mt-1 text-[32px] font-black leading-[34px]">Partidos de marca</h1>
      {!!error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {partidos === null && !error && <p className="text-sm text-[#6B7280]">Cargando…</p>}
      {partidos?.length === 0 && (
        <p className="text-[15px] leading-[22px] text-[#6B7280]">No hay partidos de marca para hoy ni los próximos días. Se crean desde el panel, en Partidos.</p>
      )}
      <div className="flex flex-col gap-2.5">
        {partidos?.map((p) => (
          <div key={p.id} className="flex flex-col gap-2.5 rounded-[20px] border border-[#E5E7EB] p-3.5">
            <span className="flex flex-col gap-px">
              <span className="text-base font-semibold leading-[21px]">{p.direccion_texto || "Partido de marca"}</span>
              <span className="text-[13px] leading-[18px] text-[#6B7280]">{cuando(p.hora_partido)}{p.marca ? ` · ${p.marca}` : ""}</span>
            </span>
            <button onClick={() => setElegido(p.id)} className="h-12 rounded-full bg-[#232323] text-[15px] font-semibold text-white">Mostrar QR</button>
          </div>
        ))}
      </div>
    </main>
  );
}
