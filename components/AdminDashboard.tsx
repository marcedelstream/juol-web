"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type AnyRow = Record<string, any>;
type Tab = "resumen" | "partidos" | "jugadores" | "beneficios" | "solicitudes" | "reportes";

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

const tabs: { id: Tab; label: string; description: string }[] = [
  { id: "resumen", label: "Resumen", description: "Métricas generales" },
  { id: "partidos", label: "Partidos", description: "Seguimiento y limpieza" },
  { id: "jugadores", label: "Jugadores", description: "Base de usuarios" },
  { id: "beneficios", label: "Beneficios", description: "Banners y publicidad" },
  { id: "solicitudes", label: "Solicitudes", description: "Soporte, comercial y Pro" },
  { id: "reportes", label: "Reportes", description: "Moderación" },
];

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

  async function deleteRow(table: string, id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api(`/api/admin/delete?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-zinc-950">
        <section className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center">
          <p className="text-xs font-black tracking-widest text-[#ff6b00]">JUOL ADMIN</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Panel privado</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Ingresá con tu cuenta autorizada para gestionar Juol.</p>
          <form onSubmit={signIn} className="mt-8 border-t border-zinc-200 pt-6">
            <Input label="Email" value={email} onChange={setEmail} />
            <Input label="Contraseña" type="password" value={password} onChange={setPassword} />
            <button disabled={loading} className="mt-6 h-12 w-full rounded-full bg-[#ff6b00] text-sm font-black text-white disabled:opacity-60">Ingresar</button>
            {message && <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  const activeTab = tabs.find((item) => item.id === tab)!;

  return (
    <main className="min-h-screen bg-white text-zinc-950 lg:grid lg:grid-cols-[260px_1fr]">
      {sidebarOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] translate-x-[-100%] border-r border-zinc-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : ""}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-200 px-5 py-5">
            <p className="text-xl font-black">juol</p>
            <p className="text-xs font-semibold text-zinc-500">Admin dashboard</p>
          </div>
          <nav className="flex-1 px-3 py-4">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${tab === item.id ? "bg-[#ff6b00] text-white" : "text-zinc-600 hover:bg-zinc-50"}`}>
                <span className="block text-sm font-black">{item.label}</span>
                <span className={`block text-xs ${tab === item.id ? "text-white/75" : "text-zinc-400"}`}>{item.description}</span>
              </button>
            ))}
          </nav>
          <div className="border-t border-zinc-200 p-4">
            <p className="truncate text-xs font-bold text-zinc-500">{adminEmail}</p>
            <button onClick={signOut} className="mt-3 w-full rounded-full border border-zinc-200 px-4 py-2 text-xs font-black">Salir</button>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="rounded-full border border-zinc-200 px-3 py-2 text-sm font-black lg:hidden">Menú</button>
              <div>
                <h1 className="text-xl font-black">{activeTab.label}</h1>
                <p className="hidden text-xs font-semibold text-zinc-500 sm:block">{activeTab.description}</p>
              </div>
            </div>
            <button onClick={() => refresh()} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">Actualizar</button>
          </div>
        </header>

        <div className="px-4 py-6 md:px-8">
          {message && <div className="mb-5 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>}
          {loading && !data ? <div className="border-y border-zinc-200 py-8 text-sm font-bold text-zinc-500">Cargando datos...</div> : null}
          {data && tab === "resumen" && <Resumen data={data} />}
          {data && tab === "partidos" && <Partidos data={data} selected={selectedPartidos} setSelected={setSelectedPartidos} onEstado={updatePartido} onDeleteSelected={deleteSelectedPartidos} />}
          {data && tab === "jugadores" && <Jugadores users={data.users} />}
          {data && tab === "beneficios" && <Beneficios banners={data.banners} form={bannerForm} setForm={setBannerForm} onSubmit={saveBanner} onDelete={(id) => deleteRow("banners", id)} onUpload={uploadBannerImage} uploading={uploading} />}
          {data && tab === "solicitudes" && <Solicitudes data={data} onDelete={deleteRow} />}
          {data && tab === "reportes" && <Reportes reportes={data.reportes} onDelete={(id) => deleteRow("reportes", id)} />}
        </div>
      </section>
    </main>
  );
}

function Resumen({ data }: { data: AdminData }) {
  const metrics = [
    ["Jugadores", data.metrics.users],
    ["Partidos", data.metrics.partidos],
    ["Activos", data.metrics.partidosActivos],
    ["Confirmaciones", data.metrics.confirmados],
    ["Reportes", data.metrics.reportes],
    ["Soporte", data.metrics.soporte],
    ["Comercial", data.metrics.contacto],
    ["Leads Pro", data.metrics.proLeads],
  ];
  return <div className="grid border-t border-l border-zinc-200 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="border-r border-b border-zinc-200 p-5"><p className="text-xs font-black text-zinc-400">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></div>)}</div>;
}

