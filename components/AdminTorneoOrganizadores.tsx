"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useEffect, useState } from "react";

type AnyRow = Record<string, any>;

const emptyOrganizador = {
  id: "", nombre: "", slug: "", logo_url: "", descripcion: "", ciudades: "",
  contacto_telefono: "", contacto_email: "", estado: "activo", plan: "", precio_mensual: "", notas_internas: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error.";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      {multiline ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FD7401]" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
      )}
    </label>
  );
}

function EmptyStateText({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-zinc-400">{text}</p>;
}

export function AdminTorneoOrganizadores({ api }: { api: (path: string, options?: RequestInit) => Promise<any> }) {
  const [organizadores, setOrganizadores] = useState<AnyRow[]>([]);
  const [form, setForm] = useState<AnyRow>(emptyOrganizador);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailPorOrganizador, setEmailPorOrganizador] = useState<Record<string, string>>({});
  const [vinculando, setVinculando] = useState("");

  async function cargar() {
    setLoading(true);
    setMessage("");
    try {
      const json = await api("/api/admin/torneo-organizadores");
      setOrganizadores(json.organizadores || []);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        ...form,
        ciudades: typeof form.ciudades === "string" ? form.ciudades.split(",").map((c: string) => c.trim()).filter(Boolean) : form.ciudades,
        precio_mensual: form.precio_mensual || null,
      };
      await api("/api/admin/torneo-organizadores", { method: form.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setForm(emptyOrganizador);
      await cargar();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function vincular(organizadorId: string) {
    const email = (emailPorOrganizador[organizadorId] || "").trim();
    if (!email) return;
    setVinculando(organizadorId);
    setMessage("");
    try {
      await api("/api/admin/torneo-organizadores/vincular", { method: "POST", body: JSON.stringify({ torneo_organizador_id: organizadorId, email }) });
      setEmailPorOrganizador((prev) => ({ ...prev, [organizadorId]: "" }));
      await cargar();
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setVinculando(""); }
  }

  async function desvincular(userId: string) {
    if (!confirm("¿Sacarle el acceso de administración de torneos a este usuario?")) return;
    try {
      await api(`/api/admin/torneo-organizadores/vincular?user_id=${userId}`, { method: "DELETE" });
      await cargar();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-zinc-900">Organizadores</h2>
        <p className="text-xs font-medium text-zinc-400">Clientes B2B externos que gestionan sus propios torneos dentro de Juol</p>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {organizadores.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {o.logo_url ? <img src={o.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-zinc-100" />}
                  <div>
                    <p className="text-sm font-black text-zinc-900">{o.nombre}</p>
                    <p className="text-xs text-zinc-400">{o.plan || "Sin plan asignado"}{o.precio_mensual ? ` · Gs ${Number(o.precio_mensual).toLocaleString("es-PY")}/mes` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${o.estado === "activo" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{o.estado}</span>
                  <button onClick={() => setForm({ ...o, ciudades: (o.ciudades || []).join(", "), precio_mensual: o.precio_mensual ?? "" })} className="text-xs font-bold text-[#FD7401] hover:underline">Editar</button>
                </div>
              </div>

              <div className="mt-3 border-t border-zinc-100 pt-3">
                <p className="mb-2 text-xs font-bold text-zinc-500">Usuarios con acceso</p>
                {(o.usuarios || []).length === 0 && <p className="text-xs text-zinc-400">Nadie vinculado todavía.</p>}
                <div className="space-y-1.5">
                  {(o.usuarios || []).map((v: AnyRow) => (
                    <div key={v.user_id} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-700">{[v.user?.nombre, v.user?.apellido].filter(Boolean).join(" ") || v.user_id}</span>
                      <button onClick={() => desvincular(v.user_id)} className="text-zinc-400 hover:text-red-600">Quitar</button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={emailPorOrganizador[o.id] || ""}
                    onChange={(e) => setEmailPorOrganizador((prev) => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Email de la cuenta Juol a vincular"
                    className="h-9 flex-1 rounded-lg border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]"
                  />
                  <button
                    onClick={() => vincular(o.id)}
                    disabled={!emailPorOrganizador[o.id]?.trim() || vinculando === o.id}
                    className="h-9 rounded-lg bg-[#FD7401] px-3 text-xs font-bold text-white disabled:opacity-40"
                  >
                    Vincular
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {organizadores.length === 0 && !loading && <Card><EmptyStateText text="Sin organizadores todavía." /></Card>}
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-black text-zinc-900">{form.id ? "Editar organizador" : "Nuevo organizador"}</h3>
          <form onSubmit={guardar} className="mt-3 space-y-3">
            <Field label="Nombre" value={form.nombre} onChange={(v) => setForm((p: AnyRow) => ({ ...p, nombre: v }))} />
            <div>
              <span className="text-xs font-bold text-zinc-500">Logo</span>
              {form.logo_url && <img src={form.logo_url} alt="" className="mt-1 h-16 w-16 rounded-lg object-cover" />}
              <Field label="" value={form.logo_url} onChange={(v) => setForm((p: AnyRow) => ({ ...p, logo_url: v }))} type="url" />
            </div>
            <Field label="Descripción" value={form.descripcion} onChange={(v) => setForm((p: AnyRow) => ({ ...p, descripcion: v }))} multiline />
            <Field label="Ciudades (separadas por coma)" value={form.ciudades} onChange={(v) => setForm((p: AnyRow) => ({ ...p, ciudades: v }))} />
            <Field label="Contacto — teléfono" value={form.contacto_telefono} onChange={(v) => setForm((p: AnyRow) => ({ ...p, contacto_telefono: v }))} />
            <Field label="Contacto — email" value={form.contacto_email} onChange={(v) => setForm((p: AnyRow) => ({ ...p, contacto_email: v }))} />
            <Field label="Plan" value={form.plan} onChange={(v) => setForm((p: AnyRow) => ({ ...p, plan: v }))} />
            <Field label="Precio mensual (Gs)" type="number" value={form.precio_mensual} onChange={(v) => setForm((p: AnyRow) => ({ ...p, precio_mensual: v }))} />
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">Estado</span>
              <select value={form.estado} onChange={(e) => setForm((p: AnyRow) => ({ ...p, estado: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </label>
            <Field label="Notas internas (no las ve el organizador)" value={form.notas_internas} onChange={(v) => setForm((p: AnyRow) => ({ ...p, notas_internas: v }))} multiline />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="h-10 flex-1 rounded-xl bg-[#FD7401] text-sm font-bold text-white hover:bg-orange-600">
                {form.id ? "Guardar cambios" : "Crear organizador"}
              </button>
              {form.id && (
                <button type="button" onClick={() => setForm(emptyOrganizador)} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-500">Cancelar</button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
