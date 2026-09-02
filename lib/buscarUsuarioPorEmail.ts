const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Busca una cuenta de JUOL por email vía la API admin de GoTrue (auth.users no
 * está expuesto por PostgREST). El query param `email` de este endpoint NO
 * filtra server-side en esta versión de GoTrue — lo ignora en silencio y
 * devuelve la primera página completa sin filtrar (confirmado a mano contra
 * la API). Por eso hay que recorrer las páginas y filtrar acá, con un
 * per_page grande para que sean pocas vueltas incluso con miles de usuarios.
 */
export async function buscarUsuarioPorEmail(email: string): Promise<{ id: string; email: string } | null> {
  if (!supabaseUrl || !serviceRoleKey) return null;
  const target = email.trim().toLowerCase();
  if (!target) return null;

  const perPage = 1000;
  for (let page = 1; page <= 50; page++) { // tope de seguridad: 50 * 1000 = 50.000 usuarios
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const users = Array.isArray(json.users) ? json.users : Array.isArray(json) ? json : [];
    const match = users.find((u: any) => (u.email || "").toLowerCase() === target);
    if (match) return { id: match.id, email: match.email };
    if (users.length < perPage) return null; // última página, no estaba
  }
  return null;
}
