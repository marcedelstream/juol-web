const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Busca una cuenta de JUOL por email vía la API admin de GoTrue (auth.users no
 * está expuesto por PostgREST). Siempre filtra el resultado a mano por email
 * exacto (case-insensitive) en vez de confiar ciegamente en el filtro del
 * lado del servidor, por si esa versión de GoTrue lo ignora.
 */
export async function buscarUsuarioPorEmail(email: string): Promise<{ id: string; email: string } | null> {
  if (!supabaseUrl || !serviceRoleKey) return null;
  const target = email.trim().toLowerCase();
  if (!target) return null;

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(target)}`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const users = Array.isArray(json.users) ? json.users : Array.isArray(json) ? json : [];
  const match = users.find((u: any) => (u.email || "").toLowerCase() === target);
  return match ? { id: match.id, email: match.email } : null;
}
