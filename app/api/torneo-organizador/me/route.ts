import { NextResponse } from "next/server";
import { isTorneoOrganizadorContext, requireTorneoOrganizador } from "@/lib/torneoOrganizadorAuth";

export async function GET(request: Request) {
  const ctx = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(ctx)) return ctx;

  const { data, error } = await ctx.supabase
    .from("torneo_organizadores")
    .select("id, nombre, slug, logo_url, descripcion, ciudades")
    .eq("id", ctx.torneoOrganizadorId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ organizador: data });
}
