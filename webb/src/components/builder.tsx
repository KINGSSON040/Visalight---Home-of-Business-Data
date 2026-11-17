"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppearance } from "@/components/appearance";
import { CompanySearch } from "@/components/company-search";
import {
  COUNTIES,
  FORM_GROUPS,
  formGroupLabel,
  industryLabel,
  resolveQuery,
  selectionForCount,
  selectionToQuery,
  suggestSegment,
  type Selection,
} from "@/lib/catalog";
import { FILTERS, type FilterId } from "@/lib/appearance";
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
  const { filter } = useAppearance();
  const waitingForWord = draft.query.trim().length > 0 && !resolveQuery(draft.query) && !selectionForCount({ ...draft, query: "" });
  const hint = waitingForWord ? "Förslagen kommer direkt." : "";
  const layoutName = FILTERS.find((item) => item.id === filter)?.name ?? "Kompakt kort";
  const fresh = updatedLabel
    ? `Uppdaterat ${updatedLabel}. Äldre årgångar används inte.`
    : "Uppdaterat från senaste registret. Äldre årgångar används inte.";

  return (
    <div id="urval" className="builder-card rounded-[1.35rem] px-3 py-2.5 text-ink sm:px-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base tracking-tight sm:text-lg">Skapa ert utdrag</h2>
        <p className="truncate text-[0.68rem] text-muted">{layoutName}</p>
      </div>
      <p className="mt-0.5 truncate text-[0.7rem] leading-4 text-muted">{fresh}</p>
      <ResultHero draft={draft} urval={urval} loading={loading} onChange={onChange} />
      <div className={`mt-2 ${filter === "sida" ? "sm:grid sm:grid-cols-2 sm:gap-2" : ""}`}>
        <FilterBody filter={filter} draft={draft} onChange={onChange} hint={hint} />
      </div>
    </div>
  );
}

const QUICK_BRANSCH = [
  { label: "Restaurang", bransch: "Restaurangverksamhet", sni: "56110" },
  { label: "Frisör", bransch: "Frisörer och barberare", sni: "96210" },
  { label: "Bygg", bransch: "Byggande av hus", sni: "41200" },
  { label: "Redovisning", bransch: "Redovisning och bokföring", sni: "69201" },
];

const QUICK_CITIES = ["Stockholm", "Göteborg", "Malmö"];