function Partidos({ data, selected, setSelected, onEstado, onDeleteSelected }: { data: AdminData; selected: string[]; setSelected: (ids: string[]) => void; onEstado: (id: string, estado: string) => void; onDeleteSelected: () => void }) {
  const allVisibleSelected = data.partidos.length > 0 && data.partidos.every((p) => selected.includes(p.id));
  function toggle(id: string) { setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]); }
  function toggleAll() { setSelected(allVisibleSelected ? [] : data.partidos.map((p) => p.id)); }

  return <div><div className="mb-4 flex flex-col gap-3 border-y border-zinc-200 py-3 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 text-sm font-black"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} /> Seleccionar visibles</label><button onClick={onDeleteSelected} disabled={selected.length === 0} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white disabled:opacity-30">Eliminar seleccionados ({selected.length})</button></div><div className="divide-y divide-zinc-200 border-y border-zinc-200">{data.partidos.map((p) => { const conf = data.confirmacionesPorPartido[p.id] || { confirmados: 0, cancelados: 0 }; return <article key={p.id} className="grid gap-4 py-4 md:grid-cols-[32px_1fr_auto] md:items-center"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="mt-1 md:mt-0" /><div><p className="text-xs font-black text-[#ff6b00]">{shortId(p.id)} · {p.privacidad || "publico"}</p><h3 className="mt-1 text-base font-black">{p.direccion_texto || "Sin dirección"}</h3><p className="mt-1 text-sm text-zinc-500">{formatDate(p.hora_partido)} · Organiza: {p.convocante?.nombre || "-"}</p><p className="mt-2 text-sm font-bold text-zinc-700">{conf.confirmados}/{p.jugadores_necesarios || "?"} confirmados · {conf.cancelados} cancelados</p></div><select value={p.estado} onChange={(e) => onEstado(p.id, e.target.value)} className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm font-black"><option value="activo">activo</option><option value="completo">completo</option><option value="cancelado">cancelado</option><option value="finalizado">finalizado</option><option value="abandonado">abandonado</option></select></article>; })}</div></div>;
}

function Jugadores({ users }: { users: AnyRow[] }) {
  return <div className="overflow-x-auto border-y border-zinc-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs font-black text-zinc-400"><tr className="border-b border-zinc-200"><th className="p-4">Jugador</th><th>Género</th><th>Teléfono</th><th>Radio</th><th>Creado</th><th>Última ubicación</th></tr></thead><tbody>{users.map((u) => <tr key={u.id} className="border-b border-zinc-100"><td className="p-4"><b>{u.nombre || "Sin nombre"}</b><p className="text-xs text-zinc-400">{shortId(u.id)}</p></td><td>{u.genero || "-"}</td><td>{u.telefono || "-"}</td><td>{u.radio_km || "-"} km</td><td>{formatDate(u.created_at)}</td><td>{formatDate(u.ultima_ubicacion_at)}</td></tr>)}</tbody></table></div>;
}

