import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { data, error } = await admin.supabase
    .from("contrario_reportes")
    .select("*, match:contrario_matches(fecha_hora, cancha_texto), reportante:users(nombre, apellido, telefono)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reportes: data || [] });
}
