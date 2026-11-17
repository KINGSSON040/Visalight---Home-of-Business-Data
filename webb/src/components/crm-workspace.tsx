"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANIES } from "@/lib/catalog";
import { STAFF, formatStamp, outcomeLabel, useCrmStore } from "@/lib/crm-store";

/** Kundkortet i mitten, Mina företag i högerkanten. */
export function CrmWorkspace({
  children,
  selected,
  hrefFor = (orgNr) => `/crm/bolag/${encodeURIComponent(orgNr)}`,
  rail,
}: {
  children: React.ReactNode;
  selected?: string;
  hrefFor?: (orgNr: string) => string;
  rail?: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        {rail ?? <MyCompaniesRail selected={selected} hrefFor={hrefFor} />}
      </aside>
    </div>
  );
}

export function MyCompaniesRail({
  selected,
  hrefFor,
}: {
  selected?: string;
  hrefFor: (orgNr: string) => string;
}) {
  const store = useCrmStore();
  const [scope, setScope] = useState<"mina" | "alla">("mina");
  const tasks = store.openTasks();

  const entries = store.claims
    .filter((claim) => (scope === "mina" ? claim.userId === store.userId : true))
    .flatMap((claim) => {
      const company = COMPANIES.find((item) => item.orgNr === claim.orgNr);
      return company ? [{ claim, company }] : [];
    })
    .sort((a, b) => b.claim.at.localeCompare(a.claim.at));

  const mineCount = store.claims.filter((claim) => claim.userId === store.userId).length;

  return (
    <section>
      <h2 className="text-xl tracking-tight">Mina företag</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Bolag med fylld stjärna. Andra säljare ser att de bearbetas av dig.
      </p>
      <div role="tablist" className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-foam p-1 text-sm font-medium">
        {(
          [
            ["mina", `Mina · ${mineCount}`],
            ["alla", `Alla säljare · ${store.claims.length}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={scope === id}
            onClick={() => setScope(id)}
            className={`h-9 rounded-full ${scope === id ? "bg-sea text-white" : "text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-line bg-white px-3 py-6 text-sm leading-6 text-muted">
          {scope === "mina"
            ? "Listan är tom. Öppna ett bolag och tryck på stjärnan, så hamnar det här."
            : "Ingen har stjärnmärkt något ännu."}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {entries.map(({ claim, company }) => {
            const last = store.lastActivity(company.orgNr);
            const due = tasks.find((task) => task.orgNr === company.orgNr && task.userId === claim.userId);
            const owner = STAFF.find((person) => person.id === claim.userId);
            return (
              <li key={company.orgNr}>
                <Link
                  href={hrefFor(company.orgNr)}
                  aria-current={selected === company.orgNr ? "true" : undefined}
                  className={`block border-l-4 px-3 py-3 ${
                    selected === company.orgNr ? "border-sea bg-foam" : "border-transparent bg-white hover:bg-paper"
                  }`}
                >
                  <span className="block font-medium">{company.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {company.city} · {company.industry}
                  </span>
                  {scope === "alla" ? (
                    <span className="mt-0.5 block text-xs font-semibold text-sea">{owner?.name ?? claim.userName}</span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-muted">
                    {last ? `${outcomeLabel(last.outcome)} · ${formatStamp(last.at)}` : `Stjärna ${formatStamp(claim.at)}`}
                  </span>
                  {due ? (
                    <span className="btn-fade-amber mt-1 inline-block rounded-full bg-amber px-2 py-0.5 text-xs font-semibold text-ink">
                      Ring {formatStamp(due.nextAt)}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
