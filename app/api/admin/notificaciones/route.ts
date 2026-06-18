import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

  const body = await request.json();
  const { titulo, cuerpo, partido_id } = body as { titulo?: string; cuerpo?: string; partido_id?: string };

  if (!titulo?.trim() || !cuerpo?.trim()) {
    return NextResponse.json({ error: "Título y cuerpo son requeridos." }, { status: 400 });
  }

  const { data: users, error } = await admin.supabase
    .from("users")
    .select("expo_push_token")
    .not("expo_push_token", "is", null)
    .neq("expo_push_token", "");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tokens: string[] = (users ?? [])
    .map((u: { expo_push_token: string | null }) => u.expo_push_token)
    .filter((t): t is string => !!t && t.startsWith("ExponentPushToken"));

  if (!tokens.length) return NextResponse.json({ enviados: 0 });

  const data: Record<string, string> = {};
  if (partido_id?.trim()) data.partido_id = partido_id.trim();

  let enviados = 0;
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE).map((to) => ({
      to,
      title: titulo.trim(),
      body: cuerpo.trim(),
      data,
      sound: "default",
    }));
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(batch),
    }).catch(() => {});
    enviados += batch.length;
  }

  return NextResponse.json({ enviados });
}
