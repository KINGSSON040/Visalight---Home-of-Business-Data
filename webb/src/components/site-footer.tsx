import Link from "next/link";
import { BuilderLink } from "@/components/builder-link";
import { BrandLockup } from "@/components/logo-mark";
import { StatusChip } from "@/components/status-chip";
import { OFFER_LINE, OFFER_WHY, SELLER, SellerFacts } from "@/lib/seller";

const GROUPS = [
  {
    title: "Utdrag",
    links: [
      { href: "/#urval", label: "Till listbyggaren" },
      { href: "/priser", label: "Priser" },
      { href: "/nystartade-bolag", label: "Nystartade bolag" },
      { href: "/bransch", label: "Branscher" },
      { href: "/statistik", label: "Statistik" },
      { href: "/nyheter", label: "Nyheter" },
      { href: "/smakprov", label: "Smakprov" },
    ],
  },
  {
    title: "Företaget",
    links: [
      { href: "/om-oss", label: "Om oss" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/kontakt?arende=meddelande", label: "Skriv ett meddelande" },
      { href: "/kallor", label: "Källor" },
      { href: "/salj", label: "Sälj" },
    ],
  },
  {
    title: "Villkor",
    links: [
      { href: "/integritet", label: "Integritet" },
      { href: "/villkor", label: "Köpvillkor" },
      { href: "/cookies", label: "Cookies" },
      { href: "/gdpr", label: "Personuppgifter" },
    ],
  },
];

export function SiteFooter({
  updatedLabel,
  registerReady = false,
  exampleData = false,
  hideRegisterChip = false,
}: {
  updatedLabel?: string | null;
  registerReady?: boolean;
  exampleData?: boolean;
  hideRegisterChip?: boolean;
}) {
  return (
    <footer className="site-footer border-t border-ink/10 px-4 py-20 text-sm text-ink/80">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <div className="space-y-4">
          <BrandLockup />
          <p className="max-w-sm leading-6">{OFFER_LINE} {OFFER_WHY} Priser exkl. moms. Lägsta order 399 kr.</p>
          <p className="max-w-sm leading-6 text-muted">{SELLER.line}</p>
          <SellerFacts className="max-w-sm space-y-1 text-sm leading-6 text-muted" />
          <p id="kontakt" className="max-w-sm leading-6 text-muted">
            Vill ni inte köpa själva kan ni{" "}
            <Link href="/kontakt?arende=meddelande" className="font-semibold text-ink hover:underline">skriva ett meddelande</Link>.
            Inget skickas förrän en inkorg finns.
          </p>
        </div>
        <div className="space-y-3">
          {hideRegisterChip ? null : (
            <StatusChip plain updatedLabel={updatedLabel ?? null} registerReady={registerReady} exampleData={exampleData} />
          )}
        </div>
      </div>
      <nav className="mx-auto mt-14 grid max-w-6xl gap-10 border-t border-ink/15 pt-10 sm:grid-cols-3" aria-label="Sidfot">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold tracking-[0.16em] text-ink uppercase">{group.title}</p>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.href === "/#urval" ? (
                    <BuilderLink className="hover:text-ink hover:underline">{link.label}</BuilderLink>
                  ) : (
                    <Link href={link.href} className="hover:text-ink hover:underline">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </footer>
  );
}
