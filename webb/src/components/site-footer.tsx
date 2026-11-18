import Link from "next/link";
import { BuilderLink } from "@/components/builder-link";
import { BrandLockup } from "@/components/logo-mark";
import { StatusChip } from "@/components/status-chip";
import { OFFER_LINE, SELLER } from "@/lib/seller";

const GROUPS = [
  {
    title: "Utdrag",
    links: [
      { href: "/#urval", label: "Till listbyggaren" },
      { href: "/statistik", label: "Statistik" },
      { href: "/nystartade-bolag", label: "Nystartade bolag" },
      { href: "/nyheter", label: "Nyheter" },
      { href: "/smakprov", label: "Smakprov" },
      { href: "/bransch", label: "Branscher" },
      { href: "/konto", label: "Köphistorik" },
    ],
  },
  {
    title: "Kontakt",
    links: [
      { href: "/demo?arende=meddelande", label: "Skriv ett meddelande" },
      { href: "/demo?arende=tid", label: "Boka tid" },
      { href: "/demo?arende=mote", label: "Boka möte" },
      { href: "/demo", label: "Boka 15 minuter" },
    ],
  },
  {
    title: "Villkor",
    links: [
      { href: "/kallor", label: "Källor" },
      { href: "/gdpr", label: "Personuppgifter" },
      { href: "/integritet", label: "Integritet" },
      { href: "/villkor", label: "Köpvillkor" },
      { href: "/cookies", label: "Cookies" },
      { href: "/salj", label: "Sälj" },
      { href: "/ekonomi", label: "Ekonomi" },
      { href: "/utvecklare", label: "Utvecklare" },
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
          <p className="max-w-sm leading-6">{OFFER_LINE} Ni köper för att hitta er nästa kund redan idag. Priser exkl. moms. Lägsta order 399 kr.</p>
          <p className="max-w-sm leading-6 text-muted">{SELLER.line}</p>
          <p id="kontakt" className="max-w-sm leading-6 text-muted">
            Telefon: numret läggs in när det finns. Vill ni inte köpa själva kan ni{" "}
            <Link href="/demo?arende=meddelande" className="font-semibold text-ink hover:underline">skriva ett meddelande</Link>,{" "}
            <Link href="/demo?arende=tid" className="font-semibold text-ink hover:underline">boka tid</Link>{" "}
            eller{" "}
            <Link href="/demo?arende=mote" className="font-semibold text-ink hover:underline">boka möte</Link>.
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
