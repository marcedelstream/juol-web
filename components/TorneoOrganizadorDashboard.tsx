"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminTorneos } from "./AdminTorneos";

type Organizador = { id: string; nombre: string; logo_url?: string | null };

export function TorneoOrganizadorDashboard({
  api,
  organizador,
  onSignOut,
}: {
  api: (path: string, options?: RequestInit) => Promise<any>;
  organizador: Organizador;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FFFAF6]">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            {organizador.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={organizador.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-[#FD7401]" />
            )}
            <div>
              <p className="text-sm font-black text-zinc-900">{organizador.nombre}</p>
              <p className="text-[11px] font-medium text-zinc-400">Gestión de torneos · Juol</p>
            </div>
          </div>
          <button onClick={onSignOut} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <AdminTorneos api={api} basePath="/api/torneo-organizador/torneos" />
      </main>
    </div>
  );
}
