import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const { direccion_texto, hora_partido, cupo_jugadores, lat, lng, marca, descripcion, precio_cancha } = body;

  if (!direccion_texto || !hora_partido || !marca) {
    return NextResponse.json({ error: "Dirección, hora y marca son requeridos." }, { status: 400 });
  }

  const latitud = Number(String(lat ?? "").replace(",", "."));
  const longitud = Number(String(lng ?? "").replace(",", "."));
  if (!lat || !lng || !Number.isFinite(latitud) || !Number.isFinite(longitud) || Math.abs(latitud) > 90 || Math.abs(longitud) > 180) {
    return NextResponse.json({ error: "Latitud y longitud son requeridas (ej. -25.2637 y -57.5759)." }, { status: 400 });
  }

  // Upsert admin as a minimal row in public.users so the FK is satisfied.
  // ignoreDuplicates=true: si ya tiene perfil en la app, no lo pisamos.
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
      lat: latitud,
      lng: longitud,
      // partidos.ubicacion es obligatoria (geography); sin ella el insert falla.
      ubicacion: `POINT(${longitud} ${latitud})`,
      estado: "activo",
      privacidad: "publico",
      patrocinado: true,
      marca,
      // Derecho de cancha que se cobra antes de escanear el QR de entrada.
      precio_cancha: precio_cancha ? Number(precio_cancha) : 20000,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notificar a usuarios cercanos (best-effort)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  fetch(`${supabaseUrl}/functions/v1/notificar-partido`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ partido_id: partido.id }),
  }).catch(() => {});

  return NextResponse.json({ partido });
}
