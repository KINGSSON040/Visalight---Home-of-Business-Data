import Link from "next/link";
import { Mark, SELLER } from "@/lib/seller";

export function SiteFooter() {
  return (
    <footer className="theme-wash px-4 py-8 text-sm text-ink/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg text-ink">{SELLER.tradeName}</p>
          <p>Färsk företagsdata för svenska bolag. Priser exkl. moms. Lägsta order 399 kr. Beställning öppnar snart.</p>
        </div>
        <p className="text-sm leading-6 text-muted">
          {SELLER.tradeName} är inte ett registrerat bolag ännu. <Mark>{SELLER.orgNr}</Mark> · <Mark>{SELLER.address}</Mark> ·{" "}
          <Mark>{SELLER.vatNr}</Mark>
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/#urval">Skapa utdrag</Link>
          <Link href="/smakprov">Smakprov</Link>
          <Link href="/kallor">Källor</Link>
          <Link href="/gdpr">Personuppgifter</Link>
          <Link href="/integritet">Integritet</Link>
          <Link href="/villkor">Köpvillkor</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/salj">Sälj</Link>
          <Link href="/ekonomi">Ekonomi</Link>
          <Link href="/utvecklare">Utvecklare</Link>
          <Link href="/demo">Boka 15 minuter</Link>
          <Link href="/bransch">Branscher</Link>
          <Link href="/kassa">Förhandsboka</Link>
        </nav>
      </div>
    </footer>
  );
}
