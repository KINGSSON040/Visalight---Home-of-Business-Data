"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useCountUp } from "@/components/count-up";
import {
  EMPLOYEE_RANGES,
  FORM_GROUPS,
  INDUSTRIES,
  selectionIndustries,
  listParts,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  togglePart,
  type Selection,
  type Suggestion,
} from "@/lib/catalog";
import { EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
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

function industryPairs(selection: Selection): { sni: string; label: string }[] {
  const snis = listParts(selection.sni ?? "");
  const labels = listParts(selection.bransch ?? "");
  if (snis.length) {
    return snis.map((sni, index) => ({
      sni,
      label: labels[index] || selectionIndustries().find((item) => item.sni === sni)?.label || sni,
    }));
  }
  return labels.map((label) => ({ sni: "", label }));
}

function withIndustry(selection: Selection, sni: string, label: string): Partial<Selection> {
  const pairs = industryPairs(selection);
  const next = pairs.some((item) => item.sni === sni) ? pairs.filter((item) => item.sni !== sni) : [...pairs, { sni, label }];
  return { sni: next.map((item) => item.sni).filter(Boolean).join(","), bransch: next.map((item) => item.label).join(",") };
}

function dotted(sni: string): string {
  return sni.length === 5 ? `${sni.slice(0, 2)}.${sni.slice(2)}` : sni;
}

export function AuroraBuilder({
  draft,
  onChange,
  urval,
  loading,
  updatedLabel,
  exampleDate = false,
}: {
  draft: Selection;
  onChange: Patch;
  urval: UrvalResult;
  loading: boolean;
  updatedLabel: string;
  exampleDate?: boolean;
}) {
  const [more, setMore] = useState(Boolean(draft.forms.length));
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

  const industries = industryPairs(draft);
  const cities = listParts(draft.city);
  const counties = listParts(draft.county ?? "");
  const industryBricks = industries.map((item) => ({
    key: item.sni || item.label,
    text: item.sni ? `${dotted(item.sni)} ${item.label}` : item.label,
    clear: withIndustry(draft, item.sni, item.label),
  }));
  const regionBricks = [
    ...cities.map((city) => ({ key: `ort-${city}`, text: city, clear: { city: togglePart(draft.city, city) } })),
    ...counties.map((county) => ({ key: `lan-${county}`, text: county, clear: { county: togglePart(draft.county ?? "", county) } })),
  ];

  return (
    <section id="urval" aria-label="Listbyggaren" data-lit={lit} className="builder-card relative overflow-visible rounded-2xl">
      <p className="register-stamp ml-auto w-max max-w-[15rem] px-4 pt-2.5 text-right text-[0.6rem] leading-[1.35] sm:px-5">
        {exampleDate
          ? `Exempelsiffror. Registret är inte inkopplat. Datumet ${updatedLabel} är ett exempel.`
          : `Registret senast uppdaterat: ${updatedLabel}. Siffran följer den senaste uppdateringen.`}
      </p>
      <div className="space-y-3 px-4 pt-2 pb-4 sm:px-5 sm:pb-5">
        <Step no="01" title="Bransch">
          <BrickSearch
            kinds={["bransch"]}
            placeholder={industryBricks.length ? "Lägg till bransch…" : "Skriv bransch eller SNI, t.ex. frisör"}
            label="Bransch eller SNI-kod"
            bricks={industryBricks}
            tone="green"
            onChange={onChange}
            pick={(item) => onChange({ ...withIndustry(draft, item.apply.sni ?? "", item.apply.bransch ?? item.title), query: "" })}
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {QUICK_BRANSCH.map((item) => {
              const on = listParts(draft.sni).includes(item.sni);
              const industry = INDUSTRIES.find((row) => row.sni === item.sni);
              return (
                <button
                  key={item.sni}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(withIndustry(draft, item.sni, industry?.label ?? item.label))}
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
            placeholder={regionBricks.length ? "Lägg till ort eller län…" : "Hela Sverige, eller skriv ort eller län"}
            label="Ort eller län"
            bricks={regionBricks}
            tone="magenta"
            onChange={onChange}
            pick={(item) =>
              onChange(
                item.kind === "ort"
                  ? { city: togglePart(draft.city, item.apply.city ?? item.title) }
                  : { county: togglePart(draft.county ?? "", item.apply.county ?? "") },
              )
            }
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={cities.length === 0 && counties.length === 0}
              onClick={() => onChange({ city: "", county: "" })}
              className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              Hela Sverige
            </button>
            {QUICK_PLACES.map((place) => {
              const on = counties.includes(place.county);
              return (
                <button
                  key={place.county}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ county: togglePart(draft.county ?? "", place.county) })}
                  className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {place.label}
                </button>
              );
            })}
          </div>
        </Step>

        <div>
          <p className="text-xs font-semibold">Antal anställda</p>
          {listParts(draft.employees).length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {listParts(draft.employees).map((label) => (
                <span key={label} className="brick inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold">
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ employees: togglePart(draft.employees, label) })}
                    className="rounded px-0.5 leading-none hover:bg-white/20"
                    aria-label={`Ta bort ${label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={listParts(draft.employees).length === 0}
              onClick={() => onChange({ employees: "" })}
              className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              Alla storlekar
            </button>
            {EMPLOYEE_RANGES.map((range) => {
              const on = listParts(draft.employees).includes(range.label);
              return (
                <button
                  key={range.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ employees: togglePart(draft.employees, range.label) })}
                  className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold">Nystartade</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[
              { label: "Alla", value: "" },
              { label: "3 månader", value: "3" },
              { label: "6 månader", value: "6" },
              { label: "12 månader", value: "12" },
            ].map((choice) => (
              <button
                key={choice.label}
                type="button"
                aria-pressed={(draft.founded ?? "") === choice.value}
                onClick={() => onChange({ founded: choice.value })}
                className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted">
            Registret synkas en gång i veckan. Nya bolag kommer med då.
          </p>
        </div>

        <Step
          no="03"
          title="Kontaktuppgifter"
          aside={
            <button
              type="button"
              aria-expanded={more}
              onClick={() => setMore((value) => !value)}
              className="text-xs font-semibold text-ink underline-offset-4 hover:underline"
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
          <p className="mt-2 max-w-xl text-xs leading-5 text-muted">
            Ett direktnummer till en person, eller en enskild firma, kan samtidigt vara en personuppgift. Ni ansvarar för utskicket, inklusive NIX och de regler som gäller just den kanalen.
          </p>
          {more ? <MoreFilters draft={draft} onChange={onChange} /> : null}
        </Step>
      </div>

      <Result draft={draft} urval={urval} loading={loading} />
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
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.62rem] font-bold ${on ? "bg-white text-magenta" : "border border-ink/30"}`}
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
            <button type="button" onClick={() => onChange(brick.clear)} className="rounded px-0.5 leading-none hover:bg-white/20" aria-label={`Ta bort ${brick.text}`}>
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
    </div>
  );
}

function Result({
  draft,
  urval,
  loading,
}: {
  draft: Selection;
  urval: UrvalResult;
  loading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const counts = pricedCounts(urval, draft);
  const price = priceForUrval(urval, draft);
  const shown = useCountUp(urval.companies, { fromZero: true, duration: 1100 });
  const shownPrice = useCountUp(price.totalOre, { fromZero: true, duration: 1100 });
  const [flare, setFlare] = useState(false);
  const counted = selectionForCount(draft) ?? draft;

  useEffect(() => {
    setFlare(true);
    const timer = window.setTimeout(() => setFlare(false), 900);
    return () => window.clearTimeout(timer);
  }, [urval.companies]);

  return (
    <div ref={ref} className="result-field rounded-b-2xl px-4 pt-3.5 pb-3 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-price text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
          {selectionForCount(draft) ? "Aktiva i ert urval" : "Aktiva företag i dag"}
        </p>
      </div>
      <div className="mt-0.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2" aria-live="polite" aria-busy={loading}>
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span
              data-urval-count={String(urval.companies)}
              className={`big-count font-display text-[2.9rem] leading-none font-extrabold tracking-[-0.03em] text-magenta sm:text-[3.6rem] ${flare ? "flare" : ""} ${loading ? "opacity-85" : ""}`}
            >
              {shown.toLocaleString("sv-SE")}
            </span>
            <span className="font-display text-lg font-bold">företag</span>
          </p>
          <p className="mt-1 text-sm font-semibold">
            <span data-urval-price className="price-figure font-price text-base font-bold">
              {formatKronor(shownPrice)} kr
            </span>{" "}
            <span className="text-muted">exkl. moms · Excel eller CSV</span>
          </p>
        </div>
        <Link
          href={`/kassa?${selectionToQuery(counted)}`}
          aria-disabled={counts.companies === 0}
          className={`btn-neon inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${counts.companies === 0 ? "pointer-events-none opacity-60" : ""}`}
        >
          Köp utdrag <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {urval.source === "example" ? (
          <p className="text-xs leading-5 text-muted">Exempelsiffror. Registret är inte inkopplat.</p>
        ) : null}
        <p className="text-sm leading-6">Ingen inloggning, prenumeration eller bindningstid.</p>
        <p className="text-sm leading-6 text-muted">Bara aktiva företag som inte spärrat reklam. Uppdateras en gång i veckan.</p>
        <p className="text-xs leading-5 text-muted">Ingen betalning dras och ingen fil skickas ännu.</p>
        {urval.companies === 0 ? (
          <p className="text-xs font-semibold">{urval.note || "Inget bolag matchar."} Ta bort ett filter så kommer de tillbaka.</p>
        ) : null}
      </div>
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
      <span className="font-display text-xl font-extrabold text-magenta tabular-nums">{companies.toLocaleString("sv-SE")}</span>
      <span className="price-figure font-price text-xs">företag · {Math.round(priceOre / 100).toLocaleString("sv-SE")} kr</span>
      <span className="rounded-lg border border-ink bg-white px-3 py-1 text-sm font-bold text-ink">Ändra</span>
    </a>
  );
}
