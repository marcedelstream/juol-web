"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";

type AnyRow = Record<string, any>;
type Vista = "reportes" | "equipos" | "desafios" | "matches";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error.";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-PY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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
    abierto: "bg-blue-100 text-blue-700",
    aceptado: "bg-emerald-100 text-emerald-700",
    coordinando: "bg-amber-100 text-amber-700",
    jugado: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[estado] || "bg-zinc-100 text-zinc-600"}`}>{estado}</span>;
}

function EmptyStateText({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-zinc-400">{text}</p>;
}

export function AdminContrario({ api }: { api: (path: string, options?: RequestInit) => Promise<any> }) {
  const [vista, setVista] = useState<Vista>("reportes");
  const [reportes, setReportes] = useState<AnyRow[]>([]);
  const [equipos, setEquipos] = useState<AnyRow[]>([]);
  const [desafios, setDesafios] = useState<AnyRow[]>([]);
  const [matches, setMatches] = useState<AnyRow[]>([]);
  const [generalCargado, setGeneralCargado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dismissingId, setDismissingId] = useState("");

  async function cargarReportes() {
    setLoading(true);
    setMessage("");
    try {
      const json = await api("/api/admin/contrario/reportes");
      setReportes(json.reportes || []);
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function cargarGeneral() {
    setLoading(true);
    setMessage("");
    try {
      const json = await api("/api/admin/contrario");
      setEquipos(json.equipos || []);
      setDesafios(json.desafios || []);
      setMatches(json.matches || []);
      setGeneralCargado(true);
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  useEffect(() => {
    if (vista !== "reportes" && !generalCargado) cargarGeneral();
  }, [vista, generalCargado]);

  async function marcarRevisado(id: string) {
    setDismissingId(id);
    setMessage("");
    try {
      await api(`/api/admin/delete?table=contrario_reportes&id=${id}`, { method: "DELETE" });
      await cargarReportes();
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setDismissingId("");
    }
  }

  const nombreEquipo = (id?: string | null) => equipos.find((e) => e.id === id)?.nombre || (id ? "—" : "Por definir");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-900">Contrario</h2>
          <p className="text-xs font-medium text-zinc-400">Equipos, desafíos, matches y reportes entre equipos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={vista === "reportes"} onClick={() => setVista("reportes")}>Reportes ({reportes.length})</Chip>
          <Chip active={vista === "equipos"} onClick={() => setVista("equipos")}>Equipos</Chip>
          <Chip active={vista === "desafios"} onClick={() => setVista("desafios")}>Desafíos</Chip>
          <Chip active={vista === "matches"} onClick={() => setVista("matches")}>Matches</Chip>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      {vista === "reportes" && (
        <div className="space-y-3">
          {reportes.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600 ring-1 ring-red-200">
                      {r.motivo}
                    </span>
                    <span className="text-xs text-zinc-400">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-zinc-900">{r.detalle || "Sin detalle"}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Reporta: {[r.reportante?.nombre, r.reportante?.apellido].filter(Boolean).join(" ") || "—"}
                    {r.reportante?.telefono ? ` (${r.reportante.telefono})` : ""}
                    {r.match?.fecha_hora ? ` · Partido ${formatDate(r.match.fecha_hora)}` : ""}
                    {r.match?.cancha_texto ? ` · ${r.match.cancha_texto}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => marcarRevisado(r.id)}
                  disabled={dismissingId === r.id}
                  className="h-9 shrink-0 rounded-lg bg-zinc-950 px-3 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40"
                >
                  Marcar revisado
                </button>
              </div>
            </Card>
          ))}
          {reportes.length === 0 && !loading && (
            <Card>
              <EmptyStateText text="Sin reportes pendientes de revisión." />
            </Card>
          )}
        </div>
      )}

      {vista === "equipos" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Nombre</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Ciudad</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Capitán</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Creado</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 hover:bg-orange-50/30">
                    <td className="px-4 py-3 font-bold text-zinc-900">{e.nombre}</td>
                    <td className="px-4 py-3 text-zinc-600">{e.ciudad || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {[e.capitan?.nombre, e.capitan?.apellido].filter(Boolean).join(" ") || "-"}
                      {e.capitan?.telefono ? ` (${e.capitan.telefono})` : ""}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(e.created_at)}</td>
                  </tr>
                ))}
                {equipos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-400">Sin equipos todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {vista === "desafios" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Equipo</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Días disponibles</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Estado</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Creado</th>
                </tr>
              </thead>
              <tbody>
                {desafios.map((d) => (
                  <tr key={d.id} className="border-b border-zinc-100 hover:bg-orange-50/30">
                    <td className="px-4 py-3 font-bold text-zinc-900">{d.equipo?.nombre || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {Array.isArray(d.dias_disponibles) ? d.dias_disponibles.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-3"><EstadoPill estado={d.estado} /></td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
                {desafios.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-400">Sin desafíos todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {vista === "matches" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Equipos</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Fecha</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Cancha</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-100 hover:bg-orange-50/30">
                    <td className="px-4 py-3 font-bold text-zinc-900">
                      {nombreEquipo(m.desafio?.equipo_id)} vs {nombreEquipo(m.equipo_rival_id)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(m.fecha_hora)}</td>
                    <td className="px-4 py-3 text-zinc-600">{m.cancha_texto || "-"}</td>
                    <td className="px-4 py-3"><EstadoPill estado={m.estado} /></td>
                  </tr>
                ))}
                {matches.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-400">Sin matches todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
