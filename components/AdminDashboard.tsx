"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type AnyRow = Record<string, any>;
type Tab = "resumen" | "partidos" | "jugadores" | "beneficios" | "solicitudes" | "reportes" | "patrocinados" | "notificaciones" | "promociones" | "analitica" | "chatpro";

type AdminData = {
  metrics: Record<string, number>;
  users: AnyRow[];
  partidos: AnyRow[];
  confirmacionesPorPartido: Record<string, { confirmados: number; cancelados: number }>;
  reportes: AnyRow[];
  soporte: AnyRow[];
  contacto: AnyRow[];
  proInteresados: AnyRow[];
  proWaitlist: AnyRow[];
  banners: AnyRow[];
  promociones: AnyRow[];
  statsOrganizadores: AnyRow[];
  chatProPorUsuario: Record<string, AnyRow[]>;
};

const emptyBanner = {
  id: "",
  titulo: "",
  subtitulo: "",
  color_fondo: "#FF6B00",
  color_texto: "#FFFFFF",
  enlace_url: "",
  imagen_url: "",
  descripcion_interna: "",
  ubicacion_publicitaria: "secundaria",
  solo_imagen: true,
  orden: 0,
  activo: true,
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChart() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function IconBall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 6.32 17.59" /><path d="m2 12 4-4 4 4 4-4 4 4" /></svg>;
}
function IconUsers() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconTag() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
}
function IconInbox() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}
function IconFlag() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
}
function IconRefresh() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}
function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}

