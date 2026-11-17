import Link from "next/link";
import { AudienceCounter } from "@/components/audience-counter";
import { CompanyLookup } from "@/components/company-lookup";

const USES = [
  {
    href: "/salj",
    title: "Sälj och marknad",
    text: "Prospektera, segmentera och nå beslutsfattare där numret finns.",
  },
  {
    href: "/ekonomi",
    title: "Ekonomi",
    text: "Aktuellt organisationsnummer, adress och SNI. Inte en kreditupplysning.",
  },
  {
    href: "/utvecklare",
    title: "Utvecklare",
    text: "CSV och Excel med fasta kolumner. API är inte öppet ännu.",
  },
];

const EXAMPLES = [
  {
    figure: "35 %",
    title: "Fler bokade möten i räkneexemplet",
    text: "20 bokade möten på en gammal lista, 27 när urvalet bara innehåller aktiva bolag i rätt bransch. 7 fler möten är 35 %. Det är ett räkneexempel, inte en kundberättelse.",
  },
  {
    figure: "10 tim",
    title: "Mindre letande efter adress",
    text: "200 bolag gånger 3 minuter att leta adress och SNI är 10 timmar. Med filen är fälten redan ifyllda när SCB har dem.",
  },
  {
    figure: "0 kr",
    title: "Tomma e-postfält skickas inte",
    text: "Ett utskick som bara tar rader med e-post betalar 40 öre per adress som finns. Saknas adressen är fältet tomt och kostar inget.",
  },
];

export function HomeMore() {
  return (
    <>
      <AudienceCounter />
      <CompanyLookup />
      <section id="smakprov" className="border-t border-line bg-foam/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Smakprov</p>
            <h2 className="mt-3 text-4xl tracking-tight">Testa filen i ditt CRM innan du köper.</h2>
            <p className="mt-3 max-w-xl text-lg leading-8 text-muted">
              16 påhittade rader med samma kolumner som en beställd lista. Ladda ner utan konto och se hur
              inläsningen ser ut.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/smakprov/csv" className="inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink">
              Ladda ner CSV
            </a>
            <a href="/smakprov/xls" className="inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
              Ladda ner Excel
            </a>
            <Link href="/smakprov" className="inline-flex h-12 items-center text-sm font-medium text-sea">
              Se kolumnerna
            </Link>
          </div>
        </div>
      </section>

      <section id="kallor" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Färskt uttag</p>
          <h2 className="mt-3 max-w-3xl text-4xl tracking-tight">Datan byts ut när registret synkas.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">SCB</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Grunduppgifterna kommer från SCB:s allmänna företagsregister: namn, adress, SNI, form och storlek.
              </p>
            </article>
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">Vid varje synk</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Inte en realtidsström och inte en gammal årsfil. Nästa uttag ersätter det förra. Avregistrerade bolag
                följer inte med.
              </p>
            </article>
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">Tomt är tomt</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Telefon och e-post skrivs bara när källan har värdet. Skatteverket är inte källa för listan.
              </p>
            </article>
          </div>
          <p className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/kallor" className="text-sea">
              Källor och uppdatering
            </Link>
            <Link href="/gdpr" className="text-sea">
              Personuppgifter och B2B
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-4xl tracking-tight">Så används en aktuell lista</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Tre räkneexempel. De är inte resultat från namngivna kunder.
          </p>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {EXAMPLES.map((item) => (
              <li key={item.title} className="rounded-3xl border border-line bg-foam/40 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sea">Räkneexempel</p>
                <p className="mt-3 text-4xl tracking-tight">{item.figure}</p>
                <h3 className="mt-3 text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-4xl tracking-tight">Olika jobb, samma register</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {USES.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block h-full rounded-3xl border border-line bg-white p-5">
                  <h3 className="text-xl tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-sea-deep text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-amber">Köp själv</p>
            <h2 className="mt-3 text-3xl tracking-tight">Lista från 399 kr, utan konto.</h2>
            <p className="mt-3 leading-7 text-white/75">
              Kort eller faktura. Filen skickas till e-posten när betalningen är klar. Priset står öppet: 10 öre för
              grundraden, 30 öre för telefon, 40 öre för e-post och beslutsfattare.
            </p>
            <Link href="/kassa" className="mt-5 inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink">
              Till kassan
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-amber">Större upplägg</p>
            <h2 className="mt-3 text-3xl tracking-tight">15 minuter om filen ska in i ett system.</h2>
            <p className="mt-3 leading-7 text-white/75">
              Inget abonnemang. Ett kort samtal om format, återkommande uttag eller en senare koppling.
            </p>
            <Link href="/demo" className="mt-5 inline-flex h-12 items-center rounded-full border border-white/30 px-5 font-medium">
              Boka 15 minuter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
