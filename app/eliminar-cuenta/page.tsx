import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Eliminar cuenta | Juol",
  description: "Instrucciones para eliminar tu cuenta de Juol desde la app.",
};

export default function EliminarCuentaPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16">
        <div className="container-page max-w-2xl">
          <p className="text-[10px] font-black tracking-widest text-[#FD7401]">CUENTA</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Eliminar cuenta</h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-600">
            <p>
              Podés eliminar tu cuenta directamente desde Juol. Abrí la app, entrá a Perfil y tocá
              “Eliminar cuenta”. Para confirmar, la app te pedirá escribir “ELIMINAR”.
            </p>
            <p>
              Al eliminar la cuenta se remueve tu perfil y la información asociada a tu usuario,
              incluyendo datos de partidos y confirmaciones vinculadas según corresponda.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="juol://perfil"
              className="inline-flex justify-center rounded-full bg-[#FD7401] px-6 py-3 text-sm font-black text-white hover:bg-[#d95600]"
            >
              Abrir Perfil en Juol
            </a>
            <a
              href="/descargar"
              className="inline-flex justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-black text-zinc-700 hover:border-zinc-300"
            >
              Descargar Juol
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
