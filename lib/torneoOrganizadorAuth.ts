import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type TorneoOrganizadorContext = {
  supabase: SupabaseClient;
  userId: string;
  torneoOrganizadorId: string;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export async function requireTorneoOrganizador(request: Request): Promise<TorneoOrganizadorContext | NextResponse> {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });

  const { data: vinculo, error: vinculoError } = await supabase
    .from("torneo_organizador_usuarios")
    .select("torneo_organizador_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (vinculoError) return NextResponse.json({ error: vinculoError.message }, { status: 500 });
  if (!vinculo) return NextResponse.json({ error: "No tenés un torneo asignado para administrar." }, { status: 403 });

  return { supabase, userId: userData.user.id, torneoOrganizadorId: vinculo.torneo_organizador_id };
}

export function isTorneoOrganizadorContext(
  value: TorneoOrganizadorContext | NextResponse,
): value is TorneoOrganizadorContext {
  return !(value instanceof NextResponse);
}

/**
 * Valida que `torneoId` pertenezca al organizador del contexto ANTES de cualquier
 * mutación indirecta (equipo/partido por id, goleador por torneo_id). Las rutas
 * admin equivalentes no hacen este chequeo porque el founder puede tocar
 * cualquier torneo — acá es obligatorio, así que se centraliza en un solo lugar
 * en vez de reimplementarlo (o de olvidarlo) en cada endpoint nuevo.
 */
export async function assertTorneoDeOrganizador(
  supabase: SupabaseClient,
  torneoId: string,
  torneoOrganizadorId: string,
): Promise<NextResponse | null> {
  const { data, error } = await supabase
    .from("torneos")
    .select("id")
    .eq("id", torneoId)
    .eq("torneo_organizador_id", torneoOrganizadorId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Torneo no encontrado." }, { status: 404 });
  return null;
}

/** Mismo chequeo que assertTorneoDeOrganizador, pero partiendo de un equipo_id. */
export async function assertEquipoDeOrganizador(
  supabase: SupabaseClient,
  equipoId: string,
  torneoOrganizadorId: string,
): Promise<NextResponse | null> {
  const { data, error } = await supabase
    .from("torneo_equipos")
    .select("id, torneos!inner(torneo_organizador_id)")
    .eq("id", equipoId)
    .eq("torneos.torneo_organizador_id", torneoOrganizadorId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Equipo no encontrado." }, { status: 404 });
  return null;
}

/** Mismo chequeo, partiendo de un partido de fixture (torneo_partidos). */
export async function assertPartidoDeOrganizador(
  supabase: SupabaseClient,
  partidoId: string,
  torneoOrganizadorId: string,
): Promise<NextResponse | null> {
  const { data, error } = await supabase
    .from("torneo_partidos")
    .select("id, torneos!inner(torneo_organizador_id)")
    .eq("id", partidoId)
    .eq("torneos.torneo_organizador_id", torneoOrganizadorId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  return null;
}
