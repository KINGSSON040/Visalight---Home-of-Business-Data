import Link from "next/link";

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-sea-deep bg-sea text-white">
      <p className="bg-amber px-4 py-2 text-center text-sm font-medium text-ink">
        Förhandsvisning med exempelbolag. Priserna är de riktiga. Bolagen som syns är exempel tills det riktiga registret är kopplat.
      </p>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-2xl leading-none tracking-tight">VisaLight</span>
          <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.16em] text-white/75">
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
          <Link className="hidden md:inline" href="/smakprov">
            Smakprov
          </Link>
          <Link className="hidden lg:inline" href="/bransch">
            Branscher
          </Link>
          <Link href="/crm" className="text-white/70 hover:text-white">
            Logga in
          </Link>
          <Link href="/kassa" className="rounded-full bg-amber px-3.5 py-2 font-medium text-ink">
            Kassa
          </Link>
        </nav>
      </div>
    </div>
  );
}
