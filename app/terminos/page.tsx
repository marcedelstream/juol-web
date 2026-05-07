import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function TerminosPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16">
        <div className="container-page max-w-2xl">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black">Términos y condiciones</h1>
          <div className="mt-8 space-y-5 text-sm leading-7 text-zinc-600">
            <p>
              Juol es una plataforma para organizar y encontrar partidos de fútbol entre personas cercanas.
            </p>
            <p>
              Los usuarios son responsables de la información que publican, de sus confirmaciones y de su conducta antes, durante y después de cada partido.
            </p>
            <p>
              Juol puede moderar contenido, reportes o cuentas que incumplan las reglas de convivencia, seguridad o uso legítimo de la plataforma.
            </p>
            <p>
              Este documento es una base preliminar y debe revisarse legalmente antes del lanzamiento comercial final.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
