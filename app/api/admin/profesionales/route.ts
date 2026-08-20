import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const validEstados = new Set(["pendiente", "aprobado", "rechazado"]);

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { data, error } = await admin.supabase
    .from("profesionales")
    .select("*, user:users(nombre, apellido, telefono)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profesionales: data || [] });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const id = String(body.id || "");
  const estado = String(body.estado || "");
  if (!id || !validEstados.has(estado)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("profesionales")
    .update({ estado })
    .eq("id", id)
    .select("*, user:users(nombre, apellido, telefono)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profesional: data });
}
