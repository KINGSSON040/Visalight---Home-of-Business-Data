import Link from "next/link";
import { BrandLockup } from "@/components/logo-mark";

const NAV = [
  { href: "/statistik", label: "Statistik" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/#sa-funkar-det", label: "Så funkar det" },
  { href: "/#pris", label: "Priser" },
  { href: "/#branscher", label: "Branscher" },
];

export function SiteHeader() {
  return (
    <div className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="min-w-0">
          <BrandLockup subtitle="Alla Sveriges företag" compact />
        </Link>
        <nav aria-label="Huvudmeny" className="hidden items-center gap-1 text-sm font-extrabold lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 hover:bg-[var(--pop-sun)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/crm" className="hidden px-2 text-sm font-bold sm:inline">
            Logga in
          </Link>
          <Link href="/#urval" className="pop-btn pop-btn--magenta h-10 px-4 text-sm whitespace-nowrap">
            Bygg utdrag
          </Link>
          <details className="relative lg:hidden">
            <summary className="pop-btn pop-btn--white h-10 cursor-pointer px-3 text-sm" aria-label="Meny">
              Meny
            </summary>
            <nav aria-label="Meny" className="sticker absolute right-0 mt-3 grid w-56 gap-1 bg-white p-2 text-base font-extrabold">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 hover:bg-[var(--pop-sun)]">
                  {item.label}
                </Link>
              ))}
              <Link href="/crm" className="rounded-xl px-3 py-2 hover:bg-[var(--pop-sun)]">
                Logga in
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </div>
  );
}
