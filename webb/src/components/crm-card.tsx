"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Contacts } from "@/components/crm-contacts";
import { TemplateDrafts } from "@/components/crm-drafts";
import { History, LogPanel, isStruck } from "@/components/crm-log";
import { OpportunitiesPanel } from "@/components/crm-opps";
import {
  BackLink,
  CompanyWarnings,
  Field,
  OwnerChip,
  OwnerStar,
  Panel,
  StageChip,
  kundHref,
  telHref,
  useOwner,
} from "@/components/crm-ui";
import { COMPANIES, legalFormLabel, type Company } from "@/lib/catalog";
import {
  FLAGS,
  STAFF,
  STAGES,
  TASK_KINDS,
  formatStamp,
  isOppClosed,
  laterTodayLocal,
  localInputToIso,
  nextWeekLocal,
  normalizeName,
  outcomeLabel,
  digitsOf,
  readPurchases,
  segmentCompanies,
  stageInfo,
  tomorrowMorningLocal,
  useCrmStore,
  type FlagId,
  type OutcomeId,
  type Purchase,
  type StageId,
  type Task,
} from "@/lib/crm-store";

export type FocusMode = {
  index: number;
  total: number;
  listName: string;
  onSaved: (outcome: OutcomeId) => void;
  onSkip: () => void;
};

