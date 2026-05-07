import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export type AdminContext = {
  supabase: SupabaseClient;
  email: string;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export async function requireAdmin(request: Request): Promise<AdminContext | NextResponse> {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor." },
      { status: 500 },
    );
  }

  if (adminEmails.length === 0) {
    return NextResponse.json({ error: "Falta configurar ADMIN_EMAILS en el servidor." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";

  if (error || !email || !adminEmails.includes(email)) {
    return NextResponse.json({ error: "No tenés permiso para ingresar al admin." }, { status: 403 });
  }

  return { supabase, email };
}

export function isAdminContext(value: AdminContext | NextResponse): value is AdminContext {
  return !(value instanceof NextResponse);
}

