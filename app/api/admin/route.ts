import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

function countValue(result: { count: number | null }) {
  return result.count || 0;
}

function groupConfirmaciones(rows: { partido_id: string; estado: string }[]) {
  const map = new Map<string, { confirmados: number; cancelados: number }>();
  for (const row of rows) {
    const current = map.get(row.partido_id) || { confirmados: 0, cancelados: 0 };
    if (row.estado === "confirmado") current.confirmados += 1;
    if (row.estado === "cancelado") current.cancelados += 1;
    map.set(row.partido_id, current);
  }
  return Object.fromEntries(map);
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { supabase } = admin;

  const [usersCount, partidosCount, partidosActivosCount, confirmadosCount, reportesCount, soporteCount, contactoCount, users, partidos, confirmaciones, reportes, soporte, contacto, proInteresados, proWaitlist, banners, promociones, statsOrg] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("partidos").select("id", { count: "exact", head: true }),
    supabase.from("partidos").select("id", { count: "exact", head: true }).in("estado", ["activo", "completo"]),
    supabase.from("confirmaciones").select("id", { count: "exact", head: true }).eq("estado", "confirmado"),
    supabase.from("reportes").select("id", { count: "exact", head: true }),
    supabase.from("soporte").select("id", { count: "exact", head: true }),
    supabase.from("contacto_comercial").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id,nombre,edad,fecha_nacimiento,genero,telefono,profesion,radio_km,disponible_ahora,created_at,ultima_ubicacion_at").order("created_at", { ascending: false }).limit(80),
    supabase.from("partidos").select("id,direccion_texto,hora_partido,jugadores_necesarios,cupo_jugadores,estado,privacidad,codigo_invitacion,patrocinado,marca,created_at,convocante:users(nombre,telefono)").order("hora_partido", { ascending: false }).limit(100),
    supabase.from("confirmaciones").select("partido_id,estado"),
    supabase.from("reportes").select("id,partido_id,reportado_por,motivo,detalle,created_at,usuario:users(nombre,telefono)").order("created_at", { ascending: false }).limit(50),
    supabase.from("soporte").select("id,usuario_id,email,asunto,mensaje,created_at,usuario:users(nombre,telefono)").order("created_at", { ascending: false }).limit(50),
    supabase.from("contacto_comercial").select("id,tipo,nombre,email,mensaje,created_at,usuario:users(id,nombre,telefono,profesion,genero)").order("created_at", { ascending: false }).limit(50),
    supabase.from("pro_interesados").select("id,usuario_id,email,created_at,usuario:users(nombre,telefono)").order("created_at", { ascending: false }).limit(80),
    supabase.from("pro_waitlist_web").select("id,email,created_at").order("created_at", { ascending: false }).limit(80),
    supabase.from("banners").select("*").order("orden", { ascending: true }),
    supabase.from("promociones").select("*").order("orden", { ascending: true }),
    supabase.rpc("stats_organizadores"),
  ]);

  const failed = [users, partidos, confirmaciones, reportes, soporte, contacto, proInteresados, proWaitlist, banners].find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });

  return NextResponse.json({
    metrics: {
      users: countValue(usersCount),
      partidos: countValue(partidosCount),
      partidosActivos: countValue(partidosActivosCount),
      confirmados: countValue(confirmadosCount),
      reportes: countValue(reportesCount),
      soporte: countValue(soporteCount),
      contacto: countValue(contactoCount),
      proLeads: (proInteresados.data?.length || 0) + (proWaitlist.data?.length || 0),
    },
    users: users.data || [],
    partidos: partidos.data || [],
    confirmacionesPorPartido: groupConfirmaciones(confirmaciones.data || []),
    reportes: reportes.data || [],
    soporte: soporte.data || [],
    contacto: contacto.data || [],
    proInteresados: proInteresados.data || [],
    proWaitlist: proWaitlist.data || [],
    banners: banners.data || [],
    promociones: promociones.data || [],
    statsOrganizadores: statsOrg.data || [],
  });
}
