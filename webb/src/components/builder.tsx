"use client";

import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import { selectionToQuery, suggestBranscher, type Selection } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";

export function ListBuilder({
  draft,
  onChange,
  onSearch,
  dirty,
  urval,
  loading,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  onSearch: () => void;
  dirty: boolean;
  urval: UrvalResult;
  loading: boolean;
}) {
  const hint = dirty
    ? "Filtren är ändrade. Tryck Sök bolag för att räkna om antal och pris."
    : loading
      ? "Räknar bolag i registret."
      : urval.note;

  return (
    <div id="urval" className="rounded-[1.75rem] border border-line bg-white px-5 py-5 text-ink shadow-[0_24px_60px_-32px_rgba(16,42,54,0.45)] sm:px-6">
      <div>
        <h2 className="text-2xl tracking-tight">Skapa företagslista</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Skriv en bransch, till exempel frisör, restaurang eller revisionsbyrå. Förslagen är branscher, inte bolag.
        </p>
      </div>

      <div className="mt-4">
        <CompanySearch
          draft={draft}
          onChange={onChange}
          onSearch={onSearch}
          onClear={() => onChange({ query: "", city: "", bransch: "", sni: "", forms: [] })}
          queryPlaceholder="Branschnamn eller SNI-kod"
          querySuggestions={suggestBranscher}
          hint={hint}
        >
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Tillval</legend>
            <p className="mt-1 text-sm leading-6 text-muted">
              Grunduppgifter ingår alltid, {formatKronor(BASE_ORE)} kr per komplett rad. Kryssa i tillvalen som ska
              med i filen. Tomma fält kostar inget.
            </p>
            <div className="mt-2 grid gap-2">
              <CheckOption
                checked={draft.phones}
                onChange={() => onChange({ phones: !draft.phones })}
                label="Telefon"
                price={`${formatKronor(PHONE_ORE)} kr/nummer`}
              />
              <CheckOption
                checked={draft.emails}
                onChange={() => onChange({ emails: !draft.emails })}
                label="E-post"
                price={`${formatKronor(EMAIL_ORE)} kr/adress`}
              />
              <CheckOption
                checked={draft.signatory}
                onChange={() => onChange({ signatory: !draft.signatory })}
                label="Beslutsfattare"
                price={`${formatKronor(SIGNATORY_ORE)} kr/nummer`}
              />
            </div>
          </fieldset>
          <LivePrice draft={draft} urval={urval} dirty={dirty} loading={loading} />
        </CompanySearch>
      </div>
    </div>
  );
}

function CheckOption({
  checked,
  onChange,
  label,
  price,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  price: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-paper px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 shrink-0 accent-sea"
      />
      <span className="min-w-0 flex-1 font-medium">{label}</span>
      <span className="text-sm text-muted">{price}</span>
    </label>
  );
}

function LivePrice({
  draft,
  urval,
  dirty,
  loading,
}: {
  draft: Selection;
  urval: UrvalResult;
  dirty: boolean;
  loading: boolean;
}) {
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const href = `/kassa?${selectionToQuery(draft)}`;
  const lines = [
    { label: "Grunduppgifter", count: counts.companies, unit: BASE_ORE, on: true },
    { label: "Telefon", count: counts.phones, unit: PHONE_ORE, on: draft.phones },
    { label: "E-post", count: counts.emails, unit: EMAIL_ORE, on: draft.emails },
    { label: "Beslutsfattare", count: counts.signatoryPhones, unit: SIGNATORY_ORE, on: draft.signatory },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-line bg-paper px-3 py-3" aria-live="polite">
      <p className="text-sm font-medium">Antal och pris</p>
      {urval.status === "idle" ? (
        <p className="mt-2 text-sm leading-6 text-muted">{loading ? "Räknar bolag i registret." : urval.note}</p>
      ) : (
        <>
          <p className="mt-2 text-3xl tracking-tight">
            {counts.companies.toLocaleString("sv-SE")}{" "}
            <span className="text-base text-muted">{urval.source === "register" ? "bolag" : "exempelbolag"}</span>
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((line) => {
              const sum = line.on ? line.count * line.unit : 0;
              return (
                <li key={line.label} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block">{line.label}</span>
                    <span className="block text-muted">
                      {line.on
                        ? `${line.count.toLocaleString("sv-SE")} × ${formatKronor(line.unit)} kr`
                        : "Tillvalet är inte ikryssat"}
                    </span>
                  </span>
                  <span>{formatKronor(sum)} kr</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <span className="text-sm font-medium">Att betala</span>
            <span className="text-2xl tracking-tight">{formatKronor(price.totalOre)} kr</span>
          </p>
          {counts.companies > 0 && price.minimumApplied ? (
            <p className="mt-1 text-sm leading-6 text-muted">
              Beräknat {formatKronor(price.rawOre)} kr. Lägsta order är {formatKronor(MINIMUM_ORE)} kr.
            </p>
          ) : null}
          {urval.preview.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              {urval.preview.map((company) => (
                <li key={company.orgNr}>
                  <span className="font-medium">{company.name}</span>
                  <span className="text-muted">
                    {" "}
                    · {company.city} · {company.orgNr}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-sm leading-6 text-muted">{urval.note}</p>
          {counts.companies > 0 ? (
            <Link
              href={href}
              className="mt-3 flex h-11 items-center justify-center rounded-full bg-sea text-sm font-medium text-white"
            >
              Till kassan
            </Link>
          ) : null}
        </>
      )}
      {dirty ? <p className="mt-2 text-sm leading-6 text-muted">Siffrorna gäller senaste sökningen.</p> : null}
    </div>
  );
}
