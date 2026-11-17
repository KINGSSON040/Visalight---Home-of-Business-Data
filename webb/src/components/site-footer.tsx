import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-sea px-4 pt-8 pb-24 text-sm text-white/80 lg:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg text-white">VisaLight</p>
          <p>Företagslistor utan abonnemang, med verifierad och färsk företagsdata. Lägsta order 399 kr.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/bransch">Branscher</Link>
          <Link href="/ord">Ord</Link>
          <Link href="/#sa-funkar-det">Så funkar det</Link>
          <Link href="/kassa">Kassa</Link>
        </nav>
      </div>
    </footer>
  );
}
