import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const { supabase } = admin;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const q = (url.searchParams.get("q") || "").trim();

  if (id) {
    const [userRes, authRes, partidosRes, confirmacionesRes, reportesRes, soporteRes, contactoRes, chatProRes, proInteresadoRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", id).single(),
      supabase.auth.admin.getUserById(id),
      supabase.from("partidos").select("id,direccion_texto,hora_partido,estado,privacidad,solo_pro,cupo_jugadores,created_at").eq("convocante_id", id).order("hora_partido", { ascending: false }).limit(50),
      supabase.from("confirmaciones").select("id,estado,created_at,partido:partidos(id,direccion_texto,hora_partido,estado,convocante_id)").eq("jugador_id", id).order("created_at", { ascending: false }).limit(50),
      supabase.from("reportes").select("id,partido_id,motivo,detalle,created_at").eq("reportado_por", id).order("created_at", { ascending: false }).limit(30),
      supabase.from("soporte").select("id,asunto,mensaje,created_at").eq("usuario_id", id).order("created_at", { ascending: false }).limit(30),
      supabase.from("contacto_comercial").select("id,tipo,nombre,email,mensaje,created_at").eq("usuario_id", id).order("created_at", { ascending: false }).limit(30),
      supabase.from("chat_pro_mensajes").select("id,autor_id,es_founder,contenido,created_at").eq("usuario_id", id).order("created_at", { ascending: true }),
      supabase.from("pro_interesados").select("id,email,created_at").eq("usuario_id", id).maybeSingle(),
    ]);

    if (userRes.error) return NextResponse.json({ error: userRes.error.message }, { status: 404 });

    return NextResponse.json({
      user: { ...userRes.data, email: authRes.data?.user?.email || null },
      partidosOrganizados: partidosRes.data || [],
      confirmaciones: confirmacionesRes.data || [],
      reportes: reportesRes.data || [],
      soporte: soporteRes.data || [],
      contacto: contactoRes.data || [],
      chatPro: chatProRes.data || [],
      proInteresado: proInteresadoRes.data || null,
    });
  }

  let users: { id: string; nombre: string; apellido: string | null; telefono: string | null; genero: string | null; es_pro: boolean; created_at: string }[] = [];

  if (q) {
    const term = q.replace(/[%,]/g, "");
    const { data, error } = await supabase
      .from("users")
      .select("id,nombre,apellido,telefono,genero,es_pro,created_at")
      .or(`nombre.ilike.%${term}%,apellido.ilike.%${term}%,telefono.ilike.%${term}%`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users = data || [];

    if (q.includes("@")) {
      const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 200 });
      const matchIds = (authList?.users || [])
        .filter((u) => u.email?.toLowerCase().includes(q.toLowerCase()))
        .map((u) => u.id);
      if (matchIds.length) {
        const existingIds = new Set(users.map((u) => u.id));
        const newIds = matchIds.filter((mid) => !existingIds.has(mid));
        if (newIds.length) {
          const { data: extra } = await supabase
            .from("users")
            .select("id,nombre,apellido,telefono,genero,es_pro,created_at")
            .in("id", newIds);
          users = [...users, ...(extra || [])];
        }
      }
    }
  } else {
    const { data, error } = await supabase
      .from("users")
      .select("id,nombre,apellido,telefono,genero,es_pro,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users = data || [];
  }

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;
  const body = await request.json();
  const id = String(body.id || "");
  const es_pro = body.es_pro;
  if (!id || typeof es_pro !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const { data, error } = await admin.supabase
    .from("users")
    .update({ es_pro, es_pro_desde: es_pro ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id, es_pro")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
