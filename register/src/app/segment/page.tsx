import Link from "next/link";
import { FilterForm } from "@/components/Filters";
import { Shell } from "@/components/Shell";
import { formatKronor } from "@/lib/pricing";
import { filtersToSearch, priceFor, readFilters, savedSegments } from "@/lib/queries";
import { saveSegment } from "../foretag/[orgNr]/actions";

export default async function SegmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const priced = priceFor(filters);
  const saved = savedSegments();
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Segment</h1>
      <p className="mt-2 mb-5 max-w-2xl text-sm text-[var(--muted)]">
        Priset räknas på bolag som har organisationsnummer, namn, gatuadress, ort och SNI-kod. Tomma kontaktfält kostar inget.
      </p>
      <FilterForm filters={filters} action="/segment" />
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Count label="Bolag" value={priced.counts.companies} detail="10 öre" />
        <Count label="Nummer" value={priced.counts.phones} detail="30 öre" />
        <Count label="Firmatecknarens nummer" value={priced.counts.signatoryPhones} detail="40 öre" />
        <Count label="E-post" value={priced.counts.emails} detail="40 öre" />
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums">
        {formatKronor(priced.quote.totalOre)} kr
      </p>
      <p className="text-sm text-[var(--muted)]">
        Beräknat {formatKronor(priced.quote.rawOre)} kr.
        {priced.quote.minimumApplied ? " Lägsta order 399 kr används." : ""}
      </p>
      <form action={saveSegment} className="mt-4 flex max-w-md gap-2">
        <input type="hidden" name="q" value={filters.q} />
        <input type="hidden" name="city" value={filters.city} />
        <input type="hidden" name="sni" value={filters.sni} />
        <input type="hidden" name="flag" value={filters.flag} />
        {filters.hasPhone ? <input type="hidden" name="hasPhone" value="1" /> : null}
        {filters.hasEmail ? <input type="hidden" name="hasEmail" value="1" /> : null}
        <input name="name" placeholder="Namn på segmentet" />
        <button type="submit">Spara</button>
      </form>
      <p className="mt-3 text-sm">
        <Link className="underline" href={`/foretag?${filtersToSearch(filters)}`}>
          Öppna bolagen i urvalet
        </Link>
      </p>
      <h2 className="mt-8 font-semibold">Sparade segment</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {saved.map((segment) => {
          const stored = JSON.parse(segment.filters_json) as typeof filters;
          return (
            <li key={segment.id}>
              <Link className="underline" href={`/segment?${filtersToSearch(stored)}`}>
                {segment.name}
              </Link>
            </li>
          );
        })}
        {saved.length === 0 ? <li>Inget segment sparat ännu.</li> : null}
      </ul>
    </Shell>
  );
}

function Count({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="card">
      <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString("sv-SE")}</div>
      <div className="text-sm">{label}</div>
      <div className="text-xs text-[var(--muted)]">{detail}</div>
    </div>
  );
}
