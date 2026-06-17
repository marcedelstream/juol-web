"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export function useLiveUserCount(initial: number | null, pollMs = 10000) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    const supabase = createSupabaseClient({ detectSessionInUrl: false });
    let cancelled = false;

    async function poll() {
      const { data } = await supabase.rpc("public_stats");
      const users = (data as any)?.users;
      if (!cancelled && typeof users === "number") setCount(users);
    }

    poll();
    const interval = setInterval(poll, pollMs);

    const channel = supabase
      .channel("users-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "users" },
        () => setCount((prev) => (prev == null ? 1 : prev + 1))
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "users" },
        () => setCount((prev) => (prev == null || prev <= 0 ? 0 : prev - 1))
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [pollMs]);

  return count;
}
