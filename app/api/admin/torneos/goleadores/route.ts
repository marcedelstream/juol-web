import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const url = new URL(request.url);
  const torneoId = url.searchParams.get("torneo_id");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("torneo_goleadores")
    .select("*, jugador:users(nombre, apellido), equipo:torneo_equipos(nombre)")
    .eq("torneo_id", torneoId)
    .order("goles", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goleadores: data || [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const torneoId = String(body.torneo_id || "");
  const equipoId = String(body.equipo_id || "");
  const jugadorId = String(body.jugador_id || "");
  const goles = Number(body.goles ?? 0);

  if (!torneoId || !equipoId || !jugadorId) {
    return NextResponse.json({ error: "Faltan torneo_id, equipo_id o jugador_id." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("torneo_goleadores")
    .upsert({ torneo_id: torneoId, equipo_id: equipoId, jugador_id: jugadorId, goles, updated_at: new Date().toISOString() }, { onConflict: "torneo_id,jugador_id" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goleador: data });
}
