"use client";

import Link from "next/link";
import { CountUp, useInView, useReducedMotion } from "@/components/pop-motion";
import type { GrowthRow, RegisterOverview, StatBar } from "@/lib/register-stats";

const BAR_COLORS = ["var(--pop-magenta)", "var(--pop-sun)", "var(--pop-coral)", "var(--pop-lime)"];

function format(value: number): string {
  return value.toLocaleString("sv-SE");
}

export function ExampleBadge({ real }: { real: boolean }) {
  if (real) return null;
  return (
    <span className="sticker-sm inline-flex items-center bg-white px-2.5 py-0.5 text-xs font-extrabold tracking-wide uppercase">
      Exempeldata
    </span>
  );
}

export function StatsShowcase({ overview, full = false }: { overview: RegisterOverview; full?: boolean }) {
  const industries = full ? overview.byIndustry : overview.byIndustry.slice(0, 6);
  const counties = full ? overview.byCounty : overview.byCounty.slice(0, 6);
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <article className="sticker tilt-l-sm bg-[var(--pop-magenta)] p-5 text-white lg:col-span-5">
        <p className="text-xs font-extrabold tracking-[0.16em] uppercase">Företag i registret</p>
        <CountUp value={overview.total} className="font-display mt-2 block text-5xl leading-none tabular-nums sm:text-6xl" />
        <p className="mt-2 text-sm font-semibold text-white/90">Säljbara företag, utan avregistrerade och reklamspärrade.</p>
        <Link href="/#urval" className="pop-btn pop-btn--sun mt-4 h-11 px-4 text-sm">
          Bygg ett utdrag på alla <span aria-hidden="true">→</span>
        </Link>
      </article>

      <article className="sticker tilt-r-sm bg-[var(--pop-lime)] p-5 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-extrabold tracking-[0.16em] uppercase">Nya företag senaste månaden</p>
          <ExampleBadge real={overview.real} />
        </div>
        <p className="mt-2 flex flex-wrap items-end gap-3">
          <CountUp value={overview.newLastMonth} className="font-display text-5xl leading-none tabular-nums sm:text-6xl" />
          <span className="pb-1 text-lg font-extrabold">nya bolag</span>
        </p>
        <p className="mt-2 max-w-md text-sm font-semibold">Nya bolag har inga gamla leverantörer. De följer med i nästa utdrag automatiskt.</p>
        <Link href="/#urval" className="pop-btn pop-btn--magenta mt-4 h-11 px-4 text-sm">
          Bygg ett utdrag på de här {format(overview.newLastMonth)} nya bolagen <span aria-hidden="true">→</span>
        </Link>
      </article>

      <article className="sticker bg-white p-5 lg:col-span-5">
        <h3 className="font-display text-xl">Per bransch</h3>
        <p className="text-xs font-semibold text-muted">Klicka på en stapel för att öppna listbyggaren med branschen ifylld.</p>
        <BarList rows={industries} />
      </article>

      <article className="sticker bg-white p-5 lg:col-span-4">
        <h3 className="font-display text-xl">Per län</h3>
        <p className="text-xs font-semibold text-muted">De största länen just nu.</p>
        <BarList rows={counties} offset={1} />
      </article>

      <article className="sticker tilt-r-sm bg-[var(--pop-sun)] p-5 lg:col-span-3">
        <h3 className="font-display text-xl">Växer mest</h3>
        <p className="text-xs font-semibold">Andel nya bolag senaste året.</p>
        <GrowthList rows={full ? overview.growing : overview.growing.slice(0, 4)} />
      </article>
    </div>
  );
}

function BarList({ rows, offset = 0 }: { rows: StatBar[]; offset?: number }) {
  const [ref, seen] = useInView<HTMLUListElement>();
  const reduced = useReducedMotion();
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul ref={ref} className="mt-3 space-y-2">
      {rows.map((row, index) => (
        <li key={row.key}>
          <Link href={row.href} className="group block">
            <span className="flex items-baseline justify-between gap-2 text-sm font-bold">
              <span className="truncate group-hover:underline">{row.label}</span>
              <span className="tabular-nums">{format(row.count)}</span>
            </span>
            <span className="mt-0.5 block h-4 overflow-hidden rounded-full border-2 border-[var(--pop-ink)] bg-[var(--pop-cream)]">
              <span
                className="bar-fill block h-full rounded-full"
                data-shown={seen || reduced ? "true" : "false"}
                style={
                  {
                    "--fill": row.count / max,
                    background: BAR_COLORS[(index + offset) % BAR_COLORS.length],
                    transitionDelay: `${index * 80}ms`,
                  } as React.CSSProperties
                }
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GrowthList({ rows }: { rows: GrowthRow[] }) {
  return (
    <ol className="mt-3 space-y-2">
      {rows.map((row, index) => (
        <li key={row.key}>
          <Link href={row.href} className="flex items-center gap-2 rounded-xl border-2 border-[var(--pop-ink)] bg-white px-2.5 py-1.5 hover-wiggle">
            <span className="font-display grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--pop-ink)] text-xs text-[var(--pop-lime)]">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold">{row.label}</span>
              <span className="block text-xs font-semibold text-muted">
                +{format(row.added)} bolag · {row.share.toLocaleString("sv-SE")} %
              </span>
            </span>
            <span aria-hidden="true" className="text-lg font-black text-[var(--pop-magenta-deep)]">
              ▲
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
