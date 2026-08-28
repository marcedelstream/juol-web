"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { AdminTorneos } from "./AdminTorneos";
import { AdminProfesionales } from "./AdminProfesionales";
import { AdminContrario } from "./AdminContrario";
import { AdminTorneoOrganizadores } from "./AdminTorneoOrganizadores";
import { TorneoOrganizadorDashboard } from "./TorneoOrganizadorDashboard";

type AnyRow = Record<string, any>;
type Tab = "resumen" | "jugadores" | "partidos" | "torneos" | "torneo-organizadores" | "profesionales" | "contrario" | "contenido" | "solicitudes" | "mensajes";

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
  color_fondo: "#FD7401",
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
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function IconChat() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
}
function IconHamburger() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function IconTrophy() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a3 3 0 0 0 3 5" /><path d="M17 6h3a3 3 0 0 1-3 5" /></svg>;
}
function IconBuilding() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="7" x2="9" y2="7.01" /><line x1="15" y1="7" x2="15" y2="7.01" /><line x1="9" y1="12" x2="9" y2="12.01" /><line x1="15" y1="12" x2="15" y2="12.01" /><line x1="9" y1="17" x2="15" y2="17" /></svg>;
}
function IconShield() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconSwords() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="20" x2="20" y2="4" /><line x1="20" y1="20" x2="4" y2="4" /></svg>;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "resumen", label: "Resumen", icon: <IconChart /> },
  { id: "jugadores", label: "Jugadores", icon: <IconUsers /> },
  { id: "partidos", label: "Partidos", icon: <IconBall /> },
  { id: "torneos", label: "Torneos", icon: <IconTrophy /> },
  { id: "torneo-organizadores", label: "Organizadores", icon: <IconBuilding /> },
  { id: "profesionales", label: "Profesionales", icon: <IconShield /> },
  { id: "contrario", label: "Contrario", icon: <IconSwords /> },
  { id: "contenido", label: "Contenido", icon: <IconTag /> },
  { id: "solicitudes", label: "Solicitudes", icon: <IconInbox /> },
  { id: "mensajes", label: "Mensajes", icon: <IconChat /> },
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

