import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";
import { invokeEdgeFunction } from "@/lib/invokeEdgeFunction";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const url = new URL(request.url);
  const torneoId = url.searchParams.get("torneo_id");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });

  const [equiposRes, rosterRes, libresRes] = await Promise.all([
    admin.supabase.from("torneo_equipos").select("*").eq("torneo_id", torneoId).order("created_at"),
    admin.supabase.from("torneo_equipo_jugadores").select("*, user:users(nombre, apellido)").in(
      "equipo_id",
      (await admin.supabase.from("torneo_equipos").select("id").eq("torneo_id", torneoId)).data?.map((e: any) => e.id) || []
    ),
    admin.supabase.from("torneo_agentes_libres").select("*, user:users(nombre, apellido)").eq("torneo_id", torneoId).eq("estado", "disponible"),
  ]);

  if (equiposRes.error) return NextResponse.json({ error: equiposRes.error.message }, { status: 500 });

  return NextResponse.json({
    equipos: equiposRes.data || [],
    roster: rosterRes.data || [],
    agentesLibres: libresRes.data || [],
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });

  const payload: Record<string, unknown> = {};
  let confirmandoPago = false;

  if (body.estado === "inscripcion") {
    payload.estado = "inscripcion";
    payload.pago_confirmado_at = new Date().toISOString();
    payload.pago_confirmado_por = admin.userId;
    confirmandoPago = true;
  }
  if (typeof body.grupo_fase === "string" || body.grupo_fase === null) payload.grupo_fase = body.grupo_fase;
  if (typeof body.nombre === "string" && body.nombre.trim()) payload.nombre = body.nombre.trim();

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar." }, { status: 400 });
  }

  const { data, error } = await admin.supabase.from("torneo_equipos").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (confirmandoPago) {
    invokeEdgeFunction("notificar-torneo-equipo-confirmado", { equipo_id: id });
  }

  return NextResponse.json({ equipo: data });
}
