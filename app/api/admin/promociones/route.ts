import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  if (!body.titulo?.trim()) {
    return NextResponse.json({ error: "El título es requerido." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("promociones")
    .insert({
      titulo: body.titulo.trim(),
      descripcion: body.descripcion || null,
      imagen_url: body.imagen_url || null,
      direccion_texto: body.direccion_texto || null,
      lat: body.lat ? Number(body.lat) : null,
      lng: body.lng ? Number(body.lng) : null,
      precio: body.precio || null,
      activa: body.activa ?? true,
      orden: body.orden ? Number(body.orden) : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promocion: data });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (fields.titulo !== undefined) update.titulo = fields.titulo;
  if (fields.descripcion !== undefined) update.descripcion = fields.descripcion || null;
  if (fields.imagen_url !== undefined) update.imagen_url = fields.imagen_url || null;
  if (fields.direccion_texto !== undefined) update.direccion_texto = fields.direccion_texto || null;
  if (fields.lat !== undefined) update.lat = fields.lat ? Number(fields.lat) : null;
  if (fields.lng !== undefined) update.lng = fields.lng ? Number(fields.lng) : null;
  if (fields.precio !== undefined) update.precio = fields.precio || null;
  if (fields.activa !== undefined) update.activa = fields.activa;
  if (fields.orden !== undefined) update.orden = Number(fields.orden) || 0;

  const { data, error } = await admin.supabase
    .from("promociones")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promocion: data });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

  const { error } = await admin.supabase.from("promociones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
