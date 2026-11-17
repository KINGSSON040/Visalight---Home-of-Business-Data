import { EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE, BASE_ORE, MINIMUM_ORE } from "@/lib/pricing";

const steps = [
  {
    number: "01",
    title: "Välj urval",
    text: "Filtrera på ort och bransch. Kryssa i telefon och e-post om de ska med i filen.",
  },
  {
    number: "02",
    title: "Betala som gäst",
    text: "Fyll i e-post och företagsuppgifter i kassan. Inget konto och ingen bindningstid.",
  },
  {
    number: "03",
    title: "Få filen",
    text: "Excel och CSV skickas till e-postadressen när betalningen är bekräftad.",
  },
];

const prices = [
  {
    name: "Grunduppgifter",
    price: `${formatKronor(BASE_ORE)} kr`,
    detail: "Namn, organisationsnummer, gatuadress, postnummer, ort, bransch och SNI.",
  },
  {
    name: "Telefonnummer",
    price: `${formatKronor(PHONE_ORE)} kr`,
    detail: "Varje nummer som finns hos bolaget. Flera nummer är flera rader i priset.",
  },
  {
    name: "Firmatecknarens nummer",
    price: `${formatKronor(SIGNATORY_ORE)} kr`,
    detail: "Numret som källan anger som firmatecknarens, skilt från övriga nummer.",
  },
  {
    name: "E-post",
    price: `${formatKronor(EMAIL_ORE)} kr`,
    detail: "Varje adress som källan har angett. En tom ruta kostar inget.",
  },
];

export function HomeStory() {
  return (
    <>
      <section id="sa-funkar-det" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-serif text-4xl tracking-tight">Så funkar ett köp</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-3xl border border-line bg-card p-5">
              <p className="font-mono text-sm text-green">{step.number}</p>
              <h3 className="mt-3 font-serif text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pris" className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="font-serif text-4xl tracking-tight">Vad en rad kostar</h2>
          <p className="mt-3 max-w-xl text-muted">
            Lägsta order är {formatKronor(MINIMUM_ORE)} kr. Under den gränsen används lägsta order. Över den betalar du det beräknade priset.
          </p>
          <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-card">
            {prices.map((item) => (
              <div key={item.name} className="grid gap-1 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
                </div>
                <p className="font-mono text-sm sm:pt-1">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-3xl bg-green-soft p-5">
          <h3 className="font-serif text-2xl">En större order</h3>
          <p className="mt-3 text-sm leading-6">
            10 000 bolag där alla har ett telefonnummer kostar 4 000 kr. Grunduppgifter är 1 000 kr och numren 3 000 kr.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Saknas numret på ett bolag dras inte 0,30 kr för den raden. Volymrabatt läggs in när nivåerna är satta.
          </p>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
        <h2 className="font-serif text-4xl tracking-tight">Det här följer aldrig med</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "Reklamspärrade bolag lämnas ute ur filen.",
            "Avregistrerade bolag lämnas ute ur filen.",
            "Ett tomt telefon- eller e-postfält kostar inget.",
            "Vi skriver inte in ett nummer eller en adress som källan inte har angett.",
          ].map((item) => (
            <li key={item} className="rounded-2xl border border-line bg-card px-4 py-4 text-sm leading-6">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
