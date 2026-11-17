import Link from "next/link";
import { BrandLockup } from "@/components/logo-mark";

const LINKS = [
  { href: "/statistik", label: "Statistik" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/#pris", label: "Pris" },
  { href: "/#sa-funkar-det", label: "Så funkar det" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="min-w-0">
          <BrandLockup subtitle="Alla Sveriges företag" compact />
        </Link>
        <nav aria-label="Huvudmeny" className="flex shrink-0 items-center gap-1 text-sm font-medium sm:gap-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hidden rounded-full px-3 py-2 text-ink hover:bg-white md:inline">
              {link.label}
            </Link>
          ))}
          <Link href="/crm" className="hidden rounded-full px-3 py-2 text-muted hover:text-ink lg:inline">
            Logga in
          </Link>
          <Link href="/#urval" className="btn-neon whitespace-nowrap rounded-full px-4 py-2 font-semibold">
            Skapa utdrag
          </Link>
        </nav>
      </div>
      <nav aria-label="Genvägar" className="flex gap-1 overflow-x-auto px-3 pb-2 text-sm font-medium md:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="chip shrink-0 rounded-full px-3 py-1">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
