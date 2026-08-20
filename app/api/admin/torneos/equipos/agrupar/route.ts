import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const torneoId = String(body.torneo_id || "");
  const nombre = String(body.nombre || "").trim();
  const agenteLibreIds: string[] = Array.isArray(body.agente_libre_ids) ? body.agente_libre_ids : [];

  if (!torneoId || !nombre || agenteLibreIds.length === 0) {
    return NextResponse.json({ error: "Faltan torneo_id, nombre o agente_libre_ids." }, { status: 400 });
  }

  const { data, error } = await admin.supabase.rpc("admin_agrupar_agentes_libres", {
    p_torneo_id: torneoId,
    p_nombre: nombre,
    p_agente_libre_ids: agenteLibreIds,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ equipo_id: data });
}
