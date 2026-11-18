"use client";

import { useRef } from "react";
import Link from "next/link";
import { CountUp, useInView } from "@/components/count-up";
import {
  builderHrefForCounty,
  builderHrefForSni,
  formatCount,
  countyRows,
  industryRows,
  monthLabel,
  type RegisterStats,
} from "@/lib/naringsliv";

export function ExampleBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-night" title="Registret är inte inkopplat. Talen är exempel, inte riktiga siffror.">
      Exempeldata
    </span>
  );
}

export function StatTiles({ stats }: { stats: RegisterStats }) {
  const topIndustry = stats.byIndustry[0];
  const topCounty = stats.byCounty[0];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="glass flex flex-col rounded-2xl p-4">
        <p className="text-sm font-medium text-muted">Företag totalt</p>
        <CountUp value={stats.total} className="font-display mt-1 text-4xl text-neon font-extrabold tracking-tight" />
        <p className="mt-1 text-xs text-muted">säljbara bolag i registret</p>
        <Link href="/#urval" className="mt-auto pt-3 text-sm font-bold text-magenta hover:underline">
          Bygg utdrag på alla {formatCount(stats.total)} →
        </Link>
      </article>
      <article className="glass flex flex-col rounded-2xl p-4">
        <p className="text-sm font-medium text-muted">Nya företag senaste månaden</p>
        <CountUp value={stats.newLastMonth} className="font-display mt-1 text-4xl font-extrabold tracking-tight text-neon" />
        <Sparkline values={stats.monthly.map((item) => item.count)} />
        <Link href="/statistik#nya-bolag" className="mt-auto pt-2 text-sm font-semibold text-magenta hover:underline">
          Se var de startar →
        </Link>
      </article>
      <article className="glass flex flex-col rounded-2xl p-4">
        <p className="text-sm font-medium text-muted">Största branschen</p>
        <p className="font-display mt-1 text-2xl leading-tight font-extrabold text-ink">{topIndustry?.label ?? "Okänd"}</p>
        {topIndustry ? <CountUp value={topIndustry.count} suffix=" bolag" className="mt-1 text-lg font-semibold text-neon" /> : null}
        {topIndustry ? (
          <Link href={builderHrefForSni(topIndustry.sni)} className="mt-auto pt-3 text-sm font-semibold text-magenta hover:underline">
            Bygg ett utdrag på dem →
          </Link>
        ) : null}
      </article>
      <article className="glass flex flex-col rounded-2xl p-4">
        <p className="text-sm font-medium text-muted">Flest företag</p>
        <p className="font-display mt-1 text-2xl leading-tight font-extrabold">{topCounty?.label ?? "Okänt"}</p>
        {topCounty ? <CountUp value={topCounty.count} suffix=" bolag" className="mt-1 text-lg font-semibold text-neon" /> : null}
        {topCounty ? (
          <Link href={builderHrefForCounty(topCounty.label)} className="mt-auto pt-3 text-sm font-bold text-magenta hover:underline">
            Bygg ett utdrag i länet →
          </Link>
        ) : null}
      </article>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - ((value - min) / span) * 24}`);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-10 w-full" role="img" aria-label="Nya företag per månad, senaste tolv månaderna">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1fe08a" stopOpacity="0.4" />
          <stop offset="1" stopColor="#1fe08a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,32 ${points.join(" ")} 100,32`} fill="url(#spark-fill)" />
      <polyline points={points.join(" ")} fill="none" stroke="#00a85e" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export function BarList({
  title,
  rows,
  tone = "neon",
  kind,
}: {
  title: string;
  rows: { key: string; label: string; count: number; detail?: string }[];
  tone?: "neon" | "magenta";
  kind: "sni" | "county";
}) {
  const hrefFor = kind === "sni" ? builderHrefForSni : builderHrefForCounty;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div ref={ref} className="glass rounded-2xl p-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.key}>
            <Link href={hrefFor(row.key)} className="group block" aria-label={`${row.label}, ${formatCount(row.count)} bolag. Bygg ett utdrag.`}>
              <span className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium group-hover:underline">
                  {row.label}
                  {row.detail ? <span className="ml-1.5 text-xs text-muted">{row.detail}</span> : null}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatCount(row.count)}</span>
              </span>
              <span className="bar-track mt-1 block h-2 overflow-hidden rounded-full">
                <span className={`bar-fill block h-full rounded-full ${tone === "magenta" ? "magenta" : ""}`} style={{ width: seen ? `${(row.count / max) * 100}%` : "0%" }} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Klicka på en rad för att bygga ett utdrag på den.</p>
    </div>
  );
}

