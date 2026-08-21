"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";

type AnyRow = Record<string, any>;
type Vista = "torneos" | "equipos" | "fixture" | "goleadores";

const emptyTorneo = {
  id: "", nombre: "", descripcion: "", portada_url: "", inicio_at: "",
  ubicacion_texto: "", precio_inscripcion: "", cupo_equipos: 8,
  clasificados_por_grupo: 2, estado: "borrador", inscripciones_abiertas: true,
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
    publicado: "bg-blue-100 text-blue-700",
    en_curso: "bg-emerald-100 text-emerald-700",
    finalizado: "bg-zinc-100 text-zinc-600",
    cancelado: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[estado] || "bg-zinc-100 text-zinc-600"}`}>{estado}</span>;
}

export function AdminTorneos({ api }: { api: (path: string, options?: RequestInit) => Promise<any> }) {
  const [vista, setVista] = useState<Vista>("torneos");
  const [torneos, setTorneos] = useState<AnyRow[]>([]);
  const [torneoForm, setTorneoForm] = useState<AnyRow>(emptyTorneo);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>("");

  const [equiposData, setEquiposData] = useState<{ equipos: AnyRow[]; roster: AnyRow[]; agentesLibres: AnyRow[] } | null>(null);
  const [nuevoEquipoAgrupado, setNuevoEquipoAgrupado] = useState("");
  const [seleccionAgentes, setSeleccionAgentes] = useState<string[]>([]);

  const [partidos, setPartidos] = useState<AnyRow[]>([]);
  const [goleadores, setGoleadores] = useState<AnyRow[]>([]);
  const [golForm, setGolForm] = useState({ equipo_id: "", jugador_id: "", goles: "0" });

  async function cargarTorneos() {
    setLoading(true);
    try {
      const json = await api("/api/admin/torneos");
      setTorneos(json.torneos || []);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargarTorneos(); }, []);

  async function cargarEquipos(torneoId: string) {
    if (!torneoId) return;
    setLoading(true);
    try {
      const json = await api(`/api/admin/torneos/equipos?torneo_id=${torneoId}`);
      setEquiposData({ equipos: json.equipos || [], roster: json.roster || [], agentesLibres: json.agentesLibres || [] });
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  async function cargarFixture(torneoId: string) {
    if (!torneoId) return;
    setLoading(true);
    try {
      const [fJson, gJson] = await Promise.all([
        api(`/api/admin/torneos/fixture?torneo_id=${torneoId}`),
        api(`/api/admin/torneos/goleadores?torneo_id=${torneoId}`),
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
      await api("/api/admin/torneos", { method: torneoForm.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setTorneoForm(emptyTorneo);
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function toggleVisibilidad(t: AnyRow) {
    const nuevoEstado = t.estado === "borrador" ? "publicado" : "borrador";
    try {
      await api("/api/admin/torneos", { method: "PATCH", body: JSON.stringify({ id: t.id, estado: nuevoEstado }) });
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function eliminarTorneo(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Se borran también sus equipos, fixture y goleadores. No se puede deshacer.`)) return;
    try {
      await api(`/api/admin/torneos?id=${id}`, { method: "DELETE" });
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
      await api("/api/admin/torneos/equipos", { method: "PATCH", body: JSON.stringify({ id: equipoId, estado: "inscripcion" }) });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function actualizarGrupo(equipoId: string, grupo_fase: string) {
    try {
      await api("/api/admin/torneos/equipos", { method: "PATCH", body: JSON.stringify({ id: equipoId, grupo_fase: grupo_fase || null }) });
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function agruparAgentes() {
    if (!nuevoEquipoAgrupado.trim() || seleccionAgentes.length === 0) return;
    try {
      await api("/api/admin/torneos/equipos/agrupar", {
        method: "POST",
        body: JSON.stringify({ torneo_id: torneoSeleccionado, nombre: nuevoEquipoAgrupado.trim(), agente_libre_ids: seleccionAgentes }),
      });
      setNuevoEquipoAgrupado("");
      setSeleccionAgentes([]);
      await cargarEquipos(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function generarFixture() {
    try {
      await api("/api/admin/torneos/fixture", { method: "POST", body: JSON.stringify({ torneo_id: torneoSeleccionado }) });
      await cargarFixture(torneoSeleccionado);
      await cargarTorneos();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function poblarLlave(force: boolean) {
    try {
      await api("/api/admin/torneos/fixture?action=poblar_llave", { method: "POST", body: JSON.stringify({ torneo_id: torneoSeleccionado, force }) });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function guardarResultado(partidoId: string, goles_local: string, goles_visitante: string) {
    try {
      await api("/api/admin/torneos/fixture", {
        method: "PATCH",
        body: JSON.stringify({ partido_id: partidoId, goles_local: Number(goles_local), goles_visitante: Number(goles_visitante), estado: "jugado" }),
      });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function overrideEquipos(partidoId: string, equipoLocalId: string, equipoVisitanteId: string) {
    try {
      await api("/api/admin/torneos/fixture", {
        method: "PATCH",
        body: JSON.stringify({ partido_id: partidoId, equipo_local_id: equipoLocalId || null, equipo_visitante_id: equipoVisitanteId || null }),
      });
      await cargarFixture(torneoSeleccionado);
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function guardarGoleador() {
    if (!golForm.equipo_id || !golForm.jugador_id) return;
    try {
      await api("/api/admin/torneos/goleadores", {
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
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Inicio</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Equipos</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {torneos.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-100 hover:bg-orange-50/30">
                      <td className="px-4 py-3 font-bold text-zinc-900">{t.nombre}</td>
                      <td className="px-4 py-3 text-zinc-600">{t.inicio_at ? new Date(t.inicio_at).toLocaleDateString("es-PY") : "-"}</td>
                      <td className="px-4 py-3"><EstadoPill estado={t.estado} /></td>
                      <td className="px-4 py-3 text-zinc-600">{t.equipos_inscripcion} inscriptos · {t.equipos_preinscripcion} preinscriptos</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setTorneoForm({ ...t, precio_inscripcion: t.precio_inscripcion ?? "" })} className="text-xs font-bold text-[#FD7401] hover:underline">Editar</button>
                        <button onClick={() => toggleVisibilidad(t)} className="ml-3 text-xs font-bold text-zinc-500 hover:underline">
                          {t.estado === "borrador" ? "Publicar" : "Ocultar"}
                        </button>
                        <button onClick={() => eliminarTorneo(t.id, t.nombre)} className="ml-3 text-xs font-bold text-red-600 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {torneos.length === 0 && !loading && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-400">Sin torneos todavía.</td></tr>
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
              <Field label="Cupo de equipos" type="number" value={torneoForm.cupo_equipos} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, cupo_equipos: v }))} />
              <Field label="Clasificados por grupo" type="number" value={torneoForm.clasificados_por_grupo} onChange={(v) => setTorneoForm((p: AnyRow) => ({ ...p, clasificados_por_grupo: v }))} />
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
              {equiposData.equipos.map((eq) => (
                <div key={eq.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900">{eq.nombre}</p>
                    <EstadoPill estado={eq.estado} />
                  </div>
                  <input
                    defaultValue={eq.grupo_fase || ""}
                    placeholder="Grupo"
                    onBlur={(e) => e.target.value !== (eq.grupo_fase || "") && actualizarGrupo(eq.id, e.target.value)}
                    className="h-9 w-20 rounded-lg border border-zinc-200 px-2 text-center text-sm outline-none focus:border-[#FD7401]"
                  />
                  {eq.estado === "preinscripcion" && (
                    <button onClick={() => confirmarPago(eq.id)} className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700">
                      Confirmar pago
                    </button>
                  )}
                </div>
              ))}
              {equiposData.equipos.length === 0 && <EmptyStateText text="Sin equipos todavía." />}
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

      {vista === "fixture" && torneoSeleccionado && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button onClick={generarFixture} disabled={!!equiposDelTorneo?.fixture_generado_at} className="h-10 rounded-xl bg-[#FD7401] px-4 text-sm font-bold text-white disabled:opacity-40">
              Generar fixture
            </button>
            <button onClick={() => poblarLlave(false)} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-600 hover:border-[#FD7401]">
              Poblar llave
            </button>
            <button onClick={() => poblarLlave(true)} className="h-10 rounded-xl border border-zinc-200 px-4 text-xs font-bold text-zinc-400 hover:border-[#FD7401]">
              Poblar llave (forzar)
            </button>
          </div>

          <Card className="p-4">
            <h3 className="mb-2 text-sm font-black">Fase de grupos</h3>
            <div className="space-y-2">
              {partidosGrupos.map((p) => (
                <PartidoRow key={p.id} partido={p} nombreEquipo={nombreEquipo} onGuardarResultado={guardarResultado} />
              ))}
              {partidosGrupos.length === 0 && <EmptyStateText text="Todavía no se generó el fixture." />}
            </div>
          </Card>

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
        </div>
      )}

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
                  {equiposData.roster.filter((r) => r.equipo_id === golForm.equipo_id).map((r) => (
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

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      {multiline ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FD7401]" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
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
