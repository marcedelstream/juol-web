import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StoreButtons } from "@/components/StoreButtons";

const steps = [
  ["Convocá", "Elegí cancha, hora y ubicación para armar tu partido."],
  ["Encontrá", "Ves partidos cercanos según tu radio y perfil."],
  ["Confirmá", "Te sumás y recibís la información para llegar."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-field text-white">
          <div className="container-page grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">Fútbol cerca tuyo</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">Organizá y encontrá partidos de fútbol cerca tuyo.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">Juol conecta jugadores, organizadores y canchas para que armar un partido sea rápido, claro y confiable.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/descargar" className="rounded-full bg-[#ff6b00] px-6 py-4 text-center text-sm font-black text-white hover:bg-[#d95600]">Descargar app</Link>
                <Link href="#como-funciona" className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-zinc-950">Ver cómo funciona</Link>
                <Link href="/pro" className="rounded-full border border-white/40 px-6 py-4 text-center text-sm font-black text-white">Juol Pro</Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm rounded-[2rem] border-8 border-zinc-950 bg-[#fffaf6] p-4 text-zinc-950 phone-shadow">
              <div className="rounded-[1.4rem] bg-white p-4">
                <div className="mb-4 flex items-center justify-between"><b>juol</b><span className="rounded-full bg-[#ff6b00] px-3 py-1 text-xs font-black text-white">EN VIVO</span></div>
                <div className="rounded-2xl border border-zinc-100 p-4">
                  <p className="text-xs font-black text-[#ff6b00]">PARTIDO CERCA</p>
                  <h2 className="mt-2 text-2xl font-black">San Lorenzo</h2>
                  <p className="mt-2 text-sm text-zinc-500">Hoy 20:30 · 2.4 km</p>
                  <div className="mt-4 h-40 rounded-2xl bg-[#0f7a4f]" />
                  <button className="mt-4 w-full rounded-full bg-[#ff6b00] py-3 text-sm font-black text-white">Sumarme</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="como-funciona" className="bg-white py-20"><div className="container-page"><h2 className="text-4xl font-black tracking-tight">Menos vueltas, más juego.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(([title, text]) => <div key={title} className="rounded-3xl border border-zinc-200 p-6"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 text-zinc-600">{text}</p></div>)}</div></div></section>
        <section className="py-20"><div className="container-page grid gap-8 md:grid-cols-3"><div><h2 className="text-3xl font-black">Para jugadores</h2><p className="mt-3 text-zinc-600">Encontrá partidos a una distancia realista y sumate con contexto.</p></div><div><h2 className="text-3xl font-black">Para organizadores</h2><p className="mt-3 text-zinc-600">Convocá, compartí invitaciones y gestioná confirmaciones.</p></div><div><h2 className="text-3xl font-black">Para canchas y marcas</h2><p className="mt-3 text-zinc-600">Mostrá beneficios y promociones donde hay intención de jugar.</p></div></div></section>
        <section className="bg-zinc-950 py-20 text-white"><div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><h2 className="text-4xl font-black">Descargá Juol</h2><p className="mt-3 max-w-xl text-zinc-300">La comunidad se construye partido a partido. Empezá por el próximo.</p></div><StoreButtons /></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
