"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Confetti, SlotNumber } from "@/components/pop-motion";
import {
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
];

const QUICK_PLACES: { label: string; patch: Partial<Selection> }[] = [
  { label: "Stockholm", patch: { city: "Stockholm" } },
  { label: "Göteborg", patch: { city: "Göteborg" } },
  { label: "Malmö", patch: { city: "Malmö" } },
  { label: "Skåne län", patch: { county: "Skåne län" } },
];

const TRADE_KINDS = new Set<Suggestion["kind"]>(["bransch"]);
const PLACE_KINDS = new Set<Suggestion["kind"]>(["ort", "lan"]);

const EMPTY_FILTERS: Partial<Selection> = { query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" };

type Token = { key: string; text: string; clear: Partial<Selection> };

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
  const [more, setMore] = useState(Boolean(draft.employees || draft.forms.length));
  const [burst, setBurst] = useState(0);
  const [bounce, setBounce] = useState(0);
  const previous = useRef(count);

  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    setBounce((value) => value + 1);
    if (filtered && count > 0) setBurst((value) => value + 1);
  }, [count, filtered]);

  const tradeTokens: Token[] =
    draft.sni || draft.bransch
      ? [{ key: "bransch", text: `${draft.sni ? `${draft.sni} ` : ""}${draft.bransch || "Vald bransch"}`, clear: { bransch: "", sni: "", query: "" } }]
      : [];
  const placeTokens: Token[] = [
    ...(draft.city ? [{ key: "ort", text: draft.city, clear: { city: "" } }] : []),
    ...(draft.county ? [{ key: "lan", text: draft.county, clear: { county: "" } }] : []),
  ];

  const tillval = [
    { key: "phones", label: "Kontaktnummer", short: "Kontaktnummer", price: PHONE_ORE, on: draft.phones, toggle: { phones: !draft.phones } },
    { key: "emails", label: "E-post", short: "E-post", price: EMAIL_ORE, on: draft.emails, toggle: { emails: !draft.emails } },
    { key: "signatory", label: "Beslutsfattare med direktnummer", short: "Beslutsfattare", price: SIGNATORY_ORE, on: draft.signatory, toggle: { signatory: !draft.signatory } },
  ];

  return (
    <div>
      <div id="urval" className="builder-card relative rounded-[1.75rem] bg-white">
        <div className="space-y-4 px-4 pt-4 pb-4 sm:px-6 sm:pt-5">
          <Step n="01" title="Bransch">
            <TokenField
              label="Bransch eller SNI-kod"
              tokens={tradeTokens}
              kinds={TRADE_KINDS}
              placeholder={tradeTokens.length ? "Byt bransch…" : "Sök bransch eller SNI-kod"}
              onPick={(suggestion) => onChange({ bransch: suggestion.apply.bransch ?? "", sni: suggestion.apply.sni ?? "", query: "" })}
              onRemove={onChange}
            />
            <QuickRow>
              {QUICK_TRADES.map((trade) => {
                const pressed = draft.sni === trade.sni;
                return (
                  <button
                    key={trade.sni}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => onChange(pressed ? { bransch: "", sni: "", query: "" } : { bransch: trade.bransch, sni: trade.sni, query: "" })}
                    className="chip-pop px-2.5 py-0.5 text-xs sm:text-sm"
                  >
                    {trade.label}
                  </button>
                );
              })}
            </QuickRow>
          </Step>

          <Step n="02" title="Region">
            <TokenField
              label="Ort eller län"
              tokens={placeTokens}
              kinds={PLACE_KINDS}
              placeholder={placeTokens.length ? "Byt ort eller län…" : "Hela Sverige, eller sök ort och län"}
              onPick={(suggestion) =>
                onChange(suggestion.kind === "lan" ? { county: suggestion.apply.county ?? "", query: "" } : { city: suggestion.apply.city ?? "", query: "" })
              }
              onRemove={onChange}
            />
            <QuickRow>
              {QUICK_PLACES.map((place) => {
                const pressed = place.patch.city ? draft.city === place.patch.city : draft.county === place.patch.county;
                const clear = place.patch.city ? { city: "" } : { county: "" };
                return (
                  <button key={place.label} type="button" aria-pressed={pressed} onClick={() => onChange(pressed ? clear : place.patch)} className="chip-pop px-2.5 py-0.5 text-xs sm:text-sm">
                    {place.label}
                  </button>
                );
              })}
            </QuickRow>
          </Step>

          <Step n="03" title="Kontaktuppgifter">
            <div className="flex flex-wrap gap-2">
              {tillval.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={item.on}
                  onClick={() => onChange(item.toggle)}
                  className="toggle-chip inline-flex items-center gap-1.5 px-3 py-1.5 text-left text-sm font-extrabold"
                >
                  <span aria-hidden="true">{item.on ? "✓" : "+"}</span>
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="mono text-xs font-medium opacity-80">+{formatKronor(item.price)} kr/rad</span>
                </button>
              ))}
            </div>
            <p className="mono mt-2 text-[0.7rem] text-muted">Grunddata {formatKronor(BASE_ORE)} kr/bolag ingår alltid</p>
          </Step>

          <div>
            <button type="button" aria-expanded={more} onClick={() => setMore((value) => !value)} className="text-sm font-extrabold underline decoration-[var(--pop-magenta)] decoration-[3px] underline-offset-4">
              {more ? "Färre filter" : "Fler filter: bolagsform och storlek"}
            </button>
            {more ? (
              <div className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                <PopSelect
                  label="Bolagsform"
                  value={FORM_GROUPS.find((group) => group.codes.length === draft.forms.length && group.codes.every((code) => draft.forms.includes(code)))?.label ?? ""}
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
        </div>

        <div className="result-field relative rounded-b-[1.55rem] border-t-[3px] border-[var(--pop-ink)] bg-[var(--pop-magenta)] px-4 py-4 text-white sm:px-6" aria-live="polite" aria-busy={loading}>
          <Confetti burst={burst} />
          <p className="eyebrow text-[var(--pop-sun)]">
            {filtered ? "Ert utdrag" : `Hela registret${registerReal ? "" : " · exempelvärde"}`}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span key={bounce} className={`font-display text-[2.9rem] leading-none tabular-nums sm:text-[3.6rem] ${bounce ? "pop-bounce" : ""} ${loading ? "opacity-70" : ""} inline-block`}>
                  <SlotNumber value={count} />
                </span>
                <span className="text-xl font-extrabold">företag</span>
              </p>
              <p className="mt-1 text-sm font-semibold">
                <span className="mono text-base font-medium" data-price>
                  {formatKronor(priceOre)} kr
                </span>{" "}
                exkl. moms ·{" "}
                {filtered ? (quote.minimumApplied ? `lägsta order ${formatKronor(MINIMUM_ORE)} kr` : "CSV eller Excel") : "grunddata, välj filter för exakt pris"}
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-white/85" data-spec>
                {spec}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {filtered && count > 0 ? (
                <Link href={`/kassa?${selectionToQuery(draft)}`} className="pop-btn pop-btn--white h-12 px-5 text-base" data-cta="forhandsboka">
                  Förhandsboka <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>("#urval input[role=combobox]")?.focus()}
                  className="pop-btn pop-btn--white h-12 px-5 text-base"
                >
                  Välj bransch <span aria-hidden="true">↑</span>
                </button>
              )}
              <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="pop-btn pop-btn--sun h-12 px-3 text-sm" aria-label="Rensa alla filter">
                Rensa
              </button>
            </div>
          </div>
          {filtered && urval.source === "example" ? <p className="mt-2 text-[0.7rem] leading-4 text-white/85">{urval.note}</p> : null}
        </div>
      </div>
      <p className="mono mt-3 px-1 text-xs text-muted" data-register-stamp>
        Registret senast uppdaterat: {updatedLabel}
        {exampleData ? " (exempeldata)" : ""}
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1.5 flex items-baseline gap-2.5">
        <span className="mono text-sm font-medium text-[var(--pop-magenta-deep)]">{n}</span>
        <span className="font-display text-xl leading-none tracking-tight">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function QuickRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>;
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

/** Ett fält med valda filter som brickor. Förslagen är bara branscher, SNI, orter och län, aldrig enskilda företag. */
function TokenField({
  label,
  tokens,
  kinds,
  placeholder,
  onPick,
  onRemove,
}: {
  label: string;
  tokens: Token[];
  kinds: Set<Suggestion["kind"]>;
  placeholder: string;
  onPick: (suggestion: Suggestion) => void;
  onRemove: (patch: Partial<Selection>) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const suggestions = suggestSegment(text).filter((item) => kinds.has(item.kind));
  const visible = open ? suggestions : [];

  function pick(suggestion: Suggestion) {
    onPick(suggestion);
    setText("");
    setOpen(false);
  }

  return (
    <div className={`relative ${open ? "z-30" : ""}`}>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-2xl border-[2.5px] border-[var(--pop-ink)] bg-[var(--pop-cream)] px-2 py-1.5 focus-within:bg-[#fffbe6]">
        <span aria-hidden="true" className="pl-1 text-base text-muted">
          ⌕
        </span>
        {tokens.map((token) => (
          <span key={token.key} className="inline-flex max-w-full items-center gap-1 rounded-full border-2 border-[var(--pop-ink)] bg-[var(--pop-magenta)] py-0.5 pr-1 pl-2.5 text-sm font-extrabold text-white" data-token={token.key}>
            <span className="truncate">{token.text}</span>
            <button type="button" onClick={() => onRemove(token.clear)} className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/25" aria-label={`Ta bort ${token.text}`}>
              ×
            </button>
          </span>
        ))}
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          value={text}
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
            setText(event.target.value);
            setActive(0);
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
            } else if (event.key === "Backspace" && !text && tokens.length) {
              onRemove(tokens[tokens.length - 1].clear);
            }
          }}
          className="h-8 min-w-[8rem] flex-1 bg-transparent px-1 text-base font-semibold outline-none placeholder:font-medium placeholder:text-[#8a6a80]"
        />
      </div>
      {visible.length > 0 ? (
        <ul id={listId} role="listbox" aria-label="Förslag" className="absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border-[3px] border-[var(--pop-ink)] bg-white shadow-[5px_5px_0_var(--pop-ink)]">
          {visible.map((suggestion, index) => {
            const showKind = index === 0 || visible[index - 1].kind !== suggestion.kind;
            return (
              <li key={suggestion.id} role="presentation">
                {showKind ? <p className="eyebrow px-3 pt-2 text-[0.66rem] text-[var(--pop-magenta-deep)]">{SUGGESTION_KIND_LABEL[suggestion.kind]}</p> : null}
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
      ) : text.trim() && open ? (
        <p className="absolute z-40 mt-1.5 w-full rounded-2xl border-[3px] border-[var(--pop-ink)] bg-white px-3 py-2 text-sm font-semibold">Inget förslag matchar.</p>
      ) : null}
    </div>
  );
}
