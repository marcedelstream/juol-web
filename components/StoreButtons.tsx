import { appStoreUrl, playStoreUrl } from "@/lib/env";

export function StoreButtons({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? "rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-950 shadow-sm"
    : "rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left font-bold text-zinc-950 shadow-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a className={cls} href={appStoreUrl}>App Store</a>
      <a className={cls} href={playStoreUrl}>Google Play</a>
    </div>
  );
}
