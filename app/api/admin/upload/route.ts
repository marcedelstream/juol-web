import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";
import { isTorneoOrganizadorContext, requireTorneoOrganizador } from "@/lib/torneoOrganizadorAuth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function handleUpload(request: Request, supabase: SupabaseClient) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido." }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Usá JPG, PNG, WEBP o AVIF." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 10MB." }, { status: 400 });
  }

  const allowedFolders = new Set(["beneficios", "promociones", "torneos", "organizadores"]);
  const folderParam = form.get("folder") as string | null;
  const folder = folderParam && allowedFolders.has(folderParam) ? folderParam : "beneficios";
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from("banners").upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}

// El upload en sí no depende de a qué torneo pertenece la imagen (eso lo valida
// quien haga el POST/PATCH del torneo después), así que alcanza con confirmar
// que quien sube el archivo es founder O un torneo_organizador autenticado —
// ambos contextos traen un cliente con service_role.
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (isAdminContext(admin)) return handleUpload(request, admin.supabase);

  const organizador = await requireTorneoOrganizador(request);
  if (!isTorneoOrganizadorContext(organizador)) return organizador;
  return handleUpload(request, organizador.supabase);
}
