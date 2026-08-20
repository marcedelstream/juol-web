import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const [equiposRes, desafiosRes, matchesRes] = await Promise.all([
    admin.supabase
      .from("contrario_equipos")
      .select("*, capitan:users(nombre, apellido, telefono)")
      .order("created_at", { ascending: false })
      .limit(200),
    admin.supabase
      .from("contrario_desafios")
      .select("*, equipo:contrario_equipos(nombre, ciudad)")
      .order("created_at", { ascending: false })
      .limit(200),
    admin.supabase
      .from("contrario_matches")
      .select("*, desafio:contrario_desafios(equipo_id)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (equiposRes.error) return NextResponse.json({ error: equiposRes.error.message }, { status: 500 });
  if (desafiosRes.error) return NextResponse.json({ error: desafiosRes.error.message }, { status: 500 });
  if (matchesRes.error) return NextResponse.json({ error: matchesRes.error.message }, { status: 500 });

  return NextResponse.json({
    equipos: equiposRes.data || [],
    desafios: desafiosRes.data || [],
    matches: matchesRes.data || [],
  });
}
