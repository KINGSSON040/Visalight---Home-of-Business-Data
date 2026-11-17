import Link from "next/link";

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <p className="bg-green px-4 py-2 text-center text-sm text-white">
        Exempeldata. Priserna är de riktiga. Bolagen är påhittade tills registret från SCB är inläst.
      </p>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-2xl leading-none tracking-tight">Visalight</span>
          <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            Företagsdata
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="hidden sm:inline" href="/#urval">
            Urval
          </Link>
          <Link href="/#pris">Pris</Link>
          <Link className="hidden md:inline" href="/#sa-funkar-det">
            Så funkar det
          </Link>
          <Link href="/kassa" className="rounded-full bg-ink px-3.5 py-2 text-white">
            Kassa
          </Link>
        </nav>
      </div>
    </div>
  );
}
