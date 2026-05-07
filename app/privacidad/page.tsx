import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacidadPage() {
  return <><SiteHeader /><main className="container-page max-w-3xl py-16"><h1 className="text-4xl font-black">Política de privacidad</h1><div className="mt-6 space-y-4 leading-7 text-zinc-700"><p>Usamos tus datos para operar Juol: cuenta, perfil, ubicación aproximada, partidos, confirmaciones y comunicaciones esenciales.</p><p>La ubicación se usa para mostrar partidos cercanos y mejorar la experiencia. No vendemos datos personales.</p><p>Podés solicitar soporte o eliminación de cuenta desde la app. Esta política debe revisarse legalmente antes del lanzamiento final.</p></div></main><SiteFooter /></>;
}
