import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const fields = [
  "nombre", "slug", "logo_url", "descripcion", "ciudades", "contacto_telefono", "contacto_email",
  "redes_sociales", "estado", "plan", "precio_mensual", "suscripcion_inicio", "notas_internas",
];

function sanitize(input: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in input) payload[field] = input[field] === "" ? null : input[field];
  }
  if ("precio_mensual" in payload && payload.precio_mensual != null) payload.precio_mensual = Number(payload.precio_mensual);
  return payload;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { data: organizadores, error } = await admin.supabase.from("torneo_organizadores").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: vinculos } = await admin.supabase
    .from("torneo_organizador_usuarios")
    .select("torneo_organizador_id, user_id, rol, user:users(nombre, apellido)");

  return NextResponse.json({
    organizadores: (organizadores || []).map((o: any) => ({
      ...o,
      usuarios: (vinculos || []).filter((v: any) => v.torneo_organizador_id === o.id),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const payload = sanitize(body);
  if (!payload.nombre) return NextResponse.json({ error: "Falta nombre." }, { status: 400 });
  const { data, error } = await admin.supabase.from("torneo_organizadores").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ organizador: data });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const payload = sanitize(body);
  const { data, error } = await admin.supabase.from("torneo_organizadores").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ organizador: data });
}
