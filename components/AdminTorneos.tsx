"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";

type AnyRow = Record<string, any>;
type Vista = "torneos" | "equipos" | "fixture" | "goleadores";

const emptyTorneo = {
  id: "", nombre: "", descripcion: "", portada_url: "", inicio_at: "",
  ubicacion_texto: "", precio_inscripcion: "", cupo_equipos: 8, formato: "grupos_mata_mata",
  clasificados_por_grupo: 2, estado: "borrador", inscripciones_abiertas: true,
};

const FORMATO_LABEL: Record<string, string> = {
  grupos_mata_mata: "Fase de grupos + mata-mata",
  liguilla: "Liguilla (todos contra todos)",
  mata_mata: "Mata-mata puro",
  cuadrangular: "Cuadrangular (4 equipos)",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error.";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>;
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

function EstadoPill({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    preinscripcion: "bg-amber-100 text-amber-700",
    inscripcion: "bg-emerald-100 text-emerald-700",
    borrador: "bg-zinc-100 text-zinc-600",
    en_revision: "bg-violet-100 text-violet-700",
    publicado: "bg-blue-100 text-blue-700",
    en_curso: "bg-emerald-100 text-emerald-700",
    finalizado: "bg-zinc-100 text-zinc-600",
    cancelado: "bg-red-100 text-red-700",
  };
  const label: Record<string, string> = { en_revision: "en revisión" };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[estado] || "bg-zinc-100 text-zinc-600"}`}>{label[estado] || estado}</span>;
}

export function AdminTorneos({ api, basePath = "/api/admin/torneos" }: { api: (path: string, options?: RequestInit) => Promise<any>; basePath?: string }) {
  const [vista, setVista] = useState<Vista>("torneos");
  const [torneos, setTorneos] = useState<AnyRow[]>([]);
  const [torneoForm, setTorneoForm] = useState<AnyRow>(emptyTorneo);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>("");

  const [equiposData, setEquiposData] = useState<{ equipos: AnyRow[]; roster: AnyRow[]; agentesLibres: AnyRow[]; invitaciones: AnyRow[] } | null>(null);
  const [nuevoEquipoAgrupado, setNuevoEquipoAgrupado] = useState("");
  const [seleccionAgentes, setSeleccionAgentes] = useState<string[]>([]);
  const [nuevoEquipoManual, setNuevoEquipoManual] = useState("");
  const [creandoEquipoManual, setCreandoEquipoManual] = useState(false);
  const [jugadorForm, setJugadorForm] = useState<Record<string, { nombre: string; telefono: string; email: string }>>({});
  const [agregandoJugadorEn, setAgregandoJugadorEn] = useState<string>("");

  const [partidos, setPartidos] = useState<AnyRow[]>([]);
  const [goleadores, setGoleadores] = useState<AnyRow[]>([]);
  const [golForm, setGolForm] = useState({ equipo_id: "", jugador_id: "", goles: "0" });

  async function cargarTorneos() {
    setLoading(true);
    try {
      const json = await api(basePath);
      setTorneos(json.torneos || []);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargarTorneos(); }, []);

  async function cargarEquipos(torneoId: string) {
    if (!torneoId) return;
    setLoading(true);
    try {
      const json = await api(`${basePath}/equipos?torneo_id=${torneoId}`);
      setEquiposData({ equipos: json.equipos || [], roster: json.roster || [], agentesLibres: json.agentesLibres || [], invitaciones: json.invitaciones || [] });
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  async function cargarFixture(torneoId: string) {
    if (!torneoId) return;
    setLoading(true);
    try {
      const [fJson, gJson] = await Promise.all([
        api(`${basePath}/fixture?torneo_id=${torneoId}`),
        api(`${basePath}/goleadores?torneo_id=${torneoId}`),
      ]);
      setPartidos(fJson.partidos || []);
      setGoleadores(gJson.goleadores || []);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!torneoSeleccionado) return;
    if (vista === "equipos") cargarEquipos(torneoSeleccionado);
    if (vista === "fixture" || vista === "goleadores") cargarFixture(torneoSeleccionado);
  }, [torneoSeleccionado, vista]);

  async function saveTorneo(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { ...torneoForm, precio_inscripcion: torneoForm.precio_inscripcion || null };
      await api(basePath, { method: torneoForm.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setTorneoForm(emptyTorneo);
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function toggleVisibilidad(t: AnyRow) {
    const nuevoEstado = t.estado === "borrador" ? "publicado" : "borrador";
    try {
      await api(basePath, { method: "PATCH", body: JSON.stringify({ id: t.id, estado: nuevoEstado }) });
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function aprobarTorneo(id: string) {
    try {
      await api(basePath, { method: "PATCH", body: JSON.stringify({ id, estado: "publicado" }) });
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function rechazarTorneo(id: string) {
    const motivo = prompt("¿Por qué lo rechazás? El organizador va a ver este motivo en su panel.");
    if (motivo == null) return;
    try {
      await api(basePath, { method: "PATCH", body: JSON.stringify({ id, estado: "borrador", motivo_rechazo: motivo.trim() || "Revisá los datos cargados." }) });
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function eliminarTorneo(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Se borran también sus equipos, fixture y goleadores. No se puede deshacer.`)) return;
    try {
      await api(`${basePath}?id=${id}`, { method: "DELETE" });
      if (torneoSeleccionado === id) setTorneoSeleccionado("");
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function uploadPortada(file?: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "torneos");
      const json = await api("/api/admin/upload", { method: "POST", body: form });
      setTorneoForm((prev: AnyRow) => ({ ...prev, portada_url: json.url }));
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setUploading(false); }
  }

  async function confirmarPago(equipoId: string) {
    try {
      await api(`${basePath}/equipos`, { method: "PATCH", body: JSON.stringify({ id: equipoId, estado: "inscripcion" }) });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function actualizarGrupo(equipoId: string, grupo_fase: string) {
    try {
      await api(`${basePath}/equipos`, { method: "PATCH", body: JSON.stringify({ id: equipoId, grupo_fase: grupo_fase || null }) });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function agruparAgentes() {
    if (!nuevoEquipoAgrupado.trim() || seleccionAgentes.length === 0) return;
    try {
      await api(`${basePath}/equipos/agrupar`, {
        method: "POST",
        body: JSON.stringify({ torneo_id: torneoSeleccionado, nombre: nuevoEquipoAgrupado.trim(), agente_libre_ids: seleccionAgentes }),
      });
      setNuevoEquipoAgrupado("");
      setSeleccionAgentes([]);
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function crearEquipoManual() {
    if (!nuevoEquipoManual.trim()) return;
    setCreandoEquipoManual(true);
    setMessage("");
    try {
      await api(`${basePath}/equipos`, {
        method: "POST",
        body: JSON.stringify({ accion: "crear_equipo", torneo_id: torneoSeleccionado, nombre: nuevoEquipoManual.trim() }),
      });
      setNuevoEquipoManual("");
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setCreandoEquipoManual(false); }
  }

  function actualizarJugadorForm(equipoId: string, campo: "nombre" | "telefono" | "email", valor: string) {
    setJugadorForm((prev) => {
      const actual = prev[equipoId] || { nombre: "", telefono: "", email: "" };
      return { ...prev, [equipoId]: { ...actual, [campo]: valor } };
    });
  }

  async function agregarJugador(equipoId: string) {
    const form = jugadorForm[equipoId];
    if (!form?.nombre.trim()) return;
    // "De buena fe": si el email coincide con una cuenta real de JUOL, el
    // jugador recibe una invitación y aparece en el roster solo si la acepta
    // desde la app — nunca queda vinculado sin su consentimiento.
    const yaCargado = equiposData?.roster.some(
      (r) => r.equipo_id === equipoId && (r.nombre_invitado || "").trim().toLowerCase() === form.nombre.trim().toLowerCase(),
    );
    if (yaCargado && !confirm(`Ya cargaste a alguien llamado "${form.nombre.trim()}" en este equipo. ¿Agregar igual?`)) return;

    setAgregandoJugadorEn(equipoId);
    setMessage("");
    try {
      await api(`${basePath}/equipos`, {
        method: "POST",
        body: JSON.stringify({
          accion: "agregar_jugador",
          equipo_id: equipoId,
          nombre: form.nombre.trim(),
          telefono: form.telefono?.trim() || null,
          email: form.email?.trim() || null,
        }),
      });
      setJugadorForm((prev) => ({ ...prev, [equipoId]: { nombre: "", telefono: "", email: "" } }));
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setAgregandoJugadorEn(""); }
  }

  async function quitarJugador(jugadorId: string) {
    if (!confirm("¿Sacar a este jugador del equipo?")) return;
    try {
      await api(`${basePath}/equipos?jugador_id=${jugadorId}`, { method: "DELETE" });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function eliminarEquipo(equipoId: string, nombre: string) {
    if (!confirm(`¿Eliminar el equipo "${nombre}"? Se borra también su plantel. No se puede deshacer.`)) return;
    try {
      await api(`${basePath}/equipos?equipo_id=${equipoId}`, { method: "DELETE" });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function generarFixture() {
    try {
      await api(`${basePath}/fixture`, { method: "POST", body: JSON.stringify({ torneo_id: torneoSeleccionado }) });
      await cargarFixture(torneoSeleccionado);
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function poblarLlave(force: boolean) {
    try {
      await api(`${basePath}/fixture?action=poblar_llave`, { method: "POST", body: JSON.stringify({ torneo_id: torneoSeleccionado, force }) });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function guardarResultado(partidoId: string, goles_local: string, goles_visitante: string) {
    try {
      await api(`${basePath}/fixture`, {
        method: "PATCH",
        body: JSON.stringify({ partido_id: partidoId, goles_local: Number(goles_local), goles_visitante: Number(goles_visitante), estado: "jugado" }),
      });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function overrideEquipos(partidoId: string, equipoLocalId: string, equipoVisitanteId: string) {
    try {
      await api(`${basePath}/fixture`, {
        method: "PATCH",
        body: JSON.stringify({ partido_id: partidoId, equipo_local_id: equipoLocalId || null, equipo_visitante_id: equipoVisitanteId || null }),
      });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function guardarGoleador() {
    if (!golForm.equipo_id || !golForm.jugador_id) return;
    try {
      await api(`${basePath}/goleadores`, {
        method: "POST",
        body: JSON.stringify({ torneo_id: torneoSeleccionado, equipo_id: golForm.equipo_id, jugador_id: golForm.jugador_id, goles: Number(golForm.goles || 0) }),
      });
      setGolForm({ equipo_id: "", jugador_id: "", goles: "0" });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  const equiposDelTorneo = torneos.find((t) => t.id === torneoSeleccionado);
  const partidosGrupos = partidos.filter((p) => p.fase === "grupos");
  const partidosBracket = partidos.filter((p) => p.fase !== "grupos");
  const nombreEquipo = (id: string | null) => equiposData?.equipos.find((e) => e.id === id)?.nombre || (id ? "—" : "Por definir");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-900">Torneos</h2>
          <p className="text-xs font-medium text-zinc-400">Catálogo, equipos, fixture y goleadores</p>
        </div>
        <div className="flex gap-2">
          <Chip active={vista === "torneos"} onClick={() => setVista("torneos")}>Torneos</Chip>
          <Chip active={vista === "equipos"} onClick={() => setVista("equipos")}>Equipos</Chip>
          <Chip active={vista === "fixture"} onClick={() => setVista("fixture")}>Fixture</Chip>
          <Chip active={vista === "goleadores"} onClick={() => setVista("goleadores")}>Goleadores</Chip>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      {vista !== "torneos" && (
        <select
          value={torneoSeleccionado}
          onChange={(e) => setTorneoSeleccionado(e.target.value)}
          className="h-11 w-full max-w-md rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]"
        >
          <option value="">Elegí un torneo…</option>
          {torneos.map((t) => <option key={t.id} value={t.id}>{t.nombre} ({t.estado})</option>)}
        </select>
      )}

      {vista === "torneos" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Nombre</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Organizador</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Inicio</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Equipos</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {torneos.map((t) => (
                    <tr key={t.id} className={`border-b border-zinc-100 hover:bg-orange-50/30 ${t.estado === "en_revision" ? "bg-violet-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-zinc-900">{t.nombre}</p>
                        <p className="text-[11px] text-zinc-400">{FORMATO_LABEL[t.formato] || FORMATO_LABEL.grupos_mata_mata}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{t.torneo_organizador?.nombre || "JUOL"}</td>
                      <td className="px-4 py-3 text-zinc-600">{t.inicio_at ? new Date(t.inicio_at).toLocaleDateString("es-PY") : "-"}</td>
                      <td className="px-4 py-3"><EstadoPill estado={t.estado} /></td>
                      <td className="px-4 py-3 text-zinc-600">{t.equipos_inscripcion} inscriptos · {t.equipos_preinscripcion} preinscriptos</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {t.estado === "en_revision" ? (
                          <>
                            <button onClick={() => aprobarTorneo(t.id)} className="text-xs font-bold text-emerald-600 hover:underline">Aprobar</button>
                            <button onClick={() => rechazarTorneo(t.id)} className="ml-3 text-xs font-bold text-red-600 hover:underline">Rechazar</button>
                          </>
                        ) : (
                          <button onClick={() => toggleVisibilidad(t)} className="text-xs font-bold text-zinc-500 hover:underline">
                            {t.estado === "borrador" ? "Publicar" : t.estado === "publicado" ? "Ocultar" : null}
                          </button>
                        )}
                        <button onClick={() => setTorneoForm({ ...t, precio_inscripcion: t.precio_inscripcion ?? "" })} className="ml-3 text-xs font-bold text-[#FD7401] hover:underline">Editar</button>
                        <button onClick={() => eliminarTorneo(t.id, t.nombre)} className="ml-3 text-xs font-bold text-red-600 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {torneos.length === 0 && !loading && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-400">Sin torneos todavía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-black text-zinc-900">{torneoForm.id ? "Editar torneo" : "Nuevo torneo"}</h3>
            <form onSubmit={saveTorneo} className="mt-3 space-y-3">
              <Field label="Nombre" value={torneoForm.nombre} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, nombre: v }))} />
              <Field label="Descripción" value={torneoForm.descripcion} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, descripcion: v }))} multiline />
              <div>
                <span className="text-xs font-bold text-zinc-500">Portada</span>
                {torneoForm.portada_url && <img src={torneoForm.portada_url} alt="" className="mt-1 h-24 w-full rounded-lg object-cover" />}
                <input type="file" accept="image/*" disabled={uploading} onChange={(e) => uploadPortada(e.target.files?.[0])} className="mt-1 block w-full text-xs" />
              </div>
              <Field label="Inicio (fecha y hora)" type="datetime-local" value={torneoForm.inicio_at?.slice(0, 16) || ""} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, inicio_at: v }))} />
              <Field label="Ubicación" value={torneoForm.ubicacion_texto} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, ubicacion_texto: v }))} />
              <Field label="Precio inscripción (Gs)" type="number" value={torneoForm.precio_inscripcion} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, precio_inscripcion: v }))} />
              <label className="block">
                <span className="text-xs font-bold text-zinc-500">Formato</span>
                <select
                  value={torneoForm.formato || "grupos_mata_mata"}
                  disabled={!!torneoForm.fixture_generado_at}
                  onChange={(e) => setTorneoForm((p: AnyRow) => ({ ...p, formato: e.target.value, cupo_equipos: e.target.value === "cuadrangular" ? 4 : p.cupo_equipos }))}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#FD7401] disabled:bg-zinc-50 disabled:text-zinc-400"
                >
                  {Object.entries(FORMATO_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
                {torneoForm.fixture_generado_at && <p className="mt-1 text-[10.5px] text-zinc-400">No se puede cambiar con el fixture ya generado.</p>}
              </label>
              <Field label="Cupo de equipos" type="number" value={torneoForm.cupo_equipos} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, cupo_equipos: v }))} disabled={torneoForm.formato === "cuadrangular"} />
              {(torneoForm.formato || "grupos_mata_mata") === "grupos_mata_mata" && (
                <Field label="Clasificados por grupo" type="number" value={torneoForm.clasificados_por_grupo} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, clasificados_por_grupo: v }))} />
              )}
              <label className="mt-1 block">
                <span className="text-xs font-bold text-zinc-500">Estado</span>
                <select value={torneoForm.estado} onChange={(e) => setTorneoForm((p: AnyRow) => ({ ...p, estado: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]">
                  {["borrador", "publicado", "en_curso", "finalizado", "cancelado"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                <input type="checkbox" checked={!!torneoForm.inscripciones_abiertas} onChange={(e) => setTorneoForm((p: AnyRow) => ({ ...p, inscripciones_abiertas: e.target.checked }))} />
                Inscripciones abiertas
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="h-10 flex-1 rounded-xl bg-[#FD7401] text-sm font-bold text-white hover:bg-orange-600">
                  {torneoForm.id ? "Guardar cambios" : "Crear torneo"}
                </button>
                {torneoForm.id && (
                  <button type="button" onClick={() => setTorneoForm(emptyTorneo)} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-500">Cancelar</button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {vista === "equipos" && torneoSeleccionado && equiposData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b border-zinc-100 px-4 py-3"><h3 className="text-sm font-black">Equipos</h3></div>
            <div className="divide-y divide-zinc-100">
              {equiposData.equipos.map((eq) => {
                const roster = equiposData.roster.filter((r) => r.equipo_id === eq.id);
                const form = jugadorForm[eq.id] || { nombre: "", telefono: "", email: "" };
                return (
                  <div key={eq.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-900">{eq.nombre}</p>
                        <EstadoPill estado={eq.estado} />
                      </div>
                      {(equiposDelTorneo?.formato || "grupos_mata_mata") === "grupos_mata_mata" && (
                        <input
                          defaultValue={eq.grupo_fase || ""}
                          placeholder="Grupo"
                          onBlur={(e) => e.target.value !== (eq.grupo_fase || "") && actualizarGrupo(eq.id, e.target.value)}
                          className="h-9 w-20 rounded-lg border border-zinc-200 px-2 text-center text-sm outline-none focus:border-[#FD7401]"
                        />
                      )}
                      {eq.estado === "preinscripcion" && (
                        <button onClick={() => confirmarPago(eq.id)} className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700">
                          Confirmar pago
                        </button>
                      )}
                      <button onClick={() => eliminarEquipo(eq.id, eq.nombre)} className="text-xs font-bold text-red-600 hover:underline">Eliminar</button>
                    </div>

                    {/* Roster — jugadores reales o cargados "de buena fe" sin cuenta */}
                    <div className="mt-2 space-y-1.5 rounded-xl bg-zinc-50 p-3">
                      {roster.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-zinc-700">
                            {r.user ? [r.user.nombre, r.user.apellido].filter(Boolean).join(" ") : (r.nombre_invitado || "—")}
                            {!r.user_id && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">invitado</span>}
                            {r.rol === "capitan" && <span className="ml-1.5 text-zinc-400">· Capitán</span>}
                          </span>
                          <button onClick={() => quitarJugador(r.id)} className="text-zinc-400 hover:text-red-600" title="Sacar del equipo">✕</button>
                        </div>
                      ))}
                      {roster.length === 0 && <p className="text-xs text-zinc-400">Sin jugadores cargados.</p>}

                      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-zinc-200 pt-2">
                        <input
                          value={form.nombre}
                          onChange={(e) => actualizarJugadorForm(eq.id, "nombre", e.target.value)}
                          placeholder="Nombre"
                          className="h-8 flex-1 min-w-[100px] rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]"
                        />
                        <input
                          value={form.telefono}
                          onChange={(e) => actualizarJugadorForm(eq.id, "telefono", e.target.value)}
                          placeholder="Teléfono (opcional)"
                          className="h-8 w-28 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]"
                        />
                        <input
                          value={form.email}
                          onChange={(e) => actualizarJugadorForm(eq.id, "email", e.target.value)}
                          placeholder="Email de Juol (opcional)"
                          className="h-8 w-36 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]"
                        />
                        <button
                          onClick={() => agregarJugador(eq.id)}
                          disabled={!form.nombre.trim() || agregandoJugadorEn === eq.id}
                          className="h-8 rounded-md bg-[#FD7401] px-3 text-xs font-bold text-white disabled:opacity-40"
                        >
                          {agregandoJugadorEn === eq.id ? "..." : "Agregar"}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        Con email de Juol: se manda invitación (el jugador tiene que aceptarla en la app). Sin email: se carga directo, de buena fe.
                      </p>
                    </div>
                  </div>
                );
              })}
              {equiposData.equipos.length === 0 && <EmptyStateText text="Sin equipos todavía." />}
            </div>
            <div className="flex gap-2 border-t border-zinc-100 p-4">
              <input
                value={nuevoEquipoManual}
                onChange={(e) => setNuevoEquipoManual(e.target.value)}
                placeholder="Nombre del equipo nuevo"
                className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]"
              />
              <button onClick={crearEquipoManual} disabled={!nuevoEquipoManual.trim() || creandoEquipoManual} className="h-10 rounded-lg bg-[#FD7401] px-3 text-xs font-bold text-white disabled:opacity-40">
                Crear equipo
              </button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-zinc-100 px-4 py-3"><h3 className="text-sm font-black">Agentes libres</h3></div>
            <div className="divide-y divide-zinc-100">
              {equiposData.agentesLibres.map((a) => (
                <label key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={seleccionAgentes.includes(a.id)}
                    onChange={(e) => setSeleccionAgentes((prev) => e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id))}
                  />
                  {[a.user?.nombre, a.user?.apellido].filter(Boolean).join(" ") || "Jugador"}
                </label>
              ))}
              {equiposData.agentesLibres.length === 0 && <EmptyStateText text="Sin agentes libres pendientes." />}
            </div>
            {equiposData.agentesLibres.length > 0 && (
              <div className="flex gap-2 border-t border-zinc-100 p-4">
                <input
                  value={nuevoEquipoAgrupado}
                  onChange={(e) => setNuevoEquipoAgrupado(e.target.value)}
                  placeholder="Nombre del equipo nuevo"
                  className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]"
                />
                <button onClick={agruparAgentes} disabled={!nuevoEquipoAgrupado.trim() || seleccionAgentes.length === 0} className="h-10 rounded-lg bg-[#FD7401] px-3 text-xs font-bold text-white disabled:opacity-40">
                  Agrupar
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {vista === "fixture" && torneoSeleccionado && (() => {
        const formatoSeleccionado = equiposDelTorneo?.formato || "grupos_mata_mata";
        const esGrupal = formatoSeleccionado === "grupos_mata_mata";
        const esLiguilla = formatoSeleccionado === "liguilla" || formatoSeleccionado === "cuadrangular";
        return (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button onClick={generarFixture} disabled={!!equiposDelTorneo?.fixture_generado_at} className="h-10 rounded-xl bg-[#FD7401] px-4 text-sm font-bold text-white disabled:opacity-40">
              Generar fixture
            </button>
            {esGrupal && (
              <>
                <button onClick={() => poblarLlave(false)} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-600 hover:border-[#FD7401]">
                  Poblar llave
                </button>
                <button onClick={() => poblarLlave(true)} className="h-10 rounded-xl border border-zinc-200 px-4 text-xs font-bold text-zinc-400 hover:border-[#FD7401]">
                  Poblar llave (forzar)
                </button>
              </>
            )}
          </div>

          {(esGrupal || esLiguilla) && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-black">{esGrupal ? "Fase de grupos" : "Todos contra todos"}</h3>
              <div className="space-y-2">
                {partidosGrupos.map((p) => (
                  <PartidoRow key={p.id} partido={p} nombreEquipo={nombreEquipo} onGuardarResultado={guardarResultado} />
                ))}
                {partidosGrupos.length === 0 && <EmptyStateText text="Todavía no se generó el fixture." />}
              </div>
            </Card>
          )}

          {(esGrupal || formatoSeleccionado === "mata_mata") && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-black">Mata-mata</h3>
              <div className="space-y-2">
                {partidosBracket.map((p) => (
                  <div key={p.id} className="space-y-1">
                    <PartidoRow partido={p} nombreEquipo={nombreEquipo} onGuardarResultado={guardarResultado} />
                    {!p.equipo_local_id && !p.equipo_visitante_id && equiposData && (
                      <div className="flex gap-2 pl-2">
                        <EquipoSelect equipos={equiposData.equipos} onChange={(id) => overrideEquipos(p.id, id, p.equipo_visitante_id)} />
                        <EquipoSelect equipos={equiposData.equipos} onChange={(id) => overrideEquipos(p.id, p.equipo_local_id, id)} />
                      </div>
                    )}
                  </div>
                ))}
                {partidosBracket.length === 0 && <EmptyStateText text="Todavía no hay llave de eliminación." />}
              </div>
            </Card>
          )}
        </div>
        );
      })()}

      {vista === "goleadores" && torneoSeleccionado && equiposData && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden">
            <div className="divide-y divide-zinc-100">
              {goleadores.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-bold text-zinc-900">{[g.jugador?.nombre, g.jugador?.apellido].filter(Boolean).join(" ")}</p>
                    <p className="text-xs text-zinc-400">{g.equipo?.nombre}</p>
                  </div>
                  <span className="text-lg font-black text-[#FD7401]">{g.goles}</span>
                </div>
              ))}
              {goleadores.length === 0 && <EmptyStateText text="Sin goleadores cargados." />}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-black text-zinc-900">Cargar / editar goleador</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-xs font-bold text-zinc-500">Equipo</span>
                <EquipoSelect equipos={equiposData.equipos} value={golForm.equipo_id} onChange={(id) => setGolForm((p) => ({ ...p, equipo_id: id }))} />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-500">Jugador</span>
                <select
                  value={golForm.jugador_id}
                  onChange={(e) => setGolForm((p) => ({ ...p, jugador_id: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]"
                >
                  <option value="">Elegí un jugador…</option>
                  {equiposData.roster.filter((r) => r.equipo_id === golForm.equipo_id && r.user_id).map((r) => (
                    <option key={r.id} value={r.user_id}>{[r.user?.nombre, r.user?.apellido].filter(Boolean).join(" ")}</option>
                  ))}
                </select>
              </label>
              <Field label="Goles" type="number" value={golForm.goles} onChange={(v) => setGolForm((p) => ({ ...p, goles: v }))} />
              <button onClick={guardarGoleador} className="h-10 w-full rounded-xl bg-[#FD7401] text-sm font-bold text-white hover:bg-orange-600">Guardar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline, disabled }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; multiline?: boolean; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      {multiline ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FD7401]" />
      ) : (
        <input type={type} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401] disabled:bg-zinc-50 disabled:text-zinc-400" />
      )}
    </label>
  );
}

function EmptyStateText({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-sm text-zinc-400">{text}</p>;
}

function EquipoSelect({ equipos, value, onChange }: { equipos: AnyRow[]; value?: string; onChange: (id: string) => void }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-9 flex-1 rounded-lg border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]">
      <option value="">Elegí equipo…</option>
      {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
    </select>
  );
}

function PartidoRow({ partido, nombreEquipo, onGuardarResultado }: { partido: AnyRow; nombreEquipo: (id: string | null) => string; onGuardarResultado: (id: string, gl: string, gv: string) => void }) {
  const [gl, setGl] = useState(String(partido.goles_local ?? ""));
  const [gv, setGv] = useState(String(partido.goles_visitante ?? ""));

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-100 px-3 py-2 text-sm">
      <span className="flex-1 truncate text-right font-medium text-zinc-700">{nombreEquipo(partido.equipo_local_id)}</span>
      <input value={gl} onChange={(e) => setGl(e.target.value)} className="h-8 w-12 rounded-md border border-zinc-200 text-center text-sm" />
      <span className="text-zinc-300">-</span>
      <input value={gv} onChange={(e) => setGv(e.target.value)} className="h-8 w-12 rounded-md border border-zinc-200 text-center text-sm" />
      <span className="flex-1 truncate font-medium text-zinc-700">{nombreEquipo(partido.equipo_visitante_id)}</span>
      <button
        onClick={() => onGuardarResultado(partido.id, gl, gv)}
        disabled={gl === "" || gv === ""}
        className="rounded-md bg-[#FD7401] px-2 py-1 text-xs font-bold text-white disabled:opacity-30"
      >
        Guardar
      </button>
    </div>
  );
}
