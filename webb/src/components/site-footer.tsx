import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="theme-wash px-4 py-8 text-sm text-ink/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg text-ink">VisaLight</p>
          <p>VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata från officiella register. Lägsta order 399 kr, utan konto.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/smakprov">Smakprov</Link>
          <Link href="/kallor">Källor</Link>
          <Link href="/gdpr">Personuppgifter</Link>
          <Link href="/salj">Sälj</Link>
          <Link href="/ekonomi">Ekonomi</Link>
          <Link href="/utvecklare">Utvecklare</Link>
          <Link href="/demo">Boka 15 minuter</Link>
          <Link href="/bransch">Branscher</Link>
          <Link href="/kassa">Kassa</Link>
        </nav>
      </div>
    </footer>
  );
}
