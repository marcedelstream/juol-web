import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-400">
      <div className="container-page">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xl font-black text-white">juol</p>
            <p className="mt-1 text-sm">Fútbol cerca tuyo, organizado sin vueltas.</p>
            <p className="mt-1 text-xs text-zinc-600">Paraguay</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
            <Link href="/beneficios" className="hover:text-white">Beneficios</Link>
            <Link href="/pro" className="hover:text-white">Juol Pro</Link>
            <Link href="/descargar" className="hover:text-white">Descargar</Link>
            <Link href="/terminos" className="hover:text-white">Términos</Link>
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-900 pt-6 text-xs text-zinc-700">
          © {new Date().getFullYear()} Juol
        </div>
      </div>
    </footer>
  );
}
