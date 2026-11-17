import Link from "next/link";
import { AudienceCounter } from "@/components/audience-counter";
import { CompanyLookup } from "@/components/company-lookup";

const USES = [
  {
    href: "/salj",
    title: "Sälj och marknad",
    text: "Ring eller mejla bolag i en bransch och en ort. Numret följer med bara när det finns.",
  },
  {
    href: "/ekonomi",
    title: "Ekonomi",
    text: "Namn, organisationsnummer, adress och SNI. Ingen kreditupplysning.",
  },
  {
    href: "/utvecklare",
    title: "Utvecklare",
    text: "CSV och Excel med fasta kolumner. Ett API finns inte ännu.",
  },
];

const EXAMPLES = [
  {
    figure: "Rätt bolag",
    title: "Bara bolag som finns kvar",
    text: "Avregistrerade bolag och bolag i konkurs tas bort vid uppdateringen. Du ringer inte nummer till bolag som har lagts ner.",
  },
  {
    figure: "Färdiga fält",
    title: "Adress och SNI är redan ifyllda",
    text: "Du slipper slå upp varje bolag för att hitta adress och bransch. Fälten kommer från SCB när de finns där.",
  },
  {
    figure: "0 kr",
    title: "Tom e-post kostar inget",
    text: "E-post kostar 40 öre per adress som finns. Saknas adressen är fältet tomt, och raden kostar inte för e-post.",
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
            <h2 className="mt-3 text-4xl tracking-tight">Se hur filen ser ut innan du köper.</h2>
            <p className="mt-3 max-w-xl text-lg leading-8 text-muted">
              16 påhittade rader med samma kolumner som en riktig beställning. Ladda ner utan konto och prova
              inläsningen i ditt CRM.
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
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Källa</p>
          <h2 className="mt-3 max-w-3xl text-4xl tracking-tight">Uppgifterna byts ut när registret uppdateras.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">SCB</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Namn, adress, SNI, bolagsform och storlek hämtas från SCB:s företagsregister.
              </p>
            </article>
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">Vid varje uppdatering</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Nästa köp använder det nya registret. Det är inte en direktström, och det är inte en fil som ligger
                kvar i flera år. Avregistrerade bolag följer inte med.
              </p>
            </article>
            <article className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-xl tracking-tight">Tomma fält lämnas tomma</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Telefon och e-post tas med bara när de finns. Saknas de lämnas fältet tomt. Skatteverket är inte källa
                för listan.
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
          <h2 className="text-4xl tracking-tight">Vad listan används till</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Tre saker den löser. Inga påhittade kundresultat.
          </p>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {EXAMPLES.map((item) => (
              <li key={item.title} className="rounded-3xl border border-line bg-foam/40 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sea">I praktiken</p>
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
            <h2 className="mt-3 text-3xl tracking-tight">Från 399 kr, utan konto.</h2>
            <p className="mt-3 leading-7 text-white/75">
              Du betalar för grunduppgifterna och för de tillval du kryssar i. Tomma fält kostar inget. Filen skickas
              till din e-post när betalningen är klar.
            </p>
            <Link href="/kassa" className="mt-5 inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink">
              Till kassan
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-amber">Större upplägg</p>
            <h2 className="mt-3 text-3xl tracking-tight">Behöver filen in i ett system?</h2>
            <p className="mt-3 leading-7 text-white/75">
              Boka 15 minuter. Vi går igenom format och om ni behöver samma uttag igen. Inget abonnemang.
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
