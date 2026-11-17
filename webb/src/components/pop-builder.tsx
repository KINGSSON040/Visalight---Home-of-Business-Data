"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Confetti, SlotNumber } from "@/components/pop-motion";
import {
  COUNTIES,
  EMPLOYEE_BANDS,
  FORM_GROUPS,
  SUGGESTION_KIND_LABEL,
  describeSelection,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  type Selection,
  type Suggestion,
} from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { priceForUrval, type UrvalResult } from "@/lib/urval";

const QUICK_TRADES = [
  { label: "Restaurang", bransch: "Restaurangverksamhet", sni: "56110" },
  { label: "Frisör", bransch: "Frisörer och barberare", sni: "96210" },
  { label: "Bygg", bransch: "Byggande av hus", sni: "41200" },
  { label: "Redovisning", bransch: "Redovisning och bokföring", sni: "69201" },
  { label: "IT-konsult", bransch: "Datakonsulter", sni: "62010" },
];

const QUICK_PLACES = ["Stockholm", "Göteborg", "Malmö", "Uppsala"];

const CUSTOMER_KINDS = new Set<Suggestion["kind"]>(["bransch", "ort", "lan"]);

const EMPTY_FILTERS: Partial<Selection> = { query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" };

export function PopBuilder({
  draft,
  onChange,
  urval,
  loading,
  registerTotal,
  registerReal,
  updatedLabel,
  exampleData,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  urval: UrvalResult;
  loading: boolean;
  registerTotal: number;
  registerReal: boolean;
  updatedLabel: string;
  exampleData: boolean;
}) {
  const counted = selectionForCount(draft);
  const filtered = counted !== null && urval.status === "ready";
  const count = filtered ? urval.companies : registerTotal;
  const quote = priceForUrval(urval, draft);
  const priceOre = filtered ? quote.totalOre : registerTotal * BASE_ORE;
  const spec = counted ? describeSelection(counted) : "Hela Sverige · Alla branscher · Alla bolagsformer";
  const [more, setMore] = useState(Boolean(draft.county || draft.employees || draft.forms.length));
  const [burst, setBurst] = useState(0);
  const [bounce, setBounce] = useState(0);
  const previous = useRef(count);

  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    setBounce((value) => value + 1);
    if (filtered && count > 0) setBurst((value) => value + 1);
  }, [count, filtered]);

  const tillval = [
    { key: "phones", label: "Telefon", price: PHONE_ORE, unit: "per nummer", on: draft.phones, toggle: { phones: !draft.phones } },
    { key: "emails", label: "E-post", price: EMAIL_ORE, unit: "per adress", on: draft.emails, toggle: { emails: !draft.emails } },
    { key: "signatory", label: "Beslutsfattare", price: SIGNATORY_ORE, unit: "per nummer", on: draft.signatory, toggle: { signatory: !draft.signatory } },
  ];

  return (
    <div id="urval" className="machine relative p-2.5 sm:p-3">
      <div className="flex items-center justify-between gap-3 px-2 pb-2">
        <h2 className="text-xl leading-none text-white sm:text-2xl">Listbyggaren</h2>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="machine-bulb bg-[var(--pop-sun)]" />
          <span className="machine-bulb bg-[var(--pop-lime)]" />
          <span className="machine-bulb bg-[var(--pop-coral)]" />
          <span className="machine-bulb bg-white" />
        </span>
      </div>

      <div className="machine-window relative px-4 pt-3 pb-3 sm:px-5" aria-live="polite" aria-busy={loading}>
        <Confetti burst={burst} />
        <p className="text-[0.7rem] font-extrabold tracking-[0.18em] text-[var(--pop-sun)] uppercase">
          {filtered ? "Bolag i ert utdrag" : "Företag i hela registret"}
          {!filtered && !registerReal ? " · exempelvärde" : ""}
        </p>
        <p className="mt-1 flex flex-wrap items-end gap-x-3">
          <span key={bounce} className={`font-display text-[2.7rem] min-[400px]:text-[3.2rem] leading-none text-[var(--pop-lime)] tabular-nums sm:text-[4.4rem] ${bounce ? "pop-bounce" : ""} ${loading ? "opacity-70" : ""}`}>
            <SlotNumber value={count} />
          </span>
          <span className="pb-1.5 text-lg font-extrabold text-white sm:text-xl">bolag</span>
        </p>
        <p className="mt-1.5 truncate text-sm font-semibold text-[#f5cfe4]" data-spec>
          {spec}
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-white">
          <span className="text-2xl font-extrabold tabular-nums sm:text-[1.7rem]" data-price>
            {formatKronor(priceOre)} kr
          </span>
          <span className="text-xs font-semibold text-[#f5cfe4]">
            {filtered
              ? quote.minimumApplied
                ? `exkl. moms · lägsta order ${formatKronor(MINIMUM_ORE)} kr`
                : "exkl. moms · med valda tillval"
              : "exkl. moms · grunduppgifter, välj filter för exakt pris"}
          </span>
        </p>
        {filtered && urval.source === "example" ? (
          <p className="mt-1 text-[0.68rem] leading-4 text-[#f5cfe4]">{urval.note}</p>
        ) : null}
      </div>

      <div className="machine-panel mt-2.5 px-3 py-3 sm:px-4">
        <Step n={1} title="Vilken bransch?">
          <SuggestBox
            value={draft.query}
            onValue={(query) => onChange({ query })}
            onPick={(suggestion) => onChange(suggestion.apply)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_TRADES.map((trade) => {
              const pressed = draft.sni === trade.sni;
              return (
                <button
                  key={trade.sni}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onChange(pressed ? { bransch: "", sni: "", query: "" } : { bransch: trade.bransch, sni: trade.sni, query: "" })}
                  className="chip-pop px-3 py-1 text-sm"
                >
                  {trade.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={2} title="Var?">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={!draft.city && !draft.county}
              onClick={() => onChange({ city: "", county: "" })}
              className="chip-pop px-3 py-1 text-sm"
            >
              Hela Sverige
            </button>
            {QUICK_PLACES.map((city) => {
              const pressed = draft.city === city;
              return (
                <button key={city} type="button" aria-pressed={pressed} onClick={() => onChange({ city: pressed ? "" : city })} className="chip-pop px-3 py-1 text-sm">
                  {city}
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={3} title="Vad ska med?">
          <div className="grid grid-cols-3 gap-2">
            {tillval.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={item.on}
                onClick={() => onChange(item.toggle)}
                className="tap-card flex min-w-0 flex-col items-start px-2.5 py-2 text-left"
              >
                <span className="flex w-full items-center justify-between gap-1">
                  <span className="truncate text-sm font-extrabold sm:text-base">{item.label}</span>
                  <span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[var(--pop-ink)] text-xs font-black ${item.on ? "bg-[var(--pop-ink)] text-[var(--pop-lime)]" : "bg-white"}`}>
                    {item.on ? "✓" : ""}
                  </span>
                </span>
                <span className="text-xs font-semibold text-muted">
                  {formatKronor(item.price)} kr {item.unit}
                </span>
              </button>
            ))}
          </div>
        </Step>

        <div className="mt-2">
          <button type="button" aria-expanded={more} onClick={() => setMore((value) => !value)} className="text-sm font-extrabold underline decoration-[var(--pop-magenta)] decoration-[3px] underline-offset-4">
            {more ? "Färre filter" : "Fler filter: län, bolagsform, storlek"}
          </button>
          {more ? (
            <div className="mt-2 grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
              <PopSelect label="Län" value={draft.county} onChange={(county) => onChange({ county })}>
                <option value="">Alla län</option>
                {COUNTIES.map((item) => (
                  <option key={item.code} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </PopSelect>
              <PopSelect
                label="Bolagsform"
                value={FORM_GROUPS.find((group) => group.codes.length > 0 && group.codes.every((code) => draft.forms.includes(code)) && draft.forms.length === group.codes.length)?.label ?? ""}
                onChange={(label) => onChange({ forms: FORM_GROUPS.find((group) => group.label === label)?.codes ?? [] })}
              >
                <option value="">Alla bolagsformer</option>
                {FORM_GROUPS.map((group) => (
                  <option key={group.label} value={group.label}>
                    {group.label}
                  </option>
                ))}
              </PopSelect>
              <PopSelect label="Anställda" value={draft.employees} onChange={(employees) => onChange({ employees })}>
                <option value="">Alla storlekar</option>
                {EMPLOYEE_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </PopSelect>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {filtered && count > 0 ? (
            <Link href={`/kassa?${selectionToQuery(draft)}`} className="pop-btn pop-btn--sun h-12 flex-1 px-5 text-base sm:text-lg" data-cta="forhandsboka">
              Förhandsboka utdraget <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>("#urval input[role=combobox]")?.focus()}
              className="pop-btn pop-btn--sun h-12 flex-1 px-5 text-base sm:text-lg"
            >
              Välj bransch eller ort <span aria-hidden="true">↑</span>
            </button>
          )}
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="pop-btn pop-btn--white h-12 px-4 text-sm">
            Rensa
          </button>
        </div>
      </div>
      <p className="mt-2 px-2 text-xs font-bold text-white" data-register-stamp>
        Registret senast uppdaterat: {updatedLabel}
        {exampleData ? " (exempeldata)" : ""}
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-2.5 first:mt-0">
      <legend className="mb-1.5 flex items-center gap-2 text-base font-extrabold">
        <span className="font-display grid h-7 w-7 place-items-center rounded-full border-[2.5px] border-[var(--pop-ink)] bg-[var(--pop-magenta)] text-sm text-white">
          {n}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function PopSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 text-xs font-extrabold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-0.5 h-10 w-full min-w-0 rounded-xl border-[2.5px] border-[var(--pop-ink)] bg-white px-2 text-sm font-semibold"
      >
        {children}
      </select>
    </label>
  );
}

/** Sökrutan. Förslagen är bara branscher, SNI, orter och län, aldrig enskilda företag. */
function SuggestBox({
  value,
  onValue,
  onPick,
}: {
  value: string;
  onValue: (value: string) => void;
  onPick: (suggestion: Suggestion) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const suggestions = suggestSegment(value).filter((item) => CUSTOMER_KINDS.has(item.kind));
  const visible = open ? suggestions : [];

  useEffect(() => {
    setActive(0);
  }, [value]);

  function pick(suggestion: Suggestion) {
    onPick(suggestion);
    setOpen(false);
  }

  return (
    <div className={`relative ${open ? "z-30" : ""}`}>
      <label htmlFor={id} className="sr-only">
        Sök bransch, SNI-kod, ort eller län
      </label>
      <input
        id={id}
        value={value}
        role="combobox"
        aria-expanded={visible.length > 0}
        aria-controls={listId}
        aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        placeholder="Skriv till exempel frisör, 56110 eller Skåne"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          onValue(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((current) => Math.min(suggestions.length - 1, current + 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => Math.max(0, current - 1));
          } else if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "Enter" && open && suggestions[active]) {
            event.preventDefault();
            pick(suggestions[active]);
          }
        }}
        className="h-12 w-full rounded-2xl border-[3px] border-[var(--pop-ink)] bg-white px-4 text-base font-semibold placeholder:font-medium placeholder:text-[#8a6a80] focus:bg-[#fffbe0]"
      />
      {visible.length > 0 ? (
        <ul id={listId} role="listbox" aria-label="Förslag" className="absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border-[3px] border-[var(--pop-ink)] bg-white shadow-[5px_5px_0_var(--pop-ink)]">
          {visible.map((suggestion, index) => {
            const showKind = index === 0 || visible[index - 1].kind !== suggestion.kind;
            return (
              <li key={suggestion.id} role="presentation">
                {showKind ? (
                  <p className="px-3 pt-2 text-[0.68rem] font-extrabold tracking-[0.14em] text-[var(--pop-magenta-deep)] uppercase">
                    {SUGGESTION_KIND_LABEL[suggestion.kind]}
                  </p>
                ) : null}
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  data-suggestion={suggestion.title}
                  onPointerDown={(event) => event.preventDefault()}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(suggestion)}
                  className={`flex w-full flex-col px-3 py-2 text-left ${index === active ? "bg-[var(--pop-sun)]" : "bg-white hover:bg-[#fff2a6]"}`}
                >
                  <span className="font-bold">{suggestion.title}</span>
                  <span className="text-xs text-muted">{suggestion.detail}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
