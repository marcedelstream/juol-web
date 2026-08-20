// Invoca una Supabase Edge Function desde código server-side (Next.js API
// routes), con el service-role key como bearer. Equivalente a
// supabase.functions.invoke() del cliente JS, que no está disponible con el
// service-role client de adminAuth.ts. No revienta el caller si falla — las
// notificaciones son best-effort, no deben bloquear la acción admin.
export async function invokeEdgeFunction(name: string, body: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  try {
    await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // best-effort — no propagar el error a la acción admin que disparó esto
  }
}
