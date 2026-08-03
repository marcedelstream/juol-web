import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const WA_URL = "https://wa.me/595993031024?text=" + encodeURIComponent("Hola! Quiero solicitar mi membresía Juolista PRO.");

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
        {/* Hero */}
        <section className="bg-[#0a0a0a] py-24 text-white">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#FD7401]">JUOL PRO</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Para quienes juegan,<br />
              <span className="text-[#FD7401]">organizan y sostienen.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/50">
              Sumate a la comunidad y llevá tu juego al siguiente nivel.
            </p>

            {/* Planes */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-xl">
              {/* Anual */}
              <div className="rounded-2xl border-2 border-[#FD7401] bg-white/5 p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-black text-white">Plan anual</p>
                  <span className="rounded-full bg-[#FD7401] px-3 py-1 text-[10px] font-black text-white">MEJOR PRECIO</span>
                </div>
                <p className="text-3xl font-black text-[#FD7401]">Gs 100.000</p>
                <p className="mt-1 text-xs text-white/40">/año · ~Gs 8.333/mes</p>
              </div>
              {/* Mensual */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-black text-white mb-3">Plan mensual</p>
                <p className="text-3xl font-black text-white">Gs 10.000</p>
                <p className="mt-1 text-xs text-white/40">/mes · renovación mensual</p>
              </div>
            </div>

            {/* Pago / CTA */}
            <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-black text-white">¿Cómo suscribirme?</p>
              <p className="mt-2 text-xs leading-6 text-white/40">
                Próximamente podrás hacer tus pagos de manera automática.
                Por ahora, escribinos por WhatsApp y te activamos la membresía.
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribir al WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white py-20">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#FD7401]">QUÉ INCLUYE</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Beneficios pensados<br />para el juego real.</h2>
            <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <span className="inline-block h-1 w-8 rounded-full bg-[#FD7401]" />
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
