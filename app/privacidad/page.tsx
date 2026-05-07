import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16">
        <div className="container-page max-w-2xl">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black">Política de privacidad</h1>
          <div className="mt-8 space-y-5 text-sm leading-7 text-zinc-600">
            <p>
              Usamos tus datos para operar Juol: cuenta, perfil, ubicación aproximada, partidos, confirmaciones y comunicaciones esenciales.
            </p>
            <p>
              La ubicación se usa para mostrar partidos cercanos y mejorar la experiencia. No vendemos datos personales.
            </p>
            <p>
              Podés solicitar soporte o eliminación de cuenta desde la app. Esta política debe revisarse legalmente antes del lanzamiento final.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
