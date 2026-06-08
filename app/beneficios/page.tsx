import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BeneficiosList } from "@/components/BeneficiosList";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function BeneficiosPage() {
  const supabase = createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("banners")
        .select("id,titulo,subtitulo,descripcion_interna,imagen_url,enlace_url,color_fondo,activo")
        .eq("activo", true)
        .order("orden", { ascending: true })
    : { data: [] };

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-[#0a0a0a] py-20 text-white">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">COMUNIDAD JUOL</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Beneficios para<br />
              <span className="text-[#ff6b00]">jugadores.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
              Canchas y marcas que acompañan a la comunidad de fútbol. Descubrí qué hay disponible y tocá para ver más detalles.
            </p>
          </div>
        </section>

        {/* Lista */}
        <section className="py-16">
          <div className="container-page max-w-2xl">
            <BeneficiosList banners={(data || []) as any} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
