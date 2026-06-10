"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

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
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    const supabase = createSupabaseClient({ detectSessionInUrl: false });

    const channel = supabase
      .channel("users-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "users" },
        () => {
          setUsers((prev) => (prev == null ? 1 : prev + 1));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "users" },
        () => {
          setUsers((prev) => (prev == null || prev <= 0 ? 0 : prev - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
