"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";

type AnyRow = Record<string, any>;
type Vista = "pendiente" | "aprobado" | "rechazado" | "todos";

const rolLabel: Record<string, string> = { arbitro: "Árbitro", arquero: "Arquero" };

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
    pendiente: "bg-amber-100 text-amber-700",
    aprobado: "bg-emerald-100 text-emerald-700",
    rechazado: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[estado] || "bg-zinc-100 text-zinc-600"}`}>{estado}</span>;
}

function EmptyStateText({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-zinc-400">{text}</p>;
}

export function AdminProfesionales({ api }: { api: (path: string, options?: RequestInit) => Promise<any> }) {
  const [vista, setVista] = useState<Vista>("pendiente");
  const [items, setItems] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState("");

  async function cargar() {
    setLoading(true);
    setMessage("");
    try {
      const json = await api("/api/admin/profesionales");
      setItems(json.profesionales || []);
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: string, estado: "aprobado" | "rechazado" | "pendiente") {
    setActingId(id);
    setMessage("");
    try {
      await api("/api/admin/profesionales", { method: "PATCH", body: JSON.stringify({ id, estado }) });
      await cargar();
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setActingId("");
    }
  }

  const counts = useMemo(
    () => ({
      pendiente: items.filter((i) => i.estado === "pendiente").length,
      aprobado: items.filter((i) => i.estado === "aprobado").length,
      rechazado: items.filter((i) => i.estado === "rechazado").length,
      todos: items.length,
    }),
    [items],
  );

  const filtrados = vista === "todos" ? items : items.filter((i) => i.estado === vista);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-900">Profesionales</h2>
          <p className="text-xs font-medium text-zinc-400">Moderación de árbitros y arqueros autogestionados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={vista === "pendiente"} onClick={() => setVista("pendiente")}>Pendientes ({counts.pendiente})</Chip>
          <Chip active={vista === "aprobado"} onClick={() => setVista("aprobado")}>Aprobados ({counts.aprobado})</Chip>
          <Chip active={vista === "rechazado"} onClick={() => setVista("rechazado")}>Rechazados ({counts.rechazado})</Chip>
          <Chip active={vista === "todos"} onClick={() => setVista("todos")}>Todos ({counts.todos})</Chip>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      <div className="space-y-3">
        {filtrados.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                {p.foto_url ? (
                  <img src={p.foto_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-100" />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-zinc-900">
                      {[p.user?.nombre, p.user?.apellido].filter(Boolean).join(" ") || "Sin nombre"}
                    </p>
                    <EstadoPill estado={p.estado} />
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold text-zinc-600">
                      {rolLabel[p.rol] || p.rol}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {p.ciudad || "Sin ciudad"} · {p.edad ? `${p.edad} años` : "Edad no informada"} · {p.user?.telefono || "Sin teléfono"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {p.anios_experiencia ? `${p.anios_experiencia} años de experiencia` : "Sin años de experiencia informados"}
                    {p.partidos_realizados ? ` · ${p.partidos_realizados} partidos realizados` : ""}
                    {p.tarifa ? ` · Gs ${p.tarifa}` : ""}
                  </p>
                  {p.experiencia && <p className="mt-1.5 text-sm text-zinc-700">{p.experiencia}</p>}
                  {p.disponibilidad_texto && (
                    <p className="mt-1 text-xs text-zinc-500">Disponibilidad: {p.disponibilidad_texto}</p>
                  )}
                  {Array.isArray(p.zonas) && p.zonas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.zonas.map((z: string) => (
                        <span key={z} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#FD7401] ring-1 ring-orange-200">
                          {z}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {p.estado !== "aprobado" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "aprobado")}
                    disabled={actingId === p.id}
                    className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                  >
                    Aprobar
                  </button>
                )}
                {p.estado !== "rechazado" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "rechazado")}
                    disabled={actingId === p.id}
                    className="h-9 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
                  >
                    Rechazar
                  </button>
                )}
                {p.estado !== "pendiente" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "pendiente")}
                    disabled={actingId === p.id}
                    className="h-9 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-500 hover:border-[#FD7401] disabled:opacity-40"
                  >
                    Volver a pendiente
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtrados.length === 0 && !loading && (
          <Card>
            <EmptyStateText text="Sin postulaciones en esta vista." />
          </Card>
        )}
      </div>
    </div>
  );
}
