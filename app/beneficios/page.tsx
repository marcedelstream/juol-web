/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createSupabaseServerClient } from "@/lib/supabase";

type Banner = {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  imagen_url: string | null;
  color_fondo: string | null;
  activo: boolean;
};

export default async function BeneficiosPage() {
  const supabase = createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("banners")
        .select("id,titulo,subtitulo,imagen_url,color_fondo,activo")
        .eq("activo", true)
        .order("orden", { ascending: true })
    : { data: [] as Banner[] };

  const banners = (data || []) as Banner[];

  return (
    <>
      <SiteHeader />
      <main className="min-h-[75vh] py-16">
        <div className="container-page">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">COMUNIDAD JUOL</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Beneficios para jugadores.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Canchas y marcas que acompañan a la comunidad de fútbol. Descubrí qué hay disponible cerca tuyo.
          </p>

          {banners.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-10 text-center">
              <p className="text-sm font-black text-zinc-400">Pronto vas a encontrar beneficios disponibles.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {banners.map((b) => (
                <article key={b.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                  {b.imagen_url ? (
                    <img
                      src={b.imagen_url}
                      alt={b.titulo || "Beneficio Juol"}
                      className="h-auto w-full"
                    />
                  ) : (
                    <div
                      className="flex min-h-40 flex-col justify-end p-6"
                      style={{ background: b.color_fondo || "#ff6b00" }}
                    >
                      <h2 className="text-xl font-black text-white">{b.titulo}</h2>
                      {b.subtitulo && (
                        <p className="mt-2 text-sm leading-6 text-white/80">{b.subtitulo}</p>
                      )}
                    </div>
                  )}
                  {b.imagen_url && (b.titulo || b.subtitulo) && (
                    <div className="p-5">
                      {b.titulo && <h2 className="text-base font-black">{b.titulo}</h2>}
                      {b.subtitulo && <p className="mt-1 text-sm text-zinc-500">{b.subtitulo}</p>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