function FilterBody({
  filter,
  draft,
  onChange,
  hint,
}: {
  filter: FilterId;
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  hint: string;
}) {
  if (filter === "steg") return <StepFilter draft={draft} onChange={onChange} />;
  if (filter === "fraga") return <QuestionFilter draft={draft} onChange={onChange} />;
  return (
    <CompanySearch
      draft={draft}
      onChange={onChange}
      onSearch={() => undefined}
      live
      segmentOnly
      onClear={() => onChange({ query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" })}
      queryPlaceholder="Bransch, ort, län eller storlek"
      querySuggestions={suggestSegment}
      hint={hint}
      beforeForms={<Tillval draft={draft} onChange={onChange} />}
    />
  );
}

function Tillval({ draft, onChange }: { draft: Selection; onChange: (patch: Partial<Selection>) => void }) {
  return (
    <fieldset className="mt-1.5">
      <legend className="text-xs font-medium">Tillval</legend>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        <CheckOption checked={draft.phones} onChange={() => onChange({ phones: !draft.phones })} label="Kontaktnummer" price={`${formatKronor(PHONE_ORE)} kr/nummer`} />
        <CheckOption checked={draft.emails} onChange={() => onChange({ emails: !draft.emails })} label={"E\u2011postkontakt"} price={`${formatKronor(EMAIL_ORE)} kr/adress`} />
        <CheckOption checked={draft.signatory} onChange={() => onChange({ signatory: !draft.signatory })} label="Beslutsfattare" price={`${formatKronor(SIGNATORY_ORE)} kr/nummer`} />
      </div>
    </fieldset>
  );
}

function StepFilter({ draft, onChange }: { draft: Selection; onChange: (patch: Partial<Selection>) => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Bransch", "Ort", "Län och storlek", "Bolagsform", "Tillval"];
  return (
    <div>
      <p className="text-xs font-medium text-muted">
        Steg {step + 1} av {steps.length}. {steps[step]}
      </p>
      {step === 0 ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {QUICK_BRANSCH.map((item) => (
            <button key={item.sni} type="button" onClick={() => onChange({ bransch: item.bransch, sni: item.sni, query: "" })} className="rounded-full bg-foam px-2.5 py-1 text-xs font-medium">
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {QUICK_CITIES.map((city) => (
            <button key={city} type="button" onClick={() => onChange({ city, query: "" })} className="rounded-full bg-foam px-2.5 py-1 text-xs font-medium">
              {city}
            </button>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <label className="mt-1 block text-xs">
          Län
          <select value={draft.county ?? ""} onChange={(event) => onChange({ county: event.target.value })} className="mt-1 h-9 w-full rounded-xl border border-line bg-paper px-2 text-sm">
            <option value="">Alla län</option>
            {COUNTIES.map((item) => (
              <option key={item.code} value={item.label}>{item.label}</option>
            ))}
          </select>
        </label>
      ) : null}
      {step === 3 ? (
        <div className="mt-1 grid gap-1">
          {FORM_GROUPS.map((group) => {
            const on = group.codes.every((code) => (draft.forms ?? []).includes(code));
            return (
              <label key={group.label} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    const forms = draft.forms ?? [];
                    onChange({
                      forms: on ? forms.filter((code) => !group.codes.includes(code)) : [...forms, ...group.codes.filter((code) => !forms.includes(code))],
                    });
                  }}
                />
                {group.label}
              </label>
            );
          })}
        </div>
      ) : null}
      {step === 4 ? <Tillval draft={draft} onChange={onChange} /> : null}
      <div className="mt-2 flex gap-2">
        <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="h-8 rounded-full border border-line px-3 text-xs disabled:opacity-40">
          Tillbaka
        </button>
        <button type="button" disabled={step === steps.length - 1} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} className="btn-fade-sea h-8 rounded-full bg-sea px-3 text-xs text-white disabled:opacity-40">
          Nästa
        </button>
      </div>
    </div>
  );
}

function QuestionFilter({ draft, onChange }: { draft: Selection; onChange: (patch: Partial<Selection>) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Vilken bransch ska utdraget täcka?</p>
      <div className="flex flex-wrap gap-1">
        {QUICK_BRANSCH.map((item) => (
          <button key={item.sni} type="button" onClick={() => onChange({ bransch: item.bransch, sni: item.sni, query: "" })} className={`rounded-full px-2.5 py-1 text-xs font-medium ${draft.sni === item.sni ? "btn-fade-sea text-white" : "bg-foam"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm font-medium">Var finns bolagen?</p>
      <div className="flex flex-wrap gap-1">
        {QUICK_CITIES.map((city) => (
          <button key={city} type="button" onClick={() => onChange({ city })} className={`rounded-full px-2.5 py-1 text-xs font-medium ${draft.city === city ? "btn-fade-sea text-white" : "bg-foam"}`}>
            {city}
          </button>
        ))}
      </div>
      <Tillval draft={draft} onChange={onChange} />
      <label className="block text-xs">
        Bolagsform
        <select
          className="mt-1 h-9 w-full rounded-xl border border-line bg-paper px-2 text-sm"
          value=""
          onChange={(event) => {
            const group = FORM_GROUPS.find((item) => item.label === event.target.value);
            if (!group) {
              onChange({ forms: [] });
              return;
            }
            onChange({ forms: group.codes });
          }}
        >
          <option value="">Alla bolagsformer</option>
          {FORM_GROUPS.map((group) => (
            <option key={group.label}>{group.label}</option>
          ))}
        </select>
      </label>
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
        {ready ? (
          <p className="mt-1 text-[0.68rem] leading-4 text-muted">
            {urval.phones.toLocaleString("sv-SE")} med nummer · {urval.emails.toLocaleString("sv-SE")} med e-post ·{" "}
            {urval.signatoryPhones.toLocaleString("sv-SE")} med beslutsfattare
          </p>
        ) : null}
      </div>
      {ready && urval.source === "example" ? <p className="mt-1 text-[0.68rem] leading-4 text-muted">{urval.note}</p> : null}
      {ready && urval.companies === 0 ? <ZeroHelp draft={draft} onChange={onChange} note={urval.note} /> : null}
      {ready && urval.companies > 0 ? <SimilarPicks draft={draft} onChange={onChange} /> : null}
      {chips.length > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {chips.map((chip) => (
            <li key={chip.key} className="max-w-full">
              <button
                type="button"
                onClick={() => onChange(chip.clear)}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[0.68rem] leading-4 font-medium text-ink ring-1 ring-inset ring-line"
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
            <div className="mt-1.5 flex gap-2">
              <Link href={href} className="btn-fade-sea flex h-8 flex-1 items-center justify-center rounded-full text-sm font-medium text-white">
                Förhandsboka
              </Link>
              <ShareLink />
            </div>
          ) : null}
          {counts.companies > 0 ? <PreviewRows draft={draft} /> : null}
        </div>
      ) : (
        <p className="mt-1 text-[0.68rem] leading-4 text-muted">Välj bransch eller ort så visas antal och pris.</p>
      )}
    </div>
  );
}

function ShareLink() {
  const [note, setNote] = useState("");
  return (
    <button
      type="button"
      className="h-8 rounded-full border border-line bg-paper px-3 text-xs font-medium text-ink"
      onClick={() => {
        const url = window.location.href;
        void navigator.clipboard.writeText(url).then(
          () => setNote("Länken är kopierad."),
          () => setNote(url),
        );
      }}
    >
      {note || "Dela urvalet"}
    </button>
  );
}

function PreviewRows({ draft }: { draft: Selection }) {
  const place = draft.city.trim() || "orten";
  const trade = (draft.bransch ?? "").trim() || "Bransch";
  const rows = [
    { name: `${trade.split(" ")[0]} ●●●● AB`, city: place, phone: draft.phones ? "070-●●● ●● ●●" : "—", mail: draft.emails ? "●●●@bolag.se" : "—" },
    { name: `${trade.split(" ")[0]} ●● HB`, city: place, phone: draft.phones ? "08-●●● ●● ●●" : "—", mail: draft.emails ? "●●●@bolag.se" : "—" },
  ];
  return (
    <div className="mt-1.5">
      <p className="text-[0.65rem] font-medium text-muted">Så kan en rad se ut. Uppgifterna är påhittade och maskerade.</p>
      <ul className="mt-1 space-y-1">
        {rows.map((row) => (
          <li key={row.name} className="grid grid-cols-[minmax(0,1.2fr)_auto_auto] gap-2 rounded-lg bg-paper px-2 py-1 text-[0.65rem] leading-4 text-ink">
            <span className="truncate font-medium">{row.name}</span>
            <span className="text-muted">{row.phone}</span>
            <span className="truncate text-muted">{row.mail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SimilarPicks({ draft, onChange }: { draft: Selection; onChange: (patch: Partial<Selection>) => void }) {
  const ideas = QUICK_BRANSCH.filter((item) => item.sni !== draft.sni).slice(0, 2);
  if (!draft.sni && !draft.city) return null;
  return (
    <div className="mt-1.5">
      <p className="text-[0.65rem] font-medium text-muted">Liknande urval</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {!draft.city
          ? QUICK_CITIES.map((city) => (
              <button key={city} type="button" onClick={() => onChange({ city })} className="rounded-full bg-paper px-2 py-0.5 text-[0.65rem] text-ink ring-1 ring-line">
                Samma bransch i {city}
              </button>
            ))
          : ideas.map((item) => (
              <button key={item.sni} type="button" onClick={() => onChange({ bransch: item.bransch, sni: item.sni, query: "" })} className="rounded-full bg-paper px-2 py-0.5 text-[0.65rem] text-ink ring-1 ring-line">
                {item.label} i {draft.city || "samma område"}
              </button>
            ))}
      </div>
    </div>
  );
}

function ZeroHelp({
  draft,
  onChange,
  note,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  note: string;
}) {
  return (
    <div className="mt-1.5 rounded-xl bg-paper px-2 py-1.5 text-[0.68rem] leading-4 text-ink">
      <p>{note || "Inget bolag matchar urvalet."} Prova ett bredare filter.</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {draft.county ? (
          <button type="button" className="rounded-full bg-foam px-2 py-0.5" onClick={() => onChange({ county: "" })}>
            Ta bort länet
          </button>
        ) : null}
        {draft.employees ? (
          <button type="button" className="rounded-full bg-foam px-2 py-0.5" onClick={() => onChange({ employees: "" })}>
            Alla storlekar
          </button>
        ) : null}
        {(draft.forms ?? []).length > 0 ? (
          <button type="button" className="rounded-full bg-foam px-2 py-0.5" onClick={() => onChange({ forms: [] })}>
            Alla bolagsformer
          </button>
        ) : null}
        {draft.city ? (
          <button type="button" className="rounded-full bg-foam px-2 py-0.5" onClick={() => onChange({ city: "" })}>
            Hela Sverige
          </button>
        ) : null}
      </div>
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
