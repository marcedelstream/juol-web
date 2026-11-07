import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

// Partidos de marca para el encargado del QR de entrada (migración 049).
// Sin ?partido= devuelve la lista; con ?partido= devuelve el QR vigente,
// que cambia cada 30 segundos, y cuántas entradas se marcaron.
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { supabase } = admin;

  const partidoId = new URL(request.url).searchParams.get("partido");

  if (!partidoId) {
    const desde = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("partidos")
      .select("id, direccion_texto, hora_partido, marca, estado, precio_cancha")
      .eq("patrocinado", true)
      .in("estado", ["activo", "completo", "finalizado"])
      .gte("hora_partido", desde)
      .order("hora_partido", { ascending: true })
      .limit(30);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ partidos: data ?? [] });
  }

  const [{ data: partido }, codigo, cupones, confirmados] = await Promise.all([
    supabase.from("partidos").select("id, direccion_texto, hora_partido, marca, precio_cancha").eq("id", partidoId).maybeSingle(),
    supabase.rpc("codigo_entrada_actual", { p_partido_id: partidoId }),
    supabase.from("cupones").select("monto").eq("partido_id", partidoId),
    supabase.from("confirmaciones").select("id", { count: "exact", head: true }).eq("partido_id", partidoId).eq("estado", "confirmado"),
  ]);

  if (!partido) return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  if (codigo.error || !codigo.data) {
    return NextResponse.json({ error: "No se pudo generar el QR. ¿Está aplicada la migración 049?" }, { status: 500 });
  }

  const { codigo: texto, vence_en } = codigo.data as { codigo: string; vence_en: number };
  const svg = await QRCode.toString(`JUOL-${texto}`, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#111827", light: "#FFFFFF" } });
  const filas = cupones.data ?? [];

  return NextResponse.json({
    partido,
    codigo: texto,
    vence_en,
    svg,
    entradas: filas.length,
    confirmados: confirmados.count ?? 0,
    cobrado: filas.reduce((suma, c) => suma + (c.monto ?? 0), 0),
  });
}
