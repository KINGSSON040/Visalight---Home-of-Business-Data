"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { CrmCard } from "@/components/crm-card";
import { NewCallListForm, selectionFromSegment } from "@/components/crm-call";
import { HistoryRow } from "@/components/crm-log";
import { OwnerChip, OwnerStar, Panel } from "@/components/crm-ui";
import { CrmWorkspace } from "@/components/crm-workspace";
import {
  COMPANIES,
  defaultSelection,
  filterCompanies,
  describeSelection,
  legalFormLabel,
  sameSearch,
  selectionFromQuery,
  selectionToQuery,
  type Company,
  type Selection,
} from "@/lib/catalog";
import { STAFF, formatStamp, outcomeLabel, useCrmStore, type Segment } from "@/lib/crm-store";

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

export function CrmDesk() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Hämtar CRM:et.</p>}>
      <Desk />
    </Suspense>
  );
}

function Desk() {
  const params = useSearchParams();
  const view = params.get("vy");
  if (view === "mina") return <MineView selected={params.get("bolag") ?? ""} />;
  if (view === "segment") return <SegmentView />;
  if (view === "aktivitet") return <ActivityView />;
  return <SearchView />;
}

function PageHead({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h1 className="text-3xl tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{intro}</p>
    </>
  );
}

function MineView({ selected }: { selected: string }) {
  const store = useCrmStore();
  const mine = store.claims.filter((claim) => claim.userId === store.userId);
  const chosen =
    COMPANIES.find((item) => item.orgNr === selected) ??
    COMPANIES.find((item) => item.orgNr === mine[0]?.orgNr) ??
    null;
  return (
    <CrmWorkspace selected={chosen?.orgNr} hrefFor={(orgNr) => `/crm?vy=mina&bolag=${encodeURIComponent(orgNr)}`}>
      {chosen ? (
        <CrmCard company={chosen} embedded key={chosen.orgNr} />
      ) : (
        <div>
          <h1 className="text-3xl tracking-tight">Kundkort</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Inga stjärnor ännu. Sök fram ett bolag och tryck på stjärnan, så hamnar det i Mina företag och öppnas här.
          </p>
          <Link href="/crm" className="btn-fade-amber mt-4 inline-flex h-12 items-center rounded-full bg-amber px-5 font-semibold text-ink">
            Sök bolag
          </Link>
        </div>
      )}
    </CrmWorkspace>
  );
}

