import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white py-10">
      <div className="container-page flex flex-col gap-6 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black text-zinc-950">juol</p>
          <p>Fútbol cerca tuyo, organizado sin vueltas.</p>
        </div>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/pro">Juol Pro</Link>
          <Link href="/descargar">Descargar</Link>
        </div>
      </div>
    </footer>
  );
}
