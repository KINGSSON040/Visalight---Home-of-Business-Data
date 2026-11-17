"use client";

import Link from "next/link";
import { HistoryRow } from "@/components/crm-log";
import { OppFlagBadges, TempChip } from "@/components/crm-opps";
import { BackLink, Panel, kundHref, telHref } from "@/components/crm-ui";
import { COMPANIES } from "@/lib/catalog";
import { formatMoney, formatStamp, oppStageInfo, useCrmStore } from "@/lib/crm-store";

export function PersonView({ id }: { id: string }) {
  const store = useCrmStore();
  const person = store.contacts.find((item) => item.id === id);
  if (!store.ready) return <p className="text-sm text-muted">Hämtar personen.</p>;
  if (!person) {
    return (
      <section>
        <BackLink fallback="/crm/kunder" />
        <h1 className="mt-3 text-3xl tracking-tight">Personen finns inte</h1>
      </section>
    );
  }
  const company = COMPANIES.find((item) => item.orgNr === person.orgNr);
  const log = store.activities.filter((item) => item.contactId === person.id).sort((a, b) => b.at.localeCompare(a.at));
  const tasks = store.tasks.filter((item) => item.contactId === person.id);
  const opps = store.opps.filter((item) => item.contactId === person.id);
  const blocked = store.blockedChannels(person.orgNr);

  return (
    <article>
      <BackLink fallback={kundHref(person.orgNr)} label="Tillbaka" />
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Kontaktperson</p>
      <h1 className="mt-1 text-3xl tracking-tight">
        {person.firstName} {person.lastName}
        {person.struck ? <span className="ml-3 rounded-full bg-rust/10 px-3 py-1 align-middle text-sm font-semibold text-rust">Struken</span> : null}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {person.role || "Ingen rolltitel"} ·{" "}
        <Link href={kundHref(person.orgNr)} className="font-semibold text-sea hover:underline">
          {company?.name ?? person.orgNr}
        </Link>{" "}
        · skapad {formatStamp(person.createdAt)} av {person.createdBy}
      </p>

      <div className="mt-2 grid items-start gap-x-5 lg:grid-cols-2">
        <Panel title="Telefon och e-post">
          <ul className="mt-3 space-y-2 text-sm">
            {person.phones.map((item) => (
              <li key={item.id}>
                {item.struck || blocked.includes("phone") ? (
                  <span className="text-muted line-through">{item.value}</span>
                ) : (
                  <a href={telHref(item.value)} className="btn-fade-green inline-flex h-10 items-center rounded-full bg-green px-4 font-semibold text-white">
                    Ring {item.value}
                  </a>
                )}
              </li>
            ))}
            {person.emails.map((item) => (
              <li key={item.id}>
                {item.struck || blocked.includes("mail") ? (
                  <span className="text-muted line-through">{item.value}</span>
                ) : (
                  <a href={`mailto:${item.value}`} className="font-semibold text-sea">
                    {item.value}
                  </a>
                )}
              </li>
            ))}
            {person.phones.length + person.emails.length === 0 ? <li className="text-muted">Inga uppgifter.</li> : null}
          </ul>
        </Panel>
        <Panel title={`Möjligheter · ${opps.length}`}>
          <ul className="mt-3 space-y-2 text-sm">
            {opps.length === 0 ? <li className="text-muted">Inga möjligheter kopplade till personen.</li> : null}
            {opps.map((opp) => (
              <li key={opp.id} className="rounded-2xl bg-paper px-3 py-2">
                <p className="font-semibold">
                  {opp.title} · {formatMoney(opp.value)}
                </p>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  {oppStageInfo(opp.stage).label} · ägare {opp.ownerName} <TempChip temperature={opp.temperature} /> <OppFlagBadges opp={opp} />
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title={`Uppgifter · ${tasks.length}`}>
        <ul className="mt-3 space-y-1 text-sm">
          {tasks.length === 0 ? <li className="text-muted">Inga uppgifter.</li> : null}
          {tasks.map((task) => (
            <li key={task.id} className={task.doneAt ? "text-muted line-through" : ""}>
              {formatStamp(task.dueAt)} · {task.note || "Uppföljning"} · {task.assigneeName}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Tidslinje med personen" intro="Samtal och anteckningar där den här personen var inblandad.">
        {log.length === 0 ? <p className="mt-3 text-sm text-muted">Inget loggat än.</p> : null}
        <ol className="mt-3 space-y-2">
          {log.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} />
          ))}
        </ol>
      </Panel>
    </article>
  );
}
