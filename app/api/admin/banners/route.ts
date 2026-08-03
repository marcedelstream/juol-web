import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const fields = ["titulo", "subtitulo", "color_fondo", "color_texto", "enlace_url", "imagen_url", "descripcion_interna", "ubicacion_publicitaria", "solo_imagen", "orden", "activo"];

function sanitizeBanner(input: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in input) payload[field] = input[field] === "" ? null : input[field];
  }
  payload.ubicacion_publicitaria ||= "secundaria";
  payload.color_fondo ||= "#FD7401";
  payload.color_texto ||= "#FFFFFF";
  payload.orden = Number(payload.orden || 0);
  payload.solo_imagen = Boolean(payload.solo_imagen);
  payload.activo = Boolean(payload.activo);
  return payload;
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const payload = sanitizeBanner(body);
  const { data, error } = await admin.supabase.from("banners").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const payload = sanitizeBanner(body);
  const { data, error } = await admin.supabase.from("banners").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}