function Beneficios({ banners, form, setForm, onSubmit, onDelete, onUpload, uploading }: { banners: AnyRow[]; form: AnyRow; setForm: (row: AnyRow) => void; onSubmit: (e: FormEvent) => void; onDelete: (id: string) => void; onUpload: (file?: File | null) => void; uploading: boolean }) {
  return <div className="grid gap-8 xl:grid-cols-[380px_1fr]"><form onSubmit={onSubmit} className="border-y border-zinc-200 py-5"><h2 className="text-xl font-black">{form.id ? "Editar beneficio" : "Nuevo beneficio"}</h2><label className="mt-5 block"><span className="text-xs font-black text-zinc-400">Imagen desde escritorio</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onUpload(e.target.files?.[0])} className="mt-2 block w-full text-sm" /></label>{uploading && <p className="mt-2 text-sm font-bold text-[#ff6b00]">Subiendo imagen...</p>}{form.imagen_url && <div className="mt-3 overflow-hidden border border-zinc-200"><img src={form.imagen_url} alt="Preview" className="w-full" /></div>}<Input label="Título" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} /><Input label="Subtítulo" value={form.subtitulo} onChange={(v) => setForm({ ...form, subtitulo: v })} /><Input label="Imagen URL" value={form.imagen_url} onChange={(v) => setForm({ ...form, imagen_url: v })} /><Input label="Enlace URL" value={form.enlace_url} onChange={(v) => setForm({ ...form, enlace_url: v })} /><Textarea label="Descripción de la promo" value={form.descripcion_interna} onChange={(v) => setForm({ ...form, descripcion_interna: v })} /><Input label="Orden" type="number" value={form.orden} onChange={(v) => setForm({ ...form, orden: Number(v) })} /><label className="mt-3 block text-xs font-black text-zinc-400">Ubicación</label><select value={form.ubicacion_publicitaria} onChange={(e) => setForm({ ...form, ubicacion_publicitaria: e.target.value })} className="mt-1 h-11 w-full border border-zinc-200 bg-white px-3"><option value="principal">principal</option><option value="secundaria">secundaria</option></select><label className="mt-4 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo</label><label className="mt-2 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.solo_imagen} onChange={(e) => setForm({ ...form, solo_imagen: e.target.checked })} /> Solo imagen</label><div className="mt-5 flex gap-2"><button className="rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-black text-white">Guardar</button><button type="button" onClick={() => setForm(emptyBanner)} className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-black">Limpiar</button></div></form><div className="divide-y divide-zinc-200 border-y border-zinc-200">{banners.map((b) => <article key={b.id} className="py-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black text-[#ff6b00]">{b.ubicacion_publicitaria} · orden {b.orden} · {b.activo ? "activo" : "inactivo"}</p><h3 className="mt-1 text-lg font-black">{b.titulo || "Sin título"}</h3><p className="text-sm text-zinc-500">{b.subtitulo || b.imagen_url || "Sin detalle"}</p></div><div className="flex gap-2"><button onClick={() => setForm({ ...emptyBanner, ...b })} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-black">Editar</button><button onClick={() => onDelete(b.id)} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">Eliminar</button></div></div></article>)}</div></div>;
}

function Solicitudes({ data, onDelete }: { data: AdminData; onDelete: (table: string, id: string) => void }) {
  return <div className="grid gap-8 lg:grid-cols-2"><List title="Soporte" rows={data.soporte} table="soporte" onDelete={onDelete} primary="asunto" secondary="mensaje" /><List title="Comercial" rows={data.contacto} table="contacto_comercial" onDelete={onDelete} primary="tipo" secondary="mensaje" /><List title="Pro app" rows={data.proInteresados} table="pro_interesados" onDelete={onDelete} primary="email" secondary="usuario.nombre" /><List title="Pro web" rows={data.proWaitlist} table="pro_waitlist_web" onDelete={onDelete} primary="email" secondary="created_at" /></div>;
}

function Reportes({ reportes, onDelete }: { reportes: AnyRow[]; onDelete: (id: string) => void }) {
  return <div className="divide-y divide-zinc-200 border-y border-zinc-200">{reportes.map((r) => <article key={r.id} className="py-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-black text-[#ff6b00]">{formatDate(r.created_at)} · partido {shortId(r.partido_id)}</p><h3 className="mt-1 text-lg font-black">{r.motivo}</h3><p className="mt-1 text-sm text-zinc-500">{r.detalle || "Sin detalle"}</p><p className="mt-2 text-xs font-bold text-zinc-400">Reporta: {r.usuario?.nombre || shortId(r.reportado_por)}</p></div><button onClick={() => onDelete(r.id)} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">Eliminar</button></div></article>)}</div>;
}

function List({ title, rows, table, onDelete, primary, secondary }: { title: string; rows: AnyRow[]; table: string; onDelete: (table: string, id: string) => void; primary: string; secondary: string }) {
  const get = (row: AnyRow, key: string) => key.split(".").reduce((acc, part) => acc?.[part], row);
  return <section><h2 className="text-xl font-black">{title}</h2><div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">{rows.length === 0 ? <p className="py-5 text-sm text-zinc-500">Sin registros.</p> : rows.map((row) => <article key={row.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-[#ff6b00]">{formatDate(row.created_at)}</p><h3 className="mt-1 font-black">{String(get(row, primary) || row.email || row.nombre || "Sin título")}</h3><p className="mt-1 text-sm leading-5 text-zinc-500">{String(get(row, secondary) || row.email || "-")}</p></div><button onClick={() => onDelete(table, row.id)} className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-black">Eliminar</button></div></article>)}</div></section>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return <label className="mt-3 block"><span className="text-xs font-black text-zinc-400">{label}</span><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>;
}


function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="mt-3 block"><span className="text-xs font-black text-zinc-400">{label}</span><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={4} className="mt-1 w-full resize-y border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-[#ff6b00]" /></label>;
}

