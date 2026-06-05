import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenAppButton } from "@/components/OpenAppButton";
import { createSupabaseServerClient } from "@/lib/supabase";

type Partido = {
  id: string;
  direccion_texto: string | null;
  hora_partido: string;
  estado: string;
  confirmados_count?: number | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ESTADO_LABEL: Record<string, string> = {
  abierto: "Abierto",
  activo: "Activo",
  cerrado: "Cerrado",
  completo: "Completo",
  finalizado: "Finalizado",
  abandonado: "Finalizado",
  cancelado: "Cancelado",
};

const ESTADO_COLOR: Record<string, string> = {
  abierto: "bg-emerald-50 text-emerald-700 border-emerald-200",
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cerrado: "bg-zinc-100 text-zinc-500 border-zinc-200",
  completo: "bg-amber-50 text-amber-700 border-amber-200",
  finalizado: "bg-zinc-100 text-zinc-400 border-zinc-200",
  abandonado: "bg-zinc-100 text-zinc-400 border-zinc-200",
  cancelado: "bg-red-50 text-red-600 border-red-200",
};

function MiniHeader() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-5">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/juol-icon.png" alt="Juol" width={28} height={28} className="rounded-lg" />
        <span className="text-lg font-black">juol</span>
      </Link>
      <Link href="/descargar" className="rounded-full bg-[#ff6b00] px-4 py-1.5 text-xs font-black text-white hover:bg-[#d95600]">
        Descargar
      </Link>
    </div>
  );
}

function OpenInAppFallback({ partidoId }: { partidoId: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf6]">
      <MiniHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">INVITACIÓN A PARTIDO</p>
        <h1 className="mt-4 max-w-sm text-3xl font-black leading-tight">Abrí este partido en Juol.</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">
          El enlace está listo para abrirse en la app. Si no tenés Juol instalado, podés descargarlo.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <OpenAppButton
            partidoId={partidoId}
            className="block w-full rounded-full bg-[#ff6b00] py-3.5 text-center text-sm font-black text-white hover:bg-[#d95600]"
          />
          <Link
            href="/descargar"
            className="block w-full rounded-full border border-zinc-200 bg-white py-3.5 text-center text-sm font-black text-zinc-800 hover:border-zinc-300"
          >
            Descargar Juol
          </Link>
        </div>
        <p className="mt-5 max-w-xs text-xs leading-5 text-zinc-400">
          La información del partido se muestra dentro de Juol.
        </p>
      </main>
    </div>
  );
}

export default async function PartidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseServerClient();
  let partido: Partido | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("partidos_publicos_web")
      .select("id,direccion_texto,hora_partido,estado,confirmados_count")
      .eq("id", id)
      .maybeSingle();
    partido = data as Partido | null;
  }

  if (!partido) {
    return <OpenInAppFallback partidoId={id} />;
  }

  const fecha = new Date(partido.hora_partido).toLocaleString("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const estadoKey = (partido.estado ?? "abierto").toLowerCase();
  const estadoLabel = ESTADO_LABEL[estadoKey] ?? partido.estado;
  const estadoColor = ESTADO_COLOR[estadoKey] ?? ESTADO_COLOR.abierto;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf6]">
      <MiniHeader />
      <main className="flex flex-1 flex-col items-center px-5 py-10">
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">INVITACIÓN A PARTIDO</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">Te invitaron a jugar fútbol.</h1>
          <p className="mt-2 text-sm text-zinc-500">Abrí la app para confirmar tu lugar en el partido.</p>

          <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="match-field relative h-28">
              <div className="absolute bottom-3 left-4">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${estadoColor}`}>
                  {estadoLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-[10px] font-black tracking-widest text-zinc-400">LUGAR</p>
                <p className="mt-1 text-lg font-black leading-tight">
                  {partido.direccion_texto || "Ubicación disponible en Juol"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-zinc-400">HORA</p>
                <p className="mt-1 text-base font-bold capitalize">{fecha}</p>
              </div>
              {typeof partido.confirmados_count === "number" && (
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                  <span className="text-2xl font-black">{partido.confirmados_count}</span>
                  <span className="text-sm font-semibold text-zinc-500">confirmados</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <OpenAppButton
              partidoId={id}
              className="block w-full rounded-full bg-[#ff6b00] py-3.5 text-center text-sm font-black text-white hover:bg-[#d95600]"
            />
            <Link
              href="/descargar"
              className="block w-full rounded-full border border-zinc-200 bg-white py-3.5 text-center text-sm font-black text-zinc-800 hover:border-zinc-300"
            >
              Descargar Juol
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            juol · fútbol cerca tuyo
          </p>
        </div>
      </main>
    </div>
  );
}
