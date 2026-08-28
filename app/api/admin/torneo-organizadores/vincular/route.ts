import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";
import { buscarUsuarioPorEmail } from "@/lib/buscarUsuarioPorEmail";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const torneoOrganizadorId = String(body.torneo_organizador_id || "");
  const email = String(body.email || "").trim();
  if (!torneoOrganizadorId || !email) {
    return NextResponse.json({ error: "Faltan torneo_organizador_id o email." }, { status: 400 });
  }

  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) {
    return NextResponse.json({ error: "No hay ninguna cuenta de JUOL con ese email. Pedile que se registre en la app primero." }, { status: 404 });
  }

  const { data, error } = await admin.supabase
    .from("torneo_organizador_usuarios")
    .upsert({ torneo_organizador_id: torneoOrganizadorId, user_id: usuario.id }, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vinculo: data });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id") || "";
  if (!userId) return NextResponse.json({ error: "Falta user_id." }, { status: 400 });
  const { error } = await admin.supabase.from("torneo_organizador_usuarios").delete().eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
