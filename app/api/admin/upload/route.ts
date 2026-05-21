import { NextResponse } from "next/server";
import { isAdminContext, requireAdmin } from "@/lib/adminAuth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminContext(admin)) return admin;

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

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `beneficios/${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error } = await admin.supabase.storage
    .from("banners")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.supabase.storage.from("banners").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
