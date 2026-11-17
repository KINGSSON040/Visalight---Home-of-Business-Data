import type { Metadata } from "next";
import Link from "next/link";
import { ExampleBadge, StatsShowcase } from "@/components/pop-stats";
import { registerOverview } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/statistik" },
  title: "Sveriges näringsliv i siffror — VisaLight",
  description: "Antal företag i Sverige, nya företag senaste månaden, fördelning per bransch och län och de branscher som växer mest.",
};

export default function StatistikPage() {
  const overview = registerOverview();
  const stamp = registerStamp();
  return (
    <main className="pop-dots">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="sticker-sm tilt-l inline-flex bg-[var(--pop-lime)] px-3 py-1 text-xs font-extrabold tracking-[0.14em] uppercase">Statistik</p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] uppercase sm:text-7xl">
          Sveriges näringsliv <span className="text-[var(--pop-magenta)]">i siffror</span>
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-base font-bold">
            Registret senast uppdaterat: {stamp.when}
            {stamp.example ? " (exempeldata)" : ""}
          </p>
          <ExampleBadge real={overview.real} />
        </div>
        {!overview.real ? (
          <p className="mt-2 max-w-2xl text-sm font-semibold text-muted">
            Registret är inte inkopplat i den här körningen. Talen är exempeldata och inte verkliga siffror.
          </p>
        ) : null}
        <div className="mt-10">
          <StatsShowcase overview={overview} full />
        </div>
        <section className="sticker mt-12 flex flex-col items-start gap-4 bg-[var(--pop-ink)] p-6 text-white sm:p-8">
          <h2 className="text-3xl uppercase sm:text-5xl">
            Gör siffrorna till <span className="text-[var(--pop-lime)]">kunder</span>
          </h2>
          <p className="max-w-xl text-lg font-semibold">Välj bransch och ort i listbyggaren. Antalet och priset syns direkt, utan prenumeration.</p>
          <Link href="/#urval" className="pop-btn pop-btn--sun h-14 px-6 text-lg">
            Öppna listbyggaren <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
