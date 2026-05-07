/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createSupabaseServerClient } from "@/lib/supabase";

type Banner = { id: string; titulo: string | null; subtitulo: string | null; imagen_url: string | null; color_fondo: string | null; activo: boolean };

export default async function BeneficiosPage() {
  const supabase = createSupabaseServerClient();
  const { data } = supabase ? await supabase.from("banners").select("id,titulo,subtitulo,imagen_url,color_fondo,activo").eq("activo", true).order("orden", { ascending: true }) : { data: [] as Banner[] };
  const banners = (data || []) as Banner[];
  return <><SiteHeader /><main className="container-page min-h-[75vh] py-16"><h1 className="text-4xl font-black tracking-tight">Beneficios Juol</h1><p className="mt-3 max-w-xl text-zinc-600">Promociones, canchas y marcas que acompañan a la comunidad.</p><div className="mt-8 grid gap-5">{banners.length === 0 ? <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-zinc-600">Pronto vas a encontrar beneficios disponibles.</div> : banners.map((b) => <article key={b.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">{b.imagen_url ? <img src={b.imagen_url} alt={b.titulo || "Beneficio Juol"} className="h-auto w-full" /> : <div className="p-8" style={{ background: b.color_fondo || "#ff6b00" }}><h2 className="text-2xl font-black text-white">{b.titulo}</h2><p className="mt-2 text-white/85">{b.subtitulo}</p></div>}</article>)}</div></main><SiteFooter /></>;
}

