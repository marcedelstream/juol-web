import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StoreButtons } from "@/components/StoreButtons";

const steps: [string, string, string][] = [
  ["01", "Convocá", "Elegí cancha, hora y ubicación. Compartí la invitación con un link."],
  ["02", "Encontrá", "Ves partidos cercanos según tu radio y perfil en la app."],
  ["03", "Confirmá", "Te sumás con un tap y recibís todo lo que necesitás para llegar."],
];

const audiences: [string, string][] = [
  ["Jugadores", "Encontrá partidos a distancia real. Sumarte es un tap, sin llamadas ni grupos interminables."],
  ["Organizadores", "Convocá, gestioná confirmaciones y compartí el link del partido. Simple y claro."],
  ["Canchas y marcas", "Llegá a una comunidad con intención real de jugar. Publicá beneficios donde importa."],
];

const trust: string[] = [
  "Perfil verificado por partido",
  "Sistema de reportes integrado",
  "Historial y reputación por jugador",
  "Sin datos de más",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#111111] text-white">
          {/* Field line decorations */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-0">
            {/* Center circle */}
            <div className="h-[340px] w-[340px] shrink-0 rounded-full border border-white/10" />
          </div>
          <div className="pointer-events-none absolute bottom-1/2 inset-x-0 h-px bg-white/10" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 bg-white/[0.06]" />

          <div className="container-page relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-20 text-center">
            <p className="mb-6 inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-[10px] font-black tracking-widest backdrop-blur">
              FÚTBOL CERCA TUYO
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-8xl">
              Organizá y encontrá partidos{" "}
              <span className="text-[#ff6b00]">cerca tuyo.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
              Juol conecta jugadores, organizadores y canchas. Armar un partido es rápido, claro y confiable.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/descargar"
                className="rounded-full bg-[#ff6b00] px-7 py-3.5 text-center text-sm font-black text-white hover:bg-[#d95600]"
              >
                Descargar app
              </Link>
              <Link
                href="#como-funciona"
                className="rounded-full bg-white/15 px-7 py-3.5 text-center text-sm font-black text-white backdrop-blur hover:bg-white/25"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="bg-white py-20">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">CÓMO FUNCIONA</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Menos vueltas, más juego.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map(([num, title, text]) => (
                <div key={num} className="rounded-3xl border border-zinc-200 bg-[#fffaf6] p-6">
                  <p className="text-3xl font-black text-[#ff6b00] opacity-50">{num}</p>
                  <h3 className="mt-3 text-xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section className="py-20">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">PARA QUIÉN</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Un lugar para cada parte del juego.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {audiences.map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seguridad */}
        <section className="bg-zinc-950 py-16 text-white">
          <div className="container-page grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">SEGURIDAD</p>
              <h2 className="mt-3 text-3xl font-black">Sabés con quién jugás.</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Perfil real, historial de partidos, sistema de reportes. Juol construye confianza dentro de la cancha y afuera también.
              </p>
            </div>
            <div className="flex items-center">
              <ul className="space-y-3">
                {trust.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b00]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Descargá */}
        <section className="py-20">
          <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight">Descargá Juol.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
                La comunidad se construye partido a partido. Empezá por el próximo.
              </p>
            </div>
            <StoreButtons />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
