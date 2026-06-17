"use client";

import { useLiveUserCount } from "@/lib/useLiveUserCount";

interface Props {
  initialUsers: number | null;
  initialPartidos: number | null;
  initialConfirmaciones: number | null;
}

function fmt(n: number | null) {
  if (n == null || n === 0) return "—";
  return n.toLocaleString("es-PY");
}

export function StatsCounter({ initialUsers, initialPartidos, initialConfirmaciones }: Props) {
  const users = useLiveUserCount(initialUsers);

  const stats = [
    { value: fmt(users), label: "jugadores" },
    { value: fmt(initialPartidos), label: "partidos" },
    { value: fmt(initialConfirmaciones), label: "confirmaciones" },
  ];

  return (
    <div className="mt-20 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p className="text-4xl font-black text-white tabular-nums">{value}</p>
          <p className="mt-1 text-xs font-medium text-white/30">{label}</p>
        </div>
      ))}
    </div>
  );
}
