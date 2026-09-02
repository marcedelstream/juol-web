import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const fields = [
  "nombre", "descripcion", "portada_url", "inicio_at", "ubicacion_texto", "lat", "lng",
  "precio_inscripcion", "cupo_equipos", "cantidad_grupos", "clasificados_por_grupo",
  "estado", "inscripciones_abiertas", "motivo_rechazo",
];

function sanitizeTorneo(input: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in input) payload[field] = input[field] === "" ? null : input[field];
  }
  if ("cupo_equipos" in payload) payload.cupo_equipos = Number(payload.cupo_equipos);
  if ("clasificados_por_grupo" in payload) payload.clasificados_por_grupo = Number(payload.clasificados_por_grupo || 2);
  if ("cantidad_grupos" in payload && payload.cantidad_grupos != null) payload.cantidad_grupos = Number(payload.cantidad_grupos);
  if ("precio_inscripcion" in payload && payload.precio_inscripcion != null) payload.precio_inscripcion = Number(payload.precio_inscripcion);
  if ("inscripciones_abiertas" in payload) payload.inscripciones_abiertas = Boolean(payload.inscripciones_abiertas);
  return payload;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { data: torneos, error } = await admin.supabase
    .from("torneos")
    .select("*, torneo_organizador:torneo_organizadores(nombre)")
    .order("inicio_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: equipos } = await admin.supabase.from("torneo_equipos").select("id, torneo_id, estado");
  const conteos: Record<string, { preinscripcion: number; inscripcion: number }> = {};
  (equipos || []).forEach((e: any) => {
    conteos[e.torneo_id] ||= { preinscripcion: 0, inscripcion: 0 };
    conteos[e.torneo_id][e.estado as "preinscripcion" | "inscripcion"] += 1;
  });

  return NextResponse.json({
    torneos: (torneos || []).map((t: any) => ({
      ...t,
      equipos_preinscripcion: conteos[t.id]?.preinscripcion ?? 0,
      equipos_inscripcion: conteos[t.id]?.inscripcion ?? 0,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const payload = sanitizeTorneo(body);
  if (!payload.nombre || !payload.inicio_at || !payload.cupo_equipos) {
    return NextResponse.json({ error: "Faltan nombre, inicio_at o cupo_equipos." }, { status: 400 });
  }
  const { data, error } = await admin.supabase.from("torneos").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ torneo: data });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const payload = sanitizeTorneo(body);
  const { data, error } = await admin.supabase.from("torneos").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ torneo: data });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  // Cascada ya definida en el schema (equipos, roster, fixture, goleadores).
  const { error } = await admin.supabase.from("torneos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