export function Growing({ stats }: { stats: RegisterStats }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-lg font-bold">Mest växande branscher</h3>
      <p className="text-xs text-muted">Nya bolag senaste tre månaderna jämfört med de tre månaderna innan.</p>
      {stats.growing.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Det finns för få nya bolag i registret för att jämföra ännu.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {stats.growing.map((row, index) => {
            const size = stats.byIndustry.find((item) => item.sni === row.sni)?.count;
            return (
              <li key={row.sni} className="flex items-baseline gap-3 border-t border-line py-2 first:border-t-0">
                <span className="w-4 text-xs font-semibold text-muted">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{row.label}</span>
                  <Link href={builderHrefForSni(row.sni)} className="text-xs font-semibold text-magenta hover:underline">
                    {size ? `Utdrag på ${formatCount(size)} bolag` : "Utdrag på branschen"}
                  </Link>
                </span>
                <span className="text-sm font-semibold text-neon tabular-nums">+{row.changePct}%</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function MonthlyChart({ stats }: { stats: RegisterStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  const max = Math.max(...stats.monthly.map((item) => item.count), 1);
  return (
    <div ref={ref} id="nya-bolag" className="glass rounded-2xl p-4">
      <h3 className="text-lg font-bold">Nya företag per månad</h3>
      <div className="mt-4 flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Stapeldiagram över nya företag per månad">
        {stats.monthly.map((item) => (
          <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[0.6rem] text-muted tabular-nums sm:text-[0.65rem]">{formatCount(item.count)}</span>
            <span
              className="w-full rounded-t-sm bg-[#00a85e] transition-[height] duration-1000 ease-out motion-reduce:transition-none"
              style={{ height: seen ? `${(item.count / max) * 78}%` : "0%" }}
            />
            <span className="text-[0.65rem] text-muted">{monthLabel(item.month)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NaringslivSection({ stats, headingId = "siffror" }: { stats: RegisterStats; headingId?: string }) {
  const example = stats.source === "example";
  return (
    <section
      id="statistik"
      aria-labelledby={headingId}
      className="section-calm"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-magenta uppercase">Ur registret</p>
          <h2 id={headingId} className="mt-2 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            Sveriges näringsliv i siffror
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Hur många företag som finns, var de finns och vilka branscher som växer. Talen kommer från samma register som utdragen och byts när registret uppdateras. En rad öppnar byggaren med branschen eller länet ifyllt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExampleBadge show={example} />
          <Link href="/statistik" className="text-sm font-semibold text-magenta hover:underline">
            All statistik
          </Link>
        </div>
      </div>
      {example ? (
        <p className="mt-3 text-xs font-semibold text-muted">Registret är inte inkopplat i den här körningen. Alla tal i sektionen är exempeldata, inte riktiga siffror.</p>
      ) : null}
      <div className="mt-6">
        <StatTiles stats={stats} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <BarList title="Per bransch (SNI)" rows={industryRows(stats.byIndustry.slice(0, 6))} kind="sni" />
        <BarList title="Per län" rows={countyRows(stats.byCounty.slice(0, 6))} tone="magenta" kind="county" />
        <Growing stats={stats} />
      </div>
      </div>
    </section>
  );
}
