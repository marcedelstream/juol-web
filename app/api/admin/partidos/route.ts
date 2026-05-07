import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const validStates = new Set(["activo", "completo", "cancelado", "finalizado", "abandonado"]);

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
