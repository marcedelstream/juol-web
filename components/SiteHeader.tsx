import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#fffaf6]/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/juol-icon.png" alt="Juol" width={32} height={32} className="rounded-xl" />
          <span className="text-lg font-black tracking-tight">juol</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-500 md:flex">
          <Link href="/#como-funciona" className="hover:text-zinc-900">Cómo funciona</Link>
          <Link href="/beneficios" className="hover:text-zinc-900">Beneficios</Link>
          <Link href="/pro" className="hover:text-zinc-900">Juol Pro</Link>
        </nav>
        <Link
          href="/descargar"
          className="rounded-full bg-[#FD7401] px-4 py-2 text-sm font-black text-white hover:bg-[#d95600]"
        >
          Descargar
        </Link>
      </div>
    </header>
  );
}