function estadoTone(estado: string): "emerald" | "blue" | "red" | "zinc" | "amber" {
  const map: Record<string, "emerald" | "blue" | "red" | "zinc" | "amber"> = {
    activo: "emerald",
    completo: "blue",
    cancelado: "red",
    finalizado: "zinc",
    abandonado: "amber",
  };
  return map[estado] || "zinc";
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Pill({ tone = "zinc", children }: { tone?: "orange" | "emerald" | "red" | "amber" | "blue" | "zinc"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    orange: "bg-orange-50 text-[#FD7401] ring-1 ring-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    red: "bg-red-50 text-red-600 ring-1 ring-red-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    zinc: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-zinc-900">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-zinc-400">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-zinc-400">{text}</p>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active ? "bg-[#FD7401] text-white" : "bg-white text-zinc-500 border border-zinc-200 hover:bg-orange-50 hover:text-[#FD7401]"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none transition focus:border-[#FD7401] focus:ring-2 focus:ring-orange-100"
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
        className="mt-1 w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#FD7401] focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

function Dato({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="text-sm text-zinc-800">{value ?? "-"}</p>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">{titulo}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilaPartido({ partido, extra }: { partido?: AnyRow; extra?: string }) {
  if (!partido) return null;
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2">
      <div>
        <p className="text-xs font-bold text-zinc-700">{partido.direccion_texto || "Sin dirección"}</p>
        <p className="text-[10px] text-zinc-400">{formatDate(partido.hora_partido)}</p>
      </div>
      <div className="flex items-center gap-2">
        {extra && <span className="text-[10px] text-zinc-400">{extra}</span>}
        <Pill tone={estadoTone(partido.estado)}>{partido.estado}</Pill>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [organizador, setOrganizador] = useState<{ id: string; nombre: string; logo_url?: string | null } | null>(null);
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

  // Partidos especiales
  const emptyEsp = { direccion_texto: "", hora_partido: "", cupo_jugadores: "", precio_cancha: "", descripcion: "", tipo: "torneo" };
  const [espForm, setEspForm] = useState<AnyRow>(emptyEsp);
  const [creandoEsp, setCreandoEsp] = useState(false);

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
    setOrganizador(null);
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
      if (res.ok) {
        setData(json);
        setLoading(false);
        return;
      }
      // No es founder — antes de mostrar el error, ver si es un torneo_organizador
      // vinculado (users.es_admin / ADMIN_EMAILS no aplica acá, es un rol distinto).
      const orgRes = await fetch("/api/torneo-organizador/me", { headers: { authorization: `Bearer ${nextToken}` } });
      const orgJson = await orgRes.json();
      if (orgRes.ok) {
        setOrganizador(orgJson.organizador);
        setLoading(false);
        return;
      }
      throw new Error(json.error || "No se pudo cargar el admin.");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setLoading(false);
    }
  }

  async function updatePartido(id: string, estado: string) {
    try {
      await api("/api/admin/partidos", { method: "PATCH", body: JSON.stringify({ id, estado }) });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  async function updateUserPro(id: string, es_pro: boolean, plan_tipo?: string) {
    try {
      await api("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id, es_pro, plan_tipo }) });
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

  async function crearEspecial(e: React.FormEvent) {
    e.preventDefault();
    setCreandoEsp(true);
    setMessage("");
    try {
      const horaParaguay = espForm.hora_partido ? `${espForm.hora_partido}:00-04:00` : espForm.hora_partido;
      await api("/api/admin/partidos", {
        method: "POST",
        body: JSON.stringify({ ...espForm, hora_partido: new Date(horaParaguay).toISOString() }),
      });
      setEspForm(emptyEsp);
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setCreandoEsp(false); }
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFFAF6] px-5 py-10 text-zinc-950">
        <section className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image src="/juol-icon.png" alt="Juol" width={56} height={56} className="rounded-2xl shadow-sm" />
            <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-900">Panel Juol</h1>
            <p className="mt-1 text-sm text-zinc-500">Ingresá con tu cuenta autorizada.</p>
          </div>
          <form onSubmit={signIn} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <Input label="Email" value={email} onChange={setEmail} />
            <Input label="Contraseña" type="password" value={password} onChange={setPassword} />
            <button disabled={loading} className="mt-6 h-12 w-full rounded-full bg-[#FD7401] text-sm font-black text-white transition hover:bg-[#D95600] disabled:opacity-60">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            {message && <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  if (organizador) {
    return <TorneoOrganizadorDashboard api={api} organizador={organizador} onSignOut={signOut} />;
  }

  const activeTab = tabs.find((item) => item.id === tab)!;
  const adminInitials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "AD";

  // ─── Main layout ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#FFFAF6] text-zinc-950 lg:grid lg:grid-cols-[240px_1fr]">
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[240px] border-r border-zinc-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-5 py-5">
            <Image src="/juol-icon.png" alt="Juol" width={32} height={32} className="rounded-xl" />
            <div>
              <p className="text-sm font-black leading-none text-zinc-900">juol</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-zinc-400">Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 border-t border-zinc-100 px-3 py-3">
            {tabs.map((item) => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                    isActive ? "bg-[#FD7401] text-white shadow-sm" : "text-zinc-600 hover:bg-orange-50 hover:text-[#FD7401]"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-zinc-400"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="border-t border-zinc-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-black text-[#FD7401]">
                {adminInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-zinc-700">{adminEmail}</p>
                <p className="text-[10px] text-zinc-400">Administrador</p>
              </div>
            </div>
            <button onClick={signOut} className="mt-3 w-full rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <section className="min-w-0">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#FFFAF6]/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile: logo + juol */}
              <div className="flex items-center gap-2 lg:hidden">
                <Image src="/juol-icon.png" alt="Juol" width={28} height={28} className="rounded-lg" />
                <p className="text-base font-black text-zinc-900">juol</p>
              </div>
              {/* Desktop: tab title */}
              <div className="hidden lg:block">
                <h1 className="text-base font-black leading-tight text-zinc-900">{activeTab.label}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
              >
                <IconRefresh />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50 lg:hidden"
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
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="text-red-500">⚠</span>
              <p className="text-sm font-semibold text-red-700">{message}</p>
            </div>
          )}
          {loading && !data && (
            <div className="rounded-2xl border border-zinc-200 bg-white py-10 text-center text-sm font-bold text-zinc-400">
              Cargando datos...
            </div>
          )}
          {data && tab === "resumen" && <ResumenScreen data={data} />}
          {data && tab === "jugadores" && <JugadoresScreen data={data} api={api} onTogglePro={updateUserPro} />}
          {data && tab === "partidos" && (
            <PartidosScreen
              data={data}
              selected={selectedPartidos}
              setSelected={setSelectedPartidos}
              onEstado={updatePartido}
              onDeleteSelected={deleteSelectedPartidos}
              patForm={patForm}
              setPatForm={setPatForm}
              onCrearPatrocinado={crearPatrocinado}
              creandoPat={creandoPat}
              espForm={espForm}
              setEspForm={setEspForm}
              onCrearEspecial={crearEspecial}
              creandoEsp={creandoEsp}
            />
          )}
          {data && tab === "torneos" && <AdminTorneos api={api} />}
          {data && tab === "torneo-organizadores" && <AdminTorneoOrganizadores api={api} />}
          {data && tab === "profesionales" && <AdminProfesionales api={api} />}
          {data && tab === "contrario" && <AdminContrario api={api} />}
          {data && tab === "contenido" && (
            <ContenidoScreen
              banners={data.banners}
              bannerForm={bannerForm}
              setBannerForm={setBannerForm}
              onSaveBanner={saveBanner}
              onDeleteBanner={(id) => deleteRow("banners", id)}
              onUploadBanner={uploadBannerImage}
              uploadingBanner={uploading}
              promociones={data.promociones}
              promoForm={promoForm}
              setPromoForm={setPromoForm}
              onSavePromo={savePromocion}
              onDeletePromo={deletePromocion}
              onUploadPromo={uploadPromocionImage}
              uploadingPromo={uploadingPromo}
            />
          )}
          {data && tab === "solicitudes" && <SolicitudesScreen data={data} onDelete={deleteRow} />}
          {data && tab === "mensajes" && (
            <MensajesScreen
              users={data.users}
              chatProPorUsuario={data.chatProPorUsuario}
              onResponder={responderChatPro}
              notifForm={notifForm}
              setNotifForm={setNotifForm}
              onEnviarNotif={enviarNotificacion}
              enviandoNotif={enviandoNotif}
              notifResult={notifResult}
              onClearNotifResult={() => setNotifResult(null)}
            />
          )}
        </div>
      </section>
    </main>
  );
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

function ResumenScreen({ data }: { data: AdminData }) {
  const metrics = [
    { label: "Jugadores", value: data.metrics.users, text: "text-blue-600", color: "border-blue-400" },
    { label: "Partidos", value: data.metrics.partidos, text: "text-[#FD7401]", color: "border-[#FD7401]" },
    { label: "Activos", value: data.metrics.partidosActivos, text: "text-emerald-600", color: "border-emerald-400" },
    { label: "Confirmaciones", value: data.metrics.confirmados, text: "text-teal-600", color: "border-teal-400" },
    { label: "Reportes", value: data.metrics.reportes, text: "text-red-600", color: "border-red-400" },
    { label: "Soporte", value: data.metrics.soporte, text: "text-purple-600", color: "border-purple-400" },
    { label: "Inscripciones", value: data.metrics.contacto, text: "text-amber-600", color: "border-amber-400" },
    { label: "Leads Pro", value: data.metrics.proLeads, text: "text-indigo-600", color: "border-indigo-400" },
  ];

  const top = [...data.statsOrganizadores].sort((a, b) => (b.total_partidos || 0) - (a.total_partidos || 0)).slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, text, color }) => (
          <Card key={label} className={`border-l-4 p-5 ${color}`}>
            <p className={`text-xs font-bold uppercase tracking-wide ${text}`}>{label}</p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{value ?? "-"}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Partidos</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Finalizados</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Participantes</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row, idx) => (
                <tr key={row.organizador_id} className="border-b border-zinc-100 transition hover:bg-orange-50/30">
                  <td className="px-4 py-3 text-xs text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">{row.nombre || "—"}</td>
                  <td className="px-4 py-3 text-right font-black text-[#FD7401]">{row.total_partidos}</td>
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
      </Card>
    </div>
  );
}

// ─── Jugadores (lista + búsqueda + ficha CRM) ────────────────────────────────

function JugadoresScreen({ data, api, onTogglePro }: {
  data: AdminData;
  api: (path: string, options?: RequestInit) => Promise<any>;
  onTogglePro: (id: string, es_pro: boolean, plan_tipo?: string) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<AnyRow[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<AnyRow | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");
  const [planActivar, setPlanActivar] = useState<"mensual" | "anual">("mensual");

  useEffect(() => {
    let activo = true;
    const t = setTimeout(async () => {
      if (!activo) return;
      if (!q.trim()) { setResultados(null); return; }
      setBuscando(true);
      try {
        const json = await api(`/api/admin/users?q=${encodeURIComponent(q)}`);
        if (activo) setResultados(json.users || []);
      } catch (e) {
        if (activo) setError(getErrorMessage(e));
      } finally {
        if (activo) setBuscando(false);
      }
    }, 300);
    return () => { activo = false; clearTimeout(t); };
  }, [q]);

  const lista = resultados ?? data.users;

  async function verDetalle(id: string) {
    setSeleccionadoId(id);
    setCargandoDetalle(true);
    setError("");
    try {
      const json = await api(`/api/admin/users?id=${encodeURIComponent(id)}`);
      setDetalle(json);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function togglePro() {
    if (!detalle?.user) return;
    const activando = !detalle.user.es_pro;
    await onTogglePro(detalle.user.id, activando, activando ? planActivar : undefined);
    await verDetalle(detalle.user.id);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-zinc-100 px-4 py-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <IconSearch />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, teléfono o email..."
              className="h-11 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#FD7401] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
        <div className="max-h-[65vh] divide-y divide-zinc-100 overflow-y-auto">
          {buscando && <p className="px-4 py-6 text-center text-xs text-zinc-400">Buscando...</p>}
          {!buscando && lista.map((u) => (
            <button
              key={u.id}
              onClick={() => verDetalle(u.id)}
              className={`block w-full px-4 py-3 text-left transition hover:bg-orange-50/40 ${seleccionadoId === u.id ? "bg-orange-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-zinc-900">{u.nombre || "Sin nombre"} {u.apellido || ""}</p>
                {u.es_pro && <Pill tone="orange">PRO</Pill>}
              </div>
              <p className="text-xs text-zinc-500">{u.telefono || "Sin teléfono"} · {formatDate(u.created_at)}</p>
            </button>
          ))}
          {!buscando && lista.length === 0 && <EmptyState text="Sin resultados." />}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>
        )}
        {!seleccionadoId ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-zinc-400">Elegí un jugador para ver su ficha completa.</p>
          </div>
        ) : cargandoDetalle && !detalle ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-zinc-400">Cargando ficha...</p>
          </div>
        ) : detalle?.user ? (
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-zinc-900">{detalle.user.nombre || "Sin nombre"} {detalle.user.apellido || ""}</h2>
                  {detalle.user.es_pro && <Pill tone="orange">PRO</Pill>}
                </div>
                <p className="text-xs font-mono text-zinc-400">{shortId(detalle.user.id)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!detalle.user.es_pro && (
                  <select
                    value={planActivar}
                    onChange={(e) => setPlanActivar(e.target.value as "mensual" | "anual")}
                    className="h-8 rounded-xl border border-zinc-200 bg-white px-2 text-xs font-bold focus:border-[#FD7401] focus:outline-none"
                  >
                    <option value="mensual">Mensual (30d)</option>
                    <option value="anual">Anual (365d)</option>
                  </select>
                )}
                <button
                  onClick={togglePro}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    detalle.user.es_pro ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-[#FD7401] text-white hover:bg-[#D95600]"
                  }`}
                >
                  {detalle.user.es_pro ? "Quitar PRO" : "Hacer PRO"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Dato label="Email" value={detalle.user.email} />
              <Dato label="Teléfono" value={detalle.user.telefono} />
              <Dato label="Género" value={detalle.user.genero} />
              <Dato label="Edad" value={detalle.user.edad} />
              <Dato label="Profesión" value={detalle.user.profesion} />
              <Dato label="Creado" value={formatDate(detalle.user.created_at)} />
              {detalle.user.es_pro && <>
                <Dato label="Plan PRO" value={detalle.user.plan_tipo || "mensual"} />
                <Dato label="Vence" value={formatDate(detalle.user.pro_vence_at)} />
              </>}
            </div>

            <Seccion titulo={`Partidos organizados (${detalle.partidosOrganizados?.length || 0})`}>
              {(detalle.partidosOrganizados || []).map((p: AnyRow) => (
                <FilaPartido key={p.id} partido={p} />
              ))}
              {(!detalle.partidosOrganizados || detalle.partidosOrganizados.length === 0) && <p className="text-xs text-zinc-400">Sin partidos organizados.</p>}
            </Seccion>

            <Seccion titulo={`Partidos jugados (${detalle.confirmaciones?.length || 0})`}>
              {(detalle.confirmaciones || []).map((c: AnyRow) => (
                <FilaPartido key={c.id} partido={c.partido} extra={c.estado} />
              ))}
              {(!detalle.confirmaciones || detalle.confirmaciones.length === 0) && <p className="text-xs text-zinc-400">Sin confirmaciones.</p>}
            </Seccion>

            <Seccion titulo={`Reportes hechos (${detalle.reportes?.length || 0})`}>
              {(detalle.reportes || []).map((r: AnyRow) => (
                <div key={r.id} className="rounded-xl border border-zinc-100 px-3 py-2">
                  <p className="text-xs font-bold text-zinc-700">{r.motivo}</p>
                  <p className="text-xs text-zinc-500">{r.detalle}</p>
                  <p className="text-[10px] text-zinc-400">{formatDate(r.created_at)}</p>
                </div>
              ))}
              {(!detalle.reportes || detalle.reportes.length === 0) && <p className="text-xs text-zinc-400">Sin reportes.</p>}
            </Seccion>

            <Seccion titulo={`Soporte (${detalle.soporte?.length || 0})`}>
              {(detalle.soporte || []).map((s: AnyRow) => (
                <div key={s.id} className="rounded-xl border border-zinc-100 px-3 py-2">
                  <p className="text-xs font-bold text-zinc-700">{s.asunto}</p>
                  <p className="text-xs text-zinc-500">{s.mensaje}</p>
                  <p className="text-[10px] text-zinc-400">{formatDate(s.created_at)}</p>
                </div>
              ))}
              {(!detalle.soporte || detalle.soporte.length === 0) && <p className="text-xs text-zinc-400">Sin tickets de soporte.</p>}
            </Seccion>

            <Seccion titulo={`Chat PRO (${detalle.chatPro?.length || 0})`}>
              {(detalle.chatPro || []).map((m: AnyRow) => (
                <div key={m.id} className={`rounded-xl px-3 py-2 text-xs ${m.es_founder ? "bg-orange-50" : "bg-zinc-50"}`}>
                  <p className="text-zinc-700">{m.contenido}</p>
                  <p className="text-[10px] text-zinc-400">{formatDate(m.created_at)}</p>
                </div>
              ))}
              {(!detalle.chatPro || detalle.chatPro.length === 0) && <p className="text-xs text-zinc-400">Sin mensajes.</p>}
            </Seccion>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

// ─── Partidos (lista + filtro patrocinados + panel crear patrocinado) ───────

function PartidosScreen({ data, selected, setSelected, onEstado, onDeleteSelected, patForm, setPatForm, onCrearPatrocinado, creandoPat, espForm, setEspForm, onCrearEspecial, creandoEsp }: {
  data: AdminData;
  selected: string[];
  setSelected: (ids: string[]) => void;
  onEstado: (id: string, estado: string) => void;
  onDeleteSelected: () => void;
  patForm: AnyRow;
  setPatForm: (f: AnyRow) => void;
  onCrearPatrocinado: (e: React.FormEvent) => void;
  creandoPat: boolean;
  espForm: AnyRow;
  setEspForm: (f: AnyRow) => void;
  onCrearEspecial: (e: React.FormEvent) => void;
  creandoEsp: boolean;
}) {
  const [filtro, setFiltro] = useState<"todos" | "patrocinados">("todos");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [panelEspAbierto, setPanelEspAbierto] = useState(false);

  const partidos = filtro === "patrocinados" ? data.partidos.filter((p) => p.patrocinado) : data.partidos;
  const allVisibleSelected = partidos.length > 0 && partidos.every((p) => selected.includes(p.id));

  function toggle(id: string) {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }
  function toggleAll() {
    setSelected(allVisibleSelected ? [] : partidos.map((p) => p.id));
  }

  return (
    <div>
      <SectionHeader
        title="Partidos"
        subtitle={`${partidos.length} partido${partidos.length !== 1 ? "s" : ""}`}
        action={
          <>
            <Chip active={filtro === "todos"} onClick={() => setFiltro("todos")}>Todos</Chip>
            <Chip active={filtro === "patrocinados"} onClick={() => setFiltro("patrocinados")}>Patrocinados</Chip>
            <button
              onClick={() => setPanelEspAbierto(true)}
              className="rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-700"
            >
              + Partido especial
            </button>
            <button
              onClick={() => setPanelAbierto(true)}
              className="rounded-full bg-[#FD7401] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#D95600]"
            >
              + Nuevo patrocinado
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-700">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="rounded" />
          Seleccionar todos
        </label>
        <button
          onClick={onDeleteSelected}
          disabled={selected.length === 0}
          className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-30"
        >
          <IconTrash />
          Eliminar seleccionados ({selected.length})
        </button>
      </div>

      <Card className="overflow-hidden">
        {partidos.map((p, idx) => {
          const conf = data.confirmacionesPorPartido[p.id] || { confirmados: 0, cancelados: 0 };
          return (
            <article key={p.id} className={`grid gap-4 p-4 md:grid-cols-[32px_1fr_auto] md:items-center ${idx !== 0 ? "border-t border-zinc-100" : ""} transition hover:bg-orange-50/30`}>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="mt-1 md:mt-0" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={estadoTone(p.estado)}>{p.estado}</Pill>
                  {p.patrocinado && <Pill tone="amber"><span className="inline-flex items-center gap-1"><IconStar /> {p.marca || "Patrocinado"}</span></Pill>}
                  {p.tipo && p.tipo !== "normal" && <Pill tone="blue">{p.tipo}</Pill>}
                  <span className="font-mono text-xs text-zinc-400">{shortId(p.id)}</span>
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
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold focus:border-[#FD7401] focus:outline-none"
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
        {partidos.length === 0 && <EmptyState text="Sin partidos." />}
      </Card>

      {panelAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Cerrar panel" className="absolute inset-0 bg-black/30" onClick={() => setPanelAbierto(false)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black">Nuevo partido patrocinado</h2>
              <button onClick={() => setPanelAbierto(false)} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">✕</button>
            </div>
            <p className="text-xs text-zinc-400">Se notificará a usuarios cercanos al guardar.</p>
            <form onSubmit={(e) => { onCrearPatrocinado(e); setPanelAbierto(false); }}>
              <Input label="Marca / patrocinador *" value={patForm.marca} onChange={(v) => setPatForm({ ...patForm, marca: v })} />
              <Input label="Dirección *" value={patForm.direccion_texto} onChange={(v) => setPatForm({ ...patForm, direccion_texto: v })} />
              <Input label="Fecha y hora *" type="datetime-local" value={patForm.hora_partido} onChange={(v) => setPatForm({ ...patForm, hora_partido: v })} />
              <Textarea label="Descripción (opcional)" value={patForm.descripcion} onChange={(v) => setPatForm({ ...patForm, descripcion: v })} />
              <Input label="Cupo de jugadores (opcional)" type="number" value={patForm.cupo_jugadores} onChange={(v) => setPatForm({ ...patForm, cupo_jugadores: v })} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Input label="Latitud (opcional)" value={patForm.lat} onChange={(v) => setPatForm({ ...patForm, lat: v })} />
                <Input label="Longitud (opcional)" value={patForm.lng} onChange={(v) => setPatForm({ ...patForm, lng: v })} />
              </div>
              <button
                disabled={creandoPat || !patForm.marca || !patForm.direccion_texto || !patForm.hora_partido}
                className="mt-5 h-12 w-full rounded-full bg-[#FD7401] text-sm font-black text-white transition hover:bg-[#D95600] disabled:opacity-40"
              >
                {creandoPat ? "Creando y notificando..." : "✦ Crear y notificar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {panelEspAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Cerrar panel" className="absolute inset-0 bg-black/30" onClick={() => setPanelEspAbierto(false)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black">Nuevo partido especial</h2>
              <button onClick={() => setPanelEspAbierto(false)} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">✕</button>
            </div>
            <p className="text-xs text-zinc-400">Aparecerá en la sección Descubrir de la app según el tipo.</p>
            <form onSubmit={(e) => { onCrearEspecial(e); setPanelEspAbierto(false); }}>
              <div className="mt-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Tipo *</p>
                <select
                  value={espForm.tipo}
                  onChange={(e) => setEspForm({ ...espForm, tipo: e.target.value })}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-[#FD7401] focus:outline-none"
                >
                  <option value="torneo">Torneo</option>
                  <option value="empresa">Empresa</option>
                  <option value="versus">Versus</option>
                  <option value="tematico">Temático</option>
                  <option value="especial">Especial (JuolPRO)</option>
                </select>
              </div>
              <Input label="Dirección *" value={espForm.direccion_texto} onChange={(v) => setEspForm({ ...espForm, direccion_texto: v })} />
              <Input label="Fecha y hora *" type="datetime-local" value={espForm.hora_partido} onChange={(v) => setEspForm({ ...espForm, hora_partido: v })} />
              <Textarea label="Descripción (opcional)" value={espForm.descripcion} onChange={(v) => setEspForm({ ...espForm, descripcion: v })} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Input label="Cupo jugadores" type="number" value={espForm.cupo_jugadores} onChange={(v) => setEspForm({ ...espForm, cupo_jugadores: v })} />
                <Input label="Precio (Gs)" type="number" value={espForm.precio_cancha} onChange={(v) => setEspForm({ ...espForm, precio_cancha: v })} />
              </div>
              <button
                disabled={creandoEsp || !espForm.direccion_texto || !espForm.hora_partido || !espForm.tipo}
                className="mt-5 h-12 w-full rounded-full bg-zinc-800 text-sm font-black text-white transition hover:bg-zinc-700 disabled:opacity-40"
              >
                {creandoEsp ? "Creando..." : "✦ Crear partido especial"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contenido (Banners + Promociones de canchas) ────────────────────────────

function ContenidoScreen({
  banners, bannerForm, setBannerForm, onSaveBanner, onDeleteBanner, onUploadBanner, uploadingBanner,
  promociones, promoForm, setPromoForm, onSavePromo, onDeletePromo, onUploadPromo, uploadingPromo,
}: {
  banners: AnyRow[];
  bannerForm: AnyRow;
  setBannerForm: (row: AnyRow) => void;
  onSaveBanner: (e: FormEvent) => void;
  onDeleteBanner: (id: string) => void;
  onUploadBanner: (file?: File | null) => void;
  uploadingBanner: boolean;
  promociones: AnyRow[];
  promoForm: AnyRow;
  setPromoForm: (f: AnyRow) => void;
  onSavePromo: (e: React.FormEvent) => void;
  onDeletePromo: (id: string) => void;
  onUploadPromo: (file?: File | null) => void;
  uploadingPromo: boolean;
}) {
  const [vista, setVista] = useState<"banners" | "promociones">("banners");

  return (
    <div>
      <SectionHeader
        title="Contenido"
        subtitle={vista === "banners" ? `${banners.length} banner${banners.length !== 1 ? "s" : ""}` : `${promociones.length} promoción${promociones.length !== 1 ? "es" : ""}`}
        action={
          <>
            <Chip active={vista === "banners"} onClick={() => setVista("banners")}>Banners</Chip>
            <Chip active={vista === "promociones"} onClick={() => setVista("promociones")}>Promociones de canchas</Chip>
          </>
        }
      />

      {vista === "banners" ? (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
          <form onSubmit={onSaveBanner} className="self-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black">{bannerForm.id ? "Editar beneficio" : "Nuevo beneficio"}</h2>

            <div className="mt-4">
              <span className="text-xs font-bold text-zinc-500">Imagen</span>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center transition hover:border-[#FD7401] hover:bg-orange-50/30">
                <span className="text-2xl">🖼</span>
                <span className="mt-1 text-xs font-semibold text-zinc-500">{uploadingBanner ? "Subiendo..." : "Hacer clic para subir"}</span>
                <span className="text-[10px] text-zinc-400">PNG, JPG, WebP</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => onUploadBanner(e.target.files?.[0])} className="hidden" />
              </label>
            </div>

            {bannerForm.imagen_url && (
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200">
                <img src={bannerForm.imagen_url} alt="Preview" className="w-full object-cover" style={{ maxHeight: 160 }} />
              </div>
            )}

            <Input label="Título" value={bannerForm.titulo} onChange={(v) => setBannerForm({ ...bannerForm, titulo: v })} />
            <Input label="Subtítulo" value={bannerForm.subtitulo} onChange={(v) => setBannerForm({ ...bannerForm, subtitulo: v })} />
            <Input label="Imagen URL" value={bannerForm.imagen_url} onChange={(v) => setBannerForm({ ...bannerForm, imagen_url: v })} />
            <Input label="Enlace URL" value={bannerForm.enlace_url} onChange={(v) => setBannerForm({ ...bannerForm, enlace_url: v })} />
            <Textarea label="Descripción interna" value={bannerForm.descripcion_interna} onChange={(v) => setBannerForm({ ...bannerForm, descripcion_interna: v })} />
            <Input label="Orden" type="number" value={bannerForm.orden} onChange={(v) => setBannerForm({ ...bannerForm, orden: Number(v) })} />

            <label className="mt-4 block text-xs font-bold text-zinc-500">Ubicación</label>
            <select
              value={bannerForm.ubicacion_publicitaria}
              onChange={(e) => setBannerForm({ ...bannerForm, ubicacion_publicitaria: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-[#FD7401] focus:outline-none"
            >
              <option value="principal">principal</option>
              <option value="secundaria">secundaria</option>
            </select>

            <div className="mt-4 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={bannerForm.activo} onChange={(e) => setBannerForm({ ...bannerForm, activo: e.target.checked })} />
                Activo
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={bannerForm.solo_imagen} onChange={(e) => setBannerForm({ ...bannerForm, solo_imagen: e.target.checked })} />
                Solo imagen
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-full bg-[#FD7401] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#D95600]">Guardar</button>
              <button type="button" onClick={() => setBannerForm(emptyBanner)} className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-bold transition hover:bg-zinc-50">Limpiar</button>
            </div>
          </form>

          <div className="space-y-3">
            {banners.map((b) => (
              <Card key={b.id} className="overflow-hidden">
                {b.imagen_url && <img src={b.imagen_url} alt={b.titulo} className="w-full object-cover" style={{ maxHeight: 100 }} />}
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={b.activo ? "emerald" : "zinc"}>{b.activo ? "activo" : "inactivo"}</Pill>
                      <span className="text-[11px] text-zinc-400">{b.ubicacion_publicitaria} · orden {b.orden}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold">{b.titulo || "Sin título"}</h3>
                    <p className="text-xs text-zinc-500">{b.subtitulo || b.imagen_url || "Sin detalle"}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setBannerForm({ ...emptyBanner, ...b })} className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold transition hover:bg-zinc-50">
                      <IconEdit /> Editar
                    </button>
                    <button onClick={() => onDeleteBanner(b.id)} className="flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-800">
                      <IconTrash /> Eliminar
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {banners.length === 0 && <Card><EmptyState text="Sin beneficios creados." /></Card>}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
          <form onSubmit={onSavePromo} className="self-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black">{promoForm.id ? "Editar promoción" : "Nueva promoción"}</h2>

            <div className="mt-4">
              <span className="text-xs font-bold text-zinc-500">Imagen</span>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center transition hover:border-[#FD7401] hover:bg-orange-50/30">
                <span className="text-2xl">📸</span>
                <span className="mt-1 text-xs font-semibold text-zinc-500">{uploadingPromo ? "Subiendo..." : "Hacer clic para subir"}</span>
                <span className="text-[10px] text-zinc-400">PNG, JPG, WebP</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => onUploadPromo(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            {promoForm.imagen_url && (
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200">
                <img src={promoForm.imagen_url} alt="Preview" className="w-full object-cover" style={{ maxHeight: 140 }} />
              </div>
            )}

            <Input label="Título *" value={promoForm.titulo} onChange={(v) => setPromoForm({ ...promoForm, titulo: v })} />
            <Textarea label="Descripción" value={promoForm.descripcion} onChange={(v) => setPromoForm({ ...promoForm, descripcion: v })} />
            <Input label="Dirección" value={promoForm.direccion_texto} onChange={(v) => setPromoForm({ ...promoForm, direccion_texto: v })} />
            <Input label="Precio (texto libre, ej: Gs. 150.000/hora)" value={promoForm.precio} onChange={(v) => setPromoForm({ ...promoForm, precio: v })} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Input label="Latitud" value={promoForm.lat} onChange={(v) => setPromoForm({ ...promoForm, lat: v })} />
              <Input label="Longitud" value={promoForm.lng} onChange={(v) => setPromoForm({ ...promoForm, lng: v })} />
            </div>
            <Input label="Orden" type="number" value={promoForm.orden} onChange={(v) => setPromoForm({ ...promoForm, orden: Number(v) })} />
            <div className="mt-4 flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={promoForm.activa} onChange={(e) => setPromoForm({ ...promoForm, activa: e.target.checked })} />
                Activa
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-full bg-[#FD7401] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#D95600]">Guardar</button>
              <button type="button" onClick={() => setPromoForm({ id: "", titulo: "", descripcion: "", imagen_url: "", direccion_texto: "", lat: "", lng: "", precio: "", activa: true, orden: 0 })} className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-bold transition hover:bg-zinc-50">Limpiar</button>
            </div>
          </form>

          <div className="space-y-3">
            {promociones.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {p.imagen_url && <img src={p.imagen_url} alt={p.titulo} className="w-full object-cover" style={{ maxHeight: 120 }} />}
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={p.activa ? "emerald" : "zinc"}>{p.activa ? "activa" : "inactiva"}</Pill>
                      <span className="text-[11px] text-zinc-400">orden {p.orden}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold">{p.titulo}</h3>
                    {p.precio && <p className="mt-0.5 text-xs text-zinc-500">{p.precio}</p>}
                    {p.direccion_texto && <p className="mt-0.5 text-xs text-zinc-400">{p.direccion_texto}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setPromoForm({ ...p })} className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold transition hover:bg-zinc-50">
                      <IconEdit /> Editar
                    </button>
                    <button onClick={() => onDeletePromo(p.id)} className="flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-800">
                      <IconTrash /> Eliminar
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {promociones.length === 0 && <Card><EmptyState text="Sin promociones creadas." /></Card>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Solicitudes (Descubrir, Comercial, Soporte, Pro, Reportes) ──────────────

const DESCUBRIR_TIPOS = ["torneo", "empresa", "versus"];
type SolicitudVista = "descubrir" | "comercial" | "soporte" | "pro" | "reportes";

function SolicitudesScreen({ data, onDelete }: { data: AdminData; onDelete: (table: string, id: string) => void }) {
  const [vista, setVista] = useState<SolicitudVista>("descubrir");
  const descubrirRows = data.contacto.filter((r: AnyRow) => DESCUBRIR_TIPOS.includes(r.tipo));
  const comercialRows = data.contacto.filter((r: AnyRow) => !DESCUBRIR_TIPOS.includes(r.tipo));
  const proRows = [...data.proInteresados, ...data.proWaitlist];

  const counts: Record<SolicitudVista, number> = {
    descubrir: descubrirRows.length,
    comercial: comercialRows.length,
    soporte: data.soporte.length,
    pro: proRows.length,
    reportes: data.reportes.length,
  };

  return (
    <div>
      <SectionHeader
        title="Solicitudes"
        action={
          <>
            <Chip active={vista === "descubrir"} onClick={() => setVista("descubrir")}>Descubrir ({counts.descubrir})</Chip>
            <Chip active={vista === "comercial"} onClick={() => setVista("comercial")}>Comercial ({counts.comercial})</Chip>
            <Chip active={vista === "soporte"} onClick={() => setVista("soporte")}>Soporte ({counts.soporte})</Chip>
            <Chip active={vista === "pro"} onClick={() => setVista("pro")}>Pro ({counts.pro})</Chip>
            <Chip active={vista === "reportes"} onClick={() => setVista("reportes")}>Reportes ({counts.reportes})</Chip>
          </>
        }
      />

      {vista === "descubrir" && <DescubrirList rows={descubrirRows} onDelete={(id) => onDelete("contacto_comercial", id)} />}
      {vista === "comercial" && <ComercialList rows={comercialRows} onDelete={(id) => onDelete("contacto_comercial", id)} />}
      {vista === "soporte" && <ListaGenerica title="Soporte" rows={data.soporte} table="soporte" onDelete={onDelete} primary="asunto" secondary="mensaje" />}
      {vista === "pro" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ListaGenerica title="Pro app" rows={data.proInteresados} table="pro_interesados" onDelete={onDelete} primary="email" secondary="usuario.nombre" />
          <ListaGenerica title="Pro web" rows={data.proWaitlist} table="pro_waitlist_web" onDelete={onDelete} primary="email" secondary="created_at" />
        </div>
      )}
      {vista === "reportes" && <ReportesList reportes={data.reportes} onDelete={(id) => onDelete("reportes", id)} />}
    </div>
  );
}

function DescubrirList({ rows, onDelete }: { rows: AnyRow[]; onDelete: (id: string) => void }) {
  const tipoConfig: Record<string, { label: string; tone: "blue" | "amber" | "red" }> = {
    torneo: { label: "Torneos", tone: "blue" },
    empresa: { label: "Empresas", tone: "amber" },
    versus: { label: "Versus", tone: "red" },
  };

  return (
    <Card>
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black">Descubrir — Inscripciones</h2>
        <p className="text-[11px] text-zinc-400">{rows.length} solicitud{rows.length !== 1 ? "es" : ""} de modos Torneos, Empresas y Versus</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState text="Sin inscripciones todavía." />
      ) : (
        <div className="divide-y divide-zinc-100">
          {rows.map((row) => {
            const cfg = tipoConfig[row.tipo] ?? { label: row.tipo, tone: "zinc" as const };
            return (
              <article key={row.id} className="px-4 py-4 transition hover:bg-orange-50/30">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={cfg.tone}>{cfg.label}</Pill>
                    <span className="text-[11px] text-zinc-400">{formatDate(row.created_at)}</span>
                  </div>
                  <button onClick={() => onDelete(row.id)} className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1.5 text-xs font-bold transition hover:bg-zinc-50" title="Eliminar">
                    <IconTrash />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 rounded-xl bg-zinc-50 px-3 py-2.5">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-zinc-400">Contacto</p>
                    {row.nombre && (
                      <div className="flex items-start gap-2">
                        <span className="w-12 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Nombre</span>
                        <span className="text-sm font-semibold text-zinc-800">{row.nombre}</span>
                      </div>
                    )}
                    {row.email && (
                      <div className="flex items-start gap-2">
                        <span className="w-12 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Email</span>
                        <a href={`mailto:${row.email}`} className="break-all text-sm font-semibold text-[#FD7401] underline-offset-2 hover:underline">{row.email}</a>
                      </div>
                    )}
                    {row.mensaje && (
                      <div className="mt-1 flex items-start gap-2">
                        <span className="w-12 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Mensaje</span>
                        <p className="text-sm leading-5 text-zinc-600">{row.mensaje}</p>
                      </div>
                    )}
                  </div>

                  {row.usuario ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-emerald-600">Usuario en la app</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Nombre</span>
                          <span className="text-sm font-bold text-zinc-900">{row.usuario.nombre}</span>
                        </div>
                        {row.usuario.telefono && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">WhatsApp</span>
                            <a href={`https://wa.me/${String(row.usuario.telefono).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
                              {row.usuario.telefono}
                            </a>
                          </div>
                        )}
                        {row.usuario.profesion && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Profesión</span>
                            <span className="text-sm capitalize text-zinc-600">{row.usuario.profesion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                      <p className="text-center text-xs text-zinc-400">Sin cuenta en la app</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function ComercialList({ rows, onDelete }: { rows: AnyRow[]; onDelete: (id: string) => void }) {
  const tipoColor: Record<string, "orange" | "blue" | "amber"> = {
    publicidad: "orange",
    cancha: "blue",
    sponsor: "amber",
  };

  return (
    <Card>
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black">Comercial</h2>
        <p className="text-[11px] text-zinc-400">{rows.length} solicitud{rows.length !== 1 ? "es" : ""}</p>
      </div>
      <div>
        {rows.length === 0 ? (
          <EmptyState text="Sin solicitudes comerciales." />
        ) : rows.map((row, idx) => (
          <article key={row.id} className={`px-4 py-4 transition hover:bg-orange-50/30 ${idx !== 0 ? "border-t border-zinc-100" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {row.tipo && <Pill tone={tipoColor[row.tipo] || "zinc"}>{row.tipo}</Pill>}
                <span className="text-[11px] text-zinc-400">{formatDate(row.created_at)}</span>
              </div>
              <button onClick={() => onDelete(row.id)} className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1.5 text-xs font-bold transition hover:bg-zinc-50" title="Eliminar">
                <IconTrash />
              </button>
            </div>

            {row.usuario && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-600">Usuario en la app</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Nombre</span>
                    <span className="text-sm font-bold text-zinc-900">{row.usuario.nombre}</span>
                  </div>
                  {row.usuario.telefono && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">WhatsApp</span>
                      <a href={`https://wa.me/${String(row.usuario.telefono).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
                        {row.usuario.telefono}
                      </a>
                    </div>
                  )}
                  {row.usuario.profesion && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Profesión</span>
                      <span className="text-sm capitalize text-zinc-600">{row.usuario.profesion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 space-y-1.5 rounded-xl bg-zinc-50 px-3 py-2.5">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">Datos del formulario</p>
              {row.nombre && (
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Nombre</span>
                  <span className="text-sm font-semibold text-zinc-700">{row.nombre}</span>
                </div>
              )}
              {row.email && (
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Email</span>
                  <a href={`mailto:${row.email}`} className="break-all text-sm font-semibold text-[#FD7401] underline-offset-2 hover:underline">{row.email}</a>
                </div>
              )}
            </div>

            {row.mensaje && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-600">{row.mensaje}</p>}
          </article>
        ))}
      </div>
    </Card>
  );
}

function ReportesList({ reportes, onDelete }: { reportes: AnyRow[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {reportes.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Pill tone="red">{r.motivo}</Pill>
                <span className="text-xs text-zinc-400">{formatDate(r.created_at)}</span>
              </div>
              <p className="mt-1.5 text-sm font-bold">{r.detalle || "Sin detalle"}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                Partido: <span className="font-mono">{shortId(r.partido_id)}</span> · Reporta: {r.usuario?.nombre || shortId(r.reportado_por)}
              </p>
            </div>
            <button onClick={() => onDelete(r.id)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800">
              <IconTrash /> Eliminar
            </button>
          </div>
        </Card>
      ))}
      {reportes.length === 0 && <Card><EmptyState text="Sin reportes." /></Card>}
    </div>
  );
}

function ListaGenerica({ title, rows, table, onDelete, primary, secondary }: {
  title: string;
  rows: AnyRow[];
  table: string;
  onDelete: (table: string, id: string) => void;
  primary: string;
  secondary: string;
}) {
  const get = (row: AnyRow, key: string) => key.split(".").reduce((acc: any, part: string) => acc?.[part], row);

  return (
    <Card>
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black">{title}</h2>
        <p className="text-[11px] text-zinc-400">{rows.length} registro{rows.length !== 1 ? "s" : ""}</p>
      </div>
      <div>
        {rows.length === 0 ? (
          <EmptyState text="Sin registros." />
        ) : rows.map((row, idx) => (
          <article key={row.id} className={`flex items-start justify-between gap-3 px-4 py-3 transition hover:bg-orange-50/30 ${idx !== 0 ? "border-t border-zinc-100" : ""}`}>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-zinc-400">{formatDate(row.created_at)}</p>
              <p className="truncate text-sm font-bold">{String(get(row, primary) || row.email || row.nombre || "Sin título")}</p>
              <p className="line-clamp-2 text-xs leading-5 text-zinc-500">{String(get(row, secondary) || row.email || "-")}</p>
            </div>
            <button onClick={() => onDelete(table, row.id)} className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1.5 text-xs font-bold transition hover:bg-zinc-50">
              <IconTrash />
            </button>
          </article>
        ))}
      </div>
    </Card>
  );
}

// ─── Mensajes (Conversaciones Chat PRO + Notificación masiva) ───────────────

function MensajesScreen({
  users, chatProPorUsuario, onResponder,
  notifForm, setNotifForm, onEnviarNotif, enviandoNotif, notifResult, onClearNotifResult,
}: {
  users: AnyRow[];
  chatProPorUsuario: Record<string, AnyRow[]>;
  onResponder: (usuario_id: string, contenido: string) => Promise<void>;
  notifForm: { titulo: string; cuerpo: string; partido_id: string };
  setNotifForm: (f: { titulo: string; cuerpo: string; partido_id: string }) => void;
  onEnviarNotif: (e: React.FormEvent) => void;
  enviandoNotif: boolean;
  notifResult: number | null;
  onClearNotifResult: () => void;
}) {
  const [vista, setVista] = useState<"conversaciones" | "notificacion">("conversaciones");

  return (
    <div>
      <SectionHeader
        title="Mensajes"
        action={
          <>
            <Chip active={vista === "conversaciones"} onClick={() => setVista("conversaciones")}>Conversaciones</Chip>
            <Chip active={vista === "notificacion"} onClick={() => setVista("notificacion")}>Enviar notificación</Chip>
          </>
        }
      />

      {vista === "conversaciones" ? (
        <Conversaciones users={users} chatProPorUsuario={chatProPorUsuario} onResponder={onResponder} />
      ) : (
        <NotificacionForm
          form={notifForm}
          setForm={setNotifForm}
          onSubmit={onEnviarNotif}
          enviando={enviandoNotif}
          result={notifResult}
          onClearResult={onClearNotifResult}
        />
      )}
    </div>
  );
}

function Conversaciones({ users, chatProPorUsuario, onResponder }: { users: AnyRow[]; chatProPorUsuario: Record<string, AnyRow[]>; onResponder: (usuario_id: string, contenido: string) => Promise<void> }) {
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
      <Card>
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-black">Hilos</h2>
          <p className="text-[11px] text-zinc-400">{hilos.length} conversaci{hilos.length !== 1 ? "ones" : "ón"}</p>
        </div>
        <div className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto">
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
          {hilos.length === 0 && <EmptyState text="Sin consultas todavía." />}
        </div>
      </Card>

      <Card className="flex flex-col">
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
            <div className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {hiloActivo.mensajes.map((m) => (
                <div key={m.id} className={`flex ${m.es_founder ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.es_founder ? "bg-[#FD7401] text-white" : "bg-zinc-100 text-zinc-800"}`}>
                    <p>{m.contenido}</p>
                    <p className={`mt-1 text-[10px] ${m.es_founder ? "text-orange-100" : "text-zinc-400"}`}>{formatDate(m.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-zinc-100 px-4 py-3">
              <input
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
                placeholder="Escribí tu respuesta..."
                className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 text-sm focus:border-orange-400 focus:outline-none"
              />
              <button
                onClick={enviar}
                disabled={!respuesta.trim() || enviando}
                className="rounded-full bg-[#FD7401] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#D95600] disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function NotificacionForm({ form, setForm, onSubmit, enviando, result, onClearResult }: {
  form: { titulo: string; cuerpo: string; partido_id: string };
  setForm: (f: { titulo: string; cuerpo: string; partido_id: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  enviando: boolean;
  result: number | null;
  onClearResult: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 font-mono text-sm outline-none transition focus:border-[#FD7401] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          disabled={enviando || !form.titulo.trim() || !form.cuerpo.trim()}
          className="mt-6 h-12 w-full rounded-full bg-zinc-950 text-sm font-black text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          {enviando ? "Enviando..." : "Enviar notificación"}
        </button>
      </form>
    </div>
  );
}
