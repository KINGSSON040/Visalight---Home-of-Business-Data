"use client";

import { useState } from "react";
import Link from "next/link";
import { CompanyRow } from "@/components/crm-search";
import { COMPANIES } from "@/lib/catalog";
import { BulkBar } from "@/components/crm-bulk";
import { formatStamp, useCrmStore } from "@/lib/crm-store";
import { kundHref } from "@/components/crm-ui";

export function MyCustomers() {
  const store = useCrmStore();
  const [scope, setScope] = useState<"mina" | "alla">("mina");
  const [filter, setFilter] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const now = new Date().toISOString();
  const tasks = store.openTasks(store.userId);
  const late = tasks.filter((task) => task.dueAt < now).length;

  const entries = store.claims
    .filter((claim) => (scope === "mina" ? claim.userId === store.userId : true))
    .flatMap((claim) => {
      const company = COMPANIES.find((item) => item.orgNr === claim.orgNr);
      return company ? [{ claim, company }] : [];
    })
    .filter(({ company }) => {
      const text = filter.trim().toLowerCase();
      return !text || `${company.name} ${company.orgNr} ${company.city} ${company.industry}`.toLowerCase().includes(text);
    })
    .sort((a, b) => b.claim.at.localeCompare(a.claim.at));

  const mineCount = store.claims.filter((claim) => claim.userId === store.userId).length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Mina kunder</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Bolagen du äger med stjärnan. Andra säljare ser att de bearbetas av dig. Tryck på ett bolag för att öppna
            kundkortet, eller på stjärnan när du inte längre ska bearbeta det.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/sok" className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-[#1c1917]">
            Sök fler bolag
          </Link>
          <Link href="/crm/ring" className="inline-flex h-11 items-center rounded-full bg-[#d6007a] px-5 text-sm font-semibold text-white hover:bg-[#b80068]">
            Ring mina kunder
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        <Stat label="Mina kunder" value={mineCount} />
        <Stat label="Uppföljningar att göra" value={tasks.length} href="/crm/aktivitet" />
        <Stat label="Försenade uppföljningar" value={late} href="/crm/aktivitet" />
      </div>

      {tasks.length ? (
        <div className="mt-4">
          <h2 className="text-xl tracking-tight">Näst på tur</h2>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {tasks.slice(0, 4).map((task) => (
              <li key={task.id}>
                <Link href={kundHref(task.orgNr)} className="flex items-center justify-between gap-3 px-3 py-3">
                  <span>
                    <span className="block font-medium">{task.companyName}</span>
                    <span className="text-sm text-muted">{task.note || "Uppföljning"}</span>
                  </span>
                  <span className={`shrink-0 text-xs font-semibold tabular-nums ${task.dueAt < now ? "text-[#d6007a]" : "text-muted"}`}>
                    {task.dueAt < now ? "Försenad " : ""}
                    {formatStamp(task.dueAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex gap-1 rounded-full bg-foam p-1 text-sm font-semibold">
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
              className={`h-9 rounded-full px-4 ${scope === id ? "btn-fade-sea bg-sea text-white" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filtrera på namn, ort eller bransch"
          aria-label="Filtrera kunder"
          className="h-11 min-w-[16rem] flex-1 rounded-xl border border-line bg-white px-3 text-sm sm:max-w-md"
        />
      </div>

      {picked.length ? <BulkBar orgNrs={picked} label="Mina kunder" onClear={() => setPicked([])} /> : null}

      {entries.length === 0 ? (
        <div className="mt-3 rounded-3xl border border-dashed border-line bg-white px-4 py-10 text-sm leading-6 text-muted">
          {scope === "mina" && mineCount === 0 ? (
            <>
              Du äger inga bolag ännu. Sök fram ett bolag, tryck på stjärnan, så hamnar det här.{" "}
              <Link href="/crm/sok" className="font-semibold text-sea underline">
                Sök bolag
              </Link>
            </>
          ) : (
            "Inga kunder matchar."
          )}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          {entries.map(({ claim, company }) => {
            const due = tasks.find((task) => task.orgNr === company.orgNr);
            return (
              <CompanyRow
                key={company.orgNr}
                company={company}
                selected={picked.includes(company.orgNr)}
                onToggle={() => setPicked((current) => (current.includes(company.orgNr) ? current.filter((item) => item !== company.orgNr) : [...current, company.orgNr]))}
                note={
                  <>
                    <span className="rounded-full bg-paper px-2 py-0.5">Stjärna sedan {formatStamp(claim.at)}</span>
                    {due ? (
                      <span className={`text-xs font-semibold tabular-nums ${due.dueAt < now ? "text-[#d6007a]" : "text-muted"}`}>
                        Uppföljning {formatStamp(due.dueAt)}
                      </span>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <span className="block text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
      <span className="mt-3 block text-sm text-muted">{label}</span>
    </>
  );
  const cls = "bg-white px-5 py-6 hover:bg-[#fafaf9]";
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
