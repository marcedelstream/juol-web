import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProWaitlistForm } from "@/components/ProWaitlistForm";

const benefits: [string, string][] = [
  ["Badge Juolista Pro", "Identificate como parte del núcleo de la comunidad."],
  ["Más herramientas para organizar", "Control avanzado sobre tus partidos y convocatorias."],
  ["Historial y reputación", "Tu trayectoria en Juol, visible para quien importa."],
  ["Acceso anticipado a novedades", "Primero en ver beneficios de canchas y marcas asociadas."],
  ["Prioridad en soporte", "Respuesta rápida cuando algo no funciona."],
];

export default function ProPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero dark */}
        <section className="bg-zinc-950 py-20 text-white">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">JUOL PRO</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Para quienes juegan, organizan y sostienen la comunidad.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400">
              Estamos preparando una membresía con beneficios reales dentro de Juol. Todavía no cobramos: primero vamos a abrir lista de espera.
            </p>
            <div className="mt-8 max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm font-black text-white">Quiero ser parte de Juol Pro</p>
              <p className="mt-1 text-xs text-zinc-500">Dejá tu email y te avisamos antes que nadie cuando abramos.</p>
              <ProWaitlistForm />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">QUÉ INCLUYE</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Beneficios pensados para el juego real.</h2>
            <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map(([title, desc]) => (
                <div key={title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <span className="inline-block h-1.5 w-6 rounded-full bg-[#ff6b00]" />
                  <h3 className="mt-4 text-base font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
