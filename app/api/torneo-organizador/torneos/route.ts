import { NextResponse } from "next/server";
import { isTorneoOrganizadorContext, requireTorneoOrganizador } from "@/lib/torneoOrganizadorAuth";

const fields = [
  "nombre", "descripcion", "portada_url", "inicio_at", "ubicacion_texto", "lat", "lng",
  "precio_inscripcion", "cupo_equipos", "cantidad_grupos", "clasificados_por_grupo", "formato",
  "estado", "inscripciones_abiertas",
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
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;

  const { data: torneos, error } = await ctx.supabase
    .from("torneos")
    .select("*")
    .eq("torneo_organizador_id", ctx.torneoOrganizadorId)
    .order("inicio_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const torneoIds = (torneos || []).map((t: any) => t.id);
  const { data: equipos } = await ctx.supabase.from("torneo_equipos").select("id, torneo_id, estado").in("torneo_id", torneoIds);
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

// El organizador nunca PUBLICA directo: solo puede ir a borrador <-> en_revision.
// publicado/en_curso/cancelado los pone el founder al aprobar (o al gestionar
// el torneo) desde el panel admin — así ningún torneo externo queda visible en
// la app sin que alguien de Juol lo haya revisado antes. 'finalizado' sí lo
// puede poner el organizador solo: cerrar un torneo que YA está publicado no
// agrega contenido nuevo sin revisar, solo lo marca como terminado.
const ESTADOS_PERMITIDOS_ORGANIZADOR = new Set(["borrador", "en_revision", "finalizado"]);

function bloquearEstadoNoPermitido(payload: Record<string, unknown>) {
  if ("estado" in payload && !ESTADOS_PERMITIDOS_ORGANIZADOR.has(String(payload.estado))) {
    return NextResponse.json({ error: "Ese cambio de estado lo tiene que hacer Juol al aprobar el torneo." }, { status: 403 });
  }
  return null;
}

export async function POST(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const body = await request.json();
  const payload: Record<string, unknown> = sanitizeTorneo(body);
  const bloqueo = bloquearEstadoNoPermitido(payload);
  if (bloqueo) return bloqueo;
  payload.torneo_organizador_id = ctx.torneoOrganizadorId;
  if (!payload.nombre || !payload.inicio_at || !payload.cupo_equipos) {
    return NextResponse.json({ error: "Faltan nombre, inicio_at o cupo_equipos." }, { status: 400 });
  }
  const { data, error } = await ctx.supabase.from("torneos").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ torneo: data });
}

export async function PATCH(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const payload = sanitizeTorneo(body);
  const bloqueo = bloquearEstadoNoPermitido(payload);
  if (bloqueo) return bloqueo;
  // Al reenviar a revisión (o volver a borrador para seguir editando) se limpia
  // el motivo de rechazo anterior, si había uno.
  if (payload.estado === "en_revision" || payload.estado === "borrador") payload.motivo_rechazo = null;

  if ("formato" in payload) {
    const { data: actual } = await ctx.supabase.from("torneos").select("fixture_generado_at").eq("id", id).maybeSingle();
    if (actual?.fixture_generado_at) {
      return NextResponse.json({ error: "No se puede cambiar el formato de un torneo que ya tiene el fixture generado." }, { status: 400 });
    }
  }

  // .eq('torneo_organizador_id', ...) además de .eq('id', ...): si el id no es
  // suyo, el update no matchea ninguna fila (0 filas) en vez de tocar un torneo ajeno.
  const { data, error } = await ctx.supabase
    .from("torneos")
    .update(payload)
    .eq("id", id)
    .eq("torneo_organizador_id", ctx.torneoOrganizadorId)
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Torneo no encontrado." }, { status: 404 });
  return NextResponse.json({ torneo: data });
}
