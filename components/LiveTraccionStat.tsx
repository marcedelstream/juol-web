"use client";

import { useLiveUserCount } from "@/lib/useLiveUserCount";

export function LiveTraccionStat({ initialUsers }: { initialUsers: number }) {
  const users = useLiveUserCount(initialUsers);
  const display = users == null ? `+${initialUsers}` : `+${users.toLocaleString("es-PY")}`;

  return (
    <div className="commercial-stat">
      <strong>{display}</strong>
      <span>usuarios registrados por tráfico orgánico</span>
    </div>
  );
}
