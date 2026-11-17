import type { Metadata } from "next";
import Link from "next/link";
import { BarList, ExampleBadge, Growing, MonthlyChart, StatTiles } from "@/components/naringsliv-stats";
import { countyRows, industryRows } from "@/lib/naringsliv";
import { loadStats } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/statistik" },
  title: "Sveriges näringsliv i siffror — VisaLight",
  description: "Antal företag i Sverige, nya företag per månad, fördelning per bransch och län, och de branscher som växer mest.",
};

export default function StatistikPage() {
  const stats = loadStats();
  const stamp = registerStamp();
  const example = stats.source === "example";
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <p className="text-sm font-semibold tracking-[0.18em] text-magenta uppercase">Statistik</p>
      <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
        Sveriges näringsliv <span className="aurora-text">i siffror</span>
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Talen räknas fram ur registret vid varje uppdatering. Klicka på en bransch eller ett län för att bygga ett utdrag på just de bolagen.
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>
          Registret senast uppdaterat: {stamp.when}
          {stamp.example ? " (exempeldata)" : ""}
        </span>
        <ExampleBadge show={example} />
      </p>
      {example ? (
        <p className="mt-2 text-sm font-semibold text-gold-ink">Registret är inte inkopplat i den här körningen. Alla tal på sidan är exempeldata, inte riktiga siffror.</p>
      ) : null}
      <div className="mt-8">
        <StatTiles stats={stats} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <MonthlyChart stats={stats} />
        <Growing stats={stats} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <BarList title="Företag per bransch (SNI)" rows={industryRows(stats.byIndustry)} kind="sni" />
        <BarList title="Företag per län" rows={countyRows(stats.byCounty)} tone="magenta" kind="county" />
      </div>
      <div className="builder-card mt-10 flex flex-col items-start gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-2xl font-bold">Hittat en bransch som växer? Se vad ett utdrag kostar.</p>
        <Link href="/#urval" className="btn-neon inline-flex h-12 shrink-0 items-center rounded-full px-6 font-bold">
          Öppna listbyggaren
        </Link>
      </div>
    </main>
  );
}
