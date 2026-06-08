"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type Banner = {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  descripcion_interna: string | null;
  imagen_url: string | null;
  enlace_url: string | null;
  color_fondo: string | null;
  activo: boolean;
};

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function BeneficiosList({ banners }: { banners: Banner[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (banners.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-10 text-center">
        <p className="text-sm font-black text-zinc-400">Pronto vas a encontrar beneficios disponibles.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-3">
      {banners.map((b) => {
        const isOpen = open === b.id;
        return (
          <div key={b.id} className={`overflow-hidden rounded-2xl border transition-all duration-200 ${isOpen ? "border-[#ff6b00]/30 shadow-sm" : "border-zinc-200"} bg-white`}>
            {/* Header — clickeable */}
            <button
              onClick={() => setOpen(isOpen ? null : b.id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              {/* Color dot o imagen thumbnail */}
              {b.imagen_url ? (
                <img src={b.imagen_url} alt={b.titulo || ""} className="h-12 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-xl" style={{ background: b.color_fondo || "#ff6b00" }} />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-black text-zinc-900 leading-tight">{b.titulo || "Beneficio"}</p>
                {b.subtitulo && <p className="mt-0.5 text-sm text-zinc-500 truncate">{b.subtitulo}</p>}
              </div>

              <span className={`shrink-0 transition-colors ${isOpen ? "text-[#ff6b00]" : "text-zinc-400"}`}>
                <IconChevron open={isOpen} />
              </span>
            </button>

            {/* Expandido */}
            {isOpen && (
              <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
                {b.imagen_url && (
                  <img src={b.imagen_url} alt={b.titulo || ""} className="mb-4 w-full rounded-xl object-cover" style={{ maxHeight: 220 }} />
                )}
                {b.descripcion_interna && (
                  <p className="text-sm leading-7 text-zinc-600">{b.descripcion_interna}</p>
                )}
                {b.enlace_url && (
                  <a
                    href={b.enlace_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-sm font-black text-white hover:bg-[#e05e00] transition-colors"
                  >
                    Ver beneficio <IconExternalLink />
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
