import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[#fffaf6]/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/juol-icon.png" alt="Juol" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-black tracking-tight">juol</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-700 md:flex">
          <Link href="/#como-funciona">Cómo funciona</Link>
          <Link href="/beneficios">Beneficios</Link>
          <Link href="/pro">Juol Pro</Link>
        </nav>
        <Link href="/descargar" className="rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#d95600]">
          Descargar
        </Link>
      </div>
    </header>
  );
}
