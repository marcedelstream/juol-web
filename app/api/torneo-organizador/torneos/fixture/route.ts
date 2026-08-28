import { NextResponse } from "next/server";
import { assertPartidoDeOrganizador, assertTorneoDeOrganizador, isTorneoOrganizadorContext, requireTorneoOrganizador } from "@/lib/torneoOrganizadorAuth";
import { invokeEdgeFunction } from "@/lib/invokeEdgeFunction";

export async function GET(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const url = new URL(request.url);
  const torneoId = url.searchParams.get("torneo_id");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });
  const ownErr = await assertTorneoDeOrganizador(ctx.supabase, torneoId, ctx.torneoOrganizadorId);
  if (ownErr) return ownErr;

  const { data, error } = await ctx.supabase.from("torneo_partidos").select("*").eq("torneo_id", torneoId).order("orden");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partidos: data || [] });
}

export async function POST(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const body = await request.json();
  const torneoId = String(body.torneo_id || "");
  if (!torneoId) return NextResponse.json({ error: "Falta torneo_id." }, { status: 400 });
  const ownErr = await assertTorneoDeOrganizador(ctx.supabase, torneoId, ctx.torneoOrganizadorId);
  if (ownErr) return ownErr;

  if (action === "poblar_llave") {
    const { error } = await ctx.supabase.rpc("poblar_llave_torneo", { p_torneo_id: torneoId, p_force: !!body.force });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await ctx.supabase.rpc("generar_fixture_torneo", { p_torneo_id: torneoId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invokeEdgeFunction("notificar-torneo-fixture-publicado", { torneo_id: torneoId });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;
  const body = await request.json();
  const id = String(body.partido_id || "");
  if (!id) return NextResponse.json({ error: "Falta partido_id." }, { status: 400 });
  const ownErr = await assertPartidoDeOrganizador(ctx.supabase, id, ctx.torneoOrganizadorId);
  if (ownErr) return ownErr;

  const payload: Record<string, unknown> = {};
  for (const field of ["goles_local", "goles_visitante", "penales_local", "penales_visitante", "estado", "equipo_local_id", "equipo_visitante_id"]) {
    if (field in body) payload[field] = body[field];
  }
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar." }, { status: 400 });
  }

  const { data, error } = await ctx.supabase.from("torneo_partidos").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partido: data });
}
