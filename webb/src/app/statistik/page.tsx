import type { Metadata } from "next";
import Link from "next/link";
import { BarList, Growing, MonthlyChart, StatTiles } from "@/components/naringsliv-stats";
import { countyRows, industryRows } from "@/lib/naringsliv";
import { loadStats } from "@/lib/register-stats";
import { EXAMPLE_FIGURES_LINE, registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const example = registerStamp().example || loadStats().source === "example";
  return {
    alternates: { canonical: "/statistik" },
    title: "Sveriges näringsliv i siffror — VisaLight",
    description: example
      ? `${EXAMPLE_FIGURES_LINE} Antal företag i Sverige, nya företag per månad, fördelning per bransch och län.`
      : "Antal företag i Sverige, nya företag per månad, fördelning per bransch och län, och de branscher som växer mest.",
  };
}

export default function StatistikPage() {
  const stats = loadStats();
  const example = stats.source === "example" || registerStamp().example;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <p className="text-xs font-semibold tracking-[0.14em] text-magenta uppercase">Statistik</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
        Sveriges näringsliv <span className="aurora-text">i siffror</span>
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
        Talen är aktiva företag som inte spärrat reklam{example ? "" : ", och de följer den senaste uppdateringen"}. Vilande, inaktiva, avregistrerade och reklamspärrade räknas inte. Klicka på en bransch eller ett län för att bygga ett utdrag på just de bolagen.
      </p>
      <p className="mt-3 text-sm text-muted">
        {example ? `${EXAMPLE_FIGURES_LINE} Datumet ${registerStamp().when} är ett exempel.` : "Siffran följer den senaste uppdateringen."}
      </p>
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
