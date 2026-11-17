"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { CrmCard, StarButton } from "@/components/crm-card";
import {
  COMPANIES,
  defaultSelection,
  filterCompanies,
  legalFormLabel,
  sameSearch,
  selectionFromQuery,
  selectionToQuery,
  type Selection,
} from "@/lib/catalog";
import { formatStamp, outcomeLabel, useCrmStore, type Segment } from "@/lib/crm-store";

const blankSearch: Selection = {
  ...defaultSelection,
  phones: false,
  emails: false,
  signatory: false,
};

export function CrmDesk() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Hämtar CRM:et.</p>}>
      <Desk />
    </Suspense>
  );
}

function Desk() {
  const params = useSearchParams();
  const router = useRouter();
  const view = params.get("vy");
  const store = useCrmStore();
  const [draft, setDraft] = useState<Selection>(blankSearch);
  const [applied, setApplied] = useState<Selection>(blankSearch);
  const [searched, setSearched] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [segmentError, setSegmentError] = useState("");

  useEffect(() => {
    const selection = selectionFromQuery(params);
    const has =
      selection.query ||
      selection.city ||
      selection.county ||
      selection.bransch ||
      selection.sni ||
      selection.forms.length ||
      selection.employees;
    if (!has) return;
    setDraft(selection);
    setApplied(selection);
    setSearched(true);
  }, [params]);

  const rows = useMemo(() => (searched ? filterCompanies(applied) : []), [searched, applied]);
  const dirty = searched && !sameSearch(draft, applied);
  const myCompanies = store.claims.flatMap((claim) => {
    if (claim.userId !== store.userId) return [];
    const company = COMPANIES.find((item) => item.orgNr === claim.orgNr);
    return company ? [{ claim, company }] : [];
  });

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function runSearch(next: Selection = draft) {
    setDraft(next);
    setApplied(next);
    setSearched(true);
  }

  function saveSegment() {
    const name = segmentName.trim();
    if (name.length < 2) {
      setSegmentError("Döp segmentet med minst två tecken.");
      return;
    }
    setSegmentError("");
    const source = draft;
    store.setSegments((current) => [
      {
        id: crypto.randomUUID(),
        name,
        query: source.query,
        city: source.city,
        county: source.county ?? "",
        bransch: source.bransch ?? "",
        sni: source.sni,
        forms: source.forms,
        employees: source.employees ?? "",
      },
      ...current,
    ]);
    setSegmentName("");
    runSearch(source);
  }

  const hint = !searched
    ? "Gör valen och tryck Sök bolag. Förslagen kommer från exempelregistret."
    : dirty
      ? "Filtren är ändrade. Tryck Sök bolag för att uppdatera listan."
      : `${rows.length.toLocaleString("sv-SE")} exempelbolag i urvalet.`;

  if (view === "mina") {
    const chosen = params.get("bolag");
    const selected = myCompanies.find((item) => item.company.orgNr === chosen) ?? myCompanies[0];
    return (
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 rounded-3xl border border-line bg-white p-4 sm:p-5">
          {selected ? (
            <CrmCard company={selected.company} embedded />
          ) : (
            <div>
              <h1 className="text-3xl tracking-tight">Kundkort</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Inga stjärnor ännu. Sök fram ett bolag och tryck på stjärnan, så öppnas kortet här.
              </p>
            </div>
          )}
        </section>
        <aside className="lg:sticky lg:top-4">
          <h1 className="text-xl tracking-tight">Mina företag</h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            Bolag du stjärnmärkt. Välj ett, så visas kortet i mitten.
          </p>
          {myCompanies.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-line bg-white px-3 py-6 text-sm leading-6 text-muted">
              Listan är tom.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {myCompanies.map(({ claim, company }) => (
                <li key={company.orgNr}>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(params.toString());
                      next.set("vy", "mina");
                      next.set("bolag", company.orgNr);
                      router.replace(`/crm?${next.toString()}`);
                    }}
                    className={`block w-full px-3 py-3 text-left ${
                      selected?.company.orgNr === company.orgNr ? "bg-foam" : "bg-white"
                    }`}
                  >
                    <span className="block font-medium">{company.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {company.orgNr} · {company.city}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">Sedan {formatStamp(claim.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    );
  }

  if (view === "segment") {
    return (
      <section className="rounded-3xl border border-line bg-white p-4 sm:p-5">
        <h1 className="text-3xl tracking-tight">Segment</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Ett segment är ett sparat urval. Öppna det för att se bolagen, eller ring igenom dem ett kort i taget.
        </p>
        {store.segments.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Inga sparade segment ännu. Sök bolag och spara filtret.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {store.segments.map((segment) => (
              <li key={segment.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
                <Link href={`/crm?${selectionToQuery(segmentSelection(segment))}`} className="text-left">
                  <span className="block font-medium">{segment.name}</span>
                  <span className="text-sm text-muted">{segmentSummary(segment)}</span>
                </Link>
                <span className="flex items-center gap-3">
                  <Link href={`/crm/ring?segment=${segment.id}`} className="text-sm font-medium text-sea">
                    Ring
                  </Link>
                  <button
                    type="button"
                    className="text-sm text-muted"
                    onClick={() => store.setSegments((current) => current.filter((item) => item.id !== segment.id))}
                  >
                    Ta bort
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (view === "aktivitet") {
    const newest = [...store.activities].sort((a, b) => b.at.localeCompare(a.at));
    return (
      <section className="rounded-3xl border border-line bg-white p-4 sm:p-5">
        <h1 className="text-3xl tracking-tight">Aktivitet</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Nyast först. Öppna bolaget för att fortsätta.</p>
        {newest.length === 0 ? <p className="mt-4 text-sm text-muted">Ingen aktivitet ännu.</p> : null}
        <ol className="mt-4 space-y-3">
          {newest.map((entry) => (
            <li key={entry.id}>
              <Link href={`/crm/bolag/${encodeURIComponent(entry.orgNr)}`} className="block rounded-2xl border border-line px-3 py-3">
                <span className="block text-sm text-muted">{formatStamp(entry.at)} · {entry.userName}</span>
                <span className="mt-1 block font-medium">
                  {entry.companyName} · {outcomeLabel(entry.outcome)}
                </span>
                {entry.note ? <span className="mt-1 block text-sm leading-6">{entry.note}</span> : null}
                {entry.nextAt ? (
                  <span className="mt-1 block text-sm text-sea">Nästa {formatStamp(entry.nextAt)}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="sok">
      <h1 className="text-3xl tracking-tight">Sök bolag</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Sök på bransch, namn eller organisationsnummer. Stjärnan markerar bolaget som ditt. Tryck på raden för att öppna
        kundkortet.
      </p>
      <div className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
        <CompanySearch
          draft={draft}
          onChange={patch}
          onSearch={() => runSearch()}
          onClear={() => patch({ query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" })}
          hint={hint}
        />
        <form
          className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            saveSegment();
          }}
        >
          <label className="block flex-1 text-sm">
            <span className="mb-1.5 block font-medium">Spara urvalet som segment</span>
            <input
              value={segmentName}
              onChange={(event) => setSegmentName(event.target.value)}
              placeholder="Till exempel restauranger i Malmö"
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
            />
          </label>
          <button type="submit" className="h-12 rounded-full bg-sea px-4 text-sm font-medium text-white">
            Spara segment
          </button>
        </form>
        {segmentError ? <p className="mt-2 text-sm text-rust">{segmentError}</p> : null}
      </div>

      <div className="mt-4">
        {!searched ? (
          <p className="rounded-3xl border border-dashed border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
            Inget urval ännu. Fyll i fälten och tryck Sök bolag.
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-3xl border border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
            Inget exempelbolag matchar. Prova ett förslag under fältet, eller rensa ett filter.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
            {rows.map((company) => (
              <CompanyRow key={company.orgNr} company={company} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CompanyRow({
  company,
  since,
}: {
  company: (typeof COMPANIES)[number];
  since?: string;
}) {
  const store = useCrmStore();
  const claim = store.claims.find((item) => item.orgNr === company.orgNr);
  const taken = Boolean(claim && claim.userId !== store.userId);
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <StarButton
        filled={Boolean(claim)}
        disabled={taken}
        label={taken && claim ? `Bearbetas av ${claim.userName}` : claim ? "Ta bort stjärnan" : "Markera som mitt"}
        onClick={() => store.toggleStar(company.orgNr)}
      />
      <Link href={`/crm/bolag/${encodeURIComponent(company.orgNr)}`} className="min-w-0 flex-1 py-1">
        <span className="block font-medium">{company.name}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {company.orgNr} · {company.city} · {company.industry}
          {since ? ` · stjärna ${formatStamp(since)}` : ""}
          {taken && claim ? ` · ${claim.userName}` : ""}
        </span>
      </Link>
      <span className="hidden shrink-0 rounded-full bg-paper px-2 py-0.5 text-xs sm:inline">{legalFormLabel(company.form)}</span>
    </li>
  );
}

function segmentSelection(segment: Segment): Selection {
  return {
    ...blankSearch,
    query: segment.query,
    city: segment.city,
    county: segment.county,
    bransch: segment.bransch,
    sni: segment.sni,
    forms: segment.forms,
    employees: segment.employees,
  };
}

function segmentSummary(segment: Segment): string {
  const forms = segment.forms.map(legalFormLabel);
  return [
    segment.city || segment.county || "Alla områden",
    segment.bransch || "Alla branscher",
    forms.join(", ") || "Alla bolagsformer",
    segment.employees ? `${segment.employees} anställda` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
