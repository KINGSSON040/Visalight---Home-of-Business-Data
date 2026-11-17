"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { NewCallListForm } from "@/components/crm-call";
import { BulkBar } from "@/components/crm-bulk";
import { CompanyWarnings, OwnerChip, OwnerStar, StageChip, kundHref } from "@/components/crm-ui";
import {
  COMPANIES,
  defaultSelection,
  describeSelection,
  filterCompanies,
  legalFormLabel,
  sameSearch,
  selectionFromQuery,
  selectionToQuery,
  type Company,
  type Selection,
} from "@/lib/catalog";
import { STAGES, formatStamp, isOppClosed, outcomeLabel, useCrmStore, type Contact } from "@/lib/crm-store";

const blankSearch: Selection = {
  ...defaultSelection,
  phones: false,
  emails: false,
  signatory: false,
};

type OwnerFilter = "alla" | "lediga" | "mina" | "andras";
const PAGE = 50;

function fold(value: string): string {
  return value
    .toLocaleLowerCase("sv")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

type Matches = { rows: Company[]; reasons: Map<string, string> };

/** Registersökningen plus träffar på kontaktpersoner och telefonnummer. */
function matchCompanies(selection: Selection, contacts: Contact[]): Matches {
  const reasons = new Map<string, string>();
  const rows = filterCompanies(selection);
  const text = selection.query.trim();
  if (text.length < 2) return { rows, reasons };
  const folded = fold(text);
  const digits = text.replace(/\D/g, "");
  const inScope = new Set(filterCompanies({ ...selection, query: "" }).map((item) => item.orgNr));
  const have = new Set(rows.map((item) => item.orgNr));
  const extra: Company[] = [];
  const add = (company: Company | undefined, why: string) => {
    if (!company || !inScope.has(company.orgNr)) return;
    if (!reasons.has(company.orgNr)) reasons.set(company.orgNr, why);
    if (!have.has(company.orgNr)) {
      have.add(company.orgNr);
      extra.push(company);
    }
  };
  for (const person of contacts) {
    const full = fold(`${person.firstName} ${person.lastName} ${person.role}`);
    const nameHit = full.includes(folded);
    const phoneHit = digits.length >= 3 && person.phones.some((phone) => phone.value.replace(/\D/g, "").includes(digits));
    const mailHit = person.emails.some((mail) => fold(mail.value).includes(folded));
    if (nameHit || phoneHit || mailHit) {
      add(
        COMPANIES.find((item) => item.orgNr === person.orgNr),
        `Kontaktperson ${person.firstName} ${person.lastName}${person.role ? ` (${person.role})` : ""}${person.struck ? ", struken" : ""}`,
      );
    }
  }
  if (digits.length >= 4) {
    for (const company of COMPANIES) {
      const hit = [...company.phones, ...company.signatoryPhones].find((phone) => phone.replace(/\D/g, "").includes(digits));
      if (hit) add(company, `Nummer ${hit}`);
    }
  }
  return { rows: [...rows, ...extra], reasons };
}

export function SearchTab() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Hämtar sökningen.</p>}>
      <SearchView />
    </Suspense>
  );
}

