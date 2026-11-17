import Link from "next/link";

export function SiteHeader() {
  return (
    <div className="site-header sticky top-0 z-40 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <Link href="/" className="min-w-0">
          <span className="block truncate font-serif text-xl leading-none tracking-tight text-white sm:text-2xl">
            VisaLight
          </span>
          <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.16em] text-white/90">Företagsdata</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          <Link className="hidden text-white hover:text-white sm:inline" href="/#pris">
            Pris
          </Link>
          <Link className="hidden text-white hover:text-white md:inline" href="/#sa-funkar-det">
            Så funkar det
          </Link>
          <Link className="hidden text-white hover:text-white md:inline" href="/#smakprov">
            Smakprov
          </Link>
          <Link className="hidden text-white hover:text-white lg:inline" href="/#branscher">
            Branscher
          </Link>
          <Link href="/crm" className="whitespace-nowrap text-white/90 hover:text-white">
            Logga in
          </Link>
          <Link
            href="/#urval"
            className="btn-fade-amber whitespace-nowrap rounded-full bg-amber px-3 py-2 font-medium text-ink shadow-[0_0_0_2px_rgba(255,255,255,0.92)] sm:px-3.5"
          >
            Skapa utdrag
          </Link>
        </nav>
      </div>
    </div>
  );
}
