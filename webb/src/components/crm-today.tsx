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

  return (
    <section>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Idag</p>
      <h1 className="mt-1 text-3xl tracking-tight">Hej {store.currentUser.name.split(" ")[0]}</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Det här kräver din uppmärksamhet först, sedan dagens uppgifter och din aktivitet.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Samtal idag" value={calls.length} tone="bg-sea text-white" />
        <Stat label="Intresserade" value={count("intresserad", "mote", "offert")} tone="bg-green text-white" />
        <Stat label="Ej svar" value={count("ej-svar", "upptaget")} tone="bg-amber text-ink" />
        <Stat label="Nej tack och spärr" value={count("ej-intresserad", "sparr")} tone="bg-rust text-white" />
        <Link href="/crm/pipeline" className="rounded-2xl bg-foam p-4 ring-1 ring-sea">
          <span className="block text-2xl font-bold">{formatMoney(myValue)}</span>
          <span className="text-sm font-semibold">Mitt öppna pipelinevärde · {myOpen.length}</span>
        </Link>
      </div>

      <section className="mt-6 rounded-3xl border-2 border-rust bg-white p-5 shadow-sm" aria-label="Möjligheter som kräver uppföljning">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Möjligheter som kräver uppföljning · {alerts.length}</h2>
          <div className="flex gap-2 text-sm">
            {store.isAdmin ? (
              <button type="button" onClick={() => setAllOpps((current) => !current)} className="h-9 rounded-full border border-line px-4 font-medium">
                {allOpps ? "Visa bara mina" : "Visa alla säljare"}
              </button>
            ) : null}
            <Link href="/crm/pipeline" className="btn-fade-sea inline-flex h-9 items-center rounded-full bg-sea px-4 font-semibold text-white">
              Öppna pipeline
            </Link>
          </div>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Alla öppna möjligheter har ett nästa steg som inte är förfallet. Bra jobbat.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {alerts.map(({ opp }) => (
              <li key={opp.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">
                    <Link href={kundHref(opp.orgNr)} className="text-sea hover:underline">
                      {opp.title}
                    </Link>{" "}
                    · {formatMoney(opp.value)}
                  </p>
                  <p className="text-xs text-muted">
                    {opp.companyName} · ägare {opp.ownerName} · nästa: {opp.nextStep} {formatStamp(opp.nextStepAt)}
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

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Uppgifter och återuppringning</h2>
          <TaskGroup title="Förfallna" tone="text-rust" tasks={late} empty="Inget förfallet." />
          <TaskGroup title="Idag" tone="text-sea" tasks={today} empty="Inget mer idag." />
          <TaskGroup title="Kommande 7 dagar" tone="text-muted" tasks={soon} empty="Inget planerat." />
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Pågående ringlistor</h2>
            {lists.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Inga pågående ringlistor. <Link href="/crm/ring" className="font-semibold text-sea">Skapa en</Link>.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {lists.map(({ list, done }) => (
                  <li key={list.id}>
                    <Link href={`/crm/ring?lista=${list.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-green-soft px-3 py-2.5 text-sm font-semibold text-green">
                      <span>{list.name}</span>
                      <span>
                        {done} av {list.orgNrs.length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">Min senaste aktivitet</h2>
              <Link href="/crm/aktivitet" className="text-sm font-medium text-sea">
                Visa allt
              </Link>
            </div>
            {mine.length === 0 ? <p className="mt-3 text-sm text-muted">Ingen aktivitet ännu.</p> : null}
            <ul className="mt-3 space-y-1.5">
              {[...mine]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 8)
                .map((item) => (
                  <li key={item.id} className="rounded-xl bg-paper px-3 py-2 text-sm">
                    <Link href={kundHref(item.orgNr)} className="font-semibold text-sea hover:underline">
                      {item.companyName}
                    </Link>
                    <span className="text-muted">
                      {" "}
                      · {outcomeLabel(item.outcome)} · {formatStamp(item.at)}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}

function TaskGroup({ title, tone, tasks, empty }: { title: string; tone: string; tasks: ReturnType<ReturnType<typeof useCrmStore>["openTasks"]>; empty: string }) {
  return (
    <div className="mt-4">
      <h3 className={`text-sm font-semibold uppercase tracking-[0.12em] ${tone}`}>
        {title} · {tasks.length}
      </h3>
      {tasks.length === 0 ? <p className="mt-1 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-1.5 space-y-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} showCompany />
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl p-4 ${tone}`}>
      <span className="block text-3xl font-bold">{value}</span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
