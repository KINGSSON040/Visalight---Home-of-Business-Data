import Link from "next/link";

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
    title: "Sälj och marknad",
    text: "Välj bransch och ort, se hur många bolag som finns just nu och ring dem som har nummer.",
  },
  {
    title: "Ekonomi",
    text: "Namn, organisationsnummer, adress och SNI från den senaste uppdateringen. Ingen kreditupplysning.",
  },
  {
    title: "Utvecklare",
    text: "CSV och Excel med fasta kolumner, tagna från samma färska utdrag.",
  },
];

export function HomeMore({ updatedLabel }: { updatedLabel: string | null }) {
  return (
    <>
      <section id="kallor" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Så färsk är datan</p>
          <h2 className="mt-3 max-w-3xl text-3xl tracking-tight">Ni får den senaste uppdateringen, inte förra årets fil.</h2>
          <p className="mt-3 text-lg font-medium text-ink">
            {updatedLabel
              ? `Registret uppdaterades ${updatedLabel}.`
              : "Utdraget tas från den senaste uppdateringen av företagsregistret."}
          </p>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Namn, adress, bransch och SNI kommer från SCB. När registret byts ut följer utdraget med. Avregistrerade
            bolag, konkurs och reklamspärr ligger inte kvar. Det är inte en uppdatering varje minut.
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
          <Link href="/#urval" className="mt-6 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Skapa utdraget från den här uppdateringen
          </Link>
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
          <h2 className="text-3xl tracking-tight">Tid ni inte behöver lägga på registret</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Ni slipper hämta, uppdatera och rensa. Utdraget är redan avgränsat när ni öppnar det.
          </p>
          <ul className="mt-6 grid gap-3 lg:grid-cols-3">
            {VALUES.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line bg-white/80 px-4 py-4">
                <h3 className="text-lg tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/#urval" className="mt-6 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Öppna utdraget
          </Link>
        </div>
      </section>

      <section className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <h2 className="text-3xl tracking-tight">Samma färska utdrag, olika arbete</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {USES.map((item) => (
              <li key={item.title}>
                <Link href="/#urval" className="block h-full rounded-2xl border border-line bg-white px-4 py-4">
                  <h3 className="text-lg tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-sea">Skapa utdraget</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
