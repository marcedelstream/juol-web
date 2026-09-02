"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";

type AnyRow = Record<string, any>;
type Seccion = "estado" | "fixture" | "posiciones" | "llave" | "goleadores" | "equipos" | "ajustes";
type Organizador = { id: string; nombre: string; logo_url?: string | null };
type Api = (path: string, options?: RequestInit) => Promise<any>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error.";
}

const ESTADO_LABEL: Record<string, string> = {
  borrador: "Borrador", en_revision: "En revisión", publicado: "Inscripción abierta", en_curso: "En curso", finalizado: "Finalizado", cancelado: "Cancelado",
};
const ESTADO_TONO: Record<string, string> = {
  borrador: "bg-zinc-100 text-zinc-600",
  en_revision: "bg-violet-100 text-violet-700",
  publicado: "bg-amber-100 text-amber-700",
  en_curso: "bg-emerald-100 text-emerald-700",
  finalizado: "bg-zinc-100 text-zinc-600",
  cancelado: "bg-red-100 text-red-700",
};

const FASE_LABEL: Record<string, string> = { octavos: "Octavos de final", cuartos: "Cuartos de final", semifinal: "Semifinal", final: "Final" };

const FORMATO_LABEL: Record<string, string> = {
  grupos_mata_mata: "Fase de grupos + mata-mata",
  liguilla: "Liguilla (todos contra todos)",
  mata_mata: "Mata-mata puro",
  cuadrangular: "Cuadrangular (4 equipos)",
};

const NAV: { id: Seccion; label: string }[] = [
  { id: "estado", label: "Estado del torneo" },
  { id: "fixture", label: "Fixture y resultados" },
  { id: "posiciones", label: "Posiciones" },
  { id: "llave", label: "Llave final" },
  { id: "goleadores", label: "Goleadores" },
  { id: "equipos", label: "Equipos y planteles" },
  { id: "ajustes", label: "Datos del torneo" },
];

// 'posiciones' no aplica a mata-mata puro (no hay tabla de todos-contra-todos);
// 'llave' no aplica a liguilla/cuadrangular (no hay instancia eliminatoria).
function navParaFormato(formato: string) {
  return NAV.filter((n) => {
    if (n.id === "posiciones") return formato !== "mata_mata";
    if (n.id === "llave") return formato === "grupos_mata_mata" || formato === "mata_mata";
    return true;
  });
}

