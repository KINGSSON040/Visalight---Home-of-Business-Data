import Link from "next/link";
import { BrandLockup } from "@/components/logo-mark";

const NAV = [
  { href: "/statistik", label: "Statistik", min: "sm" },
  { href: "/nyheter", label: "Nyheter", min: "sm" },
  { href: "/#pris", label: "Pris", min: "md" },
  { href: "/#sa-funkar-det", label: "Så funkar det", min: "lg" },
  { href: "/bransch", label: "Branscher", min: "lg" },
] as const;

const SHOW = { sm: "hidden sm:inline-flex", md: "hidden md:inline-flex", lg: "hidden lg:inline-flex" };

export function SiteHeader() {
  return (
    <div className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4">
        <Link href="/" className="min-w-0">
          <BrandLockup subtitle="Företagsdata" compact />
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-[0.95rem] font-bold sm:gap-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`${SHOW[item.min]} rounded-full px-3 py-1.5 hover:bg-peach`}>
              {item.label}
            </Link>
          ))}
          <Link href="/crm" className="rounded-full px-2 py-1.5 whitespace-nowrap text-muted hover:bg-peach sm:px-3">
            Logga in
          </Link>
          <Link href="/#urval" className="btn-chunk is-sun h-10 px-4 text-sm whitespace-nowrap sm:text-base">
            Skapa utdrag
          </Link>
        </nav>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t-2 border-ink/10 px-3 py-1.5 text-sm font-bold sm:hidden" aria-label="Mer">
        <Link href="/statistik" className="rounded-full bg-sun-soft px-3 py-1">Statistik</Link>
        <Link href="/nyheter" className="rounded-full bg-rose-soft px-3 py-1">Nyheter</Link>
        <Link href="/#pris" className="rounded-full bg-leaf-soft px-3 py-1">Pris</Link>
        <Link href="/bransch" className="rounded-full bg-coral-soft px-3 py-1">Branscher</Link>
      </nav>
    </div>
  );
}