function SearchView() {
  const params = useSearchParams();
  const store = useCrmStore();
  const [draft, setDraft] = useState<Selection>(blankSearch);
  const [applied, setApplied] = useState<Selection>(blankSearch);
  const [searched, setSearched] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [segmentError, setSegmentError] = useState("");
  const [saved, setSaved] = useState("");
  const [owner, setOwner] = useState<OwnerFilter>("alla");
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [calling, setCalling] = useState(false);
  const [editing, setEditing] = useState(true);

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

  const matches = useMemo(() => {
    if (!searched) return { rows: [] as Company[], reasons: new Map<string, string>() };
    const reasons = new Map<string, string>();
    const rows = filterCompanies(applied);
    const text = applied.query.trim();
    if (text.length >= 2) {
      const folded = fold(text);
      const digits = text.replace(/\D/g, "");
      const inScope = new Set(filterCompanies({ ...applied, query: "" }).map((item) => item.orgNr));
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
      for (const person of store.contacts) {
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
      rows.push(...extra);
    }
    return { rows, reasons };
  }, [searched, applied, store.contacts]);

  const rows = useMemo(
    () =>
      matches.rows.filter((company) => {
        const claim = store.claims.find((item) => item.orgNr === company.orgNr);
        if (owner === "lediga" && claim) return false;
        if (owner === "mina" && claim?.userId !== store.userId) return false;
        if (owner === "andras" && (!claim || claim.userId === store.userId)) return false;
        if (phoneOnly && company.phones.length + company.signatoryPhones.length === 0) return false;
        return true;
      }),
    [matches.rows, owner, phoneOnly, store.claims, store.userId],
  );

  useEffect(() => {
    setLimit(PAGE);
  }, [applied, owner, phoneOnly]);

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

  function saveSegment() {
    const name = segmentName.trim();
    if (name.length < 2) {
      setSegmentError("Döp segmentet med minst två tecken.");
      return;
    }
    setSegmentError("");
    store.addSegment({
      name,
      query: draft.query,
      city: draft.city,
      county: draft.county ?? "",
      bransch: draft.bransch ?? "",
      sni: draft.sni,
      forms: draft.forms,
      employees: draft.employees ?? "",
    });
    setSaved(`Segmentet ${name} är sparat. Du hittar det under Segment och kan göra en ringlista av det.`);
    setSegmentName("");
    runSearch(draft);
  }

  const hint = !searched
    ? "Skriv vad du vill, till exempel bagerier, 56110 eller ett namn, och tryck Sök bolag. Förslagen kommer medan du skriver."
    : dirty
      ? "Filtren är ändrade. Tryck Sök bolag för att uppdatera listan."
      : `${matches.rows.length.toLocaleString("sv-SE")} exempelbolag matchar.`;

  const shown = rows.slice(0, limit);

  return (
    <section id="sok">
      <PageHead
        title="Sök bolag"
        intro="Sök i hela registret på bransch, SNI, namn, ort, organisationsnummer, kontaktperson eller telefonnummer. Stjärnan lägger bolaget i Mina företag. Tryck på raden för att öppna kundkortet."
      />
      {editing || !searched ? (
        <div className="mt-4 rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <CompanySearch
            draft={draft}
            onChange={patch}
            onSearch={() => runSearch()}
            onClear={() => patch({ query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "" })}
            hint={hint}
          />
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
            <div className="flex flex-wrap items-center gap-2 text-sm">
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
                  className={`h-9 rounded-full border px-3 font-medium ${owner === id ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
                >
                  {label}
                </button>
              ))}
              <label className="ml-1 inline-flex items-center gap-2">
                <input type="checkbox" checked={phoneOnly} onChange={(event) => setPhoneOnly(event.target.checked)} className="h-4 w-4 accent-[var(--sea)]" />
                Bara med nummer
              </label>
              <span className="ml-auto text-muted">{rows.length.toLocaleString("sv-SE")} visas</span>
            </div>

            <form
              className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                saveSegment();
              }}
            >
              <label className="block flex-1 text-sm">
                <span className="mb-1.5 block font-medium">Spara urvalet som segment</span>
                <input
                  value={segmentName}
                  onChange={(event) => setSegmentName(event.target.value)}
                  placeholder="Till exempel restauranger i Malmö"
                  className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
                />
              </label>
              <button type="submit" className="btn-fade-sea h-12 rounded-full bg-sea px-5 text-sm font-semibold text-white">
                Spara segment
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
            {saved ? <p className="mt-2 text-sm font-medium text-green">{saved}</p> : null}
            {calling ? (
              <div className="mt-4 rounded-2xl bg-foam p-4">
                <NewCallListForm
                  fixed={{ name: segmentName.trim(), source: segmentName.trim() || "Sökurval", companies: rows }}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            {rows.length === 0 ? (
              <p className="rounded-3xl border border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
                Inget bolag matchar. Prova ett förslag under fältet, rensa ett filter eller välj Alla ovan.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
                {shown.map((company) => (
                  <CompanyRow key={company.orgNr} company={company} reason={matches.reasons.get(company.orgNr)} />
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
      ) : (
        <MyDay />
      )}
    </section>
  );
}

function MyDay() {
  const store = useCrmStore();
  const mine = store.claims.filter((claim) => claim.userId === store.userId).length;
  const tasks = store.openTasks(store.userId);
  const now = new Date().toISOString();
  const late = tasks.filter((task) => task.nextAt < now).length;
  const running = store.callLists.filter((item) => !item.archived && item.orgNrs.some((org) => !item.results[org])).length;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <Stat href="/crm?vy=mina" label="Mina företag" value={mine} tone="bg-amber-soft" />
      <Stat href="/crm?vy=aktivitet" label="Uppföljningar att göra" value={tasks.length} note={late ? `${late} försenade` : undefined} tone="bg-foam" />
      <Stat href="/crm/ring" label="Pågående ringlistor" value={running} tone="bg-green-soft" />
      {tasks.length ? (
        <div className="sm:col-span-3">
          <h2 className="text-xl tracking-tight">Näst på tur</h2>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id}>
                <Link href={`/crm/bolag/${encodeURIComponent(task.orgNr)}`} className="flex items-center justify-between gap-3 px-3 py-3">
                  <span>
                    <span className="block font-medium">{task.companyName}</span>
                    <span className="text-sm text-muted">{task.nextNote || outcomeLabel(task.outcome)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${task.nextAt < now ? "bg-rust text-white" : "bg-amber text-ink"}`}>
                    {formatStamp(task.nextAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ href, label, value, note, tone }: { href: string; label: string; value: number; note?: string; tone: string }) {
  return (
    <Link href={href} className={`rounded-3xl border border-line p-4 shadow-sm ${tone}`}>
      <span className="block text-3xl font-semibold tracking-tight">{value}</span>
      <span className="mt-1 block text-sm font-medium">{label}</span>
      {note ? <span className="mt-0.5 block text-xs font-semibold text-rust">{note}</span> : null}
    </Link>
  );
}

function CompanyRow({ company, reason }: { company: Company; reason?: string }) {
  const store = useCrmStore();
  const last = store.lastActivity(company.orgNr);
  const people = store.contacts.filter((item) => item.orgNr === company.orgNr && !item.struck).length;
  const numbers = new Set([...company.phones, ...company.signatoryPhones]).size;
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <OwnerStar orgNr={company.orgNr} />
      <Link href={`/crm/bolag/${encodeURIComponent(company.orgNr)}`} className="min-w-0 flex-1 py-1">
        <span className="block font-medium">{company.name}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {company.orgNr} · {company.city} · {company.industry}
        </span>
        {reason ? <span className="mt-0.5 block text-sm font-medium text-sea">Träff: {reason}</span> : null}
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <OwnerChip orgNr={company.orgNr} />
          <span className="rounded-full bg-foam px-2 py-0.5">{numbers ? `${numbers} nummer` : "Inget nummer"}</span>
          {people ? <span className="rounded-full bg-foam px-2 py-0.5">{people} kontakt{people === 1 ? "" : "er"}</span> : null}
          {last ? (
            <span className="rounded-full bg-foam px-2 py-0.5">
              {outcomeLabel(last.outcome)} · {formatStamp(last.at)}
            </span>
          ) : null}
        </span>
      </Link>
      <span className="hidden shrink-0 rounded-full bg-paper px-2 py-0.5 text-xs sm:inline">{legalFormLabel(company.form)}</span>
    </li>
  );
}

function SegmentView() {
  const store = useCrmStore();
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState("");
  const list = store.segments.filter((item) => showArchived || !item.archived);
  const archived = store.segments.filter((item) => item.archived).length;

  return (
    <section>
      <PageHead
        title="Segment"
        intro="Ett segment är ett sparat urval. Öppna det för att se bolagen, eller gör en ringlista av det. Segment arkiveras och kan återställas, de raderas inte."
      />
      {list.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-line bg-white px-4 py-8 text-sm text-muted">
          Inga sparade segment ännu. Sök bolag och spara urvalet som segment.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((segment) => {
            const count = filterCompanies(selectionFromSegment(segment)).length;
            return (
              <li key={segment.id} className={`rounded-3xl border border-line bg-white p-4 shadow-sm ${segment.archived ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{segment.name}</p>
                    <p className="text-sm text-muted">{segmentSummary(segment)}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {count.toLocaleString("sv-SE")} bolag{segment.createdAt ? ` · sparat ${formatStamp(segment.createdAt)}` : ""}
                      {segment.createdBy ? ` av ${segment.createdBy}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Link href={`/crm?${selectionToQuery(selectionFromSegment(segment))}`} className="btn-fade-sea inline-flex h-10 items-center rounded-full bg-sea px-4 font-semibold text-white">
                      Öppna urval
                    </Link>
                    {segment.archived ? null : (
                      <button
                        type="button"
                        onClick={() => setOpen(open === segment.id ? "" : segment.id)}
                        className="btn-fade-green h-10 rounded-full bg-green px-4 font-semibold text-white"
                      >
                        Ringlista
                      </button>
                    )}
                    <button type="button" className="text-muted underline" onClick={() => store.setSegmentArchived(segment.id, !segment.archived)}>
                      {segment.archived ? "Återställ" : "Arkivera"}
                    </button>
                  </div>
                </div>
                {open === segment.id ? (
                  <div className="mt-4 rounded-2xl bg-foam p-4">
                    <NewCallListForm
                      fixed={{ name: segment.name, source: segment.name, companies: filterCompanies(selectionFromSegment(segment)) }}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {archived ? (
        <button type="button" className="mt-3 text-sm font-medium text-sea" onClick={() => setShowArchived((current) => !current)}>
          {showArchived ? "Dölj arkiverade" : `Visa arkiverade (${archived})`}
        </button>
      ) : null}
    </section>
  );
}

function ActivityView() {
  const store = useCrmStore();
  const [who, setWho] = useState<"alla" | string>("alla");
  const [tasksFor, setTasksFor] = useState<"mina" | "alla">("mina");
  const now = new Date().toISOString();
  const tasks = store.openTasks(tasksFor === "mina" ? store.userId : undefined);
  const entries = [...store.activities]
    .filter((item) => who === "alla" || item.userId === who)
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section>
      <PageHead
        title="Aktivitet"
        intro="Det som är planerat och det som är gjort. Allt har datum, klockslag och säljare, och inget kan raderas."
      />

      <Panel
        title={`Att göra · ${tasks.length}`}
        intro="Planerade uppföljningar, äldst först. De försvinner när en nyare aktivitet loggas på bolaget."
        aside={
          <div className="flex gap-1 rounded-full bg-foam p-1 text-sm font-medium">
            {(["mina", "alla"] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={tasksFor === id}
                onClick={() => setTasksFor(id)}
                className={`h-8 rounded-full px-3 ${tasksFor === id ? "bg-sea text-white" : ""}`}
              >
                {id === "mina" ? "Mina" : "Alla"}
              </button>
            ))}
          </div>
        }
      >
        {tasks.length === 0 ? <p className="mt-3 text-sm text-muted">Inget planerat. Sätt en tid under Nästa aktivitet när du loggar ett samtal.</p> : null}
        <ul className="mt-3 space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={`/crm/bolag/${encodeURIComponent(task.orgNr)}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-3">
                <span>
                  <span className="block font-medium">{task.companyName}</span>
                  <span className="text-sm text-muted">
                    {task.nextNote || "Uppföljning"} · {task.userName}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${task.nextAt < now ? "bg-rust text-white" : "bg-amber text-ink"}`}>
                  {task.nextAt < now ? "Försenad " : ""}
                  {formatStamp(task.nextAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Logg"
        aside={
          <select
            value={who}
            onChange={(event) => setWho(event.target.value)}
            aria-label="Säljare"
            className="h-10 rounded-xl border border-line bg-paper px-2 text-sm"
          >
            <option value="alla">Alla säljare</option>
            {STAFF.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        }
      >
        {entries.length === 0 ? <p className="mt-3 text-sm text-muted">Ingen aktivitet ännu.</p> : null}
        <div className="mt-3 space-y-2">
          {entries.map((entry) => (
            <div key={entry.id}>
              <Link href={`/crm/bolag/${encodeURIComponent(entry.orgNr)}`} className="mb-0.5 block text-sm font-semibold text-sea">
                {entry.companyName}
              </Link>
              <ul>
                <HistoryRow entry={entry} />
              </ul>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function segmentSummary(segment: Segment): string {
  const forms = segment.forms.map(legalFormLabel);
  return [
    segment.query ? `”${segment.query}”` : "",
    segment.city || segment.county || "Alla områden",
    segment.bransch || "Alla branscher",
    forms.join(", ") || "Alla bolagsformer",
    segment.employees ? `${segment.employees} anställda` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
