"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useTicker } from "@/components/count-up";
import {
  EMPLOYEE_BANDS,
  FORM_GROUPS,
  SUGGESTION_KIND_LABEL,
  describeSelection,
  industryLabel,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  type Selection,
  type Suggestion,
} from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";

const QUICK_BRANSCH = [
  { label: "Restaurang", bransch: "Restaurangverksamhet", sni: "56110" },
  { label: "Frisör", bransch: "Frisörer och barberare", sni: "96210" },
  { label: "Bygg", bransch: "Byggande av hus", sni: "41200" },
  { label: "Redovisning", bransch: "Redovisning och bokföring", sni: "69201" },
];

const QUICK_PLACES = ["Stockholm", "Göteborg", "Malmö"];

const TRADE_KINDS = new Set<Suggestion["kind"]>(["bransch"]);
const PLACE_KINDS = new Set<Suggestion["kind"]>(["ort", "lan"]);

const EMPTY: Partial<Selection> = { query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" };

function sniCode(sni: string): string {
  const digits = sni.replace(/\D/g, "");
  return digits.length === 5 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : digits;
}

export function ListBuilder({
  draft,
  onChange,
  urval,
  loading,
  updatedLabel,
  exampleData = false,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  /** Alltid ett färdigt tal. Utan filter är det hela registret. */
  urval: UrvalResult;
  loading: boolean;
  updatedLabel: string;
  exampleData?: boolean;
}) {
  const tradeRef = useRef<HTMLInputElement>(null);
  const active = selectionForCount(draft);
  const [place, setPlace] = useState("");
  const [more, setMore] = useState(Boolean(draft.employees || draft.forms.length));
  const extra = [draft.employees, draft.forms.length ? "form" : ""].filter(Boolean).length;
  const tradeChip =
    draft.sni || draft.bransch.trim() ? (
      <Brick
        label={`${draft.sni ? `${sniCode(draft.sni)} ` : ""}${draft.bransch.trim() || industryLabel(draft.sni)}`}
        onRemove={() => onChange({ bransch: "", sni: "", query: "" })}
      />
    ) : null;
  const placeChips = [
    active?.city ? <Brick key="ort" label={active.city} onRemove={() => onChange({ city: "" })} /> : null,
    active?.county ? <Brick key="lan" label={active.county} onRemove={() => onChange({ county: "" })} /> : null,
  ].filter(Boolean);

  return (
    <div id="urval" className="builder-card text-ink">
      <div className="px-4 pt-4 sm:px-5 short:pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow text-sea">Listbyggaren</p>
          <p className="font-hand -rotate-2 text-xl leading-none text-sea">tar tio sekunder!</p>
        </div>

        <Step n="01" title="Bransch">
          <ChipField
            inputRef={tradeRef}
            label="Bransch eller SNI-kod"
            value={draft.query}
            placeholder={tradeChip ? "Byt bransch…" : "Frisör, bygg eller SNI-kod"}
            chips={tradeChip}
            kinds={TRADE_KINDS}
            onValue={(query) => onChange({ query })}
            onPick={(apply) => onChange({ bransch: apply.bransch ?? "", sni: apply.sni ?? "", query: "" })}
          />
          <QuickRow>
            {QUICK_BRANSCH.map((item) => {
              const on = active?.sni === item.sni;
              return (
                <button
                  key={item.sni}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? { bransch: "", sni: "", query: "" } : { bransch: item.bransch, sni: item.sni, query: "" })}
                  className="pick px-2.5 py-0.5 text-[0.8rem]"
                >
                  {item.label}
                </button>
              );
            })}
          </QuickRow>
        </Step>

        <Step n="02" title="Region">
          <ChipField
            label="Ort eller län"
            value={place}
            placeholder={placeChips.length ? "Lägg till län…" : "Hela Sverige. Skriv ort eller län"}
            chips={placeChips}
            kinds={PLACE_KINDS}
            onValue={setPlace}
            onPick={(apply) => {
              setPlace("");
              if (apply.city) onChange({ city: apply.city });
              if (apply.county) onChange({ county: apply.county });
            }}
          />
          <QuickRow>
            <button
              type="button"
              aria-pressed={!active?.city && !active?.county}
              onClick={() => onChange({ city: "", county: "" })}
              className="pick px-2.5 py-0.5 text-[0.8rem]"
            >
              Hela Sverige
            </button>
            {QUICK_PLACES.map((city) => {
              const on = active?.city === city;
              return (
                <button key={city} type="button" aria-pressed={on} onClick={() => onChange({ city: on ? "" : city })} className="pick px-2.5 py-0.5 text-[0.8rem]">
                  {city}
                </button>
              );
            })}
          </QuickRow>
        </Step>

        <Step n="03" title="Kontaktuppgifter">
          <div className="flex flex-wrap gap-1.5">
            <Addon on={draft.phones} onToggle={() => onChange({ phones: !draft.phones })} title="Kontaktnummer" ore={PHONE_ORE} />
            <Addon on={draft.emails} onToggle={() => onChange({ emails: !draft.emails })} title="E-post" ore={EMAIL_ORE} />
            <Addon on={draft.signatory} onToggle={() => onChange({ signatory: !draft.signatory })} title="Beslutsfattare" ore={SIGNATORY_ORE} />
          </div>
        </Step>

        <div className="mt-2 pb-3 short:mt-1.5 short:pb-2">
          <button
            type="button"
            aria-expanded={more}
            onClick={() => setMore((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-bold underline decoration-coral decoration-[3px] underline-offset-4"
          >
            {more ? "Färre filter" : "Fler filter"}
            {extra > 0 ? <span className="rounded-full bg-ink px-1.5 text-xs text-white">{extra}</span> : null}
          </button>
          <span className="ml-2 text-xs font-medium text-muted">Storlek och bolagsform</span>
          {more ? <MoreFilters draft={draft} onChange={onChange} /> : null}
        </div>
      </div>

      <Result
        draft={draft}
        urval={urval}
        loading={loading}
        counted={Boolean(active)}
        onChange={onChange}
        onFocusSearch={() => tradeRef.current?.focus()}
        stamp={`Registret senast uppdaterat: ${updatedLabel}${exampleData ? " (exempeldata)" : ""}`}
      />
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-2.5 short:mt-1.5" aria-label={`Steg ${n}: ${title}`}>
      <h3 className="mb-1 flex items-baseline gap-2 text-lg font-extrabold">
        <span className="font-mono text-xs font-bold text-sea">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function QuickRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>;
}

function Brick({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="brick" data-chip={label}>
      <span className="truncate">{label}</span>
      <button
        type="button"
        onPointerDown={(event) => event.preventDefault()}
        onClick={onRemove}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-white"
        aria-label={`Ta bort ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function Addon({ on, onToggle, title, ore }: { on: boolean; onToggle: () => void; title: string; ore: number }) {
  return (
    <button type="button" aria-pressed={on} onClick={onToggle} className="addon inline-flex min-h-10 items-center gap-1.5 px-3 py-1 text-left">
      <span aria-hidden="true" className="addon-check inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-xs font-black">
        {on ? "✓" : ""}
      </span>
      <span className="text-sm font-extrabold">{title}</span>
      <span className="font-mono text-[0.7rem] font-bold">+{formatKronor(ore)} kr/rad</span>
    </button>
  );
}

function MoreFilters({ draft, onChange }: { draft: Selection; onChange: (patch: Partial<Selection>) => void }) {
  const forms = draft.forms ?? [];
  return (
    <div className="mt-2 grid gap-2 rounded-2xl bg-peach/70 p-2.5">
      <label className="text-xs font-bold">
        Anställda
        <select value={draft.employees ?? ""} onChange={(event) => onChange({ employees: event.target.value })} className="field mt-0.5 h-10 w-full px-2 text-sm font-medium">
          <option value="">Alla storlekar</option>
          {EMPLOYEE_BANDS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-xs font-bold">Bolagsform</legend>
        <div className="mt-1 flex flex-wrap gap-1">
          {FORM_GROUPS.map((group) => {
            const on = group.codes.some((code) => forms.includes(code));
            return (
              <button
                key={group.label}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  onChange({ forms: on ? forms.filter((code) => !group.codes.includes(code)) : [...forms, ...group.codes.filter((code) => !forms.includes(code))] })
                }
                className="pick px-2.5 py-0.5 text-xs"
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function ChipField({
  inputRef,
  label,
  value,
  placeholder,
  chips,
  kinds,
  onValue,
  onPick,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  placeholder: string;
  chips: React.ReactNode;
  kinds: Set<Suggestion["kind"]>;
  onValue: (value: string) => void;
  onPick: (apply: Suggestion["apply"]) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const suggestions = suggestSegment(value).filter((item) => kinds.has(item.kind));
  const visible = open ? suggestions : [];

  useEffect(() => setActive(0), [value]);

  function pick(suggestion: Suggestion) {
    onPick(suggestion.apply);
    setOpen(false);
  }

  return (
    <div className={`relative ${open ? "z-30" : ""}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="field flex min-h-12 flex-wrap items-center gap-1.5 py-1.5 pr-2 pl-3 short:min-h-10 short:py-1">
        <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem] shrink-0" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="var(--ink)" strokeWidth="2.8" />
          <path d="M15.5 15.5 21 21" stroke="var(--ink)" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        {chips}
        <input
          ref={inputRef}
          id={id}
          value={value}
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            onValue(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && suggestions.length) {
              event.preventDefault();
              setOpen(true);
              setActive((current) => Math.min(suggestions.length - 1, current + 1));
            } else if (event.key === "ArrowUp" && suggestions.length) {
              event.preventDefault();
              setActive((current) => Math.max(0, current - 1));
            } else if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "Enter" && open && suggestions[active]) {
              event.preventDefault();
              pick(suggestions[active]);
            }
          }}
          className="h-8 min-w-[8rem] flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-medium placeholder:text-ink/45"
        />
      </div>
      {visible.length > 0 ? (
        <ul id={listId} role="listbox" aria-label={`Förslag: ${label}`} className="absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border-[3px] border-ink bg-white p-1 shadow-[0_6px_0_var(--ink)]">
          {visible.map((suggestion, index) => {
            const showKind = index === 0 || visible[index - 1].kind !== suggestion.kind;
            return (
              <li key={suggestion.id} role="presentation">
                {showKind ? <p className="eyebrow px-2.5 pt-1.5 text-[0.65rem] text-sea">{SUGGESTION_KIND_LABEL[suggestion.kind]}</p> : null}
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  data-suggestion={suggestion.title}
                  aria-selected={index === active}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    pick(suggestion);
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    pick(suggestion);
                  }}
                  onClick={() => pick(suggestion)}
                  className={`flex w-full flex-col rounded-xl px-2.5 py-1.5 text-left ${index === active ? "bg-sun-soft" : "hover:bg-peach/60"}`}
                >
                  <span className="font-bold">{suggestion.title}</span>
                  <span className="text-xs text-muted">{suggestion.detail}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {open && value.trim() && suggestions.length === 0 ? (
        <p className="absolute z-40 mt-1.5 w-full rounded-2xl border-[3px] border-ink bg-white px-3 py-2 text-sm text-muted">
          Inget förslag matchar. Prova en bransch, en ort eller ett län.
        </p>
      ) : null}
    </div>
  );
}

function Result({
  draft,
  urval,
  loading,
  counted,
  onChange,
  onFocusSearch,
  stamp,
}: {
  draft: Selection;
  urval: UrvalResult;
  loading: boolean;
  counted: boolean;
  onChange: (patch: Partial<Selection>) => void;
  onFocusSearch: () => void;
  stamp: string;
}) {
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const figure = useTicker(urval.companies);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    setPop(true);
    const timer = window.setTimeout(() => setPop(false), 520);
    return () => window.clearTimeout(timer);
  }, [urval.companies]);
  const parts = [
    { label: "Grund", ore: counts.companies * BASE_ORE },
    { label: "Telefon", ore: counts.phones * PHONE_ORE },
    { label: "E-post", ore: counts.emails * EMAIL_ORE },
    { label: "Beslutsfattare", ore: counts.signatoryPhones * SIGNATORY_ORE },
  ].filter((part) => part.ore > 0);

  return (
    <div className="block-coral rounded-b-[1.55rem] border-t-[3px] border-ink px-4 pt-3 pb-2.5 sm:px-5 short:pt-2 short:pb-2" aria-live="polite" aria-busy={loading}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span
          data-urval-count={String(urval.companies)}
          className={`font-display tabular inline-block text-[3.2rem] leading-[0.9] font-extrabold tracking-[-0.04em] sm:text-[3.9rem] short:text-[3.2rem] ${pop ? "count-pop" : ""} ${loading ? "opacity-60" : ""}`}
        >
          {figure.toLocaleString("sv-SE")}
        </span>
        <span className="font-display text-xl font-bold">{counted ? "företag" : "företag i Sverige"}</span>
      </p>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-sm font-bold">
          <span className="font-display tabular text-2xl font-extrabold" data-urval-price>
            {formatKronor(price.totalOre)} kr
          </span>{" "}
          exkl. moms
          <span className="block text-xs">CSV eller Excel</span>
        </p>
        {urval.companies === 0 ? (
          <button type="button" className="btn-chunk is-white h-11 px-4 text-sm" onClick={() => onChange(EMPTY)}>
            Börja om
          </button>
        ) : counted ? (
          <Link href={`/kassa?${selectionToQuery(draft)}`} className="btn-chunk is-white h-12 px-5 text-base short:h-10">
            Förhandsboka →
          </Link>
        ) : (
          <button type="button" className="btn-chunk is-white h-12 px-5 text-base short:h-10" onClick={onFocusSearch}>
            Välj bransch →
          </button>
        )}
      </div>
      <p className="mt-1.5 truncate text-xs font-bold" title={describeSelection(draft)}>
        {urval.source === "example" ? "Exempeldata · " : ""}
        {counted ? describeSelection(draft) : "Alla branscher · alla orter · alla bolagsformer"}
      </p>
      <p className="font-mono mt-0.5 truncate text-[0.68rem]" data-urval-spec>
        {parts.length ? parts.map((part) => `${part.label} ${formatKronor(part.ore)} kr`).join(" · ") : "Inget bolag i urvalet."}
        {price.minimumApplied && counts.companies > 0 ? ` · lägsta order ${formatKronor(MINIMUM_ORE)} kr` : ""}
      </p>
      <p className="mt-1 border-t-2 border-ink/25 pt-1 text-[0.7rem] font-semibold" data-register-stamp>
        {stamp}
      </p>
    </div>
  );
}