export function CrmCard({ company, focus }: { company: Company; focus?: FocusMode }) {
  const store = useCrmStore();
  const { claim, taken } = useOwner(company.orgNr);
  const log = store.activities.filter((item) => item.orgNr === company.orgNr);
  const last = store.lastActivity(company.orgNr);
  const meta = store.metaOf(company.orgNr);
  const openOpps = store.opps.filter((item) => item.orgNr === company.orgNr && !isOppClosed(item.stage));
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    setPurchases(readPurchases(company.orgNr));
  }, [company.orgNr]);

  return (
    <article>
      {focus ? (
        <div className="btn-fade-sea mt-1 rounded-2xl bg-sea px-4 py-3 text-white">
          <p className="text-sm font-semibold">
            Bolag {Math.min(focus.index + 1, focus.total)} av {focus.total} · {focus.listName}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/30" aria-hidden="true">
            <div className="btn-fade-amber h-full rounded-full bg-amber" style={{ width: `${(focus.index / Math.max(1, focus.total)) * 100}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <BackLink fallback="/crm/kunder" label="Tillbaka" />
          <Link href="/crm/kunder" className="text-sm font-medium text-sea">
            Mina kunder
          </Link>
          <Link href="/crm/sok" className="text-sm font-medium text-sea">
            Sök & segment
          </Link>
        </div>
      )}

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Kundkort</p>
          <h1 className="mt-1 text-3xl tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {company.orgNr} · {legalFormLabel(company.form)} · {company.city}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StageChip stage={meta.stage} />
            <OwnerChip orgNr={company.orgNr} />
            {openOpps.length ? (
              <a href="#mojligheter" className="rounded-full bg-green px-2.5 py-0.5 text-xs font-semibold text-white">
                {openOpps.length} öppen möjlighet
              </a>
            ) : null}
            {meta.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-sea/10 px-2 py-0.5 text-xs font-semibold text-sea">
                #{tag}
              </span>
            ))}
            {last ? (
              <span className="rounded-full bg-foam px-2 py-0.5 text-xs font-medium">
                Senast: {outcomeLabel(last.outcome)} · {formatStamp(last.at)}
              </span>
            ) : (
              <span className="rounded-full bg-foam px-2 py-0.5 text-xs font-medium">Aldrig kontaktat</span>
            )}
          </div>
        </div>
        <OwnerStar orgNr={company.orgNr} size="lg" />
      </header>

      <CompanyWarnings company={company} />

      {taken && claim ? (
        <p className="mt-3 rounded-2xl bg-rust/10 px-3 py-2 text-sm leading-6">
          {claim.userName} bearbetar bolaget sedan {formatStamp(claim.at)}. Hör av dig till {claim.userName} innan du kontaktar det.
        </p>
      ) : null}
      <DuplicateWarning company={company} />
      <DueBanner orgNr={company.orgNr} />

      {focus ? (
        <>
          <Numbers company={company} big />
          <LogPanel company={company} focus={{ onSaved: focus.onSaved, onSkip: focus.onSkip }} />
          <Contacts orgNr={company.orgNr} />
          <OpportunitiesPanel orgNr={company.orgNr} />
          <TasksPanel orgNr={company.orgNr} />
          <About company={company} />
          <History entries={log} />
          <Purchases purchases={purchases} />
        </>
      ) : (
        <div className="mt-2 grid items-start gap-x-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            <Numbers company={company} big={false} />
            <OpportunitiesPanel orgNr={company.orgNr} />
            <TasksPanel orgNr={company.orgNr} />
            <Contacts orgNr={company.orgNr} />
            <LogPanel company={company} />
            <TemplateDrafts company={company} />
            <History entries={log} />
          </div>
          <div className="min-w-0">
            <Owner company={company} />
            <StatusPanel company={company} />
            <About company={company} />
            <Membership company={company} />
            <Purchases purchases={purchases} />
          </div>
        </div>
      )}
    </article>
  );
}

function DuplicateWarning({ company }: { company: Company }) {
  const key = normalizeName(company.name);
  const phones = new Set([...company.phones, ...company.signatoryPhones].map(digitsOf).filter(Boolean));
  const similar = COMPANIES.filter((item) => {
    if (item.orgNr === company.orgNr) return false;
    if (normalizeName(item.name) === key) return true;
    return [...item.phones, ...item.signatoryPhones].some((value) => phones.has(digitsOf(value)));
  });
  if (similar.length === 0) return null;
  return (
    <p className="mt-3 rounded-2xl border-2 border-amber bg-amber-soft px-3 py-2 text-sm leading-6">
      <span className="font-semibold">Möjlig dubblett:</span> liknande bolag eller delat telefonnummer med{" "}
      {similar.map((item, index) => (
        <span key={item.orgNr}>
          {index ? ", " : ""}
          <Link href={kundHref(item.orgNr)} className="font-semibold text-sea underline">
            {item.name}
          </Link>
        </span>
      ))}
      . Kontrollera innan du ringer.
    </p>
  );
}

function DueBanner({ orgNr }: { orgNr: string }) {
  const store = useCrmStore();
  const due = store.openTasks().filter((item) => item.orgNr === orgNr && new Date(item.dueAt).getTime() <= store.now);
  if (due.length === 0) return null;
  return (
    <p className="mt-3 rounded-2xl bg-rust px-3 py-2 text-sm font-semibold leading-6 text-white">
      {due.length === 1 ? "En uppgift är förfallen" : `${due.length} uppgifter är förfallna`}: {due[0].note || "Uppföljning"} ({formatStamp(due[0].dueAt)}, {due[0].assigneeName})
    </p>
  );
}

export function TaskRow({ task, showCompany = false }: { task: Task; showCompany?: boolean }) {
  const store = useCrmStore();
  const overdue = !task.doneAt && new Date(task.dueAt).getTime() < store.now;
  const kind = TASK_KINDS.find((item) => item.id === task.kind)?.label ?? "";
  return (
    <li className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-sm ${overdue ? "bg-rust/10 ring-1 ring-rust" : "bg-paper"}`}>
      <div className="min-w-0">
        <p className={`font-medium ${task.doneAt ? "line-through opacity-70" : ""}`}>
          {kind} · {formatStamp(task.dueAt)}
          {task.note ? ` · ${task.note}` : ""}
        </p>
        <p className="text-xs text-muted">
          {showCompany ? (
            <Link href={kundHref(task.orgNr)} className="font-semibold text-sea hover:underline">
              {task.companyName}
            </Link>
          ) : null}
          {showCompany ? " · " : ""}
          {task.assigneeName}
          {task.contactName ? ` · ${task.contactName}` : ""}
          {overdue ? " · förfallen" : ""}
          {task.doneAt ? ` · klar ${formatStamp(task.doneAt)} av ${task.doneBy}` : ""}
        </p>
      </div>
      {task.doneAt ? (
        <button type="button" onClick={() => store.reopenTask(task.id)} className="h-9 rounded-full border border-line bg-white px-3 text-xs font-medium">
          Öppna igen
        </button>
      ) : (
        <button type="button" onClick={() => store.completeTask(task.id)} className="btn-fade-green h-9 rounded-full bg-green px-4 text-sm font-semibold text-white">
          Klar
        </button>
      )}
    </li>
  );
}

function TasksPanel({ orgNr }: { orgNr: string }) {
  const store = useCrmStore();
  const mine = store.tasks.filter((item) => item.orgNr === orgNr);
  const open = mine.filter((item) => !item.doneAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const done = mine.filter((item) => item.doneAt);
  const people = store.contacts.filter((item) => item.orgNr === orgNr && !item.struck);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<Task["kind"]>("ring");
  const [dueAt, setDueAt] = useState("");
  const [note, setNote] = useState("");
  const [contactId, setContactId] = useState("");
  const [assignee, setAssignee] = useState<string>(store.userId);
  const [remind, setRemind] = useState("0");
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);

  function save() {
    if (!dueAt) return setError("Ange datum och tid.");
    setError("");
    store.addTask({
      orgNr,
      contactId,
      dueAt: localInputToIso(dueAt),
      note: note.trim(),
      kind,
      assignee: assignee as (typeof STAFF)[number]["id"],
      remindMin: Number(remind),
    });
    setAdding(false);
    setDueAt("");
    setNote("");
  }

  return (
    <Panel
      id="uppgifter"
      title={`Uppgifter och återuppringning · ${open.length}`}
      intro="Uppföljningar med datum och tid. Förfallna syns överst här, på Idag och som banner."
      aside={
        <button type="button" onClick={() => setAdding((current) => !current)} className="btn-fade-amber h-10 shrink-0 rounded-full bg-amber px-4 text-sm font-semibold text-ink">
          {adding ? "Stäng" : "Ny uppgift"}
        </button>
      }
    >
      {adding ? (
        <form
          className="mt-4 grid gap-3 rounded-2xl border border-line bg-foam p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <div className="sm:col-span-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Typ av uppgift">
              {TASK_KINDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={kind === item.id}
                  onClick={() => setKind(item.id)}
                  className={`h-10 rounded-full border-2 px-4 text-sm font-semibold ${kind === item.id ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
                >
                  {item.label}
                </button>
              ))}
              {[
                { label: "Om 2 timmar", value: () => laterTodayLocal(2) },
                { label: "Imorgon 09", value: tomorrowMorningLocal },
                { label: "Om en vecka", value: nextWeekLocal },
              ].map((chip) => (
                <button key={chip.label} type="button" onClick={() => setDueAt(chip.value())} className="h-10 rounded-full border border-sea/40 bg-white px-3 text-sm font-medium text-sea">
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Datum och tid" type="datetime-local" value={dueAt} onChange={setDueAt} />
          <Field label="Vad ska göras" value={note} onChange={setNote} placeholder="Till exempel ringa beslutsfattaren" />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Person (valfritt)</span>
            <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-3">
              <option value="">Ingen vald</option>
              {people.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Ansvarig</span>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-3">
              {STAFF.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Påminnelse</span>
            <select value={remind} onChange={(event) => setRemind(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-3">
              <option value="0">Vid tidpunkten</option>
              <option value="15">15 minuter innan</option>
              <option value="60">1 timme innan</option>
              <option value="1440">1 dag innan</option>
            </select>
          </label>
          {error ? <p className="text-sm font-semibold text-rust sm:col-span-2">{error}</p> : null}
          <button type="submit" className="btn-fade-green h-12 rounded-full bg-green font-semibold text-white sm:col-span-2">
            Spara uppgift
          </button>
        </form>
      ) : null}
      <ul className="mt-3 space-y-2">
        {open.length === 0 && !adding ? <li className="text-sm text-muted">Inga öppna uppgifter.</li> : null}
        {open.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
      {done.length ? (
        <div className="mt-3">
          <button type="button" className="text-sm font-medium text-sea" onClick={() => setShowDone((current) => !current)}>
            {showDone ? "Dölj klara" : `Visa klara (${done.length})`}
          </button>
          {showDone ? (
            <ul className="mt-2 space-y-2">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

function Numbers({ company, big }: { company: Company; big: boolean }) {
  const store = useCrmStore();
  const blocked = store.blockedChannels(company.orgNr);
  const phoneBlocked = blocked.includes("phone");
  const smsBlocked = blocked.includes("sms");
  const mailBlocked = blocked.includes("mail");
  const groups = [
    { label: "Växel och bolagets nummer", numbers: company.phones },
    { label: "Beslutsfattare", numbers: company.signatoryPhones },
  ];
  const any = groups.some((group) => group.numbers.length);
  const mail = company.emails[0];
  const firstLive = [...company.phones, ...company.signatoryPhones].find((value) => !isStruck(store.struckPhones, company.orgNr, value));

  return (
    <Panel title="Ring, maila och SMS" intro="Numren kommer från registret. Ett nummer som inte går att nå stryks och ligger kvar.">
      {phoneBlocked ? (
        <p className="mt-3 rounded-2xl border-2 border-rust bg-rust/10 px-3 py-2 text-sm font-semibold">
          Ring inte det här bolaget. Spärren gäller telefon{smsBlocked ? " och SMS" : ""}
          {mailBlocked ? " och mejl" : ""}.
        </p>
      ) : null}
      {!any ? <p className="mt-3 text-sm text-muted">Inget nummer i registret. Lägg till en kontaktperson med nummer nedan.</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {groups.map((group) =>
          group.numbers.length ? (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{group.label}</p>
              <ul className="mt-1.5 space-y-2">
                {group.numbers.map((number) => {
                  const struck = isStruck(store.struckPhones, company.orgNr, number);
                  return (
                    <li key={number} className="flex items-center justify-between gap-2">
                      {struck ? (
                        <span className="text-sm text-muted line-through">{number} · inaktivt</span>
                      ) : phoneBlocked ? (
                        <span className="rounded-full bg-rust/10 px-4 py-2 text-sm font-semibold text-rust">{number} · spärrat</span>
                      ) : (
                        <a
                          href={telHref(number)}
                          className={`btn-fade-green inline-flex items-center rounded-full bg-green font-semibold text-white ${big ? "h-12 px-5 text-lg" : "h-10 px-4 text-sm"}`}
                        >
                          Ring {number}
                        </a>
                      )}
                      {struck && store.isAdmin ? (
                        <button type="button" className="text-xs text-muted underline" onClick={() => store.restorePhone(company.orgNr, number)}>
                          Återställ
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null,
        )}
      </div>
      {(mail && !mailBlocked) || (firstLive && !smsBlocked) ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {mail && !mailBlocked ? (
            <a href={`mailto:${mail}`} className="font-semibold text-sea">
              Maila {mail}
              {company.emails.length > 1 ? ` (+${company.emails.length - 1})` : ""}
            </a>
          ) : null}
          {firstLive && !smsBlocked ? (
            <a href={`sms:${firstLive.replace(/[^\d+]/g, "")}`} className="font-semibold text-sea">
              SMS till {firstLive}
            </a>
          ) : null}
        </p>
      ) : null}
    </Panel>
  );
}

function StatusPanel({ company }: { company: Company }) {
  const store = useCrmStore();
  const meta = store.metaOf(company.orgNr);
  const [tag, setTag] = useState("");
  const [flag, setFlag] = useState<FlagId>("ingen-telefon");
  const allTags = [...new Set(store.metas.flatMap((item) => item.tags))];

  return (
    <Panel title="Status och taggar" intro="Säljfasen ändras av dig eller automatiskt av samtalsutfall. Varje ändring sparas.">
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Säljfas">
        {STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={meta.stage === item.id}
            onClick={() => store.setStage(company.orgNr, item.id as StageId)}
            className={`h-9 rounded-full px-3 text-sm font-semibold ${meta.stage === item.id ? `${item.chip} ring-2 ring-sea` : "border border-line bg-white"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {meta.stageHistory.length ? (
        <details className="mt-2 text-xs text-muted">
          <summary className="cursor-pointer font-medium">Statushistorik ({meta.stageHistory.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {meta.stageHistory.map((item, index) => (
              <li key={`${item.at}-${index}`}>
                {formatStamp(item.at)} · {item.by}: {stageInfo(item.from).label} → {stageInfo(item.to).label}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Taggar</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {meta.tags.length === 0 ? <span className="text-sm text-muted">Inga taggar.</span> : null}
        {meta.tags.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full bg-sea/10 py-1 pl-3 pr-1 text-sm font-semibold text-sea">
            #{item}
            <button type="button" aria-label={`Ta bort taggen ${item}`} onClick={() => store.removeTag(company.orgNr, item)} className="h-6 w-6 rounded-full bg-white text-xs">
              ×
            </button>
          </span>
        ))}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          store.addTag(company.orgNr, tag);
          setTag("");
        }}
      >
        <input
          list="crm-tags"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          placeholder="Ny tagg"
          aria-label="Ny tagg"
          className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 text-sm"
        />
        <datalist id="crm-tags">
          {allTags.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <button type="submit" className="btn-fade-sea h-10 rounded-full bg-sea px-4 text-sm font-semibold text-white">
          Lägg till
        </button>
      </form>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Spärrar</p>
      <ul className="mt-1.5 space-y-1.5">
        {meta.flags.length === 0 ? <li className="text-sm text-muted">Inga spärrar.</li> : null}
        {meta.flags.map((entry) => {
          const info = FLAGS.find((item) => item.id === entry.id);
          return (
            <li key={entry.id} className="flex items-start justify-between gap-2 rounded-xl bg-rust/10 px-3 py-2 text-sm">
              <span>
                <span className="font-semibold text-rust">{info?.label ?? entry.id}</span>
                <span className="block text-xs text-muted">
                  Satt {formatStamp(entry.at)} av {entry.by}
                  {entry.note ? ` · ${entry.note}` : ""}
                </span>
              </span>
              {store.isAdmin ? (
                <button type="button" onClick={() => store.removeFlag(company.orgNr, entry.id)} className="shrink-0 text-xs underline">
                  Ta bort
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex gap-2">
        <select value={flag} onChange={(event) => setFlag(event.target.value as FlagId)} aria-label="Typ av spärr" className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-paper px-2 text-sm">
          {FLAGS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => store.addFlag(company.orgNr, flag)} className="btn-fade-rust h-10 rounded-full bg-rust px-4 text-sm font-semibold text-white">
          Sätt spärr
        </button>
      </div>
      {!store.isAdmin ? <p className="mt-1.5 text-xs text-muted">Bara admin kan ta bort en spärr.</p> : null}
    </Panel>
  );
}

function About({ company }: { company: Company }) {
  return (
    <Panel title="Om bolaget">
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <Fact label="Adress" value={`${company.street}, ${company.postalCode} ${company.city}`} />
        <Fact label="Län" value={company.county || "Saknas"} />
        <Fact label="Bransch" value={company.industry} />
        <Fact label="SNI" value={company.sni} />
        <Fact label="Bolagsform" value={legalFormLabel(company.form)} />
        <Fact label="Anställda" value={company.employees || "Saknas"} />
        <Fact label="E-post i registret" value={company.emails.length ? company.emails.join(", ") : "Ingen adress"} />
      </dl>
    </Panel>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Purchases({ purchases }: { purchases: Purchase[] }) {
  return (
    <Panel title="Köphistorik" intro="Det bolaget har köpt av oss, så du vet läget inför och under samtalet.">
      {purchases.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Inga köp registrerade på det här bolaget.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {purchases.map((item) => (
            <li key={item.id} className="rounded-2xl bg-paper px-3 py-3 text-sm leading-6">
              <p className="font-medium">{item.what}</p>
              <p className="text-muted">
                {item.id} · {formatStamp(item.at)} · {item.sum}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Owner({ company }: { company: Company }) {
  const store = useCrmStore();
  const { claim, mine, taken } = useOwner(company.orgNr);
  const history = store.activities
    .filter((item) => item.orgNr === company.orgNr && (item.outcome === "agare-satt" || item.outcome === "agare-slappt"))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4);
  return (
    <Panel title="Ägare" intro="Den som har stjärnan bearbetar bolaget. Bolaget ligger då i Mina kunder. Andra säljare ser ägaren.">
      <div className="mt-3 flex items-center gap-3">
        <OwnerStar orgNr={company.orgNr} size="lg" />
        <p className="text-sm leading-6">
          {claim ? (
            <>
              <span className="block font-semibold">{mine ? "Du bearbetar bolaget" : `${claim.userName} bearbetar bolaget`}</span>
              <span className="text-muted">Sedan {formatStamp(claim.at)}</span>
            </>
          ) : (
            <span className="font-semibold">Ingen bearbetar bolaget. Tryck på stjärnan för att ta det.</span>
          )}
        </p>
      </div>
      {mine ? <p className="mt-2 text-xs leading-5 text-muted">Tryck på stjärnan igen när du inte längre ska bearbeta bolaget. Historiken ligger kvar.</p> : null}
      {taken && !store.isAdmin ? <p className="mt-2 text-xs leading-5 text-muted">Bara ägaren eller admin kan släppa bolaget.</p> : null}
      {store.isAdmin ? (
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-medium">Tilldela säljare (admin)</span>
          <select
            value={claim?.userId ?? ""}
            onChange={(event) => {
              if (event.target.value) store.assignOwner([company.orgNr], event.target.value as (typeof STAFF)[number]["id"]);
            }}
            className="h-11 w-full rounded-xl border border-line bg-paper px-3"
          >
            <option value="">Ingen ägare</option>
            {STAFF.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {history.length ? (
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {history.map((item) => (
            <li key={item.id}>
              {formatStamp(item.at)} · {item.userName} · {outcomeLabel(item.outcome)}
              {item.note ? ` · ${item.note}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

function Membership({ company }: { company: Company }) {
  const store = useCrmStore();
  const segments = store.segments.filter((segment) => !segment.archived && segmentCompanies(segment).some((item) => item.orgNr === company.orgNr));
  const lists = store.callLists.filter((list) => !list.archived && list.orgNrs.includes(company.orgNr));
  return (
    <Panel title="Ingår i" intro="Segment och ringlistor som bolaget finns med i.">
      {segments.length === 0 && lists.length === 0 ? <p className="mt-3 text-sm text-muted">Inget segment eller ringlista ännu.</p> : null}
      {segments.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Segment</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {segments.map((segment) => (
              <li key={segment.id}>
                <Link href="/crm/segment" className="rounded-full bg-foam px-2.5 py-1 text-xs font-semibold text-sea">
                  {segment.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {lists.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Ringlistor</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {lists.map((list) => (
              <li key={list.id}>
                <Link href={`/crm/ring?lista=${list.id}`} className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green">
                  {list.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
