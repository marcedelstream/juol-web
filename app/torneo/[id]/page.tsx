import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenAppButton } from "@/components/OpenAppButton";
import { createSupabaseServerClient } from "@/lib/supabase";

type Torneo = {
  id: string;
  nombre: string;
  descripcion: string | null;
  portada_url: string | null;
  inicio_at: string;
  ubicacion_texto: string | null;
  precio_inscripcion: number | null;
  cupo_equipos: number;
  estado: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getTorneo(id: string): Promise<Torneo | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("torneos_publicos_web")
    .select("id,nombre,descripcion,portada_url,inicio_at,ubicacion_texto,precio_inscripcion,cupo_equipos,estado")
    .eq("id", id)
    .maybeSingle();
  return data as Torneo | null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const torneo = await getTorneo(id);
  if (!torneo) return { title: "Torneo — Juol" };

  const descripcion = torneo.descripcion ?? `Torneo en Juol — inscribite ya.`;
  const imagenes = torneo.portada_url ? [{ url: torneo.portada_url, width: 1200, height: 630 }] : undefined;

  return {
    title: `${torneo.nombre} — Juol`,
    description: descripcion,
    openGraph: {
      title: torneo.nombre,
      description: descripcion,
      images: imagenes,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: torneo.nombre,
      description: descripcion,
      images: torneo.portada_url ? [torneo.portada_url] : undefined,
    },
  };
}

function MiniHeader() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-5">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/juol-icon.png" alt="Juol" width={28} height={28} className="rounded-lg" />
        <span className="text-lg font-black">juol</span>
      </Link>
      <Link href="/descargar" className="rounded-full bg-[#FD7401] px-4 py-1.5 text-xs font-black text-white hover:bg-[#d95600]">
        Descargar
      </Link>
    </div>
  );
}

function formatPrecio(precio: number | null) {
  if (!precio) return "Gratis";
  return `Gs ${precio.toLocaleString("es-PY")}`;
}

export default async function TorneoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const torneo = await getTorneo(id);
  if (!torneo) notFound();

  const fecha = new Date(torneo.inicio_at).toLocaleString("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf6]">
      <MiniHeader />
      <main className="flex flex-1 flex-col items-center px-5 py-10">
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-black tracking-widest text-[#FD7401]">TORNEO</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">{torneo.nombre}</h1>
          {torneo.descripcion && <p className="mt-2 text-sm text-zinc-500">{torneo.descripcion}</p>}

          <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {torneo.portada_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={torneo.portada_url} alt={torneo.nombre} className="h-40 w-full object-cover" />
            ) : (
              <div className="h-24 bg-gradient-to-br from-[#FD7401] to-[#d95600]" />
            )}
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[10px] font-black tracking-widest text-zinc-400">FECHA Y HORA</p>
                <p className="mt-1 text-base font-bold capitalize">{fecha}</p>
              </div>
              {torneo.ubicacion_texto && (
                <div>
                  <p className="text-[10px] font-black tracking-widest text-zinc-400">LUGAR</p>
                  <p className="mt-1 text-lg font-black leading-tight">{torneo.ubicacion_texto}</p>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                <span className="text-sm font-semibold text-zinc-500">{formatPrecio(torneo.precio_inscripcion)} por equipo · {torneo.cupo_equipos} equipos</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <OpenAppButton
              path={`/torneo/${id}`}
              className="block w-full rounded-full bg-[#FD7401] py-3.5 text-center text-sm font-black text-white hover:bg-[#d95600]"
            />
            <Link
              href="/descargar"
              className="block w-full rounded-full border border-zinc-200 bg-white py-3.5 text-center text-sm font-black text-zinc-800 hover:border-zinc-300"
            >
              Descargar Juol
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">juol · fútbol cerca tuyo</p>
        </div>
      </main>
    </div>
  );
}
