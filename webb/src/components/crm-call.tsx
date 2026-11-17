"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CrmCard } from "@/components/crm-card";
import { CrmWorkspace } from "@/components/crm-workspace";
import { OwnerChip, Panel } from "@/components/crm-ui";
import {
  COMPANIES,
  defaultSelection,
  filterCompanies,
  type Company,
  type Selection,
} from "@/lib/catalog";
import { formatStamp, outcomeInfo, useCrmStore, type CallList, type Segment } from "@/lib/crm-store";

export function selectionFromSegment(segment: Segment): Selection {
  return {
    ...defaultSelection,
    phones: false,
    emails: false,
    signatory: false,
    query: segment.query,
    city: segment.city,
    county: segment.county,
    bransch: segment.bransch,
    sni: segment.sni,
    forms: segment.forms,
    employees: segment.employees,
  };
}

export function ColdCall({ listId }: { listId: string }) {
  const store = useCrmStore();
  const list = store.callLists.find((item) => item.id === listId) ?? null;
  if (!listId || !list) return <ListOverview missing={Boolean(listId)} />;
  return <ListRun list={list} />;
}

type Source = "segment" | "mina" | "uppfoljning";

function useBuilder() {
  const store = useCrmStore();
  return (companies: Company[], opts: { phoneOnly: boolean; skipOwned: boolean; untouched: boolean }) =>
    companies.filter((company) => {
      if (opts.phoneOnly) {
        const own = company.phones.length + company.signatoryPhones.length > 0;
        const viaPerson = store.contacts.some(
          (item) => item.orgNr === company.orgNr && !item.struck && item.phones.some((phone) => !phone.struck),
        );
        if (!own && !viaPerson) return false;
      }
      if (opts.skipOwned) {
        const claim = store.claims.find((item) => item.orgNr === company.orgNr);
        if (claim && claim.userId !== store.userId) return false;
      }
      if (opts.untouched && store.lastActivity(company.orgNr)) return false;
      return true;
    });
}

