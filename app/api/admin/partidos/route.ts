import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const validStates = new Set(["activo", "completo", "cancelado", "finalizado", "abandonado"]);
const validTipos = new Set(["normal", "torneo", "empresa", "versus", "tematico", "especial"]);

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const { direccion_texto, hora_partido, cupo_jugadores, descripcion, precio_cancha, tipo } = body;

  if (!direccion_texto || !hora_partido || !tipo || !validTipos.has(tipo)) {
    return NextResponse.json({ error: "Dirección, hora y tipo son requeridos." }, { status: 400 });
  }

  await admin.supabase.from("users").upsert(
    {
      id: admin.userId,
      nombre: "Juol Oficial",
      disponibilidad: { siempre: true },
      radio_km: 30,
      expo_push_token: null,
      ultima_ubicacion_at: null,
      edad: null,
      avatar_url: null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  const { data: partido, error } = await admin.supabase
    .from("partidos")
    .insert({
      convocante_id: admin.userId,
      direccion_texto,
      hora_partido,
      descripcion: descripcion || null,
      cupo_jugadores: cupo_jugadores ? Number(cupo_jugadores) : null,
      precio_cancha: precio_cancha ? Number(precio_cancha) : null,
      tipo,
      estado: "activo",
      privacidad: "publico",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  fetch(`${supabaseUrl}/functions/v1/notificar-partido`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ partido_id: partido.id }),
  }).catch(() => {});

  return NextResponse.json({ partido });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  const estado = String(body.estado || "");
  if (!id || !validStates.has(estado)) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  const { data, error } = await admin.supabase.from("partidos").update({ estado }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partido: data });
}
