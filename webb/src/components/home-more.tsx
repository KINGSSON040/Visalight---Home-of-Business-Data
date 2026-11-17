import Link from "next/link";
import { AudienceCounter } from "@/components/audience-counter";

const VALUES = [
  {
    title: "Slipper hämta själva",
    text: "Namn, adress och bransch är redan ifyllda från SCB. Ni behöver inte slå upp bolag för bolag.",
  },
  {
    title: "Slipper rensa nedlagda bolag",
    text: "Avregistrerade bolag och bolag i konkurs tas bort när registret uppdateras.",
  },
  {
    title: "Betalar bara för det som finns",
    text: "Tom e-post och tomt telefonnummer kostar inget. Fältet lämnas tomt.",
  },
];

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

export function HomeMore({ updatedLabel }: { updatedLabel: string | null }) {
  return (
    <>
      <AudienceCounter />

      <section id="kallor" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Källa</p>
          <h2 className="mt-3 max-w-3xl text-3xl tracking-tight">Vi arbetar endast med aktuella uppgifter.</h2>
          <p className="mt-3 text-lg font-medium text-ink">
            {updatedLabel
              ? `Senast uppdaterat ${updatedLabel}.`
              : "Senast uppdaterat visas här när registret är synkat på den här datorn."}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-line bg-foam/50 px-4 py-4">
              <h3 className="text-lg tracking-tight">SCB</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">
                Namn, adress, SNI, bolagsform och storlek hämtas från SCB:s företagsregister.
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-foam/50 px-4 py-4">
              <h3 className="text-lg tracking-tight">Vid varje uppdatering</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">
                Utdraget tas alltid från den senaste uppdateringen. Äldre register används inte. Det är inte en
                direktström, och avregistrerade bolag följer inte med.
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-foam/50 px-4 py-4">
              <h3 className="text-lg tracking-tight">Tomma fält lämnas tomma</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">
                Telefon och e-post tas med bara när de finns. Saknas de lämnas fältet tomt. Skatteverket är inte källa
                för utdraget.
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

      <section className="band-mint">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <h2 className="text-3xl tracking-tight">Värdet</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Ni sparar tiden det tar att hämta, uppdatera och rensa företagsinformationen själva.
          </p>
          <ul className="mt-6 grid gap-3 lg:grid-cols-3">
            {VALUES.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line bg-white/80 px-4 py-4">
                <h3 className="text-lg tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <h2 className="text-3xl tracking-tight">Samma företagsdata, olika arbete</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {USES.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block h-full rounded-2xl border border-line bg-foam/40 px-4 py-4">
                  <h3 className="text-lg tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-muted">
            Behöver utdraget in i ett system?{" "}
            <Link href="/demo" className="font-medium text-sea">
              Boka 15 minuter
            </Link>
            . Inget abonnemang.
          </p>
        </div>
      </section>
    </>
  );
}
