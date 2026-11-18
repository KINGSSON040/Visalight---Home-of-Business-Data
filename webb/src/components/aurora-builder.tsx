"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useCountUp } from "@/components/count-up";
import {
  EMPLOYEE_BANDS,
  FORM_GROUPS,
  INDUSTRIES,
  describeSelection,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  type Selection,
  type Suggestion,
} from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";

const QUICK_BRANSCH = [
  { label: "Restauranger", sni: "56110" },
  { label: "Frisörer", sni: "96210" },
  { label: "Bygg", sni: "41200" },
  { label: "Redovisning", sni: "69201" },
  { label: "Datakonsulter", sni: "62010" },
];

const QUICK_PLACES = [
  { label: "Stockholm", county: "Stockholms län" },
  { label: "Västra Götaland", county: "Västra Götalands län" },
  { label: "Skåne", county: "Skåne län" },
];

type Patch = (patch: Partial<Selection>) => void;

function dotted(sni: string): string {
  return sni.length === 5 ? `${sni.slice(0, 2)}.${sni.slice(2)}` : sni;
}

export function AuroraBuilder({
  draft,
  onChange,
  urval,
  loading,
  updatedLabel,
  exampleData,
}: {
  draft: Selection;
  onChange: Patch;
  urval: UrvalResult;
  loading: boolean;
  updatedLabel: string;
  exampleData: boolean;
}) {
  const [more, setMore] = useState(Boolean(draft.forms.length || draft.employees));
  const [lit, setLit] = useState(false);
  const firstCount = useRef(true);

  useEffect(() => {
    if (firstCount.current) {
      firstCount.current = false;
      return;
    }
    setLit(true);
    const timer = window.setTimeout(() => setLit(false), 900);
    return () => window.clearTimeout(timer);
  }, [urval.companies]);

  const bransch = (draft.bransch ?? "").trim();
  const industryBricks =
    draft.sni || bransch
      ? [{ key: "bransch", text: draft.sni ? `${dotted(draft.sni)} ${INDUSTRIES.find((item) => item.sni === draft.sni)?.label ?? bransch}` : bransch, clear: { sni: "", bransch: "" } }]
      : [];
  const regionBricks = [
    ...(draft.county ? [{ key: "lan", text: draft.county, clear: { county: "" } }] : []),
    ...(draft.city.trim() ? [{ key: "ort", text: draft.city.trim(), clear: { city: "" } }] : []),
  ];

  return (
    <section id="urval" aria-label="Listbyggaren" data-lit={lit} className="builder-card relative overflow-visible rounded-2xl">
      <div className="space-y-3 p-4 sm:p-5">
        <Step no="01" title="Bransch">
          <BrickSearch
            kinds={["bransch"]}
            placeholder={industryBricks.length ? "Byt bransch…" : "Skriv bransch eller SNI, t.ex. frisör"}
            label="Bransch eller SNI-kod"
            bricks={industryBricks}
            tone="green"
            onChange={onChange}
            pick={(item) => onChange({ bransch: item.apply.bransch ?? "", sni: item.apply.sni ?? "", query: "" })}
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {QUICK_BRANSCH.map((item) => {
              const on = draft.sni === item.sni;
              const industry = INDUSTRIES.find((row) => row.sni === item.sni);
              return (
                <button
                  key={item.sni}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? { sni: "", bransch: "" } : { sni: item.sni, bransch: industry?.label ?? "" })}
                  className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step no="02" title="Region">
          <BrickSearch
            kinds={["ort", "lan"]}
            placeholder={regionBricks.length ? "Lägg till ort eller byt län…" : "Hela Sverige, eller skriv ort eller län"}
            label="Ort eller län"
            bricks={regionBricks}
            tone="magenta"
            onChange={onChange}
            pick={(item) => onChange(item.kind === "ort" ? { city: item.apply.city ?? "" } : { county: item.apply.county ?? "" })}
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={!draft.city && !draft.county}
              onClick={() => onChange({ city: "", county: "" })}
              className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              Hela Sverige
            </button>
            {QUICK_PLACES.map((place) => {
              const on = !draft.city && draft.county === place.county;
              return (
                <button
                  key={place.county}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ city: "", county: on ? "" : place.county })}
                  className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {place.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step
          no="03"
          title="Kontaktuppgifter"
          aside={
            <button
              type="button"
              aria-expanded={more}
              onClick={() => setMore((value) => !value)}
              className="text-xs font-semibold text-magenta underline-offset-4 hover:underline"
            >
              {more ? "Dölj fler filter" : "Fler filter"} <span aria-hidden="true">{more ? "▴" : "▾"}</span>
            </button>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            <AddonChip on={draft.phones} onToggle={() => onChange({ phones: !draft.phones })} label="Telefon" price={`+${formatKronor(PHONE_ORE)} kr/nr`} />
            <AddonChip on={draft.emails} onToggle={() => onChange({ emails: !draft.emails })} label="E-post" price={`+${formatKronor(EMAIL_ORE)} kr/st`} />
            <AddonChip
              on={draft.signatory}
              onToggle={() => onChange({ signatory: !draft.signatory })}
              label="Beslutsfattare"
              price={`+${formatKronor(SIGNATORY_ORE)} kr/nr`}
            />
          </div>
          {more ? <MoreFilters draft={draft} onChange={onChange} /> : null}
        </Step>
      </div>

      <Result draft={draft} urval={urval} loading={loading} exampleData={exampleData} updatedLabel={updatedLabel} />
    </section>
  );
}

function Step({ no, title, aside, children }: { no: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <legend className="flex items-baseline gap-2 text-base font-bold">
          <span className="step-no text-xs font-bold">{no}</span>
          <span className="font-display">{title}</span>
        </legend>
        {aside}
      </div>
      {children}
    </fieldset>
  );
}

function AddonChip({ on, onToggle, label, price }: { on: boolean; onToggle: () => void; label: string; price: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onToggle} className="addon-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold">
      <span
        aria-hidden="true"
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.62rem] font-bold ${on ? "bg-neon text-white" : "border border-ink/30"}`}
      >
        {on ? "✓" : ""}
      </span>
      {label}
      <span className="font-price text-[0.7rem] font-medium text-muted">{price}</span>
    </button>
  );
}

function BrickSearch({
  kinds,
  placeholder,
  label,
  bricks,
  tone,
  onChange,
  pick,
}: {
  kinds: Suggestion["kind"][];
  placeholder: string;
  label: string;
  bricks: { key: string; text: string; clear: Partial<Selection> }[];
  tone: "green" | "magenta";
  onChange: Patch;
  pick: (suggestion: Suggestion) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const suggestions = suggestSegment(text)
    .filter((item) => kinds.includes(item.kind))
    .slice(0, 7);
  const visible = open ? suggestions : [];

  useEffect(() => setActive(0), [text]);

  function choose(suggestion: Suggestion) {
    pick(suggestion);
    setText("");
    setOpen(false);
  }

  return (
    <div className={`relative ${open ? "z-30" : ""}`}>
      <div className="field-box flex min-h-11 flex-wrap items-center gap-1.5 rounded-2xl px-3 py-1.5">
        <span aria-hidden="true" className="text-muted">
          ⌕
        </span>
        {bricks.map((brick) => (
          <span key={brick.key} className={`brick ${tone === "magenta" ? "region" : ""} inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold`}>
            <span className="truncate">{brick.text}</span>
            <button type="button" onClick={() => onChange(brick.clear)} className="rounded px-0.5 leading-none hover:bg-black/10" aria-label={`Ta bort ${brick.text}`}>
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
          aria-autocomplete="list"
          aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActive((value) => Math.min(suggestions.length - 1, value + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(0, value - 1));
            } else if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (suggestions[active]) choose(suggestions[active]);
            } else if (event.key === "Backspace" && !text && bricks.length) {
              onChange(bricks[bricks.length - 1].clear);
            }
          }}
          className="h-8 min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted/80"
        />
      </div>
      {visible.length > 0 ? (
        <ul id={listId} role="listbox" aria-label={`Förslag: ${label}`} className="suggest-list absolute z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl p-1">
          {visible.map((suggestion, index) => (
            <li key={suggestion.id} role="presentation">
              <button
                type="button"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                data-suggestion={suggestion.title}
                onPointerDown={(event) => event.preventDefault()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(suggestion)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left ${index === active ? "bg-foam" : ""}`}
              >
                <span className="font-semibold">{suggestion.title}</span>
                <span className="font-price shrink-0 text-[0.7rem] text-muted">
                  {suggestion.kind === "bransch" ? `SNI ${dotted(suggestion.apply.sni ?? "")}` : suggestion.kind === "lan" ? "Län" : "Ort"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : open && text.trim() ? (
        <p className="suggest-list absolute z-30 mt-1.5 w-full rounded-2xl px-3 py-2 text-sm text-muted">Inget förslag. Prova ett annat ord eller en SNI-kod.</p>
      ) : null}
    </div>
  );
}

function MoreFilters({ draft, onChange }: { draft: Selection; onChange: Patch }) {
  const group = FORM_GROUPS.find((item) => item.codes.some((code) => draft.forms.includes(code)));
  const field = "field-box mt-0.5 h-10 w-full min-w-0 rounded-xl px-3 text-sm";
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <label className="min-w-0 text-xs font-semibold">
        Bolagsform
        <select
          value={group?.label ?? ""}
          onChange={(event) => onChange({ forms: FORM_GROUPS.find((item) => item.label === event.target.value)?.codes ?? [] })}
          className={field}
        >
          <option value="">Alla bolagsformer</option>
          {FORM_GROUPS.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0 text-xs font-semibold">
        Anställda
        <select value={draft.employees} onChange={(event) => onChange({ employees: event.target.value })} className={field}>
          <option value="">Alla storlekar</option>
          {EMPLOYEE_BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Result({
  draft,
  urval,
  loading,
  exampleData,
  updatedLabel,
}: {
  draft: Selection;
  urval: UrvalResult;
  loading: boolean;
  exampleData: boolean;
  updatedLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const shown = useCountUp(urval.companies, { fromZero: true, duration: 1100 });
  const shownPrice = useCountUp(price.totalOre, { fromZero: true, duration: 1100 });
  const [flare, setFlare] = useState(false);
  const counted = selectionForCount(draft) ?? draft;
  const example = exampleData || urval.source === "example";
  const parts = [
    { label: "Grund", ore: counts.companies * BASE_ORE },
    ...(draft.phones ? [{ label: "Telefon", ore: counts.phones * PHONE_ORE }] : []),
    ...(draft.emails ? [{ label: "E-post", ore: counts.emails * EMAIL_ORE }] : []),
    ...(draft.signatory ? [{ label: "Beslutsfattare", ore: counts.signatoryPhones * SIGNATORY_ORE }] : []),
  ];

  useEffect(() => {
    setFlare(true);
    const timer = window.setTimeout(() => setFlare(false), 900);
    return () => window.clearTimeout(timer);
  }, [urval.companies]);

  return (
    <div ref={ref} className="result-field rounded-b-2xl px-4 pt-3.5 pb-3 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-price text-[0.7rem] font-bold tracking-[0.14em] text-white/90 uppercase">
          {selectionForCount(draft) ? "Ert urval" : "Hela registret, alla Sveriges företag"}
        </p>
        {example ? <span className="rounded-full bg-gold px-2 py-0.5 text-[0.68rem] font-bold text-night">Exempeldata</span> : null}
      </div>
      <div className="mt-0.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2" aria-live="polite" aria-busy={loading}>
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span
              data-urval-count={String(urval.companies)}
              className={`big-count font-display text-[2.9rem] leading-none font-extrabold tracking-[-0.03em] sm:text-[3.6rem] ${flare ? "flare" : ""} ${loading ? "opacity-85" : ""}`}
            >
              {shown.toLocaleString("sv-SE")}
            </span>
            <span className="font-display text-lg font-bold">företag</span>
          </p>
          <p className="mt-1 text-sm font-semibold">
            <span data-urval-price className="font-price text-base font-bold">
              {formatKronor(shownPrice)} kr
            </span>{" "}
            <span className="text-white/85">exkl. moms · Excel eller CSV</span>
          </p>
        </div>
        <Link
          href={`/kassa?${selectionToQuery(counted)}`}
          aria-disabled={counts.companies === 0}
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-magenta shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] hover:bg-[#fff6fb] ${counts.companies === 0 ? "pointer-events-none opacity-60" : ""}`}
        >
          Förhandsboka utdraget <span aria-hidden="true">→</span>
        </Link>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">Ingen inloggning. Ingen prenumeration. Ingen bindningstid.</p>
      <p className="mt-1.5 truncate text-xs text-white/90">{describeSelection(counted)}</p>
      {urval.companies === 0 ? (
        <p className="mt-1 text-xs font-semibold">{urval.note || "Inget bolag matchar."} Ta bort ett filter så kommer de tillbaka.</p>
      ) : (
        <p className="font-price mt-1 hidden truncate text-[0.66rem] text-white/85 sm:block">
          {parts.map((part) => `${part.label} ${Math.round(part.ore / 100).toLocaleString("sv-SE")} kr`).join(" + ")}
          {price.minimumApplied ? " · lägsta order 399 kr" : ""}
        </p>
      )}
      <p className="mt-2 border-t border-white/25 pt-2 text-[0.72rem] text-white/95">
        Registret senast uppdaterat: {updatedLabel}
        {exampleData ? " (exempeldata)" : ""}
      </p>
      <MobileBar watch={ref} companies={urval.companies} priceOre={price.totalOre} />
    </div>
  );
}

function MobileBar({ watch, companies, priceOre }: { watch: React.RefObject<HTMLDivElement | null>; companies: number; priceOre: number }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const node = watch.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setHidden(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [watch]);
  if (hidden) return null;
  return (
    <a href="#urval" className="result-field fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 shadow-xl lg:hidden">
      <span className="font-display text-xl font-extrabold tabular-nums">{companies.toLocaleString("sv-SE")}</span>
      <span className="font-price text-xs">företag · {Math.round(priceOre / 100).toLocaleString("sv-SE")} kr</span>
      <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-magenta">Ändra</span>
    </a>
  );
}
