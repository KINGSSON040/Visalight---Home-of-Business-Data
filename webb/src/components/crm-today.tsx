"use client";

import { useState } from "react";
import Link from "next/link";
import { TaskRow } from "@/components/crm-card";
import { OppFlagBadges, TempChip } from "@/components/crm-opps";
import { kundHref } from "@/components/crm-ui";
import {
  OUTCOMES,
  formatMoney,
  formatStamp,
  isOppClosed,
  isSameDay,
  isSystemKind,
  outcomeLabel,
  useCrmStore,
} from "@/lib/crm-store";

const figure = "text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-none tracking-tight text-ink tabular-nums";

export function TodayView() {
  const store = useCrmStore();
  const [allOpps, setAllOpps] = useState(false);
  const now = new Date(store.now);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const weekAhead = endOfToday + 6 * 86_400_000;

  const alerts = store.opportunityAlerts(allOpps ? undefined : store.userId);
  const tasks = store.openTasks(store.userId);
  const late = tasks.filter((item) => new Date(item.dueAt).getTime() < store.now);
  const today = tasks.filter((item) => {
    const due = new Date(item.dueAt).getTime();
    return due >= store.now && due < endOfToday;
  });
  const soon = tasks.filter((item) => {
    const due = new Date(item.dueAt).getTime();
    return due >= endOfToday && due < weekAhead;
  });

  const mine = store.activities.filter((item) => item.userId === store.userId && !isSystemKind(item.outcome));
  const todays = mine.filter((item) => isSameDay(item.at, now));
  const callOutcomes = OUTCOMES.filter((item) => item.call);
  const calls = todays.filter((item) => callOutcomes.some((outcome) => outcome.id === item.outcome));
  const count = (...ids: string[]) => todays.filter((item) => ids.includes(item.outcome)).length;
  const myOpen = store.opps.filter((item) => item.ownerId === store.userId && !isOppClosed(item.stage));
  const myValue = myOpen.reduce((sum, item) => sum + item.value, 0);
  const lists = store.callLists
    .filter((list) => !list.archived)
    .map((list) => ({ list, done: Object.keys(list.results).length }))
    .filter(({ list, done }) => done < list.orgNrs.length);
  const first = store.currentUser.name.split(" ")[0];
  const date = new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const dateLabel = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <section>
      <p className="text-sm text-muted">{dateLabel}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{first}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Samtal, uppföljning och det som ligger öppet i pipeline.</p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 xl:grid-cols-5">
        <Figure label="Samtal idag" value={String(calls.length)} />
        <Figure label="Intresserade" value={String(count("intresserad", "mote", "offert"))} />
        <Figure label="Ej svar" value={String(count("ej-svar", "upptaget"))} />
        <Figure label="Nej tack och spärr" value={String(count("ej-intresserad", "sparr"))} />
        <div className="col-span-2 bg-white sm:col-span-1">
          <Link href="/crm/pipeline" className="block h-full px-5 py-6 hover:bg-[#fafaf9]">
            <dd className={figure}>{formatMoney(myValue)}</dd>
            <dt className="mt-3 text-sm text-muted">Pipeline</dt>
            <p className="mt-1 text-xs tabular-nums text-muted">{myOpen.length} öppna</p>
          </Link>
        </div>
      </dl>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-8">
          <section aria-label="Möjligheter som kräver uppföljning">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Uppföljning <span className="tabular-nums text-muted">{alerts.length}</span>
              </h2>
              <div className="flex items-center gap-4 text-sm">
                {store.isAdmin ? (
                  <button type="button" onClick={() => setAllOpps((current) => !current)} className="font-medium text-muted hover:text-ink">
                    {allOpps ? "Visa bara mina" : "Visa alla säljare"}
                  </button>
                ) : null}
                <Link href="/crm/pipeline" className="font-semibold text-[#d6007a]">
                  Pipeline
                </Link>
              </div>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Inga öppna möjligheter med förfallet nästa steg.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {alerts.map(({ opp }) => (
                  <li key={opp.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">
                        <Link href={kundHref(opp.orgNr)} className="hover:text-[#d6007a]">
                          {opp.title}
                        </Link>
                        <span className="text-muted"> · {formatMoney(opp.value)}</span>
                      </p>
                      <p className="text-xs text-muted">
                        {opp.companyName} · {opp.ownerName} · {opp.nextStep} {formatStamp(opp.nextStepAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TempChip temperature={opp.temperature} />
                      <OppFlagBadges opp={opp} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Uppgifter och återuppringning">
            <h2 className="text-lg font-semibold tracking-tight">Uppgifter</h2>
            <TaskGroup title="Förfallna" tasks={late} empty="Inget förfallet." mark />
            <TaskGroup title="Idag" tasks={today} empty="Inget mer idag." />
            <TaskGroup title="Kommande sju dagar" tasks={soon} empty="Inget planerat." />
          </section>
        </div>

        <div className="space-y-8">
          <section aria-label="Pågående ringlistor">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Ringlistor</h2>
              <Link href="/crm/ring" className="text-sm font-semibold text-[#d6007a]">
                Alla listor
              </Link>
            </div>
            {lists.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Ingen pågående ringlista.{" "}
                <Link href="/crm/ring" className="font-semibold text-ink underline decoration-[#d6007a] underline-offset-4">
                  Skapa en
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-line border-b border-line">
                {lists.map(({ list, done }, index) => (
                  <li key={list.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{list.name}</p>
                      <p className="mt-0.5 text-sm tabular-nums text-muted">
                        {done} av {list.orgNrs.length}
                      </p>
                    </div>
                    <Link
                      href={`/crm/ring?lista=${list.id}`}
                      className={
                        index === 0
                          ? "inline-flex h-10 shrink-0 items-center rounded-full bg-[#d6007a] px-4 text-sm font-semibold text-white hover:bg-[#b80068]"
                          : "shrink-0 text-sm font-semibold text-ink hover:text-[#d6007a]"
                      }
                    >
                      {done === 0 ? "Börja" : "Fortsätt"}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Min senaste aktivitet">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Aktivitet</h2>
              <Link href="/crm/aktivitet" className="text-sm font-semibold text-[#d6007a]">
                Visa allt
              </Link>
            </div>
            {mine.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Ingen aktivitet ännu.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line border-b border-line">
                {[...mine]
                  .sort((a, b) => b.at.localeCompare(a.at))
                  .slice(0, 8)
                  .map((item) => (
                    <li key={item.id} className="py-3 text-sm">
                      <Link href={kundHref(item.orgNr)} className="font-medium hover:text-[#d6007a]">
                        {item.companyName}
                      </Link>
                      <p className="text-xs text-muted">
                        {outcomeLabel(item.outcome)} · {formatStamp(item.at)}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-6">
      <dd className={figure}>{value}</dd>
      <dt className="mt-3 text-sm text-muted">{label}</dt>
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  empty,
  mark = false,
}: {
  title: string;
  tasks: ReturnType<ReturnType<typeof useCrmStore>["openTasks"]>;
  empty: string;
  mark?: boolean;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}{" "}
        <span className={`tabular-nums ${mark && tasks.length ? "text-[#d6007a]" : "text-ink"}`}>{tasks.length}</span>
      </h3>
      {tasks.length === 0 ? <p className="mt-2 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-2 space-y-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} showCompany />
        ))}
      </ul>
    </div>
  );
}