function SearchView() {
  const params = useSearchParams();
  const store = useCrmStore();
  const [draft, setDraft] = useState<Selection>(blankSearch);
  const [applied, setApplied] = useState<Selection>(blankSearch);
  const [searched, setSearched] = useState(false);
  const [editing, setEditing] = useState(true);
  const [segmentName, setSegmentName] = useState("");
  const [segmentError, setSegmentError] = useState("");
  const [saved, setSaved] = useState("");
  const [owner, setOwner] = useState<OwnerFilter>("alla");
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [calling, setCalling] = useState(false);
  const [stageFilter, setStageFilter] = useState("alla");
  const [tagFilter, setTagFilter] = useState("alla");
  const [picked, setPicked] = useState<string[]>([]);
  const [viewName, setViewName] = useState("");

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
    setEditing(false);
  }, [params]);

  const live = useMemo(() => matchCompanies(draft, store.contacts).rows.length, [draft, store.contacts]);
  const matches = useMemo(
    () => (searched ? matchCompanies(applied, store.contacts) : { rows: [] as Company[], reasons: new Map<string, string>() }),
    [searched, applied, store.contacts],
  );

  const rows = useMemo(
    () =>
      matches.rows.filter((company) => {
        const claim = store.claims.find((item) => item.orgNr === company.orgNr);
        if (owner === "lediga" && claim) return false;
        if (owner === "mina" && claim?.userId !== store.userId) return false;
        if (owner === "andras" && (!claim || claim.userId === store.userId)) return false;
        if (phoneOnly && company.phones.length + company.signatoryPhones.length === 0) return false;
        const meta = store.metaOf(company.orgNr);
        if (stageFilter !== "alla" && meta.stage !== stageFilter) return false;
        if (tagFilter !== "alla" && !meta.tags.includes(tagFilter)) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matches.rows, owner, phoneOnly, stageFilter, tagFilter, store.claims, store.userId, store.metas],
  );

  useEffect(() => {
    setLimit(PAGE);
  }, [applied, owner, phoneOnly, stageFilter, tagFilter]);

  const dirty = searched && !sameSearch(draft, applied);

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function runSearch(next: Selection = draft) {
    setDraft(next);
    setApplied(next);
    setSearched(true);
    setEditing(false);
  }

  const allTags = [...new Set(store.metas.flatMap((item) => item.tags))];
  const myViews = store.views.filter((item) => item.scope === "sok" && !item.archived && item.userId === store.userId);

  function saveView() {
    const name = viewName.trim();
    if (name.length < 2) return;
    store.addView({ name, scope: "sok", owner, stage: stageFilter, tag: tagFilter, text: "", phoneOnly, selection: selectionToQuery(applied) });
    setViewName("");
  }

  function openView(view: (typeof myViews)[number]) {
    const selection = selectionFromQuery(new URLSearchParams(view.selection));
    setDraft(selection);
    setApplied(selection);
    setSearched(true);
    setEditing(false);
    setOwner(view.owner as OwnerFilter);
    setStageFilter(view.stage || "alla");
    setTagFilter(view.tag || "alla");
    setPhoneOnly(view.phoneOnly);
  }

  function togglePick(orgNr: string) {
    setPicked((current) => (current.includes(orgNr) ? current.filter((item) => item !== orgNr) : [...current, orgNr]));
  }

  function saveSegment() {
    const name = segmentName.trim();
    if (name.length < 2) {
      setSegmentError("Döp segmentet med minst två tecken.");
      return;
    }
    setSegmentError("");
    store.addSegment({
      name,
      query: applied.query,
      city: applied.city,
      county: applied.county ?? "",
      bransch: applied.bransch ?? "",
      sni: applied.sni,
      forms: applied.forms,
      employees: applied.employees ?? "",
    });
    setSaved(name);
    setSegmentName("");
  }

  const hint = dirty || !searched
    ? `${live.toLocaleString("sv-SE")} bolag matchar just nu. Tryck Sök bolag för att visa dem.`
    : `${matches.rows.length.toLocaleString("sv-SE")} bolag matchar.`;

  const shown = rows.slice(0, limit);

  return (
    <section>
      <h1 className="text-3xl tracking-tight">Sök &amp; segment</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Sök i hela registret på bransch, SNI, namn, ort, organisationsnummer, kontaktperson eller telefonnummer. Spara
        urvalet som ett segment, så ligger det under Mina segment. Tryck på ett bolag för att öppna dess kundkort.
      </p>

      {editing || !searched ? (
        <div className="mt-4 rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <CompanySearch
            draft={draft}
            onChange={patch}
            onSearch={() => runSearch()}
            onClear={() => patch({ query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" })}
            hint={hint}
          />
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold" aria-live="polite">
            <span className="text-lg leading-none">{live.toLocaleString("sv-SE")}</span> bolag i urvalet just nu
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-white px-4 py-3 shadow-sm">
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">Sökning:</span> {describeSelection(applied)}
            <span className="ml-2 text-muted">{matches.rows.length.toLocaleString("sv-SE")} bolag</span>
          </p>
          <button type="button" onClick={() => setEditing(true)} className="btn-fade-amber h-10 rounded-full bg-amber px-4 text-sm font-semibold text-ink">
            Ändra sökning
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(blankSearch);
              setApplied(blankSearch);
              setSearched(false);
              setEditing(true);
              setSaved("");
            }}
            className="h-10 rounded-full border border-line px-4 text-sm font-medium"
          >
            Ny sökning
          </button>
        </div>
      )}

      {searched ? (
        <>
          <div className="mt-4 rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                saveSegment();
              }}
            >
              <label className="block flex-1 text-sm">
                <span className="mb-1.5 block font-medium">Spara sökningen som segment</span>
                <input
                  value={segmentName}
                  onChange={(event) => setSegmentName(event.target.value)}
                  placeholder="Namn, till exempel Restauranger i Malmö"
                  className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
                />
              </label>
              <button type="submit" className="btn-fade-sea h-12 rounded-full bg-sea px-5 text-sm font-semibold text-white">
                Spara som segment
              </button>
              <button
                type="button"
                onClick={() => setCalling((current) => !current)}
                className="btn-fade-green h-12 rounded-full bg-green px-5 text-sm font-semibold text-white"
              >
                {calling ? "Stäng ringlista" : "Gör ringlista av urvalet"}
              </button>
            </form>
            {segmentError ? <p className="mt-2 text-sm font-medium text-rust">{segmentError}</p> : null}
            {saved ? (
              <p className="mt-2 text-sm font-medium text-green">
                Segmentet {saved} är sparat.{" "}
                <Link href="/crm/segment" className="underline">
                  Öppna Mina segment
                </Link>
              </p>
            ) : null}
            {calling ? (
              <div className="mt-4 rounded-2xl bg-foam p-4">
                <NewCallListForm fixed={{ name: segmentName.trim(), source: segmentName.trim() || "Sökurval", companies: rows }} />
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 font-semibold">Visa</span>
            {(
              [
                ["alla", "Alla"],
                ["lediga", "Lediga"],
                ["mina", "Mina"],
                ["andras", "Andras"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={owner === id}
                onClick={() => setOwner(id)}
                className={`h-9 rounded-full border px-3 font-medium ${owner === id ? "btn-fade-sea border-sea bg-sea text-white" : "border-line bg-white"}`}
              >
                {label}
              </button>
            ))}
            <label className="ml-1 inline-flex items-center gap-2">
              <input type="checkbox" checked={phoneOnly} onChange={(event) => setPhoneOnly(event.target.checked)} className="h-4 w-4 accent-[var(--sea)]" />
              Bara med nummer
            </label>
            <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} aria-label="Säljfas" className="h-9 rounded-full border border-line bg-white px-3">
              <option value="alla">Alla faser</option>
              {STAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Tagg" className="h-9 rounded-full border border-line bg-white px-3">
              <option value="alla">Alla taggar</option>
              {allTags.map((item) => (
                <option key={item} value={item}>
                  #{item}
                </option>
              ))}
            </select>
            <span className="ml-auto text-muted">{rows.length.toLocaleString("sv-SE")} visas</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={rows.length > 0 && rows.every((item) => picked.includes(item.orgNr))}
                onChange={(event) => setPicked(event.target.checked ? rows.map((item) => item.orgNr) : [])}
                className="h-4 w-4 accent-[var(--sea)]"
              />
              Markera alla {rows.length} för massåtgärd
            </label>
            <span className="ml-auto flex items-center gap-1.5">
              {myViews.map((view) => (
                <button key={view.id} type="button" onClick={() => openView(view)} className="h-8 rounded-full bg-amber-soft px-3 text-xs font-semibold ring-1 ring-amber">
                  Vy: {view.name}
                </button>
              ))}
              <input value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="Namn på vy" aria-label="Namn på vy" className="h-8 w-28 rounded-full border border-line bg-white px-3 text-xs" />
              <button type="button" onClick={saveView} className="h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold">
                Spara vy
              </button>
            </span>
          </div>
          {picked.length ? <BulkBar orgNrs={picked} label={describeSelection(applied)} onClear={() => setPicked([])} /> : null}

          <div className="mt-3">
            {rows.length === 0 ? (
              <p className="rounded-3xl border border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
                Inget bolag matchar. Prova ett förslag under fältet, rensa ett filter eller välj Alla ovan.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
                {shown.map((company) => (
                  <CompanyRow
                    key={company.orgNr}
                    company={company}
                    reason={matches.reasons.get(company.orgNr)}
                    selected={picked.includes(company.orgNr)}
                    onToggle={() => togglePick(company.orgNr)}
                  />
                ))}
              </ul>
            )}
            {rows.length > shown.length ? (
              <button
                type="button"
                onClick={() => setLimit((current) => current + PAGE)}
                className="mt-3 h-12 w-full rounded-full border border-line bg-white text-sm font-semibold"
              >
                Visa fler ({(rows.length - shown.length).toLocaleString("sv-SE")} kvar)
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

export function CompanyRow({
  company,
  reason,
  note,
  selected,
  onToggle,
}: {
  company: Company;
  reason?: string;
  note?: React.ReactNode;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const store = useCrmStore();
  const stage = store.metaOf(company.orgNr).stage;
  const opps = store.opps.filter((item) => item.orgNr === company.orgNr && !isOppClosed(item.stage)).length;
  const last = store.lastActivity(company.orgNr);
  const people = store.contacts.filter((item) => item.orgNr === company.orgNr && !item.struck).length;
  const numbers = new Set([...company.phones, ...company.signatoryPhones]).size;
  return (
    <li className={`flex items-center gap-3 px-3 py-2.5 ${selected ? "bg-foam" : ""}`}>
      {onToggle ? (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={onToggle}
          aria-label={`Markera ${company.name}`}
          className="h-5 w-5 shrink-0 accent-[var(--sea)]"
        />
      ) : null}
      <OwnerStar orgNr={company.orgNr} />
      <Link href={kundHref(company.orgNr)} className="min-w-0 flex-1 py-1">
        <span className="block font-medium">{company.name}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {company.orgNr} · {company.city} · {company.industry}
        </span>
        {reason ? <span className="mt-0.5 block text-sm font-medium text-sea">Träff: {reason}</span> : null}
        <CompanyWarnings company={company} compact />
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <StageChip stage={stage} />
          <OwnerChip orgNr={company.orgNr} />
          {opps ? <span className="rounded-full bg-green px-2 py-0.5 font-semibold text-white">{opps} möjlighet</span> : null}
          <span className="rounded-full bg-foam px-2 py-0.5">{numbers ? `${numbers} nummer` : "Inget nummer"}</span>
          {people ? <span className="rounded-full bg-foam px-2 py-0.5">{people} kontakt{people === 1 ? "" : "er"}</span> : null}
          {last ? (
            <span className="rounded-full bg-foam px-2 py-0.5">
              {outcomeLabel(last.outcome)} · {formatStamp(last.at)}
            </span>
          ) : null}
          {note}
        </span>
      </Link>
      <span className="hidden shrink-0 rounded-full bg-paper px-2 py-0.5 text-xs sm:inline">{legalFormLabel(company.form)}</span>
      <Link href={kundHref(company.orgNr)} className="hidden h-10 shrink-0 items-center rounded-full border border-line px-4 text-sm font-semibold text-sea hover:bg-foam md:inline-flex">
        Öppna kundkort
      </Link>
    </li>
  );
}