function Pill({ estado }: { estado: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ESTADO_TONO[estado] || ESTADO_TONO.borrador}`}>{ESTADO_LABEL[estado] || estado}</span>;
}

function StatCard({ label, value, detail, tono }: { label: string; value: string; detail?: string; tono?: "normal" | "aviso" }) {
  const aviso = tono === "aviso";
  return (
    <div className={`rounded-2xl border p-4 ${aviso ? "border-orange-200 bg-orange-50" : "border-zinc-200 bg-white"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-wide ${aviso ? "text-orange-600" : "text-zinc-400"}`}>{label}</p>
      <p className={`mt-1.5 text-xl font-black ${aviso ? "text-orange-600" : "text-zinc-900"}`}>{value}</p>
      {detail && <p className="mt-0.5 text-xs font-medium text-zinc-500">{detail}</p>}
    </div>
  );
}

function nombreJugador(j: AnyRow | undefined) {
  if (!j) return "Jugador";
  return j.user ? [j.user.nombre, j.user.apellido].filter(Boolean).join(" ") : (j.nombre_invitado || "Jugador");
}

function nombreEquipoDe(equipos: AnyRow[], id: string | null) {
  if (!id) return "Por definir";
  return equipos.find((e) => e.id === id)?.nombre || "—";
}

export function OrganizadorPanel({ api, organizador, onSignOut }: { api: Api; organizador: Organizador; onSignOut: () => void }) {
  const [torneos, setTorneos] = useState<AnyRow[]>([]);
  const [torneoId, setTorneoId] = useState("");
  const [seccion, setSeccion] = useState<Seccion>("estado");
  const [switcherAbierto, setSwitcherAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [equiposData, setEquiposData] = useState<{ equipos: AnyRow[]; roster: AnyRow[]; agentesLibres: AnyRow[] } | null>(null);
  const [partidos, setPartidos] = useState<AnyRow[]>([]);
  const [golesPorPartido, setGolesPorPartido] = useState<AnyRow[]>([]);
  const [goleadores, setGoleadores] = useState<AnyRow[]>([]);

  const [drawerPartidoId, setDrawerPartidoId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ gl: number; gv: number; goles: Record<string, number> } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [filtroFixture, setFiltroFixture] = useState<string>("todos");

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [creandoTorneo, setCreandoTorneo] = useState(false);

  const torneo = torneos.find((t) => t.id === torneoId) || null;
  const formato = torneo?.formato || "grupos_mata_mata";
  const esFormatoGrupal = formato === "grupos_mata_mata";
  const esFormatoLiguilla = formato === "liguilla" || formato === "cuadrangular";

  async function cargarTorneos() {
    setLoading(true);
    try {
      const json = await api("/api/torneo-organizador/torneos");
      const lista = json.torneos || [];
      setTorneos(lista);
      setTorneoId((prev) => (prev && lista.some((t: AnyRow) => t.id === prev) ? prev : lista[0]?.id || ""));
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  async function cargarDetalle(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const [eq, fx, gl] = await Promise.all([
        api(`/api/torneo-organizador/torneos/equipos?torneo_id=${id}`),
        api(`/api/torneo-organizador/torneos/fixture?torneo_id=${id}`),
        api(`/api/torneo-organizador/torneos/goleadores?torneo_id=${id}`),
      ]);
      setEquiposData({ equipos: eq.equipos || [], roster: eq.roster || [], agentesLibres: eq.agentesLibres || [] });
      setPartidos(fx.partidos || []);
      setGolesPorPartido(fx.golesPorPartido || []);
      setGoleadores(gl.goleadores || []);
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargarTorneos(); }, []);
  useEffect(() => { if (torneoId) cargarDetalle(torneoId); }, [torneoId]);
  useEffect(() => {
    if (!navParaFormato(formato).some((n) => n.id === seccion)) setSeccion("estado");
  }, [formato]);

  async function refrescarDetalle() {
    await cargarDetalle(torneoId);
    await cargarTorneos();
  }

  const equipos = equiposData?.equipos || [];
  const roster = equiposData?.roster || [];
  const partidosGrupos = partidos.filter((p) => p.fase === "grupos");
  const partidosBracket = partidos.filter((p) => p.fase !== "grupos");
  const pendientes = partidos.filter((p) => p.estado !== "jugado" && p.equipo_local_id && p.equipo_visitante_id);
  const jugados = partidos.filter((p) => p.estado === "jugado");

  const tabla = useMemo(() => {
    const acc: Record<string, AnyRow> = {};
    // Liguilla/cuadrangular no usan grupo_fase (no hay grupos) — se trata a
    // todos los equipos como una única tabla para que la sección Posiciones
    // no dependa de un campo que en este formato nunca se carga.
    equipos.forEach((e) => { acc[e.id] = { id: e.id, nombre: e.nombre, grupo: esFormatoLiguilla ? "unica" : e.grupo_fase, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }; });
    partidosGrupos.filter((p) => p.estado === "jugado").forEach((p) => {
      const l = acc[p.equipo_local_id]; const v = acc[p.equipo_visitante_id];
      if (!l || !v) return;
      l.pj++; v.pj++; l.gf += p.goles_local; l.gc += p.goles_visitante; v.gf += p.goles_visitante; v.gc += p.goles_local;
      if (p.goles_local > p.goles_visitante) { l.g++; v.p++; } else if (p.goles_local < p.goles_visitante) { v.g++; l.p++; } else { l.e++; v.e++; }
    });
    return Object.values(acc).map((r: AnyRow): AnyRow => ({ ...r, dg: r.gf - r.gc, pts: r.g * 3 + r.e }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }, [equipos, partidosGrupos, esFormatoLiguilla]);

  const grupos = Array.from(new Set(tabla.map((r) => r.grupo).filter(Boolean))).sort();
  const clasificadosPorGrupo = torneo?.clasificados_por_grupo ?? 2;

  const golesCargados = jugados.reduce((a, p) => a + (p.goles_local || 0) + (p.goles_visitante || 0), 0);
  const golesAsignados = golesPorPartido.reduce((a, g) => a + g.goles, 0);
  const golesSinAsignar = golesCargados - golesAsignados;

  const rondaMin = partidosBracket.length ? Math.min(...partidosBracket.map((p) => p.ronda ?? 0)) : null;
  const llaveArmada = rondaMin != null && partidosBracket.filter((p) => (p.ronda ?? 0) === rondaMin).every((p) => p.equipo_local_id && p.equipo_visitante_id);

  const pasos = [
    { id: 1, hecho: equipos.some((e) => e.estado === "inscripcion"), titulo: "Equipos inscriptos", detalle: `${equipos.filter((e) => e.estado === "inscripcion").length} con pago confirmado` },
    { id: 2, hecho: !!torneo?.fixture_generado_at, titulo: esFormatoGrupal ? "Fixture generado" : "Llave / fixture generado", detalle: torneo?.fixture_generado_at ? `${partidos.length} partidos` : "Generalo desde Fixture" },
    ...(esFormatoGrupal
      ? [
          { id: 3, hecho: partidosGrupos.length > 0 && partidosGrupos.every((p) => p.estado === "jugado"), titulo: "Cargar resultados de grupos", detalle: `${jugados.filter((p) => p.fase === "grupos").length} de ${partidosGrupos.length} cargados` },
          { id: 4, hecho: llaveArmada, titulo: "Poblar la llave final", detalle: "Se habilita al cerrar los grupos" },
        ]
      : [
          { id: 3, hecho: partidos.length > 0 && partidos.every((p) => p.estado === "jugado"), titulo: "Cargar todos los resultados", detalle: `${jugados.length} de ${partidos.length} cargados` },
        ]),
    { id: 5, hecho: torneo?.estado === "finalizado", titulo: "Cerrar el torneo", detalle: "Marcalo como finalizado en Ajustes" },
  ];

  // ── Drawer: cargar resultado con goles por jugador ──────────────────────
  function abrirDrawer(partidoId: string) {
    const p = partidos.find((x) => x.id === partidoId);
    if (!p) return;
    const existentes: Record<string, number> = {};
    golesPorPartido.filter((g) => g.partido_id === partidoId).forEach((g) => { existentes[g.torneo_equipo_jugador_id] = g.goles; });
    setDraft({ gl: p.goles_local ?? 0, gv: p.goles_visitante ?? 0, goles: existentes });
    setDrawerPartidoId(partidoId);
    setMessage("");
  }
  function cerrarDrawer() { setDrawerPartidoId(null); setDraft(null); }
  function bump(campo: "gl" | "gv", delta: number) {
    setDraft((d) => (d ? { ...d, [campo]: Math.max(0, d[campo] + delta) } : d));
  }
  function bumpJugador(tejId: string, delta: number) {
    setDraft((d) => {
      if (!d) return d;
      const goles = { ...d.goles };
      const v = Math.max(0, (goles[tejId] || 0) + delta);
      if (v === 0) delete goles[tejId]; else goles[tejId] = v;
      return { ...d, goles };
    });
  }
  async function guardarResultado() {
    if (!drawerPartidoId || !draft) return;
    setGuardando(true);
    setMessage("");
    try {
      await api("/api/torneo-organizador/torneos/fixture", {
        method: "PATCH",
        body: JSON.stringify({
          partido_id: drawerPartidoId,
          goles_local: draft.gl,
          goles_visitante: draft.gv,
          goles_por_jugador: Object.entries(draft.goles).map(([torneo_equipo_jugador_id, goles]) => ({ torneo_equipo_jugador_id, goles })),
        }),
      });
      cerrarDrawer();
      await refrescarDetalle();
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setGuardando(false); }
  }

  async function overrideEquipos(partidoId: string, equipoLocalId: string, equipoVisitanteId: string) {
    try {
      await api("/api/torneo-organizador/torneos/fixture", {
        method: "PATCH",
        body: JSON.stringify({ partido_id: partidoId, equipo_local_id: equipoLocalId || null, equipo_visitante_id: equipoVisitanteId || null }),
      });
      await refrescarDetalle();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function generarFixture() {
    try {
      await api("/api/torneo-organizador/torneos/fixture", { method: "POST", body: JSON.stringify({ torneo_id: torneoId }) });
      await refrescarDetalle();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }
  async function poblarLlave(force: boolean) {
    try {
      await api("/api/torneo-organizador/torneos/fixture?action=poblar_llave", { method: "POST", body: JSON.stringify({ torneo_id: torneoId, force }) });
      await refrescarDetalle();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }
  async function crearTorneo(datos: AnyRow) {
    setCreandoTorneo(true);
    setMessage("");
    try {
      const json = await api("/api/torneo-organizador/torneos", {
        method: "POST",
        body: JSON.stringify({ ...datos, precio_inscripcion: datos.precio_inscripcion || null }),
      });
      setCrearAbierto(false);
      await cargarTorneos();
      if (json.torneo?.id) { setTorneoId(json.torneo.id); setSeccion("ajustes"); }
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setCreandoTorneo(false); }
  }

  async function regenerarFixture() {
    if (!confirm("¿Regenerar el fixture? Se borran todos los partidos, resultados y goleadores cargados de este torneo. No se puede deshacer.")) return;
    try {
      await api("/api/torneo-organizador/torneos/fixture?action=regenerar", { method: "POST", body: JSON.stringify({ torneo_id: torneoId }) });
      await refrescarDetalle();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  const abierto = drawerPartidoId ? partidos.find((p) => p.id === drawerPartidoId) : null;

  return (
    <div className="min-h-screen bg-[#FFFAF6] lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="flex flex-col gap-1 border-b border-zinc-200 bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-1 pb-4">
          {organizador.logo_url ? (
            <img src={organizador.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-[#FD7401]" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-zinc-900">{organizador.nombre}</p>
            <p className="text-[11px] font-medium text-zinc-400">Organizador · Juol</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setSwitcherAbierto((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-[#FFFAF6] px-3 py-2.5 text-left hover:border-[#FD7401]"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Torneo activo</p>
              <p className="mt-0.5 truncate text-[13.5px] font-black text-zinc-900">{torneo?.nombre || "Elegí un torneo"}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {switcherAbierto && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
              {torneos.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTorneoId(t.id); setSwitcherAbierto(false); setSeccion("estado"); }}
                  className="flex w-full items-center justify-between gap-2 border-b border-zinc-50 px-3 py-2.5 text-left last:border-b-0 hover:bg-orange-50/50"
                >
                  <span className="truncate text-[13px] font-bold text-zinc-900">{t.nombre}</span>
                  <Pill estado={t.estado} />
                </button>
              ))}
              {torneos.length === 0 && <p className="px-3 py-3 text-xs text-zinc-400">Sin torneos todavía.</p>}
              <button
                onClick={() => { setSwitcherAbierto(false); setCrearAbierto(true); }}
                className="flex w-full items-center gap-2 border-t border-zinc-100 px-3 py-2.5 text-left text-[13px] font-bold text-[#FD7401] hover:bg-orange-50/50"
              >
                + Crear torneo
              </button>
            </div>
          )}
        </div>

        <div className="h-2" />

        <nav className="flex flex-col gap-1">
          {navParaFormato(formato).map((n) => (
            <button
              key={n.id}
              onClick={() => setSeccion(n.id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] font-bold transition ${
                seccion === n.id ? "bg-orange-50 text-[#FD7401]" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="flex-1">{n.label}</span>
              {n.id === "estado" && pendientes.length > 0 && (
                <span className="rounded-full bg-[#FD7401] px-1.5 py-0.5 text-[10px] font-black text-white">{pendientes.length}</span>
              )}
              {n.id === "equipos" && equipos.some((e) => e.estado === "preinscripcion") && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">{equipos.filter((e) => e.estado === "preinscripcion").length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1" />
        <div className="flex items-center gap-2.5 border-t border-zinc-100 px-1 pt-3">
          <span className="flex-1 truncate text-xs font-semibold text-zinc-500">{organizador.nombre}</span>
          <button onClick={onSignOut} className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700">Salir</button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-[5] border-b border-zinc-200 bg-[#FFFAF6]/90 px-6 py-4 backdrop-blur">
          {torneo ? (
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight text-zinc-900">{torneo.nombre}</h1>
                <Pill estado={torneo.estado} />
              </div>
              <p className="mt-1 text-[12.5px] font-medium text-zinc-500">
                {FORMATO_LABEL[formato]} · {equipos.length} equipos{esFormatoGrupal && grupos.length ? ` · ${grupos.length} grupos` : ""} · {jugados.length} de {partidos.length} partidos jugados
              </p>
            </div>
          ) : (
            <h1 className="text-lg font-black text-zinc-400">{loading ? "Cargando…" : "No tenés torneos todavía"}</h1>
          )}
        </header>

        <main className="max-w-5xl px-6 py-7">
          {message && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}

          {!torneo && !loading && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center">
              <p className="text-sm font-bold text-zinc-500">Todavía no cargaste ningún torneo.</p>
              <button onClick={() => setCrearAbierto(true)} className="h-10 rounded-xl bg-[#FD7401] px-5 text-sm font-black text-white">Crear tu primer torneo</button>
            </div>
          )}

          {torneo && seccion === "estado" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                <StatCard label="Equipos" value={`${equipos.length} de ${torneo.cupo_equipos}`} detail={equipos.some((e) => e.estado === "preinscripcion") ? `${equipos.filter((e) => e.estado === "preinscripcion").length} sin confirmar pago` : "Todos al día"} />
                <StatCard label="Resultados sin cargar" value={`${pendientes.length} partidos`} tono={pendientes.length > 0 ? "aviso" : "normal"} />
                <StatCard label="Goles del torneo" value={`${golesCargados} goles`} detail={golesSinAsignar > 0 ? `${golesSinAsignar} sin asignar a un jugador` : "Todos asignados"} />
                <StatCard label="Fase actual" value={
                  !torneo.fixture_generado_at ? "Sin fixture"
                    : formato === "mata_mata" ? "Eliminación"
                    : esFormatoLiguilla ? "Todos contra todos"
                    : llaveArmada ? "Eliminación" : "Grupos"
                } />
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                    <div>
                      <h2 className="text-[15px] font-black text-zinc-900">Para cargar hoy</h2>
                      <p className="text-xs text-zinc-500">{pendientes.length === 0 ? "Nada pendiente" : `${pendientes.length} partido${pendientes.length === 1 ? "" : "s"} con equipos definidos`}</p>
                    </div>
                    <button onClick={() => setSeccion("fixture")} className="text-xs font-bold text-[#FD7401] hover:underline">Ver fixture completo</button>
                  </div>
                  {pendientes.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 border-b border-zinc-50 px-5 py-3 last:border-b-0">
                      <div className="flex flex-1 items-center gap-2.5 text-[13.5px]">
                        <span className="flex-1 truncate text-right font-semibold text-zinc-900">{nombreEquipoDe(equipos, p.equipo_local_id)}</span>
                        <span className="text-[11px] font-bold text-zinc-300">vs</span>
                        <span className="flex-1 truncate font-semibold text-zinc-900">{nombreEquipoDe(equipos, p.equipo_visitante_id)}</span>
                      </div>
                      <button onClick={() => abrirDrawer(p.id)} className="h-8 shrink-0 rounded-lg border border-[#FD7401] px-3 text-xs font-black text-[#FD7401] hover:bg-[#FD7401] hover:text-white">Cargar</button>
                    </div>
                  ))}
                  {pendientes.length === 0 && <p className="px-5 py-10 text-center text-sm text-zinc-400">Todos los partidos con equipos definidos ya tienen resultado.</p>}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h2 className="text-[15px] font-black text-zinc-900">Cómo va el torneo</h2>
                  <p className="mb-3.5 mt-0.5 text-xs text-zinc-500">Los pasos, en orden.</p>
                  <div className="flex flex-col gap-2.5">
                    {pasos.map((p, i, arr) => {
                      const activo = !p.hecho && arr.slice(0, i).every((x) => x.hecho);
                      return (
                        <div key={p.id} className="flex gap-2.5">
                          <div className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${p.hecho ? "bg-emerald-600 text-white" : activo ? "bg-[#FD7401] text-white" : "bg-zinc-100 text-zinc-400"}`} style={{ height: 22, width: 22 }}>
                            {p.hecho ? "✓" : p.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[13px] ${p.hecho ? "font-semibold text-zinc-400" : activo ? "font-black text-zinc-900" : "font-semibold text-zinc-400"}`}>{p.titulo}</p>
                            <p className="text-[11.5px] text-zinc-400">{p.detalle}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {torneo && seccion === "fixture" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={generarFixture} disabled={!!torneo.fixture_generado_at} className="h-9 rounded-lg bg-[#FD7401] px-4 text-xs font-black text-white disabled:opacity-40">Generar fixture</button>
                {esFormatoGrupal && (
                  <button onClick={() => poblarLlave(false)} className="h-9 rounded-lg border border-zinc-200 px-4 text-xs font-black text-zinc-600 hover:border-[#FD7401]">Poblar llave</button>
                )}
                <button onClick={() => setFiltroFixture("todos")} className={`h-9 rounded-lg px-3 text-xs font-bold ${filtroFixture === "todos" ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600"}`}>Todo el fixture</button>
                <button onClick={() => setFiltroFixture("pendientes")} className={`h-9 rounded-lg px-3 text-xs font-bold ${filtroFixture === "pendientes" ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600"}`}>Sin cargar · {pendientes.length}</button>
                {esFormatoGrupal && grupos.map((g) => (
                  <button key={g} onClick={() => setFiltroFixture(g)} className={`h-9 rounded-lg px-3 text-xs font-bold ${filtroFixture === g ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600"}`}>Grupo {g}</button>
                ))}
              </div>

              {(esFormatoGrupal || esFormatoLiguilla) && (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-black text-zinc-900">{esFormatoGrupal ? "Fase de grupos" : "Todos contra todos"}</h3>
                  <div className="flex flex-col gap-2">
                    {partidosGrupos
                      .filter((p) => filtroFixture === "todos" || (filtroFixture === "pendientes" ? p.estado !== "jugado" : p.grupo === filtroFixture))
                      .map((p) => <PartidoFila key={p.id} p={p} equipos={equipos} onCargar={() => abrirDrawer(p.id)} />)}
                    {partidosGrupos.length === 0 && <p className="py-6 text-center text-sm text-zinc-400">Todavía no se generó el fixture.</p>}
                  </div>
                </div>
              )}

              {(esFormatoGrupal || formato === "mata_mata") && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-black text-zinc-900">Mata-mata</h3>
                <div className="flex flex-col gap-2">
                  {partidosBracket.map((p) => (
                    <div key={p.id} className="flex flex-col gap-1.5">
                      <PartidoFila p={p} equipos={equipos} onCargar={() => abrirDrawer(p.id)} />
                      {!p.equipo_local_id && !p.equipo_visitante_id && (
                        <div className="flex gap-2 pl-2">
                          <EquipoSelect equipos={equipos} onChange={(id) => overrideEquipos(p.id, id, p.equipo_visitante_id)} />
                          <EquipoSelect equipos={equipos} onChange={(id) => overrideEquipos(p.id, p.equipo_local_id, id)} />
                        </div>
                      )}
                    </div>
                  ))}
                  {partidosBracket.length === 0 && <p className="py-6 text-center text-sm text-zinc-400">Todavía no hay llave de eliminación.</p>}
                </div>
              </div>
              )}
            </div>
          )}

          {torneo && seccion === "posiciones" && (
            <div className="flex flex-col gap-5">
              <p className="text-[12.5px] text-zinc-500">
                {esFormatoLiguilla ? "Se calcula sola con los resultados cargados. Gana el que quede primero en la tabla." : `Se calcula sola con los resultados cargados. Clasifican los ${clasificadosPorGrupo} primeros de cada grupo.`}
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                {grupos.map((g) => (
                  <div key={g} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3"><h3 className="text-sm font-black text-zinc-900">{esFormatoLiguilla ? "Tabla general" : `Grupo ${g}`}</h3></div>
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="px-5 py-2 text-left text-[10.5px] font-bold uppercase text-zinc-400">Equipo</th>
                          {["PJ", "G", "E", "P", "DG"].map((h) => <th key={h} className="px-1.5 py-2 text-[10.5px] font-bold text-zinc-400">{h}</th>)}
                          <th className="px-5 py-2 text-[10.5px] font-bold text-[#FD7401]">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabla.filter((r) => r.grupo === g).map((r, i) => (
                          <tr key={r.id} className="border-t border-zinc-50">
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-black ${i < (esFormatoLiguilla ? 1 : clasificadosPorGrupo) ? "bg-orange-50 text-[#FD7401]" : "bg-zinc-50 text-zinc-400"}`}>{i + 1}</span>
                                <span className="font-bold text-zinc-900">{r.nombre}</span>
                              </div>
                            </td>
                            <td className="px-1.5 py-2.5 text-center text-zinc-600">{r.pj}</td>
                            <td className="px-1.5 py-2.5 text-center text-zinc-600">{r.g}</td>
                            <td className="px-1.5 py-2.5 text-center text-zinc-600">{r.e}</td>
                            <td className="px-1.5 py-2.5 text-center text-zinc-600">{r.p}</td>
                            <td className="px-1.5 py-2.5 text-center text-zinc-600">{r.dg}</td>
                            <td className="px-5 py-2.5 text-center font-black text-zinc-900">{r.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {grupos.length === 0 && <p className="py-10 text-center text-sm text-zinc-400">Todavía no hay grupos armados.</p>}
              </div>
            </div>
          )}

          {torneo && seccion === "llave" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12.5px] text-zinc-500">
                  {esFormatoGrupal
                    ? (llaveArmada ? "Llave armada con los equipos clasificados." : "Todavía no poblaste la llave. Podés hacerlo apenas cierren los grupos.")
                    : "La llave se arma completa al generar el fixture, con sorteo entre los equipos inscriptos."}
                </p>
                {esFormatoGrupal && (
                  <button onClick={() => poblarLlave(false)} className="h-9 shrink-0 rounded-lg bg-[#FD7401] px-4 text-xs font-black text-white">Poblar con los clasificados</button>
                )}
              </div>
              {partidosBracket.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-400">Todavía no hay llave de eliminación.</p>
              ) : (
                <div className="grid gap-5 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${Array.from(new Set(partidosBracket.map((p) => p.ronda ?? 0))).length}, minmax(200px, 1fr))` }}>
                  {Array.from(new Set(partidosBracket.map((p) => p.ronda ?? 0))).sort((a, b) => a - b).map((ronda) => {
                    const items = partidosBracket.filter((p) => (p.ronda ?? 0) === ronda).sort((a, b) => a.orden - b.orden);
                    const fase = items[0]?.fase ?? "";
                    return (
                      <div key={ronda} className="flex flex-col gap-3.5">
                        <p className="text-center text-[11px] font-bold uppercase tracking-wide text-zinc-400">{FASE_LABEL[fase] || fase.replace(/_/g, " ")}</p>
                        {items.map((p) => (
                          <button key={p.id} onClick={() => (p.equipo_local_id && p.equipo_visitante_id ? abrirDrawer(p.id) : undefined)} className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-left disabled:cursor-default">
                            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                              <span className={`truncate text-[13px] ${p.estado === "jugado" && p.goles_local > p.goles_visitante ? "font-black text-zinc-900" : "font-semibold text-zinc-500"}`}>{nombreEquipoDe(equipos, p.equipo_local_id)}</span>
                              <span className="text-[13px] font-black text-zinc-300">{p.estado === "jugado" ? p.goles_local : "–"}</span>
                            </div>
                            <div className="h-px bg-zinc-100" />
                            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                              <span className={`truncate text-[13px] ${p.estado === "jugado" && p.goles_visitante > p.goles_local ? "font-black text-zinc-900" : "font-semibold text-zinc-500"}`}>{nombreEquipoDe(equipos, p.equipo_visitante_id)}</span>
                              <span className="text-[13px] font-black text-zinc-300">{p.estado === "jugado" ? p.goles_visitante : "–"}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {torneo && seccion === "goleadores" && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h2 className="text-[15px] font-black text-zinc-900">Tabla de goleadores</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">Se arma sola con los goles que asignás al cargar cada resultado.</p>
                </div>
                {goleadores.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-3.5 border-b border-zinc-50 px-5 py-3 last:border-b-0">
                    <span className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-xs font-black ${i < 3 ? "bg-orange-50 text-[#FD7401]" : "bg-zinc-50 text-zinc-400"}`} style={{ height: 26, width: 26 }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-zinc-900">
                        {[g.jugador?.nombre, g.jugador?.apellido].filter(Boolean).join(" ") || g.nombre_invitado || "Jugador"}
                        {!g.jugador_id && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700">invitado</span>}
                      </p>
                      <p className="truncate text-[11.5px] text-zinc-400">{g.equipo?.nombre}</p>
                    </div>
                    <span className="text-[19px] font-black text-[#FD7401]">{g.goles}</span>
                  </div>
                ))}
                {goleadores.length === 0 && <p className="px-5 py-10 text-center text-sm text-zinc-400">Todavía no cargaste goles.</p>}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-black text-zinc-900">¿Falta alguien?</h3>
                <p className="mt-1.5 text-[12.5px] text-zinc-500">Los goleadores ya no se cargan a mano acá. Se asignan al guardar el resultado de cada partido, en Fixture.</p>
                {golesSinAsignar > 0 && (
                  <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3.5">
                    <p className="text-[12.5px] font-bold text-orange-600">{golesSinAsignar} goles sin asignar a un jugador</p>
                    <button onClick={() => setSeccion("fixture")} className="mt-1.5 text-xs font-bold text-[#FD7401] hover:underline">Revisar partidos →</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {torneo && seccion === "equipos" && equiposData && (
            <EquiposSeccion api={api} torneoId={torneoId} equiposData={equiposData} esFormatoGrupal={esFormatoGrupal} setMessage={setMessage} onChange={refrescarDetalle} />
          )}

          {torneo && seccion === "ajustes" && (
            <AjustesSeccion api={api} torneo={torneo} equipos={equipos} setMessage={setMessage} onChange={refrescarDetalle} onRegenerar={regenerarFixture} />
          )}
        </main>
      </div>

      {abierto && draft && (
        <Drawer
          partido={abierto}
          equipos={equipos}
          roster={roster}
          draft={draft}
          guardando={guardando}
          onBump={bump}
          onBumpJugador={bumpJugador}
          onCerrar={cerrarDrawer}
          onGuardar={guardarResultado}
        />
      )}

      {crearAbierto && (
        <CrearTorneoModal api={api} creando={creandoTorneo} onCrear={crearTorneo} onCerrar={() => setCrearAbierto(false)} />
      )}
    </div>
  );
}

function PartidoFila({ p, equipos, onCargar }: { p: AnyRow; equipos: AnyRow[]; onCargar: () => void }) {
  const jugado = p.estado === "jugado";
  const puedeCargar = !!p.equipo_local_id && !!p.equipo_visitante_id;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-3.5 py-2.5 text-sm">
      <span className="flex-1 truncate text-right font-semibold text-zinc-700">{nombreEquipoDe(equipos, p.equipo_local_id)}</span>
      <span className="w-14 text-center font-black text-zinc-900">{jugado ? `${p.goles_local} - ${p.goles_visitante}` : "vs"}</span>
      <span className="flex-1 truncate font-semibold text-zinc-700">{nombreEquipoDe(equipos, p.equipo_visitante_id)}</span>
      <button
        onClick={onCargar}
        disabled={!puedeCargar}
        className={`h-8 shrink-0 rounded-md px-3 text-xs font-black disabled:opacity-30 ${jugado ? "border border-zinc-200 text-zinc-600" : "bg-[#FD7401] text-white"}`}
      >
        {jugado ? "Editar" : "Cargar resultado"}
      </button>
    </div>
  );
}

function EquipoSelect({ equipos, value, onChange }: { equipos: AnyRow[]; value?: string; onChange: (id: string) => void }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-9 flex-1 rounded-lg border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]">
      <option value="">Elegí equipo…</option>
      {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
    </select>
  );
}

function Drawer({ partido, equipos, roster, draft, guardando, onBump, onBumpJugador, onCerrar, onGuardar }: {
  partido: AnyRow; equipos: AnyRow[]; roster: AnyRow[];
  draft: { gl: number; gv: number; goles: Record<string, number> }; guardando: boolean;
  onBump: (campo: "gl" | "gv", delta: number) => void; onBumpJugador: (id: string, delta: number) => void;
  onCerrar: () => void; onGuardar: () => void;
}) {
  const equipoLocal = equipos.find((e) => e.id === partido.equipo_local_id);
  const equipoVisita = equipos.find((e) => e.id === partido.equipo_visitante_id);
  const rosterDe = (equipoId: string) => roster.filter((r) => r.equipo_id === equipoId);
  const sumaAsignada = (equipoId: string) => rosterDe(equipoId).reduce((a, j) => a + (draft.goles[j.id] || 0), 0);
  const sumaLocal = sumaAsignada(partido.equipo_local_id);
  const sumaVisita = sumaAsignada(partido.equipo_visitante_id);
  const dif = (draft.gl - sumaLocal) + (draft.gv - sumaVisita);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div onClick={onCerrar} className="absolute inset-0 bg-zinc-900/30" />
      <div className="relative flex h-full w-full max-w-[470px] flex-col bg-white shadow-2xl">
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[17px] font-black text-zinc-900">Cargar resultado</h2>
            <button onClick={onCerrar} className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500" style={{ height: 30, width: 30 }}>✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
            <div className="text-center">
              <p className="mb-2 text-[13px] font-bold text-zinc-900">{equipoLocal?.nombre || "Local"}</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => onBump("gl", -1)} className="h-8 w-8 rounded-lg border border-zinc-200 text-base font-bold text-zinc-500">−</button>
                <span className="min-w-[38px] text-3xl font-black text-zinc-900">{draft.gl}</span>
                <button onClick={() => onBump("gl", 1)} className="h-8 w-8 rounded-lg border border-[#FD7401] bg-orange-50 text-base font-bold text-[#FD7401]">+</button>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-300">VS</span>
            <div className="text-center">
              <p className="mb-2 text-[13px] font-bold text-zinc-900">{equipoVisita?.nombre || "Visitante"}</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => onBump("gv", -1)} className="h-8 w-8 rounded-lg border border-zinc-200 text-base font-bold text-zinc-500">−</button>
                <span className="min-w-[38px] text-3xl font-black text-zinc-900">{draft.gv}</span>
                <button onClick={() => onBump("gv", 1)} className="h-8 w-8 rounded-lg border border-[#FD7401] bg-orange-50 text-base font-bold text-[#FD7401]">+</button>
              </div>
            </div>
          </div>

          <div className={`mt-5 rounded-xl border p-3 text-[12.5px] font-semibold ${dif > 0 ? "border-orange-200 bg-orange-50 text-orange-600" : dif < 0 ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {dif > 0 ? `Faltan asignar ${dif} ${dif === 1 ? "gol" : "goles"}. Podés guardar igual y completarlo después.`
              : dif < 0 ? `Asignaste ${-dif} ${dif === -1 ? "gol" : "goles"} de más. Subí el marcador o sacá goles.`
              : "Marcador y goleadores coinciden."}
          </div>

          {[partido.equipo_local_id, partido.equipo_visitante_id].map((equipoId) => {
            const eq = equipos.find((e) => e.id === equipoId);
            const jugadores = rosterDe(equipoId);
            return (
              <div key={equipoId} className="mt-5">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-[13px] font-black text-zinc-900">Goles de {eq?.nombre}</h3>
                  <span className="text-[11.5px] font-bold text-zinc-400">{sumaAsignada(equipoId)} de {equipoId === partido.equipo_local_id ? draft.gl : draft.gv}</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-zinc-100">
                  {jugadores.map((j) => {
                    const n = draft.goles[j.id] || 0;
                    return (
                      <div key={j.id} className="flex items-center gap-2.5 border-b border-zinc-50 px-3 py-2.5 last:border-b-0">
                        <span className="flex-1 truncate text-[13px] text-zinc-700">
                          {nombreJugador(j)}
                          {!j.user_id && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700">invitado</span>}
                        </span>
                        <button onClick={() => onBumpJugador(j.id, -1)} disabled={!n} className="h-7 w-7 rounded-md border border-zinc-200 text-sm font-bold text-zinc-500 disabled:opacity-30">−</button>
                        <span className={`min-w-[18px] text-center text-[13.5px] font-black ${n ? "text-zinc-900" : "text-zinc-300"}`}>{n}</span>
                        <button onClick={() => onBumpJugador(j.id, 1)} className="h-7 w-7 rounded-md border border-zinc-200 text-sm font-bold text-[#FD7401]">+</button>
                      </div>
                    );
                  })}
                  {jugadores.length === 0 && <p className="px-3 py-3 text-xs text-zinc-400">Sin jugadores cargados en este equipo.</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2.5 border-t border-zinc-100 px-6 py-4">
          <button onClick={onGuardar} disabled={guardando} className="h-11 flex-1 rounded-xl bg-[#FD7401] text-sm font-black text-white disabled:opacity-60">
            {guardando ? "Guardando…" : "Guardar resultado"}
          </button>
          <button onClick={onCerrar} className="h-11 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-600">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const NUEVO_TORNEO_VACIO = { nombre: "", descripcion: "", portada_url: "", inicio_at: "", ubicacion_texto: "", precio_inscripcion: "", cupo_equipos: 8, clasificados_por_grupo: 2, formato: "grupos_mata_mata" };

function CrearTorneoModal({ api, creando, onCrear, onCerrar }: { api: Api; creando: boolean; onCrear: (datos: AnyRow) => void; onCerrar: () => void }) {
  const [form, setForm] = useState<AnyRow>(NUEVO_TORNEO_VACIO);
  const [uploading, setUploading] = useState(false);

  async function uploadPortada(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData(); body.append("file", file); body.append("folder", "torneos");
      const json = await api("/api/admin/upload", { method: "POST", body });
      setForm((p: AnyRow) => ({ ...p, portada_url: json.url }));
    } catch { /* el mensaje de error general del panel ya cubre esto */ }
    finally { setUploading(false); }
  }

  function cambiarFormato(formato: string) {
    setForm((p: AnyRow) => ({ ...p, formato, cupo_equipos: formato === "cuadrangular" ? 4 : p.cupo_equipos }));
  }

  const listo = form.nombre.trim() && form.inicio_at && Number(form.cupo_equipos) > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div onClick={onCerrar} className="absolute inset-0 bg-zinc-900/30" />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4">
          <h2 className="text-[16px] font-black text-zinc-900">Nuevo torneo</h2>
          <button onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-4 text-[12.5px] text-zinc-500">Se crea como borrador. Cuando esté listo, lo enviás a aprobación de Juol desde Ajustes.</p>
          <div className="flex flex-col gap-3">
            <label className="block"><span className="text-xs font-bold text-zinc-500">Formato</span>
              <select value={form.formato} onChange={(e) => cambiarFormato(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#FD7401]">
                {Object.entries(FORMATO_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-bold text-zinc-500">Nombre</span>
              <input value={form.nombre} onChange={(e) => setForm((p: AnyRow) => ({ ...p, nombre: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
            </label>
            <label className="block"><span className="text-xs font-bold text-zinc-500">Descripción</span>
              <textarea rows={2} value={form.descripcion} onChange={(e) => setForm((p: AnyRow) => ({ ...p, descripcion: e.target.value }))} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FD7401]" />
            </label>
            <div>
              <span className="text-xs font-bold text-zinc-500">Portada</span>
              {form.portada_url && <img src={form.portada_url} alt="" className="mt-1 h-20 w-full rounded-lg object-cover" />}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => uploadPortada(e.target.files?.[0])} className="mt-1 block w-full text-xs" />
            </div>
            <label className="block"><span className="text-xs font-bold text-zinc-500">Inicio (fecha y hora)</span>
              <input type="datetime-local" value={form.inicio_at} onChange={(e) => setForm((p: AnyRow) => ({ ...p, inicio_at: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
            </label>
            <label className="block"><span className="text-xs font-bold text-zinc-500">Ubicación</span>
              <input value={form.ubicacion_texto} onChange={(e) => setForm((p: AnyRow) => ({ ...p, ubicacion_texto: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="text-xs font-bold text-zinc-500">Inscripción (Gs)</span>
                <input type="number" value={form.precio_inscripcion} onChange={(e) => setForm((p: AnyRow) => ({ ...p, precio_inscripcion: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
              </label>
              <label className="block"><span className="text-xs font-bold text-zinc-500">Cupo de equipos</span>
                <input
                  type="number"
                  value={form.cupo_equipos}
                  disabled={form.formato === "cuadrangular"}
                  onChange={(e) => setForm((p: AnyRow) => ({ ...p, cupo_equipos: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401] disabled:bg-zinc-50 disabled:text-zinc-400"
                />
                {form.formato === "mata_mata" && <p className="mt-1 text-[10.5px] text-zinc-400">Tiene que ser 4, 8 o 16 para armar la llave.</p>}
              </label>
            </div>
            {form.formato === "grupos_mata_mata" && (
              <label className="block"><span className="text-xs font-bold text-zinc-500">Clasificados por grupo</span>
                <input type="number" value={form.clasificados_por_grupo} onChange={(e) => setForm((p: AnyRow) => ({ ...p, clasificados_por_grupo: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
              </label>
            )}
          </div>
        </div>
        <div className="flex gap-2.5 border-t border-zinc-100 px-6 py-4">
          <button onClick={() => onCrear(form)} disabled={!listo || creando} className="h-10 flex-1 rounded-xl bg-[#FD7401] text-sm font-black text-white disabled:opacity-50">
            {creando ? "Creando…" : "Crear torneo"}
          </button>
          <button onClick={onCerrar} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-600">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function EquiposSeccion({ api, torneoId, equiposData, esFormatoGrupal, setMessage, onChange }: {
  api: Api; torneoId: string; equiposData: { equipos: AnyRow[]; roster: AnyRow[]; agentesLibres: AnyRow[] }; esFormatoGrupal: boolean;
  setMessage: (m: string) => void; onChange: () => Promise<void>;
}) {
  const [nuevoEquipo, setNuevoEquipo] = useState("");
  const [creando, setCreando] = useState(false);
  const [jugadorForm, setJugadorForm] = useState<Record<string, { nombre: string; telefono: string; email: string }>>({});
  const [agregandoEn, setAgregandoEn] = useState("");
  const [nuevoEquipoAgrupado, setNuevoEquipoAgrupado] = useState("");
  const [seleccionAgentes, setSeleccionAgentes] = useState<string[]>([]);

  function setForm(equipoId: string, campo: "nombre" | "telefono" | "email", valor: string) {
    setJugadorForm((prev) => ({ ...prev, [equipoId]: { ...(prev[equipoId] || { nombre: "", telefono: "", email: "" }), [campo]: valor } }));
  }

  async function crearEquipo() {
    if (!nuevoEquipo.trim()) return;
    setCreando(true); setMessage("");
    try {
      await api("/api/torneo-organizador/torneos/equipos", { method: "POST", body: JSON.stringify({ accion: "crear_equipo", torneo_id: torneoId, nombre: nuevoEquipo.trim() }) });
      setNuevoEquipo(""); await onChange();
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setCreando(false); }
  }
  async function agregarJugador(equipoId: string) {
    const form = jugadorForm[equipoId];
    if (!form?.nombre.trim()) return;
    setAgregandoEn(equipoId); setMessage("");
    try {
      await api("/api/torneo-organizador/torneos/equipos", {
        method: "POST",
        body: JSON.stringify({ accion: "agregar_jugador", equipo_id: equipoId, nombre: form.nombre.trim(), telefono: form.telefono?.trim() || null, email: form.email?.trim() || null }),
      });
      setJugadorForm((prev) => ({ ...prev, [equipoId]: { nombre: "", telefono: "", email: "" } }));
      await onChange();
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setAgregandoEn(""); }
  }
  async function quitarJugador(jugadorId: string) {
    if (!confirm("¿Sacar a este jugador del equipo?")) return;
    try { await api(`/api/torneo-organizador/torneos/equipos?jugador_id=${jugadorId}`, { method: "DELETE" }); await onChange(); }
    catch (e) { setMessage(getErrorMessage(e)); }
  }
  async function confirmarPago(equipoId: string) {
    try { await api("/api/torneo-organizador/torneos/equipos", { method: "PATCH", body: JSON.stringify({ id: equipoId, estado: "inscripcion" }) }); await onChange(); }
    catch (e) { setMessage(getErrorMessage(e)); }
  }
  async function actualizarGrupo(equipoId: string, grupo_fase: string) {
    try { await api("/api/torneo-organizador/torneos/equipos", { method: "PATCH", body: JSON.stringify({ id: equipoId, grupo_fase: grupo_fase || null }) }); await onChange(); }
    catch (e) { setMessage(getErrorMessage(e)); }
  }
  async function agruparAgentes() {
    if (!nuevoEquipoAgrupado.trim() || seleccionAgentes.length === 0) return;
    try {
      await api("/api/torneo-organizador/torneos/equipos/agrupar", { method: "POST", body: JSON.stringify({ torneo_id: torneoId, nombre: nuevoEquipoAgrupado.trim(), agente_libre_ids: seleccionAgentes }) });
      setNuevoEquipoAgrupado(""); setSeleccionAgentes([]); await onChange();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-zinc-500">{equiposData.equipos.length} equipos · {equiposData.equipos.filter((e) => e.estado === "inscripcion").length} con pago confirmado</p>
        <div className="flex gap-2">
          <input value={nuevoEquipo} onChange={(e) => setNuevoEquipo(e.target.value)} placeholder="Nombre del equipo nuevo" className="h-9 w-56 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-[#FD7401]" />
          <button onClick={crearEquipo} disabled={!nuevoEquipo.trim() || creando} className="h-9 rounded-lg bg-[#FD7401] px-3.5 text-xs font-black text-white disabled:opacity-40">Agregar equipo</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {equiposData.equipos.map((eq) => {
          const roster = equiposData.roster.filter((r) => r.equipo_id === eq.id);
          const form = jugadorForm[eq.id] || { nombre: "", telefono: "", email: "" };
          const iniciales = eq.nombre.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={eq.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4.5 py-3.5" style={{ paddingLeft: 18, paddingRight: 18 }}>
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-zinc-100 text-[13px] font-black text-zinc-500" style={{ height: 34, width: 34 }}>{iniciales}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-zinc-900">{eq.nombre}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {esFormatoGrupal && (
                      <input
                        defaultValue={eq.grupo_fase || ""}
                        placeholder="Grupo"
                        onBlur={(e) => e.target.value !== (eq.grupo_fase || "") && actualizarGrupo(eq.id, e.target.value)}
                        className="h-6 w-16 rounded border border-zinc-200 px-1.5 text-center text-[11px] outline-none focus:border-[#FD7401]"
                      />
                    )}
                    <span className="text-[11px] text-zinc-400">{roster.length} jugadores</span>
                  </div>
                </div>
                {eq.estado === "preinscripcion" ? (
                  <button onClick={() => confirmarPago(eq.id)} className="h-8 shrink-0 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white">Confirmar pago</button>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">Pago ok</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-4.5 py-3" style={{ paddingLeft: 18, paddingRight: 18 }}>
                {roster.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-[12.5px]">
                    <span className="flex-1 truncate text-zinc-700">{nombreJugador(r)}</span>
                    {!r.user_id && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700">invitado</span>}
                    <button onClick={() => quitarJugador(r.id)} className="text-zinc-300 hover:text-red-600">✕</button>
                  </div>
                ))}
                {roster.length === 0 && <p className="text-xs text-zinc-400">Sin jugadores cargados.</p>}
                <div className="mt-1.5 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-2">
                  <input value={form.nombre} onChange={(e) => setForm(eq.id, "nombre", e.target.value)} placeholder="Nombre" className="h-8 min-w-[100px] flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]" />
                  <input value={form.telefono} onChange={(e) => setForm(eq.id, "telefono", e.target.value)} placeholder="Teléfono (opcional)" className="h-8 w-28 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]" />
                  <input value={form.email} onChange={(e) => setForm(eq.id, "email", e.target.value)} placeholder="Email de Juol (opcional)" className="h-8 w-36 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#FD7401]" />
                  <button onClick={() => agregarJugador(eq.id)} disabled={!form.nombre.trim() || agregandoEn === eq.id} className="h-8 rounded-md bg-[#FD7401] px-3 text-xs font-black text-white disabled:opacity-40">
                    {agregandoEn === eq.id ? "…" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {equiposData.equipos.length === 0 && <p className="py-10 text-center text-sm text-zinc-400 lg:col-span-2">Sin equipos todavía.</p>}
      </div>

      {equiposData.agentesLibres.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4.5 py-3" style={{ paddingLeft: 18, paddingRight: 18 }}><h3 className="text-sm font-black">Agentes libres</h3></div>
          {equiposData.agentesLibres.map((a) => (
            <label key={a.id} className="flex items-center gap-3 border-b border-zinc-50 px-4.5 py-2.5 text-sm last:border-b-0" style={{ paddingLeft: 18, paddingRight: 18 }}>
              <input type="checkbox" checked={seleccionAgentes.includes(a.id)} onChange={(e) => setSeleccionAgentes((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))} />
              {[a.user?.nombre, a.user?.apellido].filter(Boolean).join(" ") || "Jugador"}
            </label>
          ))}
          <div className="flex gap-2 border-t border-zinc-100 p-4">
            <input value={nuevoEquipoAgrupado} onChange={(e) => setNuevoEquipoAgrupado(e.target.value)} placeholder="Nombre del equipo nuevo" className="h-9 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#FD7401]" />
            <button onClick={agruparAgentes} disabled={!nuevoEquipoAgrupado.trim() || seleccionAgentes.length === 0} className="h-9 rounded-lg bg-[#FD7401] px-3 text-xs font-black text-white disabled:opacity-40">Agrupar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AjustesSeccion({ api, torneo, equipos, setMessage, onChange, onRegenerar }: {
  api: Api; torneo: AnyRow; equipos: AnyRow[]; setMessage: (m: string) => void; onChange: () => Promise<void>; onRegenerar: () => Promise<void>;
}) {
  const [form, setForm] = useState<AnyRow>(torneo);
  const [uploading, setUploading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { setForm(torneo); }, [torneo.id]);

  async function uploadPortada(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const body = new FormData(); body.append("file", file); body.append("folder", "torneos");
      const json = await api("/api/admin/upload", { method: "POST", body });
      setForm((p: AnyRow) => ({ ...p, portada_url: json.url }));
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setUploading(false); }
  }

  async function guardar() {
    setGuardando(true); setMessage("");
    try {
      // Solo los datos del torneo: el estado tiene sus propias acciones abajo
      // (enviar a revisión / retirar / finalizar), nunca se manda desde acá.
      const { estado: _estado, motivo_rechazo: _motivo, ...datos } = form;
      // El formato ya no se puede tocar (ni mandar sin querer) una vez generado
      // el fixture — el servidor lo rechaza igual, pero mejor no ni intentarlo.
      if (torneo.fixture_generado_at) delete datos.formato;
      await api("/api/torneo-organizador/torneos", {
        method: "PATCH",
        body: JSON.stringify({ ...datos, precio_inscripcion: datos.precio_inscripcion || null }),
      });
      await onChange();
    } catch (e) { setMessage(getErrorMessage(e)); }
    finally { setGuardando(false); }
  }

  async function cambiarEstado(estado: string) {
    try {
      await api("/api/torneo-organizador/torneos", { method: "PATCH", body: JSON.stringify({ id: torneo.id, estado }) });
      await onChange();
    } catch (e) { setMessage(getErrorMessage(e)); }
  }

  async function marcarFinalizado() {
    if (!confirm("¿Marcar este torneo como finalizado?")) return;
    await cambiarEstado("finalizado");
  }

  const formato = torneo.formato || "grupos_mata_mata";
  const equiposInscripcion = equipos.filter((e) => e.estado === "inscripcion");
  const gruposAsignados = new Set(equiposInscripcion.map((e) => e.grupo_fase).filter(Boolean));
  const clasificadosTotales = gruposAsignados.size * (torneo.clasificados_por_grupo ?? 2);
  const cupoCerrado = { ok: equiposInscripcion.length > 0 && equiposInscripcion.length === torneo.cupo_equipos, texto: `Cupo cerrado (${equiposInscripcion.length} de ${torneo.cupo_equipos} equipos con pago confirmado)` };
  const requisitos = formato === "grupos_mata_mata"
    ? [
        cupoCerrado,
        { ok: equiposInscripcion.length > 0 && equiposInscripcion.every((e) => !!e.grupo_fase), texto: "Todos los equipos tienen grupo asignado" },
        { ok: gruposAsignados.size > 0 && Number.isInteger(Math.log2(clasificadosTotales)), texto: "La cantidad de clasificados a la llave final es pareja (no impar)" },
      ]
    : formato === "mata_mata"
      ? [cupoCerrado, { ok: Number.isInteger(Math.log2(torneo.cupo_equipos || 0)), texto: "El cupo de equipos es potencia de 2 (4, 8, 16...)" }]
      : formato === "cuadrangular"
        ? [{ ok: equiposInscripcion.length === 4, texto: `Los 4 equipos con pago confirmado (hay ${equiposInscripcion.length})` }]
        : [cupoCerrado]; // liguilla
  const listoParaRevision = requisitos.every((r) => r.ok);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3.5 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-[15px] font-black text-zinc-900">Datos del torneo</h2>
        <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Formato</span>
          <select
            value={form.formato || "grupos_mata_mata"}
            disabled={!!torneo.fixture_generado_at}
            onChange={(e) => setForm((p: AnyRow) => ({ ...p, formato: e.target.value, cupo_equipos: e.target.value === "cuadrangular" ? 4 : p.cupo_equipos }))}
            className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[13.5px] outline-none focus:border-[#FD7401] disabled:bg-zinc-50 disabled:text-zinc-400"
          >
            {Object.entries(FORMATO_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {torneo.fixture_generado_at && <p className="mt-1 text-[10.5px] text-zinc-400">No se puede cambiar con el fixture ya generado.</p>}
        </label>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Nombre</span>
            <input value={form.nombre || ""} onChange={(e) => setForm((p: AnyRow) => ({ ...p, nombre: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401]" />
          </label>
          <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Inicio</span>
            <input type="datetime-local" value={form.inicio_at?.slice(0, 16) || ""} onChange={(e) => setForm((p: AnyRow) => ({ ...p, inicio_at: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401]" />
          </label>
          <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Ubicación</span>
            <input value={form.ubicacion_texto || ""} onChange={(e) => setForm((p: AnyRow) => ({ ...p, ubicacion_texto: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401]" />
          </label>
          <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Inscripción (Gs)</span>
            <input type="number" value={form.precio_inscripcion || ""} onChange={(e) => setForm((p: AnyRow) => ({ ...p, precio_inscripcion: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401]" />
          </label>
          <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Cupo de equipos</span>
            <input
              type="number"
              value={form.cupo_equipos || ""}
              disabled={form.formato === "cuadrangular"}
              onChange={(e) => setForm((p: AnyRow) => ({ ...p, cupo_equipos: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401] disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </label>
          {(form.formato || "grupos_mata_mata") === "grupos_mata_mata" && (
            <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Clasificados por grupo</span>
              <input type="number" value={form.clasificados_por_grupo ?? 2} onChange={(e) => setForm((p: AnyRow) => ({ ...p, clasificados_por_grupo: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13.5px] outline-none focus:border-[#FD7401]" />
            </label>
          )}
        </div>
        <label className="block"><span className="text-[11.5px] font-bold text-zinc-500">Descripción</span>
          <textarea rows={3} value={form.descripcion || ""} onChange={(e) => setForm((p: AnyRow) => ({ ...p, descripcion: e.target.value }))} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[13.5px] outline-none focus:border-[#FD7401]" />
        </label>
        <div>
          <span className="text-[11.5px] font-bold text-zinc-500">Portada</span>
          {form.portada_url && <img src={form.portada_url} alt="" className="mt-1 h-24 w-full rounded-lg object-cover" />}
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => uploadPortada(e.target.files?.[0])} className="mt-1 block w-full text-xs" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={guardar} disabled={guardando} className="h-10 rounded-lg bg-[#FD7401] px-4 text-[13px] font-black text-white disabled:opacity-60">Guardar cambios</button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-2.5 text-sm font-black text-zinc-900">Visibilidad</h3>
          <div className="flex items-center justify-between gap-2 py-1.5">
            <span className="text-[12.5px] text-zinc-700">Estado</span>
            <Pill estado={torneo.estado} />
          </div>

          {torneo.estado === "borrador" && (
            <>
              {torneo.motivo_rechazo && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
                  <p className="font-bold">Juol devolvió este torneo para ajustes:</p>
                  <p className="mt-0.5">{torneo.motivo_rechazo}</p>
                </div>
              )}
              <p className="mt-3 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-400">Para poder enviarlo a revisión</p>
              <div className="flex flex-col gap-1.5">
                {requisitos.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className={r.ok ? "text-emerald-600" : "text-zinc-300"}>{r.ok ? "✓" : "○"}</span>
                    <span className={r.ok ? "text-zinc-600" : "text-zinc-400"}>{r.texto}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => cambiarEstado("en_revision")} disabled={!listoParaRevision} className="mt-3 h-9 w-full rounded-lg bg-[#FD7401] text-xs font-bold text-white disabled:opacity-40">
                Enviar para aprobación
              </button>
            </>
          )}

          {torneo.estado === "en_revision" && (
            <>
              <p className="mt-2 text-[12.5px] text-zinc-500">Juol está revisando este torneo. Te avisamos cuando esté publicado.</p>
              <button onClick={() => cambiarEstado("borrador")} className="mt-3 h-9 w-full rounded-lg border border-zinc-200 text-xs font-bold text-zinc-600 hover:border-[#FD7401]">
                Retirar de revisión
              </button>
            </>
          )}

          {torneo.estado === "en_curso" && (
            <button onClick={marcarFinalizado} className="mt-2 h-9 w-full rounded-lg bg-zinc-900 text-xs font-bold text-white">Marcar como finalizado</button>
          )}
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <h3 className="mb-1.5 text-sm font-black text-orange-600">Zona sensible</h3>
          <p className="mb-3 text-xs text-orange-700">Regenerar el fixture borra todos los partidos, resultados y goleadores cargados de este torneo.</p>
          <button onClick={onRegenerar} className="h-9 rounded-lg border border-orange-300 bg-white px-3.5 text-xs font-bold text-orange-600">Regenerar fixture</button>
        </div>
      </div>
    </div>
  );
}
