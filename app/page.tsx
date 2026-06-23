import Link from "next/link";
import { unstable_cache } from "next/cache";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createSupabaseServerClient } from "@/lib/supabase";
import { StatsCounter } from "@/components/StatsCounter";

// ─── Stats via RPC (bypasses RLS, solo devuelve conteos) ──────────────────────
// Cacheado 30s: antes esto pegaba a Supabase en cada carga de "/", lo que
// bajo tráfico hacía caer el proceso de Next.js en Hostinger.
const getStats = unstable_cache(
  async () => {
    try {
      const supabase = createSupabaseServerClient();
      if (!supabase) return { users: null, partidos: null, confirmaciones: null };
      const { data } = await supabase.rpc("public_stats");
      return {
        users: (data as any)?.users ?? null,
        partidos: (data as any)?.partidos ?? null,
        confirmaciones: (data as any)?.confirmaciones ?? null,
      };
    } catch {
      return { users: null, partidos: null, confirmaciones: null };
    }
  },
  ["public-stats"],
  { revalidate: 30 }
);

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconZap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
}
function IconMapPin() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconBell() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconUsers() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconArrow() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconBriefcase() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  const stats = await getStats();

  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0a0a0a]">
          {/* Minimal center circle */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[480px] w-[480px] rounded-full border border-white/[0.04]" />
            <div className="absolute h-[280px] w-[280px] rounded-full border border-white/[0.03]" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.04]" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/[0.03]" />

          <div className="container-page relative z-10 flex min-h-[calc(100svh-64px)] flex-col items-center justify-center py-24 text-center">
            <h1 className="max-w-4xl text-[clamp(3.2rem,9vw,6.5rem)] font-black leading-[0.95] tracking-tight text-white">
              Se acabó el{" "}
              <span className="text-[#ff6b00]">no completamos.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-white/50">
              Convocá jugadores, encontrá partidos cerca y confirmá tu lugar con un tap. Sin grupos de WhatsApp ni llamadas.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/descargar"
                className="flex items-center gap-2 rounded-full bg-[#ff6b00] px-7 py-3.5 text-sm font-black text-white hover:bg-[#e05e00] transition-colors"
              >
                Descargar app <IconArrow />
              </Link>
              <Link
                href="#como-funciona"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-black text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Ver cómo funciona
              </Link>
            </div>

            {/* Stats — real-time user count */}
            <StatsCounter
              initialUsers={stats.users}
              initialPartidos={stats.partidos}
              initialConfirmaciones={stats.confirmaciones}
            />
          </div>
        </section>

        {/* ── Features strip ────────────────────────────────────────────── */}
        <section className="border-y border-zinc-100 bg-white">
          <div className="container-page">
            <div className="grid divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
              {[
                { icon: <IconZap />, title: "Un tap para confirmar", text: "Sin llamadas ni grupos de WhatsApp." },
                { icon: <IconMapPin />, title: "Partidos cerca tuyo", text: "Filtrá por distancia real desde tu perfil." },
                { icon: <IconBell />, title: "Notificaciones al toque", text: "Te avisamos cuando hay partido disponible." },
                { icon: <IconUsers />, title: "Jugadores con perfil", text: "Sabés con quién vas a jugar antes de llegar." },
              ].map(({ icon, title, text }) => (
                <div key={title} className="flex gap-4 px-6 py-8">
                  <span className="mt-0.5 shrink-0 text-[#ff6b00]">{icon}</span>
                  <div>
                    <p className="font-black text-zinc-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ─────────────────────────────────────────────── */}
        <section id="como-funciona" className="bg-[#0a0a0a] py-24 text-white">
          <div className="container-page">
            <div className="mb-14 flex flex-col items-center text-center">
              <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">CÓMO FUNCIONA</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tres pasos.<br />Un partido.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { num: "01", title: "Convocá", text: "Elegí cancha, hora y cuántos jugadores necesitás. Compartí el link en segundos." },
                { num: "02", title: "Encontrá", text: "Ves partidos cercanos filtrados por tu radio y disponibilidad. Sin spam." },
                { num: "03", title: "Jugá", text: "Te sumás con un tap, recibís los datos del partido y llegás listo." },
              ].map(({ num, title, text }) => (
                <div key={num} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
                  <p className="text-5xl font-black text-[#ff6b00] opacity-40">{num}</p>
                  <h3 className="mt-4 text-2xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/50">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Para quién ────────────────────────────────────────────────── */}
        <section className="bg-[#f9f9f9] py-24">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">PARA QUIÉN</p>
            <h2 className="mt-3 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">Un lugar para cada parte del juego.</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { role: "Jugadores", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>, text: "Encontrá partidos a distancia real. Sumarte es un tap, sin llamadas ni grupos interminables.", highlight: true },
                { role: "Organizadores", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, text: "Convocá, gestioná confirmaciones y compartí el link del partido. Simple y claro.", highlight: false },
                { role: "Canchas y marcas", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, text: "Llegá a una comunidad con intención real de jugar. Publicá beneficios donde importa.", highlight: false },
              ].map(({ role, icon, text, highlight }) => (
                <div key={role} className={`rounded-3xl p-8 ${highlight ? "bg-[#ff6b00] text-white" : "border border-zinc-200 bg-white"}`}>
                  <span className={highlight ? "text-white/80" : "text-zinc-400"}>{icon}</span>
                  <h3 className={`mt-4 text-xl font-black ${highlight ? "text-white" : "text-zinc-900"}`}>{role}</h3>
                  <p className={`mt-3 text-sm leading-6 ${highlight ? "text-white/75" : "text-zinc-500"}`}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Jugadores reales ──────────────────────────────────────────── */}
        <section className="overflow-hidden bg-white py-24">
          <div className="container-page grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">LA COMUNIDAD</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Jugadores reales.<br />Amantes del fútbol.</h2>
              <p className="mt-5 text-base leading-7 text-zinc-500">
                En Juol sabés con quién vas a jugar antes de llegar. Cada perfil muestra la profesión del jugador — y muchas veces, un partido es también el inicio de una oportunidad de negocio.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Perfiles con nombre, foto y profesión",
                  "Historial de partidos por jugador",
                  "Sistema de reportes integrado",
                  "Construí tu red jugando",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff6b00] text-white">
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="h-64 w-64 rounded-full border-2 border-zinc-100 bg-zinc-50 flex items-center justify-center">
                <div className="h-40 w-40 rounded-full border-2 border-zinc-200 bg-white flex items-center justify-center text-zinc-300">
                  <IconBriefcase />
                </div>
              </div>
              <div className="absolute top-4 right-0 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black text-zinc-900">Profesión visible</p>
                <p className="text-[10px] text-zinc-400">Perfil real del jugador</p>
              </div>
              <div className="absolute bottom-4 left-0 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black text-zinc-900">Red de contactos</p>
                <p className="text-[10px] text-zinc-400">Creá oportunidades jugando</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA descarga ──────────────────────────────────────────────── */}
        <section className="bg-[#ff6b00]">
          <div className="container-page py-24 text-center">
            <p className="text-[10px] font-black tracking-widest text-white/60">DISPONIBLE AHORA</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Descargá Juol.</h2>
            <p className="mt-4 text-base font-medium text-white/70">
              La comunidad se construye partido a partido.<br className="hidden sm:block" /> Empezá por el próximo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/descargar" className="flex min-w-[180px] items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur transition hover:bg-white/20">
                <div>
                  <p className="text-xs font-semibold text-white/60">iPhone y iPad</p>
                  <p className="text-base font-black text-white">App Store</p>
                </div>
              </Link>
              <Link href="/descargar" className="flex min-w-[180px] items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur transition hover:bg-white/20">
                <div>
                  <p className="text-xs font-semibold text-white/60">Android</p>
                  <p className="text-base font-black text-white">Google Play</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
