import { NextResponse } from "next/server";
import { assertTorneoDeOrganizador, assertEquipoDeOrganizador, isTorneoOrganizadorContext, requireTorneoOrganizador } from "@/lib/torneoOrganizadorAuth";
import { buscarUsuarioPorEmail } from "@/lib/buscarUsuarioPorEmail";
import { invokeEdgeFunction } from "@/lib/invokeEdgeFunction";

export async function GET(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const url = new URL(request.url);
  const torneoId = url.searchParams.get("torneo_id");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });

  const ownErr = await assertTorneoDeOrganizador(ctx.supabase, torneoId, ctx.torneoOrganizadorId);
  if (ownErr) return ownErr;

  const [equiposRes, rosterRes, agentesRes, invitacionesRes] = await Promise.all([
    ctx.supabase.from("torneo_equipos").select("*").eq("torneo_id", torneoId).order("created_at"),
    ctx.supabase.from("torneo_equipo_jugadores").select("*, user:users(nombre, apellido)").in(
      "equipo_id",
      (await ctx.supabase.from("torneo_equipos").select("id").eq("torneo_id", torneoId)).data?.map((e: any) => e.id) || [],
    ),
    ctx.supabase.from("torneo_agentes_libres").select("*, user:users(nombre, apellido)").eq("torneo_id", torneoId).eq("estado", "disponible"),
    ctx.supabase.from("torneo_invitaciones").select("*").eq("torneo_id", torneoId).order("created_at", { ascending: false }),
  ]);

  if (equiposRes.error) return NextResponse.json({ error: equiposRes.error.message }, { status: 500 });

  return NextResponse.json({
    equipos: equiposRes.data || [],
    roster: rosterRes.data || [],
    agentesLibres: agentesRes.data || [],
    invitaciones: invitacionesRes.data || [],
  });
}

/**
 * POST admite dos acciones (via body.accion), ambas parte del flujo de carga
 * "de buena fe" del organizador:
 * - crear_equipo: { accion, torneo_id, nombre } — equipo con origen='torneo_organizador'.
 * - agregar_jugador: { accion, equipo_id, nombre, telefono?, email? } —
 *   si `email` resuelve a una cuenta real de JUOL, se crea una INVITACIÓN
 *   (torneo_invitaciones) en vez de linkear user_id directo — el jugador
 *   tiene que aceptarla desde la app, igual que el flujo self-serve, para no
 *   insertar a alguien en un roster público sin su consentimiento. Sin email,
 *   o si no hay cuenta, se carga como invitado (nombre_invitado/telefono_invitado).
 */
export async function POST(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const body = await request.json();
  const accion = String(body.accion || "");

  if (accion === "crear_equipo") {
    const torneoId = String(body.torneo_id || "");
    const nombre = String(body.nombre || "").trim();
    if (!torneoId || !nombre) return NextResponse.json({ error: "Faltan torneo_id o nombre." }, { status: 400 });
    const ownErr = await assertTorneoDeOrganizador(ctx.supabase, torneoId, ctx.torneoOrganizadorId);
    if (ownErr) return ownErr;

    const { data, error } = await ctx.supabase
      .from("torneo_equipos")
      .insert({ torneo_id: torneoId, nombre, origen: "torneo_organizador", estado: "inscripcion" })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ equipo: data });
  }

  if (accion === "agregar_jugador") {
    const equipoId = String(body.equipo_id || "");
    const nombre = String(body.nombre || "").trim();
    const telefono = body.telefono ? String(body.telefono).trim() : null;
    const email = body.email ? String(body.email).trim() : "";
    if (!equipoId || !nombre) return NextResponse.json({ error: "Faltan equipo_id o nombre." }, { status: 400 });
    const ownErr = await assertEquipoDeOrganizador(ctx.supabase, equipoId, ctx.torneoOrganizadorId);
    if (ownErr) return ownErr;

    if (email) {
      const usuario = await buscarUsuarioPorEmail(email);
      if (usuario) {
        const { data: equipo } = await ctx.supabase.from("torneo_equipos").select("torneo_id").eq("id", equipoId).single();
        const { data: invitacion, error } = await ctx.supabase
          .from("torneo_invitaciones")
          .insert({ equipo_id: equipoId, torneo_id: equipo?.torneo_id, email: usuario.email, invitado_por: ctx.userId })
          .select("id")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        invokeEdgeFunction("notificar-torneo-invitacion", { invitacion_id: invitacion.id });
        return NextResponse.json({ tipo: "invitacion", invitacion });
      }
      // No hay cuenta de JUOL con ese email todavía: cae al flujo de invitado
      // de abajo (se carga con el nombre/teléfono provistos).
    }

    const { data, error } = await ctx.supabase
      .from("torneo_equipo_jugadores")
      .insert({ equipo_id: equipoId, rol: "jugador", nombre_invitado: nombre, telefono_invitado: telefono })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tipo: "invitado", jugador: data });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const { searchParams } = new URL(request.url);
  const jugadorId = searchParams.get("jugador_id") || "";
  if (!jugadorId) return NextResponse.json({ error: "Falta jugador_id." }, { status: 400 });

  const { data: fila } = await ctx.supabase.from("torneo_equipo_jugadores").select("equipo_id").eq("id", jugadorId).maybeSingle();
  if (!fila) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  const ownErr = await assertEquipoDeOrganizador(ctx.supabase, fila.equipo_id, ctx.torneoOrganizadorId);
  if (ownErr) return ownErr;

  const { error } = await ctx.supabase.from("torneo_equipo_jugadores").delete().eq("id", jugadorId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