export function NewCallListForm({
  fixed,
  onCreated,
}: {
  fixed?: { name: string; source: string; companies: Company[] };
  onCreated?: (id: string) => void;
}) {
  const store = useCrmStore();
  const router = useRouter();
  const build = useBuilder();
  const segments = store.segments.filter((item) => !item.archived);
  const [source, setSource] = useState<Source>("segment");
  const [segmentId, setSegmentId] = useState("");
  const [name, setName] = useState(fixed?.name ?? "");
  const [phoneOnly, setPhoneOnly] = useState(true);
  const [skipOwned, setSkipOwned] = useState(true);
  const [untouched, setUntouched] = useState(false);
  const [error, setError] = useState("");

  const chosenSegment = segments.find((item) => item.id === segmentId) ?? segments[0] ?? null;

  const base = useMemo(() => {
    if (fixed) return fixed.companies;
    if (source === "mina") {
      return store.claims
        .filter((claim) => claim.userId === store.userId)
        .flatMap((claim) => COMPANIES.filter((item) => item.orgNr === claim.orgNr));
    }
    if (source === "uppfoljning") {
      const due = new Set(store.openTasks(store.userId).map((item) => item.orgNr));
      return COMPANIES.filter((item) => due.has(item.orgNr));
    }
    return chosenSegment ? filterCompanies(selectionFromSegment(chosenSegment)) : [];
  }, [fixed, source, chosenSegment, store]);

  const queue = build(base, { phoneOnly, skipOwned, untouched });
  const sourceLabel = fixed?.source ?? (source === "mina" ? "Mina företag" : source === "uppfoljning" ? "Uppföljningar" : chosenSegment?.name ?? "");

  function create() {
    const finalName = name.trim() || (fixed ? "" : sourceLabel);
    if (finalName.length < 2) {
      setError("Döp ringlistan med minst två tecken.");
      return;
    }
    if (queue.length === 0) {
      setError("Inget bolag uppfyller valen. Ändra något av alternativen.");
      return;
    }
    setError("");
    const id = store.createCallList({ name: finalName, source: sourceLabel, orgNrs: queue.map((item) => item.orgNr) });
    onCreated?.(id);
    router.push(`/crm/ring?lista=${id}`);
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
      {fixed ? null : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Bolagen kommer från</span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as Source)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3"
            >
              <option value="segment">Ett sparat segment</option>
              <option value="mina">Mina företag</option>
              <option value="uppfoljning">Mina uppföljningar</option>
            </select>
          </label>
          {source === "segment" ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Segment</span>
              <select
                value={chosenSegment?.id ?? ""}
                onChange={(event) => setSegmentId(event.target.value)}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3"
                disabled={segments.length === 0}
              >
                {segments.length === 0 ? <option value="">Inga segment ännu</option> : null}
                {segments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Namn på ringlistan</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={sourceLabel || "Till exempel Bagerier i Skåne, vecka 47"}
          className="h-12 w-full rounded-xl border border-line bg-paper px-3"
        />
      </label>

      <fieldset className="grid gap-2 text-sm">
        <legend className="mb-1 font-medium">Vilka bolag ska med?</legend>
        <Check checked={phoneOnly} onChange={setPhoneOnly} label="Bara bolag som har ett nummer" />
        <Check checked={skipOwned} onChange={setSkipOwned} label="Hoppa över bolag som en annan säljare redan bearbetar" />
        <Check checked={untouched} onChange={setUntouched} label="Bara bolag som aldrig har kontaktats" />
      </fieldset>

      <p className="rounded-2xl bg-foam px-3 py-2 text-sm font-medium">
        {queue.length.toLocaleString("sv-SE")} av {base.length.toLocaleString("sv-SE")} bolag hamnar i listan.
      </p>
      {error ? <p className="text-sm font-medium text-rust">{error}</p> : null}
      <button type="submit" className="h-12 rounded-full bg-green font-semibold text-white">
        Skapa ringlista och börja ringa
      </button>
    </form>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-2.5">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--sea)]" />
      <span>{label}</span>
    </label>
  );
}

function ListOverview({ missing }: { missing: boolean }) {
  const store = useCrmStore();
  const [showArchived, setShowArchived] = useState(false);
  const lists = store.callLists.filter((item) => showArchived || !item.archived);
  const archivedCount = store.callLists.filter((item) => item.archived).length;

  return (
    <section>
      <h1 className="text-3xl tracking-tight">Ringlistor</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        En ringlista tar ett segment och visar bolagen ett i taget. Efter varje samtal väljer du utfall, skriver en
        anteckning och sätter tid för nästa försök, och nästa bolag kommer.
      </p>
      {missing ? <p className="mt-3 rounded-2xl bg-amber-soft px-3 py-2 text-sm">Ringlistan hittades inte.</p> : null}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-xl tracking-tight">Dina och teamets listor</h2>
          {lists.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
              Inga ringlistor ännu. Skapa en till höger, eller spara ett segment under Sök bolag först.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {lists.map((item) => (
                <ListCard key={item.id} list={item} />
              ))}
            </ul>
          )}
          {archivedCount ? (
            <button type="button" className="mt-3 text-sm font-medium text-sea" onClick={() => setShowArchived((current) => !current)}>
              {showArchived ? "Dölj arkiverade" : `Visa arkiverade (${archivedCount})`}
            </button>
          ) : null}
        </div>
        <Panel title="Ny ringlista" intro="Välj var bolagen kommer ifrån och vilka som ska med.">
          <div className="mt-3">
            <NewCallListForm />
          </div>
        </Panel>
      </div>
    </section>
  );
}

function ListCard({ list }: { list: CallList }) {
  const store = useCrmStore();
  const done = list.orgNrs.filter((org) => list.results[org]).length;
  const percent = Math.round((done / Math.max(1, list.orgNrs.length)) * 100);
  return (
    <li className={`rounded-2xl border border-line bg-white p-4 shadow-sm ${list.archived ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{list.name}</p>
          <p className="text-sm text-muted">
            {list.source} · skapad {formatStamp(list.createdAt)} av {list.createdBy}
          </p>
        </div>
        <span className="rounded-full bg-foam px-2.5 py-1 text-xs font-semibold">
          {done}/{list.orgNrs.length}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-foam" aria-hidden="true">
        <div className="h-full rounded-full bg-green" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm">
        <Link href={`/crm/ring?lista=${list.id}`} className="inline-flex h-10 items-center rounded-full bg-green px-4 font-semibold text-white">
          {done === 0 ? "Börja ringa" : done >= list.orgNrs.length ? "Öppna" : "Fortsätt ringa"}
        </Link>
        <button type="button" className="text-muted underline" onClick={() => store.setCallListArchived(list.id, !list.archived)}>
          {list.archived ? "Återställ" : "Arkivera"}
        </button>
      </div>
    </li>
  );
}

function ListRun({ list }: { list: CallList }) {
  const store = useCrmStore();
  const [picked, setPicked] = useState("");
  const done = list.orgNrs.filter((org) => list.results[org]).length;
  const pending = list.orgNrs.filter((org) => !list.results[org]);
  const skipped = list.orgNrs.filter((org) => list.results[org]?.outcome === "hoppade");
  const currentOrg = picked && list.orgNrs.includes(picked) ? picked : pending[0];
  const current = COMPANIES.find((item) => item.orgNr === currentOrg) ?? null;

  const rail = (
    <section>
      <Link href="/crm/ring" className="text-sm font-medium text-sea">
        Alla ringlistor
      </Link>
      <h2 className="mt-2 text-xl tracking-tight">{list.name}</h2>
      <p className="mt-1 text-sm text-muted">
        {done} av {list.orgNrs.length} klara · {pending.length} kvar
      </p>
      <Tally list={list} />
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {list.orgNrs.map((org) => {
          const company = COMPANIES.find((item) => item.orgNr === org);
          if (!company) return null;
          const result = list.results[org];
          const info = result && result.outcome !== "hoppade" ? outcomeInfo(result.outcome) : null;
          const active = org === currentOrg;
          return (
            <li key={org}>
              <button
                type="button"
                onClick={() => setPicked(org)}
                className={`block w-full border-l-4 px-3 py-2.5 text-left ${active ? "border-amber bg-amber-soft" : "border-transparent bg-white hover:bg-paper"}`}
              >
                <span className={`block text-sm font-medium ${result ? "text-muted" : ""}`}>{company.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  {company.city}
                  {result ? (
                    <span className="rounded-full bg-foam px-1.5 py-0.5 font-medium text-ink">
                      {result.outcome === "hoppade" ? "Hoppade över" : info?.short ?? result.outcome}
                    </span>
                  ) : null}
                  <OwnerChip orgNr={org} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  if (!current) {
    return (
      <CrmWorkspace rail={rail}>
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-3xl tracking-tight">Listan är genomgången</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {list.name}. Alla {list.orgNrs.length} bolag har fått ett utfall i loggen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {skipped.length ? (
              <button
                type="button"
                className="h-12 rounded-full bg-amber px-5 font-semibold text-ink"
                onClick={() => store.reopenSkipped(list.id)}
              >
                Ring de {skipped.length} som hoppades över
              </button>
            ) : null}
            <button type="button" className="h-12 rounded-full bg-sea px-5 font-semibold text-white" onClick={() => store.restartCallList(list.id)}>
              Börja om från första bolaget
            </button>
            <Link href="/crm?vy=aktivitet" className="inline-flex h-12 items-center rounded-full border border-line px-5 text-sm font-medium">
              Se aktivitetsloggen
            </Link>
          </div>
        </section>
      </CrmWorkspace>
    );
  }

  return (
    <CrmWorkspace rail={rail}>
      <CrmCard
        key={current.orgNr}
        company={current}
        focus={{
          index: done,
          total: list.orgNrs.length,
          listName: list.name,
          onSaved: (outcome) => {
            store.recordCallResult(list.id, current.orgNr, outcome);
            setPicked("");
            window.scrollTo({ top: 0 });
          },
          onSkip: () => {
            store.recordCallResult(list.id, current.orgNr, "hoppade");
            setPicked("");
            window.scrollTo({ top: 0 });
          },
        }}
      />
    </CrmWorkspace>
  );
}

function Tally({ list }: { list: CallList }) {
  const counts = new Map<string, number>();
  for (const org of list.orgNrs) {
    const result = list.results[org];
    if (!result) continue;
    counts.set(result.outcome, (counts.get(result.outcome) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return (
    <p className="mt-2 flex flex-wrap gap-1.5">
      {[...counts.entries()].map(([id, count]) => (
        <span key={id} className="rounded-full bg-foam px-2 py-0.5 text-xs font-medium">
          {id === "hoppade" ? "Hoppade över" : outcomeInfo(id)?.short ?? id} {count}
        </span>
      ))}
    </p>
  );
}
