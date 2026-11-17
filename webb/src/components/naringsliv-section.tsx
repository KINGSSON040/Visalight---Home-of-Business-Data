import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { Sparkle } from "@/components/doodles";
import { formatCount, type NaringslivStats, type StatRow } from "@/lib/naringsliv";

function Bars({ rows, color, limit }: { rows: StatRow[]; color: string; limit: number }) {
  const shown = rows.slice(0, limit);
  const max = Math.max(1, ...shown.map((row) => row.count));
  return (
    <ul className="mt-3 space-y-1.5">
      {shown.map((row, index) => (
        <li key={row.key}>
          <Link href={row.href} className="group block rounded-xl px-1 py-0.5 hover:bg-white/60" title={`Bygg ett utdrag på ${row.label}`}>
            <span className="flex items-baseline justify-between gap-2 text-sm font-bold">
              <span className="truncate group-hover:underline">{row.label}</span>
              <span className="tabular shrink-0">{formatCount(row.count)}</span>
            </span>
            <span className="mt-0.5 block h-3.5 overflow-hidden rounded-full border-2 border-ink bg-white">
              <span
                className="bar-grow block h-full rounded-full"
                style={{ width: `${Math.max(4, (row.count / max) * 100)}%`, background: color, animationDelay: `${index * 90}ms` }}
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Columns({ stats }: { stats: NaringslivStats }) {
  const max = Math.max(1, ...stats.monthly.map((row) => row.count));
  if (stats.monthly.length === 0) return null;
  return (
    <div className="mt-3 flex h-24 items-end gap-1.5" role="img" aria-label="Nya bolag per månad">
      {stats.monthly.map((row, index) => (
        <div key={row.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span
            className="col-grow block w-full rounded-t-lg border-2 border-ink bg-sun"
            style={{ height: `${Math.max(8, (row.count / max) * 100)}%`, animationDelay: `${index * 80}ms` }}
            title={`${row.label}: ${formatCount(row.count)}`}
          />
          <span className="text-[0.65rem] font-black uppercase">{row.label}</span>
        </div>
      ))}
    </div>
  );
}

/** "Sveriges näringsliv i siffror". Varje siffra leder till byggaren. */
export function NaringslivSection({
  stats,
  updatedLabel,
  full = false,
  heading = true,
}: {
  stats: NaringslivStats;
  updatedLabel: string;
  full?: boolean;
  heading?: boolean;
}) {
  const top = stats.growing[0];
  return (
    <section id="statistik" className="border-t-[3px] border-ink bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {heading ? (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-hand -rotate-1 text-2xl text-sea">Nyfiken på läget?</p>
              <h2 className="text-4xl leading-none font-bold sm:text-5xl">Sveriges näringsliv i siffror</h2>
            </div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-peach px-3 py-1">Uppdaterat {updatedLabel}</span>
              {stats.example ? (
                <span className="rounded-full border-2 border-rust px-3 py-0.5 text-rust" data-exempeldata>
                  Exempeldata, inte riktiga siffror
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="chunk block-coral tilt-l relative p-5">
            <Sparkle className="absolute -top-4 -right-3 h-10 w-10" />
            <h3 className="text-lg font-semibold">Bolag i registret</h3>
            <p className="font-display mt-1 text-5xl leading-none font-bold sm:text-6xl">
              <CountUp value={stats.total} />
            </p>
            <p className="mt-2 text-sm font-bold">säljbara bolag, utan avregistrerade och reklamspärrade</p>
            <Link href="/#urval" className="btn-chunk is-white mt-4 h-11 px-4 text-sm">
              Bygg ett utdrag på alla {formatCount(stats.total)}
            </Link>
          </article>

          <article className="chunk block-leaf relative p-5">
            <h3 className="text-lg font-semibold">Nya bolag, senaste {stats.windowDays} dagarna</h3>
            <p className="font-display mt-1 text-5xl leading-none font-bold sm:text-6xl">
              +<CountUp value={stats.added} />
            </p>
            <Columns stats={stats} />
            {top ? (
              <Link href={top.href} className="btn-chunk is-white mt-4 h-11 px-4 text-sm">
                Bygg ett utdrag på {top.label.toLowerCase()}
              </Link>
            ) : null}
          </article>

          <article className="chunk block-sun tilt-r p-5 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold">Mest växande branscher</h3>
            <ol className="mt-3 space-y-2">
              {stats.growing.slice(0, full ? 5 : 4).map((row, index) => (
                <li key={row.key}>
                  <Link href={row.href} className="tile flex items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-white px-3 py-2">
                    <span className="font-display inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-base text-white">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{row.label}</span>
                      <span className="block text-xs text-muted">{formatCount(row.count)} bolag totalt</span>
                    </span>
                    <span className="font-display tabular shrink-0 rounded-full bg-leaf-soft px-2 text-base font-semibold">+{formatCount(row.added)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>

          <article className="chunk bg-rose-soft p-5 lg:col-span-1">
            <h3 className="text-lg font-semibold">Per bransch (SNI)</h3>
            <Bars rows={stats.byIndustry} color="var(--coral)" limit={full ? 8 : 5} />
          </article>

          <article className="chunk bg-leaf-soft p-5 lg:col-span-1">
            <h3 className="text-lg font-semibold">Per län</h3>
            <Bars rows={stats.byCounty} color="var(--leaf)" limit={full ? 21 : 5} />
          </article>

          <article className="chunk block-peach flex flex-col justify-between p-5">
            <div>
              <h3 className="text-lg font-semibold">Gör siffran till kunder</h3>
              <p className="mt-2 text-sm leading-6 font-medium">
                Klicka på en bransch eller ett län så öppnas byggaren med det ifyllt. Antal och pris syns direkt.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/#urval" className="btn-chunk h-11 px-4 text-sm">
                Öppna byggaren
              </Link>
              {full ? null : (
                <Link href="/statistik" className="btn-chunk is-white h-11 px-4 text-sm">
                  All statistik
                </Link>
              )}
            </div>
          </article>
        </div>
        <p className="mt-6 text-xs leading-5 text-muted">
          {stats.example
            ? "Exempeldata: registret är inte inkopplat i den här körningen. Talen är avrundade exempel som visar hur sidan fungerar, inte Sveriges riktiga siffror."
            : `Räknat på säljbara bolag i registret. Nya bolag har registreringsdatum de senaste ${stats.windowDays} dagarna fram till senaste uppdateringen. Bransch räknas på första SNI-koden.`}
        </p>
      </div>
    </section>
  );
}
