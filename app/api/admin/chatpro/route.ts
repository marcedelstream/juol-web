import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const usuario_id = String(body.usuario_id || "");
  const contenido = String(body.contenido || "").trim();
  if (!usuario_id || !contenido) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { data: mensaje, error } = await admin.supabase
    .from("chat_pro_mensajes")
    .insert({ usuario_id, autor_id: admin.userId, es_founder: true, contenido })
    .select("id,usuario_id,autor_id,es_founder,contenido,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: user } = await admin.supabase
    .from("users")
    .select("expo_push_token")
    .eq("id", usuario_id)
    .single();

  if (user?.expo_push_token?.startsWith("ExponentPushToken")) {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: user.expo_push_token,
        title: "Juolista PRO",
        body: contenido,
        data: { tipo: "chat_pro" },
        sound: "default",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ mensaje });
}
