"use client";

import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import { resolveQuery, selectionForCount, selectionToQuery, suggestSegment, type Selection } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";

export function ListBuilder({
  draft,
  onChange,
  urval,
  loading,
  updatedLabel,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  urval: UrvalResult;
  loading: boolean;
  updatedLabel: string | null;
}) {
  const waitingForWord = draft.query.trim().length > 0 && !resolveQuery(draft.query) && !selectionForCount({ ...draft, query: "" });
  const hint = waitingForWord ? "Förslagen kommer direkt." : loading ? "Räknar bolag i registret." : "";
  const fresh = updatedLabel
    ? `Uppdaterat ${updatedLabel}. Äldre årgångar används inte.`
    : "Uppdaterat från senaste registret. Äldre årgångar används inte.";

  return (
    <div id="urval" className="builder-card rounded-[1.35rem] px-4 py-3 text-ink sm:px-5">
      <h2 className="text-lg tracking-tight">Skapa ert utdrag</h2>
      <p className="mt-0.5 text-xs leading-4 text-muted">{fresh}</p>

      <div className="mt-2">
        <CompanySearch
          draft={draft}
          onChange={onChange}
          onSearch={() => undefined}
          live
          onClear={() => onChange({ query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" })}
          queryPlaceholder="Bransch, ort, län eller storlek"
          querySuggestions={suggestSegment}
          hint={hint}
          beforeForms={
            <fieldset className="mt-1.5">
              <legend className="text-xs font-medium">Tillval</legend>
              <div className="mt-1 grid grid-cols-3 gap-1.5">
                <CheckOption
                  checked={draft.phones}
                  onChange={() => onChange({ phones: !draft.phones })}
                  label="Kontaktnummer"
                  price={`${formatKronor(PHONE_ORE)} kr/nummer`}
                />
                <CheckOption
                  checked={draft.emails}
                  onChange={() => onChange({ emails: !draft.emails })}
                  label="E-postkontakt"
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
          }
        >
          <LivePrice draft={draft} urval={urval} loading={loading} />
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
    <label
      className={`flex min-w-0 cursor-pointer flex-col rounded-xl border px-1.5 py-1 ${
        checked ? "check-on border-transparent" : "border-line bg-white"
      }`}
    >
      <span className="flex items-center gap-1">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-3.5 w-3.5 shrink-0 accent-sea" />
        <span className="min-w-0 text-[0.7rem] font-medium leading-4">{label}</span>
      </span>
      <span className="mt-0.5 pl-[1.15rem] text-[0.65rem] leading-3 font-medium text-green">{price}</span>
    </label>
  );
}

function LivePrice({
  draft,
  urval,
  loading,
}: {
  draft: Selection;
  urval: UrvalResult;
  loading: boolean;
}) {
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const href = `/kassa?${selectionToQuery(draft)}`;
  const lines = [
    { label: "Grunduppgifter", count: counts.companies, unit: BASE_ORE, on: true },
    { label: "Kontaktnummer", count: counts.phones, unit: PHONE_ORE, on: draft.phones },
    { label: "E-postkontakt", count: counts.emails, unit: EMAIL_ORE, on: draft.emails },
    { label: "Beslutsfattare", count: counts.signatoryPhones, unit: SIGNATORY_ORE, on: draft.signatory },
  ];

  if (urval.status === "idle") {
    return (
      <p className="mt-1.5 text-xs leading-4 text-muted" aria-live="polite">
        {loading ? "Räknar bolag i registret." : "Välj bransch eller ort så visas antal och pris."}
      </p>
    );
  }

  return (
    <div className="mt-1.5 rounded-xl border border-line bg-white px-2.5 py-1.5" aria-live="polite">
      <ul className="space-y-0.5">
        {lines.map((line) => {
          const sum = line.on ? line.count * line.unit : 0;
          return (
            <li key={line.label} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-2 text-xs leading-4">
              <span className="truncate">{line.label}</span>
              <span className="whitespace-nowrap text-muted tabular-nums">
                {line.on ? `${line.count.toLocaleString("sv-SE")} × ${formatKronor(line.unit)} kr` : "inte med"}
              </span>
              <span className="whitespace-nowrap text-right tabular-nums">{formatKronor(sum)} kr</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 flex items-center justify-between gap-2 border-t border-line pt-1">
        <span className="text-xs font-medium">Att betala, exkl. moms</span>
        <span className="btn-fade-green rounded-lg px-2 py-0.5 text-sm font-medium tracking-tight text-white tabular-nums">
          {formatKronor(price.totalOre)} kr
        </span>
      </p>
      {counts.companies > 0 && price.minimumApplied ? (
        <p className="mt-1 text-[0.68rem] leading-4 text-muted">
          Lägsta order {formatKronor(MINIMUM_ORE)} kr. Beräknat {formatKronor(price.rawOre)} kr.
        </p>
      ) : null}
      {counts.companies > 0 ? (
        <Link
          href={href}
          className="btn-fade-sea mt-1.5 flex h-8 items-center justify-center rounded-full text-sm font-medium text-white"
        >
          Till kassan
        </Link>
      ) : null}
    </div>
  );
}
