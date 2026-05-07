import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OpenAppButton } from "@/components/OpenAppButton";
import { StoreButtons } from "@/components/StoreButtons";
import { createSupabaseServerClient } from "@/lib/supabase";

type Partido = { id: string; direccion_texto: string | null; hora_partido: string; estado: string; confirmados_count?: number | null };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PartidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const supabase = createSupabaseServerClient();
  let partido: Partido | null = null;
  if (supabase) {
    const { data } = await supabase.from("partidos_publicos_web").select("id,direccion_texto,hora_partido,estado,confirmados_count").eq("id", id).maybeSingle();
    partido = data as Partido | null;
  }
  if (!partido) {
    return <><SiteHeader /><main className="container-page min-h-[70vh] py-16"><h1 className="text-4xl font-black">Partido no disponible</h1><p className="mt-3 text-zinc-600">Puede haber sido cancelado, finalizado o el enlace ya no está disponible.</p><Link href="/descargar" className="mt-8 inline-flex rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-black text-white">Descargar Juol</Link></main><SiteFooter /></>;
  }
  const fecha = new Date(partido.hora_partido).toLocaleString("es-PY", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return <><SiteHeader /><main className="container-page min-h-[75vh] py-16"><div className="grid gap-8 md:grid-cols-[1fr_0.8fr]"><section><p className="font-black text-[#ff6b00]">INVITACIÓN A PARTIDO</p><h1 className="mt-3 max-w-2xl text-5xl font-black tracking-tight">Te invitaron a jugar fútbol en Juol.</h1><p className="mt-5 text-lg text-zinc-600">Abrí la app para ver el detalle completo y confirmar tu lugar.</p><div className="mt-8 flex flex-wrap gap-3"><OpenAppButton partidoId={id} /><Link href="/descargar" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-black">Descargar Juol</Link></div></section><aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-black">Partido</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="font-bold text-zinc-500">Lugar</dt><dd className="mt-1 text-lg font-black">{partido.direccion_texto || "Ubicación cargada en Juol"}</dd></div><div><dt className="font-bold text-zinc-500">Hora</dt><dd className="mt-1 text-lg font-black capitalize">{fecha}</dd></div><div><dt className="font-bold text-zinc-500">Estado</dt><dd className="mt-1 text-lg font-black capitalize">{partido.estado}</dd></div>{typeof partido.confirmados_count === "number" && <div><dt className="font-bold text-zinc-500">Confirmados</dt><dd className="mt-1 text-lg font-black">{partido.confirmados_count}</dd></div>}</dl></aside></div><div className="mt-12"><StoreButtons compact /></div></main><SiteFooter /></>;
}
