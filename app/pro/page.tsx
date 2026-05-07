import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProWaitlistForm } from "@/components/ProWaitlistForm";

const benefits = ["Badge de Juolista Pro", "Más herramientas para organizar", "Historial y reputación", "Acceso anticipado a beneficios"];

export default function ProPage() {
  return <><SiteHeader /><main><section className="container-page py-20"><p className="font-black text-[#ff6b00]">JUOL PRO</p><h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight">Para quienes juegan, organizan y sostienen la comunidad.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">Estamos preparando una membresía con beneficios reales dentro de Juol. Todavía no cobramos desde la web: primero vamos a abrir lista de espera.</p><ProWaitlistForm /></section><section className="bg-white py-16"><div className="container-page grid gap-4 md:grid-cols-4">{benefits.map((b) => <div key={b} className="rounded-3xl border border-zinc-200 p-5 font-bold">{b}</div>)}</div></section></main><SiteFooter /></>;
}
