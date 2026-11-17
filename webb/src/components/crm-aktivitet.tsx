"use client";

import { useState } from "react";
import Link from "next/link";
import { TaskRow } from "@/components/crm-card";
import { HistoryRow } from "@/components/crm-log";
import { kundHref } from "@/components/crm-ui";
import { STAFF, isSystemKind, useCrmStore } from "@/lib/crm-store";

export function ActivityView() {
  const store = useCrmStore();
  const [who, setWho] = useState<string>("alla");
  const [kind, setKind] = useState<"alla" | "samtal" | "system">("alla");
  const [limit, setLimit] = useState(40);
  const tasks = store.openTasks(store.userId);

  const entries = [...store.activities]
    .filter((item) => who === "alla" || item.userId === who)
    .filter((item) => kind === "alla" || (kind === "system" ? isSystemKind(item.outcome) : !isSystemKind(item.outcome)))
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section>
      <h1 className="text-3xl tracking-tight">Aktivitet</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Allt som händer i CRM:et: samtal, anteckningar, statusbyten och möjligheter. Loggen kan inte raderas. Dina öppna uppgifter ligger överst.
      </p>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Mina öppna uppgifter · {tasks.length}</h2>
          {tasks.length === 0 ? <p className="mt-3 text-sm text-muted">Inga uppgifter.</p> : null}
          <ul className="mt-3 space-y-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} showCompany />
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <h2 className="mr-auto text-xl font-semibold">Aktivitetslogg</h2>
            <select value={who} onChange={(event) => setWho(event.target.value)} aria-label="Säljare" className="h-10 rounded-xl border border-line bg-paper px-2">
              <option value="alla">Alla säljare</option>
              {STAFF.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="Typ" className="h-10 rounded-xl border border-line bg-paper px-2">
              <option value="alla">Allt</option>
              <option value="samtal">Samtal, mejl och anteckningar</option>
              <option value="system">Status och system</option>
            </select>
          </div>
          {entries.length === 0 ? <p className="mt-3 text-sm text-muted">Ingen aktivitet ännu.</p> : null}
          <ol className="mt-3 space-y-2">
            {entries.slice(0, limit).map((entry) => (
              <div key={entry.id}>
                <p className="px-1 text-xs font-semibold">
                  <Link href={kundHref(entry.orgNr)} className="text-sea hover:underline">
                    {entry.companyName}
                  </Link>
                </p>
                <HistoryRow entry={entry} />
              </div>
            ))}
          </ol>
          {entries.length > limit ? (
            <button type="button" onClick={() => setLimit((current) => current + 40)} className="mt-3 h-11 w-full rounded-full border border-line text-sm font-semibold">
              Visa fler ({entries.length - limit} kvar)
            </button>
          ) : null}
        </section>
      </div>
    </section>
  );
}
