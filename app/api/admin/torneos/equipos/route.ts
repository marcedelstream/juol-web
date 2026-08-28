import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";
import { invokeEdgeFunction } from "@/lib/invokeEdgeFunction";
import { buscarUsuarioPorEmail } from "@/lib/buscarUsuarioPorEmail";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const url = new URL(request.url);
  const torneoId = url.searchParams.get("torneo_id");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });

  const [equiposRes, rosterRes, libresRes, invitacionesRes] = await Promise.all([
    admin.supabase.from("torneo_equipos").select("*").eq("torneo_id", torneoId).order("created_at"),
    admin.supabase.from("torneo_equipo_jugadores").select("*, user:users(nombre, apellido)").in(
      "equipo_id",
      (await admin.supabase.from("torneo_equipos").select("id").eq("torneo_id", torneoId)).data?.map((e: any) => e.id) || []
    ),
    admin.supabase.from("torneo_agentes_libres").select("*, user:users(nombre, apellido)").eq("torneo_id", torneoId).eq("estado", "disponible"),
    admin.supabase.from("torneo_invitaciones").select("*").eq("torneo_id", torneoId).order("created_at", { ascending: false }),
  ]);

  if (equiposRes.error) return NextResponse.json({ error: equiposRes.error.message }, { status: 500 });

  return NextResponse.json({
    equipos: equiposRes.data || [],
    roster: rosterRes.data || [],
    agentesLibres: libresRes.data || [],
    invitaciones: invitacionesRes.data || [],
  });
}

/**
 * Mismo shape que POST /api/torneo-organizador/torneos/equipos (carga manual
 * de equipo + roster "de buena fe"), sin chequeo de propiedad porque el
 * founder puede tocar cualquier torneo.
 */
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const accion = String(body.accion || "");

  if (accion === "crear_equipo") {
    const torneoId = String(body.torneo_id || "");
    const nombre = String(body.nombre || "").trim();
    if (!torneoId || !nombre) return NextResponse.json({ error: "Faltan torneo_id o nombre." }, { status: 400 });
    const { data, error } = await admin.supabase
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

    if (email) {
      const usuario = await buscarUsuarioPorEmail(email);
      if (usuario) {
        const { data: equipo } = await admin.supabase.from("torneo_equipos").select("torneo_id").eq("id", equipoId).single();
        const { data: invitacion, error } = await admin.supabase
          .from("torneo_invitaciones")
          .insert({ equipo_id: equipoId, torneo_id: equipo?.torneo_id, email: usuario.email, invitado_por: admin.userId })
          .select("id")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        invokeEdgeFunction("notificar-torneo-invitacion", { invitacion_id: invitacion.id });
        return NextResponse.json({ tipo: "invitacion", invitacion });
      }
    }

    const { data, error } = await admin.supabase
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
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { searchParams } = new URL(request.url);
  const jugadorId = searchParams.get("jugador_id") || "";
  if (!jugadorId) return NextResponse.json({ error: "Falta jugador_id." }, { status: 400 });
  const { error } = await admin.supabase.from("torneo_equipo_jugadores").delete().eq("id", jugadorId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
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
