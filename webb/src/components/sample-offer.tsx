import Link from "next/link";
import { describeSelection, filterCompanies, hasSegment, selectionToQuery, type Selection } from "@/lib/catalog";

export function SampleOffer({ selection }: { selection: Selection }) {
  const chosen = hasSegment(selection);
  const rows = chosen
    ? filterCompanies({ ...selection, query: "" }).slice(0, 4)
    : [];
  const href = selectionToQuery({ ...selection, query: "" });
  const segment = describeSelection(selection);

  return (
    <section id="smakprov" className="band-lime">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="rounded-[1.75rem] border border-line bg-white px-5 py-6 shadow-[0_18px_40px_-28px_rgba(47,122,62,0.45)] sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Gratis smakprov</p>
          <h2 className="mt-2 max-w-3xl text-3xl tracking-tight">Prova ert segment utan kostnad.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Smakprovet är gratis och följer branschen, området och segmentet ni valt. Samma kolumner som utdraget.
            Vi säljer inte enskilda företag.
          </p>
          {chosen ? (
            <p className="mt-4 text-sm font-medium leading-6">{segment}</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              Välj bransch, ort, län, bolagsform eller storlek ovan. Smakprovet anpassas till just det segmentet.
            </p>
          )}
          {chosen && rows.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {rows.map((company) => (
                <li key={company.orgNr} className="rounded-2xl bg-foam px-4 py-3 text-sm leading-6">
                  <span className="block font-medium">{company.name}</span>
                  <span className="text-muted">
                    {company.city} · {company.industry}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {chosen && rows.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Exempelraderna täcker inte just den här kombinationen. Filen har ändå samma kolumner, och antalet i
              utdraget ovan är det riktiga urvalet.
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={href ? `/smakprov/csv?${href}` : "/smakprov/csv"}
              className="inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink"
            >
              {chosen ? "Ladda ner smakprovet" : "Ladda ner CSV"}
            </a>
            <a
              href={href ? `/smakprov/xls?${href}` : "/smakprov/xls"}
              className="inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white"
            >
              Ladda ner Excel
            </a>
            <Link href="/smakprov" className="inline-flex h-12 items-center text-sm font-medium text-sea">
              Se kolumnerna
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
