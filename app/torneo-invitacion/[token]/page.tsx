import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenAppButton } from "@/components/OpenAppButton";
import { createSupabaseServerClient } from "@/lib/supabase";

type InvitacionPublica = {
  token: string;
  estado: string;
  expira_at: string;
  torneo_nombre: string;
  equipo_nombre: string;
};

const TOKEN_RE = /^[0-9a-f]{48}$/i;

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

function NotFoundFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf6]">
      <MiniHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="text-[10px] font-black tracking-widest text-[#FD7401]">INVITACIÓN A EQUIPO</p>
        <h1 className="mt-4 max-w-sm text-3xl font-black leading-tight">No encontramos esta invitación.</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">
          Puede que ya haya sido usada o el link esté vencido.
        </p>
      </main>
    </div>
  );
}

export default async function TorneoInvitacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) notFound();

  const supabase = createSupabaseServerClient();
  let invitacion: InvitacionPublica | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("torneo_invitaciones_publica")
      .select("token, estado, expira_at, torneo_nombre, equipo_nombre")
      .eq("token", token)
      .maybeSingle();
    invitacion = data as InvitacionPublica | null;
  }

  if (!invitacion) return <NotFoundFallback />;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf6]">
      <MiniHeader />
      <main className="flex flex-1 flex-col items-center px-5 py-10">
        <div className="w-full max-w-sm text-center">
          <p className="text-[10px] font-black tracking-widest text-[#FD7401]">INVITACIÓN A EQUIPO</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">Te invitaron a {invitacion.equipo_nombre}</h1>
          <p className="mt-2 text-sm text-zinc-500">para jugar {invitacion.torneo_nombre}</p>

          {invitacion.estado !== "pendiente" ? (
            <p className="mt-8 text-sm font-semibold text-zinc-400">Esta invitación ya fue respondida.</p>
          ) : (
            <div className="mt-8 space-y-3">
              <OpenAppButton
                path={`/torneo-invitacion/${token}`}
                className="block w-full rounded-full bg-[#FD7401] py-3.5 text-center text-sm font-black text-white hover:bg-[#d95600]"
              />
              <Link
                href="/descargar"
                className="block w-full rounded-full border border-zinc-200 bg-white py-3.5 text-center text-sm font-black text-zinc-800 hover:border-zinc-300"
              >
                Descargar Juol
              </Link>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Abrí este link desde tu celular con Juol instalado para aceptar o rechazar.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-zinc-400">juol · fútbol cerca tuyo</p>
        </div>
      </main>
    </div>
  );
}
