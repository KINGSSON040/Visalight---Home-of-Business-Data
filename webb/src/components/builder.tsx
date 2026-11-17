"use client";

import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import {
  formGroupLabel,
  industryLabel,
  resolveQuery,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  type Selection,
} from "@/lib/catalog";
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
  const hint = waitingForWord ? "Förslagen kommer direkt." : "";
  const fresh = updatedLabel
    ? `Uppdaterat ${updatedLabel}. Äldre årgångar används inte.`
    : "Uppdaterat från senaste registret. Äldre årgångar används inte.";

  return (
    <div id="urval" className="builder-card rounded-[1.35rem] px-3 py-2.5 text-ink sm:px-4">
      <h2 className="text-base tracking-tight sm:text-lg">Skapa ert utdrag</h2>
      <p className="mt-0.5 truncate text-[0.7rem] leading-4 text-muted">{fresh}</p>
      <ResultHero draft={draft} urval={urval} loading={loading} onChange={onChange} />
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
                  label={"E\u2011postkontakt"}
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
        />
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

function ResultHero({
  draft,
  urval,
  loading,
  onChange,
}: {
  draft: Selection;
  urval: UrvalResult;
  loading: boolean;
  onChange: (patch: Partial<Selection>) => void;
}) {
  const ready = urval.status === "ready";
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const href = `/kassa?${selectionToQuery(draft)}`;
  const chips = chosenChips(draft);
  const figure = ready ? urval.companies.toLocaleString("sv-SE") : loading ? "…" : "–";
  const lines = [
    { label: "Grunduppgifter", count: counts.companies, unit: BASE_ORE, on: true },
    { label: "Kontaktnummer", count: counts.phones, unit: PHONE_ORE, on: draft.phones },
    { label: "E-postkontakt", count: counts.emails, unit: EMAIL_ORE, on: draft.emails },
    { label: "Beslutsfattare", count: counts.signatoryPhones, unit: SIGNATORY_ORE, on: draft.signatory },
  ];

  return (
    <div className="mt-2 rounded-2xl bg-foam px-3 py-2">
      <div aria-live="polite" aria-busy={loading}>
        <p className="flex items-baseline gap-2">
          <span
            data-urval-count={ready ? String(urval.companies) : ""}
            className={`text-[2.75rem] leading-none font-semibold tracking-tight tabular-nums sm:text-5xl ${loading && ready ? "opacity-70" : ""}`}
          >
            {figure}
          </span>
          <span className="text-lg leading-none font-medium">bolag</span>
        </p>
        <p className="mt-1 text-xs font-medium text-muted">{loading && !ready ? "Räknar bolag." : "i ert urval"}</p>
      </div>
      {ready && urval.source === "example" ? <p className="mt-1 text-[0.68rem] leading-4 text-muted">{urval.note}</p> : null}
      {ready && urval.source === "register" && urval.companies === 0 ? (
        <p className="mt-1 text-[0.68rem] leading-4 text-muted">{urval.note}</p>
      ) : null}
      {chips.length > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {chips.map((chip) => (
            <li key={chip.key} className="max-w-full">
              <button
                type="button"
                onClick={() => onChange(chip.clear)}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[0.68rem] leading-4 font-medium text-ink ring-1 ring-inset ring-line"
              >
                <span className="truncate">{chip.text}</span>
                <span aria-hidden="true" className="text-muted">
                  ×
                </span>
                <span className="sr-only">Ta bort {chip.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {ready ? (
        <div className="mt-2 border-t border-sea/15 pt-1.5">
          <p className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-muted">Totalt, exkl. moms</span>
            <span className="text-xl leading-none font-semibold tracking-tight tabular-nums sm:text-2xl">
              {formatKronor(price.totalOre)} kr
            </span>
          </p>
          <ul className="mt-1 space-y-0.5">
            {lines.map((line) => {
              const sum = line.on ? line.count * line.unit : 0;
              return (
                <li key={line.label} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-2 text-[0.68rem] leading-4">
                  <span className="truncate">{line.label}</span>
                  <span className="text-muted tabular-nums whitespace-nowrap">
                    {line.on ? `${line.count.toLocaleString("sv-SE")} × ${formatKronor(line.unit)} kr` : "inte med"}
                  </span>
                  <span className="text-right tabular-nums whitespace-nowrap">{formatKronor(sum)} kr</span>
                </li>
              );
            })}
          </ul>
          {counts.companies > 0 && price.minimumApplied ? (
            <p className="mt-1 text-[0.65rem] leading-4 text-muted">
              Lägsta order {formatKronor(MINIMUM_ORE)} kr. Beräknat {formatKronor(price.rawOre)} kr.
            </p>
          ) : null}
          {counts.companies > 0 ? (
            <Link
              href={href}
              className="btn-fade-sea mt-1.5 flex h-8 items-center justify-center rounded-full text-sm font-medium text-white"
            >
              Förhandsboka
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-1 text-[0.68rem] leading-4 text-muted">Välj bransch eller ort så visas antal och pris.</p>
      )}
    </div>
  );
}

function chosenChips(draft: Selection): { key: string; text: string; clear: Partial<Selection> }[] {
  const active = selectionForCount(draft);
  if (!active) return [];
  const resolved = resolveQuery(draft.query);
  const chips: { key: string; text: string; clear: Partial<Selection> }[] = [];
  if (active.city.trim()) {
    chips.push({
      key: "ort",
      text: `Ort: ${active.city.trim()}`,
      clear: { city: "", ...(resolved?.city ? { query: "" } : {}) },
    });
  }
  const bransch = (active.bransch ?? "").trim();
  if (bransch || active.sni) {
    chips.push({
      key: "bransch",
      text: `Bransch: ${bransch || industryLabel(active.sni)}`,
      clear: { bransch: "", sni: "", ...(resolved?.bransch || resolved?.sni ? { query: "" } : {}) },
    });
  }
  if ((active.county ?? "").trim()) {
    chips.push({
      key: "lan",
      text: `Län: ${active.county.trim()}`,
      clear: { county: "", ...(resolved?.county ? { query: "" } : {}) },
    });
  }
  if ((active.employees ?? "").trim()) {
    chips.push({
      key: "anst",
      text: `Anställda: ${active.employees.trim()}`,
      clear: { employees: "", ...(resolved?.employees ? { query: "" } : {}) },
    });
  }
  if (active.forms.length > 0) {
    chips.push({
      key: "form",
      text: `Bolagsform: ${formGroupLabel(active.forms)}`,
      clear: { forms: [], ...(resolved?.form ? { query: "" } : {}) },
    });
  }
  return chips;
}