function IconStar() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function IconBell() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconMap() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconTrending() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
function IconChat() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
}
function IconHamburger() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "resumen", label: "Resumen", description: "Métricas generales", icon: <IconChart /> },
  { id: "partidos", label: "Partidos", description: "Seguimiento y limpieza", icon: <IconBall /> },
  { id: "jugadores", label: "Jugadores", description: "Base de usuarios", icon: <IconUsers /> },
  { id: "beneficios", label: "Beneficios", description: "Banners y publicidad", icon: <IconTag /> },
  { id: "solicitudes", label: "Solicitudes", description: "Descubrir, soporte y Pro", icon: <IconInbox /> },
  { id: "reportes", label: "Reportes", description: "Moderación", icon: <IconFlag /> },
  { id: "patrocinados", label: "Patrocinados", description: "Partidos de marca", icon: <IconStar /> },
  { id: "notificaciones", label: "Push", description: "Notificaciones masivas", icon: <IconBell /> },
  { id: "promociones", label: "Promociones", description: "Promociones de canchas", icon: <IconMap /> },
  { id: "analitica", label: "Analítica", description: "Stats de organizadores", icon: <IconTrending /> },
  { id: "chatpro", label: "Chat PRO", description: "Consultas de Juolistas PRO", icon: <IconChat /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-PY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function shortId(id?: string) {
  return id ? `${id.slice(0, 8)}...` : "-";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    activo: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    completo: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    cancelado: "bg-red-50 text-red-600 ring-1 ring-red-200",
    finalizado: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
    abandonado: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return map[estado] || "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bannerForm, setBannerForm] = useState<AnyRow>(emptyBanner);
  const [selectedPartidos, setSelectedPartidos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Patrocinados
  const emptyPat = { direccion_texto: "", hora_partido: "", cupo_jugadores: "", lat: "", lng: "", marca: "", descripcion: "" };
  const [patForm, setPatForm] = useState<AnyRow>(emptyPat);
  const [creandoPat, setCreandoPat] = useState(false);

  // Notificaciones
  const [notifForm, setNotifForm] = useState({ titulo: "", cuerpo: "", partido_id: "" });
  const [enviandoNotif, setEnviandoNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<number | null>(null);

  // Promociones
  const emptyPromo = { id: "", titulo: "", descripcion: "", imagen_url: "", direccion_texto: "", lat: "", lng: "", precio: "", activa: true, orden: 0 };
  const [promoForm, setPromoForm] = useState<AnyRow>(emptyPromo);
  const [uploadingPromo, setUploadingPromo] = useState(false);

  const supabase = useMemo(() => (hasSupabaseEnv() ? createSupabaseClient() : null), []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: sessionData }) => {
      const session = sessionData.session;
      if (session?.access_token) {
        setToken(session.access_token);
        setAdminEmail(session.user.email || null);
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (token) refresh(token);
  }, [token]);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (!supabase) { setMessage("Falta configurar Supabase."); return; }
    setLoading(true);
    setMessage("");
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error || !authData.session) {
      setMessage(error?.message || "No se pudo iniciar sesión.");
      return;
    }
    setToken(authData.session.access_token);
    setAdminEmail(authData.user.email || null);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setToken(null);
    setData(null);
    setAdminEmail(null);
  }

  async function api(path: string, options: RequestInit = {}) {
    if (!token) throw new Error("Sesión requerida.");
    const headers = new Headers(options.headers);
    headers.set("authorization", `Bearer ${token}`);
    if (!(options.body instanceof FormData)) headers.set("content-type", "application/json");
    const res = await fetch(path, { ...options, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "No se pudo completar la operación.");
    return json;
  }

  async function refresh(nextToken = token) {
    if (!nextToken) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin", { headers: { authorization: `Bearer ${nextToken}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo cargar el admin.");
      setData(json);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function updatePartido(id: string, estado: string) {
    try {
      await api("/api/admin/partidos", { method: "PATCH", body: JSON.stringify({ id, estado }) });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function updateUserPro(id: string, es_pro: boolean) {
    try {
      await api("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id, es_pro }) });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function responderChatPro(usuario_id: string, contenido: string) {
    try {
      await api("/api/admin/chatpro", { method: "POST", body: JSON.stringify({ usuario_id, contenido }) });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function deleteSelectedPartidos() {
    if (selectedPartidos.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedPartidos.length} partido(s)? Esta acción borra también confirmaciones relacionadas.`)) return;
    try {
      await api(`/api/admin/delete?table=partidos&ids=${encodeURIComponent(selectedPartidos.join(","))}`, { method: "DELETE" });
      setSelectedPartidos([]);
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function saveBanner(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/banners", {
        method: bannerForm.id ? "PATCH" : "POST",
        body: JSON.stringify(bannerForm),
      });
      setBannerForm(emptyBanner);
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function uploadBannerImage(file?: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const json = await api("/api/admin/upload", { method: "POST", body: form });
      setBannerForm((prev) => ({ ...prev, imagen_url: json.url, solo_imagen: true }));
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setUploading(false); }
  }

  async function uploadPromocionImage(file?: File | null) {
    if (!file) return;
    setUploadingPromo(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "promociones");
      const json = await api("/api/admin/upload", { method: "POST", body: form });
      setPromoForm((prev) => ({ ...prev, imagen_url: json.url }));
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setUploadingPromo(false); }
  }

  async function crearPatrocinado(e: React.FormEvent) {
    e.preventDefault();
    setCreandoPat(true);
    setMessage("");
    try {
      // datetime-local no trae zona horaria; lo interpretamos como hora de Paraguay (UTC-4)
      // para que no se guarde como si fuera UTC y se desfase varias horas.
      const horaParaguay = patForm.hora_partido ? `${patForm.hora_partido}:00-04:00` : patForm.hora_partido;
      await api("/api/admin/patrocinados", {
        method: "POST",
        body: JSON.stringify({ ...patForm, hora_partido: new Date(horaParaguay).toISOString() }),
      });
      setPatForm(emptyPat);
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setCreandoPat(false); }
  }

  async function enviarNotificacion(e: React.FormEvent) {
    e.preventDefault();
    setEnviandoNotif(true);
    setNotifResult(null);
    setMessage("");
    try {
      const json = await api("/api/admin/notificaciones", { method: "POST", body: JSON.stringify(notifForm) });
      setNotifResult(json.enviados);
      setNotifForm({ titulo: "", cuerpo: "", partido_id: "" });
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setEnviandoNotif(false); }
  }

  async function savePromocion(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await api("/api/admin/promociones", {
        method: promoForm.id ? "PATCH" : "POST",
        body: JSON.stringify(promoForm),
      });
      setPromoForm(emptyPromo);
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function deletePromocion(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    try {
      await api(`/api/admin/promociones?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function deleteRow(table: string, id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api(`/api/admin/delete?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  // ─── Login screen ────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-5 py-10 text-zinc-950">
        <section className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center">
          <div className="mb-8 flex items-center gap-2">
            <span className="rounded-lg bg-[#FF6B00] px-2 py-1 text-xs font-black text-white tracking-wider">JUOL</span>
            <span className="text-xs font-semibold text-zinc-400 tracking-wider">ADMIN</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Panel privado</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Ingresá con tu cuenta autorizada para gestionar Juol.</p>
          <form onSubmit={signIn} className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <Input label="Email" value={email} onChange={setEmail} />
            <Input label="Contraseña" type="password" value={password} onChange={setPassword} />
            <button disabled={loading} className="mt-6 h-12 w-full rounded-xl bg-[#FF6B00] text-sm font-black text-white transition hover:bg-[#e05e00] disabled:opacity-60">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            {message && <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  const activeTab = tabs.find((item) => item.id === tab)!;
  const adminInitials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "AD";

  // ─── Main layout ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-zinc-950 lg:grid lg:grid-cols-[260px_1fr]">
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-zinc-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B00]">
                <span className="text-xs font-black text-white">J</span>
              </div>
              <div>
                <p className="text-sm font-black leading-none">juol</p>
                <p className="text-[10px] font-semibold text-zinc-400 leading-none mt-0.5">Admin dashboard</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 border-t border-zinc-100">
            {tabs.map((item) => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  className={`mb-0.5 w-full rounded-xl px-3 py-2.5 text-left transition-all flex items-center gap-3 ${
                    isActive
                      ? "bg-orange-50 text-[#FF6B00] border-l-[3px] border-[#FF6B00] pl-[9px]"
                      : "text-zinc-600 hover:bg-zinc-50 border-l-[3px] border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-[#FF6B00]" : "text-zinc-400"}>{item.icon}</span>
                  <span>
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className={`block text-[11px] ${isActive ? "text-orange-400" : "text-zinc-400"}`}>{item.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="border-t border-zinc-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-600">
                {adminInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-zinc-700">{adminEmail}</p>
                <p className="text-[10px] text-zinc-400">Administrador</p>
              </div>
            </div>
            <button onClick={signOut} className="mt-3 w-full rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <section className="min-w-0">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            {/* Izquierda: logo+nombre en mobile / título de tab en desktop */}
            <div className="flex items-center gap-3">
              {/* Mobile: logo + juol */}
              <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B00]">
                  <span className="text-sm font-black text-white">J</span>
                </div>
                <div className="leading-none">
                  <p className="text-base font-black text-zinc-900">juol</p>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Admin</p>
                </div>
              </div>
              {/* Desktop: tab title */}
              <div className="hidden lg:block">
                <h1 className="text-base font-black leading-tight">{activeTab.label}</h1>
                <p className="text-[11px] font-medium text-zinc-400">{activeTab.description}</p>
              </div>
            </div>

            {/* Derecha: refresh + hamburger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                <IconRefresh />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 transition lg:hidden"
                aria-label="Abrir menú"
              >
                <IconHamburger />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-4 py-6 md:px-6">
          {message && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="text-red-500">⚠</span>
              <p className="text-sm font-semibold text-red-700">{message}</p>
            </div>
          )}
          {loading && !data && (
            <div className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm font-bold text-zinc-400">
              Cargando datos...
            </div>
          )}
          {data && tab === "resumen" && <Resumen data={data} />}
          {data && tab === "partidos" && <Partidos data={data} selected={selectedPartidos} setSelected={setSelectedPartidos} onEstado={updatePartido} onDeleteSelected={deleteSelectedPartidos} />}
          {data && tab === "jugadores" && <Jugadores users={data.users} onTogglePro={updateUserPro} />}
          {data && tab === "beneficios" && <Beneficios banners={data.banners} form={bannerForm} setForm={setBannerForm} onSubmit={saveBanner} onDelete={(id) => deleteRow("banners", id)} onUpload={uploadBannerImage} uploading={uploading} />}
          {data && tab === "solicitudes" && <Solicitudes data={data} onDelete={deleteRow} />}
          {data && tab === "reportes" && <Reportes reportes={data.reportes} onDelete={(id) => deleteRow("reportes", id)} />}
          {tab === "patrocinados" && <Patrocinados partidos={(data?.partidos ?? []).filter((p) => p.patrocinado)} form={patForm} setForm={setPatForm} onSubmit={crearPatrocinado} creando={creandoPat} />}
          {tab === "notificaciones" && <Notificaciones form={notifForm} setForm={setNotifForm} onSubmit={enviarNotificacion} enviando={enviandoNotif} result={notifResult} onClearResult={() => setNotifResult(null)} />}
          {data && tab === "promociones" && <Promociones promociones={data.promociones} form={promoForm} setForm={setPromoForm} onSubmit={savePromocion} onDelete={deletePromocion} onUpload={uploadPromocionImage} uploading={uploadingPromo} />}
          {data && tab === "analitica" && <Analitica stats={data.statsOrganizadores} />}
          {data && tab === "chatpro" && <ChatPro users={data.users} chatProPorUsuario={data.chatProPorUsuario} onResponder={responderChatPro} />}
        </div>
      </section>
    </main>
  );
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

function Resumen({ data }: { data: AdminData }) {
  const metrics = [
    { label: "Jugadores", value: data.metrics.users, color: "border-blue-400", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Partidos", value: data.metrics.partidos, color: "border-[#FF6B00]", bg: "bg-orange-50", text: "text-[#FF6B00]" },
    { label: "Activos", value: data.metrics.partidosActivos, color: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Confirmaciones", value: data.metrics.confirmados, color: "border-teal-400", bg: "bg-teal-50", text: "text-teal-600" },
    { label: "Reportes", value: data.metrics.reportes, color: "border-red-400", bg: "bg-red-50", text: "text-red-600" },
    { label: "Soporte", value: data.metrics.soporte, color: "border-purple-400", bg: "bg-purple-50", text: "text-purple-600" },
    { label: "Inscripciones", value: data.metrics.contacto, color: "border-amber-400", bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Leads Pro", value: data.metrics.proLeads, color: "border-indigo-400", bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, color, bg, text }) => (
        <div key={label} className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm border-l-4 ${color}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${text}`}>{label}</p>
          <p className="mt-2 text-3xl font-black text-zinc-950">{value ?? "-"}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Partidos ─────────────────────────────────────────────────────────────────

function Partidos({ data, selected, setSelected, onEstado, onDeleteSelected }: {
  data: AdminData;
  selected: string[];
  setSelected: (ids: string[]) => void;
  onEstado: (id: string, estado: string) => void;
  onDeleteSelected: () => void;
}) {
  const allVisibleSelected = data.partidos.length > 0 && data.partidos.every((p) => selected.includes(p.id));

  function toggle(id: string) {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }
  function toggleAll() {
    setSelected(allVisibleSelected ? [] : data.partidos.map((p) => p.id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="rounded" />
          Seleccionar todos
        </label>
        <button
          onClick={onDeleteSelected}
          disabled={selected.length === 0}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-30"
        >
          <IconTrash />
          Eliminar seleccionados ({selected.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {data.partidos.map((p, idx) => {
          const conf = data.confirmacionesPorPartido[p.id] || { confirmados: 0, cancelados: 0 };
          return (
            <article key={p.id} className={`grid gap-4 p-4 md:grid-cols-[32px_1fr_auto] md:items-center ${idx !== 0 ? "border-t border-zinc-100" : ""} hover:bg-orange-50/30 transition`}>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="mt-1 md:mt-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge(p.estado)}`}>{p.estado}</span>
                  <span className="text-xs text-zinc-400 font-mono">{shortId(p.id)}</span>
                  <span className="text-xs text-zinc-400">· {p.privacidad || "publico"}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold">{p.direccion_texto || "Sin dirección"}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">{formatDate(p.hora_partido)} · Organiza: {p.convocante?.nombre || "-"}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-600">
                  {conf.confirmados}/{p.jugadores_necesarios || "?"} confirmados
                  {conf.cancelados > 0 && <span className="text-red-500"> · {conf.cancelados} cancelados</span>}
                </p>
              </div>
              <select
                value={p.estado}
                onChange={(e) => onEstado(p.id, e.target.value)}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="activo">activo</option>
                <option value="completo">completo</option>
                <option value="cancelado">cancelado</option>
                <option value="finalizado">finalizado</option>
                <option value="abandonado">abandonado</option>
              </select>
            </article>
          );
        })}
        {data.partidos.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">Sin partidos.</p>
        )}
      </div>
    </div>
  );
}

// ─── Jugadores ────────────────────────────────────────────────────────────────

function Jugadores({ users, onTogglePro }: { users: AnyRow[]; onTogglePro: (id: string, es_pro: boolean) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Jugador</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Género</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Teléfono</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Radio</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Creado</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Última ubicación</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Juolista PRO</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 hover:bg-orange-50/30 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-900">{u.nombre || "Sin nombre"}</p>
                    {u.es_pro && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">PRO</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-zinc-400">{shortId(u.id)}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">{u.genero || "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{u.telefono || "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{u.radio_km || "-"} km</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(u.ultima_ubicacion_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onTogglePro(u.id, !u.es_pro)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      u.es_pro
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {u.es_pro ? "Quitar PRO" : "Hacer PRO"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-400">Sin jugadores.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Chat PRO ─────────────────────────────────────────────────────────────────

function ChatPro({ users, chatProPorUsuario, onResponder }: { users: AnyRow[]; chatProPorUsuario: Record<string, AnyRow[]>; onResponder: (usuario_id: string, contenido: string) => Promise<void> }) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const usersById = new Map(users.map((u) => [u.id, u]));
  const hilos = Object.entries(chatProPorUsuario)
    .map(([usuarioId, mensajes]) => ({
      usuarioId,
      mensajes,
      ultimo: mensajes[mensajes.length - 1],
      usuario: mensajes[mensajes.length - 1]?.usuario || usersById.get(usuarioId),
    }))
    .sort((a, b) => new Date(b.ultimo?.created_at || 0).getTime() - new Date(a.ultimo?.created_at || 0).getTime());

  const hiloActivo = hilos.find((h) => h.usuarioId === seleccionado);

  async function enviar() {
    if (!seleccionado || !respuesta.trim() || enviando) return;
    setEnviando(true);
    await onResponder(seleccionado, respuesta.trim());
    setRespuesta("");
    setEnviando(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-black">Hilos</h2>
          <p className="text-[11px] text-zinc-400">{hilos.length} conversaci{hilos.length !== 1 ? "ones" : "ón"}</p>
        </div>
        <div className="divide-y divide-zinc-100 max-h-[70vh] overflow-y-auto">
          {hilos.map((h) => (
            <button
              key={h.usuarioId}
              onClick={() => setSeleccionado(h.usuarioId)}
              className={`block w-full px-4 py-3 text-left transition hover:bg-orange-50/30 ${seleccionado === h.usuarioId ? "bg-orange-50" : ""}`}
            >
              <p className="text-sm font-bold text-zinc-900">{h.usuario?.nombre || "Jugador"} {h.usuario?.apellido || ""}</p>
              <p className="truncate text-xs text-zinc-500">{h.ultimo?.contenido}</p>
              <p className="text-[10px] text-zinc-400">{formatDate(h.ultimo?.created_at)}</p>
            </button>
          ))}
          {hilos.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">Sin consultas todavía.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
        {!hiloActivo ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-sm text-zinc-400">Elegí un hilo para ver la conversación.</p>
          </div>
        ) : (
          <>
            <div className="border-b border-zinc-100 px-4 py-3">
              <h2 className="text-sm font-black">{hiloActivo.usuario?.nombre || "Jugador"} {hiloActivo.usuario?.apellido || ""}</h2>
              {hiloActivo.usuario?.telefono && (
                <a href={`https://wa.me/${String(hiloActivo.usuario.telefono).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-700 underline-offset-2 hover:underline">
                  {hiloActivo.usuario.telefono}
                </a>
              )}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 max-h-[50vh]">
              {hiloActivo.mensajes.map((m) => (
                <div key={m.id} className={`flex ${m.es_founder ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.es_founder ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-800"}`}>
                    <p>{m.contenido}</p>
                    <p className={`mt-1 text-[10px] ${m.es_founder ? "text-orange-100" : "text-zinc-400"}`}>{formatDate(m.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 px-4 py-3 flex gap-2">
              <input
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
                placeholder="Escribí tu respuesta..."
                className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm focus:border-orange-400 focus:outline-none"
              />
              <button
                onClick={enviar}
                disabled={!respuesta.trim() || enviando}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ─── Beneficios ───────────────────────────────────────────────────────────────

function Beneficios({ banners, form, setForm, onSubmit, onDelete, onUpload, uploading }: {
  banners: AnyRow[];
  form: AnyRow;
  setForm: (row: AnyRow) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: (id: string) => void;
  onUpload: (file?: File | null) => void;
  uploading: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm self-start">
        <h2 className="text-base font-black">{form.id ? "Editar beneficio" : "Nuevo beneficio"}</h2>

        {/* Image upload area */}
        <div className="mt-4">
          <span className="text-xs font-bold text-zinc-500">Imagen</span>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center transition hover:border-[#FF6B00] hover:bg-orange-50/30">
            <span className="text-2xl">🖼</span>
            <span className="mt-1 text-xs font-semibold text-zinc-500">
              {uploading ? "Subiendo..." : "Hacer clic para subir"}
            </span>
            <span className="text-[10px] text-zinc-400">PNG, JPG, WebP</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => onUpload(e.target.files?.[0])} className="hidden" />
          </label>
        </div>

        {form.imagen_url && (
          <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200">
            <img src={form.imagen_url} alt="Preview" className="w-full object-cover" style={{ maxHeight: 160 }} />
          </div>
        )}

        <Input label="Título" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
        <Input label="Subtítulo" value={form.subtitulo} onChange={(v) => setForm({ ...form, subtitulo: v })} />
        <Input label="Imagen URL" value={form.imagen_url} onChange={(v) => setForm({ ...form, imagen_url: v })} />
        <Input label="Enlace URL" value={form.enlace_url} onChange={(v) => setForm({ ...form, enlace_url: v })} />
        <Textarea label="Descripción interna" value={form.descripcion_interna} onChange={(v) => setForm({ ...form, descripcion_interna: v })} />
        <Input label="Orden" type="number" value={form.orden} onChange={(v) => setForm({ ...form, orden: Number(v) })} />

        <label className="mt-4 block text-xs font-bold text-zinc-500">Ubicación</label>
        <select
          value={form.ubicacion_publicitaria}
          onChange={(e) => setForm({ ...form, ubicacion_publicitaria: e.target.value })}
          className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-[#FF6B00] focus:outline-none"
        >
          <option value="principal">principal</option>
          <option value="secundaria">secundaria</option>
        </select>

        <div className="mt-4 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={form.solo_imagen} onChange={(e) => setForm({ ...form, solo_imagen: e.target.checked })} />
            Solo imagen
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button className="flex-1 rounded-xl bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00] transition">Guardar</button>
          <button type="button" onClick={() => setForm(emptyBanner)} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 transition">Limpiar</button>
        </div>
      </form>

      {/* Banner list */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-500">{banners.length} beneficio{banners.length !== 1 ? "s" : ""}</h2>
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {b.imagen_url && (
              <img src={b.imagen_url} alt={b.titulo} className="w-full object-cover" style={{ maxHeight: 100 }} />
            )}
            <div className="flex items-start justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${b.activo ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"}`}>
                    {b.activo ? "activo" : "inactivo"}
                  </span>
                  <span className="text-[11px] text-zinc-400">{b.ubicacion_publicitaria} · orden {b.orden}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold">{b.titulo || "Sin título"}</h3>
                <p className="text-xs text-zinc-500">{b.subtitulo || b.imagen_url || "Sin detalle"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setForm({ ...emptyBanner, ...b })} className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold hover:bg-zinc-50 transition">
                  <IconEdit /> Editar
                </button>
                <button onClick={() => onDelete(b.id)} className="flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition">
                  <IconTrash /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-400">
            Sin beneficios creados.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Solicitudes ──────────────────────────────────────────────────────────────

const DESCUBRIR_TIPOS = ["torneo", "empresa", "versus"];

function Solicitudes({ data, onDelete }: { data: AdminData; onDelete: (table: string, id: string) => void }) {
  const descubrirRows = data.contacto.filter((r: AnyRow) => DESCUBRIR_TIPOS.includes(r.tipo));
  const comercialRows = data.contacto.filter((r: AnyRow) => !DESCUBRIR_TIPOS.includes(r.tipo));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DescubrirList rows={descubrirRows} onDelete={(id) => onDelete("contacto_comercial", id)} />
      <ComercialList rows={comercialRows} onDelete={(id) => onDelete("contacto_comercial", id)} />
      <List title="Soporte" rows={data.soporte} table="soporte" onDelete={onDelete} primary="asunto" secondary="mensaje" />
      <List title="Pro app" rows={data.proInteresados} table="pro_interesados" onDelete={onDelete} primary="email" secondary="usuario.nombre" />
      <List title="Pro web" rows={data.proWaitlist} table="pro_waitlist_web" onDelete={onDelete} primary="email" secondary="created_at" />
    </div>
  );
}

function DescubrirList({ rows, onDelete }: { rows: AnyRow[]; onDelete: (id: string) => void }) {
  const tipoConfig: Record<string, { label: string; color: string }> = {
    torneo:  { label: "Torneos",  color: "bg-teal-50 text-teal-700 ring-1 ring-teal-200" },
    empresa: { label: "Empresas", color: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
    versus:  { label: "Versus",   color: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2">
      <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black">Descubrir — Inscripciones</h2>
          <p className="text-[11px] text-zinc-400">{rows.length} solicitud{rows.length !== 1 ? "es" : ""} de modos Torneos, Empresas y Versus</p>
        </div>
        <div className="flex gap-1.5">
          {Object.entries(tipoConfig).map(([key, cfg]) => (
            <span key={key} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-zinc-400 text-center">Sin inscripciones todavía.</p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {rows.map((row) => {
            const cfg = tipoConfig[row.tipo] ?? { label: row.tipo, color: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200" };
            return (
              <article key={row.id} className="px-4 py-4 hover:bg-orange-50/30 transition">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[11px] text-zinc-400">{formatDate(row.created_at)}</span>
                  </div>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold hover:bg-zinc-50 transition shrink-0"
                    title="Eliminar"
                  >
                    <IconTrash />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Datos del form */}
                  <div className="rounded-lg bg-zinc-50 px-3 py-2.5 space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-zinc-400 mb-2">Contacto</p>
                    {row.nombre && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-12 shrink-0 pt-0.5">Nombre</span>
                        <span className="text-sm font-semibold text-zinc-800">{row.nombre}</span>
                      </div>
                    )}
                    {row.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-12 shrink-0 pt-0.5">Email</span>
                        <a href={`mailto:${row.email}`} className="text-sm font-semibold text-[#FF6B00] underline-offset-2 hover:underline break-all">
                          {row.email}
                        </a>
                      </div>
                    )}
                    {row.mensaje && (
                      <div className="flex items-start gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-12 shrink-0 pt-0.5">Mensaje</span>
                        <p className="text-sm text-zinc-600 leading-5">{row.mensaje}</p>
                      </div>
                    )}
                  </div>

                  {/* Perfil app */}
                  {row.usuario ? (
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600 mb-2">Usuario en la app</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-16 shrink-0">Nombre</span>
                          <span className="text-sm font-bold text-zinc-900">{row.usuario.nombre}</span>
                        </div>
                        {row.usuario.telefono && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-16 shrink-0">WhatsApp</span>
                            <a
                              href={`https://wa.me/${String(row.usuario.telefono).replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
                            >
                              {row.usuario.telefono}
                            </a>
                          </div>
                        )}
                        {row.usuario.profesion && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-16 shrink-0">Profesión</span>
                            <span className="text-sm text-zinc-600 capitalize">{row.usuario.profesion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 flex items-center justify-center">
                      <p className="text-xs text-zinc-400 text-center">Sin cuenta en la app</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ComercialList({ rows, onDelete }: { rows: AnyRow[]; onDelete: (id: string) => void }) {
  const tipoColor: Record<string, string> = {
    publicidad: "bg-orange-50 text-[#FF6B00] ring-1 ring-orange-200",
    cancha: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    sponsor: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black">Comercial</h2>
        <p className="text-[11px] text-zinc-400">{rows.length} solicitud{rows.length !== 1 ? "es" : ""}</p>
      </div>
      <div>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-400">Sin solicitudes comerciales.</p>
        ) : rows.map((row, idx) => (
          <article key={row.id} className={`px-4 py-4 hover:bg-orange-50/30 transition ${idx !== 0 ? "border-t border-zinc-100" : ""}`}>
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {row.tipo && (
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${tipoColor[row.tipo] || "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"}`}>
                    {row.tipo}
                  </span>
                )}
                <span className="text-[11px] text-zinc-400">{formatDate(row.created_at)}</span>
              </div>
              <button
                onClick={() => onDelete(row.id)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold hover:bg-zinc-50 transition shrink-0"
                title="Eliminar"
              >
                <IconTrash />
              </button>
            </div>

            {/* Perfil del usuario de la app (si está vinculado) */}
            {row.usuario && (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-600">Usuario en la app</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-20 shrink-0">Nombre</span>
                    <span className="text-sm font-bold text-zinc-900">{row.usuario.nombre}</span>
                  </div>
                  {row.usuario.telefono && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-20 shrink-0">WhatsApp</span>
                      <a
                        href={`https://wa.me/${String(row.usuario.telefono).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
                      >
                        {row.usuario.telefono}
                      </a>
                    </div>
                  )}
                  {row.usuario.profesion && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-20 shrink-0">Profesión</span>
                      <span className="text-sm text-zinc-600 capitalize">{row.usuario.profesion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Datos del form */}
            <div className="mt-2 rounded-lg bg-zinc-50 px-3 py-2.5 space-y-1.5">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">Datos del formulario</p>
              {row.nombre && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-16 shrink-0">Nombre</span>
                  <span className="text-sm font-semibold text-zinc-700">{row.nombre}</span>
                </div>
              )}
              {row.email && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 w-16 shrink-0">Email</span>
                  <a
                    href={`mailto:${row.email}`}
                    className="text-sm font-semibold text-[#FF6B00] underline-offset-2 hover:underline break-all"
                  >
                    {row.email}
                  </a>
                </div>
              )}
            </div>

            {/* Mensaje */}
            {row.mensaje && (
              <p className="mt-3 text-sm leading-6 text-zinc-600 whitespace-pre-line">{row.mensaje}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

function Reportes({ reportes, onDelete }: { reportes: AnyRow[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {reportes.map((r) => (
        <div key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-200">{r.motivo}</span>
                <span className="text-xs text-zinc-400">{formatDate(r.created_at)}</span>
              </div>
              <p className="mt-1.5 text-sm font-bold">{r.detalle || "Sin detalle"}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                Partido: <span className="font-mono">{shortId(r.partido_id)}</span> · Reporta: {r.usuario?.nombre || shortId(r.reportado_por)}
              </p>
            </div>
            <button
              onClick={() => onDelete(r.id)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition shrink-0"
            >
              <IconTrash /> Eliminar
            </button>
          </div>
        </div>
      ))}
      {reportes.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-400">
          Sin reportes.
        </div>
      )}
    </div>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

function List({ title, rows, table, onDelete, primary, secondary }: {
  title: string;
  rows: AnyRow[];
  table: string;
  onDelete: (table: string, id: string) => void;
  primary: string;
  secondary: string;
}) {
  const get = (row: AnyRow, key: string) => key.split(".").reduce((acc: any, part: string) => acc?.[part], row);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black">{title}</h2>
        <p className="text-[11px] text-zinc-400">{rows.length} registro{rows.length !== 1 ? "s" : ""}</p>
      </div>
      <div>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-400">Sin registros.</p>
        ) : rows.map((row, idx) => (
          <article key={row.id} className={`flex items-start justify-between gap-3 px-4 py-3 hover:bg-orange-50/30 transition ${idx !== 0 ? "border-t border-zinc-100" : ""}`}>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-zinc-400">{formatDate(row.created_at)}</p>
              <p className="text-sm font-bold truncate">{String(get(row, primary) || row.email || row.nombre || "Sin título")}</p>
              <p className="text-xs text-zinc-500 leading-5 line-clamp-2">{String(get(row, secondary) || row.email || "-")}</p>
            </div>
            <button
              onClick={() => onDelete(table, row.id)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold hover:bg-zinc-50 transition shrink-0"
            >
              <IconTrash />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function Input({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

// ─── Patrocinados ─────────────────────────────────────────────────────────────

function Patrocinados({ partidos, form, setForm, onSubmit, creando }: {
  partidos: AnyRow[];
  form: AnyRow;
  setForm: (f: AnyRow) => void;
  onSubmit: (e: React.FormEvent) => void;
  creando: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm self-start">
        <h2 className="text-base font-black">Crear partido patrocinado</h2>
        <p className="mt-1 text-xs text-zinc-400">Se notificará a usuarios cercanos al guardar.</p>
        <Input label="Marca / patrocinador *" value={form.marca} onChange={(v) => setForm({ ...form, marca: v })} />
        <Input label="Dirección *" value={form.direccion_texto} onChange={(v) => setForm({ ...form, direccion_texto: v })} />
        <Input label="Fecha y hora *" type="datetime-local" value={form.hora_partido} onChange={(v) => setForm({ ...form, hora_partido: v })} />
        <Textarea label="Descripción (opcional)" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
        <Input label="Cupo de jugadores (opcional)" type="number" value={form.cupo_jugadores} onChange={(v) => setForm({ ...form, cupo_jugadores: v })} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input label="Latitud (opcional)" value={form.lat} onChange={(v) => setForm({ ...form, lat: v })} />
          <Input label="Longitud (opcional)" value={form.lng} onChange={(v) => setForm({ ...form, lng: v })} />
        </div>
        <button
          disabled={creando || !form.marca || !form.direccion_texto || !form.hora_partido}
          className="mt-5 h-12 w-full rounded-xl bg-[#FF6B00] text-sm font-black text-white transition hover:bg-[#e05e00] disabled:opacity-40"
        >
          {creando ? "Creando y notificando..." : "✦ Crear y notificar"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-500">{partidos.length} partido{partidos.length !== 1 ? "s" : ""} patrocinado{partidos.length !== 1 ? "s" : ""}</h2>
        {partidos.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-400">Sin partidos patrocinados.</div>
        ) : partidos.map((p, idx) => (
          <div key={p.id} className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">✦ {p.marca}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge(p.estado)}`}>{p.estado}</span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold">{p.direccion_texto || "Sin dirección"}</h3>
                <p className="mt-0.5 text-xs text-zinc-400">{formatDate(p.hora_partido)}</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-300">{shortId(p.id)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

function Notificaciones({ form, setForm, onSubmit, enviando, result, onClearResult }: {
  form: { titulo: string; cuerpo: string; partido_id: string };
  setForm: (f: { titulo: string; cuerpo: string; partido_id: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  enviando: boolean;
  result: number | null;
  onClearResult: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-black">Notificación masiva</h2>
        <p className="mt-1 text-xs text-zinc-400">Se enviará a todos los usuarios con push habilitado.</p>

        {result !== null && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-700">✓ Enviado a {result} usuario{result !== 1 ? "s" : ""}</p>
            <button type="button" onClick={onClearResult} className="text-xs text-zinc-400 hover:text-zinc-600">✕</button>
          </div>
        )}

        <Input label="Título *" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
        <Textarea label="Cuerpo *" value={form.cuerpo} onChange={(v) => setForm({ ...form, cuerpo: v })} />
        <div className="mt-4">
          <span className="text-xs font-bold text-zinc-500">Partido ID (opcional — abre el partido al tocar)</span>
          <input
            type="text"
            value={form.partido_id}
            onChange={(e) => setForm({ ...form, partido_id: e.target.value })}
            placeholder="UUID del partido"
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 font-mono text-sm outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          disabled={enviando || !form.titulo.trim() || !form.cuerpo.trim()}
          className="mt-6 h-12 w-full rounded-xl bg-zinc-950 text-sm font-black text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          {enviando ? "Enviando..." : "Enviar notificación"}
        </button>
      </form>
    </div>
  );
}

// ─── Promociones ──────────────────────────────────────────────────────────────

function Promociones({ promociones, form, setForm, onSubmit, onDelete, onUpload, uploading }: {
  promociones: AnyRow[];
  form: AnyRow;
  setForm: (f: AnyRow) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onUpload: (file?: File | null) => void;
  uploading: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm self-start">
        <h2 className="text-base font-black">{form.id ? "Editar promoción" : "Nueva promoción"}</h2>

        <div className="mt-4">
          <span className="text-xs font-bold text-zinc-500">Imagen</span>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center transition hover:border-[#FF6B00] hover:bg-orange-50/30">
            <span className="text-2xl">📸</span>
            <span className="mt-1 text-xs font-semibold text-zinc-500">{uploading ? "Subiendo..." : "Hacer clic para subir"}</span>
            <span className="text-[10px] text-zinc-400">PNG, JPG, WebP</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => onUpload(e.target.files?.[0])} className="hidden" />
          </label>
        </div>
        {form.imagen_url && (
          <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200">
            <img src={form.imagen_url} alt="Preview" className="w-full object-cover" style={{ maxHeight: 140 }} />
          </div>
        )}

        <Input label="Título *" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
        <Textarea label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
        <Input label="Dirección" value={form.direccion_texto} onChange={(v) => setForm({ ...form, direccion_texto: v })} />
        <Input label="Precio (texto libre, ej: Gs. 150.000/hora)" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input label="Latitud" value={form.lat} onChange={(v) => setForm({ ...form, lat: v })} />
          <Input label="Longitud" value={form.lng} onChange={(v) => setForm({ ...form, lng: v })} />
        </div>
        <Input label="Orden" type="number" value={form.orden} onChange={(v) => setForm({ ...form, orden: Number(v) })} />
        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} />
            Activa
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button className="flex-1 rounded-xl bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00] transition">Guardar</button>
          <button type="button" onClick={() => setForm({ id: "", titulo: "", descripcion: "", imagen_url: "", direccion_texto: "", lat: "", lng: "", precio: "", activa: true, orden: 0 })} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 transition">Limpiar</button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-500">{promociones.length} promoción{promociones.length !== 1 ? "es" : ""}</h2>
        {promociones.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {p.imagen_url && <img src={p.imagen_url} alt={p.titulo} className="w-full object-cover" style={{ maxHeight: 120 }} />}
            <div className="flex items-start justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${p.activa ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"}`}>
                    {p.activa ? "activa" : "inactiva"}
                  </span>
                  <span className="text-[11px] text-zinc-400">orden {p.orden}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold">{p.titulo}</h3>
                {p.precio && <p className="text-xs text-zinc-500 mt-0.5">{p.precio}</p>}
                {p.direccion_texto && <p className="text-xs text-zinc-400 mt-0.5">{p.direccion_texto}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setForm({ ...p })} className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold hover:bg-zinc-50 transition">
                  <IconEdit /> Editar
                </button>
                <button onClick={() => onDelete(p.id)} className="flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition">
                  <IconTrash /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {promociones.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-400">Sin promociones creadas.</div>
        )}
      </div>
    </div>
  );
}

// ─── Analítica ────────────────────────────────────────────────────────────────

function Analitica({ stats }: { stats: AnyRow[] }) {
  const top = [...stats].sort((a, b) => (b.total_partidos || 0) - (a.total_partidos || 0)).slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-black">Top organizadores</h2>
          <p className="text-[11px] text-zinc-400">{top.length} organizadores con partidos registrados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Nombre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 text-right">Partidos</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 text-right">Finalizados</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 text-right">Participantes</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row, idx) => (
                <tr key={row.organizador_id} className="border-b border-zinc-100 hover:bg-orange-50/30 transition">
                  <td className="px-4 py-3 text-xs text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">{row.nombre || "—"}</td>
                  <td className="px-4 py-3 text-right font-black text-[#FF6B00]">{row.total_partidos}</td>
                  <td className="px-4 py-3 text-right text-zinc-600">{row.partidos_finalizados}</td>
                  <td className="px-4 py-3 text-right text-zinc-600">{row.total_participantes}</td>
                </tr>
              ))}
              {top.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-400">Sin datos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
