import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  const es_pro = body.es_pro;
  if (!id || typeof es_pro !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const { data, error } = await admin.supabase
    .from("users")
    .update({ es_pro, es_pro_desde: es_pro ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id, es_pro")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
