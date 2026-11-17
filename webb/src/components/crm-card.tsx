"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Contacts } from "@/components/crm-contacts";
import { History, LogPanel, isStruck } from "@/components/crm-log";
import { OwnerChip, OwnerStar, Panel, telHref, useOwner } from "@/components/crm-ui";
import { legalFormLabel, type Company } from "@/lib/catalog";
import {
  formatStamp,
  outcomeLabel,
  readPurchases,
  useCrmStore,
  type OutcomeId,
  type Purchase,
} from "@/lib/crm-store";

export type FocusMode = {
  index: number;
  total: number;
  listName: string;
  onSaved: (outcome: OutcomeId) => void;
  onSkip: () => void;
};

export function CrmCard({
  company,
  focus,
  embedded = false,
}: {
  company: Company;
  focus?: FocusMode;
  embedded?: boolean;
}) {
  const store = useCrmStore();
  const { claim, mine, taken } = useOwner(company.orgNr);
  const log = store.activities.filter((item) => item.orgNr === company.orgNr);
  const last = store.lastActivity(company.orgNr);
  const task = store.openTasks().find((item) => item.orgNr === company.orgNr);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    setPurchases(readPurchases(company.orgNr));
  }, [company.orgNr]);

  return (
    <article>
      {embedded || focus ? null : (
        <p className="text-sm">
          <Link href="/crm" className="font-medium text-sea">
            Tillbaka till sök
          </Link>
        </p>
      )}

      {focus ? (
        <div className="mt-1 rounded-2xl bg-sea px-4 py-3 text-white">
          <p className="text-sm font-semibold">
            Bolag {Math.min(focus.index + 1, focus.total)} av {focus.total} · {focus.listName}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/30" aria-hidden="true">
            <div className="h-full rounded-full bg-amber" style={{ width: `${(focus.index / Math.max(1, focus.total)) * 100}%` }} />
          </div>
        </div>
      ) : null}

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Kundkort</p>
          <h1 className="mt-1 text-3xl tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {company.orgNr} · {legalFormLabel(company.form)} · {company.city}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OwnerChip orgNr={company.orgNr} />
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

      {taken && claim ? (
        <p className="mt-3 rounded-2xl bg-rust/10 px-3 py-2 text-sm leading-6">
          {claim.userName} bearbetar bolaget sedan {formatStamp(claim.at)}. Hör av dig till {claim.userName} innan du
          kontaktar det.
        </p>
      ) : null}
      {mine && claim ? (
        <p className="mt-3 rounded-2xl bg-amber-soft px-3 py-2 text-sm leading-6">
          Bolaget ligger i dina Mina företag sedan {formatStamp(claim.at)}. Tryck på stjärnan när du inte bearbetar det längre.
        </p>
      ) : null}
      {task ? (
        <p className="mt-3 rounded-2xl bg-foam px-3 py-2 text-sm leading-6">
          <span className="font-semibold">Uppföljning {formatStamp(task.nextAt)}</span> ({task.userName})
          {task.nextNote ? ` · ${task.nextNote}` : ""}
        </p>
      ) : null}

      <Numbers company={company} big={Boolean(focus)} />

      {focus ? (
        <LogPanel company={company} focus={{ onSaved: focus.onSaved, onSkip: focus.onSkip }} />
      ) : null}

      <Contacts orgNr={company.orgNr} />
      <About company={company} />
      {focus ? null : <LogPanel company={company} />}
      <History entries={log} />
      <Purchases purchases={purchases} />
    </article>
  );
}

function Numbers({ company, big }: { company: Company; big: boolean }) {
  const store = useCrmStore();
  const groups = [
    { label: "Växel och bolagets nummer", numbers: company.phones },
    { label: "Beslutsfattare", numbers: company.signatoryPhones },
  ];
  const any = groups.some((group) => group.numbers.length);
  const mail = company.emails[0];

  return (
    <Panel title="Ring och maila" intro="Numren kommer från registret. Ett nummer som inte går att nå stryks och ligger kvar.">
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
                      ) : (
                        <a
                          href={telHref(number)}
                          className={`inline-flex items-center rounded-full bg-green font-semibold text-white ${
                            big ? "h-12 px-5 text-lg" : "h-10 px-4 text-sm"
                          }`}
                        >
                          Ring {number}
                        </a>
                      )}
                      {struck ? (
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
      {mail ? (
        <p className="mt-4 text-sm">
          <a href={`mailto:${mail}`} className="font-semibold text-sea">
            Maila {mail}
          </a>
          {company.emails.length > 1 ? ` · ${company.emails.length - 1} adress till i registret` : ""}
        </p>
      ) : null}
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
