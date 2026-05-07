import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const allowedTables = new Set(["reportes", "soporte", "contacto_comercial", "pro_waitlist_web", "pro_interesados", "banners", "partidos"]);

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") || "";
  const id = searchParams.get("id") || "";
  const ids = searchParams.get("ids")?.split(",").map((item) => item.trim()).filter(Boolean) || [];
  const targets = ids.length > 0 ? ids : id ? [id] : [];

  if (!allowedTables.has(table) || targets.length === 0) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error } = await admin.supabase.from(table).delete().in("id", targets);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: targets.length });
}
