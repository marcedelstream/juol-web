"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { OrganizadorPanel } from "./OrganizadorPanel";

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
  return <OrganizadorPanel api={api} organizador={organizador} onSignOut={onSignOut} />;
}
